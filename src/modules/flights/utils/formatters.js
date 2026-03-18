// src/modules/flights/utils/formatters.js

export const formatTime = (isoString) => {
  if (!isoString) return '--:--';
  try {
    const date = new Date(isoString);
    if (isNaN(date.getTime())) {
      if (typeof isoString === 'string' && isoString.match(/^\d{2}:\d{2}$/)) {
        return isoString;
      }
      return '--:--';
    }
    return date.toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  } catch {
    return '--:--';
  }
};

export const formatDate = (isoString) => {
  if (!isoString) return 'Date not available';
  try {
    const date = new Date(isoString);
    if (isNaN(date.getTime())) {
      if (typeof isoString === 'string') {
        const parts = isoString.split(' ');
        if (parts.length === 3) {
          return isoString;
        }
      }
      return 'Date not available';
    }
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  } catch {
    return 'Date not available';
  }
};

export const formatDuration = (minutes) => {
  if (!minutes && minutes !== 0) return '0h 0m';
  const mins = parseInt(minutes);
  const hours = Math.floor(mins / 60);
  const remainingMins = mins % 60;
  return `${hours}h ${remainingMins}m`;
};

export const formatPrice = (price, currency = 'INR') => {
  if (price === undefined || price === null) return '';
  let numericPrice = price;
  if (typeof price === 'string') {
    const cleaned = price.replace(/[^0-9.]/g, '');
    numericPrice = parseFloat(cleaned);
  }
  if (isNaN(numericPrice)) return '';
  const symbol = currency === 'INR' ? '₹' : '$';
  return `${symbol}${numericPrice.toLocaleString('en-IN')}`;
};