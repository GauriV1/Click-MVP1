import React, { useState } from 'react';
import '../../styles/StartInvesting/Step3_RiskProfile.css';

export default function Step3_RiskProfile({ data, updateData, nextStep, prevStep }) {
  const [selectedProfile, setSelectedProfile] = useState(data.riskProfile || '');

  const handleRiskProfile = (profile) => {
    setSelectedProfile(profile);
    updateData({ riskProfile: profile });
  };

  const handleNext = () => {
    if (selectedProfile) {
      nextStep();
    }
  };

  return (
    <div className="wizard-step risk-step">
      <div className="risk-header">
        <h2>What's Your Risk Tolerance?</h2>
        <p>Pick the style that fits your goals</p>
        <p className="recommendation">First time investor? We recommend starting with Conservative or Moderate</p>
      </div>

      <div className="risk-options">
        <div
          className={`risk-option ${selectedProfile === 'conservative' ? 'selected' : ''}`}
          onClick={() => handleRiskProfile('conservative')}
        >
          <h3>Conservative</h3>
          <p>Lower risk, steadier returns</p>
          <ul>
            <li>Focus on protecting your original investment</li>
            <li>Mostly invests in safer options (like bonds)</li>
            <li>Typical returns: ~4-6% per year</li>
          </ul>
        </div>

        <div
          className={`risk-option ${selectedProfile === 'moderate' ? 'selected' : ''}`}
          onClick={() => handleRiskProfile('moderate')}
        >
          <h3>Moderate</h3>
          <p>Balanced risk and potential growth</p>
          <ul>
            <li>Combines safer assets with some growth investments</li>
            <li>Diversified approach for steady and growing returns</li>
            <li>Typical returns: ~6-8% per year</li>
          </ul>
        </div>

        <div
          className={`risk-option ${selectedProfile === 'aggressive' ? 'selected' : ''}`}
          onClick={() => handleRiskProfile('aggressive')}
        >
          <h3>Aggressive</h3>
          <p>Higher risk, potentially higher rewards</p>
          <ul>
            <li>Heavier focus on stocks and fast-growing assets</li>
            <li>Bigger ups and downs, but aims for larger gains</li>
            <li>Typical returns: ~8-12% per year</li>
          </ul>
        </div>
      </div>

      <p className="disclaimer">Returns vary and are not guaranteed. Past performance doesn't predict future results.</p>

      <div className="button-group">
        <button type="button" className="back-button" onClick={prevStep}>
          Back
        </button>
        <button
          type="button"
          className="next-button"
          onClick={handleNext}
          disabled={!selectedProfile}
        >
          Next
        </button>
      </div>
    </div>
  );
} 