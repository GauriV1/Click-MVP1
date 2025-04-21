import React, { useEffect } from 'react';
import '../styles/StartInvesting/Step4_SpendingHabits.css';

const Step4_SpendingHabits = ({ data, updateData, nextStep, prevStep }) => {
  useEffect(() => {
    console.log('Step4_SpendingHabits mounted with data:', data);
  }, [data]);

  const handleSpendingHabitsChange = (value) => {
    console.log('Updating spending habits to:', value);
    updateData({ spendingHabits: value });
  };

  const handleLiquidityChange = (value) => {
    console.log('Updating liquidity preference to:', value);
    updateData({ liquidityPreference: value });
  };

  const handleNext = () => {
    console.log('Step4: Proceeding to next step with data:', {
      spendingHabits: data.spendingHabits,
      liquidityPreference: data.liquidityPreference
    });
    nextStep();
  };

  const isNextEnabled = data.spendingHabits && data.liquidityPreference;

  return (
    <div className="spending-habits-container">
      <h2>Your Spending & Liquidity Preferences</h2>
      
      <div className="spending-section">
        <h3>What best describes your spending habits?</h3>
        <div className="spending-options">
          <button 
            className={`spending-option ${data.spendingHabits === 'conservative' ? 'selected' : ''}`}
            onClick={() => handleSpendingHabitsChange('conservative')}
          >
            Conservative Spender
            <p>I carefully budget and save regularly</p>
          </button>
          
          <button 
            className={`spending-option ${data.spendingHabits === 'moderate' ? 'selected' : ''}`}
            onClick={() => handleSpendingHabitsChange('moderate')}
          >
            Balanced Spender
            <p>I maintain a healthy mix of spending and saving</p>
          </button>
          
          <button 
            className={`spending-option ${data.spendingHabits === 'dynamic' ? 'selected' : ''}`}
            onClick={() => handleSpendingHabitsChange('dynamic')}
          >
            Dynamic Spender
            <p>I spend freely on what I value</p>
          </button>
        </div>
      </div>

      <div className="liquidity-section">
        <h3>How quickly might you need to access your investments?</h3>
        <div className="liquidity-options">
          <button 
            className={`liquidity-option ${data.liquidityPreference === 'high' ? 'selected' : ''}`}
            onClick={() => handleLiquidityChange('high')}
          >
            High Liquidity
            <p>I may need quick access to my investments</p>
          </button>
          
          <button 
            className={`liquidity-option ${data.liquidityPreference === 'medium' ? 'selected' : ''}`}
            onClick={() => handleLiquidityChange('medium')}
          >
            Medium Liquidity
            <p>I might need some funds within a few months</p>
          </button>
          
          <button 
            className={`liquidity-option ${data.liquidityPreference === 'low' ? 'selected' : ''}`}
            onClick={() => handleLiquidityChange('low')}
          >
            Low Liquidity
            <p>I'm investing for the long term</p>
          </button>
        </div>
      </div>

      <div className="navigation-buttons">
        <button className="back-button" onClick={prevStep}>Back</button>
        <button 
          className="next-button" 
          onClick={handleNext}
          disabled={!isNextEnabled}
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default Step4_SpendingHabits; 