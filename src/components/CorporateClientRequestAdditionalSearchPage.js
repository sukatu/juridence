import React, { useState } from 'react';
import { Bell, ChevronRight, ChevronLeft, ChevronDown, Upload, X } from 'lucide-react';

const CorporateClientRequestAdditionalSearchPage = ({ person, company, onBack }) => {
  const [formData, setFormData] = useState({
    requestId: 'JKL28/26/25',
    searchRequestType: '',
    toBeCompleted: '',
    description: '',
    specificQuestions: '',
    supportingDocuments: '',
    uploadedFiles: []
  });

  const [selectedFiles, setSelectedFiles] = useState([]);

  // Determine profile name and risk info
  const profileName = person?.name || company || 'John Kwame Louis';
  const riskScore = person?.riskScore || 28;
  const riskLevel = person?.riskLevel || (riskScore <= 40 ? 'Low' : riskScore <= 70 ? 'Medium' : 'High');
  const profileImage = person?.image || '/images/image.png';

  const userInfo = JSON.parse(localStorage.getItem('userData') || '{}');
  const userName = userInfo?.first_name && userInfo?.last_name 
    ? `${userInfo.first_name} ${userInfo.last_name}` 
    : 'Tonia Martins';
  const organizationName = userInfo?.organization || 'Access Bank';

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files);
    setSelectedFiles(prev => [...prev, ...files]);
  };

  const handleRemoveFile = (index) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // TODO: Submit form data to backend
    console.log('Form submitted:', formData);
  };

  const handleCancel = () => {
    // TODO: Navigate back or reset form
    console.log('Form cancelled');
  };

  return (
    <div className="flex-1 bg-[#F7F8FA] pr-6 rounded-lg">
      <div className="flex items-start gap-6">
        {/* Main Content */}
        <div className="flex-1 flex flex-col bg-[#F7F8FA] pt-2 pb-[52px] gap-4">
          {/* Header */}
          <div className="flex items-center self-stretch py-2 px-1.5 gap-[50px] rounded border-b border-[#D4E1EA]">
            <div className="flex flex-col items-start w-[263px] gap-1">
              <span className="text-[#050F1C] text-xl font-medium">
                {organizationName},
              </span>
              <span className="text-[#050F1C] text-base font-normal opacity-75">
                Track all your activities here.
              </span>
            </div>
            <div className="flex items-start flex-1 gap-4">
              {/* Search Bar */}
              <div className="flex justify-between items-center flex-1 pr-2 rounded-lg border border-solid border-[#D4E1EA] bg-white h-11">
                <input
                  type="text"
                  placeholder="Search companies and persons here"
                  className="flex-1 self-stretch text-[#525866] bg-transparent text-xs py-3.5 pl-2 mr-1 border-0 outline-none"
                />
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 border border-[#868C98] rounded"></div>
                  <span className="text-[#868C98] text-sm">|</span>
                  <div className="flex items-center bg-white w-12 py-1 px-1 gap-0.5 rounded">
                    <span className="text-[#525866] text-xs font-bold">All</span>
                    <ChevronRight className="w-3 h-3 text-[#141B34] rotate-90" />
                  </div>
                </div>
              </div>
              
              {/* Notification and User Profile */}
              <div className="flex items-center gap-3">
                <div className="p-2 bg-[#F7F8FA] rounded-full border border-[#D4E1EA]">
                  <Bell className="w-5 h-5 text-[#022658]" />
                </div>
                <div className="flex items-center gap-1.5">
                  <img
                    src={userInfo?.profile_picture || '/images/image.png'}
                    alt="User"
                    className="w-9 h-9 rounded-full object-cover"
                    onError={(e) => {
                      e.target.src = '/images/image.png';
                    }}
                  />
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-0.5">
                      <span className="text-[#050F1C] text-base font-bold whitespace-nowrap">
                        {userName}
                      </span>
                      <ChevronRight className="w-3 h-3 text-[#141B34] rotate-90" />
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="w-2 h-2 bg-[#10B981] rounded-full"></div>
                      <span className="text-[#525866] text-xs">Online</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="flex-1 p-4 bg-white rounded-lg flex flex-col gap-10">
            {/* Breadcrumb and Back Button */}
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-1">
                <span className="text-[#525866] text-xs opacity-75 font-normal">REQUEST ADDITIONAL SEARCH</span>
              </div>
              <button 
                onClick={onBack}
                className="p-2 bg-[#F7F8FA] rounded-lg w-fit"
              >
                <ChevronLeft className="w-6 h-6 text-[#050F1C]" />
              </button>
            </div>

            {/* Profile Name Section */}
            <div className="flex items-center gap-1">
              <span className="text-[#525866] text-[10px] font-normal">Profile name:</span>
              <div className="flex items-center gap-1">
                <img
                  src={profileImage}
                  alt="Profile"
                  className="w-6 h-6 rounded-full object-cover"
                  onError={(e) => {
                    e.target.src = '/images/image.png';
                  }}
                />
                <span className="text-[#050F1C] text-base font-medium" style={{ fontFamily: 'Satoshi' }}>{profileName}</span>
                <span 
                  className={`text-xs font-medium`} 
                  style={{ 
                    fontFamily: 'Satoshi',
                    color: riskLevel === 'Low' ? '#10B981' : riskLevel === 'Medium' ? '#DEBB0C' : '#EF4444'
                  }}
                >
                  {riskLevel} risk [{riskScore}/100]
                </span>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="flex flex-col gap-10">
              {/* First Row - Request ID, Search Type, To be Completed */}
              <div className="flex items-start gap-6">
                {/* Request ID */}
                <div className="flex-1 flex flex-col gap-2">
                  <label className="text-[#050F1C] text-sm font-bold" style={{ fontFamily: 'Satoshi' }}>Request ID</label>
                  <div className="h-12 px-4 py-3 rounded-lg border border-[#022658] flex items-center">
                    <span className="text-[#050F1C] text-sm font-normal" style={{ fontFamily: 'Satoshi' }}>
                      {formData.requestId}
                    </span>
                  </div>
                </div>

                {/* Search Request Type */}
                <div className="flex-1 flex flex-col gap-2">
                  <label className="text-[#050F1C] text-sm font-bold" style={{ fontFamily: 'Satoshi' }}>Search request type</label>
                  <div className="h-12 px-4 py-3 rounded-lg border border-[#B1B9C6] flex items-center justify-between cursor-pointer">
                    <span className="text-[#525866] text-sm font-normal" style={{ fontFamily: 'Satoshi' }}>
                      {formData.searchRequestType || 'Select type'}
                    </span>
                    <ChevronDown className="w-4 h-4 text-[#050F1C]" />
                  </div>
                </div>

                {/* To be Completed */}
                <div className="flex-1 flex flex-col gap-2">
                  <label className="text-[#050F1C] text-sm font-bold" style={{ fontFamily: 'Satoshi' }}>To be completed</label>
                  <div className="h-12 px-4 py-3 rounded-lg border border-[#B1B9C6] flex items-center justify-between cursor-pointer">
                    <span className="text-[#525866] text-sm font-normal" style={{ fontFamily: 'Satoshi' }}>
                      {formData.toBeCompleted || 'Day/Month/Year'}
                    </span>
                    <ChevronDown className="w-4 h-4 text-[#050F1C]" />
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="flex flex-col gap-2">
                <label className="text-[#050F1C] text-sm font-bold" style={{ fontFamily: 'Satoshi' }}>Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Type here"
                  className="h-20 px-4 py-3 rounded-lg border border-[#B1B9C6] resize-none outline-none focus:border-[#022658] text-sm text-[#525866] font-normal"
                  style={{ fontFamily: 'Satoshi' }}
                />
              </div>

              {/* Specific Questions */}
              <div className="flex flex-col gap-2">
                <label className="text-[#050F1C] text-sm font-bold" style={{ fontFamily: 'Satoshi' }}>Specific Questions</label>
                <textarea
                  value={formData.specificQuestions}
                  onChange={(e) => handleInputChange('specificQuestions', e.target.value)}
                  placeholder="Type here"
                  className="h-20 px-4 py-3 rounded-lg border border-[#B1B9C6] resize-none outline-none focus:border-[#022658] text-sm text-[#525866] font-normal"
                  style={{ fontFamily: 'Satoshi' }}
                />
              </div>

              {/* Supporting Documents */}
              <div className="flex flex-col gap-2">
                <label className="text-[#050F1C] text-sm font-bold" style={{ fontFamily: 'Satoshi' }}>Supporting Documents</label>
                <textarea
                  value={formData.supportingDocuments}
                  onChange={(e) => handleInputChange('supportingDocuments', e.target.value)}
                  placeholder="Paste Links"
                  className="h-20 px-4 py-3 rounded-lg border border-[#B1B9C6] resize-none outline-none focus:border-[#022658] text-sm text-[#525866] font-normal"
                  style={{ fontFamily: 'Satoshi' }}
                />
              </div>

              {/* File Upload Section */}
              <div className="w-[358px] p-4 rounded-lg border border-[#B1B9C6] flex flex-col items-center gap-3">
                <div className="flex flex-col items-center gap-3">
                  <div className="w-10 h-10 rounded-full border-2 border-[#D4E1EA] flex items-center justify-center">
                    <Upload className="w-4 h-4 text-[#050F1C]" />
                  </div>
                  <span className="text-[#050F1C] text-sm font-normal" style={{ fontFamily: 'Satoshi' }}>
                    Browse & choose files you want to upload
                  </span>
                  <span className="text-[#525866] text-xs font-normal" style={{ fontFamily: 'Satoshi' }}>
                    Max file size 5MB
                  </span>
                  <label className="h-8 px-2.5 bg-gradient-to-b from-[#0F2847] to-[#1A4983] shadow-md rounded-lg border-4 border-[rgba(15,40,71,0.15)] flex items-center justify-center gap-2.5 cursor-pointer">
                    <span className="text-white text-xs font-bold" style={{ fontFamily: 'Satoshi' }}>Upload here</span>
                    <input
                      type="file"
                      multiple
                      onChange={handleFileUpload}
                      className="hidden"
                      accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                    />
                  </label>
                </div>
              </div>

              {/* Uploaded Files List */}
              {selectedFiles.length > 0 && (
                <div className="flex flex-col gap-2">
                  <span className="text-[#050F1C] text-sm font-bold">Uploaded Files:</span>
                  <div className="flex flex-col gap-2">
                    {selectedFiles.map((file, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-[#F7F8FA] rounded-lg">
                        <span className="text-[#050F1C] text-sm font-normal">{file.name}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveFile(index)}
                          className="p-1 hover:bg-red-50 rounded"
                        >
                          <X className="w-4 h-4 text-[#EF4444]" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex items-start gap-10">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="flex-1 h-[58px] px-2.5 shadow-md rounded-lg border-2 border-[#0F2847] flex items-center justify-center gap-2.5"
                >
                  <span className="text-[#022658] text-base font-bold" style={{ fontFamily: 'Satoshi' }}>Cancel</span>
                </button>
                <button
                  type="submit"
                  className="flex-1 h-[58px] px-2.5 bg-gradient-to-b from-[#022658] to-[#1A4983] shadow-md rounded-lg border-4 border-[rgba(15,40,71,0.15)] flex items-center justify-center gap-2.5"
                >
                  <span className="text-white text-base font-bold" style={{ fontFamily: 'Satoshi' }}>Send Request</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CorporateClientRequestAdditionalSearchPage;

