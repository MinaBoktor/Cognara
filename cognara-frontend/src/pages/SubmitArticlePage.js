import React, { useState, useCallback, useEffect, useRef } from 'react';
import TiptapEditor from '../components/Editor/TiptapEditor';
import { useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Bold from '@tiptap/extension-bold';
import {
  Box, Button, TextField, Typography, Alert, IconButton, Tooltip, Divider, Chip, FormControl, InputLabel, Select,
  MenuItem, Stack, Snackbar, Avatar, Grid, LinearProgress, Switch, FormControlLabel, Dialog, DialogTitle, DialogContent, DialogActions
} from '@mui/material';
import {
  FormatBold, FormatItalic, FormatUnderlined, FormatListBulleted, FormatListNumbered, Link as LinkIcon,
  FormatAlignLeft, FormatAlignCenter, FormatAlignRight, FormatAlignJustify,
  Publish as PublishIcon, Save as SaveIcon, Preview as PreviewIcon,
  Fullscreen, FullscreenExit, Settings as SettingsIcon, AutoAwesome,
  CheckCircle, Warning, Error, Info, Close, SmartToy, Undo, Redo, Category
} from '@mui/icons-material';

const categoriesList = [
  'Technology', 'Business', 'Science', 'Health', 'Entertainment', 'Sports', 'Lifestyle', 'Travel', 'Food', 'Fashion', 'Education',
  'Finance', 'Politics', 'Environment', 'Culture', 'Arts'
];

const SubmitArticlePage = () => {
  const HEADER_HEIGHT = 64;
  const [formData, setFormData] = useState({
    title: '', subtitle: '', content: '', category: '',
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
  const [newTag, setNewTag] = useState('');
  const autoSaveRef = useRef(null);

  // Tiptap editor instance for toolbar actions
  const tiptapEditor = useEditor({
    extensions: [StarterKit, Bold],
    content: formData.content,
    onUpdate: ({ editor }) => {
      setFormData(prev => ({ ...prev, content: editor.getHTML() }));
      analyzeContent(editor.getHTML());
    },
    editorProps: {
      attributes: {
        style: `min-height:300px;outline:none;font-size:${editorState.fontSize}px;font-family:${editorState.fontFamily};line-height:${editorState.lineHeight};text-align:left;`,
        spellCheck: 'true',
        dir: 'ltr',
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
    // Remove metaDescription and tags from SEO score
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
    if (editorState.enableAutoSave) {
      autoSaveRef.current = setInterval(() => {
        if (formData.title || formData.content) showSnackbar('Auto-saved', 'success');
      }, editorState.saveInterval);
    }
    return () => { if (autoSaveRef.current) clearInterval(autoSaveRef.current); };
  }, [editorState.enableAutoSave, editorState.saveInterval, formData.title, formData.content]);

  // Snackbar
  const showSnackbar = (message, severity = 'info') => setUi(prev => ({ ...prev, snackbarOpen: true, snackbarMessage: message, snackbarSeverity: severity }));

  // Toolbar actions using Tiptap
  const formatActions = [
    { icon: FormatBold, label: 'Bold', action: () => tiptapEditor && tiptapEditor.chain().focus().toggleBold().run(), shortcut: 'Ctrl+B' },
    { icon: FormatItalic, label: 'Italic', action: () => tiptapEditor && tiptapEditor.chain().focus().toggleItalic().run(), shortcut: 'Ctrl+I' },
    { icon: FormatUnderlined, label: 'Underline', action: () => tiptapEditor && tiptapEditor.chain().focus().toggleUnderline && tiptapEditor.chain().focus().toggleUnderline().run(), shortcut: 'Ctrl+U' },
    { icon: FormatListBulleted, label: 'Bullet List', action: () => tiptapEditor && tiptapEditor.chain().focus().toggleBulletList().run() },
    { icon: FormatListNumbered, label: 'Numbered List', action: () => tiptapEditor && tiptapEditor.chain().focus().toggleOrderedList && tiptapEditor.chain().focus().toggleOrderedList().run() },
    { icon: LinkIcon, label: 'Insert Link', action: () => {
      const url = prompt('Enter URL:');
      if (url && tiptapEditor) tiptapEditor.chain().focus().setLink({ href: url }).run();
    }},
    { icon: FormatAlignLeft, label: 'Align Left', action: () => tiptapEditor && tiptapEditor.chain().focus().setTextAlign('left').run() },
    { icon: FormatAlignCenter, label: 'Align Center', action: () => tiptapEditor && tiptapEditor.chain().focus().setTextAlign('center').run() },
    { icon: FormatAlignRight, label: 'Align Right', action: () => tiptapEditor && tiptapEditor.chain().focus().setTextAlign('right').run() },
    { icon: FormatAlignJustify, label: 'Justify', action: () => tiptapEditor && tiptapEditor.chain().focus().setTextAlign('justify').run() },
  ];

  // Save draft, publish
  const handleSaveDraft = () => showSnackbar('Draft saved', 'success');
  const handlePublish = async () => {
    const errors = [];
    if (!formData.title) errors.push('Title required');
    if (!formData.content) errors.push('Content required');
    if (!formData.category) errors.push('Category required');
    if (errors.length > 0) { showSnackbar(errors.join(', '), 'error'); return; }
    setStatus({ message: 'Publishing...', type: 'info', progress: 0 });
    for (const step of [
      { message: 'Validating...', progress: 20 },
      { message: 'Optimizing...', progress: 40 },
      { message: 'Generating SEO...', progress: 60 },
      { message: 'Preparing preview...', progress: 80 },
      { message: 'Publishing...', progress: 100 }
    ]) {
      await new Promise(res => setTimeout(res, 500));
      setStatus({ message: step.message, type: 'info', progress: step.progress });
    }
    setStatus({ message: 'Article published!', type: 'success', progress: 100 });
    showSnackbar('Article published!', 'success');
    setTimeout(() => setStatus({ message: '', type: '', progress: 0 }), 2000);
  };

  // Tag management
  const handleAddTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) setFormData(prev => ({ ...prev, tags: [...prev.tags, newTag.trim()] })); setNewTag('');
  };
  const handleRemoveTag = (tagToRemove) => setFormData(prev => ({ ...prev, tags: prev.tags.filter(tag => tag !== tagToRemove) }));

  // Fullscreen
  const toggleFullscreen = () => setEditorState(prev => ({ ...prev, isFullscreen: !prev.isFullscreen }));

  // Keyboard shortcuts for Tiptap formatting
  useEffect(() => {
    const handler = (e) => {
      if ((e.ctrlKey || e.metaKey) && !e.altKey && tiptapEditor) {
        switch (e.key.toLowerCase()) {
          case 'b': tiptapEditor.chain().focus().toggleBold().run(); e.preventDefault(); break;
          case 'i': tiptapEditor.chain().focus().toggleItalic().run(); e.preventDefault(); break;
          // Underline is not in StarterKit by default
          default: break;
        }
      }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [tiptapEditor]);

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
        <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', gap: 2 }}>
          <SmartToy color="primary" sx={{ fontSize: 32, mr: 1 }} />
          <Typography variant="h6" sx={{ fontWeight: 600 }}>Submit Article</Typography>
        </Box>
        <Stack direction="row" spacing={2} alignItems="center">
          <Button variant="outlined" startIcon={<SaveIcon />} size="small" onClick={handleSaveDraft} sx={{ borderRadius: 2 }}>Save Draft</Button>
          <Button variant="outlined" startIcon={<PreviewIcon />} size="small" onClick={() => setUi(prev => ({ ...prev, previewMode: !prev.previewMode }))} sx={{ borderRadius: 2 }}>{ui.previewMode ? 'Exit Preview' : 'Preview'}</Button>
          <Button variant="contained" startIcon={<PublishIcon />} size="small" onClick={handlePublish} sx={{ borderRadius: 2 }}>Publish</Button>
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
            // Hide scrollbar for all major browsers:
            scrollbarWidth: 'none', // Firefox
            msOverflowStyle: 'none', // IE 10+
            '&::-webkit-scrollbar': { display: 'none' }, // Chrome/Safari/Webkit
          }}
        >
          {/* Editor toolbar */}
          <Box sx={{ display: 'flex', alignItems: 'center', py: 1, px: 3, borderBottom: t => `1px solid ${t.palette.divider}`, gap: 1 }}>
            {formatActions.map((item, index) => (
              <Tooltip key={index} title={`${item.label}${item.shortcut ? ` (${item.shortcut})` : ''}`}>
                <IconButton size="small" onClick={item.action} disabled={!tiptapEditor}><item.icon fontSize="small" /></IconButton>
              </Tooltip>
            ))}
            <Divider orientation="vertical" flexItem sx={{ mx: 1, height: 28 }} />
            <Tooltip title="Undo"><IconButton size="small" onClick={() => tiptapEditor && tiptapEditor.chain().focus().undo().run()} disabled={!tiptapEditor}><Undo /></IconButton></Tooltip>
            <Tooltip title="Redo"><IconButton size="small" onClick={() => tiptapEditor && tiptapEditor.chain().focus().redo().run()} disabled={!tiptapEditor}><Redo /></IconButton></Tooltip>
            <Box sx={{ flexGrow: 1 }} />
            <Tooltip title="Toggle Fullscreen"><IconButton size="small" onClick={toggleFullscreen}>{editorState.isFullscreen ? <FullscreenExit /> : <Fullscreen />}</IconButton></Tooltip>
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
              <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
                <FormControl sx={{ minWidth: 180 }}>
                  <InputLabel id="cat-label"><Category sx={{ mr: 1 }} fontSize="small" />Category</InputLabel>
                  <Select
                    labelId="cat-label"
                    value={formData.category}
                    onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                    label="Category"
                    size="small"
                  >
                    {categoriesList.map(cat =>
                      <MenuItem key={cat} value={cat}>{cat}</MenuItem>
                    )}
                  </Select>
                </FormControl>
              </Stack>
            </Box>
            <Divider sx={{ mb: 0 }} />

            {/* Actual content editor - Tiptap */}
            {/* Tiptap Editor Content */}
            {tiptapEditor && <TiptapEditor
              content={formData.content}
              onChange={html => {
                setFormData(prev => ({ ...prev, content: html }));
                analyzeContent(html);
              }}
              fontSize={editorState.fontSize}
              fontFamily={editorState.fontFamily}
              lineHeight={editorState.lineHeight}
              editor={tiptapEditor}
            />}
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
          scrollbarWidth: 'none', // Firefox
          msOverflowStyle: 'none', // IE 10+
          '&::-webkit-scrollbar': { display: 'none' }, // Chrome/Safari/Webkit
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