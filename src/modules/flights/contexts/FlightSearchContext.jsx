// src/modules/flights/contexts/flightSearchContext.js
import React, { createContext, useState, useContext, useCallback } from 'react';

const FlightSearchContext = createContext();

export const FlightSearchProvider = ({ children }) => {
  // Store search parameters
  const [searchParams, setSearchParams] = useState({
    origin: 'BOM - Mumbai',
    destination: 'HYD - Hyderabad',
    departureDate: new Date(),
    returnDate: null,
    travellers: {
      adults: 1,
      children: 0,
      infants: 0,
      class: 'Economy'
    },
    specialFares: {
      student: false,
      seniorCitizen: false,
      armedForces: false
    }
  });

  // Store flight results from API
  const [flightResults, setFlightResults] = useState({
    flights: [],
    rawFlights: [],
    count: 0,
    loading: false,
    error: null
  });

  // Function to update search parameters
  const updateSearchParams = useCallback((newParams) => {
    setSearchParams(prev => ({ ...prev, ...newParams }));
  }, []);

  // Function to update flight results
  const updateFlightResults = useCallback((results) => {
    setFlightResults(prev => ({ ...prev, ...results }));
  }, []);

  // Clear all flight results
  const clearResults = useCallback(() => {
    setFlightResults({
      flights: [],
      rawFlights: [],
      count: 0,
      loading: false,
      error: null
    });
  }, []);

  const value = {
    // Search data
    searchParams,
    updateSearchParams,
    
    // Results data
    flightResults,
    updateFlightResults,
    
    // Actions
    clearResults
  };

  return (
    <FlightSearchContext.Provider value={value}>
      {children}
    </FlightSearchContext.Provider>
  );
};

export const useFlightSearchContext = () => {
  const context = useContext(FlightSearchContext);
  if (!context) {
    throw new Error('useFlightSearchContext must be used within FlightSearchProvider');
  }
  return context;
};