// backend/routes/practiceHistoryRoutes.js
const express = require('express');
const router = express.Router();
const authenticateToken = require('../middleware/authMiddleware');
const { savePracticeAttempt } = require('../services/practiceHistoryService');

router.use(authenticateToken); // Protect all routes in this file

/**
 * Endpoint to save a user's full practice attempt for a single question.
 */
router.post('/save', async (req, res) => {
    const userId = req.user.email; // Get user email from the authenticated token
    const attemptData = req.body;

    try {
        const result = await savePracticeAttempt(userId, attemptData);
        res.status(201).json(result);
    } catch (error) {
        console.error('Error in /api/practice-history/save route:', error);
        res.status(500).json({ message: 'Failed to save practice history.', details: error.message });
    }
});

module.exports = router;
