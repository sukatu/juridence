import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

const SelectRole = () => {
  const navigate = useNavigate();
  const [selectedRole, setSelectedRole] = useState('');

  const roles = [
    { id: 'administrator', label: 'Administrator' },
    { id: 'court_registrar', label: 'Court Registrar' },
    { id: 'corporate_client', label: 'Corporate Client' }
  ];

  const handleRoleSelect = (roleId) => {
    setSelectedRole(roleId);
  };

  const handleProceed = () => {
    if (selectedRole) {
      // Store selected role
      localStorage.setItem('selectedRole', selectedRole);
      // Navigate to create account
      navigate('/create-account');
    }
  };

  const handleGoogleLogin = () => {
    // Handle Google OAuth login
    console.log('Google login');
  };

  const handleFacebookLogin = () => {
    // Handle Facebook OAuth login
    console.log('Facebook login');
  };

  const handleAppleLogin = () => {
    // Handle Apple OAuth login
    console.log('Apple login');
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
            alt="Juridence Logo" 
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

      {/* Right Side - Onboarding Card */}
      <div className="absolute right-[20px] top-[20px] bottom-[20px] z-10">
        <div className="bg-white rounded-[8px] w-[660px] h-full px-[60px] py-0 flex flex-col justify-center gap-[38px]" style={{ boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.1)' }}>
          <div className="flex flex-col gap-[32px] w-full">
            {/* Header */}
            <div className="flex flex-col gap-[8px] h-[82px]">
              <p className="font-['Poppins',sans-serif] font-bold text-[32px] leading-normal text-[#050f1c]">
                Who are you?
              </p>
              <p className="font-['Satoshi',sans-serif] text-[16px] leading-normal text-[#050f1c] opacity-75">
                Select the one that best suits you
              </p>
            </div>

            {/* Role Selection */}
            <div className="flex flex-col gap-[24px]">
              {roles.map((role) => (
                <div
                  key={role.id}
                  onClick={() => handleRoleSelect(role.id)}
                  className="flex gap-[12px] items-start cursor-pointer hover:opacity-80 transition-opacity"
                >
                  <div className="w-6 h-6 flex-shrink-0">
                    {selectedRole === role.id ? (
                      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none">
                        <rect x="3" y="3" width="18" height="18" rx="2" fill="#022658"/>
                        <path d="M9 12l2 2 4-4" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    ) : (
                      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none">
                        <rect x="3" y="3" width="18" height="18" rx="2" stroke="#b1b9c6" strokeWidth="2"/>
                      </svg>
                    )}
                  </div>
                  <p className="font-['Satoshi',sans-serif] text-[16px] leading-normal text-[#050f1c]">
                    {role.label}
                  </p>
                </div>
              ))}
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col gap-[32px] w-full">
              {/* Proceed Button */}
              <div className="flex flex-col gap-[16px] items-center w-full">
                <button
                  onClick={handleProceed}
                  disabled={!selectedRole}
                  className="bg-gradient-to-b from-[#022658] from-[42.563%] to-[#1a4983] border-4 border-[rgba(15,40,71,0.15)] border-solid w-full h-[40px] rounded-[8px] flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 transition-opacity"
                >
                  <p className="font-['Satoshi',sans-serif] font-bold text-[16px] text-white">
                    Proceed to create account
                  </p>
                </button>
                
                <p className="font-['Roboto',sans-serif] font-medium text-center w-full">
                  <span className="font-['Satoshi',sans-serif] text-[12px]">Already have an account? </span>
                  <Link to="/login" className="font-['Satoshi',sans-serif] font-bold text-[12px] text-[#022658]">
                    Log in
                  </Link>
                </p>
              </div>

              {/* Social Login Divider */}
              <div className="flex gap-[16px] items-center w-full">
                <div className="flex-1 h-[0.5px] bg-[#525866] opacity-25" />
                <p className="font-['Satoshi',sans-serif] text-[12px] text-[#525866] opacity-50">
                  Or Log in with
                </p>
                <div className="flex-1 h-[0.5px] bg-[#525866] opacity-25" />
              </div>

              {/* Social Login Buttons */}
              <div className="flex gap-[16px] h-[56px] w-full">
                <button
                  onClick={handleGoogleLogin}
                  className="flex-1 border border-[#525866] border-solid rounded-[8px] flex items-center justify-center hover:bg-slate-50 transition-colors"
                >
                  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                  </svg>
                </button>
                <button
                  onClick={handleFacebookLogin}
                  className="flex-1 border border-[#525866] border-solid rounded-[8px] flex items-center justify-center hover:bg-slate-50 transition-colors"
                >
                  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="#1877F2">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                </button>
                <button
                  onClick={handleAppleLogin}
                  className="flex-1 border border-[#525866] border-solid rounded-[8px] flex items-center justify-center hover:bg-slate-50 transition-colors"
                >
                  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="#000000">
                    <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
                  </svg>
                </button>
              </div>
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

export default SelectRole;

