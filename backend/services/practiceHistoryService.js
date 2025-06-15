// backend/services/practiceHistoryService.js
const { db, admin } = require('../config/firebase');

/**
 * Saves a complete record of a user's practice question attempt.
 * This includes the full question data, the user's answer, and performance.
 * @param {string} userId - The email of the authenticated user.
 * @param {object} attemptData - The data for the practice attempt.
 * @returns {object} A success message and the ID of the new history document.
 */
const savePracticeAttempt = async (userId, attemptData) => {
    const { questionData, isCorrect, userAnswer, selectedOption } = attemptData;

    if (!userId || !questionData || !questionData.id) {
        throw new Error('User ID and full question data are required to save a practice attempt.');
    }

    const historyRecord = {
        userId: userId,
        isCorrect: isCorrect,
        userAnswer: userAnswer || null,
        selectedOption: selectedOption || null,
        questionData: questionData, // Storing the entire question object
        timestamp: admin.firestore.FieldValue.serverTimestamp()
    };

    const docRef = await db.collection('user_practice_history').add(historyRecord);

    return { message: 'Practice attempt saved successfully.', historyId: docRef.id };
};

module.exports = {
    savePracticeAttempt
};
