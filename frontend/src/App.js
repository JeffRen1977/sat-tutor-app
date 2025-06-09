import React, { useState, useEffect, useRef } from 'react';
import { Home, BookOpen, FileText, TrendingUp, MessageSquare, Settings, Menu, X, Sparkles, LogOut, CheckCircle, XCircle, ArrowLeft } from 'lucide-react';

// Define the base URL for your backend API
const API_BASE_URL = 'http://localhost:3001/api';

// --- Shared Components (Function Declarations - No internal exports) ---
// These components are designed to be used only within this App.js scope
function NavItem({ icon, text, page, setCurrentPage, currentPage, onClick }) {
    return (
        <button
            onClick={() => { setCurrentPage(page); if(onClick) onClick(); }}
            className={`flex items-center w-full px-4 py-3 my-2 rounded-lg text-left transition-colors duration-200 ${
                currentPage === page
                    ? 'bg-indigo-100 text-indigo-700 font-semibold shadow-sm'
                    : 'text-gray-700 hover:bg-gray-100 hover:text-indigo-600'
            }`}
        >
            {React.cloneElement(icon, { className: "w-5 h-5 mr-3" })}
            <span className="text-lg">{text}</span>
        </button>
    );
}

function Card({ title, description }) {
    return (
        <div className="bg-indigo-50 p-6 rounded-lg shadow-sm border border-indigo-100 flex flex-col justify-between">
            <h3 className="text-xl font-semibold text-indigo-800 mb-3">{title}</h3>
            <p className="text-indigo-700">{description}</p>
            <button className="mt-4 self-start bg-indigo-200 text-indigo-800 px-4 py-2 rounded-full text-sm font-medium hover:bg-indigo-300 transition-colors duration-200">
                View Details
            </button>
        </div>
    );
}

function StudyCard({ title, description, onClick }) {
    return (
        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
            <h3 className="text-xl font-semibold text-gray-800 mb-3">{title}</h3>
            <p className="text-gray-600 mb-4">{description}</p>
            <button
                onClick={onClick}
                className="bg-indigo-500 text-white px-5 py-2 rounded-lg hover:bg-indigo-600 transition-colors duration-200 shadow-md"
            >
                Start Learning
            </button>
        </div>
    );
}

function TestCard({ title, description }) {
    return (
        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
            <h3 className="text-xl font-semibold text-gray-800 mb-3">{title}</h3>
            <p className="text-gray-600 mb-4">{description}</p>
            <button className="bg-green-500 text-white px-5 py-2 rounded-lg hover:bg-green-600 transition-colors duration-200 shadow-md">
                Start Test
            </button>
        </div>
    );
}

function QuickLink({ text }) {
    return (
        <button className="bg-gray-100 text-gray-700 px-4 py-3 rounded-lg hover:bg-gray-200 transition-colors duration-200 shadow-sm text-center font-medium">
            {text}
        </button>
    );
}

function ProgressChart({ title }) {
    return (
        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
            <h3 className="text-xl font-semibold text-gray-800 mb-3">{title}</h3>
            <div className="h-40 bg-gray-200 flex items-center justify-center rounded-md text-gray-500 text-sm">
                [Chart Placeholder]
            </div>
            <p className="text-gray-600 text-sm mt-3">Detailed data analysis will be displayed here.</p>
        </div>
    );
}

// --- Auth Components (Function Declarations - No internal exports) ---
function LoginPage({ onLoginSuccess, onNavigateToRegister, API_BASE_URL }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            const response = await fetch(`${API_BASE_URL}/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password }),
            });

            const data = await response.json();

            if (response.ok) {
                onLoginSuccess(data.token, data.email);
            } else {
                setError(data.message || 'Login failed. Please try again.');
            }
        } catch (err) {
            console.error('Login request failed:', err);
            setError('Network error. Please try again later.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
                <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">Login to SAT Tutor</h2>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                            Email Address
                        </label>
                        <input
                            type="email"
                            id="email"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 transition duration-200"
                            placeholder="your.email@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            disabled={isLoading}
                        />
                    </div>
                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                            Password
                        </label>
                        <input
                            type="password"
                            id="password"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 transition duration-200"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            disabled={isLoading}
                        />
                    </div>
                    {error && (
                        <p className="text-red-600 text-sm text-center">{error}</p>
                    )}
                    <button
                        type="submit"
                        className="w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 transition duration-200 shadow-md flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                        ) : (
                            'Login'
                        )}
                    </button>
                </form>
                <p className="mt-6 text-center text-gray-600">
                    Don't have an account?{' '}
                    <button
                        onClick={onNavigateToRegister}
                        className="text-indigo-600 hover:text-indigo-800 font-medium focus:outline-none"
                    >
                        Register here
                    </button>
                </p>
            </div>
        </div>
    );
}

function RegisterPage({ onRegisterSuccess, API_BASE_URL }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccessMessage('');
        setIsLoading(true);

        if (password !== confirmPassword) {
            setError('Passwords do not match.');
            setIsLoading(false);
            return;
        }

        try {
            const response = await fetch(`${API_BASE_URL}/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password }),
            });

            const data = await response.json();

            if (response.ok) {
                setSuccessMessage(data.message || 'Registration successful! You can now log in.');
                setEmail('');
                setPassword('');
                setConfirmPassword('');
                setTimeout(onRegisterSuccess, 2000);
            } else {
                setError(data.message || 'Registration failed. Please try again.');
            }
        } catch (err) {
            console.error('Registration request failed:', err);
            setError('Network error. Please try again later.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
                <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">Register for SAT Tutor</h2>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                            Email Address
                        </label>
                        <input
                            type="email"
                            id="email"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 transition duration-200"
                            placeholder="your.email@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            disabled={isLoading}
                        />
                    </div>
                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                            Password
                        </label>
                        <input
                            type="password"
                            id="password"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 transition duration-200"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            disabled={isLoading}
                        />
                    </div>
                    <div>
                        <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                            Confirm Password
                        </label>
                        <input
                            type="password"
                            id="confirmPassword"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 transition duration-200"
                            placeholder="••••••••"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                            disabled={isLoading}
                        />
                    </div>
                    {error && (
                        <p className="text-red-600 text-sm text-center">{error}</p>
                    )}
                    {successMessage && (
                        <p className="text-green-600 text-sm text-center">{successMessage}</p>
                    )}
                    <button
                        type="submit"
                        className="w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 transition duration-200 shadow-md flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                        ) : (
                            'Register'
                        )}
                    </button>
                </form>
                <p className="mt-6 text-center text-gray-600">
                    Already have an account?{' '}
                    <button
                        onClick={onRegisterSuccess}
                        className="text-indigo-600 hover:text-indigo-800 font-medium focus:outline-none"
                        disabled={isLoading}
                    >
                        Login here
                    </button>
                </p>
            </div>
        </div>
    );
}

// --- Page Components (Function Declarations - No internal exports) ---
function Dashboard({ userEmail }) {
    return (
        <div className="p-6 bg-white rounded-lg shadow-md">
            <h2 className="text-3xl font-bold text-gray-800 mb-6">Welcome back, {userEmail || 'Student'}!</h2>
            <p className="text-gray-600 mb-8">This is your study dashboard. Here you can see an overview of your progress.</p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <Card title="Latest Scores" description="Last Practice Test: Math 680, Reading 650" />
                <Card title="Today's Tasks" description="Complete 20 grammar practice questions" />
                <Card title="Vocabulary Review" description="15 words to review today" />
            </div>

            <div className="mt-8">
                <h3 className="text-2xl font-semibold text-gray-800 mb-4">Quick Links</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <QuickLink text="Start a New Practice" />
                    <QuickLink text="Browse Study Materials" />
                    <QuickLink text="View My Reports" />
                    <QuickLink text="Chat with AI Tutor" />
                </div>
            </div>
        </div>
    );
}

function StudyModules({ API_BASE_URL, userToken }) {
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

    const [userAnswers, setUserAnswers] = useState({});
    const [resultMessages, setResultMessages] = useState({});

    const [activeStudyView, setActiveStudyView] = useState('main');


    const fetchSatQuestions = async () => {
        if (!questionSubject) {
            setQuestionFetchError('Please select a subject to fetch questions.');
            return;
        }
        setIsLoadingQuestions(true);
        setQuestionFetchError('');
        setFetchedQuestions([]);
        setUserAnswers({});
        setResultMessages({});

        try {
            let url = `${API_BASE_URL}/questions/fetch?subject=${questionSubject}&count=${questionCount}`;
            if (questionType) url += `&type=${questionType}`;
            if (questionDifficulty) url += `&difficulty=${questionDifficulty}`;

            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${userToken}`
                },
            });

            if (response.status === 401 || response.status === 403) {
                setQuestionFetchError('Authentication required. Please log in to fetch questions.');
                return;
            }

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to fetch questions.');
            }

            const data = await response.json();
            setFetchedQuestions(data.questions);

        } catch (error) {
            console.error("Error fetching questions:", error);
            setQuestionFetchError(`Error fetching questions: ${error.message}`);
        } finally {
            setIsLoadingQuestions(false);
        }
    };

    const handleAnswerChange = (questionId, answer) => {
        setUserAnswers(prev => ({ ...prev, [questionId]: answer }));
    };

    const saveTestResult = async (question) => {
        const userAnswer = userAnswers[question.id] || '';
        if (!userAnswer.trim()) {
            setResultMessages(prev => ({ ...prev, [question.id]: { type: 'error', message: 'Please provide an answer first.' } }));
            return;
        }

        const isCorrect = userAnswer.toLowerCase().trim() === question.correctAnswer.toLowerCase().trim();

        setResultMessages(prev => ({ ...prev, [question.id]: { type: 'loading', message: 'Saving...' } }));

        try {
            const response = await fetch(`${API_BASE_URL}/test_results/save`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${userToken}`
                },
                body: JSON.stringify({
                    questionId: question.id,
                    isCorrect: isCorrect,
                    userAnswer: userAnswer,
                    selectedOption: question.isMultipleChoice ? userAnswer : null
                }),
            });

            if (response.status === 401 || response.status === 403) {
                setResultMessages(prev => ({ ...prev, [question.id]: { type: 'error', message: 'Authentication required to save result.' } }));
                return;
            }

            if (!response.ok) {
                const errorData = await response.json();
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


    const getVocabularyExplanation = async () => {
        if (!vocabularyWord.trim()) {
            setVocabError('Please enter a word to get an explanation.');
            return;
        }
        setIsLoadingVocab(true);
        setVocabError('');
        setVocabularyExplanation('');

        try {
            const response = await fetch(`${API_BASE_URL}/vocabulary`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${userToken}`
                },
                body: JSON.stringify({ word: vocabularyWord.trim() })
            });

            if (response.status === 401 || response.status === 403) {
                setVocabError('Authentication required. Please log in.');
                return;
            }

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'API request failed');
            }

            const result = await response.json();
            setVocabularyExplanation(result.explanation);

        } catch (error) {
            console.error("Error fetching vocabulary explanation:", error);
            setVocabError(`Error fetching vocabulary explanation: ${error.message}`);
        } finally {
            setIsLoadingVocab(false);
        }
    };

    const getEssayBrainstorming = async () => {
        if (!essayTopic.trim()) {
            setEssayError('Please enter an essay topic to brainstorm.');
            return;
        }
        setIsLoadingEssay(true);
        setEssayError('');
        setEssayBrainstorming('');

        try {
            const response = await fetch(`${API_BASE_URL}/essay-brainstorm`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${userToken}`
                },
                body: JSON.stringify({ topic: essayTopic.trim() })
            });

            if (response.status === 401 || response.status === 403) {
                setEssayError('Authentication required. Please log in.');
                return;
            }

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'API request failed');
            }

            const result = await response.json();
            setEssayBrainstorming(result.brainstormingIdeas);

        } catch (error) {
            console.error("Error fetching essay brainstorming ideas:", error);
            setEssayError(`Error fetching essay brainstorming ideas: ${error.message}`);
        } finally {
            setIsLoadingEssay(false);
        }
    };

    const solveMathProblem = async () => {
        if (!mathProblem.trim()) {
            setMathError('Please enter a math problem to solve.');
            return;
        }
        setIsLoadingMath(true);
        setMathError('');
        setMathSolution('');

        try {
            const response = await fetch(`${API_BASE_URL}/math-solver`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${userToken}`
                },
                body: JSON.stringify({ problem: mathProblem.trim() })
            });

            if (response.status === 401 || response.status === 403) {
                setMathError('Authentication required. Please log in.');
                return;
            }

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'API request failed');
            }

            const result = await response.json();
            setMathSolution(result.solution);

        } catch (error) {
            console.error("Error solving math problem:", error);
            setMathError(`Error solving math problem: ${error.message}`);
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
                                onClick={() => { setQuestionSubject('reading'); fetchSatQuestions(); }}
                                disabled={isLoadingQuestions}
                                className="bg-yellow-600 text-white px-6 py-3 rounded-lg hover:bg-yellow-700 transition-colors duration-200 shadow-md flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed w-full"
                            >
                                {isLoadingQuestions ? <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg> : 'Fetch Reading Questions ✨'}
                            </button>
                            {questionFetchError && <p className="text-red-600 text-sm mt-2">{questionFetchError}</p>}
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
                                    onClick={getEssayBrainstorming}
                                    disabled={isLoadingEssay}
                                    className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-colors duration-200 shadow-md flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isLoadingEssay ? (
                                        <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
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
                                            getVocabularyExplanation();
                                        }
                                    }}
                                />
                                <button
                                    onClick={getVocabularyExplanation}
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
                                onClick={() => { setQuestionSubject('writing'); fetchSatQuestions(); }}
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
                                            solveMathProblem();
                                        }
                                    }}
                                />
                                <button
                                    onClick={solveMathProblem}
                                    disabled={isLoadingMath}
                                    className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors duration-200 shadow-md flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isLoadingMath ? (
                                        <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
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
                                onClick={() => { setQuestionSubject('math'); fetchSatQuestions(); }}
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
                            onClick={() => saveTestResult(q)}
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

function PracticeTests() {
    return (
        <div className="p-6 bg-white rounded-lg shadow-md">
            <h2 className="text-3xl font-bold text-gray-800 mb-6">Practice Tests</h2>
            <p className="text-gray-600 mb-8">Take full-length simulated tests or section-wise quizzes to assess your knowledge.</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <TestCard title="Full-Length Practice Test 1" description="Simulate the real SAT exam experience, covering all subjects." />
                <TestCard title="Math Section Test" description="Focus on practicing and improving your math skills." />
                <TestCard title="Reading Section Test" description="Practice reading comprehension and passage analysis specifically." />
                <TestCard title="Writing and Language Section Test" description="Improve your grammar and writing skills." />
            </div>
        </div>
    );
}

function ProgressTracking() {
    return (
        <div className="p-6 bg-white rounded-lg shadow-md">
            <h2 className="text-3xl font-bold text-gray-800 mb-6">Progress Tracking</h2>
            <p className="text-gray-600 mb-8">View your study performance and historical scores.</p>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <ProgressChart title="Math Score Trend" />
                <ProgressChart title="Reading Score Trend" />
                <ProgressChart title="Completed Modules" />
                <ProgressChart title="Vocabulary Mastery" />
            </div>
        </div>
    );
}

function AIChat({ API_BASE_URL, userToken }) {
    const [chatHistory, setChatHistory] = useState([
        { role: 'model', text: 'Hello! I am your AI SAT tutor. How can I help you today?' }
    ]);
    const [currentMessage, setCurrentMessage] = useState('');
    const [isLoadingChat, setIsLoadingChat] = useState(false);
    const [chatError, setChatError] = useState('');
    const chatContainerRef = useRef(null);

    useEffect(() => {
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
    }, [chatHistory]);

    const handleSendMessage = async () => {
        if (!currentMessage.trim()) return;

        const userMessage = { role: 'user', text: currentMessage.trim() };
        setChatHistory((prev) => [...prev, userMessage]);
        setCurrentMessage('');
        setIsLoadingChat(true);
        setChatError('');

        try {
            const response = await fetch(`${API_BASE_URL}/chat`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${userToken}`
                },
                body: JSON.stringify({ chatHistory: [...chatHistory, userMessage] })
            });

            if (response.status === 401 || response.status === 403) {
                setChatError('Authentication required. Please log in to use the AI chat.');
                setChatHistory((prev) => [...prev, { role: 'model', text: 'Authentication required. Please log in to continue this conversation.' }]);
                return;
            }

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'API request failed');
            }

            const result = await response.json();
            const modelResponseText = result.text;
            setChatHistory((prev) => [...prev, { role: 'model', text: modelResponseText }]);
        } catch (error) {
            console.error("Error fetching AI chat response:", error);
            setChatError(`Error communicating with AI tutor: ${error.message}`);
            setChatHistory((prev) => [...prev, { role: 'model', text: 'Sorry, I cannot respond at the moment. Please try again later.' }]);
        } finally {
            setIsLoadingChat(false);
        }
    };

    return (
        <div className="p-6 bg-white rounded-lg shadow-md flex flex-col h-full">
            <h2 className="text-3xl font-bold text-gray-800 mb-6">AI Tutoring Chat</h2>
            <p className="text-gray-600 mb-8">Interact with your AI tutor, ask your questions, and get instant answers and explanations.</p>
            <div className="text-red-600 text-sm mb-4">{chatError}</div>
            <div ref={chatContainerRef} className="flex-1 border border-gray-300 rounded-lg p-4 mb-4 overflow-y-auto bg-gray-50 flex flex-col">
                {chatHistory.map((message, index) => (
                    <div key={index} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'} mb-2`}>
                        <div className={`rounded-lg p-3 max-w-xs md:max-w-md shadow ${
                            message.role === 'user'
                                ? 'bg-indigo-500 text-white rounded-bl-lg rounded-tl-lg rounded-tr-lg'
                                : 'bg-blue-100 text-blue-800 rounded-tl-lg rounded-br-lg rounded-tr-lg'
                        }`}>
                            {message.text}
                        </div>
                    </div>
                ))}
                {isLoadingChat && (
                    <div className="flex justify-start mb-2">
                        <div className="bg-blue-100 text-blue-800 rounded-lg p-3 max-w-xs md:max-w-md shadow flex items-center">
                            <svg className="animate-spin h-5 w-5 mr-3 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Thinking...
                        </div>
                    </div>
                )}
            </div>
            <div className="flex space-x-3">
                <input
                    type="text"
                    placeholder="Type your question here..."
                    value={currentMessage}
                    onChange={(e) => setCurrentMessage(e.target.value)}
                    onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                            handleSendMessage();
                        }
                    }}
                    className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                    disabled={isLoadingChat}
                />
                <button
                    onClick={handleSendMessage}
                    className="bg-indigo-500 text-white px-6 py-3 rounded-lg hover:bg-indigo-600 transition-colors duration-200 shadow-md flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={isLoadingChat}
                >
                    Send
                </button>
            </div>
        </div>
    );
}

function SettingsPage() {
    return (
        <div className="p-6 bg-white rounded-lg shadow-md">
            <h2 className="text-3xl font-bold text-gray-800 mb-6">Settings</h2>
            <p className="text-gray-600 mb-8">Manage your account preferences and application settings here.</p>

            <div className="space-y-6">
                <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg bg-gray-50">
                    <label htmlFor="notifications" className="text-lg font-medium text-gray-700">Enable Notifications</label>
                    <input type="checkbox" id="notifications" className="form-checkbox h-5 w-5 text-indigo-600 rounded-md focus:ring-indigo-500" />
                </div>
                <div className="p-4 border border-gray-200 rounded-lg bg-gray-50">
                    <label htmlFor="email" className="block text-lg font-medium text-gray-700 mb-2">Email Address</label>
                    <input type="email" id="email" defaultValue="user@example.com" className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200" />
                </div>
                <div className="p-4 border border-gray-200 rounded-lg bg-gray-50">
                    <label htmlFor="theme" className="block text-lg font-medium text-gray-700 mb-2">Theme</label>
                    <select id="theme" className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200">
                        <option>Light</option>
                        <option>Dark</option>
                    </select>
                </div>
                <button className="bg-green-500 text-white px-6 py-3 rounded-lg hover:bg-green-600 transition-colors duration-200 shadow-md">
                    Save Settings
                </button>
            </div>
        </div>
    );
}

// --- Main App Component ---
function App() {
    const [currentPage, setCurrentPage] = useState('login');
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [userEmail, setUserEmail] = useState(null);
    const [userToken, setUserToken] = useState(localStorage.getItem('satTutorToken') || null);

    useEffect(() => {
        if (userToken) {
            setIsAuthenticated(true);
            try {
                const base64Url = userToken.split('.')[1];
                const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
                const decodedToken = JSON.parse(window.atob(base64));
                setUserEmail(decodedToken.email || "Authenticated User");
            } catch (e) {
                console.error("Error decoding token:", e);
                setUserEmail("Authenticated User");
            }
            setCurrentPage('dashboard');
        } else {
            setIsAuthenticated(false);
            setUserEmail(null);
            setCurrentPage('login');
        }
    }, [userToken]);

    const handleLogin = (token, email) => {
        localStorage.setItem('satTutorToken', token);
        setUserToken(token);
        setUserEmail(email);
    };

    const handleLogout = () => {
        localStorage.removeItem('satTutorToken');
        setUserToken(null);
        setIsAuthenticated(false);
        setUserEmail(null);
    };

    const navigateToRegister = () => {
        setCurrentPage('register');
    };

    const navigateToLoginAfterRegister = () => {
        setCurrentPage('login');
    };

    const renderPage = () => {
        if (!isAuthenticated) {
            if (currentPage === 'register') {
                return <RegisterPage onRegisterSuccess={navigateToLoginAfterRegister} API_BASE_URL={API_BASE_URL} />;
            }
            return <LoginPage onLoginSuccess={handleLogin} onNavigateToRegister={navigateToRegister} API_BASE_URL={API_BASE_URL} />;
        }

        switch (currentPage) {
            case 'dashboard':
                return <Dashboard userEmail={userEmail} />;
            case 'study':
                return <StudyModules API_BASE_URL={API_BASE_URL} userToken={userToken} />;
            case 'practice':
                return <PracticeTests />;
            case 'progress':
                return <ProgressTracking />;
            case 'ai-chat':
                return <AIChat API_BASE_URL={API_BASE_URL} userToken={userToken} />;
            case 'settings':
                return <SettingsPage />;
            default:
                return <Dashboard userEmail={userEmail} />;
        }
    };

    return (
        <div className="flex h-screen bg-gray-100 font-inter">
            {isAuthenticated && (
                <>
                    <aside className={`bg-white shadow-lg w-64 p-6 hidden md:block transition-all duration-300 ease-in-out`}>
                        <div className="text-2xl font-bold text-indigo-700 mb-10 flex items-center">
                            <img src="https://placehold.co/40x40/6366F1/FFFFFF?text=SAT" alt="SAT Logo" className="mr-3 rounded-md" />
                            SAT Tutor
                        </div>
                        <nav>
                            <NavItem icon={<Home />} text="Dashboard" page="dashboard" setCurrentPage={setCurrentPage} currentPage={currentPage} />
                            <NavItem icon={<BookOpen />} text="Study Modules" page="study" setCurrentPage={setCurrentPage} currentPage={currentPage} />
                            <NavItem icon={<FileText />} text="Practice Tests" page="practice" setCurrentPage={setCurrentPage} currentPage={currentPage} />
                            <NavItem icon={<TrendingUp />} text="Progress Tracking" page="progress" setCurrentPage={setCurrentPage} currentPage={currentPage} />
                            <NavItem icon={<MessageSquare />} text="AI Tutoring Chat" page="ai-chat" setCurrentPage={setCurrentPage} currentPage={currentPage} />
                            <NavItem icon={<Settings />} text="Settings" page="settings" setCurrentPage={setCurrentPage} currentPage={currentPage} />
                        </nav>
                    </aside>

                    {isSidebarOpen && (
                        <div
                            className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
                            onClick={() => setIsSidebarOpen(false)}
                        ></div>
                    )}

                    <div className={`fixed top-0 left-0 h-full bg-white shadow-lg w-64 p-6 z-50 md:hidden transform transition-transform duration-300 ease-in-out ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                        <div className="flex justify-between items-center mb-10">
                            <div className="text-2xl font-bold text-indigo-700 flex items-center">
                                <img src="https://placehold.co/40x40/6366F1/FFFFFF?text=SAT" alt="SAT Logo" className="mr-3 rounded-md" />
                                SAT Tutor
                            </div>
                            <button onClick={() => setIsSidebarOpen(false)} className="text-gray-600 hover:text-gray-900 focus:outline-none">
                                <X className="w-6 h-6" />
                            </button>
                        </div>
                        <nav>
                            <NavItem icon={<Home />} text="Dashboard" page="dashboard" setCurrentPage={setCurrentPage} currentPage={currentPage} onClick={() => setIsSidebarOpen(false)} />
                            <NavItem icon={<BookOpen />} text="Study Modules" page="study" setCurrentPage={setCurrentPage} currentPage={currentPage} onClick={() => setIsSidebarOpen(false)} />
                            <NavItem icon={<FileText />} text="Practice Tests" page="practice" setCurrentPage={setCurrentPage} currentPage={currentPage} onClick={() => setIsSidebarOpen(false)} />
                            <NavItem icon={<TrendingUp />} text="Progress Tracking" page="progress" setCurrentPage={setCurrentPage} currentPage={currentPage} onClick={() => setIsSidebarOpen(false)} />
                            <NavItem icon={<MessageSquare />} text="AI Tutoring Chat" page="ai-chat" setCurrentPage={setCurrentPage} currentPage={currentPage} onClick={() => setIsSidebarOpen(false)} />
                            <NavItem icon={<Settings />} text="Settings" page="settings" setCurrentPage={setCurrentPage} currentPage={currentPage} onClick={() => setIsSidebarOpen(false)} />
                        </nav>
                    </div>
                </>
            )}

            <div className="flex-1 flex flex-col overflow-hidden">
                <header className="flex items-center justify-between p-4 bg-white shadow-md md:px-6">
                    {isAuthenticated ? (
                        <>
                            {/* Content when authenticated */}
                            <button onClick={() => setIsSidebarOpen(true)} className="md:hidden text-gray-600 hover:text-gray-900 focus:outline-none">
                                <Menu className="w-6 h-6" />
                            </button>
                            <h1 className="text-2xl font-semibold text-gray-800 hidden md:block">SAT Study Assistant</h1>
                            <div className="flex items-center space-x-4">
                                <span className="text-gray-700 hidden sm:block">Welcome, {userEmail}!</span>
                                <button
                                    onClick={handleLogout}
                                    className="bg-indigo-500 text-white px-4 py-2 rounded-lg hover:bg-indigo-600 transition-colors duration-200 shadow-md flex items-center"
                                >
                                    <LogOut className="w-4 h-4 mr-2" /> Log Out
                                </button>
                            </div>
                        </>
                    ) : (
                        <>
                            {/* Content when not authenticated (Login/Register buttons) */}
                            <h1 className="text-2xl font-semibold text-gray-800 block">SAT Study Assistant</h1> {/* Added a default title for unauthenticated view */}
                            <div className="flex items-center space-x-4">
                                {currentPage === 'register' && (
                                    <button
                                        onClick={navigateToLoginAfterRegister}
                                        className="bg-indigo-500 text-white px-4 py-2 rounded-lg hover:bg-indigo-600 transition-colors duration-200 shadow-md"
                                    >
                                        Back to Login
                                    </button>
                                )}
                                {currentPage === 'login' && (
                                    <button
                                        onClick={navigateToRegister}
                                        className="bg-gray-300 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-400 transition-colors duration-200 shadow-md"
                                    >
                                        Register
                                    </button>
                                )}
                            </div>
                        </>
                    )}
                </header>
                <main className="flex-1 overflow-y-auto p-4 md:p-6">
                    {renderPage()}
                </main>
            </div>
        </div>
    );
}

export default App;
