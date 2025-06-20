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
    // --- DEBUG ---
    console.log(`[Recommendation Service] Starting study plan generation for user: ${userId}`);

    const history = await fetchUserHistory(userId);

    // --- DEBUG ---
    console.log(`[Recommendation Service] Found ${history.length} practice records for user.`);

    if (history.length < 5) { // Require a minimum amount of data for meaningful analysis
        console.warn(`[Recommendation Service] Not enough data for user ${userId}. Aborting.`);
        throw new Error('Not enough practice data to generate a study plan. Please complete more practice questions.');
    }

    // Process the history into a summary format for the AI
    const summary = history.reduce((acc, attempt) => {
        // Ensure questionData exists and has subject/type
        if (!attempt.questionData || !attempt.questionData.subject || !attempt.questionData.type) {
            console.warn("[Recommendation Service] Skipping record with missing question data:", attempt);
            return acc;
        }

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
    
    // --- DEBUG ---
    console.log("[Recommendation Service] Generated summary for AI prompt:");
    console.log(historySummaryForPrompt);
    console.log("----------------------------------------------------");

    try {
        console.log("[Recommendation Service] Calling Gemini service to get study plan...");
        const studyPlan = await getStudyPlan(historySummaryForPrompt);
        
        // --- DEBUG ---
        console.log("[Recommendation Service] Successfully received study plan from AI.");
        console.log("Strengths:", studyPlan.strengths);
        console.log("Weaknesses:", studyPlan.weaknesses);

        return studyPlan;
    } catch(error) {
        // --- DEBUG ---
        console.error("[Recommendation Service] Error calling getStudyPlan from Gemini service.");
        console.error(error);
        throw error; // Re-throw the error to be handled by the route
    }
};

module.exports = { generateStudyPlan };