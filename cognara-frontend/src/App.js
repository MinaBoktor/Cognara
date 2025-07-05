

import React, { useEffect } from 'react';
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
import { AuthProvider } from './context/AuthContext';
import { fetchCSRFToken } from './services/api';


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

  useEffect(() => {
      fetchCSRFToken();
    }, []);


  return (
    <StyledEngineProvider injectFirst>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <React.StrictMode>
          <AuthProvider>
            <Router>
              <ScrollTop />
              <Box sx={{ 
                position: 'relative',
                backgroundColor: 'background.default',
                minHeight: '100vh'
              }}>
                  <Routes>
                    <Route path="/" element={<GuestOnlyRoute><Layout showHero={true}><HomePage/></Layout></GuestOnlyRoute>} />
                    <Route path="/article/:id" element={<ArticlePage />} />
                    <Route path="/admin" element={<AdminDashboard />} />
                    <Route path="/login" element={<GuestOnlyRoute><Layout showHero={false} showHeader={true} showNewsletter={false}><LoginPage /></Layout></GuestOnlyRoute>} />
                    <Route path="/about" element={<Layout showHero={false}><AboutPage /></Layout>} />
                    <Route path="/contact" element={<Layout showHero={false} showHeader={true} showNewsletter={false}><ContactPage /></Layout>} />
                    <Route path="/newsletter" element={<GuestOnlyRoute><Layout showHero={false} showHeader={true} showNewsletter={false}><Newsletterpage /></Layout></GuestOnlyRoute>} />


                    <Route path="/signup" element={<GuestOnlyRoute><Layout showHero={false} showHeader={true} showNewsletter={false}><SignUpPage /></Layout></GuestOnlyRoute>} />
                    <Route path="/submit" element={<ProtectedRoute><Layout showHero={false} showHeader={true} showNewsletter={false}><SubmitArticlePage /></Layout></ProtectedRoute>} />

                    <Route path="/privacy" element={<NotFoundPage />} /> 
                    <Route path="/terms" element={<NotFoundPage />} />
                    <Route path="/confirm-email" element={<ConfirmEmail />} />
                    <Route path="/forgot-password" element={<GuestOnlyRoute><ForgetPassword /></GuestOnlyRoute>} />

                    <Route path="*" element={<Layout showHero={false} showHeader={true} showNewsletter={false}><NotFoundPage /></Layout>} />
                  </Routes>
              </Box>
            </Router>
          </AuthProvider>
        </React.StrictMode>
      </ThemeProvider>
    </StyledEngineProvider>
  );
}

export default App;