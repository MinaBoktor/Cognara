// src/pages/NewsletterPage.js
import React, { useState, useEffect, useRef } from 'react';
import { 
  Container, 
  Typography, 
  Box, 
  Fade, 
  Button, 
  Paper,
  useTheme,
  Grid,
  TextField,
  Alert,
  Collapse,
  Divider,
  Stack,
  Card,
  CardContent,
  Avatar,
  CircularProgress,
  IconButton
} from '@mui/material';
import { Helmet } from 'react-helmet';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import EmailIcon from '@mui/icons-material/Email';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import PeopleIcon from '@mui/icons-material/People';
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import ConnectWithoutContactIcon from '@mui/icons-material/ConnectWithoutContact';
import AutoStoriesIcon from '@mui/icons-material/AutoStories';
import SchoolIcon from '@mui/icons-material/School';
import SecurityIcon from '@mui/icons-material/Security';
import { newsletterAPI } from '../services/api';

const Newsletter = () => {
  const theme = useTheme();
  const [visibleSections, setVisibleSections] = useState({
    hero: false,
    stats: true,
    benefits: false,
    features: false,
    testimonials: false
  });

  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState({ 
    status: false, 
    message: '',
    timer: null 
  });
  const [submitError, setSubmitError] = useState('');
  const [apiResponse, setApiResponse] = useState(null);

  useEffect(() => {
      return () => {
        // Clean up timer when component unmounts
        if (submitSuccess.timer) {
          clearTimeout(submitSuccess.timer);
        }
      };
    }, [submitSuccess.timer]);

  const sectionRefs = {
    hero: useRef(null),
    stats: useRef(null),
    benefits: useRef(null),
    features: useRef(null),
    testimonials: useRef(null)
  };

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          setVisibleSections(prev => ({
            ...prev,
            [entry.target.dataset.section]: entry.isIntersecting
          }));
        });
      },
      {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
      }
    );

    Object.keys(sectionRefs).forEach(key => {
      if (sectionRefs[key].current) {
        sectionRefs[key].current.dataset.section = key;
        observer.observe(sectionRefs[key].current);
      }
    });

    return () => {
      Object.keys(sectionRefs).forEach(key => {
        if (sectionRefs[key].current) {
          observer.unobserve(sectionRefs[key].current);
        }
      });
    };
  }, []);

  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) {
      return 'Email is required';
    }
    if (!re.test(email)) {
      return 'Please enter a valid email address';
    }
    return '';
  };

  const handleSubmit = async (event) => {
      event.preventDefault();
      
      // Clear any existing timers
      if (submitSuccess.timer) {
        clearTimeout(submitSuccess.timer);
      }
      
      setSubmitError('');
      setSubmitSuccess({ status: false, message: '', timer: null });

      const emailValidation = validateEmail(email);
      if (emailValidation) {
        setEmailError(emailValidation);
        return;
      }

      setIsSubmitting(true);

      try {
        const response = await newsletterAPI.subscribe({
          email: email.trim()
        });

        const timer = setTimeout(() => {
          setSubmitSuccess(prev => ({ ...prev, status: false }));
        }, 5000);

        if (response.data.status === "success") {
          setSubmitSuccess({
            status: true,
            message: "🎉 Thank you for subscribing!",
            timer
          });
        } else {
          setSubmitSuccess({
            status: true,
            message: "🎉 You're already subscribed!",
            timer
          });
        }
        setEmail('');
        setEmailError('');
      } catch (error) {
        console.error('Subscription error:', error);
        setSubmitError(error.response?.data?.error || 'An error occurred. Please try again.');
      } finally {
        setIsSubmitting(false);
      }
    };

  const features = [
    {
      icon: <LightbulbIcon sx={{ fontSize: 50, color: theme.palette.primary.main }} />,
      title: "Expert Insights",
      description: "Curated content from industry leaders, researchers, and thought leaders in your field of interest."
    },
    {
      icon: <TrendingUpIcon sx={{ fontSize: 50, color: theme.palette.secondary.main }} />,
      title: "Latest Trends",
      description: "Stay ahead of the curve with early access to emerging trends and breakthrough discoveries."
    },
    {
      icon: <PeopleIcon sx={{ fontSize: 50, color: "#82D8FF" }} />,
      title: "Community Highlights",
      description: "Discover the most engaging discussions, popular topics, and standout contributions from our community."
    },
    {
      icon: <CalendarTodayIcon sx={{ fontSize: 50, color: theme.palette.success.main }} />,
      title: "Weekly Schedule",
      description: "Never miss important events, webinars, and discussion sessions with our curated weekly calendar."
    }
  ];

  const testimonials = [
    {
      name: "Dr. Maria Santos",
      role: "Research Scientist",
      content: "The Cognara newsletter has become my go-to source for staying informed about the latest developments in my field. The insights are always valuable and actionable.",
      avatar: "MS"
    },
    {
      name: "Alex Thompson",
      role: "Product Manager",
      content: "I love how the newsletter connects different disciplines. It's helped me think more creatively about problem-solving in my work.",
      avatar: "AT"
    },
    {
      name: "Sarah Kim",
      role: "Graduate Student",
      content: "The community highlights section has introduced me to so many brilliant minds. It's like having a personal curator for quality content.",
      avatar: "SK"
    }
  ];

  const stats = [
    { value: "25K+", label: "Subscribers" },
    { value: "98%", label: "Open Rate" },
    { value: "4.9/5", label: "Rating" },
    { value: "Weekly", label: "Delivery" }
  ];

  const benefits = [
    {
      icon: <AccessTimeIcon sx={{ fontSize: 30, color: theme.palette.primary.main }} />,
      title: "Save 5+ Hours Weekly",
      description: "Curated content eliminates the need for endless research"
    },
    {
      icon: <TrendingUpIcon sx={{ fontSize: 30, color: theme.palette.secondary.main }} />,
      title: "Stay Ahead of Trends",
      description: "Be the first to know about emerging topics and discussions"
    },
    {
      icon: <ConnectWithoutContactIcon sx={{ fontSize: 30, color: "#82D8FF" }} />,
      title: "Connect with Experts",
      description: "Network with like-minded learners and industry leaders"
    },
    {
      icon: <AutoStoriesIcon sx={{ fontSize: 30, color: theme.palette.success.main }} />,
      title: "Exclusive Resources",
      description: "Access premium materials and insider knowledge"
    },
    {
      icon: <SchoolIcon sx={{ fontSize: 30, color: theme.palette.warning.main }} />,
      title: "Diverse Perspectives",
      description: "Learn from multiple disciplines and viewpoints"
    },
    {
      icon: <SecurityIcon sx={{ fontSize: 30, color: theme.palette.info.main }} />,
      title: "Privacy First",
      description: "Your data is secure, no spam, unsubscribe anytime"
    }
  ];

  return (
    <Container maxWidth={false} sx={{ py: 4 }}>
      <Helmet>
        <title>Newsletter | Cognara - Stay Updated with Expert Insights</title>
        <meta name="description" content="Subscribe to Cognara's weekly newsletter for expert insights, latest trends, and community highlights." />
      </Helmet>

      {/* Hero Section with Subscription Form */}
      <div ref={sectionRefs.hero}>
        <Fade in={visibleSections.hero} timeout={600}>
          <Box sx={{ 
            textAlign: 'center', 
            mb: 6,
            pt: { xs: 4, md: 6 },
            pb: { xs: 4, md: 6 }
          }}>
            <Typography 
              variant="h2" 
              component="h1" 
              sx={{ 
                fontWeight: 700,
                mb: 2,
                background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                fontSize: { xs: '2.5rem', md: '3.5rem' }
              }}
            >
              Stay In The Know
            </Typography>
            <Typography 
              variant="h5" 
              component="p" 
              sx={{ 
                maxWidth: '800px',
                mx: 'auto',
                color: theme.palette.text.secondary,
                mb: 4,
                fontSize: { xs: '1.1rem', md: '1.5rem' }
              }}
            >
              Get weekly insights, trending discussions, and expert perspectives delivered straight to your inbox
            </Typography>

            {/* Improved Subscription Form */}
            <Paper 
              elevation={8}
              sx={{ 
                p: { xs: 4, md: 6 },
                maxWidth: '700px',
                mx: 'auto',
                background: `linear-gradient(135deg, ${theme.palette.background.paper} 0%, ${theme.palette.background.default} 100%)`,
                borderRadius: 4,
                border: `2px solid ${theme.palette.primary.main}`,
                mb: 4,
                position: 'relative',
                overflow: 'hidden',
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  height: '4px',
                  background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main}, ${theme.palette.primary.main})`,
                  backgroundSize: '200% 100%',
                  animation: 'gradient 3s ease infinite'
                }
              }}
            >
              <Box component="form" onSubmit={handleSubmit} noValidate>
                <Typography 
                  variant="h6" 
                  sx={{ 
                    mb: 3,
                    fontWeight: 700,
                    color: theme.palette.text.primary,
                    fontSize: { xs: '1.1rem', md: '1.3rem' }
                  }}
                >
                  🚀 Join 25,000+ Learning Enthusiasts
                </Typography>

                <Box sx={{ 
                  display: 'flex', 
                  flexDirection: { xs: 'column', md: 'row' },
                  gap: 2,
                  alignItems: 'stretch',
                  mb: 3
                }}>
                  <TextField
                    fullWidth
                    id="email"
                    label="Enter your email address"
                    name="email"
                    type="email"
                    autoComplete="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setEmailError('');
                      setSubmitError('');
                    }}
                    error={!!emailError}
                    helperText={emailError}
                    disabled={isSubmitting}
                    sx={{
                      flex: 1,
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 3,
                        backgroundColor: theme.palette.background.paper,
                        '& fieldset': {
                          borderColor: theme.palette.divider,
                          borderWidth: '2px'
                        },
                        '&:hover fieldset': {
                          borderColor: theme.palette.primary.light,
                        },
                        '&.Mui-focused fieldset': {
                          borderColor: theme.palette.primary.main,
                        },
                      },
                      '& .MuiInputLabel-root': {
                        fontWeight: 500
                      }
                    }}
                  />
                  <Button
                    type="submit"
                    variant="contained"
                    size="large"
                    disabled={isSubmitting}
                    startIcon={isSubmitting ? <CircularProgress size={20} /> : <EmailIcon />}
                    sx={{ 
                      px: 4,
                      py: 2,
                      borderRadius: 3,
                      fontWeight: 700,
                      textTransform: 'none',
                      fontSize: '1.1rem',
                      minWidth: { xs: '100%', md: '180px' },
                      background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                      boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
                      '&:hover': {
                        boxShadow: '0 8px 25px rgba(0,0,0,0.3)',
                        transform: 'translateY(-2px)'
                      },
                      '&:disabled': {
                        opacity: 0.7
                      },
                      transition: 'all 0.3s ease'
                    }}
                  >
                    {isSubmitting ? 'Subscribing...' : 'Subscribe Free'}
                  </Button>
                </Box>

                {/* Success/Error Messages */}
                <Collapse in={submitSuccess.status || !!submitError}>
                  <Alert 
                    severity={submitSuccess.status ? 'success' : 'error'}
                    onClose={() => {
                      if (submitSuccess.status) {
                        setSubmitSuccess({ status: false, message: '', timer: null });
                      } else {
                        setSubmitError('');
                      }
                    }}
                    sx={{ mb: 2, borderRadius: 2 }}
                  >
                    {submitSuccess.status ? submitSuccess.message : submitError}
                  </Alert>
                </Collapse>

                <Typography 
                  variant="body2" 
                  sx={{ 
                    color: theme.palette.text.secondary,
                    fontSize: '0.9rem',
                    fontWeight: 500
                  }}
                >
                  ✨ Free forever • 📧 Weekly delivery • 🚫 No spam • 📱 Unsubscribe anytime
                </Typography>
              </Box>
            </Paper>
          </Box>
        </Fade>
      </div>
    </Container>
  );
};

export default Newsletter;