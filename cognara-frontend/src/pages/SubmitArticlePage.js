import React, { useState, useCallback, useEffect, useRef } from 'react';
import { 
  Box, 
  Button, 
  Container, 
  Paper, 
  TextField, 
  Typography, 
  Alert, 
  IconButton, 
  Tooltip, 
  useTheme, 
  Drawer, 
  Divider, 
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Badge,
  Fab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Slider,
  Card,
  CardContent,
  Menu,
  ListItemIcon,
  ListItemText,
  Stack,
  Tab,
  Tabs,
  Grid,
  LinearProgress,
  InputAdornment  // Added missing import
} from '@mui/material';
import {
  FormatBold,
  FormatItalic,
  FormatUnderlined,
  FormatStrikethrough,
  FormatQuote,
  FormatListBulleted,
  FormatListNumbered,
  FormatAlignLeft,
  FormatAlignCenter,
  FormatAlignRight,
  FormatAlignJustify,
  Link as LinkIcon,
  Image as ImageIcon,
  Settings as SettingsIcon,
  Publish as PublishIcon,
  Save as SaveIcon,
  Preview as PreviewIcon,
  Fullscreen,
  FullscreenExit,
  Palette,
  Code,
  TableChart,
  VideoLibrary,
  Schedule,
  Visibility,
  ExpandMore,
  Add,
  Delete,
  CloudUpload,
  Undo,
  Redo,
  FindReplace,
  Spellcheck,
  AutoFixHigh,
  Analytics,
  Share,
  BookmarkBorder,
  Category,
  Label,
  Psychology,
  Timer,
  MenuBook,
  Assessment,
  TrendingUp,
  AutoAwesome,
  ContentCopy,
  VolumeUp,
  Translate,
  ChatBubbleOutline,
  AccessTime
} from '@mui/icons-material';

const SubmitArticlePage = () => {
  const theme = useTheme();
  const [formData, setFormData] = useState({
    title: '',
    subtitle: '',
    summary: '',
    content: '',
    tags: [],
    category: '',
    metaDescription: '',
    slug: '',
    readingTime: 0,
    publishAt: null,
    status: 'draft'
  });
  
  const [editorState, setEditorState] = useState({
    isFullscreen: false,
    isDistraction: false,
    fontSize: 16,
    lineHeight: 1.6,
    maxWidth: 800,
    showWordCount: true,
    showReadingTime: true,
    enableSpellcheck: true,
    enableGrammarCheck: true,
    enableAutoSave: true,
    saveInterval: 30000
  });

  const [ui, setUi] = useState({
    sidebarOpen: false,
    sidebarTab: 0,
    formatMenuAnchor: null,
    insertMenuAnchor: null,
    linkDialogOpen: false,
    imageDialogOpen: false,
    tableDialogOpen: false,
    previewMode: false,
    aiAssistOpen: false
  });

  const [status, setStatus] = useState({ message: '', type: '', progress: 0 });
  const [stats, setStats] = useState({
    wordCount: 0,
    charCount: 0,
    paragraphCount: 0,
    readingTime: 0,
    readabilityScore: 0
  });

  const [featuredImage, setFeaturedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [gallery, setGallery] = useState([]);
  const [categories] = useState(['Technology', 'Business', 'Science', 'Health', 'Entertainment', 'Sports']);
  const [recentTags] = useState(['React', 'JavaScript', 'Web Development', 'AI', 'Machine Learning']);
  const [newTag, setNewTag] = useState('');
  
  const editorRef = useRef(null);
  const autoSaveRef = useRef(null);
  const fileInputRef = useRef(null);

  // Content analysis and statistics
  const analyzeContent = useCallback((content) => {
    const text = content.replace(/<[^>]*>/g, '');
    const words = text.trim().split(/\s+/).filter(word => word.length > 0);
    const chars = text.length;
    const paragraphs = content.split('</p>').length - 1;
    const readingTime = Math.ceil(words.length / 200);
    
    // Simple readability score (Flesch Reading Ease approximation)
    const avgWordsPerSentence = words.length / (text.split(/[.!?]+/).length - 1 || 1);
    const avgSyllablesPerWord = words.reduce((acc, word) => acc + countSyllables(word), 0) / words.length;
    const readabilityScore = Math.max(0, Math.min(100, 206.835 - (1.015 * avgWordsPerSentence) - (84.6 * avgSyllablesPerWord)));

    setStats({
      wordCount: words.length,
      charCount: chars,
      paragraphCount: paragraphs,
      readingTime,
      readabilityScore: Math.round(readabilityScore)
    });
  }, []);

  const countSyllables = (word) => {
    return word.toLowerCase().replace(/[^a-z]/g, '').replace(/e$/, '').replace(/[aeiouy]{2,}/g, 'a').match(/[aeiouy]/g)?.length || 1;
  };

  // Auto-save functionality
  useEffect(() => {
    if (editorState.enableAutoSave) {
      autoSaveRef.current = setInterval(() => {
        if (formData.title || formData.content) {
          setStatus({ message: 'Auto-saving...', type: 'info', progress: 50 });
          setTimeout(() => {
            setStatus({ message: 'Saved', type: 'success', progress: 100 });
            setTimeout(() => setStatus({ message: '', type: '', progress: 0 }), 2000);
          }, 1000);
        }
      }, editorState.saveInterval);
    }

    return () => {
      if (autoSaveRef.current) {
        clearInterval(autoSaveRef.current);
      }
    };
  }, [editorState.enableAutoSave, editorState.saveInterval, formData.title, formData.content]);

  // Content change handler
  const handleContentChange = (content) => {
    setFormData(prev => ({ ...prev, content }));
    analyzeContent(content);
  };

  // Format toolbar actions
  const formatActions = [
    { icon: FormatBold, label: 'Bold', action: () => document.execCommand('bold') },
    { icon: FormatItalic, label: 'Italic', action: () => document.execCommand('italic') },
    { icon: FormatUnderlined, label: 'Underline', action: () => document.execCommand('underline') },
    { icon: FormatStrikethrough, label: 'Strikethrough', action: () => document.execCommand('strikethrough') },
    { icon: FormatQuote, label: 'Quote', action: () => document.execCommand('formatBlock', false, 'blockquote') },
    { icon: FormatListBulleted, label: 'Bullet List', action: () => document.execCommand('insertUnorderedList') },
    { icon: FormatListNumbered, label: 'Numbered List', action: () => document.execCommand('insertOrderedList') },
    { icon: Code, label: 'Code', action: () => document.execCommand('formatBlock', false, 'pre') }
  ];

  const alignActions = [
    { icon: FormatAlignLeft, label: 'Align Left', action: () => document.execCommand('justifyLeft') },
    { icon: FormatAlignCenter, label: 'Align Center', action: () => document.execCommand('justifyCenter') },
    { icon: FormatAlignRight, label: 'Align Right', action: () => document.execCommand('justifyRight') },
    { icon: FormatAlignJustify, label: 'Justify', action: () => document.execCommand('justifyFull') }
  ];

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        setStatus({ message: 'Image size must be less than 10MB.', type: 'error' });
        return;
      }
      setFeaturedImage(file);
      const reader = new FileReader();
      reader.onload = (event) => setImagePreview(event.target.result);
      reader.readAsDataURL(file);
    }
  };

  const handlePublish = async () => {
    if (!formData.title || !formData.content) {
      setStatus({ message: 'Title and content are required.', type: 'error' });
      return;
    }

    setStatus({ message: 'Publishing...', type: 'info', progress: 0 });
    
    // Simulate publishing process
    for (let i = 0; i <= 100; i += 20) {
      await new Promise(resolve => setTimeout(resolve, 200));
      setStatus({ message: 'Publishing...', type: 'info', progress: i });
    }
    
    setStatus({ message: 'Article published successfully!', type: 'success', progress: 100 });
    setTimeout(() => setStatus({ message: '', type: '', progress: 0 }), 3000);
  };

  const toggleFullscreen = () => {
    setEditorState(prev => ({ ...prev, isFullscreen: !prev.isFullscreen }));
  };

  const toggleDistraction = () => {
    setEditorState(prev => ({ ...prev, isDistraction: !prev.isDistraction }));
  };

  const handleAddTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({ 
        ...prev, 
        tags: [...prev.tags, newTag.trim()] 
      }));
      setNewTag('');
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setFormData(prev => ({ 
      ...prev, 
      tags: prev.tags.filter(tag => tag !== tagToRemove) 
    }));
  };

  const SidebarContent = () => (
    <Box sx={{ width: 400, height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
        <Typography variant="h6">Advanced Settings</Typography>
        <Tabs value={ui.sidebarTab} onChange={(e, v) => setUi(prev => ({ ...prev, sidebarTab: v }))}>
          <Tab label="SEO" />
          <Tab label="Publishing" />
          <Tab label="Analytics" />
        </Tabs>
      </Box>

      <Box sx={{ flex: 1, overflow: 'auto', p: 2 }}>
        {ui.sidebarTab === 0 && (
          <Stack spacing={3}>
            <TextField
              fullWidth
              label="Meta Description"
              value={formData.metaDescription}
              onChange={(e) => setFormData(prev => ({ ...prev, metaDescription: e.target.value }))}
              multiline
              rows={3}
              helperText={`${formData.metaDescription.length}/160 characters`}
            />

            <TextField
              fullWidth
              label="URL Slug"
              value={formData.slug}
              onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
              helperText="URL-friendly version of the title"
            />

            <Card>
              <CardContent>
                <Typography variant="subtitle2" gutterBottom>SEO Preview</Typography>
                <Typography variant="body2" color="primary" sx={{ textDecoration: 'underline' }}>
                  {formData.title || 'Your Article Title'}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {formData.metaDescription || 'Your meta description will appear here...'}
                </Typography>
              </CardContent>
            </Card>
          </Stack>
        )}

        {ui.sidebarTab === 1 && (
          <Stack spacing={3}>
            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select
                value={formData.status}
                onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value }))}
              >
                <MenuItem value="draft">Draft</MenuItem>
                <MenuItem value="review">Under Review</MenuItem>
                <MenuItem value="scheduled">Scheduled</MenuItem>
                <MenuItem value="published">Published</MenuItem>
              </Select>
            </FormControl>

            <TextField
              fullWidth
              label="Publish Date"
              type="datetime-local"
              value={formData.publishAt || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, publishAt: e.target.value }))}
              InputLabelProps={{ shrink: true }}
            />

            <Box>
              <Typography variant="subtitle2" gutterBottom>Visibility</Typography>
              <FormControlLabel
                control={<Switch defaultChecked />}
                label="Public"
              />
              <FormControlLabel
                control={<Switch />}
                label="Allow Comments"
              />
              <FormControlLabel
                control={<Switch />}
                label="Allow Sharing"
              />
            </Box>
          </Stack>
        )}

        {ui.sidebarTab === 2 && (
          <Stack spacing={3}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>Content Statistics</Typography>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Box textAlign="center">
                      <Typography variant="h4" color="primary">{stats.wordCount}</Typography>
                      <Typography variant="caption">Words</Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={6}>
                    <Box textAlign="center">
                      <Typography variant="h4" color="primary">{stats.readingTime}</Typography>
                      <Typography variant="caption">Min Read</Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={6}>
                    <Box textAlign="center">
                      <Typography variant="h4" color="primary">{stats.charCount}</Typography>
                      <Typography variant="caption">Characters</Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={6}>
                    <Box textAlign="center">
                      <Typography variant="h4" color="primary">{stats.paragraphCount}</Typography>
                      <Typography variant="caption">Paragraphs</Typography>
                    </Box>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>

            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>Readability Score</Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Box sx={{ width: '100%', mr: 1 }}>
                    <LinearProgress 
                      variant="determinate" 
                      value={stats.readabilityScore} 
                      sx={{ height: 10, borderRadius: 5 }}
                    />
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    {stats.readabilityScore}/100
                  </Typography>
                </Box>
                <Typography variant="body2" color="text.secondary">
                  {stats.readabilityScore > 80 ? 'Very Easy' : 
                   stats.readabilityScore > 60 ? 'Easy' : 
                   stats.readabilityScore > 40 ? 'Moderate' : 
                   stats.readabilityScore > 20 ? 'Difficult' : 'Very Difficult'}
                </Typography>
              </CardContent>
            </Card>

            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>AI Suggestions</Typography>
                <Button fullWidth startIcon={<AutoAwesome />} sx={{ mb: 1 }}>
                  Improve Readability
                </Button>
                <Button fullWidth startIcon={<TrendingUp />} sx={{ mb: 1 }}>
                  SEO Optimization
                </Button>
                <Button fullWidth startIcon={<Psychology />}>
                  Enhance Engagement
                </Button>
              </CardContent>
            </Card>
          </Stack>
        )}
      </Box>
    </Box>
  );

  return (
    <Box sx={{ 
      height: '100vh', 
      display: 'flex', 
      flexDirection: 'column',
      mt: 20,
      bgcolor: editorState.isDistraction ? 'background.paper' : 'background.default'
    }}>
      {/* Top Toolbar */}
      {!editorState.isDistraction && (
        <Paper elevation={1} sx={{ p: 1, borderBottom: 1, borderColor: 'divider' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography variant="h6" sx={{ mr: 2 }}>
                {formData.title || 'Untitled Article'}
              </Typography>
              {editorState.showWordCount && (
                <Chip label={`${stats.wordCount} words`} size="small" />
              )}
              {editorState.showReadingTime && (
                <Chip label={`${stats.readingTime} min read`} size="small" />
              )}
            </Box>
            
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Button startIcon={<SaveIcon />} size="small">
                Save
              </Button>
              <Button startIcon={<PreviewIcon />} size="small">
                Preview
              </Button>
              <Button 
                variant="contained" 
                startIcon={<PublishIcon />}
                onClick={handlePublish}
              >
                Publish
              </Button>
              <IconButton onClick={() => setUi(prev => ({ ...prev, sidebarOpen: true }))}>
                <SettingsIcon />
              </IconButton>
            </Box>
          </Box>
        </Paper>
      )}

      {/* Format Toolbar */}
      {!editorState.isDistraction && (
        <Paper elevation={0} sx={{ p: 1, borderBottom: 1, borderColor: 'divider' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, flexWrap: 'wrap' }}>
            {/* Undo/Redo */}
            <IconButton size="small" onClick={() => document.execCommand('undo')}>
              <Undo />
            </IconButton>
            <IconButton size="small" onClick={() => document.execCommand('redo')}>
              <Redo />
            </IconButton>
            
            <Divider orientation="vertical" flexItem sx={{ mx: 1 }} />
            
            {/* Format Actions */}
            {formatActions.map(({ icon: Icon, label, action }) => (
              <Tooltip key={label} title={label}>
                <IconButton size="small" onClick={action}>
                  <Icon />
                </IconButton>
              </Tooltip>
            ))}
            
            <Divider orientation="vertical" flexItem sx={{ mx: 1 }} />
            
            {/* Alignment */}
            {alignActions.map(({ icon: Icon, label, action }) => (
              <Tooltip key={label} title={label}>
                <IconButton size="small" onClick={action}>
                  <Icon />
                </IconButton>
              </Tooltip>
            ))}
            
            <Divider orientation="vertical" flexItem sx={{ mx: 1 }} />
            
            {/* Insert Tools */}
            <Tooltip title="Insert Link">
              <IconButton size="small" onClick={() => setUi(prev => ({ ...prev, linkDialogOpen: true }))}>
                <LinkIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Insert Image">
              <IconButton size="small" onClick={() => setUi(prev => ({ ...prev, imageDialogOpen: true }))}>
                <ImageIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Insert Table">
              <IconButton size="small" onClick={() => setUi(prev => ({ ...prev, tableDialogOpen: true }))}>
                <TableChart />
              </IconButton>
            </Tooltip>
            <Tooltip title="Insert Video">
              <IconButton size="small">
                <VideoLibrary />
              </IconButton>
            </Tooltip>
            
            <Box sx={{ flexGrow: 1 }} />
            
            {/* View Options */}
            <Tooltip title="Distraction Free">
              <IconButton size="small" onClick={toggleDistraction}>
                <MenuBook />
              </IconButton>
            </Tooltip>
            <Tooltip title={editorState.isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}>
              <IconButton size="small" onClick={toggleFullscreen}>
                {editorState.isFullscreen ? <FullscreenExit /> : <Fullscreen />}
              </IconButton>
            </Tooltip>
          </Box>
        </Paper>
      )}

      {/* Status Bar */}
      {status.message && (
        <Alert 
          severity={status.type} 
          sx={{ borderRadius: 0 }}
          action={
            status.progress > 0 && (
              <LinearProgress 
                variant="determinate" 
                value={status.progress} 
                sx={{ width: 100 }}
              />
            )
          }
        >
          {status.message}
        </Alert>
      )}

      {/* Main Content Area */}
      <Box sx={{ 
        flex: 1, 
        display: 'flex',
        overflow: 'hidden'
      }}>
        <Container 
          maxWidth={false}
          sx={{ 
            flex: 1,
            py: 3,
            px: editorState.isDistraction ? 8 : 3,
            overflow: 'auto',
            maxWidth: editorState.maxWidth,
            mx: 'auto'
          }}
        >
          {/* Article Meta Fields */}
          <Stack spacing={3} sx={{ mb: 4 }}>
            <TextField
              fullWidth
              label="Article Title"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              variant="outlined"
              size="large"
              placeholder="Enter your article title..."
              sx={{ 
                '& .MuiInputBase-input': { 
                  fontSize: '1.5rem',
                  fontWeight: 'bold'
                }
              }}
            />
            
            <TextField
              fullWidth
              label="Subtitle (Optional)"
              value={formData.subtitle}
              onChange={(e) => setFormData(prev => ({ ...prev, subtitle: e.target.value }))}
              variant="outlined"
              placeholder="Add a subtitle to provide more context..."
            />

            <TextField
              fullWidth
              label="Article Summary"
              value={formData.summary}
              onChange={(e) => setFormData(prev => ({ ...prev, summary: e.target.value }))}
              multiline
              rows={3}
              helperText="A brief description for previews and social sharing (recommended 150-160 characters)"
              placeholder="Write a compelling summary of your article..."
            />

            <Box sx={{ display: 'flex', gap: 2 }}>
              <FormControl sx={{ minWidth: 200 }}>
                <InputLabel>Category</InputLabel>
                <Select
                  value={formData.category}
                  onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                  label="Category"
                >
                  {categories.map(cat => (
                    <MenuItem key={cat} value={cat}>{cat}</MenuItem>
                  ))}
                </Select>
              </FormControl>

              <Box sx={{ flex: 1 }}>
                <Typography variant="subtitle2" gutterBottom>Tags</Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 1 }}>
                  {formData.tags.map((tag, index) => (
                    <Chip 
                      key={index} 
                      label={tag} 
                      onDelete={() => handleRemoveTag(tag)}
                      size="small"
                      color="primary"
                      variant="outlined"
                    />
                  ))}
                </Box>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <TextField
                    size="small"
                    placeholder="Add tags..."
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        handleAddTag();
                      }
                    }}
                    sx={{ flex: 1 }}
                  />
                  <Button 
                    size="small" 
                    onClick={handleAddTag}
                    disabled={!newTag.trim()}
                  >
                    Add
                  </Button>
                </Box>
              </Box>
            </Box>

            <Box>
              <Typography variant="subtitle2" gutterBottom>Featured Image</Typography>
              <input
                type="file"
                accept="image/*"
                ref={fileInputRef}
                onChange={handleImageUpload}
                style={{ display: 'none' }}
              />
              {!imagePreview ? (
                <Button
                  variant="outlined"
                  startIcon={<CloudUpload />}
                  onClick={() => fileInputRef.current?.click()}
                  sx={{ height: 120, width: '100%', borderStyle: 'dashed' }}
                >
                  Upload Featured Image
                </Button>
              ) : (
                <Box sx={{ position: 'relative', display: 'inline-block' }}>
                  <img 
                    src={imagePreview} 
                    alt="Featured" 
                    style={{ width: '100%', maxHeight: 300, objectFit: 'cover', borderRadius: 8 }}
                  />
                  <IconButton
                    size="small"
                    onClick={() => { setImagePreview(null); setFeaturedImage(null); }}
                    sx={{ position: 'absolute', top: 8, right: 8, bgcolor: 'rgba(0,0,0,0.5)', color: 'white' }}
                  >
                    <Delete />
                  </IconButton>
                </Box>
              )}
            </Box>
          </Stack>

          {/* Article Content Editor */}
          <Box sx={{ mb: 2 }}>
            <Typography variant="h6" gutterBottom>
              Article Content
            </Typography>
            <Box
              ref={editorRef}
              contentEditable
              suppressContentEditableWarning
              onInput={(e) => handleContentChange(e.target.innerHTML)}
              sx={{
                minHeight: 500,
                fontSize: editorState.fontSize,
                lineHeight: editorState.lineHeight,
                outline: 'none',
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 1,
                p: 3,
                bgcolor: 'background.paper',
                '&:focus': {
                  outline: 'none',
                  borderColor: 'primary.main'
                },
                '&:empty:before': {
                  content: '"Start writing your article here..."',
                  color: 'text.disabled',
                  fontStyle: 'italic'
                },
                '& p': {
                  margin: '1em 0',
                  '&:first-of-type': {
                    marginTop: 0
                  }
                },
                '& h1, & h2, & h3': {
                  fontWeight: 'bold',
                  margin: '1.5em 0 0.5em 0'
                },
                '& h1': { fontSize: '2em' },
                '& h2': { fontSize: '1.5em' },
                '& h3': { fontSize: '1.25em' },
                '& blockquote': {
                  borderLeft: '4px solid',
                  borderColor: 'primary.main',
                  pl: 2,
                  fontStyle: 'italic',
                  margin: '1em 0'
                },
                '& ul, & ol': {
                  margin: '1em 0',
                  pl: 2
                },
                '& pre': {
                  bgcolor: 'grey.100',
                  p: 2,
                  borderRadius: 1,
                  overflow: 'auto',
                  fontFamily: 'monospace'
                }
              }}
            />
          </Box>

          {/* Content Statistics */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2 }}>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Chip 
                icon={<AccessTime />}
                label={`${stats.readingTime} min read`} 
                size="small" 
                variant="outlined"
              />
              <Chip 
                label={`${stats.wordCount} words`} 
                size="small" 
                variant="outlined"
              />
              <Chip 
                label={`${stats.charCount} characters`} 
                size="small" 
                variant="outlined"
              />
            </Box>
            <Button 
              variant="contained" 
              size="large"
              startIcon={<PublishIcon />}
              onClick={handlePublish}
              disabled={!formData.title || !formData.content}
            >
              Publish Article
            </Button>
          </Box>
        </Container>
      </Box>

      {/* Settings Sidebar */}
      <Drawer
        anchor="right"
        open={ui.sidebarOpen}
        onClose={() => setUi(prev => ({ ...prev, sidebarOpen: false }))}
      >
        <SidebarContent />
      </Drawer>

      {/* Insert Link Dialog */}
      <Dialog open={ui.linkDialogOpen} onClose={() => setUi(prev => ({ ...prev, linkDialogOpen: false }))}>
        <DialogTitle>Insert Link</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ pt: 1 }}>
            <TextField
              autoFocus
              fullWidth
              label="URL"
              placeholder="https://example.com"
            />
            <TextField
              fullWidth
              label="Text to display"
              placeholder="Link text"
            />
            <FormControlLabel
              control={<Switch />}
              label="Open in new tab"
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setUi(prev => ({ ...prev, linkDialogOpen: false }))}>Cancel</Button>
          <Button variant="contained">Insert</Button>
        </DialogActions>
      </Dialog>

      {/* Insert Image Dialog */}
      <Dialog 
        open={ui.imageDialogOpen} 
        onClose={() => setUi(prev => ({ ...prev, imageDialogOpen: false }))}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Insert Image</DialogTitle>
        <DialogContent>
          <Tabs value={0} sx={{ mb: 2 }}>
            <Tab label="Upload" />
            <Tab label="Gallery" />
            <Tab label="URL" />
          </Tabs>
          
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Box sx={{ 
              border: '1px dashed', 
              borderColor: 'divider', 
              borderRadius: 1, 
              p: 4,
              textAlign: 'center'
            }}>
              <CloudUpload fontSize="large" color="action" />
              <Typography variant="body1" sx={{ mt: 1 }}>
                Drag and drop image here or click to browse
              </Typography>
              <Button 
                variant="outlined" 
                sx={{ mt: 2 }}
                onClick={() => fileInputRef.current?.click()}
              >
                Select Image
              </Button>
            </Box>

            <TextField
              fullWidth
              label="Alternative Text"
              helperText="Description for accessibility and SEO"
            />

            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                fullWidth
                label="Width"
                type="number"
                defaultValue="100"
                InputProps={{
                  endAdornment: <InputAdornment position="end">%</InputAdornment>
                }}
              />
              <TextField
                fullWidth
                label="Alignment"
                select
                defaultValue="center"
              >
                <MenuItem value="left">Left</MenuItem>
                <MenuItem value="center">Center</MenuItem>
                <MenuItem value="right">Right</MenuItem>
              </TextField>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setUi(prev => ({ ...prev, imageDialogOpen: false }))}>Cancel</Button>
          <Button variant="contained">Insert</Button>
        </DialogActions>
      </Dialog>

      {/* Insert Table Dialog */}
      <Dialog open={ui.tableDialogOpen} onClose={() => setUi(prev => ({ ...prev, tableDialogOpen: false }))}>
        <DialogTitle>Insert Table</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                label="Rows"
                type="number"
                defaultValue="3"
              />
              <TextField
                label="Columns"
                type="number"
                defaultValue="3"
              />
            </Box>

            <Box>
              <Typography variant="subtitle2" gutterBottom>Table Style</Typography>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button variant="outlined">Basic</Button>
                <Button variant="outlined">Bordered</Button>
                <Button variant="outlined">Striped</Button>
              </Box>
            </Box>

            <FormControlLabel
              control={<Switch defaultChecked />}
              label="Include header row"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setUi(prev => ({ ...prev, tableDialogOpen: false }))}>Cancel</Button>
          <Button variant="contained">Insert</Button>
        </DialogActions>
      </Dialog>

      {/* AI Assist Panel */}
      <Drawer
        anchor="bottom"
        open={ui.aiAssistOpen}
        onClose={() => setUi(prev => ({ ...prev, aiAssistOpen: false }))}
        PaperProps={{
          sx: { height: '40vh' }
        }}
      >
        <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', height: '100%' }}>
          <Typography variant="h6" gutterBottom>AI Writing Assistant</Typography>
          
          <Tabs value={0} sx={{ mb: 2 }}>
            <Tab label="Improve" />
            <Tab label="Summarize" />
            <Tab label="Expand" />
            <Tab label="Rephrase" />
          </Tabs>

          <Box sx={{ flex: 1, overflow: 'auto', mb: 2 }}>
            <Typography variant="body1">
              Select text to get AI suggestions or ask for general improvements to your content.
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', gap: 1 }}>
            <TextField
              fullWidth
              placeholder="Ask AI to help with your writing..."
            />
            <Button variant="contained">Ask</Button>
          </Box>
        </Box>
      </Drawer>

      {/* Floating Action Buttons */}
      {!ui.sidebarOpen && (
        <Box sx={{ position: 'fixed', right: 16, bottom: 16, display: 'flex', flexDirection: 'column', gap: 1 }}>
          <Tooltip title="AI Assist">
            <Fab 
              color="primary" 
              onClick={() => setUi(prev => ({ ...prev, aiAssistOpen: true }))}
            >
              <AutoAwesome />
            </Fab>
          </Tooltip>
          
          <Tooltip title="Save Draft">
            <Fab color="secondary">
              <SaveIcon />
            </Fab>
          </Tooltip>
        </Box>
      )}
    </Box>
  );
};

export default SubmitArticlePage;