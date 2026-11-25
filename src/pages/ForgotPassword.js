import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle, Mail } from 'lucide-react';
import AuthShell from '../components/auth/AuthShell';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsLoading(true);
    setError('');
    try {
      await new Promise((resolve) => setTimeout(resolve, 1500));
      setIsSubmitted(true);
    } catch (requestError) {
      setError('An error occurred. Please try again.');
      console.error('Password reset error:', requestError);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthShell
      panelTitle="Juridence account recovery"
      title={isSubmitted ? 'Check your email' : 'Reset your password'}
      subtitle={isSubmitted ? `Reset instructions were sent to ${email}.` : 'Enter the email address associated with your Juridence account.'}
      asideTitle="Recovery process"
      asideItems={['Request a secure reset link', 'Create a new password', 'Return to your workspace']}
    >
      {!isSubmitted ? (
        <form onSubmit={handleSubmit} className="dd-auth-form">
          {error && <div className="dd-auth-message is-error" role="alert">{error}</div>}
          <label><span>Email address</span><div className="dd-auth-icon-field"><input type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="name@organisation.com" autoComplete="email" required /><Mail size={15} /></div></label>
          <div className="dd-auth-actions is-block"><button type="submit" disabled={isLoading}>{isLoading ? 'Sending instructions...' : 'Send reset instructions'}</button></div>
        </form>
      ) : (
        <div className="dd-auth-result">
          <CheckCircle size={30} />
          <p>Use the secure link in the email to choose a new password. Check your spam folder if it does not arrive.</p>
          <button type="button" onClick={() => setIsSubmitted(false)}>Try another email</button>
        </div>
      )}
      <p className="dd-auth-switch"><Link to="/login">Back to sign in</Link></p>
    </AuthShell>
  );
};

export default ForgotPassword;
