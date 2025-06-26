// src/pages/NotFoundPage.js
import React from 'react';
import { Box, Button, Container, Typography } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import Layout from '../components/Layout/Layout';

const NotFoundPage = () => (
        <Box
            sx={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                minHeight: '60vh',
                textAlign: 'center'
            }}
        >
            <Typography variant="h1" style={{ color: 'primary.main', fontWeight: 800 }}>
                404
            </Typography>
            <Typography variant="h5" sx={{ my: 2 }}>
                Oops! The page you're looking for isn't here.
            </Typography>
            <Typography variant="body1" color="text.secondary">
                You might have typed the address incorrectly or the page may have moved.
            </Typography>
            <Button component={RouterLink} to="/" variant="contained" sx={{ mt: 4 }}>
                Go Back Home
            </Button>
        </Box>
);

export default NotFoundPage;