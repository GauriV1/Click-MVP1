import React, { useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import Background from './components/Background';
import Header from './components/Header';
import Tagline from './components/Tagline';
import Services from './components/Services';
import AboutPage from './components/AboutPage';
import StartInvestingWizard from './components/StartInvesting/StartInvestingWizard';
import AIAdvisor from './components/AIAdvisor/AIAdvisor';
import QuickLinks from './components/QuickLinks';
import LandingContent from './components/LandingContent';
import StocksView from './components/StocksView/StocksView';
import './styles/App.css';

function App() {
  useEffect(() => {
    // Load Manrope font
    const link = document.createElement('link');
    link.href = 'https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700&display=swap';
    link.rel = 'stylesheet';
    document.head.appendChild(link);
    
    return () => {
      document.head.removeChild(link);
    };
  }, []);

  return (
    <div className="app-container">
      <Background />
      <div className="overlay-content">
        <Header />
        <Routes>
          <Route
            path="/"
            element={
              <>
                <Tagline />
                <LandingContent />
                <QuickLinks />
              </>
            }
          />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/services" element={<Services />} />
          <Route path="/invest" element={<StartInvestingWizard />} />
          <Route path="/ai-advisor" element={<AIAdvisor />} />
          <Route path="/stocks" element={<StocksView />} />
        </Routes>
      </div>
    </div>
  );
}

export default App; 