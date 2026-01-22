import React from 'react';
import {
  LayoutDashboard,
  TrendingUp,
  Users,
  Building2,
  Calendar,
  Upload,
  CheckSquare,
  CheckCircle,
  Settings as SettingsIcon,
  FileText,
  Eye,
  LogOut,
  Shield,
  Key,
  CreditCard,
  Globe,
  Search,
  UserCheck
} from 'lucide-react';

const AdminNavbar = ({ activeTab, setActiveTab, onLogout, isSidebarCollapsed }) => {
  
  const handleNavigation = (tabId) => {
    if (tabId === activeTab) {
      setActiveTab('');
      setTimeout(() => setActiveTab(tabId), 0);
      return;
    }
    setActiveTab(tabId);
  };

  const isActive = (tabId) => {
    return activeTab === tabId;
  };

  const navSections = {
    core: [
      {
        id: 'overview',
        label: 'Dashboard',
        icon: LayoutDashboard
      },
      {
        id: 'clients-registrars',
        label: 'Clients & Registrars',
        icon: Users
      },
      {
        id: 'users',
        label: 'Users',
        icon: UserCheck
      }
    ],
    management: [
      {
        id: 'person-search',
        label: 'Person Search',
        icon: Search
      },
      {
        id: 'people-relationships',
        label: 'People',
        icon: UserCheck
      },
      {
        id: 'companies',
        label: 'Companies',
        icon: Building2
      },
      {
        id: 'case-hearings',
        label: 'Cause list',
        icon: Calendar
      },
      {
        id: 'case-profile',
        label: 'Case profile',
        icon: FileText
      }
    ],
    gazette: [
      {
        id: 'gazette',
        label: 'Gazette',
        icon: FileText
      }
    ],
    requests: [
      {
        id: 'search-requests',
        label: 'Search requests',
        icon: CheckSquare
      }
    ],
    analytics: [
      {
        id: 'logs',
        label: 'Report and Logs',
        icon: Eye
      },
      {
        id: 'audit-logs',
        label: 'Audit Log viewer',
        icon: FileText
      }
    ]
  };

  const renderNavSection = (items, sectionName) => {
    if (isSidebarCollapsed) {
      return (
        <div className="flex flex-col gap-1">
          {items.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.id);
            return (
              <button
                key={item.id}
                onClick={() => handleNavigation(item.id)}
                className={`flex items-center justify-center p-3 rounded transition-all ${
                  active
                    ? 'bg-[#022658] text-white'
                    : 'text-[#050F1C] hover:bg-gray-100'
                }`}
                title={item.label}
              >
                <Icon size={16} className={active ? 'text-white' : 'text-[#050F1C]'} />
              </button>
            );
          })}
        </div>
      );
    }

    return (
      <div className="flex flex-col gap-2">
        <div className="text-[#868C98] text-[10px] font-normal uppercase tracking-wide">
          {sectionName}
        </div>
        <div className="flex flex-col gap-2 px-2">
          {items.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.id);
            return (
              <button
                key={item.id}
                onClick={() => handleNavigation(item.id)}
                className={`flex items-center gap-2 px-2 py-2 rounded transition-all ${
                  active
                    ? 'bg-[#022658] text-white font-bold'
                    : 'text-[#050F1C] hover:bg-gray-100'
                }`}
              >
                <Icon size={16} className={active ? 'text-white' : 'text-[#050F1C]'} />
                <span className={`text-sm ${active ? 'font-bold' : 'font-normal'}`}>
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className={`h-screen bg-white flex flex-col py-6 border-r border-gray-200 overflow-y-auto transition-all ${
      isSidebarCollapsed ? 'w-16 px-2' : 'w-60 px-5'
    }`}>
      {/* Logo */}
      <div className="w-full flex items-center justify-center mb-10">
        {!isSidebarCollapsed ? (
          <img 
            src="/logos/main-logo.png" 
            alt="Juridence Logo" 
            className="h-9 w-auto object-contain max-w-[140px]"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = "/logo.png";
            }}
          />
        ) : (
          <img 
            src="/logos/main-logo.png" 
            alt="J" 
            className="h-8 w-8 object-contain"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = "/logo.png";
            }}
          />
        )}
      </div>

      {/* Navigation Sections */}
      <div className="flex flex-col justify-between flex-1 gap-6">
        <div className="flex flex-col gap-6">
          {/* CORE Section */}
          {renderNavSection(navSections.core, 'CORE')}

          {/* MANAGEMENT Section */}
          {renderNavSection(navSections.management, 'MANAGEMENT')}

          {/* GAZETTE Section */}
          {renderNavSection(navSections.gazette, 'GAZETTE')}

          {/* REQUESTS Section */}
          {renderNavSection(navSections.requests, 'REQUESTS')}

          {/* ANALYTICS Section */}
          {renderNavSection(navSections.analytics, 'ANALYTICS')}
        </div>

        {/* Bottom Section - Settings & Logout */}
        <div className="flex flex-col gap-4">
          <button
            onClick={() => handleNavigation('settings')}
            className={`flex items-center gap-2 px-2 py-2 rounded transition-all ${
              isActive('settings')
                ? 'bg-[#022658] text-white'
                : 'text-[#050F1C] hover:bg-gray-100'
            } ${isSidebarCollapsed ? 'justify-center' : ''}`}
            title={isSidebarCollapsed ? 'System Settings' : ''}
          >
            <SettingsIcon size={16} />
            {!isSidebarCollapsed && <span className="text-sm font-normal">System settings</span>}
          </button>

          <button
            onClick={onLogout}
            className={`flex items-center gap-2 text-[#EF4444] hover:bg-red-50 px-2 py-2 rounded transition-all ${
              isSidebarCollapsed ? 'justify-center' : ''
            }`}
            title={isSidebarCollapsed ? 'Log Out' : ''}
          >
            <LogOut size={16} />
            {!isSidebarCollapsed && <span className="text-sm font-normal" style={{ fontFamily: 'Satoshi' }}>Log Out</span>}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminNavbar;

