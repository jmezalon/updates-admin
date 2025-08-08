import { AppBar, Toolbar, Typography, Button, Avatar, Box } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';

// Navbar component to be shared across all pages
export function Navbar() {
  const navigate = useNavigate();
  const { isLoggedIn, user, logout } = useAuth();

  const handleHomeClick = () => {
    if (isLoggedIn) {
      navigate('/dashboard');
    } else {
      navigate('/');
    }
  };

  return (
    <AppBar position="fixed" color="secondary" elevation={1} sx={{ borderBottom: 2, borderColor: 'secondary.main', top: 0, left: 0, right: 0 }}>
      <Toolbar>
        <Typography 
          variant="h5" 
          sx={{ flexGrow: 1, fontWeight: 700, color: 'black', letterSpacing: 2, cursor: 'pointer', '&:hover': { color: 'primary.dark' } }}
          onClick={handleHomeClick}
        >
          Updates
        </Typography>
        {isLoggedIn ? (
          <>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              {user?.role !== 'superuser' && (
                <Button 
                  color="inherit" 
                  onClick={() => navigate('/dashboard?view=church-details')} 
                  sx={{ 
                    color: 'black', 
                    fontWeight: 600,
                    '&:hover': {
                      bgcolor: '#fff',
                      color: 'primary.dark'
                    }
                  }}
                >
                  My Church
                </Button>
              )}
              <Avatar 
                sx={{ 
                  width: 40, 
                  height: 40, 
                  color: 'black',
                  bgcolor: 'inherit',
                  cursor: 'pointer',
                  '&:hover': {
                    color: 'primary.dark',
                    bgcolor: 'white'
                  }
                }}
                onClick={() => navigate('/profile')}
              >
                {user?.name ? 
                  user.name.split(' ').map(n => n[0]).join('').toUpperCase() : 
                  'U'
                }
              </Avatar>
              <Button color="inherit" onClick={logout} sx={{ color: 'error.main', fontWeight: 600 }}>
                Logout
              </Button>
            </Box>
          </>
        ) : (
          <>
            <Button color="inherit" onClick={() => navigate('/enroll')} sx={{ color: 'text.primary', mr: 2, fontWeight: 600, '&:hover': { bgcolor: '#fff', color: 'primary.dark', cursor: 'pointer' } }}>
              Enroll
            </Button>
            <Button color="inherit" onClick={() => navigate('/login')} sx={{ color: 'error.main', fontWeight: 600, '&:hover': { bgcolor: '#fff', color: 'primary.dark', cursor: 'pointer' } }}>
              Login
            </Button>
          </>
        )}
      </Toolbar>
    </AppBar>
  );
}
