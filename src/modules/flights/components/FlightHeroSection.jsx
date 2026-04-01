// src/modules/flights/components/FlightHeroSection.jsx

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useFlightSearchContext } from "../contexts/FlightSearchContext";
import { searchFlights } from "../services/flightSearchService";
import { searchAirports } from "../services/airportSearchService";
import {
  FaSearch,
  FaExchangeAlt,
  FaCalendarAlt,
  FaUser,
  FaMapMarkerAlt,
  FaChevronDown,
  FaTimes,
  FaSpinner,
  FaPlus,
  FaTrash,
  FaChevronLeft,
  FaChevronRight,
} from "react-icons/fa";
import { Bus, Plane, Building2, Palmtree, Car } from "lucide-react";

const tabs = [
  { id: "flights", label: "Flights", icon: Plane },
  { id: "bus", label: "Bus", icon: Bus },
  { id: "hotels", label: "Hotels", icon: Building2 },
  { id: "holidays", label: "Holidays", icon: Palmtree },
  { id: "cabs", label: "Cabs", icon: Car },
];

const tabRoutes = {
  bus: "/",
  flights: "/flights",
  hotels: "/hotels",
  holidays: "/holidays",
  cabs: "/cabs",
};

// 15 travel-related background images
const backgroundImages = [
  // Modern Airports & Aircraft
  "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80", // Airplane wing at sunset
  "https://images.unsplash.com/photo-1542296332-2e4473faf563?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80", // Airport terminal modern architecture
  "https://images.unsplash.com/photo-1556388158-158ea5ccacbd?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80", // Plane taking off at golden hour
  
  // Beautiful Destinations
  "https://images.unsplash.com/photo-1506929562872-bb421503ef21?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80", // Tropical beach paradise
  "https://images.unsplash.com/photo-1476514525539-6d127b40e0c8?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80", // Mountain lake reflection
  "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80", // Majestic mountains
  
  // City Skylines
  "https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80", // New York skyline
  "https://images.unsplash.com/photo-1501594907352-04cda38ebc29?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80", // San Francisco Golden Gate
  "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80", // Dubai cityscape
  
  // Scenic Views
  "https://images.unsplash.com/photo-1469474968028-56623f02e42e?ixlib=rb-4.0.3&auto=format&fit=crop&w=2074&q=80", // Forest pathway
  "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?ixlib=rb-4.0.3&auto=format&fit=crop&w=2073&q=80", // Tropical beach with palm trees
  "https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80", // Crystal clear lake
  
  // Cultural & Iconic
  "https://images.unsplash.com/photo-1533105079780-92b9be482077?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80", // Eiffel Tower
  "https://images.unsplash.com/photo-1504215680859-0262fb1e90c3?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80", // Colosseum Rome
  "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80", // Taj Mahal
];

// Special fares for flights
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
    updateSearchParams, 
    updateFlightResults, 
    flightResults,
    updateOrigin,
    updateDestination,
    updateDepartureDate,
    updateReturnDate,
    updateTripType,
    updatePassengers,
    addLeg: contextAddLeg,
    removeLeg: contextRemoveLeg,
    updateLeg,
  } = useFlightSearchContext();

  // ============ CAROUSEL STATE ============
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  // ============ STATE MANAGEMENT ============
  
  // Trip type
  const [tripType, setTripType] = useState("one-way");
  
  // Multi-city legs
  const [legs, setLegs] = useState([
    {
      id: 1,
      from: "",
      to: "",
      fromDisplay: "",
      toDisplay: "",
      fromAirport: null,
      toAirport: null,
      date: new Date(),
      showFromDropdown: false,
      showToDropdown: false,
      fromAirports: [],
      toAirports: [],
      fromLoading: false,
      toLoading: false,
      fromError: "",
      toError: "",
    },
    {
      id: 2,
      from: "",
      to: "",
      fromDisplay: "",
      toDisplay: "",
      fromAirport: null,
      toAirport: null,
      date: null,
      showFromDropdown: false,
      showToDropdown: false,
      fromAirports: [],
      toAirports: [],
      fromLoading: false,
      toLoading: false,
      fromError: "",
      toError: "",
    }
  ]);

  // One-way/round-trip state
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [fromDisplay, setFromDisplay] = useState("");
  const [toDisplay, setToDisplay] = useState("");
  const [selectedFromAirport, setSelectedFromAirport] = useState(null);
  const [selectedToAirport, setSelectedToAirport] = useState(null);
  
  // Error states
  const [fromError, setFromError] = useState("");
  const [toError, setToError] = useState("");
  const [sameCityError, setSameCityError] = useState("");
  
  // Dates
  const [departureDate, setDepartureDate] = useState(new Date());
  const [returnDate, setReturnDate] = useState(() => {
    const date = new Date();
    date.setDate(date.getDate() + 3);
    return date;
  });
  
  // Calendar state
  const [showDepartureCalendar, setShowDepartureCalendar] = useState(false);
  const [showReturnCalendar, setShowReturnCalendar] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());
  const departureCalendarRef = useRef(null);
  const returnCalendarRef = useRef(null);
  
  const [activeTab, setActiveTab] = useState("flights");
  
  // Active special fare
  const [activeFare, setActiveFare] = useState("regular");
  
  // Traveller state
  const [passengers, setPassengers] = useState([{ code: 'ADT' }]);
  const [showTravellerModal, setShowTravellerModal] = useState(false);
  const [tempPassengers, setTempPassengers] = useState([]);
  const [travelClass, setTravelClass] = useState("Economy");

  // Dropdown states
  const [showFromDropdown, setShowFromDropdown] = useState(false);
  const [showToDropdown, setShowToDropdown] = useState(false);
  const [fromAirports, setFromAirports] = useState([]);
  const [toAirports, setToAirports] = useState([]);
  const [fromLoading, setFromLoading] = useState(false);
  const [toLoading, setToLoading] = useState(false);

  // Refs
  const travellerRef = useRef(null);
  const fromRef = useRef(null);
  const toRef = useRef(null);
  
  // Timeouts
  const fromSearchTimeout = useRef(null);
  const toSearchTimeout = useRef(null);
  const legSearchTimeouts = useRef({});

  // ============ CAROUSEL HANDLERS ============
  const goToPreviousImage = () => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setCurrentImageIndex((prevIndex) =>
      prevIndex === 0 ? backgroundImages.length - 1 : prevIndex - 1
    );
    setTimeout(() => setIsTransitioning(false), 500);
  };

  const goToNextImage = () => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setCurrentImageIndex((prevIndex) =>
      prevIndex === backgroundImages.length - 1 ? 0 : prevIndex + 1
    );
    setTimeout(() => setIsTransitioning(false), 500);
  };

  // Auto-rotate carousel
  useEffect(() => {
    const interval = setInterval(() => {
      goToNextImage();
    }, 5000);
    return () => clearInterval(interval);
  }, [currentImageIndex, isTransitioning]);

  // ============ HELPER FUNCTIONS ============

  const getPassengerCounts = useCallback(() => {
    return {
      adults: passengers.filter(p => p.code === 'ADT').length,
      children: passengers.filter(p => p.code === 'CNN').length,
      infants: passengers.filter(p => p.code === 'INF').length
    };
  }, [passengers]);

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

  // Calendar helpers
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

  const nextMonthDays = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth() + 2,
    0
  ).getDate();

  const nextMonthFirstDay = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth() + 1,
    1
  ).getDay();

  const handleDateSelect = (day, isReturn = false, monthOffset = 0) => {
    const fullDate = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth() + monthOffset,
      day
    );
    if (isReturn) {
      setReturnDate(fullDate);
      updateReturnDate(fullDate);
      setShowReturnCalendar(false);
    } else {
      setDepartureDate(fullDate);
      updateDepartureDate(fullDate);
      setShowDepartureCalendar(false);
    }
  };

  // ============ TRIP TYPE HANDLER ============

  const handleTripTypeChange = (type) => {
    setTripType(type);
    updateTripType(type);
    setSameCityError("");
    setFromError("");
    setToError("");
    
    if (type === 'multi-city') {
      setLegs([
        {
          id: 1,
          from: "",
          to: "",
          fromDisplay: "",
          toDisplay: "",
          fromAirport: null,
          toAirport: null,
          date: new Date(),
          showFromDropdown: false,
          showToDropdown: false,
          fromAirports: [],
          toAirports: [],
          fromLoading: false,
          toLoading: false,
          fromError: "",
          toError: "",
        },
        {
          id: 2,
          from: "",
          to: "",
          fromDisplay: "",
          toDisplay: "",
          fromAirport: null,
          toAirport: null,
          date: null,
          showFromDropdown: false,
          showToDropdown: false,
          fromAirports: [],
          toAirports: [],
          fromLoading: false,
          toLoading: false,
          fromError: "",
          toError: "",
        }
      ]);
    }
    
    if (type === 'round-trip' && !returnDate) {
      const defaultReturn = new Date(departureDate);
      defaultReturn.setDate(defaultReturn.getDate() + 3);
      setReturnDate(defaultReturn);
      updateReturnDate(defaultReturn);
    }
  };

  // ============ ONE-WAY/ROUND-TRIP HANDLERS ============

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
    setFromDisplay(value);
    setSelectedFromAirport(null);
    setFrom("");
    setFromError("");
    setSameCityError("");
    debouncedFromSearch(value);
    setShowFromDropdown(true);
  };

  const handleToInputChange = (e) => {
    const value = e.target.value;
    setToDisplay(value);
    setSelectedToAirport(null);
    setTo("");
    setToError("");
    setSameCityError("");
    debouncedToSearch(value);
    setShowToDropdown(true);
  };

  const handleAirportSelect = (airport, type) => {
    if (type === "from") {
      setSelectedFromAirport(airport);
      setFrom(airport.location_code);
      setFromDisplay(`${airport.name} (${airport.location_code})`);
      setShowFromDropdown(false);
      setFromAirports([]);
      updateOrigin(airport);
      
      if (selectedToAirport && selectedToAirport.location_code === airport.location_code) {
        setSameCityError("Departure and Destination cannot be the same");
      } else {
        setSameCityError("");
      }
    } else {
      setSelectedToAirport(airport);
      setTo(airport.location_code);
      setToDisplay(`${airport.name} (${airport.location_code})`);
      setShowToDropdown(false);
      setToAirports([]);
      updateDestination(airport);
      
      if (selectedFromAirport && selectedFromAirport.location_code === airport.location_code) {
        setSameCityError("Departure and Destination cannot be the same");
      } else {
        setSameCityError("");
      }
    }
  };

  const handleSwapCities = () => {
    if (tripType !== 'one-way' && tripType !== 'round-trip') return;
    
    const tempDisplay = fromDisplay;
    setFromDisplay(toDisplay);
    setToDisplay(tempDisplay);

    const tempSelected = selectedFromAirport;
    setSelectedFromAirport(selectedToAirport);
    setSelectedToAirport(tempSelected);

    const tempCode = from;
    setFrom(to);
    setTo(tempCode);

    if (selectedToAirport) updateOrigin(selectedToAirport);
    if (selectedFromAirport) updateDestination(selectedFromAirport);
    
    setSameCityError("");
    setFromError("");
    setToError("");
  };

  // ============ PASSENGER HANDLERS ============

  const openTravellerModal = () => {
    setTempPassengers([...passengers]);
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
    setPassengers(tempPassengers);
    updatePassengers(tempPassengers);
    setShowTravellerModal(false);
  };

  const cancelPassengerChanges = () => {
    setTempPassengers([]);
    setShowTravellerModal(false);
  };

  // ============ SEARCH HANDLER ============

  const validateSearch = () => {
    let isValid = true;

    if (tripType === 'multi-city') {
      for (let i = 0; i < legs.length; i++) {
        const leg = legs[i];
        if (!leg.fromAirport) {
          updateLegField(i, 'fromError', "Please select departure city");
          isValid = false;
        }
        if (!leg.toAirport) {
          updateLegField(i, 'toError', "Please select destination city");
          isValid = false;
        }
        if (leg.fromAirport && leg.toAirport && leg.fromAirport.location_code === leg.toAirport.location_code) {
          updateLegField(i, 'toError', "Departure and arrival cannot be the same");
          isValid = false;
        }
        if (!leg.date) {
          alert(`Please select a date for flight ${i + 1}`);
          isValid = false;
        }
      }
    } else {
      if (!selectedFromAirport) {
        setFromError("Please select departure city");
        isValid = false;
      }
      if (!selectedToAirport) {
        setToError("Please select destination city");
        isValid = false;
      }
      if (selectedFromAirport && selectedToAirport && selectedFromAirport.location_code === selectedToAirport.location_code) {
        setSameCityError("Departure and Destination cannot be the same");
        isValid = false;
      }
      if (!departureDate) {
        alert("Please select departure date");
        isValid = false;
      }
      if (tripType === "round-trip" && !returnDate) {
        alert("Please select return date");
        isValid = false;
      }
    }
    
    if (!passengers.some(p => p.code === 'ADT')) {
      alert("At least one adult is required");
      isValid = false;
    }
    
    return isValid;
  };

  const handleSearch = async () => {
    if (!validateSearch()) return;

    const params = new URLSearchParams();
    
    params.set('tripType', tripType);
    params.set('adults', counts.adults);
    params.set('children', counts.children);
    params.set('infants', counts.infants);
    params.set('class', travelClass);
    params.set('fareType', activeFare);
    
    if (tripType === 'multi-city') {
      const legsData = legs.map((leg, index) => ({
        id: index + 1,
        from: leg.fromAirport.location_code,
        to: leg.toAirport.location_code,
        fromName: leg.fromAirport.name,
        toName: leg.toAirport.name,
        date: formatDateForAPI(leg.date),
        fromCity: leg.fromAirport.city || leg.fromAirport.name,
        toCity: leg.toAirport.city || leg.toAirport.name
      }));
      params.set('legs', JSON.stringify(legsData));
      navigate(`/flights/multi-city?${params.toString()}`);
    } else if (tripType === 'round-trip') {
      params.set('from', selectedFromAirport.location_code);
      params.set('to', selectedToAirport.location_code);
      params.set('fromName', selectedFromAirport.name);
      params.set('toName', selectedToAirport.name);
      params.set('fromCity', selectedFromAirport.city || selectedFromAirport.name);
      params.set('toCity', selectedToAirport.city || selectedToAirport.name);
      params.set('departureDate', formatDateForAPI(departureDate));
      params.set('returnDate', formatDateForAPI(returnDate));
      navigate(`/flights/round-trip?${params.toString()}`);
    } else {
      params.set('from', selectedFromAirport.location_code);
      params.set('to', selectedToAirport.location_code);
      params.set('fromName', selectedFromAirport.name);
      params.set('toName', selectedToAirport.name);
      params.set('fromCity', selectedFromAirport.city || selectedFromAirport.name);
      params.set('toCity', selectedToAirport.city || selectedToAirport.name);
      params.set('departureDate', formatDateForAPI(departureDate));
      navigate(`/flights/results?${params.toString()}`);
    }
  };

  // ============ MULTI-CITY HANDLERS ============

  const addNewLeg = () => {
    if (legs.length >= 6) {
      alert("Maximum 6 legs allowed");
      return;
    }

    const newLeg = {
      id: Date.now(),
      from: "",
      to: "",
      fromDisplay: "",
      toDisplay: "",
      fromAirport: null,
      toAirport: null,
      date: null,
      showFromDropdown: false,
      showToDropdown: false,
      fromAirports: [],
      toAirports: [],
      fromLoading: false,
      toLoading: false,
      fromError: "",
      toError: "",
    };

    setLegs([...legs, newLeg]);
    contextAddLeg();
  };

  const removeLegHandler = (index) => {
    if (legs.length <= 2) {
      alert("Minimum 2 legs required");
      return;
    }
    setLegs(legs.filter((_, i) => i !== index));
    contextRemoveLeg(index);
  };

  const updateLegField = (index, field, value) => {
    setLegs(prev => {
      const newLegs = [...prev];
      newLegs[index] = { ...newLegs[index], [field]: value };
      return newLegs;
    });
  };

  // Airport search for multi-city
  const searchLegAirports = async (searchTerm, legIndex, type) => {
    if (searchTerm.length < 3) {
      updateLegField(legIndex, type === 'from' ? 'fromAirports' : 'toAirports', []);
      updateLegField(legIndex, type === 'from' ? 'fromLoading' : 'toLoading', false);
      return;
    }

    try {
      updateLegField(legIndex, type === 'from' ? 'fromLoading' : 'toLoading', true);
      const results = await searchAirports(searchTerm);
      updateLegField(legIndex, type === 'from' ? 'fromAirports' : 'toAirports', results);
      updateLegField(legIndex, type === 'from' ? 'fromLoading' : 'toLoading', false);
    } catch (error) {
      updateLegField(legIndex, type === 'from' ? 'fromLoading' : 'toLoading', false);
      updateLegField(legIndex, type === 'from' ? 'fromAirports' : 'toAirports', []);
    }
  };

  const debouncedLegSearch = useCallback((value, legIndex, type) => {
    const key = `${legIndex}-${type}`;
    if (legSearchTimeouts.current[key]) {
      clearTimeout(legSearchTimeouts.current[key]);
    }

    if (value.length >= 3) {
      legSearchTimeouts.current[key] = setTimeout(() => {
        searchLegAirports(value, legIndex, type);
      }, 500);
    } else {
      updateLegField(legIndex, type === 'from' ? 'fromAirports' : 'toAirports', []);
      updateLegField(legIndex, type === 'from' ? 'fromLoading' : 'toLoading', false);
    }
  }, []);

  const handleLegFromChange = (e, index) => {
    const value = e.target.value;
    updateLegField(index, 'fromDisplay', value);
    updateLegField(index, 'fromAirport', null);
    updateLegField(index, 'from', '');
    updateLegField(index, 'showFromDropdown', true);
    updateLegField(index, 'fromError', "");
    debouncedLegSearch(value, index, 'from');
  };

  const handleLegToChange = (e, index) => {
    const value = e.target.value;
    updateLegField(index, 'toDisplay', value);
    updateLegField(index, 'toAirport', null);
    updateLegField(index, 'to', '');
    updateLegField(index, 'showToDropdown', true);
    updateLegField(index, 'toError', "");
    debouncedLegSearch(value, index, 'to');
  };

  const handleLegAirportSelect = (airport, index, type) => {
    if (type === 'from') {
      updateLegField(index, 'fromAirport', airport);
      updateLegField(index, 'from', airport.location_code);
      updateLegField(index, 'fromDisplay', `${airport.name} (${airport.location_code})`);
      updateLegField(index, 'showFromDropdown', false);
      updateLegField(index, 'fromAirports', []);
      updateLegField(index, 'fromLoading', false);
      
      const currentLeg = legs[index];
      if (currentLeg.toAirport && currentLeg.toAirport.location_code === airport.location_code) {
        updateLegField(index, 'toError', "Departure and arrival cannot be the same");
      } else {
        updateLegField(index, 'toError', "");
      }
    } else {
      updateLegField(index, 'toAirport', airport);
      updateLegField(index, 'to', airport.location_code);
      updateLegField(index, 'toDisplay', `${airport.name} (${airport.location_code})`);
      updateLegField(index, 'showToDropdown', false);
      updateLegField(index, 'toAirports', []);
      updateLegField(index, 'toLoading', false);
      
      const currentLeg = legs[index];
      if (currentLeg.fromAirport && currentLeg.fromAirport.location_code === airport.location_code) {
        updateLegField(index, 'toError', "Departure and arrival cannot be the same");
      } else {
        updateLegField(index, 'toError', "");
      }
    }
  };

  // ============ EFFECTS ============

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (fromRef.current && !fromRef.current.contains(event.target)) {
        setShowFromDropdown(false);
      }
      if (toRef.current && !toRef.current.contains(event.target)) {
        setShowToDropdown(false);
      }
      
      legs.forEach((_, index) => {
        const fromDropdown = document.getElementById(`leg-from-${index}`);
        const toDropdown = document.getElementById(`leg-to-${index}`);
        
        if (fromDropdown && !fromDropdown.contains(event.target)) {
          updateLegField(index, 'showFromDropdown', false);
        }
        if (toDropdown && !toDropdown.contains(event.target)) {
          updateLegField(index, 'showToDropdown', false);
        }
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

  const handleTabClick = (tab) => {
    setActiveTab(tab.id);
    navigate(tabRoutes[tab.id]);
  };

  // ============ TRAVELLER MODAL COMPONENT ============
  const TravellerModal = () => (
    <div 
      className="fixed inset-0 z-[200] flex items-center justify-center bg-black/50"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          setShowTravellerModal(false);
          setTempPassengers([]);
        }
      }}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold text-gray-900">Select Travellers</h3>
          <button 
            onClick={cancelPassengerChanges} 
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <FaTimes className="w-5 h-5" />
          </button>
        </div>
        
        <div className="mb-4 p-3 bg-orange-50 rounded-lg">
          <div className="flex justify-between">
            <span className="text-sm font-medium text-gray-600">Max {maxTravellers} travellers</span>
            <span className={`text-sm font-bold ${
              tempPassengers.length >= maxTravellers ? "text-red-600" : "text-green-600"
            }`}>
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
                    {p.code === 'ADT' && 'Adult (12+ years)'}
                    {p.code === 'CNN' && 'Child (2-11 years)'}
                    {p.code === 'INF' && 'Infant (0-2 years)'}
                  </span>
                  <button onClick={() => removeTempPassenger(i)} className="text-gray-400 hover:text-red-500">
                    <FaTimes className="w-3 h-3" />
                  </button>
                </div>
                {(p.code === 'CNN' || p.code === 'INF') && (
                  <select
                    value={p.age || (p.code === 'CNN' ? 8 : 1)}
                    onChange={(e) => updateTempPassengerAge(i, e.target.value)}
                    className="w-full mt-2 px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#FD561E]"
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
          {tempPassengers.length === 0 && (
            <div className="text-center py-8 text-gray-400">
              No travellers added. Click below to add.
            </div>
          )}
        </div>

        <div className="grid grid-cols-3 gap-2 mb-6">
          <button
            className="py-2 text-sm rounded-lg border border-gray-200 text-gray-700 hover:border-[#FD561E] hover:text-[#FD561E] transition-colors disabled:opacity-50"
            onClick={() => addTempPassenger('ADT')}
            disabled={tempPassengers.length >= maxTravellers}
          >
            + Adult
          </button>
          <button
            className="py-2 text-sm rounded-lg border border-gray-200 text-gray-700 hover:border-[#FD561E] hover:text-[#FD561E] transition-colors disabled:opacity-50"
            onClick={() => addTempPassenger('CNN')}
            disabled={tempPassengers.length >= maxTravellers}
          >
            + Child
          </button>
          <button
            className="py-2 text-sm rounded-lg border border-gray-200 text-gray-700 hover:border-[#FD561E] hover:text-[#FD561E] transition-colors disabled:opacity-50"
            onClick={() => addTempPassenger('INF')}
            disabled={tempPassengers.length >= maxTravellers}
          >
            + Infant
          </button>
        </div>

        <div className="mb-6">
          <h4 className="font-medium text-gray-700 mb-3">Travel Class</h4>
          <div className="grid grid-cols-2 gap-2">
            {["Economy", "Premium Economy", "Business", "First"].map(cls => (
              <button
                key={cls}
                className={`py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
                  travelClass === cls
                    ? "bg-[#FD561E] text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
                onClick={() => setTravelClass(cls)}
              >
                {cls}
              </button>
            ))}
          </div>
        </div>

        <div className="flex gap-3">
          <button 
            className="flex-1 bg-gray-100 py-3 rounded-lg font-medium text-gray-700 hover:bg-gray-200 transition-colors" 
            onClick={cancelPassengerChanges}
          >
            Cancel
          </button>
          <button 
            className="flex-1 bg-[#FD561E] text-white py-3 rounded-lg font-medium hover:bg-[#e54d1a] transition-colors" 
            onClick={applyPassengerChanges}
          >
            Apply
          </button>
        </div>
      </div>
    </div>
  );

  // ============ RENDER MULTI-CITY FORM ============
  const renderMultiCityForm = () => (
    <div className="space-y-4">
      {legs.map((leg, index) => (
        <div key={leg.id} className="flex items-center gap-3 relative">
          {/* Flight Label */}
          <div className="w-16 text-xs font-medium text-gray-500">
            Flight {index + 1}
          </div>
          
          {/* From Field */}
          <div className="flex-1 relative" id={`leg-from-${index}`}>
            <div className={`flex items-center gap-2 pb-2 border-b-2 transition-colors ${
              leg.fromError ? "border-red-400" : "border-gray-200 hover:border-[#FD561E]"
            }`}>
              <FaMapMarkerAlt className={`w-4 h-4 ${leg.fromError ? "text-red-400" : "text-gray-400"}`} />
              <input
                type="text"
                value={leg.fromDisplay}
                onChange={(e) => handleLegFromChange(e, index)}
                onFocus={() => updateLegField(index, 'showFromDropdown', true)}
                placeholder="From"
                className="w-full text-sm font-medium outline-none bg-transparent"
              />
              {leg.fromLoading && <FaSpinner className="animate-spin text-gray-400" />}
            </div>
            {leg.fromError && (
              <p className="text-red-500 text-xs mt-1">{leg.fromError}</p>
            )}
            {leg.showFromDropdown && leg.fromAirports.length > 0 && (
              <div className="absolute left-0 top-full mt-1 w-full bg-white shadow-lg rounded-xl max-h-60 overflow-y-auto z-50">
                {leg.fromAirports.map((airport) => (
                  <div
                    key={airport.location_code}
                    className="px-3 py-2 hover:bg-orange-50 cursor-pointer text-sm"
                    onClick={() => handleLegAirportSelect(airport, index, 'from')}
                  >
                    <div className="font-medium">{airport.name}</div>
                    <div className="text-xs text-gray-500">{airport.location_code}</div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* To Field */}
          <div className="flex-1 relative" id={`leg-to-${index}`}>
            <div className={`flex items-center gap-2 pb-2 border-b-2 transition-colors ${
              leg.toError ? "border-red-400" : "border-gray-200 hover:border-[#FD561E]"
            }`}>
              <FaMapMarkerAlt className={`w-4 h-4 ${leg.toError ? "text-red-400" : "text-gray-400"}`} />
              <input
                type="text"
                value={leg.toDisplay}
                onChange={(e) => handleLegToChange(e, index)}
                onFocus={() => updateLegField(index, 'showToDropdown', true)}
                placeholder="To"
                className="w-full text-sm font-medium outline-none bg-transparent"
              />
              {leg.toLoading && <FaSpinner className="animate-spin text-gray-400" />}
            </div>
            {leg.toError && (
              <p className="text-red-500 text-xs mt-1">{leg.toError}</p>
            )}
            {leg.showToDropdown && leg.toAirports.length > 0 && (
              <div className="absolute left-0 top-full mt-1 w-full bg-white shadow-lg rounded-xl max-h-60 overflow-y-auto z-50">
                {leg.toAirports.map((airport) => (
                  <div
                    key={airport.location_code}
                    className="px-3 py-2 hover:bg-orange-50 cursor-pointer text-sm"
                    onClick={() => handleLegAirportSelect(airport, index, 'to')}
                  >
                    <div className="font-medium">{airport.name}</div>
                    <div className="text-xs text-gray-500">{airport.location_code}</div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Date Field */}
          <div className="w-[110px] relative">
            <div 
              onClick={() => {
                const newDate = prompt("Select date (YYYY-MM-DD):", leg.date ? formatDateForAPI(leg.date) : "");
                if (newDate) {
                  updateLegField(index, 'date', new Date(newDate));
                }
              }}
              className="flex items-center gap-2 pb-2 border-b-2 border-gray-200 hover:border-[#FD561E] transition-colors cursor-pointer"
            >
              <FaCalendarAlt className="w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={leg.date ? formatDate(leg.date) : ""}
                placeholder="Date"
                readOnly
                className="w-full text-sm font-medium outline-none bg-transparent cursor-pointer"
              />
            </div>
          </div>

          {/* Delete Button */}
          {index >= 2 && (
            <button
              onClick={() => removeLegHandler(index)}
              className="text-gray-400 hover:text-red-500 transition-colors ml-1"
            >
              <FaTrash className="w-4 h-4" />
            </button>
          )}
        </div>
      ))}

      {legs.length < 6 && (
        <button
          onClick={addNewLeg}
          className="flex items-center gap-2 text-[#FD561E] hover:text-[#e54d1a] font-medium text-sm transition-colors mt-2"
        >
          <FaPlus className="w-3 h-3" />
          Add Another Flight
        </button>
      )}
      
      {/* Travellers Field for Multi-City */}
      <div className="mt-4 pt-2 border-t border-gray-100">
        <div
          className="flex items-center gap-3 pb-2 border-b-2 border-gray-200 hover:border-[#FD561E] transition-colors cursor-pointer w-full md:w-64"
          onClick={openTravellerModal}
        >
          <FaUser className="text-gray-400 w-4 h-4" />
          <span className="text-sm font-medium text-gray-700 flex-1">{formatTravellersText()}</span>
          <FaChevronDown className={`text-gray-400 w-3 h-3 transition-transform ${showTravellerModal ? "rotate-180" : ""}`} />
        </div>
      </div>
    </div>
  );

  // ============ RENDER ONE-WAY/ROUND-TRIP FORM ============
  const renderOneWayRoundTripForm = () => (
    <div className="flex items-center gap-4">
      {/* From Field */}
      <div className="flex-1 relative" ref={fromRef}>
        <div className={`flex items-center gap-2 pb-2 border-b-2 transition-colors ${
          fromError || sameCityError ? "border-red-400" : "border-gray-200 hover:border-[#FD561E]"
        }`}>
          <FaMapMarkerAlt className={`w-4 h-4 ${fromError || sameCityError ? "text-red-400" : "text-gray-400"}`} />
          <input
            type="text"
            value={fromDisplay}
            onChange={handleFromInputChange}
            onFocus={() => setShowFromDropdown(true)}
            placeholder="From"
            className="w-full text-sm font-medium outline-none bg-transparent"
          />
          {fromLoading && <FaSpinner className="animate-spin text-gray-400" />}
        </div>
        {fromError && (
          <p className="text-red-500 text-xs mt-1">{fromError}</p>
        )}
        {showFromDropdown && fromAirports.length > 0 && (
          <div className="absolute left-0 top-full mt-1 w-full bg-white shadow-lg rounded-xl max-h-60 overflow-y-auto z-50">
            {fromAirports.map((airport) => (
              <div
                key={airport.location_code}
                className="px-3 py-2 hover:bg-orange-50 cursor-pointer text-sm"
                onClick={() => handleAirportSelect(airport, "from")}
              >
                <div className="font-medium">{airport.name}</div>
                <div className="text-xs text-gray-500">{airport.location_code}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Swap Button */}
      <button
        className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-all duration-500 hover:rotate-180 flex-shrink-0"
        onClick={handleSwapCities}
        disabled={!selectedFromAirport || !selectedToAirport}
      >
        <FaExchangeAlt className="w-4 h-4 text-gray-600" />
      </button>

      {/* To Field */}
      <div className="flex-1 relative" ref={toRef}>
        <div className={`flex items-center gap-2 pb-2 border-b-2 transition-colors ${
          toError || sameCityError ? "border-red-400" : "border-gray-200 hover:border-[#FD561E]"
        }`}>
          <FaMapMarkerAlt className={`w-4 h-4 ${toError || sameCityError ? "text-red-400" : "text-gray-400"}`} />
          <input
            type="text"
            value={toDisplay}
            onChange={handleToInputChange}
            onFocus={() => setShowToDropdown(true)}
            placeholder="To"
            className="w-full text-sm font-medium outline-none bg-transparent"
          />
          {toLoading && <FaSpinner className="animate-spin text-gray-400" />}
        </div>
        {(toError || sameCityError) && (
          <p className="text-red-500 text-xs mt-1">{sameCityError || toError}</p>
        )}
        {showToDropdown && toAirports.length > 0 && (
          <div className="absolute left-0 top-full mt-1 w-full bg-white shadow-lg rounded-xl max-h-60 overflow-y-auto z-50">
            {toAirports.map((airport) => (
              <div
                key={airport.location_code}
                className="px-3 py-2 hover:bg-orange-50 cursor-pointer text-sm"
                onClick={() => handleAirportSelect(airport, "to")}
              >
                <div className="font-medium">{airport.name}</div>
                <div className="text-xs text-gray-500">{airport.location_code}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Departure Date */}
      <div className="w-[110px] relative">
        <div
          onClick={() => {
            setShowDepartureCalendar(!showDepartureCalendar);
            setShowReturnCalendar(false);
            setCurrentDate(new Date(departureDate));
          }}
          className="flex items-center gap-2 pb-2 border-b-2 border-gray-200 hover:border-[#FD561E] transition-colors cursor-pointer"
        >
          <FaCalendarAlt className="w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={formatDate(departureDate)}
            placeholder="Depart"
            readOnly
            className="w-full text-sm font-medium outline-none cursor-pointer bg-transparent"
          />
        </div>
        {showDepartureCalendar && (
          <div 
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50"
            onClick={(e) => {
              if (e.target === e.currentTarget) setShowDepartureCalendar(false);
            }}
          >
            <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-4xl mx-4">
              <div className="flex gap-6">
                <div className="w-[350px]">
                  <div className="flex justify-between items-center mb-4">
                    <button onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))} className="p-2 hover:bg-gray-100 rounded-lg">
                      <FaChevronLeft className="w-5 h-5" />
                    </button>
                    <h2 className="font-semibold text-lg">{currentDate.toLocaleString("default", { month: "long" })} {currentDate.getFullYear()}</h2>
                    <div className="w-10" />
                  </div>
                  <div className="grid grid-cols-7 text-center text-sm text-gray-500 mb-2">
                    {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map(day => <div key={day} className="py-2">{day}</div>)}
                  </div>
                  <div className="grid grid-cols-7 gap-1 text-center">
                    {[...Array(firstDay)].map((_, i) => <div key={i} className="py-2"></div>)}
                    {[...Array(daysInMonth)].map((_, index) => {
                      const day = index + 1;
                      const isPastDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day) < new Date(new Date().setHours(0,0,0,0));
                      const isSelected = departureDate && departureDate.getDate() === day && departureDate.getMonth() === currentDate.getMonth();
                      return (
                        <button
                          key={day}
                          onClick={() => !isPastDate && handleDateSelect(day, false, 0)}
                          disabled={isPastDate}
                          className={`py-2 rounded-lg ${isSelected ? "bg-[#FD561E] text-white" : isPastDate ? "text-gray-300 cursor-not-allowed" : "hover:bg-orange-100"}`}
                        >
                          {day}
                        </button>
                      );
                    })}
                  </div>
                </div>
                <div className="w-[350px]">
                  <div className="flex justify-between items-center mb-4">
                    <div className="w-10" />
                    <h2 className="font-semibold text-lg">{new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1).toLocaleString("default", { month: "long" })} {currentDate.getFullYear()}</h2>
                    <button onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))} className="p-2 hover:bg-gray-100 rounded-lg">
                      <FaChevronRight className="w-5 h-5" />
                    </button>
                  </div>
                  <div className="grid grid-cols-7 text-center text-sm text-gray-500 mb-2">
                    {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map(day => <div key={day} className="py-2">{day}</div>)}
                  </div>
                  <div className="grid grid-cols-7 gap-1 text-center">
                    {[...Array(nextMonthFirstDay)].map((_, i) => <div key={i} className="py-2"></div>)}
                    {[...Array(nextMonthDays)].map((_, index) => {
                      const day = index + 1;
                      const isPastDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, day) < new Date(new Date().setHours(0,0,0,0));
                      const isSelected = departureDate && departureDate.getDate() === day && departureDate.getMonth() === currentDate.getMonth() + 1;
                      return (
                        <button
                          key={day}
                          onClick={() => !isPastDate && handleDateSelect(day, false, 1)}
                          disabled={isPastDate}
                          className={`py-2 rounded-lg ${isSelected ? "bg-[#FD561E] text-white" : isPastDate ? "text-gray-300 cursor-not-allowed" : "hover:bg-orange-100"}`}
                        >
                          {day}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
              <div className="flex justify-end mt-4 pt-4 border-t">
                <button onClick={() => setShowDepartureCalendar(false)} className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800">Close</button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Return Date */}
      {tripType === "round-trip" && (
        <div className="w-[110px] relative">
          <div
            onClick={() => {
              setShowReturnCalendar(!showReturnCalendar);
              setShowDepartureCalendar(false);
              setCurrentDate(new Date(returnDate));
            }}
            className="flex items-center gap-2 pb-2 border-b-2 border-gray-200 hover:border-[#FD561E] transition-colors cursor-pointer"
          >
            <FaCalendarAlt className="w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={formatDate(returnDate)}
              placeholder="Return"
              readOnly
              className="w-full text-sm font-medium outline-none cursor-pointer bg-transparent"
            />
          </div>
          {showReturnCalendar && (
            <div 
              className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50"
              onClick={(e) => {
                if (e.target === e.currentTarget) setShowReturnCalendar(false);
              }}
            >
              <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-4xl mx-4">
                <div className="flex gap-6">
                  <div className="w-[350px]">
                    <div className="flex justify-between items-center mb-4">
                      <button onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))} className="p-2 hover:bg-gray-100 rounded-lg">
                        <FaChevronLeft className="w-5 h-5" />
                      </button>
                      <h2 className="font-semibold text-lg">{currentDate.toLocaleString("default", { month: "long" })} {currentDate.getFullYear()}</h2>
                      <div className="w-10" />
                    </div>
                    <div className="grid grid-cols-7 text-center text-sm text-gray-500 mb-2">
                      {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map(day => <div key={day} className="py-2">{day}</div>)}
                    </div>
                    <div className="grid grid-cols-7 gap-1 text-center">
                      {[...Array(firstDay)].map((_, i) => <div key={i} className="py-2"></div>)}
                      {[...Array(daysInMonth)].map((_, index) => {
                        const day = index + 1;
                        const isPastDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day) < departureDate;
                        const isSelected = returnDate && returnDate.getDate() === day && returnDate.getMonth() === currentDate.getMonth();
                        return (
                          <button
                            key={day}
                            onClick={() => !isPastDate && handleDateSelect(day, true, 0)}
                            disabled={isPastDate}
                            className={`py-2 rounded-lg ${isSelected ? "bg-[#FD561E] text-white" : isPastDate ? "text-gray-300 cursor-not-allowed" : "hover:bg-orange-100"}`}
                          >
                            {day}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                  <div className="w-[350px]">
                    <div className="flex justify-between items-center mb-4">
                      <div className="w-10" />
                      <h2 className="font-semibold text-lg">{new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1).toLocaleString("default", { month: "long" })} {currentDate.getFullYear()}</h2>
                      <button onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))} className="p-2 hover:bg-gray-100 rounded-lg">
                        <FaChevronRight className="w-5 h-5" />
                      </button>
                    </div>
                    <div className="grid grid-cols-7 text-center text-sm text-gray-500 mb-2">
                      {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map(day => <div key={day} className="py-2">{day}</div>)}
                    </div>
                    <div className="grid grid-cols-7 gap-1 text-center">
                      {[...Array(nextMonthFirstDay)].map((_, i) => <div key={i} className="py-2"></div>)}
                      {[...Array(nextMonthDays)].map((_, index) => {
                        const day = index + 1;
                        const isPastDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, day) < departureDate;
                        const isSelected = returnDate && returnDate.getDate() === day && returnDate.getMonth() === currentDate.getMonth() + 1;
                        return (
                          <button
                            key={day}
                            onClick={() => !isPastDate && handleDateSelect(day, true, 1)}
                            disabled={isPastDate}
                            className={`py-2 rounded-lg ${isSelected ? "bg-[#FD561E] text-white" : isPastDate ? "text-gray-300 cursor-not-allowed" : "hover:bg-orange-100"}`}
                          >
                            {day}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
                <div className="flex justify-end mt-4 pt-4 border-t">
                  <button onClick={() => setShowReturnCalendar(false)} className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800">Close</button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Travellers Field - In the same row for one-way/round-trip */}
      <div className="w-[180px] relative">
        <div
          className="flex items-center gap-2 pb-2 border-b-2 border-gray-200 hover:border-[#FD561E] transition-colors cursor-pointer"
          onClick={openTravellerModal}
        >
          <FaUser className="text-gray-400 w-4 h-4" />
          <span className="text-sm font-medium text-gray-700 truncate flex-1">{formatTravellersText()}</span>
          <FaChevronDown className={`text-gray-400 w-3 h-3 transition-transform ${showTravellerModal ? "rotate-180" : ""}`} />
        </div>
      </div>
    </div>
  );

  // ============ MAIN RENDER ============
  return (
    <section className={`relative ${tripType === 'multi-city' ? 'min-h-[750px]' : 'h-[590px]'} flex items-center justify-center overflow-hidden`}>
      {/* Carousel Background */}
      <div className="absolute inset-0">
      {backgroundImages.map((img, idx) => (
        <div
          key={idx}
          className={`absolute inset-0 w-full h-full transition-opacity duration-700 ${
            idx === currentImageIndex ? "opacity-100" : "opacity-0"
          }`}
        >
          {/* Enhanced Image with brightness filter */}
          <div className="relative w-full h-full">
            <img
              src={img}
              alt={`Travel background ${idx + 1}`}
              className="w-full h-full object-cover brightness-105 contrast-105"
              loading={idx === 0 ? "eager" : "lazy"}
            />
            {/* Gradient Overlay - More subtle and modern */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/20 to-black/40" />
          </div>
        </div>
      ))}
      
      {/* Optional: Soft vignette effect for better focus on content */}
      <div className="absolute inset-0 bg-radial-gradient from-transparent via-transparent to-black/30 pointer-events-none" />
      
      {/* Carousel Navigation Buttons - Enhanced styling */}
      <button
        onClick={goToPreviousImage}
        className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/40 hover:bg-white/60 backdrop-blur-md rounded-full p-3 transition-all duration-300 z-10 shadow-lg hover:scale-110"
      >
        <FaChevronLeft className="w-6 h-6 text-white drop-shadow-md" />
      </button>
      <button
        onClick={goToNextImage}
        className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/40 hover:bg-white/60 backdrop-blur-md rounded-full p-3 transition-all duration-300 z-10 shadow-lg hover:scale-110"
      >
        <FaChevronRight className="w-6 h-6 text-white drop-shadow-md" />
      </button>
      
      {/* Carousel Dots - Enhanced visibility */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-10">
        {backgroundImages.map((_, idx) => (
          <button
            key={idx}
            onClick={() => {
              if (!isTransitioning) {
                setIsTransitioning(true);
                setCurrentImageIndex(idx);
                setTimeout(() => setIsTransitioning(false), 500);
              }
            }}
            className={`transition-all duration-300 ${
              idx === currentImageIndex
                ? "bg-white w-8 h-2 rounded-full shadow-md"
                : "bg-white/50 hover:bg-white/80 w-2 h-2 rounded-full"
            }`}
          />
        ))}
      </div>
    </div>

    {/* Content - Text shadow for better readability */}
    
      {/* Content */}
      <div className="relative z-10 w-full max-w-6xl px-6">
        {/* Heading */}
        <div className="text-center mb-6 text-white">
          <h1 className="text-4xl font-bold mb-2">Your Journey, Our Priority</h1>
          <p className="text-base opacity-90">Book flights at the best prices with exclusive deals</p>
        </div>

        {/* Booking Card */}
        <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl p-6 border border-white/20">
          {/* Tabs */}
          <div className="flex gap-3 mb-6">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const active = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => handleTabClick(tab)}
                  className={`flex items-center gap-2 px-5 py-2 rounded-full text-sm font-semibold transition-all duration-300 ${
                    active
                      ? "bg-gradient-to-r from-[#FD561E] to-[#ff7b4a] text-white shadow-md"
                      : "bg-white/80 text-gray-600 hover:text-[#FD561E] border border-gray-200"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Trip Type */}
          <div className="flex mb-5">
            <div className="flex bg-gray-100 rounded-lg p-1 gap-1">
              {["one-way", "round-trip", "multi-city"].map((type) => (
                <button
                  key={type}
                  className={`px-4 py-1.5 text-sm font-medium rounded-md transition capitalize ${
                    tripType === type
                      ? "bg-white text-gray-900 shadow-sm"
                      : "text-gray-600 hover:text-gray-800"
                  }`}
                  onClick={() => handleTripTypeChange(type)}
                >
                  {type === "one-way" ? "One Way" : type === "round-trip" ? "Round Trip" : "Multi City"}
                </button>
              ))}
            </div>
          </div>

          {/* Search Form */}
          <div className="space-y-4">
            {tripType === 'multi-city' ? renderMultiCityForm() : renderOneWayRoundTripForm()}

            {/* Special Fares */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <span className="text-xs font-bold uppercase tracking-wide text-gray-600">Special Fares</span>
              {flightSpecialFares.map((fare) => {
                const active = activeFare === fare.id;
                return (
                  <button
                    key={fare.id}
                    onClick={() => setActiveFare(fare.id)}
                    className={`px-3 py-1.5 rounded-lg border text-xs transition-all ${
                      active
                        ? "border-[#FD561E] bg-orange-50 shadow-sm"
                        : "border-gray-200 text-gray-600 hover:border-[#FD561E]"
                    }`}
                  >
                    <span className="font-semibold block text-xs">{fare.label}</span>
                    <span className="text-[10px] text-gray-500">{fare.desc}</span>
                  </button>
                );
              })}
            </div>

            {/* Search Button - Original Position */}
            <div className="absolute left-1/2 -bottom-8 transform -translate-x-1/2">
              <button
                onClick={handleSearch}
                disabled={flightResults.loading}
                className="bg-gradient-to-r from-[#FD561E] to-[#ff7b4a] text-white cursor-pointer px-16 py-4 rounded-full text-lg font-semibold shadow-xl hover:scale-110 transition-all duration-300 disabled:opacity-50"
              >
                {flightResults.loading ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                    <span>SEARCHING...</span>
                  </div>
                ) : (
                  "SEARCH"
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Traveller Modal */}
      {showTravellerModal && <TravellerModal />}
    </section>
  );
};

export default FlightHeroSection;