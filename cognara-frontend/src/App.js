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
    mode: 'dark',  // Enables dark mode in MUI
    primary: {
      main: '#82AFFF',         // Soft electric blue (calls-to-action, links)
      light: '#A6C8FF',        // Lighter blue for hover states
      dark: '#3E64FF',         // Deep blue for focus or contrast
      contrastText: '#ffffff'
    },
    secondary: {
      main: '#F2A365',         // Warm peach-orange accent
    },
    background: {
      default: '#0F1117',      // Main background (very dark slate)
      paper: '#1C1E26',        // Slightly lighter panel (cards, modals)
    },
    text: {
      primary: '#E6E8F0',      // Light gray-white text for high readability
      secondary: '#A0A3B1'     // Muted gray for secondary text
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
          '&::-webkit-scrollbar': {  /* Chrome, Safari, Opera */
            display: 'none'
          },
          '-ms-overflow-style': 'none'  /* IE/Edge */
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
                <Route path="/" element={<Layout showHero={true}><HomePage/></Layout>} />
                <Route path="/article/:slug" element={<ArticlePage />} />
                <Route path="/submit-article" element={<SubmitArticlePage />} />
                <Route path="/admin" element={<AdminDashboard />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/about" element={<Layout showHero={false}><AboutPage /></Layout>} />
                <Route path="/contact" element={<ContactPage />} />
                <Route path="*" element={<NotFoundPage />} />
              </Routes>
          </Box>
        </Router>
      </ThemeProvider>
    </StyledEngineProvider>
  );
}

export default App;