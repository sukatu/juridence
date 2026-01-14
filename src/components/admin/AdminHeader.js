import React, { useState, useRef, useEffect } from 'react';
import { Circle } from 'lucide-react';

const AdminHeader = ({ userInfo, onNavigate, onLogout }) => {
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const userMenuRef = useRef(null);

  // Get user name from userInfo or localStorage
  const getDisplayUserInfo = () => {
    if (userInfo) return userInfo;
    try {
      const stored = localStorage.getItem('userData');
      return stored ? JSON.parse(stored) : {};
    } catch (e) {
      return {};
    }
  };
  
  const displayUserInfo = getDisplayUserInfo();
  
  // Get userName with priority: userInfo.name > first_name + last_name > first_name > localStorage userName > email prefix
  // Prioritize userData fields over localStorage userName since localStorage might just be email prefix
  let userName = null;
  
  if (displayUserInfo) {
    if (displayUserInfo.name && displayUserInfo.name.trim()) {
      userName = displayUserInfo.name.trim();
    } else if (displayUserInfo.first_name && displayUserInfo.last_name) {
      userName = `${displayUserInfo.first_name} ${displayUserInfo.last_name}`.trim();
    } else if (displayUserInfo.first_name && displayUserInfo.first_name.trim()) {
      userName = displayUserInfo.first_name.trim();
    }
  }
  
  // If no name from userData, check localStorage userName
  if (!userName) {
    const storedUserName = localStorage.getItem('userName');
    if (storedUserName && storedUserName.trim()) {
      userName = storedUserName.trim();
    }
  }
  
  // If still no name, try email prefix
  if (!userName && displayUserInfo?.email) {
    userName = displayUserInfo.email.split('@')[0];
  }
  
  // Final fallback - only use if we truly have no name
  if (!userName || userName === '') {
    userName = 'Eric Kwaah';
  }

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setIsUserMenuOpen(false);
      }
    };

    if (isUserMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isUserMenuOpen]);

  return (
    <div className="w-full bg-white py-3.5 px-6 mb-4">
      <div className="flex justify-end items-center w-full">
        {/* Right Side - Notification and User Icon */}
        <div className="flex items-center gap-3 flex-shrink-0">
          <div className="relative flex-shrink-0" ref={userMenuRef}>
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setIsUserMenuOpen(!isUserMenuOpen);
              }}
              className="flex items-center gap-1.5 cursor-pointer hover:opacity-80 transition-opacity outline-none focus:outline-none"
              type="button"
              style={{ pointerEvents: 'auto' }}
            >
              <img
                src={displayUserInfo?.avatar || displayUserInfo?.profile_picture || "/images/image.png"}
                alt="User"
                className="w-9 h-9 object-fill rounded-full flex-shrink-0 pointer-events-none"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = "https://placehold.co/36x36";
                }}
              />
              <div className="flex flex-col items-start gap-1 pointer-events-none">
                <span className="text-[#040E1B] text-base font-bold whitespace-nowrap" style={{ fontFamily: 'Satoshi' }}>
                  {userName}
                </span>
                <div className="flex items-center gap-1">
                  <Circle className="w-2 h-2 text-green-500 fill-green-500 flex-shrink-0" />
                  <span className="text-[#525866] text-xs whitespace-nowrap" style={{ fontFamily: 'Satoshi' }}>Online</span>
                </div>
              </div>
            </button>
            {isUserMenuOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                <button
                  onClick={() => {
                    if (onNavigate) onNavigate('profile');
                    setIsUserMenuOpen(false);
                  }}
                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  style={{ fontFamily: 'Satoshi' }}
                >
                  Profile
                </button>
                <button
                  onClick={() => {
                    if (onNavigate) onNavigate('settings');
                    setIsUserMenuOpen(false);
                  }}
                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  style={{ fontFamily: 'Satoshi' }}
                >
                  Settings
                </button>
                <button
                  onClick={() => {
                    if (onLogout) onLogout();
                    setIsUserMenuOpen(false);
                  }}
                  className="block w-full text-left px-4 py-2 text-sm text-red-700 hover:bg-red-50"
                  style={{ fontFamily: 'Satoshi' }}
                >
                  Log Out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminHeader;

