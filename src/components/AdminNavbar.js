import React from 'react';
import {
  Building2,
  CalendarDays,
  CheckSquare,
  FileText,
  LayoutDashboard,
  LogOut,
  Search,
  Settings,
  ShieldCheck,
  UserRound,
  UsersRound,
} from 'lucide-react';

const sections = [
  {
    label: 'Workspace',
    items: [
      { id: 'dashboard-search', label: 'Database search', icon: Search },
      { id: 'overview', label: 'Overview', icon: LayoutDashboard },
      { id: 'clients-registrars', label: 'Clients & registrars', icon: UsersRound },
      { id: 'users', label: 'User accounts', icon: UserRound },
    ],
  },
  {
    label: 'Legal data',
    items: [
      { id: 'person-search', label: 'Person search', icon: Search },
      { id: 'people-relationships', label: 'People records', icon: UserRound },
      { id: 'companies', label: 'Companies', icon: Building2 },
      { id: 'case-hearings', label: 'Cause list', icon: CalendarDays },
      { id: 'case-profile', label: 'Case profiles', icon: FileText },
      { id: 'gazette', label: 'Gazette', icon: FileText },
    ],
  },
  {
    label: 'Operations',
    items: [
      { id: 'search-requests', label: 'Search requests', icon: CheckSquare },
      { id: 'logs', label: 'Reports & logs', icon: FileText },
      { id: 'audit-logs', label: 'Audit trail', icon: ShieldCheck },
    ],
  },
];

const AdminNavbar = ({ activeTab, setActiveTab, onLogout, isSidebarCollapsed }) => {
  const handleNavigation = (tabId) => {
    if (tabId === activeTab) {
      setActiveTab('');
      window.setTimeout(() => setActiveTab(tabId), 0);
      return;
    }
    setActiveTab(tabId);
  };

  const navButton = ({ id, label, icon: Icon }) => {
    const active = activeTab === id;
    return (
      <button
        key={id}
        type="button"
        onClick={() => handleNavigation(id)}
        title={isSidebarCollapsed ? label : undefined}
        aria-current={active ? 'page' : undefined}
        className={`group relative flex h-10 w-full items-center rounded-md text-sm transition-colors ${
          isSidebarCollapsed ? 'justify-center px-0' : 'gap-3 px-3'
        } ${
          active
            ? 'bg-[rgba(255,255,255,0.12)] font-semibold text-white'
            : 'text-[#b8c8d2] hover:bg-[rgba(255,255,255,0.07)] hover:text-white'
        }`}
      >
        {active && <span className="absolute inset-y-2 left-0 w-[3px] rounded-r bg-[#56d39f]" />}
        <Icon size={17} className={`shrink-0 ${active ? 'text-[#86e4bd]' : 'text-[#91a7b5] group-hover:text-white'}`} />
        {!isSidebarCollapsed && <span className="truncate">{label}</span>}
      </button>
    );
  };

  return (
    <aside className={`flex h-screen flex-col border-r border-[#183951] bg-[#071b2f] text-white transition-[width] ${isSidebarCollapsed ? 'w-16' : 'w-60'}`}>
      <div className={`flex h-[72px] shrink-0 items-center border-b border-white/10 ${isSidebarCollapsed ? 'justify-center px-2' : 'px-5'}`}>
        {isSidebarCollapsed ? (
          <img src="/images/logo-initial.png" alt="Juridence" className="h-8 w-8 object-contain" />
        ) : (
          <div>
            <img src="/logos/logo-white.png" alt="Juridence" className="h-8 w-auto" />
            <p className="mt-1 text-[9px] font-semibold uppercase tracking-[0.16em] text-[#86e4bd]">Operations</p>
          </div>
        )}
      </div>

      <nav className={`scrollbar-thin flex-1 overflow-y-auto py-5 ${isSidebarCollapsed ? 'px-2' : 'px-3'}`} aria-label="Administration">
        <div className="space-y-6">
          {sections.map((section) => (
            <section key={section.label}>
              {!isSidebarCollapsed && (
                <h2 className="mb-2 px-3 text-[10px] font-bold uppercase tracking-[0.14em] text-[#6f8999]">{section.label}</h2>
              )}
              <div className="space-y-1">{section.items.map(navButton)}</div>
            </section>
          ))}
        </div>
      </nav>

      <div className={`shrink-0 border-t border-white/10 py-3 ${isSidebarCollapsed ? 'px-2' : 'px-3'}`}>
        {navButton({ id: 'settings', label: 'System settings', icon: Settings })}
        <button
          type="button"
          onClick={onLogout}
          title={isSidebarCollapsed ? 'Sign out' : undefined}
          className={`mt-1 flex h-10 w-full items-center rounded-md text-sm text-[#f5a4ad] transition-colors hover:bg-[#7f1d2d]/30 hover:text-white ${
            isSidebarCollapsed ? 'justify-center px-0' : 'gap-3 px-3'
          }`}
        >
          <LogOut size={17} />
          {!isSidebarCollapsed && <span>Sign out</span>}
        </button>
      </div>
    </aside>
  );
};

export default AdminNavbar;
