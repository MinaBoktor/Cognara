import React, { useState, useEffect, useRef, useMemo } from 'react';
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

import {
  Clear as ClearIcon,
  Update as UpdateIcon,
  SortByAlpha as SortByAlphaIcon,
  TextFields as TextFieldsIcon,
  Image as ImageIcon
} from '@mui/icons-material';


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

  const handleArticleUpdate = (articleId, updates) => {
    setArticles(prevArticles => 
      prevArticles.map(article => 
        article.id === articleId ? { ...article, ...updates } : article
      )
    );
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

    const refs = sectionRefs;
    Object.keys(refs).forEach(key => {
      if (refs[key].current) {
        refs[key].current.dataset.section = key;
        observer.observe(refs[key].current);
      }
    });

    return () => {
      Object.keys(refs).forEach(key => {
        if (refs[key].current) {
          // eslint-disable-next-line react-hooks/exhaustive-deps
          observer.unobserve(refs[key].current);
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

// Enhanced filtering and sorting logic with null safety
const filteredAndSortedArticles = useMemo(() => {
  if (!articles || articles.length === 0) return [];

  // Filter articles
  let filtered = articles.filter(article => {
    const searchMatch = !searchTerm || 
      (article.title && article.title.toString().toLowerCase().includes(searchTerm.toLowerCase()));

    const statusMatch = statusFilter === 'all' || 
      (article.status && article.status.toLowerCase() === statusFilter.toLowerCase());

    return searchMatch && statusMatch;
  });

  // Sort articles
  filtered.sort((a, b) => {
    let aValue, bValue;

    switch (sortBy) {
      case 'word_count':
        aValue = a.word_count || a.wordCount || 0;
        bValue = b.word_count || b.wordCount || 0;
        break;
      case 'title':
        aValue = (a.title || '').toLowerCase();
        bValue = (b.title || '').toLowerCase();
        break;
      case 'created_at':
        aValue = new Date(a.created_at || a.createdAt || 0);
        bValue = new Date(b.created_at || b.createdAt || 0);
        break;
      case 'updated_at':
        aValue = new Date(a.updated_at || a.updatedAt || a.created_at || a.createdAt || 0);
        bValue = new Date(b.updated_at || b.updatedAt || b.created_at || b.createdAt || 0);
        break;
      default:
        aValue = a[sortBy] || '';
        bValue = b[sortBy] || '';
    }

    if (typeof aValue === 'string' && typeof bValue === 'string') {
      return sortOrder === 'asc' 
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue);
    }

    if (aValue instanceof Date && bValue instanceof Date) {
      return sortOrder === 'asc' 
        ? aValue.getTime() - bValue.getTime()
        : bValue.getTime() - aValue.getTime();
    }

    if (sortOrder === 'asc') {
      return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
    } else {
      return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
    }
  });

  return filtered;
}, [articles, searchTerm, statusFilter, sortBy, sortOrder]);

const handleCreateNew = () => {
  // This assumes you have a Write page where the user writes their article first.
  // If you want to start a blank, pass blank data.
  navigate('/submit', {
    state: {
      fromWritePage: true,
      isEditing: false,
      articleId: null,
      formData: {
        title: '',
        content: '',
        author: user ? `${user.first_name} ${user.last_name}` : 'Current User',
        imageUrl: null,
      }
    }
  });
  };
  
  const handleEdit = (articleId) => {
    const article = articles.find(a => a.id === articleId);
    if (!article) return;
    if (!article || article.status !== 'draft') return;
    navigate('/submit', { 
      state: { 
        articleId: article.id,
        isEditing: true,
        fromWritePage: true,
        formData: {
          title: article.title || '',
          content: article.content || '',
          author: article.author || user ? `${user.first_name} ${user.last_name}` : 'Current User',
          imageUrl: article.imageUrl || null,
        }
      } 
    });
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
        await articlesAPI.delete(articleId);
        setArticles(prev => prev.filter(article => article.id !== articleId));
    } catch (err) {
        alert('Failed to delete article. Please try again.');
        console.error('Error deleting article:', err);
    } finally {
        setDeleteLoading(null);
    }
    };

      const calculateWordCount = (text) => {
      if (!text || typeof text !== 'string') return 0;
      
      const plainText = text.replace(/<[^>]*>/g, ' ');
      
      const words = plainText
        .trim()
        .split(/\s+/)
        .filter(word => word.length > 0);
        
      return words.length;
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
    value: articles.reduce((sum, article) => {
      const wordCount = article.word_count || 
                       calculateWordCount(article.content) || 0;
      return sum + wordCount;
    }, 0).toLocaleString(),
    icon: <BookIcon />,
    color: theme.palette.secondary.main,
    progress: 85
  }
];

  return (
    <Box sx={{ minHeight: '100vh', marginTop: '2rem', display: 'flex', flexDirection: 'column' }}>
      <Helmet>
        <title>My Writings | Cognara</title>
        <meta name="description" content="Manage and organize all your articles" />
      </Helmet>

      <Header isDarkMode={isDarkMode} setIsDarkMode={setIsDarkMode} />

      <Box sx={{ flex: 1 }}>
        <Container maxWidth={false} sx={{ py: 4, marginTop: 5, px: 3 }}>

      <div ref={sectionRefs.header}>
        <Fade in={visibleSections.header} timeout={800}>
          <Box sx={{ mb: 4 }}>
            <Grid container spacing={2} >
              <Grid item xs={12} lg={9} width={"53%"}>
                <Paper
                  elevation={0}
                  sx={{
                    p: 4,
                    borderRadius: 4,
                    background: isDarkMode
                      ? `linear-gradient(135deg, rgba(33, 33, 33, 0.95) 0%, rgba(66, 66, 66, 0.8) 100%)`
                      : `linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(248, 250, 252, 0.9) 100%)`,
                    border: isDarkMode
                      ? "1px solid rgba(144, 202, 249, 0.3)"
                      : "1px solid rgba(25, 118, 210, 0.2)",
                    position: "relative",
                    overflow: "hidden",
                    height: "100%",
                    boxShadow: isDarkMode
                      ? "0 20px 40px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.1)"
                      : "0 20px 40px rgba(25, 118, 210, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.8)",
                    "&::before": {
                      content: '""',
                      position: "absolute",
                      top: 0,
                      left: 0,
                      right: 0,
                      height: "4px",
                      background: isDarkMode
                        ? "linear-gradient(90deg, #90caf9, #f48fb1, #FFA726)"
                        : "linear-gradient(90deg, #1976d2, #dc004e, #00796B)",
                      borderRadius: "4px 4px 0 0",
                    },
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      mb: 2,
                      position: "relative",
                      zIndex: 2,
                    }}
                  >
                    <Box
                      sx={{
                        p: 1.5,
                        borderRadius: 3,
                        background: isDarkMode
                          ? `linear-gradient(135deg, rgba(144, 202, 249, 0.15), rgba(244, 143, 177, 0.15))`
                          : `linear-gradient(135deg, rgba(25, 118, 210, 0.15), rgba(220, 0, 78, 0.15))`,
                        mr: 2,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        boxShadow: isDarkMode
                          ? "0 6px 15px rgba(144, 202, 249, 0.2)"
                          : "0 6px 15px rgba(25, 118, 210, 0.2)",
                        border: isDarkMode
                          ? "2px solid rgba(144, 202, 249, 0.3)"
                          : "2px solid rgba(25, 118, 210, 0.3)",
                      }}
                    >
                      <CreateIcon
                        sx={{
                          fontSize: "2rem",
                          background: isDarkMode
                            ? "linear-gradient(45deg, #90caf9, #f48fb1)"
                            : "linear-gradient(45deg, #1976d2, #dc004e)",
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
                      position: "relative",
                      zIndex: 2,
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
                      position: "relative",
                      zIndex: 2,
                    }}
                  >
                    Transform your ideas into compelling stories. Track your writing journey, engage with your audience, and watch your creative impact flourish across every piece you craft.
                  </Typography>

                  <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap", position: "relative", zIndex: 2 }}>
                    <Button
                      variant="contained"
                      startIcon={<AddIcon />}
                      onClick={handleCreateNew}
                      sx={{
                        borderRadius: 3,
                        px: 3,
                        py: 1,
                        fontSize: "0.95rem",
                        fontWeight: 700,
                        textTransform: "none",
                        background: isDarkMode
                          ? "linear-gradient(45deg, #90caf9, #f48fb1)"
                          : "linear-gradient(45deg, #1976d2, #dc004e)",
                        boxShadow: isDarkMode
                          ? "0 4px 15px rgba(144, 202, 249, 0.4)"
                          : "0 4px 15px rgba(25, 118, 210, 0.4)",
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

                  </Box>
                </Paper>
              </Grid>

              <Grid item xs={12} lg={3} width={"45%"} style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
                <Paper
                  elevation={4}
                  sx={{
                    p: 4,
                    borderRadius: 4,
                    background: isDarkMode
                      ? "linear-gradient(135deg, rgba(33, 33, 33, 0.95) 0%, rgba(66, 66, 66, 0.8) 100%)"
                      : "linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(248, 250, 252, 0.9) 100%)",
                    border: isDarkMode
                      ? "1px solid rgba(144, 202, 249, 0.3)"
                      : "1px solid rgba(25, 118, 210, 0.2)",
                    boxShadow: isDarkMode
                      ? "0 20px 40px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.1)"
                      : "0 20px 40px rgba(25, 118, 210, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.8)",
                    position: "relative",
                    height: "100%",
                    "&::before": {
                      content: '""',
                      position: "absolute",
                      top: 0,
                      left: 0,
                      right: 0,
                      height: "4px",
                      background: isDarkMode
                        ? "linear-gradient(90deg, #90caf9, #f48fb1, #FFA726)"
                        : "linear-gradient(90deg, #1976d2, #dc004e, #00796B)",
                      borderRadius: "4px 4px 0 0",
                    },
                  }}
                >
                  <Box sx={{ mb: 3, textAlign: "center" }}>
                    <Typography
                      variant="h4"
                      sx={{
                        fontWeight: 700,
                        mb: 1,
                        background: isDarkMode
                          ? "linear-gradient(135deg, #90caf9, #f48fb1)"
                          : "linear-gradient(135deg, #1976d2, #dc004e)",
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent",
                        backgroundClip: "text",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 1,
                        fontSize: { xs: "1.5rem", md: "2rem" },
                      }}
                    >
                      Analytics Overview
                    </Typography>
                    <Typography
                      variant="body1"
                      sx={{ 
                        color: theme.palette.text.secondary,
                        fontSize: "1rem"
                      }}
                    >
                      Your writing performance at a glance
                    </Typography>
                  </Box>

                  <Grid container spacing={2}>
                    {stats.map((stat, index) => (
                      <Grid item xs={6} key={index}>
                        <Paper
                          elevation={2}
                          sx={{
                            p: 2.5,
                            width: "100%",
                            height: "130px",
                            minWidth: "120px",
                            aspectRatio: "1/1",
                            borderRadius: 4,
                            background: isDarkMode
                              ? `linear-gradient(135deg, ${stat.color}15, ${stat.color}08)`
                              : `linear-gradient(135deg, ${stat.color}08, ${stat.color}15)`,
                            border: `2px solid ${stat.color}30`,
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            justifyContent: "center",
                            position: "relative",
                            overflow: "hidden",
                            transition: "all 0.3s ease",
                            "&:hover": {
                              transform: "translateY(-4px) scale(1.02)",
                              boxShadow: isDarkMode
                                ? `0 15px 30px ${stat.color}20`
                                : `0 15px 30px ${stat.color}25`,
                            },
                            "&::before": {
                              content: '""',
                              position: "absolute",
                              top: 0,
                              left: 0,
                              right: 0,
                              height: "3px",
                              background: stat.color,
                            },
                          }}
                        >
                          <Box
                            sx={{
                              p: 1,
                              borderRadius: "50%",
                              backgroundColor: `${stat.color}25`,
                              color: stat.color,
                              mb: 1,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              width: 40,
                              height: 40,
                            }}
                          >
                            {stat.icon && React.cloneElement(stat.icon, {
                              sx: { fontSize: "1.3rem" },
                            })}
                          </Box>
                          <Typography 
                            variant="h5" 
                            sx={{ 
                              fontWeight: 800,
                              color: stat.color,
                              mb: 0.5,
                            }}
                          >
                            {stat.value}
                          </Typography>
                          <Typography 
                            variant="body2" 
                            sx={{ 
                              fontSize: "0.85rem",
                              textAlign: "center",
                              color: theme.palette.text.secondary,
                              fontWeight: 500,
                            }}
                          >
                            {stat.label}
                          </Typography>
                        </Paper>
                      </Grid>
                    ))}
                  </Grid>
                </Paper>
              </Grid>
            </Grid>
          </Box>
        </Fade>
      </div>

<div ref={sectionRefs.content}>
  <Fade in={visibleSections.content} timeout={600}>
    <Box>
      <Paper elevation={2} sx={{ 
        p: 4, 
        mb: 4, 
        borderRadius: 4,
        background: `linear-gradient(135deg, ${theme.palette.background.paper} 0%, ${alpha(theme.palette.primary.main, 0.02)} 100%)`,
        border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
        backdropFilter: 'blur(10px)',
        position: 'relative',
        overflow: 'hidden',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '3px',
          background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
        }
      }}>
        <Grid container spacing={3} alignItems="center">
          <Grid item xs={12} md={3} width={"40%"}>
            <TextField
              fullWidth
              variant="outlined"
              placeholder="Search your articles..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ 
                      color: theme.palette.primary.main,
                      fontSize: '1.2rem'
                    }} />
                  </InputAdornment>
                ),
                endAdornment: searchTerm && (
                  <InputAdornment position="end">
                    <IconButton
                      size="small"
                      onClick={() => setSearchTerm('')}
                      sx={{ 
                        color: theme.palette.text.secondary,
                        '&:hover': {
                          color: theme.palette.primary.main,
                          backgroundColor: alpha(theme.palette.primary.main, 0.1)
                        }
                      }}
                    >
                      <ClearIcon fontSize="small" />
                    </IconButton>
                  </InputAdornment>
                )
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 3,
                  backgroundColor: alpha(theme.palette.background.paper, 0.8),
                  backdropFilter: 'blur(8px)',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    backgroundColor: alpha(theme.palette.background.paper, 0.9),
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: alpha(theme.palette.primary.main, 0.3),
                    }
                  },
                  '&.Mui-focused': {
                    backgroundColor: theme.palette.background.paper,
                    boxShadow: `0 0 0 3px ${alpha(theme.palette.primary.main, 0.1)}`,
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: theme.palette.primary.main,
                      borderWidth: '2px'
                    }
                  }
                }
              }}
            />
          </Grid>

          <Grid item xs={12} md={2}>
            <FormControl fullWidth>
              <InputLabel sx={{ 
                '&.Mui-focused': { 
                  color: theme.palette.primary.main 
                } 
              }}>
                Status
              </InputLabel>
              <Select
                value={statusFilter}
                label="Status"
                onChange={(e) => setStatusFilter(e.target.value)}
                sx={{ 
                  borderRadius: 3,
                  backgroundColor: alpha(theme.palette.background.paper, 0.8),
                  backdropFilter: 'blur(8px)',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    backgroundColor: alpha(theme.palette.background.paper, 0.9),
                  },
                  '& .MuiOutlinedInput-notchedOutline': {
                    transition: 'border-color 0.3s ease'
                  },
                  '&:hover .MuiOutlinedInput-notchedOutline': {
                    borderColor: alpha(theme.palette.primary.main, 0.3),
                  },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                    borderColor: theme.palette.primary.main,
                    borderWidth: '2px'
                  }
                }}
              >
                <MenuItem value="all">
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box sx={{ 
                      width: 8, 
                      height: 8, 
                      borderRadius: '50%', 
                      backgroundColor: theme.palette.text.secondary 
                    }} />
                    All Status
                  </Box>
                </MenuItem>
                <MenuItem value="published">
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box sx={{ 
                      width: 8, 
                      height: 8, 
                      borderRadius: '50%', 
                      backgroundColor: theme.palette.success.main 
                    }} />
                    Published
                  </Box>
                </MenuItem>
                <MenuItem value="draft">
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box sx={{ 
                      width: 8, 
                      height: 8, 
                      borderRadius: '50%', 
                      backgroundColor: theme.palette.warning.main 
                    }} />
                    Draft
                  </Box>
                </MenuItem>
                <MenuItem value="pending_review">
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box sx={{ 
                      width: 8, 
                      height: 8, 
                      borderRadius: '50%', 
                      backgroundColor: theme.palette.info.main 
                    }} />
                    Pending
                  </Box>
                </MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} md={3}>
            <FormControl fullWidth>
              <InputLabel sx={{ 
                '&.Mui-focused': { 
                  color: theme.palette.primary.main 
                } 
              }}>
                Sort By
              </InputLabel>
              <Select
                value={`${sortBy}-${sortOrder}`}
                label="Sort By"
                onChange={(e) => {
                  const [field, order] = e.target.value.split('-');
                  setSortBy(field);
                  setSortOrder(order);
                }}
                sx={{ 
                  borderRadius: 3,
                  backgroundColor: alpha(theme.palette.background.paper, 0.8),
                  backdropFilter: 'blur(8px)',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    backgroundColor: alpha(theme.palette.background.paper, 0.9),
                  },
                  '&:hover .MuiOutlinedInput-notchedOutline': {
                    borderColor: alpha(theme.palette.primary.main, 0.3),
                  },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                    borderColor: theme.palette.primary.main,
                    borderWidth: '2px'
                  }
                }}
              >
                <MenuItem value="updated_at-desc">
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <UpdateIcon fontSize="small" />
                    Recently Updated
                  </Box>
                </MenuItem>
                <MenuItem value="created_at-desc">
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <AddIcon fontSize="small" />
                    Recently Created
                  </Box>
                </MenuItem>
                <MenuItem value="title-asc">
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <SortByAlphaIcon fontSize="small" />
                    Title A-Z
                  </Box>
                </MenuItem>
                <MenuItem value="title-desc">
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <SortByAlphaIcon fontSize="small" sx={{ transform: 'rotate(180deg)' }} />
                    Title Z-A
                  </Box>
                </MenuItem>
                <MenuItem value="word_count-desc">
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <TextFieldsIcon fontSize="small" />
                    Longest First
                  </Box>
                </MenuItem>
                <MenuItem value="word_count-asc">
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <TextFieldsIcon fontSize="small" />
                    Shortest First
                  </Box>
                </MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} md={2}>
            <Button
              fullWidth
              variant="outlined"
              startIcon={<RefreshIcon />}
              onClick={() => window.location.reload()}
              sx={{ 
                borderRadius: 3,
                py: 1.5,
                px: 2,
                textTransform: 'none',
                fontWeight: 600,
                backgroundColor: alpha(theme.palette.background.paper, 0.8),
                backdropFilter: 'blur(8px)',
                borderColor: alpha(theme.palette.primary.main, 0.2),
                transition: 'all 0.3s ease',
                '&:hover': {
                  backgroundColor: alpha(theme.palette.primary.main, 0.05),
                  borderColor: theme.palette.primary.main,
                  transform: 'translateY(-1px)',
                  boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.2)}`
                }
              }}
            >
              Refresh
            </Button>
          </Grid>
        </Grid>

        {(searchTerm || statusFilter !== 'all') && (
          <Box sx={{ 
            mt: 3, 
            pt: 3, 
            borderTop: `1px solid ${alpha(theme.palette.divider, 0.5)}`,
            display: 'flex',
            alignItems: 'center',
            gap: 2,
            flexWrap: 'wrap'
          }}>
            <Typography variant="body2" sx={{ 
              color: theme.palette.text.secondary,
              fontWeight: 500
            }}>
              Active filters:
            </Typography>
            {searchTerm && (
              <Chip
                label={`Search: "${searchTerm}"`}
                onDelete={() => setSearchTerm('')}
                deleteIcon={<ClearIcon />}
                size="small"
                sx={{
                  backgroundColor: alpha(theme.palette.primary.main, 0.1),
                  color: theme.palette.primary.main,
                  fontWeight: 600,
                  '& .MuiChip-deleteIcon': {
                    color: theme.palette.primary.main,
                    '&:hover': {
                      color: theme.palette.primary.dark
                    }
                  }
                }}
              />
            )}
            {statusFilter !== 'all' && (
              <Chip
                label={`Status: ${statusFilter.charAt(0).toUpperCase() + statusFilter.slice(1)}`}
                onDelete={() => setStatusFilter('all')}
                deleteIcon={<ClearIcon />}
                size="small"
                sx={{
                  backgroundColor: alpha(theme.palette.secondary.main, 0.1),
                  color: theme.palette.secondary.main,
                  fontWeight: 600,
                  '& .MuiChip-deleteIcon': {
                    color: theme.palette.secondary.main,
                    '&:hover': {
                      color: theme.palette.secondary.dark
                    }
                  }
                }}
              />
            )}
          </Box>
        )}
      </Paper>

      {loading ? (
        <Grid container spacing={4}>
          {[...Array(6)].map((_, index) => (
            <Grid item xs={12} md={6} lg={4} key={index}>
              <Paper sx={{ 
                borderRadius: 3, 
                overflow: 'hidden',
                background: `linear-gradient(135deg, ${theme.palette.background.paper} 0%, ${alpha(theme.palette.primary.main, 0.02)} 100%)`
              }}>
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
          borderRadius: 4,
          background: `linear-gradient(135deg, ${theme.palette.background.paper} 0%, ${alpha(theme.palette.primary.main, 0.02)} 100%)`,
          border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`
        }}>
          <Box sx={{ 
            width: 80, 
            height: 80, 
            borderRadius: '50%',
            background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)}, ${alpha(theme.palette.secondary.main, 0.1)})`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            mx: 'auto',
            mb: 3
          }}>
            <ArticleIcon sx={{ fontSize: '2.5rem', color: theme.palette.primary.main }} />
          </Box>
          <Typography variant="h4" sx={{ fontWeight: 700, mb: 2, color: theme.palette.text.primary }}>
            No articles found
          </Typography>
          <Typography variant="body1" sx={{ color: theme.palette.text.secondary, mb: 4, maxWidth: 400, mx: 'auto' }}>
            {searchTerm || statusFilter !== 'all' 
              ? 'Try adjusting your search or filters to find what you\'re looking for.'
              : 'Ready to share your thoughts with the world? Create your first article and start your writing journey.'
            }
          </Typography>
          {!searchTerm && statusFilter === 'all' && (
            <Button
              variant="contained"
              size="large"
              startIcon={<AddIcon />}
              onClick={handleCreateNew}
              sx={{
                borderRadius: 3,
                px: 4,
                py: 1.5,
                textTransform: 'none',
                fontWeight: 700,
                background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                boxShadow: `0 4px 20px ${alpha(theme.palette.primary.main, 0.3)}`,
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: `0 8px 30px ${alpha(theme.palette.primary.main, 0.4)}`
                }
              }}
            >
              Create Your First Article
            </Button>
          )}
        </Paper>
      ) : (
        <Grid container spacing={4}>
          {filteredAndSortedArticles.map((article) => (
            <Grid item xs={12} sm={6} lg={4} key={article.id}>
              <WritingArticleCard
                article={article}
                onEdit={handleEdit}
                onPreview={handleView}
                onDelete={handleDelete}
                isDeleting={deleteLoading === article.id}
                showImages={showImages}
                onArticleUpdate={handleArticleUpdate}
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

      <Footer />
    </Box>
  );
};

export default WritingsPage;
