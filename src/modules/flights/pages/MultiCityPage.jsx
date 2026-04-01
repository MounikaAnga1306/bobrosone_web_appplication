// src/modules/flights/pages/MultiCityPage.jsx

import React, { useEffect, useState, useMemo, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useFlightSearchContext } from "../contexts/FlightSearchContext";
import { searchFlights } from "../services/flightSearchService";
import MultiCityFlightCard from "../components/shared/MultiCityFlightCard";  
import BottomBar from "../components/shared/BottomBar";
import FlightDetailSheet from "../components/sheet/FlightDetailSheet";
import FilterSidebar from "../components/shared/FilterSidebar";
import { 
  FaArrowLeft, 
  FaUserFriends, 
  FaFilter, 
  FaTimes,
  FaExclamationTriangle,
  FaPlane
} from "react-icons/fa";

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
          {searchSummary?.legsCount || 'Multi-city'} {searchSummary?.legsCount > 1 ? 'stops' : 'stop'}
        </p>
        <p className="text-gray-300 text-xs mt-1 font-light">
          {searchSummary?.cities || 'Searching best routes'}
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
            <span>Planning</span>
            <span className="text-gray-400">{Math.round(progress)}%</span>
            <span>Ready</span>
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

const MultiCityPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { 
    updateFlightResults, 
    flightResults,
    selectFlightForLeg, 
    selectedLegFlights,
    getSearchSummary
  } = useFlightSearchContext();

  // ============ API LOADING STATE ============
  const [isLoading, setIsLoading] = useState(true);
  const [apiError, setApiError] = useState(null);
  const [searchSummary, setSearchSummary] = useState(null);
  const [passengerCounts, setPassengerCounts] = useState({ ADT: 1, CNN: 0, INF: 0 });
  
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
        if (!tripType || tripType !== 'multi-city') {
          console.error('Invalid trip type or missing parameters');
          navigate('/flights');
          return;
        }
        
        // Parse legs from JSON
        let legsData;
        try {
          legsData = JSON.parse(params.get('legs'));
        } catch (err) {
          console.error('Failed to parse legs data:', err);
          navigate('/flights');
          return;
        }
        
        // Extract search parameters
        const adults = parseInt(params.get('adults') || '1');
        const children = parseInt(params.get('children') || '0');
        const infants = parseInt(params.get('infants') || '0');
        const travelClass = params.get('class') || 'Economy';
        const fareType = params.get('fareType') || 'regular';
        
        // Build search summary for display
        const citiesString = legsData.map(leg => `${leg.fromName}→${leg.toName}`).join(' · ');
        const summary = {
          legsCount: legsData.length,
          cities: citiesString,
          legs: legsData,
          adults,
          children,
          infants,
          travelClass,
          fareType
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
          tripType: 'multi-city',
          legs: legsData.map(leg => ({
            origin: leg.from,
            destination: leg.to,
            departureDate: leg.date
          })),
          passengers,
          fareType
        };
        
        // Call the API
        console.log('🔍 Calling multi-city search API with:', searchData);
        const result = await searchFlights(searchData);
        
        if (result.success) {
          console.log('✅ Multi-city search successful:', {
            legsCount: legsData.length,
            combinationsCount: result.multiCity?.combinations?.length || 0,
            searchId: result.searchId
          });
          
          updateFlightResults({
            flights: null,
            roundTrips: null,
            roundTripDisplay: null,
            multiCity: result.multiCity || { legs: [], combinations: [] },
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
          console.error('❌ Multi-city search failed:', result.error);
          setApiError(result.error || 'Search failed. Please try again.');
          updateFlightResults({
            loading: false,
            error: result.error || 'Search failed',
            multiCity: { legs: [], combinations: [] }
          });
        }
      } catch (err) {
        console.error('❌ Multi-city search error:', err);
        setApiError(err.message || 'An unexpected error occurred');
        updateFlightResults({
          loading: false,
          error: err.message,
          multiCity: { legs: [], combinations: [] }
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchFlightResults();
  }, [location.search, navigate, updateFlightResults]);

  // Get multi-city data from context
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

  // Filter flights for each leg
  const filteredLegs = useMemo(() => {
    return legs.map(leg => {
      let filtered = [...(leg.flights || [])];
      
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
      
      return {
        ...leg,
        flights: filtered
      };
    });
  }, [legs, priceRange, selectedAirlines, selectedStops, selectedTimes]);

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
      isRoundTrip: true,
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
              <p className="font-medium text-sm mt-1">{searchSummary.legsCount} legs multi-city trip</p>
              <p className="text-xs text-gray-500 mt-1">{searchSummary.cities}</p>
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
              onClick={handleModifySearch}
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
  if (!isLoading && !apiError && legs.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8 text-center">
          <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FaPlane className="text-3xl text-blue-500" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-3">No Flights Found</h2>
          <p className="text-gray-600 mb-4">We couldn't find any flights matching your multi-city search criteria.</p>
          {searchSummary && (
            <div className="bg-gray-50 p-3 rounded-lg mb-6 text-left">
              <p className="text-sm text-gray-600">You searched for:</p>
              <p className="font-medium text-sm mt-1">{searchSummary.legsCount} legs multi-city trip</p>
              <p className="text-xs text-gray-500 mt-1">{searchSummary.cities}</p>
              <p className="text-xs text-gray-500 mt-1">{passengerText} · Economy</p>
            </div>
          )}
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

  // ============ MAIN RENDER ============
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <button
              onClick={handleModifySearch}
              className="flex items-center text-gray-600 hover:text-[#FD561E] transition-colors"
            >
              <FaArrowLeft className="mr-2" />
              Modify Search
            </button>
            <div className="text-center">
              <div className="flex items-center justify-center text-sm text-gray-500 mb-1">
                <span className="bg-orange-100 text-[#FD561E] px-2 py-1 rounded">Multi City</span>
                <span className="mx-2">•</span>
                <span className="flex items-center">
                  <FaUserFriends className="mr-1 text-[#FD561E]" />
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
            <div className="hidden lg:block w-24"></div>
          </div>
        </div>
        
        {/* Results Stats */}
        <div className="bg-gray-50 border-t px-4 py-2">
          <div className="max-w-7xl mx-auto flex justify-between items-center text-sm">
            <div className="flex items-center">
              <span className="font-bold text-[#FD561E]">{filteredLegs.reduce((sum, leg) => sum + (leg.flights?.length || 0), 0)}</span>
              <span className="text-gray-600 ml-1">flights available</span>
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
              <span className="text-xs">Select flights for each leg</span>
            </div>
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
              {filteredLegs.map((leg, legIndex) => (
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
          passengerCount={passengerCounts.ADT + passengerCounts.CNN}
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
                className="text-gray-500 hover:text-[#FD561E] text-xl p-1 rounded-full hover:bg-gray-100"
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
                  className="flex-1 border border-gray-300 text-gray-700 font-semibold py-3 px-4 rounded-lg hover:bg-gray-50"
                >
                  Reset
                </button>
                <button
                  onClick={() => setShowMobileFilters(false)}
                  className="flex-1 bg-[#FD561E] hover:bg-[#e04e1b] text-white font-semibold py-3 px-4 rounded-lg"
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