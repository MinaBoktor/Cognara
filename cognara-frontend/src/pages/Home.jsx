import { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet';

export default function Home() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get('http://localhost:8000/api/articles/?approved=true')
      .then(res => {
        setArticles(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  return (
    <>
      <Helmet>
        <title>Cognara - Home</title>
        <meta name="description" content="Cognara blog with insightful articles" />
      </Helmet>

      <section className="hero relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-900/80 to-indigo-900/80"></div>
        <div className="container relative z-10 py-24 text-center">
          <h1 className="text-5xl font-bold text-white mb-6 animate-fadeIn">
            Share Your <span className="text-amber-300">Knowledge</span>
          </h1>
          <p className="text-xl text-purple-100 max-w-2xl mx-auto mb-8">
            Join our community of thinkers and creators. Publish your insights and discover amazing content.
          </p>
          <div className="flex justify-center gap-4">
            <Link 
              to="/submit" 
              className="btn-primary flex items-center gap-2 hover:-translate-y-1 transition-transform"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
              </svg>
              Write Article
            </Link>
            <Link 
              to="#featured" 
              className="btn-outline text-white border-white hover:bg-white/10 transition-colors"
            >
              Explore
            </Link>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-white to-transparent"></div>
      </section>

      <div className="container">
        {loading ? (
          <div className="text-center py-8">Loading articles...</div>
        ) : articles.length === 0 ? (
          <div className="text-center py-8">
            <h2 className="text-xl font-semibold">No articles published yet</h2>
            <p className="text-gray-500 mt-2">Be the first to submit an article!</p>
          </div>
        ) : (
          <>
            <h2 className="text-2xl font-bold mb-6">Latest Articles</h2>
            <div className="article-grid">
              {articles.map(article => (
                <Link to={`/article/${article.slug}`} key={article.id} className="card">
                  <div className="card-content">
                    <h3 className="card-title">{article.title}</h3>
                    <p className="card-text">
                      {article.content.substring(0, 100)}...
                    </p>
                    <div className="card-meta">
                      <span>Published: {new Date(article.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </>
        )}
      </div>
    </>
  );
}