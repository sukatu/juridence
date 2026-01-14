import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { LogIn, Lock } from 'lucide-react';

const AuthGuard = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const checkAuthStatus = () => {
      const authStatus = localStorage.getItem('isAuthenticated');
      const isAuth = authStatus === 'true';
      setIsAuthenticated(isAuth);
      setIsLoading(false);

      if (!isAuth) {
        // Store the current location to redirect back after login
        localStorage.setItem('redirectAfterLogin', location.pathname);
      }
    };

    // Check initial auth status
    checkAuthStatus();

    // Listen for authentication changes
    const handleAuthChange = () => {
      checkAuthStatus();
    };

    // Add event listener for custom auth events
    window.addEventListener('authStateChanged', handleAuthChange);
    
    // Also listen for storage changes
    window.addEventListener('storage', handleAuthChange);

    // Cleanup event listeners
    return () => {
      window.removeEventListener('authStateChanged', handleAuthChange);
      window.removeEventListener('storage', handleAuthChange);
    };
  }, [location.pathname]);

  const handleLogin = () => {
    navigate('/login');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Checking authentication...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <div className="flex justify-center">
            <div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center">
              <Lock className="h-6 w-6 text-red-600" />
            </div>
          </div>
          <h2 className="mt-6 text-center text-3xl font-bold text-slate-900">
            Authentication Required
          </h2>
          <p className="mt-2 text-center text-sm text-slate-600">
            You need to be logged in to access this page.
          </p>
        </div>

        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
            <div className="text-center">
              <p className="text-slate-600 mb-6">
                Please log in to your account to continue.
              </p>
              <button
                onClick={handleLogin}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-sky-600 hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 transition-colors"
              >
                <LogIn className="h-4 w-4 mr-2" />
                Go to Login
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return children;
};

export default AuthGuard;
