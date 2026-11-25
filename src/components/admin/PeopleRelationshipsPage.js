import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Eye,
  Edit3,
  FileText,
  Loader2,
  Plus,
  Search,
  ShieldCheck,
  UserRound,
  UsersRound,
  X,
} from 'lucide-react';
import { apiGet, apiPost, apiPut } from '../../utils/api';
import PersonDetails from './PersonDetails';

const PAGE_SIZE = 25;

const TABS = [
  { id: 'people', label: 'Person index', description: 'Canonical person profiles' },
  { id: 'change_of_name', label: 'Name changes', description: 'Published changes of name' },
  { id: 'correction_of_place_of_birth', label: 'Place of birth', description: 'Published place corrections' },
  { id: 'correction_of_date_of_birth', label: 'Date of birth', description: 'Published date corrections' },
  { id: 'marriage_officers', label: 'Marriage officers', description: 'Published appointments' },
];

const FIELD_CONFIGS = {
  people: {
    title: 'person record',
    endpoint: '/api/people',
    fields: [
      { name: 'first_name', label: 'First name', required: true },
      { name: 'last_name', label: 'Last name', required: true },
      { name: 'full_name', label: 'Display name' },
      { name: 'occupation', label: 'Occupation' },
      { name: 'employer', label: 'Employer' },
      { name: 'phone_number', label: 'Phone' },
      { name: 'email', label: 'Email', type: 'email' },
      { name: 'city', label: 'City' },
      { name: 'region', label: 'Region' },
      { name: 'country', label: 'Country' },
      { name: 'address', label: 'Address', type: 'textarea' },
      { name: 'is_verified', label: 'Record has been reviewed', type: 'checkbox' },
      { name: 'status', label: 'Status', type: 'select', options: ['active', 'inactive', 'archived'] },
      { name: 'notes', label: 'Internal notes', type: 'textarea' },
    ],
  },
  change_of_name: {
    title: 'change of name notice',
    endpoint: '/api/change-of-name',
    numericFields: ['page_number', 'person_id'],
    fields: [
      { name: 'item_number', label: 'Item number', required: true },
      { name: 'old_name', label: 'Previous name', required: true },
      { name: 'new_name', label: 'Current name', required: true },
      { name: 'alias_name', label: 'Alias' },
      { name: 'profession', label: 'Profession' },
      { name: 'gender', label: 'Gender' },
      { name: 'address', label: 'Address', type: 'textarea' },
      { name: 'town_city', label: 'Town / city' },
      { name: 'region', label: 'Region' },
      { name: 'effective_date', label: 'Effective date', type: 'date' },
      { name: 'gazette_number', label: 'Gazette number', required: true },
      { name: 'gazette_date', label: 'Gazette date', type: 'date', required: true },
      { name: 'page_number', label: 'Page', type: 'number' },
      { name: 'document_filename', label: 'Source file', required: true },
      { name: 'source_details', label: 'Source details', type: 'textarea' },
      { name: 'remarks', label: 'Remarks', type: 'textarea' },
      { name: 'person_id', label: 'Linked person ID', type: 'number' },
    ],
  },
  correction_of_place_of_birth: {
    title: 'place of birth correction',
    endpoint: '/api/correction-of-place-of-birth',
    numericFields: ['item_number', 'gazette_number', 'page', 'person_id'],
    fields: [
      { name: 'item_number', label: 'Item number', type: 'number', required: true },
      { name: 'person_name', label: 'Person name', required: true },
      { name: 'alias', label: 'Alias' },
      { name: 'profession', label: 'Profession' },
      { name: 'address', label: 'Address', type: 'textarea' },
      { name: 'gender', label: 'Gender' },
      { name: 'old_place_of_birth', label: 'Previous place of birth' },
      { name: 'new_place_of_birth', label: 'Corrected place of birth' },
      { name: 'effective_date', label: 'Effective date', type: 'date' },
      { name: 'gazette_number', label: 'Gazette number', type: 'number' },
      { name: 'gazette_date', label: 'Gazette date', type: 'date' },
      { name: 'page', label: 'Page', type: 'number' },
      { name: 'document_filename', label: 'Source file', required: true },
      { name: 'source_details', label: 'Source details', type: 'textarea' },
      { name: 'remarks', label: 'Remarks', type: 'textarea' },
      { name: 'person_id', label: 'Linked person ID', type: 'number' },
    ],
  },
  correction_of_date_of_birth: {
    title: 'date of birth correction',
    endpoint: '/api/correction-of-date-of-birth',
    numericFields: ['page', 'person_id'],
    fields: [
      { name: 'item_number', label: 'Item number', required: true },
      { name: 'person_name', label: 'Person name', required: true },
      { name: 'alias', label: 'Alias' },
      { name: 'profession', label: 'Profession' },
      { name: 'address', label: 'Address', type: 'textarea' },
      { name: 'gender', label: 'Gender' },
      { name: 'old_date_of_birth', label: 'Previous date of birth', type: 'date' },
      { name: 'new_date_of_birth', label: 'Corrected date of birth', type: 'date' },
      { name: 'effective_date', label: 'Effective date', type: 'date' },
      { name: 'gazette_number', label: 'Gazette number' },
      { name: 'gazette_date', label: 'Gazette date', type: 'date' },
      { name: 'page', label: 'Page', type: 'number' },
      { name: 'document_filename', label: 'Source file', required: true },
      { name: 'source_details', label: 'Source details', type: 'textarea' },
      { name: 'remarks', label: 'Remarks', type: 'textarea' },
      { name: 'person_id', label: 'Linked person ID', type: 'number' },
    ],
  },
  marriage_officers: {
    title: 'marriage officer appointment',
    endpoint: '/api/marriage-officers',
    numericFields: ['page_number', 'person_id'],
    fields: [
      { name: 'officer_name', label: 'Officer name', required: true },
      { name: 'church', label: 'Church / organisation' },
      { name: 'location', label: 'Location' },
      { name: 'appointing_authority', label: 'Appointing authority' },
      { name: 'appointment_date', label: 'Appointment date', type: 'date' },
      { name: 'gazette_number', label: 'Gazette number' },
      { name: 'gazette_date', label: 'Gazette date', type: 'date' },
      { name: 'page_number', label: 'Page', type: 'number' },
      { name: 'source_details', label: 'Source details', type: 'textarea' },
      { name: 'document_filename', label: 'Source file' },
      { name: 'person_id', label: 'Linked person ID', type: 'number' },
    ],
  },
};

const formatDate = (value) => {
  if (!value) return 'Not recorded';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
};

const formatDateInput = (value) => {
  if (!value) return '';
  if (typeof value === 'string') return value.split('T')[0];
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? '' : date.toISOString().split('T')[0];
};

const displayValue = (value, type) => {
  if (value === null || value === undefined || value === '') return 'Not recorded';
  if (type === 'date') return formatDate(value);
  if (type === 'checkbox') return value ? 'Yes' : 'No';
  if (Array.isArray(value)) return value.length ? value.join(', ') : 'Not recorded';
  return String(value);
};

const recordName = (tab, record) => {
  if (tab === 'change_of_name') return record.new_name || record.old_name;
  if (tab === 'marriage_officers') return record.officer_name;
  return record.person_name;
};

const publication = (record) => [
  record.gazette_number ? `Gazette ${record.gazette_number}` : null,
  record.page_number || record.page ? `p. ${record.page_number || record.page}` : null,
].filter(Boolean).join(' - ') || 'Reference not recorded';

const PeopleRelationshipsPage = ({ userInfo, onNavigate, onLogout }) => {
  const [activeTab, setActiveTab] = useState('people');
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [draftSearch, setDraftSearch] = useState('');
  const [appliedSearch, setAppliedSearch] = useState('');
  const [recordView, setRecordView] = useState('curated');
  const [selectedPerson, setSelectedPerson] = useState(null);
  const [selectedSourceRecord, setSelectedSourceRecord] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [formMode, setFormMode] = useState('create');
  const [formTab, setFormTab] = useState('people');
  const [formData, setFormData] = useState({});
  const [formError, setFormError] = useState('');
  const [formSubmitting, setFormSubmitting] = useState(false);

  const currentTab = useMemo(() => TABS.find((tab) => tab.id === activeTab) || TABS[0], [activeTab]);
  const firstRecord = total ? ((page - 1) * PAGE_SIZE) + 1 : 0;
  const lastRecord = Math.min(page * PAGE_SIZE, total);

  const loadRecords = useCallback(async () => {
    const config = FIELD_CONFIGS[activeTab];
    setLoading(true);
    setError('');
    try {
      const params = { page, limit: PAGE_SIZE };
      if (activeTab === 'people') {
        params.sort_by = 'full_name';
        params.sort_order = 'asc';
        params.person_status = 'active';
        if (appliedSearch) params.query = appliedSearch;
        if (recordView === 'curated') params.record_quality = 'curated';
        if (recordView === 'case_extracted') params.record_quality = 'case_extracted';
        if (recordView === 'unreviewed') params.is_verified = false;
        const response = await apiGet('/api/people/search', params);
        setRecords(response.people || []);
        setTotal(Number(response.total || 0));
        setTotalPages(Number(response.total_pages || 0));
      } else {
        if (appliedSearch) params.search = appliedSearch;
        const response = await apiGet(config.endpoint, params);
        setRecords(response.results || []);
        setTotal(Number(response.total || 0));
        setTotalPages(Number(response.total_pages || 0));
      }
    } catch (requestError) {
      setRecords([]);
      setTotal(0);
      setTotalPages(0);
      setError(requestError.message || 'People records could not be loaded.');
    } finally {
      setLoading(false);
    }
  }, [activeTab, appliedSearch, page, recordView]);

  useEffect(() => {
    loadRecords();
  }, [loadRecords]);

  const changeTab = (tabId) => {
    setActiveTab(tabId);
    setPage(1);
    setDraftSearch('');
    setAppliedSearch('');
    setError('');
  };

  const submitSearch = (event) => {
    event.preventDefault();
    const nextSearch = draftSearch.trim();
    if (page === 1 && nextSearch === appliedSearch) {
      loadRecords();
      return;
    }
    setPage(1);
    setAppliedSearch(nextSearch);
  };

  const clearSearch = () => {
    const shouldReload = page === 1 && !appliedSearch;
    setDraftSearch('');
    setAppliedSearch('');
    setPage(1);
    if (shouldReload) loadRecords();
  };

  const initialFormData = (tabId, record = null) => {
    const config = FIELD_CONFIGS[tabId];
    return config.fields.reduce((data, field) => {
      const value = record?.[field.name];
      if (field.type === 'date') data[field.name] = formatDateInput(value);
      else if (field.type === 'checkbox') data[field.name] = Boolean(value);
      else data[field.name] = value ?? (field.name === 'status' ? 'active' : '');
      return data;
    }, record?.id ? { id: record.id } : {});
  };

  const openForm = (mode, tabId, record = null) => {
    setFormMode(mode);
    setFormTab(tabId);
    setFormData(initialFormData(tabId, record));
    setFormError('');
    setShowForm(true);
  };

  const closeForm = () => {
    if (formSubmitting) return;
    setShowForm(false);
    setFormError('');
  };

  const normalizedFormData = () => {
    const config = FIELD_CONFIGS[formTab];
    const data = { ...formData };
    delete data.id;
    config.fields.forEach((field) => {
      if (field.type !== 'checkbox' && data[field.name] === '') data[field.name] = null;
    });
    config.numericFields?.forEach((fieldName) => {
      if (data[fieldName] !== null && data[fieldName] !== undefined) {
        const number = Number.parseInt(data[fieldName], 10);
        data[fieldName] = Number.isNaN(number) ? data[fieldName] : number;
      }
    });
    if (formTab === 'people' && !data.full_name) {
      data.full_name = [data.first_name, data.last_name].filter(Boolean).join(' ');
    }
    return data;
  };

  const saveRecord = async (event) => {
    event.preventDefault();
    const config = FIELD_CONFIGS[formTab];
    const missing = config.fields.filter((field) => field.required && !formData[field.name]);
    if (missing.length) {
      setFormError(`Complete the required fields: ${missing.map((field) => field.label).join(', ')}.`);
      return;
    }

    setFormSubmitting(true);
    setFormError('');
    try {
      const payload = normalizedFormData();
      if (formMode === 'create') await apiPost(config.endpoint, payload);
      else await apiPut(`${config.endpoint}/${formData.id}`, payload);
      setShowForm(false);
      await loadRecords();
    } catch (requestError) {
      setFormError(requestError.message || 'The record could not be saved.');
    } finally {
      setFormSubmitting(false);
    }
  };

  if (selectedPerson) {
    return (
      <PersonDetails
        person={selectedPerson}
        onBack={() => setSelectedPerson(null)}
        userInfo={userInfo}
        onNavigate={onNavigate}
        onLogout={onLogout}
        onViewRelatedPerson={setSelectedPerson}
      />
    );
  }

  const renderPeopleRows = () => records.map((person) => {
    const location = [person.city, person.region, person.country].filter(Boolean).join(', ');
    const cases = Number(person.total_cases ?? person.case_count ?? 0);
    return (
      <tr key={person.id}>
        <td><code>PER-{String(person.id).padStart(6, '0')}</code></td>
        <td>
          <button type="button" className="dd-person-record-link" onClick={() => setSelectedPerson(person)}>
            <strong>{person.full_name || [person.first_name, person.last_name].filter(Boolean).join(' ') || 'Unnamed person'}</strong>
          </button>
          <small>{[person.occupation, person.employer].filter(Boolean).join(' - ') || 'Occupation not recorded'}</small>
        </td>
        <td><strong>{person.phone_number || 'Not recorded'}</strong><small>{person.email || 'Email not recorded'}</small></td>
        <td><strong>{location || 'Not recorded'}</strong><small>{person.address || 'Address not recorded'}</small></td>
        <td><strong>{cases.toLocaleString()}</strong><small>{cases === 1 ? 'linked case' : 'linked cases'}</small></td>
        <td><span className={`dd-status-badge${person.is_verified ? ' is-active' : ' is-pending'}`}>{person.is_verified ? 'Verified flag' : 'Unreviewed'}</span></td>
        <td className="dd-people-row-actions">
          <button type="button" className="dd-icon-button" onClick={() => setSelectedPerson(person)} title="Open person record" aria-label="Open person record"><Eye size={14} /></button>
          <button type="button" className="dd-icon-button" onClick={() => openForm('edit', 'people', person)} title="Edit person record" aria-label="Edit person record"><Edit3 size={14} /></button>
        </td>
      </tr>
    );
  });

  const renderSourceRows = () => records.map((record) => {
    let publishedDetail = 'Published notice';
    if (activeTab === 'change_of_name') publishedDetail = `${record.old_name || 'Not recorded'} to ${record.new_name || 'Not recorded'}`;
    if (activeTab === 'correction_of_place_of_birth') publishedDetail = `${record.old_place_of_birth || 'Not recorded'} to ${record.new_place_of_birth || 'Not recorded'}`;
    if (activeTab === 'correction_of_date_of_birth') publishedDetail = `${formatDate(record.old_date_of_birth)} to ${formatDate(record.new_date_of_birth)}`;
    if (activeTab === 'marriage_officers') publishedDetail = [record.church, record.location].filter(Boolean).join(', ') || 'Appointment details not recorded';
    return (
      <tr key={record.id}>
        <td><code>{String(record.id).padStart(6, '0')}</code></td>
        <td><strong>{recordName(activeTab, record) || 'Unnamed record'}</strong><small>{record.profession || record.alias || record.alias_name || 'No additional identity detail'}</small></td>
        <td><strong>{publishedDetail}</strong><small>{record.effective_date || record.appointment_date ? `Effective ${formatDate(record.effective_date || record.appointment_date)}` : 'Effective date not recorded'}</small></td>
        <td><strong>{publication(record)}</strong><small>{formatDate(record.gazette_date)}</small></td>
        <td><strong>{record.document_filename || 'Source file not recorded'}</strong><small>{record.source_details || 'Official Gazette record'}</small></td>
        <td className="dd-people-row-actions">
          <button type="button" className="dd-icon-button" onClick={() => setSelectedSourceRecord(record)} title="View source metadata" aria-label="View source metadata"><FileText size={14} /></button>
          <button type="button" className="dd-icon-button" onClick={() => openForm('edit', activeTab, record)} title="Edit source record" aria-label="Edit source record"><Edit3 size={14} /></button>
        </td>
      </tr>
    );
  });

  return (
    <section className="dd-module-shell dd-people-records">
      <div className="dd-module-heading">
        <div>
          <p className="dd-eyebrow">Identity register administration</p>
          <h2>Canonical person register</h2>
          <p>Review person profiles and the Gazette records that support identity changes and appointments.</p>
        </div>
        <div className="dd-heading-actions">
          <span className="dd-count-badge"><UsersRound size={14} /> 5 registers</span>
          <button type="button" className="dd-button dd-button-primary" onClick={() => openForm('create', activeTab)}><Plus size={14} /> Add {activeTab === 'people' ? 'person' : 'notice'}</button>
        </div>
      </div>

      <nav className="dd-record-tabs" aria-label="People record databases">
        {TABS.map((tab) => (
          <button type="button" key={tab.id} className={activeTab === tab.id ? 'is-active' : ''} onClick={() => changeTab(tab.id)}>
            <strong>{tab.label}</strong><small>{tab.description}</small>
          </button>
        ))}
      </nav>

      <section className="dd-enquiry-panel">
        <header>Find records</header>
        <form className="dd-people-filter-form" onSubmit={submitSearch}>
          <label className="dd-people-search-field">
            <span>{activeTab === 'people' ? 'Person name or identifier' : 'Name or publication detail'}</span>
            <div className="dd-input-with-icon"><Search size={14} /><input value={draftSearch} onChange={(event) => setDraftSearch(event.target.value)} placeholder={activeTab === 'people' ? 'Search canonical people' : `Search ${currentTab.label.toLowerCase()}`} /></div>
          </label>
          {activeTab === 'people' && (
            <label>
              <span>Record view</span>
              <select className="dd-select-control" value={recordView} onChange={(event) => { setRecordView(event.target.value); setPage(1); }}>
                <option value="curated">Likely person profiles</option>
                <option value="case_extracted">Case-extracted profiles</option>
                <option value="unreviewed">Unreviewed imports</option>
                <option value="all">All active records</option>
              </select>
            </label>
          )}
          <div className="dd-people-filter-actions">
            <button type="submit" className="dd-button dd-button-primary" disabled={loading}>{loading ? <Loader2 size={14} className="dd-spin" /> : <Search size={14} />} Search</button>
            <button type="button" className="dd-button dd-button-secondary" onClick={clearSearch} disabled={!draftSearch && !appliedSearch}><X size={14} /> Clear</button>
          </div>
        </form>
      </section>

      {activeTab === 'people' && (
        <div className="dd-inline-alert is-info">
          <span><ShieldCheck size={14} /> Likely person profiles exclude obvious case-text fragments and the legacy automated extraction batch. Every imported row remains available in the other record views and no data is removed.</span>
        </div>
      )}

      {error && <div className="dd-inline-alert is-error"><span>{error}</span><button type="button" onClick={() => setError('')} aria-label="Dismiss"><X size={14} /></button></div>}

      <section className="dd-enquiry-results" aria-live="polite">
        <header>
          <h2>{currentTab.label} <span>{total.toLocaleString()}</span></h2>
          <div>
            <span>Records {firstRecord}-{lastRecord} of {total.toLocaleString()}</span>
            <button type="button" disabled={loading || page <= 1} onClick={() => setPage((value) => Math.max(1, value - 1))}><ChevronLeft size={14} /> Prev</button>
            <button type="button" disabled={loading || page >= totalPages} onClick={() => setPage((value) => Math.min(totalPages, value + 1))}>Next <ChevronRight size={14} /></button>
          </div>
        </header>

        {loading ? (
          <div className="dd-loading-state"><Loader2 size={22} className="dd-spin" /> Loading {currentTab.label.toLowerCase()}</div>
        ) : records.length === 0 ? (
          <div className="dd-empty-state"><UserRound size={26} /><h3>No matching records</h3><p>Change the search or record view to inspect another part of the register.</p></div>
        ) : (
          <div className="dd-table-wrap dd-people-records-table">
            <table className="dd-data-table">
              <thead>{activeTab === 'people'
                ? <tr><th>Person ID</th><th>Name / occupation</th><th>Contact</th><th>Location</th><th>Cases</th><th>Review</th><th aria-label="Actions" /></tr>
                : <tr><th>Record</th><th>Person</th><th>Published detail</th><th>Gazette</th><th>Source metadata</th><th aria-label="Actions" /></tr>}
              </thead>
              <tbody>{activeTab === 'people' ? renderPeopleRows() : renderSourceRows()}</tbody>
            </table>
          </div>
        )}
      </section>

      {selectedSourceRecord && (
        <div className="dd-modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setSelectedSourceRecord(null); }}>
          <div className="dd-modal dd-person-detail-modal" role="dialog" aria-modal="true" aria-labelledby="source-record-title">
            <header><div><h3 id="source-record-title">{recordName(activeTab, selectedSourceRecord) || 'Source record'}</h3><p>{currentTab.label} - record {selectedSourceRecord.id}</p></div><button type="button" onClick={() => setSelectedSourceRecord(null)} aria-label="Close"><X size={17} /></button></header>
            <div className="dd-modal-body">
              <dl className="dd-person-detail-list">{FIELD_CONFIGS[activeTab].fields.map((field) => <div key={field.name}><dt>{field.label}</dt><dd>{displayValue(selectedSourceRecord[field.name], field.type)}</dd></div>)}</dl>
              <div className="dd-modal-actions"><button type="button" className="dd-button dd-button-secondary" onClick={() => setSelectedSourceRecord(null)}>Close</button><button type="button" className="dd-button dd-button-primary" onClick={() => { const record = selectedSourceRecord; setSelectedSourceRecord(null); openForm('edit', activeTab, record); }}><Edit3 size={14} /> Edit record</button></div>
            </div>
          </div>
        </div>
      )}

      {showForm && (
        <div className="dd-modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) closeForm(); }}>
          <div className="dd-modal dd-person-record-form" role="dialog" aria-modal="true" aria-labelledby="person-form-title">
            <header><div><h3 id="person-form-title">{formMode === 'create' ? 'Add' : 'Edit'} {FIELD_CONFIGS[formTab].title}</h3><p>Required fields are marked with an asterisk.</p></div><button type="button" onClick={closeForm} aria-label="Close"><X size={17} /></button></header>
            <form className="dd-modal-body" onSubmit={saveRecord}>
              {formError && <div className="dd-inline-alert is-error">{formError}</div>}
              <div className="dd-person-record-form-grid">
                {FIELD_CONFIGS[formTab].fields.map((field) => (
                  <label key={field.name} className={field.type === 'textarea' ? 'is-wide' : ''}>
                    {field.type === 'checkbox' ? (
                      <span className="dd-checkbox-field"><input type="checkbox" checked={Boolean(formData[field.name])} onChange={(event) => setFormData((current) => ({ ...current, [field.name]: event.target.checked }))} /> {field.label}</span>
                    ) : (
                      <>
                        <span>{field.label}{field.required ? ' *' : ''}</span>
                        {field.type === 'textarea' ? <textarea rows={3} value={formData[field.name] ?? ''} onChange={(event) => setFormData((current) => ({ ...current, [field.name]: event.target.value }))} />
                          : field.type === 'select' ? <select value={formData[field.name] ?? ''} onChange={(event) => setFormData((current) => ({ ...current, [field.name]: event.target.value }))}>{field.options.map((option) => <option key={option} value={option}>{option}</option>)}</select>
                            : <input type={field.type || 'text'} value={formData[field.name] ?? ''} onChange={(event) => setFormData((current) => ({ ...current, [field.name]: event.target.value }))} />}
                      </>
                    )}
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

export default PeopleRelationshipsPage;
