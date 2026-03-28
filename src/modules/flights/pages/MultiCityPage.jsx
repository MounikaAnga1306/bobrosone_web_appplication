// src/modules/flights/pages/MultiCityPage.jsx
import React, { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useFlightSearchContext } from "../contexts/FlightSearchContext";
import MultiCityFlightCard from "../components/shared/MultiCityFlightCard";  
import BottomBar from "../components/shared/BottomBar";
import FlightDetailSheet from "../components/sheet/FlightDetailSheet";
import FilterSidebar from "../components/shared/FilterSidebar";
import { FaArrowLeft, FaUserFriends, FaFilter, FaTimes } from "react-icons/fa";

const MultiCityPage = () => {
  const navigate = useNavigate();
  const { flightResults, isLoading, error, searchParams, selectFlightForLeg, selectedLegFlights } = useFlightSearchContext();

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

  // Get multi-city data
  const multiCityData = flightResults?.multiCity;
  const legs = multiCityData?.legs || [];

  // Auto-select first flight in each leg
  useEffect(() => {
    if (legs.length > 0 && (!selectedLegFlights || selectedLegFlights.length === 0)) {
      legs.forEach((leg, index) => {
        if (leg.flights && leg.flights.length > 0) {
          selectFlightForLeg(index, leg.flights[0]);
        }
      });
    }
  }, [legs, selectFlightForLeg, selectedLegFlights]);

  // Calculate price range
  const flightPriceRange = useMemo(() => {
    if (!legs.length) return { min: 0, max: 100000 };
    
    const allPrices = legs.flatMap(leg => 
      (leg.flights || []).map(f => f.lowestPrice || f.price)
    ).filter(p => !isNaN(p) && p > 0);
    
    if (!allPrices.length) return { min: 0, max: 100000 };
    
    return {
      min: Math.min(...allPrices),
      max: Math.max(...allPrices)
    };
  }, [legs]);

  // Initialize priceRange
  useEffect(() => {
    if (flightPriceRange.min !== 0 || flightPriceRange.max !== 100000) {
      setPriceRange(flightPriceRange);
    }
  }, [flightPriceRange]);

  // Extract unique airlines
  const airlines = useMemo(() => {
    if (!legs.length) return [];
    
    const airlineMap = new Map();
    legs.forEach(leg => {
      (leg.flights || []).forEach(flight => {
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
    });
    
    return Array.from(airlineMap.values());
  }, [legs]);

  // Reset filters
  const resetFilters = () => {
    setPriceRange({ min: flightPriceRange.min, max: flightPriceRange.max });
    setSelectedAirlines([]);
    setSelectedStops([]);
    setSelectedTimes([]);
  };

  // Active filter count
  const activeFilterCount = 
    selectedAirlines.length + 
    selectedStops.length + 
    selectedTimes.length +
    (priceRange.min !== flightPriceRange.min || priceRange.max !== flightPriceRange.max ? 1 : 0);

  // Toggle functions
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

  // Handle flight selection
  const handleFlightSelect = (legIndex, flight) => {
    selectFlightForLeg(legIndex, flight);
  };

  // Handle view details
  const handleViewDetails = (legIndex, flight) => {
    setSelectedFlightForSheet(flight);
    setSelectedFareForSheet(flight.fares?.[0] || flight);
    setShowDetailSheet(true);
  };

  // Handle view all legs from bottom bar
  const handleViewAllDetails = () => {
    if (!selectedLegFlights || selectedLegFlights.length === 0) return;
    
    const multiCityWrapper = {
      isRoundTrip: true, // Reuse round trip logic
      legs: selectedLegFlights.map((flight, idx) => ({
        flight,
        brand: flight?.brand,
        baggage: flight?.baggage,
        price: flight?.price,
        legIndex: idx
      }))
    };
    
    const multiCityFareWrapper = {
      _roundTripData: {
        ...selectedLegFlights.reduce((acc, flight, idx) => {
          acc[`leg${idx}`] = {
            flight,
            brand: flight?.brand,
            baggage: flight?.baggage,
            price: flight?.price,
            fares: flight?.fares,
            segments: flight?.segments,
            layovers: flight?.layovers
          };
          return acc;
        }, {}),
        price: {
          total: selectedLegFlights.reduce((sum, f) => sum + (f?.price || 0), 0),
          base: selectedLegFlights.reduce((sum, f) => sum + (f?.basePrice || 0), 0),
          taxes: selectedLegFlights.reduce((sum, f) => sum + (f?.totalTax || 0), 0),
          taxBreakdown: selectedLegFlights.flatMap(f => f?.taxes || [])
        }
      }
    };
    
    setSelectedFlightForSheet(multiCityWrapper);
    setSelectedFareForSheet(multiCityFareWrapper);
    setShowDetailSheet(true);
  };

  // Handle modify search
  const handleModifySearch = () => {
    navigate('/flights');
  };

  // Handle close sheet
  const handleCloseSheet = () => {
    setShowDetailSheet(false);
    setSelectedFlightForSheet(null);
    setSelectedFareForSheet(null);
  };

  // Calculate total price
  const totalPrice = (selectedLegFlights || []).reduce((sum, f) => sum + (f?.price || 0), 0);
  const allSelected = selectedLegFlights?.every(f => f !== null) && selectedLegFlights.length === legs.length;

  // Get passenger counts
  const passengerCounts = useMemo(() => {
    return {
      adults: searchParams.passengers?.filter(p => p.code === 'ADT').length || 1,
      children: searchParams.passengers?.filter(p => p.code === 'CNN').length || 0,
      infants: searchParams.passengers?.filter(p => p.code === 'INF').length || 0
    };
  }, [searchParams.passengers]);

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
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-gray-200 border-t-purple-600 rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-600">Searching for flights...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 text-xl mb-4">⚠️ Error</div>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => navigate('/flights')}
            className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700"
          >
            Back to Search
          </button>
        </div>
      </div>
    );
  }

  // No flights state
  if (legs.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-gray-400 text-xl mb-4">🛫 No Flights Found</div>
          <p className="text-gray-600 mb-6">No flights available for your search.</p>
          <button
            onClick={() => navigate('/flights')}
            className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700"
          >
            Modify Search
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <button
              onClick={handleModifySearch}
              className="flex items-center text-gray-600 hover:text-purple-600"
            >
              <FaArrowLeft className="mr-2" />
              Modify Search
            </button>
            <div className="text-center">
              <div className="flex items-center justify-center text-sm text-gray-500 mb-1">
                <span className="bg-purple-100 text-purple-700 px-2 py-1 rounded">Multi City</span>
                <span className="mx-2">•</span>
                <span className="flex items-center">
                  <FaUserFriends className="mr-1 text-purple-600" />
                  {passengerText}
                </span>
              </div>
              <h1 className="text-xl font-bold">Select Your Flights</h1>
              <p className="text-sm text-gray-500 mt-1">
                {legs.length} Legs • {flightResults?.count || 0} combinations
              </p>
            </div>
            {/* Mobile Filter Button */}
            <button
              onClick={() => setShowMobileFilters(true)}
              className="lg:hidden flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:border-purple-600 hover:text-purple-600"
            >
              <FaFilter />
              <span>Filters</span>
              {activeFilterCount > 0 && (
                <span className="bg-purple-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {activeFilterCount}
                </span>
              )}
            </button>
            <div className="hidden lg:block w-24"></div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
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
                legs: legs.map(leg => `${leg.origin}→${leg.destination}`).join(' · '),
                passengers: passengerText
              }}
              onModifySearch={handleModifySearch}
              tripType="multi-city"
            />
          </div>

          {/* Right Side - Multi-City Columns */}
          <div className="lg:w-3/4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {legs.map((leg, legIndex) => (
                <div key={legIndex} className="bg-white rounded-lg shadow-sm border border-gray-200">
                  {/* Column Header */}
                  <div className="p-4 border-b bg-gray-50 rounded-t-lg">
                    <h3 className="font-semibold">
                      Leg {legIndex + 1}: {leg.origin || '?'} → {leg.destination || '?'}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {leg.flights?.length || 0} flights available
                    </p>
                  </div>

                  {/* Flight List */}
                  <div className="p-4 space-y-3 max-h-[600px] overflow-y-auto">
                    {(leg.flights || []).map((flight) => (
                      <MultiCityFlightCard
                        key={flight.id}
                        flight={flight}
                        isSelected={selectedLegFlights?.[legIndex]?.id === flight.id}
                        onSelect={(flight) => handleFlightSelect(legIndex, flight)}
                        onViewDetails={(flight) => handleViewDetails(legIndex, flight)}
                        legIndex={legIndex}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      {selectedLegFlights?.length > 0 && (
        <BottomBar
          selectedFlights={selectedLegFlights}
          totalPrice={totalPrice}
          onContinue={() => handleViewAllDetails()}
          onViewDetails={handleViewAllDetails}
          type="multi-city"
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
        <div className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-50 flex">
          <div className="bg-white w-4/5 max-w-sm h-full overflow-auto shadow-xl">
            <div className="p-4 border-b flex justify-between items-center bg-gray-50 sticky top-0">
              <div>
                <h3 className="font-bold text-lg text-gray-800">Filters</h3>
                <p className="text-xs text-gray-500">{activeFilterCount} active filters</p>
              </div>
              <button
                onClick={() => setShowMobileFilters(false)}
                className="text-gray-500 hover:text-purple-600 text-xl p-1 rounded-full hover:bg-gray-100"
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
                    className="w-full accent-purple-600"
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
                            className="w-4 h-4 text-purple-600 border-gray-300 rounded"
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
                        className="w-4 h-4 text-purple-600 border-gray-300 rounded"
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
                        className="w-4 h-4 text-purple-600 border-gray-300 rounded"
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
                  className="flex-1 border border-gray-300 text-gray-700 font-semibold py-3 px-4 rounded-lg hover:bg-gray-50"
                >
                  Reset
                </button>
                <button
                  onClick={() => setShowMobileFilters(false)}
                  className="flex-1 bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 px-4 rounded-lg"
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

export default MultiCityPage;