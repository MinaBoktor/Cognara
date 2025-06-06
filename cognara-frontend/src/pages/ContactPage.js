import React from 'react';
import { Container, Typography, Box, TextField, Button } from '@mui/material';
import { Helmet } from 'react-helmet';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import axios from 'axios';

const validationSchema = Yup.object().shape({
  name: Yup.string().required('Name is required'),
  email: Yup.string().email('Invalid email').required('Email is required'),
  message: Yup.string().required('Message is required').min(10),
});

const ContactPage = () => {
  const handleSubmit = async (values, { setSubmitting, resetForm, setStatus }) => {
    try {
      await axios.post('/api/contact/', values);
      setStatus({ success: 'Your message has been sent successfully!' });
      resetForm();
    } catch (error) {
      setStatus({ error: error.response?.data?.message || 'Message sending failed' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Container maxWidth="md">
      <Helmet>
        <title>Contact | Cognara</title>
        <meta name="description" content="Get in touch with the Cognara team." />
      </Helmet>
      <Box sx={{ my: 4 }}>
        <Typography variant="h2" component="h1" gutterBottom>
          Contact Us
        </Typography>
        
        <Formik
          initialValues={{
            name: '',
            email: '',
            message: '',
          }}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
        >
          {({ isSubmitting, status }) => (
            <Form>
              <Field
                component={TextField}
                name="name"
                label="Your Name"
                variant="outlined"
                fullWidth
                margin="normal"
              />
              <Field
                component={TextField}
                name="email"
                label="Your Email"
                variant="outlined"
                fullWidth
                margin="normal"
              />
              <Field
                component={TextField}
                name="message"
                label="Your Message"
                variant="outlined"
                fullWidth
                margin="normal"
                multiline
                rows={4}
              />
              
              {status?.error && (
                <Typography color="error" paragraph>
                  {status.error}
                </Typography>
              )}
              
              {status?.success && (
                <Typography color="success" paragraph>
                  {status.success}
                </Typography>
              )}
              
              <Button
                type="submit"
                variant="contained"
                color="primary"
                disabled={isSubmitting}
                sx={{ mt: 2 }}
              >
                Send Message
              </Button>
            </Form>
          )}
        </Formik>
      </Box>
    </Container>
  );
};

export default ContactPage;