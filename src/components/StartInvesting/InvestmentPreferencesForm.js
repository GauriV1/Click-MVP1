import React, { useState } from 'react';
import '../styles/StartInvesting/InvestmentPreferencesForm.css';

const InvestmentPreferencesForm = ({ onSubmit }) => {
  const [formData, setFormData] = useState({
    monthlyAmount: '',
    riskTolerance: 'moderate',
    investmentHorizon: '5',
    liquidityNeeds: 'medium',
    investmentFrequency: 'monthly'
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form className="preferences-form" onSubmit={handleSubmit}>
      <div className="form-group">
        <label htmlFor="monthlyAmount">Monthly Investment Amount ($)</label>
        <input
          type="number"
          id="monthlyAmount"
          name="monthlyAmount"
          value={formData.monthlyAmount}
          onChange={handleChange}
          min="100"
          required
          placeholder="Enter amount (min. $100)"
        />
      </div>

      <div className="form-group">
        <label htmlFor="riskTolerance">Risk Tolerance</label>
        <select
          id="riskTolerance"
          name="riskTolerance"
          value={formData.riskTolerance}
          onChange={handleChange}
          required
        >
          <option value="conservative">Conservative</option>
          <option value="moderate">Moderate</option>
          <option value="aggressive">Aggressive</option>
        </select>
      </div>

      <div className="form-group">
        <label htmlFor="investmentHorizon">Investment Horizon (Years)</label>
        <select
          id="investmentHorizon"
          name="investmentHorizon"
          value={formData.investmentHorizon}
          onChange={handleChange}
          required
        >
          <option value="1">1 Year</option>
          <option value="3">3 Years</option>
          <option value="5">5 Years</option>
          <option value="10">10+ Years</option>
        </select>
      </div>

      <div className="form-group">
        <label htmlFor="liquidityNeeds">Liquidity Needs</label>
        <select
          id="liquidityNeeds"
          name="liquidityNeeds"
          value={formData.liquidityNeeds}
          onChange={handleChange}
          required
        >
          <option value="low">Low - Rarely need to withdraw</option>
          <option value="medium">Medium - May need occasional access</option>
          <option value="high">High - Need frequent access</option>
        </select>
      </div>

      <div className="form-group">
        <label htmlFor="investmentFrequency">Investment Frequency</label>
        <select
          id="investmentFrequency"
          name="investmentFrequency"
          value={formData.investmentFrequency}
          onChange={handleChange}
          required
        >
          <option value="weekly">Weekly</option>
          <option value="monthly">Monthly</option>
          <option value="quarterly">Quarterly</option>
        </select>
      </div>

      <button type="submit" className="submit-button">
        Get Investment Predictions
      </button>
    </form>
  );
};

export default InvestmentPreferencesForm; 