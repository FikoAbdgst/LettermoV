import axios from "axios";

const apiKey = import.meta.env.VITE_APIKEY;
const baseUrl = import.meta.env.VITE_BASEURL;

// Helper function to fetch movies from a specific endpoint
const fetchMovies = async (endpoint, page) => {
    const response = await axios.get(`${baseUrl}${endpoint}?page=${page}&api_key=${apiKey}`);
    return response.data.results;
};

// Fetch data from multiple pages for a specific category
const fetchMultiplePages = async (endpoint, pages) => {
    try {
        const pagePromises = Array.from({ length: pages }, (_, i) => fetchMovies(endpoint, i + 1));
        const pageResults = await Promise.all(pagePromises);
        return pageResults.flat(); // Flatten the array of results
    } catch (error) {
        console.error(`Error fetching data from ${endpoint}:`, error);
        throw error;
    }
};

// Individual category fetch functions
export const getNPlayMovieList = () => fetchMovies('/movie/now_playing', 1);
export const getPopMovieList = (page) => fetchMovies('/movie/popular', page);
export const getTrendingMovie = (page) => fetchMovies('/trending/movie/week', page);
export const getTRatedMovieList = (page) => fetchMovies('/movie/top_rated', page);
export const getUpcomingMovieList = (page) => fetchMovies('/movie/upcoming', page);
export const getTrendingSeries = (page) => fetchMovies('/trending/tv/week', page);
export const getNPlaySeriesList = () => fetchMovies('/tv/airing_today', 1);
export const getPopSeriesList = () => fetchMovies('/tv/popular', 1);
export const getTRatedSeriesList = () => fetchMovies('/tv/top_rated', 1);
export const getTrendingAllList = () => fetchMovies('/trending/all/week', 1);

// Fetch 10 pages of data for a specific category
export const getTenPagesData = async (category) => {
    const endpoints = {
        nowPlaying: '/movie/now_playing',
        popular: '/movie/popular',
        trending: '/trending/movie/week',
        topRated: '/movie/top_rated',
        trendingSeries: '/trending/tv/week',
        upcoming: '/movie/upcoming',
        airingToday: '/tv/airing_today',
        popSeries: '/tv/popular',
        topRatedSeries: '/tv/top_rated',
        trendingAll: '/trending/all/week'
    };

    if (!endpoints[category]) {
        throw new Error('Invalid category');
    }

    return fetchMultiplePages(endpoints[category], 50);
};


// Search function
export const searchMovie = async (q) => {
    try {
        const response = await axios.get(`${baseUrl}/search/movie?query=${q}&api_key=${apiKey}`);
        return response.data;
    } catch (error) {
        console.error('Error searching movies:', error);
        throw error;
    }
};
