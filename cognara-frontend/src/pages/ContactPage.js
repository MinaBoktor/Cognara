// src/pages/ContactPage.js
import React, { useState, useRef, useEffect } from 'react';
import { 
  Container, 
  Paper, 
  TextField, 
  Button, 
  Typography, 
  Box,
  Fade,
  useTheme,
  Grid,
  Divider,
  Stack,
  Link
} from '@mui/material';
import { 
  Phone as PhoneIcon, 
  Email as EmailIcon, 
  LocationOn as LocationIcon,
  Schedule as HoursIcon
} from '@mui/icons-material';
import { 
  FaTwitter,
  FaLinkedin,
  FaYoutube,
  FaFacebook,
  FaInstagram 
} from 'react-icons/fa';
import { Helmet } from 'react-helmet';

const ContactPage = () => {
  const theme = useTheme();
  const [visible, setVisible] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
        }
      },
      {
        threshold: 0.1
      }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => {
      if (containerRef.current) {
        observer.unobserve(containerRef.current);
      }
    };
  }, []);

  const handleSubmit = (event) => {
    event.preventDefault();
    alert('Contact form submission not implemented yet.');
  };

  return (
    <>
      <Helmet>
        <title>Contact Us | Cognara</title>
        <meta name="description" content="Get in touch with Cognara team" />
      </Helmet>
      <Container 
        maxWidth="false" 
        sx={{ 
          py: 5,
          display: 'flex',
          flexDirection: 'column',
          marginTop: '2rem'
        }}
        ref={containerRef}
      >
        <Fade in={visible} timeout={600}>
          <Box>
            <Grid container spacing={4}>
              {/* Left Side - Combined Follow Us and Contact Info */}
              <Grid item xs={12} md={6}>
                <Paper 
                  elevation={0} 
                  sx={{ 
                    p: 4,
                    backgroundColor: theme.palette.background.paper,
                    borderRadius: 3,
                    boxShadow: '0 8px 32px rgba(0,0,0,0.05)',
                    height: '100%'
                  }}
                >
                  {/* Follow Us Section */}
                  <Box sx={{ mb: 4 }}>
                    <Typography variant="h5" sx={{ mb: 3, fontWeight: 600 }}>
                      Follow Us
                    </Typography>
                    
                    <Stack spacing={3}>
                      {[
                        { icon: <FaFacebook size={24} color="#4267B2" />, name: 'Facebook', url: 'https://facebook.com/cognara' },
                        { icon: <FaTwitter size={24} color="#1DA1F2" />, name: 'Twitter', url: 'https://twitter.com/cognara' },
                        { icon: <FaLinkedin size={24} color="#0077B5" />, name: 'LinkedIn', url: 'https://linkedin.com/company/cognara' },
                        { icon: <FaYoutube size={24} color="#FF0000" />, name: 'YouTube', url: 'https://youtube.com/cognara' },
                        { icon: <FaInstagram size={24} color="#E1306C" />, name: 'Instagram', url: 'https://instagram.com/cognara' }
                      ].map((social) => (
                        <Link 
                          key={social.name}
                          href={social.url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            textDecoration: 'none',
                            color: 'text.primary',
                            '&:hover': {
                              color: 'primary.main',
                              transform: 'translateX(5px)',
                              transition: 'all 0.2s ease'
                            }
                          }}
                        >
                          <Box sx={{ mr: 3, display: 'flex', alignItems: 'center' }}>
                            {social.icon}
                          </Box>
                          <Typography variant="body1">
                            {social.name}
                          </Typography>
                        </Link>
                      ))}
                    </Stack>
                  </Box>

                  <Divider sx={{ my: 3 }} />

                  {/* Contact Information Section */}
                  <Box>
                    <Typography variant="h5" sx={{ mb: 3, fontWeight: 600 }}>
                      Contact Information
                    </Typography>
                    
                    <Stack spacing={3}>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <PhoneIcon sx={{ 
                          fontSize: 28, 
                          color: theme.palette.primary.main,
                          mr: 3 
                        }} />
                        <Box>
                          <Typography variant="body2" color="text.secondary">
                            Phone
                          </Typography>
                          <Typography variant="h6">
                            <Link href="tel:+1234567890" color="text.primary" underline="hover">
                              +1 (234) 567-890
                            </Link>
                          </Typography>
                        </Box>
                      </Box>
                      
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <EmailIcon sx={{ 
                          fontSize: 28, 
                          color: theme.palette.primary.main,
                          mr: 3 
                        }} />
                        <Box>
                          <Typography variant="body2" color="text.secondary">
                            Email
                          </Typography>
                          <Typography variant="h6">
                            <Link href="mailto:info@cognara.com" color="text.primary" underline="hover">
                              info@cognara.com
                            </Link>
                          </Typography>
                        </Box>
                      </Box>

                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <LocationIcon sx={{ 
                          fontSize: 28, 
                          color: theme.palette.primary.main,
                          mr: 3 
                        }} />
                        <Box>
                          <Typography variant="body2" color="text.secondary">
                            Address
                          </Typography>
                          <Typography variant="h6">
                            123 Learning Street, San Francisco, CA 94107
                          </Typography>
                        </Box>
                      </Box>

                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <HoursIcon sx={{ 
                          fontSize: 28, 
                          color: theme.palette.primary.main,
                          mr: 3 
                        }} />
                        <Box>
                          <Typography variant="body2" color="text.secondary">
                            Business Hours
                          </Typography>
                          <Typography variant="h6">
                            Mon-Fri: 9am - 5pm
                          </Typography>
                        </Box>
                      </Box>
                    </Stack>
                  </Box>
                </Paper>
              </Grid>

              {/* Right Side - Contact Form (Smaller) */}
              <Grid item xs={12} md={6}>
                <Paper 
                  elevation={0} 
                  sx={{ 
                    p: 4,
                    backgroundColor: theme.palette.background.paper,
                    borderRadius: 3,
                    boxShadow: '0 8px 32px rgba(0,0,0,0.05)',
                    height: '100%'
                  }}
                >
                  <Typography variant="h5" sx={{ mb: 3, fontWeight: 600 }}>
                    Send Us a Message
                  </Typography>
                  
                  <Box 
                    component="form" 
                    onSubmit={handleSubmit} 
                    noValidate
                  >
                    <TextField
                      required
                      fullWidth
                      id="name"
                      label="Your Name"
                      name="name"
                      margin="normal"
                      sx={{
                        mb: 2,
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2,
                          '& fieldset': {
                            borderColor: theme.palette.divider,
                          },
                          '&:hover fieldset': {
                            borderColor: theme.palette.primary.light,
                          },
                          '&.Mui-focused fieldset': {
                            borderColor: theme.palette.primary.main,
                          },
                        },
                      }}
                    />
                    
                    <TextField
                      required
                      fullWidth
                      id="email"
                      label="Your Email"
                      name="email"
                      margin="normal"
                      sx={{
                        mb: 2,
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2,
                          '& fieldset': {
                            borderColor: theme.palette.divider,
                          },
                          '&:hover fieldset': {
                            borderColor: theme.palette.primary.light,
                          },
                          '&.Mui-focused fieldset': {
                            borderColor: theme.palette.primary.main,
                          },
                        },
                      }}
                    />
                    
                    <TextField
                      required
                      fullWidth
                      multiline
                      rows={6}
                      id="message"
                      label="Your Message"
                      name="message"
                      margin="normal"
                      sx={{
                        mb: 2,
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2,
                          '& fieldset': {
                            borderColor: theme.palette.divider,
                          },
                          '&:hover fieldset': {
                            borderColor: theme.palette.primary.light,
                          },
                          '&.Mui-focused fieldset': {
                            borderColor: theme.palette.primary.main,
                          },
                        },
                      }}
                    />

                    <Button
                      type="submit"
                      fullWidth
                      variant="contained"
                      sx={{ 
                        mt: 3,
                        py: 1.5,
                        borderRadius: 2,
                        fontWeight: 700,
                        textTransform: 'none',
                        fontSize: '1rem',
                        background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                        '&:hover': {
                          boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
                        },
                        transition: 'all 0.2s ease'
                      }}
                    >
                      Send Message
                    </Button>
                  </Box>
                </Paper>
              </Grid>
            </Grid>
          </Box>
        </Fade>
      </Container>
    </>
  );
};

export default ContactPage;