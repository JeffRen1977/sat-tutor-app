// backend/routes/testRoutes.js
const express = require('express');
const router = express.Router();
const authenticateToken = require('../middleware/authMiddleware');
const { createTest } = require('../services/testService');

// All test generation routes are protected
router.use(authenticateToken);

/**
 * Endpoint: Generates a new SAT test on-demand.
 * Body: { type: 'full' | 'math' | 'reading' | 'writing' }
 */
router.post('/generate', async (req, res) => {
    const { type } = req.body;

    if (!['full', 'math', 'reading', 'writing'].includes(type)) {
        return res.status(400).json({ message: 'Invalid test type specified.' });
    }

    try {
        const testData = await createTest(type);
        res.status(200).json(testData);
    } catch (error) {
        console.error(`Error in /api/tests/generate route for type ${type}:`, error);
        res.status(500).json({ message: error.message, details: 'Failed to generate the test from the AI service.' });
    }
});

module.exports = router;

