import axios from 'axios';

// API Configuration
const API_CONFIG = {
  BASE_URL: process.env.REACT_APP_GROK_API_URL || 'https://api.x.ai/v1',
  API_KEY: process.env.REACT_APP_GROK_API_KEY,
  MODEL: 'grok-3-mini-fast-beta'
};

// Create an axios instance with default configuration
const grokClient = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${API_CONFIG.API_KEY}`
  },
  timeout: 60000
});

// Validate API configuration
if (!API_CONFIG.API_KEY) {
  console.error('Missing Grok API key. Please set REACT_APP_GROK_API_KEY environment variable.');
}

const MAX_RETRIES = 3;
const RETRY_DELAY = 2000;

const systemPrompt = `Click's financial prediction assistant generates personalized investment projections based on user profiles.
Our AI engine verifies that each plan aligns with the user's income, deposit frequency, and risk tolerance.  

1. Parse and validate the user object:
   • monthlySalary (in $) - This is monthly income, must be reasonable (e.g., $2,000-$50,000/month)
   • employmentStatus: 'full-time', 'part-time', 'self-employed', 'student'
   • depositAmount (in $) & depositFrequency: 'weekly', 'monthly', 'yearly', 'ad hoc'
   • riskProfile: 'conservative', 'moderate', 'aggressive'
   • spendingHabits: 'consistent', 'variable'
   • liquidityNeeds: 'high', 'medium', 'low'
   • emergencyNeeds (in $) - Current emergency fund amount

2. Emergency Fund Analysis:
   • Calculate monthly expenses as 70% of monthly salary
   • Required emergency fund = 3-6 months of expenses
   • Example: If monthly salary is $5,000
     - Monthly expenses ≈ $3,500 (70% of salary)
     - Required emergency fund = $10,500-$21,000 (3-6 months)
   • Flag if emergency fund is insufficient

3. Income vs Investment Ratio:
   • Calculate monthly investment:
     - Weekly deposits: amount * 4.33
     - Monthly deposits: amount * 1
     - Yearly deposits: amount / 12
     - Ad hoc: treat as yearly / 12
   • Flag if monthly investment > 20% of monthly salary

4. Growth Projections (MUST follow these ranges):
   Conservative Profile:
   • 1yr: 2-6% growth
   • 5yr: 10-25% cumulative growth
   • 10yr: 25-50% cumulative growth

   Moderate Profile:
   • 1yr: 4-8% growth
   • 5yr: 20-35% cumulative growth
   • 10yr: 40-80% cumulative growth

   Aggressive Profile:
   • 1yr: 6-12% growth
   • 5yr: 30-50% cumulative growth
   • 10yr: 60-120% cumulative growth

5. Always return valid JSON in this shape:
{
  "projectedGrowth": { "1yr": number, "5yr": number, "10yr": number },
  "expectedReturn": { "min": number, "max": number },
  "riskMetrics": {
    "volatilityScore": number,
    "originalProfile": string,
    "adjustedProfile": string
  },
  "suggestions": string[],  // Each suggestion must include ETF name and exact dollar amount based on monthly investment
  "warnings": string[],
  "notes": string,
  "reasoning": string  // Must include clear monthly salary and emergency fund analysis
}

6. Base portfolio allocations (calculate exact $ based on monthly investment):
   Conservative:
   • 40-50% Core ETFs
   • 20-30% Income ETFs
   • 10-20% Defensive Sectors
   • 10-20% International

   Moderate:
   • 50-60% Core ETFs
   • 15-25% Income ETFs
   • 15-25% Growth Sectors
   • 15-25% International

   Aggressive:
   • 60-70% Core ETFs
   • 10-20% Growth ETFs
   • 20-30% Sector/Thematic ETFs
   • 20-30% International Growth

7. Risk Assessment Rules:
   • If emergency fund < 3 months expenses: Reduce risk profile one level
   • If monthly investment > 20% of monthly salary: Reduce risk profile one level
   • If student/part-time with high liquidity needs: Maximum moderate risk
   • If emergency fund < 1 month expenses: Force conservative profile

8. The explanation in "notes" and "reasoning" must explicitly state:
   • Monthly salary: $X
   • Monthly expenses (70% of salary): $X
   • Required emergency fund (3-6 months expenses): $X-$X
   • Current emergency fund: $X
   • Monthly investment amount: $X (X% of monthly salary)
   • Any risk adjustments made and why
   
Note: Always refer to the system as "Click" or "Click's AI". Never use personal pronouns.
All monetary values must be clearly marked with $ and use proper comma formatting for thousands.
Emergency fund analysis must be based on monthly salary, not annual salary.
Monthly salary must be treated as monthly income, not annual income divided by 12.`;

// Validate user preferences before sending to API
const validateUserPreferences = (preferences) => {
  const requiredFields = [
    'monthlySalary',
    'employmentStatus',
    'depositAmount',
    'depositFrequency',
    'riskProfile',
    'spendingHabits',
    'liquidityNeeds'
  ];

  // Check for missing required fields
  const missingFields = requiredFields.filter(field => !preferences[field]);
  if (missingFields.length > 0) {
    throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
  }

  // Validate numeric fields
  if (isNaN(preferences.monthlySalary) || preferences.monthlySalary <= 0) {
    throw new Error('Monthly salary must be a positive number');
  }

  if (isNaN(preferences.depositAmount) || preferences.depositAmount <= 0) {
    throw new Error('Deposit amount must be a positive number');
  }

  // Validate emergency fund amount if provided
  if (preferences.emergencyNeeds) {
    if (isNaN(preferences.emergencyNeeds) || preferences.emergencyNeeds < 0) {
      throw new Error('Emergency fund amount must be a non-negative number');
    }
  }

  // Validate employment status
  const validEmploymentStatuses = ['student', 'full-time', 'part-time', 'self-employed'];
  if (!validEmploymentStatuses.includes(preferences.employmentStatus)) {
    throw new Error('Invalid employment status');
  }

  // Validate deposit frequency
  const validFrequencies = ['weekly', 'monthly', 'yearly', 'ad hoc'];
  if (!validFrequencies.includes(preferences.depositFrequency)) {
    throw new Error('Invalid deposit frequency');
  }

  // Validate risk profile
  const validRiskProfiles = ['conservative', 'moderate', 'aggressive'];
  if (!validRiskProfiles.includes(preferences.riskProfile)) {
    throw new Error('Invalid risk profile');
  }

  // Validate spending habits
  const validSpendingHabits = ['consistent', 'variable'];
  if (!validSpendingHabits.includes(preferences.spendingHabits)) {
    throw new Error('Invalid spending habits');
  }

  // Validate liquidity needs
  const validLiquidityNeeds = ['high', 'medium', 'low'];
  if (!validLiquidityNeeds.includes(preferences.liquidityNeeds)) {
    throw new Error('Invalid liquidity needs');
  }

  return true;
};

// Validate API response
const validatePredictionResponse = (response) => {
  const requiredFields = [
    'projectedGrowth', 
    'expectedReturn', 
    'riskMetrics', 
    'suggestions', 
    'warnings',
    'notes',
    'reasoning'
  ];
  
  const missingFields = requiredFields.filter(field => !response[field]);
  if (missingFields.length > 0) {
    throw new Error(`Invalid API response: missing ${missingFields.join(', ')}`);
  }

  // Basic structure validation
  const growth = response.projectedGrowth;
  if (!growth['1yr'] || !growth['5yr'] || !growth['10yr']) {
    throw new Error('Invalid projected growth format');
  }

  // Validate return expectations structure
  const returns = response.expectedReturn;
  if (typeof returns.min !== 'number' || typeof returns.max !== 'number') {
    throw new Error('Invalid expected return format');
  }

  // Validate risk metrics structure
  const riskMetrics = response.riskMetrics;
  if (typeof riskMetrics.volatilityScore !== 'number' ||
      !riskMetrics.originalProfile ||
      !riskMetrics.adjustedProfile) {
    throw new Error('Invalid risk metrics format');
  }

  // Validate suggestions structure
  if (!Array.isArray(response.suggestions)) {
    throw new Error('Invalid suggestions format');
  }

  return true;
};

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function makeApiRequest(payload) {
  let attempt = 0;
  
  while (attempt < MAX_RETRIES) {
    try {
      console.log(`Attempt ${attempt + 1}: Making Grok API request with model ${API_CONFIG.MODEL}`);
      
      const requestPayload = {
        model: API_CONFIG.MODEL,
        temperature: 0.2,
        messages: [
          {
            role: "system",
            content: systemPrompt
          },
          {
            role: "user",
            content: JSON.stringify(payload, null, 2)
          }
        ],
        response_format: { type: "json_object" }
      };

      const response = await grokClient.post('/chat/completions', requestPayload);
      
      if (!response.data?.choices?.[0]?.message?.content) {
        throw new Error('Invalid response format from Grok API');
      }

      const result = response.data.choices[0].message.content;
      console.log('Successful response from Grok:', result);
      
      try {
        return JSON.parse(result);
      } catch (parseError) {
        throw new Error('Invalid JSON response from Grok API');
      }

    } catch (error) {
      console.error(`API request failed (attempt ${attempt + 1}):`, error.message);
      attempt++;
      
      if (attempt === MAX_RETRIES) {
        throw new Error(`Failed to get response from Grok after ${MAX_RETRIES} attempts: ${error.message}`);
      }
      
      await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
    }
  }
}

export const getInvestmentPredictions = async (preferences) => {
  console.log('Starting investment prediction generation:', preferences);
  
  try {
    // Validate user preferences
    validateUserPreferences(preferences);

    const payload = {
      model: API_CONFIG.MODEL,
      temperature: 0.1,
      messages: [
        {
          role: "system",
          content: systemPrompt
        },
        {
          role: "user",
          content: JSON.stringify(preferences, null, 2)
        }
      ],
      response_format: { type: "json_object" }
    };

    console.log('Sending request to Grok API:', payload);
    
    const response = await grokClient.post('/chat/completions', payload);
    
    if (!response.data?.choices?.[0]?.message?.content) {
      throw new Error('Invalid response format from Grok API');
    }

    let predictions = JSON.parse(response.data.choices[0].message.content);
    console.log('Received predictions from Grok:', predictions);
    
    validatePredictionResponse(predictions);

    return {
      ...predictions,
      isDemo: false
    };

  } catch (error) {
    console.error('Investment prediction error:', error);
    throw error;
  }
};

export default {
  getInvestmentPredictions
}; 