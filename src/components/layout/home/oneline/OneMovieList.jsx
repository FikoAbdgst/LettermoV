import React, { useEffect, useState } from 'react';
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { faEye, faHeart, faClock, faPlay, faPlus, faStar } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Link } from 'react-router-dom';
import MovieActionTooltip from '../MovieActionTooltip'; // Import komponen tooltip

const OneMovieList = ({ movies, setCurrentSlideMovie, currentSlideMovie, moviesPerSlide }) => {
    const [slidesMovie, setSlidesMovie] = useState([]);
    const [gridCols, setGridCols] = useState("grid-cols-5");

    // Limit the number of movies to 15
    const limitedMovies = movies.slice(0, 15);

    // Split movies into slides
    const slideMovies = () => {
        const slidesMovies = [];
        for (let i = 0; i < limitedMovies.length; i += moviesPerSlide) {
            slidesMovies.push(limitedMovies.slice(i, i + moviesPerSlide));
        }
        return slidesMovies;
    };

    // Effect to update grid columns based on screen size
    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth < 640) { // Mobile
                setGridCols("grid-cols-3"); // 3 film per baris di mobile
            } else if (window.innerWidth < 768) { // Small tablets
                setGridCols("grid-cols-3");
            } else if (window.innerWidth < 1024) { // Tablets
                setGridCols("grid-cols-4");
            } else { // Desktop
                setGridCols("grid-cols-5");
            }
        };

        handleResize(); // Set initial value
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Effect to update slides when movies or moviesPerSlide change
    useEffect(() => {
        const newSlides = slideMovies();
        setSlidesMovie(newSlides);
        setCurrentSlideMovie(0); // Reset currentSlideMovie to 0 when limitedMovies change
    }, [movies, moviesPerSlide]);

    // Function to handle saving movie ID to localStorage
    const handleSaveMovieId = (id) => {
        localStorage.setItem('selectedMovieId', id);
    };

    // Conditional rendering for no movies found
    if (slidesMovie.length === 0) {
        return (
            <div className="w-full h-96 flex flex-col justify-center items-center">
                <img src="../../../../../public/images/pop.png" alt="pop" width={150} height={150} />
                <p className="mt-2 text-lg font-semibold">There is no movie🥲</p>
                <p className='font-bold text-gray-600'>Look again so you won't be disappointed 😊</p>
            </div>
        );
    }

    return (
        <div className="w-full h-full flex flex-wrap justify-center items-center relative px-4">
            <div className={`w-full sm:w-11/12 md:w-10/12 lg:w-4/5 grid ${gridCols} gap-2 sm:gap-4 md:gap-6 py-4 sm:py-6 md:py-10`}>
                {limitedMovies.map((movie, index) => {
                    const title = movie.title.length >= 15 ? movie.title.substring(0, 15) + "..." : movie.title;
                    const releaseDate = movie.release_date ? movie.release_date.substring(0, 4) : "N/A";

                    return (
                        <div className="z-50 text-start mt-5" key={index}>
                            <div className="mb-1 sm:mb-2 relative group overflow-hidden rounded-lg">
                                <img
                                    className="w-full h-auto aspect-[2/3] rounded-lg transition-transform duration-300 ease-in-out transform group-hover:scale-110 group-hover:blur-sm group-hover:opacity-50"
                                    src={`https://image.tmdb.org/t/p/w500/${movie?.poster_path}`}
                                    alt={title}
                                    loading="lazy"
                                />
                                <Link to={'/detail'}>
                                    <button className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 absolute inset-0 m-auto opacity-0 bg-transparent group-hover:opacity-100 rounded-full border-2 sm:border-4 flex items-center justify-center"
                                        onClick={() => handleSaveMovieId(movie.id)} title={movie.title}
                                    >
                                        <FontAwesomeIcon icon={faPlay} className='text-base sm:text-xl md:text-2xl' />
                                    </button>
                                </Link>
                            </div>

                            <div className="flex items-center h-5 sm:h-6 md:h-5 font-bold text-xs sm:text-sm md:text-base text-gray-200 truncate">
                                {title}
                            </div>
                            <div className="flex justify-between items-center">
                                <div className="font-mono text-xs sm:text-sm md:text-md text-gray-500">
                                    {releaseDate}
                                </div>
                                <div className='flex justify-center items-center gap-1 sm:gap-2'>
                                    {/* Tombol Plus diganti dengan komponen MovieActionTooltip */}
                                    <div className="hidden sm:block">
                                        <MovieActionTooltip />
                                    </div>

                                    <div className="text-xs sm:text-sm text-yellow-500 font-bold ml-1">
                                        <FontAwesomeIcon icon={faStar} className="pr-0.5 sm:pr-1" />
                                        {movie.vote_average ? movie.vote_average.toFixed(1) : "N/A"}
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

export default OneMovieList;