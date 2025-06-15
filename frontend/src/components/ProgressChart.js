import React from 'react';

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

export default ProgressChart;
