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
import ArticlePreview from '../components/Article/ArticlePreview';
import CircularProgress from '@mui/material/CircularProgress';
import {
  Box, Button, TextField, Typography, Alert, IconButton, Tooltip, Divider,
  Stack, Snackbar, Avatar, Grid, LinearProgress, Switch, FormControlLabel, 
  Dialog, DialogTitle, DialogContent, DialogActions, InputAdornment, ListItemIcon, MenuItem, Select, FormControl,
  InputLabel,
  Slider,
} from '@mui/material';

import { CloudUpload, Delete } from '@mui/icons-material';

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
import {
  ArticleContainer,
  MainContent,
  ArticleHeader,
  ArticleTitle,
  MetadataSection,
  ContentSection
} from './ArticlePage';


const SubmitArticlePage = ({ isDarkMode, setIsDarkMode }) => {
  const theme = useTheme();
  const HEADER_HEIGHT = 64;
  
  // Enhanced localStorage keys for different state pieces
  const STORAGE_KEYS = {
    DRAFT: 'draft_article',
    EDITOR_STATE: 'editor_state_settings',
    UI_STATE: 'ui_state_settings',
    FORM_DATA: 'form_data_state',
    ARTICLE_ID: 'current_article_id',
    LAST_SAVED: 'last_saved_timestamp'
  };

  const FONT_OPTIONS = [
    { value: 'Inter', label: 'Inter' },
    { value: 'Roboto', label: 'Roboto' },
    { value: 'Open Sans', label: 'Open Sans' },
    { value: 'Merriweather', label: 'Merriweather' },
    { value: 'Georgia', label: 'Georgia' },
    { value: 'Times New Roman', label: 'Times New Roman' },
  ];

  const [articleImage, setArticleImage] = useState(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);


  // Helper functions for localStorage management
  const saveToStorage = (key, data) => {
    try {
      localStorage.setItem(key, JSON.stringify(data));
    } catch (error) {
      console.warn('Failed to save to localStorage:', error);
    }
  };

  const loadFromStorage = (key, defaultValue = null) => {
    try {
      const stored = localStorage.getItem(key);
      return stored ? JSON.parse(stored) : defaultValue;
    } catch (error) {
      console.warn('Failed to load from localStorage:', error);
      return defaultValue;
    }
  };

  // Initialize state from localStorage with proper defaults
  const [hasLoadedInitialDraft, setHasLoadedInitialDraft] = useState(false);
  const [formData, setFormData] = useState(() => {
    const saved = loadFromStorage(STORAGE_KEYS.FORM_DATA);
    return saved || {
      title: '', 
      content: '',
      author: 'Current User',
      imageUrl: null
    };
  });

  const [editorState, setEditorState] = useState(() => {
    const saved = loadFromStorage(STORAGE_KEYS.EDITOR_STATE);
    return saved || {
      isFullscreen: false, 
      fontSize: 18, 
      lineHeight: 1.7, 
      fontFamily: 'Inter', 
      enableAutoSave: true, 
      saveInterval: 30000
    };
  });

  const [ui, setUi] = useState(() => {
    const saved = loadFromStorage(STORAGE_KEYS.UI_STATE);
    return saved || { 
      settingsOpen: false, 
      snackbarOpen: false, 
      snackbarMessage: '', 
      snackbarSeverity: 'info', 
      previewMode: false 
    };
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
  
  const [articleId, setArticleId] = useState(() => {
    const savedId = loadFromStorage(STORAGE_KEYS.ARTICLE_ID);
    return savedId ? Number(savedId) : -1;
  });
  
  const [lastSaved, setLastSaved] = useState(() => {
    const savedTimestamp = loadFromStorage(STORAGE_KEYS.LAST_SAVED);
    return savedTimestamp ? new Date(savedTimestamp) : null;
  });
  
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
      setFormData(prev => {
        const updated = { ...prev, content: html };
        // Save form data to localStorage
        saveToStorage(STORAGE_KEYS.FORM_DATA, updated);
        return updated;
      });
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

  const handleDeleteImage = async () => {
    if (!articleId || articleId === -1) {
      showSnackbar('No article associated with this image', 'warning');
      return;
    }

    try {
      setIsUploadingImage(true);
      await articlesAPI.deleteImage(articleId);
      
      setArticleImage(null);
      setFormData(prev => {
        const updated = { ...prev, imageUrl: null };
        saveToStorage(STORAGE_KEYS.FORM_DATA, updated);
        return updated;
      });
      
      showSnackbar('Image deleted successfully', 'success');
    } catch (error) {
      console.error('Failed to delete image:', error);
      showSnackbar(`Failed to delete image: ${error.message}`, 'error');
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    // Validate file type and size
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      showSnackbar('Please select a valid image file (JPEG, PNG, GIF, WebP)', 'error');
      e.target.value = '';
      return;
    }
    
    // Check file size (e.g., max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      showSnackbar(`Image size must be less than ${maxSize / (1024 * 1024)}MB`, 'error');
      e.target.value = '';
      return;
    }
    
    try {
      setIsUploadingImage(true);
      
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
            saveToStorage(STORAGE_KEYS.ARTICLE_ID, uploadArticleId);
            
            const now = new Date();
            setLastSaved(now);
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
        setFormData(prev => {
          const updated = { ...prev, imageUrl: result.url };
          saveToStorage(STORAGE_KEYS.FORM_DATA, updated);
          return updated;
        });
        showSnackbar('Image uploaded successfully', 'success');
      } else {
        throw new Error('Upload failed - no URL returned');
      }
      
    } catch (error) {
      console.error('Image upload error:', error);
      
      // More specific error handling
      let errorMessage = 'Failed to upload image';
      
      if (error.response?.status === 413) {
        errorMessage = 'Image file is too large';
      } else if (error.response?.status === 415) {
        errorMessage = 'Unsupported image format';
      } else if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      showSnackbar(errorMessage, 'error');
    } finally {
      setIsUploadingImage(false);
      // Clear the file input to allow re-uploading the same file
      if (e.target) {
        e.target.value = '';
      }
    }
  };

  // Enhanced save draft function that preserves all state
  const saveDraft = useCallback(async () => {
    if (!editor) return;
    
    const currentContent = editor.getHTML();
    const draftData = {
      title: formData.title,
      content: currentContent,
      articleId,
      timestamp: Date.now(),
    };
    
    saveToStorage(STORAGE_KEYS.DRAFT, draftData);
    saveToStorage(STORAGE_KEYS.FORM_DATA, { ...formData, content: currentContent });
    saveToStorage(STORAGE_KEYS.ARTICLE_ID, articleId);
  }, [formData, articleId, editor]);

  // Load initial draft and all state from localStorage
  useEffect(() => {
    if (editor && !hasLoadedInitialDraft) {
      // Load draft content
      const saved = loadFromStorage(STORAGE_KEYS.DRAFT);
      if (saved) {
        try {
          const { title, content, articleId: savedId } = saved;
          if (title && title !== formData.title) {
            setFormData(prev => ({ ...prev, title }));
          }
          if (content && content !== editor.getHTML()) {
            editor.commands.setContent(content);
          }
          if (savedId !== undefined && savedId !== articleId) {
            setArticleId(savedId);
            saveToStorage(STORAGE_KEYS.ARTICLE_ID, savedId);
          }
        } catch (e) {
          console.error('Failed to parse saved draft', e);
        }
      }
      
      setHasLoadedInitialDraft(true);
    }
  }, [editor, hasLoadedInitialDraft, formData.title, articleId]);

  // Auto-save with enhanced state persistence
  useEffect(() => {
    if (!editor || !hasLoadedInitialDraft) return;

    const timer = setTimeout(() => {
      saveDraft();
    }, 500);
    
    return () => clearTimeout(timer);
  }, [formData.title, saveDraft, editor, hasLoadedInitialDraft]);

  // Persist formData changes immediately
  useEffect(() => {
    if (hasLoadedInitialDraft) {
      saveToStorage(STORAGE_KEYS.FORM_DATA, formData);
    }
  }, [formData, hasLoadedInitialDraft]);

  // Persist editorState changes
  useEffect(() => {
    saveToStorage(STORAGE_KEYS.EDITOR_STATE, editorState);
  }, [editorState]);

  // Persist articleId changes
  useEffect(() => {
    saveToStorage(STORAGE_KEYS.ARTICLE_ID, articleId);
  }, [articleId]);

  // Persist lastSaved changes
  useEffect(() => {
    if (lastSaved) {
      saveToStorage(STORAGE_KEYS.LAST_SAVED, lastSaved.getTime());
    }
  }, [lastSaved]);

  // Enhanced performAutoSave function
  const performAutoSave = useCallback(async () => {
    if (!editor || !hasLoadedInitialDraft) return;
    
    const currentContent = editor.getHTML();
    if (formData.title.trim() || currentContent.trim()) {
      try {
        await submitArticle({
          ...formData,
          content: currentContent
        }, articleId, true);
        const now = new Date();
        setLastSaved(now);
        showSnackbar('Auto-saved as draft', 'success');
      } catch (error) {
        console.error('Auto-save failed:', error);
        showSnackbar('Auto-save failed', 'warning');
      }
    }
  }, [formData, articleId, editor, hasLoadedInitialDraft]);

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

  // Auto-save
  useEffect(() => {
    if (editorState.enableAutoSave && hasLoadedInitialDraft && (formData.title.trim() || formData.content.trim())) {
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
  }, [editorState.enableAutoSave, editorState.saveInterval, performAutoSave, hasLoadedInitialDraft, formData.title, formData.content]);

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

  // Enhanced publish function with better state management
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
      const submissionId = articleId === -1 ? undefined : Number(articleId);
      const result = await submitArticle(formData, submissionId, false);

      if (result.article_id) {
        const newId = Number(result.article_id);
        setArticleId(newId);
      }

      showSnackbar(
        articleId === -1 
          ? 'Article published successfully!' 
          : 'Article updated successfully!',
        'success'
      );

      // Clear form and localStorage only for new submissions
      if (articleId === -1) {
        const clearedFormData = { title: '', content: '', author: 'Current User' };
        setFormData(clearedFormData);
        if (editor) editor.commands.setContent('');
        
        // Clear all relevant localStorage
        localStorage.removeItem(STORAGE_KEYS.DRAFT);
        localStorage.removeItem(STORAGE_KEYS.FORM_DATA);
        localStorage.removeItem(STORAGE_KEYS.ARTICLE_ID);
        
        // Reset articleId
        setArticleId(-1);
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

  // Enhanced title change handler with immediate persistence
  const handleTitleChange = (e) => {
    const newTitle = e.target.value;
    setFormData(prev => {
      const updated = { ...prev, title: newTitle };
      // Immediate save to localStorage
      saveToStorage(STORAGE_KEYS.FORM_DATA, updated);
      return updated;
    });
  };

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
      <Dialog open={ui.settingsOpen} onClose={() => setUi(prev => ({ ...prev, settingsOpen: false }))}>
        <DialogTitle>Editor Settings</DialogTitle>
        <DialogContent>
          <FormControlLabel
            control={<Switch checked={editorState.enableAutoSave} onChange={(e) => setEditorState(prev => ({ ...prev, enableAutoSave: e.target.checked }))} />}
            label="Enable Auto-Save"
            sx={{ mb: 2 }}
          />
          
          <FormControl fullWidth sx={{ mb: 3 }}>
            <InputLabel>Font Family</InputLabel>
            <Select
              value={editorState.fontFamily}
              label="Font Family"
              onChange={(e) => setEditorState(prev => ({ ...prev, fontFamily: e.target.value }))}
            >
              {FONT_OPTIONS.map((font) => (
                <MenuItem key={font.value} value={font.value}>
                  <span style={{ fontFamily: font.value }}>{font.label}</span>
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          
          <Box sx={{ mb: 3 }}>
            <Typography gutterBottom>Font Size: {editorState.fontSize}px</Typography>
            <Slider
              value={editorState.fontSize}
              onChange={(e, newValue) => setEditorState(prev => ({ ...prev, fontSize: newValue }))}
              min={12}
              max={24}
              step={1}
              marks={[
                { value: 12, label: '12' },
                { value: 16, label: '16' },
                { value: 20, label: '20' },
                { value: 24, label: '24' },
              ]}
            />
          </Box>
          
          <Box sx={{ mb: 3 }}>
            <Typography gutterBottom>Line Height: {editorState.lineHeight}</Typography>
            <Slider
              value={editorState.lineHeight}
              onChange={(e, newValue) => setEditorState(prev => ({ ...prev, lineHeight: newValue }))}
              min={1}
              max={2}
              step={0.1}
              marks={[
                { value: 1, label: '1' },
                { value: 1.5, label: '1.5' },
                { value: 2, label: '2' },
              ]}
            />
          </Box>
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