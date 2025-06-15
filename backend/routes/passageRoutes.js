// backend/routes/passageRoutes.js
const express = require('express');
const router = express.Router();
const authenticateToken = require('../middleware/authMiddleware');
const { addSatPassage, generateAndSaveSatPassage, fetchSatPassages } = require('../services/passageService'); // 确保导入了 addSatPassage
const { generateAndFormatSatQuestions } = require('../services/geminiService'); // 确保导入路径正确
const { addSatQuestion } = require('../services/questionService'); // 确保导入了 addSatQuestion
const { isUserAdmin } = require('../services/authService'); // 确保导入了 isUserAdmin

router.use(authenticateToken); // All passage routes are protected

/**
 * Endpoint: Adds a new SAT passage to Firestore directly.
 * Requires admin authentication.
 * Body: { title, text, genre, wordCount }
 */
router.post('/add', async (req, res) => { // 这是前端调用保存的接口
    const { title, text, genre, wordCount } = req.body;
    const userEmail = req.user.email; // Email from authenticated JWT

    if (!title || !text || !genre || !wordCount) {
        return res.status(400).json({ message: 'Missing required passage fields (title, text, genre, wordCount).' });
    }

    try {
        const result = await addSatPassage( // 调用 service 层的方法
            { title, text, genre, wordCount },
            userEmail
        );
        res.status(201).json(result);
    } catch (error) {
        console.error('Error in /api/passages/add route:', error);
        if (error.message.includes('Only administrators can add')) {
            return res.status(403).json({ message: error.message });
        }
        res.status(500).json({ message: 'Failed to add passage.', details: error.message });
    }
});


/**
 * Endpoint: Generate an SAT passage using AI and save it to the database.
 * Requires admin authentication.
 * Body: { genre, wordCount, topic (optional) }
 */
router.post('/generate', async (req, res) => { // 这是前端调用生成并审核的接口
    const { genre, wordCount, topic } = req.body;
    const userEmail = req.user.email;

    if (!genre || !wordCount) {
        return res.status(400).json({ message: 'Genre and wordCount are required for passage generation.' });
    }

    try {
        const isAdmin = await isUserAdmin(userEmail);
        if (!isAdmin) {
            return res.status(403).json({ message: 'Forbidden: Only administrators can generate passages.' });
        }

        const result = await generateAndSaveSatPassage(genre, wordCount, topic, userEmail);
        // generateAndSaveSatPassage 已经保存到数据库了，这里直接返回生成的数据给前端审核
        res.status(201).json({
            message: "Passage generated for review.",
            generatedPassage: result.passageData, // 返回完整的 passageData 供前端审核
            passageId: result.passageId
        });
    } catch (error) {
        console.error('Error in /api/passages/generate route:', error);
        res.status(500).json({ message: 'Failed to generate or save passage.', details: error.message });
    }
});


/**
 * Endpoint: Fetch SAT passages from the database.
 * Requires authentication.
 * Query: { genre (optional), count (optional, default 1), passageId (optional) }
 */
router.get('/fetch', async (req, res) => {
    const { genre, count, passageId } = req.query;

    try {
        const result = await fetchSatPassages(genre, count, passageId);
        if (result.passages.length === 0) {
            return res.status(404).json({ message: 'No passages found matching the criteria.' });
        }
        res.json(result);
    } catch (error) {
        console.error('Error in /api/passages/fetch route:', error);
        res.status(500).json({ message: 'Failed to fetch passages.', details: error.message });
    }
});

/**
 * NEW Endpoint: Generate an SAT passage, then generate questions based on it, and save both.
 * Requires admin authentication.
 * Body: {
 * passage: { genre, wordCount, topic (optional) },
 * questions: { count, difficulty, type (optional) }
 * }
 */
router.post('/generate-and-link-questions', async (req, res) => {
    const { passage, questions: questionParams } = req.body;
    const userEmail = req.user.email;

    if (!passage || !passage.genre || !passage.wordCount || !questionParams || !questionParams.count || !questionParams.difficulty) {
        return res.status(400).json({ message: 'Missing required parameters for passage or questions generation.' });
    }

    try {
        const isAdmin = await isUserAdmin(userEmail);
        if (!isAdmin) {
            return res.status(403).json({ message: 'Forbidden: Only administrators can generate and link passages with questions.' });
        }

        // 1. Generate and Save the Passage
        // This will now use the service, which also adds to DB
        const passageResult = await generateAndSaveSatPassage(passage.genre, passage.wordCount, passage.topic, userEmail);
        const newPassageId = passageResult.passageId;
        const newPassageText = passageResult.passageData.text; // Get the full text for question generation

        if (!newPassageId || !newPassageText) {
            throw new Error('Failed to generate or save passage successfully for question linking.');
        }

        // 2. Generate Questions based on the new Passage
        const generatedQuestions = await generateAndFormatSatQuestions(
            questionParams.subject || 'reading', // Assume reading for passage-based questions
            questionParams.count,
            questionParams.difficulty,
            questionParams.type,
            newPassageText, // Pass the actual passage text as context
            newPassageId // Link questions to the new passage ID
        );

        if (!generatedQuestions || generatedQuestions.length === 0) {
            return res.status(404).json({ message: 'AI failed to generate questions based on the passage.' });
        }

        // 3. Save the Generated Questions
        const addQuestionPromises = generatedQuestions.map(q => addSatQuestion(q, userEmail));
        const addQuestionResults = await Promise.allSettled(addQuestionPromises);

        const successfulQuestionAdds = addQuestionResults.filter(p => p.status === 'fulfilled').map(p => p.value);
        const failedQuestionAdds = addQuestionResults.filter(p => p.status === 'rejected');

        console.log(`Successfully generated and added 1 passage and ${successfulQuestionAdds.length} questions.`);
        if (failedQuestionAdds.length > 0) {
            console.error(`Failed to add ${failedQuestionAdds.length} questions:`, failedAdds.map(p => p.reason));
        }

        res.status(200).json({
            message: `Successfully generated 1 passage (ID: ${newPassageId}) and ${successfulQuestionAdds.length} questions.`,
            passageId: newPassageId,
            successfulQuestions: successfulQuestionAdds.length,
            failedQuestions: failedQuestionAdds.length,
            generatedQuestionIds: successfulQuestionAdds.map(r => r.questionId || 'N/A')
        });

    } catch (error) {
        console.error('Error in /api/passages/generate-and-link-questions route:', error);
        res.status(500).json({ message: 'Failed to generate passage and/or questions.', details: error.message });
    }
});

module.exports = router;