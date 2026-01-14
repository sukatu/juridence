import React from 'react';

const ActivityLogDetailsDrawer = ({ logEntry, onClose }) => {
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) + 
             ' - ' + date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
    } catch (e) {
      return dateString;
    }
  };

  const getResourceTypeLabel = (resourceType) => {
    if (!resourceType) return 'Unknown';
    const typeMap = {
      'people': 'People Management',
      'case': 'Case Management',
      'company': 'Company Management',
      'gazette': 'Gazette Management',
      'commercial_bulletin': 'Commercial Bulletin',
      'search_request': 'Search Requests',
      'user': 'User Management'
    };
    return typeMap[resourceType.toLowerCase()] || resourceType;
  };

  const formatFieldChanges = () => {
    const changes = [];
    if (logEntry.old_values && logEntry.new_values) {
      Object.keys(logEntry.new_values).forEach(key => {
        const oldVal = logEntry.old_values[key];
        const newVal = logEntry.new_values[key];
        if (oldVal !== newVal) {
          changes.push(`"${key}" changed from "${oldVal}" → "${newVal}"`);
        }
      });
    }
    return changes.length > 0 ? changes : ['No field changes'];
  };

  const fieldChanges = formatFieldChanges();
  const firstChange = fieldChanges[0] || '';
  const beforeValue = firstChange.includes('→') ? firstChange.split('→')[0].split('from')[1]?.trim().replace(/"/g, '') : 'N/A';
  const afterValue = firstChange.includes('→') ? firstChange.split('→')[1]?.trim().replace(/"/g, '') : 'N/A';

  return (
    <>
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 z-40"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="fixed top-0 right-0 h-full w-[500px] bg-white z-50 overflow-y-auto" style={{ boxShadow: '-5px 8px 4px #0708101A' }}>
        <div className="flex flex-col items-start w-full py-6 px-10 gap-4">
          {/* Close Button */}
          <button onClick={onClose} className="cursor-pointer hover:opacity-70">
            <img
              src="https://storage.googleapis.com/tagjs-prod.appspot.com/v1/Iq8V0MifpP/vwirxfor_expires_30_days.png"
              className="w-6 h-6 object-fill flex-shrink-0"
            />
          </button>

          {/* Content */}
          <div className="flex flex-col items-start w-full gap-6">
            {/* Header */}
            <div className="flex flex-col items-start gap-6">
              <span className="text-[#525866] text-xs whitespace-nowrap">REPORTS & LOGS</span>
              <div className="flex items-center gap-1">
                <img
                  src="https://storage.googleapis.com/tagjs-prod.appspot.com/v1/Iq8V0MifpP/89j226e8_expires_30_days.png"
                  className="w-10 h-10 object-fill flex-shrink-0 rounded-full"
                />
                <div className="flex flex-col items-start gap-1">
                  <span className="text-[#040E1B] text-lg whitespace-nowrap">{logEntry.name || 'Unknown User'}</span>
                  <span className="text-[#040E1B] text-sm whitespace-nowrap">{logEntry.ip_address || 'N/A'}</span>
                </div>
              </div>
            </div>

            {/* Form Fields */}
            <div className="flex flex-col w-full gap-4">
              {/* Action */}
              <div className="flex flex-col items-start w-full gap-2">
                <span className="text-[#040E1B] text-xs font-bold whitespace-nowrap">Action</span>
                <input
                  type="text"
                  value={logEntry.action || 'N/A'}
                  readOnly
                  className="w-full text-[#040E1B] bg-[#F7F8FA] text-sm p-4 rounded-lg border-0 outline-none"
                />
              </div>

              {/* Date & Time */}
              <div className="flex flex-col items-start w-full gap-2">
                <span className="text-[#040E1B] text-xs font-bold whitespace-nowrap">Date & Time</span>
                <input
                  type="text"
                  value={formatDate(logEntry.created_at || logEntry.timestamp)}
                  readOnly
                  className="w-full text-[#040E1B] bg-[#F7F8FA] text-sm p-4 rounded-lg border-0 outline-none"
                />
              </div>

              {/* Affected Module */}
              <div className="flex flex-col items-start w-full gap-2">
                <span className="text-[#040E1B] text-xs font-bold whitespace-nowrap">Affected Module</span>
                <input
                  type="text"
                  value={getResourceTypeLabel(logEntry.resource_type)}
                  readOnly
                  className="w-full text-[#040E1B] bg-[#F7F8FA] text-sm p-4 rounded-lg border-0 outline-none"
                />
              </div>

              {/* Item ID */}
              <div className="flex flex-col items-start w-full gap-2">
                <span className="text-[#040E1B] text-xs font-bold whitespace-nowrap">Item ID</span>
                <input
                  type="text"
                  value={logEntry.resource_id || logEntry.itemId || 'N/A'}
                  readOnly
                  className="w-full text-[#040E1B] bg-[#F7F8FA] text-sm p-4 rounded-lg border-0 outline-none"
                />
              </div>

              {/* Item name */}
              {logEntry.description && (
                <div className="flex flex-col items-start w-full gap-2">
                  <span className="text-[#040E1B] text-xs font-bold whitespace-nowrap">Description</span>
                  <input
                    type="text"
                    value={logEntry.description}
                    readOnly
                    className="w-full text-[#040E1B] bg-[#F7F8FA] text-sm p-4 rounded-lg border-0 outline-none"
                  />
                </div>
              )}

              {/* Field changes */}
              {(logEntry.old_values || logEntry.new_values) && (
                <div className="flex flex-col items-start w-full gap-2">
                  <span className="text-[#040E1B] text-xs font-bold whitespace-nowrap">Field changes</span>
                  <div className="flex flex-col items-start w-full bg-[#F7F8FA] py-4 gap-2.5 rounded-lg max-h-48 overflow-y-auto">
                    {fieldChanges.map((change, idx) => (
                      <span key={idx} className="text-[#040E1B] text-sm ml-4">
                        {change}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Before/After Comparison */}
              {fieldChanges.length > 0 && fieldChanges[0] !== 'No field changes' && (
                <div className="flex items-start w-full gap-2">
                  <div className="flex flex-1 flex-col items-start gap-2">
                    <span className="text-[#040E1B] text-sm font-bold whitespace-nowrap">Before</span>
                    <input
                      type="text"
                      value={beforeValue}
                      readOnly
                      className="w-full text-[#525866] bg-[#F7F8FA] text-sm py-3.5 px-4 rounded-lg border-0 outline-none"
                    />
                  </div>
                  <div className="flex items-center pt-8">
                    <span className="text-[#040E1B] text-sm font-bold whitespace-nowrap">→</span>
                  </div>
                  <div className="flex flex-1 flex-col items-start gap-2">
                    <span className="text-[#040E1B] text-sm font-bold whitespace-nowrap">After</span>
                    <input
                      type="text"
                      value={afterValue}
                      readOnly
                      className="w-full text-[#525866] bg-[#F7F8FA] text-sm py-3.5 px-4 rounded-lg border-0 outline-none"
                    />
                  </div>
                </div>
              )}

              {/* Result */}
              <div className="flex flex-col items-start w-full gap-2">
                <span className="text-[#040E1B] text-xs font-bold whitespace-nowrap">Result</span>
                <input
                  type="text"
                  value={logEntry.status || (logEntry.severity === 'error' ? 'With error' : 'Success')}
                  readOnly
                  className="w-full text-[#040E1B] bg-[#F7F8FA] text-sm p-4 rounded-lg border-0 outline-none"
                />
              </div>

              {/* Additional Metadata */}
              {logEntry.log_metadata && Object.keys(logEntry.log_metadata).length > 0 && (
                <div className="flex flex-col items-start w-full gap-2">
                  <span className="text-[#040E1B] text-xs font-bold whitespace-nowrap">Additional Information</span>
                  <textarea
                    value={JSON.stringify(logEntry.log_metadata, null, 2)}
                    readOnly
                    className="w-full text-[#040E1B] bg-[#F7F8FA] text-sm p-4 rounded-lg border-0 outline-none h-32"
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ActivityLogDetailsDrawer;
