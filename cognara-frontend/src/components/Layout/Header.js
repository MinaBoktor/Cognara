import React from 'react';
import { AppBar, Toolbar, Typography, Button, Box, IconButton, Container } from '@mui/material';
import { Link } from 'react-router-dom';

const Header = () => {
  return (
    <AppBar 
      position="absolute"
      color="transparent"
      elevation={0}
      sx={{
        py: 2,
        backgroundColor: 'transparent',
        zIndex: 3
      }}
    >
      <Container maxWidth="lg">
        <Toolbar disableGutters>
          <Typography 
            variant="h4" 
            component={Link} 
            to="/" 
            sx={{ 
              flexGrow: 1, 
              textDecoration: 'none', 
              color: 'primary.light',
              fontWeight: 700,
              letterSpacing: 1
            }}
          >
            Cognara
          </Typography>
          <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 2 }}>
            <Button 
              component={Link} 
              to="/"
              sx={{
                color: 'primary.light',
                '&:hover': {
                  color: 'primary.main',
                  backgroundColor: 'transparent'
                }
              }}
            >
              Home
            </Button>
            <Button 
              component={Link} 
              to="/about"
              sx={{
                color: 'primary.light',
                '&:hover': {
                  color: 'primary.main',
                  backgroundColor: 'transparent'
                }
              }}
            >
              About
            </Button>
            <Button 
              component={Link} 
              to="/submit-article"
              sx={{
                color: 'primary.light',
                '&:hover': {
                  color: 'primary.main',
                  backgroundColor: 'transparent'
                }
              }}
            >
              Submit
            </Button>
            <Button 
              component={Link} 
              to="/contact"
              sx={{
                color: 'primary.light',
                '&:hover': {
                  color: 'primary.main',
                  backgroundColor: 'transparent'
                }
              }}
            >
              Contact
            </Button>
          </Box>
          <Box sx={{ ml: 4 }}>
            <Button 
              component={Link} 
              to="/login"
              variant="outlined"
              sx={{
                borderColor: 'text.primary',
                color: 'primary.light',
                '&:hover': {
                  borderColor: 'primary.main',
                  color: 'primary.main'
                }
              }}
            >
              Login
            </Button>
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
};

export default Header;