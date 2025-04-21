import React from 'react';
import '../styles/QuickLinks.css';

const QuickLinks = () => {
  return (
    <section className="quick-links-section">
      <div className="quick-links-container">
        <div className="quick-links">
          <a href="https://github.com/GauriV1" target="_blank" rel="noopener noreferrer">
            Gauri's GitHub
          </a>
          <span className="link-divider">|</span>
          <a href="https://github.com/fowzan77" target="_blank" rel="noopener noreferrer">
            Fowzan's GitHub
          </a>
        </div>
        <div className="copyright-info">
          © 2025 Click Finance AI. All rights reserved.
        </div>
        <div className="tagline-footer">
          Empowering investors with AI-driven insights
        </div>
      </div>
    </section>
  );
};

export default QuickLinks; 