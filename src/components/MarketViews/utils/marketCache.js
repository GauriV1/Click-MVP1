// In-memory cache for market data
const marketDataCache = new Map();

/**
 * Set data for a symbol in the cache
 * @param {string} symbol - The stock/ETF/bond symbol
 * @param {Object} data - The data to cache
 */
export const setCachedData = (symbol, data) => {
  if (!symbol) return;
  marketDataCache.set(symbol, {
    ...data,
    timestamp: new Date().toISOString()
  });
};

/**
 * Get cached data for a symbol
 * @param {string} symbol - The stock/ETF/bond symbol
 * @returns {Object|null} The cached data or null if not found
 */
export const getCachedData = (symbol) => {
  if (!symbol) return null;
  return marketDataCache.get(symbol) || null;
};

/**
 * Clear the entire cache
 */
export const clearCache = () => {
  marketDataCache.clear();
};

/**
 * Get all symbols currently in the cache
 * @returns {Array} Array of symbol strings
 */
export const getCachedSymbols = () => {
  return Array.from(marketDataCache.keys());
};

/**
 * Get cache statistics
 * @returns {Object} Object with cache statistics
 */
export const getCacheStats = () => {
  return {
    size: marketDataCache.size,
    symbols: getCachedSymbols(),
    timestamp: new Date().toISOString()
  };
}; 