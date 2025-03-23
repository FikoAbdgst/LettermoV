import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Search from './navigation/Search';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBars, faTimes, faFilm, faTv, faHome, faHeart } from '@fortawesome/free-solid-svg-icons';

const Navigation = () => {
    const [scrolled, setScrolled] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    // Handle scroll event to change navigation background
    useEffect(() => {
        const handleScroll = () => {
            if (window.scrollY > 50) {
                setScrolled(true);
            } else {
                setScrolled(false);
            }
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Close mobile menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (mobileMenuOpen && !event.target.closest('.mobile-menu-container') && !event.target.closest('.mobile-menu-button')) {
                setMobileMenuOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [mobileMenuOpen]);

    return (
        <>
            <div className={`w-full fixed -top-1 h-16 md:h-20 flex items-center z-[100] transition-all duration-300 ${scrolled ? 'bg-stone-950/90 backdrop-blur-md shadow-lg' : 'bg-gradient-to-b from-stone-950/80 to-transparent'}`}>
                <div className='container mx-auto px-4 md:px-6 flex items-center justify-between'>
                    {/* Logo */}
                    <div className='flex items-center'>
                        <Link to="/" className='flex items-center gap-1 md:gap-2'>
                            <div className='w-8 h-8 md:w-10 md:h-10 bg-red-600 rounded-full flex items-center justify-center'>
                                <FontAwesomeIcon icon={faFilm} className='text-white text-sm md:text-base' />
                            </div>
                            <h1 className='text-red-600 text-xl md:text-2xl font-bold tracking-wider'>LettermoV</h1>
                        </Link>
                    </div>

                    {/* Desktop Navigation */}
                    <nav className='hidden md:flex items-center gap-20'>
                        <ul className='flex items-center h-full gap-8'>
                            <li>
                                <Link to="/" className='text-white hover:text-red-500 transition-colors duration-300 flex items-center gap-2 py-2'>
                                    <FontAwesomeIcon icon={faHome} />
                                    <span>Home</span>
                                </Link>
                            </li>
                            <li>
                                <Link to="/movie" className='text-white hover:text-red-500 transition-colors duration-300 flex items-center gap-2 py-2'>
                                    <FontAwesomeIcon icon={faFilm} />
                                    <span>Movies</span>
                                </Link>
                            </li>
                            <li>
                                <Link to="/series" className='text-white hover:text-red-500 transition-colors duration-300 flex items-center gap-2 py-2'>
                                    <FontAwesomeIcon icon={faTv} />
                                    <span>Series</span>
                                </Link>
                            </li>
                            <li>
                                <Link to="/favorites" className='text-white hover:text-red-500 transition-colors duration-300 flex items-center gap-2 py-2'>
                                    <FontAwesomeIcon icon={faHeart} />
                                    <span>My List</span>
                                </Link>
                            </li>
                        </ul>
                        {/* Search & User */}
                        <div className='flex items-center gap-3 md:gap-6'>
                            <Search />

                            <button className='bg-red-600 hover:bg-red-700 text-white py-1.5 px-4 md:py-2 md:px-5 text-sm rounded-full transition-all duration-300 hidden md:block'>
                                Sign In
                            </button>

                            {/* Mobile menu button */}
                            <button
                                className="md:hidden text-white p-2 mobile-menu-button"
                                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                                aria-label="Toggle mobile menu"
                            >
                                <FontAwesomeIcon icon={mobileMenuOpen ? faTimes : faBars} className="text-xl" />
                            </button>
                        </div>
                    </nav>

                </div>
            </div>

            {/* Mobile menu - improved animation and styling */}
            <div className={`fixed inset-0 bg-black/95 z-[99] transition-all duration-300 mobile-menu-container ${mobileMenuOpen ? 'opacity-100 visible' : 'opacity-0 invisible pointer-events-none'}`} style={{ top: '64px' }}>
                <div className="container mx-auto px-6 py-8">
                    <ul className="flex flex-col gap-5">
                        <li>
                            <Link
                                to="/"
                                className="text-white text-lg py-2 flex items-center gap-3 hover:text-red-500 transition-colors"
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                <FontAwesomeIcon icon={faHome} />
                                <span>Home</span>
                            </Link>
                        </li>
                        <li>
                            <Link
                                to="/movie"
                                className="text-white text-lg py-2 flex items-center gap-3 hover:text-red-500 transition-colors"
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                <FontAwesomeIcon icon={faFilm} />
                                <span>Movies</span>
                            </Link>
                        </li>
                        <li>
                            <Link
                                to="/series"
                                className="text-white text-lg py-2 flex items-center gap-3 hover:text-red-500 transition-colors"
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                <FontAwesomeIcon icon={faTv} />
                                <span>Series</span>
                            </Link>
                        </li>
                        <li>
                            <Link
                                to="/favorites"
                                className="text-white text-lg py-2 flex items-center gap-3 hover:text-red-500 transition-colors"
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                <FontAwesomeIcon icon={faHeart} />
                                <span>My List</span>
                            </Link>
                        </li>
                        <li className="pt-4">
                            <button className="bg-red-600 hover:bg-red-700 text-white py-2.5 px-6 rounded-full w-full transition-all duration-300">
                                Sign In
                            </button>
                        </li>
                    </ul>
                </div>
            </div>
        </>
    );
};

export default Navigation;