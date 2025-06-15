// backend/routes/questionRoutes.js
const express = require('express');
const router = express.Router();
const authenticateToken = require('../middleware/authMiddleware');
const { addSatQuestion, fetchSatQuestions } = require('../services/questionService');
const { generateAndFormatSatQuestions } = require('../services/geminiService');
const { isUserAdmin } = require('../services/authService');

router.use(authenticateToken);

/**
 * Endpoint: Adds a single new SAT question to Firestore.
 */
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

/**
 * Endpoint: Adds a batch of questions after admin approval.
 */
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

/**
 * Endpoint: Fetches SAT questions from Firestore.
 */
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
 * Endpoint: Generate SAT questions using AI for REVIEW.
 */
router.post('/generate', async (req, res) => {
    // --- DEBUG MESSAGE ---
    console.log("--- Received request at POST /api/questions/generate ---");
    console.log("Request Body:", req.body);
    
    const { subject, count, difficulty, type, passageId = null } = req.body;
    const userEmail = req.user.email;

    if (!subject || !count || !difficulty) {
        // --- DEBUG MESSAGE ---
        console.error("Validation Error: Subject, count, or difficulty missing.");
        return res.status(400).json({ message: 'Subject, count, and difficulty are required for generation.' });
    }
    
    try {
        // --- DEBUG MESSAGE ---
        console.log(`Calling generateAndFormatSatQuestions service for user: ${userEmail}`);
        const generatedQuestions = await generateAndFormatSatQuestions(subject, count, difficulty, type, null, passageId);

        if (!generatedQuestions || generatedQuestions.length === 0) {
            // --- DEBUG MESSAGE ---
            console.warn("AI service returned no questions.");
            return res.status(404).json({ message: 'AI failed to generate questions, or generated an empty list.' });
        }
        
        // --- DEBUG MESSAGE ---
        console.log(`Service call successful. Returning ${generatedQuestions.length} questions for review.`);

        res.status(200).json({
            message: `Generated ${generatedQuestions.length} questions for review.`,
            questionsForReview: generatedQuestions
        });

    } catch (error) {
        // --- DEBUG MESSAGE ---
        console.error('--- ERROR in /api/questions/generate route ---');
        console.error(error); // Log the full error object

        res.status(500).json({ message: 'Failed to generate questions.', details: error.message });
    }
});


module.exports = router;