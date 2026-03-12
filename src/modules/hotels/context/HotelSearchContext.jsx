// src/modules/hotels/contexts/HotelSearchContext.jsx
import React, { createContext, useContext, useState, useCallback } from 'react';

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
  
  // Add state for raw hotel data if needed
  const [rawHotels, setRawHotels] = useState([]);

  const updateSearchParams = useCallback((params) => {
    setSearchParams(params);
  }, []);

  const updateHotels = useCallback((hotelsData) => {
    setHotels(hotelsData);
  }, []);

  // Add function to update raw hotels
  const updateRawHotels = useCallback((rawData) => {
    setRawHotels(rawData);
  }, []);

  const updateLoading = useCallback((isLoading) => {
    setLoading(isLoading);
  }, []);

  const updateError = useCallback((errorMessage) => {
    setError(errorMessage);
  }, []);

  const resetSearch = useCallback(() => {
    setHotels([]);
    setRawHotels([]);
    setError(null);
    setSearchParams(null);
  }, []);

  // Helper function to get check-in and check-out dates
  const getCheckInDate = useCallback(() => {
    return searchParams?.checkinDate || searchParams?.checkIn || null;
  }, [searchParams]);

  const getCheckOutDate = useCallback(() => {
    return searchParams?.checkoutDate || searchParams?.checkOut || null;
  }, [searchParams]);

  // Helper to check if dates are available
  const hasDates = useCallback(() => {
    return !!(getCheckInDate() && getCheckOutDate());
  }, [getCheckInDate, getCheckOutDate]);

  const value = {
    // State
    searchParams,
    hotels,
    rawHotels,
    loading,
    error,
    
    // Setters
    updateSearchParams,
    updateHotels,
    updateRawHotels,
    updateLoading,
    updateError,
    resetSearch,
    
    // Direct setters (for compatibility with our earlier changes)
    setSearchParams: updateSearchParams,
    setHotels: updateHotels,
    setLoading: updateLoading,
    setError: updateError,
    
    // Helper functions
    getCheckInDate,
    getCheckOutDate,
    hasDates,
    
    // Derived values
    checkInDate: getCheckInDate(),
    checkOutDate: getCheckOutDate(),
  };

  return (
    <HotelSearchContext.Provider value={value}>
      {children}
    </HotelSearchContext.Provider>
  );
};