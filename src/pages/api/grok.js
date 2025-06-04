export default async function handler(req, res) {
  console.log("🔍 /api/grok called with body:", JSON.stringify(req.body));
  const { messages } = req.body;

  try {
    const response = await fetch("https://xai.grok.ai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.GROK_API_KEY}`,
      },
      body: JSON.stringify({
        model: "grok-3-mini-fast",
        messages: messages,
        temperature: 0.7,
        max_tokens: 500,
      }),
    });

    if (!response.ok) {
      const text = await response.text();
      console.error("🛑 Grok API error (status " + response.status + "):", text);
      return res.status(response.status).json({ error: text });
    }

    const data = await response.json();
    console.log("✅ /api/grok got response:", JSON.stringify(data));
    return res.status(200).json(data);
  } catch (error) {
    console.error("Error in /api/grok:", error);
    return res.status(500).json({ error: "Server error" });
  }
} 