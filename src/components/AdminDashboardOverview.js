import React from 'react';
import {
  ArrowRight,
  Building2,
  CheckCircle2,
  FileSearch,
  Landmark,
  Search,
  ShieldAlert,
  ShieldCheck,
  UsersRound,
} from 'lucide-react';
import AdminHeader from './admin/AdminHeader';

const formatNumber = (value) => Number(value || 0).toLocaleString();

const AdminDashboardOverview = ({ stats = {}, userInfo, onNavigate, onLogout }) => {
  const userName =
    userInfo?.first_name ||
    localStorage.getItem('userName')?.split(' ')[0] ||
    'Admin';

  const headlineMetrics = [
    { label: 'Case records', value: stats.totalCases, icon: FileSearch, accent: 'text-[#0c6b4a]', iconBg: 'bg-[#e2f4eb]' },
    { label: 'People profiles', value: stats.totalPeople, icon: UsersRound, accent: 'text-[#245b8f]', iconBg: 'bg-[#e7f0f8]' },
    { label: 'Companies', value: stats.totalCompanies, icon: Building2, accent: 'text-[#9b6512]', iconBg: 'bg-[#fff2d9]' },
    { label: 'Platform users', value: stats.totalUsers, icon: ShieldCheck, accent: 'text-[#72519a]', iconBg: 'bg-[#f0eafb]' },
  ];

  const coverageMetrics = [
    ['Banks', stats.totalBanks],
    ['Insurance firms', stats.totalInsurance],
    ['Verified profiles', stats.verifiedCount],
    ['Active subscriptions', stats.activeSubscriptions],
  ];

  const quickActions = [
    { label: 'Search person records', description: 'Find profiles and connected legal matters', icon: Search, destination: 'person-search' },
    { label: 'Review search requests', description: 'Process pending client due diligence work', icon: ShieldAlert, destination: 'search-requests' },
    { label: 'Manage cause list', description: 'Review hearings and court schedules', icon: Landmark, destination: 'case-hearings' },
  ];

  const riskDistribution = stats.riskDistribution || {};
  const riskEntries = [
    ['Low', Number(riskDistribution.low || 0), '#23a36d'],
    ['Medium', Number(riskDistribution.medium || 0), '#e2a63a'],
    ['High', Number(riskDistribution.high || 0), '#df7047'],
    ['Critical', Number(riskDistribution.critical || 0), '#be3948'],
  ];
  const riskTotal = riskEntries.reduce((sum, [, value]) => sum + value, 0);
  const recentActivity = Array.isArray(stats.recentActivity) ? stats.recentActivity.slice(0, 5) : [];

  return (
    <div className="min-h-screen bg-[#f4f7f8]">
      <AdminHeader userInfo={userInfo} onNavigate={onNavigate} onLogout={onLogout} contextLabel="Overview" />

      <div className="mx-auto max-w-[1440px] px-4 py-7 sm:px-6 lg:px-8 lg:py-9">
        <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
          <div>
            <p className="text-sm font-semibold text-[#17875a]">Administration overview</p>
            <h1 className="mt-1 text-2xl font-semibold text-[#102f49] sm:text-3xl">Good to see you, {userName}</h1>
            <p className="mt-2 text-sm text-[#71818a]">Monitor data coverage and keep legal-record operations moving.</p>
          </div>
          <div className="flex items-center gap-2 text-xs font-medium text-[#526773]">
            <span className={`h-2 w-2 rounded-full ${stats.systemHealth === 'unhealthy' ? 'bg-[#be3948]' : 'bg-[#23a36d]'}`} />
            Platform status: {stats.systemHealth === 'unhealthy' ? 'Needs attention' : 'Operational'}
          </div>
        </div>

        <section aria-labelledby="records-heading" className="mt-8">
          <div className="mb-3 flex items-center justify-between">
            <h2 id="records-heading" className="text-sm font-bold uppercase tracking-[0.1em] text-[#526773]">Record coverage</h2>
            <p className="hidden text-xs text-[#829099] sm:block">Current platform totals</p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {headlineMetrics.map(({ label, value, icon: Icon, accent, iconBg }) => (
              <article key={label} className="rounded-md border border-[#dce5e9] bg-white p-5 shadow-[0_3px_12px_rgba(10,35,53,0.04)]">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-medium text-[#687983]">{label}</p>
                    <p className="mt-4 text-3xl font-semibold text-[#102f49]">{formatNumber(value)}</p>
                  </div>
                  <span className={`flex h-10 w-10 items-center justify-center rounded-md ${iconBg} ${accent}`}><Icon size={20} /></span>
                </div>
              </article>
            ))}
          </div>
        </section>

        <div className="mt-6 grid gap-6 xl:grid-cols-[1.35fr_0.65fr]">
          <section aria-labelledby="actions-heading" className="rounded-md border border-[#dce5e9] bg-white">
            <div className="flex items-center justify-between border-b border-[#e3eaed] px-5 py-4 sm:px-6">
              <div>
                <h2 id="actions-heading" className="font-semibold text-[#17334a]">Priority actions</h2>
                <p className="mt-1 text-xs text-[#7a8991]">Common operational workflows</p>
              </div>
            </div>
            <div className="divide-y divide-[#e7edef]">
              {quickActions.map(({ label, description, icon: Icon, destination }) => (
                <button
                  key={label}
                  type="button"
                  onClick={() => onNavigate?.(destination)}
                  className="group flex w-full items-center gap-4 px-5 py-4 text-left transition-colors hover:bg-[#f7faf9] sm:px-6"
                >
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-[#edf5f2] text-[#0c6b4a]"><Icon size={19} /></span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-semibold text-[#17334a]">{label}</span>
                    <span className="mt-1 block truncate text-xs text-[#7a8991]">{description}</span>
                  </span>
                  <ArrowRight size={17} className="shrink-0 text-[#91a0a8] transition-transform group-hover:translate-x-1 group-hover:text-[#0c6b4a]" />
                </button>
              ))}
            </div>
          </section>

          <section aria-labelledby="coverage-heading" className="rounded-md border border-[#dce5e9] bg-white p-5 sm:p-6">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-md bg-[#e7f0f8] text-[#245b8f]"><Building2 size={19} /></span>
              <div>
                <h2 id="coverage-heading" className="font-semibold text-[#17334a]">Entity coverage</h2>
                <p className="mt-0.5 text-xs text-[#7a8991]">Structured data in the platform</p>
              </div>
            </div>
            <dl className="mt-5 divide-y divide-[#e7edef]">
              {coverageMetrics.map(([label, value]) => (
                <div key={label} className="flex items-center justify-between py-3 first:pt-0 last:pb-0">
                  <dt className="text-sm text-[#60717c]">{label}</dt>
                  <dd className="text-sm font-semibold text-[#17334a]">{formatNumber(value)}</dd>
                </div>
              ))}
            </dl>
          </section>
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <section aria-labelledby="risk-heading" className="rounded-md border border-[#dce5e9] bg-white p-5 sm:p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 id="risk-heading" className="font-semibold text-[#17334a]">Profile risk distribution</h2>
                <p className="mt-1 text-xs text-[#7a8991]">Current due diligence classifications</p>
              </div>
              <span className="text-sm font-semibold text-[#17334a]">{formatNumber(riskTotal)} profiles</span>
            </div>
            {riskTotal > 0 ? (
              <div className="mt-6 space-y-4">
                {riskEntries.map(([label, value, color]) => {
                  const percentage = Math.round((value / riskTotal) * 100);
                  return (
                    <div key={label}>
                      <div className="mb-1.5 flex justify-between text-xs"><span className="font-medium text-[#526773]">{label}</span><span className="text-[#7a8991]">{formatNumber(value)} · {percentage}%</span></div>
                      <div className="h-2 overflow-hidden rounded-full bg-[#edf1f3]"><div className="h-full rounded-full" style={{ width: `${percentage}%`, backgroundColor: color }} /></div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="mt-6 flex min-h-[150px] flex-col items-center justify-center border border-dashed border-[#ccd8dd] bg-[#fafcfc] px-5 text-center">
                <ShieldCheck size={24} className="text-[#86a096]" />
                <p className="mt-3 text-sm font-medium text-[#526773]">No risk classifications yet</p>
                <p className="mt-1 text-xs text-[#87949b]">Classifications will appear as profiles are reviewed.</p>
              </div>
            )}
          </section>

          <section aria-labelledby="activity-heading" className="rounded-md border border-[#dce5e9] bg-white p-5 sm:p-6">
            <div>
              <h2 id="activity-heading" className="font-semibold text-[#17334a]">Recent activity</h2>
              <p className="mt-1 text-xs text-[#7a8991]">Latest recorded platform events</p>
            </div>
            {recentActivity.length > 0 ? (
              <div className="mt-5 divide-y divide-[#e7edef]">
                {recentActivity.map((activity, index) => (
                  <div key={activity.id || index} className="flex items-start gap-3 py-3 first:pt-0 last:pb-0">
                    <CheckCircle2 size={17} className="mt-0.5 shrink-0 text-[#23a36d]" />
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-[#405867]">{activity.action || activity.type || 'Platform activity'}</p>
                      <p className="mt-1 text-xs text-[#87949b]">{activity.timestamp || activity.created_at || 'Recently'}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="mt-6 flex min-h-[150px] flex-col items-center justify-center border border-dashed border-[#ccd8dd] bg-[#fafcfc] px-5 text-center">
                <CheckCircle2 size={24} className="text-[#86a096]" />
                <p className="mt-3 text-sm font-medium text-[#526773]">All caught up</p>
                <p className="mt-1 text-xs text-[#87949b]">New system activity will be shown here.</p>
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardOverview;
