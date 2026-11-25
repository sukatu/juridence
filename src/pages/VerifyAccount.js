import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle } from 'lucide-react';
import { apiPost } from '../utils/api';
import AuthShell from '../components/auth/AuthShell';

const VerifyAccount = () => {
  const navigate = useNavigate();
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [countdown, setCountdown] = useState(120);
  const [canResend, setCanResend] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const inputRefs = useRef([]);

  useEffect(() => {
    const pendingEmail = localStorage.getItem('pendingVerificationEmail');
    if (pendingEmail) setEmail(pendingEmail);
    else navigate('/create-account');
  }, [navigate]);

  useEffect(() => {
    if (countdown <= 0) {
      setCanResend(true);
      return undefined;
    }
    const timer = window.setTimeout(() => setCountdown((value) => value - 1), 1000);
    return () => window.clearTimeout(timer);
  }, [countdown]);

  const handleOtpChange = (index, value) => {
    if (value && !/^\d$/.test(value)) return;
    setOtp((current) => current.map((digit, digitIndex) => digitIndex === index ? value : digit));
    setError('');
    if (value && index < 5) inputRefs.current[index + 1]?.focus();
  };

  const handleKeyDown = (index, event) => {
    if (event.key === 'Backspace' && !otp[index] && index > 0) inputRefs.current[index - 1]?.focus();
    if (event.key === 'v' && (event.ctrlKey || event.metaKey)) {
      event.preventDefault();
      navigator.clipboard.readText().then((text) => {
        const digits = text.replace(/\D/g, '').slice(0, 6).split('');
        setOtp((current) => current.map((digit, digitIndex) => digits[digitIndex] || digit));
        inputRefs.current[Math.min(Math.max(digits.length - 1, 0), 5)]?.focus();
      });
    }
  };

  const handleVerify = async (event) => {
    event.preventDefault();
    const verificationCode = otp.join('');
    if (verificationCode.length !== 6) {
      setError('Please enter the complete 6-digit code');
      return;
    }
    setIsLoading(true);
    setError('');
    try {
      const response = await apiPost('/auth/verify-email', { email, verification_code: verificationCode }, { includeAuth: false });
      if (response) {
        setIsVerified(true);
        localStorage.removeItem('pendingVerificationEmail');
        localStorage.removeItem('selectedRole');
        localStorage.setItem('onboardingCompleted', 'true');
        window.setTimeout(() => navigate('/verify-success'), 3000);
      }
    } catch (requestError) {
      setError(requestError.response?.data?.detail || 'Invalid verification code. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    if (!canResend) return;
    setIsLoading(true);
    setError('');
    try {
      await apiPost('/auth/resend-verification-code', { email }, { includeAuth: false });
      setCountdown(120);
      setCanResend(false);
      setOtp(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } catch (requestError) {
      setError('Failed to resend code. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const timeRemaining = `${String(Math.floor(countdown / 60)).padStart(2, '0')}:${String(countdown % 60).padStart(2, '0')}`;
  if (!email) return null;

  return (
    <AuthShell
      panelTitle="Verify Juridence account"
      title={isVerified ? 'Account verified' : 'Enter your verification code'}
      subtitle={isVerified ? 'Your account is ready. Redirecting you now.' : <>A six-digit code was sent to <strong>{email}</strong>.</>}
      asideTitle="Registration steps"
      asideItems={['Account details received', 'Verify your email address', 'Access your assigned workspace']}
    >
      {isVerified ? (
        <div className="dd-auth-result"><CheckCircle size={30} /><p>Verification completed successfully. Your Juridence account is now active.</p></div>
      ) : (
        <form onSubmit={handleVerify} className="dd-auth-form">
          {error && <div className="dd-auth-message is-error" role="alert">{error}</div>}
          <fieldset className="dd-otp-group">
            <legend>Verification code</legend>
            <div>{otp.map((digit, index) => <input key={index} ref={(element) => { inputRefs.current[index] = element; }} aria-label={`Digit ${index + 1}`} inputMode="numeric" maxLength={1} value={digit} onChange={(event) => handleOtpChange(index, event.target.value)} onKeyDown={(event) => handleKeyDown(index, event)} />)}</div>
          </fieldset>
          <div className="dd-auth-inline-note">Code expires in <strong>{timeRemaining}</strong>. <button type="button" onClick={handleResend} disabled={!canResend || isLoading}>Resend code</button></div>
          <div className="dd-auth-actions is-block"><button type="submit" disabled={isLoading || otp.join('').length !== 6}>{isLoading ? 'Verifying...' : 'Verify account'}</button></div>
        </form>
      )}
    </AuthShell>
  );
};

export default VerifyAccount;
