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
    updatePassengers,
    getApiRequestBody
  } = useFlightSearchContext();

  // State
  const [tripType, setTripType] = useState("one-way"); // Keeping but will only use one-way
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [fromDisplay, setFromDisplay] = useState("");
  const [toDisplay, setToDisplay] = useState("");
  const [departureDate, setDepartureDate] = useState(new Date());
  const [activeTab, setActiveTab] = useState("flights");
  
  // Special fares state (keeping as is)
  const [specialFares, setSpecialFares] = useState({
    regular: false,
    student: false,
    seniorCitizen: false,
    armed: false,
    doctors: false,
  });
  
  // Traveller state - CHANGED: Now stores array of passengers
  const [passengers, setPassengers] = useState([
    { code: 'ADT' } // Default 1 adult
  ]);
  
  // UI state for traveller modal
  const [showTravellerModal, setShowTravellerModal] = useState(false);
  // Temporary state for editing in modal
  const [tempPassengers, setTempPassengers] = useState([]);
  
  // Travel class
  const [travelClass, setTravelClass] = useState("Economy");

  // Dropdown states for airport search
  const [showFromDropdown, setShowFromDropdown] = useState(false);
  const [showToDropdown, setShowToDropdown] = useState(false);
  const [fromAirports, setFromAirports] = useState([]);
  const [toAirports, setToAirports] = useState([]);
  const [fromLoading, setFromLoading] = useState(false);
  const [toLoading, setToLoading] = useState(false);
  const [fromSearchError, setFromSearchError] = useState(null);
  const [toSearchError, setToSearchError] = useState(null);
  const [selectedFromAirport, setSelectedFromAirport] = useState(null);
  const [selectedToAirport, setSelectedToAirport] = useState(null);

  // Refs
  const travellerRef = useRef(null);
  const fromRef = useRef(null);
  const toRef = useRef(null);
  const fromSearchTimeout = useRef(null);
  const toSearchTimeout = useRef(null);

  // Calculate passenger counts from passengers array
  const getPassengerCounts = useCallback(() => {
    return {
      adults: passengers.filter(p => p.code === 'ADT').length,
      children: passengers.filter(p => p.code === 'CNN').length,
      infants: passengers.filter(p => p.code === 'INF').length
    };
  }, [passengers]);

  const counts = getPassengerCounts();
  const totalTravellers = counts.adults + counts.children + counts.infants;
  const maxTravellers = 9;

  // Format travellers text for display
  const formatTravellersText = () => {
    const parts = [];
    if (counts.adults > 0) parts.push(`${counts.adults} Adult${counts.adults > 1 ? 's' : ''}`);
    if (counts.children > 0) parts.push(`${counts.children} Child${counts.children > 1 ? 'ren' : ''}`);
    if (counts.infants > 0) parts.push(`${counts.infants} Infant${counts.infants > 1 ? 's' : ''}`);
    return `${parts.join(', ')} · ${travelClass}`;
  };

  // Airport search function
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
        setFromSearchError(null);
      } else {
        setToLoading(true);
        setToSearchError(null);
      }

      const results = await searchAirports(searchTerm);

      if (type === "from") {
        setFromAirports(results);
        setFromLoading(false);
      } else {
        setToAirports(results);
        setToLoading(false);
      }
    } catch (error) {
      if (type === "from") {
        setFromSearchError("Failed to search airports. Please try again.");
        setFromLoading(false);
        setFromAirports([]);
      } else {
        setToSearchError("Failed to search airports. Please try again.");
        setToLoading(false);
        setToAirports([]);
      }
    }
  };

  // Debounced search handlers
  const debouncedFromSearch = useCallback((value) => {
    if (fromSearchTimeout.current) {
      clearTimeout(fromSearchTimeout.current);
    }

    if (value.length >= 3) {
      setFromLoading(true);
      fromSearchTimeout.current = setTimeout(() => {
        searchAirportsAPI(value, "from");
      }, 500);
    } else if (value.length > 0) {
      setFromAirports([]);
      setFromLoading(false);
    } else {
      setFromAirports([]);
      setFromLoading(false);
    }
  }, []);

  const debouncedToSearch = useCallback((value) => {
    if (toSearchTimeout.current) {
      clearTimeout(toSearchTimeout.current);
    }

    if (value.length >= 3) {
      setToLoading(true);
      toSearchTimeout.current = setTimeout(() => {
        searchAirportsAPI(value, "to");
      }, 500);
    } else if (value.length > 0) {
      setToAirports([]);
      setToLoading(false);
    } else {
      setToAirports([]);
      setToLoading(false);
    }
  }, []);

  // Input handlers
  const handleFromInputChange = (e) => {
    const value = e.target.value;
    setFromDisplay(value);

    if (selectedFromAirport) {
      setSelectedFromAirport(null);
      setFrom("");
    }

    debouncedFromSearch(value);
    setShowFromDropdown(true);
  };

  const handleToInputChange = (e) => {
    const value = e.target.value;
    setToDisplay(value);

    if (selectedToAirport) {
      setSelectedToAirport(null);
      setTo("");
    }

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
      
      // Update context
      updateOrigin(airport);
    } else {
      setSelectedToAirport(airport);
      setTo(airport.location_code);
      setToDisplay(`${airport.name} (${airport.location_code})`);
      setShowToDropdown(false);
      setToAirports([]);
      
      // Update context
      updateDestination(airport);
    }
  };

  const handleSwapCities = () => {
    // Swap display
    const tempDisplay = fromDisplay;
    setFromDisplay(toDisplay);
    setToDisplay(tempDisplay);

    // Swap selected airports
    const tempSelected = selectedFromAirport;
    setSelectedFromAirport(selectedToAirport);
    setSelectedToAirport(tempSelected);

    // Swap codes
    const tempCode = from;
    setFrom(to);
    setTo(tempCode);

    // Update context
    if (selectedToAirport) updateOrigin(selectedToAirport);
    if (selectedFromAirport) updateDestination(selectedFromAirport);
  };

  // ============ PASSENGER MANAGEMENT ============

  // Open traveller modal - initialize temp passengers from current passengers
  const openTravellerModal = () => {
    setTempPassengers([...passengers]);
    setShowTravellerModal(true);
  };

  // Add passenger to temp array
  const addTempPassenger = (code) => {
    setTempPassengers(prev => {
      const newPassenger = { code };
      
      // Add default age for children/infants
      if (code === 'CNN') newPassenger.age = 8;
      if (code === 'INF') newPassenger.age = 1;
      
      return [...prev, newPassenger];
    });
  };

  // Remove passenger from temp array
  const removeTempPassenger = (index) => {
    setTempPassengers(prev => prev.filter((_, i) => i !== index));
  };

  // Update child/infant age in temp array
  const updateTempPassengerAge = (index, age) => {
    setTempPassengers(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], age: parseInt(age) };
      return updated;
    });
  };

  // Apply passenger changes
  const applyPassengerChanges = () => {
    // Validate at least one adult
    if (!tempPassengers.some(p => p.code === 'ADT')) {
      alert("At least one adult is required");
      return;
    }
    
    setPassengers(tempPassengers);
    updatePassengers(tempPassengers); // Update context
    setShowTravellerModal(false);
  };

  // Cancel passenger changes
  const cancelPassengerChanges = () => {
    setTempPassengers([]);
    setShowTravellerModal(false);
  };

  // ============ SEARCH HANDLER ============

  // Validate search inputs
  const validateSearch = () => {
    if (!selectedFromAirport || !selectedToAirport) {
      alert("Please select both departure and arrival cities");
      return false;
    }
    
    if (selectedFromAirport.location_code === selectedToAirport.location_code) {
      alert("Departure and arrival cities cannot be the same");
      return false;
    }
    
    if (!departureDate) {
      alert("Please select a departure date");
      return false;
    }
    
    if (passengers.length === 0) {
      alert("Please select at least one passenger");
      return false;
    }
    
    if (!passengers.some(p => p.code === 'ADT')) {
      alert("At least one adult passenger is required");
      return false;
    }
    
    return true;
  };

  // Format date to YYYY-MM-DD
  const formatDate = (date) => {
    if (!date) return null;
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Handle search
  const handleSearch = async () => {
    if (!validateSearch()) {
      return;
    }

    // Update departure date in context
    updateDepartureDate(departureDate);

    // Build search data matching API structure
    const searchData = {
      legs: [
        {
          origin: selectedFromAirport.location_code,
          destination: selectedToAirport.location_code,
          departureDate: formatDate(departureDate)
        }
      ],
      passengers: passengers
    };

    console.log("Search Data:", searchData);

    // Store search params in context
    updateSearchParams({
      tripType: "one-way",
      legs: searchData.legs,
      passengers: searchData.passengers
    });

    // Set loading state
    updateFlightResults({ loading: true, error: null });

    try {
      const result = await searchFlights(searchData);

      if (result.success) {
        updateFlightResults({
          flights: result.flights,
          rawFlights: result.rawFlights,
          count: result.count,
          loading: false,
          error: null,
        });

        navigate("/flights/results");
      } else {
        updateFlightResults({
          loading: false,
          error: result.error,
        });
        alert(`Search failed: ${result.error}`);
      }
    } catch (error) {
      updateFlightResults({
        loading: false,
        error: error.message,
      });
      alert(`Error: ${error.message}`);
    }
  };

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        travellerRef.current &&
        !travellerRef.current.contains(event.target)
      ) {
        setShowTravellerModal(false);
        setTempPassengers([]);
      }
      if (fromRef.current && !fromRef.current.contains(event.target)) {
        setShowFromDropdown(false);
      }
      if (toRef.current && !toRef.current.contains(event.target)) {
        setShowToDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Cleanup timeouts
  useEffect(() => {
    return () => {
      if (fromSearchTimeout.current) {
        clearTimeout(fromSearchTimeout.current);
      }
      if (toSearchTimeout.current) {
        clearTimeout(toSearchTimeout.current);
      }
    };
  }, []);

  // Tab click handler
  const handleTabClick = (tab) => {
    setActiveTab(tab.id);
    navigate(tabRoutes[tab.id]);
  };

  return (
    <div className="w-full bg-gray-50">
      {/* Hero Section - Full width image */}
      <div className="relative w-full h-[630px] overflow-hidden">
        <div className="absolute inset-0 w-screen left-1/2 right-1/2 -ml-[50vw] -mr-[50vw]">
          <img
            src="https://images.unsplash.com/photo-1436491865332-7a61a109cc05?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80"
            alt="Airplane wing view during daytime"
            className="w-full h-full object-cover"
          />
        </div>
      </div>

      {/* Search Section - Overlapping card */}
      <div className="relative max-w-7xl mx-auto px-5 sm:px-6 lg:px-8 -mt-130">
        {/* Flight Booking Card */}
        <div className="relative bg-white rounded-2xl shadow-xl p-6 pb-16 border border-gray-200">
          {/* Service Tabs */}
          <div className="flex gap-4 mb-10">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const active = activeTab === tab.id;

              return (
                <button
                  key={tab.id}
                  onClick={() => handleTabClick(tab)}
                  className={`flex items-center gap-2 px-6 py-3 rounded-full text-sm font-semibold transition-all duration-300 border ${
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

          {/* Trip Type Toggle - Keeping UI but only one-way functional */}
          <div className="flex items-center mb-6">
            <div className="flex items-center bg-gray-100 rounded-lg p-1 border border-gray-200">
              <button
                className={`px-5 py-2 text-sm font-medium rounded-md transition-all duration-200 ${
                  tripType === "one-way"
                    ? "bg-white text-gray-900 shadow-sm border border-gray-300"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                }`}
                onClick={() => setTripType("one-way")}
              >
                One Way
              </button>
              <button
                className={`px-5 py-2 text-sm font-medium rounded-md transition-all duration-200 opacity-50 cursor-not-allowed`}
                disabled
                title="Round trip coming soon"
              >
                Round Trip
              </button>
              <button
                className={`px-5 py-2 text-sm font-medium rounded-md transition-all duration-200 opacity-50 cursor-not-allowed`}
                disabled
                title="Multi city coming soon"
              >
                Multi City
              </button>
            </div>
          </div>

          {/* Search Form - One Way Only */}
          <div className="space-y-6">
            {/* One Way Form */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-4">
              {/* From Field */}
              <div className="lg:col-span-3 relative" ref={fromRef}>
                <label className="block text-xs font-medium text-gray-500 mb-1 uppercase tracking-wide">
                  From
                </label>
                <div className="relative">
                  <FaMapMarkerAlt className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    value={fromDisplay}
                    onChange={handleFromInputChange}
                    onFocus={() => {
                      setShowFromDropdown(true);
                      if (selectedFromAirport) {
                        setFromDisplay("");
                        setSelectedFromAirport(null);
                        setFrom("");
                      }
                    }}
                    placeholder="Type city or airport (min 3 characters)"
                    className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FD561E] focus:border-transparent text-gray-800 transition-all duration-200 hover:border-gray-400"
                  />
                  {fromLoading && (
                    <FaSpinner className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 animate-spin" />
                  )}

                  {/* From Dropdown */}
                  {showFromDropdown && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-lg shadow-xl border border-gray-200 z-50 max-h-64 overflow-y-auto">
                      <div className="p-3">
                        {fromLoading ? (
                          <div className="flex items-center justify-center py-4">
                            <FaSpinner className="animate-spin text-[#FD561E] mr-2" />
                            <span className="text-gray-600">
                              Searching airports...
                            </span>
                          </div>
                        ) : fromSearchError ? (
                          <div className="text-center py-4 text-red-500">
                            {fromSearchError}
                          </div>
                        ) : fromDisplay.length < 3 && fromDisplay.length > 0 ? (
                          <div className="text-center py-4 text-gray-500">
                            Type at least 3 characters to search
                          </div>
                        ) : fromAirports.length === 0 &&
                          fromDisplay.length >= 3 ? (
                          <div className="text-center py-4 text-gray-500">
                            No airports found
                          </div>
                        ) : (
                          <div className="space-y-1">
                            {fromAirports.map((airport) => (
                              <div
                                key={`from-${airport.location_code}`}
                                className="flex items-center justify-between p-2 hover:bg-orange-50 rounded cursor-pointer transition-colors"
                                onClick={() =>
                                  handleAirportSelect(airport, "from")
                                }
                              >
                                <div>
                                  <div className="font-medium text-gray-900">
                                    {airport.name}
                                  </div>
                                  <div className="text-xs text-gray-500">
                                    {airport.location_code}
                                  </div>
                                </div>
                                <div className="text-sm font-bold text-gray-700">
                                  {airport.location_code}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* To Field */}
              <div className="lg:col-span-3 relative" ref={toRef}>
                <label className="block text-xs font-medium text-gray-500 mb-1 uppercase tracking-wide">
                  To
                </label>
                <div className="relative">
                  <button
                    className="absolute -left-4 top-1/2 transform -ml-2 -translate-y-1/2 z-10 bg-white border border-gray-300 rounded-full p-2 hover:bg-gray-50 transition-colors shadow-sm"
                    onClick={handleSwapCities}
                    title="Swap cities"
                    disabled={!selectedFromAirport || !selectedToAirport}
                  >
                    <FaExchangeAlt className="text-gray-500 text-sm" />
                  </button>

                  <FaMapMarkerAlt className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    value={toDisplay}
                    onChange={handleToInputChange}
                    onFocus={() => {
                      setShowToDropdown(true);
                      if (selectedToAirport) {
                        setToDisplay("");
                        setSelectedToAirport(null);
                        setTo("");
                      }
                    }}
                    placeholder="Type city or airport (min 3 characters)"
                    className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FD561E] focus:border-transparent text-gray-800 transition-all duration-200 hover:border-gray-400"
                  />
                  {toLoading && (
                    <FaSpinner className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 animate-spin" />
                  )}

                  {/* To Dropdown */}
                  {showToDropdown && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-lg shadow-xl border border-gray-200 z-50 max-h-64 overflow-y-auto">
                      <div className="p-3">
                        {toLoading ? (
                          <div className="flex items-center justify-center py-4">
                            <FaSpinner className="animate-spin text-[#FD561E] mr-2" />
                            <span className="text-gray-600">
                              Searching airports...
                            </span>
                          </div>
                        ) : toSearchError ? (
                          <div className="text-center py-4 text-red-500">
                            {toSearchError}
                          </div>
                        ) : toDisplay.length < 3 && toDisplay.length > 0 ? (
                          <div className="text-center py-4 text-gray-500">
                            Type at least 3 characters to search
                          </div>
                        ) : toAirports.length === 0 && toDisplay.length >= 3 ? (
                          <div className="text-center py-4 text-gray-500">
                            No airports found
                          </div>
                        ) : (
                          <div className="space-y-1">
                            {toAirports.map((airport) => (
                              <div
                                key={`to-${airport.location_code}`}
                                className="flex items-center justify-between p-2 hover:bg-orange-50 rounded cursor-pointer transition-colors"
                                onClick={() =>
                                  handleAirportSelect(airport, "to")
                                }
                              >
                                <div>
                                  <div className="font-medium text-gray-900">
                                    {airport.name}
                                  </div>
                                  <div className="text-xs text-gray-500">
                                    {airport.location_code}
                                  </div>
                                </div>
                                <div className="text-sm font-bold text-gray-700">
                                  {airport.location_code}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Departure Date */}
              <div className="lg:col-span-2">
                <label className="block text-xs font-medium text-gray-500 mb-1 uppercase tracking-wide">
                  Departure
                </label>
                <div className="relative">
                  <FaCalendarAlt className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 z-10" />
                  <DatePicker
                    selected={departureDate}
                    onChange={(date) => {
                      setDepartureDate(date);
                      updateDepartureDate(date);
                    }}
                    className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FD561E] focus:border-transparent text-gray-800 transition-all duration-200 hover:border-gray-400 cursor-pointer"
                    dateFormat="EEE, dd MMM"
                    minDate={new Date()}
                    popperClassName="z-50"
                  />
                </div>
              </div>

              {/* Travellers & Class */}
              <div className="lg:col-span-4 relative" ref={travellerRef}>
                <label className="block text-xs font-medium text-gray-500 mb-1 uppercase tracking-wide">
                  Travellers & Class
                </label>
                <div className="relative">
                  <div
                    className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg bg-white cursor-pointer flex items-center text-gray-800 hover:border-[#FD561E] transition-all duration-200"
                    onClick={openTravellerModal}
                  >
                    <FaUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <span className="truncate">{formatTravellersText()}</span>
                    <FaChevronDown
                      className={`absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 transition-all duration-200 ${
                        showTravellerModal ? "rotate-180" : ""
                      }`}
                    />
                  </div>

                  {/* Traveller Modal - Dynamic Passenger Selection */}
                  {showTravellerModal && (
                    <div className="absolute top-full left-0 mt-2 w-96 bg-white rounded-xl shadow-2xl border border-gray-200 z-50 p-5">
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="font-bold text-gray-800">
                          Select Travellers
                        </h3>
                        <button
                          onClick={cancelPassengerChanges}
                          className="text-gray-400 hover:text-gray-600 transition-colors"
                        >
                          <FaTimes />
                        </button>
                      </div>

                      {/* Max Limit Indicator */}
                      <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-100">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium text-gray-700">
                            Max {maxTravellers} travellers allowed
                          </span>
                          <span
                            className={`text-sm font-bold ${
                              tempPassengers.length >= maxTravellers
                                ? "text-red-600"
                                : "text-green-600"
                            }`}
                          >
                            {tempPassengers.length}/{maxTravellers}
                          </span>
                        </div>
                      </div>

                      {/* Passenger List */}
                      <div className="space-y-3 mb-4 max-h-60 overflow-y-auto">
                        {tempPassengers.map((passenger, index) => (
                          <div key={index} className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                            <div className="flex-1">
                              <div className="flex items-center justify-between">
                                <span className="font-medium text-gray-700">
                                  {passenger.code === 'ADT' && 'Adult'}
                                  {passenger.code === 'CNN' && 'Child'}
                                  {passenger.code === 'INF' && 'Infant'}
                                </span>
                                <button
                                  onClick={() => removeTempPassenger(index)}
                                  className="text-red-500 hover:text-red-700"
                                >
                                  <FaTimes className="w-3 h-3" />
                                </button>
                              </div>
                              
                              {/* Age input for children and infants */}
                              {(passenger.code === 'CNN' || passenger.code === 'INF') && (
                                <div className="mt-2">
                                  <label className="text-xs text-gray-500">Age</label>
                                  <select
                                    value={passenger.age || (passenger.code === 'CNN' ? 8 : 1)}
                                    onChange={(e) => updateTempPassengerAge(index, e.target.value)}
                                    className="w-full mt-1 px-2 py-1 text-sm border border-gray-300 rounded"
                                  >
                                    {passenger.code === 'CNN' && (
                                      // Children ages 2-12
                                      [...Array(11)].map((_, i) => (
                                        <option key={i + 2} value={i + 2}>
                                          {i + 2} years
                                        </option>
                                      ))
                                    )}
                                    {passenger.code === 'INF' && (
                                      // Infants ages 0-2
                                      [...Array(3)].map((_, i) => (
                                        <option key={i} value={i}>
                                          {i} {i === 1 ? 'year' : 'years'}
                                        </option>
                                      ))
                                    )}
                                  </select>
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Add Passenger Buttons */}
                      <div className="flex flex-wrap gap-2 mb-6">
                        <button
                          className={`px-3 py-2 text-sm rounded-lg border transition-all ${
                            tempPassengers.length >= maxTravellers
                              ? "border-gray-200 text-gray-300 cursor-not-allowed"
                              : "border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-[#FD561E]"
                          }`}
                          onClick={() => addTempPassenger('ADT')}
                          disabled={tempPassengers.length >= maxTravellers}
                        >
                          + Adult
                        </button>
                        <button
                          className={`px-3 py-2 text-sm rounded-lg border transition-all ${
                            tempPassengers.length >= maxTravellers
                              ? "border-gray-200 text-gray-300 cursor-not-allowed"
                              : "border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-[#FD561E]"
                          }`}
                          onClick={() => addTempPassenger('CNN')}
                          disabled={tempPassengers.length >= maxTravellers}
                        >
                          + Child
                        </button>
                        <button
                          className={`px-3 py-2 text-sm rounded-lg border transition-all ${
                            tempPassengers.length >= maxTravellers
                              ? "border-gray-200 text-gray-300 cursor-not-allowed"
                              : "border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-[#FD561E]"
                          }`}
                          onClick={() => addTempPassenger('INF')}
                          disabled={tempPassengers.length >= maxTravellers}
                        >
                          + Infant
                        </button>
                      </div>

                      {/* Class Selection */}
                      <div className="mb-6">
                        <h4 className="font-medium text-gray-800 mb-3">
                          Travel Class
                        </h4>
                        <div className="grid grid-cols-2 gap-2">
                          {["Economy", "Premium Economy", "Business", "First"].map((cls) => (
                            <button
                              key={cls}
                              className={`py-2.5 px-3 rounded-lg text-sm font-medium transition-all ${
                                travelClass === cls
                                  ? "bg-[#FD561E] text-white shadow-sm"
                                  : "bg-gray-100 text-gray-700 hover:bg-gray-200 border border-transparent hover:border-gray-300"
                              }`}
                              onClick={() => setTravelClass(cls)}
                            >
                              {cls}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <button
                          className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-lg font-bold hover:bg-gray-200 transition-all"
                          onClick={cancelPassengerChanges}
                        >
                          Cancel
                        </button>
                        <button
                          className="flex-1 bg-[#FD561E] text-white py-3 rounded-lg font-bold hover:bg-[#e54d1a] transition-all shadow-md hover:shadow-lg"
                          onClick={applyPassengerChanges}
                        >
                          Apply
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Special Fares */}
            <SpecialFares
              specialFares={specialFares}
              setSpecialFares={setSpecialFares}
            />

            {/* Search Button */}
            <div className="absolute -bottom-6 left-1/2 -translate-x-1/2">
              <button
                onClick={handleSearch}
                disabled={flightResults.loading}
                className="bg-gradient-to-r from-[#FD561E] to-[#ff7b4a] 
                  text-white px-10 py-4 
                  rounded-full font-bold text-lg 
                  shadow-xl hover:shadow-2xl
                  transition-all duration-300 
                  hover:scale-105
                  flex items-center space-x-2
                  disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
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
      
      {/* Additional Content Section */}
      <DoMoreWithBobros />
      <PopularFlightRoutes />
      <FlightFAQ />
      <Quick_Links />
    </div>
  );
};

export default FlightHeroSection;