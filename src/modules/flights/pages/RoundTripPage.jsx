// src/modules/flights/pages/RoundTripPage.jsx

import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

import useStore from '../store/useStore';
import { searchLowFare } from '../services/lowFareSearchService';

import { searchAirports } from '../services/airportSearchService';
import { fetchAirlines } from '../services/airlineService';
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
    const prices = [
      ...(outbound || []).map(f => f.cheapestPrice),
      ...(inbound  || []).map(f => f.cheapestPrice),
    ].filter(p => !isNaN(p) && p > 0);
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
      case 'duration':   f.sort((a, b) => (a.totalDurationRaw||'').localeCompare(b.totalDurationRaw||'')); break;
      case 'departure':  f.sort((a, b) => (a.departureTime||'').localeCompare(b.departureTime||'')); break;
    }
    return f;
  };

  const filteredOutbound = useMemo(() => applyFilters(outbound), [outbound, priceRange, selectedAirlines, selectedStops, selectedTimes, sortBy]);
  const filteredInbound  = useMemo(() => applyFilters(inbound),  [inbound,  priceRange, selectedAirlines, selectedStops, selectedTimes, sortBy]);

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
                </div>
                <input type="range" min={flightPriceRange.min} max={flightPriceRange.max} value={priceRange.max}
                  onChange={(e) => setPriceRange(prev => ({ ...prev, max: parseInt(e.target.value) }))} className="w-full accent-[#FD561E]" />
              </div>
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
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default RoundTripPage;