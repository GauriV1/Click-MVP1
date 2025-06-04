import axios from 'axios';

// Custom error classes for better error handling
class GrokAPIError extends Error {
  constructor(message, code, details = {}) {
    super(message);
    this.name = 'GrokAPIError';
    this.code = code;
    this.details = details;
  }
}

// Request ID generator
const generateRequestId = () => {
  return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

// Enhanced API configuration
const API_CONFIG = {
  BASE_URL: '',               // same-origin
  ENDPOINTS: { CHAT: '/api/grok' },
  MODEL: 'grok-3-mini-fast-beta',
  VERSION: '1.0',
  MAX_RETRIES: 3,
  RETRY_DELAY: 2000,
  TIMEOUT: 30000,
  BATCH_SIZE: 5
};

// Create an axios instance with default configuration
const grokClient = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 60000
});

// Add authorization header dynamically
grokClient.interceptors.request.use((config) => {
  const apiKey = process.env.REACT_APP_GROK_API_KEY;
  if (!apiKey) {
    if (process.env.REACT_APP_USE_FALLBACK_DATA === 'true') {
      console.info('Using fallback data for demo purposes');
      return Promise.reject(new Error('API key not found - using fallback data'));
    }
    console.error('Missing Grok API key. Please set REACT_APP_GROK_API_KEY environment variable.');
    return Promise.reject(new Error('API key not found'));
  }
  config.headers.Authorization = `Bearer ${apiKey}`;
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Enhanced system prompt to better explain the context and requirements
const systemPrompt = `
You are Click's Investment Prediction AI (Prototype). Click is world's first AI proxy, transparent wealth manager that:
1. Learns from your age, emergency fund, risk appetite, income vs. investment ratio, and employment, and self corrects in real time. 
2. Adapts risk on the fly—downgrading overly aggressive plans and explaining why in plain English.
3. Projects returns and suggests ETF allocations in seconds, with clear summaries of your key metrics.
4. This is a demo trailer of what the full Click system will ultimately deliver for everyday investors.

INPUT FACTORS (equal weight):  
• Age  
• Emergency fund (3–6× monthly expenses)  
• Selected risk profile  
• Income vs. investment ratio  
• Employment status  
(Also consider liquidity needs and spending habits with slightly less weight.)

CALCULATIONS:  
• Monthly expenses = 62% of salary  
• Required emergency fund = 3–6 × monthly expenses  
• Investment ratio = monthly investment ÷ salary  

OVERRIDE LOGIC:  
If factors conflict (e.g., student earning $1,800/mo investing $1,400/mo under Aggressive), lower risk by 1–2 levels and explain.

OUTPUT ONLY valid JSON with these fields:
{
  "adjustedRisk": string,             // final risk level
  "expectedReturn": {                 // annual return % range
    "min": number,
    "max": number
  },
  "projectedGrowth": {                // growth % over time
    "1yr": number,
    "5yr": number,
    "10yr": number
  },
  "riskMetrics": {                    // risk details
    "volatilityScore": number,        // 0–1
    "originalProfile": string,
    "adjustedProfile": string,
    "ageConsideration": string
  },
  "portfolioAllocations": {           // suggested % allocations
    "CoreETFs": number,
    "Bonds": number,
    "International": number,
    "SectorETFs": number
  },
  "suggestions": string[],            // specific ETF $ allocations
  "warnings": string[],               // risk warnings
  "notes": string,                    // strategy notes
  "reasoning": string,                // detailed rationale
  "summary": string,                  // bullet-style calc summary
  "growthModel": {                    // model description
    "description": string,
    "assumptions": string[],
    "factors": string[],
    "methodology": string
  }
}

Be concise. Return nothing else. Make sure to use language that an everyday human understands. Dont get too fancy. No emojis.
`;

// Enhanced validation with specific checks
const validateUserPreferences = (preferences) => {
  console.log('Validating preferences:', preferences);
  const errors = [];
  
  if (!preferences) {
    console.warn('Preferences object is missing');
    return { isValid: false, errors: ['Preferences object is required'] };
  }

  // Required fields
  const requiredFields = ['age', 'monthlySalary', 'depositAmount', 'riskProfile', 'depositFrequency'];
  requiredFields.forEach(field => {
    if (!preferences[field]) {
      console.warn(`Missing required field: ${field}`);
      errors.push(`${field} is required`);
    }
  });

  // Age validation
  if (preferences.age) {
    const age = Number(preferences.age);
    if (isNaN(age) || age < 18 || age > 120) {
      errors.push('Age must be between 18 and 120');
    }
  }

  // Monthly salary validation
  if (preferences.monthlySalary) {
    const salary = Number(preferences.monthlySalary);
    if (isNaN(salary) || salary <= 0) {
      errors.push('Monthly salary must be a positive number');
    }
  }

  // Deposit amount validation
  if (preferences.depositAmount) {
    const amount = Number(preferences.depositAmount);
    if (isNaN(amount) || amount < 0) {
      errors.push('Deposit amount must be a non-negative number');
    }
  }

  // Risk profile validation
  if (preferences.riskProfile && !['conservative', 'moderate', 'aggressive'].includes(preferences.riskProfile)) {
    errors.push('Risk profile must be conservative, moderate, or aggressive');
  }

  // Deposit frequency validation
  if (preferences.depositFrequency && !['weekly', 'monthly', 'yearly', 'adhoc'].includes(preferences.depositFrequency)) {
    errors.push('Deposit frequency must be weekly, monthly, yearly, or adhoc');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

// Enhanced investment predictions function
export async function getInvestmentPredictions(preferences) {
  const requestId = generateRequestId();
  console.log(`[${requestId}] Getting investment predictions with preferences:`, preferences);
  
  try {
    // Validate preferences
    console.log(`[${requestId}] Validating preferences...`);
    const validationResult = validateUserPreferences(preferences);
    console.log(`[${requestId}] Validation result:`, validationResult);
    
    if (!validationResult.isValid) {
      console.warn(`[${requestId}] Invalid preferences:`, validationResult.errors);
      throw new Error(`Invalid preferences: ${validationResult.errors.join(', ')}`);
    }

    // Make API request
    console.log(`[${requestId}] Making API request to Grok`);
    const response = await grokClient.post(API_CONFIG.ENDPOINTS.CHAT, {
      messages: [
        {
          role: "system",
          content: systemPrompt
        },
        {
          role: "user",
          content: JSON.stringify(preferences)
        }
      ]
    });

    if (!response.data?.choices?.[0]?.message?.content) {
      throw new GrokAPIError('Invalid API response structure', 'INVALID_RESPONSE');
    }

    const content = response.data.choices[0].message.content.trim();
    console.log(`[${requestId}] Raw API response content:`, content);

    // Parse and validate the response
    const parsedResult = JSON.parse(content);
    
    // Log risk profile changes if they occur
    if (parsedResult.riskMetrics && 
        parsedResult.riskMetrics.originalProfile !== parsedResult.riskMetrics.adjustedProfile) {
      console.log(`[${requestId}] Risk profile adjusted from ${parsedResult.riskMetrics.originalProfile} to ${parsedResult.riskMetrics.adjustedProfile}`);
    }
    
    // Add metadata to the response
    return {
      ...parsedResult,
      metadata: {
        requestId,
        timestamp: new Date().toISOString(),
        isDemo: false
      }
    };

  } catch (error) {
    console.error(`[${requestId}] Error getting investment predictions:`, error.response?.data || error.message);
    throw error;
  }
}

const GrokService = {
  getInvestmentPredictions
};

export default GrokService; 