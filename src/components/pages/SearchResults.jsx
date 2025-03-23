import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFilm, faTv, faStar, faSpinner, faPlay, faPlus } from '@fortawesome/free-solid-svg-icons';
import Navigation from '../layout/Navigation';
import MovieActionTooltip from '../layout/home/MovieActionTooltip';

const SearchResults = () => {
    const [searchParams] = useSearchParams();
    const query = searchParams.get('q');

    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);
    const [activeTab, setActiveTab] = useState('all');
    const [gridCols, setGridCols] = useState("grid-cols-5");

    const apiKey = import.meta.env.VITE_APIKEY;
    const baseUrl = import.meta.env.VITE_BASEURL;
    const imageBaseUrl = 'https://image.tmdb.org/t/p/w500';

    useEffect(() => {
        if (query) {
            setLoading(true);
            fetchResults();
        }
    }, [query, page, activeTab]);

    // Effect to update grid columns based on screen size
    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth < 640) { // Mobile
                setGridCols("grid-cols-3"); // 3 item per baris di mobile
            } else if (window.innerWidth < 768) { // Small tablets
                setGridCols("grid-cols-3");
            } else if (window.innerWidth < 1024) { // Tablets
                setGridCols("grid-cols-4");
            } else { // Desktop
                setGridCols("grid-cols-6"); // 6 item per baris di desktop
            }
        };

        handleResize(); // Set nilai awal
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);


    const fetchResults = async () => {
        try {
            // Determine search endpoint based on active tab
            const endpoint = activeTab === 'all'
                ? 'multi'
                : activeTab === 'movies'
                    ? 'movie'
                    : 'tv';

            const response = await axios.get(
                `${baseUrl}/search/${endpoint}?query=${encodeURIComponent(query)}&page=${page}&api_key=${apiKey}&include_adult=false`
            );

            let filteredResults = response.data.results;

            // For multi-search, filter to only movies and TV shows
            if (endpoint === 'multi') {
                filteredResults = filteredResults.filter(
                    item => item.media_type === 'movie' || item.media_type === 'tv'
                );
            }

            setResults(filteredResults);
            setTotalPages(response.data.total_pages > 20 ? 20 : response.data.total_pages);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching search results:', error);
            setLoading(false);
        }
    };

    const handleTabChange = (tab) => {
        if (tab !== activeTab) {
            setActiveTab(tab);
            setPage(1);
        }
    };

    // Function to handle saving movie ID to localStorage
    const handleSaveMovieId = (id) => {
        localStorage.setItem('selectedMovieId', id);
    };

    if (!query) {
        return (
            <div className="container mx-auto px-4 pt-28 pb-16 min-h-screen">
                <div className="text-center text-white">
                    <h2 className="text-2xl font-bold mb-4">No search query provided</h2>
                    <p>Please enter a search term to find movies and TV shows.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="pt-24 md:pt-28 pb-16 min-h-screen bg-stone-950">
            <Navigation />
            <div className="container mx-auto px-4 md:px-6">
                <h1 className="text-2xl md:text-3xl font-bold text-white mb-4">
                    Search Results: <span className="text-red-600">"{query}"</span>
                </h1>

                {/* Filter tabs */}
                <div className="flex mb-6 border-b border-stone-800">
                    <button
                        className={`px-4 py-3 text-sm font-medium ${activeTab === 'all' ? 'text-red-600 border-b-2 border-red-600' : 'text-stone-400 hover:text-white'}`}
                        onClick={() => handleTabChange('all')}
                    >
                        All
                    </button>
                    <button
                        className={`px-4 py-3 text-sm font-medium ${activeTab === 'movies' ? 'text-red-600 border-b-2 border-red-600' : 'text-stone-400 hover:text-white'}`}
                        onClick={() => handleTabChange('movies')}
                    >
                        Movies
                    </button>
                    <button
                        className={`px-4 py-3 text-sm font-medium ${activeTab === 'tv' ? 'text-red-600 border-b-2 border-red-600' : 'text-stone-400 hover:text-white'}`}
                        onClick={() => handleTabChange('tv')}
                    >
                        TV Shows
                    </button>
                </div>

                {loading ? (
                    <div className="flex justify-center items-center py-20">
                        <FontAwesomeIcon icon={faSpinner} spin className="text-red-600 text-3xl" />
                    </div>
                ) : results.length === 0 ? (
                    <div className="w-full h-96 flex flex-col justify-center items-center">
                        <p className="mt-2 text-lg font-semibold text-white">No results found</p>
                        <p className='font-bold text-gray-600'>Try different keywords or filters 😊</p>
                    </div>
                ) : (
                    <>
                        <div className="w-full h-full flex flex-wrap justify-center items-center relative px-4">
                            <div className={`w-full sm:w-11/12 md:w-10/12 lg:w-4/5 grid ${gridCols} gap-2 sm:gap-4 md:gap-6 py-4 sm:py-6 md:py-10`}>
                                {results.map((item) => {
                                    const mediaType = item.media_type || (activeTab === 'movies' ? 'movie' : 'tv');
                                    const title = item.title || item.name;
                                    const truncatedTitle = title.length >= 15 ? title.substring(0, 15) + "..." : title;
                                    const releaseDate = item.release_date || item.first_air_date;
                                    const year = releaseDate ? new Date(releaseDate).getFullYear() : "N/A";

                                    return (
                                        <div className="z-50 text-start mt-5" key={`${mediaType}-${item.id}`}>
                                            <div className="mb-1 sm:mb-2 relative group overflow-hidden rounded-lg">
                                                {item.poster_path ? (
                                                    <img
                                                        className="w-full h-auto aspect-[2/3] rounded-lg transition-transform duration-300 ease-in-out transform group-hover:scale-110 group-hover:blur-sm group-hover:opacity-50"
                                                        src={`${imageBaseUrl}${item.poster_path}`}
                                                        alt={title}
                                                        loading="lazy"
                                                    />
                                                ) : (
                                                    <div className="w-full h-auto aspect-[2/3] rounded-lg flex items-center justify-center bg-stone-800 transition-transform duration-300 ease-in-out transform group-hover:scale-110 group-hover:blur-sm group-hover:opacity-50">
                                                        <FontAwesomeIcon
                                                            icon={mediaType === 'movie' ? faFilm : faTv}
                                                            className="text-4xl text-stone-600"
                                                        />
                                                    </div>
                                                )}

                                                {/* Media type badge */}
                                                <div className="absolute top-2 left-2 bg-red-600 text-white text-xs rounded-lg px-2 py-1">
                                                    {mediaType === 'movie' ? 'Movie' : 'TV'}
                                                </div>

                                                {/* Updated to use Link to "/detail" */}
                                                <Link to="/detail">
                                                    <button className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 absolute inset-0 m-auto opacity-0 bg-transparent group-hover:opacity-100 rounded-full border-2 sm:border-4 flex items-center justify-center"
                                                        onClick={() => handleSaveMovieId(item.id)} title={title}
                                                    >
                                                        <FontAwesomeIcon icon={faPlay} className='text-base sm:text-xl md:text-2xl text-white' />
                                                    </button>
                                                </Link>
                                            </div>

                                            <div className="flex items-center h-5 sm:h-6 md:h-8 font-bold text-xs sm:text-sm md:text-base text-gray-200 truncate">
                                                {truncatedTitle}
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <div className="font-mono text-xs sm:text-sm md:text-md text-gray-500">
                                                    {year}
                                                </div>
                                                <div className='flex justify-center items-center gap-1 sm:gap-2'>
                                                    <div className="hidden sm:block">
                                                        <MovieActionTooltip />
                                                    </div>

                                                    <div className="text-xs sm:text-sm text-yellow-500 font-bold ml-1">
                                                        <FontAwesomeIcon icon={faStar} className="pr-0.5 sm:pr-1" />
                                                        {item.vote_average ? item.vote_average.toFixed(1) : "N/A"}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="flex justify-center mt-10">
                                <div className="flex items-center space-x-2">
                                    <button
                                        onClick={() => setPage(prev => Math.max(prev - 1, 1))}
                                        disabled={page === 1}
                                        className={`px-4 py-2 rounded-lg ${page === 1 ? 'bg-stone-800 text-stone-500 cursor-not-allowed' : 'bg-stone-800 text-white hover:bg-stone-700'}`}
                                    >
                                        Prev
                                    </button>

                                    <span className="text-white px-4">
                                        Page {page} of {totalPages}
                                    </span>

                                    <button
                                        onClick={() => setPage(prev => Math.min(prev + 1, totalPages))}
                                        disabled={page === totalPages}
                                        className={`px-4 py-2 rounded-lg ${page === totalPages ? 'bg-stone-800 text-stone-500 cursor-not-allowed' : 'bg-stone-800 text-white hover:bg-stone-700'}`}
                                    >
                                        Next
                                    </button>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default SearchResults;