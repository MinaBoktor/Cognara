import React, { useEffect, useState } from 'react';
import { Container, Grid, Typography, Box, useTheme } from '@mui/material';
import { Helmet } from 'react-helmet';
import ArticleCard from '../components/Article/ArticleCard';
import { articlesAPI } from '../services/api';

const HomePage = () => {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const theme = useTheme();

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        const response = await articlesAPI.getAll();
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
    <Box sx={{ backgroundColor: theme.palette.background.default }}>
      <Helmet>
        <title>Cognara - Home</title>
      </Helmet>

      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Typography 
          variant="h3" 
          component="h2" 
          gutterBottom 
          sx={{ 
            fontWeight: 700,
            mb: 6,
            textAlign: 'center',
            color: theme.palette.text.primary,
            position: 'relative',
            '&:after': {
              content: '""',
              display: 'block',
              width: '80px',
              height: '4px',
              backgroundColor: theme.palette.primary.main,
              margin: '16px auto 0',
              borderRadius: '2px'
            }
          }}
        >
          Latest Articles
        </Typography>

        {loading ? (
          <Typography 
            variant="h6" 
            sx={{ 
              textAlign: 'center',
              color: theme.palette.text.secondary,
              py: 4
            }}
          >
            Loading articles...
          </Typography>
        ) : (
          <Grid container spacing={4} justifyContent="center">
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