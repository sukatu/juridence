import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, User, Mail, Eye, EyeOff, Phone, Search, X, ChevronDown } from 'lucide-react';
import { apiGet } from '../utils/api';

const CreateAccountOnboard = () => {
  const navigate = useNavigate();
  const selectedRole = localStorage.getItem('selectedRole') || '';
  
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    password: '',
    agreeToTerms: false,
    countryCode: '+233',
    countryFlag: '🇬🇭',
    courtType: '', // For court registrar role
    entityType: '', // For corporate client: 'company', 'bank', 'insurance'
    entityId: null, // ID of selected entity
    entityName: '' // Name of selected entity for display
  });
  
  const courtTypes = [
    { id: 'high_court', label: 'High Court' },
    { id: 'supreme_court', label: 'Supreme Court' },
    { id: 'court_of_appeal', label: 'Court of Appeal' }
  ];
  
  const countries = [
    { code: '+233', flag: '🇬🇭', name: 'Ghana' },
    { code: '+234', flag: '🇳🇬', name: 'Nigeria' },
    { code: '+254', flag: '🇰🇪', name: 'Kenya' },
    { code: '+27', flag: '🇿🇦', name: 'South Africa' },
    { code: '+1', flag: '🇺🇸', name: 'United States' },
    { code: '+44', flag: '🇬🇧', name: 'United Kingdom' }
  ];
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [entitySearchQuery, setEntitySearchQuery] = useState('');
  const [entitySearchResults, setEntitySearchResults] = useState([]);
  const [showEntityDropdown, setShowEntityDropdown] = useState(false);
  const [isSearchingEntities, setIsSearchingEntities] = useState(false);
  const entitySearchTimeoutRef = useRef(null);
  const entityDropdownRef = useRef(null);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    if (error) setError('');
  };

  // Search for corporate entities with debouncing
  useEffect(() => {
    if (selectedRole !== 'corporate_client') {
      setEntitySearchResults([]);
      return;
    }

    if (!entitySearchQuery || entitySearchQuery.trim().length < 2) {
      setEntitySearchResults([]);
      return;
    }

    // Clear previous timeout
    if (entitySearchTimeoutRef.current) {
      clearTimeout(entitySearchTimeoutRef.current);
    }

    setIsSearchingEntities(true);
    
    // Debounce search by 300ms
    entitySearchTimeoutRef.current = setTimeout(async () => {
      try {
        const results = await apiGet(`/corporate-entities/search?query=${encodeURIComponent(entitySearchQuery.trim())}&limit=20`, { includeAuth: false });
        setEntitySearchResults(results || []);
      } catch (err) {
        console.error('Error searching entities:', err);
        setEntitySearchResults([]);
      } finally {
        setIsSearchingEntities(false);
      }
    }, 300);

    return () => {
      if (entitySearchTimeoutRef.current) {
        clearTimeout(entitySearchTimeoutRef.current);
      }
    };
  }, [entitySearchQuery, selectedRole]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (entityDropdownRef.current && !entityDropdownRef.current.contains(event.target)) {
        setShowEntityDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleEntitySelect = (entity) => {
    setFormData(prev => ({
      ...prev,
      entityType: entity.type,
      entityId: entity.id,
      entityName: entity.name
    }));
    setEntitySearchQuery(entity.name);
    setShowEntityDropdown(false);
    setEntitySearchResults([]);
    if (error) setError('');
  };

  const handleEntitySearchChange = (e) => {
    const value = e.target.value;
    setEntitySearchQuery(value);
    setShowEntityDropdown(true);
    
    // If cleared, also clear selection
    if (!value) {
      setFormData(prev => ({
        ...prev,
        entityType: '',
        entityId: null,
        entityName: ''
      }));
    }
  };

  const clearEntitySelection = () => {
    setEntitySearchQuery('');
    setFormData(prev => ({
      ...prev,
      entityType: '',
      entityId: null,
      entityName: ''
    }));
    setEntitySearchResults([]);
    setShowEntityDropdown(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    // Client-side validation
    if (!formData.name || formData.name.trim().length < 2) {
      setError('Name must be at least 2 characters long');
      return;
    }
    
    if (!formData.password || formData.password.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }
    
    if (!formData.agreeToTerms) {
      setError('Please agree to the Terms and Privacy policies');
      return;
    }
    
    // Validate court type if court registrar is selected
    if (selectedRole === 'court_registrar' && !formData.courtType) {
      setError('Please select a court type');
      return;
    }
    
    // Validate entity selection if corporate client is selected
    if (selectedRole === 'corporate_client' && (!formData.entityId || !formData.entityType)) {
      setError('Please select a company, bank, or insurance');
      return;
    }

    setIsLoading(true);
    
    try {
      // Split name into first and last name
      const nameParts = formData.name.trim().split(/\s+/);
      const first_name = nameParts[0] || '';
      const last_name = nameParts.slice(1).join(' ') || nameParts[0] || ''; // Use first name as last if only one name provided
      
      // Ensure names are at least 2 characters (backend requirement)
      if (first_name.length < 2) {
        setError('First name must be at least 2 characters long');
        setIsLoading(false);
        return;
      }
      if (last_name.length < 2) {
        setError('Please provide both first and last name (at least 2 characters each)');
        setIsLoading(false);
        return;
      }
      
      // Prepare registration data
      const registrationData = {
        first_name: first_name,
        last_name: last_name,
        email: formData.email.trim(),
        phone_number: formData.phone ? `${formData.countryCode}${formData.phone}` : undefined,
        password: formData.password,
        role: selectedRole, // Include the selected role from SelectRole page
        court_type: selectedRole === 'court_registrar' ? formData.courtType : undefined, // Include court type if court registrar
        entity_type: selectedRole === 'corporate_client' ? formData.entityType : undefined, // Include entity type if corporate client
        entity_id: selectedRole === 'corporate_client' ? formData.entityId : undefined // Include entity ID if corporate client
      };

      console.log('Registration data with role:', { ...registrationData, password: '***' });

      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(registrationData)
      });

      let data;
      // Clone the response so we can read it multiple times if needed
      const responseClone = response.clone();
      try {
        data = await response.json();
      } catch (jsonError) {
        // If JSON parsing fails, try reading as text from the cloned response
        try {
          const text = await responseClone.text();
          console.error('Failed to parse response:', text, jsonError);
          setError(`Registration failed: ${text || response.statusText || 'Unknown error'}`);
        } catch (textError) {
          console.error('Failed to read response:', textError);
          setError(`Registration failed: ${response.statusText || 'Unknown error'}`);
        }
        setIsLoading(false);
        return;
      }
      
      console.log('Registration response:', response.status, data);

      if (response.ok) {
        // Store user email for verification
        localStorage.setItem('pendingVerificationEmail', formData.email);
        // Navigate to verification page
        navigate('/verify-account');
      } else {
        // Handle different error formats
        let errorMessage = 'Registration failed. Please try again.';
        if (data.detail) {
          errorMessage = Array.isArray(data.detail) 
            ? data.detail.map(err => err.msg || err).join(', ')
            : data.detail;
        } else if (data.message) {
          errorMessage = data.message;
        }
        setError(errorMessage);
      }
    } catch (err) {
      console.error('Registration error:', err);
      setError(err.message || 'An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    // Handle Google OAuth
    console.log('Google login');
  };

  const handleFacebookLogin = () => {
    // Handle Facebook OAuth
    console.log('Facebook login');
  };

  const handleAppleLogin = () => {
    // Handle Apple OAuth
    console.log('Apple login');
  };

  // Redirect to select role if no role selected
  if (!selectedRole) {
    navigate('/select-role');
    return null;
  }

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
        <img 
          src="/logos/logo-white.png" 
          alt="Juridence Logo" 
          className="h-[36px] w-auto"
        />
        <Link
          to="/"
          className="flex items-center gap-2 text-white hover:opacity-80 transition-opacity"
        >
          <ArrowLeft className="h-6 w-6" />
          <p className="font-['Poppins',sans-serif] text-[20px]">Back to Website</p>
        </Link>
      </div>

      {/* Right Side - Onboarding Card */}
      <div className="absolute right-[20px] top-1/2 -translate-y-1/2 z-10">
        <div className="bg-white rounded-[8px] w-[660px] h-[984px] px-[60px] py-0 flex flex-col justify-center gap-[38px]">
          <form onSubmit={handleSubmit} className="flex flex-col gap-[32px] w-full">
            {/* Header */}
            <div className="flex flex-col gap-[8px] h-[82px]">
              <p className="font-['Poppins',sans-serif] font-bold text-[32px] leading-normal text-[#050f1c]">
                Create an account
              </p>
              <p className="font-['Satoshi',sans-serif] text-[16px] leading-normal text-[#050f1c] opacity-75">
                Enter your details below
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-[8px] p-4">
                <p className="font-['Satoshi',sans-serif] text-[14px] text-red-600">{error}</p>
              </div>
            )}

            {/* Form Fields */}
            <div className="flex flex-col gap-[24px]">
              {/* Name Field */}
              <div className="flex flex-col gap-[8px] w-full">
                <p className="font-['Satoshi',sans-serif] font-bold text-[14px] text-[#050f1c]">
                  Name
                </p>
                <div className="border border-[#b1b9c6] border-solid rounded-[8px] h-[48px] px-[16px] py-[12px] flex items-center justify-between">
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Name goes here"
                    className="flex-1 font-['Satoshi',sans-serif] text-[14px] text-[#525866] outline-none border-none bg-transparent"
                    required
                  />
                  <User className="w-[10.667px] h-[10.667px] text-[#525866]" />
                </div>
              </div>

              {/* Corporate Entity Searchable Select - Only shown for Corporate Client */}
              {selectedRole === 'corporate_client' && (
                <div className="flex flex-col gap-[8px] w-full" ref={entityDropdownRef}>
                  <p className="font-['Satoshi',sans-serif] font-bold text-[14px] text-[#050f1c]">
                    Company / Bank / Insurance <span className="text-red-500">*</span>
                  </p>
                  <div className="relative">
                    <div className="border border-[#b1b9c6] border-solid rounded-[8px] h-[48px] px-[16px] py-[12px] flex items-center justify-between">
                      <div className="flex items-center gap-[8px] flex-1">
                        <Search className="w-4 h-4 text-[#525866] flex-shrink-0" />
                        <input
                          type="text"
                          value={entitySearchQuery}
                          onChange={handleEntitySearchChange}
                          onFocus={() => setShowEntityDropdown(true)}
                          placeholder={formData.entityName || "Search for company, bank, or insurance..."}
                          className="flex-1 font-['Satoshi',sans-serif] text-[14px] text-[#525866] outline-none border-none bg-transparent"
                          required={selectedRole === 'corporate_client'}
                        />
                      </div>
                      {formData.entityId && (
                        <button
                          type="button"
                          onClick={clearEntitySelection}
                          className="text-[#525866] hover:text-[#050f1c] transition-colors ml-2"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                      {!formData.entityId && (
                        <ChevronDown className="w-4 h-4 text-[#525866] flex-shrink-0" />
                      )}
                    </div>

                    {/* Dropdown Results */}
                    {showEntityDropdown && (
                      <div className="absolute z-50 w-full mt-1 bg-white border border-[#b1b9c6] border-solid rounded-[8px] shadow-lg max-h-[300px] overflow-y-auto">
                        {isSearchingEntities ? (
                          <div className="p-4 text-center text-[#525866] font-['Satoshi',sans-serif] text-[14px]">
                            Searching...
                          </div>
                        ) : entitySearchResults.length > 0 ? (
                          entitySearchResults.map((entity) => (
                            <button
                              key={`${entity.type}-${entity.id}`}
                              type="button"
                              onClick={() => handleEntitySelect(entity)}
                              className="w-full px-[16px] py-[12px] text-left hover:bg-slate-50 transition-colors border-b border-[#b1b9c6] last:border-b-0"
                            >
                              <div className="flex flex-col gap-[4px]">
                                <p className="font-['Satoshi',sans-serif] font-medium text-[14px] text-[#050f1c]">
                                  {entity.name}
                                </p>
                                <p className="font-['Satoshi',sans-serif] text-[12px] text-[#525866] capitalize">
                                  {entity.type}
                                  {entity.short_name && ` • ${entity.short_name}`}
                                </p>
                              </div>
                            </button>
                          ))
                        ) : entitySearchQuery.length >= 2 ? (
                          <div className="p-4 text-center text-[#525866] font-['Satoshi',sans-serif] text-[14px]">
                            No results found
                          </div>
                        ) : entitySearchQuery.length > 0 ? (
                          <div className="p-4 text-center text-[#525866] font-['Satoshi',sans-serif] text-[14px]">
                            Type at least 2 characters to search
                          </div>
                        ) : null}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Court Type Field - Only shown for Court Registrar */}
              {selectedRole === 'court_registrar' && (
                <div className="flex flex-col gap-[8px] w-full">
                  <p className="font-['Satoshi',sans-serif] font-bold text-[14px] text-[#050f1c]">
                    Court Type <span className="text-red-500">*</span>
                  </p>
                  <div className="border border-[#b1b9c6] border-solid rounded-[8px] h-[48px] px-[16px] py-[12px] flex items-center justify-between relative">
                    <select
                      name="courtType"
                      value={formData.courtType}
                      onChange={handleInputChange}
                      className="flex-1 font-['Satoshi',sans-serif] text-[14px] text-[#525866] outline-none border-none bg-transparent appearance-none cursor-pointer"
                      required={selectedRole === 'court_registrar'}
                    >
                      <option value="">Select court type</option>
                      {courtTypes.map((court) => (
                        <option key={court.id} value={court.id}>
                          {court.label}
                        </option>
                      ))}
                    </select>
                    <svg className="w-4 h-4 text-[#525866] pointer-events-none absolute right-[16px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              )}

              {/* Phone Field */}
              <div className="flex flex-col gap-[8px] w-full">
                <p className="font-['Satoshi',sans-serif] font-bold text-[14px] text-[#050f1c]">
                  Phone
                </p>
                <div className="border border-[#b1b9c6] border-solid rounded-[8px] h-[48px] px-[16px] py-[12px] flex items-center gap-[10px]">
                  <div className="relative flex items-center gap-[4px]">
                    <span className="text-[20px]">{formData.countryFlag}</span>
                    <select
                      name="countryCode"
                      value={formData.countryCode}
                      onChange={(e) => {
                        const selectedCountry = countries.find(c => c.code === e.target.value);
                        setFormData({
                          ...formData,
                          countryCode: e.target.value,
                          countryFlag: selectedCountry?.flag || '🇬🇭'
                        });
                      }}
                      className="font-['Satoshi',sans-serif] text-[14px] text-[#022658] outline-none border-none bg-transparent appearance-none cursor-pointer"
                    >
                      {countries.map((country) => (
                        <option key={country.code} value={country.code}>
                          {country.code}
                        </option>
                      ))}
                    </select>
                    <p className="font-['Satoshi',sans-serif] text-[14px] text-[#022658]">|</p>
                  </div>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="Phone number"
                    className="flex-1 font-['Satoshi',sans-serif] text-[14px] text-[#525866] outline-none border-none bg-transparent"
                  />
                </div>
              </div>

              {/* Email Field */}
              <div className="flex flex-col gap-[8px] w-full">
                <p className="font-['Satoshi',sans-serif] font-bold text-[14px] text-[#050f1c]">
                  E-mail
                </p>
                <div className="border border-[#b1b9c6] border-solid rounded-[8px] h-[48px] px-[16px] py-[12px] flex items-center justify-between">
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="E-mail goes here"
                    className="flex-1 font-['Satoshi',sans-serif] text-[14px] text-[#525866] outline-none border-none bg-transparent"
                    required
                  />
                  <Mail className="w-[10.667px] h-[10.667px] text-[#525866]" />
                </div>
              </div>

              {/* Password Field */}
              <div className="flex flex-col gap-[8px] w-full">
                <p className="font-['Satoshi',sans-serif] font-bold text-[14px] text-[#050f1c]">
                  Password
                </p>
                <div className="border border-[#b1b9c6] border-solid rounded-[8px] h-[48px] px-[16px] py-[12px] flex items-center justify-between">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    placeholder="Password"
                    className="flex-1 font-['Satoshi',sans-serif] text-[14px] text-[#525866] outline-none border-none bg-transparent"
                    required
                    minLength={8}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="w-4 h-4 text-[#525866] hover:text-[#050f1c] transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>

                {/* Terms Checkbox */}
                <div className="flex gap-[4px] items-center">
                  <input
                    type="checkbox"
                    name="agreeToTerms"
                    checked={formData.agreeToTerms}
                    onChange={handleInputChange}
                    className="w-4 h-4 border-[#b1b9c6] rounded text-[#022658] focus:ring-[#022658]"
                    required
                  />
                  <p className="font-['Satoshi',sans-serif] text-[12px] text-[#050f1c]">
                    I agree to all{' '}
                    <Link to="/terms" className="font-bold text-amber-500 hover:underline">
                      Terms
                    </Link>
                    {' '}and{' '}
                    <Link to="/privacy" className="font-bold text-amber-500 hover:underline">
                      Privacy policies
                    </Link>
                    .
                  </p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col gap-[32px] w-full">
              {/* Create Account Button */}
              <div className="flex flex-col gap-[16px] items-center w-full">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="bg-gradient-to-b from-[#022658] from-[42.563%] to-[#1a4983] border-4 border-[rgba(15,40,71,0.15)] border-solid w-full h-[40px] rounded-[8px] flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 transition-opacity"
                >
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <p className="font-['Satoshi',sans-serif] font-bold text-[16px] text-white">
                        Creating...
                      </p>
                    </div>
                  ) : (
                    <p className="font-['Satoshi',sans-serif] font-bold text-[16px] text-white">
                      Create account
                    </p>
                  )}
                </button>
                
                <p className="font-['Roboto',sans-serif] font-medium text-center w-full">
                  <span className="font-['Satoshi',sans-serif] text-[12px]">Already have an account? </span>
                  <Link to="/login" className="font-['Satoshi',sans-serif] font-bold text-[12px] text-[#022658]">
                    Log in
                  </Link>
                </p>
              </div>

              {/* Social Login Divider */}
              <div className="flex gap-[16px] items-center w-full">
                <div className="flex-1 h-[0.5px] bg-[#525866] opacity-25" />
                <p className="font-['Satoshi',sans-serif] text-[12px] text-[#525866] opacity-50">
                  Or Log in with
                </p>
                <div className="flex-1 h-[0.5px] bg-[#525866] opacity-25" />
              </div>

              {/* Social Login Buttons */}
              <div className="flex gap-[16px] h-[56px] w-full">
                <button
                  type="button"
                  onClick={handleGoogleLogin}
                  className="flex-1 border border-[#525866] border-solid rounded-[8px] flex items-center justify-center hover:bg-slate-50 transition-colors"
                >
                  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                  </svg>
                </button>
                <button
                  type="button"
                  onClick={handleFacebookLogin}
                  className="flex-1 border border-[#525866] border-solid rounded-[8px] flex items-center justify-center hover:bg-slate-50 transition-colors"
                >
                  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="#1877F2">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                </button>
                <button
                  type="button"
                  onClick={handleAppleLogin}
                  className="flex-1 border border-[#525866] border-solid rounded-[8px] flex items-center justify-center hover:bg-slate-50 transition-colors"
                >
                  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="#000000">
                    <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
                  </svg>
                </button>
              </div>
            </div>
          </form>
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

export default CreateAccountOnboard;

