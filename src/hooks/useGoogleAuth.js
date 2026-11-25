import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiPost, logoutSession, saveAuthSession } from '../utils/api';

const useGoogleAuth = () => {
  const [isGoogleLoaded, setIsGoogleLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // Check if Google Identity Services is loaded
  useEffect(() => {
    const checkGoogleLoaded = () => {
      if (window.google && window.google.accounts) {
        setIsGoogleLoaded(true);
      } else {
        setTimeout(checkGoogleLoaded, 100);
      }
    };
    checkGoogleLoaded();
  }, []);

  // Initialize Google Sign-In
  const initializeGoogleSignIn = useCallback((elementId, onSuccess, onError) => {
    if (!isGoogleLoaded || !window.google?.accounts?.id) {
      console.error('Google Identity Services not loaded');
      return;
    }

    try {
      window.google.accounts.id.initialize({
        client_id: process.env.REACT_APP_GOOGLE_CLIENT_ID || 'your-google-client-id.apps.googleusercontent.com',
        callback: async (response) => {
          setIsLoading(true);
          setError('');
          
          try {
            const data = await apiPost('/auth/google', {
              google_token: response.credential,
              remember_me: true,
            }, { includeAuth: false });
            const userInfo = saveAuthSession(data, { provider: 'google' });
            onSuccess(userInfo);
          } catch (err) {
            console.error('Error processing Google response:', err);
            setError('Failed to process Google authentication');
            onError(err);
          } finally {
            setIsLoading(false);
          }
        },
        auto_select: false,
        cancel_on_tap_outside: true
      });

      // Render the button
      window.google.accounts.id.renderButton(
        document.getElementById(elementId),
        {
          theme: 'outline',
          size: 'large',
          width: '100%',
          text: 'continue_with',
          shape: 'rectangular',
          logo_alignment: 'left'
        }
      );
    } catch (err) {
      console.error('Error initializing Google Sign-In:', err);
      setError('Failed to initialize Google authentication');
      onError(err);
    }
  }, [isGoogleLoaded]);

  // Handle Google Sign-In success
  const handleGoogleSuccess = useCallback((userInfo) => {
    // You can add additional logic here, like sending user data to your backend
    
    // Check if there's a redirect URL stored
    const redirectUrl = localStorage.getItem('redirectAfterLogin');
    if (redirectUrl) {
      localStorage.removeItem('redirectAfterLogin');
      navigate(redirectUrl);
    } else {
      navigate('/');
    }
  }, [navigate]);

  // Handle Google Sign-In error
  const handleGoogleError = useCallback((error) => {
    console.error('Google authentication error:', error);
    setError('Google authentication failed. Please try again.');
  }, []);

  // Sign out from Google
  const signOut = useCallback(async () => {
    if (window.google?.accounts?.id) {
      window.google.accounts.id.disableAutoSelect();
    }
    
    await logoutSession();
    navigate('/');
  }, [navigate]);

  return {
    isGoogleLoaded,
    isLoading,
    error,
    initializeGoogleSignIn,
    handleGoogleSuccess,
    handleGoogleError,
    signOut,
    setError
  };
};

export default useGoogleAuth;
