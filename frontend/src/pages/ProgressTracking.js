import React from 'react';
import ProgressChart from '../components/ProgressChart';

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

export default ProgressTracking;
