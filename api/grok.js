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

    console.log('Making request to Grok API with payload:', {
      model: req.body.model,
      messages: req.body.messages.length
    });

    const apiRes = await axios.post(
      'https://api.x.ai/v1/chat/completions',
      req.body,
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${API_KEY}`
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
    // Log the full error for debugging
    console.error('Grok API error:', {
      message: err.message,
      response: err.response?.data,
      status: err.response?.status,
      stack: err.stack
    });

    // Handle specific error cases
    if (err.response?.status === 401) {
      return res.status(401).json({ 
        error: 'Authentication error with AI service',
        message: err.response?.data?.error || 'Invalid API key'
      });
    }

    if (err.response?.status === 429) {
      return res.status(429).json({ 
        error: 'Rate limit exceeded',
        message: 'Please try again later'
      });
    }

    if (err.code === 'ECONNABORTED') {
      return res.status(504).json({ 
        error: 'Request timeout',
        message: 'The request took too long to complete. Please try again.'
      });
    }

    // For all other errors
    return res.status(500).json({
      error: 'AI service error',
      message: err.response?.data?.error || err.message || 'An unexpected error occurred'
    });
  }
} 