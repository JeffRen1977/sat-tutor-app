import React, { useState, useEffect } from 'react';
import StudyCard from '../components/StudyCard';
import { ArrowLeft, CheckCircle, XCircle } from 'lucide-react';
import { getVocabularyExplanation, getEssayBrainstorming, solveMathProblem } from '../services/aiService';
import { fetchSatQuestions, fetchPassageById, saveTestResult } from '../services/contentService'; // Now using this

function StudyModules({ API_BASE_URL, userToken, userRole }) { // Added userRole prop
    const [vocabularyWord, setVocabularyWord] = useState('');
    const [vocabularyExplanation, setVocabularyExplanation] = useState('');
    const [isLoadingVocab, setIsLoadingVocab] = useState(false);
    const [vocabError, setVocabError] = useState('');

    const [essayTopic, setEssayTopic] = useState('');
    const [essayBrainstorming, setEssayBrainstorming] = useState('');
    const [isLoadingEssay, setIsLoadingEssay] = useState(false);
    const [essayError, setEssayError] = useState('');

    const [mathProblem, setMathProblem] = useState('');
    const [mathSolution, setMathSolution] = useState('');
    const [isLoadingMath, setIsLoadingMath] = useState(false);
    const [mathError, setMathError] = useState('');

    const [questionSubject, setQuestionSubject] = useState('math');
    const [questionType, setQuestionType] = useState('');
    const [questionDifficulty, setQuestionDifficulty] = useState('');
    const [questionCount, setQuestionCount] = useState(1);
    const [fetchedQuestions, setFetchedQuestions] = useState([]);
    const [isLoadingQuestions, setIsLoadingQuestions] = useState(false);
    const [questionFetchError, setQuestionFetchError] = useState('');
    const [fetchedPassage, setFetchedPassage] = useState(null);
    const [isLoadingPassage, setIsLoadingPassage] = useState(false);
    const [passageFetchError, setPassageFetchError] = useState('');

    const [userAnswers, setUserAnswers] = useState({});
    const [resultMessages, setResultMessages] = useState({});

    const [activeStudyView, setActiveStudyView] = useState('main'); // 'main', 'math-main', 'reading-main', 'writing-main'


    const handleFetchSatQuestions = async () => { // Renamed & Service
        if (!userToken) {
            setQuestionFetchError('Authentication required. Please log in to fetch questions.');
            return;
        }
        if (!questionSubject) {
            setQuestionFetchError('Please select a subject to fetch questions.');
            return;
        }
        setIsLoadingQuestions(true);
        setQuestionFetchError('');
        setFetchedQuestions([]);
        setUserAnswers({});
        setResultMessages({});
        setFetchedPassage(null);
        setPassageFetchError('');

        try {
            const response = await fetchSatQuestions(API_BASE_URL, userToken, {
                subject: questionSubject,
                count: questionCount,
                type: questionType,
                difficulty: questionDifficulty
            });

            if (response.status === 401 || response.status === 403) {
                setQuestionFetchError('Authentication required. Please log in to fetch questions.');
                return;
            }

            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.message || 'Failed to fetch questions.');
            }
            setFetchedQuestions(data.questions);

            if (questionSubject === 'reading' && data.questions.length > 0 && data.questions[0].passageId) {
                const firstPassageId = data.questions[0].passageId;
                await handleFetchPassageById(firstPassageId); // Use new handler
            }

        } catch (error) {
            console.error("Error fetching questions:", error);
            setQuestionFetchError(`Error fetching questions: ${error.message || 'Failed to fetch or parse JSON'}`);
        } finally {
            setIsLoadingQuestions(false);
        }
    };

    const handleFetchPassageById = async (passageId) => { // Renamed & Service
        setIsLoadingPassage(true);
        setPassageFetchError('');
        try {
            const response = await fetchPassageById(API_BASE_URL, userToken, passageId);

            if (response.status === 401 || response.status === 403) {
                setPassageFetchError('Authentication required. Please log in to view passage.');
                return;
            }

            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.message || 'Failed to fetch passage.');
            }

            if (data.passages && data.passages.length > 0) {
                setFetchedPassage(data.passages[0]);
            } else {
                setPassageFetchError('Passage not found for the given ID.');
            }
        } catch (error) {
            console.error("Error fetching passage:", error);
            setPassageFetchError(`Error fetching passage: ${error.message || 'Failed to fetch or parse JSON'}`);
        } finally {
            setIsLoadingPassage(false);
        }
    };


    const handleAnswerChange = (questionId, answer) => {
        setUserAnswers(prev => ({ ...prev, [questionId]: answer }));
    };

    const handleSaveTestResult = async (question) => { // Renamed & Service
        if (!userToken) {
            setResultMessages(prev => ({ ...prev, [question.id]: { type: 'error', message: 'Authentication required. Please log in to save result.' } }));
            return;
        }
        const userAnswer = userAnswers[question.id] || '';
        if (!userAnswer.trim()) {
            setResultMessages(prev => ({ ...prev, [question.id]: { type: 'error', message: 'Please provide an answer first.' } }));
            return;
        }

        const isCorrect = userAnswer.toLowerCase().trim() === question.correctAnswer.toLowerCase().trim();

        setResultMessages(prev => ({ ...prev, [question.id]: { type: 'loading', message: 'Saving...' } }));

        try {
            const response = await saveTestResult(API_BASE_URL, userToken, {
                questionId: question.id,
                isCorrect: isCorrect,
                userAnswer: userAnswer,
                selectedOption: question.isMultipleChoice ? userAnswer : null
            });

            if (response.status === 401 || response.status === 403) {
                setResultMessages(prev => ({ ...prev, [question.id]: { type: 'error', message: 'Authentication required to save result.' } }));
                return;
            }

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ message: 'Failed to save result and parse error.' }));
                throw new Error(errorData.message || 'Failed to save result.');
            }
            setResultMessages(prev => ({
                ...prev,
                [question.id]: {
                    type: 'success',
                    message: isCorrect ? 'Correct! Result saved.' : `Incorrect. Result saved. Correct answer: ${question.correctAnswer}`
                }
            }));

        } catch (error) {
            console.error("Error saving test result:", error);
            setResultMessages(prev => ({ ...prev, [question.id]: { type: 'error', message: `Error saving result: ${error.message}` } }));
        }
    };


    const handleGetVocabularyExplanation = async () => { // Renamed
        if (!userToken) {
            setVocabError('Authentication required. Please log in.');
            return;
        }
        if (!vocabularyWord.trim()) {
            setVocabError('Please enter a word to get an explanation.');
            return;
        }
        setIsLoadingVocab(true);
        setVocabError('');
        setVocabularyExplanation('');

        try {
            const response = await getVocabularyExplanation(API_BASE_URL, userToken, vocabularyWord.trim()); // Service call

            if (response.status === 401 || response.status === 403) {
                setVocabError('Authentication required. Please log in.');
                return;
            }

            const result = await response.json(); // Must await here
            if (!response.ok) {
                throw new Error(result.error || 'API request failed');
            }
            setVocabularyExplanation(result.explanation);

        } catch (error) {
            console.error("Error fetching vocabulary explanation:", error);
            setVocabError(`Error fetching vocabulary explanation: ${error.message || 'Failed to fetch or parse JSON'}`);
        } finally {
            setIsLoadingVocab(false);
        }
    };

    const handleGetEssayBrainstorming = async () => { // Renamed
        if (!userToken) {
            setEssayError('Authentication required. Please log in.');
            return;
        }
        if (!essayTopic.trim()) {
            setEssayError('Please enter an essay topic to brainstorm.');
            return;
        }
        setIsLoadingEssay(true);
        setEssayError('');
        setEssayBrainstorming('');

        try {
            const response = await getEssayBrainstorming(API_BASE_URL, userToken, essayTopic.trim()); // Service call

            if (response.status === 401 || response.status === 403) {
                setEssayError('Authentication required. Please log in.');
                return;
            }
            const result = await response.json();
            if (!response.ok) {
                throw new Error(result.error || 'API request failed');
            }
            setEssayBrainstorming(result.brainstormingIdeas);

        } catch (error) {
            console.error("Error fetching essay brainstorming ideas:", error);
            setEssayError(`Error fetching essay brainstorming ideas: ${error.message || 'Failed to fetch or parse JSON'}`);
        } finally {
            setIsLoadingEssay(false);
        }
    };

    const handleSolveMathProblem = async () => { // Renamed
        if (!userToken) {
            setMathError('Authentication required. Please log in.');
            return;
        }
        if (!mathProblem.trim()) {
            setMathError('Please enter a math problem to solve.');
            return;
        }
        setIsLoadingMath(true);
        setMathError('');
        setMathSolution('');

        try {
            const response = await solveMathProblem(API_BASE_URL, userToken, mathProblem.trim()); // Service call

            if (response.status === 401 || response.status === 403) {
                setMathError('Authentication required. Please log in.');
                return;
            }
            const result = await response.json();
            if (!response.ok) {
                throw new Error(result.error || 'API request failed');
            }
            setMathSolution(result.solution);

        } catch (error) {
            console.error("Error solving math problem:", error);
            setMathError(`Error solving math problem: ${error.message || 'Failed to fetch or parse JSON'}`);
        } finally {
            setIsLoadingMath(false);
        }
    };

    const renderStudyContent = () => {
        switch (activeStudyView) {
            case 'main':
                return (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <StudyCard title="Reading" description="Improve your reading comprehension and passage analysis skills." onClick={() => setActiveStudyView('reading-main')} />
                        <StudyCard title="Writing and Language" description="Master grammar, punctuation, and rhetorical skills." onClick={() => setActiveStudyView('writing-main')} />
                        <StudyCard title="Math" description="Review algebra, geometry, data analysis and problem-solving." onClick={() => setActiveStudyView('math-main')} />
                    </div>
                );
            case 'reading-main':
                return (
                    <div className="space-y-6">
                        <button onClick={() => setActiveStudyView('main')} className="bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors duration-200 flex items-center">
                            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Subjects
                        </button>
                        <h3 className="text-2xl font-semibold text-gray-800">Reading Practice</h3>
                        <p className="text-gray-600">Choose a reading focus:</p>

                        {/* Options for Reading: Fetch questions */}
                        <div className="p-6 bg-yellow-50 rounded-lg shadow-inner border border-yellow-200">
                            <h4 className="text-xl font-semibold text-yellow-800 mb-4">Fetch Reading Questions</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                <div>
                                    <label htmlFor="readingQuestionCount" className="block text-sm font-medium text-gray-700 mb-2">Count:</label>
                                    <input
                                        type="number"
                                        id="readingQuestionCount"
                                        min="1"
                                        max="10"
                                        className="w-full p-2 border border-gray-300 rounded-md"
                                        value={questionCount}
                                        onChange={(e) => setQuestionCount(Math.max(1, Math.min(10, parseInt(e.target.value) || 1)))}
                                    />
                                </div>
                                <div>
                                    <label htmlFor="readingQuestionDifficulty" className="block text-sm font-medium text-gray-700 mb-2">Difficulty (Optional):</label>
                                    <select
                                        id="readingQuestionDifficulty"
                                        className="w-full p-2 border border-gray-300 rounded-md"
                                        value={questionDifficulty}
                                        onChange={(e) => setQuestionDifficulty(e.target.value)}
                                    >
                                        <option value="">Any</option>
                                        <option value="easy">Easy</option>
                                        <option value="medium">Medium</option>
                                        <option value="hard">Hard</option>
                                    </select>
                                </div>
                            </div>
                            <button
                                onClick={() => { setQuestionSubject('reading'); handleFetchSatQuestions(); }} // Renamed
                                disabled={isLoadingQuestions}
                                className="bg-yellow-600 text-white px-6 py-3 rounded-lg hover:bg-yellow-700 transition-colors duration-200 shadow-md flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed w-full"
                            >
                                {isLoadingQuestions ? <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg> : 'Fetch Reading Questions ✨'}
                            </button>
                            {questionFetchError && <p className="text-red-600 text-sm mt-2">{questionFetchError}</p>}

                            {/* Display Fetched Passage */}
                            {isLoadingPassage && <p className="text-gray-600 text-center mt-4">Loading passage...</p>}
                            {passageFetchError && <p className="text-red-600 text-sm mt-2 text-center">{passageFetchError}</p>}
                            {fetchedPassage && (
                                <div className="mt-6 p-4 bg-gray-50 rounded-lg shadow-inner border border-gray-200">
                                    <h5 className="text-lg font-semibold text-gray-800 mb-2">{fetchedPassage.title}</h5>
                                    <p className="text-gray-700 whitespace-pre-wrap">{fetchedPassage.text}</p>
                                    <p className="text-gray-500 text-sm mt-2">Genre: {fetchedPassage.genre}, Word Count: {fetchedPassage.wordCount}</p>
                                </div>
                            )}

                            {fetchedQuestions.length > 0 && renderFetchedQuestions()}
                        </div>
                    </div>
                );
            case 'writing-main':
                return (
                    <div className="space-y-6">
                        <button onClick={() => setActiveStudyView('main')} className="bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors duration-200 flex items-center">
                            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Subjects
                        </button>
                        <h3 className="text-2xl font-semibold text-gray-800">Writing & Language Practice</h3>
                        <p className="text-gray-600">Enhance your writing skills with our tools and questions:</p>

                        {/* AI-Powered Essay Brainstormer */}
                        <div className="mt-6 p-6 bg-red-50 rounded-lg shadow-inner border border-red-200">
                            <h4 className="text-xl font-semibold text-red-800 mb-4 flex items-center">
                                ✨ Essay Brainstormer
                            </h4>
                            <p className="text-red-700 mb-6">
                                Enter an essay topic to get brainstorming ideas from our AI.
                            </p>
                            <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 mb-4">
                                <textarea
                                    placeholder="Enter your essay topic, e.g., The role of technology in education"
                                    value={essayTopic}
                                    onChange={(e) => setEssayTopic(e.target.value)}
                                    rows="3"
                                    className="flex-1 p-3 border border-red-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200 resize-y"
                                ></textarea>
                                <button
                                    onClick={handleGetEssayBrainstorming} // Renamed
                                    disabled={isLoadingEssay}
                                    className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-colors duration-200 shadow-md flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isLoadingEssay ? (
                                        <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                    ) : (
                                        <>
                                            Brainstorm Essay ✨
                                        </>
                                    )}
                                </button>
                            </div>
                            {essayError && <p className="text-red-600 text-sm mt-2">{essayError}</p>}
                            {essayBrainstorming && (
                                <div className="mt-6 p-4 bg-white border border-red-200 rounded-lg shadow-sm">
                                    <h4 className="text-lg font-semibold text-gray-800 mb-2">Brainstorming Ideas:</h4>
                                    <p className="text-gray-700 whitespace-pre-wrap">{essayBrainstorming}</p>
                                </div>
                            )}
                        </div>

                        {/* AI-Powered Vocabulary Expansion */}
                        <div className="mt-6 p-6 bg-indigo-50 rounded-lg shadow-inner border border-indigo-200">
                            <h4 className="text-xl font-semibold text-indigo-800 mb-4 flex items-center">
                                ✨ Vocabulary Expander
                            </h4>
                            <p className="text-indigo-700 mb-6">
                                Enter an SAT vocabulary word to get a detailed explanation and example sentences from our AI.
                            </p>
                            <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 mb-4">
                                <input
                                    type="text"
                                    placeholder="Enter a word, e.g., ubiquitous"
                                    value={vocabularyWord}
                                    onChange={(e) => setVocabularyWord(e.target.value)}
                                    className="flex-1 p-3 border border-indigo-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                                    onKeyPress={(e) => {
                                        if (e.key === 'Enter') {
                                            handleGetVocabularyExplanation(); // Renamed
                                        }
                                    }}
                                />
                                <button
                                    onClick={handleGetVocabularyExplanation} // Renamed
                                    disabled={isLoadingVocab}
                                    className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition-colors duration-200 shadow-md flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isLoadingVocab ? (
                                        <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                    ) : (
                                        <>
                                            Get Explanation ✨
                                        </>
                                    )}
                                </button>
                            </div>
                            {vocabError && <p className="text-red-600 text-sm mt-2">{vocabError}</p>}
                            {vocabularyExplanation && (
                                <div className="mt-6 p-4 bg-white border border-indigo-200 rounded-lg shadow-sm">
                                    <h4 className="text-lg font-semibold text-gray-800 mb-2">Explanation:</h4>
                                    <p className="text-gray-700 whitespace-pre-wrap">{vocabularyExplanation}</p>
                                </div>
                            )}
                        </div>

                         {/* Fetch Writing Questions */}
                         <div className="mt-6 p-6 bg-yellow-50 rounded-lg shadow-inner border border-yellow-200">
                            <h4 className="text-xl font-semibold text-yellow-800 mb-4">Fetch Writing Questions</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                <div>
                                    <label htmlFor="writingQuestionType" className="block text-sm font-medium text-gray-700 mb-2">Type (Optional):</label>
                                    <select
                                        id="writingQuestionType"
                                        className="w-full p-2 border border-gray-300 rounded-md"
                                        value={questionType}
                                        onChange={(e) => setQuestionType(e.target.value)}
                                    >
                                        <option value="">Any</option>
                                        <option value="grammar">Grammar</option>
                                        <option value="rhetoric">Rhetoric</option>
                                    </select>
                                </div>
                                <div>
                                    <label htmlFor="writingQuestionCount" className="block text-sm font-medium text-gray-700 mb-2">Count:</label>
                                    <input
                                        type="number"
                                        id="writingQuestionCount"
                                        min="1"
                                        max="10"
                                        className="w-full p-2 border border-gray-300 rounded-md"
                                        value={questionCount}
                                        onChange={(e) => setQuestionCount(Math.max(1, Math.min(10, parseInt(e.target.value) || 1)))}
                                    />
                                </div>
                                <div>
                                    <label htmlFor="writingQuestionDifficulty" className="block text-sm font-medium text-gray-700 mb-2">Difficulty (Optional):</label>
                                    <select
                                        id="writingQuestionDifficulty"
                                        className="w-full p-2 border border-gray-300 rounded-md"
                                        value={questionDifficulty}
                                        onChange={(e) => setQuestionDifficulty(e.target.value)}
                                    >
                                        <option value="">Any</option>
                                        <option value="easy">Easy</option>
                                        <option value="medium">Medium</option>
                                        <option value="hard">Hard</option>
                                    </select>
                                </div>
                            </div>
                            <button
                                onClick={() => { setQuestionSubject('writing'); fetchSatQuestionsInternal(); }} // Renamed
                                disabled={isLoadingQuestions}
                                className="bg-yellow-600 text-white px-6 py-3 rounded-lg hover:bg-yellow-700 transition-colors duration-200 shadow-md flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed w-full"
                            >
                                {isLoadingQuestions ? <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg> : 'Fetch Writing Questions ✨'}
                            </button>
                            {questionFetchError && <p className="text-red-600 text-sm mt-2">{questionFetchError}</p>}
                            {fetchedQuestions.length > 0 && renderFetchedQuestions()}
                        </div>
                    </div>
                );
            case 'math-main':
                return (
                    <div className="space-y-6">
                        <button onClick={() => setActiveStudyView('main')} className="bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors duration-200 flex items-center">
                            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Subjects
                        </button>
                        <h3 className="text-2xl font-semibold text-gray-800">Math Practice</h3>
                        <p className="text-gray-600">Focus on specific math topics or solve problems:</p>

                        {/* AI-Powered Math Problem Solver */}
                        <div className="mt-6 p-6 bg-blue-50 rounded-lg shadow-inner border border-blue-200">
                            <h4 className="text-xl font-semibold text-blue-800 mb-4 flex items-center">
                                ✨ Math Problem Solver
                            </h4>
                            <p className="text-blue-700 mb-6">
                                Enter a math problem to get a step-by-step solution from our AI.
                            </p>
                            <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 mb-4">
                                <input
                                    type="text"
                                    placeholder="Enter a math problem, e.g., If 2x + 3 = 7, what is x?"
                                    value={mathProblem}
                                    onChange={(e) => setMathProblem(e.target.value)}
                                    className="flex-1 p-3 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                                    onKeyPress={(e) => {
                                        if (e.key === 'Enter') {
                                            handleSolveMathProblem(); // Renamed
                                        }
                                    }}
                                />
                                <button
                                    onClick={handleSolveMathProblem} // Renamed
                                    disabled={isLoadingMath}
                                    className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors duration-200 shadow-md flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isLoadingMath ? (
                                        <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                    ) : (
                                        <>
                                            Solve Problem ✨
                                        </>
                                    )}
                                </button>
                            </div>
                            {mathError && <p className="text-red-600 text-sm mt-2">{mathError}</p>}
                            {mathSolution && (
                                <div className="mt-6 p-4 bg-white border border-blue-200 rounded-lg shadow-sm">
                                    <h4 className="text-lg font-semibold text-gray-800 mb-2">Solution:</h4>
                                    <p className="text-gray-700 whitespace-pre-wrap">{mathSolution}</p>
                                </div>
                            )}
                        </div>

                        {/* Fetch Math Questions */}
                        <div className="mt-6 p-6 bg-yellow-50 rounded-lg shadow-inner border border-yellow-200">
                            <h4 className="text-xl font-semibold text-yellow-800 mb-4">Fetch Math Questions</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                <div>
                                    <label htmlFor="mathQuestionType" className="block text-sm font-medium text-gray-700 mb-2">Type (Optional):</label>
                                    <select
                                        id="mathQuestionType"
                                        className="w-full p-2 border border-gray-300 rounded-md"
                                        value={questionType}
                                        onChange={(e) => setQuestionType(e.target.value)}
                                    >
                                        <option value="">Any</option>
                                        <option value="algebra">Algebra</option>
                                        <option value="geometry">Geometry</option>
                                        <option value="data_analysis">Data Analysis</option>
                                        <option value="advanced_math">Advanced Math</option>
                                    </select>
                                </div>
                                <div>
                                    <label htmlFor="mathQuestionCount" className="block text-sm font-medium text-gray-700 mb-2">Count:</label>
                                    <input
                                        type="number"
                                        id="mathQuestionCount"
                                        min="1"
                                        max="10"
                                        className="w-full p-2 border border-gray-300 rounded-md"
                                        value={questionCount}
                                        onChange={(e) => setQuestionCount(Math.max(1, Math.min(10, parseInt(e.target.value) || 1)))}
                                    />
                                </div>
                                <div>
                                    <label htmlFor="mathQuestionDifficulty" className="block text-sm font-medium text-gray-700 mb-2">Difficulty (Optional):</label>
                                    <select
                                        id="mathQuestionDifficulty"
                                        className="w-full p-2 border border-gray-300 rounded-md"
                                        value={questionDifficulty}
                                        onChange={(e) => setQuestionDifficulty(e.target.value)}
                                    >
                                        <option value="">Any</option>
                                        <option value="easy">Easy</option>
                                        <option value="medium">Medium</option>
                                        <option value="hard">Hard</option>
                                    </select>
                                </div>
                            </div>
                            <button
                                onClick={() => { setQuestionSubject('math'); fetchSatQuestionsInternal(); }} // Renamed
                                disabled={isLoadingQuestions}
                                className="bg-yellow-600 text-white px-6 py-3 rounded-lg hover:bg-yellow-700 transition-colors duration-200 shadow-md flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed w-full"
                            >
                                {isLoadingQuestions ? <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg> : 'Fetch Math Questions ✨'}
                            </button>
                            {questionFetchError && <p className="text-red-600 text-sm mt-2">{questionFetchError}</p>}
                            {fetchedQuestions.length > 0 && renderFetchedQuestions()}
                        </div>
                    </div>
                );
            default:
                return null;
        }
    };

    const renderFetchedQuestions = () => (
        <div className="mt-8 space-y-8">
            <h4 className="text-xl font-semibold text-gray-800">Fetched Questions:</h4>
            {fetchedQuestions.map((q, index) => (
                <div key={q.id} className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                    <p className="text-gray-800 font-medium mb-3">
                        {index + 1}. {q.questionText}
                    </p>
                    {q.options && q.options.length > 0 && (
                        <div className="space-y-2 mb-4">
                            {q.options.map((option, optIndex) => (
                                <label key={optIndex} className="block text-gray-700">
                                    <input
                                        type="radio"
                                        name={`question-${q.id}`}
                                        value={String.fromCharCode(65 + optIndex)}
                                        checked={userAnswers[q.id] === String.fromCharCode(65 + optIndex)}
                                        onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                                        className="mr-2"
                                    />
                                    {String.fromCharCode(65 + optIndex)}. {option}
                                </label>
                            ))}
                        </div>
                    )}
                    {!q.isMultipleChoice && (
                        <input
                            type="text"
                            placeholder="Your answer (e.g., 5, or 'x=2')"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                            value={userAnswers[q.id] || ''}
                            onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                        />
                    )}
                    <div className="mt-4 flex items-center space-x-2">
                        <button
                            onClick={() => handleSaveTestResult(q)} // Renamed
                                onClick={() => { setQuestionSubject('writing'); handleFetchSatQuestions(); }} // Renamed
                                onClick={() => { setQuestionSubject('math'); handleFetchSatQuestions(); }} // Renamed
                            className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 text-sm shadow-md flex items-center disabled:opacity-50"
                            disabled={resultMessages[q.id]?.type === 'loading'}
                        >
                            {resultMessages[q.id]?.type === 'loading' ? (
                                <svg className="animate-spin h-4 w-4 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                            ) : (
                                'Save Result'
                            )}
                        </button>
                        {resultMessages[q.id] && resultMessages[q.id].type === 'success' && (
                            <span className="text-green-700 text-sm flex items-center">
                                <CheckCircle className="w-4 h-4 mr-1" /> {resultMessages[q.id].message}
                            </span>
                        )}
                        {resultMessages[q.id] && resultMessages[q.id].type === 'error' && (
                            <span className="text-red-700 text-sm flex items-center">
                                <XCircle className="w-4 h-4 mr-1" /> {resultMessages[q.id].message}
                            </span>
                        )}
                    </div>
                    {resultMessages[q.id]?.type === 'success' && !resultMessages[q.id].message.includes('Correct!') && (
                        <div className="mt-2 text-sm text-gray-600">
                            <p><strong>Explanation:</strong> {q.explanation}</p>
                        </div>
                    )}
                </div>
            ))}
        </div>
    );

    return (
        <div className="p-6 bg-white rounded-lg shadow-md">
            <h2 className="text-3xl font-bold text-gray-800 mb-6">Study Modules</h2>
            <p className="text-gray-600 mb-8">Select an SAT subject to start your learning.</p>

            {renderStudyContent()}

        </div>
    );
}

export default StudyModules;
