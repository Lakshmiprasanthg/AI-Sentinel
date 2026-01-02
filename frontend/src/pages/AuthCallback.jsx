import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Box, CircularProgress, Typography, Alert } from '@mui/material';
import useStore from '../store/useStore';
import { authAPI } from '../utils/api';

function AuthCallback() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { setAuth } = useStore();

  useEffect(() => {
    const token = searchParams.get('token');
    const error = searchParams.get('error');

    if (error) {
      setTimeout(() => navigate('/login'), 2000);
      return;
    }

    if (token) {
      // Fetch user data with the token
      const fetchUser = async () => {
        try {
          // Temporarily set token to make the request
          const tempStore = { state: { token } };
          localStorage.setItem('ai-sentinel-storage', JSON.stringify(tempStore));

          const response = await authAPI.getMe();
          setAuth(response.data.user, token);
          navigate('/');
        } catch (err) {
          console.error('Failed to fetch user:', err);
          navigate('/login');
        }
      };

      fetchUser();
    } else {
      navigate('/login');
    }
  }, [searchParams, navigate, setAuth]);

  const error = searchParams.get('error');

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        gap: 2,
      }}
    >
      {error ? (
        <Alert severity="error">
          Authentication failed. Redirecting to login...
        </Alert>
      ) : (
        <>
          <CircularProgress size={60} />
          <Typography variant="h6">Completing authentication...</Typography>
        </>
      )}
    </Box>
  );
}

export default AuthCallback;
