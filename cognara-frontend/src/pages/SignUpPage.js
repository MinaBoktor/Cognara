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
  Stack,
  Alert,
  Collapse,
  Grid,
  useMediaQuery,
  CircularProgress
} from '@mui/material';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import Layout from '../components/Layout/Layout';
import { Helmet } from 'react-helmet';
// Fixed imports - import each icon separately
import GoogleIcon from '@mui/icons-material/Google';
import FacebookIcon from '@mui/icons-material/Facebook';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import { authAPI, userAPI, emailAPI } from '../services/api';


const SignUpPage = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [visible, setVisible] = useState(false);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [usernameError, setUsernameError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [firstNameError, setFirstNameError] = useState('');
  const [lastNameError, setLastNameError] = useState('');
  const [usernameValid, setUsernameValid] = useState(false);
  const [emailValid, setEmailValid] = useState(false);
  const [isCheckingUsername, setIsCheckingUsername] = useState(false);
  const [isCheckingEmail, setIsCheckingEmail] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [submitSuccess, setSubmitSuccess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSocialLoading, setIsSocialLoading] = useState(false);
  const [socialProvider, setSocialProvider] = useState('');
  const containerRef = useRef(null);
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

  const validatePassword = (password) => {
    const minLength = 12;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    if (password.length < minLength) {
      return 'Password must be at least 12 characters long';
    }
    if (!hasUpperCase) {
      return 'Password must contain at least one uppercase letter';
    }
    if (!hasLowerCase) {
      return 'Password must contain at least one lowercase letter';
    }
    if (!hasNumber) {
      return 'Password must contain at least one number';
    }
    if (!hasSpecialChar) {
      return 'Password must contain at least one special character';
    }
    return '';
  };

  const validateEmailFormat = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!re.test(email)) {
      return 'Please enter a valid email address';
    }
    return '';
  };

  const checkUsernameAvailability = async (username) => {
    if (!username) {
      setUsernameError('Username is required');
      setUsernameValid(false);
      return;
    }
    
    setIsCheckingUsername(true);
    setUsernameError('');
    setUsernameValid(false);
    
    try {
      const response = await userAPI.checkUsername(username);

      const data = response.data;

      if (data.Found > 0) {
        setUsernameError('Username is already taken');
        setUsernameValid(false);
      } else {
        setUsernameError('');
        setUsernameValid(true);
      }
    } catch (error) {
      console.error('Error checking username:', error);
      setUsernameError('Error checking username availability. Please try again.');
      setUsernameValid(false);
    } finally {
      setIsCheckingUsername(false);
    }
  };

  const checkEmailAvailability = async (email) => {
    const formatError = validateEmailFormat(email);
    if (formatError) {
      setEmailError(formatError);
      setEmailValid(false);
      return;
    }
    
    setIsCheckingEmail(true);
    setEmailError('');
    setEmailValid(false);
    
    try {
      const response = await userAPI.checkEmail(email);
      
      const data = response.data;
      
      if (data.Found > 0) {
        setEmailError('Email is already registered');
        setEmailValid(false);
      } else {
        setEmailError('');
        setEmailValid(true);
      }
    } catch (error) {
      console.error('Error checking email:', error);
      setEmailError('Error checking email availability. Please try again.');
      setEmailValid(false);
    } finally {
      setIsCheckingEmail(false);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitError('');
    setSubmitSuccess('');

    // Validate all fields
    const passwordValidation = validatePassword(password);
    
    setPasswordError(passwordValidation);
    setFirstNameError(!firstName ? 'First name is required' : '');
    setLastNameError(!lastName ? 'Last name is required' : '');
    
    if (passwordValidation || !firstName || !lastName || usernameError || !username || emailError || !email || !usernameValid || !emailValid) {
      if (!username) setUsernameError('Username is required');
      if (!email) setEmailError('Email is required');
      setSubmitError('Please fix all errors before submitting');
      return;
    }

    setIsSubmitting(true);
    
    try {
      // First make the signup request
      const signupResponse = await userAPI.signup({username, email, password, firstName, lastName});

      const signupResponseData = signupResponse.data;

      // Then request the verification code
      const codeResponse = await emailAPI.requestCode(email);

      const codeResponseData = codeResponse.data;

      if (codeResponseData.message !== 'Code was sent successfully') {
        throw new Error(codeResponseData.detail || 'Failed to send verification code');
      }

      // Only redirect if both requests were successful
      navigate('/confirm-email', { state: { email } });
    } catch (error) {
      console.error('Signup error:', error);
      setSubmitError(error.message || 'An error occurred during signup');
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
      // Send the credential to your backend
      const backendResponse = await authAPI.googleAuth(response.credential);

      const data = backendResponse.data;

      // Handle successful authentication
      if (data.status == "success") {
        // New user - redirect to email confirmation if needed
        navigate('/userhomepage', { state: { email: data.email } });
      }
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
          // Get user info from Facebook
          window.FB.api('/me', { fields: 'name,email,first_name,last_name' }, async (userInfo) => {
            // Send to your backend
            const backendResponse = await authAPI.facebookAuth(response.authResponse.accessToken, response.authResponse.userID, userInfo);

            const data = backendResponse.data;

            // Handle successful authentication
            if (data.is_new_user) {
              // New user - redirect to email confirmation if needed
              navigate('/confirm-email', { state: { email: data.email } });
            } else {
              // Existing user - redirect to dashboard
              navigate('/userhomepage');
            }
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
          // Fallback to popup if prompt is not displayed
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

  const getFieldEndAdornment = (isValid, isChecking, hasError) => {
    if (isChecking) return null;
    if (hasError) return <ErrorIcon color="error" />;
    if (isValid) return <CheckCircleIcon color="success" />;
    return null;
  };

return (
  <>
    <Helmet>
      <title>Sign Up | Cognara</title>
      <meta name="description" content="Create a new Cognara account" />
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
                  Join us
                </Typography>
                <Typography 
                  variant="subtitle1" 
                  sx={{ 
                    color: theme.palette.text.secondary,
                    fontSize: { xs: '0.9rem', sm: '1rem' }
                  }}
                >
                  Create an account to start your learning journey
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
                      {/* Name Fields */}
                      <Grid container spacing={4} sx={{ mb: 2 }}>
                        <Grid item xs={12} sm={6} width={300}>
                          <TextField
                            margin="dense"
                            required
                            fullWidth
                            id="firstName"
                            label="First Name"
                            name="firstName"
                            autoComplete="given-name"
                            value={firstName}
                            onChange={(e) => setFirstName(e.target.value)}
                            onBlur={() => setFirstNameError(!firstName ? 'First name is required' : '')}
                            error={!!firstNameError}
                            helperText={firstNameError}
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
                        </Grid>
                        <Grid item xs={12} sm={6} width={300}>
                          <TextField
                            margin="dense"
                            required
                            fullWidth
                            id="lastName"
                            label="Last Name"
                            name="lastName"
                            autoComplete="family-name"
                            value={lastName}
                            onChange={(e) => setLastName(e.target.value)}
                            onBlur={() => setLastNameError(!lastName ? 'Last name is required' : '')}
                            error={!!lastNameError}
                            helperText={lastNameError}
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
                        </Grid>
                      </Grid>

                      {/* Username */}
                      <TextField
                        margin="dense"
                        required
                        fullWidth
                        id="username"
                        label="Username"
                        name="username"
                        autoComplete="username"
                        value={username}
                        onChange={(e) => {
                          setUsername(e.target.value);
                          setUsernameError('');
                          setUsernameValid(false);
                        }}
                        onBlur={() => checkUsernameAvailability(username)}
                        error={!!usernameError}
                        helperText={
                          isCheckingUsername 
                            ? 'Checking availability...' 
                            : usernameError 
                              ? usernameError 
                              : usernameValid && username 
                                ? '✓ Username is available' 
                                : ''
                        }
                        disabled={isCheckingUsername}
                        InputProps={{
                          endAdornment: getFieldEndAdornment(usernameValid, isCheckingUsername, !!usernameError)
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
                          setEmailValid(false);
                        }}
                        onBlur={() => checkEmailAvailability(email)}
                        error={!!emailError}
                        helperText={
                          isCheckingEmail 
                            ? 'Checking availability...' 
                            : emailError 
                              ? emailError 
                              : emailValid && email 
                                ? '✓ Email is available' 
                                : ''
                        }
                        disabled={isCheckingEmail}
                        InputProps={{
                          endAdornment: getFieldEndAdornment(emailValid, isCheckingEmail, !!emailError)
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
                        autoComplete="new-password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        onBlur={() => setPasswordError(validatePassword(password))}
                        error={!!passwordError}
                        helperText={passwordError || "Must be at least 12 characters with uppercase, lowercase, number, and special character"}
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

                      {/* Error/Success Messages */}
                      <Collapse in={!!submitError || !!submitSuccess}>
                        <Alert 
                          severity={submitError ? 'error' : 'success'} 
                          sx={{ mb: 2, borderRadius: 2 }}
                        >
                          {submitError || submitSuccess}
                        </Alert>
                      </Collapse>

                      {/* Submit Button */}
                      <Button
                        type="submit"
                        fullWidth
                        variant="contained"
                        disabled={isSubmitting || isCheckingUsername || isCheckingEmail || isSocialLoading}
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
                        {isSubmitting ? 'Creating Account...' : 'Create Account'}
                      </Button>

                      {/* Sign In Link */}
                      <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center' }}>
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
                      Sign up with social media
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

export default SignUpPage;

