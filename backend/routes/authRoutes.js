// =====================================================================
// --- File: backend/routes/authRoutes.js ---
// =====================================================================
const express = require('express');
const router = express.Router();
const { registerUser, loginUser } = require('../services/authService'); // Import auth service functions

// Register User
router.post('/register', async (req, res) => {
    const { email, password } = req.body;
    try {
        const result = await registerUser(email, password);
        res.status(201).json(result);
    } catch (error) {
        console.error('Error in /api/register route:', error.message);
        if (error.message.includes('exists')) {
            return res.status(409).json({ message: error.message });
        }
        res.status(500).json({ message: 'Server error during registration.', details: error.message });
    }
});

// Login User
router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const result = await loginUser(email, password);
        res.json(result); // result includes token and message
    } catch (error) {
        console.error('Error in /api/login route:', error.message);
        if (error.message.includes('credentials')) {
            return res.status(400).json({ message: error.message });
        }
        res.status(500).json({ message: 'Server error during login.', details: error.message });
    }
});

module.exports = router;


