// backend/routes/questionRoutes.js
const express = require('express');
const router = express.Router();
const authenticateToken = require('../middleware/authMiddleware'); // Import auth middleware
const { addSatQuestion, fetchSatQuestions } = require('../services/questionService'); // Import question service functions

router.use(authenticateToken); // All question routes are protected

// Endpoint to add a new SAT question to Firestore.
router.post('/add', async (req, res) => {
    const { subject, type, questionText, options, correctAnswer, explanation, difficulty, isMultipleChoice } = req.body;

    if (!subject || !type || !questionText || !correctAnswer || !explanation || !difficulty) {
        return res.status(400).json({ message: 'Missing required question fields.' });
    }

    try {
        const result = await addSatQuestion(
            { subject, type, questionText, options, correctAnswer, explanation, difficulty, isMultipleChoice },
            req.user.email // Pass the email of the authenticated user
        );
        res.status(201).json(result);
    } catch (error) {
        console.error('Error in /api/questions/add route:', error);
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

module.exports = router;
