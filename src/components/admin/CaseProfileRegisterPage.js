import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  BrainCircuit,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  CircleDollarSign,
  Edit3,
  Eye,
  FileCheck2,
  FileText,
  Gavel,
  Landmark,
  Loader2,
  Plus,
  RefreshCw,
  Search,
  ShieldCheck,
  X,
} from 'lucide-react';
import { apiGet, apiPost, apiPut } from '../../utils/api';

const PAGE_SIZE = 25;

const EMPTY_STATS = {
  totalCases: 0,
  reportedCases: 0,
  aiAssessedCases: 0,
  highFinancialImpactCases: 0,
  profilesWithSummary: 0,
  profilesWithSourceFile: 0,
  courtTypeDistribution: {},
  statusDistribution: {},
  yearDistribution: {},
  regionDistribution: {},
  sourceTypeDistribution: {},
  areaOfLawDistribution: {},
  outcomeDistribution: {},
  financialImpactDistribution: {},
};

const EMPTY_FORM = {
  title: '',
  suit_reference_number: '',
  date: '',
  year: '',
  court_type: '',
  court_division: '',
  town: '',
  region: '',
  presiding_judge: '',
  type: '',
  area_of_law: '',
  status: '',
  citation: '',
  dl_citation_no: '',
  case_summary: '',
  decision: '',
  ai_case_outcome: '',
  ai_financial_impact: '',
};

const COURT_LABELS = {
  SC: 'Supreme Court',
  CA: 'Court of Appeal',
  HC: 'High Court',
  H: 'High Court',
  CC: 'Circuit Court',
  DC: 'District Court',
};

const SOURCE_LABELS = {
  reported: 'Reported judgment',
  unreported: 'Unreported decision',
  CV: 'Civil case',
  cv: 'Civil case',
  CR: 'Criminal case',
  cr: 'Criminal case',
};

const formatNumber = (value) => Number(value || 0).toLocaleString();

const formatDate = (value) => {
  if (!value) return 'Date not recorded';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
};

const formatDateTime = (value) => {
  if (!value) return 'Not recorded';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toLocaleString('en-GB', {
    day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
  });
};

const formatInputDate = (value) => value ? String(value).slice(0, 10) : '';
const formatId = (id) => `CP-${String(id).padStart(6, '0')}`;
const displayValue = (value) => value === null || value === undefined || value === '' ? 'Not recorded' : String(value);
const courtLabel = (value) => COURT_LABELS[value] || displayValue(value);
const sourceLabel = (value) => SOURCE_LABELS[value] || displayValue(value);

const humanize = (value) => {
  if (!value) return 'Not recorded';
  return String(value)
    .replaceAll('_', ' ')
    .toLowerCase()
    .replace(/(^|\s)\S/g, (character) => character.toUpperCase());
};

const plainText = (value) => {
  if (!value) return '';
  return String(value)
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/\s+/g, ' ')
    .trim();
};

const readableText = (value, limit = 2200) => {
  const text = plainText(value);
  if (!text) return 'Not recorded';
  return text.length > limit ? `${text.slice(0, limit).trim()}...` : text;
};

const financialLabel = (value) => {
  if (!value) return 'Not assessed';
  return String(value).split(' - ', 1)[0].trim().toUpperCase();
};

const financialClass = (value) => {
  const label = financialLabel(value);
  if (label === 'HIGH') return 'is-error';
  if (label === 'MODERATE') return 'is-warning';
  if (label === 'LOW' || label === 'NONE') return 'is-success';
  return 'is-neutral';
};

const CaseProfileRegisterPage = () => {
  const [records, setRecords] = useState([]);
  const [stats, setStats] = useState(EMPTY_STATS);
  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [draftSearch, setDraftSearch] = useState('');
  const [appliedSearch, setAppliedSearch] = useState('');
  const [courtType, setCourtType] = useState('');
  const [sourceType, setSourceType] = useState('');
  const [year, setYear] = useState('');
  const [financialImpact, setFinancialImpact] = useState('');
  const [hasAi, setHasAi] = useState('');
  const [sort, setSort] = useState('date:desc');
  const [scope, setScope] = useState('all');
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState('');
  const [detailTab, setDetailTab] = useState('overview');
  const [showForm, setShowForm] = useState(false);
  const [formMode, setFormMode] = useState('create');
  const [formRecordId, setFormRecordId] = useState(null);
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [formError, setFormError] = useState('');
  const [formSubmitting, setFormSubmitting] = useState(false);

  const firstRecord = total ? ((page - 1) * PAGE_SIZE) + 1 : 0;
  const lastRecord = Math.min(page * PAGE_SIZE, total);
  const isFiltered = Boolean(
    appliedSearch || courtType || sourceType || year || financialImpact || hasAi || sort !== 'date:desc'
  );

  const courtOptions = useMemo(() => {
    const grouped = new Map();
    Object.entries(stats.courtTypeDistribution || {}).forEach(([value, count]) => {
      const key = ['H', 'HC'].includes(value.toUpperCase()) ? 'HC,H' : value;
      grouped.set(key, (grouped.get(key) || 0) + count);
    });
    return [...grouped.entries()].sort(([, a], [, b]) => b - a);
  }, [stats.courtTypeDistribution]);
  const sourceOptions = useMemo(() => {
    const grouped = new Map();
    Object.entries(stats.sourceTypeDistribution || {}).forEach(([value, count]) => {
      if (value === '-- Select --') return;
      const normalized = value.toLowerCase();
      const key = normalized === 'cv' || normalized === 'cr' ? normalized : value;
      grouped.set(key, (grouped.get(key) || 0) + count);
    });
    return [...grouped.entries()].sort(([, a], [, b]) => b - a);
  }, [stats.sourceTypeDistribution]);
  const yearOptions = useMemo(
    () => Object.entries(stats.yearDistribution || {}).sort(([a], [b]) => Number(b) - Number(a)),
    [stats.yearDistribution]
  );

  const loadStats = useCallback(async () => {
    setStatsLoading(true);
    try {
      const response = await apiGet('/admin/cases/stats');
      setStats({ ...EMPTY_STATS, ...response });
    } catch (requestError) {
      console.error('Unable to load case profile statistics:', requestError);
    } finally {
      setStatsLoading(false);
    }
  }, []);

  const loadRecords = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [sortBy, sortOrder] = sort.split(':');
      const params = new URLSearchParams({
        page: String(page),
        limit: String(PAGE_SIZE),
        sort_by: sortBy,
        sort_order: sortOrder,
      });
      if (appliedSearch) params.set('search', appliedSearch);
      if (courtType) params.set('court_type', courtType);
      if (sourceType) params.set('case_type', sourceType);
      if (year) params.set('year', year);
      if (financialImpact) params.set('financial_impact', financialImpact);
      if (hasAi) params.set('has_ai', hasAi);

      const response = await apiGet(`/admin/cases?${params.toString()}`);
      setRecords(response.cases || []);
      setTotal(response.total || 0);
      setTotalPages(Math.max(1, response.total_pages || 1));
    } catch (requestError) {
      console.error('Unable to load case profiles:', requestError);
      setRecords([]);
      setTotal(0);
      setTotalPages(1);
      setError(requestError.detail || requestError.message || 'The case profile register could not be loaded.');
    } finally {
      setLoading(false);
    }
  }, [appliedSearch, courtType, financialImpact, hasAi, page, sort, sourceType, year]);

  useEffect(() => { loadStats(); }, [loadStats]);
  useEffect(() => { loadRecords(); }, [loadRecords]);

  const refresh = () => {
    loadStats();
    loadRecords();
  };

  const submitSearch = (event) => {
    event.preventDefault();
    setPage(1);
    setAppliedSearch(draftSearch.trim());
  };

  const resetFilters = () => {
    setDraftSearch('');
    setAppliedSearch('');
    setCourtType('');
    setSourceType('');
    setYear('');
    setFinancialImpact('');
    setHasAi('');
    setSort('date:desc');
    setScope('all');
    setPage(1);
  };

  const applyScope = (nextScope) => {
    setScope(nextScope);
    setDraftSearch('');
    setAppliedSearch('');
    setCourtType('');
    setYear('');
    setSort('date:desc');
    setSourceType(nextScope === 'reported' ? 'reported' : '');
    setHasAi(nextScope === 'ai' ? 'true' : '');
    setFinancialImpact(nextScope === 'high-risk' ? 'HIGH' : '');
    setPage(1);
  };

  const markCustomFilter = (setter) => (event) => {
    setter(event.target.value);
    setScope('custom');
    setPage(1);
  };

  const openDetail = async (record) => {
    setSelectedRecord(record);
    setDetailLoading(true);
    setDetailError('');
    setDetailTab('overview');
    try {
      const detail = await apiGet(`/admin/cases/${record.id}`);
      setSelectedRecord(detail);
    } catch (requestError) {
      setDetailError(requestError.detail || requestError.message || 'Full profile details are unavailable.');
    } finally {
      setDetailLoading(false);
    }
  };

  const recordToForm = (record) => ({
    ...EMPTY_FORM,
    ...Object.fromEntries(Object.keys(EMPTY_FORM).map((key) => [key, record?.[key] ?? ''])),
    date: formatInputDate(record?.date),
    year: record?.year ? String(record.year) : '',
    ai_financial_impact: record?.ai_financial_impact ? financialLabel(record.ai_financial_impact) : '',
  });

  const openForm = async (mode, record = null) => {
    setFormMode(mode);
    setFormRecordId(record?.id || null);
    setFormError('');
    if (mode === 'create') {
      setFormData(EMPTY_FORM);
      setShowForm(true);
      return;
    }

    setFormData(recordToForm(record));
    setShowForm(true);
    try {
      const detail = await apiGet(`/admin/cases/${record.id}`);
      setFormData(recordToForm(detail));
    } catch (requestError) {
      setFormError(requestError.detail || requestError.message || 'Some profile fields could not be loaded.');
    }
  };

  const closeForm = () => {
    if (formSubmitting) return;
    setShowForm(false);
    setFormRecordId(null);
    setFormError('');
  };

  const updateForm = (name, value) => {
    setFormData((current) => ({ ...current, [name]: value }));
  };

  const saveRecord = async (event) => {
    event.preventDefault();
    if (!formData.title.trim()) {
      setFormError('Case title is required.');
      return;
    }

    setFormSubmitting(true);
    setFormError('');
    const payload = {
      ...formData,
      title: formData.title.trim(),
      date: formData.date ? new Date(`${formData.date}T00:00:00`).toISOString() : null,
      year: formData.year ? Number(formData.year) : (formData.date ? Number(formData.date.slice(0, 4)) : null),
      ai_financial_impact: formData.ai_financial_impact || null,
    };

    Object.keys(payload).forEach((key) => {
      if (payload[key] === '') payload[key] = null;
    });

    try {
      if (formMode === 'create') {
        await apiPost('/admin/cases', payload);
      } else {
        await apiPut(`/admin/cases/${formRecordId}`, payload);
      }
      setShowForm(false);
      setFormRecordId(null);
      setSelectedRecord(null);
      await Promise.all([loadRecords(), loadStats()]);
    } catch (requestError) {
      setFormError(requestError.detail || requestError.message || 'The case profile could not be saved.');
    } finally {
      setFormSubmitting(false);
    }
  };

  const renderActions = (record) => (
    <td>
      <div className="dd-case-profile-row-actions">
        <button type="button" className="dd-icon-button" onClick={() => openDetail(record)} aria-label={`Open ${record.title}`} title="Open profile"><Eye size={14} /></button>
        <button type="button" className="dd-icon-button" onClick={() => openForm('edit', record)} aria-label={`Edit ${record.title}`} title="Edit profile"><Edit3 size={14} /></button>
      </div>
    </td>
  );

  return (
    <section className="dd-module-shell dd-case-profile-register">
      <div className="dd-module-heading">
        <div>
          <p className="dd-eyebrow">Court intelligence</p>
          <h2>Case profile register</h2>
          <p>Review decided and filed matters with legal metadata, source coverage and risk analysis.</p>
        </div>
        <div className="dd-heading-actions">
          <span className="dd-count-badge"><FileText size={14} /> {formatNumber(stats.totalCases)} profiles</span>
          <button type="button" className="dd-button dd-button-primary" onClick={() => openForm('create')}><Plus size={14} /> Add case profile</button>
        </div>
      </div>

      <section className="dd-case-profile-summary" aria-label="Case profile summary">
        <button type="button" className={scope === 'all' ? 'is-active' : ''} onClick={() => applyScope('all')}>
          <FileText size={17} /><span>Total profiles</span><strong>{statsLoading ? '...' : formatNumber(stats.totalCases)}</strong><small>Across the register</small>
        </button>
        <button type="button" className={scope === 'reported' ? 'is-active' : ''} onClick={() => applyScope('reported')}>
          <FileCheck2 size={17} /><span>Reported judgments</span><strong>{statsLoading ? '...' : formatNumber(stats.reportedCases)}</strong><small>Published law reports</small>
        </button>
        <button type="button" className={scope === 'ai' ? 'is-active' : ''} onClick={() => applyScope('ai')}>
          <BrainCircuit size={17} /><span>AI assessed</span><strong>{statsLoading ? '...' : formatNumber(stats.aiAssessedCases)}</strong><small>Outcome and risk coverage</small>
        </button>
        <button type="button" className={scope === 'high-risk' ? 'is-active' : ''} onClick={() => applyScope('high-risk')}>
          <CircleDollarSign size={17} /><span>High financial impact</span><strong>{statsLoading ? '...' : formatNumber(stats.highFinancialImpactCases)}</strong><small>Enhanced review required</small>
        </button>
      </section>

      <section className="dd-enquiry-panel">
        <header>Find a case profile</header>
        <form className="dd-case-profile-filter-form" onSubmit={submitSearch}>
          <label className="dd-case-profile-search-field">
            <span>Title, suit number, party, judge or citation</span>
            <span className="dd-input-with-icon"><Search size={14} /><input value={draftSearch} onChange={(event) => setDraftSearch(event.target.value)} placeholder="Search the case register" /></span>
          </label>
          <label><span>Court</span><select className="dd-select-control" value={courtType} onChange={markCustomFilter(setCourtType)}><option value="">All courts</option>{courtOptions.map(([value, count]) => <option key={value} value={value}>{value === 'HC,H' ? 'High Court' : courtLabel(value)} ({formatNumber(count)})</option>)}</select></label>
          <label><span>Source</span><select className="dd-select-control" value={sourceType} onChange={markCustomFilter(setSourceType)}><option value="">All sources</option>{sourceOptions.map(([value, count]) => <option key={value} value={value}>{sourceLabel(value)} ({formatNumber(count)})</option>)}</select></label>
          <label><span>Year</span><select className="dd-select-control" value={year} onChange={markCustomFilter(setYear)}><option value="">All years</option>{yearOptions.map(([value, count]) => <option key={value} value={value}>{value} ({formatNumber(count)})</option>)}</select></label>
          <label><span>Financial impact</span><select className="dd-select-control" value={financialImpact} onChange={markCustomFilter(setFinancialImpact)}><option value="">All assessments</option>{['HIGH', 'MODERATE', 'LOW', 'NONE', 'UNRESOLVED'].map((value) => <option key={value} value={value}>{humanize(value)} ({formatNumber(stats.financialImpactDistribution?.[value])})</option>)}</select></label>
          <label><span>Sort</span><select className="dd-select-control" value={sort} onChange={(event) => { setSort(event.target.value); setPage(1); }}><option value="date:desc">Newest decision</option><option value="date:asc">Oldest decision</option><option value="title:asc">Title A-Z</option><option value="title:desc">Title Z-A</option><option value="updated_at:desc">Recently updated</option></select></label>
          <div className="dd-case-profile-filter-actions">
            <button type="submit" className="dd-button dd-button-primary"><Search size={14} /> Search</button>
            <button type="button" className="dd-button dd-button-secondary" onClick={resetFilters} disabled={!isFiltered && !draftSearch}><X size={14} /> Clear</button>
          </div>
        </form>
      </section>

      <div className="dd-register-note dd-case-profile-register-note"><ShieldCheck size={15} /><span>Searching and opening profiles is read-only. Records change only after Save profile, and this page provides no deletion action.</span></div>

      {error && <div className="dd-inline-alert is-error"><span>{error}</span><button type="button" onClick={refresh}><RefreshCw size={13} /> Retry</button></div>}

      <section className="dd-enquiry-results">
        <header>
          <h2>Case profiles <span>{formatNumber(total)}</span></h2>
          <div className="dd-case-profile-results-tools">
            <span>Records {firstRecord}-{lastRecord} of {formatNumber(total)}</span>
            <button type="button" disabled={loading || page <= 1} onClick={() => setPage((current) => Math.max(1, current - 1))}><ChevronLeft size={14} /> Prev</button>
            <button type="button" disabled={loading || page >= totalPages} onClick={() => setPage((current) => Math.min(totalPages, current + 1))}>Next <ChevronRight size={14} /></button>
          </div>
        </header>

        {loading ? (
          <div className="dd-loading-state"><Loader2 size={22} className="dd-spin" /> Loading case profiles</div>
        ) : !records.length ? (
          <div className="dd-empty-state"><FileText size={28} /><div><strong>No case profiles found</strong><p>Change the filters or clear the search to review the full register.</p></div></div>
        ) : (
          <div className="dd-table-wrap dd-case-profile-table">
            <table className="dd-data-table">
              <thead><tr><th>Case profile</th><th>Court / date</th><th>Judge</th><th>Classification</th><th>Risk / outcome</th><th aria-label="Actions" /></tr></thead>
              <tbody>{records.map((record) => (
                <tr key={record.id}>
                  <td><button type="button" className="dd-company-record-link" onClick={() => openDetail(record)}><strong>{record.title || 'Untitled case'}</strong></button><small><span className="dd-mono">{record.suit_reference_number || record.dl_citation_no || formatId(record.id)}</span></small></td>
                  <td><strong>{courtLabel(record.court_type)}</strong><small><CalendarDays size={11} /> {formatDate(record.date)}</small></td>
                  <td><strong>{record.presiding_judge || 'Judge not recorded'}</strong><small>{[record.town, record.region].filter(Boolean).join(', ') || 'Location not recorded'}</small></td>
                  <td><strong>{record.area_of_law && record.area_of_law !== '-' ? record.area_of_law : 'Not classified'}</strong><small>{sourceLabel(record.type)}</small></td>
                  <td><span className={`dd-status-pill ${financialClass(record.ai_financial_impact)}`}>{financialLabel(record.ai_financial_impact)}</span><small>{record.ai_case_outcome ? humanize(record.ai_case_outcome) : 'Outcome not assessed'}</small></td>
                  {renderActions(record)}
                </tr>
              ))}</tbody>
            </table>
          </div>
        )}
      </section>

      {selectedRecord && !showForm && (
        <div className="dd-modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setSelectedRecord(null); }}>
          <div className="dd-modal dd-case-profile-detail-modal" role="dialog" aria-modal="true" aria-labelledby="case-profile-title">
            <header><div><h3 id="case-profile-title">{selectedRecord.title || 'Untitled case'}</h3><p>{selectedRecord.suit_reference_number || selectedRecord.dl_citation_no || formatId(selectedRecord.id)}</p></div><button type="button" onClick={() => setSelectedRecord(null)} aria-label="Close"><X size={17} /></button></header>
            <div className="dd-modal-body">
              {detailError && <div className="dd-inline-alert is-error">{detailError}</div>}
              <section className="dd-case-profile-facts">
                <div><Landmark size={15} /><span>Court</span><strong>{courtLabel(selectedRecord.court_type)}</strong></div>
                <div><CalendarDays size={15} /><span>Decision date</span><strong>{formatDate(selectedRecord.date)}</strong></div>
                <div><Gavel size={15} /><span>Area of law</span><strong>{selectedRecord.area_of_law && selectedRecord.area_of_law !== '-' ? selectedRecord.area_of_law : 'Not classified'}</strong></div>
                <div><CircleDollarSign size={15} /><span>Financial impact</span><strong>{financialLabel(selectedRecord.ai_financial_impact)}</strong></div>
              </section>

              <nav className="dd-case-profile-tabs" aria-label="Case profile sections">
                {[
                  ['overview', 'Overview'],
                  ['legal', 'Legal record'],
                  ['analysis', 'Risk analysis'],
                  ['source', 'Source & metadata'],
                ].map(([id, label]) => <button key={id} type="button" className={detailTab === id ? 'is-active' : ''} onClick={() => setDetailTab(id)}>{label}</button>)}
              </nav>

              {detailLoading ? <div className="dd-loading-state"><Loader2 size={20} className="dd-spin" /> Loading full profile</div> : (
                <div className="dd-case-profile-detail-content">
                  {detailTab === 'overview' && <>
                    <section><h4>Summary of case</h4><p>{readableText(selectedRecord.case_summary || selectedRecord.headnotes || selectedRecord.commentary)}</p></section>
                    <section><h4>Decision, ruling & conclusion</h4><p>{readableText(selectedRecord.decision || selectedRecord.conclusion || selectedRecord.judgement)}</p></section>
                    <section><h4>Parties</h4><dl><div><dt>Protagonist</dt><dd>{displayValue(selectedRecord.protagonist)}</dd></div><div><dt>Antagonist</dt><dd>{displayValue(selectedRecord.antagonist)}</dd></div></dl></section>
                  </>}
                  {detailTab === 'legal' && <>
                    <section><h4>Judge or panel</h4><p>{displayValue(selectedRecord.presiding_judge || selectedRecord.judgement_by)}</p></section>
                    <section><h4>Lawyers</h4><p>{readableText(selectedRecord.lawyers, 1400)}</p></section>
                    <section><h4>Statutes cited</h4><p>{readableText(selectedRecord.statutes_cited, 1400)}</p></section>
                    <section><h4>Cases cited</h4><p>{readableText(selectedRecord.cases_cited, 1400)}</p></section>
                  </>}
                  {detailTab === 'analysis' && <>
                    <section className="dd-case-profile-analysis-band"><div><span>Outcome</span><strong>{humanize(selectedRecord.ai_case_outcome)}</strong></div><div><span>Financial impact</span><strong>{financialLabel(selectedRecord.ai_financial_impact)}</strong></div><div><span>Analysis version</span><strong>{displayValue(selectedRecord.ai_summary_version)}</strong></div></section>
                    <section><h4>Court orders</h4><p>{readableText(selectedRecord.ai_court_orders, 1400)}</p></section>
                    <section><h4>Risk & financial analysis</h4><p>{readableText(selectedRecord.ai_detailed_outcome || selectedRecord.ai_financial_impact)}</p></section>
                  </>}
                  {detailTab === 'source' && <dl className="dd-person-detail-list">
                    {[
                      ['Profile ID', formatId(selectedRecord.id)],
                      ['Suit reference', selectedRecord.suit_reference_number],
                      ['Citation', selectedRecord.citation || selectedRecord.dl_citation_no],
                      ['Source type', sourceLabel(selectedRecord.type)],
                      ['Court division', selectedRecord.court_division],
                      ['Town / region', [selectedRecord.town, selectedRecord.region].filter(Boolean).join(', ')],
                      ['Source file', selectedRecord.file_name || selectedRecord.file_url],
                      ['Published', selectedRecord.published === true ? 'Yes' : selectedRecord.published === false ? 'No' : 'Not recorded'],
                      ['Created by', selectedRecord.created_by],
                      ['Created', formatDateTime(selectedRecord.created_at)],
                      ['Last updated', formatDateTime(selectedRecord.updated_at)],
                      ['AI assessed', formatDateTime(selectedRecord.ai_summary_generated_at)],
                    ].map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{displayValue(value)}</dd></div>)}
                  </dl>}
                </div>
              )}

              <div className="dd-modal-actions"><button type="button" className="dd-button dd-button-secondary" onClick={() => setSelectedRecord(null)}>Close</button><button type="button" className="dd-button dd-button-primary" onClick={() => openForm('edit', selectedRecord)}><Edit3 size={14} /> Edit profile</button></div>
            </div>
          </div>
        </div>
      )}

      {showForm && (
        <div className="dd-modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) closeForm(); }}>
          <div className="dd-modal dd-company-record-form dd-case-profile-form" role="dialog" aria-modal="true" aria-labelledby="case-profile-form-title">
            <header><div><h3 id="case-profile-form-title">{formMode === 'create' ? 'Add case profile' : 'Edit case profile'}</h3><p>Maintain the profile record without removing its source history.</p></div><button type="button" onClick={closeForm} aria-label="Close"><X size={17} /></button></header>
            <form className="dd-modal-body" onSubmit={saveRecord}>
              {formError && <div className="dd-inline-alert is-error">{formError}</div>}
              <div className="dd-company-record-form-grid">
                <label className="is-wide"><span>Case title *</span><textarea rows="2" required value={formData.title} onChange={(event) => updateForm('title', event.target.value)} /></label>
                <label><span>Suit reference</span><input value={formData.suit_reference_number} onChange={(event) => updateForm('suit_reference_number', event.target.value)} /></label>
                <label><span>Decision date</span><input type="date" value={formData.date} onChange={(event) => { updateForm('date', event.target.value); if (event.target.value) updateForm('year', event.target.value.slice(0, 4)); }} /></label>
                <label><span>Year</span><input type="number" min="1800" max="2100" value={formData.year} onChange={(event) => updateForm('year', event.target.value)} /></label>
                <label><span>Court</span><select className="dd-select-control" value={formData.court_type} onChange={(event) => updateForm('court_type', event.target.value)}><option value="">Select court</option><option value="SC">Supreme Court</option><option value="CA">Court of Appeal</option><option value="HC">High Court</option><option value="H">High Court (legacy)</option><option value="CC">Circuit Court</option><option value="DC">District Court</option></select></label>
                <label><span>Court division</span><input value={formData.court_division} onChange={(event) => updateForm('court_division', event.target.value)} /></label>
                <label><span>Town</span><input value={formData.town} onChange={(event) => updateForm('town', event.target.value)} /></label>
                <label><span>Region</span><input value={formData.region} onChange={(event) => updateForm('region', event.target.value)} /></label>
                <label className="is-wide"><span>Judge or panel</span><textarea rows="2" value={formData.presiding_judge} onChange={(event) => updateForm('presiding_judge', event.target.value)} /></label>
                <label><span>Source type</span><select className="dd-select-control" value={formData.type} onChange={(event) => updateForm('type', event.target.value)}><option value="">Select source</option><option value="reported">Reported judgment</option><option value="unreported">Unreported decision</option><option value="CV">Civil case</option><option value="CR">Criminal case</option></select></label>
                <label><span>Area of law</span><input value={formData.area_of_law} onChange={(event) => updateForm('area_of_law', event.target.value)} /></label>
                <label><span>Status</span><select className="dd-select-control" value={formData.status} onChange={(event) => updateForm('status', event.target.value)}><option value="">Not recorded</option><option value="active">Active</option><option value="pending">Pending</option><option value="closed">Closed</option><option value="dismissed">Dismissed</option></select></label>
                <label><span>Citation</span><input value={formData.citation} onChange={(event) => updateForm('citation', event.target.value)} /></label>
                <label><span>DL citation</span><input value={formData.dl_citation_no} onChange={(event) => updateForm('dl_citation_no', event.target.value)} /></label>
                <label><span>AI outcome</span><select className="dd-select-control" value={formData.ai_case_outcome} onChange={(event) => updateForm('ai_case_outcome', event.target.value)}><option value="">Not assessed</option><option value="WON">Won</option><option value="LOST">Lost</option><option value="PARTIALLY_WON">Partially won</option><option value="PARTIALLY_LOST">Partially lost</option><option value="UNRESOLVED">Unresolved</option></select></label>
                <label><span>Financial impact</span><select className="dd-select-control" value={formData.ai_financial_impact} onChange={(event) => updateForm('ai_financial_impact', event.target.value)}><option value="">Not assessed</option><option value="HIGH">High</option><option value="MODERATE">Moderate</option><option value="LOW">Low</option><option value="NONE">None</option><option value="UNRESOLVED">Unresolved</option></select></label>
                <label className="is-wide"><span>Summary of case</span><textarea rows="4" value={formData.case_summary} onChange={(event) => updateForm('case_summary', event.target.value)} /></label>
                <label className="is-wide"><span>Decision, ruling & conclusion</span><textarea rows="4" value={formData.decision} onChange={(event) => updateForm('decision', event.target.value)} /></label>
              </div>
              <div className="dd-modal-actions"><button type="button" className="dd-button dd-button-secondary" onClick={closeForm} disabled={formSubmitting}>Cancel</button><button type="submit" className="dd-button dd-button-primary" disabled={formSubmitting}>{formSubmitting ? <Loader2 size={14} className="dd-spin" /> : <FileCheck2 size={14} />} Save profile</button></div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
};

export default CaseProfileRegisterPage;
