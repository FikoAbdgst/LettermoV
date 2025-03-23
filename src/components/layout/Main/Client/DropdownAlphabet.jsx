import { faCaretDown } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React from 'react';

const DropdownAlphabet = ({ toggleDropdownAlphabet, selectedSortAlphabetOption, dropdownAlphabetOpen, handleSortAlphabetOptionClick }) => {
    const alphabetOptions = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'];

    return (
        <div className="relative">
            <button
                className={`text-xs md:text-sm text-center w-20 md:w-24 h-8 md:h-10 rounded-lg text-white font-medium mx-2 md:mx-5 transition duration-300 ease-in-out hover:bg-red-800 border-none ${dropdownAlphabetOpen || selectedSortAlphabetOption !== "Alphabet" ? 'bg-red-800' : 'bg-zinc-800'}`}
                onClick={toggleDropdownAlphabet}
            >
                {selectedSortAlphabetOption} <FontAwesomeIcon icon={faCaretDown} className='ml-1' />
            </button>
            {dropdownAlphabetOpen && (
                <div className="absolute border-4 border-zinc-800 h-40 md:h-60 overflow-y-auto bg-zinc-800 rounded-lg shadow-lg mt-2 ml-2 md:ml-5 w-28 md:w-32 p-2 z-50">
                    <ul>
                        <li>
                            <button
                                className="block px-2 md:px-4 py-1 md:py-2 text-xs md:text-sm hover:bg-red-900 hover:rounded-lg w-full text-left"
                                onClick={() => handleSortAlphabetOptionClick('Alphabet')}
                            >
                                Default
                            </button>
                        </li>
                        {alphabetOptions.map((option, index) => (
                            <li key={index}>
                                <button
                                    className={`block px-2 md:px-4 py-1 md:py-2 text-xs md:text-sm hover:bg-red-900 my-1 rounded-lg w-full text-left ${selectedSortAlphabetOption === option ? 'bg-red-700 hover:bg-red-700' : ''}`}
                                    onClick={() => handleSortAlphabetOptionClick(option)}
                                >
                                    {option}
                                </button>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
};

export default DropdownAlphabet;