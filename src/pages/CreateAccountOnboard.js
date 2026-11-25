import React, { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ChevronDown, Eye, EyeOff, Search, X } from 'lucide-react';
import { apiGet } from '../utils/api';
import AuthShell from '../components/auth/AuthShell';

const courtTypes = [
  { id: 'high_court', label: 'High Court' },
  { id: 'supreme_court', label: 'Supreme Court' },
  { id: 'court_of_appeal', label: 'Court of Appeal' },
];

const countries = [
  { code: '+233', name: 'Ghana' },
  { code: '+234', name: 'Nigeria' },
  { code: '+254', name: 'Kenya' },
  { code: '+27', name: 'South Africa' },
  { code: '+1', name: 'United States' },
  { code: '+44', name: 'United Kingdom' },
];

const roleNames = {
  administrator: 'Administrator',
  court_registrar: 'Court Registrar',
  corporate_client: 'Corporate Client',
};

const CreateAccountOnboard = () => {
  const navigate = useNavigate();
  const selectedRole = localStorage.getItem('selectedRole') || '';
  const [formData, setFormData] = useState({
    name: '', phone: '', email: '', password: '', agreeToTerms: false,
    countryCode: '+233', courtType: '', entityType: '', entityId: null, entityName: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [entitySearchQuery, setEntitySearchQuery] = useState('');
  const [entitySearchResults, setEntitySearchResults] = useState([]);
  const [showEntityDropdown, setShowEntityDropdown] = useState(false);
  const [isSearchingEntities, setIsSearchingEntities] = useState(false);
  const entitySearchTimeoutRef = useRef(null);
  const entityDropdownRef = useRef(null);

  useEffect(() => {
    if (!selectedRole) navigate('/select-role');
  }, [navigate, selectedRole]);

  useEffect(() => {
    if (selectedRole !== 'corporate_client' || entitySearchQuery.trim().length < 2) {
      setEntitySearchResults([]);
      return undefined;
    }
    window.clearTimeout(entitySearchTimeoutRef.current);
    setIsSearchingEntities(true);
    entitySearchTimeoutRef.current = window.setTimeout(async () => {
      try {
        const results = await apiGet(`/corporate-entities/search?query=${encodeURIComponent(entitySearchQuery.trim())}&limit=20`);
        setEntitySearchResults(Array.isArray(results) ? results : []);
      } catch (requestError) {
        setEntitySearchResults([]);
      } finally {
        setIsSearchingEntities(false);
      }
    }, 300);
    return () => window.clearTimeout(entitySearchTimeoutRef.current);
  }, [entitySearchQuery, selectedRole]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (entityDropdownRef.current && !entityDropdownRef.current.contains(event.target)) setShowEntityDropdown(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInputChange = (event) => {
    const { name, value, type, checked } = event.target;
    setFormData((current) => ({ ...current, [name]: type === 'checkbox' ? checked : value }));
    if (error) setError('');
  };

  const handleEntitySelect = (entity) => {
    setFormData((current) => ({ ...current, entityType: entity.type, entityId: entity.id, entityName: entity.name }));
    setEntitySearchQuery(entity.name);
    setEntitySearchResults([]);
    setShowEntityDropdown(false);
  };

  const clearEntitySelection = () => {
    setEntitySearchQuery('');
    setFormData((current) => ({ ...current, entityType: '', entityId: null, entityName: '' }));
    setEntitySearchResults([]);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    const nameParts = formData.name.trim().split(/\s+/);
    const firstName = nameParts[0] || '';
    const lastName = nameParts.slice(1).join(' ');
    if (firstName.length < 2 || lastName.length < 2) return setError('Provide both first and last name, with at least 2 characters each.');
    if (formData.password.length < 8) return setError('Password must be at least 8 characters long.');
    if (!formData.agreeToTerms) return setError('Please agree to the Terms and Privacy policies.');
    if (selectedRole === 'court_registrar' && !formData.courtType) return setError('Please select a court type.');
    if (selectedRole === 'corporate_client' && (!formData.entityId || !formData.entityType)) return setError('Please select a company, bank, or insurance provider.');

    setIsLoading(true);
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          first_name: firstName,
          last_name: lastName,
          email: formData.email.trim(),
          phone_number: formData.phone ? `${formData.countryCode}${formData.phone}` : undefined,
          password: formData.password,
          role: selectedRole,
          court_type: selectedRole === 'court_registrar' ? formData.courtType : undefined,
          entity_type: selectedRole === 'corporate_client' ? formData.entityType : undefined,
          entity_id: selectedRole === 'corporate_client' ? formData.entityId : undefined,
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        const message = Array.isArray(data.detail) ? data.detail.map((item) => item.msg || item).join(', ') : data.detail || data.message;
        throw new Error(message || 'Registration failed. Please try again.');
      }
      localStorage.setItem('pendingVerificationEmail', formData.email);
      navigate('/verify-account');
    } catch (requestError) {
      setError(requestError.message || 'An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!selectedRole) return null;

  return (
    <AuthShell
      panelTitle="Register for Juridence"
      title="Create your account"
      subtitle={<>Complete the details for a <strong>{roleNames[selectedRole] || 'Juridence'}</strong> workspace.</>}
      asideTitle="Registration steps"
      asideItems={['Account type selected', 'Enter your organisation details', 'Verify your email address']}
      wide
    >
      <form onSubmit={handleSubmit} className="dd-auth-form">
        {error && <div className="dd-auth-message is-error" role="alert">{error}</div>}
        <div className="dd-auth-grid">
          <label><span>Full name</span><input type="text" name="name" value={formData.name} onChange={handleInputChange} placeholder="First and last name" autoComplete="name" required /></label>
          <label><span>Email address</span><input type="email" name="email" value={formData.email} onChange={handleInputChange} placeholder="name@organisation.com" autoComplete="email" required /></label>

          {selectedRole === 'corporate_client' && (
            <label className="dd-auth-grid-wide" ref={entityDropdownRef}>
              <span>Organisation</span>
              <div className="dd-entity-combobox">
                <Search size={15} />
                <input value={entitySearchQuery} onChange={(event) => { setEntitySearchQuery(event.target.value); setShowEntityDropdown(true); if (!event.target.value) clearEntitySelection(); }} onFocus={() => setShowEntityDropdown(true)} placeholder="Search companies, banks or insurers" required />
                {formData.entityId ? <button type="button" onClick={clearEntitySelection} aria-label="Clear organisation"><X size={14} /></button> : <ChevronDown size={14} />}
                {showEntityDropdown && (
                  <div className="dd-entity-options">
                    {isSearchingEntities && <p>Searching...</p>}
                    {!isSearchingEntities && entitySearchResults.map((entity) => <button key={`${entity.type}-${entity.id}`} type="button" onClick={() => handleEntitySelect(entity)}><strong>{entity.name}</strong><small>{entity.type}{entity.short_name ? ` · ${entity.short_name}` : ''}</small></button>)}
                    {!isSearchingEntities && entitySearchQuery.length >= 2 && entitySearchResults.length === 0 && <p>No matching organisation found.</p>}
                  </div>
                )}
              </div>
            </label>
          )}

          {selectedRole === 'court_registrar' && <label><span>Court type</span><select name="courtType" value={formData.courtType} onChange={handleInputChange} required><option value="">Select court type</option>{courtTypes.map((court) => <option key={court.id} value={court.id}>{court.label}</option>)}</select></label>}

          <label><span>Phone number</span><div className="dd-phone-field"><select name="countryCode" value={formData.countryCode} onChange={handleInputChange} aria-label="Country calling code">{countries.map((country) => <option key={country.code} value={country.code}>{country.code} {country.name}</option>)}</select><input type="tel" name="phone" value={formData.phone} onChange={handleInputChange} placeholder="Phone number" autoComplete="tel" /></div></label>
          <label><span>Password</span><div className="dd-auth-password"><input type={showPassword ? 'text' : 'password'} name="password" value={formData.password} onChange={handleInputChange} placeholder="At least 8 characters" autoComplete="new-password" minLength={8} required /><button type="button" onClick={() => setShowPassword((show) => !show)} aria-label={showPassword ? 'Hide password' : 'Show password'}>{showPassword ? <EyeOff size={15} /> : <Eye size={15} />}</button></div></label>
        </div>
        <label className="dd-auth-check"><input type="checkbox" name="agreeToTerms" checked={formData.agreeToTerms} onChange={handleInputChange} required /><span>I agree to the <Link to="/terms">Terms</Link> and <Link to="/privacy">Privacy Policy</Link>.</span></label>
        <div className="dd-auth-actions"><button type="submit" disabled={isLoading}>{isLoading ? 'Creating account...' : 'Create account'}</button><button type="button" className="is-secondary" onClick={() => navigate('/select-role')}>Change account type</button></div>
      </form>
      <p className="dd-auth-switch">Already have an account? <Link to="/login">Sign in</Link></p>
    </AuthShell>
  );
};

export default CreateAccountOnboard;
