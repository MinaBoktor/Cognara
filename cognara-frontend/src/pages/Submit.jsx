import axios from 'axios';
import { useState } from 'react';

export default function Submit() {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await axios.post('http://localhost:8000/api/articles/', {
        title,
        content,
        author_email: email,
      });
      alert('Article submitted for review. Thank you!');
      setTitle('');
      setContent('');
      setEmail('');
    } catch (err) {
      alert('Submission failed: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container">
      <div className="form-container">
        <h2 className="form-title">Submit Your Article</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="title" className="form-label">Article Title</label>
            <input
              type="text"
              id="title"
              className="form-input"
              placeholder="Enter your article title"
              value={title}
              onChange={e => setTitle(e.target.value)}
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="content" className="form-label">Article Content</label>
            <textarea
              id="content"
              className="form-input form-textarea"
              placeholder="Write your article content here..."
              value={content}
              onChange={e => setContent(e.target.value)}
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="email" className="form-label">Your Email</label>
            <input
              type="email"
              id="email"
              className="form-input"
              placeholder="your@email.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
          </div>
          
          <button 
            type="submit" 
            className="btn btn-primary w-full"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Submitting...' : 'Submit Article'}
          </button>
        </form>
      </div>
    </div>
  );
}