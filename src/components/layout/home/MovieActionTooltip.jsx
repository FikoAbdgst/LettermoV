import React, { useState, useRef, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faHeart, faClock, faPlus } from '@fortawesome/free-solid-svg-icons';

const MovieActionTooltip = () => {
    const [showTooltip, setShowTooltip] = useState(false);
    const [activeButtons, setActiveButtons] = useState({
        heart: false,
        eye: false,
        clock: false
    });
    const tooltipRef = useRef(null);

    // Menangani klik di luar tooltip untuk menutupnya
    useEffect(() => {
        function handleClickOutside(event) {
            if (tooltipRef.current && !tooltipRef.current.contains(event.target)) {
                setShowTooltip(false);
            }
        }

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    // Toggle status aktif untuk tombol
    const toggleButton = (button) => {
        setActiveButtons(prev => ({
            ...prev,
            [button]: !prev[button]
        }));
    };

    return (
        <div className="relative" ref={tooltipRef}>
            <button
                onClick={() => setShowTooltip(!showTooltip)}
                className="relative hover:text-red-500 transition-colors duration-300"
            >
                <FontAwesomeIcon icon={faPlus} className='text-sm text-zinc-300 hover:text-red-500' />
            </button>

            {showTooltip && (
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 bg-zinc-900/90 backdrop-blur-sm rounded-lg p-1 shadow-lg border-2 border-zinc-700 z-50 animate-fadeIn">
                    <div className="flex space-x-2 p-1">
                        <button
                            className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 ${activeButtons.heart
                                ? 'bg-red-600 text-white'
                                : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
                                }`}
                            onClick={() => toggleButton('heart')}
                            title="Tambah ke Favorit"
                        >
                            <FontAwesomeIcon icon={faHeart} className="text-sm" />
                        </button>

                        <button
                            className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 ${activeButtons.eye
                                ? 'bg-blue-600 text-white'
                                : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
                                }`}
                            onClick={() => toggleButton('eye')}
                            title="Tandai Sudah Ditonton"
                        >
                            <FontAwesomeIcon icon={faEye} className="text-sm" />
                        </button>

                        <button
                            className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 ${activeButtons.clock
                                ? 'bg-green-600 text-white'
                                : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
                                }`}
                            onClick={() => toggleButton('clock')}
                            title="Tambah ke Watchlist"
                        >
                            <FontAwesomeIcon icon={faClock} className="text-sm" />
                        </button>
                    </div>

                    {/* Panah tooltip */}
                    <div className="absolute left-1/2 bottom-0 transform -translate-x-1/2 translate-y-full">
                        <div className="w-3 h-3 bg-zinc-900 rotate-45 transform -translate-y-1/2 border-r border-b border-zinc-700"></div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MovieActionTooltip;