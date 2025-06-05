import axios from 'axios';
import { useEffect, useState } from 'react';

export default function Admin() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUnapproved();
  }, []);

  const fetchUnapproved = () => {
    setLoading(true);
    axios.get('http://localhost:8000/api/articles/?approved=false')
      .then(res => {
        setArticles(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  };

  const approveArticle = (id) => {
    if (window.confirm('Are you sure you want to approve this article?')) {
      axios.post(`http://localhost:8000/api/articles/${id}/approve/`)
        .then(() => {
          alert('Article approved and subscribers notified!');
          fetchUnapproved();
        })
        .catch(err => alert('Error approving article: ' + err.message));
    }
  };

  return (
    <div className="py-8">
      <h1 className="mb-8">Admin Panel - Approve Articles</h1>
      
      {loading ? (
        <div className="text-center">Loading articles...</div>
      ) : articles.length === 0 ? (
        <div className="text-center">No articles to approve.</div>
      ) : (
        <div className="space-y-4">
          {articles.map(article => (
            <div key={article.id} className="card">
              <div className="flex justify-between items-start">
                <div>
                  <h3>{article.title}</h3>
                  <p className="text-sm text-gray-500 mt-1">
                    Submitted by: {article.author_email}
                  </p>
                </div>
                <button 
                  onClick={() => approveArticle(article.id)}
                  className="btn btn-primary"
                >
                  Approve
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}