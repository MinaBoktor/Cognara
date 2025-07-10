import React, { useState, useEffect } from 'react';
import { Box, Typography, Button, Container, TextField, InputAdornment, IconButton } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import CloseIcon from '@mui/icons-material/Close';
import bgDark from '../assets/Hero_background_dark.jpg';
import bgLight from '../assets/Hero_background_light.png';

const staticContent = {
  title: 'Discover The Best Knowledge',
  subtitle: 'Explore our curated collection of articles and connect with like-minded individuals',
  buttonText: 'Browse Articles',
  buttonLink: '/articles',
  secondaryButtonText: 'LEARN MORE',
  secondaryButtonLink: '/about'
};

const HeroSection = ({ isDarkMode }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [typedTitle, setTypedTitle] = useState('');
  const [typedSubtitle, setTypedSubtitle] = useState('');
  const [searchBarWidth, setSearchBarWidth] = useState('10%');
  const [showSearchBar, setShowSearchBar] = useState(false);

  const handleSearch = () => {
    console.log('Searching for:', searchQuery);
  };

  // Typing animation
  useEffect(() => {
    let subtitleTimeout;
    const titleInterval = setInterval(() => {
      setTypedTitle((prev) => {
        if (prev.length >= staticContent.title.length) {
          clearInterval(titleInterval);
          subtitleTimeout = setTimeout(() => {
            let j = 0;
            const subtitleInterval = setInterval(() => {
              setTypedSubtitle((prevSub) => {
                if (j >= staticContent.subtitle.length) {
                  clearInterval(subtitleInterval);
                  setTimeout(() => {
                    setShowSearchBar(true);
                    let width = 10;
                    const searchInterval = setInterval(() => {
                      width += 5;
                      setSearchBarWidth(`${width}%`);
                      if (width >= 100) clearInterval(searchInterval);
                    }, 20);
                  }, 300);
                  return prevSub;
                }
                j++;
                return staticContent.subtitle.substring(0, j);
              });
            }, 30);
          }, 200);
          return prev;
        }
        return staticContent.title.substring(0, prev.length + 1);
      });
    }, 50);

    return () => {
      clearInterval(titleInterval);
      clearTimeout(subtitleTimeout);
    };
  }, []);

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
          backgroundColor: isDarkMode ? 'rgba(0, 0, 0, 0.5)' : 'rgba(0, 0, 0, 0.3)',
          zIndex: 1,
        }
      }}
    >
      {/* Background image */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundImage: `url(${isDarkMode ? bgDark : bgLight})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          zIndex: 0,
          transition: 'background-image 0.5s ease-in-out'
        }}
      />

      {/* Content */}
      <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 2, textAlign: 'center' }}>
        <Typography
          variant="h1"
          sx={{
            fontWeight: 800,
            textShadow: isDarkMode ? '2px 2px 6px rgba(255, 255, 255, 0)' : '2px 2px 6px rgba(0, 0, 0, 0.5)',
            mb: 3,
            fontSize: { xs: '2.5rem', md: '4rem' },
            minHeight: '4rem',
            '&::after': {
              content: '""',
              borderRight: typedTitle.length < staticContent.title.length ? '4px solid white' : 'none',
              animation: 'blink 0.7s infinite',
              marginLeft: '5px'
            },
            '@keyframes blink': {
              '0%': { opacity: 1 },
              '50%': { opacity: 0 },
              '100%': { opacity: 1 }
            }
          }}
        >
          {typedTitle}
        </Typography>

        <Typography
          variant="subtitle1"
          sx={{
            mb: 4,
            fontSize: { xs: '1.2rem', md: '1.5rem' },
            minHeight: '1.5rem',
            textShadow: isDarkMode ? '2px 2px 6px rgba(255, 255, 255, 0)' : '2px 2px 6px rgba(0, 0, 0, 0.5)',
            '&::after': {
              content: '""',
              borderRight: typedSubtitle.length < staticContent.subtitle.length ? '2px solid white' : 'none',
              animation: 'blink 0.7s infinite',
              marginLeft: '3px'
            }
          }}
        >
          {typedSubtitle}
        </Typography>

        {showSearchBar && (
          <Box sx={{
            maxWidth: '800px',
            mx: 'auto',
            mb: 4,
            width: searchBarWidth,
            transition: 'width 0.3s ease-out'
          }}>
            <TextField
              fullWidth
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search articles, topics, or authors..."
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{
                      fontSize: '2rem',
                      color: searchQuery ? 'primary.main' : 'text.secondary'
                    }} />
                  </InputAdornment>
                ),
                endAdornment: (
                  <>
                    {searchQuery && (
                      <IconButton
                        onClick={() => setSearchQuery('')}
                        edge="end"
                        sx={{ color: 'text.secondary', '&:hover': { color: 'text.primary' } }}
                      >
                        <CloseIcon />
                      </IconButton>
                    )}
                    <Button
                      onClick={handleSearch}
                      variant="contained"
                      color="primary"
                      sx={{
                        borderRadius: '50px',
                        ml: 1,
                        px: 3,
                        fontWeight: 600
                      }}
                    >
                      Search
                    </Button>
                  </>
                )
              }}
              sx={{
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                borderRadius: '50px',
                '& .MuiOutlinedInput-root': {
                  borderRadius: '50px',
                  height: '60px',
                  color: 'text.primary',
                  fontSize: '1.1rem',
                  '& fieldset': {
                    borderColor: 'rgba(255, 255, 255, 0.2)',
                  },
                  '&:hover fieldset': {
                    borderColor: 'primary.main',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: 'primary.main',
                    borderWidth: '2px',
                  },
                },
                '& .MuiInputBase-input::placeholder': {
                  color: 'text.secondary',
                  opacity: 0.8,
                },
              }}
            />
          </Box>
        )}
      </Container>
    </Box>
  );
};

export default HeroSection;