import React, { useEffect, useState } from 'react';
import {
  AlertCircle, Building2, Calendar, ChevronLeft, ChevronRight, Download, Edit3,
  Eye, KeyRound, Mail, Phone, Plus, Scale, Search, ShieldCheck, Trash2,
  UserCheck, UserX, Users, X,
} from 'lucide-react';
import { apiDelete, apiGet, apiPost, apiPut } from '../../utils/api';
import AdminHeader from './AdminHeader';
import { ToastContainer, useToast } from '../Toast';
import { Badge, Button, IconButton, Input, PageHeader, Panel, Select } from '../ui';

const EMPTY_FORM = {
  email: '', first_name: '', last_name: '', phone_number: '', organization: '',
  job_title: '', user_type: 'corporate_client', status: 'active', entity_type: '',
  entity_id: null, court_type: '', password: '', confirm_password: '',
};

const EMPTY_STATS = {
  totalCorporateClients: 0, totalRegistrars: 0, activeCorporateClients: 0,
  activeRegistrars: 0, inactiveCorporateClients: 0, inactiveRegistrars: 0,
  pendingCorporateClients: 0, pendingRegistrars: 0,
};

const TYPE_FILTERS = [
  { value: 'all', label: 'All accounts' },
  { value: 'corporate_client', label: 'Corporate clients' },
  { value: 'court_registrar', label: 'Court registrars' },
];

const STATUS_VARIANTS = { active: 'success', inactive: 'neutral', pending: 'warning', suspended: 'danger' };

const MOCK_USERS = [
  { id: 1, email: 'tonia.martins@accessbank.com', first_name: 'Tonia', last_name: 'Martins', phone_number: '+233 24 123 4567', organization: 'Access Bank', job_title: 'Compliance Officer', user_type: 'corporate_client', entity_type: 'bank', status: 'active', created_at: '2024-01-15T10:00:00Z', last_login: '2024-11-20T14:30:00Z' },
  { id: 2, email: 'ben.frimpong@highcourt.gov.gh', first_name: 'Ben', last_name: 'Frimpong', phone_number: '+233 24 234 5678', organization: 'High Court, Accra', job_title: 'Court Registrar', user_type: 'court_registrar', court_type: 'high_court', status: 'active', created_at: '2024-02-10T09:00:00Z', last_login: '2024-11-20T16:45:00Z' },
  { id: 3, email: 'john.doe@ecobank.com', first_name: 'John', last_name: 'Doe', phone_number: '+233 24 345 6789', organization: 'Ecobank Ghana', job_title: 'Risk Manager', user_type: 'corporate_client', entity_type: 'bank', status: 'active', created_at: '2024-03-20T11:00:00Z', last_login: '2024-11-19T10:20:00Z' },
  { id: 4, email: 'mary.osei@supremecourt.gov.gh', first_name: 'Mary', last_name: 'Osei', phone_number: '+233 24 456 7890', organization: 'Supreme Court', job_title: 'Senior Registrar', user_type: 'court_registrar', court_type: 'supreme_court', status: 'active', created_at: '2024-04-05T08:00:00Z', last_login: '2024-11-20T12:15:00Z' },
  { id: 5, email: 'sarah.akoto@calbank.com', first_name: 'Sarah', last_name: 'Akoto', phone_number: '+233 24 567 8901', organization: 'CalBank', job_title: 'Legal Advisor', user_type: 'corporate_client', entity_type: 'bank', status: 'pending', created_at: '2024-11-15T13:00:00Z', last_login: null },
];

const getUserName = (user) => [user?.first_name, user?.last_name].filter(Boolean).join(' ') || 'Unnamed account';
const getUserTypeLabel = (type) => type === 'court_registrar' ? 'Court registrar' : 'Corporate client';
const formatLabel = (value) => value ? value.replace(/_/g, ' ').replace(/\b\w/g, (letter) => letter.toUpperCase()) : 'Not provided';
const formatDate = (value, empty = 'Never') => {
  if (!value) return empty;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return empty;
  return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
};

const Modal = ({ title, description, onClose, children, size = 'max-w-2xl' }) => (
  <div className="fixed inset-0 z-50 flex items-end justify-center bg-[#102033]/60 p-0 sm:items-center sm:p-4" role="dialog" aria-modal="true" aria-label={title}>
    <div className={`max-h-[94vh] w-full overflow-y-auto rounded-t-lg bg-white shadow-2xl sm:rounded-lg ${size}`}>
      <div className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-[#e3eaed] bg-white px-5 py-4 sm:px-6">
        <div>
          <h2 className="text-lg font-semibold text-[#17334a]">{title}</h2>
          {description && <p className="mt-1 text-sm leading-5 text-[#71818a]">{description}</p>}
        </div>
        <IconButton label="Close dialog" onClick={onClose} className="-mr-2 -mt-1 shrink-0"><X size={19} /></IconButton>
      </div>
      {children}
    </div>
  </div>
);

const AccountAvatar = ({ user, large = false }) => {
  const initials = `${user?.first_name?.[0] || ''}${user?.last_name?.[0] || ''}` || 'U';
  return <span className={`flex shrink-0 items-center justify-center rounded-lg bg-[#e8f3ef] font-bold text-[#126b4c] ${large ? 'h-12 w-12 text-sm' : 'h-9 w-9 text-xs'}`} aria-hidden="true">{initials.toUpperCase()}</span>;
};

const StatusBadge = ({ status }) => (
  <Badge variant={STATUS_VARIANTS[status] || 'neutral'}>
    <span className="h-1.5 w-1.5 rounded-full bg-current" />{formatLabel(status)}
  </Badge>
);

const AccountActions = ({ user, onView, onEdit, onToggle, onReset, onDelete }) => (
  <div className="flex items-center justify-end gap-0.5">
    <IconButton label={`View ${getUserName(user)}`} size="sm" onClick={() => onView(user)}><Eye size={16} /></IconButton>
    <IconButton label={`Edit ${getUserName(user)}`} size="sm" onClick={() => onEdit(user)}><Edit3 size={16} /></IconButton>
    <IconButton label={`${user.status === 'active' ? 'Deactivate' : 'Activate'} ${getUserName(user)}`} size="sm" onClick={() => onToggle(user)}>
      {user.status === 'active' ? <UserX size={16} /> : <UserCheck size={16} />}
    </IconButton>
    <IconButton label={`Reset password for ${getUserName(user)}`} size="sm" onClick={() => onReset(user)}><KeyRound size={16} /></IconButton>
    <IconButton label={`Delete ${getUserName(user)}`} size="sm" className="text-[#a82e3d] hover:!bg-[#fff0f1] hover:!text-[#962535]" onClick={() => onDelete(user)}><Trash2 size={16} /></IconButton>
  </div>
);

const Detail = ({ label, children }) => (
  <div><dt className="text-xs font-semibold uppercase text-[#7a8991]">{label}</dt><dd className="mt-1.5 break-words text-sm font-medium text-[#20384c]">{children || 'Not provided'}</dd></div>
);

const ClientAndRegistrarManagement = ({ userInfo, onNavigate, onLogout }) => {
  const { toasts, success, error: showError, removeToast } = useToast();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [userTypeFilter, setUserTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);
  const [stats, setStats] = useState(EMPTY_STATS);
  const [selectedUser, setSelectedUser] = useState(null);
  const [activeDialog, setActiveDialog] = useState(null);
  const [editingUser, setEditingUser] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [passwordResetData, setPasswordResetData] = useState({ new_password: '', confirm_password: '', admin_password: '' });

  const filteredMocks = () => {
    const search = searchTerm.trim().toLowerCase();
    return MOCK_USERS.filter((user) => {
      const searchable = [user.first_name, user.last_name, user.email, user.organization].filter(Boolean).join(' ').toLowerCase();
      return (userTypeFilter === 'all' || user.user_type === userTypeFilter)
        && (statusFilter === 'all' || user.status === statusFilter)
        && (!search || searchable.includes(search));
    });
  };

  const loadUsers = async () => {
    try {
      setLoading(true);
      const params = { page: currentPage, limit: 10 };
      if (searchTerm.trim()) params.search = searchTerm.trim();
      if (userTypeFilter !== 'all') params.user_type = userTypeFilter;
      if (statusFilter !== 'all') params.status = statusFilter;
      const data = await apiGet('/admin/users/clients-and-registrars', params);
      setUsers(data?.users || []);
      setTotalPages(Math.max(data?.total_pages || 1, 1));
      setTotalUsers(data?.total || 0);
    } catch (error) {
      console.error('Error loading users:', error);
      const fallback = filteredMocks();
      setUsers(fallback);
      setTotalPages(1);
      setTotalUsers(fallback.length);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const data = await apiGet('/admin/users/clients-and-registrars/stats');
      setStats({
        totalCorporateClients: data?.totalCorporateClients ?? data?.total_corporate_clients ?? 0,
        totalRegistrars: data?.totalRegistrars ?? data?.total_registrars ?? 0,
        activeCorporateClients: data?.activeCorporateClients ?? data?.active_corporate_clients ?? 0,
        activeRegistrars: data?.activeRegistrars ?? data?.active_registrars ?? 0,
        inactiveCorporateClients: data?.inactiveCorporateClients ?? data?.inactive_corporate_clients ?? 0,
        inactiveRegistrars: data?.inactiveRegistrars ?? data?.inactive_registrars ?? 0,
        pendingCorporateClients: data?.pendingCorporateClients ?? data?.pending_corporate_clients ?? 0,
        pendingRegistrars: data?.pendingRegistrars ?? data?.pending_registrars ?? 0,
      });
    } catch (error) {
      console.error('Error loading user statistics:', error);
      setStats({ totalCorporateClients: 15, totalRegistrars: 10, activeCorporateClients: 12, activeRegistrars: 8, inactiveCorporateClients: 2, inactiveRegistrars: 1, pendingCorporateClients: 1, pendingRegistrars: 1 });
    }
  };

  useEffect(() => {
    const timer = window.setTimeout(loadUsers, searchTerm ? 250 : 0);
    return () => window.clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, searchTerm, userTypeFilter, statusFilter]);

  useEffect(() => {
    loadStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const closeDialog = () => {
    setActiveDialog(null); setSelectedUser(null); setEditingUser(null); setErrors({});
    setPasswordResetData({ new_password: '', confirm_password: '', admin_password: '' });
  };

  const handleCreateUser = () => {
    setEditingUser(null); setFormData(EMPTY_FORM); setErrors({}); setActiveDialog('form');
  };

  const handleEditUser = (user) => {
    setEditingUser(user);
    setFormData({
      ...EMPTY_FORM, email: user.email || '', first_name: user.first_name || '', last_name: user.last_name || '',
      phone_number: user.phone_number || '', organization: user.organization || '', job_title: user.job_title || '',
      user_type: user.user_type || 'corporate_client', status: user.status || 'active', entity_type: user.entity_type || '',
      entity_id: user.entity_id || null, court_type: user.court_type || '',
    });
    setErrors({}); setActiveDialog('form');
  };

  const openUserDialog = (dialog, user) => { setSelectedUser(user); setErrors({}); setActiveDialog(dialog); };

  const handleFormChange = (event) => {
    const { name, value } = event.target;
    setFormData((current) => ({ ...current, [name]: value, ...(name === 'user_type' && value === 'corporate_client' ? { court_type: '' } : {}) }));
    if (errors[name]) setErrors((current) => ({ ...current, [name]: '' }));
  };

  const validateForm = () => {
    const next = {};
    if (!formData.email) next.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) next.email = 'Enter a valid email address';
    if (!formData.first_name) next.first_name = 'First name is required';
    if (!formData.last_name) next.last_name = 'Last name is required';
    if (!editingUser) {
      if (!formData.password) next.password = 'Password is required';
      else if (formData.password.length < 8) next.password = 'Use at least 8 characters';
      if (formData.password !== formData.confirm_password) next.confirm_password = 'Passwords do not match';
    }
    if (formData.user_type === 'court_registrar' && !formData.court_type) next.court_type = 'Court type is required';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!validateForm()) { showError('Please review the highlighted fields'); return; }
    try {
      setIsSaving(true);
      const submitData = { ...formData };
      if (editingUser) { delete submitData.password; delete submitData.confirm_password; }
      if (editingUser) await apiPut(`/admin/users/${editingUser.id}`, submitData);
      else await apiPost('/admin/users', submitData);
      success(editingUser ? 'Account updated successfully' : 'Account created successfully');
      closeDialog();
      await Promise.all([loadUsers(), loadStats()]);
    } catch (error) {
      console.error('Error saving user:', error);
      showError(error.message || error.detail || 'Failed to save account');
      if (error.data?.detail) setErrors(typeof error.data.detail === 'object' ? error.data.detail : { general: error.data.detail });
    } finally { setIsSaving(false); }
  };

  const handleToggleStatus = async (user) => {
    const status = user.status === 'active' ? 'inactive' : 'active';
    try {
      await apiPut(`/admin/users/${user.id}`, { status });
      success(`${getUserName(user)} is now ${status}`);
      await Promise.all([loadUsers(), loadStats()]);
    } catch (error) {
      console.error('Error updating user status:', error);
      showError(error.message || error.detail || 'Failed to update account status');
    }
  };

  const handleDelete = async () => {
    try {
      setIsSaving(true);
      await apiDelete(`/admin/users/${selectedUser.id}`);
      success(`${getUserName(selectedUser)} was removed`);
      closeDialog();
      await Promise.all([loadUsers(), loadStats()]);
    } catch (error) {
      console.error('Error deleting user:', error);
      showError(error.message || error.detail || 'Failed to delete account');
    } finally { setIsSaving(false); }
  };

  const handlePasswordResetSubmit = async (event) => {
    event.preventDefault();
    const next = {};
    if (!passwordResetData.admin_password) next.admin_password = 'Admin password is required';
    if (passwordResetData.new_password.length < 8) next.password = 'Use at least 8 characters';
    else if (passwordResetData.new_password !== passwordResetData.confirm_password) next.confirm_password = 'Passwords do not match';
    if (Object.keys(next).length) { setErrors(next); showError('Please review the highlighted fields'); return; }
    try {
      setIsSaving(true);
      await apiPost(`/admin/users/${selectedUser.id}/reset-password`, { new_password: passwordResetData.new_password, admin_password: passwordResetData.admin_password });
      success(`Password reset for ${getUserName(selectedUser)}`); closeDialog();
    } catch (error) {
      console.error('Error resetting password:', error);
      showError(error.message || error.detail || 'Failed to reset password');
      if (error.data?.detail) setErrors(typeof error.data.detail === 'object' ? error.data.detail : { general: error.data.detail });
    } finally { setIsSaving(false); }
  };

  const handleExport = () => {
    if (!users.length) { showError('There are no accounts to export'); return; }
    const columns = [
      ['Name', (user) => getUserName(user)], ['Email', (user) => user.email], ['Phone', (user) => user.phone_number],
      ['Account type', (user) => getUserTypeLabel(user.user_type)], ['Organisation', (user) => user.organization],
      ['Job title', (user) => user.job_title], ['Status', (user) => formatLabel(user.status)],
      ['Created', (user) => formatDate(user.created_at, '')], ['Last login', (user) => formatDate(user.last_login, '')],
    ];
    const escape = (value) => `"${String(value ?? '').replace(/"/g, '""')}"`;
    const csv = [columns.map(([label]) => escape(label)).join(','), ...users.map((user) => columns.map(([, get]) => escape(get(user))).join(','))].join('\n');
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8;' }));
    const link = document.createElement('a');
    link.href = url; link.download = `juridence-accounts-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link); link.click(); document.body.removeChild(link); URL.revokeObjectURL(url);
    success(`Exported ${users.length} account${users.length === 1 ? '' : 's'}`);
  };

  const clearFilters = () => { setSearchTerm(''); setUserTypeFilter('all'); setStatusFilter('all'); setCurrentPage(1); };
  const hasFilters = Boolean(searchTerm || userTypeFilter !== 'all' || statusFilter !== 'all');
  const statsCards = [
    { label: 'Corporate clients', value: stats.totalCorporateClients, icon: Building2, tone: 'text-[#245b8f]', bg: 'bg-[#e7f0f8]' },
    { label: 'Court registrars', value: stats.totalRegistrars, icon: Scale, tone: 'text-[#6b4f9a]', bg: 'bg-[#f0ebf7]' },
    { label: 'Active accounts', value: stats.activeCorporateClients + stats.activeRegistrars, icon: ShieldCheck, tone: 'text-[#0c6b4a]', bg: 'bg-[#e2f4eb]' },
    { label: 'Pending review', value: stats.pendingCorporateClients + stats.pendingRegistrars, icon: AlertCircle, tone: 'text-[#8b5a10]', bg: 'bg-[#fff2d9]' },
  ];
  const actions = {
    onView: (user) => openUserDialog('view', user), onEdit: handleEditUser, onToggle: handleToggleStatus,
    onReset: (user) => openUserDialog('password', user), onDelete: (user) => openUserDialog('delete', user),
  };

  return (
    <div className="ui-page">
      <AdminHeader userInfo={userInfo} onNavigate={onNavigate} onLogout={onLogout} contextLabel="Clients & registrars" />
      <main className="ui-page-content">
        <PageHeader
          eyebrow="User management" title="Clients & registrars"
          description="Manage access, account status and credentials for external users."
          actions={<><Button variant="outline" icon={<Download size={17} />} onClick={handleExport}>Export</Button><Button icon={<Plus size={17} />} onClick={handleCreateUser}>Add account</Button></>}
        />

        <section className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4" aria-label="Account summary">
          {statsCards.map(({ label, value, icon: Icon, tone, bg }) => (
            <div key={label} className="flex min-h-[112px] items-center gap-3 rounded-lg border border-[#d9e2e6] bg-white p-4 shadow-sm sm:gap-4 sm:p-5">
              <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg sm:h-11 sm:w-11 ${bg} ${tone}`}><Icon size={20} /></span>
              <div className="min-w-0"><p className="text-2xl font-semibold leading-none text-[#17334a]">{value}</p><p className="mt-2 text-xs font-medium leading-4 text-[#71818a] sm:text-sm">{label}</p></div>
            </div>
          ))}
        </section>

        <Panel title="Account directory" description={`${totalUsers} account${totalUsers === 1 ? '' : 's'} match the current view`} bodyClassName="!p-0">
          <div className="border-b border-[#e3eaed] px-4 py-4 sm:px-6">
            <div className="flex gap-1 overflow-x-auto rounded-lg bg-[#edf2f3] p-1" role="tablist" aria-label="Account type">
              {TYPE_FILTERS.map((filter) => (
                <button key={filter.value} type="button" role="tab" aria-selected={userTypeFilter === filter.value}
                  onClick={() => { setUserTypeFilter(filter.value); setCurrentPage(1); }}
                  className={`min-h-[36px] shrink-0 rounded-md px-3 text-sm font-semibold transition-colors sm:flex-1 ${userTypeFilter === filter.value ? 'bg-white text-[#17334a] shadow-sm' : 'text-[#60737d] hover:text-[#17334a]'}`}>
                  {filter.label}
                </button>
              ))}
            </div>
            <div className="mt-4 grid gap-3 md:grid-cols-[minmax(240px,1fr)_220px_auto]">
              <Input aria-label="Search accounts" leadingIcon={<Search size={18} />} placeholder="Search name, email or organisation" value={searchTerm} onChange={(event) => { setSearchTerm(event.target.value); setCurrentPage(1); }} />
              <Select aria-label="Filter by account status" value={statusFilter} onChange={(event) => { setStatusFilter(event.target.value); setCurrentPage(1); }}>
                <option value="all">All statuses</option><option value="active">Active</option><option value="pending">Pending</option><option value="inactive">Inactive</option><option value="suspended">Suspended</option>
              </Select>
              {hasFilters && <Button variant="ghost" onClick={clearFilters} className="md:px-3">Clear filters</Button>}
            </div>
          </div>

          {loading ? (
            <div className="flex min-h-[300px] flex-col items-center justify-center px-6 text-center"><span className="h-8 w-8 animate-spin rounded-full border-2 border-[#c7d3d8] border-t-[#17875a]" /><p className="mt-4 text-sm font-medium text-[#60737d]">Loading accounts...</p></div>
          ) : users.length === 0 ? (
            <div className="flex min-h-[300px] flex-col items-center justify-center px-6 text-center">
              <span className="flex h-12 w-12 items-center justify-center rounded-lg bg-[#edf2f3] text-[#60737d]"><Users size={23} /></span>
              <h3 className="mt-4 font-semibold text-[#17334a]">No accounts found</h3>
              <p className="mt-1 max-w-sm text-sm leading-6 text-[#71818a]">{hasFilters ? 'Try a different search or clear the filters.' : 'Add the first client or registrar account.'}</p>
              <Button variant={hasFilters ? 'outline' : 'primary'} onClick={hasFilters ? clearFilters : handleCreateUser} className="mt-5">{hasFilters ? 'Clear filters' : 'Add account'}</Button>
            </div>
          ) : (
            <>
              <div className="hidden overflow-x-auto lg:block">
                <table className="w-full min-w-[1040px]">
                  <thead><tr className="bg-[#f7f9fa] text-left"><th className="px-6 py-3">Account</th><th className="px-4 py-3">Type</th><th className="px-4 py-3">Organisation</th><th className="px-4 py-3">Status</th><th className="px-4 py-3">Created</th><th className="px-4 py-3">Last login</th><th className="px-6 py-3 text-right">Actions</th></tr></thead>
                  <tbody>
                    {users.map((user) => {
                      const TypeIcon = user.user_type === 'court_registrar' ? Scale : Building2;
                      return (
                        <tr key={user.id} className="border-t border-[#e7edef] transition-colors hover:bg-[#f8faf9]">
                          <td className="px-6 py-4"><div className="flex items-center gap-3"><AccountAvatar user={user} /><div className="min-w-0"><p className="font-semibold text-[#20384c]">{getUserName(user)}</p><p className="mt-0.5 max-w-[240px] truncate text-xs text-[#71818a]">{user.email}</p></div></div></td>
                          <td className="px-4 py-4"><span className="inline-flex items-center gap-2 text-sm font-medium text-[#405867]"><TypeIcon size={15} className="text-[#71838d]" />{getUserTypeLabel(user.user_type)}</span></td>
                          <td className="max-w-[190px] px-4 py-4"><p className="truncate text-sm font-medium text-[#405867]">{user.organization || 'Not provided'}</p>{user.job_title && <p className="mt-0.5 truncate text-xs text-[#7a8991]">{user.job_title}</p>}</td>
                          <td className="px-4 py-4"><StatusBadge status={user.status} /></td>
                          <td className="whitespace-nowrap px-4 py-4 text-sm text-[#60737d]">{formatDate(user.created_at, 'Unknown')}</td>
                          <td className="whitespace-nowrap px-4 py-4 text-sm text-[#60737d]">{formatDate(user.last_login)}</td>
                          <td className="px-6 py-4"><AccountActions user={user} {...actions} /></td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              <div className="divide-y divide-[#e7edef] lg:hidden">
                {users.map((user) => (
                  <article key={user.id} className="px-4 py-5 sm:px-6">
                    <div className="flex items-start gap-3"><AccountAvatar user={user} large /><div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-start justify-between gap-2"><div className="min-w-0"><h3 className="truncate font-semibold text-[#20384c]">{getUserName(user)}</h3><p className="mt-0.5 truncate text-xs text-[#71818a]">{user.email}</p></div><StatusBadge status={user.status} /></div>
                      <div className="mt-3 grid grid-cols-2 gap-x-3 gap-y-2 text-xs"><p className="text-[#71818a]">Type <span className="block font-semibold text-[#405867]">{getUserTypeLabel(user.user_type)}</span></p><p className="text-[#71818a]">Created <span className="block font-semibold text-[#405867]">{formatDate(user.created_at, 'Unknown')}</span></p><p className="col-span-2 min-w-0 text-[#71818a]">Organisation <span className="block truncate font-semibold text-[#405867]">{user.organization || 'Not provided'}</span></p></div>
                    </div></div>
                    <div className="mt-4 flex justify-end border-t border-[#edf1f3] pt-2"><AccountActions user={user} {...actions} /></div>
                  </article>
                ))}
              </div>
            </>
          )}

          {!loading && users.length > 0 && (
            <div className="flex flex-col gap-3 border-t border-[#e3eaed] px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
              <p className="text-xs font-medium text-[#71818a]">Page {currentPage} of {totalPages} / {totalUsers} account{totalUsers === 1 ? '' : 's'}</p>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" icon={<ChevronLeft size={16} />} disabled={currentPage <= 1} onClick={() => setCurrentPage((page) => Math.max(page - 1, 1))}>Previous</Button>
                <Button variant="outline" size="sm" icon={<ChevronRight size={16} />} iconPosition="right" disabled={currentPage >= totalPages} onClick={() => setCurrentPage((page) => Math.min(page + 1, totalPages))}>Next</Button>
              </div>
            </div>
          )}
        </Panel>
      </main>

      {activeDialog === 'view' && selectedUser && (
        <Modal title="Account details" description="Identity, access and organisation information." onClose={closeDialog}>
          <div className="p-5 sm:p-6">
            <div className="flex items-center gap-4 border-b border-[#e3eaed] pb-5"><AccountAvatar user={selectedUser} large /><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><h3 className="text-lg font-semibold text-[#17334a]">{getUserName(selectedUser)}</h3><StatusBadge status={selectedUser.status} /></div><p className="mt-1 text-sm text-[#71818a]">{getUserTypeLabel(selectedUser.user_type)}</p></div></div>
            <dl className="mt-6 grid gap-x-8 gap-y-6 sm:grid-cols-2">
              <Detail label="Email"><span className="inline-flex items-center gap-2"><Mail size={15} />{selectedUser.email}</span></Detail>
              <Detail label="Phone"><span className="inline-flex items-center gap-2"><Phone size={15} />{selectedUser.phone_number || 'Not provided'}</span></Detail>
              <Detail label="Organisation">{selectedUser.organization}</Detail><Detail label="Job title">{selectedUser.job_title}</Detail>
              <Detail label="Created"><span className="inline-flex items-center gap-2"><Calendar size={15} />{formatDate(selectedUser.created_at, 'Unknown')}</span></Detail><Detail label="Last login">{formatDate(selectedUser.last_login)}</Detail>
              {selectedUser.user_type === 'court_registrar' && <Detail label="Court type">{formatLabel(selectedUser.court_type)}</Detail>}
              {selectedUser.user_type === 'corporate_client' && selectedUser.entity_type && <Detail label="Entity type">{formatLabel(selectedUser.entity_type)}</Detail>}
            </dl>
          </div>
          <div className="flex justify-end gap-2 border-t border-[#e3eaed] px-5 py-4 sm:px-6"><Button variant="outline" onClick={closeDialog}>Close</Button><Button icon={<Edit3 size={16} />} onClick={() => handleEditUser(selectedUser)}>Edit account</Button></div>
        </Modal>
      )}

      {activeDialog === 'form' && (
        <Modal title={editingUser ? 'Edit account' : 'Add account'} description={editingUser ? 'Update account and access details.' : 'Create access for a corporate client or court registrar.'} onClose={closeDialog}>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-5 p-5 sm:grid-cols-2 sm:p-6">
              {errors.general && <div className="rounded-lg border border-[#f1c7cd] bg-[#fff5f6] p-3 text-sm text-[#a82e3d] sm:col-span-2">{errors.general}</div>}
              <Input label="First name" name="first_name" value={formData.first_name} onChange={handleFormChange} error={errors.first_name} required />
              <Input label="Last name" name="last_name" value={formData.last_name} onChange={handleFormChange} error={errors.last_name} required />
              <Input label="Email address" name="email" type="email" value={formData.email} onChange={handleFormChange} error={errors.email} required className="sm:col-span-2" />
              <Select label="Account type" name="user_type" value={formData.user_type} onChange={handleFormChange} required><option value="corporate_client">Corporate client</option><option value="court_registrar">Court registrar</option></Select>
              <Select label="Status" name="status" value={formData.status} onChange={handleFormChange} required><option value="active">Active</option><option value="pending">Pending</option><option value="inactive">Inactive</option><option value="suspended">Suspended</option></Select>
              <Input label="Phone number" name="phone_number" type="tel" value={formData.phone_number} onChange={handleFormChange} placeholder="e.g. +233 24 000 0000" />
              <Input label="Organisation" name="organization" value={formData.organization} onChange={handleFormChange} />
              <Input label="Job title" name="job_title" value={formData.job_title} onChange={handleFormChange} className={formData.user_type === 'corporate_client' ? 'sm:col-span-2' : ''} />
              {formData.user_type === 'court_registrar' && <Select label="Court type" name="court_type" value={formData.court_type} onChange={handleFormChange} error={errors.court_type} required><option value="">Select court type</option><option value="supreme_court">Supreme Court</option><option value="court_of_appeal">Court of Appeal</option><option value="high_court">High Court</option><option value="circuit_court">Circuit Court</option><option value="district_court">District Court</option></Select>}
              {!editingUser && <><Input label="Temporary password" name="password" type="password" value={formData.password} onChange={handleFormChange} error={errors.password} hint="At least 8 characters" required /><Input label="Confirm password" name="confirm_password" type="password" value={formData.confirm_password} onChange={handleFormChange} error={errors.confirm_password} required /></>}
            </div>
            <div className="flex flex-col-reverse gap-2 border-t border-[#e3eaed] px-5 py-4 sm:flex-row sm:justify-end sm:px-6"><Button variant="outline" onClick={closeDialog}>Cancel</Button><Button type="submit" loading={isSaving}>{editingUser ? 'Save changes' : 'Create account'}</Button></div>
          </form>
        </Modal>
      )}

      {activeDialog === 'delete' && selectedUser && (
        <Modal title="Remove account" description="This action cannot be undone." onClose={closeDialog} size="max-w-md">
          <div className="p-5 sm:p-6"><div className="flex items-start gap-3 rounded-lg border border-[#f1c7cd] bg-[#fff5f6] p-4"><span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#fff0f1] text-[#a82e3d]"><Trash2 size={18} /></span><p className="text-sm leading-6 text-[#405867]">Remove <strong className="text-[#20384c]">{getUserName(selectedUser)}</strong> and revoke their Juridence access?</p></div></div>
          <div className="flex flex-col-reverse gap-2 border-t border-[#e3eaed] px-5 py-4 sm:flex-row sm:justify-end sm:px-6"><Button variant="outline" onClick={closeDialog}>Cancel</Button><Button variant="danger" loading={isSaving} icon={<Trash2 size={16} />} onClick={handleDelete}>Remove account</Button></div>
        </Modal>
      )}

      {activeDialog === 'password' && selectedUser && (
        <Modal title="Reset password" description={`Set a new password for ${getUserName(selectedUser)}.`} onClose={closeDialog} size="max-w-md">
          <form onSubmit={handlePasswordResetSubmit}>
            <div className="space-y-5 p-5 sm:p-6">
              {errors.general && <p className="rounded-lg border border-[#f1c7cd] bg-[#fff5f6] p-3 text-sm text-[#a82e3d]">{errors.general}</p>}
              <Input label="New password" type="password" value={passwordResetData.new_password} onChange={(event) => setPasswordResetData((data) => ({ ...data, new_password: event.target.value }))} error={errors.password} hint="At least 8 characters" required />
              <Input label="Confirm new password" type="password" value={passwordResetData.confirm_password} onChange={(event) => setPasswordResetData((data) => ({ ...data, confirm_password: event.target.value }))} error={errors.confirm_password} required />
              <Input label="Your admin password" type="password" value={passwordResetData.admin_password} onChange={(event) => setPasswordResetData((data) => ({ ...data, admin_password: event.target.value }))} error={errors.admin_password} hint="Required to authorise this change" required />
            </div>
            <div className="flex flex-col-reverse gap-2 border-t border-[#e3eaed] px-5 py-4 sm:flex-row sm:justify-end sm:px-6"><Button variant="outline" onClick={closeDialog}>Cancel</Button><Button type="submit" loading={isSaving} icon={<KeyRound size={16} />}>Reset password</Button></div>
          </form>
        </Modal>
      )}

      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </div>
  );
};

export default ClientAndRegistrarManagement;
