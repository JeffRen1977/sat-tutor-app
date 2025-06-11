// backend/config/firebase.js
const admin = require('firebase-admin');

// IMPORTANT: Ensure 'firebase-service-account.json' is in the backend directory.
// This file should NEVER be committed to version control.
try {
    const serviceAccount = require('../sat-tutor-app-f4de0-firebase-adminsdk.json'); // Path relative to this config file
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });
    console.log("Firebase Admin SDK initialized successfully.");
} catch (error) {
    console.error("Failed to load Firebase service account key. Ensure 'firebase-service-account.json' is in the backend directory and readable.", error.message);
    process.exit(1); // Exit if Firebase cannot be initialized
}

const db = admin.firestore();

module.exports = { db, admin }; // Export db and admin (for FieldValue.serverTimestamp)

