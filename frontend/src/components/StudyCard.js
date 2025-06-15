import React from 'react';

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

export default StudyCard;
