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
import {
  FaPlane, FaExclamationTriangle, FaFilter, FaTimes, FaChevronDown,
  FaChevronRight, FaCalendarAlt, FaMapMarkerAlt, FaInfoCircle, FaSpinner,
  FaExchangeAlt, FaUser, FaChevronLeft, FaArrowLeft, FaPencilAlt,
} from 'react-icons/fa';

const FlightLoadingAnimation = ({ searchSummary }) => {
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);
  const [dots, setDots] = useState('');
  const loadingSteps = [
    { message: "Searching the best routes", duration: 800 },
    { message: "Checking availability", duration: 600 },
    { message: "Finding lowest fares", duration: 700 },
    { message: "Comparing airlines", duration: 500 },
    { message: "Almost there...", duration: 400 }
  ];
  useEffect(() => {
    const dotInterval = setInterval(() => { setDots(prev => prev.length >= 3 ? '' : prev + '.'); }, 400);
    return () => clearInterval(dotInterval);
  }, []);
  useEffect(() => {
    const totalDuration = loadingSteps.reduce((sum, step) => sum + step.duration, 0);
    const startTime = Date.now();
    const progressInterval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const newProgress = Math.min((elapsed / totalDuration) * 100, 100);
      setProgress(newProgress);
      let accumulatedTime = 0;
      for (let i = 0; i < loadingSteps.length; i++) {
        accumulatedTime += loadingSteps[i].duration;
        if (elapsed < accumulatedTime) { setCurrentStep(i); break; }
      }
      if (newProgress >= 100) clearInterval(progressInterval);
    }, 50);
    return () => clearInterval(progressInterval);
  }, []);
  const calculatePosition = (progress) => {
    const screenWidth = window.innerWidth;
    const left = (progress / 100) * (screenWidth - 100);
    const x = progress / 100;
    const top = 350 - (150 * x * x);
    const rotation = -8 * (1 - x);
    return { left, top, rotation };
  };
  const position = calculatePosition(progress);
  return (
    <div className="min-h-screen bg-white overflow-hidden relative">
      <div className="absolute inset-0 bg-white"></div>
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-gray-50 to-transparent"></div>
      <div className="fixed transition-all duration-100 ease-linear" style={{ left: `${position.left}px`, top: `${position.top}px`, transform: `rotate(${position.rotation}deg)`, transition: 'left 0.05s linear, top 0.08s cubic-bezier(0.4,0,0.2,1), transform 0.1s ease', zIndex: 20 }}>
        <img src="/assets/flight_moving_image2.png" alt="Flight" className="w-32 h-32 md:w-40 md:h-40 object-contain" style={{ filter: 'drop-shadow(0 8px 16px rgba(0,0,0,0.08))', opacity: 0.95 }} onError={(e) => { e.target.src = "https://cdn-icons-png.flaticon.com/512/3095/309510.png"; }} />
        <div className="absolute -left-12 top-1/2 transform -translate-y-1/2 flex gap-1">
          {[...Array(3)].map((_, i) => (<div key={i} className="rounded-full bg-gray-200" style={{ width: `${12-i*3}px`, height: `${2-i*0.5}px`, opacity: 0.3-i*0.1, animation: `trail ${0.6-i*0.15}s linear infinite` }} />))}
        </div>
      </div>
      <div className="absolute bottom-32 left-0 right-0"><div className="h-px bg-gray-100 w-full"></div></div>
      <div className="absolute bottom-40 left-1/2 transform -translate-x-1/2 text-center z-10">
        <h2 className="text-xl font-light text-gray-600 mb-2 tracking-wide">{loadingSteps[currentStep]?.message}<span className="inline-block w-6 text-left text-gray-400">{dots}</span></h2>
        <p className="text-gray-400 text-sm font-light">{searchSummary?.fromName} → {searchSummary?.toName}</p>
        <p className="text-gray-300 text-xs mt-1 font-light">{searchSummary?.formattedDate}</p>
        <div className="mt-8 w-48 mx-auto">
          <div className="h-px bg-gray-100 rounded-full overflow-hidden"><div className="h-full bg-gray-400 rounded-full transition-all duration-300" style={{ width: `${progress}%` }}></div></div>
          <div className="flex justify-between text-xs text-gray-300 mt-2 font-light"><span>Depart</span><span className="text-gray-400">{Math.round(progress)}%</span><span>Arrive</span></div>
        </div>
      </div>
      <style dangerouslySetInnerHTML={{ __html: `@keyframes trail { 0% { transform: translateX(0); opacity: 0.3; width: 12px; } 100% { transform: translateX(-20px); opacity: 0; width: 20px; } }` }} />
    </div>
  );
};

const OneWayPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { updateFlightResults, flightResults } = useFlightSearchContext();

  const [isLoading, setIsLoading] = useState(true);
  const [apiError, setApiError] = useState(null);
  const [searchSummary, setSearchSummary] = useState(null);
  const [passengerCounts, setPassengerCounts] = useState({ ADT: 1, CNN: 0, INF: 0 });
  const [searchParamsData, setSearchParamsData] = useState(null);
  const [airlinesMap, setAirlinesMap] = useState({});
  const [airlinesLoading, setAirlinesLoading] = useState(true);

  const [isEditing, setIsEditing] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const originalSnapshot = useRef(null);
  const [editFrom, setEditFrom] = useState(null);
  const [editTo, setEditTo] = useState(null);
  const [editFromDisplay, setEditFromDisplay] = useState('');
  const [editToDisplay, setEditToDisplay] = useState('');
  const [editDepartureDate, setEditDepartureDate] = useState(null);
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
  const [currentDate, setCurrentDate] = useState(new Date());
  const departureCalendarRef = useRef(null);

  const [showTravellerModal, setShowTravellerModal] = useState(false);
  const [tempPassengers, setTempPassengers] = useState([]);
  const [tempTravelClass, setTempTravelClass] = useState('Economy');
  const maxTravellers = 9;
  const travellerRef = useRef(null);

  const [showDetailSheet, setShowDetailSheet] = useState(false);
  const [selectedFlightForSheet, setSelectedFlightForSheet] = useState(null);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  const [sortBy, setSortBy] = useState('price-low');
  const [priceRange, setPriceRange] = useState({ min: 0, max: 100000 });
  const [selectedAirlines, setSelectedAirlines] = useState([]);
  const [selectedStops, setSelectedStops] = useState([]);
  const [selectedTimes, setSelectedTimes] = useState([]);

  const sortOptions = [
    { value: 'price-low', label: 'Price: Low to High' },
    { value: 'price-high', label: 'Price: High to Low' },
    { value: 'duration', label: 'Duration: Shortest' },
    { value: 'departure', label: 'Departure: Earliest' },
    { value: 'arrival', label: 'Arrival: Earliest' }
  ];

  // ✅ DD-MM-YYYY format — matches home page exactly
  const formatDateDDMMYYYY = (input) => {
    if (!input) return '';
    if (typeof input === 'string' && input.match(/^\d{4}-\d{2}-\d{2}$/)) {
      const [y, m, d] = input.split('-');
      return `${d}-${m}-${y}`;
    }
    const d = new Date(input);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}-${month}-${year}`;
  };

  const formatDateForAPI = (date) => {
    if (!date) return null;
    const d = new Date(date);
    return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
  };

  const checkHasChanges = useCallback((fromCode, toCode, date, passengers, travelClass) => {
    if (!originalSnapshot.current) return false;
    const orig = originalSnapshot.current;
    const dateStr = date ? formatDateForAPI(date) : null;
    return (
      fromCode !== orig.fromCode ||
      toCode !== orig.toCode ||
      dateStr !== orig.departureDate ||
      (passengers?.ADT ?? 1) !== orig.adults ||
      (passengers?.CNN ?? 0) !== orig.children ||
      (passengers?.INF ?? 0) !== orig.infants ||
      travelClass !== orig.travelClass
    );
  }, []);

  // Automatically update hasChanges whenever any edit field changes
  useEffect(() => {
    if (!isEditing) return;
    const fromCode = editFrom?.code || editFrom?.location_code || '';
    const toCode = editTo?.code || editTo?.location_code || '';
    const changed = checkHasChanges(fromCode, toCode, editDepartureDate, editPassengers, editTravelClass);
    setHasChanges(changed);
  }, [editFrom, editTo, editDepartureDate, editPassengers, editTravelClass, isEditing, checkHasChanges]);

  useEffect(() => {
    const fetchFlightResults = async () => {
      setIsLoading(true);
      setApiError(null);
      try {
        const params = new URLSearchParams(location.search);
        const tripType = params.get('tripType');
        if (!tripType || tripType !== 'one-way') { navigate('/flights'); return; }
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
        if (!from || !to || !departureDate) { navigate('/flights'); return; }
        const summary = {
          from: { code: from, name: fromName, city: fromCity },
          to: { code: to, name: toName, city: toCity },
          departureDate,
          rawDepartureDate: departureDate,
          formattedDate: formatDateDDMMYYYY(departureDate),
          adults, children, infants, travelClass, fareType,
          fromCode: from, toCode: to, fromName, toName
        };
        setSearchSummary(summary);
        setPassengerCounts({ ADT: adults, CNN: children, INF: infants });
        const passengers = [];
        for (let i = 0; i < adults; i++) passengers.push({ code: 'ADT' });
        for (let i = 0; i < children; i++) passengers.push({ code: 'CNN', age: 8 });
        for (let i = 0; i < infants; i++) passengers.push({ code: 'INF', age: 1 });
        const searchData = { tripType: 'one-way', legs: [{ origin: from, destination: to, departureDate }], passengers, fareType };
        setSearchParamsData(searchData);
        const result = await searchFlights(searchData);
        if (result.success) {
          updateFlightResults({ flights: result.flights || [], roundTrips: null, roundTripDisplay: null, multiCity: null, brandDetails: result.brandDetails || {}, count: result.count || 0, loading: false, error: null, searchId: result.searchId, traceId: result.traceId, passengerCount: result.passengerCount, currency: result.currency, passengerBreakdown: { ADT: adults, CNN: children, INF: infants } });
        } else {
          setApiError(result.error || 'Search failed. Please try again.');
          updateFlightResults({ loading: false, error: result.error || 'Search failed', flights: [] });
        }
      } catch (err) {
        setApiError(err.message || 'An unexpected error occurred');
        updateFlightResults({ loading: false, error: err.message, flights: [] });
      } finally {
        setIsLoading(false);
      }
    };
    fetchFlightResults();
  }, [location.search, navigate, updateFlightResults]);

  useEffect(() => {
  const loadAirlines = async () => {
    if (!flightResults.flights || flightResults.flights.length === 0) {
      setAirlinesLoading(false);
      return;
    }
    try {
      setAirlinesLoading(true);
      const airlines = await fetchAirlines();
      const map = {};
      airlines.forEach(a => {
        // If logo_url is missing, create a fallback using the airline code
        if (!a.logo_url) {
          // Try local PNG first, then fallback to UI Avatars
          a.logo_url = `/airlines/${a.code?.toLowerCase()}.png`;
        }
        map[a.code] = a;
      });
      setAirlinesMap(map);
    } catch (e) {
      console.error('Failed to load airlines:', e);
    } finally {
      setAirlinesLoading(false);
    }
  };
  loadAirlines();
}, [flightResults.flights]);

  const openEditMode = () => {
    if (!searchSummary) return;
    originalSnapshot.current = { fromCode: searchSummary.fromCode, toCode: searchSummary.toCode, departureDate: searchSummary.rawDepartureDate, adults: passengerCounts.ADT, children: passengerCounts.CNN, infants: passengerCounts.INF, travelClass: searchSummary.travelClass || 'Economy' };
    setEditFrom({ code: searchSummary.fromCode, name: searchSummary.fromName, location_code: searchSummary.fromCode });
    setEditTo({ code: searchSummary.toCode, name: searchSummary.toName, location_code: searchSummary.toCode });
    setEditFromDisplay(`${searchSummary.fromName} (${searchSummary.fromCode})`);
    setEditToDisplay(`${searchSummary.toName} (${searchSummary.toCode})`);
    const [y, m, d] = searchSummary.rawDepartureDate.split('-').map(Number);
    const parsedDate = new Date(y, m - 1, d);
    setEditDepartureDate(parsedDate);
    setCurrentDate(parsedDate);
    setEditPassengers({ ADT: passengerCounts.ADT, CNN: passengerCounts.CNN, INF: passengerCounts.INF });
    setEditTravelClass(searchSummary.travelClass || 'Economy');
    setHasChanges(false);
    setIsEditing(true);
  };

  const cancelEdit = () => { setIsEditing(false); setHasChanges(false); setShowFromDropdown(false); setShowToDropdown(false); setShowDepartureCalendar(false); setShowTravellerModal(false); setFromAirports([]); setToAirports([]); };

  const handleEditSearch = () => {
    if (!hasChanges || !editFrom || !editTo || !editDepartureDate) return;
    const params = new URLSearchParams();
    params.set('tripType', 'one-way');
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
    setIsEditing(false); setHasChanges(false);
    navigate(`/flights/results?${params.toString()}`);
  };

  const searchAirportsAPI = async (searchTerm, type) => {
    if (searchTerm.length < 3) { if (type==="from"){setFromAirports([]);setFromLoading(false);}else{setToAirports([]);setToLoading(false);} return; }
    try {
      if (type === "from") { setFromLoading(true); setFromAirports(await searchAirports(searchTerm)); setFromLoading(false); }
      else { setToLoading(true); setToAirports(await searchAirports(searchTerm)); setToLoading(false); }
    } catch { if(type==="from"){setFromLoading(false);setFromAirports([]);}else{setToLoading(false);setToAirports([]);} }
  };

  const debouncedFromSearch = useCallback((value) => { if(fromSearchTimeout.current)clearTimeout(fromSearchTimeout.current); if(value.length>=3)fromSearchTimeout.current=setTimeout(()=>searchAirportsAPI(value,"from"),500); else{setFromAirports([]);setFromLoading(false);} }, []);
  const debouncedToSearch = useCallback((value) => { if(toSearchTimeout.current)clearTimeout(toSearchTimeout.current); if(value.length>=3)toSearchTimeout.current=setTimeout(()=>searchAirportsAPI(value,"to"),500); else{setToAirports([]);setToLoading(false);} }, []);

  const handleFromInputChange = (e) => { setEditFromDisplay(e.target.value); setEditFrom(null); debouncedFromSearch(e.target.value); setShowFromDropdown(true); };
  const handleToInputChange = (e) => { setEditToDisplay(e.target.value); setEditTo(null); debouncedToSearch(e.target.value); setShowToDropdown(true); };

  const handleFromSelect = (airport) => { setEditFrom(airport); setEditFromDisplay(`${airport.name} (${airport.location_code})`); setShowFromDropdown(false); setFromAirports([]); };
  const handleToSelect = (airport) => { setEditTo(airport); setEditToDisplay(`${airport.name} (${airport.location_code})`); setShowToDropdown(false); setToAirports([]); };
  const handleSwap = () => { const tf=editFrom,tfd=editFromDisplay; setEditFrom(editTo); setEditFromDisplay(editToDisplay); setEditTo(tf); setEditToDisplay(tfd); };
  const handleDateSelect = (day) => { const d=new Date(currentDate.getFullYear(),currentDate.getMonth(),day); setEditDepartureDate(d); setShowDepartureCalendar(false); };

  const openTravellerModalEdit = () => { setTempPassengers([...Array.from({length:editPassengers?.ADT||1},()=>({code:'ADT'})),...Array.from({length:editPassengers?.CNN||0},()=>({code:'CNN',age:8})),...Array.from({length:editPassengers?.INF||0},()=>({code:'INF',age:1}))]); setTempTravelClass(editTravelClass); setShowTravellerModal(true); };
  const addTempPassenger = (code) => { if(tempPassengers.length>=maxTravellers)return; const p={code}; if(code==='CNN')p.age=8; if(code==='INF')p.age=1; setTempPassengers([...tempPassengers,p]); };
  const removeTempPassenger = (index) => setTempPassengers(tempPassengers.filter((_,i)=>i!==index));
  const updateTempPassengerAge = (index, age) => setTempPassengers(prev=>{const u=[...prev];u[index]={...u[index],age:parseInt(age)};return u;});
  const applyPassengerChanges = () => {
    if(!tempPassengers.some(p=>p.code==='ADT')){alert("At least one adult is required");return;}
    const adts=tempPassengers.filter(p=>p.code==='ADT').length, cnns=tempPassengers.filter(p=>p.code==='CNN').length, infs=tempPassengers.filter(p=>p.code==='INF').length;
    const np={ADT:adts,CNN:cnns,INF:infs};
    setEditPassengers(np); setEditTravelClass(tempTravelClass); setShowTravellerModal(false);
  };
  const cancelPassengerChanges = () => { setTempPassengers([]); setShowTravellerModal(false); };

  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth()+1, 0).getDate();
  const firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();
  const monthName = currentDate.toLocaleString("default", { month: "long" });
  const calYear = currentDate.getFullYear();

  const handleCloseSheet = () => { setShowDetailSheet(false); setSelectedFlightForSheet(null); };
  const handleViewDetails = (flight) => { setSelectedFlightForSheet(flight); setShowDetailSheet(true); };
  const handleModifySearch = () => navigate('/flights');

  const { flights, error } = flightResults;

  const flightPriceRange = useMemo(() => {
    if (!flights?.length) return { min: 0, max: 100000 };
    const prices = flights.map(f=>f.lowestPrice||f.price).filter(p=>!isNaN(p)&&p>0);
    if (!prices.length) return { min: 0, max: 100000 };
    return { min: Math.min(...prices), max: Math.max(...prices) };
  }, [flights]);

  useEffect(() => { if(flightPriceRange.min!==0||flightPriceRange.max!==100000)setPriceRange(flightPriceRange); }, [flightPriceRange]);

  const airlines = useMemo(() => {
    if (!flights?.length) return [];
    const map = new Map();
    flights.forEach(f => { const k=f.airline||f.airlineCode; if(!map.has(k))map.set(k,{name:f.airline,code:f.airlineCode,count:1}); else map.get(k).count+=1; });
    return Array.from(map.values()).sort((a,b)=>a.name.localeCompare(b.name));
  }, [flights]);

  const filteredAndSortedFlights = useMemo(() => {
    if (!flights?.length) return [];
    let filtered = [...flights];
    if(priceRange.min>flightPriceRange.min||priceRange.max<flightPriceRange.max) filtered=filtered.filter(f=>{const p=f.lowestPrice||f.price;return p>=priceRange.min&&p<=priceRange.max;});
    if(selectedAirlines.length>0) filtered=filtered.filter(f=>selectedAirlines.includes(f.airline));
    if(selectedStops.length>0) filtered=filtered.filter(f=>{if(selectedStops.includes('non-stop')&&f.stops===0)return true;if(selectedStops.includes('1-stop')&&f.stops===1)return true;if(selectedStops.includes('2+ stops')&&f.stops>=2)return true;return false;});
    if(selectedTimes.length>0) filtered=filtered.filter(f=>{const h=new Date(f.departureTime).getHours();if(selectedTimes.includes('early-morning')&&h>=0&&h<6)return true;if(selectedTimes.includes('morning')&&h>=6&&h<12)return true;if(selectedTimes.includes('afternoon')&&h>=12&&h<18)return true;if(selectedTimes.includes('evening')&&h>=18&&h<=23)return true;return false;});
    switch(sortBy){case 'price-low':filtered.sort((a,b)=>(a.lowestPrice||0)-(b.lowestPrice||0));break;case 'price-high':filtered.sort((a,b)=>(b.lowestPrice||0)-(a.lowestPrice||0));break;case 'duration':filtered.sort((a,b)=>(a.duration||0)-(b.duration||0));break;case 'departure':filtered.sort((a,b)=>new Date(a.departureTime)-new Date(b.departureTime));break;case 'arrival':filtered.sort((a,b)=>new Date(a.arrivalTime)-new Date(b.arrivalTime));break;}
    return filtered;
  }, [flights, priceRange, selectedAirlines, selectedStops, selectedTimes, sortBy, flightPriceRange]);

  const resetFilters = () => { setPriceRange({min:flightPriceRange.min,max:flightPriceRange.max}); setSelectedAirlines([]); setSelectedStops([]); setSelectedTimes([]); };
  const activeFilterCount = selectedAirlines.length+selectedStops.length+selectedTimes.length+(priceRange.min!==flightPriceRange.min||priceRange.max!==flightPriceRange.max?1:0);
  const toggleAirline = (a) => setSelectedAirlines(prev=>prev.includes(a)?prev.filter(x=>x!==a):[...prev,a]);
  const toggleStops = (s) => setSelectedStops(prev=>prev.includes(s)?prev.filter(x=>x!==s):[...prev,s]);
  const toggleTime = (t) => setSelectedTimes(prev=>prev.includes(t)?prev.filter(x=>x!==t):[...prev,t]);

  const passengerText = useMemo(() => { const p=[]; if(passengerCounts.ADT>0)p.push(`${passengerCounts.ADT} Adult${passengerCounts.ADT>1?'s':''}`); if(passengerCounts.CNN>0)p.push(`${passengerCounts.CNN} Child${passengerCounts.CNN>1?'ren':''}`); if(passengerCounts.INF>0)p.push(`${passengerCounts.INF} Infant${passengerCounts.INF>1?'s':''}`); return p.join(', '); }, [passengerCounts]);
  const editPassengerText = useMemo(() => { if(!editPassengers)return''; const p=[]; if((editPassengers.ADT||0)>0)p.push(`${editPassengers.ADT} Adult${editPassengers.ADT>1?'s':''}`); if((editPassengers.CNN||0)>0)p.push(`${editPassengers.CNN} Child${editPassengers.CNN>1?'ren':''}`); if((editPassengers.INF||0)>0)p.push(`${editPassengers.INF} Infant${editPassengers.INF>1?'s':''}`); return `${p.join(', ')} · ${editTravelClass}`; }, [editPassengers, editTravelClass]);

  useEffect(() => {
    const h = (e) => {
      if(fromRef.current&&!fromRef.current.contains(e.target))setShowFromDropdown(false);
      if(toRef.current&&!toRef.current.contains(e.target))setShowToDropdown(false);
      if(departureCalendarRef.current&&!departureCalendarRef.current.contains(e.target))setShowDepartureCalendar(false);
      if(travellerRef.current&&!travellerRef.current.contains(e.target)){setShowTravellerModal(false);setTempPassengers([]);}
    };
    document.addEventListener("mousedown",h);
    return ()=>document.removeEventListener("mousedown",h);
  }, []);

  if (isLoading) return <FlightLoadingAnimation searchSummary={searchSummary} />;

  if (apiError) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8 text-center">
        <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4"><FaExclamationTriangle className="text-3xl text-red-500" /></div>
        <h2 className="text-2xl font-bold text-gray-800 mb-3">Search Failed</h2>
        <p className="text-gray-600 mb-4">{apiError}</p>
        {searchSummary&&<div className="bg-gray-50 p-3 rounded-lg mb-6 text-left"><p className="text-sm text-gray-600">Your search:</p><p className="font-medium text-sm mt-1">{searchSummary.fromName} → {searchSummary.toName}</p><p className="text-xs text-gray-500 mt-1">{searchSummary.formattedDate}</p></div>}
        <div className="flex gap-3"><button onClick={()=>window.location.reload()} className="flex-1 bg-gray-100 text-gray-700 font-semibold py-3 px-4 rounded-xl hover:bg-gray-200">Try Again</button><button onClick={handleModifySearch} className="flex-1 bg-[#FD561E] hover:bg-[#e04e1b] text-white font-semibold py-3 px-4 rounded-xl">Modify Search</button></div>
      </div>
    </div>
  );

  if (error) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8 text-center">
        <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4"><FaExclamationTriangle className="text-3xl text-red-500" /></div>
        <h2 className="text-2xl font-bold text-gray-800 mb-3">Search Failed</h2>
        <p className="text-gray-600 mb-6">{error}</p>
        <button onClick={handleModifySearch} className="w-full bg-[#FD561E] hover:bg-[#e04e1b] text-white font-semibold py-3 px-4 rounded-xl">Try Search Again</button>
      </div>
    </div>
  );

  if (!isLoading&&!apiError&&!error&&(!flights||flights.length===0)) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8 text-center">
        <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4"><FaPlane className="text-3xl text-blue-500" /></div>
        <h2 className="text-2xl font-bold text-gray-800 mb-3">No Flights Found</h2>
        <p className="text-gray-600 mb-4">We couldn't find any flights matching your search criteria.</p>
        {searchSummary&&<div className="bg-gray-50 p-3 rounded-lg mb-6 text-left"><p className="text-sm text-gray-600">You searched for:</p><p className="font-medium text-sm mt-1">{searchSummary.fromName} → {searchSummary.toName}</p><p className="text-xs text-gray-500 mt-1">{searchSummary.formattedDate}</p></div>}
        <button onClick={handleModifySearch} className="w-full bg-[#FD561E] hover:bg-[#e04e1b] text-white font-semibold py-3 px-4 rounded-xl">Modify Search</button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">

      {/* MOBILE & TABLET ONLY */}
      <div className="lg:hidden w-full bg-white border-b border-gray-100 sticky top-0 z-40 shadow-sm">
        {!isEditing && (
          <div className="flex items-center gap-3 px-4 h-14">
            <button onClick={()=>navigate('/flights')} className="p-1 text-gray-500 hover:text-[#FD561E] flex-shrink-0"><FaArrowLeft className="w-4 h-4" /></button>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-gray-800 truncate">{searchSummary?.fromName} → {searchSummary?.toName}</p>
              <p className="text-xs text-gray-500 truncate">{searchSummary?.formattedDate} · {passengerText} · {searchSummary?.travelClass}</p>
            </div>
            <button onClick={openEditMode} className="p-2 text-[#FD561E] hover:bg-orange-50 rounded-full flex-shrink-0"><FaPencilAlt className="w-4 h-4" /></button>
          </div>
        )}
        {isEditing && (
          <div className="px-4 py-3">
            <div className="flex items-center justify-between mb-4">
              <button onClick={cancelEdit} className="flex items-center gap-2 text-sm font-semibold text-gray-700"><FaArrowLeft className="w-3 h-3" /> Modify Search</button>
              <button onClick={cancelEdit} className="p-1 text-gray-400 hover:text-gray-600"><FaTimes className="w-4 h-4" /></button>
            </div>
            <div className="relative mb-1" ref={fromRef}>
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-1">From</label>
              <div className="flex items-center border border-gray-200 rounded-xl px-3 h-12 bg-gray-50 mt-1 focus-within:border-[#FD561E] focus-within:bg-white transition-all">
                <FaMapMarkerAlt className="text-gray-400 w-3.5 h-3.5 flex-shrink-0 mr-2" />
                <input type="text" value={editFromDisplay} onChange={handleFromInputChange} onFocus={()=>setShowFromDropdown(true)} placeholder="City or airport" className="w-full text-sm font-semibold outline-none bg-transparent" />
                {fromLoading&&<FaSpinner className="animate-spin text-gray-400 w-3.5 h-3.5 flex-shrink-0" />}
              </div>
              {showFromDropdown&&fromAirports.length>0&&(
                <div className="absolute left-0 top-full w-full bg-white shadow-xl rounded-xl max-h-52 overflow-y-auto z-50 border border-gray-100 mt-1">
                  {fromAirports.map(a=><div key={a.location_code} className="px-4 py-3 hover:bg-orange-50 cursor-pointer border-b border-gray-50 last:border-0" onClick={()=>handleFromSelect(a)}><div className="text-sm font-semibold text-gray-800">{a.name}</div><div className="text-xs text-gray-400">{a.location_code}</div></div>)}
                </div>
              )}
            </div>
            <div className="flex justify-center my-1 relative z-10">
              <button onClick={handleSwap} className="bg-white border border-gray-200 w-8 h-8 rounded-full flex items-center justify-center shadow-sm hover:border-[#FD561E] hover:text-[#FD561E] transition-all"><FaExchangeAlt className="w-3 h-3 rotate-90" /></button>
            </div>
            <div className="relative mb-3" ref={toRef}>
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-1">To</label>
              <div className="flex items-center border border-gray-200 rounded-xl px-3 h-12 bg-gray-50 mt-1 focus-within:border-[#FD561E] focus-within:bg-white transition-all">
                <FaMapMarkerAlt className="text-gray-400 w-3.5 h-3.5 flex-shrink-0 mr-2" />
                <input type="text" value={editToDisplay} onChange={handleToInputChange} onFocus={()=>setShowToDropdown(true)} placeholder="City or airport" className="w-full text-sm font-semibold outline-none bg-transparent" />
                {toLoading&&<FaSpinner className="animate-spin text-gray-400 w-3.5 h-3.5 flex-shrink-0" />}
              </div>
              {showToDropdown&&toAirports.length>0&&(
                <div className="absolute left-0 top-full w-full bg-white shadow-xl rounded-xl max-h-52 overflow-y-auto z-50 border border-gray-100 mt-1">
                  {toAirports.map(a=><div key={a.location_code} className="px-4 py-3 hover:bg-orange-50 cursor-pointer border-b border-gray-50 last:border-0" onClick={()=>handleToSelect(a)}><div className="text-sm font-semibold text-gray-800">{a.name}</div><div className="text-xs text-gray-400">{a.location_code}</div></div>)}
                </div>
              )}
            </div>
            <div className="relative mb-3">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-1">Date</label>
              <div onClick={()=>setShowDepartureCalendar(!showDepartureCalendar)} className="flex items-center border border-gray-200 rounded-xl px-3 h-12 bg-gray-50 mt-1 cursor-pointer hover:border-[#FD561E] hover:bg-white transition-all">
                <FaCalendarAlt className="text-gray-400 w-3.5 h-3.5 flex-shrink-0 mr-2" />
                <span className="text-sm font-semibold text-gray-800 flex-1">{editDepartureDate ? formatDateDDMMYYYY(editDepartureDate) : 'Select date'}</span>
              </div>
              {showDepartureCalendar&&(
                <div ref={departureCalendarRef} className="absolute left-0 top-full mt-2 bg-white rounded-2xl shadow-xl p-4 w-full z-50 border border-gray-100">
                  <div className="flex justify-between items-center mb-3">
                    <button onClick={()=>setCurrentDate(new Date(currentDate.getFullYear(),currentDate.getMonth()-1,1))} className="p-2 hover:bg-gray-100 rounded-lg"><FaChevronLeft className="text-gray-600 w-3 h-3" /></button>
                    <h2 className="font-semibold text-sm">{monthName} {calYear}</h2>
                    <button onClick={()=>setCurrentDate(new Date(currentDate.getFullYear(),currentDate.getMonth()+1,1))} className="p-2 hover:bg-gray-100 rounded-lg"><FaChevronRight className="text-gray-600 w-3 h-3" /></button>
                  </div>
                  <div className="grid grid-cols-7 text-center text-xs text-gray-400 mb-2">{["Su","Mo","Tu","We","Th","Fr","Sa"].map(d=><div key={d}>{d}</div>)}</div>
                  <div className="grid grid-cols-7 gap-1 text-center">
                    {[...Array(firstDay)].map((_,i)=><div key={i}></div>)}
                    {[...Array(daysInMonth)].map((_,i)=>{
                      const day=i+1;
                      const isPast=new Date(currentDate.getFullYear(),currentDate.getMonth(),day)<new Date(new Date().setHours(0,0,0,0));
                      const isSel=editDepartureDate&&editDepartureDate.getDate()===day&&editDepartureDate.getMonth()===currentDate.getMonth()&&editDepartureDate.getFullYear()===currentDate.getFullYear();
                      return <button key={day} onClick={()=>!isPast&&handleDateSelect(day)} disabled={isPast} className={`py-2 rounded-lg text-sm transition-colors ${isSel?'bg-[#FD561E] text-white font-semibold':isPast?'text-gray-300 cursor-not-allowed':'hover:bg-orange-100 text-gray-700'}`}>{day}</button>;
                    })}
                  </div>
                </div>
              )}
            </div>
            <div className="relative mb-5" ref={travellerRef}>
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-1">Travellers & Class</label>
              <div onClick={openTravellerModalEdit} className="flex items-center border border-gray-200 rounded-xl px-3 h-12 bg-gray-50 mt-1 cursor-pointer hover:border-[#FD561E] hover:bg-white transition-all">
                <FaUser className="text-gray-400 w-3.5 h-3.5 flex-shrink-0 mr-2" />
                <span className="text-sm font-semibold text-gray-800 flex-1 truncate">{editPassengerText}</span>
                <FaChevronDown className="text-gray-400 w-3 h-3 flex-shrink-0" />
              </div>
            </div>
            <button onClick={handleEditSearch} disabled={!hasChanges} className={`w-full h-12 rounded-xl font-bold text-sm tracking-wide transition-all duration-200 ${hasChanges?'bg-[#FD561E] text-white shadow-md cursor-pointer hover:bg-[#e04e1b]':'bg-gray-200 text-gray-400 cursor-not-allowed'}`}>
              MODIFY SEARCH
            </button>
          </div>
        )}
      </div>

      {/* DESKTOP ONLY */}
      <div className="hidden lg:block w-full bg-[#f36b32] py-3 sticky top-0 z-40 shadow-sm">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-[1fr_auto_1fr_140px_160px_auto] items-end gap-3">
            <div className="relative" ref={fromRef}>
              <p className="text-white text-xs font-semibold mb-1">FROM</p>
              <div className="flex items-center gap-2 px-4 h-12 rounded-md bg-white shadow-sm">
                <FaMapMarkerAlt className="text-[#f36b32] w-4 h-4" />
                <input type="text" value={isEditing?editFromDisplay:(searchSummary?.fromName||'')} onChange={isEditing?handleFromInputChange:undefined} onFocus={isEditing?()=>setShowFromDropdown(true):undefined} placeholder="City or airport" readOnly={!isEditing} className={`w-full text-sm font-semibold outline-none bg-transparent ${!isEditing?'cursor-pointer':''}`} onClick={!isEditing?openEditMode:undefined} />
                {fromLoading&&<FaSpinner className="animate-spin text-gray-400" />}
              </div>
              {showFromDropdown&&isEditing&&fromAirports.length>0&&(<div className="absolute left-0 top-full w-full bg-white shadow-lg rounded-md max-h-60 overflow-y-auto z-50 border border-gray-100 mt-1">{fromAirports.map(a=><div key={a.location_code} className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-sm" onClick={()=>handleFromSelect(a)}><div className="font-medium">{a.name}</div><div className="text-xs text-gray-500">{a.location_code}</div></div>)}</div>)}
            </div>
            <div className="flex justify-center mb-1">
              <button onClick={isEditing?handleSwap:openEditMode} className="bg-white w-10 h-10 rounded-full flex items-center justify-center shadow hover:scale-110 transition-all duration-300"><FaExchangeAlt className="w-4 h-4 text-[#f36b32]" /></button>
            </div>
            <div className="relative" ref={toRef}>
              <p className="text-white text-xs font-semibold mb-1">TO</p>
              <div className="flex items-center gap-2 px-4 h-12 rounded-md bg-white shadow-sm">
                <FaMapMarkerAlt className="text-[#f36b32] w-4 h-4" />
                <input type="text" value={isEditing?editToDisplay:(searchSummary?.toName||'')} onChange={isEditing?handleToInputChange:undefined} onFocus={isEditing?()=>setShowToDropdown(true):undefined} placeholder="City or airport" readOnly={!isEditing} className={`w-full text-sm font-semibold outline-none bg-transparent ${!isEditing?'cursor-pointer':''}`} onClick={!isEditing?openEditMode:undefined} />
                {toLoading&&<FaSpinner className="animate-spin text-gray-400" />}
              </div>
              {showToDropdown&&isEditing&&toAirports.length>0&&(<div className="absolute left-0 top-full w-full bg-white shadow-lg rounded-md max-h-60 overflow-y-auto z-50 border border-gray-100 mt-1">{toAirports.map(a=><div key={a.location_code} className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-sm" onClick={()=>handleToSelect(a)}><div className="font-medium">{a.name}</div><div className="text-xs text-gray-500">{a.location_code}</div></div>)}</div>)}
            </div>
            <div className="relative">
              <p className="text-white text-xs font-semibold mb-1">DEPARTURE DATE</p>
              <div onClick={isEditing?()=>setShowDepartureCalendar(!showDepartureCalendar):openEditMode} className="flex items-center gap-2 px-4 h-12 rounded-md bg-white shadow-sm cursor-pointer">
                <FaCalendarAlt className="text-[#f36b32] w-4 h-4" />
                <input type="text" value={isEditing?(editDepartureDate?formatDateDDMMYYYY(editDepartureDate):""):(searchSummary?.formattedDate||'')} placeholder="Select date" readOnly className="w-full text-sm font-semibold outline-none bg-transparent cursor-pointer" />
              </div>
              {showDepartureCalendar&&isEditing&&(
                <div ref={departureCalendarRef} className="absolute top-full left-0 mt-2 bg-white rounded-md shadow-xl p-4 w-72 z-50">
                  <div className="flex justify-between items-center mb-3">
                    <button onClick={()=>setCurrentDate(new Date(currentDate.getFullYear(),currentDate.getMonth()-1,1))}><FaChevronLeft className="text-gray-600" /></button>
                    <h2 className="font-semibold text-sm">{monthName} {calYear}</h2>
                    <button onClick={()=>setCurrentDate(new Date(currentDate.getFullYear(),currentDate.getMonth()+1,1))}><FaChevronRight className="text-gray-600" /></button>
                  </div>
                  <div className="grid grid-cols-7 text-center text-xs text-gray-500 mb-2">{["Su","Mo","Tu","We","Th","Fr","Sa"].map(d=><div key={d}>{d}</div>)}</div>
                  <div className="grid grid-cols-7 gap-1 text-center">
                    {[...Array(firstDay)].map((_,i)=><div key={i}></div>)}
                    {[...Array(daysInMonth)].map((_,i)=>{const day=i+1;const isPast=new Date(currentDate.getFullYear(),currentDate.getMonth(),day)<new Date(new Date().setHours(0,0,0,0));const isSel=editDepartureDate&&editDepartureDate.getDate()===day&&editDepartureDate.getMonth()===currentDate.getMonth();return<button key={day} onClick={()=>!isPast&&handleDateSelect(day)} disabled={isPast} className={`p-2 rounded text-sm ${isSel?'bg-[#FD561E] text-white':isPast?'text-gray-300 cursor-not-allowed':'hover:bg-gray-100'}`}>{day}</button>;})}
                  </div>
                </div>
              )}
            </div>
            <div className="relative" ref={travellerRef}>
              <p className="text-white text-xs font-semibold mb-1">TRAVELLERS</p>
              <div onClick={isEditing?openTravellerModalEdit:openEditMode} className="flex items-center gap-2 px-4 h-12 rounded-md bg-white shadow-sm cursor-pointer">
                <FaUser className="text-[#f36b32] w-4 h-4" />
                <span className="text-sm font-semibold text-gray-700 flex-1 truncate">{isEditing?(editPassengers?`${editPassengers.ADT} Adult${editPassengers.ADT!==1?'s':''} · ${editTravelClass}`:'Select'):passengerText}</span>
                <FaChevronDown className="text-gray-400 w-3 h-3" />
              </div>
            </div>
            <div>
              {/* Always "MODIFY SEARCH" – initially disabled, enables on any change */}
              <button onClick={isEditing?handleEditSearch:openEditMode} disabled={isEditing && !hasChanges} className={`w-[150px] h-12 font-bold rounded-md shadow transition-all duration-300 ${isEditing && !hasChanges ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-white text-black cursor-pointer hover:text-[#fd561e]'}`}>
                MODIFY SEARCH
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between gap-4">
          <div className="relative">{showSortDropdown&&(<div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-10">{sortOptions.map(o=><button key={o.value} onClick={()=>{setSortBy(o.value);setShowSortDropdown(false);}} className={`block w-full text-left px-4 py-2 text-sm hover:bg-gray-50 ${sortBy===o.value?'text-[#FD561E] font-medium':'text-gray-700'}`}>{o.label}</button>)}</div>)}</div>
          <button onClick={()=>setShowMobileFilters(true)} className="lg:hidden flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium"><FaFilter className="text-[#FD561E]" />Filters{activeFilterCount>0&&<span className="bg-[#FD561E] text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">{activeFilterCount}</span>}</button>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col lg:flex-row gap-6">
          <div className="hidden lg:block lg:w-1/4">
            <FilterSidebar priceRange={priceRange} setPriceRange={setPriceRange} selectedAirlines={selectedAirlines} toggleAirline={toggleAirline} selectedStops={selectedStops} toggleStops={toggleStops} selectedTimes={selectedTimes} toggleTime={toggleTime} resetFilters={resetFilters} activeFilterCount={activeFilterCount} airlines={airlines} flightPriceRange={flightPriceRange} tripDetails={{from:searchSummary?.fromName,to:searchSummary?.toName,date:searchSummary?.formattedDate,passengers:passengerText}} onModifySearch={handleModifySearch} tripType="one-way" />
          </div>
          <div className="lg:w-3/4">
            {filteredAndSortedFlights.length===0?(
              <div className="bg-white rounded-xl p-8 text-center shadow-sm"><div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4"><FaFilter className="text-2xl text-gray-400" /></div><h3 className="text-lg font-semibold text-gray-800 mb-2">No flights match your filters</h3><p className="text-gray-600 mb-4">Try adjusting your filter criteria</p><button onClick={resetFilters} className="text-[#FD561E] font-medium hover:underline">Clear all filters</button></div>
            ):(
              filteredAndSortedFlights.map(flight=><OneWayFlightCard key={flight.id} flight={flight} isSelected={false} onSelect={()=>{}} onViewDetails={handleViewDetails} passengerCounts={passengerCounts} airlineData={airlinesMap[flight.airlineCode]} airlinesLoading={airlinesLoading} />)
            )}
          </div>
        </div>
      </div>

      {showDetailSheet&&selectedFlightForSheet&&<OneWaySheet isOpen={showDetailSheet} onClose={handleCloseSheet} flight={selectedFlightForSheet} passengerCounts={passengerCounts}  airlineData={airlinesMap[selectedFlightForSheet?.airlineCode]} 
  airlinesLoading={airlinesLoading}  />}

      {showTravellerModal&&(
        <>
          <div className="fixed inset-0 z-40 bg-black/50" onClick={cancelPassengerChanges} />
          <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-sm mx-4 bg-white rounded-2xl shadow-2xl p-5">
            <div className="flex justify-between items-center mb-4"><h3 className="font-semibold text-gray-900">Select Travellers</h3><button onClick={cancelPassengerChanges} className="text-gray-400 hover:text-gray-600"><FaTimes /></button></div>
            <div className="mb-4 p-3 bg-orange-50 rounded-lg"><div className="flex justify-between"><span className="text-sm font-medium text-gray-600">Max {maxTravellers} travellers</span><span className={`text-sm font-bold ${tempPassengers.length>=maxTravellers?"text-red-600":"text-green-600"}`}>{tempPassengers.length}/{maxTravellers}</span></div></div>
            <div className="space-y-3 mb-4 max-h-52 overflow-y-auto">
              {tempPassengers.map((p,i)=>(
                <div key={i} className="flex gap-2 p-3 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <div className="flex justify-between items-center"><span className="font-medium text-gray-700 text-sm">{p.code==='ADT'&&'Adult (12+)'}{p.code==='CNN'&&'Child (2-11)'}{p.code==='INF'&&'Infant (0-2)'}</span><button onClick={()=>removeTempPassenger(i)} className="text-gray-400 hover:text-red-500"><FaTimes className="w-3 h-3" /></button></div>
                    {(p.code==='CNN'||p.code==='INF')&&<select value={p.age||(p.code==='CNN'?8:1)} onChange={(e)=>updateTempPassengerAge(i,e.target.value)} className="w-full mt-2 px-3 py-2 text-sm border border-gray-200 rounded-lg">{p.code==='CNN'&&[...Array(10)].map((_,a)=><option key={a+2} value={a+2}>{a+2} years</option>)}{p.code==='INF'&&[...Array(3)].map((_,a)=><option key={a} value={a}>{a} year{a!==1?'s':''}</option>)}</select>}
                  </div>
                </div>
              ))}
            </div>
            <div className="flex gap-2 mb-5">
              <button className="flex-1 py-2 text-sm border rounded-lg hover:border-[#FD561E] hover:text-[#FD561E] disabled:opacity-50" onClick={()=>addTempPassenger('ADT')} disabled={tempPassengers.length>=maxTravellers}>+ Adult</button>
              <button className="flex-1 py-2 text-sm border rounded-lg hover:border-[#FD561E] hover:text-[#FD561E] disabled:opacity-50" onClick={()=>addTempPassenger('CNN')} disabled={tempPassengers.length>=maxTravellers}>+ Child</button>
              <button className="flex-1 py-2 text-sm border rounded-lg hover:border-[#FD561E] hover:text-[#FD561E] disabled:opacity-50" onClick={()=>addTempPassenger('INF')} disabled={tempPassengers.length>=maxTravellers}>+ Infant</button>
            </div>
            <div className="mb-5"><h4 className="font-medium text-gray-700 mb-3 text-sm">Travel Class</h4><div className="grid grid-cols-2 gap-2">{["Economy","Premium Economy","Business","First"].map(cls=><button key={cls} onClick={()=>setTempTravelClass(cls)} className={`py-2 rounded-lg text-sm font-medium transition-colors ${tempTravelClass===cls?"bg-[#FD561E] text-white":"bg-gray-100 text-gray-700 hover:bg-gray-200"}`}>{cls}</button>)}</div></div>
            <div className="flex gap-3"><button className="flex-1 bg-gray-100 py-3 rounded-lg font-medium text-sm" onClick={cancelPassengerChanges}>Cancel</button><button className="flex-1 bg-[#FD561E] text-white py-3 rounded-lg font-medium text-sm" onClick={applyPassengerChanges}>Apply</button></div>
          </div>
        </>
      )}

      {showMobileFilters&&(
        <div className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-50 flex">
          <div className="bg-white w-full max-w-sm ml-auto h-full overflow-auto shadow-xl">
            <div className="sticky top-0 bg-white border-b z-10"><div className="flex justify-between items-center p-4"><div><h3 className="font-bold text-lg text-gray-800">Filters</h3><p className="text-xs text-gray-500">{activeFilterCount} active filters</p></div><button onClick={()=>setShowMobileFilters(false)} className="text-gray-500 hover:text-[#FD561E] p-2 rounded-full"><FaTimes /></button></div></div>
            <div className="p-4 pb-24">
              <div className="mb-6"><h4 className="font-medium text-gray-700 mb-3">Price Range</h4><div className="space-y-3"><div className="flex items-center justify-between text-sm"><span className="font-medium">₹{priceRange.min.toLocaleString()}</span><span className="text-gray-400">—</span><span className="font-medium">₹{priceRange.max.toLocaleString()}</span></div><input type="range" min={flightPriceRange.min} max={flightPriceRange.max} value={priceRange.max} onChange={(e)=>setPriceRange(prev=>({...prev,max:parseInt(e.target.value)||0}))} className="w-full accent-[#FD561E]" /></div></div>
              {airlines.length>0&&<div className="mb-6"><h4 className="font-medium text-gray-700 mb-3">Airlines</h4><div className="space-y-2">{airlines.map(a=><label key={a.code} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-lg cursor-pointer"><div className="flex items-center"><input type="checkbox" checked={selectedAirlines.includes(a.name)} onChange={()=>toggleAirline(a.name)} className="w-4 h-4 text-[#FD561E] border-gray-300 rounded" /><span className="ml-3 text-sm text-gray-700 font-medium">{a.name}</span></div><span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">{a.count}</span></label>)}</div></div>}
              <div className="mb-6"><h4 className="font-medium text-gray-700 mb-3">Stops</h4><div className="space-y-2">{[{value:'non-stop',label:'Non-stop'},{value:'1-stop',label:'1 Stop'},{value:'2+ stops',label:'2+ Stops'}].map(s=><label key={s.value} className="flex items-center p-2 hover:bg-gray-50 rounded-lg cursor-pointer"><input type="checkbox" checked={selectedStops.includes(s.value)} onChange={()=>toggleStops(s.value)} className="w-4 h-4 text-[#FD561E] border-gray-300 rounded" /><span className="ml-3 text-sm text-gray-700">{s.label}</span></label>)}</div></div>
              <div className="mb-6"><h4 className="font-medium text-gray-700 mb-3">Departure Time</h4><div className="space-y-2">{[{value:'early-morning',label:'Early Morning (0-6)'},{value:'morning',label:'Morning (6-12)'},{value:'afternoon',label:'Afternoon (12-18)'},{value:'evening',label:'Evening (18-24)'}].map(t=><label key={t.value} className="flex items-center p-2 hover:bg-gray-50 rounded-lg cursor-pointer"><input type="checkbox" checked={selectedTimes.includes(t.value)} onChange={()=>toggleTime(t.value)} className="w-4 h-4 text-[#FD561E] border-gray-300 rounded" /><span className="ml-3 text-sm text-gray-700">{t.label}</span></label>)}</div></div>
            </div>
            <div className="sticky bottom-0 bg-white border-t p-4"><div className="flex gap-3"><button onClick={resetFilters} className="flex-1 border-2 border-gray-200 text-gray-700 font-semibold py-3 px-4 rounded-xl hover:bg-gray-50">Reset</button><button onClick={()=>setShowMobileFilters(false)} className="flex-1 bg-[#FD561E] hover:bg-[#e04e1b] text-white font-semibold py-3 px-4 rounded-xl">Show {filteredAndSortedFlights.length} flights</button></div></div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OneWayPage;