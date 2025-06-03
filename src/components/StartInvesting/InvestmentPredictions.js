import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import GrowthModelBox from '../GrowthModelBox';
import '../../styles/StartInvesting/InvestmentPredictions.css';
import { getAIAdvice } from '../../services/aiAdvisorService';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const InvestmentPredictions = ({ predictions, _monthlyAmount, preferences }) => {
  const [_AIAdvice, setAIAdvice] = useState(null);

  // Add default values for missing props
  const safePredictions = predictions || {
    projectedGrowth: { '1yr': 0, '5yr': 0, '10yr': 0 },
    expectedReturn: { min: 0, max: 0 },
    riskMetrics: { volatilityScore: 0, originalProfile: '', adjustedProfile: '' },
    suggestions: [],
    warnings: [],
    notes: '',
    reasoning: ''
  };

  const safePreferences = preferences || {
    depositAmount: '0',
    depositFrequency: 'monthly'
  };

  useEffect(() => {
    const fetchAIAdvice = async () => {
      try {
        const advice = await getAIAdvice(_monthlyAmount);
        setAIAdvice(advice);
      } catch (error) {
        console.error('Error fetching AI advice:', error);
      }
    };

    fetchAIAdvice();
  }, [_monthlyAmount]);

  if (!predictions) {
    return (
      <div className="predictions-container error">
        <h2>Unable to Display Predictions</h2>
        <p>No prediction data available. Please try again.</p>
      </div>
    );
  }

  // Calculate annual deposit for display
  const getAnnualDeposit = () => {
    const amount = Number(safePreferences.depositAmount);
    switch (safePreferences.depositFrequency) {
      case 'weekly': return amount * 52;
      case 'monthly': return amount * 12;
      case 'yearly': return amount;
      case 'ad hoc': return amount;
      default: return amount;
    }
  };

  const annualDeposit = getAnnualDeposit();

  // Prepare data for the growth chart
  const prepareChartData = () => {
    const years = [1, 5, 10];
    const projectedValues = years.map(year => {
      const totalDeposits = annualDeposit * year;
      const growthPercentage = safePredictions.projectedGrowth[`${year}yr`];
      return totalDeposits * (1 + growthPercentage / 100);
    });

    return {
      labels: years.map(year => `${year} Year${year > 1 ? 's' : ''}`),
      datasets: [
        {
          label: 'Projected Growth',
          data: projectedValues,
          fill: true,
          borderColor: '#4A90E2',
          backgroundColor: 'rgba(74, 144, 226, 0.1)',
          tension: 0.4,
          pointBackgroundColor: '#4A90E2',
          pointBorderColor: '#fff',
          pointHoverBackgroundColor: '#fff',
          pointHoverBorderColor: '#4A90E2'
        }
      ]
    };
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
        labels: {
          color: 'white'
        }
      },
      tooltip: {
        callbacks: {
          label: (context) => `$${context.parsed.y.toLocaleString()}`
        },
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: 'white',
        bodyColor: 'white',
        borderColor: 'rgba(255, 255, 255, 0.1)',
        borderWidth: 1
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(255, 255, 255, 0.1)',
          drawBorder: false
        },
        ticks: {
          color: 'white',
          callback: (value) => `$${value.toLocaleString()}`
        }
      },
      x: {
        grid: {
          color: 'rgba(255, 255, 255, 0.1)',
          drawBorder: false
        },
        ticks: {
          color: 'white'
        }
      }
    }
  };

  return (
    <div className="predictions-container">
      <div className="predictions-header">
        <h2>Your Investment Forecast</h2>
        {safePredictions.warnings && safePredictions.warnings.length > 0 && (
          <div className="warnings-section">
            <h3>Important Considerations</h3>
            <ul className="warnings-list">
              {safePredictions.warnings.map((warning, index) => (
                <li key={index}>{warning}</li>
              ))}
            </ul>
          </div>
        )}
        {safePredictions.reasoning && (
          <div className="ai-reasoning">
            <h3>Investment Strategy Analysis</h3>
            <div className="reasoning-text">
              {safePredictions.reasoning.split('\n').map((paragraph, index) => (
                paragraph ? <p key={index}>{paragraph}</p> : null
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Growth Chart */}
      <div className="growth-chart">
        <h3>Growth Projection</h3>
        <div className="chart-container">
          <Line data={prepareChartData()} options={chartOptions} height={300} />
        </div>
      </div>

      {/* Timeline Cards */}
      <div className="growth-projections">
        <h3>Detailed Projections</h3>
        <div className="timeline-cards">
          {[1, 5, 10].map(year => {
            const totalDeposits = annualDeposit * year;
            const growthPercentage = safePredictions.projectedGrowth[`${year}yr`];
            const projectedValue = totalDeposits * (1 + growthPercentage / 100);
            
            return (
              <div key={year} className="timeline-card">
                <h4>{year} Year{year > 1 ? 's' : ''}</h4>
                <div className="value">
                  ${Math.round(projectedValue).toLocaleString()}
                </div>
                <div className="growth">+{growthPercentage.toFixed(1)}%</div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="metrics-grid">
        <div className="metric-card">
          <h3>Expected Annual Return</h3>
          <div className="metric-value">
            {safePredictions.expectedReturn.min.toFixed(1)}% - {safePredictions.expectedReturn.max.toFixed(1)}%
          </div>
          <p className="metric-description">
            Projected return range based on market analysis and your risk profile
          </p>
        </div>
        <div className="metric-card">
          <h3>Risk Assessment</h3>
          <div className="metric-value">
            {safePredictions.riskMetrics.volatilityScore.toFixed(1)}/10
          </div>
          <div className="risk-profile-adjustment">
            {safePredictions.riskMetrics.originalProfile !== safePredictions.riskMetrics.adjustedProfile && (
              <p className="profile-change">
                Adjusted from <span className="original">{safePredictions.riskMetrics.originalProfile}</span> to{' '}
                <span className="adjusted">{safePredictions.riskMetrics.adjustedProfile}</span>
              </p>
            )}
          </div>
          <p className="metric-description">
            {safePredictions.riskMetrics.volatilityScore <= 3 
              ? "Conservative: Lower risk, stable returns"
              : safePredictions.riskMetrics.volatilityScore <= 7
                ? "Moderate: Balanced risk and return"
                : "Aggressive: Higher risk, growth focused"}
          </p>
        </div>
      </div>

      {safePredictions.notes && (
        <div className="notes-section">
          <h3>Important Notes</h3>
          <p>{safePredictions.notes}</p>
        </div>
      )}

      <div className="suggestions-section">
        <h3>What would Click Invest In For You</h3>
        <div className="suggestions-grid">
          {safePredictions.suggestions.map((suggestion, index) => (
            <div key={index} className="suggestion-card">
              {suggestion}
            </div>
          ))}
        </div>
      </div>

      <GrowthModelBox 
        growthModel={{
          description: safePredictions.growthModel?.description || 'Investment growth model based on your risk profile and market conditions.',
          assumptions: safePredictions.growthModel?.assumptions || [
            'Market conditions remain relatively stable',
            'Regular investment contributions as planned',
            'Risk profile remains consistent'
          ],
          factors: safePredictions.growthModel?.factors || [
            'Current market trends',
            'Historical volatility',
            'Economic indicators'
          ],
          methodology: safePredictions.growthModel?.methodology || 'Calculations factor in compound interest, market volatility, and risk adjustments'
        }}
        projectedGrowth={safePredictions.projectedGrowth}
      />

      {safePredictions.disclaimer && (
        <div className="demo-disclaimer">
          <p>{safePredictions.disclaimer}</p>
        </div>
      )}
    </div>
  );
};

InvestmentPredictions.propTypes = {
  predictions: PropTypes.shape({
    projectedGrowth: PropTypes.shape({
      '1yr': PropTypes.number,
      '5yr': PropTypes.number,
      '10yr': PropTypes.number
    }),
    expectedReturn: PropTypes.shape({
      min: PropTypes.number,
      max: PropTypes.number
    }),
    riskMetrics: PropTypes.shape({
      volatilityScore: PropTypes.number,
      originalProfile: PropTypes.string,
      adjustedProfile: PropTypes.string
    }),
    suggestions: PropTypes.arrayOf(PropTypes.string),
    warnings: PropTypes.arrayOf(PropTypes.string),
    notes: PropTypes.string,
    reasoning: PropTypes.string,
    disclaimer: PropTypes.string
  }).isRequired,
  _monthlyAmount: PropTypes.number,
  preferences: PropTypes.shape({
    depositAmount: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    depositFrequency: PropTypes.oneOf(['weekly', 'monthly', 'yearly', 'ad hoc'])
  })
};

InvestmentPredictions.defaultProps = {
  _monthlyAmount: 0,
  preferences: {
    depositAmount: '0',
    depositFrequency: 'monthly'
  }
};

export default InvestmentPredictions; 