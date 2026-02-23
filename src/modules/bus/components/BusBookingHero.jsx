// /src/components/UI/BusBookingHero.jsx
import React, { useState } from "react";

const BusBookingHero = () => {
  const [origin, setOrigin] = useState("");
  const [destination, setDestination] = useState("");
  const [travelDate, setTravelDate] = useState("");
  const [activeTab, setActiveTab] = useState("buses");

  const getTodayDate = () => {
    return new Date().toISOString().split("T")[0];
  };

  const handleSearch = (e) => {
    e.preventDefault();
    console.log("Bus search:", { origin, destination, travelDate });
  };

  const recentSearches = [
    { from: "Nizamabad", to: "Hyderabad", date: "Fri 06 Feb 2026" },
    { from: "Delhi", to: "Jaipur", date: "Mon 09 Feb 2026" },
    { from: "Mumbai", to: "Pune", date: "Wed 11 Feb 2026" },
  ];

  const tabs = [
    { id: "buses", label: "Buses", icon: "🚌" },
    { id: "flights", label: "Flights", icon: "✈️" },
    { id: "trains", label: "Trains", icon: "🚆" },
    { id: "hotels", label: "Hotels", icon: "🏨" },
  ];

  return (
    <div className="w-full bg-white">
      {/* Hero Section - Image container */}
      <div className="relative w-full h-[400px] overflow-hidden">
        {/* Full width daytime bus image */}
        <div className="absolute inset-0 w-screen left-1/2 right-1/2 -ml-[50vw] -mr-[50vw]">
          <img
            src="https://images.unsplash.com/photo-1570125909232-eb263c188f7e?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80"
            alt="Modern bus on highway during daytime"
            className="w-full h-full object-cover"
          />
          {/* Very subtle gradient for text contrast */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-transparent"></div>
        </div>

        {/* Content */}
        <div className="relative z-10 flex flex-col h-[400px]">
          {/* Top section with tabs */}
          <div className="pt-8">
            <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
              {/* Category Tabs */}
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
          </div>

          {/* Middle section with heading */}
          <div className="flex-1 flex flex-col justify-center">
            <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white text-left mb-2 drop-shadow-2xl max-w-3xl">
                India's Bus Ticket Booking Platform
              </h1>
              <p className="text-white/90 text-base md:text-lg drop-shadow-xl max-w-2xl">
                Book tickets effortlessly with the best prices and comfort
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Search Section - Overlapping card */}
      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 -mt-16 mb-8">
        {/* Search Card - All in one row */}
        <div className="bg-white rounded-xl shadow-2xl p-4 border border-gray-100">
          <form onSubmit={handleSearch}>
            {/* Single row layout */}
            <div className="flex items-center gap-3">
              {/* From */}
              <div className="flex-1 min-w-[140px]">
                <div className="relative">
                  <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                    <div className="w-4 h-4 rounded-full bg-orange-100 flex items-center justify-center">
                      <div className="w-1.5 h-1.5 rounded-full bg-orange-500"></div>
                    </div>
                  </div>
                  <input
                    type="text"
                    placeholder="From"
                    className="w-full pl-9 pr-3 py-3.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 text-gray-900 placeholder-gray-400 text-sm"
                    value={origin}
                    onChange={(e) => setOrigin(e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* To */}
              <div className="flex-1 min-w-[140px]">
                <div className="relative">
                  <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                    <div className="w-4 h-4 rounded-full bg-orange-100 flex items-center justify-center">
                      <div className="w-1.5 h-1.5 rounded-full bg-orange-500"></div>
                    </div>
                  </div>
                  <input
                    type="text"
                    placeholder="To"
                    className="w-full pl-9 pr-3 py-3.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 text-gray-900 placeholder-gray-400 text-sm"
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* Date */}
              <div className="w-[160px]">
                <div className="relative">
                  <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                    <span className="text-gray-400">📅</span>
                  </div>
                  <input
                    type="date"
                    className="w-full pl-9 pr-3 py-3.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 text-gray-900 text-sm"
                    value={travelDate}
                    onChange={(e) => setTravelDate(e.target.value)}
                    min={getTodayDate()}
                    required
                  />
                </div>
              </div>

              {/* Today Button */}
              <button
                type="button"
                onClick={() => setTravelDate(getTodayDate())}
                className="px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 hover:border-gray-300 transition-colors whitespace-nowrap"
              >
                Today
              </button>

              {/* Tomorrow Button */}
              <button
                type="button"
                onClick={() => {
                  const tomorrow = new Date();
                  tomorrow.setDate(tomorrow.getDate() + 1);
                  setTravelDate(tomorrow.toISOString().split("T")[0]);
                }}
                className="px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 hover:border-gray-300 transition-colors whitespace-nowrap"
              >
                Tomorrow
              </button>

              {/* Search Button */}
              <button
                type="submit"
                className="px-6 py-3.5 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-lg transition-all duration-300 text-sm flex items-center justify-center gap-2 shadow-md hover:shadow-lg whitespace-nowrap"
              >
                <span>Search</span>
                <span>→</span>
              </button>
            </div>
          </form>
        </div>

        {/* Recent Searches - Below search card */}
        <div className="mt-6 max-w-4xl">
          <p className="text-gray-700 text-sm mb-3 font-medium">
            Recent searches
          </p>
          <div className="flex flex-wrap gap-2">
            {recentSearches.map((search, idx) => (
              <button
                key={idx}
                className="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-xs transition-all duration-300 border border-gray-200 flex items-center gap-2"
                onClick={() => {
                  setOrigin(search.from);
                  setDestination(search.to);
                }}
              >
                <span className="font-medium">
                  {search.from} → {search.to}
                </span>
                <span className="text-gray-500 text-[10px]">{search.date}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BusBookingHero;
