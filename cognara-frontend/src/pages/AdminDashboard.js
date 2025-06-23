// src/pages/AdminDashboard.js

import React, { useState, useEffect, useCallback } from 'react';
import { articlesAPI } from '../services/api';
import {
  Container,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Chip,
  Box,
  CircularProgress,
  Alert
} from '@mui/material';
import Layout from '../components/Layout/Layout';

const AdminDashboard = () => {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchArticles = useCallback(async () => {
    try {
      setLoading(true);
      const response = await articlesAPI.getAll(); // Fetches all articles
      setArticles(response.data);
    } catch (err) {
      setError('Failed to fetch articles.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchArticles();
  }, [fetchArticles]);

  const handleApprove = async (id) => {
    try {
      await articlesAPI.approve(id);
      fetchArticles(); // Refresh the list
    } catch (err) {
      console.error('Failed to approve article:', err);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this article?')) {
        try {
            await articlesAPI.delete(id);
            fetchArticles(); // Refresh the list
        } catch (err) {
            console.error('Failed to delete article:', err);
        }
    }
  };

  return (
    <Layout>
      <Container maxWidth="lg" sx={{ py: 5 }}>
        <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 700 }}>
          Admin Dashboard
        </Typography>
        {loading ? (
            <CircularProgress />
        ) : error ? (
            <Alert severity="error">{error}</Alert>
        ) : (
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Title</TableCell>
                  <TableCell>Author</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {articles.map((article) => (
                  <TableRow key={article.id}>
                    <TableCell>{article.title}</TableCell>
                    <TableCell>{article.author}</TableCell>
                    <TableCell>
                      <Chip
                        label={article.approved ? 'Approved' : 'Pending'}
                        color={article.approved ? 'success' : 'warning'}
                      />
                    </TableCell>
                    <TableCell>
                      {!article.approved && (
                        <Button
                          variant="contained"
                          color="primary"
                          onClick={() => handleApprove(article.id)}
                          sx={{ mr: 1 }}
                        >
                          Approve
                        </Button>
                      )}
                      <Button
                        variant="contained"
                        color="error"
                        onClick={() => handleDelete(article.id)}
                      >
                        Delete
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Container>
    </Layout>
  );
};

export default AdminDashboard;