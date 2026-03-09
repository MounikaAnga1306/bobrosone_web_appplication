// src/modules/hotels/contexts/HotelSearchContext.jsx
import React, { createContext, useContext, useState } from 'react';

const HotelSearchContext = createContext();

export const useHotelSearch = () => {
  const context = useContext(HotelSearchContext);
  if (!context) {
    throw new Error('useHotelSearch must be used within HotelSearchProvider');
  }
  return context;
};

export const HotelSearchProvider = ({ children }) => {
  const [searchParams, setSearchParams] = useState(null);
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const updateSearchParams = (params) => {
    setSearchParams(params);
  };

  const updateHotels = (hotelsData) => {
    setHotels(hotelsData);
  };

  const updateLoading = (isLoading) => {
    setLoading(isLoading);
  };

  const updateError = (errorMessage) => {
    setError(errorMessage);
  };

  const resetSearch = () => {
    setHotels([]);
    setError(null);
    setSearchParams(null);
  };

  const value = {
    searchParams,
    hotels,
    loading,
    error,
    updateSearchParams,
    updateHotels,
    updateLoading,
    updateError,
    resetSearch,
  };

  return (
    <HotelSearchContext.Provider value={value}>
      {children}
    </HotelSearchContext.Provider>
  );
};