// =====================================================================
// --- File: backend/services/authService.js ---
// =====================================================================
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const JWT_SECRET = require('../config/jwt'); // Import the secret
const { db, admin } = require('../config/firebase'); // Import db and admin for Firestore and timestamps

// Define admin emails (for demonstration purposes only)
// In a real app, this would be managed via user roles in Firestore or a separate config.
const ADMIN_EMAILS = process.env.ADMIN_EMAILS ? process.env.ADMIN_EMAILS.split(',') : ['admin@example.com'];

const registerUser = async (email, password) => {
    const userRef = db.collection('users').doc(email);
    const doc = await userRef.get();

    if (doc.exists) {
        throw new Error('User with this email already exists.');
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    await userRef.set({
        email: email,
        passwordHash: hashedPassword,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        // Assign a default role, or check if it's an admin email
        role: ADMIN_EMAILS.includes(email) ? 'admin' : 'student'
    });

    return { message: 'User registered successfully.' };
};

const loginUser = async (email, password) => {
    const userRef = db.collection('users').doc(email);
    const doc = await userRef.get();

    if (!doc.exists) {
        throw new Error('Invalid credentials.');
    }

    const user = doc.data();

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
        throw new Error('Invalid credentials.');
    }

    // Include role in the JWT payload
    const token = jwt.sign({ email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '1h' });

    return { message: 'Logged in successfully.', token, email: user.email, role: user.role };
};

// New function to check if a user is an admin
const isUserAdmin = async (email) => {
    const userRef = db.collection('users').doc(email);
    const doc = await userRef.get();
    if (doc.exists && doc.data().role === 'admin') {
        return true;
    }
    return false;
};


module.exports = { registerUser, loginUser, isUserAdmin };

