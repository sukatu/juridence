import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  AlertTriangle,
  BarChart3,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  CircleDot,
  Clock3,
  Download,
  Eye,
  FileSearch,
  Inbox,
  Loader2,
  RefreshCw,
  Search,
  ShieldCheck,
  UserRoundCheck,
  X,
} from 'lucide-react';
import { apiGet, apiPut } from '../../utils/api';

const PAGE_SIZE = 20;

const STATUS_OPTIONS = [
  { value: 'pending', label: 'Pending' },
  { value: 'in_progress', label: 'In progress' },
  { value: 'completed', label: 'Completed' },
  { value: 'rejected', label: 'Rejected' },
  { value: 'cancelled', label: 'Cancelled' },
];

const REQUEST_TYPE_OPTIONS = [
  { value: 'case_details', label: 'Case details' },
  { value: 'legal_documents', label: 'Legal documents' },
  { value: 'court_records', label: 'Court records' },
  { value: 'financial_information', label: 'Financial information' },
  { value: 'profile_information', label: 'Profile information' },
  { value: 'contact_details', label: 'Contact details' },
  { value: 'management_details', label: 'Management details' },
  { value: 'legal_history', label: 'Legal history' },
  { value: 'other', label: 'Other' },
];

const ENTITY_TYPE_OPTIONS = [
  { value: 'person', label: 'Person' },
  { value: 'bank', label: 'Bank' },
  { value: 'insurance', label: 'Insurance' },
  { value: 'company', label: 'Company' },
  { value: 'case', label: 'Case' },
];

const PRIORITY_OPTIONS = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
  { value: 'urgent', label: 'Urgent' },
];

const EMPTY_STATS = {
  total_requests: 0,
  pending_requests: 0,
  in_progress_requests: 0,
  completed_requests: 0,
  rejected_requests: 0,
  urgent_requests: 0,
  requests_by_type: Object.fromEntries(REQUEST_TYPE_OPTIONS.map(({ value }) => [value, 0])),
  requests_by_entity: Object.fromEntries(ENTITY_TYPE_OPTIONS.map(({ value }) => [value, 0])),
  requests_by_status: Object.fromEntries(STATUS_OPTIONS.map(({ value }) => [value, 0])),
};

const labelFor = (options, value, fallback = 'Not recorded') => (
  options.find((option) => option.value === value)?.label || fallback
);

const formatNumber = (value) => Number(value || 0).toLocaleString();

const formatDate = (value, includeTime = true) => {
  if (!value) return 'Not recorded';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return includeTime
    ? date.toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' })
    : date.toLocaleDateString('en-GB', { dateStyle: 'medium' });
};

const requestReference = (request) => `REQ-${String(request?.id || 0).padStart(4, '0')}`;

const requestSubject = (request) => (
  request?.entity_name || request?.case_suit_number || 'General information request'
);

const statusClass = (status) => {
  if (status === 'completed') return 'is-clear';
  if (status === 'rejected' || status === 'cancelled') return 'is-error';
  if (status === 'in_progress') return 'is-info';
  return 'is-review';
};

const priorityClass = (priority, isUrgent) => {
  if (isUrgent || priority === 'urgent' || priority === 'high') return 'is-error';
  if (priority === 'medium') return 'is-review';
  return 'is-clear';
};

const buildFallbackStats = (requests) => {
  const result = {
    ...EMPTY_STATS,
    requests_by_type: { ...EMPTY_STATS.requests_by_type },
    requests_by_entity: { ...EMPTY_STATS.requests_by_entity },
    requests_by_status: { ...EMPTY_STATS.requests_by_status },
  };
  result.total_requests = requests.length;
  requests.forEach((request) => {
    if (request.status in result.requests_by_status) result.requests_by_status[request.status] += 1;
    if (request.request_type in result.requests_by_type) result.requests_by_type[request.request_type] += 1;
    if (request.entity_type in result.requests_by_entity) result.requests_by_entity[request.entity_type] += 1;
    if (request.is_urgent) result.urgent_requests += 1;
  });
  result.pending_requests = result.requests_by_status.pending;
  result.in_progress_requests = result.requests_by_status.in_progress;
  result.completed_requests = result.requests_by_status.completed;
  result.rejected_requests = result.requests_by_status.rejected;
  return result;
};

const mergeStats = (stats) => ({
  ...EMPTY_STATS,
  ...(stats || {}),
  requests_by_type: { ...EMPTY_STATS.requests_by_type, ...(stats?.requests_by_type || {}) },
  requests_by_entity: { ...EMPTY_STATS.requests_by_entity, ...(stats?.requests_by_entity || {}) },
  requests_by_status: { ...EMPTY_STATS.requests_by_status, ...(stats?.requests_by_status || {}) },
});

const DetailField = ({ label, value, wide = false }) => (
  <div className={wide ? 'is-wide' : ''}>
    <dt>{label}</dt>
    <dd>{value || 'Not recorded'}</dd>
  </div>
);

const BreakdownPanel = ({ title, description, values, options, total }) => (
  <section className="dd-panel">
    <header className="dd-panel-header">
      <div>
        <h3>{title}</h3>
        <p>{description}</p>
      </div>
      <span className="dd-count-badge">{formatNumber(total)} total</span>
    </header>
    <div className="dd-request-breakdown">
      {options.map((option) => {
        const count = Number(values?.[option.value] || 0);
        const width = total ? Math.max((count / total) * 100, count ? 3 : 0) : 0;
        return (
          <div key={option.value}>
            <span>{option.label}</span>
            <i aria-hidden="true"><b style={{ width: `${width}%` }} /></i>
            <strong>{formatNumber(count)}</strong>
          </div>
        );
      })}
    </div>
  </section>
);

const SearchRequestsPage = ({ userInfo }) => {
  const [activeView, setActiveView] = useState('queue');
  const [requests, setRequests] = useState([]);
  const [stats, setStats] = useState(EMPTY_STATS);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [requestTypeFilter, setRequestTypeFilter] = useState('');
  const [entityTypeFilter, setEntityTypeFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [page, setPage] = useState(1);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [requestDetail, setRequestDetail] = useState(null);
  const [detailTab, setDetailTab] = useState('request');
  const [detailLoading, setDetailLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [processingForm, setProcessingForm] = useState({
    status: 'pending',
    assigned_to: '',
    priority: 'medium',
    is_urgent: false,
    admin_notes: '',
    response_message: '',
  });

  const currentUser = useMemo(() => {
    const composedName = [userInfo?.first_name, userInfo?.last_name].filter(Boolean).join(' ');
    return userInfo?.full_name || composedName || userInfo?.username || userInfo?.email || 'Workspace administrator';
  }, [userInfo]);

  const loadData = useCallback(async ({ quiet = false } = {}) => {
    if (quiet) setRefreshing(true);
    else setLoading(true);
    setError('');
    const [requestsResult, statsResult] = await Promise.allSettled([
      apiGet('/request-details/', { skip: 0, limit: 1000 }),
      apiGet('/request-details/stats'),
    ]);

    const nextRequests = requestsResult.status === 'fulfilled' && Array.isArray(requestsResult.value)
      ? requestsResult.value
      : [];
    setRequests(nextRequests);
    if (statsResult.status === 'fulfilled') setStats(mergeStats(statsResult.value));
    else setStats(buildFallbackStats(nextRequests));

    if (requestsResult.status === 'rejected') {
      setError(requestsResult.reason?.detail || requestsResult.reason?.message || 'The request queue could not be loaded.');
    } else if (statsResult.status === 'rejected') {
      setError('Queue totals could not be loaded. Counts shown are calculated from the available requests.');
    }
    setLoading(false);
    setRefreshing(false);
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  useEffect(() => {
    setPage(1);
  }, [searchQuery, statusFilter, requestTypeFilter, entityTypeFilter, priorityFilter, sortBy]);

  const filteredRequests = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    const priorityOrder = { urgent: 4, high: 3, medium: 2, low: 1 };
    const statusOrder = { pending: 1, in_progress: 2, completed: 3, rejected: 4, cancelled: 5 };
    const filtered = requests.filter((request) => {
      const matchesSearch = !query || [
        requestReference(request),
        request.entity_name,
        request.case_suit_number,
        request.requester_name,
        request.requester_email,
        labelFor(REQUEST_TYPE_OPTIONS, request.request_type, request.request_type),
      ].some((value) => String(value || '').toLowerCase().includes(query));
      return matchesSearch
        && (!statusFilter || request.status === statusFilter)
        && (!requestTypeFilter || request.request_type === requestTypeFilter)
        && (!entityTypeFilter || request.entity_type === entityTypeFilter)
        && (!priorityFilter || request.priority === priorityFilter || (priorityFilter === 'urgent' && request.is_urgent));
    });

    return [...filtered].sort((first, second) => {
      if (sortBy === 'oldest') return new Date(first.created_at || 0) - new Date(second.created_at || 0);
      if (sortBy === 'priority') return (priorityOrder[second.priority] || 0) - (priorityOrder[first.priority] || 0);
      if (sortBy === 'status') return (statusOrder[first.status] || 99) - (statusOrder[second.status] || 99);
      if (sortBy === 'subject') return requestSubject(first).localeCompare(requestSubject(second));
      return new Date(second.created_at || 0) - new Date(first.created_at || 0);
    });
  }, [entityTypeFilter, priorityFilter, requestTypeFilter, requests, searchQuery, sortBy, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredRequests.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const visibleRequests = filteredRequests.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);
  const firstResult = filteredRequests.length ? ((currentPage - 1) * PAGE_SIZE) + 1 : 0;
  const lastResult = Math.min(currentPage * PAGE_SIZE, filteredRequests.length);

  const clearFilters = () => {
    setSearchQuery('');
    setStatusFilter('');
    setRequestTypeFilter('');
    setEntityTypeFilter('');
    setPriorityFilter('');
    setSortBy('newest');
  };

  const applySummaryFilter = (status = '') => {
    setActiveView('queue');
    setStatusFilter(status);
  };

  const exportQueue = () => {
    if (!filteredRequests.length) return;
    const headings = ['Request', 'Subject', 'Case reference', 'Request type', 'Entity type', 'Requester', 'Email', 'Priority', 'Urgent', 'Status', 'Owner', 'Submitted'];
    const rows = filteredRequests.map((request) => [
      requestReference(request),
      requestSubject(request),
      request.case_suit_number || '',
      labelFor(REQUEST_TYPE_OPTIONS, request.request_type, request.request_type),
      labelFor(ENTITY_TYPE_OPTIONS, request.entity_type, request.entity_type),
      request.requester_name || '',
      request.requester_email || '',
      labelFor(PRIORITY_OPTIONS, request.priority, request.priority),
      request.is_urgent ? 'Yes' : 'No',
      labelFor(STATUS_OPTIONS, request.status, request.status),
      request.assigned_to || '',
      formatDate(request.created_at),
    ]);
    const escape = (value) => `"${String(value ?? '').replaceAll('"', '""')}"`;
    const csv = [headings, ...rows].map((row) => row.map(escape).join(',')).join('\n');
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `search-requests-${new Date().toISOString().slice(0, 10)}.csv`;
    anchor.click();
    URL.revokeObjectURL(url);
  };

  const openRequest = async (request) => {
    setSelectedRequest(request);
    setRequestDetail(null);
    setDetailTab('request');
    setDetailLoading(true);
    setError('');
    try {
      const detail = await apiGet(`/request-details/${request.id}`);
      setRequestDetail(detail);
      setProcessingForm({
        status: detail.status || 'pending',
        assigned_to: detail.assigned_to || '',
        priority: detail.priority || 'medium',
        is_urgent: Boolean(detail.is_urgent),
        admin_notes: detail.admin_notes || '',
        response_message: detail.response_message || '',
      });
    } catch (loadError) {
      setError(loadError.detail || loadError.message || 'The request details could not be loaded.');
    } finally {
      setDetailLoading(false);
    }
  };

  const closeRequest = () => {
    setSelectedRequest(null);
    setRequestDetail(null);
  };

  const updateProcessingField = (field, value) => {
    setProcessingForm((current) => ({ ...current, [field]: value }));
  };

  const saveProcessing = async () => {
    if (!requestDetail) return;
    setSaving(true);
    setError('');
    setNotice('');
    try {
      const updated = await apiPut(`/request-details/${requestDetail.id}`, {
        status: processingForm.status,
        assigned_to: processingForm.assigned_to.trim() || null,
        priority: processingForm.priority,
        is_urgent: processingForm.is_urgent,
        admin_notes: processingForm.admin_notes.trim() || null,
        response_message: processingForm.response_message.trim() || null,
      });
      setRequestDetail(updated);
      setRequests((current) => current.map((request) => (
        request.id === updated.id ? { ...request, ...updated } : request
      )));
      try {
        setStats(mergeStats(await apiGet('/request-details/stats')));
      } catch {
        setStats((current) => current);
      }
      setNotice(`${requestReference(updated)} was updated.`);
      setDetailTab('request');
    } catch (saveError) {
      setError(saveError.detail || saveError.message || 'The request could not be updated.');
    } finally {
      setSaving(false);
    }
  };

  const renderQueue = () => (
    <section className="dd-panel dd-request-queue-panel">
      <header className="dd-panel-header">
        <div>
          <h3>Request queue</h3>
          <p>Review, assign and resolve information requests from entity and case records.</p>
        </div>
        <span className="dd-count-badge">{formatNumber(filteredRequests.length)} shown</span>
      </header>

      <div className="dd-request-filter-bar">
        <label className="dd-request-search-field">
          <span>Search queue</span>
          <div className="dd-search-control">
            <Search size={14} />
            <input
              type="search"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Request, subject, suit number or requester"
            />
          </div>
        </label>
        <label>
          <span>Status</span>
          <select className="dd-select-control" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
            <option value="">All statuses</option>
            {STATUS_OPTIONS.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
          </select>
        </label>
        <label>
          <span>Request type</span>
          <select className="dd-select-control" value={requestTypeFilter} onChange={(event) => setRequestTypeFilter(event.target.value)}>
            <option value="">All request types</option>
            {REQUEST_TYPE_OPTIONS.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
          </select>
        </label>
        <label>
          <span>Entity</span>
          <select className="dd-select-control" value={entityTypeFilter} onChange={(event) => setEntityTypeFilter(event.target.value)}>
            <option value="">All entity types</option>
            {ENTITY_TYPE_OPTIONS.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
          </select>
        </label>
        <label>
          <span>Priority</span>
          <select className="dd-select-control" value={priorityFilter} onChange={(event) => setPriorityFilter(event.target.value)}>
            <option value="">All priorities</option>
            {PRIORITY_OPTIONS.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
          </select>
        </label>
        <label>
          <span>Sort</span>
          <select className="dd-select-control" value={sortBy} onChange={(event) => setSortBy(event.target.value)}>
            <option value="newest">Newest first</option>
            <option value="oldest">Oldest first</option>
            <option value="priority">Highest priority</option>
            <option value="status">Workflow status</option>
            <option value="subject">Subject A-Z</option>
          </select>
        </label>
        <button type="button" className="dd-button dd-button-secondary" onClick={clearFilters}>Clear</button>
      </div>

      {loading ? (
        <div className="dd-loading-state"><Loader2 className="dd-spin" size={17} /> Loading request queue...</div>
      ) : !visibleRequests.length ? (
        <div className="dd-empty-state dd-request-empty-state">
          <Inbox size={27} />
          <h3>{requests.length ? 'No requests match these filters' : 'No search requests are waiting'}</h3>
          <p>{requests.length ? 'Clear or adjust the queue filters to see other requests.' : 'Requests submitted from case and entity records will appear here for triage.'}</p>
        </div>
      ) : (
        <div className="dd-table-wrap dd-request-table">
          <table className="dd-data-table">
            <thead>
              <tr>
                <th>Request</th>
                <th>Subject</th>
                <th>Request type</th>
                <th>Entity</th>
                <th>Requester</th>
                <th>Priority</th>
                <th>Submitted</th>
                <th>Owner</th>
                <th>Status</th>
                <th aria-label="Actions" />
              </tr>
            </thead>
            <tbody>
              {visibleRequests.map((request) => (
                <tr key={request.id}>
                  <td><span className="dd-mono">{requestReference(request)}</span></td>
                  <td>
                    <button type="button" className="dd-company-record-link" onClick={() => openRequest(request)}>
                      <strong>{requestSubject(request)}</strong>
                    </button>
                    <small>{request.case_suit_number || 'No case reference'}</small>
                  </td>
                  <td>{labelFor(REQUEST_TYPE_OPTIONS, request.request_type, request.request_type)}</td>
                  <td>{labelFor(ENTITY_TYPE_OPTIONS, request.entity_type, request.entity_type)}</td>
                  <td><strong>{request.requester_name || 'Not supplied'}</strong><small>{request.requester_email || 'No email'}</small></td>
                  <td><span className={`dd-status-pill ${priorityClass(request.priority, request.is_urgent)}`}>{request.is_urgent ? 'Urgent' : labelFor(PRIORITY_OPTIONS, request.priority, request.priority)}</span></td>
                  <td className="dd-request-date">{formatDate(request.created_at)}</td>
                  <td>{request.assigned_to || 'Unassigned'}</td>
                  <td><span className={`dd-status-pill ${statusClass(request.status)}`}>{labelFor(STATUS_OPTIONS, request.status, request.status)}</span></td>
                  <td>
                    <button type="button" className="dd-icon-button" onClick={() => openRequest(request)} aria-label={`Open ${requestReference(request)}`} title="Open request">
                      <Eye size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <footer className="dd-request-pagination">
        <span>Records {firstResult}-{lastResult} of {formatNumber(filteredRequests.length)}</span>
        <div>
          <button type="button" className="dd-button dd-button-secondary" onClick={() => setPage((value) => Math.max(1, value - 1))} disabled={currentPage <= 1}>
            <ChevronLeft size={13} /> Prev
          </button>
          <span>Page {currentPage} of {totalPages}</span>
          <button type="button" className="dd-button dd-button-secondary" onClick={() => setPage((value) => Math.min(totalPages, value + 1))} disabled={currentPage >= totalPages}>
            Next <ChevronRight size={13} />
          </button>
        </div>
      </footer>
    </section>
  );

  const renderWorkload = () => (
    <div className="dd-request-workload">
      <div className="dd-request-workload-grid">
        <BreakdownPanel
          title="Workflow distribution"
          description="Current request volume by processing status."
          values={stats.requests_by_status}
          options={STATUS_OPTIONS}
          total={stats.total_requests}
        />
        <BreakdownPanel
          title="Request mix"
          description="Information requested across the platform."
          values={stats.requests_by_type}
          options={REQUEST_TYPE_OPTIONS}
          total={stats.total_requests}
        />
        <BreakdownPanel
          title="Entity coverage"
          description="Subjects represented in the request queue."
          values={stats.requests_by_entity}
          options={ENTITY_TYPE_OPTIONS}
          total={stats.total_requests}
        />
        <section className="dd-panel">
          <header className="dd-panel-header">
            <div>
              <h3>Current attention</h3>
              <p>Items that should guide the next queue review.</p>
            </div>
            <UserRoundCheck size={16} />
          </header>
          <div className="dd-request-attention-list">
            <button type="button" onClick={() => applySummaryFilter('pending')}>
              <CircleDot size={15} /><span><strong>Awaiting triage</strong><small>Not yet taken into active review</small></span><b>{formatNumber(stats.pending_requests)}</b>
            </button>
            <button type="button" onClick={() => applySummaryFilter('in_progress')}>
              <Clock3 size={15} /><span><strong>In progress</strong><small>Assigned or currently being investigated</small></span><b>{formatNumber(stats.in_progress_requests)}</b>
            </button>
            <button type="button" onClick={() => { setActiveView('queue'); setPriorityFilter('urgent'); }}>
              <AlertTriangle size={15} /><span><strong>Urgent requests</strong><small>Flagged for accelerated handling</small></span><b>{formatNumber(stats.urgent_requests)}</b>
            </button>
          </div>
        </section>
      </div>
    </div>
  );

  const renderControls = () => (
    <div className="dd-request-controls-view">
      <section className="dd-panel">
        <header className="dd-panel-header">
          <div>
            <h3>Request handling controls</h3>
            <p>Operating controls applied from submission through resolution.</p>
          </div>
          <ShieldCheck size={16} />
        </header>
        <div className="dd-table-wrap dd-request-controls-table">
          <table className="dd-data-table">
            <thead><tr><th>Control</th><th>Operational practice</th><th>Evidence retained</th><th>State</th></tr></thead>
            <tbody>
              <tr><td><strong>Submission capture</strong></td><td>Request type, subject, requester and supporting message are recorded on receipt.</td><td>Request record and creation timestamp</td><td><span className="dd-status-pill is-clear">Active</span></td></tr>
              <tr><td><strong>Triage workflow</strong></td><td>Pending, in-progress and final states keep work visible from intake to closure.</td><td>Status and update timestamp</td><td><span className="dd-status-pill is-clear">Active</span></td></tr>
              <tr><td><strong>Ownership</strong></td><td>Requests can be assigned to a named workspace administrator or analyst.</td><td>Assigned owner</td><td><span className="dd-status-pill is-clear">Active</span></td></tr>
              <tr><td><strong>Priority handling</strong></td><td>Priority and urgent flags separate routine work from time-sensitive requests.</td><td>Priority and urgency flag</td><td><span className="dd-status-pill is-clear">Active</span></td></tr>
              <tr><td><strong>Decision record</strong></td><td>Internal notes and the response message are retained with the request.</td><td>Admin notes and response</td><td><span className="dd-status-pill is-clear">Active</span></td></tr>
              <tr><td><strong>Source context</strong></td><td>Submission origin is preserved to support review and incident investigation.</td><td>IP, referrer and user agent</td><td><span className="dd-status-pill is-clear">Active</span></td></tr>
            </tbody>
          </table>
        </div>
      </section>
      <div className="dd-register-note dd-request-retention-note">
        <ShieldCheck size={16} />
        <div><strong>Record history is retained</strong><span>This workspace provides controlled processing actions only. Request records are not removed from this interface.</span></div>
      </div>
    </div>
  );

  return (
    <main className="dd-module-shell dd-search-requests">
      <header className="dd-module-heading">
        <div>
          <p className="dd-eyebrow">Request operations</p>
          <h2>Search request queue</h2>
          <p>Triage information requests submitted from case, person and organisation records.</p>
        </div>
        <div className="dd-heading-actions">
          <button type="button" className="dd-button dd-button-secondary" onClick={() => loadData({ quiet: true })} disabled={refreshing}>
            <RefreshCw className={refreshing ? 'dd-spin' : ''} size={14} /> Refresh
          </button>
          <button type="button" className="dd-button dd-button-primary" onClick={exportQueue} disabled={!filteredRequests.length}>
            <Download size={14} /> Export CSV
          </button>
        </div>
      </header>

      {error && <div className="dd-inline-alert is-error"><span>{error}</span><button type="button" onClick={() => setError('')} aria-label="Dismiss error"><X size={14} /></button></div>}
      {notice && <div className="dd-inline-alert is-info"><span>{notice}</span><button type="button" onClick={() => setNotice('')} aria-label="Dismiss message"><X size={14} /></button></div>}

      <div>
        <div className="dd-gazette-summary dd-request-summary">
          <button type="button" className={!statusFilter ? 'is-active' : ''} onClick={() => applySummaryFilter('')}>
            <FileSearch size={17} /><span>Total requests</span><strong>{formatNumber(stats.total_requests)}</strong><small>{formatNumber(stats.urgent_requests)} urgent</small>
          </button>
          <button type="button" className={statusFilter === 'pending' ? 'is-active' : ''} onClick={() => applySummaryFilter('pending')}>
            <CircleDot size={17} /><span>Awaiting triage</span><strong>{formatNumber(stats.pending_requests)}</strong><small>Pending review</small>
          </button>
          <button type="button" className={statusFilter === 'in_progress' ? 'is-active' : ''} onClick={() => applySummaryFilter('in_progress')}>
            <Clock3 size={17} /><span>In progress</span><strong>{formatNumber(stats.in_progress_requests)}</strong><small>Active work</small>
          </button>
          <button type="button" className={statusFilter === 'completed' ? 'is-active' : ''} onClick={() => applySummaryFilter('completed')}>
            <CheckCircle2 size={17} /><span>Completed</span><strong>{formatNumber(stats.completed_requests)}</strong><small>Resolved</small>
          </button>
        </div>
        <nav className="dd-gazette-dataset-tabs" aria-label="Search request views">
          <button type="button" className={activeView === 'queue' ? 'is-active' : ''} onClick={() => setActiveView('queue')}><strong>Queue</strong><span>{formatNumber(stats.total_requests)}</span></button>
          <button type="button" className={activeView === 'workload' ? 'is-active' : ''} onClick={() => setActiveView('workload')}><BarChart3 size={13} /><strong>Workload</strong></button>
          <button type="button" className={activeView === 'controls' ? 'is-active' : ''} onClick={() => setActiveView('controls')}><ShieldCheck size={13} /><strong>Controls</strong></button>
        </nav>
      </div>

      {activeView === 'queue' && renderQueue()}
      {activeView === 'workload' && renderWorkload()}
      {activeView === 'controls' && renderControls()}

      {selectedRequest && (
        <div className="dd-modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) closeRequest(); }}>
          <section className="dd-modal dd-request-detail-modal" role="dialog" aria-modal="true" aria-labelledby="request-detail-title">
            <header>
              <div>
                <h3 id="request-detail-title">{requestSubject(requestDetail || selectedRequest)}</h3>
                <p>{requestReference(requestDetail || selectedRequest)} · {labelFor(REQUEST_TYPE_OPTIONS, (requestDetail || selectedRequest).request_type)}</p>
              </div>
              <button type="button" onClick={closeRequest} aria-label="Close request"><X size={16} /></button>
            </header>

            {detailLoading ? (
              <div className="dd-loading-state"><Loader2 className="dd-spin" size={17} /> Loading request details...</div>
            ) : requestDetail ? (
              <>
                <div className="dd-gazette-facts dd-request-facts">
                  <div><FileSearch size={14} /><span>Reference</span><strong>{requestReference(requestDetail)}</strong></div>
                  <div><CircleDot size={14} /><span>Status</span><strong>{labelFor(STATUS_OPTIONS, requestDetail.status, requestDetail.status)}</strong></div>
                  <div><AlertTriangle size={14} /><span>Priority</span><strong>{requestDetail.is_urgent ? 'Urgent' : labelFor(PRIORITY_OPTIONS, requestDetail.priority, requestDetail.priority)}</strong></div>
                  <div><UserRoundCheck size={14} /><span>Owner</span><strong>{requestDetail.assigned_to || 'Unassigned'}</strong></div>
                </div>
                <nav className="dd-gazette-detail-tabs" aria-label="Request detail sections">
                  <button type="button" className={detailTab === 'request' ? 'is-active' : ''} onClick={() => setDetailTab('request')}>Request</button>
                  <button type="button" className={detailTab === 'processing' ? 'is-active' : ''} onClick={() => setDetailTab('processing')}>Processing</button>
                  <button type="button" className={detailTab === 'audit' ? 'is-active' : ''} onClick={() => setDetailTab('audit')}>Audit</button>
                </nav>

                <div className="dd-modal-body dd-request-detail-body">
                  {detailTab === 'request' && (
                    <dl className="dd-request-detail-list">
                      <DetailField label="Subject" value={requestSubject(requestDetail)} />
                      <DetailField label="Entity type" value={labelFor(ENTITY_TYPE_OPTIONS, requestDetail.entity_type, requestDetail.entity_type)} />
                      <DetailField label="Entity ID" value={requestDetail.entity_id ? String(requestDetail.entity_id) : ''} />
                      <DetailField label="Case suit number" value={requestDetail.case_suit_number} />
                      <DetailField label="Requester" value={requestDetail.requester_name} />
                      <DetailField label="Organisation" value={requestDetail.requester_organization} />
                      <DetailField label="Email" value={requestDetail.requester_email} />
                      <DetailField label="Phone" value={requestDetail.requester_phone} />
                      <DetailField label="Submitted" value={formatDate(requestDetail.created_at)} />
                      <DetailField label="Last updated" value={formatDate(requestDetail.updated_at)} />
                      <DetailField label="Request message" value={requestDetail.message} wide />
                      <DetailField label="Response to requester" value={requestDetail.response_message} wide />
                    </dl>
                  )}

                  {detailTab === 'processing' && (
                    <div className="dd-request-processing-form">
                      <div className="dd-request-processing-grid">
                        <label><span>Status</span><select value={processingForm.status} onChange={(event) => updateProcessingField('status', event.target.value)}>{STATUS_OPTIONS.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select></label>
                        <label><span>Priority</span><select value={processingForm.priority} onChange={(event) => updateProcessingField('priority', event.target.value)}>{PRIORITY_OPTIONS.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select></label>
                        <label className="is-wide"><span>Assigned to</span><div className="dd-request-assignee"><input value={processingForm.assigned_to} onChange={(event) => updateProcessingField('assigned_to', event.target.value)} placeholder="Workspace administrator or analyst" /><button type="button" className="dd-button dd-button-secondary" onClick={() => updateProcessingField('assigned_to', currentUser)}>Assign to me</button></div></label>
                      </div>
                      <label className="dd-request-urgent-control"><input type="checkbox" checked={processingForm.is_urgent} onChange={(event) => updateProcessingField('is_urgent', event.target.checked)} /><span><strong>Urgent handling</strong><small>Flag this request for accelerated review.</small></span></label>
                      <label><span>Internal notes</span><textarea className="dd-textarea" rows="4" value={processingForm.admin_notes} onChange={(event) => updateProcessingField('admin_notes', event.target.value)} placeholder="Record analysis, handover context or internal decisions." /></label>
                      <label><span>Response to requester</span><textarea className="dd-textarea" rows="4" value={processingForm.response_message} onChange={(event) => updateProcessingField('response_message', event.target.value)} placeholder="Record the response or outcome communicated to the requester." /></label>
                    </div>
                  )}

                  {detailTab === 'audit' && (
                    <dl className="dd-request-detail-list">
                      <DetailField label="Created" value={formatDate(requestDetail.created_at)} />
                      <DetailField label="Updated" value={formatDate(requestDetail.updated_at)} />
                      <DetailField label="Completed" value={formatDate(requestDetail.completed_at)} />
                      <DetailField label="Source IP" value={requestDetail.source_ip} />
                      <DetailField label="Referrer" value={requestDetail.referrer} wide />
                      <DetailField label="User agent" value={requestDetail.user_agent} wide />
                    </dl>
                  )}

                  <div className="dd-modal-actions">
                    <button type="button" className="dd-button dd-button-secondary" onClick={closeRequest}>Close</button>
                    {detailTab === 'processing' && <button type="button" className="dd-button dd-button-primary" onClick={saveProcessing} disabled={saving}>{saving && <Loader2 className="dd-spin" size={13} />} Save changes</button>}
                  </div>
                </div>
              </>
            ) : (
              <div className="dd-empty-state"><AlertTriangle size={22} /><div><strong>Request details are unavailable</strong><p>Close this panel and try opening the request again.</p></div></div>
            )}
          </section>
        </div>
      )}
    </main>
  );
};

export default SearchRequestsPage;
