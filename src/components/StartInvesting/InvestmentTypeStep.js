import React from 'react';
import PropTypes from 'prop-types';
import '../../styles/StartInvesting/Step1_InvestmentType.css';

export default function Step1_InvestmentType({ data = {}, updateData, nextStep }) {
  // Safely access investmentType with a default value
  const { investmentType = '' } = data;

  const handleInvestmentTypeChange = (type) => {
    updateData({ investmentType: type });
  };

  return (
    <div className="step-container">
      <h2>How Do You Want to Invest?</h2>
      <p>Choose an option that works best for you</p>
      
      <div className="options-container">
        <div 
          className={`option-card ${investmentType === 'partial' ? 'selected' : ''}`}
          onClick={() => handleInvestmentTypeChange('partial')}
        >
          <h3>Partial Shares</h3>
          <p>Buy pieces of a company's stock without needing to purchase a full share</p>
          <ul>
            <li>Start with any amount of money</li>
            <li>Spread your money across multiple companies</li>
            <li>Perfect for exploring different stocks</li>
          </ul>
        </div>

        <div 
          className={`option-card ${investmentType === 'whole' ? 'selected' : ''}`}
          onClick={() => handleInvestmentTypeChange('whole')}
        >
          <h3>Whole Shares</h3>
          <p>Own entire shares in a company—like traditional investors</p>
          <ul>
            <li>Own complete shares of stock</li>
            <li>Traditional way of investing</li>
            <li>Requires more money per share</li>
          </ul>
        </div>
      </div>

      <div className="navigation-buttons">
        <button 
          className="next-button"
          onClick={nextStep}
          disabled={!investmentType}
        >
          Next
        </button>
      </div>
    </div>
  );
}

Step1_InvestmentType.propTypes = {
  data: PropTypes.shape({
    investmentType: PropTypes.string
  }),
  updateData: PropTypes.func.isRequired,
  nextStep: PropTypes.func.isRequired
}; 