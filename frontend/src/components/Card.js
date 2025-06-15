import React from 'react';

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

export default Card;
