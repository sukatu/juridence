import React, { useState, useEffect, useRef } from 'react';
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
  AlertCircle
} from 'lucide-react';

const AIChat = ({ caseId, caseTitle, isOpen, onClose, onMinimize }) => {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const [error, setError] = useState(null);
  const [isMinimized, setIsMinimized] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const sendMessage = async (message = inputMessage) => {
    if (!message.trim() || isLoading) return;

    const userMessage = {
      role: 'user',
      content: message.trim(),
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);
    setError(null);

    try {
      let response;
      
      if (sessionId) {
        // Continue existing session
        response = await fetch(`/api/ai-chat/sessions/${sessionId}/messages`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ message: message.trim() })
        });
      } else {
        // Start new session
        response = await fetch(`/api/ai-chat/sessions/${caseId}/start`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ message: message.trim() })
        });
      }

      const data = await response.json();

      if (data.success) {
        const aiMessage = {
          role: 'assistant',
          content: data.message.content,
          timestamp: data.message.timestamp
        };
        
        setMessages(prev => [...prev, aiMessage]);
        setSessionId(data.session_id);
      } else {
        setError(data.error || 'Failed to get AI response');
      }
    } catch (err) {
      setError('Network error. Please try again.');
      console.error('Chat error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const generateCaseSummary = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/ai-chat/case-summary`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ case_id: caseId })
      });

      const data = await response.json();

      if (data.success) {
        const summaryMessage = {
          role: 'assistant',
          content: `📋 **Case Summary**\n\n${data.summary}`,
          timestamp: new Date().toISOString()
        };
        
        setMessages(prev => [...prev, summaryMessage]);
      } else {
        setError(data.error || 'Failed to generate summary');
      }
    } catch (err) {
      setError('Network error. Please try again.');
      console.error('Summary error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const quickQuestions = [
    "What are the key legal issues in this case?",
    "What are the financial implications?",
    "What is the likely outcome?",
    "What precedents apply here?",
    "What are the main risks?",
    "What legal strategies could be used?"
  ];

  const handleQuickQuestion = (question) => {
    setInputMessage(question);
    sendMessage(question);
  };

  if (!isOpen) return null;

  return (
    <div className={`fixed bottom-4 right-4 z-50 ${isMinimized ? 'w-80 h-16' : 'w-96 h-[600px]'} bg-white rounded-lg shadow-2xl border border-gray-200 flex flex-col transition-all duration-300`}>
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 rounded-t-lg flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Bot className="h-5 w-5" />
          <div>
            <h3 className="font-semibold text-sm">JuridenceAI</h3>
            <p className="text-xs opacity-90">{caseTitle?.substring(0, 30)}...</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setIsMinimized(!isMinimized)}
            className="p-1 hover:bg-white/20 rounded"
          >
            {isMinimized ? <Maximize2 className="h-4 w-4" /> : <Minimize2 className="h-4 w-4" />}
          </button>
          <button
            onClick={onClose}
            className="p-1 hover:bg-white/20 rounded"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      {!isMinimized && (
        <>
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
            {messages.length === 0 && (
              <div className="text-center py-8">
                <Sparkles className="h-12 w-12 text-blue-500 mx-auto mb-4" />
                <h4 className="text-lg font-semibold text-gray-900 mb-2">JuridenceAI</h4>
                <p className="text-sm text-gray-600 mb-4">
                  Ask me anything about this case. I can analyze legal issues, financial implications, and provide expert insights.
                </p>
                
                <div className="space-y-2">
                  <button
                    onClick={generateCaseSummary}
                    className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <FileText className="h-4 w-4" />
                    <span>Generate Case Summary</span>
                  </button>
                  
                  <div className="text-xs text-gray-500 mt-3">Quick Questions:</div>
                  <div className="grid grid-cols-1 gap-2">
                    {quickQuestions.slice(0, 3).map((question, index) => (
                      <button
                        key={index}
                        onClick={() => handleQuickQuestion(question)}
                        className="text-left p-2 text-xs bg-white border border-gray-200 rounded hover:bg-gray-50 transition-colors"
                      >
                        {question}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] p-3 rounded-lg ${
                    message.role === 'user'
                      ? 'bg-blue-600 text-white'
                      : 'bg-white border border-gray-200 text-gray-800'
                  }`}
                >
                  <div className="flex items-start space-x-2">
                    {message.role === 'assistant' && (
                      <Bot className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                    )}
                    {message.role === 'user' && (
                      <User className="h-4 w-4 text-blue-100 mt-0.5 flex-shrink-0" />
                    )}
                    <div className="flex-1">
                      <div className="text-sm whitespace-pre-wrap">{message.content}</div>
                      <div className={`text-xs mt-1 ${
                        message.role === 'user' ? 'text-blue-100' : 'text-gray-500'
                      }`}>
                        {new Date(message.timestamp).toLocaleTimeString()}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white border border-gray-200 p-3 rounded-lg max-w-[80%]">
                  <div className="flex items-center space-x-2">
                    <Bot className="h-4 w-4 text-blue-500" />
                    <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
                    <span className="text-sm text-gray-600">AI is thinking...</span>
                  </div>
                </div>
              </div>
            )}

            {error && (
              <div className="flex justify-start">
                <div className="bg-red-50 border border-red-200 p-3 rounded-lg max-w-[80%]">
                  <div className="flex items-center space-x-2">
                    <AlertCircle className="h-4 w-4 text-red-500" />
                    <span className="text-sm text-red-600">{error}</span>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-4 border-t border-gray-200 bg-white">
            <div className="flex space-x-2">
              <input
                ref={inputRef}
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask about this case..."
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                disabled={isLoading}
              />
              <button
                onClick={() => sendMessage()}
                disabled={!inputMessage.trim() || isLoading}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
            
            {messages.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1">
                {quickQuestions.slice(0, 4).map((question, index) => (
                  <button
                    key={index}
                    onClick={() => handleQuickQuestion(question)}
                    className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
                    disabled={isLoading}
                  >
                    {question}
                  </button>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default AIChat;

