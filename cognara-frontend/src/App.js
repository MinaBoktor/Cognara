// src/App.js (Updated)

import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { StyledEngineProvider } from '@mui/material/styles';
import { Box } from '@mui/material';

import Layout from './components/Layout/Layout';
import HomePage from './pages/HomePage';
import ArticlePage from './pages/ArticlePage';
import SubmitArticlePage from './pages/SubmitArticlePage';
import AdminDashboard from './pages/AdminDashboard';
import LoginPage from './pages/LoginPage';
import SignUpPage from './pages/SignUpPage'; // <-- Import
import NotFoundPage from './pages/NotFoundPage';
import AboutPage from './pages/AboutPage';
import ContactPage from './pages/ContactPage';
import NewsletterSignup from './components/Newsletter/NewsletterSignup';


const theme = createTheme({
  // ... your existing theme object
  palette: {
    mode: 'dark',
    primary: {
      main: '#82AFFF',
      light: '#A6C8FF',
      dark: '#3E64FF',
      contrastText: '#ffffff'
    },
    secondary: {
      main: '#F2A365',
    },
    background: {
      default: '#0F1117',
      paper: '#1C1E26',
    },
    text: {
      primary: '#E6E8F0',
      secondary: '#A0A3B1'
    }
  },
  typography: {
    fontFamily: '"Inter", "Segoe UI", "Roboto", sans-serif',
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          scrollbarWidth: 'none',  /* Firefox */
          '&::-webkit-scrollbar': {
            display: 'none'
          },
          '-ms-overflow-style': 'none'
        }
      }
    }
  }
});



function App() {
  return (
    <StyledEngineProvider injectFirst>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Router>
          <Box sx={{ 
            position: 'relative',
            backgroundColor: 'background.default',
            minHeight: '100vh'
          }}>
              <Routes>
                {/* Your existing routes are great. Add the new ones below. */}
                <Route path="/" element={<Layout showHero={true}><HomePage/></Layout>} />
                <Route path="/article/:slug" element={<ArticlePage />} />
                <Route path="/submit-article" element={<SubmitArticlePage />} />
                <Route path="/admin" element={<AdminDashboard />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/about" element={<Layout showHero={false}><AboutPage /></Layout>} />
                <Route path="/contact" element={<ContactPage />} />
                <Route path="/newsletter" element={<Layout showHero={false}><NewsletterSignup /></Layout>} />


                <Route path="/signup" element={<SignUpPage />} />
                <Route path="/submit" element={<SubmitArticlePage />} />

                <Route path="/privacy" element={<NotFoundPage />} /> 
                <Route path="/terms" element={<NotFoundPage />} />

                <Route path="*" element={<NotFoundPage />} />
              </Routes>
          </Box>
        </Router>
      </ThemeProvider>
    </StyledEngineProvider>
  );
}

export default App;