// Initial state for investment preferences
const initialPreferences = {
  investmentType: '',          // 'partial' or 'whole'
  depositAmount: '',           // numeric string
  depositPreference: 'monthly', // 'weekly', 'monthly', 'yearly', 'ad hoc'
  riskProfile: '',             // 'conservative', 'moderate', 'aggressive'
  spendingHabits: '',          // 'consistent' or 'variable'
  liquidityPreference: '',     // 'high', 'medium', 'low'
  // New fields for enhanced personalization
  employmentStatus: '',        // 'full-time', 'part-time', 'freelancer', 'student', 'other'
  monthlyIncome: '',           // Numeric value for monthly income
  primaryExpenses: [],         // Array of expense categories
  emergencyExpenseFrequency: '', // 'rarely', 'occasionally', 'frequently'
  savingsRate: ''              // Percentage of income saved per month
}; 

import Step5_LifestyleIncome from './Step5_LifestyleIncome';

const renderStep = () => {
  const commonProps = {
    data: preferences,
    updateData,
    nextStep: handleNext,
    prevStep: handleBack
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
                preferences.depositPreference === 'monthly'
                  ? Number(preferences.depositAmount)
                  : preferences.depositPreference === 'weekly'
                    ? Number(preferences.depositAmount) * 4
                    : preferences.depositPreference === 'yearly'
                      ? Number(preferences.depositAmount) / 12
                      : Number(preferences.depositAmount)
              }
            />
          )}
        </div>
      );
    default:
      return null;
  }
};

<div className="progress-bar">
  <div 
    className="progress-fill"
    style={{ width: `${(currentStep / 6) * 100}%` }}
  ></div>
</div> 