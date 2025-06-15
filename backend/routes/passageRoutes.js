// backend/routes/questionRoutes.js
const express = require('express');
const router = express.Router();
const authenticateToken = require('../middleware/authMiddleware'); // Import auth middleware
const { addSatQuestion, fetchSatQuestions } = require('../services/questionService'); // Import question service functions
const { generateAndFormatSatQuestions } = require('../services/geminiService'); // Import AI generation
const { isUserAdmin } = require('../services/authService'); // Import admin check

router.use(authenticateToken); // All question routes are protected

// Endpoint to add a single new SAT question to Firestore.
router.post('/add', async (req, res) => {
    const questionData = req.body;
    const userEmail = req.user.email;

    try {
        const result = await addSatQuestion(questionData, userEmail);
        res.status(201).json(result);
    } catch (error) {
        console.error('Error in /api/questions/add route:', error);
        if (error.message.includes('Only administrators can add')) {
            return res.status(403).json({ message: error.message });
        }
        res.status(500).json({ message: 'Failed to add question.', details: error.message });
    }
});

// NEW Endpoint: Add a batch of questions after admin approval.
router.post('/add-batch', async (req, res) => {
    const { questions } = req.body;
    const userEmail = req.user.email;

    if (!Array.isArray(questions) || questions.length === 0) {
        return res.status(400).json({ message: 'A non-empty array of questions is required.' });
    }

    try {
        const isAdmin = await isUserAdmin(userEmail);
        if (!isAdmin) {
            return res.status(403).json({ message: 'Only administrators can add questions.' });
        }
        
        const addPromises = questions.map(q => addSatQuestion(q, userEmail));
        const results = await Promise.allSettled(addPromises);
        
        const successfulAdds = results.filter(r => r.status === 'fulfilled').length;
        const failedAdds = results.length - successfulAdds;

        res.status(201).json({ 
            message: `Batch complete. Successfully saved ${successfulAdds} questions.`,
            successful: successfulAdds,
            failed: failedAdds
        });

    } catch (error) {
        console.error('Error in /api/questions/add-batch route:', error);
        res.status(500).json({ message: 'Failed to add question batch.', details: error.message });
    }
});

// Endpoint to fetch SAT questions from Firestore.
router.get('/fetch', async (req, res) => {
    const { subject, count = '1', difficulty, type, passageId } = req.query;

    if (!subject) {
        return res.status(400).json({ message: 'Subject is required to fetch questions.' });
    }

    try {
        const result = await fetchSatQuestions(subject, count, difficulty, type, passageId);
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
 * UPDATED Endpoint: Generate SAT questions using AI for REVIEW.
 * This does NOT save them to the database.
 * Body: { subject, count, difficulty, type (optional) }
 */
router.post('/generate', async (req, res) => {
    const { subject, count, difficulty, type, passageId } = req.body;
    const userEmail = req.user.email;

    if (!subject || !count || !difficulty) {
        return res.status(400).json({ message: 'Subject, count, and difficulty are required for generation.' });
    }
    
    try {
        const isAdmin = await isUserAdmin(userEmail);
        if (!isAdmin) {
            return res.status(403).json({ message: 'Only administrators can generate questions.' });
        }

        // We only generate the questions and return them for review.
        const generatedQuestions = await generateAndFormatSatQuestions(subject, count, difficulty, type, null, passageId);

        if (!generatedQuestions || generatedQuestions.length === 0) {
            return res.status(404).json({ message: 'AI failed to generate questions, or generated an empty list.' });
        }
        
        // Return the generated questions for the admin to review on the frontend.
        res.status(200).json({
            message: `Generated ${generatedQuestions.length} questions for review.`,
            questionsForReview: generatedQuestions
        });

    } catch (error) {
        console.error('Error in /api/questions/generate route:', error);
        res.status(500).json({ message: 'Failed to generate questions.', details: error.message });
    }
});


module.exports = router;