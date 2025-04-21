import axios from 'axios';

const FINNHUB_API_KEY = process.env.REACT_APP_FINNHUB_API_KEY;

if (!FINNHUB_API_KEY) {
  console.error('Missing Finnhub API key. Please set REACT_APP_FINNHUB_API_KEY environment variable.');
}

// Finnhub API configuration
const FINNHUB_BASE_URL = 'https://finnhub.io/api/v1';

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
    'GOVT', 'BIL', 'SHV', 'SPTL', 'SPTS',
    'SPTL', 'SPTS', 'SPTL', 'SPTS', 'SPTL'
  ]
};

/**
 * Fetches real-time stock data from Finnhub
 * @param {string} symbol - Stock symbol (e.g., 'AAPL', 'GOOGL')
 * @returns {Promise<Object>} Stock data
 */
export const getStockData = async (symbol) => {
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

    return processedData;
  } catch (error) {
    console.error(`Error fetching data for ${symbol}:`, error);
    throw error;
  }
};

/**
 * Fetches data for multiple stocks
 * @param {string[]} symbols - Array of stock symbols
 * @returns {Promise<Object[]>} Array of stock data
 */
export const getMultipleStockData = async (symbols) => {
  const results = [];
  for (const symbol of symbols) {
    try {
      const data = await getStockData(symbol);
      results.push({ ...data, symbol });
    } catch (error) {
      console.error(`Failed to fetch ${symbol}:`, error);
      results.push({ symbol, error: error.message });
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
  if (!rawData || !rawData.c) {
    throw new Error('Invalid data received from Finnhub');
  }

  return {
    symbol: symbol,
    price: rawData.c,
    change: rawData.d,
    changePercent: rawData.dp,
    volume: rawData.v,
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
  // Finnhub provides WebSocket API
  const socket = new WebSocket(`wss://ws.finnhub.io?token=${FINNHUB_API_KEY}`);

  socket.onopen = () => {
    socket.send(JSON.stringify({ type: 'subscribe', symbol: symbol }));
  };

  socket.onmessage = (event) => {
    const data = JSON.parse(event.data);
    if (data.type === 'trade') {
      const processedData = {
        symbol: symbol,
        price: data.data[0].p,
        change: data.data[0].p - stockCache.get(symbol)?.data?.price || 0,
        changePercent: ((data.data[0].p - (stockCache.get(symbol)?.data?.price || 0)) / (stockCache.get(symbol)?.data?.price || 1)) * 100,
        volume: data.data[0].v,
        timestamp: Date.now()
      };
      callback(processedData);
    }
  };

  return () => {
    socket.close();
  };
};

/**
 * Stops real-time updates for a symbol
 * @param {string} symbol - Stock symbol
 */
export const stopRealTimeUpdates = (symbol) => {
  // The cleanup is handled by the WebSocket close in startRealTimeUpdates
  console.log(`Stopping real-time updates for ${symbol}`);
}; 