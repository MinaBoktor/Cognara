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

  // Adapted to new backend structure
  const authorFirst = capitalize(article?.author_first_name || '');
  const authorLast = capitalize(article?.author_last_name || '');
  const authorName = (authorFirst || authorLast) ? `${authorFirst} ${authorLast}`.trim() : 'Unknown';
  const authorInitial = authorName.charAt(0).toUpperCase();

  const publishDate = article?.created_at ? new Date(article.created_at) : new Date();
  const titleLength = (article.title || '').length;
  const fontSize = titleLength > 60 ? '0.95rem' : titleLength > 40 ? '1.05rem' : '1.15rem';
  const hasImage = Boolean(imageUrl);
  const maxExcerptLines = hasImage ? 2 : 9;



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
        width: '100%', // 👈 Controlled by the Grid container
        maxWidth: 340, // 👈 Optional: limit width per card
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
            variant="body2"
            color="text.secondary"
            sx={{
              lineHeight: 1.6,
              display: '-webkit-box',
              WebkitLineClamp: maxExcerptLines,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              mb: 2
            }}
          >
            {article.excerpt || article.content?.substring(0, 300) || 'No content'}...
          </Typography>
        </Box>

        {/* Author + Time */}
        <Box sx={{ display: 'flex', alignItems: 'center', mt: 2 }}>
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
              sx={{ fontWeight: 600, mr: 1 }} // 👈 adds spacing
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
