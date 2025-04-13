import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faStar, faPlay } from '@fortawesome/free-solid-svg-icons';
import { useNavigate } from 'react-router-dom';
import MovieActionTooltip from '../home/MovieActionTooltip';

const RecommendationSection = () => {
    const [recommendations, setRecommendations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    // Refs dan state untuk scroll
    const scrollContainerRef = useRef(null);
    const [showLeftFade, setShowLeftFade] = useState(false);
    const [showRightFade, setShowRightFade] = useState(true);

    // Fungsi untuk mengecek posisi scroll
    const checkScrollPosition = () => {
        const container = scrollContainerRef.current;
        if (!container) return;

        // Cek apakah sudah ada scroll di sisi kiri
        setShowLeftFade(container.scrollLeft > 0);

        // Cek apakah masih bisa scroll ke kanan
        const maxScrollLeft = container.scrollWidth - container.clientWidth;
        setShowRightFade(container.scrollLeft < maxScrollLeft - 5); // Toleransi 5px
    };

    useEffect(() => {
        const movieId = localStorage.getItem('selectedMovieId');
        const mediaType = localStorage.getItem('selectedMediaType');

        const fetchRecommendations = async () => {
            try {
                setLoading(true);

                // First, try to get official TMDB recommendations
                const recommendationsResponse = await axios.get(
                    `https://api.themoviedb.org/3/${mediaType}/${movieId}/recommendations?api_key=${import.meta.env.VITE_APIKEY}`
                );

                let recommendedMovies = recommendationsResponse.data.results || [];

                // Filter to only include movies with a rating of 5 or above
                recommendedMovies = recommendedMovies.filter(movie => movie.vote_average >= 5);

                // If we have fewer than 10 movies from recommendations, supplement with similar genre movies
                if (recommendedMovies.length < 10) {
                    // Get current movie details to get genres
                    const movieResponse = await axios.get(
                        `https://api.themoviedb.org/3/${mediaType}/${movieId}?api_key=${import.meta.env.VITE_APIKEY}`
                    );

                    const currentMovie = movieResponse.data;
                    const currentGenreIds = currentMovie.genres.map(genre => genre.id);

                    // Try to get similar movies (another TMDB endpoint that might help)
                    const similarResponse = await axios.get(
                        `https://api.themoviedb.org/3/${mediaType}/${movieId}/similar?api_key=${import.meta.env.VITE_APIKEY}`
                    );

                    let similarMovies = similarResponse.data.results || [];

                    // Filter similar movies with rating 5+
                    similarMovies = similarMovies.filter(movie =>
                        movie.vote_average >= 5 &&
                        movie.id !== parseInt(movieId) &&
                        !recommendedMovies.some(rec => rec.id === movie.id)
                    );

                    // If still not enough, get movies by genre
                    if (recommendedMovies.length + similarMovies.length < 10) {
                        // How many more movies we need
                        const neededCount = 10 - (recommendedMovies.length + similarMovies.length);

                        // Get a larger pool of movies by genre to filter from
                        const genreMoviesPromises = currentGenreIds.map(genreId =>
                            axios.get(`https://api.themoviedb.org/3/discover/${mediaType}?api_key=${import.meta.env.VITE_APIKEY}&with_genres=${genreId}&page=${Math.floor(Math.random() * 5) + 1}`)
                        );

                        const genreMoviesResponses = await Promise.all(genreMoviesPromises);
                        let genreMovies = genreMoviesResponses.flatMap(response => response.data.results);

                        // Remove duplicates, current movie, and already included recommendations/similar
                        genreMovies = genreMovies.filter(movie =>
                            movie.vote_average >= 5 &&
                            movie.id !== parseInt(movieId) &&
                            !recommendedMovies.some(rec => rec.id === movie.id) &&
                            !similarMovies.some(sim => sim.id === movie.id)
                        );

                        // Calculate average popularity
                        const avgPopularity = genreMovies.reduce((sum, movie) => sum + movie.popularity, 0) / (genreMovies.length || 1);

                        // Filter by rating and above-average popularity
                        let filteredGenreMovies = genreMovies.filter(movie =>
                            movie.popularity >= avgPopularity
                        );

                        // If we have fewer than needed, relax the popularity constraint
                        if (filteredGenreMovies.length < neededCount) {
                            filteredGenreMovies = genreMovies;
                        }

                        // Ensure each movie has at least one genre in common with current movie
                        filteredGenreMovies = filteredGenreMovies.filter(movie => {
                            const movieGenreIds = movie.genre_ids || (movie.genres ? movie.genres.map(g => g.id) : []);
                            return movieGenreIds.some(id => currentGenreIds.includes(id));
                        });

                        // Shuffle and take what we need
                        filteredGenreMovies = filteredGenreMovies.sort(() => 0.5 - Math.random()).slice(0, neededCount);

                        // Combine all our sources
                        const allRecommendations = [...recommendedMovies, ...similarMovies, ...filteredGenreMovies];

                        // Sort by vote_average descending for quality results
                        allRecommendations.sort((a, b) => b.vote_average - a.vote_average);

                        // Take max 10 films
                        setRecommendations(allRecommendations.slice(0, 10));
                    } else {
                        // Combine recommendations and similar
                        const combinedRecommendations = [...recommendedMovies, ...similarMovies];
                        setRecommendations(combinedRecommendations.slice(0, 10));
                    }
                } else {
                    // If we have enough recommendations already, just use those
                    setRecommendations(recommendedMovies.slice(0, 10));
                }

                setLoading(false);

                // Setelah data diload, cek scroll di next render cycle
                setTimeout(() => {
                    checkScrollPosition();
                }, 0);

            } catch (err) {
                console.error('Error fetching recommendations:', err);
                setError('Failed to load recommendations');
                setLoading(false);
            }
        };

        fetchRecommendations();

        // Set up scroll event listener
        const currentScrollContainer = scrollContainerRef.current;
        if (currentScrollContainer) {
            currentScrollContainer.addEventListener('scroll', checkScrollPosition);
        }

        // Clean up
        return () => {
            if (currentScrollContainer) {
                currentScrollContainer.removeEventListener('scroll', checkScrollPosition);
            }
        };
    }, []);

    // Effect untuk mengatur scroll di awal dan saat window resize
    useEffect(() => {
        checkScrollPosition();

        // Tambahkan event listener untuk resize window
        window.addEventListener('resize', checkScrollPosition);

        return () => {
            window.removeEventListener('resize', checkScrollPosition);
        };
    }, [recommendations]);

    // Updated function to handle movie selection and navigation
    const handleSelectMovie = (movie) => {
        localStorage.setItem('selectedMovieId', movie.id);
        localStorage.setItem('selectedMediaType', movie.first_air_date ? 'tv' : 'movie');

        // Force reload of the current page to refresh data
        navigate('/detail', { replace: true });
        // Optional: reload the page to ensure all data refreshes
        window.location.reload();
    };

    if (loading) {
        return (
            <div className="w-full py-6 px-4 md:px-10">
                <h2 className="text-xl font-medium mb-4">Similar Genre Recommendations</h2>
                <div className="overflow-x-auto pb-4">
                    <div className="flex space-x-4 min-w-max">
                        {[...Array(10)].map((_, index) => (
                            <div key={index} className="flex-shrink-0 w-28 md:w-40 animate-pulse">
                                <div className="bg-zinc-700 h-40 md:h-60 rounded-lg mb-2 aspect-[2/3]"></div>
                                <div className="bg-zinc-700 h-4 rounded w-3/4 mb-1"></div>
                                <div className="bg-zinc-700 h-3 rounded w-1/2"></div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="w-full py-6 px-4 md:px-10">
                <h2 className="text-xl font-medium mb-4">Similar Genre Recommendations</h2>
                <div className="bg-zinc-800 p-4 rounded-lg text-sm text-gray-300">
                    {error}
                </div>
            </div>
        );
    }

    if (recommendations.length === 0) {
        return (
            <div className="w-full py-6 px-4 md:px-10">
                <h2 className="text-xl font-medium mb-4">Similar Genre Recommendations</h2>
                <div className="bg-zinc-800 p-4 rounded-lg text-sm text-gray-300 flex items-center justify-center">
                    <img src="../../../../../public/images/pop.png" alt="pop" className="w-12 h-12 mr-2" />
                    No recommendations found with similar genres and rating 5 or above.
                </div>
            </div>
        );
    }

    return (
        <div className="w-full py-6 md:px-10">
            <h2 className="text-xl font-medium mb-4">Similar Genre Recommendations</h2>

            <div className="relative">
                {/* Left fade effect - conditional */}
                {showLeftFade && (
                    <div className="absolute -left-1 -top-1 bottom-0 w-20 bg-gradient-to-r from-zinc-900 to-transparent z-10"></div>
                )}

                <div
                    ref={scrollContainerRef}
                    className="overflow-x-auto pb-4 scrollbar-hide"
                    onScroll={checkScrollPosition}
                >
                    <div className="flex space-x-3 md:space-x-4 px-2">
                        {recommendations.map((movie, index) => {
                            const title = (movie.title || movie.name || "").length >= 15
                                ? (movie.title || movie.name).substring(0, 15) + "..."
                                : (movie.title || movie.name);
                            const releaseDate = movie.release_date?.substring(0, 4) ||
                                movie.first_air_date?.substring(0, 4) || "N/A";

                            return (
                                <div className="flex-shrink-0 w-28 md:w-40" key={index}>
                                    <div className="relative group overflow-hidden rounded-lg">
                                        {movie.poster_path ? (
                                            <img
                                                src={`https://image.tmdb.org/t/p/w300${movie.poster_path}`}
                                                alt={movie.title || movie.name}
                                                className="w-full h-40 md:h-60 object-cover rounded-lg transition-transform duration-300 ease-in-out transform group-hover:scale-110 group-hover:blur-sm group-hover:opacity-50"
                                            />
                                        ) : (
                                            <div className="w-full h-40 md:h-60 bg-zinc-800 flex items-center justify-center rounded-lg text-gray-400">
                                                No image
                                            </div>
                                        )}
                                        <button
                                            className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 absolute inset-0 m-auto opacity-0 bg-transparent group-hover:opacity-100 rounded-full border-2 sm:border-4 flex items-center justify-center"
                                            onClick={() => handleSelectMovie(movie)}
                                            title={movie.title || movie.name}
                                        >
                                            <FontAwesomeIcon icon={faPlay} className='text-base sm:text-xl md:text-2xl' />
                                        </button>
                                    </div>
                                    <h3 className="mt-2 text-xs md:text-sm font-medium truncate">
                                        {title}
                                    </h3>
                                    <div className="flex justify-between items-center text-xs">
                                        <div className="font-mono text-gray-500">
                                            {releaseDate}
                                        </div>
                                        <div className="flex items-center">
                                            <div className="hidden sm:block">
                                                <MovieActionTooltip />
                                            </div>
                                            <div className="text-yellow-500 font-bold">
                                                <FontAwesomeIcon icon={faStar} className="pr-0.5" />
                                                {movie.vote_average ? movie.vote_average.toFixed(1) : "N/A"}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Right fade effect - conditional */}
                {showRightFade && (
                    <div className="absolute -right-1 -top-1 bottom-0 w-20 bg-gradient-to-l from-zinc-900 to-transparent z-10"></div>
                )}
            </div>
        </div>
    );
};

export default RecommendationSection;