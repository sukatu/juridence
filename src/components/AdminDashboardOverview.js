import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  AlertTriangle,
  ArrowRight,
  BookOpenCheck,
  Building2,
  Database,
  FileSearch,
  Files,
  Loader2,
  RefreshCw,
  Scale,
  Users,
} from 'lucide-react';

import { apiGet } from '../utils/api';

const REPORT_STORAGE_KEY = 'juridence_due_diligence_reports';
const number = (value) => Number(value || 0).toLocaleString();
const formatDate = (value) => {
  if (!value) return 'Not recorded';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Not recorded';
  return new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(date);
};
const readReportCount = () => {
  try {
    const reports = JSON.parse(localStorage.getItem(REPORT_STORAGE_KEY) || '[]');
    return Array.isArray(reports) ? reports.length : 0;
  } catch {
    return 0;
  }
};

const NOTICE_TYPES = [
  ['COMPANY_STRIKE_OFF_INTENTION', 'Intended strike-off'],
  ['COMPANY_DISSOLUTION', 'Dissolved companies'],
  ['COMPANY_WINDING_UP', 'Winding up'],
  ['COMPANY_LIQUIDATION', 'Liquidation'],
  ['COMPANY_CESSATION_OF_BUSINESS', 'Cessation of business'],
  ['COMPANY_CHANGE_OF_NAME', 'Company name changes'],
  ['COMPANY_INCORPORATION', 'Incorporations'],
];

const AdminDashboardOverview = ({ userInfo, onNavigate }) => {
  const [overview, setOverview] = useState(null);
  const [watchlistCount, setWatchlistCount] = useState(0);
  const [reportCount, setReportCount] = useState(readReportCount);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  const loadDashboard = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    setError('');
    const [overviewResult, watchlistResult] = await Promise.allSettled([
      apiGet('/dashboard-search/overview'),
      apiGet('/watchlist/'),
    ]);
    if (overviewResult.status === 'fulfilled') setOverview(overviewResult.value);
    else setError(overviewResult.reason?.message || 'Dashboard data could not be loaded.');
    if (watchlistResult.status === 'fulfilled') {
      setWatchlistCount(Array.isArray(watchlistResult.value) ? watchlistResult.value.length : 0);
    }
    setReportCount(readReportCount());
    setLoading(false);
    setRefreshing(false);
  }, []);

  useEffect(() => { loadDashboard(); }, [loadDashboard]);

  const totals = overview?.totals || {};
  const organisation = userInfo?.organization_name
    || userInfo?.organisation_name
    || userInfo?.organization
    || 'Juridence';
  const today = new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date()).toUpperCase();

  const metrics = [
    { label: 'Searchable subjects', value: totals.searchable_subjects, icon: Users, tab: 'dashboard-search' },
    { label: 'Pending cases', value: totals.pending_cases, icon: Scale, tab: 'dashboard-search' },
    { label: 'Judgments', value: totals.judgments, icon: BookOpenCheck, tab: 'dashboard-search' },
    { label: 'Registry notices', value: totals.lifecycle_notices, icon: Building2, tab: 'dashboard-search' },
  ];
  const noticeRows = NOTICE_TYPES.map(([key, label]) => ({
    key,
    label,
    value: Number(overview?.lifecycle_by_type?.[key] || 0),
  }));
  const noticeMaximum = Math.max(...noticeRows.map((item) => item.value), 1);
  const adverseNotices = useMemo(() => noticeRows
    .filter((item) => ['COMPANY_STRIKE_OFF_INTENTION', 'COMPANY_DISSOLUTION', 'COMPANY_WINDING_UP', 'COMPANY_LIQUIDATION', 'COMPANY_CESSATION_OF_BUSINESS'].includes(item.key))
    .reduce((sum, item) => sum + item.value, 0), [noticeRows]);

  if (loading) {
    return <div className="dd-admin-overview"><div className="dd-dashboard-loading"><Loader2 size={20} className="dd-spin" /> Loading indexed data</div></div>;
  }

  return (
    <div className="dd-admin-overview">
      <div className="dd-overview-heading">
        <div>
          <h2>Workspace overview <span>JUR.DSH.001</span></h2>
          <p>{organisation} · Business date {today}</p>
        </div>
        <div className="dd-overview-actions">
          <button type="button" className="dd-primary-action" onClick={() => onNavigate('dashboard-search')}><FileSearch size={14} /> New enquiry</button>
          <button type="button" onClick={() => onNavigate('watchlist')}>Watchlist <span>{number(watchlistCount)}</span></button>
          <button type="button" onClick={() => onNavigate('due-diligence-reports')}>Reports <span>{number(reportCount)}</span></button>
          <button type="button" aria-label="Refresh dashboard" disabled={refreshing} onClick={() => loadDashboard(true)}><RefreshCw size={13} className={refreshing ? 'dd-spin' : ''} /></button>
        </div>
      </div>

      {error && <div className="dd-inline-alert is-error">{error}</div>}

      <section className="dd-overview-metrics" aria-label="Indexed record totals">
        {metrics.map(({ label, value, icon: Icon, tab }) => (
          <button type="button" key={label} onClick={() => onNavigate(tab)}>
            <Icon size={17} aria-hidden="true" />
            <span>{label}</span>
            <strong>{number(value)}</strong>
            <ArrowRight size={13} aria-hidden="true" />
          </button>
        ))}
      </section>

      <div className="dd-overview-grid">
        <section className="dd-ops-panel">
          <header><h3>Court record coverage</h3><span>{number(totals.court_records)} records</span></header>
          <table>
            <tbody>
              <tr><th>Pending cases</th><td className="dd-number">{number(totals.pending_cases)}</td></tr>
              <tr><th>Decided judgments</th><td className="dd-number">{number(totals.judgments)}</td></tr>
              <tr><th>Indexed case-party links</th><td className="dd-number">{number(totals.indexed_case_parties)}</td></tr>
              <tr><th>Institution case sources</th><td className="dd-number">{number(totals.source_banks)}</td></tr>
            </tbody>
            <tfoot><tr><th>Total court records</th><td className="dd-number">{number(totals.court_records)}</td></tr></tfoot>
          </table>
        </section>

        <section className="dd-ops-panel dd-notice-panel">
          <header><h3>Company lifecycle notices</h3><span>{number(adverseNotices)} adverse-status notices</span></header>
          <div className="dd-notice-distribution">
            {noticeRows.map((item) => (
              <button type="button" key={item.key} onClick={() => onNavigate('dashboard-search')}>
                <span>{item.label}</span>
                <i><b style={{ width: `${Math.max((item.value / noticeMaximum) * 100, item.value ? 1 : 0)}%` }} /></i>
                <strong>{number(item.value)}</strong>
              </button>
            ))}
          </div>
        </section>
      </div>

      <section className="dd-ops-panel dd-coverage-panel">
        <header>
          <h3>Data coverage</h3>
          <button type="button" onClick={() => onNavigate('data-sources')}>Data sources <ArrowRight size={12} /></button>
        </header>
        <div className="dd-table-scroll">
          <table>
            <thead><tr><th>Database</th><th className="dd-number">Records</th><th>Coverage</th><th>Latest indexed update</th><th>Status</th><th /></tr></thead>
            <tbody>
              {(overview?.coverage || []).map((item) => (
                <tr key={item.key}>
                  <td><strong>{item.database}</strong></td>
                  <td className="dd-number">{number(item.records)}</td>
                  <td>{item.source}</td>
                  <td className="dd-mono">{formatDate(item.updated_at)}</td>
                  <td><span className="dd-state is-live">Available</span></td>
                  <td><button type="button" className="dd-table-link" onClick={() => onNavigate(item.key === 'lifecycle' ? 'dashboard-search' : 'data-sources')}>View</button></td>
                </tr>
              ))}
            </tbody>
            <tfoot><tr><th>Source documents</th><th className="dd-number">{number(totals.bulletin_sources)}</th><td colSpan="4">Companies Bulletin files with retained source metadata</td></tr></tfoot>
          </table>
        </div>
      </section>

      <div className="dd-overview-grid dd-overview-lower-grid">
        <section className="dd-ops-panel">
          <header><h3>Subject index</h3><span>{number(totals.searchable_subjects)} searchable</span></header>
          <table>
            <tbody>
              <tr><th>Individuals</th><td className="dd-number">{number(totals.people)}</td></tr>
              <tr><th>Companies</th><td className="dd-number">{number(totals.companies)}</td></tr>
              <tr><th>Banks</th><td className="dd-number">{number(totals.banks)}</td></tr>
              <tr><th>Insurance companies</th><td className="dd-number">{number(totals.insurance)}</td></tr>
              <tr><th>Gazette records</th><td className="dd-number">{number(totals.gazette_records)}</td></tr>
            </tbody>
          </table>
        </section>

        <section className="dd-ops-panel dd-activity-panel">
          <header><h3>Latest indexed records</h3><button type="button" onClick={() => onNavigate('file-repository')}>Data ingestion <ArrowRight size={12} /></button></header>
          <div className="dd-table-scroll">
            <table>
              <thead><tr><th>Source</th><th>Record</th><th>Reference</th><th>Indexed</th></tr></thead>
              <tbody>{(overview?.recent_updates || []).map((item, index) => (
                <tr key={`${item.source}-${index}`}>
                  <td>{item.source}</td>
                  <td className="dd-truncate-cell" title={item.record}>{item.record}</td>
                  <td>{item.detail}</td>
                  <td className="dd-mono">{formatDate(item.updated_at)}</td>
                </tr>
              ))}</tbody>
            </table>
          </div>
        </section>
      </div>

      <div className="dd-overview-notice">
        <AlertTriangle size={15} />
        <span>Registry notice counts describe published records and do not by themselves establish current legal status. Verify material findings against the cited source.</span>
        <button type="button" onClick={() => onNavigate('legal-centre')}>Legal centre</button>
        <button type="button" onClick={() => onNavigate('due-diligence-reports')}><Files size={13} /> Reports</button>
        <Database size={13} aria-hidden="true" />
      </div>
    </div>
  );
};

export default AdminDashboardOverview;
