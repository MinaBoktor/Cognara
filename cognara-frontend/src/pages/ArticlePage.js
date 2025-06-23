// src/pages/ArticlePage.js

import React, { useState, useEffect } from 'react';
import { useParams, Link as RouterLink } from 'react-router-dom';
import { articlesAPI } from '../services/api';
import ReactMarkdown from 'react-markdown';
import { 
  Container, 
  Typography, 
  Box, 
  CircularProgress, 
  Alert, 
  Divider,
  Chip,
  Button
} from '@mui/material';
import { Helmet } from 'react-helmet';
import Layout from '../components/Layout/Layout';

const ArticlePage = () => {
  const { slug } = useParams();
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchArticle = async () => {
      try {
        setLoading(true);
        const response = await articlesAPI.getBySlug(slug);
        setArticle(response.data);
      } catch (err) {
        setError('Article not found.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchArticle();
  }, [slug]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error || !article) {
    return (
        <Layout>
            <Container sx={{ textAlign: 'center', py: 5}}>
                <Typography variant="h4" gutterBottom>Article Not Found</Typography>
                <Alert severity="error">We couldn't find the article you were looking for.</Alert>
                <Button component={RouterLink} to="/" variant="contained" sx={{ mt: 3 }}>
                    Back to Home
                </Button>
            </Container>
      </Layout>
    );
  }

  return (
    <Layout>
      <Helmet>
        <title>{article.title} | Cognara</title>
        <meta name="description" content={article.summary} />
      </Helmet>
      <Container maxWidth="md" sx={{ py: 5 }}>
        <Typography 
          variant="h3" 
          component="h1" 
          sx={{ fontWeight: 'bold', mb: 2 }}
        >
          {article.title}
        </Typography>
        <Typography 
          variant="subtitle1" 
          color="text.secondary" 
          sx={{ mb: 3 }}
        >
          By {article.author} on {new Date(article.created_at).toLocaleDateString()}
        </Typography>
        
        <Divider sx={{ mb: 4 }} />

        <Box className="markdown-content">
          <ReactMarkdown>{article.content}</ReactMarkdown>
        </Box>
      </Container>
    </Layout>
  );
};

export default ArticlePage;