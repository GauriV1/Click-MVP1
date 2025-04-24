import axios from 'axios';

const { STOCK_LIST } = require('../components/MarketViews/data/stockData');
const { ETF_LIST } = require('../components/MarketViews/data/etfData');
const { BOND_LIST } = require('../components/MarketViews/data/bondData');
const { setCachedData, getCachedData } = require('../components/MarketViews/utils/marketCache');

// API Configuration
const API_TOKEN = process.env.REACT_APP_FINNHUB_API_KEY;
const API_BASE_URL = 'https://finnhub.io/api/v1';

// Validate API key
if (!API_TOKEN) {
  console.error('Missing Finnhub API key. Please set REACT_APP_FINNHUB_API_KEY environment variable.');
  throw new Error('Missing REACT_APP_FINNHUB_API_KEY environment variable');
}

// Check for demo mode
if (!process.env.REACT_APP_FINNHUB_API_KEY) {
  console.warn('[MarketDataLoader] Using default API token. Please set REACT_APP_FINNHUB_API_KEY environment variable for production use.');
}

// Market timing constants
const MARKET_OPEN_HOUR = 9;
const MARKET_OPEN_MINUTE = 30;
const MARKET_CLOSE_HOUR = 16;
const MARKET_CLOSE_MINUTE = 0;

// Create an event emitter for market data loading state
const marketDataEvents = new EventTarget();
const MARKET_DATA_READY = 'marketDataReady';
const MARKET_DATA_LOADING = 'marketDataLoading';
const MARKET_DATA_ERROR = 'marketDataError';

// Debug logging
const debug = (message, ...args) => {
  console.log(`[MarketDataLoader] ${message}`, ...args);
};

// Export functions to subscribe to market data events
const onMarketDataReady = (callback) => {
  const handler = (event) => callback(event.detail);
  marketDataEvents.addEventListener(MARKET_DATA_READY, handler);
  return () => marketDataEvents.removeEventListener(MARKET_DATA_READY, handler);
};

const onMarketDataLoading = (callback) => {
  const handler = (event) => callback();
  marketDataEvents.addEventListener(MARKET_DATA_LOADING, handler);
  return () => marketDataEvents.removeEventListener(MARKET_DATA_LOADING, handler);
};

const onMarketDataError = (callback) => {
  const handler = (event) => callback(event.detail);
  marketDataEvents.addEventListener(MARKET_DATA_ERROR, handler);
  return () => marketDataEvents.removeEventListener(MARKET_DATA_ERROR, handler);
};

// Utility function to check if it's a weekend
const isWeekend = (date) => {
  const day = date.getDay();
  return day === 0 || day === 6;
};

// Utility function to get next market open time
const getNextMarketOpen = () => {
  const now = new Date();
  const nextOpen = new Date(now);
  
  nextOpen.setHours(MARKET_OPEN_HOUR, MARKET_OPEN_MINUTE, 0, 0);
  
  // If it's past market open today, move to tomorrow
  if (now > nextOpen) {
    nextOpen.setDate(nextOpen.getDate() + 1);
  }
  
  // If it's weekend, move to Monday
  while (isWeekend(nextOpen)) {
    nextOpen.setDate(nextOpen.getDate() + 1);
  }
  
  return nextOpen;
};

// Utility function to get next market close time
const getNextMarketClose = () => {
  const now = new Date();
  const nextClose = new Date(now);
  
  nextClose.setHours(MARKET_CLOSE_HOUR, MARKET_CLOSE_MINUTE, 0, 0);
  
  // If it's past market close today, move to tomorrow
  if (now > nextClose) {
    nextClose.setDate(nextClose.getDate() + 1);
  }
  
  // If it's weekend, move to Monday
  while (isWeekend(nextClose)) {
    nextClose.setDate(nextClose.getDate() + 1);
  }
  
  return nextClose;
};

// Rate limiting constants
const RATE_LIMIT_PER_MINUTE = 30; // Reduced from 60 to be more conservative
const BATCH_SIZE = 3; // Reduced from 5 to be more conservative
const RETRY_DELAY = 2000; // 2 seconds between retries
const MAX_RETRIES = 3;

// Rate limiting state
let lastRequestTime = 0;
let requestCount = 0;

// Utility function to wait for rate limit
const waitForRateLimit = async () => {
  const now = Date.now();
  const timeSinceLastRequest = now - lastRequestTime;
  const minTimeBetweenRequests = (60 * 1000) / RATE_LIMIT_PER_MINUTE;
  
  if (timeSinceLastRequest < minTimeBetweenRequests) {
    const waitTime = minTimeBetweenRequests - timeSinceLastRequest;
    await new Promise(resolve => setTimeout(resolve, waitTime));
  }
  
  lastRequestTime = Date.now();
};

// Function to fetch data for a single symbol with retries
const fetchSymbolData = async (symbol, retryCount = 0) => {
  if (!API_TOKEN) {
    throw new Error('API token not found. Please set REACT_APP_FINNHUB_API_KEY in your environment.');
  }

  debug(`Fetching data for ${symbol}`);
  
  try {
    await waitForRateLimit();
    
    const response = await fetch(
      `${API_BASE_URL}/quote?symbol=${symbol}&token=${API_TOKEN}`
    );
    
    if (response.status === 429) {
      if (retryCount < MAX_RETRIES) {
        debug(`Rate limit hit for ${symbol}, retrying in ${RETRY_DELAY}ms...`);
        await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
        return fetchSymbolData(symbol, retryCount + 1);
      }
      throw new Error(`Rate limit exceeded for ${symbol} after ${MAX_RETRIES} retries`);
    }
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    
    // Validate data format
    if (!data || typeof data.c === 'undefined') {
      throw new Error('Invalid data format received');
    }
    
    // Add timestamp and update type
    const now = new Date();
    const isOpenUpdate = now.getHours() === MARKET_OPEN_HOUR && now.getMinutes() >= MARKET_OPEN_MINUTE;
    data.timestamp = now.toISOString();
    data.updateType = isOpenUpdate ? 'market_open' : 'market_close';
    
    debug(`Successfully fetched data for ${symbol}`);
    return data;
  } catch (error) {
    debug(`Attempt ${retryCount}/${MAX_RETRIES} failed for ${symbol}:`, error);
    if (retryCount < MAX_RETRIES) {
      debug(`Retrying ${symbol} in ${RETRY_DELAY}ms...`);
      await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
      return fetchSymbolData(symbol, retryCount + 1);
    }
    throw error;
  }
};

// Market data state tracking
let lastLoadTime = null;
let lastLoadType = null; // 'open' or 'close'
let isInitialLoad = true;

// Function to check if we need to reload data
const shouldReloadData = () => {
  const now = new Date();
  
  // Always reload on initial load
  if (isInitialLoad) {
    return true;
  }
  
  // If no last load time, we should reload
  if (!lastLoadTime) {
    return true;
  }
  
  const currentHour = now.getHours();
  const currentMinute = now.getMinutes();
  
  // Check if we're at market open time and haven't loaded open data
  const isMarketOpenTime = currentHour === MARKET_OPEN_HOUR && currentMinute >= MARKET_OPEN_MINUTE;
  if (isMarketOpenTime && lastLoadType !== 'open') {
    return true;
  }
  
  // Check if we're at market close time and haven't loaded close data
  const isMarketCloseTime = currentHour === MARKET_CLOSE_HOUR && currentMinute >= MARKET_CLOSE_MINUTE;
  if (isMarketCloseTime && lastLoadType !== 'close') {
    return true;
  }
  
  return false;
};

// Enhanced load function with persistence checks
const loadAllMarketData = async (forceReload = false) => {
  debug('Starting market data load check');
  
  const now = new Date();
  const currentHour = now.getHours();
  const currentMinute = now.getMinutes();
  
  // Determine if this is a market open or close update
  const isOpenUpdate = currentHour === MARKET_OPEN_HOUR && currentMinute >= MARKET_OPEN_MINUTE;
  const isCloseUpdate = currentHour === MARKET_CLOSE_HOUR && currentMinute >= MARKET_CLOSE_MINUTE;
  
  // Check if we need to reload
  if (!forceReload && !shouldReloadData()) {
    debug('Using existing market data, no reload needed');
    const cachedDetail = {
      total: STOCK_LIST.length + ETF_LIST.length + BOND_LIST.length,
      loaded: STOCK_LIST.length + ETF_LIST.length + BOND_LIST.length,
      failed: 0,
      timestamp: lastLoadTime?.toISOString(),
      updateType: lastLoadType || 'cached',
      stocks: STOCK_LIST.length,
      etfs: ETF_LIST.length,
      bonds: BOND_LIST.length,
      cached: true
    };
    marketDataEvents.dispatchEvent(new CustomEvent(MARKET_DATA_READY, { detail: cachedDetail }));
    return { successCount: cachedDetail.loaded, failureCount: 0, cached: true };
  }
  
  debug('Loading fresh market data');
  marketDataEvents.dispatchEvent(new CustomEvent(MARKET_DATA_LOADING));
  
  const allSymbols = [
    ...STOCK_LIST.map(s => ({ symbol: s.symbol, type: 'stock' })),
    ...ETF_LIST.map(s => ({ symbol: s.symbol, type: 'etf' })),
    ...BOND_LIST.map(s => ({ symbol: s.symbol, type: 'bond' }))
  ];
  
  debug(`Processing ${allSymbols.length} symbols at ${now.toLocaleTimeString()}`);
  
  let successCount = 0;
  let failureCount = 0;
  let retryQueue = [];
  
  try {
    // Process in batches with retry queue
    for (let i = 0; i < allSymbols.length; i += BATCH_SIZE) {
      const batch = allSymbols.slice(i, i + BATCH_SIZE);
      const batchNumber = Math.floor(i/BATCH_SIZE) + 1;
      const totalBatches = Math.ceil(allSymbols.length/BATCH_SIZE);
      debug(`Processing batch ${batchNumber}/${totalBatches} at ${new Date().toLocaleTimeString()}`);
      
      try {
        const results = await Promise.all(
          batch.map(async ({ symbol, type }) => {
            try {
              const data = await fetchSymbolData(symbol);
              const cachedData = {
                ...data,
                loadType: isOpenUpdate ? 'open' : 'close',
                loadTime: now.toISOString(),
                symbol,
                type
              };
              setCachedData(symbol, cachedData);
              successCount++;
              
              // Emit individual symbol update
              marketDataEvents.dispatchEvent(new CustomEvent('symbolUpdate', { 
                detail: { symbol, type, data: cachedData, success: true }
              }));
              
              return { symbol, type, success: true };
            } catch (error) {
              retryQueue.push({ symbol, type });
              failureCount++;
              
              // Emit individual symbol error
              marketDataEvents.dispatchEvent(new CustomEvent('symbolError', { 
                detail: { symbol, type, error: error.message }
              }));
              
              return { symbol, type, success: false, error };
            }
          })
        );
        
        // Emit batch progress
        marketDataEvents.dispatchEvent(new CustomEvent('batchProgress', { 
          detail: {
            batchNumber,
            totalBatches,
            successCount,
            failureCount,
            timestamp: new Date().toISOString()
          }
        }));
        
        results.forEach(({ symbol, type, success, error }) => {
          if (success) {
            debug(`✓ ${symbol} (${type}) loaded successfully`);
          } else {
            debug(`✗ ${symbol} (${type}) failed:`, error);
          }
        });
        
        // Add a longer delay between batches
        if (i + BATCH_SIZE < allSymbols.length) {
          const batchDelay = RETRY_DELAY * BATCH_SIZE; // Double the delay between batches
          debug(`Waiting ${batchDelay}ms before next batch...`);
          await new Promise(resolve => setTimeout(resolve, batchDelay));
        }
      } catch (error) {
        debug(`