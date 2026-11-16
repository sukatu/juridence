import React, { useEffect, useRef, useState } from 'react';
import { ChevronDown, LogOut, Settings, UserRound } from 'lucide-react';

const readStoredUser = () => {
  try {
    return JSON.parse(localStorage.getItem('userData') || '{}');
  } catch {
    return {};
  }
};

const WorkspaceHeader = ({
  userInfo,
  onNavigate,
  onLogout,
  contextLabel,
  workspaceLabel = 'Juridence workspace',
}) => {
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const userMenuRef = useRef(null);
  const displayUserInfo = userInfo || readStoredUser();
  const fullName = [displayUserInfo?.first_name, displayUserInfo?.last_name].filter(Boolean).join(' ');
  const userName =
    displayUserInfo?.name?.trim() ||
    fullName ||
    localStorage.getItem('userName')?.trim() ||
    displayUserInfo?.email?.split('@')[0] ||
    'Account user';
  const email = displayUserInfo?.email || localStorage.getItem('userEmail') || 'Juridence account';
  const avatar = displayUserInfo?.avatar || displayUserInfo?.profile_picture;
  const initials = userName
    .split(' ')
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) setIsUserMenuOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const navigateTo = (destination) => {
    onNavigate?.(destination);
    setIsUserMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-30 flex h-[72px] w-full items-center justify-between border-b border-[#dce5e9] bg-white/95 pl-16 pr-4 backdrop-blur sm:pr-6 lg:px-7">
      <div className="min-w-0 pr-4">
        <p className="truncate text-[15px] font-semibold text-[#17334a]">{contextLabel || workspaceLabel}</p>
        <p className="mt-0.5 hidden text-xs text-[#7a8991] sm:block">{workspaceLabel}</p>
      </div>

      <div ref={userMenuRef} className="relative shrink-0">
        <button
          type="button"
          onClick={() => setIsUserMenuOpen((open) => !open)}
          className="flex h-11 items-center gap-2 px-1.5 text-left transition-colors hover:bg-[#f2f6f6] sm:gap-3 sm:px-2"
          aria-expanded={isUserMenuOpen}
          aria-haspopup="menu"
        >
          {avatar ? (
            <img src={avatar} alt="" className="h-9 w-9 rounded-full border border-[#dce5e9] object-cover" />
          ) : (
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#dff2e9] text-xs font-bold text-[#0c6b4a]">{initials}</span>
          )}
          <span className="hidden max-w-[170px] sm:block">
            <span className="block truncate text-sm font-semibold text-[#17334a]">{userName}</span>
            <span className="block truncate text-[11px] text-[#758690]">{email}</span>
          </span>
          <ChevronDown size={15} className={`text-[#758690] transition-transform ${isUserMenuOpen ? 'rotate-180' : ''}`} />
        </button>

        {isUserMenuOpen && (
          <div className="absolute right-0 mt-2 w-56 overflow-hidden rounded-md border border-[#d7e1e5] bg-white py-1.5 shadow-[0_14px_36px_rgba(10,35,53,0.16)]" role="menu">
            <div className="border-b border-[#e5ebee] px-3.5 py-2.5 sm:hidden">
              <p className="truncate text-sm font-semibold text-[#17334a]">{userName}</p>
              <p className="truncate text-xs text-[#758690]">{email}</p>
            </div>
            <button type="button" onClick={() => navigateTo('profile')} className="flex w-full items-center gap-3 px-3.5 py-2.5 text-sm text-[#405867] hover:bg-[#f2f6f6]" role="menuitem">
              <UserRound size={17} /> Profile
            </button>
            <button type="button" onClick={() => navigateTo('settings')} className="flex w-full items-center gap-3 px-3.5 py-2.5 text-sm text-[#405867] hover:bg-[#f2f6f6]" role="menuitem">
              <Settings size={17} /> System settings
            </button>
            <div className="my-1 border-t border-[#e5ebee]" />
            <button
              type="button"
              onClick={() => { setIsUserMenuOpen(false); onLogout?.(); }}
              className="flex w-full items-center gap-3 px-3.5 py-2.5 text-sm font-medium text-[#b52f3f] hover:bg-[#fff1f2]"
              role="menuitem"
            >
              <LogOut size={17} /> Sign out
            </button>
          </div>
        )}
      </div>
    </header>
  );
};

export default WorkspaceHeader;
