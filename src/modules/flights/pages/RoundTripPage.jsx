// src/modules/flights/pages/RoundTripPage.jsx

import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

import useStore from '../store/useStore';
import { searchLowFare } from '../services/lowFareSearchService';

import { searchAirports } from '../services/airportSearchService';
import { fetchAirlines } from '../services/airlineService';
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
  FaPlane, FaExclamationTriangle, FaFilter, FaTimes,
  FaChevronDown, FaChevronRight, FaCalendarAlt,
  FaMapMarkerAlt, FaSpinner, FaExchangeAlt, FaUser,
  FaUserFriends, FaInfoCircle, FaCheck
} from 'react-icons/fa';

// ── Combinability checker ─────────────────────────────────────────
const areBrandsCombinable = (outboundBrand, inboundBrand) => {
  if (!outboundBrand || !inboundBrand) return false;
  const outCodes = outboundBrand.combinabilityCodes || [];
  const inCodes  = inboundBrand.combinabilityCodes  || [];
  return outCodes.some(c => inCodes.includes(c));
};

const RoundTripPage = () => {
  const navigate  = useNavigate();
  const location  = useLocation();

  // ── Store ─────────────────────────────────────────────────────
  const {
    outbound,
    inbound,
    isLoading,
    error,
    setTripType,
    updateFlightLeg,
    updatePassengerCount,
    setSelectedOutbound,
    setSelectedInbound,
    selectedOutbound,
    selectedInbound,
    setError,
  } = useStore();

  // ── Local state ───────────────────────────────────────────────
  const [pageLoading, setPageLoading]         = useState(true);
  const [apiError, setApiError]               = useState(null);
  const [searchSummary, setSearchSummary]     = useState(null);
  const [passengerCounts, setPassengerCounts] = useState({ ADT: 1, CNN: 0, INF: 0 });
  const [airlinesMap, setAirlinesMap]         = useState({});
  const [airlinesLoading, setAirlinesLoading] = useState(true);

  // ── Edit search bar state ─────────────────────────────────────
  const [isEditing, setIsEditing]                 = useState(false);
  const [editFrom, setEditFrom]                   = useState(null);
  const [editTo, setEditTo]                       = useState(null);
  const [editFromDisplay, setEditFromDisplay]     = useState('');
  const [editToDisplay, setEditToDisplay]         = useState('');
  const [editDepartureDate, setEditDepartureDate] = useState(null);
  const [editReturnDate, setEditReturnDate]       = useState(null);
  const [editPassengers, setEditPassengers]       = useState(null);
  const [editTravelClass, setEditTravelClass]     = useState('Economy');

  // Airport search
  const [showFromDropdown, setShowFromDropdown] = useState(false);
  const [showToDropdown, setShowToDropdown]     = useState(false);
  const [fromAirports, setFromAirports]         = useState([]);
  const [toAirports, setToAirports]             = useState([]);
  const [fromLoading, setFromLoading]           = useState(false);
  const [toLoading, setToLoading]               = useState(false);
  const fromRef           = useRef(null);
  const toRef             = useRef(null);
  const fromSearchTimeout = useRef(null);
  const toSearchTimeout   = useRef(null);

  // Calendar
  const [activeCal, setActiveCal]     = useState(null);
  const [currentDate, setCurrentDate] = useState(new Date());
  const calRef = useRef(null);

  // Traveller modal
  const [showTravellerModal, setShowTravellerModal] = useState(false);
  const [tempPassengers, setTempPassengers]         = useState([]);
  const maxTravellers = 9;
  const travellerRef  = useRef(null);

  // Sheet
  const [showDetailSheet, setShowDetailSheet] = useState(false);

  // Filters
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [showSortDropdown, setShowSortDropdown]   = useState(false);
  const [sortBy, setSortBy]                       = useState('price-low');
  const [priceRange, setPriceRange]               = useState({ min: 0, max: 100000 });
  const [selectedAirlines, setSelectedAirlines]   = useState([]);
  const [selectedStops, setSelectedStops]         = useState([]);
  const [selectedTimes, setSelectedTimes]         = useState([]);

  // Combinability warning
  const [combinabilityWarning, setCombinabilityWarning] = useState(false);

  // ── Dup-call refs ─────────────────────────────────────────────
  // isFetchingRef    : true while an API call is in-flight; prevents StrictMode double-fire
  // lastFetchedKeyRef: stores the last successfully fetched search key; prevents same-search re-fetch
  // initialFetchDoneRef: true after first successful fetch
  const isFetchingRef       = useRef(false);
  const lastFetchedKeyRef   = useRef('');
  const initialFetchDoneRef = useRef(false);

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
  FaShieldAlt,
  FaSpinner,
  FaUser
} from 'react-icons/fa';

const RoundTripPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { 
    updateFlightResults, 
    flightResults
  } = useFlightSearchContext();

  // ============ API LOADING STATE ============
  const [isLoading, setIsLoading] = useState(true);
  const [apiError, setApiError] = useState(null);
  const [searchSummary, setSearchSummary] = useState(null);
  const [passengerCounts, setPassengerCounts] = useState({ ADT: 1, CNN: 0, INF: 0 });
  
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
  const [editReturnDate, setEditReturnDate] = useState(null);
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
  const [showReturnCalendar, setShowReturnCalendar] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [currentReturnDate, setCurrentReturnDate] = useState(new Date());
  const departureCalendarRef = useRef(null);
  const returnCalendarRef = useRef(null);

  // Traveller modal for edit mode
  const [showTravellerModal, setShowTravellerModal] = useState(false);
  const [tempPassengers, setTempPassengers] = useState([]);
  const maxTravellers = 9;
  const travellerRef = useRef(null);
  
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
    { value: 'price-low',  label: 'Price: Low to High'  },
    { value: 'price-high', label: 'Price: High to Low'  },
    { value: 'duration',   label: 'Duration: Shortest'  },
    { value: 'departure',  label: 'Departure: Earliest' },
  ];

  // ── FETCH EFFECT ──────────────────────────────────────────────
  //
  // FIX for double API call:
  //
  //  ROOT CAUSE: React StrictMode intentionally runs effects twice in dev.
  //  The old code set isFetchingRef.current = true AFTER store writes
  //  (setTripType, updateFlightLeg, etc.), which triggered re-renders
  //  that let the second StrictMode invocation sneak past the guard.
  //
  //  THE FIX (two-layer guard):
  //    1. isFetchingRef  — checked & set as the very FIRST lines of the
  //                        async fn, before any state/store mutation.
  //                        This blocks the StrictMode duplicate call.
  //    2. isCurrentEffect — a per-invocation boolean that is set to false
  //                        in the cleanup. If StrictMode cleans up the
  //                        first run and starts a second, the first run's
  //                        async continuation bails when it checks this flag.
  //
  //  IMPORTANT: isFetchingRef is NOT reset inside the cleanup function.
  //  Resetting it in cleanup would let the StrictMode second invocation
  //  bypass the guard. It is only reset in the finally block of the
  //  successful/failed fetch.
  //
  const fareTypes = [
    { id: 'regular', label: 'Regular', icon: FaStar, color: 'blue' },
    { id: 'student', label: 'Student', icon: FaUserFriends, color: 'green' },
    { id: 'armed', label: 'Armed Forces', icon: FaShieldAlt, color: 'orange' },
    { id: 'senior', label: 'Senior Citizen', icon: FaUserFriends, color: 'purple' }
  ];

  // ============ PARSE URL PARAMETERS AND CALL API ============
  useEffect(() => {
    // Per-invocation flag — flipped to false by cleanup
    let isCurrentEffect = true;

    const fetchFlightResults = async () => {

      // ── GUARD: must be the very first two lines — before ANY state or store write ──
      if (isFetchingRef.current) {
        console.log('[RoundTripPage] Skipping — fetch already in progress');
        return;
      }
      isFetchingRef.current = true; // ← set synchronously, no await before this

      // ── Parse URL ─────────────────────────────────────────────
      const params   = new URLSearchParams(location.search);
      const tripType = params.get('tripType');

      if (!tripType || tripType !== 'round-trip') {
        isFetchingRef.current = false;
        navigate('/flights');
        return;
      }

      const from          = params.get('from');
      const to            = params.get('to');
      const fromName      = params.get('fromName');
      const toName        = params.get('toName');
      const fromCity      = params.get('fromCity');
      const toCity        = params.get('toCity');
      const departureDate = params.get('departureDate');
      const returnDate    = params.get('returnDate');
      const adults        = parseInt(params.get('adults')   || '1');
      const children      = parseInt(params.get('children') || '0');
      const infants       = parseInt(params.get('infants')  || '0');
      const travelClass   = params.get('class')    || 'Economy';
      const fareType      = params.get('fareType') || 'regular';

      if (!from || !to || !departureDate || !returnDate) {
        isFetchingRef.current = false;
        navigate('/flights');
        return;
      }

      // ── Same-search dedup ─────────────────────────────────────
      const searchKey = `${from}-${to}-${departureDate}-${returnDate}-${adults}-${children}-${infants}`;

      if (lastFetchedKeyRef.current === searchKey && initialFetchDoneRef.current) {
        console.log('[RoundTripPage] Same search already fetched — skipping');
        setPageLoading(false);
        isFetchingRef.current = false;
        return;
      }

      // ── Begin fetch ───────────────────────────────────────────
      setPageLoading(true);
      setApiError(null);

      console.log('[RoundTripPage] Starting search →', { from, to, departureDate, returnDate, adults, children, infants });

      try {
        const summary = {
          from: { code: from, name: fromName, city: fromCity },
          to:   { code: to,   name: toName,   city: toCity   },
          departureDate,
          returnDate,
          rawDepartureDate:   departureDate,
          rawReturnDate:      returnDate,
          formattedDeparture: new Date(departureDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
          formattedReturn:    new Date(returnDate).toLocaleDateString('en-GB',    { day: 'numeric', month: 'short', year: 'numeric' }),
          adults, children, infants,
          travelClass, fareType,
          fromCode: from, toCode: to, fromName, toName,
        const params = new URLSearchParams(location.search);
        const tripType = params.get('tripType');
        
        if (!tripType || tripType !== 'round-trip') {
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
        const returnDate = params.get('returnDate');
        const adults = parseInt(params.get('adults') || '1');
        const children = parseInt(params.get('children') || '0');
        const infants = parseInt(params.get('infants') || '0');
        const travelClass = params.get('class') || 'Economy';
        const fareType = params.get('fareType') || 'regular';
        
        if (!from || !to || !departureDate || !returnDate) {
          console.error('Missing required search parameters');
          navigate('/flights');
          return;
        }
        
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
        setPassengerCounts({ ADT: adults, CNN: children, INF: infants });

        // Write search params into Zustand store
        setTripType('ROUND_TRIP');
        updateFlightLeg(0, 'from', from);
        updateFlightLeg(0, 'to', to);
        updateFlightLeg(0, 'departureDate', departureDate);
        updateFlightLeg(1, 'from', to);
        updateFlightLeg(1, 'to', from);
        updateFlightLeg(1, 'departureDate', returnDate);
        updatePassengerCount('ADT', adults);
        updatePassengerCount('CNN', children);
        updatePassengerCount('INF', infants);

        // Call service — reads from store, calls API, transforms, saves to store
        const result = await searchLowFare();

        // If StrictMode cleaned up this effect invocation while we were awaiting,
        // discard the result — the new invocation will handle it.
        if (!isCurrentEffect) {
          console.log('[RoundTripPage] Effect was superseded — discarding result');
          return;
        }

        console.log('[RoundTripPage] searchLowFare result →', {
          success:       result.success,
          outboundCount: useStore.getState().outbound?.length ?? 0,
          inboundCount:  useStore.getState().inbound?.length  ?? 0,
          traceId:       useStore.getState().traceId,
          travelerRefs:  useStore.getState().travelerRefs,
          error:         result.error ?? null,
        });

        if (result.success) {
          lastFetchedKeyRef.current   = searchKey;
          initialFetchDoneRef.current = true;
        } else {
          setApiError(result.error || 'Search failed. Please try again.');
        }

      } catch (err) {
        if (!isCurrentEffect) return;
        console.error('[RoundTripPage] Error →', err.message);
        setApiError(err.message || 'An unexpected error occurred');
        setError(err.message);
        
        const passengers = [];
        for (let i = 0; i < adults; i++) passengers.push({ code: 'ADT' });
        for (let i = 0; i < children; i++) passengers.push({ code: 'CNN', age: 8 });
        for (let i = 0; i < infants; i++) passengers.push({ code: 'INF', age: 1 });
        
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
        // Only update UI state if this invocation is still the active one
        if (isCurrentEffect) {
          setPageLoading(false);
        }
        // Always release the fetch lock so future navigations can search again
        isFetchingRef.current = false;
      }
    };

    fetchFlightResults();

    // Cleanup: mark this invocation as stale.
    // DO NOT reset isFetchingRef here — doing so would let the StrictMode
    // second invocation bypass the guard at the top of fetchFlightResults.
    return () => {
      isCurrentEffect = false;
    };

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.search]);

  // ── Airlines ──────────────────────────────────────────────────
  useEffect(() => {
    const loadAirlines = async () => {
      if (!outbound?.length && !inbound?.length) { setAirlinesLoading(false); return; }
      try {
        setAirlinesLoading(true);
        const airlines = await fetchAirlines();
        const map = {};
        airlines.forEach(a => { map[a.code] = a; });
        setAirlinesMap(map);
      } catch (err) {
        console.error('[RoundTripPage] Airlines fetch failed →', err);
      } finally {
        setAirlinesLoading(false);
      }
    };
    loadAirlines();
  }, [outbound, inbound]);

  // ── Edit mode helpers ─────────────────────────────────────────
  const openEditMode = () => {
    setEditFrom({ code: searchSummary?.fromCode, name: searchSummary?.fromName });
    setEditTo({ code: searchSummary?.toCode, name: searchSummary?.toName });
    setEditFromDisplay(`${searchSummary?.fromName} (${searchSummary?.fromCode})`);
    setEditToDisplay(`${searchSummary?.toName} (${searchSummary?.toCode})`);
    setEditDepartureDate(searchSummary?.rawDepartureDate ? new Date(searchSummary.rawDepartureDate) : null);
    setEditReturnDate(searchSummary?.rawReturnDate ? new Date(searchSummary.rawReturnDate) : null);
    setEditPassengers(passengerCounts);
    setEditTravelClass(searchSummary?.travelClass || 'Economy');
    setIsEditing(true);
  };

  const cancelEdit = () => {
    setIsEditing(false);
    setShowFromDropdown(false);
    setShowToDropdown(false);
    setActiveCal(null);
    setShowTravellerModal(false);
  };

  const handleEditSearch = () => {
    if (!editFrom || !editTo || !editDepartureDate || !editReturnDate) {
      alert('Please fill all required fields');
      return;
    }
    if (editReturnDate < editDepartureDate) {
      alert('Return date must be after departure date');
      return;
    }
    const params = new URLSearchParams();
    params.set('tripType',      'round-trip');
    params.set('adults',        editPassengers?.ADT || 1);
    params.set('children',      editPassengers?.CNN || 0);
    params.set('infants',       editPassengers?.INF || 0);
    params.set('class',         editTravelClass);
    params.set('fareType',      searchSummary?.fareType || 'regular');
    params.set('from',          editFrom.code);
    params.set('to',            editTo.code);
    params.set('fromName',      editFrom.name);
    params.set('toName',        editTo.name);
    params.set('departureDate', formatDateForAPI(editDepartureDate));
    params.set('returnDate',    formatDateForAPI(editReturnDate));
    // Reset dedup refs so the new search goes through
    lastFetchedKeyRef.current   = '';
    initialFetchDoneRef.current = false;
    setIsEditing(false);
    navigate(`/flights/results?${params.toString()}`);
  };

  const searchAirportsAPI = async (term, type) => {
    if (term.length < 3) {
      if (type === 'from') { setFromAirports([]); setFromLoading(false); }
      else                 { setToAirports([]);   setToLoading(false);   }
      return;
    }
    try {
      if (type === 'from') { setFromLoading(true); setFromAirports(await searchAirports(term)); setFromLoading(false); }
      else                 { setToLoading(true);   setToAirports(await searchAirports(term));   setToLoading(false);   }
    } catch {
      if (type === 'from') { setFromLoading(false); setFromAirports([]); }
      else                 { setToLoading(false);   setToAirports([]);   }
    }
  };

  const debouncedFromSearch = useCallback((val) => {
    if (fromSearchTimeout.current) clearTimeout(fromSearchTimeout.current);
    if (val.length >= 3) fromSearchTimeout.current = setTimeout(() => searchAirportsAPI(val, 'from'), 500);
    else { setFromAirports([]); setFromLoading(false); }
  }, []);

  const debouncedToSearch = useCallback((val) => {
    if (toSearchTimeout.current) clearTimeout(toSearchTimeout.current);
    if (val.length >= 3) toSearchTimeout.current = setTimeout(() => searchAirportsAPI(val, 'to'), 500);
    else { setToAirports([]); setToLoading(false); }
  }, []);

  const handleSwap = () => {
    const [tf, tfd] = [editFrom, editFromDisplay];
    setEditFrom(editTo);  setEditFromDisplay(editToDisplay);
    setEditTo(tf);        setEditToDisplay(tfd);
  };

  const handleDateSelect = (day) => {
    const selected = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    if (activeCal === 'departure') {
      setEditDepartureDate(selected);
      setActiveCal('return');
    } else {
      setEditReturnDate(selected);
      setActiveCal(null);
    }
  };

  const openTravellerModal = () => {
    setTempPassengers([
      ...Array(editPassengers?.ADT || 1).fill({ code: 'ADT' }),
      ...Array(editPassengers?.CNN || 0).fill({ code: 'CNN', age: 8 }),
      ...Array(editPassengers?.INF || 0).fill({ code: 'INF', age: 1 }),
    ]);
    setShowTravellerModal(true);
  };

  const addTempPassenger       = (code) => { if (tempPassengers.length >= maxTravellers) return; const p = { code }; if (code === 'CNN') p.age = 8; if (code === 'INF') p.age = 1; setTempPassengers(prev => [...prev, p]); };
  const removeTempPassenger    = (i)    => setTempPassengers(prev => prev.filter((_, idx) => idx !== i));
  const updateTempPassengerAge = (i, age) => setTempPassengers(prev => { const u = [...prev]; u[i] = { ...u[i], age: parseInt(age) }; return u; });

  const applyPassengers = () => {
    if (!tempPassengers.some(p => p.code === 'ADT')) { alert('At least one adult required'); return; }
    setEditPassengers({
      ADT: tempPassengers.filter(p => p.code === 'ADT').length,
      CNN: tempPassengers.filter(p => p.code === 'CNN').length,
      INF: tempPassengers.filter(p => p.code === 'INF').length,
  useEffect(() => {
    const loadAirlines = async () => {
      const allFlights = [...(flightResults.flights || []), ...(flightResults.roundTrips || [])];
      
      if (!allFlights.length) {
        setAirlinesLoading(false);
        return;
      }
      
      try {
        setAirlinesLoading(true);
        console.log('🛫 Fetching airlines data for round trip...');
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
  }, [flightResults.flights, flightResults.roundTrips]);

  // ============ EDIT MODE FUNCTIONS ============

  const openEditMode = () => {
    setEditFrom({ code: searchSummary?.fromCode, name: searchSummary?.fromName });
    setEditTo({ code: searchSummary?.toCode, name: searchSummary?.toName });
    setEditFromDisplay(`${searchSummary?.fromName} (${searchSummary?.fromCode})`);
    setEditToDisplay(`${searchSummary?.toName} (${searchSummary?.toCode})`);
    setEditDepartureDate(searchSummary?.rawDepartureDate ? new Date(searchSummary.rawDepartureDate) : new Date());
    setEditReturnDate(searchSummary?.rawReturnDate ? new Date(searchSummary.rawReturnDate) : new Date());
    setEditPassengers(passengerCounts);
    setEditTravelClass(searchSummary?.travelClass || 'Economy');
    setIsEditing(true);
  };

  const cancelEdit = () => {
    setIsEditing(false);
    setShowFromDropdown(false);
    setShowToDropdown(false);
    setShowDepartureCalendar(false);
    setShowReturnCalendar(false);
    setShowTravellerModal(false);
  };

  const handleEditSearch = () => {
    if (!editFrom || !editTo || !editDepartureDate || !editReturnDate) {
      alert('Please fill all required fields');
      return;
    }
    
    if (new Date(editReturnDate) <= new Date(editDepartureDate)) {
      alert('Return date must be after departure date');
      return;
    }
    
    const params = new URLSearchParams();
    params.set('tripType', 'round-trip');
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
    params.set('returnDate', formatDateForAPI(editReturnDate));
    
    setIsEditing(false);
    navigate(`/flights/round-trip?${params.toString()}`);
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

  const handleDepartureDateSelect = (day) => {
    const fullDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    setEditDepartureDate(fullDate);
    setShowDepartureCalendar(false);
  };

  const handleReturnDateSelect = (day) => {
    const fullDate = new Date(currentReturnDate.getFullYear(), currentReturnDate.getMonth(), day);
    setEditReturnDate(fullDate);
    setShowReturnCalendar(false);
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
    return date.toLocaleDateString("en-GB", { day: 'numeric', month: 'short' });
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
  const getDaysInMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDay = (date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const monthName = (date) => date.toLocaleString("default", { month: "long" });
  const yearNum = (date) => date.getFullYear();

  // ============ DATA TRANSFORMATION ============
  
  const { outboundFlights, returnFlights, combinations } = useMemo(() => {
    console.log('🔄 Transforming flight data...');
    const transformed = transformFlightData(flightResults);
    return transformed;
  }, [flightResults]);

  // ============ FILTERING LOGIC ============
  
  const filteredOutbound = useMemo(() => {
    let filtered = [...outboundFlights];

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
    setShowTravellerModal(false);
  };

  const formatDate       = (d) => d ? d.toLocaleDateString('en-GB') : '';
  const formatDateForAPI = (d) => { if (!d) return null; const dt = new Date(d); return `${dt.getFullYear()}-${String(dt.getMonth()+1).padStart(2,'0')}-${String(dt.getDate()).padStart(2,'0')}`; };

  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const firstDay    = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();
  const monthName   = currentDate.toLocaleString('default', { month: 'long' });
  const calYear     = currentDate.getFullYear();

  useEffect(() => {
    const h = (e) => {
      if (fromRef.current      && !fromRef.current.contains(e.target))       setShowFromDropdown(false);
      if (toRef.current        && !toRef.current.contains(e.target))         setShowToDropdown(false);
      if (calRef.current       && !calRef.current.contains(e.target))        setActiveCal(null);
      if (travellerRef.current && !travellerRef.current.contains(e.target))  { setShowTravellerModal(false); setTempPassengers([]); }
    };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  // ── Flight selection with combinability check ─────────────────
  const handleSelectOutbound = (flight) => {
    setSelectedOutbound({ ...flight, selectedBrand: flight.brandOptions?.[0] ?? null });
    checkCombinability(flight, selectedInbound);
  };

  const handleSelectInbound = (flight) => {
    setSelectedInbound({ ...flight, selectedBrand: flight.brandOptions?.[0] ?? null });
    checkCombinability(selectedOutbound, flight);
  };

  const checkCombinability = (ob, ib) => {
    if (!ob || !ib) { setCombinabilityWarning(false); return; }
    const obBrand = ob.selectedBrand || ob.brandOptions?.[0];
    const ibBrand = ib.selectedBrand || ib.brandOptions?.[0];
    setCombinabilityWarning(!areBrandsCombinable(obBrand, ibBrand));
  };

  const handleContinue = () => {
    if (selectedOutbound && selectedInbound) setShowDetailSheet(true);
  };

  // ── Price range from store data ───────────────────────────────
  const flightPriceRange = useMemo(() => {
    // Use only priced flights for the range (CPO_ONLY excluded)
    const priceable = [
      ...(outbound || []).filter(f => f.priceAvailable !== false),
      ...(inbound  || []).filter(f => f.priceAvailable !== false),
    ];
    const prices = priceable.map(f => f.cheapestPrice).filter(p => !isNaN(p) && p > 0);
    if (!prices.length) return { min: 0, max: 100000 };
    return { min: Math.min(...prices), max: Math.max(...prices) };
  }, [outbound, inbound]);

  useEffect(() => {
    if (flightPriceRange.min !== 0 || flightPriceRange.max !== 100000)
      setPriceRange(flightPriceRange);
  }, [flightPriceRange]);

  const airlines = useMemo(() => {
    const map = new Map();
    [...(outbound || []), ...(inbound || [])].forEach(f => {
      const code = f.segments?.[0]?.carrier;
      if (!code) return;
      if (!map.has(code)) map.set(code, { name: airlinesMap[code]?.name || code, code, count: 1 });
      else map.get(code).count += 1;
    });
    return Array.from(map.values()).sort((a, b) => a.name.localeCompare(b.name));
  }, [outbound, inbound, airlinesMap]);

  const applyFilters = (flights) => {
    if (!flights?.length) return [];
    let f = [...flights];
    if (priceRange.min > flightPriceRange.min || priceRange.max < flightPriceRange.max)
      f = f.filter(x => x.cheapestPrice >= priceRange.min && x.cheapestPrice <= priceRange.max);
    if (selectedAirlines.length)
      f = f.filter(x => selectedAirlines.includes(x.segments?.[0]?.carrier));
    if (selectedStops.length)
      f = f.filter(x => {
        if (selectedStops.includes('non-stop') && x.stops === 0) return true;
        if (selectedStops.includes('1-stop')   && x.stops === 1) return true;
        if (selectedStops.includes('2+ stops') && x.stops >= 2) return true;
        return false;
      });
    if (selectedTimes.length)
      f = f.filter(x => {
        const h = parseInt(x.departureTime?.split(':')?.[0] ?? '0');
        if (selectedTimes.includes('early-morning') && h >= 0  && h < 6)   return true;
        if (selectedTimes.includes('morning')        && h >= 6  && h < 12)  return true;
        if (selectedTimes.includes('afternoon')      && h >= 12 && h < 18)  return true;
        if (selectedTimes.includes('evening')        && h >= 18 && h <= 23) return true;
        return false;
      });
    switch (sortBy) {
      case 'price-low':  f.sort((a, b) => (a.cheapestPrice||0) - (b.cheapestPrice||0)); break;
      case 'price-high': f.sort((a, b) => (b.cheapestPrice||0) - (a.cheapestPrice||0)); break;
      case 'duration':   f.sort((a, b) => (a.totalDurationMinutes || 0) - (b.totalDurationMinutes || 0)); break;
      case 'departure':  f.sort((a, b) => (a.departureTime||'').localeCompare(b.departureTime||'')); break;
    }
    return f;
  };

  // Filter out CPO_ONLY flights (no price data yet — priceAvailable: false)
  const pricedOutbound = useMemo(() => (outbound || []).filter(f => f.priceAvailable !== false), [outbound]);
  const pricedInbound  = useMemo(() => (inbound  || []).filter(f => f.priceAvailable !== false), [inbound]);

  const filteredOutbound = useMemo(() => applyFilters(pricedOutbound), [pricedOutbound, priceRange, selectedAirlines, selectedStops, selectedTimes, sortBy]);
  const filteredInbound  = useMemo(() => applyFilters(pricedInbound),  [pricedInbound,  priceRange, selectedAirlines, selectedStops, selectedTimes, sortBy]);

  const resetFilters = () => { setPriceRange(flightPriceRange); setSelectedAirlines([]); setSelectedStops([]); setSelectedTimes([]); };

  const activeFilterCount = selectedAirlines.length + selectedStops.length + selectedTimes.length +
    (priceRange.min !== flightPriceRange.min || priceRange.max !== flightPriceRange.max ? 1 : 0);

  const passengerText = useMemo(() => {
    const parts = [];
    if (passengerCounts.ADT > 0) parts.push(`${passengerCounts.ADT} Adult${passengerCounts.ADT > 1 ? 's' : ''}`);
    if (passengerCounts.CNN > 0) parts.push(`${passengerCounts.CNN} Child${passengerCounts.CNN > 1 ? 'ren' : ''}`);
    if (passengerCounts.INF > 0) parts.push(`${passengerCounts.INF} Infant${passengerCounts.INF > 1 ? 's' : ''}`);
    return parts.join(', ');
  }, [passengerCounts]);

  const showLoading = pageLoading || isLoading;

  // ── RENDER ────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-50">

      {/* ══ STICKY SEARCH BAR ══════════════════════════════════ */}
      <div className="w-full bg-[#f36b32] py-3 sticky top-0 z-40 shadow-md">
        <div className="container mx-auto px-4">

          {!isEditing && (
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2 flex-wrap">
                <div className="flex items-center gap-1.5 bg-white/20 text-white rounded-full px-3 py-1.5 text-sm font-medium">
                  <FaMapMarkerAlt size={11} />
                  <span>{searchSummary?.fromCode}</span>
                  <FaExchangeAlt size={10} className="opacity-70" />
                  <span>{searchSummary?.toCode}</span>
                </div>
                <div className="flex items-center gap-1.5 bg-white/20 text-white rounded-full px-3 py-1.5 text-sm">
                  <FaCalendarAlt size={11} />
                  <span>{searchSummary?.formattedDeparture}</span>
                  <span className="opacity-50">→</span>
                  <span>{searchSummary?.formattedReturn}</span>
                </div>
                <div className="flex items-center gap-1.5 bg-white/20 text-white rounded-full px-3 py-1.5 text-sm">
                  <FaUser size={11} />
                  <span>{passengerText}</span>
                </div>
              </div>
              <button onClick={openEditMode} className="bg-white text-[#f36b32] font-semibold text-sm px-4 py-2 rounded-full hover:shadow-md transition-all">
                Modify Search
              </button>
            </div>
          )}

          {isEditing && (
            <div className="space-y-3">
              <div className="grid grid-cols-[1fr_auto_1fr] gap-2 items-end">
                <div ref={fromRef} className="relative">
                  <p className="text-white text-xs font-bold mb-1 uppercase tracking-wide">From</p>
                  <div className="flex items-center gap-2 px-3 h-12 rounded-xl bg-white shadow-sm">
                    <FaMapMarkerAlt className="text-[#f36b32] w-4 h-4 flex-shrink-0" />
                    <input type="text" value={editFromDisplay}
                      onChange={(e) => { setEditFromDisplay(e.target.value); setEditFrom(null); debouncedFromSearch(e.target.value); setShowFromDropdown(true); }}
                      onFocus={() => setShowFromDropdown(true)}
                      placeholder="City or airport"
                      className="w-full text-sm font-semibold outline-none bg-transparent truncate" />
                    {fromLoading && <FaSpinner className="animate-spin text-gray-400 w-3 h-3 flex-shrink-0" />}
                  </div>
                  {showFromDropdown && fromAirports.length > 0 && (
                    <div className="absolute left-0 top-full w-full bg-white shadow-xl rounded-xl max-h-52 overflow-y-auto z-50 border border-gray-100 mt-1">
                      {fromAirports.map(a => (
                        <div key={a.location_code} className="px-3 py-2.5 hover:bg-orange-50 cursor-pointer text-sm"
                          onClick={() => { setEditFrom(a); setEditFromDisplay(`${a.name} (${a.location_code})`); setShowFromDropdown(false); setFromAirports([]); }}>
                          <div className="font-medium text-gray-800">{a.name}</div>
                          <div className="text-xs text-gray-400">{a.location_code}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <button onClick={handleSwap} className="w-10 h-10 mb-0.5 bg-white rounded-full flex items-center justify-center shadow-sm hover:scale-110 transition-transform self-end">
                  <FaExchangeAlt className="text-[#f36b32] w-4 h-4" />
                </button>

                <div ref={toRef} className="relative">
                  <p className="text-white text-xs font-bold mb-1 uppercase tracking-wide">To</p>
                  <div className="flex items-center gap-2 px-3 h-12 rounded-xl bg-white shadow-sm">
                    <FaMapMarkerAlt className="text-[#f36b32] w-4 h-4 flex-shrink-0" />
                    <input type="text" value={editToDisplay}
                      onChange={(e) => { setEditToDisplay(e.target.value); setEditTo(null); debouncedToSearch(e.target.value); setShowToDropdown(true); }}
                      onFocus={() => setShowToDropdown(true)}
                      placeholder="City or airport"
                      className="w-full text-sm font-semibold outline-none bg-transparent truncate" />
                    {toLoading && <FaSpinner className="animate-spin text-gray-400 w-3 h-3 flex-shrink-0" />}
                  </div>
                  {showToDropdown && toAirports.length > 0 && (
                    <div className="absolute left-0 top-full w-full bg-white shadow-xl rounded-xl max-h-52 overflow-y-auto z-50 border border-gray-100 mt-1">
                      {toAirports.map(a => (
                        <div key={a.location_code} className="px-3 py-2.5 hover:bg-orange-50 cursor-pointer text-sm"
                          onClick={() => { setEditTo(a); setEditToDisplay(`${a.name} (${a.location_code})`); setShowToDropdown(false); setToAirports([]); }}>
                          <div className="font-medium text-gray-800">{a.name}</div>
                          <div className="text-xs text-gray-400">{a.location_code}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 items-end" ref={calRef}>
                {/* Departure Date */}
                <div className="relative">
                  <p className="text-white text-xs font-bold mb-1 uppercase tracking-wide">Departure</p>
                  <div onClick={() => setActiveCal(activeCal === 'departure' ? null : 'departure')}
                    className="flex items-center gap-2 px-3 h-12 rounded-xl bg-white shadow-sm cursor-pointer">
                    <FaCalendarAlt className="text-[#f36b32] w-4 h-4 flex-shrink-0" />
                    <span className="text-sm font-semibold text-gray-700 truncate">
                      {editDepartureDate ? formatDate(editDepartureDate) : 'Select date'}
                    </span>
                  </div>
                  {activeCal === 'departure' && (
                    <div className="absolute top-full left-0 mt-2 bg-white rounded-2xl shadow-2xl p-4 w-72 z-50 border border-gray-100">
                      <div className="flex justify-between items-center mb-3">
                        <button onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))} className="p-1.5 hover:bg-gray-100 rounded-full">
                          <FaChevronRight className="text-gray-600 rotate-180" size={12} />
                        </button>
                        <span className="text-sm font-semibold text-gray-700">{monthName} {calYear}</span>
                        <button onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))} className="p-1.5 hover:bg-gray-100 rounded-full">
                          <FaChevronRight className="text-gray-600" size={12} />
                        </button>
                      </div>
                      <div className="grid grid-cols-7 text-center text-xs text-gray-400 mb-2">
                        {['Su','Mo','Tu','We','Th','Fr','Sa'].map(d => <div key={d}>{d}</div>)}
                      </div>
                      <div className="grid grid-cols-7 gap-1 text-center">
                        {[...Array(firstDay)].map((_, i) => <div key={i} />)}
                        {[...Array(daysInMonth)].map((_, i) => {
                          const day = i + 1;
                          const d = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
                          const isPast = d < new Date();
                          const isSelected = editDepartureDate && d.toDateString() === editDepartureDate.toDateString();
                          return (
                            <button key={day} onClick={() => !isPast && handleDateSelect(day)} disabled={isPast}
                              className={`p-2 rounded-full text-xs font-medium transition-colors ${isPast ? 'text-gray-200 cursor-not-allowed' : isSelected ? 'bg-[#FD561E] text-white' : 'hover:bg-orange-50 text-gray-700'}`}>
                              {day}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>

                {/* Return Date */}
                <div className="relative">
                  <p className="text-white text-xs font-bold mb-1 uppercase tracking-wide">Return</p>
                  <div onClick={() => setActiveCal(activeCal === 'return' ? null : 'return')}
                    className="flex items-center gap-2 px-3 h-12 rounded-xl bg-white shadow-sm cursor-pointer">
                    <FaCalendarAlt className="text-[#f36b32] w-4 h-4 flex-shrink-0" />
                    <span className="text-sm font-semibold text-gray-700 truncate">
                      {editReturnDate ? formatDate(editReturnDate) : 'Select date'}
                    </span>
                  </div>
                  {activeCal === 'return' && (
                    <div className="absolute top-full left-0 mt-2 bg-white rounded-2xl shadow-2xl p-4 w-72 z-50 border border-gray-100">
                      <div className="flex justify-between items-center mb-3">
                        <button onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))} className="p-1.5 hover:bg-gray-100 rounded-full">
                          <FaChevronRight className="text-gray-600 rotate-180" size={12} />
                        </button>
                        <span className="text-sm font-semibold text-gray-700">{monthName} {calYear}</span>
                        <button onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))} className="p-1.5 hover:bg-gray-100 rounded-full">
                          <FaChevronRight className="text-gray-600" size={12} />
                        </button>
                      </div>
                      <div className="grid grid-cols-7 text-center text-xs text-gray-400 mb-2">
                        {['Su','Mo','Tu','We','Th','Fr','Sa'].map(d => <div key={d}>{d}</div>)}
                      </div>
                      <div className="grid grid-cols-7 gap-1 text-center">
                        {[...Array(firstDay)].map((_, i) => <div key={i} />)}
                        {[...Array(daysInMonth)].map((_, i) => {
                          const day = i + 1;
                          const d = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
                          const isPast = editDepartureDate ? d <= editDepartureDate : d < new Date();
                          const isSelected = editReturnDate && d.toDateString() === editReturnDate.toDateString();
                          return (
                            <button key={day} onClick={() => !isPast && handleDateSelect(day)} disabled={isPast}
                              className={`p-2 rounded-full text-xs font-medium transition-colors ${isPast ? 'text-gray-200 cursor-not-allowed' : isSelected ? 'bg-[#FD561E] text-white' : 'hover:bg-orange-50 text-gray-700'}`}>
                              {day}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>

                {/* Travellers */}
                <div ref={travellerRef} className="relative">
                  <p className="text-white text-xs font-bold mb-1 uppercase tracking-wide">Travellers</p>
                  <div onClick={openTravellerModal} className="flex items-center gap-2 px-3 h-12 rounded-xl bg-white shadow-sm cursor-pointer">
                    <FaUser className="text-[#f36b32] w-4 h-4 flex-shrink-0" />
                    <span className="text-sm font-semibold text-gray-700 flex-1 truncate">
                      {editPassengers ? `${editPassengers.ADT} Adult${editPassengers.ADT !== 1 ? 's' : ''} · ${editTravelClass}` : 'Select'}
                    </span>
                    <FaChevronDown className="text-gray-400 w-3 h-3 flex-shrink-0" />
                  </div>
                </div>

                {/* Action buttons */}
                <div className="flex gap-2">
                  <button onClick={cancelEdit} className="flex-1 h-12 bg-white/20 text-white text-sm font-medium rounded-xl hover:bg-white/30 transition-colors">Cancel</button>
                  <button onClick={handleEditSearch} disabled={!editFrom || !editTo || !editDepartureDate || !editReturnDate}
                    className="flex-1 h-12 bg-white text-[#f36b32] text-sm font-bold rounded-xl shadow-sm hover:shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed">
                    Search
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ══ CONTENT ════════════════════════════════════════════ */}

      {showLoading && <FlightLoadingAnimation searchSummary={searchSummary} isLoading={showLoading} />}

      {!showLoading && apiError && (
        <div className="min-h-[calc(100vh-200px)] flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8 text-center">
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FaExclamationTriangle className="text-3xl text-red-500" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-3">Search Failed</h2>
            <p className="text-gray-600 mb-4">{apiError}</p>
            <div className="flex gap-3">
              <button onClick={() => window.location.reload()} className="flex-1 bg-gray-100 text-gray-700 font-semibold py-3 rounded-xl hover:bg-gray-200">Try Again</button>
              <button onClick={() => navigate('/flights')} className="flex-1 bg-[#FD561E] text-white font-semibold py-3 rounded-xl hover:bg-[#e04e1b]">Modify Search</button>
            </div>
          </div>
        </div>
      )}

      {!showLoading && !apiError && error && (
        <div className="min-h-[calc(100vh-200px)] flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8 text-center">
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FaExclamationTriangle className="text-3xl text-red-500" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-3">Search Failed</h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <button onClick={() => navigate('/flights')} className="w-full bg-[#FD561E] text-white font-semibold py-3 rounded-xl">Try Again</button>
          </div>
        </div>
      )}

      {!showLoading && !apiError && !error && (!outbound?.length || !inbound?.length) && (
        <div className="min-h-[calc(100vh-200px)] flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8 text-center">
            <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FaPlane className="text-3xl text-blue-500" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-3">No Flights Found</h2>
            <p className="text-gray-600 mb-4">We couldn't find flights for this route and date combination.</p>
            <button onClick={() => navigate('/flights')} className="w-full bg-[#FD561E] text-white font-semibold py-3 rounded-xl">Modify Search</button>
          </div>
        </div>
      )}

      {!showLoading && !apiError && !error && outbound?.length > 0 && inbound?.length > 0 && (
        <>
          <div className="bg-white border-b shadow-sm">
            <div className="container mx-auto px-4 py-2.5 flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-3 text-sm text-gray-600">
                <span>
                  <span className="font-bold text-[#FD561E]">{outbound.length}</span> outbound ·{' '}
                  <span className="font-bold text-[#FD561E]">{inbound.length}</span> return
                </span>
                <span className="text-gray-300">|</span>
                <span className="text-xs text-gray-400 flex items-center gap-1">
                  <FaInfoCircle size={11} /> Select one outbound + one return
                </span>
                {activeFilterCount > 0 && (
                  <button onClick={resetFilters} className="text-xs text-[#FD561E] hover:underline">Clear filters</button>
                )}
              </div>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <button onClick={() => setShowSortDropdown(!showSortDropdown)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-700 hover:border-[#FD561E]">
                    Sort: {sortOptions.find(o => o.value === sortBy)?.label.split(': ')[1] || 'Price'}
                    <FaChevronDown size={11} />
                  </button>
                  {showSortDropdown && (
                    <div className="absolute right-0 top-full mt-1 bg-white rounded-xl shadow-lg border border-gray-100 z-20 w-48 py-1">
                      {sortOptions.map(o => (
                        <button key={o.value} onClick={() => { setSortBy(o.value); setShowSortDropdown(false); }}
                          className={`block w-full text-left px-4 py-2 text-sm hover:bg-orange-50 ${sortBy === o.value ? 'text-[#FD561E] font-medium' : 'text-gray-700'}`}>
                          {o.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <button onClick={() => setShowMobileFilters(true)}
                  className="lg:hidden flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-700">
                  <FaFilter size={11} /> Filters
                  {activeFilterCount > 0 && (
                    <span className="bg-[#FD561E] text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">{activeFilterCount}</span>
                  )}
                </button>
              </div>
            </div>
          </div>

          {combinabilityWarning && selectedOutbound && selectedInbound && (
            <div className="bg-amber-50 border-b border-amber-200 px-4 py-2">
              <p className="text-sm text-amber-700 flex items-center gap-2 container mx-auto">
                <FaInfoCircle size={14} className="flex-shrink-0" />
                The selected outbound and return fares may not be combinable.
              </p>
            </div>
          )}

          <div className="container mx-auto px-4 py-5">
            <div className="flex flex-col lg:flex-row gap-5">

              <div className="hidden lg:block lg:w-1/4">
                <FilterSidebar
                  priceRange={priceRange}             setPriceRange={setPriceRange}
                  selectedAirlines={selectedAirlines} toggleAirline={(a) => setSelectedAirlines(p => p.includes(a) ? p.filter(x => x !== a) : [...p, a])}
                  selectedStops={selectedStops}       toggleStops={(s) => setSelectedStops(p => p.includes(s) ? p.filter(x => x !== s) : [...p, s])}
                  selectedTimes={selectedTimes}       toggleTime={(t) => setSelectedTimes(p => p.includes(t) ? p.filter(x => x !== t) : [...p, t])}
                  resetFilters={resetFilters}         activeFilterCount={activeFilterCount}
                  airlines={airlines}                 flightPriceRange={flightPriceRange}
                  tripType="round-trip"
                />
              </div>

              <div className="lg:w-3/4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                  {/* Outbound column */}
                  <div>
                    <div className="sticky top-[72px] z-10 bg-blue-50 border border-blue-100 rounded-xl px-4 py-2.5 mb-3 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <FaPlane className="text-blue-500 rotate-45" size={13} />
                        <span className="font-semibold text-blue-800 text-sm">
                          Outbound · {searchSummary?.fromCode} → {searchSummary?.toCode}
                        </span>
                        <span className="text-xs text-blue-500">({filteredOutbound.length})</span>
                      </div>
                      {selectedOutbound && (
                        <span className="flex items-center gap-1 text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-medium">
                          <FaCheck size={9} /> Selected
                        </span>
                      )}
                    </div>
                    <div className="space-y-3">
                      {filteredOutbound.map(flight => (
                        <RoundTripFlightCard
                          key={`${flight.offeringId}-${flight.optionIndex}`}
                          flight={flight}
                          isSelected={selectedOutbound?.offeringId === flight.offeringId && selectedOutbound?.optionIndex === flight.optionIndex}
                          onSelect={() => handleSelectOutbound(flight)}
                          legIndex={0}
                          airlineData={airlinesMap[flight.segments?.[0]?.carrier]}
                          airlinesLoading={airlinesLoading}
                        />
                      ))}
                      {filteredOutbound.length === 0 && (
                        <div className="bg-white rounded-xl p-6 text-center border border-gray-100">
                          <p className="text-gray-500 text-sm">No outbound flights match your filters</p>
                          <button onClick={resetFilters} className="text-[#FD561E] text-sm mt-2 hover:underline">Clear filters</button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Inbound (Return) column */}
                  <div>
                    <div className="sticky top-[72px] z-10 bg-green-50 border border-green-100 rounded-xl px-4 py-2.5 mb-3 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <FaPlane className="text-green-500 -rotate-45" size={13} />
                        <span className="font-semibold text-green-800 text-sm">
                          Return · {searchSummary?.toCode} → {searchSummary?.fromCode}
                        </span>
                        <span className="text-xs text-green-500">({filteredInbound.length})</span>
                      </div>
                      {selectedInbound && (
                        <span className="flex items-center gap-1 text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">
                          <FaCheck size={9} /> Selected
                        </span>
                      )}
                    </div>
                    <div className="space-y-3">
                      {filteredInbound.map(flight => (
                        <RoundTripFlightCard
                          key={`${flight.offeringId}-${flight.optionIndex}`}
                          flight={flight}
                          isSelected={selectedInbound?.offeringId === flight.offeringId && selectedInbound?.optionIndex === flight.optionIndex}
                          onSelect={() => handleSelectInbound(flight)}
                          legIndex={1}
                          airlineData={airlinesMap[flight.segments?.[0]?.carrier]}
                          airlinesLoading={airlinesLoading}
                        />
                      ))}
                      {filteredInbound.length === 0 && (
                        <div className="bg-white rounded-xl p-6 text-center border border-gray-100">
                          <p className="text-gray-500 text-sm">No return flights match your filters</p>
                          <button onClick={resetFilters} className="text-[#FD561E] text-sm mt-2 hover:underline">Clear filters</button>
                        </div>
                      )}
                    </div>
                  </div>

  const handleContinue = () => { if (selectedRoundTrip.outbound && selectedRoundTrip.return) setShowDetailSheet(true); };
  const handleCloseSheet = () => setShowDetailSheet(false);
  const handleFaresSelected = (outboundFare, returnFare) => setSelectedFares({ outbound: outboundFare, return: returnFare });

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
      if (returnCalendarRef.current && !returnCalendarRef.current.contains(event.target)) {
        setShowReturnCalendar(false);
      }
      if (travellerRef.current && !travellerRef.current.contains(event.target)) {
        setShowTravellerModal(false);
        setTempPassengers([]);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // ============ SEARCH BAR COMPONENT (Reused for both loading and results) ============
  const SearchBar = () => (
    <div className="w-full bg-[#f36b32] py-4 sticky top-0 z-40 shadow-md flight-search-bar">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr_auto_1fr_auto_1fr_auto] lg:grid-cols-[1fr_auto_1fr_160px_160px_200px_auto] items-end gap-4">
          
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

          {/* Departure Date Field */}
          <div className="relative">
            <p className="text-white text-sm font-bold mb-2">DEPARTURE</p>
            <div
              onClick={isEditing ? () => setShowDepartureCalendar(!showDepartureCalendar) : openEditMode}
              className="flex items-center gap-3 px-6 h-16 rounded-md bg-white shadow-md cursor-pointer"
            >
              <FaCalendarAlt className="text-[#f36b32] w-5 h-5" />
              <input
                type="text"
                value={isEditing ? (editDepartureDate ? formatDate(editDepartureDate) : "") : (searchSummary?.departureDate || '')}
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
                  <h2 className="font-semibold text-sm">{monthName(currentDate)} {yearNum(currentDate)}</h2>
                  <button onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))}>
                    <FaChevronRight className="text-gray-600" />
                  </button>
                </div>
                <div className="grid grid-cols-7 text-center text-xs text-gray-500 mb-2">
                  {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map(day => <div key={day}>{day}</div>)}
                </div>
                <div className="grid grid-cols-7 gap-1 text-center">
                  {[...Array(getFirstDay(currentDate))].map((_, i) => <div key={i}></div>)}
                  {[...Array(getDaysInMonth(currentDate))].map((_, i) => {
                    const day = i + 1;
                    const isPast = new Date(currentDate.getFullYear(), currentDate.getMonth(), day) < new Date();
                    return (
                      <button
                        key={day}
                        onClick={() => !isPast && handleDepartureDateSelect(day)}
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

          {/* Return Date Field */}
          <div className="relative">
            <p className="text-white text-sm font-bold mb-2">RETURN</p>
            <div
              onClick={isEditing ? () => setShowReturnCalendar(!showReturnCalendar) : openEditMode}
              className="flex items-center gap-3 px-6 h-16 rounded-md bg-white shadow-md cursor-pointer"
            >
              <FaCalendarAlt className="text-[#f36b32] w-5 h-5" />
              <input
                type="text"
                value={isEditing ? (editReturnDate ? formatDate(editReturnDate) : "") : (searchSummary?.returnDate || '')}
                placeholder="Select date"
                readOnly
                className="w-full text-base font-bold outline-none bg-transparent cursor-pointer"
              />
            </div>
            {showReturnCalendar && isEditing && (
              <div 
                ref={returnCalendarRef}
                className="absolute top-full left-0 mt-2 bg-white rounded-md shadow-xl p-4 w-72 z-50"
              >
                <div className="flex justify-between items-center mb-3">
                  <button onClick={() => setCurrentReturnDate(new Date(currentReturnDate.getFullYear(), currentReturnDate.getMonth() - 1, 1))}>
                    <FaChevronLeft className="text-gray-600" />
                  </button>
                  <h2 className="font-semibold text-sm">{monthName(currentReturnDate)} {yearNum(currentReturnDate)}</h2>
                  <button onClick={() => setCurrentReturnDate(new Date(currentReturnDate.getFullYear(), currentReturnDate.getMonth() + 1, 1))}>
                    <FaChevronRight className="text-gray-600" />
                  </button>
                </div>
                <div className="grid grid-cols-7 text-center text-xs text-gray-500 mb-2">
                  {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map(day => <div key={day}>{day}</div>)}
                </div>
                <div className="grid grid-cols-7 gap-1 text-center">
                  {[...Array(getFirstDay(currentReturnDate))].map((_, i) => <div key={i}></div>)}
                  {[...Array(getDaysInMonth(currentReturnDate))].map((_, i) => {
                    const day = i + 1;
                    const isPast = new Date(currentReturnDate.getFullYear(), currentReturnDate.getMonth(), day) < new Date();
                    return (
                      <button
                        key={day}
                        onClick={() => !isPast && handleReturnDateSelect(day)}
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
              disabled={isEditing && (!editFrom || !editTo || !editDepartureDate || !editReturnDate)}
              className="w-[160px] h-16 bg-white text-black font-bold rounded-md shadow-md cursor-pointer transition-all duration-300 hover:text-[#fd561e] hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isEditing ? 'UPDATE SEARCH' : 'MODIFY SEARCH'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  // ============ LOADING STATE ============
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <SearchBar />
        <FlightLoadingAnimation 
          searchSummary={{
            fromCode: searchSummary?.fromCode,
            fromName: searchSummary?.fromName,
            toCode: searchSummary?.toCode,
            toName: searchSummary?.toName,
            formattedDate: `Departure: ${searchSummary?.departureDate} | Return: ${searchSummary?.returnDate}`
          }}
          isLoading={isLoading}
        />
      </div>
    );
  }

  // ============ API ERROR STATE ============
  if (apiError) {
    return (
      <div className="min-h-screen bg-gray-50">
        <SearchBar />
        <div className="flex items-center justify-center p-4 min-h-[calc(100vh-200px)]">
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
      </div>
    );
  }

  // ============ NO FLIGHTS STATE ============
  if (!isLoading && !apiError && (!outboundFlights.length || !returnFlights.length)) {
    return (
      <div className="min-h-screen bg-gray-50">
        <SearchBar />
        <div className="flex items-center justify-center p-4 min-h-[calc(100vh-200px)]">
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
      </div>
    );
  }

  // ============ MAIN RENDER WITH RESULTS - Search Bar Always Visible ============
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Search Bar - Always Visible */}
      <SearchBar />

      {/* Fare Type Selection */}
      
      
      {/* Results Stats and Sort Bar */}
      

      {/* Main Content */}
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Left Sidebar - Filters (Desktop) */}
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
                <div className="bg-blue-50 rounded-t-xl p-3 mb-4 sticky top-[200px] z-10">
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
                      airlineData={airlinesMap[flight.airlineCode]}
                      airlinesLoading={airlinesLoading}
                    />
                  ))}
                </div>
              </div>

              {/* Return Column */}
              <div>
                <div className="bg-green-50 rounded-t-xl p-3 mb-4 sticky top-[200px] z-10">
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
                      airlineData={airlinesMap[flight.airlineCode]}
                      airlinesLoading={airlinesLoading}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* ══ BOTTOM BAR ════════════════════════════════════════ */}
      {selectedOutbound && selectedInbound && (
        <BottomBar
          selectedFlights={[selectedOutbound, selectedInbound]}
          totalPrice={
            (selectedOutbound.selectedBrand?.price?.totalPrice || selectedOutbound.cheapestPrice || 0) +
            (selectedInbound.selectedBrand?.price?.totalPrice  || selectedInbound.cheapestPrice  || 0)
          }
          onContinue={handleContinue}
          type="round-trip"
          passengerCount={passengerCounts.ADT + passengerCounts.CNN}
          warning={combinabilityWarning ? 'Selected fares may not be combinable' : null}
        />
      )}

      {/* ══ ROUND TRIP SHEET ══════════════════════════════════ */}
      {showDetailSheet && (
        <RoundTripSheet
          isOpen={showDetailSheet}
          onClose={() => setShowDetailSheet(false)}
          outboundFlight={selectedOutbound}
          returnFlight={selectedInbound}
          passengerCounts={passengerCounts}
        />
      )}

      {/* ══ TRAVELLER MODAL ═══════════════════════════════════ */}
      {showTravellerModal && (
        <>
          <div className="fixed inset-0 z-40 bg-black/50" onClick={() => { setShowTravellerModal(false); setTempPassengers([]); }} />
          <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-96 bg-white rounded-2xl shadow-2xl p-5">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold text-gray-900">Select Travellers</h3>
              <button onClick={() => { setShowTravellerModal(false); setTempPassengers([]); }} className="text-gray-400 hover:text-gray-600"><FaTimes /></button>
            </div>
            <div className="mb-4 p-3 bg-orange-50 rounded-xl flex justify-between">
              <span className="text-sm text-gray-600">Max {maxTravellers} travellers</span>
              <span className={`text-sm font-bold ${tempPassengers.length >= maxTravellers ? 'text-red-600' : 'text-green-600'}`}>{tempPassengers.length}/{maxTravellers}</span>
            </div>
            <div className="space-y-2 mb-4 max-h-52 overflow-y-auto">
              {tempPassengers.map((p, i) => (
                <div key={i} className="flex gap-2 p-3 bg-gray-50 rounded-xl">
                  <div className="flex-1">
                    <div className="flex justify-between">
                      <span className="font-medium text-gray-700 text-sm">{p.code === 'ADT' ? 'Adult' : p.code === 'CNN' ? 'Child' : 'Infant'}</span>
                      <button onClick={() => removeTempPassenger(i)} className="text-gray-400 hover:text-red-500"><FaTimes size={12} /></button>
                    </div>
                    {(p.code === 'CNN' || p.code === 'INF') && (
                      <select value={p.age} onChange={(e) => updateTempPassengerAge(i, e.target.value)}
                        className="w-full mt-1.5 px-2 py-1.5 text-sm border border-gray-200 rounded-lg">
                        {p.code === 'CNN' && [...Array(16)].map((_, a) => <option key={a+2} value={a+2}>{a+2} years</option>)}
                        {p.code === 'INF' && [...Array(3)].map((_, a)  => <option key={a}   value={a}>{a} year{a !== 1 ? 's' : ''}</option>)}
                      </select>
                    )}
                  </div>
                </div>
              ))}
            </div>
            <div className="flex gap-2 mb-5">
              {['ADT','CNN','INF'].map(code => (
                <button key={code} onClick={() => addTempPassenger(code)} disabled={tempPassengers.length >= maxTravellers}
                  className="flex-1 py-2 text-sm border rounded-xl hover:border-[#FD561E] hover:text-[#FD561E] disabled:opacity-40">
                  + {code === 'ADT' ? 'Adult' : code === 'CNN' ? 'Child' : 'Infant'}
                </button>
              ))}
            </div>
            <div className="mb-5">
              <h4 className="font-medium text-gray-700 mb-2 text-sm">Travel Class</h4>
              <div className="grid grid-cols-2 gap-2">
                {['Economy','Premium Economy','Business','First'].map(cls => (
                  <button key={cls} onClick={() => setEditTravelClass(cls)}
                    className={`py-2 rounded-xl text-sm font-medium ${editTravelClass === cls ? 'bg-[#FD561E] text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>
                    {cls}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex gap-3">
              <button onClick={() => { setTempPassengers([]); setShowTravellerModal(false); }} className="flex-1 bg-gray-100 py-3 rounded-xl text-sm font-medium">Cancel</button>
              <button onClick={applyPassengers} className="flex-1 bg-[#FD561E] text-white py-3 rounded-xl text-sm font-bold">Apply</button>
            </div>
          </div>
        </>
      )}

      {/* ══ MOBILE FILTERS ════════════════════════════════════ */}
      {showMobileFilters && (
        <div className="lg:hidden fixed inset-0 bg-black/50 z-50 flex">
          <div className="bg-white w-full max-w-sm ml-auto h-full overflow-auto shadow-xl">
            <div className="sticky top-0 bg-white border-b z-10 flex justify-between items-center p-4">
              <div>
                <h3 className="font-bold text-lg">Filters</h3>
                <p className="text-xs text-gray-500">{activeFilterCount} active</p>
              </div>
              <button onClick={() => setShowMobileFilters(false)} className="p-2 hover:bg-gray-100 rounded-full"><FaTimes /></button>
            </div>
            <div className="p-4 pb-24">
              <div className="mb-6">
                <h4 className="font-medium text-gray-700 mb-3">Price Range</h4>
                <div className="flex justify-between text-sm mb-2">
                  <span>₹{priceRange.min.toLocaleString('en-IN')}</span>
                  <span>₹{priceRange.max.toLocaleString('en-IN')}</span>
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
                <input type="range" min={flightPriceRange.min} max={flightPriceRange.max} value={priceRange.max}
                  onChange={(e) => setPriceRange(prev => ({ ...prev, max: parseInt(e.target.value) }))} className="w-full accent-[#FD561E]" />
              </div>

              {/* Airlines */}
              {airlines.length > 0 && (
                <div className="mb-6">
                  <h4 className="font-medium text-gray-700 mb-3">Airlines</h4>
                  {airlines.map(a => (
                    <label key={a.code} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-lg cursor-pointer">
                      <div className="flex items-center gap-2">
                        <input type="checkbox" checked={selectedAirlines.includes(a.code)} onChange={() => setSelectedAirlines(p => p.includes(a.code) ? p.filter(x => x !== a.code) : [...p, a.code])} className="w-4 h-4 accent-[#FD561E]" />
                        <span className="text-sm text-gray-700">{a.name}</span>
                      </div>
                      <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">{a.count}</span>
                    </label>
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
              )}
              <div className="mb-6">
                <h4 className="font-medium text-gray-700 mb-3">Stops</h4>
                {[{ value: 'non-stop', label: 'Non-stop' }, { value: '1-stop', label: '1 Stop' }, { value: '2+ stops', label: '2+ Stops' }].map(s => (
                  <label key={s.value} className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded-lg cursor-pointer">
                    <input type="checkbox" checked={selectedStops.includes(s.value)} onChange={() => setSelectedStops(p => p.includes(s.value) ? p.filter(x => x !== s.value) : [...p, s.value])} className="w-4 h-4 accent-[#FD561E]" />
                    <span className="text-sm text-gray-700">{s.label}</span>
                  </label>
                ))}
              </div>
              <div className="mb-6">
                <h4 className="font-medium text-gray-700 mb-3">Departure Time</h4>
                {[{ value: 'early-morning', label: 'Early Morning (0–6)' }, { value: 'morning', label: 'Morning (6–12)' }, { value: 'afternoon', label: 'Afternoon (12–18)' }, { value: 'evening', label: 'Evening (18–24)' }].map(t => (
                  <label key={t.value} className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded-lg cursor-pointer">
                    <input type="checkbox" checked={selectedTimes.includes(t.value)} onChange={() => setSelectedTimes(p => p.includes(t.value) ? p.filter(x => x !== t.value) : [...p, t.value])} className="w-4 h-4 accent-[#FD561E]" />
                    <span className="text-sm text-gray-700">{t.label}</span>
                  </label>
                ))}
              </div>
            </div>
            <div className="sticky bottom-0 bg-white border-t p-4 flex gap-3">
              <button onClick={resetFilters} className="flex-1 border-2 border-gray-200 text-gray-700 font-semibold py-3 rounded-xl hover:bg-gray-50">Reset</button>
              <button onClick={() => setShowMobileFilters(false)} className="flex-1 bg-[#FD561E] text-white font-semibold py-3 rounded-xl">Show results</button>
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
    </div>
  );
};

export default RoundTripPage;