import React from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import Subject from './components/Subject/subject.js';
import CustomQuery from './components/Subject/CustomQuery.js';
import HomePage from './components/Subject/HomePage.js';
import Compare from './components/Subject/Compare.js';
import './App.css';
import HtmlExtractor from './components/Subject/HtmlExtractor';
import Form1004D  from './components/Subject/1004D';

function App() {
  const location = useLocation();

  return (
    <>
      {location.pathname !== '/' && (
        <nav className="navbar navbar-light bg-light  px-3">
          <div style={{ marginleft: "800px", marginRight: "auto" }}>
            <Link
              to="/extractor"
              className={`btn ${location.pathname === '/extractor' ? 'btn-primary' : 'btn-buttom-primary'
                } me-2`}

              target="_blank" rel="noopener noreferrer"
            >
              FULL FILE REVIEW 
            </Link>
            <Link
              to="/Compare"

              target="_blank" rel="noopener noreferrer"
              className={`btn ${location.pathname === '/Compare' ? 'btn-primary' : 'btn-buttom-primary'
                }`}
            >
              REVISED FILE REVIEW
            </Link>
            <Link
              to="/query"
              target="_blank" rel="noopener noreferrer"
              className={`btn ${location.pathname === '/query' ? 'btn-primary' : 'btn-buttom-primary'
                }`}
            >
              Custom Query
            </Link>
            <Link
              to="/1004D"
              target="_blank" rel='noopener noreferrer'
              className={`btn ${location.pathname === '/1004D' ? 'btn-primary' : 'btn-buttom-primary'
                }`}
            >
              1004D
            </Link>
            {/* <Link
              to="/html-extractor"
              target="_blank" rel="noopener noreferrer"
              className={`btn ${location.pathname === '/html-extractor' ? 'btn-primary' : 'btn-buttom-primary'
                }`}
            >
              HTML Extractor
            </Link> */}
          </div>
        </nav>
      )}
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/extractor" element={<Subject />} />
        <Route path="/query" element={<CustomQuery />} />
        <Route path="/compare" element={<Compare />} />
        <Route path="/html-extractor" element={<HtmlExtractor />} />
        <Route path="/1004D" element={<Form1004D />} />
      </Routes>
    </>
  );
}

export default App;
