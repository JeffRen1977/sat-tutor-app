// backend/services/passageService.js
const { db, admin } = require('../config/firebase');
const { generateSatPassage } = require('./geminiService'); // Import AI passage generation
const { isUserAdmin } = require('./authService'); // For admin check

/**
 * Adds a generated SAT passage to Firestore.
 * @param {object} passageData - Object containing passage details (title, text, genre, wordCount).
 * @param {string} createdByEmail - Email of the admin user adding the passage.
 * @returns {object} Message, new passage ID, and the full passage data.
 */
const addSatPassage = async (passageData, createdByEmail) => {
    const isAdmin = await isUserAdmin(createdByEmail);
    if (!isAdmin) {
        throw new Error('Only administrators can add SAT passages.');
    }

    const dataToSave = {
        title: passageData.title,
        text: passageData.text,
        genre: passageData.genre.toLowerCase(),
        wordCount: passageData.wordCount,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        createdBy: createdByEmail
    };
    const docRef = await db.collection('sat_passages').add(dataToSave);
    return { message: 'Passage added successfully.', passageId: docRef.id, passageData: { id: docRef.id, ...dataToSave } }; // Return full data
};

/**
 * Generates an SAT passage using AI and saves it to Firestore.
 * @param {string} genre - The genre of the passage.
 * @param {number} wordCount - The approximate word count.
 * @param {string} topic - Optional topic.
 * @param {string} adminEmail - Email of the admin user requesting generation.
 * @returns {object} Message, new passage ID, and the full generated passage data.
 */
const generateAndSaveSatPassage = async (genre, wordCount, topic, adminEmail) => {
    const isAdmin = await isUserAdmin(adminEmail);
    if (!isAdmin) {
        throw new Error('Only administrators can generate and save SAT passages.');
    }

    const generatedPassage = await generateSatPassage(genre, wordCount, topic);
    const result = await addSatPassage(generatedPassage, adminEmail); // Save the generated passage
    return result; // result now includes passageData
};

/**
 * Fetches SAT passages from Firestore.
 * @param {string} [genre] - Optional filter by genre.
 * @param {string} [passageId] - Optional filter by specific passage ID.
 * @param {number} [count=1] - Number of passages to fetch.
 * @returns {Array} Array of passages.
 */
const fetchSatPassages = async (genre = null, count = 1, passageId = null) => {
    let query = db.collection('sat_passages');

    if (passageId) { // Fetch by specific ID if provided
        const doc = await query.doc(passageId).get();
        if (doc.exists) {
            return { passages: [{ id: doc.id, ...doc.data() }] };
        } else {
            return { passages: [] };
        }
    }

    // Otherwise, apply filters and limit
    if (genre) {
        query = query.where('genre', '==', genre.toLowerCase());
    }

    const limitCount = parseInt(count);
    if (!isNaN(limitCount) && limitCount > 0) {
        query = query.limit(limitCount);
    } else {
        query = query.limit(1); // Default to 1 passage if count is invalid
    }

    const snapshot = await query.get();
    if (snapshot.empty) {
        return { passages: [] };
    }

    const passages = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
    }));

    return { passages };
};


module.exports = {
    addSatPassage,
    generateAndSaveSatPassage,
    fetchSatPassages
};
