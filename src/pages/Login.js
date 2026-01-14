import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff, Mail, ArrowLeft } from 'lucide-react';
import { apiPost } from '../utils/api';

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  


  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      // Prepare request data
      const requestData = { email: formData.email, password: formData.password };

      // Call the backend API using the utility
      const data = await apiPost('/auth/login', requestData, { includeAuth: false });

      // Store auth state - similar to how test buttons did it
      localStorage.setItem('isAuthenticated', 'true');
      localStorage.setItem('userEmail', data.user.email);
      localStorage.setItem('userName', data.user.first_name && data.user.last_name 
        ? `${data.user.first_name} ${data.user.last_name}` 
        : data.user.email.split('@')[0]);
      localStorage.setItem('accessToken', data.access_token);
      localStorage.setItem('userData', JSON.stringify(data.user));
      localStorage.setItem('authProvider', 'email');
      
      // Get user role from multiple possible sources (like test buttons checked)
      // Handle enum values - convert to string if needed
      const roleValue = data.user.role?.value || data.user.role;
      const userRole = roleValue || data.user.user_type || data.user.account_type;
      const userType = data.user.user_type; // This is the selected role during registration
      
      // Store user role if available
      if (userRole) {
        localStorage.setItem('userRole', String(userRole));
      }
      if (userType) {
        localStorage.setItem('userType', userType);
      }
      
      // Store admin status - check both is_admin flag and role (comprehensive check)
      const isAdminUser = data.user.is_admin === true || 
                         roleValue === 'admin' || 
                         roleValue === 'ADMIN' ||
                         String(roleValue).toLowerCase() === 'admin' ||
                         userType === 'administrator';
      
      // Debug: Log everything
      console.log('=== LOGIN DEBUG ===');
      console.log('Full user data:', data.user);
      console.log('Backend role:', data.user.role);
      console.log('Backend roleValue:', roleValue);
      console.log('Backend user_type:', data.user.user_type);
      console.log('is_admin flag:', data.user.is_admin);
      console.log('Email:', data.user.email);
      console.log('Admin check result:', {
        is_admin: data.user.is_admin,
        role: roleValue,
        user_type: userType,
        isAdminUser
      });
      
      if (isAdminUser) {
        localStorage.setItem('isAdmin', 'true');
        console.log('✓ Setting isAdmin flag to true in localStorage');
      } else {
        localStorage.removeItem('isAdmin');
        console.log('✗ User is not admin, removing isAdmin flag');
      }
      
      // Dispatch custom event to notify other components
      window.dispatchEvent(new CustomEvent('authStateChanged'));
      
      // Check if there's a redirect URL stored
      const redirectUrl = localStorage.getItem('redirectAfterLogin');
      if (redirectUrl) {
        localStorage.removeItem('redirectAfterLogin');
        navigate(redirectUrl);
        return;
      }
      
      // Determine user type and route accordingly (like test buttons did)
      // Priority: is_admin > user_type > role > email patterns
      
      // 1. Check if admin
      if (isAdminUser || userType === 'administrator') {
        console.log('User is admin - Navigating to /admin');
        localStorage.setItem('isAdmin', 'true');
        localStorage.setItem('userRole', 'admin');
        navigate('/admin');
        return;
      }
      
      // 2. Check if court registrar
      const isCourtRegistrar = userType === 'court_registrar' ||
                               data.user.court_type !== null && data.user.court_type !== undefined ||
                               (data.user.email && data.user.email.toLowerCase().includes('registrar')) ||
                               userRole === 'court_registrar';
      
      if (isCourtRegistrar) {
        console.log('User is court registrar - Navigating to /registrar');
        localStorage.setItem('userRole', 'court_registrar');
        localStorage.setItem('userType', 'court_registrar');
        if (data.user.court_type) {
          localStorage.setItem('courtType', data.user.court_type);
        }
        navigate('/registrar');
        return;
      }
      
      // 3. Check if corporate client
      const isCorporateClient = userType === 'corporate_client' ||
                                data.user.entity_type !== null && data.user.entity_type !== undefined ||
                                data.user.entity_id !== null && data.user.entity_id !== undefined ||
                                userRole === 'corporate_client';
      
      if (isCorporateClient) {
        console.log('User is corporate client - Navigating to /corporate');
        localStorage.setItem('userRole', 'corporate_client');
        localStorage.setItem('userType', 'corporate_client');
        if (data.user.entity_type) {
          localStorage.setItem('entityType', data.user.entity_type);
        }
        if (data.user.entity_id) {
          localStorage.setItem('entityId', data.user.entity_id.toString());
        }
        navigate('/corporate');
        return;
      }
      
      // 4. Default to home page
      console.log('User is regular user - Navigating to /');
      navigate('/');
    } catch (err) {
      setError('An error occurred. Please try again.');
      console.error('Login error:', err);
    } finally {
      setIsLoading(false);
    }
  };


  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background Image with Overlay */}
      <div 
        className="absolute inset-0" 
        style={{ 
          backgroundImage: `url(${process.env.PUBLIC_URL || ''}/onboarding/onboarding-backgroun.png)`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          transform: 'scaleX(-1)'
        }}
      >
        <div className="absolute inset-0 bg-[rgba(0,35,81,0.5)]" />
      </div>

      {/* Logo and Back to Website Link */}
      <div className="absolute top-[83px] left-[60px] right-[780px] z-10 flex items-center justify-between">
        <button onClick={() => navigate('/')} className="cursor-pointer hover:opacity-80 transition-opacity">
          <img 
            src="/logos/logo-white.png" 
            alt="juridence" 
            className="h-[36px] w-auto"
          />
        </button>
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-white hover:opacity-80 transition-opacity"
        >
          <ArrowLeft className="h-6 w-6" />
          <p className="font-['Poppins',sans-serif] text-[20px]">Back to Website</p>
        </button>
      </div>

      {/* Right Side - Login Card */}
      <div className="absolute right-[20px] top-[20px] bottom-[20px] z-10">
        <div className="bg-white rounded-[8px] w-[660px] h-full px-[60px] py-0 flex flex-col justify-center" style={{ boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.1)' }}>
          <div className="flex flex-col gap-[20px] w-full">
            {/* Welcome Text */}
            <div className="flex flex-col gap-[4px]">
              <p className="font-['Poppins',sans-serif] font-bold text-[32px] leading-normal text-[#040E1B]">
                Welcome back!
              </p>
              <p className="font-['Satoshi',sans-serif] text-[16px] leading-normal text-[#040E1B] opacity-75">
                Login to begin your smart due diligence.
              </p>
            </div>

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="flex flex-col gap-[16px]">
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="font-['Satoshi',sans-serif] text-[14px] text-red-600">{error}</p>
                </div>
              )}

            {/* Email Field */}
            <div className="flex flex-col gap-[4px]">
              <label className="font-['Satoshi',sans-serif] font-bold text-[14px] text-[#040E1B]">E-mail</label>
              <div className="relative">
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 pr-12 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-colors text-slate-600"
                  placeholder="E-mail goes here"
                  style={{ fontFamily: 'Satoshi, sans-serif', fontSize: '14px' }}
                  required
                />
                <Mail className="absolute right-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
              </div>
            </div>

            {/* Password Field */}
            <div className="flex flex-col gap-[4px]">
              <label className="font-['Satoshi',sans-serif] font-bold text-[14px] text-[#040E1B]">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 pr-12 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-colors text-slate-600"
                  placeholder="Password"
                  style={{ fontFamily: 'Satoshi, sans-serif', fontSize: '14px' }}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              <p className="font-['Satoshi',sans-serif] italic text-[12px] text-[#525866]">Description goes here</p>
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-2">
                <input
                  id="remember-me"
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-4 w-4 text-sky-600 focus:ring-sky-500 border-slate-300 rounded"
                />
                <label htmlFor="remember-me" className="font-['Satoshi',sans-serif] text-[12px] text-[#040E1B]">
                  Remember me
                </label>
              </div>
              <Link to="/forgot-password" className="font-['Satoshi',sans-serif] text-[12px] text-[#022658] hover:opacity-80 transition-opacity">
                Forgot password?
              </Link>
            </div>

            {/* Login Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full text-white font-bold rounded-[8px] transition-colors disabled:opacity-50 disabled:cursor-not-allowed h-[56px] flex items-center justify-center"
              style={{ 
                background: 'linear-gradient(180deg, #022658 42.56%, #1A4983 100%)',
                fontFamily: 'Satoshi, sans-serif',
                fontSize: '16px',
                border: '4px solid rgba(15, 40, 71, 0.15)'
              }}
            >
              {isLoading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>Signing in...</span>
                </div>
              ) : (
                'Log in'
              )}
            </button>

            </form>

            {/* Create Account Link */}
            <p className="text-center font-['Satoshi',sans-serif] text-[12px]">
              <span className="text-[#525866]">Don't have an account? </span>
              <Link to="/select-role" className="font-bold text-[#040E1B] hover:opacity-80 transition-opacity">
                Create account
              </Link>
            </p>

            {/* Social Login Divider */}
            <div className="flex gap-[16px] items-center w-full my-2">
              <div className="flex-1 h-[0.5px] bg-[#525866] opacity-25" />
              <p className="font-['Satoshi',sans-serif] text-[12px] text-[#525866] opacity-50">
                Or Log in with
              </p>
              <div className="flex-1 h-[0.5px] bg-[#525866] opacity-25" />
            </div>

            {/* Social Login Buttons */}
            <div className="flex gap-[16px] h-[56px] w-full">
              <button
                type="button"
                className="flex-1 border border-[#525866] border-solid rounded-[8px] flex items-center justify-center hover:bg-slate-50 transition-colors"
              >
                <svg className="w-6 h-6" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
              </button>
              <button
                type="button"
                className="flex-1 border border-[#525866] border-solid rounded-[8px] flex items-center justify-center hover:bg-slate-50 transition-colors"
              >
                <svg className="w-6 h-6" fill="#1877F2" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
              </button>
              <button
                type="button"
                className="flex-1 border border-[#525866] border-solid rounded-[8px] flex items-center justify-center hover:bg-slate-50 transition-colors"
              >
                <svg className="w-6 h-6" fill="#000000" viewBox="0 0 24 24">
                  <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
                </svg>
              </button>
            </div>

          </div>
        </div>
      </div>

      {/* Left Side - Marketing Text */}
      <div className="absolute left-[60px] top-[772px] w-[600px] z-10">
        <div className="flex flex-col gap-[8px]">
          <p className="font-['Poppins',sans-serif] font-medium text-[48px] leading-normal text-white">
            Legal Intelligence at Your Fingertips
          </p>
          <p className="font-['Poppins',sans-serif] text-[20px] leading-normal text-white">
            Access comprehensive legal data and due diligence tools in one secure platform
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
