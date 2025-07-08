import React, { useState, useEffect } from 'react';
import { useParams, Link as RouterLink } from 'react-router-dom';
import { articlesAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import ReactMarkdown from 'react-markdown';
import { 
  Container, 
  Typography, 
  Box, 
  CircularProgress, 
  Alert, 
  Divider,
  Chip,
  Button,
  Grid,
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  TextField,
  IconButton,
  Tooltip,
  Paper,
  Switch,
  FormControlLabel
} from '@mui/material';
import { 
  Brightness4 as DarkModeIcon, 
  Brightness7 as LightModeIcon,
  MenuBook as ReadingModeIcon 
} from '@mui/icons-material';
import { Helmet } from 'react-helmet';
import Layout from '../components/Layout/Layout';
import { format } from 'date-fns';
import { styled } from '@mui/material/styles';
import { createTheme, ThemeProvider } from '@mui/material/styles';

// Theme toggle component
const ThemeToggleContainer = styled(Box)(({ theme }) => ({
  position: 'fixed',
  top: '50%',
  right: theme.spacing(2),
  transform: 'translateY(-50%)',
  zIndex: 1000,
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(1),
  [theme.breakpoints.down('md')]: {
    position: 'static',
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: theme.spacing(2),
    transform: 'none',
  },
}));

const ThemeToggleButton = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(1),
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: theme.spacing(1),
  backgroundColor: theme.palette.mode === 'dark' 
    ? 'rgba(255, 255, 255, 0.08)' 
    : 'rgba(0, 0, 0, 0.04)',
  backdropFilter: 'blur(10px)',
  border: `1px solid ${theme.palette.mode === 'dark' 
    ? 'rgba(255, 255, 255, 0.12)' 
    : 'rgba(0, 0, 0, 0.08)'}`,
  borderRadius: theme.spacing(2),
  [theme.breakpoints.down('md')]: {
    flexDirection: 'row',
    padding: theme.spacing(1, 2),
  },
}));

// Enhanced container with optimized content width
const ArticleContainer = styled(Container)(({ theme }) => ({
  maxWidth: '1200px',
  paddingTop: theme.spacing(6),
  paddingBottom: theme.spacing(8),
  marginTop: theme.spacing(8),
}));

// Main content column optimized for reading (45-75 characters per line)
const MainContent = styled(Box)(({ theme }) => ({
  maxWidth: '680px', // Optimized for ~66 characters per line
  margin: '0 auto',
  [theme.breakpoints.up('lg')]: {
    maxWidth: '720px',
  },
  [theme.breakpoints.down('md')]: {
    maxWidth: '100%',
    paddingLeft: theme.spacing(2),
    paddingRight: theme.spacing(2),
  },
}));

// Enhanced floating image with better mobile handling
const FloatingImage = styled('img')(({ theme }) => ({
  float: 'right',
  width: '320px',
  height: '220px',
  objectFit: 'cover',
  borderRadius: theme.spacing(1.5),
  marginLeft: theme.spacing(4),
  marginBottom: theme.spacing(3),
  marginTop: theme.spacing(11),
  boxShadow: theme.shadows[6],
  [theme.breakpoints.down('lg')]: {
    width: '280px',
    height: '190px',
    marginLeft: theme.spacing(3),
  },
  [theme.breakpoints.down('md')]: {
    float: 'none',
    width: '100%',
    height: '280px',
    marginLeft: 0,
    marginBottom: theme.spacing(4),
    marginTop: theme.spacing(2),
  },
}));

// Enhanced article header with improved spacing
const ArticleHeader = styled(Box)(({ theme }) => ({
  marginBottom: theme.spacing(6),
  paddingBottom: theme.spacing(4),
  borderBottom: `1px solid ${theme.palette.mode === 'dark' 
    ? 'rgba(255, 255, 255, 0.08)' 
    : 'rgba(0, 0, 0, 0.08)'}`,
}));

// Enhanced title with optimal readability
const ArticleTitle = styled(Typography)(({ theme }) => ({
  fontWeight: 700,
  marginBottom: theme.spacing(4),
  fontSize: '2.25rem',
  lineHeight: 1.15, // Tighter for headlines
  letterSpacing: '-0.025em',
  color: theme.palette.mode === 'dark' ? '#E8E3D3' : '#1A1A1A',
  fontFamily: '"Inter", "Segoe UI", "Roboto", sans-serif',
  [theme.breakpoints.down('md')]: {
    fontSize: '1.9rem',
  },
  [theme.breakpoints.down('sm')]: {
    fontSize: '1.7rem',
    lineHeight: 1.2,
  },
}));

// Enhanced metadata section
const MetadataSection = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  flexWrap: 'wrap',
  gap: theme.spacing(2),
  marginBottom: theme.spacing(3),
  color: theme.palette.mode === 'dark' ? '#C0B8A8' : theme.palette.text.secondary,
}));

// Enhanced tags section with better spacing
const TagsSection = styled(Box)(({ theme }) => ({
  marginBottom: theme.spacing(4),
  '& .MuiChip-root': {
    marginRight: theme.spacing(1),
    marginBottom: theme.spacing(1),
    backgroundColor: theme.palette.mode === 'dark' 
      ? 'rgba(232, 227, 211, 0.08)' 
      : 'rgba(0, 0, 0, 0.08)',
    color: theme.palette.mode === 'dark' ? '#D0C8B8' : theme.palette.text.primary,
    '&:hover': {
      backgroundColor: theme.palette.mode === 'dark' 
        ? 'rgba(232, 227, 211, 0.12)' 
        : 'rgba(0, 0, 0, 0.12)',
    },
  },
}));

// Enhanced content section with optimal readability and softer dark mode colors
const ContentSection = styled(Box)(({ theme }) => ({
  '& img': { 
    maxWidth: '100%', 
    height: 'auto',
    borderRadius: theme.spacing(1),
    marginTop: theme.spacing(4),
    marginBottom: theme.spacing(4),
    boxShadow: theme.shadows[4],
  },
  '& h1, & h2, & h3, & h4, & h5, & h6': {
    marginTop: theme.spacing(6),
    marginBottom: theme.spacing(3),
    clear: 'both',
    fontWeight: 600,
    lineHeight: 1.25,
    letterSpacing: '-0.015em',
    color: theme.palette.mode === 'dark' ? '#E8E3D3' : '#1A1A1A',
    fontFamily: '"Inter", "Segoe UI", "Roboto", sans-serif',
  },
  '& h2': {
    fontSize: '1.8rem',
    marginTop: theme.spacing(7),
    marginBottom: theme.spacing(3.5),
  },
  '& h3': {
    fontSize: '1.5rem',
    marginTop: theme.spacing(5),
    marginBottom: theme.spacing(2.5),
  },
  '& h4': {
    fontSize: '1.3rem',
    marginTop: theme.spacing(4),
    marginBottom: theme.spacing(2),
  },
  '& p': {
    marginBottom: theme.spacing(3),
    lineHeight: 1.8, // Increased for better readability
    fontSize: '1.125rem', // 18px - optimal for reading
    textAlign: 'left', // Changed from justify for better readability
    color: theme.palette.mode === 'dark' ? '#D8D0C0' : '#2D2D2D',
    letterSpacing: '0.012em',
    fontFamily: '"Source Serif Pro", "Georgia", serif', // Serif for body text
    fontWeight: 400,
    maxWidth: '100%',
    // Improve text rendering
    WebkitFontSmoothing: 'antialiased',
    MozOsxFontSmoothing: 'grayscale',
  },
  '& ul, & ol': {
    marginBottom: theme.spacing(3),
    paddingLeft: theme.spacing(3),
    '& li': {
      marginBottom: theme.spacing(1.5),
      lineHeight: 1.7,
      fontSize: '1.125rem',
      color: theme.palette.mode === 'dark' ? '#D8D0C0' : '#2D2D2D',
      fontFamily: '"Source Serif Pro", "Georgia", serif',
      '& p': {
        marginBottom: theme.spacing(1),
      },
    },
  },
  '& blockquote': {
    marginLeft: 0,
    marginRight: 0,
    marginTop: theme.spacing(5),
    marginBottom: theme.spacing(5),
    paddingLeft: theme.spacing(4),
    paddingTop: theme.spacing(3),
    paddingBottom: theme.spacing(3),
    paddingRight: theme.spacing(3),
    borderLeft: `4px solid ${theme.palette.primary.main}`,
    backgroundColor: theme.palette.mode === 'dark' 
      ? 'rgba(232, 227, 211, 0.04)' 
      : 'rgba(0, 0, 0, 0.04)',
    borderRadius: theme.spacing(0.5),
    fontStyle: 'italic',
    fontSize: '1.2rem',
    lineHeight: 1.6,
    color: theme.palette.mode === 'dark' ? '#C8C0B0' : '#4A4A4A',
    fontFamily: '"Source Serif Pro", "Georgia", serif',
    '& p': {
      fontSize: '1.2rem',
      marginBottom: theme.spacing(1),
    },
  },
  '& code': {
    backgroundColor: theme.palette.mode === 'dark' 
      ? 'rgba(232, 227, 211, 0.1)' 
      : 'rgba(0, 0, 0, 0.08)',
    color: theme.palette.mode === 'dark' ? '#F0C674' : '#C7254E',
    padding: theme.spacing(0.25, 0.75),
    borderRadius: theme.spacing(0.5),
    fontSize: '0.95rem',
    fontFamily: '"JetBrains Mono", "Monaco", "Consolas", monospace',
    fontWeight: 500,
  },
  '& pre': {
    backgroundColor: theme.palette.mode === 'dark' 
      ? 'rgba(232, 227, 211, 0.06)' 
      : 'rgba(0, 0, 0, 0.06)',
    padding: theme.spacing(3),
    borderRadius: theme.spacing(1),
    overflow: 'auto',
    marginTop: theme.spacing(4),
    marginBottom: theme.spacing(4),
    fontSize: '0.95rem',
    lineHeight: 1.5,
    '& code': {
      backgroundColor: 'transparent',
      padding: 0,
      color: theme.palette.mode === 'dark' ? '#D8D0C0' : '#2D2D2D',
    },
  },
  '& strong': {
    fontWeight: 600,
    color: theme.palette.mode === 'dark' ? '#E8E3D3' : '#1A1A1A',
  },
  '& em': {
    fontStyle: 'italic',
    color: theme.palette.mode === 'dark' ? '#D0C8B8' : '#404040',
  },
  // Better link styling
  '& a': {
    color: theme.palette.primary.main,
    textDecoration: 'underline',
    textDecorationThickness: '1px',
    textUnderlineOffset: '3px',
    '&:hover': {
      textDecorationThickness: '2px',
    },
  },
  // Improve table readability if present
  '& table': {
    width: '100%',
    marginTop: theme.spacing(4),
    marginBottom: theme.spacing(4),
    borderCollapse: 'collapse',
    '& th, & td': {
      padding: theme.spacing(2),
      borderBottom: `1px solid ${theme.palette.mode === 'dark' 
        ? 'rgba(232, 227, 211, 0.1)' 
        : 'rgba(0, 0, 0, 0.1)'}`,
      fontSize: '1.125rem',
      lineHeight: 1.6,
    },
    '& th': {
      fontWeight: 600,
      backgroundColor: theme.palette.mode === 'dark' 
        ? 'rgba(232, 227, 211, 0.05)' 
        : 'rgba(0, 0, 0, 0.05)',
    },
  },
}));

// Enhanced section divider
const SectionDivider = styled(Divider)(({ theme }) => ({
  marginTop: theme.spacing(6),
  marginBottom: theme.spacing(6),
  backgroundColor: theme.palette.mode === 'dark' 
    ? 'rgba(232, 227, 211, 0.08)' 
    : 'rgba(0, 0, 0, 0.08)',
  height: '2px',
}));

// Enhanced comments section
const CommentsSection = styled(Box)(({ theme }) => ({
  marginTop: theme.spacing(8),
  paddingTop: theme.spacing(4),
  borderTop: `2px solid ${theme.palette.mode === 'dark' 
    ? 'rgba(232, 227, 211, 0.08)' 
    : 'rgba(0, 0, 0, 0.08)'}`,
}));

// Enhanced comment item styling
const CommentItem = styled(ListItem)(({ theme }) => ({
  marginBottom: theme.spacing(3),
  backgroundColor: theme.palette.mode === 'dark' 
    ? 'rgba(232, 227, 211, 0.02)' 
    : 'rgba(0, 0, 0, 0.02)',
  borderRadius: theme.spacing(1),
  padding: theme.spacing(2),
  '&:hover': {
    backgroundColor: theme.palette.mode === 'dark' 
      ? 'rgba(232, 227, 211, 0.04)' 
      : 'rgba(0, 0, 0, 0.04)',
  },
}));

// Create custom theme with softer dark mode colors
const createCustomTheme = (mode) => createTheme({
  palette: {
    mode,
    ...(mode === 'light'
      ? {
          // Light theme colors
          primary: {
            main: '#1976d2',
          },
          background: {
            default: '#ffffff',
            paper: '#ffffff',
          },
          text: {
            primary: '#2D2D2D',
            secondary: '#666666',
          },
        }
      : {
          // Dark theme colors with warmer, softer tones
          primary: {
            main: '#90caf9',
          },
          background: {
            default: '#1a1a1a',
            paper: '#1e1e1e',
          },
          text: {
            primary: '#E8E3D3',
            secondary: '#C0B8A8',
          },
        }),
  },
  typography: {
    fontFamily: '"Inter", "Segoe UI", "Roboto", sans-serif',
  },
});

const ArticlePage = () => {
  const { id } = useParams();
  const [article, setArticle] = useState(null);
  const [articleImage, setArticleImage] = useState(null);
  const [comments, setComments] = useState([]);
  const [commentsCount, setCommentsCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [commentLoading, setCommentLoading] = useState(false);
  const [error, setError] = useState(null);
  const [commentError, setCommentError] = useState(null);
  const [newComment, setNewComment] = useState('');
  const [commentSuccess, setCommentSuccess] = useState(null);
  
  // Theme state - default to light mode for better reading experience
  const [themeMode, setThemeMode] = useState(() => {
    const savedTheme = localStorage.getItem('article-theme-preference');
    return savedTheme || 'light';
  });

  // Create theme instance
  const theme = createCustomTheme(themeMode);

  // Handle theme toggle
  const handleThemeToggle = () => {
    const newMode = themeMode === 'light' ? 'dark' : 'light';
    setThemeMode(newMode);
    localStorage.setItem('article-theme-preference', newMode);
  };

  const getAuthorName = (article) => {
    const capitalize = (str) => str ? str.charAt(0).toUpperCase() + str.slice(1).toLowerCase() : '';
    const authorFirst = capitalize(article?.author_first_name || '');
    const authorLast = capitalize(article?.author_last_name || '');
    return (authorFirst || authorLast) ? `${authorFirst} ${authorLast}`.trim() : 'Unknown Author';
  };

  useEffect(() => {
    const fetchArticleData = async () => {
      try {
        setLoading(true);
        
        const articleResponse = await articlesAPI.getById(id);
        if (!articleResponse.data.id) {
          throw new Error('Article not found');
        }
        setArticle(articleResponse.data);

        const imageResponse = await articlesAPI.getImages(id);
        const firstImage = imageResponse.data.images?.[0];
        if (firstImage?.url) {
          setArticleImage(firstImage.url);
        }

        const commentsResponse = await articlesAPI.getComments(id);
        if (commentsResponse.data) {
          setComments(commentsResponse.data.comments || []);
          setCommentsCount(commentsResponse.data.count || 0);
        }
      } catch (err) {
        console.error('Error fetching data:', err);
        setError(err.message || 'Failed to load article');
      } finally {
        setLoading(false);
      }
    };

    fetchArticleData();
  }, [id]);

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    
    if (!newComment.trim()) return;

    try {
      setCommentLoading(true);
      setCommentError(null);
      setCommentSuccess(null); // Reset success message

      const response = await articlesAPI.postComment(id, newComment.trim());
      
      if (response.data.status === '1') {
        // Refresh comments
        const commentsResponse = await articlesAPI.getComments(id);
        setComments(commentsResponse.data.comments || []);
        setCommentsCount(commentsResponse.data.count || 0);
        setNewComment('');
        setCommentSuccess('Comment posted successfully!');
      }
    } catch (err) {
      console.error('Comment submission error:', err);
      
      // Handle session-related errors
      if (err.response?.status === 403 || err.response?.status === 401) {
        setCommentError('Please login to post comments');
      } else {
        setCommentError(err.response?.data?.error || 'Failed to post comment');
      }
    } finally {
      setCommentLoading(false);
    }
  };

  if (loading) {
    return (
      <ThemeProvider theme={theme}>
        <Layout>
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
            <CircularProgress />
          </Box>
        </Layout>
      </ThemeProvider>
    );
  }

  if (error || !article) {
    return (
      <ThemeProvider theme={theme}>
        <Layout>
          <Container maxWidth="sm" sx={{ textAlign: 'center', py: 5 }}>
            <Typography variant="h4" gutterBottom>Article Not Found</Typography>
            <Alert severity="error" sx={{ mb: 2 }}>
              {error || 'We couldn\'t find the article you were looking for.'}
            </Alert>
            <Button 
              component={RouterLink} 
              to="/" 
              variant="contained" 
              sx={{ mt: 2 }}
            >
              Back to Home
            </Button>
          </Container>
        </Layout>
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider theme={theme}>
      <Layout>
        <Helmet>
          <title>{article.title} | Cognara</title>
          <meta name="description" content={article.content.substring(0, 160)} />
        </Helmet>
        
        {/* Theme Toggle Controls */}
        <ThemeToggleContainer>
          <ThemeToggleButton elevation={3}>
            <Tooltip title={`Switch to ${themeMode === 'light' ? 'dark' : 'light'} mode`}>
              <IconButton 
                onClick={handleThemeToggle} 
                color="inherit"
                size="large"
              >
                {themeMode === 'light' ? <DarkModeIcon /> : <LightModeIcon />}
              </IconButton>
            </Tooltip>
            <Typography variant="caption" sx={{ textAlign: 'center', fontSize: '0.7rem' }}>
              {themeMode === 'light' ? 'Dark' : 'Light'}
            </Typography>
          </ThemeToggleButton>
        </ThemeToggleContainer>
        
        <ArticleContainer maxWidth="false">
          <MainContent>
            {/* Mobile Theme Toggle */}
            <Box sx={{ display: { xs: 'block', md: 'none' }, mb: 3 }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={themeMode === 'dark'}
                    onChange={handleThemeToggle}
                    color="primary"
                  />
                }
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <ReadingModeIcon fontSize="small" />
                    <Typography variant="body2">
                      {themeMode === 'light' ? 'Light Mode' : 'Dark Mode'}
                    </Typography>
                  </Box>
                }
              />
            </Box>

            {/* Enhanced Article Header */}
            <ArticleHeader>
              <ArticleTitle variant="h1" component="h1">
                {article.title}
              </ArticleTitle>
              
              <MetadataSection>
                <Typography variant="body1" sx={{ fontWeight: 500 }}>
                  By {getAuthorName(article)}
                </Typography>
                <Chip 
                  label={new Date(article.created_at).toLocaleDateString()} 
                  size="small"
                  variant="outlined"
                />
              </MetadataSection>
              
              {article.tags && (
                <TagsSection>
                  {article.tags.split(',').map((tag, index) => (
                    <Chip 
                      key={index} 
                      label={tag.trim()} 
                      size="small"
                      variant="filled"
                    />
                  ))}
                </TagsSection>
              )}

              {/* Enhanced floating image */}
              {articleImage && (
                <FloatingImage
                  src={articleImage}
                  alt={article.title}
                />
              )}
            </ArticleHeader>

            {/* Enhanced Article Content */}
            <ContentSection>
              <ReactMarkdown>{article.content}</ReactMarkdown>
            </ContentSection>
          </MainContent>


          {/* Enhanced Comments Section */}
          <MainContent>
            <CommentsSection>
              <Typography 
                variant="h4" 
                gutterBottom 
                sx={{ 
                  fontWeight: 600,
                  mb: 4,
                  color: theme => theme.palette.mode === 'dark' ? '#E8E3D3' : theme.palette.text.primary
                }}
              >
                Comments ({commentsCount})
              </Typography>

              {/* Enhanced Comments List */}
              <List sx={{ mb: 4 }}>
                {comments.length === 0 ? (
                  <Typography 
                    variant="body1" 
                    sx={{ 
                      color: theme => theme.palette.mode === 'dark' ? '#C0B8A8' : theme.palette.text.secondary,
                      textAlign: 'center',
                      py: 4,
                      fontStyle: 'italic'
                    }}
                  >
                    No comments yet. Be the first to share your thoughts!
                  </Typography>
                ) : (
                  comments.map((comment) => (
                    <CommentItem key={comment.id} alignItems="flex-start">
                      <ListItemAvatar>
                        <Avatar 
                          alt={comment.username || 'Anonymous'}
                          sx={{ 
                            bgcolor: theme => theme.palette.primary.main,
                            color: theme => theme.palette.primary.contrastText
                          }}
                        />
                      </ListItemAvatar>
                      <ListItemText
                        primary={
                          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                            <Typography 
                              variant="subtitle1" 
                              component="span" 
                              sx={{ 
                                fontWeight: 600,
                                color: theme => theme.palette.mode === 'dark' ? '#E8E3D3' : theme.palette.text.primary
                              }}
                            >
                              {comment.username || 'Anonymous'}
                            </Typography>
                            <Typography 
                              variant="caption" 
                              sx={{ 
                                ml: 2,
                                color: theme => theme.palette.mode === 'dark' ? '#C0B8A8' : theme.palette.text.secondary
                              }}
                            >
                              {format(new Date(comment.created_at), 'MMM d, yyyy h:mm a')}
                            </Typography>
                          </Box>
                        }
                        secondary={
                          <>
                            <Typography
                              component="span"
                              variant="body1"
                              sx={{ 
                                whiteSpace: 'pre-line',
                                lineHeight: 1.6,
                                color: theme => theme.palette.mode === 'dark' ? '#D0C8B8' : theme.palette.text.primary
                              }}
                            >
                              {comment.content}
                            </Typography>
                            {comment.parent_id && (
                              <Box sx={{ 
                                mt: 2, 
                                p: 2, 
                                bgcolor: theme => theme.palette.mode === 'dark' 
                                  ? 'rgba(232, 227, 211, 0.05)' 
                                  : 'rgba(0, 0, 0, 0.05)',
                                borderLeft: '3px solid',
                                borderColor: 'primary.main',
                                borderRadius: 1
                              }}>
                                <Typography 
                                  variant="caption" 
                                  sx={{ 
                                    color: theme => theme.palette.mode === 'dark' ? '#C0B8A8' : theme.palette.text.secondary
                                  }}
                                >
                                  Replying to {comments.find(c => c.id === comment.parent_id)?.username || 'Anonymous'}
                                </Typography>
                                <Typography 
                                  variant="body2" 
                                  sx={{ 
                                    mt: 0.5,
                                    color: theme => theme.palette.mode === 'dark' ? '#C8C0B0' : theme.palette.text.secondary
                                  }}
                                >
                                  {comments.find(c => c.id === comment.parent_id)?.content}
                                </Typography>
                              </Box>
                            )}
                          </>
                        }
                      />
                    </CommentItem>
                  ))
                )}
              </List>

              {/* Enhanced Comment Form */}
              <Box 
                component="form" 
                onSubmit={handleCommentSubmit} 
                sx={{ 
                  p: 3,
                  backgroundColor: theme => theme.palette.mode === 'dark' 
                    ? 'rgba(232, 227, 211, 0.03)' 
                    : 'rgba(0, 0, 0, 0.03)',
                  borderRadius: 2,
                  border: theme => `1px solid ${theme.palette.mode === 'dark' 
                    ? 'rgba(232, 227, 211, 0.08)' 
                    : 'rgba(0, 0, 0, 0.08)'}`
                }}
              >
                <TextField
                  fullWidth
                  multiline
                  rows={4}
                  variant="outlined"
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Share your thoughts..."
                  disabled={commentLoading}
                  sx={{
                    mb: 2,
                    '& .MuiOutlinedInput-root': {
                      backgroundColor: theme => theme.palette.mode === 'dark' 
                        ? 'rgba(232, 227, 211, 0.05)' 
                        : 'rgba(255, 255, 255, 0.8)',
                      '& fieldset': {
                        borderColor: theme => theme.palette.mode === 'dark' 
                          ? 'rgba(232, 227, 211, 0.1)' 
                          : 'rgba(0, 0, 0, 0.1)',
                      },
                      '&:hover fieldset': {
                        borderColor: theme => theme.palette.mode === 'dark' 
                          ? 'rgba(232, 227, 211, 0.2)' 
                          : 'rgba(0, 0, 0, 0.2)',
                      },
                    },
                  }}
                />
                <Button
                  type="submit"
                  variant="contained"
                  size="large"
                  disabled={!newComment.trim() || commentLoading}
                  sx={{
                    px: 4,
                    py: 1.5,
                    fontWeight: 600,
                  }}
                >
                  {commentLoading ? <CircularProgress size={24} /> : 'Post Comment'}
                </Button>
                {commentError && (
                  <Alert severity="error" sx={{ mt: 2 }}>
                    {commentError}
                  </Alert>
                )}
              </Box>
            </CommentsSection>
          </MainContent>
        </ArticleContainer>
      </Layout>
    </ThemeProvider>
  );
};

export default ArticlePage;