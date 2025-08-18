import React, { useState, useCallback, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Bold from '@tiptap/extension-bold';
import Italic from '@tiptap/extension-italic';
import Underline from '@tiptap/extension-underline';
import BulletList from '@tiptap/extension-bullet-list';
import OrderedList from '@tiptap/extension-ordered-list';
import ListItem from '@tiptap/extension-list-item';
import { Link as TiptapLink } from '@tiptap/extension-link';
import { Link } from 'react-router-dom';
import TextAlign from '@tiptap/extension-text-align';
import Placeholder from '@tiptap/extension-placeholder';
import { articlesAPI } from '../services/api';
import ArticlePreview from '../components/Article/ArticlePreview';
import CircularProgress from '@mui/material/CircularProgress';
import {
  Box,
  Button,
  TextField,
  Typography,
  Alert,
  IconButton,
  Tooltip,
  Divider,
  Stack,
  Snackbar,
  Avatar,
  Grid,
  LinearProgress,
  Switch,
  FormControlLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  InputAdornment,
  ListItemIcon,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Slider,
  Badge,
  Menu
} from '@mui/material';

import { CloudUpload, Delete } from '@mui/icons-material';

import {
  FormatBold, FormatItalic, FormatUnderlined, FormatListBulleted, FormatListNumbered, 
  Link as LinkIcon,
  FormatAlignLeft, FormatAlignCenter, FormatAlignRight, FormatAlignJustify,
  Publish as PublishIcon, Save as SaveIcon, Preview as PreviewIcon,
  Fullscreen, FullscreenExit, Settings as SettingsIcon, AutoAwesome,
  CheckCircle, Warning, Error, Info, Close, SmartToy, Undo, Redo,
} from '@mui/icons-material';
import { Brightness4 as DarkModeIcon, Brightness7 as LightModeIcon } from '@mui/icons-material';
import { useTheme, alpha } from '@mui/material/styles';
import {
  ArticleContainer,
  MainContent,
  ArticleHeader,
  ArticleTitle,
  MetadataSection,
  ContentSection
} from './ArticlePage';
import { useAuth } from '../context/AuthContext';
import LogoutIcon from '@mui/icons-material/Logout';
import HelpIcon from '@mui/icons-material/Help';

const AUTOSAVE_INTERVAL = 5 * 60 * 1000; // 5 minutes

const SubmitArticlePage = ({ isDarkMode, setIsDarkMode }) => {
  const theme = useTheme();
  const HEADER_HEIGHT = 64;
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [profileAnchorEl, setProfileAnchorEl] = useState(null);
  const profileOpen = Boolean(profileAnchorEl);
  const location = useLocation();
  const { state } = location;
  const editingArticleId = state?.articleId;
  const isEditing = state?.isEditing;
  const fromWritePage = state?.fromWritePage;
  const [isPublishing, setIsPublishing] = useState(false);
  const articleStatus = state?.formData?.status || 'draft';
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const initialFormData = state?.formData || {
    title: '',
    content: '',
    author: user ? `${user.first_name} ${user.last_name}` : 'Current User',
    imageUrl: null,
  };

  // Redirect if not from write page
  useEffect(() => {
    if (!fromWritePage || !(articleStatus === 'draft' || articleStatus === undefined)) {
      navigate('/write');
    }
  }, [fromWritePage, articleStatus, navigate]);

  // State management
  const [formData, setFormData] = useState(initialFormData);
  const [editorState, setEditorState] = useState({
    isFullscreen: false,
    fontSize: 18,
    lineHeight: 1.7,
    fontFamily: 'Inter',
    enableAutoSave: true,
    saveInterval: AUTOSAVE_INTERVAL,
  });
  const [articleImage, setArticleImage] = useState(state.formData.imageUrl);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [ui, setUi] = useState({
    settingsOpen: false,
    snackbarOpen: false,
    snackbarMessage: '',
    snackbarSeverity: 'info',
    previewMode: false,
  });
  const [status, setStatus] = useState({ message: '', type: '', progress: 0 });
  const [stats, setStats] = useState({
    wordCount: 0, charCount: 0, sentenceCount: 0, paragraphCount: 0, readingTime: 0,
    readabilityScore: 0, engagement: 0, seoScore: 0, complexWords: 0, passiveVoice: 0, transitionWords: 0, subheadings: 0, images: 0, links: 0,
  });
  const [aiSuggestions, setAiSuggestions] = useState([]);
  const [linkDialogOpen, setLinkDialogOpen] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [articleId, setArticleId] = useState(editingArticleId || -1);
  const [imageLoading, setImageLoading] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);
  const autoSaveRef = useRef(null);



  // Fetch the existing image when editing
  useEffect(() => {
    if (isEditing && articleId) {
      setImageLoading(true);
      articlesAPI.getImages(articleId)
        .then(res => {
          const firstImage = res.data?.images?.[0];
          if (firstImage?.url) {
            setArticleImage(firstImage.url);
            setFormData(prev => ({ ...prev, imageUrl: firstImage.url }));
          }
        })
        .catch(err => {
          console.warn("Failed to fetch article images", err);
        })
        .finally(() => setImageLoading(false));
    } else {
      setArticleImage(initialFormData.imageUrl);
    }
  }, [isEditing, articleId, initialFormData.imageUrl]);

  useEffect(() => {
    setHasUnsavedChanges(
      formData.title !== (state?.formData?.title || '') ||
      formData.content !== (state?.formData?.content || '')
    );
  }, [formData, state]);

  // Alert on refresh/leave if unsaved
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = 'You have unsaved changes. Are you sure you want to leave?';
        return e.returnValue;
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [hasUnsavedChanges]);

  // Editor setup
  const editor = useEditor({
    extensions: [
      StarterKit,
      Bold,
      Italic,
      Underline,
      BulletList,
      OrderedList,
      ListItem,
      TiptapLink.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'link-style',
        },
      }),
      TextAlign.configure({ 
        types: ['heading', 'paragraph'],
        alignments: ['left', 'center', 'right', 'justify']
      }),
      Placeholder.configure({
        placeholder: 'Start writing your article here...',
        emptyEditorClass: 'is-editor-empty',
        showOnlyWhenEditable: true,
        showOnlyCurrent: false,
      }),
    ],
    content: formData.content,
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      setFormData(prev => ({
        ...prev,
        content: html
      }));
      setHasUnsavedChanges(true);
      analyzeContent(html);
    },
    editorProps: {
      attributes: {
        class: 'prose prose-lg max-w-none focus:outline-none tiptap-custom-editor',
        style: `
          min-height: 300px;
          padding: 1rem 2rem;
          font-size: ${editorState.fontSize}px;
          font-family: ${editorState.fontFamily};
          line-height: ${editorState.lineHeight};
        `,
        spellcheck: 'true',
      },
    },
  });

    // Autosave function
  const performAutoSave = useCallback(async () => {
    if (!editor || (!formData.title.trim() && !formData.content.trim())) return;
    try {
      setIsSubmitting(true);
      const result = await submitArticle({
        ...formData,
        content: editor.getHTML()
      }, articleId, true);
      if (result.article_id) setArticleId(Number(result.article_id));
      setLastSaved(new Date());
      setHasUnsavedChanges(false);
      showSnackbar('Auto-saved as draft', 'success');
    } catch (error) {
      console.error('Auto-save failed:', error);
      showSnackbar('Auto-save failed', 'warning');
    } finally {
      setIsSubmitting(false);
    }
  }, [formData, articleId, editor]);

  // Autosave every 5 min
  useEffect(() => {
    if (editorState.enableAutoSave) {
      autoSaveRef.current = setInterval(() => {
        if (hasUnsavedChanges) {
          performAutoSave();
        }
      }, AUTOSAVE_INTERVAL);
      return () => clearInterval(autoSaveRef.current);
    }
  }, [editorState.enableAutoSave, AUTOSAVE_INTERVAL, hasUnsavedChanges, performAutoSave]);

  // Helper: Snackbar
  const showSnackbar = (message, severity = 'info') => setUi(prev => ({
    ...prev,
    snackbarOpen: true,
    snackbarMessage: message,
    snackbarSeverity: severity
  }));

  // API
  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000/api';

  const submitArticle = async (articleData, articleId = -1, isDraft = false) => {
    try {
      const response = await articlesAPI.submit(articleData, articleId, isDraft);
      if (response.error) throw new Error(response.error || 'Failed to submit article');
      return response;
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  };

  // Image upload/delete
  const handleDeleteImage = async () => {
    if (!articleId || articleId === -1) {
      showSnackbar('No article associated with this image', 'warning');
      return;
    }

    try {
      await articlesAPI.deleteImage(articleId);
      setArticleImage(null);
      setFormData(prev => ({ ...prev, imageUrl: null }));
      showSnackbar('Image deleted successfully', 'success');
    } catch (error) {
      console.error('Failed to delete image:', error);
      showSnackbar(`Failed to delete image: ${error.message}`, 'error');
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      showSnackbar('Please select a valid image file (JPEG, PNG, GIF, WebP)', 'error');
      e.target.value = '';
      return;
    }
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      showSnackbar(`Image size must be less than ${maxSize / (1024 * 1024)}MB`, 'error');
      e.target.value = '';
      return;
    }
    try {
      let uploadArticleId = articleId;
      // For new articles, create a draft first
      if (articleId === -1) {
        if (!formData.title?.trim()) {
          showSnackbar('Please add a title before uploading images', 'warning');
          return;
        }
        try {
          const draftResult = await submitArticle({
            ...formData,
            content: editor ? editor.getHTML() : formData.content
          }, -1, true);
          if (draftResult?.article_id) {
            uploadArticleId = Number(draftResult.article_id);
            setArticleId(uploadArticleId);
            setLastSaved(new Date());
          } else {
            throw new Error('Failed to create draft - no article ID returned');
          }
        } catch (draftError) {
          console.error('Failed to create draft for image upload:', draftError);
          showSnackbar('Failed to save draft before image upload. Please try again.', 'error');
          return;
        }
      }
      // Upload the image
      const result = await articlesAPI.uploadImage(uploadArticleId, file);
      if (result?.url) {
        setArticleImage(result.url);
        setFormData(prev => ({ ...prev, imageUrl: result.url }));
        showSnackbar('Image uploaded successfully', 'success');
      } else {
        throw new Error('Upload failed - no URL returned');
      }
    } catch (error) {
      let errorMessage = 'Failed to upload image';
      if (error.response?.status === 413) errorMessage = 'Image file is too large';
      else if (error.response?.status === 415) errorMessage = 'Unsupported image format';
      else if (error.response?.data?.error) errorMessage = error.response.data.error;
      else if (error.message) errorMessage = error.message;
      showSnackbar(errorMessage, 'error');
    } finally {
      if (e.target) e.target.value = '';
    }
  };

  // Save draft
  const saveDraft = useCallback(async () => {
    if (!editor) return;
    try {
      setIsSubmitting(true);
      const result = await submitArticle({
        ...formData,
        content: editor.getHTML()
      }, articleId, true);
      if (result.article_id) setArticleId(Number(result.article_id));
      setLastSaved(new Date());
      setHasUnsavedChanges(false);
      showSnackbar('Draft saved successfully!', 'success');
      setStatus({ message: 'Draft saved successfully!', type: 'success', progress: 100 });
    } catch (error) {
      showSnackbar(`Failed to save draft: ${error.message}`, 'error');
      setStatus({ message: 'Failed to save draft', type: 'error', progress: 0 });
    } finally {
      setTimeout(() => setStatus({ message: '', type: '', progress: 0 }), 3000);
      setIsSubmitting(false);
    }
  }, [formData, articleId, editor]);



  // Content analysis (unchanged)
  const countSyllables = (word) => {
    return word
      .toLowerCase()
      .replace(/[^a-z]/g, '')
      .replace(/e$/, '')
      .replace(/[aeiouy]{2,}/g, 'a')
      .match(/[aeiouy]/g)?.length || 1;
  };
  const analyzeContent = useCallback((content) => {
    const text = content.replace(/<[^>]*>/g, '');
    const words = text.trim().split(/\s+/).filter(word => word.length > 0);
    const chars = text.length;
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const paragraphs = text.split(/\n\s*\n/).filter(p => p.trim().length > 0);
    const readingTime = Math.ceil(words.length / 200);
    const complexWords = words.filter(word => countSyllables(word) > 2).length;
    const passiveVoiceCount = (text.match(/\b(was|were|is|are|am|be|been|being)\s+\w+ed\b/gi) || []).length;
    const transitionWords = ['however', 'therefore', 'moreover', 'furthermore', 'nevertheless', 'consequently'];
    const transitionCount = words.filter(word => transitionWords.includes(word.toLowerCase())).length;
    const subheadings = (content.match(/<h[1-6][^>]*>/gi) || []).length;
    const images = (content.match(/<img[^>]*>/gi) || []).length;
    const links = (content.match(/<a[^>]*>/gi) || []).length;
    const avgWordsPerSentence = words.length / (sentences.length || 1);
    const avgSyllablesPerWord = words.reduce((acc, word) => acc + countSyllables(word), 0) / (words.length || 1);
    const readabilityScore = Math.max(0, Math.min(100, 206.835 - (1.015 * avgWordsPerSentence) - (84.6 * avgSyllablesPerWord)));
    const seoScore = Math.min(100,
      (formData.title.length >= 30 && formData.title.length <= 60 ? 20 : 5) +
      (formData.category ? 10 : 0) +
      (words.length >= 300 ? 10 : 0) +
      (images > 0 ? 10 : 0) +
      (links > 0 ? 5 : 0) +
      (subheadings > 0 ? 10 : 0)
    );
    const engagementScore = Math.min(100, Math.max(0,
      (readabilityScore * 0.3) +
      (Math.min(100, (words.length / 500) * 30) * 0.3) +
      (Math.min(100, (sentences.length / (paragraphs.length || 1)) * 10) * 0.2) +
      (Math.min(100, (transitionCount / (paragraphs.length || 1)) * 20) * 0.2)
    ));
    setStats({
      wordCount: words.length, charCount: chars, sentenceCount: sentences.length, paragraphCount: paragraphs.length,
      readingTime, readabilityScore: Math.round(readabilityScore), engagement: Math.round(engagementScore),
      seoScore: Math.round(seoScore), complexWords, passiveVoice: passiveVoiceCount, transitionWords: transitionCount,
      subheadings, images, links
    });
    generateAISuggestions({
      readabilityScore, seoScore, subheadings, paragraphCount: paragraphs.length, images, wordCount: words.length, passiveVoiceCount, sentenceCount: sentences.length, complexWords, transitionCount
    });
  }, [formData.title, formData.category]);

  // AI Suggestions
  const generateAISuggestions = (statsObj) => {
    const suggestions = [];
    if (statsObj.readabilityScore < 60) suggestions.push({ type: 'readability', title: 'Improve Readability', description: 'Shorten sentences, use simpler words.', priority: 'high' });
    if (statsObj.seoScore < 70) suggestions.push({ type: 'seo', title: 'Optimize for SEO', description: 'Fill meta, tags, category. Make title 30-60 chars.', priority: 'medium' });
    if (statsObj.subheadings === 0 && statsObj.paragraphCount > 3) suggestions.push({ type: 'structure', title: 'Add Subheadings', description: 'Break up content with subheadings.', priority: 'medium' });
    if (statsObj.images === 0 && statsObj.wordCount > 500) suggestions.push({ type: 'media', title: 'Add Images', description: 'Include images for engagement.', priority: 'low' });
    if (statsObj.passiveVoiceCount > (statsObj.sentenceCount || 0) * 0.2) suggestions.push({ type: 'voice', title: 'Use Active Voice', description: 'Reduce passive voice.', priority: 'medium' });
    setAiSuggestions(suggestions);
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e) => {
      if ((e.ctrlKey || e.metaKey) && !e.altKey && editor) {
        switch (e.key.toLowerCase()) {
          case 'b': 
            e.preventDefault();
            editor.chain().focus().toggleBold().run();
            break;
          case 'i': 
            e.preventDefault();
            editor.chain().focus().toggleItalic().run();
            break;
          case 'u': 
            e.preventDefault();
            editor.chain().focus().toggleUnderline().run();
            break;
          case 's':
            e.preventDefault();
            saveDraft();
            break;
          default: 
            break;
        }
      }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [editor, saveDraft]);

  // Title change
  const handleTitleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      title: e.target.value
    }));
    setHasUnsavedChanges(true);
  };

  // Toolbar actions
  const formatActions = [
    { 
      icon: FormatBold, 
      label: 'Bold', 
      action: () => editor?.chain().focus().toggleBold().run(), 
      shortcut: 'Ctrl+B',
      isActive: editor?.isActive('bold')
    },
    { 
      icon: FormatItalic, 
      label: 'Italic', 
      action: () => editor?.chain().focus().toggleItalic().run(), 
      shortcut: 'Ctrl+I',
      isActive: editor?.isActive('italic')
    },
    { 
      icon: FormatUnderlined, 
      label: 'Underline', 
      action: () => editor?.chain().focus().toggleUnderline().run(), 
      shortcut: 'Ctrl+U',
      isActive: editor?.isActive('underline')
    },
    { 
      icon: FormatListBulleted, 
      label: 'Bullet List', 
      action: () => editor?.chain().focus().toggleBulletList().run(),
      isActive: editor?.isActive('bulletList')
    },
    { 
      icon: FormatListNumbered, 
      label: 'Numbered List', 
      action: () => editor?.chain().focus().toggleOrderedList().run(),
      isActive: editor?.isActive('orderedList')
    },
    { 
      icon: LinkIcon, 
      label: 'Insert Link', 
      action: () => {
        if (!editor) return;
        const isSelection = !editor.state.selection.empty;
        if (!isSelection) {
          showSnackbar('Select some text first', 'warning');
          return;
        }
        const previousUrl = editor.getAttributes('link').href;
        setLinkUrl(previousUrl || '');
        setLinkDialogOpen(true);
      },
      isActive: editor?.isActive('link'),
      isDisabled: editor ? editor.state.selection.empty : true
    },
    { 
      icon: FormatAlignLeft, 
      label: 'Align Left', 
      action: () => editor?.chain().focus().setTextAlign('left').run(),
      isActive: editor?.isActive({ textAlign: 'left' })
    },
    { 
      icon: FormatAlignCenter, 
      label: 'Align Center', 
      action: () => editor?.chain().focus().setTextAlign('center').run(),
      isActive: editor?.isActive({ textAlign: 'center' })
    },
    { 
      icon: FormatAlignRight, 
      label: 'Align Right', 
      action: () => editor?.chain().focus().setTextAlign('right').run(),
      isActive: editor?.isActive({ textAlign: 'right' })
    },
    { 
      icon: FormatAlignJustify, 
      label: 'Justify', 
      action: () => editor?.chain().focus().setTextAlign('justify').run(),
      isActive: editor?.isActive({ textAlign: 'justify' })
    },
  ];

  const handlePublish = async () => {
      // ...validation...
      setIsPublishing(true);
      try {
        // Save/update draft first (unchanged)
        const submissionId = articleId === -1 ? undefined : Number(articleId);
        const result = await submitArticle(formData, submissionId, false);

        // Change status to 'pending_review'
        await articlesAPI.changeStatus(result.article_id || articleId, 'pending_review');

        showSnackbar('Article submitted for review successfully!', 'success');
        setStatus({ message: 'Article submitted for review successfully!', type: 'success', progress: 100 });

        // Redirect to write after publish
        setTimeout(() => {
          navigate('/write');
        }, 1600); // Wait for success message to show

      } catch (error) {
        let errorMessage = 'Failed to publish article';
        if (error.response?.data?.message) errorMessage = error.response.data.message;
        else if (error.message) errorMessage = error.message;
        showSnackbar(errorMessage, 'error');
        setStatus({ message: errorMessage, type: 'error', progress: 0 });
      } finally {
        setTimeout(() => setStatus({ message: '', type: '', progress: 0 }), 3000);
        setIsPublishing(false);
      }
    };

  // Fullscreen
  const toggleFullscreen = () => setEditorState(prev => ({ ...prev, isFullscreen: !prev.isFullscreen }));

  // Color helpers
  const getColor = (score) => {
    if (score > 80) return 'success.main';
    if (score > 60) return 'info.main';
    if (score > 40) return 'warning.main';
    return 'error.main';
  };





  const FONT_OPTIONS = [
    { value: 'Inter', label: 'Inter' },
    { value: 'Roboto', label: 'Roboto' },
    { value: 'Open Sans', label: 'Open Sans' },
    { value: 'Merriweather', label: 'Merriweather' },
    { value: 'Georgia', label: 'Georgia' },
    { value: 'Times New Roman', label: 'Times New Roman' },
  ];

  const handleThemeToggle = () => {
    setIsDarkMode(!isDarkMode);
  };

    const handleProfileMenuOpen = (event) => {
    setProfileAnchorEl(event.currentTarget);
  };

  const handleProfileMenuClose = () => {
    setProfileAnchorEl(null);
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
      handleProfileMenuClose();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

    // Save draft function
  const handleSaveDraft = async () => {
    if (isSubmitting) return;
    
    setIsSubmitting(true);
    setStatus({ message: 'Saving draft...', type: 'info', progress: 50 });

    try {
      const result = await submitArticle(formData, articleId, true);

      // Update article ID if this was a new draft
      if (result.article_id) {
        const newId = Number(result.article_id);
        setArticleId(newId);
      }

      const now = new Date();
      setLastSaved(now);
      setStatus({ message: 'Draft saved successfully!', type: 'success', progress: 100 });
      showSnackbar('Draft saved successfully!', 'success');
      
    } catch (error) {
      setStatus({ message: 'Failed to save draft', type: 'error', progress: 0 });
      showSnackbar(`Failed to save draft: ${error.message}`, 'error');
    } finally {
      setTimeout(() => {
        setStatus({ message: '', type: '', progress: 0 });
      }, 3000);
      setIsSubmitting(false);
    }
  };

  return (
    <Box
      sx={{
        bgcolor: t => t.palette.background.default,
        minHeight: '100vh', width: '100vw',
        display: 'flex', flexDirection: 'column',
        position: 'relative'
      }}
    >
      {/* Header */}
<Box sx={{
  position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1201,
  bgcolor: t => t.palette.background.paper,
  boxShadow: t => t.shadows[1],
  borderBottom: t => `1px solid ${t.palette.divider}`,
  height: HEADER_HEIGHT,
  display: 'flex', alignItems: 'center', px: 4
}}>
  <Box sx={{ 
    flex: 1, 
    display: 'flex', 
    alignItems: 'center', 
    gap: 2,
    height: HEADER_HEIGHT
  }}>
    <Typography 
      component={Link}
      to="/dashboard"
      variant="h4"
      sx={{ 
        fontWeight: 800,
        background: theme => `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
        backgroundClip: 'text',
        WebkitBackgroundClip: 'text',
        color: 'transparent',
        letterSpacing: '-0.5px',
        fontSize: '2rem',
        display: 'block',
        lineHeight: 1,
        transform: 'translateY(5px)',
        textDecoration: 'none',
        '&:hover': {
          opacity: 0.9
        }
      }}
    >
      Cognara
    </Typography>
    {lastSaved && (
      <Typography variant="caption" color="text.secondary" sx={{ ml: 2 }}>
        Last saved: {lastSaved.toLocaleTimeString()}
      </Typography>
    )}
  </Box>
  <Stack direction="row" spacing={2} alignItems="center">
    <MenuItem onClick={handleThemeToggle}>
      <ListItemIcon>
        {isDarkMode ? <LightModeIcon fontSize="small" /> : <DarkModeIcon fontSize="small" />}
      </ListItemIcon>
    </MenuItem>
    <Button 
      variant="outlined" 
      startIcon={<SaveIcon />} 
      size="small" 
      onClick={handleSaveDraft} 
      disabled={isSubmitting}
      sx={{ borderRadius: 2 }}
    >
      {isSubmitting ? 'Saving...' : 'Save Draft'}
    </Button>
    <Button 
      variant="outlined" 
      startIcon={<PreviewIcon />} 
      size="small" 
      onClick={() => setUi(prev => ({ ...prev, previewMode: !prev.previewMode }))} 
      sx={{ borderRadius: 2 }}
    >
      {ui.previewMode ? 'Exit Preview' : 'Preview'}
    </Button>
    <Button 
      variant="contained" 
      startIcon={<PublishIcon />} 
      size="small" 
      onClick={handlePublish}
      disabled={isSubmitting}
      sx={{ borderRadius: 2 }}
    >
      {isSubmitting ? 'Publishing...' : 'Publish'}
    </Button>
    <IconButton onClick={() => setUi(prev => ({ ...prev, settingsOpen: true }))}>
      <SettingsIcon />
    </IconButton>
    
    {/* User Avatar with dropdown */}
    <Box 
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 1.5,
        cursor: 'pointer',
        p: 1,
        borderRadius: 2,
        transition: 'all 0.2s ease',
        '&:hover': {
          backgroundColor: 'rgba(255, 255, 255, 0.08)'
        }
      }}
      onClick={handleProfileMenuOpen}
    >
      <Badge
        overlap="circular"
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        variant="dot"
        sx={{
          '& .MuiBadge-badge': {
            backgroundColor: theme.palette.success.main,
            color: theme.palette.success.main,
            boxShadow: `0 0 0 2px ${theme.palette.background.paper}`,
          }
        }}
      >
        <Avatar 
          src={user?.profilePicture || ''} 
          alt={`${user?.first_name} ${user?.last_name}`}
          sx={{
            width: 36,
            height: 36,
            bgcolor: theme.palette.primary.main,
            color: theme.palette.primary.contrastText,
            fontSize: '0.875rem',
            fontWeight: 600
          }}
        >
          {user?.first_name?.charAt(0)}{user?.last_name?.charAt(0)}
        </Avatar>
      </Badge>
      <Typography 
        variant="subtitle2"
        sx={{
          fontWeight: 600,
          color: 'text.primary',
        }}
      >
        {user?.first_name} {user?.last_name}
      </Typography>
    </Box>
  </Stack>

  {/* Profile dropdown menu */}
  <Menu
    anchorEl={profileAnchorEl}
    open={profileOpen}
    onClose={handleProfileMenuClose}
    anchorOrigin={{
      vertical: 'bottom',
      horizontal: 'center',
    }}
    transformOrigin={{
      vertical: 'top',
      horizontal: 'center',
    }}
    PaperProps={{
      sx: {
        mt: 1,
        minWidth: 200,
        borderRadius: 1,
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
        '& .MuiMenuItem-root': {
          px: 2,
          py: '6px',
        },
      },
    }}
  >
    <MenuItem onClick={handleProfileMenuClose} component={Link} to="/settings">
      <ListItemIcon>
        <SettingsIcon fontSize="small" />
      </ListItemIcon>
      Settings
    </MenuItem>
    <MenuItem onClick={handleProfileMenuClose} component={Link} to="/help">
      <ListItemIcon>
        <HelpIcon fontSize="small" />
      </ListItemIcon>
      Help
    </MenuItem>
    <Divider sx={{ my: 0.5 }} />
    <MenuItem onClick={() => {
      handleThemeToggle();
      handleProfileMenuClose();
    }}>
      <ListItemIcon>
        {isDarkMode ? <LightModeIcon fontSize="small" /> : <DarkModeIcon fontSize="small" />}
      </ListItemIcon>
      {isDarkMode ? 'Light Mode' : 'Dark Mode'}
    </MenuItem>
    <Divider sx={{ my: 0.5 }} />
    <MenuItem onClick={handleLogout}>
      <ListItemIcon>
        <LogoutIcon fontSize="small" color="error" />
      </ListItemIcon>
      <Typography color="error">Logout</Typography>
    </MenuItem>
  </Menu>
</Box>

      {/* Main Content / Preview Mode */}
      <Box sx={{
        flex: 1,
        pt: `${HEADER_HEIGHT}px`,
        minHeight: '100vh',
        width: '100vw',
        overflow: 'hidden'
      }}>
        {ui.previewMode ? (
          <ArticlePreview 
            articleData={{ ...formData }}
            articleId={articleId}
            onExitPreview={() => setUi(prev => ({ ...prev, previewMode: false }))}
          />
        ) : (
          <Box sx={{ 
            display: 'flex', 
            flexDirection: 'row', 
            height: `calc(100vh - ${HEADER_HEIGHT}px)`,
            overflow: 'hidden'
          }}>
            {/* Editor - left pane */}
            <Box sx={{
              flex: 2,
              minWidth: 0,
              borderRight: t => `1px solid ${t.palette.divider}`,
              display: 'flex',
              flexDirection: 'column',
              height: '100%',
              bgcolor: 'background.default',
              overflow: 'hidden', // Change from 'auto' to 'hidden'
            }}>
              {/* Editor toolbar - Make this sticky */}
              <Box sx={{ 
                position: 'sticky', 
                top: 0, 
                zIndex: 10, 
                bgcolor: 'background.paper',
                display: 'flex', 
                alignItems: 'center', 
                py: 1, 
                px: 3, 
                borderBottom: t => `1px solid ${t.palette.divider}`, 
                gap: 1 
              }}>
                <Box sx={{ flexGrow: 1 }} />
                  <Tooltip title={articleImage ? "Replace Image" : "Upload Image"}>
                    <IconButton
                      component="label"
                      disabled={isUploadingImage}
                      sx={{
                        color: articleImage ? 'primary.main' : 'text.primary',
                        bgcolor: articleImage ? 'primary.lighter' : 'transparent',
                        border: t => articleImage ? `1px solid ${t.palette.primary.main}` : 'none',
                        position: 'relative',
                        '&:hover .delete-overlay': {
                          opacity: 1,
                        }
                      }}
                    >
                      <input
                        type="file"
                        hidden
                        accept="image/*"
                        onChange={handleImageUpload}
                      />
                      {isUploadingImage ? <CircularProgress size={24} /> : <CloudUpload />}
                      
                      {/* Delete overlay */}
                      {articleImage && (
                        <Box
                          className="delete-overlay"
                          sx={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            bgcolor: 'rgba(0,0,0,0.5)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            opacity: 0,
                            transition: 'opacity 0.2s',
                            borderRadius: '50%',
                            cursor: 'pointer',
                            zIndex: 1, // Ensure overlay is on top
                          }}
                          onMouseDown={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                          }}
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleDeleteImage();
                          }}
                        >
                          <Close fontSize="small" sx={{ color: 'common.white' }} />
                        </Box>
                      )}
                    </IconButton>
                  </Tooltip>
                {formatActions.map((item, index) => (
                  <Tooltip key={index} title={`${item.label}${item.shortcut ? ` (${item.shortcut})` : ''}`}>
                    <IconButton 
                      size="small" 
                      onClick={item.action} 
                      // Update the disabled prop to include item.isDisabled
                      disabled={!editor || item.isDisabled}
                      sx={{
                        color: item.isActive ? 'primary.main' : 'text.primary',
                        bgcolor: item.isActive ? 'primary.lighter' : 'transparent',
                        border: t => item.isActive ? `1px solid ${t.palette.primary.main}` : 'none',
                        '&:hover': {
                          bgcolor: t => item.isActive 
                            ? alpha(t.palette.primary.main, 0.15)
                            : alpha(t.palette.action.hover, 0.08),
                        },
                        '&:disabled': {
                          color: 'action.disabled',
                          bgcolor: 'transparent',
                        },
                        transition: t => t.transitions.create(['background-color', 'color', 'border'], {
                          duration: t.transitions.duration.shorter
                        }),
                      }}
                    >
                      <item.icon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                ))}
                <Divider orientation="vertical" flexItem sx={{ mx: 1, height: 28 }} />
                <Tooltip title="Undo">
                  <IconButton 
                    size="small" 
                    onClick={() => editor && editor.chain().focus().undo().run()} 
                    disabled={!editor || !editor.can().undo()}
                  >
                    <Undo />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Redo">
                  <IconButton 
                    size="small" 
                    onClick={() => editor && editor.chain().focus().redo().run()} 
                    disabled={!editor || !editor.can().redo()}
                  >
                    <Redo />
                  </IconButton>
                </Tooltip>
                <Box sx={{ flexGrow: 1 }} />
                <Tooltip title="Toggle Fullscreen">
                  <IconButton size="small" onClick={toggleFullscreen}>
                    {editorState.isFullscreen ? <FullscreenExit /> : <Fullscreen />}
                  </IconButton>
                </Tooltip>
              </Box>

                {/* Scrollable content area - Updated with custom scrollbar */}
                <Box sx={{ 
                  flex: 1,
                  overflowY: 'auto',
                  // Custom scrollbar styles
                  scrollbarWidth: 'thin',
                  scrollbarColor: `${theme.palette.primary.main} ${theme.palette.background.paper}`,
                  '&::-webkit-scrollbar': {
                    width: '8px',
                  },
                  '&::-webkit-scrollbar-track': {
                    background: theme.palette.background.paper,
                    borderRadius: '4px',
                  },
                  '&::-webkit-scrollbar-thumb': {
                    backgroundColor: theme.palette.primary.main,
                    borderRadius: '4px',
                    '&:hover': {
                      backgroundColor: theme.palette.primary.dark,
                    }
                  },
                }}>
                  {/* Title and subtitle section */}
                  <Box sx={{ 
                    p: 4, 
                    pb: 2,
                    wordBreak: 'break-word',
                  }}>
            <TextField
              fullWidth 
              variant="standard" 
              placeholder="Article Title..."
              value={formData.title} 
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              InputProps={{
                disableUnderline: true,
                sx: { 
                  fontSize: '2.3rem', 
                  fontWeight: 700, 
                  letterSpacing: '-0.5px',
                  wordBreak: 'break-word', // Ensure title wraps
                }
              }} 
              sx={{ mb: 1 }}
            />
                </Box>
                <Divider sx={{ mb: 0 }} />

                {/* Tiptap Editor */}
                <Box sx={{ 
                  flex: 1, 
                  position: 'relative',
                  '& .tiptap-custom-editor': {
                    outline: 'none',
                    minHeight: '400px',
                    bgcolor: 'background.default',
                    color: theme.palette.text.primary,
                    fontFamily: theme.typography.fontFamily,
                    '&.is-editor-empty::before': {
                      content: 'attr(data-placeholder)',
                      color: theme.palette.text.secondary,
                      opacity: 0.6,
                      fontStyle: 'italic',
                      pointerEvents: 'none',
                      position: 'absolute',
                      left: 0,
                      top: 0,
                      padding: '1rem 2rem',
                      width: '100%',
                      display: 'block',
                      whiteSpace: 'pre-line',
                    },
                  },
                }}>
                  {editor && <EditorContent editor={editor} />}
                </Box>
              </Box>
            </Box>

            {/* Analysis/AI/Stats - right pane */}
            <Box sx={{
              flex: 1,
              minWidth: 320,
              maxWidth: 430,
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              position: 'relative',
              bgcolor: 'background.paper',
              overflowY: 'auto',
              scrollbarWidth: 'none',
              msOverflowStyle: 'none',
              '&::-webkit-scrollbar': { display: 'none' },
            }}>
              <Box sx={{ p: 4, pb: 1 }}>
                {/* Overall Score */}
                <Box sx={{ textAlign: 'center', mb: 2 }}>
                  <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 0.5 }}>Overall score</Typography>
                  <Typography variant="h2" sx={{
                    fontWeight: 700,
                    color: getColor((stats.readabilityScore + stats.engagement + stats.seoScore) / 3),
                    my: 1
                  }}>{Math.round((stats.readabilityScore + stats.engagement + stats.seoScore) / 3)}</Typography>
                  <Typography variant="body2" color="text.secondary">{stats.wordCount} words</Typography>
                </Box>
                <Divider sx={{ mb: 2 }} />

                {/* Suggestions */}
                <Box sx={{ mb: 2 }}>
                  <Typography variant="h6" sx={{ mb: 1, fontWeight: 600 }}>Suggestions</Typography>
                  <Stack spacing={2}>
                    {aiSuggestions.length === 0 ? (
                      <Alert severity="success" sx={{ borderRadius: 2 }}>Your content looks good!</Alert>
                    ) : (
                      aiSuggestions.map((s, i) => (
                        <Alert key={i} severity={
                          s.priority === 'high' ? 'error' : s.priority === 'medium' ? 'warning' : 'info'
                        } sx={{ borderRadius: 2 }}>
                          <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>{s.title}</Typography>
                          <Typography variant="body2">{s.description}</Typography>
                        </Alert>
                      ))
                    )}
                  </Stack>
                </Box>

                {/* Stats */}
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 600 }}>Document stats</Typography>
                  <Grid container spacing={1}>
                    <Grid item xs={6}>
                      <Typography variant="body2"><b>Characters:</b> {stats.charCount}</Typography>
                      <Typography variant="body2"><b>Sentences:</b> {stats.sentenceCount}</Typography>
                      <Typography variant="body2"><b>Paragraphs:</b> {stats.paragraphCount}</Typography>
                      <Typography variant="body2"><b>Subheadings:</b> {stats.subheadings}</Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2"><b>Reading time:</b> {stats.readingTime} min</Typography>
                      <Typography variant="body2"><b>Complex words:</b> {stats.complexWords}</Typography>
                      <Typography variant="body2"><b>Passive voice:</b> {stats.passiveVoice}</Typography>
                      <Typography variant="body2"><b>Transition words:</b> {stats.transitionWords}</Typography>
                    </Grid>
                  </Grid>
                </Box>

                {/* AI Writing Assistant */}
                <Box sx={{
                  border: t => `1px solid ${t.palette.divider}`,
                  borderRadius: 3,
                  p: 2,
                  mt: 1
                }}>
                  <Typography variant="h6" sx={{ mb: 1, display: 'flex', alignItems: 'center' }}>
                    <SmartToy fontSize="small" sx={{ mr: 1, color: 'primary.main' }} />
                    AI Writing Assistant
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    Get AI-powered writing suggestions.
                  </Typography>
                  <Button variant="outlined" fullWidth sx={{ borderRadius: 2 }} startIcon={<AutoAwesome />}>Improve with AI</Button>
                </Box>
              </Box>
            </Box>
          </Box>
        )}
      </Box>

      {/* Snackbar */}
      <Snackbar
        open={ui.snackbarOpen}
        autoHideDuration={6000}
        onClose={() => setUi(prev => ({ ...prev, snackbarOpen: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setUi(prev => ({ ...prev, snackbarOpen: false }))}
          severity={ui.snackbarSeverity}
          sx={{ width: '100%', borderRadius: 2, boxShadow: 3 }}
        >{ui.snackbarMessage}</Alert>
      </Snackbar>

      {/* Settings Dialog */}
      <Dialog 
        open={ui.settingsOpen} 
        onClose={() => setUi(prev => ({ ...prev, settingsOpen: false }))}
        PaperProps={{
          sx: {
            borderRadius: 3,
            minWidth: 400,
            background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
          }
        }}
      >
        <DialogTitle 
          sx={{ 
            background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
            color: 'white',
            textAlign: 'center',
            fontWeight: 600,
            fontSize: '1.25rem',
            py: 3,
            position: 'relative',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(29, 78, 216, 0.1) 100%)',
              backdropFilter: 'blur(10px)',
            }
          }}
        >
          <Box sx={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
            <SettingsIcon sx={{ fontSize: '1.5rem' }} />
            Editor Settings
          </Box>
        </DialogTitle>
        
        <DialogContent sx={{ p: 4, background: 'transparent' }}>
          {/* Auto-Save Section */}
          <Box 
            sx={{ 
              p: 4,
              borderRadius: 3,
              background: 'rgba(255, 255, 255, 0.8)',
              backdropFilter: 'blur(15px)',
              border: '1px solid rgba(255, 255, 255, 0.3)',
              boxShadow: '0 8px 16px -4px rgba(0, 0, 0, 0.1)',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box 
                  sx={{ 
                    width: 48,
                    height: 48,
                    borderRadius: 2,
                    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.5rem',
                  }}
                >
                  💾
                </Box>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 700, color: '#1f2937', mb: 0.5 }}>
                    Auto-Save
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#6b7280', fontSize: '0.875rem', lineHeight: 1.4 }}>
                    Automatically save your work as you type for peace of mind
                  </Typography>
                </Box>
              </Box>
              <Switch 
                checked={editorState.enableAutoSave} 
                onChange={(e) => setEditorState(prev => ({ ...prev, enableAutoSave: e.target.checked }))}
                sx={{
                  transform: 'scale(1.2)',
                  '& .MuiSwitch-switchBase.Mui-checked': {
                    color: '#10b981',
                  },
                  '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                    backgroundColor: '#10b981',
                  },
                  '& .MuiSwitch-track': {
                    backgroundColor: '#d1d5db',
                  },
                }}
              />
            </Box>
          </Box>
        </DialogContent>
        
        <DialogActions sx={{ p: 3, pt: 0, background: 'transparent' }}>
          <Button 
            onClick={() => setUi(prev => ({ ...prev, settingsOpen: false }))}
            variant="contained"
            fullWidth
            sx={{
              background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
              color: 'white',
              fontWeight: 600,
              py: 1.5,
              borderRadius: 2,
              textTransform: 'none',
              fontSize: '1rem',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
              '&:hover': {
                background: 'linear-gradient(135deg, #2563eb 0%, #1e40af 100%)',
                boxShadow: '0 6px 8px -1px rgba(0, 0, 0, 0.15)',
              },
            }}
          >
            Save Settings
          </Button>
        </DialogActions>
      </Dialog>


      {/* Link Dialog */}
      <Dialog 
        open={linkDialogOpen} 
        onClose={() => setLinkDialogOpen(false)}
        PaperProps={{
          sx: { 
            borderRadius: 2,
            width: '100%',
            maxWidth: '400px',
          }
        }}
      >
        <DialogTitle sx={{ 
          pb: 1,
          display: 'flex',
          alignItems: 'center',
          gap: 1
        }}>
          <LinkIcon color="primary" />
          Insert Link
        </DialogTitle>
        <DialogContent sx={{ pt: '8px !important' }}>
          <TextField
            autoFocus
            fullWidth
            placeholder="https://example.com"
            value={linkUrl}
            onChange={(e) => setLinkUrl(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <LinkIcon color="action" />
                </InputAdornment>
              ),
              endAdornment: linkUrl && (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => setLinkUrl('')}
                    edge="end"
                    size="small"
                  >
                    <Close fontSize="small" />
                  </IconButton>
                </InputAdornment>
              ),
            }}
            sx={{ mt: 1 }}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button 
            onClick={() => {
              setLinkDialogOpen(false);
              setLinkUrl('');
            }} 
            color="inherit"
          >
            Cancel
          </Button>
          <Button
            color="error"
            onClick={() => {
              editor.chain().focus().extendMarkRange('link').unsetLink().run();
              setLinkDialogOpen(false);
              setLinkUrl('');
            }}
            disabled={!editor || !editor.isActive('link')}
          >
            Remove Link
          </Button>
          <Button
            variant="contained"
            onClick={() => {
              if (linkUrl && editor) {
                // Only apply to the current selection
                editor
                  .chain()
                  .focus()
                  .setLink({ href: linkUrl })
                  .run();
              }
              setLinkDialogOpen(false);
              setLinkUrl('');
            }}
            disabled={!editor || !linkUrl}
          >
            Apply
          </Button>
        </DialogActions>
      </Dialog>

      {/* Status Alert */}
      {status.message && (
        <Box sx={{ position: 'fixed', top: 90, right: 20, zIndex: 1300, minWidth: 300 }}>
          <Alert
            severity={status.type}
            icon={
              status.type === 'success' ? <CheckCircle /> :
              status.type === 'error' ? <Error /> :
              status.type === 'warning' ? <Warning /> : <Info />
            }
            action={
              <IconButton
                size="small"
                onClick={() => setStatus({ message: '', type: '', progress: 0 })}
              ><Close /></IconButton>
            }
            sx={{ boxShadow: 3, borderRadius: 2 }}
          >
            {status.message}
            {status.progress > 0 && (
              <LinearProgress variant="determinate" value={status.progress} sx={{ mt: 1, borderRadius: 1 }} />
            )}
          </Alert>
        </Box>
      )}
    </Box>
  );
};

export default SubmitArticlePage;