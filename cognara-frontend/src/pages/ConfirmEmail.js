// src/pages/ConfirmEmail.js
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
  Alert,
  Collapse,
  CircularProgress
} from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { Email, CheckCircle, AccessTime, Refresh } from '@mui/icons-material';
import { authAPI, userAPI, emailAPI } from '../services/api';

const ConfirmEmail = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [visible, setVisible] = useState(false);
  const [code, setCode] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [submitSuccess, setSubmitSuccess] = useState('');
  const [resendTimer, setResendTimer] = useState(120); // Start with 2 minutes
  const [canResend, setCanResend] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const containerRef = useRef(null);
  
  // Get email from navigation state or redirect if not available
  const email = location.state?.email;

  useEffect(() => {
    // Redirect to signup if no email provided
    if (!email) {
      navigate('/signup');
      return;
    }

    // Prevent back navigation after successful verification
    const handlePopState = (event) => {
      if (isVerified) {
        // Push the current state again to prevent going back
        window.history.pushState(null, '', window.location.pathname);
      }
    };

    // Add initial state to history
    window.history.pushState(null, '', window.location.pathname);
    
    // Listen for back button
    window.addEventListener('popstate', handlePopState);

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
      window.removeEventListener('popstate', handlePopState);
      if (containerRef.current) {
        observer.unobserve(containerRef.current);
      }
    };
  }, [email, navigate, isVerified]);

  // Timer effect for resend functionality
  useEffect(() => {
    let interval = null;
    if (resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer(timer => {
          if (timer <= 1) {
            setCanResend(true);
            return 0;
          }
          return timer - 1;
        });
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [resendTimer]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleCodeChange = (event) => {
    const value = event.target.value.replace(/\D/g, '');
    if (value.length <= 6) {
      setCode(value);
      setSubmitError('');
      setSubmitSuccess('');
    }
  };

  const handleVerifyCode = async (event) => {
    event.preventDefault();
    
    if (code.length !== 6) {
      setSubmitError('Please enter a 6-digit code');
      return;
    }

    setIsVerifying(true);
    setSubmitError('');
    setSubmitSuccess('');

    try {
      const response = await emailAPI.verifyCode(email, code);

      const data = response.data;

      if (data.error === "The Code has Expired") {
        setSubmitError('Your verification code has expired. Requesting a new code...');
        // Automatically request new code
        setTimeout(() => {
          handleResendCode(true);
        }, 1500);
      } else if (data.status === "1") {
        setSubmitSuccess('Email verified successfully! Redirecting...');
        setIsVerified(true);
        
        // Prevent back navigation by replacing history
        window.history.replaceState(null, '', '/userhomepage');
        
        setTimeout(() => {
          navigate('/userhomepage', { replace: true });
        }, 2000);
      } else {
        setSubmitError('Invalid verification code. Please try again.');
      }
    } catch (error) {
      console.error('Verification error:', error);
      setSubmitError('An error occurred during verification. Please try again.');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResendCode = async (isAutomatic = false) => {
    if (!canResend && !isAutomatic) return;

    setIsResending(true);
    setSubmitError('');
    setSubmitSuccess('');

    try {
      const response = await emailAPI.requestCode(email);

      const data = response.data;

      if (data.message === 'Code was sent successfully') {
        setSubmitSuccess('A new verification code has been sent to your email');
        setResendTimer(120); // 2 minutes
        setCanResend(false);
        setCode(''); // Clear the current code
      } else {
        setSubmitError('Failed to send verification code. Please try again.');
      }
    } catch (error) {
      console.error('Resend error:', error);
      setSubmitError('An error occurred while sending the code. Please try again.');
    } finally {
      setIsResending(false);
    }
  };

  if (!email) {
    return null; // Component will redirect via useEffect
  }

  return (
    <>
      <Helmet>
        <title>Verify Email | Cognara</title>
        <meta name="description" content="Verify your email address to complete registration" />
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
        <Container maxWidth="sm">
          <Fade in={visible} timeout={600}>
            <Box>
              {/* Header */}
              <Box sx={{ textAlign: 'center', mb: { xs: 3, sm: 4 }, mt: 2 }}>
                <Box sx={{ 
                  display: 'flex', 
                  justifyContent: 'center', 
                  mb: 2,
                  '& .MuiSvgIcon-root': {
                    fontSize: '4rem',
                    color: theme.palette.primary.main
                  }
                }}>
                  <Email />
                </Box>
                <Typography 
                  variant="h3" 
                  component="h1" 
                  sx={{ 
                    fontWeight: 700,
                    mb: 1,
                    background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    fontSize: { xs: '1.8rem', sm: '2.2rem', md: '2.5rem' }
                  }}
                >
                  Verify Your Email
                </Typography>
                <Typography 
                  variant="subtitle1" 
                  sx={{ 
                    color: theme.palette.text.secondary,
                    fontSize: { xs: '0.9rem', sm: '1rem' },
                    mb: 2
                  }}
                >
                  We've sent a 6-digit verification code to
                </Typography>
                <Typography 
                  variant="body1" 
                  sx={{ 
                    color: theme.palette.primary.main,
                    fontWeight: 600,
                    fontSize: { xs: '0.95rem', sm: '1.1rem' }
                  }}
                >
                  {email}
                </Typography>
              </Box>

              {/* Verification Form */}
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
                <Box component="form" onSubmit={handleVerifyCode} noValidate>
                  {/* Code Input */}
                  <TextField
                    margin="dense"
                    required
                    fullWidth
                    id="code"
                    label="Verification Code"
                    name="code"
                    value={code}
                    onChange={handleCodeChange}
                    placeholder="Enter 6-digit code"
                    disabled={isVerified}
                    inputProps={{ 
                      maxLength: 6,
                      style: { 
                        textAlign: 'center', 
                        fontSize: '1.5rem',
                        fontWeight: 600,
                        letterSpacing: '0.5rem'
                      }
                    }}
                    sx={{
                      mb: 3,
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
                      sx={{ mb: 3, borderRadius: 2 }}
                      icon={submitSuccess ? <CheckCircle /> : undefined}
                    >
                      {submitError || submitSuccess}
                    </Alert>
                  </Collapse>

                  {/* Verify Button */}
                  <Button
                    type="submit"
                    fullWidth
                    variant="contained"
                    disabled={isVerifying || code.length !== 6 || isVerified}
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
                    {isVerifying ? (
                      <>
                        <CircularProgress size={20} sx={{ mr: 1, color: 'white' }} />
                        Verifying...
                      </>
                    ) : isVerified ? (
                      'Verified!'
                    ) : (
                      'Verify Email'
                    )}
                  </Button>

                  {/* Resend Section */}
                  {!isVerified && (
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        Didn't receive the code?
                      </Typography>
                      
                      {!canResend ? (
                        <Box sx={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          justifyContent: 'center',
                          gap: 1,
                          mb: 1
                        }}>
                          <AccessTime sx={{ fontSize: '1rem', color: theme.palette.text.secondary }} />
                          <Typography variant="body2" color="text.secondary">
                            Resend available in {formatTime(resendTimer)}
                          </Typography>
                        </Box>
                      ) : (
                        <Button
                          variant="outlined"
                          onClick={() => handleResendCode(false)}
                          disabled={isResending}
                          startIcon={isResending ? <CircularProgress size={16} /> : <Refresh />}
                          sx={{
                            borderRadius: 2,
                            textTransform: 'none',
                            fontWeight: 600,
                            borderColor: theme.palette.primary.main,
                            color: theme.palette.primary.main,
                            '&:hover': {
                              backgroundColor: theme.palette.primary.main,
                              color: 'white',
                              transform: 'translateY(-1px)',
                              boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                            },
                            '&:disabled': {
                              opacity: 0.7
                            },
                            transition: 'all 0.2s ease'
                          }}
                        >
                          {isResending ? 'Sending...' : 'Resend Code'}
                        </Button>
                      )}
                    </Box>
                  )}

                  {/* Helper Text */}
                  <Box sx={{ mt: 3, p: 2, backgroundColor: theme.palette.background.default, borderRadius: 2 }}>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', textAlign: 'center' }}>
                      Check your spam folder if you don't see the email. The code expires in 10 minutes.
                    </Typography>
                  </Box>
                </Box>
              </Paper>
            </Box>
          </Fade>
        </Container>
      </Box>
    </>
  );
};

export default ConfirmEmail;

