import React, { useState, useEffect, useRef } from 'react';
import { 
  Container, 
  Typography, 
  Box, 
  Fade, 
  Paper,
  useTheme,
  Grid,
  Avatar,
  Divider,
  Button,
  Chip,
  LinearProgress
} from '@mui/material';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { articlesAPI } from '../services/api';
import ArticleCard from '../components/Article/ArticleCard';
import WavingHandIcon from '@mui/icons-material/WavingHand';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import GroupIcon from '@mui/icons-material/Group';
import ChatIcon from '@mui/icons-material/Chat';

const Dashboard = () => {
  const theme = useTheme();
  const { user } = useAuth();
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [visibleSections, setVisibleSections] = useState({
    header: false,
    stats: false,
    articles: false,
    activity: false
  });

  const sectionRefs = {
    header: useRef(null),
    stats: useRef(null),
    articles: useRef(null),
    activity: useRef(null)
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

  const getInitials = (firstName, lastName) => {
    return `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase();
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const userStats = [
    {
      label: 'Articles Read',
      value: '23',
      icon: <BookmarkIcon />,
      color: theme.palette.primary.main,
      progress: 65
    },
    {
      label: 'Discussions',
      value: '12',
      icon: <ChatIcon />,
      color: theme.palette.secondary.main,
      progress: 40
    },
    {
      label: 'Connections',
      value: '45',
      icon: <GroupIcon />,
      color: '#82D8FF',
      progress: 80
    },
    {
      label: 'Streak',
      value: '7 days',
      icon: <TrendingUpIcon />,
      color: '#4CAF50',
      progress: 70
    }
  ];

  const recentActivity = [
    {
      type: 'article',
      title: 'Commented on "The Future of AI in Education"',
      time: '2 hours ago',
      color: theme.palette.primary.main
    },
    {
      type: 'discussion',
      title: 'Started a new discussion in Psychology',
      time: '1 day ago',
      color: theme.palette.secondary.main
    },
    {
      type: 'bookmark',
      title: 'Bookmarked "Quantum Computing Basics"',
      time: '2 days ago',
      color: '#82D8FF'
    }
  ];

  return (
    <Container 
      maxWidth="xl" // Changed to xl for more width
      sx={{ 
        py: 4, 
        marginTop: 5,
      }}
    >
      <Helmet>
        <title>Dashboard | Cognara</title>
        <meta name="description" content="Your personalized learning dashboard" />
      </Helmet>

      {/* Header Section */}
      <div ref={sectionRefs.header}>
        <Fade in={visibleSections.header} timeout={600}>
          <Box sx={{ mb: 6 }}>
            <Paper elevation={0} sx={{ 
              p: 4,
              borderRadius: 3,
              background: `linear-gradient(135deg, ${theme.palette.primary.main}20 0%, ${theme.palette.secondary.main}20 100%)`,
              borderLeft: `4px solid ${theme.palette.primary.main}`,
              position: 'relative',
              overflow: 'hidden'
            }}>
              <Box sx={{ 
                position: 'absolute',
                top: -20,
                right: -20,
                width: 100,
                height: 100,
                borderRadius: '50%',
                background: `linear-gradient(45deg, ${theme.palette.primary.main}10, ${theme.palette.secondary.main}10)`,
                opacity: 0.3
              }} />
              
              <Grid container spacing={3} alignItems="center">
                <Grid item xs={12} md={8}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <WavingHandIcon sx={{ mr: 1, color: '#FFA726' }} />
                    <Typography 
                      variant="h3" // Larger heading
                      component="h1" 
                      sx={{ 
                        fontWeight: 700,
                        color: theme.palette.text.primary
                      }}
                    >
                      {getGreeting()}, {user?.first_name}!
                    </Typography>
                  </Box>
                  <Typography 
                    variant="h5" // Larger subheading
                    sx={{ 
                      color: theme.palette.text.secondary,
                      mb: 2
                    }}
                  >
                    Welcome back to your learning journey
                  </Typography>
                  <Typography 
                    variant="body1" 
                    sx={{ 
                      color: theme.palette.text.secondary,
                      maxWidth: '800px'
                    }}
                  >
                    Ready to explore new knowledge and connect with fellow learners? 
                    Let's continue building your expertise together.
                  </Typography>
                </Grid>
                
                <Grid item xs={12} md={4}>
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <Avatar 
                      sx={{ 
                        width: 100, // Larger avatar
                        height: 100,
                        fontSize: '2.5rem',
                        fontWeight: 700,
                        background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                        boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
                      }}
                    >
                      {getInitials(user?.first_name, user?.last_name)}
                    </Avatar>
                  </Box>
                </Grid>
              </Grid>
            </Paper>
          </Box>
        </Fade>
      </div>

      {/* Stats Section - Made Bigger */}
      <div ref={sectionRefs.stats}>
        <Fade in={visibleSections.stats} timeout={600}>
          <Box sx={{ mb: 6 }}>
            <Typography variant="h4" component="h2" sx={{ 
              fontWeight: 700,
              mb: 4,
              color: theme.palette.text.primary
            }}>
              Your Progress
            </Typography>
            <Grid container spacing={4}>
              {userStats.map((stat, index) => (
                <Grid item xs={12} sm={6} lg={3} key={index}>
                  <Paper 
                    elevation={0} 
                    sx={{ 
                      p: 4, // More padding
                      height: '100%',
                      borderRadius: 3, // Larger border radius
                      backgroundColor: theme.palette.background.default,
                      border: `1px solid ${theme.palette.divider}`,
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: '0 8px 25px rgba(0,0,0,0.1)'
                      }
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                      <Box sx={{ 
                        p: 1.5, // Larger icon box
                        borderRadius: 2,
                        backgroundColor: `${stat.color}20`,
                        color: stat.color,
                        mr: 2
                      }}>
                        {React.cloneElement(stat.icon, { sx: { fontSize: '1.75rem' } })}
                      </Box>
                      <Typography 
                        variant="h3" // Larger value
                        sx={{ 
                          fontWeight: 800,
                          color: theme.palette.text.primary
                        }}
                      >
                        {stat.value}
                      </Typography>
                    </Box>
                    <Typography 
                      variant="h6" // Larger label
                      sx={{ 
                        color: theme.palette.text.secondary,
                        mb: 3
                      }}
                    >
                      {stat.label}
                    </Typography>
                    <LinearProgress 
                      variant="determinate" 
                      value={stat.progress} 
                      sx={{
                        height: 8, // Thicker progress bar
                        borderRadius: 3,
                        backgroundColor: `${stat.color}20`,
                        '& .MuiLinearProgress-bar': {
                          backgroundColor: stat.color,
                          borderRadius: 3
                        }
                      }}
                    />
                  </Paper>
                </Grid>
              ))}
            </Grid>
          </Box>
        </Fade>
      </div>

      {/* Main Content Grid */}
      <Grid container spacing={4}>
        {/* Articles Section - Adjusted for better row display */}
        <Grid item xs={12} lg={8}>
          <div ref={sectionRefs.articles}>
            <Fade in={visibleSections.articles} timeout={600}>
              <Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                  <Typography variant="h4" component="h2" sx={{ 
                    fontWeight: 700,
                    color: theme.palette.text.primary
                  }}>
                    Latest Articles
                  </Typography>
                  <Button 
                    variant="outlined" 
                    component={Link} 
                    to="/articles"
                    size="large"
                    sx={{
                      borderRadius: 2,
                      textTransform: 'none',
                      fontWeight: 600,
                      px: 3
                    }}
                  >
                    View All
                  </Button>
                </Box>

                {loading ? (
                  <Box sx={{ textAlign: 'center', py: 4 }}>
                    <Typography variant="h6" sx={{ color: theme.palette.text.secondary }}>
                      Loading articles...
                    </Typography>
                  </Box>
                ) : (
                  <Grid container spacing={4}>
                    {articles.slice(0, 6).map((article) => (
                      <Grid item key={article.id} xs={12} sm={6} md={4} lg={3}>
                        <ArticleCard article={article} />
                      </Grid>
                    ))}
                  </Grid>
                )}
              </Box>
            </Fade>
          </div>
        </Grid>

        {/* Activity Sidebar - Made more prominent */}
        <Grid item xs={12} lg={4}>
          <div ref={sectionRefs.activity}>
            <Fade in={visibleSections.activity} timeout={600}>
              <Box>
                <Typography variant="h4" component="h2" sx={{ 
                  fontWeight: 700,
                  mb: 4,
                  color: theme.palette.text.primary
                }}>
                  Recent Activity
                </Typography>
                
                <Paper elevation={0} sx={{ 
                  p: 3,
                  borderRadius: 3,
                  backgroundColor: theme.palette.background.default,
                  border: `1px solid ${theme.palette.divider}`,
                  mb: 4
                }}>
                  {recentActivity.map((activity, index) => (
                    <Box key={index}>
                      <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
                        <Box sx={{ 
                          width: 14,
                          height: 14,
                          borderRadius: '50%',
                          backgroundColor: activity.color,
                          mr: 2,
                          mt: 0.75,
                          flexShrink: 0
                        }} />
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="h6" sx={{ 
                            fontWeight: 600,
                            color: theme.palette.text.primary,
                            mb: 0.5
                          }}>
                            {activity.title}
                          </Typography>
                          <Typography variant="body2" sx={{ 
                            color: theme.palette.text.secondary
                          }}>
                            {activity.time}
                          </Typography>
                        </Box>
                      </Box>
                      {index < recentActivity.length - 1 && (
                        <Divider sx={{ my: 2 }} />
                      )}
                    </Box>
                  ))}
                </Paper>

                {/* Quick Actions - Made more prominent */}
                <Paper elevation={0} sx={{ 
                  p: 3,
                  borderRadius: 3,
                  backgroundColor: theme.palette.background.default,
                  border: `1px solid ${theme.palette.divider}`
                }}>
                  <Typography variant="h5" sx={{ 
                    fontWeight: 700,
                    mb: 3,
                    color: theme.palette.text.primary
                  }}>
                    Quick Actions
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                    <Chip 
                      label="New Discussion" 
                      onClick={() => {}} 
                      size="medium"
                      sx={{
                        backgroundColor: `${theme.palette.primary.main}20`,
                        color: theme.palette.primary.main,
                        height: 48,
                        fontSize: '1rem',
                        '&:hover': {
                          backgroundColor: `${theme.palette.primary.main}30`
                        }
                      }}
                    />
                    <Chip 
                      label="Browse Topics" 
                      onClick={() => {}} 
                      size="medium"
                      sx={{
                        backgroundColor: `${theme.palette.secondary.main}20`,
                        color: theme.palette.secondary.main,
                        height: 48,
                        fontSize: '1rem',
                        '&:hover': {
                          backgroundColor: `${theme.palette.secondary.main}30`
                        }
                      }}
                    />
                    <Chip 
                      label="My Bookmarks" 
                      onClick={() => {}} 
                      size="medium"
                      sx={{
                        backgroundColor: `#82D8FF20`,
                        color: '#82D8FF',
                        height: 48,
                        fontSize: '1rem',
                        '&:hover': {
                          backgroundColor: `#82D8FF30`
                        }
                      }}
                    />
                  </Box>
                </Paper>
              </Box>
            </Fade>
          </div>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Dashboard;