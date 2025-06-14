// backend/services/testResultService.js
const { db, admin } = require('../config/firebase');

/**
 * Saves a user's test result for a specific question.
 * Stores in `users/{userId}/test_results` collection.
 * @param {string} userId - The email of the authenticated user.
 * @param {string} questionId - The ID of the SAT question.
 * @param {boolean} isCorrect - Whether the user answered correctly.
 * @param {string} userAnswer - The user's answer (optional).
 * @param {string} selectedOption - The selected option (for MCQs, optional).
 * @returns {object} Result message and ID.
 */
const saveUserTestResult = async (userId, questionId, isCorrect, userAnswer = null, selectedOption = null) => {
    if (!userId || !questionId || typeof isCorrect !== 'boolean') {
        throw new Error('User ID, Question ID, and isCorrect status are required.');
    }

    const resultData = {
        questionId: questionId,
        isCorrect: isCorrect,
        userAnswer: userAnswer,
        selectedOption: selectedOption,
        timestamp: admin.firestore.FieldValue.serverTimestamp()
    };

    // Store in a subcollection under the user's document
    const docRef = await db.collection('users').doc(userId).collection('test_results').add(resultData);
    return { message: 'Test result saved successfully.', resultId: docRef.id };
};

/**
 * Fetches a user's test results.
 * @param {string} userId - The email of the authenticated user.
 * @param {object} filters - Optional filters (e.g., { isCorrect: true }).
 * @returns {object} Array of test results.
 */
const getUserTestResults = async (userId, filters = {}) => {
    let query = db.collection('users').doc(userId).collection('test_results');

    // Apply filters if provided
    if (typeof filters.isCorrect === 'boolean') {
        query = query.where('isCorrect', '==', filters.isCorrect);
    }
    // Add more filters as needed (e.g., by timestamp range, question type)

    const snapshot = await query.orderBy('timestamp', 'desc').get(); // Order by most recent
    const results = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
    }));

    return { results };
};

module.exports = { saveUserTestResult, getUserTestResults }

