import React, { useState, useCallback, useEffect, useRef, useContext } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Bold from '@tiptap/extension-bold';
import Italic from '@tiptap/extension-italic';
import Underline from '@tiptap/extension-underline';
import BulletList from '@tiptap/extension-bullet-list';
import OrderedList from '@tiptap/extension-ordered-list';
import ListItem from '@tiptap/extension-list-item';
import Link from '@tiptap/extension-link';
import TextAlign from '@tiptap/extension-text-align';
import Placeholder from '@tiptap/extension-placeholder';
import { articlesAPI } from '../services/api';
import {
  Box, Button, TextField, Typography, Alert, IconButton, Tooltip, Divider,
  Stack, Snackbar, Avatar, Grid, LinearProgress, Switch, FormControlLabel, 
  Dialog, DialogTitle, DialogContent, DialogActions, InputAdornment, ListItemIcon, MenuItem,
} from '@mui/material';

import {
  FormatBold, FormatItalic, FormatUnderlined, FormatListBulleted, FormatListNumbered, 
  Link as LinkIcon, // Change this line
  FormatAlignLeft, FormatAlignCenter, FormatAlignRight, FormatAlignJustify,
  Publish as PublishIcon, Save as SaveIcon, Preview as PreviewIcon,
  Fullscreen, FullscreenExit, Settings as SettingsIcon, AutoAwesome,
  CheckCircle, Warning, Error, Info, Close, SmartToy, Undo, Redo,
} from '@mui/icons-material';
import { Brightness4 as DarkModeIcon, Brightness7 as LightModeIcon } from '@mui/icons-material';
import { useTheme, alpha } from '@mui/material/styles';

const SubmitArticlePage = ({ isDarkMode, setIsDarkMode }) => {
  const theme = useTheme();
  const HEADER_HEIGHT = 64;
  const [formData, setFormData] = useState({
    title: '', subtitle: '', content: '',
    author: 'Current User'
  });
  
  const [editorState, setEditorState] = useState({
    isFullscreen: false, fontSize: 18, lineHeight: 1.7, fontFamily: 'Inter', enableAutoSave: true, saveInterval: 30000
  });
  const [ui, setUi] = useState({ settingsOpen: false, snackbarOpen: false, snackbarMessage: '', snackbarSeverity: 'info', previewMode: false });
  const [status, setStatus] = useState({ message: '', type: '', progress: 0 });
  const [stats, setStats] = useState({
    wordCount: 0, charCount: 0, sentenceCount: 0, paragraphCount: 0, readingTime: 0,
    readabilityScore: 0, engagement: 0, seoScore: 0, complexWords: 0, passiveVoice: 0, transitionWords: 0, subheadings: 0, images: 0, links: 0,
  });
  const [aiSuggestions, setAiSuggestions] = useState([]);
  const [linkDialogOpen, setLinkDialogOpen] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [articleId, setArticleId] = useState(-1); // Track if this is an existing article
  const [lastSaved, setLastSaved] = useState(null);
  const autoSaveRef = useRef(null);

  const handleThemeToggle = () => {
    setIsDarkMode(!isDarkMode);
  };

  // API Configuration
  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000/api';

  // API call function
  const submitArticle = async (articleData, articleId = -1, isDraft = false) => {
    try {
      const response = await articlesAPI.submit(articleData, articleId, isDraft);
      
      if (response.error) {
        throw new Error(response.error || 'Failed to submit article');
      }
      
      return response;
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  };

  // Single Tiptap editor instance
  const editor = useEditor({
    extensions: [
      StarterKit,
      Bold,
      Italic,
      Underline,
      BulletList,
      OrderedList,
      ListItem,
      Link.configure({
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
      setFormData(prev => ({ ...prev, content: html }));
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

  // Content Analysis
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

  const performAutoSave = useCallback(async () => {
    if (formData.title.trim() || formData.content.trim()) {
      try {
        await submitArticle(formData, articleId, true); // Pass articleId here
        setLastSaved(new Date());
        showSnackbar('Auto-saved as draft', 'success');
      } catch (error) {
        console.error('Auto-save failed:', error);
        showSnackbar('Auto-save failed', 'warning');
      }
    }
  }, [formData, articleId]);

  // Auto-save
  useEffect(() => {
    if (editorState.enableAutoSave && (formData.title.trim() || formData.content.trim())) {
      // Clear existing interval
      if (autoSaveRef.current) {
        clearInterval(autoSaveRef.current);
      }
      
      // Set new interval
      autoSaveRef.current = setInterval(performAutoSave, editorState.saveInterval);
    } else if (autoSaveRef.current) {
      clearInterval(autoSaveRef.current);
    }

    return () => {
      if (autoSaveRef.current) {
        clearInterval(autoSaveRef.current);
      }
    };
  }, [editorState.enableAutoSave, editorState.saveInterval, performAutoSave]);

  // Snackbar
  const showSnackbar = (message, severity = 'info') => setUi(prev => ({ ...prev, snackbarOpen: true, snackbarMessage: message, snackbarSeverity: severity }));

  // Improved toolbar actions - preserve selection and don't auto-clear
  const formatActions = [
    { 
      icon: FormatBold, 
      label: 'Bold', 
      action: () => {
        if (!editor) return;
        editor.chain().focus().toggleBold().run();
      }, 
      shortcut: 'Ctrl+B',
      isActive: editor?.isActive('bold')
    },
    { 
      icon: FormatItalic, 
      label: 'Italic', 
      action: () => {
        if (!editor) return;
        editor.chain().focus().toggleItalic().run();
      }, 
      shortcut: 'Ctrl+I',
      isActive: editor?.isActive('italic')
    },
    { 
      icon: FormatUnderlined, 
      label: 'Underline', 
      action: () => {
        if (!editor) return;
        editor.chain().focus().toggleUnderline().run();
      }, 
      shortcut: 'Ctrl+U',
      isActive: editor?.isActive('underline')
    },
    { 
      icon: FormatListBulleted, 
      label: 'Bullet List', 
      action: () => {
        if (!editor) return;
        editor.chain().focus().toggleBulletList().run();
      },
      isActive: editor?.isActive('bulletList')
    },
    { 
      icon: FormatListNumbered, 
      label: 'Numbered List', 
      action: () => {
        if (!editor) return;
        editor.chain().focus().toggleOrderedList().run();
      },
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
        // Store the current selection
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
      action: () => {
        if (!editor) return;
        editor.chain().focus().setTextAlign('left').run();
      },
      isActive: editor?.isActive({ textAlign: 'left' })
    },
    { 
      icon: FormatAlignCenter, 
      label: 'Align Center', 
      action: () => {
        if (!editor) return;
        editor.chain().focus().setTextAlign('center').run();
      },
      isActive: editor?.isActive({ textAlign: 'center' })
    },
    { 
      icon: FormatAlignRight, 
      label: 'Align Right', 
      action: () => {
        if (!editor) return;
        editor.chain().focus().setTextAlign('right').run();
      },
      isActive: editor?.isActive({ textAlign: 'right' })
    },
    { 
      icon: FormatAlignJustify, 
      label: 'Justify', 
      action: () => {
        if (!editor) return;
        editor.chain().focus().setTextAlign('justify').run();
      },
      isActive: editor?.isActive({ textAlign: 'justify' })
    },
  ];

  // Save draft function
  const handleSaveDraft = async () => {
    if (isSubmitting) return;
    
    setIsSubmitting(true);
    setStatus({ message: 'Saving draft...', type: 'info', progress: 50 });

    try {

      const result = await submitArticle(formData, articleId, true);

      // Update article ID if this was a new draft
      if (result.article_id) {
        setArticleId(Number(result.article_id));
      }

      setLastSaved(new Date());
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

  // Publish function
  const handlePublish = async () => {
  if (isSubmitting) return;

  // Validation
  const errors = [];
  if (!formData.title.trim()) errors.push('Title is required');
  if (!formData.content.trim()) errors.push('Content is required');
  if (stats.wordCount < 50) errors.push('Article must be at least 50 words');
  
  if (errors.length > 0) { 
    showSnackbar(errors.join(', '), 'error'); 
    return; 
  }

  setIsSubmitting(true);
  
  try {
    // Convert articleId to number (handle -1 case)
    const submissionId = articleId === -1 ? undefined : Number(articleId);
    
    const result = await submitArticle(formData, submissionId, false);

    // Update article ID if this was a new submission
    if (articleId === -1 && result.article_id) {
      setArticleId(Number(result.article_id));
    }

    showSnackbar(
      articleId === -1 
        ? 'Article published successfully!' 
        : 'Article updated successfully!',
      'success'
    );

    // Clear form only for new submissions
    if (articleId === -1) {
      setFormData({ title: '', subtitle: '', content: '' });
      if (editor) editor.commands.setContent('');
    }
    
  } catch (error) {
    console.error('Publish error:', error);
    showSnackbar(
      `Publish failed: ${error.response?.data?.error || error.message || 'Unknown error'}`,
      'error'
    );
  } finally {
    setIsSubmitting(false);
  }
};


  // Fullscreen
  const toggleFullscreen = () => setEditorState(prev => ({ ...prev, isFullscreen: !prev.isFullscreen }));

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
            handleSaveDraft();
            break;
          default: 
            break;
        }
      }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [editor, handleSaveDraft]);

  // Color helpers
  const getColor = (score) => {
    if (score > 80) return 'success.main';
    if (score > 60) return 'info.main';
    if (score > 40) return 'warning.main';
    return 'error.main';
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
          height: HEADER_HEIGHT // Ensure the box takes full header height
        }}>
          <Typography 
            variant="h4"
            sx={{ 
              fontWeight: 800,
              background: theme => `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              color: 'transparent',
              letterSpacing: '-0.5px',
              fontSize: '2rem', // Explicitly set font size
              display: 'block', // Change to block
              lineHeight: 1, // Keep line height tight
              transform: 'translateY(5px)', // Fine-tune vertical position
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
            <MenuItem onClick={() => {
              handleThemeToggle();
            }}>
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
          <IconButton onClick={() => setUi(prev => ({ ...prev, settingsOpen: true }))}><SettingsIcon /></IconButton>
          <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main', fontWeight: 600 }}>{formData.author?.[0]?.toUpperCase() ?? 'U'}</Avatar>
        </Stack>
      </Box>

      {/* Split Screen */}
      <Box sx={{
        flex: 1,
        pt: `${HEADER_HEIGHT}px`,
        display: 'flex',
        minHeight: '100vh',
        width: '100vw',
        overflow: 'hidden'
      }}>
        {/* Editor - left pane */}
        <Box
          sx={{
            flex: 2,
            minWidth: 0,
            borderRight: t => `1px solid ${t.palette.divider}`,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'stretch',
            height: `calc(100vh - ${HEADER_HEIGHT}px)`,
            bgcolor: 'background.default',
            overflowY: 'auto',
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
            '&::-webkit-scrollbar': { display: 'none' },
          }}
        >
          {/* Editor toolbar */}
          <Box sx={{ display: 'flex', alignItems: 'center', py: 1, px: 3, borderBottom: t => `1px solid ${t.palette.divider}`, gap: 1 }}>
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

          {/* Editor body */}
          <Box sx={{
            flex: 1,
            p: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'stretch',
            bgcolor: 'background.default'
          }}>
            <Box sx={{ p: 4, pb: 2 }}>
              <TextField
                fullWidth variant="standard" placeholder="Article Title..."
                value={formData.title} onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                InputProps={{
                  disableUnderline: true,
                  sx: { fontSize: '2.3rem', fontWeight: 700, letterSpacing: '-0.5px' }
                }} sx={{ mb: 1 }}
              />
              <TextField
                fullWidth variant="standard" placeholder="Catchy Subtitle..."
                value={formData.subtitle} onChange={(e) => setFormData(prev => ({ ...prev, subtitle: e.target.value }))}
                InputProps={{
                  disableUnderline: true,
                  sx: { fontSize: '1.25rem', color: 'text.secondary', mt: 1 }
                }} sx={{ mb: 2 }}
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
                  // Use the placeholder text from the data-placeholder attribute
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
          height: 'calc(100vh - 64px)',
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
      <Dialog open={ui.settingsOpen} onClose={() => setUi(prev => ({ ...prev, settingsOpen: false }))}>
        <DialogTitle>Editor Settings</DialogTitle>
        <DialogContent>
          <FormControlLabel
            control={<Switch checked={editorState.enableAutoSave} onChange={(e) => setEditorState(prev => ({ ...prev, enableAutoSave: e.target.checked }))} />}
            label="Enable Auto-Save"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setUi(prev => ({ ...prev, settingsOpen: false }))}>Close</Button>
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