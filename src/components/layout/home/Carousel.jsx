import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { getTrendingAllList } from '../../../api';
import Slider from 'react-slick';
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import "../../../App.css";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlay, faInfoCircle, faStar } from '@fortawesome/free-solid-svg-icons';
import { Link } from 'react-router-dom';

const Carousel = () => {
    const [trendingAllList, setTrendingAllList] = useState([]);
    const [genres, setGenres] = useState({});
    const [trailers, setTrailers] = useState({});


    useEffect(() => {
        getTrendingAllList().then(async (result) => {
            setTrendingAllList(result);

            const trailerData = {};

            for (const item of result.slice(0, 3)) {
                try {
                    const videoRes = await axios.get(`https://api.themoviedb.org/3/${item.media_type}/${item.id}/videos?api_key=${import.meta.env.VITE_APIKEY}`);
                    const trailersList = videoRes.data.results;
                    const youtubeTrailer = trailersList.find(video => video.site === "YouTube" && video.type === "Trailer");

                    if (youtubeTrailer) {
                        trailerData[item.id] = `https://www.youtube.com/watch?v=${youtubeTrailer.key}`;
                    } else {
                        trailerData[item.id] = null;
                    }
                } catch (err) {
                    console.error("Error fetching trailer for:", item.id, err);
                    trailerData[item.id] = null;
                }
            }

            setTrailers(trailerData);
        }).catch((error) => {
            console.error("Error fetching trending movies:", error);
        });

        const GENRE_URL = `https://api.themoviedb.org/3/genre/movie/list?api_key=${import.meta.env.VITE_APIKEY}`;

        axios.get(GENRE_URL).then((response) => {
            const genreMap = {};
            response.data.genres.forEach((genre) => {
                genreMap[genre.id] = genre.name;
            });
            setGenres(genreMap);
        }).catch((error) => {
            console.error("Error fetching genres:", error);
        });
    }, []);

    const settings = {
        dots: true,
        dotsClass: 'custom-dots',
        arrows: false,
        infinite: true,
        speed: 500,
        slidesToShow: 1,
        slidesToScroll: 1,
        autoplay: true,
        autoplaySpeed: 5000,
        pauseOnHover: true,
        responsive: [
            {
                breakpoint: 1024,
                settings: {
                    slidesToShow: 1,
                    slidesToScroll: 1,
                },
            },
            {
                breakpoint: 768,
                settings: {
                    slidesToShow: 1,
                    slidesToScroll: 1,
                    dots: false, // Menyembunyikan dots di layar <= 768px
                },
            },
            {
                breakpoint: 480,
                settings: {
                    slidesToShow: 1,
                    slidesToScroll: 1,
                    dots: false, // Menyembunyikan dots di layar <= 480px
                },
            },
        ],
    };

    const getGenreNames = (genreIds) => {
        if (!genreIds || genreIds.length === 0 || Object.keys(genres).length === 0) {
            return 'Genre tidak tersedia';
        }

        return genreIds.slice(0, 3).map(id => genres[id]).filter(Boolean).join(', ');
    };

    const handleSaveMovieId = (id, mediaType) => {
        localStorage.setItem('selectedMovieId', id);
        localStorage.setItem('selectedMediaType', mediaType || 'movie'); // Default ke 'movie' jika tidak ada
    }
    const handleWatchNow = (id) => {
        const url = trailers[id];
        if (url) {
            window.open(url, '_blank');
        } else {
            alert("Trailer tidak tersedia.");
        }
    };


    return (
        <div className='w-full h-[40vh] md:h-screen flex justify-center items-center shadow-2xl pt-14 md:pt-5'>
            <div className='w-full h-full overflow-hidden'>
                <Slider {...settings}>
                    {trendingAllList.slice(0, 3).map((movie, i) => {
                        const releaseYear = movie.release_date ? movie.release_date.substring(0, 4) : 'Unknown';
                        const desc = movie.overview ?
                            (movie.overview.length >= 150 ? movie.overview.substring(0, 150) + "..." : movie.overview)
                            : 'No description available';

                        const title = movie.title || movie.name || 'Untitled';
                        const rating = movie.vote_average ? movie.vote_average.toFixed(1) : 'N/A';
                        const genreText = getGenreNames(movie.genre_ids);

                        return (
                            <div key={i} className="w-full h-full flex justify-center items-center relative z-50">
                                <div className="max-md:w-20 md:w-96 h-full absolute -left-0.5 bg-gradient-to-r from-stone-950"></div>
                                <div className="w-full h-24 absolute -top-0.5 bg-gradient-to-b from-stone-950"></div>
                                {/* <div className="w-5 h-full absolute right-0 bg-gradient-to-l from-stone-950"></div> */}
                                <div className="w-full max-md:h-24 md:h-60 absolute -bottom-0.5 bg-gradient-to-t from-stone-950"></div>
                                <img
                                    className="object-cover w-full h-full"
                                    src={`https://image.tmdb.org/t/p/original/${movie.backdrop_path}`}
                                    alt={title}
                                />
                                <div className="md:w-1/3 max-md:w-4/5 absolute md:bottom-20 lg:bottom-32 xl:bottom-40 max-md:bottom-10 md:left-14 max-md:left-5">
                                    <div className="">
                                        <h1 className="text-gray-200 md:text-3xl lg:text-3xl xl:text-5xl max-md:text-lg p-0.5 md:p-2 font-bold line-clamp-2">{title}</h1>
                                    </div>
                                    <div className="text-[0.50rem] md:text-xs lg:text-sm xl:text-base p-0.5  md:p-2 max-md:hidden">
                                        <h1 className="text-gray-200">{desc}</h1>
                                    </div>
                                    <div className="flex items-center gap-3 font-bold text-gray-200 text-[0.50rem] md:text-xs lg:text-sm xl:text-base p-0.5  md:p-1 lg:p-2">
                                        <div className="flex items-center">
                                            <FontAwesomeIcon icon={faStar} className="text-yellow-400 mr-1" />
                                            <span>{rating}/10</span>
                                        </div>
                                        <span>•</span>
                                        <div className="max-md:line-clamp-1">{genreText}</div>
                                    </div>
                                    <div className="md:mt-5 max-md:mt-2 flex items-center gap-2 md:gap-4 font-bold">
                                        <button
                                            className="bg-red-700 md:py-2 max-md:py-0.5 md:px-6 max-md:px-4 rounded-full hover:bg-red-800 text-white text-[0.50rem] md:text-xs"
                                            onClick={() => handleWatchNow(movie.id)}
                                        >
                                            <FontAwesomeIcon icon={faPlay} className="pr-1" /> Watch Now
                                        </button>

                                        <Link to={'/detail'}>
                                            <button
                                                className="bg-gray-700 md:py-2 max-md:py-0.5 md:px-6 max-md:px-4 rounded-full hover:bg-gray-800 text-white text-[0.50rem] md:text-xs"
                                                onClick={() => handleSaveMovieId(movie.id, movie.media_type)}
                                                title={movie.title || movie.name}
                                            >
                                                <FontAwesomeIcon icon={faInfoCircle} className="pr-1" /> Detail
                                            </button>
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </Slider>
            </div>
        </div>
    );
};

export default Carousel;