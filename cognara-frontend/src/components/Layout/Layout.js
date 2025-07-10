import React from 'react';
import { Box, Container } from '@mui/material';
import Header from './Header';
import Footer from './Footer';
import Newsletter from '../Newsletter';
import HeroSection from '../HeroSection';

const Layout = ({ children, showHero = false, showHeader = true, showNewsletter = true, isDarkMode, setIsDarkMode }) => {
  return (
    <Box sx={{ 
      display: 'flex', 
      flexDirection: 'column', 
      minHeight: '100vh',
      backgroundColor: 'background.default',
      overflowX: 'hidden'
    }}>
      {showHeader && <Header isDarkMode={isDarkMode} setIsDarkMode={setIsDarkMode} />}
      
      
      {/* Hero Section */}
      {showHero && <HeroSection isDarkMode={isDarkMode} />}

      {/* Main content container */}
      <Container 
        component="main" 
        maxWidth="xl"
        sx={{ 
          flex: 1,
          py: 4,
          px: { xs: 2, sm: 3, md: 4 },
          position: 'relative',
          zIndex: 2,
          mt: showHero ? 0 : 0 // Remove negative margin
        }}
      >
        {children}
      </Container>
      {showNewsletter && <Newsletter fullpage="false" />}
      <Footer />
    </Box>
  );
};

export default Layout;