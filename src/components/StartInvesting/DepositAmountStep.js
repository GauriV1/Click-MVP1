import React from 'react';
import '../../styles/StartInvesting/Step2_DepositAmount.css';

export default function Step2_DepositAmount({ data, updateData, nextStep, prevStep }) {
  const handleDepositFrequency = (frequency) => {
    updateData({ depositFrequency: frequency });
  };

  const handleAmountChange = (e) => {
    updateData({ depositAmount: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (data.depositFrequency && data.depositAmount) {
      nextStep();
    }
  };

  return (
    <div className="wizard-step deposit-step">
      <h2>When would you like to invest?</h2>
      <p>Choose your preferred deposit method and amount</p>
      
      <form onSubmit={handleSubmit}>
        <div className="deposit-options">
          <button
            type="button"
            className={`deposit-option ${data.depositFrequency === 'weekly' ? 'selected' : ''}`}
            onClick={() => handleDepositFrequency('weekly')}
          >
            <h3>Weekly</h3>
            <p>Automatic deposits every week</p>
          </button>
          
          <button
            type="button"
            className={`deposit-option ${data.depositFrequency === 'monthly' ? 'selected' : ''}`}
            onClick={() => handleDepositFrequency('monthly')}
          >
            <h3>Monthly</h3>
            <p>Automatic deposits every month</p>
          </button>

          <button
            type="button"
            className={`deposit-option ${data.depositFrequency === 'yearly' ? 'selected' : ''}`}
            onClick={() => handleDepositFrequency('yearly')}
          >
            <h3>Yearly</h3>
            <p>Automatic deposits once a year</p>
          </button>
          
          <button
            type="button"
            className={`deposit-option ${data.depositFrequency === 'ad hoc' ? 'selected' : ''}`}
            onClick={() => handleDepositFrequency('ad hoc')}
          >
            <h3>Ad Hoc</h3>
            <p>Deposit whenever you want</p>
          </button>
        </div>

        <div className="amount-input">
          <label htmlFor="amount">Initial Deposit Amount</label>
          <span className="subline">You can start with as low as $20 (or even $5!)</span>
          <div className="input-wrapper">
            <span className="currency">$</span>
            <input
              type="number"
              id="amount"
              min="5"
              step="5"
              value={data.depositAmount}
              onChange={handleAmountChange}
              placeholder="500"
            />
          </div>
        </div>

        <div className="button-group">
          <button type="button" className="back-button" onClick={prevStep}>
            Back
          </button>
          <button
            type="button"
            className="next-button"
            onClick={handleSubmit}
            disabled={!data.depositFrequency || !data.depositAmount}
          >
            Next
          </button>
        </div>
      </form>
    </div>
  );
} 