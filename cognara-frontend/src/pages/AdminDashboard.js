import React, { useState, useEffect } from 'react';
import { Container, Typography, Box, Tabs, Tab, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Button, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import axios from 'axios';
import { Helmet } from 'react-helmet';
import ArticlePreview from '../components/Article/ArticlePreview';

const AdminDashboard = () => {
  const [value, setValue] = useState(0);
  const [pendingArticles, setPendingArticles] = useState([]);
  const [publishedArticles, setPublishedArticles] = useState([]);
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [openPreview, setOpenPreview] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        const [pendingRes, publishedRes] = await Promise.all([
          axios.get('/api/articles/pending/'),
          axios.get('/api/articles/published/')
        ]);
        setPendingArticles(pendingRes.data);
        setPublishedArticles(publishedRes.data);
      } catch (error) {
        console.error('Error fetching articles:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchArticles();
  }, []);

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  const handlePreview = (article) => {
    setSelectedArticle(article);
    setOpenPreview(true);
  };

  const handleClosePreview = () => {
    setOpenPreview(false);
  };

  const handleApprove = async (articleId) => {
    try {
      await axios.put(`/api/articles/${articleId}/approve/`);
      setPendingArticles(pendingArticles.filter(article => article.id !== articleId));
      setPublishedArticles([...publishedArticles, pendingArticles.find(article => article.id === articleId)]);
    } catch (error) {
      console.error('Error approving article:', error);
    }
  };

  const handleReject = async (articleId) => {
    try {
      await axios.delete(`/api/articles/${articleId}/`);
      setPendingArticles(pendingArticles.filter(article => article.id !== articleId));
    } catch (error) {
      console.error('Error rejecting article:', error);
    }
  };

  const handlePublishNewsletter = async (articleId) => {
    try {
      await axios.post('/api/newsletter/send/', { article_id: articleId });
      alert('Newsletter sent successfully!');
    } catch (error) {
      console.error('Error sending newsletter:', error);
    }
  };

  return (
    <Container maxWidth="lg">
      <Helmet>
        <title>Admin Dashboard | Cognara</title>
      </Helmet>
      <Box sx={{ my: 4 }}>
        <Typography variant="h3" component="h1" gutterBottom>
          Admin Dashboard
        </Typography>
        
        <Paper sx={{ mb: 2 }}>
          <Tabs value={value} onChange={handleChange} indicatorColor="primary">
            <Tab label={`Pending Articles (${pendingArticles.length})`} />
            <Tab label={`Published Articles (${publishedArticles.length})`} />
          </Tabs>
        </Paper>
        
        {value === 0 && (
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Title</TableCell>
                  <TableCell>Author</TableCell>
                  <TableCell>Submitted</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {pendingArticles.map((article) => (
                  <TableRow key={article.id}>
                    <TableCell>{article.title}</TableCell>
                    <TableCell>{article.author_name}</TableCell>
                    <TableCell>{new Date(article.created_at).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <Button onClick={() => handlePreview(article)}>Preview</Button>
                      <Button color="success" onClick={() => handleApprove(article.id)}>Approve</Button>
                      <Button color="error" onClick={() => handleReject(article.id)}>Reject</Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
        
        {value === 1 && (
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Title</TableCell>
                  <TableCell>Author</TableCell>
                  <TableCell>Published</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {publishedArticles.map((article) => (
                  <TableRow key={article.id}>
                    <TableCell>{article.title}</TableCell>
                    <TableCell>{article.author_name}</TableCell>
                    <TableCell>{new Date(article.published_at).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <Button onClick={() => handlePreview(article)}>View</Button>
                      <Button onClick={() => handlePublishNewsletter(article.id)}>Send Newsletter</Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
        
        <Dialog open={openPreview} onClose={handleClosePreview} maxWidth="md" fullWidth>
          <DialogTitle>{selectedArticle?.title}</DialogTitle>
          <DialogContent dividers>
            {selectedArticle && <ArticlePreview article={selectedArticle} />}
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClosePreview}>Close</Button>
            {value === 0 && (
              <>
                <Button color="success" onClick={() => {
                  handleApprove(selectedArticle.id);
                  handleClosePreview();
                }}>
                  Approve
                </Button>
                <Button color="error" onClick={() => {
                  handleReject(selectedArticle.id);
                  handleClosePreview();
                }}>
                  Reject
                </Button>
              </>
            )}
          </DialogActions>
        </Dialog>
      </Box>
    </Container>
  );
};

export default AdminDashboard;