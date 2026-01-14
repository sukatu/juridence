import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import CorporateClientNavbar from '../components/CorporateClientNavbar';
import CorporateClientDashboardOverview from '../components/CorporateClientDashboardOverview';
import CorporateClientBillingPage from '../components/CorporateClientBillingPage';
import CorporateClientPersonsPage from '../components/CorporateClientPersonsPage';
import CorporateClientCompaniesPage from '../components/CorporateClientCompaniesPage';
import CorporateClientWatchlistPage from '../components/CorporateClientWatchlistPage';
import CorporateClientRequestsExportsPage from '../components/CorporateClientRequestsExportsPage';
import CorporateClientTeamPage from '../components/CorporateClientTeamPage';
import CorporateClientHelpSupportPage from '../components/CorporateClientHelpSupportPage';
import CorporateClientNotificationsPage from '../components/CorporateClientNotificationsPage';
import CorporateClientSystemSettingsPage from '../components/CorporateClientSystemSettingsPage';
import CorporateClientSearchResultsPage from '../components/CorporateClientSearchResultsPage';
import LogoutConfirmationModal from '../components/admin/LogoutConfirmationModal';

const CorporateClientDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [userInfo, setUserInfo] = useState(null);

  // Load user info from localStorage
  React.useEffect(() => {
    const loadUserInfo = () => {
      try {
        const userData = localStorage.getItem('userData');
        if (userData) {
          setUserInfo(JSON.parse(userData));
        }
      } catch (error) {
        console.error('Error loading user data:', error);
      }
    };
    loadUserInfo();
    window.addEventListener('authStateChanged', loadUserInfo);
    return () => window.removeEventListener('authStateChanged', loadUserInfo);
  }, []);

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

  const handleNavigate = (tab) => {
    setActiveTab(tab);
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <CorporateClientDashboardOverview userInfo={userInfo} onNavigate={handleNavigate} onLogout={handleLogout} />;
      case 'billing':
        return <CorporateClientBillingPage userInfo={userInfo} onNavigate={handleNavigate} onLogout={handleLogout} />;
      case 'team':
        return <CorporateClientTeamPage userInfo={userInfo} onNavigate={handleNavigate} onLogout={handleLogout} />;
      case 'persons':
        return <CorporateClientPersonsPage 
          userInfo={userInfo} 
          onNavigate={handleNavigate} 
          onLogout={handleLogout}
          onSelectIndustry={(industry) => {
            // Handle industry selection - can navigate to entity selector or persons list
            console.log('Selected industry:', industry);
          }} 
        />;
      case 'companies':
        return <CorporateClientCompaniesPage 
          userInfo={userInfo} 
          onNavigate={handleNavigate} 
          onLogout={handleLogout}
          onSelectIndustry={(industry) => {
            // Handle industry selection - can navigate to companies list
            console.log('Selected industry:', industry);
          }} 
        />;
      case 'watchlist':
        return <CorporateClientWatchlistPage userInfo={userInfo} onNavigate={handleNavigate} onLogout={handleLogout} />;
      case 'requests-exports':
        return <CorporateClientRequestsExportsPage userInfo={userInfo} onNavigate={handleNavigate} onLogout={handleLogout} />;
      case 'help-support':
        return <CorporateClientHelpSupportPage userInfo={userInfo} onNavigate={handleNavigate} onLogout={handleLogout} />;
      case 'notifications':
        return <CorporateClientNotificationsPage userInfo={userInfo} onNavigate={handleNavigate} onLogout={handleLogout} />;
      case 'settings':
        return <CorporateClientSystemSettingsPage userInfo={userInfo} onNavigate={handleNavigate} onLogout={handleLogout} />;
      case 'search':
        return <CorporateClientSearchResultsPage userInfo={userInfo} onNavigate={handleNavigate} onLogout={handleLogout} />;
      default:
        return <CorporateClientDashboardOverview userInfo={userInfo} onNavigate={handleNavigate} onLogout={handleLogout} />;
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F8FA] flex">
      {/* Sidebar */}
      <CorporateClientNavbar 
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onLogout={handleLogout}
      />

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        {renderContent()}
      </div>

      {/* Logout Confirmation Modal */}
      {showLogoutModal && (
        <LogoutConfirmationModal
          onClose={() => setShowLogoutModal(false)}
          onConfirm={confirmLogout}
        />
      )}
    </div>
  );
};

export default CorporateClientDashboard;

