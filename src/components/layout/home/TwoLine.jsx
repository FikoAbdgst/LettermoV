import React, { useEffect, useState } from 'react';
import axios from 'axios';
import GenreMovie from './twoline/GenreMovie';
import OneMovieList2 from './twoline/OneMovieList2';
import DropdownRelease from './twoline/DropdownRelease';
import DropdownYear from './twoline/DropdownYear';
import DropdownAlphabet from './twoline/DropdownAlphabet';
import { faClapperboard, faFilm } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { getTenPagesData } from '../../../api';
import { Link } from 'react-router-dom';
import RatingSlide from './twoline/RatingSlide';
import { motion } from 'framer-motion';

const TwoLine = () => {
    const [allGenres, setAllGenres] = useState([]);
    const [genresPerSlide, setGenresPerSlide] = useState(6);

    const [selectedCategory, setSelectedCategory] = useState([]);
    const [selectedType2, setSelectedType2] = useState("Movies");
    const [slidesGenre, setSlidesGenre] = useState([]);
    const [currentSlide, setCurrentSlide] = useState(0);
    const moviesPerSlide2 = 3;
    const [currentSlideMovie2, setCurrentSlideMovie2] = useState(0);
    const [movies2, setMovies2] = useState([]);

    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [dropdownYearOpen, setDropdownYearOpen] = useState(false);
    const [dropdownAlphabetOpen, setDropdownAlphabetOpen] = useState(false);
    const [selectedSortOption, setSelectedSortOption] = useState('Default');
    const [selectedSortYearOption, setSelectedSortYearOption] = useState('Year');
    const [selectedSortAlphabetOption, setSelectedSortAlphabetOption] = useState('Alphabet');

    const [jenisMovie, setJenisMovie] = useState([]);
    const [jenisSeries, setJenisSeries] = useState([]);

    const [selectedRating, setSelectedRating] = useState(0);

    // Update genres per slide based on screen size
    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth < 640) {
                setGenresPerSlide(3); // Mobile
            } else if (window.innerWidth < 768) {
                setGenresPerSlide(3); // Small tablet
            } else if (window.innerWidth < 1024) {
                setGenresPerSlide(4); // Tablet
            } else {
                setGenresPerSlide(6); // Desktop
            }
        };

        handleResize(); // Set initial value
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const slideProducts = () => {
        const slidesGenres = [];
        for (let i = 0; i < allGenres.length; i += genresPerSlide) {
            slidesGenres.push(allGenres.slice(i, i + genresPerSlide));
        }
        return slidesGenres;
    };

    useEffect(() => {
        const slide = slideProducts();
        setSlidesGenre(slide);
    }, [allGenres, genresPerSlide]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [trending, trendingSeries] = await Promise.all([
                    getTenPagesData('trending'),
                    getTenPagesData('trendingSeries')
                ]);
                setJenisMovie(trending);
                setJenisSeries(trendingSeries);
            } catch (error) {
                console.error("Error fetching movies:", error);
            }
        };

        fetchData();

        const GENRE_URL = `https://api.themoviedb.org/3/genre/movie/list?api_key=${import.meta.env.VITE_APIKEY}`;

        axios.get(GENRE_URL).then((response) => {
            const filteredGenres = response.data.genres.filter(genre => genre.name !== 'TV Movie');
            setAllGenres(filteredGenres);
        }).catch((error) => {
            console.error("Error fetching genres:", error);
        });
    }, []);


    useEffect(() => {
        switch (selectedType2) {
            case "Movies":
                setMovies2(jenisMovie);
                break;
            case "Series":
                setMovies2(jenisSeries);
                break;
            default:
                setMovies2(jenisMovie);
                break;
        }
    }, [selectedType2, jenisMovie, jenisSeries]);

    const handleTypeClick2 = (typeSelect) => {
        setSelectedType2(typeSelect);
        setCurrentSlideMovie2(0);
    };

    useEffect(() => {
        setCurrentSlideMovie2(0);
    }, [selectedType2]);

    const handleCategoryClick = (category) => {
        setSelectedCategory(prevSelected => {
            if (prevSelected.includes(category)) {
                return prevSelected.filter(cat => cat !== category);
            } else {
                return [...prevSelected, category];
            }
        });
    };

    const toggleDropdown = () => {
        setDropdownOpen(!dropdownOpen);
    };

    const handleSortOptionClick = (option) => {
        setSelectedSortOption(option);
        setDropdownOpen(false);
    };

    const toggleDropdownYear = () => {
        setDropdownYearOpen(!dropdownYearOpen);
    };

    const handleSortYearOptionClick = (option) => {
        setSelectedSortYearOption(option);
        setDropdownYearOpen(false);
    };

    const toggleDropdownAlphabet = () => {
        setDropdownAlphabetOpen(!dropdownAlphabetOpen);
    };

    const handleSortAlphabetOptionClick = (option) => {
        setSelectedSortAlphabetOption(option);
        setDropdownAlphabetOpen(false);
    };

    const handleRatingChange = (rating) => {
        setSelectedRating(parseFloat(rating));
    };

    return (
        <div className='w-full h-auto flex flex-col items-center mb-10'>
            <div className="flex justify-center my-4 md:my-8">
                <div className="inline-flex flex-wrap justify-center bg-black/40 backdrop-blur-sm rounded-full p-1 shadow-xl">
                    <div className='px-0.5 sm:px-1'>
                        <motion.button
                            className={`px-3 py-1.5 md:px-6 md:py-2 rounded-full font-medium transition-colors duration-200 flex items-center space-x-1 md:space-x-2 text-xs md:text-base ${selectedType2 === "Movies" ? "bg-red-600 text-white" : "text-gray-400 hover:text-white"}`}
                            onClick={() => handleTypeClick2("Movies")}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            <FontAwesomeIcon icon={faClapperboard} />
                            <span>Movies</span>
                        </motion.button>
                    </div>
                    <div className='px-0.5 sm:px-1'>
                        <motion.button
                            className={`px-3 py-1.5 md:px-6 md:py-2 rounded-full font-medium transition-colors duration-200 flex items-center space-x-1 md:space-x-2 text-xs md:text-base ${selectedType2 === "Series" ? "bg-red-600 text-white" : "text-gray-400 hover:text-white"}`}
                            onClick={() => handleTypeClick2("Series")}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            <FontAwesomeIcon icon={faFilm} />
                            <span>Series</span>
                        </motion.button>
                    </div>
                </div>
            </div>

            <div className='w-full flex items-center justify-center flex-row mb-3 md:mb-5 relative'>
                <GenreMovie
                    currentSlide={currentSlide}
                    setCurrentSlide={setCurrentSlide}
                    slidesGenre={slidesGenre}
                    selectedCategory={selectedCategory}
                    handleCategoryClick={handleCategoryClick}
                />
            </div>
            {/* filter comp!!!! */}
            {/* mobile */}
            <div className=' md:hidden w-11/12 flex flex-col items-center justify-center my-3 md:my-5 gap-3 relative z-50'>
                <div className='w-3/4 flex items-center justify-center gap-0'>
                    <p className="w-1/4 text-sm md:text-base mt-1">Sort by: </p>
                    <RatingSlide
                        selectedRating={selectedRating}
                        setSelectedRating={handleRatingChange}
                    />
                </div>
                <div className='flex flex-wrap items-center justify-start gap-0 '>
                    <DropdownRelease
                        toggleDropdown={toggleDropdown}
                        selectedSortOption={selectedSortOption}
                        dropdownOpen={dropdownOpen}
                        handleSortOptionClick={handleSortOptionClick}
                    />
                    <DropdownYear
                        toggleDropdownYear={toggleDropdownYear}
                        selectedSortYearOption={selectedSortYearOption}
                        dropdownYearOpen={dropdownYearOpen}
                        handleSortYearOptionClick={handleSortYearOptionClick}
                    />
                    <DropdownAlphabet
                        toggleDropdownAlphabet={toggleDropdownAlphabet}
                        selectedSortAlphabetOption={selectedSortAlphabetOption}
                        dropdownAlphabetOpen={dropdownAlphabetOpen}
                        handleSortAlphabetOptionClick={handleSortAlphabetOptionClick}
                    />
                </div>


            </div>
            {/* desktop */}
            <div className='hidden w-4/5 md:flex flex-row items-center justify-between my-5 gap-0 relative z-50'>
                <div className='flex flex-wrap items-center justify-start gap-0 '>
                    <p className="text-sm md:text-base">Sort by: </p>
                    <DropdownRelease
                        toggleDropdown={toggleDropdown}
                        selectedSortOption={selectedSortOption}
                        dropdownOpen={dropdownOpen}
                        handleSortOptionClick={handleSortOptionClick}
                    />
                    <DropdownYear
                        toggleDropdownYear={toggleDropdownYear}
                        selectedSortYearOption={selectedSortYearOption}
                        dropdownYearOpen={dropdownYearOpen}
                        handleSortYearOptionClick={handleSortYearOptionClick}
                    />
                    <DropdownAlphabet
                        toggleDropdownAlphabet={toggleDropdownAlphabet}
                        selectedSortAlphabetOption={selectedSortAlphabetOption}
                        dropdownAlphabetOpen={dropdownAlphabetOpen}
                        handleSortAlphabetOptionClick={handleSortAlphabetOptionClick}
                    />
                </div>

                <RatingSlide
                    selectedRating={selectedRating}
                    setSelectedRating={handleRatingChange}
                />
            </div>
            {/* Filter Comp End !!! */}
            <div className="w-full h-full flex">
                <OneMovieList2
                    movies={movies2}
                    allGenres={allGenres}
                    currentSlideMovie2={currentSlideMovie2}
                    setCurrentSlideMovie2={setCurrentSlideMovie2}
                    moviesPerSlide2={moviesPerSlide2}
                    selectedCategory={selectedCategory}
                    sortOption={selectedSortOption}
                    selectedType={selectedType2}
                    selectedSortYearOption={selectedSortYearOption}
                    selectedSortAlphabetOption={selectedSortAlphabetOption}
                    minRating={selectedRating}
                />
            </div>


        </div>
    );
};

export default TwoLine;