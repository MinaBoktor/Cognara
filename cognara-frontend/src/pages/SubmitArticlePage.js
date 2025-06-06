import React from 'react';
import { Container, Typography, Box, Alert } from '@mui/material';
import { Formik, Form, Field } from 'formik';
import { TextField } from 'formik-mui';
import * as Yup from 'yup';
import Button from '@mui/material/Button';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';

const validationSchema = Yup.object().shape({
  title: Yup.string()
    .required('Title is required')
    .max(100, 'Title must be at most 100 characters'),
  content: Yup.string()
    .required('Content is required')
    .min(500, 'Content must be at least 500 characters'),
  excerpt: Yup.string()
    .required('Excerpt is required')
    .max(200, 'Excerpt must be at most 200 characters'),
  tags: Yup.string(),
  author_name: Yup.string().required('Your name is required'),
  author_email: Yup.string()
    .email('Invalid email')
    .required('Email is required'),
});

const SubmitArticlePage = () => {
  const navigate = useNavigate();

  const handleSubmit = async (values, { setSubmitting, setStatus }) => {
    try {
      const response = await axios.post('/api/articles/submit/', values);
      if (response.status === 200) {
        navigate('/submission-success', { state: { article: response.data } });
      }
    } catch (error) {
      setStatus({
        error: error.response?.data?.message || 'Submission failed. Please try again.',
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Container maxWidth="md">
      <Helmet>
        <title>Submit Article | Cognara</title>
        <meta 
          name="description" 
          content="Submit your article to Cognara for review and potential publication." 
        />
      </Helmet>
      
      <Box sx={{ my: 4 }}>
        <Typography variant="h3" component="h1" gutterBottom>
          Submit an Article
        </Typography>
        <Typography variant="body1" paragraph>
          Share your knowledge with the Cognara community. Our editorial team will review your submission and get back to you.
        </Typography>
        
        <Formik
          initialValues={{
            title: '',
            content: '',
            excerpt: '',
            tags: '',
            author_name: '',
            author_email: '',
          }}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
        >
          {({ isSubmitting, status }) => (
            <Form>
              <Field
                component={TextField}
                name="title"
                label="Article Title"
                variant="outlined"
                fullWidth
                margin="normal"
                required
              />
              
              <Field
                component={TextField}
                name="excerpt"
                label="Short Excerpt (Max 200 characters)"
                variant="outlined"
                fullWidth
                margin="normal"
                multiline
                rows={3}
                required
              />
              
              <Field
                component={TextField}
                name="content"
                label="Article Content (Min 500 characters, Markdown supported)"
                variant="outlined"
                fullWidth
                margin="normal"
                multiline
                rows={10}
                required
              />
              
              <Field
                component={TextField}
                name="tags"
                label="Tags (comma separated)"
                variant="outlined"
                fullWidth
                margin="normal"
                helperText="e.g., technology, science, business"
              />
              
              <Field
                component={TextField}
                name="author_name"
                label="Your Name"
                variant="outlined"
                fullWidth
                margin="normal"
                required
              />
              
              <Field
                component={TextField}
                name="author_email"
                label="Your Email"
                variant="outlined"
                fullWidth
                margin="normal"
                required
              />
              
              {status?.error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {status.error}
                </Alert>
              )}
              
              <Button
                type="submit"
                variant="contained"
                color="primary"
                disabled={isSubmitting}
                sx={{ mt: 2 }}
                size="large"
              >
                {isSubmitting ? 'Submitting...' : 'Submit Article'}
              </Button>
            </Form>
          )}
        </Formik>
      </Box>
    </Container>
  );
};

export default SubmitArticlePage;