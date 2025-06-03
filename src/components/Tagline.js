import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Tagline.css';

export default function Tagline() {
  const navigate = useNavigate();
  
  return (
    <div className="tagline">
      <h1>AI-Powered Investment Intelligence</h1>
      <h2>Experience the future of personal investing. Click delivers precise, data-driven investment strategies in seconds—powered by advanced AI, backed by market expertise.</h2>
      <div className="cta-buttons">
        <button 
          className="cta-button primary-cta" 
          onClick={() => navigate('/invest')}
        >
          Start Your Journey
        </button>
      </div>
    </div>
  );
} 