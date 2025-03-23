import React, { useEffect, useState } from 'react';
import '../../../App.css';
import {
    getTenPagesData,
} from '../../../api';
import OneMovieList from './Client/OneMovieList';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowTrendUp, faBolt, faCaretDown, faFireFlameCurved, faStar } from '@fortawesome/free-solid-svg-icons';


const OneLine = () => {
    const [selectedType, setSelectedType] = useState("Now Playing");
    const [currentSlideMovie, setCurrentSlideMovie] = useState(0);
    const [movies, setMovies] = useState([]);
    const [popularMovies, setPopularMovies] = useState([]);
    const [nowPlayingMovies, setNowPlayingMovies] = useState([]);
    const [upcomingMovies, setUpcomingMovies] = useState([]);
    const [topRatedMovies, setTopRatedMovies] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    // Responsif moviesPerSlide berdasarkan ukuran layar
    const [moviesPerSlide, setMoviesPerSlide] = useState(1);

    useEffect(() => {
        setIsLoading(true);
        const fetchData = async () => {
            try {
                const [popular, nowPlaying, upcoming, topRated] = await Promise.all([
                    getTenPagesData('popular'),
                    getTenPagesData('nowPlaying'),
                    getTenPagesData('upcoming'),
                    getTenPagesData('topRated')
                ]);

                setPopularMovies(popular);
                setNowPlayingMovies(nowPlaying);
                setUpcomingMovies(upcoming);
                setTopRatedMovies(topRated);
                setIsLoading(false);
            } catch (error) {
                console.error("Error fetching movies:", error);
                setIsLoading(false);
            }
        };

        fetchData();
    }, []);

    // Mengatur jumlah film per slide berdasarkan ukuran layar
    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth < 640) { // sm
                setMoviesPerSlide(1);
            } else if (window.innerWidth < 768) { // md
                setMoviesPerSlide(1);
            } else if (window.innerWidth < 1024) { // lg
                setMoviesPerSlide(1);
            } else {
                setMoviesPerSlide(1);
            }
        };

        handleResize(); // Atur nilai awal
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        switch (selectedType) {
            case "Now Playing":
                setMovies(nowPlayingMovies);
                break;
            case "Popular":
                setMovies(popularMovies);
                break;
            case "Upcoming":
                setMovies(upcomingMovies);
                break;
            case "Top Rated":
                setMovies(topRatedMovies);
                break;
            default:
                setMovies(nowPlayingMovies);
                break;
        }
    }, [selectedType, nowPlayingMovies, popularMovies, upcomingMovies, topRatedMovies]);


    const handleTypeClick = (typeSelect) => {
        setSelectedType(typeSelect);
        setCurrentSlideMovie(0); // Reset currentSlideMovie to 0 when type is clicked
    };

    useEffect(() => {
        setCurrentSlideMovie(0); // Reset currentSlideMovie to 0 when selectedType changes
    }, [selectedType]);

    if (isLoading) {
        return (
            <div className="h-64 flex justify-center items-center mt-20 sm:mt-24">
                <div className="w-12 h-12 border-4 border-t-red-600 border-b-red-600 border-l-transparent border-r-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className='w-full flex flex-col items-center mt-10 sm:mt-24 md:mt-24 lg:mt-28'>
            <div className='w-full flex flex-col items-center'>
                <div className="w-full flex justify-center mb-4 sm:mb-6 md:mb-8 px-2 pt-4 z-10">
                    <ul className='inline-flex flex-wrap justify-center bg-black/40 backdrop-blur-sm rounded-full p-1 shadow-xl'>
                        <li className="px-0.5 sm:px-1">
                            <button
                                className={`py-1.5 sm:py-2 px-2 sm:px-3 md:px-4 lg:px-6 rounded-full font-medium text-xs sm:text-sm md:text-base flex items-center gap-1 sm:gap-2 transition-all duration-300 ${selectedType === "Now Playing"
                                    ? "bg-red-600 text-white shadow-lg"
                                    : "text-gray-300 hover:bg-gray-800"
                                    }`}
                                onClick={() => handleTypeClick("Now Playing")}
                            >
                                <FontAwesomeIcon icon={faArrowTrendUp} />
                                <span className="hidden md:inline">Now Playing</span>
                                <span className="md:hidden">Now</span>
                            </button>
                        </li>
                        <li className="px-0.5 sm:px-1">
                            <button
                                className={`py-1.5 sm:py-2 px-2 sm:px-3 md:px-4 lg:px-6 rounded-full font-medium text-xs sm:text-sm md:text-base flex items-center gap-1 sm:gap-2 transition-all duration-300 ${selectedType === "Popular"
                                    ? "bg-red-600 text-white shadow-lg"
                                    : "text-gray-300 hover:bg-gray-800"
                                    }`}
                                onClick={() => handleTypeClick("Popular")}
                            >
                                <FontAwesomeIcon icon={faFireFlameCurved} />
                                <span className="hidden xs:inline">Popular</span>
                                <span className="xs:hidden">Pop</span>
                            </button>
                        </li>
                        <li className="px-0.5 sm:px-1">
                            <button
                                className={`py-1.5 sm:py-2 px-2 sm:px-3 md:px-4 lg:px-6 rounded-full font-medium text-xs sm:text-sm md:text-base flex items-center gap-1 sm:gap-2 transition-all duration-300 ${selectedType === "Upcoming"
                                    ? "bg-red-600 text-white shadow-lg"
                                    : "text-gray-300 hover:bg-gray-800"
                                    }`}
                                onClick={() => handleTypeClick("Upcoming")}
                            >
                                <FontAwesomeIcon icon={faBolt} />
                                <span className="hidden xs:inline">Upcoming</span>
                                <span className="xs:hidden">Up</span>
                            </button>
                        </li>
                        <li className="px-0.5 sm:px-1">
                            <button
                                className={`py-1.5 sm:py-2 px-2 sm:px-3 md:px-4 lg:px-6 rounded-full font-medium text-xs sm:text-sm md:text-base flex items-center gap-1 sm:gap-2 transition-all duration-300 ${selectedType === "Top Rated"
                                    ? "bg-red-600 text-white shadow-lg"
                                    : "text-gray-300 hover:bg-gray-800"
                                    }`}
                                onClick={() => handleTypeClick("Top Rated")}
                            >
                                <FontAwesomeIcon icon={faStar} />
                                <span className="hidden md:inline">Top Rated</span>
                                <span className="md:hidden">Top</span>
                            </button>
                        </li>
                    </ul>
                </div>
            </div>

            <div className="w-full z-10">
                <OneMovieList
                    movies={movies}
                    setCurrentSlideMovie={setCurrentSlideMovie}
                    currentSlideMovie={currentSlideMovie}
                    moviesPerSlide={moviesPerSlide}
                    selectedType={selectedType}
                />
            </div>
        </div>
    );
};

export default OneLine;