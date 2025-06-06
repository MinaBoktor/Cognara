import React from 'react';
import { TextField, InputAdornment } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';

const SearchBar = () => {
  return (
    <TextField
      variant="outlined"
      size="small"
      placeholder="Search..."
      InputProps={{
        startAdornment: (
          <InputAdornment position="start">
            <SearchIcon />
          </InputAdornment>
        ),
      }}
      sx={{ 
        mx: 2,
        '& .MuiOutlinedInput-root': {
          borderRadius: 4,
          backgroundColor: 'background.paper',
        }
      }}
    />
  );
};

export default SearchBar;