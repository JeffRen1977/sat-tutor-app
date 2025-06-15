// backend/services/testService.js
const { generateSatTest } = require('./geminiService');

/**
 * Creates a complete SAT test based on the specified type.
 * @param {'full' | 'math' | 'reading' | 'writing'} testType - The type of test to generate.
 * @returns {Promise<object>} A promise that resolves to the structured test data.
 */
const createTest = async (testType) => {
    try {
        const testData = await generateSatTest(testType);
        return testData;
    } catch (error) {
        console.error(`Error creating ${testType} test in testService:`, error);
        throw new Error(`Failed to generate ${testType} test.`);
    }
};

module.exports = {
    createTest
};