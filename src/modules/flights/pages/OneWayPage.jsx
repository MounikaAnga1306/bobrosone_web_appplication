// src/modules/flights/pages/OneWayPage.jsx
import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFlightSearchContext } from '../contexts/FlightSearchContext';
import OneWayFlightCard from '../components/shared/OneWayFlightCard';
import BottomBar from '../components/shared/BottomBar';
import FlightDetailSheet from '../components/sheet/FlightDetailSheet';
import FilterSidebar from '../components/shared/FilterSidebar';
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

const OneWayPage = () => {
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
  const [selectedFlightForSheet, setSelectedFlightForSheet] = useState(null);
  const [selectedFareForSheet, setSelectedFareForSheet] = useState(null);

  // Filter states
  const [priceRange, setPriceRange] = useState({ min: 0, max: 100000 });
  const [selectedAirlines, setSelectedAirlines] = useState([]);
  const [selectedStops, setSelectedStops] = useState([]);
  const [selectedTimes, setSelectedTimes] = useState([]);
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // ============ ALL FUNCTIONS MUST BE DEFINED BEFORE THEY'RE USED ============

  // Handle close sheet - DEFINE THIS EARLY
  const handleCloseSheet = () => {
    console.log('Closing sheet');
    setShowDetailSheet(false);
    setSelectedFlightForSheet(null);
    setSelectedFareForSheet(null);
  };

  // Handle view details
 // In OneWayPage.jsx - Update the handleViewDetails function

// ============ UPDATED: Handle view details with brand data ============
const handleViewDetails = (flight) => {
  console.log('🔍 Opening sheet for flight:', {
    id: flight.id,
    brand: flight.brand,
    faresCount: flight.fares?.length
  });
  
  // Ensure we have brand data - try to get from fares if not directly on flight
  const flightWithBrand = {
    ...flight,
    brand: flight.brand || flight.fares?.[0]?.brand || { 
      name: 'Economy', 
      description: 'Standard economy fare with basic amenities.'
    }
  };
  
  // If there are multiple fares, pass the first one as selected fare
  const selectedFare = flight.fares?.[0] || flightWithBrand;
  
  setSelectedFlightForSheet(flightWithBrand);
  setSelectedFareForSheet(selectedFare);
  setShowDetailSheet(true);
};

  // Handle flight selection
  const handleFlightSelect = (flight) => {
    selectFlight(flight, flight.fares?.[0]);
  };

  // Handle modify search
  const handleModifySearch = () => {
    navigate('/flights');
  };

  // Handle continue to booking
  const handleContinue = () => {
    if (selectedFlight && selectedFare) {
      handleViewDetails(selectedFlight);
    }
  };

  // Get price range from flights
  const flightPriceRange = useMemo(() => {
    if (!flights?.length) return { min: 0, max: 100000 };
    
    const prices = flights
      .map(f => f.lowestPrice || f.price)
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

  // Get passenger counts
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

  // Format passenger text
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

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-[#FD561E] mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Searching for Flights</h2>
          <p className="text-gray-600">Finding the best options for your journey...</p>
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
          <button
            onClick={handleModifySearch}
            className="w-full bg-[#FD561E] hover:bg-[#e04e1b] text-white font-semibold py-3 px-4 rounded-lg"
          >
            Try Search Again
          </button>
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
          <button
            onClick={handleModifySearch}
            className="w-full bg-[#FD561E] hover:bg-[#e04e1b] text-white font-semibold py-3 px-4 rounded-lg"
          >
            Search Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
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

            {/* Mobile Filter Button */}
            <button
              onClick={() => setShowMobileFilters(true)}
              className="lg:hidden flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:border-[#FD561E] hover:text-[#FD561E] transition-colors"
            >
              <FaFilter />
              <span>Filters</span>
              {activeFilterCount > 0 && (
                <span className="bg-[#FD561E] text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {activeFilterCount}
                </span>
              )}
            </button>

            <div className="hidden lg:block w-24">{/* Spacer */}</div>
          </div>
        </div>
        <div className="h-1 bg-gradient-to-r from-[#FD561E] to-[#ff7b4a] w-full"></div>
      </div>

      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Left Sidebar - FilterSidebar */}
          <div className="hidden lg:block lg:w-1/4">
            <FilterSidebar
              priceRange={priceRange}
              setPriceRange={setPriceRange}
              selectedAirlines={selectedAirlines}
              toggleAirline={toggleAirline}
              selectedStops={selectedStops}
              toggleStops={toggleStops}
              selectedTimes={selectedTimes}
              toggleTime={toggleTime}
              resetFilters={resetFilters}
              activeFilterCount={activeFilterCount}
              airlines={airlines}
              flightPriceRange={flightPriceRange}
              tripDetails={{
                from: searchSummary?.fromName,
                to: searchSummary?.toName,
                date: searchSummary?.formattedDate,
                passengers: passengerText
              }}
              onModifySearch={handleModifySearch}
              tripType="one-way"
            />
          </div>

          {/* Right Side - Flight List */}
          <div className="lg:w-3/4">
            {flights.map((flight) => (
              <OneWayFlightCard
                key={flight.id}
                flight={flight}
                isSelected={selectedFlight?.id === flight.id}
                onSelect={handleFlightSelect}
                onViewDetails={handleViewDetails}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      {selectedFlight && (
        <BottomBar
          selectedFlights={[selectedFlight]}
          totalPrice={selectedFare?.price || selectedFlight.lowestPrice}
          onContinue={handleContinue}
          onViewDetails={() => handleViewDetails(selectedFlight)}
          type="one-way"
        />
      )}

      {/* Flight Detail Sheet */}
      {showDetailSheet && selectedFlightForSheet && selectedFareForSheet && (
        <FlightDetailSheet 
          flight={selectedFlightForSheet}
          fare={selectedFareForSheet}
          onClose={handleCloseSheet}
          passengerCounts={passengerCounts}
          mode="details"
        />
      )}

      {/* Mobile Filters Modal */}
      {showMobileFilters && (
        <div className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-50 flex animate-fadeIn">
          <div className="bg-white w-4/5 max-w-sm h-full overflow-auto shadow-xl">
            <div className="p-4 border-b flex justify-between items-center bg-gray-50 sticky top-0">
              <div>
                <h3 className="font-bold text-lg text-gray-800">Filters</h3>
                <p className="text-xs text-gray-500">{activeFilterCount} active filters</p>
              </div>
              <button
                onClick={() => setShowMobileFilters(false)}
                className="text-gray-500 hover:text-[#FD561E] text-xl p-1 rounded-full hover:bg-gray-100 w-8 h-8 flex items-center justify-center"
              >
                <FaTimes />
              </button>
            </div>
            
            <div className="p-4">
              {/* Price Range */}
              <div className="mb-6">
                <h4 className="font-medium text-gray-700 mb-3">Price Range</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span>₹{priceRange.min.toLocaleString()}</span>
                    <span>₹{priceRange.max.toLocaleString()}</span>
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
                  <div className="space-y-2">
                    {airlines.map((airline) => (
                      <label key={airline.code || airline.name} className="flex items-center justify-between">
                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            checked={selectedAirlines.includes(airline.name)}
                            onChange={() => toggleAirline(airline.name)}
                            className="w-4 h-4 text-[#FD561E] border-gray-300 rounded"
                          />
                          <span className="ml-2 text-sm text-gray-700">
                            {airline.name}
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
                  {['non-stop', '1-stop', '2+ stops'].map((stop) => (
                    <label key={stop} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={selectedStops.includes(stop)}
                        onChange={() => toggleStops(stop)}
                        className="w-4 h-4 text-[#FD561E] border-gray-300 rounded"
                      />
                      <span className="ml-2 text-sm text-gray-700">
                        {stop === 'non-stop' ? 'Non-stop' : stop === '1-stop' ? '1 Stop' : '2+ Stops'}
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
                    <label key={time.value} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={selectedTimes.includes(time.value)}
                        onChange={() => toggleTime(time.value)}
                        className="w-4 h-4 text-[#FD561E] border-gray-300 rounded"
                      />
                      <span className="ml-2 text-sm text-gray-700">{time.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-4 border-t bg-gray-50 sticky bottom-0">
              <div className="flex gap-2">
                <button
                  onClick={resetFilters}
                  className="flex-1 border border-gray-300 text-gray-700 font-semibold py-3 px-4 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Reset
                </button>
                <button
                  onClick={() => setShowMobileFilters(false)}
                  className="flex-1 bg-[#FD561E] hover:bg-[#e04e1b] text-white font-semibold py-3 px-4 rounded-lg transition-colors"
                >
                  Apply
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OneWayPage;