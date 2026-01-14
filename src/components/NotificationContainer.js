import React from 'react';
import NotificationToast from './NotificationToast';

const NotificationContainer = ({ notifications, onRemove }) => {
  if (!notifications || notifications.length === 0) {
    return null;
  }
  
  return (
    <div 
      className="fixed top-4 right-4 z-[99999] flex flex-col gap-3" 
      style={{ pointerEvents: 'none', maxWidth: '420px' }}
    >
      {notifications.map((notification, index) => (
        <div 
          key={notification.id} 
          style={{ 
            pointerEvents: 'auto',
            animation: 'slideInRight 0.3s ease-out',
          }}
        >
          <NotificationToast
            {...notification}
            onClose={onRemove}
          />
        </div>
      ))}
      <style>{`
        @keyframes slideInRight {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
};

export default NotificationContainer;
