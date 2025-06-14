// backend/services/geminiService.js
const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config(); // Ensure dotenv is loaded here too for GEMINI_API_KEY

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
if (!GEMINI_API_KEY) {
    console.error("GEMINI_API_KEY is not set in environment variables.");
    // In a real application, you might throw an error or handle this more gracefully
    process.exit(1);
}

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
const geminiModel = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

// Helper to define the JSON schema for generated SAT questions
const SAT_QUESTION_SCHEMA = {
    type: "ARRAY",
    items: {
        type: "OBJECT",
        properties: {
            subject: { type: "STRING" },
            type: { type: "STRING" },
            questionText: { type: "STRING" },
            options: {
                type: "ARRAY",
                items: { type: "STRING" }
            },
            correctAnswer: { type: "STRING" },
            explanation: { type: "STRING" },
            difficulty: { type: "STRING" },
            isMultipleChoice: { type: "BOOLEAN" },
            passageId: { type: "STRING", nullable: true } // Added for linking questions to passages
        },
        required: ["subject", "type", "questionText", "correctAnswer", "explanation", "difficulty", "isMultipleChoice"]
    }
};

// Helper to define the JSON schema for generated SAT passages
const SAT_PASSAGE_SCHEMA = {
    type: "OBJECT",
    properties: {
        title: { type: "STRING" },
        text: { type: "STRING" },
        genre: { type: "STRING", enum: ["literary_narrative", "social_science", "natural_science", "history"] },
        wordCount: { type: "NUMBER" },
        // Potentially add other fields like source, author, etc.
    },
    required: ["title", "text", "genre", "wordCount"]
};

/**
 * Generates SAT questions using Gemini API and ensures structured output.
 * @param {string} subject - The subject of the questions (e.g., 'math', 'reading', 'writing').
 * @param {number} count - The number of questions to generate.
 * @param {string} difficulty - The difficulty level (e.g., 'easy', 'medium', 'hard').
 * @param {string} type - Specific question type (e.g., 'algebra', 'grammar', 'main_idea').
 * @param {string} [passageText] - Optional: Provide passage text if generating reading questions related to it.
 * @param {string} [passageId] - Optional: ID of the passage if linking reading questions.
 * @returns {Array} An array of generated SAT questions.
 */
const generateAndFormatSatQuestions = async (subject, count, difficulty, type, passageText = '', passageId = null) => {
    let prompt = `Generate ${count} SAT-style ${difficulty} ${subject} questions.`;

    if (type) {
        prompt += ` Focus on '${type}' type questions.`;
    }
    if (subject === 'reading' && passageText) {
        prompt += ` These questions should be based on the following passage: "${passageText}".`;
    }

    prompt += ` For each question, include:
    - subject (string: 'math', 'reading', or 'writing')
    - type (string: e.g., 'algebra', 'geometry', 'grammar', 'main_idea', 'passage_question', 'rhetoric')
    - questionText (string)
    - options (array of strings, for multiple choice. If not multiple choice, provide an empty array)
    - correctAnswer (string, the letter for multiple choice, or numerical/text answer for grid-in/short answer)
    - explanation (string, detailed explanation of the answer)
    - difficulty (string: 'easy', 'medium', or 'hard')
    - isMultipleChoice (boolean)`;

    if (passageId) {
        prompt += `\n- passageId (string: "${passageId}")`;
    } else if (subject === 'reading' && !passageId) {
        // If it's a reading question but no specific passageId is given, imply it's general or AI should provide.
        // For structured output, we must ensure passageId is always present or null.
        prompt += `\n- passageId (string, can be 'null' if not linked to a specific external passage)`;
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
        const jsonResponse = JSON.parse(result.response.text());

        if (!Array.isArray(jsonResponse)) {
            console.error("Gemini did not return a JSON array as expected:", jsonResponse);
            throw new Error("Failed to generate questions in the expected format.");
        }

        // Ensure passageId is correctly set for generated questions if provided
        return jsonResponse.map(q => ({
            ...q,
            passageId: (q.subject === 'reading' && passageId) ? passageId : (q.subject === 'reading' ? (q.passageId || null) : null)
        }));

    } catch (error) {
        console.error("Error calling Gemini API for question generation:", error);
        let rawText = "No raw text available.";
        if (error.result && error.result.response && error.result.response.text) {
             rawText = error.result.response.text();
        }
        throw new Error(`Gemini question generation failed: ${error.message}. Raw response: ${rawText}`);
    }
};

/**
 * Generates an SAT-style reading passage using Gemini API.
 * @param {string} genre - The genre of the passage (e.g., 'literary_narrative', 'history').
 * @param {number} wordCount - The approximate word count.
 * @param {string} [topic] - Optional: A specific topic for the passage.
 * @returns {object} The generated passage data.
 */
const generateSatPassage = async (genre, wordCount, topic = '') => {
    const prompt = `Generate an SAT-style reading passage.
    Genre: ${genre}.
    Approximate word count: ${wordCount}.
    ${topic ? `Topic: ${topic}.` : ''}
    The passage should be suitable for SAT reading comprehension questions.
    Include a title for the passage.
    Provide the output as a JSON object adhering to the specified schema.`;

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

        // Basic validation of the generated JSON structure
        if (typeof jsonResponse !== 'object' || !jsonResponse.text || !jsonResponse.title) {
            console.error("Gemini did not return a JSON object with text and title as expected:", jsonResponse);
            throw new Error("Failed to generate passage in the expected format.");
        }

        return jsonResponse;

    } catch (error) {
        console.error("Error calling Gemini API for passage generation:", error);
        let rawText = "No raw text available.";
        if (error.result && error.result.response && error.result.response.text) {
             rawText = error.result.response.text();
        }
        throw new Error(`Gemini passage generation failed: ${error.message}. Raw response: ${rawText}`);
    }
};


// Existing Gemini Service functions (no changes to these)
const getChatResponse = async (chatHistory) => { /* ... existing code ... */ return result.response.text(); };
const getVocabularyExplanation = async (word) => { /* ... existing code ... */ return result.response.text(); };
const getEssayBrainstorming = async (topic) => { /* ... existing code ... */ return result.response.text(); };
const solveMathProblem = async (problem) => { /* ... existing code ... */ return result.response.text(); };

module.exports = {
    getChatResponse,
    getVocabularyExplanation,
    getEssayBrainstorming,
    solveMathProblem,
    generateAndFormatSatQuestions,
    generateSatPassage // Export the new passage generation function
};