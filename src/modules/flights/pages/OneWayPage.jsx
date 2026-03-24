// src/modules/flights/pages/OneWayPage.jsx

import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFlightSearchContext } from '../contexts/FlightSearchContext';
import OneWayFlightCard from '../components/shared/OneWayFlightCard';
import BottomBar from '../components/shared/BottomBar';
import OneWaySheet from '../components/sheet/OneWaySheet'; // Changed import
import FilterSidebar from '../components/shared/FilterSidebar';
import {
  FaArrowLeft,
  FaPlane,
  FaExclamationTriangle,
  FaUserFriends,
  FaFilter,
  FaTimes,
  FaChevronDown,
  FaChevronRight,
  FaCalendarAlt,
  FaMapMarkerAlt,
  FaInfoCircle
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
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  const [sortBy, setSortBy] = useState('price-low');

  // Filter states
  const [priceRange, setPriceRange] = useState({ min: 0, max: 100000 });
  const [selectedAirlines, setSelectedAirlines] = useState([]);
  const [selectedStops, setSelectedStops] = useState([]);
  const [selectedTimes, setSelectedTimes] = useState([]);

  // Sort options
  const sortOptions = [
    { value: 'price-low', label: 'Price: Low to High' },
    { value: 'price-high', label: 'Price: High to Low' },
    { value: 'duration', label: 'Duration: Shortest' },
    { value: 'departure', label: 'Departure: Earliest' },
    { value: 'arrival', label: 'Arrival: Earliest' }
  ];

  // Handle close sheet
  const handleCloseSheet = () => {
    setShowDetailSheet(false);
    setSelectedFlightForSheet(null);
  };

  // ============ UPDATED: Handle view details - Send FULL flight with all fares ============
  const handleViewDetails = (flight) => {
    console.log('🔍 Opening OneWaySheet for flight:', {
      id: flight.id,
      faresCount: flight.fares?.length || 1
    });
    
    // Send the COMPLETE flight object with all fares
    // Don't modify or pick only the first fare
    setSelectedFlightForSheet(flight);
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
      // Open sheet with selected flight
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
      const key = flight.airline || flight.airlineCode;
      if (!airlineMap.has(key)) {
        airlineMap.set(key, {
          name: flight.airline,
          code: flight.airlineCode,
          count: 1,
          logo: flight.airlineCode
        });
      } else {
        const existing = airlineMap.get(key);
        existing.count += 1;
      }
    });
    
    return Array.from(airlineMap.values()).sort((a, b) => a.name.localeCompare(b.name));
  }, [flights]);

  // Apply filters and sorting to flights
  const filteredAndSortedFlights = useMemo(() => {
    if (!flights?.length) return [];

    let filtered = [...flights];

    // Apply price filter
    if (priceRange.min > flightPriceRange.min || priceRange.max < flightPriceRange.max) {
      filtered = filtered.filter(f => {
        const price = f.lowestPrice || f.price;
        return price >= priceRange.min && price <= priceRange.max;
      });
    }

    // Apply airline filter
    if (selectedAirlines.length > 0) {
      filtered = filtered.filter(f => 
        selectedAirlines.includes(f.airline)
      );
    }

    // Apply stops filter
    if (selectedStops.length > 0) {
      filtered = filtered.filter(f => {
        if (selectedStops.includes('non-stop') && f.stops === 0) return true;
        if (selectedStops.includes('1-stop') && f.stops === 1) return true;
        if (selectedStops.includes('2+ stops') && f.stops >= 2) return true;
        return false;
      });
    }

    // Apply time filter
    if (selectedTimes.length > 0) {
      filtered = filtered.filter(f => {
        const hour = new Date(f.departureTime).getHours();
        if (selectedTimes.includes('early-morning') && hour >= 0 && hour < 6) return true;
        if (selectedTimes.includes('morning') && hour >= 6 && hour < 12) return true;
        if (selectedTimes.includes('afternoon') && hour >= 12 && hour < 18) return true;
        if (selectedTimes.includes('evening') && hour >= 18 && hour <= 23) return true;
        return false;
      });
    }

    // Apply sorting
    switch (sortBy) {
      case 'price-low':
        filtered.sort((a, b) => (a.lowestPrice || 0) - (b.lowestPrice || 0));
        break;
      case 'price-high':
        filtered.sort((a, b) => (b.lowestPrice || 0) - (a.lowestPrice || 0));
        break;
      case 'duration':
        filtered.sort((a, b) => (a.duration || 0) - (b.duration || 0));
        break;
      case 'departure':
        filtered.sort((a, b) => new Date(a.departureTime) - new Date(b.departureTime));
        break;
      case 'arrival':
        filtered.sort((a, b) => new Date(a.arrivalTime) - new Date(b.arrivalTime));
        break;
      default:
        break;
    }

    return filtered;
  }, [flights, priceRange, selectedAirlines, selectedStops, selectedTimes, sortBy, flightPriceRange]);

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

  // Get search summary
  const searchSummary = useMemo(() => {
    return getSearchSummary();
  }, [getSearchSummary]);

  // Get passenger counts
  const passengerCounts = useMemo(() => {
    if (passengerBreakdown) {
      return passengerBreakdown;
    }
    
    return {
      ADT: searchParams.passengers?.filter(p => p.code === 'ADT').length || 1,
      CNN: searchParams.passengers?.filter(p => p.code === 'CNN').length || 0,
      INF: searchParams.passengers?.filter(p => p.code === 'INF').length || 0
    };
  }, [passengerBreakdown, searchParams.passengers]);

  // Format passenger text
  const passengerText = useMemo(() => {
    const parts = [];
    if (passengerCounts.ADT > 0) {
      parts.push(`${passengerCounts.ADT} Adult${passengerCounts.ADT > 1 ? 's' : ''}`);
    }
    if (passengerCounts.CNN > 0) {
      parts.push(`${passengerCounts.CNN} Child${passengerCounts.CNN > 1 ? 'ren' : ''}`);
    }
    if (passengerCounts.INF > 0) {
      parts.push(`${passengerCounts.INF} Infant${passengerCounts.INF > 1 ? 's' : ''}`);
    }
    return parts.join(', ');
  }, [passengerCounts]);

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center bg-white p-8 rounded-2xl shadow-lg max-w-md">
          <div className="relative">
            <div className="animate-spin rounded-full h-20 w-20 border-4 border-gray-200 border-t-[#FD561E] mx-auto mb-6"></div>
            <FaPlane className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-[#FD561E] text-xl animate-pulse" />
          </div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">Searching for Flights</h2>
          <p className="text-gray-600">Finding the best options for your journey...</p>
          <div className="mt-4 flex justify-center space-x-1">
            <div className="w-2 h-2 bg-[#FD561E] rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
            <div className="w-2 h-2 bg-[#FD561E] rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
            <div className="w-2 h-2 bg-[#FD561E] rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8 text-center">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FaExclamationTriangle className="text-3xl text-red-500" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-3">Search Failed</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={handleModifySearch}
            className="w-full bg-[#FD561E] hover:bg-[#e04e1b] text-white font-semibold py-3 px-4 rounded-xl transition-all hover:shadow-lg"
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
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8 text-center">
          <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FaPlane className="text-3xl text-blue-500" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-3">No Flights Found</h2>
          <p className="text-gray-600 mb-6">We couldn't find any flights matching your search criteria. Try adjusting your dates or destination.</p>
          <button
            onClick={handleModifySearch}
            className="w-full bg-[#FD561E] hover:bg-[#e04e1b] text-white font-semibold py-3 px-4 rounded-xl transition-all hover:shadow-lg"
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
      <div className="bg-white shadow-sm border-b sticky top-0 z-20">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <button
              onClick={handleModifySearch}
              className="flex items-center text-gray-600 hover:text-[#FD561E] transition-colors font-medium group"
            >
              <FaArrowLeft className="mr-2 text-sm group-hover:-translate-x-1 transition-transform" />
              <span className="hidden sm:inline">Modify</span>
            </button>

            <div className="text-center flex-1 max-w-2xl mx-4">
              {/* Search Summary Card */}
              <div className="bg-orange-50 rounded-full px-4 py-2 inline-flex items-center space-x-3 text-sm">
                <div className="flex items-center">
                  <FaMapMarkerAlt className="text-[#FD561E] mr-1 text-xs" />
                  <span className="font-medium">{searchSummary?.fromCode || 'DEL'}</span>
                </div>
                <FaChevronRight className="text-gray-400 text-xs" />
                <div className="flex items-center">
                  <FaMapMarkerAlt className="text-[#FD561E] mr-1 text-xs" />
                  <span className="font-medium">{searchSummary?.toCode || 'BOM'}</span>
                </div>
                <div className="w-px h-4 bg-gray-300 mx-2"></div>
                <div className="flex items-center">
                  <FaCalendarAlt className="text-gray-400 mr-1 text-xs" />
                  <span>{searchSummary?.formattedDate || '26 Mar'}</span>
                </div>
                <div className="w-px h-4 bg-gray-300 mx-2"></div>
                <div className="flex items-center">
                  <FaUserFriends className="text-gray-400 mr-1 text-xs" />
                  <span>{passengerText}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* Filter Button */}
              <button
                onClick={() => setShowMobileFilters(true)}
                className="lg:hidden flex items-center gap-2 px-3 py-2 border border-gray-200 rounded-lg hover:border-[#FD561E] hover:text-[#FD561E] transition-colors relative"
              >
                <FaFilter className="text-sm" />
                {activeFilterCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-[#FD561E] text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {activeFilterCount}
                  </span>
                )}
              </button>

              {/* Sort Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setShowSortDropdown(!showSortDropdown)}
                  className="flex items-center gap-2 px-3 py-2 border border-gray-200 rounded-lg hover:border-[#FD561E] transition-colors text-sm"
                >
                  <span className="hidden sm:inline">Sort by:</span>
                  <span className="font-medium text-[#FD561E]">
                    {sortOptions.find(o => o.value === sortBy)?.label.split(': ')[1] || 'Price'}
                  </span>
                  <FaChevronDown className={`text-xs transition-transform ${showSortDropdown ? 'rotate-180' : ''}`} />
                </button>

                {showSortDropdown && (
                  <>
                    <div 
                      className="fixed inset-0 z-30"
                      onClick={() => setShowSortDropdown(false)}
                    ></div>
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border z-40 py-1">
                      {sortOptions.map(option => (
                        <button
                          key={option.value}
                          onClick={() => {
                            setSortBy(option.value);
                            setShowSortDropdown(false);
                          }}
                          className={`w-full text-left px-4 py-2.5 text-sm hover:bg-orange-50 transition-colors
                            ${sortBy === option.value ? 'text-[#FD561E] font-medium bg-orange-50' : 'text-gray-700'}`}
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
        
        {/* Results Stats */}
        <div className="bg-gray-50 border-t px-4 py-2">
          <div className="container mx-auto flex justify-between items-center text-sm">
            <div className="flex items-center">
              <span className="font-bold text-[#FD561E]">{filteredAndSortedFlights.length}</span>
              <span className="text-gray-600 ml-1">
                {filteredAndSortedFlights.length === 1 ? 'flight' : 'flights'} found
              </span>
              {activeFilterCount > 0 && (
                <button
                  onClick={resetFilters}
                  className="ml-4 text-xs text-gray-500 hover:text-[#FD561E] underline"
                >
                  Clear all filters
                </button>
              )}
            </div>
            <div className="flex items-center text-gray-500">
              <FaInfoCircle className="mr-1 text-xs" />
              <span className="text-xs">Prices include taxes</span>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Left Sidebar - FilterSidebar (Desktop) */}
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
            {filteredAndSortedFlights.length === 0 ? (
              <div className="bg-white rounded-xl p-8 text-center shadow-sm">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FaFilter className="text-2xl text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">No flights match your filters</h3>
                <p className="text-gray-600 mb-4">Try adjusting your filter criteria</p>
                <button
                  onClick={resetFilters}
                  className="text-[#FD561E] font-medium hover:underline"
                >
                  Clear all filters
                </button>
              </div>
            ) : (
              filteredAndSortedFlights.map((flight) => (
                <OneWayFlightCard
                  key={flight.id}
                  flight={flight}
                  isSelected={selectedFlight?.id === flight.id}
                  onSelect={handleFlightSelect}
                  onViewDetails={handleViewDetails}
                />
              ))
            )}
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      {selectedFlight && (
        <BottomBar
          selectedFlights={[selectedFlight]}
          totalPrice={selectedFare?.totalPrice || selectedFlight.lowestPrice}
          onContinue={handleContinue}
          onViewDetails={() => handleViewDetails(selectedFlight)}
          type="one-way"
          passengerCount={passengerCounts.ADT + passengerCounts.CNN}
        />
      )}

      {/* ============ UPDATED: Use OneWaySheet with FULL flight data ============ */}
      {showDetailSheet && selectedFlightForSheet && (
        <OneWaySheet 
          isOpen={showDetailSheet}
          onClose={handleCloseSheet}
          flight={selectedFlightForSheet}  // Send the FULL flight with ALL fares
          passengerCounts={passengerCounts}
        />
      )}

      {/* Mobile Filters Modal */}
      {showMobileFilters && (
        <div className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-50 flex animate-fadeIn">
          <div className="bg-white w-full max-w-sm ml-auto h-full overflow-auto shadow-xl">
            <div className="sticky top-0 bg-white border-b z-10">
              <div className="flex justify-between items-center p-4">
                <div>
                  <h3 className="font-bold text-lg text-gray-800">Filters</h3>
                  <p className="text-xs text-gray-500">{activeFilterCount} active filters</p>
                </div>
                <button
                  onClick={() => setShowMobileFilters(false)}
                  className="text-gray-500 hover:text-[#FD561E] p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <FaTimes />
                </button>
              </div>
            </div>
            
            <div className="p-4 pb-24">
              {/* Price Range */}
              <div className="mb-6">
                <h4 className="font-medium text-gray-700 mb-3">Price Range</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">₹{priceRange.min.toLocaleString()}</span>
                    <span className="text-gray-400">—</span>
                    <span className="font-medium">₹{priceRange.max.toLocaleString()}</span>
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
                      <label key={airline.code} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-lg cursor-pointer">
                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            checked={selectedAirlines.includes(airline.name)}
                            onChange={() => toggleAirline(airline.name)}
                            className="w-4 h-4 text-[#FD561E] border-gray-300 rounded focus:ring-[#FD561E]"
                          />
                          <span className="ml-3 text-sm text-gray-700 font-medium">
                            {airline.name}
                          </span>
                        </div>
                        <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                          {airline.count}
                        </span>
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
                    <label key={stop.value} className="flex items-center p-2 hover:bg-gray-50 rounded-lg cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedStops.includes(stop.value)}
                        onChange={() => toggleStops(stop.value)}
                        className="w-4 h-4 text-[#FD561E] border-gray-300 rounded focus:ring-[#FD561E]"
                      />
                      <span className="ml-3 text-sm text-gray-700">{stop.label}</span>
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
                    <label key={time.value} className="flex items-center p-2 hover:bg-gray-50 rounded-lg cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedTimes.includes(time.value)}
                        onChange={() => toggleTime(time.value)}
                        className="w-4 h-4 text-[#FD561E] border-gray-300 rounded focus:ring-[#FD561E]"
                      />
                      <span className="ml-3 text-sm text-gray-700">{time.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="sticky bottom-0 bg-white border-t p-4">
              <div className="flex gap-3">
                <button
                  onClick={resetFilters}
                  className="flex-1 border-2 border-gray-200 text-gray-700 font-semibold py-3 px-4 rounded-xl hover:bg-gray-50 transition-colors"
                >
                  Reset
                </button>
                <button
                  onClick={() => setShowMobileFilters(false)}
                  className="flex-1 bg-[#FD561E] hover:bg-[#e04e1b] text-white font-semibold py-3 px-4 rounded-xl transition-colors shadow-md"
                >
                  Show {filteredAndSortedFlights.length} flights
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