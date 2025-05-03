import React, { useState } from 'react';
import PropTypes from 'prop-types';
import '../../styles/StartInvesting/Step5_LifestyleIncome.css';

export default function Step5_LifestyleIncome({ data = {}, updateData, prevStep }) {
  const [localData, setLocalData] = useState({
    employmentStatus: data.employmentStatus || '',
    monthlySalary: data.monthlySalary || '',
    primaryExpenses: data.primaryExpenses || [],
    emergencyNeeds: data.emergencyNeeds || '',
    savingsRate: data.savingsRate || '',
    age: data.age || ''
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
    const updates = { [field]: value };
    setLocalData(prev => ({
      ...prev,
      ...updates
    }));
    updateData(updates);
    setErrors(prev => ({
      ...prev,
      [field]: ''
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
    updateData({ primaryExpenses: updatedExpenses });
  };

  const handleEmploymentStatusChange = (e) => {
    handleChange('employmentStatus', e.target.value);
  };

  const handleEmergencyNeedsChange = (e) => {
    const numericValue = e.target.value.replace(/[^0-9]/g, '');
    handleChange('emergencyNeeds', numericValue);
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

    // Validate age
    if (!localData.age) {
      newErrors.age = 'Please enter your age';
    } else {
      const age = Number(localData.age);
      if (isNaN(age) || age < 18 || age > 120) {
        newErrors.age = 'Please enter a valid age between 18 and 120';
      }
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
    const isValid = validateForm();
    
    if (isValid) {
      try {
        // Prepare final data without any custom thresholds or calculations
        const finalData = {
          employmentStatus: localData.employmentStatus,
          monthlySalary: localData.monthlySalary,
          primaryExpenses: localData.primaryExpenses,
          emergencyNeeds: localData.emergencyNeeds,
          savingsRate: localData.savingsRate,
          age: localData.age
        };

        // Update parent component with final data
        updateData(finalData);
      } catch (error) {
        console.error('Error processing form data:', error);
        setErrors(prev => ({
          ...prev,
          submit: error.message || 'Failed to process form data. Please try again.'
        }));
      }
    } else {
      // Scroll to the first error
      const firstErrorField = Object.keys(errors)[0];
      const errorElement = document.getElementById(firstErrorField);
      if (errorElement) {
        errorElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
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
        {errors.submit && (
          <div className="error-message submit-error">
            {errors.submit}
          </div>
        )}
        
        {/* Age Input */}
        <div className="form-group">
          <label htmlFor="age">Your Age</label>
          <input
            type="number"
            id="age"
            value={localData.age}
            onChange={(e) => handleChange('age', e.target.value)}
            placeholder="Enter your age"
            min="18"
            max="120"
            className={errors.age ? 'error' : ''}
            required
          />
          {errors.age && <div className="error-message">{errors.age}</div>}
        </div>

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
            onChange={(e) => handleChange('monthlySalary', e.target.value)}
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
            onChange={handleEmergencyNeedsChange}
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
}

Step5_LifestyleIncome.propTypes = {
  data: PropTypes.object,
  updateData: PropTypes.func,
  prevStep: PropTypes.func
}; 