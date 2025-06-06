import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import { Typography, Box } from '@mui/material';

const ArticlePreview = ({ article }) => {
  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        {article.title}
      </Typography>
      <Typography variant="subtitle1" color="text.secondary" gutterBottom>
        By {article.author_name} • {new Date(article.created_at).toLocaleDateString()}
      </Typography>
      
      <ReactMarkdown 
        remarkPlugins={[remarkGfm]} 
        rehypePlugins={[rehypeRaw]}
        components={{
          img: ({ node, ...props }) => (
            <img {...props} style={{ maxWidth: '100%', height: 'auto', borderRadius: '4px' }} alt="" />
          ),
          h2: ({ node, ...props }) => (
            <Typography variant="h5" component="h2" gutterBottom {...props} />
          ),
          h3: ({ node, ...props }) => (
            <Typography variant="h6" component="h3" gutterBottom {...props} />
          ),
          p: ({ node, ...props }) => (
            <Typography variant="body1" paragraph {...props} />
          ),
        }}
      >
        {article.content}
      </ReactMarkdown>
    </Box>
  );
};

export default ArticlePreview;