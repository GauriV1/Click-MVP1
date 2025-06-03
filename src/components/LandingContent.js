import React from 'react';
import '../styles/LandingContent.css';

const LandingContent = () => {
  return (
    <div className="landing-content">
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
            <h3>We Ask our Custom-prompted AI-Agent</h3>
            <p>We feed your profile and live market data into our AI model. It returns concise projections on potential returns, volatility bands, and high-level portfolio mix suggestions.</p>
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

      <section className="founders-section">
        <h2>Meet the Founder</h2>
        <div className="founders-content">
          <p className="founders-quote">"I'm Gauri—a 19-year-old who got tired of opaque robo-advisors. I built Click to prove that everyday investors deserve AI tools built for them."</p>
          <div className="founders-info">
            <p>– Gauri Vaidya, Economics & Computer Science</p>
          </div>
        </div>
      </section>

      <section className="data-privacy-section">
        <h2>Your Data, Your Control</h2>
        <div className="privacy-content">
          <p>We pull only public market feeds via a secure Finnhub integration. No personal info ever leaves our encrypted servers. Click is FINRA-ready—because privacy isn't optional.</p>
        </div>
      </section>

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
    </div>
  );
};

export default LandingContent; 