import React, { useState } from 'react';
import { PlusCircle } from 'lucide-react';
import { generatePassage, generateQuestions } from '../services/aiService';

function AdminTools({ API_BASE_URL, userToken, userRole }) {
    // State for Generate Passage
    const [generatePassageGenre, setGeneratePassageGenre] = useState('history');
    const [generatePassageWordCount, setGeneratePassageWordCount] = useState(300);
    const [generatePassageTopic, setGeneratePassageTopic] = useState('');
    const [isGeneratingPassage, setIsGeneratingPassage] = useState(false);
    const [generatePassageMessage, setGeneratePassageMessage] = useState({ type: '', text: '' });
    const [lastGeneratedPassageId, setLastGeneratedPassageId] = useState(null);

    // State for Generate Questions
    const [generateQuestionSubject, setGenerateQuestionSubject] = useState('math');
    const [generateQuestionCount, setGenerateQuestionCount] = useState(1);
    const [generateQuestionDifficulty, setGenerateQuestionDifficulty] = useState('medium');
    const [generateQuestionType, setGenerateQuestionType] = useState('');
    const [generateQuestionPassageId, setGenerateQuestionPassageId] = useState('');
    const [isGeneratingQuestions, setIsGeneratingQuestions] = useState(false);
    const [generateQuestionMessage, setGenerateQuestionMessage] = useState({ type: '', text: '' });

    const handleGeneratePassage = async () => {
        setGeneratePassageMessage({ type: '', text: '' });
        setIsGeneratingPassage(true);
        setLastGeneratedPassageId(null);

        if (!generatePassageGenre || !generatePassageWordCount) {
            setGeneratePassageMessage({ type: 'error', text: 'Genre and Word Count are required.' });
            setIsGeneratingPassage(false);
            return;
        }

        try {
            const response = await generatePassage(API_BASE_URL, userToken, {
                genre: generatePassageGenre,
                wordCount: generatePassageWordCount,
                topic: generatePassageTopic
            });

            if (response.status === 403) {
                setGeneratePassageMessage({ type: 'error', text: 'Forbidden: Only admins can generate passages.' });
                setIsGeneratingPassage(false); // Ensure loading state is reset
                return;
            }
            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.message || 'Failed to generate passage.');
            }
            setGeneratePassageMessage({ type: 'success', text: `Passage generated and saved! ID: ${data.passageId}` });
            setLastGeneratedPassageId(data.passageId);
        } catch (error) {
            console.error("Error generating passage:", error);
            setGeneratePassageMessage({ type: 'error', text: `Error generating passage: ${error.message || 'Failed to fetch or parse JSON'}` });
        } finally {
            setIsGeneratingPassage(false);
        }
    };

    const handleGenerateQuestions = async () => {
        setGenerateQuestionMessage({ type: '', text: '' });
        setIsGeneratingQuestions(true);

        if (!generateQuestionSubject || !generateQuestionCount || !generateQuestionDifficulty) {
            setGenerateQuestionMessage({ type: 'error', text: 'Subject, Count, and Difficulty are required.' });
            setIsGeneratingQuestions(false);
            return;
        }
        if (generateQuestionSubject === 'reading' && !generateQuestionPassageId) {
            setGenerateQuestionMessage({ type: 'error', text: 'For reading questions, a Passage ID is required.' });
            setIsGeneratingQuestions(false);
            return;
        }

        try {
            const response = await generateQuestions(API_BASE_URL, userToken, {
                subject: generateQuestionSubject,
                count: generateQuestionCount,
                difficulty: generateQuestionDifficulty,
                type: generateQuestionType,
                passageId: generateQuestionSubject === 'reading' ? (generateQuestionPassageId || null) : null
            });

            if (response.status === 403) {
                setGenerateQuestionMessage({ type: 'error', text: 'Forbidden: Only admins can generate questions.' });
                setIsGeneratingQuestions(false); // Ensure loading state is reset
                return;
            }
            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.message || 'Failed to generate questions.');
            }
            setGenerateQuestionMessage({ type: 'success', text: `Generated and saved ${data.successful} questions!` });
        } catch (error) {
            console.error("Error generating questions:", error);
            setGenerateQuestionMessage({ type: 'error', text: `Error generating questions: ${error.message || 'Failed to fetch or parse JSON'}` });
        } finally {
            setIsGeneratingQuestions(false);
        }
    };

    if (userRole !== 'admin') {
        return (
            <div className="p-6 bg-red-100 rounded-lg shadow-md text-center">
                <h2 className="text-3xl font-bold text-red-800 mb-4">Access Denied</h2>
                <p className="text-red-700">You must be logged in as an administrator to access these tools.</p>
            </div>
        );
    }

    return (
        <div className="p-6 bg-white rounded-lg shadow-md">
            <h2 className="text-3xl font-bold text-gray-800 mb-6 flex items-center">
                <PlusCircle className="w-8 h-8 mr-3" /> Admin Content Generation Tools
            </h2>
            <p className="text-gray-600 mb-8">Generate and add new SAT passages or questions to the database using AI.</p>

            {/* Generate Passage Form */}
            <div className="mt-6 p-6 bg-purple-50 rounded-lg shadow-inner border border-purple-200">
                <h3 className="text-2xl font-semibold text-purple-800 mb-4">Generate Passage</h3>
                <p className="text-purple-700 mb-6">Create a new SAT-style reading passage via AI.</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                        <label htmlFor="genPassageGenre" className="block text-sm font-medium text-gray-700 mb-2">Genre:</label>
                        <select
                            id="genPassageGenre"
                            className="w-full p-2 border border-gray-300 rounded-md"
                            value={generatePassageGenre}
                            onChange={(e) => setGeneratePassageGenre(e.target.value)}
                            disabled={isGeneratingPassage}
                        >
                            <option value="history">History</option>
                            <option value="literary_narrative">Literary Narrative</option>
                            <option value="natural_science">Natural Science</option>
                            <option value="social_science">Social Science</option>
                        </select>
                    </div>
                    <div>
                        <label htmlFor="genPassageWordCount" className="block text-sm font-medium text-gray-700 mb-2">Word Count (approx):</label>
                        <input
                            type="number"
                            id="genPassageWordCount"
                            min="100"
                            max="1000"
                            className="w-full p-2 border border-gray-300 rounded-md"
                            value={generatePassageWordCount}
                            onChange={(e) => setGeneratePassageWordCount(Math.max(100, Math.min(1000, parseInt(e.target.value) || 100)))}
                            disabled={isGeneratingPassage}
                        />
                    </div>
                </div>
                <div>
                    <label htmlFor="genPassageTopic" className="block text-sm font-medium text-gray-700 mb-2">Topic (Optional):</label>
                    <input
                        type="text"
                        id="genPassageTopic"
                        placeholder="e.g., impact of renewable energy"
                        className="w-full p-2 border border-gray-300 rounded-md"
                        value={generatePassageTopic}
                        onChange={(e) => setGeneratePassageTopic(e.target.value)}
                        disabled={isGeneratingPassage}
                    />
                </div>
                <button
                    onClick={handleGeneratePassage}
                    disabled={isGeneratingPassage}
                    className="mt-4 bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors duration-200 shadow-md flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed w-full"
                >
                    {isGeneratingPassage ? (
                        <svg className="animate-spin h-5 w-5 text-white mr-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                    ) : (
                        <>Generate & Save Passage ✨</>
                    )}
                </button>
                {generatePassageMessage.text && (
                    <p className={`text-sm mt-2 text-center ${generatePassageMessage.type === 'error' ? 'text-red-600' : 'text-green-600'}`}>
                        {generatePassageMessage.text}
                    </p>
                )}
                {lastGeneratedPassageId && generatePassageMessage.type === 'success' && (
                    <p className="text-gray-700 text-sm mt-2 text-center">
                        Last generated passage ID: <span className="font-semibold">{lastGeneratedPassageId}</span> (Copy for questions)
                    </p>
                )}
            </div>

            {/* Generate Questions Form */}
            <div className="mt-10 p-6 bg-purple-50 rounded-lg shadow-inner border border-purple-200">
                <h3 className="text-2xl font-semibold text-purple-800 mb-4">Generate Questions</h3>
                <p className="text-purple-700 mb-6">Create new SAT-style questions via AI and save them to the database.</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                        <label htmlFor="genQuestionSubject" className="block text-sm font-medium text-gray-700 mb-2">Subject:</label>
                        <select
                            id="genQuestionSubject"
                            className="w-full p-2 border border-gray-300 rounded-md"
                            value={generateQuestionSubject}
                            onChange={(e) => {
                                setGenerateQuestionSubject(e.target.value);
                                // Clear passage ID if subject changes from reading
                                if (e.target.value !== 'reading') {
                                    setGenerateQuestionPassageId('');
                                }
                            }}
                            disabled={isGeneratingQuestions}
                        >
                            <option value="math">Math</option>
                            <option value="reading">Reading</option>
                            <option value="writing">Writing & Language</option>
                        </select>
                    </div>
                    <div>
                        <label htmlFor="genQuestionCount" className="block text-sm font-medium text-gray-700 mb-2">Count (max 5):</label>
                        <input
                            type="number"
                            id="genQuestionCount"
                            min="1"
                            max="5"
                            className="w-full p-2 border border-gray-300 rounded-md"
                            value={generateQuestionCount}
                            onChange={(e) => setGenerateQuestionCount(Math.max(1, Math.min(5, parseInt(e.target.value) || 1)))}
                            disabled={isGeneratingQuestions}
                        />
                    </div>
                    <div>
                        <label htmlFor="genQuestionDifficulty" className="block text-sm font-medium text-gray-700 mb-2">Difficulty:</label>
                        <select
                            id="genQuestionDifficulty"
                            className="w-full p-2 border border-gray-300 rounded-md"
                            value={generateQuestionDifficulty}
                            onChange={(e) => setGenerateQuestionDifficulty(e.target.value)}
                            disabled={isGeneratingQuestions}
                        >
                            <option value="easy">Easy</option>
                            <option value="medium">Medium</option>
                            <option value="hard">Hard</option>
                        </select>
                    </div>
                    <div>
                        <label htmlFor="genQuestionType" className="block text-sm font-medium text-gray-700 mb-2">Type (Optional):</label>
                        <input
                            type="text"
                            id="genQuestionType"
                            placeholder="e.g., algebra, grammar, main_idea"
                            className="w-full p-2 border border-gray-300 rounded-md"
                            value={generateQuestionType}
                            onChange={(e) => setGenerateQuestionType(e.target.value)}
                            disabled={isGeneratingQuestions}
                        />
                    </div>
                </div>
                {generateQuestionSubject === 'reading' && (
                    <div className="mb-4">
                        <label htmlFor="genQuestionPassageId" className="block text-sm font-medium text-gray-700 mb-2">Passage ID (Required for Reading Questions):</label>
                        <input
                            type="text"
                            id="genQuestionPassageId"
                            placeholder={lastGeneratedPassageId ? `Last generated: ${lastGeneratedPassageId}` : "Paste passage ID here or leave blank for AI to generate general questions"}
                            className="w-full p-2 border border-gray-300 rounded-md"
                            value={generateQuestionPassageId}
                            onChange={(e) => setGenerateQuestionPassageId(e.target.value)}
                            disabled={isGeneratingQuestions}
                        />
                        {lastGeneratedPassageId && (
                            <button
                                type="button"
                                onClick={() => setGenerateQuestionPassageId(lastGeneratedPassageId)}
                                className="text-sm text-indigo-600 hover:text-indigo-800 mt-1 focus:outline-none"
                            >
                                Use Last Generated Passage ID
                            </button>
                        )}
                        {!lastGeneratedPassageId && generateQuestionSubject === 'reading' && generateQuestionPassageId === '' && (
                            <p className="text-sm text-red-600 mt-1">
                                For reading questions, it is recommended to provide a passage ID.
                            </p>
                        )}
                    </div>
                )}
                <button
                    onClick={handleGenerateQuestions}
                    disabled={isGeneratingQuestions}
                    className="mt-4 bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors duration-200 shadow-md flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed w-full"
                >
                    {isGeneratingQuestions ? (
                        <svg className="animate-spin h-5 w-5 text-white mr-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                    ) : (
                        <>Generate & Save Questions ✨</>
                    )}
                </button>
                {generateQuestionMessage.text && (
                    <p className={`text-sm mt-2 text-center ${generateQuestionMessage.type === 'error' ? 'text-red-600' : 'text-green-600'}`}>
                        {generateQuestionMessage.text}
                    </p>
                )}
            </div>
        </div>
    );
}

export default AdminTools;
