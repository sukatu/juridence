import React, { useState } from 'react';
import { X, CheckCircle, AlertCircle } from 'lucide-react';

const RequestDetailsModal = ({ isOpen, onClose, caseData, entityType, entityName, isProfileRequest = false }) => {
  const [requestType, setRequestType] = useState(isProfileRequest ? 'profile_information' : 'case_details');
  const [message, setMessage] = useState('');
  const [requesterName, setRequesterName] = useState('');
  const [requesterEmail, setRequesterEmail] = useState('');
  const [requesterPhone, setRequesterPhone] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null); // 'success', 'error', null

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus(null);

    try {
      const requestData = {
        request_type: requestType,
        entity_type: entityType.toLowerCase(),
        entity_id: caseData?.id || null,
        entity_name: entityName,
        case_id: caseData?.id || null,
        case_suit_number: caseData?.suit_reference_number || null,
        message: message,
        requester_name: requesterName,
        requester_email: requesterEmail,
        requester_phone: requesterPhone,
        priority: 'medium',
        is_urgent: false
      };

      const response = await fetch('/api/request-details/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData)
      });

      if (response.ok) {
        setSubmitStatus('success');
        // Reset form
        setMessage('');
        setRequesterName('');
        setRequesterEmail('');
        setRequesterPhone('');
        // Close modal after 2 seconds
        setTimeout(() => {
          onClose();
          setSubmitStatus(null);
        }, 2000);
      } else {
        setSubmitStatus('error');
      }
    } catch (error) {
      console.error('Error submitting request:', error);
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    setRequestType(isProfileRequest ? 'profile_information' : 'case_details');
    setMessage('');
    setRequesterName('');
    setRequesterEmail('');
    setRequesterPhone('');
    setSubmitStatus(null);
    onClose();
  };

  // Get request type options based on whether it's a profile or case request
  const getRequestTypeOptions = () => {
    if (isProfileRequest) {
      return [
        { value: 'profile_information', label: 'Profile Information' },
        { value: 'contact_details', label: 'Contact Details' },
        { value: 'financial_information', label: 'Financial Information' },
        { value: 'legal_history', label: 'Legal History' },
        { value: 'management_details', label: 'Management Details' },
        { value: 'other', label: 'Other' }
      ];
    } else {
      return [
        { value: 'case_details', label: 'Case Details' },
        { value: 'legal_documents', label: 'Legal Documents' },
        { value: 'court_records', label: 'Court Records' },
        { value: 'financial_information', label: 'Financial Information' },
        { value: 'other', label: 'Other' }
      ];
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">
            {isProfileRequest ? 'Request Profile Information' : 'Request Case Details'}
          </h2>
          <button
            onClick={handleCancel}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Success/Error Messages */}
          {submitStatus === 'success' && (
            <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <span className="text-green-800 text-sm font-medium">
                Request submitted successfully! You will be contacted soon.
              </span>
            </div>
          )}
          
          {submitStatus === 'error' && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-red-600" />
              <span className="text-red-800 text-sm font-medium">
                Failed to submit request. Please try again.
              </span>
            </div>
          )}

          {/* Request Type */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Request Type
            </label>
            <select
              value={requestType}
              onChange={(e) => setRequestType(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              disabled={isSubmitting}
            >
              {getRequestTypeOptions().map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Requester Information */}
          <div className="mb-4">
            <h3 className="text-sm font-medium text-gray-700 mb-3">Your Information</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Name *
                </label>
                <input
                  type="text"
                  value={requesterName}
                  onChange={(e) => setRequesterName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                  placeholder="Your full name"
                  required
                  disabled={isSubmitting}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Email *
                </label>
                <input
                  type="email"
                  value={requesterEmail}
                  onChange={(e) => setRequesterEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                  placeholder="your.email@example.com"
                  required
                  disabled={isSubmitting}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Phone
                </label>
                <input
                  type="tel"
                  value={requesterPhone}
                  onChange={(e) => setRequesterPhone(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                  placeholder="+1234567890"
                  disabled={isSubmitting}
                />
              </div>
            </div>
          </div>

          {/* Information Section */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {isProfileRequest ? 'Profile Information' : 'Case Information'}
            </label>
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="space-y-2 text-sm">
                {isProfileRequest ? (
                  <>
                    <div>
                      <span className="font-semibold text-gray-900">{entityType}:</span> {entityName || 'N/A'}
                    </div>
                    <div>
                      <span className="font-semibold text-gray-900">Request Type:</span> {requestType}
                    </div>
                  </>
                ) : (
                  <>
                    <div>
                      <span className="font-semibold text-gray-900">Case:</span> {caseData?.suit_reference_number || 'N/A'}
                    </div>
                    <div>
                      <span className="font-semibold text-gray-900">Title:</span> {caseData?.title || 'N/A'}
                    </div>
                    <div>
                      <span className="font-semibold text-gray-900">{entityType}:</span> {entityName || 'N/A'}
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Additional Message */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Additional Message (Optional)
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Please specify any additional information you need..."
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={handleCancel}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              disabled={isSubmitting || !requesterName || !requesterEmail}
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Submitting...
                </>
              ) : (
                'Submit Request'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RequestDetailsModal;
