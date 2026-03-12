// src/modules/flights/pages/FlightSearchResults.jsx

import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFlightSearchContext } from '../contexts/FlightSearchContext';
import FlightList from '../components/FlightList';
import FlightDetailSheet from '../components/FlightDetailSheet'; // We'll create this
import {
  FaArrowLeft,
  FaPlane,
  FaExclamationTriangle,
  FaSyncAlt,
  FaChevronRight,
  FaUserFriends,
  FaFilter,
  FaTimes
} from 'react-icons/fa';

const FlightSearchResults = () => {
  const navigate = useNavigate();
  const { 
    flightResults, 
    searchParams, 
    selectFlight,
    getSearchSummary,
    selectedFlight,
    selectedFare
  } = useFlightSearchContext();

  const { flights, loading, error, passengerBreakdown } = flightResults;
  
  // State for detail sheet
  const [showDetailSheet, setShowDetailSheet] = useState(false);

  // Filter states (moved from FlightList)
  const [priceRange, setPriceRange] = useState({ min: 0, max: 100000 });
  const [selectedAirlines, setSelectedAirlines] = useState([]);
  const [selectedStops, setSelectedStops] = useState([]);
  const [selectedTimes, setSelectedTimes] = useState([]);

  // Get price range from flights
  const flightPriceRange = useMemo(() => {
    if (!flights?.length) return { min: 0, max: 100000 };
    
    const prices = flights
      .map(f => f.price)
      .filter(p => !isNaN(p) && p > 0);
    
    if (!prices.length) return { min: 0, max: 100000 };
    
    return {
      min: Math.min(...prices),
      max: Math.max(...prices)
    };
  }, [flights]);

  // Initialize priceRange when flights load
  useEffect(() => {
    if (flightPriceRange.min !== 0 || flightPriceRange.max !== 100000) {
      setPriceRange(flightPriceRange);
    }
  }, [flightPriceRange]);

  // Reset all filters
  const resetFilters = () => {
    setPriceRange({ min: flightPriceRange.min, max: flightPriceRange.max });
    setSelectedAirlines([]);
    setSelectedStops([]);
    setSelectedTimes([]);
  };

  // Get active filter count
  const activeFilterCount = 
    selectedAirlines.length + 
    selectedStops.length + 
    selectedTimes.length +
    (priceRange.min !== flightPriceRange.min || priceRange.max !== flightPriceRange.max ? 1 : 0);

  // Extract unique airlines for filter
  const airlines = useMemo(() => {
    if (!flights?.length) return [];
    
    const airlineMap = new Map();
    flights.forEach(flight => {
      if (!airlineMap.has(flight.airline)) {
        airlineMap.set(flight.airline, {
          name: flight.airline,
          code: flight.airlineCode,
          count: 1
        });
      } else {
        const existing = airlineMap.get(flight.airline);
        existing.count += 1;
      }
    });
    
    return Array.from(airlineMap.values());
  }, [flights]);

  // Toggle functions for filters
  const toggleAirline = (airline) => {
    setSelectedAirlines(prev =>
      prev.includes(airline)
        ? prev.filter(a => a !== airline)
        : [...prev, airline]
    );
  };

  const toggleStops = (stop) => {
    setSelectedStops(prev =>
      prev.includes(stop)
        ? prev.filter(s => s !== stop)
        : [...prev, stop]
    );
  };

  const toggleTime = (time) => {
    setSelectedTimes(prev =>
      prev.includes(time)
        ? prev.filter(t => t !== time)
        : [...prev, time]
    );
  };

  // Get search summary for display
  const searchSummary = useMemo(() => {
    return getSearchSummary();
  }, [getSearchSummary]);

  // Get passenger counts from results or calculate from searchParams
  const passengerCounts = useMemo(() => {
    if (passengerBreakdown) {
      return passengerBreakdown;
    }
    
    return {
      adults: searchParams.passengers?.filter(p => p.code === 'ADT').length || 1,
      children: searchParams.passengers?.filter(p => p.code === 'CNN').length || 0,
      infants: searchParams.passengers?.filter(p => p.code === 'INF').length || 0
    };
  }, [passengerBreakdown, searchParams.passengers]);

  // Format passenger text for display
  const passengerText = useMemo(() => {
    const parts = [];
    if (passengerCounts.adults > 0) {
      parts.push(`${passengerCounts.adults} Adult${passengerCounts.adults > 1 ? 's' : ''}`);
    }
    if (passengerCounts.children > 0) {
      parts.push(`${passengerCounts.children} Child${passengerCounts.children > 1 ? 'ren' : ''}`);
    }
    if (passengerCounts.infants > 0) {
      parts.push(`${passengerCounts.infants} Infant${passengerCounts.infants > 1 ? 's' : ''}`);
    }
    return parts.join(', ');
  }, [passengerCounts]);

  // Handle flight selection - OPENS SHEET instead of navigating
  const handleFlightSelect = (flight) => {
    // Create a fare object from the flight data
    const fare = {
      id: flight.id,
      price: flight.price,
      brand: flight.brand,
      baggage: flight.baggage,
      airline: flight.airline,
      flightNumber: flight.flightNumber
    };
    
    selectFlight(flight, fare);
    setShowDetailSheet(true); // Open the sheet
  };

  // Close detail sheet
  const handleCloseSheet = () => {
    setShowDetailSheet(false);
  };

  // Handle retry search
  const handleRetrySearch = () => {
    navigate('/flights');
  };

  // Handle modify search
  const handleModifySearch = () => {
    navigate('/flights');
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-[#FD561E] mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Searching for Flights</h2>
          <p className="text-gray-600">Finding the best options for your journey...</p>
          <div className="mt-6 space-y-2 max-w-xs mx-auto">
            <div className="h-2 bg-gradient-to-r from-gray-200 to-gray-100 rounded w-full"></div>
            <div className="h-2 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded w-3/4 mx-auto"></div>
          </div>
          <p className="text-sm text-[#FD561E] font-medium mt-4 animate-pulse">Just a moment...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 text-center border border-gray-100">
          <div className="text-[#FD561E] text-5xl mb-4">
            <FaExclamationTriangle className="inline-block" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-3">Search Failed</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <div className="space-y-3">
            <button
              onClick={handleRetrySearch}
              className="w-full bg-[#FD561E] hover:bg-[#e04e1b] text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2 shadow-sm hover:shadow"
            >
              <FaSyncAlt />
              Try Search Again
            </button>
            <button
              onClick={handleModifySearch}
              className="w-full border border-gray-300 hover:border-[#FD561E] text-gray-700 hover:text-[#FD561E] font-medium py-2 px-4 rounded-lg transition-colors duration-200"
            >
              Modify Search
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-6 pt-4 border-t border-gray-100">If the problem persists, please contact support</p>
        </div>
      </div>
    );
  }

  // No flights state
  if (!loading && !error && (!flights || flights.length === 0)) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 text-center border border-gray-100">
          <div className="text-[#FD561E] text-5xl mb-4">
            <FaPlane className="inline-block" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-3">No Flights Found</h2>
          <p className="text-gray-600 mb-6">We couldn't find any flights matching your search criteria.</p>
          <div className="space-y-3">
            <button
              onClick={handleModifySearch}
              className="w-full bg-[#FD561E] hover:bg-[#e04e1b] text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-200 shadow-sm hover:shadow"
            >
              Search Again
            </button>
            <p className="text-sm text-gray-500 mt-4">
              Try adjusting your dates, destinations, or filters
            </p>
          </div>
          <div className="mt-6 pt-6 border-t border-gray-100 text-left">
            <h4 className="font-medium text-gray-700 mb-2">Suggestions:</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li className="flex items-start">
                <FaChevronRight className="text-[#FD561E] mt-0.5 mr-2 text-xs flex-shrink-0" />
                <span>Check nearby airports</span>
              </li>
              <li className="flex items-start">
                <FaChevronRight className="text-[#FD561E] mt-0.5 mr-2 text-xs flex-shrink-0" />
                <span>Be flexible with your dates (± 3 days)</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header with search summary */}
      <div className="bg-white shadow-sm border-b sticky top-0 z-20">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <button
              onClick={handleModifySearch}
              className="flex items-center text-gray-600 hover:text-[#FD561E] transition-colors font-medium group"
            >
              <FaArrowLeft className="mr-2 group-hover:text-[#FD561E] transition-colors" />
              Modify Search
            </button>

            <div className="text-center">
              <div className="flex items-center justify-center text-sm text-gray-500 mb-1">
                <span className="bg-gray-100 px-2 py-1 rounded">One way</span>
                <span className="mx-2">•</span>
                <span className="flex items-center">
                  <FaUserFriends className="mr-1 text-[#FD561E]" />
                  {passengerText}
                </span>
              </div>
              <h1 className="text-xl font-bold text-gray-800">
                {searchSummary?.route || 'Flight Search Results'}
              </h1>
              <p className="text-gray-600 text-sm mt-1">
                {flights.length} {flights.length === 1 ? 'flight' : 'flights'} found
              </p>
            </div>

            <div className="w-24">
              {/* Empty div for spacing */}
            </div>
          </div>
        </div>
        <div className="h-1 bg-gradient-to-r from-[#FD561E] to-[#ff7b4a] w-full"></div>
      </div>

      <div className="container mx-auto px-4 py-6">
        {/* Main Content */}
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Left Sidebar - Trip Details + Filters */}
          <div className="hidden lg:block lg:w-1/4">
            <div className="sticky top-24 space-y-6">
              {/* Trip Details Card */}
              <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl border border-blue-100 p-5">
                <h4 className="font-bold text-gray-800 mb-2 flex items-center">
                  <FaUserFriends className="mr-2 text-blue-500" />
                  Your Trip Details
                </h4>
                <div className="space-y-2 text-sm">
                  <p className="text-gray-600">
                    <span className="font-medium">From:</span> {searchSummary?.fromName || searchParams.legs?.[0]?.origin}
                  </p>
                  <p className="text-gray-600">
                    <span className="font-medium">To:</span> {searchSummary?.toName || searchParams.legs?.[0]?.destination}
                  </p>
                  <p className="text-gray-600">
                    <span className="font-medium">Date:</span> {searchSummary?.formattedDate}
                  </p>
                  <p className="text-gray-600">
                    <span className="font-medium">Passengers:</span> {passengerText}
                  </p>
                </div>
                <button 
                  onClick={handleModifySearch}
                  className="mt-4 text-sm font-medium text-[#FD561E] hover:text-[#e04e1b] transition-colors"
                >
                  Modify Search →
                </button>
              </div>

              {/* Filters Card */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="font-bold text-lg text-gray-800 flex items-center">
                    <FaFilter className="mr-2 text-[#FD561E]" />
                    Filters
                  </h3>
                  {activeFilterCount > 0 && (
                    <button
                      onClick={resetFilters}
                      className="text-sm text-[#FD561E] hover:text-[#e04e1b] font-medium"
                    >
                      Reset All
                    </button>
                  )}
                </div>

                {/* Price Range */}
                <div className="mb-6">
                  <h4 className="font-medium text-gray-700 mb-3">Price Range</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">₹{priceRange.min.toLocaleString()}</span>
                      <span className="text-gray-600">₹{priceRange.max.toLocaleString()}</span>
                    </div>
                    <input
                      type="range"
                      min={flightPriceRange.min}
                      max={flightPriceRange.max}
                      value={priceRange.max}
                      onChange={(e) => setPriceRange(prev => ({ ...prev, max: parseInt(e.target.value) || 0 }))}
                      className="w-full accent-[#FD561E]"
                    />
                  </div>
                </div>

                {/* Airlines */}
                {airlines.length > 0 && (
                  <div className="mb-6">
                    <h4 className="font-medium text-gray-700 mb-3">Airlines</h4>
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {airlines.map((airline) => (
                        <label key={airline.code || airline.name} className="flex items-center justify-between cursor-pointer group">
                          <div className="flex items-center">
                            <input
                              type="checkbox"
                              checked={selectedAirlines.includes(airline.name)}
                              onChange={() => toggleAirline(airline.name)}
                              className="w-4 h-4 text-[#FD561E] border-gray-300 rounded focus:ring-[#FD561E]"
                            />
                            <span className="ml-2 text-sm text-gray-700 group-hover:text-[#FD561E]">
                              {airline.name} {airline.code && `(${airline.code})`}
                            </span>
                          </div>
                          <span className="text-xs text-gray-500">{airline.count}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}

                {/* Stops */}
                <div className="mb-6">
                  <h4 className="font-medium text-gray-700 mb-3">Stops</h4>
                  <div className="space-y-2">
                    {[
                      { value: 'non-stop', label: 'Non-stop' },
                      { value: '1-stop', label: '1 Stop' },
                      { value: '2+ stops', label: '2+ Stops' }
                    ].map((stop) => (
                      <label key={stop.value} className="flex items-center cursor-pointer group">
                        <input
                          type="checkbox"
                          checked={selectedStops.includes(stop.value)}
                          onChange={() => toggleStops(stop.value)}
                          className="w-4 h-4 text-[#FD561E] border-gray-300 rounded focus:ring-[#FD561E]"
                        />
                        <span className="ml-2 text-sm text-gray-700 group-hover:text-[#FD561E]">
                          {stop.label}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Departure Time */}
                <div className="mb-6">
                  <h4 className="font-medium text-gray-700 mb-3">Departure Time</h4>
                  <div className="space-y-2">
                    {[
                      { value: 'early-morning', label: 'Early Morning (0-6)' },
                      { value: 'morning', label: 'Morning (6-12)' },
                      { value: 'afternoon', label: 'Afternoon (12-18)' },
                      { value: 'evening', label: 'Evening (18-24)' }
                    ].map((time) => (
                      <label key={time.value} className="flex items-center cursor-pointer group">
                        <input
                          type="checkbox"
                          checked={selectedTimes.includes(time.value)}
                          onChange={() => toggleTime(time.value)}
                          className="w-4 h-4 text-[#FD561E] border-gray-300 rounded focus:ring-[#FD561E]"
                        />
                        <span className="ml-2 text-sm text-gray-700 group-hover:text-[#FD561E]">
                          {time.label}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Active Filters Summary */}
                {activeFilterCount > 0 && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">{activeFilterCount}</span> active filter{activeFilterCount > 1 ? 's' : ''}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Side - Flight List */}
          <div className="lg:w-3/4">
            <FlightList 
              flights={flights}
              passengerCounts={passengerCounts}
              onFlightSelect={handleFlightSelect}
              initialSortBy="price"
              itemsPerPage={10}
              // Pass filter props down
              selectedAirlines={selectedAirlines}
              setSelectedAirlines={setSelectedAirlines}
              selectedStops={selectedStops}
              setSelectedStops={setSelectedStops}
              selectedTimes={selectedTimes}
              setSelectedTimes={setSelectedTimes}
              priceRange={priceRange}
              setPriceRange={setPriceRange}
              flightPriceRange={flightPriceRange}
              resetFilters={resetFilters}
              activeFilterCount={activeFilterCount}
            />
          </div>
        </div>

        {/* Additional Info Footer */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500">
            Can't find what you're looking for?{' '}
            <button 
              onClick={handleModifySearch}
              className="text-[#FD561E] hover:text-[#e04e1b] font-medium ml-1"
            >
              Modify your search →
            </button>
          </p>
          <div className="flex flex-wrap justify-center gap-4 mt-4 text-xs text-gray-500">
            <span>✓ Best Price Guarantee</span>
            <span>✓ No Hidden Fees</span>
            <span>✓ 24/7 Customer Support</span>
            <span>✓ Secure Booking</span>
          </div>
        </div>
      </div>

      {/* Flight Detail Sheet - Slide from right */}
      {showDetailSheet && selectedFlight && (
        <FlightDetailSheet 
          flight={selectedFlight.flight || selectedFlight}
          fare={selectedFare}
          onClose={handleCloseSheet}
          passengerCounts={passengerCounts}
        />
      )}
    </div>
  );
};

export default FlightSearchResults;