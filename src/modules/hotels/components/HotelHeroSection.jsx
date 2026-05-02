// src/modules/hotels/components/HotelHeroSection.jsx
import React, { useState, useEffect, useRef } from "react";
import ReactDOM from "react-dom";
import { useNavigate } from "react-router-dom";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { FaMapMarkerAlt, FaCalendarAlt, FaUser, FaChevronDown, FaTimes } from "react-icons/fa";
import { Bus, Plane, Building2, Palmtree, Car, IndianRupee } from "lucide-react";
import { useHotelSearch } from "../hooks/useHotelSearch";

const tabs = [
  { id: "hotels", label: "Hotels", icon: Building2 },
  { id: "bus", label: "Bus", icon: Bus },
  { id: "billpayments", label: "Bill Payments", icon: IndianRupee },
  { id: "flights", label: "Flights", icon: Plane },
  { id: "holidays", label: "Holidays", icon: Palmtree },
  { id: "cabs", label: "Cabs", icon: Car },
];

const tabRoutes = {
  bus: "/",
  billpayments: "/BillHomePage",
  flights: "/flights",
  hotels: "/hotels",
  holidays: "/Holiday",
  cabs: "/cabs",
};

const HotelHeroSection = () => {
  const navigate = useNavigate();
  const { executeSearch, loading: hookLoading } = useHotelSearch();

  const [location, setLocation] = useState("");
  const [checkinDate, setCheckinDate] = useState(new Date());
  const [checkoutDate, setCheckoutDate] = useState(
    new Date(Date.now() + 3 * 24 * 60 * 60 * 1000)
  );
  const [activeTab, setActiveTab] = useState("hotels");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showGuestsModal, setShowGuestsModal] = useState(false);
  const [modalPos, setModalPos] = useState({ top: 0, left: 0 });
  const [guests, setGuests] = useState({ rooms: 1, adults: 2, children: 0 });

  const guestsTriggerRef = useRef(null);
  const modalRef = useRef(null);

  const maxRooms = 5;
  const maxAdultsPerRoom = 4;
  const maxChildrenPerRoom = 3;

  const formatGuestsText = () => {
    return `${guests.rooms} Room${guests.rooms > 1 ? "s" : ""}, ${guests.adults} Adult${guests.adults > 1 ? "s" : ""}${
      guests.children > 0 ? `, ${guests.children} Child${guests.children > 1 ? "ren" : ""}` : ""
    }`;
  };

  const updateGuests = (type, action) => {
    setGuests((prev) => {
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
      return { ...prev, [type]: newValue };
    });
  };

  const calculateModalPos = () => {
    if (!guestsTriggerRef.current) return;
    const rect = guestsTriggerRef.current.getBoundingClientRect();
    const modalWidth = 320;
    let left = rect.left + (rect.width / 2) - (modalWidth / 2);
    if (left + modalWidth > window.innerWidth - 8) {
      left = window.innerWidth - modalWidth - 8;
    }
    if (left < 8) left = 8;
    setModalPos({
      top: rect.bottom + 8,
      left: left,
    });
  };

  const handleToggleModal = () => {
    if (loading || hookLoading) return;
    if (!showGuestsModal) calculateModalPos();
    setShowGuestsModal((prev) => !prev);
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        modalRef.current &&
        !modalRef.current.contains(e.target) &&
        guestsTriggerRef.current &&
        !guestsTriggerRef.current.contains(e.target)
      ) {
        setShowGuestsModal(false);
      }
    };
    const handleResizeOrScroll = () => {
      if (showGuestsModal) calculateModalPos();
    };
    document.addEventListener("mousedown", handleClickOutside);
    window.addEventListener("resize", handleResizeOrScroll);
    window.addEventListener("scroll", handleResizeOrScroll, true);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("resize", handleResizeOrScroll);
      window.removeEventListener("scroll", handleResizeOrScroll, true);
    };
  }, [showGuestsModal]);

  const handleSearch = async () => {
    if (!location.trim()) {
      setError("Please enter a city or hotel name");
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
      location: location.trim(),
      checkinDate: checkinDate.toISOString().split("T")[0],
      checkoutDate: checkoutDate.toISOString().split("T")[0],
      guests,
    };
    console.log("🔵 Searching hotels:", searchData);
    try {
      await executeSearch(searchData);
    } catch (err) {
      setError(err.message || "Failed to search hotels. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const GuestsModal = showGuestsModal
    ? ReactDOM.createPortal(
        <div
          ref={modalRef}
          style={{
            position: "fixed",
            top: modalPos.top,
            left: modalPos.left,
            width: 320,
            zIndex: 999999,
          }}
          className="bg-white rounded-xl shadow-2xl border border-gray-200 p-4 sm:p-5"
        >
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-gray-800 text-sm sm:text-base">
              Select Rooms & Guests
            </h3>
            <button
              onClick={() => setShowGuestsModal(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <FaTimes />
            </button>
          </div>

          <div className="mb-4">
            <div className="flex justify-between items-center">
              <div>
                <div className="font-medium text-gray-800 text-sm">Rooms</div>
                <div className="text-xs text-gray-500">Max {maxRooms} rooms</div>
              </div>
              <div className="flex items-center space-x-3">
                <button
                  className={`w-8 h-8 rounded-full border flex items-center justify-center text-lg ${
                    guests.rooms <= 1
                      ? "border-gray-200 text-gray-300 cursor-not-allowed"
                      : "border-gray-300 text-gray-600 hover:bg-gray-50"
                  }`}
                  onClick={() => updateGuests("rooms", "decrement")}
                  disabled={guests.rooms <= 1}
                >
                  −
                </button>
                <span className="font-bold text-gray-800 min-w-[20px] text-center">
                  {guests.rooms}
                </span>
                <button
                  className={`w-8 h-8 rounded-full border flex items-center justify-center text-lg ${
                    guests.rooms >= maxRooms
                      ? "border-gray-200 text-gray-300 cursor-not-allowed"
                      : "border-gray-300 text-gray-600 hover:bg-gray-50"
                  }`}
                  onClick={() => updateGuests("rooms", "increment")}
                  disabled={guests.rooms >= maxRooms}
                >
                  +
                </button>
              </div>
            </div>
          </div>

          <div className="mb-4">
            <div className="flex justify-between items-center">
              <div>
                <div className="font-medium text-gray-800 text-sm">Adults</div>
                <div className="text-xs text-gray-500">Age 13+</div>
              </div>
              <div className="flex items-center space-x-3">
                <button
                  className={`w-8 h-8 rounded-full border flex items-center justify-center text-lg ${
                    guests.adults <= 1
                      ? "border-gray-200 text-gray-300 cursor-not-allowed"
                      : "border-gray-300 text-gray-600 hover:bg-gray-50"
                  }`}
                  onClick={() => updateGuests("adults", "decrement")}
                  disabled={guests.adults <= 1}
                >
                  −
                </button>
                <span className="font-bold text-gray-800 min-w-[20px] text-center">
                  {guests.adults}
                </span>
                <button
                  className={`w-8 h-8 rounded-full border flex items-center justify-center text-lg ${
                    guests.adults >= maxAdultsPerRoom * guests.rooms
                      ? "border-gray-200 text-gray-300 cursor-not-allowed"
                      : "border-gray-300 text-gray-600 hover:bg-gray-50"
                  }`}
                  onClick={() => updateGuests("adults", "increment")}
                  disabled={guests.adults >= maxAdultsPerRoom * guests.rooms}
                >
                  +
                </button>
              </div>
            </div>
          </div>

          <div className="mb-6">
            <div className="flex justify-between items-center">
              <div>
                <div className="font-medium text-gray-800 text-sm">Children</div>
                <div className="text-xs text-gray-500">Age 0-12</div>
              </div>
              <div className="flex items-center space-x-3">
                <button
                  className={`w-8 h-8 rounded-full border flex items-center justify-center text-lg ${
                    guests.children <= 0
                      ? "border-gray-200 text-gray-300 cursor-not-allowed"
                      : "border-gray-300 text-gray-600 hover:bg-gray-50"
                  }`}
                  onClick={() => updateGuests("children", "decrement")}
                  disabled={guests.children <= 0}
                >
                  −
                </button>
                <span className="font-bold text-gray-800 min-w-[20px] text-center">
                  {guests.children}
                </span>
                <button
                  className={`w-8 h-8 rounded-full border flex items-center justify-center text-lg ${
                    guests.children >= maxChildrenPerRoom * guests.rooms
                      ? "border-gray-200 text-gray-300 cursor-not-allowed"
                      : "border-gray-300 text-gray-600 hover:bg-gray-50"
                  }`}
                  onClick={() => updateGuests("children", "increment")}
                  disabled={guests.children >= maxChildrenPerRoom * guests.rooms}
                >
                  +
                </button>
              </div>
            </div>
          </div>

          <button
            className="w-full bg-[#FD561E] text-white py-3 rounded-lg font-bold hover:bg-[#e54d1a] transition-all duration-200 shadow-md text-sm"
            onClick={() => setShowGuestsModal(false)}
          >
            Apply
          </button>
        </div>,
        document.body
      )
    : null;

  return (
    <>
      {GuestsModal}

      <section className="relative min-h-[470px] md:min-h-[460px] flex items-center justify-center py-4 md:py-0 overflow-hidden">
        <div
          className="absolute inset-0 w-full h-full bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80')`,
          }}
        />
        <div className="absolute inset-0 bg-black/30" />

        <div className="relative z-10 w-full max-w-6xl px-4 sm:px-6">
          <div className="text-center mb-2 sm:mb-6 text-white">
            <h1 className="text-xl sm:text-2xl md:text-4xl lg:text-5xl font-bold mt-2 md:-mt-6">
              Stay Comfortably, Travel Happily
            </h1>
            <p className="text-xs sm:text-sm md:text-lg opacity-90 mt-1 sm:mt-2">
              Find the perfect hotels with BOBROS
            </p>
          </div>

          <div className="relative bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl p-4 sm:p-6 pb-8 border border-white/20">
            {/* Desktop Tabs */}
            <div className="hidden lg:flex gap-4 mb-8">
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
                    className={`flex items-center gap-2 px-6 py-3 rounded-full cursor-pointer text-sm font-semibold transition-all duration-300 border ${
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

            {/* Desktop / Tablet grid (unchanged) */}
            <div className="hidden md:block">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-4">
                <div className="col-span-1 md:col-span-1 lg:col-span-4 group relative">
                  <label className="text-[11px] sm:text-xs text-gray-500 uppercase tracking-wide mb-1 transition-colors duration-300 group-hover:text-[#FD561E] block">
                    City / Hotel Name
                  </label>
                  <div className="flex items-center gap-2 pb-1.5 border-b transition-colors duration-300 border-gray-200 group-hover:border-[#FD561E]">
                    <FaMapMarkerAlt className="text-gray-400 w-3.5 h-3.5 sm:w-4 sm:h-4 transition-colors duration-300 group-hover:text-[#FD561E] flex-shrink-0" />
                    <input
                      type="text"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      placeholder="Enter city or hotel name"
                      className="w-full text-sm sm:text-base font-semibold outline-none bg-transparent py-1"
                      disabled={loading || hookLoading}
                    />
                  </div>
                  <div className="h-4 mt-0.5" />
                </div>

                <div className="col-span-1 md:col-span-1 lg:col-span-3 group relative">
                  <label className="text-[11px] sm:text-xs text-gray-500 uppercase tracking-wide mb-1 transition-colors duration-300 group-hover:text-[#FD561E] block">
                    Check-in Date
                  </label>
                  <div className="flex items-center gap-2 pb-1.5 border-b transition-colors duration-300 border-gray-200 group-hover:border-[#FD561E]">
                    <FaCalendarAlt className="text-gray-400 w-3.5 h-3.5 sm:w-4 sm:h-4 transition-colors duration-300 group-hover:text-[#FD561E] flex-shrink-0" />
                    <DatePicker
                      selected={checkinDate}
                      onChange={(date) => setCheckinDate(date)}
                      className="w-full text-sm sm:text-base font-semibold outline-none bg-transparent py-1 cursor-pointer"
                      dateFormat="EEE, dd MMM yyyy"
                      minDate={new Date()}
                      popperPlacement="bottom-start"
                      popperClassName="z-50"
                      disabled={loading || hookLoading}
                      placeholderText="Select date"
                    />
                  </div>
                  <div className="h-4 mt-0.5" />
                </div>

                <div className="col-span-1 md:col-span-1 lg:col-span-3 group relative">
                  <label className="text-[11px] sm:text-xs text-gray-500 uppercase tracking-wide mb-1 transition-colors duration-300 group-hover:text-[#FD561E] block">
                    Check-out Date
                  </label>
                  <div className="flex items-center gap-2 pb-1.5 border-b transition-colors duration-300 border-gray-200 group-hover:border-[#FD561E]">
                    <FaCalendarAlt className="text-gray-400 w-3.5 h-3.5 sm:w-4 sm:h-4 transition-colors duration-300 group-hover:text-[#FD561E] flex-shrink-0" />
                    <DatePicker
                      selected={checkoutDate}
                      onChange={(date) => setCheckoutDate(date)}
                      className="w-full text-sm sm:text-base font-semibold outline-none bg-transparent py-1 cursor-pointer"
                      dateFormat="EEE, dd MMM yyyy"
                      minDate={checkinDate}
                      popperPlacement="bottom-start"
                      popperClassName="z-50"
                      disabled={loading || hookLoading}
                      placeholderText="Select date"
                    />
                  </div>
                  <div className="h-4 mt-0.5" />
                </div>

                <div className="col-span-1 md:col-span-1 lg:col-span-2 group relative">
                  <label className="text-[11px] sm:text-xs text-gray-500 uppercase tracking-wide mb-1 transition-colors duration-300 group-hover:text-[#FD561E] block">
                    Guests & Rooms
                  </label>
                  <div
                    ref={guestsTriggerRef}
                    onClick={handleToggleModal}
                    className="flex items-center justify-between gap-2 pb-1.5 border-b transition-colors duration-300 border-gray-200 group-hover:border-[#FD561E] cursor-pointer"
                  >
                    <div className="flex items-center gap-2">
                      <FaUser className="text-gray-400 w-3.5 h-3.5 sm:w-4 sm:h-4 transition-colors duration-300 group-hover:text-[#FD561E] flex-shrink-0" />
                      <span className="text-sm sm:text-base font-semibold text-gray-800 truncate">
                        {formatGuestsText()}
                      </span>
                    </div>
                    <FaChevronDown
                      className={`text-gray-400 w-3 h-3 transition-all duration-200 ${
                        showGuestsModal ? "rotate-180" : ""
                      }`}
                    />
                  </div>
                  <div className="h-4 mt-0.5" />
                </div>
              </div>
            </div>

            {/* ✅ MOBILE VIEW – BOXED FIELDS exactly like BookingForm */}
            <div className="md:hidden space-y-3">
              {/* Location box */}
              <div className="border border-gray-300 rounded-xl bg-gray/50 px-3 py-2">
                <label className="text-[10px] text-gray-400 uppercase tracking-widest block">
                  City / Hotel Name
                </label>
                <div className="flex items-center gap-2 mt-0.5">
                  <FaMapMarkerAlt className="text-gray-400 w-3.5 h-3.5 flex-shrink-0" />
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="Enter city or hotel name"
                    className="w-full text-sm font-semibold outline-none bg-transparent py-1"
                    disabled={loading || hookLoading}
                  />
                </div>
              </div>

              {/* Check-in box */}
              <div className="border border-gray-300 rounded-xl bg-gray/50 px-3 py-2">
                <label className="text-[10px] text-gray-400 uppercase tracking-widest block">
                  Check-in Date
                </label>
                <div className="flex items-center gap-2 mt-0.5">
                  <FaCalendarAlt className="text-gray-400 w-3.5 h-3.5 flex-shrink-0" />
                  <DatePicker
                    selected={checkinDate}
                    onChange={(date) => setCheckinDate(date)}
                    className="w-full text-sm font-semibold outline-none bg-transparent py-1 cursor-pointer"
                    dateFormat="dd MMM yyyy"
                    minDate={new Date()}
                    popperPlacement="bottom-start"
                    disabled={loading || hookLoading}
                    placeholderText="Select date"
                  />
                </div>
              </div>

              {/* Check-out box */}
              <div className="border border-gray-300 rounded-xl bg-gray/50 px-3 py-2">
                <label className="text-[10px] text-gray-400 uppercase tracking-widest block">
                  Check-out Date
                </label>
                <div className="flex items-center gap-2 mt-0.5">
                  <FaCalendarAlt className="text-gray-400 w-3.5 h-3.5 flex-shrink-0" />
                  <DatePicker
                    selected={checkoutDate}
                    onChange={(date) => setCheckoutDate(date)}
                    className="w-full text-sm font-semibold outline-none bg-transparent py-1 cursor-pointer"
                    dateFormat="dd MMM yyyy"
                    minDate={checkinDate}
                    popperPlacement="bottom-start"
                    disabled={loading || hookLoading}
                    placeholderText="Select date"
                  />
                </div>
              </div>

              {/* Guests box */}
              <div className="border border-gray-300 rounded-xl bg-gray/50 px-3 py-2">
                <label className="text-[10px] text-gray-400 uppercase tracking-widest block">
                  Guests & Rooms
                </label>
                <div
                  ref={guestsTriggerRef}
                  onClick={handleToggleModal}
                  className="flex items-center justify-between mt-0.5 cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <FaUser className="text-gray-400 w-3.5 h-3.5 flex-shrink-0" />
                    <span className="text-sm font-semibold text-gray-800">
                      {formatGuestsText()}
                    </span>
                  </div>
                  <FaChevronDown
                    className={`text-gray-400 w-3 h-3 transition-all duration-200 ${
                      showGuestsModal ? "rotate-180" : ""
                    }`}
                  />
                </div>
              </div>

              {error && (
                <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-600 font-medium text-xs">{error}</p>
                </div>
              )}
            </div>

            {/* Search Button */}
            <div className="absolute -bottom-5 sm:-bottom-6 left-1/2 -translate-x-1/2">
              <button
                onClick={handleSearch}
                disabled={loading || hookLoading}
                className="bg-gradient-to-r from-[#FD561E] to-[#ff7b4a] text-white px-6 sm:px-8 md:px-10 py-2 sm:py-3 rounded-full font-bold text-sm sm:text-base shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 whitespace-nowrap"
              >
                {loading || hookLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>SEARCHING...</span>
                  </>
                ) : (
                  <span>SEARCH HOTELS</span>
                )}
              </button>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default HotelHeroSection;