import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ArrowRight,
  Check,
  Crown,
  Download,
  Eye,
  KeyRound,
  Loader2,
  RefreshCw,
  Search,
  Settings2,
  ShieldCheck,
  UserCheck,
  Users,
  X,
} from 'lucide-react';
import { apiGet } from '../../utils/api';

const roleProfiles = [
  {
    id: 'admin',
    label: 'Administrator',
    scope: 'System administration',
    description: 'Full platform operations, user administration, data management and policy oversight.',
    icon: ShieldCheck,
    tone: 'admin',
  },
  {
    id: 'user',
    label: 'Standard user',
    scope: 'Core workspace',
    description: 'Entity screening, reports, monitoring and personal workspace services.',
    icon: Users,
    tone: 'standard',
  },
  {
    id: 'premium',
    label: 'Premium user',
    scope: 'Enhanced workspace',
    description: 'Core workspace access with premium services and personal API credentials.',
    icon: Crown,
    tone: 'premium',
  },
];

const capabilityRows = [
  { group: 'Workspace', area: 'Dashboard and entity search', admin: 'full', premium: 'allowed', user: 'allowed' },
  { group: 'Workspace', area: 'Due diligence reports', admin: 'manage', premium: 'full', user: 'allowed' },
  { group: 'Workspace', area: 'Watchlist monitoring', admin: 'manage', premium: 'allowed', user: 'allowed' },
  { group: 'Data', area: 'Data source register', admin: 'manage', premium: 'view', user: 'view' },
  { group: 'Organisation', area: 'Team directory', admin: 'manage', premium: 'view', user: 'view' },
  { group: 'Organisation', area: 'Billing and plan', admin: 'manage', premium: 'view', user: 'view' },
  { group: 'Organisation', area: 'API credentials', admin: 'own', premium: 'own', user: 'none' },
  { group: 'Organisation', area: 'Audit activity', admin: 'full', premium: 'ownActivity', user: 'ownActivity' },
  { group: 'Account', area: 'Personal settings', admin: 'own', premium: 'own', user: 'own' },
  { group: 'Administration', area: 'Platform administration', admin: 'full', premium: 'none', user: 'none' },
  { group: 'Legal', area: 'Legal centre', admin: 'allowed', premium: 'allowed', user: 'allowed' },
];

const accessLabels = {
  full: { label: 'Full access', className: 'is-full', icon: Check },
  manage: { label: 'Manage', className: 'is-manage', icon: Settings2 },
  allowed: { label: 'Allowed', className: 'is-allowed', icon: Check },
  view: { label: 'View only', className: 'is-view', icon: Eye },
  own: { label: 'Own account', className: 'is-own', icon: KeyRound },
  ownActivity: { label: 'Own activity', className: 'is-own', icon: Eye },
  none: { label: 'Not available', className: 'is-none', icon: X },
};

const roleLabel = (role) => roleProfiles.find((profile) => profile.id === role)?.label || 'Standard user';

const roleValue = (user) => {
  if (user?.is_admin || user?.user_type === 'administrator') return 'admin';
  const value = user?.role?.value || user?.role || 'user';
  return String(value).toLowerCase();
};

const statusValue = (user) => String(user?.status?.value || user?.status || 'active').toLowerCase();

const accountClassLabel = (user) => {
  const labels = {
    administrator: 'Administrator',
    workspace_user: 'Workspace member',
    corporate_client: 'Corporate client',
    court_registrar: 'Court registrar',
  };
  return labels[user?.user_type] || 'Workspace member';
};

const formatDate = (value) => {
  if (!value) return 'Never';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Not recorded';
  return new Intl.DateTimeFormat('en-GB', {
    day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
  }).format(date);
};

const initials = (user) => (
  `${user?.first_name?.[0] || ''}${user?.last_name?.[0] || ''}`.toUpperCase() || 'U'
);

const AccessValue = ({ value }) => {
  const config = accessLabels[value] || accessLabels.none;
  const Icon = config.icon;
  return <span className={`dd-permission-state ${config.className}`}><Icon size={11} />{config.label}</span>;
};

const RolesPermissionsManagement = ({ userInfo, onNavigate }) => {
  const [view, setView] = useState('profiles');
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');
  const [assignmentRole, setAssignmentRole] = useState('all');
  const [assignmentStatus, setAssignmentStatus] = useState('all');
  const [page, setPage] = useState(1);
  const [selectedRole, setSelectedRole] = useState(null);

  const loadAccess = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [usersPayload, statsPayload] = await Promise.all([
        apiGet('/admin/users', { page: 1, limit: 100 }),
        apiGet('/admin/users/stats'),
      ]);
      setUsers(usersPayload.users || []);
      setStats(statsPayload || {});
    } catch (requestError) {
      setError(requestError.message || 'Access information could not be loaded.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadAccess(); }, [loadAccess]);

  const roleCounts = useMemo(() => users.reduce((counts, user) => {
    const role = roleValue(user);
    counts[role] = (counts[role] || 0) + 1;
    return counts;
  }, { admin: 0, user: 0, premium: 0 }), [users]);

  const filteredUsers = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return users.filter((user) => {
      const role = roleValue(user);
      const status = statusValue(user);
      const haystack = [
        user.first_name, user.last_name, user.email, user.organization, user.job_title,
        roleLabel(role), accountClassLabel(user),
      ].filter(Boolean).join(' ').toLowerCase();
      return (assignmentRole === 'all' || role === assignmentRole)
        && (assignmentStatus === 'all' || status === assignmentStatus)
        && (!needle || haystack.includes(needle));
    });
  }, [users, query, assignmentRole, assignmentStatus]);

  const pageSize = 10;
  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const pagedUsers = filteredUsers.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  const rangeStart = filteredUsers.length ? ((currentPage - 1) * pageSize) + 1 : 0;
  const rangeEnd = Math.min(currentPage * pageSize, filteredUsers.length);

  useEffect(() => { setPage(1); }, [query, assignmentRole, assignmentStatus]);

  const openAssignments = (role = 'all') => {
    setAssignmentRole(role);
    setQuery('');
    setAssignmentStatus('all');
    setView('assignments');
  };

  const clearFilters = () => {
    setQuery('');
    setAssignmentRole('all');
    setAssignmentStatus('all');
  };

  const exportAssignments = () => {
    const quote = (value) => `"${String(value ?? '').replace(/"/g, '""')}"`;
    const rows = [
      ['Name', 'Email', 'Access role', 'Account class', 'Organisation', 'Status', 'Last sign-in'],
      ...filteredUsers.map((user) => [
        `${user.first_name || ''} ${user.last_name || ''}`.trim(), user.email, roleLabel(roleValue(user)),
        accountClassLabel(user), user.organization || '', statusValue(user), formatDate(user.last_login),
      ]),
    ];
    const blob = new Blob([rows.map((row) => row.map(quote).join(',')).join('\n')], { type: 'text/csv;charset=utf-8' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'juridence-access-assignments.csv';
    link.click();
    URL.revokeObjectURL(link.href);
  };

  const currentEmail = String(userInfo?.email || '').toLowerCase();
  const SelectedRoleIcon = selectedRole?.icon || ShieldCheck;

  return (
    <div className="dd-role-admin">
      <section className="dd-module-shell">
        <div className="dd-module-heading">
          <div>
            <p className="dd-eyebrow">Access governance</p>
            <h2>Roles &amp; Permissions</h2>
            <p>System access profiles, effective capabilities and current user assignments.</p>
          </div>
          <div className="dd-heading-actions">
            <button type="button" className="dd-button dd-button-secondary" onClick={loadAccess} disabled={loading}><RefreshCw size={13} className={loading ? 'dd-spin' : ''} /> Refresh</button>
            <button type="button" className="dd-button dd-button-primary" onClick={() => onNavigate?.('users')}><UserCheck size={13} /> Manage users</button>
          </div>
        </div>
      </section>

      {loading ? (
        <section className="dd-module-shell"><div className="dd-loading-state"><Loader2 className="dd-spin" size={17} /> Loading access policy</div></section>
      ) : error ? (
        <section className="dd-module-shell"><div className="dd-empty-state"><ShieldCheck size={22} /><strong>Access policy is unavailable</strong><p>{error}</p><button type="button" className="dd-button dd-button-secondary" onClick={loadAccess}><RefreshCw size={13} /> Try again</button></div></section>
      ) : (
        <>
          <section className="dd-kpi-row dd-kpi-row-four" aria-label="Access governance summary">
            <article><ShieldCheck size={19} /><div><strong>{roleProfiles.length}</strong><span>System profiles</span></div></article>
            <article><UserCheck size={19} /><div><strong>{stats.active_users ?? users.filter((user) => statusValue(user) === 'active').length}</strong><span>Active accounts</span></div></article>
            <article><Users size={19} /><div><strong>{roleCounts.admin}</strong><span>Administrators</span></div></article>
            <article><Crown size={19} /><div><strong>{roleCounts.premium}</strong><span>Premium users</span></div></article>
          </section>

          <div className="dd-info-strip"><ShieldCheck size={14} /><span>Access role controls platform privileges. Account class records the workspace or organisation represented by the user.</span></div>

          <section className="dd-module-shell dd-role-admin-panel">
            <div className="dd-role-view-tabs" role="tablist" aria-label="Roles and permissions views">
              <button type="button" role="tab" aria-selected={view === 'profiles'} className={view === 'profiles' ? 'is-active' : ''} onClick={() => setView('profiles')}><ShieldCheck size={13} /> Access profiles <span>{roleProfiles.length}</span></button>
              <button type="button" role="tab" aria-selected={view === 'matrix'} className={view === 'matrix' ? 'is-active' : ''} onClick={() => setView('matrix')}><Settings2 size={13} /> Capability matrix <span>{capabilityRows.length}</span></button>
              <button type="button" role="tab" aria-selected={view === 'assignments'} className={view === 'assignments' ? 'is-active' : ''} onClick={() => openAssignments()}><Users size={13} /> User assignments <span>{users.length}</span></button>
            </div>

            {view === 'profiles' && (
              <div className="dd-role-profile-grid">
                {roleProfiles.map((profile) => {
                  const Icon = profile.icon;
                  const count = roleCounts[profile.id] || 0;
                  const active = users.filter((user) => roleValue(user) === profile.id && statusValue(user) === 'active').length;
                  return (
                    <article className={`dd-role-profile-card is-${profile.tone}`} key={profile.id}>
                      <header>
                        <span className="dd-role-profile-icon"><Icon size={18} /></span>
                        <span className="dd-role-system-tag"><ShieldCheck size={10} /> System profile</span>
                      </header>
                      <div className="dd-role-profile-copy">
                        <h3>{profile.label}</h3>
                        <strong>{profile.scope}</strong>
                        <p>{profile.description}</p>
                      </div>
                      <dl className="dd-role-profile-counts">
                        <div><dt>Assigned</dt><dd>{count}</dd></div>
                        <div><dt>Active</dt><dd>{active}</dd></div>
                        <div><dt>Capability areas</dt><dd>{capabilityRows.filter((row) => row[profile.id] !== 'none').length}</dd></div>
                      </dl>
                      <footer>
                        <button type="button" onClick={() => setSelectedRole(profile)}><Eye size={12} /> View profile</button>
                        <button type="button" onClick={() => openAssignments(profile.id)}>View assignments <ArrowRight size={12} /></button>
                      </footer>
                    </article>
                  );
                })}
              </div>
            )}

            {view === 'matrix' && (
              <>
                <div className="dd-list-header dd-role-matrix-header"><div><strong>Current access policy</strong><span>{capabilityRows.length} capability areas across three system profiles</span></div><Settings2 size={16} /></div>
                <div className="dd-table-wrap dd-role-matrix-table">
                  <table className="dd-data-table">
                    <thead><tr><th>Policy group</th><th>Capability area</th><th>Administrator</th><th>Premium user</th><th>Standard user</th></tr></thead>
                    <tbody>{capabilityRows.map((row) => (
                      <tr key={`${row.group}-${row.area}`}><td><span className="dd-policy-group">{row.group}</span></td><td><strong>{row.area}</strong></td><td><AccessValue value={row.admin} /></td><td><AccessValue value={row.premium} /></td><td><AccessValue value={row.user} /></td></tr>
                    ))}</tbody>
                  </table>
                </div>
              </>
            )}

            {view === 'assignments' && (
              <>
                <div className="dd-role-filter-bar">
                  <label className="dd-role-search-field"><span>Search assignments</span><span className="dd-search-control"><Search size={13} /><input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Name, email or organisation" aria-label="Search role assignments" /></span></label>
                  <label><span>Access role</span><select className="dd-select-control" value={assignmentRole} onChange={(event) => setAssignmentRole(event.target.value)} aria-label="Filter assignments by role"><option value="all">All roles</option>{roleProfiles.map((profile) => <option value={profile.id} key={profile.id}>{profile.label}</option>)}</select></label>
                  <label><span>Status</span><select className="dd-select-control" value={assignmentStatus} onChange={(event) => setAssignmentStatus(event.target.value)} aria-label="Filter assignments by status"><option value="all">All statuses</option><option value="active">Active</option><option value="pending">Pending</option><option value="inactive">Inactive</option><option value="suspended">Suspended</option></select></label>
                  <button type="button" className="dd-button dd-button-secondary" onClick={clearFilters}>Clear</button>
                  <button type="button" className="dd-button dd-button-secondary" onClick={exportAssignments} disabled={!filteredUsers.length}><Download size={13} /> Export CSV</button>
                </div>
                <div className="dd-list-header dd-role-assignment-header"><div><strong>User assignments</strong><span>{filteredUsers.length} matching account{filteredUsers.length === 1 ? '' : 's'}</span></div><span>Records {rangeStart}-{rangeEnd}</span></div>
                <div className="dd-table-wrap dd-role-assignment-table">
                  <table className="dd-data-table">
                    <thead><tr><th>Account</th><th>Access role</th><th>Account class</th><th>Organisation</th><th>Status</th><th>Last sign-in</th><th></th></tr></thead>
                    <tbody>
                      {pagedUsers.map((user) => {
                        const role = roleValue(user);
                        const isCurrent = currentEmail && String(user.email || '').toLowerCase() === currentEmail;
                        return (
                          <tr key={user.id}>
                            <td><div className="dd-client-account"><span className="dd-team-avatar">{initials(user)}</span><div><strong>{user.first_name} {user.last_name}{isCurrent && <em className="dd-current-user-tag">You</em>}</strong><small>{user.email}</small></div></div></td>
                            <td><span className={`dd-access-role is-${role}`}>{role === 'admin' ? <ShieldCheck size={11} /> : role === 'premium' ? <Crown size={11} /> : <Users size={11} />}{roleLabel(role)}</span></td>
                            <td><strong>{accountClassLabel(user)}</strong><small>{user.court_type ? user.court_type.replaceAll('_', ' ') : user.entity_type ? `${user.entity_type} account` : 'Workspace access'}</small></td>
                            <td><strong>{user.organization || 'Not recorded'}</strong><small>{user.job_title || 'No job title recorded'}</small></td>
                            <td><span className={`dd-status-badge is-${statusValue(user)}`}>{statusValue(user)}</span></td>
                            <td>{formatDate(user.last_login)}</td>
                            <td><button type="button" className="dd-icon-button" title={`View ${roleLabel(role)} profile`} aria-label={`View access profile for ${user.first_name} ${user.last_name}`} onClick={() => setSelectedRole(roleProfiles.find((profile) => profile.id === role) || roleProfiles[1])}><Eye size={13} /></button></td>
                          </tr>
                        );
                      })}
                      {!pagedUsers.length && <tr><td colSpan="7"><div className="dd-empty-table">No account assignments match these filters.</div></td></tr>}
                    </tbody>
                  </table>
                </div>
                <div className="dd-client-pagination">
                  <span>Records {rangeStart}-{rangeEnd} of {filteredUsers.length}</span>
                  <div><button type="button" className="dd-button dd-button-secondary" disabled={currentPage <= 1} onClick={() => setPage((value) => Math.max(1, value - 1))}>Prev</button><span>Page {currentPage} of {totalPages}</span><button type="button" className="dd-button dd-button-secondary" disabled={currentPage >= totalPages} onClick={() => setPage((value) => Math.min(totalPages, value + 1))}>Next</button></div>
                </div>
              </>
            )}
          </section>
        </>
      )}

      {selectedRole && (
        <div className="dd-modal-backdrop" role="presentation">
          <section className="dd-modal dd-role-detail-modal" role="dialog" aria-modal="true" aria-labelledby="role-profile-title">
            <header><div><h3 id="role-profile-title">{selectedRole.label}</h3><p>{selectedRole.scope} - {roleCounts[selectedRole.id] || 0} assigned account{roleCounts[selectedRole.id] === 1 ? '' : 's'}</p></div><button type="button" onClick={() => setSelectedRole(null)} aria-label="Close role profile"><X size={16} /></button></header>
            <div className="dd-modal-body">
              <div className={`dd-role-detail-hero is-${selectedRole.tone}`}><span><SelectedRoleIcon size={19} /></span><div><strong>{selectedRole.description}</strong><small>System profile</small></div></div>
              <div className="dd-role-detail-list">
                {capabilityRows.map((row) => <div key={`${selectedRole.id}-${row.area}`}><span><small>{row.group}</small><strong>{row.area}</strong></span><AccessValue value={row[selectedRole.id]} /></div>)}
              </div>
              <p className="dd-form-note">Access profiles define platform privileges. Account class and organisation assignment remain separate user attributes.</p>
              <div className="dd-modal-actions"><button type="button" className="dd-button dd-button-secondary" onClick={() => setSelectedRole(null)}>Close</button><button type="button" className="dd-button dd-button-primary" onClick={() => { setSelectedRole(null); openAssignments(selectedRole.id); }}><Users size={13} /> View assignments</button></div>
            </div>
          </section>
        </div>
      )}
    </div>
  );
};

export default RolesPermissionsManagement;
