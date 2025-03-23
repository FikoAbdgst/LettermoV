import React from 'react'
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronLeft, faChevronRight } from '@fortawesome/free-solid-svg-icons';

const GenreMovie = ({ currentSlide, slidesGenre, selectedCategory, setCurrentSlide, handleCategoryClick }) => {

    const CustomPrevArrow = (props) => (
        !props.hidden && (
            <div
                onClick={props.onClick}
                className="z-50 w-8 h-8 md:w-12 md:h-12 flex justify-center items-center rounded-full absolute top-1/4 md:top-1/2 -left-4 md:-left-8 lg:-left-16 text-white opacity-40 text-sm md:text-xl lg:text-2xl hover:text-black"
            >
                <FontAwesomeIcon icon={faChevronLeft} />
            </div>
        )
    );

    const CustomNextArrow = (props) => (
        !props.hidden && (
            <div
                onClick={props.onClick}
                className="z-50 w-8 h-8 md:w-12 md:h-12 flex justify-center items-center rounded-full absolute top-1/4 md:top-1/2 -right-4 md:-right-8 lg:-right-16 text-white opacity-40 text-sm md:text-xl lg:text-2xl hover:text-black"
            >
                <FontAwesomeIcon icon={faChevronRight} />
            </div>
        )
    );

    const settings = {
        dots: false,
        infinite: false,
        speed: 500,
        slidesToShow: 1,
        slidesToScroll: 1,
        prevArrow: <CustomPrevArrow hidden={currentSlide === 0} />,
        nextArrow: <CustomNextArrow hidden={currentSlide === slidesGenre.length - 1} />,
        beforeChange: (current, next) => console.log(`Moving from slide ${current} to ${next}`),
        afterChange: (current) => {
            console.log(`Current slide is ${current}`);
            setCurrentSlide(current);
        },
    };

    return (
        <div className="w-11/12 md:w-4/5 relative">
            <Slider {...settings} className='w-full'>
                {slidesGenre.map((slide, slideIndex) => (
                    <div key={slideIndex} className="w-full flex justify-center">
                        <div className="w-full flex mt-3 md:mt-10 gap-2 md:gap-5 flex-wrap md:flex-nowrap justify-center">
                            {slide.map((genre) => (
                                <button
                                    key={genre.id}
                                    className={`whitespace-nowrap bg-zinc-800 text-xs md:text-sm text-center w-24 md:w-36 h-8 md:h-10 rounded-lg text-white font-medium mb-2 md:mb-0 md:mr-2 transition duration-300 ease-in-out hover:bg-red-800 border-none ${selectedCategory.includes(genre.name) ? 'bg-red-500 border-none' : 'border-transparent'}`}
                                    onClick={() => handleCategoryClick(genre.name)}
                                >
                                    {genre.name}
                                </button>
                            ))}
                        </div>
                    </div>
                ))}
            </Slider>
        </div>
    )
}

export default GenreMovie;