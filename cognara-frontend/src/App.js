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
import NotFoundPage from './pages/NotFoundPage';
import AboutPage from './pages/AboutPage';
import ContactPage from './pages/ContactPage';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1A1A2E',
    },
    secondary: {
      main: '#53354A',
    },
    error: {
      main: '#E94560',
    },
    background: {
      default: '#F5F5F5',
    },
  },
  typography: {
    fontFamily: '"Inter", "Helvetica", "Arial", sans-serif',
    h1: {
      fontFamily: '"Playfair Display", serif',
      fontWeight: 700,
    },
    h2: {
      fontFamily: '"Playfair Display", serif',
      fontWeight: 600,
    },
    h3: {
      fontFamily: '"Playfair Display", serif',
      fontWeight: 500,
    },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          overflowX: 'hidden',
        },
      },
    },
  },
});

function App() {
  return (
    <StyledEngineProvider injectFirst>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Router>
          <Box sx={{ position: 'relative' }}>
            <Layout>
              <Routes>
                <Route path="/" element={<HomePage showHero={true} />} />
                <Route path="/article/:slug" element={<ArticlePage />} />
                <Route path="/submit-article" element={<SubmitArticlePage />} />
                <Route path="/admin" element={<AdminDashboard />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/about" element={<AboutPage />} />
                <Route path="/contact" element={<ContactPage />} />
                <Route path="*" element={<NotFoundPage />} />
              </Routes>
            </Layout>
          </Box>
        </Router>
      </ThemeProvider>
    </StyledEngineProvider>
  );
}

export default App;