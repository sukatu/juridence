import React from 'react';
import { LayoutDashboard, CreditCard, FileText, Users, ClipboardList, Bell, Settings, LogOut } from 'lucide-react';

const CourtRegistrarNavbar = ({ activeTab, setActiveTab, onLogout }) => {
  const navigationItems = {
    core: [
      {
        id: 'dashboard',
        label: 'Dashboard',
        icon: LayoutDashboard
      },
      {
        id: 'billing',
        label: 'Billing',
        icon: CreditCard
      }
    ],
    main: [
      {
        id: 'cause-list',
        label: 'Cause list',
        icon: FileText
      }
    ],
    management: [
      {
        id: 'case-profile',
        label: 'Case profile',
        icon: FileText
      },
      {
        id: 'registrars',
        label: 'Registrars',
        icon: Users
      },
      {
        id: 'pending-tasks',
        label: 'Pending tasks',
        icon: ClipboardList
      },
      {
        id: 'notifications',
        label: 'Notifications',
        icon: Bell
      }
    ],
    bottom: [
      {
        id: 'settings',
        label: 'System Settings',
        icon: Settings
      },
      {
        id: 'logout',
        label: 'Log Out',
        icon: LogOut,
        color: 'text-red-500'
      }
    ]
  };

  const handleItemClick = (itemId) => {
    if (itemId === 'logout') {
      onLogout();
    } else {
      setActiveTab(itemId);
    }
  };

  const renderNavItem = (item) => {
    const Icon = item.icon;
    const isActive = activeTab === item.id;

    return (
      <button
        key={item.id}
        onClick={() => handleItemClick(item.id)}
        className={`w-full flex items-center gap-2 px-2 py-2 rounded transition-colors ${
          isActive 
            ? 'bg-[#022658]' 
            : 'hover:bg-gray-100'
        }`}
      >
        <Icon className={`h-4 w-4 ${isActive ? 'text-white' : item.color || 'text-[#050F1C]'}`} />
        <span className={`text-sm font-${isActive ? 'bold' : 'normal'} ${
          isActive ? 'text-white' : item.color || 'text-[#050F1C]'
        }`} style={{ fontFamily: 'Satoshi' }}>
          {item.label}
        </span>
      </button>
    );
  };

  return (
    <div className="w-60 h-screen bg-white flex flex-col px-5 py-6 gap-10">
      {/* Logo */}
      <div className="h-9 relative overflow-hidden">
        <img 
          src="/logos/main-logo.png" 
          alt="Juridence Logo" 
          className="h-full w-auto object-contain"
        />
      </div>

      {/* Navigation Sections */}
      <div className="flex-1 flex flex-col justify-between gap-10">
        <div className="flex flex-col gap-6">
          {/* CORE Section */}
          <div className="flex flex-col gap-2">
            <span className="text-[#868C98] text-[10px] font-normal" style={{ fontFamily: 'Satoshi' }}>
              CORE
            </span>
            <div className="flex flex-col gap-2 px-2">
              {navigationItems.core.map(renderNavItem)}
            </div>
          </div>

          {/* Main Section - Cause list */}
          <div className="px-2">
            {navigationItems.main.map(renderNavItem)}
          </div>

          {/* Management Section */}
          <div className="flex flex-col gap-2 px-2">
            {navigationItems.management.map(renderNavItem)}
          </div>
        </div>

        {/* Bottom Section */}
        <div className="flex flex-col gap-6">
          {navigationItems.bottom.map(renderNavItem)}
        </div>
      </div>
    </div>
  );
};

export default CourtRegistrarNavbar;

