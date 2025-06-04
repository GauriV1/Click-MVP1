import axios from 'axios';

// API Configuration
const config = {
  BASE_URL: '', // calls relative to your own domain
  ENDPOINT: '/api/grok'
};

// Create an axios instance with default configuration
const _grokClient = axios.create({
  baseURL: config.BASE_URL,
  headers: {
    'Content-Type': 'application/json'
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

const _validateResponse = (response) => {
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
  let _lastError = null;
  
  while (attempt < MAX_RETRIES) {
    try {
      const requestPayload = {
        messages: [
          {
            role: "system",
            content: systemPrompt
          },
          {
            role: "user",
            content: question
          }
        ]
      };
      
      console.log("🛫 getAIAdvice sending to /api/grok:", JSON.stringify(requestPayload));
      
      const response = await axios({
        method: 'post',
        url: `${config.BASE_URL}${config.ENDPOINT}`,
        headers: {
          'Content-Type': 'application/json'
        },
        data: requestPayload,
        timeout: 60000
      });

      console.log("⬇️ getAIAdvice got raw response:", response);

      // If the API returns an error, return it directly
      if (response.data && response.data.error) {
        return { error: response.data.error };
      }

      if (!response.data?.choices?.[0]?.message?.content) {
        throw new Error('Invalid API response structure');
      }

      const content = response.data.choices[0].message.content.trim();

      return {
        advice: content,
        metadata: {
          timestamp: new Date().toISOString(),
          attempt: attempt + 1
        }
      };

    } catch (error) {
      _lastError = error;
      attempt++;
      
      if (attempt < MAX_RETRIES) {
        await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
        continue;
      }

      // Extract error message from the response
      const errorMessage =
        error.response?.data?.error ||
        error.response?.data?.message ||
        error.message ||
        JSON.stringify(error);
      console.error('AI Advisor error (response?):', errorMessage);
      throw new Error(errorMessage);
    }
  }
}

/**
 * Sends a single-message chat to Grok via /api/grok and returns the AI's reply.
 */
export async function getAIAdvice(userQuestion) {
  // Build the conversation array for Grok:
  const messages = [
    { role: "system", content: "You are an AI investment advisor. Provide clear, concise advice." },
    { role: "user", content: userQuestion },
  ];

  try {
    // Log the outgoing request
    console.log("🛫 getAIAdvice sending to /api/grok:", messages);

    // Call our serverless proxy
    const response = await axios.post("/api/grok", { messages: messages });
    console.log("⬇️ getAIAdvice got raw response:", response.data);

    // Validate structure and return only the content text
    if (
      response.data &&
      Array.isArray(response.data.choices) &&
      response.data.choices[0] &&
      response.data.choices[0].message
    ) {
      return response.data.choices[0].message.content;
    } else {
      throw new Error("Invalid Grok response: " + JSON.stringify(response.data));
    }
  } catch (error) {
    console.error("aiAdvisorService.getAIAdvice – error:", error.response?.data || error.message);
    throw error;
  }
} 