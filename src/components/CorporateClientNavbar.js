import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LayoutDashboard, CreditCard, Users, Search, Building2, Eye, FileText, HelpCircle, Bell, Settings, LogOut, ChevronRight } from 'lucide-react';
import LogoutConfirmationModal from './admin/LogoutConfirmationModal';

const CorporateClientNavbar = ({ activeTab, setActiveTab, onLogout }) => {
  const navigate = useNavigate();
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const handleLogout = () => {
    setShowLogoutModal(true);
  };

  const confirmLogout = () => {
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userName');
    localStorage.removeItem('userPicture');
    localStorage.removeItem('authProvider');
    localStorage.removeItem('accessToken');
    localStorage.removeItem('userData');
    
    window.dispatchEvent(new CustomEvent('authStateChanged'));
    navigate('/');
  };

  return (
    <>
      <div className="w-[240px] h-screen bg-white px-5 py-6 flex flex-col gap-10">
        {/* Logo */}
        <div className="w-[122.82px] h-9 relative flex items-center">
          <img 
            src="/logos/main-logo.png" 
            alt="Juridence" 
            className="h-9 w-auto object-contain"
            onError={(e) => {
              e.target.style.display = 'none';
              e.target.nextSibling.style.display = 'block';
            }}
          />
          <div className="w-[122.82px] h-9 relative hidden">
            <div className="w-[107.31px] h-[25.14px] left-[14.49px] top-[7.66px] absolute bg-[#022658]"></div>
            <div className="w-[16.68px] h-[2.71px] left-[0.16px] top-[23.14px] absolute bg-[#022658]"></div>
            <div className="w-[12.24px] h-[2.71px] left-[4.61px] top-[17.99px] absolute bg-[#022658]"></div>
            <div className="w-[7.83px] h-[2.71px] left-[9.02px] top-[13.18px] absolute bg-[#022658]"></div>
          </div>
        </div>

        <div className="flex flex-col justify-between flex-1">
          {/* Main Menu */}
          <div className="flex flex-col gap-6">
            {/* CORE */}
            <div className="flex flex-col gap-2">
              <span className="text-[#868C98] text-[10px] font-normal" style={{ fontFamily: 'Satoshi' }}>CORE</span>
              <div className="px-2 flex flex-col gap-2">
                <button
                  onClick={() => setActiveTab('dashboard')}
                  className={`w-full px-2 py-2 rounded flex items-center gap-2 ${
                    activeTab === 'dashboard'
                      ? 'bg-[#022658] text-white'
                      : 'text-[#050F1C] hover:bg-gray-50'
                  }`}
                >
                  <LayoutDashboard className="w-4 h-4" />
                  <span className="text-sm font-normal" style={{ fontFamily: 'Satoshi' }}>Dashboard</span>
                </button>
                <button
                  onClick={() => setActiveTab('billing')}
                  className={`w-full px-2 py-2 rounded flex items-center gap-2 ${
                    activeTab === 'billing'
                      ? 'bg-[#022658] text-white'
                      : 'text-[#050F1C] hover:bg-gray-50'
                  }`}
                >
                  <CreditCard className="w-4 h-4" />
                  <span className="text-sm font-normal" style={{ fontFamily: 'Satoshi' }}>Billing</span>
                </button>
                <button
                  onClick={() => setActiveTab('team')}
                  className={`w-full px-2 py-2 rounded flex items-center gap-2 ${
                    activeTab === 'team'
                      ? 'bg-[#022658] text-white'
                      : 'text-[#050F1C] hover:bg-gray-50'
                  }`}
                >
                  <Users className="w-4 h-4" />
                  <span className="text-sm font-normal" style={{ fontFamily: 'Satoshi' }}>Team</span>
                </button>
              </div>
            </div>

            {/* SEARCH */}
            <div className="flex flex-col gap-2">
              <span className="text-[#868C98] text-[10px] font-normal" style={{ fontFamily: 'Satoshi' }}>SEARCH</span>
              <div className="px-2 flex flex-col gap-2.5">
                <button
                  onClick={() => setActiveTab('search')}
                  className={`w-full px-2 py-2 rounded flex items-center gap-2 ${
                    activeTab === 'search'
                      ? 'bg-[#022658] text-white'
                      : 'text-[#050F1C] hover:bg-gray-50'
                  }`}
                >
                  <Search className="w-4 h-4" />
                  <span className="text-sm font-normal" style={{ fontFamily: 'Satoshi' }}>Search</span>
                </button>
                <button
                  onClick={() => setActiveTab('persons')}
                  className={`w-full px-2 py-2 rounded flex items-center gap-2 ${
                    activeTab === 'persons'
                      ? 'bg-[#022658] text-white'
                      : 'text-[#050F1C] hover:bg-gray-50'
                  }`}
                >
                  <Search className="w-4 h-4" />
                  <span className="text-sm font-normal" style={{ fontFamily: 'Satoshi' }}>Persons</span>
                </button>
                <button
                  onClick={() => setActiveTab('companies')}
                  className={`w-full px-2 py-2 rounded flex items-center gap-2 ${
                    activeTab === 'companies'
                      ? 'bg-[#022658] text-white'
                      : 'text-[#050F1C] hover:bg-gray-50'
                  }`}
                >
                  <Building2 className="w-4 h-4" />
                  <span className="text-sm font-normal" style={{ fontFamily: 'Satoshi' }}>Companies</span>
                </button>
              </div>
            </div>

            {/* Other Menu Items */}
            <div className="px-2 flex flex-col gap-6">
              <button
                onClick={() => setActiveTab('watchlist')}
                className="w-full px-2 py-2 rounded flex items-center gap-2 text-[#050F1C] hover:bg-gray-50"
              >
                <Eye className="w-4 h-4" />
                <span className="text-sm font-normal" style={{ fontFamily: 'Satoshi' }}>Watchlist</span>
              </button>
              <button
                onClick={() => setActiveTab('requests-exports')}
                className="w-full px-2 py-2 rounded flex items-center gap-2 text-[#050F1C] hover:bg-gray-50"
              >
                <FileText className="w-4 h-4" />
                <span className="text-sm font-normal" style={{ fontFamily: 'Satoshi' }}>Requests & Exports</span>
              </button>
              <button
                onClick={() => setActiveTab('help-support')}
                className="w-full px-2 py-2 rounded flex items-center gap-2 text-[#050F1C] hover:bg-gray-50"
              >
                <HelpCircle className="w-4 h-4" />
                <span className="text-sm font-normal" style={{ fontFamily: 'Satoshi' }}>Help & Support</span>
              </button>
              <button
                onClick={() => setActiveTab('notifications')}
                className="w-full px-2 py-2 rounded flex items-center gap-2 text-[#050F1C] hover:bg-gray-50"
              >
                <Bell className="w-4 h-4" />
                <span className="text-sm font-normal" style={{ fontFamily: 'Satoshi' }}>Notifications</span>
              </button>
            </div>
          </div>

          {/* Bottom Menu */}
          <div className="flex flex-col gap-6">
            <button
              onClick={() => setActiveTab('settings')}
              className="w-full px-2 py-2 rounded flex items-center gap-2 text-[#050F1C] hover:bg-gray-50"
            >
              <Settings className="w-4 h-4" />
              <span className="text-sm font-normal" style={{ fontFamily: 'Satoshi' }}>System Settings</span>
            </button>
            <button
              onClick={handleLogout}
              className="w-full px-2 py-2 rounded flex items-center gap-2 text-[#EF4444] hover:bg-gray-50"
            >
              <LogOut className="w-4 h-4" />
              <span className="text-sm font-normal" style={{ fontFamily: 'Satoshi' }}>Log Out</span>
            </button>
          </div>
        </div>
      </div>

      {/* Logout Confirmation Modal */}
      {showLogoutModal && (
        <LogoutConfirmationModal
          onClose={() => setShowLogoutModal(false)}
          onConfirm={confirmLogout}
        />
      )}
    </>
  );
};

export default CorporateClientNavbar;

