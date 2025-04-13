import React, { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faClock, faEye, faHeart, faPlay, faStar, faChevronDown, faChevronUp, faTimes, faChevronRight, faChevronLeft } from '@fortawesome/free-solid-svg-icons';
import { Link } from 'react-router-dom';
import RecommendationSection from './RecommendationSection';

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
                const crew = creditsResponse.data.crew;
                const castData = creditsResponse.data.cast;

                const director = crew.find(member => member.job === 'Director') ||
                    (detailsResponse.data.created_by && detailsResponse.data.created_by[0]);
                const writers = crew.filter(member =>
                    member.job === 'Writer' ||
                    member.job === 'Screenplay' ||
                    member.job === 'Story' ||
                    member.known_for_department === "Writing"
                );

                setDirector(director ? director.name : 'Directors not available');
                setWriters(writers.length > 0 ? writers.map(writer => writer.name) : ['Writers not available']);
                setCast(castData.length > 0 ? castData.slice(0, 5) : []);
            } catch (error) {
                console.error('Error fetching credits:', error);
                // Continue despite this error
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
    useEffect(() => {
        // Get ID from URL if present
        const pathSegments = window.location.pathname.split('/');
        const potentialId = pathSegments[pathSegments.length - 1];

        if (potentialId && !isNaN(potentialId)) {
            localStorage.setItem('selectedMovieId', potentialId);
        }

        fetchData();
    }, []);

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

    const displayWriters = () => {
        if (writers.length <= 2) {
            return <span className='text-gray-500'>{writers.join(', ')}</span>;
        }

        return (
            <div className="relative inline-block">
                <span className='text-gray-500'>{writers.slice(0, 2).join(', ')}, ... </span>
                <button
                    onClick={toggleWriters}
                    className="ml-2 px-1 py-0.5 bg-zinc-800 rounded-full inline-flex items-center justify-center"
                    aria-label="Toggle writers"
                >
                    <FontAwesomeIcon icon={showWriters ? faChevronUp : faChevronDown} className="text-xs" />
                </button>

                {showWriters && (
                    <div ref={tooltipRef} className="absolute z-10 mt-1 -left-2 w-60 p-2 bg-zinc-800 text-white rounded shadow-lg">
                        <p className="text-sm font-medium mb-1">More Writers</p>
                        <div className="max-h-32 overflow-y-auto">
                            <ul className="grid grid-cols-2 gap-x-2 gap-y-1">
                                {writers.slice(2).map((writer, index) => (
                                    <li key={index} className="text-xs text-gray-300">{writer}</li>
                                ))}
                            </ul>
                        </div>
                    </div>
                )}
            </div>
        );
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
                    className={`flex-1 py-3 text-center text-sm font-medium ${activeTab === 'cast' ? 'text-white border-b-2 border-red-500' : 'text-gray-400'}`}
                    onClick={() => setActiveTab('cast')}
                >
                    Cast
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
                        <h1 className='py-2 flex justify-between'><span className="font-medium">Director:</span> <span className='text-gray-400'>{director || 'N/A'}</span></h1>
                        <h1 className='py-2 flex justify-between items-start'><span className="font-medium">Writers:</span> <span className='text-gray-400 text-right'>{writers.length > 0 ? displayWriters() : 'N/A'}</span></h1>
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
        } else if (activeTab === 'cast') {
            return (
                <div className='w-full px-4 md:hidden'>
                    <h1 className='pb-3 text-lg font-medium'>Top Cast</h1>
                    <div className='grid grid-cols-1 gap-4'>
                        {cast.map(actor => (
                            <div key={actor.id} className='flex items-center bg-zinc-800 p-3 rounded-lg'>
                                <div className="w-12 h-12 rounded-full overflow-hidden mr-3 flex-shrink-0">
                                    {actor.profile_path ? (
                                        <img
                                            src={`https://image.tmdb.org/t/p/w200/${actor.profile_path}`}
                                            alt={actor.name}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-full bg-gray-700 flex items-center justify-center text-sm">
                                            {actor.name.charAt(0)}
                                        </div>
                                    )}
                                </div>
                                <div>
                                    <h1 className="font-medium text-sm">{actor.name}</h1>
                                    <p className="text-gray-400 text-xs">{actor.character}</p>
                                </div>
                            </div>
                        ))}
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
                                className="object-cover w-full h-full min-h-[50vh] md:min-h-[80vh]"
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

                                <div className='w-full mt-2 md:mt-0'>
                                    {/* Desktop layout remains similar but cleaner */}
                                    <div className="hidden md:flex md:flex-row">
                                        <div className="w-full px-4 md:px-0 md:w-3/4">
                                            <h1 className='text-2xl md:text-3xl md:ml-10 font-bold'>
                                                {dataMovie.title || dataMovie.name}
                                            </h1>
                                            <h1 className='text-md italic mt-2 md:mx-10 text-gray-400'>
                                                {dataMovie.tagline}
                                            </h1>

                                            <div className='my-5 py-1 flex flex-wrap border-y text-xs md:mx-10'>
                                                <div className='m-2 flex justify-center items-center gap-1'>
                                                    <FontAwesomeIcon icon={faEye} />
                                                    {dataMovie.popularity}
                                                </div>
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

                                            <div className='md:ml-10 flex flex-col md:flex-row'>
                                                <div className='w-full px-4 md:px-0 md:w-1/2'>
                                                    <h1 className='pb-3 md:pb-5 text-xl font-medium'>Details</h1>
                                                    <div className='text-xs'>
                                                        <h1 className='py-1'>Director: <span className='text-gray-500'>{director}</span></h1>
                                                        <h1 className='py-1'>Writers: {displayWriters()}</h1>
                                                        <h1 className='py-1'>Country: <span className='text-gray-500'>{dataMovie.production_countries ? dataMovie.production_countries.map(country => country.name).join(', ') : 'Country not available'}</span></h1>
                                                        <h1 className='py-1'>Language: <span className='text-gray-500'>{dataMovie.spoken_languages ? dataMovie.spoken_languages.map(language => language.english_name).join(', ') : 'Language not available'}</span></h1>
                                                        <h1 className='py-1'>Release Date: <span className='text-gray-500'>{dataMovie.release_date || dataMovie.first_air_date}</span></h1>
                                                    </div>
                                                </div>

                                                <div className='w-full px-4 md:px-0 md:w-1/2 md:ml-2 mt-4 md:mt-0'>
                                                    <h1 className='pb-3 md:pb-5 text-xl font-medium'>Top Cast</h1>
                                                    <div className='grid grid-cols-1 gap-2'>
                                                        {cast.map(actor => (
                                                            <div key={actor.id} className='flex items-center'>
                                                                <div className="w-8 h-8 md:w-10 md:h-10 rounded-full overflow-hidden mr-2 flex-shrink-0">
                                                                    {actor.profile_path ? (
                                                                        <img
                                                                            src={`https://image.tmdb.org/t/p/w200/${actor.profile_path}`}
                                                                            alt={actor.name}
                                                                            className="w-full h-full object-cover"
                                                                        />
                                                                    ) : (
                                                                        <div className="w-full h-full bg-gray-700 flex items-center justify-center text-xs">
                                                                            {actor.name.charAt(0)}
                                                                        </div>
                                                                    )}
                                                                </div>
                                                                <div className="text-xs">
                                                                    <h1 className="font-medium">{actor.name}</h1>
                                                                    <p className="text-gray-500 text-xs">{actor.character}</p>
                                                                </div>
                                                            </div>
                                                        ))}
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

                                    {/* Mobile tab system - New implementation */}
                                    {renderMobileTabs()}
                                    {renderActiveTabContent()}

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