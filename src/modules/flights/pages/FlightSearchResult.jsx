// src/modules/flights/pages/FlightSearchResults.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useFlightSearchContext } from '../contexts/FlightSearchContext';
import FlightCard from '../components/FlightCard';
import Filters from '../components/Filters';
import BankOffers from '../components/BankOffers';
import {
  FaArrowLeft,
  FaFilter,
  FaSortAmountDown,
  FaPlane,
  FaExclamationTriangle,
  FaSyncAlt,
  FaChevronRight
} from 'react-icons/fa';

const FlightSearchResults = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { flightResults, searchParams, updateFlightResults } = useFlightSearchContext();

  const { flights, loading, error, count } = flightResults;
  const [sortBy, setSortBy] = useState('price');
  const [showFilters, setShowFilters] = useState(false);
  const [filteredFlights, setFilteredFlights] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const flightsPerPage = 10;

  // Apply sorting
  useEffect(() => {
    if (flights.length === 0) return;

    let sorted = [...flights];

    switch (sortBy) {
      case 'price':
        sorted.sort((a, b) => a.price - b.price);
        break;
      case 'duration':
        sorted.sort((a, b) => {
          const getMinutes = (duration) => {
            const [hours, mins] = duration.split('h ').map(str => parseInt(str) || 0);
            return hours * 60 + mins;
          };
          return getMinutes(a.duration) - getMinutes(b.duration);
        });
        break;
      case 'departure':
        sorted.sort((a, b) => a.departureTime.localeCompare(b.departureTime));
        break;
      case 'arrival':
        sorted.sort((a, b) => a.arrivalTime.localeCompare(b.arrivalTime));
        break;
      case 'airline':
        sorted.sort((a, b) => a.airline.localeCompare(b.airline));
        break;
      default:
        break;
    }

    setFilteredFlights(sorted);
    setCurrentPage(1); // Reset to first page when sorting changes
  }, [flights, sortBy]);

  // Get current flights for pagination
  const indexOfLastFlight = currentPage * flightsPerPage;
  const indexOfFirstFlight = indexOfLastFlight - flightsPerPage;
  const currentFlights = filteredFlights.slice(indexOfFirstFlight, indexOfLastFlight);
  const totalPages = Math.ceil(filteredFlights.length / flightsPerPage);

  // Handle retry search
  const handleRetrySearch = () => {
    navigate('/flights');
  };

  // Handle no results
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          {/* Animated loader with accent color */}
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-[#FD561E] mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Searching for Flights</h2>
          <p className="text-gray-600">Finding the best options for your journey...</p>
          {/* Loading bars with gradient */}
          <div className="mt-6 space-y-2 max-w-xs mx-auto">
            <div className="h-2 bg-gradient-to-r from-gray-200 to-gray-100 rounded w-full"></div>
            <div className="h-2 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded w-3/4 mx-auto"></div>
          </div>
          <p className="text-sm text-[#FD561E] font-medium mt-4 animate-pulse">Just a moment...</p>
        </div>
      </div>
    );
  }

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
              onClick={() => navigate('/flights')}
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

  if (!loading && !error && flights.length === 0) {
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
              onClick={() => navigate('/flights')}
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

  // Format search details
  const getSearchDetails = () => {
    if (!searchParams.origin || !searchParams.destination) {
      return 'Flight Search Results';
    }

    const formatDate = (date) => {
      if (!date) return '';
      return date.toLocaleDateString('en-IN', {
        weekday: 'short',
        day: 'numeric',
        month: 'short'
      });
    };

    return `${searchParams.origin} → ${searchParams.destination} • ${formatDate(searchParams.departureDate)}`;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Enhanced Header with gradient border */}
      <div className="bg-white shadow-sm border-b sticky top-0 z-20">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate('/flights')}
              className="flex items-center text-gray-600 hover:text-[#FD561E] transition-colors font-medium group"
            >
              <FaArrowLeft className="mr-2 group-hover:text-[#FD561E] transition-colors" />
              Modify Search
            </button>

            <div className="text-center">
              <div className="flex items-center justify-center text-sm text-gray-500 mb-1">
                <span className="bg-gray-100 px-2 py-1 rounded">One way</span>
                <span className="mx-2">•</span>
                <span>{searchParams.adults || 1} Adult</span>
                {searchParams.children > 0 && <span className="ml-2">, {searchParams.children} Children</span>}
                {searchParams.infants > 0 && <span className="ml-2">, {searchParams.infants} Infant</span>}
              </div>
              <h1 className="text-xl font-bold text-gray-800">
                {getSearchDetails()}
              </h1>
              <p className="text-gray-600 text-sm mt-1 flex items-center justify-center">
                <span className="bg-gray-100 px-2 py-0.5 rounded mr-2">{count || filteredFlights.length} flights</span>
                <span>•</span>
                <span className="ml-2">Sorted by <span className="font-medium text-[#FD561E]">{sortBy}</span></span>
              </p>
            </div>

            <div className="w-24 flex justify-end">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="lg:hidden flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:border-[#FD561E] hover:text-[#FD561E] transition-colors"
              >
                <FaFilter />
                <span>Filters</span>
              </button>
            </div>
          </div>
        </div>
        {/* Accent color bottom border */}
        <div className="h-1 bg-gradient-to-r from-[#FD561E] to-[#ff7b4a] w-full"></div>
      </div>

      {/* Mobile Filters Modal */}
      {showFilters && (
        <div className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-50 flex animate-fadeIn">
          <div className="bg-white w-4/5 max-w-sm h-full overflow-auto shadow-xl">
            <div className="p-4 border-b flex justify-between items-center bg-gray-50">
              <div>
                <h3 className="font-bold text-lg text-gray-800">Filters & Sort</h3>
                <p className="text-xs text-gray-500">Customize your results</p>
              </div>
              <button
                onClick={() => setShowFilters(false)}
                className="text-gray-500 hover:text-[#FD561E] text-xl p-1 rounded-full hover:bg-gray-100 w-8 h-8 flex items-center justify-center"
              >
                ✕
              </button>
            </div>
            <div className="p-4">
              <Filters />
            </div>
            <div className="p-4 border-t bg-gray-50 sticky bottom-0">
              <button
                onClick={() => setShowFilters(false)}
                className="w-full bg-[#FD561E] hover:bg-[#e04e1b] text-white font-semibold py-3 px-4 rounded-lg transition-colors"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Desktop Filters Sidebar - Redesigned */}
          <div className="hidden lg:block lg:w-1/4">
            <div className="sticky top-24 space-y-6">
              {/* Sort Card */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-lg text-gray-800">Sort By</h3>
                  <FaSortAmountDown className="text-[#FD561E]" />
                </div>
                <div className="space-y-2">
                  {[
                    { key: 'price', label: 'Price: Low to High' },
                    { key: 'duration', label: 'Duration: Shortest' },
                    { key: 'departure', label: 'Departure: Earliest' },
                    { key: 'arrival', label: 'Arrival: Earliest' },
                    { key: 'airline', label: 'Airline: A-Z' }
                  ].map((option) => (
                    <button
                      key={option.key}
                      onClick={() => setSortBy(option.key)}
                      className={`w-full text-left px-4 py-3 rounded-lg transition-all duration-200 flex items-center justify-between ${sortBy === option.key
                          ? 'bg-gradient-to-r from-[#FD561E] to-[#ff7b4a] text-white shadow-sm'
                          : 'bg-gray-50 text-gray-700 hover:bg-gray-100 hover:border-gray-300 border border-transparent'
                        }`}
                    >
                      <span>{option.label}</span>
                      {sortBy === option.key && <FaChevronRight className="text-white" />}
                    </button>
                  ))}
                </div>
              </div>

              {/* Filters Card */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="p-5 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
                  <h3 className="font-bold text-lg text-gray-800 flex items-center">
                    <FaFilter className="mr-2 text-[#FD561E]" />
                    Filters
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">Narrow down your options</p>
                </div>
                <div className="p-5">
                  <Filters />
                </div>
              </div>

              {/* Bank Offers Card */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="p-5 border-b border-gray-100">
                  <h3 className="font-bold text-lg text-gray-800">Special Offers</h3>
                  <p className="text-sm text-gray-500">Save more with these deals</p>
                </div>
                <div className="p-5">
                  <BankOffers />
                </div>
              </div>

              {/* Help/Info Card */}
              <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl border border-blue-100 p-5">
                <h4 className="font-bold text-gray-800 mb-2 flex items-center">
                  <FaPlane className="mr-2 text-blue-500" />
                  Need Help?
                </h4>
                <p className="text-sm text-gray-600 mb-3">Our travel experts are available 24/7</p>
                <button className="text-sm font-medium text-[#FD561E] hover:text-[#e04e1b] transition-colors">
                  Call for assistance →
                </button>
              </div>
            </div>
          </div>

          {/* Main Results Panel */}
          <div className="lg:w-3/4">
            {/* Desktop Sort & Info Bar */}
            <div className="hidden lg:flex items-center justify-between mb-6 bg-white rounded-xl shadow-sm p-4 border border-gray-200">
              <div>
                <h2 className="text-lg font-bold text-gray-800 flex items-center">
                  Available Flights
                  <span className="ml-2 bg-[#FD561E] text-white text-xs font-bold px-2 py-1 rounded-full">
                    {filteredFlights.length}
                  </span>
                </h2>
                <p className="text-gray-600 text-sm">
                  Showing <span className="font-medium">{indexOfFirstFlight + 1}-{Math.min(indexOfLastFlight, filteredFlights.length)}</span> of{' '}
                  <span className="font-medium text-[#FD561E]">{filteredFlights.length}</span> flights
                </p>
              </div>

              <div className="flex items-center space-x-4">
                <span className="text-gray-700 font-medium">Sort by:</span>
                <div className="relative">
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="appearance-none border border-gray-300 rounded-lg px-4 py-2.5 bg-white focus:outline-none focus:ring-2 focus:ring-[#FD561E] focus:border-transparent pr-10 cursor-pointer hover:border-gray-400 transition-colors"
                  >
                    <option value="price">Price: Low to High</option>
                    <option value="duration">Duration: Shortest</option>
                    <option value="departure">Departure: Earliest</option>
                    <option value="arrival">Arrival: Earliest</option>
                    <option value="airline">Airline: A-Z</option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-700">
                    <FaChevronRight className="transform rotate-90" />
                  </div>
                </div>
              </div>
            </div>

            {/* Mobile Sort & Info */}
            <div className="lg:hidden mb-6 bg-white rounded-xl shadow-sm p-4 border border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-lg font-bold text-gray-800">
                    {filteredFlights.length} Flights Found
                  </h2>
                  <div className="flex items-center text-sm text-gray-500 mt-1">
                    <span className="bg-gray-100 px-2 py-0.5 rounded mr-2">Page {currentPage}/{totalPages}</span>
                  </div>
                </div>
                <button
                  onClick={() => setShowFilters(true)}
                  className="flex items-center space-x-2 px-3 py-2 border border-[#FD561E] text-[#FD561E] rounded-lg hover:bg-orange-50 transition-colors"
                >
                  <FaFilter />
                  <span className="font-medium">Filters</span>
                </button>
              </div>
              <div className="relative">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 bg-white focus:outline-none focus:ring-2 focus:ring-[#FD561E] focus:border-transparent appearance-none pr-10"
                >
                  <option value="price">Sort by: Price (Low to High)</option>
                  <option value="duration">Sort by: Duration (Shortest)</option>
                  <option value="departure">Sort by: Departure Time</option>
                  <option value="arrival">Sort by: Arrival Time</option>
                  <option value="airline">Sort by: Airline</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-700">
                  <FaChevronRight className="transform rotate-90" />
                </div>
              </div>
            </div>

            {/* Bank Offers (Mobile) */}
            <div className="lg:hidden mb-6">
              <div className="bg-gradient-to-r from-[#FD561E]/10 to-orange-50 border border-orange-100 rounded-xl p-4">
                <h3 className="font-bold text-gray-800 mb-2 flex items-center">
                  <span className="w-2 h-5 bg-[#FD561E] rounded-full mr-2"></span>
                  Exclusive Bank Offers
                </h3>
                <BankOffers />
              </div>
            </div>

            {/* Flight Cards */}
            <div className="space-y-4 mb-8">
              {currentFlights.length > 0 ? (
                currentFlights.map((flight) => (
                  <FlightCard
                    key={flight.id}
                    flight={flight}
                    onClick={() => {
                      // You can add a flight details page navigation here
                      console.log('Flight selected:', flight);
                    }}
                  />
                ))
              ) : (
                <div className="bg-white rounded-xl shadow-sm p-8 text-center border border-gray-200">
                  <div className="text-4xl mb-4">✈️</div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">No flights match your filters</h3>
                  <p className="text-gray-600 mb-4">Try adjusting your filter criteria</p>
                  <button
                    onClick={() => {
                      // Logic to reset filters would go here
                      setSortBy('price');
                    }}
                    className="text-[#FD561E] hover:text-[#e04e1b] font-medium"
                  >
                    Reset all filters →
                  </button>
                </div>
              )}
            </div>

            {/* Pagination - Enhanced */}
            {totalPages > 1 && (
              <div className="mt-8 mb-10">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-4">
                  <div className="text-sm text-gray-600">
                    Page <span className="font-medium text-gray-800">{currentPage}</span> of{' '}
                    <span className="font-medium text-gray-800">{totalPages}</span> •{' '}
                    <span className="text-[#FD561E] font-medium">{filteredFlights.length}</span> total flights
                  </div>
                  <div className="text-sm">
                    <span className="text-gray-600">Rows per page:</span>
                    <span className="ml-2 font-medium text-gray-800">{flightsPerPage}</span>
                  </div>
                </div>
                <div className="flex justify-center">
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                      className={`flex items-center px-4 py-2.5 border rounded-lg transition-all ${currentPage === 1
                          ? 'border-gray-200 text-gray-400 cursor-not-allowed bg-gray-50'
                          : 'border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400 hover:text-gray-900'
                        }`}
                    >
                      <FaChevronRight className="transform rotate-180 mr-2" />
                      Previous
                    </button>

                    <div className="flex items-center space-x-1">
                      {(() => {
                        const pages = [];
                        const maxVisiblePages = window.innerWidth < 640 ? 3 : 5;

                        let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
                        let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

                        if (endPage - startPage + 1 < maxVisiblePages) {
                          startPage = Math.max(1, endPage - maxVisiblePages + 1);
                        }

                        if (startPage > 1) {
                          pages.push(
                            <button
                              key={1}
                              onClick={() => setCurrentPage(1)}
                              className={`px-3.5 py-2 border rounded-lg ${currentPage === 1
                                  ? 'bg-[#FD561E] border-[#FD561E] text-white'
                                  : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                                }`}
                            >
                              1
                            </button>
                          );
                          if (startPage > 2) {
                            pages.push(
                              <span key="ellipsis1" className="px-2 text-gray-400">
                                ...
                              </span>
                            );
                          }
                        }

                        for (let i = startPage; i <= endPage; i++) {
                          pages.push(
                            <button
                              key={i}
                              onClick={() => setCurrentPage(i)}
                              className={`px-3.5 py-2 border rounded-lg min-w-[44px] ${currentPage === i
                                  ? 'bg-[#FD561E] border-[#FD561E] text-white font-medium shadow-sm'
                                  : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                                }`}
                            >
                              {i}
                            </button>
                          );
                        }

                        if (endPage < totalPages) {
                          if (endPage < totalPages - 1) {
                            pages.push(
                              <span key="ellipsis2" className="px-2 text-gray-400">
                                ...
                              </span>
                            );
                          }
                          pages.push(
                            <button
                              key={totalPages}
                              onClick={() => setCurrentPage(totalPages)}
                              className={`px-3.5 py-2 border rounded-lg ${currentPage === totalPages
                                  ? 'bg-[#FD561E] border-[#FD561E] text-white'
                                  : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                                }`}
                            >
                              {totalPages}
                            </button>
                          );
                        }

                        return pages;
                      })()}
                    </div>

                    <button
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                      disabled={currentPage === totalPages}
                      className={`flex items-center px-4 py-2.5 border rounded-lg transition-all ${currentPage === totalPages
                          ? 'border-gray-200 text-gray-400 cursor-not-allowed bg-gray-50'
                          : 'border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400 hover:text-gray-900'
                        }`}
                    >
                      Next
                      <FaChevronRight className="ml-2" />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Enhanced Flight Summary */}
            {flights.length > 0 && (
              <div className="mt-8 bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="font-bold text-gray-800 text-lg flex items-center">
                    <FaPlane className="mr-2 text-[#FD561E]" />
                    Search Insights
                  </h3>
                  <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">Helpful Info</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl border border-orange-200">
                    <div className="text-sm text-gray-700 font-medium mb-1">Cheapest Flight</div>
                    <div className="text-2xl font-bold text-gray-900">
                      ₹{Math.min(...flights.map(f => f.price)).toLocaleString()}
                    </div>
                    <div className="text-xs text-gray-600 mt-2 flex items-center">
                      <span className="bg-white px-2 py-0.5 rounded mr-2 text-[#FD561E] font-medium">
                        {flights.find(f => f.price === Math.min(...flights.map(f => f.price)))?.airline}
                      </span>
                      <span>Best value</span>
                    </div>
                  </div>

                  <div className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl border border-blue-200">
                    <div className="text-sm text-gray-700 font-medium mb-1">Average Price</div>
                    <div className="text-2xl font-bold text-gray-900">
                      ₹{Math.round(flights.reduce((sum, f) => sum + f.price, 0) / flights.length).toLocaleString()}
                    </div>
                    <div className="text-xs text-gray-600 mt-2">
                      Across <span className="font-medium text-gray-800">{flights.length}</span> flights
                    </div>
                    <div className="mt-2 w-full bg-blue-200 rounded-full h-1.5">
                      <div
                        className="bg-blue-600 h-1.5 rounded-full"
                        style={{ width: '60%' }}
                      ></div>
                    </div>
                  </div>

                  <div className="p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-xl border border-green-200">
                    <div className="text-sm text-gray-700 font-medium mb-1">Quickest Journey</div>
                    <div className="text-2xl font-bold text-gray-900">
                      {flights.reduce((shortest, flight) => {
                        const [hours, mins] = flight.duration.split('h ').map(str => parseInt(str) || 0);
                        const totalMinutes = hours * 60 + mins;
                        const [sHours, sMins] = shortest.duration.split('h ').map(str => parseInt(str) || 0);
                        const sTotalMinutes = sHours * 60 + sMins;
                        return totalMinutes < sTotalMinutes ? flight : shortest;
                      }, flights[0])?.duration}
                    </div>
                    <div className="text-xs text-gray-600 mt-2">
                      <span className="font-medium text-gray-800">
                        {flights.reduce((shortest, flight) => {
                          const [hours, mins] = flight.duration.split('h ').map(str => parseInt(str) || 0);
                          const totalMinutes = hours * 60 + mins;
                          const [sHours, sMins] = shortest.duration.split('h ').map(str => parseInt(str) || 0);
                          const sTotalMinutes = sHours * 60 + sMins;
                          return totalMinutes < sTotalMinutes ? flight : shortest;
                        }, flights[0])?.airline}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="mt-6 pt-6 border-t border-gray-100 text-center">
                  <p className="text-sm text-gray-600">
                    Prices are inclusive of all taxes •{' '}
                    <span className="text-[#FD561E] font-medium">Free cancellation</span> on select flights
                  </p>
                </div>
              </div>
            )}

            {/* Additional Info Footer */}
            <div className="mt-8 text-center">
              <p className="text-sm text-gray-500">
                Can't find what you're looking for?{' '}
                <button className="text-[#FD561E] hover:text-[#e04e1b] font-medium ml-1">
                  Try our flexible date search →
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
        </div>
      </div>

      {/* Add some custom styles for transitions */}
      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }
        select {
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%23FD561E'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E");
          background-repeat: no-repeat;
          background-position: right 0.75rem center;
          background-size: 1em;
        }
      `}</style>
    </div>
  );
};

export default FlightSearchResults;