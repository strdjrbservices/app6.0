import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Paper, Button, Typography, Stack, Box } from '@mui/material';

const HomePage = () => {
  const [username, setUsername] = useState('');

  useEffect(() => {
    setUsername(localStorage.getItem('username') || '');
  }, []);
  return (
    <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh"            sx={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                minHeight: '100vh',
                background: 'linear-gradient(-45deg, #667eea, #764ba2, #23a6d5, #23d5ab)',
                backgroundSize: '400% 400%',
                animation: 'gradient 15s ease infinite',
                '@keyframes gradient': {
                    '0%': { backgroundPosition: '0% 50%' },
                    '50%': { backgroundPosition: '100% 50%' },
                    '100%': { backgroundPosition: '0% 50%' },
                },
            }}>
      <Paper elevation={3} sx={{ p: 4, textAlign: 'center' }}>
        <Typography variant="h4" gutterBottom>
          Welcome to Appraisal Tools{username ? `, ${username}` : ''}
        </Typography>
        <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 4 }}>
          Please select a tool to get started.
        </Typography>
        <Stack direction="row" spacing={2} justifyContent="center">
          <Button component={Link} to="/extractor" variant="contained" size="large" >
            FULL FILE REVIEW
          </Button>
           <Button component={Link} to="/response" variant="contained" color="info" size="large" target="_blank" rel="noopener noreferrer">
            REVISED FILE REVIEW
          </Button>
          <Button component={Link} to="/query" variant="contained" color="secondary" size="large" target="_blank" rel="noopener noreferrer">
            Custom Query
          </Button>
          <Button component={Link} to="/1004D" variant="contained" color="success" size="large" target="_blank" rel="noopener noreferrer">
            1004D
          </Button>
         l
          {/* <Button component={Link} to="/html-extractor" variant="contained" color="secondary" size="large" target="_blank" rel="noopener noreferrer">
            HTML Extractor
          </Button> */}
        </Stack>
      </Paper>
    </Box>
  );
};

export default HomePage;