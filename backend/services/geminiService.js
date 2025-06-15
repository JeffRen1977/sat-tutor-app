// backend/services/geminiService.js
const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
if (!GEMINI_API_KEY) {
    console.error("GEMINI_API_KEY is not set in environment variables.");
    process.exit(1);
}

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
const geminiModel = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

// --- SCHEMAS FOR STRUCTURED OUTPUT --- //

const SAT_QUESTION_SCHEMA_ITEM = {
    type: "OBJECT",
    properties: {
        subject: { type: "STRING" },
        type: { type: "STRING" },
        questionText: { type: "STRING" },
        options: { type: "ARRAY", items: { type: "STRING" } },
        correctAnswer: { type: "STRING" },
        explanation: { type: "STRING" },
        difficulty: { type: "STRING" },
        isMultipleChoice: { type: "BOOLEAN" },
        passageId: { type: "STRING", nullable: true }
    },
    required: ["subject", "type", "questionText", "correctAnswer", "explanation", "difficulty", "isMultipleChoice"]
};

const SAT_QUESTION_SCHEMA = {
    type: "ARRAY",
    items: SAT_QUESTION_SCHEMA_ITEM
};

const SAT_PASSAGE_SCHEMA = {
    type: "OBJECT",
    properties: {
        title: { type: "STRING" },
        text: { type: "STRING" },
        genre: { type: "STRING", enum: ["literary_narrative", "social_science", "natural_science", "history"] },
        wordCount: { type: "NUMBER" },
        questions: { type: "ARRAY", items: SAT_QUESTION_SCHEMA_ITEM }
    },
    required: ["title", "text", "genre", "wordCount"]
};

const SAT_TEST_SCHEMA = {
    type: "OBJECT",
    properties: {
        title: { type: "STRING" },
        type: { type: "STRING" },
        readingSection: {
            type: "ARRAY",
            items: SAT_PASSAGE_SCHEMA
        },
        writingSection: {
            type: "ARRAY",
            items: SAT_QUESTION_SCHEMA_ITEM
        },
        mathSection: {
            type: "ARRAY",
            items: SAT_QUESTION_SCHEMA_ITEM
        },
    },
    required: ["title", "type"]
};

// --- HELPER FUNCTIONS --- //

/**
 * Generates SAT questions using Gemini API and ensures structured output.
 * @param {string} subject - The subject of the questions (e.g., 'math', 'reading', 'writing').
 * @param {number} count - The number of questions to generate.
 * @param {string} difficulty - The difficulty level (e.g., 'easy', 'medium', 'hard').
 * @param {string} type - Specific question type (e.g., 'algebra', 'grammar', 'main_idea').
 * @param {string} [passageText] - Optional: Provide passage text if generating reading questions related to it.
 * @param {string} [passageId] - Optional: ID of the passage if linking reading questions.
 * @returns {Promise<Array>} An array of generated SAT questions.
 */
const generateAndFormatSatQuestions = async (subject, count, difficulty, type, passageText = '', passageId = null) => {
    let prompt = `Generate ${count} SAT-style ${difficulty} ${subject} questions.`;

    if (type) {
        prompt += ` Focus on '${type}' type questions.`;
    }
    
    if (subject === 'reading' && passageText) {
        prompt += ` These questions must be based on the following passage: "${passageText}".`;
    } else if (subject === 'math' || subject === 'writing') {
        prompt += ` These questions must be standalone and NOT based on any reading passage.`;
    }

    prompt += ` For each question, include:
    - subject (string: '${subject}')
    - type (string: e.g., 'algebra', 'geometry', 'grammar', 'rhetoric')
    - questionText (string)
    - options (array of strings for multiple choice. If not multiple choice, provide an empty array)
    - correctAnswer (string, the letter for multiple choice, or numerical/text answer for grid-in/short answer)
    - explanation (string, detailed explanation of the answer)
    - difficulty (string: '${difficulty}')
    - isMultipleChoice (boolean)`;

    if (passageId) {
        prompt += `\n- passageId (string: "${passageId}")`;
    } else {
        prompt += `\n- passageId (must be null)`;
    }

    prompt += `\nProvide the output as a JSON array adhering to the specified schema.`;


    try {
        const payload = {
            contents: [{ role: "user", parts: [{ text: prompt }] }],
            generationConfig: {
                responseMimeType: "application/json",
                responseSchema: SAT_QUESTION_SCHEMA
            }
        };

        const result = await geminiModel.generateContent(payload);
        const jsonResponseText = result.response.text();
        const jsonResponse = JSON.parse(jsonResponseText);

        if (!Array.isArray(jsonResponse)) {
            console.error("Gemini did not return a JSON array as expected:", jsonResponseText);
            throw new Error("Failed to generate questions in the expected format.");
        }
        
        return jsonResponse.map(q => ({
            ...q,
            passageId: subject === 'reading' ? (passageId || q.passageId || null) : null
        }));

    } catch (error) {
        console.error("Error calling Gemini API for question generation:", error);
        const rawText = error.response ? error.response.text() : "No raw response text available.";
        throw new Error(`Gemini question generation failed: ${error.message}. Raw response: ${rawText}`);
    }
};

/**
 * Generates an SAT-style reading passage using Gemini API.
 * @param {string} genre - The genre of the passage (e.g., 'literary_narrative', 'history').
 * @param {number} wordCount - The approximate word count.
 * @param {string} [topic] - Optional: A specific topic for the passage.
 * @returns {Promise<object>} The generated passage data.
 */
const generateSatPassage = async (genre, wordCount, topic = '') => {
    const prompt = `Generate an SAT-style reading passage.
    Genre: ${genre}.
    Approximate word count: ${wordCount}.
    ${topic ? `Topic: ${topic}.` : ''}
    The passage should be suitable for SAT reading comprehension questions.
    Include a title for the passage.
    Provide the output as a JSON object adhering to the specified schema. NOTE: The 'questions' property in the schema should be an empty array [].`;

    try {
        const payload = {
            contents: [{ role: "user", parts: [{ text: prompt }] }],
            generationConfig: {
                responseMimeType: "application/json",
                responseSchema: SAT_PASSAGE_SCHEMA
            }
        };

        const result = await geminiModel.generateContent(payload);
        const jsonResponse = JSON.parse(result.response.text());

        if (typeof jsonResponse !== 'object' || !jsonResponse.text || !jsonResponse.title) {
            console.error("Gemini did not return a JSON object with text and title as expected:", jsonResponse);
            throw new Error("Failed to generate passage in the expected format.");
        }

        return jsonResponse;

    } catch (error) {
        console.error("Error calling Gemini API for passage generation:", error);
        const rawText = error.response ? error.response.text() : "No raw response text available.";
        throw new Error(`Gemini passage generation failed: ${error.message}. Raw response: ${rawText}`);
    }
};

/**
 * Generates a complete, structured SAT test using the Gemini API.
 * @param {'full' | 'math' | 'reading'} testType - The type of test to generate.
 * @returns {Promise<object>} The structured test data.
 */
const generateSatTest = async (testType) => {
    let prompt;
    let title;
    const readingPassageCount = 2;
    const questionsPerPassage = 3;
    const writingQuestionCount = 10;
    const mathQuestionCount = 15;

    switch (testType) {
        case 'full':
            title = 'Full-Length Practice Test';
            prompt = `Generate a full-length SAT practice test. It must contain three sections: Reading, Writing, and Math.
            - The Reading section must have exactly ${readingPassageCount} passages, each with ${questionsPerPassage} questions. Genres should be varied.
            - The Writing section must have exactly ${writingQuestionCount} standalone multiple-choice questions covering grammar and rhetoric.
            - The Math section must have exactly ${mathQuestionCount} standalone questions, with a mix of multiple-choice and grid-in answers.
            The difficulty should be medium overall. Provide the output as a single JSON object adhering to the specified schema.`;
            break;
        case 'math':
            title = 'Math Section Test';
            prompt = `Generate a Math Only SAT practice test.
            - It must contain a Math section with exactly ${mathQuestionCount} standalone questions.
            - The Reading and Writing sections must be empty arrays.
            - Include a mix of multiple-choice and grid-in questions with medium difficulty.
            Provide the output as a single JSON object adhering to the specified schema.`;
            break;
        case 'reading':
            title = 'Reading Section Test';
            prompt = `Generate a Reading Only SAT practice test.
            - It must contain a Reading section with exactly ${readingPassageCount} passages, each with ${questionsPerPassage} questions.
            - The Math and Writing sections must be empty arrays.
            - The passages should have varied genres and medium difficulty questions.
            Provide the output as a single JSON object adhering to the specified schema.`;
            break;
        default:
            throw new Error('Invalid test type provided.');
    }

    try {
        const payload = {
            contents: [{ role: "user", parts: [{ text: prompt }] }],
            generationConfig: {
                responseMimeType: "application/json",
                responseSchema: SAT_TEST_SCHEMA
            }
        };

        const result = await geminiModel.generateContent(payload);
        const jsonResponse = JSON.parse(result.response.text());

        jsonResponse.title = title;
        jsonResponse.type = testType;

        return jsonResponse;

    } catch (error) {
        console.error(`Error calling Gemini API for ${testType} test generation:`, error);
        throw new Error(`Gemini test generation failed: ${error.message}.`);
    }
};

const getChatResponse = async (chatHistory) => {
    const prompt = chatHistory.map(m => `${m.role}: ${m.text}`).join('\n') + "\nmodel:";
    const result = await geminiModel.generateContent(prompt);
    return result.response.text();
};
const getVocabularyExplanation = async (word) => {
    const prompt = `Provide a detailed explanation for the SAT vocabulary word "${word}", including its definition, a sample sentence, and synonyms.`;
    const result = await geminiModel.generateContent(prompt);
    return result.response.text();
};
const getEssayBrainstorming = async (topic) => {
    const prompt = `Generate a list of brainstorming ideas, arguments, and counter-arguments for an SAT essay on the topic: "${topic}".`;
    const result = await geminiModel.generateContent(prompt);
    return result.response.text();
};
const solveMathProblem = async (problem) => {
    const prompt = `Solve the following math problem, showing a clear, step-by-step solution: "${problem}"`;
    const result = await geminiModel.generateContent(prompt);
    return result.response.text();
};

module.exports = {
    getChatResponse,
    getVocabularyExplanation,
    getEssayBrainstorming,
    solveMathProblem,
    generateAndFormatSatQuestions,
    generateSatPassage,
    generateSatTest
};