import React, { useState } from 'react';
import { Box, Typography, TextField, Button, Snackbar, Alert, Paper, Container } from '@mui/material';
import axios from 'axios';

const NewsletterSignup = () => {
  const [email, setEmail] = useState('');
  const [open, setOpen] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/newsletter/subscribe/', { email });
      setSuccess(true);
      setEmail('');
      setOpen(true);
    } catch (err) {
      setError(err.response?.data?.error || 'Subscription failed');
      setOpen(true);
    }
  };

  const handleClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setOpen(false);
  };

    return (
    <Box sx={{ 
      py: 12, // More vertical padding
      backgroundColor: 'background.default', // Darker background
      color: 'white',
      position: 'relative',
      overflow: 'hidden',
      '&:before': {
        content: '""',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: '4px',
        background: 'linear-gradient(90deg, #ff8a00, #e52e71)'
      }
    }}>
      <Container maxWidth="md">
        <Box sx={{ 
          textAlign: 'center',
          maxWidth: '600px',
          mx: 'auto',
          position: 'relative',
          zIndex: 1
        }}>
          <Typography 
            variant="h3" 
            component="h3" 
            gutterBottom 
            sx={{ 
              fontWeight: 700,
              mb: 3,
              fontFamily: "'Playfair Display', serif"
            }}
          >
            Stay Updated with Cognara
          </Typography>
          <Typography 
            variant="body1" 
            paragraph 
            sx={{ 
              mb: 4,
              opacity: 0.9,
              fontSize: '1.1rem'
            }}
          >
            Subscribe to our newsletter to receive the latest articles and updates directly in your inbox.
          </Typography>
          <Box 
            component="form" 
            onSubmit={handleSubmit} 
            sx={{ 
              display: 'flex',
              gap: 2,
              flexDirection: { xs: 'column', sm: 'row' },
              alignItems: 'center'
            }}
          >
            <TextField
              variant="outlined"
              placeholder="Your email address"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              sx={{
                flexGrow: 1,
                backgroundColor: 'white',
                borderRadius: 1,
                '& .MuiOutlinedInput-root': {
                  '& fieldset': {
                    borderColor: 'transparent',
                  },
                  '&:hover fieldset': {
                    borderColor: 'primary.light',
                  },
                },
                '& .MuiInputBase-input': {
                  py: 2
                }
              }}
            />
            <Button
              type="submit"
              variant="contained"
              color="secondary"
              size="large"
              sx={{ 
                px: 5,
                py: 2,
                fontWeight: 600,
                fontSize: '1rem',
                borderRadius: 1,
                boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: '0 6px 8px rgba(0, 0, 0, 0.15)'
                }
              }}
            >
              Subscribe
            </Button>
          </Box>
          <Typography variant="caption" sx={{ 
            mt: 3,
            display: 'block',
            opacity: 0.7,
            fontSize: '0.85rem'
          }}>
            We respect your privacy. Unsubscribe at any time.
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

export default NewsletterSignup;