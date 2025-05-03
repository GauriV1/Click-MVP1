import React from 'react';
import PropTypes from 'prop-types';
import '../../styles/StartInvesting/Step4_SpendingHabits.css';

export default function Step4_SpendingHabits({ data = {}, updateData, prevStep, nextStep }) {
  const handleSpendingHabits = (habits) => {
    updateData({ spendingHabits: habits });
  };

  const handleLiquidityNeeds = (needs) => {
    updateData({ liquidityNeeds: needs });
  };

  const handleNext = () => {
    if (data.spendingHabits && data.liquidityNeeds) {
      nextStep();
    }
  };

  const handleSpendingChange = (value) => {
    handleSpendingHabits(value);
  };

  return (
    <div className="wizard-step spending-step">
      <h2>Tell us about your spending habits</h2>
      <p>This helps us understand your liquidity needs</p>

      <div className="spending-section">
        <h3>What's Your Monthly Spending Pattern?</h3>
        <p className="section-description">
          Understanding your spending helps us recommend the right investment strategy for you
        </p>
        <div className="spending-options">
          <button
            type="button"
            className={`spending-option ${data.spendingHabits === 'consistent' ? 'selected' : ''}`}
            onClick={() => handleSpendingChange('consistent')}
          >
            <h4>Consistent Spender</h4>
            <p>Predictable Expenses: You have a steady monthly income and regular bills</p>
            <div className="examples">
              <p>Examples:</p>
              <ul>
                <li>Fixed rent/mortgage payment</li>
                <li>Regular utility bills</li>
                <li>Monthly subscriptions</li>
              </ul>
            </div>
          </button>

          <button
            type="button"
            className={`spending-option ${data.spendingHabits === 'variable' ? 'selected' : ''}`}
            onClick={() => handleSpendingChange('variable')}
          >
            <h4>Variable Spender</h4>
            <p>Unpredictable Expenses: Your income or spending changes from month to month</p>
            <div className="examples">
              <p>Examples:</p>
              <ul>
                <li>Freelance/gig income</li>
                <li>Seasonal expenses</li>
                <li>Irregular shopping habits</li>
              </ul>
            </div>
          </button>
        </div>
      </div>

      <div className="liquidity-section">
        <h3>How Quickly Do You Need to Access Your Money?</h3>
        <p className="section-description">
          Liquidity means how fast you can withdraw your money. Higher liquidity gives you quicker access but might lower potential returns.
        </p>
        <div className="liquidity-options">
          <button
            type="button"
            className={`liquidity-option ${data.liquidityNeeds === 'high' ? 'selected' : ''}`}
            onClick={() => handleLiquidityNeeds('high')}
          >
            <h4>High Liquidity</h4>
            <p>Get your money within 1-2 days</p>
            <div className="examples">
              <p>Best for:</p>
              <ul>
                <li>Emergency funds</li>
                <li>Short-term savings</li>
                <li>Frequent withdrawals</li>
              </ul>
            </div>
          </button>

          <button
            type="button"
            className={`liquidity-option ${data.liquidityNeeds === 'medium' ? 'selected' : ''}`}
            onClick={() => handleLiquidityNeeds('medium')}
          >
            <h4>Medium Liquidity</h4>
            <p>Can wait 3-5 days for funds</p>
            <div className="examples">
              <p>Best for:</p>
              <ul>
                <li>Planned purchases</li>
                <li>Regular investments</li>
                <li>Balanced approach</li>
              </ul>
            </div>
          </button>

          <button
            type="button"
            className={`liquidity-option ${data.liquidityNeeds === 'low' ? 'selected' : ''}`}
            onClick={() => handleLiquidityNeeds('low')}
          >
            <h4>Low Liquidity</h4>
            <p>Can wait 1-2 weeks for funds</p>
            <div className="examples">
              <p>Best for:</p>
              <ul>
                <li>Long-term growth</li>
                <li>Higher returns potential</li>
                <li>Retirement savings</li>
              </ul>
            </div>
          </button>
        </div>
      </div>

      <div className="button-group">
        <button type="button" className="back-button" onClick={prevStep}>
          Back
        </button>
        <button 
          type="button" 
          className="next-button"
          onClick={handleNext}
          disabled={!data.spendingHabits || !data.liquidityNeeds}
        >
          Next
        </button>
      </div>
    </div>
  );
}

Step4_SpendingHabits.propTypes = {
  data: PropTypes.shape({
    spendingHabits: PropTypes.string,
    liquidityNeeds: PropTypes.string
  }),
  updateData: PropTypes.func.isRequired,
  prevStep: PropTypes.func.isRequired,
  nextStep: PropTypes.func.isRequired
}; 