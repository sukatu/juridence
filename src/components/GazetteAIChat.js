import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation, useBlocker } from 'react-router-dom';
import { 
  Send, 
  Bot, 
  User, 
  X, 
  Minimize2, 
  Maximize2, 
  Loader2,
  Sparkles,
  FileText,
  AlertCircle,
  Search,
  ExternalLink,
  Eye,
  Calendar,
  MapPin,
  User as UserIcon
} from 'lucide-react';
import { apiPost } from '../utils/api';

const GazetteAIChat = ({ isOpen, onClose, onMinimize, onGazetteSelect }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isMinimized, setIsMinimized] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [chatHistory, setChatHistory] = useState([]);
  const [showResultsPage, setShowResultsPage] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const originalNavigateRef = useRef(null);
  const pathWhenOpenedRef = useRef(null);
  
  // Use React Router's blocker to prevent ALL navigation when chat is open
  const blocker = useBlocker(({ currentLocation, nextLocation }) => {
    // Block ALL navigation when chat is open - stay on current page
    if (isOpen) {
      const currentPath = currentLocation.pathname;
      const nextPath = nextLocation.pathname;
      const storedPath = pathWhenOpenedRef.current || currentPath;
      
      // Block if trying to navigate away from the current page
      if (nextPath !== storedPath && nextPath !== currentPath) {
        console.log('🚫 BLOCKED: React Router navigation from', currentPath, 'to', nextPath);
        return true; // Block the navigation
      }
    }
    return false; // Allow navigation if chat is closed
  });

  // Block navigation when chat is open - intercept all link clicks and form submissions
  useEffect(() => {
    if (!isOpen) return;

    const handleClick = (e) => {
      // If clicking inside the chat, prevent any navigation
      if (e.target.closest('.gazette-ai-chat-container')) {
        const link = e.target.closest('a');
        if (link && (link.href.includes('/search') || link.href.includes('?search=') || link.href.includes('?q='))) {
          e.preventDefault();
          e.stopPropagation();
          e.stopImmediatePropagation();
          console.log('Blocked link navigation from AI chat');
          return false;
        }
      }
    };

    const handleSubmit = (e) => {
      // If submitting from outside the chat, and it's a search form, block it
      if (!e.target.closest('.gazette-ai-chat-container')) {
        const form = e.target.closest('form');
        if (form) {
          const action = form.action || '';
          const method = form.method || 'get';
          // Check if this form might navigate to search
          if (action.includes('/search') || action.includes('?search=') || action.includes('?q=')) {
            e.preventDefault();
            e.stopPropagation();
            e.stopImmediatePropagation();
            console.log('Blocked form submission that would navigate to search');
            return false;
          }
        }
      }
    };

    // Use capture phase to intercept before other handlers
    document.addEventListener('click', handleClick, true);
    document.addEventListener('submit', handleSubmit, true);

    return () => {
      document.removeEventListener('click', handleClick, true);
      document.removeEventListener('submit', handleSubmit, true);
    };
  }, [isOpen]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, searchResults]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
      // Store the current path when chat opens - CRITICAL for blocking navigation
      if (!pathWhenOpenedRef.current) {
        pathWhenOpenedRef.current = location.pathname;
        console.log('AI Chat opened, storing current path:', location.pathname);
      }
      
      // Immediately block any navigation to persons/people/search pages if we're already on one
      if (location.pathname.includes('/people') || location.pathname.includes('/persons') || location.pathname.includes('/person/') || (location.pathname.includes('/search') && !location.pathname.includes('/gazette'))) {
        console.log('🚫 WARNING: Current path is a persons/search page, blocking navigation');
      }
    }
    // Reset results page when chat opens/closes
    if (isOpen) {
      setShowResultsPage(false);
    } else {
      // Clean up when chat closes
      pathWhenOpenedRef.current = null;
    }
  }, [isOpen, location.pathname]);
  
  // Block React Router navigation when AI chat is open
  useEffect(() => {
    if (!isOpen) return;
    
    // Store original navigate function
    if (!originalNavigateRef.current) {
      originalNavigateRef.current = navigate;
    }
    
    // Override navigate function to block navigation to persons/people/search pages
    const blockNavigate = (to, options) => {
      const targetPath = typeof to === 'string' ? to : (to?.pathname || '');
      
      // Block navigation to persons/people/search pages
      if (targetPath.includes('/people') || targetPath.includes('/persons') || targetPath.includes('/person') || (targetPath.includes('/search') && !targetPath.includes('/gazette'))) {
        console.log('Blocked React Router navigation to:', targetPath);
        return;
      }
      
      // Allow navigation for other paths
      if (originalNavigateRef.current) {
        return originalNavigateRef.current(to, options);
      }
    };
    
    // Replace navigate function temporarily (we can't actually override it, so we'll use the effect below)
    
    return () => {
      // Restore on unmount if needed
    };
  }, [isOpen, navigate]);

  // Prevent any form submission from parent elements and navigation
  useEffect(() => {
    const handleFormSubmit = (e) => {
      // If the form submission is from within our chat component, prevent it and handle ourselves
      if (e.target.closest('.gazette-ai-chat-container')) {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
        return false;
      }
      // Otherwise, if we're open, prevent ALL form submissions
      if (isOpen) {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
        return false;
      }
    };

    const handleKeyDown = (e) => {
      // If user is typing in our chat input, prevent any global handlers
      if (isOpen && e.target.closest('.gazette-ai-chat-container')) {
        if (e.key === 'Enter' && e.target.tagName === 'INPUT' && e.target.closest('.gazette-ai-chat-container')) {
          e.preventDefault();
          e.stopPropagation();
          e.stopImmediatePropagation();
        }
      }
    };

    // Prevent navigation when chat is open
    const handleBeforeUnload = (e) => {
      // This won't prevent navigation but we can log it
    };

    // Intercept any pushState/replaceState calls that might change the URL
    const originalPushState = window.history.pushState;
    const originalReplaceState = window.history.replaceState;

    if (isOpen) {
      // Override history methods to prevent navigation
      window.history.pushState = function(...args) {
        // Only allow navigation if it's not a search-related route
        const url = args[2];
        if (url && (url.includes('/search') || url.includes('?search=') || url.includes('?q='))) {
          console.log('Blocked navigation to search page from AI chat');
          return;
        }
        return originalPushState.apply(window.history, args);
      };

      window.history.replaceState = function(...args) {
        const url = args[2];
        if (url && (url.includes('/search') || url.includes('?search=') || url.includes('?q='))) {
          console.log('Blocked navigation to search page from AI chat');
          return;
        }
        return originalReplaceState.apply(window.history, args);
      };

      // Use capture phase to intercept before other handlers
      document.addEventListener('submit', handleFormSubmit, true);
      document.addEventListener('keydown', handleKeyDown, true);
      window.addEventListener('beforeunload', handleBeforeUnload);
      
      return () => {
        // Restore original methods
        window.history.pushState = originalPushState;
        window.history.replaceState = originalReplaceState;
        document.removeEventListener('submit', handleFormSubmit, true);
        document.removeEventListener('keydown', handleKeyDown, true);
        window.removeEventListener('beforeunload', handleBeforeUnload);
      };
    }
  }, [isOpen]);

  const sendMessage = async (message = inputMessage, event = null) => {
    // CRITICAL: Prevent ALL form submissions and navigation
    if (event) {
      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation();
    }
    
    // Store the original path when sending message - NEVER navigate away
    const originalPath = pathWhenOpenedRef.current || window.location.pathname;
    const originalUrl = window.location.href;
    
    if (!pathWhenOpenedRef.current) {
      pathWhenOpenedRef.current = originalPath;
    }
    
    // Ultra-aggressive navigation blocker - blocks ANY path change
    const blockAnyNavigation = () => {
      const currentPath = window.location.pathname;
      const storedPath = pathWhenOpenedRef.current || originalPath;
      
      // Block ANY navigation when chat is open - stay on current page
      if (currentPath !== storedPath && currentPath !== '/gazette') {
        console.log('🚫 BLOCKED: Navigation detected, reverting to original path:', storedPath);
        window.history.replaceState(null, '', storedPath);
        if (typeof window.stop === 'function') {
          window.stop();
        }
        // Force revert if still changed
        setTimeout(() => {
          if (window.location.pathname !== storedPath) {
            window.location.replace(storedPath);
          }
        }, 0);
      }
    };
    
    // Set up continuous navigation blocker
    const navBlockerInterval = setInterval(blockAnyNavigation, 5);
    
    if (!message.trim() || isLoading) {
      clearInterval(navBlockerInterval);
      return;
    }

    const userMessage = {
      role: 'user',
      content: message.trim(),
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);
    setError(null);
    setSearchResults([]);
    setShowResultsPage(false);

    try {
      // Block navigation before API call
      blockAnyNavigation();
      
      const response = await apiPost('/gazette-ai-chat/chat', {
        message: message.trim(),
        chat_history: chatHistory
      });

      // Block navigation after API call
      blockAnyNavigation();
      
      // Force check and revert if path changed
      const currentPathAfterCall = window.location.pathname;
      const storedPath = pathWhenOpenedRef.current || originalPath;
      if (currentPathAfterCall !== storedPath && currentPathAfterCall !== '/gazette') {
        console.log('🚫 BLOCKED: Path changed during API call, reverting to:', storedPath);
        window.history.replaceState(null, '', storedPath);
        if (window.location.pathname !== storedPath) {
          window.location.replace(storedPath);
        }
      }

      if (response.success) {
        const aiMessage = {
          role: 'assistant',
          content: response.response,
          timestamp: new Date().toISOString()
        };
        
        setMessages(prev => [...prev, aiMessage]);
        
        // Update chat history
        setChatHistory(prev => [
          ...prev,
          { role: 'user', content: message.trim() },
          { role: 'assistant', content: response.response }
        ]);

        // Display search results if any
        if (response.search_results && response.search_results.length > 0) {
          setSearchResults(response.search_results);
          // Explicitly ensure results page is NOT shown automatically
          setShowResultsPage(false);
        } else {
          // Clear results if none found
          setSearchResults([]);
          setShowResultsPage(false);
        }
      } else {
        setError(response.error || 'Failed to get AI response');
      }
    } catch (err) {
      // Block navigation during error
      blockAnyNavigation();
      
      const currentPathAfterError = window.location.pathname;
      const storedPath = pathWhenOpenedRef.current || originalPath;
      if (currentPathAfterError !== storedPath && currentPathAfterError !== '/gazette') {
        console.log('🚫 BLOCKED: Path changed during error, reverting to:', storedPath);
        window.history.replaceState(null, '', storedPath);
        if (window.location.pathname !== storedPath) {
          window.location.replace(storedPath);
        }
      }
      
      // Extract error message
      let errorMessage = 'AI search failed. Please try again.';
      if (err.message) {
        errorMessage = err.message;
      } else if (err.detail) {
        errorMessage = err.detail;
      } else if (typeof err === 'string') {
        errorMessage = err;
      }
      setError(errorMessage);
      console.error('Chat error:', err);
    } finally {
      // Keep blocker running longer to catch late navigations
      setTimeout(() => {
        clearInterval(navBlockerInterval);
      }, 3000);
      
      // Final navigation check
      blockAnyNavigation();
      
      const finalPath = window.location.pathname;
      const storedPath = pathWhenOpenedRef.current || originalPath;
      if (finalPath !== storedPath && finalPath !== '/gazette') {
        console.log('🚫 BLOCKED: Path changed in finally, reverting to:', storedPath);
        window.history.replaceState(null, '', storedPath);
        if (window.location.pathname !== storedPath) {
          window.location.replace(storedPath);
        }
      }
      
      setIsLoading(false);
      
      // Long-term blocker for delayed navigations (15 seconds)
      const longTermBlocker = setInterval(() => {
        const checkPath = window.location.pathname;
        const storedPath = pathWhenOpenedRef.current || originalPath;
        if (checkPath !== storedPath && checkPath !== '/gazette') {
          console.log('🚫 BLOCKED: Delayed navigation detected, reverting to:', storedPath);
          window.history.replaceState(null, '', storedPath);
          if (typeof window.stop === 'function') {
            window.stop();
          }
        }
      }, 50);
      
      setTimeout(() => {
        clearInterval(longTermBlocker);
      }, 15000);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      e.stopPropagation();
      sendMessage(inputMessage, e);
    }
  };

  const quickQuestions = [
    "Show me all change of name entries",
    "Find entries for place of birth corrections",
    "What gazette entries exist from 2020?",
    "Show me death notices",
    "Find entries by person name",
    "What types of gazette entries are available?"
  ];

  const handleQuickQuestion = (question, e = null) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setInputMessage(question);
    sendMessage(question, e);
  };

  const handleGazetteClick = (gazette) => {
    if (onGazetteSelect) {
      onGazetteSelect(gazette);
    }
  };

  // Prevent any clicks from bubbling up to parent elements and prevent navigation
  const handleContainerClick = (e) => {
    e.stopPropagation();
    e.preventDefault();
    // Also stop immediate propagation to prevent any parent handlers
    e.stopImmediatePropagation();
  };

  const handleContainerKeyDown = (e) => {
    e.stopPropagation();
    e.stopImmediatePropagation();
    // Prevent Enter key from triggering form submissions elsewhere
    if (e.key === 'Enter' && e.target.tagName !== 'INPUT' && e.target.tagName !== 'TEXTAREA') {
      e.preventDefault();
      e.stopImmediatePropagation();
    }
  };

  // Additional protection: intercept all form submissions globally when chat is open
  useEffect(() => {
    if (!isOpen) return;

    const preventAllFormSubmissions = (e) => {
      // If this is coming from our chat container, always block it
      if (e.target.closest('.gazette-ai-chat-container')) {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
        return false;
      }
      // Also block any form submission that might navigate away
      const form = e.target.closest('form');
      if (form && form.querySelector('.gazette-ai-chat-container')) {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
        return false;
      }
    };

    // Block ALL navigation when AI chat is open - ULTRA AGGRESSIVE
    const preventAllNavigation = (e) => {
      // If event is from within chat, always allow it
      if (e.target.closest('.gazette-ai-chat-container')) {
        return; // Allow interactions within chat
      }
      
      const currentPath = window.location.pathname;
      const storedPath = pathWhenOpenedRef.current || currentPath;
      
      // Block ALL link clicks that would navigate away
      const link = e.target.closest('a');
      if (link && link.href) {
        const href = link.getAttribute('href') || link.href || '';
        
        // Block if it's an internal navigation (not external link or same page anchor)
        if (href.startsWith('/') || href.startsWith(window.location.origin + '/')) {
          try {
            const targetPath = new URL(href, window.location.origin).pathname;
            if (targetPath !== storedPath && targetPath !== currentPath) {
              console.log('🚫 BLOCKED: Link navigation from', currentPath, 'to', targetPath);
              e.preventDefault();
              e.stopPropagation();
              e.stopImmediatePropagation();
              
              // Immediately revert if navigation happened
              setTimeout(() => {
                if (window.location.pathname !== storedPath) {
                  window.history.replaceState(null, '', storedPath);
                }
              }, 0);
              
              return false;
            }
          } catch (err) {
            // If URL parsing fails, block it to be safe
            console.log('🚫 BLOCKED: Invalid URL navigation');
            e.preventDefault();
            e.stopPropagation();
            return false;
          }
        }
      }
      
      // Block any button clicks outside chat that might trigger navigation
      const button = e.target.closest('button');
      if (button && !button.closest('.gazette-ai-chat-container')) {
        const buttonType = button.type || '';
        const buttonForm = button.form;
        
        // Block form submission buttons outside chat
        if ((buttonType === 'submit' || buttonForm) && !button.closest('.gazette-ai-chat-container')) {
          console.log('🚫 BLOCKED: Form submission button outside AI chat');
          e.preventDefault();
          e.stopPropagation();
          e.stopImmediatePropagation();
          
          // Revert navigation if it happened
          setTimeout(() => {
            if (window.location.pathname !== storedPath) {
              window.history.replaceState(null, '', storedPath);
            }
          }, 0);
          
          return false;
        }
      }
    };

    // Block React Router navigation
    const originalPush = window.history.pushState;
    const originalReplace = window.history.replaceState;
    // Use the stored path from when chat was opened, or current path as fallback
    const currentPathWhenOpened = pathWhenOpenedRef.current || window.location.pathname;

    window.history.pushState = function(...args) {
      if (isOpen) {
        const url = args[2] || '';
        const currentPath = window.location.pathname;
        const storedPath = pathWhenOpenedRef.current || currentPath;
        
        // Extract path from URL
        let targetPath = '';
        if (typeof url === 'string') {
          try {
            const urlObj = new URL(url, window.location.origin);
            targetPath = urlObj.pathname;
          } catch {
            targetPath = url.startsWith('/') ? url.split('?')[0] : storedPath;
          }
        }
        
        // Block ANY navigation away from stored path
        if (targetPath && targetPath !== storedPath && targetPath !== currentPath) {
          console.log('🚫 BLOCKED: pushState navigation from', storedPath, 'to', targetPath);
          return; // Block the navigation
        }
      }
      return originalPush.apply(window.history, args);
    };

    window.history.replaceState = function(...args) {
      if (isOpen) {
        const url = args[2] || '';
        const currentPath = window.location.pathname;
        const storedPath = pathWhenOpenedRef.current || currentPath;
        
        // Extract path from URL
        let targetPath = '';
        if (typeof url === 'string') {
          try {
            const urlObj = new URL(url, window.location.origin);
            targetPath = urlObj.pathname;
          } catch {
            targetPath = url.startsWith('/') ? url.split('?')[0] : storedPath;
          }
        }
        
        // Block ANY navigation away from stored path
        if (targetPath && targetPath !== storedPath && targetPath !== currentPath) {
          console.log('🚫 BLOCKED: replaceState navigation from', storedPath, 'to', targetPath);
          return; // Block the navigation
        }
      }
      return originalReplace.apply(window.history, args);
    };

    // Use capture phase to intercept before any other handlers
    document.addEventListener('submit', preventAllFormSubmissions, true);
    document.addEventListener('click', preventAllNavigation, true);
    
    // Monitor URL changes and revert ANY navigation - ULTRA AGGRESSIVE
    const checkUrl = setInterval(() => {
      const currentPath = window.location.pathname;
      const pathToUse = pathWhenOpenedRef.current || currentPathWhenOpened;
      
      // Block ANY navigation away from the original path when chat is open
      if (currentPath !== pathToUse) {
        console.log('🚫 BLOCKED: Detected navigation from', pathToUse, 'to', currentPath, '- forcefully reverting');
        window.history.replaceState(null, '', pathToUse);
        if (typeof window.stop === 'function') {
          window.stop();
        }
        // Force revert if still changed
        if (window.location.pathname !== pathToUse) {
          window.location.replace(pathToUse);
        }
      }
    }, 5); // Check every 5ms for immediate blocking
    
    return () => {
      window.history.pushState = originalPush;
      window.history.replaceState = originalReplace;
      document.removeEventListener('submit', preventAllFormSubmissions, true);
      document.removeEventListener('click', preventAllNavigation, true);
      clearInterval(checkUrl);
    };
  }, [isOpen]);

  // Handle blocked navigation
  useEffect(() => {
    if (blocker && blocker.state === 'blocked') {
      console.log('🚫 React Router navigation was blocked, resetting blocker');
      // Reset the blocker to allow future navigation checks
      setTimeout(() => {
        blocker.reset();
      }, 100);
    }
  }, [blocker, isOpen]);
  
  if (!isOpen) return null;

  return (
    <div 
      className="gazette-ai-chat-container"
      onClick={handleContainerClick} 
      onKeyDown={handleContainerKeyDown}
      onMouseDown={(e) => {
        e.stopPropagation();
        e.stopImmediatePropagation();
      }}
      onSubmit={(e) => {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
        return false;
      }}
      style={{ 
        isolation: 'isolate',
        position: 'relative',
        zIndex: 9999
      }}
    >
      {/* Search Results Page - Full Screen Overlay - Only shows when user clicks "View All" */}
      {showResultsPage && searchResults.length > 0 && (
        <div 
          className="fixed inset-0 z-[60] bg-black bg-opacity-50 flex items-center justify-center p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowResultsPage(false);
            }
            e.stopPropagation();
          }}
        >
          <div className="bg-white rounded-lg shadow-2xl w-full max-w-6xl max-h-[90vh] flex flex-col">
            {/* Header */}
            <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white p-4 rounded-t-lg flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Search className="h-5 w-5" />
                <h3 className="font-semibold text-lg">Search Results ({searchResults.length})</h3>
              </div>
              <button
                onClick={() => setShowResultsPage(false)}
                className="p-1 hover:bg-white/20 rounded"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Results Table */}
            <div className="flex-1 overflow-y-auto p-4">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Current Name</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Old Name</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Alias Names</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Gazette #</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {searchResults.map((gazette, index) => (
                      <tr key={gazette.id || index} className="hover:bg-gray-50">
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {gazette.current_name || gazette.new_name || gazette.name_value || 'N/A'}
                          </div>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-red-600 font-medium">
                          {gazette.old_name || '-'}
                        </td>
                        <td className="px-4 py-3 text-sm text-blue-600">
                          {gazette.alias_names ? (
                            Array.isArray(gazette.alias_names) && gazette.alias_names.length > 0
                              ? gazette.alias_names.join(', ')
                              : typeof gazette.alias_names === 'string'
                              ? gazette.alias_names
                              : '-'
                          ) : '-'}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          {gazette.gazette_type && gazette.gazette_type !== 'PERSONAL_NOTICE' && (
                            <span className="px-2 py-1 text-xs font-medium rounded-full bg-purple-100 text-purple-800">
                              {gazette.gazette_type.replace(/_/g, ' ')}
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                          {gazette.gazette_number || '-'}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                          {gazette.gazette_date 
                            ? new Date(gazette.gazette_date).toLocaleDateString()
                            : gazette.publication_date
                            ? new Date(gazette.publication_date).toLocaleDateString()
                            : '-'}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              // Close results page but keep chat open
                              setShowResultsPage(false);
                              // Optionally open gazette details in a modal (without navigation)
                              if (onGazetteSelect) {
                                onGazetteSelect(gazette);
                              }
                            }}
                            className="text-purple-600 hover:text-purple-800 flex items-center space-x-1"
                          >
                            <Eye className="h-4 w-4" />
                            <span>View</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Footer */}
            <div className="border-t border-gray-200 p-4 flex justify-between items-center">
              <div className="text-sm text-gray-600">
                Showing {searchResults.length} result{searchResults.length !== 1 ? 's' : ''}
              </div>
              <button
                onClick={() => setShowResultsPage(false)}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Chat Window - ChatGPT-like full-screen interface */}
      <div 
        className={`fixed ${isMinimized ? 'bottom-4 right-4 w-80 h-16 rounded-lg' : 'inset-0'} z-[9999] bg-white ${isMinimized ? 'shadow-2xl border border-gray-200' : 'shadow-none'} flex flex-col transition-all duration-300`}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          e.stopImmediatePropagation();
          handleContainerClick(e);
        }}
        onKeyDown={(e) => {
          e.preventDefault();
          e.stopPropagation();
          e.stopImmediatePropagation();
        }}
        onMouseDown={(e) => {
          e.preventDefault();
          e.stopPropagation();
          e.stopImmediatePropagation();
        }}
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
          e.stopImmediatePropagation();
          return false;
        }}
      >
      {/* Header - ChatGPT style */}
      {!isMinimized && (
        <div className="border-b border-gray-200 bg-white px-4 py-3 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center">
              <Bot className="h-5 w-5 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-[15px] text-gray-900">Gazette AI</h3>
              <p className="text-xs text-gray-500">Ask questions about gazette entries</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={() => setIsMinimized(!isMinimized)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              title="Minimize"
            >
              <Minimize2 className="h-4 w-4 text-gray-600" />
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              title="Close"
            >
              <X className="h-4 w-4 text-gray-600" />
            </button>
          </div>
        </div>
      )}
      
      {/* Minimized Header */}
      {isMinimized && (
        <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white p-3 rounded-t-lg flex items-center justify-between cursor-pointer" onClick={() => setIsMinimized(false)}>
          <div className="flex items-center space-x-2">
            <Bot className="h-5 w-5" />
            <span className="font-semibold text-sm">Gazette AI</span>
          </div>
          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setIsMinimized(false);
              }}
              className="p-1 hover:bg-white/20 rounded"
            >
              <Maximize2 className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onClose();
              }}
              className="p-1 hover:bg-white/20 rounded"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {!isMinimized && (
        <>
          {/* Messages - ChatGPT-like styling */}
          <div className="flex-1 overflow-y-auto bg-[#f7f7f8]">
            {messages.length === 0 && (
              <div className="flex items-center justify-center h-full">
                <div className="text-center max-w-2xl px-4">
                  <div className="mb-6">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 mb-4">
                      <Sparkles className="h-8 w-8 text-white" />
                    </div>
                  </div>
                  <h4 className="text-2xl font-semibold text-gray-900 mb-3">Gazette AI Assistant</h4>
                  <p className="text-gray-600 mb-8 text-lg">
                    Ask me anything about gazette entries. I can search by name, type, date, location, and more.
                  </p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-w-2xl mx-auto">
                    {quickQuestions.slice(0, 4).map((question, index) => (
                      <button
                        key={index}
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleQuickQuestion(question, e);
                        }}
                        className="text-left p-4 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm"
                      >
                        <span className="text-sm text-gray-700">{question}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            <div className="mx-auto max-w-3xl px-4 py-6 space-y-6">
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`group w-full flex gap-4 ${
                    message.role === 'user' ? 'justify-end' : 'justify-start'
                  }`}
                >
                  {/* Avatar */}
                  <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                    message.role === 'user' 
                      ? 'bg-[#19c37d] order-2' 
                      : 'bg-[#ab68ff] order-1'
                  }`}>
                    {message.role === 'assistant' ? (
                      <Bot className="h-5 w-5 text-white" />
                    ) : (
                      <User className="h-5 w-5 text-white" />
                    )}
                  </div>

                  {/* Message Content */}
                  <div className={`flex flex-col gap-2 flex-1 ${
                    message.role === 'user' ? 'items-end order-1' : 'items-start order-2'
                  }`}>
                    <div className={`rounded-2xl px-4 py-3 max-w-[85%] ${
                      message.role === 'user'
                        ? 'bg-[#19c37d] text-white rounded-br-md'
                        : 'bg-white text-gray-800 rounded-bl-md border border-gray-200 shadow-sm'
                    }`}>
                      <div className="prose prose-sm max-w-none">
                        <div className={`text-[15px] leading-7 whitespace-pre-wrap break-words ${
                          message.role === 'user' ? 'text-white' : 'text-gray-800'
                        }`}>
                          {message.content.split('\n').map((line, i) => (
                            <React.Fragment key={i}>
                              {line}
                              {i < message.content.split('\n').length - 1 && <br />}
                            </React.Fragment>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {/* Search Results - Display inline in chat like ChatGPT */}
              {searchResults.length > 0 && (
                <div className="group w-full flex gap-4 justify-start">
                  {/* Avatar */}
                  <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center bg-[#ab68ff]">
                    <Bot className="h-5 w-5 text-white" />
                  </div>
                  
                  {/* Results Content */}
                  <div className="flex flex-col gap-2 items-start max-w-[85%]">
                    <div className="bg-white rounded-2xl rounded-bl-md border border-gray-200 shadow-sm p-4 w-full">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-2">
                          <Search className="h-4 w-4 text-purple-600" />
                          <span className="text-sm font-semibold text-gray-900">
                            Found {searchResults.length} entr{searchResults.length !== 1 ? 'ies' : 'y'}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setShowResultsPage(true);
                          }}
                          className="text-xs px-3 py-1.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center space-x-1"
                        >
                          <Eye className="h-3 w-3" />
                          <span>View All</span>
                        </button>
                      </div>
                      <div className="space-y-2 max-h-48 overflow-y-auto">
                        {searchResults.slice(0, 3).map((gazette, index) => (
                          <div
                            key={gazette.id || index}
                            className="text-sm p-3 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors"
                          >
                            <div className="font-medium text-gray-900 mb-1">
                              {gazette.name_value || gazette.current_name || gazette.new_name || gazette.officer_name || 'Untitled'}
                            </div>
                            {gazette.old_name && (
                              <div className="text-red-600 text-xs mt-1">
                                <span className="font-medium">Old Name:</span> {gazette.old_name}
                              </div>
                            )}
                            {gazette.alias_names && (
                              <div className="text-blue-600 text-xs mt-1">
                                <span className="font-medium">Alias:</span> {
                                  Array.isArray(gazette.alias_names) 
                                    ? gazette.alias_names.join(', ')
                                    : gazette.alias_names
                                }
                              </div>
                            )}
                            {(gazette.old_place_of_birth || gazette.new_place_of_birth) && (
                              <div className="text-xs mt-1 space-y-0.5">
                                {gazette.old_place_of_birth && (
                                  <div className="text-red-600">
                                    <span className="font-medium">Old POB:</span> {gazette.old_place_of_birth}
                                  </div>
                                )}
                                {gazette.new_place_of_birth && (
                                  <div className="text-green-600">
                                    <span className="font-medium">New POB:</span> {gazette.new_place_of_birth}
                                  </div>
                                )}
                              </div>
                            )}
                            {(gazette.old_date_of_birth || gazette.new_date_of_birth) && (
                              <div className="text-xs mt-1 space-y-0.5">
                                {gazette.old_date_of_birth && (
                                  <div className="text-red-600">
                                    <span className="font-medium">Old DOB:</span> {new Date(gazette.old_date_of_birth).toLocaleDateString()}
                                  </div>
                                )}
                                {gazette.new_date_of_birth && (
                                  <div className="text-green-600">
                                    <span className="font-medium">New DOB:</span> {new Date(gazette.new_date_of_birth).toLocaleDateString()}
                                  </div>
                                )}
                              </div>
                            )}
                            {(gazette.church || gazette.location || gazette.appointing_authority) && (
                              <div className="text-xs mt-1 space-y-0.5">
                                {gazette.church && (
                                  <div className="text-gray-700">
                                    <span className="font-medium">Church:</span> {gazette.church}
                                  </div>
                                )}
                                {gazette.location && (
                                  <div className="text-gray-700">
                                    <span className="font-medium">Location:</span> {gazette.location}
                                  </div>
                                )}
                                {gazette.appointing_authority && (
                                  <div className="text-gray-700">
                                    <span className="font-medium">Authority:</span> {gazette.appointing_authority}
                                  </div>
                                )}
                              </div>
                            )}
                            <div className="text-gray-500 text-xs mt-2 pt-2 border-t border-gray-200">
                              {gazette.gazette_type && gazette.gazette_type !== 'PERSONAL_NOTICE' 
                                ? gazette.gazette_type.replace(/_/g, ' ')
                                : ''}
                              {gazette.gazette_number && ` • Gazette #${gazette.gazette_number}`}
                              {gazette.gazette_date && ` • ${new Date(gazette.gazette_date).toLocaleDateString()}`}
                            </div>
                          </div>
                        ))}
                        {searchResults.length > 3 && (
                          <div className="text-xs text-purple-600 text-center py-2 font-medium">
                            + {searchResults.length - 3} more entr{searchResults.length - 3 !== 1 ? 'ies' : 'y'}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Loading State - ChatGPT style */}
              {isLoading && (
                <div className="group w-full flex gap-4 justify-start">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center bg-[#ab68ff]">
                    <Bot className="h-5 w-5 text-white" />
                  </div>
                  <div className="flex flex-col gap-2 items-start">
                    <div className="bg-white rounded-2xl rounded-bl-md border border-gray-200 shadow-sm px-4 py-3">
                      <div className="flex items-center space-x-2">
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                        </div>
                        <span className="text-sm text-gray-500">Thinking...</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Error State */}
              {error && (
                <div className="group w-full flex gap-4 justify-start">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center bg-red-500">
                    <AlertCircle className="h-5 w-5 text-white" />
                  </div>
                  <div className="flex flex-col gap-2 items-start max-w-[85%]">
                    <div className="bg-red-50 border border-red-200 rounded-2xl rounded-bl-md px-4 py-3">
                      <div className="flex items-center space-x-2">
                        <AlertCircle className="h-4 w-4 text-red-500 flex-shrink-0" />
                        <span className="text-sm text-red-600">{error}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* Input Area - ChatGPT-like styling */}
          <div className="border-t border-gray-200 bg-white">
            <div className="mx-auto max-w-3xl px-4 py-4">
              <div className="relative">
                <div className="flex items-end rounded-2xl border border-gray-300 bg-white shadow-sm hover:border-gray-400 focus-within:border-purple-500 focus-within:ring-1 focus-within:ring-purple-500 transition-all">
                  <textarea
                    ref={inputRef}
                    value={inputMessage}
                    onChange={(e) => {
                      e.stopPropagation();
                      setInputMessage(e.target.value);
                      // Auto-resize textarea
                      e.target.style.height = 'auto';
                      e.target.style.height = Math.min(e.target.scrollHeight, 200) + 'px';
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        e.stopPropagation();
                        e.stopImmediatePropagation();
                        if (inputMessage.trim() && !isLoading) {
                          // Store current path before sending
                          const currentPath = pathWhenOpenedRef.current || window.location.pathname;
                          pathWhenOpenedRef.current = currentPath;
                          
                          sendMessage(inputMessage, e);
                          // Reset textarea height
                          if (e.target) {
                            e.target.style.height = 'auto';
                          }
                        }
                      }
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      e.stopImmediatePropagation();
                    }}
                    onFocus={(e) => {
                      e.stopPropagation();
                    }}
                    placeholder="Message Gazette AI..."
                    rows={1}
                    className="w-full resize-none border-0 focus:ring-0 focus:outline-none px-4 py-3 text-[15px] leading-6 text-gray-900 placeholder-gray-500 bg-transparent"
                    disabled={isLoading}
                    autoComplete="off"
                    data-lpignore="true"
                    data-form-type="other"
                    style={{ maxHeight: '200px', minHeight: '52px' }}
                  />
                  <button
                    type="button"
                    onClick={(e) => {
                      // CRITICAL: Block all navigation and form submission
                      e.preventDefault();
                      e.stopPropagation();
                      e.stopImmediatePropagation();
                      
                      // Store current path before sending
                      const currentPath = pathWhenOpenedRef.current || window.location.pathname;
                      pathWhenOpenedRef.current = currentPath;
                      
                      if (inputMessage.trim() && !isLoading) {
                        // Set up immediate navigation blocker
                        const blockNav = setInterval(() => {
                          if (window.location.pathname !== currentPath) {
                            console.log('🚫 BLOCKED: Navigation detected in send button, reverting to:', currentPath);
                            window.history.replaceState(null, '', currentPath);
                            if (typeof window.stop === 'function') {
                              window.stop();
                            }
                          }
                        }, 5);
                        
                        sendMessage(inputMessage, e);
                        
                        // Keep blocking for 5 seconds after send
                        setTimeout(() => {
                          clearInterval(blockNav);
                          // Final check
                          if (window.location.pathname !== currentPath) {
                            window.history.replaceState(null, '', currentPath);
                          }
                        }, 5000);
                        
                        // Reset textarea height
                        if (inputRef.current) {
                          inputRef.current.style.height = 'auto';
                        }
                      }
                    }}
                    disabled={!inputMessage.trim() || isLoading}
                    className="m-2 p-2 rounded-lg bg-purple-600 text-white hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex-shrink-0"
                  >
                    {isLoading ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                      <Send className="h-5 w-5" />
                    )}
                  </button>
                </div>
                <div className="text-xs text-gray-500 mt-2 text-center">
                  AI can make mistakes. Check important info.
                </div>
              </div>
            </div>
          </div>
        </>
      )}
      </div>
    </div>
  );
};

export default GazetteAIChat;
