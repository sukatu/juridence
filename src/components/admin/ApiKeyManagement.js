import React, { useState, useEffect } from 'react';
import { 
  Key, 
  Search, 
  Plus, 
  Copy, 
  Eye, 
  EyeOff, 
  Trash2, 
  Calendar,
  User,
  Shield,
  AlertTriangle,
  CheckCircle,
  XCircle,
  MoreVertical,
  ChevronLeft,
  ChevronRight,
  X
} from 'lucide-react';

const ApiKeyManagement = () => {
  const [apiKeys, setApiKeys] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [userFilter, setUserFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalKeys, setTotalKeys] = useState(0);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedKey, setSelectedKey] = useState(null);
  const [visibleKeys, setVisibleKeys] = useState(new Set());
  const [copiedKey, setCopiedKey] = useState(null);

  // Form states
  const [formData, setFormData] = useState({
    user_id: '',
    name: '',
    expires_in_days: ''
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    loadApiKeys();
    loadUsers();
  }, [currentPage, searchTerm, userFilter]);

  const loadApiKeys = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '10'
      });

      if (userFilter) params.append('user_id', userFilter);

      const response = await fetch(`/api/admin/api-keys?${params}`);
      const data = await response.json();

      if (response.ok) {
        setApiKeys(data.api_keys || []);
        setTotalPages(Math.ceil((data.total || 0) / 10)); // Use total from response
        setTotalKeys(data.total || 0);
      } else {
        console.error('Error loading API keys:', data.detail);
      }
    } catch (error) {
      console.error('Error loading API keys:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadUsers = async () => {
    try {
      const response = await fetch('/api/admin/users?limit=100');
      const data = await response.json();

      if (response.ok) {
        setUsers(data.users || []);
      } else {
        console.error('Error loading users:', data.detail);
      }
    } catch (error) {
      console.error('Error loading users:', error);
    }
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handleUserFilter = (e) => {
    setUserFilter(e.target.value);
    setCurrentPage(1);
  };

  const handleCreateKey = () => {
    setFormData({
      user_id: '',
      name: '',
      expires_in_days: ''
    });
    setErrors({});
    setShowCreateModal(true);
  };

  const handleDeleteKey = (key) => {
    setSelectedKey(key);
    setShowDeleteModal(true);
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.user_id) newErrors.user_id = 'User is required';
    if (!formData.name) newErrors.name = 'Key name is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    try {
      const response = await fetch('/api/admin/api-keys', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (response.ok) {
        setShowCreateModal(false);
        loadApiKeys();
        // Show the generated key to the user
        alert(`API Key generated successfully!\n\nKey: ${data.full_key}\n\nPlease copy and save this key securely. It will not be shown again.`);
      } else {
        console.error('Error creating API key:', data.detail);
        if (data.detail && typeof data.detail === 'object') {
          setErrors(data.detail);
        }
      }
    } catch (error) {
      console.error('Error creating API key:', error);
    }
  };

  const handleDelete = async () => {
    try {
      const response = await fetch(`/api/admin/api-keys/${selectedKey.id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        setShowDeleteModal(false);
        setSelectedKey(null);
        loadApiKeys();
      } else {
        const data = await response.json();
        console.error('Error deleting API key:', data.detail);
      }
    } catch (error) {
      console.error('Error deleting API key:', error);
    }
  };

  const toggleKeyVisibility = (keyId) => {
    setVisibleKeys(prev => {
      const newSet = new Set(prev);
      if (newSet.has(keyId)) {
        newSet.delete(keyId);
      } else {
        newSet.add(keyId);
      }
      return newSet;
    });
  };

  const copyToClipboard = async (text, keyId) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedKey(keyId);
      setTimeout(() => setCopiedKey(null), 2000);
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
    }
  };

  const getUserName = (userId) => {
    const user = users.find(u => u.id === userId);
    return user ? `${user.first_name} ${user.last_name}` : 'Unknown User';
  };

  const getUserEmail = (userId) => {
    const user = users.find(u => u.id === userId);
    return user ? user.email : 'Unknown';
  };

  const getStatusIcon = (key) => {
    if (!key.is_active) {
      return <XCircle className="h-4 w-4 text-red-500" />;
    }
    if (key.expires_at && new Date(key.expires_at) < new Date()) {
      return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
    }
    return <CheckCircle className="h-4 w-4 text-green-500" />;
  };

  const getStatusText = (key) => {
    if (!key.is_active) return 'Inactive';
    if (key.expires_at && new Date(key.expires_at) < new Date()) return 'Expired';
    return 'Active';
  };

  const getStatusColor = (key) => {
    if (!key.is_active) return 'text-red-600';
    if (key.expires_at && new Date(key.expires_at) < new Date()) return 'text-yellow-600';
    return 'text-green-600';
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatKeyDisplay = (key) => {
    if (visibleKeys.has(key.id)) {
      // Use full_key if available (only on creation), otherwise show partial
      return key.full_key || `sk-${key.key_prefix}.${'•'.repeat(32)}`;
    }
    return `sk-${key.key_prefix}.${'•'.repeat(32)}`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">API Key Management</h2>
          <p className="text-slate-600">Generate and manage API keys for users</p>
        </div>
        <button
          onClick={handleCreateKey}
          className="bg-sky-600 text-white px-4 py-2 rounded-lg hover:bg-sky-700 transition-colors flex items-center space-x-2"
        >
          <Plus className="h-4 w-4" />
          <span>Generate Key</span>
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search API keys..."
              value={searchTerm}
              onChange={handleSearch}
              className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
            />
          </div>
          
          <select
            value={userFilter}
            onChange={handleUserFilter}
            className="px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
          >
            <option value="">All Users</option>
            {users.map(user => (
              <option key={user.id} value={user.id}>
                {user.first_name} {user.last_name} ({user.email})
              </option>
            ))}
          </select>
          
          <div className="text-sm text-slate-600 flex items-center">
            <Key className="h-4 w-4 mr-2" />
            {totalKeys} total keys
          </div>
        </div>
      </div>

      {/* API Keys Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sky-600 mx-auto"></div>
            <p className="mt-2 text-slate-600">Loading API keys...</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto w-full">
              <table className="min-w-full divide-y divide-slate-200 w-full">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Key Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      API Key
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Created
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Expires
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-200">
                  {apiKeys.map((key) => (
                    <tr key={key.id} className="hover:bg-slate-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <Key className="h-4 w-4 text-slate-400 mr-2" />
                          <span className="text-sm font-medium text-slate-900">{key.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <User className="h-4 w-4 text-slate-400 mr-2" />
                          <div>
                            <div className="text-sm font-medium text-slate-900">
                              {getUserName(key.user_id)}
                            </div>
                            <div className="text-sm text-slate-500">
                              {getUserEmail(key.user_id)}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-2">
                          <code className="text-sm font-mono text-slate-600 bg-slate-100 px-2 py-1 rounded">
                            {formatKeyDisplay(key)}
                          </code>
                          <button
                            onClick={() => toggleKeyVisibility(key.id)}
                            className="text-slate-400 hover:text-slate-600"
                            title={visibleKeys.has(key.id) ? 'Hide key' : 'Show key'}
                          >
                            {visibleKeys.has(key.id) ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </button>
                          <button
                            onClick={() => copyToClipboard(formatKeyDisplay(key), key.id)}
                            className="text-slate-400 hover:text-slate-600"
                            title="Copy key"
                          >
                            {copiedKey === key.id ? (
                              <CheckCircle className="h-4 w-4 text-green-500" />
                            ) : (
                              <Copy className="h-4 w-4" />
                            )}
                          </button>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-2">
                          {getStatusIcon(key)}
                          <span className={`text-sm font-medium ${getStatusColor(key)}`}>
                            {getStatusText(key)}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                        {formatDate(key.created_at)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                        {key.expires_at ? formatDate(key.expires_at) : 'Never'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => handleDeleteKey(key)}
                            className="text-red-600 hover:text-red-900 p-1"
                            title="Delete Key"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-slate-200">
                <div className="flex-1 flex justify-between sm:hidden">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="relative inline-flex items-center px-4 py-2 border border-slate-300 text-sm font-medium rounded-md text-slate-700 bg-white hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="ml-3 relative inline-flex items-center px-4 py-2 border border-slate-300 text-sm font-medium rounded-md text-slate-700 bg-white hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
                <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm text-slate-700">
                      Showing page <span className="font-medium">{currentPage}</span> of{' '}
                      <span className="font-medium">{totalPages}</span>
                    </p>
                  </div>
                  <div>
                    <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                      <button
                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                        className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-slate-300 bg-white text-sm font-medium text-slate-500 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <ChevronLeft className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                        disabled={currentPage === totalPages}
                        className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-slate-300 bg-white text-sm font-medium text-slate-500 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
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

      {/* Create API Key Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-slate-900">Generate API Key</h3>
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  setErrors({});
                }}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  User *
                </label>
                <select
                  name="user_id"
                  value={formData.user_id}
                  onChange={handleFormChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 ${
                    errors.user_id ? 'border-red-500' : 'border-slate-300'
                  }`}
                >
                  <option value="">Select a user</option>
                  {users.map(user => (
                    <option key={user.id} value={user.id}>
                      {user.first_name} {user.last_name} ({user.email})
                    </option>
                  ))}
                </select>
                {errors.user_id && <p className="text-red-500 text-xs mt-1">{errors.user_id}</p>}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Key Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleFormChange}
                  placeholder="e.g., Production API Key"
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 ${
                    errors.name ? 'border-red-500' : 'border-slate-300'
                  }`}
                />
                {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Expires In (Days)
                </label>
                <input
                  type="number"
                  name="expires_in_days"
                  value={formData.expires_in_days}
                  onChange={handleFormChange}
                  placeholder="Leave empty for no expiration"
                  min="1"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                />
                <p className="text-xs text-slate-500 mt-1">
                  Leave empty for no expiration
                </p>
              </div>
              
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <div className="flex items-start">
                  <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5 mr-2" />
                  <div className="text-sm text-yellow-800">
                    <p className="font-medium">Important:</p>
                    <p>The API key will be shown only once after generation. Make sure to copy and save it securely.</p>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateModal(false);
                    setErrors({});
                  }}
                  className="px-4 py-2 text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700 transition-colors"
                >
                  Generate Key
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedKey && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex items-center space-x-3 mb-4">
              <div className="h-10 w-10 rounded-full bg-red-100 flex items-center justify-center">
                <Trash2 className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-slate-900">Delete API Key</h3>
                <p className="text-sm text-slate-600">This action cannot be undone.</p>
              </div>
            </div>
            
            <p className="text-slate-700 mb-6">
              Are you sure you want to delete the API key <strong>"{selectedKey.name}"</strong>? 
              This will immediately revoke access for any applications using this key.
            </p>
            
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Delete Key
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ApiKeyManagement;
