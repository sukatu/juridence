import React, { useState, useEffect } from 'react';
import AdminHeader from './AdminHeader';
import { apiGet, apiPut } from '../../utils/api';
import { showSuccess, handleApiError, confirmAction } from '../../utils/errorHandler';

const SearchRequestDetails = ({ request, onBack, userInfo, onNavigate, onLogout, onStartInvestigation, onMarkCompleted }) => {
  const [requestDetails, setRequestDetails] = useState(request);
  const [loading, setLoading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    // Load full request details if we only have a summary
    const loadFullDetails = async () => {
      if (request?.id && !request.message) {
        try {
          setLoading(true);
          const fullRequest = await apiGet(`/request-details/${request.id}`);
          setRequestDetails(fullRequest);
        } catch (error) {
          console.error('Error loading request details:', error);
          if (error.status !== 401) { // Don't show error for auth failures
            handleApiError(error, 'load request details');
          }
        } finally {
          setLoading(false);
        }
      } else {
        setRequestDetails(request);
      }
    };
    loadFullDetails();
  }, [request]);

  const getStatusClass = (status) => {
    switch (status?.toLowerCase()) {
      case 'pending':
        return 'text-[#DEBB0C]';
      case 'in_progress':
      case 'in-progress':
        return 'text-blue-500';
      case 'completed':
        return 'text-emerald-500';
      case 'rejected':
      case 'cancelled':
        return 'text-red-500';
      default:
        return 'text-gray-600';
    }
  };

  const getStatusLabel = (status) => {
    if (!status) return 'Unknown';
    const statusMap = {
      'pending': 'Pending',
      'in_progress': 'In Progress',
      'in-progress': 'In Progress',
      'completed': 'Completed',
      'rejected': 'Rejected',
      'cancelled': 'Cancelled'
    };
    return statusMap[status.toLowerCase()] || status;
  };

  const getRequestTypeLabel = (type) => {
    if (!type) return 'Other';
    const typeMap = {
      'case_details': 'Case history research',
      'legal_documents': 'Legal Documents',
      'court_records': 'Court Records',
      'financial_information': 'Financial Information',
      'profile_information': 'Person verification',
      'contact_details': 'Contact Details',
      'management_details': 'Management Details',
      'legal_history': 'Legal History',
      'other': 'Other'
    };
    return typeMap[type?.toLowerCase()] || type;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    } catch (e) {
      return dateString;
    }
  };

  const handleStartInvestigation = async () => {
    if (!requestDetails?.id) {
      handleApiError({ message: 'Request ID is missing' }, 'start investigation');
      return;
    }
    
    try {
      setIsProcessing(true);
      if (onStartInvestigation) {
        await onStartInvestigation(requestDetails.id);
      } else {
        await apiPut(`/request-details/${requestDetails.id}`, { 
          status: 'in_progress',
          assigned_to: userInfo?.username || userInfo?.full_name || 'Current User'
        });
        showSuccess('Investigation started successfully');
      }
      
      // Reload request details
      try {
        const updatedRequest = await apiGet(`/request-details/${requestDetails.id}`);
        setRequestDetails(updatedRequest);
      } catch (reloadError) {
        console.error('Error reloading request:', reloadError);
        // Don't show error for reload failure, just log it
      }
    } catch (error) {
      handleApiError(error, 'start investigation');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleMarkCompleted = async () => {
    if (!requestDetails?.id) {
      handleApiError({ message: 'Request ID is missing' }, 'mark request as completed');
      return;
    }
    
    confirmAction(
      'Are you sure you want to mark this request as completed?',
      async () => {
        try {
          setIsProcessing(true);
          if (onMarkCompleted) {
            await onMarkCompleted(requestDetails.id);
          } else {
            await apiPut(`/request-details/${requestDetails.id}`, { 
              status: 'completed',
              completed_at: new Date().toISOString()
            });
            showSuccess('Request marked as completed');
          }
          
          // Reload request details
          try {
            const updatedRequest = await apiGet(`/request-details/${requestDetails.id}`);
            setRequestDetails(updatedRequest);
          } catch (reloadError) {
            console.error('Error reloading request:', reloadError);
            // Don't show error for reload failure, just log it
          }
        } catch (error) {
          handleApiError(error, 'mark request as completed');
        } finally {
          setIsProcessing(false);
        }
      }
    );
  };

  if (loading) {
    return (
      <div className="bg-[#F7F8FA] min-h-screen w-full">
        <AdminHeader userInfo={userInfo} onNavigate={onNavigate} onLogout={onLogout} />
        <div className="flex justify-center items-center py-12">
          <span className="text-gray-500">Loading request details...</span>
        </div>
      </div>
    );
  }

  if (!requestDetails) {
    return (
      <div className="bg-[#F7F8FA] min-h-screen w-full">
        <AdminHeader userInfo={userInfo} onNavigate={onNavigate} onLogout={onLogout} />
        <div className="flex justify-center items-center py-12">
          <span className="text-gray-500">Request not found</span>
        </div>
      </div>
    );
  }

  const requestId = requestDetails.id ? `REQ${requestDetails.id.toString().padStart(4, '0')}` : 'N/A';
  const entityName = requestDetails.entity_name || requestDetails.case_suit_number || 'Untitled Request';
  const categoryLabel = getRequestTypeLabel(requestDetails.request_type);

  return (
    <div className="bg-[#F7F8FA] min-h-screen w-full">
      {/* Header */}
      <AdminHeader userInfo={userInfo} onNavigate={onNavigate} onLogout={onLogout} />

      {/* Main Content */}
      <div className="px-6 w-full">
        <div className="flex flex-col items-start w-full bg-white rounded-lg">
          {/* Breadcrumb and Back Button */}
          <div className="flex items-start mt-4 mb-6 px-6">
            <span className="text-[#525866] text-xs mr-1.5 whitespace-nowrap">SEARCH REQUESTS</span>
            <img
              src="https://storage.googleapis.com/tagjs-prod.appspot.com/v1/Iq8V0MifpP/056pulsv_expires_30_days.png"
              className="w-4 h-4 mr-1 object-fill flex-shrink-0"
            />
            <span className="text-[#070810] text-sm whitespace-nowrap">{entityName}</span>
          </div>

          {/* Title Section */}
          <div className="flex items-start w-full mb-6 px-6 gap-3">
            <button onClick={onBack} className="cursor-pointer hover:opacity-70">
              <img
                src="https://storage.googleapis.com/tagjs-prod.appspot.com/v1/Iq8V0MifpP/1uzen6j1_expires_30_days.png"
                className="w-10 h-10 object-fill flex-shrink-0"
              />
            </button>
            <span className="text-[#040E1B] text-2xl whitespace-nowrap">
              {entityName} - {categoryLabel}
            </span>
          </div>

          {/* Key Information Cards */}
          <div className="flex items-start w-full bg-[#F4F6F9] py-4 px-8 mb-6 mx-6 rounded-lg gap-3">
            <div className="flex flex-col items-start flex-1 py-2 gap-2">
              <span className="text-[#868C98] text-xs whitespace-nowrap">Request ID</span>
              <span className="text-[#022658] text-base whitespace-nowrap">{requestId}</span>
            </div>
            <div className="flex flex-col items-start flex-1 py-2 gap-2">
              <span className="text-[#868C98] text-xs whitespace-nowrap">Submitted Date</span>
              <span className="text-[#022658] text-base whitespace-nowrap">{formatDate(requestDetails.created_at)}</span>
            </div>
            <div className="flex flex-col items-start flex-1 py-2 gap-2">
              <span className="text-[#868C98] text-xs whitespace-nowrap">To be Completed</span>
              <span className="text-[#022658] text-base whitespace-nowrap">
                {requestDetails.completed_at ? formatDate(requestDetails.completed_at) : 'N/A'}
              </span>
            </div>
            <div className="flex flex-col items-start flex-1 py-2 gap-2">
              <span className="text-[#868C98] text-xs whitespace-nowrap">Assigned To</span>
              <span className="text-[#022658] text-base whitespace-nowrap">{requestDetails.assigned_to || '-'}</span>
            </div>
            <div className="flex flex-col items-start flex-1 py-2 gap-2">
              <span className="text-[#868C98] text-xs whitespace-nowrap">Status</span>
              <span className={`text-base whitespace-nowrap ${getStatusClass(requestDetails.status)}`}>
                {getStatusLabel(requestDetails.status)}
              </span>
            </div>
          </div>

          {/* Description */}
          {requestDetails.message && (
            <div className="flex flex-col items-start w-full mb-6 px-6 gap-2">
              <span className="text-[#040E1B] text-base whitespace-nowrap">Description</span>
              <span className="text-[#040E1B] text-base whitespace-pre-wrap">{requestDetails.message}</span>
            </div>
          )}

          {/* Specific Questions - Could be in message or separate field */}
          {requestDetails.message && requestDetails.message.includes('?') && (
            <div className="flex flex-col items-start w-full mb-6 px-6 gap-2">
              <span className="text-[#040E1B] text-base whitespace-nowrap">Specific questions</span>
              <div className="text-[#040E1B] text-base">
                {requestDetails.message.split('?').filter(q => q.trim()).map((question, idx) => (
                  <p key={idx}>{question.trim()}?</p>
                ))}
              </div>
            </div>
          )}

          {/* Entity Information */}
          <div className="flex flex-col items-start w-full mb-6 px-6 gap-2">
            <span className="text-[#040E1B] text-base whitespace-nowrap">Entity Information</span>
            <div className="text-[#040E1B] text-base space-y-1">
              <p><strong>Type:</strong> {requestDetails.entity_type || 'N/A'}</p>
              <p><strong>Name:</strong> {requestDetails.entity_name || 'N/A'}</p>
              {requestDetails.case_suit_number && (
                <p><strong>Case Suit Number:</strong> {requestDetails.case_suit_number}</p>
              )}
              {requestDetails.priority && (
                <p><strong>Priority:</strong> {requestDetails.priority}</p>
              )}
              {requestDetails.is_urgent && (
                <p><strong>Urgent:</strong> Yes</p>
              )}
            </div>
          </div>

          {/* Admin Notes */}
          {requestDetails.admin_notes && (
            <div className="flex flex-col items-start w-full mb-6 px-6 gap-2">
              <span className="text-[#040E1B] text-base whitespace-nowrap">Admin Notes</span>
              <span className="text-[#040E1B] text-base whitespace-pre-wrap">{requestDetails.admin_notes}</span>
            </div>
          )}

          {/* Response Message */}
          {requestDetails.response_message && (
            <div className="flex flex-col items-start w-full mb-6 px-6 gap-2">
              <span className="text-[#040E1B] text-base whitespace-nowrap">Response Message</span>
              <span className="text-[#040E1B] text-base whitespace-pre-wrap">{requestDetails.response_message}</span>
            </div>
          )}

          {/* Requester Information */}
          <div className="flex flex-col items-start w-full mb-6 px-6 gap-2">
            <span className="text-[#040E1B] text-base whitespace-nowrap">Requester information</span>
            <div className="text-[#040E1B] text-base space-y-1">
              {requestDetails.requester_name && (
                <p className="whitespace-nowrap"><strong>Name:</strong> {requestDetails.requester_name}</p>
              )}
              {requestDetails.requester_phone && (
                <p className="whitespace-nowrap"><strong>Phone:</strong> {requestDetails.requester_phone}</p>
              )}
              {requestDetails.requester_email && (
                <p className="whitespace-nowrap"><strong>Email:</strong> {requestDetails.requester_email}</p>
              )}
              {requestDetails.requester_organization && (
                <p className="whitespace-nowrap"><strong>Organization:</strong> {requestDetails.requester_organization}</p>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-start w-full mb-[188px] px-6 gap-10">
            <button
              onClick={handleMarkCompleted}
              disabled={isProcessing || requestDetails.status === 'completed'}
              className="flex flex-col items-center flex-1 py-[18px] rounded-lg border-2 border-solid border-[#022658] hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ boxShadow: '0px 4px 4px #050F1C1A' }}
            >
              <span className="text-[#022658] text-base font-bold whitespace-nowrap">
                {isProcessing ? 'Processing...' : 'Mark as completed'}
              </span>
            </button>
            <button
              onClick={handleStartInvestigation}
              disabled={isProcessing || requestDetails.status === 'completed' || requestDetails.status === 'in_progress'}
              className="flex flex-col items-center flex-1 py-[18px] rounded-lg border-4 border-solid border-[#0F284726] hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ background: 'linear-gradient(180deg, #022658, #1A4983)' }}
            >
              <span className="text-white text-base font-bold whitespace-nowrap">
                {isProcessing ? 'Processing...' : requestDetails.status === 'in_progress' ? 'In Progress' : 'Start investigation'}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchRequestDetails;
