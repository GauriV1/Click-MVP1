/**
 * Format a price value with appropriate decimal places and currency symbol
 * @param {number} price - The price to format
 * @returns {string} Formatted price string
 */
export const formatPrice = (price) => {
  if (price === undefined || price === null) return 'N/A';
  
  // For prices under $1, show more decimal places
  if (price < 1) {
    return `$${price.toFixed(4)}`;
  }
  
  // For prices under $10, show 2 decimal places
  if (price < 10) {
    return `$${price.toFixed(2)}`;
  }
  
  // For prices $10 and above, show 2 decimal places
  return `$${price.toFixed(2)}`;
};

/**
 * Format a price change value with appropriate sign
 * @param {number} change - The price change to format
 * @returns {string} Formatted change string
 */
export const formatChange = (change) => {
  if (change === undefined || change === null) return 'N/A';
  
  const isPositive = change > 0;
  const absChange = Math.abs(change);
  
  // Format with appropriate sign
  return isPositive 
    ? `+$${absChange.toFixed(2)}` 
    : `-$${absChange.toFixed(2)}`;
};

/**
 * Format a price change value with appropriate sign and color
 * @param {number} change - The price change to format
 * @returns {Object} Object with formatted text and CSS class
 */
export const formatChangeWithClass = (change) => {
  if (change === undefined || change === null) return { text: 'N/A', className: 'neutral' };
  
  const isPositive = change > 0;
  const isNegative = change < 0;
  const absChange = Math.abs(change);
  
  // Format with appropriate sign
  const formattedChange = isPositive 
    ? `+$${absChange.toFixed(2)}` 
    : `-$${absChange.toFixed(2)}`;
  
  // Determine CSS class based on change direction
  const className = isPositive ? 'positive' : isNegative ? 'negative' : 'neutral';
  
  return { text: formattedChange, className };
};

/**
 * Format a percentage change value with appropriate sign and color
 * @param {number} percentChange - The percentage change to format
 * @returns {Object} Object with formatted text and CSS class
 */
export const formatPercentChange = (percentChange) => {
  if (percentChange === undefined || percentChange === null) return { text: 'N/A', className: 'neutral' };
  
  const isPositive = percentChange > 0;
  const isNegative = percentChange < 0;
  const absChange = Math.abs(percentChange);
  
  // Format with appropriate sign and percentage symbol
  const formattedChange = isPositive 
    ? `+${absChange.toFixed(2)}%` 
    : `-${absChange.toFixed(2)}%`;
  
  // Determine CSS class based on change direction
  const className = isPositive ? 'positive' : isNegative ? 'negative' : 'neutral';
  
  return { text: formattedChange, className };
};

/**
 * Format a volume value with appropriate abbreviation (K, M, B)
 * @param {number} volume - The volume to format
 * @returns {string} Formatted volume string
 */
export const formatVolume = (volume) => {
  if (volume === undefined || volume === null) return 'N/A';
  
  // Format large numbers with abbreviations
  if (volume >= 1e9) {
    return `${(volume / 1e9).toFixed(2)}B`;
  } else if (volume >= 1e6) {
    return `${(volume / 1e6).toFixed(2)}M`;
  } else if (volume >= 1e3) {
    return `${(volume / 1e3).toFixed(2)}K`;
  } else {
    return volume.toString();
  }
}; 