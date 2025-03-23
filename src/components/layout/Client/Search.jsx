import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faTimes } from '@fortawesome/free-solid-svg-icons';

const Search = () => {
    const [isExpanded, setIsExpanded] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    const handleToggleSearch = () => {
        setIsExpanded(!isExpanded);
        if (isExpanded) {
            setSearchQuery('');
        }
    };

    const handleSearch = (e) => {
        e.preventDefault();
        // Handle search logic here
        console.log("Searching for:", searchQuery);
    };

    return (
        <div className="relative">
            <div className={`flex items-center transition-all duration-300 ${isExpanded ? 'w-64' : 'w-10'}`}>
                {isExpanded ? (
                    <form onSubmit={handleSearch} className="flex w-full">
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search movies, series..."
                            className="bg-gray-800/70 border-none outline-none text-white px-4 py-2 w-full rounded-l-full"
                        />
                        <button
                            type="button"
                            onClick={handleToggleSearch}
                            className="bg-gray-800/70 rounded-r-full px-3 py-2 text-gray-300 hover:text-white transition-colors"
                        >
                            <FontAwesomeIcon icon={faTimes} />
                        </button>
                    </form>
                ) : (
                    <button
                        onClick={handleToggleSearch}
                        className="text-gray-300 hover:text-white transition-colors w-10 h-10 flex items-center justify-center"
                    >
                        <FontAwesomeIcon icon={faSearch} className="text-xl" />
                    </button>
                )}
            </div>
        </div>
    );
};

export default Search;