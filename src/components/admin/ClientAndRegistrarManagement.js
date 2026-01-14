import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Search, 
  Filter, 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  Key, 
  Mail, 
  Phone, 
  Calendar,
  Shield,
  UserCheck,
  UserX,
  MoreVertical,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  X,
  Building2,
  Scale,
  CheckCircle,
  XCircle,
  AlertCircle,
  Download,
  Upload
} from 'lucide-react';
import { apiGet, apiPost, apiPut, apiDelete } from '../../utils/api';
import AdminHeader from './AdminHeader';
import { useToast, ToastContainer } from '../Toast';

const ClientAndRegistrarManagement = ({ userInfo, onNavigate, onLogout }) => {
  const { toasts, success, error: showError, warning, info, removeToast } = useToast();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [userTypeFilter, setUserTypeFilter] = useState('all'); // 'all', 'corporate_client', 'court_registrar'
  const [statusFilter, setStatusFilter] = useState('all'); // 'all', 'active', 'inactive', 'pending', 'suspended'
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showUserModal, setShowUserModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showPasswordResetModal, setShowPasswordResetModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [passwordResetData, setPasswordResetData] = useState({
    new_password: '',
    confirm_password: '',
    admin_password: ''
  });

  // Statistics
  const [stats, setStats] = useState({
    totalCorporateClients: 0,
    totalRegistrars: 0,
    activeCorporateClients: 0,
    activeRegistrars: 0,
    inactiveCorporateClients: 0,
    inactiveRegistrars: 0,
    pendingCorporateClients: 0,
    pendingRegistrars: 0
  });

  // Form states
  const [formData, setFormData] = useState({
    email: '',
    first_name: '',
    last_name: '',
    phone_number: '',
    organization: '',
    job_title: '',
    user_type: 'corporate_client',
    status: 'active',
    entity_type: '',
    entity_id: null,
    court_type: '',
    password: '',
    confirm_password: ''
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    loadUsers();
    loadStats();
  }, [currentPage, searchTerm, userTypeFilter, statusFilter]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const params = {
        page: currentPage,
        limit: 10
      };

      if (searchTerm) params.search = searchTerm;
      if (userTypeFilter !== 'all') params.user_type = userTypeFilter;
      if (statusFilter !== 'all') params.status = statusFilter;

      const data = await apiGet('/admin/users/clients-and-registrars', params);
      
      if (data) {
        setUsers(data.users || []);
        setTotalPages(data.total_pages || 1);
        setTotalUsers(data.total || 0);
      }
    } catch (error) {
      console.error('Error loading users:', error);
      // Use mock data for development
      setUsers(getMockUsers());
      setTotalPages(3);
      setTotalUsers(25);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const data = await apiGet('/admin/users/clients-and-registrars/stats');
      if (data) {
        setStats(data);
      }
    } catch (error) {
      console.error('Error loading stats:', error);
      // Use mock stats for development
      setStats({
        totalCorporateClients: 15,
        totalRegistrars: 10,
        activeCorporateClients: 12,
        activeRegistrars: 8,
        inactiveCorporateClients: 2,
        inactiveRegistrars: 1,
        pendingCorporateClients: 1,
        pendingRegistrars: 1
      });
    }
  };

  // Mock data for development
  const getMockUsers = () => {
    const mockUsers = [
      {
        id: 1,
        email: 'tonia.martins@accessbank.com',
        first_name: 'Tonia',
        last_name: 'Martins',
        phone_number: '+233 24 123 4567',
        organization: 'Access Bank',
        job_title: 'Compliance Officer',
        user_type: 'corporate_client',
        entity_type: 'bank',
        entity_id: 1,
        status: 'active',
        created_at: '2024-01-15T10:00:00Z',
        last_login: '2024-11-20T14:30:00Z'
      },
      {
        id: 2,
        email: 'ben.frimpong@highcourt.gov.gh',
        first_name: 'Ben',
        last_name: 'Frimpong',
        phone_number: '+233 24 234 5678',
        organization: 'High Court, Accra',
        job_title: 'Court Registrar',
        user_type: 'court_registrar',
        court_type: 'high_court',
        status: 'active',
        created_at: '2024-02-10T09:00:00Z',
        last_login: '2024-11-20T16:45:00Z'
      },
      {
        id: 3,
        email: 'john.doe@ecobank.com',
        first_name: 'John',
        last_name: 'Doe',
        phone_number: '+233 24 345 6789',
        organization: 'Ecobank Ghana',
        job_title: 'Risk Manager',
        user_type: 'corporate_client',
        entity_type: 'bank',
        entity_id: 2,
        status: 'active',
        created_at: '2024-03-20T11:00:00Z',
        last_login: '2024-11-19T10:20:00Z'
      },
      {
        id: 4,
        email: 'mary.osei@supremecourt.gov.gh',
        first_name: 'Mary',
        last_name: 'Osei',
        phone_number: '+233 24 456 7890',
        organization: 'Supreme Court',
        job_title: 'Senior Registrar',
        user_type: 'court_registrar',
        court_type: 'supreme_court',
        status: 'active',
        created_at: '2024-04-05T08:00:00Z',
        last_login: '2024-11-20T12:15:00Z'
      },
      {
        id: 5,
        email: 'sarah.akoto@calbank.com',
        first_name: 'Sarah',
        last_name: 'Akoto',
        phone_number: '+233 24 567 8901',
        organization: 'CalBank',
        job_title: 'Legal Advisor',
        user_type: 'corporate_client',
        entity_type: 'bank',
        entity_id: 3,
        status: 'pending',
        created_at: '2024-11-15T13:00:00Z',
        last_login: null
      }
    ];

    // Filter based on current filters
    let filtered = mockUsers;
    
    if (userTypeFilter !== 'all') {
      filtered = filtered.filter(u => u.user_type === userTypeFilter);
    }
    
    if (statusFilter !== 'all') {
      filtered = filtered.filter(u => u.status === statusFilter);
    }
    
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(u => 
        u.email.toLowerCase().includes(search) ||
        u.first_name.toLowerCase().includes(search) ||
        u.last_name.toLowerCase().includes(search) ||
        u.organization.toLowerCase().includes(search)
      );
    }

    return filtered;
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handleFilterChange = (filterType, value) => {
    if (filterType === 'user_type') {
      setUserTypeFilter(value);
    } else if (filterType === 'status') {
      setStatusFilter(value);
    }
    setCurrentPage(1);
  };

  const handleViewUser = (user) => {
    setSelectedUser(user);
    setShowUserModal(true);
  };

  const handleCreateUser = () => {
    setEditingUser(null);
    setFormData({
      email: '',
      first_name: '',
      last_name: '',
      phone_number: '',
      organization: '',
      job_title: '',
      user_type: 'corporate_client',
      status: 'active',
      entity_type: '',
      entity_id: null,
      court_type: '',
      password: '',
      confirm_password: ''
    });
    setErrors({});
    setShowCreateModal(true);
  };

  const handleEditUser = (user) => {
    setEditingUser(user);
    setFormData({
      email: user.email,
      first_name: user.first_name,
      last_name: user.last_name,
      phone_number: user.phone_number || '',
      organization: user.organization || '',
      job_title: user.job_title || '',
      user_type: user.user_type,
      status: user.status,
      entity_type: user.entity_type || '',
      entity_id: user.entity_id || null,
      court_type: user.court_type || '',
      password: '',
      confirm_password: ''
    });
    setErrors({});
    setShowEditModal(true);
  };

  const handleDeleteUser = (user) => {
    setSelectedUser(user);
    setShowDeleteModal(true);
  };

  const handlePasswordReset = (user) => {
    setSelectedUser(user);
    setPasswordResetData({
      new_password: '',
      confirm_password: '',
      admin_password: ''
    });
    setShowPasswordResetModal(true);
  };

  const handleToggleStatus = async (user) => {
    try {
      const newStatus = user.status === 'active' ? 'inactive' : 'active';
      await apiPut(`/admin/users/${user.id}`, { status: newStatus });
      success(`User status updated to ${newStatus}`);
      loadUsers();
      loadStats();
    } catch (err) {
      console.error('Error updating user status:', err);
      const errorMessage = err.message || err.detail || 'Failed to update user status';
      showError(errorMessage);
    }
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.email) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email is invalid';
    
    if (!formData.first_name) newErrors.first_name = 'First name is required';
    if (!formData.last_name) newErrors.last_name = 'Last name is required';
    
    // Password validation for create mode
    if (!editingUser) {
      if (!formData.password) newErrors.password = 'Password is required';
      else if (formData.password.length < 8) newErrors.password = 'Password must be at least 8 characters long';
      else if (formData.password !== formData.confirm_password) newErrors.confirm_password = 'Passwords do not match';
    }
    
    if (formData.user_type === 'court_registrar' && !formData.court_type) {
      newErrors.court_type = 'Court type is required for registrars';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      showError('Please fix the validation errors');
      return;
    }

    try {
      setIsSaving(true);
      
      // Prepare data - for create, include password; for update, exclude it
      const submitData = { ...formData };
      if (editingUser) {
        delete submitData.password;
        delete submitData.confirm_password;
      }
      
      const data = editingUser
        ? await apiPut(`/admin/users/${editingUser.id}`, submitData)
        : await apiPost('/admin/users', submitData);

      if (data) {
        success(editingUser ? 'User updated successfully' : 'User created successfully');
        setShowEditModal(false);
        setShowCreateModal(false);
        setEditingUser(null);
        setFormData({
          email: '',
          first_name: '',
          last_name: '',
          phone_number: '',
          organization: '',
          job_title: '',
          user_type: 'corporate_client',
          status: 'active',
          entity_type: '',
          entity_id: null,
          court_type: '',
          password: '',
          confirm_password: ''
        });
        setErrors({});
        loadUsers();
        loadStats();
      }
    } catch (err) {
      console.error('Error saving user:', err);
      const errorMessage = err.message || err.detail || 'Failed to save user';
      showError(errorMessage);
      if (err.data?.detail) {
        if (typeof err.data.detail === 'object') {
          setErrors(err.data.detail);
        } else {
          setErrors({ general: err.data.detail });
        }
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    try {
      setIsSaving(true);
      await apiDelete(`/admin/users/${selectedUser.id}`);
      success(`User ${selectedUser.first_name} ${selectedUser.last_name} deleted successfully`);
      setShowDeleteModal(false);
      setSelectedUser(null);
      loadUsers();
      loadStats();
    } catch (err) {
      console.error('Error deleting user:', err);
      const errorMessage = err.message || err.detail || 'Failed to delete user';
      showError(errorMessage);
    } finally {
      setIsSaving(false);
    }
  };

  const handlePasswordResetSubmit = async () => {
    try {
      if (!passwordResetData.admin_password) {
        setErrors({ admin_password: 'Admin password is required' });
        showError('Admin password is required');
        return;
      }

      if (passwordResetData.new_password !== passwordResetData.confirm_password) {
        setErrors({ password: 'New passwords do not match' });
        showError('New passwords do not match');
        return;
      }

      if (passwordResetData.new_password.length < 8) {
        setErrors({ password: 'New password must be at least 8 characters long' });
        showError('New password must be at least 8 characters long');
        return;
      }

      setIsSaving(true);
      await apiPost(`/admin/users/${selectedUser.id}/reset-password`, {
        new_password: passwordResetData.new_password,
        admin_password: passwordResetData.admin_password
      });

      success(`Password reset successfully for ${selectedUser.first_name} ${selectedUser.last_name}`);
      setShowPasswordResetModal(false);
      setSelectedUser(null);
      setPasswordResetData({
        new_password: '',
        confirm_password: '',
        admin_password: ''
      });
      setErrors({});
    } catch (err) {
      console.error('Error resetting password:', err);
      const errorMessage = err.message || err.detail || 'Failed to reset password';
      showError(errorMessage);
      if (err.data?.detail) {
        if (typeof err.data.detail === 'object') {
          setErrors(err.data.detail);
        } else {
          setErrors({ general: err.data.detail });
        }
      }
    } finally {
      setIsSaving(false);
    }
  };

  const getStatusBadgeColor = (status) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-gray-100 text-gray-800';
      case 'suspended': return 'bg-red-100 text-red-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getUserTypeIcon = (userType) => {
    return userType === 'corporate_client' ? Building2 : Scale;
  };

  const getUserTypeLabel = (userType) => {
    return userType === 'corporate_client' ? 'Corporate Client' : 'Court Registrar';
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="bg-[#F7F8FA] min-h-screen w-full">
      {/* Header */}
      <AdminHeader userInfo={userInfo} onNavigate={onNavigate} onLogout={onLogout} />

      {/* Main Content */}
      <div className="px-6 w-full">
        <div className="flex flex-col items-start w-full bg-white py-4 gap-6 rounded-lg">
          {/* Breadcrumb */}
          <span className="text-[#525866] text-xs whitespace-nowrap px-6" style={{ fontFamily: 'Satoshi' }}>USER MANAGEMENT</span>

          {/* Title */}
          <div className="flex flex-col items-start px-6 gap-2">
            <div className="flex items-center gap-1">
              <Users className="w-4 h-4 text-[#022658]" />
              <span className="text-[#040E1B] text-xl font-bold whitespace-nowrap" style={{ fontFamily: 'Poppins' }}>Clients & Registrars</span>
            </div>
            <span className="text-[#070810] text-sm whitespace-nowrap" style={{ fontFamily: 'Satoshi' }}>Manage corporate clients and court registrars</span>
          </div>

          {/* Statistics Cards */}
          <div className="flex items-start self-stretch px-6 gap-3">
            <div className="flex items-center bg-white flex-1 p-2 gap-3 rounded-lg border border-solid border-[#D4E1EA]">
              <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                <Building2 className="w-5 h-5 text-blue-600" />
              </div>
              <div className="flex flex-col items-start gap-1">
                <span className="text-[#868C98] text-xs whitespace-nowrap" style={{ fontFamily: 'Satoshi' }}>Total Corporate Clients</span>
                <span className="text-[#F59E0B] text-base whitespace-nowrap font-bold" style={{ fontFamily: 'Satoshi' }}>{stats.totalCorporateClients}</span>
              </div>
            </div>
            <div className="flex items-center bg-white flex-1 p-2 gap-3 rounded-lg border border-solid border-[#D4E1EA]">
              <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                <Scale className="w-5 h-5 text-green-600" />
              </div>
              <div className="flex flex-col items-start gap-1">
                <span className="text-[#868C98] text-xs whitespace-nowrap" style={{ fontFamily: 'Satoshi' }}>Total Registrars</span>
                <span className="text-[#F59E0B] text-base whitespace-nowrap font-bold" style={{ fontFamily: 'Satoshi' }}>{stats.totalRegistrars}</span>
              </div>
            </div>
            <div className="flex items-center bg-white flex-1 p-2 gap-3 rounded-lg border border-solid border-[#D4E1EA]">
              <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-emerald-600" />
              </div>
              <div className="flex flex-col items-start gap-1">
                <span className="text-[#868C98] text-xs whitespace-nowrap" style={{ fontFamily: 'Satoshi' }}>Active Users</span>
                <span className="text-[#F59E0B] text-base whitespace-nowrap font-bold" style={{ fontFamily: 'Satoshi' }}>
                  {stats.activeCorporateClients + stats.activeRegistrars}
                </span>
              </div>
            </div>
            <div className="flex items-center bg-white flex-1 p-2 gap-3 rounded-lg border border-solid border-[#D4E1EA]">
              <div className="w-10 h-10 rounded-lg bg-yellow-100 flex items-center justify-center">
                <AlertCircle className="w-5 h-5 text-yellow-600" />
              </div>
              <div className="flex flex-col items-start gap-1">
                <span className="text-[#868C98] text-xs whitespace-nowrap" style={{ fontFamily: 'Satoshi' }}>Pending Users</span>
                <span className="text-[#F59E0B] text-base whitespace-nowrap font-bold" style={{ fontFamily: 'Satoshi' }}>
                  {stats.pendingCorporateClients + stats.pendingRegistrars}
                </span>
              </div>
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="flex flex-col items-start w-full px-6">
            <div className="flex items-start p-1 gap-4">
              <button
                onClick={() => handleFilterChange('user_type', 'all')}
                className={`flex flex-col items-start pb-2 ${
                  userTypeFilter === 'all' ? 'border-b-2 border-[#022658]' : ''
                }`}
              >
                <span
                  className={`text-base whitespace-nowrap ${
                    userTypeFilter === 'all' ? 'text-[#022658] font-bold' : 'text-[#525866]'
                  }`}
                  style={{ fontFamily: 'Satoshi' }}
                >
                  All
                </span>
              </button>
              <button
                onClick={() => handleFilterChange('user_type', 'corporate_client')}
                className={`flex flex-col items-start pb-2 ${
                  userTypeFilter === 'corporate_client' ? 'border-b-2 border-[#022658]' : ''
                }`}
              >
                <span
                  className={`text-base whitespace-nowrap ${
                    userTypeFilter === 'corporate_client' ? 'text-[#022658] font-bold' : 'text-[#525866]'
                  }`}
                  style={{ fontFamily: 'Satoshi' }}
                >
                  Corporate Clients
                </span>
              </button>
              <button
                onClick={() => handleFilterChange('user_type', 'court_registrar')}
                className={`flex flex-col items-start pb-2 ${
                  userTypeFilter === 'court_registrar' ? 'border-b-2 border-[#022658]' : ''
                }`}
              >
                <span
                  className={`text-base whitespace-nowrap ${
                    userTypeFilter === 'court_registrar' ? 'text-[#022658] font-bold' : 'text-[#525866]'
                  }`}
                  style={{ fontFamily: 'Satoshi' }}
                >
                  Court Registrars
                </span>
              </button>
            </div>

            {/* Search, Filter and Export */}
            <div className="flex justify-between items-start w-full px-4 pt-4">
              <div className="flex-1 pb-0.5 mr-4">
                <div className="flex items-center self-stretch bg-[#F7F8FA] py-[7px] px-2 gap-1.5 rounded-[5px] border border-solid border-[#F7F8FA]">
                  <Search className="w-[11px] h-[11px] text-[#525866]" />
                  <input
                    type="text"
                    placeholder="Search by name, email, or organization..."
                    value={searchTerm}
                    onChange={handleSearch}
                    className="flex-1 text-[#525866] bg-transparent text-xs border-0 outline-none"
                    style={{ fontFamily: 'Satoshi' }}
                  />
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="relative">
                  <select
                    value={statusFilter}
                    onChange={(e) => handleFilterChange('status', e.target.value)}
                    className="px-3 py-2 bg-white border border-[#D4E1EA] rounded-lg text-xs text-[#525866] focus:ring-2 focus:ring-[#022658] focus:border-[#022658]"
                    style={{ fontFamily: 'Satoshi' }}
                  >
                    <option value="all">All Status</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="pending">Pending</option>
                    <option value="suspended">Suspended</option>
                  </select>
                </div>
                <button 
                  onClick={handleCreateUser}
                  className="flex items-center px-3 py-2 gap-2 rounded-lg bg-[#022658] text-white hover:bg-[#1A4983] transition-colors"
                  style={{ fontFamily: 'Satoshi' }}
                >
                  <Plus className="w-4 h-4" />
                  <span className="text-xs font-medium">Add User</span>
                </button>
                <button className="flex items-center px-3 py-2 gap-2 rounded-lg border border-solid border-[#F59E0B] hover:bg-orange-50 transition-colors">
                  <Download className="w-4 h-4 text-[#F59E0B]" />
                  <span className="text-[#F59E0B] text-xs font-medium" style={{ fontFamily: 'Satoshi' }}>Export</span>
                </button>
              </div>
            </div>

            {/* Users Table */}
            <div className="flex flex-col w-full bg-white py-4 gap-4 rounded-3xl">
              {loading ? (
                <div className="p-8 text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#022658] mx-auto"></div>
                  <p className="mt-2 text-[#525866] text-sm" style={{ fontFamily: 'Satoshi' }}>Loading users...</p>
                </div>
              ) : (
                <>
                  <div className="overflow-x-auto w-full">
                    <table className="min-w-full divide-y divide-[#D4E1EA] w-full">
                      <thead className="bg-[#F7F8FA]">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-bold text-[#070810] uppercase tracking-wider" style={{ fontFamily: 'Satoshi' }}>
                            User
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-bold text-[#070810] uppercase tracking-wider" style={{ fontFamily: 'Satoshi' }}>
                            Type
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-bold text-[#070810] uppercase tracking-wider" style={{ fontFamily: 'Satoshi' }}>
                            Organization
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-bold text-[#070810] uppercase tracking-wider" style={{ fontFamily: 'Satoshi' }}>
                            Status
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-bold text-[#070810] uppercase tracking-wider" style={{ fontFamily: 'Satoshi' }}>
                            Created
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-bold text-[#070810] uppercase tracking-wider" style={{ fontFamily: 'Satoshi' }}>
                            Last Login
                          </th>
                          <th className="px-4 py-3 text-right text-xs font-bold text-[#070810] uppercase tracking-wider" style={{ fontFamily: 'Satoshi' }}>
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-[#D4E1EA]">
                        {users.length === 0 ? (
                          <tr>
                            <td colSpan="7" className="px-4 py-8 text-center text-[#525866] text-sm" style={{ fontFamily: 'Satoshi' }}>
                              No users found
                            </td>
                          </tr>
                        ) : (
                          users.map((user) => {
                            const UserTypeIcon = getUserTypeIcon(user.user_type);
                            return (
                              <tr key={user.id} className="hover:bg-[#F7F8FA]">
                                <td className="px-4 py-4 whitespace-nowrap">
                                  <div className="flex items-center">
                                    <div className="h-10 w-10 rounded-full bg-[#022658] flex items-center justify-center">
                                      <span className="text-sm font-medium text-white">
                                        {user.first_name?.charAt(0)}{user.last_name?.charAt(0)}
                                      </span>
                                    </div>
                                    <div className="ml-4">
                                      <div className="text-sm font-medium text-[#040E1B]" style={{ fontFamily: 'Satoshi' }}>
                                        {user.first_name} {user.last_name}
                                      </div>
                                      <div className="text-sm text-[#525866]" style={{ fontFamily: 'Satoshi' }}>{user.email}</div>
                                    </div>
                                  </div>
                                </td>
                                <td className="px-4 py-4 whitespace-nowrap">
                                  <div className="flex items-center gap-2">
                                    <UserTypeIcon className="h-4 w-4 text-[#022658]" />
                                    <span className="text-sm text-[#040E1B]" style={{ fontFamily: 'Satoshi' }}>
                                      {getUserTypeLabel(user.user_type)}
                                    </span>
                                  </div>
                                </td>
                                <td className="px-4 py-4 whitespace-nowrap">
                                  <div className="text-sm text-[#040E1B]" style={{ fontFamily: 'Satoshi' }}>
                                    {user.organization || '-'}
                                  </div>
                                  {user.job_title && (
                                    <div className="text-xs text-[#525866]" style={{ fontFamily: 'Satoshi' }}>
                                      {user.job_title}
                                    </div>
                                  )}
                                </td>
                                <td className="px-4 py-4 whitespace-nowrap">
                                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadgeColor(user.status)}`} style={{ fontFamily: 'Satoshi' }}>
                                    {user.status}
                                  </span>
                                </td>
                                <td className="px-4 py-4 whitespace-nowrap text-sm text-[#525866]" style={{ fontFamily: 'Satoshi' }}>
                                  {formatDate(user.created_at)}
                                </td>
                                <td className="px-4 py-4 whitespace-nowrap text-sm text-[#525866]" style={{ fontFamily: 'Satoshi' }}>
                                  {formatDate(user.last_login)}
                                </td>
                                <td className="px-4 py-4 whitespace-nowrap text-right text-sm font-medium">
                                  <div className="flex items-center justify-end space-x-2">
                                    <button
                                      onClick={() => handleViewUser(user)}
                                      className="text-[#022658] hover:text-[#1A4983] p-1"
                                      title="View Details"
                                    >
                                      <Eye className="h-4 w-4" />
                                    </button>
                                    <button
                                      onClick={() => handleEditUser(user)}
                                      className="text-[#022658] hover:text-[#1A4983] p-1"
                                      title="Edit User"
                                    >
                                      <Edit className="h-4 w-4" />
                                    </button>
                                    <button
                                      onClick={() => handleToggleStatus(user)}
                                      className={`p-1 ${user.status === 'active' ? 'text-orange-600 hover:text-orange-800' : 'text-green-600 hover:text-green-800'}`}
                                      title={user.status === 'active' ? 'Deactivate' : 'Activate'}
                                    >
                                      {user.status === 'active' ? <XCircle className="h-4 w-4" /> : <CheckCircle className="h-4 w-4" />}
                                    </button>
                                    <button
                                      onClick={() => handlePasswordReset(user)}
                                      className="text-[#F59E0B] hover:text-[#D97706] p-1"
                                      title="Reset Password"
                                    >
                                      <Key className="h-4 w-4" />
                                    </button>
                                    <button
                                      onClick={() => handleDeleteUser(user)}
                                      className="text-red-600 hover:text-red-800 p-1"
                                      title="Delete User"
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            );
                          })
                        )}
                      </tbody>
                    </table>
                  </div>

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-[#D4E1EA]">
                      <div className="flex-1 flex justify-between sm:hidden">
                        <button
                          onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                          disabled={currentPage === 1}
                          className="relative inline-flex items-center px-4 py-2 border border-[#D4E1EA] text-sm font-medium rounded-lg text-[#525866] bg-white hover:bg-[#F7F8FA] disabled:opacity-50 disabled:cursor-not-allowed"
                          style={{ fontFamily: 'Satoshi' }}
                        >
                          Previous
                        </button>
                        <button
                          onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                          disabled={currentPage === totalPages}
                          className="ml-3 relative inline-flex items-center px-4 py-2 border border-[#D4E1EA] text-sm font-medium rounded-lg text-[#525866] bg-white hover:bg-[#F7F8FA] disabled:opacity-50 disabled:cursor-not-allowed"
                          style={{ fontFamily: 'Satoshi' }}
                        >
                          Next
                        </button>
                      </div>
                      <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                        <div>
                          <p className="text-sm text-[#525866]" style={{ fontFamily: 'Satoshi' }}>
                            Showing page <span className="font-medium">{currentPage}</span> of{' '}
                            <span className="font-medium">{totalPages}</span>
                          </p>
                        </div>
                        <div>
                          <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                            <button
                              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                              disabled={currentPage === 1}
                              className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-[#D4E1EA] bg-white text-sm font-medium text-[#525866] hover:bg-[#F7F8FA] disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              <ChevronLeft className="h-5 w-5" />
                            </button>
                            {[...Array(totalPages)].map((_, i) => {
                              const page = i + 1;
                              if (page === 1 || page === totalPages || (page >= currentPage - 1 && page <= currentPage + 1)) {
                                return (
                                  <button
                                    key={page}
                                    onClick={() => setCurrentPage(page)}
                                    className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                                      currentPage === page
                                        ? 'z-10 bg-[#022658] border-[#022658] text-white'
                                        : 'bg-white border-[#D4E1EA] text-[#525866] hover:bg-[#F7F8FA]'
                                    }`}
                                    style={{ fontFamily: 'Satoshi' }}
                                  >
                                    {page}
                                  </button>
                                );
                              } else if (page === currentPage - 2 || page === currentPage + 2) {
                                return <span key={page} className="relative inline-flex items-center px-4 py-2 border border-[#D4E1EA] bg-white text-sm font-medium text-[#525866]">...</span>;
                              }
                              return null;
                            })}
                            <button
                              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                              disabled={currentPage === totalPages}
                              className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-[#D4E1EA] bg-white text-sm font-medium text-[#525866] hover:bg-[#F7F8FA] disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              <ChevronRight className="h-5 w-5" />
                            </button>
                          </nav>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* View User Modal */}
      {showUserModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-[#040E1B]" style={{ fontFamily: 'Poppins' }}>User Details</h3>
                <button
                  onClick={() => setShowUserModal(false)}
                  className="text-[#525866] hover:text-[#040E1B]"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-[#525866]" style={{ fontFamily: 'Satoshi' }}>Name</label>
                    <p className="text-sm text-[#040E1B] mt-1" style={{ fontFamily: 'Satoshi' }}>
                      {selectedUser.first_name} {selectedUser.last_name}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-[#525866]" style={{ fontFamily: 'Satoshi' }}>Email</label>
                    <p className="text-sm text-[#040E1B] mt-1" style={{ fontFamily: 'Satoshi' }}>{selectedUser.email}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-[#525866]" style={{ fontFamily: 'Satoshi' }}>Phone</label>
                    <p className="text-sm text-[#040E1B] mt-1" style={{ fontFamily: 'Satoshi' }}>{selectedUser.phone_number || '-'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-[#525866]" style={{ fontFamily: 'Satoshi' }}>User Type</label>
                    <p className="text-sm text-[#040E1B] mt-1" style={{ fontFamily: 'Satoshi' }}>
                      {getUserTypeLabel(selectedUser.user_type)}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-[#525866]" style={{ fontFamily: 'Satoshi' }}>Organization</label>
                    <p className="text-sm text-[#040E1B] mt-1" style={{ fontFamily: 'Satoshi' }}>{selectedUser.organization || '-'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-[#525866]" style={{ fontFamily: 'Satoshi' }}>Status</label>
                    <p className="text-sm text-[#040E1B] mt-1">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadgeColor(selectedUser.status)}`} style={{ fontFamily: 'Satoshi' }}>
                        {selectedUser.status}
                      </span>
                    </p>
                  </div>
                  {selectedUser.user_type === 'court_registrar' && selectedUser.court_type && (
                    <div>
                      <label className="text-sm font-medium text-[#525866]" style={{ fontFamily: 'Satoshi' }}>Court Type</label>
                      <p className="text-sm text-[#040E1B] mt-1" style={{ fontFamily: 'Satoshi' }}>{selectedUser.court_type}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create User Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <form onSubmit={handleSubmit} className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-[#040E1B]" style={{ fontFamily: 'Poppins' }}>Create User</h3>
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateModal(false);
                    setErrors({});
                  }}
                  className="text-[#525866] hover:text-[#040E1B]"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-[#525866] mb-1" style={{ fontFamily: 'Satoshi' }}>First Name *</label>
                    <input
                      type="text"
                      name="first_name"
                      value={formData.first_name}
                      onChange={handleFormChange}
                      className="w-full px-3 py-2 border border-[#D4E1EA] rounded-lg focus:ring-2 focus:ring-[#022658] focus:border-[#022658]"
                      style={{ fontFamily: 'Satoshi' }}
                    />
                    {errors.first_name && <p className="text-xs text-red-600 mt-1">{errors.first_name}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#525866] mb-1" style={{ fontFamily: 'Satoshi' }}>Last Name *</label>
                    <input
                      type="text"
                      name="last_name"
                      value={formData.last_name}
                      onChange={handleFormChange}
                      className="w-full px-3 py-2 border border-[#D4E1EA] rounded-lg focus:ring-2 focus:ring-[#022658] focus:border-[#022658]"
                      style={{ fontFamily: 'Satoshi' }}
                    />
                    {errors.last_name && <p className="text-xs text-red-600 mt-1">{errors.last_name}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#525866] mb-1" style={{ fontFamily: 'Satoshi' }}>Email *</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleFormChange}
                      className="w-full px-3 py-2 border border-[#D4E1EA] rounded-lg focus:ring-2 focus:ring-[#022658] focus:border-[#022658]"
                      style={{ fontFamily: 'Satoshi' }}
                    />
                    {errors.email && <p className="text-xs text-red-600 mt-1">{errors.email}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#525866] mb-1" style={{ fontFamily: 'Satoshi' }}>User Type *</label>
                    <select
                      name="user_type"
                      value={formData.user_type}
                      onChange={handleFormChange}
                      className="w-full px-3 py-2 border border-[#D4E1EA] rounded-lg focus:ring-2 focus:ring-[#022658] focus:border-[#022658]"
                      style={{ fontFamily: 'Satoshi' }}
                    >
                      <option value="corporate_client">Corporate Client</option>
                      <option value="court_registrar">Court Registrar</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#525866] mb-1" style={{ fontFamily: 'Satoshi' }}>Password *</label>
                    <input
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={handleFormChange}
                      className="w-full px-3 py-2 border border-[#D4E1EA] rounded-lg focus:ring-2 focus:ring-[#022658] focus:border-[#022658]"
                      style={{ fontFamily: 'Satoshi' }}
                    />
                    {errors.password && <p className="text-xs text-red-600 mt-1">{errors.password}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#525866] mb-1" style={{ fontFamily: 'Satoshi' }}>Confirm Password *</label>
                    <input
                      type="password"
                      name="confirm_password"
                      value={formData.confirm_password}
                      onChange={handleFormChange}
                      className="w-full px-3 py-2 border border-[#D4E1EA] rounded-lg focus:ring-2 focus:ring-[#022658] focus:border-[#022658]"
                      style={{ fontFamily: 'Satoshi' }}
                    />
                    {errors.confirm_password && <p className="text-xs text-red-600 mt-1">{errors.confirm_password}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#525866] mb-1" style={{ fontFamily: 'Satoshi' }}>Phone</label>
                    <input
                      type="text"
                      name="phone_number"
                      value={formData.phone_number}
                      onChange={handleFormChange}
                      className="w-full px-3 py-2 border border-[#D4E1EA] rounded-lg focus:ring-2 focus:ring-[#022658] focus:border-[#022658]"
                      style={{ fontFamily: 'Satoshi' }}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#525866] mb-1" style={{ fontFamily: 'Satoshi' }}>Organization</label>
                    <input
                      type="text"
                      name="organization"
                      value={formData.organization}
                      onChange={handleFormChange}
                      className="w-full px-3 py-2 border border-[#D4E1EA] rounded-lg focus:ring-2 focus:ring-[#022658] focus:border-[#022658]"
                      style={{ fontFamily: 'Satoshi' }}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#525866] mb-1" style={{ fontFamily: 'Satoshi' }}>Job Title</label>
                    <input
                      type="text"
                      name="job_title"
                      value={formData.job_title}
                      onChange={handleFormChange}
                      className="w-full px-3 py-2 border border-[#D4E1EA] rounded-lg focus:ring-2 focus:ring-[#022658] focus:border-[#022658]"
                      style={{ fontFamily: 'Satoshi' }}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#525866] mb-1" style={{ fontFamily: 'Satoshi' }}>Status</label>
                    <select
                      name="status"
                      value={formData.status}
                      onChange={handleFormChange}
                      className="w-full px-3 py-2 border border-[#D4E1EA] rounded-lg focus:ring-2 focus:ring-[#022658] focus:border-[#022658]"
                      style={{ fontFamily: 'Satoshi' }}
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                      <option value="pending">Pending</option>
                      <option value="suspended">Suspended</option>
                    </select>
                  </div>
                  {formData.user_type === 'court_registrar' && (
                    <div>
                      <label className="block text-sm font-medium text-[#525866] mb-1" style={{ fontFamily: 'Satoshi' }}>Court Type *</label>
                      <select
                        name="court_type"
                        value={formData.court_type}
                        onChange={handleFormChange}
                        className="w-full px-3 py-2 border border-[#D4E1EA] rounded-lg focus:ring-2 focus:ring-[#022658] focus:border-[#022658]"
                        style={{ fontFamily: 'Satoshi' }}
                      >
                        <option value="">Select Court Type</option>
                        <option value="high_court">High Court</option>
                        <option value="supreme_court">Supreme Court</option>
                        <option value="court_of_appeal">Court of Appeal</option>
                        <option value="circuit_court">Circuit Court</option>
                        <option value="district_court">District Court</option>
                      </select>
                      {errors.court_type && <p className="text-xs text-red-600 mt-1">{errors.court_type}</p>}
                    </div>
                  )}
                </div>
                <div className="flex justify-end space-x-3 pt-4 border-t">
                  <button
                    type="button"
                    onClick={() => {
                      setShowCreateModal(false);
                      setErrors({});
                    }}
                    className="px-4 py-2 text-[#022658] bg-white border-2 border-[#022658] rounded-lg hover:bg-gray-50 transition-colors"
                    style={{ fontFamily: 'Satoshi' }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="px-4 py-2 bg-[#022658] text-white rounded-lg hover:bg-[#1A4983] transition-colors disabled:opacity-50"
                    style={{ fontFamily: 'Satoshi' }}
                  >
                    {isSaving ? 'Creating...' : 'Create User'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <form onSubmit={handleSubmit} className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-[#040E1B]" style={{ fontFamily: 'Poppins' }}>Edit User</h3>
                <button
                  type="button"
                  onClick={() => {
                    setShowEditModal(false);
                    setEditingUser(null);
                    setErrors({});
                  }}
                  className="text-[#525866] hover:text-[#040E1B]"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-[#525866] mb-1" style={{ fontFamily: 'Satoshi' }}>First Name</label>
                    <input
                      type="text"
                      name="first_name"
                      value={formData.first_name}
                      onChange={handleFormChange}
                      className="w-full px-3 py-2 border border-[#D4E1EA] rounded-lg focus:ring-2 focus:ring-[#022658] focus:border-[#022658]"
                      style={{ fontFamily: 'Satoshi' }}
                    />
                    {errors.first_name && <p className="text-xs text-red-600 mt-1">{errors.first_name}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#525866] mb-1" style={{ fontFamily: 'Satoshi' }}>Last Name</label>
                    <input
                      type="text"
                      name="last_name"
                      value={formData.last_name}
                      onChange={handleFormChange}
                      className="w-full px-3 py-2 border border-[#D4E1EA] rounded-lg focus:ring-2 focus:ring-[#022658] focus:border-[#022658]"
                      style={{ fontFamily: 'Satoshi' }}
                    />
                    {errors.last_name && <p className="text-xs text-red-600 mt-1">{errors.last_name}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#525866] mb-1" style={{ fontFamily: 'Satoshi' }}>Email</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleFormChange}
                      className="w-full px-3 py-2 border border-[#D4E1EA] rounded-lg focus:ring-2 focus:ring-[#022658] focus:border-[#022658]"
                      style={{ fontFamily: 'Satoshi' }}
                    />
                    {errors.email && <p className="text-xs text-red-600 mt-1">{errors.email}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#525866] mb-1" style={{ fontFamily: 'Satoshi' }}>Phone</label>
                    <input
                      type="text"
                      name="phone_number"
                      value={formData.phone_number}
                      onChange={handleFormChange}
                      className="w-full px-3 py-2 border border-[#D4E1EA] rounded-lg focus:ring-2 focus:ring-[#022658] focus:border-[#022658]"
                      style={{ fontFamily: 'Satoshi' }}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#525866] mb-1" style={{ fontFamily: 'Satoshi' }}>Organization</label>
                    <input
                      type="text"
                      name="organization"
                      value={formData.organization}
                      onChange={handleFormChange}
                      className="w-full px-3 py-2 border border-[#D4E1EA] rounded-lg focus:ring-2 focus:ring-[#022658] focus:border-[#022658]"
                      style={{ fontFamily: 'Satoshi' }}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#525866] mb-1" style={{ fontFamily: 'Satoshi' }}>Job Title</label>
                    <input
                      type="text"
                      name="job_title"
                      value={formData.job_title}
                      onChange={handleFormChange}
                      className="w-full px-3 py-2 border border-[#D4E1EA] rounded-lg focus:ring-2 focus:ring-[#022658] focus:border-[#022658]"
                      style={{ fontFamily: 'Satoshi' }}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#525866] mb-1" style={{ fontFamily: 'Satoshi' }}>Status</label>
                    <select
                      name="status"
                      value={formData.status}
                      onChange={handleFormChange}
                      className="w-full px-3 py-2 border border-[#D4E1EA] rounded-lg focus:ring-2 focus:ring-[#022658] focus:border-[#022658]"
                      style={{ fontFamily: 'Satoshi' }}
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                      <option value="pending">Pending</option>
                      <option value="suspended">Suspended</option>
                    </select>
                  </div>
                  {formData.user_type === 'court_registrar' && (
                    <div>
                      <label className="block text-sm font-medium text-[#525866] mb-1" style={{ fontFamily: 'Satoshi' }}>Court Type</label>
                      <select
                        name="court_type"
                        value={formData.court_type}
                        onChange={handleFormChange}
                        className="w-full px-3 py-2 border border-[#D4E1EA] rounded-lg focus:ring-2 focus:ring-[#022658] focus:border-[#022658]"
                        style={{ fontFamily: 'Satoshi' }}
                      >
                        <option value="">Select Court Type</option>
                        <option value="high_court">High Court</option>
                        <option value="supreme_court">Supreme Court</option>
                        <option value="court_of_appeal">Court of Appeal</option>
                        <option value="circuit_court">Circuit Court</option>
                        <option value="district_court">District Court</option>
                      </select>
                      {errors.court_type && <p className="text-xs text-red-600 mt-1">{errors.court_type}</p>}
                    </div>
                  )}
                </div>
                <div className="flex justify-end space-x-3 pt-4 border-t">
                  <button
                    type="button"
                    onClick={() => {
                      setShowEditModal(false);
                      setEditingUser(null);
                      setErrors({});
                    }}
                    className="px-4 py-2 text-[#022658] bg-white border-2 border-[#022658] rounded-lg hover:bg-gray-50 transition-colors"
                    style={{ fontFamily: 'Satoshi' }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-[#022658] text-white rounded-lg hover:bg-[#1A4983] transition-colors"
                    style={{ fontFamily: 'Satoshi' }}
                  >
                    Save Changes
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center justify-center w-12 h-12 mx-auto bg-red-100 rounded-full mb-4">
                <Trash2 className="h-6 w-6 text-red-600" />
              </div>
              <h3 className="text-lg font-bold text-[#040E1B] text-center mb-2" style={{ fontFamily: 'Poppins' }}>Delete User</h3>
              <p className="text-sm text-[#525866] text-center mb-4" style={{ fontFamily: 'Satoshi' }}>
                Are you sure you want to delete {selectedUser.first_name} {selectedUser.last_name}? This action cannot be undone.
              </p>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => {
                    setShowDeleteModal(false);
                    setSelectedUser(null);
                  }}
                  className="px-4 py-2 text-[#022658] bg-white border-2 border-[#022658] rounded-lg hover:bg-gray-50 transition-colors"
                  style={{ fontFamily: 'Satoshi' }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                  style={{ fontFamily: 'Satoshi' }}
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Password Reset Modal */}
      {showPasswordResetModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-[#040E1B]" style={{ fontFamily: 'Poppins' }}>Reset Password</h3>
                <button
                  onClick={() => {
                    setShowPasswordResetModal(false);
                    setSelectedUser(null);
                    setPasswordResetData({
                      new_password: '',
                      confirm_password: '',
                      admin_password: ''
                    });
                    setErrors({});
                  }}
                  className="text-[#525866] hover:text-[#040E1B]"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-[#525866] mb-1" style={{ fontFamily: 'Satoshi' }}>New Password</label>
                  <input
                    type="password"
                    value={passwordResetData.new_password}
                    onChange={(e) => setPasswordResetData({ ...passwordResetData, new_password: e.target.value })}
                    className="w-full px-3 py-2 border border-[#D4E1EA] rounded-lg focus:ring-2 focus:ring-[#022658] focus:border-[#022658]"
                    style={{ fontFamily: 'Satoshi' }}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#525866] mb-1" style={{ fontFamily: 'Satoshi' }}>Confirm Password</label>
                  <input
                    type="password"
                    value={passwordResetData.confirm_password}
                    onChange={(e) => setPasswordResetData({ ...passwordResetData, confirm_password: e.target.value })}
                    className="w-full px-3 py-2 border border-[#D4E1EA] rounded-lg focus:ring-2 focus:ring-[#022658] focus:border-[#022658]"
                    style={{ fontFamily: 'Satoshi' }}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#525866] mb-1" style={{ fontFamily: 'Satoshi' }}>Admin Password</label>
                  <input
                    type="password"
                    value={passwordResetData.admin_password}
                    onChange={(e) => setPasswordResetData({ ...passwordResetData, admin_password: e.target.value })}
                    className="w-full px-3 py-2 border border-[#D4E1EA] rounded-lg focus:ring-2 focus:ring-[#022658] focus:border-[#022658]"
                    style={{ fontFamily: 'Satoshi' }}
                  />
                  {errors.admin_password && <p className="text-xs text-red-600 mt-1">{errors.admin_password}</p>}
                </div>
                {errors.password && <p className="text-xs text-red-600">{errors.password}</p>}
                <div className="flex justify-end space-x-3 pt-4 border-t">
                  <button
                    type="button"
                    onClick={() => {
                      setShowPasswordResetModal(false);
                      setSelectedUser(null);
                      setPasswordResetData({
                        new_password: '',
                        confirm_password: '',
                        admin_password: ''
                      });
                      setErrors({});
                    }}
                    className="px-4 py-2 text-[#022658] bg-white border-2 border-[#022658] rounded-lg hover:bg-gray-50 transition-colors"
                    style={{ fontFamily: 'Satoshi' }}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handlePasswordResetSubmit}
                    className="px-4 py-2 bg-[#022658] text-white rounded-lg hover:bg-[#1A4983] transition-colors"
                    style={{ fontFamily: 'Satoshi' }}
                  >
                    Reset Password
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Toast Container */}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </div>
  );
};

export default ClientAndRegistrarManagement;

