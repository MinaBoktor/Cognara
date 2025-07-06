// src/components/GuestOnlyRoute.js
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import GradientSpinner from './GradientSpinner';
import { Box } from '@mui/material';

const GuestOnlyRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <Box
        sx={{
          height: '100vh',
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'background.default',
        }}
      >
        <GradientSpinner size={60} />
      </Box>
    );
  }

  return user ? <Navigate to="/dashboard" replace /> : children;
};

export default GuestOnlyRoute;
