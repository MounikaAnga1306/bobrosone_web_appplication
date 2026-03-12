// src/modules/flights/components/FlightList.jsx

import React, { useState, useEffect, useMemo } from 'react';
import FlightCard from './FlightCard';
import {
  FaSortAmountDown,
  FaSortAmountUp,
  FaFilter,
  FaTimes
} from 'react-icons/fa';

const FlightList = ({ 
  flights = [],
  passengerCounts = { adults: 1, children: 0, infants: 0 },
  onFlightSelect,
  initialSortBy = 'price',
  itemsPerPage = 10,
  // Filter props from parent (for mobile only)
  selectedAirlines,
  setSelectedAirlines,
  selectedStops,
  setSelectedStops,
  selectedTimes,
  setSelectedTimes,
  priceRange,
  setPriceRange,
  flightPriceRange,
  resetFilters,
  activeFilterCount,
  // Airlines data for mobile filters
  airlines = []
}) => {
  const [sortBy, setSortBy] = useState(initialSortBy);
  const [sortOrder, setSortOrder] = useState('asc');
  const [filteredFlights, setFilteredFlights] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // ============ HELPER FUNCTIONS FOR FORMATTING ============

  // Format time from ISO to HH:MM
  const formatTime = (isoString) => {
    if (!isoString) return '--:--';
    try {
      const date = new Date(isoString);
      return date.toLocaleTimeString('en-IN', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      });
    } catch {
      return '--:--';
    }
  };

  // Format duration from minutes to "Xh Ym"
  const formatDuration = (minutes) => {
    if (!minutes) return '0h 0m';
    const mins = parseInt(minutes);
    const hours = Math.floor(mins / 60);
    const remainingMins = mins % 60;
    return `${hours}h ${remainingMins}m`;
  };

  // Get airline name from code
  const getAirlineName = (code) => {
    const airlines = {
      'AI': 'Air India',
      '6E': 'IndiGo',
      'SG': 'SpiceJet',
      'UK': 'Vistara',
      'G8': 'GoAir',
      'I5': 'AirAsia India',
      '9W': 'Jet Airways',
      'S2': 'Air India Express',
      'QP': 'Akasa Air'
    };
    return airlines[code] || code;
  };

  // ============ PREPARE FLIGHTS FOR DISPLAY ============
  
  // Create display-ready flights with formatted data
  const displayFlights = useMemo(() => {
    if (!flights.length) return [];
    
    return flights.map(flight => ({
      ...flight,
      // Format times for display
      displayDepartureTime: formatTime(flight.departureTime),
      displayArrivalTime: formatTime(flight.arrivalTime),
      displayDuration: formatDuration(flight.duration),
      displayAirline: getAirlineName(flight.airlineCode),
      // Keep original values for sorting
      sortKey: {
        price: flight.lowestPrice || flight.price,
        duration: parseInt(flight.duration) || 0,
        departure: flight.departureTime,
        arrival: flight.arrivalTime,
        airline: flight.airline
      }
    }));
  }, [flights]);

  // Apply filters and sorting
  useEffect(() => {
    if (!displayFlights.length) {
      setFilteredFlights([]);
      return;
    }

    let result = [...displayFlights];

    // Apply price filter (from parent)
    result = result.filter(flight => 
      (flight.lowestPrice || flight.price) >= priceRange.min && 
      (flight.lowestPrice || flight.price) <= priceRange.max
    );

    // Apply airline filter (from parent)
    if (selectedAirlines?.length) {
      result = result.filter(flight => 
        selectedAirlines.includes(flight.airline)
      );
    }

    // Apply stops filter (from parent)
    if (selectedStops?.length) {
      result = result.filter(flight => {
        if (selectedStops.includes('non-stop') && flight.stops === 0) return true;
        if (selectedStops.includes('1-stop') && flight.stops === 1) return true;
        if (selectedStops.includes('2+ stops') && flight.stops >= 2) return true;
        return false;
      });
    }

    // Apply departure time filter (from parent)
    if (selectedTimes?.length) {
      result = result.filter(flight => {
        const hour = parseInt(flight.displayDepartureTime.split(':')[0]);
        if (selectedTimes.includes('early-morning') && hour >= 0 && hour < 6) return true;
        if (selectedTimes.includes('morning') && hour >= 6 && hour < 12) return true;
        if (selectedTimes.includes('afternoon') && hour >= 12 && hour < 18) return true;
        if (selectedTimes.includes('evening') && hour >= 18 && hour < 24) return true;
        return false;
      });
    }

    // Apply sorting
    result.sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'price':
          comparison = (a.lowestPrice || a.price) - (b.lowestPrice || b.price);
          break;
        case 'duration':
          comparison = (parseInt(a.duration) || 0) - (parseInt(b.duration) || 0);
          break;
        case 'departure':
          comparison = (a.departureTime || '').localeCompare(b.departureTime || '');
          break;
        case 'arrival':
          comparison = (a.arrivalTime || '').localeCompare(b.arrivalTime || '');
          break;
        case 'airline':
          comparison = (a.airline || '').localeCompare(b.airline || '');
          break;
        default:
          comparison = 0;
      }

      return sortOrder === 'asc' ? comparison : -comparison;
    });

    setFilteredFlights(result);
    setCurrentPage(1);
  }, [displayFlights, sortBy, sortOrder, priceRange, selectedAirlines, selectedStops, selectedTimes]);

  // Pagination
  const totalPages = Math.ceil(filteredFlights.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentFlights = filteredFlights.slice(startIndex, endIndex);

  // Handle sort change
  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  // Get sort icon
  const getSortIcon = (field) => {
    if (sortBy !== field) return null;
    return sortOrder === 'asc' ? 
      <FaSortAmountUp className="ml-1 text-[#FD561E]" /> : 
      <FaSortAmountDown className="ml-1 text-[#FD561E]" />;
  };

  // Toggle functions for mobile filters only
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

  // Generate unique key for flight
  const getFlightKey = (flight) => {
    return flight.id || 
           `${flight.airlineCode}-${flight.flightNumber}-${flight.departureTime}` || 
           `flight-${Math.random()}`;
  };

  // Log for debugging
  console.log('🎯 Filtered flights for display:', filteredFlights.length);
  console.log('🎯 Current page flights:', currentFlights.length);

  return (
    <div className="w-full">
      {/* Mobile Filters Modal - ONLY THIS REMAINS */}
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
                    min={flightPriceRange?.min || 0}
                    max={flightPriceRange?.max || 100000}
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

      {/* Sort Bar */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium text-gray-700">Sort by:</span>
            <div className="flex flex-wrap gap-2">
              {['price', 'duration', 'departure', 'arrival', 'airline'].map((option) => (
                <button
                  key={option}
                  onClick={() => handleSort(option)}
                  className={`flex items-center px-3 py-1.5 rounded-lg text-sm transition-colors ${
                    sortBy === option
                      ? 'bg-[#FD561E] text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {option.charAt(0).toUpperCase() + option.slice(1)} {getSortIcon(option)}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-4">
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

            {/* Results count */}
            <div className="text-sm text-gray-600">
              <span className="font-medium text-gray-900">{filteredFlights.length}</span> flights
            </div>
          </div>
        </div>
      </div>

      {/* Flight Cards */}
      {currentFlights.length > 0 ? (
        <div className="space-y-4">
          {currentFlights.map((flight) => (
            <FlightCard
              key={getFlightKey(flight)}
              flight={flight}
              passengerCounts={passengerCounts}
              onClick={() => onFlightSelect?.(flight)}
            />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm p-8 text-center border border-gray-200">
          <div className="text-5xl mb-4">🔍</div>
          <h3 className="text-lg font-semibold text-gray-800 mb-2">No flights match your filters</h3>
          <p className="text-gray-600 mb-4">Try adjusting your filter criteria</p>
          <button
            onClick={resetFilters}
            className="text-[#FD561E] hover:text-[#e04e1b] font-medium"
          >
            Reset all filters →
          </button>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-8 flex justify-center">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className={`px-4 py-2 border rounded-lg transition-colors ${
                currentPage === 1
                  ? 'border-gray-200 text-gray-400 cursor-not-allowed bg-gray-50'
                  : 'border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400'
              }`}
            >
              Previous
            </button>

            <div className="flex items-center space-x-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }

                return (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`w-10 h-10 rounded-lg transition-colors ${
                      currentPage === pageNum
                        ? 'bg-[#FD561E] text-white font-medium'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>

            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className={`px-4 py-2 border rounded-lg transition-colors ${
                currentPage === totalPages
                  ? 'border-gray-200 text-gray-400 cursor-not-allowed bg-gray-50'
                  : 'border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400'
              }`}
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Results Summary */}
      {filteredFlights.length > 0 && (
        <div className="mt-6 text-center text-sm text-gray-500">
          Showing {startIndex + 1}-{Math.min(endIndex, filteredFlights.length)} of {filteredFlights.length} flights
        </div>
      )}
    </div>
  );
};

export default FlightList;