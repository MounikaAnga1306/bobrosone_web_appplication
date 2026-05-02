import React, { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useFlightSearchContext } from "../contexts/FlightSearchContext";
import { searchFlights } from "../services/flightSearchService";
import { searchAirports } from "../services/airportSearchService";
import {
  FaExchangeAlt, FaCalendarAlt, FaUser, FaMapMarkerAlt,
  FaChevronDown, FaTimes, FaSpinner, FaPlus, FaTrash,
  FaChevronLeft, FaChevronRight, FaSearch, FaArrowUp, FaArrowDown,
} from "react-icons/fa";
import { Bus, Plane, Building2, Palmtree, Car, IndianRupee } from "lucide-react";

const tabs = [
  { id: "flights", label: "Flights", icon: Plane },
  { id: "bus", label: "Bus", icon: Bus },
  { id: "billpayments", label: "Bill Payments", icon: IndianRupee },
  { id: "hotels", label: "Hotels", icon: Building2 },
  { id: "holidays", label: "Holidays", icon: Palmtree },
  { id: "cabs", label: "Cabs", icon: Car },
];

const tabRoutes = {
  bus: "/", flights: "/flights", billpayments: "/BillHomePage",
  hotels: "/hotels", holidays: "/Holiday", cabs: "/cabs",
};

const backgroundImages = [
  "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80",
  "https://images.unsplash.com/photo-1542296332-2e4473faf563?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80",
  "https://images.unsplash.com/photo-1556388158-158ea5ccacbd?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80",
  "https://images.unsplash.com/photo-1506929562872-bb421503ef21?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80",
  "https://images.unsplash.com/photo-1476514525539-6d127b40e0c8?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80",
  "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80",
  "https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80",
  "https://images.unsplash.com/photo-1501594907352-04cda38ebc29?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80",
  "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80",
  "https://images.unsplash.com/photo-1469474968028-56623f02e42e?ixlib=rb-4.0.3&auto=format&fit=crop&w=2074&q=80",
  "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?ixlib=rb-4.0.3&auto=format&fit=crop&w=2073&q=80",
  "https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80",
  "https://images.unsplash.com/photo-1533105079780-92b9be482077?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80",
  "https://images.unsplash.com/photo-1504215680859-0262fb1e90c3?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80",
  "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80",
];

const flightSpecialFares = [
  { id: "regular", label: "Regular", desc: "Regular fares" },
  { id: "student", label: "Student", desc: "Extra 10% off" },
  { id: "senior", label: "Senior Citizen", desc: "Special discount" },
  { id: "armed", label: "Armed Forces", desc: "Honorary benefit" },
  { id: "doctor", label: "Doctors", desc: "Healthcare hero" },
];

const FlightHeroSection = () => {
  const navigate = useNavigate();
  const {
    updateSearchParams, updateFlightResults, flightResults,
    updateOrigin, updateDestination, updateDepartureDate, updateReturnDate,
    updateTripType, updatePassengers,
    addLeg: contextAddLeg, removeLeg: contextRemoveLeg, updateLeg,
  } = useFlightSearchContext();

  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
  const [isDesktop, setIsDesktop] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [tripType, setTripType] = useState("one-way");

  const [legs, setLegs] = useState([
    { id: 1, from: "", to: "", fromDisplay: "", toDisplay: "", fromAirport: null, toAirport: null, date: new Date(), showFromDropdown: false, showToDropdown: false, fromAirports: [], toAirports: [], fromLoading: false, toLoading: false, fromError: "", toError: "" },
    { id: 2, from: "", to: "", fromDisplay: "", toDisplay: "", fromAirport: null, toAirport: null, date: null, showFromDropdown: false, showToDropdown: false, fromAirports: [], toAirports: [], fromLoading: false, toLoading: false, fromError: "", toError: "" },
  ]);

  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [fromDisplay, setFromDisplay] = useState("");
  const [toDisplay, setToDisplay] = useState("");
  const [selectedFromAirport, setSelectedFromAirport] = useState(null);
  const [selectedToAirport, setSelectedToAirport] = useState(null);
  const [fromError, setFromError] = useState("");
  const [toError, setToError] = useState("");
  const [sameCityError, setSameCityError] = useState("");
  const [departureDate, setDepartureDate] = useState(new Date());
  const [returnDate, setReturnDate] = useState(() => { const d = new Date(); d.setDate(d.getDate() + 3); return d; });
  const [showDepartureCalendar, setShowDepartureCalendar] = useState(false);
  const [showReturnCalendar, setShowReturnCalendar] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [activeTab, setActiveTab] = useState("flights");
  const [activeFare, setActiveFare] = useState("regular");
  const [passengers, setPassengers] = useState([{ code: 'ADT' }]);
  const [showTravellerModal, setShowTravellerModal] = useState(false);
  const [tempPassengers, setTempPassengers] = useState([]);
  const [travelClass, setTravelClass] = useState("Economy");
  const [showFromDropdown, setShowFromDropdown] = useState(false);
  const [showToDropdown, setShowToDropdown] = useState(false);
  const [fromAirports, setFromAirports] = useState([]);
  const [toAirports, setToAirports] = useState([]);
  const [fromLoading, setFromLoading] = useState(false);
  const [toLoading, setToLoading] = useState(false);

  const travellerRef = useRef(null);
  const fromRef = useRef(null);
  const toRef = useRef(null);
  const fromSearchTimeout = useRef(null);
  const toSearchTimeout = useRef(null);
  const legSearchTimeouts = useRef({});

  useEffect(() => {
    const check = () => {
      const w = window.innerWidth;
      setIsMobile(w < 768); setIsTablet(w >= 768 && w < 1024); setIsDesktop(w >= 1024);
    };
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const goToPreviousImage = () => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setCurrentImageIndex(p => p === 0 ? backgroundImages.length - 1 : p - 1);
    setTimeout(() => setIsTransitioning(false), 500);
  };

  const goToNextImage = () => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setCurrentImageIndex(p => p === backgroundImages.length - 1 ? 0 : p + 1);
    setTimeout(() => setIsTransitioning(false), 500);
  };

  useEffect(() => {
    const interval = setInterval(goToNextImage, 5000);
    return () => clearInterval(interval);
  }, [currentImageIndex, isTransitioning]);

  const getPassengerCounts = useCallback(() => ({
    adults: passengers.filter(p => p.code === 'ADT').length,
    children: passengers.filter(p => p.code === 'CNN').length,
    infants: passengers.filter(p => p.code === 'INF').length,
  }), [passengers]);

  const counts = getPassengerCounts();
  const maxTravellers = 9;

  const formatTravellersText = () => {
    const parts = [];
    if (counts.adults > 0) parts.push(`${counts.adults} Adult${counts.adults > 1 ? 's' : ''}`);
    if (counts.children > 0) parts.push(`${counts.children} Child${counts.children > 1 ? 'ren' : ''}`);
    if (counts.infants > 0) parts.push(`${counts.infants} Infant${counts.infants > 1 ? 's' : ''}`);
    return `${parts.join(', ')} · ${travelClass}`;
  };

  const formatDate = (date) => {
    if (!date) return "";
    const d = new Date(date);
    return `${String(d.getDate()).padStart(2,'0')}-${String(d.getMonth()+1).padStart(2,'0')}-${d.getFullYear()}`;
  };

  const formatDateForAPI = (date) => {
    if (!date) return null;
    const d = new Date(date);
    return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
  };

  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth()+1, 0).getDate();
  const firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();
  const nextMonthDays = new Date(currentDate.getFullYear(), currentDate.getMonth()+2, 0).getDate();
  const nextMonthFirstDay = new Date(currentDate.getFullYear(), currentDate.getMonth()+1, 1).getDay();

  const handleDateSelect = (day, isReturn = false, monthOffset = 0) => {
    const fullDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + monthOffset, day);
    if (isReturn) { setReturnDate(fullDate); updateReturnDate(fullDate); setShowReturnCalendar(false); }
    else { setDepartureDate(fullDate); updateDepartureDate(fullDate); setShowDepartureCalendar(false); }
  };

  const handleTripTypeChange = (type) => {
    setTripType(type); updateTripType(type);
    setSameCityError(""); setFromError(""); setToError("");
    if (type === 'multi-city') {
      setLegs([
        { id: 1, from: "", to: "", fromDisplay: "", toDisplay: "", fromAirport: null, toAirport: null, date: new Date(), showFromDropdown: false, showToDropdown: false, fromAirports: [], toAirports: [], fromLoading: false, toLoading: false, fromError: "", toError: "" },
        { id: 2, from: "", to: "", fromDisplay: "", toDisplay: "", fromAirport: null, toAirport: null, date: null, showFromDropdown: false, showToDropdown: false, fromAirports: [], toAirports: [], fromLoading: false, toLoading: false, fromError: "", toError: "" },
      ]);
    }
    if (type === 'round-trip' && !returnDate) {
      const d = new Date(departureDate); d.setDate(d.getDate()+3);
      setReturnDate(d); updateReturnDate(d);
    }
  };

  const searchAirportsAPI = async (searchTerm, type) => {
    if (searchTerm.length < 3) {
      if (type === "from") { setFromAirports([]); setFromLoading(false); }
      else { setToAirports([]); setToLoading(false); }
      return;
    }
    try {
      if (type === "from") { setFromLoading(true); const r = await searchAirports(searchTerm); setFromAirports(r); setFromLoading(false); }
      else { setToLoading(true); const r = await searchAirports(searchTerm); setToAirports(r); setToLoading(false); }
    } catch {
      if (type === "from") { setFromLoading(false); setFromAirports([]); }
      else { setToLoading(false); setToAirports([]); }
    }
  };

  const debouncedFromSearch = useCallback((value) => {
    if (fromSearchTimeout.current) clearTimeout(fromSearchTimeout.current);
    if (value.length >= 3) fromSearchTimeout.current = setTimeout(() => searchAirportsAPI(value, "from"), 500);
    else { setFromAirports([]); setFromLoading(false); }
  }, []);

  const debouncedToSearch = useCallback((value) => {
    if (toSearchTimeout.current) clearTimeout(toSearchTimeout.current);
    if (value.length >= 3) toSearchTimeout.current = setTimeout(() => searchAirportsAPI(value, "to"), 500);
    else { setToAirports([]); setToLoading(false); }
  }, []);

  const handleFromInputChange = (e) => {
    const v = e.target.value;
    setFromDisplay(v); setSelectedFromAirport(null); setFrom(""); setFromError(""); setSameCityError("");
    debouncedFromSearch(v); setShowFromDropdown(true);
  };

  const handleToInputChange = (e) => {
    const v = e.target.value;
    setToDisplay(v); setSelectedToAirport(null); setTo(""); setToError(""); setSameCityError("");
    debouncedToSearch(v); setShowToDropdown(true);
  };

  const handleAirportSelect = (airport, type) => {
    if (type === "from") {
      setSelectedFromAirport(airport); setFrom(airport.location_code);
      setFromDisplay(`${airport.name} (${airport.location_code})`);
      setShowFromDropdown(false); setFromAirports([]); updateOrigin(airport);
      setSameCityError(selectedToAirport?.location_code === airport.location_code ? "Departure and Destination cannot be the same" : "");
    } else {
      setSelectedToAirport(airport); setTo(airport.location_code);
      setToDisplay(`${airport.name} (${airport.location_code})`);
      setShowToDropdown(false); setToAirports([]); updateDestination(airport);
      setSameCityError(selectedFromAirport?.location_code === airport.location_code ? "Departure and Destination cannot be the same" : "");
    }
  };

  const handleSwapCities = () => {
    if (tripType !== 'one-way' && tripType !== 'round-trip') return;
    const tD = fromDisplay; setFromDisplay(toDisplay); setToDisplay(tD);
    const tS = selectedFromAirport; setSelectedFromAirport(selectedToAirport); setSelectedToAirport(tS);
    const tC = from; setFrom(to); setTo(tC);
    if (selectedToAirport) updateOrigin(selectedToAirport);
    if (selectedFromAirport) updateDestination(selectedFromAirport);
    setSameCityError(""); setFromError(""); setToError("");
  };

  const openTravellerModal = () => { setTempPassengers([...passengers]); setShowTravellerModal(true); };
  const addTempPassenger = (code) => {
    if (tempPassengers.length >= maxTravellers) return;
    const p = { code };
    if (code === 'CNN') p.age = 8;
    if (code === 'INF') p.age = 1;
    setTempPassengers([...tempPassengers, p]);
  };
  const removeTempPassenger = (index) => setTempPassengers(tempPassengers.filter((_, i) => i !== index));
  const updateTempPassengerAge = (index, age) => setTempPassengers(prev => { const u=[...prev]; u[index]={...u[index],age:parseInt(age)}; return u; });
  const applyPassengerChanges = () => {
    if (!tempPassengers.some(p => p.code === 'ADT')) { alert("At least one adult is required"); return; }
    setPassengers(tempPassengers); updatePassengers(tempPassengers); setShowTravellerModal(false);
  };
  const cancelPassengerChanges = () => { setTempPassengers([]); setShowTravellerModal(false); };

  const validateSearch = () => {
    let isValid = true;
    if (tripType === 'multi-city') {
      for (let i = 0; i < legs.length; i++) {
        const leg = legs[i];
        if (!leg.fromAirport) { updateLegField(i, 'fromError', "Please select departure city"); isValid = false; }
        if (!leg.toAirport) { updateLegField(i, 'toError', "Please select destination city"); isValid = false; }
        if (leg.fromAirport && leg.toAirport && leg.fromAirport.location_code === leg.toAirport.location_code) { updateLegField(i, 'toError', "Departure and arrival cannot be the same"); isValid = false; }
        if (!leg.date) { alert(`Please select a date for flight ${i + 1}`); isValid = false; }
      }
    } else {
      if (!selectedFromAirport) { setFromError("Please select departure city"); isValid = false; }
      if (!selectedToAirport) { setToError("Please select destination city"); isValid = false; }
      if (selectedFromAirport && selectedToAirport && selectedFromAirport.location_code === selectedToAirport.location_code) { setSameCityError("Departure and Destination cannot be the same"); isValid = false; }
      if (!departureDate) { alert("Please select departure date"); isValid = false; }
      if (tripType === "round-trip" && !returnDate) { alert("Please select return date"); isValid = false; }
    }
    if (!passengers.some(p => p.code === 'ADT')) { alert("At least one adult is required"); isValid = false; }
    return isValid;
  };

  const handleSearch = async () => {
    if (!validateSearch()) return;
    const params = new URLSearchParams();
    params.set('tripType', tripType); params.set('adults', counts.adults); params.set('children', counts.children);
    params.set('infants', counts.infants); params.set('class', travelClass); params.set('fareType', activeFare);
    if (tripType === 'multi-city') {
      params.set('legs', JSON.stringify(legs.map((leg, i) => ({ id: i+1, from: leg.fromAirport.location_code, to: leg.toAirport.location_code, fromName: leg.fromAirport.name, toName: leg.toAirport.name, date: formatDateForAPI(leg.date), fromCity: leg.fromAirport.city || leg.fromAirport.name, toCity: leg.toAirport.city || leg.toAirport.name }))));
      navigate(`/flights/multi-city?${params.toString()}`);
    } else if (tripType === 'round-trip') {
      params.set('from', selectedFromAirport.location_code); params.set('to', selectedToAirport.location_code);
      params.set('fromName', selectedFromAirport.name); params.set('toName', selectedToAirport.name);
      params.set('fromCity', selectedFromAirport.city || selectedFromAirport.name); params.set('toCity', selectedToAirport.city || selectedToAirport.name);
      params.set('departureDate', formatDateForAPI(departureDate)); params.set('returnDate', formatDateForAPI(returnDate));
      navigate(`/flights/round-trip?${params.toString()}`);
    } else {
      params.set('from', selectedFromAirport.location_code); params.set('to', selectedToAirport.location_code);
      params.set('fromName', selectedFromAirport.name); params.set('toName', selectedToAirport.name);
      params.set('fromCity', selectedFromAirport.city || selectedFromAirport.name); params.set('toCity', selectedToAirport.city || selectedToAirport.name);
      params.set('departureDate', formatDateForAPI(departureDate));
      navigate(`/flights/results?${params.toString()}`);
    }
  };

  const addNewLeg = () => {
    if (legs.length >= 6) { alert("Maximum 6 legs allowed"); return; }
    setLegs([...legs, { id: Date.now(), from: "", to: "", fromDisplay: "", toDisplay: "", fromAirport: null, toAirport: null, date: null, showFromDropdown: false, showToDropdown: false, fromAirports: [], toAirports: [], fromLoading: false, toLoading: false, fromError: "", toError: "" }]);
    contextAddLeg();
  };

  const removeLegHandler = (index) => {
    if (legs.length <= 2) { alert("Minimum 2 legs required"); return; }
    setLegs(legs.filter((_, i) => i !== index)); contextRemoveLeg(index);
  };

  const updateLegField = (index, field, value) => setLegs(prev => { const n=[...prev]; n[index]={...n[index],[field]:value}; return n; });

  const searchLegAirports = async (searchTerm, legIndex, type) => {
    if (searchTerm.length < 3) { updateLegField(legIndex, type==='from'?'fromAirports':'toAirports', []); updateLegField(legIndex, type==='from'?'fromLoading':'toLoading', false); return; }
    try {
      updateLegField(legIndex, type==='from'?'fromLoading':'toLoading', true);
      const results = await searchAirports(searchTerm);
      updateLegField(legIndex, type==='from'?'fromAirports':'toAirports', results);
      updateLegField(legIndex, type==='from'?'fromLoading':'toLoading', false);
    } catch { updateLegField(legIndex, type==='from'?'fromLoading':'toLoading', false); updateLegField(legIndex, type==='from'?'fromAirports':'toAirports', []); }
  };

  const debouncedLegSearch = useCallback((value, legIndex, type) => {
    const key = `${legIndex}-${type}`;
    if (legSearchTimeouts.current[key]) clearTimeout(legSearchTimeouts.current[key]);
    if (value.length >= 3) legSearchTimeouts.current[key] = setTimeout(() => searchLegAirports(value, legIndex, type), 500);
    else { updateLegField(legIndex, type==='from'?'fromAirports':'toAirports', []); updateLegField(legIndex, type==='from'?'fromLoading':'toLoading', false); }
  }, []);

  const handleLegFromChange = (e, index) => { const v=e.target.value; updateLegField(index,'fromDisplay',v); updateLegField(index,'fromAirport',null); updateLegField(index,'from',''); updateLegField(index,'showFromDropdown',true); updateLegField(index,'fromError',""); debouncedLegSearch(v,index,'from'); };
  const handleLegToChange = (e, index) => { const v=e.target.value; updateLegField(index,'toDisplay',v); updateLegField(index,'toAirport',null); updateLegField(index,'to',''); updateLegField(index,'showToDropdown',true); updateLegField(index,'toError',""); debouncedLegSearch(v,index,'to'); };

  const handleLegAirportSelect = (airport, index, type) => {
    if (type === 'from') {
      updateLegField(index,'fromAirport',airport); updateLegField(index,'from',airport.location_code);
      updateLegField(index,'fromDisplay',`${airport.name} (${airport.location_code})`);
      updateLegField(index,'showFromDropdown',false); updateLegField(index,'fromAirports',[]); updateLegField(index,'fromLoading',false);
      if (legs[index].toAirport?.location_code === airport.location_code) updateLegField(index,'toError',"Departure and arrival cannot be the same");
      else updateLegField(index,'toError',"");
    } else {
      updateLegField(index,'toAirport',airport); updateLegField(index,'to',airport.location_code);
      updateLegField(index,'toDisplay',`${airport.name} (${airport.location_code})`);
      updateLegField(index,'showToDropdown',false); updateLegField(index,'toAirports',[]); updateLegField(index,'toLoading',false);
      if (legs[index].fromAirport?.location_code === airport.location_code) updateLegField(index,'toError',"Departure and arrival cannot be the same");
      else updateLegField(index,'toError',"");
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (fromRef.current && !fromRef.current.contains(event.target)) setShowFromDropdown(false);
      if (toRef.current && !toRef.current.contains(event.target)) setShowToDropdown(false);
      legs.forEach((_, index) => {
        const fd = document.getElementById(`leg-from-${index}`);
        const td = document.getElementById(`leg-to-${index}`);
        if (fd && !fd.contains(event.target)) updateLegField(index,'showFromDropdown',false);
        if (td && !td.contains(event.target)) updateLegField(index,'showToDropdown',false);
      });
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [legs]);

  useEffect(() => {
    return () => {
      if (fromSearchTimeout.current) clearTimeout(fromSearchTimeout.current);
      if (toSearchTimeout.current) clearTimeout(toSearchTimeout.current);
      Object.values(legSearchTimeouts.current).forEach(clearTimeout);
    };
  }, []);

  const handleTabClick = (tab) => { setActiveTab(tab.id); navigate(tabRoutes[tab.id]); };

  const getSectionHeight = () => {
    if (isMobile) return tripType === 'multi-city' ? 'min-h-[820px]' : 'min-h-[700px]';
    if (isTablet) return tripType === 'multi-city' ? 'min-h-[680px]' : 'min-h-[530px]';
    return tripType === 'multi-city' ? 'min-h-[750px]' : 'h-[590px]';
  };

  const getHeadingSize = () => isMobile ? 'text-2xl' : isTablet ? 'text-3xl' : 'text-4xl';
  const getCardPadding = () => isMobile ? 'p-4' : isTablet ? 'p-5' : 'p-6';

  // ── DESKTOP CALENDAR ──
  const renderDesktopCalendar = (isReturn) => (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4"
      onClick={(e) => { if (e.target === e.currentTarget) isReturn ? setShowReturnCalendar(false) : setShowDepartureCalendar(false); }}>
      <div className="bg-white rounded-2xl shadow-2xl p-4 sm:p-6 max-w-full sm:max-w-4xl mx-4 overflow-x-auto">
        <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
          {[0, 1].map((offset) => {
            const mDays = offset === 0 ? daysInMonth : nextMonthDays;
            const fDay = offset === 0 ? firstDay : nextMonthFirstDay;
            const mDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + offset, 1);
            return (
              <div key={offset} className="w-full sm:w-[350px]">
                <div className="flex justify-between items-center mb-4">
                  {offset === 0 ? <button onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth()-1, 1))} className="p-2 hover:bg-gray-100 rounded-lg"><FaChevronLeft className="w-5 h-5"/></button> : <div className="w-10"/>}
                  <h2 className="font-semibold text-base sm:text-lg">{mDate.toLocaleString("default",{month:"long"})} {mDate.getFullYear()}</h2>
                  {offset === 1 ? <button onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth()+1, 1))} className="p-2 hover:bg-gray-100 rounded-lg"><FaChevronRight className="w-5 h-5"/></button> : <div className="w-10"/>}
                </div>
                <div className="grid grid-cols-7 text-center text-xs sm:text-sm text-gray-500 mb-2">
                  {["Su","Mo","Tu","We","Th","Fr","Sa"].map(d => <div key={d} className="py-2">{d}</div>)}
                </div>
                <div className="grid grid-cols-7 gap-1 text-center">
                  {[...Array(fDay)].map((_,i) => <div key={i} className="py-2"/>)}
                  {[...Array(mDays)].map((_,idx) => {
                    const day = idx+1;
                    const fullD = new Date(currentDate.getFullYear(), currentDate.getMonth()+offset, day);
                    const isPast = isReturn ? fullD < departureDate : fullD < new Date(new Date().setHours(0,0,0,0));
                    const selDate = isReturn ? returnDate : departureDate;
                    const isSel = selDate && selDate.getDate()===day && selDate.getMonth()===currentDate.getMonth()+offset;
                    return <button key={day} onClick={() => !isPast && handleDateSelect(day, isReturn, offset)} disabled={isPast} className={`py-1 sm:py-2 rounded-lg text-xs sm:text-sm ${isSel?"bg-[#FD561E] text-white":isPast?"text-gray-300 cursor-not-allowed":"hover:bg-orange-100"}`}>{day}</button>;
                  })}
                </div>
              </div>
            );
          })}
        </div>
        <div className="flex justify-end mt-4 pt-4 border-t">
          <button onClick={() => isReturn ? setShowReturnCalendar(false) : setShowDepartureCalendar(false)} className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800">Close</button>
        </div>
      </div>
    </div>
  );

  // ── MOBILE CALENDAR ──
  const renderMobileCalendar = (isReturn, onClose) => (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="bg-white rounded-2xl shadow-2xl p-4 w-full max-w-[320px]">
        <div className="flex justify-between items-center mb-4">
          <button onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth()-1, 1))} className="p-2 hover:bg-gray-100 rounded-lg"><FaChevronLeft/></button>
          <h2 className="font-semibold text-sm">{currentDate.toLocaleString("default",{month:"long"})} {currentDate.getFullYear()}</h2>
          <button onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth()+1, 1))} className="p-2 hover:bg-gray-100 rounded-lg"><FaChevronRight/></button>
        </div>
        <div className="grid grid-cols-7 text-center text-xs text-gray-500 mb-2">
          {["Su","Mo","Tu","We","Th","Fr","Sa"].map(d => <div key={d}>{d}</div>)}
        </div>
        <div className="grid grid-cols-7 gap-0.5 text-center">
          {[...Array(firstDay)].map((_,i) => <div key={i}/>)}
          {[...Array(daysInMonth)].map((_,idx) => {
            const day = idx+1;
            const fullD = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
            const isPast = isReturn ? fullD < departureDate : fullD < new Date(new Date().setHours(0,0,0,0));
            const selDate = isReturn ? returnDate : departureDate;
            const isSel = selDate && selDate.getDate()===day && selDate.getMonth()===currentDate.getMonth();
            return <button key={day} onClick={() => !isPast && handleDateSelect(day, isReturn, 0)} disabled={isPast} className={`p-1.5 rounded-lg text-xs ${isSel?"bg-[#FD561E] text-white":isPast?"text-gray-300 cursor-not-allowed":"hover:bg-orange-100"}`}>{day}</button>;
          })}
        </div>
        <div className="flex justify-end mt-3">
          <button onClick={onClose} className="px-3 py-1.5 text-sm text-gray-600">Close</button>
        </div>
      </div>
    </div>
  );

  // ── TRAVELLER MODAL ──
  const TravellerModal = () => (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/50"
      onClick={(e) => { if (e.target === e.currentTarget) { setShowTravellerModal(false); setTempPassengers([]); } }}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 p-4 sm:p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg sm:text-xl font-semibold text-gray-900">Select Travellers</h3>
          <button onClick={cancelPassengerChanges} className="text-gray-400 hover:text-gray-600"><FaTimes className="w-4 h-4 sm:w-5 sm:h-5"/></button>
        </div>
        <div className="mb-4 p-3 bg-orange-50 rounded-lg">
          <div className="flex justify-between">
            <span className="text-xs sm:text-sm font-medium text-gray-600">Max {maxTravellers} travellers</span>
            <span className={`text-xs sm:text-sm font-bold ${tempPassengers.length >= maxTravellers ? "text-red-600" : "text-green-600"}`}>{tempPassengers.length}/{maxTravellers}</span>
          </div>
        </div>
        <div className="space-y-3 mb-4 max-h-60 overflow-y-auto">
          {tempPassengers.map((p, i) => (
            <div key={i} className="flex gap-2 p-3 bg-gray-50 rounded-lg">
              <div className="flex-1">
                <div className="flex justify-between items-center">
                  <span className="font-medium text-gray-700 text-sm">{p.code==='ADT'&&'Adult (12+ years)'}{p.code==='CNN'&&'Child (2-11 years)'}{p.code==='INF'&&'Infant (0-2 years)'}</span>
                  <button onClick={() => removeTempPassenger(i)} className="text-gray-400 hover:text-red-500"><FaTimes className="w-3 h-3"/></button>
                </div>
                {(p.code==='CNN'||p.code==='INF') && (
                  <select value={p.age||(p.code==='CNN'?8:1)} onChange={(e) => updateTempPassengerAge(i,e.target.value)} className="w-full mt-2 px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#FD561E]">
                    {p.code==='CNN'&&[...Array(10)].map((_,a) => <option key={a+2} value={a+2}>{a+2} years</option>)}
                    {p.code==='INF'&&[...Array(3)].map((_,a) => <option key={a} value={a}>{a} year{a!==1?'s':''}</option>)}
                  </select>
                )}
              </div>
            </div>
          ))}
          {tempPassengers.length===0 && <div className="text-center py-8 text-gray-400 text-sm">No travellers added. Click below to add.</div>}
        </div>
        <div className="grid grid-cols-3 gap-2 mb-6">
          {['ADT','CNN','INF'].map(code => (
            <button key={code} className="py-2 text-xs sm:text-sm rounded-lg border border-gray-200 text-gray-700 hover:border-[#FD561E] hover:text-[#FD561E] transition-colors disabled:opacity-50" onClick={() => addTempPassenger(code)} disabled={tempPassengers.length>=maxTravellers}>
              + {code==='ADT'?'Adult':code==='CNN'?'Child':'Infant'}
            </button>
          ))}
        </div>
        <div className="mb-6">
          <h4 className="font-medium text-gray-700 mb-3 text-sm">Travel Class</h4>
          <div className="grid grid-cols-2 gap-2">
            {["Economy","Premium Economy","Business","First"].map(cls => (
              <button key={cls} className={`py-2 px-3 rounded-lg text-xs sm:text-sm font-medium transition-colors ${travelClass===cls?"bg-[#FD561E] text-white":"bg-gray-100 text-gray-700 hover:bg-gray-200"}`} onClick={() => setTravelClass(cls)}>{cls}</button>
            ))}
          </div>
        </div>
        <div className="flex gap-3">
          <button className="flex-1 bg-gray-100 py-3 rounded-lg font-medium text-gray-700 hover:bg-gray-200 text-sm" onClick={cancelPassengerChanges}>Cancel</button>
          <button className="flex-1 bg-[#FD561E] text-white py-3 rounded-lg font-medium hover:bg-[#e54d1a] text-sm" onClick={applyPassengerChanges}>Apply</button>
        </div>
      </div>
    </div>
  );

  // ── MULTI-CITY FORM ── (unchanged)
  const renderMultiCityForm = () => (
    <div className="space-y-4">
      {legs.map((leg, index) => (
        <div key={leg.id} className="flex flex-col sm:flex-row items-start sm:items-center gap-3 relative">
          <div className="w-16 text-xs font-medium text-gray-500">Flight {index+1}</div>
          <div className="flex-1 w-full sm:w-auto relative" id={`leg-from-${index}`}>
            <div className={`flex items-center gap-2 pb-2 border-b-2 transition-colors ${leg.fromError?"border-red-400":"border-gray-200 hover:border-[#FD561E]"}`}>
              <FaMapMarkerAlt className={`w-4 h-4 flex-shrink-0 ${leg.fromError?"text-red-400":"text-gray-400"}`}/>
              <input type="text" value={leg.fromDisplay} onChange={(e) => handleLegFromChange(e,index)} onFocus={() => updateLegField(index,'showFromDropdown',true)} placeholder="From" className="w-full text-sm font-medium outline-none bg-transparent"/>
              {leg.fromLoading && <FaSpinner className="animate-spin text-gray-400 flex-shrink-0"/>}
            </div>
            {leg.fromError && <p className="text-red-500 text-xs mt-1">{leg.fromError}</p>}
            {leg.showFromDropdown && leg.fromAirports.length > 0 && (
              <div className="absolute left-0 top-full mt-1 w-full bg-white shadow-lg rounded-xl max-h-60 overflow-y-auto z-50">
                {leg.fromAirports.map(a => <div key={a.location_code} className="px-3 py-2 hover:bg-orange-50 cursor-pointer text-sm" onClick={() => handleLegAirportSelect(a,index,'from')}><div className="font-medium truncate">{a.name}</div><div className="text-xs text-gray-500">{a.location_code}</div></div>)}
              </div>
            )}
          </div>
          <div className="flex-1 w-full sm:w-auto relative" id={`leg-to-${index}`}>
            <div className={`flex items-center gap-2 pb-2 border-b-2 transition-colors ${leg.toError?"border-red-400":"border-gray-200 hover:border-[#FD561E]"}`}>
              <FaMapMarkerAlt className={`w-4 h-4 flex-shrink-0 ${leg.toError?"text-red-400":"text-gray-400"}`}/>
              <input type="text" value={leg.toDisplay} onChange={(e) => handleLegToChange(e,index)} onFocus={() => updateLegField(index,'showToDropdown',true)} placeholder="To" className="w-full text-sm font-medium outline-none bg-transparent"/>
              {leg.toLoading && <FaSpinner className="animate-spin text-gray-400 flex-shrink-0"/>}
            </div>
            {leg.toError && <p className="text-red-500 text-xs mt-1">{leg.toError}</p>}
            {leg.showToDropdown && leg.toAirports.length > 0 && (
              <div className="absolute left-0 top-full mt-1 w-full bg-white shadow-lg rounded-xl max-h-60 overflow-y-auto z-50">
                {leg.toAirports.map(a => <div key={a.location_code} className="px-3 py-2 hover:bg-orange-50 cursor-pointer text-sm" onClick={() => handleLegAirportSelect(a,index,'to')}><div className="font-medium truncate">{a.name}</div><div className="text-xs text-gray-500">{a.location_code}</div></div>)}
              </div>
            )}
          </div>
          <div className="w-full sm:w-[110px] relative">
            <div onClick={() => { const d=prompt("Select date (YYYY-MM-DD):",leg.date?formatDateForAPI(leg.date):""); if(d) updateLegField(index,'date',new Date(d)); }} className="flex items-center gap-2 pb-2 border-b-2 border-gray-200 hover:border-[#FD561E] transition-colors cursor-pointer">
              <FaCalendarAlt className="w-4 h-4 text-gray-400 flex-shrink-0"/>
              <input type="text" value={leg.date?formatDate(leg.date):""} placeholder="Date" readOnly className="w-full text-sm font-medium outline-none bg-transparent cursor-pointer"/>
            </div>
          </div>
          {index >= 2 && <button onClick={() => removeLegHandler(index)} className="text-gray-400 hover:text-red-500 ml-auto sm:ml-1 mt-2 sm:mt-0"><FaTrash className="w-4 h-4"/></button>}
        </div>
      ))}
      {legs.length < 6 && <button onClick={addNewLeg} className="flex items-center gap-2 text-[#FD561E] font-medium text-sm mt-2"><FaPlus className="w-3 h-3"/>Add Another Flight</button>}
      <div className="mt-4 pt-2 border-t border-gray-100">
        <div className="flex items-center gap-3 pb-2 border-b-2 border-gray-200 hover:border-[#FD561E] cursor-pointer w-full sm:w-64" onClick={openTravellerModal}>
          <FaUser className="text-gray-400 w-4 h-4 flex-shrink-0"/>
          <span className="text-sm font-medium text-gray-700 flex-1 truncate">{formatTravellersText()}</span>
          <FaChevronDown className={`text-gray-400 w-3 h-3 flex-shrink-0 ${showTravellerModal?"rotate-180":""}`}/>
        </div>
      </div>
    </div>
  );

  // ── MOBILE FORM (BookingForm style) ──
  const renderMobileForm = () => (
    <div className="space-y-0">
      {/* FROM box */}
      <div className="relative border border-gray-200 rounded-xl overflow-visible">
        <div ref={fromRef} className="relative px-3 pt-3 pb-2 pr-12">
          <p className="text-[10px] text-gray-400 uppercase tracking-widest mb-1">Depart From</p>
          <div className={`flex items-center gap-2 pb-1 ${fromError?"border-b border-red-400":""}`}>
            <FaMapMarkerAlt className={`w-3.5 h-3.5 flex-shrink-0 ${fromError?"text-red-400":"text-gray-400"}`}/>
            <input type="text" placeholder="From" className="w-full text-sm font-semibold outline-none bg-transparent py-0.5"
              value={fromDisplay} onChange={handleFromInputChange} onFocus={() => setShowFromDropdown(true)}/>
            {fromLoading && <FaSpinner className="animate-spin text-gray-400 flex-shrink-0"/>}
          </div>
          {fromError && <p className="text-red-500 text-[10px] mt-0.5 flex items-center gap-1"><span>⚠</span>{fromError}</p>}
          {showFromDropdown && fromAirports.length > 0 && (
            <div className="absolute left-0 top-full w-full bg-white shadow-lg rounded-xl max-h-48 overflow-y-auto z-50 mt-1">
              {fromAirports.map(a => (
                <div key={a.location_code} onClick={() => handleAirportSelect(a,"from")} className="px-3 py-2 hover:bg-orange-50 cursor-pointer text-xs border-b last:border-0">
                  <div className="font-medium">{a.name}</div>
                  <div className="text-gray-500 text-[10px]">{a.location_code}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* TO box with swap button */}
      <div className="relative mt-2 border border-gray-200 rounded-xl overflow-visible">
        <div ref={toRef} className="relative px-3 pt-3 pb-3 pr-12">
          <p className="text-[10px] text-gray-400 uppercase tracking-widest mb-1">Going To</p>
          <div className={`flex items-center gap-2 pb-1 ${toError||sameCityError?"border-b border-red-400":""}`}>
            <FaMapMarkerAlt className={`w-3.5 h-3.5 flex-shrink-0 ${toError||sameCityError?"text-red-400":"text-gray-400"}`}/>
            <input type="text" placeholder="To" className="w-full text-sm font-semibold outline-none bg-transparent py-0.5"
              value={toDisplay} onChange={handleToInputChange} onFocus={() => setShowToDropdown(true)}/>
            {toLoading && <FaSpinner className="animate-spin text-gray-400 flex-shrink-0"/>}
          </div>
          {(toError||sameCityError) && <p className="text-red-500 text-[10px] mt-0.5 flex items-center gap-1"><span>⚠</span>{sameCityError||toError}</p>}
          {showToDropdown && toAirports.length > 0 && (
            <div className="absolute left-0 top-full w-full bg-white shadow-lg rounded-xl max-h-48 overflow-y-auto z-50 mt-1">
              {toAirports.map(a => (
                <div key={a.location_code} onClick={() => handleAirportSelect(a,"to")} className="px-3 py-2 hover:bg-orange-50 cursor-pointer text-xs border-b last:border-0">
                  <div className="font-medium">{a.name}</div>
                  <div className="text-gray-500 text-[10px]">{a.location_code}</div>
                </div>
              ))}
            </div>
          )}
        </div>
        {/* Swap button between From & To */}
        <div className="absolute right-8 -top-2 -translate-y-1/2 translate-x-1/2 z-10">
          <button onClick={handleSwapCities} className="w-8 h-8 rounded-full bg-white border border-gray-300 flex items-center justify-center shadow-sm hover:bg-orange-50 hover:border-[#FD561E] transition-all duration-200">
            <FaExchangeAlt className="w-3.5 h-3.5 text-gray-500 rotate-90"/>
          </button>
        </div>
      </div>

      {/* Depart Date */}
      <div className="relative mt-2 border border-gray-200 rounded-xl px-3 py-3">
        <p className="text-[10px] text-gray-400 uppercase tracking-widest mb-1">Depart Date</p>
        <div onClick={() => { setShowDepartureCalendar(!showDepartureCalendar); setShowReturnCalendar(false); setCurrentDate(new Date(departureDate)); }} className="flex items-center gap-2 cursor-pointer">
          <FaCalendarAlt className="w-3.5 h-3.5 text-gray-400 flex-shrink-0"/>
          <span className="text-sm font-semibold text-gray-800">{formatDate(departureDate)}</span>
        </div>
        {showDepartureCalendar && renderMobileCalendar(false, () => setShowDepartureCalendar(false))}
      </div>

      {/* Return Date (round-trip only) */}
      {tripType === "round-trip" && (
        <div className="relative mt-2 border border-gray-200 rounded-xl px-3 py-3">
          <p className="text-[10px] text-gray-400 uppercase tracking-widest mb-1">Return Date</p>
          <div onClick={() => { setShowReturnCalendar(!showReturnCalendar); setShowDepartureCalendar(false); setCurrentDate(new Date(returnDate)); }} className="flex items-center gap-2 cursor-pointer">
            <FaCalendarAlt className="w-3.5 h-3.5 text-gray-400 flex-shrink-0"/>
            <span className="text-sm font-semibold text-gray-800">{formatDate(returnDate)}</span>
          </div>
          {showReturnCalendar && renderMobileCalendar(true, () => setShowReturnCalendar(false))}
        </div>
      )}

      {/* Travellers */}
      <div className="relative mt-2 border border-gray-200 rounded-xl px-3 py-3">
        <p className="text-[10px] text-gray-400 uppercase tracking-widest mb-1">Travellers & Class</p>
        <div className="flex items-center gap-2 cursor-pointer" onClick={openTravellerModal}>
          <FaUser className="w-3.5 h-3.5 text-gray-400 flex-shrink-0"/>
          <span className="text-sm font-semibold text-gray-800 truncate flex-1">{formatTravellersText()}</span>
          <FaChevronDown className="w-3 h-3 text-gray-400 ml-auto"/>
        </div>
      </div>

      {/* Special Fares */}
      <div className="mt-3 flex flex-wrap items-center gap-1.5">
        <span className="text-[10px] font-bold uppercase tracking-wide text-gray-700">Special Fares</span>
        <div className="flex flex-wrap gap-1.5">
          {flightSpecialFares.map(fare => {
            const active = activeFare === fare.id;
            return (
              <button key={fare.id} onClick={() => setActiveFare(fare.id)} className={`px-2 py-1 rounded-lg border text-left transition-all ${active?"border-[#FD561E] bg-orange-50 shadow-sm":"border-gray-200 text-gray-600 hover:border-[#FD561E] bg-white/80"}`}>
                <span className="text-[10px] font-semibold block">{fare.label}</span>
                <span className="text-[8px] text-gray-500">{fare.desc}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );

  // ── DESKTOP ONE-WAY/ROUND-TRIP FORM ──
  const renderDesktopForm = () => (
    <div className="flex flex-col md:flex-row items-stretch md:items-center gap-4">
      <div className="flex-1 relative" ref={fromRef}>
        <div className={`flex items-center gap-2 pb-2 border-b-2 transition-colors ${fromError||sameCityError?"border-red-400":"border-gray-200 hover:border-[#FD561E]"}`}>
          <FaMapMarkerAlt className={`w-4 h-4 flex-shrink-0 ${fromError||sameCityError?"text-red-400":"text-gray-400"}`}/>
          <input type="text" value={fromDisplay} onChange={handleFromInputChange} onFocus={() => setShowFromDropdown(true)} placeholder="From" className="w-full text-sm font-medium outline-none bg-transparent"/>
          {fromLoading && <FaSpinner className="animate-spin text-gray-400 flex-shrink-0"/>}
        </div>
        {fromError && <p className="text-red-500 text-xs mt-1">{fromError}</p>}
        {showFromDropdown && fromAirports.length > 0 && (
          <div className="absolute left-0 top-full mt-1 w-full bg-white shadow-lg rounded-xl max-h-60 overflow-y-auto z-50">
            {fromAirports.map(a => <div key={a.location_code} className="px-3 py-2 hover:bg-orange-50 cursor-pointer text-sm" onClick={() => handleAirportSelect(a,"from")}><div className="font-medium truncate">{a.name}</div><div className="text-xs text-gray-500">{a.location_code}</div></div>)}
          </div>
        )}
      </div>
      <div className="flex justify-center">
        <button className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-all duration-300 hover:rotate-180 hover:scale-110 flex-shrink-0" onClick={handleSwapCities} disabled={!selectedFromAirport||!selectedToAirport}>
          <FaExchangeAlt className="w-4 h-4 text-gray-600"/>
        </button>
      </div>
      <div className="flex-1 relative" ref={toRef}>
        <div className={`flex items-center gap-2 pb-2 border-b-2 transition-colors ${toError||sameCityError?"border-red-400":"border-gray-200 hover:border-[#FD561E]"}`}>
          <FaMapMarkerAlt className={`w-4 h-4 flex-shrink-0 ${toError||sameCityError?"text-red-400":"text-gray-400"}`}/>
          <input type="text" value={toDisplay} onChange={handleToInputChange} onFocus={() => setShowToDropdown(true)} placeholder="To" className="w-full text-sm font-medium outline-none bg-transparent"/>
          {toLoading && <FaSpinner className="animate-spin text-gray-400 flex-shrink-0"/>}
        </div>
        {(toError||sameCityError) && <p className="text-red-500 text-xs mt-1">{sameCityError||toError}</p>}
        {showToDropdown && toAirports.length > 0 && (
          <div className="absolute left-0 top-full mt-1 w-full bg-white shadow-lg rounded-xl max-h-60 overflow-y-auto z-50">
            {toAirports.map(a => <div key={a.location_code} className="px-3 py-2 hover:bg-orange-50 cursor-pointer text-sm" onClick={() => handleAirportSelect(a,"to")}><div className="font-medium truncate">{a.name}</div><div className="text-xs text-gray-500">{a.location_code}</div></div>)}
          </div>
        )}
      </div>
      <div className="w-full md:w-[110px] relative">
        <div onClick={() => { setShowDepartureCalendar(!showDepartureCalendar); setShowReturnCalendar(false); setCurrentDate(new Date(departureDate)); }} className="flex items-center gap-2 pb-2 border-b-2 border-gray-200 hover:border-[#FD561E] transition-colors cursor-pointer">
          <FaCalendarAlt className="w-4 h-4 text-gray-400 flex-shrink-0"/>
          <input type="text" value={formatDate(departureDate)} placeholder="Depart" readOnly className="w-full text-sm font-medium outline-none cursor-pointer bg-transparent"/>
        </div>
        {showDepartureCalendar && renderDesktopCalendar(false)}
      </div>
      {tripType === "round-trip" && (
        <div className="w-full md:w-[110px] relative">
          <div onClick={() => { setShowReturnCalendar(!showReturnCalendar); setShowDepartureCalendar(false); setCurrentDate(new Date(returnDate)); }} className="flex items-center gap-2 pb-2 border-b-2 border-gray-200 hover:border-[#FD561E] transition-colors cursor-pointer">
            <FaCalendarAlt className="w-4 h-4 text-gray-400 flex-shrink-0"/>
            <input type="text" value={formatDate(returnDate)} placeholder="Return" readOnly className="w-full text-sm font-medium outline-none cursor-pointer bg-transparent"/>
          </div>
          {showReturnCalendar && renderDesktopCalendar(true)}
        </div>
      )}
      <div className="w-full md:w-[180px] relative">
        <div className="flex items-center gap-2 pb-2 border-b-2 border-gray-200 hover:border-[#FD561E] transition-colors cursor-pointer" onClick={openTravellerModal}>
          <FaUser className="text-gray-400 w-4 h-4 flex-shrink-0"/>
          <span className="text-sm font-medium text-gray-700 truncate flex-1">{formatTravellersText()}</span>
          <FaChevronDown className={`text-gray-400 w-3 h-3 flex-shrink-0 ${showTravellerModal?"rotate-180":""}`}/>
        </div>
      </div>
    </div>
  );

  // ── MAIN RENDER ──
  return (
    <section className={`relative ${getSectionHeight()} flex items-center justify-center overflow-hidden`}>
      {/* Carousel */}
      <div className="absolute inset-0">
        {backgroundImages.map((img, idx) => (
          <div key={idx} className={`absolute inset-0 w-full h-full transition-opacity duration-700 ${idx===currentImageIndex?"opacity-100":"opacity-0"}`}>
            <div className="relative w-full h-full">
              <img src={img} alt={`bg-${idx}`} className="w-full h-full object-cover brightness-105 contrast-105" loading={idx===0?"eager":"lazy"}/>
              <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/20 to-black/40"/>
            </div>
          </div>
        ))}
        {!isMobile && (
          <>
            <button onClick={goToPreviousImage} className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 bg-white/40 hover:bg-white/60 backdrop-blur-md rounded-full p-2 sm:p-3 transition-all z-10 shadow-lg hover:scale-110"><FaChevronLeft className="w-4 h-4 sm:w-6 sm:h-6 text-white drop-shadow-md"/></button>
            <button onClick={goToNextImage} className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 bg-white/40 hover:bg-white/60 backdrop-blur-md rounded-full p-2 sm:p-3 transition-all z-10 shadow-lg hover:scale-110"><FaChevronRight className="w-4 h-4 sm:w-6 sm:h-6 text-white drop-shadow-md"/></button>
          </>
        )}
        <div className="absolute bottom-3 sm:bottom-6 left-1/2 -translate-x-1/2 flex gap-1 sm:gap-2 z-10">
          {backgroundImages.map((_,idx) => (
            <button key={idx} onClick={() => { if(!isTransitioning){setIsTransitioning(true);setCurrentImageIndex(idx);setTimeout(()=>setIsTransitioning(false),500);} }} className={`transition-all duration-300 ${idx===currentImageIndex?"bg-white w-4 sm:w-8 h-1 sm:h-2 rounded-full shadow-md":"bg-white/50 hover:bg-white/80 w-1 sm:w-2 h-1 sm:h-2 rounded-full"}`}/>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10 w-full max-w-6xl px-3 sm:px-6">
        <div className={`text-center text-white ${isMobile?'mb-4 -mt-2':'mb-6'}`}>
          <h1 className={`${getHeadingSize()} font-bold mb-2`}>Your Journey, Our Priority</h1>
          <p className="text-xs  sm:text-base opacity-90">Fly with BOBROS for the best flight deals</p>
        </div>

        {/* ── BOOKING CARD ── */}
        <div className={`relative bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl ${getCardPadding()} border border-white/20`}>
          
          {/* Tabs - desktop only */}
          <div className="hidden lg:flex flex-wrap gap-2 sm:gap-3 mb-4 sm:mb-6">
            {tabs.map(tab => {
              const Icon = tab.icon; const active = activeTab === tab.id;
              return (
                <button key={tab.id} onClick={() => handleTabClick(tab)} className={`flex items-center gap-2 px-5 py-2 cursor-pointer rounded-full text-sm font-semibold transition-all duration-300 ${active?"bg-gradient-to-r from-[#FD561E] to-[#ff7b4a] text-white shadow-md":"bg-white/80 text-gray-600 hover:text-[#FD561E] border border-gray-200"}`}>
                  <Icon className="w-4 h-4"/><span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Trip Type */}
          <div className="flex mb-4 sm:mb-5 overflow-x-auto pb-2">
            <div className="flex bg-gray-100 rounded-lg p-1 gap-1">
              {["one-way","round-trip","multi-city"].map(type => (
                <button key={type} className={`px-3 sm:px-4 py-1 sm:py-1.5 text-xs sm:text-sm font-medium rounded-md transition capitalize whitespace-nowrap ${tripType===type?"bg-white text-gray-900 shadow-sm":"text-gray-600 hover:text-gray-800"}`} onClick={() => handleTripTypeChange(type)}>
                  {type==="one-way"?"One Way":type==="round-trip"?"Round Trip":"Multi City"}
                </button>
              ))}
            </div>
          </div>

          {/* Forms */}
          <div className="space-y-4">
            {tripType === 'multi-city' ? (
              <>
                {renderMultiCityForm()}
                <div className="flex flex-wrap items-center gap-2 sm:gap-3 pt-2">
                  <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wide text-gray-600">Special Fares</span>
                  {flightSpecialFares.map(fare => { const active=activeFare===fare.id; return <button key={fare.id} onClick={() => setActiveFare(fare.id)} className={`px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg border text-[10px] sm:text-xs transition-all ${active?"border-[#FD561E] bg-orange-50 shadow-sm":"border-gray-200 text-gray-600 hover:border-[#FD561E]"}`}><span className="font-semibold block">{fare.label}</span><span className="text-[8px] sm:text-[10px] text-gray-500 hidden sm:block">{fare.desc}</span></button>; })}
                </div>
                <div className="flex justify-center pt-6 sm:pt-8">
                  <button onClick={handleSearch} disabled={flightResults.loading} className="bg-gradient-to-r from-[#FD561E] to-[#ff7b4a] text-white cursor-pointer px-8 sm:px-16 py-3 sm:py-4 rounded-full text-sm sm:text-lg font-semibold shadow-xl hover:scale-105 transition-all disabled:opacity-50">
                    {flightResults.loading ? <div className="flex items-center gap-2"><div className="animate-spin rounded-full h-4 w-4 sm:h-5 sm:w-5 border-2 border-white border-t-transparent"/><span>SEARCHING...</span></div> : "SEARCH"}
                  </button>
                </div>
              </>
            ) : isMobile ? (
              // ── MOBILE UI ──
              <>
                {renderMobileForm()}
                {/* Search button - BookingForm style */}
                <div className="absolute left-1/2 -bottom-5 sm:-bottom-6 transform -translate-x-1/2">
                  <button onClick={handleSearch} disabled={flightResults.loading} className="bg-gradient-to-r from-[#FD561E] to-[#ff7b4a] text-white cursor-pointer px-8 py-2 rounded-full text-sm font-semibold shadow-xl hover:scale-110 transition-all disabled:opacity-50 whitespace-nowrap">
                    {flightResults.loading ? <div className="flex items-center gap-2"><div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"/><span>SEARCHING...</span></div> : "SEARCH"}
                  </button>
                </div>
              </>
            ) : (
              // ── DESKTOP/TABLET UI ──
              <>
                {renderDesktopForm()}
                <div className="flex flex-wrap items-center gap-2 sm:gap-3 pt-2">
                  <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wide text-gray-600">Special Fares</span>
                  {flightSpecialFares.map(fare => { const active=activeFare===fare.id; return <button key={fare.id} onClick={() => setActiveFare(fare.id)} className={`px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg border text-[10px] sm:text-xs transition-all ${active?"border-[#FD561E] bg-orange-50 shadow-sm":"border-gray-200 text-gray-600 hover:border-[#FD561E]"}`}><span className="font-semibold block text-[10px] sm:text-xs">{fare.label}</span><span className="text-[8px] sm:text-[10px] text-gray-500 hidden sm:block">{fare.desc}</span></button>; })}
                </div>
                <div className="flex justify-center pt-6 sm:pt-8">
                  <button onClick={handleSearch} disabled={flightResults.loading} className="bg-gradient-to-r from-[#FD561E] to-[#ff7b4a] text-white cursor-pointer px-8 sm:px-16 py-3 sm:py-4 rounded-full text-sm sm:text-lg font-semibold shadow-xl hover:scale-105 transition-all disabled:opacity-50">
                    {flightResults.loading ? <div className="flex items-center gap-2"><div className="animate-spin rounded-full h-4 w-4 sm:h-5 sm:w-5 border-2 border-white border-t-transparent"/><span>SEARCHING...</span></div> : "SEARCH"}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {showTravellerModal && <TravellerModal/>}
    </section>
  );
};

export default FlightHeroSection;