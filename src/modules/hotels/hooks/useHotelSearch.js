// src/modules/hotels/hooks/useHotelSearch.js
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useHotelSearch as useHotelSearchContext } from '../context/HotelSearchContext';
import { searchHotels } from '../services/hotelSearchService';
import { mapHotelSearchResults } from '../utils/hotelMapper';

export const useHotelSearch = () => {
  const navigate = useNavigate();
  const {
    searchParams,
    updateSearchParams,
    updateHotels,
    updateLoading,
    updateError,
    resetSearch,
  } = useHotelSearchContext();

  const [localLoading, setLocalLoading] = useState(false);

  const executeSearch = async (params) => {
    setLocalLoading(true);
    updateLoading(true);
    updateError(null);

    try {
      updateSearchParams(params);
      
      const result = await searchHotels(params);
      
      if (result.success) {
        const mappedHotels = mapHotelSearchResults(result.hotels);
        updateHotels(mappedHotels);
        
        navigate('/hotels/results', {
          state: { searchParams: params }
        });
        
        return {
          success: true,
          hotels: mappedHotels,
          totalCount: result.totalCount
        };
      } else {
        updateError(result.error);
        return {
          success: false,
          error: result.error
        };
      }
    } catch (error) {
      updateError(error.message);
      return {
        success: false,
        error: error.message
      };
    } finally {
      setLocalLoading(false);
      updateLoading(false);
    }
  };

  const executeSearchWithoutNavigation = async (params) => {
    setLocalLoading(true);
    updateLoading(true);
    updateError(null);

    try {
      updateSearchParams(params);
      const result = await searchHotels(params);

      if (result.success) {
        const mappedHotels = mapHotelSearchResults(result.hotels);
        updateHotels(mappedHotels);
        
        return {
          success: true,
          hotels: mappedHotels,
          totalCount: result.totalCount
        };
      } else {
        updateError(result.error);
        return {
          success: false,
          error: result.error
        };
      }
    } catch (error) {
      updateError(error.message);
      return {
        success: false,
        error: error.message
      };
    } finally {
      setLocalLoading(false);
      updateLoading(false);
    }
  };

  const retrySearch = async () => {
    if (searchParams) {
      return await executeSearch(searchParams);
    }
    return null;
  };

  const clearSearch = () => {
    resetSearch();
  };

  return {
    executeSearch,
    executeSearchWithoutNavigation,
    retrySearch,
    clearSearch,
    loading: localLoading,
  };
};