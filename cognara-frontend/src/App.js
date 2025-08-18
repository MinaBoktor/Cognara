import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { StyledEngineProvider } from '@mui/material/styles';
import { Box } from '@mui/material';

import Layout from './components/Layout/Layout';
import ScrollTop from './components/ScrollTop';
import ProtectedRoute from './components/ProtectedRoute';
import GuestOnlyRoute from './components/GuestOnlyRoute';
import HomePage from './pages/HomePage';
import ForgetPassword from './pages/ForgetPassword';
import ConfirmEmail from './pages/ConfirmEmail';
import ArticlePage from './pages/ArticlePage';
import SubmitArticlePage from './pages/SubmitArticlePage';
import AdminDashboard from './pages/AdminDashboard';
import LoginPage from './pages/LoginPage';
import SignUpPage from './pages/SignUpPage'; // <-- Import
import NotFoundPage from './pages/NotFoundPage';
import AboutPage from './pages/AboutPage';
import ContactPage from './pages/ContactPage';
import Newsletterpage from './pages/Newsletterpage';
import WritingsPage from './pages/WritingsPage';
import Dashboard from './pages/Dashboard';
import { AuthProvider } from './context/AuthContext';
import { fetchCSRFToken } from './services/api';

function App() {
  // Dark mode state management
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const savedMode = localStorage.getItem('darkMode')
    return savedMode ? JSON.parse(savedMode) : false
  })

  // Persist dark mode preference
  useEffect(() => {
    localStorage.setItem('darkMode', JSON.stringify(isDarkMode))
  }, [isDarkMode])

  // Create theme based on dark mode state
  const theme = createTheme({
    palette: {
      mode: isDarkMode ? 'dark' : 'light',
      // --- UNCHANGED ORIGINAL PALETTE ---
      primary: {
        main: isDarkMode ? '#90caf9' : '#1976d2'
      },
      secondary: {
        main: isDarkMode ? '#f48fb1' : '#dc004e'
      },
      background: {
        default: isDarkMode ? '#121212' : '#f5f5f5',
        paper: isDarkMode ? '#1e1e1e' : '#ffffff'
      },
      text: {
        primary: isDarkMode ? '#ffffff' : '#000000',
        secondary: isDarkMode ? '#bbbbbb' : '#555555'
      },
      // --- NEW CUSTOM COLORS FOR HEADER ---
      custom: {
        header: {
          background: isDarkMode ? 'rgba(18, 18, 18, 0.8)' : 'rgba(255, 255, 255, 0.8)',
          text: isDarkMode ? '#EAEAEA' : '#2C3E50',
          logoGradient: isDarkMode 
            ? 'linear-gradient(45deg, #FFA726, #F06292)' // Warm Orange to Pink for Dark Mode
            : 'linear-gradient(45deg, #00796B, #42A5F5)', // Teal to Blue for Light Mode
          button: {
            background: isDarkMode ? '#FFA726' : '#00796B',
            text: '#FFFFFF',
            hoverBackground: isDarkMode ? '#F57C00' : '#00695C'
          }
        }
      }
    },
    typography: {
      fontFamily: 'Roboto, sans-serif',
      h4: {
        fontWeight: 700,
        marginBottom: '1rem'
      },
      h6: {
        fontWeight: 600,
        marginBottom: '0.5rem'
      },
      body1: {
        lineHeight: 1.8
      }
    },
    components: {
      MuiLink: {
        defaultProps: {
          // component: RouterLink // Use React Router Link for all MUI Links
        }
      },
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: '8px' // Custom border radius for buttons
          }
        }
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            boxShadow: isDarkMode
              ? '0px 0px 15px rgba(255, 255, 255, 0.1)'
              : '0px 0px 15px rgba(0,0,0,0.1)'
          }
        }
      }
      }
  });

  useEffect(() => {
    fetchCSRFToken();
  }, []);

  return (
    <StyledEngineProvider injectFirst>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Router>
          <ScrollTop />
          <AuthProvider>
            <Routes>
              <Route path="/" element={<GuestOnlyRoute><Layout showHero={true} showHeader={true} showNewsletter={true} isDarkMode={isDarkMode} setIsDarkMode={setIsDarkMode}><HomePage isDarkMode={isDarkMode} setIsDarkMode={setIsDarkMode} /></Layout></GuestOnlyRoute>} />
              <Route path="/login" element={<GuestOnlyRoute> <Layout showHero={false} showHeader={true} showNewsletter={false} isDarkMode={isDarkMode} setIsDarkMode={setIsDarkMode}><LoginPage isDarkMode={isDarkMode} setIsDarkMode={setIsDarkMode} /></Layout> </GuestOnlyRoute>} />
              <Route path="/signup" element={<GuestOnlyRoute> <Layout isDarkMode={isDarkMode} setIsDarkMode={setIsDarkMode}><SignUpPage isDarkMode={isDarkMode} setIsDarkMode={setIsDarkMode} /></Layout> </GuestOnlyRoute>} />
              <Route path="/forgot-password" element={<GuestOnlyRoute> <ForgetPassword isDarkMode={isDarkMode} setIsDarkMode={setIsDarkMode} /> </GuestOnlyRoute>} />
              <Route path="/confirm-email" element={<GuestOnlyRoute> <ConfirmEmail isDarkMode={isDarkMode} setIsDarkMode={setIsDarkMode} /> </GuestOnlyRoute>} />
              <Route path="/article/:id" element={<Layout showNewsletter={false} isDarkMode={isDarkMode} setIsDarkMode={setIsDarkMode} ><ArticlePage isDarkMode={isDarkMode} setIsDarkMode={setIsDarkMode} /></Layout>} />
              <Route path="/write" element={<ProtectedRoute> <WritingsPage isDarkMode={isDarkMode} setIsDarkMode={setIsDarkMode} /></ProtectedRoute>} />
              <Route path="/submit" element={<ProtectedRoute> <SubmitArticlePage isDarkMode={isDarkMode} setIsDarkMode={setIsDarkMode} /></ProtectedRoute>} />
              <Route path="/admin" element={<ProtectedRoute adminOnly> <AdminDashboard isDarkMode={isDarkMode} setIsDarkMode={setIsDarkMode} /> </ProtectedRoute>} />
              <Route path="/about" element={<Layout showNewsletter={false} isDarkMode={isDarkMode} setIsDarkMode={setIsDarkMode}> <AboutPage isDarkMode={isDarkMode} setIsDarkMode={setIsDarkMode} /> </Layout>} />
              <Route path="/contact" element={<Layout showNewsletter={false} isDarkMode={isDarkMode} setIsDarkMode={setIsDarkMode}> <ContactPage isDarkMode={isDarkMode} setIsDarkMode={setIsDarkMode} /> </Layout>} />
              <Route path="/newsletter" element={<GuestOnlyRoute><Layout showNewsletter={false} isDarkMode={isDarkMode} setIsDarkMode={setIsDarkMode}><Newsletterpage isDarkMode={isDarkMode} setIsDarkMode={setIsDarkMode} /></Layout></GuestOnlyRoute>} />
              <Route path="/dashboard" element={<ProtectedRoute><Layout isDarkMode={isDarkMode} setIsDarkMode={setIsDarkMode}> <Dashboard isDarkMode={isDarkMode} setIsDarkMode={setIsDarkMode} /></Layout> </ProtectedRoute>} />
              <Route path="*" element={<Layout isDarkMode={isDarkMode} setIsDarkMode={setIsDarkMode}><NotFoundPage isDarkMode={isDarkMode} setIsDarkMode={setIsDarkMode} /></Layout>} />
            </Routes>
          </AuthProvider>
        </Router>
      </ThemeProvider>
    </StyledEngineProvider>
  );
}

export default App;