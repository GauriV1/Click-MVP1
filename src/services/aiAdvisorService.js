import axios from "axios";

/**
 * Sends a user question to /api/grok, then returns the AI's text reply.
 */
export async function getAIAdvice(userQuestion) {
  // Build the messages payload for Grok
  const messages = [
    { role: "system", content: "You are an AI investment advisor for Click. Provide clear, concise guidance." },
    { role: "user", content: userQuestion },
  ];

  try {
    console.log("🛫 getAIAdvice sending to /api/grok:", messages);
    const response = await axios.post("/api/grok", { messages: messages });
    console.log("⬇️ getAIAdvice got raw response:", response.data);

    // Validate the shape and return only the content string
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
