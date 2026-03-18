// src/modules/flights/contexts/flightSearchContext.js

import React, { createContext, useState, useContext, useCallback } from 'react';

const FlightSearchContext = createContext();

export const FlightSearchProvider = ({ children }) => {
  // Store search parameters - NOW SUPPORTS MULTIPLE LEGS
  const [searchParams, setSearchParams] = useState({
    legs: [
      {
        origin: '',           
        destination: '',     
        departureDate: ''     
      }
    ],
    passengers: []  // EMPTY - user will select
  });

  // Store trip type
  const [tripType, setTripType] = useState('one-way'); // 'one-way', 'round-trip', 'multi-city'

  // For UI display - EMPTY initially
  const [airportDetails, setAirportDetails] = useState({
    origin: null,
    destination: null
  });

  // Store flight results from API
  const [flightResults, setFlightResults] = useState({
    flights: [],           // For one-way display
    roundTripDisplay: null, // For round trip two-column display
    multiCity: { legs: [], combinations: [] }, // For multi-city
    brandDetails: {},
    loading: false,
    error: null,
    searchId: null,
    currency: 'INR'
  });

  // Selected flight for detail view
  const [selectedFlight, setSelectedFlight] = useState(null);
  const [selectedFare, setSelectedFare] = useState(null);
  
  // NEW: Selected flights for round trip and multi-city
  const [selectedLegFlights, setSelectedLegFlights] = useState([]);
  
  // UI state
  const [view, setView] = useState('list'); // 'list' or 'detail'
  const [sortBy, setSortBy] = useState('price'); // 'price', 'duration', 'departure'

  // Update search parameters
  const updateSearchParams = useCallback((newParams) => {
    setSearchParams(prev => ({ ...prev, ...newParams }));
  }, []);

  // Update trip type
  const updateTripType = useCallback((type) => {
    setTripType(type);
  }, []);

  // Update leg information - NOW SUPPORTS MULTIPLE LEGS
  const updateLeg = useCallback((index, legData) => {
    setSearchParams(prev => {
      const newLegs = [...prev.legs];
      if (!newLegs[index]) {
        // Create new leg if it doesn't exist
        newLegs[index] = { origin: '', destination: '', departureDate: '' };
      }
      newLegs[index] = { ...newLegs[index], ...legData };
      return { ...prev, legs: newLegs };
    });
  }, []);

  // Update origin (store code in searchParams, details separately)
  const updateOrigin = useCallback((airport) => {
    if (!airport) return;
    
    // Store code in searchParams (for API) - update first leg
    setSearchParams(prev => ({
      ...prev,
      legs: prev.legs.map((leg, index) => 
        index === 0 ? { ...leg, origin: airport.code } : leg
      )
    }));
    
    // Store full details for UI display
    setAirportDetails(prev => ({ ...prev, origin: airport }));
  }, []);

  // Update destination
  const updateDestination = useCallback((airport) => {
    if (!airport) return;
    
    // Store code in searchParams (for API) - update first leg
    setSearchParams(prev => ({
      ...prev,
      legs: prev.legs.map((leg, index) => 
        index === 0 ? { ...leg, destination: airport.code } : leg
      )
    }));
    
    setAirportDetails(prev => ({ ...prev, destination: airport }));
  }, []);

  // Update departure date (first leg)
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
      legs: prev.legs.map((leg, index) => 
        index === 0 ? { ...leg, departureDate: dateString } : leg
      )
    }));
  }, []);

  // NEW: Update return date (second leg)
  const updateReturnDate = useCallback((date) => {
    if (!date) return;
    
    // Format date to YYYY-MM-DD
    let dateString = date;
    if (date instanceof Date) {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      dateString = `${year}-${month}-${day}`;
    }
    
    setSearchParams(prev => {
      // Make sure we have at least 2 legs
      const legs = [...prev.legs];
      if (legs.length < 2) {
        // Add second leg if it doesn't exist
        legs.push({ 
          origin: legs[0]?.destination || '', 
          destination: legs[0]?.origin || '',
          departureDate: dateString 
        });
      } else {
        // Update existing second leg
        legs[1] = { 
          ...legs[1], 
          departureDate: dateString,
          // Ensure origin/destination are correct for return
          origin: legs[0]?.destination || legs[1]?.origin || '',
          destination: legs[0]?.origin || legs[1]?.destination || ''
        };
      }
      
      return { ...prev, legs };
    });
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
    
    setTripType('one-way');
    
    setAirportDetails({
      origin: null,
      destination: null
    });
    
    clearResults();
    setSelectedLegFlights([]);
  }, []);

  // Update flight results
  const updateFlightResults = useCallback((results) => {
    setFlightResults(prev => ({ 
      ...prev, 
      ...results,
      flights: results.flights || prev.flights || [],
      roundTripDisplay: results.roundTripDisplay || prev.roundTripDisplay || null,
      multiCity: results.multiCity || prev.multiCity || { legs: [], combinations: [] }
    }));
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
      roundTripDisplay: null,
      multiCity: { legs: [], combinations: [] },
      brandDetails: {},
      loading: false,
      error: null,
      searchId: null,
      currency: 'INR'
    });
    setSelectedFlight(null);
    setSelectedFare(null);
    setSelectedLegFlights([]);
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

  // NEW: Select flight for a specific leg (round trip/multi-city)
  const selectFlightForLeg = useCallback((legIndex, flight) => {
    console.log('Context: Selecting flight for leg', legIndex, flight?.id);
    setSelectedLegFlights(prev => {
      const newSelected = [...prev];
      newSelected[legIndex] = flight;
      return newSelected;
    });
  }, []);

  // NEW: Clear selection for a specific leg
  const clearLegSelection = useCallback((legIndex) => {
    setSelectedLegFlights(prev => {
      const newSelected = [...prev];
      newSelected[legIndex] = null;
      return newSelected;
    });
  }, []);

  // NEW: Get total selected flights count
  const getSelectedCount = useCallback(() => {
    return selectedLegFlights.filter(Boolean).length;
  }, [selectedLegFlights]);

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
    if (searchParams.legs.length === 0) return false;
    
    const firstLeg = searchParams.legs[0];
    const isValid = (
      firstLeg.origin &&
      firstLeg.destination &&
      firstLeg.departureDate &&
      firstLeg.origin !== firstLeg.destination &&
      searchParams.passengers.length > 0
    );
    
    // For round trip, also check return date
    if (tripType === 'round-trip' && searchParams.legs.length > 1) {
      const returnLeg = searchParams.legs[1];
      return isValid && returnLeg.departureDate;
    }
    
    return isValid;
  }, [searchParams, tripType]);

  // Get search summary for display
  const getSearchSummary = useCallback(() => {
    if (searchParams.legs.length === 0) return null;
    
    const firstLeg = searchParams.legs[0];
    
    // If no data, return empty
    if (!firstLeg.origin || !firstLeg.destination || !firstLeg.departureDate) {
      return null;
    }
    
    const fromCode = firstLeg.origin;
    const toCode = firstLeg.destination;
    
    const fromName = airportDetails.origin?.name || fromCode;
    const toName = airportDetails.destination?.name || toCode;
    
    const date = new Date(firstLeg.departureDate).toLocaleDateString('en-IN', {
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
    
    // Add return date for round trip
    let returnDateInfo = null;
    if (tripType === 'round-trip' && searchParams.legs.length > 1) {
      const returnLeg = searchParams.legs[1];
      if (returnLeg.departureDate) {
        returnDateInfo = new Date(returnLeg.departureDate).toLocaleDateString('en-IN', {
          day: 'numeric',
          month: 'short',
          year: 'numeric'
        });
      }
    }
    
    return {
      fromCode,
      toCode,
      fromName,
      toName,
      date: firstLeg.departureDate,
      formattedDate: date,
      returnDate: returnDateInfo,
      passengerText,
      passengerCounts: counts,
      tripType,
      route: tripType === 'round-trip' ? `${fromCode} ↔ ${toCode}` : `${fromCode} → ${toCode}`,
      routeWithNames: tripType === 'round-trip' ? `${fromName} ↔ ${toName}` : `${fromName} to ${toName}`,
      fullText: tripType === 'round-trip' 
        ? `${fromCode} ↔ ${toCode} from ${date} to ${returnDateInfo} for ${passengerText}`
        : `${fromCode} to ${toCode} on ${date} for ${passengerText}`
    };
  }, [searchParams, airportDetails, getPassengerCounts, tripType]);

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
    tripType,
    
    // Update methods
    updateSearchParams,
    updateTripType,
    updateLeg,
    updateOrigin,
    updateDestination,
    updateDepartureDate,
    updateReturnDate,
    updatePassengers,
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
    
    // NEW: Round trip & multi-city selection
    selectedLegFlights,
    selectFlightForLeg,
    clearLegSelection,
    getSelectedCount,
    
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