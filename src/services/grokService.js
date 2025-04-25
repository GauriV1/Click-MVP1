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

class ValidationError extends Error {
  constructor(message, fields = []) {
    super(message);
    this.name = 'ValidationError';
    this.fields = fields;
  }
}

// Request ID generator
const generateRequestId = () => {
  return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

// Enhanced API configuration
const API_CONFIG = {
  BASE_URL: process.env.REACT_APP_GROK_API_URL || 'https://api.x.ai/v1',
  ENDPOINTS: {
    CHAT: '/chat/completions',
    INVESTMENT: '/investment/predictions'  // Updated endpoint
  },
  API_KEY: process.env.REACT_APP_GROK_API_KEY,
  MODEL: 'grok-v1',
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
  const apiKey = API_CONFIG.API_KEY;
  if (!apiKey) {
  console.error('Missing Grok API key. Please set REACT_APP_GROK_API_KEY environment variable.');
    if (process.env.REACT_APP_USE_FALLBACK_DATA === 'true') {
      console.warn('Fallback data is enabled, will use demo data');
      return Promise.reject(new Error('API key not found - using fallback data'));
    }
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
  const requiredFields = {
    riskProfile: ['conservative', 'moderate', 'aggressive'],
    depositFrequency: ['weekly', 'monthly', 'yearly'],
    monthlySalary: (val) => !isNaN(val) && val > 0,
    depositAmount: (val) => !isNaN(val) && val > 0,
    age: (val) => !isNaN(val) && val >= 18 && val <= 120,
    employmentStatus: ['full-time', 'part-time', 'self-employed', 'student'],
    liquidityNeeds: ['high', 'medium', 'low'],
    spendingHabits: ['consistent', 'variable']
  };

  const errors = [];
  Object.entries(requiredFields).forEach(([field, validation]) => {
    const value = preferences[field];
    if (value === undefined || value === null || value === '') {
      errors.push(`Missing required field: ${field}`);
    } else if (Array.isArray(validation)) {
      if (!validation.includes(value)) {
        errors.push(`Invalid value for ${field}: ${value}. Must be one of: ${validation.join(', ')}`);
      }
    } else if (typeof validation === 'function') {
      if (!validation(value)) {
        errors.push(`Invalid value for ${field}: ${value}`);
      }
    }
  });

  if (errors.length > 0) {
    throw new ValidationError('Invalid preferences', errors);
  }
};

// Improved JSON parsing with better extraction and repair
const extractAndRepairJson = (text) => {
  console.log('Raw text to parse:', text);
  
  try {
    // First try direct parsing in case it's already valid JSON
    try {
      return JSON.parse(text);
    } catch (e) {
      console.log('Direct parsing failed, attempting repair...');
    }

    // Try to extract JSON block with more robust regex
    const jsonRegex = /\{(?:[^{}]|(?:\{[^{}]*\}))*\}/g;
    const matches = text.match(jsonRegex);
    
    if (!matches) {
      console.error('No JSON object found in text');
      throw new Error('No JSON object found in response');
    }

    // Get the largest match as it's likely the complete JSON
    let jsonStr = matches.reduce((a, b) => a.length > b.length ? a : b);
    console.log('Extracted potential JSON:', jsonStr);

    // Common repairs
    jsonStr = jsonStr
      // Fix unquoted property names
      .replace(/([{,]\s*)(\w+)(\s*:)/g, '$1"$2"$3')
      // Remove trailing commas before closing braces
      .replace(/,(\s*[}\]])/g, '$1')
      // Fix single quotes to double quotes
      .replace(/'/g, '"')
      // Ensure numbers are valid JSON
      .replace(/(\d+)%/g, '$1')
      // Fix common formatting issues
      .replace(/\n/g, ' ')
      .replace(/\r/g, '')
      .replace(/\t/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

    // Ensure all properties and string values are properly quoted
    jsonStr = jsonStr.replace(/(['"])?([a-zA-Z0-9_]+)(['"])?:/g, '"$2":');

    // Try to parse the repaired JSON
    try {
      const parsed = JSON.parse(jsonStr);
      console.log('Successfully parsed repaired JSON');
      return parsed;
    } catch (parseError) {
      console.error('Failed to parse repaired JSON:', parseError);
      throw new Error(`Failed to parse JSON: ${parseError.message}`);
    }
  } catch (error) {
    console.error('Error in extractAndRepairJson:', error);
    throw error;
  }
};

// Update transformResponse to use the new extraction
const transformResponse = (response) => {
  try {
    console.log('Transforming response:', response);
    
    // If response is already an object, validate and return
    if (typeof response === 'object' && response !== null) {
      console.log('Response is already an object');
      return response;
    }

    // If it's a string, try to extract and parse JSON
    if (typeof response === 'string') {
      console.log('Extracting JSON from response string');
      return extractAndRepairJson(response);
    }

    throw new Error('Invalid response type: ' + typeof response);
  } catch (error) {
    console.error('Error transforming response:', error);
    throw error;
  }
};

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Enhanced API request with better error handling
async function makeApiRequest(payload, requestId) {
  const startTime = Date.now();
  let attempt = 0;
  let lastError = null;
  
  while (attempt < API_CONFIG.MAX_RETRIES) {
    try {
      console.log(`[${requestId}] Making API request (attempt ${attempt + 1})`);
      
      const response = await axios({
        method: 'post',
        url: `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.INVESTMENT}`,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${API_CONFIG.API_KEY}`,
          'X-Request-ID': requestId
        },
        data: payload,
        timeout: API_CONFIG.TIMEOUT
      });

      if (!response.data?.choices?.[0]?.message?.content) {
        throw new GrokAPIError('Invalid API response structure', 'INVALID_RESPONSE');
      }

      const content = response.data.choices[0].message.content.trim();
      console.log(`[${requestId}] Raw API response content:`, content);

      // Parse and validate the response
      const parsedResult = extractAndRepairJson(content);
      
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
          processingTime: Date.now() - startTime,
          attempt: attempt + 1,
          isDemo: false
        }
      };

    } catch (error) {
      console.error(`[${requestId}] API request failed (attempt ${attempt + 1}):`, error);
      
      // Enhance error with request context
      const enhancedError = new GrokAPIError(
        error.message,
        error.code || 'UNKNOWN_ERROR',
        {
          requestId,
          attempt: attempt + 1,
          timestamp: new Date().toISOString(),
          originalError: error
        }
      );

      attempt++;
      
      if (attempt === API_CONFIG.MAX_RETRIES) {
        throw enhancedError;
      }
      
      const delay = API_CONFIG.RETRY_DELAY * Math.pow(2, attempt - 1);
      console.log(`[${requestId}] Retrying in ${delay}ms...`);
      await sleep(delay);
    }
  }
}

// Enhanced investment predictions function
export const getInvestmentPredictions = async (preferences) => {
  const requestId = generateRequestId();
  console.log(`[${requestId}] Starting investment prediction request`);

  try {
    // Validate preferences
    validateUserPreferences(preferences);

    // Check for API key
    if (!API_CONFIG.API_KEY) {
      console.warn(`[${requestId}] No Grok API key found`);
      if (process.env.REACT_APP_USE_FALLBACK_DATA === 'true') {
        console.log(`[${requestId}] Using fallback predictions`);
        return {
          ...getFallbackPredictions(preferences),
          metadata: {
            requestId,
            timestamp: new Date().toISOString(),
            isDemo: true
          }
        };
      }
      throw new GrokAPIError('Missing API key', 'MISSING_API_KEY');
    }

    // Make the API request
    return await makeApiRequest(preferences, requestId);

  } catch (error) {
    console.error(`[${requestId}] Error getting investment predictions:`, error);
    
    if (process.env.REACT_APP_USE_FALLBACK_DATA === 'true') {
      console.warn(`[${requestId}] Using fallback predictions due to error:`, error.message);
      return {
        ...getFallbackPredictions(preferences),
        metadata: {
          requestId,
          timestamp: new Date().toISOString(),
          isDemo: true,
          error: {
            message: error.message,
            code: error.code,
            details: error.details
          }
        }
      };
    }
    
    throw error;
  }
};

// Fallback function to provide demo data when API fails
const getFallbackPredictions = (preferences) => {
  console.log('Generating fallback predictions for:', preferences);
  
  // Extract key preferences
  const { riskProfile, monthlySalary = 0, depositAmount = 0, depositFrequency } = preferences;
  
  // Calculate monthly investment amount
  let monthlyInvestment = Number(depositAmount) || 0;
  if (depositFrequency === 'weekly') {
    monthlyInvestment = monthlyInvestment * 4.33;
  } else if (depositFrequency === 'yearly') {
    monthlyInvestment = monthlyInvestment / 12;
  }
  
  // Calculate investment percentage of salary
  const monthlySalaryNum = Number(monthlySalary) || 1; // Prevent division by zero
  const investmentPercentage = (monthlyInvestment / monthlySalaryNum) * 100;
  
  // Generate appropriate growth projections based on risk profile
  let projectedGrowth = {
    '1yr': 0,
    '5yr': 0,
    '10yr': 0
  };
  
  let expectedReturn = {
    min: 0,
    max: 0
  };
  
  if (riskProfile === 'conservative') {
    projectedGrowth = {
      '1yr': 4.5,
      '5yr': 18.2,
      '10yr': 35.7
    };
    expectedReturn = {
      min: 3.5,
      max: 5.5
    };
  } else if (riskProfile === 'moderate') {
    projectedGrowth = {
      '1yr': 6.2,
      '5yr': 27.5,
      '10yr': 58.3
    };
    expectedReturn = {
      min: 5.0,
      max: 7.5
    };
  } else { // aggressive
    projectedGrowth = {
      '1yr': 8.7,
      '5yr': 38.9,
      '10yr': 82.4
    };
    expectedReturn = {
      min: 7.0,
      max: 10.0
    };
  }
  
  // Generate risk metrics
  const riskMetrics = {
    volatilityScore: riskProfile === 'conservative' ? 0.3 : (riskProfile === 'moderate' ? 0.5 : 0.7),
    originalProfile: riskProfile,
    adjustedProfile: riskProfile,
    ageConsideration: "Based on your age and risk profile, we've maintained your selected risk level."
  };
  
  // Generate investment suggestions with safe number handling
  const suggestions = [];
  const allocations = riskProfile === 'conservative' 
    ? [
        { percent: 0.45, fund: 'VTI (Vanguard Total Stock Market ETF)' },
        { percent: 0.25, fund: 'BND (Vanguard Total Bond Market ETF)' },
        { percent: 0.15, fund: 'VXUS (Vanguard Total International Stock ETF)' },
        { percent: 0.15, fund: 'VYM (Vanguard High Dividend Yield ETF)' }
      ]
    : riskProfile === 'moderate'
    ? [
        { percent: 0.55, fund: 'VTI (Vanguard Total Stock Market ETF)' },
        { percent: 0.20, fund: 'BND (Vanguard Total Bond Market ETF)' },
        { percent: 0.15, fund: 'VXUS (Vanguard Total International Stock ETF)' },
        { percent: 0.10, fund: 'VGT (Vanguard Information Technology ETF)' }
      ]
    : [ // aggressive
        { percent: 0.65, fund: 'VTI (Vanguard Total Stock Market ETF)' },
        { percent: 0.15, fund: 'VGT (Vanguard Information Technology ETF)' },
        { percent: 0.10, fund: 'VXUS (Vanguard Total International Stock ETF)' },
        { percent: 0.10, fund: 'ARKK (ARK Innovation ETF)' }
      ];

  allocations.forEach(({ percent, fund }) => {
    const amount = monthlyInvestment * percent;
    suggestions.push(`Allocate $${amount.toFixed(2)} to ${fund}`);
  });
  
  // Generate warnings if investment percentage is too high
  const warnings = [];
  if (investmentPercentage > 20) {
    warnings.push(`Your monthly investment of $${monthlyInvestment.toFixed(2)} represents ${investmentPercentage.toFixed(1)}% of your monthly salary, which is above the recommended 20%.`);
  }
  
  // Generate notes and reasoning
  const notes = `Based on your ${riskProfile} risk profile, we recommend a diversified portfolio with a focus on ${
    riskProfile === 'conservative' ? 'stability and income' : 
    riskProfile === 'moderate' ? 'balanced growth' : 
    'aggressive growth'
  }.`;
  
  const reasoning = `Your monthly investment of $${monthlyInvestment.toFixed(2)} (${investmentPercentage.toFixed(1)}% of your monthly salary) is ${
    investmentPercentage > 20 ? 'above' : 'within'
  } the recommended range. The ${riskProfile} risk profile is appropriate for your investment goals.`;
  
  // Generate growth model
  const growthModel = {
    description: `Based on your age and risk profile, we've maintained your selected risk level.`,
    assumptions: [
      'Regular monthly contributions maintained',
      'Market conditions align with historical averages',
      `Risk profile remains ${riskProfile}`,
      'No major economic disruptions'
    ],
    factors: [
      'Historical market performance data',
      'Risk-adjusted return calculations',
      'Economic growth projections',
      'Inflation expectations'
    ],
    methodology: `Growth projections use compound interest calculations adjusted for ${riskProfile} risk profile, incorporating market volatility and systematic risk factors.`
  };

      return {
    projectedGrowth,
    expectedReturn,
    riskMetrics,
    suggestions,
    warnings,
    notes,
    reasoning,
    growthModel,
    isDemo: true
  };
};

export default {
  getInvestmentPredictions
}; 