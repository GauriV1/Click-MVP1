import React from 'react';
import '../styles/HowItWorks.css';

export default function HowItWorks() {
  return (
    <section className="how-it-works-section">
      <h2>How It Works</h2>
      <div className="steps-container">
        <div className="step-item">
          <div className="step-number">1</div>
          <h3>Tell Us About You</h3>
          <p>One quick assessment—your investment frequency, professional background, and risk preferences.</p>
        </div>
        <div className="step-item">
          <div className="step-number">2</div>
          <h3>AI-Powered Analysis</h3>
          <p>Our advanced AI model processes your profile and real-time market data to generate precise projections, risk assessments, and portfolio recommendations.</p>
        </div>
        <div className="step-item">
          <div className="step-number">3</div>
          <h3>Your Personalized Plan</h3>
          <p>Interactive visualizations present your potential returns and risk metrics in clear, actionable terms.</p>
        </div>
      </div>
      <div className="coming-soon">
        <h3>Platform Evolution</h3>
        <p>This MVP demonstrates our core AI capabilities with 95% accuracy. Our full platform will integrate proprietary forecasting engines, reinforcement learning agents, and secure transaction infrastructure.</p>
      </div>
    </section>
  );
} 