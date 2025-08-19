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

const MINIMUM_READ_TIME = 10; // seconds before considering it a valid read



// Simplified and robust useReadingTracker hook

const useReadingTracker = (article, user) => {
  const [readingState, setReadingState] = useState({
    scrollDepth: 0,
    activeTimeSeconds: 0,
    sessionId: null,
    status: 'not_started',
    lastLogTime: 0
  });

  const trackingRef = useRef({
    isLogging: false,
    sessionId: null,
    startTime: Date.now(),
    lastActiveTime: Date.now(),
    totalActiveTime: 0,
    maxScrollDepth: 0,
    lastLoggedScrollDepth: 0,
    isTabVisible: !document.hidden,
    isUnloading: false,
    animationFrameId: null,
    hasInitialized: false,
    lastLogTime: 0,
    lastLoggedActiveTime: 0,
    intervals: [] // Track intervals for cleanup
  });

  // Calculate scroll depth
  const calculateScrollDepth = useCallback(() => {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const windowHeight = window.innerHeight;
    const documentHeight = document.documentElement.scrollHeight;
    
    if (documentHeight <= windowHeight) return 100;
    
    const scrollableHeight = documentHeight - windowHeight;
    const scrollDepth = Math.min(100, Math.max(0, (scrollTop / scrollableHeight) * 100));
    return Math.round(scrollDepth * 100) / 100;
  }, []);

  // Update active time
  const updateActiveTime = useCallback(() => {
    if (trackingRef.current.isUnloading || !trackingRef.current.isTabVisible) return;

    const now = Date.now();
    const timeDiff = now - trackingRef.current.lastActiveTime;
    
    if (timeDiff < 5000) { // Only count reasonable time gaps
      trackingRef.current.totalActiveTime += timeDiff;
    }
    
    trackingRef.current.lastActiveTime = now;
    
    const activeTimeSeconds = Math.floor(trackingRef.current.totalActiveTime / 1000);
    setReadingState(prev => ({ ...prev, activeTimeSeconds }));
  }, []);

  // Check for recoverable session (very recent only)
  const getRecoverableSession = useCallback(() => {
    if (!article?.id) return null;
    
    const storageKey = `reading_session_${article.id}`;
    const storedSessionId = localStorage.getItem(storageKey);
    const storedTimestamp = localStorage.getItem(`${storageKey}_timestamp`);
    
    if (!storedSessionId || !storedTimestamp) return null;
    
    // Only recover if less than 2 minutes old (page refresh scenario)
    const age = Date.now() - parseInt(storedTimestamp);
    if (age < 2 * 60 * 1000) {
      return storedSessionId;
    }
    
    // Clear old storage
    localStorage.removeItem(storageKey);
    localStorage.removeItem(`${storageKey}_timestamp`);
    return null;
  }, [article?.id]);

  const saveSessionToStorage = useCallback((sessionId) => {
    if (!article?.id) return;
    
    const storageKey = `reading_session_${article.id}`;
    localStorage.setItem(storageKey, sessionId);
    localStorage.setItem(`${storageKey}_timestamp`, Date.now().toString());
  }, [article?.id]);

  const clearSessionStorage = useCallback(() => {
    if (!article?.id) return;
    
    const storageKey = `reading_session_${article.id}`;
    localStorage.removeItem(storageKey);
    localStorage.removeItem(`${storageKey}_timestamp`);
  }, [article?.id]);

  const logReadingProgress = useCallback(async (forceLog = false, reason = 'periodic') => {
    if (!article?.id || !user?.id || trackingRef.current.isLogging) return;

    const now = Date.now();
    const timeSinceLastLog = now - trackingRef.current.lastLogTime;
    
    if (!forceLog && timeSinceLastLog < 5000) return;

    trackingRef.current.isLogging = true;
    
    try {
      const activeTime = Math.floor(trackingRef.current.totalActiveTime / 1000);
      const scrollDepth = Math.round(trackingRef.current.maxScrollDepth * 100) / 100;

      let status = reason === 'completed' ? 'completed' : 
                   trackingRef.current.sessionId ? 'in_progress' : 'started';

      const logData = {
        user_id: parseInt(user.id),
        article_id: parseInt(article.id),
        status,
        scroll_depth: scrollDepth,
        active_time_seconds: activeTime,
        session_id: trackingRef.current.sessionId
      };

      console.log('Logging reading progress:', { ...logData, reason });

      const response = await articlesAPI.logArticleRead(logData);

      if (response?.session_id) {
        trackingRef.current.sessionId = response.session_id;
        setReadingState(prev => ({ ...prev, sessionId: response.session_id }));
        saveSessionToStorage(response.session_id);
      }

      trackingRef.current.lastLogTime = now;
      trackingRef.current.lastLoggedScrollDepth = scrollDepth;
      trackingRef.current.lastLoggedActiveTime = activeTime;

    } catch (error) {
      console.error('Failed to log reading progress:', error);
      
      if (error.response?.status === 409) {
        trackingRef.current.sessionId = null;
        setReadingState(prev => ({ ...prev, sessionId: null }));
        clearSessionStorage();
      }
    } finally {
      trackingRef.current.isLogging = false;
    }
  }, [article, user, saveSessionToStorage, clearSessionStorage]);

  // Update scroll tracking
  const updateScrollDepth = useCallback(() => {
    const updateScroll = () => {
      if (trackingRef.current.isUnloading) return;

      const scrollDepth = calculateScrollDepth();
      
      if (scrollDepth > trackingRef.current.maxScrollDepth) {
        trackingRef.current.maxScrollDepth = scrollDepth;
        setReadingState(prev => ({ ...prev, scrollDepth }));

        const scrollChange = scrollDepth - trackingRef.current.lastLoggedScrollDepth;
        const timeSinceLastLog = Date.now() - trackingRef.current.lastLogTime;
        
        if (scrollChange >= 20 && timeSinceLastLog > 10000 && trackingRef.current.sessionId) {
          logReadingProgress(false, 'scroll_update');
        }
      }

      trackingRef.current.animationFrameId = requestAnimationFrame(updateScroll);
    };

    updateScroll();
  }, [calculateScrollDepth, logReadingProgress]);

  // Handle unload
  const handleUnload = useCallback(() => {
    if (!trackingRef.current.sessionId) return;

    trackingRef.current.isUnloading = true;
    const activeTime = Math.floor(trackingRef.current.totalActiveTime / 1000);
    const finalStatus = activeTime >= MINIMUM_READ_TIME ? 'completed' : 'in_progress';
    
    const finalLogData = {
      user_id: parseInt(user.id),
      article_id: parseInt(article.id),
      session_id: trackingRef.current.sessionId,
      status: finalStatus,
      scroll_depth: Math.round(trackingRef.current.maxScrollDepth * 100) / 100,
      active_time_seconds: activeTime
    };

    navigator.sendBeacon('/log_read', new Blob([JSON.stringify(finalLogData)], { type: 'application/json' }));
    clearSessionStorage();
  }, [user, article, clearSessionStorage]);

  // Unload event listeners
  useEffect(() => {
    window.addEventListener('beforeunload', handleUnload);
    window.addEventListener('pagehide', handleUnload);
    
    return () => {
      window.removeEventListener('beforeunload', handleUnload);
      window.removeEventListener('pagehide', handleUnload);
    };
  }, [handleUnload]);

  // Visibility change
  useEffect(() => {
    const handleVisibilityChange = () => {
      trackingRef.current.isTabVisible = !document.hidden;
      if (trackingRef.current.isTabVisible) {
        trackingRef.current.lastActiveTime = Date.now();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  // MAIN INITIALIZATION EFFECT - Simplified
  useEffect(() => {
    if (!article?.id || !user?.id || trackingRef.current.hasInitialized) return;

    console.log('Initializing reading tracker for article:', article.id);
    trackingRef.current.hasInitialized = true;

    // Initialize state
    trackingRef.current.startTime = Date.now();
    trackingRef.current.lastActiveTime = Date.now();
    trackingRef.current.totalActiveTime = 0;
    trackingRef.current.maxScrollDepth = calculateScrollDepth();
    trackingRef.current.isUnloading = false;

    // Try to recover recent session (only within 2 minutes)
    const recoveredSessionId = getRecoverableSession();
    if (recoveredSessionId) {
      console.log('Recovering session:', recoveredSessionId);
      trackingRef.current.sessionId = recoveredSessionId;
      setReadingState(prev => ({ ...prev, sessionId: recoveredSessionId }));
    }

    // Start activity tracking
    const handleUserActivity = () => {
      trackingRef.current.lastActiveTime = Date.now();
    };

    // Time tracking interval
    const timeInterval = setInterval(updateActiveTime, 1000);
    trackingRef.current.intervals.push(timeInterval);

    // Periodic logging interval  
    const logInterval = setInterval(() => {
      if (trackingRef.current.sessionId) {
        logReadingProgress(false, 'periodic');
      }
    }, 30000);
    trackingRef.current.intervals.push(logInterval);

    // Event listeners
    window.addEventListener('mousemove', handleUserActivity, { passive: true });
    window.addEventListener('keydown', handleUserActivity, { passive: true });
    window.addEventListener('click', handleUserActivity, { passive: true });
    window.addEventListener('touchstart', handleUserActivity, { passive: true });

    // Start tracking after a brief delay
    const initTimeout = setTimeout(() => {
      logReadingProgress(true, 'started');
      updateScrollDepth();
    }, 500);

    // Cleanup function
    return () => {
      console.log('Cleaning up reading tracker');
      
      clearTimeout(initTimeout);
      
      // Clear intervals
      trackingRef.current.intervals.forEach(clearInterval);
      trackingRef.current.intervals = [];
      
      // Cancel animation frame
      if (trackingRef.current.animationFrameId) {
        cancelAnimationFrame(trackingRef.current.animationFrameId);
      }
      
      // Remove event listeners
      window.removeEventListener('mousemove', handleUserActivity);
      window.removeEventListener('keydown', handleUserActivity);
      window.removeEventListener('click', handleUserActivity);
      window.removeEventListener('touchstart', handleUserActivity);
      
      // Reset initialization state
      trackingRef.current.hasInitialized = false;
    };
  }, [article?.id, user?.id]); // Simplified dependencies

  return readingState;
};


// Updated ArticlePage component with cleaner tracking
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
          {/* Clean reading progress indicator - no visible debug info */}
          {user && (
            <Box
              sx={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                height: 3,
                backgroundColor: 'rgba(0,0,0,0.1)',
                zIndex: 1000,
              }}
            >
              <Box
                sx={{
                  height: '100%',
                  width: `${readingState.scrollDepth}%`,
                  backgroundColor: 'primary.main',
                  transition: 'width 0.2s ease-out',
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

          {/* Comments section */}
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