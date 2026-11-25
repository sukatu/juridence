import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Database,
  Download,
  Eye,
  FileText,
  Loader2,
  Search,
  UserCheck,
  X,
} from 'lucide-react';
import { apiGet } from '../utils/api';

const PAGE_SIZE = 25;
const RETURN_STATE_KEY = 'personSearchState';

const DATABASES = [
  ['all', 'All person databases'],
  ['change_of_name', 'Change of name'],
  ['correction_of_place_of_birth', 'Correction of place of birth'],
  ['correction_of_date_of_birth', 'Correction of date of birth'],
  ['marriage_officer', 'Marriage officers'],
  ['judgment', 'Judgments and rulings'],
];

const SOURCE_LABELS = Object.fromEntries(DATABASES);

const DETAIL_FIELDS = {
  change_of_name: [
    ['current_name', 'Current name'],
    ['old_name', 'Previous name'],
    ['alias_names', 'Other names'],
    ['profession', 'Profession'],
    ['gender', 'Gender'],
    ['address', 'Address'],
    ['town_city', 'Town / city'],
    ['region', 'Region'],
    ['effective_date', 'Effective date', 'date'],
    ['gazette_number', 'Gazette number'],
    ['gazette_date', 'Gazette date', 'date'],
    ['page_number', 'Page'],
    ['source', 'Source authority'],
    ['document_filename', 'Source file'],
    ['remarks', 'Remarks'],
  ],
  correction_of_place_of_birth: [
    ['person_name', 'Person'],
    ['alias', 'Alias'],
    ['old_place_of_birth', 'Previous place of birth'],
    ['new_place_of_birth', 'Corrected place of birth'],
    ['effective_date', 'Effective date', 'date'],
    ['gazette_number', 'Gazette number'],
    ['gazette_date', 'Gazette date', 'date'],
    ['page_number', 'Page'],
    ['source_details', 'Source details'],
  ],
  correction_of_date_of_birth: [
    ['person_name', 'Person'],
    ['old_date_of_birth', 'Previous date of birth', 'date'],
    ['new_date_of_birth', 'Corrected date of birth', 'date'],
    ['effective_date', 'Effective date', 'date'],
    ['gazette_number', 'Gazette number'],
    ['gazette_date', 'Gazette date', 'date'],
    ['page_number', 'Page'],
    ['source_details', 'Source details'],
  ],
  marriage_officer: [
    ['officer_name', 'Officer'],
    ['church', 'Church / organisation'],
    ['location', 'Location'],
    ['region', 'Region'],
    ['appointing_authority', 'Appointing authority'],
    ['appointing_authority_title', 'Authority title'],
    ['appointment_date', 'Appointment date', 'date'],
    ['gazette_number', 'Gazette number'],
    ['gazette_date', 'Gazette date', 'date'],
    ['page_number', 'Page'],
    ['source_details', 'Source details'],
  ],
};

const formatDate = (value) => {
  if (!value) return 'Not recorded';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
};

const displayValue = (value, type) => {
  if (value == null || value === '') return 'Not recorded';
  if (type === 'date') return formatDate(value);
  if (Array.isArray(value)) return value.length ? value.join(', ') : 'Not recorded';
  return String(value);
};

const primaryName = (record) => record.name
  || record.current_name
  || record.person_name
  || record.officer_name
  || record.title
  || 'Unnamed record';

const recordSummary = (record) => {
  switch (record.source_type) {
    case 'change_of_name':
      return [record.old_name, record.current_name].filter(Boolean).join(' to ') || 'Name change notice';
    case 'correction_of_place_of_birth':
      return [record.old_place_of_birth, record.new_place_of_birth].filter(Boolean).join(' to ') || 'Place of birth correction';
    case 'correction_of_date_of_birth':
      return [formatDate(record.old_date_of_birth), formatDate(record.new_date_of_birth)].join(' to ');
    case 'marriage_officer':
      return [record.church, record.location, record.region].filter(Boolean).join(', ') || 'Marriage officer appointment';
    case 'judgment':
      return [record.protagonist, record.antagonist].filter(Boolean).join(' v ') || 'Published court record';
    default:
      return 'Person record';
  }
};

const recordReference = (record) => {
  if (record.source_type === 'judgment') return record.suit_reference_number || 'No citation recorded';
  const parts = [];
  if (record.gazette_number) parts.push(`Gazette ${record.gazette_number}`);
  if (record.page_number) parts.push(`p. ${record.page_number}`);
  return parts.join(' - ') || 'Source reference unavailable';
};

const recordDate = (record) => formatDate(record.source_type === 'judgment' ? record.date : record.gazette_date);

const PersonSearchPage = ({ onNavigate }) => {
  const [criteria, setCriteria] = useState({ name: '', source: 'all' });
  const [submittedCriteria, setSubmittedCriteria] = useState(null);
  const [results, setResults] = useState([]);
  const [sourceCounts, setSourceCounts] = useState({});
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [recordDetails, setRecordDetails] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState('');

  const executeSearch = useCallback(async (nextCriteria, nextPage = 1) => {
    const name = String(nextCriteria?.name || '').trim();
    const source = nextCriteria?.source || 'all';
    if (name.length < 2) {
      setError('Enter at least two characters of the person\'s name.');
      return;
    }

    setLoading(true);
    setError('');
    setSubmittedCriteria({ name, source });
    setPage(nextPage);
    try {
      const params = { query: name, page: nextPage, limit: PAGE_SIZE };
      if (source === 'all') params.include_judgments = true;
      else {
        params.source_type = source;
        if (source === 'judgment') params.include_judgments = true;
      }
      const response = await apiGet('/persons-unified-search/', params);
      setResults(response.results || []);
      setTotal(Number(response.total || 0));
      setTotalPages(Number(response.total_pages || 0));
      setSourceCounts(response.source_counts || {});
    } catch (requestError) {
      setResults([]);
      setTotal(0);
      setTotalPages(0);
      setSourceCounts({});
      setError(requestError.message || 'Person records could not be searched.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const stored = sessionStorage.getItem(RETURN_STATE_KEY);
    if (!stored) return;
    sessionStorage.removeItem(RETURN_STATE_KEY);
    try {
      const parsed = JSON.parse(stored);
      const restored = parsed.criteria || {
        name: parsed.searchData?.name || '',
        source: parsed.searchData?.databaseType || 'all',
      };
      setCriteria(restored);
      if (restored.name) executeSearch(restored, Number(parsed.page || 1));
    } catch {
      // Ignore obsolete state from the previous person-search implementation.
    }
  }, [executeSearch]);

  const firstRecord = total ? ((page - 1) * PAGE_SIZE) + 1 : 0;
  const lastRecord = Math.min(page * PAGE_SIZE, total);
  const sourceSummary = useMemo(() => DATABASES.slice(1)
    .map(([value, label]) => ({ value, label, count: Number(sourceCounts[value] || 0) }))
    .filter((item) => item.count > 0), [sourceCounts]);

  const submitSearch = (event) => {
    event.preventDefault();
    executeSearch(criteria, 1);
  };

  const clearSearch = () => {
    setCriteria({ name: '', source: 'all' });
    setSubmittedCriteria(null);
    setResults([]);
    setSourceCounts({});
    setTotal(0);
    setPage(1);
    setTotalPages(0);
    setError('');
  };

  const openDetails = async (record) => {
    setSelectedRecord(record);
    setRecordDetails(null);
    setDetailError('');
    setDetailLoading(true);
    try {
      setRecordDetails(await apiGet(`/persons-unified-search/${record.source_type}/${record.id}`));
    } catch (requestError) {
      setDetailError(requestError.message || 'Record details could not be loaded.');
    } finally {
      setDetailLoading(false);
    }
  };

  const closeDetails = () => {
    setSelectedRecord(null);
    setRecordDetails(null);
    setDetailError('');
  };

  const openCase = async (record) => {
    const state = { criteria: submittedCriteria || criteria, page };
    sessionStorage.setItem('caseBackTarget', JSON.stringify({ type: 'person_search', state }));
    try {
      const caseData = await apiGet(`/cases/${record.id}`);
      sessionStorage.setItem('selectedCaseData', JSON.stringify(caseData));
    } catch {
      sessionStorage.setItem('selectedCaseData', JSON.stringify(record));
    }
    onNavigate?.('case-profile');
  };

  const downloadDetails = () => {
    if (!recordDetails) return;
    const fields = DETAIL_FIELDS[recordDetails.source_type] || [];
    const lines = [
      'JURIDENCE PERSON RECORD',
      `Database: ${recordDetails.data_source || SOURCE_LABELS[recordDetails.source_type] || 'Person records'}`,
      '',
      ...fields.map(([key, label, type]) => `${label}: ${displayValue(recordDetails[key], type)}`),
    ];
    const url = URL.createObjectURL(new Blob([lines.join('\n')], { type: 'text/plain;charset=utf-8' }));
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `person-record-${recordDetails.id}.txt`;
    anchor.click();
    URL.revokeObjectURL(url);
  };

  const detailFields = recordDetails ? (DETAIL_FIELDS[recordDetails.source_type] || []) : [];

  return (
    <section className="dd-module-shell dd-person-search">
      <div className="dd-module-heading">
        <div>
          <p className="dd-eyebrow">Identity and legal records</p>
          <h2>Person search</h2>
          <p>Search Gazette identity notices, marriage-officer appointments and published court records.</p>
        </div>
        <span className="dd-count-badge"><Database size={14} /> 5 databases</span>
      </div>

      <section className="dd-enquiry-panel">
        <header>Search criteria</header>
        <form className="dd-person-search-form" onSubmit={submitSearch} autoComplete="off">
          <div className="dd-person-search-fields">
            <label>
              <span>Name <b>*</b></span>
              <div className="dd-input-with-icon"><UserCheck size={14} /><input value={criteria.name} onChange={(event) => setCriteria((current) => ({ ...current, name: event.target.value }))} placeholder="Full name or known name" required /></div>
            </label>
            <label>
              <span>Database</span>
              <select className="dd-select-control" value={criteria.source} onChange={(event) => setCriteria((current) => ({ ...current, source: event.target.value }))}>
                {DATABASES.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
              </select>
            </label>
          </div>
          <div className="dd-enquiry-actions">
            <button type="submit" className="is-primary" disabled={loading || criteria.name.trim().length < 2}>{loading ? <Loader2 size={14} className="dd-spin" /> : <Search size={14} />} Search</button>
            <button type="button" onClick={clearSearch}><X size={14} /> Clear</button>
            <p>Minimum 2 characters. Results preserve the database record and published source reference.</p>
          </div>
        </form>
      </section>

      {error && <div className="dd-inline-alert is-error"><span>{error}</span><button type="button" onClick={() => setError('')} aria-label="Dismiss"><X size={14} /></button></div>}

      {submittedCriteria && (
        <section className="dd-enquiry-results" aria-live="polite">
          <header>
            <h2>Results <span>{total.toLocaleString()}</span></h2>
            <div>
              <span>Records {firstRecord}-{lastRecord} of {total.toLocaleString()}</span>
              <button type="button" disabled={loading || page <= 1} onClick={() => executeSearch(submittedCriteria, page - 1)}><ChevronLeft size={14} /> Prev</button>
              <button type="button" disabled={loading || page >= totalPages} onClick={() => executeSearch(submittedCriteria, page + 1)}>Next <ChevronRight size={14} /></button>
            </div>
          </header>

          {sourceSummary.length > 0 && <div className="dd-person-source-summary">{sourceSummary.map((item) => <span key={item.value}><b>{item.count.toLocaleString()}</b>{item.label}</span>)}</div>}

          {loading ? (
            <div className="dd-loading-state"><Loader2 size={22} className="dd-spin" /> Searching person records</div>
          ) : results.length === 0 ? (
            <div className="dd-empty-state"><UserCheck size={26} /><h3>No person records found</h3><p>Check the spelling, select another database, or search with fewer names.</p></div>
          ) : (
            <div className="dd-table-wrap dd-person-results-table">
              <table className="dd-data-table">
                <thead><tr><th>Record</th><th>Name / case</th><th>Database</th><th>Published detail</th><th>Source / date</th><th aria-label="Action" /></tr></thead>
                <tbody>{results.map((record) => (
                  <tr key={`${record.source_type}-${record.id}`}>
                    <td><code>{String(record.id).padStart(6, '0')}</code></td>
                    <td><strong>{primaryName(record)}</strong><small>{recordSummary(record)}</small></td>
                    <td><span className="dd-type-label">{record.data_source || SOURCE_LABELS[record.source_type]}</span></td>
                    <td>{recordReference(record)}</td>
                    <td><strong>{recordDate(record)}</strong><small>{record.source_type === 'judgment' ? (record.court_type || 'Court not recorded') : 'Official Gazette'}</small></td>
                    <td>{record.source_type === 'judgment'
                      ? <button type="button" className="dd-icon-text-button" onClick={() => openCase(record)}><Eye size={14} /> Open case</button>
                      : <button type="button" className="dd-icon-text-button" onClick={() => openDetails(record)}><FileText size={14} /> Details</button>}</td>
                  </tr>
                ))}</tbody>
              </table>
            </div>
          )}
        </section>
      )}

      {selectedRecord && (
        <div className="dd-modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) closeDetails(); }}>
          <div className="dd-modal dd-person-detail-modal" role="dialog" aria-modal="true" aria-labelledby="person-detail-title">
            <header>
              <div><h3 id="person-detail-title">{primaryName(recordDetails || selectedRecord)}</h3><p>{selectedRecord.data_source || SOURCE_LABELS[selectedRecord.source_type]} - record {selectedRecord.id}</p></div>
              <button type="button" onClick={closeDetails} aria-label="Close"><X size={17} /></button>
            </header>
            <div className="dd-modal-body">
              {detailLoading ? <div className="dd-loading-state"><Loader2 size={18} className="dd-spin" /> Loading record details</div> : detailError ? <div className="dd-inline-alert is-error">{detailError}</div> : (
                <>
                  <dl className="dd-person-detail-list">{detailFields.map(([key, label, type]) => <div key={key}><dt>{label}</dt><dd>{displayValue(recordDetails?.[key], type)}</dd></div>)}</dl>
                  <div className="dd-modal-actions"><button type="button" className="dd-button dd-button-secondary" onClick={closeDetails}>Close</button><button type="button" className="dd-button dd-button-primary" onClick={downloadDetails}><Download size={14} /> Download text</button></div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default PersonSearchPage;
