import React, { useState } from 'react';
import { 
  Calendar, 
  MapPin, 
  Building, 
  User, 
  Banknote, 
  Shield, 
  FileText, 
  Eye, 
  Download,
  Star,
  Clock,
  CheckCircle,
  AlertCircle,
  ExternalLink
} from 'lucide-react';

const GazetteEntry = ({ gazette, showActions = false, onEdit, onDelete, onView }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const gazetteTypes = {
    LEGAL_NOTICE: { label: 'Legal Notice', icon: FileText, color: 'blue' },
    BUSINESS_NOTICE: { label: 'Business Notice', icon: Building, color: 'green' },
    PROPERTY_NOTICE: { label: 'Property Notice', icon: MapPin, color: 'orange' },
    PERSONAL_NOTICE: { label: 'Personal Notice', icon: User, color: 'purple' },
    REGULATORY_NOTICE: { label: 'Regulatory Notice', icon: Shield, color: 'red' },
    COURT_NOTICE: { label: 'Court Notice', icon: FileText, color: 'blue' },
    BANKRUPTCY_NOTICE: { label: 'Bankruptcy Notice', icon: Banknote, color: 'red' },
    PROBATE_NOTICE: { label: 'Probate Notice', icon: FileText, color: 'gray' },
    OTHER: { label: 'Other', icon: FileText, color: 'gray' }
  };

  const statusOptions = {
    DRAFT: { label: 'Draft', icon: Clock, color: 'yellow' },
    PUBLISHED: { label: 'Published', icon: CheckCircle, color: 'green' },
    ARCHIVED: { label: 'Archived', icon: FileText, color: 'gray' },
    CANCELLED: { label: 'Cancelled', icon: AlertCircle, color: 'red' }
  };

  const priorityOptions = {
    LOW: { label: 'Low', color: 'green' },
    MEDIUM: { label: 'Medium', color: 'yellow' },
    HIGH: { label: 'High', color: 'orange' },
    URGENT: { label: 'Urgent', color: 'red' }
  };

  const typeInfo = gazetteTypes[gazette.gazette_type] || gazetteTypes.OTHER;
  const statusInfo = statusOptions[gazette.status] || statusOptions.DRAFT;
  const priorityInfo = priorityOptions[gazette.priority] || priorityOptions.MEDIUM;

  const TypeIcon = typeInfo.icon;
  const StatusIcon = statusInfo.icon;

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-200 hover:shadow-lg transition-shadow">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center mb-2">
              <TypeIcon className={`h-5 w-5 text-${typeInfo.color}-600 mr-2`} />
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-${typeInfo.color}-100 text-${typeInfo.color}-800`}>
                {typeInfo.label}
              </span>
              {gazette.is_featured && (
                <Star className="h-4 w-4 text-yellow-500 ml-2" />
              )}
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {gazette.title}
            </h3>
            {gazette.description && (
              <p className="text-gray-600 text-sm mb-3">
                {gazette.description}
              </p>
            )}
          </div>
          <div className="flex items-center space-x-2 ml-4">
            <div className="flex items-center">
              <StatusIcon className={`h-4 w-4 text-${statusInfo.color}-600 mr-1`} />
              <span className={`text-xs text-${statusInfo.color}-600`}>
                {statusInfo.label}
              </span>
            </div>
            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-${priorityInfo.color}-100 text-${priorityInfo.color}-800`}>
              {priorityInfo.label}
            </span>
          </div>
        </div>

        {/* Metadata */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-4 text-sm text-gray-600">
          <div className="flex items-center">
            <Calendar className="h-4 w-4 mr-2" />
            <span>Published: {formatDate(gazette.publication_date)}</span>
          </div>
          {gazette.effective_date && (
            <div className="flex items-center">
              <Clock className="h-4 w-4 mr-2" />
              <span>Effective: {formatDate(gazette.effective_date)}</span>
            </div>
          )}
          {gazette.jurisdiction && (
            <div className="flex items-center">
              <MapPin className="h-4 w-4 mr-2" />
              <span>{gazette.jurisdiction}</span>
            </div>
          )}
          {gazette.source && (
            <div className="flex items-center">
              <FileText className="h-4 w-4 mr-2" />
              <span>{gazette.source}</span>
            </div>
          )}
        </div>

        {/* Reference Numbers */}
        {(gazette.reference_number || gazette.gazette_number) && (
          <div className="mt-3 text-sm text-gray-600">
            {gazette.reference_number && (
              <span className="mr-4">Ref: {gazette.reference_number}</span>
            )}
            {gazette.gazette_number && (
              <span>Gazette: {gazette.gazette_number}</span>
            )}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-6">
        {gazette.summary && (
          <div className="mb-4">
            <h4 className="text-sm font-medium text-gray-900 mb-2">Summary</h4>
            <p className="text-gray-700 text-sm">{gazette.summary}</p>
          </div>
        )}

        <div>
          <h4 className="text-sm font-medium text-gray-900 mb-2">Content</h4>
          <div className="text-gray-700 text-sm">
            {isExpanded ? (
              <div className="whitespace-pre-wrap">{gazette.content}</div>
            ) : (
              <div className="line-clamp-3">
                {gazette.content.length > 200 
                  ? `${gazette.content.substring(0, 200)}...` 
                  : gazette.content
                }
              </div>
            )}
          </div>
          {gazette.content.length > 200 && (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="mt-2 text-blue-600 hover:text-blue-800 text-sm font-medium"
            >
              {isExpanded ? 'Show Less' : 'Read More'}
            </button>
          )}
        </div>

        {/* Keywords and Tags */}
        {(gazette.keywords?.length > 0 || gazette.tags?.length > 0) && (
          <div className="mt-4">
            {gazette.keywords?.length > 0 && (
              <div className="mb-2">
                <span className="text-xs font-medium text-gray-500">Keywords: </span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {gazette.keywords.map((keyword, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800"
                    >
                      {keyword}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {gazette.tags?.length > 0 && (
              <div>
                <span className="text-xs font-medium text-gray-500">Tags: </span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {gazette.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-800"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Document Attachment */}
        {gazette.document_url && (
          <div className="mt-4 p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <FileText className="h-5 w-5 text-gray-500 mr-2" />
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {gazette.document_filename || 'Document'}
                  </p>
                  {gazette.document_size && (
                    <p className="text-xs text-gray-500">
                      {(gazette.document_size / 1024).toFixed(1)} KB
                    </p>
                  )}
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => window.open(gazette.document_url, '_blank')}
                  className="flex items-center px-3 py-1 text-sm text-blue-600 hover:text-blue-800 border border-blue-300 rounded-md hover:bg-blue-50"
                >
                  <ExternalLink className="h-4 w-4 mr-1" />
                  View
                </button>
                <button
                  onClick={() => {
                    const link = document.createElement('a');
                    link.href = gazette.document_url;
                    link.download = gazette.document_filename || 'document';
                    link.click();
                  }}
                  className="flex items-center px-3 py-1 text-sm text-gray-600 hover:text-gray-800 border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  <Download className="h-4 w-4 mr-1" />
                  Download
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="px-6 py-3 bg-gray-50 border-t border-gray-200">
        <div className="flex items-center justify-between">
          <div className="text-xs text-gray-500">
            Created: {formatDateTime(gazette.created_at)}
            {gazette.updated_at && gazette.updated_at !== gazette.created_at && (
              <span className="ml-2">Updated: {formatDateTime(gazette.updated_at)}</span>
            )}
          </div>
          {showActions && (
            <div className="flex items-center space-x-2">
              {onView && (
                <button
                  onClick={() => onView(gazette)}
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                >
                  <Eye className="h-4 w-4" />
                </button>
              )}
              {onEdit && (
                <button
                  onClick={() => onEdit(gazette)}
                  className="text-gray-600 hover:text-gray-800 text-sm font-medium"
                >
                  Edit
                </button>
              )}
              {onDelete && (
                <button
                  onClick={() => onDelete(gazette)}
                  className="text-red-600 hover:text-red-800 text-sm font-medium"
                >
                  Delete
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GazetteEntry;
