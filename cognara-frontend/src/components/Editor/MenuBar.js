import React from 'react';
import {
  Box,
  ButtonGroup,
  Button,
  Divider,
  IconButton,
  Menu,
  MenuItem,
  Popover,
  TextField,
  Typography,
} from '@mui/material';
import {
  FormatBold,
  FormatItalic,
  FormatUnderlined,
  FormatStrikethrough,
  FormatAlignLeft,
  FormatAlignCenter,
  FormatAlignRight,
  FormatAlignJustify,
  FormatListBulleted,
  FormatListNumbered,
  FormatQuote,
  Code,
  Link,
  Image,
  Subscript,
  Superscript,
  Title,
  FormatClear,
} from '@mui/icons-material';

const MenuBar = ({ editor, onImageUpload }) => {
  const [anchorEl, setAnchorEl] = React.useState(null);
  const [linkPopover, setLinkPopover] = React.useState(null);
  const [linkUrl, setLinkUrl] = React.useState('');

  // Early return must come AFTER all hooks
  if (!editor) {
    return null;
  }

  const handleHeadingClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleHeadingClose = () => {
    setAnchorEl(null);
  };

  const handleLinkClick = (event) => {
    setLinkPopover(event.currentTarget);
    const previousUrl = editor.getAttributes('link').href;
    setLinkUrl(previousUrl || '');
  };

  const handleLinkClose = () => {
    setLinkPopover(null);
    setLinkUrl('');
  };

  const setLink = () => {
    if (linkUrl) {
      editor.chain().focus().setLink({ href: linkUrl }).run();
    } else {
      editor.chain().focus().unsetLink().run();
    }
    handleLinkClose();
  };

  const addImage = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';

    input.onchange = async () => {
      const file = input.files[0];
      if (!file) return;

      try {
        const imageUrl = await onImageUpload(file);
        editor.chain().focus().setImage({ src: imageUrl }).run();
      } catch (error) {
        console.error('Error uploading image:', error);
      }
    };

    input.click();
  };

  return (
    <Box
      sx={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        gap: 0.5,
        p: 1,
        borderBottom: '1px solid',
        borderColor: 'divider',
        backgroundColor: 'background.paper',
      }}
    >
      {/* Rest of your component remains the same */}
      <ButtonGroup size="small" variant="text">
        <IconButton
          onClick={handleHeadingClick}
          color={editor.isActive('heading') ? 'primary' : 'default'}
        >
          <Title />
        </IconButton>
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleHeadingClose}
        >
          <MenuItem
            onClick={() => {
              editor.chain().focus().toggleHeading({ level: 1 }).run();
              handleHeadingClose();
            }}
            selected={editor.isActive('heading', { level: 1 })}
          >
            <Typography variant="h1" component="span" sx={{ mr: 1 }}>H1</Typography> Heading 1
          </MenuItem>
          <MenuItem
            onClick={() => {
              editor.chain().focus().toggleHeading({ level: 2 }).run();
              handleHeadingClose();
            }}
            selected={editor.isActive('heading', { level: 2 })}
          >
            <Typography variant="h2" component="span" sx={{ mr: 1 }}>H2</Typography> Heading 2
          </MenuItem>
          <MenuItem
            onClick={() => {
              editor.chain().focus().toggleHeading({ level: 3 }).run();
              handleHeadingClose();
            }}
            selected={editor.isActive('heading', { level: 3 })}
          >
            <Typography variant="h3" component="span" sx={{ mr: 1 }}>H3</Typography> Heading 3
          </MenuItem>
          <MenuItem
            onClick={() => {
              editor.chain().focus().toggleHeading({ level: 4 }).run();
              handleHeadingClose();
            }}
            selected={editor.isActive('heading', { level: 4 })}
          >
            <Typography variant="h4" component="span" sx={{ mr: 1 }}>H4</Typography> Heading 4
          </MenuItem>
          <MenuItem
            onClick={() => {
              editor.chain().focus().toggleHeading({ level: 5 }).run();
              handleHeadingClose();
            }}
            selected={editor.isActive('heading', { level: 5 })}
          >
            <Typography variant="h5" component="span" sx={{ mr: 1 }}>H5</Typography> Heading 5
          </MenuItem>
          <MenuItem
            onClick={() => {
              editor.chain().focus().toggleHeading({ level: 6 }).run();
              handleHeadingClose();
            }}
            selected={editor.isActive('heading', { level: 6 })}
          >
            <Typography variant="h6" component="span" sx={{ mr: 1 }}>H6</Typography> Heading 6
          </MenuItem>
          <Divider />
          <MenuItem
            onClick={() => {
              editor.chain().focus().setParagraph().run();
              handleHeadingClose();
            }}
            selected={editor.isActive('paragraph')}
          >
            Normal Text
          </MenuItem>
        </Menu>

        <IconButton
          onClick={() => editor.chain().focus().toggleBold().run()}
          color={editor.isActive('bold') ? 'primary' : 'default'}
        >
          <FormatBold />
        </IconButton>
        <IconButton
          onClick={() => editor.chain().focus().toggleItalic().run()}
          color={editor.isActive('italic') ? 'primary' : 'default'}
        >
          <FormatItalic />
        </IconButton>
        <IconButton
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          color={editor.isActive('underline') ? 'primary' : 'default'}
        >
          <FormatUnderlined />
        </IconButton>
        <IconButton
          onClick={() => editor.chain().focus().toggleStrike().run()}
          color={editor.isActive('strike') ? 'primary' : 'default'}
        >
          <FormatStrikethrough />
        </IconButton>
      </ButtonGroup>

      <Divider orientation="vertical" flexItem />

      <ButtonGroup size="small" variant="text">
        <IconButton
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          color={editor.isActive('bulletList') ? 'primary' : 'default'}
        >
          <FormatListBulleted />
        </IconButton>
        <IconButton
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          color={editor.isActive('orderedList') ? 'primary' : 'default'}
        >
          <FormatListNumbered />
        </IconButton>
      </ButtonGroup>

      <Divider orientation="vertical" flexItem />

      <ButtonGroup size="small" variant="text">
        <IconButton
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          color={editor.isActive('blockquote') ? 'primary' : 'default'}
        >
          <FormatQuote />
        </IconButton>
        <IconButton
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          color={editor.isActive('codeBlock') ? 'primary' : 'default'}
        >
          <Code />
        </IconButton>
      </ButtonGroup>

      <Divider orientation="vertical" flexItem />

      <ButtonGroup size="small" variant="text">
        <IconButton
          onClick={() => editor.chain().focus().setTextAlign('left').run()}
          color={editor.isActive({ textAlign: 'left' }) ? 'primary' : 'default'}
        >
          <FormatAlignLeft />
        </IconButton>
        <IconButton
          onClick={() => editor.chain().focus().setTextAlign('center').run()}
          color={editor.isActive({ textAlign: 'center' }) ? 'primary' : 'default'}
        >
          <FormatAlignCenter />
        </IconButton>
        <IconButton
          onClick={() => editor.chain().focus().setTextAlign('right').run()}
          color={editor.isActive({ textAlign: 'right' }) ? 'primary' : 'default'}
        >
          <FormatAlignRight />
        </IconButton>
        <IconButton
          onClick={() => editor.chain().focus().setTextAlign('justify').run()}
          color={editor.isActive({ textAlign: 'justify' }) ? 'primary' : 'default'}
        >
          <FormatAlignJustify />
        </IconButton>
      </ButtonGroup>

      <Divider orientation="vertical" flexItem />

      <ButtonGroup size="small" variant="text">
        <IconButton
          onClick={() => editor.chain().focus().toggleSubscript().run()}
          color={editor.isActive('subscript') ? 'primary' : 'default'}
        >
          <Subscript />
        </IconButton>
        <IconButton
          onClick={() => editor.chain().focus().toggleSuperscript().run()}
          color={editor.isActive('superscript') ? 'primary' : 'default'}
        >
          <Superscript />
        </IconButton>
      </ButtonGroup>

      <Divider orientation="vertical" flexItem />

      <ButtonGroup size="small" variant="text">
        <IconButton
          onClick={handleLinkClick}
          color={editor.isActive('link') ? 'primary' : 'default'}
        >
          <Link />
        </IconButton>
        <Popover
          open={Boolean(linkPopover)}
          anchorEl={linkPopover}
          onClose={handleLinkClose}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'center',
          }}
          transformOrigin={{
            vertical: 'top',
            horizontal: 'center',
          }}
        >
          <Box sx={{ p: 2, minWidth: 300 }}>
            <TextField
              autoFocus
              fullWidth
              size="small"
              label="URL"
              value={linkUrl}
              onChange={(e) => setLinkUrl(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && setLink()}
            />
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1 }}>
              <Button size="small" onClick={handleLinkClose}>
                Cancel
              </Button>
              <Button size="small" onClick={setLink} color="primary">
                Apply
              </Button>
            </Box>
          </Box>
        </Popover>

        <IconButton onClick={addImage}>
          <Image />
        </IconButton>
      </ButtonGroup>

      <Divider orientation="vertical" flexItem />

      <ButtonGroup size="small" variant="text">
        <IconButton
          onClick={() => editor.chain().focus().unsetAllMarks().run()}
          title="Clear formatting"
        >
          <FormatClear />
        </IconButton>
      </ButtonGroup>
    </Box>
  );
};

export default MenuBar;