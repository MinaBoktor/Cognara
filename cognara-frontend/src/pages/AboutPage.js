import React from 'react';
import { Container, Typography, Box } from '@mui/material';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import { Button } from '@mui/material';

const AboutPage = () => {
  return (
    <Container maxWidth="md" sx={{ py: 10 }}>
      <Helmet>
        <title>About | Cognara</title>
        <meta name="description" content="Learn more about Cognara and our mission." />
      </Helmet>
      
      <Box sx={{ textAlign: 'center', mb: 8 }}>
        <Typography variant="h2" component="h1" gutterBottom sx={{ 
          fontWeight: 700,
          letterSpacing: 1
        }}>
          About Cognara
        </Typography>
        <Typography variant="h6" component="p" color="text.secondary" sx={{ 
          maxWidth: '700px',
          mx: 'auto'
        }}>
          A platform dedicated to intellectual growth and knowledge sharing
        </Typography>
      </Box>
      
      <Box sx={{ 
        display: 'grid',
        gridTemplateColumns: { md: 'repeat(2, 1fr)' },
        gap: 6,
        mb: 8
      }}>
        <Box>
          <Typography variant="h4" component="h2" gutterBottom sx={{ 
            fontWeight: 600,
            mb: 3
          }}>
            Our Mission
          </Typography>
          <Typography variant="body1" paragraph sx={{ 
            color: 'text.secondary',
            lineHeight: 1.8
          }}>
            Cognara is a platform dedicated to sharing knowledge and fostering intellectual growth. 
            We believe in the power of ideas to transform lives and societies.
          </Typography>
        </Box>
        
        <Box>
          <Typography variant="h4" component="h2" gutterBottom sx={{ 
            fontWeight: 600,
            mb: 3
          }}>
            Our Community
          </Typography>
          <Typography variant="body1" paragraph sx={{ 
            color: 'text.secondary',
            lineHeight: 1.8
          }}>
            Our mission is to create a space where thinkers, writers, and curious minds can come 
            together to explore, discuss, and share insights across various disciplines.
          </Typography>
        </Box>
      </Box>
      
      <Box sx={{ 
        backgroundColor: 'rgba(0, 0, 0, 0.02)',
        p: 6,
        borderRadius: 2,
        textAlign: 'center'
      }}>
        <Typography variant="h5" component="p" sx={{ 
          mb: 3,
          fontWeight: 500
        }}>
          Whether you're an expert in your field or just beginning your learning journey, 
          Cognara welcomes you to contribute and engage with our community.
        </Typography>
        <Button 
          variant="contained" 
          color="primary" 
          size="large"
          component={Link}
          to="/submit-article"
          sx={{
            px: 6,
            py: 2
          }}
        >
          Join Our Community
        </Button>
      </Box>
    </Container>
  );
};

export default AboutPage;