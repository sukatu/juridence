import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { AlertCircle, Check, CheckCircle, Eye, EyeOff } from 'lucide-react';
import AuthShell from '../components/auth/AuthShell';

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const [formData, setFormData] = useState({ password: '', confirmPassword: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');
  const [token, setToken] = useState('');

  useEffect(() => {
    const tokenParam = searchParams.get('token');
    if (tokenParam) setToken(tokenParam);
    else setError('Invalid or missing reset token. Please request a new password reset.');
  }, [searchParams]);

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setFormData((current) => ({ ...current, [name]: value }));
    if (error) setError('');
  };

  const requirements = [
    { label: 'At least 8 characters', met: formData.password.length >= 8 },
    { label: 'One uppercase letter', met: /[A-Z]/.test(formData.password) },
    { label: 'One lowercase letter', met: /[a-z]/.test(formData.password) },
    { label: 'One number', met: /\d/.test(formData.password) },
    { label: 'One special character', met: /[!@#$%^&*(),.?":{}|<>]/.test(formData.password) },
  ];
  const isPasswordValid = requirements.every((requirement) => requirement.met);
  const passwordsMatch = Boolean(formData.confirmPassword) && formData.password === formData.confirmPassword;

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsLoading(true);
    setError('');
    try {
      if (!passwordsMatch) throw new Error('Passwords do not match.');
      if (!isPasswordValid) throw new Error('Your password does not meet all security requirements.');
      await new Promise((resolve) => setTimeout(resolve, 1500));
      setIsSuccess(true);
    } catch (requestError) {
      setError(requestError.message || 'An error occurred while resetting your password.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthShell
      panelTitle="Juridence account recovery"
      title={isSuccess ? 'Password updated' : 'Create a new password'}
      subtitle={isSuccess ? 'Your new credentials are ready to use.' : 'Choose a strong password for your Juridence account.'}
      asideTitle="Password security"
      asideItems={['Use a unique account password', 'Meet every strength requirement', 'Sign in again after updating']}
    >
      {isSuccess ? (
        <div className="dd-auth-result">
          <CheckCircle size={30} />
          <p>Your password was updated successfully. You can now return to the secure sign-in screen.</p>
          <Link className="dd-auth-primary-link" to="/login">Continue to sign in</Link>
        </div>
      ) : !token ? (
        <div className="dd-auth-result is-error">
          <AlertCircle size={30} />
          <p>This reset link is invalid or has expired.</p>
          <Link className="dd-auth-primary-link" to="/forgot-password">Request a new reset link</Link>
        </div>
      ) : (
        <form className="dd-auth-form" onSubmit={handleSubmit}>
          {error && <div className="dd-auth-message is-error" role="alert">{error}</div>}
          <label><span>New password</span><div className="dd-auth-password"><input name="password" type={showPassword ? 'text' : 'password'} autoComplete="new-password" value={formData.password} onChange={handleInputChange} required /><button type="button" onClick={() => setShowPassword((show) => !show)} aria-label={showPassword ? 'Hide password' : 'Show password'}>{showPassword ? <EyeOff size={15} /> : <Eye size={15} />}</button></div></label>
          <label><span>Confirm new password</span><div className="dd-auth-password"><input name="confirmPassword" type={showConfirmPassword ? 'text' : 'password'} autoComplete="new-password" value={formData.confirmPassword} onChange={handleInputChange} required /><button type="button" onClick={() => setShowConfirmPassword((show) => !show)} aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}>{showConfirmPassword ? <EyeOff size={15} /> : <Eye size={15} />}</button></div></label>
          <ul className="dd-password-rules">
            {requirements.map((requirement) => <li key={requirement.label} className={requirement.met ? 'is-met' : ''}><Check size={12} /> {requirement.label}</li>)}
            <li className={passwordsMatch ? 'is-met' : ''}><Check size={12} /> Passwords match</li>
          </ul>
          <div className="dd-auth-actions is-block"><button type="submit" disabled={isLoading || !isPasswordValid || !passwordsMatch}>{isLoading ? 'Updating password...' : 'Update password'}</button></div>
        </form>
      )}
      {!isSuccess && <p className="dd-auth-switch"><Link to="/login">Back to sign in</Link></p>}
    </AuthShell>
  );
};

export default ResetPassword;
