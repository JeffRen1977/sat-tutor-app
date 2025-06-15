import React from 'react';

function NavItem({ icon, text, page, setCurrentPage, currentPage, onClick }) {
    return (
        <button
            onClick={() => { setCurrentPage(page); if(onClick) onClick(); }}
            className={`flex items-center w-full px-4 py-3 my-2 rounded-lg text-left transition-colors duration-200 ${
                currentPage === page
                    ? 'bg-indigo-100 text-indigo-700 font-semibold shadow-sm'
                    : 'text-gray-700 hover:bg-gray-100 hover:text-indigo-600'
            }`}
        >
            {React.cloneElement(icon, { className: "w-5 h-5 mr-3" })}
            <span className="text-lg">{text}</span>
        </button>
    );
}

export default NavItem;
