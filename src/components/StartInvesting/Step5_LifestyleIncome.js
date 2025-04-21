import React, { useState } from 'react';
import PropTypes from 'prop-types';
import '../../styles/StartInvesting/Step5_LifestyleIncome.css';

const Step5_LifestyleIncome = ({
  data = {},
  updateData = () => {},
  nextStep = () => {},
  prevStep = () => {}
}) => {
  const [localData, setLocalData] = useState({
    employmentStatus: data.employmentStatus || '',
    monthlySalary: data.monthlySalary || '',
    primaryExpenses: data.primaryExpenses || [],
    emergencyNeeds: data.emergencyNeeds || '',
    savingsRate: data.savingsRate || ''
  });

  const [errors, setErrors] = useState({});

  const employmentTypes = [
    { value: '', label: 'Select your employment type' },
    { value: 'full-time', label: 'Full Time' },
    { value: 'part-time', label: 'Part Time' },
    { value: 'self-employed', label: 'Self Employed' },
    { value: 'student', label: 'Student' }
  ];

  const handleChange = (field, value) => {
    setLocalData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleMultiSelect = (expense) => {
    let updatedExpenses = [...localData.primaryExpenses];
    if (updatedExpenses.includes(expense)) {
      updatedExpenses = updatedExpenses.filter(e => e !== expense);
    } else {
      updatedExpenses = [...updatedExpenses, expense];
    }
    setLocalData(prev => ({
      ...prev,
      primaryExpenses: updatedExpenses
    }));
  };

  const handleEmploymentStatusChange = (e) => {
    const type = e.target.value;
    setLocalData(prev => ({ ...prev, employmentStatus: type }));
    updateData({ employmentStatus: type });
    setErrors(prev => ({ ...prev, employmentStatus: '' }));
  };

  const handleEmergencyNeedsChange = (value) => {
    const numericValue = value.replace(/[^0-9]/g, '');
    setLocalData(prev => ({ ...prev, emergencyNeeds: numericValue }));
    updateData({ emergencyNeeds: numericValue });
    setErrors(prev => ({ ...prev, emergencyNeeds: '' }));
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!localData.employmentStatus) {
      newErrors.employmentStatus = 'Please select your employment type';
    }
    
    if (!localData.monthlySalary) {
      newErrors.monthlySalary = 'Please enter your monthly salary';
    } else if (Number(localData.monthlySalary) < 0) {
      newErrors.monthlySalary = 'Monthly salary must be positive';
    }

    // Validate emergency fund amount if provided
    if (localData.emergencyNeeds) {
      if (isNaN(localData.emergencyNeeds) || Number(localData.emergencyNeeds) < 0) {
        newErrors.emergencyNeeds = 'Emergency fund amount must be a non-negative number';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      updateData(localData);
      nextStep();
    }
  };

  const expenseCategories = [
    "Rent/Mortgage",
    "Groceries",
    "Utilities",
    "Transportation",
    "Healthcare",
    "Entertainment",
    "Education",
    "Insurance"
  ];

  return (
    <div className="step-container lifestyle-step">
      <h2>Your Lifestyle & Income</h2>
      <p className="step-description">
        Help us understand your financial situation better. This information allows us to create
        a more personalized investment strategy that aligns with your lifestyle and goals.
      </p>
      
      <form onSubmit={handleSubmit} className="lifestyle-form">
        {/* Employment Status */}
        <div className="form-group">
          <label htmlFor="employmentStatus">Employment Status</label>
          <select
            id="employmentStatus"
            value={localData.employmentStatus}
            onChange={handleEmploymentStatusChange}
            className={errors.employmentStatus ? 'error' : ''}
          >
            {employmentTypes.map(type => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
          {errors.employmentStatus && <div className="error-message">{errors.employmentStatus}</div>}
        </div>

        {/* Monthly Salary */}
        <div className="form-group">
          <label htmlFor="monthlySalary">Monthly Salary ($)</label>
          <input
            type="number"
            id="monthlySalary"
            value={localData.monthlySalary}
            onChange={(e) => {
              handleChange('monthlySalary', e.target.value);
              updateData({ monthlySalary: e.target.value });
            }}
            placeholder="Enter your monthly salary"
            min="0"
            className={errors.monthlySalary ? 'error' : ''}
            required
          />
          {errors.monthlySalary && <div className="error-message">{errors.monthlySalary}</div>}
        </div>

        {/* Emergency Needs */}
        <div className="form-group">
          <label htmlFor="emergencyNeeds">Emergency Fund Amount ($)</label>
          <input
            id="emergencyNeeds"
            type="text"
            value={localData.emergencyNeeds}
            onChange={(e) => handleEmergencyNeedsChange(e.target.value)}
            placeholder="Enter amount"
            className={errors.emergencyNeeds ? 'error' : ''}
          />
          {errors.emergencyNeeds && <div className="error-message">{errors.emergencyNeeds}</div>}
        </div>

        {/* Primary Expenses */}
        <div className="form-group">
          <label>Primary Expenses</label>
          <p className="field-description">Select your main monthly expenses</p>
          <div className="checkbox-group">
            {expenseCategories.map(expense => (
              <label key={expense} className="checkbox-label">
                <input
                  type="checkbox"
                  checked={localData.primaryExpenses.includes(expense)}
                  onChange={() => handleMultiSelect(expense)}
                />
                <span>{expense}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Savings Rate */}
        <div className="form-group">
          <label htmlFor="savingsRate">What percentage of your income do you typically save?</label>
          <div className="input-with-symbol">
            <input
              type="number"
              id="savingsRate"
              value={localData.savingsRate}
              onChange={(e) => handleChange('savingsRate', e.target.value)}
              placeholder="e.g., 10"
              min="0"
              max="100"
              required
            />
            <span className="symbol">%</span>
          </div>
        </div>

        {/* Navigation Buttons */}
        <div className="button-group">
          <button type="button" className="back-button" onClick={prevStep}>
            Back
          </button>
          <button type="submit" className="next-button submit-plan">
            See Your Investment Plan
          </button>
        </div>
      </form>
    </div>
  );
};

Step5_LifestyleIncome.propTypes = {
  data: PropTypes.object,
  updateData: PropTypes.func,
  nextStep: PropTypes.func,
  prevStep: PropTypes.func
};

export default Step5_LifestyleIncome; 