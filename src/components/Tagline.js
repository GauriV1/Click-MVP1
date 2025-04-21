import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Tagline.css';

export default function Tagline() {
  const navigate = useNavigate();
  
  return (
    <div className="tagline">
      <h1>Investing for Everyone</h1>
      <h2>Managing your money shouldn't feel like rocket science. Click shows you clear, data-driven projections in under five seconds—no jargon, no hidden fees.</h2>
      <div className="cta-buttons">
        <button 
          className="cta-button primary-cta" 
          onClick={() => navigate('/invest')}
        >
          Start Investing
        </button>
      </div>
    </div>
  );
} 