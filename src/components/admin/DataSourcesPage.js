import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  AlertTriangle,
  BookOpenCheck,
  CalendarDays,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Database,
  Eye,
  FileCheck2,
  FileText,
  FileUp,
  Fingerprint,
  HardDrive,
  Loader2,
  RefreshCw,
  Search,
  ShieldCheck,
  TableProperties,
  X,
} from 'lucide-react';
import { apiGet } from '../../utils/api';

const PUBLICATION_PAGE_SIZE = 15;
const REGISTER_PAGE_SIZE = 20;

const REGISTRAR_DATASETS = [
  { type: 'COMPANY_INCORPORATION', label: 'Company incorporation' },
  { type: 'COMPANY_CHANGE_OF_NAME', label: 'Change of company name' },
  { type: 'COMPANY_STRIKE_OFF_INTENTION', label: 'Intention to strike off' },
  { type: 'COMPANY_WINDING_UP', label: 'Company winding up' },
  { type: 'COMPANY_LIQUIDATION', label: 'Company liquidation' },
  { type: 'COMPANY_DISSOLUTION', label: 'Company dissolution' },
  { type: 'COMPANY_CESSATION_OF_BUSINESS', label: 'Cessation of external business' },
];

const DATABASE_META = {
  subjects: {
    category: 'Entity index',
    authority: 'Juridence normalized entity index',
    jurisdiction: 'Ghana',
    description: 'Canonical people, companies, banks and insurers available to entity enquiry.',
  },
  cases: {
    category: 'Court records',
    authority: 'Judicial records and participating institutions',
    jurisdiction: 'Ghana',
    description: 'Pending court cases and decided judgments indexed for party and suit-number search.',
  },
  gazette: {
    category: 'Official Gazette',
    authority: 'Ghana Publishing Company Limited',
    jurisdiction: 'Ghana',
    description: 'Published Gazette notices with source filenames, item references and captured dates.',
  },
  lifecycle: {
    category: 'Company register',
    authority: 'Office of the Registrar of Companies, Ghana',
    jurisdiction: 'Ghana',
    description: 'Company lifecycle notices extracted from Companies Bulletin publications.',
  },
};

const formatNumber = (value) => Number(value || 0).toLocaleString();

const formatDate = (value, includeTime = false) => {
  if (!value) return 'Not recorded';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return includeTime
    ? date.toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' })
    : date.toLocaleDateString('en-GB', { dateStyle: 'medium' });
};

const formatBytes = (value) => {
  const bytes = Number(value || 0);
  if (!bytes) return 'Not recorded';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const displayValue = (value) => (
  value === null || value === undefined || value === '' ? 'Not recorded' : String(value)
);

const humanize = (value) => {
  if (!value) return 'Not recorded';
  return String(value)
    .replaceAll('_', ' ')
    .replaceAll('-', ' ')
    .toLowerCase()
    .replace(/(^|\s)\S/g, (character) => character.toUpperCase());
};

const sourceRecordId = (id) => `SRC-${String(id).padStart(4, '0')}`;

const statusClass = (status) => {
  const normalized = String(status || '').toLowerCase();
  if (['available', 'published', 'imported', 'indexed', 'verified'].some((value) => normalized.includes(value))) return 'is-clear';
  if (['failed', 'error', 'rejected', 'unavailable'].some((value) => normalized.includes(value))) return 'is-error';
  return 'is-review';
};

const DataSourcesPage = ({ onNavigate, canManageSources = false }) => {
  const [overview, setOverview] = useState(null);
  const [searchStats, setSearchStats] = useState(null);
  const [lifecycleStats, setLifecycleStats] = useState(null);
  const [gazetteStats, setGazetteStats] = useState(null);
  const [repositoryStats, setRepositoryStats] = useState(null);
  const [bulletinSources, setBulletinSources] = useState([]);
  const [activeView, setActiveView] = useState('coverage');
  const [registerSearch, setRegisterSearch] = useState('');
  const [registerType, setRegisterType] = useState('');
  const [registerStatus, setRegisterStatus] = useState('');
  const [registerPage, setRegisterPage] = useState(1);
  const [publicationSearch, setPublicationSearch] = useState('');
  const [publicationStatus, setPublicationStatus] = useState('');
  const [publicationPage, setPublicationPage] = useState(1);
  const [selectedSource, setSelectedSource] = useState(null);
  const [detailTab, setDetailTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [warning, setWarning] = useState('');

  const loadSources = useCallback(async () => {
    setLoading(true);
    setError('');
    setWarning('');

    const requests = await Promise.allSettled([
      apiGet('/dashboard-search/overview'),
      apiGet('/dashboard-search/stats'),
      apiGet('/company-lifecycle/stats'),
      apiGet('/company-lifecycle/sources'),
      apiGet('/gazette/stats/overview'),
      canManageSources ? apiGet('/files/repository/stats') : Promise.resolve(null),
    ]);

    const [overviewResult, searchResult, lifecycleResult, sourcesResult, gazetteResult, repositoryResult] = requests;
    if (overviewResult.status === 'fulfilled') setOverview(overviewResult.value);
    if (searchResult.status === 'fulfilled') setSearchStats(searchResult.value);
    if (lifecycleResult.status === 'fulfilled') setLifecycleStats(lifecycleResult.value);
    if (sourcesResult.status === 'fulfilled') setBulletinSources(Array.isArray(sourcesResult.value) ? sourcesResult.value : []);
    if (gazetteResult.status === 'fulfilled') setGazetteStats(gazetteResult.value);
    if (repositoryResult.status === 'fulfilled') setRepositoryStats(repositoryResult.value);

    const requiredFailures = requests.slice(0, 5).filter((result) => result.status === 'rejected');
    if (requiredFailures.length === 5) {
      setError(requiredFailures[0]?.reason?.detail || requiredFailures[0]?.reason?.message || 'Source coverage could not be loaded.');
    } else if (requiredFailures.length) {
      setWarning(`${requiredFailures.length} source dataset${requiredFailures.length === 1 ? '' : 's'} could not be refreshed. Available coverage is shown below.`);
    }
    setLoading(false);
  }, [canManageSources]);

  useEffect(() => { loadSources(); }, [loadSources]);

  const totals = overview?.totals || {};
  const lifecycleNoticeCounts = useMemo(
    () => lifecycleStats?.notices_by_type || overview?.lifecycle_by_type || {},
    [lifecycleStats, overview]
  );
  const reviewCounts = lifecycleStats?.review_status || {};
  const needsReview = Number(reviewCounts.NEEDS_REVIEW || 0);
  const totalIndexedRecords = (overview?.coverage || []).reduce((sum, source) => sum + Number(source.records || 0), 0);
  const hashedPublications = bulletinSources.filter((source) => Boolean(source.source_sha256)).length;
  const textLayerPublications = bulletinSources.filter((source) => source.source_metadata?.text_layer_present === true).length;

  const coverageRows = useMemo(() => (overview?.coverage || []).map((source) => {
    const metadata = DATABASE_META[source.key] || {};
    const isLifecycle = source.key === 'lifecycle';
    const isGazette = source.key === 'gazette';
    const status = isLifecycle && needsReview ? 'Needs review' : isGazette ? 'Published' : 'Available';
    return {
      ...source,
      id: `database-${source.key}`,
      kind: 'database',
      name: source.database,
      dataset: metadata.category || source.database,
      category: 'Primary database',
      authority: metadata.authority || source.source,
      jurisdiction: metadata.jurisdiction || 'Ghana',
      description: metadata.description || source.source,
      sourceBasis: source.source,
      status,
    };
  }), [needsReview, overview]);

  const institutionRows = useMemo(() => {
    const courtCoverage = coverageRows.find((source) => source.key === 'cases');
    return (searchStats?.sources || []).map((source) => ({
      id: `institution-${source.id}`,
      kind: 'institution',
      name: source.name,
      category: 'Institution coverage',
      dataset: 'Pending court cases',
      records: source.case_count,
      authority: 'Indexed court records',
      jurisdiction: 'Ghana',
      sourceBasis: 'Cases grouped by the institution associated with the published court record.',
      description: 'Institution-specific pending-case coverage available to entity enquiry and reporting.',
      updated_at: courtCoverage?.updated_at,
      status: 'Available',
    }));
  }, [coverageRows, searchStats]);

  const registrarRows = useMemo(() => {
    const lifecycleCoverage = coverageRows.find((source) => source.key === 'lifecycle');
    return REGISTRAR_DATASETS.map((dataset) => ({
      id: `registry-${dataset.type}`,
      kind: 'registry',
      name: dataset.label,
      category: 'Registrar dataset',
      dataset: 'Company lifecycle notices',
      records: Number(lifecycleNoticeCounts[dataset.type] || 0),
      authority: 'Office of the Registrar of Companies, Ghana',
      jurisdiction: 'Ghana',
      sourceBasis: `${formatNumber(totals.bulletin_sources)} Companies Bulletin publications retained with source metadata.`,
      description: 'Published company-register event indexed from the Companies Bulletin.',
      updated_at: lifecycleCoverage?.updated_at,
      status: Number(lifecycleNoticeCounts[dataset.type] || 0) ? 'Indexed' : 'No records',
    }));
  }, [coverageRows, lifecycleNoticeCounts, totals.bulletin_sources]);

  const registerRows = useMemo(
    () => [...coverageRows, ...institutionRows, ...registrarRows],
    [coverageRows, institutionRows, registrarRows]
  );

  const filteredRegisterRows = useMemo(() => {
    const query = registerSearch.trim().toLowerCase();
    return registerRows.filter((source) => {
      const matchesSearch = !query || [source.name, source.dataset, source.category, source.authority, source.sourceBasis]
        .some((value) => String(value || '').toLowerCase().includes(query));
      const matchesType = !registerType || source.kind === registerType;
      const matchesStatus = !registerStatus || statusClass(source.status) === registerStatus;
      return matchesSearch && matchesType && matchesStatus;
    });
  }, [registerRows, registerSearch, registerStatus, registerType]);

  const registerPages = Math.max(1, Math.ceil(filteredRegisterRows.length / REGISTER_PAGE_SIZE));
  const visibleRegisterRows = filteredRegisterRows.slice((registerPage - 1) * REGISTER_PAGE_SIZE, registerPage * REGISTER_PAGE_SIZE);

  const filteredPublications = useMemo(() => {
    const query = publicationSearch.trim().toLowerCase();
    return bulletinSources.filter((source) => {
      const matchesSearch = !query || [
        source.publication_title,
        source.source_authority,
        source.source_filename,
        source.volume_number,
        source.jurisdiction,
        source.source_sha256,
      ].some((value) => String(value || '').toLowerCase().includes(query));
      const matchesStatus = !publicationStatus || source.import_status === publicationStatus;
      return matchesSearch && matchesStatus;
    });
  }, [bulletinSources, publicationSearch, publicationStatus]);

  const publicationStatuses = useMemo(
    () => [...new Set(bulletinSources.map((source) => source.import_status).filter(Boolean))].sort(),
    [bulletinSources]
  );
  const publicationPages = Math.max(1, Math.ceil(filteredPublications.length / PUBLICATION_PAGE_SIZE));
  const visiblePublications = filteredPublications.slice((publicationPage - 1) * PUBLICATION_PAGE_SIZE, publicationPage * PUBLICATION_PAGE_SIZE);

  useEffect(() => { setRegisterPage(1); }, [registerSearch, registerStatus, registerType]);
  useEffect(() => { setPublicationPage(1); }, [publicationSearch, publicationStatus]);
  useEffect(() => {
    if (registerPage > registerPages) setRegisterPage(registerPages);
  }, [registerPage, registerPages]);
  useEffect(() => {
    if (publicationPage > publicationPages) setPublicationPage(publicationPages);
  }, [publicationPage, publicationPages]);

  const openDetail = (source, kind = source.kind) => {
    setSelectedSource({ ...source, kind });
    setDetailTab('overview');
  };

  const changeView = (view) => {
    setActiveView(view);
    setSelectedSource(null);
  };

  const registerFirst = filteredRegisterRows.length ? ((registerPage - 1) * REGISTER_PAGE_SIZE) + 1 : 0;
  const registerLast = Math.min(registerPage * REGISTER_PAGE_SIZE, filteredRegisterRows.length);
  const publicationFirst = filteredPublications.length ? ((publicationPage - 1) * PUBLICATION_PAGE_SIZE) + 1 : 0;
  const publicationLast = Math.min(publicationPage * PUBLICATION_PAGE_SIZE, filteredPublications.length);
  const repository = repositoryStats?.repository_stats || {};

  return (
    <section className="dd-module-shell dd-data-source-register">
      <div className="dd-module-heading">
        <div><p className="dd-eyebrow">Coverage and provenance</p><h2>Data source register</h2><p>Inspect indexed datasets, contributing institutions, source publications and quality controls from one operational register.</p></div>
        <div className="dd-heading-actions">
          <button type="button" className="dd-button dd-button-secondary" onClick={loadSources} disabled={loading}><RefreshCw size={15} className={loading ? 'dd-spin' : ''} /> Refresh</button>
          {canManageSources && <button type="button" className="dd-button dd-button-primary" onClick={() => onNavigate?.('file-repository')}><FileUp size={15} /> Open ingestion</button>}
        </div>
      </div>

      {error && <div className="dd-inline-alert is-error"><span>{error}</span><button type="button" onClick={loadSources}>Retry</button></div>}
      {warning && <div className="dd-inline-alert is-info">{warning}</div>}

      {loading && !overview ? <div className="dd-loading-state"><Loader2 className="dd-spin" size={22} /> Loading source register</div> : !error && <>
        <div className="dd-gazette-summary dd-source-register-summary" aria-label="Data source summary">
          <button type="button" className={activeView === 'coverage' ? 'is-active' : ''} onClick={() => changeView('coverage')}><Database size={17} /><span>Indexed coverage</span><strong>{formatNumber(totalIndexedRecords)}</strong><small>{coverageRows.length} databases</small></button>
          <button type="button" className={activeView === 'register' ? 'is-active' : ''} onClick={() => changeView('register')}><TableProperties size={17} /><span>Source register</span><strong>{formatNumber(registerRows.length)}</strong><small>{formatNumber(totals.source_banks)} institutions</small></button>
          <button type="button" className={activeView === 'publications' ? 'is-active' : ''} onClick={() => changeView('publications')}><BookOpenCheck size={17} /><span>Publications</span><strong>{formatNumber(bulletinSources.length)}</strong><small>Companies Bulletins</small></button>
          <button type="button" className={activeView === 'quality' ? 'is-active' : ''} onClick={() => changeView('quality')}><ShieldCheck size={17} /><span>Needs review</span><strong>{formatNumber(needsReview)}</strong><small>Company notices</small></button>
        </div>

        <nav className="dd-gazette-dataset-tabs dd-source-register-tabs" aria-label="Data source views">
          {[
            ['coverage', 'Coverage', coverageRows.length],
            ['register', 'Source register', registerRows.length],
            ['publications', 'Publications', bulletinSources.length],
            ['quality', 'Quality', needsReview],
          ].map(([view, label, count]) => <button key={view} type="button" className={activeView === view ? 'is-active' : ''} onClick={() => changeView(view)}><strong>{label}</strong><span>{formatNumber(count)}</span></button>)}
        </nav>

        <div className="dd-register-note dd-source-register-note"><ShieldCheck size={15} /><span>This register is read-only. Source files and extraction metadata are retained for traceability; new material is handled through Data Ingestion.</span></div>

        {activeView === 'coverage' && <>
          <section className="dd-panel dd-source-primary-panel">
            <div className="dd-panel-header"><div><h3>Primary database coverage</h3><p>Searchable record totals and the latest indexed activity for each operational database.</p></div><span className="dd-status-pill is-clear">Live</span></div>
            <div className="dd-table-wrap dd-source-primary-table"><table className="dd-data-table"><thead><tr><th>Database</th><th>Coverage</th><th>Records</th><th>Authority / provenance</th><th>Last indexed</th><th>State</th><th aria-label="Actions" /></tr></thead><tbody>{coverageRows.map((source) => <tr key={source.id}><td><button type="button" className="dd-company-record-link" onClick={() => openDetail(source)}><strong>{source.name}</strong></button><small>{source.dataset}</small></td><td>{source.sourceBasis}</td><td><strong>{formatNumber(source.records)}</strong></td><td>{source.authority}</td><td>{formatDate(source.updated_at, true)}</td><td><span className={`dd-status-pill ${statusClass(source.status)}`}>{source.status}</span></td><td><button type="button" className="dd-icon-button" onClick={() => openDetail(source)} aria-label={`Open ${source.name}`} title="Open source"><Eye size={14} /></button></td></tr>)}</tbody></table></div>
          </section>

          <div className="dd-source-overview-grid">
            <section className="dd-panel">
              <div className="dd-panel-header"><div><h3>Recent indexing activity</h3><p>The latest retained record from each source family.</p></div></div>
              <div className="dd-source-activity-list">{(overview?.recent_updates || []).map((update, index) => <div key={`${update.source}-${index}`}><span><FileCheck2 size={14} /></span><div><strong>{update.record}</strong><p>{update.source} / {update.detail}</p></div><time>{formatDate(update.updated_at, true)}</time></div>)}{!overview?.recent_updates?.length && <div className="dd-empty-table">No recent indexing activity is available.</div>}</div>
            </section>

            <section className="dd-panel">
              <div className="dd-panel-header"><div><h3>Repository snapshot</h3><p>Captured publications and ingestion storage available to administrators.</p></div></div>
              <div className="dd-source-repository-grid">
                <div><BookOpenCheck size={17} /><span>Bulletins</span><strong>{formatNumber(totals.bulletin_sources)}</strong></div>
                <div><Fingerprint size={17} /><span>Hashed files</span><strong>{formatNumber(hashedPublications)}</strong></div>
                <div><HardDrive size={17} /><span>Stored files</span><strong>{canManageSources ? formatNumber(repository.total_files) : 'Admin only'}</strong></div>
                <div><Database size={17} /><span>Storage</span><strong>{canManageSources && repository.total_size_mb !== undefined ? `${formatNumber(repository.total_size_mb)} MB` : 'Admin only'}</strong></div>
              </div>
              {canManageSources && <button type="button" className="dd-button dd-button-secondary dd-source-ingestion-link" onClick={() => onNavigate?.('file-repository')}><FileUp size={14} /> Review Data Ingestion</button>}
            </section>
          </div>
        </>}

        {activeView === 'register' && <section className="dd-panel dd-source-register-panel">
          <div className="dd-panel-header"><div><h3>Source register</h3><p>Primary databases, contributing institutions and Registrar datasets.</p></div><span className="dd-count-badge">{formatNumber(filteredRegisterRows.length)} sources</span></div>
          <div className="dd-source-filter-bar">
            <label className="dd-search-control"><Search size={14} /><input value={registerSearch} onChange={(event) => setRegisterSearch(event.target.value)} placeholder="Search source, authority or dataset" aria-label="Search source register" /></label>
            <label><span>Source type</span><select className="dd-select-control" value={registerType} onChange={(event) => setRegisterType(event.target.value)}><option value="">All source types</option><option value="database">Primary databases</option><option value="institution">Institution coverage</option><option value="registry">Registrar datasets</option></select></label>
            <label><span>State</span><select className="dd-select-control" value={registerStatus} onChange={(event) => setRegisterStatus(event.target.value)}><option value="">All states</option><option value="is-clear">Available / indexed</option><option value="is-review">Review / no records</option></select></label>
            <button type="button" className="dd-button dd-button-secondary" onClick={() => { setRegisterSearch(''); setRegisterType(''); setRegisterStatus(''); }} disabled={!registerSearch && !registerType && !registerStatus}><X size={14} /> Clear</button>
          </div>
          <div className="dd-table-wrap dd-source-register-table"><table className="dd-data-table"><thead><tr><th>Source</th><th>Type</th><th>Dataset</th><th>Authority / provenance</th><th>Records</th><th>Last indexed</th><th>State</th><th aria-label="Actions" /></tr></thead><tbody>{visibleRegisterRows.map((source) => <tr key={source.id}><td><button type="button" className="dd-company-record-link" onClick={() => openDetail(source)}><strong>{source.name}</strong></button><small>{source.jurisdiction}</small></td><td>{source.category}</td><td>{source.dataset}</td><td>{source.authority}</td><td><strong>{formatNumber(source.records)}</strong></td><td>{formatDate(source.updated_at, true)}</td><td><span className={`dd-status-pill ${statusClass(source.status)}`}>{source.status}</span></td><td><button type="button" className="dd-icon-button" onClick={() => openDetail(source)} aria-label={`Open ${source.name}`} title="Open source"><Eye size={14} /></button></td></tr>)}{!visibleRegisterRows.length && <tr><td colSpan="8" className="dd-empty-table">No sources match these filters.</td></tr>}</tbody></table></div>
          <div className="dd-source-pagination"><span>Records {registerFirst}-{registerLast} of {formatNumber(filteredRegisterRows.length)}</span><div><button type="button" className="dd-icon-button" onClick={() => setRegisterPage((page) => Math.max(1, page - 1))} disabled={registerPage <= 1} aria-label="Previous source page"><ChevronLeft size={15} /></button><span>Page {registerPage} of {registerPages}</span><button type="button" className="dd-icon-button" onClick={() => setRegisterPage((page) => Math.min(registerPages, page + 1))} disabled={registerPage >= registerPages} aria-label="Next source page"><ChevronRight size={15} /></button></div></div>
        </section>}

        {activeView === 'publications' && <section className="dd-panel dd-source-publications-panel">
          <div className="dd-panel-header"><div><h3>Companies Bulletin publications</h3><p>Publication, file integrity and extraction metadata retained for every imported source.</p></div><span className="dd-count-badge">{formatNumber(filteredPublications.length)} publications</span></div>
          <div className="dd-source-filter-bar is-publications">
            <label className="dd-search-control"><Search size={14} /><input value={publicationSearch} onChange={(event) => setPublicationSearch(event.target.value)} placeholder="Publication, volume, authority, filename or hash" aria-label="Search source publications" /></label>
            <label><span>Import state</span><select className="dd-select-control" value={publicationStatus} onChange={(event) => setPublicationStatus(event.target.value)}><option value="">All import states</option>{publicationStatuses.map((status) => <option key={status} value={status}>{humanize(status)}</option>)}</select></label>
            <button type="button" className="dd-button dd-button-secondary" onClick={() => { setPublicationSearch(''); setPublicationStatus(''); }} disabled={!publicationSearch && !publicationStatus}><X size={14} /> Clear</button>
          </div>
          <div className="dd-table-wrap dd-source-publication-table"><table className="dd-data-table"><thead><tr><th>Publication</th><th>Authority</th><th>Published</th><th>Source file</th><th>Document</th><th>Extraction</th><th>Import</th><th aria-label="Actions" /></tr></thead><tbody>{visiblePublications.map((source) => <tr key={source.id}><td><button type="button" className="dd-company-record-link" onClick={() => openDetail(source, 'publication')}><strong>{source.publication_title || 'Untitled publication'}{source.volume_number ? `, Vol. ${source.volume_number}` : ''}</strong></button><small>{sourceRecordId(source.id)}</small></td><td><strong>{source.source_authority || 'Not recorded'}</strong><small>{source.jurisdiction || 'Jurisdiction not recorded'}</small></td><td><strong>{formatDate(source.publication_date || source.issue_date)}</strong><small>Captured {formatDate(source.captured_at, true)}</small></td><td><strong>{source.source_filename || 'Not recorded'}</strong><small>{source.source_sha256 ? 'SHA-256 retained' : 'Hash not recorded'}</small></td><td><strong>{formatNumber(source.page_count)} pages</strong><small>{formatBytes(source.file_size_bytes)}</small></td><td><strong>{humanize(source.extraction_method)}</strong><small>Version {source.extraction_version || 'not recorded'}</small></td><td><span className={`dd-status-pill ${statusClass(source.import_status)}`}>{humanize(source.import_status)}</span></td><td><button type="button" className="dd-icon-button" onClick={() => openDetail(source, 'publication')} aria-label={`Open ${source.publication_title}`} title="Open publication"><Eye size={14} /></button></td></tr>)}{!visiblePublications.length && <tr><td colSpan="8" className="dd-empty-table">No publications match these filters.</td></tr>}</tbody></table></div>
          <div className="dd-source-pagination"><span>Records {publicationFirst}-{publicationLast} of {formatNumber(filteredPublications.length)}</span><div><button type="button" className="dd-icon-button" onClick={() => setPublicationPage((page) => Math.max(1, page - 1))} disabled={publicationPage <= 1} aria-label="Previous publication page"><ChevronLeft size={15} /></button><span>Page {publicationPage} of {publicationPages}</span><button type="button" className="dd-icon-button" onClick={() => setPublicationPage((page) => Math.min(publicationPages, page + 1))} disabled={publicationPage >= publicationPages} aria-label="Next publication page"><ChevronRight size={15} /></button></div></div>
        </section>}

        {activeView === 'quality' && <>
          <div className="dd-source-quality-strip">
            <div><CheckCircle2 size={17} /><span>Published Gazette records</span><strong>{formatNumber(gazetteStats?.published_gazettes)}</strong><small>of {formatNumber(gazetteStats?.total_gazettes)}</small></div>
            <div><Fingerprint size={17} /><span>Hashed publications</span><strong>{formatNumber(hashedPublications)}</strong><small>of {formatNumber(bulletinSources.length)}</small></div>
            <div><FileCheck2 size={17} /><span>Text layer present</span><strong>{formatNumber(textLayerPublications)}</strong><small>source publications</small></div>
            <div className={needsReview ? 'is-warning' : ''}><AlertTriangle size={17} /><span>Notice review backlog</span><strong>{formatNumber(needsReview)}</strong><small>of {formatNumber(totals.lifecycle_notices)}</small></div>
          </div>
          <section className="dd-panel">
            <div className="dd-panel-header"><div><h3>Data assurance controls</h3><p>Observable quality signals from the current source metadata and indexing state.</p></div></div>
            <div className="dd-table-wrap dd-source-quality-table"><table className="dd-data-table"><thead><tr><th>Control</th><th>Dataset</th><th>Observed result</th><th>Operational meaning</th><th>State</th></tr></thead><tbody>
              <tr><td><strong>Publication state</strong></td><td>Ghana Gazette</td><td>{formatNumber(gazetteStats?.published_gazettes)} published; {formatNumber(gazetteStats?.draft_gazettes)} draft; {formatNumber(gazetteStats?.archived_gazettes)} archived</td><td>Record publication status is retained on every Gazette entry.</td><td><span className="dd-status-pill is-clear">Recorded</span></td></tr>
              <tr><td><strong>File fingerprint</strong></td><td>Companies Bulletin</td><td>{formatNumber(hashedPublications)} of {formatNumber(bulletinSources.length)} sources have SHA-256</td><td>Supports source-file identity and later integrity comparison.</td><td><span className={`dd-status-pill ${hashedPublications === bulletinSources.length ? 'is-clear' : 'is-review'}`}>{hashedPublications === bulletinSources.length ? 'Complete' : 'Review gaps'}</span></td></tr>
              <tr><td><strong>Text extraction</strong></td><td>Companies Bulletin</td><td>{formatNumber(textLayerPublications)} publications report a text layer</td><td>Shows whether structured extraction was supported by machine-readable text.</td><td><span className={`dd-status-pill ${textLayerPublications === bulletinSources.length ? 'is-clear' : 'is-review'}`}>{textLayerPublications === bulletinSources.length ? 'Complete' : 'Mixed'}</span></td></tr>
              <tr><td><strong>Human review</strong></td><td>Company lifecycle notices</td><td>{formatNumber(needsReview)} notices awaiting review</td><td>Extracted company events remain visible but require verification before reliance.</td><td><span className={`dd-status-pill ${needsReview ? 'is-review' : 'is-clear'}`}>{needsReview ? 'Action required' : 'Clear'}</span></td></tr>
              <tr><td><strong>Party indexing</strong></td><td>Pending court cases</td><td>{formatNumber(totals.indexed_case_parties)} indexed party references</td><td>Normalized party references support institution and entity-level enquiry.</td><td><span className="dd-status-pill is-clear">Indexed</span></td></tr>
            </tbody></table></div>
          </section>
        </>}
      </>}

      {selectedSource && <div className="dd-modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setSelectedSource(null); }}>
        <div className="dd-modal dd-gazette-detail-modal dd-source-detail-modal" role="dialog" aria-modal="true" aria-labelledby="source-detail-title">
          <header><div><h3 id="source-detail-title">{selectedSource.kind === 'publication' ? `${selectedSource.publication_title || 'Untitled publication'}${selectedSource.volume_number ? `, Vol. ${selectedSource.volume_number}` : ''}` : selectedSource.name}</h3><p>{selectedSource.kind === 'publication' ? sourceRecordId(selectedSource.id) : humanize(selectedSource.kind)}</p></div><button type="button" onClick={() => setSelectedSource(null)} aria-label="Close"><X size={17} /></button></header>
          <div className="dd-modal-body">
            <div className="dd-gazette-facts">
              {selectedSource.kind === 'publication' ? <>
                <div><BookOpenCheck size={16} /><span>Volume</span><strong>{displayValue(selectedSource.volume_number)}</strong></div>
                <div><CalendarDays size={16} /><span>Publication</span><strong>{formatDate(selectedSource.publication_date || selectedSource.issue_date)}</strong></div>
                <div><FileText size={16} /><span>Document</span><strong>{formatNumber(selectedSource.page_count)} pages</strong></div>
                <div><CheckCircle2 size={16} /><span>Import</span><strong>{humanize(selectedSource.import_status)}</strong></div>
              </> : <>
                <div><Database size={16} /><span>Source type</span><strong>{selectedSource.category}</strong></div>
                <div><TableProperties size={16} /><span>Dataset</span><strong>{selectedSource.dataset}</strong></div>
                <div><FileText size={16} /><span>Records</span><strong>{formatNumber(selectedSource.records)}</strong></div>
                <div><CheckCircle2 size={16} /><span>State</span><strong>{selectedSource.status}</strong></div>
              </>}
            </div>
            <div className="dd-gazette-detail-tabs">
              <button type="button" className={detailTab === 'overview' ? 'is-active' : ''} onClick={() => setDetailTab('overview')}>{selectedSource.kind === 'publication' ? 'Publication' : 'Coverage'}</button>
              <button type="button" className={detailTab === 'provenance' ? 'is-active' : ''} onClick={() => setDetailTab('provenance')}>{selectedSource.kind === 'publication' ? 'Integrity & extraction' : 'Provenance'}</button>
            </div>
            <div className="dd-gazette-detail-content">
              {selectedSource.kind === 'publication' && detailTab === 'overview' && <dl className="dd-person-detail-list">{[
                ['Publication title', selectedSource.publication_title],
                ['Volume number', selectedSource.volume_number],
                ['Source authority', selectedSource.source_authority],
                ['Jurisdiction', selectedSource.jurisdiction],
                ['Issue date', formatDate(selectedSource.issue_date)],
                ['Publication date', formatDate(selectedSource.publication_date)],
                ['Source filename', selectedSource.source_filename],
                ['Document URL', selectedSource.document_url],
                ['Page count', formatNumber(selectedSource.page_count)],
                ['File size', formatBytes(selectedSource.file_size_bytes)],
              ].map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{displayValue(value)}</dd></div>)}</dl>}
              {selectedSource.kind === 'publication' && detailTab === 'provenance' && <dl className="dd-person-detail-list">{[
                ['Source record ID', sourceRecordId(selectedSource.id)],
                ['SHA-256', selectedSource.source_sha256],
                ['Extraction method', humanize(selectedSource.extraction_method)],
                ['Extraction version', selectedSource.extraction_version],
                ['Import status', humanize(selectedSource.import_status)],
                ['Text layer present', selectedSource.source_metadata?.text_layer_present === true ? 'Yes' : selectedSource.source_metadata?.text_layer_present === false ? 'No' : 'Not recorded'],
                ['Captured', formatDate(selectedSource.captured_at, true)],
                ['Imported', formatDate(selectedSource.imported_at, true)],
              ].map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{displayValue(value)}</dd></div>)}</dl>}
              {selectedSource.kind !== 'publication' && detailTab === 'overview' && <>
                <section><h4>Coverage description</h4><p>{displayValue(selectedSource.description)}</p></section>
                <section><h4>Current coverage</h4><p>{formatNumber(selectedSource.records)} indexed records in {selectedSource.dataset}.</p></section>
              </>}
              {selectedSource.kind !== 'publication' && detailTab === 'provenance' && <dl className="dd-person-detail-list">{[
                ['Source authority', selectedSource.authority],
                ['Jurisdiction', selectedSource.jurisdiction],
                ['Source basis', selectedSource.sourceBasis],
                ['Latest indexed record', formatDate(selectedSource.updated_at, true)],
                ['Operational state', selectedSource.status],
              ].map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{displayValue(value)}</dd></div>)}</dl>}
            </div>
          </div>
          <footer><button type="button" className="dd-button dd-button-secondary" onClick={() => setSelectedSource(null)}>Close</button></footer>
        </div>
      </div>}
    </section>
  );
};

export default DataSourcesPage;
