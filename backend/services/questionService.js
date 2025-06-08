// backend/services/questionService.js
const { db, admin } = require('../config/firebase'); // Import db and admin for FieldValue.serverTimestamp

const addSatQuestion = async (questionData, createdByEmail) => {
    const dataToSave = {
        subject: questionData.subject.toLowerCase(),
        type: questionData.type.toLowerCase(),
        questionText: questionData.questionText,
        options: questionData.options || null,
        correctAnswer: questionData.correctAnswer,
        explanation: questionData.explanation,
        difficulty: questionData.difficulty.toLowerCase(),
        isMultipleChoice: typeof questionData.isMultipleChoice === 'boolean' ? questionData.isMultipleChoice : (questionData.options ? true : false),
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        createdBy: createdByEmail
    };
    const docRef = await db.collection('sat_questions').add(dataToSave);
    return { message: 'Question added successfully.', questionId: docRef.id };
};

const fetchSatQuestions = async (subject, count = '1', difficulty, type) => {
    let query = db.collection('sat_questions').where('subject', '==', subject.toLowerCase());

    if (type) {
        query = query.where('type', '==', type.toLowerCase());
    }
    if (difficulty) {
        query = query.where('difficulty', '==', difficulty.toLowerCase());
    }

    const limitCount = parseInt(count);
    if (!isNaN(limitCount) && limitCount > 0) {
        query = query.limit(limitCount);
    } else {
        query = query.limit(5); // Default to 5 questions
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
