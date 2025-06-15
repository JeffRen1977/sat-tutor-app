import React, { useState, useEffect, useRef } from 'react';
import { Home, BookOpen, FileText, TrendingUp, MessageSquare, Settings, Menu, X, Sparkles, LogOut, CheckCircle, XCircle, ArrowLeft, PlusCircle } from 'lucide-react'; // PlusCircle for AdminTools icon
import NavItem from './components/NavItem';
import Card from './components/Card'; // Assuming Card is used, if not it would be removed by linter
import StudyCard from './components/StudyCard'; // Assuming StudyCard is used
import TestCard from './components/TestCard'; // Assuming TestCard is used
import QuickLink from './components/QuickLink'; // Assuming QuickLink is used
import ProgressChart from './components/ProgressChart'; // Assuming ProgressChart is used

import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import Dashboard from './pages/Dashboard';
import StudyModules from './pages/StudyModules';
import PracticeTests from './pages/PracticeTests';
import ProgressTracking from './pages/ProgressTracking';
import AIChat from './pages/AIChat';
import SettingsPage from './pages/SettingsPage';
import AdminTools from './pages/AdminTools';

// Define the base URL for your backend API
const API_BASE_URL = 'http://localhost:3001/api';

// Main App Component
export default function App() {
    const [currentPage, setCurrentPage] = useState('login');
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [userEmail, setUserEmail] = useState(null);
    const [userToken, setUserToken] = useState(localStorage.getItem('satTutorToken') || null);
    const [userRole, setUserRole] = useState('guest'); // Store user role

    useEffect(() => {
        if (userToken) {
            try {
                const base64Url = userToken.split('.')[1];
                const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
                const decodedToken = JSON.parse(window.atob(base64));
                setUserEmail(decodedToken.email || "Authenticated User");
                setUserRole(decodedToken.role || 'student'); // Set user role from token
                setIsAuthenticated(true);
                setCurrentPage('dashboard');
            } catch (e) {
                console.error("Error decoding token:", e);
                setUserEmail("Authenticated User"); // Or null if preferred on error
                setUserRole('guest'); // Fallback to guest
                setIsAuthenticated(false);
                setCurrentPage('login');
                // localStorage.removeItem('satTutorToken'); // Optionally clear bad token
            }
        } else {
            setIsAuthenticated(false);
            setUserEmail(null);
            setUserRole('guest');
            setCurrentPage('login');
        }
    }, [userToken]);

    const handleLogin = (token, email, role) => {
        localStorage.setItem('satTutorToken', token);
        setUserToken(token);
        setUserEmail(email);
        setUserRole(role);
        // setCurrentPage will be handled by useEffect reacting to userToken change
    };

    const handleLogout = () => {
        localStorage.removeItem('satTutorToken');
        setUserToken(null);
        // Other states (isAuthenticated, userEmail, userRole, currentPage) will be reset by useEffect
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
                return <StudyModules API_BASE_URL={API_BASE_URL} userToken={userToken} userRole={userRole} />;
            case 'practice':
                return <PracticeTests />;
            case 'progress':
                return <ProgressTracking />;
            case 'ai-chat':
                return <AIChat API_BASE_URL={API_BASE_URL} userToken={userToken} />;
            case 'settings':
                return <SettingsPage />;
            case 'admin-tools':
                return <AdminTools API_BASE_URL={API_BASE_URL} userToken={userToken} userRole={userRole} />;
            default:
                return <Dashboard userEmail={userEmail} />; // Fallback to dashboard
        }
    };

    return (
        <div className="flex h-screen bg-gray-100 font-inter">
            {isAuthenticated && (
                <>
                    {/* Desktop Sidebar */}
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
                            {userRole === 'admin' && (
                                <NavItem icon={<PlusCircle />} text="Admin Tools" page="admin-tools" setCurrentPage={setCurrentPage} currentPage={currentPage} />
                            )}
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
                            <NavItem icon={<Home />} text="Dashboard" page="dashboard" setCurrentPage={setCurrentPage} currentPage={currentPage} onClick={() => setIsSidebarOpen(false)} />
                            <NavItem icon={<BookOpen />} text="Study Modules" page="study" setCurrentPage={setCurrentPage} currentPage={currentPage} onClick={() => setIsSidebarOpen(false)} />
                            <NavItem icon={<FileText />} text="Practice Tests" page="practice" setCurrentPage={setCurrentPage} currentPage={currentPage} onClick={() => setIsSidebarOpen(false)} />
                            <NavItem icon={<TrendingUp />} text="Progress Tracking" page="progress" setCurrentPage={setCurrentPage} currentPage={currentPage} onClick={() => setIsSidebarOpen(false)} />
                            <NavItem icon={<MessageSquare />} text="AI Tutoring Chat" page="ai-chat" setCurrentPage={setCurrentPage} currentPage={currentPage} onClick={() => setIsSidebarOpen(false)} />
                            <NavItem icon={<Settings />} text="Settings" page="settings" setCurrentPage={setCurrentPage} currentPage={currentPage} onClick={() => setIsSidebarOpen(false)} />
                            {userRole === 'admin' && (
                                <NavItem icon={<PlusCircle />} text="Admin Tools" page="admin-tools" setCurrentPage={setCurrentPage} currentPage={currentPage} onClick={() => setIsSidebarOpen(false)} />
                            )}
                        </nav>
                    </div >
                </>
            )}

            <div className="flex-1 flex flex-col overflow-hidden">
                <header className="flex items-center justify-between p-4 bg-white shadow-md md:px-6">
                    {isAuthenticated && (
                        <button onClick={() => setIsSidebarOpen(true)} className="md:hidden text-gray-600 hover:text-gray-900 focus:outline-none">
                            <Menu className="w-6 h-6" />
                        </button>
                    )}
                    <h1 className="text-2xl font-semibold text-gray-800 hidden md:block">SAT Study Assistant</h1>
                    {isAuthenticated ? (
                        <div className="flex items-center space-x-4">
                            <span className="text-gray-700 hidden sm:block">Welcome, {userEmail}!</span>
                            <button
                                onClick={handleLogout}
                                className="bg-indigo-500 text-white px-4 py-2 rounded-lg hover:bg-indigo-600 transition-colors duration-200 shadow-md flex items-center"
                            >
                                <LogOut className="w-4 h-4 mr-2" /> Log Out
                            </button>
                        </div>
                    ) : (
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
                    )}
                </header>

                <main className="flex-1 overflow-x-hidden overflow-y-auto p-4 md:p-6 bg-gray-100">
                    {renderPage()}
                </main>
            </div>
        </div>
    );
}