import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faStar, faPlay } from '@fortawesome/free-solid-svg-icons';
import { Link } from 'react-router-dom';
import MovieActionTooltip from '../home/MovieActionTooltip';

const RecommendationSection = () => {
    const [recommendations, setRecommendations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const movieId = localStorage.getItem('selectedMovieId');
        const mediaType = localStorage.getItem('selectedMediaType');

        const fetchRecommendations = async () => {
            try {
                setLoading(true);

                // First, get current movie details to get genres
                const movieResponse = await axios.get(
                    `https://api.themoviedb.org/3/${mediaType}/${movieId}?api_key=${import.meta.env.VITE_APIKEY}`
                );

                const currentMovie = movieResponse.data;
                const currentGenreIds = currentMovie.genres.map(genre => genre.id);

                // Get a larger pool of movies by genre to filter from
                const genreMoviesPromises = currentGenreIds.map(genreId =>
                    axios.get(`https://api.themoviedb.org/3/discover/${mediaType}?api_key=${import.meta.env.VITE_APIKEY}&with_genres=${genreId}&page=${Math.floor(Math.random() * 5) + 1}`)
                );

                const genreMoviesResponses = await Promise.all(genreMoviesPromises);
                let allMovies = genreMoviesResponses.flatMap(response => response.data.results);

                // Remove duplicates and current movie
                allMovies = allMovies.filter((movie, index, self) =>
                    index === self.findIndex(m => m.id === movie.id) && movie.id !== parseInt(movieId)
                );

                // Calculate average popularity
                const avgPopularity = allMovies.reduce((sum, movie) => sum + movie.popularity, 0) / allMovies.length;

                // Filter by rating and above-average popularity
                let filteredMovies = allMovies.filter(movie =>
                    movie.vote_average >= 5 && movie.popularity >= avgPopularity
                );

                // If we have fewer than 10 movies, relax the popularity constraint
                if (filteredMovies.length < 10) {
                    filteredMovies = allMovies.filter(movie => movie.vote_average >= 5);
                }

                // Check if each movie has at least one genre in common with current movie
                filteredMovies = filteredMovies.filter(movie => {
                    // Sometimes genre_ids is used, sometimes it's genres
                    const movieGenreIds = movie.genre_ids || (movie.genres ? movie.genres.map(g => g.id) : []);
                    return movieGenreIds.some(id => currentGenreIds.includes(id));
                });

                // Shuffle the array for randomization
                filteredMovies = filteredMovies.sort(() => 0.5 - Math.random());

                // Take at most 10 movies
                setRecommendations(filteredMovies.slice(0, 10));
                setLoading(false);
            } catch (err) {
                console.error('Error fetching recommendations:', err);
                setError('Failed to load recommendations');
                setLoading(false);
            }
        };

        fetchRecommendations();
    }, []);

    const handleSelectMovie = (movie) => {
        localStorage.setItem('selectedMovieId', movie.id);
        localStorage.setItem('selectedMediaType', movie.first_air_date ? 'tv' : 'movie');
    };

    if (loading) {
        return (
            <div className="w-full py-6 px-4 md:px-10">
                <h2 className="text-xl font-medium mb-4">Similar Genre Recommendations</h2>
                <div className="overflow-x-auto pb-4">
                    <div className="flex space-x-4 min-w-max">
                        {[...Array(10)].map((_, index) => (
                            <div key={index} className="flex-shrink-0 w-32 md:w-40 animate-pulse">
                                <div className="bg-zinc-700 h-48 md:h-60 rounded-lg mb-2 aspect-[2/3]"></div>
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
        <div className="w-full py-6 px-4 md:px-10">
            <h2 className="text-xl font-medium mb-4">Similar Genre Recommendations</h2>

            <div className="overflow-x-auto pb-4">
                <div className="flex space-x-4 min-w-max">
                    {recommendations.map((movie, index) => {
                        const title = (movie.title || movie.name || "").length >= 15
                            ? (movie.title || movie.name).substring(0, 15) + "..."
                            : (movie.title || movie.name);
                        const releaseDate = movie.release_date?.substring(0, 4) ||
                            movie.first_air_date?.substring(0, 4) || "N/A";

                        return (
                            <div className="flex-shrink-0 w-32 md:w-40" key={index}>
                                <div className="relative group overflow-hidden rounded-lg">
                                    {movie.poster_path ? (
                                        <img
                                            src={`https://image.tmdb.org/t/p/w300${movie.poster_path}`}
                                            alt={movie.title || movie.name}
                                            className="w-full h-48 md:h-60 object-cover rounded-lg transition-transform duration-300 ease-in-out transform group-hover:scale-110 group-hover:blur-sm group-hover:opacity-50"
                                        />
                                    ) : (
                                        <div className="w-full h-48 md:h-60 bg-zinc-800 flex items-center justify-center rounded-lg text-gray-400">
                                            No image
                                        </div>
                                    )}
                                    <Link to="/detail">
                                        <button
                                            className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 absolute inset-0 m-auto opacity-0 bg-transparent group-hover:opacity-100 rounded-full border-2 sm:border-4 flex items-center justify-center"
                                            onClick={() => handleSelectMovie(movie)}
                                            title={movie.title || movie.name}
                                        >
                                            <FontAwesomeIcon icon={faPlay} className='text-base sm:text-xl md:text-2xl' />
                                        </button>
                                    </Link>
                                </div>
                                <h3 className="mt-2 text-sm font-medium truncate">
                                    {title}
                                </h3>
                                <div className="flex justify-between items-center">
                                    <div className="font-mono text-xs sm:text-sm text-gray-500">
                                        {releaseDate}
                                    </div>
                                    <div className="flex items-center gap-1 sm:gap-2">
                                        <div className="hidden sm:block">
                                            <MovieActionTooltip />
                                        </div>
                                        <div className="text-xs sm:text-sm text-yellow-500 font-bold">
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
        </div>
    );
};

export default RecommendationSection;