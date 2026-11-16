import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Menu } from 'lucide-react';
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
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
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
    <div className="min-h-screen bg-[#f4f7f8]">
      {isSidebarOpen && (
        <div className="fixed inset-0 z-40 bg-black/45 lg:hidden" onClick={() => setIsSidebarOpen(false)} />
      )}

      <div className={`fixed inset-y-0 left-0 z-50 transform transition-transform duration-200 lg:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <CourtRegistrarNavbar
          activeTab={activeTab}
          setActiveTab={(tab) => {
            setActiveTab(tab);
            setIsSidebarOpen(false);
          }}
          onLogout={handleLogout}
        />
      </div>

      <button type="button" onClick={() => setIsSidebarOpen(true)} className="fixed left-3.5 top-3.5 z-40 border border-[#dce5e9] bg-white p-2 shadow-sm hover:bg-[#f2f6f6] lg:hidden" aria-label="Open navigation">
        <Menu size={20} />
      </button>

      <div className="min-h-screen lg:ml-60">
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

