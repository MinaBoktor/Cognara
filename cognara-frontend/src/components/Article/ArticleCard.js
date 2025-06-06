import React from 'react';
import { Card, CardMedia, CardContent, Typography, Button, Box } from '@mui/material';
import { Link } from 'react-router-dom';

const ArticleCard = ({ article }) => {
  return (
    <Card sx={{ 
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      transition: 'transform 0.3s ease, box-shadow 0.3s ease',
      '&:hover': {
        transform: 'translateY(-5px)',
        boxShadow: '0 10px 20px rgba(0, 0, 0, 0.1)'
      }
    }}>
      {article.featured_image && (
        <CardMedia
          component="img"
          height="200"
          image={article.featured_image}
          alt={article.title}
          sx={{
            objectFit: 'cover'
          }}
        />
      )}
      <CardContent sx={{ flexGrow: 1 }}>
        <Typography variant="overline" color="text.secondary">
          {article.tags.join(', ')}
        </Typography>
        <Typography variant="h5" component="h3" gutterBottom sx={{ 
          fontWeight: 600,
          mt: 1
        }}>
          {article.title}
        </Typography>
        <Typography variant="body1" paragraph sx={{ 
          mb: 2,
          color: 'text.secondary'
        }}>
          {article.excerpt}
        </Typography>
      </CardContent>
      <Box sx={{ p: 2 }}>
        <Button 
          component={Link}
          to={`/article/${article.slug}`}
          size="small"
          sx={{
            textTransform: 'none',
            fontWeight: 500
          }}
        >
          Read More
        </Button>
      </Box>
    </Card>
  );
};

export default ArticleCard;