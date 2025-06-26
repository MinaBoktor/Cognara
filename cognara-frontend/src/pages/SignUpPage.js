// src/pages/SignUpPage.js
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
  Stack
} from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import Layout from '../components/Layout/Layout';
import { Helmet } from 'react-helmet';
import { Google, Facebook } from '@mui/icons-material';

const SignUpPage = () => {
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
      {
        threshold: 0.1
      }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => {
      if (containerRef.current) {
        observer.unobserve(containerRef.current);
      }
    };
  }, []);

  const handleSubmit = (event) => {
    event.preventDefault();
    // TODO: Implement actual sign-up logic
    alert('Sign-up functionality not implemented yet.');
  };

  const handleSocialLogin = (provider) => {
    // TODO: Implement social login logic
    alert(`${provider} sign up not implemented yet.`);
  };

  return (
    <>
      <Helmet>
        <title>Sign Up | Cognara</title>
        <meta name="description" content="Create a new Cognara account" />
      </Helmet>
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
            <Box sx={{ maxHeight: '90vh', overflow: 'hidden' }}>
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
                Join Cognara
              </Typography>
              <Typography 
                variant="subtitle1" 
                component="p" 
                sx={{ 
                  color: theme.palette.text.secondary,
                  mb: 2,
                  textAlign: 'center'
                }}
              >
                Create an account to start your learning journey
              </Typography>
              <Divider sx={{ my: 2 }} />

              <Paper 
                elevation={0} 
                sx={{ 
                  p: 3,
                  backgroundColor: theme.palette.background.default,
                  borderRadius: 3,
                  borderLeft: `4px solid ${theme.palette.primary.main}`,
                  boxShadow: '0 8px 32px rgba(0,0,0,0.05)',
                  maxHeight: 'calc(90vh - 150px)',
                  overflowY: 'auto',
                  '&::-webkit-scrollbar': {
                    width: '0.4em',
                  },
                  '&::-webkit-scrollbar-track': {
                    background: theme.palette.background.paper,
                  },
                  '&::-webkit-scrollbar-thumb': {
                    backgroundColor: theme.palette.primary.main,
                    borderRadius: 2,
                  },
                }}
              >
                <Box 
                  component="form" 
                  onSubmit={handleSubmit} 
                  noValidate
                >
                  <TextField
                    margin="dense"
                    autoComplete="name"
                    name="name"
                    required
                    fullWidth
                    id="name"
                    label="Full Name"
                    autoFocus
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                        '& fieldset': {
                          borderColor: theme.palette.divider,
                        },
                        '&:hover fieldset': {
                          borderColor: theme.palette.primary.light,
                        },
                        '&.Mui-focused fieldset': {
                          borderColor: theme.palette.primary.main,
                        },
                      },
                    }}
                  />
                  <TextField
                    margin="dense"
                    required
                    fullWidth
                    id="email"
                    label="Email Address"
                    name="email"
                    autoComplete="email"
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                        '& fieldset': {
                          borderColor: theme.palette.divider,
                        },
                        '&:hover fieldset': {
                          borderColor: theme.palette.primary.light,
                        },
                        '&.Mui-focused fieldset': {
                          borderColor: theme.palette.primary.main,
                        },
                      },
                    }}
                  />
                  <TextField
                    margin="dense"
                    required
                    fullWidth
                    name="password"
                    label="Password"
                    type="password"
                    id="password"
                    autoComplete="new-password"
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                        '& fieldset': {
                          borderColor: theme.palette.divider,
                        },
                        '&:hover fieldset': {
                          borderColor: theme.palette.primary.light,
                        },
                        '&.Mui-focused fieldset': {
                          borderColor: theme.palette.primary.main,
                        },
                      },
                    }}
                  />

                  <Button
                    type="submit"
                    fullWidth
                    variant="contained"
                    sx={{ 
                      mt: 2,
                      mb: 1,
                      py: 1,
                      borderRadius: 2,
                      fontWeight: 700,
                      textTransform: 'none',
                      fontSize: '0.9rem',
                      background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                      '&:hover': {
                        boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
                      },
                      transition: 'all 0.2s ease'
                    }}
                  >
                    Sign Up
                  </Button>

                  <Box sx={{ textAlign: 'center', my: 2 }}>
                    <Divider sx={{ mb: 2 }}>
                      <Typography variant="body2" color="text.secondary">
                        OR
                      </Typography>
                    </Divider>
                    
                    <Stack direction="row" spacing={2} justifyContent="center">
                      <IconButton
                        onClick={() => handleSocialLogin('google')}
                        sx={{
                          backgroundColor: 'transparent',
                          color: theme.palette.text.secondary,
                          border: `1px solid ${theme.palette.divider}`,
                          '&:hover': {
                            backgroundColor: '#f5f5f5',
                            color: '#DB4437'
                          },
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
                          '&:hover': {
                            backgroundColor: '#f5f5f5',
                            color: '#4267B2'
                          },
                          transition: 'all 0.2s ease',
                          width: 40,
                          height: 40
                        }}
                      >
                        <Facebook sx={{ fontSize: 20 }} />
                      </IconButton>
                    </Stack>
                  </Box>

                  <Box textAlign="center" sx={{ mt: 1 }}>
                    <Typography variant="body2" color="text.secondary">
                      Already have an account?{' '}
                      <Link 
                        component={RouterLink} 
                        to="/login" 
                        sx={{
                          fontWeight: 600,
                          color: theme.palette.primary.main,
                          textDecoration: 'none',
                          '&:hover': {
                            textDecoration: 'underline'
                          }
                        }}
                      >
                        Sign In
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

export default SignUpPage;