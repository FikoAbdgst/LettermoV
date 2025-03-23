import './App.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import React from 'react';
import Movie from './components/pages/Movie';
import Series from './components/pages/Series';
import Detail from './components/pages/Detail';
import HomePage from './components/pages/HomePage';
import SearchResults from './components/pages/SearchResults';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/movie" element={<Movie />} />
        <Route path="/series" element={<Series />} />
        <Route path="/detail" element={<Detail />} />
        <Route path="/search" element={<SearchResults />} />
      </Routes>
    </Router>
  );
}

export default App;
