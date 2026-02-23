// src/modules/flights/services/airportSearchService.js
import axios from 'axios';

// Direct base URL - no environment variables
const API_BASE_URL = 'https://api.bobros.org';

// Cache implementation
const cache = new Map();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

/**
 * Search for airports by name or code
 * @param {string} searchTerm - The search term (min 3 characters)
 * @returns {Promise<Array>} - Array of airport objects
 */
export const searchAirports = async (searchTerm) => {
  if (!searchTerm || searchTerm.length < 3) {
    return [];
  }

  try {
    const response = await axios.get(`${API_BASE_URL}/flights/autocomplete`, {
      params: {
        name: searchTerm
      },
      timeout: 10000 // 10 second timeout
    });

    // Transform the response to match our expected format
    return response.data.map(airport => ({
      location_code: airport.location_code,
      name: airport.name
    }));
  } catch (error) {
    console.error('Airport search failed:', error);
    
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      throw new Error(error.response.data?.message || 'Server error');
    } else if (error.request) {
      // The request was made but no response was received
      throw new Error('No response from server. Please check your internet connection.');
    } else {
      // Something happened in setting up the request that triggered an Error
      throw new Error('Failed to search airports. Please try again.');
    }
  }
};

/**
 * Search for airports with caching support
 * @param {string} searchTerm - The search term
 * @returns {Promise<Array>} - Array of airport objects
 */
export const searchAirportsWithCache = async (searchTerm) => {
  if (!searchTerm || searchTerm.length < 3) {
    return [];
  }

  const cacheKey = searchTerm.toLowerCase();
  const cached = cache.get(cacheKey);

  // Return cached data if it's still valid
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data;
  }

  try {
    const results = await searchAirports(searchTerm);
    
    // Store in cache
    cache.set(cacheKey, {
      data: results,
      timestamp: Date.now()
    });

    return results;
  } catch (error) {
    throw error;
  }
};

// Optional: Clear cache utility
export const clearAirportCache = () => {
  cache.clear();
};