import React, { useState, useEffect, useCallback } from 'react';
import { 
  FolderOpen, 
  File, 
  Upload, 
  Download, 
  Trash2, 
  Search, 
  FolderPlus,
  Eye,
  ArrowLeft,
  Home,
  Image,
  FileText,
  Video,
  Archive,
  FileSpreadsheet,
  X
} from 'lucide-react';
import { apiGet, apiPost, apiDelete } from '../utils/api';

const FileRepository = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [currentPath, setCurrentPath] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [fileTypeFilter, setFileTypeFilter] = useState('all');
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, totalPages: 0 });
  const [stats, setStats] = useState({ totalFiles: 0, totalFolders: 0, totalSize: 0 });
  const [showCreateFolderModal, setShowCreateFolderModal] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);

  const loadRepository = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        path: currentPath,
        page: pagination.page,
        limit: pagination.limit,
        ...(searchQuery && { search: searchQuery }),
        ...(fileTypeFilter !== 'all' && { file_type: fileTypeFilter })
      });

      const response = await apiGet(`/files/repository?${params}`);
      setItems(response.items || []);
      setPagination(response.pagination || {});
      setStats(response.statistics || {});
    } catch (error) {
      console.error('Error loading repository:', error);
    } finally {
      setLoading(false);
    }
  }, [currentPath, pagination.page, pagination.limit, searchQuery, fileTypeFilter]);

  useEffect(() => {
    loadRepository();
  }, [loadRepository]);

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('folder_path', currentPath);

      const response = await fetch('/api/files/repository/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        },
        body: formData
      });

      if (!response.ok) {
        throw new Error(`Upload failed with status ${response.status}`);
      }

      const result = await response.json();
      console.log('Upload successful:', result);
      loadRepository();
    } catch (error) {
      console.error('Error uploading file:', error);
      alert('Error uploading file: ' + error.message);
    } finally {
      setUploading(false);
    }
  };

  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) return;

    try {
      const params = new URLSearchParams({
        folder_name: newFolderName,
        parent_path: currentPath
      });
      
      await apiPost(`/files/repository/create-folder?${params}`);
      setShowCreateFolderModal(false);
      setNewFolderName('');
      loadRepository();
    } catch (error) {
      console.error('Error creating folder:', error);
      alert('Error creating folder: ' + error.message);
    }
  };

  const handleDelete = async (item) => {
    if (!window.confirm(`Are you sure you want to delete ${item.is_directory ? 'folder' : 'file'} "${item.name}"?`)) {
      return;
    }

    try {
      await apiDelete(`/files/repository/delete/${item.path}`);
      loadRepository();
    } catch (error) {
      console.error('Error deleting item:', error);
      alert('Error deleting item: ' + error.message);
    }
  };

  const handleDownload = (item) => {
    const downloadUrl = `http://localhost:8000/api/files/repository/download/${item.path}`;
    console.log('Downloading:', downloadUrl);
    window.open(downloadUrl, '_blank');
  };

  const handlePreview = async (item) => {
    setSelectedFile(item);
    setShowPreviewModal(true);
    
    // Create a blob URL for the file
    try {
      const response = await fetch(`http://localhost:8000/api/files/repository/public-preview/${item.path}`);
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      setPreviewUrl(url);
    } catch (error) {
      console.error('Error loading preview:', error);
      // Fallback to direct URL
      setPreviewUrl(`http://localhost:8000/api/files/repository/public-preview/${item.path}`);
    }
  };

  const navigateToFolder = (folderPath) => {
    setCurrentPath(folderPath);
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const navigateUp = () => {
    const parentPath = currentPath.split('/').slice(0, -1).join('/');
    setCurrentPath(parentPath);
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const getFileIcon = (item) => {
    if (item.is_directory) return <FolderOpen className="h-5 w-5 text-blue-500" />;
    
    const ext = item.extension?.toLowerCase();
    if (['.jpg', '.jpeg', '.png', '.gif'].includes(ext)) return <Image className="h-5 w-5 text-green-500" />;
    if (['.pdf'].includes(ext)) return <FileText className="h-5 w-5 text-red-500" />;
    if (['.mp4', '.avi', '.mov'].includes(ext)) return <Video className="h-5 w-5 text-purple-500" />;
    if (['.zip', '.rar', '.7z'].includes(ext)) return <Archive className="h-5 w-5 text-orange-500" />;
    if (['.xlsx', '.xls', '.csv'].includes(ext)) return <FileSpreadsheet className="h-5 w-5 text-green-600" />;
    return <File className="h-5 w-5 text-gray-500" />;
  };

  const formatFileSize = (sizeInMB) => {
    if (!sizeInMB || isNaN(sizeInMB)) return '0 MB';
    if (sizeInMB < 1) return `${(sizeInMB * 1024).toFixed(1)} KB`;
    return `${sizeInMB.toFixed(1)} MB`;
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold text-gray-900">File Repository</h1>
          <div className="flex space-x-2">
            <button
              onClick={() => setShowCreateFolderModal(true)}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <FolderPlus className="h-4 w-4 mr-2" />
              New Folder
            </button>
            <label className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 cursor-pointer">
              <Upload className="h-4 w-4 mr-2" />
              Upload File
              <input
                type="file"
                className="hidden"
                onChange={handleFileUpload}
                disabled={uploading}
              />
            </label>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex items-center space-x-2 mb-4">
          <button
            onClick={() => setCurrentPath('')}
            className="flex items-center px-3 py-1 text-sm text-gray-600 hover:text-gray-900"
          >
            <Home className="h-4 w-4 mr-1" />
            Home
          </button>
          {currentPath && (
            <>
              <span className="text-gray-400">/</span>
              <button
                onClick={navigateUp}
                className="flex items-center px-3 py-1 text-sm text-gray-600 hover:text-gray-900"
              >
                <ArrowLeft className="h-4 w-4 mr-1" />
                Up
              </button>
            </>
          )}
        </div>

        {/* Search and Filters */}
        <div className="flex space-x-4 mb-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search files..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          <select
            value={fileTypeFilter}
            onChange={(e) => setFileTypeFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Files</option>
            <option value="document">Documents</option>
            <option value="image">Images</option>
            <option value="video">Videos</option>
            <option value="archive">Archives</option>
          </select>
          <button
            onClick={() => setPagination(prev => ({ ...prev, limit: prev.limit === 1000 ? 20 : 1000 }))}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm"
          >
            {pagination.limit === 1000 ? 'Show Paginated' : 'Show All'}
          </button>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">{stats?.totalFiles || 0}</div>
            <div className="text-sm text-blue-800">Total Files</div>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-green-600">{stats?.totalFolders || 0}</div>
            <div className="text-sm text-green-800">Total Folders</div>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg">
            <div className="text-2xl font-bold text-purple-600">{formatFileSize(stats?.totalSize)}</div>
            <div className="text-sm text-purple-800">Total Size</div>
          </div>
        </div>
      </div>

      {/* File List */}
      <div className="bg-white rounded-lg shadow">
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading files...</p>
          </div>
        ) : items.length === 0 ? (
          <div className="p-8 text-center">
            <FolderOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No files found in this directory</p>
            {currentPath && (
              <button
                onClick={navigateUp}
                className="mt-2 text-blue-600 hover:text-blue-800"
              >
                Go back to parent directory
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Size</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Modified</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {items.map((item, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {getFileIcon(item)}
                        <span className="ml-3 text-sm font-medium text-gray-900">
                          {item.name}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {item.is_directory ? 'Folder' : item.file_type || 'File'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {item.is_directory ? '-' : formatFileSize(item.size)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(item.modified_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        {item.is_directory ? (
                          <button
                            onClick={() => navigateToFolder(item.path)}
                            className="text-blue-600 hover:text-blue-900"
                            title="Open Folder"
                          >
                            <FolderOpen className="h-4 w-4" />
                          </button>
                        ) : (
                          <>
                            <button
                              onClick={() => handlePreview(item)}
                              className="text-green-600 hover:text-green-900"
                              title="Preview"
                            >
                              <Eye className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDownload(item)}
                              className="text-blue-600 hover:text-blue-900"
                              title="Download"
                            >
                              <Download className="h-4 w-4" />
                            </button>
                          </>
                        )}
                        <button
                          onClick={() => handleDelete(item)}
                          className="text-red-600 hover:text-red-900"
                          title="Delete"
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
        )}
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="mt-6 flex items-center justify-between">
          <div className="text-sm text-gray-700">
            Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} results
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
              disabled={pagination.page <= 1}
              className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <span className="px-3 py-2 text-sm font-medium text-gray-700 bg-blue-50 border border-blue-300 rounded-md">
              {pagination.page} of {pagination.totalPages}
            </span>
            <button
              onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
              disabled={pagination.page >= pagination.totalPages}
              className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Create Folder Modal */}
      {showCreateFolderModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Create New Folder</h3>
            <input
              type="text"
              placeholder="Folder name"
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent mb-4"
            />
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setShowCreateFolderModal(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateFolder}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Preview Modal */}
      {showPreviewModal && selectedFile && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-4/5 h-4/5 flex flex-col">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-lg font-medium text-gray-900">{selectedFile.name}</h3>
              <button
                onClick={() => {
                  setShowPreviewModal(false);
                  if (previewUrl && previewUrl.startsWith('blob:')) {
                    URL.revokeObjectURL(previewUrl);
                  }
                  setPreviewUrl(null);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            <div className="flex-1 p-4">
              {selectedFile.extension === '.pdf' ? (
                <iframe
                  src={previewUrl}
                  className="w-full h-full border-0"
                  title={`Preview of ${selectedFile.name}`}
                />
              ) : ['jpg', 'jpeg', 'png', 'gif'].includes(selectedFile.extension?.toLowerCase()) ? (
                <img
                  src={previewUrl}
                  alt={selectedFile.name}
                  className="w-full h-full object-contain"
                />
              ) : (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 mb-4">Preview not available for this file type</p>
                    <button
                      onClick={() => {
                        const downloadUrl = `http://localhost:8000/api/files/repository/download/${selectedFile.path}`;
                        window.open(downloadUrl, '_blank');
                      }}
                      className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                    >
                      Download File
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FileRepository;