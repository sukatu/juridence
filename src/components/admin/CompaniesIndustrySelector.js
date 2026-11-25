import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  BadgeCheck,
  Building2,
  ChevronLeft,
  ChevronRight,
  Edit3,
  Eye,
  Landmark,
  Loader2,
  Newspaper,
  Plus,
  Search,
  ShieldCheck,
  ShieldPlus,
  X,
} from 'lucide-react';
import { apiGet, apiPost, apiPut } from '../../utils/api';

const PAGE_SIZE = 25;

const TABS = [
  { id: 'companies', label: 'Company register', description: 'Canonical corporate entities', icon: Building2 },
  { id: 'banks', label: 'Banks', description: 'Licensed banking institutions', icon: Landmark },
  { id: 'insurance', label: 'Insurers', description: 'Insurance and assurance firms', icon: ShieldPlus },
  { id: 'lifecycle', label: 'Registrar notices', description: 'Published lifecycle events', icon: Newspaper },
];

const NOTICE_TYPES = [
  ['COMPANY_STRIKE_OFF_INTENTION', 'Intended strike-off'],
  ['COMPANY_DISSOLUTION', 'Dissolution'],
  ['COMPANY_LIQUIDATION', 'Liquidation'],
  ['COMPANY_WINDING_UP', 'Winding up'],
  ['COMPANY_INCORPORATION', 'Incorporation'],
  ['COMPANY_CHANGE_OF_NAME', 'Change of name'],
  ['COMPANY_CESSATION_OF_BUSINESS', 'Cessation of business'],
];

const DATA_CONFIG = {
  companies: {
    endpoint: '/api/companies/search',
    resultKey: 'results',
    queryParam: 'query',
    params: { is_active: true },
    emptyMessage: 'No companies match this search.',
  },
  banks: {
    endpoint: '/api/banks/search',
    resultKey: 'banks',
    queryParam: 'query',
    params: { sort_by: 'name', sort_order: 'asc' },
    emptyMessage: 'No banks match this search.',
  },
  insurance: {
    endpoint: '/api/insurance/search',
    resultKey: 'insurance',
    queryParam: 'query',
    params: { sort_by: 'name', sort_order: 'asc' },
    emptyMessage: 'No insurers match this search.',
  },
  lifecycle: {
    endpoint: '/api/company-lifecycle/notices',
    resultKey: 'notices',
    queryParam: 'q',
    params: { min_confidence: 0 },
    emptyMessage: 'No Registrar notices match these filters.',
  },
};

const FORM_CONFIG = {
  companies: {
    singular: 'company',
    endpoint: '/api/companies',
    fields: [
      { name: 'name', label: 'Registered name', required: true },
      { name: 'short_name', label: 'Short name' },
      { name: 'former_name', label: 'Former name' },
      { name: 'registration_number', label: 'Registration number' },
      { name: 'tin_number', label: 'Tax identification number' },
      { name: 'company_type', label: 'Company type' },
      { name: 'industry', label: 'Industry' },
      { name: 'ownership_type', label: 'Ownership type' },
      { name: 'city', label: 'City' },
      { name: 'region', label: 'Region' },
      { name: 'country', label: 'Country' },
      { name: 'phone', label: 'Phone' },
      { name: 'email', label: 'Email', type: 'email' },
      { name: 'website', label: 'Website', type: 'url' },
      { name: 'address', label: 'Registered address', type: 'textarea' },
      { name: 'description', label: 'Business description', type: 'textarea' },
    ],
  },
  banks: {
    singular: 'bank',
    endpoint: '/api/banks',
    fields: [
      { name: 'name', label: 'Registered name', required: true },
      { name: 'short_name', label: 'Short name' },
      { name: 'former_name', label: 'Former name' },
      { name: 'bank_code', label: 'Bank code' },
      { name: 'swift_code', label: 'SWIFT code' },
      { name: 'license_number', label: 'Licence number' },
      { name: 'bank_type', label: 'Bank type' },
      { name: 'ownership_type', label: 'Ownership type' },
      { name: 'date_of_incorporation', label: 'Date of incorporation', type: 'date' },
      { name: 'city', label: 'City' },
      { name: 'region', label: 'Region' },
      { name: 'country', label: 'Country' },
      { name: 'phone', label: 'Phone' },
      { name: 'email', label: 'Email', type: 'email' },
      { name: 'website', label: 'Website', type: 'url' },
      { name: 'head_office_address', label: 'Head office address', type: 'textarea' },
      { name: 'description', label: 'Institution description', type: 'textarea' },
    ],
  },
  insurance: {
    singular: 'insurer',
    endpoint: '/api/insurance',
    fields: [
      { name: 'name', label: 'Registered name', required: true },
      { name: 'short_name', label: 'Short name' },
      { name: 'former_name', label: 'Former name' },
      { name: 'license_number', label: 'Licence number' },
      { name: 'registration_number', label: 'Registration number' },
      { name: 'insurance_type', label: 'Insurance type' },
      { name: 'ownership_type', label: 'Ownership type' },
      { name: 'date_of_incorporation', label: 'Date of incorporation', type: 'date' },
      { name: 'city', label: 'City' },
      { name: 'region', label: 'Region' },
      { name: 'country', label: 'Country' },
      { name: 'phone', label: 'Phone' },
      { name: 'email', label: 'Email', type: 'email' },
      { name: 'website', label: 'Website', type: 'url' },
      { name: 'head_office_address', label: 'Head office address', type: 'textarea' },
      { name: 'description', label: 'Institution description', type: 'textarea' },
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
  if (typeof value === 'boolean') return value ? 'Yes' : 'No';
  if (Array.isArray(value)) return value.length ? value.join(', ') : 'Not recorded';
  return String(value);
};

const formatId = (prefix, id) => `${prefix}-${String(id).padStart(6, '0')}`;

const humanize = (value) => {
  if (!value) return 'Not recorded';
  return String(value)
    .replace(/^COMPANY_/, '')
    .replaceAll('_', ' ')
    .toLowerCase()
    .replace(/(^|\s)\S/g, (character) => character.toUpperCase());
};

const locationLabel = (record) => (
  [record.city, record.region, record.country].filter(Boolean).join(', ') || 'Location not recorded'
);

const statusClass = (value) => {
  const status = String(value || '').toLowerCase();
  if (status.includes('inactive') || status.includes('dissolved') || status.includes('closed')) return 'is-error';
  if (status.includes('review') || status.includes('pending')) return 'is-review';
  if (status.includes('active') || status.includes('verified') || status.includes('approved')) return 'is-clear';
  return '';
};

const lifecycleEventDate = (record) => (
  record.effective_date
  || record.event_date
  || record.dissolution_date
  || record.strike_off_date
  || record.winding_up_date
  || record.liquidation_date
  || record.cessation_date
  || record.incorporation_date
);

const CompaniesIndustrySelector = () => {
  const [activeTab, setActiveTab] = useState('companies');
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [draftSearch, setDraftSearch] = useState('');
  const [appliedSearch, setAppliedSearch] = useState('');
  const [noticeType, setNoticeType] = useState('');
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [formMode, setFormMode] = useState('create');
  const [formTab, setFormTab] = useState('companies');
  const [formData, setFormData] = useState({});
  const [formError, setFormError] = useState('');
  const [formSubmitting, setFormSubmitting] = useState(false);

  const currentTab = useMemo(() => TABS.find((tab) => tab.id === activeTab) || TABS[0], [activeTab]);
  const firstRecord = total ? ((page - 1) * PAGE_SIZE) + 1 : 0;
  const lastRecord = Math.min(page * PAGE_SIZE, total);

  const loadRecords = useCallback(async () => {
    const config = DATA_CONFIG[activeTab];
    setLoading(true);
    setError('');
    try {
      const params = { page, limit: PAGE_SIZE, ...config.params };
      if (appliedSearch) params[config.queryParam] = appliedSearch;
      if (activeTab === 'lifecycle' && noticeType) params.notice_type = noticeType;
      const response = await apiGet(config.endpoint, params);
      setRecords(response[config.resultKey] || []);
      setTotal(Number(response.total || 0));
      setTotalPages(Number(response.total_pages || 0));
    } catch (requestError) {
      setRecords([]);
      setTotal(0);
      setTotalPages(0);
      setError(requestError.message || 'Company records could not be loaded.');
    } finally {
      setLoading(false);
    }
  }, [activeTab, appliedSearch, noticeType, page]);

  useEffect(() => {
    loadRecords();
  }, [loadRecords]);

  const changeTab = (tabId) => {
    setActiveTab(tabId);
    setPage(1);
    setDraftSearch('');
    setAppliedSearch('');
    setNoticeType('');
    setSelectedRecord(null);
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

  const clearFilters = () => {
    const shouldReload = page === 1 && !appliedSearch && !noticeType;
    setDraftSearch('');
    setAppliedSearch('');
    setNoticeType('');
    setPage(1);
    if (shouldReload) loadRecords();
  };

  const openForm = (mode, tabId, record = null) => {
    const config = FORM_CONFIG[tabId];
    if (!config) return;
    const nextData = config.fields.reduce((data, field) => {
      const value = record?.[field.name];
      if (field.type === 'date') data[field.name] = formatDateInput(value);
      else if (value !== null && value !== undefined) data[field.name] = value;
      else data[field.name] = field.name === 'country' ? 'Ghana' : '';
      return data;
    }, record?.id ? { id: record.id } : {});
    setFormMode(mode);
    setFormTab(tabId);
    setFormData(nextData);
    setFormError('');
    setShowForm(true);
  };

  const closeForm = () => {
    if (formSubmitting) return;
    setShowForm(false);
    setFormError('');
  };

  const saveRecord = async (event) => {
    event.preventDefault();
    const config = FORM_CONFIG[formTab];
    const missingFields = config.fields.filter((field) => field.required && !String(formData[field.name] || '').trim());
    if (missingFields.length) {
      setFormError(`Complete the required fields: ${missingFields.map((field) => field.label).join(', ')}.`);
      return;
    }

    const payload = { ...formData };
    delete payload.id;
    config.fields.forEach((field) => {
      if (payload[field.name] === '') payload[field.name] = null;
    });

    setFormSubmitting(true);
    setFormError('');
    try {
      if (formMode === 'create') await apiPost(`${config.endpoint}/`, payload);
      else await apiPut(`${config.endpoint}/${formData.id}`, payload);
      setShowForm(false);
      await loadRecords();
    } catch (requestError) {
      setFormError(requestError.message || `The ${config.singular} record could not be saved.`);
    } finally {
      setFormSubmitting(false);
    }
  };

  const detailRows = (record) => {
    if (activeTab === 'companies') {
      return [
        ['Entity ID', formatId('CO', record.id)],
        ['Registered name', record.name],
        ['Former name', record.former_name],
        ['Short name', record.short_name],
        ['Registration number', record.registration_number],
        ['Tax identification number', record.tax_identification_number || record.tin_number],
        ['Company type', record.type_of_company || record.company_type],
        ['Industry', record.industry],
        ['Nature of business', record.nature_of_business],
        ['Ownership type', record.ownership_type],
        ['Date of incorporation', formatDate(record.date_of_incorporation || record.established_date)],
        ['Location', locationLabel(record)],
        ['Registered address', record.address || record.head_office_address],
        ['Phone', record.phone_number || record.phone],
        ['Email', record.email],
        ['Website', record.website],
        ['Status', record.status],
        ['Verified', record.is_verified],
        ['Last updated', formatDate(record.updated_at)],
      ];
    }
    if (activeTab === 'banks') {
      return [
        ['Institution ID', formatId('BK', record.id)],
        ['Registered name', record.name],
        ['Former name', record.former_name],
        ['Bank code', record.bank_code],
        ['SWIFT code', record.swift_code],
        ['Licence number', record.license_number],
        ['Bank type', record.bank_type],
        ['Ownership type', record.ownership_type],
        ['Date of incorporation', formatDate(record.date_of_incorporation || record.established_date)],
        ['Location', locationLabel(record)],
        ['Head office', record.head_office_address || record.address],
        ['Phone', record.customer_service_phone || record.phone],
        ['Email', record.customer_service_email || record.email],
        ['Website', record.website],
        ['Branches', record.branches_count],
        ['Status', record.status],
        ['Verified', record.is_verified],
        ['Last updated', formatDate(record.updated_at)],
      ];
    }
    if (activeTab === 'insurance') {
      return [
        ['Institution ID', formatId('IN', record.id)],
        ['Registered name', record.name],
        ['Former name', record.former_name],
        ['Licence number', record.license_number],
        ['Registration number', record.registration_number],
        ['Insurance type', record.insurance_type],
        ['Ownership type', record.ownership_type],
        ['Date of incorporation', formatDate(record.date_of_incorporation || record.established_date)],
        ['Location', locationLabel(record)],
        ['Head office', record.head_office_address || record.address],
        ['Phone', record.customer_service_phone || record.phone],
        ['Email', record.customer_service_email || record.email],
        ['Website', record.website],
        ['Branches', record.branches_count],
        ['Status', record.status],
        ['Verified', record.is_verified],
        ['Last updated', formatDate(record.updated_at)],
      ];
    }
    return [
      ['Notice ID', formatId('LC', record.id)],
      ['Notice type', humanize(record.notice_type)],
      ['Company name', record.company_name],
      ['Previous company name', record.old_company_name],
      ['New company name', record.new_company_name],
      ['Registration number', record.registration_number],
      ['Notice reference', record.notice_reference],
      ['Source item', record.source_item_number],
      ['Publication date', formatDate(record.publication_date)],
      ['Event date', formatDate(record.event_date)],
      ['Effective date', formatDate(record.effective_date)],
      ['Incorporation date', formatDate(record.incorporation_date)],
      ['Dissolution date', formatDate(record.dissolution_date)],
      ['Strike-off date', formatDate(record.strike_off_date)],
      ['Objection deadline', formatDate(record.objection_deadline)],
      ['Winding-up date', formatDate(record.winding_up_date)],
      ['Liquidation date', formatDate(record.liquidation_date)],
      ['Cessation date', formatDate(record.cessation_date)],
      ['Statutory section', record.statutory_section],
      ['Act reference', record.act_reference],
      ['Registrar', record.registrar_name],
      ['Liquidator', record.liquidator_name],
      ['Registered address', record.registered_address],
      ['Review status', humanize(record.review_status)],
      ['Verified', record.is_verified],
      ['Extraction confidence', `${Math.round(Number(record.extraction_confidence || 0) * 100)}%`],
      ['Source authority', record.source?.source_authority],
      ['Publication', [record.source?.publication_title, record.source?.volume_number].filter(Boolean).join(' - ')],
      ['Source file', record.source?.source_filename],
      ['Source page', record.source_page],
      ['Captured', formatDate(record.source?.captured_at || record.source?.imported_at)],
    ];
  };

  const renderActions = (record) => (
    <td className="dd-company-row-actions">
      <button type="button" className="dd-icon-button" onClick={() => setSelectedRecord(record)} title="Open record" aria-label="Open record"><Eye size={14} /></button>
      {activeTab !== 'lifecycle' && <button type="button" className="dd-icon-button" onClick={() => openForm('edit', activeTab, record)} title="Edit record" aria-label="Edit record"><Edit3 size={14} /></button>}
    </td>
  );

  const renderRows = () => records.map((record) => {
    if (activeTab === 'companies') {
      return (
        <tr key={record.id}>
          <td><code>{formatId('CO', record.id)}</code></td>
          <td><button type="button" className="dd-company-record-link" onClick={() => setSelectedRecord(record)}><strong>{record.name || 'Unnamed company'}</strong></button><small>{record.former_name ? `Formerly ${record.former_name}` : record.short_name || 'No former name recorded'}</small></td>
          <td><strong>{record.registration_number || 'Not recorded'}</strong><small>{record.tax_identification_number || record.tin_number ? `TIN ${record.tax_identification_number || record.tin_number}` : 'TIN not recorded'}</small></td>
          <td><strong>{record.type_of_company || record.company_type || 'Not classified'}</strong><small>{record.industry || record.nature_of_business || 'Industry not recorded'}</small></td>
          <td><strong>{locationLabel(record)}</strong><small>{record.address || record.head_office_address || 'Address not recorded'}</small></td>
          <td><span className={`dd-status-pill ${statusClass(record.status || 'active')}`}>{record.status || (record.is_active ? 'Active' : 'Inactive')}</span><small>{record.is_verified ? 'Verified record' : 'Not verified'}</small></td>
          {renderActions(record)}
        </tr>
      );
    }
    if (activeTab === 'banks') {
      return (
        <tr key={record.id}>
          <td><code>{formatId('BK', record.id)}</code></td>
          <td><button type="button" className="dd-company-record-link" onClick={() => setSelectedRecord(record)}><strong>{record.name || 'Unnamed bank'}</strong></button><small>{record.former_name ? `Formerly ${record.former_name}` : record.short_name || 'Licensed banking institution'}</small></td>
          <td><strong>{record.bank_code ? `Code ${record.bank_code}` : 'Code not recorded'}</strong><small>{record.license_number || record.swift_code || 'Licence not recorded'}</small></td>
          <td><strong>{record.bank_type || 'Bank type not recorded'}</strong><small>{record.ownership_type || 'Ownership not recorded'}</small></td>
          <td><strong>{locationLabel(record)}</strong><small>{record.head_office_address || record.address || 'Head office not recorded'}</small></td>
          <td><span className={`dd-status-pill ${statusClass(record.status || 'active')}`}>{record.status || (record.is_active ? 'Active' : 'Inactive')}</span><small>{record.is_verified ? 'Verified record' : 'Not verified'}</small></td>
          {renderActions(record)}
        </tr>
      );
    }
    if (activeTab === 'insurance') {
      return (
        <tr key={record.id}>
          <td><code>{formatId('IN', record.id)}</code></td>
          <td><button type="button" className="dd-company-record-link" onClick={() => setSelectedRecord(record)}><strong>{record.name || 'Unnamed insurer'}</strong></button><small>{record.former_name ? `Formerly ${record.former_name}` : record.short_name || 'Insurance institution'}</small></td>
          <td><strong>{record.license_number || 'Licence not recorded'}</strong><small>{record.registration_number ? `Registration ${record.registration_number}` : 'Registration not recorded'}</small></td>
          <td><strong>{record.insurance_type || 'Insurance type not recorded'}</strong><small>{record.ownership_type || 'Ownership not recorded'}</small></td>
          <td><strong>{locationLabel(record)}</strong><small>{record.head_office_address || record.address || 'Head office not recorded'}</small></td>
          <td><span className={`dd-status-pill ${statusClass(record.status || 'active')}`}>{record.status || (record.is_active ? 'Active' : 'Inactive')}</span><small>{record.is_verified ? 'Verified record' : 'Not verified'}</small></td>
          {renderActions(record)}
        </tr>
      );
    }
    return (
      <tr key={record.id}>
        <td><code>{formatId('LC', record.id)}</code></td>
        <td><button type="button" className="dd-company-record-link" onClick={() => setSelectedRecord(record)}><strong>{record.company_name || 'Unnamed company'}</strong></button><small>{record.old_company_name && record.new_company_name ? `${record.old_company_name} to ${record.new_company_name}` : record.registration_number || 'Registration not recorded'}</small></td>
        <td><strong>{humanize(record.notice_type)}</strong><small>{record.notice_reference || record.statutory_section || 'Reference not recorded'}</small></td>
        <td><strong>{formatDate(lifecycleEventDate(record))}</strong><small>Published {formatDate(record.publication_date)}</small></td>
        <td><strong>{record.source?.publication_title || 'Companies Bulletin'}</strong><small>{record.source?.source_filename || 'Source file not recorded'}{record.source_page ? ` - p. ${record.source_page}` : ''}</small></td>
        <td><span className={`dd-status-pill ${statusClass(record.review_status)}`}>{humanize(record.review_status)}</span><small>{Math.round(Number(record.extraction_confidence || 0) * 100)}% extraction confidence</small></td>
        {renderActions(record)}
      </tr>
    );
  });

  const EmptyIcon = activeTab === 'lifecycle' ? Newspaper : Building2;
  const formConfig = FORM_CONFIG[formTab];

  return (
    <section className="dd-module-shell dd-company-register">
      <div className="dd-module-heading">
        <div>
          <p className="dd-eyebrow">Entity register administration</p>
          <h2>Company records</h2>
          <p>Review canonical companies, regulated institutions and Registrar events affecting corporate standing.</p>
        </div>
        <div className="dd-heading-actions">
          <span className="dd-count-badge"><Building2 size={14} /> 4 registers</span>
          {activeTab !== 'lifecycle' && <button type="button" className="dd-button dd-button-primary" onClick={() => openForm('create', activeTab)}><Plus size={14} /> Add {FORM_CONFIG[activeTab].singular}</button>}
        </div>
      </div>

      <nav className="dd-record-tabs dd-company-tabs" aria-label="Company record databases">
        {TABS.map((tab) => {
          const TabIcon = tab.icon;
          return <button type="button" key={tab.id} className={activeTab === tab.id ? 'is-active' : ''} onClick={() => changeTab(tab.id)}><TabIcon size={14} /><span className="dd-company-tab-copy"><strong>{tab.label}</strong><small>{tab.description}</small></span></button>;
        })}
      </nav>

      <section className="dd-enquiry-panel">
        <header>Find records</header>
        <form className={`dd-company-filter-form ${activeTab === 'lifecycle' ? '' : 'is-compact'}`} onSubmit={submitSearch}>
          <label className="dd-company-search-field">
            <span>{activeTab === 'lifecycle' ? 'Company name or registration number' : 'Name, registration or licence'}</span>
            <div className="dd-input-with-icon"><Search size={14} /><input value={draftSearch} onChange={(event) => setDraftSearch(event.target.value)} placeholder={`Search ${currentTab.label.toLowerCase()}`} /></div>
          </label>
          {activeTab === 'lifecycle' && (
            <label>
              <span>Notice type</span>
              <select className="dd-select-control" value={noticeType} onChange={(event) => { setNoticeType(event.target.value); setPage(1); }}>
                <option value="">All lifecycle events</option>
                {NOTICE_TYPES.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
              </select>
            </label>
          )}
          <div className="dd-company-filter-actions">
            <button type="submit" className="dd-button dd-button-primary" disabled={loading}>{loading ? <Loader2 size={14} className="dd-spin" /> : <Search size={14} />} Search</button>
            <button type="button" className="dd-button dd-button-secondary" onClick={clearFilters} disabled={!draftSearch && !appliedSearch && !noticeType}><X size={14} /> Clear</button>
          </div>
        </form>
      </section>

      <div className="dd-inline-alert is-info dd-company-register-note">
        <ShieldCheck size={15} />
        <span>Opening, filtering and paging through records does not alter them. Registrar notices retain their bulletin authority, publication date, source file and page for traceability.</span>
      </div>

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
          <div className="dd-empty-state"><EmptyIcon size={27} /><h3>No matching records</h3><p>{DATA_CONFIG[activeTab].emptyMessage}</p></div>
        ) : (
          <div className="dd-table-wrap dd-company-register-table">
            <table className="dd-data-table">
              <thead>{activeTab === 'lifecycle'
                ? <tr><th>Record</th><th>Company</th><th>Lifecycle event</th><th>Event / publication</th><th>Source metadata</th><th>Review</th><th aria-label="Actions" /></tr>
                : <tr><th>Entity ID</th><th>Registered entity</th><th>Registration / licence</th><th>Classification</th><th>Location</th><th>Status</th><th aria-label="Actions" /></tr>}
              </thead>
              <tbody>{renderRows()}</tbody>
            </table>
          </div>
        )}
      </section>

      {selectedRecord && (
        <div className="dd-modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setSelectedRecord(null); }}>
          <div className="dd-modal dd-company-detail-modal" role="dialog" aria-modal="true" aria-labelledby="company-record-title">
            <header>
              <div><h3 id="company-record-title">{selectedRecord.name || selectedRecord.company_name || 'Company record'}</h3><p>{currentTab.label} - record {selectedRecord.id}</p></div>
              <button type="button" onClick={() => setSelectedRecord(null)} aria-label="Close"><X size={17} /></button>
            </header>
            <div className="dd-modal-body">
              <div className="dd-company-detail-summary"><span><BadgeCheck size={17} /></span><div><strong>{activeTab === 'lifecycle' ? humanize(selectedRecord.notice_type) : selectedRecord.status || 'Record available'}</strong><small>{activeTab === 'lifecycle' ? 'Official Registrar publication metadata' : `${currentTab.label} master record`}</small></div></div>
              <dl className="dd-person-detail-list">{detailRows(selectedRecord).map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{displayValue(value)}</dd></div>)}</dl>
              <div className="dd-modal-actions">
                <button type="button" className="dd-button dd-button-secondary" onClick={() => setSelectedRecord(null)}>Close</button>
                {activeTab !== 'lifecycle' && <button type="button" className="dd-button dd-button-primary" onClick={() => { const record = selectedRecord; setSelectedRecord(null); openForm('edit', activeTab, record); }}><Edit3 size={14} /> Edit record</button>}
              </div>
            </div>
          </div>
        </div>
      )}

      {showForm && formConfig && (
        <div className="dd-modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) closeForm(); }}>
          <div className="dd-modal dd-company-record-form" role="dialog" aria-modal="true" aria-labelledby="company-form-title">
            <header><div><h3 id="company-form-title">{formMode === 'create' ? 'Add' : 'Edit'} {formConfig.singular}</h3><p>Maintain the master record without changing imported source notices.</p></div><button type="button" onClick={closeForm} aria-label="Close"><X size={17} /></button></header>
            <form className="dd-modal-body" onSubmit={saveRecord}>
              {formError && <div className="dd-inline-alert is-error">{formError}</div>}
              <div className="dd-company-record-form-grid">
                {formConfig.fields.map((field) => (
                  <label key={field.name} className={field.type === 'textarea' ? 'is-wide' : ''}>
                    <span>{field.label}{field.required ? ' *' : ''}</span>
                    {field.type === 'textarea'
                      ? <textarea rows={3} value={formData[field.name] ?? ''} onChange={(event) => setFormData((current) => ({ ...current, [field.name]: event.target.value }))} />
                      : <input type={field.type || 'text'} value={formData[field.name] ?? ''} onChange={(event) => setFormData((current) => ({ ...current, [field.name]: event.target.value }))} />}
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

export default CompaniesIndustrySelector;
