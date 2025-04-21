import React from 'react';
import '../styles/Founders.css';

export default function Founders() {
  return (
    <section className="founders-section">
      <h2>Meet the Founders</h2>
      <div className="founders-content">
        <div className="founders-quote">
          <p>"We're Gauri & Fowzan—two 19-year-olds who got tired of opaque robo-advisors. We built Click to prove that everyday investors deserve AI tools built for them."</p>
        </div>
        <div className="founders-info">
          <div className="founder">
            <h3>Gauri Vaidya</h3>
            <p>Economics & Data Science</p>
          </div>
          <div className="founder">
            <h3>Fowzan Malik</h3>
            <p>Full-Stack Engineer</p>
          </div>
        </div>
      </div>
    </section>
  );
} 