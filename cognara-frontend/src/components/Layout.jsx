import { Link } from 'react-router-dom';

export default function Layout({ children }) {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="header">
        <div className="container">
          <nav className="navbar">
            <Link to="/" className="logo">
              <span className="logo-icon"></span>
              Cognara
            </Link>
            <div className="nav-links">
              <Link to="/" className="nav-link">Home</Link>
              <Link to="/submit" className="nav-link">Submit Article</Link>
              <Link to="/admin" className="nav-link">Admin</Link>
            </div>
          </nav>
        </div>
      </header>

      <main className="flex-grow">
        {children}
      </main>

      <footer className="footer">
        <div className="container footer-content">
          <p>© {new Date().getFullYear()} Cognara. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}