// backend/services/questionService.js
const { db, admin } = require('../config/firebase'); // Import db and admin for FieldValue.serverTimestamp
const { isUserAdmin } = require('./authService'); // Import the admin check function

const addSatQuestion = async (questionData, createdByEmail) => {
    // Check if the user adding the question is an admin
    const isAdmin = await isUserAdmin(createdByEmail);
    if (!isAdmin) {
        throw new Error('Only administrators can add SAT questions.');
    }

    const dataToSave = {
        subject: questionData.subject.toLowerCase(),
        type: questionData.type.toLowerCase(),
        questionText: questionData.questionText,
        options: questionData.options || null,
        correctAnswer: questionData.correctAnswer,
        explanation: questionData.explanation,
        difficulty: questionData.difficulty.toLowerCase(),
        isMultipleChoice: typeof questionData.isMultipleChoice === 'boolean' ? questionData.isMultipleChoice : (questionData.options ? true : false),
        passageId: questionData.passageId || null,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        createdBy: createdByEmail
    };
    const docRef = await db.collection('sat_questions').add(dataToSave);
    return { message: 'Question added successfully.', questionId: docRef.id };
};

const fetchSatQuestions = async (subject, count = '1', difficulty, type, passageId = null) => {
    let query = db.collection('sat_questions').where('subject', '==', subject.toLowerCase());

    if (type) {
        query = query.where('type', '==', type.toLowerCase());
    }
    if (difficulty) {
        query = query.where('difficulty', '==', difficulty.toLowerCase());
    }
    
    // **FIXED LOGIC**: If a passageId is provided, fetch ALL questions for it.
    // Otherwise, apply the count limit for fetching random questions.
    if (passageId) {
        query = query.where('passageId', '==', passageId);
    } else {
        const limitCount = parseInt(count);
        if (!isNaN(limitCount) && limitCount > 0) {
            query = query.limit(limitCount);
        } else {
            query = query.limit(5); // Default limit for non-passage specific fetches
        }
    }

    const snapshot = await query.get();
    if (snapshot.empty) {
        return { questions: [] }; // Return empty array if no questions found
    }

    const questions = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
    }));

    return { questions };
};

module.exports = { addSatQuestion, fetchSatQuestions };
