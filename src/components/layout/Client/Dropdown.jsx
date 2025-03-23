import React, { useState, useRef, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCaretDown, faPlayCircle, faClock, faStar, faHeart } from '@fortawesome/free-solid-svg-icons';

const Dropdown = () => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    const handleToggle = () => {
        setIsOpen(!isOpen);
    };

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    return (
        <div ref={dropdownRef} className="relative">
            <button
                className="flex items-center gap-2 text-white hover:text-red-500 transition-colors duration-300 py-2"
                onClick={handleToggle}
            >
                My List
                <FontAwesomeIcon
                    icon={faCaretDown}
                    className={`transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
                />
            </button>

            {isOpen && (
                <div className="absolute top-full left-0 mt-2 w-56 bg-gray-900/95 backdrop-blur-sm rounded-lg shadow-xl border border-gray-800 overflow-hidden z-50">
                    <div className="py-2">
                        <h3 className="px-4 py-2 text-gray-400 text-sm font-semibold">My Lists</h3>

                        <a href="#" className="flex items-center gap-3 px-4 py-3 text-white hover:bg-gray-800 transition-colors">
                            <FontAwesomeIcon icon={faPlayCircle} className="text-red-500" />
                            <span>Continue Watching</span>
                        </a>

                        <a href="#" className="flex items-center gap-3 px-4 py-3 text-white hover:bg-gray-800 transition-colors">
                            <FontAwesomeIcon icon={faClock} className="text-blue-500" />
                            <span>Watch Later</span>
                        </a>

                        <a href="#" className="flex items-center gap-3 px-4 py-3 text-white hover:bg-gray-800 transition-colors">
                            <FontAwesomeIcon icon={faStar} className="text-yellow-500" />
                            <span>Favorites</span>
                        </a>

                        <a href="#" className="flex items-center gap-3 px-4 py-3 text-white hover:bg-gray-800 transition-colors">
                            <FontAwesomeIcon icon={faHeart} className="text-pink-500" />
                            <span>Custom List</span>
                        </a>

                        <div className="border-t border-gray-700 my-1"></div>

                        <a href="#" className="flex items-center justify-center gap-2 mx-4 my-2 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-white text-sm transition-colors">
                            Create New List
                        </a>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Dropdown;