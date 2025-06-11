// =====================================================================
// --- File: backend/routes/aiRoutes.js ---
// =====================================================================
const express = require('express');
const router = express.Router();
const authenticateToken = require('../middleware/authMiddleware'); // Import auth middleware
const { getChatResponse, getVocabularyExplanation, getEssayBrainstorming, solveMathProblem } = require('../services/geminiService'); // Import Gemini service functions

// All AI routes are protected
router.use(authenticateToken);

// Endpoint for AI Tutoring Chat
router.post('/chat', async (req, res) => {
    const { chatHistory } = req.body;
    if (!chatHistory || !Array.isArray(chatHistory)) {
        return res.status(400).json({ error: "Invalid chat history provided." });
    }
    try {
        const text = await getChatResponse(chatHistory);
        res.json({ text });
    } catch (error) {
        console.error("Error in /api/chat route:", error);
        res.status(500).json({ error: "Failed to get AI response.", details: error.message });
    }
});

// Endpoint for Vocabulary Expander
router.post('/vocabulary', async (req, res) => {
    const { word } = req.body;
    if (!word) {
        return res.status(400).json({ error: "No word provided for vocabulary explanation." });
    }
    try {
        const explanation = await getVocabularyExplanation(word);
        res.json({ explanation });
    } catch (error) {
        console.error("Error in /api/vocabulary route:", error);
        res.status(500).json({ error: "Failed to get vocabulary explanation.", details: error.message });
    }
});

// Endpoint for Essay Brainstormer
router.post('/essay-brainstorm', async (req, res) => {
    const { topic } = req.body;
    if (!topic) {
        return res.status(400).json({ error: "No essay topic provided for brainstorming." });
    }
    try {
        const brainstormingIdeas = await getEssayBrainstorming(topic);
        res.json({ brainstormingIdeas });
    } catch (error) {
        console.error("Error in /api/essay-brainstorm route:", error);
        res.status(500).json({ error: "Failed to generate essay brainstorming ideas.", details: error.message });
    }
});

// Endpoint for Math Problem Solver
router.post('/math-solver', async (req, res) => {
    const { problem } = req.body;
    if (!problem) {
        return res.status(400).json({ error: "No math problem provided for solving." });
    }
    try {
        const solution = await solveMathProblem(problem);
        res.json({ solution });
    } catch (error) {
        console.error("Error in /api/math-solver route:", error);
        res.status(500).json({ error: "Failed to solve math problem.", details: error.message });
    }
});

module.exports = router;
