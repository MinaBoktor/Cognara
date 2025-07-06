import React, { useState, useEffect } from 'react';
import { 
  AppBar, 
  Toolbar, 
  Typography, 
  Button, 
  Box, 
  Container,
  IconButton,
  Menu,
  MenuItem,
  useMediaQuery,
  useTheme,
  Avatar,
  Divider,
  Badge,
  ListItemIcon
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import SettingsIcon from '@mui/icons-material/Settings';
import HelpIcon from '@mui/icons-material/Help';
import LogoutIcon from '@mui/icons-material/Logout';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { authAPI } from '../../services/api';



const Header = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [anchorEl, setAnchorEl] = useState(null);
  const [profileAnchorEl, setProfileAnchorEl] = useState(null);
  const [scrolled, setScrolled] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const open = Boolean(anchorEl);
  const profileOpen = Boolean(profileAnchorEl);

  useEffect(() => {
    // Force scrollbar to always appear to prevent layout shift
    document.documentElement.style.overflowY = 'scroll';
    
    const handleScroll = () => {
      const isScrolled = window.scrollY > 10;
      if (isScrolled !== scrolled) {
        setScrolled(isScrolled);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
      document.documentElement.style.overflowY = 'auto';
    };
  }, [scrolled]);

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleProfileMenuOpen = (event) => {
    setProfileAnchorEl(event.currentTarget);
  };

  const handleProfileMenuClose = () => {
    setProfileAnchorEl(null);
  };

  const navItems = ['Home', 'About', 'Submit', 'Contact'];
  const guestRightItems = ['Newsletter', 'Login', 'Sign Up'];

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
      handleProfileMenuClose();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  useEffect(() => {
    console.log('User state changed:', user);
  }, [user]);

  return (
    <AppBar 
      position="fixed"
      color="transparent"
      elevation={scrolled ? 4 : 0}
      sx={{
        py: 2,
        backgroundColor: scrolled ? 'background.paper' : 'transparent',
        backdropFilter: scrolled ? 'blur(10px)' : 'none',
        transition: 'all 0.3s ease',
        zIndex: 3,
        animation: 'dropIn 0.5s ease-out forwards',
        opacity: 0,
        transform: 'translateY(-100px)',
        '@keyframes dropIn': {
          to: {
            opacity: 1,
            transform: 'translateY(0)'
          }
        }
      }}
    >
      <Container maxWidth="lg" sx={{ paddingRight: '0 !important' }}>
        <Toolbar disableGutters sx={{ 
          justifyContent: 'space-between',
        }}>
          {/* Mobile menu button */}
          {isMobile && (
            <Box sx={{ flex: 1, display: 'flex', justifyContent: 'flex-start' }}>
              <IconButton
                size="large"
                edge="start"
                color="inherit"
                aria-label="menu"
                onClick={handleMenuOpen}
                sx={{ color: 'text.primary' }}
              >
                <MenuIcon />
              </IconButton>
              <Menu
                id="mobile-menu"
                anchorEl={anchorEl}
                open={open}
                onClose={handleMenuClose}
                MenuListProps={{
                  'aria-labelledby': 'mobile-menu',
                  sx: { padding: '0 !important' }
                }}
                PaperProps={{
                  sx: {
                    backgroundColor: theme.palette.background.paper,
                    borderRadius: 2,
                    minWidth: 200,
                    boxShadow: theme.shadows[4],
                    marginTop: 1
                  }
                }}
              >
                {navItems.map((item) => (
                  <MenuItem 
                    key={item} 
                    onClick={handleMenuClose}
                    component={Link}
                    to={item === 'Home' ? '/' : `/${item.toLowerCase().replace(' ', '-')}`}
                    sx={{
                      '&:hover': {
                        backgroundColor: 'rgba(255, 255, 255, 0.05)'
                      }
                    }}
                  >
                    {item}
                  </MenuItem>
                ))}
                {!user ? (
                  guestRightItems.map((item) => {
                    const path = item === 'Sign Up' ? '/signup' : `/${item.toLowerCase().replace(' ', '-')}`;
                    return (
                      <MenuItem 
                        key={item} 
                        onClick={handleMenuClose}
                        component={Link}
                        to={path}
                        sx={{
                          '&:hover': {
                            backgroundColor: 'rgba(255, 255, 255, 0.05)'
                          }
                        }}
                      >
                        {item}
                      </MenuItem>
                    );
                  })
                ) : (
                  <>
                    <MenuItem 
                      onClick={handleMenuClose}
                      component={Link}
                      to="/settings"
                      sx={{
                        '&:hover': {
                          backgroundColor: 'rgba(255, 255, 255, 0.05)'
                        }
                      }}
                    >
                      Settings
                    </MenuItem>
                    <MenuItem 
                      onClick={handleLogout}
                      sx={{ 
                        color: theme.palette.error.main,
                        '&:hover': {
                          backgroundColor: 'rgba(255, 255, 255, 0.05)'
                        }
                      }}
                    >
                      Logout
                    </MenuItem>
                  </>
                )}
              </Menu>
            </Box>
          )}

          {/* Left-aligned navigation (desktop) */}
          {!isMobile && (
            <Box sx={{ 
              display: 'flex', 
              gap: 2,
              flex: 1,
              justifyContent: 'flex-start'
            }}>
              {navItems.map((label) => (
                <Button 
                  key={label}
                  component={Link} 
                  to={label === 'Home' ? '/' : `/${label.toLowerCase().replace(' ', '-')}`}
                  sx={{
                    color: 'text.primary',
                    textTransform: 'none',
                    fontSize: '1rem',
                    fontWeight: '700',
                    '&:hover': {
                      color: 'primary.main',
                      backgroundColor: 'transparent'
                    }
                  }}
                >
                  {label}
                </Button>
              ))}
            </Box>
          )}

          {/* Centered logo */}
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'center',
            flex: isMobile ? 0 : 1,
            position: isMobile ? 'absolute' : 'static',
            left: isMobile ? '50%' : 'auto',
            transform: isMobile ? 'translateX(-50%)' : 'none'
          }}>
            <Typography 
              variant="h4" 
              component={Link} 
              to="/" 
              sx={{ 
                fontWeight: 900,
                mb: 1,
                background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                display: 'inline-block',
              }}
            >
              Cognara
            </Typography>
          </Box>

          {/* Right-aligned actions */}
          <Box sx={{ 
            display: 'flex', 
            gap: 2,
            flex: 1,
            justifyContent: 'flex-end',
            alignItems: 'center'
          }}>
            {!user ? (
              !isMobile && (
                <>
                  <Button 
                    component={Link} 
                    to="/newsletter"
                    sx={{
                      color: 'text.primary',
                      textTransform: 'none',
                      fontSize: '1rem',
                      fontWeight: '700',
                      '&:hover': {
                        color: 'primary.main',
                        backgroundColor: 'transparent'
                      }
                    }}
                  >
                    Newsletter
                  </Button>
                  <Button 
                    component={Link} 
                    to="/login"
                    variant="outlined"
                    sx={{
                      backgroundColor: 'primary.dark',
                      borderColor: 'primary.dark',
                      color: 'text.primary',
                      textTransform: 'none',
                      fontSize: '1rem',
                      fontWeight: '700',
                      px: 2,
                      '&:hover': {
                        borderColor: 'primary.main',
                        color: 'primary.main'
                      }
                    }}
                  >
                    Login
                  </Button>
                  <Button 
                    component={Link} 
                    to="/signup"
                    variant="outlined"
                    sx={{
                      backgroundColor: 'primary.dark',
                      borderColor: 'primary.dark',
                      color: 'text.primary',
                      textTransform: 'none',
                      fontSize: '1rem',
                      fontWeight: '700',
                      px: 2,
                      '&:hover': {
                        borderColor: 'primary.main',
                        color: 'primary.main'
                      }
                    }}
                  >
                    Sign Up
                  </Button>
                </>
              )
            ) : (
              <Box 
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1.5,
                  cursor: 'pointer',
                  p: 1,
                  borderRadius: 2,
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 0.08)'
                  }
                }}
                onClick={handleProfileMenuOpen}
              >
                <Badge
                  overlap="circular"
                  anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                  variant="dot"
                  sx={{
                    '& .MuiBadge-badge': {
                      backgroundColor: theme.palette.success.main,
                      color: theme.palette.success.main,
                      boxShadow: `0 0 0 2px ${theme.palette.background.paper}`,
                    }
                  }}
                >
                  <Avatar 
                    src={user?.profilePicture || ''} 
                    alt={`${user?.first_name} ${user?.last_name}`}
                    sx={{
                      width: isMobile ? 36 : 40,
                      height: isMobile ? 36 : 40,
                      bgcolor: theme.palette.primary.main,
                      color: theme.palette.primary.contrastText,
                      fontSize: '0.875rem',
                      fontWeight: 600
                    }}
                  >
                    {user?.first_name?.charAt(0)}{user?.last_name?.charAt(0)}
                  </Avatar>
                </Badge>
                {!isMobile && (
                  <Typography 
                    variant="subtitle2"
                    sx={{
                      fontWeight: 600,
                      color: 'text.primary',
                    }}
                  >
                    {user.first_name} {user.last_name}
                  </Typography>
                )}
              </Box>
            )}
          </Box>

          {/* Profile dropdown menu */}
          {user && (
            <Menu
              anchorEl={profileAnchorEl}
              open={profileOpen}
              onClose={handleProfileMenuClose}
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'center',
              }}
              transformOrigin={{
                vertical: 'top',
                horizontal: 'center',
              }}
              PaperProps={{
                sx: {
                  mt: 1,
                  minWidth: 200,
                  borderRadius: 1,
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                  '& .MuiMenuItem-root': {
                    px: 2,
                    py: '6px',
                  },
                },
              }}
            >
              <MenuItem onClick={handleProfileMenuClose} component={Link} to="/settings">
                <ListItemIcon>
                  <SettingsIcon fontSize="small" />
                </ListItemIcon>
                Settings
              </MenuItem>
              <MenuItem onClick={handleProfileMenuClose} component={Link} to="/help">
                <ListItemIcon>
                  <HelpIcon fontSize="small" />
                </ListItemIcon>
                Help
              </MenuItem>
              <Divider sx={{ my: 0.5 }} />
              <MenuItem onClick={handleLogout}>
                <ListItemIcon>
                  <LogoutIcon fontSize="small" color="error" />
                </ListItemIcon>
                <Typography color="error">Logout</Typography>
              </MenuItem>
            </Menu>
          )}
        </Toolbar>
      </Container>
    </AppBar>
  );
};

export default Header;