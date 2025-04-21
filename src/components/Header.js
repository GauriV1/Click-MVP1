import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/Header.css';

export default function Header() {
  return (
    <header className="header">
      <Link to="/" className="logo">
        <span className="logo-text">Click</span>
        <span className="logo-subtext">Democratizing Trading, Empowering Investors</span>
      </Link>
      <nav>
        <ul className="nav-links">
          <li><Link to="/" className="nav-link">Home</Link></li>
          <li><Link to="/about" className="nav-link">About</Link></li>
          <li><Link to="/services" className="nav-link">Services</Link></li>
        </ul>
      </nav>
    </header>
  );
} 