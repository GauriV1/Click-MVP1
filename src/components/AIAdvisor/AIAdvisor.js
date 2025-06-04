import React, { useState } from 'react';
import { getAIAdvice } from '../../services/aiAdvisorService';
import '../../styles/AIAdvisor/AIAdvisor.css';

const AIAdvisor = () => {
  const [userMessage, setUserMessage] = useState('');
  const [chatHistory, setChatHistory] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    if (!userMessage.trim()) return;
    
    setLoading(true);
    setError(null);

    // Add user message to chat immediately
    const newUserMessage = { 
      role: 'user', 
      content: userMessage 
    };
    setChatHistory(prev => [...prev, newUserMessage]);
    setUserMessage(''); // Clear input field

    try {
      console.log("🔧 AIAdvisor.handleSend - userInput:", userMessage);
      const responseText = await getAIAdvice(userMessage);
      console.log("🔧 AIAdvisor.handleSend - responseText:", responseText);

      // Add AI response to chat
      const aiMessage = {
        role: 'assistant',
        content: responseText
      };

      setChatHistory(prev => [...prev, aiMessage]);
    } catch (err) {
      console.error('AI Advisor error:', err);
      setError(err.message || 'Sorry, I encountered an error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const renderMessage = (msg) => {
    return <div className="message-content">{msg.content}</div>;
  };

  return (
    <div className="ai-advisor-container">
      <div className="advisor-header">
        <h2>AI Investment Advisor</h2>
        <p className="subtitle">
          Preview our AI-powered investment recommendations. Ask about market trends, 
          investment strategies, or get personalized portfolio suggestions.
        </p>
      </div>

      <div className="chat-window">
        {chatHistory.map((msg, idx) => (
          <div 
            key={idx} 
            className={`message-container ${msg.role === 'user' ? 'user-message' : 'ai-message'}`}
          >
            <div className="message-bubble">
              <div className="message-header">
                {msg.role === 'user' ? 'You' : 'AI Advisor'}
              </div>
              {renderMessage(msg)}
            </div>
          </div>
        ))}
        {loading && (
          <div className="message-container ai-message">
            <div className="message-bubble loading">
              <div className="typing-indicator">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          </div>
        )}
        {error && (
          <div className="error-message">
            {typeof error === 'string' ? error : JSON.stringify(error)}
          </div>
        )}
      </div>

      <div className="input-area">
        <textarea
          value={userMessage}
          onChange={(e) => setUserMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Ask about investment strategies, market trends, or get personalized recommendations..."
          rows={1}
          className="message-input"
        />
        <button 
          onClick={handleSend} 
          disabled={loading || !userMessage.trim()}
          className="send-button"
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default AIAdvisor; 