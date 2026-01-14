import React, { useState, useEffect } from 'react';
import {
  Shield,
  Users,
  Key,
  Plus,
  Edit,
  Trash2,
  Search,
  Filter,
  ChevronDown,
  ChevronUp,
  Check,
  X,
  Eye,
  UserCheck,
  Settings,
  AlertCircle,
  CheckCircle,
  Clock,
  Calendar,
  MoreVertical,
  Save,
  RefreshCw
} from 'lucide-react';

const RolesPermissionsManagement = () => {
  const [activeTab, setActiveTab] = useState('roles');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Roles state
  const [roles, setRoles] = useState([]);
  const [totalRoles, setTotalRoles] = useState(0);
  const [rolesPage, setRolesPage] = useState(1);
  const [rolesSearch, setRolesSearch] = useState('');
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [editingRole, setEditingRole] = useState(null);
  const [roleForm, setRoleForm] = useState({
    name: '',
    display_name: '',
    description: '',
    is_active: true,
    permissions: []
  });

  // Permissions state
  const [permissions, setPermissions] = useState([]);
  const [totalPermissions, setTotalPermissions] = useState(0);
  const [permissionsPage, setPermissionsPage] = useState(1);
  const [permissionsSearch, setPermissionsSearch] = useState('');
  const [permissionsCategory, setPermissionsCategory] = useState('');
  const [showPermissionModal, setShowPermissionModal] = useState(false);
  const [editingPermission, setEditingPermission] = useState(null);
  const [permissionForm, setPermissionForm] = useState({
    name: '',
    display_name: '',
    description: '',
    category: '',
    resource: '',
    action: '',
    is_active: true
  });

  // User roles state
  const [userRoles, setUserRoles] = useState([]);
  const [totalUserRoles, setTotalUserRoles] = useState(0);
  const [userRolesPage, setUserRolesPage] = useState(1);
  const [showUserRoleModal, setShowUserRoleModal] = useState(false);
  const [userRoleForm, setUserRoleForm] = useState({
    user_id: '',
    role_id: '',
    expires_at: '',
    notes: ''
  });

  // State for user search
  const [users, setUsers] = useState([]);
  const [userSearchTerm, setUserSearchTerm] = useState('');
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [showUserDropdown, setShowUserDropdown] = useState(false);

  // State for confirmation modal
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null);
  const [confirmMessage, setConfirmMessage] = useState('');

  // Statistics
  const [stats, setStats] = useState({
    roles: { total: 0, active: 0, system: 0, custom: 0 },
    permissions: { total: 0, active: 0, system: 0, custom: 0, categories: {} },
    user_roles: { total: 0, active: 0 }
  });

  // Load data
  // Load users for dropdown
  const loadUsers = async () => {
    try {
      const response = await fetch('/admin/users?limit=100');
      if (response.ok) {
        const data = await response.json();
        setUsers(data.users || []);
      }
    } catch (error) {
      console.error('Error loading users:', error);
    }
  };

  // Filter users based on search term
  useEffect(() => {
    if (userSearchTerm.trim() === '') {
      setFilteredUsers(users.slice(0, 10)); // Show first 10 users
    } else {
      const filtered = users.filter(user => 
        user.first_name?.toLowerCase().includes(userSearchTerm.toLowerCase()) ||
        user.last_name?.toLowerCase().includes(userSearchTerm.toLowerCase()) ||
        user.email?.toLowerCase().includes(userSearchTerm.toLowerCase()) ||
        `${user.first_name} ${user.last_name}`.toLowerCase().includes(userSearchTerm.toLowerCase())
      ).slice(0, 10);
      setFilteredUsers(filtered);
    }
  }, [userSearchTerm, users]);

  // Handle user selection
  const handleUserSelect = (user) => {
    setUserRoleForm({...userRoleForm, user_id: user.id});
    setUserSearchTerm(`${user.first_name} ${user.last_name} (${user.email})`);
    setShowUserDropdown(false);
  };

  // Handle confirmation modal
  const showConfirmation = (action, message) => {
    setConfirmAction(() => action);
    setConfirmMessage(message);
    setShowConfirmModal(true);
  };

  const handleConfirm = () => {
    if (confirmAction) {
      confirmAction();
    }
    setShowConfirmModal(false);
    setConfirmAction(null);
    setConfirmMessage('');
  };

  const handleCancel = () => {
    setShowConfirmModal(false);
    setConfirmAction(null);
    setConfirmMessage('');
  };

  // Handle refresh button
  const handleRefresh = async () => {
    setError(null);
    setSuccess(null);
    setLoading(true);
    
    try {
      // Load all data based on current tab
      await loadStats();
      await loadUsers();
      
      if (activeTab === 'roles') {
        await loadRoles();
      } else if (activeTab === 'permissions') {
        await loadPermissions();
      } else if (activeTab === 'user-roles') {
        await loadUserRoles();
      }
      
      setSuccess('Data refreshed successfully');
    } catch (error) {
      console.error('Error refreshing data:', error);
      setError('Failed to refresh data');
    } finally {
      setLoading(false);
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showUserDropdown && !event.target.closest('.user-dropdown-container')) {
        setShowUserDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showUserDropdown]);

  useEffect(() => {
    loadStats();
    loadUsers(); // Load users on component mount
    if (activeTab === 'roles') {
      loadRoles();
    } else if (activeTab === 'permissions') {
      loadPermissions();
    } else if (activeTab === 'user-roles') {
      loadUserRoles();
    }
  }, [activeTab, rolesPage, permissionsPage, userRolesPage, rolesSearch, permissionsSearch, permissionsCategory]);

  const loadStats = async () => {
    try {
      const response = await fetch('/admin/roles/stats');
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const loadRoles = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: rolesPage,
        limit: 10,
        ...(rolesSearch && { search: rolesSearch })
      });
      
      const response = await fetch(`/api/admin/roles/roles?${params}`);
      if (response.ok) {
        const data = await response.json();
        setRoles(data.roles || []);
        setTotalRoles(data.total || 0);
      }
    } catch (error) {
      console.error('Error loading roles:', error);
      setError('Failed to load roles');
    } finally {
      setLoading(false);
    }
  };

  const loadPermissions = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: permissionsPage,
        limit: 10,
        ...(permissionsSearch && { search: permissionsSearch }),
        ...(permissionsCategory && { category: permissionsCategory })
      });
      
      const response = await fetch(`/api/admin/roles/permissions?${params}`);
      if (response.ok) {
        const data = await response.json();
        setPermissions(data.permissions || []);
        setTotalPermissions(data.total || 0);
      }
    } catch (error) {
      console.error('Error loading permissions:', error);
      setError('Failed to load permissions');
    } finally {
      setLoading(false);
    }
  };

  const loadUserRoles = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: userRolesPage,
        limit: 10
      });
      
      const response = await fetch(`/api/admin/roles/user-roles?${params}`);
      if (response.ok) {
        const data = await response.json();
        setUserRoles(data.user_roles || []);
        setTotalUserRoles(data.total || 0);
      }
    } catch (error) {
      console.error('Error loading user roles:', error);
      setError('Failed to load user roles');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateRole = async () => {
    try {
      setLoading(true);
      const url = editingRole 
        ? `/api/admin/roles/roles/${editingRole.id}`
        : '/api/admin/roles/roles';
      const method = editingRole ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(roleForm),
      });

      if (response.ok) {
        setSuccess(editingRole ? 'Role updated successfully' : 'Role created successfully');
        setShowRoleModal(false);
        setEditingRole(null);
        setRoleForm({
          name: '',
          display_name: '',
          description: '',
          is_active: true,
          permissions: []
        });
        loadRoles();
        loadStats();
      } else {
        const errorData = await response.json();
        setError(errorData.detail || `Failed to ${editingRole ? 'update' : 'create'} role`);
      }
    } catch (error) {
      console.error('Error creating/updating role:', error);
      setError(`Failed to ${editingRole ? 'update' : 'create'} role`);
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePermission = async () => {
    try {
      setLoading(true);
      const url = editingPermission 
        ? `/api/admin/roles/permissions/${editingPermission.id}`
        : '/api/admin/roles/permissions';
      const method = editingPermission ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(permissionForm),
      });

      if (response.ok) {
        setSuccess(editingPermission ? 'Permission updated successfully' : 'Permission created successfully');
        setShowPermissionModal(false);
        setEditingPermission(null);
        setPermissionForm({
          name: '',
          display_name: '',
          description: '',
          category: '',
          resource: '',
          action: '',
          is_active: true
        });
        loadPermissions();
        loadStats();
      } else {
        const errorData = await response.json();
        setError(errorData.detail || `Failed to ${editingPermission ? 'update' : 'create'} permission`);
      }
    } catch (error) {
      console.error('Error creating/updating permission:', error);
      setError(`Failed to ${editingPermission ? 'update' : 'create'} permission`);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteRole = async (roleId) => {
    const role = roles.find(r => r.id === roleId);
    const roleName = role ? role.display_name : 'this role';
    
    showConfirmation(async () => {
      setError(null);
      setSuccess(null);
      
      try {
        setLoading(true);
        const response = await fetch(`/api/admin/roles/roles/${roleId}`, {
          method: 'DELETE',
        });

        if (response.ok) {
          setSuccess('Role deleted successfully');
          loadRoles();
          loadStats();
        } else {
          const errorData = await response.json();
          setError(errorData.detail || 'Failed to delete role');
        }
      } catch (error) {
        console.error('Error deleting role:', error);
        setError('Failed to delete role');
      } finally {
        setLoading(false);
      }
    }, `Are you sure you want to delete "${roleName}"? This action cannot be undone.`);
  };

  const handleDeletePermission = async (permissionId) => {
    const permission = permissions.find(p => p.id === permissionId);
    const permissionName = permission ? permission.display_name : 'this permission';
    
    showConfirmation(async () => {
      setError(null);
      setSuccess(null);
      
      try {
        setLoading(true);
        const response = await fetch(`/api/admin/roles/permissions/${permissionId}`, {
          method: 'DELETE',
        });

        if (response.ok) {
          setSuccess('Permission deleted successfully');
          loadPermissions();
          loadStats();
        } else {
          const errorData = await response.json();
          setError(errorData.detail || 'Failed to delete permission');
        }
      } catch (error) {
        console.error('Error deleting permission:', error);
        setError('Failed to delete permission');
      } finally {
        setLoading(false);
      }
    }, `Are you sure you want to delete "${permissionName}"? This action cannot be undone.`);
  };

  const handleAssignUserRole = async () => {
    try {
      setLoading(true);
      const response = await fetch('/admin/roles/user-roles', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: parseInt(userRoleForm.user_id),
          role_id: parseInt(userRoleForm.role_id),
          expires_at: userRoleForm.expires_at || null,
          notes: userRoleForm.notes || null
        }),
      });

      if (response.ok) {
        setSuccess('Role assigned successfully');
        setShowUserRoleModal(false);
        setUserRoleForm({
          user_id: '',
          role_id: '',
          expires_at: '',
          notes: ''
        });
        setUserSearchTerm('');
        loadUserRoles();
        loadStats();
      } else {
        const errorData = await response.json();
        setError(errorData.detail || 'Failed to assign role');
      }
    } catch (error) {
      console.error('Error assigning role:', error);
      setError('Failed to assign role');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveUserRole = async (userRoleId) => {
    const userRole = userRoles.find(ur => ur.id === userRoleId);
    const userName = userRole ? userRole.user_name : 'this user';
    const roleName = userRole ? userRole.role_display_name : 'this role';
    
    showConfirmation(async () => {
      setError(null);
      setSuccess(null);
      
      try {
        setLoading(true);
        const response = await fetch(`/api/admin/roles/user-roles/${userRoleId}`, {
          method: 'DELETE',
        });

        if (response.ok) {
          setSuccess('Role assignment removed successfully');
          loadUserRoles();
          loadStats();
        } else {
          const errorData = await response.json();
          setError(errorData.detail || 'Failed to remove role assignment');
        }
      } catch (error) {
        console.error('Error removing role assignment:', error);
        setError('Failed to remove role assignment');
      } finally {
        setLoading(false);
      }
    }, `Are you sure you want to remove the "${roleName}" role from "${userName}"? This action cannot be undone.`);
  };

  const getStatusBadge = (isActive, isSystem = false) => {
    if (isSystem) {
      return (
        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
          <Shield className="h-3 w-3 mr-1" />
          System
        </span>
      );
    }
    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
        isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
      }`}>
        {isActive ? <CheckCircle className="h-3 w-3 mr-1" /> : <X className="h-3 w-3 mr-1" />}
        {isActive ? 'Active' : 'Inactive'}
      </span>
    );
  };

  const getCategoryColor = (category) => {
    const colors = {
      'users': 'bg-blue-100 text-blue-800',
      'cases': 'bg-green-100 text-green-800',
      'admin': 'bg-purple-100 text-purple-800',
      'payments': 'bg-yellow-100 text-yellow-800',
      'settings': 'bg-gray-100 text-gray-800',
      'reports': 'bg-indigo-100 text-indigo-800'
    };
    return colors[category] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Roles & Permissions</h2>
          <p className="text-slate-600">Manage user roles, permissions, and access control</p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={loading}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          <span>{loading ? 'Refreshing...' : 'Refresh'}</span>
        </button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Total Roles</p>
              <p className="text-3xl font-bold text-slate-900">{stats.roles.total}</p>
              <div className="flex items-center mt-2">
                <span className="text-sm text-green-600 font-medium">{stats.roles.active} active</span>
                <span className="text-sm text-slate-500 ml-2">• {stats.roles.custom} custom</span>
              </div>
            </div>
            <div className="p-3 bg-blue-100 rounded-full">
              <Shield className="h-8 w-8 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow border-l-4 border-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Total Permissions</p>
              <p className="text-3xl font-bold text-slate-900">{stats.permissions.total}</p>
              <div className="flex items-center mt-2">
                <span className="text-sm text-green-600 font-medium">{stats.permissions.active} active</span>
                <span className="text-sm text-slate-500 ml-2">• {Object.keys(stats.permissions.categories || {}).length} categories</span>
              </div>
            </div>
            <div className="p-3 bg-green-100 rounded-full">
              <Key className="h-8 w-8 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow border-l-4 border-purple-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">User Assignments</p>
              <p className="text-3xl font-bold text-slate-900">{stats.user_roles.total}</p>
              <div className="flex items-center mt-2">
                <span className="text-sm text-green-600 font-medium">{stats.user_roles.active} active</span>
                <span className="text-sm text-slate-500 ml-2">assignments</span>
              </div>
            </div>
            <div className="p-3 bg-purple-100 rounded-full">
              <UserCheck className="h-8 w-8 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow">
        <div className="border-b border-slate-200">
          <nav className="-mb-px flex space-x-8 px-6">
            {[
              { id: 'roles', name: 'Roles', icon: Shield },
              { id: 'permissions', name: 'Permissions', icon: Key },
              { id: 'user-roles', name: 'User Assignments', icon: UserCheck }
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{tab.name}</span>
                </button>
              );
            })}
          </nav>
        </div>

        <div className="p-6">
          {/* Roles Tab */}
          {activeTab === 'roles' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-4">
                  <div className="relative">
                    <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Search roles..."
                      value={rolesSearch}
                      onChange={(e) => setRolesSearch(e.target.value)}
                      className="pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <button
                    onClick={() => {
                      setError(null);
                      setSuccess(null);
                      loadRoles();
                    }}
                    disabled={loading}
                    className="flex items-center space-x-2 px-3 py-2 text-slate-600 bg-slate-100 rounded-lg hover:bg-slate-200 disabled:opacity-50"
                    title="Refresh roles"
                  >
                    <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                  </button>
                </div>
                <button
                  onClick={() => {
                    setEditingRole(null);
                    setRoleForm({
                      name: '',
                      display_name: '',
                      description: '',
                      is_active: true,
                      permissions: []
                    });
                    setShowRoleModal(true);
                  }}
                  className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Plus className="h-4 w-4" />
                  <span>Create Role</span>
                </button>
              </div>

              {/* Roles Table */}
              <div className="overflow-x-auto w-full">
                <table className="min-w-full divide-y divide-slate-200 w-full">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Role</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Description</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Permissions</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Created</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-slate-200">
                    {loading ? (
                      <tr>
                        <td colSpan="6" className="px-6 py-4 text-center">
                          <div className="flex items-center justify-center">
                            <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                            Loading roles...
                          </div>
                        </td>
                      </tr>
                    ) : roles.length === 0 ? (
                      <tr>
                        <td colSpan="6" className="px-6 py-4 text-center text-slate-500">
                          No roles found
                        </td>
                      </tr>
                    ) : (
                      roles.map((role) => (
                        <tr key={role.id} className="hover:bg-slate-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <div className="text-sm font-medium text-slate-900">{role.display_name}</div>
                              <div className="text-sm text-slate-500">{role.name}</div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm text-slate-900 max-w-xs truncate">
                              {role.description || 'No description'}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {getStatusBadge(role.is_active, role.is_system_role)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="text-sm text-slate-900">
                              {role.permissions ? role.permissions.length : 0} permissions
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                            {new Date(role.created_at).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <div className="flex items-center justify-end space-x-2">
                              <button
                                onClick={() => {
                                  setEditingRole(role);
                                  setRoleForm({
                                    name: role.name,
                                    display_name: role.display_name,
                                    description: role.description || '',
                                    is_active: role.is_active,
                                    permissions: role.permissions || []
                                  });
                                  setShowRoleModal(true);
                                }}
                                className="text-blue-600 hover:text-blue-900"
                              >
                                <Edit className="h-4 w-4" />
                              </button>
                              {!role.is_system_role && (
                                <button
                                  onClick={() => handleDeleteRole(role.id)}
                                  className="text-red-600 hover:text-red-900"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="flex items-center justify-between">
                <div className="text-sm text-slate-700">
                  Showing {((rolesPage - 1) * 10) + 1} to {Math.min(rolesPage * 10, totalRoles)} of {totalRoles} roles
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setRolesPage(rolesPage - 1)}
                    disabled={rolesPage === 1}
                    className="px-3 py-1 border border-slate-300 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  <span className="px-3 py-1 text-sm text-slate-700">
                    Page {rolesPage} of {Math.ceil(totalRoles / 10)}
                  </span>
                  <button
                    onClick={() => setRolesPage(rolesPage + 1)}
                    disabled={rolesPage >= Math.ceil(totalRoles / 10)}
                    className="px-3 py-1 border border-slate-300 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Permissions Tab */}
          {activeTab === 'permissions' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-4">
                  <div className="relative">
                    <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Search permissions..."
                      value={permissionsSearch}
                      onChange={(e) => setPermissionsSearch(e.target.value)}
                      className="pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <select
                    value={permissionsCategory}
                    onChange={(e) => setPermissionsCategory(e.target.value)}
                    className="px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">All Categories</option>
                    {Object.keys(stats.permissions.categories || {}).map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                  <button
                    onClick={() => {
                      setError(null);
                      setSuccess(null);
                      loadPermissions();
                    }}
                    disabled={loading}
                    className="flex items-center space-x-2 px-3 py-2 text-slate-600 bg-slate-100 rounded-lg hover:bg-slate-200 disabled:opacity-50"
                    title="Refresh permissions"
                  >
                    <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                  </button>
                </div>
                <button
                  onClick={() => {
                    setEditingPermission(null);
                    setPermissionForm({
                      name: '',
                      display_name: '',
                      description: '',
                      category: '',
                      resource: '',
                      action: '',
                      is_active: true
                    });
                    setShowPermissionModal(true);
                  }}
                  className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Plus className="h-4 w-4" />
                  <span>Create Permission</span>
                </button>
              </div>

              {/* Permissions Table */}
              <div className="overflow-x-auto w-full">
                <table className="min-w-full divide-y divide-slate-200 w-full">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Permission</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Category</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Resource</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Action</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-slate-200">
                    {loading ? (
                      <tr>
                        <td colSpan="6" className="px-6 py-4 text-center">
                          <div className="flex items-center justify-center">
                            <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                            Loading permissions...
                          </div>
                        </td>
                      </tr>
                    ) : permissions.length === 0 ? (
                      <tr>
                        <td colSpan="6" className="px-6 py-4 text-center text-slate-500">
                          No permissions found
                        </td>
                      </tr>
                    ) : (
                      permissions.map((permission) => (
                        <tr key={permission.id} className="hover:bg-slate-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <div className="text-sm font-medium text-slate-900">{permission.display_name}</div>
                              <div className="text-sm text-slate-500">{permission.name}</div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(permission.category)}`}>
                              {permission.category}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                            {permission.resource}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                            {permission.action}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {getStatusBadge(permission.is_active, permission.is_system_permission)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <div className="flex items-center justify-end space-x-2">
                              <button
                                onClick={() => {
                                  setEditingPermission(permission);
                                  setPermissionForm({
                                    name: permission.name,
                                    display_name: permission.display_name,
                                    description: permission.description || '',
                                    category: permission.category,
                                    resource: permission.resource,
                                    action: permission.action,
                                    is_active: permission.is_active
                                  });
                                  setShowPermissionModal(true);
                                }}
                                className="text-blue-600 hover:text-blue-900"
                              >
                                <Edit className="h-4 w-4" />
                              </button>
                              {!permission.is_system_permission && (
                                <button
                                  onClick={() => handleDeletePermission(permission.id)}
                                  className="text-red-600 hover:text-red-900"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="flex items-center justify-between">
                <div className="text-sm text-slate-700">
                  Showing {((permissionsPage - 1) * 10) + 1} to {Math.min(permissionsPage * 10, totalPermissions)} of {totalPermissions} permissions
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setPermissionsPage(permissionsPage - 1)}
                    disabled={permissionsPage === 1}
                    className="px-3 py-1 border border-slate-300 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  <span className="px-3 py-1 text-sm text-slate-700">
                    Page {permissionsPage} of {Math.ceil(totalPermissions / 10)}
                  </span>
                  <button
                    onClick={() => setPermissionsPage(permissionsPage + 1)}
                    disabled={permissionsPage >= Math.ceil(totalPermissions / 10)}
                    className="px-3 py-1 border border-slate-300 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* User Roles Tab */}
          {activeTab === 'user-roles' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-4">
                  <div className="text-sm text-slate-600">
                    Manage user role assignments
                  </div>
                  <button
                    onClick={() => {
                      setError(null);
                      setSuccess(null);
                      loadUserRoles();
                    }}
                    disabled={loading}
                    className="flex items-center space-x-2 px-3 py-2 text-slate-600 bg-slate-100 rounded-lg hover:bg-slate-200 disabled:opacity-50"
                    title="Refresh user roles"
                  >
                    <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                  </button>
                </div>
                <button
                  onClick={() => setShowUserRoleModal(true)}
                  className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Plus className="h-4 w-4" />
                  <span>Assign Role</span>
                </button>
              </div>

              {/* User Roles Table */}
              <div className="overflow-x-auto w-full">
                <table className="min-w-full divide-y divide-slate-200 w-full">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">User</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Role</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Assigned</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Expires</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-slate-200">
                    {loading ? (
                      <tr>
                        <td colSpan="6" className="px-6 py-4 text-center">
                          <div className="flex items-center justify-center">
                            <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                            Loading user roles...
                          </div>
                        </td>
                      </tr>
                    ) : userRoles.length === 0 ? (
                      <tr>
                        <td colSpan="6" className="px-6 py-4 text-center text-slate-500">
                          No user role assignments found
                        </td>
                      </tr>
                    ) : (
                      userRoles.map((userRole) => (
                        <tr key={userRole.id} className="hover:bg-slate-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <div className="text-sm font-medium text-slate-900">{userRole.user_name || 'Unknown User'}</div>
                              <div className="text-sm text-slate-500">{userRole.user_email}</div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-slate-900">{userRole.role_display_name}</div>
                            <div className="text-sm text-slate-500">{userRole.role_name}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                            {new Date(userRole.assigned_at).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                            {userRole.expires_at ? new Date(userRole.expires_at).toLocaleDateString() : 'Never'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {getStatusBadge(userRole.is_active)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <button
                              onClick={() => handleRemoveUserRole(userRole.id)}
                              className="text-red-600 hover:text-red-900"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="flex items-center justify-between">
                <div className="text-sm text-slate-700">
                  Showing {((userRolesPage - 1) * 10) + 1} to {Math.min(userRolesPage * 10, totalUserRoles)} of {totalUserRoles} assignments
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setUserRolesPage(userRolesPage - 1)}
                    disabled={userRolesPage === 1}
                    className="px-3 py-1 border border-slate-300 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  <span className="px-3 py-1 text-sm text-slate-700">
                    Page {userRolesPage} of {Math.ceil(totalUserRoles / 10)}
                  </span>
                  <button
                    onClick={() => setUserRolesPage(userRolesPage + 1)}
                    disabled={userRolesPage >= Math.ceil(totalUserRoles / 10)}
                    className="px-3 py-1 border border-slate-300 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Role Modal */}
      {showRoleModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">
                {editingRole ? 'Edit Role' : 'Create Role'}
              </h3>
              <button
                onClick={() => setShowRoleModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            
            <form onSubmit={(e) => { e.preventDefault(); handleCreateRole(); }}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Role Name *
                  </label>
                  <input
                    type="text"
                    value={roleForm.name}
                    onChange={(e) => setRoleForm({...roleForm, name: e.target.value})}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="e.g., custom_role"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Display Name *
                  </label>
                  <input
                    type="text"
                    value={roleForm.display_name}
                    onChange={(e) => setRoleForm({...roleForm, display_name: e.target.value})}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="e.g., Custom Role"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Description
                  </label>
                  <textarea
                    value={roleForm.description}
                    onChange={(e) => setRoleForm({...roleForm, description: e.target.value})}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    rows="3"
                    placeholder="Role description..."
                  />
                </div>
                
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="is_active"
                    checked={roleForm.is_active}
                    onChange={(e) => setRoleForm({...roleForm, is_active: e.target.checked})}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="is_active" className="ml-2 block text-sm text-slate-700">
                    Active
                  </label>
                </div>
              </div>
              
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowRoleModal(false)}
                  className="px-4 py-2 text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {loading ? <RefreshCw className="h-4 w-4 animate-spin" /> : 'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Permission Modal */}
      {showPermissionModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">
                {editingPermission ? 'Edit Permission' : 'Create Permission'}
              </h3>
              <button
                onClick={() => setShowPermissionModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            
            <form onSubmit={(e) => { e.preventDefault(); handleCreatePermission(); }}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Permission Name *
                  </label>
                  <input
                    type="text"
                    value={permissionForm.name}
                    onChange={(e) => setPermissionForm({...permissionForm, name: e.target.value})}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="e.g., resource.action"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Display Name *
                  </label>
                  <input
                    type="text"
                    value={permissionForm.display_name}
                    onChange={(e) => setPermissionForm({...permissionForm, display_name: e.target.value})}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="e.g., Create Resource"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Category *
                  </label>
                  <select
                    value={permissionForm.category}
                    onChange={(e) => setPermissionForm({...permissionForm, category: e.target.value})}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  >
                    <option value="">Select Category</option>
                    <option value="users">Users</option>
                    <option value="cases">Cases</option>
                    <option value="people">People</option>
                    <option value="banks">Banks</option>
                    <option value="insurance">Insurance</option>
                    <option value="companies">Companies</option>
                    <option value="payments">Payments</option>
                    <option value="admin">Admin</option>
                    <option value="reports">Reports</option>
                  </select>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Resource *
                    </label>
                    <input
                      type="text"
                      value={permissionForm.resource}
                      onChange={(e) => setPermissionForm({...permissionForm, resource: e.target.value})}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="e.g., user"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Action *
                    </label>
                    <select
                      value={permissionForm.action}
                      onChange={(e) => setPermissionForm({...permissionForm, action: e.target.value})}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    >
                      <option value="">Select Action</option>
                      <option value="create">Create</option>
                      <option value="read">Read</option>
                      <option value="update">Update</option>
                      <option value="delete">Delete</option>
                      <option value="manage">Manage</option>
                      <option value="export">Export</option>
                    </select>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Description
                  </label>
                  <textarea
                    value={permissionForm.description}
                    onChange={(e) => setPermissionForm({...permissionForm, description: e.target.value})}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    rows="3"
                    placeholder="Permission description..."
                  />
                </div>
                
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="permission_is_active"
                    checked={permissionForm.is_active}
                    onChange={(e) => setPermissionForm({...permissionForm, is_active: e.target.checked})}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="permission_is_active" className="ml-2 block text-sm text-slate-700">
                    Active
                  </label>
                </div>
              </div>
              
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowPermissionModal(false)}
                  className="px-4 py-2 text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {loading ? <RefreshCw className="h-4 w-4 animate-spin" /> : 'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* User Role Assignment Modal */}
      {showUserRoleModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Assign Role to User</h3>
              <button
                onClick={() => setShowUserRoleModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            
            <form onSubmit={(e) => { e.preventDefault(); handleAssignUserRole(); }}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Select User *
                  </label>
                  <div className="relative user-dropdown-container">
                    <input
                      type="text"
                      value={userSearchTerm}
                      onChange={(e) => {
                        setUserSearchTerm(e.target.value);
                        setShowUserDropdown(true);
                      }}
                      onFocus={() => setShowUserDropdown(true)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Search for user by name or email..."
                      required
                    />
                    {showUserDropdown && (
                      <div className="absolute z-10 w-full mt-1 bg-white border border-slate-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                        {filteredUsers.length > 0 ? (
                          filteredUsers.map(user => (
                            <div
                              key={user.id}
                              onClick={() => handleUserSelect(user)}
                              className="px-4 py-2 hover:bg-slate-100 cursor-pointer border-b border-slate-100 last:border-b-0"
                            >
                              <div className="font-medium text-slate-900">
                                {user.first_name} {user.last_name}
                              </div>
                              <div className="text-sm text-slate-500">{user.email}</div>
                            </div>
                          ))
                        ) : (
                          <div className="px-4 py-2 text-slate-500 text-sm">
                            {userSearchTerm ? 'No users found' : 'Start typing to search users...'}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Role *
                  </label>
                  <select
                    value={userRoleForm.role_id}
                    onChange={(e) => setUserRoleForm({...userRoleForm, role_id: e.target.value})}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  >
                    <option value="">Select Role</option>
                    {roles.map(role => (
                      <option key={role.id} value={role.id}>
                        {role.display_name}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Expires At
                  </label>
                  <input
                    type="datetime-local"
                    value={userRoleForm.expires_at}
                    onChange={(e) => setUserRoleForm({...userRoleForm, expires_at: e.target.value})}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Notes
                  </label>
                  <textarea
                    value={userRoleForm.notes}
                    onChange={(e) => setUserRoleForm({...userRoleForm, notes: e.target.value})}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    rows="3"
                    placeholder="Assignment notes..."
                  />
                </div>
              </div>
              
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowUserRoleModal(false)}
                  className="px-4 py-2 text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {loading ? <RefreshCw className="h-4 w-4 animate-spin" /> : 'Assign Role'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex items-center mb-4">
              <AlertCircle className="h-6 w-6 text-red-600 mr-3" />
              <h3 className="text-lg font-semibold text-slate-900">Confirm Action</h3>
            </div>
            
            <p className="text-slate-700 mb-6">
              {confirmMessage}
            </p>
            
            <div className="flex justify-end space-x-3">
              <button
                onClick={handleCancel}
                className="px-4 py-2 text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirm}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Error/Success Messages */}
      {error && (
        <div className="fixed top-4 right-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg shadow-lg z-50">
          <div className="flex items-center">
            <AlertCircle className="h-4 w-4 mr-2" />
            <span>{error}</span>
            <button
              onClick={() => setError(null)}
              className="ml-4 text-red-700 hover:text-red-900"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {success && (
        <div className="fixed top-4 right-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg shadow-lg z-50">
          <div className="flex items-center">
            <CheckCircle className="h-4 w-4 mr-2" />
            <span>{success}</span>
            <button
              onClick={() => setSuccess(null)}
              className="ml-4 text-green-700 hover:text-green-900"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default RolesPermissionsManagement;
