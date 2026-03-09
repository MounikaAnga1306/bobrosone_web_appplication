// src/modules/hotels/hooks/useHotelSearch.js
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useHotelSearch as useHotelSearchContext } from '../context/HotelSearchContext'; // CHANGED: Renamed import
import { searchHotels } from '../services/hotelSearchService';

export const useHotelSearch = () => { // This is the hook name
  const navigate = useNavigate();
  const {
    searchParams,
    updateSearchParams,
    updateHotels,
    updateLoading,
    updateError,
    resetSearch,
  } = useHotelSearchContext(); // CHANGED: Using renamed import

  const [localLoading, setLocalLoading] = useState(false);

  /**
   * Execute hotel search with given parameters
   * @param {Object} params - Search parameters
   */
  const executeSearch = async (params) => {
    setLocalLoading(true);
    updateLoading(true);
    updateError(null);

    try {
      // Update search params in context
      updateSearchParams(params);

      // Call API
      const result = await searchHotels(params);

      if (result.success) {
        updateHotels(result.hotels);
        
        // Navigate to results page with search params
        navigate('/hotels/results', {
          state: { searchParams: params }
        });
      } else {
        updateError(result.error);
      }
    } catch (error) {
      updateError(error.message || 'Search failed');
    } finally {
      setLocalLoading(false);
      updateLoading(false);
    }
  };

  /**
   * Retry last search
   */
  const retrySearch = async () => {
    if (searchParams) {
      await executeSearch(searchParams);
    }
  };

  /**
   * Clear search results
   */
  const clearSearch = () => {
    resetSearch();
  };

  return {
    executeSearch,
    retrySearch,
    clearSearch,
    loading: localLoading,
  };
};