import React, { useState, useCallback, useEffect } from 'react';
import PropTypes from 'prop-types';
import InvestmentTypeStep from './InvestmentTypeStep';
import DepositAmountStep from './DepositAmountStep';
import RiskProfileStep from './RiskProfileStep';
import SpendingHabitsStep from './SpendingHabitsStep';
import Step5_LifestyleIncome from './Step5_LifestyleIncome';
import InvestmentPredictions from './InvestmentPredictions';
import { getInvestmentPredictions } from '../../services/grokService';
import '../../styles/StartInvesting/StartInvestingWizard.css';

// Error Boundary Component
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Wizard Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-boundary">
          <h2>Something went wrong.</h2>
          <p>{this.state.error?.message}</p>
          <button onClick={() => window.location.reload()}>
            Restart Wizard
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

ErrorBoundary.propTypes = {
  children: PropTypes.node.isRequired
};

// Initial state for investment preferences
const initialPreferences = {
  investmentType: '',          // 'partial' or 'whole'
  depositAmount: '',           // numeric string
  depositFrequency: '',        // 'weekly', 'monthly', 'yearly', 'ad hoc'
  riskProfile: '',            // 'conservative', 'moderate', 'aggressive'
  spendingHabits: '',         // 'consistent' or 'variable'
  liquidityNeeds: '',         // 'high', 'medium', 'low'
  employmentStatus: '',        // 'full-time', 'part-time', 'self-employed', 'student'
  monthlySalary: '',          // numeric string
  emergencyNeeds: ''          // numeric string (emergency fund amount in dollars)
};

// Required fields for validation
const requiredFields = [
  'investmentType',
  'depositFrequency',
  'depositAmount',
  'riskProfile',
  'spendingHabits',
  'liquidityNeeds',
  'employmentStatus',
  'monthlySalary'
];

const validatePreferences = (preferences) => {
  // Check for missing required fields
  const missing = requiredFields.filter(f => !preferences[f]);
  if (missing.length > 0) {
    throw new Error(`Please complete: ${missing.join(', ')}`);
  }

  // Validate field values
  if (!['partial', 'whole'].includes(preferences.investmentType)) {
    throw new Error('Invalid investment type');
  }

  if (!['weekly', 'monthly', 'yearly', 'ad hoc'].includes(preferences.depositFrequency)) {
    throw new Error('Invalid deposit frequency');
  }

  const amount = Number(preferences.depositAmount);
  if (isNaN(amount) || amount <= 0) {
    throw new Error('Deposit amount must be a positive number');
  }

  if (!['conservative', 'moderate', 'aggressive'].includes(preferences.riskProfile)) {
    throw new Error('Invalid risk profile');
  }

  if (!['consistent', 'variable'].includes(preferences.spendingHabits)) {
    throw new Error('Invalid spending habits');
  }

  if (!['high', 'medium', 'low'].includes(preferences.liquidityNeeds)) {
    throw new Error('Invalid liquidity needs');
  }

  if (!['full-time', 'part-time', 'self-employed', 'student'].includes(preferences.employmentStatus)) {
    throw new Error('Invalid employment status');
  }

  const monthlySalary = Number(preferences.monthlySalary);
  if (isNaN(monthlySalary) || monthlySalary <= 0) {
    throw new Error('Monthly salary must be a positive number');
  }

  return true;
};

const StartInvestingWizard = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [predictions, setPredictions] = useState(null);
  const [preferences, setPreferences] = useState(initialPreferences);

  // Enhanced logging for debugging
  useEffect(() => {
    console.log('Current Step:', currentStep);
    console.log('Current Preferences:', preferences);
  }, [currentStep, preferences]);

  const handleInputChange = useCallback((field, value) => {
    if (!(field in initialPreferences)) {
      console.warn(`Warning: Attempting to set unknown field "${field}" in preferences`);
      return;
    }
    console.log('Updating field:', field, 'with value:', value);
    setPreferences(prev => ({
      ...prev,
      [field]: value
    }));
  }, []);

  const updateData = useCallback((updatedFields) => {
    console.log('Updating multiple fields:', updatedFields);
    setPreferences(prev => {
      const newPreferences = {
        ...prev,
        ...updatedFields
      };
      console.log('New preferences state:', newPreferences);
      return newPreferences;
    });
  }, []);

  const submitInvestmentPreferences = async () => {
    console.log('Submitting preferences for prediction:', preferences);
    setLoading(true);
    setError(null);
    
    try {
      // Validate preferences before submission
      validatePreferences(preferences);

      // Move to results step first to show loading state
      setCurrentStep(6);
      
      try {
        const result = await getInvestmentPredictions(preferences);
        console.log('Received predictions:', result);
        // Add original preferences to the predictions object
        setPredictions({
          ...result,
          originalPreferences: { ...preferences }
        });
      } catch (predictionError) {
        console.error('Investment prediction error:', predictionError);
        setError(predictionError.message || 'Failed to generate prediction. Please try again.');
      }
    } catch (validationError) {
      console.error('Validation error:', validationError);
      setError(validationError.message);
    } finally {
      setLoading(false);
    }
  };

  const handleNext = useCallback(() => {
    console.log('Handling next step. Current step:', currentStep);
    console.log('Current preferences state:', preferences);
    
    let canProceed = true;
    let errorMessage = '';

    switch (currentStep) {
      case 1:
        if (!preferences.investmentType) {
          canProceed = false;
          errorMessage = 'Please select an investment type';
        }
        break;
      case 2:
        if (!preferences.depositAmount || !preferences.depositFrequency) {
          canProceed = false;
          errorMessage = 'Please enter deposit amount and frequency';
        }
        break;
      case 3:
        if (!preferences.riskProfile) {
          canProceed = false;
          errorMessage = 'Please select a risk profile';
        }
        break;
      case 4:
        if (!preferences.spendingHabits) {
          canProceed = false;
          errorMessage = 'Please complete spending habits';
        }
        break;
      case 5:
        // Submit to Grok
        submitInvestmentPreferences();
        return;
      default:
        break;
    }

    if (!canProceed) {
      console.log('Cannot proceed:', errorMessage);
      setError(errorMessage);
      return;
    }

    console.log('Moving to next step:', currentStep + 1);
    setError(null);
    setCurrentStep(prev => prev + 1);
  }, [currentStep, preferences, submitInvestmentPreferences]);

  const handleBack = useCallback(() => {
    if (currentStep > 1) {
      console.log('Moving back from step:', currentStep, 'to:', currentStep - 1);
      setError(null);
      setCurrentStep(prev => prev - 1);
    }
  }, [currentStep]);

  const renderStep = () => {
    console.log('Rendering step:', currentStep);
    
    const commonProps = {
      data: preferences,
      updateData,
      nextStep: handleNext,
      prevStep: handleBack
    };

    console.log('Passing props to step:', commonProps);

    switch (currentStep) {
      case 1:
        return <InvestmentTypeStep {...commonProps} />;
      case 2:
        return <DepositAmountStep {...commonProps} />;
      case 3:
        return <RiskProfileStep {...commonProps} />;
      case 4:
        return <SpendingHabitsStep {...commonProps} />;
      case 5:
        return <Step5_LifestyleIncome {...commonProps} />;
      case 6:
        return (
          <div className="results-step">
            {loading && (
              <div className="loading-overlay">
                <div className="loading-spinner"></div>
                <p>Generating your personalized investment forecast...</p>
              </div>
            )}
            {error && (
              <div className="error-message">
                <h3>Oops! Something went wrong</h3>
                <p>{error}</p>
                <button className="retry-button" onClick={submitInvestmentPreferences}>
                  Try Again
                </button>
              </div>
            )}
            {!loading && !error && predictions && (
              <InvestmentPredictions
                predictions={predictions}
                monthlyAmount={
                  preferences.depositFrequency === 'monthly'
                    ? Number(preferences.depositAmount)
                    : preferences.depositFrequency === 'weekly'
                      ? Number(preferences.depositAmount) * 4.33
                      : preferences.depositFrequency === 'yearly'
                        ? Number(preferences.depositAmount) / 12
                        : Number(preferences.depositAmount)
                }
                preferences={preferences}
              />
            )}
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <ErrorBoundary>
      <div className="wizard-container">
        {error && (
          <div className="error-banner">
            {error}
          </div>
        )}
        <div className="progress-bar">
          <div 
            className="progress-fill"
            style={{ width: `${(currentStep / 6) * 100}%` }}
          ></div>
        </div>
        {renderStep()}
      </div>
    </ErrorBoundary>
  );
};

export default StartInvestingWizard; 