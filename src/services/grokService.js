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

const systemPrompt = `IMPORTANT: If at any point you cannot generate a full JSON, respond with an object like
{ "error": "could not generate projections", "notes": "reason for failure" }
rather than empty content.

Click's financial prediction assistant generates personalized investment projections based on user profiles.
Our AI engine verifies that each plan aligns with the user's income, deposit frequency, and risk tolerance.  

1. Parse and validate the user object:
   • age (18-120) - Must be a valid age for investment planning
   • monthlySalary (in $) - This is monthly income, must be reasonable (e.g., $2,000-$50,000/month)
   • employmentStatus: 'full-time', 'part-time', 'self-employed', 'student'
   • depositAmount (in $) & depositFrequency: 'weekly', 'monthly', 'yearly', 'ad hoc'
   • riskProfile: 'conservative', 'moderate', 'aggressive'
   • spendingHabits: 'consistent', 'variable'
   • liquidityNeeds: 'high', 'medium', 'low'
   • emergencyNeeds (in $) - Current emergency fund amount

2. Age-Based Risk Assessment:
   • Age 18-30: Can maintain selected risk profile (focus on growth)
   • Age 31-45: Reduce aggressive profiles if emergency fund < 4 months
   • Age 46-60: Maximum moderate risk unless emergency fund > 6 months
   • Age 60+: Default to conservative unless explicitly overridden
   • For all ages: Consider time to retirement vs. risk profile

3. Emergency Fund Analysis:
   • Calculate monthly expenses as 70% of monthly salary
   • Required emergency fund = 3-6 months of expenses
   • Example: If monthly salary is $5,000
     - Monthly expenses ≈ $3,500 (70% of salary)
     - Required emergency fund = $10,500-$21,000 (3-6 months)
   • Flag if emergency fund is insufficient

4. Income vs Investment Ratio:
   • Calculate monthly investment:
     - Weekly deposits: amount * 4.33
     - Monthly deposits: amount * 1
     - Yearly deposits: amount / 12
     - Ad hoc: treat as yearly / 12
   • Flag if monthly investment > 20% of monthly salary
   • For ages 18-30: Allow up to 30% if emergency fund is sufficient
   • For ages 31+: Maintain 20% cap strictly

5. Growth Projections (MUST follow these ranges):
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

6. Always return valid JSON in this shape:
{
  "projectedGrowth": { "1yr": number, "5yr": number, "10yr": number },
  "expectedReturn": { "min": number, "max": number },
  "riskMetrics": {
    "volatilityScore": number,
    "originalProfile": string,
    "adjustedProfile": string,
    "ageConsideration": string  // Explanation of how age affected the recommendation
  },
  "suggestions": string[],  // Each suggestion must include ETF name and exact dollar amount based on monthly investment
  "warnings": string[],
  "notes": string,
  "reasoning": string,  // Must include clear monthly salary, age considerations, and emergency fund analysis
  "growthModel": {
    "description": string,  // Detailed explanation of the growth model used
    "assumptions": string[],  // Key assumptions made in the growth calculations
    "factors": string[],  // Specific factors considered (e.g., inflation, market conditions, economic indicators)
    "methodology": string  // Brief explanation of how projections were calculated
  }
}

7. Base portfolio allocations (calculate exact $ based on monthly investment):
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

8. Risk Assessment Rules:
   • If emergency fund < 3 months expenses: Reduce risk profile one level
   • If monthly investment > 20% of monthly salary (30% for ages 18-30): Reduce risk profile one level
   • If student/part-time with high liquidity needs: Maximum moderate risk
   • If emergency fund < 1 month expenses: Force conservative profile
   • If age > 60: Default to conservative unless explicitly justified
   • If age 46-60: Cap at moderate unless strong financial position

9. The explanation in "notes" and "reasoning" must explicitly state:
   • Age: X years old
   • Monthly salary: $X
   • Monthly expenses (70% of salary): $X
   • Required emergency fund (3-6 months expenses): $X-$X
   • Current emergency fund: $X
   • Monthly investment amount: $X (X% of monthly salary)
   • Age-appropriate risk adjustments made
   • Any other risk adjustments made and why

10. Growth Model Explanation:
    • Clearly explain the growth model used for projections
    • List key assumptions (e.g., inflation rates, market conditions)
    • Detail specific factors considered in the calculations
    • Explain how different time horizons affect the projections
    • Describe how risk profile influences the growth model
    • For each time horizon (1yr, 5yr, 10yr) provide:
      - Base growth rate calculation
      - Risk-adjusted return calculation
      - Compound interest formula applied
      - Final percentage calculation
   
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

// Transform API response into the expected format
const transformResponse = (response) => {
  if (!response.data?.choices?.[0]?.message?.content) {
    console.error('Invalid response structure:', response);
    throw new Error('Invalid API response structure: missing content');
  }

  try {
    const content = response.data.choices[0].message.content;
    console.log('Parsing response content:', content);
    
    const parsedContent = JSON.parse(content);
    console.log('Parsed content:', parsedContent);
    
    // If the response contains an error message, throw it
    if (parsedContent.error) {
      throw new Error(`API Error: ${parsedContent.error} - ${parsedContent.notes || 'No additional details'}`);
    }
    
    // Validate the parsed response
    validatePredictionResponse(parsedContent);
    
    return parsedContent;
  } catch (error) {
    if (error instanceof SyntaxError) {
      console.error('Failed to parse response content:', error);
      throw new Error('Failed to parse API response as JSON');
    }
    throw error;
  }
};

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function makeApiRequest(payload) {
  let attempt = 0;
  
  while (attempt < MAX_RETRIES) {
    try {
      console.log(`Attempt ${attempt + 1}: Making Grok API request with model ${config.MODEL}`);
      
      const requestPayload = {
        model: config.MODEL,
        temperature: 0.1, // Lower temperature for more consistent JSON output
        max_tokens: 2000,
        messages: [
          {
            role: "system",
            content: systemPrompt
          },
          {
            role: "user",
            content: [
              "Click's AI — generate a personalized investment plan JSON.",
              "I'm giving you a user profile below.",
              "- You must output _only_ valid JSON with these top-level keys:",
              "  projectedGrowth, expectedReturn, riskMetrics, suggestions, warnings, notes, reasoning",
              "- Do not echo back the input.",
              "",
              "User profile:",
              JSON.stringify(payload, null, 2)
            ].join("\n")
          }
        ]
      };

      console.log('Request payload:', JSON.stringify(requestPayload, null, 2));

      // Log the API key being used (masked for security)
      const maskedKey = config.API_KEY ? 
        `${config.API_KEY.substring(0, 4)}...${config.API_KEY.substring(config.API_KEY.length - 4)}` : 
        'undefined';
      console.log(`Using API key: ${maskedKey}`);

      const response = await grokClient.post('/chat/completions', requestPayload);
      
      // Log full response details
      console.log('API Response:', {
        status: response.status,
        statusText: response.statusText,
        headers: response.headers,
        data: response.data
      });

      // Log the raw API response for debugging
      console.debug("Grok raw response:", JSON.stringify(response.data, null, 2));

      // Check response status
      if (response.status !== 200) {
        throw new Error(`API returned status ${response.status}: ${response.statusText}`);
      }

      // Validate response structure
      if (!response.data) {
        console.error('No data in response');
        throw new Error('Empty response from API');
      }

      if (!response.data.choices || !Array.isArray(response.data.choices) || response.data.choices.length === 0) {
        console.error('Invalid response structure:', response.data);
        throw new Error('Invalid API response structure: missing choices array');
      }

      const choice = response.data.choices[0];
      if (!choice.message) {
        console.error('Invalid message structure:', choice);
        throw new Error('Invalid message structure in API response: missing message');
      }

      // Check both content and reasoning_content fields
      const { content = "", reasoning_content = "" } = choice.message;
      const jsonText = content.trim() || reasoning_content.trim();
      
      if (!jsonText) {
        console.error('Empty content in message:', choice.message);
        throw new Error('Empty content in API response message');
      }

      console.log('Raw response content:', jsonText);
      console.log('Content type:', typeof jsonText);
      console.log('Content length:', jsonText.length);

      let parsedResult;
      try {
        // Parse the JSON content
        parsedResult = JSON.parse(jsonText);
        console.log('Successfully parsed response as JSON');
      } catch (parseError) {
        console.error('Failed to parse response as JSON:', {
          error: parseError.message,
          content: jsonText
        });
        throw new Error(`Invalid JSON in API response: ${parseError.message}`);
      }

      // Check for error response from Grok
      if (parsedResult.error) {
        console.error('Grok returned an error:', parsedResult.error);
        throw new Error(`Grok API error: ${parsedResult.error}`);
      }

      // If Grok wrapped your payload in a top-level "predictions" key, unwrap it
      if (parsedResult.predictions && typeof parsedResult.predictions === 'object') {
        console.log('Unwrapping predictions from response');
        parsedResult = parsedResult.predictions;
      }

      // Validate parsed result
      if (!parsedResult || typeof parsedResult !== 'object') {
        console.error('Invalid parsed result:', parsedResult);
        throw new Error('Invalid response format: not a valid object');
      }

      // Now validate that we have the fields we expect
      const requiredFields = ['projectedGrowth', 'expectedReturn', 'riskMetrics', 'suggestions'];
      const missingFields = requiredFields.filter(field => !(field in parsedResult));
      
      if (missingFields.length > 0) {
        console.error('Missing required fields:', missingFields);
        console.error('Available fields:', Object.keys(parsedResult));
        throw new Error(`Missing required fields in response: ${missingFields.join(', ')}`);
      }

      return parsedResult;

    } catch (error) {
      console.error(`API request failed (attempt ${attempt + 1}):`, {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        headers: error.response?.headers
      });
      
      attempt++;
      
      if (attempt === MAX_RETRIES) {
        throw new Error(`Failed to get valid response after ${MAX_RETRIES} attempts: ${error.message}`);
      }
      
      // Exponential backoff
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
  const { riskProfile, monthlySalary, depositAmount, depositFrequency } = preferences;
  
  // Calculate monthly investment amount
  let monthlyInvestment = depositAmount;
  if (depositFrequency === 'weekly') {
    monthlyInvestment = depositAmount * 4.33;
  } else if (depositFrequency === 'yearly') {
    monthlyInvestment = depositAmount / 12;
  }
  
  // Calculate investment percentage of salary
  const investmentPercentage = (monthlyInvestment / monthlySalary) * 100;
  
  // Generate appropriate growth projections based on risk profile
  let projectedGrowth = {};
  let expectedReturn = {};
  
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
  
  // Generate investment suggestions
  const suggestions = [];
  
  if (riskProfile === 'conservative') {
    suggestions.push(`Allocate $${(monthlyInvestment * 0.45).toFixed(2)} to VTI (Vanguard Total Stock Market ETF)`);
    suggestions.push(`Allocate $${(monthlyInvestment * 0.25).toFixed(2)} to BND (Vanguard Total Bond Market ETF)`);
    suggestions.push(`Allocate $${(monthlyInvestment * 0.15).toFixed(2)} to VXUS (Vanguard Total International Stock ETF)`);
    suggestions.push(`Allocate $${(monthlyInvestment * 0.15).toFixed(2)} to VYM (Vanguard High Dividend Yield ETF)`);
  } else if (riskProfile === 'moderate') {
    suggestions.push(`Allocate $${(monthlyInvestment * 0.55).toFixed(2)} to VTI (Vanguard Total Stock Market ETF)`);
    suggestions.push(`Allocate $${(monthlyInvestment * 0.20).toFixed(2)} to BND (Vanguard Total Bond Market ETF)`);
    suggestions.push(`Allocate $${(monthlyInvestment * 0.15).toFixed(2)} to VXUS (Vanguard Total International Stock ETF)`);
    suggestions.push(`Allocate $${(monthlyInvestment * 0.10).toFixed(2)} to VGT (Vanguard Information Technology ETF)`);
  } else { // aggressive
    suggestions.push(`Allocate $${(monthlyInvestment * 0.65).toFixed(2)} to VTI (Vanguard Total Stock Market ETF)`);
    suggestions.push(`Allocate $${(monthlyInvestment * 0.15).toFixed(2)} to VGT (Vanguard Information Technology ETF)`);
    suggestions.push(`Allocate $${(monthlyInvestment * 0.10).toFixed(2)} to VXUS (Vanguard Total International Stock ETF)`);
    suggestions.push(`Allocate $${(monthlyInvestment * 0.10).toFixed(2)} to ARKK (ARK Innovation ETF)`);
  }
  
  // Generate warnings if investment percentage is too high
  const warnings = [];
  if (investmentPercentage > 20) {
    warnings.push(`Your monthly investment of $${monthlyInvestment.toFixed(2)} represents ${investmentPercentage.toFixed(1)}% of your monthly salary, which is above the recommended 20%.`);
  }
  
  // Generate notes and reasoning
  const notes = `Based on your ${riskProfile} risk profile, we recommend a diversified portfolio with a focus on ${riskProfile === 'conservative' ? 'stability and income' : (riskProfile === 'moderate' ? 'balanced growth' : 'aggressive growth')}.`;
  
  const reasoning = `Your monthly investment of $${monthlyInvestment.toFixed(2)} (${investmentPercentage.toFixed(1)}% of your monthly salary) is ${investmentPercentage > 20 ? 'above' : 'within'} the recommended range. The ${riskProfile} risk profile is appropriate for your investment goals.`;
  
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
    monthlyInvestmentAmount: monthlyInvestment,
    investmentPercentageOfSalary: investmentPercentage,
    projectedGrowth: {
      oneYear: projectedGrowth['1yr'],
      fiveYear: projectedGrowth['5yr'],
      tenYear: projectedGrowth['10yr']
    },
    expectedReturn: expectedReturn,
    riskMetrics: riskMetrics,
    suggestions: suggestions,
    warnings: warnings,
    notes: notes,
    reasoning: reasoning,
    growthModel: growthModel,
    isDemo: true
  };
};

export default {
  getInvestmentPredictions
};