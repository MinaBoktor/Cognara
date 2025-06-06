import React, { useState, useEffect } from 'react';
import { Box, Typography, Button, Container } from '@mui/material';
import { Link } from 'react-router-dom';

const images = [
  {
    url: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
  },
  {
    url: 'https://images.unsplash.com/photo-1501504905252-473c47e087f8?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
  },
  {
    url: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
  }
];

const staticContent = {
  title: 'Discover New Knowledge',
  subtitle: 'Explore our curated collection of articles and connect with like-minded individuals',
  buttonText: 'Browse Articles',
  buttonLink: '/articles',
  secondaryButtonText: 'LEARN MORE',
  secondaryButtonLink: '/about'
};

const HeroSection = () => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    if (isHovered) return;
    
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => 
        prevIndex === images.length - 1 ? 0 : prevIndex + 1
      );
    }, 8000); // Increased transition time to 8 seconds

    return () => clearInterval(interval);
  }, [isHovered]);

  const handleDotClick = (index) => {
    setCurrentImageIndex(index);
  };

  return (
    <Box 
      sx={{
        position: 'relative',
        height: '100vh',
        width: '100%',
        overflow: 'hidden',
        color: 'white',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        '&:before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.3)', // Reduced opacity for better text visibility
          zIndex: 1
        }
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Background images with slower transition */}
      {images.map((image, index) => (
        <Box
          key={index}
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundImage: `url(${image.url})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            opacity: index === currentImageIndex ? 1 : 0,
            transition: 'opacity 2s ease-in-out', // Slower transition (2 seconds)
            zIndex: 0
          }}
        />
      ))}

      {/* Static content */}
      <Container 
        maxWidth="lg" 
        sx={{ 
          position: 'relative', 
          zIndex: 2,
          px: { xs: 3, sm: 4, md: 6 },
          mt: 8,
          textAlign: 'center'
        }}
      >
        <Box sx={{ 
          maxWidth: { xs: '100%', md: '70%' },
          mx: 'auto'
        }}>
          <Typography 
            variant="h1"
            gutterBottom
            sx={{
              fontWeight: 800,
              mb: 3,
              fontSize: { xs: '2.5rem', sm: '3.5rem', md: '4rem' },
              lineHeight: 1.2,
              textShadow: '0 2px 4px rgba(0,0,0,0.3)',
              fontFamily: "'Playfair Display', serif",
              animation: 'fadeIn 1s ease-in' // Smooth initial fade in
            }}
          >
            {staticContent.title}
          </Typography>
          <Typography 
            variant="subtitle1"
            component="p" 
            gutterBottom
            sx={{
              mb: 4,
              fontWeight: 400,
              fontSize: { xs: '1.2rem', md: '1.5rem' },
              textShadow: '0 1px 2px rgba(0,0,0,0.3)',
              fontFamily: "'Inter', sans-serif"
            }}
          >
            {staticContent.subtitle}
          </Typography>
          <Box sx={{ 
            display: 'flex', 
            gap: 2, 
            justifyContent: 'center',
            flexWrap: 'wrap'
          }}>
            <Button 
              component={Link} 
              to={staticContent.buttonLink} 
              variant="contained" 
              color="primary"
              size="large"
              sx={{
                px: 4,
                py: 1.5,
                fontWeight: 600,
                fontSize: '1rem',
                borderRadius: '8px',
                boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: '0 6px 12px rgba(0, 0, 0, 0.2)'
                }
              }}
            >
              {staticContent.buttonText}
            </Button>
            <Button 
              component={Link} 
              to={staticContent.secondaryButtonLink} 
              variant="outlined" 
              color="inherit"
              size="large"
              sx={{
                px: 4,
                py: 1.5,
                fontWeight: 600,
                fontSize: '1rem',
                borderRadius: '8px',
                borderWidth: 2,
                transition: 'all 0.3s ease',
                '&:hover': {
                  borderWidth: 2,
                  backgroundColor: 'rgba(255,255,255,0.1)',
                  transform: 'translateY(-2px)'
                }
              }}
            >
              {staticContent.secondaryButtonText}
            </Button>
          </Box>
        </Box>
      </Container>

      {/* Dots indicator */}
      <Box sx={{
        position: 'absolute',
        bottom: '40px',
        left: '50%',
        transform: 'translateX(-50%)',
        display: 'flex',
        gap: 1.5,
        zIndex: 2
      }}>
        {images.map((_, index) => (
          <Box
            key={index}
            onClick={() => handleDotClick(index)}
            sx={{
              width: '14px',
              height: '14px',
              borderRadius: '50%',
              backgroundColor: index === currentImageIndex ? 'primary.main' : 'rgba(255,255,255,0.5)',
              cursor: 'pointer',
              transition: 'all 0.5s ease', // Slower transition for dots
              '&:hover': {
                backgroundColor: index === currentImageIndex ? 'primary.dark' : 'rgba(255,255,255,0.8)',
                transform: 'scale(1.2)'
              }
            }}
          />
        ))}
      </Box>
    </Box>
  );
};

export default HeroSection;