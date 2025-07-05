import React from 'react';
import { CircularProgress, Box, useTheme } from '@mui/material';

const GradientSpinner = ({ size = 32 }) => {
  const theme = useTheme();

  return (
    <Box
      sx={{
        position: 'relative',
        display: 'inline-flex',
        width: size,
        height: size,
      }}
    >
      {/* Transparent base spinner to provide structure */}
      <CircularProgress
        variant="indeterminate"
        size={size}
        thickness={5}
        sx={{ color: 'transparent' }}
      />

      {/* Animated rotating gradient mask */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: size,
          height: size,
          borderRadius: '50%',
          background: `conic-gradient(${theme.palette.primary.main}, ${theme.palette.secondary.main}, ${theme.palette.primary.main})`,
          mask: `radial-gradient(closest-side, transparent 74%, black 75%)`,
          WebkitMask: `radial-gradient(closest-side, transparent 74%, black 75%)`,
          animation: 'spin 1s linear infinite',
          '@keyframes spin': {
            from: { transform: 'rotate(0deg)' },
            to: { transform: 'rotate(360deg)' },
          },
        }}
      />
    </Box>
  );
};

export default GradientSpinner;
