import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Download,
  Eye,
  FileClock,
  Globe2,
  Loader2,
  RefreshCw,
  Search,
  ShieldAlert,
  UsersRound,
  X,
} from 'lucide-react';
import { apiGet } from '../../utils/api';

const PAGE_SIZE = 25;

const LOG_VIEWS = [
  { id: 'overview', label: 'Overview', icon: Activity },
  { id: 'activity', label: 'Activity', icon: FileClock },
  { id: 'access', label: 'Access', icon: Globe2 },
  { id: 'errors', label: 'Errors', icon: AlertTriangle },
  { id: 'security', label: 'Security', icon: ShieldAlert },
];

const EVENT_VIEWS = LOG_VIEWS.filter(({ id }) => id !== 'overview');

const DATE_OPTIONS = [
  { value: '7', label: 'Last 7 days' },
  { value: '30', label: 'Last 30 days' },
  { value: '90', label: 'Last 90 days' },
  { value: '365', label: 'Last year' },
];

const SEVERITY_OPTIONS = [
  { value: '', label: 'All outcomes' },
  { value: 'info', label: 'Information / success' },
  { value: 'warning', label: 'Warning' },
  { value: 'error', label: 'Error' },
  { value: 'critical', label: 'Critical' },
  { value: 'blocked', label: 'Blocked security event' },
];

const FEED_LABELS = {
  activity: 'User activity',
  access: 'Application access',
  errors: 'System errors',
  security: 'Security events',
};

const EMPTY_FEEDS = { activity: [], access: [], errors: [], security: [] };

const EMPTY_HEALTH = Object.fromEntries(
  EVENT_VIEWS.map(({ id }) => [id, { status: 'loading', message: '' }])
);

const formatNumber = (value) => Number(value || 0).toLocaleString();

const formatDateTime = (value) => {
  if (!value) return 'Not recorded';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' });
};

const csvCell = (value) => `"${String(value ?? '').replaceAll('"', '""')}"`;

const valueText = (value) => {
  if (value === null || value === undefined || value === '') return 'Not recorded';
  if (typeof value === 'string') return value;
  return JSON.stringify(value, null, 2);
};

const dateRange = (days) => {
  const end = new Date();
  const start = new Date(end);
  start.setDate(start.getDate() - Number(days));
  return { start_date: start.toISOString(), end_date: end.toISOString() };
};

const userGroup = (user) => {
  if (!user) return 'System / anonymous';
  if (user.is_admin || user.role === 'admin' || user.user_type === 'administrator') return 'Administrators';
  if (user.user_type === 'corporate_client') return 'Corporate clients';
  if (user.user_type === 'court_registrar') return 'Court registrars';
  return 'Workspace users';
};

const actorName = (event, usersById) => {
  const user = usersById[String(event.user_id || '')];
  if (!user) return event.user_id ? `User ${event.user_id}` : 'System / anonymous';
  return [user.first_name, user.last_name].filter(Boolean).join(' ') || user.email || `User ${user.id}`;
};

const eventSeverity = (event, type) => {
  if (type === 'access') return Number(event.status_code || 0) >= 400 ? 'error' : 'info';
  return String(event.severity || 'info').toLowerCase();
};

const severityClass = (severity) => {
  if (severity === 'error' || severity === 'critical') return 'is-error';
  if (severity === 'warning') return 'is-review';
  return 'is-clear';
};

const eventTitle = (event, type) => {
  if (type === 'activity') return event.action || event.activity_type || 'Activity event';
  if (type === 'access') return `${event.method || 'REQUEST'} ${event.endpoint || event.url || 'Unknown endpoint'}`;
  if (type === 'errors') return event.error_type || 'System error';
  if (type === 'security') return event.event_type || 'Security event';
  return 'Log event';
};

const eventDescription = (event, type) => {
  if (type === 'activity' || type === 'security') return event.description || 'No description recorded';
  if (type === 'access') return `${event.status_code || 'No status'}${event.response_time != null ? ` · ${event.response_time} ms` : ''}`;
  return event.error_message || 'No error message recorded';
};

const latestDate = (events) => {
  if (!events.length) return 'No events in period';
  return formatDateTime([...events].sort((first, second) => (
    new Date(second.created_at || 0) - new Date(first.created_at || 0)
  ))[0].created_at);
};

const feedMessage = (reason, type) => {
  const detail = String(reason?.detail || reason?.message || '').toLowerCase();
  if (detail.includes('undefinedcolumn') || detail.includes('does not exist') || detail.includes('schema')) {
    return `${FEED_LABELS[type]} is unavailable because its stored schema does not match the application model.`;
  }
  return `${FEED_LABELS[type]} could not be read from the reporting service.`;
};

const detailFields = (event, type) => {
  if (type === 'activity') {
    return [
      ['Action', event.action],
      ['Activity type', event.activity_type],
      ['Description', event.description, true],
      ['Resource', event.resource_type],
      ['Resource ID', event.resource_id],
      ['Session ID', event.session_id],
      ['IP address', event.ip_address],
      ['Previous values', event.old_values, true],
      ['New values', event.new_values, true],
      ['Metadata', event.log_metadata, true],
      ['User agent', event.user_agent, true],
    ];
  }
  if (type === 'access') {
    return [
      ['Request', `${event.method || 'Not recorded'} ${event.endpoint || event.url || ''}`],
      ['Status code', event.status_code],
      ['Response time', event.response_time != null ? `${event.response_time} ms` : ''],
      ['Session ID', event.session_id],
      ['IP address', event.ip_address],
      ['Location', [event.city, event.country].filter(Boolean).join(', ')],
      ['Device', event.device_type],
      ['Browser', event.browser],
      ['Operating system', event.os],
      ['Request size', event.request_size != null ? `${event.request_size} bytes` : ''],
      ['Response size', event.response_size != null ? `${event.response_size} bytes` : ''],
      ['Referrer', event.referer, true],
      ['URL', event.url, true],
      ['User agent', event.user_agent, true],
    ];
  }
  if (type === 'errors') {
    return [
      ['Error type', event.error_type],
      ['Message', event.error_message, true],
      ['Request', [event.method, event.url].filter(Boolean).join(' ')],
      ['Status code', event.status_code],
      ['Resolved', event.resolved ? 'Yes' : 'No'],
      ['Resolved by', event.resolved_by],
      ['Resolved at', formatDateTime(event.resolved_at)],
      ['Session ID', event.session_id],
      ['IP address', event.ip_address],
      ['Stack trace', event.stack_trace, true],
      ['Metadata', event.log_metadata, true],
      ['User agent', event.user_agent, true],
    ];
  }
  return [
    ['Event type', event.event_type],
    ['Description', event.description, true],
    ['Blocked', event.blocked ? 'Yes' : 'No'],
    ['Session ID', event.session_id],
    ['IP address', event.ip_address],
    ['Location', [event.city, event.country].filter(Boolean).join(', ')],
    ['Metadata', event.log_metadata, true],
    ['User agent', event.user_agent, true],
  ];
};

const ReportsLogsPage = () => {
  const [activeView, setActiveView] = useState('overview');
  const [days, setDays] = useState('30');
  const [feeds, setFeeds] = useState(EMPTY_FEEDS);
  const [feedHealth, setFeedHealth] = useState(EMPTY_HEALTH);
  const [stats, setStats] = useState({});
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');
  const [actorGroup, setActorGroup] = useState('');
  const [severityFilter, setSeverityFilter] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [page, setPage] = useState(1);
  const [selectedEvent, setSelectedEvent] = useState(null);

  const usersById = useMemo(() => Object.fromEntries(
    users.map((user) => [String(user.id), user])
  ), [users]);

  const loadData = useCallback(async ({ quiet = false } = {}) => {
    if (quiet) setRefreshing(true);
    else setLoading(true);
    setError('');
    const range = dateRange(days);
    const results = await Promise.allSettled([
      apiGet('/admin/logs/stats', range),
      apiGet('/admin/logs/activity', { ...range, limit: 1000, offset: 0 }),
      apiGet('/admin/logs/access', { ...range, limit: 1000, offset: 0 }),
      apiGet('/admin/logs/errors', { ...range, limit: 1000, offset: 0 }),
      apiGet('/admin/logs/security', { ...range, limit: 1000, offset: 0 }),
      apiGet('/admin/users', { page: 1, limit: 1000 }),
    ]);

    const [statsResult, activityResult, accessResult, errorsResult, securityResult, usersResult] = results;
    const feedResults = {
      activity: activityResult,
      access: accessResult,
      errors: errorsResult,
      security: securityResult,
    };
    const nextFeeds = {};
    const nextHealth = {};
    Object.entries(feedResults).forEach(([type, result]) => {
      if (result.status === 'fulfilled') {
        nextFeeds[type] = Array.isArray(result.value?.logs) ? result.value.logs : [];
        nextHealth[type] = { status: 'available', message: '' };
      } else {
        nextFeeds[type] = [];
        nextHealth[type] = { status: 'unavailable', message: feedMessage(result.reason, type) };
      }
    });
    setFeeds(nextFeeds);
    setFeedHealth(nextHealth);
    setStats(statsResult.status === 'fulfilled' ? statsResult.value || {} : {});
    setUsers(usersResult.status === 'fulfilled' && Array.isArray(usersResult.value?.users) ? usersResult.value.users : []);

    const unavailableCount = Object.values(nextHealth).filter(({ status }) => status === 'unavailable').length;
    if (unavailableCount === EVENT_VIEWS.length) {
      setError('The reporting feeds are currently unavailable. No event totals are being inferred.');
    } else if (usersResult.status === 'rejected') {
      setError('Events loaded, but actor names and role coverage could not be resolved.');
    }
    setLoading(false);
    setRefreshing(false);
  }, [days]);

  useEffect(() => { loadData(); }, [loadData]);
  useEffect(() => { setPage(1); }, [activeView, query, actorGroup, severityFilter, sortBy]);

  const allEvents = useMemo(() => EVENT_VIEWS.flatMap(({ id }) => (
    feedHealth[id]?.status === 'available'
      ? feeds[id].map((event) => ({ event, type: id }))
      : []
  )), [feedHealth, feeds]);

  const uniqueActors = useMemo(() => new Set(
    allEvents.map(({ event }) => event.user_id).filter(Boolean)
  ).size, [allEvents]);

  const failedAccess = feeds.access.filter((event) => Number(event.status_code || 0) >= 400).length;
  const errorSignals = Number(stats.total_errors ?? feeds.errors.length)
    + Number(stats.error_requests ?? failedAccess);
  const unresolvedErrors = Number(stats.unresolved_errors ?? feeds.errors.filter((event) => !event.resolved).length);
  const availableFeeds = Object.values(feedHealth).filter(({ status }) => status === 'available').length;
  const recordedEvents = Number(stats.total_activities ?? feeds.activity.length)
    + Number(stats.total_requests ?? feeds.access.length)
    + Number(stats.total_errors ?? feeds.errors.length)
    + (feedHealth.security?.status === 'available' ? Number(stats.total_security_events ?? feeds.security.length) : 0);

  const actorGroups = useMemo(() => [...new Set([
    ...users.map(userGroup),
    'System / anonymous',
  ])].sort(), [users]);

  const currentEvents = useMemo(() => (
    activeView === 'overview'
      ? allEvents
      : (feeds[activeView] || []).map((event) => ({ event, type: activeView }))
  ), [activeView, allEvents, feeds]);

  const filteredEvents = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    const filtered = currentEvents.filter(({ event, type }) => {
      const user = usersById[String(event.user_id || '')];
      const group = userGroup(user);
      const severity = eventSeverity(event, type);
      const matchesQuery = !normalizedQuery || [
        eventTitle(event, type),
        eventDescription(event, type),
        actorName(event, usersById),
        user?.email,
        event.ip_address,
        event.resource_type,
        event.resource_id,
        event.endpoint,
        event.url,
      ].some((value) => String(value || '').toLowerCase().includes(normalizedQuery));
      const matchesSeverity = !severityFilter
        || severity === severityFilter
        || (severityFilter === 'blocked' && type === 'security' && event.blocked);
      return matchesQuery && (!actorGroup || group === actorGroup) && matchesSeverity;
    });

    return [...filtered].sort((first, second) => {
      if (sortBy === 'oldest') return new Date(first.event.created_at || 0) - new Date(second.event.created_at || 0);
      if (sortBy === 'actor') return actorName(first.event, usersById).localeCompare(actorName(second.event, usersById));
      if (sortBy === 'source') return first.type.localeCompare(second.type);
      return new Date(second.event.created_at || 0) - new Date(first.event.created_at || 0);
    });
  }, [actorGroup, currentEvents, query, severityFilter, sortBy, usersById]);

  const totalPages = Math.max(1, Math.ceil(filteredEvents.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const visibleEvents = filteredEvents.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);
  const firstResult = filteredEvents.length ? ((currentPage - 1) * PAGE_SIZE) + 1 : 0;
  const lastResult = Math.min(currentPage * PAGE_SIZE, filteredEvents.length);

  const clearFilters = () => {
    setQuery('');
    setActorGroup('');
    setSeverityFilter('');
    setSortBy('newest');
  };

  const exportCsv = () => {
    if (!filteredEvents.length) return;
    const headings = ['Source', 'Date and time', 'Actor', 'Email', 'User group', 'Event', 'Description', 'Severity', 'IP address'];
    const rows = filteredEvents.map(({ event, type }) => {
      const user = usersById[String(event.user_id || '')];
      return [
        FEED_LABELS[type],
        formatDateTime(event.created_at),
        actorName(event, usersById),
        user?.email || '',
        userGroup(user),
        eventTitle(event, type),
        eventDescription(event, type),
        eventSeverity(event, type),
        event.ip_address || '',
      ];
    });
    const csv = [headings, ...rows].map((row) => row.map(csvCell).join(',')).join('\n');
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `juridence-${activeView}-logs-${new Date().toISOString().slice(0, 10)}.csv`;
    anchor.click();
    URL.revokeObjectURL(url);
  };

  const categoryRows = useMemo(() => {
    const categories = ['Administrators', 'Corporate clients', 'Court registrars', 'Workspace users'];
    return categories.map((category) => {
      const categoryUsers = users.filter((user) => userGroup(user) === category);
      const ids = new Set(categoryUsers.map((user) => user.id));
      return {
        category,
        registered: categoryUsers.length,
        active: categoryUsers.filter((user) => user.status === 'active').length,
        observed: allEvents.filter(({ event }) => ids.has(event.user_id)).length,
      };
    }).filter(({ registered, observed }) => registered || observed);
  }, [allEvents, users]);

  const renderOverview = () => (
    <div className="dd-reports-overview-grid">
      <section className="dd-panel">
        <header className="dd-panel-header">
          <div><h3>Reporting feed health</h3><p>Source availability and the latest retained event in this period.</p></div>
          <span className="dd-count-badge">{availableFeeds} of {EVENT_VIEWS.length} available</span>
        </header>
        <div className="dd-table-wrap dd-report-health-table">
          <table className="dd-data-table">
            <thead><tr><th>Feed</th><th>State</th><th>Events</th><th>Latest retained event</th><th /></tr></thead>
            <tbody>
              {EVENT_VIEWS.map(({ id, label }) => {
                const health = feedHealth[id] || { status: 'loading' };
                const available = health.status === 'available';
                return (
                  <tr key={id}>
                    <td><strong>{label}</strong><small>{FEED_LABELS[id]}</small></td>
                    <td><span className={`dd-status-pill ${available ? 'is-clear' : health.status === 'loading' ? 'is-review' : 'is-error'}`}>{available ? 'Available' : health.status === 'loading' ? 'Checking' : 'Unavailable'}</span></td>
                    <td>{available ? formatNumber(feeds[id].length) : '—'}</td>
                    <td>{available ? latestDate(feeds[id]) : health.message}</td>
                    <td><button type="button" className="dd-icon-button" onClick={() => setActiveView(id)} aria-label={`Open ${label}`} title={`Open ${label}`}><Eye size={14} /></button></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      <section className="dd-panel">
        <header className="dd-panel-header">
          <div><h3>User coverage</h3><p>Registered users and actors represented in the retained event feeds.</p></div>
          <span className="dd-count-badge">{formatNumber(users.length)} users</span>
        </header>
        {categoryRows.length ? (
          <div className="dd-table-wrap dd-report-user-table">
            <table className="dd-data-table">
              <thead><tr><th>User group</th><th>Registered</th><th>Active</th><th>Observed events</th></tr></thead>
              <tbody>{categoryRows.map((row) => <tr key={row.category}><td><strong>{row.category}</strong></td><td>{formatNumber(row.registered)}</td><td>{formatNumber(row.active)}</td><td>{formatNumber(row.observed)}</td></tr>)}</tbody>
            </table>
          </div>
        ) : <div className="dd-empty-state"><UsersRound size={23} /><div><strong>No user coverage available</strong><p>User records could not be mapped to reporting events.</p></div></div>}
      </section>

      {Object.entries(feedHealth).some(([, health]) => health.status === 'unavailable') && (
        <div className="dd-inline-alert is-error dd-report-feed-warning">
          <AlertTriangle size={15} />
          <span><strong>Partial reporting coverage.</strong> Unavailable feeds are excluded from totals and are never presented as zero events.</span>
        </div>
      )}
    </div>
  );

  const renderEventTable = () => {
    const health = feedHealth[activeView];
    if (health?.status === 'unavailable') {
      return (
        <section className="dd-panel">
          <header className="dd-panel-header"><div><h3>{FEED_LABELS[activeView]}</h3><p>Reporting source status</p></div><span className="dd-status-pill is-error">Unavailable</span></header>
          <div className="dd-report-unavailable"><ShieldAlert size={28} /><h3>Feed unavailable</h3><p>{health.message}</p><span>No event count has been inferred for this source.</span></div>
        </section>
      );
    }

    return (
      <section className="dd-panel dd-report-events-panel">
        <header className="dd-panel-header">
          <div><h3>{FEED_LABELS[activeView]}</h3><p>{DATE_OPTIONS.find((option) => option.value === days)?.label} · read-only event reporting</p></div>
          <span className="dd-count-badge">{formatNumber(filteredEvents.length)} shown</span>
        </header>
        <div className="dd-report-filter-bar">
          <label className="dd-report-search-field"><span>Search events</span><div className="dd-search-control"><Search size={14} /><input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Actor, action, resource, endpoint or IP" /></div></label>
          <label><span>Actor group</span><select className="dd-select-control" value={actorGroup} onChange={(event) => setActorGroup(event.target.value)}><option value="">All actor groups</option>{actorGroups.map((group) => <option key={group} value={group}>{group}</option>)}</select></label>
          <label><span>Outcome</span><select className="dd-select-control" value={severityFilter} onChange={(event) => setSeverityFilter(event.target.value)}>{SEVERITY_OPTIONS.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select></label>
          <label><span>Sort</span><select className="dd-select-control" value={sortBy} onChange={(event) => setSortBy(event.target.value)}><option value="newest">Newest first</option><option value="oldest">Oldest first</option><option value="actor">Actor A-Z</option><option value="source">Source</option></select></label>
          <button type="button" className="dd-button dd-button-secondary" onClick={clearFilters}>Clear</button>
        </div>

        {loading ? <div className="dd-loading-state"><Loader2 className="dd-spin" size={17} /> Loading reporting events...</div> : !visibleEvents.length ? (
          <div className="dd-empty-state dd-report-events-empty"><FileClock size={26} /><strong>No events found</strong><p>{feeds[activeView]?.length ? 'No retained events match the selected filters.' : `No ${FEED_LABELS[activeView].toLowerCase()} are retained for this period.`}</p></div>
        ) : (
          <div className="dd-table-wrap dd-report-events-table">
            <table className="dd-data-table">
              <thead><tr><th>Date and time</th><th>Actor</th><th>Event</th><th>Context</th><th>IP address</th><th>Outcome</th><th /></tr></thead>
              <tbody>{visibleEvents.map(({ event, type }) => {
                const user = usersById[String(event.user_id || '')];
                const severity = eventSeverity(event, type);
                return (
                  <tr key={`${type}-${event.id}`}>
                    <td className="dd-report-event-date">{formatDateTime(event.created_at)}</td>
                    <td><strong>{actorName(event, usersById)}</strong><small>{user?.email || userGroup(user)}</small></td>
                    <td><strong>{eventTitle(event, type)}</strong><small>{eventDescription(event, type)}</small></td>
                    <td><strong>{event.resource_type || event.device_type || event.method || 'System'}</strong><small>{event.resource_id || event.browser || event.url || 'No additional context'}</small></td>
                    <td>{event.ip_address || 'Not recorded'}</td>
                    <td><span className={`dd-status-pill ${severityClass(severity)}`}>{type === 'security' && event.blocked ? 'Blocked' : severity}</span></td>
                    <td><button type="button" className="dd-icon-button" onClick={() => setSelectedEvent({ event, type })} aria-label={`Inspect ${eventTitle(event, type)}`} title="Inspect event"><Eye size={14} /></button></td>
                  </tr>
                );
              })}</tbody>
            </table>
          </div>
        )}

        <footer className="dd-report-pagination"><span>Records {firstResult}-{lastResult} of {formatNumber(filteredEvents.length)}</span><div><button type="button" className="dd-button dd-button-secondary" disabled={currentPage <= 1} onClick={() => setPage((value) => Math.max(1, value - 1))}><ChevronLeft size={13} /> Prev</button><span>Page {currentPage} of {totalPages}</span><button type="button" className="dd-button dd-button-secondary" disabled={currentPage >= totalPages} onClick={() => setPage((value) => Math.min(totalPages, value + 1))}>Next <ChevronRight size={13} /></button></div></footer>
      </section>
    );
  };

  return (
    <main className="dd-module-shell dd-reports-logs">
      <header className="dd-module-heading">
        <div><p className="dd-eyebrow">Operational reporting</p><h2>Reports &amp; Logs</h2><p>Monitor platform activity, access performance, exceptions and security-feed coverage.</p></div>
        <div className="dd-heading-actions dd-report-heading-actions">
          <select className="dd-select-control" value={days} onChange={(event) => setDays(event.target.value)} aria-label="Reporting period">{DATE_OPTIONS.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select>
          <button type="button" className="dd-button dd-button-secondary" onClick={() => loadData({ quiet: true })} disabled={refreshing}><RefreshCw className={refreshing ? 'dd-spin' : ''} size={14} /> Refresh</button>
          <button type="button" className="dd-button dd-button-primary" onClick={exportCsv} disabled={!filteredEvents.length}><Download size={14} /> Export CSV</button>
        </div>
      </header>

      {error && <div className="dd-inline-alert is-error"><span>{error}</span><button type="button" onClick={() => setError('')} aria-label="Dismiss error"><X size={14} /></button></div>}

      <div className="dd-gazette-summary dd-report-summary">
        <button type="button" onClick={() => setActiveView('activity')}><Activity size={17} /><span>Recorded events</span><strong>{loading ? '…' : formatNumber(recordedEvents)}</strong><small>Available feeds only</small></button>
        <button type="button" onClick={() => setActiveView('activity')}><UsersRound size={17} /><span>Actors observed</span><strong>{loading ? '…' : formatNumber(uniqueActors)}</strong><small>{formatNumber(users.length)} registered users</small></button>
        <button type="button" onClick={() => setActiveView('errors')}><AlertTriangle size={17} /><span>Error signals</span><strong>{loading ? '…' : formatNumber(errorSignals)}</strong><small>{formatNumber(unresolvedErrors)} unresolved</small></button>
        <button type="button" onClick={() => setActiveView('overview')}><CheckCircle2 size={17} /><span>Feed availability</span><strong>{loading ? '…' : `${availableFeeds}/${EVENT_VIEWS.length}`}</strong><small>{EVENT_VIEWS.length - availableFeeds} unavailable</small></button>
      </div>

      <nav className="dd-gazette-dataset-tabs dd-report-view-tabs" aria-label="Reports and logs views">
        {LOG_VIEWS.map(({ id, label, icon: Icon }) => (
          <button type="button" key={id} className={activeView === id ? 'is-active' : ''} onClick={() => setActiveView(id)}>
            <Icon size={13} /><strong>{label}</strong>{id !== 'overview' && <span>{feedHealth[id]?.status === 'unavailable' ? '!' : formatNumber(feeds[id]?.length)}</span>}
          </button>
        ))}
      </nav>

      {loading && activeView === 'overview' ? <div className="dd-loading-state dd-panel"><Loader2 className="dd-spin" size={18} /> Loading reporting coverage...</div> : activeView === 'overview' ? renderOverview() : renderEventTable()}

      <div className="dd-inline-alert is-info dd-report-readonly-note"><ShieldAlert size={14} /><span>Reports &amp; Logs is read-only. Detailed organisation-scoped change history remains available in Audit Log.</span></div>

      {selectedEvent && (
        <div className="dd-modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setSelectedEvent(null); }}>
          <section className="dd-modal dd-report-event-modal" role="dialog" aria-modal="true" aria-labelledby="report-event-title">
            <header><div><h3 id="report-event-title">{eventTitle(selectedEvent.event, selectedEvent.type)}</h3><p>{FEED_LABELS[selectedEvent.type]} · Event {selectedEvent.event.id}</p></div><button type="button" onClick={() => setSelectedEvent(null)} aria-label="Close event"><X size={16} /></button></header>
            <div className="dd-gazette-facts dd-report-event-facts">
              <div><FileClock size={14} /><span>Date and time</span><strong>{formatDateTime(selectedEvent.event.created_at)}</strong></div>
              <div><UsersRound size={14} /><span>Actor</span><strong>{actorName(selectedEvent.event, usersById)}</strong></div>
              <div><Activity size={14} /><span>Source</span><strong>{FEED_LABELS[selectedEvent.type]}</strong></div>
              <div><ShieldAlert size={14} /><span>Outcome</span><strong>{eventSeverity(selectedEvent.event, selectedEvent.type)}</strong></div>
            </div>
            <div className="dd-modal-body dd-report-event-modal-body">
              <dl className="dd-report-event-details">
                {detailFields(selectedEvent.event, selectedEvent.type).map(([label, value, wide]) => <div key={label} className={wide ? 'is-wide' : ''}><dt>{label}</dt><dd><pre>{valueText(value)}</pre></dd></div>)}
              </dl>
              <div className="dd-modal-actions"><button type="button" className="dd-button dd-button-secondary" onClick={() => setSelectedEvent(null)}>Close</button></div>
            </div>
          </section>
        </div>
      )}
    </main>
  );
};

export default ReportsLogsPage;
