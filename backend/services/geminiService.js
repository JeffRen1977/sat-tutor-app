// backend/services/authService.js
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const JWT_SECRET = require('../config/jwt'); // Import the secret
const { db, admin } = require('../config/firebase'); // Import db and admin for Firestore and timestamps

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
        createdAt: admin.firestore.FieldValue.serverTimestamp()
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

    const token = jwt.sign({ email: user.email }, JWT_SECRET, { expiresIn: '1h' });

    return { message: 'Logged in successfully.', token, email: user.email }; // Return email for frontend convenience
};

module.exports = { registerUser, loginUser };
