import React from 'react';
import { LogOut, Settings } from 'lucide-react';

const WorkspaceSidebar = ({
  sections,
  activeTab,
  onNavigate,
  onLogout,
  workspaceLabel,
  settingsTab = 'settings',
}) => {
  const renderItem = ({ id, label, icon: Icon }) => {
    const active = activeTab === id;
    return (
      <button
        key={id}
        type="button"
        onClick={() => onNavigate(id)}
        aria-current={active ? 'page' : undefined}
        className={`group relative flex h-10 w-full items-center gap-3 px-3 text-sm transition-colors ${
          active
            ? 'bg-[rgba(255,255,255,0.12)] font-semibold text-white'
            : 'text-[#b8c8d2] hover:bg-[rgba(255,255,255,0.07)] hover:text-white'
        }`}
      >
        {active && <span className="absolute inset-y-2 left-0 w-[3px] rounded-r bg-[#56d39f]" />}
        <Icon size={17} className={`shrink-0 ${active ? 'text-[#86e4bd]' : 'text-[#91a7b5] group-hover:text-white'}`} />
        <span className="truncate">{label}</span>
      </button>
    );
  };

  return (
    <aside className="flex h-screen w-60 flex-col border-r border-[#183951] bg-[#071b2f] text-white">
      <div className="flex h-[72px] shrink-0 items-center border-b border-white/10 px-5">
        <div>
          <img src="/logos/logo-white.png" alt="Juridence" className="h-8 w-auto" />
          <p className="mt-1 text-[9px] font-semibold uppercase tracking-[0.16em] text-[#86e4bd]">{workspaceLabel}</p>
        </div>
      </div>

      <nav className="scrollbar-thin flex-1 overflow-y-auto px-3 py-5" aria-label={workspaceLabel}>
        <div className="space-y-6">
          {sections.map((section) => (
            <section key={section.label}>
              <h2 className="mb-2 px-3 text-[10px] font-bold uppercase tracking-[0.14em] text-[#6f8999]">{section.label}</h2>
              <div className="space-y-1">{section.items.map(renderItem)}</div>
            </section>
          ))}
        </div>
      </nav>

      <div className="shrink-0 border-t border-white/10 px-3 py-3">
        <button
          type="button"
          onClick={() => onNavigate(settingsTab)}
          className={`flex h-10 w-full items-center gap-3 px-3 text-sm transition-colors ${
            activeTab === settingsTab ? 'bg-[rgba(255,255,255,0.12)] font-semibold text-white' : 'text-[#b8c8d2] hover:bg-[rgba(255,255,255,0.07)] hover:text-white'
          }`}
        >
          <Settings size={17} /> System settings
        </button>
        <button type="button" onClick={onLogout} className="mt-1 flex h-10 w-full items-center gap-3 px-3 text-sm text-[#f5a4ad] transition-colors hover:bg-[#7f1d2d]/30 hover:text-white">
          <LogOut size={17} /> Sign out
        </button>
      </div>
    </aside>
  );
};

export default WorkspaceSidebar;
