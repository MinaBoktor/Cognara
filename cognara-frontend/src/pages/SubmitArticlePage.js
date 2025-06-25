import React, { useState, useRef, useEffect } from 'react';
import { articlesAPI } from '../services/api';
import {
  Container,
  TextField,
  Button,
  Typography,
  Box,
  Paper,
  Alert,
  useTheme,
  ButtonGroup,
  IconButton,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Menu,
  MenuItem,
  Tooltip,
  Select,
  FormControl,
  InputLabel
} from '@mui/material';
import Layout from '../components/Layout/Layout';
import { Helmet } from 'react-helmet';
import {
  FormatBold,
  FormatItalic,
  FormatUnderlined,
  FormatListBulleted,
  FormatListNumbered,
  Link,
  FormatAlignLeft,
  FormatAlignCenter,
  FormatAlignRight,
  FormatClear,
  CloudUpload,
  Delete,
  Palette,
  FormatSize,
  FontDownload
} from '@mui/icons-material';

const SubmitArticlePage = () => {
  const theme = useTheme();
  const [formData, setFormData] = useState({
    title: '',
    author: '',
    content: '',
    summary: '',
  });
  const [savedRange, setSavedRange] = useState(null);
  const [status, setStatus] = useState({ message: '', type: '' });
  const [attachedImage, setAttachedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [formatStates, setFormatStates] = useState({
    bold: false,
    italic: false,
    underline: false,
    alignLeft: false,
    alignCenter: false,
    alignRight: false
  });
  const [linkDialogOpen, setLinkDialogOpen] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const [linkText, setLinkText] = useState('');
  const [colorMenuAnchor, setColorMenuAnchor] = useState(null);
  const [fontSizeMenuAnchor, setFontSizeMenuAnchor] = useState(null);
  const [fontFamilyMenuAnchor, setFontFamilyMenuAnchor] = useState(null);
  const [selectedRange, setSelectedRange] = useState(null);
  const [currentFontSize, setCurrentFontSize] = useState('14px');
  const [currentFontFamily, setCurrentFontFamily] = useState('Arial');
  const [isToolbarSticky, setIsToolbarSticky] = useState(false);
  
  const contentEditableRef = useRef(null);
  const fileInputRef = useRef(null);
  const editorContainerRef = useRef(null);
  const toolbarRef = useRef(null);

  // Font sizes available
  const fontSizes = [
    { label: '8', value: '8px' },
    { label: '9', value: '9px' },
    { label: '10', value: '10px' },
    { label: '11', value: '11px' },
    { label: '12', value: '12px' },
    { label: '14', value: '14px' },
    { label: '16', value: '16px' },
    { label: '18', value: '18px' },
    { label: '20', value: '20px' },
    { label: '22', value: '22px' },
    { label: '24', value: '24px' },
    { label: '26', value: '26px' },
    { label: '28', value: '28px' },
    { label: '32', value: '32px' },
    { label: '36', value: '36px' },
    { label: '48', value: '48px' },
    { label: '72', value: '72px' }
  ];

  // Font families available
  const fontFamilies = [
    { label: 'Arial', value: 'Arial, sans-serif' },
    { label: 'Helvetica', value: 'Helvetica, sans-serif' },
    { label: 'Times New Roman', value: '"Times New Roman", serif' },
    { label: 'Times', value: 'Times, serif' },
    { label: 'Georgia', value: 'Georgia, serif' },
    { label: 'Verdana', value: 'Verdana, sans-serif' },
    { label: 'Courier New', value: '"Courier New", monospace' },
    { label: 'Lucida Console', value: '"Lucida Console", monospace' },
    { label: 'Impact', value: 'Impact, sans-serif' },
    { label: 'Comic Sans MS', value: '"Comic Sans MS", cursive' },
    { label: 'Trebuchet MS', value: '"Trebuchet MS", sans-serif' },
    { label: 'Arial Black', value: '"Arial Black", sans-serif' },
    { label: 'Palatino', value: 'Palatino, serif' },
    { label: 'Garamond', value: 'Garamond, serif' },
    { label: 'Bookman', value: 'Bookman, serif' },
    { label: 'Tahoma', value: 'Tahoma, sans-serif' },
    { label: 'Calibri', value: 'Calibri, sans-serif' },
    { label: 'Cambria', value: 'Cambria, serif' },
    { label: 'Dancing Script', value: '"Dancing Script", cursive' },
    { label: 'Pacifico', value: '"Pacifico", cursive' },
    { label: 'Indie Flower', value: '"Indie Flower", cursive' },
    { label: 'Shadows Into Light', value: '"Shadows Into Light", cursive' },
    { label: 'Amatic SC', value: '"Amatic SC", cursive' },
    { label: 'Caveat', value: '"Caveat", cursive' },
    { label: 'Satisfy', value: '"Satisfy", cursive' },
    { label: 'Great Vibes', value: '"Great Vibes", cursive' },
  ];

  // Color palette for text
  const textColors = [
    { name: 'Default', value: 'inherit' },
    { name: 'White', value: '#ffffff' },
    { name: 'Light Gray', value: '#e0e0e0' },
    { name: 'Gray', value: '#9e9e9e' },
    { name: 'Dark Gray', value: '#424242' },
    { name: 'Red', value: '#f44336' },
    { name: 'Pink', value: '#e91e63' },
    { name: 'Purple', value: '#9c27b0' },
    { name: 'Deep Purple', value: '#673ab7' },
    { name: 'Indigo', value: '#3f51b5' },
    { name: 'Blue', value: '#2196f3' },
    { name: 'Light Blue', value: '#03a9f4' },
    { name: 'Cyan', value: '#00bcd4' },
    { name: 'Teal', value: '#009688' },
    { name: 'Green', value: '#4caf50' },
    { name: 'Light Green', value: '#8bc34a' },
    { name: 'Lime', value: '#cddc39' },
    { name: 'Yellow', value: '#ffeb3b' },
    { name: 'Amber', value: '#ffc107' },
    { name: 'Orange', value: '#ff9800' },
    { name: 'Deep Orange', value: '#ff5722' }
  ];

  // Clean LTR setup and flexible link styling
  useEffect(() => {
    if (contentEditableRef.current) {
      // Add global CSS for LTR editing and flexible link styling
      const style = document.createElement('style');
      style.id = 'ltr-editor-styles';
      style.textContent = `
        .ltr-content-editor {
          direction: ltr !important;
          text-align: left !important;
          unicode-bidi: embed !important;
        }
        .ltr-content-editor * {
          direction: ltr !important;
          unicode-bidi: embed !important;
        }
        .ltr-content-editor p,
        .ltr-content-editor div {
          margin: 0;
          padding: 0;
        }
        .ltr-content-editor a {
          color: #bb86fc !important;
          cursor: pointer !important;
        }
        .ltr-content-editor a:hover {
          color: #cf6679 !important;
        }
        .ltr-content-editor a.no-underline {
          text-decoration: none !important;
        }
        .ltr-content-editor a:not(.no-underline) {
          text-decoration: underline !important;
        }
        .ltr-content-editor [style*="text-align: center"] {
          text-align: center !important;
        }
        .ltr-content-editor [style*="text-align: right"] {
          text-align: right !important;
        }
        .ltr-content-editor [style*="text-align: left"] {
          text-align: left !important;
        }
      `;
      
      // Remove existing style if it exists
      const existingStyle = document.getElementById('ltr-editor-styles');
      if (existingStyle) {
        existingStyle.remove();
      }
      
      document.head.appendChild(style);
      
      return () => {
        const styleToRemove = document.getElementById('ltr-editor-styles');
        if (styleToRemove) {
          styleToRemove.remove();
        }
      };
    }
  }, []);

  // Enhanced format state checking including font properties
  const updateFormatStates = () => {
    if (!contentEditableRef.current) return;
    
    try {
      const selection = window.getSelection();
      let alignLeft = false, alignCenter = false, alignRight = false;
      let fontSize = '14px', fontFamily = 'Arial';
      
      if (selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        let element = range.commonAncestorContainer;
        
        // Find the element for checking styles
        while (element && element.nodeType !== Node.ELEMENT_NODE) {
          element = element.parentNode;
        }
        
        // Check for font properties
        if (element && element !== contentEditableRef.current) {
          const computedStyle = window.getComputedStyle(element);
          fontSize = computedStyle.fontSize || '14px';
          fontFamily = computedStyle.fontFamily || 'Arial';
        }
        
        // Find the block-level element for alignment checking
        let blockElement = element;
        while (blockElement && blockElement !== contentEditableRef.current) {
          if (blockElement.style && blockElement.style.textAlign) {
            const align = blockElement.style.textAlign;
            alignLeft = align === 'left';
            alignCenter = align === 'center';
            alignRight = align === 'right';
            break;
          }
          blockElement = blockElement.parentNode;
        }
      }
      
      setFormatStates({
        bold: document.queryCommandState('bold'),
        italic: document.queryCommandState('italic'),
        underline: document.queryCommandState('underline'),
        alignLeft,
        alignCenter,
        alignRight
      });
      
      setCurrentFontSize(fontSize);
      setCurrentFontFamily(fontFamily.split(',')[0].replace(/['"]/g, ''));
    } catch (error) {
      // Ignore errors from queryCommandState
    }
  };

  // Check formatting states when selection changes
  useEffect(() => {
    const handleSelectionChange = () => {
      updateFormatStates();
      
      // Auto-scroll to cursor position
      const selection = window.getSelection();
      if (!selection || selection.rangeCount === 0) return;

      const range = selection.getRangeAt(0).cloneRange();
      const dummy = document.createElement('span');
      dummy.textContent = '\u200B'; // zero-width space
      dummy.style.display = 'inline-block';

      range.insertNode(dummy);
      dummy.scrollIntoView({ block: 'nearest', behavior: 'smooth' });

      // clean up
      requestAnimationFrame(() => {
        dummy.parentNode?.removeChild(dummy);
      });
    };

    document.addEventListener('selectionchange', handleSelectionChange);
    return () => document.removeEventListener('selectionchange', handleSelectionChange);
  }, []);

  // Handle scroll for sticky toolbar
  useEffect(() => {
    const handleScroll = () => {
      if (editorContainerRef.current && toolbarRef.current) {
        const editorRect = editorContainerRef.current.getBoundingClientRect();
        const toolbarHeight = toolbarRef.current.offsetHeight;
        const isSticky = editorRect.top <= 0 && 
                         editorRect.bottom >= toolbarHeight;
        
        setIsToolbarSticky(isSticky);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Save cursor position
  const saveCursorPosition = () => {
    const selection = window.getSelection();
    if (selection.rangeCount > 0) {
      return selection.getRangeAt(0);
    }
    return null;
  };

  // Restore cursor position
  const restoreCursorPosition = (range) => {
    if (range) {
      const selection = window.getSelection();
      selection.removeAllRanges();
      selection.addRange(range);
    }
  };

  // Updated content change handler
  const handleContentChange = () => {
    if (contentEditableRef.current) {
      const content = contentEditableRef.current.innerHTML;
      setFormData(prev => ({ ...prev, content }));
    }
  };

  // Handle content blur
  const handleContentBlur = () => {
    handleContentChange();
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setStatus({ message: 'Please select a valid image file.', type: 'error' });
        return;
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setStatus({ message: 'Image size must be less than 5MB.', type: 'error' });
        return;
      }

      setAttachedImage(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target.result);
      };
      reader.readAsDataURL(file);
      
      // Clear any previous error messages
      setStatus({ message: '', type: '' });
    }
  };

  const removeImage = () => {
    setAttachedImage(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ message: '', type: '' });

    // Get the latest content from the editor
    const currentContent = contentEditableRef.current ? contentEditableRef.current.innerHTML : formData.content;

    if (!formData.title || !formData.author || !currentContent) {
      setStatus({ message: 'Title, Author, and Content are required.', type: 'error' });
      return;
    }

    try {
      // Create FormData to handle file upload
      const submitData = new FormData();
      submitData.append('title', formData.title);
      submitData.append('author', formData.author);
      submitData.append('content', currentContent);
      submitData.append('summary', formData.summary);
      
      if (attachedImage) {
        submitData.append('image', attachedImage);
      }

      await articlesAPI.create(submitData);
      setStatus({ message: 'Article submitted successfully! It will be reviewed by an admin.', type: 'success' });
      setFormData({ title: '', author: '', content: '', summary: '' });
      setAttachedImage(null);
      setImagePreview(null);
      if (contentEditableRef.current) {
        contentEditableRef.current.innerHTML = '';
      }
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      setStatus({ message: 'Failed to submit article. Please try again.', type: 'error' });
      console.error('Submission error:', error);
    }
  };

  // Get the current block element for alignment
  const getCurrentBlockElement = () => {
    const selection = window.getSelection();
    if (selection.rangeCount === 0) return null;
    
    let element = selection.getRangeAt(0).commonAncestorContainer;
    
    // Navigate up to find a block-level element
    while (element && element !== contentEditableRef.current) {
      if (element.nodeType === Node.ELEMENT_NODE) {
        const tagName = element.tagName.toLowerCase();
        if (['p', 'div', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'li'].includes(tagName)) {
          return element;
        }
      }
      element = element.parentNode;
    }
    
    return null;
  };

  // Wrap selection in paragraph if needed
  const ensureBlockElement = () => {
    const selection = window.getSelection();
    if (selection.rangeCount === 0) return null;
    
    let blockElement = getCurrentBlockElement();
    
    if (!blockElement) {
      // Create a paragraph to wrap the selection
      const range = selection.getRangeAt(0);
      const p = document.createElement('p');
      
      try {
        range.surroundContents(p);
        blockElement = p;
      } catch (error) {
        // If surroundContents fails, extract and wrap
        const contents = range.extractContents();
        p.appendChild(contents);
        range.insertNode(p);
        blockElement = p;
      }
      
      // Restore selection
      const newRange = document.createRange();
      newRange.selectNodeContents(p);
      selection.removeAllRanges();
      selection.addRange(newRange);
    }
    
    return blockElement;
  };

  // Enhanced format text function with font size and family support
  const formatText = (command, value = null) => {
    if (!contentEditableRef.current) return;
    
    contentEditableRef.current.focus();
    
    try {
      if (command.startsWith('justify')) {
        const selection = window.getSelection();
        if (selection.rangeCount === 0) return;

        const range = selection.getRangeAt(0);
        const fragment = range.cloneContents();
        const blockTags = ['p', 'div', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'li'];

        // Helper to check if element is block-level
        const isBlockElement = (el) =>
          el.nodeType === Node.ELEMENT_NODE && blockTags.includes(el.tagName.toLowerCase());

        // Collect affected blocks
        const blocks = new Set();
        let start = range.startContainer;
        let end = range.endContainer;

        // Walk from start to top-level block
        while (start && start !== contentEditableRef.current) {
          if (isBlockElement(start)) {
            blocks.add(start);
            break;
          }
          start = start.parentNode;
        }

        while (end && end !== contentEditableRef.current) {
          if (isBlockElement(end)) {
            blocks.add(end);
            break;
          }
          end = end.parentNode;
        }

        // If no blocks found, apply to current line
        if (blocks.size === 0) {
          const block = ensureBlockElement();
          if (block) blocks.add(block);
        }

        // Clear previous alignments and apply new one
        blocks.forEach((el) => {
          el.style.textAlign = ''; // Clear existing
          switch (command) {
            case 'justifyLeft':
              el.style.textAlign = 'left';
              break;
            case 'justifyCenter':
              el.style.textAlign = 'center';
              break;
            case 'justifyRight':
              el.style.textAlign = 'right';
              break;
          }
        });

      } else if (command === 'underline') {
        // Enhanced underline handling for links
        const selection = window.getSelection();
        if (selection.rangeCount > 0) {
          const range = selection.getRangeAt(0);
          const selectedElement = range.commonAncestorContainer;
          
          // Check if we're in a link
          let linkElement = selectedElement;
          while (linkElement && linkElement !== contentEditableRef.current) {
            if (linkElement.nodeType === Node.ELEMENT_NODE && linkElement.tagName === 'A') {
              break;
            }
            linkElement = linkElement.parentNode;
          }
          
          if (linkElement && linkElement.tagName === 'A') {
            // Toggle underline class on the link
            if (linkElement.classList.contains('no-underline')) {
              linkElement.classList.remove('no-underline');
            } else {
              linkElement.classList.add('no-underline');
            }
          } else {
            // Regular underline command for non-links
            document.execCommand(command, false, value);
          }
        }
      } else if (command === 'fontSize') {
        const selection = window.getSelection();
        if (!selection.rangeCount) return;

        const range = selection.getRangeAt(0);
        const span = document.createElement('span');
        span.style.fontSize = value;
        span.innerHTML = '&#8203;'; // zero-width space

        range.insertNode(span);

        // Move cursor inside the span
        const newRange = document.createRange();
        newRange.setStart(span, 1);
        newRange.collapse(true);
        selection.removeAllRanges();
        selection.addRange(newRange);

        } else if (command === 'fontName') {
          // Manual span insertion to apply font family even with no selection
          const selection = window.getSelection();
          if (!selection.rangeCount) return;

          const range = selection.getRangeAt(0);
          const span = document.createElement('span');
          span.style.fontFamily = value;
          span.innerHTML = '\u200B'; // zero-width space

          range.deleteContents();
          range.insertNode(span);

          // Move cursor inside span
          const newRange = document.createRange();
          newRange.setStart(span, 1);
          newRange.collapse(true);

          selection.removeAllRanges();
          selection.addRange(newRange);
        }
    else {
        // Regular formatting commands
        document.execCommand(command, false, value);
      }
    } catch (error) {
      console.warn('execCommand failed:', error);
    }
    
    handleContentChange();
    updateFormatStates();
  };

  // Handle font size change
  const handleFontSizeChange = (size) => {
    if (savedRange) {
      const selection = window.getSelection();
      selection.removeAllRanges();
      selection.addRange(savedRange);
    }

    formatText('fontSize', size);
    setCurrentFontSize(size); // ensure UI updates immediately
    setFontSizeMenuAnchor(null);
  };


  // Handle font family change
  const handleFontFamilyChange = (family) => {
    if (savedRange) {
      const selection = window.getSelection();
      selection.removeAllRanges();
      selection.addRange(savedRange);
    }

    formatText('fontName', family);
    setCurrentFontFamily(family.split(',')[0].replace(/['"]/g, '')); // UI update
    setFontFamilyMenuAnchor(null);
  };


  // Open link dialog
  const openLinkDialog = () => {
    const selection = window.getSelection();
    if (selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      setSelectedRange(range);
      setLinkText(selection.toString() || '');
      setLinkUrl('');
      setLinkDialogOpen(true);
    }
  };

  // Handle link creation
  const handleLinkCreate = () => {
    if (!selectedRange || !linkUrl) return;
    
    const selection = window.getSelection();
    selection.removeAllRanges();
    selection.addRange(selectedRange);
    
    if (linkText && selection.toString() !== linkText) {
      // Replace selected text with link text
      document.execCommand('insertText', false, linkText);
      // Re-select the inserted text
      const newRange = document.createRange();
      const textNode = selection.anchorNode;
      newRange.setStart(textNode, selection.anchorOffset - linkText.length);
      newRange.setEnd(textNode, selection.anchorOffset);
      selection.removeAllRanges();
      selection.addRange(newRange);
    }
    
    document.execCommand('createLink', false, linkUrl);
    
    setLinkDialogOpen(false);
    setLinkUrl('');
    setLinkText('');
    setSelectedRange(null);
    
    setTimeout(() => handleContentChange(), 10);
  };

  // Handle color selection
  const handleColorSelect = (color) => {
    if (!contentEditableRef.current) return;
    
    contentEditableRef.current.focus();
    
    try {
      if (color === 'inherit') {
        document.execCommand('removeFormat', false, null);
      } else {
        document.execCommand('foreColor', false, color);
      }
    } catch (error) {
      console.warn('Color command failed:', error);
    }
    
    setColorMenuAnchor(null);
    setTimeout(() => handleContentChange(), 10);
  };

  // Enhanced key handler for Microsoft Word-like behavior
  const handleEditorKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();

      const selection = window.getSelection();
      if (selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);

        const p = document.createElement('p');
        const br = document.createElement('br');
        p.appendChild(br);

        range.deleteContents();
        range.insertNode(p);

        // ✅ Move cursor AFTER the <br> inside the new <p>
        const newRange = document.createRange();
        newRange.setStart(p, 1); // after the <br>
        newRange.collapse(true);

        selection.removeAllRanges();
        selection.addRange(newRange);
      }

      setTimeout(() => handleContentChange(), 10);
    } else if (e.key === 'Enter' || e.key === 'Backspace' || e.key === 'Delete') {
      setTimeout(() => {
        handleContentChange();
        updateFormatStates();
      }, 10);
    }
  };

  // Handle paste with cursor preservation
  const handlePaste = (e) => {
    e.preventDefault();
    const text = (e.clipboardData || window.clipboardData).getData('text');
    
    try {
      document.execCommand('insertText', false, text);
    } catch (error) {
      // Fallback for browsers that don't support insertText
      const selection = window.getSelection();
      if (selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        range.deleteContents();
        range.insertNode(document.createTextNode(text));
        range.collapse(false);
      }
    }
    
    setTimeout(() => handleContentChange(), 10);
  };

  return (
    <Layout>
      <Helmet>
        <title>Submit Article | Cognara</title>
        <meta name="description" content="Submit your article to the Cognara community." />
      </Helmet>
      
      <Container maxWidth={false} sx={{ py: 5}}>
        {/* Header Section */}
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Typography 
            variant="h3" 
            component="h1" 
            sx={{ 
              fontWeight: 700,
              mb: 1,
              color: theme.palette.text.primary,
              paddingTop: '1rem',
              paddingBottom: '1rem',
              fontSize: '2.5rem',
            }}
          >
            Submit an Article
          </Typography>
          <Typography 
            variant="h6" 
            component="p" 
            sx={{ 
              mx: 'auto',
              color: theme.palette.text.secondary,
              mb: 3
            }}
          >
            Share your knowledge with the Cognara community
          </Typography>
          <Divider sx={{ my: 2 }} />
        </Box>

        {/* Status Alert */}
        {status.message && (
          <Alert severity={status.type} sx={{ mb: 3, mx: 'auto', maxWidth: 600 }}>
            {status.message}
          </Alert>
        )}

        {/* Form Section */}
        <Paper elevation={0} sx={{ 
          p: 4, 
          backgroundColor: theme.palette.background.default,
          borderRadius: 2,
          borderLeft: `4px solid ${theme.palette.primary.main}`,
          mx: 'auto'
        }}>
          <form onSubmit={handleSubmit}>
            {/* Centered Form Fields */}
            <Box sx={{ 
              display: 'flex', 
              flexDirection: 'column', 
              gap: 3,
              mx: 'auto'
            }}>
              <TextField
                fullWidth
                label="Article Title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
                variant="outlined"
                inputProps={{ dir: 'ltr' }}
                sx={{ 
                  '& .MuiInputBase-input': { 
                    direction: 'ltr',
                    textAlign: 'left'
                  }
                }}
              />
              <TextField
                fullWidth
                label="Author Name"
                name="author"
                value={formData.author}
                onChange={handleChange}
                required
                variant="outlined"
                inputProps={{ dir: 'ltr' }}
                sx={{ 
                  '& .MuiInputBase-input': { 
                    direction: 'ltr',
                    textAlign: 'left'
                  }
                }}
              />
              <TextField
                fullWidth
                label="Summary"
                name="summary"
                value={formData.summary}
                onChange={handleChange}
                helperText="A short summary that will appear in article listings."
                variant="outlined"
                multiline
                rows={3}
                inputProps={{ dir: 'ltr' }}
                sx={{ 
                  '& .MuiInputBase-input': { 
                    direction: 'ltr',
                    textAlign: 'left'
                  }
                }}
              />
            </Box>

            {/* Image Upload Section */}
            <Box sx={{ mt: 4, width: '100%' }}>
              <Typography variant="subtitle1" gutterBottom sx={{ textAlign: 'center' }}>
                Article Image (Optional)
              </Typography>
              <Box sx={{
                border: `1px solid ${theme.palette.divider}`,
                borderRadius: 1,
                p: 2,
                backgroundColor: theme.palette.background.paper,
                mx: 'auto',
                textAlign: 'center'
              }}>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  ref={fileInputRef}
                  style={{ display: 'none' }}
                />
                
                {!imagePreview ? (
                  <Button
                    variant="outlined"
                    startIcon={<CloudUpload />}
                    onClick={() => fileInputRef.current?.click()}
                    sx={{ mb: 1 }}
                  >
                    Upload Image
                  </Button>
                ) : (
                  <Box>
                    <Box sx={{ position: 'relative', display: 'inline-block', mb: 2 }}>
                      <img
                        src={imagePreview}
                        alt="Preview"
                        style={{
                          maxWidth: '300px',
                          maxHeight: '200px',
                          objectFit: 'contain',
                          borderRadius: '4px'
                        }}
                      />
                      <IconButton
                        onClick={removeImage}
                        sx={{
                          position: 'absolute',
                          top: -8,
                          right: -8,
                          backgroundColor: theme.palette.error.main,
                          color: 'white',
                          '&:hover': {
                            backgroundColor: theme.palette.error.dark,
                          }
                        }}
                        size="small"
                      >
                        <Delete fontSize="small" />
                      </IconButton>
                    </Box>
                    <Typography variant="body2" color="textSecondary">
                      {attachedImage?.name}
                    </Typography>
                  </Box>
                )}
                
                <Typography variant="caption" color="textSecondary" sx={{ display: 'block', mt: 1 }}>
                  Maximum file size: 5MB. Supported formats: JPG, PNG, GIF, WebP
                </Typography>
              </Box>
            </Box>

            {/* Full Content Editor */}
            <Box sx={{ mt: 4, width: '100%' }} ref={editorContainerRef}>
              <Typography variant="subtitle1" gutterBottom sx={{ textAlign: 'center' }}>
                Full Content
              </Typography>
              <Box sx={{
                  border: `1px solid ${theme.palette.divider}`,
                  borderRadius: 1,
                  mb: 1,
                  p: 1,
                  backgroundColor: theme.palette.background.paper,
                  mx: 'auto',
                  position: 'relative'
                }}>
                
                {/* Sticky Toolbar */}
                <Box
                  ref={toolbarRef}
                  sx={{
                    position: isToolbarSticky ? 'sticky' : 'static',
                    top: 0,
                    zIndex: 1,
                    backgroundColor: theme.palette.background.paper,
                    borderBottom: isToolbarSticky ? `1px solid ${theme.palette.divider}` : 'none',
                    py: isToolbarSticky ? 1 : 0,
                    boxShadow: isToolbarSticky ? theme.shadows[1] : 'none'
                  }}
                >
                  {/* Font Controls Row */}
                  <Box sx={{ display: 'flex', gap: 1, mb: 1, flexWrap: 'wrap', alignItems: 'center' }}>
                    <Tooltip title="Font Family">
                      <Button
                        variant="outlined"
                        size="small"
                        startIcon={<FontDownload />}
                        onMouseDown={(e) => {
                          e.preventDefault(); // prevent blur/focus loss
                          const selection = window.getSelection();
                          if (selection.rangeCount > 0) {
                            setSavedRange(selection.getRangeAt(0));
                          }
                          setFontFamilyMenuAnchor(e.currentTarget);
                        }}
                        sx={{ minWidth: 120 }}
                      >
                        {currentFontFamily}
                      </Button>
                    </Tooltip>
                    
                    <Tooltip title="Font Size">
                      <Button
                        variant="outlined"
                        size="small"
                        startIcon={<FormatSize />}
                        onMouseDown={(e) => {
                          e.preventDefault(); // prevents cursor from vanishing
                          const selection = window.getSelection();
                          if (selection.rangeCount > 0) {
                            setSavedRange(selection.getRangeAt(0));
                          }
                          setFontSizeMenuAnchor(e.currentTarget);
                        }}
                        sx={{ minWidth: 80 }}
                      >
                        {currentFontSize.replace('px', '')}
                      </Button>
                    </Tooltip>
                  </Box>

                  {/* Formatting Controls Row */}
                  <ButtonGroup size="small" sx={{ 
                    flexWrap: 'wrap', 
                    mb: 1,
                    justifyContent: 'center'
                  }}>
                    <Tooltip title="Bold">
                      <IconButton 
                        onClick={() => formatText('bold')}
                        sx={{
                          backgroundColor: formatStates.bold ? theme.palette.primary.main : 'transparent',
                          color: formatStates.bold ? theme.palette.primary.contrastText : 'inherit',
                          '&:hover': {
                            backgroundColor: formatStates.bold ? theme.palette.primary.dark : theme.palette.action.hover,
                          }
                        }}
                      >
                        <FormatBold fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Italic">
                      <IconButton 
                        onClick={() => formatText('italic')}
                        sx={{
                          backgroundColor: formatStates.italic ? theme.palette.primary.main : 'transparent',
                          color: formatStates.italic ? theme.palette.primary.contrastText : 'inherit',
                          '&:hover': {
                            backgroundColor: formatStates.italic ? theme.palette.primary.dark : theme.palette.action.hover,
                          }
                        }}
                      >
                        <FormatItalic fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Underline (works on hyperlinks too)">
                      <IconButton 
                        onClick={() => formatText('underline')}
                        sx={{
                          backgroundColor: formatStates.underline ? theme.palette.primary.main : 'transparent',
                          color: formatStates.underline ? theme.palette.primary.contrastText : 'inherit',
                          '&:hover': {
                            backgroundColor: formatStates.underline ? theme.palette.primary.dark : theme.palette.action.hover,
                          }
                        }}
                      >
                        <FormatUnderlined fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Bullet List">
                      <IconButton onClick={() => formatText('insertUnorderedList')}>
                        <FormatListBulleted fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Numbered List">
                      <IconButton onClick={() => formatText('insertOrderedList')}>
                        <FormatListNumbered fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Insert Link">
                      <IconButton onClick={openLinkDialog}>
                        <Link fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Align Left">
                      <IconButton 
                        onClick={() => formatText('justifyLeft')}
                        sx={{
                          backgroundColor: formatStates.alignLeft ? theme.palette.primary.main : 'transparent',
                          color: formatStates.alignLeft ? theme.palette.primary.contrastText : 'inherit',
                          '&:hover': {
                            backgroundColor: formatStates.alignLeft ? theme.palette.primary.dark : theme.palette.action.hover,
                          }
                        }}
                      >
                        <FormatAlignLeft fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Align Center">
                      <IconButton 
                        onClick={() => formatText('justifyCenter')}
                        sx={{
                          backgroundColor: formatStates.alignCenter ? theme.palette.primary.main : 'transparent',
                          color: formatStates.alignCenter ? theme.palette.primary.contrastText : 'inherit',
                          '&:hover': {
                            backgroundColor: formatStates.alignCenter ? theme.palette.primary.dark : theme.palette.action.hover,
                          }
                        }}
                      >
                        <FormatAlignCenter fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Align Right">
                      <IconButton 
                        onClick={() => formatText('justifyRight')}
                        sx={{
                          backgroundColor: formatStates.alignRight ? theme.palette.primary.main : 'transparent',
                          color: formatStates.alignRight ? theme.palette.primary.contrastText : 'inherit',
                          '&:hover': {
                            backgroundColor: formatStates.alignRight ? theme.palette.primary.dark : theme.palette.action.hover,
                          }
                        }}
                      >
                        <FormatAlignRight fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Text Color">
                      <IconButton onClick={(e) => setColorMenuAnchor(e.currentTarget)}>
                        <Palette fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Clear Formatting">
                      <IconButton onClick={() => formatText('removeFormat')}>
                        <FormatClear fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </ButtonGroup>
                </Box>
                
                <Box
                  ref={contentEditableRef}
                  className="ltr-content-editor"
                  contentEditable
                  onInput={handleContentChange}
                  onBlur={handleContentBlur}
                  onKeyDown={handleEditorKeyDown}
                  onPaste={handlePaste}
                  dir="ltr"
                  sx={{
                    minHeight: '300px',
                    padding: '16px',
                    border: `1px solid ${theme.palette.divider}`,
                    borderRadius: '4px',
                    backgroundColor: theme.palette.background.paper,
                    outline: 'none',
                    width: '100%',
                    direction: 'ltr',
                    textAlign: 'left',
                    unicodeBidi: 'embed',
                    lineHeight: 1.6,
                    fontSize: '14px',
                    fontFamily: theme.typography.fontFamily,
                    '&:focus': {
                      outline: `2px solid ${theme.palette.primary.main}`,
                      outlineOffset: '2px'
                    },
                    '&:empty:before': {
                      content: '"Start writing your article content here..."',
                      color: theme.palette.text.disabled,
                      fontStyle: 'italic'
                    }
                  }}
                />
              </Box>
              <Typography variant="caption" color="textSecondary" sx={{ 
                textAlign: 'center', 
                display: 'block',
                mt: 1
              }}>
                Full-featured editor with font controls: Select text to change font family, size, color, and apply formatting.
              </Typography>
            </Box>

            {/* Submit Button */}
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'center', 
              mt: 4 
            }}>
              <Button
                type="submit"
                variant="contained"
                size="large"
                sx={{
                  px: 4,
                  py: 1.5,
                  fontSize: '1.1rem',
                  fontWeight: 600,
                  borderRadius: 2,
                  textTransform: 'none',
                  boxShadow: theme.shadows[3],
                  '&:hover': {
                    boxShadow: theme.shadows[6],
                  }
                }}
              >
                Submit Article
              </Button>
            </Box>
          </form>
        </Paper>

        {/* Link Dialog */}
        <Dialog open={linkDialogOpen} onClose={() => setLinkDialogOpen(false)} maxWidth="sm" fullWidth>
          <DialogTitle>Insert Link</DialogTitle>
          <DialogContent>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
              <TextField
                label="Link Text"
                value={linkText}
                onChange={(e) => setLinkText(e.target.value)}
                fullWidth
                helperText="The text that will be displayed (leave empty to use selected text)"
              />
              <TextField
                label="URL"
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                fullWidth
                placeholder="https://example.com"
                required
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setLinkDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleLinkCreate} variant="contained" disabled={!linkUrl}>
              Insert Link
            </Button>
          </DialogActions>
        </Dialog>

        {/* Font Family Menu */}
        <Menu
          anchorEl={fontFamilyMenuAnchor}
          open={Boolean(fontFamilyMenuAnchor)}
          onClose={() => setFontFamilyMenuAnchor(null)}
          PaperProps={{
            sx: { maxHeight: 300, width: 250 }
          }}
        >
          {fontFamilies.map((font) => (
            <MenuItem
              key={font.label}
              onClick={() => handleFontFamilyChange(font.value)}
              sx={{
                fontFamily: font.value,
                backgroundColor: currentFontFamily === font.label ? theme.palette.action.selected : 'transparent'
              }}
            >
              {font.label}
            </MenuItem>
          ))}
        </Menu>

        {/* Font Size Menu */}
        <Menu
          anchorEl={fontSizeMenuAnchor}
          open={Boolean(fontSizeMenuAnchor)}
          onClose={() => setFontSizeMenuAnchor(null)}
          PaperProps={{
            sx: { maxHeight: 300, width: 120 }
          }}
        >
          {fontSizes.map((size) => (
            <MenuItem
              key={size.label}
              onClick={() => handleFontSizeChange(size.value)}
              sx={{
                fontSize: size.value,
                backgroundColor: currentFontSize === size.value ? theme.palette.action.selected : 'transparent'
              }}
            >
              {size.label}
            </MenuItem>
          ))}
        </Menu>

        {/* Color Menu */}
        <Menu
          anchorEl={colorMenuAnchor}
          open={Boolean(colorMenuAnchor)}
          onClose={() => setColorMenuAnchor(null)}
          PaperProps={{
            sx: { maxWidth: 300, p: 1 }
          }}
        >
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 1 }}>
            {textColors.map((color) => (
              <MenuItem
                key={color.name}
                onClick={() => handleColorSelect(color.value)}
                sx={{
                  minWidth: 'auto',
                  width: 32,
                  height: 32,
                  backgroundColor: color.value === 'inherit' ? 'transparent' : color.value,
                  border: color.value === 'inherit' ? `2px solid ${theme.palette.text.primary}` : '2px solid transparent',
                  borderRadius: 1,
                  '&:hover': {
                    borderColor: theme.palette.primary.main,
                  }
                }}
                title={color.name}
              />
            ))}
          </Box>
        </Menu>
      </Container>
    </Layout>
  );
};

export default SubmitArticlePage;