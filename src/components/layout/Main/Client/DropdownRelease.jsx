import { faCaretDown } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React from 'react';

const DropdownRelease = ({ toggleDropdown, selectedSortOption, dropdownOpen, handleSortOptionClick }) => {
    return (
        <div className="relative">
            <button
                className={`text-xs md:text-sm text-center w-20 md:w-24 h-8 md:h-10 rounded-lg text-white font-medium mx-2 md:mx-5 transition duration-300 ease-in-out hover:bg-red-800 border-none ${dropdownOpen || selectedSortOption !== "Default" ? 'bg-red-800' : 'bg-zinc-800'}`}
                onClick={toggleDropdown}
            >
                {selectedSortOption} <FontAwesomeIcon icon={faCaretDown} className='ml-1' />
            </button>
            {dropdownOpen && (
                <div className="absolute border-4 border-zinc-800 bg-zinc-800 rounded-lg shadow-lg mt-2 ml-2 md:ml-5 w-28 md:w-32 p-2 z-50">
                    <ul>
                        <li>
                            <button
                                className="block px-2 md:px-4 py-1 md:py-2 text-xs md:text-sm hover:bg-red-900 hover:rounded-lg w-full text-left"
                                onClick={() => handleSortOptionClick('Default')}
                            >
                                Default
                            </button>
                        </li>
                        <li>
                            <button
                                className={`block px-2 md:px-4 py-1 md:py-2 text-xs md:text-sm hover:bg-red-900 my-1 rounded-lg w-full text-left ${selectedSortOption === "Newest" ? 'bg-red-700 hover:bg-red-700' : ''}`}
                                onClick={() => handleSortOptionClick('Newest')}
                            >
                                Newest
                            </button>
                        </li>
                        <li>
                            <button
                                className={`block px-2 md:px-4 py-1 md:py-2 text-xs md:text-sm hover:bg-red-900 my-1 rounded-lg w-full text-left ${selectedSortOption === "Earliest" ? 'bg-red-700 hover:bg-red-700' : ''}`}
                                onClick={() => handleSortOptionClick('Earliest')}
                            >
                                Earliest
                            </button>
                        </li>
                    </ul>
                </div>
            )}
        </div>
    );
};

export default DropdownRelease;