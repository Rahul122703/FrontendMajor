import { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, MapPin, AlertTriangle, Thermometer, Activity, Calendar, X, Minimize2, Maximize2 } from 'lucide-react';
import { geminiService } from '../services/gemini';

const AIChatAssistant = ({ 
  data, 
  userLocation, 
  onNavigateToCoordinates, 
  onShowLocationData,
  isVisible,
  onClose,
  isMinimized,
  onToggleMinimize
}) => {
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const preMadeQuestions = [
    {
      id: 1,
      text: "What's the current heatwave situation in India?",
      icon: <AlertTriangle className="w-4 h-4" />,
      category: "Overview"
    },
    {
      id: 2,
      text: "Show me high-risk regions for heatwaves",
      icon: <MapPin className="w-4 h-4" />,
      category: "Risk Analysis"
    },
    {
      id: 3,
      text: "What safety precautions should I take today?",
      icon: <Activity className="w-4 h-4" />,
      category: "Safety"
    },
    {
      id: 4,
      text: "Analyze heatwave risk near my location",
      icon: <User className="w-4 h-4" />,
      category: "Personal"
    },
    {
      id: 5,
      text: "Which regions have temperatures above 40°C?",
      icon: <Thermometer className="w-4 h-4" />,
      category: "Temperature"
    },
    {
      id: 6,
      text: "What's the heatwave forecast for Delhi?",
      icon: <Calendar className="w-4 h-4" />,
      category: "Forecast"
    },
    {
      id: 7,
      text: "Compare heatwave risk between Mumbai and Chennai",
      icon: <MapPin className="w-4 h-4" />,
      category: "Comparison"
    },
    {
      id: 8,
      text: "Give me travel safety advice for this weekend",
      icon: <Calendar className="w-4 h-4" />,
      category: "Travel"
    },
    {
      id: 9,
      text: "Show me coordinates of extreme heat zones",
      icon: <MapPin className="w-4 h-4" />,
      category: "Locations"
    },
    {
      id: 10,
      text: "What are the signs of heatstroke?",
      icon: <Activity className="w-4 h-4" />,
      category: "Health"
    },
    {
      id: 11,
      text: "How to protect elderly from heatwaves?",
      icon: <User className="w-4 h-4" />,
      category: "Health"
    },
    {
      id: 12,
      text: "Analyze temperature trends for this week",
      icon: <Thermometer className="w-4 h-4" />,
      category: "Trends"
    }
  ];

  const categories = [...new Set(preMadeQuestions.map(q => q.category))];

  useEffect(() => {
    if (messages.length === 0 && isVisible) {
      // Send welcome message
      const welcomeMessage = {
        id: Date.now(),
        type: 'bot',
        text: "👋 Hello! I'm your AI Heatwave Assistant. I can help you with:\n\n• Real-time heatwave analysis\n• Location-specific risk assessment\n• Safety recommendations\n• Temperature trends\n• Travel advice\n\nTry asking me anything or choose from the quick questions below!",
        timestamp: new Date(),
        isWelcome: true
      };
      setMessages([welcomeMessage]);
    }
  }, [isVisible]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isVisible && !isMinimized && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isVisible, isMinimized]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async (text = inputValue) => {
    if (!text.trim()) return;

    const userMessage = {
      id: Date.now(),
      type: 'user',
      text: text.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);
    setIsTyping(true);

    try {
      const context = {
        userLocation,
        currentData: data,
        heatwaveAlerts: data?.filter(d => d.hw_prob > 0.6).length || 0
      };

      const response = await geminiService.generateContent(text, context);
      
      const botMessage = {
        id: Date.now() + 1,
        type: 'bot',
        text: response.response,
        timestamp: new Date(),
        coordinates: response.coordinates
      };

      setMessages(prev => [...prev, botMessage]);

      // Handle coordinates in response
      if (response.coordinates && response.coordinates.length > 0) {
        const coords = response.coordinates[0];
        setTimeout(() => {
          // Use global navigation function
          if (window.handleAINavigation) {
            window.handleAINavigation(coords.lat, coords.lng);
          }
          onNavigateToCoordinates?.(coords.lat, coords.lng);
          onShowLocationData?.(coords.lat, coords.lng);
        }, 1000);
      }

    } catch (error) {
      const errorMessage = {
        id: Date.now() + 1,
        type: 'bot',
        text: "I apologize, but I'm having trouble connecting right now. Please try again.",
        timestamp: new Date(),
        isError: true
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      setIsTyping(false);
    }
  };

  const handleQuestionClick = (question) => {
    setInputValue(question.text);
    setTimeout(() => handleSendMessage(question.text), 100);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const renderMessage = (message) => {
    const isUser = message.type === 'user';
    
    return (
      <div
        key={message.id}
        className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4 animate-fadeIn`}
      >
        <div className={`flex max-w-[80%] ${isUser ? 'flex-row-reverse' : 'flex-row'} gap-2`}>
          <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
            isUser 
              ? 'bg-blue-600 text-white' 
              : message.isError 
                ? 'bg-red-100 text-red-600' 
                : 'bg-gradient-to-br from-purple-500 to-blue-600 text-white'
          }`}>
            {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
          </div>
          <div className={`relative ${isUser ? 'text-right' : 'text-left'}`}>
            <div className={`inline-block p-3 rounded-2xl ${
              isUser 
                ? 'bg-blue-600 text-white rounded-br-sm' 
                : message.isError
                  ? 'bg-red-50 text-red-800 rounded-bl-sm border border-red-200'
                  : message.isWelcome
                    ? 'bg-gradient-to-r from-purple-50 to-blue-50 text-slate-800 rounded-bl-sm border border-purple-200'
                    : 'bg-slate-100 text-slate-800 rounded-bl-sm'
            }`}>
              <p className="text-sm whitespace-pre-wrap">{message.text}</p>
              {message.coordinates && (
                <div className="mt-2 p-2 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex items-center gap-2 text-blue-700">
                    <MapPin className="w-4 h-4" />
                    <span className="text-xs font-medium">
                      Navigating to: {message.coordinates[0].lat.toFixed(4)}, {message.coordinates[0].lng.toFixed(4)}
                    </span>
                  </div>
                </div>
              )}
            </div>
            <div className={`text-xs text-slate-500 mt-1 ${isUser ? 'text-right' : 'text-left'}`}>
              {formatTime(message.timestamp)}
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (!isVisible) return null;

  return (
    <div className={`fixed bottom-4 right-4 z-[9999] ${isMinimized ? 'w-16' : 'w-96'} transition-all duration-300`}>
      <div className={`bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden ${
        isMinimized ? 'h-16' : 'h-[600px]'
      }`}>
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-4 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-semibold text-sm">AI Heatwave Assistant</h3>
                <p className="text-xs text-blue-100">
                  {isTyping ? 'Typing...' : 'Always here to help'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={onToggleMinimize}
                className="text-white hover:bg-white hover:bg-opacity-20 rounded-lg p-1 transition-colors"
              >
                {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
              </button>
              <button
                onClick={onClose}
                className="text-white hover:bg-white hover:bg-opacity-20 rounded-lg p-1 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {!isMinimized && (
          <>
            {/* Messages */}
            <div className="h-[400px] overflow-y-auto p-4 bg-slate-50">
              {messages.map(renderMessage)}
              {isLoading && (
                <div className="flex justify-start mb-4">
                  <div className="flex gap-2">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-blue-600 text-white flex items-center justify-center">
                      <Bot className="w-4 h-4" />
                    </div>
                    <div className="bg-slate-100 text-slate-800 rounded-2xl rounded-bl-sm p-3">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                        <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                        <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick Questions */}
            {messages.length <= 2 && (
              <div className="p-4 bg-white border-t border-slate-200">
                <p className="text-xs font-medium text-slate-600 mb-3">Quick Questions:</p>
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {categories.map(category => (
                    <div key={category} className="space-y-1">
                      <p className="text-xs font-medium text-slate-500">{category}</p>
                      {preMadeQuestions
                        .filter(q => q.category === category)
                        .slice(0, 2)
                        .map(question => (
                          <button
                            key={question.id}
                            onClick={() => handleQuestionClick(question)}
                            className="w-full text-left p-2 bg-slate-50 hover:bg-slate-100 rounded-lg text-xs text-slate-700 transition-colors flex items-center gap-2"
                          >
                            {question.icon}
                            <span className="truncate">{question.text}</span>
                          </button>
                        ))}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Input */}
            <div className="p-4 bg-white border-t border-slate-200">
              <div className="flex gap-2">
                <input
                  ref={inputRef}
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Ask about heatwaves, safety, or locations..."
                  className="flex-1 px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  disabled={isLoading}
                />
                <button
                  onClick={() => handleSendMessage()}
                  disabled={isLoading || !inputValue.trim()}
                  className="px-3 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center gap-1"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default AIChatAssistant;
