import React, { useState, useCallback, useEffect } from 'react';
import PropTypes from 'prop-types';
import InvestmentTypeStep from './InvestmentTypeStep';
import DepositAmountStep from './DepositAmountStep';
import RiskProfileStep from './RiskProfileStep';
import SpendingHabitsStep from './SpendingHabitsStep';
import Step5LifestyleIncome from './Step5LifestyleIncome';
import InvestmentPredictions from './InvestmentPredictions';
import LoadingScreen from './LoadingScreen';
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
  emergencyNeeds: '',          // numeric string (emergency fund amount in dollars)
  age: ''                     // numeric string
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
  'monthlySalary',
  'age'
];

const validatePreferences = (preferences) => {
  console.log('Validating preferences:', preferences);
  
  // Check for required fields
  for (const field of requiredFields) {
    if (!preferences[field] || (typeof preferences[field] === 'string' && preferences[field].trim() === '')) {
      return {
        isValid: false,
        error: `Please provide your ${field.replace(/([A-Z])/g, ' $1').toLowerCase()}`
      };
    }
  }

  // Validate age
  const age = parseInt(preferences.age);
  if (isNaN(age) || age < 18 || age > 120) {
    return {
      isValid: false,
      error: 'Please enter a valid age between 18 and 120'
    };
  }

  // Validate monthly salary
  const salary = parseFloat(preferences.monthlySalary);
  if (isNaN(salary) || salary <= 0) {
    return {
      isValid: false,
      error: 'Please enter a valid monthly salary'
    };
  }

  // Validate deposit amount
  const deposit = parseFloat(preferences.depositAmount);
  if (isNaN(deposit) || deposit <= 0) {
    return {
      isValid: false,
      error: 'Please enter a valid deposit amount'
    };
  }

  // Validate risk profile
  if (!['conservative', 'moderate', 'aggressive'].includes(preferences.riskProfile)) {
    return {
      isValid: false,
      error: 'Please select a valid risk profile'
    };
  }

  // Validate deposit frequency
  if (!['weekly', 'monthly', 'yearly'].includes(preferences.depositFrequency)) {
    return {
      isValid: false,
      error: 'Please select a valid deposit frequency'
    };
  }

  console.log('Preferences validation passed');
  return {
    isValid: true,
    error: null
  };
};

const ErrorMessage = ({ message }) => {
  if (!message) return null;
  
  return (
    <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-4">
      <div className="flex">
        <div className="flex-shrink-0">
          <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
        </div>
        <div className="ml-3">
          <p className="text-sm text-red-700">{message}</p>
        </div>
      </div>
    </div>
  );
};

const StartInvestingWizard = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [predictions, setPredictions] = useState(null);
  const [preferences, setPreferences] = useState(initialPreferences);

  // Add debug logging state
  const [debugLog, setDebugLog] = useState({
    requestAttempts: 0,
    lastRequest: null,
    lastResponse: null,
    validationSteps: []
  });

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

  // Enhanced error handling
  const handleError = useCallback((error, context = '') => {
    console.error(`Error in ${context}:`, error);
    let userMessage = 'An unexpected error occurred. Please try again.';

    if (error.message.includes('API response structure')) {
      userMessage = 'We\'re having trouble generating your investment predictions. Please try again in a moment.';
    } else if (error.message.includes('Missing required field')) {
      userMessage = 'Some required information is missing. Please check all fields and try again.';
    } else if (error.message.includes('validation')) {
      userMessage = 'Please check your investment preferences and try again.';
    }

    setError(userMessage);
    setDebugLog(prev => ({
      ...prev,
      lastError: {
        timestamp: new Date().toISOString(),
        context,
        error: error.message,
        stack: error.stack
      }
    }));
  }, []);

  const submitInvestmentPreferences = useCallback(async (event) => {
    if (event) {
      event.preventDefault();
    }

    // Reset states
    setLoading(true);
    setError(null);
    setPredictions(null);

    try {
      // Log the attempt
      setDebugLog(prev => ({
        ...prev,
        requestAttempts: prev.requestAttempts + 1,
        lastRequest: {
          timestamp: new Date().toISOString(),
          preferences: { ...preferences }
        }
      }));

      // Validate preferences
      const validationResult = validatePreferences(preferences);
      if (!validationResult.isValid) {
        throw new Error(`Validation error: ${validationResult.error}`);
      }

      // Add validation success to debug log
      setDebugLog(prev => ({
        ...prev,
        validationSteps: [...prev.validationSteps, {
          timestamp: new Date().toISOString(),
          step: 'frontend-validation',
          status: 'success'
        }]
      }));

      // Get predictions
      const result = await getInvestmentPredictions(preferences);
      
      // Log successful response
      setDebugLog(prev => ({
        ...prev,
        lastResponse: {
          timestamp: new Date().toISOString(),
          result
        }
      }));

      // Update state with predictions
      setPredictions(result);
      setCurrentStep(currentStep + 1);
    } catch (error) {
      handleError(error, 'submitInvestmentPreferences');
    } finally {
      setLoading(false);
    }
  }, [preferences, currentStep, handleError]);

  const handleNext = () => {
    if (currentStep < 6) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = () => {
    // Handle form submission
  };

  const renderStep = () => {
    if (loading) {
      return <LoadingScreen />;
    }

    const commonProps = {
      data: preferences,
      updateData,
      nextStep: handleNext,
      prevStep: handlePrev,
      submitForm: submitInvestmentPreferences,
      loading,
      error
    };

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
        return <Step5LifestyleIncome {...commonProps} />;
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
                <button 
                  className="retry-button" 
                  onClick={() => {
                    setError(null);
                    submitInvestmentPreferences();
                  }}
                >
                  Try Again
                </button>
              </div>
            )}
            {!loading && !error && predictions && (
              <InvestmentPredictions
                predictions={predictions}
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
        <div className="progress-bar">
          <div 
            className="progress-fill"
            style={{ width: `${(currentStep / 6) * 100}%` }}
          ></div>
        </div>
        <ErrorMessage message={error} />
        <div className="wizard-content">
          {renderStep()}
        </div>
        {process.env.NODE_ENV === 'development' && (
          <div className="debug-panel" style={{ display: 'none' }}>
            <pre>{JSON.stringify(debugLog, null, 2)}</pre>
          </div>
        )}
      </div>
    </ErrorBoundary>
  );
};

export default StartInvestingWizard; 