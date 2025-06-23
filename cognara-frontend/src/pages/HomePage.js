// HomePage.js - Remove HeroSection import and usage
import React, { useEffect, useState } from 'react';
import { Container, Grid, Typography, Box } from '@mui/material';
import { Helmet } from 'react-helmet';
import ArticleCard from '../components/Article/ArticleCard';
import { articlesAPI } from '../services/api';

const HomePage = () => {  // Remove showHero prop
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        const response = await articlesAPI.getApproved();
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