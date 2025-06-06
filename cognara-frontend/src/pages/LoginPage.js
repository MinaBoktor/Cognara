import React from 'react';
import { Container, Typography, Box } from '@mui/material';
import { Formik, Form, Field } from 'formik';
import { TextField } from 'formik-mui';
import * as Yup from 'yup';
import Button from '@mui/material/Button';
import { Helmet } from 'react-helmet';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const validationSchema = Yup.object().shape({
  email: Yup.string().email('Invalid email').required('Email is required'),
  password: Yup.string().required('Password is required'),
});

const LoginPage = () => {
  const navigate = useNavigate();

  const handleSubmit = async (values, { setSubmitting, setStatus }) => {
    try {
      const response = await axios.post('/api/auth/login/', values);
      localStorage.setItem('token', response.data.token);
      navigate('/admin');
    } catch (error) {
      setStatus({ error: error.response?.data?.message || 'Login failed' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Container maxWidth="sm">
      <Helmet>
        <title>Login | Cognara</title>
      </Helmet>
      <Box sx={{ my: 8, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Typography variant="h3" component="h1" gutterBottom>
          Admin Login
        </Typography>
        
        <Formik
          initialValues={{
            email: '',
            password: '',
          }}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
        >
          {({ isSubmitting, status }) => (
            <Form>
              <Field
                component={TextField}
                name="email"
                label="Email"
                variant="outlined"
                fullWidth
                margin="normal"
              />
              <Field
                component={TextField}
                name="password"
                label="Password"
                type="password"
                variant="outlined"
                fullWidth
                margin="normal"
              />
              
              {status?.error && (
                <Typography color="error" paragraph>
                  {status.error}
                </Typography>
              )}
              
              <Button
                type="submit"
                variant="contained"
                color="primary"
                disabled={isSubmitting}
                fullWidth
                sx={{ mt: 3, mb: 2 }}
              >
                Login
              </Button>
            </Form>
          )}
        </Formik>
      </Box>
    </Container>
  );
};

export default LoginPage;