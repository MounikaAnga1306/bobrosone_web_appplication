// src/modules/flights/pages/RoundTripPage.jsx

import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useFlightSearchContext } from '../contexts/FlightSearchContext';
import { searchFlights } from '../services/flightSearchService';
import { searchAirports } from '../services/airportSearchService';
import { fetchAirlines } from '../services/airlineService';
import { transformFlightData } from '../utils/flightDataTransformer';
import RoundTripFlightCard from '../components/shared/RoundTripFlightCard';
import BottomBar from '../components/shared/BottomBar';
import RoundTripSheet from '../components/sheet/RoundTripSheet';
import FilterSidebar from '../components/shared/FilterSidebar';
import FlightLoadingAnimation from '../utils/FlightLoadingAnimation';
import {
  FaArrowLeft,
  FaPlane,
  FaExclamationTriangle,
  FaUserFriends,
  FaFilter,
  FaTimes,
  FaChevronDown,
  FaChevronRight,
  FaChevronLeft,
  FaCalendarAlt,
  FaMapMarkerAlt,
  FaInfoCircle,
  FaExchangeAlt,
  FaStar,
  FaShieldAlt,
  FaSpinner,
  FaUser,
  FaEdit,
  FaPencilAlt
} from 'react-icons/fa';

const RoundTripPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { 
    updateFlightResults, 
    flightResults
  } = useFlightSearchContext();

  const [isLoading, setIsLoading] = useState(true);
  const [apiError, setApiError] = useState(null);
  const [searchSummary, setSearchSummary] = useState(null);
  const [passengerCounts, setPassengerCounts] = useState({ ADT: 1, CNN: 0, INF: 0 });
  
  const [airlinesMap, setAirlinesMap] = useState({});
  const [airlinesLoading, setAirlinesLoading] = useState(true);
  
  // ── Edit state (same pattern as OneWayPage) ──────────────────────────────
  const [isEditing, setIsEditing] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const originalSnapshot = useRef(null);

  const [editFrom, setEditFrom] = useState(null);
  const [editTo, setEditTo] = useState(null);
  const [editFromDisplay, setEditFromDisplay] = useState('');
  const [editToDisplay, setEditToDisplay] = useState('');
  const [editDepartureDate, setEditDepartureDate] = useState(null);
  const [editReturnDate, setEditReturnDate] = useState(null);
  const [editPassengers, setEditPassengers] = useState(null);
  const [editTravelClass, setEditTravelClass] = useState('Economy');

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

  const [showDepartureCalendar, setShowDepartureCalendar] = useState(false);
  const [showReturnCalendar, setShowReturnCalendar] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [currentReturnDate, setCurrentReturnDate] = useState(new Date());
  const departureCalendarRef = useRef(null);
  const returnCalendarRef = useRef(null);

  const [showTravellerModal, setShowTravellerModal] = useState(false);
  const [tempPassengers, setTempPassengers] = useState([]);
  const [tempTravelClass, setTempTravelClass] = useState('Economy');
  const maxTravellers = 9;
  const travellerRef = useRef(null);
  
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  const [sortBy, setSortBy] = useState('price-low');
  const [selectedFareTypes, setSelectedFareTypes] = useState([]);
  
  const [priceRange, setPriceRange] = useState({ min: 0, max: 100000 });
  const [selectedAirlines, setSelectedAirlines] = useState([]);
  const [selectedStops, setSelectedStops] = useState([]);
  const [selectedTimes, setSelectedTimes] = useState([]);
  
  const [selectedRoundTrip, setSelectedRoundTrip] = useState({
    outbound: null,
    return: null,
    totalPrice: 0
  });
  
  const [selectedFares, setSelectedFares] = useState({
    outbound: null,
    return: null
  });
  
  const [showDetailSheet, setShowDetailSheet] = useState(false);

  const sortOptions = [
    { value: 'price-low', label: 'Price: Low to High' },
    { value: 'price-high', label: 'Price: High to Low' },
    { value: 'duration', label: 'Duration: Shortest' },
    { value: 'departure', label: 'Departure: Earliest' },
    { value: 'arrival', label: 'Arrival: Earliest' }
  ];

  const fareTypes = [
    { id: 'regular', label: 'Regular', icon: FaStar, color: 'blue' },
    { id: 'student', label: 'Student', icon: FaUserFriends, color: 'green' },
    { id: 'armed', label: 'Armed Forces', icon: FaShieldAlt, color: 'orange' },
    { id: 'senior', label: 'Senior Citizen', icon: FaUserFriends, color: 'purple' }
  ];

  // Helper to truncate airport name to first 2 words + ellipsis
  const truncateAirportName = (name) => {
    if (!name) return '';
    const words = name.trim().split(/\s+/);
    if (words.length <= 2) return name;
    return words.slice(0, 2).join(' ') + '...';
  };

  // ── Date helpers ─────────────────────────────────────────────────────────
  const formatDateDDMMYYYY = (input) => {
    if (!input) return '';
    if (typeof input === 'string' && input.match(/^\d{4}-\d{2}-\d{2}$/)) {
      const [y, m, d] = input.split('-');
      return `${d}-${m}-${y}`;
    }
    const d = new Date(input);
    return `${String(d.getDate()).padStart(2,'0')}-${String(d.getMonth()+1).padStart(2,'0')}-${d.getFullYear()}`;
  };

  const formatDate = (date) => {
    if (!date) return '';
    return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
  };

  const formatDateForAPI = (date) => {
    if (!date) return null;
    const d = new Date(date);
    return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
  };

  const getDaysInMonth = (date) => new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  const getFirstDay = (date) => new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  const monthName = (date) => date.toLocaleString('default', { month: 'long' });
  const yearNum = (date) => date.getFullYear();

  // ── hasChanges watcher (same as OneWayPage) ──────────────────────────────
  const checkHasChanges = useCallback((fromCode, toCode, depDate, retDate, passengers, travelClass) => {
    if (!originalSnapshot.current) return false;
    const orig = originalSnapshot.current;
    const depStr = depDate ? formatDateForAPI(depDate) : null;
    const retStr = retDate ? formatDateForAPI(retDate) : null;
    return (
      fromCode !== orig.fromCode ||
      toCode !== orig.toCode ||
      depStr !== orig.departureDate ||
      retStr !== orig.returnDate ||
      (passengers?.ADT ?? 1) !== orig.adults ||
      (passengers?.CNN ?? 0) !== orig.children ||
      (passengers?.INF ?? 0) !== orig.infants ||
      travelClass !== orig.travelClass
    );
  }, []);

  useEffect(() => {
    if (!isEditing) return;
    const fromCode = editFrom?.code || editFrom?.location_code || '';
    const toCode = editTo?.code || editTo?.location_code || '';
    const changed = checkHasChanges(fromCode, toCode, editDepartureDate, editReturnDate, editPassengers, editTravelClass);
    setHasChanges(changed);
  }, [editFrom, editTo, editDepartureDate, editReturnDate, editPassengers, editTravelClass, isEditing, checkHasChanges]);

  // ── Flight search ─────────────────────────────────────────────────────────
  useEffect(() => {
    const fetchFlightResults = async () => {
      setIsLoading(true);
      setApiError(null);
      
      try {
        const params = new URLSearchParams(location.search);
        const tripType = params.get('tripType');
        
        if (!tripType || tripType !== 'round-trip') {
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
        const returnDate = params.get('returnDate');
        const adults = parseInt(params.get('adults') || '1');
        const children = parseInt(params.get('children') || '0');
        const infants = parseInt(params.get('infants') || '0');
        const travelClass = params.get('class') || 'Economy';
        const fareType = params.get('fareType') || 'regular';
        
        if (!from || !to || !departureDate || !returnDate) {
          navigate('/flights');
          return;
        }
        
        const formattedDeparture = new Date(departureDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
        const formattedReturn = new Date(returnDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
        
        const summary = {
          from: { code: from, name: fromName, city: fromCity },
          to: { code: to, name: toName, city: toCity },
          departureDate: formattedDeparture,
          returnDate: formattedReturn,
          rawDepartureDate: departureDate,
          rawReturnDate: returnDate,
          adults, children, infants, travelClass, fareType,
          fromCode: from, toCode: to, fromName, toName
        };
        
        setSearchSummary(summary);
        setPassengerCounts({ ADT: adults, CNN: children, INF: infants });
        
        const passengers = [];
        for (let i = 0; i < adults; i++) passengers.push({ code: 'ADT' });
        for (let i = 0; i < children; i++) passengers.push({ code: 'CNN', age: 8 });
        for (let i = 0; i < infants; i++) passengers.push({ code: 'INF', age: 1 });
        
        const searchData = {
          tripType: 'round-trip',
          legs: [
            { origin: from, destination: to, departureDate },
            { origin: to, destination: from, departureDate: returnDate }
          ],
          passengers, fareType
        };
        
        const result = await searchFlights(searchData);
        
        if (result.success) {
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
          setApiError(result.error || 'Search failed. Please try again.');
          updateFlightResults({ loading: false, error: result.error || 'Search failed', flights: [], roundTrips: [] });
        }
      } catch (err) {
        setApiError(err.message || 'An unexpected error occurred');
        updateFlightResults({ loading: false, error: err.message, flights: [], roundTrips: [] });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchFlightResults();
  }, [location.search, navigate, updateFlightResults]);

  useEffect(() => {
    const loadAirlines = async () => {
      const allFlights = [...(flightResults.flights || []), ...(flightResults.roundTrips || [])];
      if (!allFlights.length) { setAirlinesLoading(false); return; }
      try {
        setAirlinesLoading(true);
        const airlines = await fetchAirlines();
        const airlinesMapData = {};
        airlines.forEach(airline => { airlinesMapData[airline.code] = airline; });
        setAirlinesMap(airlinesMapData);
      } catch (error) {
        console.error('Failed to load airlines:', error);
      } finally {
        setAirlinesLoading(false);
      }
    };
    loadAirlines();
  }, [flightResults.flights, flightResults.roundTrips]);

  // ── Edit mode helpers ─────────────────────────────────────────────────────
  const openEditMode = () => {
    if (!searchSummary) return;
    originalSnapshot.current = {
      fromCode: searchSummary.fromCode,
      toCode: searchSummary.toCode,
      departureDate: searchSummary.rawDepartureDate,
      returnDate: searchSummary.rawReturnDate,
      adults: passengerCounts.ADT,
      children: passengerCounts.CNN,
      infants: passengerCounts.INF,
      travelClass: searchSummary.travelClass || 'Economy'
    };
    setEditFrom({ code: searchSummary.fromCode, name: searchSummary.fromName, location_code: searchSummary.fromCode });
    setEditTo({ code: searchSummary.toCode, name: searchSummary.toName, location_code: searchSummary.toCode });
    setEditFromDisplay(`${searchSummary.fromName} (${searchSummary.fromCode})`);
    setEditToDisplay(`${searchSummary.toName} (${searchSummary.toCode})`);

    if (searchSummary.rawDepartureDate) {
      const [y, m, d] = searchSummary.rawDepartureDate.split('-').map(Number);
      const parsed = new Date(y, m - 1, d);
      setEditDepartureDate(parsed);
      setCurrentDate(parsed);
    }
    if (searchSummary.rawReturnDate) {
      const [y, m, d] = searchSummary.rawReturnDate.split('-').map(Number);
      const parsed = new Date(y, m - 1, d);
      setEditReturnDate(parsed);
      setCurrentReturnDate(parsed);
    }
    setEditPassengers({ ADT: passengerCounts.ADT, CNN: passengerCounts.CNN, INF: passengerCounts.INF });
    setEditTravelClass(searchSummary.travelClass || 'Economy');
    setHasChanges(false);
    setIsEditing(true);
  };

  const cancelEdit = () => {
    setIsEditing(false);
    setHasChanges(false);
    setShowFromDropdown(false);
    setShowToDropdown(false);
    setShowDepartureCalendar(false);
    setShowReturnCalendar(false);
    setShowTravellerModal(false);
    setFromAirports([]);
    setToAirports([]);
  };

  const handleEditSearch = () => {
    if (!hasChanges || !editFrom || !editTo || !editDepartureDate || !editReturnDate) return;
    if (new Date(editReturnDate) <= new Date(editDepartureDate)) { alert('Return date must be after departure date'); return; }
    const params = new URLSearchParams();
    params.set('tripType', 'round-trip');
    params.set('adults', editPassengers?.ADT || 1);
    params.set('children', editPassengers?.CNN || 0);
    params.set('infants', editPassengers?.INF || 0);
    params.set('class', editTravelClass);
    params.set('fareType', searchSummary?.fareType || 'regular');
    params.set('from', editFrom.code || editFrom.location_code);
    params.set('to', editTo.code || editTo.location_code);
    params.set('fromName', editFrom.name);
    params.set('toName', editTo.name);
    params.set('fromCity', editFrom.city || editFrom.name);
    params.set('toCity', editTo.city || editTo.name);
    params.set('departureDate', formatDateForAPI(editDepartureDate));
    params.set('returnDate', formatDateForAPI(editReturnDate));
    setIsEditing(false);
    setHasChanges(false);
    navigate(`/flights/round-trip?${params.toString()}`);
  };

  // ── Airport search ────────────────────────────────────────────────────────
  const searchAirportsAPI = async (searchTerm, type) => {
    if (searchTerm.length < 3) {
      if (type === 'from') { setFromAirports([]); setFromLoading(false); }
      else { setToAirports([]); setToLoading(false); }
      return;
    }
    try {
      if (type === 'from') { setFromLoading(true); const results = await searchAirports(searchTerm); setFromAirports(results); setFromLoading(false); }
      else { setToLoading(true); const results = await searchAirports(searchTerm); setToAirports(results); setToLoading(false); }
    } catch {
      if (type === 'from') { setFromLoading(false); setFromAirports([]); }
      else { setToLoading(false); setToAirports([]); }
    }
  };

  const debouncedFromSearch = useCallback((value) => {
    if (fromSearchTimeout.current) clearTimeout(fromSearchTimeout.current);
    if (value.length >= 3) fromSearchTimeout.current = setTimeout(() => searchAirportsAPI(value, 'from'), 500);
    else { setFromAirports([]); setFromLoading(false); }
  }, []);

  const debouncedToSearch = useCallback((value) => {
    if (toSearchTimeout.current) clearTimeout(toSearchTimeout.current);
    if (value.length >= 3) toSearchTimeout.current = setTimeout(() => searchAirportsAPI(value, 'to'), 500);
    else { setToAirports([]); setToLoading(false); }
  }, []);

  const handleFromInputChange = (e) => { setEditFromDisplay(e.target.value); setEditFrom(null); debouncedFromSearch(e.target.value); setShowFromDropdown(true); };
  const handleToInputChange = (e) => { setEditToDisplay(e.target.value); setEditTo(null); debouncedToSearch(e.target.value); setShowToDropdown(true); };
  const handleFromSelect = (airport) => { setEditFrom(airport); setEditFromDisplay(`${airport.name} (${airport.location_code})`); setShowFromDropdown(false); setFromAirports([]); };
  const handleToSelect = (airport) => { setEditTo(airport); setEditToDisplay(`${airport.name} (${airport.location_code})`); setShowToDropdown(false); setToAirports([]); };
  const handleSwap = () => { const tf = editFrom, tfd = editFromDisplay; setEditFrom(editTo); setEditFromDisplay(editToDisplay); setEditTo(tf); setEditToDisplay(tfd); };
  const handleDepartureDateSelect = (day) => { setEditDepartureDate(new Date(currentDate.getFullYear(), currentDate.getMonth(), day)); setShowDepartureCalendar(false); };
  const handleReturnDateSelect = (day) => { setEditReturnDate(new Date(currentReturnDate.getFullYear(), currentReturnDate.getMonth(), day)); setShowReturnCalendar(false); };

  // ── Traveller modal ───────────────────────────────────────────────────────
  const openTravellerModalEdit = () => {
    setTempPassengers([
      ...Array(editPassengers?.ADT || 1).fill({ code: 'ADT' }),
      ...Array(editPassengers?.CNN || 0).fill({ code: 'CNN', age: 8 }),
      ...Array(editPassengers?.INF || 0).fill({ code: 'INF', age: 1 })
    ]);
    setTempTravelClass(editTravelClass);
    setShowTravellerModal(true);
  };

  const addTempPassenger = (code) => {
    if (tempPassengers.length >= maxTravellers) return;
    const p = { code };
    if (code === 'CNN') p.age = 8;
    if (code === 'INF') p.age = 1;
    setTempPassengers([...tempPassengers, p]);
  };

  const removeTempPassenger = (index) => setTempPassengers(tempPassengers.filter((_, i) => i !== index));
  const updateTempPassengerAge = (index, age) => setTempPassengers(prev => { const u = [...prev]; u[index] = { ...u[index], age: parseInt(age) }; return u; });

  const applyPassengerChanges = () => {
    if (!tempPassengers.some(p => p.code === 'ADT')) { alert('At least one adult is required'); return; }
    const adults = tempPassengers.filter(p => p.code === 'ADT').length;
    const children = tempPassengers.filter(p => p.code === 'CNN').length;
    const infants = tempPassengers.filter(p => p.code === 'INF').length;
    setEditPassengers({ ADT: adults, CNN: children, INF: infants });
    setEditTravelClass(tempTravelClass);
    setShowTravellerModal(false);
  };

  const cancelPassengerChanges = () => { setTempPassengers([]); setShowTravellerModal(false); };

  // ── passenger display text ────────────────────────────────────────────────
  const passengerText = useMemo(() => {
    const parts = [];
    if (passengerCounts.ADT > 0) parts.push(`${passengerCounts.ADT} Adult${passengerCounts.ADT > 1 ? 's' : ''}`);
    if (passengerCounts.CNN > 0) parts.push(`${passengerCounts.CNN} Child${passengerCounts.CNN > 1 ? 'ren' : ''}`);
    if (passengerCounts.INF > 0) parts.push(`${passengerCounts.INF} Infant${passengerCounts.INF > 1 ? 's' : ''}`);
    return parts.join(', ');
  }, [passengerCounts]);

  const editPassengerText = useMemo(() => {
    if (!editPassengers) return '';
    const parts = [];
    if ((editPassengers.ADT || 0) > 0) parts.push(`${editPassengers.ADT} Adult${editPassengers.ADT > 1 ? 's' : ''}`);
    if ((editPassengers.CNN || 0) > 0) parts.push(`${editPassengers.CNN} Child${editPassengers.CNN > 1 ? 'ren' : ''}`);
    if ((editPassengers.INF || 0) > 0) parts.push(`${editPassengers.INF} Infant${editPassengers.INF > 1 ? 's' : ''}`);
    return `${parts.join(', ')} · ${editTravelClass}`;
  }, [editPassengers, editTravelClass]);

  // ── Click-outside handler ─────────────────────────────────────────────────
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (fromRef.current && !fromRef.current.contains(event.target)) setShowFromDropdown(false);
      if (toRef.current && !toRef.current.contains(event.target)) setShowToDropdown(false);
      if (departureCalendarRef.current && !departureCalendarRef.current.contains(event.target)) setShowDepartureCalendar(false);
      if (returnCalendarRef.current && !returnCalendarRef.current.contains(event.target)) setShowReturnCalendar(false);
      if (travellerRef.current && !travellerRef.current.contains(event.target)) { setShowTravellerModal(false); setTempPassengers([]); }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // ── Filter / sort helpers ─────────────────────────────────────────────────
  const { outboundFlights, returnFlights, combinations } = useMemo(() => transformFlightData(flightResults), [flightResults]);

  const filteredOutbound = useMemo(() => {
    let filtered = [...outboundFlights];
    if (priceRange.min > 0 || priceRange.max < 100000) filtered = filtered.filter(f => { const price = f.lowestPrice || f.price || 0; return price >= priceRange.min && price <= priceRange.max; });
    if (selectedAirlines.length > 0) filtered = filtered.filter(f => selectedAirlines.includes(f.airline));
    if (selectedStops.length > 0) filtered = filtered.filter(f => { const stops = f.stops || 0; if (selectedStops.includes('non-stop') && stops === 0) return true; if (selectedStops.includes('1-stop') && stops === 1) return true; if (selectedStops.includes('2+ stops') && stops >= 2) return true; return false; });
    if (selectedTimes.length > 0) filtered = filtered.filter(f => { const hour = new Date(f.departureTime).getHours(); if (selectedTimes.includes('early-morning') && hour >= 0 && hour < 6) return true; if (selectedTimes.includes('morning') && hour >= 6 && hour < 12) return true; if (selectedTimes.includes('afternoon') && hour >= 12 && hour < 18) return true; if (selectedTimes.includes('evening') && hour >= 18 && hour <= 23) return true; return false; });
    switch (sortBy) {
      case 'price-low': filtered.sort((a, b) => (a.lowestPrice || a.price || 0) - (b.lowestPrice || b.price || 0)); break;
      case 'price-high': filtered.sort((a, b) => (b.lowestPrice || b.price || 0) - (a.lowestPrice || a.price || 0)); break;
      case 'duration': filtered.sort((a, b) => (a.duration || 0) - (b.duration || 0)); break;
      case 'departure': filtered.sort((a, b) => new Date(a.departureTime) - new Date(b.departureTime)); break;
    }
    return filtered;
  }, [outboundFlights, priceRange, selectedAirlines, selectedStops, selectedTimes, sortBy]);

  const filteredReturn = useMemo(() => {
    let filtered = [...returnFlights];
    if (priceRange.min > 0 || priceRange.max < 100000) filtered = filtered.filter(f => { const price = f.lowestPrice || f.price || 0; return price >= priceRange.min && price <= priceRange.max; });
    if (selectedAirlines.length > 0) filtered = filtered.filter(f => selectedAirlines.includes(f.airline));
    if (selectedStops.length > 0) filtered = filtered.filter(f => { const stops = f.stops || 0; if (selectedStops.includes('non-stop') && stops === 0) return true; if (selectedStops.includes('1-stop') && stops === 1) return true; if (selectedStops.includes('2+ stops') && stops >= 2) return true; return false; });
    if (selectedTimes.length > 0) filtered = filtered.filter(f => { const hour = new Date(f.departureTime).getHours(); if (selectedTimes.includes('early-morning') && hour >= 0 && hour < 6) return true; if (selectedTimes.includes('morning') && hour >= 6 && hour < 12) return true; if (selectedTimes.includes('afternoon') && hour >= 12 && hour < 18) return true; if (selectedTimes.includes('evening') && hour >= 18 && hour <= 23) return true; return false; });
    filtered.sort((a, b) => new Date(a.departureTime) - new Date(b.departureTime));
    return filtered;
  }, [returnFlights, priceRange, selectedAirlines, selectedStops, selectedTimes]);

  const handleFlightSelect = (flight, legType) => {
    setSelectedRoundTrip(prev => {
      const newSelection = { ...prev, [legType]: flight };
      const outboundPrice = newSelection.outbound?.lowestPrice || newSelection.outbound?.price || 0;
      const returnPrice = newSelection.return?.lowestPrice || newSelection.return?.price || 0;
      return { ...newSelection, totalPrice: outboundPrice + returnPrice };
    });
  };

  const handleContinue = () => { if (selectedRoundTrip.outbound && selectedRoundTrip.return) setShowDetailSheet(true); };
  const handleCloseSheet = () => setShowDetailSheet(false);
  const handleFaresSelected = (outboundFare, returnFare) => setSelectedFares({ outbound: outboundFare, return: returnFare });

  const resetFilters = () => { setPriceRange({ min: 0, max: 100000 }); setSelectedAirlines([]); setSelectedStops([]); setSelectedTimes([]); setSelectedFareTypes([]); };

  const getPriceRange = useMemo(() => {
    const allPrices = [...outboundFlights.map(f => f.lowestPrice || f.price || 0), ...returnFlights.map(f => f.lowestPrice || f.price || 0)].filter(p => p > 0);
    return { min: allPrices.length ? Math.min(...allPrices) : 0, max: allPrices.length ? Math.max(...allPrices) : 100000 };
  }, [outboundFlights, returnFlights]);

  const airlines = useMemo(() => {
    const airlineMap = new Map();
    [...outboundFlights, ...returnFlights].forEach(f => { if (f.airline) { const current = airlineMap.get(f.airline) || { name: f.airline, code: f.airlineCode, count: 0 }; current.count += 1; airlineMap.set(f.airline, current); } });
    return Array.from(airlineMap.values());
  }, [outboundFlights, returnFlights]);

  const activeFilterCount = selectedAirlines.length + selectedStops.length + selectedTimes.length + selectedFareTypes.length + (priceRange.min !== getPriceRange.min || priceRange.max !== getPriceRange.max ? 1 : 0);

  // ============================================================
  // DESKTOP SEARCH BAR — render function (not component) so isEditing re-renders work
  // ============================================================
  const renderDesktopBar = () => (
    <div className="hidden lg:block w-full bg-[#f36b32] py-4 sticky top-0 z-40 shadow-md flight-search-bar">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr_auto_1fr_auto_1fr_auto] lg:grid-cols-[1fr_auto_1fr_160px_160px_200px_auto] items-end gap-4">
          <div className="relative" ref={fromRef}>
            <p className="text-white text-sm font-bold mb-2">FROM</p>
            <div className="relative">
              <div className="flex items-center gap-3 px-6 h-16 rounded-md bg-white shadow-md">
                <FaMapMarkerAlt className="text-[#f36b32] w-5 h-5" />
                <input type="text" value={isEditing ? editFromDisplay : (searchSummary?.fromName || '')} onChange={isEditing ? handleFromInputChange : undefined} onFocus={isEditing ? () => setShowFromDropdown(true) : undefined} placeholder="City or airport" readOnly={!isEditing} className={`w-full text-base font-bold outline-none bg-transparent ${!isEditing ? 'cursor-pointer' : ''}`} onClick={!isEditing ? openEditMode : undefined} />
                {fromLoading && <FaSpinner className="animate-spin text-gray-400" />}
              </div>
              {showFromDropdown && isEditing && fromAirports.length > 0 && (
                <div className="absolute left-0 top-full w-full bg-white shadow-lg rounded-md max-h-60 overflow-y-auto z-50 border border-gray-100 mt-1">
                  {fromAirports.map(airport => (<div key={airport.location_code} className="px-4 py-3 hover:bg-gray-100 cursor-pointer text-sm" onClick={() => handleFromSelect(airport)}><div className="font-medium">{airport.name}</div><div className="text-xs text-gray-500">{airport.location_code}</div></div>))}
                </div>
              )}
            </div>
          </div>
          <div className="flex justify-center mb-2">
            <button onClick={isEditing ? handleSwap : openEditMode} className="bg-white w-12 h-12 rounded-full flex items-center justify-center shadow-md hover:scale-110 transition-all duration-300">
              <FaExchangeAlt className="w-5 h-5 text-[#f36b32]" />
            </button>
          </div>
          <div className="relative" ref={toRef}>
            <p className="text-white text-sm font-bold mb-2">TO</p>
            <div className="relative">
              <div className="flex items-center gap-3 px-6 h-16 rounded-md bg-white shadow-md">
                <FaMapMarkerAlt className="text-[#f36b32] w-5 h-5" />
                <input type="text" value={isEditing ? editToDisplay : (searchSummary?.toName || '')} onChange={isEditing ? handleToInputChange : undefined} onFocus={isEditing ? () => setShowToDropdown(true) : undefined} placeholder="City or airport" readOnly={!isEditing} className={`w-full text-base font-bold outline-none bg-transparent ${!isEditing ? 'cursor-pointer' : ''}`} onClick={!isEditing ? openEditMode : undefined} />
                {toLoading && <FaSpinner className="animate-spin text-gray-400" />}
              </div>
              {showToDropdown && isEditing && toAirports.length > 0 && (
                <div className="absolute left-0 top-full w-full bg-white shadow-lg rounded-md max-h-60 overflow-y-auto z-50 border border-gray-100 mt-1">
                  {toAirports.map(airport => (<div key={airport.location_code} className="px-4 py-3 hover:bg-gray-100 cursor-pointer text-sm" onClick={() => handleToSelect(airport)}><div className="font-medium">{airport.name}</div><div className="text-xs text-gray-500">{airport.location_code}</div></div>))}
                </div>
              )}
            </div>
          </div>
          <div className="relative">
            <p className="text-white text-sm font-bold mb-2">DEPARTURE</p>
            <div onClick={isEditing ? () => setShowDepartureCalendar(!showDepartureCalendar) : openEditMode} className="flex items-center gap-3 px-6 h-16 rounded-md bg-white shadow-md cursor-pointer">
              <FaCalendarAlt className="text-[#f36b32] w-5 h-5" />
              <input type="text" value={isEditing ? (editDepartureDate ? formatDate(editDepartureDate) : '') : (searchSummary?.departureDate || '')} placeholder="Select date" readOnly className="w-full text-base font-bold outline-none bg-transparent cursor-pointer" />
            </div>
            {showDepartureCalendar && isEditing && (
              <div ref={departureCalendarRef} className="absolute top-full left-0 mt-2 bg-white rounded-md shadow-xl p-4 w-72 z-50">
                <div className="flex justify-between items-center mb-3">
                  <button onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))}><FaChevronLeft className="text-gray-600" /></button>
                  <h2 className="font-semibold text-sm">{monthName(currentDate)} {yearNum(currentDate)}</h2>
                  <button onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))}><FaChevronRight className="text-gray-600" /></button>
                </div>
                <div className="grid grid-cols-7 text-center text-xs text-gray-500 mb-2">{['Su','Mo','Tu','We','Th','Fr','Sa'].map(day => <div key={day}>{day}</div>)}</div>
                <div className="grid grid-cols-7 gap-1 text-center">
                  {[...Array(getFirstDay(currentDate))].map((_, i) => <div key={i}></div>)}
                  {[...Array(getDaysInMonth(currentDate))].map((_, i) => { const day = i+1; const isPast = new Date(currentDate.getFullYear(), currentDate.getMonth(), day) < new Date(new Date().setHours(0,0,0,0)); const isSel = editDepartureDate && editDepartureDate.getDate() === day && editDepartureDate.getMonth() === currentDate.getMonth(); return <button key={day} onClick={() => !isPast && handleDepartureDateSelect(day)} disabled={isPast} className={`p-2 rounded text-sm ${isSel ? 'bg-[#FD561E] text-white' : isPast ? 'text-gray-300 cursor-not-allowed' : 'hover:bg-gray-100'}`}>{day}</button>; })}
                </div>
              </div>
            )}
          </div>
          <div className="relative">
            <p className="text-white text-sm font-bold mb-2">RETURN</p>
            <div onClick={isEditing ? () => setShowReturnCalendar(!showReturnCalendar) : openEditMode} className="flex items-center gap-3 px-6 h-16 rounded-md bg-white shadow-md cursor-pointer">
              <FaCalendarAlt className="text-[#f36b32] w-5 h-5" />
              <input type="text" value={isEditing ? (editReturnDate ? formatDate(editReturnDate) : '') : (searchSummary?.returnDate || '')} placeholder="Select date" readOnly className="w-full text-base font-bold outline-none bg-transparent cursor-pointer" />
            </div>
            {showReturnCalendar && isEditing && (
              <div ref={returnCalendarRef} className="absolute top-full left-0 mt-2 bg-white rounded-md shadow-xl p-4 w-72 z-50">
                <div className="flex justify-between items-center mb-3">
                  <button onClick={() => setCurrentReturnDate(new Date(currentReturnDate.getFullYear(), currentReturnDate.getMonth() - 1, 1))}><FaChevronLeft className="text-gray-600" /></button>
                  <h2 className="font-semibold text-sm">{monthName(currentReturnDate)} {yearNum(currentReturnDate)}</h2>
                  <button onClick={() => setCurrentReturnDate(new Date(currentReturnDate.getFullYear(), currentReturnDate.getMonth() + 1, 1))}><FaChevronRight className="text-gray-600" /></button>
                </div>
                <div className="grid grid-cols-7 text-center text-xs text-gray-500 mb-2">{['Su','Mo','Tu','We','Th','Fr','Sa'].map(day => <div key={day}>{day}</div>)}</div>
                <div className="grid grid-cols-7 gap-1 text-center">
                  {[...Array(getFirstDay(currentReturnDate))].map((_, i) => <div key={i}></div>)}
                  {[...Array(getDaysInMonth(currentReturnDate))].map((_, i) => { const day = i+1; const isPast = new Date(currentReturnDate.getFullYear(), currentReturnDate.getMonth(), day) < new Date(new Date().setHours(0,0,0,0)); const isSel = editReturnDate && editReturnDate.getDate() === day && editReturnDate.getMonth() === currentReturnDate.getMonth(); return <button key={day} onClick={() => !isPast && handleReturnDateSelect(day)} disabled={isPast} className={`p-2 rounded text-sm ${isSel ? 'bg-[#FD561E] text-white' : isPast ? 'text-gray-300 cursor-not-allowed' : 'hover:bg-gray-100'}`}>{day}</button>; })}
                </div>
              </div>
            )}
          </div>
          <div className="relative" ref={travellerRef}>
            <p className="text-white text-sm font-bold mb-2">TRAVELLERS</p>
            <div onClick={isEditing ? openTravellerModalEdit : openEditMode} className="flex items-center gap-3 px-6 h-16 rounded-md bg-white shadow-md cursor-pointer">
              <FaUser className="text-[#f36b32] w-5 h-5" />
              <span className="text-base font-bold text-gray-700 flex-1 truncate">{isEditing ? (editPassengers ? `${editPassengers.ADT} Adult${editPassengers.ADT !== 1 ? 's' : ''} · ${editTravelClass}` : 'Select') : passengerText}</span>
              <FaChevronDown className="text-gray-400 w-4 h-4" />
            </div>
          </div>
          <div>
            <button
              onClick={isEditing ? handleEditSearch : openEditMode}
              disabled={isEditing && !hasChanges}
              className={`w-[160px] h-16 font-bold rounded-md shadow-md transition-all duration-300 ${isEditing && !hasChanges ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-white text-black cursor-pointer hover:text-[#fd561e] hover:shadow-lg'}`}
            >
              MODIFY SEARCH
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  // ============================================================
  // MOBILE SEARCH BAR — render function (not component) so isEditing re-renders work
  // ============================================================
  const renderMobileBar = () => (
    <div className="lg:hidden w-full bg-white border-b border-gray-100 sticky top-0 z-40 shadow-sm">
      {/* ── Collapsed summary bar ── */}
      {!isEditing && (
        <div className="flex items-center gap-3 px-4 h-14">
          <button onClick={() => navigate('/flights')} className="p-1 text-gray-500 hover:text-[#FD561E] flex-shrink-0">
            <FaArrowLeft className="w-4 h-4" />
          </button>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-gray-800 truncate">
              {searchSummary?.fromName} → {searchSummary?.toName}
            </p>
            <p className="text-xs text-gray-500 truncate">
              {searchSummary?.departureDate} → {searchSummary?.returnDate} · {passengerText} · {searchSummary?.travelClass}
            </p>
          </div>
          <button onClick={openEditMode} className="p-2 text-[#FD561E] hover:bg-orange-50 rounded-full flex-shrink-0">
            <FaPencilAlt className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* ── Expanded inline edit form (same style as OneWayPage) ── */}
      {isEditing && (
        <div className="px-4 py-3">
          {/* Header row */}
          <div className="flex items-center justify-between mb-4">
            <button onClick={cancelEdit} className="flex items-center gap-2 text-sm font-semibold text-gray-700">
              <FaArrowLeft className="w-3 h-3" /> Modify Search
            </button>
            <button onClick={cancelEdit} className="p-1 text-gray-400 hover:text-gray-600">
              <FaTimes className="w-4 h-4" />
            </button>
          </div>

          {/* FROM */}
          <div className="relative mb-1" ref={fromRef}>
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-1">From</label>
            <div className="flex items-center border border-gray-200 rounded-xl px-3 h-12 bg-gray-50 mt-1 focus-within:border-[#FD561E] focus-within:bg-white transition-all">
              <FaMapMarkerAlt className="text-gray-400 w-3.5 h-3.5 flex-shrink-0 mr-2" />
              <input
                type="text"
                value={editFromDisplay}
                onChange={handleFromInputChange}
                onFocus={() => setShowFromDropdown(true)}
                placeholder="City or airport"
                className="w-full text-sm font-semibold outline-none bg-transparent"
              />
              {fromLoading && <FaSpinner className="animate-spin text-gray-400 w-3.5 h-3.5 flex-shrink-0" />}
            </div>
            {showFromDropdown && fromAirports.length > 0 && (
              <div className="absolute left-0 top-full w-full bg-white shadow-xl rounded-xl max-h-52 overflow-y-auto z-50 border border-gray-100 mt-1">
                {fromAirports.map(a => (
                  <div key={a.location_code} className="px-4 py-3 hover:bg-orange-50 cursor-pointer border-b border-gray-50 last:border-0" onClick={() => handleFromSelect(a)}>
                    <div className="text-sm font-semibold text-gray-800">{a.name}</div>
                    <div className="text-xs text-gray-400">{a.location_code}</div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* SWAP */}
          <div className="flex justify-center my-1 relative z-10">
            <button onClick={handleSwap} className="bg-white border border-gray-200 w-8 h-8 rounded-full flex items-center justify-center shadow-sm hover:border-[#FD561E] hover:text-[#FD561E] transition-all">
              <FaExchangeAlt className="w-3 h-3 rotate-90" />
            </button>
          </div>

          {/* TO */}
          <div className="relative mb-3" ref={toRef}>
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-1">To</label>
            <div className="flex items-center border border-gray-200 rounded-xl px-3 h-12 bg-gray-50 mt-1 focus-within:border-[#FD561E] focus-within:bg-white transition-all">
              <FaMapMarkerAlt className="text-gray-400 w-3.5 h-3.5 flex-shrink-0 mr-2" />
              <input
                type="text"
                value={editToDisplay}
                onChange={handleToInputChange}
                onFocus={() => setShowToDropdown(true)}
                placeholder="City or airport"
                className="w-full text-sm font-semibold outline-none bg-transparent"
              />
              {toLoading && <FaSpinner className="animate-spin text-gray-400 w-3.5 h-3.5 flex-shrink-0" />}
            </div>
            {showToDropdown && toAirports.length > 0 && (
              <div className="absolute left-0 top-full w-full bg-white shadow-xl rounded-xl max-h-52 overflow-y-auto z-50 border border-gray-100 mt-1">
                {toAirports.map(a => (
                  <div key={a.location_code} className="px-4 py-3 hover:bg-orange-50 cursor-pointer border-b border-gray-50 last:border-0" onClick={() => handleToSelect(a)}>
                    <div className="text-sm font-semibold text-gray-800">{a.name}</div>
                    <div className="text-xs text-gray-400">{a.location_code}</div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* DEPARTURE DATE */}
          <div className="relative mb-3">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-1">Departure Date</label>
            <div
              onClick={() => { setShowReturnCalendar(false); setShowDepartureCalendar(!showDepartureCalendar); }}
              className="flex items-center border border-gray-200 rounded-xl px-3 h-12 bg-gray-50 mt-1 cursor-pointer hover:border-[#FD561E] hover:bg-white transition-all"
            >
              <FaCalendarAlt className="text-gray-400 w-3.5 h-3.5 flex-shrink-0 mr-2" />
              <span className="text-sm font-semibold text-gray-800 flex-1">
                {editDepartureDate ? formatDateDDMMYYYY(editDepartureDate) : 'Select date'}
              </span>
            </div>
            {showDepartureCalendar && (
              <div ref={departureCalendarRef} className="absolute left-0 top-full mt-2 bg-white rounded-2xl shadow-xl p-4 w-full z-50 border border-gray-100">
                <div className="flex justify-between items-center mb-3">
                  <button onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))} className="p-2 hover:bg-gray-100 rounded-lg"><FaChevronLeft className="text-gray-600 w-3 h-3" /></button>
                  <h2 className="font-semibold text-sm">{monthName(currentDate)} {yearNum(currentDate)}</h2>
                  <button onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))} className="p-2 hover:bg-gray-100 rounded-lg"><FaChevronRight className="text-gray-600 w-3 h-3" /></button>
                </div>
                <div className="grid grid-cols-7 text-center text-xs text-gray-400 mb-2">{['Su','Mo','Tu','We','Th','Fr','Sa'].map(d => <div key={d}>{d}</div>)}</div>
                <div className="grid grid-cols-7 gap-1 text-center">
                  {[...Array(getFirstDay(currentDate))].map((_, i) => <div key={i}></div>)}
                  {[...Array(getDaysInMonth(currentDate))].map((_, i) => {
                    const day = i + 1;
                    const isPast = new Date(currentDate.getFullYear(), currentDate.getMonth(), day) < new Date(new Date().setHours(0,0,0,0));
                    const isSel = editDepartureDate && editDepartureDate.getDate() === day && editDepartureDate.getMonth() === currentDate.getMonth() && editDepartureDate.getFullYear() === currentDate.getFullYear();
                    return (
                      <button key={day} onClick={() => !isPast && handleDepartureDateSelect(day)} disabled={isPast}
                        className={`py-2 rounded-lg text-sm transition-colors ${isSel ? 'bg-[#FD561E] text-white font-semibold' : isPast ? 'text-gray-300 cursor-not-allowed' : 'hover:bg-orange-100 text-gray-700'}`}>
                        {day}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* RETURN DATE */}
          <div className="relative mb-3">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-1">Return Date</label>
            <div
              onClick={() => { setShowDepartureCalendar(false); setShowReturnCalendar(!showReturnCalendar); }}
              className="flex items-center border border-gray-200 rounded-xl px-3 h-12 bg-gray-50 mt-1 cursor-pointer hover:border-[#FD561E] hover:bg-white transition-all"
            >
              <FaCalendarAlt className="text-gray-400 w-3.5 h-3.5 flex-shrink-0 mr-2" />
              <span className="text-sm font-semibold text-gray-800 flex-1">
                {editReturnDate ? formatDateDDMMYYYY(editReturnDate) : 'Select date'}
              </span>
            </div>
            {showReturnCalendar && (
              <div ref={returnCalendarRef} className="absolute left-0 top-full mt-2 bg-white rounded-2xl shadow-xl p-4 w-full z-50 border border-gray-100">
                <div className="flex justify-between items-center mb-3">
                  <button onClick={() => setCurrentReturnDate(new Date(currentReturnDate.getFullYear(), currentReturnDate.getMonth() - 1, 1))} className="p-2 hover:bg-gray-100 rounded-lg"><FaChevronLeft className="text-gray-600 w-3 h-3" /></button>
                  <h2 className="font-semibold text-sm">{monthName(currentReturnDate)} {yearNum(currentReturnDate)}</h2>
                  <button onClick={() => setCurrentReturnDate(new Date(currentReturnDate.getFullYear(), currentReturnDate.getMonth() + 1, 1))} className="p-2 hover:bg-gray-100 rounded-lg"><FaChevronRight className="text-gray-600 w-3 h-3" /></button>
                </div>
                <div className="grid grid-cols-7 text-center text-xs text-gray-400 mb-2">{['Su','Mo','Tu','We','Th','Fr','Sa'].map(d => <div key={d}>{d}</div>)}</div>
                <div className="grid grid-cols-7 gap-1 text-center">
                  {[...Array(getFirstDay(currentReturnDate))].map((_, i) => <div key={i}></div>)}
                  {[...Array(getDaysInMonth(currentReturnDate))].map((_, i) => {
                    const day = i + 1;
                    const isPast = new Date(currentReturnDate.getFullYear(), currentReturnDate.getMonth(), day) < new Date(new Date().setHours(0,0,0,0));
                    const isSel = editReturnDate && editReturnDate.getDate() === day && editReturnDate.getMonth() === currentReturnDate.getMonth() && editReturnDate.getFullYear() === currentReturnDate.getFullYear();
                    return (
                      <button key={day} onClick={() => !isPast && handleReturnDateSelect(day)} disabled={isPast}
                        className={`py-2 rounded-lg text-sm transition-colors ${isSel ? 'bg-[#FD561E] text-white font-semibold' : isPast ? 'text-gray-300 cursor-not-allowed' : 'hover:bg-orange-100 text-gray-700'}`}>
                        {day}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* TRAVELLERS & CLASS */}
          <div className="relative mb-5" ref={travellerRef}>
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-1">Travellers & Class</label>
            <div onClick={openTravellerModalEdit} className="flex items-center border border-gray-200 rounded-xl px-3 h-12 bg-gray-50 mt-1 cursor-pointer hover:border-[#FD561E] hover:bg-white transition-all">
              <FaUser className="text-gray-400 w-3.5 h-3.5 flex-shrink-0 mr-2" />
              <span className="text-sm font-semibold text-gray-800 flex-1 truncate">{editPassengerText}</span>
              <FaChevronDown className="text-gray-400 w-3 h-3 flex-shrink-0" />
            </div>
          </div>

          {/* SUBMIT */}
          <button
            onClick={handleEditSearch}
            disabled={!hasChanges}
            className={`w-full h-12 rounded-xl font-bold text-sm tracking-wide transition-all duration-200 ${hasChanges ? 'bg-[#FD561E] text-white shadow-md cursor-pointer hover:bg-[#e04e1b]' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}
          >
            MODIFY SEARCH
          </button>
        </div>
      )}
    </div>
  );

  // ── Loading / error states ────────────────────────────────────────────────
  if (isLoading) {
    return (
      <FlightLoadingAnimation searchSummary={{ fromCode: searchSummary?.fromCode, fromName: searchSummary?.fromName, toCode: searchSummary?.toCode, toName: searchSummary?.toName, formattedDate: `Departure: ${searchSummary?.departureDate} | Return: ${searchSummary?.returnDate}` }} isLoading={isLoading} />
    );
  }

  if (apiError) {
    return (
      <div className="min-h-screen bg-gray-50">
        {renderDesktopBar()}
        {renderMobileBar()}
        <div className="flex items-center justify-center p-4 min-h-[calc(100vh-200px)]">
          <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8 text-center">
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4"><FaExclamationTriangle className="text-3xl text-red-500" /></div>
            <h2 className="text-2xl font-bold text-gray-800 mb-3">Search Failed</h2>
            <p className="text-gray-600 mb-4">{apiError}</p>
            {searchSummary && (<div className="bg-gray-50 p-3 rounded-lg mb-6 text-left"><p className="text-sm text-gray-600">Your search:</p><p className="font-medium text-sm mt-1">{searchSummary.fromName} → {searchSummary.toName}</p><p className="text-xs text-gray-500 mt-1">{searchSummary.departureDate} → {searchSummary.returnDate}</p></div>)}
            <div className="flex gap-3">
              <button onClick={() => window.location.reload()} className="flex-1 bg-gray-100 text-gray-700 font-semibold py-3 px-4 rounded-xl hover:bg-gray-200 transition-colors">Try Again</button>
              <button onClick={() => navigate('/flights')} className="flex-1 bg-[#FD561E] hover:bg-[#e04e1b] text-white font-semibold py-3 px-4 rounded-xl transition-all hover:shadow-lg">Modify Search</button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!isLoading && !apiError && (!outboundFlights.length || !returnFlights.length)) {
    return (
      <div className="min-h-screen bg-gray-50">
        {renderDesktopBar()}
        {renderMobileBar()}
        <div className="flex items-center justify-center p-4 min-h-[calc(100vh-200px)]">
          <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8 text-center">
            <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4"><FaPlane className="text-3xl text-blue-500" /></div>
            <h2 className="text-2xl font-bold text-gray-800 mb-3">No Flights Found</h2>
            <p className="text-gray-600 mb-4">We couldn't find any flights matching your search criteria.</p>
            {searchSummary && (<div className="bg-gray-50 p-3 rounded-lg mb-6 text-left"><p className="text-sm text-gray-600">You searched for:</p><p className="font-medium text-sm mt-1">{searchSummary.fromName} → {searchSummary.toName}</p><p className="text-xs text-gray-500 mt-1">{searchSummary.departureDate} → {searchSummary.returnDate}</p></div>)}
            <button onClick={() => navigate('/flights')} className="w-full bg-[#FD561E] hover:bg-[#e04e1b] text-white font-semibold py-3 px-4 rounded-xl transition-all hover:shadow-lg">Modify Search</button>
          </div>
        </div>
      </div>
    );
  }

  // ── Main render ───────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-50">
      {renderDesktopBar()}
      {renderMobileBar()}

  
 
      {/* Search Bar - Always Visible */}
      

      {/* Fare Type Selection */}
      
      
      {/* Results Stats and Sort Bar */}
      

      {/* Main Content */}
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col lg:flex-row gap-6">
          <div className="hidden lg:block lg:w-1/4">
            <FilterSidebar priceRange={priceRange} setPriceRange={setPriceRange} selectedAirlines={selectedAirlines} toggleAirline={(airline) => { setSelectedAirlines(prev => prev.includes(airline) ? prev.filter(a => a !== airline) : [...prev, airline]); }} selectedStops={selectedStops} toggleStops={(stop) => { setSelectedStops(prev => prev.includes(stop) ? prev.filter(s => s !== stop) : [...prev, stop]); }} selectedTimes={selectedTimes} toggleTime={(time) => { setSelectedTimes(prev => prev.includes(time) ? prev.filter(t => t !== time) : [...prev, time]); }} resetFilters={resetFilters} activeFilterCount={activeFilterCount} airlines={airlines} flightPriceRange={getPriceRange} tripType="round-trip" />
          </div>

          <div className="lg:w-3/4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

              {/* Outbound Column */}
              <div>
                <div className="bg-blue-50 rounded-t-xl p-3 mb-4 sticky top-14 lg:top-24 z-10">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <FaPlane className="text-blue-600 rotate-45" size={14} />
                      <div className="font-semibold text-blue-800 text-base">
                        {searchSummary?.fromCode} → {searchSummary?.toCode}
                      </div>
                    </div>
                    {selectedRoundTrip.outbound && (
                      <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">Selected</span>
                    )}
                  </div>
                  <div className="text-xs text-blue-600 mt-1 truncate max-w-full" title={`${searchSummary?.fromName} → ${searchSummary?.toName}`}>
                    {truncateAirportName(searchSummary?.fromName)} → {truncateAirportName(searchSummary?.toName)}
                  </div>
                </div>
                <div className="space-y-4">
                  {filteredOutbound.map(flight => (
                    <RoundTripFlightCard key={flight.id} flight={flight} isSelected={selectedRoundTrip.outbound?.id === flight.id} onSelect={() => handleFlightSelect(flight, 'outbound')} legIndex={0} airlineData={airlinesMap[flight.airlineCode]} airlinesLoading={airlinesLoading} />
                  ))}
                </div>
              </div>

              {/* Return Column */}
              <div>
                <div className="bg-green-50 rounded-t-xl p-3 mb-4 sticky top-14 lg:top-24 z-10">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <FaPlane className="text-green-600 -rotate-45" size={14} />
                      <div className="font-semibold text-green-800 text-base">
                        {searchSummary?.toCode} → {searchSummary?.fromCode}
                      </div>
                    </div>
                    {selectedRoundTrip.return && (
                      <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">Selected</span>
                    )}
                  </div>
                  <div className="text-xs text-green-600 mt-1 truncate max-w-full" title={`${searchSummary?.toName} → ${searchSummary?.fromName}`}>
                    {truncateAirportName(searchSummary?.toName)} → {truncateAirportName(searchSummary?.fromName)}
                  </div>
                </div>
                <div className="space-y-4">
                  {filteredReturn.map(flight => (
                    <RoundTripFlightCard key={flight.id} flight={flight} isSelected={selectedRoundTrip.return?.id === flight.id} onSelect={() => handleFlightSelect(flight, 'return')} legIndex={1} airlineData={airlinesMap[flight.airlineCode]} airlinesLoading={airlinesLoading} />
                  ))}
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>

      {selectedRoundTrip.outbound && selectedRoundTrip.return && (
        <BottomBar selectedFlights={[selectedRoundTrip.outbound, selectedRoundTrip.return]} totalPrice={selectedRoundTrip.totalPrice} onContinue={handleContinue} type="round-trip" passengerCount={passengerCounts.ADT + passengerCounts.CNN} />
      )}

      {showDetailSheet && (
        <RoundTripSheet isOpen={showDetailSheet} onClose={handleCloseSheet} outboundFlight={selectedRoundTrip.outbound} returnFlight={selectedRoundTrip.return} passengerCounts={passengerCounts} onFaresSelected={handleFaresSelected}   traceId={flightResults?.traceId}/>
      )}

      {/* Mobile filters panel */}
      {showMobileFilters && (
        <div className="lg:hidden fixed inset-0 bg-black/50 flex items-end z-50">
          <div className="absolute inset-0" onClick={() => setShowMobileFilters(false)} />
          <div className="relative bg-white w-full rounded-t-3xl max-h-[90vh] overflow-auto">
            <div className="sticky top-0 bg-white border-b p-4">
              <div className="flex justify-between items-center">
                <div><h3 className="font-bold text-lg text-gray-800">Filters</h3><p className="text-xs text-gray-500">{activeFilterCount} active filters</p></div>
                <button onClick={() => setShowMobileFilters(false)} className="p-2 hover:bg-gray-100 rounded-full"><FaTimes /></button>
              </div>
            </div>
            <div className="p-4 pb-24">
              <div className="mb-6">
                <h4 className="font-medium text-gray-700 mb-3">Price Range</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm"><span className="font-medium">₹{priceRange.min.toLocaleString()}</span><span className="text-gray-400">—</span><span className="font-medium">₹{priceRange.max.toLocaleString()}</span></div>
                  <input type="range" min={getPriceRange.min} max={getPriceRange.max} value={priceRange.max} onChange={(e) => setPriceRange(prev => ({ ...prev, max: parseInt(e.target.value) || 0 }))} className="w-full accent-[#FD561E]" />
                </div>
              </div>
              {airlines.length > 0 && (
                <div className="mb-6">
                  <h4 className="font-medium text-gray-700 mb-3">Airlines</h4>
                  <div className="space-y-2">
                    {airlines.map(airline => (
                      <label key={airline.code} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-lg cursor-pointer">
                        <div className="flex items-center"><input type="checkbox" checked={selectedAirlines.includes(airline.name)} onChange={() => { setSelectedAirlines(prev => prev.includes(airline.name) ? prev.filter(a => a !== airline.name) : [...prev, airline.name]); }} className="w-4 h-4 text-[#FD561E] border-gray-300 rounded focus:ring-[#FD561E]" /><span className="ml-3 text-sm text-gray-700 font-medium">{airline.name}</span></div>
                        <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">{airline.count}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}
              <div className="mb-6">
                <h4 className="font-medium text-gray-700 mb-3">Stops</h4>
                <div className="space-y-2">
                  {[{ value: 'non-stop', label: 'Non-stop' }, { value: '1-stop', label: '1 Stop' }, { value: '2+ stops', label: '2+ Stops' }].map(stop => (
                    <label key={stop.value} className="flex items-center p-2 hover:bg-gray-50 rounded-lg cursor-pointer"><input type="checkbox" checked={selectedStops.includes(stop.value)} onChange={() => { setSelectedStops(prev => prev.includes(stop.value) ? prev.filter(s => s !== stop.value) : [...prev, stop.value]); }} className="w-4 h-4 text-[#FD561E] border-gray-300 rounded focus:ring-[#FD561E]" /><span className="ml-3 text-sm text-gray-700">{stop.label}</span></label>
                  ))}
                </div>
              </div>
            </div>
            <div className="sticky bottom-0 bg-white border-t p-4">
              <div className="flex gap-3">
                <button onClick={resetFilters} className="flex-1 border-2 border-gray-200 text-gray-700 font-semibold py-3 px-4 rounded-xl hover:bg-gray-50 transition-colors">Reset</button>
                <button onClick={() => setShowMobileFilters(false)} className="flex-1 bg-[#FD561E] hover:bg-[#e04e1b] text-white font-semibold py-3 px-4 rounded-xl transition-colors shadow-md">Apply Filters</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Traveller modal (shared desktop + mobile) */}
      {showTravellerModal && (
        <>
          <div className="fixed inset-0 z-40 bg-black/50" onClick={cancelPassengerChanges} />
          <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-sm mx-4 bg-white rounded-2xl shadow-2xl p-5">
            <div className="flex justify-between items-center mb-4"><h3 className="font-semibold text-gray-900">Select Travellers</h3><button onClick={cancelPassengerChanges} className="text-gray-400 hover:text-gray-600"><FaTimes /></button></div>
            <div className="mb-4 p-3 bg-orange-50 rounded-lg"><div className="flex justify-between"><span className="text-sm font-medium text-gray-600">Max {maxTravellers} travellers</span><span className={`text-sm font-bold ${tempPassengers.length >= maxTravellers ? 'text-red-600' : 'text-green-600'}`}>{tempPassengers.length}/{maxTravellers}</span></div></div>
            <div className="space-y-3 mb-4 max-h-52 overflow-y-auto">
              {tempPassengers.map((p, i) => (
                <div key={i} className="flex gap-2 p-3 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <div className="flex justify-between items-center">
                      <span className="font-medium text-gray-700 text-sm">{p.code === 'ADT' && 'Adult (12+)'}{p.code === 'CNN' && 'Child (2-11)'}{p.code === 'INF' && 'Infant (0-2)'}</span>
                      <button onClick={() => removeTempPassenger(i)} className="text-gray-400 hover:text-red-500"><FaTimes className="w-3 h-3" /></button>
                    </div>
                    {(p.code === 'CNN' || p.code === 'INF') && (
                      <select value={p.age || (p.code === 'CNN' ? 8 : 1)} onChange={(e) => updateTempPassengerAge(i, e.target.value)} className="w-full mt-2 px-3 py-2 text-sm border border-gray-200 rounded-lg">
                        {p.code === 'CNN' && [...Array(10)].map((_, a) => <option key={a+2} value={a+2}>{a+2} years</option>)}
                        {p.code === 'INF' && [...Array(3)].map((_, a) => <option key={a} value={a}>{a} year{a !== 1 ? 's' : ''}</option>)}
                      </select>
                    )}
                  </div>
                </div>
              ))}
            </div>
            <div className="flex gap-2 mb-5">
              <button className="flex-1 py-2 text-sm border rounded-lg hover:border-[#FD561E] hover:text-[#FD561E] disabled:opacity-50" onClick={() => addTempPassenger('ADT')} disabled={tempPassengers.length >= maxTravellers}>+ Adult</button>
              <button className="flex-1 py-2 text-sm border rounded-lg hover:border-[#FD561E] hover:text-[#FD561E] disabled:opacity-50" onClick={() => addTempPassenger('CNN')} disabled={tempPassengers.length >= maxTravellers}>+ Child</button>
              <button className="flex-1 py-2 text-sm border rounded-lg hover:border-[#FD561E] hover:text-[#FD561E] disabled:opacity-50" onClick={() => addTempPassenger('INF')} disabled={tempPassengers.length >= maxTravellers}>+ Infant</button>
            </div>
            <div className="mb-5">
              <h4 className="font-medium text-gray-700 mb-3 text-sm">Travel Class</h4>
              <div className="grid grid-cols-2 gap-2">
                {['Economy', 'Premium Economy', 'Business', 'First'].map(cls => (
                  <button key={cls} onClick={() => setTempTravelClass(cls)} className={`py-2 rounded-lg text-sm font-medium transition-colors ${tempTravelClass === cls ? 'bg-[#FD561E] text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>{cls}</button>
                ))}
              </div>
            </div>
            <div className="flex gap-3">
              <button className="flex-1 bg-gray-100 py-3 rounded-lg font-medium text-sm" onClick={cancelPassengerChanges}>Cancel</button>
              <button className="flex-1 bg-[#FD561E] text-white py-3 rounded-lg font-medium text-sm" onClick={applyPassengerChanges}>Apply</button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default RoundTripPage;