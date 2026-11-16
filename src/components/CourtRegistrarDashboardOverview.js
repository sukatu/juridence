import React from 'react';
import {
  ArrowRight,
  Bell,
  CalendarDays,
  ClipboardList,
  FileText,
  Upload,
} from 'lucide-react';
import RegistrarHeader from './RegistrarHeader';
import { Badge, Button, PageHeader, Panel } from './ui';

const gazetteData = [
  { id: 'GZ-1093', title: 'Contract ruling notice', dateUploaded: 'Oct 28', linkedCases: 'CM/0245/2023', status: 'Approved', variant: 'success' },
  { id: 'GZ-1079', title: 'Revocation notice', dateUploaded: 'Oct 24', linkedCases: '-', status: 'Pending', variant: 'warning' },
  { id: 'GZ-1068', title: 'Contract ruling notice', dateUploaded: 'Oct 20', linkedCases: 'CM/0245/2023', status: 'Approved', variant: 'success' },
];

const pendingTasks = [
  { task: 'Review case CM/0245/2023', due: 'Dec 1' },
  { task: 'Upload cause list for Dec 4', due: 'Dec 2' },
];

const caseManagement = [
  { caseNo: 'CM/0245/2023', parties: 'JKL Ventures Ltd vs Meridian Properties', lastUpdated: 'Oct 30', nextHearing: 'Nov 3', status: 'Ongoing', variant: 'info' },
  { caseNo: 'CM/0290/2023', parties: 'Ama Osei vs Tano Holdings', lastUpdated: 'Oct 27', nextHearing: '-', status: 'Closed', variant: 'success' },
  { caseNo: 'CM/0312/2023', parties: 'Kwame Ltd vs Eagle Group', lastUpdated: 'Oct 29', nextHearing: 'Nov 4', status: 'Pending', variant: 'warning' },
];

const alerts = [
  { title: 'New approval', message: 'Admin approved Gazette GZ-1079', time: 'Just now' },
  { title: 'Hearing alert', message: 'The Nov 3 cause list has been published', time: '3 hours ago' },
];

const CourtRegistrarDashboardOverview = ({ userInfo, onNavigate, onLogout }) => {
  const displayUserInfo = userInfo || JSON.parse(localStorage.getItem('userData') || '{}');
  const courtName = displayUserInfo?.court_name || displayUserInfo?.court_type || 'Court registry';
  const metrics = [
    { label: 'Cases managed', value: '128', context: 'total records', icon: FileText, destination: 'case-profile' },
    { label: 'Upcoming hearings', value: '12', context: 'this week', icon: CalendarDays, destination: 'cause-list' },
    { label: 'Gazette notices', value: '8', context: 'uploaded this week', icon: Upload, destination: 'pending-tasks' },
  ];

  return (
    <div className="ui-page">
      <RegistrarHeader userInfo={displayUserInfo} onNavigate={onNavigate} onLogout={onLogout} contextLabel="Overview" />
      <div className="ui-page-content">
        <PageHeader
          eyebrow="Court registry"
          title={courtName}
          description="Track court records, hearing schedules, gazette notices and pending registry work."
          actions={<Button icon={<FileText size={16} />} onClick={() => onNavigate?.('cause-list')}>Open cause list</Button>}
        />

        <section aria-labelledby="registry-activity-heading">
          <div className="mb-3 flex items-center justify-between">
            <h2 id="registry-activity-heading" className="text-sm font-bold uppercase tracking-[0.1em] text-[#526773]">Registry activity</h2>
            <p className="hidden text-xs text-[#829099] sm:block">Current operational totals</p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {metrics.map(({ label, value, context, icon: Icon, destination }) => (
              <button
                key={label}
                type="button"
                onClick={() => onNavigate?.(destination)}
                className="group flex min-h-[132px] items-start justify-between border border-[#dce5e9] bg-white p-5 text-left shadow-[0_3px_12px_rgba(10,35,53,0.04)] transition-colors hover:border-[#a9c7bc]"
              >
                <span><span className="block text-sm font-medium text-[#687983]">{label}</span><span className="mt-4 block text-3xl font-semibold text-[#102f49]">{value}</span><span className="mt-1 block text-xs text-[#829099]">{context}</span></span>
                <span className="flex h-10 w-10 items-center justify-center rounded-md bg-[#e2f4eb] text-[#0c6b4a]"><Icon size={20} /></span>
              </button>
            ))}
          </div>
        </section>

        <div className="mt-6 grid gap-6 xl:grid-cols-[1.4fr_0.6fr]">
          <Panel
            title="Gazette tracking"
            description="Recent notices linked to registry matters"
            actions={<Button variant="ghost" size="sm" icon={<ArrowRight size={15} />} iconPosition="right" onClick={() => onNavigate?.('pending-tasks')}>View all</Button>}
            bodyClassName="!p-0"
          >
            <div className="overflow-x-auto">
              <table className="w-full min-w-[690px] text-left text-sm">
                <thead className="bg-[#f2f5f6]"><tr><th className="px-5 py-3.5">Gazette ID</th><th className="px-5 py-3.5">Title</th><th className="px-5 py-3.5">Uploaded</th><th className="px-5 py-3.5">Linked case</th><th className="px-5 py-3.5">Status</th></tr></thead>
                <tbody className="divide-y divide-[#e3eaed]">
                  {gazetteData.map((item) => (
                    <tr key={item.id} className="hover:bg-[#f8fafa]"><td className="px-5 py-3.5 font-medium text-[#17334a]">{item.id}</td><td className="px-5 py-3.5 text-[#60717c]">{item.title}</td><td className="px-5 py-3.5 text-[#60717c]">{item.dateUploaded}</td><td className="px-5 py-3.5 text-[#60717c]">{item.linkedCases}</td><td className="px-5 py-3.5"><Badge variant={item.variant}>{item.status}</Badge></td></tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Panel>

          <Panel
            title="Pending tasks"
            description="Work due from the registry"
            actions={<Button variant="ghost" size="sm" icon={<ArrowRight size={15} />} iconPosition="right" onClick={() => onNavigate?.('pending-tasks')}>View all</Button>}
            bodyClassName="!p-0"
          >
            <div className="divide-y divide-[#e3eaed]">
              {pendingTasks.map((item) => (
                <button key={item.task} type="button" onClick={() => onNavigate?.('pending-tasks')} className="flex w-full items-center gap-3 px-5 py-4 text-left hover:bg-[#f8fafa]">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-[#e7f0f8] text-[#245b8f]"><ClipboardList size={17} /></span>
                  <span className="min-w-0 flex-1"><span className="block text-sm font-semibold text-[#17334a]">{item.task}</span><span className="mt-1 block text-xs text-[#7a8991]">Due {item.due}</span></span>
                  <ArrowRight size={16} className="text-[#91a0a8]" />
                </button>
              ))}
            </div>
          </Panel>
        </div>

        <div className="mt-6 grid gap-6 xl:grid-cols-[1.4fr_0.6fr]">
          <Panel
            title="Case management"
            description="Recently updated court matters"
            actions={<Button variant="ghost" size="sm" icon={<ArrowRight size={15} />} iconPosition="right" onClick={() => onNavigate?.('case-profile')}>View all</Button>}
            bodyClassName="!p-0"
          >
            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px] text-left text-sm">
                <thead className="bg-[#f2f5f6]"><tr><th className="px-5 py-3.5">Case number</th><th className="px-5 py-3.5">Parties</th><th className="px-5 py-3.5">Last updated</th><th className="px-5 py-3.5">Next hearing</th><th className="px-5 py-3.5">Status</th></tr></thead>
                <tbody className="divide-y divide-[#e3eaed]">
                  {caseManagement.map((item) => (
                    <tr key={item.caseNo} className="hover:bg-[#f8fafa]"><td className="px-5 py-3.5 font-medium text-[#17334a]">{item.caseNo}</td><td className="max-w-[300px] px-5 py-3.5 text-[#405867]">{item.parties}</td><td className="px-5 py-3.5 text-[#60717c]">{item.lastUpdated}</td><td className="px-5 py-3.5 text-[#60717c]">{item.nextHearing}</td><td className="px-5 py-3.5"><Badge variant={item.variant}>{item.status}</Badge></td></tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Panel>

          <Panel title="Alerts" description="Recent registry notifications" bodyClassName="!p-0">
            <div className="divide-y divide-[#e3eaed]">
              {alerts.map((alert) => (
                <div key={alert.title} className="flex gap-3 px-5 py-4">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-[#fff2d9] text-[#9b6512]"><Bell size={17} /></span>
                  <div><p className="text-sm font-semibold text-[#17334a]">{alert.title}</p><p className="mt-1 text-xs leading-5 text-[#687983]">{alert.message}</p><p className="mt-2 text-[11px] text-[#8a989f]">{alert.time}</p></div>
                </div>
              ))}
            </div>
          </Panel>
        </div>
      </div>
    </div>
  );
};

export default CourtRegistrarDashboardOverview;
