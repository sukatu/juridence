import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Archive,
  BookOpenCheck,
  CalendarDays,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Download,
  Eye,
  File,
  FileCheck2,
  FileSpreadsheet,
  FileText,
  FileUp,
  FileVideo,
  Fingerprint,
  FolderOpen,
  HardDrive,
  Image,
  Loader2,
  RefreshCw,
  Search,
  ShieldCheck,
  TableProperties,
  Upload,
  X,
} from 'lucide-react';
import { apiGet, apiUpload, getAuthToken } from '../utils/api';

const REPOSITORY_PAGE_SIZE = 20;
const HISTORY_PAGE_SIZE = 15;

const INGESTION_TARGETS = [
  { value: 'company_bulletins', label: 'Companies Bulletin', path: 'company_bulletins' },
  { value: 'ghana_gazette', label: 'Ghana Gazette', path: 'gazette' },
  { value: 'court_records', label: 'Court records', path: 'pending_cases' },
  { value: 'entity_data', label: 'Entity data', path: 'entity_data' },
  { value: 'supporting_material', label: 'Supporting material', path: '' },
];

const formatNumber = (value) => Number(value || 0).toLocaleString();

const formatDate = (value, includeTime = false) => {
  if (!value) return 'Not recorded';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return includeTime
    ? date.toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' })
    : date.toLocaleDateString('en-GB', { dateStyle: 'medium' });
};

const formatSize = (sizeInMb) => {
  const size = Number(sizeInMb || 0);
  if (!size) return '0 KB';
  if (size < 1) return `${(size * 1024).toFixed(1)} KB`;
  return `${size.toFixed(size >= 10 ? 1 : 2)} MB`;
};

const formatBytes = (bytes) => {
  const size = Number(bytes || 0);
  if (!size) return 'Not recorded';
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
};

const humanize = (value) => {
  if (!value) return 'Not recorded';
  return String(value)
    .replaceAll('_', ' ')
    .replaceAll('-', ' ')
    .toLowerCase()
    .replace(/(^|\s)\S/g, (character) => character.toUpperCase());
};

const encodedPath = (path) => String(path || '').split('/').map(encodeURIComponent).join('/');

const statusClass = (status) => {
  const normalized = String(status || '').toLowerCase();
  if (['imported', 'complete', 'ready', 'verified'].some((value) => normalized.includes(value))) return 'is-clear';
  if (['failed', 'error', 'rejected'].some((value) => normalized.includes(value))) return 'is-error';
  return 'is-review';
};

const fileIcon = (item, size = 15) => {
  if (item.is_directory) return <FolderOpen size={size} />;
  if (item.file_type === 'image') return <Image size={size} />;
  if (item.file_type === 'video') return <FileVideo size={size} />;
  if (item.file_type === 'archive') return <Archive size={size} />;
  if (item.file_type === 'office') return <FileSpreadsheet size={size} />;
  if (item.file_type === 'document') return <FileText size={size} />;
  return <File size={size} />;
};

const FileRepository = () => {
  const [activeView, setActiveView] = useState('intake');
  const [items, setItems] = useState([]);
  const [repositoryStats, setRepositoryStats] = useState(null);
  const [bulletinSources, setBulletinSources] = useState([]);
  const [lifecycleStats, setLifecycleStats] = useState(null);
  const [currentPath, setCurrentPath] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [fileTypeFilter, setFileTypeFilter] = useState('all');
  const [repositoryPage, setRepositoryPage] = useState(1);
  const [repositoryPagination, setRepositoryPagination] = useState({ page: 1, limit: REPOSITORY_PAGE_SIZE, total: 0, totalPages: 1 });
  const [historySearch, setHistorySearch] = useState('');
  const [historyStatus, setHistoryStatus] = useState('');
  const [historyPage, setHistoryPage] = useState(1);
  const [selectedPublication, setSelectedPublication] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadTarget, setUploadTarget] = useState(INGESTION_TARGETS[0].value);
  const [uploadFile, setUploadFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [loadingOverview, setLoadingOverview] = useState(true);
  const [loadingRepository, setLoadingRepository] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  const loadOverview = useCallback(async () => {
    setLoadingOverview(true);
    setError('');
    const results = await Promise.allSettled([
      apiGet('/files/repository/stats'),
      apiGet('/company-lifecycle/sources'),
      apiGet('/company-lifecycle/stats'),
    ]);
    const [repositoryResult, sourcesResult, lifecycleResult] = results;
    if (repositoryResult.status === 'fulfilled') setRepositoryStats(repositoryResult.value);
    if (sourcesResult.status === 'fulfilled') setBulletinSources(Array.isArray(sourcesResult.value) ? sourcesResult.value : []);
    if (lifecycleResult.status === 'fulfilled') setLifecycleStats(lifecycleResult.value);
    if (results.every((result) => result.status === 'rejected')) {
      setError(repositoryResult.reason?.detail || repositoryResult.reason?.message || 'Ingestion data could not be loaded.');
    }
    setLoadingOverview(false);
  }, []);

  const loadRepository = useCallback(async () => {
    setLoadingRepository(true);
    try {
      const response = await apiGet('/files/repository', {
        path: currentPath,
        page: repositoryPage,
        limit: REPOSITORY_PAGE_SIZE,
        search: searchQuery,
        file_type: fileTypeFilter === 'all' ? '' : fileTypeFilter,
      });
      setItems(response.items || []);
      setRepositoryPagination(response.pagination || { page: 1, limit: REPOSITORY_PAGE_SIZE, total: 0, totalPages: 1 });
    } catch (loadError) {
      setItems([]);
      setError(loadError.detail || loadError.message || 'Repository contents could not be loaded.');
    } finally {
      setLoadingRepository(false);
    }
  }, [currentPath, fileTypeFilter, repositoryPage, searchQuery]);

  useEffect(() => { loadOverview(); }, [loadOverview]);
  useEffect(() => { loadRepository(); }, [loadRepository]);
  useEffect(() => { setRepositoryPage(1); }, [currentPath, fileTypeFilter, searchQuery]);
  useEffect(() => { setHistoryPage(1); }, [historySearch, historyStatus]);

  useEffect(() => () => {
    if (previewUrl.startsWith('blob:')) URL.revokeObjectURL(previewUrl);
  }, [previewUrl]);

  const repository = repositoryStats?.repository_stats || {};
  const reviewStatus = lifecycleStats?.review_status || {};
  const needsReview = Number(reviewStatus.NEEDS_REVIEW || 0);
  const allowedExtensions = repositoryStats?.allowed_extensions || [];
  const hashedSources = bulletinSources.filter((source) => Boolean(source.source_sha256)).length;
  const textLayerSources = bulletinSources.filter((source) => source.source_metadata?.text_layer_present === true).length;

  const historyStatuses = useMemo(
    () => [...new Set(bulletinSources.map((source) => source.import_status).filter(Boolean))].sort(),
    [bulletinSources]
  );

  const filteredHistory = useMemo(() => {
    const query = historySearch.trim().toLowerCase();
    return bulletinSources.filter((source) => {
      const matchesQuery = !query || [source.publication_title, source.volume_number, source.source_filename, source.source_authority, source.extraction_method]
        .some((value) => String(value || '').toLowerCase().includes(query));
      return matchesQuery && (!historyStatus || source.import_status === historyStatus);
    });
  }, [bulletinSources, historySearch, historyStatus]);

  const historyPages = Math.max(1, Math.ceil(filteredHistory.length / HISTORY_PAGE_SIZE));
  const visibleHistory = filteredHistory.slice((historyPage - 1) * HISTORY_PAGE_SIZE, historyPage * HISTORY_PAGE_SIZE);
  const historyFirst = filteredHistory.length ? ((historyPage - 1) * HISTORY_PAGE_SIZE) + 1 : 0;
  const historyLast = Math.min(historyPage * HISTORY_PAGE_SIZE, filteredHistory.length);
  const repositoryFirst = repositoryPagination.total ? ((repositoryPagination.page - 1) * repositoryPagination.limit) + 1 : 0;
  const repositoryLast = Math.min(repositoryPagination.page * repositoryPagination.limit, repositoryPagination.total || 0);

  const latestImports = useMemo(
    () => [...bulletinSources]
      .sort((first, second) => new Date(second.imported_at || second.captured_at || 0) - new Date(first.imported_at || first.captured_at || 0))
      .slice(0, 6),
    [bulletinSources]
  );

  const changeView = (view) => {
    setActiveView(view);
    setNotice('');
  };

  const navigateToFolder = (path) => {
    setCurrentPath(path);
    setSearchQuery('');
    setFileTypeFilter('all');
    setRepositoryPage(1);
  };

  const closePreview = () => {
    if (previewUrl.startsWith('blob:')) URL.revokeObjectURL(previewUrl);
    setPreviewUrl('');
    setSelectedFile(null);
  };

  const handlePreview = async (item) => {
    setError('');
    try {
      const response = await fetch(`/api/files/repository/public-preview/${encodedPath(item.path)}`, { credentials: 'include' });
      if (!response.ok) throw new Error(`Preview failed with status ${response.status}`);
      const blob = await response.blob();
      setPreviewUrl(URL.createObjectURL(blob));
      setSelectedFile(item);
    } catch (previewError) {
      setError(previewError.message || 'The file preview could not be loaded.');
    }
  };

  const handleDownload = async (item) => {
    setError('');
    try {
      const token = getAuthToken();
      const response = await fetch(`/api/files/repository/download/${encodedPath(item.path)}`, {
        credentials: 'include',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!response.ok) throw new Error(`Download failed with status ${response.status}`);
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = item.name;
      anchor.click();
      URL.revokeObjectURL(url);
    } catch (downloadError) {
      setError(downloadError.message || 'The file could not be downloaded.');
    }
  };

  const openUpload = () => {
    const matchingTarget = INGESTION_TARGETS.find((target) => target.path === currentPath);
    setUploadTarget(matchingTarget?.value || INGESTION_TARGETS[0].value);
    setUploadFile(null);
    setNotice('');
    setShowUploadModal(true);
  };

  const handleUpload = async (event) => {
    event.preventDefault();
    if (!uploadFile) return;
    const target = INGESTION_TARGETS.find((option) => option.value === uploadTarget) || INGESTION_TARGETS[0];
    const formData = new FormData();
    formData.append('file', uploadFile);
    setUploading(true);
    setError('');
    try {
      await apiUpload(`/files/repository/upload?folder_path=${encodeURIComponent(target.path)}`, formData);
      setShowUploadModal(false);
      setUploadFile(null);
      setNotice(`${uploadFile.name} was received in ${target.label}.`);
      setCurrentPath(target.path);
      setRepositoryPage(1);
      setActiveView('repository');
      await Promise.all([loadOverview(), loadRepository()]);
    } catch (uploadError) {
      setError(uploadError.detail || uploadError.message || 'The source file could not be uploaded.');
    } finally {
      setUploading(false);
    }
  };

  const pathSegments = currentPath ? currentPath.split('/').filter(Boolean) : [];
  const canPreview = (item) => ['.pdf', '.jpg', '.jpeg', '.png', '.gif', '.txt'].includes(String(item.extension || '').toLowerCase());

  return (
    <section className="dd-module-shell dd-data-ingestion">
      <div className="dd-module-heading">
        <div><p className="dd-eyebrow">Controlled source intake</p><h2>Data ingestion workspace</h2><p>Receive source material, inspect retained files, and monitor import provenance from one operational queue.</p></div>
        <div className="dd-heading-actions">
          <button type="button" className="dd-button dd-button-secondary" onClick={() => Promise.all([loadOverview(), loadRepository()])} disabled={loadingOverview || loadingRepository}><RefreshCw size={15} className={loadingOverview || loadingRepository ? 'dd-spin' : ''} /> Refresh</button>
          <button type="button" className="dd-button dd-button-primary" onClick={openUpload}><Upload size={15} /> Import source</button>
        </div>
      </div>

      {error && <div className="dd-inline-alert is-error"><span>{error}</span><button type="button" onClick={() => setError('')} aria-label="Dismiss error"><X size={14} /></button></div>}
      {notice && <div className="dd-inline-alert is-info"><span>{notice}</span><button type="button" onClick={() => setNotice('')} aria-label="Dismiss notice"><X size={14} /></button></div>}

      {loadingOverview && !repositoryStats ? <div className="dd-loading-state"><Loader2 className="dd-spin" size={22} /> Loading ingestion workspace</div> : <>
        <div className="dd-gazette-summary dd-ingestion-summary" aria-label="Data ingestion summary">
          <button type="button" className={activeView === 'intake' ? 'is-active' : ''} onClick={() => changeView('intake')}><FileUp size={17} /><span>Repository files</span><strong>{formatNumber(repository.total_files)}</strong><small>Ready for intake review</small></button>
          <button type="button" className={activeView === 'repository' ? 'is-active' : ''} onClick={() => changeView('repository')}><FolderOpen size={17} /><span>Repository folders</span><strong>{formatNumber(repository.total_folders)}</strong><small>{formatSize(repository.total_size_mb)} retained</small></button>
          <button type="button" className={activeView === 'history' ? 'is-active' : ''} onClick={() => changeView('history')}><BookOpenCheck size={17} /><span>Completed imports</span><strong>{formatNumber(bulletinSources.length)}</strong><small>Companies Bulletins</small></button>
          <button type="button" className={activeView === 'controls' ? 'is-active' : ''} onClick={() => changeView('controls')}><ShieldCheck size={17} /><span>Review queue</span><strong>{formatNumber(needsReview)}</strong><small>Company notices</small></button>
        </div>

        <nav className="dd-gazette-dataset-tabs dd-ingestion-tabs" aria-label="Data ingestion views">
          {[
            ['intake', 'Intake', repository.total_files],
            ['repository', 'Repository', repositoryPagination.total || repository.total_files],
            ['history', 'Import history', bulletinSources.length],
            ['controls', 'Controls', needsReview],
          ].map(([view, label, count]) => <button key={view} type="button" className={activeView === view ? 'is-active' : ''} onClick={() => changeView(view)}><strong>{label}</strong><span>{formatNumber(count)}</span></button>)}
        </nav>

        <div className="dd-register-note dd-ingestion-note"><ShieldCheck size={15} /><span>Source files are retained with access controls. This workspace does not expose file, table, or database deletion.</span></div>

        {activeView === 'intake' && <>
          <div className="dd-ingestion-overview-grid">
            <section className="dd-panel dd-ingestion-intake-panel">
              <div className="dd-panel-header"><div><h3>Source intake</h3><p>Authenticated repository upload with controlled file types and a 100 MB limit.</p></div><span className="dd-status-pill is-clear">Ready</span></div>
              <div className="dd-ingestion-intake-body">
                <span><FileUp size={24} /></span>
                <div><strong>Import source material</strong><p>{allowedExtensions.length ? allowedExtensions.map((extension) => extension.replace('.', '').toUpperCase()).join(', ') : 'Approved repository formats'}</p></div>
                <button type="button" className="dd-button dd-button-primary" onClick={openUpload}><Upload size={14} /> Select source</button>
              </div>
              <dl className="dd-ingestion-intake-facts"><div><dt>Authentication</dt><dd>Administrator</dd></div><div><dt>Maximum file size</dt><dd>100 MB</dd></div><div><dt>Storage used</dt><dd>{formatSize(repository.total_size_mb)}</dd></div></dl>
            </section>

            <section className="dd-panel">
              <div className="dd-panel-header"><div><h3>Intake state</h3><p>Current storage and extraction assurance.</p></div></div>
              <div className="dd-ingestion-state-list">
                <div><HardDrive size={15} /><span><strong>{formatNumber(repository.total_files)}</strong><small>retained repository files</small></span><em className="is-clear">Available</em></div>
                <div><Fingerprint size={15} /><span><strong>{formatNumber(hashedSources)} / {formatNumber(bulletinSources.length)}</strong><small>bulletin fingerprints retained</small></span><em className={hashedSources === bulletinSources.length ? 'is-clear' : 'is-review'}>{hashedSources === bulletinSources.length ? 'Complete' : 'Review'}</em></div>
                <div><FileCheck2 size={15} /><span><strong>{formatNumber(textLayerSources)}</strong><small>text-layer publications</small></span><em className={textLayerSources === bulletinSources.length ? 'is-clear' : 'is-review'}>{textLayerSources === bulletinSources.length ? 'Complete' : 'Mixed'}</em></div>
                <div><TableProperties size={15} /><span><strong>{formatNumber(needsReview)}</strong><small>extracted notices awaiting review</small></span><em className={needsReview ? 'is-review' : 'is-clear'}>{needsReview ? 'Action' : 'Clear'}</em></div>
              </div>
            </section>
          </div>

          <section className="dd-panel">
            <div className="dd-panel-header"><div><h3>Latest completed imports</h3><p>Most recently captured Companies Bulletin source files.</p></div><button type="button" className="dd-text-button" onClick={() => changeView('history')}>View import history</button></div>
            <div className="dd-table-wrap dd-ingestion-latest-table"><table className="dd-data-table"><thead><tr><th>Publication</th><th>Source file</th><th>Captured</th><th>Extraction</th><th>Integrity</th><th>State</th><th aria-label="Actions" /></tr></thead><tbody>{latestImports.map((source) => <tr key={source.id}><td><button type="button" className="dd-company-record-link" onClick={() => setSelectedPublication(source)}><strong>{source.publication_title || 'Companies Bulletin'}{source.volume_number ? `, Vol. ${source.volume_number}` : ''}</strong></button><small>{source.source_authority || 'Authority not recorded'}</small></td><td><strong>{source.source_filename || 'Not recorded'}</strong><small>{formatNumber(source.page_count)} pages - {formatBytes(source.file_size_bytes)}</small></td><td>{formatDate(source.captured_at, true)}</td><td><strong>{humanize(source.extraction_method)}</strong><small>Version {source.extraction_version || 'not recorded'}</small></td><td><span className={`dd-status-pill ${source.source_sha256 ? 'is-clear' : 'is-review'}`}>{source.source_sha256 ? 'SHA-256' : 'Not recorded'}</span></td><td><span className={`dd-status-pill ${statusClass(source.import_status)}`}>{humanize(source.import_status)}</span></td><td><button type="button" className="dd-icon-button" onClick={() => setSelectedPublication(source)} aria-label={`Open ${source.publication_title || 'publication'}`} title="Open import"><Eye size={14} /></button></td></tr>)}{!latestImports.length && <tr><td colSpan="7" className="dd-empty-table">No completed publication imports are available.</td></tr>}</tbody></table></div>
          </section>
        </>}

        {activeView === 'repository' && <section className="dd-panel dd-ingestion-repository-panel">
          <div className="dd-panel-header dd-ingestion-repository-header"><div><h3>Retained file repository</h3><nav aria-label="Repository path"><button type="button" onClick={() => navigateToFolder('')}>Repository</button>{pathSegments.map((segment, index) => <React.Fragment key={`${segment}-${index}`}><span>/</span><button type="button" onClick={() => navigateToFolder(pathSegments.slice(0, index + 1).join('/'))}>{segment}</button></React.Fragment>)}</nav></div><span className="dd-count-badge">{formatNumber(repositoryPagination.total)} items</span></div>
          <div className="dd-ingestion-filter-bar">
            <label className="dd-search-control"><Search size={14} /><input value={searchQuery} onChange={(event) => setSearchQuery(event.target.value)} placeholder="Search the current folder" aria-label="Search repository" /></label>
            <label><span>File type</span><select className="dd-select-control" value={fileTypeFilter} onChange={(event) => setFileTypeFilter(event.target.value)}><option value="all">All items</option><option value="document">Documents</option><option value="office">Office files</option><option value="image">Images</option><option value="video">Videos</option><option value="archive">Archives</option><option value="other">Other files</option></select></label>
            <button type="button" className="dd-button dd-button-secondary" onClick={() => { setSearchQuery(''); setFileTypeFilter('all'); }} disabled={!searchQuery && fileTypeFilter === 'all'}><X size={14} /> Clear</button>
            <button type="button" className="dd-button dd-button-primary" onClick={openUpload}><Upload size={14} /> Import source</button>
          </div>
          {loadingRepository ? <div className="dd-loading-state"><Loader2 className="dd-spin" size={20} /> Loading repository</div> : <div className="dd-table-wrap dd-ingestion-repository-table"><table className="dd-data-table"><thead><tr><th>Name</th><th>Kind</th><th>Size</th><th>Created</th><th>Modified</th><th>Retention</th><th aria-label="Actions" /></tr></thead><tbody>{items.map((item) => <tr key={item.path}><td><button type="button" className="dd-ingestion-file-link" onClick={() => item.is_directory ? navigateToFolder(item.path) : handlePreview(item)} disabled={!item.is_directory && !canPreview(item)}><span>{fileIcon(item)}</span><span><strong>{item.name}</strong><small>{item.path}</small></span></button></td><td>{item.is_directory ? 'Folder' : humanize(item.file_type || item.extension)}</td><td>{item.is_directory ? '-' : formatSize(item.size)}</td><td>{formatDate(item.created_at)}</td><td>{formatDate(item.modified_at, true)}</td><td><span className="dd-status-pill is-clear">Retained</span></td><td><div className="dd-ingestion-row-actions">{item.is_directory ? <button type="button" className="dd-icon-button" onClick={() => navigateToFolder(item.path)} aria-label={`Open ${item.name}`} title="Open folder"><FolderOpen size={14} /></button> : <>{canPreview(item) && <button type="button" className="dd-icon-button" onClick={() => handlePreview(item)} aria-label={`Preview ${item.name}`} title="Preview"><Eye size={14} /></button>}<button type="button" className="dd-icon-button" onClick={() => handleDownload(item)} aria-label={`Download ${item.name}`} title="Download"><Download size={14} /></button></>}</div></td></tr>)}{!items.length && <tr><td colSpan="7" className="dd-empty-table">No repository items match the current folder and filters.</td></tr>}</tbody></table></div>}
          <div className="dd-source-pagination"><span>Records {repositoryFirst}-{repositoryLast} of {formatNumber(repositoryPagination.total)}</span><div><button type="button" className="dd-icon-button" onClick={() => setRepositoryPage((page) => Math.max(1, page - 1))} disabled={repositoryPage <= 1} aria-label="Previous repository page"><ChevronLeft size={15} /></button><span>Page {repositoryPagination.page || 1} of {Math.max(1, repositoryPagination.totalPages || 1)}</span><button type="button" className="dd-icon-button" onClick={() => setRepositoryPage((page) => Math.min(repositoryPagination.totalPages || 1, page + 1))} disabled={repositoryPage >= (repositoryPagination.totalPages || 1)} aria-label="Next repository page"><ChevronRight size={15} /></button></div></div>
        </section>}

        {activeView === 'history' && <section className="dd-panel dd-ingestion-history-panel">
          <div className="dd-panel-header"><div><h3>Import history</h3><p>Companies Bulletin files with publication, extraction, and integrity metadata.</p></div><span className="dd-count-badge">{formatNumber(filteredHistory.length)} imports</span></div>
          <div className="dd-ingestion-filter-bar is-history">
            <label className="dd-search-control"><Search size={14} /><input value={historySearch} onChange={(event) => setHistorySearch(event.target.value)} placeholder="Search publication, volume, file, or method" aria-label="Search import history" /></label>
            <label><span>Import state</span><select className="dd-select-control" value={historyStatus} onChange={(event) => setHistoryStatus(event.target.value)}><option value="">All import states</option>{historyStatuses.map((status) => <option key={status} value={status}>{humanize(status)}</option>)}</select></label>
            <button type="button" className="dd-button dd-button-secondary" onClick={() => { setHistorySearch(''); setHistoryStatus(''); }} disabled={!historySearch && !historyStatus}><X size={14} /> Clear</button>
          </div>
          <div className="dd-table-wrap dd-ingestion-history-table"><table className="dd-data-table"><thead><tr><th>Publication</th><th>Authority</th><th>Published</th><th>Source file</th><th>Captured</th><th>Extraction</th><th>Integrity</th><th>State</th><th aria-label="Actions" /></tr></thead><tbody>{visibleHistory.map((source) => <tr key={source.id}><td><button type="button" className="dd-company-record-link" onClick={() => setSelectedPublication(source)}><strong>{source.publication_title || 'Companies Bulletin'}{source.volume_number ? `, Vol. ${source.volume_number}` : ''}</strong></button><small>Source {String(source.id).padStart(4, '0')}</small></td><td><strong>{source.source_authority || 'Not recorded'}</strong><small>{source.jurisdiction || 'Ghana'}</small></td><td>{formatDate(source.publication_date || source.issue_date)}</td><td><strong>{source.source_filename || 'Not recorded'}</strong><small>{formatNumber(source.page_count)} pages - {formatBytes(source.file_size_bytes)}</small></td><td>{formatDate(source.captured_at, true)}</td><td><strong>{humanize(source.extraction_method)}</strong><small>Version {source.extraction_version || 'not recorded'}</small></td><td><span className={`dd-status-pill ${source.source_sha256 ? 'is-clear' : 'is-review'}`}>{source.source_sha256 ? 'SHA-256' : 'Not recorded'}</span></td><td><span className={`dd-status-pill ${statusClass(source.import_status)}`}>{humanize(source.import_status)}</span></td><td><button type="button" className="dd-icon-button" onClick={() => setSelectedPublication(source)} aria-label={`Open ${source.publication_title || 'publication'}`} title="Open import"><Eye size={14} /></button></td></tr>)}{!visibleHistory.length && <tr><td colSpan="9" className="dd-empty-table">No imports match the current filters.</td></tr>}</tbody></table></div>
          <div className="dd-source-pagination"><span>Records {historyFirst}-{historyLast} of {formatNumber(filteredHistory.length)}</span><div><button type="button" className="dd-icon-button" onClick={() => setHistoryPage((page) => Math.max(1, page - 1))} disabled={historyPage <= 1} aria-label="Previous import page"><ChevronLeft size={15} /></button><span>Page {historyPage} of {historyPages}</span><button type="button" className="dd-icon-button" onClick={() => setHistoryPage((page) => Math.min(historyPages, page + 1))} disabled={historyPage >= historyPages} aria-label="Next import page"><ChevronRight size={15} /></button></div></div>
        </section>}

        {activeView === 'controls' && <>
          <div className="dd-ingestion-control-strip">
            <div><HardDrive size={17} /><span>Repository storage</span><strong>{formatSize(repository.total_size_mb)}</strong><small>{formatNumber(repository.total_files)} files</small></div>
            <div><Fingerprint size={17} /><span>File fingerprints</span><strong>{formatNumber(hashedSources)}</strong><small>of {formatNumber(bulletinSources.length)} publications</small></div>
            <div><FileCheck2 size={17} /><span>Text layer</span><strong>{formatNumber(textLayerSources)}</strong><small>machine-readable sources</small></div>
            <div className={needsReview ? 'is-warning' : ''}><TableProperties size={17} /><span>Human review</span><strong>{formatNumber(needsReview)}</strong><small>notices awaiting review</small></div>
          </div>
          <section className="dd-panel">
            <div className="dd-panel-header"><div><h3>Ingestion controls</h3><p>Applied storage, integrity, extraction, and retention requirements.</p></div></div>
            <div className="dd-table-wrap dd-ingestion-controls-table"><table className="dd-data-table"><thead><tr><th>Control</th><th>Applied to</th><th>Current result</th><th>Requirement</th><th>State</th></tr></thead><tbody>
              <tr><td><strong>File admission</strong></td><td>Repository uploads</td><td>{formatNumber(allowedExtensions.length)} allowed extensions</td><td>Approved format and maximum file size of 100 MB.</td><td><span className="dd-status-pill is-clear">Enforced</span></td></tr>
              <tr><td><strong>Administrator access</strong></td><td>Repository</td><td>Authenticated administrator</td><td>Repository listing, import, preview, and download require authorised access.</td><td><span className="dd-status-pill is-clear">Enforced</span></td></tr>
              <tr><td><strong>Source fingerprint</strong></td><td>Companies Bulletin</td><td>{formatNumber(hashedSources)} of {formatNumber(bulletinSources.length)} with SHA-256</td><td>Retain a source-file fingerprint for integrity comparison.</td><td><span className={`dd-status-pill ${hashedSources === bulletinSources.length ? 'is-clear' : 'is-review'}`}>{hashedSources === bulletinSources.length ? 'Complete' : 'Review gaps'}</span></td></tr>
              <tr><td><strong>Extraction metadata</strong></td><td>Companies Bulletin</td><td>{formatNumber(textLayerSources)} sources report a text layer</td><td>Record extraction method, version, and text-layer availability.</td><td><span className={`dd-status-pill ${textLayerSources === bulletinSources.length ? 'is-clear' : 'is-review'}`}>{textLayerSources === bulletinSources.length ? 'Complete' : 'Mixed'}</span></td></tr>
              <tr><td><strong>Retention</strong></td><td>All source files</td><td>No delete action exposed</td><td>Retain source files and provenance for audit and report traceability.</td><td><span className="dd-status-pill is-clear">Retained</span></td></tr>
            </tbody></table></div>
          </section>
        </>}
      </>}

      {showUploadModal && <div className="dd-modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget && !uploading) setShowUploadModal(false); }}>
        <form className="dd-modal dd-ingestion-upload-modal" role="dialog" aria-modal="true" aria-labelledby="ingestion-upload-title" onSubmit={handleUpload}>
          <header><div><h3 id="ingestion-upload-title">Import source file</h3><p>Authenticated source intake</p></div><button type="button" onClick={() => setShowUploadModal(false)} disabled={uploading} aria-label="Close"><X size={17} /></button></header>
          <div className="dd-modal-body dd-ingestion-upload-form">
            <label><span>Source class</span><select className="dd-select-control" value={uploadTarget} onChange={(event) => setUploadTarget(event.target.value)}>{INGESTION_TARGETS.map((target) => <option key={target.value} value={target.value}>{target.label}</option>)}</select></label>
            <label><span>Source file</span><input type="file" onChange={(event) => setUploadFile(event.target.files?.[0] || null)} accept={allowedExtensions.join(',')} required /></label>
            {uploadFile && <div className="dd-ingestion-selected-file"><FileCheck2 size={18} /><span><strong>{uploadFile.name}</strong><small>{formatBytes(uploadFile.size)}</small></span></div>}
            <div className="dd-register-note"><ShieldCheck size={14} /><span>The source file is retained in the selected repository class. Maximum file size: 100 MB.</span></div>
          </div>
          <footer><button type="button" className="dd-button dd-button-secondary" onClick={() => setShowUploadModal(false)} disabled={uploading}>Cancel</button><button type="submit" className="dd-button dd-button-primary" disabled={!uploadFile || uploading}>{uploading ? <Loader2 size={14} className="dd-spin" /> : <Upload size={14} />} {uploading ? 'Importing' : 'Import source'}</button></footer>
        </form>
      </div>}

      {selectedPublication && <div className="dd-modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setSelectedPublication(null); }}>
        <div className="dd-modal dd-gazette-detail-modal dd-ingestion-detail-modal" role="dialog" aria-modal="true" aria-labelledby="ingestion-detail-title">
          <header><div><h3 id="ingestion-detail-title">{selectedPublication.publication_title || 'Companies Bulletin'}{selectedPublication.volume_number ? `, Vol. ${selectedPublication.volume_number}` : ''}</h3><p>Source {String(selectedPublication.id).padStart(4, '0')}</p></div><button type="button" onClick={() => setSelectedPublication(null)} aria-label="Close"><X size={17} /></button></header>
          <div className="dd-modal-body">
            <div className="dd-gazette-facts"><div><BookOpenCheck size={16} /><span>Volume</span><strong>{selectedPublication.volume_number || 'Not recorded'}</strong></div><div><CalendarDays size={16} /><span>Published</span><strong>{formatDate(selectedPublication.publication_date || selectedPublication.issue_date)}</strong></div><div><FileText size={16} /><span>Document</span><strong>{formatNumber(selectedPublication.page_count)} pages</strong></div><div><CheckCircle2 size={16} /><span>Import</span><strong>{humanize(selectedPublication.import_status)}</strong></div></div>
            <div className="dd-gazette-detail-content dd-ingestion-detail-content"><dl className="dd-person-detail-list">{[
              ['Source authority', selectedPublication.source_authority], ['Jurisdiction', selectedPublication.jurisdiction], ['Source filename', selectedPublication.source_filename], ['File size', formatBytes(selectedPublication.file_size_bytes)], ['SHA-256', selectedPublication.source_sha256], ['Extraction method', humanize(selectedPublication.extraction_method)], ['Extraction version', selectedPublication.extraction_version], ['Text layer present', selectedPublication.source_metadata?.text_layer_present === true ? 'Yes' : selectedPublication.source_metadata?.text_layer_present === false ? 'No' : 'Not recorded'], ['Captured', formatDate(selectedPublication.captured_at, true)], ['Imported', formatDate(selectedPublication.imported_at, true)],
            ].map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value || 'Not recorded'}</dd></div>)}</dl></div>
          </div>
          <footer><button type="button" className="dd-button dd-button-secondary" onClick={() => setSelectedPublication(null)}>Close</button></footer>
        </div>
      </div>}

      {selectedFile && <div className="dd-modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) closePreview(); }}>
        <div className="dd-modal dd-ingestion-preview-modal" role="dialog" aria-modal="true" aria-labelledby="ingestion-preview-title">
          <header><div><h3 id="ingestion-preview-title">{selectedFile.name}</h3><p>{selectedFile.path}</p></div><button type="button" onClick={closePreview} aria-label="Close"><X size={17} /></button></header>
          <div className="dd-ingestion-preview-body">{selectedFile.extension === '.pdf' ? <iframe src={previewUrl} title={`Preview of ${selectedFile.name}`} /> : ['.jpg', '.jpeg', '.png', '.gif'].includes(String(selectedFile.extension).toLowerCase()) ? <img src={previewUrl} alt={selectedFile.name} /> : <pre>{previewUrl ? 'Preview loaded. Use Download for the retained source file.' : 'Preview not available.'}</pre>}</div>
          <footer><button type="button" className="dd-button dd-button-secondary" onClick={closePreview}>Close</button><button type="button" className="dd-button dd-button-primary" onClick={() => handleDownload(selectedFile)}><Download size={14} /> Download</button></footer>
        </div>
      </div>}
    </section>
  );
};

export default FileRepository;
