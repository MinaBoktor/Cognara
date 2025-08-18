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
  Tooltip,
  CircularProgress,
  Snackbar,
  Alert
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
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import CancelIcon from '@mui/icons-material/Cancel';
import LockIcon from '@mui/icons-material/Lock';

const WritingArticleCard = ({ 
  article, 
  onEdit, 
  onPreview, 
  onDelete, 
  onPublish,
  onChangeVisibility,
  onWithdraw,
  isDeleting = false,
  showImages = true,
  onToggleImageMode,
  onArticleUpdate // New prop to handle article updates
}) => {
  const theme = useTheme();
  const [imageUrl, setImageUrl] = useState(null);
  const [imageLoading, setImageLoading] = useState(true);
  const [contentAnalysis, setContentAnalysis] = useState(null);
  const [isPublishing, setIsPublishing] = useState(false);
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'success' });

  const handleCardClick = () => {
    if (article.status === 'published') {
      // Redirect to actual article URL
      window.open(article.url || `/articles/${article.slug || article.id}`, '_blank');
    } else {
      // Redirect to preview page for draft/pending articles
      onPreview(article.id);
    }
  };

  const handleStatusChange = async (e, newStatus) => {
    e.stopPropagation();
    
    if (!article.id) {
      setNotification({
        open: true,
        message: 'Article ID is missing',
        severity: 'error'
      });
      return;
    }

    setIsPublishing(true);
    
    try {
      await articlesAPI.changeStatus(article.id, newStatus);
      
      let successMessage = '';
      switch (newStatus) {
        case 'under-review':
          successMessage = 'Article submitted for review successfully!';
          break;
        case 'draft':
          successMessage = 'Article withdrawn to draft successfully!';
          break;
        case 'published':
          successMessage = 'Article published successfully!';
          break;
        default:
          successMessage = 'Article status updated successfully!';
      }

      setNotification({
        open: true,
        message: successMessage,
        severity: 'success'
      });

      // Update the local article state immediately
      const updatedArticle = { ...article, status: newStatus };
      if (onArticleUpdate) {
        onArticleUpdate(article.id, { status: newStatus });
      }
      
    } catch (error) {
      console.error('Error changing article status:', error);
      
      let errorMessage = 'Failed to update article status';
      
      if (error.message) {
        errorMessage = error.message;
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      
      setNotification({
        open: true,
        message: errorMessage,
        severity: 'error'
      });
    } finally {
      setIsPublishing(false);
    }
  };

  const handleNotificationClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setNotification({ ...notification, open: false });
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
      pending_review: { 
        color: theme.palette.info.main, 
        backgroundColor: alpha(theme.palette.info.main, 0.1),
        icon: <PendingIcon sx={{ fontSize: '1rem' }} />,
        label: 'Pending Review'
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
  const previewText = plainTextContent;

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
  const maxlines = hasImage ? 2 : 12;

  // Check if editing is disabled (pending review)
  const isEditingDisabled = article?.status === 'pending_review';

  // Get the appropriate action button based on article status
  const getActionButton = () => {
    switch (article?.status) {
      case 'published':
        return (
          <Button
            variant="outlined"
            size="small"
            startIcon={<VisibilityOffIcon />}
            onClick={(e) => handleStatusChange(e, 'draft')}
            color="secondary"
            sx={{
              flex: 1,
              textTransform: 'none',
              fontWeight: 600,
              borderRadius: 2,
            }}
          >
            Unpublish
          </Button>
        );
      case 'draft':
        return (
          <Button
            variant="outlined"
            size="small"
            startIcon={isPublishing ? <CircularProgress size={16} /> : <PublishIcon />}
            onClick={(e) => handleStatusChange(e, 'pending_review')}
            color="success"
            disabled={isPublishing}
            sx={{
              flex: 1,
              textTransform: 'none',
              fontWeight: 600,
              borderRadius: 2,
            }}
          >
            {isPublishing ? 'Publishing...' : 'Publish'}
          </Button>
        );
      case 'pending_review':
        return (
          <Button
            variant="outlined"
            size="small"
            startIcon={<CancelIcon />}
            onClick={(e) => handleStatusChange(e, 'draft')}
            color="warning"
            sx={{
              flex: 1,
              textTransform: 'none',
              fontWeight: 600,
              borderRadius: 2,
            }}
          >
            Withdraw
          </Button>
        );
      default:
        return null;
    }
  };

  // Early return if article is not provided (after all hooks)
  if (!article) {
    return null;
  }

  return (
    <>
      <Card
        onClick={handleCardClick}
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
          cursor: 'pointer',
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: '0 8px 25px rgba(0,0,0,0.12)',
            borderColor: theme.palette.primary.main,
          },
          opacity: article.status === 'draft' ? 0.9 : 1,
        }}
      >

        {/* Image Section - Only show if there's an image */}
        {hasImage && (
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

          {/* Content Preview - More lines when no image */}
          {previewText && (
            <Typography
              sx={{
                lineHeight: 1.6,
                fontSize: '0.875rem',
                color: theme.palette.text.secondary,
                overflow: 'hidden',
                display: '-webkit-box',
                WebkitBoxOrient: 'vertical',
                WebkitLineClamp: 12,
                height: hasImage ? '3em' : '16em', // Adjust height based on image presence
                mb: 2
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

            {/* Action Buttons */}
            <Stack direction="row" spacing={1}>
              {/* Edit Button - Only show when not pending review */}
              {!isEditingDisabled && (
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<EditIcon />}
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit(article.id);
                  }}
                  disabled={isPublishing}
                  sx={{
                    flex: 1,
                    textTransform: 'none',
                    fontWeight: 600,
                    borderRadius: 2,
                  }}
                >
                  Edit
                </Button>
              )}

              {getActionButton()}

              <Button
                variant="outlined"
                size="small"
                startIcon={<DeleteIcon />}
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(article.id);
                }}
                color="error"
                disabled={isPublishing}
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

      </Card>

      {/* Notification Snackbar */}
      <Snackbar
        open={notification.open}
        autoHideDuration={6000}
        onClose={handleNotificationClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          onClose={handleNotificationClose} 
          severity={notification.severity} 
          sx={{ width: '100%' }}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default WritingArticleCard;