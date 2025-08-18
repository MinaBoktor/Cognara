import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, Link as RouterLink } from 'react-router-dom';
import { articlesAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import DOMPurify from 'dompurify';

import {
  Container,
  Typography,
  Box,
  CircularProgress,
  Alert,
  Divider,
  Chip,
  Button,
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  TextField,
  useTheme,
  Paper
} from '@mui/material';
import { Helmet } from 'react-helmet';
import { format } from 'date-fns';
import { styled } from '@mui/material/styles';

// FIX: Add 'export' to each styled component
export const ArticleContainer = styled(Container)(({ theme }) => ({
  maxWidth: '1200px',
  paddingTop: theme.spacing(6),
  paddingBottom: theme.spacing(8),
  marginTop: theme.spacing(8),
}));

export const MainContent = styled(Box)(({ theme }) => ({
  maxWidth: '680px',
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

export const ArticleHeader = styled(Box)(({ theme }) => ({
  marginBottom: theme.spacing(6),
  paddingBottom: theme.spacing(4),
  borderBottom: `1px solid ${theme.palette.divider}`,
}));

export const ArticleTitle = styled(Typography)(({ theme }) => ({
  fontWeight: 700,
  marginBottom: theme.spacing(4),
  fontSize: '2.25rem',
  lineHeight: 1.15,
  letterSpacing: '-0.025em',
  color: theme.palette.text.primary,
  fontFamily: '"Inter", "Segoe UI", "Roboto", sans-serif',
  [theme.breakpoints.down('md')]: {
    fontSize: '1.9rem',
  },
  [theme.breakpoints.down('sm')]: {
    fontSize: '1.7rem',
    lineHeight: 1.2,
  },
}));

export const MetadataSection = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  flexWrap: 'wrap',
  gap: theme.spacing(2),
  marginBottom: theme.spacing(3),
  color: theme.palette.text.secondary,
}));

export const ContentSection = styled(Box)(({ theme }) => ({
  '& img': {
    maxWidth: '100%',
    height: 'auto',
    borderRadius: theme.spacing(1),
    marginTop: theme.spacing(4),
    marginBottom: theme.spacing(4),
    boxShadow: theme.shadows[4],
  },
  '& p': {
    marginBottom: theme.spacing(3),
    lineHeight: 1.8,
    fontSize: '1.125rem',
    color: theme.palette.text.primary,
    fontFamily: '"Source Serif Pro", "Georgia", serif',
  },
}));

// Reading tracking hook
const useReadingTracker = (article, user) => {
  const [readingState, setReadingState] = useState({
    scrollDepth: 0,
    activeTimeSeconds: 0,
    requiredTimeSeconds: 0,
    isRead: false,
    status: 'started'
  });

  const trackingRef = useRef({
    startTime: Date.now(),
    lastActiveTime: Date.now(),
    lastUpdateTime: Date.now(), // Track when we last updated active time
    isTabVisible: true,
    isUserActive: false, // Start as false, set to true on first activity
    maxScrollDepth: 0,
    totalActiveTime: 0,
    lastLogTime: 0,
    hasCompletedReading: false // Track if we've already marked as completed
  });

  // Calculate estimated reading time (assuming ~200 words per minute)
  const calculateReadingTime = useCallback((content) => {
    if (!content) return 0;
    const wordCount = content.replace(/<[^>]*>/g, '').split(/\s+/).length;
    return Math.max(30, Math.ceil((wordCount / 200) * 60)); // Minimum 30 seconds
  }, []);

  // Track user activity with precise timing
  const updateActivity = useCallback(() => {
    const now = Date.now();
    
    // If user was previously inactive, start tracking from this moment
    if (!trackingRef.current.isUserActive) {
      trackingRef.current.lastUpdateTime = now;
    } else {
      // User was already active, add the time since last update
      const timeSinceLastUpdate = now - trackingRef.current.lastUpdateTime;
      
      // Only count time if it's reasonable (not more than 5 seconds gap)
      if (timeSinceLastUpdate <= 5000) {
        trackingRef.current.totalActiveTime += timeSinceLastUpdate;
      }
      
      trackingRef.current.lastUpdateTime = now;
    }
    
    trackingRef.current.lastActiveTime = now;
    trackingRef.current.isUserActive = true;
  }, []);

  // Calculate scroll depth
  const updateScrollDepth = useCallback(() => {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const windowHeight = window.innerHeight;
    const documentHeight = Math.max(
      document.body.scrollHeight,
      document.body.offsetHeight,
      document.documentElement.clientHeight,
      document.documentElement.scrollHeight,
      document.documentElement.offsetHeight
    );

    const scrollDepth = Math.min(100, (scrollTop + windowHeight) / documentHeight * 100);
    trackingRef.current.maxScrollDepth = Math.max(trackingRef.current.maxScrollDepth, scrollDepth);
    
    return scrollDepth;
  }, []);

  // Check if reading completion criteria are met
  const checkReadingCompletion = useCallback((scrollDepth, activeTime, requiredTime) => {
    const scrollThreshold = scrollDepth >= 85;
    const timeThreshold = activeTime >= (requiredTime * 0.6);
    return scrollThreshold && timeThreshold;
  }, []);

  // Log reading progress to backend
  const logReadingProgress = useCallback(async (forceLog = false, isCompletion = false) => {
    if (!article || !user) return;

    const now = Date.now();
    const timeSinceLastLog = now - trackingRef.current.lastLogTime;
    
    // Only log every 10 seconds unless forced or completion
    if (!forceLog && !isCompletion && timeSinceLastLog < 10000) return;

    try {
      const scrollDepth = trackingRef.current.maxScrollDepth;
      const activeTime = Math.floor(trackingRef.current.totalActiveTime / 1000);
      const requiredTime = calculateReadingTime(article.content);
      
      // Determine if article is "read" based on criteria
      const isRead = checkReadingCompletion(scrollDepth, activeTime, requiredTime);
      const status = isRead ? 'completed' : 'in_progress';

      // Ensure all data is properly formatted and valid
      const logData = {
        user_id: parseInt(user.id),
        article_id: parseInt(article.id),
        status: status,
        scroll_depth: Math.min(100.0, Math.max(0.0, scrollDepth)), // Keep as percentage (0-100)
        active_time_seconds: Math.max(0, activeTime),
        required_time_seconds: Math.max(0, requiredTime)
      };

      console.log('Logging reading progress:', logData);

      await articlesAPI.logArticleRead(logData);

      setReadingState({
        scrollDepth,
        activeTimeSeconds: activeTime,
        requiredTimeSeconds: requiredTime,
        isRead,
        status
      });

      trackingRef.current.lastLogTime = now;

      // Mark as completed if this is the first time reaching completion
      if (isRead && !trackingRef.current.hasCompletedReading) {
        trackingRef.current.hasCompletedReading = true;
        console.log('Article marked as read!');
      }

    } catch (error) {
      console.error('Failed to log reading progress:', error);
      console.error('Error details:', error.response?.data);
    }
  }, [article, user, calculateReadingTime, checkReadingCompletion]);

  // Update active time tracking with precise timing
  const updateActiveTime = useCallback(() => {
    if (!trackingRef.current.isTabVisible) return;

    const now = Date.now();
    
    // If user is currently active, add time since last update
    if (trackingRef.current.isUserActive) {
      const timeSinceLastUpdate = now - trackingRef.current.lastUpdateTime;
      
      // Only count reasonable time gaps (not more than 2 seconds)
      if (timeSinceLastUpdate <= 2000) {
        trackingRef.current.totalActiveTime += timeSinceLastUpdate;
      }
      
      trackingRef.current.lastUpdateTime = now;
    }
    
    // Check for inactivity - if no activity for more than 3 seconds, mark as inactive
    const timeSinceLastActivity = now - trackingRef.current.lastActiveTime;
    if (timeSinceLastActivity > 3000) {
      trackingRef.current.isUserActive = false;
    }

    // Check if user just completed reading and log immediately
    if (!trackingRef.current.hasCompletedReading) {
      const scrollDepth = trackingRef.current.maxScrollDepth;
      const activeTime = Math.floor(trackingRef.current.totalActiveTime / 1000);
      const requiredTime = calculateReadingTime(article?.content);
      
      if (checkReadingCompletion(scrollDepth, activeTime, requiredTime)) {
        logReadingProgress(true, true); // Force immediate log on completion
      }
    }
  }, [article, calculateReadingTime, checkReadingCompletion, logReadingProgress]);

  useEffect(() => {
    if (!article || !user) return;

    // Initialize required reading time
    const requiredTime = calculateReadingTime(article.content);
    setReadingState(prev => ({ ...prev, requiredTimeSeconds: requiredTime }));

    // Set up event listeners for activity tracking
    const handleScroll = () => {
      updateActivity();
      const currentScrollDepth = updateScrollDepth();
      
      // Check for immediate completion on scroll if not already completed
      if (!trackingRef.current.hasCompletedReading) {
        const activeTime = Math.floor(trackingRef.current.totalActiveTime / 1000);
        const requiredTime = calculateReadingTime(article.content);
        
        if (checkReadingCompletion(currentScrollDepth, activeTime, requiredTime)) {
          logReadingProgress(true, true); // Force immediate log on completion
        }
      }
    };

    const handleMouseMove = updateActivity;
    const handleKeyPress = updateActivity;
    const handleClick = updateActivity;

    // Tab visibility tracking
    const handleVisibilityChange = () => {
      trackingRef.current.isTabVisible = !document.hidden;
      if (!document.hidden) {
        trackingRef.current.lastActiveTime = Date.now();
      }
    };

    // Set up intervals - more frequent updates for better precision
    const activeTimeInterval = setInterval(updateActiveTime, 500); // Update every 500ms instead of 1000ms
    const logInterval = setInterval(() => logReadingProgress(false), 10000);

    // Add event listeners
    window.addEventListener('scroll', handleScroll);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('keydown', handleKeyPress);
    window.addEventListener('click', handleClick);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Initial scroll depth calculation
    updateScrollDepth();

    // Log initial state
    logReadingProgress(true);

    // Cleanup
    return () => {
      clearInterval(activeTimeInterval);
      clearInterval(logInterval);
      
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('keydown', handleKeyPress);
      window.removeEventListener('click', handleClick);
      document.removeEventListener('visibilitychange', handleVisibilityChange);

      // Final log on cleanup
      logReadingProgress(true);
    };
  }, [article, user, updateActivity, updateScrollDepth, updateActiveTime, logReadingProgress, calculateReadingTime, checkReadingCompletion]);

  return readingState;
};

const ArticlePage = ({ isDarkMode, setIsDarkMode }) => {
  const { id } = useParams();
  const { user } = useAuth();
  const [article, setArticle] = useState(null);
  const [articleImage, setArticleImage] = useState(null);
  const [comments, setComments] = useState([]);
  const [commentsCount, setCommentsCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [commentLoading, setCommentLoading] = useState(false);
  const [error, setError] = useState(null);
  const [commentError, setCommentError] = useState(null);
  const [newComment, setNewComment] = useState('');
  const theme = useTheme();

  // Use reading tracker
  const readingState = useReadingTracker(article, user);

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

      const response = await articlesAPI.postComment(id, newComment.trim());

      if (response.data.status === '1') {
        const commentsResponse = await articlesAPI.getComments(id);
        setComments(commentsResponse.data.comments || []);
        setCommentsCount(commentsResponse.data.count || 0);
        setNewComment('');
      }
    } catch (err) {
      console.error('Comment submission error:', err);

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
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error || !article) {
    return (
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
    );
  }

  return (
    <>
      <Helmet>
        <title>{article.title} | Cognara</title>
        <meta name="description" content={article.content.substring(0, 160)} />
      </Helmet>

      <ArticleContainer maxWidth="false">
        <MainContent>
          {/* Reading progress indicator - only shows scroll progress, not completion status */}
          {user && (
            <Box
              sx={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                height: 4,
                backgroundColor: 'rgba(0,0,0,0.1)',
                zIndex: 1000,
              }}
            >
              <Box
                sx={{
                  height: '100%',
                  width: `${readingState.scrollDepth}%`,
                  backgroundColor: 'primary.main',
                  transition: 'width 0.3s ease',
                }}
              />
            </Box>
          )}

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
              {/* Removed reading progress chip - users shouldn't see internal calculations */}
            </MetadataSection>

            {article.tags && (
              <Box sx={{
                marginBottom: theme.spacing(4),
                '& .MuiChip-root': {
                  marginRight: theme.spacing(1),
                  marginBottom: theme.spacing(1),
                }
              }}>
                {article.tags.split(',').map((tag, index) => (
                  <Chip
                    key={index}
                    label={tag.trim()}
                    size="small"
                    variant="filled"
                  />
                ))}
              </Box>
            )}

            {articleImage && (
              <FloatingImage
                src={articleImage}
                alt={article.title}
              />
            )}
          </ArticleHeader>

          <ContentSection
            dangerouslySetInnerHTML={{
              __html: DOMPurify.sanitize(article.content || '<p>No content available.</p>')
            }}
          />

          <Box sx={{
            marginTop: theme.spacing(8),
            paddingTop: theme.spacing(4),
            borderTop: `2px solid ${theme.palette.divider}`,
          }}>
            <Typography
              variant="h4"
              gutterBottom
              sx={{
                fontWeight: 600,
                mb: 4,
                color: 'text.primary'
              }}
            >
              Comments ({commentsCount})
            </Typography>

            <List sx={{ mb: 4 }}>
              {comments.length === 0 ? (
                <Typography
                  variant="body1"
                  sx={{
                    color: 'text.secondary',
                    textAlign: 'center',
                    py: 4,
                    fontStyle: 'italic'
                  }}
                >
                  No comments yet. Be the first to share your thoughts!
                </Typography>
              ) : (
                comments.map((comment) => (
                  <ListItem
                    key={comment.id}
                    alignItems="flex-start"
                    sx={{
                      marginBottom: theme.spacing(3),
                      backgroundColor: theme.palette.mode === 'dark'
                        ? 'rgba(232, 227, 211, 0.02)'
                        : 'rgba(0, 0, 0, 0.02)',
                      borderRadius: theme.spacing(1),
                      padding: theme.spacing(2),
                    }}
                  >
                    <ListItemAvatar>
                      <Avatar
                        alt={comment.username || 'Anonymous'}
                        sx={{
                          bgcolor: 'primary.main',
                          color: 'primary.contrastText'
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
                              color: 'text.primary'
                            }}
                          >
                            {comment.username || 'Anonymous'}
                          </Typography>
                          <Typography
                            variant="caption"
                            sx={{
                              ml: 2,
                              color: 'text.secondary'
                            }}
                          >
                            {format(new Date(comment.created_at), 'MMM d, yyyy h:mm a')}
                          </Typography>
                        </Box>
                      }
                      secondary={
                        <Typography
                          component="span"
                          variant="body1"
                          sx={{
                            whiteSpace: 'pre-line',
                            lineHeight: 1.6,
                            color: 'text.primary'
                          }}
                        >
                          {comment.content}
                        </Typography>
                      }
                    />
                  </ListItem>
                ))
              )}
            </List>
            
            {user ? (
              <Box
                component="form"
                onSubmit={handleCommentSubmit}
                sx={{
                  p: 3,
                  backgroundColor: theme.palette.mode === 'dark'
                    ? 'rgba(232, 227, 211, 0.03)'
                    : 'rgba(0, 0, 0, 0.03)',
                  borderRadius: 2,
                  border: `1px solid ${theme.palette.divider}`
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
                    mt: 2
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
            ) : (
              <Paper
                elevation={2}
                sx={{
                  p: 3,
                  textAlign: 'center',
                  backgroundColor: theme.palette.mode === 'dark' ? 'grey.900' : 'grey.100',
                  border: `1px solid ${theme.palette.divider}`
                }}
              >
                <Typography variant="h6" gutterBottom>
                  Want to join the conversation?
                </Typography>
                <Typography color="text.secondary" sx={{ mb: 2 }}>
                  Please log in to post a comment.
                </Typography>
                <Button
                  variant="contained"
                  component={RouterLink}
                  to="/login"
                >
                  Login
                </Button>
              </Paper>
            )}
          </Box>
        </MainContent>
      </ArticleContainer>
    </>
  );
};

export default ArticlePage;