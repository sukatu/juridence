import React, { useEffect, useMemo, useState } from 'react';
import {
  Check,
  Clock3,
  Eye,
  KeyRound,
  Loader2,
  RefreshCw,
  Search,
  Settings2,
  ShieldCheck,
  UserCheck,
  Users,
} from 'lucide-react';
import { apiGet } from '../../utils/api';

const accessRows = [
  ['Dashboard, search and reports', true, true],
  ['Watchlist', true, true],
  ['Data sources', true, true],
  ['Team & roles', true, 'view'],
  ['Billing & plan', true, 'view'],
  ['API credentials', true, 'own'],
  ['Audit log', true, true],
  ['Personal settings', true, true],
  ['Legal centre', true, true],
];

const formatDate = (value) => {
  if (!value) return 'Never';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Not recorded';
  return new Intl.DateTimeFormat('en-GB', {
    day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
  }).format(date);
};

const initials = (member) => (
  `${member.first_name?.[0] || ''}${member.last_name?.[0] || ''}`.toUpperCase() || 'U'
);

const AccessValue = ({ value }) => {
  if (value === true) return <span className="dd-access-value is-allowed"><Check size={12} /> Allowed</span>;
  if (value === 'view') return <span className="dd-access-value"><Eye size={12} /> View only</span>;
  if (value === 'own') return <span className="dd-access-value"><KeyRound size={12} /> Own keys</span>;
  return <span className="dd-access-value is-denied">Not available</span>;
};

const TeamRolesPage = () => {
  const [view, setView] = useState('team');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('all');

  const loadTeam = async () => {
    setLoading(true);
    setError('');
    try {
      setData(await apiGet('/workspace/team'));
    } catch (requestError) {
      setError(requestError.message || 'Team information could not be loaded.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadTeam(); }, []);

  const members = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return (data?.members || []).filter((member) => {
      const matchesStatus = status === 'all' || member.status === status;
      const haystack = [member.first_name, member.last_name, member.email, member.job_title, member.role_label]
        .filter(Boolean).join(' ').toLowerCase();
      return matchesStatus && (!needle || haystack.includes(needle));
    });
  }, [data, query, status]);

  const stats = data?.stats || {};
  const roleCounts = stats.role_counts || {};

  return (
    <>
      <section className="dd-module-shell dd-team-roles-heading">
        <div className="dd-module-heading">
          <div>
            <p className="dd-eyebrow">Organisation access</p>
            <h2>Team & Roles</h2>
            <p>{data?.organization || 'Your workspace'} members and their effective access.</p>
          </div>
          <div className="dd-view-switch" role="tablist" aria-label="Team and role views">
            <button type="button" role="tab" aria-selected={view === 'team'} className={view === 'team' ? 'is-active' : ''} onClick={() => setView('team')}><Users size={14} /> Team</button>
            <button type="button" role="tab" aria-selected={view === 'roles'} className={view === 'roles' ? 'is-active' : ''} onClick={() => setView('roles')}><ShieldCheck size={14} /> Roles & permissions</button>
          </div>
        </div>
      </section>

      {loading ? (
        <section className="dd-module-shell"><div className="dd-loading-state"><Loader2 className="dd-spin" size={17} /> Loading organisation members</div></section>
      ) : error ? (
        <section className="dd-module-shell"><div className="dd-empty-state"><ShieldCheck size={22} /><strong>Team information is unavailable</strong><p>{error}</p><button className="dd-button dd-button-secondary" type="button" onClick={loadTeam}><RefreshCw size={13} /> Try again</button></div></section>
      ) : view === 'team' ? (
        <>
          <section className="dd-kpi-row dd-kpi-row-four" aria-label="Team summary">
            <article><Users size={19} /><div><strong>{stats.total || 0}</strong><span>Total members</span></div></article>
            <article><UserCheck size={19} /><div><strong>{stats.active || 0}</strong><span>Active</span></div></article>
            <article><Clock3 size={19} /><div><strong>{stats.pending || 0}</strong><span>Pending</span></div></article>
            <article><ShieldCheck size={19} /><div><strong>{stats.administrators || 0}</strong><span>Administrators</span></div></article>
          </section>

          {!data?.can_manage && (
            <div className="dd-info-strip"><Eye size={14} /><span>You can view your organisation directory. Membership and role changes require a workspace administrator.</span></div>
          )}

          <section className="dd-module-shell">
            <div className="dd-list-header dd-team-list-header">
              <div><strong>Organisation directory</strong><span>{members.length} of {stats.total || 0} members</span></div>
              <button type="button" className="dd-icon-button" title="Refresh team" aria-label="Refresh team" onClick={loadTeam}><RefreshCw size={13} /></button>
            </div>
            <div className="dd-inline-form dd-team-filter-row">
              <label className="dd-search-control"><Search size={13} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search by name, email or role" aria-label="Search team" /></label>
              <select className="dd-select-control" value={status} onChange={(event) => setStatus(event.target.value)} aria-label="Filter team by status">
                <option value="all">All statuses</option>
                <option value="active">Active</option>
                <option value="pending">Pending</option>
                <option value="inactive">Inactive</option>
                <option value="suspended">Suspended</option>
              </select>
            </div>
            <div className="dd-table-wrap dd-team-table">
              <table className="dd-data-table">
                <thead><tr><th>Member</th><th>Role</th><th>Status</th><th>Last sign-in</th><th>Joined</th></tr></thead>
                <tbody>
                  {members.map((member) => (
                    <tr key={member.id}>
                      <td><div className="dd-team-member"><span className="dd-team-avatar">{initials(member)}</span><div><strong>{member.first_name} {member.last_name}{member.is_current_user && <em className="dd-inline-current">You</em>}</strong><small>{member.email}</small></div></div></td>
                      <td><strong>{member.role_label}</strong><small>{member.job_title || 'No job title recorded'}</small></td>
                      <td><span className={`dd-status-badge is-${member.status}`}>{member.status}</span></td>
                      <td>{formatDate(member.last_login)}</td>
                      <td>{formatDate(member.created_at)}</td>
                    </tr>
                  ))}
                  {!members.length && <tr><td colSpan="5"><div className="dd-empty-table">No members match these filters.</div></td></tr>}
                </tbody>
              </table>
            </div>
          </section>
        </>
      ) : (
        <>
          <section className="dd-role-summary-grid">
            <article><span><ShieldCheck size={17} /></span><div><strong>Workspace administrator</strong><p>Manages organisation membership and workspace-level configuration.</p><small>{roleCounts['Workspace administrator'] || 0} assigned</small></div></article>
            <article><span><Users size={17} /></span><div><strong>Workspace member</strong><p>Uses due diligence tools and manages personal account settings.</p><small>{(stats.total || 0) - (stats.administrators || 0)} assigned</small></div></article>
          </section>
          <section className="dd-module-shell">
            <div className="dd-list-header"><div><strong>Effective access</strong><span>Workspace permissions enforced by the current account model</span></div><Settings2 size={16} /></div>
            <div className="dd-table-wrap dd-access-matrix">
              <table className="dd-data-table">
                <thead><tr><th>Workspace area</th><th>Administrator</th><th>Member</th></tr></thead>
                <tbody>{accessRows.map(([label, administrator, member]) => <tr key={label}><td><strong>{label}</strong></td><td><AccessValue value={administrator} /></td><td><AccessValue value={member} /></td></tr>)}</tbody>
              </table>
            </div>
          </section>
          <section className="dd-role-notes">
            <div><ShieldCheck size={16} /><p><strong>Least privilege</strong><span>Members receive only the access needed for their own due diligence work.</span></p></div>
            <div><KeyRound size={16} /><p><strong>Credential ownership</strong><span>API credentials are private to the user who created them.</span></p></div>
          </section>
        </>
      )}
    </>
  );
};

export default TeamRolesPage;
