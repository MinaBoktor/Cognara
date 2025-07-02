// src/components/EmailVerification.js
import React, { useState, useEffect } from 'react';
import { 
  TextField, 
  Button, 
  Typography, 
  Box,
  Alert,
  Collapse,
  CircularProgress
} from '@mui/material';
import { Email, CheckCircle, AccessTime, Refresh } from '@mui/icons-material';

const EmailVerification = ({
  email,
  onVerify,
  onResend,
  onEmailSubmit,
  initialStep = 'email', // 'email' or 'code'
  title,
  description,
  submitLabel = 'Send Verification Code',
  verifyLabel = 'Verify Code',
  resendLabel = 'Resend Code',
  successMessage = 'A verification code has been sent to your email',
  helperText = "We'll send you a verification code",
  codeExpiryHelper = "Check your spam folder if you don't see the email. The code expires in 10 minutes.",
  showEmailDisplay = true,
  icon = <Email />
}) => {
  const [code, setCode] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [submitSuccess, setSubmitSuccess] = useState('');
  const [resendTimer, setResendTimer] = useState(120);
  const [canResend, setCanResend] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [currentStep, setCurrentStep] = useState(initialStep);

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

  const handleSubmitEmail = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError('');
    setSubmitSuccess('');

    try {
      await onEmailSubmit();
      setSubmitSuccess(successMessage);
      setCurrentStep('code');
      setResendTimer(120);
      setCanResend(false);
    } catch (error) {
      setSubmitError(error.message || 'An error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    
    if (code.length !== 6) {
      setSubmitError('Please enter a 6-digit code');
      return;
    }

    setIsVerifying(true);
    setSubmitError('');
    setSubmitSuccess('');

    try {
      await onVerify(code);
      setIsVerified(true);
    } catch (error) {
      setSubmitError(error.message || 'An error occurred during verification. Please try again.');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResend = async () => {
    if (!canResend) return;

    setIsResending(true);
    setSubmitError('');
    setSubmitSuccess('');

    try {
      await onResend();
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

  return (
    <>
      {/* Header */}
      <Box sx={{ textAlign: 'center', mb: { xs: 3, sm: 4 }, mt: 2 }}>
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          mb: 2,
          '& .MuiSvgIcon-root': {
            fontSize: '4rem',
            color: 'primary.main'
          }
        }}>
          {icon}
        </Box>
        <Typography 
          variant="h3" 
          component="h1" 
          sx={{ 
            fontWeight: 700,
            mb: 1,
            background: 'linear-gradient(45deg, primary.main, secondary.main)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            fontSize: { xs: '1.8rem', sm: '2.2rem', md: '2.5rem' }
          }}
        >
          {title}
        </Typography>
        <Typography 
          variant="subtitle1" 
          sx={{ 
            color: 'text.secondary',
            fontSize: { xs: '0.9rem', sm: '1rem' },
            mb: 2
          }}
        >
          {currentStep === 'code' ? description : helperText}
        </Typography>
        {currentStep === 'code' && showEmailDisplay && (
          <Typography 
            variant="body1" 
            sx={{ 
              color: 'primary.main',
              fontWeight: 600,
              fontSize: { xs: '0.95rem', sm: '1.1rem' }
            }}
          >
            {email}
          </Typography>
        )}
      </Box>

      {/* Verification Form */}
      <Box component="form" onSubmit={currentStep === 'code' ? handleVerify : handleSubmitEmail} noValidate>
        {currentStep === 'code' ? (
          <>
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
                    borderColor: 'divider',
                  },
                  '&:hover fieldset': {
                    borderColor: 'primary.light',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: 'primary.main',
                  },
                },
              }}
            />
          </>
        ) : null}

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
            currentStep === 'code' 
              ? (isVerifying || code.length !== 6 || isVerified)
              : isSubmitting
          }
          sx={{ 
            mb: 3,
            py: 1.5,
            borderRadius: 2,
            fontWeight: 700,
            textTransform: 'none',
            fontSize: '1rem',
            background: 'linear-gradient(45deg, primary.main, secondary.main)',
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
          {isSubmitting ? (
            <>
              <CircularProgress size={20} sx={{ mr: 1, color: 'white' }} />
              Sending...
            </>
          ) : isVerifying ? (
            <>
              <CircularProgress size={20} sx={{ mr: 1, color: 'white' }} />
              Verifying...
            </>
          ) : isVerified ? (
            'Verified!'
          ) : currentStep === 'code' ? (
            verifyLabel
          ) : (
            submitLabel
          )}
        </Button>

        {/* Resend Section */}
        {currentStep === 'code' && !isVerified && (
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
                <AccessTime sx={{ fontSize: '1rem', color: 'text.secondary' }} />
                <Typography variant="body2" color="text.secondary">
                  Resend available in {formatTime(resendTimer)}
                </Typography>
              </Box>
            ) : (
              <Button
                variant="outlined"
                onClick={handleResend}
                disabled={isResending}
                startIcon={isResending ? <CircularProgress size={16} /> : <Refresh />}
                sx={{
                  borderRadius: 2,
                  textTransform: 'none',
                  fontWeight: 600,
                  borderColor: 'primary.main',
                  color: 'primary.main',
                  '&:hover': {
                    backgroundColor: 'primary.main',
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
                {isResending ? 'Sending...' : resendLabel}
              </Button>
            )}
          </Box>
        )}

        {/* Helper Text */}
        <Box sx={{ mt: 3, p: 2, backgroundColor: 'background.default', borderRadius: 2 }}>
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', textAlign: 'center' }}>
            {currentStep === 'code' ? codeExpiryHelper : helperText}
          </Typography>
        </Box>
      </Box>
    </>
  );
};

export default EmailVerification;