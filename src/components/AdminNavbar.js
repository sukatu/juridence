import React from 'react';
import {
  BellRing,
  BookOpen,
  Building2,
  Calendar,
  CheckSquare,
  CreditCard,
  Database,
  FileText,
  Files,
  FolderArchive,
  KeyRound,
  Landmark,
  LayoutDashboard,
  LogOut,
  Search,
  ScanSearch,
  Settings,
  ShieldCheck,
  SlidersHorizontal,
  UserCircle,
  UserCheck,
  Users,
} from 'lucide-react';

const AdminNavbar = ({ activeTab, setActiveTab, onLogout, isSystemAdmin = false }) => {
  const systemAdminSections = [
    {
      label: 'Workspace',
      items: [
        { id: 'overview', label: 'Dashboard', icon: LayoutDashboard },
        { id: 'dashboard-search', label: 'Database Search', icon: Search },
        { id: 'batch-screening', label: 'Batch Screening', icon: ScanSearch },
        { id: 'watchlist', label: 'Watchlist', icon: BellRing },
        { id: 'due-diligence-reports', label: 'Reports', icon: Files },
        { id: 'person-search', label: 'Person Search', icon: UserCheck },
        { id: 'people-relationships', label: 'People Records', icon: Users },
        { id: 'companies', label: 'Companies', icon: Building2 },
        { id: 'case-hearings', label: 'Cause List', icon: Calendar },
        { id: 'case-profile', label: 'Case Profiles', icon: FileText },
      ],
    },
    {
      label: 'Data & Operations',
      items: [
        { id: 'gazette', label: 'Gazette', icon: FileText },
        { id: 'data-sources', label: 'Data Sources', icon: Database },
        { id: 'file-repository', label: 'Data Ingestion', icon: FolderArchive },
        { id: 'search-requests', label: 'Search Requests', icon: CheckSquare },
        { id: 'logs', label: 'Reports & Logs', icon: FileText },
      ],
    },
    {
      label: 'Organisation',
      items: [
        { id: 'clients-registrars', label: 'Clients & Registrars', icon: Users },
        { id: 'users', label: 'Users', icon: UserCheck },
        { id: 'roles', label: 'Roles & Permissions', icon: ShieldCheck },
        { id: 'billing-plan', label: 'Billing & Plan', icon: CreditCard },
        { id: 'subscription-requests', label: 'Subscriptions', icon: FileText },
        { id: 'api-keys', label: 'API & Integrations', icon: KeyRound },
        { id: 'audit-logs', label: 'Audit Log', icon: ShieldCheck },
      ],
    },
    {
      label: 'Administration',
      items: [
        { id: 'tenants', label: 'Organisations', icon: Landmark },
        { id: 'courts', label: 'Courts', icon: Building2 },
        { id: 'settings', label: 'Settings', icon: Settings },
        { id: 'documentation', label: 'Documentation', icon: BookOpen },
        { id: 'system-logs', label: 'System Logs', icon: SlidersHorizontal },
        { id: 'legal-centre', label: 'Legal Centre', icon: BookOpen },
      ],
    },
  ];

  const workspaceSections = [
    {
      label: 'Workspace',
      items: [
        { id: 'overview', label: 'Dashboard', icon: LayoutDashboard },
        { id: 'dashboard-search', label: 'Search', icon: Search },
        { id: 'watchlist', label: 'Watchlist', icon: BellRing },
        { id: 'due-diligence-reports', label: 'Reports', icon: Files },
      ],
    },
    {
      label: 'Data',
      items: [
        { id: 'data-sources', label: 'Data Sources', icon: Database },
      ],
    },
    {
      label: 'Organisation',
      items: [
        { id: 'team-roles', label: 'Team & Roles', icon: Users },
        { id: 'billing-plan', label: 'Billing & Plan', icon: CreditCard },
        { id: 'api-keys', label: 'API & Integrations', icon: KeyRound },
        { id: 'audit-logs', label: 'Audit Log', icon: ShieldCheck },
        { id: 'settings', label: 'Settings', icon: Settings },
      ],
    },
    {
      label: 'Legal',
      items: [
        { id: 'legal-centre', label: 'Legal Centre', icon: BookOpen },
      ],
    },
  ];

  const sections = isSystemAdmin ? systemAdminSections : workspaceSections;

  return (
    <aside className="dd-sidebar" aria-label={isSystemAdmin ? 'System administration navigation' : 'Workspace navigation'}>
      <nav className="dd-sidebar-nav">
        {sections.map((section) => (
          <div className="dd-nav-section" key={section.label}>
            <p className="dd-nav-label">{section.label}</p>
            {section.items.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  type="button"
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`dd-nav-item${isActive ? ' is-active' : ''}`}
                  aria-current={isActive ? 'page' : undefined}
                >
                  <Icon size={15} aria-hidden="true" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>
        ))}
      </nav>

      {isSystemAdmin && (
        <div className="dd-sidebar-account">
          <p className="dd-nav-label">Account</p>
          <button type="button" onClick={() => setActiveTab('profile')} className={`dd-nav-item${activeTab === 'profile' ? ' is-active' : ''}`}>
            <UserCircle size={15} aria-hidden="true" />
            <span>Profile</span>
          </button>
          <button type="button" onClick={onLogout} className="dd-nav-item dd-nav-logout">
            <LogOut size={15} aria-hidden="true" />
            <span>Log out</span>
          </button>
        </div>
      )}
    </aside>
  );
};

export default AdminNavbar;
