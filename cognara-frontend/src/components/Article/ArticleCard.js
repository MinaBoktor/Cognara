import React, { useEffect, useState } from 'react';
import {
  Card,
  CardMedia,
  CardContent,
  Typography,
  Button,
  Box,
  useTheme,
  Avatar
} from '@mui/material';
import { Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { articlesAPI } from '../../services/api';

const CARD_HEIGHT = 400;
const IMAGE_HEIGHT = 160;

const ArticleCard = ({ article }) => {
  const theme = useTheme();
  const [imageUrl, setImageUrl] = useState(null);

  const capitalize = (str) => str ? str.charAt(0).toUpperCase() + str.slice(1).toLowerCase() : '';

  // Function to strip HTML tags and return plain text
  const stripHtml = (html) => {
    if (!html) return '';
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;
    return tempDiv.textContent || tempDiv.innerText || '';
  };

  // Adapted to new backend structure
  const authorFirst = capitalize(article?.author_first_name || '');
  const authorLast = capitalize(article?.author_last_name || '');
  const authorName = (authorFirst || authorLast) ? `${authorFirst} ${authorLast}`.trim() : 'Unknown';
  const authorInitial = authorName.charAt(0).toUpperCase();

  const publishDate = article?.created_at ? new Date(article.created_at) : new Date();
  const titleLength = (article.title || '').length;
  // More flexible font sizing based on title length (always 2 lines max)
  const getFontSize = (length) => {
    if (length > 100) return '0.75rem';
    if (length > 80) return '0.8rem';
    if (length > 60) return '0.85rem';
    if (length > 40) return '0.95rem';
    if (length > 25) return '1.05rem';
    return '1.15rem';
  };
  
  const fontSize = getFontSize(titleLength);
  const hasImage = Boolean(imageUrl);
  const maxExcerptLines = hasImage ? 2 : 6;

  // Get plain text content
  const plainTextContent = stripHtml(article.excerpt || article.content?.substring(0, 300) || 'No content');

  useEffect(() => {
    if (article?.id) {
      articlesAPI.getImages(article.id)
        .then(res => {
          const firstImage = res.data.images?.[0];
          if (firstImage?.url) {
            setImageUrl(firstImage.url);
          }
        })
        .catch(err => {
          console.error('Failed to fetch article images', err);
        });
    }
  }, [article?.id]);

  return (
    <Card
      sx={{
        width: '100%',
        maxWidth: 340,
        height: 400,
        display: 'flex',
        flexDirection: 'column',
        borderRadius: 3,
        overflow: 'hidden',
        backgroundColor: theme.palette.background.paper,
        boxShadow: '0 6px 24px rgba(0,0,0,0.15)',
        transition: 'all 0.3s ease',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: '0 10px 36px rgba(0,0,0,0.25)',
        },
      }}
    >
      {imageUrl && (
        <CardMedia
          component="img"
          image={imageUrl}
          alt={article.title}
          sx={{
            height: 160,
            width: '100%',
            objectFit: 'cover',
          }}
        />
      )}

      <CardContent
        sx={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          p: 2,
        }}
      >
        {/* Article title & excerpt */}
        <Box>
          <Typography
            sx={{
              fontSize,
              fontWeight: 700,
              color: theme.palette.primary.main,
              mb: 1,
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }}
          >
            {article.title || 'Untitled Article'}
          </Typography>

          <Typography
            sx={{
              lineHeight: 1.6,
              fontSize: '0.875rem',
              color: theme.palette.text.secondary,
              overflow: 'hidden',
              display: '-webkit-box',
              WebkitBoxOrient: 'vertical',
              WebkitLineClamp: maxExcerptLines,
              mb: 2
            }}
          >
            {plainTextContent}
          </Typography>
        </Box>

        {/* Author + Time */}
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Avatar
            sx={{
              width: 36,
              height: 36,
              mr: 1.5,
              backgroundColor: theme.palette.primary.light,
              color: theme.palette.primary.contrastText,
              fontWeight: 600,
            }}
          >
            {authorInitial}
          </Avatar>
          <Box>
            <Typography
              variant="caption"
              sx={{ fontWeight: 600, mr: 1 }}
            >
              {authorName}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {formatDistanceToNow(publishDate, { addSuffix: true })}
            </Typography>
          </Box>
        </Box>
      </CardContent>

      {/* CTA Button */}
      <Box sx={{ px: 2, pb: 2 }}>
        <Button
          component={Link}
          to={`/article/${article?.id || ''}`}
          fullWidth
          variant="contained"
          color="secondary"
          sx={{
            fontWeight: 700,
            textTransform: 'none',
            borderRadius: 2,
            py: 1.2,
            '&:hover': {
              transform: 'translateY(-1px)',
              boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
            },
          }}
        >
          Read Article
        </Button>
      </Box>
    </Card>
  );
};

export default ArticleCard;