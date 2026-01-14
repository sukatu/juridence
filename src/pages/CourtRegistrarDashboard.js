import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import CourtRegistrarNavbar from '../components/CourtRegistrarNavbar';
import CourtRegistrarDashboardOverview from '../components/CourtRegistrarDashboardOverview';
import RegistrarCauseListPage from '../components/RegistrarCauseListPage';
import CaseProfilePage from '../components/CaseProfilePage';
import RegistrarBillingPage from '../components/RegistrarBillingPage';
import RegistrarPendingTasksPage from '../components/RegistrarPendingTasksPage';
import RegistrarNotificationsPage from '../components/RegistrarNotificationsPage';
import RegistrarSystemSettingsPage from '../components/RegistrarSystemSettingsPage';
import RegistrarsPage from '../components/RegistrarsPage';
import LogoutConfirmationModal from '../components/admin/LogoutConfirmationModal';

const CourtRegistrarDashboard = () => {
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
        return <CourtRegistrarDashboardOverview userInfo={userInfo} onNavigate={handleNavigate} onLogout={handleLogout} />;
      case 'billing':
        return <RegistrarBillingPage userInfo={userInfo} onNavigate={handleNavigate} onLogout={handleLogout} />;
      case 'cause-list':
        return <RegistrarCauseListPage userInfo={userInfo} onNavigate={handleNavigate} onLogout={handleLogout} />;
      case 'case-profile':
        return <CaseProfilePage userInfo={userInfo} onNavigate={handleNavigate} onLogout={handleLogout} isRegistrar={true} />;
      case 'registrars':
        return <RegistrarsPage userInfo={userInfo} onNavigate={handleNavigate} onLogout={handleLogout} />;
      case 'pending-tasks':
        return <RegistrarPendingTasksPage userInfo={userInfo} onNavigate={handleNavigate} onLogout={handleLogout} />;
      case 'notifications':
        return <RegistrarNotificationsPage userInfo={userInfo} onNavigate={handleNavigate} onLogout={handleLogout} />;
      case 'settings':
        return <RegistrarSystemSettingsPage userInfo={userInfo} onNavigate={handleNavigate} onLogout={handleLogout} />;
      default:
        return <CourtRegistrarDashboardOverview userInfo={userInfo} onNavigate={handleNavigate} onLogout={handleLogout} />;
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F8FA] flex">
      {/* Sidebar */}
      <CourtRegistrarNavbar 
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

export default CourtRegistrarDashboard;

