import React from 'react';
import { Box, Typography, Container } from '@mui/material';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <Box component="footer" sx={{ py: 3, backgroundColor: 'primary.main', color: 'primary.contrastText' }}>
      <Container maxWidth="lg">
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="body1">
            © {new Date().getFullYear()} Cognara. All rights reserved.
          </Typography>
          <Box>
            <Link to="/privacy" style={{ color: 'inherit', marginRight: '1rem' }}>Privacy Policy</Link>
            <Link to="/terms" style={{ color: 'inherit' }}>Terms of Service</Link>
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer;