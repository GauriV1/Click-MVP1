import axios from 'axios';

// API Configuration
const FINNHUB_API_KEY = process.env.REACT_APP_FINNHUB_API_KEY;
const FINNHUB_BASE_URL = 'https://finnhub.io/api/v1';
const USE_MOCK_DATA = !FINNHUB_API_KEY || FINNHUB_API_KEY === 'your_finnhub_api_key_here';

if (USE_MOCK_DATA) {
  console.info('Using mock market data for demo purposes');
}

// Cache for storing stock data
const stockCache = new Map();

// Rate limiting configuration (Finnhub has a limit of 60 API calls per minute for free tier)
const RATE_LIMIT = {
  maxRequestsPerMinute: 60,
  currentRequests: 0,
  lastReset: Date.now()
};

// Predefined tickers
const TICKERS = {
  stocks: [
    'AAPL', 'MSFT', 'GOOGL', 'AMZN', 'META',
    'TSLA', 'NVDA', 'JPM', 'V', 'WMT',
    'JNJ', 'PG', 'MA', 'HD', 'BAC',
    'DIS', 'NFLX', 'ADBE', 'CSCO', 'PFE'
  ],
  etfs: [
    'SPY', 'QQQ', 'VTI', 'VOO', 'IVV',
    'VEA', 'VWO', 'VUG', 'VYM', 'VNQ',
    'GLD', 'SLV', 'USO', 'TLT', 'IEF',
    'HYG', 'LQD', 'MUB', 'VNQI', 'VGT'
  ],
  bonds: [
    'BND', 'AGG', 'TLT', 'IEF', 'SHY',
    'MUB', 'LQD', 'HYG', 'BWX', 'TIP',
    'GOVT', 'BIL', 'SHV', 'SPTL', 'SPTS'
  ]
};

// Mock data generation
const generateMockStockData = (symbol) => ({
  symbol,
  price: 150 + Math.random() * 10,
  change: (Math.random() * 2 - 1) * 5,
  changePercent: (Math.random() * 2 - 1) * 3,
  volume: Math.floor(Math.random() * 1000000),
  high: 155 + Math.random() * 10,
  low: 145 + Math.random() * 10,
  open: 150 + Math.random() * 10,
  previousClose: 150 + Math.random() * 10,
  timestamp: Date.now()
});

/**
 * Fetches real-time stock data from Finnhub or returns mock data
 * @param {string} symbol - Stock symbol (e.g., 'AAPL', 'GOOGL')
 * @returns {Promise<Object>} Stock data
 */
export const getStockData = async (symbol) => {
  if (USE_MOCK_DATA) {
    return generateMockStockData(symbol);
  }

  try {
    // Check cache first
    const cachedData = stockCache.get(symbol);
    if (cachedData && Date.now() - cachedData.timestamp < 60000) { // 1 minute cache
      return cachedData.data;
    }

    // Check rate limit
    if (!checkRateLimit()) {
      throw new Error('Rate limit exceeded. Please try again later.');
    }

    if (process.env.NODE_ENV === 'development') {
      console.log('Fetching stock data for:', symbol);
    }
    const response = await axios.get(`${FINNHUB_BASE_URL}/quote`, {
      params: {
        symbol: symbol,
        token: FINNHUB_API_KEY
      }
    });
    
    // Process and cache the data
    const processedData = processStockData(response.data, symbol);
    stockCache.set(symbol, {
      data: processedData,
      timestamp: Date.now()
    });

    console.log(`Successfully fetched data for ${symbol}:`, processedData);
    return processedData;
  } catch (error) {
    console.error(`Error fetching data for ${symbol}:`, error);
    if (error.response) {
      console.error('Response data:', error.response.data);
      console.error('Response status:', error.response.status);
    }
    throw error;
  }
};

/**
 * Fetches data for multiple stocks
 * @param {string[]} symbols - Array of stock symbols
 * @returns {Promise<Object[]>} Array of stock data
 */
export const getMultipleStockData = async (symbols) => {
  if (USE_MOCK_DATA) {
    return Promise.all(symbols.map(generateMockStockData));
  }

  console.log('Fetching data for multiple symbols:', symbols);
  const results = [];
  for (const symbol of symbols) {
    try {
      const data = await getStockData(symbol);
      results.push({ ...data, symbol });
    } catch (error) {
      console.error(`Failed to fetch ${symbol}:`, error);
      results.push({ 
        symbol, 
        error: error.message,
        price: null,
        change: null,
        changePercent: null,
        volume: null,
        timestamp: Date.now()
      });
    }
  }
  return results;
};

/**
 * Gets all tickers by category
 * @returns {Object} Object containing arrays of tickers by category
 */
export const getAllTickers = () => TICKERS;

/**
 * Processes raw stock data from Finnhub
 * @param {Object} rawData - Raw data from Finnhub
 * @param {string} symbol - Stock symbol
 * @returns {Object} Processed stock data
 */
const processStockData = (rawData, symbol) => {
  if (!rawData || typeof rawData.c === 'undefined') {
    throw new Error('Invalid data received from Finnhub');
  }

  return {
    symbol: symbol,
    price: rawData.c || null,
    change: rawData.d || null,
    changePercent: rawData.dp || null,
    volume: rawData.v || null,
    high: rawData.h || null,
    low: rawData.l || null,
    open: rawData.o || null,
    previousClose: rawData.pc || null,
    timestamp: Date.now()
  };
};

/**
 * Checks if we can make a new request based on rate limits
 * @returns {boolean} Whether a new request can be made
 */
const checkRateLimit = () => {
  const now = Date.now();
  if (now - RATE_LIMIT.lastReset >= 60000) {
    RATE_LIMIT.currentRequests = 0;
    RATE_LIMIT.lastReset = now;
  }

  if (RATE_LIMIT.currentRequests >= RATE_LIMIT.maxRequestsPerMinute) {
    return false;
  }

  RATE_LIMIT.currentRequests++;
  return true;
};

/**
 * Starts a WebSocket connection for real-time updates
 * @param {string} symbol - Stock symbol
 * @param {Function} callback - Callback function for updates
 */
export const startRealTimeUpdates = (symbol, callback) => {
  if (USE_MOCK_DATA) {
    console.log('Real-time updates not available in fallback mode');
    return;
  }
  console.log(`Starting real-time updates for ${symbol}`);
  const socket = new WebSocket(`wss://ws.finnhub.io?token=${FINNHUB_API_KEY}`);

  socket.onopen = () => {
    console.log(`WebSocket connected for ${symbol}`);
    socket.send(JSON.stringify({ type: 'subscribe', symbol: symbol }));
  };

  socket.onerror = (error) => {
    console.error(`WebSocket error for ${symbol}:`, error);
  };

  socket.onclose = () => {
    console.log(`WebSocket closed for ${symbol}`);
  };

  socket.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data);
      if (data.type === 'trade') {
        const lastPrice = stockCache.get(symbol)?.data?.price;
        const currentPrice = data.data[0].p;
        
        const processedData = {
          symbol: symbol,
          price: currentPrice,
          change: currentPrice - (lastPrice || currentPrice),
          changePercent: lastPrice ? ((currentPrice - lastPrice) / lastPrice) * 100 : 0,
          volume: data.data[0].v,
          timestamp: Date.now()
        };
        
        callback(processedData);
      }
    } catch (error) {
      console.error(`Error processing WebSocket message for ${symbol}:`, error);
    }
  };

  return () => {
    console.log(`Cleaning up WebSocket for ${symbol}`);
    socket.close();
  };
};

/**
 * Stops the WebSocket connection for real-time updates
 * @param {string} symbol - Stock symbol
 */
export const stopRealTimeUpdates = (symbol) => {
  if (USE_MOCK_DATA) {
    console.log('Real-time updates not available in fallback mode');
    return;
  }
  console.log(`Stopping real-time updates for ${symbol}`);
}; 