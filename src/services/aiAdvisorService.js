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