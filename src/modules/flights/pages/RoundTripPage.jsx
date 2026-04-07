// src/modules/flights/pages/RoundTripPage.jsx

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useFlightSearchContext } from '../contexts/FlightSearchContext';
import { searchFlights } from '../services/flightSearchService';
import { transformFlightData } from '../utils/flightDataTransformer';
import RoundTripFlightCard from '../components/shared/RoundTripFlightCard';
import BottomBar from '../components/shared/BottomBar';
import RoundTripSheet from '../components/sheet/RoundTripSheet';
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
  FaInfoCircle,
  FaExchangeAlt,
  FaStar,
  FaShieldAlt
} from 'react-icons/fa';

// ============ PREMIUM FLIGHT LOADING COMPONENT ============
const FlightLoadingAnimation = ({ searchSummary }) => {
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);
  const [dots, setDots] = useState('');
  
  // Loading steps for better UX
  const loadingSteps = [
    { message: "Searching the best routes", duration: 800 },
    { message: "Checking availability", duration: 600 },
    { message: "Finding lowest fares", duration: 700 },
    { message: "Comparing airlines", duration: 500 },
    { message: "Almost there...", duration: 400 }
  ];
  
  // Animated dots effect
  useEffect(() => {
    const dotInterval = setInterval(() => {
      setDots(prev => prev.length >= 3 ? '' : prev + '.');
    }, 400);
    return () => clearInterval(dotInterval);
  }, []);
  
  // Progress animation
  useEffect(() => {
    const totalDuration = loadingSteps.reduce((sum, step) => sum + step.duration, 0);
    const startTime = Date.now();
    
    const progressInterval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const newProgress = Math.min((elapsed / totalDuration) * 100, 100);
      setProgress(newProgress);
      
      // Update current step based on elapsed time
      let accumulatedTime = 0;
      for (let i = 0; i < loadingSteps.length; i++) {
        accumulatedTime += loadingSteps[i].duration;
        if (elapsed < accumulatedTime) {
          setCurrentStep(i);
          break;
        }
      }
      
      if (newProgress >= 100) {
        clearInterval(progressInterval);
      }
    }, 50);
    
    return () => clearInterval(progressInterval);
  }, []);
  
  // Calculate flight position based on progress with takeoff trajectory
  const calculatePosition = (progress) => {
    const screenWidth = window.innerWidth;
    const maxLeft = screenWidth - 100;
    const left = (progress / 100) * maxLeft;
    
    const x = progress / 100;
    const maxRise = 150;
    const top = 350 - (maxRise * x * x);
    const rotation = -8 * (1 - x);
    
    return { left, top, rotation };
  };
  
  const position = calculatePosition(progress);
  
  return (
    <div className="min-h-screen bg-white overflow-hidden relative">
      {/* Clean white background */}
      <div className="absolute inset-0 bg-white"></div>
      
      {/* Subtle minimal shadow line at bottom */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-gray-50 to-transparent"></div>
      
      {/* Animated Flight Image with Takeoff Trajectory */}
      <div
        className="fixed transition-all duration-100 ease-linear"
        style={{
          left: `${position.left}px`,
          top: `${position.top}px`,
          transform: `rotate(${position.rotation}deg)`,
          transition: 'left 0.05s linear, top 0.08s cubic-bezier(0.4, 0, 0.2, 1), transform 0.1s ease',
          zIndex: 20
        }}
      >
        {/* Large Flight Image */}
        <img 
          src="/assets/flight_moving_image1.png"
          alt="Flight"
          className="w-32 h-32 md:w-40 md:h-40 object-contain"
          style={{
            filter: 'drop-shadow(0 8px 16px rgba(0, 0, 0, 0.08))',
            transition: 'all 0.3s ease',
            opacity: 0.95
          }}
          onError={(e) => {
            e.target.src = "https://cdn-icons-png.flaticon.com/512/3095/3095100.png";
            console.warn('Flight image not found in public/assets, using fallback');
          }}
        />
        
        {/* Minimal trail effect */}
        <div className="absolute -left-12 top-1/2 transform -translate-y-1/2 flex gap-1">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="rounded-full bg-gray-200"
              style={{
                width: `${12 - i * 3}px`,
                height: `${2 - i * 0.5}px`,
                opacity: 0.3 - i * 0.1,
                animation: `trail ${0.6 - i * 0.15}s linear infinite`,
              }}
            />
          ))}
        </div>
      </div>
      
      {/* Minimal horizontal reference line */}
      <div className="absolute bottom-32 left-0 right-0">
        <div className="h-px bg-gray-100 w-full"></div>
      </div>
      
      {/* Loading Text - Centered */}
      <div className="absolute bottom-40 left-1/2 transform -translate-x-1/2 text-center z-10">
        <h2 className="text-xl font-light text-gray-600 mb-2 tracking-wide">
          {loadingSteps[currentStep]?.message}
          <span className="inline-block w-6 text-left text-gray-400">{dots}</span>
        </h2>
        <p className="text-gray-400 text-sm font-light">
          {searchSummary?.fromName} → {searchSummary?.toName}
        </p>
        <p className="text-gray-300 text-xs mt-1 font-light">
          {searchSummary?.departureDate} → {searchSummary?.returnDate}
        </p>
        
        {/* Minimal Progress Bar */}
        <div className="mt-8 w-48 mx-auto">
          <div className="h-px bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-gray-400 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          <div className="flex justify-between text-xs text-gray-300 mt-2 font-light">
            <span>Depart</span>
            <span className="text-gray-400">{Math.round(progress)}%</span>
            <span>Arrive</span>
          </div>
        </div>
      </div>
      
      <style dangerouslySetInnerHTML={{
        __html: `
          @keyframes trail {
            0% { 
              transform: translateX(0); 
              opacity: 0.3;
              width: 12px;
            }
            100% { 
              transform: translateX(-20px); 
              opacity: 0;
              width: 20px;
            }
          }
        `
      }} />
    </div>
  );
};

const RoundTripPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { 
    updateFlightResults, 
    flightResults,
    getSearchSummary,
    passengerBreakdown
  } = useFlightSearchContext();

  // ============ API LOADING STATE ============
  const [isLoading, setIsLoading] = useState(true);
  const [apiError, setApiError] = useState(null);
  const [searchSummary, setSearchSummary] = useState(null);
  const [passengerCounts, setPassengerCounts] = useState({ ADT: 1, CNN: 0, INF: 0 });
  
  // ============ UI STATES ============
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  const [sortBy, setSortBy] = useState('price-low');
  const [selectedFareTypes, setSelectedFareTypes] = useState([]);
  
  // Filter States
  const [priceRange, setPriceRange] = useState({ min: 0, max: 100000 });
  const [selectedAirlines, setSelectedAirlines] = useState([]);
  const [selectedStops, setSelectedStops] = useState([]);
  const [selectedTimes, setSelectedTimes] = useState([]);
  
  // Selection States
  const [selectedRoundTrip, setSelectedRoundTrip] = useState({
    outbound: null,
    return: null,
    totalPrice: 0
  });
  
  const [selectedFares, setSelectedFares] = useState({
    outbound: null,
    return: null
  });
  
  // Sheet States
  const [showDetailSheet, setShowDetailSheet] = useState(false);

  // Sort options
  const sortOptions = [
    { value: 'price-low', label: 'Price: Low to High' },
    { value: 'price-high', label: 'Price: High to Low' },
    { value: 'duration', label: 'Duration: Shortest' },
    { value: 'departure', label: 'Departure: Earliest' },
    { value: 'arrival', label: 'Arrival: Earliest' }
  ];

  // Fare types for filtering
  const fareTypes = [
    { id: 'regular', label: 'Regular', icon: FaStar, color: 'blue' },
    { id: 'student', label: 'Student', icon: FaUserFriends, color: 'green' },
    { id: 'armed', label: 'Armed Forces', icon: FaShieldAlt, color: 'orange' },
    { id: 'senior', label: 'Senior Citizen', icon: FaUserFriends, color: 'purple' }
  ];

  // ============ PARSE URL PARAMETERS AND CALL API ============
  useEffect(() => {
    const fetchFlightResults = async () => {
      setIsLoading(true);
      setApiError(null);
      
      try {
        // Parse URL parameters
        const params = new URLSearchParams(location.search);
        const tripType = params.get('tripType');
        
        // Validate trip type
        if (!tripType || tripType !== 'round-trip') {
          console.error('Invalid trip type or missing parameters');
          navigate('/flights');
          return;
        }
        
        // Extract search parameters
        const from = params.get('from');
        const to = params.get('to');
        const fromName = params.get('fromName');
        const toName = params.get('toName');
        const fromCity = params.get('fromCity');
        const toCity = params.get('toCity');
        const departureDate = params.get('departureDate');
        const returnDate = params.get('returnDate');
        const adults = parseInt(params.get('adults') || '1');
        const children = parseInt(params.get('children') || '0');
        const infants = parseInt(params.get('infants') || '0');
        const travelClass = params.get('class') || 'Economy';
        const fareType = params.get('fareType') || 'regular';
        
        // Validate required parameters
        if (!from || !to || !departureDate || !returnDate) {
          console.error('Missing required search parameters');
          navigate('/flights');
          return;
        }
        
        // Format dates for display
        const formattedDeparture = new Date(departureDate).toLocaleDateString('en-GB', { 
          day: 'numeric', 
          month: 'short',
          year: 'numeric'
        });
        const formattedReturn = new Date(returnDate).toLocaleDateString('en-GB', { 
          day: 'numeric', 
          month: 'short',
          year: 'numeric'
        });
        
        // Build search summary for display
        const summary = {
          from: { code: from, name: fromName, city: fromCity },
          to: { code: to, name: toName, city: toCity },
          departureDate: formattedDeparture,
          returnDate: formattedReturn,
          rawDepartureDate: departureDate,
          rawReturnDate: returnDate,
          adults,
          children,
          infants,
          travelClass,
          fareType,
          fromCode: from,
          toCode: to,
          fromName: fromName,
          toName: toName
        };
        
        setSearchSummary(summary);
        
        // Set passenger counts
        setPassengerCounts({ ADT: adults, CNN: children, INF: infants });
        
        // Build passengers array for API
        const passengers = [];
        for (let i = 0; i < adults; i++) passengers.push({ code: 'ADT' });
        for (let i = 0; i < children; i++) passengers.push({ code: 'CNN', age: 8 });
        for (let i = 0; i < infants; i++) passengers.push({ code: 'INF', age: 1 });
        
        // Build search data for API
        const searchData = {
          tripType: 'round-trip',
          legs: [
            {
              origin: from,
              destination: to,
              departureDate: departureDate
            },
            {
              origin: to,
              destination: from,
              departureDate: returnDate
            }
          ],
          passengers,
          fareType
        };
        
        // Call the API
        console.log('🔍 Calling round-trip search API with:', searchData);
        const result = await searchFlights(searchData);
        
        if (result.success) {
          console.log('✅ Round-trip search successful:', {
            outboundCount: result.flights?.length || 0,
            returnCount: result.roundTrips?.length || 0,
            searchId: result.searchId
          });
          
          updateFlightResults({
            flights: result.flights || [],
            roundTrips: result.roundTrips || [],
            roundTripDisplay: result.roundTripDisplay || null,
            multiCity: null,
            brandDetails: result.brandDetails || {},
            count: result.count || 0,
            loading: false,
            error: null,
            searchId: result.searchId,
            traceId: result.traceId,
            passengerCount: result.passengerCount,
            currency: result.currency,
            passengerBreakdown: { ADT: adults, CNN: children, INF: infants }
          });
        } else {
          console.error('❌ Round-trip search failed:', result.error);
          setApiError(result.error || 'Search failed. Please try again.');
          updateFlightResults({
            loading: false,
            error: result.error || 'Search failed',
            flights: [],
            roundTrips: []
          });
        }
      } catch (err) {
        console.error('❌ Round-trip search error:', err);
        setApiError(err.message || 'An unexpected error occurred');
        updateFlightResults({
          loading: false,
          error: err.message,
          flights: [],
          roundTrips: []
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchFlightResults();
  }, [location.search, navigate, updateFlightResults]);

  // ============ DATA TRANSFORMATION ============
  
  const { outboundFlights, returnFlights, combinations } = useMemo(() => {
    console.log('🔄 Transforming flight data...');
    const transformed = transformFlightData(flightResults);
    
    // Log brand fare details
    console.log('\n📊 [BRAND FARE DETAILS]');
    console.log('========================================');
    console.log(`✈️ Outbound Flights: ${transformed.outboundFlights?.length || 0}`);
    console.log(`🔄 Return Flights: ${transformed.returnFlights?.length || 0}`);
    console.log('========================================\n');
    
    return transformed;
  }, [flightResults]);

  // ============ FILTERING LOGIC ============
  
  const filteredOutbound = useMemo(() => {
    let filtered = [...outboundFlights];

    // Price filter
    if (priceRange.min > 0 || priceRange.max < 100000) {
      filtered = filtered.filter(f => {
        const price = f.lowestPrice || f.price || 0;
        return price >= priceRange.min && price <= priceRange.max;
      });
    }

    // Airline filter
    if (selectedAirlines.length > 0) {
      filtered = filtered.filter(f => selectedAirlines.includes(f.airline));
    }

    // Stops filter
    if (selectedStops.length > 0) {
      filtered = filtered.filter(f => {
        const stops = f.stops || 0;
        if (selectedStops.includes('non-stop') && stops === 0) return true;
        if (selectedStops.includes('1-stop') && stops === 1) return true;
        if (selectedStops.includes('2+ stops') && stops >= 2) return true;
        return false;
      });
    }

    // Time filter
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

    // Sorting
    switch (sortBy) {
      case 'price-low':
        filtered.sort((a, b) => (a.lowestPrice || a.price || 0) - (b.lowestPrice || b.price || 0));
        break;
      case 'price-high':
        filtered.sort((a, b) => (b.lowestPrice || b.price || 0) - (a.lowestPrice || a.price || 0));
        break;
      case 'duration':
        filtered.sort((a, b) => (a.duration || 0) - (b.duration || 0));
        break;
      case 'departure':
        filtered.sort((a, b) => new Date(a.departureTime) - new Date(b.departureTime));
        break;
      default:
        break;
    }

    return filtered;
  }, [outboundFlights, priceRange, selectedAirlines, selectedStops, selectedTimes, sortBy]);

  const filteredReturn = useMemo(() => {
    let filtered = [...returnFlights];

    if (priceRange.min > 0 || priceRange.max < 100000) {
      filtered = filtered.filter(f => {
        const price = f.lowestPrice || f.price || 0;
        return price >= priceRange.min && price <= priceRange.max;
      });
    }

    if (selectedAirlines.length > 0) {
      filtered = filtered.filter(f => selectedAirlines.includes(f.airline));
    }

    if (selectedStops.length > 0) {
      filtered = filtered.filter(f => {
        const stops = f.stops || 0;
        if (selectedStops.includes('non-stop') && stops === 0) return true;
        if (selectedStops.includes('1-stop') && stops === 1) return true;
        if (selectedStops.includes('2+ stops') && stops >= 2) return true;
        return false;
      });
    }

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

    filtered.sort((a, b) => new Date(a.departureTime) - new Date(b.departureTime));

    return filtered;
  }, [returnFlights, priceRange, selectedAirlines, selectedStops, selectedTimes]);

  // ============ HANDLERS ============
  
  const handleFlightSelect = (flight, legType) => {
    console.log(`🎯 Selecting ${legType} flight:`, flight.id, 'Airline:', flight.airline);
    
    setSelectedRoundTrip(prev => {
      const newSelection = {
        ...prev,
        [legType]: flight
      };
      
      const outboundPrice = newSelection.outbound?.lowestPrice || 
                           newSelection.outbound?.price || 0;
      const returnPrice = newSelection.return?.lowestPrice || 
                         newSelection.return?.price || 0;
      
      return {
        ...newSelection,
        totalPrice: outboundPrice + returnPrice
      };
    });
  };

  const handleContinue = () => {
    if (selectedRoundTrip.outbound && selectedRoundTrip.return) {
      setShowDetailSheet(true);
    }
  };

  const handleCloseSheet = () => {
    setShowDetailSheet(false);
  };

  const handleFaresSelected = (outboundFare, returnFare) => {
    setSelectedFares({ outbound: outboundFare, return: returnFare });
    console.log('Fares selected:', { outboundFare, returnFare });
  };

  const resetFilters = () => {
    setPriceRange({ min: 0, max: 100000 });
    setSelectedAirlines([]);
    setSelectedStops([]);
    setSelectedTimes([]);
    setSelectedFareTypes([]);
  };

  // ============ UI HELPER FUNCTIONS ============
  
  const getPriceRange = useMemo(() => {
    const allPrices = [
      ...outboundFlights.map(f => f.lowestPrice || f.price || 0),
      ...returnFlights.map(f => f.lowestPrice || f.price || 0)
    ].filter(p => p > 0);
    
    return {
      min: allPrices.length ? Math.min(...allPrices) : 0,
      max: allPrices.length ? Math.max(...allPrices) : 100000
    };
  }, [outboundFlights, returnFlights]);

  const airlines = useMemo(() => {
    const airlineMap = new Map();
    [...outboundFlights, ...returnFlights].forEach(f => {
      if (f.airline) {
        const current = airlineMap.get(f.airline) || { name: f.airline, code: f.airlineCode, count: 0 };
        current.count += 1;
        airlineMap.set(f.airline, current);
      }
    });
    return Array.from(airlineMap.values());
  }, [outboundFlights, returnFlights]);

  const activeFilterCount = 
    selectedAirlines.length + 
    selectedStops.length + 
    selectedTimes.length +
    selectedFareTypes.length +
    (priceRange.min !== getPriceRange.min || priceRange.max !== getPriceRange.max ? 1 : 0);

  // ============ LOADING STATE ============
  if (isLoading) {
    return <FlightLoadingAnimation searchSummary={searchSummary} />;
  }

  // ============ API ERROR STATE ============
  if (apiError) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8 text-center">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FaExclamationTriangle className="text-3xl text-red-500" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-3">Search Failed</h2>
          <p className="text-gray-600 mb-4">{apiError}</p>
          {searchSummary && (
            <div className="bg-gray-50 p-3 rounded-lg mb-6 text-left">
              <p className="text-sm text-gray-600">Your search:</p>
              <p className="font-medium text-sm mt-1">{searchSummary.fromName} → {searchSummary.toName}</p>
              <p className="text-xs text-gray-500 mt-1">{searchSummary.departureDate} → {searchSummary.returnDate}</p>
            </div>
          )}
          <div className="flex gap-3">
            <button
              onClick={() => window.location.reload()}
              className="flex-1 bg-gray-100 text-gray-700 font-semibold py-3 px-4 rounded-xl hover:bg-gray-200 transition-colors"
            >
              Try Again
            </button>
            <button
              onClick={() => navigate('/flights')}
              className="flex-1 bg-[#FD561E] hover:bg-[#e04e1b] text-white font-semibold py-3 px-4 rounded-xl transition-all hover:shadow-lg"
            >
              Modify Search
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ============ NO FLIGHTS STATE ============
  if (!isLoading && !apiError && (!outboundFlights.length || !returnFlights.length)) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8 text-center">
          <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FaPlane className="text-3xl text-blue-500" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-3">No Flights Found</h2>
          <p className="text-gray-600 mb-4">We couldn't find any flights matching your search criteria.</p>
          {searchSummary && (
            <div className="bg-gray-50 p-3 rounded-lg mb-6 text-left">
              <p className="text-sm text-gray-600">You searched for:</p>
              <p className="font-medium text-sm mt-1">{searchSummary.fromName} → {searchSummary.toName}</p>
              <p className="text-xs text-gray-500 mt-1">{searchSummary.departureDate} → {searchSummary.returnDate}</p>
            </div>
          )}
          <button
            onClick={() => navigate('/flights')}
            className="w-full bg-[#FD561E] hover:bg-[#e04e1b] text-white font-semibold py-3 px-4 rounded-xl transition-all hover:shadow-lg"
          >
            Modify Search
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
              onClick={() => navigate('/flights')}
              className="flex items-center text-gray-600 hover:text-[#FD561E] transition-colors font-medium group"
            >
              <FaArrowLeft className="mr-2 text-sm group-hover:-translate-x-1 transition-transform" />
              <span className="hidden sm:inline">Modify</span>
            </button>

            <div className="text-center flex-1 max-w-2xl mx-4">
              {/* Search Summary Card */}
              <div className="bg-orange-50 rounded-full px-4 py-2 inline-flex items-center space-x-3 text-sm flex-wrap justify-center gap-2">
                <FaMapMarkerAlt className="text-[#FD561E] text-xs" />
                <span className="font-medium">{searchSummary?.fromCode || 'DEL'}</span>
                <FaExchangeAlt className="text-gray-400 text-xs" />
                <span className="font-medium">{searchSummary?.toCode || 'BOM'}</span>
                <span className="w-px h-4 bg-gray-300"></span>
                <FaCalendarAlt className="text-gray-400 text-xs" />
                <span>{searchSummary?.departureDate || '26 Mar'}</span>
                <FaChevronRight className="text-gray-400 text-xs" />
                <FaCalendarAlt className="text-gray-400 text-xs" />
                <span>{searchSummary?.returnDate || '28 Mar'}</span>
                <span className="w-px h-4 bg-gray-300"></span>
                <FaUserFriends className="text-gray-400 text-xs" />
                <span>{passengerCounts.ADT} Adult{passengerCounts.ADT !== 1 ? 's' : ''}</span>
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
                )}
              </div>
            </div>
          </div>
        </div>
        
        {/* Fare Type Selection */}
        <div className="border-t border-gray-200 bg-white">
          <div className="container mx-auto px-4 py-3">
            <div className="flex items-center gap-4 overflow-x-auto pb-2">
              <span className="text-sm font-medium text-gray-700 whitespace-nowrap">Fare Type:</span>
              {fareTypes.map((fare) => {
                const Icon = fare.icon;
                const isSelected = selectedFareTypes.includes(fare.id);
                return (
                  <button
                    key={fare.id}
                    onClick={() => {
                      setSelectedFareTypes(prev =>
                        prev.includes(fare.id)
                          ? prev.filter(f => f !== fare.id)
                          : [...prev, fare.id]
                      );
                    }}
                    className={`
                      flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap
                      transition-all duration-200 border
                      ${isSelected 
                        ? `bg-${fare.color}-50 border-${fare.color}-200 text-${fare.color}-700` 
                        : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300'
                      }
                    `}
                  >
                    <Icon className={isSelected ? `text-${fare.color}-500` : 'text-gray-400'} size={14} />
                    {fare.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
        
        {/* Results Stats */}
        <div className="bg-gray-50 border-t px-4 py-2">
          <div className="container mx-auto flex justify-between items-center text-sm">
            <div className="flex items-center gap-4">
              <div className="flex items-center">
                <span className="font-bold text-[#FD561E]">{outboundFlights.length}</span>
                <span className="text-gray-600 ml-1">Outbound •</span>
                <span className="font-bold text-[#FD561E] ml-1">{returnFlights.length}</span>
                <span className="text-gray-600 ml-1">Return</span>
              </div>
              {activeFilterCount > 0 && (
                <button
                  onClick={resetFilters}
                  className="text-xs text-gray-500 hover:text-[#FD561E] underline"
                >
                  Clear all filters
                </button>
              )}
            </div>
            <div className="flex items-center text-gray-500">
              <FaInfoCircle className="mr-1 text-xs" />
              <span className="text-xs">Select outbound & return</span>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Left Sidebar - Filters */}
          <div className="hidden lg:block lg:w-1/4">
            <FilterSidebar
              priceRange={priceRange}
              setPriceRange={setPriceRange}
              selectedAirlines={selectedAirlines}
              toggleAirline={(airline) => {
                setSelectedAirlines(prev =>
                  prev.includes(airline) ? prev.filter(a => a !== airline) : [...prev, airline]
                );
              }}
              selectedStops={selectedStops}
              toggleStops={(stop) => {
                setSelectedStops(prev =>
                  prev.includes(stop) ? prev.filter(s => s !== stop) : [...prev, stop]
                );
              }}
              selectedTimes={selectedTimes}
              toggleTime={(time) => {
                setSelectedTimes(prev =>
                  prev.includes(time) ? prev.filter(t => t !== time) : [...prev, time]
                );
              }}
              resetFilters={resetFilters}
              activeFilterCount={activeFilterCount}
              airlines={airlines}
              flightPriceRange={getPriceRange}
              tripType="round-trip"
            />
          </div>

          {/* Right Side - Two Column Flight Lists */}
          <div className="lg:w-3/4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Outbound Column */}
              <div>
                <div className="bg-blue-50 rounded-t-xl p-3 mb-4 sticky top-20 z-10">
                  <div className="flex items-center justify-between">
                    <h2 className="font-semibold text-blue-800 flex items-center gap-2">
                      <FaPlane className="rotate-45" />
                      Outbound
                      <span className="text-sm font-normal text-blue-600 ml-2">
                        ({filteredOutbound.length})
                      </span>
                    </h2>
                    {selectedRoundTrip.outbound && (
                      <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                        Selected
                      </span>
                    )}
                  </div>
                </div>
                <div className="space-y-4">
                  {filteredOutbound.map(flight => (
                    <RoundTripFlightCard
                      key={flight.id}
                      flight={flight}
                      isSelected={selectedRoundTrip.outbound?.id === flight.id}
                      onSelect={() => handleFlightSelect(flight, 'outbound')}
                      legIndex={0}
                    />
                  ))}
                </div>
              </div>

              {/* Return Column */}
              <div>
                <div className="bg-green-50 rounded-t-xl p-3 mb-4 sticky top-20 z-10">
                  <div className="flex items-center justify-between">
                    <h2 className="font-semibold text-green-800 flex items-center gap-2">
                      <FaPlane className="-rotate-45" />
                      Return
                      <span className="text-sm font-normal text-green-600 ml-2">
                        ({filteredReturn.length})
                      </span>
                    </h2>
                    {selectedRoundTrip.return && (
                      <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                        Selected
                      </span>
                    )}
                  </div>
                </div>
                <div className="space-y-4">
                  {filteredReturn.map(flight => (
                    <RoundTripFlightCard
                      key={flight.id}
                      flight={flight}
                      isSelected={selectedRoundTrip.return?.id === flight.id}
                      onSelect={() => handleFlightSelect(flight, 'return')}
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
      {selectedRoundTrip.outbound && selectedRoundTrip.return && (
        <BottomBar
          selectedFlights={[selectedRoundTrip.outbound, selectedRoundTrip.return]}
          totalPrice={selectedRoundTrip.totalPrice}
          onContinue={handleContinue}
          type="round-trip"
          passengerCount={passengerCounts.ADT + passengerCounts.CNN}
        />
      )}

      {/* Round Trip Details Sheet */}
      {showDetailSheet && (
        <RoundTripSheet
          isOpen={showDetailSheet}
          onClose={handleCloseSheet}
          outboundFlight={selectedRoundTrip.outbound}
          returnFlight={selectedRoundTrip.return}
          passengerCounts={passengerCounts}
          onFaresSelected={handleFaresSelected}
        />
      )}

      {/* Mobile Filters Modal */}
      {showMobileFilters && (
        <div className="lg:hidden fixed inset-0 bg-black/50 flex items-end z-50">
          <div 
            className="absolute inset-0"
            onClick={() => setShowMobileFilters(false)}
          />
          <div className="relative bg-white w-full rounded-t-3xl max-h-[90vh] overflow-auto">
            <div className="sticky top-0 bg-white border-b p-4">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-bold text-lg text-gray-800">Filters</h3>
                  <p className="text-xs text-gray-500">{activeFilterCount} active filters</p>
                </div>
                <button
                  onClick={() => setShowMobileFilters(false)}
                  className="p-2 hover:bg-gray-100 rounded-full"
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
                    min={getPriceRange.min}
                    max={getPriceRange.max}
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
                            onChange={() => {
                              setSelectedAirlines(prev =>
                                prev.includes(airline.name)
                                  ? prev.filter(a => a !== airline.name)
                                  : [...prev, airline.name]
                              );
                            }}
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
                        onChange={() => {
                          setSelectedStops(prev =>
                            prev.includes(stop.value)
                              ? prev.filter(s => s !== stop.value)
                              : [...prev, stop.value]
                          );
                        }}
                        className="w-4 h-4 text-[#FD561E] border-gray-300 rounded focus:ring-[#FD561E]"
                      />
                      <span className="ml-3 text-sm text-gray-700">{stop.label}</span>
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
                  Apply Filters
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