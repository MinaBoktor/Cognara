import React from 'react';
import { Box, Container } from '@mui/material';
import Header from './Header';
import Footer from './Footer';
import NewsletterSignup from '../Newsletter/NewsletterSignup';
import HeroSection from '../HeroSection';

const Layout = ({ children, showHero = true }) => {
  return (
    <Box sx={{ 
      display: 'flex', 
      flexDirection: 'column', 
      minHeight: '100vh',
      backgroundColor: '#f9f9f9'
    }}>
      <Header />
      {showHero && <HeroSection />}
      <Container 
        component="main" 
        maxWidth="xl"
        sx={{ 
          flex: 1, 
          py: showHero ? 0 : 6,
          px: { xs: 2, sm: 3, md: 4 },
          position: 'relative',
          zIndex: 2
        }}
      >
        {children}
      </Container>
      <NewsletterSignup />
      <Footer />
    </Box>
  );
};

export default Layout;