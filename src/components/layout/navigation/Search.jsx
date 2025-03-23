import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faSpinner, faFilm, faTv, faTimes } from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';

const Search = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showResults, setShowResults] = useState(false);
    const searchRef = useRef(null);
    const navigate = useNavigate();

    const apiKey = import.meta.env.VITE_APIKEY;
    const baseUrl = import.meta.env.VITE_BASEURL;
    const imageBaseUrl = 'https://image.tmdb.org/t/p/w92';

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (searchRef.current && !searchRef.current.contains(event.target)) {
                setShowResults(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            if (searchQuery.length > 2) {
                performSearch();
            } else {
                setSearchResults([]);
                setShowResults(false);
            }
        }, 500);

        return () => clearTimeout(delayDebounceFn);
    }, [searchQuery]);

    const performSearch = async () => {
        if (!searchQuery.trim()) return;

        setLoading(true);
        try {
            const response = await axios.get(
                `${baseUrl}/search/multi?query=${encodeURIComponent(searchQuery)}&api_key=${apiKey}&include_adult=false`
            );

            const filteredResults = response.data.results
                .filter(item => item.media_type === 'movie' || item.media_type === 'tv')
                .slice(0, 4);

            setSearchResults(filteredResults);
            setShowResults(true);
        } catch (error) {
            console.error('Error searching:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (e) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
            setShowResults(false);
        }
    };

    const handleClearSearch = () => {
        setSearchQuery('');
        setSearchResults([]);
        setShowResults(false);
    };

    // Updated to use Link and save ID to localStorage
    const handleResultClick = (result) => {
        localStorage.setItem('selectedMovieId', result.id);
        setShowResults(false);
        setSearchQuery('');
    };

    const handleFocus = () => {
        if (searchQuery.length > 2 && searchResults.length > 0) {
            setShowResults(true);
        }
    };

    return (
        <div className="relative" ref={searchRef}>
            <form onSubmit={handleSearch} className="flex items-center">
                <div className="relative w-full">
                    <input
                        id="search-input"
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onFocus={handleFocus}
                        placeholder="Search movies, tv shows..."
                        className="bg-stone-800/80 border border-stone-700 outline-none text-white px-4 py-2 w-full md:w-56 rounded-lg text-sm placeholder:text-stone-400 focus:border-red-600 transition-all pr-10"
                        autoComplete="off"
                    />

                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-stone-400">
                        {loading ? (
                            <FontAwesomeIcon icon={faSpinner} spin />
                        ) : searchQuery ? (
                            <button type="button" onClick={handleClearSearch} className="text-stone-400 hover:text-white transition-colors">
                                <FontAwesomeIcon icon={faTimes} />
                            </button>
                        ) : (
                            <button type="submit" className="text-stone-400 hover:text-white transition-colors">
                                <FontAwesomeIcon icon={faSearch} />
                            </button>
                        )}
                    </div>
                </div>
            </form>

            {showResults && searchResults.length > 0 && (
                <div className="absolute top-full right-0 mt-2 w-full bg-stone-900 border border-stone-700 rounded-lg shadow-lg z-50 overflow-hidden">
                    <div className="max-h-96 ">
                        {searchResults.map((result) => (
                            <Link
                                to="/detail"
                                key={`${result.media_type}-${result.id}`}
                                onClick={() => handleResultClick(result)}
                            >
                                <div
                                    className="flex p-2 hover:bg-stone-800 cursor-pointer border-b border-stone-700 last:border-b-0"
                                >
                                    <div className="w-12 h-16 flex-shrink-0 bg-stone-800 rounded overflow-hidden">
                                        {result.poster_path ? (
                                            <img
                                                src={`${imageBaseUrl}${result.poster_path}`}
                                                alt={result.title || result.name}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center bg-stone-800 text-stone-500">
                                                <FontAwesomeIcon icon={result.media_type === 'movie' ? faFilm : faTv} />
                                            </div>
                                        )}
                                    </div>
                                    <div className="ml-3 flex flex-col justify-center overflow-hidden">
                                        <p className="text-white font-medium text-sm truncate">
                                            {result.title || result.name}
                                        </p>
                                        <p className="text-stone-400 text-xs">
                                            {result.media_type === 'movie' ? 'Movie' : 'TV Series'} •
                                            {result.release_date || result.first_air_date
                                                ? new Date(result.release_date || result.first_air_date).getFullYear()
                                                : 'Unknown Year'}
                                        </p>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                    <div className="p-2 border-t border-stone-700 bg-stone-800">
                        <button
                            onClick={handleSearch}
                            className="w-full text-center text-sm text-red-600 py-1.5 rounded-full transition-colors"
                        >
                            View all results
                        </button>
                    </div>
                </div>
            )}

            {showResults && searchQuery.length > 2 && searchResults.length === 0 && !loading && (
                <div className="absolute top-full right-0 mt-2 w-full bg-stone-900 border border-stone-700 rounded-lg shadow-lg z-50 p-4 text-center">
                    <p className="text-stone-400 text-sm">No results found for "{searchQuery}"</p>
                </div>
            )}
        </div>
    );
};

export default Search;