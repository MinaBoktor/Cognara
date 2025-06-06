import React, { useEffect, useState } from 'react';
import { Container, Grid, Typography, Box, Button } from '@mui/material';
import { Helmet } from 'react-helmet';
import HeroSection from '../components/HeroSection';
import { Link } from 'react-router-dom';
import ArticleCard from '../components/Article/ArticleCard';
import axios from 'axios';

const HomePage = ({ showHero = true }) => {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        const response = await axios.get('/api/articles/');
        setArticles(response.data);
      } catch (error) {
        console.error('Error fetching articles:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchArticles();
  }, []);

  return (
        <Box>
        <Helmet>
            <title>Cognara - Home</title>
            <meta name="description" content="Welcome to Cognara, a platform for sharing knowledge and insights." />
        </Helmet>

        {/* Articles Section */}
        <Container maxWidth="lg" sx={{ py: 8 }}>
            <Typography variant="h3" component="h2" gutterBottom sx={{ 
            fontWeight: 600,
            mb: 6,
            textAlign: 'center'
            }}>
            Latest Articles
            </Typography>
            
            {loading ? (
            <Typography>Loading articles...</Typography>
            ) : (
            <Grid container spacing={6}>
                {articles.map((article) => (
                <Grid item key={article.id} xs={12} sm={6} md={4}>
                    <ArticleCard article={article} />
                </Grid>
                ))}
            </Grid>
            )}
        </Container>
        </Box>
  );
};

export default HomePage;