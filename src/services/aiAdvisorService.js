import axios from 'axios';

// API Configuration
const config = {
  BASE_URL: process.env.REACT_APP_GROK_API_URL || 'https://api.x.ai/v1',
  API_KEY: process.env.REACT_APP_GROK_API_KEY,
  MODEL: 'grok-3-mini-fast-beta'
};

// Validate API key
if (!config.API_KEY) {
  console.error('Missing Grok API key. Please set REACT_APP_GROK_API_KEY environment variable.');
  throw new Error('Missing REACT_APP_GROK_API_KEY environment variable');
}

// Create an axios instance with default configuration
const grokClient = axios.create({
  baseURL: config.BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${config.API_KEY}`
  },
  timeout: 60000
});

const MAX_RETRIES = 3;
const RETRY_DELAY = 2000;

const systemPrompt = `You're Click's friendly AI money buddy! Think of yourself as a helpful friend who knows about money - not a formal advisor.

IMPORTANT - YOUR RESPONSES MUST:
• Be super casual and friendly
• Never mention specific years or dates
• Never use stock price predictions
• Never use percentages over 100%
• Never mention technical terms like "beta", "annualized", "extrapolated"
• Keep all numbers simple and round
• Limit to 2-3 sentences per section

BAD RESPONSE EXAMPLE:
"NVIDIA could see an annualized growth rate of 15-25% if AI demand remains strong. By early 2025, the stock price might reach $920-1100 based on 2023 trends extrapolated..."

GOOD RESPONSE EXAMPLE:
"Hey! NVIDIA's looking pretty strong right now thanks to all the AI buzz. Click suggests watching how the company grows its AI business, but remember - even strong companies can have ups and downs! 💡"

Response Format:
{
  "message": string,     // Main chat (max 3 sentences)
  "suggestions": [       // 2-3 quick tips
    {
      "title": string,  // One catchy phrase
      "details": string // One simple sentence
    }
  ],
  "resources": [        // Optional: 1 helpful link
    {
      "title": string,
      "description": string, // One simple sentence
      "link": string
    }
  ]
}

When talking about:
• Stocks: Skip specific prices, just say "doing well" or "having a rough time"
• Growth: Use simple terms like "growing fast" or "steady growth"
• Risk: Say things like "pretty risky" or "generally stable"
• Money: Round everything to simple numbers

EXAMPLES OF GOOD RESPONSES:

For stock questions:
"Hey! Apple's been doing pretty well lately with all their cool new products. Just remember - even big companies have their ups and downs! 🍎"

For investment advice:
"Think of investing like pizza - it's good to have different slices! Click suggests mixing some steady companies with a few exciting ones."

For market trends:
"The tech world's pretty excited about AI right now! But remember - it's smart to not put all your eggs in one basket. 💡"

Remember:
• Talk like a friendly neighbor
• No dates or timestamps ever
• Keep numbers super simple
• No complex terms
• No specific price predictions
• Use "Click suggests" instead of "I suggest"
• Max 1-2 emojis per message`;

const validateResponse = (response) => {
  const requiredFields = ['message', 'suggestions'];
  
  const missingFields = requiredFields.filter(field => !response[field]);
  if (missingFields.length > 0) {
    throw new Error(`Invalid response format: missing ${missingFields.join(', ')}`);
  }

  if (!Array.isArray(response.suggestions)) {
    throw new Error('Invalid suggestions format');
  }

  if (response.resources && !Array.isArray(response.resources)) {
    throw new Error('Invalid resources format');
  }

  return true;
};

async function makeApiRequest(question) {
  let attempt = 0;
  
  while (attempt < MAX_RETRIES) {
    try {
      const requestPayload = {
        model: config.MODEL,
        temperature: 0.7, // Higher temperature for more conversational responses
        messages: [
          {
            role: "system",
            content: systemPrompt
          },
          {
            role: "user",
            content: question
          }
        ],
        response_format: { type: "json_object" }
      };

      const response = await grokClient.post('/chat/completions', requestPayload);
      
      if (!response.data?.choices?.[0]?.message?.content) {
        throw new Error('Invalid response format from Grok API');
      }

      const result = JSON.parse(response.data.choices[0].message.content);
      validateResponse(result);
      return result;

    } catch (error) {
      console.error(`AI Advisor request failed (attempt ${attempt + 1}):`, error.message);
      attempt++;
      
      if (attempt === MAX_RETRIES) {
        throw new Error(`Failed to get response after ${MAX_RETRIES} attempts: ${error.message}`);
      }
      
      await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
    }
  }
}

export const getAIAdvice = async (question) => {
  try {
    if (!question || question.trim().length === 0) {
      throw new Error('Please provide a question');
    }

    return await makeApiRequest(question);

  } catch (error) {
    console.error('AI Advisor error:', error);
    throw error;
  }
};

export default {
  getAIAdvice
}; 