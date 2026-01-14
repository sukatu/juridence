import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Mail, CheckCircle, X } from 'lucide-react';
import { apiPost } from '../utils/api';

const VerifyAccount = () => {
  const navigate = useNavigate();
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [countdown, setCountdown] = useState(120); // 2 minutes countdown
  const [canResend, setCanResend] = useState(false);
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [isVerified, setIsVerified] = useState(false); // Track if verification was successful
  const inputRefs = useRef([]);

  useEffect(() => {
    // Get email from localStorage
    const pendingEmail = localStorage.getItem('pendingVerificationEmail');
    if (pendingEmail) {
      setEmail(pendingEmail);
    } else {
      // Redirect to signup if no pending email
      navigate('/create-account');
    }
  }, [navigate]);

  useEffect(() => {
    // Start countdown timer
    if (countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [countdown]);

  const handleOtpChange = (index, value) => {
    // Only allow numbers
    if (value && !/^\d$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    setError('');

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    // Handle backspace
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
    // Handle paste
    if (e.key === 'v' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      navigator.clipboard.readText().then(text => {
        const digits = text.replace(/\D/g, '').slice(0, 6);
        const newOtp = [...otp];
        digits.split('').forEach((digit, i) => {
          if (i < 6) newOtp[i] = digit;
        });
        setOtp(newOtp);
        inputRefs.current[Math.min(digits.length - 1, 5)]?.focus();
      });
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    const otpString = otp.join('');
    
    if (otpString.length !== 6) {
      setError('Please enter the complete 6-digit code');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await apiPost('/auth/verify-email', {
        email: email,
        verification_code: otpString
      }, { includeAuth: false });

      if (response) {
        // Mark as verified - this will disable controls and blur background
        setIsVerified(true);
        
        // Show success toast
        setShowSuccessToast(true);
        
        // Clear pending email
        localStorage.removeItem('pendingVerificationEmail');
        localStorage.removeItem('selectedRole');
        
        // Mark onboarding as complete
        localStorage.setItem('onboardingCompleted', 'true');
        
        // Navigate to success page after 3 seconds
        setTimeout(() => {
          navigate('/verify-success');
        }, 3000);
      }
    } catch (err) {
      setError(err.response?.data?.detail || 'Invalid verification code. Please try again.');
      console.error('Verification error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    if (!canResend) return;

    setIsLoading(true);
    setError('');

    try {
      await apiPost('/auth/resend-verification-code', {
        email: email
      }, { includeAuth: false });

      // Reset countdown
      setCountdown(120);
      setCanResend(false);
      
      // Clear OTP inputs
      setOtp(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } catch (err) {
      setError('Failed to resend code. Please try again.');
      console.error('Resend error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (!email) {
    return null;
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background Image with Overlay */}
      <div 
        className={`absolute inset-0 transition-all duration-300 ${isVerified ? 'blur-sm' : ''}`}
        style={{ 
          backgroundImage: `url(${process.env.PUBLIC_URL || ''}/onboarding/account-verify.png)`,
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      >
        <div className="absolute inset-0 bg-[rgba(0,35,81,0.5)]" />
      </div>

      {/* Success Toast Banner */}
      {showSuccessToast && (
        <div className="absolute top-0 left-0 right-0 z-[100] animate-in slide-in-from-top duration-300">
          <div className="bg-[#10b981] w-full px-[24px] py-[16px] flex items-center justify-between shadow-lg">
            <div className="flex items-center gap-[12px] flex-1">
              <div className="bg-white rounded-full p-[4px] flex-shrink-0">
                <CheckCircle className="h-[20px] w-[20px] text-[#10b981]" />
              </div>
              <div className="flex items-center gap-[8px]">
                <p className="font-['Satoshi',sans-serif] font-bold text-[16px] text-white">
                  Success
                </p>
                <p className="font-['Satoshi',sans-serif] text-[14px] text-white">
                  Account created successfully! You are on the right track.
                </p>
              </div>
            </div>
            <button
              onClick={() => {
                // Don't allow closing during redirect countdown
                if (!isVerified) {
                  setShowSuccessToast(false);
                }
              }}
              disabled={isVerified}
              className="text-white hover:opacity-80 transition-opacity p-1 flex-shrink-0 ml-4 disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Close"
            >
              <X className="h-[20px] w-[20px]" />
            </button>
          </div>
        </div>
      )}

      {/* Logo and Back to Website Link */}
      <div className={`absolute top-[83px] left-[60px] right-[780px] z-10 flex items-center justify-between transition-all duration-300 ${isVerified ? 'opacity-50 pointer-events-none' : ''}`}>
        <img 
          src="/logos/logo-white.png" 
          alt="Juridence Logo" 
          className="h-[36px] w-auto"
        />
        <Link
          to="/"
          className="flex items-center gap-2 text-white hover:opacity-80 transition-opacity pointer-events-auto"
          onClick={(e) => isVerified && e.preventDefault()}
        >
          <ArrowLeft className="h-6 w-6" />
          <p className="font-['Poppins',sans-serif] text-[20px]">Back to Website</p>
        </Link>
      </div>

      {/* Right Side - Onboarding Card */}
      <div className={`absolute right-[20px] top-1/2 -translate-y-1/2 z-10 transition-all duration-300 ${isVerified ? 'opacity-75 pointer-events-none' : ''}`}>
        <div className="bg-white rounded-[8px] w-[660px] h-[984px] px-[60px] py-0 flex flex-col justify-center gap-[38px]">
          <div className="flex flex-col gap-[32px] w-full">
            {/* Header */}
            <div className="flex flex-col gap-[8px]">
              <p className="font-['Poppins',sans-serif] font-bold text-[32px] leading-normal text-[#050f1c]">
                Verify your account
              </p>
              <p className="font-['Satoshi',sans-serif] text-[16px] leading-normal text-[#050f1c] opacity-75">
                Enter the verification code sent to your mail{' '}
                <span className="font-['Satoshi',sans-serif] font-medium">{email}</span> below
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-[8px] p-4">
                <p className="font-['Satoshi',sans-serif] text-[14px] text-red-600">{error}</p>
              </div>
            )}

            {/* OTP Input Fields */}
            <form onSubmit={(e) => {
              if (isVerified) {
                e.preventDefault();
                return;
              }
              handleVerify(e);
            }} className="flex flex-col gap-[24px] relative">
              {isVerified && (
                <div className="absolute inset-0 z-50 bg-transparent" style={{ pointerEvents: 'all', cursor: 'not-allowed' }} />
              )}
              <div className="flex flex-col gap-[8px]">
                <p className="font-['Satoshi',sans-serif] font-bold text-[14px] text-[#050f1c]">
                  Verification code
                </p>
                <div className="flex gap-[8px]">
                  {otp.map((digit, index) => (
                    <input
                      key={index}
                      ref={(el) => (inputRefs.current[index] = el)}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpChange(index, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(index, e)}
                      disabled={isVerified}
                      className={`w-[48px] h-[48px] border border-solid rounded-[8px] text-center font-['Satoshi',sans-serif] text-[14px] focus:outline-none focus:ring-2 ${
                        digit && otp[index]
                          ? 'border-[#022658] text-[#050f1c]'
                          : 'border-[#b1b9c6] text-[#525866]'
                      } focus:border-[#022658] focus:ring-[#022658] disabled:opacity-50 disabled:cursor-not-allowed`}
                    />
                  ))}
                </div>

                {/* Resend Code */}
                <div className="flex flex-col gap-[4px]">
                  <p className="font-['Satoshi',sans-serif] text-[14px] text-[#050f1c]">
                    Didn't receive the code?{' '}
                    <button
                      type="button"
                      onClick={handleResend}
                      disabled={!canResend || isLoading || isVerified}
                      className={`font-['Satoshi',sans-serif] font-bold text-[#022658] hover:underline disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                      Resend
                    </button>
                  </p>
                  {countdown > 0 && (
                    <p className="font-['Satoshi',sans-serif] text-[12px] text-[#050f1c]">
                      <span className="font-['Satoshi',sans-serif]">Code expires in </span>
                      <span className="text-red-500 font-['Satoshi',sans-serif] font-bold">
                        {formatTime(countdown)}
                      </span>
                    </p>
                  )}
                </div>
              </div>

              {/* Verify Button */}
              <button
                type="submit"
                disabled={isLoading || otp.join('').length !== 6 || isVerified}
                className="bg-gradient-to-b from-[#022658] from-[42.563%] to-[#1a4983] border-4 border-[rgba(15,40,71,0.15)] border-solid w-full h-[40px] rounded-[8px] flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 transition-opacity"
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <p className="font-['Satoshi',sans-serif] font-bold text-[16px] text-white">
                      Verifying...
                    </p>
                  </div>
                ) : (
                  <p className="font-['Satoshi',sans-serif] font-bold text-[16px] text-white">
                    Verify account
                  </p>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Left Side - Marketing Text */}
      <div className={`absolute left-[60px] top-[772px] w-[600px] z-10 transition-all duration-300 ${isVerified ? 'opacity-50' : ''}`}>
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

export default VerifyAccount;

