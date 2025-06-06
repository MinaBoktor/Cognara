import React from 'react';
import { Container, Typography, Button, Box } from '@mui/material';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet';

const NotFoundPage = () => {
  return (
    <Container maxWidth="md">
      <Helmet>
        <title>Page Not Found | Cognara</title>
      </Helmet>
      <Box sx={{ my: 8, textAlign: 'center' }}>
        <Typography variant="h1" component="h1" gutterBottom>
          404
        </Typography>
        <Typography variant="h4" component="h2" gutterBottom>
          Page Not Found
        </Typography>
        <Typography variant="body1" paragraph>
          The page you're looking for doesn't exist or has been moved.
        </Typography>
        <Button component={Link} to="/" variant="contained" size="large" sx={{ mt: 3 }}>
          Go to Homepage
        </Button>
      </Box>
    </Container>
  );
};

export default NotFoundPage;