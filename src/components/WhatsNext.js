import React from 'react';
import '../styles/WhatsNext.css';

export default function WhatsNext() {
  return (
    <section className="whats-next-section">
      <h2>What's Next</h2>
      <div className="timeline">
        <div className="timeline-item">
          <h3>Real-Time Sentiment Feeds</h3>
          <p className="timeline-date">Q3 '25</p>
        </div>
        <div className="timeline-item">
          <h3>Reinforcement Learning Agents</h3>
          <p className="timeline-date">Beta Q4 '25</p>
        </div>
        <div className="timeline-item">
          <h3>Secure Transactions & Auto-Rebalancing</h3>
          <p className="timeline-date">Early '26</p>
        </div>
      </div>
      <p className="vision-statement">We're building the engine for truly adaptive portfolios. Stick around.</p>
    </section>
  );
} 