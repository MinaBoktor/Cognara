import React, { useState, useEffect } from 'react';
import { useParams, Link as RouterLink } from 'react-router-dom';
import { articlesAPI } from '../services/api';
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
  TextField
} from '@mui/material';
import { Helmet } from 'react-helmet';
import Layout from '../components/Layout/Layout';
import { format } from 'date-fns';

const ArticlePage = () => {
  const { id } = useParams();
  const [article, setArticle] = useState(null);
  const [comments, setComments] = useState([]);
  const [commentsCount, setCommentsCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [commentLoading, setCommentLoading] = useState(false);
  const [error, setError] = useState(null);
  const [commentError, setCommentError] = useState(null);
  const [newComment, setNewComment] = useState('');

  useEffect(() => {
    const fetchArticleData = async () => {
      try {
        setLoading(true);
        
        // Fetch article details
        const articleResponse = await articlesAPI.getById(id);
        if (!articleResponse.data.id) {
          throw new Error('Article not found');
        }
        setArticle(articleResponse.data);

        // Fetch comments separately
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
    // if (!newComment.trim()) return;

    // try {
    //   setCommentLoading(true);
    //   const response = await commentsAPI.create({
    //     article_id: id,
    //     content: newComment,
    //     // Add user_id if authenticated
    //   });

    //   if (response.id) {
    //     // Add the username to the new comment before adding to state
    //     const commentWithUser = {
    //       ...response,
    //       username: 'current_user' // Replace with actual username from auth
    //     };
    //     setComments([commentWithUser, ...comments]);
    //     setCommentsCount(commentsCount + 1);
    //     setNewComment('');
    //     setCommentError(null);
    //   } else {
    //     throw new Error(response.error || 'Failed to post comment');
    //   }
    // } catch (err) {
    //   setCommentError(err.message);
    //   console.error(err);
    // } finally {
    //   setCommentLoading(false);
    // }
  };

  if (loading) {
    return (
      <Layout>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
          <CircularProgress />
        </Box>
      </Layout>
    );
  }

  if (error || !article) {
    return (
      <Layout>
        <Container maxWidth="md" sx={{ textAlign: 'center', py: 5 }}>
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
    );
  }

  return (
    <Layout>
      <Helmet>
        <title>{article.title} | Cognara</title>
        <meta name="description" content={article.content.substring(0, 160)} />
      </Helmet>
      
      <Container maxWidth="false" sx={{ py: 5, marginTop: 8 }}>
        <Grid container spacing={4}>
          <Grid item xs={12} md={8}>
            {/* Article Header */}
            <Box sx={{ mb: 4 }}>
              <Typography 
                variant="h2" 
                component="h1" 
                sx={{ 
                  fontWeight: 'bold', 
                  mb: 2,
                  fontSize: { xs: '2rem', md: '2.5rem' }
                }}
              >
                {article.title}
              </Typography>
              
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Typography variant="subtitle1" color="text.secondary">
                  By {article.author_email || 'Unknown Author'}
                </Typography>
                <Chip 
                  label={new Date(article.created_at).toLocaleDateString()} 
                  size="small" 
                  sx={{ ml: 2 }} 
                />
              </Box>
              
              {article.tags && (
                <Box sx={{ mb: 2 }}>
                  {article.tags.split(',').map((tag, index) => (
                    <Chip 
                      key={index} 
                      label={tag.trim()} 
                      size="small" 
                      sx={{ mr: 1, mb: 1 }} 
                    />
                  ))}
                </Box>
              )}
            </Box>

            {/* Featured Image */}
            {article.featured_image && (
              <Box sx={{ mb: 4, borderRadius: 2, overflow: 'hidden' }}>
                <img 
                  src={article.featured_image} 
                  alt={article.title} 
                  style={{ 
                    width: '100%', 
                    height: 'auto', 
                    maxHeight: '500px',
                    objectFit: 'cover' 
                  }} 
                />
              </Box>
            )}

            <Divider sx={{ mb: 4 }} />

            {/* Article Content */}
            <Box sx={{ 
              '& img': { 
                maxWidth: '100%', 
                height: 'auto',
                borderRadius: 1,
                my: 2
              },
              '& h2': {
                mt: 4,
                mb: 2
              },
              '& p': {
                mb: 2,
                lineHeight: 1.6
              }
            }}>
              <ReactMarkdown>{article.content}</ReactMarkdown>
            </Box>
          </Grid>

          {/* Sidebar (optional) */}
          <Grid item xs={12} md={4}>
            {/* You can add related articles or other sidebar content here */}
          </Grid>
        </Grid>

        {/* Comments Section */}
        <Box sx={{ mt: 6 }}>
          <Typography variant="h5" gutterBottom sx={{ mb: 3 }}>
            Comments ({commentsCount})
          </Typography>

                    {/* Comments List */}
          <List>
            {comments.length === 0 ? (
              <Typography variant="body1" color="text.secondary">
                No comments yet. Be the first to share your thoughts!
              </Typography>
            ) : (
              comments.map((comment) => (
                <ListItem key={comment.id} alignItems="flex-start" sx={{ mb: 2 }}>
                  <ListItemAvatar>
                    <Avatar 
                      alt={comment.username || 'Anonymous'}
                      // Add this if you have user avatars
                      // src={comment.user?.avatar_url} 
                    />
                  </ListItemAvatar>
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                        <Typography variant="subtitle2" component="span" sx={{ fontWeight: 'bold' }}>
                          {comment.username || 'Anonymous'}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
                          {format(new Date(comment.created_at), 'MMM d, yyyy h:mm a')}
                        </Typography>
                      </Box>
                    }
                    secondary={
                      <>
                        <Typography
                          component="span"
                          variant="body2"
                          color="text.primary"
                          sx={{ whiteSpace: 'pre-line' }}
                        >
                          {comment.content}
                        </Typography>
                        {comment.parent_id && (
                          <Box sx={{ 
                            mt: 1, 
                            p: 1, 
                            bgcolor: 'background.paper',
                            borderLeft: '3px solid',
                            borderColor: 'divider',
                            borderRadius: 1
                          }}>
                            <Typography variant="caption" color="text.secondary">
                              Replying to {comments.find(c => c.id === comment.parent_id)?.username || 'Anonymous'}
                            </Typography>
                            <Typography variant="body2" sx={{ mt: 0.5 }}>
                              {comments.find(c => c.id === comment.parent_id)?.content}
                            </Typography>
                          </Box>
                        )}
                      </>
                    }
                  />
                </ListItem>
              ))
            )}
          </List>

          {/* Comment Form */}
          <Box component="form" onSubmit={handleCommentSubmit} sx={{ mb: 4 }}>
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
              sx={{ mt: 2 }}
              disabled={!newComment.trim() || commentLoading}
            >
              {commentLoading ? <CircularProgress size={24} /> : 'Post Comment'}
            </Button>
            {commentError && (
              <Alert severity="error" sx={{ mt: 2 }}>
                {commentError}
              </Alert>
            )}
          </Box>
        </Box>
      </Container>
    </Layout>
  );
};

export default ArticlePage;