import React, { useState, useEffect, useRef } from 'react';
import { Home, BookOpen, FileText, TrendingUp, MessageSquare, Settings, Menu, X, Sparkles, LogOut, CheckCircle, XCircle, ArrowLeft, PlusCircle, ThumbsUp, ThumbsDown } from 'lucide-react';

// Define the base URL for your backend API
const API_BASE_URL = 'http://localhost:3001/api';

// --- Shared Components (Function Declarations - No internal exports) ---
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

function TestCard({ title, description, onStart }) {
    return (
        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
            <h3 className="text-xl font-semibold text-gray-800 mb-3">{title}</h3>
            <p className="text-gray-600 mb-4">{description}</p>
            <button 
                onClick={onStart}
                className="bg-green-500 text-white px-5 py-2 rounded-lg hover:bg-green-600 transition-colors duration-200 shadow-md">
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
        <div className="p-6 bg-white rounded-lg shadow-md border border-gray-200">
            <h3 className="text-xl font-semibold text-gray-800 mb-3">{title}</h3>
            <div className="h-40 bg-gray-200 flex items-center justify-center rounded-md text-gray-500 text-sm">
                [Chart Placeholder]
            </div>
            <p className="text-gray-600 text-sm mt-3">Detailed data analysis will be displayed here.</p>
        </div>
    );
}

// --- Auth Components ---
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
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });
            const data = await response.json();
            if (response.ok) {
                onLoginSuccess(data.token, data.email, data.role);
            } else {
                setError(data.message || 'Login failed.');
            }
        } catch (err) {
            setError('Network error.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
                <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">Login</h2>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                        <input type="email" value={email} onChange={e => setEmail(e.target.value)} required className="w-full px-4 py-2 border rounded-lg focus:ring-indigo-500 focus:border-indigo-500"/>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
                        <input type="password" value={password} onChange={e => setPassword(e.target.value)} required className="w-full px-4 py-2 border rounded-lg focus:ring-indigo-500 focus:border-indigo-500"/>
                    </div>
                    {error && <p className="text-red-600 text-sm text-center">{error}</p>}
                    <button type="submit" disabled={isLoading} className="w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 disabled:opacity-50">
                        {isLoading ? 'Logging in...' : 'Login'}
                    </button>
                </form>
                <p className="mt-6 text-center">Don't have an account? <button onClick={onNavigateToRegister} className="text-indigo-600 hover:text-indigo-800">Register here</button></p>
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
        if (password !== confirmPassword) {
            setError("Passwords do not match.");
            return;
        }
        setError('');
        setIsLoading(true);
        try {
            const response = await fetch(`${API_BASE_URL}/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });
            const data = await response.json();
            if (response.ok) {
                setSuccessMessage('Registration successful! Redirecting to login...');
                setTimeout(onRegisterSuccess, 2000);
            } else {
                setError(data.message || 'Registration failed.');
            }
        } catch (err) {
            setError('Network error.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
                <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">Register</h2>
                <form onSubmit={handleSubmit} className="space-y-6">
                     <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                        <input type="email" value={email} onChange={e => setEmail(e.target.value)} required className="w-full px-4 py-2 border rounded-lg focus:ring-indigo-500 focus:border-indigo-500"/>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
                        <input type="password" value={password} onChange={e => setPassword(e.target.value)} required className="w-full px-4 py-2 border rounded-lg focus:ring-indigo-500 focus:border-indigo-500"/>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Confirm Password</label>
                        <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required className="w-full px-4 py-2 border rounded-lg focus:ring-indigo-500 focus:border-indigo-500"/>
                    </div>
                    {error && <p className="text-red-600 text-sm text-center">{error}</p>}
                    {successMessage && <p className="text-green-600 text-sm text-center">{successMessage}</p>}
                    <button type="submit" disabled={isLoading} className="w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 disabled:opacity-50">
                        {isLoading ? 'Registering...' : 'Register'}
                    </button>
                </form>
                <p className="mt-6 text-center">Already have an account? <button onClick={onRegisterSuccess} className="text-indigo-600 hover:text-indigo-800">Login here</button></p>
            </div>
        </div>
    );
}

// --- Page Components ---
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
    const [fetchedQuestions, setFetchedQuestions] = useState([]);
    const [isLoadingQuestions, setIsLoadingQuestions] = useState(false);
    const [questionFetchError, setQuestionFetchError] = useState('');
    const [fetchedPassage, setFetchedPassage] = useState(null);
    const [isLoadingPassage, setIsLoadingPassage] = useState(false);
    const [passageFetchError, setPassageFetchError] = useState('');
    const [userAnswers, setUserAnswers] = useState({});
    const [resultMessages, setResultMessages] = useState({});
    const [activeStudyView, setActiveStudyView] = useState('main');

    const resetPracticeState = () => {
        setIsLoadingPassage(false);
        setIsLoadingQuestions(false);
        setPassageFetchError('');
        setQuestionFetchError('');
        setFetchedPassage(null);
        setFetchedQuestions([]);
        setUserAnswers({});
        setResultMessages({});
    };

    const startReadingPractice = async () => {
        resetPracticeState();
        setIsLoadingPassage(true);

        try {
            const passageResponse = await fetch(`${API_BASE_URL}/passages/fetch?count=1`, {
                headers: { 'Authorization': `Bearer ${userToken}` }
            });
            if (!passageResponse.ok) throw new Error('Failed to fetch a reading passage.');
            const passageData = await passageResponse.json();
            if (!passageData.passages || passageData.passages.length === 0) {
                throw new Error('No reading passages found in the database.');
            }
            const passage = passageData.passages[0];
            setFetchedPassage(passage);
            setIsLoadingPassage(false);

            setIsLoadingQuestions(true);
            const questionsResponse = await fetch(`${API_BASE_URL}/questions/fetch?subject=reading&passageId=${passage.id}`, {
                 headers: { 'Authorization': `Bearer ${userToken}` }
            });
            if (!questionsResponse.ok) throw new Error(`Failed to fetch questions for passage ID ${passage.id}.`);
            const questionsData = await questionsResponse.json();
            setFetchedQuestions(questionsData.questions || []);

        } catch (error) {
            console.error("Error starting reading practice session:", error);
            setPassageFetchError(error.message);
        } finally {
            setIsLoadingPassage(false);
            setIsLoadingQuestions(false);
        }
    };
    
    const startStandalonePractice = async (subject) => {
        resetPracticeState();
        setIsLoadingQuestions(true);
        
        try {
            const questionsResponse = await fetch(`${API_BASE_URL}/questions/fetch?subject=${subject}&count=5`, {
                 headers: { 'Authorization': `Bearer ${userToken}` }
            });
            if (!questionsResponse.ok) {
                const errorData = await questionsResponse.json();
                throw new Error(errorData.message || `Failed to fetch ${subject} questions.`);
            }
            const questionsData = await questionsResponse.json();
             if (!questionsData.questions || questionsData.questions.length === 0) {
                throw new Error(`No ${subject} questions found in the database.`);
            }
            setFetchedQuestions(questionsData.questions);
        } catch (error) {
            console.error(`Error starting ${subject} practice session:`, error);
            setQuestionFetchError(error.message);
        } finally {
             setIsLoadingQuestions(false);
        }
    };

    const handleAnswerChange = (questionId, answer) => {
        setUserAnswers(prev => ({ ...prev, [questionId]: answer }));
    };
    
    const savePracticeAttempt = async (question) => {
        const questionId = question.id || question.questionText; // Use text as a fallback key
        if (!userToken) {
            setResultMessages(prev => ({ ...prev, [questionId]: { type: 'error', message: 'Authentication required.' } }));
            return;
        }
        const userAnswer = userAnswers[questionId] || '';
        if (!userAnswer.trim()) {
            setResultMessages(prev => ({ ...prev, [questionId]: { type: 'error', message: 'Please provide an answer.' } }));
            return;
        }

        const isCorrect = userAnswer.toLowerCase().trim() === question.correctAnswer.toLowerCase().trim();
        setResultMessages(prev => ({ ...prev, [questionId]: { type: 'loading', message: 'Saving...' } }));

        try {
            const response = await fetch(`${API_BASE_URL}/practice-history/save`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${userToken}` },
                body: JSON.stringify({
                    questionData: question,
                    isCorrect,
                    userAnswer,
                    selectedOption: question.isMultipleChoice ? userAnswer : null
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to save practice history.');
            }
            
            setResultMessages(prev => ({
                ...prev,
                [questionId]: {
                    type: 'success',
                    message: isCorrect ? 'Correct! Answer saved.' : `Incorrect. Correct: ${question.correctAnswer}`
                }
            }));
        } catch (error) {
            console.error("Error saving practice attempt:", error);
            setResultMessages(prev => ({ ...prev, [questionId]: { type: 'error', message: `Error: ${error.message}` } }));
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
                        <button onClick={() => { setActiveStudyView('main'); resetPracticeState(); }} className="bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors duration-200 flex items-center">
                            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Subjects
                        </button>
                        <h3 className="text-2xl font-semibold text-gray-800">Reading Practice</h3>
                        
                        {(!fetchedPassage && !isLoadingPassage && !passageFetchError) && (
                            <div className="text-center p-6 bg-yellow-50 rounded-lg shadow-inner border border-yellow-200">
                                <p className="text-gray-600 mb-4">Start a new session to get a random passage and its questions.</p>
                                <button
                                    onClick={startReadingPractice}
                                    className="bg-yellow-600 text-white px-6 py-3 rounded-lg hover:bg-yellow-700 transition-colors duration-200 shadow-md"
                                >
                                    Start Reading Practice Session ✨
                                </button>
                            </div>
                        )}

                        {isLoadingPassage && <p className="text-gray-600 text-center mt-4">Loading passage...</p>}
                        {passageFetchError && <p className="text-red-600 text-sm mt-2 text-center">{passageFetchError}</p>}
                        
                        {fetchedPassage && (
                            <div className="mt-6 p-4 bg-gray-50 rounded-lg shadow-inner border border-gray-200">
                                <h4 className="text-2xl font-bold text-gray-800 mb-2">{fetchedPassage.title}</h4>
                                <p className="text-gray-500 text-sm mb-4">Genre: {fetchedPassage.genre}, Word Count: {fetchedPassage.wordCount}</p>
                                <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">{fetchedPassage.text}</p>
                            </div>
                        )}
                        
                        {isLoadingQuestions && <p className="text-gray-600 text-center mt-4">Loading questions...</p>}
                        {questionFetchError && <p className="text-red-600 text-sm mt-2 text-center">{questionFetchError}</p>}
                        {fetchedQuestions.length > 0 && renderFetchedQuestions()}

                        {(fetchedPassage && !isLoadingQuestions && fetchedQuestions.length === 0) && (
                             <div className="text-center p-4 bg-gray-100 rounded-lg">
                                <p className="text-gray-600">No questions found for this passage.</p>
                             </div>
                        )}

                        {fetchedPassage && (
                             <div className="text-center mt-8">
                                <button
                                    onClick={startReadingPractice}
                                    className="bg-indigo-500 text-white px-6 py-3 rounded-lg hover:bg-indigo-600 transition-colors duration-200 shadow-md"
                                >
                                    Start a New Session
                                </button>
                            </div>
                        )}
                    </div>
                );
            case 'writing-main':
            case 'math-main':
                const subject = activeStudyView === 'math-main' ? 'math' : 'writing';
                const title = subject === 'math' ? 'Math Practice' : 'Writing & Language Practice';
                const color = subject === 'math' ? 'blue' : 'red';
                
                return (
                    <div className="space-y-6">
                        <button onClick={() => { setActiveStudyView('main'); resetPracticeState(); }} className="bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors duration-200 flex items-center">
                            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Subjects
                        </button>
                        <h3 className="text-2xl font-semibold text-gray-800">{title}</h3>
                        
                        {(fetchedQuestions.length === 0 && !isLoadingQuestions && !questionFetchError) && (
                            <div className={`text-center p-6 bg-${color}-50 rounded-lg shadow-inner border border-${color}-200`}>
                                <p className="text-gray-600 mb-4">Start a practice session to get a random set of {subject} questions.</p>
                                <button
                                    onClick={() => startStandalonePractice(subject)}
                                    className={`bg-${color}-600 text-white px-6 py-3 rounded-lg hover:bg-${color}-700 transition-colors duration-200 shadow-md`}
                                >
                                    Start {title} Session ✨
                                </button>
                            </div>
                        )}
                        
                        {isLoadingQuestions && <p className="text-gray-600 text-center mt-4">Loading questions...</p>}
                        {questionFetchError && <p className="text-red-600 text-sm mt-2 text-center">{questionFetchError}</p>}
                        {fetchedQuestions.length > 0 && renderFetchedQuestions()}
                        
                        {fetchedQuestions.length > 0 && (
                             <div className="text-center mt-8">
                                <button
                                    onClick={() => startStandalonePractice(subject)}
                                    className="bg-indigo-500 text-white px-6 py-3 rounded-lg hover:bg-indigo-600 transition-colors duration-200 shadow-md"
                                >
                                    Start a New Session
                                </button>
                            </div>
                        )}
                    </div>
                );
            default:
                 return null;
        }
    };

    const renderFetchedQuestions = () => (
        <div className="mt-8 space-y-8">
            <h3 className="text-2xl font-semibold text-gray-800">Questions</h3>
            {fetchedQuestions.map((q, index) => {
                const questionId = q.id || q.questionText; // Fallback key
                return (
                    <div key={questionId} className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                        <p className="text-gray-800 font-medium mb-3">
                            {index + 1}. {q.questionText}
                        </p>
                        {q.isMultipleChoice && q.options && q.options.length > 0 ? (
                            <div className="space-y-2 mb-4">
                                {q.options.map((option, optIndex) => (
                                    <label key={optIndex} className="block text-gray-700 p-2 rounded-md hover:bg-gray-100 cursor-pointer">
                                        <input
                                            type="radio"
                                            name={`question-${questionId}`}
                                            value={String.fromCharCode(65 + optIndex)}
                                            checked={userAnswers[questionId] === String.fromCharCode(65 + optIndex)}
                                            onChange={(e) => handleAnswerChange(questionId, e.target.value)}
                                            className="mr-3"
                                        />
                                        {String.fromCharCode(65 + optIndex)}. {option}
                                    </label>
                                ))}
                            </div>
                        ) : (
                            <input
                                type="text"
                                placeholder="Your answer (e.g., 5, or 'x=2')"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                                value={userAnswers[questionId] || ''}
                                onChange={(e) => handleAnswerChange(questionId, e.target.value)}
                            />
                        )}
                        <div className="mt-4 flex items-center space-x-2">
                            <button
                                onClick={() => savePracticeAttempt(q)}
                                className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 text-sm shadow-md flex items-center disabled:opacity-50"
                                disabled={!!resultMessages[questionId]}
                            >
                                {resultMessages[questionId]?.type === 'loading' ? 'Saving...' : 'Save Answer'}
                            </button>
                            {resultMessages[questionId] && (
                                <span className={`text-sm flex items-center ${resultMessages[questionId].type === 'success' ? 'text-green-700' : 'text-red-700'}`}>
                                    {resultMessages[questionId].type === 'success' ? <CheckCircle className="w-4 h-4 mr-1" /> : <XCircle className="w-4 h-4 mr-1" />}
                                    {resultMessages[questionId].message}
                                </span>
                            )}
                        </div>
                         {resultMessages[questionId]?.type === 'success' && !resultMessages[questionId].message.includes('Correct!') && q.explanation && (
                            <div className="mt-3 p-3 bg-gray-100 rounded-md text-sm text-gray-700">
                                <strong>Explanation:</strong> {q.explanation}
                            </div>
                        )}
                    </div>
                )
            })}
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

function PracticeTests({ API_BASE_URL, userToken }) {
    const [currentTest, setCurrentTest] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const startTest = async (testType) => {
        setIsLoading(true);
        setError('');
        setCurrentTest(null);
        try {
            const response = await fetch(`${API_BASE_URL}/tests/generate`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${userToken}`
                },
                body: JSON.stringify({ type: testType }),
            });
            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.message || `Failed to generate ${testType} test.`);
            }
            setCurrentTest(data);
        } catch (err) {
            console.error(`Error generating ${testType} test:`, err);
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-full">
                <div className="text-center">
                    <svg className="animate-spin h-10 w-10 text-indigo-600 mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <p className="mt-4 text-gray-600">Generating your test... Please wait.</p>
                </div>
            </div>
        );
    }

    if (error) {
         return (
             <div className="p-6 text-center">
                <p className="text-red-500 mb-4">{error}</p>
                <button onClick={() => setError('')} className="bg-indigo-500 text-white px-4 py-2 rounded-lg">
                    Back to Tests
                </button>
             </div>
        );
    }
    
    if (currentTest) {
        return <TestTakingScreen testData={currentTest} onFinish={() => setCurrentTest(null)} />;
    }

    return (
        <div className="p-6 bg-white rounded-lg shadow-md">
            <h2 className="text-3xl font-bold text-gray-800 mb-6">Practice Tests</h2>
            <p className="text-gray-600 mb-8">Take full-length simulated tests or section-wise quizzes to assess your knowledge.</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <TestCard title="Full-Length Practice Test" description="Simulate the real SAT exam experience, covering all sections." onStart={() => startTest('full')} />
                <TestCard title="Math Section Test" description="Focus on practicing and improving your math skills." onStart={() => startTest('math')} />
                <TestCard title="Reading Section Test" description="Practice reading comprehension and passage analysis." onStart={() => startTest('reading')} />
                <TestCard title="Writing & Language Test" description="Improve your grammar and writing skills with a dedicated test." onStart={() => startTest('writing')} />
            </div>
        </div>
    );
}

function TestTakingScreen({ testData, onFinish }) {
    const [userAnswers, setUserAnswers] = useState({});
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [score, setScore] = useState({ correct: 0, total: 0 });

    const allQuestions = [
        ...(testData.readingSection?.flatMap((p, pIndex) => p.questions.map((q, qIndex) => ({...q, id: `reading_${pIndex}_${qIndex}`, passageTitle: p.title, passageText: p.text}))) || []),
        ...(testData.writingSection?.map((q, i) => ({...q, id: `writing_${i}`})) || []),
        ...(testData.mathSection?.map((q, i) => ({...q, id: `math_${i}`})) || [])
    ];
    
    const handleAnswerChange = (questionId, answer) => {
        setUserAnswers(prev => ({...prev, [questionId]: answer}));
    };
    
    const handleSubmit = () => {
        let correctCount = 0;
        allQuestions.forEach((q) => {
            const userAnswer = userAnswers[q.id];
            if (userAnswer && userAnswer.toLowerCase().trim() === q.correctAnswer.toLowerCase().trim()) {
                correctCount++;
            }
        });
        setScore({ correct: correctCount, total: allQuestions.length });
        setIsSubmitted(true);
        window.scrollTo(0, 0);
    };
    
    if(isSubmitted) {
        return (
             <div className="p-6 bg-white rounded-lg shadow-md">
                <h2 className="text-3xl font-bold text-indigo-700 mb-4">Test Results</h2>
                <div className="text-center p-8 bg-indigo-50 rounded-lg">
                    <p className="text-xl text-gray-700">You scored</p>
                    <p className="text-6xl font-bold text-indigo-600 my-2">{score.correct} / {score.total}</p>
                    <p className="text-2xl text-gray-700">{score.total > 0 ? ((score.correct / score.total) * 100).toFixed(2) : 0}%</p>
                </div>
                 <button onClick={onFinish} className="mt-8 w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700">
                    Back to Test Menu
                </button>
            </div>
        )
    }

    return (
        <div className="p-6 bg-white rounded-lg shadow-md">
            <h2 className="text-3xl font-bold text-gray-800 mb-6">{testData.title}</h2>

            {testData.readingSection && testData.readingSection.length > 0 && (
                <div className="mb-8">
                    <h3 className="text-2xl font-semibold text-gray-700 border-b-2 pb-2 mb-4">Reading Section</h3>
                    {testData.readingSection.map((passage, pIndex) => (
                        <div key={pIndex} className="mb-6">
                            <div className="p-4 bg-gray-50 rounded-lg border">
                                 <h4 className="text-xl font-bold text-gray-800 mb-2">{passage.title}</h4>
                                 <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">{passage.text}</p>
                            </div>
                            <div className="pl-4 mt-4">
                                {passage.questions.map((q, qIndex) => {
                                    const questionId = `reading_${pIndex}_${qIndex}`;
                                    return (
                                        <div key={questionId} className="py-4 border-t">
                                            <p className="font-medium mb-2">{qIndex + 1}. {q.questionText}</p>
                                            {q.options.map((opt, oIndex) => (
                                                <label key={oIndex} className="block p-2 hover:bg-gray-100 rounded-md">
                                                    <input type="radio" name={questionId} value={String.fromCharCode(65 + oIndex)} onChange={(e) => handleAnswerChange(questionId, e.target.value)} className="mr-2"/>
                                                    {String.fromCharCode(65 + oIndex)}. {opt}
                                                </label>
                                            ))}
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    ))}
                </div>
            )}
            
             {testData.writingSection && testData.writingSection.length > 0 && (
                 <div className="mb-8">
                    <h3 className="text-2xl font-semibold text-gray-700 border-b-2 pb-2 mb-4">Writing & Language Section</h3>
                     {testData.writingSection.map((q, qIndex) => {
                        const questionId = `writing_${qIndex}`;
                        return (
                             <div key={questionId} className="py-4 border-t">
                                <p className="font-medium mb-2">{qIndex + 1}. {q.questionText}</p>
                                {q.options.map((opt, oIndex) => (
                                    <label key={oIndex} className="block p-2 hover:bg-gray-100 rounded-md">
                                        <input type="radio" name={questionId} value={String.fromCharCode(65 + oIndex)} onChange={(e) => handleAnswerChange(questionId, e.target.value)} className="mr-2"/>
                                        {String.fromCharCode(65 + oIndex)}. {opt}
                                    </label>
                                ))}
                            </div>
                        )
                    })}
                </div>
            )}

             {testData.mathSection && testData.mathSection.length > 0 && (
                 <div className="mb-8">
                    <h3 className="text-2xl font-semibold text-gray-700 border-b-2 pb-2 mb-4">Math Section</h3>
                     {testData.mathSection.map((q, qIndex) => {
                        const questionId = `math_${qIndex}`;
                        return (
                             <div key={questionId} className="py-4 border-t">
                                <p className="font-medium mb-2">{qIndex + 1}. {q.questionText}</p>
                                {q.isMultipleChoice ? q.options.map((opt, oIndex) => (
                                    <label key={oIndex} className="block p-2 hover:bg-gray-100 rounded-md">
                                        <input type="radio" name={questionId} value={String.fromCharCode(65 + oIndex)} onChange={(e) => handleAnswerChange(questionId, e.target.value)} className="mr-2"/>
                                         {String.fromCharCode(65 + oIndex)}. {opt}
                                    </label>
                                )) : (
                                    <input type="text" placeholder="Your Answer" onChange={(e) => handleAnswerChange(questionId, e.target.value)} className="w-full mt-2 p-2 border rounded-md"/>
                                )}
                            </div>
                        )
                    })}
                </div>
            )}
            
            <button onClick={handleSubmit} className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 text-lg">
                Submit Test
            </button>
             <button onClick={onFinish} className="mt-4 w-full bg-gray-200 text-gray-800 py-2 rounded-lg hover:bg-gray-300">
                Cancel and Go Back
            </button>
        </div>
    );
}

function ProgressTracking() {
    return (
        <div className="p-6 bg-white rounded-lg shadow-md">
            <h2 className="text-3xl font-bold text-gray-800 mb-6">Progress Tracking</h2>
            <p className="text-gray-600 mb-8">View your study performance and historical scores.</p>
            <ProgressChart title="Overall Score Trend" />
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
                setChatHistory((prev) => [...prev, { role: 'model', text: 'Authentication required.' }]);
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
            setChatHistory((prev) => [...prev, { role: 'model', text: 'Sorry, I cannot respond at the moment.' }]);
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
                                ? 'bg-indigo-500 text-white'
                                : 'bg-blue-100 text-blue-800'
                        }`}>
                            {message.text}
                        </div>
                    </div>
                ))}
                {isLoadingChat && (
                    <div className="flex justify-start mb-2">
                        <div className="bg-blue-100 text-blue-800 rounded-lg p-3 shadow flex items-center">
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
                    onKeyPress={(e) => { if (e.key === 'Enter') handleSendMessage(); }}
                    className="flex-1 p-3 border rounded-lg"
                    disabled={isLoadingChat}
                />
                <button onClick={handleSendMessage} className="bg-indigo-500 text-white px-6 py-3 rounded-lg hover:bg-indigo-600" disabled={isLoadingChat}>
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
        </div>
    );
}

function AdminTools({ API_BASE_URL, userToken, userRole }) {
    const [adminMessage, setAdminMessage] = useState({ type: '', text: '' });
    
    // Passage States
    const [generatePassageGenre, setGeneratePassageGenre] = useState('history');
    const [generatePassageWordCount, setGeneratePassageWordCount] = useState(300);
    const [generatePassageTopic, setGeneratePassageTopic] = useState('');
    const [isGeneratingPassage, setIsGeneratingPassage] = useState(false);
    const [passageForReview, setPassageForReview] = useState(null);
    const [isApproving, setIsApproving] = useState(false);
    
    // Question States
    const [generateQuestionSubject, setGenerateQuestionSubject] = useState('math');
    const [generateQuestionCount, setGenerateQuestionCount] = useState(1);
    const [generateQuestionDifficulty, setGenerateQuestionDifficulty] = useState('medium');
    const [generateQuestionType, setGenerateQuestionType] = useState('');
    const [isGeneratingQuestions, setIsGeneratingQuestions] = useState(false);
    const [questionsForReview, setQuestionsForReview] = useState([]);
    const [isApprovingQuestions, setIsApprovingQuestions] = useState(false);

    const handleGeneratePassage = async () => {
        setAdminMessage({ type: '', text: '' });
        setIsGeneratingPassage(true);
        setPassageForReview(null);

        try {
            const response = await fetch(`${API_BASE_URL}/passages/generate`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${userToken}` },
                body: JSON.stringify({
                    genre: generatePassageGenre,
                    wordCount: generatePassageWordCount,
                    topic: generatePassageTopic
                })
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.message || 'Failed to generate passage.');
            setAdminMessage({ type: 'success', text: 'Passage generated for review.' });
            setPassageForReview(data.passageData);
        } catch (error) {
            setAdminMessage({ type: 'error', text: `Error generating passage: ${error.message}` });
        } finally {
            setIsGeneratingPassage(false);
        }
    };
    
    const handleApproveAndSavePassage = async () => {
        if (!passageForReview) return;
        setIsApproving(true);
        setAdminMessage({ type: 'loading', text: 'Approving passage and generating questions...' });
        try {
            const response = await fetch(`${API_BASE_URL}/passages/approve-and-generate-questions`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${userToken}` },
                body: JSON.stringify(passageForReview)
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.message || 'Failed to approve passage.');
            setAdminMessage({ type: 'success', text: data.message });
            setPassageForReview(null);
        } catch (error) {
            setAdminMessage({ type: 'error', text: `Error approving passage: ${error.message}` });
        } finally {
            setIsApproving(false);
        }
    };

    const handleRejectPassage = () => {
        setPassageForReview(null);
        setAdminMessage({ type: 'info', text: 'Generated passage has been discarded.' });
    };
    
    const handleGenerateQuestions = async () => {
        setAdminMessage({ type: '', text: '' });
        setIsGeneratingQuestions(true);
        setQuestionsForReview([]);
        try {
            const response = await fetch(`${API_BASE_URL}/questions/generate`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${userToken}` },
                body: JSON.stringify({
                    subject: generateQuestionSubject,
                    count: generateQuestionCount,
                    difficulty: generateQuestionDifficulty,
                    type: generateQuestionType,
                })
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.message || 'Failed to generate questions.');
            setAdminMessage({ type: 'success', text: data.message });
            setQuestionsForReview(data.questionsForReview);
        } catch (error) {
            setAdminMessage({ type: 'error', text: `Error generating questions: ${error.message}` });
        } finally {
            setIsGeneratingQuestions(false);
        }
    };

    const handleApproveQuestions = async () => {
        if (questionsForReview.length === 0) return;
        setIsApprovingQuestions(true);
        setAdminMessage({ type: 'loading', text: 'Saving questions...' });
        try {
            const response = await fetch(`${API_BASE_URL}/questions/add-batch`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${userToken}` },
                body: JSON.stringify({ questions: questionsForReview })
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.message || 'Failed to save question batch.');
            setAdminMessage({ type: 'success', text: data.message });
            setQuestionsForReview([]);
        } catch (error) {
            setAdminMessage({ type: 'error', text: `Error saving questions: ${error.message}` });
        } finally {
            setIsApprovingQuestions(false);
        }
    };

    const handleRejectQuestions = () => {
        setQuestionsForReview([]);
        setAdminMessage({ type: 'info', text: 'Generated questions have been discarded.' });
    };

    if (userRole !== 'admin') {
        return <div className="p-6 bg-red-100 rounded-lg text-center"><h2 className="text-red-800">Access Denied</h2></div>;
    }

    return (
        <div className="p-6 bg-white rounded-lg shadow-md">
            <h2 className="text-3xl font-bold text-gray-800 mb-6 flex items-center">
                <PlusCircle className="w-8 h-8 mr-3" /> Admin Content Generation Tools
            </h2>
             <p className="text-gray-600 mb-8">Generate and add new SAT passages or questions to the database using AI.</p>
            
            {adminMessage.text && (
                <div className={`p-4 mb-6 rounded-lg text-center ${
                    adminMessage.type === 'error' ? 'bg-red-100 text-red-700' : 
                    (adminMessage.type === 'success' ? 'bg-green-100 text-green-700' : 
                    (adminMessage.type === 'info' ? 'bg-blue-100 text-blue-700' : 'bg-blue-100 text-blue-700'))
                }`}>
                    {adminMessage.text}
                </div>
            )}
            
            <div className="p-6 bg-purple-50 rounded-lg shadow-inner border border-purple-200">
                <h3 className="text-2xl font-semibold text-purple-800 mb-4">Generate Passage & Linked Questions</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                        <label htmlFor="genPassageGenre" className="block text-sm font-medium text-gray-700 mb-2">Genre:</label>
                        <select id="genPassageGenre" className="w-full p-2 border border-gray-300 rounded-md" value={generatePassageGenre} onChange={(e) => setGeneratePassageGenre(e.target.value)} disabled={isGeneratingPassage || isApproving}>
                            <option value="history">History</option>
                            <option value="literary_narrative">Literary Narrative</option>
                            <option value="natural_science">Natural Science</option>
                            <option value="social_science">Social Science</option>
                        </select>
                    </div>
                    <div>
                        <label htmlFor="genPassageWordCount" className="block text-sm font-medium text-gray-700 mb-2">Word Count:</label>
                        <input type="number" id="genPassageWordCount" min="100" max="1000" className="w-full p-2 border border-gray-300 rounded-md" value={generatePassageWordCount} onChange={(e) => setGeneratePassageWordCount(e.target.value)} disabled={isGeneratingPassage || isApproving} />
                    </div>
                </div>
                <div>
                    <label htmlFor="genPassageTopic" className="block text-sm font-medium text-gray-700 mb-2">Topic (Optional):</label>
                    <input type="text" id="genPassageTopic" placeholder="e.g., impact of renewable energy" className="w-full p-2 border border-gray-300 rounded-md" value={generatePassageTopic} onChange={(e) => setGeneratePassageTopic(e.target.value)} disabled={isGeneratingPassage || isApproving} />
                </div>
                <button onClick={handleGeneratePassage} disabled={isGeneratingPassage || isApproving} className="mt-4 bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 w-full">
                    {isGeneratingPassage ? 'Generating...' : 'Generate Passage for Review'}
                </button>
                
                {passageForReview && (
                    <div className="mt-6 p-4 bg-purple-100 rounded-lg border border-purple-200">
                        <h4 className="text-lg font-semibold text-gray-800 mb-2">Review Generated Passage:</h4>
                        <div className="p-2 bg-white rounded-md max-h-40 overflow-y-auto">
                            <h5 className="font-semibold text-gray-700 mb-1">{passageForReview.title}</h5>
                            <p className="text-gray-600 text-sm whitespace-pre-wrap">{passageForReview.text}</p>
                        </div>
                        <div className="flex space-x-4 mt-3">
                            <button onClick={handleApproveAndSavePassage} disabled={isApproving} className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg flex items-center justify-center">
                                <ThumbsUp className="w-4 h-4 mr-2" /> {isApproving ? 'Saving...' : 'Approve & Create Questions'}
                            </button>
                            <button onClick={handleRejectPassage} disabled={isApproving} className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg flex items-center justify-center">
                                <ThumbsDown className="w-4 h-4 mr-2" /> Reject
                            </button>
                        </div>
                    </div>
                )}
            </div>

            <div className="mt-10 p-6 bg-teal-50 rounded-lg shadow-inner border border-teal-200">
                <h3 className="text-2xl font-semibold text-teal-800 mb-4">Generate Standalone Questions</h3>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                        <label htmlFor="genQuestionSubject" className="block text-sm font-medium text-gray-700 mb-2">Subject:</label>
                        <select id="genQuestionSubject" className="w-full p-2 border rounded-md" value={generateQuestionSubject} onChange={e => setGenerateQuestionSubject(e.target.value)} disabled={isGeneratingQuestions || isApprovingQuestions}>
                            <option value="math">Math</option>
                            <option value="writing">Writing & Language</option>
                        </select>
                    </div>
                    <div>
                        <label htmlFor="genQuestionCount" className="block text-sm font-medium text-gray-700 mb-2">Count:</label>
                        <input type="number" id="genQuestionCount" min="1" max="5" className="w-full p-2 border rounded-md" value={generateQuestionCount} onChange={e => setGenerateQuestionCount(e.target.value)} disabled={isGeneratingQuestions || isApprovingQuestions} />
                    </div>
                    <div>
                        <label htmlFor="genQuestionDifficulty" className="block text-sm font-medium text-gray-700 mb-2">Difficulty:</label>
                         <select id="genQuestionDifficulty" className="w-full p-2 border rounded-md" value={generateQuestionDifficulty} onChange={e => setGenerateQuestionDifficulty(e.target.value)} disabled={isGeneratingQuestions || isApprovingQuestions}>
                            <option value="easy">Easy</option>
                            <option value="medium">Medium</option>
                            <option value="hard">Hard</option>
                        </select>
                    </div>
                    <div>
                        <label htmlFor="genQuestionType" className="block text-sm font-medium text-gray-700 mb-2">Type (Optional):</label>
                        <input type="text" id="genQuestionType" placeholder="e.g., algebra, grammar" className="w-full p-2 border rounded-md" value={generateQuestionType} onChange={e => setGenerateQuestionType(e.target.value)} disabled={isGeneratingQuestions || isApprovingQuestions} />
                    </div>
                </div>
                <button onClick={handleGenerateQuestions} disabled={isGeneratingQuestions || isApprovingQuestions} className="mt-4 bg-teal-600 text-white px-6 py-3 rounded-lg hover:bg-teal-700 w-full">
                    {isGeneratingQuestions ? 'Generating...' : 'Generate Questions for Review'}
                </button>
                
                {questionsForReview.length > 0 && (
                    <div className="mt-6 p-4 bg-teal-100 rounded-lg border border-teal-200 space-y-4">
                        <h4 className="text-lg font-semibold text-gray-800 mb-2">Review Generated Questions:</h4>
                        {questionsForReview.map((q, qIndex) => (
                            <div key={qIndex} className="bg-white p-4 rounded-md shadow-sm">
                                <p className="font-medium text-gray-800">{qIndex + 1}. {q.questionText}</p>
                                {q.isMultipleChoice && q.options && q.options.length > 0 && (
                                    <ul className="list-none text-gray-700 text-sm mt-2 pl-4">
                                        {q.options.map((opt, oi) => <li key={oi}>{String.fromCharCode(65 + oi)}. {opt}</li>)}
                                    </ul>
                                )}
                                <div className="mt-3 pt-3 border-t text-sm space-y-1">
                                    <p><strong className="text-green-700">Answer:</strong> {q.correctAnswer}</p>
                                    <p><strong className="text-gray-600">Explanation:</strong> {q.explanation}</p>
                                </div>
                            </div>
                        ))}
                        <div className="flex space-x-4 mt-4">
                            <button onClick={handleApproveQuestions} disabled={isApprovingQuestions} className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg flex items-center justify-center">
                                <ThumbsUp className="w-4 h-4 mr-2" />{isApprovingQuestions ? 'Saving...' : 'Approve & Save'}
                            </button>
                            <button onClick={handleRejectQuestions} disabled={isApprovingQuestions} className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg flex items-center justify-center">
                                <ThumbsDown className="w-4 h-4 mr-2" /> Reject
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

// --- Main App Component ---
export default function App() {
    const [currentPage, setCurrentPage] = useState('login');
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [userEmail, setUserEmail] = useState(null);
    const [userToken, setUserToken] = useState(localStorage.getItem('satTutorToken') || null);
    const [userRole, setUserRole] = useState('guest');

    useEffect(() => {
        const token = localStorage.getItem('satTutorToken');
        if (token) {
            try {
                const base64Url = token.split('.')[1];
                const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
                const decodedToken = JSON.parse(window.atob(base64));
                setUserEmail(decodedToken.email);
                setUserRole(decodedToken.role);
                setIsAuthenticated(true);
                setCurrentPage('dashboard');
            } catch (e) {
                handleLogout();
            }
        } else {
            setIsAuthenticated(false);
            setCurrentPage('login');
        }
    }, [userToken]);

    const handleLogin = (token, email, role) => {
        localStorage.setItem('satTutorToken', token);
        setUserToken(token);
    };

    const handleLogout = () => {
        localStorage.removeItem('satTutorToken');
        setUserToken(null);
    };

    const navigateToRegister = () => setCurrentPage('register');
    const navigateToLogin = () => setCurrentPage('login');

    const renderPage = () => {
        if (!isAuthenticated) {
            if (currentPage === 'register') {
                return <RegisterPage onRegisterSuccess={navigateToLogin} API_BASE_URL={API_BASE_URL} />;
            }
            return <LoginPage onLoginSuccess={handleLogin} onNavigateToRegister={navigateToRegister} API_BASE_URL={API_BASE_URL} />;
        }

        switch (currentPage) {
            case 'dashboard':
                return <Dashboard userEmail={userEmail} />;
            case 'study':
                return <StudyModules API_BASE_URL={API_BASE_URL} userToken={userToken} />;
            case 'practice':
                return <PracticeTests API_BASE_URL={API_BASE_URL} userToken={userToken} />;
            case 'progress':
                return <ProgressTracking />;
            case 'ai-chat':
                return <AIChat API_BASE_URL={API_BASE_URL} userToken={userToken} />;
            case 'settings':
                return <SettingsPage />;
            case 'admin-tools':
                return <AdminTools API_BASE_URL={API_BASE_URL} userToken={userToken} userRole={userRole} />;
            default:
                return <Dashboard userEmail={userEmail} />;
        }
    };

    return (
        <div className="flex h-screen bg-gray-100 font-inter">
            {isAuthenticated && (
                <>
                    <aside className={`bg-white shadow-lg w-64 p-6 hidden md:block`}>
                        <div className="text-2xl font-bold text-indigo-700 mb-10 flex items-center">
                            <Sparkles className="text-yellow-400 mr-2"/> SAT Tutor
                        </div>
                        <nav>
                            <NavItem icon={<Home />} text="Dashboard" page="dashboard" setCurrentPage={setCurrentPage} currentPage={currentPage} />
                            <NavItem icon={<BookOpen />} text="Study Modules" page="study" setCurrentPage={setCurrentPage} currentPage={currentPage} />
                            <NavItem icon={<FileText />} text="Practice Tests" page="practice" setCurrentPage={setCurrentPage} currentPage={currentPage} />
                            <NavItem icon={<TrendingUp />} text="Progress Tracking" page="progress" setCurrentPage={setCurrentPage} currentPage={currentPage} />
                            <NavItem icon={<MessageSquare />} text="AI Tutoring Chat" page="ai-chat" setCurrentPage={setCurrentPage} currentPage={currentPage} />
                            {userRole === 'admin' && (
                                <NavItem icon={<PlusCircle />} text="Admin Tools" page="admin-tools" setCurrentPage={setCurrentPage} currentPage={currentPage} />
                            )}
                        </nav>
                         <div className="absolute bottom-6 left-6 w-52">
                            <NavItem icon={<Settings />} text="Settings" page="settings" setCurrentPage={setCurrentPage} currentPage={currentPage} />
                        </div>
                    </aside>
                </>
            )}

            <div className="flex-1 flex flex-col overflow-hidden">
                <header className="flex items-center justify-between p-4 bg-white shadow-md">
                    <h1 className="text-2xl font-semibold text-gray-800">SAT Study Assistant</h1>
                    {isAuthenticated && (
                        <div className="flex items-center space-x-4">
                            <span className="text-gray-700 hidden sm:block">Welcome, {userEmail}!</span>
                            <button onClick={handleLogout} className="bg-indigo-500 text-white px-4 py-2 rounded-lg hover:bg-indigo-600">
                                <LogOut className="inline w-4 h-4 mr-2" />Log Out
                            </button>
                        </div>
                    )}
                </header>

                <main className="flex-1 overflow-x-hidden overflow-y-auto p-4 md:p-6 bg-gray-100">
                    {renderPage()}
                </main>
            </div>
        </div>
    );
}