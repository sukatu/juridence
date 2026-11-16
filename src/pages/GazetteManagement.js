import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AlertCircle, CalendarDays, CheckCircle, ChevronLeft, ChevronRight, Church,
  Clock, Download, Edit3, Eye, FileSpreadsheet, FileText, MapPin, Plus,
  Search, Sparkles, Star, Trash2, Upload, UserRound, X,
} from 'lucide-react';
import { apiDelete, apiGet, apiPost, apiPut } from '../utils/api';
import AdminHeader from '../components/admin/AdminHeader';
import { ToastContainer, useToast } from '../components/Toast';
import {
  Badge, Button, Checkbox, IconButton, Input, PageHeader, Panel, Select, Textarea,
} from '../components/ui';

const GAZETTE_TYPES = [
  { value: 'CHANGE_OF_NAME', label: 'Change of name', shortLabel: 'Names', icon: UserRound, endpoint: '/change-of-name/' },
  { value: 'CHANGE_OF_DATE_OF_BIRTH', label: 'Date of birth', shortLabel: 'Dates', icon: CalendarDays, endpoint: '/correction-of-date-of-birth/' },
  { value: 'CHANGE_OF_PLACE_OF_BIRTH', label: 'Place of birth', shortLabel: 'Places', icon: MapPin, endpoint: '/correction-of-place-of-birth/' },
  { value: 'APPOINTMENT_OF_MARRIAGE_OFFICERS', label: 'Marriage officers', shortLabel: 'Officers', icon: Church, endpoint: '/marriage-officers/' },
];

const STATUS_VARIANTS = { PUBLISHED: 'success', DRAFT: 'warning', ARCHIVED: 'neutral', CANCELLED: 'danger' };
const PRIORITY_VARIANTS = { LOW: 'success', MEDIUM: 'info', HIGH: 'warning', URGENT: 'danger' };

const createEmptyForm = () => ({
  title: '', description: '', content: '', summary: '', gazette_type: 'CHANGE_OF_NAME',
  priority: 'MEDIUM', publication_date: new Date().toISOString().split('T')[0],
  effective_date: '', expiry_date: '', source: '', reference_number: '',
  gazette_number: '', page_number: '', jurisdiction: '', court_location: '',
  person_id: '', company_id: '', bank_id: '', insurance_id: '', keywords: [], tags: [],
  is_public: true, is_featured: false, item_number: '', old_name: '', alias_names: [],
  new_name: '', profession: '', effective_date_of_change: '', remarks: '',
  old_date_of_birth: '', new_date_of_birth: '', place_of_birth: '',
  old_place_of_birth: '', new_place_of_birth: '', officer_name: '', officer_title: '',
  appointment_authority: '', jurisdiction_area: '', gazette_date: '', gazette_page: '',
  source_item_number: '',
});

const dateInput = (value, fallback = '') => value ? String(value).split('T')[0] : fallback;
const formatDate = (value, empty = 'Not provided') => {
  if (!value) return empty;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
};
const formatLabel = (value) => value ? value.replace(/_/g, ' ').replace(/\b\w/g, (letter) => letter.toUpperCase()) : 'Not provided';
const stripHtml = (value = '') => value.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();

const normalizeGazette = (item, type) => {
  if (type === 'CHANGE_OF_NAME') return {
    ...item, title: item.new_name || item.old_name || 'Change of name',
    description: `${item.old_name || 'Not provided'} to ${item.new_name || 'Not provided'}`,
    gazette_type: type, status: item.status || 'PUBLISHED', priority: item.priority || 'MEDIUM',
    publication_date: item.gazette_date || item.effective_date || item.created_at,
    source: item.gazette_number || item.source_details || 'Not provided',
  };
  if (type === 'CHANGE_OF_DATE_OF_BIRTH') return {
    ...item, title: item.person_name || 'Date of birth correction',
    description: `${item.old_date_of_birth || 'Not provided'} to ${item.new_date_of_birth || 'Not provided'}`,
    gazette_type: type, status: item.status || 'PUBLISHED', priority: item.priority || 'MEDIUM',
    publication_date: item.gazette_date || item.effective_date || item.created_at,
    source: item.source_details || item.gazette_number || 'Not provided',
  };
  if (type === 'CHANGE_OF_PLACE_OF_BIRTH') return {
    ...item, title: item.person_name || 'Place of birth correction',
    description: `${item.old_place_of_birth || 'Not provided'} to ${item.new_place_of_birth || 'Not provided'}`,
    gazette_type: type, status: item.status || 'PUBLISHED', priority: item.priority || 'MEDIUM',
    publication_date: item.gazette_date || item.effective_date || item.created_at,
    source: item.source_details || item.gazette_number || 'Not provided',
  };
  return {
    ...item, title: item.officer_name || 'Marriage officer appointment',
    description: [item.church, item.location].filter(Boolean).join(' / ') || 'Appointment notice',
    gazette_type: type, status: item.status || 'PUBLISHED', priority: item.priority || 'MEDIUM',
    publication_date: item.gazette_date || item.appointment_date || item.created_at,
    source: item.source_details || item.gazette_number || 'Not provided',
  };
};

const formFromGazette = (gazette) => ({
  ...createEmptyForm(), ...gazette,
  description: stripHtml(gazette.description || ''),
  content: stripHtml(gazette.content || ''),
  remarks: stripHtml(gazette.remarks || ''),
  publication_date: dateInput(gazette.publication_date),
  effective_date: dateInput(gazette.effective_date),
  expiry_date: dateInput(gazette.expiry_date),
  effective_date_of_change: dateInput(gazette.effective_date_of_change),
  old_date_of_birth: dateInput(gazette.old_date_of_birth),
  new_date_of_birth: dateInput(gazette.new_date_of_birth),
  gazette_date: dateInput(gazette.gazette_date),
  keywords: gazette.keywords || [], tags: gazette.tags || [], alias_names: gazette.alias_names || [],
  is_public: gazette.is_public !== undefined ? gazette.is_public : true,
  is_featured: Boolean(gazette.is_featured),
});

const Modal = ({ title, description, onClose, children, size = 'max-w-4xl' }) => (
  <div className="fixed inset-0 z-50 flex items-end justify-center bg-[#102033]/60 p-0 sm:items-center sm:p-4" role="dialog" aria-modal="true" aria-label={title}>
    <div className={`max-h-[94vh] w-full overflow-y-auto rounded-t-lg bg-white shadow-2xl sm:rounded-lg ${size}`}>
      <div className="sticky top-0 z-30 flex items-start justify-between gap-4 border-b border-[#e3eaed] bg-white px-5 py-4 sm:px-6">
        <div><h2 className="text-lg font-semibold text-[#17334a]">{title}</h2>{description && <p className="mt-1 text-sm leading-5 text-[#71818a]">{description}</p>}</div>
        <IconButton label="Close dialog" onClick={onClose} className="-mr-2 -mt-1 shrink-0"><X size={19} /></IconButton>
      </div>
      {children}
    </div>
  </div>
);

const RichField = ({ label, value, onChange, required, height = 130 }) => (
  <Textarea
    label={label}
    value={value}
    onChange={(event) => onChange(event.target.value)}
    required={required}
    rows={height >= 180 ? 8 : 5}
    className="sm:col-span-2"
  />
);

const GazetteForm = ({ formData, setFormData, onSubmit, onCancel, saving, mode, error }) => {
  const setField = (field, value) => setFormData((current) => ({ ...current, [field]: value }));
  const listValue = (value) => Array.isArray(value) ? value.join(', ') : value || '';
  const setList = (field, value) => setField(field, value.split(',').map((item) => item.trim()).filter(Boolean));
  return (
    <form onSubmit={onSubmit}>
      <div className="space-y-7 p-5 sm:p-6">
        {error && <div className="rounded-lg border border-[#f1c7cd] bg-[#fff5f6] p-3 text-sm text-[#a82e3d]">{error}</div>}

        <section>
          <h3 className="font-semibold text-[#17334a]">Notice details</h3>
          <p className="mt-1 text-xs text-[#7a8991]">Core publishing and classification information.</p>
          <div className="mt-4 grid gap-5 sm:grid-cols-2">
            <Input label="Title" value={formData.title} onChange={(event) => setField('title', event.target.value)} required className="sm:col-span-2" />
            <Select label="Notice type" value={formData.gazette_type} onChange={(event) => setField('gazette_type', event.target.value)} required>
              {GAZETTE_TYPES.map((type) => <option key={type.value} value={type.value}>{type.label}</option>)}
            </Select>
            <Select label="Priority" value={formData.priority} onChange={(event) => setField('priority', event.target.value)}>
              <option value="LOW">Low</option><option value="MEDIUM">Medium</option><option value="HIGH">High</option><option value="URGENT">Urgent</option>
            </Select>
            <Input label="Publication date" type="date" value={formData.publication_date} onChange={(event) => setField('publication_date', event.target.value)} required />
            <Input label="Source" value={formData.source} onChange={(event) => setField('source', event.target.value)} placeholder="Gazette or issuing authority" />
            <RichField label="Description" value={formData.description} onChange={(value) => setField('description', value)} />
            <RichField label="Notice content" value={formData.content} onChange={(value) => setField('content', value)} required height={190} />
          </div>
        </section>

        <section className="border-t border-[#e3eaed] pt-6">
          <h3 className="font-semibold text-[#17334a]">Legal notice fields</h3>
          <p className="mt-1 text-xs text-[#7a8991]">Fields shown here follow the selected notice type.</p>
          <div className="mt-4 grid gap-5 sm:grid-cols-2">
            {formData.gazette_type === 'CHANGE_OF_NAME' && <>
              <Input label="Item number" value={formData.item_number} onChange={(event) => setField('item_number', event.target.value)} />
              <Input label="Source item number" value={formData.source_item_number} onChange={(event) => setField('source_item_number', event.target.value)} />
              <Input label="Old name" value={formData.old_name} onChange={(event) => setField('old_name', event.target.value)} />
              <Input label="New name" value={formData.new_name} onChange={(event) => setField('new_name', event.target.value)} />
              <Input label="Aliases" value={listValue(formData.alias_names)} onChange={(event) => setList('alias_names', event.target.value)} hint="Separate multiple aliases with commas" />
              <Input label="Profession" value={formData.profession} onChange={(event) => setField('profession', event.target.value)} />
              <Input label="Effective date of change" type="date" value={formData.effective_date_of_change} onChange={(event) => setField('effective_date_of_change', event.target.value)} />
              <Input label="Gazette page" type="number" value={formData.gazette_page} onChange={(event) => setField('gazette_page', event.target.value)} />
            </>}
            {formData.gazette_type === 'CHANGE_OF_DATE_OF_BIRTH' && <>
              <Input label="Old date of birth" type="date" value={formData.old_date_of_birth} onChange={(event) => setField('old_date_of_birth', event.target.value)} />
              <Input label="New date of birth" type="date" value={formData.new_date_of_birth} onChange={(event) => setField('new_date_of_birth', event.target.value)} />
              <Input label="Place of birth" value={formData.place_of_birth} onChange={(event) => setField('place_of_birth', event.target.value)} className="sm:col-span-2" />
            </>}
            {formData.gazette_type === 'CHANGE_OF_PLACE_OF_BIRTH' && <>
              <Input label="Old place of birth" value={formData.old_place_of_birth} onChange={(event) => setField('old_place_of_birth', event.target.value)} />
              <Input label="New place of birth" value={formData.new_place_of_birth} onChange={(event) => setField('new_place_of_birth', event.target.value)} />
            </>}
            {formData.gazette_type === 'APPOINTMENT_OF_MARRIAGE_OFFICERS' && <>
              <Input label="Officer name" value={formData.officer_name} onChange={(event) => setField('officer_name', event.target.value)} />
              <Input label="Officer title" value={formData.officer_title} onChange={(event) => setField('officer_title', event.target.value)} />
              <Input label="Appointment authority" value={formData.appointment_authority} onChange={(event) => setField('appointment_authority', event.target.value)} />
              <Input label="Jurisdiction area" value={formData.jurisdiction_area} onChange={(event) => setField('jurisdiction_area', event.target.value)} />
            </>}
            <Input label="Gazette number" value={formData.gazette_number} onChange={(event) => setField('gazette_number', event.target.value)} />
            <Input label="Gazette date" type="date" value={formData.gazette_date} onChange={(event) => setField('gazette_date', event.target.value)} />
            <RichField label="Remarks" value={formData.remarks} onChange={(value) => setField('remarks', value)} />
          </div>
        </section>

        <section className="border-t border-[#e3eaed] pt-6">
          <h3 className="font-semibold text-[#17334a]">Reference and visibility</h3>
          <div className="mt-4 grid gap-5 sm:grid-cols-2">
            <Input label="Reference number" value={formData.reference_number} onChange={(event) => setField('reference_number', event.target.value)} />
            <Input label="Page number" type="number" value={formData.page_number} onChange={(event) => setField('page_number', event.target.value)} />
            <Input label="Jurisdiction" value={formData.jurisdiction} onChange={(event) => setField('jurisdiction', event.target.value)} />
            <Input label="Court location" value={formData.court_location} onChange={(event) => setField('court_location', event.target.value)} />
            <Input label="Effective date" type="date" value={formData.effective_date} onChange={(event) => setField('effective_date', event.target.value)} />
            <Input label="Expiry date" type="date" value={formData.expiry_date} onChange={(event) => setField('expiry_date', event.target.value)} />
            <Input label="Keywords" value={listValue(formData.keywords)} onChange={(event) => setList('keywords', event.target.value)} hint="Comma-separated" />
            <Input label="Tags" value={listValue(formData.tags)} onChange={(event) => setList('tags', event.target.value)} hint="Comma-separated" />
            <div className="grid gap-4 rounded-lg border border-[#d9e2e6] bg-[#f8faf9] p-4 sm:col-span-2 sm:grid-cols-2">
              <Checkbox label="Public notice" description="Visible to users outside the admin workspace." checked={formData.is_public} onChange={(event) => setField('is_public', event.target.checked)} />
              <Checkbox label="Featured notice" description="Prioritise this notice in featured views." checked={formData.is_featured} onChange={(event) => setField('is_featured', event.target.checked)} />
            </div>
          </div>
        </section>
      </div>
      <div className="sticky bottom-0 z-20 flex flex-col-reverse gap-2 border-t border-[#e3eaed] bg-white px-5 py-4 sm:flex-row sm:justify-end sm:px-6">
        <Button variant="outline" onClick={onCancel}>Cancel</Button>
        <Button type="submit" loading={saving}>{mode === 'create' ? 'Create notice' : 'Save changes'}</Button>
      </div>
    </form>
  );
};

const GazetteManagement = ({ userInfo, onNavigate, onLogout }) => {
  const navigate = useNavigate();
  const { toasts, success, error: showError, removeToast } = useToast();
  const [gazettes, setGazettes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [gazetteError, setGazetteError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeType, setActiveType] = useState('CHANGE_OF_NAME');
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, total_pages: 1 });
  const [activeDialog, setActiveDialog] = useState(null);
  const [selectedGazette, setSelectedGazette] = useState(null);
  const [formData, setFormData] = useState(createEmptyForm);
  const [formError, setFormError] = useState(null);
  const [saving, setSaving] = useState(false);
  const [importFile, setImportFile] = useState(null);
  const [importType, setImportType] = useState('CHANGE_OF_NAME');
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState(null);

  const activeTypeInfo = GAZETTE_TYPES.find((type) => type.value === activeType) || GAZETTE_TYPES[0];

  const loadGazettes = async () => {
    const typeInfo = GAZETTE_TYPES.find((type) => type.value === activeType) || GAZETTE_TYPES[0];
    try {
      setLoading(true); setGazetteError(null);
      const params = new URLSearchParams({ page: pagination.page.toString(), limit: pagination.limit.toString() });
      if (searchTerm.trim()) params.append('search', searchTerm.trim());
      const response = await apiGet(`${typeInfo.endpoint}?${params}`);
      setGazettes((response?.results || []).map((item) => normalizeGazette(item, activeType)));
      setPagination((current) => ({ ...current, total: response?.total || 0, total_pages: Math.max(response?.total_pages || 1, 1) }));
    } catch (error) {
      console.error('Error loading gazettes:', error);
      const detail = error?.data?.detail || error?.message || 'Unable to load notices';
      setGazetteError(detail); setGazettes([]);
      setPagination((current) => ({ ...current, total: 0, total_pages: 1 }));
    } finally { setLoading(false); }
  };

  const loadStats = async () => {
    try { setStats(await apiGet('/gazette/stats/overview')); }
    catch (error) { console.error('Error loading gazette statistics:', error); }
  };

  useEffect(() => {
    const timer = window.setTimeout(loadGazettes, searchTerm ? 250 : 0);
    return () => window.clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pagination.page, activeType, searchTerm]);

  useEffect(() => {
    loadStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const closeDialog = () => {
    setActiveDialog(null); setSelectedGazette(null); setFormError(null); setSaving(false);
    setImportResult(null); setImportFile(null); setImporting(false);
  };

  const openCreate = () => {
    setFormData({ ...createEmptyForm(), gazette_type: activeType }); setFormError(null); setActiveDialog('create');
  };

  const openEdit = (gazette) => {
    setSelectedGazette(gazette); setFormData(formFromGazette(gazette)); setFormError(null); setActiveDialog('edit');
  };

  const handleSave = async (event) => {
    event.preventDefault();
    if (!formData.title.trim()) { setFormError('Title is required'); return; }
    const plainContent = stripHtml(formData.content);
    if (!plainContent) { setFormError('Notice content is required'); return; }
    try {
      setSaving(true); setFormError(null);
      if (activeDialog === 'edit') await apiPut(`/gazette/${selectedGazette.id}`, formData);
      else await apiPost('/gazette', formData);
      success(activeDialog === 'edit' ? 'Gazette notice updated' : 'Gazette notice created');
      closeDialog(); await Promise.all([loadGazettes(), loadStats()]);
    } catch (error) {
      console.error('Error saving gazette:', error);
      setFormError(error?.detail || error?.message || 'Failed to save gazette notice');
    } finally { setSaving(false); }
  };

  const requestDelete = (gazette) => { setSelectedGazette(gazette); setActiveDialog('delete'); };

  const handleDelete = async () => {
    try {
      setSaving(true); await apiDelete(`/gazette/${selectedGazette.id}`);
      success('Gazette notice removed'); closeDialog(); await Promise.all([loadGazettes(), loadStats()]);
    } catch (error) {
      console.error('Error deleting gazette:', error);
      showError(error?.message || 'Failed to remove gazette notice');
    } finally { setSaving(false); }
  };

  const handleFileUpload = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!/\.(xlsx|xls)$/i.test(file.name)) {
      showError('Select a valid Excel file (.xlsx or .xls)'); event.target.value = ''; return;
    }
    setImportFile(file); setImportResult(null);
  };

  const handleImport = async (event) => {
    event.preventDefault();
    if (!importFile) { showError('Select an Excel file to import'); return; }
    try {
      setImporting(true); setImportResult(null);
      const body = new FormData(); body.append('file', importFile); body.append('gazette_type', importType);
      const apiRoot = process.env.REACT_APP_API_URL || '/api';
      const response = await fetch(`${apiRoot.replace(/\/$/, '')}/gazette/import-excel`, {
        method: 'POST', body,
        headers: localStorage.getItem('accessToken') ? { Authorization: `Bearer ${localStorage.getItem('accessToken')}` } : {},
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.detail || 'Import failed');
      setImportResult({ success: true, message: `Imported ${result.imported_count || 0} gazette entries` });
      setImportFile(null); success('Gazette import completed');
      await Promise.all([loadGazettes(), loadStats()]);
    } catch (error) {
      console.error('Error importing gazette file:', error);
      setImportResult({ success: false, message: error.message || 'Import failed' });
    } finally { setImporting(false); }
  };

  const handleExport = () => {
    if (!gazettes.length) { showError('There are no notices to export'); return; }
    const columns = [
      ['Title', (item) => item.title], ['Type', (item) => formatLabel(item.gazette_type)],
      ['Status', (item) => formatLabel(item.status)], ['Priority', (item) => formatLabel(item.priority)],
      ['Publication date', (item) => formatDate(item.publication_date, '')], ['Source', (item) => item.source],
    ];
    const escape = (value) => `"${String(value ?? '').replace(/"/g, '""')}"`;
    const csv = [columns.map(([label]) => escape(label)).join(','), ...gazettes.map((item) => columns.map(([, get]) => escape(get(item))).join(','))].join('\n');
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8;' }));
    const link = document.createElement('a'); link.href = url;
    link.download = `juridence-gazette-${activeType.toLowerCase().replace(/_/g, '-')}-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link); link.click(); document.body.removeChild(link); URL.revokeObjectURL(url);
    success(`Exported ${gazettes.length} notice${gazettes.length === 1 ? '' : 's'}`);
  };

  const changeType = (type) => {
    setActiveType(type); setSearchTerm(''); setPagination((current) => ({ ...current, page: 1 }));
  };

  const currentPublished = gazettes.filter((item) => item.status === 'PUBLISHED').length;
  const statsCards = [
    { label: `${activeTypeInfo.label} records`, value: pagination.total, icon: FileText, tone: 'text-[#245b8f]', bg: 'bg-[#e7f0f8]' },
    { label: 'Published on page', value: currentPublished, icon: CheckCircle, tone: 'text-[#0c6b4a]', bg: 'bg-[#e2f4eb]' },
    { label: 'Draft notices', value: stats?.draft_gazettes ?? 0, icon: Clock, tone: 'text-[#8b5a10]', bg: 'bg-[#fff2d9]' },
    { label: 'Featured notices', value: stats?.featured_gazettes ?? 0, icon: Star, tone: 'text-[#6b4f9a]', bg: 'bg-[#f0ebf7]' },
  ];

  return (
    <div className="ui-page">
      <AdminHeader userInfo={userInfo} onNavigate={onNavigate} onLogout={onLogout} contextLabel="Gazette" />
      <main className="ui-page-content">
        <PageHeader eyebrow="Legal data" title="Gazette" description="Manage official notices, legal corrections and appointment records."
          actions={<><Button variant="outline" icon={<Sparkles size={17} />} onClick={() => navigate('/gazette-ai-search')}>AI search</Button><Button variant="outline" icon={<Upload size={17} />} onClick={() => { setImportType(activeType); setActiveDialog('import'); }}>Import Excel</Button><Button icon={<Plus size={17} />} onClick={openCreate}>Add notice</Button></>}
        />

        <section className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4" aria-label="Gazette summary">
          {statsCards.map(({ label, value, icon: Icon, tone, bg }) => <div key={label} className="flex min-h-[112px] items-center gap-3 rounded-lg border border-[#d9e2e6] bg-white p-4 shadow-sm sm:gap-4 sm:p-5"><span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg sm:h-11 sm:w-11 ${bg} ${tone}`}><Icon size={20} /></span><div className="min-w-0"><p className="text-2xl font-semibold leading-none text-[#17334a]">{value}</p><p className="mt-2 text-xs font-medium leading-4 text-[#71818a] sm:text-sm">{label}</p></div></div>)}
        </section>

        <Panel title={activeTypeInfo.label} description={`${pagination.total} notice${pagination.total === 1 ? '' : 's'} in this collection`} bodyClassName="!p-0">
          <div className="border-b border-[#e3eaed] px-4 py-4 sm:px-6">
            <div className="flex gap-1 overflow-x-auto rounded-lg bg-[#edf2f3] p-1" role="tablist" aria-label="Gazette notice type">
              {GAZETTE_TYPES.map((type) => {
                const TypeIcon = type.icon;
                return <button key={type.value} type="button" role="tab" aria-selected={activeType === type.value} onClick={() => changeType(type.value)} className={`flex min-h-[38px] shrink-0 items-center justify-center gap-2 rounded-md px-3 text-sm font-semibold transition-colors sm:flex-1 ${activeType === type.value ? 'bg-white text-[#17334a] shadow-sm' : 'text-[#60737d] hover:text-[#17334a]'}`}><TypeIcon size={15} /><span className="hidden xl:inline">{type.label}</span><span className="xl:hidden">{type.shortLabel}</span></button>;
              })}
            </div>
            <div className="mt-4 flex flex-col gap-3 sm:flex-row">
              <Input aria-label={`Search ${activeTypeInfo.label.toLowerCase()}`} leadingIcon={<Search size={18} />} placeholder={`Search ${activeTypeInfo.label.toLowerCase()}`} value={searchTerm} onChange={(event) => { setSearchTerm(event.target.value); setPagination((current) => ({ ...current, page: 1 })); }} className="flex-1" />
              {searchTerm && <Button variant="ghost" onClick={() => setSearchTerm('')}>Clear search</Button>}
              <Button variant="outline" icon={<Download size={16} />} onClick={handleExport}>Export</Button>
            </div>
          </div>

          {gazetteError && <div className="m-4 flex items-start gap-3 rounded-lg border border-[#f1c7cd] bg-[#fff5f6] p-4 text-sm text-[#a82e3d] sm:m-6"><AlertCircle size={18} className="mt-0.5 shrink-0" /><span>{gazetteError}</span></div>}

          {loading ? (
            <div className="flex min-h-[300px] flex-col items-center justify-center px-6 text-center"><span className="h-8 w-8 animate-spin rounded-full border-2 border-[#c7d3d8] border-t-[#17875a]" /><p className="mt-4 text-sm font-medium text-[#60737d]">Loading notices...</p></div>
          ) : gazettes.length === 0 ? (
            <div className="flex min-h-[300px] flex-col items-center justify-center px-6 text-center"><span className="flex h-12 w-12 items-center justify-center rounded-lg bg-[#edf2f3] text-[#60737d]"><FileText size={23} /></span><h3 className="mt-4 font-semibold text-[#17334a]">No notices found</h3><p className="mt-1 max-w-sm text-sm leading-6 text-[#71818a]">{searchTerm ? 'Try a different search or clear the query.' : `Add or import the first ${activeTypeInfo.label.toLowerCase()} notice.`}</p><Button icon={<Plus size={16} />} onClick={openCreate} className="mt-5">Add notice</Button></div>
          ) : (
            <>
              <div className="hidden overflow-x-auto lg:block"><table className="w-full min-w-[1000px]"><thead><tr className="bg-[#f7f9fa] text-left"><th className="px-6 py-3">Notice</th><th className="px-4 py-3">Type</th><th className="px-4 py-3">Status</th><th className="px-4 py-3">Priority</th><th className="px-4 py-3">Published</th><th className="px-4 py-3">Source</th><th className="px-6 py-3 text-right">Actions</th></tr></thead><tbody>
                {gazettes.map((gazette) => <tr key={gazette.id} className="border-t border-[#e7edef] hover:bg-[#f8faf9]"><td className="max-w-[320px] px-6 py-4"><p className="truncate font-semibold text-[#20384c]">{gazette.title}</p><p className="mt-0.5 truncate text-xs text-[#71818a]">{stripHtml(gazette.description) || 'No description'}</p></td><td className="px-4 py-4"><Badge variant="info">{GAZETTE_TYPES.find((type) => type.value === gazette.gazette_type)?.label || formatLabel(gazette.gazette_type)}</Badge></td><td className="px-4 py-4"><Badge variant={STATUS_VARIANTS[gazette.status] || 'neutral'}>{formatLabel(gazette.status)}</Badge></td><td className="px-4 py-4"><Badge variant={PRIORITY_VARIANTS[gazette.priority] || 'neutral'}>{formatLabel(gazette.priority)}</Badge></td><td className="whitespace-nowrap px-4 py-4 text-sm text-[#60737d]">{formatDate(gazette.publication_date)}</td><td className="max-w-[180px] px-4 py-4"><p className="truncate text-sm text-[#405867]">{gazette.source || 'Not provided'}</p></td><td className="px-6 py-4"><div className="flex justify-end gap-0.5"><IconButton label={`View ${gazette.title}`} size="sm" onClick={() => { setSelectedGazette(gazette); setActiveDialog('view'); }}><Eye size={16} /></IconButton><IconButton label={`Edit ${gazette.title}`} size="sm" onClick={() => openEdit(gazette)}><Edit3 size={16} /></IconButton><IconButton label={`Delete ${gazette.title}`} size="sm" className="text-[#a82e3d] hover:!bg-[#fff0f1] hover:!text-[#962535]" onClick={() => requestDelete(gazette)}><Trash2 size={16} /></IconButton></div></td></tr>)}
              </tbody></table></div>
              <div className="divide-y divide-[#e7edef] lg:hidden">{gazettes.map((gazette) => <article key={gazette.id} className="px-4 py-5 sm:px-6"><div className="flex flex-wrap items-start justify-between gap-2"><div className="min-w-0 flex-1"><h3 className="font-semibold text-[#20384c]">{gazette.title}</h3><p className="mt-1 line-clamp-2 text-xs leading-5 text-[#71818a]">{stripHtml(gazette.description) || 'No description'}</p></div><Badge variant={STATUS_VARIANTS[gazette.status] || 'neutral'}>{formatLabel(gazette.status)}</Badge></div><div className="mt-3 grid grid-cols-2 gap-3 text-xs"><p className="text-[#71818a]">Published <span className="block font-semibold text-[#405867]">{formatDate(gazette.publication_date)}</span></p><p className="min-w-0 text-[#71818a]">Source <span className="block truncate font-semibold text-[#405867]">{gazette.source || 'Not provided'}</span></p></div><div className="mt-4 flex justify-end border-t border-[#edf1f3] pt-2"><IconButton label={`View ${gazette.title}`} size="sm" onClick={() => { setSelectedGazette(gazette); setActiveDialog('view'); }}><Eye size={16} /></IconButton><IconButton label={`Edit ${gazette.title}`} size="sm" onClick={() => openEdit(gazette)}><Edit3 size={16} /></IconButton><IconButton label={`Delete ${gazette.title}`} size="sm" className="text-[#a82e3d] hover:!bg-[#fff0f1] hover:!text-[#962535]" onClick={() => requestDelete(gazette)}><Trash2 size={16} /></IconButton></div></article>)}</div>
            </>
          )}

          {!loading && gazettes.length > 0 && <div className="flex flex-col gap-3 border-t border-[#e3eaed] px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6"><p className="text-xs font-medium text-[#71818a]">Page {pagination.page} of {pagination.total_pages} / {pagination.total} notices</p><div className="flex gap-2"><Button variant="outline" size="sm" icon={<ChevronLeft size={16} />} disabled={pagination.page <= 1} onClick={() => setPagination((current) => ({ ...current, page: current.page - 1 }))}>Previous</Button><Button variant="outline" size="sm" icon={<ChevronRight size={16} />} iconPosition="right" disabled={pagination.page >= pagination.total_pages} onClick={() => setPagination((current) => ({ ...current, page: current.page + 1 }))}>Next</Button></div></div>}
        </Panel>
      </main>

      {(activeDialog === 'create' || activeDialog === 'edit') && <Modal title={activeDialog === 'create' ? 'Add gazette notice' : 'Edit gazette notice'} description="Create and publish structured legal notice information." onClose={closeDialog}><GazetteForm formData={formData} setFormData={setFormData} onSubmit={handleSave} onCancel={closeDialog} saving={saving} mode={activeDialog} error={formError} /></Modal>}

      {activeDialog === 'view' && selectedGazette && <Modal title="Gazette notice" description={GAZETTE_TYPES.find((type) => type.value === selectedGazette.gazette_type)?.label} onClose={closeDialog} size="max-w-2xl"><div className="p-5 sm:p-6"><div className="flex flex-wrap items-center gap-2"><Badge variant={STATUS_VARIANTS[selectedGazette.status] || 'neutral'}>{formatLabel(selectedGazette.status)}</Badge><Badge variant={PRIORITY_VARIANTS[selectedGazette.priority] || 'neutral'}>{formatLabel(selectedGazette.priority)}</Badge></div><h3 className="mt-4 text-xl font-semibold text-[#17334a]">{selectedGazette.title}</h3><p className="mt-2 text-sm leading-6 text-[#60737d]">{stripHtml(selectedGazette.description) || 'No description provided.'}</p><dl className="mt-6 grid gap-5 border-t border-[#e3eaed] pt-5 sm:grid-cols-2"><div><dt className="text-xs font-semibold uppercase text-[#7a8991]">Publication date</dt><dd className="mt-1 text-sm font-medium text-[#20384c]">{formatDate(selectedGazette.publication_date)}</dd></div><div><dt className="text-xs font-semibold uppercase text-[#7a8991]">Source</dt><dd className="mt-1 text-sm font-medium text-[#20384c]">{selectedGazette.source || 'Not provided'}</dd></div><div><dt className="text-xs font-semibold uppercase text-[#7a8991]">Gazette number</dt><dd className="mt-1 text-sm font-medium text-[#20384c]">{selectedGazette.gazette_number || 'Not provided'}</dd></div><div><dt className="text-xs font-semibold uppercase text-[#7a8991]">Reference</dt><dd className="mt-1 text-sm font-medium text-[#20384c]">{selectedGazette.reference_number || selectedGazette.item_number || 'Not provided'}</dd></div></dl></div><div className="flex justify-end gap-2 border-t border-[#e3eaed] px-5 py-4 sm:px-6"><Button variant="outline" onClick={closeDialog}>Close</Button><Button icon={<Edit3 size={16} />} onClick={() => openEdit(selectedGazette)}>Edit notice</Button></div></Modal>}

      {activeDialog === 'delete' && selectedGazette && <Modal title="Remove gazette notice" description="This action cannot be undone." onClose={closeDialog} size="max-w-md"><div className="p-5 sm:p-6"><div className="flex items-start gap-3 rounded-lg border border-[#f1c7cd] bg-[#fff5f6] p-4"><span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#fff0f1] text-[#a82e3d]"><Trash2 size={18} /></span><p className="text-sm leading-6 text-[#405867]">Remove <strong className="text-[#20384c]">{selectedGazette.title}</strong> from the gazette?</p></div></div><div className="flex flex-col-reverse gap-2 border-t border-[#e3eaed] px-5 py-4 sm:flex-row sm:justify-end sm:px-6"><Button variant="outline" onClick={closeDialog}>Cancel</Button><Button variant="danger" loading={saving} icon={<Trash2 size={16} />} onClick={handleDelete}>Remove notice</Button></div></Modal>}

      {activeDialog === 'import' && <Modal title="Import gazette data" description="Add structured notices from an Excel workbook." onClose={closeDialog} size="max-w-lg"><form onSubmit={handleImport}><div className="space-y-5 p-5 sm:p-6"><Select label="Gazette type" value={importType} onChange={(event) => setImportType(event.target.value)}>{GAZETTE_TYPES.map((type) => <option key={type.value} value={type.value}>{type.label}</option>)}</Select><div><label className="ui-label" htmlFor="gazette-file-upload">Excel workbook</label><input id="gazette-file-upload" type="file" accept=".xlsx,.xls" onChange={handleFileUpload} className="sr-only" /><label htmlFor="gazette-file-upload" className="flex min-h-[150px] cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed border-[#aebdc4] bg-[#f8faf9] p-6 text-center transition-colors hover:border-[#17875a] hover:bg-[#f2f8f5]"><span className="flex h-11 w-11 items-center justify-center rounded-lg bg-[#e2f4eb] text-[#0c6b4a]"><FileSpreadsheet size={22} /></span><span className="mt-3 text-sm font-semibold text-[#405867]">{importFile ? importFile.name : 'Choose an Excel workbook'}</span><span className="mt-1 text-xs text-[#7a8991]">Supports .xlsx and .xls</span></label></div>{importResult && <div className={`flex items-start gap-3 rounded-lg border p-4 text-sm ${importResult.success ? 'border-[#b9decf] bg-[#f0faf5] text-[#0c6b4a]' : 'border-[#f1c7cd] bg-[#fff5f6] text-[#a82e3d]'}`}>{importResult.success ? <CheckCircle size={18} /> : <AlertCircle size={18} />}<span>{importResult.message}</span></div>}</div><div className="flex flex-col-reverse gap-2 border-t border-[#e3eaed] px-5 py-4 sm:flex-row sm:justify-end sm:px-6"><Button variant="outline" onClick={closeDialog}>Cancel</Button><Button type="submit" loading={importing} disabled={!importFile} icon={<Upload size={16} />}>Import data</Button></div></form></Modal>}

      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </div>
  );
};

export default GazetteManagement;
