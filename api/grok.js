// /api/grok.js
import axios from 'axios';

export default async function handler(req, res) {
  const API_KEY = process.env.GROK_API_KEY;
  if (!API_KEY) {
    return res.status(500).json({ error: 'Missing GROK_API_KEY' });
  }

  try {
    // forward the entire body to x.ai
    const grokRes = await axios.post(
      'https://api.x.ai/v1/chat/completions',
      req.body,
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${API_KEY}`,
        },
        timeout: 30000,
      }
    );
    return res.status(200).json(grokRes.data);
  } catch (err) {
    console.error('Proxy error:', err.response?.data || err.message);
    return res
      .status(err.response?.status || 500)
      .json({ error: err.message, details: err.response?.data });
  }
} 