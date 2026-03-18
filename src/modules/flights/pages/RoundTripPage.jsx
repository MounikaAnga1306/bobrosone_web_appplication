// src/modules/flights/pages/RoundTripPage.jsx
import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFlightSearchContext } from '../contexts/FlightSearchContext';
import RoundTripFlightCard from '../components/shared/RoundTripFlightCard';
import BottomBar from '../components/shared/BottomBar';
import RoundTripSheet from '../components/sheet/RoundTripSheet';
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

const RoundTripPage = () => {
  const navigate = useNavigate();
  const { 
    flightResults, 
    searchParams, 
    selectFlightForLeg, 
    getSearchSummary, 
    selectedLegFlights 
  } = useFlightSearchContext();

  // ============ STATE DECLARATIONS ============
  const [showDetailSheet, setShowDetailSheet] = useState(false);
  const [sheetMode, setSheetMode] = useState('single'); // 'single' or 'both'

  // Filter states
  const [priceRange, setPriceRange] = useState({ min: 0, max: 100000 });
  const [selectedAirlines, setSelectedAirlines] = useState([]);
  const [selectedStops, setSelectedStops] = useState([]);
  const [selectedTimes, setSelectedTimes] = useState([]);
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // ============ DEBUG: Watch state changes ============
  useEffect(() => {
    console.log('==========================================');
    console.log('🔄 STATE CHANGE DETECTED:');
    console.log('📌 showDetailSheet:', showDetailSheet);
    console.log('📌 sheetMode:', sheetMode);
    console.log('📌 selectedLegFlights:', selectedLegFlights);
    console.log('📌 hasOutbound:', !!selectedLegFlights?.[0]);
    console.log('📌 hasReturn:', !!selectedLegFlights?.[1]);
    console.log('📌 outboundId:', selectedLegFlights?.[0]?.id);
    console.log('📌 returnId:', selectedLegFlights?.[1]?.id);
    console.log('==========================================');
  }, [showDetailSheet, sheetMode, selectedLegFlights]);

  // ============ HELPER FUNCTIONS ============
  const handleCloseSheet = () => {
    console.log('❌ Closing sheet');
    setShowDetailSheet(false);
  };

  // ============ DATA PROCESSING ============

  // SAFETY CHECK: If no round trip data, redirect
  useEffect(() => {
    if (!flightResults.roundTripDisplay && !flightResults.loading) {
      console.log('⚠️ No round trip data, redirecting to search');
      navigate('/flights');
    }
  }, [flightResults.roundTripDisplay, flightResults.loading, navigate]);

  // SAFE ACCESS with optional chaining
  const outboundFlights = flightResults.roundTripDisplay?.outbound?.flights || [];
  const returnFlights = flightResults.roundTripDisplay?.return?.flights || [];
  
  const outboundDate = flightResults.roundTripDisplay?.outbound?.date || 'Select date';
  const returnDate = flightResults.roundTripDisplay?.return?.date || 'Select date';

  // Get price range from flights
  const flightPriceRange = useMemo(() => {
    const outboundPrices = outboundFlights.map(f => f.price).filter(p => !isNaN(p) && p > 0);
    const returnPrices = returnFlights.map(f => f.price).filter(p => !isNaN(p) && p > 0);
    const allPrices = [...outboundPrices, ...returnPrices];
    
    if (!allPrices.length) return { min: 0, max: 100000 };
    
    return {
      min: Math.min(...allPrices),
      max: Math.max(...allPrices)
    };
  }, [outboundFlights, returnFlights]);

  // Initialize priceRange
  useEffect(() => {
    if (flightPriceRange.min !== 0 || flightPriceRange.max !== 100000) {
      setPriceRange(flightPriceRange);
    }
  }, [flightPriceRange]);

  // Extract unique airlines
  const airlines = useMemo(() => {
    const airlineMap = new Map();
    
    [...outboundFlights, ...returnFlights].forEach(flight => {
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
  }, [outboundFlights, returnFlights]);

  // ============ FILTER HANDLERS ============

  const resetFilters = () => {
    setPriceRange({ min: flightPriceRange.min, max: flightPriceRange.max });
    setSelectedAirlines([]);
    setSelectedStops([]);
    setSelectedTimes([]);
  };

  const activeFilterCount = 
    selectedAirlines.length + 
    selectedStops.length + 
    selectedTimes.length +
    (priceRange.min !== flightPriceRange.min || priceRange.max !== flightPriceRange.max ? 1 : 0);

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

  // ============ UI DATA ============

  const searchSummary = useMemo(() => {
    return getSearchSummary();
  }, [getSearchSummary]);

  const passengerCounts = useMemo(() => {
    return {
      adults: searchParams.passengers?.filter(p => p.code === 'ADT').length || 1,
      children: searchParams.passengers?.filter(p => p.code === 'CNN').length || 0,
      infants: searchParams.passengers?.filter(p => p.code === 'INF').length || 0
    };
  }, [searchParams.passengers]);

  const passengerText = useMemo(() => {
    const parts = [];
    if (passengerCounts.adults > 0) parts.push(`${passengerCounts.adults} Adult${passengerCounts.adults > 1 ? 's' : ''}`);
    if (passengerCounts.children > 0) parts.push(`${passengerCounts.children} Child${passengerCounts.children > 1 ? 'ren' : ''}`);
    if (passengerCounts.infants > 0) parts.push(`${passengerCounts.infants} Infant${passengerCounts.infants > 1 ? 's' : ''}`);
    return parts.join(', ');
  }, [passengerCounts]);

  // ============ SELECTION HANDLERS ============

  const handleFlightSelect = (legIndex, flight) => {
    console.log('✅ Selecting flight:', { legIndex, flightId: flight.id });
    selectFlightForLeg(legIndex, flight);
  };

  const handleViewSingleDetails = (legIndex, flight) => {
    console.log('📄 Viewing single flight details:', { legIndex, flightId: flight.id });
    setSheetMode('single');
    setShowDetailSheet(true);
  };

  const handleViewBothDetails = () => {
    console.log('📄 Viewing both flights details - START');
    console.log('Selected flights:', {
      outbound: selectedLegFlights?.[0],
      return: selectedLegFlights?.[1]
    });
    
    if (!selectedLegFlights?.[0] || !selectedLegFlights?.[1]) {
      console.log('❌ Missing flights');
      return;
    }
    
    console.log('✅ Setting sheetMode to "both" and showDetailSheet to true');
    setSheetMode('both');
    setShowDetailSheet(true);
    
    // Log after state update (will show in next render)
    setTimeout(() => {
      console.log('⏰ After timeout - showDetailSheet:', showDetailSheet);
    }, 100);
  };

  const handleModifySearch = () => {
    navigate('/flights');
  };

  const handleContinue = () => {
    console.log('🔄 Continue clicked');
    if (selectedLegFlights?.[0] && selectedLegFlights?.[1]) {
      handleViewBothDetails();
    }
  };

  // ============ PRICE CALCULATION ============

  const totalPrice = (selectedLegFlights?.[0]?.price || 0) + (selectedLegFlights?.[1]?.price || 0);
  const bothSelected = selectedLegFlights?.[0] && selectedLegFlights?.[1];

  // ============ LOADING STATES ============

  if (flightResults.loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-[#FD561E] mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Searching for Flights</h2>
          <p className="text-gray-600">Finding the best options for your round trip...</p>
        </div>
      </div>
    );
  }

  if (flightResults.error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 text-center border border-gray-100">
          <div className="text-[#FD561E] text-5xl mb-4">
            <FaExclamationTriangle className="inline-block" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-3">Search Failed</h2>
          <p className="text-gray-600 mb-6">{flightResults.error}</p>
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

  if (outboundFlights.length === 0 && returnFlights.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 text-center border border-gray-100">
          <div className="text-[#FD561E] text-5xl mb-4">
            <FaPlane className="inline-block" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-3">No Flights Found</h2>
          <p className="text-gray-600 mb-6">We couldn't find any round trip flights matching your search criteria.</p>
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

  // ============ MAIN RENDER ============

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
                <span className="bg-indigo-100 text-indigo-700 px-2 py-1 rounded">Round Trip</span>
                <span className="mx-2">•</span>
                <span className="flex items-center">
                  <FaUserFriends className="mr-1 text-[#FD561E]" />
                  {passengerText}
                </span>
              </div>
              <h1 className="text-xl font-bold text-gray-800">
                {searchSummary?.route || 'Round Trip Flight Selection'}
              </h1>
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
                departDate: searchSummary?.formattedDate,
                returnDate: searchSummary?.returnDate,
                passengers: passengerText
              }}
              onModifySearch={handleModifySearch}
              tripType="round-trip"
            />
          </div>

          {/* Right Side - Round Trip Selection */}
          <div className="lg:w-3/4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Outbound Column */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="p-4 border-b bg-gray-50">
                  <h3 className="font-semibold">Outbound · {outboundDate}</h3>
                  <p className="text-sm text-gray-500">{outboundFlights.length} flights</p>
                </div>
                <div className="p-4 space-y-3 max-h-[600px] overflow-y-auto">
                  {outboundFlights.map((flight) => (
                    <RoundTripFlightCard
                      key={flight.id}
                      flight={flight}
                      isSelected={selectedLegFlights?.[0]?.id === flight.id}
                      onSelect={(flight) => handleFlightSelect(0, flight)}
                      onViewDetails={() => handleViewSingleDetails(0, flight)}
                      legIndex={0}
                    />
                  ))}
                </div>
              </div>

              {/* Return Column */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="p-4 border-b bg-gray-50">
                  <h3 className="font-semibold">Return · {returnDate}</h3>
                  <p className="text-sm text-gray-500">{returnFlights.length} flights</p>
                </div>
                <div className="p-4 space-y-3 max-h-[600px] overflow-y-auto">
                  {returnFlights.map((flight) => (
                    <RoundTripFlightCard
                      key={flight.id}
                      flight={flight}
                      isSelected={selectedLegFlights?.[1]?.id === flight.id}
                      onSelect={(flight) => handleFlightSelect(1, flight)}
                      onViewDetails={() => handleViewSingleDetails(1, flight)}
                      legIndex={1}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      {bothSelected && (
        <BottomBar
          selectedFlights={selectedLegFlights || []}
          totalPrice={totalPrice}
          onContinue={handleContinue}
          onViewDetails={handleViewBothDetails}
          type="round-trip"
        />
      )}

      {/* Round Trip Sheet - Both Flights */}
      {console.log('🎨 Rendering condition:', { showDetailSheet, sheetMode })}
      {showDetailSheet && sheetMode === 'both' && (
        console.log('✅ Rendering RoundTripSheet') || (
          <RoundTripSheet
            isOpen={showDetailSheet}
            onClose={handleCloseSheet}
            outboundFlight={selectedLegFlights?.[0]}
            returnFlight={selectedLegFlights?.[1]}
            passengerCounts={passengerCounts}
          />
        )
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

export default RoundTripPage;