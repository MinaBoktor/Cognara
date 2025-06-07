import React, { useState, useEffect } from 'react';
import { 
  AppBar, 
  Toolbar, 
  Typography, 
  Button, 
  Box, 
  Container,
  IconButton,
  Menu,
  MenuItem,
  useMediaQuery,
  useTheme
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import { Link } from 'react-router-dom';

const Header = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [anchorEl, setAnchorEl] = useState(null);
  const [scrolled, setScrolled] = useState(false);
  const open = Boolean(anchorEl);

  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 10;
      if (isScrolled !== scrolled) {
        setScrolled(isScrolled);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [scrolled]);

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const navItems = ['Home', 'About', 'Submit', 'Contact'];
  const rightItems = ['Newsletter', 'Login', 'Sign Up'];

  return (
    <AppBar 
      position="fixed"
      color="transparent"
      elevation={scrolled ? 4 : 0} // Add elevation when scrolled
      sx={{
        py: 2,
        backgroundColor: scrolled ? 'background.paper' : 'transparent',
        backdropFilter: scrolled ? 'blur(10px)' : 'none',
        transition: 'all 0.3s ease',
        zIndex: 3,
        animation: 'dropIn 0.5s ease-out forwards',
        opacity: 0,
        transform: 'translateY(-100px)',
        '@keyframes dropIn': {
          to: {
            opacity: 1,
            transform: 'translateY(0)'
          }
        }
      }}
    >
      <Container maxWidth="lg">
        <Toolbar disableGutters sx={{ justifyContent: 'space-between' }}>
          {/* Mobile menu button */}
          {isMobile && (
            <Box sx={{ flex: 1, display: 'flex', justifyContent: 'flex-start' }}>
              <IconButton
                size="large"
                edge="start"
                color="inherit"
                aria-label="menu"
                onClick={handleMenuOpen}
                sx={{ color: 'text.primary' }}
              >
                <MenuIcon />
              </IconButton>
              <Menu
                id="mobile-menu"
                anchorEl={anchorEl}
                open={open}
                onClose={handleMenuClose}
                MenuListProps={{
                  'aria-labelledby': 'mobile-menu',
                }}
              >
                {[...navItems, ...rightItems].map((item) => (
                  <MenuItem 
                    key={item} 
                    onClick={handleMenuClose}
                    component={Link}
                    to={item === 'Home' ? '/' : `/${item.toLowerCase().replace(' ', '-')}`}
                  >
                    {item}
                  </MenuItem>
                ))}
              </Menu>
            </Box>
          )}

          {/* Left-aligned navigation (desktop) */}
          {!isMobile && (
            <Box sx={{ 
              display: 'flex', 
              gap: 2,
              flex: 1,
              justifyContent: 'flex-start'
            }}>
              {navItems.map((label) => (
                <Button 
                  key={label}
                  component={Link} 
                  to={label === 'Home' ? '/' : `/${label.toLowerCase().replace(' ', '-')}`}
                  sx={{
                    color: 'text.primary',
                    textTransform: 'none',
                    fontSize: '1rem',
                    fontWeight: '700',
                    '&:hover': {
                      color: 'primary.main',
                      backgroundColor: 'transparent'
                    }
                  }}
                >
                  {label}
                </Button>
              ))}
            </Box>
          )}

          {/* Centered logo */}
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'center',
            flex: isMobile ? 0 : 1, // Only take flex space on desktop
            position: isMobile ? 'absolute' : 'static', // Position absolutely on mobile
            left: isMobile ? '50%' : 'auto', // Center horizontally on mobile
            transform: isMobile ? 'translateX(-50%)' : 'none' // Adjust for perfect centering
          }}>
            <Typography 
              variant="h4" 
              component={Link} 
              to="/" 
              sx={{ 
                fontWeight: 900,
                mb: 1,
                background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                display: 'inline-block',
              }}
            >
              Cognara
            </Typography>
          </Box>

          {/* Right-aligned actions (desktop) */}
          {!isMobile && (
            <Box sx={{ 
              display: 'flex', 
              gap: 2,
              flex: 1,
              justifyContent: 'flex-end'
            }}>
              <Button 
                component={Link} 
                to="/newsletter"
                sx={{
                  color: 'text.primary',
                  textTransform: 'none',
                  fontSize: '1rem',
                  fontWeight: '700',
                  '&:hover': {
                    color: 'primary.main',
                    backgroundColor: 'transparent'
                  }
                }}
              >
                Newsletter
              </Button>
              <Button 
                component={Link} 
                to="/login"
                variant="outlined"
                sx={{
                  backgroundColor: 'primary.dark',
                  borderColor: 'primary.dark',
                  color: 'text.primary',
                  textTransform: 'none',
                  fontSize: '1rem',
                  fontWeight: '700',
                  px: 2,
                  '&:hover': {
                    borderColor: 'primary.main',
                    color: 'primary.main'
                  }
                }}
              >
                Login
              </Button>
              <Button 
                component={Link} 
                to="/signup"
                variant="outlined"
                sx={{
                  backgroundColor: 'primary.dark',
                  borderColor: 'primary.dark',
                  color: 'text.primary',
                  textTransform: 'none',
                  fontSize: '1rem',
                  fontWeight: '700',
                  px: 2,
                  '&:hover': {
                    borderColor: 'primary.main',
                    color: 'primary.main'
                  }
                }}
              >
                Sign Up
              </Button>
            </Box>
          )}
        </Toolbar>
      </Container>
    </AppBar>
  );
};

export default Header;