import React from 'react';
import '../../styles/StartInvesting/LoadingScreen.css';

const LoadingScreen = () => {
  return (
    <div className="loading-screen">
      <div className="loading-content">
        <div className="loading-spinner"></div>
        <h2>Analyzing Your Investment Profile</h2>
        <div className="loading-steps">
          <p>✓ Processing investment preferences</p>
          <p>✓ Evaluating risk parameters</p>
          <p className="active">⟳ Generating personalized strategy</p>
          <p>• Calculating growth projections</p>
          <p>• Optimizing portfolio allocation</p>
        </div>
        <p className="loading-description">
          Our AI engine is analyzing your profile to create a sophisticated investment strategy 
          tailored to your financial objectives and risk tolerance.
        </p>
      </div>
    </div>
  );
};

export default LoadingScreen; 