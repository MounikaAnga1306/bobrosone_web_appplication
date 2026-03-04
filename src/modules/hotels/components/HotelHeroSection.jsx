// src/modules/hotels/components/HotelHeroSection.jsx
import React, { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { FaSearch, FaMapMarkerAlt, FaCalendarAlt, FaUser, FaChevronDown, FaTimes, FaSpinner } from "react-icons/fa";
import { Bus, Plane, Building2, Palmtree, Car } from "lucide-react";

// Tabs configuration (same as flights)
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

// Popular cities for hotel search
const popularCities = [
  { code: "HYD", name: "Hyderabad", fullName: "Hyderabad, Telangana" },
  { code: "BOM", name: "Mumbai", fullName: "Mumbai, Maharashtra" },
  { code: "DEL", name: "Delhi", fullName: "Delhi, NCR" },
  { code: "BLR", name: "Bangalore", fullName: "Bangalore, Karnataka" },
  { code: "MAA", name: "Chennai", fullName: "Chennai, Tamil Nadu" },
  { code: "CCU", name: "Kolkata", fullName: "Kolkata, West Bengal" },
  { code: "GOI", name: "Goa", fullName: "Goa" },
  { code: "JAIPUR", name: "Jaipur", fullName: "Jaipur, Rajasthan" },
];

const HotelHeroSection = () => {
  const navigate = useNavigate();
  
  // State for form fields
  const [location, setLocation] = useState("");
  const [locationDisplay, setLocationDisplay] = useState("");
  const [checkinDate, setCheckinDate] = useState(new Date());
  const [checkoutDate, setCheckoutDate] = useState(new Date(Date.now() + 3 * 24 * 60 * 60 * 1000)); // 3 days later
  const [activeTab, setActiveTab] = useState("hotels");
  
  // State for loading and errors
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // State for city search dropdown
  const [showLocationDropdown, setShowLocationDropdown] = useState(false);
  const [locationResults, setLocationResults] = useState([]);
  const [locationLoading, setLocationLoading] = useState(false);
  const [locationSearchError, setLocationSearchError] = useState(null);
  const [selectedLocation, setSelectedLocation] = useState(null);
  
  // State for guests/rooms modal
  const [showGuestsModal, setShowGuestsModal] = useState(false);
  const [guests, setGuests] = useState({
    rooms: 1,
    adults: 2,
    children: 0,
  });
  
  // Refs
  const locationRef = useRef(null);
  const guestsRef = useRef(null);
  const locationSearchTimeout = useRef(null);
  
  // Max limits
  const maxRooms = 5;
  const maxAdultsPerRoom = 4;
  const maxChildrenPerRoom = 3;
  const totalGuests = guests.adults + guests.children;

  // Format guests text for display
  const formatGuestsText = () => {
    return `${guests.rooms} Room${guests.rooms > 1 ? "s" : ""}, ${guests.adults} Adult${guests.adults > 1 ? "s" : ""}${guests.children > 0 ? `, ${guests.children} Child${guests.children > 1 ? "ren" : ""}` : ""}`;
  };

  // City search function (simulated - replace with actual API)
  const searchCitiesAPI = async (searchTerm) => {
    if (searchTerm.length < 2) {
      setLocationResults([]);
      setLocationLoading(false);
      return;
    }

    try {
      setLocationLoading(true);
      setLocationSearchError(null);
      
      // Simulate API call - replace with actual city search API
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Filter popular cities based on search term
      const results = popularCities.filter(city => 
        city.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        city.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        city.code.toLowerCase().includes(searchTerm.toLowerCase())
      );
      
      setLocationResults(results);
      setLocationLoading(false);
    } catch (error) {
      setLocationSearchError("Failed to search cities. Please try again.");
      setLocationLoading(false);
      setLocationResults([]);
    }
  };

  // Debounced search handler
  const debouncedLocationSearch = useCallback((value) => {
    if (locationSearchTimeout.current) {
      clearTimeout(locationSearchTimeout.current);
    }

    if (value.length >= 2) {
      locationSearchTimeout.current = setTimeout(() => {
        searchCitiesAPI(value);
      }, 400);
    } else {
      setLocationResults([]);
      setLocationLoading(false);
    }
  }, []);

  // Handle location input change
  const handleLocationInputChange = (e) => {
    const value = e.target.value;
    setLocationDisplay(value);
    
    if (selectedLocation) {
      setSelectedLocation(null);
      setLocation("");
    }
    
    debouncedLocationSearch(value);
    setShowLocationDropdown(true);
  };

  // Handle city selection
  const handleCitySelect = (city) => {
    setSelectedLocation(city);
    setLocation(city.code);
    setLocationDisplay(city.fullName);
    setShowLocationDropdown(false);
    setLocationResults([]);
  };

  // Handle guests update
  const updateGuests = (type, action) => {
    setGuests(prev => {
      let newValue = prev[type];
      
      if (action === "increment") {
        if (type === "rooms" && prev.rooms >= maxRooms) return prev;
        if (type === "adults" && prev.adults >= maxAdultsPerRoom * prev.rooms) return prev;
        if (type === "children" && prev.children >= maxChildrenPerRoom * prev.rooms) return prev;
        newValue = prev[type] + 1;
      } else {
        if (type === "rooms" && prev.rooms <= 1) return prev;
        if (type === "adults" && prev.adults <= 1) return prev;
        if (type === "children" && prev.children <= 0) return prev;
        newValue = prev[type] - 1;
      }
      
      return {
        ...prev,
        [type]: newValue,
      };
    });
  };

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (locationRef.current && !locationRef.current.contains(event.target)) {
        setShowLocationDropdown(false);
        if (!selectedLocation) {
          setLocationDisplay("");
        }
      }
      if (guestsRef.current && !guestsRef.current.contains(event.target)) {
        setShowGuestsModal(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [selectedLocation]);

  // Cleanup timeouts
  useEffect(() => {
    return () => {
      if (locationSearchTimeout.current) {
        clearTimeout(locationSearchTimeout.current);
      }
    };
  }, []);

  // Handle search
  const handleSearch = async () => {
    if (!selectedLocation) {
      setError("Please select a city");
      return;
    }

    if (!checkinDate || !checkoutDate) {
      setError("Please select check-in and check-out dates");
      return;
    }

    if (checkoutDate <= checkinDate) {
      setError("Check-out date must be after check-in date");
      return;
    }

    setLoading(true);
    setError(null);

    const searchData = {
      location: selectedLocation.code,
      checkinDate: checkinDate.toISOString().split("T")[0],
      checkoutDate: checkoutDate.toISOString().split("T")[0],
      guests: guests,
    };

    console.log("🔵 Searching hotels:", searchData);

    try {
      // TODO: Replace with actual API call
      // const response = await searchHotels(searchData);
      
      // For now, simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Navigate to results page with search params
      navigate("/hotels/results", {
        state: {
          searchParams: searchData,
          // response: response.data
        },
      });
    } catch (err) {
      setError(err.message || "Failed to search hotels. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full bg-gray-50">
      {/* Hero Section - Full width image */}
      <div className="relative w-full h-[630px] overflow-hidden">
        <div className="absolute inset-0 w-screen left-1/2 right-1/2 -ml-[50vw] -mr-[50vw]">
          <img
            src="https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80"
            alt="Luxury hotel lobby with pool view"
            className="w-full h-full object-cover"
          />
        </div>
      </div>

      {/* Search Section - Overlapping card */}
      <div className="relative max-w-7xl mx-auto px-5 sm:px-6 lg:px-8 -mt-130">
        {/* Hotel Booking Card */}
        <div className="relative bg-white rounded-2xl shadow-xl p-6 pb-16 border border-gray-200">
          {/* Service Tabs */}
          <div className="flex gap-4 mb-10">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const active = activeTab === tab.id;

              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id);
                    navigate(tabRoutes[tab.id]);
                  }}
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

          {/* Search Form */}
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-4">
              {/* Location/City Field */}
              <div className="lg:col-span-4 relative" ref={locationRef}>
                <label className="block text-xs font-medium text-gray-500 mb-1 uppercase tracking-wide">
                  City / Hotel Name
                </label>
                <div className="relative">
                  <FaMapMarkerAlt className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    value={locationDisplay}
                    onChange={handleLocationInputChange}
                    onFocus={() => {
                      setShowLocationDropdown(true);
                      if (selectedLocation) {
                        setLocationDisplay("");
                        setSelectedLocation(null);
                        setLocation("");
                      }
                    }}
                    placeholder="Enter city or hotel name"
                    className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FD561E] focus:border-transparent text-gray-800 transition-all duration-200 hover:border-gray-400"
                    disabled={loading}
                  />
                  {locationLoading && (
                    <FaSpinner className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 animate-spin" />
                  )}

                  {/* Location Dropdown */}
                  {showLocationDropdown && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-lg shadow-xl border border-gray-200 z-50 max-h-64 overflow-y-auto">
                      <div className="p-3">
                        {locationLoading ? (
                          <div className="flex items-center justify-center py-4">
                            <FaSpinner className="animate-spin text-[#FD561E] mr-2" />
                            <span className="text-gray-600">Searching cities...</span>
                          </div>
                        ) : locationSearchError ? (
                          <div className="text-center py-4 text-red-500">
                            {locationSearchError}
                          </div>
                        ) : locationDisplay.length < 2 && locationDisplay.length > 0 ? (
                          <div className="text-center py-4 text-gray-500">
                            Type at least 2 characters to search
                          </div>
                        ) : locationResults.length === 0 && locationDisplay.length >= 2 ? (
                          <div className="text-center py-4 text-gray-500">
                            No cities found. Try a different search.
                          </div>
                        ) : (
                          <div className="space-y-1">
                            {locationResults.map((city, index) => (
                              <div
                                key={`${city.code}-${index}`}
                                className="flex items-center justify-between p-2 hover:bg-orange-50 rounded cursor-pointer transition-colors"
                                onClick={() => handleCitySelect(city)}
                              >
                                <div>
                                  <div className="font-medium text-gray-900">
                                    {city.fullName}
                                  </div>
                                  <div className="text-xs text-gray-500">
                                    {city.code}
                                  </div>
                                </div>
                                <div className="text-sm font-bold text-[#FD561E]">
                                  {city.code}
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

              {/* Check-in Date */}
              <div className="lg:col-span-3">
                <label className="block text-xs font-medium text-gray-500 mb-1 uppercase tracking-wide">
                  Check-in Date
                </label>
                <div className="relative">
                  <FaCalendarAlt className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 z-10" />
                  <DatePicker
                    selected={checkinDate}
                    onChange={(date) => setCheckinDate(date)}
                    className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FD561E] focus:border-transparent text-gray-800 transition-all duration-200 hover:border-gray-400 cursor-pointer"
                    dateFormat="EEE, dd MMM yyyy"
                    minDate={new Date()}
                    popperClassName="z-50"
                    disabled={loading}
                  />
                </div>
              </div>

              {/* Check-out Date */}
              <div className="lg:col-span-3">
                <label className="block text-xs font-medium text-gray-500 mb-1 uppercase tracking-wide">
                  Check-out Date
                </label>
                <div className="relative">
                  <FaCalendarAlt className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 z-10" />
                  <DatePicker
                    selected={checkoutDate}
                    onChange={(date) => setCheckoutDate(date)}
                    className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FD561E] focus:border-transparent text-gray-800 transition-all duration-200 hover:border-gray-400 cursor-pointer"
                    dateFormat="EEE, dd MMM yyyy"
                    minDate={checkinDate}
                    popperClassName="z-50"
                    disabled={loading}
                  />
                </div>
              </div>

              {/* Guests & Rooms */}
              <div className="lg:col-span-2 relative" ref={guestsRef}>
                <label className="block text-xs font-medium text-gray-500 mb-1 uppercase tracking-wide">
                  Guests & Rooms
                </label>
                <div className="relative">
                  <div
                    className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg bg-white cursor-pointer flex items-center text-gray-800 hover:border-[#FD561E] transition-all duration-200"
                    onClick={() => setShowGuestsModal(!showGuestsModal)}
                  >
                    <FaUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <span className="truncate">{formatGuestsText()}</span>
                    <FaChevronDown
                      className={`absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 transition-all duration-200 ${
                        showGuestsModal ? "rotate-180" : ""
                      }`}
                    />
                  </div>

                  {/* Guests Modal */}
                  {showGuestsModal && (
                    <div className="absolute top-full left-0 mt-2 w-80 bg-white rounded-xl shadow-2xl border border-gray-200 z-50 p-5">
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="font-bold text-gray-800">Select Rooms & Guests</h3>
                        <button
                          onClick={() => setShowGuestsModal(false)}
                          className="text-gray-400 hover:text-gray-600 transition-colors"
                        >
                          <FaTimes />
                        </button>
                      </div>

                      {/* Rooms */}
                      <div className="mb-4">
                        <div className="flex justify-between items-center">
                          <div>
                            <div className="font-medium text-gray-800">Rooms</div>
                            <div className="text-xs text-gray-500">Max {maxRooms} rooms</div>
                          </div>
                          <div className="flex items-center space-x-3">
                            <button
                              className={`w-8 h-8 rounded-full border flex items-center justify-center transition-all ${
                                guests.rooms <= 1
                                  ? "border-gray-200 text-gray-300 cursor-not-allowed"
                                  : "border-gray-300 text-gray-600 hover:bg-gray-50"
                              }`}
                              onClick={() => updateGuests("rooms", "decrement")}
                              disabled={guests.rooms <= 1}
                            >
                              <span>−</span>
                            </button>
                            <span className="font-bold text-gray-800 min-w-[20px] text-center">
                              {guests.rooms}
                            </span>
                            <button
                              className={`w-8 h-8 rounded-full border flex items-center justify-center transition-all ${
                                guests.rooms >= maxRooms
                                  ? "border-gray-200 text-gray-300 cursor-not-allowed"
                                  : "border-gray-300 text-gray-600 hover:bg-gray-50"
                              }`}
                              onClick={() => updateGuests("rooms", "increment")}
                              disabled={guests.rooms >= maxRooms}
                            >
                              <span>+</span>
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Adults */}
                      <div className="mb-4">
                        <div className="flex justify-between items-center">
                          <div>
                            <div className="font-medium text-gray-800">Adults</div>
                            <div className="text-xs text-gray-500">Age 13+</div>
                          </div>
                          <div className="flex items-center space-x-3">
                            <button
                              className={`w-8 h-8 rounded-full border flex items-center justify-center transition-all ${
                                guests.adults <= 1
                                  ? "border-gray-200 text-gray-300 cursor-not-allowed"
                                  : "border-gray-300 text-gray-600 hover:bg-gray-50"
                              }`}
                              onClick={() => updateGuests("adults", "decrement")}
                              disabled={guests.adults <= 1}
                            >
                              <span>−</span>
                            </button>
                            <span className="font-bold text-gray-800 min-w-[20px] text-center">
                              {guests.adults}
                            </span>
                            <button
                              className={`w-8 h-8 rounded-full border flex items-center justify-center transition-all ${
                                guests.adults >= maxAdultsPerRoom * guests.rooms
                                  ? "border-gray-200 text-gray-300 cursor-not-allowed"
                                  : "border-gray-300 text-gray-600 hover:bg-gray-50"
                              }`}
                              onClick={() => updateGuests("adults", "increment")}
                              disabled={guests.adults >= maxAdultsPerRoom * guests.rooms}
                            >
                              <span>+</span>
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Children */}
                      <div className="mb-6">
                        <div className="flex justify-between items-center">
                          <div>
                            <div className="font-medium text-gray-800">Children</div>
                            <div className="text-xs text-gray-500">Age 0-12</div>
                          </div>
                          <div className="flex items-center space-x-3">
                            <button
                              className={`w-8 h-8 rounded-full border flex items-center justify-center transition-all ${
                                guests.children <= 0
                                  ? "border-gray-200 text-gray-300 cursor-not-allowed"
                                  : "border-gray-300 text-gray-600 hover:bg-gray-50"
                              }`}
                              onClick={() => updateGuests("children", "decrement")}
                              disabled={guests.children <= 0}
                            >
                              <span>−</span>
                            </button>
                            <span className="font-bold text-gray-800 min-w-[20px] text-center">
                              {guests.children}
                            </span>
                            <button
                              className={`w-8 h-8 rounded-full border flex items-center justify-center transition-all ${
                                guests.children >= maxChildrenPerRoom * guests.rooms
                                  ? "border-gray-200 text-gray-300 cursor-not-allowed"
                                  : "border-gray-300 text-gray-600 hover:bg-gray-50"
                              }`}
                              onClick={() => updateGuests("children", "increment")}
                              disabled={guests.children >= maxChildrenPerRoom * guests.rooms}
                            >
                              <span>+</span>
                            </button>
                          </div>
                        </div>
                      </div>

                      <button
                        className="w-full bg-[#FD561E] text-white py-3 rounded-lg font-bold hover:bg-[#e54d1a] transition-all duration-200 shadow-md"
                        onClick={() => setShowGuestsModal(false)}
                      >
                        Apply
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Search Button */}
              <div className="absolute -bottom-6 left-1/2 -translate-x-1/2">
                <button
                  onClick={handleSearch}
                  disabled={loading || !selectedLocation}
                  className="bg-gradient-to-r from-[#FD561E] to-[#ff7b4a] 
                    text-white px-10 py-4 
                    rounded-full font-bold text-lg 
                    shadow-xl hover:shadow-2xl
                    transition-all duration-300 
                    hover:scale-105
                    flex items-center space-x-2
                    disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      <span>SEARCHING...</span>
                    </>
                  ) : (
                    <>
                      <FaSearch />
                      <span>SEARCH HOTELS</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-600 font-medium">{error}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HotelHeroSection;