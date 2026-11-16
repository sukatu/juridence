import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  ShieldCheck,
} from 'lucide-react';
import { apiPost } from '../utils/api';

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleInputChange = ({ target: { name, value } }) => {
    setFormData((current) => ({ ...current, [name]: value }));
    if (error) setError('');
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const data = await apiPost('/auth/login', formData, { includeAuth: false });
      const user = data.user;
      const roleValue = user.role?.value || user.role;
      const userRole = roleValue || user.user_type || user.account_type;
      const userType = user.user_type;

      localStorage.setItem('isAuthenticated', 'true');
      localStorage.setItem('userEmail', user.email);
      localStorage.setItem(
        'userName',
        user.first_name && user.last_name ? `${user.first_name} ${user.last_name}` : user.email.split('@')[0]
      );
      localStorage.setItem('accessToken', data.access_token);
      localStorage.setItem('userData', JSON.stringify(user));
      localStorage.setItem('authProvider', 'email');

      if (userRole) localStorage.setItem('userRole', String(userRole));
      if (userType) localStorage.setItem('userType', userType);
      localStorage.setItem('rememberMe', rememberMe ? 'true' : 'false');

      const normalizedRole = String(roleValue || '').toLowerCase();
      const isAdminUser = user.is_admin === true || normalizedRole === 'admin' || userType === 'administrator';

      if (isAdminUser) localStorage.setItem('isAdmin', 'true');
      else localStorage.removeItem('isAdmin');

      window.dispatchEvent(new CustomEvent('authStateChanged'));

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

      const isCourtRegistrar =
        userType === 'court_registrar' ||
        user.court_type != null ||
        user.email?.toLowerCase().includes('registrar') ||
        userRole === 'court_registrar';

      if (isCourtRegistrar) {
        localStorage.setItem('userRole', 'court_registrar');
        localStorage.setItem('userType', 'court_registrar');
        if (user.court_type) localStorage.setItem('courtType', user.court_type);
        navigate('/registrar');
        return;
      }

      const isCorporateClient =
        userType === 'corporate_client' ||
        user.entity_type != null ||
        user.entity_id != null ||
        userRole === 'corporate_client';

      if (isCorporateClient) {
        localStorage.setItem('userRole', 'corporate_client');
        localStorage.setItem('userType', 'corporate_client');
        if (user.entity_type) localStorage.setItem('entityType', user.entity_type);
        if (user.entity_id) localStorage.setItem('entityId', String(user.entity_id));
        navigate('/corporate');
        return;
      }

      navigate('/');
    } catch (err) {
      setError(err.message || 'We could not sign you in. Check your details and try again.');
      console.error('Login error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#eef3f4] lg:grid lg:grid-cols-[minmax(0,1.05fr)_minmax(520px,0.95fr)]">
      <section className="relative hidden min-h-screen overflow-hidden bg-[#071b2f] text-white lg:block">
        <img
          src="/courts/high-court-.jpg"
          alt="Court building"
          className="absolute inset-0 h-full w-full object-cover opacity-55"
        />
        <div className="absolute inset-0 bg-[rgba(7,27,47,0.68)]" />

        <div className="relative z-10 flex min-h-screen flex-col justify-between p-12 xl:p-16">
          <Link to="/" aria-label="Juridence home">
            <img src="/logos/logo-white.png" alt="Juridence" className="h-9 w-auto" />
          </Link>

          <div className="max-w-[560px] pb-10">
            <div className="mb-6 flex h-11 w-11 items-center justify-center rounded-md bg-[#23a36d]">
              <ShieldCheck size={22} />
            </div>
            <h1 className="text-[44px] font-semibold leading-[1.12] tracking-normal xl:text-[52px]">
              Legal intelligence for decisions that matter.
            </h1>
            <p className="mt-5 max-w-[500px] text-lg leading-8 text-white/75">
              Access connected litigation records, entity profiles and due diligence insights in one secure workspace.
            </p>
            <div className="mt-8 flex flex-wrap gap-x-6 gap-y-3 text-sm text-white/75">
              {['Verified access', 'Structured legal records', 'Secure workspace'].map((item) => (
                <span key={item} className="flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-[#9ce0c4]" /> {item}
                </span>
              ))}
            </div>
          </div>

          <p className="text-xs text-white/50">Juridence legal intelligence platform</p>
        </div>
      </section>

      <section className="flex min-h-screen flex-col bg-white">
        <header className="flex h-20 items-center justify-between border-b border-[#e2e9ec] px-5 sm:px-10 lg:border-b-0">
          <Link to="/" className="lg:hidden" aria-label="Juridence home">
            <img src="/logos/main-logo.png" alt="Juridence" className="h-8 w-auto" />
          </Link>
          <button
            type="button"
            onClick={() => navigate('/')}
            className="ml-auto inline-flex items-center gap-2 text-sm font-semibold text-[#526773] transition-colors hover:text-[#0b2942]"
          >
            <ArrowLeft size={17} /> Back to website
          </button>
        </header>

        <div className="flex flex-1 items-center justify-center px-5 py-10 sm:px-10 lg:px-14">
          <div className="w-full max-w-[470px]">
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#17875a]">Secure account access</p>
            <h2 className="mt-3 text-3xl font-semibold text-[#0b2942] sm:text-4xl">Welcome back</h2>
            <p className="mt-3 text-[15px] leading-6 text-[#687983]">Sign in to continue to your Juridence workspace.</p>

            <form onSubmit={handleSubmit} className="mt-8 space-y-5">
              {error && (
                <div role="alert" className="border-l-4 border-[#c83d4d] bg-[#fff2f3] px-4 py-3 text-sm leading-5 text-[#9f2635]">
                  {error}
                </div>
              )}

              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-[#20384c]">Email address</span>
                <span className="flex h-12 items-center gap-3 rounded-md border border-[#bdcbd1] bg-white px-4 transition-colors focus-within:border-[#17875a] focus-within:ring-2 focus-within:ring-[#17875a]/15">
                  <Mail size={18} className="shrink-0 text-[#71838d]" />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    autoComplete="email"
                    placeholder="name@organisation.com"
                    className="min-w-0 flex-1 bg-transparent text-[15px] text-[#102033] outline-none placeholder:text-[#8b989f]"
                    required
                  />
                </span>
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-[#20384c]">Password</span>
                <span className="flex h-12 items-center gap-3 rounded-md border border-[#bdcbd1] bg-white px-4 transition-colors focus-within:border-[#17875a] focus-within:ring-2 focus-within:ring-[#17875a]/15">
                  <LockKeyhole size={18} className="shrink-0 text-[#71838d]" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    autoComplete="current-password"
                    placeholder="Enter your password"
                    className="min-w-0 flex-1 bg-transparent text-[15px] text-[#102033] outline-none placeholder:text-[#8b989f]"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((visible) => !visible)}
                    className="text-[#71838d] hover:text-[#0b2942]"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </span>
              </label>

              <div className="flex items-center justify-between gap-4 text-sm">
                <label className="flex cursor-pointer items-center gap-2 text-[#526773]">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(event) => setRememberMe(event.target.checked)}
                    className="h-4 w-4 rounded border-[#9aabb3] text-[#17875a] focus:ring-[#17875a]"
                  />
                  Remember me
                </label>
                <Link to="/forgot-password" className="font-semibold text-[#0c6b4a] hover:text-[#084b36]">Forgot password?</Link>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-md bg-[#0b2942] px-5 text-sm font-bold text-white transition-colors hover:bg-[#123b5b] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isLoading ? (
                  <><span className="h-4 w-4 animate-spin rounded-full border-2 border-white/35 border-t-white" /> Signing in...</>
                ) : (
                  <>Sign in <ArrowRight size={17} /></>
                )}
              </button>
            </form>

            <div className="mt-8 border-t border-[#e2e9ec] pt-6 text-center text-sm text-[#687983]">
              New to Juridence?{' '}
              <Link to="/select-role" className="font-bold text-[#0b2942] hover:text-[#0c6b4a]">Request an account</Link>
            </div>

            <p className="mt-8 flex items-center justify-center gap-2 text-xs text-[#829099]">
              <ShieldCheck size={14} /> Your session is protected and encrypted.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
};

export default Login;
