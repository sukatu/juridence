import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Lock, Eye, EyeOff, CheckCircle, AlertCircle, ArrowLeft } from 'lucide-react';

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');
  const [token, setToken] = useState('');

  useEffect(() => {
    const tokenParam = searchParams.get('token');
    if (tokenParam) {
      setToken(tokenParam);
    } else {
      setError('Invalid or missing reset token. Please request a new password reset.');
    }
  }, [searchParams]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (error) setError('');
  };

  const validatePassword = (password) => {
    const minLength = 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    return {
      isValid: password.length >= minLength && hasUpperCase && hasLowerCase && hasNumbers && hasSpecialChar,
      errors: [
        password.length < minLength && `At least ${minLength} characters`,
        !hasUpperCase && 'One uppercase letter',
        !hasLowerCase && 'One lowercase letter',
        !hasNumbers && 'One number',
        !hasSpecialChar && 'One special character'
      ].filter(Boolean)
    };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      // Validate passwords match
      if (formData.password !== formData.confirmPassword) {
        setError('Passwords do not match.');
        setIsLoading(false);
        return;
      }

      // Validate password strength
      const passwordValidation = validatePassword(formData.password);
      if (!passwordValidation.isValid) {
        setError(`Password must meet the following requirements: ${passwordValidation.errors.join(', ')}`);
        setIsLoading(false);
        return;
      }

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Mock success - in real app, this would validate the token and update password
      setIsSuccess(true);
    } catch (err) {
      setError('An error occurred while resetting your password. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const passwordValidation = validatePassword(formData.password);

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10 text-center">
            <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-slate-900 mb-2">
              Password reset successful!
            </h2>
            <p className="text-slate-600 mb-6">
              Your password has been successfully updated. You can now sign in with your new password.
            </p>
            <Link
              to="/login"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-sky-600 hover:bg-sky-700 transition-colors"
            >
              Continue to sign in
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className="h-12 w-12 rounded-full bg-sky-100 flex items-center justify-center">
            <Lock className="h-6 w-6 text-sky-600" />
          </div>
        </div>
        <h2 className="mt-6 text-center text-3xl font-bold text-slate-900">
          Reset your password
        </h2>
        <p className="mt-2 text-center text-sm text-slate-600">
          Enter your new password below.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {!token ? (
            <div className="text-center">
              <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-red-800 mb-2">
                Invalid reset link
              </h3>
              <p className="text-red-700 mb-6">
                This password reset link is invalid or has expired. Please request a new one.
              </p>
              <Link
                to="/forgot-password"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-sky-600 hover:bg-sky-700 transition-colors"
              >
                Request new reset link
              </Link>
            </div>
          ) : (
            <form className="space-y-6" onSubmit={handleSubmit}>
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-md p-4">
                  <div className="flex">
                    <AlertCircle className="h-5 w-5 text-red-400 mr-2" />
                    <p className="text-sm text-red-600">{error}</p>
                  </div>
                </div>
              )}

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-slate-700">
                  New password
                </label>
                <div className="mt-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-slate-400" />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    required
                    value={formData.password}
                    onChange={handleInputChange}
                    className="appearance-none block w-full pl-10 pr-10 py-2 border border-slate-300 rounded-md placeholder-slate-400 focus:outline-none focus:ring-sky-500 focus:border-sky-500 sm:text-sm"
                    placeholder="Enter your new password"
                  />
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                    <button
                      type="button"
                      className="text-slate-400 hover:text-slate-500 focus:outline-none focus:text-slate-500"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-5 w-5" />
                      ) : (
                        <Eye className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                </div>
                
                {/* Password strength indicator */}
                {formData.password && (
                  <div className="mt-2">
                    <div className="text-xs text-slate-600 mb-1">Password requirements:</div>
                    <div className="space-y-1">
                      {passwordValidation.errors.map((requirement, index) => (
                        <div key={index} className="flex items-center text-xs">
                          <div className={`w-2 h-2 rounded-full mr-2 ${
                            passwordValidation.isValid ? 'bg-green-500' : 'bg-red-500'
                          }`}></div>
                          <span className={passwordValidation.isValid ? 'text-green-600' : 'text-red-600'}>
                            {requirement}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-slate-700">
                  Confirm new password
                </label>
                <div className="mt-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-slate-400" />
                  </div>
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    required
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    className="appearance-none block w-full pl-10 pr-10 py-2 border border-slate-300 rounded-md placeholder-slate-400 focus:outline-none focus:ring-sky-500 focus:border-sky-500 sm:text-sm"
                    placeholder="Confirm your new password"
                  />
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                    <button
                      type="button"
                      className="text-slate-400 hover:text-slate-500 focus:outline-none focus:text-slate-500"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-5 w-5" />
                      ) : (
                        <Eye className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                </div>
                
                {/* Password match indicator */}
                {formData.confirmPassword && (
                  <div className="mt-1 flex items-center text-xs">
                    <div className={`w-2 h-2 rounded-full mr-2 ${
                      formData.password === formData.confirmPassword ? 'bg-green-500' : 'bg-red-500'
                    }`}></div>
                    <span className={formData.password === formData.confirmPassword ? 'text-green-600' : 'text-red-600'}>
                      {formData.password === formData.confirmPassword ? 'Passwords match' : 'Passwords do not match'}
                    </span>
                  </div>
                )}
              </div>

              <div>
                <button
                  type="submit"
                  disabled={isLoading || !passwordValidation.isValid || formData.password !== formData.confirmPassword}
                  className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-sky-600 hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isLoading ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Updating password...
                    </div>
                  ) : (
                    <div className="flex items-center">
                      <Lock className="h-4 w-4 mr-2" />
                      Update password
                    </div>
                  )}
                </button>
              </div>
            </form>
          )}

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-slate-500">Remember your password?</span>
              </div>
            </div>

            <div className="mt-6 text-center">
              <Link
                to="/login"
                className="inline-flex items-center text-sm font-medium text-sky-600 hover:text-sky-500 transition-colors"
              >
                <ArrowLeft className="h-4 w-4 mr-1" />
                Back to sign in
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
