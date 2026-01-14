import React, { useState, useEffect } from 'react';

const AddRegulatoryDrawer = ({ onClose, onSave, initialData = null, isEditMode = false }) => {
  const [isOpen, setIsOpen] = useState(false);
  
  // Helper function to convert date string to YYYY-MM-DD format
  const formatDateForInput = (dateString) => {
    if (!dateString || dateString === 'N/A') return '';
    try {
      // Handle different date formats
      if (dateString.includes('/')) {
        // Handle MM/DD/YYYY format
        const parts = dateString.split('/');
        if (parts.length === 3) {
          const month = parts[0].padStart(2, '0');
          const day = parts[1].padStart(2, '0');
          const year = parts[2];
          return `${year}-${month}-${day}`;
        }
      }
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return '';
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    } catch (e) {
      return '';
    }
  };

  const [formData, setFormData] = useState({
    regulatoryBody: initialData?.body || initialData?.regulatoryBody || '',
    licenseNumber: initialData?.licenseNumber || initialData?.license_permit_number || '',
    licenseStatus: initialData?.status || initialData?.licenseStatus || '',
    complianceViolations: initialData?.violations || initialData?.complianceViolations || '',
    regulatoryActions: initialData?.actions || initialData?.regulatoryActions || '',
    date: initialData?.date ? formatDateForInput(initialData.date) : (initialData?.issue_date ? formatDateForInput(initialData.issue_date) : ''),
    additionalNote: initialData?.notes || initialData?.additionalNote || ''
  });

  useEffect(() => {
    // Trigger animation after mount
    setTimeout(() => setIsOpen(true), 10);
  }, []);

  // Update form data when initialData changes
  useEffect(() => {
    if (initialData) {
      setFormData({
        regulatoryBody: initialData.body || initialData.regulatoryBody || '',
        licenseNumber: initialData.licenseNumber || initialData.license_permit_number || '',
        licenseStatus: initialData.status || initialData.licenseStatus || '',
        complianceViolations: initialData.violations || initialData.complianceViolations || '',
        regulatoryActions: initialData.actions || initialData.regulatoryActions || '',
        date: initialData.date ? formatDateForInput(initialData.date) : (initialData.issue_date ? formatDateForInput(initialData.issue_date) : ''),
        additionalNote: initialData.notes || initialData.additionalNote || ''
      });
    }
  }, [initialData]);

  const handleClose = () => {
    setIsOpen(false);
    setTimeout(onClose, 300); // Wait for animation to complete
  };

  const handleSave = () => {
    onSave(formData);
    handleClose();
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <>
      {/* Overlay */}
      <div
        className={`fixed inset-0 bg-black transition-opacity duration-300 z-40 ${
          isOpen ? 'opacity-50' : 'opacity-0'
        }`}
        onClick={handleClose}
      />

      {/* Drawer */}
      <div
        className={`fixed top-0 right-0 h-full w-[500px] bg-white shadow-lg transform transition-transform duration-300 ease-in-out z-50 overflow-y-auto ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
        style={{ boxShadow: '-5px 8px 4px #0708101A' }}
      >
        <div className="flex flex-col items-start px-10 mt-[25px] mb-[102px] gap-4">
          {/* Close Button */}
          <button onClick={handleClose} className="cursor-pointer hover:opacity-70">
            <img
              src="https://storage.googleapis.com/tagjs-prod.appspot.com/v1/Iq8V0MifpP/lhfwnfgd_expires_30_days.png"
              className="w-6 h-6 object-fill"
              alt="Close"
            />
          </button>

          <div className="flex flex-col self-stretch gap-10">
            <div className="flex flex-col self-stretch gap-6">
              {/* ADD NEW / EDIT Header */}
              <div className="flex flex-col items-start self-stretch gap-6">
                <span className="text-[#525866] text-xs">{isEditMode ? 'EDIT REGULATORY RECORD' : 'ADD NEW'}</span>

                {/* Regulatory Body */}
                <div className="flex flex-col self-stretch gap-2">
                  <div className="flex justify-between items-start self-stretch">
                    <span className="text-[#040E1B] text-xs font-bold">Regulatory body</span>
                    <img
                      src="https://storage.googleapis.com/tagjs-prod.appspot.com/v1/Iq8V0MifpP/aa3asrnp_expires_30_days.png"
                      className="w-4 h-4 object-fill"
                      alt="Required"
                    />
                  </div>
                  <input
                    type="text"
                    value={formData.regulatoryBody}
                    onChange={(e) => handleChange('regulatoryBody', e.target.value)}
                    placeholder="Enter regulatory body name"
                    className="self-stretch bg-[#F7F8FA] h-[51px] px-4 rounded-lg border border-solid border-[#D4E1EA] text-[#040E1B] text-sm outline-none focus:border-[#022658]"
                  />
                </div>
              </div>

              {/* Form Fields */}
              <div className="flex flex-col self-stretch gap-4">
                {/* License/Permit Numbers */}
                <div className="flex flex-col self-stretch gap-2">
                  <div className="flex justify-between items-start self-stretch">
                    <span className="text-[#040E1B] text-xs font-bold">License/Permit numbers</span>
                    <img
                      src="https://storage.googleapis.com/tagjs-prod.appspot.com/v1/Iq8V0MifpP/07xoaqzf_expires_30_days.png"
                      className="w-4 h-4 object-fill"
                      alt="Required"
                    />
                  </div>
                  <input
                    type="text"
                    value={formData.licenseNumber}
                    onChange={(e) => handleChange('licenseNumber', e.target.value)}
                    placeholder="Enter license/permit number"
                    className="self-stretch bg-[#F7F8FA] h-[51px] px-4 rounded-lg border border-solid border-[#D4E1EA] text-[#040E1B] text-sm outline-none focus:border-[#022658]"
                  />
                </div>

                {/* License Status */}
                <div className="flex flex-col self-stretch gap-2">
                  <div className="flex justify-between items-start self-stretch">
                    <span className="text-[#040E1B] text-xs font-bold">License status</span>
                    <img
                      src="https://storage.googleapis.com/tagjs-prod.appspot.com/v1/Iq8V0MifpP/spqdqeu2_expires_30_days.png"
                      className="w-4 h-4 object-fill"
                      alt="Required"
                    />
                  </div>
                  <select
                    value={formData.licenseStatus}
                    onChange={(e) => handleChange('licenseStatus', e.target.value)}
                    className="self-stretch bg-[#F7F8FA] h-[51px] px-4 rounded-lg border border-solid border-[#D4E1EA] text-[#040E1B] text-sm outline-none focus:border-[#022658]"
                  >
                    <option value="">Select status</option>
                    <option value="Active">Active</option>
                    <option value="Valid">Valid</option>
                    <option value="Expired">Expired</option>
                    <option value="Suspended">Suspended</option>
                    <option value="Pending">Pending</option>
                  </select>
                </div>

                {/* Compliance Violations */}
                <div className="flex flex-col self-stretch gap-2">
                  <div className="flex justify-between items-start self-stretch">
                    <span className="text-[#040E1B] text-xs font-bold">Compliance violations</span>
                    <img
                      src="https://storage.googleapis.com/tagjs-prod.appspot.com/v1/Iq8V0MifpP/p3vca1qw_expires_30_days.png"
                      className="w-4 h-4 object-fill"
                      alt="Required"
                    />
                  </div>
                  <input
                    type="text"
                    value={formData.complianceViolations}
                    onChange={(e) => handleChange('complianceViolations', e.target.value)}
                    placeholder="Enter compliance violations"
                    className="self-stretch bg-[#F7F8FA] h-[51px] px-4 rounded-lg border border-solid border-[#D4E1EA] text-[#040E1B] text-sm outline-none focus:border-[#022658]"
                  />
                </div>

                {/* Regulatory Actions */}
                <div className="flex flex-col self-stretch gap-2">
                  <div className="flex justify-between items-start self-stretch">
                    <span className="text-[#040E1B] text-xs font-bold">Regulatory actions</span>
                    <img
                      src="https://storage.googleapis.com/tagjs-prod.appspot.com/v1/Iq8V0MifpP/mjuot8tl_expires_30_days.png"
                      className="w-4 h-4 object-fill"
                      alt="Required"
                    />
                  </div>
                  <input
                    type="text"
                    value={formData.regulatoryActions}
                    onChange={(e) => handleChange('regulatoryActions', e.target.value)}
                    placeholder="Enter regulatory actions"
                    className="self-stretch bg-[#F7F8FA] h-[51px] px-4 rounded-lg border border-solid border-[#D4E1EA] text-[#040E1B] text-sm outline-none focus:border-[#022658]"
                  />
                </div>

                {/* Date */}
                <div className="flex flex-col self-stretch gap-2">
                  <div className="flex justify-between items-start self-stretch">
                    <span className="text-[#040E1B] text-xs font-bold">Date</span>
                    <img
                      src="https://storage.googleapis.com/tagjs-prod.appspot.com/v1/Iq8V0MifpP/st5cwo20_expires_30_days.png"
                      className="w-4 h-4 object-fill"
                      alt="Required"
                    />
                  </div>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => handleChange('date', e.target.value)}
                    className="self-stretch bg-[#F7F8FA] h-[51px] px-4 rounded-lg border border-solid border-[#D4E1EA] text-[#040E1B] text-sm outline-none focus:border-[#022658]"
                  />
                </div>

                {/* Additional Note */}
                <div className="flex flex-col self-stretch gap-2">
                  <div className="flex justify-between items-start self-stretch">
                    <span className="text-[#040E1B] text-xs font-bold">Additional note</span>
                    <img
                      src="https://storage.googleapis.com/tagjs-prod.appspot.com/v1/Iq8V0MifpP/v3ktwgle_expires_30_days.png"
                      className="w-4 h-4 object-fill"
                      alt="Optional"
                    />
                  </div>
                  <textarea
                    value={formData.additionalNote}
                    onChange={(e) => handleChange('additionalNote', e.target.value)}
                    placeholder="Enter additional notes"
                    className="self-stretch bg-[#F7F8FA] h-20 px-4 py-3 rounded-lg border border-solid border-[#D4E1EA] text-[#040E1B] text-sm outline-none focus:border-[#022658] resize-none"
                  />
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-start self-stretch gap-10">
              <button
                onClick={handleClose}
                className="flex flex-1 flex-col items-center bg-transparent text-left py-[18px] rounded-lg border-2 border-solid border-transparent hover:bg-gray-50 transition-colors"
                style={{ boxShadow: '0px 4px 4px #050F1C1A' }}
              >
                <span className="text-[#022658] text-base font-bold">Cancel</span>
              </button>
              <button
                onClick={handleSave}
                className="flex flex-1 flex-col items-center text-left py-[18px] rounded-lg border-4 border-solid border-[#0F284726] hover:opacity-90 transition-opacity"
                style={{ background: 'linear-gradient(180deg, #022658, #1A4983)' }}
              >
                <span className="text-white text-base font-bold">Save</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default AddRegulatoryDrawer;

