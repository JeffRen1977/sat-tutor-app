// =====================================================================
// --- File: backend/services/geminiService.js ---
// =====================================================================
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
            isMultipleChoice: { type: "BOOLEAN" }
        },
        required: ["subject", "type", "questionText", "correctAnswer", "explanation", "difficulty", "isMultipleChoice"]
    }
};

/**
 * Generates SAT questions using Gemini API and ensures structured output.
 * @param {string} subject - The subject of the questions (e.g., 'math', 'reading', 'writing').
 * @param {number} count - The number of questions to generate.
 * @param {string} difficulty - The difficulty level (e.g., 'easy', 'medium', 'hard').
 * @param {string} type - Specific question type (e.g., 'algebra', 'grammar', 'main_idea').
 * @returns {Array} An array of generated SAT questions.
 */
const generateAndFormatSatQuestions = async (subject, count, difficulty, type) => {
    const prompt = `Generate ${count} SAT-style ${difficulty} ${subject} questions. 
    ${type ? `Focus on '${type}' type questions.` : ''}
    For each question, include:
    - subject (string: 'math', 'reading', or 'writing')
    - type (string: e.g., 'algebra', 'geometry', 'grammar', 'main_idea', 'passage_question', 'rhetoric')
    - questionText (string)
    - options (array of strings, for multiple choice. If not multiple choice, provide an empty array)
    - correctAnswer (string, the letter for multiple choice, or numerical/text answer for grid-in/short answer)
    - explanation (string, detailed explanation of the answer)
    - difficulty (string: 'easy', 'medium', or 'hard')
    - isMultipleChoice (boolean)

    Ensure the correct answer is always one of the provided options if isMultipleChoice is true.
    If the question is not multiple choice, 'options' should be an empty array and 'isMultipleChoice' should be false.
    Provide the output as a JSON array adhering to the specified schema.`;

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

        // Basic validation of the generated JSON structure
        if (!Array.isArray(jsonResponse)) {
            console.error("Gemini did not return a JSON array as expected:", jsonResponse);
            throw new Error("Failed to generate questions in the expected format.");
        }

        return jsonResponse;

    } catch (error) {
        console.error("Error calling Gemini API for question generation:", error);
        // Attempt to parse raw text if JSON parsing fails, for better debugging
        let rawText = "No raw text available.";
        if (error.result && error.result.response && error.result.response.text) {
             rawText = error.result.response.text();
        }
        throw new Error(`Gemini question generation failed: ${error.message}. Raw response: ${rawText}`);
    }
};


// Existing Gemini Service functions
const getChatResponse = async (chatHistory) => {
    const apiChatHistory = chatHistory.map(msg => ({
        role: msg.role === 'model' ? 'model' : 'user',
        parts: [{ text: msg.text }]
    }));
    const result = await geminiModel.generateContent({ contents: apiChatHistory });
    return result.response.text();
};

const getVocabularyExplanation = async (word) => {
    const prompt = `Please provide a concise explanation for the SAT vocabulary word: "${word.trim()}". Include its definition, a typical SAT-style example sentence, and a common synonym or antonym if applicable.`;
    const result = await geminiModel.generateContent(prompt);
    return result.response.text();
};

const getEssayBrainstorming = async (topic) => {
    const prompt = `Generate brainstorming ideas for an SAT essay on the following topic: "${topic.trim()}". Provide various angles, potential arguments (for/against), and relevant examples or concepts to consider. Format the output clearly.`;
    const result = await geminiModel.generateContent(prompt);
    return result.response.text();
};

const solveMathProblem = async (problem) => {
    const prompt = `Provide a detailed step-by-step solution for the following SAT-level math problem. Explain each step clearly.\n\nProblem: "${problem.trim()}"`;
    const result = await geminiModel.generateContent(prompt);
    return result.response.text();
};

module.exports = {
    getChatResponse,
    getVocabularyExplanation,
    getEssayBrainstorming,
    solveMathProblem,
    generateAndFormatSatQuestions // Export the new function
};

