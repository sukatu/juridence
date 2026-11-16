import React from 'react';
import {
  ArrowRight,
  Bell,
  Eye,
  FileText,
  Search,
  ShieldAlert,
} from 'lucide-react';
import CorporateClientHeader from './CorporateClientHeader';
import { Badge, Button, PageHeader, Panel } from './ui';

const recentSearches = [
  { name: 'JKL Ventures Ltd', type: 'Company', status: '2 cases', lastViewed: 'Today' },
  { name: 'Ama Osei', type: 'Person', status: '1 case', lastViewed: '2 days ago' },
  { name: 'BlueRock Mining Ltd', type: 'Company', status: 'No cases', lastViewed: 'Last week' },
  { name: 'Kofi Mensah', type: 'Person', status: 'No cases', lastViewed: 'Last week' },
];

const watchlistItems = [
  { name: 'Meridian Properties', activity: '1 new case', riskScore: '58/100', variant: 'warning' },
  { name: 'Alpha Trade Ghana', activity: '2 gazette mentions', riskScore: '40/100', variant: 'success' },
  { name: 'Kofi Mensah', activity: 'No new updates', riskScore: '72/100', variant: 'danger' },
];

const exportHistory = [
  { name: 'JKL Ventures Ltd', type: 'Company risk report', format: 'PDF', date: 'Nov 3, 2025' },
  { name: 'Vivian Osei vs Tano Holdings', type: 'Case report', format: 'PDF', date: 'Nov 1, 2025' },
  { name: 'Kofi Mensah', type: 'Individual risk report', format: 'PDF', date: 'Oct 28, 2025' },
];

const alerts = [
  { title: 'New case filed: Meridian Properties', detail: 'High Court, Accra · Defendant', time: 'Just now', variant: 'danger' },
  { title: 'Gazette update: BlueRock Mining Ltd', detail: 'Change of warehouse location', time: '3 hours ago', variant: 'warning' },
];

const CorporateClientDashboardOverview = ({ userInfo, onNavigate, onLogout }) => {
  const displayUserInfo = userInfo || JSON.parse(localStorage.getItem('userData') || '{}');
  const organizationName = displayUserInfo?.organization || displayUserInfo?.entity_name || 'Corporate account';
  const metrics = [
    { label: 'Recent searches', value: '12', context: 'this week', icon: Search, destination: 'search' },
    { label: 'Reports generated', value: '4', context: 'this month', icon: FileText, destination: 'requests-exports' },
    { label: 'Watchlisted', value: '8', context: 'entities', icon: Eye, destination: 'watchlist' },
    { label: 'Search requests', value: '3', context: 'pending', icon: ShieldAlert, destination: 'requests-exports' },
  ];

  return (
    <div className="ui-page">
      <CorporateClientHeader userInfo={displayUserInfo} onNavigate={onNavigate} onLogout={onLogout} contextLabel="Overview" />
      <div className="ui-page-content">
        <PageHeader
          eyebrow="Corporate intelligence"
          title={organizationName}
          description="Review due diligence activity, monitored entities, reports and requests."
          actions={<Button icon={<Search size={16} />} onClick={() => onNavigate?.('search')}>Start a search</Button>}
        />

        <section aria-labelledby="corporate-activity-heading">
          <div className="mb-3 flex items-center justify-between">
            <h2 id="corporate-activity-heading" className="text-sm font-bold uppercase tracking-[0.1em] text-[#526773]">Account activity</h2>
            <p className="hidden text-xs text-[#829099] sm:block">Current workspace totals</p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {metrics.map(({ label, value, context, icon: Icon, destination }) => (
              <button
                key={label}
                type="button"
                onClick={() => onNavigate?.(destination)}
                className="group flex min-h-[132px] items-start justify-between border border-[#dce5e9] bg-white p-5 text-left shadow-[0_3px_12px_rgba(10,35,53,0.04)] transition-colors hover:border-[#a9c7bc]"
              >
                <span>
                  <span className="block text-sm font-medium text-[#687983]">{label}</span>
                  <span className="mt-4 block text-3xl font-semibold text-[#102f49]">{value}</span>
                  <span className="mt-1 block text-xs text-[#829099]">{context}</span>
                </span>
                <span className="flex h-10 w-10 items-center justify-center rounded-md bg-[#e2f4eb] text-[#0c6b4a]"><Icon size={20} /></span>
              </button>
            ))}
          </div>
        </section>

        <div className="mt-6 grid gap-6 xl:grid-cols-[1.4fr_0.6fr]">
          <Panel
            title="Recent searches"
            description="Entities reviewed by your team"
            actions={<Button variant="ghost" size="sm" icon={<ArrowRight size={15} />} iconPosition="right" onClick={() => onNavigate?.('search')}>View all</Button>}
            bodyClassName="!p-0"
          >
            <div className="overflow-x-auto">
              <table className="w-full min-w-[640px] text-left text-sm">
                <thead className="bg-[#f2f5f6]"><tr><th className="px-5 py-3.5">Entity</th><th className="px-5 py-3.5">Type</th><th className="px-5 py-3.5">Legal records</th><th className="px-5 py-3.5">Last viewed</th></tr></thead>
                <tbody className="divide-y divide-[#e3eaed]">
                  {recentSearches.map((item) => (
                    <tr key={item.name} className="hover:bg-[#f8fafa]"><td className="px-5 py-3.5 font-medium text-[#17334a]">{item.name}</td><td className="px-5 py-3.5 text-[#60717c]">{item.type}</td><td className="px-5 py-3.5 text-[#60717c]">{item.status}</td><td className="px-5 py-3.5 text-[#60717c]">{item.lastViewed}</td></tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Panel>

          <Panel
            title="Watchlist"
            description="Recently changed risk signals"
            actions={<Button variant="ghost" size="sm" icon={<ArrowRight size={15} />} iconPosition="right" onClick={() => onNavigate?.('watchlist')}>View all</Button>}
            bodyClassName="!p-0"
          >
            <div className="divide-y divide-[#e3eaed]">
              {watchlistItems.map((item) => (
                <button key={item.name} type="button" onClick={() => onNavigate?.('watchlist')} className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left hover:bg-[#f8fafa]">
                  <span className="min-w-0"><span className="block truncate text-sm font-semibold text-[#17334a]">{item.name}</span><span className="mt-1 block text-xs text-[#7a8991]">{item.activity}</span></span>
                  <Badge variant={item.variant}>{item.riskScore}</Badge>
                </button>
              ))}
            </div>
          </Panel>
        </div>

        <div className="mt-6 grid gap-6 xl:grid-cols-[1.4fr_0.6fr]">
          <Panel
            title="Export history"
            description="Recently generated reports"
            actions={<Button variant="ghost" size="sm" icon={<ArrowRight size={15} />} iconPosition="right" onClick={() => onNavigate?.('requests-exports')}>View all</Button>}
            bodyClassName="!p-0"
          >
            <div className="overflow-x-auto">
              <table className="w-full min-w-[620px] text-left text-sm">
                <thead className="bg-[#f2f5f6]"><tr><th className="px-5 py-3.5">Entity</th><th className="px-5 py-3.5">Report</th><th className="px-5 py-3.5">Format</th><th className="px-5 py-3.5">Date</th></tr></thead>
                <tbody className="divide-y divide-[#e3eaed]">
                  {exportHistory.map((item) => (
                    <tr key={`${item.name}-${item.date}`} className="hover:bg-[#f8fafa]"><td className="px-5 py-3.5 font-medium text-[#17334a]">{item.name}</td><td className="px-5 py-3.5 text-[#60717c]">{item.type}</td><td className="px-5 py-3.5"><Badge variant="info">{item.format}</Badge></td><td className="px-5 py-3.5 text-[#60717c]">{item.date}</td></tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Panel>

          <Panel title="Alerts" description="Updates from monitored records" bodyClassName="!p-0">
            <div className="divide-y divide-[#e3eaed]">
              {alerts.map((alert) => (
                <div key={alert.title} className="flex gap-3 px-5 py-4">
                  <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-md ${alert.variant === 'danger' ? 'bg-[#fff0f1] text-[#b52f3f]' : 'bg-[#fff2d9] text-[#9b6512]'}`}><Bell size={17} /></span>
                  <div><p className="text-sm font-semibold leading-5 text-[#17334a]">{alert.title}</p><p className="mt-1 text-xs leading-5 text-[#687983]">{alert.detail}</p><p className="mt-2 text-[11px] text-[#8a989f]">{alert.time}</p></div>
                </div>
              ))}
            </div>
          </Panel>
        </div>
      </div>
    </div>
  );
};

export default CorporateClientDashboardOverview;
