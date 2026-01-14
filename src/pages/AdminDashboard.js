import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
} from 'chart.js';
import { Bar, Doughnut, Line } from 'react-chartjs-2';
import { 
  Users, 
  Key, 
  FileText, 
  UserCheck, 
  Building2, 
  Shield, 
  CreditCard, 
  BarChart3, 
  Settings, 
  LogOut,
  Menu,
  X,
  Home,
  Activity,
  TrendingUp,
  Database,
  AlertCircle,
  CheckCircle,
  Star,
  DollarSign,
  Percent,
  Clock,
  MapPin,
  Calendar,
  PieChart,
  LineChart,
  TrendingDown,
  ArrowUp,
  ArrowDown,
  RefreshCw,
  Eye,
  Target,
  Zap,
  Globe,
  BookOpen,
  FolderOpen,
  Code,
  FileCode,
  HelpCircle,
  Scale
} from 'lucide-react';
import UserManagement from '../components/admin/UserManagement';
import ClientAndRegistrarManagement from '../components/admin/ClientAndRegistrarManagement';
import ApiKeyManagement from '../components/admin/ApiKeyManagement';
import CaseManagement from '../components/admin/CaseManagement';
import JudgeManagement from '../components/admin/JudgeManagement';
import CourtTypeManagement from '../components/admin/CourtTypeManagement';
import PeopleManagement from '../components/admin/PeopleManagement';
import PersonsManagementFigma from '../components/admin/PersonsManagementFigma';
import PersonSearchPage from './PersonSearchPage';
import PeopleRelationshipsPage from '../components/admin/PeopleRelationshipsPage';
import EmployeeManagement from '../pages/EmployeeManagement';
import GazetteManagement from '../pages/GazetteManagement';
import BankManagement from '../components/admin/BankManagement';
import InsuranceManagement from '../components/admin/InsuranceManagement';
import CompaniesIndustrySelector from '../components/admin/CompaniesIndustrySelector';
import CauseListPage from '../components/admin/CauseListPage';
import CauseListPage2 from '../components/admin/CauseListPage2';
import GazetteUploadPage from '../components/admin/GazetteUploadPage';
import GazetteApprovalPage from '../components/admin/GazetteApprovalPage';
import SearchRequestsPage from '../components/admin/SearchRequestsPage';
import ManageRequestsPage from '../components/admin/ManageRequestsPage';
import ReportsLogsPage from '../components/admin/ReportsLogsPage';
import AuditLogViewerPage from '../components/admin/AuditLogViewerPage';
import RevenuePage from '../components/admin/RevenuePage';
import SystemSettingsPage from '../components/admin/SystemSettingsPage';
import PaymentManagement from '../components/admin/PaymentManagement';
import SettingsManagement from '../components/admin/SettingsManagement';
import RolesPermissionsManagement from '../components/admin/RolesPermissionsManagement';
import SubscriptionRequests from '../components/admin/SubscriptionRequests';
import TenantManagement from '../components/admin/TenantManagement';
import CourtManagement from '../components/admin/CourtManagement';
import ProfileManagement from '../components/admin/ProfileManagement';
import AIAnalytics from '../components/admin/AIAnalytics';
import Documentation from '../components/admin/Documentation';
import FileRepository from './FileRepository';
import LogsViewer from '../components/LogsViewer';
import AdminNavbar from '../components/AdminNavbar';
import AdminDashboardOverview from '../components/AdminDashboardOverview';
import CaseProfilePage from '../components/admin/CaseProfilePage';
import RegistrarCaseDetailsPage from '../components/RegistrarCaseDetailsPage';
import LogoutConfirmationModal from '../components/admin/LogoutConfirmationModal';
import { apiGet } from '../utils/api';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement
);

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [userInfo, setUserInfo] = useState(null);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalCases: 0,
    totalPeople: 0,
    totalBanks: 0,
    totalInsurance: 0,
    totalCompanies: 0,
    totalPayments: 0,
    activeSubscriptions: 0,
    // Enhanced stats
    totalRevenue: 0,
    avgRiskScore: 0,
    highRiskCount: 0,
    verifiedCount: 0,
    totalBranches: 0,
    totalEmployees: 0,
    avgRating: 0,
    pendingPayments: 0,
    systemHealth: 'healthy',
    // New comprehensive analytics
    monthlyRevenue: 0,
    monthlyGrowth: 0,
    caseResolutionRate: 0,
    avgCaseValue: 0,
    riskDistribution: { low: 0, medium: 0, high: 0, critical: 0 },
    regionDistribution: {},
    courtTypeDistribution: {},
    recentActivity: [],
    systemMetrics: {
      uptime: '99.9%',
      responseTime: '120ms',
      errorRate: '0.1%',
      cpuUsage: '45%',
      memoryUsage: '67%'
    },
    trends: {
      userGrowth: 0,
      caseGrowth: 0,
      revenueGrowth: 0,
      riskTrend: 'stable'
    }
  });
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoadingStats, setIsLoadingStats] = useState(true);

  // Check authentication and admin status
  useEffect(() => {
    const checkAuthStatus = () => {
      const authStatus = localStorage.getItem('isAuthenticated');
      const userData = localStorage.getItem('userData');
      const isAuth = authStatus === 'true';
      
      setIsAuthenticated(isAuth);
      
      if (isAuth && userData) {
        try {
          const user = JSON.parse(userData);
          setUserInfo(user);
          
          // Check if user is admin from multiple sources (matching login logic)
          const isAdminFromStorage = localStorage.getItem('isAdmin') === 'true';
          const isAdminFromRole = user.role === 'admin' || user.role === 'ADMIN';
          const isAdminFromFlag = user.is_admin === true;
          const isAdminFromUserType = user.user_type === 'administrator';
          
          const isAdminUser = isAdminFromStorage || 
                             isAdminFromRole || 
                             isAdminFromFlag || 
                             isAdminFromUserType;
          
          console.log('AdminDashboard - Admin check:', {
            isAdminFromStorage,
            isAdminFromRole,
            isAdminFromFlag,
            isAdminFromUserType,
            userRole: user.role,
            userType: user.user_type,
            isAdmin: user.is_admin,
            finalDecision: isAdminUser
          });
          
          setIsAdmin(isAdminUser);
          
          // Ensure isAdmin flag is set in localStorage if user is admin
          if (isAdminUser) {
            localStorage.setItem('isAdmin', 'true');
          }
        } catch (error) {
          console.error('Error parsing user data:', error);
        }
      }
    };

    checkAuthStatus();

    // Listen for authentication changes
    const handleAuthChange = () => {
      checkAuthStatus();
    };

    window.addEventListener('authStateChanged', handleAuthChange);
    window.addEventListener('storage', handleAuthChange);

    return () => {
      window.removeEventListener('authStateChanged', handleAuthChange);
      window.removeEventListener('storage', handleAuthChange);
    };
  }, []);

  // Load dashboard statistics
  useEffect(() => {
    if (isAdmin) {
      loadDashboardStats();
    }
  }, [isAdmin]);

  const loadDashboardStats = async () => {
    try {
      setIsLoadingStats(true);
      // Load statistics from various endpoints using authenticated API
      const [adminData, usersData, casesData, peopleData, banksData, insuranceData, companiesData, paymentsData, employeeAnalytics] = await Promise.allSettled([
        apiGet('/admin/stats'),
        apiGet('/admin/users/stats'),
        apiGet('/admin/cases/stats'),
        apiGet('/admin/people/stats'),
        apiGet('/admin/banks/stats'),
        apiGet('/admin/insurance/stats'),
        apiGet('/admin/companies/stats'),
        apiGet('/admin/payments/stats'),
        apiGet('/employees/analytics/overview')
      ]);

      // Extract data from settled promises
      const adminDataResult = adminData.status === 'fulfilled' ? adminData.value : {};
      const usersDataResult = usersData.status === 'fulfilled' ? usersData.value : {};
      const casesDataResult = casesData.status === 'fulfilled' ? casesData.value : {};
      const peopleDataResult = peopleData.status === 'fulfilled' ? peopleData.value : {};
      const banksDataResult = banksData.status === 'fulfilled' ? banksData.value : {};
      const insuranceDataResult = insuranceData.status === 'fulfilled' ? insuranceData.value : {};
      const companiesDataResult = companiesData.status === 'fulfilled' ? companiesData.value : {};
      const paymentsDataResult = paymentsData.status === 'fulfilled' ? paymentsData.value : {};
      const employeeAnalyticsResult = employeeAnalytics.status === 'fulfilled' ? employeeAnalytics.value : {
        total_employees: 0,
        active_employees: 0,
        recent_hires: 0,
        status_breakdown: {},
        type_breakdown: {},
        employer_type_breakdown: {},
        top_employers: []
      };

      // Calculate additional metrics
      const totalRevenue = paymentsDataResult.total_revenue || 0;
      const monthlyRevenue = totalRevenue * 0.08; // Approximate monthly revenue
      const monthlyGrowth = 12.5; // Mock growth percentage
      const caseResolutionRate = casesDataResult.resolved_cases ? (casesDataResult.resolved_cases / casesDataResult.total_cases) * 100 : 0;
      const avgCaseValue = totalRevenue / (casesDataResult.total_cases || 1);

      setStats({
        totalUsers: adminDataResult.total_users || 0,
        totalCases: adminDataResult.total_cases || 0,
        totalPeople: adminDataResult.total_people || 0,
        totalBanks: adminDataResult.total_banks || 0,
        totalInsurance: adminDataResult.total_insurance || 0,
        totalCompanies: adminDataResult.total_companies || 0,
        totalPayments: adminDataResult.total_payments || 0,
        activeSubscriptions: adminDataResult.active_subscriptions || 0,
        // Enhanced stats
        totalRevenue: totalRevenue,
        avgRiskScore: peopleDataResult.avg_risk_score || 0,
        highRiskCount: peopleDataResult.high_risk_count || 0,
        verifiedCount: peopleDataResult.verified_count || 0,
        totalBranches: (banksDataResult.total_branches || 0) + (insuranceDataResult.total_branches || 0),
        totalEmployees: employeeAnalyticsResult.total_employees || 0,
        // Employee analytics
        employeeAnalytics: employeeAnalyticsResult,
        avgRating: ((banksDataResult.avg_rating || 0) + (insuranceDataResult.avg_rating || 0) + (companiesDataResult.avg_rating || 0)) / 3,
        pendingPayments: paymentsDataResult.pending_payments || 0,
        systemHealth: 'healthy',
        // New comprehensive analytics
        monthlyRevenue: monthlyRevenue,
        monthlyGrowth: monthlyGrowth,
        caseResolutionRate: caseResolutionRate,
        avgCaseValue: avgCaseValue,
        riskDistribution: {
          low: Math.floor((peopleDataResult.total_people || 0) * 0.6),
          medium: Math.floor((peopleDataResult.total_people || 0) * 0.25),
          high: Math.floor((peopleDataResult.total_people || 0) * 0.12),
          critical: Math.floor((peopleDataResult.total_people || 0) * 0.03)
        },
        regionDistribution: casesDataResult.region_distribution || {
          'Greater Accra': 45,
          'Ashanti': 25,
          'Western': 15,
          'Eastern': 10,
          'Others': 5
        },
        courtTypeDistribution: casesDataResult.court_type_distribution || {
          'High Court': 40,
          'Supreme Court': 25,
          'Court of Appeal': 20,
          'District Court': 15
        },
        recentActivity: [
          { type: 'user', message: 'New user registered', time: '2 minutes ago', status: 'success' },
          { type: 'case', message: 'New case added', time: '5 minutes ago', status: 'info' },
          { type: 'payment', message: 'Payment processed', time: '10 minutes ago', status: 'success' },
          { type: 'api', message: 'API key generated', time: '15 minutes ago', status: 'info' },
          { type: 'risk', message: 'High risk person flagged', time: '20 minutes ago', status: 'warning' }
        ],
        systemMetrics: {
          uptime: '99.9%',
          responseTime: '120ms',
          errorRate: '0.1%',
          cpuUsage: '45%',
          memoryUsage: '67%'
        },
        trends: {
          userGrowth: 8.5,
          caseGrowth: 15.2,
          revenueGrowth: 12.5,
          riskTrend: 'stable'
        }
      });
    } catch (error) {
      console.error('Error loading dashboard stats:', error);
    } finally {
      setIsLoadingStats(false);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await loadDashboardStats();
    } catch (error) {
      console.error('Error refreshing dashboard:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  // Toggle sidebar collapse
  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

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

  // Redirect if not authenticated or not admin
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Authentication Required</h2>
          <p className="text-slate-600 mb-4">Please log in to access the admin dashboard.</p>
          <button
            onClick={() => navigate('/login')}
            className="bg-sky-600 text-white px-4 py-2 rounded-lg hover:bg-sky-700 transition-colors"
          >
            <span style={{ fontFamily: 'Satoshi' }}>Go To Login</span>
          </button>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <Shield className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Access Denied</h2>
          <p className="text-slate-600 mb-4">You don't have admin privileges to access this dashboard.</p>
          <button
            onClick={() => navigate('/')}
            className="bg-sky-600 text-white px-4 py-2 rounded-lg hover:bg-sky-700 transition-colors"
          >
            <span style={{ fontFamily: 'Satoshi' }}>Go To Home</span>
          </button>
        </div>
      </div>
    );
  }

  const navigationItems = [
    // Core Management (0-5)
    { id: 'overview', name: 'Overview', icon: BarChart3 },
    { id: 'profile', name: 'Profile', icon: Users },
    { id: 'users', name: 'Users', icon: UserCheck },
    { id: 'roles', name: 'Roles & Permissions', icon: Shield },
    { id: 'api-keys', name: 'API Keys', icon: Key },
    { id: 'settings', name: 'Settings', icon: Settings },
    
    // Legal & Court Management (6-11)
    { id: 'cases', name: 'Cases', icon: FileText },
    { id: 'case-hearings', name: 'Case Hearing Details', icon: Calendar },
    { id: 'judges', name: 'Judges', icon: Scale },
    { id: 'courts', name: 'Courts', icon: MapPin },
    { id: 'court-types', name: 'Court Types', icon: Building2 },
    { id: 'gazette', name: 'Gazette', icon: FileText },
    
    // People & Organizations (12-18)
    { id: 'people', name: 'People', icon: UserCheck },
    { id: 'people-relationships', name: 'Relationships', icon: UserCheck },
    { id: 'employees', name: 'Employees', icon: Users },
    { id: 'banks', name: 'Banks', icon: Building2 },
    { id: 'insurance', name: 'Insurance', icon: Shield },
    { id: 'companies', name: 'Companies', icon: Database },
    { id: 'tenants', name: 'Organizations', icon: Globe },
    
    // Financial & Operations (18-20)
    { id: 'payments', name: 'Payments', icon: CreditCard },
    { id: 'subscription-requests', name: 'Subscription Requests', icon: Clock },
    { id: 'file-repository', name: 'File Repository', icon: FolderOpen },
    
    // Advanced Tools (21-24)
    { id: 'ai-analytics', name: 'AI Analytics', icon: Zap },
    { id: 'documentation', name: 'Documentation', icon: BookOpen },
    { id: 'logs', name: 'System Logs', icon: Activity }
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return <AdminDashboardOverview stats={stats} userInfo={userInfo} onNavigate={setActiveTab} onLogout={handleLogout} />;
      case 'profile':
        return <ProfileManagement userInfo={userInfo} onNavigate={setActiveTab} onLogout={handleLogout} />;
      case 'users':
        return <UserManagement userInfo={userInfo} onNavigate={setActiveTab} onLogout={handleLogout} />;
      case 'clients-registrars':
        return <ClientAndRegistrarManagement userInfo={userInfo} onNavigate={setActiveTab} onLogout={handleLogout} />;
      case 'api-keys':
        return <ApiKeyManagement />;
      case 'cases':
        return <CaseManagement />;
      case 'judges':
        return <JudgeManagement />;
      case 'court-types':
        return <CourtTypeManagement />;
      case 'people':
        return <PersonsManagementFigma userInfo={userInfo} onNavigate={setActiveTab} onLogout={handleLogout} />;
      case 'person-search':
        return <PersonSearchPage userInfo={userInfo} onNavigate={setActiveTab} onLogout={handleLogout} />;
      case 'people-relationships':
        return <PeopleRelationshipsPage userInfo={userInfo} onNavigate={setActiveTab} onLogout={handleLogout} />;
      case 'employees':
        return <EmployeeManagement />;
      case 'gazette':
        return <GazetteManagement />;
      case 'gazette-upload':
        return <GazetteUploadPage userInfo={userInfo} onNavigate={setActiveTab} onLogout={handleLogout} />;
      case 'gazette-approval':
        return <GazetteApprovalPage userInfo={userInfo} onNavigate={setActiveTab} onLogout={handleLogout} />;
      case 'search-requests':
        return <SearchRequestsPage userInfo={userInfo} onNavigate={setActiveTab} onLogout={handleLogout} />;
      case 'manage-requests':
        return <ManageRequestsPage userInfo={userInfo} onNavigate={setActiveTab} onLogout={handleLogout} />;
      case 'logs':
        return <ReportsLogsPage userInfo={userInfo} onNavigate={setActiveTab} onLogout={handleLogout} />;
      case 'audit-logs':
        return <AuditLogViewerPage userInfo={userInfo} onNavigate={setActiveTab} onLogout={handleLogout} />;
      case 'banks':
        return <BankManagement />;
      case 'insurance':
        return <InsuranceManagement />;
      case 'companies':
        return <CompaniesIndustrySelector userInfo={userInfo} onNavigate={setActiveTab} onLogout={handleLogout} />;
      case 'case-hearings':
        return <CauseListPage userInfo={userInfo} onNavigate={setActiveTab} onLogout={handleLogout} />;
      case 'case-hearings-2':
        return <CauseListPage2 userInfo={userInfo} onNavigate={setActiveTab} onLogout={handleLogout} />;
      case 'case-profile':
        return <CaseProfilePage userInfo={userInfo} onNavigate={setActiveTab} onLogout={handleLogout} isRegistrar={false} />;
      case 'payments':
        return <RevenuePage userInfo={userInfo} onNavigate={setActiveTab} onLogout={handleLogout} />;
      case 'subscription-requests':
        return <SubscriptionRequests />;
      case 'tenants':
        return <TenantManagement />;
      case 'courts':
        return <CourtManagement />;
      case 'ai-analytics':
        return <AIAnalytics />;
      case 'documentation':
        return <Documentation />;
      case 'file-repository':
        return <FileRepository />;
      case 'logs':
        return <LogsViewer />;
      case 'roles':
        return <RolesPermissionsManagement />;
      case 'settings':
        return <SystemSettingsPage userInfo={userInfo} onNavigate={setActiveTab} onLogout={handleLogout} />;
      default:
        return <AdminDashboardOverview stats={stats} userInfo={userInfo} />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Mobile sidebar backdrop */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar - New Figma Design */}
      <div className={`fixed inset-y-0 left-0 z-50 shadow-lg transform transition-all duration-300 ease-in-out lg:translate-x-0 ${
        isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <AdminNavbar 
          activeTab={activeTab}
          setActiveTab={(tab) => {
            setActiveTab(tab);
            setIsSidebarOpen(false);
          }}
          onLogout={handleLogout}
          isSidebarCollapsed={isSidebarCollapsed}
        />
      </div>

      {/* Main content */}
      <div className={`min-h-screen transition-all duration-300 ease-in-out ${isSidebarCollapsed ? 'lg:ml-16' : 'lg:ml-60'}`}>
        {/* Mobile menu button */}
        <button
          onClick={() => setIsSidebarOpen(true)}
          className="lg:hidden fixed top-4 left-4 z-30 p-2 bg-white rounded-md shadow-lg hover:bg-slate-100"
        >
          <Menu className="h-5 w-5" />
        </button>

        {/* Page content - Full screen without top bar */}
        <div className="h-full bg-slate-50">
          {renderContent()}
        </div>
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

// Enhanced Overview Tab with comprehensive analytics and charts
const OverviewTab = ({ stats, onRefresh, isRefreshing, isLoadingStats }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case 'success': return 'text-green-600';
      case 'warning': return 'text-yellow-600';
      case 'error': return 'text-red-600';
      default: return 'text-blue-600';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'success': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'warning': return <AlertCircle className="h-4 w-4 text-yellow-600" />;
      case 'error': return <X className="h-4 w-4 text-red-600" />;
      default: return <Activity className="h-4 w-4 text-blue-600" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with refresh button */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Dashboard Overview</h2>
          <p className="text-slate-600">Comprehensive analytics and system insights</p>
        </div>
        <button 
          onClick={onRefresh}
          disabled={isRefreshing}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          <span>{isRefreshing ? 'Refreshing...' : 'Refresh Data'}</span>
        </button>
      </div>

      {/* Key Performance Indicators */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Total Revenue</p>
              <p className="text-3xl font-bold text-slate-900">
                GHS {stats.totalRevenue?.toLocaleString() || '0'}
              </p>
              <div className="flex items-center mt-2">
                <ArrowUp className="h-4 w-4 text-green-600" />
                <span className="text-sm text-green-600 font-medium">+{stats.monthlyGrowth}%</span>
                <span className="text-sm text-slate-500 ml-1">this month</span>
              </div>
            </div>
            <div className="p-3 bg-blue-100 rounded-full">
              <DollarSign className="h-8 w-8 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow border-l-4 border-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Total Cases</p>
              <p className="text-3xl font-bold text-slate-900">{stats.totalCases}</p>
              <div className="flex items-center mt-2">
                <TrendingUp className="h-4 w-4 text-green-600" />
                <span className="text-sm text-green-600 font-medium">+{stats.trends.caseGrowth}%</span>
                <span className="text-sm text-slate-500 ml-1">vs last month</span>
              </div>
            </div>
            <div className="p-3 bg-green-100 rounded-full">
              <FileText className="h-8 w-8 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow border-l-4 border-purple-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Total Users</p>
              <p className="text-3xl font-bold text-slate-900">{stats.totalUsers}</p>
              <div className="flex items-center mt-2">
                <Users className="h-4 w-4 text-purple-600" />
                <span className="text-sm text-purple-600 font-medium">+{stats.trends.userGrowth}%</span>
                <span className="text-sm text-slate-500 ml-1">growth</span>
              </div>
            </div>
            <div className="p-3 bg-purple-100 rounded-full">
              <Users className="h-8 w-8 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow border-l-4 border-orange-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Risk Score</p>
              <p className="text-3xl font-bold text-slate-900">{stats.avgRiskScore?.toFixed(1) || '0.0'}</p>
              <div className="flex items-center mt-2">
                <Shield className="h-4 w-4 text-orange-600" />
                <span className="text-sm text-orange-600 font-medium">{stats.trends.riskTrend}</span>
                <span className="text-sm text-slate-500 ml-1">trend</span>
              </div>
            </div>
            <div className="p-3 bg-orange-100 rounded-full">
              <Shield className="h-8 w-8 text-orange-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Additional Statistics Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow border-l-4 border-cyan-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Total People</p>
              <p className="text-3xl font-bold text-slate-900">{stats.totalPeople}</p>
              <div className="flex items-center mt-2">
                <UserCheck className="h-4 w-4 text-cyan-600" />
                <span className="text-sm text-cyan-600 font-medium">Records</span>
              </div>
            </div>
            <div className="p-3 bg-cyan-100 rounded-full">
              <UserCheck className="h-8 w-8 text-cyan-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow border-l-4 border-indigo-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Total Banks</p>
              <p className="text-3xl font-bold text-slate-900">{stats.totalBanks}</p>
              <div className="flex items-center mt-2">
                <Building2 className="h-4 w-4 text-indigo-600" />
                <span className="text-sm text-indigo-600 font-medium">Institutions</span>
              </div>
            </div>
            <div className="p-3 bg-indigo-100 rounded-full">
              <Building2 className="h-8 w-8 text-indigo-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow border-l-4 border-emerald-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Total Insurance</p>
              <p className="text-3xl font-bold text-slate-900">{stats.totalInsurance}</p>
              <div className="flex items-center mt-2">
                <Shield className="h-4 w-4 text-emerald-600" />
                <span className="text-sm text-emerald-600 font-medium">Companies</span>
              </div>
            </div>
            <div className="p-3 bg-emerald-100 rounded-full">
              <Shield className="h-8 w-8 text-emerald-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow border-l-4 border-violet-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Total Companies</p>
              <p className="text-3xl font-bold text-slate-900">{stats.totalCompanies}</p>
              <div className="flex items-center mt-2">
                <Database className="h-4 w-4 text-violet-600" />
                <span className="text-sm text-violet-600 font-medium">Entities</span>
              </div>
            </div>
            <div className="p-3 bg-violet-100 rounded-full">
              <Database className="h-8 w-8 text-violet-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Employee Analytics Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Total Employees</p>
              <p className="text-3xl font-bold text-slate-900">
                {isLoadingStats ? '...' : (stats.employeeAnalytics?.total_employees || 0)}
              </p>
              <div className="flex items-center mt-2">
                <Users className="h-4 w-4 text-blue-600" />
                <span className="text-sm text-blue-600 font-medium">Workforce</span>
              </div>
            </div>
            <div className="p-3 bg-blue-100 rounded-full">
              <Users className="h-8 w-8 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow border-l-4 border-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Active Employees</p>
              <p className="text-3xl font-bold text-slate-900">
                {isLoadingStats ? '...' : (stats.employeeAnalytics?.active_employees || 0)}
              </p>
              <div className="flex items-center mt-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span className="text-sm text-green-600 font-medium">Currently Working</span>
              </div>
            </div>
            <div className="p-3 bg-green-100 rounded-full">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow border-l-4 border-purple-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Recent Hires</p>
              <p className="text-3xl font-bold text-slate-900">
                {isLoadingStats ? '...' : (stats.employeeAnalytics?.recent_hires || 0)}
              </p>
              <div className="flex items-center mt-2">
                <Calendar className="h-4 w-4 text-purple-600" />
                <span className="text-sm text-purple-600 font-medium">Last 30 Days</span>
              </div>
            </div>
            <div className="p-3 bg-purple-100 rounded-full">
              <Calendar className="h-8 w-8 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow border-l-4 border-orange-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Top Employer</p>
              <p className="text-lg font-bold text-slate-900">
                {isLoadingStats ? '...' : (stats.employeeAnalytics?.top_employers?.[0]?.name || 'N/A')}
              </p>
              <div className="flex items-center mt-2">
                <Building2 className="h-4 w-4 text-orange-600" />
                <span className="text-sm text-orange-600 font-medium">
                  {isLoadingStats ? '...' : (stats.employeeAnalytics?.top_employers?.[0]?.count || 0)} employees
                </span>
              </div>
            </div>
            <div className="p-3 bg-orange-100 rounded-full">
              <Building2 className="h-8 w-8 text-orange-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Analytics Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Risk Distribution Chart */}
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-slate-900">Risk Distribution</h3>
            <PieChart className="h-5 w-5 text-slate-400" />
          </div>
          <div className="h-64">
            <Doughnut
              data={{
                labels: Object.keys(stats.riskDistribution).map(level => 
                  level.charAt(0).toUpperCase() + level.slice(1) + ' Risk'
                ),
                datasets: [{
                  data: Object.values(stats.riskDistribution),
                  backgroundColor: [
                    '#10B981', // green for low
                    '#F59E0B', // yellow for medium
                    '#F97316', // orange for high
                    '#EF4444'  // red for critical
                  ],
                  borderWidth: 2,
                  borderColor: '#ffffff'
                }]
              }}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: 'bottom',
                    labels: {
                      padding: 20,
                      usePointStyle: true
                    }
                  },
                  tooltip: {
                    callbacks: {
                      label: function(context) {
                        const total = context.dataset.data.reduce((a, b) => a + b, 0);
                        const percentage = ((context.parsed / total) * 100).toFixed(1);
                        return `${context.label}: ${context.parsed} (${percentage}%)`;
                      }
                    }
                  }
                }
              }}
            />
          </div>
        </div>

        {/* Regional Distribution */}
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-slate-900">Regional Distribution</h3>
            <MapPin className="h-5 w-5 text-slate-400" />
          </div>
          <div className="h-64">
            <Bar
              data={{
                labels: Object.keys(stats.regionDistribution),
                datasets: [{
                  label: 'Cases by Region (%)',
                  data: Object.values(stats.regionDistribution),
                  backgroundColor: [
                    '#3B82F6',
                    '#10B981',
                    '#F59E0B',
                    '#EF4444',
                    '#8B5CF6'
                  ],
                  borderRadius: 4,
                  borderSkipped: false,
                }]
              }}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    display: false
                  },
                  tooltip: {
                    callbacks: {
                      label: function(context) {
                        return `${context.label}: ${context.parsed.y}%`;
                      }
                    }
                  }
                },
                scales: {
                  y: {
                    beginAtZero: true,
                    max: 100,
                    ticks: {
                      callback: function(value) {
                        return value + '%';
                      }
                    }
                  }
                }
              }}
            />
          </div>
        </div>
      </div>

      {/* Detailed Statistics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-slate-600">Case Resolution Rate</p>
              <p className="text-2xl font-bold text-slate-900">{stats.caseResolutionRate?.toFixed(1) || '0.0'}%</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <DollarSign className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-slate-600">Avg Case Value</p>
              <p className="text-2xl font-bold text-slate-900">GHS {stats.avgCaseValue?.toFixed(0) || '0'}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Building2 className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-slate-600">Total Branches</p>
              <p className="text-2xl font-bold text-slate-900">{stats.totalBranches}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <CreditCard className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-slate-600">Pending Payments</p>
              <p className="text-2xl font-bold text-slate-900">{stats.pendingPayments}</p>
            </div>
          </div>
        </div>
      </div>

      {/* System Metrics and Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* System Health */}
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-slate-900">System Health</h3>
            <Activity className="h-5 w-5 text-slate-400" />
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-600">Uptime</span>
              <span className="text-sm font-bold text-green-600">{stats.systemMetrics.uptime}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-600">Response Time</span>
              <span className="text-sm font-bold text-blue-600">{stats.systemMetrics.responseTime}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-600">Error Rate</span>
              <span className="text-sm font-bold text-green-600">{stats.systemMetrics.errorRate}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-600">CPU Usage</span>
              <span className="text-sm font-bold text-orange-600">{stats.systemMetrics.cpuUsage}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-600">Memory Usage</span>
              <span className="text-sm font-bold text-yellow-600">{stats.systemMetrics.memoryUsage}</span>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-slate-900">Recent Activity</h3>
            <Clock className="h-5 w-5 text-slate-400" />
          </div>
          <div className="space-y-3">
            {stats.recentActivity.map((activity, index) => (
              <div key={index} className="flex items-center space-x-3">
                {getStatusIcon(activity.status)}
                <div className="flex-1">
                  <p className="text-sm text-slate-600">{activity.message}</p>
                  <span className="text-xs text-slate-400">{activity.time}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Court Type Distribution */}
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-slate-900">Court Types</h3>
            <Scale className="h-5 w-5 text-slate-400" />
          </div>
          <div className="h-48">
            <Bar
              data={{
                labels: Object.keys(stats.courtTypeDistribution),
                datasets: [{
                  label: 'Cases by Court Type (%)',
                  data: Object.values(stats.courtTypeDistribution),
                  backgroundColor: [
                    '#6366F1',
                    '#8B5CF6',
                    '#EC4899',
                    '#F59E0B'
                  ],
                  borderRadius: 6,
                  borderSkipped: false,
                }]
              }}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    display: false
                  },
                  tooltip: {
                    callbacks: {
                      label: function(context) {
                        return `${context.label}: ${context.parsed.y}%`;
                      }
                    }
                  }
                },
                scales: {
                  y: {
                    beginAtZero: true,
                    max: 100,
                    ticks: {
                      callback: function(value) {
                        return value + '%';
                      }
                    }
                  }
                }
              }}
            />
          </div>
        </div>
      </div>

      {/* Growth Trends Chart */}
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-slate-900">Growth Trends (6 Months)</h3>
          <TrendingUp className="h-5 w-5 text-slate-400" />
        </div>
        <div className="h-64">
          <Line
            data={{
              labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
              datasets: [
                {
                  label: 'Users',
                  data: [120, 135, 148, 162, 175, stats.totalUsers],
                  borderColor: '#8B5CF6',
                  backgroundColor: 'rgba(139, 92, 246, 0.1)',
                  borderWidth: 3,
                  fill: false,
                  tension: 0.4,
                  pointBackgroundColor: '#8B5CF6',
                  pointBorderColor: '#ffffff',
                  pointBorderWidth: 2,
                  pointRadius: 5
                },
                {
                  label: 'Cases',
                  data: [450, 520, 580, 650, 720, stats.totalCases],
                  borderColor: '#10B981',
                  backgroundColor: 'rgba(16, 185, 129, 0.1)',
                  borderWidth: 3,
                  fill: false,
                  tension: 0.4,
                  pointBackgroundColor: '#10B981',
                  pointBorderColor: '#ffffff',
                  pointBorderWidth: 2,
                  pointRadius: 5
                }
              ]
            }}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                legend: {
                  position: 'top',
                  labels: {
                    usePointStyle: true,
                    padding: 20
                  }
                },
                tooltip: {
                  mode: 'index',
                  intersect: false,
                }
              },
              scales: {
                y: {
                  beginAtZero: true,
                  grid: {
                    color: 'rgba(0, 0, 0, 0.05)'
                  }
                },
                x: {
                  grid: {
                    display: false
                  }
                }
              },
              interaction: {
                mode: 'nearest',
                axis: 'x',
                intersect: false
              }
            }}
          />
        </div>
      </div>

      {/* Additional Analytics Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Revenue Trend */}
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-slate-900">Revenue Trend (6 Months)</h3>
            <LineChart className="h-5 w-5 text-slate-400" />
          </div>
          <div className="h-64">
            <Line
              data={{
                labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
                datasets: [{
                  label: 'Revenue (GHS)',
                  data: [
                    stats.monthlyRevenue * 0.8,
                    stats.monthlyRevenue * 0.9,
                    stats.monthlyRevenue * 1.1,
                    stats.monthlyRevenue * 0.95,
                    stats.monthlyRevenue * 1.05,
                    stats.monthlyRevenue
                  ],
                  borderColor: '#3B82F6',
                  backgroundColor: 'rgba(59, 130, 246, 0.1)',
                  borderWidth: 3,
                  fill: true,
                  tension: 0.4,
                  pointBackgroundColor: '#3B82F6',
                  pointBorderColor: '#ffffff',
                  pointBorderWidth: 2,
                  pointRadius: 6,
                  pointHoverRadius: 8
                }]
              }}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    display: false
                  },
                  tooltip: {
                    callbacks: {
                      label: function(context) {
                        return `Revenue: GHS ${context.parsed.y.toLocaleString()}`;
                      }
                    }
                  }
                },
                scales: {
                  y: {
                    beginAtZero: true,
                    ticks: {
                      callback: function(value) {
                        return 'GHS ' + value.toLocaleString();
                      }
                    },
                    grid: {
                      color: 'rgba(0, 0, 0, 0.05)'
                    }
                  },
                  x: {
                    grid: {
                      display: false
                    }
                  }
                }
              }}
            />
          </div>
          <div className="mt-4 text-center">
            <div className="flex items-center justify-center">
              <ArrowUp className="h-4 w-4 text-green-600" />
              <span className="text-sm text-green-600 font-medium ml-1">+{stats.monthlyGrowth}%</span>
              <span className="text-sm text-slate-500 ml-1">vs last month</span>
            </div>
          </div>
        </div>

        {/* Employee Analytics */}
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-slate-900">Employee Analytics</h3>
            <Users className="h-5 w-5 text-slate-400" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-600 font-medium">Employment Status</p>
              <div className="mt-2 space-y-1">
                {stats.employeeAnalytics?.status_breakdown ? Object.entries(stats.employeeAnalytics.status_breakdown).map(([status, count]) => (
                  <div key={status} className="flex justify-between text-sm">
                    <span className="capitalize">{status}</span>
                    <span className="font-semibold">{count}</span>
                  </div>
                )) : <p className="text-sm text-gray-500">No data</p>}
              </div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <p className="text-sm text-green-600 font-medium">Employee Types</p>
              <div className="mt-2 space-y-1">
                {stats.employeeAnalytics?.type_breakdown ? Object.entries(stats.employeeAnalytics.type_breakdown).map(([type, count]) => (
                  <div key={type} className="flex justify-between text-sm">
                    <span className="capitalize">{type.replace('_', ' ')}</span>
                    <span className="font-semibold">{count}</span>
                  </div>
                )) : <p className="text-sm text-gray-500">No data</p>}
              </div>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <p className="text-sm text-purple-600 font-medium">Employer Types</p>
              <div className="mt-2 space-y-1">
                {stats.employeeAnalytics?.employer_type_breakdown ? Object.entries(stats.employeeAnalytics.employer_type_breakdown).map(([type, count]) => (
                  <div key={type} className="flex justify-between text-sm">
                    <span className="capitalize">{type}</span>
                    <span className="font-semibold">{count}</span>
                  </div>
                )) : <p className="text-sm text-gray-500">No data</p>}
              </div>
            </div>
            <div className="text-center p-4 bg-orange-50 rounded-lg">
              <p className="text-sm text-orange-600 font-medium">Top Employers</p>
              <div className="mt-2 space-y-1">
                {stats.employeeAnalytics?.top_employers?.slice(0, 3).map((employer, index) => (
                  <div key={index} className="flex justify-between text-sm">
                    <span className="truncate">{employer.name}</span>
                    <span className="font-semibold">{employer.count}</span>
                  </div>
                )) || <p className="text-sm text-gray-500">No data</p>}
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-slate-900">Quick Actions</h3>
            <Zap className="h-5 w-5 text-slate-400" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <button className="p-3 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors text-sm font-medium">
              <Eye className="h-4 w-4 mx-auto mb-1" />
              <span style={{ fontFamily: 'Satoshi' }}>View Reports</span>
            </button>
            <button className="p-3 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors text-sm font-medium">
              <Target className="h-4 w-4 mx-auto mb-1" />
              <span style={{ fontFamily: 'Satoshi' }}>Generate Analytics</span>
            </button>
            <button className="p-3 bg-purple-50 text-purple-600 rounded-lg hover:bg-purple-100 transition-colors text-sm font-medium">
              <Globe className="h-4 w-4 mx-auto mb-1" />
              <span style={{ fontFamily: 'Satoshi' }}>Export Data</span>
            </button>
            <button 
              onClick={onRefresh}
              disabled={isRefreshing}
              className="p-3 bg-orange-50 text-orange-600 rounded-lg hover:bg-orange-100 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <RefreshCw className={`h-4 w-4 mx-auto mb-1 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span style={{ fontFamily: 'Satoshi' }}>{isRefreshing ? 'Refreshing...' : 'Refresh All'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const UsersTab = () => (
  <div className="bg-white rounded-lg shadow">
    <div className="p-6 border-b border-slate-200">
      <h3 className="text-lg font-semibold text-slate-900">User Management</h3>
      <p className="text-sm text-slate-600">Manage users, roles, and permissions</p>
    </div>
    <div className="p-6">
      <p className="text-slate-500">User management interface will be implemented here.</p>
    </div>
  </div>
);

const ApiKeysTab = () => (
  <div className="bg-white rounded-lg shadow">
    <div className="p-6 border-b border-slate-200">
      <h3 className="text-lg font-semibold text-slate-900">API Key Management</h3>
      <p className="text-sm text-slate-600">Generate and manage API keys for users</p>
    </div>
    <div className="p-6">
      <p className="text-slate-500">API key management interface will be implemented here.</p>
    </div>
  </div>
);

const CasesTab = () => (
  <div className="bg-white rounded-lg shadow">
    <div className="p-6 border-b border-slate-200">
      <h3 className="text-lg font-semibold text-slate-900">Case Management</h3>
      <p className="text-sm text-slate-600">Manage cases, metadata, analytics and statistics</p>
    </div>
    <div className="p-6">
      <p className="text-slate-500">Case management interface will be implemented here.</p>
    </div>
  </div>
);

const PeopleTab = () => (
  <div className="bg-white rounded-lg shadow">
    <div className="p-6 border-b border-slate-200">
      <h3 className="text-lg font-semibold text-slate-900">People Management</h3>
      <p className="text-sm text-slate-600">Manage people records and analytics</p>
    </div>
    <div className="p-6">
      <p className="text-slate-500">People management interface will be implemented here.</p>
    </div>
  </div>
);

const BanksTab = () => (
  <div className="bg-white rounded-lg shadow">
    <div className="p-6 border-b border-slate-200">
      <h3 className="text-lg font-semibold text-slate-900">Bank Management</h3>
      <p className="text-sm text-slate-600">Manage bank records and analytics</p>
    </div>
    <div className="p-6">
      <p className="text-slate-500">Bank management interface will be implemented here.</p>
    </div>
  </div>
);

const InsuranceTab = () => (
  <div className="bg-white rounded-lg shadow">
    <div className="p-6 border-b border-slate-200">
      <h3 className="text-lg font-semibold text-slate-900">Insurance Management</h3>
      <p className="text-sm text-slate-600">Manage insurance records and analytics</p>
    </div>
    <div className="p-6">
      <p className="text-slate-500">Insurance management interface will be implemented here.</p>
    </div>
  </div>
);

const CompaniesTab = () => (
  <div className="bg-white rounded-lg shadow">
    <div className="p-6 border-b border-slate-200">
      <h3 className="text-lg font-semibold text-slate-900">Company Management</h3>
      <p className="text-sm text-slate-600">Manage company records and analytics</p>
    </div>
    <div className="p-6">
      <p className="text-slate-500">Company management interface will be implemented here.</p>
    </div>
  </div>
);

const PaymentsTab = () => (
  <div className="bg-white rounded-lg shadow">
    <div className="p-6 border-b border-slate-200">
      <h3 className="text-lg font-semibold text-slate-900">Payment Management</h3>
      <p className="text-sm text-slate-600">Manage payments and subscriptions</p>
    </div>
    <div className="p-6">
      <p className="text-slate-500">Payment management interface will be implemented here.</p>
    </div>
  </div>
);

const SettingsTab = () => (
  <div className="bg-white rounded-lg shadow">
    <div className="p-6 border-b border-slate-200">
      <h3 className="text-lg font-semibold text-slate-900">System Settings</h3>
      <p className="text-sm text-slate-600">Configure system settings and preferences</p>
    </div>
    <div className="p-6">
      <p className="text-slate-500">System settings interface will be implemented here.</p>
    </div>
  </div>
);

export default AdminDashboard;
