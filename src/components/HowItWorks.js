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
          <p>One quick quiz—weekly or lump sum, student or freelancer, conservative or aggressive.</p>
        </div>
        <div className="step-item">
          <div className="step-number">2</div>
          <h3>We Ask Grok</h3>
          <p>We feed your profile and live market data into Grok 3 Mini. It returns concise projections on potential returns, volatility bands, and high-level portfolio mix suggestions.</p>
        </div>
        <div className="step-item">
          <div className="step-number">3</div>
          <h3>You See Your Plan</h3>
          <p>Interactive charts lay out what you could earn—and what risks to expect—all in plain English.</p>
        </div>
      </div>
      <div className="coming-soon">
        <h3>We're Just Getting Started</h3>
        <p>This MVP is powered by our custom AI agent that solely operates on the same logic our AI model will - assuming a 95% accuracy.  Our full platform (coming soon) will layer in proprietary forecasting engines, RL agents, and secure transaction logic</p>
      </div>
    </section>
  );
} 