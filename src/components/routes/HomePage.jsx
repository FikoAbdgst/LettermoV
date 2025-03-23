import React from 'react';
import Navigation from '../layout/Navigation';
import Section from '../layout/Section';
import Footer from '../layout/Footer';

const HomePage = () => {
    return (
        <div className="bg-gradient-to-b from-stone-950 via-stone-900 to-stone-950 min-h-screen text-gray-100">
            <Navigation />
            <Section />
            <Footer />
        </div>
    );
};

export default HomePage;