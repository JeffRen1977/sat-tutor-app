import React from 'react';

function QuickLink({ text }) {
    return (
        <button className="bg-gray-100 text-gray-700 px-4 py-3 rounded-lg hover:bg-gray-200 transition-colors duration-200 shadow-sm text-center font-medium">
            {text}
        </button>
    );
}

export default QuickLink;
