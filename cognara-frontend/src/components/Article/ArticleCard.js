import React from 'react';
import {
  Card,
  CardMedia,
  CardContent,
  Typography,
  Button,
  Box,
  useTheme,
  Avatar,
  Divider
} from '@mui/material';
import { Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';

const ArticleCard = ({ article }) => {
  const theme = useTheme();
  const hasImage = Boolean(article?.featured_image);

  const authorEmail = article?.author_email || 'unknown@example.com';
  const authorName = article?.author_name || authorEmail.split('@')[0];
  const authorInitial = authorName.charAt(0).toUpperCase();
  const publishDate = article?.created_at ? new Date(article.created_at) : new Date();

  return (
    <Card
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: 300, // ensures it grows within Grid constraints
        minHeight: 300, // set a consistent minimum height for all cards
        background: theme.palette.background.paper,
        borderRadius: 3,
        boxShadow: '0 8px 30px rgba(0, 0, 0, 0.25)',
        overflow: 'hidden',
        transition: 'transform 0.3s ease, box-shadow 0.3s ease',
        '&:hover': {
          transform: 'translateY(-6px)',
          boxShadow: '0 12px 36px rgba(0, 0, 0, 0.4)'
        }
      }}
    >
      {hasImage && (
        <CardMedia
          component="img"
          image={article.featured_image}
          alt={article.title}
          sx={{
            height: 200,
            objectFit: 'cover',
            width: '100%',
          }}
        />
      )}

      <CardContent
        sx={{
          flexGrow: 1,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          p: 3
        }}
      >
        <Box>
          <Typography
            variant="h6"
            sx={{
              fontWeight: 700,
              color: theme.palette.primary.main,
              mb: 1,
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden'
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
              WebkitLineClamp: 3,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              mb: 2
            }}
          >
            {article.excerpt || article.content?.substring(0, 160) || 'No content'}...
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', mt: 'auto' }}>
          <Avatar
            sx={{
              width: 36,
              height: 36,
              mr: 1.5,
              backgroundColor: theme.palette.primary.light,
              color: theme.palette.primary.contrastText,
              fontWeight: 600
            }}
          >
            {authorInitial}
          </Avatar>
          <Box>
            <Typography variant="caption" sx={{ fontWeight: 600 }}>
              {authorName}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {formatDistanceToNow(publishDate, { addSuffix: true })}
            </Typography>
          </Box>
        </Box>
      </CardContent>

      <Box sx={{ p: 2 }}>
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
              transform: 'translateY(-2px)',
              boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
            }
          }}
        >
          Read Article
        </Button>
      </Box>
    </Card>

  );
};

export default ArticleCard;
