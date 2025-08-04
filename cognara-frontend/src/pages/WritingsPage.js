import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Fade,
  Paper,
  Grid,
  Button,
  TextField,
  InputAdornment,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  IconButton,
  Menu,
  MenuList,
  MenuItem as MenuItemComponent,
  ListItemIcon,
  ListItemText,
  Divider,
  LinearProgress,
  Alert,
  Skeleton, FormControlLabel, Switch, Tooltip
} from '@mui/material';
import ViewCompactIcon from '@mui/icons-material/ViewCompact';
import ViewModuleIcon from '@mui/icons-material/ViewModule';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { articlesAPI } from '../services/api';

import { useTheme, alpha } from '@mui/material/styles';

// Import your existing components
import Header from '../components/Layout/Header';
import Footer from '../components/Layout/Footer';
import WritingArticleCard from '../components/Article/WritingArticleCard';
import ArticleCard from '../components/Article/ArticleCard';

// Icons
import SearchIcon from '@mui/icons-material/Search';
import EditIcon from '@mui/icons-material/Edit';
import VisibilityIcon from '@mui/icons-material/Visibility';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import PublishIcon from '@mui/icons-material/Publish';
import DraftsIcon from '@mui/icons-material/Drafts';
import ScheduleIcon from '@mui/icons-material/Schedule';
import ArticleIcon from '@mui/icons-material/Article';
import BookIcon from '@mui/icons-material/Book';
import CreateIcon from '@mui/icons-material/Create';
import RefreshIcon from '@mui/icons-material/Refresh';


const WritingsPage = ({ isDarkMode, setIsDarkMode }) => {
  const navigate = useNavigate();
  const theme = useTheme();
  const { user } = useAuth();
  const [showImages, setShowImages] = useState(true);
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('updated_at');
  const [sortOrder, setSortOrder] = useState('desc');
  const [deleteLoading, setDeleteLoading] = useState(null);
  const [error, setError] = useState(null);
  const [visibleSections, setVisibleSections] = useState({
    header: false,
    stats: false,
    content: false
  });


  const sectionRefs = {
    header: useRef(null),
    stats: useRef(null),
    content: useRef(null)
  };

  // Intersection Observer for animations
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

  // Load user's articles
    useEffect(() => {
    const fetchUserArticles = async () => {
        try {
        setLoading(true);
        setError(null);
        
        // Replace the mock data with actual API call
        const response = await articlesAPI.getUserArticles();
        setArticles(response);
        } catch (err) {
        setError('Failed to load your articles. Please try again.');
        console.error('Error loading articles:', err);
        } finally {
        setLoading(false);
        }
    };

    fetchUserArticles();
    }, [user]);

  // Filter and sort articles
  const filteredAndSortedArticles = React.useMemo(() => {
    let filtered = articles.filter(article => {
      const matchesSearch = article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           article.excerpt.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || article.status === statusFilter;
      return matchesSearch && matchesStatus;
    });

    return filtered.sort((a, b) => {
      const aValue = a[sortBy];
      const bValue = b[sortBy];
      const multiplier = sortOrder === 'desc' ? -1 : 1;
      
      if (sortBy === 'updated_at' || sortBy === 'created_at') {
        return multiplier * (new Date(aValue) - new Date(bValue));
      }
      
      if (typeof aValue === 'string') {
        return multiplier * aValue.localeCompare(bValue);
      }
      
      return multiplier * (aValue - bValue);
    });
  }, [articles, searchTerm, statusFilter, sortBy, sortOrder]);

  const handleEdit = (articleId) => {
    // Navigate to submit page with article data
    navigate(`/submit?edit=${articleId}`);

  };

  const handleView = (articleId) => {
    navigate(`/article/${articleId}`);
  };

  const handleDelete = async (articleId) => {
    if (!window.confirm('Are you sure you want to delete this article? This action cannot be undone.')) {
        return;
    }

    try {
        setDeleteLoading(articleId);
        await articlesAPI.delete(articleId); // Make sure this endpoint exists in your API
        setArticles(prev => prev.filter(article => article.id !== articleId));
    } catch (err) {
        alert('Failed to delete article. Please try again.');
        console.error('Error deleting article:', err);
    } finally {
        setDeleteLoading(null);
    }
    };

  const stats = [
    {
      label: 'Total Articles',
      value: articles.length,
      icon: <ArticleIcon />,
      color: theme.palette.primary.main,
      progress: 100
    },
    {
      label: 'Published',
      value: articles.filter(a => a.status === 'published').length,
      icon: <PublishIcon />,
      color: theme.palette.success.main,
      progress: (articles.filter(a => a.status === 'published').length / Math.max(articles.length, 1)) * 100
    },
    {
      label: 'Drafts',
      value: articles.filter(a => a.status === 'draft').length,
      icon: <DraftsIcon />,
      color: theme.palette.warning.main,
      progress: (articles.filter(a => a.status === 'draft').length / Math.max(articles.length, 1)) * 100
    },
    {
      label: 'Total Words',
      value: articles.reduce((sum, article) => sum + (article.word_count || 0), 0).toLocaleString(),
      icon: <BookIcon />,
      color: theme.palette.secondary.main,
      progress: 85
    }
  ];

  const handleToggleImageMode = () => {
  setShowImages(prev => !prev);
    };

  return (
    <Box sx={{ minHeight: '100vh', marginTop: '2rem', display: 'flex', flexDirection: 'column' }}>
      <Helmet>
        <title>My Writings | Cognara</title>
        <meta name="description" content="Manage and organize all your articles" />
      </Helmet>

      {/* Header */}
      <Header isDarkMode={isDarkMode} setIsDarkMode={setIsDarkMode} />

      {/* Main Content */}
      <Box sx={{ flex: 1 }}>
        <Container 
          maxWidth="xl"
          sx={{ 
            py: 4, 
            marginTop: 5
          }}
        >
{/* Combined Header & Stats Section */}
<div ref={sectionRefs.header}>
  <Fade in={visibleSections.header} timeout={800}>
    <Box sx={{ mb: 4 }}>
      <Paper
        elevation={0}
        sx={{
          p: 0,
          borderRadius: 4,
          background: isDarkMode
            ? `linear-gradient(135deg, rgba(144, 202, 249, 0.08) 0%, rgba(244, 143, 177, 0.08) 50%, rgba(255, 167, 38, 0.06) 100%)`
            : `linear-gradient(135deg, rgba(25, 118, 210, 0.08) 0%, rgba(220, 0, 78, 0.08) 50%, rgba(0, 121, 107, 0.06) 100%)`,
          border: `1px solid ${theme.palette.divider}`,
          position: "relative",
          overflow: "hidden",
          boxShadow: isDarkMode
            ? "0 10px 25px rgba(255, 255, 255, 0.02), 0 6px 20px rgba(144, 202, 249, 0.05)"
            : "0 10px 25px rgba(0, 0, 0, 0.08), 0 6px 20px rgba(25, 118, 210, 0.1)",
          "&::before": {
            content: '""',
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: "3px",
            background: isDarkMode
              ? "linear-gradient(90deg, #FFA726, #F06292, #90caf9)"
              : "linear-gradient(90deg, #00796B, #42A5F5, #1976d2)",
            zIndex: 1,
          },
        }}
      >
        <Box sx={{ p: 3, position: "relative", zIndex: 2 }}>
          <Grid container spacing={3} alignItems="center">
            {/* Header Content */}
            <Grid item xs={12} lg={7}>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  mb: 2,
                }}
              >
                <Box
                  sx={{
                    p: 1.5,
                    borderRadius: 3,
                    background: isDarkMode
                      ? "linear-gradient(45deg, rgba(255, 167, 38, 0.15), rgba(244, 143, 177, 0.15))"
                      : "linear-gradient(45deg, rgba(0, 121, 107, 0.15), rgba(66, 165, 245, 0.15))",
                    mr: 2,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    boxShadow: isDarkMode
                      ? "0 6px 15px rgba(255, 167, 38, 0.2)"
                      : "0 6px 15px rgba(0, 121, 107, 0.2)",
                    border: `2px solid ${
                      isDarkMode
                        ? "rgba(255, 167, 38, 0.3)"
                        : "rgba(0, 121, 107, 0.3)"
                    }`,
                  }}
                >
                  <CreateIcon
                    sx={{
                      fontSize: "2rem",
                      background: isDarkMode
                        ? "linear-gradient(45deg, #FFA726, #F06292)"
                        : "linear-gradient(45deg, #00796B, #42A5F5)",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                      backgroundClip: "text",
                    }}
                  />
                </Box>

                <Box>
                  <Typography
                    variant="h3"
                    component="h1"
                    sx={{
                      fontWeight: 800,
                      background: isDarkMode
                        ? "linear-gradient(135deg, #EAEAEA 0%, #90caf9 50%, #f48fb1 100%)"
                        : "linear-gradient(135deg, #2C3E50 0%, #1976d2 50%, #dc004e 100%)",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                      backgroundClip: "text",
                      mb: 0.5,
                      fontSize: { xs: "2rem", md: "2.5rem" },
                    }}
                  >
                    My Writings
                  </Typography>
                  <Typography
                    variant="h4"
                    component="span"
                    sx={{
                      fontWeight: 300,
                      color: theme.palette.text.secondary,
                      fontSize: { xs: "2rem", md: "2.5rem" },
                    }}
                  >
                    Dashboard
                  </Typography>
                </Box>
              </Box>

              <Typography
                variant="h6"
                sx={{
                  color: theme.palette.text.secondary,
                  mb: 2,
                  fontWeight: 400,
                  fontStyle: "italic",
                  fontSize: { xs: "1.1rem", md: "1.2rem" },
                }}
              >
                Where creativity meets analytics ✨
              </Typography>

              <Typography
                variant="body1"
                sx={{
                  color: theme.palette.text.secondary,
                  maxWidth: "600px",
                  mb: 3,
                  lineHeight: 1.6,
                  fontSize: "1rem",
                }}
              >
                Transform your ideas into compelling stories. Track your writing journey, engage with your audience, and watch your creative impact flourish across every piece you craft.
              </Typography>

            {/* Buttons - Smaller */}
            <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
            <Button
                variant="contained"
                startIcon={<AddIcon />}
                component={Link}
                to="/submit"
                sx={{
                borderRadius: 3,
                px: 3, // smaller horizontal padding
                py: 1, // smaller vertical padding
                fontSize: "0.95rem", // smaller text
                fontWeight: 700,
                textTransform: "none",
                background: isDarkMode
                    ? "linear-gradient(45deg, #FFA726, #F06292)"
                    : "linear-gradient(45deg, #00796B, #42A5F5)",
                boxShadow: isDarkMode
                    ? "0 4px 15px rgba(255, 167, 38, 0.4)"
                    : "0 4px 15px rgba(0, 121, 107, 0.4)",
                position: "relative",
                overflow: "hidden",
                "&::before": {
                    content: '""',
                    position: "absolute",
                    top: 0,
                    left: "-100%",
                    width: "100%",
                    height: "100%",
                    background:
                    "linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)",
                    transition: "left 0.5s ease",
                },
                "&:hover": {
                    transform: "translateY(-2px) scale(1.01)",
                    "&::before": { left: "100%" },
                },
                }}
            >
                Create New Article
            </Button>

            <Button
                variant="outlined"
                sx={{
                borderRadius: 3,
                px: 3,
                py: 1,
                fontSize: "0.95rem",
                fontWeight: 600,
                textTransform: "none",
                borderColor: theme.palette.primary.main,
                color: theme.palette.primary.main,
                borderWidth: "2px",
                "&:hover": {
                    transform: "translateY(-1px)",
                    backgroundColor: `${theme.palette.primary.main}10`,
                },
                }}
            >
                View All Articles
            </Button>
            </Box>
            </Grid>

            {/* Stats Cards - Right Aligned */}
            <Grid
              item
              xs={12}
              lg={5}
              sx={{
                display: "flex",
                justifyContent: "flex-end", // right-align
              }}
            >
              <Grid container spacing={2} sx={{ width: "auto" }}>
                {stats.slice(0, 2).map((stat, index) => (
                  <Grid item key={index}>
                    <Paper
                      elevation={0}
                      sx={{
                        p: 2,
                        height: "130px",
                        width: "120px",
                        borderRadius: 3,
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Box
                        sx={{
                          p: 1,
                          borderRadius: "50%",
                          backgroundColor: `${stat.color}15`,
                          color: stat.color,
                          width: 40,
                          height: 40,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          mb: 1,
                        }}
                      >
                        {React.cloneElement(stat.icon, {
                          sx: { fontSize: "1.2rem" },
                        })}
                      </Box>
                      <Typography variant="h5" sx={{ fontWeight: 700 }}>
                        {stat.value}
                      </Typography>
                      <Typography variant="body2" sx={{ fontSize: "0.8rem" }}>
                        {stat.label}
                      </Typography>
                    </Paper>
                  </Grid>
                ))}
              </Grid>
            </Grid>
          </Grid>
        </Box>
      </Paper>
    </Box>
  </Fade>
</div>




          {/* Filters and Search */}
          <div ref={sectionRefs.content}>
            <Fade in={visibleSections.content} timeout={600}>
              <Box>
                <Paper elevation={0} sx={{ 
                  p: 4, 
                  mb: 4, 
                  borderRadius: 3,
                  backgroundColor: theme.palette.background.default,
                  border: `1px solid ${theme.palette.divider}`
                }}>
                  <Grid container spacing={3} alignItems="center">
  <Grid item xs={12} md={3}>
    <TextField
      fullWidth
      variant="outlined"
      placeholder="Search your articles..."
      value={searchTerm}
      onChange={(e) => setSearchTerm(e.target.value)}
      InputProps={{
        startAdornment: (
          <InputAdornment position="start">
            <SearchIcon sx={{ color: theme.palette.text.secondary }} />
          </InputAdornment>
        ),
      }}
      sx={{
        '& .MuiOutlinedInput-root': {
          borderRadius: 2
        }
      }}
    />
  </Grid>

  <Grid item xs={12} md={2}>
    <FormControl fullWidth>
      <InputLabel>Status</InputLabel>
      <Select
        value={statusFilter}
        label="Status"
        onChange={(e) => setStatusFilter(e.target.value)}
        sx={{ borderRadius: 2 }}
      >
        <MenuItem value="all">All Status</MenuItem>
        <MenuItem value="published">Published</MenuItem>
        <MenuItem value="draft">Draft</MenuItem>
        <MenuItem value="pending">Pending</MenuItem>
      </Select>
    </FormControl>
  </Grid>

  <Grid item xs={12} md={2}>
    <FormControl fullWidth>
      <InputLabel>Sort By</InputLabel>
      <Select
        value={`${sortBy}-${sortOrder}`}
        label="Sort By"
        onChange={(e) => {
          const [field, order] = e.target.value.split('-');
          setSortBy(field);
          setSortOrder(order);
        }}
        sx={{ borderRadius: 2 }}
      >
        <MenuItem value="updated_at-desc">Recently Updated</MenuItem>
        <MenuItem value="created_at-desc">Recently Created</MenuItem>
        <MenuItem value="title-asc">Title A-Z</MenuItem>
        <MenuItem value="title-desc">Title Z-A</MenuItem>
        <MenuItem value="word_count-desc">Longest First</MenuItem>
        <MenuItem value="word_count-asc">Shortest First</MenuItem>
      </Select>
        </FormControl>
        </Grid>

        <Grid item xs={12} md={2}>
            <FormControlLabel
            control={
                <Switch
                checked={showImages}
                onChange={handleToggleImageMode}
                color="primary"
                />
            }
            label="Show Images"
            sx={{
                '& .MuiFormControlLabel-label': {
                fontSize: '0.875rem',
                fontWeight: 600
                }
            }}
            />
        </Grid>

        <Grid item xs={12} md={2}>
            <Button
            fullWidth
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={() => window.location.reload()}
            sx={{ 
                borderRadius: 2,
                py: 1.5,
                textTransform: 'none'
            }}
            >
            Refresh
            </Button>
        </Grid>

        <Grid item xs={12} md={1}>
            <Tooltip title={showImages ? "Switch to compact view" : "Switch to image view"}>
            <IconButton
                onClick={handleToggleImageMode}
                sx={{
                border: `1px solid ${theme.palette.divider}`,
                borderRadius: 2,
                p: 1.5,
                '&:hover': {
                    borderColor: theme.palette.primary.main,
                    backgroundColor: alpha(theme.palette.primary.main, 0.08)
                }
                }}
            >
                {showImages ? <ViewCompactIcon /> : <ViewModuleIcon />}
            </IconButton>
            </Tooltip>
        </Grid>
        </Grid>
                </Paper>

                {/* Articles Grid */}
                {loading ? (
                  <Grid container spacing={4}>
                    {[...Array(6)].map((_, index) => (
                      <Grid item xs={12} md={6} lg={4} key={index}>
                        <Paper sx={{ borderRadius: 3, overflow: 'hidden' }}>
                          <Skeleton variant="rectangular" width="100%" height={200} />
                          <Box sx={{ p: 3 }}>
                            <Skeleton variant="text" width="60%" height={32} />
                            <Skeleton variant="text" width="100%" height={20} sx={{ mt: 1 }} />
                            <Skeleton variant="text" width="100%" height={20} />
                            <Skeleton variant="text" width="80%" height={20} />
                            <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
                              <Skeleton variant="rectangular" width={60} height={24} sx={{ borderRadius: 1 }} />
                              <Skeleton variant="rectangular" width={80} height={24} sx={{ borderRadius: 1 }} />
                            </Box>
                          </Box>
                        </Paper>
                      </Grid>
                    ))}
                  </Grid>
                ) : filteredAndSortedArticles.length === 0 ? (
                  <Paper elevation={0} sx={{ 
                    p: 8, 
                    textAlign: 'center', 
                    borderRadius: 3,
                    backgroundColor: theme.palette.background.default,
                    border: `1px solid ${theme.palette.divider}`
                  }}>
                    <ArticleIcon sx={{ fontSize: '4rem', color: theme.palette.text.secondary, mb: 2 }} />
                    <Typography variant="h4" sx={{ fontWeight: 600, mb: 2 }}>
                      No articles found
                    </Typography>
                    <Typography variant="body1" sx={{ color: theme.palette.text.secondary, mb: 4 }}>
                      {searchTerm || statusFilter !== 'all' 
                        ? 'Try adjusting your search or filters.'
                        : 'Get started by creating your first article.'
                      }
                    </Typography>
                    {!searchTerm && statusFilter === 'all' && (
                      <Button
                        variant="contained"
                        size="large"
                        startIcon={<AddIcon />}
                        component={Link}
                        to="/submit"
                        sx={{
                          borderRadius: 2,
                          px: 4,
                          py: 1.5,
                          textTransform: 'none',
                          fontWeight: 600
                        }}
                      >
                        Create Your First Article
                      </Button>
                    )}
                  </Paper>
                ) : (
                  <Grid container spacing={4}>
                    {filteredAndSortedArticles.map((article) => (
                        <Grid item xs={12} sm={6} lg={showImages ? 4 : 3} key={article.id}>
                        <WritingArticleCard
                            article={article}
                            onEdit={handleEdit}
                            onPreview={handleView}
                            onDelete={handleDelete}
                            isDeleting={deleteLoading === article.id}
                            showImages={showImages}
                            onToggleImageMode={handleToggleImageMode}
                        />
                        </Grid>
                    ))}
                    </Grid>
                )}
              </Box>
            </Fade>
          </div>
        </Container>
      </Box>

      {/* Footer */}
      <Footer />
    </Box>
  );
};

export default WritingsPage;