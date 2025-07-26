import { BASE_URL } from '../constants/config';
import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  TextField,
  Button,
  Alert,
  Card,
  CardContent,
  Stack,
  CircularProgress
} from '@mui/material';
import { 
  ArrowBack as ArrowBackIcon, 
  Lock as LockIcon,
  Visibility,
  VisibilityOff
} from '@mui/icons-material';
import { IconButton, InputAdornment } from '@mui/material';

export function ResetPassword() {
  const [searchParams] = useSearchParams();
  const [token, setToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [userInfo, setUserInfo] = useState<{ email: string; name: string } | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const tokenParam = searchParams.get('token');
    if (tokenParam) {
      setToken(tokenParam);
      verifyToken(tokenParam);
    } else {
      setError('Invalid reset link. Please request a new password reset.');
      setVerifying(false);
    }
  }, [searchParams]);

  const verifyToken = async (resetToken: string) => {
    try {
      const response = await fetch(`${BASE_URL}/auth/verify-reset-token?token=${resetToken}`);
      const data = await response.json();

      if (response.ok) {
        setUserInfo({ email: data.email, name: data.name });
      } else {
        setError(data.error || 'Invalid or expired reset token');
      }
    } catch (err) {
      setError('Network error. Please try again later.');
    }
    setVerifying(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!newPassword) {
      setError('New password is required');
      return;
    }

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch(`${BASE_URL}/auth/reset-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          token,
          newPassword
        })
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(data.message);
        // Redirect to login after 3 seconds
        setTimeout(() => {
          navigate('/login');
        }, 3000);
      } else {
        setError(data.error || 'Failed to reset password');
      }
    } catch (err) {
      setError('Network error. Please try again later.');
    }

    setLoading(false);
  };

  if (verifying) {
    return (
      <Box sx={{ 
        minHeight: '100vh',
        width: '100vw', 
        bgcolor: 'background.default',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <Box sx={{ textAlign: 'center' }}>
          <CircularProgress size={60} sx={{ mb: 2 }} />
          <Typography variant="h6" sx={{ color: 'text.secondary' }}>
            Verifying reset link...
          </Typography>
        </Box>
      </Box>
    );
  }

  if (error && !userInfo) {
    return (
      <Box sx={{ 
        minHeight: '100vh', 
        bgcolor: 'background.default',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        py: 4
      }}>
        <Container maxWidth="sm">
          <Card sx={{ boxShadow: 3 }}>
            <CardContent sx={{ p: 4, textAlign: 'center' }}>
              <Typography variant="h4" sx={{ fontWeight: 700, color: 'error.main', mb: 2 }}>
                Invalid Reset Link
              </Typography>
              <Alert severity="error" sx={{ mb: 3 }}>
                {error}
              </Alert>
              <Stack spacing={2}>
                <Button
                  component={Link}
                  to="/forgot-password"
                  variant="contained"
                >
                  Request New Reset Link
                </Button>
                <Button
                  component={Link}
                  to="/login"
                  startIcon={<ArrowBackIcon />}
                >
                  Back to Login
                </Button>
              </Stack>
            </CardContent>
          </Card>
        </Container>
      </Box>
    );
  }

  return (
    <Box sx={{ 
      minHeight: '100vh', 
      bgcolor: 'background.default',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      py: 4
    }}>
      <Container maxWidth="sm">
        <Card sx={{ boxShadow: 3 }}>
          <CardContent sx={{ p: 4 }}>
            {/* Header */}
            <Box sx={{ textAlign: 'center', mb: 4 }}>
              <Typography variant="h4" sx={{ fontWeight: 700, color: 'secondary.main', mb: 1 }}>
                Reset Password
              </Typography>
              {userInfo && (
                <Typography variant="body1" sx={{ color: 'text.secondary' }}>
                  Hi {userInfo.name}, enter your new password below.
                </Typography>
              )}
            </Box>

            {/* Alerts */}
            {error && (
              <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
                {error}
              </Alert>
            )}
            {success && (
              <Alert severity="success" sx={{ mb: 3 }}>
                {success}
                <Typography variant="body2" sx={{ mt: 1, opacity: 0.8 }}>
                  Redirecting to login page...
                </Typography>
              </Alert>
            )}

            {/* Form */}
            {!success && (
              <form onSubmit={handleSubmit}>
                <Stack spacing={3}>
                  <TextField
                    fullWidth
                    label="New Password"
                    type={showPassword ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => {
                      setNewPassword(e.target.value);
                      setError('');
                    }}
                    disabled={loading}
                    helperText="Must be at least 6 characters long"
                    InputProps={{
                      startAdornment: <LockIcon sx={{ mr: 1, color: 'text.secondary' }} />,
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            onClick={() => setShowPassword(!showPassword)}
                            edge="end"
                          >
                            {showPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      )
                    }}
                  />

                  <TextField
                    fullWidth
                    label="Confirm New Password"
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value);
                      setError('');
                    }}
                    disabled={loading}
                    InputProps={{
                      startAdornment: <LockIcon sx={{ mr: 1, color: 'text.secondary' }} />,
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            edge="end"
                          >
                            {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      )
                    }}
                  />

                  <Button
                    type="submit"
                    variant="contained"
                    size="large"
                    disabled={loading || !newPassword || !confirmPassword}
                    sx={{ py: 1.5 }}
                  >
                    {loading ? 'Resetting...' : 'Reset Password'}
                  </Button>
                </Stack>
              </form>
            )}

            {/* Back to Login */}
            <Box sx={{ textAlign: 'center', mt: 3 }}>
              <Button
                component={Link}
                to="/login"
                startIcon={<ArrowBackIcon />}
                sx={{ color: 'text.secondary' }}
              >
                Back to Login
              </Button>
            </Box>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
}
