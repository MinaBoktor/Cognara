import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { Helmet } from 'react-helmet';
import { FiArrowLeft, FiCalendar, FiUser, FiClock } from 'react-icons/fi';

export default function Article() {
  const { slug } = useParams();
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [relatedArticles, setRelatedArticles] = useState([]);

  useEffect(() => {
    const fetchArticle = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`http://localhost:8000/api/articles/${slug}/`);
        setArticle(response.data);
        
        // Fetch related articles
        const relatedResponse = await axios.get(
          `http://localhost:8000/api/articles/?category=${response.data.category}&exclude=${response.data.id}`
        );
        setRelatedArticles(relatedResponse.data.slice(0, 3));
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load article');
      } finally {
        setLoading(false);
      }
    };

    fetchArticle();
  }, [slug]);

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const readingTime = (text) => {
    const wordsPerMinute = 200;
    const wordCount = text.split(/\s+/).length;
    return Math.ceil(wordCount / wordsPerMinute);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-pulse text-center">
          <div className="h-8 w-3/4 bg-gray-200 rounded mx-auto mb-4"></div>
          <div className="h-4 w-1/2 bg-gray-200 rounded mx-auto mb-8"></div>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-4 bg-gray-200 rounded w-full"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="max-w-md mx-auto bg-red-50 border border-red-200 rounded-xl p-6">
          <h2 className="text-xl font-bold text-red-600 mb-2">Error Loading Article</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <Link 
            to="/" 
            className="inline-flex items-center text-purple-600 hover:text-purple-800 font-medium"
          >
            <FiArrowLeft className="mr-2" />
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  if (!article) {
    return null;
  }

  return (
    <>
      <Helmet>
        <title>{article.title} | Cognara</title>
        <meta name="description" content={article.content.substring(0, 160)} />
      </Helmet>

      <article className="max-w-4xl mx-auto px-4 py-12">
        {/* Article Header */}
        <header className="mb-12 text-center">
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-purple-100 text-purple-800 text-sm font-medium mb-6">
            {article.category || 'General'}
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 leading-tight">
            {article.title}
          </h1>
          
          <div className="flex flex-wrap justify-center items-center gap-4 text-gray-600 mb-8">
            <div className="flex items-center">
              <FiUser className="mr-2 text-purple-500" />
              <span>{article.author_email}</span>
            </div>
            <div className="flex items-center">
              <FiCalendar className="mr-2 text-purple-500" />
              <span>{formatDate(article.created_at)}</span>
            </div>
            <div className="flex items-center">
              <FiClock className="mr-2 text-purple-500" />
              <span>{readingTime(article.content)} min read</span>
            </div>
          </div>
          
          {article.featured_image && (
            <div className="rounded-xl overflow-hidden shadow-lg mb-8">
              <img 
                src={article.featured_image} 
                alt={article.title} 
                className="w-full h-auto object-cover"
              />
            </div>
          )}
        </header>

        {/* Article Content */}
        <div className="prose prose-lg max-w-none mx-auto">
          <div dangerouslySetInnerHTML={{ __html: article.content }} />
        </div>

        {/* Related Articles */}
        {relatedArticles.length > 0 && (
          <div className="mt-16">
            <h2 className="text-2xl font-bold text-gray-900 mb-8">You might also like</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {relatedArticles.map(related => (
                <Link 
                  to={`/article/${related.slug}`} 
                  key={related.id}
                  className="group bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow"
                >
                  <div className="p-6">
                    <h3 className="text-xl font-semibold text-gray-900 group-hover:text-purple-600 transition-colors mb-2">
                      {related.title}
                    </h3>
                    <p className="text-gray-600 text-sm mb-3">
                      {related.content.substring(0, 100)}...
                    </p>
                    <div className="flex items-center text-sm text-gray-500">
                      <FiCalendar className="mr-1.5" />
                      <span>{formatDate(related.created_at)}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Back to Home Link */}
        <div className="mt-12 text-center">
          <Link 
            to="/" 
            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 transition-colors shadow-sm"
          >
            <FiArrowLeft className="mr-2" />
            Back to all articles
          </Link>
        </div>
      </article>
    </>
  );
}