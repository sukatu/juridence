import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, ArrowLeft } from 'lucide-react';

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      // Simulate API call for password reset
      await new Promise(resolve => setTimeout(resolve, 1500));
      setIsSubmitted(true);
    } catch (err) {
      setError('An error occurred. Please try again.');
      console.error('Password reset error:', err);
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

      {/* Right Side - Forgot Password Card */}
      <div className="absolute right-[20px] top-[20px] bottom-[20px] z-10">
        <div className="bg-white rounded-[8px] w-[660px] h-full px-[60px] py-0 flex flex-col justify-center" style={{ boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.1)' }}>
          <div className="flex flex-col gap-[20px] w-full">
            {!isSubmitted ? (
              <>
                {/* Welcome Text */}
                <div className="flex flex-col gap-[4px]">
                  <p className="font-['Poppins',sans-serif] font-bold text-[32px] leading-normal text-[#040E1B]">
                    Forgot Password?
                  </p>
                  <p className="font-['Satoshi',sans-serif] text-[16px] leading-normal text-[#040E1B] opacity-75">
                    No worries, we'll send you reset instructions.
                  </p>
                </div>

                {/* Forgot Password Form */}
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
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full px-4 py-3 pr-12 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-colors text-slate-600"
                        placeholder="Enter your email address"
                        style={{ fontFamily: 'Satoshi, sans-serif', fontSize: '14px' }}
                        required
                      />
                      <Mail className="absolute right-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
                    </div>
                  </div>

                  {/* Reset Password Button */}
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
                        <span>Sending...</span>
                      </div>
                    ) : (
                      'Reset Password'
                    )}
                  </button>
                </form>

                {/* Back to Login Link */}
                <p className="text-center font-['Satoshi',sans-serif] text-[12px]">
                  <Link to="/login" className="flex items-center justify-center gap-1 text-[#525866] hover:opacity-80 transition-opacity">
                    <ArrowLeft className="h-4 w-4" />
                    <span>Back to Login</span>
                  </Link>
                </p>
              </>
            ) : (
              <>
                {/* Success Message */}
                <div className="flex flex-col gap-[4px]">
                  <p className="font-['Poppins',sans-serif] font-bold text-[32px] leading-normal text-[#040E1B]">
                    Check your email
                  </p>
                  <p className="font-['Satoshi',sans-serif] text-[16px] leading-normal text-[#040E1B] opacity-75">
                    We've sent password reset instructions to {email}
                  </p>
                </div>

                {/* Success Icon */}
                <div className="flex items-center justify-center py-8">
                  <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
                    <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                </div>

                {/* Instructions */}
                <div className="bg-sky-50 border border-sky-200 rounded-lg p-4">
                  <p className="font-['Satoshi',sans-serif] text-[14px] text-sky-800">
                    Didn't receive the email? Check your spam folder or{' '}
                    <button 
                      onClick={() => setIsSubmitted(false)}
                      className="font-bold underline hover:opacity-80 transition-opacity"
                    >
                      try again
                    </button>
                  </p>
                </div>

                {/* Back to Login Button */}
                <button
                  onClick={() => navigate('/login')}
                  className="w-full text-white font-bold rounded-[8px] transition-colors h-[56px] flex items-center justify-center"
                  style={{ 
                    background: 'linear-gradient(180deg, #022658 42.56%, #1A4983 100%)',
                    fontFamily: 'Satoshi, sans-serif',
                    fontSize: '16px',
                    border: '4px solid rgba(15, 40, 71, 0.15)'
                  }}
                >
                  Back to Login
                </button>
              </>
            )}
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

export default ForgotPassword;
