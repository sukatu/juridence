import React, { useEffect, useState } from 'react';
import {
  AlertCircle, CalendarClock, ChevronLeft, ChevronRight, Church, Download,
  Edit3, Eye, FileEdit, MapPin, Plus, Search, Trash2, UserRound, Users, X,
} from 'lucide-react';
import { apiDelete, apiGet, apiPost, apiPut } from '../../utils/api';
import PersonDetails from './PersonDetails';
import AdminHeader from './AdminHeader';
import { ToastContainer, useToast } from '../Toast';
import { Badge, Button, IconButton, Input, PageHeader, Panel, Textarea } from '../ui';

const ITEMS_PER_PAGE = 20;

const TABS = [
  { id: 'people', label: 'People', shortLabel: 'People', icon: UserRound },
  { id: 'change_of_name', label: 'Change of name', shortLabel: 'Names', icon: FileEdit },
  { id: 'correction_of_place_of_birth', label: 'Place of birth', shortLabel: 'Places', icon: MapPin },
  { id: 'correction_of_date_of_birth', label: 'Date of birth', shortLabel: 'Dates', icon: CalendarClock },
  { id: 'marriage_officers', label: 'Marriage officers', shortLabel: 'Officers', icon: Church },
];

const FIELD_CONFIGS = {
  people: {
    title: 'Person', endpoint: '/api/people', responseKey: 'people', searchKey: 'query',
    fields: [
      { name: 'first_name', label: 'First name', required: true },
      { name: 'last_name', label: 'Last name', required: true },
      { name: 'full_name', label: 'Full name' },
      { name: 'phone_number', label: 'Phone' },
      { name: 'email', label: 'Email', type: 'email' },
      { name: 'city', label: 'City' },
      { name: 'region', label: 'Region' },
      { name: 'gender', label: 'Gender' },
      { name: 'occupation', label: 'Occupation' },
      { name: 'address', label: 'Address', multiline: true },
    ], numericFields: ['person_id'],
  },
  change_of_name: {
    title: 'Change of name', endpoint: '/api/change-of-name', responseKey: 'results', searchKey: 'search',
    fields: [
      { name: 'item_number', label: 'Item number', required: true },
      { name: 'old_name', label: 'Old name', required: true },
      { name: 'new_name', label: 'New name', required: true },
      { name: 'alias_name', label: 'Alias' },
      { name: 'profession', label: 'Profession' },
      { name: 'gender', label: 'Gender' },
      { name: 'address', label: 'Address', multiline: true },
      { name: 'town_city', label: 'Town / city' },
      { name: 'region', label: 'Region' },
      { name: 'effective_date', label: 'Effective date', type: 'date' },
      { name: 'gazette_number', label: 'Gazette number', required: true },
      { name: 'gazette_date', label: 'Gazette date', type: 'date', required: true },
      { name: 'page_number', label: 'Page number', type: 'number' },
      { name: 'document_filename', label: 'Document filename', required: true },
      { name: 'source_details', label: 'Source details', multiline: true },
      { name: 'source', label: 'Source' },
      { name: 'remarks', label: 'Remarks', multiline: true },
      { name: 'person_id', label: 'Person ID', type: 'number' },
    ], numericFields: ['page_number', 'person_id'],
  },
  correction_of_place_of_birth: {
    title: 'Place of birth correction', endpoint: '/api/correction-of-place-of-birth', responseKey: 'results', searchKey: 'search',
    fields: [
      { name: 'item_number', label: 'Item number', type: 'number', required: true },
      { name: 'person_name', label: 'Person name', required: true },
      { name: 'alias', label: 'Alias' },
      { name: 'profession', label: 'Profession' },
      { name: 'address', label: 'Address', multiline: true },
      { name: 'gender', label: 'Gender' },
      { name: 'old_place_of_birth', label: 'Old place of birth' },
      { name: 'new_place_of_birth', label: 'New place of birth' },
      { name: 'effective_date', label: 'Effective date', type: 'date' },
      { name: 'remarks', label: 'Remarks', multiline: true },
      { name: 'gazette_number', label: 'Gazette number', type: 'number' },
      { name: 'gazette_date', label: 'Gazette date', type: 'date' },
      { name: 'page', label: 'Page', type: 'number' },
      { name: 'document_filename', label: 'Document filename', required: true },
      { name: 'source_details', label: 'Source details', multiline: true },
      { name: 'person_id', label: 'Person ID', type: 'number' },
    ], numericFields: ['item_number', 'gazette_number', 'page', 'person_id'],
  },
  correction_of_date_of_birth: {
    title: 'Date of birth correction', endpoint: '/api/correction-of-date-of-birth', responseKey: 'results', searchKey: 'search',
    fields: [
      { name: 'item_number', label: 'Item number', required: true },
      { name: 'person_name', label: 'Person name', required: true },
      { name: 'alias', label: 'Alias' },
      { name: 'profession', label: 'Profession' },
      { name: 'address', label: 'Address', multiline: true },
      { name: 'gender', label: 'Gender' },
      { name: 'old_date_of_birth', label: 'Old date of birth', type: 'date' },
      { name: 'new_date_of_birth', label: 'New date of birth', type: 'date' },
      { name: 'effective_date', label: 'Effective date', type: 'date' },
      { name: 'remarks', label: 'Remarks', multiline: true },
      { name: 'gazette_number', label: 'Gazette number' },
      { name: 'gazette_date', label: 'Gazette date', type: 'date' },
      { name: 'page', label: 'Page', type: 'number' },
      { name: 'document_filename', label: 'Document filename', required: true },
      { name: 'source_details', label: 'Source details', multiline: true },
      { name: 'person_id', label: 'Person ID', type: 'number' },
    ], numericFields: ['page', 'person_id'],
  },
  marriage_officers: {
    title: 'Marriage officer', endpoint: '/api/marriage-officers', responseKey: 'results', searchKey: 'search',
    fields: [
      { name: 'officer_name', label: 'Officer name', required: true },
      { name: 'church', label: 'Church' },
      { name: 'location', label: 'Location' },
      { name: 'appointing_authority', label: 'Appointing authority' },
      { name: 'appointment_date', label: 'Appointment date', type: 'date' },
      { name: 'gazette_number', label: 'Gazette number' },
      { name: 'gazette_date', label: 'Gazette date', type: 'date' },
      { name: 'page_number', label: 'Page number', type: 'number' },
      { name: 'source_details', label: 'Source details', multiline: true },
      { name: 'document_filename', label: 'Document filename' },
      { name: 'person_id', label: 'Person ID', type: 'number' },
    ], numericFields: ['page_number', 'person_id'],
  },
};

const formatDate = (value, empty = 'Not provided') => {
  if (!value) return empty;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
};

const formatDateInput = (value) => {
  if (!value) return '';
  if (typeof value === 'string') return value.split('T')[0];
  try { return new Date(value).toISOString().split('T')[0]; } catch { return ''; }
};

const getPersonName = (person) => person.full_name || [person.first_name, person.last_name].filter(Boolean).join(' ') || 'Unnamed person';

const getRecordTitle = (tab, record) => {
  if (tab === 'people') return getPersonName(record);
  if (tab === 'change_of_name') return record.new_name || record.old_name || 'Name change record';
  if (tab === 'marriage_officers') return record.officer_name || 'Marriage officer';
  return record.person_name || 'Correction record';
};

const getRecordSubtitle = (tab, record) => {
  if (tab === 'people') return record.occupation || record.email || record.phone_number || 'Person record';
  if (tab === 'change_of_name') return record.old_name ? `Previously ${record.old_name}` : 'Gazette record';
  if (tab === 'marriage_officers') return record.church || record.location || 'Appointment record';
  return record.profession || record.alias || 'Gazette correction';
};

const getInitials = (value) => value.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]).join('').toUpperCase() || 'PR';

const Modal = ({ title, description, onClose, children, size = 'max-w-3xl' }) => (
  <div className="fixed inset-0 z-50 flex items-end justify-center bg-[#102033]/60 p-0 sm:items-center sm:p-4" role="dialog" aria-modal="true" aria-label={title}>
    <div className={`max-h-[94vh] w-full overflow-y-auto rounded-t-lg bg-white shadow-2xl sm:rounded-lg ${size}`}>
      <div className="sticky top-0 z-20 flex items-start justify-between gap-4 border-b border-[#e3eaed] bg-white px-5 py-4 sm:px-6">
        <div><h2 className="text-lg font-semibold text-[#17334a]">{title}</h2>{description && <p className="mt-1 text-sm leading-5 text-[#71818a]">{description}</p>}</div>
        <IconButton label="Close dialog" onClick={onClose} className="-mr-2 -mt-1 shrink-0"><X size={19} /></IconButton>
      </div>
      {children}
    </div>
  </div>
);

const RecordAvatar = ({ title }) => (
  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#e8f3ef] text-xs font-bold text-[#126b4c]" aria-hidden="true">{getInitials(title)}</span>
);

const RiskBadge = ({ record }) => {
  if (record.risk_score === undefined || record.risk_score === null) return <span className="text-sm text-[#7a8991]">Not scored</span>;
  const score = Math.round(record.risk_score);
  return <Badge variant={score >= 70 ? 'danger' : score >= 40 ? 'warning' : 'success'}>{score} / 100 {record.risk_level ? `- ${record.risk_level}` : ''}</Badge>;
};

const PeopleRelationshipsPage = ({ userInfo, onNavigate, onLogout }) => {
  const { toasts, success, error: showError, removeToast } = useToast();
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPerson, setSelectedPerson] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('people');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [activeDialog, setActiveDialog] = useState(null);
  const [formMode, setFormMode] = useState('create');
  const [formTab, setFormTab] = useState('people');
  const [formData, setFormData] = useState({});
  const [formError, setFormError] = useState(null);
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [recordToDelete, setRecordToDelete] = useState(null);

  const activeConfig = FIELD_CONFIGS[activeTab];
  const activeTabInfo = TABS.find((tab) => tab.id === activeTab) || TABS[0];

  const getInitialFormData = (tabId, record = null) => {
    const config = FIELD_CONFIGS[tabId];
    const data = {};
    config.fields.forEach((field) => {
      const value = record ? record[field.name] : '';
      data[field.name] = field.type === 'date' ? formatDateInput(value) : (value ?? '');
    });
    if (record?.id) data.id = record.id;
    return data;
  };

  const normalizeFormData = (tabId, data) => {
    const config = FIELD_CONFIGS[tabId];
    const normalized = { ...data };
    config.fields.forEach((field) => { if (normalized[field.name] === '') normalized[field.name] = null; });
    config.numericFields?.forEach((field) => {
      if (normalized[field] !== null && normalized[field] !== undefined && normalized[field] !== '') {
        const parsed = parseInt(normalized[field], 10);
        if (!Number.isNaN(parsed)) normalized[field] = parsed;
      }
    });
    if (tabId === 'people' && !normalized.full_name && (normalized.first_name || normalized.last_name)) {
      normalized.full_name = `${normalized.first_name || ''} ${normalized.last_name || ''}`.trim();
    }
    return normalized;
  };

  const loadList = async () => {
    const config = FIELD_CONFIGS[activeTab];
    try {
      setLoading(true);
      const params = new URLSearchParams({ page: currentPage.toString(), limit: ITEMS_PER_PAGE.toString() });
      if (searchTerm.trim()) params.append(config.searchKey, searchTerm.trim());
      const path = activeTab === 'people' ? `${config.endpoint}/search?${params}` : `${config.endpoint}?${params}`;
      const data = await apiGet(path);
      setRecords(data?.[config.responseKey] || []);
      setTotalPages(Math.max(data?.total_pages || 1, 1));
      setTotalItems(data?.total || 0);
    } catch (error) {
      console.error('Error loading people records:', error);
      setRecords([]); setTotalPages(1); setTotalItems(0);
      showError(`Failed to load ${activeTabInfo.label.toLowerCase()}`);
    } finally { setLoading(false); }
  };

  useEffect(() => {
    const timer = window.setTimeout(loadList, searchTerm ? 250 : 0);
    return () => window.clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, activeTab, searchTerm]);

  const changeTab = (tabId) => {
    setActiveTab(tabId); setSearchTerm(''); setCurrentPage(1);
  };

  const openCreate = () => {
    setFormTab(activeTab); setFormMode('create'); setFormData(getInitialFormData(activeTab));
    setFormError(null); setActiveDialog('form');
  };

  const openEdit = (record) => {
    setFormTab(activeTab); setFormMode('edit'); setFormData(getInitialFormData(activeTab, record));
    setFormError(null); setActiveDialog('form');
  };

  const closeDialog = () => {
    setActiveDialog(null); setFormError(null); setFormSubmitting(false); setRecordToDelete(null);
  };

  const handleFormSubmit = async (event) => {
    event.preventDefault();
    const config = FIELD_CONFIGS[formTab];
    const missing = config.fields.filter((field) => field.required && !formData[field.name]);
    if (missing.length) { setFormError(`Complete required fields: ${missing.map((field) => field.label).join(', ')}`); return; }
    try {
      setFormSubmitting(true); setFormError(null);
      const payload = normalizeFormData(formTab, formData);
      if (formMode === 'create') await apiPost(config.endpoint, payload);
      else await apiPut(`${config.endpoint}/${formData.id}`, payload);
      success(`${config.title} ${formMode === 'create' ? 'added' : 'updated'} successfully`);
      closeDialog(); await loadList();
    } catch (error) {
      console.error('Error saving record:', error);
      setFormError(error?.message || 'Failed to save record');
    } finally { setFormSubmitting(false); }
  };

  const requestDelete = (record) => { setRecordToDelete(record); setActiveDialog('delete'); };

  const handleDelete = async () => {
    if (!recordToDelete) return;
    try {
      setFormSubmitting(true);
      await apiDelete(`${activeConfig.endpoint}/${recordToDelete.id}`);
      success(`${activeConfig.title} removed successfully`);
      const returnToPreviousPage = records.length === 1 && currentPage > 1;
      closeDialog();
      if (returnToPreviousPage) setCurrentPage((page) => page - 1);
      else await loadList();
    } catch (error) {
      console.error('Error deleting record:', error);
      showError(error?.message || 'Failed to delete record');
    } finally { setFormSubmitting(false); }
  };

  const handleExport = () => {
    if (!records.length) { showError('There are no records to export'); return; }
    const fields = activeConfig.fields;
    const escape = (value) => `"${String(value ?? '').replace(/"/g, '""')}"`;
    const csv = [
      fields.map((field) => escape(field.label)).join(','),
      ...records.map((record) => fields.map((field) => escape(record[field.name])).join(',')),
    ].join('\n');
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8;' }));
    const link = document.createElement('a');
    link.href = url; link.download = `juridence-${activeTab.replace(/_/g, '-')}-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link); link.click(); document.body.removeChild(link); URL.revokeObjectURL(url);
    success(`Exported ${records.length} record${records.length === 1 ? '' : 's'}`);
  };

  const renderDesktopRow = (record) => {
    const title = getRecordTitle(activeTab, record);
    const actions = (
      <div className="flex items-center justify-end gap-0.5">
        {activeTab === 'people' && <IconButton label={`View ${title}`} size="sm" onClick={() => setSelectedPerson(record)}><Eye size={16} /></IconButton>}
        <IconButton label={`Edit ${title}`} size="sm" onClick={() => openEdit(record)}><Edit3 size={16} /></IconButton>
        <IconButton label={`Delete ${title}`} size="sm" className="text-[#a82e3d] hover:!bg-[#fff0f1] hover:!text-[#962535]" onClick={() => requestDelete(record)}><Trash2 size={16} /></IconButton>
      </div>
    );
    if (activeTab === 'people') return <tr key={record.id} className="border-t border-[#e7edef] hover:bg-[#f8faf9]"><td className="px-6 py-4"><button type="button" className="flex items-center gap-3 text-left" onClick={() => setSelectedPerson(record)}><RecordAvatar title={title} /><span><span className="block font-semibold text-[#20384c]">{title}</span><span className="mt-0.5 block text-xs text-[#71818a]">{record.occupation || 'Occupation not provided'}</span></span></button></td><td className="px-4 py-4 text-sm text-[#405867]"><span className="block">{record.phone_number || 'No phone'}</span><span className="mt-0.5 block text-xs text-[#7a8991]">{record.email || 'No email'}</span></td><td className="px-4 py-4 text-sm text-[#405867]">{[record.city, record.region].filter(Boolean).join(', ') || 'Not provided'}</td><td className="px-4 py-4"><RiskBadge record={record} /></td><td className="px-6 py-4">{actions}</td></tr>;
    if (activeTab === 'change_of_name') return <tr key={record.id} className="border-t border-[#e7edef] hover:bg-[#f8faf9]"><td className="px-6 py-4 text-sm font-medium text-[#405867]">{record.item_number || '-'}</td><td className="px-4 py-4 text-sm text-[#405867]">{record.old_name || 'Not provided'}</td><td className="px-4 py-4 font-semibold text-[#20384c]">{record.new_name || 'Not provided'}</td><td className="px-4 py-4 text-sm text-[#60737d]">{formatDate(record.effective_date)}</td><td className="px-4 py-4 text-sm text-[#405867]">{record.gazette_number || 'Not provided'}</td><td className="px-6 py-4">{actions}</td></tr>;
    if (activeTab === 'marriage_officers') return <tr key={record.id} className="border-t border-[#e7edef] hover:bg-[#f8faf9]"><td className="px-6 py-4"><p className="font-semibold text-[#20384c]">{title}</p><p className="mt-0.5 text-xs text-[#71818a]">{record.appointing_authority || 'Authority not provided'}</p></td><td className="px-4 py-4 text-sm text-[#405867]">{record.church || 'Not provided'}</td><td className="px-4 py-4 text-sm text-[#405867]">{record.location || 'Not provided'}</td><td className="px-4 py-4 text-sm text-[#60737d]">{formatDate(record.appointment_date)}</td><td className="px-4 py-4 text-sm text-[#405867]">{record.gazette_number || 'Not provided'}</td><td className="px-6 py-4">{actions}</td></tr>;
    const isPlace = activeTab === 'correction_of_place_of_birth';
    return <tr key={record.id} className="border-t border-[#e7edef] hover:bg-[#f8faf9]"><td className="px-6 py-4 text-sm font-medium text-[#405867]">{record.item_number || '-'}</td><td className="px-4 py-4 font-semibold text-[#20384c]">{title}</td><td className="px-4 py-4 text-sm text-[#60737d]">{isPlace ? record.old_place_of_birth || 'Not provided' : formatDate(record.old_date_of_birth)}</td><td className="px-4 py-4 text-sm font-medium text-[#405867]">{isPlace ? record.new_place_of_birth || 'Not provided' : formatDate(record.new_date_of_birth)}</td><td className="px-4 py-4 text-sm text-[#405867]">{record.gazette_number || 'Not provided'}</td><td className="px-6 py-4">{actions}</td></tr>;
  };

  const tableHeaders = activeTab === 'people'
    ? ['Person', 'Contact', 'Location', 'Risk score']
    : activeTab === 'change_of_name'
      ? ['Item', 'Old name', 'New name', 'Effective date', 'Gazette']
      : activeTab === 'marriage_officers'
        ? ['Officer', 'Church', 'Location', 'Appointed', 'Gazette']
        : ['Item', 'Person', 'Previous value', 'Corrected value', 'Gazette'];

  if (selectedPerson) {
    return <PersonDetails person={selectedPerson} onBack={() => setSelectedPerson(null)} userInfo={userInfo} onNavigate={onNavigate} onLogout={onLogout} onViewRelatedPerson={setSelectedPerson} />;
  }

  const visibleStart = totalItems ? ((currentPage - 1) * ITEMS_PER_PAGE) + 1 : 0;
  const visibleEnd = Math.min(currentPage * ITEMS_PER_PAGE, totalItems);
  const ActiveIcon = activeTabInfo.icon;
  const summaryCards = [
    { label: `${activeTabInfo.label} records`, value: totalItems, icon: ActiveIcon, tone: 'text-[#245b8f]', bg: 'bg-[#e7f0f8]' },
    { label: 'Showing now', value: records.length, icon: Users, tone: 'text-[#0c6b4a]', bg: 'bg-[#e2f4eb]' },
    { label: 'Current page', value: `${currentPage}/${totalPages}`, icon: FileEdit, tone: 'text-[#6b4f9a]', bg: 'bg-[#f0ebf7]' },
    { label: 'Records per page', value: ITEMS_PER_PAGE, icon: AlertCircle, tone: 'text-[#8b5a10]', bg: 'bg-[#fff2d9]' },
  ];

  return (
    <div className="ui-page">
      <AdminHeader userInfo={userInfo} onNavigate={onNavigate} onLogout={onLogout} contextLabel="People records" />
      <main className="ui-page-content">
        <PageHeader eyebrow="Legal data" title="People records" description="Manage people and gazetted identity, birth and appointment records."
          actions={<><Button variant="outline" icon={<Download size={17} />} onClick={handleExport}>Export</Button><Button icon={<Plus size={17} />} onClick={openCreate}>Add record</Button></>}
        />

        <section className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4" aria-label="Record summary">
          {summaryCards.map(({ label, value, icon: Icon, tone, bg }) => (
            <div key={label} className="flex min-h-[112px] items-center gap-3 rounded-lg border border-[#d9e2e6] bg-white p-4 shadow-sm sm:gap-4 sm:p-5">
              <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg sm:h-11 sm:w-11 ${bg} ${tone}`}><Icon size={20} /></span>
              <div className="min-w-0"><p className="text-2xl font-semibold leading-none text-[#17334a]">{value}</p><p className="mt-2 text-xs font-medium leading-4 text-[#71818a] sm:text-sm">{label}</p></div>
            </div>
          ))}
        </section>

        <Panel title={activeTabInfo.label} description={`${totalItems} record${totalItems === 1 ? '' : 's'} in this collection`} bodyClassName="!p-0">
          <div className="border-b border-[#e3eaed] px-4 py-4 sm:px-6">
            <div className="flex gap-1 overflow-x-auto rounded-lg bg-[#edf2f3] p-1" role="tablist" aria-label="People record type">
              {TABS.map((tab) => {
                const TabIcon = tab.icon;
                return <button key={tab.id} type="button" role="tab" aria-selected={activeTab === tab.id} onClick={() => changeTab(tab.id)} className={`flex min-h-[38px] shrink-0 items-center justify-center gap-2 rounded-md px-3 text-sm font-semibold transition-colors sm:flex-1 ${activeTab === tab.id ? 'bg-white text-[#17334a] shadow-sm' : 'text-[#60737d] hover:text-[#17334a]'}`}><TabIcon size={15} /><span className="hidden xl:inline">{tab.label}</span><span className="xl:hidden">{tab.shortLabel}</span></button>;
              })}
            </div>
            <div className="mt-4 flex flex-col gap-3 sm:flex-row">
              <Input aria-label={`Search ${activeTabInfo.label.toLowerCase()}`} leadingIcon={<Search size={18} />} placeholder={`Search ${activeTabInfo.label.toLowerCase()}`} value={searchTerm} onChange={(event) => { setSearchTerm(event.target.value); setCurrentPage(1); }} className="flex-1" />
              {searchTerm && <Button variant="ghost" onClick={() => { setSearchTerm(''); setCurrentPage(1); }}>Clear search</Button>}
            </div>
          </div>

          {loading ? (
            <div className="flex min-h-[300px] flex-col items-center justify-center px-6 text-center"><span className="h-8 w-8 animate-spin rounded-full border-2 border-[#c7d3d8] border-t-[#17875a]" /><p className="mt-4 text-sm font-medium text-[#60737d]">Loading records...</p></div>
          ) : records.length === 0 ? (
            <div className="flex min-h-[300px] flex-col items-center justify-center px-6 text-center"><span className="flex h-12 w-12 items-center justify-center rounded-lg bg-[#edf2f3] text-[#60737d]"><ActiveIcon size={23} /></span><h3 className="mt-4 font-semibold text-[#17334a]">No records found</h3><p className="mt-1 max-w-sm text-sm leading-6 text-[#71818a]">{searchTerm ? 'Try a different search or clear the current query.' : `Add the first ${activeConfig.title.toLowerCase()} record.`}</p><Button variant={searchTerm ? 'outline' : 'primary'} onClick={searchTerm ? () => setSearchTerm('') : openCreate} className="mt-5">{searchTerm ? 'Clear search' : 'Add record'}</Button></div>
          ) : (
            <>
              <div className="hidden overflow-x-auto lg:block"><table className="w-full min-w-[940px]"><thead><tr className="bg-[#f7f9fa] text-left">{tableHeaders.map((header, index) => <th key={header} className={`${index === 0 ? 'px-6' : 'px-4'} py-3`}>{header}</th>)}<th className="px-6 py-3 text-right">Actions</th></tr></thead><tbody>{records.map(renderDesktopRow)}</tbody></table></div>
              <div className="divide-y divide-[#e7edef] lg:hidden">
                {records.map((record) => {
                  const title = getRecordTitle(activeTab, record);
                  return <article key={record.id} className="px-4 py-5 sm:px-6"><div className="flex items-start gap-3"><RecordAvatar title={title} /><div className="min-w-0 flex-1"><h3 className="font-semibold text-[#20384c]">{title}</h3><p className="mt-0.5 text-xs text-[#71818a]">{getRecordSubtitle(activeTab, record)}</p><div className="mt-3 grid grid-cols-2 gap-3 text-xs"><p className="text-[#71818a]">Gazette <span className="block font-semibold text-[#405867]">{record.gazette_number || 'Not provided'}</span></p><p className="text-[#71818a]">Date <span className="block font-semibold text-[#405867]">{formatDate(record.effective_date || record.appointment_date || record.gazette_date || record.created_at)}</span></p></div></div></div><div className="mt-4 flex justify-end border-t border-[#edf1f3] pt-2">{activeTab === 'people' && <IconButton label={`View ${title}`} size="sm" onClick={() => setSelectedPerson(record)}><Eye size={16} /></IconButton>}<IconButton label={`Edit ${title}`} size="sm" onClick={() => openEdit(record)}><Edit3 size={16} /></IconButton><IconButton label={`Delete ${title}`} size="sm" className="text-[#a82e3d] hover:!bg-[#fff0f1] hover:!text-[#962535]" onClick={() => requestDelete(record)}><Trash2 size={16} /></IconButton></div></article>;
                })}
              </div>
            </>
          )}

          {!loading && records.length > 0 && <div className="flex flex-col gap-3 border-t border-[#e3eaed] px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6"><p className="text-xs font-medium text-[#71818a]">Showing {visibleStart}-{visibleEnd} of {totalItems} / Page {currentPage} of {totalPages}</p><div className="flex gap-2"><Button variant="outline" size="sm" icon={<ChevronLeft size={16} />} disabled={currentPage <= 1} onClick={() => setCurrentPage((page) => Math.max(page - 1, 1))}>Previous</Button><Button variant="outline" size="sm" icon={<ChevronRight size={16} />} iconPosition="right" disabled={currentPage >= totalPages} onClick={() => setCurrentPage((page) => Math.min(page + 1, totalPages))}>Next</Button></div></div>}
        </Panel>
      </main>

      {activeDialog === 'form' && (
        <Modal title={`${formMode === 'create' ? 'Add' : 'Edit'} ${FIELD_CONFIGS[formTab].title.toLowerCase()}`} description="Complete the record details below." onClose={closeDialog}>
          <form onSubmit={handleFormSubmit}>
            <div className="grid gap-5 p-5 sm:grid-cols-2 sm:p-6">
              {formError && <div className="rounded-lg border border-[#f1c7cd] bg-[#fff5f6] p-3 text-sm text-[#a82e3d] sm:col-span-2">{formError}</div>}
              {FIELD_CONFIGS[formTab].fields.map((field) => field.multiline ? (
                <Textarea key={field.name} label={field.label} required={field.required} value={formData[field.name] ?? ''} onChange={(event) => setFormData((data) => ({ ...data, [field.name]: event.target.value }))} className="sm:col-span-2" />
              ) : (
                <Input key={field.name} label={field.label} required={field.required} type={field.type || 'text'} value={formData[field.name] ?? ''} onChange={(event) => setFormData((data) => ({ ...data, [field.name]: event.target.value }))} className={field.name === 'full_name' || field.name === 'document_filename' ? 'sm:col-span-2' : ''} />
              ))}
            </div>
            <div className="flex flex-col-reverse gap-2 border-t border-[#e3eaed] px-5 py-4 sm:flex-row sm:justify-end sm:px-6"><Button variant="outline" onClick={closeDialog}>Cancel</Button><Button type="submit" loading={formSubmitting}>{formMode === 'create' ? 'Add record' : 'Save changes'}</Button></div>
          </form>
        </Modal>
      )}

      {activeDialog === 'delete' && recordToDelete && (
        <Modal title="Remove record" description="This action cannot be undone." onClose={closeDialog} size="max-w-md">
          <div className="p-5 sm:p-6"><div className="flex items-start gap-3 rounded-lg border border-[#f1c7cd] bg-[#fff5f6] p-4"><span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#fff0f1] text-[#a82e3d]"><Trash2 size={18} /></span><p className="text-sm leading-6 text-[#405867]">Remove <strong className="text-[#20384c]">{getRecordTitle(activeTab, recordToDelete)}</strong> from {activeTabInfo.label.toLowerCase()}?</p></div></div>
          <div className="flex flex-col-reverse gap-2 border-t border-[#e3eaed] px-5 py-4 sm:flex-row sm:justify-end sm:px-6"><Button variant="outline" onClick={closeDialog}>Cancel</Button><Button variant="danger" loading={formSubmitting} icon={<Trash2 size={16} />} onClick={handleDelete}>Remove record</Button></div>
        </Modal>
      )}

      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </div>
  );
};

export default PeopleRelationshipsPage;
