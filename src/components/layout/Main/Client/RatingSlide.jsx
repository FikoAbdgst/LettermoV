import { faStar } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React from 'react';

const RatingSlide = ({ selectedRating, setSelectedRating }) => {
    const handleChange = (event) => {
        const newValue = event.target.value;
        setSelectedRating(newValue);
    };

    return (
        <div className="flex items-center space-x-1 md:space-x-3 bg-zinc-900 px-2 md:px-4 py-1 md:py-2 rounded-full w-full md:w-auto mt-2 md:mt-0">
            <label htmlFor="rating-slider" className="text-yellow-400 text-xs md:text-base">
                <FontAwesomeIcon icon={faStar} />
            </label>
            <div className="flex-1 flex items-center space-x-2 md:space-x-3">
                <input
                    type="range"
                    min="0"
                    max="10"
                    step="0.5"
                    value={selectedRating}
                    onChange={handleChange}
                    id="rating-slider"
                    className="w-full md:w-32 lg:w-48 h-1 md:h-2 rounded-full appearance-none cursor-pointer"
                    style={{
                        background: `linear-gradient(to right, rgb(220, 38, 38) ${selectedRating * 10}%, rgb(39, 39, 42) ${selectedRating * 10}%)`,
                        WebkitAppearance: 'none'
                    }}
                />

                <div className="bg-red-600 rounded-full px-1.5 md:px-2.5 py-0.5 md:py-1 text-white font-bold min-w-[30px] md:min-w-[40px] text-center text-xs md:text-sm">
                    {selectedRating === 0 ? "All" : selectedRating}
                </div>
            </div>
        </div>
    );
};

export default RatingSlide;