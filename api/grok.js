// /api/grok.js
import axios from 'axios';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const API_KEY = process.env.GROK_API_KEY;
  if (!API_KEY) {
    console.error('GROK_API_KEY is not set');
    return res.status(500).json({ error: 'Server configuration error' });
  }

  try {
    if (!req.body || !req.body.messages) {
      return res.status(400).json({ error: 'Invalid request body' });
    }

    const apiRes = await axios.post(
      'https://api.x.ai/v1/chat/completions',
      req.body,
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${API_KEY}`
        },
        timeout: 30000
      }
    );

    if (!apiRes.data || !apiRes.data.choices) {
      console.error('Invalid response from Grok API:', apiRes.data);
      return res.status(500).json({ error: 'Invalid response from AI service' });
    }

    return res.status(200).json(apiRes.data);
  } catch (err) {
    console.error('Grok API error:', {
      message: err.message,
      response: err.response?.data,
      status: err.response?.status
    });

    // Handle specific error cases
    if (err.response?.status === 401) {
      return res.status(500).json({ error: 'Authentication error with AI service' });
    }
    if (err.response?.status === 429) {
      return res.status(429).json({ error: 'Rate limit exceeded. Please try again later.' });
    }
    if (err.code === 'ECONNABORTED') {
      return res.status(504).json({ error: 'Request timeout. Please try again.' });
    }

    return res.status(err.response?.status || 500).json({
      error: 'An error occurred while processing your request',
      details: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
} 