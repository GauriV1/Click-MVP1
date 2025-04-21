import React, { useState } from 'react';
import '../styles/ChatGPTWrapper.css';

export default function ChatGPTWrapper() {
  const [messages, setMessages] = useState([]);
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSend = async () => {
    if (!prompt.trim()) return;

    const userMessage = { role: 'user', content: prompt };
    setMessages(prev => [...prev, userMessage]);
    setPrompt('');
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('http://localhost:3005/ai-advisor', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ prompt: prompt.trim() }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.error || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (!data || !data.choices || !data.choices[0] || !data.choices[0].message) {
        throw new Error('Invalid response format from API');
      }

      const reply = data.choices[0].message;
      setMessages(prev => [...prev, reply]);
    } catch (error) {
      console.error('Error sending chat message:', error);
      setError(error.message || 'Failed to get response from AI');
      setMessages(prev => [...prev, {
        role: 'system',
        content: 'Sorry, I encountered an error. Please try again.'
      }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="chat-wrapper">
      {error && (
        <div className="error-banner">
          {error}
          <button onClick={() => setError(null)}>✕</button>
        </div>
      )}
      <div className="chat-messages">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`message ${message.role === 'user' ? 'user' : message.role === 'system' ? 'error' : 'assistant'}`}
          >
            <div className="message-content">{message.content}</div>
          </div>
        ))}
        {loading && <div className="loading">AI is thinking...</div>}
      </div>
      <div className="chat-input">
        <input
          type="text"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
          placeholder="Ask anything"
          disabled={loading}
        />
      </div>
    </div>
  );
} 