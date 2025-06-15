// backend/services/testService.js
const { generateSatTest } = require('./geminiService');

/**
 * Creates a complete SAT test based on the specified type.
 * @param {'full' | 'math' | 'reading'} testType - The type of test to generate.
 * @returns {Promise<object>} A promise that resolves to the structured test data.
 */
const createTest = async (testType) => {
    try {
        // This service acts as a wrapper around the Gemini service.
        // It can be expanded later to include logic for saving/retrieving pre-generated tests.
        const testData = await generateSatTest(testType);
        return testData;
    } catch (error) {
        console.error(`Error creating ${testType} test in testService:`, error);
        // Re-throw the error to be caught by the route handler
        throw new Error(`Failed to generate ${testType} test.`);
    }
};

module.exports = {
    createTest
};
