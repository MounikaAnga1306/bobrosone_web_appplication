// src/modules/flights/pages/OneWayPage.jsx

import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useFlightSearchContext } from '../contexts/FlightSearchContext';
import { searchFlights } from '../services/flightSearchService';
import { searchAirports } from '../services/airportSearchService';
import { fetchAirlines } from '../services/airlineService';
import OneWayFlightCard from '../components/shared/OneWayFlightCard';
import OneWaySheet from '../components/sheet/OneWaySheet';
import FilterSidebar from '../components/shared/FilterSidebar';
import FlightLoadingAnimation from '../utils/FlightLoadingAnimation'; // IMPORT THE EXISTING COMPONENT
import {
  FaPlane,
  FaExclamationTriangle,
  FaFilter,
  FaTimes,
  FaChevronDown,
  FaChevronRight,
  FaCalendarAlt,
  FaMapMarkerAlt,
  FaInfoCircle,
  FaSpinner,
  FaExchangeAlt,
  FaUser
} from 'react-icons/fa';

const OneWayPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { 
    updateFlightResults, 
    flightResults
  } = useFlightSearchContext();

  // ============ State for URL parameters and API loading ============
  const [isLoading, setIsLoading] = useState(true);
  const [apiError, setApiError] = useState(null);
  const [searchSummary, setSearchSummary] = useState(null);
  const [passengerCounts, setPassengerCounts] = useState({ ADT: 1, CNN: 0, INF: 0 });
  const [searchParamsData, setSearchParamsData] = useState(null);
  
  // ============ AIRLINE DATA STATE ============
  const [airlinesMap, setAirlinesMap] = useState({});
  const [airlinesLoading, setAirlinesLoading] = useState(true);
  
  // ============ EDIT MODE STATE ============
  const [isEditing, setIsEditing] = useState(false);
  const [editFrom, setEditFrom] = useState(null);
  const [editTo, setEditTo] = useState(null);
  const [editFromDisplay, setEditFromDisplay] = useState('');
  const [editToDisplay, setEditToDisplay] = useState('');
  const [editDepartureDate, setEditDepartureDate] = useState(null);
  const [editPassengers, setEditPassengers] = useState(null);
  const [editTravelClass, setEditTravelClass] = useState('Economy');

  // Airport search for edit mode
  const [showFromDropdown, setShowFromDropdown] = useState(false);
  const [showToDropdown, setShowToDropdown] = useState(false);
  const [fromAirports, setFromAirports] = useState([]);
  const [toAirports, setToAirports] = useState([]);
  const [fromLoading, setFromLoading] = useState(false);
  const [toLoading, setToLoading] = useState(false);
  const fromRef = useRef(null);
  const toRef = useRef(null);
  const fromSearchTimeout = useRef(null);
  const toSearchTimeout = useRef(null);

  // Calendar state for edit mode
  const [showDepartureCalendar, setShowDepartureCalendar] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());
  const departureCalendarRef = useRef(null);

  // Traveller modal for edit mode
  const [showTravellerModal, setShowTravellerModal] = useState(false);
  const [tempPassengers, setTempPassengers] = useState([]);
  const maxTravellers = 9;
  const travellerRef = useRef(null);
  
  // ============ SHEET STATE ============
  const [showDetailSheet, setShowDetailSheet] = useState(false);
  const [selectedFlightForSheet, setSelectedFlightForSheet] = useState(null);
  
  // State for mobile filters
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

  // ============ Parse URL parameters and call API ============
  useEffect(() => {
    const fetchFlightResults = async () => {
      setIsLoading(true);
      setApiError(null);
      
      try {
        const params = new URLSearchParams(location.search);
        const tripType = params.get('tripType');
        
        if (!tripType || tripType !== 'one-way') {
          console.error('Invalid trip type or missing parameters');
          navigate('/flights');
          return;
        }
        
        const from = params.get('from');
        const to = params.get('to');
        const fromName = params.get('fromName');
        const toName = params.get('toName');
        const fromCity = params.get('fromCity');
        const toCity = params.get('toCity');
        const departureDate = params.get('departureDate');
        const adults = parseInt(params.get('adults') || '1');
        const children = parseInt(params.get('children') || '0');
        const infants = parseInt(params.get('infants') || '0');
        const travelClass = params.get('class') || 'Economy';
        const fareType = params.get('fareType') || 'regular';
        
        if (!from || !to || !departureDate) {
          console.error('Missing required search parameters');
          navigate('/flights');
          return;
        }
        
        const summary = {
          from: { code: from, name: fromName, city: fromCity },
          to: { code: to, name: toName, city: toCity },
          departureDate,
          rawDepartureDate: departureDate,
          formattedDate: new Date(departureDate).toLocaleDateString('en-GB', { 
            day: 'numeric', 
            month: 'short',
            year: 'numeric'
          }),
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
        setPassengerCounts({ ADT: adults, CNN: children, INF: infants });
        
        const passengers = [];
        for (let i = 0; i < adults; i++) passengers.push({ code: 'ADT' });
        for (let i = 0; i < children; i++) passengers.push({ code: 'CNN', age: 8 });
        for (let i = 0; i < infants; i++) passengers.push({ code: 'INF', age: 1 });
        
        const searchData = {
          tripType: 'one-way',
          legs: [{
            origin: from,
            destination: to,
            departureDate: departureDate
          }],
          passengers,
          fareType
        };
        
        setSearchParamsData(searchData);
        
        console.log('🔍 Calling search API with:', searchData);
        const result = await searchFlights(searchData);
        
        if (result.success) {
          console.log('✅ Search successful:', {
            flightsCount: result.flights?.length || 0,
            searchId: result.searchId
          });
          
          updateFlightResults({
            flights: result.flights || [],
            roundTrips: null,
            roundTripDisplay: null,
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
          console.error('❌ Search failed:', result.error);
          setApiError(result.error || 'Search failed. Please try again.');
          updateFlightResults({
            loading: false,
            error: result.error || 'Search failed',
            flights: []
          });
        }
      } catch (err) {
        console.error('❌ Search error:', err);
        setApiError(err.message || 'An unexpected error occurred');
        updateFlightResults({
          loading: false,
          error: err.message,
          flights: []
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchFlightResults();
  }, [location.search, navigate, updateFlightResults]);

  // ============ FETCH AIRLINES DATA AFTER FLIGHTS LOAD ============
  useEffect(() => {
    const loadAirlines = async () => {
      if (!flightResults.flights || flightResults.flights.length === 0) {
        setAirlinesLoading(false);
        return;
      }
      
      try {
        setAirlinesLoading(true);
        console.log('🛫 Fetching airlines data...');
        const airlines = await fetchAirlines();
        
        const airlinesMapData = {};
        airlines.forEach(airline => {
          airlinesMapData[airline.code] = airline;
        });
        
        setAirlinesMap(airlinesMapData);
        console.log('✅ Airlines data loaded:', Object.keys(airlinesMapData).length);
      } catch (error) {
        console.error('❌ Failed to load airlines:', error);
      } finally {
        setAirlinesLoading(false);
      }
    };
    
    loadAirlines();
  }, [flightResults.flights]);

  // ============ EDIT MODE FUNCTIONS ============

  const openEditMode = () => {
    setEditFrom({ code: searchSummary?.fromCode, name: searchSummary?.fromName });
    setEditTo({ code: searchSummary?.toCode, name: searchSummary?.toName });
    setEditFromDisplay(`${searchSummary?.fromName} (${searchSummary?.fromCode})`);
    setEditToDisplay(`${searchSummary?.toName} (${searchSummary?.toCode})`);
    setEditDepartureDate(searchSummary?.rawDepartureDate ? new Date(searchSummary.rawDepartureDate) : new Date());
    setEditPassengers(passengerCounts);
    setEditTravelClass(searchSummary?.travelClass || 'Economy');
    setIsEditing(true);
  };

  const cancelEdit = () => {
    setIsEditing(false);
    setShowFromDropdown(false);
    setShowToDropdown(false);
    setShowDepartureCalendar(false);
    setShowTravellerModal(false);
  };

  const handleEditSearch = () => {
    if (!editFrom || !editTo || !editDepartureDate) {
      alert('Please fill all required fields');
      return;
    }
    
    const params = new URLSearchParams();
    params.set('tripType', 'one-way');
    params.set('adults', editPassengers?.ADT || 1);
    params.set('children', editPassengers?.CNN || 0);
    params.set('infants', editPassengers?.INF || 0);
    params.set('class', editTravelClass);
    params.set('fareType', searchSummary?.fareType || 'regular');
    params.set('from', editFrom.code);
    params.set('to', editTo.code);
    params.set('fromName', editFrom.name);
    params.set('toName', editTo.name);
    params.set('departureDate', formatDateForAPI(editDepartureDate));
    
    setIsEditing(false);
    navigate(`/flights/results?${params.toString()}`);
  };

  const searchAirportsAPI = async (searchTerm, type) => {
    if (searchTerm.length < 3) {
      if (type === "from") {
        setFromAirports([]);
        setFromLoading(false);
      } else {
        setToAirports([]);
        setToLoading(false);
      }
      return;
    }

    try {
      if (type === "from") {
        setFromLoading(true);
        const results = await searchAirports(searchTerm);
        setFromAirports(results);
        setFromLoading(false);
      } else {
        setToLoading(true);
        const results = await searchAirports(searchTerm);
        setToAirports(results);
        setToLoading(false);
      }
    } catch (error) {
      if (type === "from") {
        setFromLoading(false);
        setFromAirports([]);
      } else {
        setToLoading(false);
        setToAirports([]);
      }
    }
  };

  const debouncedFromSearch = useCallback((value) => {
    if (fromSearchTimeout.current) clearTimeout(fromSearchTimeout.current);
    if (value.length >= 3) {
      fromSearchTimeout.current = setTimeout(() => searchAirportsAPI(value, "from"), 500);
    } else {
      setFromAirports([]);
      setFromLoading(false);
    }
  }, []);

  const debouncedToSearch = useCallback((value) => {
    if (toSearchTimeout.current) clearTimeout(toSearchTimeout.current);
    if (value.length >= 3) {
      toSearchTimeout.current = setTimeout(() => searchAirportsAPI(value, "to"), 500);
    } else {
      setToAirports([]);
      setToLoading(false);
    }
  }, []);

  const handleFromInputChange = (e) => {
    const value = e.target.value;
    setEditFromDisplay(value);
    setEditFrom(null);
    debouncedFromSearch(value);
    setShowFromDropdown(true);
  };

  const handleToInputChange = (e) => {
    const value = e.target.value;
    setEditToDisplay(value);
    setEditTo(null);
    debouncedToSearch(value);
    setShowToDropdown(true);
  };

  const handleFromSelect = (airport) => {
    setEditFrom(airport);
    setEditFromDisplay(`${airport.name} (${airport.location_code})`);
    setShowFromDropdown(false);
    setFromAirports([]);
  };

  const handleToSelect = (airport) => {
    setEditTo(airport);
    setEditToDisplay(`${airport.name} (${airport.location_code})`);
    setShowToDropdown(false);
    setToAirports([]);
  };

  const handleSwap = () => {
    const tempFrom = editFrom;
    const tempFromDisplay = editFromDisplay;
    setEditFrom(editTo);
    setEditFromDisplay(editToDisplay);
    setEditTo(tempFrom);
    setEditToDisplay(tempFromDisplay);
  };

  const handleDateSelect = (day) => {
    const fullDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    setEditDepartureDate(fullDate);
    setShowDepartureCalendar(false);
  };

  const openTravellerModalEdit = () => {
    setTempPassengers([
      ...Array(editPassengers?.ADT || 1).fill({ code: 'ADT' }),
      ...Array(editPassengers?.CNN || 0).fill({ code: 'CNN', age: 8 }),
      ...Array(editPassengers?.INF || 0).fill({ code: 'INF', age: 1 })
    ]);
    setShowTravellerModal(true);
  };

  const addTempPassenger = (code) => {
    if (tempPassengers.length >= maxTravellers) return;
    const newPassenger = { code };
    if (code === 'CNN') newPassenger.age = 8;
    if (code === 'INF') newPassenger.age = 1;
    setTempPassengers([...tempPassengers, newPassenger]);
  };

  const removeTempPassenger = (index) => {
    setTempPassengers(tempPassengers.filter((_, i) => i !== index));
  };

  const updateTempPassengerAge = (index, age) => {
    setTempPassengers(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], age: parseInt(age) };
      return updated;
    });
  };

  const applyPassengerChanges = () => {
    if (!tempPassengers.some(p => p.code === 'ADT')) {
      alert("At least one adult is required");
      return;
    }
    const adults = tempPassengers.filter(p => p.code === 'ADT').length;
    const children = tempPassengers.filter(p => p.code === 'CNN').length;
    const infants = tempPassengers.filter(p => p.code === 'INF').length;
    setEditPassengers({ ADT: adults, CNN: children, INF: infants });
    setShowTravellerModal(false);
  };

  const cancelPassengerChanges = () => {
    setTempPassengers([]);
    setShowTravellerModal(false);
  };

  const formatDate = (date) => {
    if (!date) return "";
    return date.toLocaleDateString("en-GB");
  };

  const formatDateForAPI = (date) => {
    if (!date) return null;
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Calendar helpers for edit mode
  const daysInMonth = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth() + 1,
    0
  ).getDate();

  const firstDay = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth(),
    1
  ).getDay();

  const monthName = currentDate.toLocaleString("default", { month: "long" });
  const year = currentDate.getFullYear();

  // ============ FLIGHT HANDLERS ============
  
  const handleCloseSheet = () => {
    setShowDetailSheet(false);
    setSelectedFlightForSheet(null);
  };

  const handleViewDetails = (flight) => {
    console.log('🔍 Opening OneWaySheet for flight:', {
      id: flight.id,
      airline: flight.airline,
      price: flight.fares?.[0]?.totalPrice
    });
    
    setSelectedFlightForSheet(flight);
    setShowDetailSheet(true);
  };
  
  const handleModifySearch = () => {
    navigate('/flights');
  };

  // Get flights from context
  const { flights, error, passengerBreakdown } = flightResults;
  
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

    if (priceRange.min > flightPriceRange.min || priceRange.max < flightPriceRange.max) {
      filtered = filtered.filter(f => {
        const price = f.lowestPrice || f.price;
        return price >= priceRange.min && price <= priceRange.max;
      });
    }

    if (selectedAirlines.length > 0) {
      filtered = filtered.filter(f => 
        selectedAirlines.includes(f.airline)
      );
    }

    if (selectedStops.length > 0) {
      filtered = filtered.filter(f => {
        if (selectedStops.includes('non-stop') && f.stops === 0) return true;
        if (selectedStops.includes('1-stop') && f.stops === 1) return true;
        if (selectedStops.includes('2+ stops') && f.stops >= 2) return true;
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

  // Click outside handlers
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (fromRef.current && !fromRef.current.contains(event.target)) {
        setShowFromDropdown(false);
      }
      if (toRef.current && !toRef.current.contains(event.target)) {
        setShowToDropdown(false);
      }
      if (departureCalendarRef.current && !departureCalendarRef.current.contains(event.target)) {
        setShowDepartureCalendar(false);
      }
      if (travellerRef.current && !travellerRef.current.contains(event.target)) {
        setShowTravellerModal(false);
        setTempPassengers([]);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // ============ RENDER COMPONENT WITH SEARCH BAR ALWAYS VISIBLE ============
  
  return (
    <div className="min-h-screen bg-gray-50">
      {/* ============ EDIT SEARCH BAR - ALWAYS VISIBLE ============ */}
      <div className="w-full bg-[#f36b32] py-4 sticky top-0 z-40 shadow-md flight-search-bar">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr_auto_1fr_auto] lg:grid-cols-[1fr_auto_1fr_180px_200px_auto] items-end gap-4">
            
            {/* From Field */}
            <div className="relative" ref={fromRef}>
              <p className="text-white text-sm font-bold mb-2">FROM</p>
              <div className="relative">
                <div className="flex items-center gap-3 px-6 h-16 rounded-md bg-white shadow-md">
                  <FaMapMarkerAlt className="text-[#f36b32] w-5 h-5" />
                  <input
                    type="text"
                    value={isEditing ? editFromDisplay : (searchSummary?.fromName || '')}
                    onChange={isEditing ? handleFromInputChange : undefined}
                    onFocus={isEditing ? () => setShowFromDropdown(true) : undefined}
                    placeholder="City or airport"
                    readOnly={!isEditing}
                    className={`w-full text-base font-bold outline-none bg-transparent ${!isEditing ? 'cursor-pointer' : ''}`}
                    onClick={!isEditing ? openEditMode : undefined}
                  />
                  {fromLoading && <FaSpinner className="animate-spin text-gray-400" />}
                </div>
                {showFromDropdown && isEditing && fromAirports.length > 0 && (
                  <div className="absolute left-0 top-full w-full bg-white shadow-lg rounded-md max-h-60 overflow-y-auto z-50 border border-gray-100 mt-1">
                    {fromAirports.map((airport) => (
                      <div
                        key={airport.location_code}
                        className="px-4 py-3 hover:bg-gray-100 cursor-pointer text-sm"
                        onClick={() => handleFromSelect(airport)}
                      >
                        <div className="font-medium">{airport.name}</div>
                        <div className="text-xs text-gray-500">{airport.location_code}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Swap Button */}
            <div className="flex justify-center mb-2">
              <button
                onClick={isEditing ? handleSwap : openEditMode}
                className="bg-white w-12 h-12 rounded-full flex items-center justify-center shadow-md hover:scale-110 transition-all duration-300"
              >
                <FaExchangeAlt className="w-5 h-5 text-[#f36b32]" />
              </button>
            </div>

            {/* To Field */}
            <div className="relative" ref={toRef}>
              <p className="text-white text-sm font-bold mb-2">TO</p>
              <div className="relative">
                <div className="flex items-center gap-3 px-6 h-16 rounded-md bg-white shadow-md">
                  <FaMapMarkerAlt className="text-[#f36b32] w-5 h-5" />
                  <input
                    type="text"
                    value={isEditing ? editToDisplay : (searchSummary?.toName || '')}
                    onChange={isEditing ? handleToInputChange : undefined}
                    onFocus={isEditing ? () => setShowToDropdown(true) : undefined}
                    placeholder="City or airport"
                    readOnly={!isEditing}
                    className={`w-full text-base font-bold outline-none bg-transparent ${!isEditing ? 'cursor-pointer' : ''}`}
                    onClick={!isEditing ? openEditMode : undefined}
                  />
                  {toLoading && <FaSpinner className="animate-spin text-gray-400" />}
                </div>
                {showToDropdown && isEditing && toAirports.length > 0 && (
                  <div className="absolute left-0 top-full w-full bg-white shadow-lg rounded-md max-h-60 overflow-y-auto z-50 border border-gray-100 mt-1">
                    {toAirports.map((airport) => (
                      <div
                        key={airport.location_code}
                        className="px-4 py-3 hover:bg-gray-100 cursor-pointer text-sm"
                        onClick={() => handleToSelect(airport)}
                      >
                        <div className="font-medium">{airport.name}</div>
                        <div className="text-xs text-gray-500">{airport.location_code}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Date Field */}
            <div className="relative">
              <p className="text-white text-sm font-bold mb-2">DEPARTURE DATE</p>
              <div
                onClick={isEditing ? () => setShowDepartureCalendar(!showDepartureCalendar) : openEditMode}
                className="flex items-center gap-3 px-6 h-16 rounded-md bg-white shadow-md cursor-pointer"
              >
                <FaCalendarAlt className="text-[#f36b32] w-5 h-5" />
                <input
                  type="text"
                  value={isEditing ? (editDepartureDate ? formatDate(editDepartureDate) : "") : (searchSummary?.formattedDate || '')}
                  placeholder="Select date"
                  readOnly
                  className="w-full text-base font-bold outline-none bg-transparent cursor-pointer"
                />
              </div>
              {showDepartureCalendar && isEditing && (
                <div 
                  ref={departureCalendarRef}
                  className="absolute top-full left-0 mt-2 bg-white rounded-md shadow-xl p-4 w-72 z-50"
                >
                  <div className="flex justify-between items-center mb-3">
                    <button onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))}>
                      <FaChevronLeft className="text-gray-600" />
                    </button>
                    <h2 className="font-semibold text-sm">{monthName} {year}</h2>
                    <button onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))}>
                      <FaChevronRight className="text-gray-600" />
                    </button>
                  </div>
                  <div className="grid grid-cols-7 text-center text-xs text-gray-500 mb-2">
                    {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map(day => <div key={day}>{day}</div>)}
                  </div>
                  <div className="grid grid-cols-7 gap-1 text-center">
                    {[...Array(firstDay)].map((_, i) => <div key={i}></div>)}
                    {[...Array(daysInMonth)].map((_, i) => {
                      const day = i + 1;
                      const isPast = new Date(currentDate.getFullYear(), currentDate.getMonth(), day) < new Date();
                      return (
                        <button
                          key={day}
                          onClick={() => !isPast && handleDateSelect(day)}
                          disabled={isPast}
                          className={`p-2 rounded text-sm ${isPast ? 'text-gray-300' : 'hover:bg-gray-100'}`}
                        >
                          {day}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Travellers Field */}
            <div className="relative" ref={travellerRef}>
              <p className="text-white text-sm font-bold mb-2">TRAVELLERS</p>
              <div
                onClick={isEditing ? openTravellerModalEdit : openEditMode}
                className="flex items-center gap-3 px-6 h-16 rounded-md bg-white shadow-md cursor-pointer"
              >
                <FaUser className="text-[#f36b32] w-5 h-5" />
                <span className="text-base font-bold text-gray-700 flex-1 truncate">
                  {isEditing ? (
                    editPassengers ? `${editPassengers.ADT} Adult${editPassengers.ADT !== 1 ? 's' : ''} · ${editTravelClass}` : 'Select'
                  ) : (
                    passengerText
                  )}
                </span>
                <FaChevronDown className="text-gray-400 w-4 h-4" />
              </div>
            </div>

            {/* Submit Button */}
            <div>
              <button
                onClick={isEditing ? handleEditSearch : openEditMode}
                disabled={isEditing && (!editFrom || !editTo || !editDepartureDate)}
                className="w-[160px] h-16 bg-white text-black font-bold rounded-md shadow-md cursor-pointer transition-all duration-300 hover:text-[#fd561e] hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isEditing ? 'UPDATE SEARCH' : 'MODIFY SEARCH'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ============ CONTENT AREA - Changes based on loading/error/results ============ */}
      
      {/* Loading State - Imported FlightLoadingAnimation component */}
      {isLoading && (
        <FlightLoadingAnimation searchSummary={searchSummary} isLoading={isLoading} />
      )}

      {/* API Error State */}
      {!isLoading && apiError && (
        <div className="min-h-[calc(100vh-200px)] flex items-center justify-center p-4">
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
                <p className="text-xs text-gray-500 mt-1">{searchSummary.formattedDate}</p>
                <p className="text-xs text-gray-500 mt-1">{passengerText} · Economy</p>
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
      )}

      {/* Context Error State */}
      {!isLoading && !apiError && error && (
        <div className="min-h-[calc(100vh-200px)] flex items-center justify-center p-4">
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
      )}

      {/* No Flights State */}
      {!isLoading && !apiError && !error && (!flights || flights.length === 0) && (
        <div className="min-h-[calc(100vh-200px)] flex items-center justify-center p-4">
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
                <p className="text-xs text-gray-500 mt-1">{searchSummary.formattedDate}</p>
                <p className="text-xs text-gray-500 mt-1">{passengerText} · Economy</p>
              </div>
            )}
            <div className="flex gap-3">
              <button
                onClick={handleModifySearch}
                className="flex-1 bg-[#FD561E] hover:bg-[#e04e1b] text-white font-semibold py-3 px-4 rounded-xl transition-all hover:shadow-lg"
              >
                Modify Search
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Flight Results State */}
      {!isLoading && !apiError && !error && flights && flights.length > 0 && (
        <>
          {/* Sort and Filter Bar */}
          

          {/* Main Content */}
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
                      isSelected={false}
                      onSelect={() => {}}
                      onViewDetails={handleViewDetails}
                      passengerCounts={passengerCounts}
                      airlineData={airlinesMap[flight.airlineCode]}
                      airlinesLoading={airlinesLoading}
                    />
                  ))
                )}
              </div>
            </div>
          </div>
        </>
      )}

      {/* OneWaySheet */}
      {showDetailSheet && selectedFlightForSheet && (
        <OneWaySheet 
          isOpen={showDetailSheet}
          onClose={handleCloseSheet}
          flight={selectedFlightForSheet}
          passengerCounts={passengerCounts}
          traceId={flightResults?.traceId}
        />
      )}

      {/* Traveller Modal for Edit Mode */}
      {showTravellerModal && (
        <>
          <div className="fixed inset-0 z-40 bg-black/50" onClick={cancelPassengerChanges} />
          <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 w-96 bg-white rounded-xl shadow-2xl p-5">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold text-gray-900">Select Travellers</h3>
              <button onClick={cancelPassengerChanges} className="text-gray-400 hover:text-gray-600">
                <FaTimes />
              </button>
            </div>
            
            <div className="mb-4 p-3 bg-orange-50 rounded-lg">
              <div className="flex justify-between">
                <span className="text-sm font-medium text-gray-600">Max {maxTravellers} travellers</span>
                <span className={`text-sm font-bold ${tempPassengers.length >= maxTravellers ? "text-red-600" : "text-green-600"}`}>
                  {tempPassengers.length}/{maxTravellers}
                </span>
              </div>
            </div>
            
            <div className="space-y-3 mb-4 max-h-60 overflow-y-auto">
              {tempPassengers.map((p, i) => (
                <div key={i} className="flex gap-2 p-3 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <div className="flex justify-between items-center">
                      <span className="font-medium text-gray-700">
                        {p.code === 'ADT' && 'Adult'}
                        {p.code === 'CNN' && 'Child'}
                        {p.code === 'INF' && 'Infant'}
                      </span>
                      <button onClick={() => removeTempPassenger(i)} className="text-gray-400 hover:text-red-500">
                        <FaTimes className="w-3 h-3" />
                      </button>
                    </div>
                    {(p.code === 'CNN' || p.code === 'INF') && (
                      <select
                        value={p.age || (p.code === 'CNN' ? 8 : 1)}
                        onChange={(e) => updateTempPassengerAge(i, e.target.value)}
                        className="w-full mt-2 px-3 py-2 text-sm border border-gray-200 rounded-lg"
                      >
                        {p.code === 'CNN' && [...Array(10)].map((_, a) => (
                          <option key={a+2} value={a+2}>{a+2} years</option>
                        ))}
                        {p.code === 'INF' && [...Array(3)].map((_, a) => (
                          <option key={a} value={a}>{a} year{a !== 1 ? 's' : ''}</option>
                        ))}
                      </select>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex gap-2 mb-6">
              <button className="flex-1 py-2 text-sm border rounded-lg hover:border-[#FD561E] hover:text-[#FD561E]" onClick={() => addTempPassenger('ADT')} disabled={tempPassengers.length >= maxTravellers}>+ Adult</button>
              <button className="flex-1 py-2 text-sm border rounded-lg hover:border-[#FD561E] hover:text-[#FD561E]" onClick={() => addTempPassenger('CNN')} disabled={tempPassengers.length >= maxTravellers}>+ Child</button>
              <button className="flex-1 py-2 text-sm border rounded-lg hover:border-[#FD561E] hover:text-[#FD561E]" onClick={() => addTempPassenger('INF')} disabled={tempPassengers.length >= maxTravellers}>+ Infant</button>
            </div>

            <div className="mb-6">
              <h4 className="font-medium text-gray-700 mb-3">Travel Class</h4>
              <div className="grid grid-cols-2 gap-2">
                {["Economy", "Premium Economy", "Business", "First"].map(cls => (
                  <button
                    key={cls}
                    className={`py-2 rounded-lg text-sm font-medium ${editTravelClass === cls ? "bg-[#FD561E] text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}
                    onClick={() => setEditTravelClass(cls)}
                  >
                    {cls}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-3">
              <button className="flex-1 bg-gray-100 py-3 rounded-lg font-medium" onClick={cancelPassengerChanges}>Cancel</button>
              <button className="flex-1 bg-[#FD561E] text-white py-3 rounded-lg font-medium" onClick={applyPassengerChanges}>Apply</button>
            </div>
          </div>
        </>
      )}

      {/* Mobile Filters Modal */}
      {showMobileFilters && !isLoading && flights && flights.length > 0 && (
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