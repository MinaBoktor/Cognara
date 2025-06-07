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
  Avatar,
  Divider
} from '@mui/material';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';

const AboutPage = () => {
  const theme = useTheme();
  const [visibleSections, setVisibleSections] = useState({
    header: false,
    mission: false,
    stats: false,
    values: false,
    team: false,
    cta: false
  });

  const sectionRefs = {
    header: useRef(null),
    mission: useRef(null),
    stats: useRef(null),
    values: useRef(null),
    team: useRef(null),
    cta: useRef(null)
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

  const teamMembers = [
    {
      name: "Dr. Sarah Chen",
      role: "Founder & CEO",
      bio: "Neuroscientist turned entrepreneur with 10+ years in edtech",
      color: theme.palette.primary.main
    },
    {
      name: "James Rodriguez",
      role: "CTO",
      bio: "Former lead engineer at major learning platform",
      color: theme.palette.secondary.main
    },
    {
      name: "Priya Patel",
      role: "Head of Community",
      bio: "Built communities for 500K+ learners worldwide",
      color: "#82D8FF"
    }
  ];

  const stats = [
    { value: "50K+", label: "Active Members" },
    { value: "1M+", label: "Monthly Discussions" },
    { value: "95%", label: "Satisfaction Rate" },
    { value: "24/7", label: "Support Available" }
  ];

  return (
    <Container maxWidth={false} sx={{ py: 4, maxWidth: '1440px' }}>
      <Helmet>
        <title>About | Cognara</title>
        <meta name="description" content="Learn more about Cognara and our mission." />
      </Helmet>

      {/* Header Section */}
      <div ref={sectionRefs.header}>
        <Fade in={visibleSections.header} timeout={600}>
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Typography 
              variant="h3" 
              component="h1" 
              sx={{ 
                fontWeight: 700,
                mb: 1,
                background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                paddingTop:'5rem',
                paddingBottom: '1rem',
                fontSize:'3rem',
                
              }}
            >
              About Cognara
            </Typography>
            <Typography 
              variant="h6" 
              component="p" 
              sx={{ 
                maxWidth: '700px',
                mx: 'auto',
                color: theme.palette.text.secondary,
                mb: 3
              }}
            >
              The world's most engaged community for collaborative learning and knowledge exchange
            </Typography>
            <Divider sx={{ my: 2 }} />
          </Box>
        </Fade>
      </div>

      {/* Mission Section */}
      <div ref={sectionRefs.mission}>
        <Fade in={visibleSections.mission} timeout={600}>
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} md={6}>
              <Paper elevation={0} sx={{ 
                p: 3, 
                height: '100%',
                background: theme.palette.background.default,
                borderRadius: 2,
                borderLeft: `4px solid ${theme.palette.primary.main}`,
                
              }}>
                <Typography variant="h5" component="h2" sx={{ 
                  fontWeight: 700,
                  mb: 2,
                  color: theme.palette.primary.main
                }}>
                  Our Mission
                </Typography>
                <Typography variant="body1" paragraph sx={{ mb: 2 }}>
                  Cognara was founded in 2018 to revolutionize how people learn and share knowledge. We believe the best learning happens through active participation, not passive consumption.
                </Typography>
                <Typography variant="body1" paragraph sx={{ mb: 2 }}>
                  Our platform combines the rigor of academic research with the energy of social learning, creating a space where ideas are challenged, refined, and improved collectively.
                </Typography>
                <Typography variant="body1">
                  We serve over 50,000 active members across 120 countries, with content spanning 25 major subject areas.
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} md={6}>
              <Paper elevation={0} sx={{ 
                p: 3, 
                height: '100%',
                background: theme.palette.background.default,
                borderRadius: 2,
                borderLeft: `4px solid ${theme.palette.secondary.main}`
              }}>
                <Typography variant="h5" component="h2" sx={{ 
                  fontWeight: 700,
                  mb: 2,
                  color: theme.palette.secondary.main
                }}>
                  Our Approach
                </Typography>
                <Typography variant="body1" paragraph sx={{ mb: 2 }}>
                  Unlike traditional learning platforms, Cognara emphasizes:
                </Typography>
                <ul style={{ 
                  paddingLeft: '20px',
                  color: theme.palette.text.secondary,
                  marginBottom: '16px'
                }}>
                  <li><Typography variant="body1" component="span">Peer-to-peer knowledge exchange</Typography></li>
                  <li><Typography variant="body1" component="span">Evidence-based discussions</Typography></li>
                  <li><Typography variant="body1" component="span">Multi-disciplinary connections</Typography></li>
                  <li><Typography variant="body1" component="span">Practical application of concepts</Typography></li>
                </ul>
                <Typography variant="body1">
                  This approach leads to 3x higher retention rates compared to passive learning methods.
                </Typography>
              </Paper>
            </Grid>
          </Grid>
        </Fade>
      </div>

      {/* Stats Section */}
      <div ref={sectionRefs.stats}>
        <Fade in={visibleSections.stats} timeout={600}>
          <Box sx={{ 
            backgroundColor: theme.palette.background.paper,
            borderRadius: 2,
            p: 3,
            mb: 4,
            textAlign: 'center',
            display: 'flex',              // Add this
            flexDirection: 'column',      // Add this
            alignItems: 'center'  
                    }}>
            <Typography variant="h5" component="h2" sx={{ 
              fontWeight: 700,
              mb: 3,
              color: theme.palette.text.primary
            }}>
              By The Numbers
            </Typography>
            <Grid 
              container 
              spacing={2}
              justifyContent={{ xs: 'center', sm: 'space-between' }} // Responsive alignment
              sx={{
                width: '100%',
                margin: '0 auto',
                maxWidth: '800px' // Optional: set a maximum width for better control
              }}
            >
              {stats.map((stat, index) => (
                <Grid 
                  item 
                  xs={6} 
                  sm={3} 
                  key={index}
                  sx={{
                    display: 'flex',
                    justifyContent: 'center', // Always center the content
                    minWidth: { xs: '120px', sm: 'auto' } // Prevent squeezing on small screens
                  }}
                >
                  <Paper 
                    elevation={0} 
                    sx={{ 
                      p: 2,
                      backgroundColor: 'transparent',
                      height: '100%',
                      width: '100%', // Take full width of grid item
                      textAlign: 'center' // Center text content
                    }}
                  >
                    <Typography 
                      variant="h4" 
                      sx={{ 
                        fontWeight: 800,
                        color: theme.palette.primary.main,
                        mb: 1
                      }}
                    >
                      {stat.value}
                    </Typography>
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        color: theme.palette.text.secondary
                      }}
                    >
                      {stat.label}
                    </Typography>
                  </Paper>
                </Grid>
              ))}
            </Grid>
          </Box>
        </Fade>
      </div>

      {/* Values Section */}
      <div ref={sectionRefs.values}>
        <Fade in={visibleSections.values} timeout={600}>
          <Box sx={{ mb: 4 }}>
            <Typography variant="h5" component="h2" sx={{ 
              fontWeight: 700,
              mb: 3,
              textAlign: 'center',
              color: theme.palette.text.primary
            }}>
              Our Core Values
            </Typography>
            <Grid 
              container 
              spacing={2}
              justifyContent="center" // Centers the grid items horizontally
              sx={{
                width: '100%', // Ensures full width
                margin: '0 auto' // Centers the entire grid container
              }}
            >
              {[
                {
                  title: "Intellectual Humility",
                  description: "We acknowledge what we don't know and value diverse perspectives.",
                  icon: "🧠"
                },
                {
                  title: "Constructive Debate",
                  description: "We challenge ideas, not people, to arrive at better solutions.",
                  icon: "💬"
                },
                {
                  title: "Continuous Growth",
                  description: "Learning is a lifelong journey we undertake together.",
                  icon: "🌱"
                },
                {
                  title: "Practical Impact",
                  description: "Knowledge should translate to real-world applications.",
                  icon: "🚀"
                }
              ].map((value, index) => (
                <Grid 
                  item 
                  xs={12} 
                  sm={6} 
                  md={3} 
                  key={index}
                  sx={{
                    display: 'flex',
                    justifyContent: 'center' // Centers the Paper component
                  }}
                >
                  <Paper 
                    elevation={0} 
                    sx={{ 
                      p: 2,
                      width: '100%', // Takes full width of grid item
                      maxWidth: '280px', // Optional: sets maximum width for better appearance
                      height: '100%',
                      backgroundColor: theme.palette.background.default,
                      borderRadius: 2,
                      transition: 'transform 0.3s',
                      textAlign: 'center', // Centers content inside Paper
                      '&:hover': {
                        transform: 'translateY(-5px)'
                      }
                    }}
                  >
                    <Typography variant="h3" sx={{ mb: 1, textAlign: 'center' }}>
                      {value.icon}
                    </Typography>
                    <Typography 
                      variant="h6" 
                      component="h3" 
                      sx={{ 
                        fontWeight: 600,
                        mb: 1,
                        textAlign: 'center' // Explicit center for text
                      }}
                    >
                      {value.title}
                    </Typography>
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        color: theme.palette.text.secondary,
                        textAlign: 'center' // Explicit center for text
                      }}
                    >
                      {value.description}
                    </Typography>
                  </Paper>
                </Grid>
              ))}
            </Grid>
          </Box>
        </Fade>
      </div>

      {/* Team Section */}
      <div ref={sectionRefs.team}>
        <Fade in={visibleSections.team} timeout={600}>
          <Box sx={{ mb: 4 }}>
            <Typography variant="h5" component="h2" sx={{ 
              fontWeight: 700,
              mb: 3,
              textAlign: 'center',
              color: theme.palette.text.primary
            }}>
              Meet The Team
            </Typography>
            <Grid 
                container 
                spacing={2}
                justifyContent="center" // This centers the grid items horizontally
                sx={{
                  width: '100%', // Ensures full width usage
                  margin: '0 auto' // Centers the entire grid container
                }}
              >
                {teamMembers.map((member, index) => (
                  <Grid 
                    item 
                    xs={12} 
                    sm={4} 
                    key={index}
                    sx={{
                      display: 'flex',
                      justifyContent: 'center' // Centers the Paper component
                    }}
                  >
                    <Paper 
                      elevation={0} 
                      sx={{ 
                        p: 3,
                        width: '100%', // Takes full width of grid item
                        maxWidth: '300px', // Optional: sets maximum width for better appearance
                        height: '100%',
                        backgroundColor: theme.palette.background.default,
                        borderRadius: 2,
                        textAlign: 'center',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center' // Centers all child elements
                      }}
                    >
                      <Avatar 
                        sx={{ 
                          width: 80, 
                          height: 80, 
                          mb: 2,
                          backgroundColor: member.color,
                          fontSize: '2rem',
                          fontWeight: 700,
                          // margin: '0 auto' ← Can be removed when using flex centering
                        }}
                      >
                        {member.name.split(' ').map(n => n[0]).join('')}
                      </Avatar>
                      <Typography 
                        variant="h6" 
                        component="h3" 
                        sx={{ 
                          fontWeight: 700,
                          mb: 1
                        }}
                      >
                        {member.name}
                      </Typography>
                      <Typography 
                        variant="subtitle2" 
                        sx={{ 
                          color: member.color,
                          mb: 1,
                          fontWeight: 600
                        }}
                      >
                        {member.role}
                      </Typography>
                      <Typography 
                        variant="body2" 
                        sx={{ 
                          color: theme.palette.text.secondary
                        }}
                      >
                        {member.bio}
                      </Typography>
                    </Paper>
                  </Grid>
                ))}
              </Grid>
          </Box>
        </Fade>
      </div>

      {/* CTA Section */}
      <div ref={sectionRefs.cta}>
        <Fade in={visibleSections.cta} timeout={600}>
          <Paper elevation={0} sx={{ 
            p: 4,
            borderRadius: 2,
            textAlign: 'center',
            background: `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.secondary.dark} 100%)`,
            color: '#fff',
            mb: 2
          }}>
            <Typography variant="h5" component="h2" sx={{ 
              mb: 2,
              fontWeight: 700
            }}>
              Ready to join our community?
            </Typography>
            <Typography variant="body1" sx={{ 
              mb: 3,
              maxWidth: '600px',
              mx: 'auto',
              opacity: 0.9
            }}>
              Start contributing to discussions, share your knowledge, or learn from experts today.
            </Typography>
            <Button 
              variant="contained" 
              color="secondary" 
              size="large"
              component={Link}
              to="/signup"
              sx={{
                px: 5,
                py: 1.5,
                fontWeight: 700,
                borderRadius: 2,
                textTransform: 'none',
                color: theme.palette.getContrastText(theme.palette.secondary.main),
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
                },
                transition: 'all 0.2s ease'
              }}
            >
              Join Now - It's Free
            </Button>
          </Paper>
        </Fade>
      </div>
    </Container>
  );
};

export default AboutPage;