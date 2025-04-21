import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Services.css';

export default function Services() {
  const navigate = useNavigate();

  return (
    <section id="services" className="services-section">
      <h2>Our Services</h2>
      <div className="service-grid">
        <div className="service-item">
          <h3>Meet Your AI-Advisor</h3>
          <button className="cta outline glass" onClick={() => navigate('/ai-advisor')}>
            Got a question about investing? We got you covered
          </button>
        </div>
        <div className="service-item">
          <h3>View Stocks, ETFs, Bonds</h3>
          <button className="cta outline glass" onClick={() => navigate('/stocks')}>
            Track real-time stock prices and market trends
          </button>
        </div>
      </div>
    </section>
  );
} 