import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import Subject from './components/Subject/subject.js';
import CustomQuery from './components/Subject/CustomQuery.js';
import HomePage from './components/Subject/HomePage.js';
import Compare from './components/Subject/Compare.js';
import './App.css';
import HtmlExtractor from './components/Subject/HtmlExtractor.js';
import Form1004D from './components/Subject/1004D.js';
import { Box, Button, Avatar, Typography } from '@mui/material';
import Login from './components/Subject/Login';
import ProtectedRoute from './components/ProtectedRoute.js';
import LogoutIcon from '@mui/icons-material/Logout';
function App() {
  const location = useLocation();
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(localStorage.getItem('isAuthenticated') === 'true');

  useEffect(() => {
    localStorage.setItem('isAuthenticated', isAuthenticated);
  }, [isAuthenticated]);

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('authToken');
    localStorage.removeItem('username');
    navigate('/login');
  };

  return (
    <>
      {location.pathname !== '/login' && (
        <nav className="navbar navbar-light bg-light px-3 d-flex justify-content-between align-items-center">
          {location.pathname !== '/' && (
            <div className="flex-grow-1 d-flex justify-content-center">
              <Link
                to="/extractor"
                className={`btn ${location.pathname === '/extractor' ? 'btn-primary' : 'btn-outline-primary'
                  } mx-1`}

                target="_blank" rel="noopener noreferrer"
              >
                FULL FILE REVIEW
              </Link>
              <Link
                to="/compare"

                target="_blank" rel="noopener noreferrer"
                className={`btn ${location.pathname === '/compare' ? 'btn-primary' : 'btn-outline-primary'
                  } mx-1`}
              >
                REVISED FILE REVIEW
              </Link>
              <Link
                to="/query"
                target="_blank" rel="noopener noreferrer"
                className={`btn ${location.pathname === '/query' ? 'btn-primary' : 'btn-outline-primary'
                  } mx-1`}
              >
                Custom Query
              </Link>
              <Link
                to="/1004D"
                target="_blank" rel='noopener noreferrer'
                className={`btn ${location.pathname === '/1004D' ? 'btn-primary' : 'btn-outline-primary'
                  } mx-1`}
              >
                1004D
              </Link>
              {/* <Link
                to="/html-extractor"
                target="_blank" rel="noopener noreferrer"
                className={`btn ${location.pathname === '/html-extractor' ? 'btn-primary' : 'btn-outline-primary'
                  }`}
              >
                HTML Extractor
              </Link> */}
            </div>
          )}
          {isAuthenticated && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Avatar sx={{ bgcolor: 'secondary.main', width: 32, height: 32, fontSize: '1rem' }}>
                {localStorage.getItem('username')?.charAt(0).toUpperCase()}
              </Avatar>
              <Typography variant="body1">
                Welcome, {localStorage.getItem('username')}
              </Typography>
              <Button variant="outlined" sx={{ border: 'none', minWidth: 28, width: 28, height: 28 }} color="inherit" onClick={handleLogout} size="small">
                <LogoutIcon sx={{ marginLeft: -2, maxWidth: 24, width: 24, height: 24 }}/>
              </Button>
            </Box>
          )}
        </nav>
      )}
      <div className={location.pathname !== '/login' ? "main-container" : ""}> <Routes>
        <Route path="/login" element={<Login onLogin={() => setIsAuthenticated(true)} />} />
        <Route element={<ProtectedRoute isAuthenticated={isAuthenticated} />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/extractor" element={<Subject />} />
          <Route path="/query" element={<CustomQuery />} />
          <Route path="/compare" element={<Compare />} />
          <Route path="/html-extractor" element={<HtmlExtractor />} />
          <Route path="/1004D" element={<Form1004D />} />
        </Route>
      </Routes>
      </div>
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
          animation: 'fadeInOut 4s ease-in-out infinite',

          '@keyframes fadeInOut': {
            '0%': { opacity: 0, transform: 'translateY(10px)' },
            '20%': { opacity: 1, transform: 'translateY(0)' },
            '80%': { opacity: 1, transform: 'translateY(0)' },
            '100%': { opacity: 0, transform: 'translateY(10px)' }
          }
        }}
      >
        Developed by <strong></strong>
      </Box>


    </>
  );
}

export default App;
