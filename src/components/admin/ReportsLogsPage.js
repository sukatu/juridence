import React, { useState } from 'react';
import ActivityLogsView from './ActivityLogsView';
import AdminHeader from './AdminHeader';
import { Shield, Building2, Scale } from 'lucide-react';

const ReportsLogsPage = ({ userInfo, onNavigate, onLogout }) => {
  const [selectedCategory, setSelectedCategory] = useState(null);
  const userCategories = [
    {
      title: 'Administrators',
      description: 'View and track system activities of all administrators.',
      icon: Shield
    },
    {
      title: 'Corporate Clients',
      description: 'View and track system activities of all Corporate Clients.',
      icon: Building2
    },
    {
      title: 'Court Registrars',
      description: 'View and track system activities of all Court Registrars.',
      icon: Scale
    }
  ];

  if (selectedCategory) {
    return <ActivityLogsView category={selectedCategory} onBack={() => setSelectedCategory(null)} userInfo={userInfo} onNavigate={onNavigate} onLogout={onLogout} />;
  }

  return (
    <div className="bg-[#F7F8FA] min-h-screen w-full">
      {/* Header */}
      <AdminHeader userInfo={userInfo} onNavigate={onNavigate} onLogout={onLogout} />

      {/* Main Content */}
      <div className="px-6 w-full">
        <div className="flex flex-col items-start w-full bg-white pt-4 pb-[622px] px-6 gap-4 rounded-lg">
          {/* Title */}
          <div className="flex flex-col items-start gap-2">
            <span className="text-[#040E1B] text-xl whitespace-nowrap">Reports & Logs</span>
            <span className="text-[#040E1B] text-base whitespace-nowrap">
              View & track system activities performed by all users.
            </span>
          </div>

          {/* User Category Cards */}
          <div className="flex items-start w-full gap-6">
            {userCategories.map((category, idx) => {
              const IconComponent = category.icon;
              return (
                <button
                  key={idx}
                  onClick={() => setSelectedCategory(category.title)}
                  className="flex flex-col items-center bg-white text-left flex-1 py-[26px] px-6 gap-2 rounded-lg border border-solid border-[#D4E1EA] hover:shadow-lg transition-shadow cursor-pointer"
                  style={{ boxShadow: '4px 4px 4px #0708101A' }}
                >
                  <div className="w-[60px] h-[60px] flex items-center justify-center flex-shrink-0 text-[#022658]">
                    <IconComponent className="w-[60px] h-[60px]" />
                  </div>
                  <span className="text-[#040E1B] text-lg whitespace-nowrap">{category.title}</span>
                  <span className="text-[#525866] text-base text-center">
                    {category.description}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportsLogsPage;

