import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faClock, faEye, faHeart, faPlay, faStar } from '@fortawesome/free-solid-svg-icons';
import { Link } from 'react-router-dom';

const DetailCard = () => {
    const [dataMovie, setDataMovie] = useState(null);
    const [contentRating, setContentRating] = useState('');
    const [director, setDirector] = useState('');
    const [writers, setWriters] = useState([]);
    const [cast, setCast] = useState([]);
    const [backdropImage, setBackdropImage] = useState(null);
    const [smallPosters, setSmallPosters] = useState([]);

    useEffect(() => {
        const movieId = localStorage.getItem('selectedMovieId');
        const mediaType = localStorage.getItem('selectedMediaType');

        if (movieId && mediaType) {
            const fetchDetails = async () => {
                try {
                    const response = await axios.get(`https://api.themoviedb.org/3/${mediaType}/${movieId}?api_key=${import.meta.env.VITE_APIKEY}`);
                    setDataMovie(response.data);
                } catch (error) {
                    console.error(`Error fetching details: ${error.response ? error.response.data : error.message}`);
                }
            };

            const fetchContentRating = async () => {
                try {
                    const response = await axios.get(`https://api.themoviedb.org/3/movie/${movieId}/release_dates?api_key=${import.meta.env.VITE_APIKEY}`);
                    const usRelease = response.data.results.find(r => r.iso_3166_1 === 'US');
                    if (usRelease) {
                        const usRating = usRelease.release_dates.find(date => date.certification);
                        setContentRating(usRating ? usRating.certification : 'Not Rated');
                    }
                } catch (error) {
                    console.error('Error fetching content rating:', error);
                }
            };

            fetchDetails();
            fetchContentRating();
        }
    }, []);

    useEffect(() => {
        if (dataMovie) {
            const fetchCredits = async () => {
                const movieId = localStorage.getItem('selectedMovieId');
                const mediaType = localStorage.getItem('selectedMediaType');
                try {
                    const response = await axios.get(`https://api.themoviedb.org/3/${mediaType}/${movieId}/credits?api_key=${import.meta.env.VITE_APIKEY}`);
                    const crew = response.data.crew;
                    const castData = response.data.cast;

                    const director = crew.find(member => member.job === 'Director') || (dataMovie.created_by && dataMovie.created_by[0]);
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
                }
            };

            fetchCredits();
        }
    }, [dataMovie]);

    useEffect(() => {
        const movieId = localStorage.getItem('selectedMovieId');
        const mediaType = localStorage.getItem('selectedMediaType');

        const fetchGalleryImages = async () => {
            try {
                const response = await axios.get(`https://api.themoviedb.org/3/${mediaType}/${movieId}/images?api_key=${import.meta.env.VITE_APIKEY}`);
                const backdrops = response.data.backdrops;
                const posters = response.data.posters;


                if (backdrops.length > 0) {
                    // Shuffle backdrops and select one at random
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
            }
        };

        fetchGalleryImages();
    }, []);

    const formatRuntime = (runtime) => {
        const hours = Math.floor(runtime / 60);
        const minutes = runtime % 60;
        return `${hours}h ${minutes}m`;
    };

    const getNumberOfSeasons = (data) => {
        return data.number_of_seasons || 'Seasons not available';
    };

    return (
        <div className="w-full h-auto relative">
            <div className="w-full h-1/2 absolute bottom-0 bg-gradient-to-t from-zinc-900"></div>
            <div className="w-full h-12 absolute -bottom-12 bg-gradient-to-b from-zinc-900"></div>
            {dataMovie ?
                (
                    <>
                        <div className='w-full h-full'>
                            {dataMovie.backdrop_path ? (
                                <img
                                    className="object-cover w-full h-full min-h-[80vh]"
                                    src={`https://image.tmdb.org/t/p/original/${dataMovie.backdrop_path}`}
                                    alt={dataMovie.title || dataMovie.name}
                                />
                            ) : (
                                <div className='w-full h-full min-h-[80vh] bg-black flex justify-center'>
                                    <h1 className='text-white mt-48'>No Picture Detected</h1>
                                </div>
                            )}
                            <Link to={'/detail'}>
                                <button className="w-12 h-12 absolute inset-0 m-auto bg-white rounded-full flex mt-64 justify-center"
                                >
                                    <FontAwesomeIcon icon={faPlay} className='text-2xl mt-3 text-red-600' />
                                </button>
                            </Link>
                        </div>



                        <div className='relative'>
                            <div className="w-full h-screen absolute -top-60 flex justify-start items-center flex-col">
                                <div className="w-3/4 p-5 flex justify-start items-center">
                                    <h1 className='py-1 text-xl'>
                                        {dataMovie.title || dataMovie.name} ({dataMovie.release_date ? dataMovie.release_date.substring(0, 4) : dataMovie.first_air_date.substring(0, 4)})
                                    </h1>
                                </div>
                                <div className='w-3/4 border-y py-10 flex justify-start '>
                                    <div>
                                        <img
                                            className="w-72 h-80"
                                            src={`https://image.tmdb.org/t/p/w500/${dataMovie.poster_path}`}
                                            alt={dataMovie.title || dataMovie.name}
                                        />
                                        <div className="flex justify-center gap-3">
                                            <button className='w-10 h-10 px-1 py-2 bg-zinc-800 rounded-full mt-4 '><FontAwesomeIcon icon={faHeart} /></button>
                                            <button className='w-10 h-10 px-1 py-2 bg-zinc-800 rounded-full mt-4'><FontAwesomeIcon icon={faClock} /> </button>
                                            <button className='w-10 h-10 px-1 py-2 bg-zinc-800 rounded-full mt-4'><FontAwesomeIcon icon={faEye} /> </button>
                                        </div>

                                    </div>
                                    <div className='w-full'>
                                        <div className="flex">
                                            <div className="w-3/4">
                                                <h1 className='text-3xl ml-10'>
                                                    {dataMovie.title || dataMovie.name}
                                                </h1>
                                                <h1 className='text-md italic mx-10 mt-2'>
                                                    {dataMovie.tagline}
                                                </h1>
                                                <div className='mx-10 my-5 py-1 flex border-y text-xs'>
                                                    <div className='m-2 flex justify-center items-center gap-1'>
                                                        <FontAwesomeIcon icon={faEye} />
                                                        {dataMovie.popularity}
                                                    </div>
                                                    <div className='m-2 text-yellow-500 flex justify-center items-center gap-1'>
                                                        <FontAwesomeIcon icon={faStar} className="" />
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
                                                <div className='ml-10 flex'>
                                                    <div className='w-1/2'>
                                                        <h1 className='pb-5 text-xl'>Details</h1>
                                                        <div className='text-xs'>
                                                            <h1 className='py-1'>Director: <span className='text-gray-500'>{director}</span></h1>
                                                            <h1 className='py-1'>Writers: <span className='text-gray-500'>{writers.join(', ')}</span></h1>
                                                            <h1 className='py-1'>Country: <span className='text-gray-500'>{dataMovie.production_countries ? dataMovie.production_countries.map(country => country.name).join(', ') : 'Country not available'}</span></h1>
                                                            <h1 className='py-1'>Language: <span className='text-gray-500'>{dataMovie.spoken_languages ? dataMovie.spoken_languages.map(language => language.english_name).join(', ') : 'Language not available'}</span></h1>
                                                            <h1 className='py-1'>Release Date: <span className='text-gray-500'>{dataMovie.release_date || dataMovie.first_air_date}</span></h1>
                                                        </div>
                                                    </div>
                                                    <div className='w-1/2 ml-2'>
                                                        <h1 className='pb-5 text-xl'>Top Cast</h1>
                                                        <div className='text-xs'>
                                                            {cast.map(actor => (
                                                                <div key={actor.id} className='py-1'>
                                                                    <h1>{actor.name} as <span className='text-gray-500'>{actor.character}</span></h1>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className='w-1/4'>
                                                <p className='my-2 text-lg'>Gallery</p>
                                                {backdropImage && (
                                                    <div>
                                                        {/* Image Backdrop */}
                                                        <div className='mb-4'>
                                                            <img
                                                                className="w-full h-full object-cover"
                                                                src={`https://image.tmdb.org/t/p/original/${backdropImage.file_path}`}
                                                                alt="Backdrop"
                                                            />
                                                        </div>

                                                        {/* Three Small Images Side by Side */}
                                                        <div className='flex gap-1'>
                                                            {smallPosters.map((poster, index) => (
                                                                <img
                                                                    key={index}
                                                                    className="object-cover w-1/3 h-20"
                                                                    src={`https://image.tmdb.org/t/p/w500/${poster.file_path}`}
                                                                    alt={`Poster ${index + 1}`}
                                                                />
                                                            ))}
                                                        </div>
                                                        <button className='w-full my-3 p-2 text-xs bg-zinc-800'>
                                                            View All
                                                        </button>
                                                    </div>
                                                )}
                                            </div>


                                        </div>

                                        <div className='ml-10 mt-5 py-5 border-t'>
                                            <h1 className='text-xl mb-5'>StoryLine</h1>
                                            <p className='text-sm'>{dataMovie.overview}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </>
                ) : (
                    <p>Loading movie details...</p>
                )}
        </div>
    );
};

export default DetailCard;
