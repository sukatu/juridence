import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Building2, Landmark, ShieldCheck } from 'lucide-react';
import AuthShell from '../components/auth/AuthShell';

const roles = [
  { id: 'administrator', label: 'Administrator', description: 'Manage users, data sources and platform operations.', icon: ShieldCheck },
  { id: 'court_registrar', label: 'Court Registrar', description: 'Maintain court records, cause lists and case information.', icon: Landmark },
  { id: 'corporate_client', label: 'Corporate Client', description: 'Run authorised due diligence for an organisation.', icon: Building2 },
];

const SelectRole = () => {
  const navigate = useNavigate();
  const [selectedRole, setSelectedRole] = useState('');

  const handleProceed = () => {
    if (!selectedRole) return;
    localStorage.setItem('selectedRole', selectedRole);
    navigate('/create-account');
  };

  return (
    <AuthShell
      panelTitle="Register for Juridence"
      title="Select your account type"
      subtitle="Choose the workspace that matches your responsibilities."
      asideTitle="Registration steps"
      asideItems={['Select an account type', 'Enter your organisation details', 'Verify your email address']}
    >
      <fieldset className="dd-role-options">
        <legend>Account type</legend>
        {roles.map(({ id, label, description, icon: Icon }) => (
          <label key={id} className={selectedRole === id ? 'is-selected' : ''}>
            <input type="radio" name="role" value={id} checked={selectedRole === id} onChange={() => setSelectedRole(id)} />
            <Icon size={18} />
            <span><strong>{label}</strong><small>{description}</small></span>
          </label>
        ))}
      </fieldset>
      <div className="dd-auth-actions is-block"><button type="button" onClick={handleProceed} disabled={!selectedRole}>Continue</button></div>
      <p className="dd-auth-switch">Already have an account? <Link to="/login">Sign in</Link></p>
    </AuthShell>
  );
};

export default SelectRole;
