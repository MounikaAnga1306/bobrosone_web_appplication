// src/modules/flights/contexts/flightSearchContext.js

import React, { createContext, useState, useContext, useCallback } from 'react';

const FlightSearchContext = createContext();

export const FlightSearchProvider = ({ children }) => {
  // Store search parameters - COMPLETELY EMPTY initially
  const [searchParams, setSearchParams] = useState({
    legs: [
      {
        origin: '',           
        destination: '',     
        departureDate: ''     
      }
    ],
    passengers: []  // COMPLETELY EMPTY - user will select
  });

  // For UI display - EMPTY initially
  const [airportDetails, setAirportDetails] = useState({
    origin: null,
    destination: null
  });

  // Store flight results from API
  const [flightResults, setFlightResults] = useState({
    flights: [],           // Transformed flights for display
    loading: false,
    error: null,
    searchId: null,
    currency: 'INR'
  });

  // Selected flight for detail view
  const [selectedFlight, setSelectedFlight] = useState(null);
  const [selectedFare, setSelectedFare] = useState(null);
  
  // UI state
  const [view, setView] = useState('list'); // 'list' or 'detail'
  const [sortBy, setSortBy] = useState('price'); // 'price', 'duration', 'departure'

  // Update search parameters
  const updateSearchParams = useCallback((newParams) => {
    setSearchParams(prev => ({ ...prev, ...newParams }));
  }, []);

  // Update leg information
  const updateLeg = useCallback((legData) => {
    setSearchParams(prev => ({
      ...prev,
      legs: [{ ...prev.legs[0], ...legData }]
    }));
  }, []);

  // Update origin (store code in searchParams, details separately)
  const updateOrigin = useCallback((airport) => {
    if (!airport) return;
    
    // Store code in searchParams (for API)
    setSearchParams(prev => ({
      ...prev,
      legs: [{ ...prev.legs[0], origin: airport.code }]
    }));
    
    // Store full details for UI display
    setAirportDetails(prev => ({ ...prev, origin: airport }));
  }, []);

  // Update destination
  const updateDestination = useCallback((airport) => {
    if (!airport) return;
    
    setSearchParams(prev => ({
      ...prev,
      legs: [{ ...prev.legs[0], destination: airport.code }]
    }));
    
    setAirportDetails(prev => ({ ...prev, destination: airport }));
  }, []);

  // Update departure date
  const updateDepartureDate = useCallback((date) => {
    if (!date) return;
    
    // Format date to YYYY-MM-DD
    let dateString = date;
    if (date instanceof Date) {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      dateString = `${year}-${month}-${day}`;
    }
    
    setSearchParams(prev => ({
      ...prev,
      legs: [{ ...prev.legs[0], departureDate: dateString }]
    }));
  }, []);

  // Update passengers - TAKES WHATEVER COMES FROM UI
  const updatePassengers = useCallback((passengerArray) => {
    if (!passengerArray) return;
    console.log('Updating passengers from UI:', passengerArray);
    setSearchParams(prev => ({ ...prev, passengers: passengerArray }));
  }, []);

  // Add a passenger
  const addPassenger = useCallback((code, age = null) => {
    const newPassenger = { code };
    if ((code === 'CNN' || code === 'INF') && age) {
      newPassenger.age = age;
    }
    
    setSearchParams(prev => ({
      ...prev,
      passengers: [...prev.passengers, newPassenger]
    }));
  }, []);

  // Remove a passenger
  const removePassenger = useCallback((index) => {
    setSearchParams(prev => ({
      ...prev,
      passengers: prev.passengers.filter((_, i) => i !== index)
    }));
  }, []);

  // Reset all search params (for new search)
  const resetSearch = useCallback(() => {
    setSearchParams({
      legs: [
        {
          origin: '',
          destination: '',
          departureDate: ''
        }
      ],
      passengers: []  // EMPTY - no defaults
    });
    
    setAirportDetails({
      origin: null,
      destination: null
    });
    
    clearResults();
  }, []);

  // Update flight results
  const updateFlightResults = useCallback((results) => {
    setFlightResults(prev => ({ ...prev, ...results }));
  }, []);

  // Set loading state
  const setLoading = useCallback((isLoading) => {
    setFlightResults(prev => ({ ...prev, loading: isLoading }));
  }, []);

  // Set error state
  const setError = useCallback((error) => {
    setFlightResults(prev => ({ ...prev, error, loading: false }));
  }, []);

  // Clear results
  const clearResults = useCallback(() => {
    setFlightResults({
      flights: [],
      loading: false,
      error: null,
      searchId: null,
      currency: 'INR'
    });
    setSelectedFlight(null);
    setSelectedFare(null);
    setView('list');
  }, []);

  // Select a flight for detail view
  const selectFlight = useCallback((flight, fare) => {
    setSelectedFlight(flight);
    setSelectedFare(fare || (flight.fares ? flight.fares[0] : null));
    setView('detail');
  }, []);

  // Go back to list view
  const backToList = useCallback(() => {
    setSelectedFlight(null);
    setSelectedFare(null);
    setView('list');
  }, []);

  // Update sorting
  const updateSortBy = useCallback((sortOption) => {
    setSortBy(sortOption);
  }, []);

  // Get passenger counts for display
  const getPassengerCounts = useCallback(() => {
    return {
      adults: searchParams.passengers.filter(p => p.code === 'ADT').length,
      children: searchParams.passengers.filter(p => p.code === 'CNN').length,
      infants: searchParams.passengers.filter(p => p.code === 'INF').length
    };
  }, [searchParams.passengers]);

  // Check if search is valid (has required fields)
  const isSearchValid = useCallback(() => {
    const leg = searchParams.legs[0];
    return (
      leg.origin &&
      leg.destination &&
      leg.departureDate &&
      leg.origin !== leg.destination && // Origin and destination should be different
      searchParams.passengers.length > 0 // At least one passenger
    );
  }, [searchParams]);

  // Get search summary for display (using airport details)
  const getSearchSummary = useCallback(() => {
    const leg = searchParams.legs[0];
    
    // If no data, return empty
    if (!leg.origin || !leg.destination || !leg.departureDate) {
      return null;
    }
    
    const fromCode = leg.origin;
    const toCode = leg.destination;
    
    const fromName = airportDetails.origin?.name || fromCode;
    const toName = airportDetails.destination?.name || toCode;
    
    const date = new Date(leg.departureDate).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
    
    const counts = getPassengerCounts();
    
    // Build passenger text dynamically
    const passengerParts = [];
    if (counts.adults > 0) passengerParts.push(`${counts.adults} Adult${counts.adults > 1 ? 's' : ''}`);
    if (counts.children > 0) passengerParts.push(`${counts.children} Child${counts.children > 1 ? 'ren' : ''}`);
    if (counts.infants > 0) passengerParts.push(`${counts.infants} Infant${counts.infants > 1 ? 's' : ''}`);
    
    const passengerText = passengerParts.join(', ');
    
    return {
      fromCode,
      toCode,
      fromName,
      toName,
      date: leg.departureDate,
      formattedDate: date,
      passengerText,
      passengerCounts: counts,
      route: `${fromCode} → ${toCode}`,
      routeWithNames: `${fromName} to ${toName}`,
      fullText: `${fromCode} to ${toCode} on ${date} for ${passengerText}`
    };
  }, [searchParams, airportDetails, getPassengerCounts]);

  // Get the exact API request body
  const getApiRequestBody = useCallback(() => {
    return {
      legs: searchParams.legs,
      passengers: searchParams.passengers
    };
  }, [searchParams]);

  const value = {
    // Search data
    searchParams,
    airportDetails,
    
    // Update methods
    updateSearchParams,
    updateLeg,
    updateOrigin,
    updateDestination,
    updateDepartureDate,
    updatePassengers,    // This takes whatever UI gives
    addPassenger,
    removePassenger,
    resetSearch,
    
    // Results
    flightResults,
    updateFlightResults,
    
    // Selected flight
    selectedFlight,
    selectedFare,
    selectFlight,
    backToList,
    
    // UI
    view,
    sortBy,
    updateSortBy,
    
    // Actions
    setLoading,
    setError,
    clearResults,
    
    // Helpers
    getPassengerCounts,
    getSearchSummary,
    getApiRequestBody,
    isSearchValid
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