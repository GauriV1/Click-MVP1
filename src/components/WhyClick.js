import React from 'react';
import '../styles/WhyClick.css';

export default function WhyClick() {
  return (
    <section className="why-click-section">
      <h2>Why Click?</h2>
      <div className="features-grid">
        <div className="feature-item">
          <h3>Built Around You</h3>
          <p>Your goals, timeline, and risk profile drive every insight—Click adapts to you, not the other way around.</p>
        </div>
        <div className="feature-item">
          <h3>Instant Projections</h3>
          <p>Today's MVP taps into a custom-built AI agent for rapid "what-you-could-earn" estimates in under 5 seconds.</p>
        </div>
        <div className="feature-item">
          <h3>Radically Transparent</h3>
          <p>Every projection links back to the exact market data and model call—no black-box surprises.</p>
        </div>
        <div className="feature-item">
          <h3>Ethical by Design</h3>
          <p>We bake in fairness checks, bias audits, and full audit trails—because real money demands real accountability.</p>
        </div>
      </div>
    </section>
  );
} 