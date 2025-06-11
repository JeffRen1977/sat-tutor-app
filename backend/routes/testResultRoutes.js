// =====================================================================
// --- File: backend/routes/testResultRoutes.js ---
// =====================================================================
const express = require('express');
const router = express.Router();
const authenticateToken = require('../middleware/authMiddleware');
const { saveUserTestResult, getUserTestResults } = require('../services/testResultService');

router.use(authenticateToken); // All test result routes are protected

// Endpoint to save a user's test result for a question
router.post('/save', async (req, res) => {
    const { questionId, isCorrect, userAnswer, selectedOption } = req.body;
    const userId = req.user.email; // Get user ID from JWT payload

    if (!questionId || typeof isCorrect !== 'boolean') {
        return res.status(400).json({ message: 'Missing questionId or isCorrect status.' });
    }

    try {
        const result = await saveUserTestResult(userId, questionId, isCorrect, userAnswer, selectedOption);
        res.status(201).json(result);
    } catch (error) {
        console.error('Error in /api/test_results/save route:', error);
        res.status(500).json({ message: 'Failed to save test result.', details: error.message });
    }
});

// Endpoint to fetch a user's test results
router.get('/fetch', async (req, res) => {
    const userId = req.user.email; // Get user ID from JWT payload
    const filters = req.query; // Query parameters can act as filters (e.g., ?isCorrect=true)

    try {
        const results = await getUserTestResults(userId, filters);
        res.json(results);
    } catch (error) {
        console.error('Error in /api/test_results/fetch route:', error);
        res.status(500).json({ message: 'Failed to fetch test results.', details: error.message });
    }
});

module.exports = router;



