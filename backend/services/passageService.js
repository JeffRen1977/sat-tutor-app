// backend/services/passageService.js
const { db, admin } = require('../config/firebase');
const { generateSatPassage, generateAndFormatSatQuestions } = require('./geminiService'); // Import AI services
const { addSatQuestion } = require('./questionService'); // Import question service to save questions
const { isUserAdmin } = require('./authService'); // For admin check

/**
 * Adds a SAT passage to Firestore.
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
    return { message: 'Passage added successfully.', passageId: docRef.id, passageData: { id: docRef.id, ...dataToSave } };
};

/**
 * Generates an SAT passage using AI for an admin to review.
 * This function *does not* save the passage to the database.
 * @param {string} genre - The genre of the passage.
 * @param {number} wordCount - The approximate word count.
 * @param {string} topic - Optional topic.
 * @param {string} adminEmail - Email of the admin user requesting generation.
 * @returns {object} The generated passage data, ready for review.
 */
const generatePassageForReview = async (genre, wordCount, topic, adminEmail) => {
    const isAdmin = await isUserAdmin(adminEmail);
    if (!isAdmin) {
        throw new Error('Only administrators can generate SAT passages.');
    }
    const generatedPassage = await generateSatPassage(genre, wordCount, topic);
    return { message: 'Passage generated successfully for review.', passageData: generatedPassage };
};

/**
 * NEW: Saves an approved passage, then generates and saves 3 related questions.
 * @param {object} passageData - The full passage data to be saved.
 * @param {string} adminEmail - Email of the admin performing the action.
 * @returns {object} A success message with details.
 */
const approvePassageAndCreateQuestions = async (passageData, adminEmail) => {
    // 1. Save the approved passage to get its ID
    const savedPassageResult = await addSatPassage(passageData, adminEmail);
    const newPassageId = savedPassageResult.passageId;
    
    if (!newPassageId) {
        throw new Error("Failed to save the passage, cannot generate questions.");
    }

    // 2. Generate 3 "medium" difficulty questions based on the passage text
    const generatedQuestions = await generateAndFormatSatQuestions(
        'reading', // subject
        3,         // count
        'medium',  // difficulty
        'passage_question', // type
        passageData.text,   // passageText for context
        newPassageId        // link questions to the new passageId
    );
    
    if (!generatedQuestions || generatedQuestions.length === 0) {
        throw new Error("AI failed to generate questions for the approved passage.");
    }
    
    // 3. Save each generated question to the database
    const questionPromises = generatedQuestions.map(q => addSatQuestion(q, adminEmail));
    await Promise.all(questionPromises);
    
    return {
        message: `Successfully saved passage and generated ${generatedQuestions.length} related questions.`,
        passageId: newPassageId,
        questionsGenerated: generatedQuestions.length
    };
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

    if (passageId) {
        const doc = await query.doc(passageId).get();
        if (doc.exists) {
            return { passages: [{ id: doc.id, ...doc.data() }] };
        } else {
            return { passages: [] };
        }
    }

    if (genre) {
        query = query.where('genre', '==', genre.toLowerCase());
    }

    const limitCount = parseInt(count);
    query = query.limit(isNaN(limitCount) || limitCount <= 0 ? 1 : limitCount);

    const snapshot = await query.get();
    const passages = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    return { passages };
};


module.exports = {
    addSatPassage,
    generatePassageForReview,
    approvePassageAndCreateQuestions, // Export the new workflow function
    fetchSatPassages
};
