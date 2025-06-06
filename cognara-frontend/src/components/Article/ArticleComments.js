import React, { useState, useEffect } from 'react';
import { Box, Typography, TextField, Button, List, ListItem, ListItemText, Divider } from '@mui/material';
import axios from 'axios';

const ArticleComments = ({ articleId }) => {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchComments = async () => {
      try {
        const response = await axios.get(`/api/articles/${articleId}/comments/`);
        setComments(response.data);
      } catch (error) {
        console.error('Error fetching comments:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchComments();
  }, [articleId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(`/api/articles/${articleId}/comments/`, {
        content: newComment
      });
      setComments([...comments, response.data]);
      setNewComment('');
    } catch (error) {
      console.error('Error submitting comment:', error);
    }
  };

  return (
    <Box sx={{ mt: 4 }}>
      <Typography variant="h5" gutterBottom>
        Comments
      </Typography>
      
      <form onSubmit={handleSubmit}>
        <TextField
          fullWidth
          multiline
          rows={3}
          variant="outlined"
          placeholder="Share your thoughts..."
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          sx={{ mb: 2 }}
        />
        <Button type="submit" variant="contained" color="primary">
          Post Comment
        </Button>
      </form>
      
      <List sx={{ mt: 3 }}>
        {loading ? (
          <Typography>Loading comments...</Typography>
        ) : comments.length === 0 ? (
          <Typography>No comments yet. Be the first to comment!</Typography>
        ) : (
          comments.map((comment) => (
            <React.Fragment key={comment.id}>
              <ListItem alignItems="flex-start">
                <ListItemText
                  primary={comment.author_name}
                  secondary={
                    <>
                      <Typography
                        component="span"
                        variant="body2"
                        color="text.primary"
                      >
                        {comment.content}
                      </Typography>
                      <br />
                      {new Date(comment.created_at).toLocaleString()}
                    </>
                  }
                />
              </ListItem>
              <Divider component="li" />
            </React.Fragment>
          ))
        )}
      </List>
    </Box>
  );
};

export default ArticleComments;