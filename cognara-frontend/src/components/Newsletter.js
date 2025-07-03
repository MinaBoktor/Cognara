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

      {/* Stats Section - Now visible on page load */}
      <div ref={sectionRefs.stats}>
        <Fade in={visibleSections.stats} timeout={600}>
          <Box sx={{ 
            backgroundColor: theme.palette.background.paper,
            borderRadius: 4,
            p: { xs: 4, md: 6 },
            mb: 8,
            textAlign: 'center',
            boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
          }}>
            <Typography variant="h4" component="h2" sx={{ 
              fontWeight: 700,
              mb: 4,
              color: theme.palette.text.primary
            }}>
              Trusted by Learning Enthusiasts Worldwide
            </Typography>
            <Grid container spacing={4} justifyContent="center">
              {stats.map((stat, index) => (
                <Grid item xs={6} sm={3} key={index}>
                  <Box sx={{ 
                    textAlign: 'center',
                    p: 2,
                    borderRadius: 2,
                    backgroundColor: theme.palette.background.default,
                    transition: 'transform 0.3s ease',
                    '&:hover': {
                      transform: 'scale(1.05)'
                    }
                  }}>
                    <Typography 
                      variant="h3" 
                      sx={{ 
                        fontWeight: 900,
                        color: theme.palette.primary.main,
                        mb: 1,
                        fontSize: { xs: '2rem', md: '3rem' }
                      }}
                    >
                      {stat.value}
                    </Typography>
                    <Typography 
                      variant="body1" 
                      sx={{ 
                        color: theme.palette.text.secondary,
                        fontWeight: 600,
                        fontSize: { xs: '0.9rem', md: '1rem' }
                      }}
                    >
                      {stat.label}
                    </Typography>
                  </Box>
                </Grid>
              ))}
            </Grid>
          </Box>
        </Fade>
      </div>

      {/* Features Section - More Centered */}
      <div ref={sectionRefs.features}>
        <Fade in={visibleSections.features} timeout={600}>
          <Box sx={{ mb: 8, textAlign: 'center' }}>
            <Typography variant="h4" component="h2" sx={{ 
              fontWeight: 700,
              mb: 2,
              color: theme.palette.text.primary
            }}>
              What You'll Get Every Week
            </Typography>
            <Typography variant="body1" sx={{ 
              color: theme.palette.text.secondary,
              mb: 6,
              maxWidth: '600px',
              mx: 'auto'
            }}>
              Carefully curated content designed to keep you informed and inspired
            </Typography>
            <Grid container spacing={4} justifyContent="center">
              {features.map((feature, index) => (
                <Grid item xs={12} sm={6} md={3} key={index}>
                  <Card 
                    elevation={0}
                    sx={{ 
                      height: '100%',
                      p: 4,
                      backgroundColor: theme.palette.background.paper,
                      borderRadius: 3,
                      textAlign: 'center',
                      border: `2px solid ${theme.palette.divider}`,
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        transform: 'translateY(-8px)',
                        boxShadow: '0 12px 30px rgba(0,0,0,0.15)',
                        borderColor: theme.palette.primary.main
                      }
                    }}
                  >
                    <CardContent sx={{ p: 0 }}>
                      <Box sx={{ mb: 3 }}>
                        {feature.icon}
                      </Box>
                      <Typography 
                        variant="h6" 
                        component="h3" 
                        sx={{ 
                          fontWeight: 700,
                          mb: 2,
                          color: theme.palette.text.primary
                        }}
                      >
                        {feature.title}
                      </Typography>
                      <Typography 
                        variant="body2" 
                        sx={{ 
                          color: theme.palette.text.secondary,
                          lineHeight: 1.7
                        }}
                      >
                        {feature.description}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Box>
        </Fade>
      </div>

      {/* Redesigned Benefits Section */}
      <div ref={sectionRefs.benefits}>
        <Fade in={visibleSections.benefits} timeout={600}>
          <Box sx={{ mb: 8 }}>
            <Typography variant="h4" component="h2" sx={{ 
              fontWeight: 700,
              mb: 2,
              textAlign: 'center',
              color: theme.palette.text.primary
            }}>
              Why Join Our Newsletter?
            </Typography>
            <Typography variant="body1" sx={{ 
              color: theme.palette.text.secondary,
              mb: 6,
              textAlign: 'center',
              maxWidth: '600px',
              mx: 'auto'
            }}>
              Discover the benefits that make our newsletter essential for your learning journey
            </Typography>
            <Grid container spacing={3}>
              {benefits.map((benefit, index) => (
                <Grid item xs={12} sm={6} md={4} key={index}>
                  <Paper 
                    elevation={0}
                    sx={{ 
                      p: 3,
                      height: '100%',
                      backgroundColor: theme.palette.background.paper,
                      borderRadius: 3,
                      border: `1px solid ${theme.palette.divider}`,
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: '0 8px 25px rgba(0,0,0,0.1)',
                        borderColor: theme.palette.primary.light
                      }
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
                      <Box sx={{ 
                        mr: 2,
                        p: 1,
                        backgroundColor: theme.palette.background.default,
                        borderRadius: 2,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        {benefit.icon}
                      </Box>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="h6" sx={{ 
                          fontWeight: 700,
                          mb: 1,
                          color: theme.palette.text.primary
                        }}>
                          {benefit.title}
                        </Typography>
                        <Typography variant="body2" sx={{ 
                          color: theme.palette.text.secondary,
                          lineHeight: 1.6
                        }}>
                          {benefit.description}
                        </Typography>
                      </Box>
                    </Box>
                  </Paper>
                </Grid>
              ))}
            </Grid>
          </Box>
        </Fade>
      </div>

      {/* Updated Testimonials Section - Names First */}
      <div ref={sectionRefs.testimonials}>
        <Fade in={visibleSections.testimonials} timeout={600}>
          <Box sx={{ mb: 8 }}>
            <Typography variant="h4" component="h2" sx={{ 
              fontWeight: 700,
              mb: 2,
              textAlign: 'center',
              color: theme.palette.text.primary
            }}>
              What Our Subscribers Say
            </Typography>
            <Typography variant="body1" sx={{ 
              color: theme.palette.text.secondary,
              mb: 6,
              textAlign: 'center',
              maxWidth: '600px',
              mx: 'auto'
            }}>
              Real feedback from our community of learners and professionals
            </Typography>
            <Grid container spacing={4}>
              {testimonials.map((testimonial, index) => (
                <Grid item xs={12} md={4} key={index}>
                  <Card 
                    elevation={0}
                    sx={{ 
                      height: '100%',
                      p: 4,
                      backgroundColor: theme.palette.background.paper,
                      borderRadius: 3,
                      border: `2px solid ${theme.palette.divider}`,
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        transform: 'translateY(-6px)',
                        boxShadow: '0 12px 30px rgba(0,0,0,0.15)',
                        borderColor: index % 2 === 0 ? theme.palette.primary.main : theme.palette.secondary.main
                      }
                    }}
                  >
                    <CardContent sx={{ p: 0 }}>
                      {/* Name and Role First */}
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                        <Avatar 
                          sx={{ 
                            mr: 2,
                            width: 50,
                            height: 50,
                            bgcolor: index % 2 === 0 ? theme.palette.primary.main : theme.palette.secondary.main,
                            fontWeight: 700,
                            fontSize: '1.2rem'
                          }}
                        >
                          {testimonial.avatar}
                        </Avatar>
                        <Box>
                          <Typography variant="h6" sx={{ 
                            fontWeight: 700,
                            color: theme.palette.text.primary,
                            mb: 0.5
                          }}>
                            {testimonial.name}
                          </Typography>
                          <Typography variant="body2" sx={{ 
                            color: theme.palette.text.secondary,
                            fontWeight: 500
                          }}>
                            {testimonial.role}
                          </Typography>
                        </Box>
                      </Box>
                      
                      {/* Comment Below */}
                      <Box sx={{ 
                      position: 'relative',
                      pl: 3,
                      '&::before': {
                        content: '"\\201C"',  // Proper left double quote character
                        position: 'absolute',
                        left: 0,
                        top: -5,
                        fontSize: '2.5rem',
                        color: theme.palette.primary.main,
                        fontWeight: 700,
                        lineHeight: 1
                      }
                    }}>
                      <Typography 
                        variant="body1" 
                        sx={{ 
                          fontStyle: 'italic',
                          color: theme.palette.text.secondary,
                          lineHeight: 1.7
                        }}
                      >
                        {testimonial.content}
                      </Typography>
                    </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Box>
        </Fade>
      </div>

      {/* Final CTA */}
      <Box sx={{ textAlign: 'center' }}>
        <Paper 
          elevation={0}
          sx={{ 
            p: 6,
            borderRadius: 4,
            background: `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.secondary.dark} 100%)`,
            color: '#fff',
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          <Typography variant="h5" component="h2" sx={{ 
            mb: 2,
            fontWeight: 700
          }}>
            Ready to Level Up Your Learning?
          </Typography>
          <Typography variant="body1" sx={{ 
            mb: 4,
            maxWidth: '600px',
            mx: 'auto',
            opacity: 0.9
          }}>
            Join thousands of learners who trust Cognara to keep them informed and inspired
          </Typography>
          <Button
            variant="contained"
            size="large"
            onClick={() => document.getElementById('email')?.scrollIntoView({ behavior: 'smooth' })}
            sx={{
              px: 6,
              py: 2,
              fontWeight: 700,
              borderRadius: 3,
              textTransform: 'none',
              fontSize: '1.1rem',
              backgroundColor: '#fff',
              color: theme.palette.primary.main,
              boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
              '&:hover': {
                backgroundColor: '#f5f5f5',
                transform: 'translateY(-3px)',
                boxShadow: '0 8px 25px rgba(0,0,0,0.3)'
              },
              transition: 'all 0.3s ease'
            }}
          >
            Subscribe Now - It's Free! 🚀
          </Button>
        </Paper>
      </Box>
    </Container>
  );
};

export default Newsletter;