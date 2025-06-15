import React from 'react';
import Card from '../components/Card';
import QuickLink from '../components/QuickLink';

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

export default Dashboard;
