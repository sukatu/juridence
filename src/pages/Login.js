import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, LockKeyhole } from 'lucide-react';
import { apiPost, saveAuthSession } from '../utils/api';
import AuthShell from '../components/auth/AuthShell';

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setFormData((current) => ({ ...current, [name]: value }));
    if (error) setError('');
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const data = await apiPost('/auth/login', {
        ...formData,
        remember_me: rememberMe,
      }, { includeAuth: false });
      const user = data.user || {};
      const roleValue = user.role?.value || user.role;
      const userRole = roleValue || user.user_type || user.account_type;
      const userType = user.user_type;
      const isAdminUser = user.is_admin === true
        || String(roleValue || '').toLowerCase() === 'admin'
        || userType === 'administrator';

      saveAuthSession(data, { provider: 'email' });

      const redirectUrl = localStorage.getItem('redirectAfterLogin');
      if (redirectUrl) {
        localStorage.removeItem('redirectAfterLogin');
        navigate(redirectUrl);
        return;
      }

      if (isAdminUser) {
        localStorage.setItem('userRole', 'admin');
        navigate('/admin');
        return;
      }

      const isCourtRegistrar = userType === 'court_registrar'
        || user.court_type != null
        || String(user.email || '').toLowerCase().includes('registrar')
        || userRole === 'court_registrar';
      if (isCourtRegistrar) {
        localStorage.setItem('userRole', 'court_registrar');
        localStorage.setItem('userType', 'court_registrar');
        if (user.court_type) localStorage.setItem('courtType', user.court_type);
        navigate('/registrar');
        return;
      }

      const isCorporateClient = userType === 'corporate_client'
        || user.entity_type != null
        || user.entity_id != null
        || userRole === 'corporate_client';
      if (isCorporateClient) {
        localStorage.setItem('userRole', 'corporate_client');
        localStorage.setItem('userType', 'corporate_client');
        if (user.entity_type) localStorage.setItem('entityType', user.entity_type);
        if (user.entity_id) localStorage.setItem('entityId', String(user.entity_id));
        navigate('/workspace');
        return;
      }

      navigate('/workspace');
    } catch (requestError) {
      setError(requestError.message || 'Unable to sign in. Check your email and password.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthShell panelTitle="Sign in to Juridence" title="Enter your credentials" subtitle="Use the account issued by your Juridence administrator.">
      <form onSubmit={handleSubmit} className="dd-auth-form">
        {error && <div className="dd-auth-message is-error" role="alert">{error}</div>}
        <label><span>User ID / email</span><input type="email" name="email" value={formData.email} onChange={handleInputChange} placeholder="name@organisation.com" autoComplete="email" required /></label>
        <label><span>Password</span><div className="dd-auth-password"><input type={showPassword ? 'text' : 'password'} name="password" value={formData.password} onChange={handleInputChange} autoComplete="current-password" required /><button type="button" onClick={() => setShowPassword((show) => !show)} aria-label={showPassword ? 'Hide password' : 'Show password'}>{showPassword ? <EyeOff size={15} /> : <Eye size={15} />}</button></div></label>
        <label className="dd-auth-check"><input type="checkbox" checked={rememberMe} onChange={(event) => setRememberMe(event.target.checked)} /><span>Keep me signed in on this device</span></label>
        <div className="dd-auth-actions"><button type="submit" disabled={isLoading}>{isLoading ? 'Signing in...' : 'Sign in'}</button><Link to="/forgot-password">Forgot password</Link></div>
      </form>
      <div className="dd-auth-warning"><LockKeyhole size={16} /><p><strong>Authorised users only.</strong> Access to Juridence is logged and monitored. Do not share your credentials.</p></div>
      <p className="dd-auth-switch">Need an organisation account? <Link to="/signup">Register</Link></p>
    </AuthShell>
  );
};

export default Login;
