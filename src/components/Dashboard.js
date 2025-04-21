import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Dashboard.css';

export default function Dashboard() {
  const navigate = useNavigate();
  
  return (
    <section id="dashboard" className="dashboard-section">
      <h2>Dashboard</h2>
      <p>Take control of your investments with our AI-driven tools.</p>
      <button className="cta" onClick={() => navigate('/invest')}>
        Start Investing
      </button>
    </section>
  );
} 