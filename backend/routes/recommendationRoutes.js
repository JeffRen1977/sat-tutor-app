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
    // --- DEBUG ---
    console.log("--- [Recommendation Route] Received request at POST /api/recommendations/generate ---");
    
    const userId = req.user.email;

    // --- DEBUG ---
    console.log(`[Recommendation Route] Authenticated user is: ${userId}`);

    try {
        console.log("[Recommendation Route] Calling generateStudyPlan service...");
        const studyPlan = await generateStudyPlan(userId);
        
        // --- DEBUG ---
        console.log("[Recommendation Route] Service call successful. Sending response to client.");
        res.status(200).json(studyPlan);

    } catch (error) {
        // --- DEBUG ---
        console.error('--- [Recommendation Route] ERROR ---');
        console.error(error); // Log the full error from the service

        res.status(500).json({ message: error.message || 'Failed to generate study plan.' });
    }
});

module.exports = router;

