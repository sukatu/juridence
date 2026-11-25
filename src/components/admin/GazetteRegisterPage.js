import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  BookOpenCheck,
  Building2,
  CalendarDays,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  Database,
  Edit3,
  Eye,
  FileCheck2,
  FileText,
  Hash,
  Loader2,
  Plus,
  RefreshCw,
  Search,
  ShieldCheck,
  Upload,
  UserRound,
  X,
} from 'lucide-react';
import { apiGet, apiPost, apiPut } from '../../utils/api';

const PAGE_SIZE = 25;

const EMPTY_GAZETTE_STATS = {
  total_gazettes: 0,
  published_gazettes: 0,
  draft_gazettes: 0,
  archived_gazettes: 0,
  gazettes_by_type: {},
  gazettes_by_priority: {},
  gazettes_by_jurisdiction: {},
  recent_gazettes: 0,
  featured_gazettes: 0,
};

const EMPTY_LIFECYCLE_STATS = {
  bulletin_sources: 0,
  lifecycle_notices: 0,
  notices_by_type: {},
  review_status: {},
};

const EMPTY_FORM = {
  title: '',
  gazette_type: 'CHANGE_OF_NAME',
  status: 'PUBLISHED',
  priority: 'MEDIUM',
  current_name: '',
  old_name: '',
  alias_names: '',
  profession: '',
  address: '',
  publication_date: '',
  gazette_date: '',
  effective_date_of_change: '',
  source: '',
  gazette_number: '',
  gazette_page: '',
  item_number: '',
  reference_number: '',
  jurisdiction: 'Ghana',
  summary: '',
  content: '',
  remarks: '',
  is_public: true,
  is_featured: false,
};

const GAZETTE_TYPE_LABELS = {
  CHANGE_OF_NAME: 'Change of name',
  CHANGE_OF_DATE_OF_BIRTH: 'Correction of date of birth',
  CHANGE_OF_PLACE_OF_BIRTH: 'Correction of place of birth',
  APPOINTMENT_OF_MARRIAGE_OFFICERS: 'Marriage officer appointment',
  COMPANY_WINDING_UP: 'Company winding up',
  COMPANY_DISSOLUTION: 'Company dissolution',
  COMPANY_STRIKE_OFF_INTENTION: 'Intention to strike off',
  EXTERNAL_COMPANY_CESSATION: 'External company cessation',
  LEGAL_NOTICE: 'Legal notice',
  BUSINESS_NOTICE: 'Business notice',
  PROPERTY_NOTICE: 'Property notice',
  PERSONAL_NOTICE: 'Personal notice',
  REGULATORY_NOTICE: 'Regulatory notice',
  COURT_NOTICE: 'Court notice',
  BANKRUPTCY_NOTICE: 'Bankruptcy notice',
  PROBATE_NOTICE: 'Probate notice',
  OTHER: 'Other notice',
};

const LIFECYCLE_TYPE_LABELS = {
  COMPANY_CESSATION_OF_BUSINESS: 'Cessation of business',
  COMPANY_CHANGE_OF_NAME: 'Change of company name',
  COMPANY_DISSOLUTION: 'Dissolution',
  COMPANY_INCORPORATION: 'Incorporation',
  COMPANY_LIQUIDATION: 'Liquidation',
  COMPANY_STRIKE_OFF_INTENTION: 'Intention to strike off',
  COMPANY_WINDING_UP: 'Winding up',
};

const formatNumber = (value) => Number(value || 0).toLocaleString();

const formatDate = (value) => {
  if (!value) return 'Not recorded';
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
const displayValue = (value) => value === null || value === undefined || value === '' ? 'Not recorded' : String(value);

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

const readableText = (value, limit = 2600) => {
  const text = plainText(value);
  if (!text) return 'Not recorded';
  return text.length > limit ? `${text.slice(0, limit).trim()}...` : text;
};

const sourceName = (value) => {
  if (typeof value === 'string') return value;
  return value?.publication_title || value?.source_authority || '';
};

const formatFileSize = (value) => {
  const bytes = Number(value || 0);
  if (!bytes) return 'Not recorded';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const gazetteId = (id) => `GZ-${String(id).padStart(6, '0')}`;
const lifecycleId = (id) => `CL-${String(id).padStart(6, '0')}`;
const sourceId = (id) => `SRC-${String(id).padStart(4, '0')}`;

const noticeLabel = (value) => GAZETTE_TYPE_LABELS[value] || LIFECYCLE_TYPE_LABELS[value] || humanize(value);

const statusClass = (value) => {
  const status = String(value || '').toUpperCase();
  if (['PUBLISHED', 'IMPORTED', 'VERIFIED'].includes(status)) return 'is-success';
  if (['DRAFT', 'NEEDS_REVIEW', 'HIGH'].includes(status)) return 'is-warning';
  if (['CANCELLED', 'REJECTED', 'URGENT'].includes(status)) return 'is-error';
  return 'is-neutral';
};

const confidenceClass = (value) => {
  const confidence = Number(value || 0);
  if (confidence >= 0.9) return 'is-success';
  if (confidence >= 0.65) return 'is-info';
  return 'is-warning';
};

const lifecycleDate = (record) => (
  record.event_date
  || record.effective_date
  || record.dissolution_date
  || record.strike_off_date
  || record.winding_up_date
  || record.liquidation_date
  || record.cessation_date
  || record.incorporation_date
  || record.publication_date
);

const isoDate = (value) => value ? new Date(`${value}T00:00:00`).toISOString() : null;

const GazetteRegisterPage = ({ onNavigate }) => {
  const [gazetteStats, setGazetteStats] = useState(EMPTY_GAZETTE_STATS);
  const [lifecycleStats, setLifecycleStats] = useState(EMPTY_LIFECYCLE_STATS);
  const [sources, setSources] = useState([]);
  const [records, setRecords] = useState([]);
  const [activeDataset, setActiveDataset] = useState('gazette');
  const [scope, setScope] = useState('gazette');
  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);
  const [sourcesLoading, setSourcesLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [draftSearch, setDraftSearch] = useState('');
  const [appliedSearch, setAppliedSearch] = useState('');
  const [noticeType, setNoticeType] = useState('');
  const [status, setStatus] = useState('');
  const [reviewStatus, setReviewStatus] = useState('');
  const [confidence, setConfidence] = useState('0');
  const [sourceStatus, setSourceStatus] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [sort, setSort] = useState('publication_date:desc');
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
  const recordsRequestRef = useRef(0);

  const totalRegisterRecords = Number(gazetteStats.total_gazettes || 0) + Number(lifecycleStats.lifecycle_notices || 0);
  const reviewCount = Number(lifecycleStats.review_status?.NEEDS_REVIEW || 0);

  const sourceRows = useMemo(() => {
    const term = appliedSearch.toLowerCase();
    return sources.filter((source) => {
      const matchesSearch = !term || [
        source.publication_title,
        source.source_authority,
        source.volume_number,
        source.source_filename,
        source.jurisdiction,
      ].some((value) => String(value || '').toLowerCase().includes(term));
      const matchesStatus = !sourceStatus || source.import_status === sourceStatus;
      return matchesSearch && matchesStatus;
    });
  }, [appliedSearch, sourceStatus, sources]);

  const sourceTotalPages = Math.max(1, Math.ceil(sourceRows.length / PAGE_SIZE));
  const pagedSourceRows = useMemo(
    () => sourceRows.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE),
    [page, sourceRows]
  );

  const displayRecords = activeDataset === 'sources' ? pagedSourceRows : records;
  const displayTotal = activeDataset === 'sources' ? sourceRows.length : total;
  const displayTotalPages = activeDataset === 'sources' ? sourceTotalPages : totalPages;
  const isLoading = activeDataset === 'sources' ? sourcesLoading : loading;
  const firstRecord = displayTotal ? ((page - 1) * PAGE_SIZE) + 1 : 0;
  const lastRecord = Math.min(page * PAGE_SIZE, displayTotal);

  const gazetteTypeOptions = useMemo(
    () => Object.entries(gazetteStats.gazettes_by_type || {})
      .filter(([, count]) => Number(count) > 0)
      .sort(([, left], [, right]) => right - left),
    [gazetteStats.gazettes_by_type]
  );

  const lifecycleTypeOptions = useMemo(
    () => Object.entries(lifecycleStats.notices_by_type || {})
      .sort(([, left], [, right]) => right - left),
    [lifecycleStats.notices_by_type]
  );

  const sourceStatuses = useMemo(
    () => [...new Set(sources.map((source) => source.import_status).filter(Boolean))].sort(),
    [sources]
  );

  const isFiltered = Boolean(
    appliedSearch
    || noticeType
    || status
    || reviewStatus
    || sourceStatus
    || dateFrom
    || dateTo
    || confidence !== '0'
    || sort !== 'publication_date:desc'
  );

  const loadStats = useCallback(async () => {
    setStatsLoading(true);
    try {
      const [gazetteResponse, lifecycleResponse] = await Promise.all([
        apiGet('/gazette/stats/overview'),
        apiGet('/company-lifecycle/stats'),
      ]);
      setGazetteStats({ ...EMPTY_GAZETTE_STATS, ...gazetteResponse });
      setLifecycleStats({ ...EMPTY_LIFECYCLE_STATS, ...lifecycleResponse });
    } catch (requestError) {
      console.error('Unable to load Gazette statistics:', requestError);
    } finally {
      setStatsLoading(false);
    }
  }, []);

  const loadSources = useCallback(async () => {
    setSourcesLoading(true);
    try {
      const response = await apiGet('/company-lifecycle/sources');
      setSources(Array.isArray(response) ? response : []);
    } catch (requestError) {
      console.error('Unable to load company bulletin sources:', requestError);
      setSources([]);
    } finally {
      setSourcesLoading(false);
    }
  }, []);

  const loadRecords = useCallback(async () => {
    const requestId = recordsRequestRef.current + 1;
    recordsRequestRef.current = requestId;

    if (activeDataset === 'sources') {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError('');
    try {
      if (activeDataset === 'gazette') {
        const [sortBy, sortOrder] = sort.split(':');
        const response = await apiGet('/gazette/', {
          page,
          limit: PAGE_SIZE,
          search: appliedSearch,
          gazette_type: noticeType,
          status,
          date_from: dateFrom ? `${dateFrom}T00:00:00` : '',
          date_to: dateTo ? `${dateTo}T23:59:59` : '',
          sort_by: sortBy,
          sort_order: sortOrder,
        });
        if (requestId !== recordsRequestRef.current) return;
        setRecords(response.gazettes || []);
        setTotal(response.total || 0);
        setTotalPages(Math.max(1, response.total_pages || 1));
      } else {
        const response = await apiGet('/company-lifecycle/notices', {
          page,
          limit: PAGE_SIZE,
          q: appliedSearch,
          notice_type: noticeType,
          review_status: reviewStatus,
          min_confidence: confidence,
        });
        if (requestId !== recordsRequestRef.current) return;
        setRecords(response.notices || []);
        setTotal(response.total || 0);
        setTotalPages(Math.max(1, response.total_pages || 1));
      }
    } catch (requestError) {
      if (requestId !== recordsRequestRef.current) return;
      console.error('Unable to load Gazette register:', requestError);
      setRecords([]);
      setTotal(0);
      setTotalPages(1);
      setError(requestError.detail || requestError.message || 'The Gazette register could not be loaded.');
    } finally {
      if (requestId === recordsRequestRef.current) setLoading(false);
    }
  }, [activeDataset, appliedSearch, confidence, dateFrom, dateTo, noticeType, page, reviewStatus, sort, status]);

  useEffect(() => { loadStats(); }, [loadStats]);
  useEffect(() => { loadSources(); }, [loadSources]);
  useEffect(() => { loadRecords(); }, [loadRecords]);

  const clearFilters = (dataset = activeDataset) => {
    setDraftSearch('');
    setAppliedSearch('');
    setNoticeType('');
    setStatus('');
    setReviewStatus('');
    setSourceStatus('');
    setDateFrom('');
    setDateTo('');
    setConfidence('0');
    setSort('publication_date:desc');
    setPage(1);
    setScope(dataset);
  };

  const changeDataset = (dataset) => {
    setRecords([]);
    setTotal(0);
    setTotalPages(1);
    if (dataset !== 'sources') setLoading(true);
    setActiveDataset(dataset);
    clearFilters(dataset);
  };

  const applyScope = (nextScope) => {
    if (nextScope === 'review') {
      setActiveDataset('lifecycle');
      clearFilters('review');
      setReviewStatus('NEEDS_REVIEW');
      return;
    }
    changeDataset(nextScope);
  };

  const submitSearch = (event) => {
    event.preventDefault();
    setPage(1);
    setAppliedSearch(draftSearch.trim());
    setScope('custom');
  };

  const refresh = () => {
    loadStats();
    loadSources();
    loadRecords();
  };

  const openDetail = async (record, kind) => {
    setSelectedRecord({ ...record, _kind: kind });
    setDetailTab('overview');
    setDetailError('');
    if (kind !== 'gazette') return;

    setDetailLoading(true);
    try {
      const response = await apiGet(`/gazette/${record.id}`);
      setSelectedRecord({ ...response, _kind: 'gazette' });
    } catch (requestError) {
      setDetailError(requestError.detail || requestError.message || 'Full notice details are unavailable.');
    } finally {
      setDetailLoading(false);
    }
  };

  const noticeToForm = (record) => ({
    ...EMPTY_FORM,
    title: record?.title || '',
    gazette_type: record?.gazette_type || 'CHANGE_OF_NAME',
    status: record?.status || 'PUBLISHED',
    priority: record?.priority || 'MEDIUM',
    current_name: record?.current_name || record?.new_name || record?.name_value || '',
    old_name: record?.old_name || '',
    alias_names: Array.isArray(record?.alias_names) ? record.alias_names.join(', ') : '',
    profession: record?.profession || '',
    address: record?.address || '',
    publication_date: formatInputDate(record?.publication_date),
    gazette_date: formatInputDate(record?.gazette_date),
    effective_date_of_change: formatInputDate(record?.effective_date_of_change || record?.effective_date),
    source: sourceName(record?.source),
    gazette_number: record?.gazette_number || '',
    gazette_page: record?.gazette_page || record?.page_number || '',
    item_number: record?.item_number || '',
    reference_number: record?.reference_number || '',
    jurisdiction: record?.jurisdiction || 'Ghana',
    summary: record?.summary || '',
    content: plainText(record?.content || record?.description || ''),
    remarks: record?.remarks || '',
    is_public: record?.is_public !== false,
    is_featured: Boolean(record?.is_featured),
  });

  const openForm = async (mode, record = null) => {
    setFormMode(mode);
    setFormRecordId(record?.id || null);
    setFormError('');
    if (mode === 'create') {
      setFormData({ ...EMPTY_FORM, publication_date: new Date().toISOString().slice(0, 10) });
      setShowForm(true);
      return;
    }

    setFormData(noticeToForm(record));
    setShowForm(true);
    try {
      const response = await apiGet(`/gazette/${record.id}`);
      setFormData(noticeToForm(response));
    } catch (requestError) {
      setFormError(requestError.detail || requestError.message || 'Some notice fields could not be loaded.');
    }
  };

  const closeForm = () => {
    if (formSubmitting) return;
    setShowForm(false);
    setFormRecordId(null);
    setFormError('');
  };

  const updateForm = (name, value) => setFormData((current) => ({ ...current, [name]: value }));

  const saveNotice = async (event) => {
    event.preventDefault();
    if (!formData.title.trim()) {
      setFormError('Notice title is required.');
      return;
    }
    if (!formData.content.trim()) {
      setFormError('Notice content is required.');
      return;
    }

    setFormSubmitting(true);
    setFormError('');
    const currentName = formData.current_name.trim();
    const aliases = formData.alias_names.split(',').map((item) => item.trim()).filter(Boolean);
    const pageNumber = formData.gazette_page ? Number(formData.gazette_page) : null;
    const payload = {
      ...formData,
      title: formData.title.trim(),
      content: formData.content.trim(),
      current_name: currentName || null,
      new_name: currentName || null,
      name_value: currentName || null,
      name_role: currentName ? 'master' : null,
      alias_names: aliases.length ? aliases : null,
      publication_date: isoDate(formData.publication_date),
      gazette_date: isoDate(formData.gazette_date),
      effective_date: isoDate(formData.effective_date_of_change),
      effective_date_of_change: isoDate(formData.effective_date_of_change),
      gazette_page: pageNumber,
      page_number: pageNumber,
      is_public: Boolean(formData.is_public),
      is_featured: Boolean(formData.is_featured),
    };

    Object.keys(payload).forEach((key) => {
      if (payload[key] === '') payload[key] = null;
    });

    try {
      if (formMode === 'create') await apiPost('/gazette/', payload);
      else await apiPut(`/gazette/${formRecordId}`, payload);
      setShowForm(false);
      setFormRecordId(null);
      setSelectedRecord(null);
      setActiveDataset('gazette');
      setScope('gazette');
      await Promise.all([loadRecords(), loadStats()]);
    } catch (requestError) {
      setFormError(requestError.detail || requestError.message || 'The Gazette notice could not be saved.');
    } finally {
      setFormSubmitting(false);
    }
  };

  const datasetTitle = activeDataset === 'gazette'
    ? 'Government Gazette notices'
    : activeDataset === 'lifecycle'
      ? 'Company lifecycle notices'
      : 'Source bulletins';

  const filterTitle = activeDataset === 'gazette'
    ? 'Find an official Gazette notice'
    : activeDataset === 'lifecycle'
      ? 'Find a company lifecycle notice'
      : 'Find a source publication';

  const detailTabs = selectedRecord?._kind === 'gazette'
    ? [['overview', 'Notice overview'], ['change', 'Change record'], ['source', 'Source & metadata']]
    : selectedRecord?._kind === 'lifecycle'
      ? [['overview', 'Company notice'], ['dates', 'Dates & legal record'], ['source', 'Source & extraction']]
      : [['overview', 'Publication'], ['source', 'Source integrity']];

  return (
    <section className="dd-module-shell dd-gazette-register">
      <div className="dd-module-heading">
        <div>
          <p className="dd-eyebrow">Official notices</p>
          <h2>Gazette & company notices</h2>
          <p>Review public notices, corporate lifecycle events and the source publications from which each record was captured.</p>
        </div>
        <div className="dd-heading-actions">
          <span className="dd-count-badge"><Database size={14} /> {formatNumber(totalRegisterRecords)} records</span>
          <button type="button" className="dd-button dd-button-secondary" onClick={() => onNavigate?.('file-repository')}><Upload size={14} /> Import source</button>
          <button type="button" className="dd-button dd-button-primary" onClick={() => openForm('create')}><Plus size={14} /> Add notice</button>
        </div>
      </div>

      <section className="dd-gazette-summary" aria-label="Gazette register summary">
        <button type="button" className={scope === 'gazette' ? 'is-active' : ''} onClick={() => applyScope('gazette')}>
          <FileText size={17} /><span>Gazette notices</span><strong>{statsLoading ? '...' : formatNumber(gazetteStats.total_gazettes)}</strong><small>Official publications</small>
        </button>
        <button type="button" className={scope === 'lifecycle' ? 'is-active' : ''} onClick={() => applyScope('lifecycle')}>
          <Building2 size={17} /><span>Company lifecycle</span><strong>{statsLoading ? '...' : formatNumber(lifecycleStats.lifecycle_notices)}</strong><small>Registrar events</small>
        </button>
        <button type="button" className={scope === 'sources' ? 'is-active' : ''} onClick={() => applyScope('sources')}>
          <BookOpenCheck size={17} /><span>Source bulletins</span><strong>{statsLoading ? '...' : formatNumber(lifecycleStats.bulletin_sources)}</strong><small>Captured publications</small>
        </button>
        <button type="button" className={scope === 'review' ? 'is-active' : ''} onClick={() => applyScope('review')}>
          <AlertCircle size={17} /><span>Needs review</span><strong>{statsLoading ? '...' : formatNumber(reviewCount)}</strong><small>Extraction checks</small>
        </button>
      </section>

      <nav className="dd-gazette-dataset-tabs" aria-label="Gazette datasets">
        {[
          ['gazette', 'Government Gazette', gazetteStats.total_gazettes],
          ['lifecycle', 'Company lifecycle', lifecycleStats.lifecycle_notices],
          ['sources', 'Source bulletins', lifecycleStats.bulletin_sources],
        ].map(([id, label, count]) => (
          <button type="button" key={id} className={activeDataset === id ? 'is-active' : ''} onClick={() => changeDataset(id)}>
            <strong>{label}</strong><span>{formatNumber(count)}</span>
          </button>
        ))}
      </nav>

      <section className="dd-enquiry-panel">
        <header>{filterTitle}</header>
        <form className={`dd-gazette-filter-form is-${activeDataset}`} onSubmit={submitSearch}>
          <label className="dd-gazette-search-field">
            <span>{activeDataset === 'gazette' ? 'Name, title, Gazette number or reference' : activeDataset === 'lifecycle' ? 'Company name or registration number' : 'Publication, volume, authority or filename'}</span>
            <span className="dd-input-with-icon"><Search size={14} /><input value={draftSearch} onChange={(event) => setDraftSearch(event.target.value)} placeholder={`Search ${datasetTitle.toLowerCase()}`} /></span>
          </label>

          {activeDataset === 'gazette' && <>
            <label><span>Notice type</span><select className="dd-select-control" value={noticeType} onChange={(event) => { setNoticeType(event.target.value); setScope('custom'); setPage(1); }}><option value="">All notice types</option>{gazetteTypeOptions.map(([value, count]) => <option key={value} value={value}>{noticeLabel(value)} ({formatNumber(count)})</option>)}</select></label>
            <label><span>Status</span><select className="dd-select-control" value={status} onChange={(event) => { setStatus(event.target.value); setScope('custom'); setPage(1); }}><option value="">All statuses</option><option value="PUBLISHED">Published ({formatNumber(gazetteStats.published_gazettes)})</option><option value="DRAFT">Draft ({formatNumber(gazetteStats.draft_gazettes)})</option><option value="ARCHIVED">Archived ({formatNumber(gazetteStats.archived_gazettes)})</option><option value="REVIEWED">Reviewed</option></select></label>
            <label><span>From</span><input type="date" value={dateFrom} onChange={(event) => { setDateFrom(event.target.value); setScope('custom'); setPage(1); }} /></label>
            <label><span>To</span><input type="date" value={dateTo} onChange={(event) => { setDateTo(event.target.value); setScope('custom'); setPage(1); }} /></label>
            <label><span>Sort</span><select className="dd-select-control" value={sort} onChange={(event) => { setSort(event.target.value); setScope('custom'); setPage(1); }}><option value="publication_date:desc">Newest publication</option><option value="publication_date:asc">Oldest publication</option><option value="title:asc">Title A-Z</option><option value="title:desc">Title Z-A</option><option value="created_at:desc">Recently captured</option></select></label>
          </>}

          {activeDataset === 'lifecycle' && <>
            <label><span>Notice type</span><select className="dd-select-control" value={noticeType} onChange={(event) => { setNoticeType(event.target.value); setScope('custom'); setPage(1); }}><option value="">All lifecycle events</option>{lifecycleTypeOptions.map(([value, count]) => <option key={value} value={value}>{noticeLabel(value)} ({formatNumber(count)})</option>)}</select></label>
            <label><span>Review state</span><select className="dd-select-control" value={reviewStatus} onChange={(event) => { setReviewStatus(event.target.value); setScope('custom'); setPage(1); }}><option value="">All review states</option>{Object.entries(lifecycleStats.review_status || {}).map(([value, count]) => <option key={value} value={value}>{humanize(value)} ({formatNumber(count)})</option>)}</select></label>
            <label><span>Minimum confidence</span><select className="dd-select-control" value={confidence} onChange={(event) => { setConfidence(event.target.value); setScope('custom'); setPage(1); }}><option value="0">All confidence levels</option><option value="0.65">65% and above</option><option value="0.8">80% and above</option><option value="0.9">90% and above</option></select></label>
          </>}

          {activeDataset === 'sources' && <label><span>Import status</span><select className="dd-select-control" value={sourceStatus} onChange={(event) => { setSourceStatus(event.target.value); setScope('custom'); setPage(1); }}><option value="">All import states</option>{sourceStatuses.map((value) => <option key={value} value={value}>{humanize(value)}</option>)}</select></label>}

          <div className="dd-gazette-filter-actions">
            <button type="submit" className="dd-button dd-button-primary"><Search size={14} /> Search</button>
            <button type="button" className="dd-button dd-button-secondary" onClick={() => clearFilters(activeDataset)} disabled={!isFiltered && !draftSearch}><X size={14} /> Clear</button>
          </div>
        </form>
      </section>

      <div className="dd-register-note dd-gazette-register-note"><ShieldCheck size={15} /><span>Opening records is read-only. Gazette notices change only after Save notice, and this workspace provides no deletion action. Source provenance remains visible on every record.</span></div>

      {error && <div className="dd-inline-alert is-error"><span>{error}</span><button type="button" onClick={refresh}><RefreshCw size={13} /> Retry</button></div>}

      <section className="dd-enquiry-results">
        <header>
          <h2>{datasetTitle} <span>{formatNumber(displayTotal)}</span></h2>
          <div className="dd-gazette-results-tools">
            <span>Records {firstRecord}-{lastRecord} of {formatNumber(displayTotal)}</span>
            <button type="button" disabled={isLoading || page <= 1} onClick={() => setPage((current) => Math.max(1, current - 1))}><ChevronLeft size={14} /> Prev</button>
            <button type="button" disabled={isLoading || page >= displayTotalPages} onClick={() => setPage((current) => Math.min(displayTotalPages, current + 1))}>Next <ChevronRight size={14} /></button>
          </div>
        </header>

        {isLoading ? (
          <div className="dd-loading-state"><Loader2 size={22} className="dd-spin" /> Loading {datasetTitle.toLowerCase()}</div>
        ) : !displayRecords.length ? (
          <div className="dd-empty-state"><FileText size={28} /><div><strong>No records found</strong><p>Change the filters or clear the search to review the full dataset.</p></div></div>
        ) : activeDataset === 'gazette' ? (
          <div className="dd-table-wrap dd-gazette-table is-gazette">
            <table className="dd-data-table">
              <thead><tr><th>Notice / subject</th><th>Change record</th><th>Source</th><th>Dates</th><th>Status</th><th aria-label="Actions" /></tr></thead>
              <tbody>{displayRecords.map((record) => (
                <tr key={record.id}>
                  <td><button type="button" className="dd-company-record-link" onClick={() => openDetail(record, 'gazette')}><strong>{record.current_name || record.new_name || record.title || 'Untitled notice'}</strong></button><small><span className="dd-mono">{gazetteId(record.id)}</span> {noticeLabel(record.gazette_type)}</small></td>
                  <td><strong>{record.old_name || 'Former value not recorded'}</strong><small>{record.alias_names?.length ? `Aliases: ${record.alias_names.join(', ')}` : record.profession || 'No aliases recorded'}</small></td>
                  <td><strong>{record.gazette_number && record.gazette_number !== 'unknown' ? `Gazette ${record.gazette_number}` : sourceName(record.source) || 'Government Gazette'}</strong><small>{record.document_filename || `Item ${record.item_number || 'not recorded'}`}</small></td>
                  <td><strong>{formatDate(record.gazette_date || record.publication_date)}</strong><small>Effective: {formatDate(record.effective_date_of_change || record.effective_date)}</small></td>
                  <td><span className={`dd-status-pill ${statusClass(record.status)}`}>{humanize(record.status)}</span><small>{record.is_public ? 'Public record' : 'Internal record'}</small></td>
                  <td><div className="dd-gazette-row-actions"><button type="button" className="dd-icon-button" onClick={() => openDetail(record, 'gazette')} aria-label={`Open ${record.title}`} title="Open notice"><Eye size={14} /></button><button type="button" className="dd-icon-button" onClick={() => openForm('edit', record)} aria-label={`Edit ${record.title}`} title="Edit notice"><Edit3 size={14} /></button></div></td>
                </tr>
              ))}</tbody>
            </table>
          </div>
        ) : activeDataset === 'lifecycle' ? (
          <div className="dd-table-wrap dd-gazette-table is-lifecycle">
            <table className="dd-data-table">
              <thead><tr><th>Company</th><th>Lifecycle event</th><th>Legal reference</th><th>Event / publication</th><th>Review</th><th>Source</th><th aria-label="Actions" /></tr></thead>
              <tbody>{displayRecords.map((record) => (
                <tr key={record.id}>
                  <td><button type="button" className="dd-company-record-link" onClick={() => openDetail(record, 'lifecycle')}><strong>{record.company_name || record.new_company_name || 'Company not recorded'}</strong></button><small><span className="dd-mono">{record.registration_number || lifecycleId(record.id)}</span></small></td>
                  <td><strong>{noticeLabel(record.notice_type)}</strong><small>{record.old_company_name && record.new_company_name ? `${record.old_company_name} to ${record.new_company_name}` : record.notice_reference || 'No additional reference'}</small></td>
                  <td><strong>{record.statutory_section || 'Section not recorded'}</strong><small>{record.act_reference || 'Act reference not recorded'}</small></td>
                  <td><strong>{formatDate(lifecycleDate(record))}</strong><small>Published: {formatDate(record.publication_date)}</small></td>
                  <td><span className={`dd-status-pill ${statusClass(record.review_status)}`}>{humanize(record.review_status)}</span><small><span className={`dd-confidence ${confidenceClass(record.extraction_confidence)}`}>{Math.round(Number(record.extraction_confidence || 0) * 100)}% confidence</span></small></td>
                  <td><strong>{record.source?.volume_number ? `Bulletin Vol. ${record.source.volume_number}` : record.source?.publication_title || 'Companies Bulletin'}</strong><small>{record.source?.source_filename || 'Source file not recorded'}</small></td>
                  <td><div className="dd-gazette-row-actions is-single"><button type="button" className="dd-icon-button" onClick={() => openDetail(record, 'lifecycle')} aria-label={`Open ${record.company_name}`} title="Open notice"><Eye size={14} /></button></div></td>
                </tr>
              ))}</tbody>
            </table>
          </div>
        ) : (
          <div className="dd-table-wrap dd-gazette-table is-sources">
            <table className="dd-data-table">
              <thead><tr><th>Publication</th><th>Authority</th><th>Issue / captured</th><th>Document coverage</th><th>Import</th><th aria-label="Actions" /></tr></thead>
              <tbody>{displayRecords.map((record) => (
                <tr key={record.id}>
                  <td><button type="button" className="dd-company-record-link" onClick={() => openDetail(record, 'source')}><strong>{record.publication_title || 'Untitled publication'}{record.volume_number ? `, Vol. ${record.volume_number}` : ''}</strong></button><small><span className="dd-mono">{sourceId(record.id)}</span> {record.source_filename}</small></td>
                  <td><strong>{record.source_authority || 'Authority not recorded'}</strong><small>{record.jurisdiction || 'Jurisdiction not recorded'}</small></td>
                  <td><strong>{formatDate(record.publication_date || record.issue_date)}</strong><small>Captured: {formatDateTime(record.captured_at)}</small></td>
                  <td><strong>{formatNumber(record.page_count)} pages</strong><small>{formatFileSize(record.file_size_bytes)}</small></td>
                  <td><span className={`dd-status-pill ${statusClass(record.import_status)}`}>{humanize(record.import_status)}</span><small>{record.extraction_method || 'Extraction method not recorded'}</small></td>
                  <td><div className="dd-gazette-row-actions is-single"><button type="button" className="dd-icon-button" onClick={() => openDetail(record, 'source')} aria-label={`Open ${record.publication_title}`} title="Open source"><Eye size={14} /></button></div></td>
                </tr>
              ))}</tbody>
            </table>
          </div>
        )}
      </section>

      {selectedRecord && !showForm && (
        <div className="dd-modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setSelectedRecord(null); }}>
          <div className="dd-modal dd-gazette-detail-modal" role="dialog" aria-modal="true" aria-labelledby="gazette-detail-title">
            <header><div><h3 id="gazette-detail-title">{selectedRecord._kind === 'gazette' ? selectedRecord.current_name || selectedRecord.title : selectedRecord._kind === 'lifecycle' ? selectedRecord.company_name : `${selectedRecord.publication_title}${selectedRecord.volume_number ? `, Vol. ${selectedRecord.volume_number}` : ''}`}</h3><p>{selectedRecord._kind === 'gazette' ? gazetteId(selectedRecord.id) : selectedRecord._kind === 'lifecycle' ? lifecycleId(selectedRecord.id) : sourceId(selectedRecord.id)}</p></div><button type="button" onClick={() => setSelectedRecord(null)} aria-label="Close"><X size={17} /></button></header>
            <div className="dd-modal-body">
              {detailError && <div className="dd-inline-alert is-error">{detailError}</div>}
              <section className="dd-gazette-facts">
                {selectedRecord._kind === 'gazette' && <>
                  <div><UserRound size={15} /><span>Notice type</span><strong>{noticeLabel(selectedRecord.gazette_type)}</strong></div>
                  <div><CalendarDays size={15} /><span>Publication</span><strong>{formatDate(selectedRecord.gazette_date || selectedRecord.publication_date)}</strong></div>
                  <div><Hash size={15} /><span>Gazette / item</span><strong>{selectedRecord.gazette_number || selectedRecord.item_number || 'Not recorded'}</strong></div>
                  <div><CheckCircle2 size={15} /><span>Status</span><strong>{humanize(selectedRecord.status)}</strong></div>
                </>}
                {selectedRecord._kind === 'lifecycle' && <>
                  <div><Building2 size={15} /><span>Event</span><strong>{noticeLabel(selectedRecord.notice_type)}</strong></div>
                  <div><CalendarDays size={15} /><span>Key date</span><strong>{formatDate(lifecycleDate(selectedRecord))}</strong></div>
                  <div><Hash size={15} /><span>Registration</span><strong>{displayValue(selectedRecord.registration_number)}</strong></div>
                  <div><ShieldCheck size={15} /><span>Review</span><strong>{humanize(selectedRecord.review_status)}</strong></div>
                </>}
                {selectedRecord._kind === 'source' && <>
                  <div><BookOpenCheck size={15} /><span>Volume</span><strong>{displayValue(selectedRecord.volume_number)}</strong></div>
                  <div><CalendarDays size={15} /><span>Publication</span><strong>{formatDate(selectedRecord.publication_date || selectedRecord.issue_date)}</strong></div>
                  <div><FileText size={15} /><span>Pages</span><strong>{formatNumber(selectedRecord.page_count)}</strong></div>
                  <div><CheckCircle2 size={15} /><span>Import</span><strong>{humanize(selectedRecord.import_status)}</strong></div>
                </>}
              </section>

              <nav className="dd-gazette-detail-tabs" aria-label="Notice details">
                {detailTabs.map(([id, label]) => <button key={id} type="button" className={detailTab === id ? 'is-active' : ''} onClick={() => setDetailTab(id)}>{label}</button>)}
              </nav>

              {detailLoading ? <div className="dd-loading-state"><Loader2 size={20} className="dd-spin" /> Loading full notice</div> : (
                <div className="dd-gazette-detail-content">
                  {selectedRecord._kind === 'gazette' && detailTab === 'overview' && <>
                    <section className="dd-gazette-change-band"><div><span>Former name</span><strong>{displayValue(selectedRecord.old_name)}</strong></div><div><span>Current name</span><strong>{displayValue(selectedRecord.current_name || selectedRecord.new_name || selectedRecord.name_value)}</strong></div><div><span>Aliases</span><strong>{selectedRecord.alias_names?.length ? selectedRecord.alias_names.join(', ') : 'None recorded'}</strong></div></section>
                    <section><h4>Notice summary</h4><p>{readableText(selectedRecord.summary || selectedRecord.description)}</p></section>
                    <section><h4>Subject details</h4><dl><div><dt>Profession</dt><dd>{displayValue(selectedRecord.profession)}</dd></div><div><dt>Address</dt><dd>{displayValue(selectedRecord.address)}</dd></div></dl></section>
                  </>}
                  {selectedRecord._kind === 'gazette' && detailTab === 'change' && <>
                    <section><h4>Notice content</h4><p>{readableText(selectedRecord.content)}</p></section>
                    <section><h4>Remarks</h4><p>{readableText(selectedRecord.remarks, 1400)}</p></section>
                    <section><h4>Change dates</h4><dl><div><dt>Effective date</dt><dd>{formatDate(selectedRecord.effective_date_of_change || selectedRecord.effective_date)}</dd></div><div><dt>Expiry date</dt><dd>{formatDate(selectedRecord.expiry_date)}</dd></div></dl></section>
                  </>}
                  {selectedRecord._kind === 'gazette' && detailTab === 'source' && <dl className="dd-person-detail-list">
                    {[
                      ['Gazette record ID', gazetteId(selectedRecord.id)],
                      ['Gazette number', selectedRecord.gazette_number],
                      ['Gazette date', formatDate(selectedRecord.gazette_date)],
                      ['Page', selectedRecord.gazette_page || selectedRecord.page_number],
                      ['Item number', selectedRecord.item_number],
                      ['Source item', selectedRecord.source_item_number],
                      ['Reference', selectedRecord.reference_number],
                      ['Source authority', selectedRecord.source],
                      ['Source file', selectedRecord.document_filename],
                      ['Jurisdiction', selectedRecord.jurisdiction],
                      ['Linked person', selectedRecord.person_id],
                      ['Linked company', selectedRecord.company_id],
                      ['Captured', formatDateTime(selectedRecord.created_at)],
                      ['Last updated', formatDateTime(selectedRecord.updated_at)],
                    ].map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{displayValue(value)}</dd></div>)}
                  </dl>}

                  {selectedRecord._kind === 'lifecycle' && detailTab === 'overview' && <>
                    <section className="dd-gazette-change-band"><div><span>Former company name</span><strong>{displayValue(selectedRecord.old_company_name)}</strong></div><div><span>Recorded company</span><strong>{displayValue(selectedRecord.company_name)}</strong></div><div><span>New company name</span><strong>{displayValue(selectedRecord.new_company_name)}</strong></div></section>
                    <section><h4>Registry identity</h4><dl><div><dt>Registration number</dt><dd>{displayValue(selectedRecord.registration_number)}</dd></div><div><dt>Registered address</dt><dd>{displayValue(selectedRecord.registered_address)}</dd></div></dl></section>
                    <section><h4>Notice reference</h4><p>{displayValue(selectedRecord.notice_reference || selectedRecord.source_item_number)}</p></section>
                  </>}
                  {selectedRecord._kind === 'lifecycle' && detailTab === 'dates' && <>
                    <dl className="dd-person-detail-list">
                      {[
                        ['Publication date', formatDate(selectedRecord.publication_date)],
                        ['Event date', formatDate(selectedRecord.event_date)],
                        ['Effective date', formatDate(selectedRecord.effective_date)],
                        ['Incorporation date', formatDate(selectedRecord.incorporation_date)],
                        ['Dissolution date', formatDate(selectedRecord.dissolution_date)],
                        ['Strike-off date', formatDate(selectedRecord.strike_off_date)],
                        ['Objection deadline', formatDate(selectedRecord.objection_deadline)],
                        ['Winding-up date', formatDate(selectedRecord.winding_up_date)],
                        ['Liquidation date', formatDate(selectedRecord.liquidation_date)],
                        ['Cessation date', formatDate(selectedRecord.cessation_date)],
                      ].map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}
                    </dl>
                    <section><h4>Legal authority</h4><dl><div><dt>Statutory section</dt><dd>{displayValue(selectedRecord.statutory_section)}</dd></div><div><dt>Act reference</dt><dd>{displayValue(selectedRecord.act_reference)}</dd></div></dl></section>
                    <section><h4>Officials</h4><dl><div><dt>Registrar</dt><dd>{displayValue(selectedRecord.registrar_name)}</dd></div><div><dt>Liquidator</dt><dd>{displayValue(selectedRecord.liquidator_name)}</dd></div></dl></section>
                  </>}
                  {selectedRecord._kind === 'lifecycle' && detailTab === 'source' && <dl className="dd-person-detail-list">
                    {[
                      ['Lifecycle record ID', lifecycleId(selectedRecord.id)],
                      ['Source bulletin ID', selectedRecord.bulletin_id],
                      ['Publication', selectedRecord.source?.publication_title],
                      ['Volume', selectedRecord.source?.volume_number],
                      ['Source authority', selectedRecord.source?.source_authority],
                      ['Source file', selectedRecord.source?.source_filename],
                      ['Source page', selectedRecord.source_page],
                      ['Extraction method', selectedRecord.source?.extraction_method],
                      ['Extraction version', selectedRecord.source?.extraction_version],
                      ['Extraction confidence', `${Math.round(Number(selectedRecord.extraction_confidence || 0) * 100)}%`],
                      ['Review status', humanize(selectedRecord.review_status)],
                      ['Verified', selectedRecord.is_verified ? 'Yes' : 'No'],
                      ['Captured', formatDateTime(selectedRecord.source?.captured_at)],
                      ['Imported', formatDateTime(selectedRecord.source?.imported_at)],
                    ].map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{displayValue(value)}</dd></div>)}
                  </dl>}

                  {selectedRecord._kind === 'source' && detailTab === 'overview' && <dl className="dd-person-detail-list">
                    {[
                      ['Publication title', selectedRecord.publication_title],
                      ['Volume number', selectedRecord.volume_number],
                      ['Source authority', selectedRecord.source_authority],
                      ['Issue date', formatDate(selectedRecord.issue_date)],
                      ['Publication date', formatDate(selectedRecord.publication_date)],
                      ['Jurisdiction', selectedRecord.jurisdiction],
                      ['Source filename', selectedRecord.source_filename],
                      ['Page count', formatNumber(selectedRecord.page_count)],
                      ['File size', formatFileSize(selectedRecord.file_size_bytes)],
                      ['Document URL', selectedRecord.document_url],
                    ].map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{displayValue(value)}</dd></div>)}
                  </dl>}
                  {selectedRecord._kind === 'source' && detailTab === 'source' && <dl className="dd-person-detail-list">
                    {[
                      ['Source record ID', sourceId(selectedRecord.id)],
                      ['SHA-256', selectedRecord.source_sha256],
                      ['Extraction method', selectedRecord.extraction_method],
                      ['Extraction version', selectedRecord.extraction_version],
                      ['Import status', humanize(selectedRecord.import_status)],
                      ['Text layer present', selectedRecord.source_metadata?.text_layer_present === true ? 'Yes' : selectedRecord.source_metadata?.text_layer_present === false ? 'No' : 'Not recorded'],
                      ['Captured', formatDateTime(selectedRecord.captured_at)],
                      ['Imported', formatDateTime(selectedRecord.imported_at)],
                    ].map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{displayValue(value)}</dd></div>)}
                  </dl>}
                </div>
              )}

              <div className="dd-modal-actions"><button type="button" className="dd-button dd-button-secondary" onClick={() => setSelectedRecord(null)}>Close</button>{selectedRecord._kind === 'gazette' && <button type="button" className="dd-button dd-button-primary" onClick={() => openForm('edit', selectedRecord)}><Edit3 size={14} /> Edit notice</button>}</div>
            </div>
          </div>
        </div>
      )}

      {showForm && (
        <div className="dd-modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) closeForm(); }}>
          <div className="dd-modal dd-company-record-form dd-gazette-form" role="dialog" aria-modal="true" aria-labelledby="gazette-form-title">
            <header><div><h3 id="gazette-form-title">{formMode === 'create' ? 'Add Gazette notice' : 'Edit Gazette notice'}</h3><p>Maintain the notice and its source metadata without removing its record history.</p></div><button type="button" onClick={closeForm} aria-label="Close"><X size={17} /></button></header>
            <form className="dd-modal-body" onSubmit={saveNotice}>
              {formError && <div className="dd-inline-alert is-error">{formError}</div>}
              <div className="dd-company-record-form-grid">
                <label className="is-wide"><span>Notice title *</span><input required value={formData.title} onChange={(event) => updateForm('title', event.target.value)} /></label>
                <label><span>Notice type *</span><select className="dd-select-control" required value={formData.gazette_type} onChange={(event) => updateForm('gazette_type', event.target.value)}>{Object.entries(GAZETTE_TYPE_LABELS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
                <label><span>Status</span><select className="dd-select-control" value={formData.status} onChange={(event) => updateForm('status', event.target.value)}><option value="PUBLISHED">Published</option><option value="DRAFT">Draft</option><option value="REVIEWED">Reviewed</option><option value="ARCHIVED">Archived</option><option value="CANCELLED">Cancelled</option></select></label>
                <label><span>Current / new name</span><input value={formData.current_name} onChange={(event) => updateForm('current_name', event.target.value)} /></label>
                <label><span>Former name</span><input value={formData.old_name} onChange={(event) => updateForm('old_name', event.target.value)} /></label>
                <label className="is-wide"><span>Aliases, comma separated</span><input value={formData.alias_names} onChange={(event) => updateForm('alias_names', event.target.value)} /></label>
                <label><span>Profession</span><input value={formData.profession} onChange={(event) => updateForm('profession', event.target.value)} /></label>
                <label><span>Jurisdiction</span><input value={formData.jurisdiction} onChange={(event) => updateForm('jurisdiction', event.target.value)} /></label>
                <label className="is-wide"><span>Address</span><textarea rows="2" value={formData.address} onChange={(event) => updateForm('address', event.target.value)} /></label>
                <label><span>Publication date *</span><input type="date" required value={formData.publication_date} onChange={(event) => updateForm('publication_date', event.target.value)} /></label>
                <label><span>Gazette date</span><input type="date" value={formData.gazette_date} onChange={(event) => updateForm('gazette_date', event.target.value)} /></label>
                <label><span>Effective date</span><input type="date" value={formData.effective_date_of_change} onChange={(event) => updateForm('effective_date_of_change', event.target.value)} /></label>
                <label><span>Priority</span><select className="dd-select-control" value={formData.priority} onChange={(event) => updateForm('priority', event.target.value)}><option value="LOW">Low</option><option value="MEDIUM">Medium</option><option value="HIGH">High</option><option value="URGENT">Urgent</option></select></label>
                <label><span>Source authority</span><input value={formData.source} onChange={(event) => updateForm('source', event.target.value)} /></label>
                <label><span>Gazette number</span><input value={formData.gazette_number} onChange={(event) => updateForm('gazette_number', event.target.value)} /></label>
                <label><span>Page</span><input type="number" min="1" value={formData.gazette_page} onChange={(event) => updateForm('gazette_page', event.target.value)} /></label>
                <label><span>Item number</span><input value={formData.item_number} onChange={(event) => updateForm('item_number', event.target.value)} /></label>
                <label className="is-wide"><span>Reference number</span><input value={formData.reference_number} onChange={(event) => updateForm('reference_number', event.target.value)} /></label>
                <label className="is-wide"><span>Summary</span><textarea rows="3" value={formData.summary} onChange={(event) => updateForm('summary', event.target.value)} /></label>
                <label className="is-wide"><span>Notice content *</span><textarea rows="6" required value={formData.content} onChange={(event) => updateForm('content', event.target.value)} /></label>
                <label className="is-wide"><span>Remarks</span><textarea rows="3" value={formData.remarks} onChange={(event) => updateForm('remarks', event.target.value)} /></label>
                <div className="dd-gazette-form-checks is-wide">
                  <label><input type="checkbox" checked={formData.is_public} onChange={(event) => updateForm('is_public', event.target.checked)} /><span>Publicly visible</span></label>
                  <label><input type="checkbox" checked={formData.is_featured} onChange={(event) => updateForm('is_featured', event.target.checked)} /><span>Featured notice</span></label>
                </div>
              </div>
              <div className="dd-modal-actions"><button type="button" className="dd-button dd-button-secondary" onClick={closeForm} disabled={formSubmitting}>Cancel</button><button type="submit" className="dd-button dd-button-primary" disabled={formSubmitting}>{formSubmitting ? <Loader2 size={14} className="dd-spin" /> : <FileCheck2 size={14} />} Save notice</button></div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
};

export default GazetteRegisterPage;
