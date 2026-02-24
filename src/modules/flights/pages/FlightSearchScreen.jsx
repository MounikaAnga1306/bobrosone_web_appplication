// src/modules/flights/pages/FlightSearchScreen.jsx
import React, { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import DatePicker from "react-datepicker";
import { Bus, Plane, Hotel, Palmtree, Car } from "lucide-react";
import { motion } from "framer-motion";
import "react-datepicker/dist/react-datepicker.css";
import { useFlightSearchContext } from "../contexts/flightSearchContext";
import { searchFlights } from "../services/flightSearchService";
import { searchAirports } from "../services/airportSearchService"; // We'll create this service
import SpecialFares from "../components/SpecialFares";
import {
  FaSearch,
  FaExchangeAlt,
  FaCalendarAlt,
  FaUser,
  FaMapMarkerAlt,
  FaChevronDown,
  FaTimes,
  FaPlane,
  FaSpinner,
} from "react-icons/fa";

const FlightSearchScreen = () => {
  const navigate = useNavigate();
  const { updateSearchParams, updateFlightResults, flightResults } =
    useFlightSearchContext();

  // State
  const [tripType, setTripType] = useState("one-way");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [fromDisplay, setFromDisplay] = useState(""); // Display value for input
  const [toDisplay, setToDisplay] = useState(""); // Display value for input
  const [departureDate, setDepartureDate] = useState(new Date());
  const [returnDate, setReturnDate] = useState(null);
  const [activeTab, setActiveTab] = useState("flights");
  const [specialFares, setSpecialFares] = useState({
    regular: false,
    student: false,
    seniorCitizen: false,
    armed: false,
    doctors: false,
  });
  // Traveller state
  const [travellers, setTravellers] = useState({
    adults: 1,
    children: 0,
    infants: 1,
    class: "Economy",
  });
  const [showTravellerModal, setShowTravellerModal] = useState(false);

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

  // Refs for closing dropdowns and debouncing
  const travellerRef = useRef(null);
  const fromRef = useRef(null);
  const toRef = useRef(null);
  const fromSearchTimeout = useRef(null);
  const toSearchTimeout = useRef(null);

  // Travel classes
  const travelClasses = ["Economy", "Premium Economy", "Business", "First"];

  // Category tabs
  // const tabs = [
  //   { id: "buses", label: "Buses", icon: "🚌" },
  //   { id: "flights", label: "Flights", icon: "✈️" },
  //   { id: "trains", label: "Trains", icon: "🚆" },
  //   { id: "hotels", label: "Hotels", icon: "🏨" },
  // ];

  // Calculate total travellers
  const totalTravellers =
    travellers.adults + travellers.children + travellers.infants;
  const maxTravellers = 9;

  // Format travellers text for display
  const formatTravellersText = () => {
    const total = totalTravellers;
    return `${total} Traveller${total > 1 ? "s" : ""}, ${travellers.class}`;
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

  // Debounced search handler for from field
  const debouncedFromSearch = useCallback((value) => {
    if (fromSearchTimeout.current) {
      clearTimeout(fromSearchTimeout.current);
    }

    if (value.length >= 3) {
      setFromLoading(true);
      fromSearchTimeout.current = setTimeout(() => {
        searchAirportsAPI(value, "from");
      }, 500); // 500ms debounce
    } else if (value.length > 0) {
      setFromAirports([]);
      setFromLoading(false);
    } else {
      setFromAirports([]);
      setFromLoading(false);
    }
  }, []);

  // Debounced search handler for to field
  const debouncedToSearch = useCallback((value) => {
    if (toSearchTimeout.current) {
      clearTimeout(toSearchTimeout.current);
    }

    if (value.length >= 3) {
      setToLoading(true);
      toSearchTimeout.current = setTimeout(() => {
        searchAirportsAPI(value, "to");
      }, 500); // 500ms debounce
    } else if (value.length > 0) {
      setToAirports([]);
      setToLoading(false);
    } else {
      setToAirports([]);
      setToLoading(false);
    }
  }, []);

  // Handle from input change
  const handleFromInputChange = (e) => {
    const value = e.target.value;
    setFromDisplay(value);

    // Clear selected airport when user types
    if (selectedFromAirport) {
      setSelectedFromAirport(null);
      setFrom("");
    }

    // Trigger debounced search
    debouncedFromSearch(value);

    // Keep dropdown open
    setShowFromDropdown(true);
  };

  // Handle to input change
  const handleToInputChange = (e) => {
    const value = e.target.value;
    setToDisplay(value);

    // Clear selected airport when user types
    if (selectedToAirport) {
      setSelectedToAirport(null);
      setTo("");
    }

    // Trigger debounced search
    debouncedToSearch(value);

    // Keep dropdown open
    setShowToDropdown(true);
  };

  // Handle airport selection
  const handleAirportSelect = (airport, type) => {
    if (type === "from") {
      setSelectedFromAirport(airport);
      setFrom(airport.location_code); // Store code for API
      setFromDisplay(`${airport.name} (${airport.location_code})`); // Show display format
      setShowFromDropdown(false);
      setFromAirports([]);
    } else {
      setSelectedToAirport(airport);
      setTo(airport.location_code); // Store code for API
      setToDisplay(`${airport.name} (${airport.location_code})`); // Show display format
      setShowToDropdown(false);
      setToAirports([]);
    }
  };

  // Handle swap cities
  const handleSwapCities = () => {
    // Swap display values
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
  };

  // Handle traveller updates
  const updateTravellers = (type, action) => {
    setTravellers((prev) => {
      const currentTotal = prev.adults + prev.children + prev.infants;
      const currentValue = prev[type];

      let newValue;
      if (action === "increment") {
        if (currentTotal >= maxTravellers) return prev;
        newValue = currentValue + 1;
      } else {
        if (type === "adults" && currentValue <= 1) return prev;
        if ((type === "children" || type === "infants") && currentValue <= 0)
          return prev;
        newValue = currentValue - 1;
      }

      if (type === "adults") {
        return {
          ...prev,
          adults: newValue,
          infants: newValue,
        };
      }

      return {
        ...prev,
        [type]: newValue,
      };
    });
  };

  // Set travel class
  const setTravelClass = (travelClass) => {
    setTravellers((prev) => ({
      ...prev,
      class: travelClass,
    }));
  };

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        travellerRef.current &&
        !travellerRef.current.contains(event.target)
      ) {
        setShowTravellerModal(false);
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

  // Cleanup timeouts on unmount
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

  // Handle search
  const handleSearch = async () => {
    if (!selectedFromAirport || !selectedToAirport) {
      alert("Please select both departure and arrival cities");
      return;
    }

    if (selectedFromAirport.location_code === selectedToAirport.location_code) {
      alert("Departure and arrival cities cannot be the same");
      return;
    }

    updateFlightResults({ loading: true, error: null });

    const searchData = {
      origin: selectedFromAirport.location_code,
      destination: selectedToAirport.location_code,
      departureDate: departureDate,
      returnDate: tripType === "round-trip" ? returnDate : null,
      travellers: travellers,
    };

    updateSearchParams(searchData);

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

  const tabs = [
    { id: "flights", label: "Flights", icon: Plane },
    { id: "bus", label: "Bus", icon: Bus },
    { id: "hotels", label: "Hotels", icon: Hotel },
    { id: "holidays", label: "Holidays", icon: Palmtree },
    { id: "cabs", label: "Cabs", icon: Car },
  ];

  return (
    <div className="w-full bg-gray-50">
      {/* Hero Section - Full width image */}
      <div className="relative w-full h-[800px] overflow-hidden">
        <div className="absolute inset-0 w-screen left-1/2 right-1/2 -ml-[50vw] -mr-[50vw]">
          <img
            src="https://images.unsplash.com/photo-1436491865332-7a61a109cc05?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80"
            alt="Airplane wing view during daytime"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-transparent"></div>
        </div>

        <div className="relative z-10 flex flex-col h-[400px]">
          {/* Top section with tabs */}
          {/* <div className="pt-8">
            <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex justify-start">
                <div className="inline-flex bg-white/95 backdrop-blur-md rounded-xl p-1 shadow-xl border border-white/20">
                  {tabs.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all duration-300 ${
                        activeTab === tab.id
                          ? "bg-orange-500 text-white shadow-md"
                          : "text-gray-700 hover:text-orange-500 hover:bg-orange-50"
                      }`}
                    >
                      <span>{tab.icon}</span>
                      <span>{tab.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div> */}
        </div>
      </div>

      {/* Search Section - Overlapping card */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-160 mb-10 z-20">
        {/* Flight Booking Card */}

        <div className=" relative bg-white rounded-2xl shadow-xl p-6 pb-16 border border-gray-200">
          {/* Service Tabs */}
          <motion.div
            className="flex items-center justify-start gap-4 mb-6  backdrop-blur-md p-4 rounded-3xl w-fit"
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.5 }}
          >
            {tabs.map((tab, index) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;

              return (
                <motion.button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id);

                    if (tab.id === "flights") {
                      navigate("/flights/search");
                    }

                    if (tab.id === "bus") {
                      navigate("/HomePage");
                    }
                  }}
                  className={`flex items-center gap-3 px-6 py-3 cursor-pointer rounded-2xl border transition-all duration-200 ${
                    isActive
                      ? "bg-white border-black shadow-md"
                      : "bg-gray-50 border-gray-200 hover:bg-white hover:border-gray-300"
                  }`}
                  whileHover={{ scale: 1.05, y: -3 }}
                  whileTap={{ scale: 0.95 }}
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.4, delay: 0.6 + index * 0.05 }}
                >
                  <Icon
                    className={`w-6 h-6 ${
                      isActive ? "text-black" : "text-gray-600"
                    }`}
                  />
                  <span
                    className={`font-semibold ${
                      isActive ? "text-black" : "text-gray-700"
                    }`}
                  >
                    {tab.label}
                  </span>
                </motion.button>
              );
            })}
          </motion.div>
          {/* <h1 className="text-2xl font-bold text-gray-800 mb-6">
            Flight Booking
          </h1> */}

          {/* Trip Type Toggle */}
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
                className={`px-5 py-2 text-sm font-medium rounded-md transition-all duration-200 ${
                  tripType === "round-trip"
                    ? "bg-white text-gray-900 shadow-sm border border-gray-300"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                }`}
                onClick={() => setTripType("round-trip")}
              >
                Round Trip
              </button>
            </div>
          </div>

          {/* Search Form */}
          <div className="space-y-6">
            {/* Input Fields Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-4">
              {/* From with dropdown */}
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

                  {/* Airport Dropdown */}
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

              {/* To with dropdown and swap button */}
              <div className="lg:col-span-3 relative" ref={toRef}>
                <label className="block text-xs font-medium text-gray-500 mb-1 uppercase tracking-wide">
                  To
                </label>
                <div className="relative">
                  {/* Swap Button */}
                  <button
                    className="absolute -left-4 top-1/2 transform -ml-2 -translate-y-1/2 z-10 bg-white border border-gray-300 rounded-full p-2 hover:bg-gray-50 transition-colors shadow-sm"
                    onClick={handleSwapCities}
                    title="Swap cities"
                  >
                    <FaExchangeAlt className="text-gray-500 text-sm " />
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

                  {/* Airport Dropdown */}
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
                    onChange={(date) => setDepartureDate(date)}
                    className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FD561E] focus:border-transparent text-gray-800 transition-all duration-200 hover:border-gray-400 cursor-pointer"
                    dateFormat="EEE, dd MMM"
                    minDate={new Date()}
                    popperClassName="z-50"
                  />
                </div>
              </div>

              {/* Return Date - Show only for round trip */}
              {tripType === "round-trip" && (
                <div className="lg:col-span-2">
                  <label className="block text-xs font-medium text-gray-500 mb-1 uppercase tracking-wide">
                    Return
                  </label>
                  <div className="relative">
                    <FaCalendarAlt className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 z-10" />
                    <DatePicker
                      selected={returnDate}
                      onChange={(date) => setReturnDate(date)}
                      className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FD561E] focus:border-transparent text-gray-800 transition-all duration-200 hover:border-gray-400 cursor-pointer"
                      dateFormat="EEE, dd MMM"
                      minDate={departureDate}
                      placeholderText="Add return"
                      popperClassName="z-50"
                      isClearable
                    />
                  </div>
                </div>
              )}

              {/* Travellers & Class */}
              <div className="lg:col-span-2 relative" ref={travellerRef}>
                <label className="block text-xs font-medium text-gray-500 mb-1 uppercase tracking-wide">
                  Travellers & Class
                </label>
                <div className="relative">
                  <div
                    className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg bg-white cursor-pointer flex items-center text-gray-800 hover:border-[#FD561E] transition-all duration-200"
                    onClick={() => setShowTravellerModal(!showTravellerModal)}
                  >
                    <FaUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <span className="truncate">{formatTravellersText()}</span>
                    <FaChevronDown
                      className={`absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 transition-all duration-200 ${showTravellerModal ? "rotate-180" : ""}`}
                    />
                  </div>

                  {/* Traveller Modal */}
                  {showTravellerModal && (
                    <div className="absolute top-full left-0 mt-2 w-80 bg-white rounded-xl shadow-2xl border border-gray-200 z-50 p-5">
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="font-bold text-gray-800">
                          Travellers & Class
                        </h3>
                        <button
                          onClick={() => setShowTravellerModal(false)}
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
                            className={`text-sm font-bold ${totalTravellers >= maxTravellers ? "text-red-600" : "text-green-600"}`}
                          >
                            {totalTravellers}/{maxTravellers}
                          </span>
                        </div>
                      </div>

                      {/* Passenger Selection */}
                      <div className="space-y-4 mb-6">
                        {[
                          { type: "adults", label: "Adults (12+ yrs)", min: 1 },
                          {
                            type: "children",
                            label: "Children (2-12 yrs)",
                            min: 0,
                          },
                          {
                            type: "infants",
                            label: "Infants (Below 2 yrs)",
                            min: 0,
                          },
                        ].map(({ type, label, min }) => (
                          <div
                            key={type}
                            className="flex justify-between items-center"
                          >
                            <div>
                              <div className="font-medium text-gray-800">
                                {label}
                              </div>
                              {type === "infants" && (
                                <div className="text-xs text-gray-500 mt-1">
                                  1 infant per adult (auto-adjusted)
                                </div>
                              )}
                            </div>
                            <div className="flex items-center space-x-3">
                              <button
                                className={`w-8 h-8 rounded-full border flex items-center justify-center transition-all ${travellers[type] <= min ? "border-gray-200 text-gray-300 cursor-not-allowed" : "border-gray-300 text-gray-600 hover:bg-gray-50 hover:border-gray-400"}`}
                                onClick={() =>
                                  updateTravellers(type, "decrement")
                                }
                                disabled={travellers[type] <= min}
                              >
                                <span>−</span>
                              </button>
                              <span className="font-bold text-gray-800 min-w-[20px] text-center">
                                {travellers[type]}
                              </span>
                              <button
                                className={`w-8 h-8 rounded-full border flex items-center justify-center transition-all ${totalTravellers >= maxTravellers ? "border-gray-200 text-gray-300 cursor-not-allowed" : "border-gray-300 text-gray-600 hover:bg-gray-50 hover:border-gray-400"}`}
                                onClick={() =>
                                  updateTravellers(type, "increment")
                                }
                                disabled={
                                  totalTravellers >= maxTravellers ||
                                  type === "infants"
                                }
                              >
                                <span>+</span>
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Class Selection */}
                      <div className="mb-6">
                        <h4 className="font-medium text-gray-800 mb-3">
                          Travel Class
                        </h4>
                        <div className="grid grid-cols-2 gap-2">
                          {travelClasses.map((travelClass) => (
                            <button
                              key={travelClass}
                              className={`py-2.5 px-3 rounded-lg text-sm font-medium transition-all ${
                                travellers.class === travelClass
                                  ? "bg-[#FD561E] text-white shadow-sm"
                                  : "bg-gray-100 text-gray-700 hover:bg-gray-200 border border-transparent hover:border-gray-300"
                              }`}
                              onClick={() => setTravelClass(travelClass)}
                            >
                              {travelClass}
                            </button>
                          ))}
                        </div>
                      </div>

                      <button
                        className="w-full bg-[#FD561E] text-white py-3 rounded-lg font-bold hover:bg-[#e54d1a] transition-all duration-200 shadow-md hover:shadow-lg"
                        onClick={() => setShowTravellerModal(false)}
                      >
                        Apply
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* SEARCH BUTTON */}
              {/* FLOATING SEARCH BUTTON */}
              <div className="absolute -bottom-6 left-1/2 -translate-x-1/2">
                <button
                  onClick={handleSearch}
                  disabled={
                    flightResults.loading ||
                    !selectedFromAirport ||
                    !selectedToAirport
                  }
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

            {/* Special Fares */}
            <SpecialFares
              specialFares={specialFares}
              setSpecialFares={setSpecialFares}
            />
          </div>
        </div>

        {/* Do More With BOBROS Section */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8 mt-30">
          <h2 className="text-xl font-bold text-gray-800 mb-6">
            Do More With BOBROS
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-7 gap-4">
            {[
              "Flight Tracker",
              "Credit Card",
              "Cruise",
              "Book Visa",
              "Group Booking",
              "Plan",
              "Fare Alerts",
            ].map((item, index) => (
              <div
                key={index}
                className="flex flex-col items-center p-4 hover:bg-gray-50 rounded-lg transition-all duration-200 cursor-pointer group"
                onClick={() => {
                  if (item === "Flight Tracker") {
                    navigate("/flights/tracker");
                  }
                }}
              >
                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-2 group-hover:bg-orange-50 group-hover:text-[#FD561E] transition-all">
                  <FaPlane className="text-gray-600 group-hover:text-[#FD561E]" />
                </div>
                <span className="text-sm font-medium text-gray-700 text-center group-hover:text-[#FD561E]">
                  {item}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Today's Flight Offers */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-800 mb-6">
            Today's Flight Offers
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              {
                route: "Delhi → Mumbai",
                price: "₹2,499",
                airline: "IndiGo",
                duration: "1h 30m",
              },
              {
                route: "Bangalore → Delhi",
                price: "₹3,199",
                airline: "Air India",
                duration: "2h 30m",
              },
              {
                route: "Mumbai → Goa",
                price: "₹1,899",
                airline: "SpiceJet",
                duration: "1h 15m",
              },
              {
                route: "Chennai → Kolkata",
                price: "₹2,899",
                airline: "Vistara",
                duration: "2h 15m",
              },
            ].map((offer, index) => (
              <div
                key={index}
                className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-all duration-300 hover:border-[#FD561E] group"
              >
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="font-bold text-gray-800 group-hover:text-[#FD561E]">
                      {offer.route}
                    </h3>
                    <div className="flex items-center mt-1 space-x-2">
                      <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                        {offer.duration}
                      </span>
                      <span className="text-xs text-gray-500">
                        {offer.airline}
                      </span>
                    </div>
                  </div>
                  <span className="text-[#FD561E] font-bold text-lg">
                    {offer.price}
                  </span>
                </div>
                <button className="w-full mt-4 py-2 bg-gradient-to-r from-[#FD561E] to-[#ff7b4a] text-white rounded-lg font-semibold hover:from-[#e54d1a] hover:to-[#ff6a3c] transition-all duration-300 shadow hover:shadow-lg">
                  Book Now
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* FAQ Section */}
        <div className="bg-white rounded-xl shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-8 text-center">
            Frequently Asked Questions
          </h2>
          <div className="space-y-6">
            <div className="p-4 hover:bg-gray-50 rounded-lg transition-colors duration-200">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                Why is flight ticket booking the cheapest on BOBROS?
              </h3>
              <p className="text-gray-600">
                BOBROS directly searches multiple airline websites for the
                cheapest fares. Many airlines sell their cheapest flight tickets
                on BOBROS. Additionally, with its exclusive offers and deals,
                including several bank and partner offers, BOBROS serves as the
                best and cheap platform to book cheap flights online.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FlightSearchScreen;
