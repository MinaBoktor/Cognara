// src/pages/SignUpPage.js
import React from 'react';
import { Container, Paper, TextField, Button, Typography, Box, Grid } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import Layout from '../components/Layout/Layout';

const SignUpPage = () => {
  const handleSubmit = (event) => {
    event.preventDefault();
    // TODO: Implement actual sign-up logic
    alert('Sign-up functionality not implemented yet.');
  };

  return (
    <Layout>
      <Container component="main" maxWidth="xs" sx={{ mt: 8 }}>
        <Paper elevation={3} sx={{ padding: 4, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <Typography component="h1" variant="h5">
            Sign up
          </Typography>
          <Box component="form" noValidate onSubmit={handleSubmit} sx={{ mt: 3 }}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  autoComplete="name"
                  name="name"
                  required
                  fullWidth
                  id="name"
                  label="Full Name"
                  autoFocus
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  required
                  fullWidth
                  id="email"
                  label="Email Address"
                  name="email"
                  autoComplete="email"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  required
                  fullWidth
                  name="password"
                  label="Password"
                  type="password"
                  id="password"
                  autoComplete="new-password"
                />
              </Grid>
            </Grid>
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
            >
              Sign Up
            </Button>
            <Box textAlign="center">
                <RouterLink to="/login" variant="body2">
                    Already have an account? Sign in
                </RouterLink>
            </Box>
          </Box>
        </Paper>
      </Container>
    </Layout>
  );
};

export default SignUpPage;