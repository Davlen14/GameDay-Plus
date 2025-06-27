import React, { useState } from 'react';

const GamedayGPT = () => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'bot',
      content: 'Hello! I\'m GamedayGPT, your AI-powered college football assistant. Ask me anything about teams, players, stats, or predictions!',
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const suggestedQuestions = [
    "Who's favored to win the national championship?",
    "Compare Alabama and Georgia's offensive stats",
    "What are the top recruiting classes this year?",
    "Predict the outcome of the next playoff game"
  ];

  const handleSendMessage = () => {
    if (!inputMessage.trim()) return;

    // Add user message
    const userMessage = {
      id: messages.length + 1,
      type: 'user',
      content: inputMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsTyping(true);

    // Simulate AI response
    setTimeout(() => {
      const botMessage = {
        id: messages.length + 2,
        type: 'bot',
        content: 'I understand you\'re asking about college football! This is a demo version of GamedayGPT. The full AI functionality will be available soon with real-time data integration.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, botMessage]);
      setIsTyping(false);
    }, 2000);
  };

  const handleSuggestedQuestion = (question) => {
    setInputMessage(question);
  };

  return (
    <div className="h-screen bg-white flex flex-col pt-20">
      {/* Header Section */}
      <div className="flex-shrink-0 border-b border-gray-200 bg-white px-4 py-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <i className="fas fa-robot text-2xl icon-gradient mr-3"></i>
              <div>
                <h1 className="text-2xl font-bold gradient-text">GamedayGPT</h1>
                <p className="text-sm text-gray-600">AI-powered college football assistant</p>
              </div>
            </div>
            <div className="flex items-center">
              <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
              <span className="text-sm text-gray-600">Online</span>
            </div>
          </div>
        </div>
      </div>

      {/* Chat Messages Area */}
      <div className="flex-1 overflow-y-auto bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="space-y-6">
            {messages.map((message) => (
              <div key={message.id} className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className="flex items-start space-x-3 max-w-2xl">
                  {message.type === 'bot' && (
                    <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-r from-red-600 to-red-700 rounded-full flex items-center justify-center">
                      <i className="fas fa-robot text-white text-sm"></i>
                    </div>
                  )}
                  <div className={`px-4 py-3 rounded-2xl ${
                    message.type === 'user' 
                      ? 'gradient-bg text-white ml-auto' 
                      : 'bg-white border border-gray-200 text-gray-800 shadow-sm'
                  }`}>
                    <p className="text-sm leading-relaxed">{message.content}</p>
                  </div>
                  {message.type === 'user' && (
                    <div className="flex-shrink-0 w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                      <i className="fas fa-user text-gray-600 text-sm"></i>
                    </div>
                  )}
                </div>
              </div>
            ))}
            
            {isTyping && (
              <div className="flex justify-start">
                <div className="flex items-start space-x-3 max-w-2xl">
                  <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-r from-red-600 to-red-700 rounded-full flex items-center justify-center">
                    <i className="fas fa-robot text-white text-sm"></i>
                  </div>
                  <div className="bg-white border border-gray-200 px-4 py-3 rounded-2xl shadow-sm">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Suggested Questions */}
      {messages.length <= 1 && (
        <div className="flex-shrink-0 bg-white border-t border-gray-200 px-4 py-3">
          <div className="max-w-4xl mx-auto">
            <p className="text-sm text-gray-600 mb-3">Try asking:</p>
            <div className="flex flex-wrap gap-2">
              {suggestedQuestions.map((question, index) => (
                <button
                  key={index}
                  onClick={() => handleSuggestedQuestion(question)}
                  className="text-sm px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors duration-200"
                >
                  {question}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Input Area */}
      <div className="flex-shrink-0 bg-white border-t border-gray-200 px-4 py-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex space-x-3 items-end">
            <div className="flex-1 relative">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="Ask me anything about college football..."
                className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
              />
            </div>
            <button
              onClick={handleSendMessage}
              disabled={!inputMessage.trim()}
              className="p-3 gradient-bg text-white rounded-xl hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity duration-200"
            >
              <i className="fas fa-paper-plane"></i>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GamedayGPT;
