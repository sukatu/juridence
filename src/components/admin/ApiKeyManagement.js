import React, { useEffect, useMemo, useState } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  Copy,
  KeyRound,
  Loader2,
  LockKeyhole,
  Mail,
  Plus,
  RefreshCw,
  Search,
  ShieldCheck,
  Webhook,
  X,
} from 'lucide-react';
import { apiDelete, apiGet, apiPost } from '../../utils/api';

const formatDate = (value, fallback = 'Never') => {
  if (!value) return fallback;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Not recorded';
  return new Intl.DateTimeFormat('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).format(date);
};

const ApiKeyManagement = () => {
  const [keys, setKeys] = useState([]);
  const [subscription, setSubscription] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [createdKey, setCreatedKey] = useState(null);
  const [revoking, setRevoking] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [form, setForm] = useState({ name: '', expires_at: '', rate_limit: '1000' });

  const loadData = async () => {
    setLoading(true);
    setError('');
    const [keyResult, subscriptionResult, profileResult] = await Promise.allSettled([
      apiGet('/security/api-keys'),
      apiGet('/subscription/current'),
      apiGet('/profile/me'),
    ]);
    if (keyResult.status === 'fulfilled') setKeys(keyResult.value || []);
    else setError(keyResult.reason?.message || 'API credentials could not be loaded.');
    if (subscriptionResult.status === 'fulfilled') setSubscription(subscriptionResult.value);
    if (profileResult.status === 'fulfilled') setProfile(profileResult.value);
    setLoading(false);
  };

  useEffect(() => { loadData(); }, []);

  const canCreateKeys = Boolean(subscription?.is_premium);
  const visibleKeys = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return keys.filter((key) => !needle || `${key.name} ${key.key_prefix} ${(key.permissions || []).join(' ')}`.toLowerCase().includes(needle));
  }, [keys, query]);

  const integrations = [
    {
      icon: KeyRound,
      name: 'Juridence REST API',
      description: 'Authenticated read access using credentials owned by this account.',
      status: canCreateKeys ? 'Available' : 'Plan required',
      tone: canCreateKeys ? 'is-live' : 'is-review',
    },
    {
      icon: Mail,
      name: 'Email notifications',
      description: 'Account and watchlist notices sent to the profile email address.',
      status: profile?.email_notifications ? 'Enabled' : 'Disabled',
      tone: profile?.email_notifications ? 'is-live' : 'is-review',
    },
    {
      icon: Webhook,
      name: 'Webhooks',
      description: 'Outbound event delivery is not configured for this workspace.',
      status: 'Not configured',
      tone: 'is-review',
    },
    {
      icon: LockKeyhole,
      name: 'Single sign-on',
      description: 'Organisation identity-provider configuration is not present.',
      status: 'Not configured',
      tone: 'is-review',
    },
  ];

  const createKey = async (event) => {
    event.preventDefault();
    if (!form.name.trim() || !canCreateKeys) return;
    setBusy(true);
    setError('');
    try {
      const payload = {
        name: form.name.trim(),
        permissions: ['read'],
        rate_limit: Number(form.rate_limit) || 1000,
        expires_at: form.expires_at ? new Date(`${form.expires_at}T23:59:59`).toISOString() : null,
      };
      const result = await apiPost('/security/api-keys', payload);
      setCreatedKey(result);
      setKeys((current) => [result.api_key, ...current]);
      setShowCreate(false);
      setForm({ name: '', expires_at: '', rate_limit: '1000' });
    } catch (requestError) {
      setError(requestError.message || 'The API key could not be created.');
    } finally {
      setBusy(false);
    }
  };

  const revokeKey = async () => {
    if (!revoking) return;
    setBusy(true);
    setError('');
    try {
      await apiDelete(`/security/api-keys/${revoking.id}`);
      setKeys((current) => current.filter((key) => key.id !== revoking.id));
      setRevoking(null);
    } catch (requestError) {
      setError(requestError.message || 'The API key could not be revoked.');
    } finally {
      setBusy(false);
    }
  };

  const copyKey = async () => {
    await navigator.clipboard.writeText(createdKey.key);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  };

  return (
    <section className="dd-module-shell">
      <div className="dd-module-heading">
        <div><p className="dd-eyebrow">Developer access</p><h2>API & Integrations</h2><p>Manage credentials owned by this account and review connected service status.</p></div>
        <div className="dd-heading-actions"><button type="button" className="dd-button dd-button-secondary" onClick={loadData} disabled={loading}><RefreshCw size={14} /> Refresh</button><button type="button" className="dd-button dd-button-primary" onClick={() => setShowCreate(true)} disabled={!canCreateKeys || loading}><Plus size={15} /> Generate key</button></div>
      </div>

      {error && <div className="dd-inline-alert is-error"><span>{error}</span><button type="button" onClick={() => setError('')} aria-label="Dismiss"><X size={14} /></button></div>}
      {!loading && !canCreateKeys && <div className="dd-inline-alert is-info"><ShieldCheck size={14} /><span>API credentials require a Professional or Enterprise subscription. Existing integration status remains visible.</span></div>}

      <div className="dd-integration-grid">
        {integrations.map((integration) => {
          const Icon = integration.icon;
          return <article key={integration.name}><span><Icon size={17} /></span><div><strong>{integration.name}</strong><p>{integration.description}</p></div><em className={`dd-state ${integration.tone}`}>{integration.status}</em></article>;
        })}
      </div>

      <div className="dd-panel">
        <div className="dd-panel-header"><div><h3>Your API credentials</h3><p>Secrets are displayed once and credentials cannot be accessed by other workspace members.</p></div><span className="dd-count-badge"><KeyRound size={14} /> {keys.length} active</span></div>
        <div className="dd-inline-form"><label className="dd-search-control"><Search size={14} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search key name, prefix or permission" aria-label="Search API keys" /></label></div>
        {loading ? <div className="dd-loading-state"><Loader2 size={18} className="dd-spin" /> Loading API credentials</div> : !visibleKeys.length ? <div className="dd-empty-state"><KeyRound size={25} /><strong>No active API keys</strong><p>{keys.length ? 'No credentials match this search.' : 'Generate a credential when this account has API access.'}</p></div> : <div className="dd-table-wrap dd-api-key-table"><table className="dd-data-table"><thead><tr><th>Name</th><th>Key prefix</th><th>Permission</th><th>Rate limit</th><th>Created</th><th>Last used</th><th>Expires</th><th aria-label="Actions" /></tr></thead><tbody>{visibleKeys.map((key) => <tr key={key.id}><td><strong>{key.name}</strong></td><td><code>{key.key_prefix}••••••••</code></td><td>{(key.permissions || ['read']).join(', ')}</td><td>{Number(key.rate_limit || 0).toLocaleString()} / hour</td><td>{formatDate(key.created_at)}</td><td>{formatDate(key.last_used)}</td><td>{formatDate(key.expires_at, 'No expiry')}</td><td><button type="button" className="dd-link-button is-danger" onClick={() => setRevoking(key)}>Revoke</button></td></tr>)}</tbody></table></div>}
      </div>

      {showCreate && <div className="dd-modal-backdrop" role="presentation"><div className="dd-modal" role="dialog" aria-modal="true" aria-labelledby="create-key-title"><header><div><h3 id="create-key-title">Generate API key</h3><p>The credential will belong only to the signed-in account.</p></div><button type="button" onClick={() => setShowCreate(false)} aria-label="Close"><X size={17} /></button></header><form className="dd-modal-body dd-stacked-form" onSubmit={createKey}><label>Key name<input value={form.name} onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))} maxLength="100" placeholder="Production screening integration" required /></label><label>Rate limit per hour<input type="number" min="1" max="100000" value={form.rate_limit} onChange={(event) => setForm((current) => ({ ...current, rate_limit: event.target.value }))} required /></label><label>Expiry date <span className="dd-optional">Optional</span><input type="date" min={new Date().toISOString().slice(0, 10)} value={form.expires_at} onChange={(event) => setForm((current) => ({ ...current, expires_at: event.target.value }))} /></label><div className="dd-inline-alert is-info"><AlertTriangle size={15} /> The secret cannot be recovered after the confirmation closes.</div><div className="dd-modal-actions"><button type="button" className="dd-button dd-button-secondary" onClick={() => setShowCreate(false)}>Cancel</button><button className="dd-button dd-button-primary" disabled={busy}>{busy ? <Loader2 size={15} className="dd-spin" /> : <KeyRound size={15} />} Generate key</button></div></form></div></div>}

      {createdKey && <div className="dd-modal-backdrop" role="presentation"><div className="dd-modal" role="dialog" aria-modal="true" aria-labelledby="created-key-title"><header><div><h3 id="created-key-title">API key created</h3><p>Copy this secret now. It will not be displayed again.</p></div></header><div className="dd-modal-body"><div className="dd-secret-value"><code>{createdKey.key}</code><button type="button" className="dd-icon-button" onClick={copyKey} aria-label="Copy API key">{copied ? <CheckCircle2 size={15} /> : <Copy size={15} />}</button></div><div className="dd-modal-actions"><button type="button" className="dd-button dd-button-primary" onClick={() => setCreatedKey(null)}>I have stored the key</button></div></div></div></div>}

      {revoking && <div className="dd-modal-backdrop" role="presentation"><div className="dd-modal dd-modal-small" role="dialog" aria-modal="true" aria-labelledby="revoke-key-title"><header><div><h3 id="revoke-key-title">Revoke API key?</h3><p>Integrations using “{revoking.name}” will lose access immediately.</p></div></header><div className="dd-modal-body"><div className="dd-inline-alert is-info"><AlertTriangle size={14} /> Revocation deactivates the credential and preserves its audit history.</div><div className="dd-modal-actions"><button type="button" className="dd-button dd-button-secondary" onClick={() => setRevoking(null)}>Cancel</button><button type="button" className="dd-button dd-button-danger" onClick={revokeKey} disabled={busy}>{busy ? <Loader2 size={15} className="dd-spin" /> : <KeyRound size={15} />} Revoke key</button></div></div></div></div>}
    </section>
  );
};

export default ApiKeyManagement;
