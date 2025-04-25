import axios from 'axios';

// API Configuration
const config = {
  BASE_URL: process.env.REACT_APP_GROK_API_URL || 'https://api.x.ai/v1',
  API_KEY: process.env.REACT_APP_GROK_API_KEY,
  MODEL: 'grok-3-mini-fast-beta'
};

// Create an axios instance with default configuration
const grokClient = axios.create({
  baseURL: config.BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 60000
});

// Add authorization header dynamically
grokClient.interceptors.request.use((config) => {
  const apiKey = process.env.REACT_APP_GROK_API_KEY;
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

const MAX_RETRIES = 3;
const RETRY_DELAY = 2000;

// Enhanced system prompt to better explain the context and requirements
const systemPrompt = `You are Click's Investment Prediction AI. Your role is to analyze user profiles and generate detailed investment projections.

ALWAYS return a complete JSON object with ALL of these fields (no fields can be empty or missing):

{
  "projectedGrowth": {
    "1yr": number (annual growth percentage),
    "5yr": number (5-year cumulative growth percentage),
    "10yr": number (10-year cumulative growth percentage)
  },
  "expectedReturn": {
    "min": number (minimum annual return percentage),
    "max": number (maximum annual return percentage)
  },
  "riskMetrics": {
    "volatilityScore": number (0-1 scale),
    "originalProfile": string (user's selected risk profile),
    "adjustedProfile": string (recommended risk profile),
    "ageConsideration": string (explanation of age impact)
  },
  "suggestions": string[] (array of specific ETF allocation suggestions),
  "warnings": string[] (array of risk warnings),
  "notes": string (general investment strategy notes),
  "reasoning": string (detailed explanation of recommendations),
  "growthModel": {
    "description": string (model overview),
    "assumptions": string[] (list of key assumptions),
    "factors": string[] (list of considered factors),
    "methodology": string (calculation approach)
  }
}

Growth projections MUST follow these ranges:
Conservative: 1yr: 2-6%, 5yr: 10-25%, 10yr: 25-50%
Moderate: 1yr: 4-8%, 5yr: 20-35%, 10yr: 40-80%
Aggressive: 1yr: 6-12%, 5yr: 30-50%, 10yr: 60-120%

Base recommendations on:
- Age vs risk tolerance
- Emergency fund adequacy (3-6 months of expenses)
- Monthly investment vs salary ratio (flag if >20%)
- Investment timeline
- Market conditions

Portfolio allocations by risk profile:
Conservative: 45% Core ETFs, 25% Bonds, 15% International, 15% Dividend
Moderate: 55% Core ETFs, 20% Bonds, 15% International, 10% Tech
Aggressive: 65% Core ETFs, 15% Tech, 10% International, 10% Growth`;

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
    'reasoning',
    'growthModel'
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

  // Validate growth model structure
  const growthModel = response.growthModel;
  if (!growthModel.description || !Array.isArray(growthModel.assumptions) || 
      !Array.isArray(growthModel.factors) || !growthModel.methodology) {
    throw new Error('Invalid growth model format');
  }

  return true;
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

// Update makeApiRequest to properly structure the user message
async function makeApiRequest(payload) {
  let attempt = 0;
  
  while (attempt < MAX_RETRIES) {
    try {
      console.log(`Attempt ${attempt + 1}: Making Grok API request`);
      
      const userMessage = `Generate investment predictions for this user profile. Return ONLY the JSON response matching the specified schema.

Profile Details:
- Monthly Salary: $${payload.monthlySalary}
- Employment: ${payload.employmentStatus}
- Age: ${payload.age || 'Not specified'}
- Risk Profile: ${payload.riskProfile}
- Deposit Amount: $${payload.depositAmount}
- Deposit Frequency: ${payload.depositFrequency}
- Emergency Fund: $${payload.emergencyNeeds || 0}
- Liquidity Needs: ${payload.liquidityNeeds}
- Spending Habits: ${payload.spendingHabits}`;

      const requestPayload = {
        model: config.MODEL,
        temperature: 0.1,
        max_tokens: 1000,
        messages: [
          {
            role: "system",
            content: systemPrompt
          },
          {
            role: "user",
            content: userMessage
          }
        ]
      };

      console.log('Sending request with payload:', userMessage);

      const response = await grokClient.post('/chat/completions', requestPayload);
      
      if (!response.data?.choices?.[0]?.message?.content) {
        throw new Error('Invalid API response structure');
      }

      const content = response.data.choices[0].message.content.trim();
      console.log('Raw API response content:', content);

      // Parse and validate the response
      const parsedResult = extractAndRepairJson(content);
      
      // Additional validation to ensure no empty or invalid values
      const validateField = (obj, path = '') => {
        if (!obj) return [`${path} is empty or null`];
        
        let errors = [];
        if (typeof obj === 'object') {
          Object.entries(obj).forEach(([key, value]) => {
            const newPath = path ? `${path}.${key}` : key;
            if (value === null || value === undefined || value === '') {
              errors.push(`${newPath} is empty or null`);
            } else if (Array.isArray(value) && value.length === 0) {
              errors.push(`${newPath} array is empty`);
            } else if (typeof value === 'object') {
              errors = errors.concat(validateField(value, newPath));
            }
          });
        }
        return errors;
      };

      const validationErrors = validateField(parsedResult);
      if (validationErrors.length > 0) {
        throw new Error(`Validation errors: ${validationErrors.join(', ')}`);
      }

      // Ensure all required fields are present with correct types
      const requiredFields = {
        projectedGrowth: ['1yr', '5yr', '10yr'],
        expectedReturn: ['min', 'max'],
        riskMetrics: ['volatilityScore', 'originalProfile', 'adjustedProfile', 'ageConsideration'],
        suggestions: Array.isArray,
        warnings: Array.isArray,
        notes: 'string',
        reasoning: 'string',
        growthModel: ['description', 'assumptions', 'factors', 'methodology']
      };

      // Validate all required fields and their types
      Object.entries(requiredFields).forEach(([field, validation]) => {
        if (!parsedResult[field]) {
          throw new Error(`Missing required field: ${field}`);
        }

        if (Array.isArray(validation)) {
          validation.forEach(subfield => {
            if (!(subfield in parsedResult[field])) {
              throw new Error(`Missing required subfield: ${field}.${subfield}`);
            }
          });
        } else if (typeof validation === 'function') {
          if (!validation(parsedResult[field])) {
            throw new Error(`Invalid type for field: ${field}`);
          }
        } else if (typeof parsedResult[field] !== validation) {
          throw new Error(`Invalid type for field: ${field}`);
        }
      });

      return parsedResult;

    } catch (error) {
      console.error(`API request failed (attempt ${attempt + 1}):`, error);
      attempt++;
      
      if (attempt === MAX_RETRIES) {
        throw new Error(`Failed to get valid response after ${MAX_RETRIES} attempts: ${error.message}`);
      }
      
      const delay = RETRY_DELAY * Math.pow(2, attempt - 1);
      console.log(`Retrying in ${delay}ms...`);
      await sleep(delay);
    }
  }
}

export const getInvestmentPredictions = async (preferences) => {
  try {
    // Validate preferences first
    validateUserPreferences(preferences);

    // Log the preferences being sent
    console.log('Sending preferences to Grok API:', preferences);

    // Check for API key before making request
    const apiKey = process.env.REACT_APP_GROK_API_KEY;
    if (!apiKey) {
      console.warn('No Grok API key found');
      if (process.env.REACT_APP_USE_FALLBACK_DATA === 'true') {
        console.log('Using fallback predictions due to missing API key');
        return getFallbackPredictions(preferences);
      }
      throw new Error('Missing REACT_APP_GROK_API_KEY environment variable');
    }

    // Make the API request
    const response = await makeApiRequest({
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: JSON.stringify(preferences) }
      ]
    });

    // Validate and transform the response
    return transformResponse(response);
  } catch (error) {
    console.error('Error getting investment predictions:', error);
    
    // If fallback data is enabled, use it
    if (process.env.REACT_APP_USE_FALLBACK_DATA === 'true') {
      console.warn('Using fallback predictions due to error:', error.message);
      return getFallbackPredictions(preferences);
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