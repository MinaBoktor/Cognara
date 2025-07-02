// src/pages/ForgotPassword.js
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
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { Email, CheckCircle, AccessTime, Refresh } from '@mui/icons-material';

const ForgotPassword = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [visible, setVisible] = useState(false);
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [submitSuccess, setSubmitSuccess] = useState('');
  const [resendTimer, setResendTimer] = useState(120);
  const [canResend, setCanResend] = useState(false);
  const [showCodeInput, setShowCodeInput] = useState(false);
  const [showPasswordFields, setShowPasswordFields] = useState(false);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');
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

  // Timer effect for resend functionality
  useEffect(() => {
    let interval = null;
    if (resendTimer > 0 && showCodeInput && !showPasswordFields) {
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
  }, [resendTimer, showCodeInput, showPasswordFields]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

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

  const handleEmailChange = (event) => {
    setEmail(event.target.value);
    setSubmitError('');
  };

  const handleCodeChange = (event) => {
    const value = event.target.value.replace(/\D/g, '');
    if (value.length <= 6) {
      setCode(value);
      setSubmitError('');
    }
  };

  const handleSendCode = async (event) => {
    event.preventDefault();
    
    if (!email) {
      setSubmitError('Please enter your email address');
      return;
    }

    setIsSending(true);
    setSubmitError('');

    try {
      // Check if email exists
      const checkResponse = await fetch('http://127.0.0.1:8000/emailcheck', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email })
      });

      const checkData = await checkResponse.json();
      
      if (checkData.Found === 0) {
        throw new Error('Email not found. Please check your email address.');
      }

      // Send verification code
      const codeResponse = await fetch('http://127.0.0.1:8000/coderequest', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email })
      });

      const codeData = await codeResponse.json();

      if (!codeResponse.ok || codeData.message !== 'Code was sent successfully') {
        throw new Error('Failed to send verification code. Please try again.');
      }

      setShowCodeInput(true);
      setResendTimer(120);
      setCanResend(false);
      setSubmitSuccess('A verification code has been sent to your email');
    } catch (error) {
      setSubmitError(error.message || 'An error occurred. Please try again.');
    } finally {
      setIsSending(false);
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

    try {
      const response = await fetch('http://127.0.0.1:8000/verifycode', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email,
          code: code
        })
      });

      const data = await response.json();

      if (data.error === "The Code has Expired") {
        throw new Error('Your verification code has expired. Please request a new one.');
      } else if (data.status !== "1") {
        throw new Error('Invalid verification code. Please try again.');
      }

      setSubmitSuccess('Code verified! Please enter your new password.');
      setShowPasswordFields(true);
    } catch (error) {
      setSubmitError(error.message || 'An error occurred during verification. Please try again.');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResendCode = async () => {
    if (!canResend) return;

    setIsResending(true);
    setSubmitError('');

    try {
      const response = await fetch('http://127.0.0.1:8000/coderequest', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email })
      });

      const data = await response.json();

      if (data.message !== 'Code was sent successfully') {
        throw new Error('Failed to send verification code. Please try again.');
      }

      setSubmitSuccess('A new verification code has been sent to your email');
      setResendTimer(120);
      setCanResend(false);
      setCode('');
    } catch (error) {
      setSubmitError(error.message || 'An error occurred while sending the code. Please try again.');
    } finally {
      setIsResending(false);
    }
  };

  const handlePasswordReset = async (event) => {
    event.preventDefault();
    
    // Validate passwords
    const passwordValidation = validatePassword(password);
    setPasswordError(passwordValidation);
    
    if (password !== confirmPassword) {
      setConfirmPasswordError('Passwords do not match');
      return;
    } else {
      setConfirmPasswordError('');
    }
    
    if (passwordValidation) {
      return;
    }

    setIsResetting(true);
    setSubmitError('');

    try {
      const response = await fetch('http://127.0.0.1:8000/forgetpass', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email,
          password: password
        })
      });

      const data = await response.json();

      if (data.status !== "1") {
        throw new Error(data.message || 'Password reset failed. Please try again.');
      }

      setSubmitSuccess('Password changed successfully! Redirecting to login...');
      setTimeout(() => {
        navigate('/login', { state: { resetSuccess: true } });
      }, 2000);
    } catch (error) {
      setSubmitError(error.message || 'An error occurred during password reset. Please try again.');
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Reset Password | Cognara</title>
        <meta name="description" content="Reset your Cognara account password" />
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
                  {showPasswordFields ? 'Set New Password' : 'Reset Your Password'}
                </Typography>
                <Typography 
                  variant="subtitle1" 
                  sx={{ 
                    color: theme.palette.text.secondary,
                    fontSize: { xs: '0.9rem', sm: '1rem' },
                    mb: 2
                  }}
                >
                  {showPasswordFields ? 
                    "Enter your new password below" : 
                    showCodeInput ? 
                    "We've sent a 6-digit verification code to" : 
                    "Enter your email to receive a verification code"}
                </Typography>
                {(showCodeInput || showPasswordFields) && (
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
                )}
              </Box>

              {/* Form */}
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
                {!showPasswordFields ? (
                  <Box component="form" onSubmit={showCodeInput ? handleVerifyCode : handleSendCode} noValidate>
                    {!showCodeInput ? (
                      <TextField
                        margin="normal"
                        required
                        fullWidth
                        id="email"
                        label="Email Address"
                        name="email"
                        autoComplete="email"
                        value={email}
                        onChange={handleEmailChange}
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
                    ) : (
                      <TextField
                        margin="normal"
                        required
                        fullWidth
                        id="code"
                        label="Verification Code"
                        name="code"
                        value={code}
                        onChange={handleCodeChange}
                        placeholder="Enter 6-digit code"
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
                    )}

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

                    {/* Submit Button */}
                    <Button
                      type="submit"
                      fullWidth
                      variant="contained"
                      disabled={
                        showCodeInput 
                          ? (isVerifying || code.length !== 6)
                          : (isSending || !email)
                      }
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
                      {isSending ? (
                        <>
                          <CircularProgress size={20} sx={{ mr: 1, color: 'white' }} />
                          Sending...
                        </>
                      ) : isVerifying ? (
                        <>
                          <CircularProgress size={20} sx={{ mr: 1, color: 'white' }} />
                          Verifying...
                        </>
                      ) : showCodeInput ? (
                        'Verify Code'
                      ) : (
                        'Send Verification Code'
                      )}
                    </Button>

                    {/* Resend Section */}
                    {showCodeInput && (
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
                            onClick={handleResendCode}
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
                  </Box>
                ) : (
                  <Box component="form" onSubmit={handlePasswordReset} noValidate>
                    <TextField
                      margin="normal"
                      required
                      fullWidth
                      name="password"
                      label="New Password"
                      type="password"
                      id="password"
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        setPasswordError('');
                      }}
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
                    <TextField
                      margin="normal"
                      required
                      fullWidth
                      name="confirmPassword"
                      label="Confirm New Password"
                      type="password"
                      id="confirmPassword"
                      value={confirmPassword}
                      onChange={(e) => {
                        setConfirmPassword(e.target.value);
                        setConfirmPasswordError('');
                      }}
                      onBlur={() => {
                        if (password !== confirmPassword) {
                          setConfirmPasswordError('Passwords do not match');
                        }
                      }}
                      error={!!confirmPasswordError}
                      helperText={confirmPasswordError}
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

                    <Button
                      type="submit"
                      fullWidth
                      variant="contained"
                      disabled={isResetting || !!passwordError || !!confirmPasswordError || !password || !confirmPassword}
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
                      {isResetting ? (
                        <>
                          <CircularProgress size={20} sx={{ mr: 1, color: 'white' }} />
                          Resetting...
                        </>
                      ) : (
                        'Reset Password'
                      )}
                    </Button>
                  </Box>
                )}

                {/* Helper Text */}
                <Box sx={{ mt: 3, p: 2, backgroundColor: theme.palette.background.default, borderRadius: 2 }}>
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', textAlign: 'center' }}>
                    {showPasswordFields ? 
                      "Make sure your new password meets all the requirements" : 
                      showCodeInput ? 
                      "Check your spam folder if you don't see the email. The code expires in 10 minutes." : 
                      "We'll send you a verification code to reset your password."}
                  </Typography>
                </Box>
              </Paper>
            </Box>
          </Fade>
        </Container>
      </Box>
    </>
  );
};

export default ForgotPassword;