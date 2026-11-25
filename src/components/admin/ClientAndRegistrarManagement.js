import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  AlertCircle,
  Building2,
  Calendar,
  CheckCircle,
  Download,
  Edit,
  Eye,
  Key,
  Loader2,
  Mail,
  Plus,
  RefreshCw,
  Scale,
  Search,
  Shield,
  UserCheck,
  UserX,
  X,
} from 'lucide-react';
import { apiGet, apiPost, apiPut } from '../../utils/api';
import { ToastContainer, useToast } from '../Toast';

const PAGE_SIZE = 20;

const EMPTY_STATS = {
  totalCorporateClients: 0,
  totalRegistrars: 0,
  activeCorporateClients: 0,
  activeRegistrars: 0,
  inactiveCorporateClients: 0,
  inactiveRegistrars: 0,
  pendingCorporateClients: 0,
  pendingRegistrars: 0,
};

const EMPTY_FORM = {
  email: '',
  first_name: '',
  last_name: '',
  phone_number: '',
  organization: '',
  job_title: '',
  user_type: 'corporate_client',
  status: 'active',
  entity_type: '',
  entity_id: '',
  court_type: '',
  password: '',
  confirm_password: '',
};

const EMPTY_PASSWORD_FORM = {
  new_password: '',
  confirm_password: '',
  admin_password: '',
};

const courtLabels = {
  high_court: 'High Court',
  supreme_court: 'Supreme Court',
  court_of_appeal: 'Court of Appeal',
  circuit_court: 'Circuit Court',
  district_court: 'District Court',
};

const entityLabels = {
  company: 'Company',
  bank: 'Bank',
  insurance: 'Insurance provider',
};

const normalizeStatus = (value) => String(value || 'pending').toLowerCase();
const formatNumber = (value) => Number(value || 0).toLocaleString();
const fullName = (user) => [user?.first_name, user?.last_name].filter(Boolean).join(' ') || 'Unnamed account';
const initials = (user) => (
  `${user?.first_name?.[0] || ''}${user?.last_name?.[0] || ''}`.toUpperCase() || 'U'
);
const accountTypeLabel = (userType) => (
  userType === 'court_registrar' ? 'Court registrar' : 'Corporate client'
);

const formatDateTime = (value) => {
  if (!value) return 'Never';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Not recorded';
  return new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
};

const assignmentLabel = (user) => {
  if (user.user_type === 'court_registrar') return courtLabels[user.court_type] || 'Court not assigned';
  if (user.entity_type) {
    const label = entityLabels[user.entity_type] || user.entity_type;
    return user.entity_id ? `${label} record ${user.entity_id}` : label;
  }
  return 'Entity not linked';
};

const errorText = (error, fallback) => (
  error?.data?.detail || error?.detail || error?.message || fallback
);

const csvCell = (value) => `"${String(value ?? '').replaceAll('"', '""')}"`;

const ClientAndRegistrarManagement = () => {
  const { toasts, success, error: showError, removeToast } = useToast();
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState(EMPTY_STATS);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadError, setLoadError] = useState('');
  const [queryInput, setQueryInput] = useState('');
  const [query, setQuery] = useState('');
  const [accountType, setAccountType] = useState('all');
  const [status, setStatus] = useState('all');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);
  const [selectedUser, setSelectedUser] = useState(null);
  const [modal, setModal] = useState(null);
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [formErrors, setFormErrors] = useState({});
  const [passwordForm, setPasswordForm] = useState(EMPTY_PASSWORD_FORM);
  const [saving, setSaving] = useState(false);
  const [exporting, setExporting] = useState(false);

  const buildParams = useCallback((overrides = {}) => {
    const params = { page, limit: PAGE_SIZE, ...overrides };
    if (query) params.search = query;
    if (accountType !== 'all') params.user_type = accountType;
    if (status !== 'all') params.status = status;
    return params;
  }, [accountType, page, query, status]);

  const loadDirectory = useCallback(async ({ quiet = false } = {}) => {
    if (quiet) setRefreshing(true);
    else setLoading(true);
    setLoadError('');
    try {
      const [directory, summaryData] = await Promise.all([
        apiGet('/admin/users/clients-and-registrars', buildParams()),
        apiGet('/admin/users/clients-and-registrars/stats'),
      ]);
      setUsers(Array.isArray(directory?.users) ? directory.users : []);
      setTotalPages(Math.max(1, Number(directory?.total_pages || 1)));
      setTotalUsers(Number(directory?.total || 0));
      setStats({ ...EMPTY_STATS, ...(summaryData || {}) });
    } catch (requestError) {
      setUsers([]);
      setTotalPages(1);
      setTotalUsers(0);
      setLoadError(errorText(requestError, 'The client and registrar directory could not be loaded.'));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [buildParams]);

  useEffect(() => { loadDirectory(); }, [loadDirectory]);

  const summary = useMemo(() => ({
    corporate: Number(stats.totalCorporateClients || 0),
    registrars: Number(stats.totalRegistrars || 0),
    active: Number(stats.activeCorporateClients || 0) + Number(stats.activeRegistrars || 0),
    attention: Number(stats.pendingCorporateClients || 0)
      + Number(stats.pendingRegistrars || 0)
      + Number(stats.inactiveCorporateClients || 0)
      + Number(stats.inactiveRegistrars || 0),
  }), [stats]);

  const firstRecord = totalUsers ? ((page - 1) * PAGE_SIZE) + 1 : 0;
  const lastRecord = Math.min(page * PAGE_SIZE, totalUsers);

  const closeModal = () => {
    setModal(null);
    setSelectedUser(null);
    setFormErrors({});
    setPasswordForm(EMPTY_PASSWORD_FORM);
  };

  const openCreate = () => {
    setSelectedUser(null);
    setFormData(EMPTY_FORM);
    setFormErrors({});
    setModal('create');
  };

  const openEdit = (user) => {
    setSelectedUser(user);
    setFormData({
      email: user.email || '',
      first_name: user.first_name || '',
      last_name: user.last_name || '',
      phone_number: user.phone_number || '',
      organization: user.organization || '',
      job_title: user.job_title || '',
      user_type: user.user_type || 'corporate_client',
      status: normalizeStatus(user.status),
      entity_type: user.entity_type || '',
      entity_id: user.entity_id || '',
      court_type: user.court_type || '',
      password: '',
      confirm_password: '',
    });
    setFormErrors({});
    setModal('edit');
  };

  const updateForm = (field, value) => {
    setFormData((current) => ({
      ...current,
      [field]: value,
      ...(field === 'user_type' && value === 'corporate_client' ? { court_type: '' } : {}),
      ...(field === 'user_type' && value === 'court_registrar' ? { entity_type: '', entity_id: '' } : {}),
    }));
    if (formErrors[field]) setFormErrors((current) => ({ ...current, [field]: '' }));
  };

  const validateForm = () => {
    const nextErrors = {};
    if (!formData.first_name.trim() || formData.first_name.trim().length < 2) nextErrors.first_name = 'Enter at least two characters.';
    if (!formData.last_name.trim() || formData.last_name.trim().length < 2) nextErrors.last_name = 'Enter at least two characters.';
    if (modal === 'create' && !/^\S+@\S+\.\S+$/.test(formData.email)) nextErrors.email = 'Enter a valid email address.';
    if (modal === 'create' && formData.password.length < 8) nextErrors.password = 'Use at least eight characters.';
    if (modal === 'create' && formData.password !== formData.confirm_password) nextErrors.confirm_password = 'Passwords do not match.';
    if (formData.user_type === 'court_registrar' && !formData.court_type) nextErrors.court_type = 'Select the registrar’s court.';
    if (formData.entity_id && (!/^\d+$/.test(String(formData.entity_id)) || Number(formData.entity_id) < 1)) nextErrors.entity_id = 'Use a positive record ID.';
    setFormErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const submitAccount = async (event) => {
    event.preventDefault();
    if (!validateForm()) return;
    setSaving(true);
    try {
      const shared = {
        first_name: formData.first_name.trim(),
        last_name: formData.last_name.trim(),
        phone_number: formData.phone_number.trim() || null,
        organization: formData.organization.trim() || null,
        job_title: formData.job_title.trim() || null,
        user_type: formData.user_type,
        status: formData.status,
        court_type: formData.user_type === 'court_registrar' ? formData.court_type : null,
        entity_type: formData.user_type === 'corporate_client' ? formData.entity_type || null : null,
        entity_id: formData.user_type === 'corporate_client' && formData.entity_id ? Number(formData.entity_id) : null,
      };
      if (modal === 'create') {
        await apiPost('/admin/users', { ...shared, email: formData.email.trim(), password: formData.password });
        success('Account created successfully.');
      } else {
        await apiPut(`/admin/users/${selectedUser.id}`, shared);
        success('Account details updated.');
      }
      closeModal();
      await loadDirectory({ quiet: true });
    } catch (requestError) {
      showError(errorText(requestError, 'The account could not be saved.'));
    } finally {
      setSaving(false);
    }
  };

  const submitPasswordReset = async (event) => {
    event.preventDefault();
    const nextErrors = {};
    if (passwordForm.new_password.length < 8) nextErrors.new_password = 'Use at least eight characters.';
    if (passwordForm.new_password !== passwordForm.confirm_password) nextErrors.confirm_password = 'Passwords do not match.';
    if (!passwordForm.admin_password) nextErrors.admin_password = 'Enter your administrator password.';
    setFormErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;
    setSaving(true);
    try {
      await apiPost(`/admin/users/${selectedUser.id}/reset-password`, {
        new_password: passwordForm.new_password,
        admin_password: passwordForm.admin_password,
      });
      success(`Password reset for ${fullName(selectedUser)}.`);
      closeModal();
    } catch (requestError) {
      showError(errorText(requestError, 'The password could not be reset.'));
    } finally {
      setSaving(false);
    }
  };

  const confirmStatusChange = async () => {
    if (!selectedUser) return;
    const nextStatus = normalizeStatus(selectedUser.status) === 'active' ? 'suspended' : 'active';
    setSaving(true);
    try {
      await apiPut(`/admin/users/${selectedUser.id}`, { status: nextStatus });
      success(`${fullName(selectedUser)} is now ${nextStatus}.`);
      closeModal();
      await loadDirectory({ quiet: true });
    } catch (requestError) {
      showError(errorText(requestError, 'The account status could not be updated.'));
    } finally {
      setSaving(false);
    }
  };

  const submitSearch = (event) => {
    event.preventDefault();
    setPage(1);
    setQuery(queryInput.trim());
  };

  const clearFilters = () => {
    setQueryInput('');
    setQuery('');
    setAccountType('all');
    setStatus('all');
    setPage(1);
  };

  const exportCsv = async () => {
    setExporting(true);
    try {
      const data = await apiGet('/admin/users/clients-and-registrars', buildParams({ page: 1, limit: 1000 }));
      const exportUsers = Array.isArray(data?.users) ? data.users : [];
      if (!exportUsers.length) {
        showError('There are no matching accounts to export.');
        return;
      }
      const headings = ['Name', 'Email', 'Account type', 'Organisation', 'Job title', 'Assignment', 'Status', 'Last sign-in', 'Created'];
      const rows = exportUsers.map((user) => [
        fullName(user),
        user.email,
        accountTypeLabel(user.user_type),
        user.organization || '',
        user.job_title || '',
        assignmentLabel(user),
        normalizeStatus(user.status),
        formatDateTime(user.last_login),
        formatDateTime(user.created_at),
      ]);
      const csv = [headings, ...rows].map((row) => row.map(csvCell).join(',')).join('\n');
      const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = `juridence-clients-registrars-${new Date().toISOString().slice(0, 10)}.csv`;
      anchor.click();
      URL.revokeObjectURL(url);
    } catch (requestError) {
      showError(errorText(requestError, 'The directory export could not be prepared.'));
    } finally {
      setExporting(false);
    }
  };

  const typeCount = accountType === 'corporate_client'
    ? summary.corporate
    : accountType === 'court_registrar' ? summary.registrars : summary.corporate + summary.registrars;

  return (
    <main className="dd-module-shell dd-client-directory">
      <header className="dd-module-heading">
        <div><p className="dd-eyebrow">User management</p><h2>Clients &amp; Registrars</h2><p>Manage external workspace accounts, organisation assignments and access status.</p></div>
        <div className="dd-heading-actions">
          <button type="button" className="dd-button dd-button-secondary" onClick={() => loadDirectory({ quiet: true })} disabled={refreshing}><RefreshCw className={refreshing ? 'dd-spin' : ''} size={14} /> Refresh</button>
          <button type="button" className="dd-button dd-button-primary" onClick={openCreate}><Plus size={14} /> Add account</button>
        </div>
      </header>

      <section className="dd-kpi-row dd-kpi-row-four" aria-label="Client and registrar summary">
        <article><Building2 size={19} /><div><strong>{formatNumber(summary.corporate)}</strong><span>Corporate clients</span></div></article>
        <article><Scale size={19} /><div><strong>{formatNumber(summary.registrars)}</strong><span>Court registrars</span></div></article>
        <article><UserCheck size={19} /><div><strong>{formatNumber(summary.active)}</strong><span>Active accounts</span></div></article>
        <article><AlertCircle size={19} /><div><strong>{formatNumber(summary.attention)}</strong><span>Require attention</span></div></article>
      </section>

      {loadError && <div className="dd-inline-alert is-error"><span>{loadError}</span><button type="button" onClick={() => setLoadError('')} aria-label="Dismiss error"><X size={14} /></button></div>}

      <section className="dd-panel dd-client-directory-panel">
        <nav className="dd-gazette-dataset-tabs dd-client-type-tabs" aria-label="Account type views">
          <button type="button" className={accountType === 'all' ? 'is-active' : ''} onClick={() => { setAccountType('all'); setPage(1); }}><UserCheck size={13} /><strong>All accounts</strong><span>{summary.corporate + summary.registrars}</span></button>
          <button type="button" className={accountType === 'corporate_client' ? 'is-active' : ''} onClick={() => { setAccountType('corporate_client'); setPage(1); }}><Building2 size={13} /><strong>Corporate clients</strong><span>{summary.corporate}</span></button>
          <button type="button" className={accountType === 'court_registrar' ? 'is-active' : ''} onClick={() => { setAccountType('court_registrar'); setPage(1); }}><Scale size={13} /><strong>Court registrars</strong><span>{summary.registrars}</span></button>
        </nav>

        <form className="dd-client-filter-bar" onSubmit={submitSearch}>
          <label className="dd-client-search-field"><span>Search directory</span><div className="dd-search-control"><Search size={14} /><input type="search" value={queryInput} onChange={(event) => setQueryInput(event.target.value)} placeholder="Name, email or organisation" /></div></label>
          <label><span>Status</span><select className="dd-select-control" value={status} onChange={(event) => { setStatus(event.target.value); setPage(1); }}><option value="all">All statuses</option><option value="active">Active</option><option value="pending">Pending</option><option value="inactive">Inactive</option><option value="suspended">Suspended</option></select></label>
          <button type="submit" className="dd-button dd-button-primary"><Search size={13} /> Search</button>
          <button type="button" className="dd-button dd-button-secondary" onClick={clearFilters}>Clear</button>
          <button type="button" className="dd-button dd-button-secondary" onClick={exportCsv} disabled={exporting || loading || !typeCount}>{exporting ? <Loader2 className="dd-spin" size={13} /> : <Download size={13} />} Export CSV</button>
        </form>

        <header className="dd-list-header dd-client-list-header"><div><strong>Account directory</strong><span>{formatNumber(totalUsers)} matching account{totalUsers === 1 ? '' : 's'}</span></div><span className="dd-count-badge">Records {firstRecord}-{lastRecord}</span></header>

        {loading ? <div className="dd-loading-state"><Loader2 className="dd-spin" size={17} /> Loading client and registrar accounts...</div> : (
          <div className="dd-table-wrap dd-client-directory-table">
            <table className="dd-data-table">
              <thead><tr><th>Account</th><th>Organisation</th><th>Account type</th><th>Assignment</th><th>Status</th><th>Last sign-in</th><th>Created</th><th /></tr></thead>
              <tbody>
                {users.map((user) => {
                  const currentStatus = normalizeStatus(user.status);
                  return (
                    <tr key={user.id}>
                      <td><div className="dd-client-account"><span className="dd-team-avatar">{initials(user)}</span><div><strong>{fullName(user)}</strong><small>{user.email}</small></div></div></td>
                      <td><strong>{user.organization || 'Not recorded'}</strong><small>{user.job_title || 'No job title recorded'}</small></td>
                      <td><span className={`dd-account-type is-${user.user_type}`}>{user.user_type === 'court_registrar' ? <Scale size={12} /> : <Building2 size={12} />}{accountTypeLabel(user.user_type)}</span></td>
                      <td><strong>{assignmentLabel(user)}</strong><small>{user.phone_number || 'No phone number recorded'}</small></td>
                      <td><span className={`dd-status-badge is-${currentStatus}`}>{currentStatus}</span></td>
                      <td className="dd-client-date">{formatDateTime(user.last_login)}</td>
                      <td className="dd-client-date">{formatDateTime(user.created_at)}</td>
                      <td><div className="dd-client-row-actions">
                        <button type="button" className="dd-icon-button" onClick={() => { setSelectedUser(user); setModal('view'); }} aria-label={`View ${fullName(user)}`} title="View account"><Eye size={14} /></button>
                        <button type="button" className="dd-icon-button" onClick={() => openEdit(user)} aria-label={`Edit ${fullName(user)}`} title="Edit account"><Edit size={14} /></button>
                        <button type="button" className="dd-icon-button" onClick={() => { setSelectedUser(user); setFormErrors({}); setPasswordForm(EMPTY_PASSWORD_FORM); setModal('password'); }} aria-label={`Reset password for ${fullName(user)}`} title="Reset password"><Key size={14} /></button>
                        <button type="button" className={`dd-icon-button ${currentStatus === 'active' ? 'is-danger' : ''}`} onClick={() => { setSelectedUser(user); setModal('status'); }} aria-label={`${currentStatus === 'active' ? 'Suspend' : 'Reactivate'} ${fullName(user)}`} title={currentStatus === 'active' ? 'Suspend account' : 'Reactivate account'}>{currentStatus === 'active' ? <UserX size={14} /> : <UserCheck size={14} />}</button>
                      </div></td>
                    </tr>
                  );
                })}
                {!users.length && <tr><td colSpan="8"><div className="dd-empty-state dd-client-empty"><UserCheck size={25} /><strong>No accounts found</strong><p>{loadError ? 'The directory is unavailable.' : 'No client or registrar accounts match the selected filters.'}</p></div></td></tr>}
              </tbody>
            </table>
          </div>
        )}

        <footer className="dd-client-pagination"><span>Records {firstRecord}-{lastRecord} of {formatNumber(totalUsers)}</span><div><button type="button" className="dd-button dd-button-secondary" disabled={page <= 1} onClick={() => setPage((current) => Math.max(1, current - 1))}>Prev</button><span>Page {page} of {totalPages}</span><button type="button" className="dd-button dd-button-secondary" disabled={page >= totalPages} onClick={() => setPage((current) => Math.min(totalPages, current + 1))}>Next</button></div></footer>
      </section>

      <div className="dd-inline-alert is-info dd-client-safety-note"><Shield size={14} /><span>Accounts are suspended rather than deleted so access decisions and audit history remain traceable.</span></div>

      {modal === 'view' && selectedUser && (
        <div className="dd-modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) closeModal(); }}>
          <section className="dd-modal dd-client-detail-modal" role="dialog" aria-modal="true" aria-labelledby="client-detail-title">
            <header><div><h3 id="client-detail-title">{fullName(selectedUser)}</h3><p>{accountTypeLabel(selectedUser.user_type)} · Account {selectedUser.id}</p></div><button type="button" onClick={closeModal} aria-label="Close account details"><X size={16} /></button></header>
            <div className="dd-gazette-facts dd-client-detail-facts">
              <div><Mail size={14} /><span>Email</span><strong>{selectedUser.email}</strong></div>
              <div><Building2 size={14} /><span>Organisation</span><strong>{selectedUser.organization || 'Not recorded'}</strong></div>
              <div><Shield size={14} /><span>Status</span><strong>{normalizeStatus(selectedUser.status)}</strong></div>
              <div><Calendar size={14} /><span>Last sign-in</span><strong>{formatDateTime(selectedUser.last_login)}</strong></div>
            </div>
            <div className="dd-modal-body">
              <dl className="dd-client-detail-list">
                <div><dt>Account type</dt><dd>{accountTypeLabel(selectedUser.user_type)}</dd></div>
                <div><dt>Assignment</dt><dd>{assignmentLabel(selectedUser)}</dd></div>
                <div><dt>Job title</dt><dd>{selectedUser.job_title || 'Not recorded'}</dd></div>
                <div><dt>Phone number</dt><dd>{selectedUser.phone_number || 'Not recorded'}</dd></div>
                <div><dt>Created</dt><dd>{formatDateTime(selectedUser.created_at)}</dd></div>
                <div><dt>Last updated</dt><dd>{formatDateTime(selectedUser.updated_at)}</dd></div>
              </dl>
              <div className="dd-modal-actions"><button type="button" className="dd-button dd-button-secondary" onClick={closeModal}>Close</button><button type="button" className="dd-button dd-button-primary" onClick={() => openEdit(selectedUser)}><Edit size={13} /> Edit account</button></div>
            </div>
          </section>
        </div>
      )}

      {(modal === 'create' || modal === 'edit') && (
        <div className="dd-modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget && !saving) closeModal(); }}>
          <section className="dd-modal dd-client-form-modal" role="dialog" aria-modal="true" aria-labelledby="client-form-title">
            <header><div><h3 id="client-form-title">{modal === 'create' ? 'Add account' : 'Edit account'}</h3><p>{modal === 'create' ? 'Create a corporate-client or court-registrar login.' : `Update ${fullName(selectedUser)} without changing their sign-in email.`}</p></div><button type="button" onClick={closeModal} disabled={saving} aria-label="Close account form"><X size={16} /></button></header>
            <form className="dd-modal-body dd-client-form" onSubmit={submitAccount}>
              <div className="dd-client-form-grid">
                <label><span>First name *</span><input value={formData.first_name} onChange={(event) => updateForm('first_name', event.target.value)} />{formErrors.first_name && <small>{formErrors.first_name}</small>}</label>
                <label><span>Last name *</span><input value={formData.last_name} onChange={(event) => updateForm('last_name', event.target.value)} />{formErrors.last_name && <small>{formErrors.last_name}</small>}</label>
                <label className="is-wide"><span>Email address *</span><input type="email" value={formData.email} onChange={(event) => updateForm('email', event.target.value)} readOnly={modal === 'edit'} aria-readonly={modal === 'edit'} />{formErrors.email && <small>{formErrors.email}</small>}</label>
                <label><span>Account type *</span><select value={formData.user_type} onChange={(event) => updateForm('user_type', event.target.value)}><option value="corporate_client">Corporate client</option><option value="court_registrar">Court registrar</option></select></label>
                <label><span>Status *</span><select value={formData.status} onChange={(event) => updateForm('status', event.target.value)}><option value="active">Active</option><option value="pending">Pending</option><option value="inactive">Inactive</option><option value="suspended">Suspended</option></select></label>
                <label><span>Organisation</span><input value={formData.organization} onChange={(event) => updateForm('organization', event.target.value)} placeholder={formData.user_type === 'court_registrar' ? 'Court or Judicial Service unit' : 'Client organisation'} /></label>
                <label><span>Job title</span><input value={formData.job_title} onChange={(event) => updateForm('job_title', event.target.value)} placeholder="Role in organisation" /></label>
                <label><span>Phone number</span><input type="tel" value={formData.phone_number} onChange={(event) => updateForm('phone_number', event.target.value)} placeholder="Not set" /></label>
                {formData.user_type === 'court_registrar' ? (
                  <label><span>Court assignment *</span><select value={formData.court_type} onChange={(event) => updateForm('court_type', event.target.value)}><option value="">Select court</option>{Object.entries(courtLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select>{formErrors.court_type && <small>{formErrors.court_type}</small>}</label>
                ) : (
                  <>
                    <label><span>Entity type</span><select value={formData.entity_type} onChange={(event) => updateForm('entity_type', event.target.value)}><option value="">Not linked</option>{Object.entries(entityLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
                    <label><span>Entity record ID</span><input inputMode="numeric" value={formData.entity_id} onChange={(event) => updateForm('entity_id', event.target.value)} placeholder="Optional record ID" />{formErrors.entity_id && <small>{formErrors.entity_id}</small>}</label>
                  </>
                )}
                {modal === 'create' && <><label><span>Temporary password *</span><input type="password" value={formData.password} onChange={(event) => updateForm('password', event.target.value)} autoComplete="new-password" />{formErrors.password && <small>{formErrors.password}</small>}</label><label><span>Confirm password *</span><input type="password" value={formData.confirm_password} onChange={(event) => updateForm('confirm_password', event.target.value)} autoComplete="new-password" />{formErrors.confirm_password && <small>{formErrors.confirm_password}</small>}</label></>}
              </div>
              <p className="dd-form-note">Account assignments should match the organisation or court the user is authorised to represent.</p>
              <div className="dd-modal-actions"><button type="button" className="dd-button dd-button-secondary" onClick={closeModal} disabled={saving}>Cancel</button><button type="submit" className="dd-button dd-button-primary" disabled={saving}>{saving && <Loader2 className="dd-spin" size={13} />}{modal === 'create' ? 'Create account' : 'Save changes'}</button></div>
            </form>
          </section>
        </div>
      )}

      {modal === 'password' && selectedUser && (
        <div className="dd-modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget && !saving) closeModal(); }}>
          <section className="dd-modal dd-client-password-modal" role="dialog" aria-modal="true" aria-labelledby="client-password-title">
            <header><div><h3 id="client-password-title">Reset password</h3><p>Set a new password for {fullName(selectedUser)}.</p></div><button type="button" onClick={closeModal} disabled={saving} aria-label="Close password reset"><X size={16} /></button></header>
            <form className="dd-modal-body dd-client-password-form" onSubmit={submitPasswordReset}>
              <label><span>New password *</span><input type="password" value={passwordForm.new_password} onChange={(event) => setPasswordForm((current) => ({ ...current, new_password: event.target.value }))} autoComplete="new-password" />{formErrors.new_password && <small>{formErrors.new_password}</small>}</label>
              <label><span>Confirm new password *</span><input type="password" value={passwordForm.confirm_password} onChange={(event) => setPasswordForm((current) => ({ ...current, confirm_password: event.target.value }))} autoComplete="new-password" />{formErrors.confirm_password && <small>{formErrors.confirm_password}</small>}</label>
              <label><span>Your administrator password *</span><input type="password" value={passwordForm.admin_password} onChange={(event) => setPasswordForm((current) => ({ ...current, admin_password: event.target.value }))} autoComplete="current-password" />{formErrors.admin_password && <small>{formErrors.admin_password}</small>}</label>
              <div className="dd-inline-alert is-info"><Key size={14} /><span>This action requires your current administrator password.</span></div>
              <div className="dd-modal-actions"><button type="button" className="dd-button dd-button-secondary" onClick={closeModal} disabled={saving}>Cancel</button><button type="submit" className="dd-button dd-button-primary" disabled={saving}>{saving && <Loader2 className="dd-spin" size={13} />} Reset password</button></div>
            </form>
          </section>
        </div>
      )}

      {modal === 'status' && selectedUser && (
        <div className="dd-modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget && !saving) closeModal(); }}>
          <section className="dd-modal dd-modal-small" role="dialog" aria-modal="true" aria-labelledby="client-status-title">
            <header><div><h3 id="client-status-title">{normalizeStatus(selectedUser.status) === 'active' ? 'Suspend account' : 'Reactivate account'}</h3><p>{fullName(selectedUser)} · {selectedUser.email}</p></div><button type="button" onClick={closeModal} disabled={saving} aria-label="Close status confirmation"><X size={16} /></button></header>
            <div className="dd-modal-body dd-client-status-confirmation">
              <span className={normalizeStatus(selectedUser.status) === 'active' ? 'is-warning' : 'is-success'}>{normalizeStatus(selectedUser.status) === 'active' ? <UserX size={22} /> : <CheckCircle size={22} />}</span>
              <p>{normalizeStatus(selectedUser.status) === 'active' ? 'Suspension blocks access while preserving the account and its audit history.' : 'Reactivation restores the user’s ability to sign in to their assigned workspace.'}</p>
              <div className="dd-modal-actions"><button type="button" className="dd-button dd-button-secondary" onClick={closeModal} disabled={saving}>Cancel</button><button type="button" className="dd-button dd-button-primary" onClick={confirmStatusChange} disabled={saving}>{saving && <Loader2 className="dd-spin" size={13} />}{normalizeStatus(selectedUser.status) === 'active' ? 'Suspend account' : 'Reactivate account'}</button></div>
            </div>
          </section>
        </div>
      )}

      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </main>
  );
};

export default ClientAndRegistrarManagement;
