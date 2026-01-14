import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { UserPlus, Lock, Check } from 'lucide-react';

const Signup = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    password: '',
    plan: ''
  });
  const [showSuccess, setShowSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  


  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear errors when user starts typing
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      // Call the backend API
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          first_name: formData.first_name,
          last_name: formData.last_name,
          email: formData.email,
          password: formData.password
        })
      });

      const data = await response.json();

      if (response.ok) {
        // Show success message
        setShowSuccess(true);
        
        // Redirect after delay
        setTimeout(() => {
          navigate('/login?registered=1');
        }, 1500);
      } else {
        setError(data.detail || 'Registration failed. Please try again.');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
      console.error('Registration error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      {/* Header */}
      <header className="bg-slate-900 text-white">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <img 
                src="/logos/main-logo.png" 
                alt="juridence logo" 
                className="h-8 w-auto object-contain"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = "/logo.png";
                }}
              />
              <h1 className="text-xl font-bold">juridence</h1>
            </div>
            <nav className="hidden md:flex space-x-6">
              <button
                onClick={() => navigate('/')}
                className="hover:text-sky-400 transition-colors"
              >
                Home
              </button>
              <button
                onClick={() => navigate('/people')}
                className="hover:text-sky-400 transition-colors"
              >
                People Database
              </button>
              <button
                onClick={() => navigate('/people')}
                className="hover:text-sky-400 transition-colors"
              >
                Advanced Search
              </button>
              <button
                onClick={() => navigate('/about')}
                className="hover:text-sky-400 transition-colors"
              >
                About
              </button>
              <button
                onClick={() => navigate('/contact')}
                className="hover:text-sky-400 transition-colors"
              >
                Contact
              </button>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="min-h-screen bg-slate-50 py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-md mx-auto">
            <div className="bg-white rounded-xl shadow-lg p-8">
              <div className="text-center mb-8">
                <UserPlus className="h-12 w-12 text-sky-500 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-slate-900 mb-2">Create Your Account</h2>
                <p className="text-slate-600">Sign up to access our comprehensive legal database and download reports.</p>
                <p className="text-sm text-slate-500 mt-2">
                  Already have an account?{' '}
                  <Link to="/login" className="text-sky-600 hover:text-sky-700 font-medium transition-colors">
                    Sign in here
                  </Link>
                </p>
              </div>
              
              {!showSuccess ? (
                <div>
                  
                  <form onSubmit={handleSubmit} className="space-y-6">
                  {error && (
                    <div className="bg-red-50 border border-red-200 rounded-md p-4">
                      <p className="text-sm text-red-600">{error}</p>
                    </div>
                  )}
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">First Name</label>
                      <input
                        type="text"
                        name="first_name"
                        value={formData.first_name}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-colors"
                        placeholder="First name"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Last Name</label>
                      <input
                        type="text"
                        name="last_name"
                        value={formData.last_name}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-colors"
                        placeholder="Last name"
                        required
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Email</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-colors"
                      placeholder="Enter your email address"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Password</label>
                    <input
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-colors"
                      placeholder="Enter your password"
                      minLength="6"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Plan</label>
                    <select
                      name="plan"
                      value={formData.plan}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-colors"
                      required
                    >
                      <option value="">Choose a plan</option>
                      <option value="basic">Basic (per-report)</option>
                      <option value="premium">Premium (monthly)</option>
                    </select>
                  </div>
                  
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-sky-500 hover:bg-sky-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        <span>Creating Account...</span>
                      </>
                    ) : (
                      <>
                        <Lock className="h-4 w-4" />
                        <span>Create Account</span>
                      </>
                    )}
                  </button>
                </form>

                </div>
              ) : (
                <div className="text-center">
                  <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                    <Check className="h-8 w-8 text-green-600 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-green-800 mb-2">Account Created Successfully!</h3>
                    <p className="text-green-700">Please check your email to verify your account. Redirecting to login...</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Signup;
