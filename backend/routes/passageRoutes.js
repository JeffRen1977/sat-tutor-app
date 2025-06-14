// backend/routes/passageRoutes.js
const express = require('express');
const router = express.Router();
const authenticateToken = require('../middleware/authMiddleware');
const { generateAndSaveSatPassage, fetchSatPassages } = require('../services/passageService');
const { isUserAdmin } = require('../services/authService'); // Import admin check

router.use(authenticateToken); // All passage routes are protected

/**
 * Endpoint: Generate an SAT passage using AI and save it to the database.
 * Requires admin authentication.
 * Body: { genre, wordCount, topic (optional) }
 */
router.post('/generate', async (req, res) => {
    const { genre, wordCount, topic } = req.body;
    const userEmail = req.user.email; // Email from authenticated JWT

    if (!genre || !wordCount) {
        return res.status(400).json({ message: 'Genre and wordCount are required for passage generation.' });
    }

    try {
        const isAdmin = await isUserAdmin(userEmail);
        if (!isAdmin) {
            return res.status(403).json({ message: 'Only administrators can generate and save passages.' });
        }

        const result = await generateAndSaveSatPassage(genre, wordCount, topic, userEmail);
        res.status(201).json(result);
    } catch (error) {
        console.error('Error in /api/passages/generate route:', error);
        res.status(500).json({ message: 'Failed to generate or save passage.', details: error.message });
    }
});

/**
 * Endpoint: Fetch SAT passages from the database.
 * Requires authentication.
 * Query: { genre (optional), count (optional, default 1) }
 */
router.get('/fetch', async (req, res) => {
    const { genre, count } = req.query;

    try {
        const result = await fetchSatPassages(genre, count);
        if (result.passages.length === 0) {
            return res.status(404).json({ message: 'No passages found matching the criteria.' });
        }
        res.json(result);
    } catch (error) {
        console.error('Error in /api/passages/fetch route:', error);
        res.status(500).json({ message: 'Failed to fetch passages.', details: error.message });
    }
});

module.exports = router;
