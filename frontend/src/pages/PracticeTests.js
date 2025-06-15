import React from 'react';
import TestCard from '../components/TestCard';

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

export default PracticeTests;
