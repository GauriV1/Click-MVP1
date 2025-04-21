import React from 'react';
import './Results.css';

const Results = ({ predictions, error }) => {
  if (error) {
    return (
      <div className="results-error">
        <h3>Error</h3>
        <p>{error}</p>
        <button onClick={() => window.location.reload()}>Try Again</button>
      </div>
    );
  }

  if (!predictions) {
    return (
      <div className="results-loading">
        <h3>Generating Predictions...</h3>
        <p>Please wait while we analyze your investment profile.</p>
      </div>
    );
  }

  const { projectedGrowth, expectedReturn, riskMetrics, suggestions, disclaimer } = predictions;

  return (
    <div className="results-container">
      <div className="results-header">
        <h2>Your Investment Predictions</h2>
        {disclaimer && (
          <div className="demo-disclaimer">
            <p>{disclaimer}</p>
          </div>
        )}
      </div>

      <div className="results-grid">
        <div className="result-card growth-projections">
          <h3>Projected Growth</h3>
          <div className="growth-timeline">
            <div className="growth-item">
              <span className="timeline">1 Year</span>
              <span className="percentage">{projectedGrowth['1yr']}%</span>
            </div>
            <div className="growth-item">
              <span className="timeline">5 Years</span>
              <span className="percentage">{projectedGrowth['5yr']}%</span>
            </div>
            <div className="growth-item">
              <span className="timeline">10 Years</span>
              <span className="percentage">{projectedGrowth['10yr']}%</span>
            </div>
          </div>
        </div>

        <div className="result-card expected-returns">
          <h3>Expected Returns</h3>
          <div className="returns-range">
            <div className="return-item">
              <span className="label">Minimum</span>
              <span className="percentage">{expectedReturn.min}%</span>
            </div>
            <div className="return-item">
              <span className="label">Maximum</span>
              <span className="percentage">{expectedReturn.max}%</span>
            </div>
          </div>
        </div>

        <div className="result-card risk-assessment">
          <h3>Risk Assessment</h3>
          <div className="risk-score">
            <span className="score-label">Volatility Score</span>
            <div className="score-value">
              <span>{riskMetrics.volatilityScore}</span>
              <span className="score-max">/10</span>
            </div>
          </div>
        </div>

        <div className="result-card investment-suggestions">
          <h3>Recommended Investments</h3>
          <ul className="suggestions-list">
            {suggestions.map((suggestion, index) => (
              <li key={index}>{suggestion}</li>
            ))}
          </ul>
        </div>
      </div>

      <div className="results-footer">
        <button className="primary-button" onClick={() => window.location.reload()}>
          Start Over
        </button>
      </div>
    </div>
  );
};

export default Results; 