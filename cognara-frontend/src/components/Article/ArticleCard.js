import React from 'react';
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

const ArticleCard = ({ article }) => {
  const theme = useTheme();
  const hasImage = Boolean(article?.featured_image);

  // Safe author information handling
  const authorEmail = article?.author_email || 'unknown@example.com';
  const authorName = article?.author_name || authorEmail.split('@')[0];
  const authorInitial = authorName.charAt(0).toUpperCase();
  const publishDate = article?.created_at ? new Date(article.created_at) : new Date();

  return (
    <Card sx={{ 
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      borderRadius: '12px',
      overflow: 'hidden',
      boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
      transition: 'all 0.3s ease',
      '&:hover': {
        transform: 'translateY(-5px)',
        boxShadow: '0 8px 30px rgba(0, 0, 0, 0.12)'
      }
    }}>
      {/* Optional Image */}
      {hasImage && (
        <Box sx={{ 
          height: '180px', 
          overflow: 'hidden',
          position: 'relative',
          '&:after': {
            content: '""',
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: '40%',
            background: 'linear-gradient(to top, rgba(0,0,0,0.1) 0%, transparent 100%)'
          }
        }}>
          <CardMedia
            component="img"
            height="180"
            image={article.featured_image}
            alt={article.title || 'Article image'}
            sx={{
              objectFit: 'cover',
              width: '100%',
              transition: 'transform 0.5s ease',
              '&:hover': {
                transform: 'scale(1.03)'
              }
            }}
          />
        </Box>
      )}

      {/* Card Content - maintains same height regardless of image */}
      <CardContent sx={{ 
        flexGrow: 1,
        p: 3,
        display: 'flex',
        flexDirection: 'column',
        height: hasImage ? 'calc(100% - 180px)' : '100%',
        backgroundColor: theme.palette.background.paper
      }}>
        <Typography 
          variant="h6" 
          component="h3" 
          gutterBottom 
          sx={{ 
            fontWeight: 700,
            mb: 2,
            color: theme.palette.text.primary,
            minHeight: '64px',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden'
          }}
        >
          {article?.title || 'Untitled Article'}
        </Typography>

        <Typography 
          variant="body2" 
          color="text.secondary" 
          sx={{ 
            mb: 3,
            flexGrow: 1,
            display: '-webkit-box',
            WebkitLineClamp: 3,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            lineHeight: 1.6
          }}
        >
          {article?.excerpt || article?.content?.substring(0, 150) || 'No content available'}...
        </Typography>

        <Box sx={{
          display: 'flex',
          alignItems: 'center',
          mt: 'auto',
          pt: 2,
          borderTop: `1px solid ${theme.palette.divider}`
        }}>
          <Avatar 
            sx={{ 
              width: 32, 
              height: 32, 
              mr: 1.5,
              backgroundColor: theme.palette.primary.light,
              color: theme.palette.primary.contrastText,
              fontSize: '0.875rem'
            }}
          >
            {authorInitial}
          </Avatar>
          <Box>
            <Typography variant="caption" sx={{ 
              fontWeight: 600,
              display: 'block',
              lineHeight: 1.2,
              color: theme.palette.text.primary
            }}>
              {authorName}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {formatDistanceToNow(publishDate, { addSuffix: true })}
            </Typography>
          </Box>
        </Box>
      </CardContent>

      <Box sx={{ 
        p: 2, 
        backgroundColor: theme.palette.background.paper,
        borderTop: `1px solid ${theme.palette.divider}`
      }}>
        <Button 
          component={Link}
          to={`/article/${article?.id || ''}`}
          fullWidth
          variant="outlined"
          size="medium"
          sx={{
            textTransform: 'none',
            fontWeight: 600,
            borderRadius: '8px',
            py: 1,
            borderWidth: '2px',
            '&:hover': {
              borderWidth: '2px'
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