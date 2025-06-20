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

const SAT_QUESTION_ARRAY_SCHEMA = {
    type: "ARRAY",
    items: SAT_QUESTION_SCHEMA_ITEM
};

const SAT_PASSAGE_SCHEMA_FOR_TEST = {
    type: "OBJECT",
    properties: {
        title: { type: "STRING" },
        text: { type: "STRING" },
        genre: { type: "STRING", enum: ["literary_narrative", "social_science", "natural_science", "history"] },
        wordCount: { type: "NUMBER" },
        questions: { type: "ARRAY", items: SAT_QUESTION_SCHEMA_ITEM }
    },
    required: ["title", "text", "genre", "wordCount", "questions"]
};

// This schema is for generating a passage ONLY, without questions.
const SAT_PASSAGE_SCHEMA_STANDALONE = {
     type: "OBJECT",
    properties: {
        title: { type: "STRING" },
        text: { type: "STRING" },
        genre: { type: "STRING", enum: ["literary_narrative", "social_science", "natural_science", "history"] },
        wordCount: { type: "NUMBER" },
    },
    required: ["title", "text", "genre", "wordCount"]
}

const SAT_TEST_SCHEMA = {
    type: "OBJECT",
    properties: {
        title: { type: "STRING" },
        type: { type: "STRING" },
        readingSection: {
            type: "ARRAY",
            items: SAT_PASSAGE_SCHEMA_FOR_TEST
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
    required: ["title", "type", "readingSection", "writingSection", "mathSection"]
};

const STUDY_PLAN_SCHEMA = {
    type: "OBJECT",
    properties: {
        strengths: {
            type: "ARRAY",
            items: { type: "STRING" }
        },
        weaknesses: {
            type: "ARRAY",
            items: { type: "STRING" }
        },
        dailyPlan: {
            type: "ARRAY",
            items: {
                type: "OBJECT",
                properties: {
                    day: { type: "STRING" },
                    tasks: { type: "ARRAY", items: { type: "STRING" } }
                },
                required: ["day", "tasks"]
            }
        }
    },
    required: ["strengths", "weaknesses", "dailyPlan"]
};


// --- HELPER FUNCTIONS --- //

const generateSectionQuestions = async (prompt) => {
    const payload = {
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        generationConfig: {
            responseMimeType: "application/json",
            responseSchema: SAT_QUESTION_ARRAY_SCHEMA
        }
    };
    const result = await geminiModel.generateContent(payload);
    return JSON.parse(result.response.text());
};

const generateAndFormatSatQuestions = async (subject, count, difficulty, type, passageText = '', passageId = null) => {
    let prompt = `Generate ${count} SAT-style ${difficulty} ${subject} questions.`;
    if (type) prompt += ` Focus on '${type}' type questions.`;
    if (subject === 'reading' && passageText) {
        prompt += ` These questions must be based on the following passage: "${passageText}".`;
    } else if (subject === 'math' || subject === 'writing') {
        prompt += ` These questions must be standalone and NOT based on any reading passage.`;
    }
    prompt += ` For each question, include all required fields. The passageId must be null for standalone questions. Provide the output as a JSON array.`;
    return await generateSectionQuestions(prompt);
};

const generateSatPassage = async (genre, wordCount, topic = '') => {
    // **FIXED**: The prompt is simplified to avoid confusing the AI. It now relies
    // solely on the programmatic schema for formatting instructions.
    const prompt = `Generate an SAT-style reading passage with the following properties:
        - Genre: ${genre}
        - Approximate Word Count: ${wordCount}
        ${topic ? `- Topic: ${topic}` : ''}
        - The passage should be suitable for SAT reading comprehension questions.
        - It must include a title.`;

    try {
        const payload = {
            contents: [{ role: "user", parts: [{ text: prompt }] }],
            generationConfig: {
                responseMimeType: "application/json",
                responseSchema: SAT_PASSAGE_SCHEMA_STANDALONE
            }
        };

        const result = await geminiModel.generateContent(payload);
        const jsonResponse = JSON.parse(result.response.text());

        if (typeof jsonResponse !== 'object' || !jsonResponse.text || !jsonResponse.title) {
            throw new Error("Failed to generate passage in the expected format.");
        }

        return jsonResponse;

    } catch (error) {
        console.error("Error calling Gemini API for passage generation:", error);
        throw new Error(`Gemini passage generation failed: ${error.message}.`);
    }
};

const generateSatTest = async (testType) => {
    // ... This function remains the same as the previous correct version ...
    let title;
    const readingPassageCount = 2;
    const questionsPerPassage = 3;
    const writingQuestionCount = 10;
    const mathQuestionCount = 15;

    try {
        if (testType === 'full') {
            title = 'Full-Length Practice Test';
            const prompt = `Generate a full-length SAT practice test. It must contain three sections: Reading, Writing, and Math.
            - The Reading section must have exactly ${readingPassageCount} passages, each with ${questionsPerPassage} questions. Genres should be varied.
            - The Writing section must have exactly ${writingQuestionCount} standalone multiple-choice questions covering grammar and rhetoric.
            - The Math section must have exactly ${mathQuestionCount} standalone questions, with a mix of multiple-choice and grid-in answers.
            The difficulty should be medium overall. Provide the output as a single JSON object adhering to the specified schema.`;
            
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

        } else if (testType === 'math') {
            title = 'Math Section Test';
            const prompt = `Generate a Math SAT practice test section with exactly ${mathQuestionCount} standalone questions. Include a mix of multiple-choice and grid-in questions with medium difficulty.`;
            const mathSection = await generateSectionQuestions(prompt);
            return { title, type: testType, readingSection: [], writingSection: [], mathSection };

        } else if (testType === 'writing') {
            title = 'Writing & Language Test';
            const prompt = `Generate a Writing & Language SAT practice test section with exactly ${writingQuestionCount} standalone multiple-choice questions. Cover a mix of grammar, usage, punctuation, and rhetorical skills with medium difficulty.`;
            const writingSection = await generateSectionQuestions(prompt);
            return { title, type: testType, readingSection: [], writingSection, mathSection: [] };

        } else if (testType === 'reading') {
             title = 'Reading Section Test';
            const prompt = `Generate a Reading Only SAT practice test.
            - It must contain a Reading section with exactly ${readingPassageCount} passages, each with ${questionsPerPassage} questions.
            - The Math and Writing sections must be empty arrays.
            - The passages should have varied genres and medium difficulty questions.
            Provide the output as a single JSON object adhering to the specified schema.`;
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
        } else {
            throw new Error('Invalid test type provided.');
        }

    } catch (error) {
        console.error(`Error calling Gemini API for ${testType} test generation:`, error);
        throw new Error(`Gemini test generation failed: ${error.message}.`);
    }
};

/**
 * Generates a personalized study plan based on a summary of user performance.
 * @param {string} historySummaryForPrompt - A string summarizing the user's recent performance.
 * @returns {Promise<object>} The structured study plan.
 */
const getStudyPlan = async (historySummaryForPrompt) => {
    const prompt = `
    Based on the following summary of a student's recent SAT practice performance, act as an expert SAT tutor.
    Analyze their strengths and weaknesses and create a concise, actionable 3-day study plan.

    Performance Summary:
    ${historySummaryForPrompt}

    Your analysis should result in a JSON object with three properties:
    1.  "strengths": An array of strings, with each string being a specific topic or question type the student is good at. (e.g., "Algebra - Linear equations"). Be encouraging.
    2.  "weaknesses": An array of strings, with each string being a specific topic or question type the student should focus on. Be constructive.
    3.  "dailyPlan": An array of objects, one for each of the next 3 days. Each object should have a "day" (e.g., "Day 1") and a "tasks" property, which is an array of 2-3 specific, actionable tasks for that day. Tasks should directly address the identified weaknesses.

    Provide the output as a JSON object adhering to the specified schema.
    `;

    try {
        const payload = {
            contents: [{ role: "user", parts: [{ text: prompt }] }],
            generationConfig: {
                responseMimeType: "application/json",
                responseSchema: STUDY_PLAN_SCHEMA
            }
        };
        const result = await geminiModel.generateContent(payload);
        return JSON.parse(result.response.text());
    } catch (error) {
        console.error("Error calling Gemini API for study plan generation:", error);
        throw new Error(`Gemini study plan generation failed: ${error.message}.`);
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
    generateSatTest,
    getStudyPlan
};
