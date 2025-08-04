import React, { useState, useEffect } from 'react';
import {
  Card,
  CardMedia,
  CardContent,
  Typography,
  Button,
  Box,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Stack,
  Skeleton,
  useTheme,
  alpha,
  Tooltip
} from '@mui/material';
import { formatDistanceToNow } from 'date-fns';
import { articlesAPI } from '../../services/api';

// Icons
import EditIcon from '@mui/icons-material/Edit';
import VisibilityIcon from '@mui/icons-material/Visibility';
import DeleteIcon from '@mui/icons-material/Delete';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import PublishIcon from '@mui/icons-material/Publish';
import DraftsIcon from '@mui/icons-material/Drafts';
import ScheduleIcon from '@mui/icons-material/Schedule';
import PendingIcon from '@mui/icons-material/Pending';
import ImageIcon from '@mui/icons-material/Image';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import ArticleIcon from '@mui/icons-material/Article';

const WritingArticleCard = ({ 
  article, 
  onEdit, 
  onPreview, 
  onDelete, 
  isDeleting = false,
  showImages = true,
  onToggleImageMode
}) => {
  const theme = useTheme();
  const [anchorEl, setAnchorEl] = useState(null);
  const [imageUrl, setImageUrl] = useState(null);
  const [imageLoading, setImageLoading] = useState(true);
  const [contentAnalysis, setContentAnalysis] = useState(null);

  const handleMenuOpen = (event) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  // Load article image
  useEffect(() => {
    if (article?.id && showImages) {
      setImageLoading(true);
      articlesAPI.getImages(article.id)
        .then(res => {
          const firstImage = res.data?.images?.[0];
          if (firstImage?.url) {
            setImageUrl(firstImage.url);
          }
        })
        .catch(err => {
          console.warn('Failed to fetch article images', err);
        })
        .finally(() => {
          setImageLoading(false);
        });
    } else {
      setImageLoading(false);
    }
  }, [article?.id, showImages]);

  // Analyze article content (simplified)
  useEffect(() => {
    if (article?.content) {
      const analysis = analyzeContent(article.content);
      setContentAnalysis(analysis);
    }
  }, [article?.content]);

  // Simplified content analysis
  const analyzeContent = (content) => {
    const text = content.replace(/<[^>]*>/g, '');
    const words = text.trim().split(/\s+/).filter(word => word.length > 0);
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
    
    // Calculate reading time (200 words per minute)
    const readingTime = Math.ceil(words.length / 200);
    
    // Simplified readability score (Flesch Reading Ease)
    const avgWordsPerSentence = words.length / (sentences.length || 1);
    const avgSyllablesPerWord = words.reduce((acc, word) => acc + countSyllables(word), 0) / (words.length || 1);
    const readabilityScore = Math.max(0, Math.min(100, 206.835 - (1.015 * avgWordsPerSentence) - (84.6 * avgSyllablesPerWord)));

    return {
      wordCount: words.length,
      readingTime,
      readabilityScore: Math.round(readabilityScore)
    };
  };

  // Helper function to count syllables
  const countSyllables = (word) => {
    return word
      .toLowerCase()
      .replace(/[^a-z]/g, '')
      .replace(/e$/, '')
      .replace(/[aeiouy]{2,}/g, 'a')
      .match(/[aeiouy]/g)?.length || 1;
  };

  // Status configuration
  const getStatusConfig = (status) => {
    const configs = {
      published: { 
        color: theme.palette.success.main, 
        backgroundColor: alpha(theme.palette.success.main, 0.1),
        icon: <PublishIcon sx={{ fontSize: '1rem' }} />,
        label: 'Published'
      },
      draft: { 
        color: theme.palette.warning.main, 
        backgroundColor: alpha(theme.palette.warning.main, 0.1),
        icon: <DraftsIcon sx={{ fontSize: '1rem' }} />,
        label: 'Draft'
      },
      'under-review': { 
        color: theme.palette.info.main, 
        backgroundColor: alpha(theme.palette.info.main, 0.1),
        icon: <PendingIcon sx={{ fontSize: '1rem' }} />,
        label: 'Under Review'
      },
      scheduled: { 
        color: theme.palette.secondary.main, 
        backgroundColor: alpha(theme.palette.secondary.main, 0.1),
        icon: <ScheduleIcon sx={{ fontSize: '1rem' }} />,
        label: 'Scheduled'
      }
    };
    return configs[status] || configs.draft;
  };

  const statusConfig = getStatusConfig(article?.status);

  // Strip HTML from content for preview
  const stripHtml = (html) => {
    if (!html) return '';
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;
    return tempDiv.textContent || tempDiv.innerText || '';
  };

  const plainTextContent = stripHtml(article?.content || article?.excerpt || '');
  const previewText = plainTextContent.length > 120 
    ? plainTextContent.substring(0, 120) + '...' 
    : plainTextContent;

  // Date formatting
  const createdDate = article?.created_at ? new Date(article.created_at) : null;
  const updatedDate = article?.updated_at ? new Date(article.updated_at) : null;
  const displayDate = updatedDate || createdDate;

  // Get readability color
  const getReadabilityColor = (score) => {
    if (score >= 70) return theme.palette.success.main;
    if (score >= 50) return theme.palette.warning.main;
    return theme.palette.error.main;
  };

  const hasImage = imageUrl && showImages;

  // Early return if article is not provided (after all hooks)
  if (!article) {
    return null;
  }

  return (
    <Card
      sx={{
        width: 350, // Fixed width
        height: 550, // Fixed height
        display: 'flex',
        flexDirection: 'column',
        borderRadius: 3,
        overflow: 'hidden',
        backgroundColor: theme.palette.background.paper,
        border: `1px solid ${theme.palette.divider}`,
        transition: 'all 0.3s ease',
        position: 'relative',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: '0 8px 25px rgba(0,0,0,0.12)',
          borderColor: theme.palette.primary.main,
        },
        opacity: article.status === 'draft' ? 0.9 : 1,
      }}
    >
      {/* Action Menu */}
      <Box sx={{ 
        position: 'absolute', 
        top: 8, 
        right: 8, 
        zIndex: 3 
      }}>
        <IconButton
          size="small"
          onClick={handleMenuOpen}
          disabled={isDeleting}
          sx={{ 
            backgroundColor: alpha(theme.palette.background.paper, 0.9),
            backdropFilter: 'blur(10px)',
            border: `1px solid ${theme.palette.divider}`,
            '&:hover': {
              backgroundColor: theme.palette.background.paper,
              borderColor: theme.palette.primary.main,
            }
          }}
        >
          {isDeleting ? (
            <Box sx={{ 
              width: 20, 
              height: 20, 
              border: `2px solid ${theme.palette.primary.main}`,
              borderTop: `2px solid transparent`,
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
            }} />
          ) : (
            <MoreVertIcon />
          )}
        </IconButton>
      </Box>

      {/* Image Section */}
      {hasImage ? (
        imageLoading ? (
          <Skeleton variant="rectangular" height={180} />
        ) : (
          <CardMedia
            component="img"
            image={imageUrl}
            alt={article.title}
            sx={{
              height: 180,
              objectFit: 'cover',
            }}
          />
        )
      ) : (
        // No image design - decorative header
        <Box
          sx={{
            height: 120,
            background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)} 0%, ${alpha(theme.palette.secondary.main, 0.1)} 100%)`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
            overflow: 'hidden',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: -50,
              right: -50,
              width: 100,
              height: 100,
              borderRadius: '50%',
              backgroundColor: alpha(theme.palette.primary.main, 0.05),
            },
            '&::after': {
              content: '""',
              position: 'absolute',
              bottom: -30,
              left: -30,
              width: 80,
              height: 80,
              borderRadius: '50%',
              backgroundColor: alpha(theme.palette.secondary.main, 0.05),
            }
          }}
        >
          <ArticleIcon 
            sx={{ 
              fontSize: '3rem', 
              color: alpha(theme.palette.primary.main, 0.3),
              zIndex: 1
            }} 
          />
        </Box>
      )}

      <CardContent sx={{ 
        flex: 1, 
        p: 2.5, 
        display: 'flex', 
        flexDirection: 'column',
        overflow: 'hidden' // Prevent content overflow
      }}>
        {/* Status Badge */}
        <Box sx={{ mb: 2 }}>
          <Chip
            icon={statusConfig.icon}
            label={statusConfig.label}
            size="small"
            sx={{
              backgroundColor: statusConfig.backgroundColor,
              color: statusConfig.color,
              fontWeight: 600,
              height: 28,
              border: `1px solid ${alpha(statusConfig.color, 0.2)}`,
            }}
          />
        </Box>

        {/* Title */}
        <Typography
          variant="h6"
          sx={{
            fontWeight: 700,
            color: theme.palette.text.primary,
            mb: 1.5,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            lineHeight: 1.25,
            minHeight: '2.5em', // Reserve space for consistent layout
          }}
        >
          {article.title || 'Untitled Article'}
        </Typography>

        {/* Content Preview */}
        {previewText && (
          <Typography
            variant="body2"
            sx={{
              color: theme.palette.text.secondary,
              mb: 2,
              display: '-webkit-box',
              WebkitLineClamp: hasImage ? 2 : 4, // Less lines for cards with images
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              lineHeight: 1.4,
              minHeight: hasImage ? '2.8em' : '5.6em', // Reserve space to prevent layout shift
            }}
          >
            {previewText}
          </Typography>
        )}

        {/* Simplified Content Stats */}
        {contentAnalysis && (
          <Box sx={{ 
            mb: 2,
            display: 'flex',
            gap: 1,
          }}>
            {/* Word Count */}
            <Box sx={{
              flex: 1,
              p: 1,
              backgroundColor: alpha(theme.palette.success.main, 0.08),
              borderRadius: 1.5,
              border: `1px solid ${alpha(theme.palette.success.main, 0.15)}`,
              textAlign: 'center'
            }}>
              <Typography variant="body2" sx={{ fontWeight: 800, color: theme.palette.success.dark, fontSize: '0.875rem' }}>
                {contentAnalysis.wordCount.toLocaleString()}
              </Typography>
              <Typography variant="caption" sx={{ color: theme.palette.success.main, fontSize: '0.7rem', fontWeight: 900 }}>
                words
              </Typography>
            </Box>

            {/* Reading Time */}
            <Box sx={{
              flex: 1,
              p: 1,
              backgroundColor: alpha(theme.palette.info.main, 0.08),
              borderRadius: 1.5,
              border: `1px solid ${alpha(theme.palette.info.main, 0.15)}`,
              textAlign: 'center'
            }}>
              <Typography variant="body2" sx={{ fontWeight: 800, color: theme.palette.info.dark, fontSize: '0.875rem' }}>
                {contentAnalysis.readingTime}
              </Typography>
              <Typography variant="caption" sx={{ color: theme.palette.info.main, fontSize: '0.7rem', fontWeight: 600 }}>
                min read
              </Typography>
            </Box>

            {/* Readability Score */}
            <Box sx={{
              flex: 1,
              p: 1,
              backgroundColor: alpha(getReadabilityColor(contentAnalysis.readabilityScore), 0.08),
              borderRadius: 1.5,
              border: `1px solid ${alpha(getReadabilityColor(contentAnalysis.readabilityScore), 0.15)}`,
              textAlign: 'center'
            }}>
              <Typography variant="body2" sx={{ 
                fontWeight: 800, 
                color: getReadabilityColor(contentAnalysis.readabilityScore), 
                fontSize: '0.875rem' 
              }}>
                {contentAnalysis.readabilityScore}%
              </Typography>
              <Typography variant="caption" sx={{ 
                color: alpha(getReadabilityColor(contentAnalysis.readabilityScore), 0.8), 
                fontSize: '0.7rem',
                fontWeight: 600
              }}>
                readable
              </Typography>
            </Box>
          </Box>
        )}

        <Box sx={{ mt: 'auto', pt: 1 }}>
          {/* Date */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 1.5 }}>
            <CalendarTodayIcon sx={{ fontSize: '0.9rem', color: theme.palette.text.secondary }} />
            <Typography variant="caption" color="text.secondary" noWrap>
              {displayDate ? (
                <>
                  {updatedDate && updatedDate > createdDate ? 'Updated ' : 'Created '}
                  {formatDistanceToNow(displayDate, { addSuffix: true })}
                </>
              ) : 'No date'}
            </Typography>
          </Box>

          {/* Action Buttons - All same size */}
          <Stack direction="row" spacing={1}>
            <Button
              variant="outlined"
              size="small"
              startIcon={<EditIcon />}
              onClick={(e) => {
                e.stopPropagation();
                onEdit(article.id);
              }}
              sx={{
                flex: 1,
                textTransform: 'none',
                fontWeight: 600,
                borderRadius: 2,
              }}
            >
              Edit
            </Button>

            {article.status === 'published' && (
              <Button
                variant="outlined"
                size="small"
                startIcon={<VisibilityIcon />}
                onClick={(e) => {
                  e.stopPropagation();
                  onPreview(article.id);
                }}
                color="secondary"
                sx={{
                  flex: 1,
                  textTransform: 'none',
                  fontWeight: 600,
                  borderRadius: 2,
                }}
              >
                View
              </Button>
            )}

            <Button
              variant="outlined"
              size="small"
              startIcon={<DeleteIcon />}
              onClick={(e) => {
                e.stopPropagation();
                onDelete(article.id);
              }}
              color="error"
              sx={{
                flex: 1,
                textTransform: 'none',
                fontWeight: 600,
                borderRadius: 2,
              }}
            >
              Delete
            </Button>
          </Stack>
        </Box>
      </CardContent>

      {/* Context Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        PaperProps={{
          sx: {
            borderRadius: 2,
            minWidth: 180,
            boxShadow: theme.shadows[8],
            mt: 1,
          }
        }}
      >
        <MenuItem 
          onClick={() => { 
            onEdit(article.id); 
            handleMenuClose(); 
          }}
        >
          <ListItemIcon>
            <EditIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Edit Article</ListItemText>
        </MenuItem>
        
        {article.status === 'published' && (
          <MenuItem 
            onClick={() => { 
              onPreview(article.id); 
              handleMenuClose(); 
            }}
          >
            <ListItemIcon>
              <VisibilityIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>View Published</ListItemText>
          </MenuItem>
        )}
        
        <Divider />
        
        <MenuItem 
          onClick={() => { 
            onDelete(article.id); 
            handleMenuClose(); 
          }}
          sx={{ color: theme.palette.error.main }}
        >
          <ListItemIcon>
            <DeleteIcon fontSize="small" sx={{ color: theme.palette.error.main }} />
          </ListItemIcon>
          <ListItemText>Delete Article</ListItemText>
        </MenuItem>
      </Menu>

      {/* CSS for loading spinner */}
      <style jsx>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </Card>
  );
};

export default WritingArticleCard;