import express from 'express';
import axios from 'axios';

const router = express.Router();

// Proxy endpoint for Grok API
router.post('/grok', async (req, res) => {
  const API_KEY = process.env.GROK_API_KEY; // Note: not REACT_APP_
  
  if (!API_KEY) {
    return res.status(500).json({ error: 'Missing API key' });
  }

  try {
    const grokRes = await axios.post(
      'https://api.x.ai/v1/chat/completions',
      req.body,
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${API_KEY}`
        }
      }
    );
    return res.status(200).json(grokRes.data);
  } catch (err) {
    console.error('Grok API proxy error:', err.message);
    return res
      .status(err.response?.status || 500)
      .json({ 
        error: err.message, 
        details: err.response?.data 
      });
  }
});

export default router; 