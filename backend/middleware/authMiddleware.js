// =====================================================================
// --- File: backend/middleware/authMiddleware.js ---
// =====================================================================
const jwt = require('jsonwebtoken');
const JWT_SECRET = require('../config/jwt'); // Import the secret

const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (token == null) {
        console.warn("Authentication: No token provided.");
        return res.sendStatus(401); // Unauthorized
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            console.error("JWT verification error:", err.message);
            return res.sendStatus(403); // Forbidden (invalid token)
        }
        req.user = user; // Store user payload from token in request
        next();
    });
};

module.exports = authenticateToken;
