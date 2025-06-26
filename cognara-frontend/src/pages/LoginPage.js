// src/pages/LoginPage.js
import React, { useState, useEffect, useRef } from 'react';
import { 
  Container, 
  Paper, 
  TextField, 
  Button, 
  Typography, 
  Box,
  Fade,
  useTheme,
  Divider,
  Link,
  IconButton,
  Stack,
  CssBaseline
} from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { Google, Facebook } from '@mui/icons-material';

const LoginPage = () => {
  const theme = useTheme();
  const [visible, setVisible] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    if (containerRef.current) observer.observe(containerRef.current);
    return () => {
      if (containerRef.current) observer.unobserve(containerRef.current);
    };
  }, []);

  const handleSubmit = (event) => {
    event.preventDefault();
    alert('Login functionality not implemented yet.');
  };

  const handleSocialLogin = (provider) => {
    alert(`${provider} login not implemented yet.`);
  };

  return (
    <>
      <Helmet>
        <title>Login | Cognara</title>
        <meta name="description" content="Login to your Cognara account" />
      </Helmet>
      <CssBaseline />

      <Container 
        component="main" 
        maxWidth="sm" 
        sx={{ 
          height: '100vh',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          py: 2
        }}
        ref={containerRef}
      >
        <Fade in={visible} timeout={600}>
          <Box>
            {/* Header */}
            <Typography 
              variant="h4" 
              component="h1" 
              sx={{ 
                fontWeight: 700,
                mb: 1,
                textAlign: 'center',
                background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                fontSize: '2rem'
              }}
            >
              Welcome Back
            </Typography>
            
            {/* Subtitle */}
            <Typography 
              variant="subtitle1" 
              component="p" 
              sx={{ 
                color: theme.palette.text.secondary,
                mb: 2,
                textAlign: 'center'
              }}
            >
              Sign in to continue your learning journey
            </Typography>
            <Divider sx={{ my: 2 }} />

            {/* Form Container */}
            <Paper 
              elevation={0} 
              sx={{ 
                p: 3,
                backgroundColor: theme.palette.background.default,
                borderRadius: 3,
                borderLeft: `4px solid ${theme.palette.primary.main}`,
                boxShadow: '0 8px 32px rgba(0,0,0,0.05)'
              }}
            >
              <Box component="form" onSubmit={handleSubmit} noValidate>
                {/* Email Field */}
                <TextField
                  margin="dense"
                  required
                  fullWidth
                  id="email"
                  label="Email Address"
                  name="email"
                  autoComplete="email"
                  autoFocus
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      '& fieldset': { borderColor: theme.palette.divider },
                      '&:hover fieldset': { borderColor: theme.palette.primary.light },
                      '&.Mui-focused fieldset': { borderColor: theme.palette.primary.main },
                    },
                  }}
                />

                {/* Password Field */}
                <TextField
                  margin="dense"
                  required
                  fullWidth
                  name="password"
                  label="Password"
                  type="password"
                  id="password"
                  autoComplete="current-password"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      '& fieldset': { borderColor: theme.palette.divider },
                      '&:hover fieldset': { borderColor: theme.palette.primary.light },
                      '&.Mui-focused fieldset': { borderColor: theme.palette.primary.main },
                    },
                  }}
                />
                
                {/* Forgot Password */}
                <Box sx={{ textAlign: 'right', mb: 1 }}>
                  <Link 
                    component={RouterLink} 
                    to="/forgot-password" 
                    variant="body2"
                    sx={{
                      color: theme.palette.text.secondary,
                      '&:hover': {
                        color: theme.palette.primary.main,
                        textDecoration: 'none'
                      },
                      transition: 'color 0.2s ease'
                    }}
                  >
                    Forgot password?
                  </Link>
                </Box>

                {/* Submit Button */}
                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  sx={{ 
                    mt: 1, 
                    mb: 1,
                    py: 1,
                    borderRadius: 2,
                    fontWeight: 700,
                    textTransform: 'none',
                    fontSize: '0.9rem',
                    background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                    '&:hover': { boxShadow: '0 4px 12px rgba(0,0,0,0.2)' },
                    transition: 'all 0.2s ease'
                  }}
                >
                  Sign In
                </Button>

                {/* Social Login */}
                <Box sx={{ textAlign: 'center', my: 2 }}>
                  <Divider sx={{ mb: 2 }}>
                    <Typography variant="body2" color="text.secondary">OR</Typography>
                  </Divider>
                  
                  <Stack direction="row" spacing={2} justifyContent="center">
                    <IconButton
                      onClick={() => handleSocialLogin('google')}
                      sx={{
                        backgroundColor: 'transparent',
                        color: theme.palette.text.secondary,
                        border: `1px solid ${theme.palette.divider}`,
                        '&:hover': { backgroundColor: '#f5f5f5', color: '#DB4437' },
                        transition: 'all 0.2s ease',
                        width: 40,
                        height: 40
                      }}
                    >
                      <Google sx={{ fontSize: 20 }} />
                    </IconButton>
                    <IconButton
                      onClick={() => handleSocialLogin('facebook')}
                      sx={{
                        backgroundColor: 'transparent',
                        color: theme.palette.text.secondary,
                        border: `1px solid ${theme.palette.divider}`,
                        '&:hover': { backgroundColor: '#f5f5f5', color: '#4267B2' },
                        transition: 'all 0.2s ease',
                        width: 40,
                        height: 40
                      }}
                    >
                      <Facebook sx={{ fontSize: 20 }} />
                    </IconButton>
                  </Stack>
                </Box>

                {/* Sign Up Link */}
                <Box textAlign="center" sx={{ mt: 1 }}>
                  <Typography variant="body2" color="text.secondary">
                    Don't have an account?{' '}
                    <Link 
                      component={RouterLink} 
                      to="/signup" 
                      sx={{
                        fontWeight: 600,
                        color: theme.palette.primary.main,
                        textDecoration: 'none',
                        '&:hover': { textDecoration: 'underline' }
                      }}
                    >
                      Sign Up
                    </Link>
                  </Typography>
                </Box>
              </Box>
            </Paper>
          </Box>
        </Fade>
      </Container>
    </>
  );
};

export default LoginPage;