import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CheckCircle } from 'lucide-react';
import AuthShell from '../components/auth/AuthShell';

const VerifySuccess = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = window.setTimeout(() => navigate('/login'), 3000);
    return () => window.clearTimeout(timer);
  }, [navigate]);

  return (
    <AuthShell panelTitle="Juridence registration" title="Account verified" subtitle="Your account has been successfully activated.">
      <div className="dd-auth-result">
        <CheckCircle size={30} />
        <p>You can now sign in and access the workspace assigned to your account.</p>
        <Link className="dd-auth-primary-link" to="/login">Continue to sign in</Link>
        <small>Redirecting automatically in 3 seconds.</small>
      </div>
    </AuthShell>
  );
};

export default VerifySuccess;
