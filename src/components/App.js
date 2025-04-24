import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './Header';
import LandingContent from './LandingContent';
import AboutPage from './AboutPage';
import Services from './Services';
import StocksView from './StocksView/StocksView';
import AIAdvisor from './AIAdvisor/AIAdvisor';
import StartInvestingWizard from './StartInvesting/StartInvestingWizard';
import Background from './Background';
import './styles/App.css';

function App() {
  return (
    <Router>
      <div className="app">
        <Background />
        <Header />
        <Routes>
          <Route path="/" element={<LandingContent />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/services" element={<Services />} />
          <Route path="/stocks" element={<StocksView />} />
          <Route path="/ai-advisor" element={<AIAdvisor />} />
          <Route path="/start-investing" element={<StartInvestingWizard />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App; 