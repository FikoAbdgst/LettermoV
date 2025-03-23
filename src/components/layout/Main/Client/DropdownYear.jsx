import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCaretDown } from '@fortawesome/free-solid-svg-icons';
import React from 'react';

const DropdownYear = ({ toggleDropdownYear, selectedSortYearOption, dropdownYearOpen, handleSortYearOptionClick }) => {
    // Generate an array of years from 2027 to 1960
    const years = Array.from({ length: 2027 - 1940 + 1 }, (v, i) => 2027 - i);

    return (
        <div className="relative">
            <button
                className={`text-xs md:text-sm text-center w-20 md:w-24 h-8 md:h-10 rounded-lg text-white font-medium mx-2 md:mx-5 transition duration-300 ease-in-out hover:bg-red-800 border-none ${dropdownYearOpen || selectedSortYearOption !== "Year" ? 'bg-red-800' : 'bg-zinc-800'}`}
                onClick={toggleDropdownYear}
            >
                {selectedSortYearOption} <FontAwesomeIcon icon={faCaretDown} className='ml-1' />
            </button>
            {dropdownYearOpen && (
                <div className="absolute w-11/12 border-4 border-zinc-800 h-40 md:h-60 overflow-y-auto bg-zinc-800 rounded-lg shadow-lg mt-2 ml-2 md:ml-5 p-2 z-50">
                    <ul>
                        <li>
                            <button
                                className="block px-2 md:px-4 py-1 md:py-2 text-xs md:text-sm hover:bg-red-900 hover:rounded-lg w-full text-left"
                                onClick={() => handleSortYearOptionClick('Year')}
                            >
                                Default
                            </button>
                        </li>
                        {years.map(year => (
                            <li key={year}>
                                <button
                                    className={`block px-2 md:px-4 py-1 md:py-2 text-xs md:text-sm hover:bg-red-900 my-1 rounded-lg w-full text-left ${selectedSortYearOption === year ? 'bg-red-700 hover:bg-red-700' : ''}`}
                                    onClick={() => handleSortYearOptionClick(year)}
                                >
                                    {year}
                                </button>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    )
}

export default DropdownYear;