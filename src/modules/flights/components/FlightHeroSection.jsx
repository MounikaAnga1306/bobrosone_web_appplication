// src/modules/flights/components/FlightHeroSection.jsx

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { useFlightSearchContext } from "../contexts/FlightSearchContext";
import { searchFlights } from "../services/flightSearchService";
import { searchAirports } from "../services/airportSearchService";
import SpecialFares from "./SpecialFares";
import DoMoreWithBobros from "./DoMoreWithBobros";
import PopularFlightRoutes from "./PopularFlightRoutes";
import FlightFAQ from "./FlightFAQ";
import Quick_Links from "./Quick_Links";
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

  // ============ STATE MANAGEMENT ============
  
  // Trip type
  const [tripType, setTripType] = useState("one-way");
  
  // Multi-city legs - Start with 2 legs
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
    }
  ]);

  // One-way/round-trip state
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [fromDisplay, setFromDisplay] = useState("");
  const [toDisplay, setToDisplay] = useState("");
  const [selectedFromAirport, setSelectedFromAirport] = useState(null);
  const [selectedToAirport, setSelectedToAirport] = useState(null);
  
  // Dates
  const [departureDate, setDepartureDate] = useState(new Date());
  const [returnDate, setReturnDate] = useState(() => {
    const date = new Date();
    date.setDate(date.getDate() + 3);
    return date;
  });
  
  const [activeTab, setActiveTab] = useState("flights");
  
  // Special fares
  const [specialFares, setSpecialFares] = useState({
    regular: false,
    student: false,
    seniorCitizen: false,
    armed: false,
    doctors: false,
  });
  
  // Traveller state
  const [passengers, setPassengers] = useState([{ code: 'ADT' }]);
  const [showTravellerModal, setShowTravellerModal] = useState(false);
  const [tempPassengers, setTempPassengers] = useState([]);
  const [travelClass, setTravelClass] = useState("Economy");

  // Dropdown states for one-way/round-trip
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
  const legRefs = useRef({});
  
  // Timeouts
  const fromSearchTimeout = useRef(null);
  const toSearchTimeout = useRef(null);
  const legSearchTimeouts = useRef({});

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
    if (!date) return null;
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // ============ TRIP TYPE HANDLER ============

  const handleTripTypeChange = (type) => {
    setTripType(type);
    updateTripType(type);
    
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

  // ============ FIXED: Multi-City Selection Handlers ============

  const handleLegFromChange = (e, index) => {
    const value = e.target.value;
    updateLegField(index, 'fromDisplay', value);
    updateLegField(index, 'fromAirport', null);
    updateLegField(index, 'from', '');
    updateLegField(index, 'showFromDropdown', true);
    debouncedLegSearch(value, index, 'from');
  };

  const handleLegToChange = (e, index) => {
    const value = e.target.value;
    updateLegField(index, 'toDisplay', value);
    updateLegField(index, 'toAirport', null);
    updateLegField(index, 'to', '');
    updateLegField(index, 'showToDropdown', true);
    debouncedLegSearch(value, index, 'to');
  };

  // FIXED: This function now properly populates the fields
  const handleLegAirportSelect = (airport, index, type) => {
    if (type === 'from') {
      // Update the from field with selected airport
      updateLegField(index, 'fromAirport', airport);
      updateLegField(index, 'from', airport.location_code);
      updateLegField(index, 'fromDisplay', `${airport.name} (${airport.location_code})`);
      updateLegField(index, 'showFromDropdown', false);
      updateLegField(index, 'fromAirports', []);
      updateLegField(index, 'fromLoading', false);
      
      // Auto-populate next leg's from if this leg has a destination
      const currentLeg = legs[index];
      if (currentLeg.toAirport && index < legs.length - 1) {
        const nextLeg = legs[index + 1];
        if (!nextLeg.fromAirport) {
          updateLegField(index + 1, 'fromAirport', currentLeg.toAirport);
          updateLegField(index + 1, 'from', currentLeg.toAirport.location_code);
          updateLegField(index + 1, 'fromDisplay', `${currentLeg.toAirport.name} (${currentLeg.toAirport.location_code})`);
        }
      }
    } else {
      // Update the to field with selected airport
      updateLegField(index, 'toAirport', airport);
      updateLegField(index, 'to', airport.location_code);
      updateLegField(index, 'toDisplay', `${airport.name} (${airport.location_code})`);
      updateLegField(index, 'showToDropdown', false);
      updateLegField(index, 'toAirports', []);
      updateLegField(index, 'toLoading', false);
      
      // Auto-populate next leg's from
      if (index < legs.length - 1) {
        const nextLeg = legs[index + 1];
        if (!nextLeg.fromAirport) {
          updateLegField(index + 1, 'fromAirport', airport);
          updateLegField(index + 1, 'from', airport.location_code);
          updateLegField(index + 1, 'fromDisplay', `${airport.name} (${airport.location_code})`);
        }
      }
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
    debouncedFromSearch(value);
    setShowFromDropdown(true);
  };

  const handleToInputChange = (e) => {
    const value = e.target.value;
    setToDisplay(value);
    setSelectedToAirport(null);
    setTo("");
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
    } else {
      setSelectedToAirport(airport);
      setTo(airport.location_code);
      setToDisplay(`${airport.name} (${airport.location_code})`);
      setShowToDropdown(false);
      setToAirports([]);
      updateDestination(airport);
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
    if (tripType === 'multi-city') {
      for (let i = 0; i < legs.length; i++) {
        const leg = legs[i];
        if (!leg.fromAirport || !leg.toAirport) {
          alert(`Please select both cities for flight ${i + 1}`);
          return false;
        }
        if (leg.fromAirport.location_code === leg.toAirport.location_code) {
          alert(`Departure and arrival cannot be same for flight ${i + 1}`);
          return false;
        }
        if (!leg.date) {
          alert(`Please select a date for flight ${i + 1}`);
          return false;
        }
      }
    } else {
      if (!selectedFromAirport || !selectedToAirport) {
        alert("Please select both cities");
        return false;
      }
      if (selectedFromAirport.location_code === selectedToAirport.location_code) {
        alert("Departure and arrival cannot be same");
        return false;
      }
      if (!departureDate) {
        alert("Please select departure date");
        return false;
      }
      if (tripType === "round-trip" && !returnDate) {
        alert("Please select return date");
        return false;
      }
    }
    
    if (!passengers.some(p => p.code === 'ADT')) {
      alert("At least one adult is required");
      return false;
    }
    
    return true;
  };

  // ============ FIXED SEARCH HANDLER ============

const handleSearch = async () => {
  if (!validateSearch()) return;

  let searchLegs = [];

  if (tripType === 'multi-city') {
    searchLegs = legs.map(leg => ({
      origin: leg.fromAirport.location_code,
      destination: leg.toAirport.location_code,
      departureDate: formatDate(leg.date)
    }));
  } else {
    searchLegs = [{
      origin: selectedFromAirport.location_code,
      destination: selectedToAirport.location_code,
      departureDate: formatDate(departureDate)
    }];
    
    if (tripType === "round-trip") {
      searchLegs.push({
        origin: selectedToAirport.location_code,
        destination: selectedFromAirport.location_code,
        departureDate: formatDate(returnDate)
      });
    }
  }

  const searchData = { 
    legs: searchLegs, 
    passengers: passengers,
    tripType: tripType // Include trip type in search data
  };

  console.log("🔍 Search Data:", searchData);

  // Update search params in context
  updateSearchParams({ 
    tripType, 
    legs: searchLegs, 
    passengers 
  });
  
  // Set loading state
  updateFlightResults({ loading: true, error: null });

  try {
    const result = await searchFlights(searchData);
    console.log("📦 Search Result:", result);
    
    if (result.success) {
      // Update flight results with all data
      updateFlightResults({
        flights: result.flights || [],
        roundTripDisplay: result.roundTripDisplay || null,
        multiCity: result.multiCity || { legs: [], combinations: [] },
        brandDetails: result.brandDetails || {},
        count: result.count || 0,
        loading: false,
        error: null,
        searchId: result.searchId
      });

      // Add a small delay to ensure state is updated
      setTimeout(() => {
        // Navigate based on trip type
        if (tripType === "round-trip") {
          console.log("➡️ Navigating to round-trip page");
          navigate("/flights/round-trip");
        } else if (tripType === "multi-city") {
          console.log("➡️ Navigating to multi-city page");
          navigate("/flights/multi-city");
        } else {
          console.log("➡️ Navigating to one-way results page");
          navigate("/flights/results");
        }
      }, 100); // Small delay to ensure state update
      
    } else {
      console.error("❌ Search failed:", result.error);
      updateFlightResults({
        loading: false,
        error: result.error || "Search failed",
      });
      alert(`Search failed: ${result.error || "Unknown error"}`);
    }
  } catch (error) {
    console.error("❌ Search Error:", error);
    updateFlightResults({
      loading: false,
      error: error.message,
    });
    alert(`Error: ${error.message}`);
  }
};

  // ============ EFFECTS ============

  useEffect(() => {
    const handleClickOutside = (event) => {
      // Close one-way/round-trip dropdowns
      if (fromRef.current && !fromRef.current.contains(event.target)) {
        setShowFromDropdown(false);
      }
      if (toRef.current && !toRef.current.contains(event.target)) {
        setShowToDropdown(false);
      }
      if (travellerRef.current && !travellerRef.current.contains(event.target)) {
        setShowTravellerModal(false);
        setTempPassengers([]);
      }
      
      // Close multi-city dropdowns
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

  // ============ RENDER FUNCTIONS ============

  const renderMultiCityForm = () => (
    <div className="space-y-4">
      {legs.map((leg, index) => (
        <div key={leg.id} className="relative bg-gray-50 p-4 rounded-lg border border-gray-200">
          <div className="flex justify-between items-center mb-3">
            <h4 className="font-medium text-gray-700">Flight {index + 1}</h4>
            {index >= 2 && (
              <button
                onClick={() => removeLegHandler(index)}
                className="text-red-500 hover:text-red-700 p-1"
              >
                <FaTrash className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
            {/* From Field */}
            <div className="md:col-span-4 relative" id={`leg-from-${index}`}>
              <label className="block text-xs font-medium text-gray-500 mb-1">From</label>
              <div className="relative">
                <FaMapMarkerAlt className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={leg.fromDisplay}
                  onChange={(e) => handleLegFromChange(e, index)}
                  onFocus={() => updateLegField(index, 'showFromDropdown', true)}
                  placeholder="City or airport"
                  className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FD561E] text-sm"
                />
                {leg.fromLoading && (
                  <FaSpinner className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 animate-spin" />
                )}
              </div>

              {/* From Dropdown */}
              {leg.showFromDropdown && leg.fromAirports.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-lg shadow-xl border border-gray-200 z-50 max-h-64 overflow-y-auto">
                  {leg.fromAirports.map((airport) => (
                    <div
                      key={airport.location_code}
                      className="flex items-center justify-between p-3 hover:bg-orange-50 cursor-pointer border-b last:border-b-0"
                      onClick={() => handleLegAirportSelect(airport, index, 'from')}
                    >
                      <div>
                        <div className="font-medium text-gray-900">{airport.name}</div>
                        <div className="text-xs text-gray-500">{airport.location_code}</div>
                      </div>
                      <div className="text-sm font-bold text-gray-700">{airport.location_code}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* To Field */}
            <div className="md:col-span-4 relative" id={`leg-to-${index}`}>
              <label className="block text-xs font-medium text-gray-500 mb-1">To</label>
              <div className="relative">
                <FaMapMarkerAlt className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={leg.toDisplay}
                  onChange={(e) => handleLegToChange(e, index)}
                  onFocus={() => updateLegField(index, 'showToDropdown', true)}
                  placeholder="City or airport"
                  className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FD561E] text-sm"
                />
                {leg.toLoading && (
                  <FaSpinner className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 animate-spin" />
                )}
              </div>

              {/* To Dropdown */}
              {leg.showToDropdown && leg.toAirports.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-lg shadow-xl border border-gray-200 z-50 max-h-64 overflow-y-auto">
                  {leg.toAirports.map((airport) => (
                    <div
                      key={airport.location_code}
                      className="flex items-center justify-between p-3 hover:bg-orange-50 cursor-pointer border-b last:border-b-0"
                      onClick={() => handleLegAirportSelect(airport, index, 'to')}
                    >
                      <div>
                        <div className="font-medium text-gray-900">{airport.name}</div>
                        <div className="text-xs text-gray-500">{airport.location_code}</div>
                      </div>
                      <div className="text-sm font-bold text-gray-700">{airport.location_code}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Date Field */}
            <div className="md:col-span-4">
              <label className="block text-xs font-medium text-gray-500 mb-1">Departure Date</label>
              <div className="relative">
                <FaCalendarAlt className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 z-10" />
                <DatePicker
                  selected={leg.date}
                  onChange={(date) => updateLegField(index, 'date', date)}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FD561E] text-sm cursor-pointer"
                  dateFormat="EEE, dd MMM yyyy"
                  minDate={index === 0 ? new Date() : legs[index - 1]?.date}
                  placeholderText="Select date"
                  popperClassName="z-50"
                />
              </div>
            </div>
          </div>
        </div>
      ))}

      {legs.length < 6 && (
        <button
          onClick={addNewLeg}
          className="flex items-center gap-2 text-[#FD561E] hover:text-[#e54d1a] font-medium text-sm"
        >
          <FaPlus className="w-3 h-3" />
          Add Another Flight
        </button>
      )}
    </div>
  );

  const renderOneWayRoundTripForm = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-4">
      {/* From */}
      <div className="lg:col-span-3 relative" ref={fromRef}>
        <label className="block text-xs font-medium text-gray-500 mb-1 uppercase">From</label>
        <div className="relative">
          <FaMapMarkerAlt className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={fromDisplay}
            onChange={handleFromInputChange}
            onFocus={() => setShowFromDropdown(true)}
            placeholder="City or airport"
            className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FD561E]"
          />
          {fromLoading && <FaSpinner className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 animate-spin" />}
        </div>
        {showFromDropdown && fromAirports.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-lg shadow-xl border border-gray-200 z-50 max-h-64 overflow-y-auto">
            {fromAirports.map((airport) => (
              <div
                key={airport.location_code}
                className="flex items-center justify-between p-3 hover:bg-orange-50 cursor-pointer"
                onClick={() => handleAirportSelect(airport, "from")}
              >
                <div>
                  <div className="font-medium">{airport.name}</div>
                  <div className="text-xs text-gray-500">{airport.location_code}</div>
                </div>
                <div className="text-sm font-bold">{airport.location_code}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* To */}
      <div className="lg:col-span-3 relative" ref={toRef}>
        <label className="block text-xs font-medium text-gray-500 mb-1 uppercase">To</label>
        <div className="relative">
          <button
            className="absolute -left-4 top-1/2 -translate-y-1/2 z-10 bg-white border rounded-full p-2 hover:bg-gray-50 shadow-sm"
            onClick={handleSwapCities}
            disabled={!selectedFromAirport || !selectedToAirport}
          >
            <FaExchangeAlt className="text-gray-500 text-sm" />
          </button>
          <FaMapMarkerAlt className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={toDisplay}
            onChange={handleToInputChange}
            onFocus={() => setShowToDropdown(true)}
            placeholder="City or airport"
            className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FD561E]"
          />
          {toLoading && <FaSpinner className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 animate-spin" />}
        </div>
        {showToDropdown && toAirports.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-lg shadow-xl border border-gray-200 z-50 max-h-64 overflow-y-auto">
            {toAirports.map((airport) => (
              <div
                key={airport.location_code}
                className="flex items-center justify-between p-3 hover:bg-orange-50 cursor-pointer"
                onClick={() => handleAirportSelect(airport, "to")}
              >
                <div>
                  <div className="font-medium">{airport.name}</div>
                  <div className="text-xs text-gray-500">{airport.location_code}</div>
                </div>
                <div className="text-sm font-bold">{airport.location_code}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Departure Date */}
      <div className="lg:col-span-2">
        <label className="block text-xs font-medium text-gray-500 mb-1 uppercase">Departure</label>
        <div className="relative">
          <FaCalendarAlt className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 z-10" />
          <DatePicker
            selected={departureDate}
            onChange={(date) => {
              setDepartureDate(date);
              updateDepartureDate(date);
            }}
            className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FD561E] cursor-pointer"
            dateFormat="EEE, dd MMM"
            minDate={new Date()}
            popperClassName="z-50"
          />
        </div>
      </div>

      {/* Return Date */}
      {tripType === "round-trip" && (
        <div className="lg:col-span-2">
          <label className="block text-xs font-medium text-gray-500 mb-1 uppercase">Return</label>
          <div className="relative">
            <FaCalendarAlt className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 z-10" />
            <DatePicker
              selected={returnDate}
              onChange={(date) => {
                setReturnDate(date);
                updateReturnDate(date);
              }}
              className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FD561E] cursor-pointer"
              dateFormat="EEE, dd MMM"
              minDate={departureDate}
              popperClassName="z-50"
            />
          </div>
        </div>
      )}
    </div>
  );

  // ============ MAIN RENDER ============

  return (
    <div className="w-full bg-gray-50">
      {/* Hero Image */}
      <div className="relative w-full h-[630px] overflow-hidden">
        <div className="absolute inset-0 w-screen left-1/2 right-1/2 -ml-[50vw] -mr-[50vw]">
          <img
            src="https://images.unsplash.com/photo-1436491865332-7a61a109cc05?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80"
            alt="Airplane"
            className="w-full h-full object-cover"
          />
        </div>
      </div>

      {/* Search Card */}
      <div className="relative max-w-7xl mx-auto px-5 sm:px-6 lg:px-8 -mt-130">
        <div className="bg-white rounded-2xl shadow-xl p-6 pb-16 border border-gray-200">
          {/* Tabs */}
          <div className="flex gap-4 mb-10">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const active = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => handleTabClick(tab)}
                  className={`flex items-center gap-2 px-6 py-3 rounded-full text-sm font-semibold transition border ${
                    active
                      ? "bg-gradient-to-r from-[#FD561E] to-[#ff7b4a] text-white border-transparent shadow-lg scale-105"
                      : "border-gray-200 text-gray-600 hover:border-[#FD561E] hover:text-[#FD561E]"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Trip Type */}
          <div className="flex items-center mb-6">
            <div className="flex bg-gray-100 rounded-lg p-1 border border-gray-200">
              <button
                className={`px-5 py-2 text-sm font-medium rounded-md transition ${
                  tripType === "one-way"
                    ? "bg-white text-gray-900 shadow-sm border"
                    : "text-gray-600 hover:bg-gray-50"
                }`}
                onClick={() => handleTripTypeChange("one-way")}
              >
                One Way
              </button>
              <button
                className={`px-5 py-2 text-sm font-medium rounded-md transition ${
                  tripType === "round-trip"
                    ? "bg-white text-gray-900 shadow-sm border"
                    : "text-gray-600 hover:bg-gray-50"
                }`}
                onClick={() => handleTripTypeChange("round-trip")}
              >
                Round Trip
              </button>
              <button
                className={`px-5 py-2 text-sm font-medium rounded-md transition ${
                  tripType === "multi-city"
                    ? "bg-white text-gray-900 shadow-sm border"
                    : "text-gray-600 hover:bg-gray-50"
                }`}
                onClick={() => handleTripTypeChange("multi-city")}
              >
                Multi City
              </button>
            </div>
          </div>

          {/* Search Form */}
          <div className="space-y-6">
            {tripType === 'multi-city' ? renderMultiCityForm() : renderOneWayRoundTripForm()}

            {/* Travellers */}
            <div className="relative" ref={travellerRef}>
              <label className="block text-xs font-medium text-gray-500 mb-1 uppercase">Travellers & Class</label>
              <div className="relative md:w-96">
                <div
                  className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg bg-white cursor-pointer flex items-center hover:border-[#FD561E]"
                  onClick={openTravellerModal}
                >
                  <FaUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <span className="truncate">{formatTravellersText()}</span>
                  <FaChevronDown className={`absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 transition ${
                    showTravellerModal ? "rotate-180" : ""
                  }`} />
                </div>

                {/* Traveller Modal */}
                {showTravellerModal && (
                  <div className="absolute top-full left-0 mt-2 w-96 bg-white rounded-xl shadow-2xl border border-gray-200 z-50 p-5">
                    {/* Modal content - simplified for brevity */}
                    <div className="flex justify-between mb-4">
                      <h3 className="font-bold">Select Travellers</h3>
                      <button onClick={cancelPassengerChanges}><FaTimes /></button>
                    </div>
                    <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                      <div className="flex justify-between">
                        <span className="text-sm font-medium">Max {maxTravellers} travellers</span>
                        <span className={`text-sm font-bold ${
                          tempPassengers.length >= maxTravellers ? "text-red-600" : "text-green-600"
                        }`}>
                          {tempPassengers.length}/{maxTravellers}
                        </span>
                      </div>
                    </div>
                    
                    {/* Passenger List */}
                    <div className="space-y-3 mb-4 max-h-60 overflow-y-auto">
                      {tempPassengers.map((p, i) => (
                        <div key={i} className="flex gap-2 p-2 bg-gray-50 rounded-lg">
                          <div className="flex-1">
                            <div className="flex justify-between">
                              <span className="font-medium">
                                {p.code === 'ADT' && 'Adult'}
                                {p.code === 'CNN' && 'Child'}
                                {p.code === 'INF' && 'Infant'}
                              </span>
                              <button onClick={() => removeTempPassenger(i)} className="text-red-500">
                                <FaTimes className="w-3 h-3" />
                              </button>
                            </div>
                            {(p.code === 'CNN' || p.code === 'INF') && (
                              <select
                                value={p.age || (p.code === 'CNN' ? 8 : 1)}
                                onChange={(e) => updateTempPassengerAge(i, e.target.value)}
                                className="w-full mt-1 px-2 py-1 text-sm border rounded"
                              >
                                {p.code === 'CNN' && [...Array(11)].map((_, a) => (
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

                    {/* Add Buttons */}
                    <div className="flex flex-wrap gap-2 mb-6">
                      {['ADT', 'CNN', 'INF'].map(code => (
                        <button
                          key={code}
                          className={`px-3 py-2 text-sm rounded-lg border ${
                            tempPassengers.length >= maxTravellers
                              ? "border-gray-200 text-gray-300 cursor-not-allowed"
                              : "border-gray-300 text-gray-700 hover:bg-gray-50"
                          }`}
                          onClick={() => addTempPassenger(code)}
                          disabled={tempPassengers.length >= maxTravellers}
                        >
                          + {code === 'ADT' ? 'Adult' : code === 'CNN' ? 'Child' : 'Infant'}
                        </button>
                      ))}
                    </div>

                    {/* Class Selection */}
                    <div className="mb-6">
                      <h4 className="font-medium mb-3">Travel Class</h4>
                      <div className="grid grid-cols-2 gap-2">
                        {["Economy", "Premium Economy", "Business", "First"].map(cls => (
                          <button
                            key={cls}
                            className={`py-2 px-3 rounded-lg text-sm font-medium ${
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

                    <div className="flex gap-2">
                      <button className="flex-1 bg-gray-100 py-3 rounded-lg font-bold hover:bg-gray-200" onClick={cancelPassengerChanges}>Cancel</button>
                      <button className="flex-1 bg-[#FD561E] text-white py-3 rounded-lg font-bold hover:bg-[#e54d1a]" onClick={applyPassengerChanges}>Apply</button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Special Fares */}
            <SpecialFares specialFares={specialFares} setSpecialFares={setSpecialFares} />

            {/* Search Button */}
            <div className="absolute -bottom-6 left-1/2 -translate-x-1/2">
              <button
                onClick={handleSearch}
                disabled={flightResults.loading}
                className="bg-gradient-to-r from-[#FD561E] to-[#ff7b4a] text-white px-10 py-4 rounded-full font-bold text-lg shadow-xl hover:shadow-2xl transition hover:scale-105 flex items-center gap-2 disabled:opacity-50"
              >
                {flightResults.loading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span>SEARCHING...</span>
                  </>
                ) : (
                  <>
                    <FaSearch />
                    <span>SEARCH</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Additional Components */}
      <DoMoreWithBobros />
      <PopularFlightRoutes />
      <FlightFAQ />
      <Quick_Links />
    </div>
  );
};

export default FlightHeroSection;