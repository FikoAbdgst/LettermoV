import React, { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faClock, faEye, faHeart, faPlay, faStar, faChevronDown, faChevronUp, faTimes, faChevronRight, faChevronLeft } from '@fortawesome/free-solid-svg-icons';
import { Link } from 'react-router-dom';
import RecommendationSection from './RecommendationSection';
import '../../../App.css';

const DetailCard = () => {
    const [dataMovie, setDataMovie] = useState(null);
    const [contentRating, setContentRating] = useState('');
    const [director, setDirector] = useState('');
    const [writers, setWriters] = useState([]);
    const [cast, setCast] = useState([]);
    const [backdropImage, setBackdropImage] = useState(null);
    const [smallPosters, setSmallPosters] = useState([]);
    const [showWriters, setShowWriters] = useState(false);
    const [trailerUrl, setTrailerUrl] = useState('');
    const [favorites, setFavorites] = useState(false);
    const [watchLater, setWatchLater] = useState(false);
    const [watched, setWatched] = useState(false);
    const [activeTab, setActiveTab] = useState('details'); // New state for mobile tabs
    const tooltipRef = useRef(null);
    const [isLoading, setIsLoading] = useState(true);
    const [hasError, setHasError] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [activeSection, setActiveSection] = useState('cast'); // Options: 'cast' or 'crew'

    const fetchData = async () => {
        const movieId = localStorage.getItem('selectedMovieId');
        const mediaType = localStorage.getItem('selectedMediaType') || 'movie'; // Provide default

        if (!movieId) {
            // Try to get the ID from URL if not in localStorage
            const pathSegments = window.location.pathname.split('/');
            const potentialId = pathSegments[pathSegments.length - 1];

            // Check if it's a valid ID (numeric)
            if (potentialId && !isNaN(potentialId)) {
                localStorage.setItem('selectedMovieId', potentialId);
            }
        }
        if (!movieId) {
            setHasError(true);
            setErrorMessage('No movie or media type selected');
            setIsLoading(false);
            return;
        }

        setIsLoading(true);
        setHasError(false);

        try {
            // Fetch movie details
            const detailsResponse = await axios.get(
                `https://api.themoviedb.org/3/${mediaType}/${movieId}?api_key=${import.meta.env.VITE_APIKEY}`
            );
            setDataMovie(detailsResponse.data);

            // Fetch content rating
            try {
                const ratingResponse = await axios.get(
                    `https://api.themoviedb.org/3/movie/${movieId}/release_dates?api_key=${import.meta.env.VITE_APIKEY}`
                );
                const usRelease = ratingResponse.data.results.find(r => r.iso_3166_1 === 'US');
                if (usRelease) {
                    const usRating = usRelease.release_dates.find(date => date.certification);
                    setContentRating(usRating ? usRating.certification : 'Not Rated');
                }
            } catch (error) {
                console.error('Error fetching content rating:', error);
                // Continue despite this error
            }

            // Fetch trailer
            try {
                const trailerResponse = await axios.get(
                    `https://api.themoviedb.org/3/${mediaType}/${movieId}/videos?api_key=${import.meta.env.VITE_APIKEY}`
                );
                const trailers = trailerResponse.data.results.filter(video => video.type === 'Trailer');
                if (trailers.length > 0) {
                    setTrailerUrl(`https://www.youtube.com/watch?v=${trailers[0].key}`);
                }
            } catch (error) {
                console.error('Error fetching trailer:', error);
                // Continue despite this error
            }

            // Fetch credits
            try {
                const creditsResponse = await axios.get(
                    `https://api.themoviedb.org/3/${mediaType}/${movieId}/credits?api_key=${import.meta.env.VITE_APIKEY}`
                );

                if (creditsResponse.data) {
                    const crew = creditsResponse.data.crew || [];
                    const castData = creditsResponse.data.cast || [];

                    // Find director - for TV shows, look for created_by if director isn't found
                    const director = crew.find(member => member.job === 'Director');
                    const createdBy = detailsResponse.data.created_by && detailsResponse.data.created_by.length > 0
                        ? detailsResponse.data.created_by[0]
                        : null;

                    // Writers - look for specific writing roles
                    const writers = crew.filter(member =>
                        member.job === 'Writer' ||
                        member.job === 'Screenplay' ||
                        member.job === 'Story' ||
                        member.known_for_department === "Writing"
                    );

                    setDirector(director ? director.name : (createdBy ? createdBy.name : 'Director not available'));
                    setWriters(writers.length > 0 ? writers.map(writer => writer.name) : ['Writers not available']);

                    // Make sure we get cast data and limit to top 10
                    if (castData && castData.length > 0) {
                        setCast(castData.slice(0, 10));
                    } else {
                        setCast([]);
                        console.log('No cast data available');
                    }
                }
            } catch (error) {
                console.error('Error fetching credits:', error);
                setDirector('Director not available');
                setWriters(['Writers not available']);
                setCast([]);
            }
            // Fetch gallery images
            try {
                const galleryResponse = await axios.get(
                    `https://api.themoviedb.org/3/${mediaType}/${movieId}/images?api_key=${import.meta.env.VITE_APIKEY}`
                );
                const backdrops = galleryResponse.data.backdrops;
                const posters = galleryResponse.data.posters;

                if (backdrops.length > 0) {
                    const shuffledBackdrops = backdrops.sort(() => 0.5 - Math.random());
                    setBackdropImage(shuffledBackdrops[0]);
                }
                if (posters.length > 3) {
                    const shuffledPosters = posters.sort(() => 0.5 - Math.random());
                    setSmallPosters(shuffledPosters.slice(0, 3));
                } else {
                    setSmallPosters(posters);
                }
            } catch (error) {
                console.error('Error fetching gallery images:', error);
                // Continue despite this error
            }

        } catch (error) {
            console.error('Error fetching movie details:', error);
            setHasError(true);
            setErrorMessage(error.response?.data?.status_message || 'Error loading movie details');
        } finally {
            setIsLoading(false);
        }
    };

    // Add useEffect to extract ID from URL on component mount
    // Update the useEffect (around line 204)
    useEffect(() => {
        // Get ID from URL if present
        const pathSegments = window.location.pathname.split('/');
        const potentialId = pathSegments[pathSegments.length - 1];

        if (potentialId && !isNaN(potentialId)) {
            localStorage.setItem('selectedMovieId', potentialId);
        }

        // Make sure we always have a movieId before fetching
        const movieId = localStorage.getItem('selectedMovieId');
        if (movieId) {
            fetchData();
        } else {
            setHasError(true);
            setErrorMessage('No movie ID found. Please select a movie first.');
            setIsLoading(false);
        }
    }, []);

    const toggleCastCrewSection = (section) => {
        setActiveSection(section);
    };
    const formatRuntime = (runtime) => {
        const hours = Math.floor(runtime / 60);
        const minutes = runtime % 60;
        return `${hours}h ${minutes}m`;
    };

    const getNumberOfSeasons = (data) => {
        return data.number_of_seasons || 'Seasons not available';
    };

    const toggleWriters = () => {
        setShowWriters(!showWriters);
    };

    const handleClickOutside = (event) => {
        if (tooltipRef.current && !tooltipRef.current.contains(event.target)) {
            setShowWriters(false);
        }
    };

    useEffect(() => {
        if (showWriters) {
            document.addEventListener("mousedown", handleClickOutside);
        } else {
            document.removeEventListener("mousedown", handleClickOutside);
        }
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [showWriters]);

    const toggleFavorites = () => {
        setFavorites(!favorites);
    };

    const toggleWatchLater = () => {
        setWatchLater(!watchLater);
    };

    const toggleWatched = () => {
        setWatched(!watched);
    };



    // Render tabs for mobile view
    const renderMobileTabs = () => {
        return (
            <div className="flex w-full border-b border-zinc-700 mb-4 md:hidden">
                <button
                    className={`flex-1 py-3 text-center text-sm font-medium ${activeTab === 'details' ? 'text-white border-b-2 border-red-500' : 'text-gray-400'}`}
                    onClick={() => setActiveTab('details')}
                >
                    Details
                </button>
                <button
                    className={`flex-1 py-3 text-center text-sm font-medium ${activeTab === 'cast_crew' ? 'text-white border-b-2 border-red-500' : 'text-gray-400'}`}
                    onClick={() => setActiveTab('cast_crew')}
                >
                    Cast & Crew
                </button>
                <button
                    className={`flex-1 py-3 text-center text-sm font-medium ${activeTab === 'gallery' ? 'text-white border-b-2 border-red-500' : 'text-gray-400'}`}
                    onClick={() => setActiveTab('gallery')}
                >
                    Gallery
                </button>
            </div>
        );
    };

    // Render the active tab content for mobile
    const renderActiveTabContent = () => {
        if (!dataMovie) return null;

        if (activeTab === 'details') {
            return (
                <div className='w-full px-4 md:hidden'>
                    <h1 className='pb-3 text-lg font-medium'>Movie Details</h1>
                    <div className='text-sm'>
                        <h1 className='py-2 flex justify-between'><span className="font-medium">Studios:</span> <span className='text-gray-400'>{dataMovie.production_companies && dataMovie.production_companies.length > 0 ? dataMovie.production_companies.map(company => company.name).join(', ') : 'N/A'}</span></h1>
                        <h1 className='py-2 flex justify-between'><span className="font-medium">Country:</span> <span className='text-gray-400 text-right'>{dataMovie.production_countries && dataMovie.production_countries.length > 0 ? dataMovie.production_countries.map(country => country.name).join(', ') : 'N/A'}</span></h1>
                        <h1 className='py-2 flex justify-between'><span className="font-medium">Language:</span> <span className='text-gray-400 text-right'>{dataMovie.spoken_languages && dataMovie.spoken_languages.length > 0 ? dataMovie.spoken_languages.map(language => language.english_name).join(', ') : 'N/A'}</span></h1>
                        <h1 className='py-2 flex justify-between'><span className="font-medium">Release Date:</span> <span className='text-gray-400'>{dataMovie.release_date || dataMovie.first_air_date || 'N/A'}</span></h1>
                    </div>
                    <div className='mt-6 mb-4 border-t py-2'>
                        <h1 className='text-lg font-medium my-2'>StoryLine</h1>
                        <p className='text-sm leading-relaxed text-gray-300'>{dataMovie.overview || 'No storyline available'}</p>
                    </div>
                </div>
            );
        } else if (activeTab === 'cast_crew') {
            return (
                <div className='w-full px-4 md:hidden'>
                    <h1 className='pb-3 text-lg font-medium'>Cast & Crew</h1>

                    {/* Director section */}
                    <div className="mb-4">
                        <h2 className="text-gray-400 text-sm mb-2">Director</h2>
                        <div className='flex items-center bg-zinc-800 p-3 rounded-lg'>
                            <div className="w-12 h-12 rounded-full bg-zinc-700 flex items-center justify-center text-sm mr-3 flex-shrink-0">
                                D
                            </div>
                            <div>
                                <h1 className="font-medium text-sm">{director || 'N/A'}</h1>
                            </div>
                        </div>
                    </div>

                    {/* Writers section */}
                    {writers.length > 0 && (
                        <div className="mb-4">
                            <h2 className="text-gray-400 text-sm mb-2">Writers</h2>
                            <div className='flex flex-col gap-2'>
                                {writers.slice(0, 3).map((writer, index) => (
                                    <div key={index} className='flex items-center bg-zinc-800 p-3 rounded-lg'>
                                        <div className="w-12 h-12 rounded-full bg-zinc-700 flex items-center justify-center text-sm mr-3 flex-shrink-0">
                                            W
                                        </div>
                                        <div>
                                            <h1 className="font-medium text-sm">{writer}</h1>
                                        </div>
                                    </div>
                                ))}

                                {writers.length > 3 && (
                                    <button
                                        className="text-center text-sm text-blue-400 bg-zinc-800 p-3 rounded-lg"
                                        onClick={toggleWriters}
                                    >
                                        Show all {writers.length} writers
                                    </button>
                                )}

                                {showWriters && (
                                    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50" onClick={toggleWriters}>
                                        <div className="bg-zinc-800 p-4 rounded-lg w-4/5 max-h-3/4 overflow-y-auto" onClick={e => e.stopPropagation()}>
                                            <div className="flex justify-between items-center mb-4">
                                                <h2 className="text-lg font-medium">All Writers</h2>
                                                <button onClick={toggleWriters}>
                                                    <FontAwesomeIcon icon={faTimes} />
                                                </button>
                                            </div>
                                            <div className="grid grid-cols-1 gap-2">
                                                {writers.map((writer, index) => (
                                                    <div key={index} className="p-2 border-b border-zinc-700">
                                                        {writer}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Cast section */}
                    <h2 className="text-gray-400 text-sm mb-2">Cast</h2>
                    <div className='grid grid-cols-1 gap-4 pb-6'>
                        {cast && cast.length > 0 ? (
                            cast.map(actor => (
                                <div key={actor.id || `cast-${Math.random()}`} className='flex items-center bg-zinc-800 p-3 rounded-lg'>
                                    <div className="w-12 h-12 rounded-full overflow-hidden mr-3 flex-shrink-0">
                                        {actor.profile_path ? (
                                            <img
                                                src={`https://image.tmdb.org/t/p/w200/${actor.profile_path}`}
                                                alt={actor.name}
                                                className="w-full h-full object-cover"
                                                onError={(e) => {
                                                    e.target.onerror = null;
                                                    e.target.src = ""; // Empty src when image fails
                                                    e.target.parentNode.classList.add("bg-gray-700");
                                                    e.target.parentNode.innerHTML = `<div class="w-full h-full flex items-center justify-center text-sm">${actor.name?.charAt(0) || "?"}</div>`;
                                                }}
                                            />
                                        ) : (
                                            <div className="w-full h-full bg-gray-700 flex items-center justify-center text-sm">
                                                {actor.name?.charAt(0) || "?"}
                                            </div>
                                        )}
                                    </div>
                                    <div>
                                        <h1 className="font-medium text-sm">{actor.name || "Unknown"}</h1>
                                        <p className="text-gray-400 text-xs">{actor.character || "Unknown character"}</p>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="bg-zinc-800 p-4 rounded-lg text-center">
                                <p className="text-gray-400">No cast information available</p>
                            </div>
                        )}
                    </div>

                </div>
            );
        } else if (activeTab === 'gallery') {
            return (
                <div className='w-full px-4 md:hidden'>
                    <h1 className='pb-3 text-lg font-medium'>Gallery</h1>
                    {backdropImage && (
                        <div>
                            <div className='mb-4 rounded-lg overflow-hidden'>
                                <img
                                    className="w-full h-full object-cover"
                                    src={`https://image.tmdb.org/t/p/original/${backdropImage.file_path}`}
                                    alt="Backdrop"
                                />
                            </div>

                            <div className='grid grid-cols-3 gap-2'>
                                {smallPosters.map((poster, index) => (
                                    <div key={index} className="rounded-lg overflow-hidden">
                                        <img
                                            className="object-cover w-full h-32"
                                            src={`https://image.tmdb.org/t/p/w500/${poster.file_path}`}
                                            alt={`Poster ${index + 1}`}
                                        />
                                    </div>
                                ))}
                            </div>
                            <button className='w-full my-4 p-3 text-sm bg-zinc-800 hover:bg-zinc-700 transition-colors duration-300 rounded-lg flex items-center justify-center'>
                                View All Photos <FontAwesomeIcon icon={faChevronRight} className="ml-2" />
                            </button>
                        </div>
                    )}
                </div>
            );
        }
    };

    return (
        <div className="w-full h-auto relative">
            <button className="absolute top-10 left-10 text-white" onClick={() => window.history.back()}>
                <FontAwesomeIcon icon={faChevronLeft} className="text-2xl" />
            </button>
            <div className="w-full h-1/2 absolute bottom-0 bg-gradient-to-t from-zinc-900"></div>
            <div className="w-full h-12 absolute -bottom-12 bg-gradient-to-b from-zinc-900"></div>

            {isLoading ? (
                <div className="flex justify-center items-center min-h-[60vh]">
                    <div className="bg-zinc-800 p-6 rounded-lg text-center">
                        <p className="text-white text-lg mb-2">Loading movie details...</p>
                        <div className="w-8 h-8 border-t-2 border-b-2 border-white rounded-full animate-spin mx-auto"></div>
                    </div>
                </div>
            ) : hasError ? (
                <div className="flex justify-center items-center min-h-[60vh]">
                    <div className="bg-zinc-800 p-6 rounded-lg text-center max-w-md">
                        <p className="text-white text-lg mb-2">Failed to load movie details</p>
                        <p className="text-gray-400 mb-4">{errorMessage}</p>
                        <button
                            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg"
                            onClick={fetchData}
                        >
                            Try Again
                        </button>
                    </div>
                </div>
            ) : dataMovie ? (
                <>
                    <div className='w-full h-full'>
                        {dataMovie.backdrop_path ? (
                            <img
                                className="object-cover object-center w-full h-full min-h-[50vh] md:min-h-[80vh]"
                                src={`https://image.tmdb.org/t/p/original/${dataMovie.backdrop_path}`}
                                alt={dataMovie.title || dataMovie.name}
                            />
                        ) : (
                            <div className='w-full h-full min-h-[50vh] md:min-h-[80vh] bg-black flex justify-center'>
                                <h1 className='text-white mt-48'>No Picture Detected</h1>
                            </div>
                        )}

                        {trailerUrl ? (
                            <a href={trailerUrl} target="_blank" rel="noopener noreferrer">
                                <button className="w-14 h-14 absolute inset-0 m-auto bg-white rounded-full flex justify-center items-center mt-20 md:mt-48 lg:mt-64 hover:bg-red-100 transition-colors duration-300 shadow-lg">
                                    <FontAwesomeIcon icon={faPlay} className='text-xl md:text-2xl text-red-600' />
                                </button>
                            </a>
                        ) : (
                            <Link to={'/detail'}>
                                <button className="w-14 h-14 absolute inset-0 m-auto bg-white rounded-full flex justify-center items-center mt-20 md:mt-48 lg:mt-64 hover:bg-red-100 transition-colors duration-300 shadow-lg">
                                    <FontAwesomeIcon icon={faPlay} className='text-xl md:text-2xl text-red-600' />
                                </button>
                            </Link>
                        )}
                    </div>

                    <div className='relative'>
                        {/* Mobile title section - improved */}
                        <div className="w-full absolute -top-28 md:-top-40 flex justify-start items-center flex-col">
                            <div className="w-full md:w-11/12 lg:w-3/4 p-3 md:p-5 flex justify-start items-center">
                                <h1 className='py-1 text-xl md:text-2xl font-bold'>
                                    {dataMovie.title || dataMovie.name}
                                    <span className="text-gray-400 ml-2">({dataMovie.release_date ? dataMovie.release_date.substring(0, 4) : dataMovie.first_air_date?.substring(0, 4)})</span>
                                </h1>
                            </div>



                            <div className='w-full md:w-11/12 lg:w-3/4 border-y py-5 md:py-10 flex flex-col md:flex-row justify-start'>
                                {/* Poster and action buttons - More centered and cleaner on mobile */}
                                <div className="flex flex-col items-center md:items-start md:block px-4 md:px-0">
                                    <div className="shadow-lg rounded-lg overflow-hidden w-48 md:w-60 lg:w-72">
                                        <img
                                            className="w-full h-auto"
                                            src={`https://image.tmdb.org/t/p/w500/${dataMovie.poster_path}`}
                                            alt={dataMovie.title || dataMovie.name}
                                        />
                                    </div>
                                    <div className="flex justify-center gap-3 my-4">
                                        <button
                                            className={`w-12 h-12 flex items-center justify-center rounded-full shadow-lg transition-colors duration-300 ${favorites ? 'bg-red-600' : 'bg-zinc-800 hover:bg-zinc-700'}`}
                                            onClick={toggleFavorites}
                                        >
                                            <FontAwesomeIcon icon={faHeart} />
                                        </button>
                                        <button
                                            className={`w-12 h-12 flex items-center justify-center rounded-full shadow-lg transition-colors duration-300 ${watchLater ? 'bg-blue-600' : 'bg-zinc-800 hover:bg-zinc-700'}`}
                                            onClick={toggleWatchLater}
                                        >
                                            <FontAwesomeIcon icon={faClock} />
                                        </button>
                                        <button
                                            className={`w-12 h-12 flex items-center justify-center rounded-full shadow-lg transition-colors duration-300 ${watched ? 'bg-green-600' : 'bg-zinc-800 hover:bg-zinc-700'}`}
                                            onClick={toggleWatched}
                                        >
                                            <FontAwesomeIcon icon={faEye} />
                                        </button>
                                    </div>

                                    {/* Mobile genre tags - New */}
                                    <div className="md:hidden mb-6 px-2">
                                        <div className="flex flex-wrap gap-2">
                                            {dataMovie.genres && dataMovie.genres.map(genre => (
                                                <span key={genre.id} className="bg-zinc-800 text-xs px-3 py-1 rounded-full">
                                                    {genre.name}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                    {/* Movie stats for mobile - Redesigned */}
                                    <div className='w-4/5 md:hidden mt-2 mb-3'>
                                        <div className='flex justify-between items-center bg-zinc-800/70 rounded-lg py-2 px-3'>
                                            <div className='flex items-center'>
                                                <FontAwesomeIcon icon={faStar} className="text-yellow-500 mr-1" />
                                                <span className="font-bold">{dataMovie.vote_average.toFixed(1)}</span>
                                            </div>
                                            <div className='flex items-center'>
                                                <FontAwesomeIcon icon={faClock} className="text-gray-400 mr-1" />
                                                <span className="text-xs">{dataMovie.runtime ? formatRuntime(dataMovie.runtime) : `${getNumberOfSeasons(dataMovie)} Season`}</span>
                                            </div>
                                            <div className='flex items-center mx-2'>
                                                <span className="text-xs font-medium px-2 py-1 bg-zinc-700 rounded">{contentRating}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className='w-3/4 mt-2 md:mt-0'>
                                    {/* Desktop layout remains similar but cleaner */}
                                    <div className="w-full hidden md:flex md:flex-row">
                                        <div className="w-full px-4 md:px-0 md:w-[70]">
                                            <h1 className='text-2xl md:text-3xl md:ml-10 font-bold'>
                                                {dataMovie.title || dataMovie.name}
                                            </h1>
                                            <h1 className='text-md italic mt-2 md:mx-10 text-gray-400'>
                                                {dataMovie.tagline}
                                            </h1>

                                            <div className='my-5 py-1 flex flex-wrap border-y text-xs md:mx-10'>
                                                <div className='m-2 text-yellow-500 flex justify-center items-center gap-1'>
                                                    <FontAwesomeIcon icon={faStar} />
                                                    {dataMovie.vote_average.toFixed(1)}
                                                </div>
                                                <div className='m-2 text-white flex justify-center items-center gap-1'>
                                                    {contentRating}
                                                </div>
                                                <div className='m-2 border-x px-4 text-white flex justify-center items-center gap-1'>
                                                    {dataMovie.runtime ? formatRuntime(dataMovie.runtime) : `${getNumberOfSeasons(dataMovie)} Season`}
                                                </div>
                                                <div className='m-2 text-white flex justify-center items-center gap-1'>
                                                    {dataMovie.genres ? dataMovie.genres.map(genre => genre.name).join(', ') : 'Genres not available'}
                                                </div>
                                            </div>

                                            {/* Details section */}
                                            <div className='md:ml-10'>
                                                <div className='w-full px-4 md:px-0 md:w-1/2'>
                                                    <h1 className='pb-3 md:pb-5 text-xl font-medium'>Details</h1>
                                                    <div className='text-xs'>
                                                        <h1 className='py-1'>Studios: <span className='text-gray-500'>{dataMovie.production_companies ? dataMovie.production_companies.map(company => company.name).join(', ') : 'Studios not available'}</span></h1>
                                                        <h1 className='py-1'>Country: <span className='text-gray-500'>{dataMovie.production_countries ? dataMovie.production_countries.map(country => country.name).join(', ') : 'Country not available'}</span></h1>
                                                        <h1 className='py-1'>Language: <span className='text-gray-500'>{dataMovie.spoken_languages ? dataMovie.spoken_languages.map(language => language.english_name).join(', ') : 'Language not available'}</span></h1>
                                                        <h1 className='py-1'>Release Date: <span className='text-gray-500'>{dataMovie.release_date || dataMovie.first_air_date}</span></h1>
                                                    </div>
                                                </div>
                                            </div>

                                        </div>


                                        <div className='w-full px-4 md:px-0 md:w-1/4 mt-4 md:mt-0'>
                                            <p className='my-2 text-lg font-medium'>Gallery</p>
                                            {backdropImage && (
                                                <div>
                                                    <div className='mb-4 rounded-lg overflow-hidden'>
                                                        <img
                                                            className="w-full h-full object-cover"
                                                            src={`https://image.tmdb.org/t/p/original/${backdropImage.file_path}`}
                                                            alt="Backdrop"
                                                        />
                                                    </div>

                                                    <div className='flex gap-1'>
                                                        {smallPosters.map((poster, index) => (
                                                            <div key={index} className="rounded overflow-hidden w-1/3">
                                                                <img
                                                                    className="object-cover w-full h-20"
                                                                    src={`https://image.tmdb.org/t/p/w500/${poster.file_path}`}
                                                                    alt={`Poster ${index + 1}`}
                                                                />
                                                            </div>
                                                        ))}
                                                    </div>
                                                    <button className='w-full my-3 p-2 text-xs bg-zinc-800 hover:bg-zinc-700 transition-colors duration-300 rounded'>
                                                        View All
                                                    </button>
                                                </div>
                                            )}
                                        </div>

                                    </div>
                                    {/* Cast & Crew Toggle Buttons */}
                                    <div className='md:ml-10 mt-5 pt-4'>
                                        <div className="flex border-b border-zinc-700 mb-4">
                                            <button
                                                onClick={() => toggleCastCrewSection('cast')}
                                                className={`px-4 py-2 text-sm font-medium ${activeSection === 'cast' ? 'text-white border-b-2 border-red-500' : 'text-gray-400'}`}
                                            >
                                                Cast
                                            </button>
                                            <button
                                                onClick={() => toggleCastCrewSection('crew')}
                                                className={`px-4 py-2 text-sm font-medium ${activeSection === 'crew' ? 'text-white border-b-2 border-red-500' : 'text-gray-400'}`}
                                            >
                                                Crew
                                            </button>
                                        </div>

                                        {/* Cast & Crew Horizontal Scrollable Content */}
                                        {activeSection === 'cast' && (
                                            <div className='overflow-x-auto scrollbar-cast pb-4'>
                                                <div className="flex space-x-3 pb-2">
                                                    {cast && cast.length > 0 ? (
                                                        cast.map(actor => (
                                                            <div key={actor.id || `cast-${Math.random()}`} className='px-3 py-3 rounded-lg bg-zinc-800 flex items-center flex-shrink-0 min-w-48'>
                                                                <div className="w-12 h-12 rounded-full overflow-hidden mr-3 flex-shrink-0">
                                                                    {actor.profile_path ? (
                                                                        <img
                                                                            src={`https://image.tmdb.org/t/p/w200/${actor.profile_path}`}
                                                                            alt={actor.name}
                                                                            className="w-full h-full object-cover"
                                                                            onError={(e) => {
                                                                                e.target.onerror = null;
                                                                                e.target.src = "";
                                                                                e.target.parentNode.classList.add("bg-gray-700");
                                                                                e.target.parentNode.innerHTML = `<div class="w-full h-full flex items-center justify-center text-sm">${actor.name?.charAt(0) || "?"}</div>`;
                                                                            }}
                                                                        />
                                                                    ) : (
                                                                        <div className="w-full h-full bg-gray-700 flex items-center justify-center text-sm">
                                                                            {actor.name?.charAt(0) || "?"}
                                                                        </div>
                                                                    )}
                                                                </div>
                                                                <div>
                                                                    <h1 className="font-medium text-sm whitespace-nowrap">{actor.name || "Unknown"}</h1>
                                                                    <p className="text-gray-400 text-xs whitespace-nowrap">{actor.character || "Unknown character"}</p>
                                                                </div>
                                                            </div>
                                                        ))
                                                    ) : (
                                                        <div className="text-gray-400 text-sm p-4 bg-zinc-800 rounded-lg">No cast information available</div>
                                                    )}
                                                </div>
                                            </div>
                                        )}

                                        {/* Crew Section */}
                                        {activeSection === 'crew' && (
                                            <div className='pb-4'>
                                                {/* Director Section */}
                                                {director && (
                                                    <div className='mb-3'>
                                                        <p className="text-xs text-gray-400 mb-2">Director</p>
                                                        <div className='overflow-x-auto'>
                                                            <div className='flex space-x-3 pb-2'>
                                                                <div className='px-3 py-3 rounded-lg bg-zinc-800 flex items-center flex-shrink-0'>
                                                                    <div className="w-12 h-12 rounded-full overflow-hidden mr-3 flex-shrink-0">
                                                                        <div className="w-full h-full bg-zinc-700 flex items-center justify-center text-sm">
                                                                            {director.charAt(0)}
                                                                        </div>
                                                                    </div>
                                                                    <div>
                                                                        <h1 className="font-medium text-sm whitespace-nowrap">{director}</h1>
                                                                        <p className="text-gray-400 text-xs">Director</p>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}

                                                {/* Writers Section */}
                                                {writers.length > 0 && (
                                                    <div className='mb-3'>
                                                        <p className="text-xs text-gray-400 mb-2">Writers</p>
                                                        <div className='overflow-x-auto'>
                                                            <div className='flex space-x-3 pb-2'>
                                                                {writers.map((writer, index) => (
                                                                    <div key={index} className='px-3 py-3 rounded-lg bg-zinc-800 flex items-center flex-shrink-0'>
                                                                        <div className="w-12 h-12 rounded-full overflow-hidden mr-3 flex-shrink-0">
                                                                            <div className="w-full h-full bg-zinc-700 flex items-center justify-center text-sm">
                                                                                {writer.charAt(0)}
                                                                            </div>
                                                                        </div>
                                                                        <div>
                                                                            <h1 className="font-medium text-sm whitespace-nowrap">{writer}</h1>
                                                                            <p className="text-gray-400 text-xs">Writer</p>
                                                                        </div>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                    {/* Mobile tab system - New implementation */}
                                    <div className="md:hidden mb-20"> {/* Add this container with mb-20 for extra space at bottom */}
                                        {renderMobileTabs()}
                                        {renderActiveTabContent()}
                                    </div>

                                    {/* Desktop storyline */}
                                    <div className='hidden md:block px-4 md:px-0 md:ml-10 mt-5 py-5 border-t'>
                                        <h1 className='text-xl mb-5 font-medium'>StoryLine</h1>
                                        <p className='text-sm leading-relaxed'>{dataMovie.overview}</p>
                                    </div>
                                </div>
                            </div>
                            <div className='w-4/5'>
                                <RecommendationSection />
                            </div>
                        </div>
                    </div>
                </>
            ) : (
                <div className="flex justify-center items-center min-h-[60vh]">
                    <div className="bg-zinc-800 p-6 rounded-lg text-center">
                        <p className="text-white text-lg mb-2">No movie data found</p>
                        <button
                            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg mt-4"
                            onClick={() => window.history.back()}
                        >
                            Go Back
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DetailCard;