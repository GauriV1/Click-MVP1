import React from 'react';
import '../../styles/StartInvesting/LoadingScreen.css';

const LoadingScreen = () => {
  return (
    <div className="loading-screen">
      <div className="loading-content">
        <div className="loading-spinner"></div>
        <h2>Analyzing Your Financial Profile</h2>
        <div className="loading-steps">
          <p>✓ Processing your investment preferences</p>
          <p>✓ Analyzing risk factors</p>
          <p className="active">⟳ Calculating personalized investment strategy</p>
          <p>• Preparing growth projections</p>
          <p>• Generating investment recommendations</p>
        </div>
        <p className="loading-description">
          Click's AI is carefully analyzing your profile to create a personalized investment strategy 
          that aligns with your goals and risk tolerance.
        </p>
      </div>
    </div>
  );
};

export default LoadingScreen; 