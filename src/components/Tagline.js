import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Tagline.css';

export default function Tagline() {
  const navigate = useNavigate();
  
  return (
    <div className="tagline">
      <h1>Click invests for you—your proxy agent. Sit back, let it run on autopilot.</h1>
      <p>Investing made easy: Click acts as your proxy agent and does the work for you. Take a backseat—let it manage your portfolio on autopilot.</p>
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