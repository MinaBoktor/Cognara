import React, { useState, useEffect } from 'react';
import { useTheme } from '@mui/material/styles';
import { Box, Button, Chip, Typography } from '@mui/material';
import DOMPurify from 'dompurify';
import { Preview as PreviewIcon } from '@mui/icons-material';
import { articlesAPI } from '../../services/api';
import { ArticleContainer, MainContent, ArticleHeader, ArticleTitle, 
         MetadataSection, ContentSection } from '../../pages/ArticlePage';
import { styled } from '@mui/material/styles';

// Use the same FloatingImage component as ArticlePage
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

const ArticlePreview = ({ articleData, articleId, onExitPreview }) => {
  const theme = useTheme();
  const [articleImage, setArticleImage] = useState(null);

  // Use the exact same method as ArticlePage to fetch images
  useEffect(() => {
    const fetchArticleImage = async () => {
      // Use articleId prop if available, otherwise fall back to articleData.id
      const idToUse = articleId || articleData.id;
      
      if (idToUse) {
        try {
          console.log('Fetching image for article ID:', idToUse);
          const imageResponse = await articlesAPI.getImages(idToUse);
          const firstImage = imageResponse.data.images?.[0];
          if (firstImage?.url) {
            console.log('Found image:', firstImage.url);
            setArticleImage(firstImage.url);
          } else {
            console.log('No images found for article');
          }
        } catch (err) {
          console.error('Error fetching image:', err);
          // Silently fail like in ArticlePage
        }
      } else {
        console.log('No article ID available for image fetch');
      }
    };

    fetchArticleImage();
  }, [articleId, articleData.id]); // Fixed dependency array

  return (
    <ArticleContainer maxWidth="false">
      <MainContent>
        <ArticleHeader>
          <ArticleTitle variant="h1" component="h1">
            {articleData.title || 'Untitled Article'}
          </ArticleTitle>

          <MetadataSection>
            <Typography variant="body1" sx={{ fontWeight: 500 }}>
              By You
            </Typography>
            <Chip
              label="Draft Preview"
              size="small"
              variant="outlined"
            />
          </MetadataSection>

          <Box sx={{ marginTop: theme.spacing(4), marginBottom: theme.spacing(3) }}>
            <Button 
              variant="outlined" 
              startIcon={<PreviewIcon />}
              onClick={onExitPreview}
              sx={{ mr: 2 }}
            >
              Exit Preview
            </Button>
            <Typography variant="caption" color="text.secondary">
              This is a preview of how your article will look when published
            </Typography>
          </Box>

          {/* Use the same floating image approach as ArticlePage */}
          {articleImage && (
            <FloatingImage
              src={articleImage}
              alt={articleData.title || 'Article image'}
            />
          )}
        </ArticleHeader>

        <ContentSection
          dangerouslySetInnerHTML={{
            __html: DOMPurify.sanitize(articleData.content || '<p>Start writing your article...</p>')
          }}
        />
      </MainContent>
    </ArticleContainer>
  );
};

export default ArticlePreview;