import React from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import Subject from './components/Subject/subject.js';
import CustomQuery from './components/Subject/CustomQuery.js';
import HomePage from './components/Subject/HomePage.js';
import Compare from './components/Subject/Compare.js';
import './App.css';
import HtmlExtractor from './components/Subject/HtmlExtractor';
import Form1004D from './components/Subject/1004D';
import Box from '@mui/material/Box';

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
      <Box
        sx={{
          position: 'fixed',
          bottom: 6,
          right: 12,
          zIndex: 9999,
          background: 'rgba(255, 255, 255, 0.25)',
          backdropFilter: 'blur(6px)',
          borderRadius: '12px',
          padding: '6px 14px',
          fontSize: '0.75rem',
          color: '#444',
          boxShadow: '0 4px 10px rgba(0,0,0,0.15)',
          pointerEvents: 'none',
          border: '1px solid rgba(255,255,255,0.4)',
        }}
      >
        Developed by <strong></strong>
      </Box>

    </>
  );
}

export default App;
