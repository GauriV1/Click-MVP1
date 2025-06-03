export default async function handler(req, res) {
  console.log("🔍 /api/grok called with body:", JSON.stringify(req.body));

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { messages } = req.body;

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: 'Invalid request: messages array is required' });
    }

    const response = await fetch("https://xai.grok.ai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.GROK_API_KEY}`,
      },
      body: JSON.stringify({
        model: "grok-3-mini-beta",
        messages,
        temperature: 0.7,
        max_tokens: 500,
      }),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      console.error("🛑 xAI/Grok error response:", response.status, errorBody);
      return res.status(response.status).json({ error: errorBody });
    }

    const data = await response.json();
    console.log("✅ /api/grok got response:", JSON.stringify(data));
    return res.status(200).json(data);
  } catch (error) {
    console.error("Error in Grok API route:", error);
    return res.status(500).json({ error: 'Internal server error' });
  }
} 