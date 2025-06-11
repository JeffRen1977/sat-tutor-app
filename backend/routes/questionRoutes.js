// =====================================================================
// --- File: backend/routes/questionRoutes.js ---
// =====================================================================
const express = require('express');
const router = express.Router();
const authenticateToken = require('../middleware/authMiddleware'); // Import auth middleware
const { addSatQuestion, fetchSatQuestions } = require('../services/questionService'); // Import question service functions
const { generateAndFormatSatQuestions } = require('../services/geminiService'); // CORRECTED: Proper relative path
const { isUserAdmin } = require('../services/authService'); // Import admin check from authService


router.use(authenticateToken); // All question routes are protected

// Endpoint to add a new SAT question to Firestore.
// Only accessible by admins (logic inside addSatQuestion service)
router.post('/add', async (req, res) => {
    const { subject, type, questionText, options, correctAnswer, explanation, difficulty, isMultipleChoice } = req.body;

    // Basic validation
    if (!subject || !type || !questionText || !correctAnswer || !explanation || !difficulty) {
        return res.status(400).json({ message: 'Missing required question fields.' });
    }

    try {
        const result = await addSatQuestion(
            { subject, type, questionText, options, correctAnswer, explanation, difficulty, isMultipleChoice },
            req.user.email // Pass the email of the authenticated user from JWT
        );
        res.status(201).json(result);
    } catch (error) {
        console.error('Error in /api/questions/add route:', error);
        if (error.message.includes('Only administrators can add')) {
            return res.status(403).json({ message: error.message }); // Forbidden
        }
        res.status(500).json({ message: 'Failed to add question.', details: error.message });
    }
});

// Endpoint to fetch SAT questions from Firestore.
router.get('/fetch', async (req, res) => {
    const { subject, count = '1', difficulty, type } = req.query;

    if (!subject) {
        return res.status(400).json({ message: 'Subject is required to fetch questions.' });
    }

    try {
        const result = await fetchSatQuestions(subject, count, difficulty, type);
        if (result.questions.length === 0) {
            return res.status(404).json({ message: 'No questions found matching the criteria.' });
        }
        res.json(result);
    } catch (error) {
        console.error('Error in /api/questions/fetch route:', error);
        res.status(500).json({ message: 'Failed to fetch questions.', details: error.message });
    }
});

/**
 * New Endpoint: Generate SAT questions using AI and add them to the database.
 * Requires admin authentication.
 * Body: { subject, count, difficulty, type (optional) }
 */
router.post('/generate', async (req, res) => {
    const { subject, count, difficulty, type } = req.body;
    const userEmail = req.user.email; // Email from authenticated JWT

    if (!subject || !count || !difficulty) {
        return res.status(400).json({ message: 'Subject, count, and difficulty are required for generation.' });
    }

    try {
        // Enforce admin access for question generation
        const isAdmin = await isUserAdmin(userEmail);
        if (!isAdmin) {
            return res.status(403).json({ message: 'Only administrators can generate and add questions.' });
        }

        const generatedQuestions = await generateAndFormatSatQuestions(subject, count, difficulty, type);

        if (!generatedQuestions || generatedQuestions.length === 0) {
            return res.status(404).json({ message: 'AI failed to generate questions, or generated an empty list.' });
        }

        const addPromises = generatedQuestions.map(q => addSatQuestion(q, userEmail));
        const addResults = await Promise.allSettled(addPromises); // Wait for all saves to complete

        const successfulAdds = addResults.filter(p => p.status === 'fulfilled').map(p => p.value);
        const failedAdds = addResults.filter(p => p.status === 'rejected');

        console.log(`Successfully added ${successfulAdds.length} questions.`);
        if (failedAdds.length > 0) {
            console.error(`Failed to add ${failedAdds.length} questions:`, failedAdds.map(p => p.reason));
        }

        res.status(200).json({
            message: `Generated and added ${successfulAdds.length} questions.`,
            successful: successfulAdds.length,
            failed: failedAdds.length,
            // Optionally, return the generated questions or their IDs
            generatedQuestions: successfulAdds.map(r => r.questionId || 'N/A')
        });

    } catch (error) {
        console.error('Error in /api/questions/generate route:', error);
        res.status(500).json({ message: 'Failed to generate or add questions.', details: error.message });
    }
});


module.exports = router;


