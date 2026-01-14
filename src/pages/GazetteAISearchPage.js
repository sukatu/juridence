import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Send, 
  Bot, 
  User, 
  X, 
  ArrowLeft,
  Loader2,
  Sparkles,
  Search,
  Eye,
  AlertCircle,
  History,
  Trash2,
  BarChart3,
  Clock,
  DollarSign,
  Zap,
  Folder,
  FolderPlus,
  Star,
  ThumbsUp,
  ThumbsDown,
  MoreVertical,
  ChevronRight,
  ChevronDown,
  MessageSquare,
  Bookmark,
  BookmarkCheck,
  Menu
} from 'lucide-react';
import { apiPost, apiGet, apiDelete } from '../utils/api';

const GazetteAISearchPage = () => {
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchResults, setSearchResults] = useState([]);
  const [chatHistory, setChatHistory] = useState([]);
  const [showUsageModal, setShowUsageModal] = useState(false);
  const [usageStats, setUsageStats] = useState(null);
  const [loadingUsage, setLoadingUsage] = useState(false);
  const [sessionId] = useState(() => `gazette_ai_${Date.now()}`);
  const [chatTitle, setChatTitle] = useState('New Chat');
  const [showSidebar, setShowSidebar] = useState(true);
  const [folders, setFolders] = useState([]);
  const [chatSessions, setChatSessions] = useState([]);
  const [selectedFolder, setSelectedFolder] = useState(null);
  const [selectedSession, setSelectedSession] = useState(null);
  const [showFolderModal, setShowFolderModal] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [expandedFolders, setExpandedFolders] = useState({});
  const [favorites, setFavorites] = useState([]);
  const [messageLikes, setMessageLikes] = useState({});
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const quickQuestions = [
    "Search for change of name entries",
    "Find correction of place of birth records",
    "Show me correction of date of birth entries",
    "Search for marriage officers",
    "Find entries by person name",
    "Show entries by gazette number"
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, searchResults]);

  useEffect(() => {
    // Load all data from localStorage on mount
    loadAllChatData();
    
    // Focus input when component mounts
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  const loadAllChatData = () => {
    try {
      // Load current session history
      const savedHistory = localStorage.getItem(`gazette_ai_chat_${sessionId}`);
      if (savedHistory) {
        const parsedHistory = JSON.parse(savedHistory);
        setMessages(parsedHistory.messages || []);
        setChatHistory(parsedHistory.chatHistory || []);
        setSearchResults(parsedHistory.searchResults || []);
        setChatTitle(parsedHistory.title || 'New Chat');
      }

      // Load folders
      const savedFolders = localStorage.getItem('gazette_ai_folders');
      if (savedFolders) {
        setFolders(JSON.parse(savedFolders));
      }

      // Load chat sessions
      const savedSessions = localStorage.getItem('gazette_ai_sessions');
      if (savedSessions) {
        setChatSessions(JSON.parse(savedSessions));
      }

      // Load favorites
      const savedFavorites = localStorage.getItem('gazette_ai_favorites');
      if (savedFavorites) {
        setFavorites(JSON.parse(savedFavorites));
      }

      // Load message likes
      const savedLikes = localStorage.getItem('gazette_ai_message_likes');
      if (savedLikes) {
        setMessageLikes(JSON.parse(savedLikes));
      }

      // Load expanded folders state
      const savedExpanded = localStorage.getItem('gazette_ai_expanded_folders');
      if (savedExpanded) {
        setExpandedFolders(JSON.parse(savedExpanded));
      }
    } catch (err) {
      console.warn('Error loading chat data:', err);
    }
  };

  // Save chat history to localStorage whenever messages change
  useEffect(() => {
    if (messages.length > 0) {
      const historyToSave = {
        messages,
        chatHistory,
        searchResults,
        title: chatTitle,
        timestamp: new Date().toISOString(),
        sessionId
      };
      localStorage.setItem(`gazette_ai_chat_${sessionId}`, JSON.stringify(historyToSave));
      
      // Also update the sessions list
      updateChatSessions();
    }
  }, [messages, chatHistory, searchResults, sessionId, chatTitle]);

  // Save folders, favorites, and likes whenever they change
  useEffect(() => {
    localStorage.setItem('gazette_ai_folders', JSON.stringify(folders));
  }, [folders]);

  useEffect(() => {
    localStorage.setItem('gazette_ai_favorites', JSON.stringify(favorites));
  }, [favorites]);

  useEffect(() => {
    localStorage.setItem('gazette_ai_message_likes', JSON.stringify(messageLikes));
  }, [messageLikes]);

  useEffect(() => {
    localStorage.setItem('gazette_ai_expanded_folders', JSON.stringify(expandedFolders));
  }, [expandedFolders]);

  const updateChatSessions = () => {
    const existingSessions = JSON.parse(localStorage.getItem('gazette_ai_sessions') || '[]');
    const sessionIndex = existingSessions.findIndex(s => s.sessionId === sessionId);
    
    const sessionData = {
      sessionId,
      title: chatTitle,
      timestamp: new Date().toISOString(),
      messageCount: messages.length,
      folderId: selectedFolder,
      isFavorite: favorites.includes(sessionId)
    };

    if (sessionIndex >= 0) {
      existingSessions[sessionIndex] = sessionData;
    } else {
      existingSessions.unshift(sessionData);
    }

    // Keep only last 100 sessions
    const limitedSessions = existingSessions.slice(0, 100);
    setChatSessions(limitedSessions);
    localStorage.setItem('gazette_ai_sessions', JSON.stringify(limitedSessions));
  };

  const sendMessage = async (message = inputMessage, event = null) => {
    // Safely handle event if provided
    if (event && typeof event === 'object') {
      try {
        if (typeof event.preventDefault === 'function') {
          event.preventDefault();
        }
        if (typeof event.stopPropagation === 'function') {
          event.stopPropagation();
        }
        if (typeof event.stopImmediatePropagation === 'function') {
          event.stopImmediatePropagation();
        }
      } catch (err) {
        // Silently ignore event handling errors
        console.warn('Event handling error:', err);
      }
    }

    if (!message.trim() || isLoading) {
      return;
    }

    const userMessage = {
      role: 'user',
      content: message.trim(),
      timestamp: new Date().toISOString()
    };

    setMessages(prev => {
      const newMessages = [...prev, userMessage];
      // Update chat title from first user message if not set
      if (prev.length === 0 && chatTitle === 'New Chat') {
        const titleText = message.trim().substring(0, 50);
        setChatTitle(titleText || 'New Chat');
      }
      return newMessages;
    });
    setInputMessage('');
    setIsLoading(true);
    setError(null);
    setSearchResults([]);

    try {
      const response = await apiPost('/gazette-ai-chat/chat', {
        message: message.trim(),
        chat_history: chatHistory
      });

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
        } else {
          setSearchResults([]);
        }
      } else {
        setError(response.error || 'Failed to get AI response');
      }
    } catch (err) {
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
      setIsLoading(false);
    }
  };

  const handleQuickQuestion = (question, event = null) => {
    // Safely handle event if provided
    if (event && typeof event === 'object') {
      try {
        if (typeof event.preventDefault === 'function') {
          event.preventDefault();
        }
        if (typeof event.stopPropagation === 'function') {
          event.stopPropagation();
        }
        if (typeof event.stopImmediatePropagation === 'function') {
          event.stopImmediatePropagation();
        }
      } catch (err) {
        // Silently ignore event handling errors
        console.warn('Event handling error:', err);
      }
    }
    sendMessage(question, event);
  };

  const handleKeyPress = (e) => {
    if (e && e.key === 'Enter' && !e.shiftKey) {
      try {
        if (typeof e.preventDefault === 'function') {
          e.preventDefault();
        }
        if (typeof e.stopPropagation === 'function') {
          e.stopPropagation();
        }
      } catch (err) {
        // Silently ignore event handling errors
        console.warn('Event handling error:', err);
      }
      sendMessage(inputMessage, e);
    }
  };

  const handleDeleteHistory = async () => {
    if (window.confirm('Are you sure you want to delete all chat history? This action cannot be undone.')) {
      // Clear local state and localStorage first
      setMessages([]);
      setChatHistory([]);
      setSearchResults([]);
      localStorage.removeItem(`gazette_ai_chat_${sessionId}`);
      
      // Try to clear from server (but don't fail if it doesn't work)
      try {
        await apiDelete(`/gazette-ai-chat/history/clear?session_id=${sessionId}`);
      } catch (err) {
        // Silently fail - local history is already cleared
        console.warn('Note: Server history clear failed (local history cleared):', err);
      }
    }
  };

  const handleViewUsage = async () => {
    setLoadingUsage(true);
    setShowUsageModal(true);
    try {
      const response = await apiGet('/gazette-ai-chat/usage?days=30');
      if (response.success) {
        setUsageStats(response.stats);
      } else {
        setError('Failed to load usage statistics');
      }
    } catch (err) {
      console.error('Error loading usage stats:', err);
      setError('Failed to load usage statistics');
    } finally {
      setLoadingUsage(false);
    }
  };

  const handleCreateFolder = () => {
    if (newFolderName.trim()) {
      const newFolder = {
        id: `folder_${Date.now()}`,
        name: newFolderName.trim(),
        createdAt: new Date().toISOString(),
        sessionIds: []
      };
      setFolders([...folders, newFolder]);
      setNewFolderName('');
      setShowFolderModal(false);
    }
  };

  const handleDeleteFolder = (folderId) => {
    if (window.confirm('Are you sure you want to delete this folder? Sessions will be moved to the root.')) {
      const updatedFolders = folders.filter(f => f.id !== folderId);
      setFolders(updatedFolders);
      
      // Update sessions to remove folder reference
      const updatedSessions = chatSessions.map(s => 
        s.folderId === folderId ? { ...s, folderId: null } : s
      );
      setChatSessions(updatedSessions);
      localStorage.setItem('gazette_ai_sessions', JSON.stringify(updatedSessions));
    }
  };

  const handleToggleFolder = (folderId) => {
    setExpandedFolders(prev => ({
      ...prev,
      [folderId]: !prev[folderId]
    }));
  };

  const handleLoadSession = (session) => {
    const savedHistory = localStorage.getItem(`gazette_ai_chat_${session.sessionId}`);
    if (savedHistory) {
      try {
        const parsedHistory = JSON.parse(savedHistory);
        setMessages(parsedHistory.messages || []);
        setChatHistory(parsedHistory.chatHistory || []);
        setSearchResults(parsedHistory.searchResults || []);
        setChatTitle(parsedHistory.title || session.title || 'Chat');
        
        // Load likes for this session
        const sessionLikes = messageLikes[session.sessionId] || {};
        setMessageLikes({ ...messageLikes, [session.sessionId]: sessionLikes });
        
        // Update selected session
        setSelectedSession(session.sessionId);
      } catch (err) {
        console.error('Error loading session:', err);
        setError('Failed to load chat session');
      }
    }
  };

  const handleNewChat = () => {
    const newSessionId = `gazette_ai_${Date.now()}`;
    setMessages([]);
    setChatHistory([]);
    setSearchResults([]);
    setChatTitle('New Chat');
    setSelectedSession(null);
    setSelectedFolder(null);
    setError(null);
    
    // Create new session in storage
    const newSession = {
      sessionId: newSessionId,
      title: 'New Chat',
      timestamp: new Date().toISOString(),
      messageCount: 0,
      folderId: selectedFolder,
      isFavorite: false
    };
    setChatSessions([newSession, ...chatSessions]);
    localStorage.setItem('gazette_ai_sessions', JSON.stringify([newSession, ...chatSessions]));
    
    // Update current session ID by reloading the page
    window.location.href = `/gazette-ai-search?session=${newSessionId}`;
  };

  const handleLikeMessage = (messageIndex, isLiked) => {
    const messageId = `${sessionId}_${messageIndex}`;
    setMessageLikes(prev => ({
      ...prev,
      [sessionId]: {
        ...(prev[sessionId] || {}),
        [messageIndex]: isLiked ? 'like' : prev[sessionId]?.[messageIndex] === 'like' ? null : 'dislike'
      }
    }));
  };

  const handleToggleFavorite = (sessionId) => {
    if (favorites.includes(sessionId)) {
      setFavorites(favorites.filter(id => id !== sessionId));
      // Update session
      const updatedSessions = chatSessions.map(s => 
        s.sessionId === sessionId ? { ...s, isFavorite: false } : s
      );
      setChatSessions(updatedSessions);
      localStorage.setItem('gazette_ai_sessions', JSON.stringify(updatedSessions));
    } else {
      setFavorites([...favorites, sessionId]);
      // Update session
      const updatedSessions = chatSessions.map(s => 
        s.sessionId === sessionId ? { ...s, isFavorite: true } : s
      );
      setChatSessions(updatedSessions);
      localStorage.setItem('gazette_ai_sessions', JSON.stringify(updatedSessions));
    }
  };

  const handleMoveToFolder = (sessionId, folderId) => {
    const updatedSessions = chatSessions.map(s => 
      s.sessionId === sessionId ? { ...s, folderId } : s
    );
    setChatSessions(updatedSessions);
    localStorage.setItem('gazette_ai_sessions', JSON.stringify(updatedSessions));
    
    // Update folder's session list
    if (folderId) {
      const updatedFolders = folders.map(f => 
        f.id === folderId 
          ? { ...f, sessionIds: [...(f.sessionIds || []), sessionId] }
          : f
      );
      setFolders(updatedFolders);
    }
  };

  // Get sessions by folder
  const getSessionsByFolder = (folderId) => {
    return chatSessions.filter(s => s.folderId === folderId);
  };

  const getSessionsWithoutFolder = () => {
    return chatSessions.filter(s => !s.folderId);
  };

  const getFavoriteSessions = () => {
    return chatSessions.filter(s => favorites.includes(s.sessionId));
  };

  return (
    <div className="min-h-screen bg-[#f7f7f8] flex">
      {/* Sidebar */}
      <div className={`${showSidebar ? 'w-64' : 'w-0'} bg-gray-900 text-white transition-all duration-300 overflow-hidden flex flex-col border-r border-gray-800`}>
        {/* Sidebar Header */}
        <div className="p-4 border-b border-gray-800 flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
            <img
              src="/juridence-logo.svg"
              alt="Juridence Logo"
              className="h-8 w-auto object-contain"
              style={{ filter: 'brightness(0) invert(1)' }}
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = "/logos/logo-white.png";
              }}
            />
            <span className="font-semibold text-sm text-white hidden sm:inline">Gazette AI</span>
          </Link>
          <button
            type="button"
            onClick={() => setShowSidebar(false)}
            className="p-1 hover:bg-gray-800 rounded transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* New Chat Button */}
        <div className="p-3 border-b border-gray-800">
          <button
            onClick={handleNewChat}
            className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors text-sm font-medium"
          >
            <MessageSquare className="h-4 w-4" />
            <span>New Chat</span>
          </button>
        </div>

        {/* Sidebar Content - Scrollable */}
        <div className="flex-1 overflow-y-auto p-2 space-y-2">
          {/* Favorites Section */}
          {getFavoriteSessions().length > 0 && (
            <div className="mb-4">
              <div className="flex items-center space-x-2 px-2 py-1 text-xs font-semibold text-gray-400 uppercase mb-2">
                <Star className="h-3 w-3" />
                <span>Favorites</span>
              </div>
              {getFavoriteSessions().map((session) => (
                <button
                  key={session.sessionId}
                  onClick={() => handleLoadSession(session)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors flex items-center justify-between group ${
                    selectedSession === session.sessionId
                      ? 'bg-purple-600 text-white'
                      : 'hover:bg-gray-800 text-gray-300'
                  }`}
                >
                  <div className="flex items-center space-x-2 flex-1 min-w-0">
                    <MessageSquare className="h-4 w-4 flex-shrink-0" />
                    <span className="truncate">{session.title}</span>
                  </div>
                  <Star className="h-3 w-3 text-yellow-400 flex-shrink-0" />
                </button>
              ))}
            </div>
          )}

          {/* Folders Section */}
          <div className="mb-4">
            <div className="flex items-center justify-between px-2 py-1 mb-2">
              <div className="flex items-center space-x-2 text-xs font-semibold text-gray-400 uppercase">
                <Folder className="h-3 w-3" />
                <span>Folders</span>
              </div>
              <button
                type="button"
                onClick={() => setShowFolderModal(true)}
                className="p-1 hover:bg-gray-800 rounded transition-colors"
                title="New Folder"
              >
                <FolderPlus className="h-3 w-3 text-gray-400" />
              </button>
            </div>
            {folders.length > 0 ? (
              folders.map((folder) => (
                <div key={folder.id} className="mb-1">
                  <button
                    onClick={() => handleToggleFolder(folder.id)}
                    className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors hover:bg-gray-800 text-gray-300 group"
                  >
                    <div className="flex items-center space-x-2 flex-1">
                      {expandedFolders[folder.id] ? (
                        <ChevronDown className="h-4 w-4" />
                      ) : (
                        <ChevronRight className="h-4 w-4" />
                      )}
                      <Folder className="h-4 w-4" />
                      <span className="truncate">{folder.name}</span>
                      <span className="text-xs text-gray-500">
                        ({getSessionsByFolder(folder.id).length})
                      </span>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteFolder(folder.id);
                      }}
                      className="p-1 hover:bg-gray-700 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                      title="Delete Folder"
                    >
                      <Trash2 className="h-3 w-3 text-red-400" />
                    </button>
                  </button>
                  {expandedFolders[folder.id] && (
                    <div className="ml-4 mt-1 space-y-1">
                      {getSessionsByFolder(folder.id).map((session) => (
                        <button
                          key={session.sessionId}
                          onClick={() => handleLoadSession(session)}
                          className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors flex items-center justify-between ${
                            selectedSession === session.sessionId
                              ? 'bg-purple-600 text-white'
                              : 'hover:bg-gray-800 text-gray-300'
                          }`}
                        >
                          <div className="flex items-center space-x-2 flex-1 min-w-0">
                            <MessageSquare className="h-3 w-3 flex-shrink-0" />
                            <span className="truncate">{session.title}</span>
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleToggleFavorite(session.sessionId);
                            }}
                            className="p-1 hover:bg-gray-700 rounded"
                          >
                            {favorites.includes(session.sessionId) ? (
                              <Star className="h-3 w-3 text-yellow-400 fill-yellow-400" />
                            ) : (
                              <Star className="h-3 w-3 text-gray-500" />
                            )}
                          </button>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))
            ) : (
              <button
                type="button"
                onClick={() => setShowFolderModal(true)}
                className="w-full px-3 py-2 rounded-lg text-sm transition-colors hover:bg-gray-800 text-gray-400 hover:text-gray-300 border border-gray-700 border-dashed flex items-center justify-center space-x-2"
              >
                <FolderPlus className="h-4 w-4" />
                <span>Create Folder</span>
              </button>
            )}
          </div>

          {/* Recent Chats Section */}
          <div>
            <div className="flex items-center justify-between px-2 py-1 mb-2">
              <div className="flex items-center space-x-2 text-xs font-semibold text-gray-400 uppercase">
                <History className="h-3 w-3" />
                <span>Recent</span>
              </div>
              {folders.length === 0 && (
                <button
                  type="button"
                  onClick={() => setShowFolderModal(true)}
                  className="p-1 hover:bg-gray-800 rounded transition-colors"
                  title="New Folder"
                >
                  <FolderPlus className="h-3 w-3 text-gray-400" />
                </button>
              )}
            </div>
            {getSessionsWithoutFolder()
              .filter(s => !favorites.includes(s.sessionId))
              .slice(0, 20)
              .map((session) => (
                <button
                  key={session.sessionId}
                  type="button"
                  onClick={() => handleLoadSession(session)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors flex items-center justify-between group mb-1 ${
                    selectedSession === session.sessionId
                      ? 'bg-purple-600 text-white'
                      : 'hover:bg-gray-800 text-gray-300'
                  }`}
                >
                  <div className="flex items-center space-x-2 flex-1 min-w-0">
                    <MessageSquare className="h-4 w-4 flex-shrink-0" />
                    <span className="truncate">{session.title}</span>
                  </div>
                  <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleToggleFavorite(session.sessionId);
                      }}
                      className="p-1 hover:bg-gray-700 rounded"
                      title="Favorite"
                    >
                      {favorites.includes(session.sessionId) ? (
                        <Star className="h-3 w-3 text-yellow-400 fill-yellow-400" />
                      ) : (
                        <Star className="h-3 w-3 text-gray-500" />
                      )}
                    </button>
                  </div>
                </button>
              ))}
            {chatSessions.length === 0 && (
              <div className="text-center py-8 px-2">
                <MessageSquare className="h-8 w-8 text-gray-600 mx-auto mb-2 opacity-50" />
                <p className="text-xs text-gray-500">No chat history yet</p>
                <p className="text-xs text-gray-600 mt-1">Start a new conversation to see it here</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <div className="border-b border-gray-200 bg-white sticky top-0 z-10">
          <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {!showSidebar && (
                <button
                  onClick={() => setShowSidebar(true)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  title="Show Sidebar"
                >
                  <Menu className="h-5 w-5 text-gray-600" />
                </button>
              )}
              <button
                onClick={() => navigate(-1)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                title="Go back"
              >
                <ArrowLeft className="h-5 w-5 text-gray-600" />
              </button>
              <div className="flex items-center space-x-3">
                <img
                  src="/juridence-logo.svg"
                  alt="Juridence Logo"
                  className="h-10 w-auto object-contain"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = "/logos/main-logo.png";
                  }}
                />
                <div className="hidden md:block">
                  <h1 className="text-xl font-semibold text-gray-900">{chatTitle}</h1>
                  <p className="text-sm text-gray-500">Gazette AI Search</p>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => handleToggleFavorite(sessionId)}
                className={`p-2 rounded-lg transition-colors ${
                  favorites.includes(sessionId)
                    ? 'bg-yellow-100 text-yellow-600'
                    : 'hover:bg-gray-100 text-gray-600 hover:text-yellow-600'
                }`}
                title={favorites.includes(sessionId) ? 'Remove from Favorites' : 'Add to Favorites'}
              >
                {favorites.includes(sessionId) ? (
                  <BookmarkCheck className="h-5 w-5" />
                ) : (
                  <Bookmark className="h-5 w-5" />
                )}
              </button>
              <button
                onClick={handleViewUsage}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-600 hover:text-purple-600"
                title="View Usage Statistics"
              >
                <BarChart3 className="h-5 w-5" />
              </button>
              <button
                onClick={handleDeleteHistory}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-600 hover:text-red-600"
                title="Delete Chat History"
              >
                <Trash2 className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto">
        {messages.length === 0 && (
          <div className="flex items-center justify-center h-full">
            <div className="text-center max-w-2xl px-4">
              <div className="mb-6">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 mb-4">
                  <Sparkles className="h-10 w-10 text-white" />
                </div>
              </div>
              <h2 className="text-3xl font-semibold text-gray-900 mb-4">Gazette AI Assistant</h2>
              <p className="text-gray-600 mb-8 text-lg">
                Ask me anything about gazette entries. I can search across:
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-w-2xl mx-auto mb-8">
                <div className="bg-white border border-gray-200 rounded-lg p-4 text-left">
                  <div className="font-semibold text-gray-900 mb-1">Change of Name</div>
                  <div className="text-sm text-gray-600">Search gazette entries for name changes</div>
                </div>
                <div className="bg-white border border-gray-200 rounded-lg p-4 text-left">
                  <div className="font-semibold text-gray-900 mb-1">Correction of Place of Birth</div>
                  <div className="text-sm text-gray-600">Find place of birth corrections</div>
                </div>
                <div className="bg-white border border-gray-200 rounded-lg p-4 text-left">
                  <div className="font-semibold text-gray-900 mb-1">Correction of Date of Birth</div>
                  <div className="text-sm text-gray-600">Search date of birth corrections</div>
                </div>
                <div className="bg-white border border-gray-200 rounded-lg p-4 text-left">
                  <div className="font-semibold text-gray-900 mb-1">Marriage Officers</div>
                  <div className="text-sm text-gray-600">Find appointed marriage officers</div>
                </div>
              </div>

              <div className="text-sm font-medium text-gray-700 mb-3">Quick Questions:</div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-w-2xl mx-auto">
                {quickQuestions.map((question, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={(e) => handleQuickQuestion(question, e)}
                    className="text-left p-4 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm"
                  >
                    <span className="text-sm text-gray-700">{question}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        <div className="mx-auto max-w-4xl px-4 py-6 space-y-6">
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
                {/* Like/Dislike buttons for assistant messages */}
                {message.role === 'assistant' && (
                  <div className="flex items-center space-x-2 px-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      type="button"
                      onClick={() => handleLikeMessage(index, true)}
                      className={`p-1.5 rounded-lg transition-colors ${
                        messageLikes[sessionId]?.[index] === 'like'
                          ? 'bg-green-100 text-green-600'
                          : 'hover:bg-gray-100 text-gray-600 hover:text-green-600'
                      }`}
                      title="Like"
                    >
                      <ThumbsUp className={`h-4 w-4 ${messageLikes[sessionId]?.[index] === 'like' ? 'fill-current' : ''}`} />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleLikeMessage(index, false)}
                      className={`p-1.5 rounded-lg transition-colors ${
                        messageLikes[sessionId]?.[index] === 'dislike'
                          ? 'bg-red-100 text-red-600'
                          : 'hover:bg-gray-100 text-gray-600 hover:text-red-600'
                      }`}
                      title="Dislike"
                    >
                      <ThumbsDown className={`h-4 w-4 ${messageLikes[sessionId]?.[index] === 'dislike' ? 'fill-current' : ''}`} />
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}

          {/* Search Results - Display inline in chat */}
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
                  </div>
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {searchResults.slice(0, 10).map((entry, index) => (
                      <div
                        key={entry.id || index}
                        className="text-sm p-3 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors"
                      >
                        <div className="font-medium text-gray-900 mb-1">
                          {entry.name_value || entry.current_name || entry.new_name || entry.officer_name || entry.person_name || 'Untitled'}
                        </div>
                        {entry.old_name && (
                          <div className="text-red-600 text-xs mt-1">
                            <span className="font-medium">Old Name:</span> {entry.old_name}
                          </div>
                        )}
                        {entry.alias_names && (
                          <div className="text-blue-600 text-xs mt-1">
                            <span className="font-medium">Alias:</span> {
                              Array.isArray(entry.alias_names) 
                                ? entry.alias_names.join(', ')
                                : entry.alias_names
                            }
                          </div>
                        )}
                        {(entry.old_place_of_birth || entry.new_place_of_birth) && (
                          <div className="text-xs mt-1 space-y-0.5">
                            {entry.old_place_of_birth && (
                              <div className="text-red-600">
                                <span className="font-medium">Old POB:</span> {entry.old_place_of_birth}
                              </div>
                            )}
                            {entry.new_place_of_birth && (
                              <div className="text-green-600">
                                <span className="font-medium">New POB:</span> {entry.new_place_of_birth}
                              </div>
                            )}
                          </div>
                        )}
                        {(entry.old_date_of_birth || entry.new_date_of_birth) && (
                          <div className="text-xs mt-1 space-y-0.5">
                            {entry.old_date_of_birth && (
                              <div className="text-red-600">
                                <span className="font-medium">Old DOB:</span> {new Date(entry.old_date_of_birth).toLocaleDateString()}
                              </div>
                            )}
                            {entry.new_date_of_birth && (
                              <div className="text-green-600">
                                <span className="font-medium">New DOB:</span> {new Date(entry.new_date_of_birth).toLocaleDateString()}
                              </div>
                            )}
                          </div>
                        )}
                        {(entry.church || entry.location || entry.appointing_authority) && (
                          <div className="text-xs mt-1 space-y-0.5">
                            {entry.church && (
                              <div className="text-gray-700">
                                <span className="font-medium">Church:</span> {entry.church}
                              </div>
                            )}
                            {entry.location && (
                              <div className="text-gray-700">
                                <span className="font-medium">Location:</span> {entry.location}
                              </div>
                            )}
                            {entry.appointing_authority && (
                              <div className="text-gray-700">
                                <span className="font-medium">Authority:</span> {entry.appointing_authority}
                              </div>
                            )}
                          </div>
                        )}
                        <div className="text-gray-500 text-xs mt-2 pt-2 border-t border-gray-200">
                          {entry.gazette_type && entry.gazette_type !== 'PERSONAL_NOTICE' 
                            ? entry.gazette_type.replace(/_/g, ' ')
                            : ''}
                          {entry.gazette_number && ` • Gazette #${entry.gazette_number}`}
                          {entry.gazette_date && ` • ${new Date(entry.gazette_date).toLocaleDateString()}`}
                          {entry.publication_date && ` • ${new Date(entry.publication_date).toLocaleDateString()}`}
                        </div>
                      </div>
                    ))}
                    {searchResults.length > 10 && (
                      <div className="text-xs text-purple-600 text-center py-2 font-medium">
                        + {searchResults.length - 10} more entr{searchResults.length - 10 !== 1 ? 'ies' : 'y'}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Loading State */}
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
      <div className="border-t border-gray-200 bg-white sticky bottom-0">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="relative">
            <div className="flex items-end rounded-2xl border border-gray-300 bg-white shadow-sm hover:border-gray-400 focus-within:border-purple-500 focus-within:ring-1 focus-within:ring-purple-500 transition-all">
              <textarea
                ref={inputRef}
                value={inputMessage}
                onChange={(e) => {
                  setInputMessage(e.target.value);
                  // Auto-resize textarea
                  e.target.style.height = 'auto';
                  e.target.style.height = Math.min(e.target.scrollHeight, 200) + 'px';
                }}
                onKeyDown={handleKeyPress}
                placeholder="Message Gazette AI..."
                rows={1}
                className="w-full resize-none border-0 focus:ring-0 focus:outline-none px-4 py-3 text-[15px] leading-6 text-gray-900 placeholder-gray-500 bg-transparent"
                disabled={isLoading}
                autoComplete="off"
                data-lpignore="true"
                style={{ maxHeight: '200px', minHeight: '52px' }}
              />
              <button
                type="button"
                onClick={(e) => {
                  try {
                    if (e && typeof e.preventDefault === 'function') {
                      e.preventDefault();
                    }
                    if (e && typeof e.stopPropagation === 'function') {
                      e.stopPropagation();
                    }
                  } catch (err) {
                    console.warn('Event handling error in button:', err);
                  }
                  if (inputMessage.trim() && !isLoading) {
                    sendMessage(inputMessage, e);
                    // Reset textarea
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
      </div>
      {/* Main Chat Area End */}

      {/* Folder Creation Modal */}
      {showFolderModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <FolderPlus className="h-6 w-6 text-purple-600" />
                <h2 className="text-xl font-semibold text-gray-900">Create New Folder</h2>
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowFolderModal(false);
                  setNewFolderName('');
                }}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="h-5 w-5 text-gray-600" />
              </button>
            </div>

            <div className="p-6">
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Folder Name
                </label>
                <input
                  type="text"
                  value={newFolderName}
                  onChange={(e) => setNewFolderName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && newFolderName.trim()) {
                      handleCreateFolder();
                    }
                  }}
                  placeholder="Enter folder name..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  autoFocus
                />
              </div>
              <div className="flex items-center justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowFolderModal(false);
                    setNewFolderName('');
                  }}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleCreateFolder}
                  disabled={!newFolderName.trim()}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Create Folder
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Usage Statistics Modal */}
      {showUsageModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <BarChart3 className="h-6 w-6 text-purple-600" />
                <h2 className="text-xl font-semibold text-gray-900">Usage Statistics</h2>
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowUsageModal(false);
                  setUsageStats(null);
                }}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="h-5 w-5 text-gray-600" />
              </button>
            </div>

            <div className="p-6">
              {loadingUsage ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
                  <span className="ml-3 text-gray-600">Loading usage statistics...</span>
                </div>
              ) : usageStats ? (
                <div className="space-y-6">
                  {/* Period Info */}
                  {usageStats.period && (
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <Clock className="h-4 w-4" />
                        <span>
                          Period: {new Date(usageStats.period.start_date).toLocaleDateString()} - {new Date(usageStats.period.end_date).toLocaleDateString()} ({usageStats.period.days} days)
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Overview Stats */}
                  {usageStats.overview && (
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Overview</h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
                          <div className="flex items-center space-x-2 mb-2">
                            <Zap className="h-5 w-5 text-purple-600" />
                            <span className="text-sm font-medium text-gray-600">Total Requests</span>
                          </div>
                          <p className="text-2xl font-bold text-purple-900">{usageStats.overview.total_requests || 0}</p>
                        </div>
                        <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                          <div className="flex items-center space-x-2 mb-2">
                            <BarChart3 className="h-5 w-5 text-blue-600" />
                            <span className="text-sm font-medium text-gray-600">Total Tokens</span>
                          </div>
                          <p className="text-2xl font-bold text-blue-900">{usageStats.overview.total_tokens?.toLocaleString() || 0}</p>
                          {usageStats.overview.average_tokens_per_request > 0 && (
                            <p className="text-xs text-gray-600 mt-1">Avg: {usageStats.overview.average_tokens_per_request} per request</p>
                          )}
                        </div>
                        <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                          <div className="flex items-center space-x-2 mb-2">
                            <DollarSign className="h-5 w-5 text-green-600" />
                            <span className="text-sm font-medium text-gray-600">Total Cost</span>
                          </div>
                          <p className="text-2xl font-bold text-green-900">${usageStats.overview.total_cost?.toFixed(4) || '0.0000'}</p>
                          {usageStats.overview.average_cost_per_request > 0 && (
                            <p className="text-xs text-gray-600 mt-1">Avg: ${usageStats.overview.average_cost_per_request.toFixed(4)} per request</p>
                          )}
                        </div>
                      </div>
                      {usageStats.overview.average_response_time_ms > 0 && (
                        <div className="mt-4 bg-gray-50 rounded-lg p-4">
                          <div className="flex items-center space-x-2">
                            <Clock className="h-4 w-4 text-gray-600" />
                            <span className="text-sm text-gray-600">Average Response Time: </span>
                            <span className="text-sm font-semibold text-gray-900">{usageStats.overview.average_response_time_ms.toFixed(2)}ms</span>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Token Breakdown */}
                  {usageStats.tokens && (
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Token Breakdown</h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                          <p className="text-sm font-medium text-gray-600 mb-1">Prompt Tokens</p>
                          <p className="text-xl font-bold text-blue-900">{usageStats.tokens.prompt_tokens?.toLocaleString() || 0}</p>
                        </div>
                        <div className="bg-indigo-50 rounded-lg p-4 border border-indigo-200">
                          <p className="text-sm font-medium text-gray-600 mb-1">Completion Tokens</p>
                          <p className="text-xl font-bold text-indigo-900">{usageStats.tokens.completion_tokens?.toLocaleString() || 0}</p>
                        </div>
                        <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
                          <p className="text-sm font-medium text-gray-600 mb-1">Average per Request</p>
                          <p className="text-xl font-bold text-purple-900">{usageStats.tokens.average_per_request?.toLocaleString() || 0}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Daily Usage */}
                  {usageStats.daily_usage && usageStats.daily_usage.length > 0 && (
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Daily Usage</h3>
                      <div className="space-y-2 max-h-64 overflow-y-auto">
                        {usageStats.daily_usage.map((day, index) => (
                          <div key={index} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                            <div className="flex items-center justify-between mb-2">
                              <span className="font-medium text-gray-900">{new Date(day.date).toLocaleDateString()}</span>
                              <span className="text-sm text-gray-600">{day.requests} request{day.requests !== 1 ? 's' : ''}</span>
                            </div>
                            <div className="grid grid-cols-2 gap-4 text-sm">
                              <div>
                                <span className="text-gray-600">Tokens: </span>
                                <span className="font-semibold text-gray-900">{day.tokens?.toLocaleString() || 0}</span>
                              </div>
                              <div>
                                <span className="text-gray-600">Cost: </span>
                                <span className="font-semibold text-gray-900">${day.cost?.toFixed(4) || '0.0000'}</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {(!usageStats.overview || usageStats.overview.total_requests === 0) && (
                    <div className="text-center py-12">
                      <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600">No usage data available for the selected period.</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-12">
                  <AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-4" />
                  <p className="text-gray-600">Failed to load usage statistics.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GazetteAISearchPage;
