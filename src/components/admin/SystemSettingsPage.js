import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Bell,
  Camera,
  Check,
  ChevronDown,
  Eye,
  EyeOff,
  Globe2,
  KeyRound,
  Loader2,
  LockKeyhole,
  Mail,
  Monitor,
  Save,
  Settings2,
  ShieldCheck,
  UserRound,
} from 'lucide-react';
import { apiGet, apiPost, apiPut, apiUpload } from '../../utils/api';

const PREFERENCE_KEY = 'juridence_workspace_preferences';
const NOTIFICATION_KEY = 'juridence_notification_preferences';

const readStored = (key, fallback) => {
  try { return { ...fallback, ...JSON.parse(localStorage.getItem(key) || '{}') }; } catch { return fallback; }
};

const tabs = [
  ['profile', 'Profile', UserRound],
  ['account-security', 'Account & security', ShieldCheck],
  ['notifications', 'Notifications', Bell],
  ['preferences', 'Preferences', Settings2],
];

const notificationItems = [
  ['caseUpdates', 'New case updates', 'New pending or decided cases involving monitored entities.'],
  ['gazetteUpdates', 'Registrar and Gazette updates', 'Corporate lifecycle and public-notice changes.'],
  ['searchRequests', 'Screening completed', 'Completed single and batch screening requests.'],
  ['errors', 'Processing errors', 'Failed imports, searches or report generation.'],
  ['announcements', 'System announcements', 'Service updates and planned maintenance.'],
  ['entityStatusChanges', 'Entity status changes', 'Risk or monitoring status changes.'],
];

const initialNotifications = {
  inApp: true, email: true, caseUpdates: true, gazetteUpdates: true,
  searchRequests: true, errors: true, announcements: true, entityStatusChanges: true,
};

const initialPreferences = {
  language: 'English (Ghana)', timezone: 'Africa/Accra', dateFormat: 'DD/MM/YYYY',
  timeFormat: '24-hour', defaultExport: 'PDF', resultDensity: 'Compact',
};

const Switch = ({ checked, onChange, label }) => (
  <button type="button" className={`dd-settings-switch${checked ? ' is-on' : ''}`} role="switch" aria-checked={checked} aria-label={label} onClick={() => onChange(!checked)}><span /></button>
);

const Segmented = ({ label, value, options, onChange }) => (
  <div className="dd-settings-choice"><span>{label}</span><div>{options.map((option) => <button type="button" className={value === option ? 'is-active' : ''} onClick={() => onChange(option)} key={option}>{value === option && <Check size={12} />}{option}</button>)}</div></div>
);

const SystemSettingsPage = ({ userInfo, onNavigate }) => {
  const [activeTab, setActiveTab] = useState('profile');
  const [profile, setProfile] = useState({ first_name: '', last_name: '', email: '', phone_number: '', organization: '', job_title: '', profile_picture: null });
  const [originalProfile, setOriginalProfile] = useState(null);
  const [security, setSecurity] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [notice, setNotice] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswords, setShowPasswords] = useState(false);
  const [passwords, setPasswords] = useState({ current_password: '', new_password: '', confirm_password: '' });
  const [notifications, setNotifications] = useState(() => readStored(NOTIFICATION_KEY, initialNotifications));
  const [preferences, setPreferences] = useState(() => readStored(PREFERENCE_KEY, initialPreferences));
  const [twoFactorSetup, setTwoFactorSetup] = useState(null);
  const [verificationCode, setVerificationCode] = useState('');
  const [disableTwoFactor, setDisableTwoFactor] = useState(false);
  const fileInputRef = useRef(null);

  const showNotice = (type, message) => {
    setNotice({ type, message });
    window.setTimeout(() => setNotice(null), 3500);
  };

  const loadSecurity = async () => {
    try { setSecurity(await apiGet('/workspace/security-summary')); } catch { setSecurity(null); }
  };

  useEffect(() => {
    let current = true;
    const fallback = userInfo || (() => { try { return JSON.parse(localStorage.getItem('userData') || '{}'); } catch { return {}; } })();
    Promise.allSettled([apiGet('/profile/me'), apiGet('/workspace/security-summary')]).then(([profileResult, securityResult]) => {
      if (!current) return;
      const data = profileResult.status === 'fulfilled' ? profileResult.value : fallback;
      const next = {
        first_name: data.first_name || '', last_name: data.last_name || '', email: data.email || '',
        phone_number: data.phone_number || '', organization: data.organization || data.organization_name || '',
        job_title: data.job_title || '', profile_picture: data.profile_picture || data.avatar || null,
      };
      setProfile(next);
      setOriginalProfile(next);
      setNotifications((stored) => ({ ...stored, email: data.email_notifications ?? stored.email }));
      setPreferences((stored) => ({
        ...stored,
        language: data.language === 'en' ? 'English (Ghana)' : stored.language,
        timezone: data.timezone && data.timezone !== 'UTC' ? data.timezone : stored.timezone,
      }));
      if (securityResult.status === 'fulfilled') setSecurity(securityResult.value);
    }).finally(() => { if (current) setLoading(false); });
    return () => { current = false; };
  }, [userInfo]);

  useEffect(() => { localStorage.setItem(NOTIFICATION_KEY, JSON.stringify(notifications)); }, [notifications]);
  useEffect(() => { localStorage.setItem(PREFERENCE_KEY, JSON.stringify(preferences)); }, [preferences]);

  const displayName = useMemo(() => [profile.first_name, profile.last_name].filter(Boolean).join(' ') || userInfo?.name || 'Workspace user', [profile.first_name, profile.last_name, userInfo?.name]);
  const profileImage = profile.profile_picture || userInfo?.avatar || '/images/image.png';
  const isDirty = originalProfile && ['first_name', 'last_name', 'phone_number', 'job_title'].some((field) => profile[field] !== originalProfile[field]);

  const updateProfile = (field, value) => setProfile((current) => ({ ...current, [field]: value }));

  const saveProfile = async () => {
    setSaving(true);
    try {
      const payload = {
        first_name: profile.first_name,
        last_name: profile.last_name,
        phone_number: profile.phone_number || null,
        job_title: profile.job_title || null,
      };
      const updated = await apiPut('/profile/me', payload);
      const next = { ...profile, ...updated };
      setProfile(next);
      setOriginalProfile(next);
      const stored = JSON.parse(localStorage.getItem('userData') || '{}');
      localStorage.setItem('userData', JSON.stringify({ ...stored, ...updated }));
      window.dispatchEvent(new CustomEvent('authStateChanged'));
      showNotice('success', 'Profile settings saved.');
    } catch (error) {
      showNotice('error', error.message || 'Profile settings could not be saved.');
    } finally { setSaving(false); }
  };

  const uploadAvatar = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type) || file.size > 5 * 1024 * 1024) {
      showNotice('error', 'Choose a JPG, PNG or WebP image smaller than 5 MB.');
      event.target.value = '';
      return;
    }
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const data = await apiUpload('/profile/upload-avatar', formData);
      updateProfile('profile_picture', data.profile_picture);
      setOriginalProfile((current) => ({ ...current, profile_picture: data.profile_picture }));
      const stored = JSON.parse(localStorage.getItem('userData') || '{}');
      localStorage.setItem('userData', JSON.stringify({ ...stored, profile_picture: data.profile_picture, avatar: data.profile_picture }));
      window.dispatchEvent(new CustomEvent('authStateChanged'));
      showNotice('success', 'Profile photo updated.');
    } catch (error) {
      showNotice('error', error.message || 'Profile photo could not be uploaded.');
    } finally {
      setUploading(false);
      event.target.value = '';
    }
  };

  const changePassword = async (event) => {
    event.preventDefault();
    if (passwords.new_password.length < 8 || passwords.new_password !== passwords.confirm_password) {
      showNotice('error', passwords.new_password.length < 8 ? 'The new password must contain at least 8 characters.' : 'The new passwords do not match.');
      return;
    }
    setSaving(true);
    try {
      await apiPost('/security/change-password', passwords);
      setPasswords({ current_password: '', new_password: '', confirm_password: '' });
      setShowPassword(false);
      await loadSecurity();
      showNotice('success', 'Password changed successfully.');
    } catch (error) {
      showNotice('error', error.message || 'Password could not be changed.');
    } finally { setSaving(false); }
  };

  const saveNotifications = async () => {
    setSaving(true);
    try {
      await apiPut('/profile/me', { email_notifications: notifications.email });
      showNotice('success', 'Notification settings saved.');
    } catch (error) {
      showNotice('error', error.message || 'Notification settings could not be saved.');
    } finally { setSaving(false); }
  };

  const savePreferences = async () => {
    setSaving(true);
    try {
      await apiPut('/profile/me', { language: 'en', timezone: preferences.timezone });
      showNotice('success', 'Workspace preferences saved.');
    } catch (error) {
      showNotice('error', error.message || 'Preferences could not be saved.');
    } finally { setSaving(false); }
  };

  const beginTwoFactor = async () => {
    setSaving(true);
    try {
      setTwoFactorSetup(await apiPost('/security/2fa/setup', { method: 'authenticator' }));
      setVerificationCode('');
    } catch (error) {
      showNotice('error', error.message || 'Two-factor setup could not be started.');
    } finally { setSaving(false); }
  };

  const verifyTwoFactor = async (event) => {
    event.preventDefault();
    setSaving(true);
    try {
      await apiPost('/security/2fa/verify', { method: 'authenticator', code: verificationCode });
      setTwoFactorSetup(null);
      setVerificationCode('');
      await loadSecurity();
      showNotice('success', 'Two-factor authentication enabled.');
    } catch (error) {
      showNotice('error', error.message || 'The verification code was not accepted.');
    } finally { setSaving(false); }
  };

  const confirmDisableTwoFactor = async () => {
    setSaving(true);
    try {
      await apiPost('/security/2fa/disable', {});
      setDisableTwoFactor(false);
      await loadSecurity();
      showNotice('success', 'Two-factor authentication disabled.');
    } catch (error) {
      showNotice('error', error.message || 'Two-factor authentication could not be disabled.');
    } finally { setSaving(false); }
  };

  return <main className="dd-settings-page">
    <section className="dd-settings-heading"><div><h1>Settings <span>JUR.ADM.005</span></h1><p>Manage your personal workspace, account security and delivery preferences.</p></div><small>Personal configuration</small></section>
    {notice && <div className={`dd-settings-notice is-${notice.type}`}>{notice.type === 'success' ? <Check size={15} /> : <ShieldCheck size={15} />}{notice.message}</div>}
    <nav className="dd-settings-tabs" aria-label="Settings sections">{tabs.map(([id, label, Icon]) => <button type="button" className={activeTab === id ? 'is-active' : ''} onClick={() => setActiveTab(id)} key={id}><Icon size={15} />{label}</button>)}</nav>

    {activeTab === 'profile' && <section className="dd-settings-panel">
      <header><div><h2>Personal information</h2><p>Update your photo and personal details.</p></div><span>{isDirty ? 'Unsaved changes' : 'Up to date'}</span></header>
      {loading ? <div className="dd-loading-state"><Loader2 size={20} className="dd-spin" /> Loading profile</div> : <div className="dd-profile-settings-grid">
        <aside className="dd-profile-photo-panel"><div className="dd-settings-avatar"><img src={profileImage} alt={displayName} onError={(event) => { event.currentTarget.src = '/images/image.png'; }} />{uploading && <span><Loader2 size={18} className="dd-spin" /></span>}</div><strong>{displayName}</strong><small>{profile.job_title || 'Workspace user'}</small><input ref={fileInputRef} type="file" accept="image/png,image/jpeg,image/webp" onChange={uploadAvatar} hidden /><button type="button" onClick={() => fileInputRef.current?.click()} disabled={uploading}><Camera size={14} /> Change photo</button><p>JPG, PNG or WebP. Maximum 5 MB.</p></aside>
        <div className="dd-settings-form"><div className="dd-settings-form-grid"><label><span>First name</span><input value={profile.first_name} onChange={(event) => updateProfile('first_name', event.target.value)} /></label><label><span>Last name</span><input value={profile.last_name} onChange={(event) => updateProfile('last_name', event.target.value)} /></label><label><span>Email address</span><input type="email" value={profile.email} readOnly aria-readonly="true" title="Contact a workspace administrator to change your sign-in email" /></label><label><span>Phone number</span><input type="tel" value={profile.phone_number} onChange={(event) => updateProfile('phone_number', event.target.value)} placeholder="Not set" /></label><label><span>Organisation</span><input value={profile.organization} readOnly aria-readonly="true" title="Organisation membership is managed by a workspace administrator" /></label><label><span>Job title</span><input value={profile.job_title} onChange={(event) => updateProfile('job_title', event.target.value)} placeholder="Workspace user" /></label></div><div className="dd-settings-actions"><button type="button" onClick={() => setProfile(originalProfile)} disabled={!isDirty}>Cancel</button><button type="button" className="is-primary" onClick={saveProfile} disabled={!isDirty || saving}>{saving ? <Loader2 size={14} className="dd-spin" /> : <Save size={14} />} Save changes</button></div></div>
      </div>}
    </section>}

    {activeTab === 'account-security' && <div className="dd-settings-stack">
      <section className="dd-settings-panel"><header><div><h2>Password</h2><p>Use a strong, unique password for this workspace.</p></div><span>{security?.has_password === false ? 'External sign-in' : 'Protected'}</span></header><div className="dd-security-row"><div className="dd-settings-icon"><KeyRound size={18} /></div><div><strong>Account password</strong><p>{security?.has_password === false ? 'This account signs in through an external identity provider.' : 'A successful change is recorded in the security audit trail.'}</p></div><button type="button" onClick={() => setShowPassword((value) => !value)} disabled={security?.has_password === false}>{showPassword ? 'Cancel' : 'Change password'} <ChevronDown size={14} /></button></div>{showPassword && <form className="dd-password-settings" onSubmit={changePassword}><label><span>Current password</span><div><input type={showPasswords ? 'text' : 'password'} value={passwords.current_password} onChange={(event) => setPasswords((current) => ({ ...current, current_password: event.target.value }))} required /><button type="button" onClick={() => setShowPasswords((value) => !value)} aria-label={showPasswords ? 'Hide passwords' : 'Show passwords'}>{showPasswords ? <EyeOff size={15} /> : <Eye size={15} />}</button></div></label><label><span>New password</span><input type={showPasswords ? 'text' : 'password'} value={passwords.new_password} onChange={(event) => setPasswords((current) => ({ ...current, new_password: event.target.value }))} minLength="8" required /></label><label><span>Confirm new password</span><input type={showPasswords ? 'text' : 'password'} value={passwords.confirm_password} onChange={(event) => setPasswords((current) => ({ ...current, confirm_password: event.target.value }))} minLength="8" required /></label><div className="dd-settings-actions"><small>Minimum 8 characters.</small><button className="is-primary" disabled={saving}>{saving ? <Loader2 size={14} className="dd-spin" /> : <LockKeyhole size={14} />} Update password</button></div></form>}</section>
      <section className="dd-settings-panel"><header><div><h2>Sign-in security</h2><p>Review account protection and active access.</p></div><span>{security?.security_score ?? 0}% security score</span></header><div className="dd-security-row"><div className="dd-settings-icon"><ShieldCheck size={18} /></div><div><strong>Two-factor authentication</strong><p>{security?.two_factor?.enabled ? `Enabled with ${security.two_factor.method || 'authenticator'}.` : 'Add an authenticator verification step when signing in.'}</p></div><span className={`dd-settings-status ${security?.two_factor?.enabled ? 'is-live' : 'is-review'}`}>{security?.two_factor?.enabled ? 'Enabled' : 'Not configured'}</span><button type="button" onClick={() => security?.two_factor?.enabled ? setDisableTwoFactor(true) : beginTwoFactor()} disabled={saving}>{security?.two_factor?.enabled ? 'Disable' : 'Configure'}</button></div><div className="dd-security-row"><div className="dd-settings-icon"><Monitor size={18} /></div><div><strong>Active sessions</strong><p>{security?.active_sessions?.length ? `${security.active_sessions.length} server-tracked session${security.active_sessions.length === 1 ? '' : 's'}.` : 'This browser is authenticated; no additional server sessions are recorded.'}</p></div><span className="dd-settings-status is-live">Current</span><button type="button" onClick={() => onNavigate?.('audit-logs')}>Review activity</button></div></section>
    </div>}

    {activeTab === 'notifications' && <section className="dd-settings-panel"><header><div><h2>Notifications</h2><p>Email delivery is saved to your account; event selections are stored on this browser.</p></div><button type="button" className="dd-settings-header-action" onClick={saveNotifications} disabled={saving}>{saving ? <Loader2 size={13} className="dd-spin" /> : <Save size={13} />} Save</button></header><div className="dd-notification-channels"><strong>Delivery channels</strong><label><Mail size={15} /> Email <Switch checked={notifications.email} label="Email notifications" onChange={(checked) => setNotifications((current) => ({ ...current, email: checked }))} /></label><label><Bell size={15} /> In-app <Switch checked={notifications.inApp} label="In-app notifications" onChange={(checked) => setNotifications((current) => ({ ...current, inApp: checked }))} /></label></div><div className="dd-settings-list">{notificationItems.map(([key, title, description]) => <div key={key}><div><strong>{title}</strong><p>{description}</p></div><Switch checked={notifications[key]} label={title} onChange={(checked) => setNotifications((current) => ({ ...current, [key]: checked }))} /></div>)}</div></section>}

    {activeTab === 'preferences' && <section className="dd-settings-panel"><header><div><h2>Workspace preferences</h2><p>Language and time zone are saved to your account; display defaults are stored on this browser.</p></div><button type="button" className="dd-settings-header-action" onClick={savePreferences} disabled={saving}>{saving ? <Loader2 size={13} className="dd-spin" /> : <Save size={13} />} Save</button></header><div className="dd-preference-grid"><label><span>Language</span><div className="dd-settings-select"><Globe2 size={15} /><select value={preferences.language} onChange={(event) => setPreferences((current) => ({ ...current, language: event.target.value }))}><option>English (Ghana)</option><option>English (United Kingdom)</option></select><ChevronDown size={14} /></div></label><label><span>Time zone</span><div className="dd-settings-select"><Globe2 size={15} /><select value={preferences.timezone} onChange={(event) => setPreferences((current) => ({ ...current, timezone: event.target.value }))}><option>Africa/Accra</option><option>UTC</option></select><ChevronDown size={14} /></div></label><Segmented label="Date format" value={preferences.dateFormat} options={['DD/MM/YYYY', 'MM/DD/YYYY', 'YYYY-MM-DD']} onChange={(dateFormat) => setPreferences((current) => ({ ...current, dateFormat }))} /><Segmented label="Time format" value={preferences.timeFormat} options={['24-hour', '12-hour']} onChange={(timeFormat) => setPreferences((current) => ({ ...current, timeFormat }))} /><Segmented label="Default export" value={preferences.defaultExport} options={['PDF', 'Excel', 'CSV']} onChange={(defaultExport) => setPreferences((current) => ({ ...current, defaultExport }))} /><Segmented label="Result density" value={preferences.resultDensity} options={['Compact', 'Comfortable']} onChange={(resultDensity) => setPreferences((current) => ({ ...current, resultDensity }))} /></div></section>}

    {twoFactorSetup && <div className="dd-settings-modal-backdrop" role="presentation"><section className="dd-settings-modal dd-two-factor-modal" role="dialog" aria-modal="true" aria-labelledby="two-factor-title"><header><div><p>Account security</p><h2 id="two-factor-title">Configure authenticator</h2></div><button type="button" onClick={() => setTwoFactorSetup(null)} aria-label="Close">×</button></header><form onSubmit={verifyTwoFactor}><div className="dd-two-factor-setup"><p>Scan the QR code in your authenticator app, then enter the six-digit code to finish.</p><img src={`data:image/png;base64,${twoFactorSetup.qr_code}`} alt="Authenticator QR code" /><label><span>Manual setup key</span><code>{twoFactorSetup.secret_key}</code></label><label><span>Verification code</span><input inputMode="numeric" autoComplete="one-time-code" pattern="[0-9]{6}" maxLength="6" value={verificationCode} onChange={(event) => setVerificationCode(event.target.value.replace(/\D/g, '').slice(0, 6))} required /></label></div><footer><button type="button" onClick={() => setTwoFactorSetup(null)}>Cancel</button><button type="submit" className="is-primary" disabled={saving || verificationCode.length !== 6}>{saving ? <Loader2 size={13} className="dd-spin" /> : <ShieldCheck size={13} />} Verify and enable</button></footer></form></section></div>}

    {disableTwoFactor && <div className="dd-settings-modal-backdrop" role="presentation"><section className="dd-settings-modal" role="dialog" aria-modal="true" aria-labelledby="disable-two-factor-title"><header><div><p>Account security</p><h2 id="disable-two-factor-title">Disable two-factor authentication?</h2></div><button type="button" onClick={() => setDisableTwoFactor(false)} aria-label="Close">×</button></header><div><p>This removes the additional authenticator check from future sign-ins. The change will be recorded in the security audit trail.</p></div><footer><button type="button" onClick={() => setDisableTwoFactor(false)}>Cancel</button><button type="button" className="is-primary" onClick={confirmDisableTwoFactor} disabled={saving}>{saving ? <Loader2 size={13} className="dd-spin" /> : <LockKeyhole size={13} />} Disable 2FA</button></footer></section></div>}
  </main>;
};

export default SystemSettingsPage;
