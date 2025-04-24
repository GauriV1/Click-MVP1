import axios from 'axios';

// API Configuration
const FINNHUB_API_KEY = process.env.FINHUB_API_KEY;

// Validate API key
if (!FINNHUB_API_KEY) {
  console.error('Missing Finnhub API key. Please set FINHUB_API_KEY environment variable.');
  throw new Error('API key not found');
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
    'GOVT', 'BIL', 'SHV', 'SPTL', 'SPTS'
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

    console.log(`Fetching data for ${symbol} from Finnhub...`);
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
 * Stops real-time updates for a symbol
 * @param {string} symbol - Stock symbol
 */
export const stopRealTimeUpdates = (symbol) => {
  console.log(`Stopping real-time updates for ${symbol}`);
}; 