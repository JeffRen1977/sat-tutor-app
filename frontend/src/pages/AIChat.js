import React, { useState, useEffect, useRef } from 'react';
import { sendChatMessage } from '../services/aiService';

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
            const response = await sendChatMessage(API_BASE_URL, userToken, [...chatHistory, userMessage]);

            if (response.status === 401 || response.status === 403) {
                setChatError('Authentication required. Please log in to use the AI chat.');
                setChatHistory((prev) => [...prev, { role: 'model', text: 'Authentication required. Please log in to continue this conversation.' }]);
                return;
            }

            const result = await response.json();
            if (!response.ok) {
                throw new Error(result.error || 'API request failed');
            }
            const modelResponseText = result.text;
            setChatHistory((prev) => [...prev, { role: 'model', text: modelResponseText }]);
        } catch (error) {
            console.error("Error fetching AI chat response:", error);
            setChatError(`Error communicating with AI tutor: ${error.message || 'Failed to fetch or parse JSON'}`);
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

export default AIChat;
