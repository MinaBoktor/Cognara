import React, { useState } from 'react';
import { Box, Typography, TextField, Button, Snackbar, Alert, Container } from '@mui/material';
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
      py: 10,
      backgroundColor: 'primary.main',
      color: 'white'
    }}>
      <Container maxWidth="md">
        <Box sx={{ 
          textAlign: 'center',
          maxWidth: '600px',
          mx: 'auto'
        }}>
          <Typography variant="h4" component="h3" gutterBottom sx={{ 
            fontWeight: 600,
            mb: 2
          }}>
            Stay Updated with Cognara
          </Typography>
          <Typography variant="body1" paragraph sx={{ 
            mb: 4,
            opacity: 0.8
          }}>
            Subscribe to our newsletter to receive the latest articles and updates directly in your inbox.
          </Typography>
          <Box 
            component="form" 
            onSubmit={handleSubmit} 
            sx={{ 
              display: 'flex',
              gap: 2,
              flexDirection: { xs: 'column', sm: 'row' }
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
                },
              }}
            />
            <Button
              type="submit"
              variant="contained"
              color="secondary"
              size="large"
              sx={{ 
                px: 4,
                py: 2
              }}
            >
              Subscribe
            </Button>
          </Box>
          <Typography variant="caption" sx={{ 
            mt: 2,
            display: 'block',
            opacity: 0.6
          }}>
            We respect your privacy. Unsubscribe at any time.
          </Typography>
        </Box>
        <Snackbar open={open} autoHideDuration={6000} onClose={handleClose}>
          <Alert onClose={handleClose} severity={success ? 'success' : 'error'} sx={{ width: '100%' }}>
            {success ? 'Thank you for subscribing!' : error}
          </Alert>
        </Snackbar>
      </Container>
    </Box>
  );
};

export default NewsletterSignup;