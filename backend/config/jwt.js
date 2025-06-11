// =====================================================================
// --- File: backend/config/jwt.js ---
// =====================================================================
require('dotenv').config(); // Load environment variables

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
    console.error("JWT_SECRET is not set in environment variables. Please add it to your .env file.");
    process.exit(1); // Exit if secret is missing
}

module.exports = JWT_SECRET;
