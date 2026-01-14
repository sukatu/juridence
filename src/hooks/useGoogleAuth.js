import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

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
        callback: (response) => {
          setIsLoading(true);
          setError('');
          
          try {
            // Decode the JWT token to get user info
            const payload = JSON.parse(atob(response.credential.split('.')[1]));
            const userInfo = {
              id: payload.sub,
              email: payload.email,
              name: payload.name,
              picture: payload.picture,
              given_name: payload.given_name,
              family_name: payload.family_name
            };
            
            // Store authentication data
            localStorage.setItem('isAuthenticated', 'true');
            localStorage.setItem('userEmail', userInfo.email);
            localStorage.setItem('userName', userInfo.name);
            localStorage.setItem('userPicture', userInfo.picture);
            localStorage.setItem('authProvider', 'google');
            
            // Dispatch custom event to notify other components
            window.dispatchEvent(new CustomEvent('authStateChanged'));
            
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
  const signOut = useCallback(() => {
    if (window.google?.accounts?.id) {
      window.google.accounts.id.disableAutoSelect();
    }
    
    // Clear local storage
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userName');
    localStorage.removeItem('userPicture');
    localStorage.removeItem('authProvider');
    
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
