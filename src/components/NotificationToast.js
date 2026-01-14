import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, AlertCircle, Info, X } from 'lucide-react';

const NotificationToast = ({ 
  id, 
  type = 'info', 
  title, 
  message, 
  duration = 5000, 
  onClose 
}) => {
  const [isVisible, setIsVisible] = useState(true);
  const [isLeaving, setIsLeaving] = useState(false);

  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        handleClose();
      }, duration);

      return () => clearTimeout(timer);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [duration]);

  const handleClose = () => {
    setIsLeaving(true);
    setTimeout(() => {
      setIsVisible(false);
      onClose?.(id);
    }, 300);
  };

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'error':
        return <XCircle className="h-5 w-5 text-red-500" />;
      case 'warning':
        return <AlertCircle className="h-5 w-5 text-yellow-500" />;
      default:
        return <Info className="h-5 w-5 text-blue-500" />;
    }
  };

  const getBackgroundColor = () => {
    switch (type) {
      case 'success':
        return 'bg-green-50 border-l-green-500';
      case 'error':
        return 'bg-red-50 border-l-red-500';
      case 'warning':
        return 'bg-yellow-50 border-l-yellow-500';
      default:
        return 'bg-blue-50 border-l-blue-500';
    }
  };

  const getTextColor = () => {
    switch (type) {
      case 'success':
        return 'text-green-800';
      case 'error':
        return 'text-red-800';
      case 'warning':
        return 'text-yellow-800';
      default:
        return 'text-blue-800';
    }
  };

  if (!isVisible) return null;

  return (
    <div
      className={`max-w-md w-full bg-white rounded-lg shadow-xl border-l-4 ${getBackgroundColor()} transform transition-all duration-300 ease-in-out ${
        isLeaving ? 'translate-x-full opacity-0' : 'translate-x-0 opacity-100'
      }`}
      style={{ zIndex: 99999 }}
    >
      <div className="p-4">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 mt-0.5">
            {getIcon()}
          </div>
          <div className="ml-1 flex-1 min-w-0">
            {title && (
              <p className={`text-sm font-semibold ${getTextColor()}`}>
                {title}
              </p>
            )}
            <p className={`text-sm ${title ? 'mt-1' : ''} text-gray-700`}>
              {message}
            </p>
          </div>
          <div className="ml-2 flex-shrink-0">
            <button
              className="rounded-md inline-flex text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors"
              onClick={handleClose}
              aria-label="Close notification"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationToast;
