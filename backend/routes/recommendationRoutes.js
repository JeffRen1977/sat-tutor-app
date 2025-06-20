// backend/routes/recommendationRoutes.js
const express = require('express');
const router = express.Router();
const authenticateToken = require('../middleware/authMiddleware');
const { generateStudyPlan } = require('../services/recommendationService');

router.use(authenticateToken);

/**
 * Endpoint to generate a personalized study plan for the authenticated user.
 */
router.post('/generate', async (req, res) => {
    const userId = req.user.email;
    try {
        const studyPlan = await generateStudyPlan(userId);
        res.status(200).json(studyPlan);
    } catch (error) {
        console.error('Error in /api/recommendations/generate route:', error);
        res.status(500).json({ message: error.message || 'Failed to generate study plan.' });
    }
});

module.exports = router;
