// backend/services/recommendationService.js
const { db } = require('../config/firebase');
const { getStudyPlan } = require('./geminiService');

/**
 * Fetches the last 50 practice attempts for a user.
 * @param {string} userId - The user's email.
 * @returns {Promise<Array>} A promise that resolves to an array of practice history documents.
 */
const fetchUserHistory = async (userId) => {
    const historyRef = db.collection('user_practice_history');
    const snapshot = await historyRef.where('userId', '==', userId).orderBy('timestamp', 'desc').limit(50).get();

    if (snapshot.empty) {
        return [];
    }
    return snapshot.docs.map(doc => doc.data());
};

/**
 * Analyzes user history and generates a personalized study plan.
 * @param {string} userId - The user's email.
 * @returns {Promise<object>} A promise that resolves to the study plan object.
 */
const generateStudyPlan = async (userId) => {
    const history = await fetchUserHistory(userId);

    if (history.length < 5) { // Require a minimum amount of data for meaningful analysis
        throw new Error('Not enough practice data to generate a study plan. Please complete more practice questions.');
    }

    // Process the history into a summary format for the AI
    const summary = history.reduce((acc, attempt) => {
        const subject = attempt.questionData.subject;
        const type = attempt.questionData.type;
        const key = `${subject} - ${type}`;
        
        if (!acc[key]) {
            acc[key] = { correct: 0, incorrect: 0, total: 0 };
        }

        acc[key].total++;
        if (attempt.isCorrect) {
            acc[key].correct++;
        } else {
            acc[key].incorrect++;
        }
        return acc;
    }, {});
    
    // Convert summary to a string for the prompt
    const historySummaryForPrompt = Object.entries(summary).map(([key, value]) => {
        const accuracy = value.total > 0 ? ((value.correct / value.total) * 100).toFixed(0) : 0;
        return `${key}: ${accuracy}% accuracy (${value.correct}/${value.total} correct)`;
    }).join('\n');
    
    const studyPlan = await getStudyPlan(historySummaryForPrompt);
    return studyPlan;
};

module.exports = { generateStudyPlan };