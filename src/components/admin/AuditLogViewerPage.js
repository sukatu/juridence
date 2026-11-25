import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Activity,
  ChevronLeft,
  ChevronRight,
  Database,
  Download,
  Eye,
  FileClock,
  Loader2,
  RefreshCw,
  Search,
  ShieldAlert,
  X,
} from 'lucide-react';
import { apiGet } from '../../utils/api';

const formatDateTime = (value) => {
  if (!value) return 'Not recorded';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Not recorded';
  return new Intl.DateTimeFormat('en-GB', {
    day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit',
  }).format(date);
};

const valueText = (value) => {
  if (value === null || value === undefined || value === '') return 'Not recorded';
  if (typeof value === 'string') return value;
  return JSON.stringify(value, null, 2);
};

const csvCell = (value) => `"${String(value ?? '').replace(/"/g, '""')}"`;

const AuditLogViewerPage = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [days, setDays] = useState('30');
  const [eventType, setEventType] = useState('');
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedQuery(query.trim()), 300);
    return () => window.clearTimeout(timer);
  }, [query]);

  const loadEvents = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      setData(await apiGet('/workspace/audit', {
        days,
        event_type: eventType,
        search: debouncedQuery,
        page,
        limit: 25,
      }));
    } catch (requestError) {
      setError(requestError.message || 'Audit activity could not be loaded.');
    } finally {
      setLoading(false);
    }
  }, [days, eventType, debouncedQuery, page]);

  useEffect(() => { loadEvents(); }, [loadEvents]);
  useEffect(() => { setPage(1); }, [days, eventType, debouncedQuery]);

  const events = data?.events || [];
  const stats = data?.stats || {};
  const rangeLabel = useMemo(() => {
    if (!data?.total) return 'No events';
    const start = (data.page - 1) * data.limit + 1;
    const end = Math.min(data.total, start + events.length - 1);
    return `${start}-${end} of ${data.total}`;
  }, [data, events.length]);

  const exportCsv = () => {
    const headings = ['Date and time', 'Actor', 'Email', 'Source', 'Action', 'Resource', 'Record', 'IP address', 'Description'];
    const rows = events.map((event) => [event.created_at, event.user_name, event.user_email, event.source, event.action, event.resource, event.record_id, event.ip_address, event.description]);
    const csv = [headings, ...rows].map((row) => row.map(csvCell).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `juridence-audit-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <section className="dd-module-shell">
      <div className="dd-module-heading">
        <div><p className="dd-eyebrow">Governance and traceability</p><h2>Audit Log</h2><p>Organisation-scoped activity, data changes and account-security events.</p></div>
        <div className="dd-heading-actions"><button type="button" className="dd-button dd-button-secondary" onClick={loadEvents} disabled={loading}><RefreshCw size={14} /> Refresh</button><button type="button" className="dd-button dd-button-primary" onClick={exportCsv} disabled={!events.length}><Download size={14} /> Export page</button></div>
      </div>

      <div className="dd-kpi-row dd-kpi-row-four" aria-label="Audit summary">
        <article><FileClock size={19} /><div><strong>{stats.total || 0}</strong><span>All events</span></div></article>
        <article><Activity size={19} /><div><strong>{stats.activity || 0}</strong><span>Workspace activity</span></div></article>
        <article><Database size={19} /><div><strong>{stats.data_changes || 0}</strong><span>Data changes</span></div></article>
        <article><ShieldAlert size={19} /><div><strong>{stats.security_events || 0}</strong><span>Security events</span></div></article>
      </div>

      {error && <div className="dd-inline-alert is-error"><span>{error}</span><button type="button" onClick={() => setError('')} aria-label="Dismiss"><X size={14} /></button></div>}

      <div className="dd-panel">
        <div className="dd-panel-header"><div><h3>Workspace activity trail</h3><p>{data?.organization || 'Current organisation'} · last {days} days</p></div>{stats.high_risk > 0 && <span className="dd-count-badge"><ShieldAlert size={13} /> {stats.high_risk} high risk</span>}</div>
        <div className="dd-inline-form dd-audit-filters">
          <label className="dd-search-control"><Search size={14} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search actor, action, resource or description" aria-label="Search audit log" /></label>
          <select className="dd-select-control" value={eventType} onChange={(event) => setEventType(event.target.value)} aria-label="Filter event type"><option value="">All event types</option><option value="activity">Workspace activity</option><option value="audit">Data changes</option><option value="security">Security</option></select>
          <select className="dd-select-control" value={days} onChange={(event) => setDays(event.target.value)} aria-label="Audit date range"><option value="7">Last 7 days</option><option value="30">Last 30 days</option><option value="90">Last 90 days</option><option value="180">Last 180 days</option><option value="365">Last year</option></select>
        </div>

        {loading ? <div className="dd-loading-state"><Loader2 size={18} className="dd-spin" /> Loading audit activity</div> : !events.length ? <div className="dd-empty-state"><FileClock size={25} /><strong>No activity found</strong><p>No workspace events match the selected period and filters.</p></div> : <div className="dd-table-wrap dd-audit-table"><table className="dd-data-table"><thead><tr><th>Date and time</th><th>Actor</th><th>Type</th><th>Action</th><th>Resource</th><th>IP address</th><th aria-label="Details" /></tr></thead><tbody>{events.map((event) => <tr key={event.id}><td className="dd-audit-date">{formatDateTime(event.created_at)}</td><td><strong>{event.user_name}</strong><small>{event.user_email || 'Email unavailable'}</small></td><td><span className={`dd-event-source is-${event.source}`}>{event.category}</span></td><td><strong>{event.action}</strong><small>{event.description}</small></td><td><strong>{event.resource || 'Workspace'}</strong><small>{event.record_id ? `Record ${event.record_id}` : 'No record identifier'}</small></td><td>{event.ip_address || 'Not recorded'}</td><td><button type="button" className="dd-icon-button" onClick={() => setSelected(event)} aria-label={`View ${event.action} details`}><Eye size={14} /></button></td></tr>)}</tbody></table></div>}

        <div className="dd-audit-pagination"><span>{rangeLabel}</span><div><button type="button" className="dd-icon-button" aria-label="Previous page" disabled={page <= 1 || loading} onClick={() => setPage((current) => current - 1)}><ChevronLeft size={15} /></button><span>Page {data?.page || page} of {data?.total_pages || 1}</span><button type="button" className="dd-icon-button" aria-label="Next page" disabled={page >= (data?.total_pages || 1) || loading} onClick={() => setPage((current) => current + 1)}><ChevronRight size={15} /></button></div></div>
      </div>

      <div className="dd-inline-alert is-info"><ShieldAlert size={14} /><span>The audit view is scoped to members of the signed-in organisation. Export includes only the currently displayed page and filters.</span></div>

      {selected && <div className="dd-modal-backdrop" role="presentation"><div className="dd-modal dd-audit-modal" role="dialog" aria-modal="true" aria-labelledby="audit-detail-title"><header><div><h3 id="audit-detail-title">Audit event details</h3><p>{selected.id}</p></div><button type="button" onClick={() => setSelected(null)} aria-label="Close"><X size={17} /></button></header><div className="dd-modal-body"><dl className="dd-audit-details"><div><dt>Date and time</dt><dd>{formatDateTime(selected.created_at)}</dd></div><div><dt>Actor</dt><dd>{selected.user_name}<small>{selected.user_email}</small></dd></div><div><dt>Source</dt><dd>{selected.category}</dd></div><div><dt>Action</dt><dd>{selected.action}</dd></div><div><dt>Resource</dt><dd>{selected.resource || 'Workspace'}{selected.record_id && <small>Record {selected.record_id}</small>}</dd></div><div><dt>IP address</dt><dd>{selected.ip_address || 'Not recorded'}</dd></div><div className="is-wide"><dt>Description</dt><dd>{selected.description || 'No description recorded'}</dd></div>{selected.old_value != null && <div className="is-wide"><dt>Previous value</dt><dd><pre>{valueText(selected.old_value)}</pre></dd></div>}{selected.new_value != null && <div className="is-wide"><dt>New value</dt><dd><pre>{valueText(selected.new_value)}</pre></dd></div>}<div className="is-wide"><dt>User agent</dt><dd>{selected.user_agent || 'Not recorded'}</dd></div></dl></div></div></div>}
    </section>
  );
};

export default AuditLogViewerPage;
