import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

import {
  FaMapMarkerAlt,
  FaExchangeAlt,
  FaSpinner,
  FaCalendarAlt,
  FaUser,
  FaChevronDown,
  FaTimes,
  FaSearch,
} from "react-icons/fa";

import SpecialFares from "./SpecialFares";

const FlightSearchForm = () => {
  const navigate = useNavigate();
  const [specialFares, setSpecialFares] = useState({
    student: false,
    seniorCitizen: false,
    armedForces: false,
    doctor: false,
  });

  const fromRef = useRef(null);
  const toRef = useRef(null);
  const travellerRef = useRef(null);

  const [activeTab, setActiveTab] = useState("flights");
  const [tripType, setTripType] = useState("one-way");

  const [fromDisplay, setFromDisplay] = useState("");
  const [toDisplay, setToDisplay] = useState("");

  const [departureDate, setDepartureDate] = useState(new Date());
  const [returnDate, setReturnDate] = useState(null);

  const [showTravellerModal, setShowTravellerModal] = useState(false);

  const tabs = [
    { id: "flights", label: "Flights", icon: FaMapMarkerAlt },
    { id: "hotels", label: "Hotels", icon: FaMapMarkerAlt },
    { id: "bus", label: "Bus", icon: FaMapMarkerAlt },
  ];

  const tabRoutes = {
    flights: "/flights",
    hotels: "/hotels",
    bus: "/bus",
  };

  const handleSearch = () => {
    console.log("Searching flights...");
  };

  return (
    <div className="relative max-w-6xl h-[300px] mx-auto px-5 sm:px-6 lg:px-8 -mt-32 overflow-hidden">
      <div className="relative bg-white rounded-2xl shadow-xl p-6 pb-16 border border-gray-200">
        {/* SERVICE TABS */}
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

        {/* TRIP TYPE */}
        <div className="flex items-center mb-6">
          <div className="flex items-center bg-gray-100 rounded-lg p-1 border border-gray-200">
            <button
              className={`px-5 py-2 text-sm font-medium rounded-md ${
                tripType === "one-way"
                  ? "bg-white text-gray-900 shadow-sm border border-gray-300"
                  : "text-gray-600"
              }`}
              onClick={() => setTripType("one-way")}
            >
              One Way
            </button>

            <button
              className={`px-5 py-2 text-sm font-medium rounded-md ${
                tripType === "round-trip"
                  ? "bg-white text-gray-900 shadow-sm border border-gray-300"
                  : "text-gray-600"
              }`}
              onClick={() => setTripType("round-trip")}
            >
              Round Trip
            </button>
          </div>
        </div>

        {/* SEARCH FORM */}
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-4">
            {/* FROM */}
            <div className="lg:col-span-3 relative">
              <label className="text-xs text-gray-500 uppercase">From</label>

              <div className="relative">
                <FaMapMarkerAlt className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />

                <input
                  type="text"
                  value={fromDisplay}
                  onChange={(e) => setFromDisplay(e.target.value)}
                  placeholder="Type city or airport"
                  className="w-full pl-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FD561E]"
                />
              </div>
            </div>

            {/* TO */}
            <div className="lg:col-span-3 relative">
              <label className="text-xs text-gray-500 uppercase">To</label>

              <div className="relative">
                <button className="absolute -left-4 top-1/2 -translate-y-1/2 bg-white border rounded-full p-2">
                  <FaExchangeAlt />
                </button>

                <FaMapMarkerAlt className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />

                <input
                  type="text"
                  value={toDisplay}
                  onChange={(e) => setToDisplay(e.target.value)}
                  placeholder="Type city or airport"
                  className="w-full pl-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FD561E]"
                />
              </div>
            </div>

            {/* DEPARTURE */}
            <div className="lg:col-span-2">
              <label className="text-xs text-gray-500 uppercase">
                Departure
              </label>

              <DatePicker
                selected={departureDate}
                onChange={(date) => setDepartureDate(date)}
                className="w-full py-3 border border-gray-300 rounded-lg pl-3"
                minDate={new Date()}
                dateFormat="EEE, dd MMM"
              />
            </div>

            {/* RETURN */}
            {tripType === "round-trip" && (
              <div className="lg:col-span-2">
                <label className="text-xs text-gray-500 uppercase">
                  Return
                </label>

                <DatePicker
                  selected={returnDate}
                  onChange={(date) => setReturnDate(date)}
                  className="w-full py-3 border border-gray-300 rounded-lg pl-3"
                  minDate={departureDate}
                  placeholderText="Add return"
                />
              </div>
            )}

            {/* TRAVELLERS */}
            <div className="lg:col-span-2 relative">
              <label className="text-xs text-gray-500 uppercase">
                Travellers
              </label>

              <div
                className="border border-gray-300 rounded-lg py-3 pl-10 cursor-pointer"
                onClick={() => setShowTravellerModal(!showTravellerModal)}
              >
                <FaUser className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                1 Traveller
              </div>
            </div>
          </div>

          {/* FLOATING SEARCH BUTTON */}

          <div className="absolute -bottom-6 left-1/2 -translate-x-1/2">
            <button
              onClick={handleSearch}
              className="bg-gradient-to-r from-[#FD561E] to-[#ff7b4a] 
              text-white px-10 py-4 
              rounded-full font-bold text-lg 
              shadow-xl hover:shadow-2xl
              transition-all duration-300 hover:scale-105
              flex items-center space-x-2"
            >
              <FaSearch />
              <span>SEARCH</span>
            </button>
          </div>
        </div>

        {/* SPECIAL FARES */}

        <SpecialFares
          specialFares={specialFares}
          setSpecialFares={setSpecialFares}
        />
      </div>
    </div>
  );
};

export default FlightSearchForm;
