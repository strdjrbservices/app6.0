import React from 'react';
import { Link } from 'react-router-dom';
import { Paper, Button, Typography, Stack, Box } from '@mui/material';

const HomePage = () => {
  return (
    <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
      <Paper elevation={3} sx={{ p: 4, textAlign: 'center' }}>
        <Typography variant="h4" gutterBottom>
          Welcome to Appraisal Tools
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
         
          {/* <Button component={Link} to="/html-extractor" variant="contained" color="secondary" size="large" target="_blank" rel="noopener noreferrer">
            HTML Extractor
          </Button> */}
        </Stack>
      </Paper>
    </Box>
  );
};

export default HomePage;