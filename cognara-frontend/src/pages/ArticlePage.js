import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Container, Typography, Box, IconButton, Divider, Chip } from '@mui/material';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';
import { Helmet } from 'react-helmet';
import { Facebook, Twitter, LinkedIn, Link as LinkIcon } from '@mui/icons-material';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import ArticleComments from '../components/Article/ArticleComments';

const ArticlePage = () => {
  const { slug } = useParams();
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchArticle = async () => {
      try {
        const response = await axios.get(`/api/articles/${slug}/`);
        setArticle(response.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Article not found');
      } finally {
        setLoading(false);
      }
    };
    fetchArticle();
  }, [slug]);

  const handleShare = (platform) => {
    const url = window.location.href;
    const title = article?.title || 'Check out this article on Cognara';
    
    switch (platform) {
      case 'facebook':
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank');
        break;
      case 'twitter':
        window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`, '_blank');
        break;
      case 'linkedin':
        window.open(`https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(url)}&title=${encodeURIComponent(title)}`, '_blank');
        break;
      case 'copy':
        navigator.clipboard.writeText(url);
        break;
      default:
        break;
    }
  };

  if (loading) return <Typography>Loading...</Typography>;
  if (error) return <Typography color="error">{error}</Typography>;
  if (!article) return <Typography>Article not found</Typography>;

  return (
    <Container maxWidth="md">
      <Helmet>
        <title>{article.title} | Cognara</title>
        <meta name="description" content={article.excerpt} />
        <meta property="og:title" content={article.title} />
        <meta property="og:description" content={article.excerpt} />
        <meta property="og:type" content="article" />
        {article.featured_image && <meta property="og:image" content={article.featured_image} />}
        <meta name="twitter:card" content="summary_large_image" />
      </Helmet>
      
      <Box sx={{ my: 4 }}>
        <Typography variant="h2" component="h1" gutterBottom>
          {article.title}
        </Typography>
        
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <Typography variant="subtitle1" color="text.secondary" sx={{ mr: 2 }}>
            By {article.author_name}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {new Date(article.published_at).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ ml: 2 }}>
            {article.reading_time} min read
          </Typography>
        </Box>
        
        {article.featured_image && (
          <Box sx={{ mb: 4 }}>
            <img 
              src={article.featured_image} 
              alt={article.title} 
              style={{ width: '100%', borderRadius: '8px', maxHeight: '500px', objectFit: 'cover' }}
            />
          </Box>
        )}
        
        <Box sx={{ display: 'flex', gap: 1, mb: 3 }}>
          {article.tags.map(tag => (
            <Chip key={tag} label={tag} size="small" />
          ))}
        </Box>
        
        <Box sx={{ mb: 4 }}>
          <ReactMarkdown 
            remarkPlugins={[remarkGfm]} 
            rehypePlugins={[rehypeRaw]}
            components={{
              img: ({ node, ...props }) => (
                <img {...props} style={{ maxWidth: '100%', height: 'auto', borderRadius: '4px' }} alt="" />
              ),
              h2: ({ node, ...props }) => (
                <Typography variant="h4" component="h2" gutterBottom {...props} />
              ),
              h3: ({ node, ...props }) => (
                <Typography variant="h5" component="h3" gutterBottom {...props} />
              ),
              p: ({ node, ...props }) => (
                <Typography variant="body1" paragraph {...props} />
              ),
            }}
          >
            {article.content}
          </ReactMarkdown>
        </Box>
        
        <Divider sx={{ my: 4 }} />
        
        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mb: 4 }}>
          <Typography variant="subtitle1">Share this article:</Typography>
          <IconButton onClick={() => handleShare('facebook')} aria-label="Share on Facebook">
            <Facebook color="primary" />
          </IconButton>
          <IconButton onClick={() => handleShare('twitter')} aria-label="Share on Twitter">
            <Twitter color="primary" />
          </IconButton>
          <IconButton onClick={() => handleShare('linkedin')} aria-label="Share on LinkedIn">
            <LinkedIn color="primary" />
          </IconButton>
          <IconButton onClick={() => handleShare('copy')} aria-label="Copy link">
            <LinkIcon color="primary" />
          </IconButton>
        </Box>
        
        <ArticleComments articleId={article.id} />
      </Box>
    </Container>
  );
};

export default ArticlePage;