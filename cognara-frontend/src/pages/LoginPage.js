// src/pages/LoginPage.js
import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
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
  Stack,
  Alert,
  Collapse,
  Grid,
  useMediaQuery,
  CircularProgress
} from '@mui/material';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import GoogleIcon from '@mui/icons-material/Google';
import FacebookIcon from '@mui/icons-material/Facebook';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import { authAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';


const LoginPage = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [visible, setVisible] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [submitError, setSubmitError] = useState('');
  const [submitSuccess, setSubmitSuccess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSocialLoading, setIsSocialLoading] = useState(false);
  const [socialProvider, setSocialProvider] = useState('');
  const location = useLocation();
  const [resetSuccess, setResetSuccess] = useState(false);
  const containerRef = useRef(null);
  const { login } = useAuth();
  const navigate = useNavigate();

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


  useEffect(() => {
    if (location.state?.resetSuccess) {
      setResetSuccess(true);
      // Clear the state so the message doesn't show on refresh
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);
  // Load Google SDK
  useEffect(() => {
    const loadGoogleSDK = () => {
      if (window.google) return;
      
      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.onload = () => {
        if (window.google) {
          window.google.accounts.id.initialize({
            client_id: process.env.REACT_APP_GOOGLE_CLIENT_ID,
            callback: handleGoogleResponse,
            auto_select: false,
            cancel_on_tap_outside: true,
          });
        }
      };
      document.head.appendChild(script);
    };

    loadGoogleSDK();
  }, []);

  // Load Facebook SDK
  useEffect(() => {
    const loadFacebookSDK = () => {
      if (window.FB) return;

      window.fbAsyncInit = function() {
        window.FB.init({
          appId: process.env.REACT_APP_FACEBOOK_APP_ID,
          cookie: true,
          xfbml: true,
          version: 'v18.0'
        });
      };

      const script = document.createElement('script');
      script.async = true;
      script.defer = true;
      script.crossOrigin = 'anonymous';
      script.src = 'https://connect.facebook.net/en_US/sdk.js';
      document.head.appendChild(script);
    };

    loadFacebookSDK();
  }, []);

  const validateEmailFormat = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!re.test(email)) {
      return 'Please enter a valid email address';
    }
    return '';
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitError('');
    setSubmitSuccess('');

    const emailValidation = validateEmailFormat(email);
    setEmailError(emailValidation);

    if (emailValidation || !password) {
      if (!password) setPasswordError('Password is required');
      setSubmitError('Please fix all errors before submitting');
      return;
    }

    setIsSubmitting(true);
    
    try {
      await login(email, password);
      // Add a small delay to ensure state propagation
      await new Promise(resolve => setTimeout(resolve, 100));
      navigate('/dashboard');
    } catch (error) {
      console.error('Login error:', error);
      setSubmitError(error.response?.data?.message || 'Invalid email or password');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Google Sign-In Response
  const handleGoogleResponse = async (response) => {
    setIsSocialLoading(true);
    setSocialProvider('Google');
    setSubmitError('');

    try {
      const backendResponse = await authAPI.googleAuth(response.credential);

      const data = await backendResponse.json();

      if (!backendResponse.ok) {
        throw new Error(data.detail || 'Google authentication failed');
      }

      // Handle successful authentication
      navigate('/userhomepage');
    } catch (error) {
      console.error('Google auth error:', error);
      setSubmitError(error.message || 'Google authentication failed');
    } finally {
      setIsSocialLoading(false);
      setSocialProvider('');
    }
  };

  // Handle Facebook Sign-In
  const handleFacebookLogin = () => {
    if (!window.FB) {
      setSubmitError('Facebook SDK not loaded. Please try again.');
      return;
    }

    setIsSocialLoading(true);
    setSocialProvider('Facebook');
    setSubmitError('');

    window.FB.login(async (response) => {
      if (response.authResponse) {
        try {
          window.FB.api('/me', { fields: 'name,email,first_name,last_name' }, async (userInfo) => {
            const backendResponse = await authAPI.facebookAuth(response.authResponse.accessToken, response.authResponse.userID, userInfo);

            const data = await backendResponse.json();

            if (!backendResponse.ok) {
              throw new Error(data.detail || 'Facebook authentication failed');
            }

            navigate('/userhomepage');
          });
        } catch (error) {
          console.error('Facebook auth error:', error);
          setSubmitError(error.message || 'Facebook authentication failed');
        } finally {
          setIsSocialLoading(false);
          setSocialProvider('');
        }
      } else {
        setIsSocialLoading(false);
        setSocialProvider('');
        setSubmitError('Facebook login was cancelled');
      }
    }, { scope: 'email' });
  };

  // Handle Google Sign-In Button Click
  const handleGoogleLogin = () => {
    if (!window.google) {
      setSubmitError('Google SDK not loaded. Please try again.');
      return;
    }

    setIsSocialLoading(true);
    setSocialProvider('Google');
    setSubmitError('');

    try {
      window.google.accounts.id.prompt((notification) => {
        if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
          window.google.accounts.id.renderButton(
            document.getElementById('google-signin-button'),
            { 
              theme: 'outline', 
              size: 'large',
              width: '100%'
            }
          );
        }
      });
    } catch (error) {
      console.error('Google login error:', error);
      setSubmitError('Failed to initialize Google login');
      setIsSocialLoading(false);
      setSocialProvider('');
    }
  };

  const getFieldEndAdornment = (isValid, hasError) => {
    if (hasError) return <ErrorIcon color="error" />;
    if (isValid) return <CheckCircleIcon color="success" />;
    return null;
  };

  return (
    <>
      <Helmet>
        <title>Login | Cognara</title>
        <meta name="description" content="Login to your Cognara account" />
      </Helmet>

      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          py: { xs: 2, sm: 4 },
          px: { xs: 1, sm: 2 },
          mt: 2,
        }}
        ref={containerRef}
      >
        <Container maxWidth="false">
          <Fade in={visible} timeout={600}>
            <Box>
              {/* Header */}
              <Box sx={{ textAlign: 'center', mb: { xs: 3, sm: 4 }, mt: 2 }}>
                <Typography 
                  variant="h3" 
                  component="h1" 
                  sx={{ 
                    fontWeight: 700,
                    mb: 1,
                    background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    fontSize: { xs: '1.5rem', sm: '2rem', md: '2.5rem' }
                  }}
                >
                  Welcome Back
                </Typography>
                <Typography 
                  variant="subtitle1" 
                  sx={{ 
                    color: theme.palette.text.secondary,
                    fontSize: { xs: '0.9rem', sm: '1rem' }
                  }}
                >
                  Sign in to continue your learning journey
                </Typography>
              </Box>

              {/* Main Content */}
              <Grid container spacing={{ xs: 2, md: 4}} justifyContent="center" alignItems="flex-start">
                {/* Form Section */}
                <Grid item xs={12} md={4} lg={6} width={700}>
                  <Paper 
                    elevation={0}
                    sx={{ 
                      p: { xs: 3, sm: 4 },
                      borderRadius: 3,
                      borderLeft: `4px solid ${theme.palette.primary.main}`,
                      backgroundColor: 'transparent',
                      width: '100%'
                    }}
                  >
                    <Box component="form" onSubmit={handleSubmit} noValidate>
                      {/* Email */}
                      <TextField
                        margin="dense"
                        required
                        fullWidth
                        id="email"
                        label="Email Address"
                        name="email"
                        autoComplete="email"
                        value={email}
                        onChange={(e) => {
                          setEmail(e.target.value);
                          setEmailError('');
                        }}
                        onBlur={() => setEmailError(validateEmailFormat(email))}
                        error={!!emailError}
                        helperText={emailError}
                        InputProps={{
                          endAdornment: getFieldEndAdornment(!emailError && email, !!emailError)
                        }}
                        sx={{
                          mb: 2,
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

                      {/* Password */}
                      <TextField
                        margin="dense"
                        required
                        fullWidth
                        name="password"
                        label="Password"
                        type="password"
                        id="password"
                        autoComplete="current-password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        onBlur={() => setPasswordError(!password ? 'Password is required' : '')}
                        error={!!passwordError}
                        helperText={passwordError}
                        sx={{
                          mb: 2,
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

                      {/* Forgot Password */}
                      <Box sx={{ textAlign: 'right', mb: 2 }}>
                        <Link 
                          component={RouterLink} 
                          to="/forgot-password"
                          sx={{
                            fontWeight: 600,
                            color: theme.palette.text.secondary,
                            textDecoration: 'none',
                            '&:hover': {
                              color: theme.palette.primary.main,
                              textDecoration: 'underline'
                            },
                            transition: 'all 0.2s ease'
                          }}
                        >
                          Forgot password?
                        </Link>
                      </Box>

                      {/* Error/Success Messages */}
                      <Collapse in={!!submitError || !!submitSuccess}>
                        <Alert 
                          severity={submitError ? 'error' : 'success'} 
                          sx={{ mb: 2, borderRadius: 2 }}
                        >
                          {submitError || submitSuccess}
                        </Alert>
                      </Collapse>

                      <Collapse in={resetSuccess}>
                        <Alert 
                          severity="success" 
                          sx={{ mb: 2, borderRadius: 2 }}
                          onClose={() => setResetSuccess(false)}
                        >
                          Your password has been reset successfully. Please login with your new password.
                        </Alert>
                      </Collapse>

                      {/* Submit Button */}
                      <Button
                        type="submit"
                        fullWidth
                        variant="contained"
                        disabled={isSubmitting || isSocialLoading}
                        sx={{ 
                          mb: 3,
                          py: 1.5,
                          borderRadius: 2,
                          fontWeight: 700,
                          textTransform: 'none',
                          fontSize: '1rem',
                          background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                          '&:hover': {
                            boxShadow: '0 6px 20px rgba(0,0,0,0.2)',
                            transform: 'translateY(-1px)'
                          },
                          '&:disabled': {
                            opacity: 0.7
                          },
                          transition: 'all 0.2s ease'
                        }}
                      >
                        {isSubmitting ? 'Signing In...' : 'Sign In'}
                      </Button>

                      {/* Sign Up Link */}
                      <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center' }}>
                        Don't have an account?{' '}
                        <Link 
                          component={RouterLink} 
                          to="/signup" 
                          sx={{
                            fontWeight: 600,
                            color: theme.palette.primary.main,
                            textDecoration: 'none',
                            '&:hover': {
                              textDecoration: 'underline'
                            }
                          }}
                        >
                          Sign Up
                        </Link>
                      </Typography>
                    </Box>
                  </Paper>
                </Grid>

                {/* Vertical Divider - Only for desktop */}
                {!isMobile && (
                  <Grid item md={1} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Divider 
                      orientation="vertical" 
                      flexItem 
                      sx={{ 
                        height: '70%',
                        borderColor: '#ffffff',
                        borderRightWidth: 2
                      }} 
                    />
                  </Grid>
                )}

                {/* Social Login Section */}
                <Grid item xs={12} md={5} lg={4} width={500}>
                  <Box sx={{ 
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    height: '100%',
                    minHeight: { xs: 'auto', md: '400px' },
                    px: { xs: 2, md: 3 }
                  }}>
                    {/* Divider for mobile */}
                    {(
                      <>
                        <Divider sx={{ width: '100%', my: 3 }}>
                          <Typography variant="body2" color="text.secondary">
                            OR
                          </Typography>
                        </Divider>
                      </>
                    )}
                    
                    {/* OR text for desktop */}
                    {(
                      <Grid item md={1} sx={{ display: { xs: 'none', md: 'block' } }}>
                        <Divider orientation="vertical" sx={{ height: '100%', borderColor: theme.palette.divider }} />
                      </Grid>
                    )}
                    
                    <Typography 
                      variant="subtitle2" 
                      sx={{ 
                        mb: 3,
                        color: theme.palette.text.secondary,
                        textAlign: 'center',
                        fontSize: { xs: '0.875rem', sm: '1rem' }
                      }}
                    >
                      Sign in with social media
                    </Typography>

                    <Stack spacing={2} sx={{ width: '100%', maxWidth: { xs: '100%', md: '90%' } }}>
                      {/* Google Sign-In Button */}
                      <Button
                        onClick={handleGoogleLogin}
                        variant="outlined"
                        startIcon={
                          isSocialLoading && socialProvider === 'Google' ? 
                            <CircularProgress size={20} /> : 
                            <GoogleIcon />
                        }
                        size="large"
                        disabled={isSocialLoading}
                        sx={{
                          py: 1.5,
                          borderRadius: 2,
                          textTransform: 'none',
                          borderColor: theme.palette.divider,
                          color: theme.palette.text.secondary,
                          '&:hover': {
                            backgroundColor: '#f5f5f5',
                            color: '#DB4437',
                            borderColor: '#DB4437',
                            transform: 'translateY(-1px)',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                          },
                          '&:disabled': {
                            opacity: 0.7
                          },
                          transition: 'all 0.2s ease'
                        }}
                      >
                        {isSocialLoading && socialProvider === 'Google' ? 
                          'Connecting...' : 
                          'Continue with Google'
                        }
                      </Button>
                      
                      {/* Facebook Sign-In Button */}
                      <Button
                        onClick={handleFacebookLogin}
                        variant="outlined"
                        startIcon={
                          isSocialLoading && socialProvider === 'Facebook' ? 
                            <CircularProgress size={20} /> : 
                            <FacebookIcon />
                        }
                        size="large"
                        disabled={isSocialLoading}
                        sx={{
                          py: 1.5,
                          borderRadius: 2,
                          textTransform: 'none',
                          borderColor: theme.palette.divider,
                          color: theme.palette.text.secondary,
                          '&:hover': {
                            backgroundColor: '#f5f5f5',
                            color: '#4267B2',
                            borderColor: '#4267B2',
                            transform: 'translateY(-1px)',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                          },
                          '&:disabled': {
                            opacity: 0.7
                          },
                          transition: 'all 0.2s ease'
                        }}
                      >
                        {isSocialLoading && socialProvider === 'Facebook' ? 
                          'Connecting...' : 
                          'Continue with Facebook'
                        }
                      </Button>

                      {/* Hidden Google Sign-In Button for fallback */}
                      <div id="google-signin-button" style={{ display: 'none' }}></div>
                    </Stack>
                  </Box>
                </Grid>
              </Grid>
            </Box>
          </Fade>
        </Container>
      </Box>
    </>
  );
};

export default LoginPage;