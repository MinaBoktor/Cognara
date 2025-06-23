import React, { useState, useRef } from 'react';
import { articlesAPI } from '../services/api';
import {
  Container,
  TextField,
  Button,
  Typography,
  Box,
  Paper,
  Alert,
  useTheme,
  ButtonGroup,
  IconButton,
  Divider
} from '@mui/material';
import Layout from '../components/Layout/Layout';
import { Helmet } from 'react-helmet';
import {
  FormatBold,
  FormatItalic,
  FormatUnderlined,
  FormatListBulleted,
  FormatListNumbered,
  Link,
  Image,
  FormatAlignLeft,
  FormatAlignCenter,
  FormatAlignRight,
  FormatClear
} from '@mui/icons-material';

const SubmitArticlePage = () => {
  const theme = useTheme();
  const [formData, setFormData] = useState({
    title: '',
    author: '',
    content: '',
    summary: '',
  });
  const [status, setStatus] = useState({ message: '', type: '' });
  const contentEditableRef = useRef(null);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleContentChange = () => {
    if (contentEditableRef.current) {
      let rawHTML = contentEditableRef.current.innerHTML;
      // Optionally strip direction attributes
      rawHTML = rawHTML.replace(/dir=["']rtl["']/gi, '');
      setFormData({ ...formData, content: rawHTML });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ message: '', type: '' });

    if (!formData.title || !formData.author || !formData.content) {
      setStatus({ message: 'Title, Author, and Content are required.', type: 'error' });
      return;
    }

    try {
      await articlesAPI.create(formData);
      setStatus({ message: 'Article submitted successfully! It will be reviewed by an admin.', type: 'success' });
      setFormData({ title: '', author: '', content: '', summary: '' });
      if (contentEditableRef.current) {
        contentEditableRef.current.innerHTML = '';
      }
    } catch (error) {
      setStatus({ message: 'Failed to submit article. Please try again.', type: 'error' });
      console.error('Submission error:', error);
    }
  };

  const formatText = (command, value = null) => {
    document.execCommand(command, false, value);
    handleContentChange();
  };

  const insertImage = () => {
    const url = prompt('Enter the image URL:');
    if (url) {
      formatText('insertImage', url);
    }
  };

  const createLink = () => {
    const url = prompt('Enter the link URL:');
    if (url) {
      formatText('createLink', url);
    }
  };

  return (
    <Layout>
      <Helmet>
        <title>Submit Article | Cognara</title>
        <meta name="description" content="Submit your article to the Cognara community." />
      </Helmet>
      
      <Container maxWidth={false} sx={{ py: 5}}>
        {/* Header Section */}
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Typography 
            variant="h3" 
            component="h1" 
            sx={{ 
              fontWeight: 700,
              mb: 1,
              color: theme.palette.text.primary,
              paddingTop: '1rem',
              paddingBottom: '1rem',
              fontSize: '2.5rem',
            }}
          >
            Submit an Article
          </Typography>
          <Typography 
            variant="h6" 
            component="p" 
            sx={{ 
              mx: 'auto',
              color: theme.palette.text.secondary,
              mb: 3
            }}
          >
            Share your knowledge with the Cognara community
          </Typography>
          <Divider sx={{ my: 2 }} />
        </Box>

        {/* Form Section */}
        <Paper elevation={0} sx={{ 
          p: 4, 
          backgroundColor: theme.palette.background.default,
          borderRadius: 2,
          borderLeft: `4px solid ${theme.palette.primary.main}`,
          mx: 'auto'
        }}>
          <form onSubmit={handleSubmit}>
            {/* Centered Form Fields */}
            <Box sx={{ 
              display: 'flex', 
              flexDirection: 'column', 
              gap: 3,
              mx: 'auto'
            }}>
              <TextField
                fullWidth
                label="Article Title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
                variant="outlined"
                sx={{ direction: 'ltr' }}
              />
              <TextField
                fullWidth
                label="Author Name"
                name="author"
                value={formData.author}
                onChange={handleChange}
                required
                variant="outlined"
                sx={{ direction: 'ltr' }}
              />
              <TextField
                fullWidth
                label="Summary"
                name="summary"
                value={formData.summary}
                onChange={handleChange}
                helperText="A short summary that will appear in article listings."
                variant="outlined"
                multiline
                rows={3}
                sx={{ direction: 'ltr' }}
              />
            </Box>

            {/* Full Content Editor */}
            <Box sx={{ mt: 4, width: '100%' }}>
              <Typography variant="subtitle1" gutterBottom sx={{ textAlign: 'center', direction: 'ltr' }}>
                Full Content
              </Typography>
              <Box   sx={{
                  border: `1px solid ${theme.palette.divider}`,
                  borderRadius: 1,
                  mb: 1,
                  p: 1,
                  backgroundColor: theme.palette.background.paper,
                  mx: 'auto',
                }}>
                <ButtonGroup size="small" sx={{ 
                  flexWrap: 'wrap', 
                  mb: 1,
                  justifyContent: 'center'
                }}>
                  <IconButton onClick={() => formatText('bold')} title="Bold">
                    <FormatBold fontSize="small" />
                  </IconButton>
                  <IconButton onClick={() => formatText('italic')} title="Italic">
                    <FormatItalic fontSize="small" />
                  </IconButton>
                  <IconButton onClick={() => formatText('underline')} title="Underline">
                    <FormatUnderlined fontSize="small" />
                  </IconButton>
                  <IconButton onClick={() => formatText('insertUnorderedList')} title="Bullet List">
                    <FormatListBulleted fontSize="small" />
                  </IconButton>
                  <IconButton onClick={() => formatText('insertOrderedList')} title="Numbered List">
                    <FormatListNumbered fontSize="small" />
                  </IconButton>
                  <IconButton onClick={createLink} title="Insert Link">
                    <Link fontSize="small" />
                  </IconButton>
                  <IconButton onClick={insertImage} title="Insert Image">
                    <Image fontSize="small" />
                  </IconButton>
                  <IconButton onClick={() => formatText('justifyLeft')} title="Align Left">
                    <FormatAlignLeft fontSize="small" />
                  </IconButton>
                  <IconButton onClick={() => formatText('justifyCenter')} title="Align Center">
                    <FormatAlignCenter fontSize="small" />
                  </IconButton>
                  <IconButton onClick={() => formatText('justifyRight')} title="Align Right">
                    <FormatAlignRight fontSize="small" />
                  </IconButton>
                  <IconButton onClick={() => formatText('removeFormat')} title="Clear Formatting">
                    <FormatClear fontSize="small" />
                  </IconButton>
                </ButtonGroup>
                <Box
                  ref={contentEditableRef}
                  
                  contentEditable
                  onInput={handleContentChange}
                  dangerouslySetInnerHTML={{ __html: formData.content }}
                  style={{
                    
                    minHeight: '300px',
                    padding: '16px',
                    border: `1px solid ${theme.palette.divider}`,
                    borderRadius: '4px',
                    backgroundColor: theme.palette.background.paper,
                    outline: 'none',
                    width: '100%',
                    direction: 'ltr'
                  }}
                />
              </Box>
              <Typography variant="caption" color="textSecondary" sx={{ 
                textAlign: 'center', 
                display: 'block',
                direction: 'ltr'
              }}>
                Note: You can use the toolbar above to format your text.
              </Typography>
            </Box>

            {/* Submit Button */}
            <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
              <Button 
                type="submit" 
                variant="contained" 
                color="primary" 
                size="large"
                sx={{
                  px: 5,
                  py: 1.5,
                  fontWeight: 700,
                  borderRadius: 2,
                  textTransform: 'none',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
                  },
                  transition: 'all 0.2s ease'
                }}
              >
                Submit for Review
              </Button>
            </Box>
          </form>
        </Paper>

        {/* Additional Info Section */}
        <Paper elevation={0} sx={{ 
          mt: 4,
          p: 3, 
          backgroundColor: theme.palette.background.paper,
          borderRadius: 2,
          borderLeft: `4px solid ${theme.palette.secondary.main}`,
          mx: 'auto',
          direction: 'ltr'
        }}>
          <Typography variant="h6" component="h3" sx={{ 
            fontWeight: 700,
            mb: 2,
            color: theme.palette.secondary.main,
            textAlign: 'center'
          }}>
            Submission Guidelines
          </Typography>
          <Typography variant="body1" paragraph sx={{ mb: 2, textAlign: 'center' }}>
            Before submitting, please ensure your article follows our community guidelines:
          </Typography>
          <Box sx={{ textAlign: 'center' }}>
            <ul style={{ 
              paddingLeft: '20px',
              color: theme.palette.text.secondary,
              marginBottom: '16px',
              display: 'inline-block',
              textAlign: 'left',
              direction: 'ltr'
            }}>
              <li><Typography variant="body1" component="span">Original content only (no plagiarism)</Typography></li>
              <li><Typography variant="body1" component="span">Properly cited sources where applicable</Typography></li>
              <li><Typography variant="body1" component="span">Clear and well-structured writing</Typography></li>
              <li><Typography variant="body1" component="span">Relevant to our community's interests</Typography></li>
            </ul>
          </Box>
          <Typography variant="body1" sx={{ textAlign: 'center' }}>
            Our editors will review your submission within 3-5 business days.
          </Typography>
        </Paper>
      </Container>
    </Layout>
  );
};

export default SubmitArticlePage;