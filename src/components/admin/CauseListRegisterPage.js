import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  CalendarDays,
  CalendarRange,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Edit3,
  Eye,
  FileText,
  LayoutList,
  List,
  Loader2,
  MapPin,
  Plus,
  RefreshCw,
  Scale,
  Search,
  ShieldCheck,
  X,
} from 'lucide-react';
import { apiGet, apiPost, apiPut } from '../../utils/api';

const PAGE_SIZE = 25;

const EMPTY_SUMMARY = {
  total: 0,
  today: 0,
  upcoming: 0,
  past: 0,
  sitting_dates: 0,
  earliest_hearing_date: null,
  latest_hearing_date: null,
  by_case_type: [],
  by_court_type: [],
  by_status: [],
};

const DEFAULT_CASE_TYPES = ['MOTIONS', 'APPEALS', 'WRITS', 'CRIMINAL', 'CIVIL', 'COMMERCIAL'];

const EMPTY_FORM = {
  case_title: '',
  suit_no: '',
  case_type: '',
  hearing_date: '',
  hearing_time: '',
  court_type: 'Supreme Court',
  location: '',
  venue: '',
  status: 'Active',
  judge_name: '',
  first_party_title: '',
  first_party_name: '',
  second_party_title: '',
  second_party_name: '',
  first_party_counsel_name: '',
  first_party_counsel_contact: '',
  second_party_counsel_name: '',
  second_party_counsel_contact: '',
  remarks: '',
};

const formFields = [
  { name: 'case_title', label: 'Case title', required: true, type: 'textarea', wide: true },
  { name: 'suit_no', label: 'Suit number' },
  { name: 'case_type', label: 'Case type', type: 'case-type' },
  { name: 'hearing_date', label: 'Hearing date', type: 'date', required: true },
  { name: 'hearing_time', label: 'Hearing time', type: 'time' },
  { name: 'court_type', label: 'Court' },
  { name: 'location', label: 'Location' },
  { name: 'venue', label: 'Venue' },
  { name: 'status', label: 'Status', type: 'status' },
  { name: 'judge_name', label: 'Judge / panel' },
  { name: 'first_party_title', label: 'First party role' },
  { name: 'first_party_name', label: 'First party' },
  { name: 'second_party_title', label: 'Second party role' },
  { name: 'second_party_name', label: 'Second party' },
  { name: 'first_party_counsel_name', label: 'First party counsel' },
  { name: 'first_party_counsel_contact', label: 'First counsel contact' },
  { name: 'second_party_counsel_name', label: 'Second party counsel' },
  { name: 'second_party_counsel_contact', label: 'Second counsel contact' },
  { name: 'remarks', label: 'Remarks', type: 'textarea', wide: true },
];

const parseDate = (value) => {
  if (!value) return null;
  const date = new Date(`${String(value).slice(0, 10)}T00:00:00`);
  return Number.isNaN(date.getTime()) ? null : date;
};

const formatDate = (value, options = {}) => {
  const date = parseDate(value);
  if (!date) return 'Not recorded';
  return date.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: options.long ? 'long' : 'short',
    year: 'numeric',
    ...(options.weekday ? { weekday: 'short' } : {}),
  });
};

const formatDateTime = (value) => {
  if (!value) return 'Not recorded';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toLocaleString('en-GB', {
    day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
  });
};

const formatTime = (value) => {
  if (!value) return 'Time not recorded';
  const [hours, minutes] = String(value).split(':');
  const date = new Date(2000, 0, 1, Number(hours), Number(minutes || 0));
  return Number.isNaN(date.getTime())
    ? String(value)
    : date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
};

const toInputTime = (value) => value ? String(value).slice(0, 5) : '';
const todayIso = () => {
  const today = new Date();
  const offset = today.getTimezoneOffset();
  return new Date(today.getTime() - (offset * 60 * 1000)).toISOString().slice(0, 10);
};
const yesterdayIso = () => {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const offset = yesterday.getTimezoneOffset();
  return new Date(yesterday.getTime() - (offset * 60 * 1000)).toISOString().slice(0, 10);
};

const displayValue = (value) => (
  value === null || value === undefined || value === '' ? 'Not recorded' : String(value)
);

const recordTitle = (record) => record.case_title
  || [record.first_party_name, record.second_party_name].filter(Boolean).join(' v ')
  || record.suit_no
  || 'Untitled matter';

const recordId = (id) => `CL-${String(id).padStart(6, '0')}`;

const statusClass = (status) => {
  const normalized = String(status || '').toLowerCase();
  if (normalized.includes('active') || normalized.includes('listed')) return 'is-success';
  if (normalized.includes('adjourn')) return 'is-warning';
  if (normalized.includes('closed') || normalized.includes('inactive')) return 'is-neutral';
  return 'is-info';
};

const CauseListRegisterPage = () => {
  const [records, setRecords] = useState([]);
  const [summary, setSummary] = useState(EMPTY_SUMMARY);
  const [loading, setLoading] = useState(true);
  const [summaryLoading, setSummaryLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [draftSearch, setDraftSearch] = useState('');
  const [appliedSearch, setAppliedSearch] = useState('');
  const [caseType, setCaseType] = useState('');
  const [courtType, setCourtType] = useState('');
  const [status, setStatus] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [scope, setScope] = useState('all');
  const [viewMode, setViewMode] = useState('table');
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [formMode, setFormMode] = useState('create');
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [formError, setFormError] = useState('');
  const [formSubmitting, setFormSubmitting] = useState(false);

  const firstRecord = total ? ((page - 1) * PAGE_SIZE) + 1 : 0;
  const lastRecord = Math.min(page * PAGE_SIZE, total);
  const caseTypes = useMemo(() => {
    const values = [...DEFAULT_CASE_TYPES, ...(summary.by_case_type || []).map((item) => item.label)];
    return Array.from(new Set(values.filter((value) => value && value !== 'Not recorded')));
  }, [summary.by_case_type]);

  const loadSummary = useCallback(async () => {
    setSummaryLoading(true);
    try {
      const response = await apiGet('/admin/cause-lists/summary');
      setSummary({ ...EMPTY_SUMMARY, ...response });
    } catch (requestError) {
      setError(requestError.message || 'Cause list totals could not be loaded.');
    } finally {
      setSummaryLoading(false);
    }
  }, []);

  const loadRecords = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = {
        page,
        limit: PAGE_SIZE,
        search: appliedSearch,
        case_type: caseType,
        court_type: courtType,
        status,
        hearing_date_from: scope === 'upcoming' ? todayIso() : dateFrom,
        hearing_date_to: scope === 'past' ? yesterdayIso() : dateTo,
      };
      const response = await apiGet('/admin/cause-lists', params);
      setRecords(response.cause_lists || []);
      setTotal(Number(response.total || 0));
      setTotalPages(Math.max(1, Number(response.total_pages || 1)));
    } catch (requestError) {
      setRecords([]);
      setTotal(0);
      setTotalPages(1);
      setError(requestError.message || 'Cause list records could not be loaded.');
    } finally {
      setLoading(false);
    }
  }, [appliedSearch, caseType, courtType, dateFrom, dateTo, page, scope, status]);

  useEffect(() => { loadSummary(); }, [loadSummary]);
  useEffect(() => { loadRecords(); }, [loadRecords]);

  const groupedRecords = useMemo(() => records.reduce((groups, record) => {
    const key = record.hearing_date || 'Not recorded';
    if (!groups[key]) groups[key] = [];
    groups[key].push(record);
    return groups;
  }, {}), [records]);

  const submitSearch = (event) => {
    event.preventDefault();
    setPage(1);
    setAppliedSearch(draftSearch.trim());
  };

  const clearFilters = () => {
    setDraftSearch('');
    setAppliedSearch('');
    setCaseType('');
    setCourtType('');
    setStatus('');
    setDateFrom('');
    setDateTo('');
    setScope('all');
    setPage(1);
  };

  const applyScope = (nextScope) => {
    setScope(nextScope);
    setDateFrom('');
    setDateTo('');
    setPage(1);
  };

  const openForm = (mode, record = null) => {
    setFormMode(mode);
    setFormError('');
    setFormData(record ? {
      ...EMPTY_FORM,
      ...Object.fromEntries(Object.keys(EMPTY_FORM).map((key) => [key, record[key] ?? EMPTY_FORM[key]])),
      hearing_date: record.hearing_date ? String(record.hearing_date).slice(0, 10) : '',
      hearing_time: toInputTime(record.hearing_time),
      id: record.id,
    } : { ...EMPTY_FORM });
    setShowForm(true);
  };

  const closeForm = () => {
    if (formSubmitting) return;
    setShowForm(false);
    setFormError('');
  };

  const saveRecord = async (event) => {
    event.preventDefault();
    if (!formData.case_title.trim() || !formData.hearing_date) {
      setFormError('Case title and hearing date are required.');
      return;
    }

    const payload = {};
    Object.keys(EMPTY_FORM).forEach((key) => {
      const value = formData[key];
      payload[key] = typeof value === 'string' ? (value.trim() || null) : value;
    });

    setFormSubmitting(true);
    setFormError('');
    try {
      if (formMode === 'create') await apiPost('/admin/cause-lists', payload);
      else await apiPut(`/admin/cause-lists/${formData.id}`, payload);
      setShowForm(false);
      await Promise.all([loadRecords(), loadSummary()]);
    } catch (requestError) {
      setFormError(requestError.message || 'The cause list record could not be saved.');
    } finally {
      setFormSubmitting(false);
    }
  };

  const detailRows = (record) => [
    ['Record ID', recordId(record.id)],
    ['Suit number', record.suit_no],
    ['Case type', record.case_type],
    ['Status', record.status],
    ['Hearing date', formatDate(record.hearing_date, { long: true, weekday: true })],
    ['Hearing time', formatTime(record.hearing_time)],
    ['Court', record.court_type],
    ['Location', record.location],
    ['Venue', record.venue],
    ['Judge / panel', record.judge_name],
    [record.first_party_title || 'First party', record.first_party_name],
    [record.second_party_title || 'Second party', record.second_party_name],
    ['First party counsel', record.first_party_counsel_name],
    ['First counsel contact', record.first_party_counsel_contact],
    ['Second party counsel', record.second_party_counsel_name],
    ['Second counsel contact', record.second_party_counsel_contact],
    ['Remarks', record.remarks],
    ['Source / created by', record.created_by],
    ['Imported', formatDateTime(record.created_at)],
    ['Last updated', formatDateTime(record.updated_at)],
  ];

  const renderActions = (record) => (
    <td className="dd-cause-row-actions">
      <button type="button" className="dd-icon-button" onClick={() => setSelectedRecord(record)} title="Open record" aria-label="Open record"><Eye size={14} /></button>
      <button type="button" className="dd-icon-button" onClick={() => openForm('edit', record)} title="Edit record" aria-label="Edit record"><Edit3 size={14} /></button>
    </td>
  );

  const hasFilters = draftSearch || appliedSearch || caseType || courtType || status || dateFrom || dateTo || scope !== 'all';

  return (
    <section className="dd-module-shell dd-cause-register">
      <div className="dd-module-heading">
        <div>
          <p className="dd-eyebrow">Court operations</p>
          <h2>Cause list register</h2>
          <p>Review scheduled matters by sitting date, suit number, party, court and case type.</p>
        </div>
        <div className="dd-heading-actions">
          <span className="dd-count-badge"><CalendarDays size={14} /> {summary.total.toLocaleString()} matters</span>
          <button type="button" className="dd-button dd-button-primary" onClick={() => openForm('create')}><Plus size={14} /> Add cause list entry</button>
        </div>
      </div>

      <section className="dd-cause-summary" aria-label="Cause list summary">
        <button type="button" className={scope === 'all' ? 'is-active' : ''} onClick={() => applyScope('all')}>
          <FileText size={17} /><span>Active entries</span><strong>{summaryLoading ? '...' : summary.total.toLocaleString()}</strong><small>Across the register</small>
        </button>
        <button type="button" className={scope === 'upcoming' ? 'is-active' : ''} onClick={() => applyScope('upcoming')}>
          <CalendarRange size={17} /><span>Upcoming</span><strong>{summaryLoading ? '...' : summary.upcoming.toLocaleString()}</strong><small>{summary.today ? `${summary.today} listed today` : 'No matters today'}</small>
        </button>
        <button type="button" className={scope === 'past' ? 'is-active' : ''} onClick={() => applyScope('past')}>
          <Clock3 size={17} /><span>Past sittings</span><strong>{summaryLoading ? '...' : summary.past.toLocaleString()}</strong><small>Historical entries</small>
        </button>
        <button type="button" onClick={() => { applyScope('all'); setViewMode('schedule'); }}>
          <Scale size={17} /><span>Sitting dates</span><strong>{summaryLoading ? '...' : summary.sitting_dates.toLocaleString()}</strong><small>{summary.latest_hearing_date ? `Through ${formatDate(summary.latest_hearing_date)}` : 'No date recorded'}</small>
        </button>
      </section>

      <section className="dd-enquiry-panel">
        <header>Find a listed matter</header>
        <form className="dd-cause-filter-form" onSubmit={submitSearch}>
          <label className="dd-cause-search-field">
            <span>Title, suit number, party or judge</span>
            <div className="dd-input-with-icon"><Search size={14} /><input value={draftSearch} onChange={(event) => setDraftSearch(event.target.value)} placeholder="Search the cause list" /></div>
          </label>
          <label><span>Case type</span><select className="dd-select-control" value={caseType} onChange={(event) => { setCaseType(event.target.value); setPage(1); }}><option value="">All case types</option>{(summary.by_case_type || []).map((item) => <option key={item.label} value={item.label}>{item.label} ({item.count})</option>)}</select></label>
          <label><span>Court</span><select className="dd-select-control" value={courtType} onChange={(event) => { setCourtType(event.target.value); setPage(1); }}><option value="">All courts</option>{(summary.by_court_type || []).map((item) => <option key={item.label} value={item.label}>{item.label} ({item.count})</option>)}</select></label>
          <label><span>Status</span><select className="dd-select-control" value={status} onChange={(event) => { setStatus(event.target.value); setPage(1); }}><option value="">All statuses</option>{(summary.by_status || []).map((item) => <option key={item.label} value={item.label}>{item.label} ({item.count})</option>)}</select></label>
          <label><span>From</span><input type="date" value={dateFrom} onChange={(event) => { setDateFrom(event.target.value); setScope('all'); setPage(1); }} /></label>
          <label><span>To</span><input type="date" value={dateTo} onChange={(event) => { setDateTo(event.target.value); setScope('all'); setPage(1); }} /></label>
          <div className="dd-cause-filter-actions">
            <button type="submit" className="dd-button dd-button-primary" disabled={loading}>{loading ? <Loader2 size={14} className="dd-spin" /> : <Search size={14} />} Search</button>
            <button type="button" className="dd-button dd-button-secondary" onClick={clearFilters} disabled={!hasFilters}><X size={14} /> Clear</button>
          </div>
        </form>
      </section>

      <div className="dd-inline-alert is-info dd-cause-register-note">
        <ShieldCheck size={15} />
        <span>Searching, filtering and opening records does not alter them. Changes are made only after Save record, and this page provides no deletion action.</span>
      </div>

      {error && <div className="dd-inline-alert is-error"><span>{error}</span><button type="button" onClick={() => { setError(''); loadRecords(); loadSummary(); }} aria-label="Retry"><RefreshCw size={14} /></button></div>}

      <section className="dd-enquiry-results" aria-live="polite">
        <header>
          <h2>Listed matters <span>{total.toLocaleString()}</span></h2>
          <div className="dd-cause-results-tools">
            <div className="dd-view-toggle" aria-label="Cause list view">
              <button type="button" className={viewMode === 'table' ? 'is-active' : ''} onClick={() => setViewMode('table')} aria-label="Table view" title="Table view"><List size={14} /></button>
              <button type="button" className={viewMode === 'schedule' ? 'is-active' : ''} onClick={() => setViewMode('schedule')} aria-label="Sitting day view" title="Sitting day view"><LayoutList size={14} /></button>
            </div>
            <span>Records {firstRecord}-{lastRecord} of {total.toLocaleString()}</span>
            <button type="button" disabled={loading || page <= 1} onClick={() => setPage((value) => Math.max(1, value - 1))}><ChevronLeft size={14} /> Prev</button>
            <button type="button" disabled={loading || page >= totalPages} onClick={() => setPage((value) => Math.min(totalPages, value + 1))}>Next <ChevronRight size={14} /></button>
          </div>
        </header>

        {loading ? (
          <div className="dd-loading-state"><Loader2 size={22} className="dd-spin" /> Loading cause list</div>
        ) : !records.length ? (
          <div className="dd-empty-state"><CalendarDays size={28} /><div><strong>No listed matters found</strong><p>Change the date range or clear the filters to review the full register.</p></div></div>
        ) : viewMode === 'table' ? (
          <div className="dd-table-wrap dd-cause-register-table">
            <table className="dd-data-table">
              <thead><tr><th>Hearing</th><th>Case</th><th>Parties</th><th>Court / venue</th><th>Type / status</th><th aria-label="Actions" /></tr></thead>
              <tbody>{records.map((record) => (
                <tr key={record.id}>
                  <td><strong>{formatDate(record.hearing_date, { weekday: true })}</strong><small><Clock3 size={11} /> {formatTime(record.hearing_time)}</small></td>
                  <td><button type="button" className="dd-company-record-link" onClick={() => setSelectedRecord(record)}><strong>{recordTitle(record)}</strong></button><small><span className="dd-mono">{record.suit_no || recordId(record.id)}</span></small></td>
                  <td><strong>{record.first_party_name || 'First party not recorded'}</strong><small>{record.second_party_name ? `v ${record.second_party_name}` : 'Second party not recorded'}</small></td>
                  <td><strong>{record.court_type || 'Court not recorded'}</strong><small><MapPin size={11} /> {[record.venue, record.location].filter(Boolean).join(', ') || 'Venue not recorded'}</small></td>
                  <td><strong>{record.case_type || 'Not classified'}</strong><small><span className={`dd-status-pill ${statusClass(record.status)}`}>{record.status || 'Not recorded'}</span></small></td>
                  {renderActions(record)}
                </tr>
              ))}</tbody>
            </table>
          </div>
        ) : (
          <div className="dd-cause-schedule">
            {Object.entries(groupedRecords).map(([date, dayRecords]) => (
              <section key={date} className="dd-cause-day">
                <header><div><CalendarDays size={15} /><strong>{formatDate(date, { long: true, weekday: true })}</strong></div><span>{dayRecords.length} {dayRecords.length === 1 ? 'matter' : 'matters'}</span></header>
                <div>{dayRecords.map((record) => (
                  <button type="button" key={record.id} className="dd-cause-day-row" onClick={() => setSelectedRecord(record)}>
                    <span><Clock3 size={13} /> {formatTime(record.hearing_time)}</span>
                    <span><strong>{recordTitle(record)}</strong><small>{record.suit_no || recordId(record.id)}</small></span>
                    <span><strong>{record.case_type || 'Not classified'}</strong><small>{record.court_type || 'Court not recorded'}</small></span>
                    <ChevronRight size={15} />
                  </button>
                ))}</div>
              </section>
            ))}
          </div>
        )}
      </section>

      {selectedRecord && (
        <div className="dd-modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setSelectedRecord(null); }}>
          <div className="dd-modal dd-company-detail-modal" role="dialog" aria-modal="true" aria-labelledby="cause-record-title">
            <header><div><h3 id="cause-record-title">{recordTitle(selectedRecord)}</h3><p>{selectedRecord.suit_no || recordId(selectedRecord.id)}</p></div><button type="button" onClick={() => setSelectedRecord(null)} aria-label="Close"><X size={17} /></button></header>
            <div className="dd-modal-body">
              <div className="dd-company-detail-summary"><span><CalendarDays size={17} /></span><div><strong>{formatDate(selectedRecord.hearing_date, { long: true, weekday: true })} at {formatTime(selectedRecord.hearing_time)}</strong><small>{[selectedRecord.court_type, selectedRecord.venue, selectedRecord.location].filter(Boolean).join(' - ') || 'Court details not recorded'}</small></div></div>
              <dl className="dd-person-detail-list">{detailRows(selectedRecord).map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{displayValue(value)}</dd></div>)}</dl>
              <div className="dd-modal-actions"><button type="button" className="dd-button dd-button-secondary" onClick={() => setSelectedRecord(null)}>Close</button><button type="button" className="dd-button dd-button-primary" onClick={() => { const record = selectedRecord; setSelectedRecord(null); openForm('edit', record); }}><Edit3 size={14} /> Edit record</button></div>
            </div>
          </div>
        </div>
      )}

      {showForm && (
        <div className="dd-modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) closeForm(); }}>
          <div className="dd-modal dd-company-record-form" role="dialog" aria-modal="true" aria-labelledby="cause-form-title">
            <header><div><h3 id="cause-form-title">{formMode === 'create' ? 'Add cause list entry' : 'Edit cause list entry'}</h3><p>Maintain hearing information without removing the imported register record.</p></div><button type="button" onClick={closeForm} aria-label="Close"><X size={17} /></button></header>
            <form className="dd-modal-body" onSubmit={saveRecord}>
              {formError && <div className="dd-inline-alert is-error">{formError}</div>}
              <div className="dd-company-record-form-grid">
                {formFields.map((field) => (
                  <label key={field.name} className={field.wide ? 'is-wide' : ''}>
                    <span>{field.label}{field.required ? ' *' : ''}</span>
                    {field.type === 'textarea' ? <textarea rows={field.name === 'case_title' ? 2 : 3} required={field.required} value={formData[field.name] || ''} onChange={(event) => setFormData((current) => ({ ...current, [field.name]: event.target.value }))} />
                      : field.type === 'case-type' ? <select className="dd-select-control" value={formData[field.name] || ''} onChange={(event) => setFormData((current) => ({ ...current, [field.name]: event.target.value }))}><option value="">Select case type</option>{caseTypes.map((value) => <option key={value} value={value}>{value}</option>)}</select>
                        : field.type === 'status' ? <select className="dd-select-control" value={formData[field.name] || ''} onChange={(event) => setFormData((current) => ({ ...current, [field.name]: event.target.value }))}>{['Active', 'Adjourned', 'Closed'].map((value) => <option key={value} value={value}>{value}</option>)}</select>
                          : <input type={field.type || 'text'} required={field.required} value={formData[field.name] || ''} onChange={(event) => setFormData((current) => ({ ...current, [field.name]: event.target.value }))} />}
                  </label>
                ))}
              </div>
              <div className="dd-modal-actions"><button type="button" className="dd-button dd-button-secondary" onClick={closeForm}>Cancel</button><button type="submit" className="dd-button dd-button-primary" disabled={formSubmitting}>{formSubmitting ? <Loader2 size={14} className="dd-spin" /> : <Edit3 size={14} />} {formSubmitting ? 'Saving' : 'Save record'}</button></div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
};

export default CauseListRegisterPage;
