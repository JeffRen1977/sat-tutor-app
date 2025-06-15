// backend/routes/passageRoutes.js
const express = require('express');
const router = express.Router();
const authenticateToken = require('../middleware/authMiddleware');
const { addSatPassage, generatePassageForReview, approvePassageAndCreateQuestions, fetchSatPassages } = require('../services/passageService'); 
const { isUserAdmin } = require('../services/authService');

router.use(authenticateToken);

/**
 * Endpoint: Adds a new SAT passage to Firestore directly.
 * Requires admin authentication.
 * Body: { title, text, genre, wordCount }
 */
router.post('/add', async (req, res) => {
    const { title, text, genre, wordCount } = req.body;
    const userEmail = req.user.email; // Email from authenticated JWT

    if (!title || !text || !genre || !wordCount) {
        return res.status(400).json({ message: 'Missing required passage fields (title, text, genre, wordCount).' });
    }

    try {
        const result = await addSatPassage(
            { title, text, genre, wordCount },
            userEmail
        );
        res.status(201).json(result);
    } catch (error) {
        console.error('Error in /api/passages/add route:', error);
        if (error.message.includes('Only administrators can add')) {
            return res.status(403).json({ message: error.message });
        }
        res.status(500).json({ message: 'Failed to add passage.', details: error.message });
    }
});

/**
 * Endpoint: Generate an SAT passage using AI FOR REVIEW.
 */
router.post('/generate', async (req, res) => {
    // --- DEBUG MESSAGE ---
    console.log("--- Received request at POST /api/passages/generate ---");
    console.log("Request Body:", req.body);

    const { genre, wordCount, topic } = req.body;
    const userEmail = req.user.email;

    if (!genre || !wordCount) {
        // --- DEBUG MESSAGE ---
        console.error("Validation Error: Genre or wordCount missing.");
        return res.status(400).json({ message: 'Genre and wordCount are required for passage generation.' });
    }

    try {
        // --- DEBUG MESSAGE ---
        console.log(`Calling generatePassageForReview service for user: ${userEmail}`);
        const result = await generatePassageForReview(genre, wordCount, topic, userEmail);
        
        // --- DEBUG MESSAGE ---
        console.log("Service call successful. Sending response to client.");
        console.log("Generated Passage Title:", result?.passageData?.title);

        res.status(200).json(result);
        
    } catch (error) {
        // --- DEBUG MESSAGE ---
        console.error('--- ERROR in /api/passages/generate route ---');
        console.error(error); // Log the full error object

        if (error.message.includes('Only administrators can')) {
            return res.status(403).json({ message: error.message });
        }
        res.status(500).json({ message: 'Failed to generate passage.', details: error.message });
    }
});

/**
 * Endpoint: Approve a passage, save it, generate questions, and save them.
 */
router.post('/approve-and-generate-questions', async (req, res) => {
    const passageData = req.body;
    const userEmail = req.user.email;

    if (!passageData || !passageData.title || !passageData.text) {
        return res.status(400).json({ message: 'Full passage data is required for approval.' });
    }
    
    try {
        const result = await approvePassageAndCreateQuestions(passageData, userEmail);
        res.status(201).json(result);
    } catch (error) {
        console.error('Error in /approve-and-generate-questions route:', error);
        if (error.message.includes('Only administrators can')) {
            return res.status(403).json({ message: error.message });
        }
        res.status(500).json({ message: 'Failed to approve passage and generate questions.', details: error.message });
    }
});

/**
 * Endpoint: Fetch SAT passages from the database.
 */
router.get('/fetch', async (req, res) => {
    const { genre, count, passageId } = req.query;

    try {
        const result = await fetchSatPassages(genre, count, passageId);
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