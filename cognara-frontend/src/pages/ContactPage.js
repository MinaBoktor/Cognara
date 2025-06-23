// src/pages/ContactPage.js
import React from 'react';
import { Container, Paper, TextField, Button, Typography, Box, Grid } from '@mui/material';
import Layout from '../components/Layout/Layout';

const ContactPage = () => {
  return (
    <Layout>
      <Container maxWidth="md" sx={{ py: 5 }}>
        <Paper sx={{ p: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 700 }}>
            Contact Us
          </Typography>
          <Typography variant="body1" color="text.secondary" paragraph>
            Have questions or feedback? Fill out the form below to get in touch with our team.
          </Typography>
          <Box component="form" noValidate sx={{ mt: 3 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField required fullWidth id="name" label="Your Name" name="name" />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField required fullWidth id="email" label="Your Email" name="email" />
              </Grid>
              <Grid item xs={12}>
                <TextField required fullWidth multiline rows={6} id="message" label="Your Message" name="message" />
              </Grid>
            </Grid>
            <Button
              type="submit"
              variant="contained"
              sx={{ mt: 3 }}
            >
              Send Message
            </Button>
          </Box>
        </Paper>
      </Container>
    </Layout>
  );
};

export default ContactPage;