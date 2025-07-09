import React, { useState, useEffect } from 'react';
import { useParams, Link as RouterLink } from 'react-router-dom';
import { articlesAPI } from '../services/api';
import { useAuth } from '../context/AuthContext'; // 1. Import useAuth
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
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  TextField,
  useTheme,
  Paper // Import Paper for the login prompt
} from '@mui/material';
import { Helmet } from 'react-helmet';
import { format } from 'date-fns';
import { styled } from '@mui/material/styles';

// Enhanced container with optimized content width
const ArticleContainer = styled(Container)(({ theme }) => ({
  maxWidth: '1200px',
  paddingTop: theme.spacing(6),
  paddingBottom: theme.spacing(8),
  marginTop: theme.spacing(8),
}));

// Main content column optimized for reading
const MainContent = styled(Box)(({ theme }) => ({
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
  borderBottom: `1px solid ${theme.palette.divider}`,
}));

// Enhanced title with optimal readability
const ArticleTitle = styled(Typography)(({ theme }) => ({
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

// Enhanced metadata section
const MetadataSection = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  flexWrap: 'wrap',
  gap: theme.spacing(2),
  marginBottom: theme.spacing(3),
  color: theme.palette.text.secondary,
}));

// Enhanced content section with optimal readability
const ContentSection = styled(Box)(({ theme }) => ({
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

const ArticlePage = ({ isDarkMode, setIsDarkMode }) => {
  const { id } = useParams();
  const { user } = useAuth(); // 2. Get the user from the Auth context
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

          <ContentSection>
            <ReactMarkdown>{article.content}</ReactMarkdown>
          </ContentSection>

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

            {/* 3. Conditionally render the comment form or a login prompt */}
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