import React, { useEffect } from 'react';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { Box } from '@mui/material';

const TiptapEditor = ({ content, onChange, fontSize, fontFamily, lineHeight }) => {
  const editor = useEditor({
    extensions: [StarterKit],
    content: content || '',
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        style: `min-height:300px;outline:none;font-size:${fontSize}px;font-family:${fontFamily};line-height:${lineHeight};text-align:left;`,
        spellCheck: 'true',
        dir: 'ltr',
      },
    },
  });

  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content || '', false);
    }
    // eslint-disable-next-line
  }, [content]);

  return (
    <Box sx={{ flex: 1, px: 4, py: 2, bgcolor: 'background.default' }}>
      <EditorContent editor={editor} />
    </Box>
  );
};

export default TiptapEditor;
