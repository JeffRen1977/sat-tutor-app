import React, { useState, useEffect, useRef } from 'react';
import { Home, BookOpen, FileText, TrendingUp, MessageSquare, Settings, Menu, X, Sparkles } from 'lucide-react'; // Importing icons, added Sparkles

// Define the base URL for your backend API
// Ensure your backend server is running on this address (e.g., node server.js in your backend directory)
const API_BASE_URL = 'http://localhost:3001/api';

// Main App Component
const App = () => {
    const [currentPage, setCurrentPage] = useState('dashboard');
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    // Function to render content based on current page
    const renderPage = () => {
        switch (currentPage) {
            case 'dashboard':
                return <Dashboard />;
            case 'study':
                return <StudyModules />;
            case 'practice':
                return <PracticeTests />;
            case 'progress':
                return <ProgressTracking />;
            case 'ai-chat':
                return <AIChat />;
            case 'settings':
                return <SettingsPage />;
            default:
                return <Dashboard />;
        }
    };

    return (
        <div className="flex h-screen bg-gray-100 font-inter">
            {/* Sidebar for Desktop */}
            <aside className={`bg-white shadow-lg w-64 p-6 hidden md:block transition-all duration-300 ease-in-out`}>
                <div className="text-2xl font-bold text-indigo-700 mb-10 flex items-center">
                    <img src="https://placehold.co/40x40/6366F1/FFFFFF?text=SAT" alt="SAT Logo" className="mr-3 rounded-md" />
                    SAT Tutor
                </div>
                <nav>
                    <NavItem icon={<Home className="w-5 h-5 mr-3" />} text="Dashboard" page="dashboard" setCurrentPage={setCurrentPage} currentPage={currentPage} />
                    <NavItem icon={<BookOpen className="w-5 h-5 mr-3" />} text="Study Modules" page="study" setCurrentPage={setCurrentPage} currentPage={currentPage} />
                    <NavItem icon={<FileText className="w-5 h-5 mr-3" />} text="Practice Tests" page="practice" setCurrentPage={setCurrentPage} currentPage={currentPage} />
                    <NavItem icon={<TrendingUp className="w-5 h-5 mr-3" />} text="Progress Tracking" page="progress" setCurrentPage={setCurrentPage} currentPage={currentPage} />
                    <NavItem icon={<MessageSquare className="w-5 h-5 mr-3" />} text="AI Tutoring Chat" page="ai-chat" setCurrentPage={setCurrentPage} currentPage={currentPage} />
                    <NavItem icon={<Settings className="w-5 h-5 mr-3" />} text="Settings" page="settings" setCurrentPage={setCurrentPage} currentPage={currentPage} />
                </nav>
            </aside>

            {/* Mobile Sidebar Overlay */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
                    onClick={() => setIsSidebarOpen(false)}
                ></div>
            )}

            {/* Mobile Sidebar */}
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
                    <NavItem icon={<Home className="w-5 h-5 mr-3" />} text="Dashboard" page="dashboard" setCurrentPage={setCurrentPage} currentPage={currentPage} onClick={() => setIsSidebarOpen(false)} />
                    <NavItem icon={<BookOpen className="w-5 h-5 mr-3" />} text="Study Modules" page="study" setCurrentPage={setCurrentPage} currentPage={currentPage} onClick={() => setIsSidebarOpen(false)} />
                    <NavItem icon={<FileText className="w-5 h-5 mr-3" />} text="Practice Tests" page="practice" setCurrentPage={setCurrentPage} currentPage={currentPage} onClick={() => setIsSidebarOpen(false)} />
                    <NavItem icon={<TrendingUp className="w-5 h-5 mr-3" />} text="Progress Tracking" page="progress" setCurrentPage={setCurrentPage} currentPage={currentPage} onClick={() => setIsSidebarOpen(false)} />
                    <NavItem icon={<MessageSquare className="w-5 h-5 mr-3" />} text="AI Tutoring Chat" page="ai-chat" setCurrentPage={setCurrentPage} currentPage={currentPage} onClick={() => setIsSidebarOpen(false)} />
                    <NavItem icon={<Settings className="w-5 h-5 mr-3" />} text="Settings" page="settings" setCurrentPage={setCurrentPage} currentPage={currentPage} onClick={() => setIsSidebarOpen(false)} />
                </nav>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col overflow-hidden">
                {/* Header */}
                <header className="flex items-center justify-between p-4 bg-white shadow-md md:px-6">
                    <button onClick={() => setIsSidebarOpen(true)} className="md:hidden text-gray-600 hover:text-gray-900 focus:outline-none">
                        <Menu className="w-6 h-6" />
                    </button>
                    <h1 className="text-2xl font-semibold text-gray-800 hidden md:block">SAT Study Assistant</h1>
                    <div className="flex items-center space-x-4">
                        <button className="bg-indigo-500 text-white px-4 py-2 rounded-lg hover:bg-indigo-600 transition-colors duration-200 shadow-md">
                            Log Out
                        </button>
                    </div>
                </header>

                {/* Page Content */}
                <main className="flex-1 overflow-x-hidden overflow-y-auto p-4 md:p-6 bg-gray-100">
                    {renderPage()}
                </main>
            </div>
        </div>
    );
};

// Nav Item Component for Sidebar
const NavItem = ({ icon, text, page, setCurrentPage, currentPage, onClick }) => (
    <button
        onClick={() => { setCurrentPage(page); if(onClick) onClick(); }}
        className={`flex items-center w-full px-4 py-3 my-2 rounded-lg text-left transition-colors duration-200 ${
            currentPage === page
                ? 'bg-indigo-100 text-indigo-700 font-semibold shadow-sm'
                : 'text-gray-700 hover:bg-gray-100 hover:text-indigo-600'
        }`}
    >
        {icon}
        <span className="text-lg">{text}</span>
    </button>
);

// Dashboard Component
const Dashboard = () => (
    <div className="p-6 bg-white rounded-lg shadow-md">
        <h2 className="text-3xl font-bold text-gray-800 mb-6">Welcome back, Student!</h2>
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

// Study Modules Component
const StudyModules = () => {
    const [vocabularyWord, setVocabularyWord] = useState('');
    const [vocabularyExplanation, setVocabularyExplanation] = useState('');
    const [isLoadingVocab, setIsLoadingVocab] = useState(false);
    const [vocabError, setVocabError] = useState('');

    // Removed grammar-related state variables
    // Removed passage-related state variables

    const [essayTopic, setEssayTopic] = useState('');
    const [essayBrainstorming, setEssayBrainstorming] = useState('');
    const [isLoadingEssay, setIsLoadingEssay] = useState(false);
    const [essayError, setEssayError] = useState('');

    const [mathProblem, setMathProblem] = useState('');
    const [mathSolution, setMathSolution] = useState('');
    const [isLoadingMath, setIsLoadingMath] = useState(false);
    const [mathError, setMathError] = useState('');


    // Function to get vocabulary explanation (now calling backend)
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
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ word: vocabularyWord.trim() })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'API request failed');
            }

            const result = await response.json();
            setVocabularyExplanation(result.explanation); // Backend sends 'explanation' key

        } catch (error) {
            console.error("Error fetching vocabulary explanation:", error);
            setVocabError(`Error fetching vocabulary explanation: ${error.message}`);
        } finally {
            setIsLoadingVocab(false);
        }
    };

    // Removed getGrammarCorrection function
    // Removed extractKeyIdeas function

    // Function to get essay brainstorming ideas (new feature)
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
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ topic: essayTopic.trim() })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'API request failed');
            }

            const result = await response.json();
            setEssayBrainstorming(result.brainstormingIdeas); // Backend sends 'brainstormingIdeas' key

        } catch (error) {
            console.error("Error fetching essay brainstorming ideas:", error);
            setEssayError(`Error fetching essay brainstorming ideas: ${error.message}`);
        } finally {
            setIsLoadingEssay(false);
        }
    };

    // Function to solve math problem step-by-step (new feature)
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
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ problem: mathProblem.trim() })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'API request failed');
            }

            const result = await response.json();
            setMathSolution(result.solution); // Backend sends 'solution' key

        } catch (error) {
            console.error("Error solving math problem:", error);
            setMathError(`Error solving math problem: ${error.message}`);
        } finally {
            setIsLoadingMath(false);
        }
    };


    return (
        <div className="p-6 bg-white rounded-lg shadow-md">
            <h2 className="text-3xl font-bold text-gray-800 mb-6">Study Modules</h2>
            <p className="text-gray-600 mb-8">Select an SAT subject to start your learning.</p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <StudyCard title="Reading" description="Improve your reading comprehension and passage analysis skills." />
                <StudyCard title="Writing and Language" description="Master grammar, punctuation, and rhetorical skills." />
                <StudyCard title="Math" description="Review algebra, geometry, data analysis, and problem-solving." />
            </div>

            {/* AI-Powered Vocabulary Expansion */}
            <div className="mt-10 p-6 bg-indigo-50 rounded-lg shadow-inner border border-indigo-200">
                <h3 className="text-2xl font-semibold text-indigo-800 mb-4 flex items-center">
                    ✨ Vocabulary Expander
                </h3>
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
                            <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
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

            {/* Removed: AI-Powered Grammar Corrector/Explainer */}
            {/* Removed: AI-Powered Reading Passage Key Idea Extractor */}

            {/* AI-Powered Essay Brainstormer */}
            <div className="mt-10 p-6 bg-red-50 rounded-lg shadow-inner border border-red-200">
                <h3 className="text-2xl font-semibold text-red-800 mb-4 flex items-center">
                    ✨ Essay Brainstormer
                </h3>
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

            {/* AI-Powered Math Problem Solver */}
            <div className="mt-10 p-6 bg-blue-50 rounded-lg shadow-inner border border-blue-200">
                <h3 className="text-2xl font-semibold text-blue-800 mb-4 flex items-center">
                    ✨ Math Problem Solver
                </h3>
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

        </div>
    );
};

// Practice Tests Component
const PracticeTests = () => (
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

// Progress Tracking Component
const ProgressTracking = () => (
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

// AI Chat Component
const AIChat = () => {
    const [chatHistory, setChatHistory] = useState([
        { role: 'model', text: 'Hello! I am your AI SAT tutor. How can I help you today?' }
    ]);
    const [currentMessage, setCurrentMessage] = useState('');
    const [isLoadingChat, setIsLoadingChat] = useState(false);
    const [chatError, setChatError] = useState('');
    const chatContainerRef = useRef(null); // Ref for scrolling to the bottom

    // Scroll to bottom of chat whenever messages update
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
            // Send full chat history to backend
            const response = await fetch(`${API_BASE_URL}/chat`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ chatHistory: [...chatHistory, userMessage] }) // Send current user message as part of history
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'API request failed');
            }

            const result = await response.json();
            const modelResponseText = result.text; // Backend sends 'text' key
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
                {chatError && <p className="text-red-600 text-sm mt-2 text-center">{chatError}</p>}
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
};

// Settings Component
const SettingsPage = () => (
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


// Reusable Card Component
const Card = ({ title, description }) => (
    <div className="bg-indigo-50 p-6 rounded-lg shadow-sm border border-indigo-100 flex flex-col justify-between">
        <h3 className="text-xl font-semibold text-indigo-800 mb-3">{title}</h3>
        <p className="text-indigo-700">{description}</p>
        <button className="mt-4 self-start bg-indigo-200 text-indigo-800 px-4 py-2 rounded-full text-sm font-medium hover:bg-indigo-300 transition-colors duration-200">
            View Details
        </button>
    </div>
);

// Reusable Study Card Component
const StudyCard = ({ title, description }) => (
    <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
        <h3 className="text-xl font-semibold text-gray-800 mb-3">{title}</h3>
        <p className="text-gray-600 mb-4">{description}</p>
        <button className="bg-indigo-500 text-white px-5 py-2 rounded-lg hover:bg-indigo-600 transition-colors duration-200 shadow-md">
            Start Learning
        </button>
    </div>
);

// Reusable Test Card Component
const TestCard = ({ title, description }) => (
    <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
        <h3 className="text-xl font-semibold text-gray-800 mb-3">{title}</h3>
        <p className="text-gray-600 mb-4">{description}</p>
        <button className="bg-green-500 text-white px-5 py-2 rounded-lg hover:bg-green-600 transition-colors duration-200 shadow-md">
            Start Test
        </button>
    </div>
);

// Placeholder for Progress Chart - in a real app, this would be a chart library component
const ProgressChart = ({ title }) => (
    <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
        <h3 className="text-xl font-semibold text-gray-800 mb-3">{title}</h3>
        <div className="h-40 bg-gray-200 flex items-center justify-center rounded-md text-gray-500 text-sm">
            [Chart Placeholder]
        </div>
        <p className="text-gray-600 text-sm mt-3">Detailed data analysis will be displayed here.</p>
    </div>
);

// Quick Link Component
const QuickLink = ({ text }) => (
    <button className="bg-gray-100 text-gray-700 px-4 py-3 rounded-lg hover:bg-gray-200 transition-colors duration-200 shadow-sm text-center font-medium">
        {text}
    </button>
);

export default App;