import React, { useState, useEffect } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { useFlightMaster } from "../hooks/carrierCodeMaster";
import { fetchFlightStatus } from "../services/flightStatus.service";
import { motion } from "framer-motion";

const FlightTracker = () => {
  // Use real API for airlines
  const {
    airlines,
    loadingAirlines,
    airlinesError,
  } = useFlightMaster();

  // Form states
  const [airline, setAirline] = useState("");
  const [flightNumber, setFlightNumber] = useState("");
  const [flightDate, setFlightDate] = useState(new Date());
  
  // Flight status state
  const [flightStatus, setFlightStatus] = useState(null);
  const [loadingStatus, setLoadingStatus] = useState(false);
  const [statusError, setStatusError] = useState(null);
  
  // Animation state
  const [flightProgress, setFlightProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(new Date());

  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);

  // Start & end of current month
  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);

  // Format date for API
  const formatDateForAPI = (date) => {
    return date.toISOString().split('T')[0];
  };

  // Update current time every minute for animation
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
      updateFlightProgress();
    }, 60000);
    
    return () => clearInterval(timer);
  }, [flightStatus]);

  // Calculate flight progress based on times
  const updateFlightProgress = () => {
    if (!flightStatus || !flightStatus.departure || !flightStatus.arrival) return;
    
    const depTime = flightStatus.departure.scheduled ? new Date(flightStatus.departure.scheduled) : null;
    const arrTime = flightStatus.arrival.scheduled ? new Date(flightStatus.arrival.scheduled) : null;
    const now = new Date();
    
    if (depTime && arrTime && now > depTime && now < arrTime) {
      const totalDuration = arrTime - depTime;
      const elapsed = now - depTime;
      const progress = Math.min((elapsed / totalDuration) * 100, 100);
      setFlightProgress(progress);
    } else if (arrTime && now > arrTime) {
      setFlightProgress(100);
    } else {
      setFlightProgress(0);
    }
  };

  // Handle Search Button
  const handleSearch = async () => {
    if (!airline || !flightNumber || !flightDate) {
      alert("Please fill out all fields");
      return;
    }

    setLoadingStatus(true);
    setStatusError(null);
    setFlightStatus(null);
    setFlightProgress(0);

    try {
      const response = await fetchFlightStatus({
        carrier: airline,
        flightNumber,
        date: formatDateForAPI(flightDate),
      });

      console.log("API Response:", response.data);
      setFlightStatus(response.data);
      
      // Update progress after setting status
      setTimeout(updateFlightProgress, 100);
      
    } catch (err) {
      console.error("Error:", err);
      setStatusError("Failed to fetch flight status. Please try again.");
    } finally {
      setLoadingStatus(false);
    }
  };

  // Domestic airlines with images
  const domesticAirlines = [
    { name: "Air India", logo: "/assets/AirIndia.png", code: "AI" },
    { name: "Indigo", logo: "/assets/Indigo.png", code: "6E" },
    { name: "Air India Express", logo: "/assets/AirExpress.png", code: "IX" },
    { name: "FlyBig", logo: "/assets/flybig.png", code: "S9" },
    { name: "Akasa Air", logo: "/assets/Akasa.png", code: "QP" },
    { name: "SpiceJet", logo: "/assets/spicejet.png", code: "SG" },
    { name: "Alliance Air", logo: "/assets/Allianceair.png", code: "9I" },
  ];

  // Format time for display
  const formatTime = (timeString) => {
    if (!timeString || timeString === "null") return "null";
    try {
      return new Date(timeString).toLocaleTimeString([], { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: false 
      });
    } catch (e) {
      return timeString;
    }
  };

  // Format date for display
  const formatDateDisplay = (dateString) => {
    if (!dateString || dateString === "null") return "null";
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      });
    } catch (e) {
      return dateString;
    }
  };

  // Get status color
  const getStatusColor = (status) => {
    if (!status || status === "UNKNOWN" || status === "null") return "bg-gray-400";
    switch(status.toUpperCase()) {
      case "LANDED": return "bg-green-500";
      case "DELAYED": return "bg-yellow-500";
      case "CANCELLED": return "bg-red-500";
      case "ON TIME": return "bg-blue-500";
      default: return "bg-gray-500";
    }
  };

  // Get status text
  const getStatusText = (status) => {
    if (!status || status === "UNKNOWN" || status === "null") return "Unknown";
    return status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
  };

  // Calculate delay or early status
  const getTimeDifference = (scheduled, estimated) => {
    if (!scheduled || !estimated || scheduled === "null" || estimated === "null") return null;
    
    try {
      const scheduledTime = new Date(scheduled);
      const estimatedTime = new Date(estimated);
      const diffMinutes = Math.round((estimatedTime - scheduledTime) / (1000 * 60));
      
      if (diffMinutes === 0) return "On Time";
      if (diffMinutes > 0) return `${diffMinutes}m delay`;
      return `${Math.abs(diffMinutes)}m early`;
    } catch (e) {
      return null;
    }
  };

  return (
    <div className="min-h-screen bg-white-50 p-4 md:p-6 lg:p-8 font-sans">
      <div className="w-full max-w-[1400px] mx-auto">
        {/* Header */}
        <header className="mb-8">
          <div className="text-1xl md:text-1xl md:mb-3 mr-9 font-semibold">
            <span
              onClick={() => (window.location.href = "/")}
              className="text-black cursor-pointer hover:text-[#075aa0]"
            >
              Home
            </span>
 
            <span className="mx-2 text-black">/</span>
 
            <span className="text-black cursor-pointer hover:text-[#075aa0]">
              Flight Status
            </span>
          </div>
 
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
            Flight Tracker Pro
          </h1>
        </header>
        {/*.............left side div.........*/}
        <div className="flex w-full items-start">
          <div className="hidden lg:block lg:w-[70%] pr-6">
            {/* Search Form */}
            <div className="bg-white rounded-3xl p-3 mb-8 shadow-[0_4px_20px_rgba(0,0,0,0.15)] px-5 py-3 w-[100%] ">
              <div className="flex flex-col md:flex-row items-center gap-1">
                {/* Airline Dropdown */}
                <div className="w-full md:w-1/3 bg-gray-100 rounded-l-2xl rounded-r-none px-2 py-1 flex flex-col relative group">
                  <label
                    className="absolute left-3 transition-all duration-200 pointer-events-none
                text-gray-500 text-base top-1/2 -translate-y-1/2
                group-focus-within:text-xs group-focus-within:text-blue-600
                group-focus-within:top-1 group-focus-within:translate-y-0"
                  >
                    
                  </label>
                  <select
                    value={airline}
                    onChange={(e) => setAirline(e.target.value)}
                    className="w-full bg-transparent text-lg font-semibold outline-none pt-5 border-b-2 border-transparent focus:border-blue-600 transition"
                    disabled={loadingAirlines}
                  >
                    <option value="">{loadingAirlines ? "Loading airlines..." : "Select Airline"}</option>
                    {domesticAirlines.map((airlineItem) => (
                      <option key={airlineItem.code} value={airlineItem.code}>
                        {airlineItem.name} ({airlineItem.code})
                      </option>
                    ))}
                  </select>
                  {/* blue bottom border (no left-right animation, wider) */}
                  <div className="h-[3px] bg-blue-600 transition-all duration-200 opacity-0 group-focus-within:opacity-100 w-full"></div>{" "}
                </div>
 
                {/* Flight Number */}
                <div className="w-full md:w-1/3 bg-gray-100 rounded-l-0 rounded-r-none px-2 py-1 flex flex-col relative group">
                  <label
                    className="absolute left-3 transition-all duration-200 pointer-events-none
                text-gray-500 text-base top-1/2 -translate-y-1/2
                group-focus-within:text-xs group-focus-within:text-blue-600
                group-focus-within:top-1 group-focus-within:translate-y-0"
                  >
                    Flight Number
                  </label>
 
                  <input
                    type="text"
                    value={flightNumber}
                    onChange={(e) => setFlightNumber(e.target.value)}
                    className="w-full bg-transparent text-lg font-semibold outline-none pt-5 border-b-2 border-transparent transition"
                    placeholder=""
                  />
 
                  {/* blue bottom border (no left-right animation, wider) */}
                  <div className="h-[3px] bg-blue-600 transition-all duration-200 opacity-0 group-focus-within:opacity-100 w-full"></div>
                </div>
 
                {/* Date Picker */}
                <div className="w-full md:w-1/3 bg-gray-100 rounded-l-0 rounded-r-none px-2 py-2 flex flex-col relative group">
                  <label className="text-xs text-gray-500">Date</label>
 
                  <DatePicker
                    selected={flightDate}
                    onChange={(date) => setFlightDate(date)}
                    dateFormat="EEE, dd MMM"
                    monthsShown={2}
                    minDate={yesterday}
                    maxDate={endOfMonth}
                    className="w-full bg-transparent text-lg font-semibold outline-none border-none cursor-pointer"
                    popperPlacement="bottom-start"
                  />
 
                  {/* blue bottom border */}
                  <div className="h-[3px] bg-blue-600 transition-all duration-200 opacity-0 group-focus-within:opacity-100 w-full"></div>
                </div>
 
                {/* Search Button */}
                <button
                  onClick={handleSearch}
                  disabled={loadingStatus}
                  className="flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-semibold px-14 py-4 rounded-r-2xl rounded-l-none transition text-xl shadow-md disabled:opacity-50"
                >
                  {loadingStatus ? "Searching..." : "Search"}
                </button>
              </div>
            </div>

            {/* Error Display */}
            {statusError && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
                <p className="text-red-600 font-medium">{statusError}</p>
              </div>
            )}

            {/* Loading State */}
            {loadingStatus && (
              <div className="mb-6 p-6 bg-blue-50 border border-blue-200 rounded-xl">
                <p className="text-blue-600 font-medium">⏳ Fetching flight status...</p>
              </div>
            )}

            {/* Flight Status Display (EXACTLY LIKE IMAGE) */}
            {flightStatus && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="mb-10 bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden"
              >
                {/* Header */}
                <div className="bg-white border-b p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900">
                        {flightStatus.carrier || "null"} {flightStatus.flightNumber || "null"} Flight Status For Today · {airlines.find(a => a.code === flightStatus.carrier)?.name || "Unknown Airline"}
                      </h2>
                    </div>
                  </div>
                </div>

                {/* Flight Route & Details - LIKE IMAGE */}
                <div className="p-6">
                  {/* Origin Airport */}
                  <div className="flex items-start justify-between mb-6">
                    <div className="w-2/5">
                      <h3 className="text-xl font-bold text-gray-900 mb-1">
                        {flightStatus.origin || "Airport Name"}
                      </h3>
                      <p className="text-gray-600">
                        {flightStatus.origin || "City"} ({flightStatus.origin?.substring(0, 3) || "CODE"})
                      </p>
                      <p className="text-gray-500 text-sm mt-1">
                        {flightStatus.departure?.terminal ? `Terminal ${flightStatus.departure.terminal}` : "Terminal null"}
                      </p>
                    </div>

                    {/* Flight Timeline with Animation */}
                    <div className="w-1/5 px-4">
                      <div className="relative py-4">
                        {/* Connecting Line */}
                        <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-gray-300 transform -translate-y-1/2"></div>
                        
                        {/* Departure Dot */}
                        <div className="absolute left-0 top-1/2 transform -translate-y-1/2">
                          <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
                        </div>
                        
                        {/* Animated Airplane */}
                        <motion.div
                          initial={{ left: "0%" }}
                          animate={{ left: `${flightProgress}%` }}
                          transition={{ duration: 1 }}
                          className="absolute top-1/2 transform -translate-y-1/2"
                          style={{ left: `${flightProgress}%` }}
                        >
                          <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                            <span className="text-white text-xs">✈️</span>
                          </div>
                        </motion.div>
                        
                        {/* Arrival Dot */}
                        <div className="absolute right-0 top-1/2 transform -translate-y-1/2">
                          <div className="w-3 h-3 bg-green-600 rounded-full"></div>
                        </div>
                        
                        {/* Flight Duration */}
                        <div className="text-center mt-8">
                          <div className={`inline-flex items-center px-3 py-1 rounded-full ${getStatusColor(flightStatus.status)}`}>
                            <span className="text-white font-bold">
                              {getStatusText(flightStatus.status)}
                            </span>
                          </div>
                          <p className="text-gray-600 mt-2">
                            {flightStatus.departure?.scheduled && flightStatus.arrival?.scheduled ? (
                              <>
                                {Math.round(
                                  (new Date(flightStatus.arrival.scheduled) - new Date(flightStatus.departure.scheduled)) / (1000 * 60 * 60)
                                )}h {Math.round(
                                  ((new Date(flightStatus.arrival.scheduled) - new Date(flightStatus.departure.scheduled)) % (1000 * 60 * 60)) / (1000 * 60)
                                )}m
                              </>
                            ) : (
                              "Duration: null"
                            )}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Destination Airport */}
                    <div className="w-2/5 text-right">
                      <h3 className="text-xl font-bold text-gray-900 mb-1">
                        {flightStatus.destination || "Airport Name"}
                      </h3>
                      <p className="text-gray-600">
                        {flightStatus.destination || "City"} ({flightStatus.destination?.substring(0, 3) || "CODE"})
                      </p>
                      <p className="text-gray-500 text-sm mt-1">
                        {flightStatus.arrival?.terminal ? `Terminal ${flightStatus.arrival.terminal}` : "Terminal null"}
                      </p>
                    </div>
                  </div>

                  {/* Time Information - EXACTLY LIKE IMAGE */}
                  <div className="grid grid-cols-2 gap-8 mb-8">
                    {/* Departure Times */}
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-3xl font-bold">
                            {formatTime(flightStatus.departure?.scheduled) || "01:25"}
                          </p>
                          <p className="text-gray-500 text-sm">Scheduled departure</p>
                        </div>
                        <div className="text-right">
                          <p className="text-xl font-bold">
                            {formatTime(flightStatus.departure?.estimated) || "01:36"}
                          </p>
                          <p className="text-gray-500 text-sm">Estimated</p>
                        </div>
                      </div>
                      
                      {/* Delay/Early Info */}
                      {getTimeDifference(flightStatus.departure?.scheduled, flightStatus.departure?.estimated) && (
                        <div className="bg-yellow-50 p-3 rounded-lg">
                          <p className="text-yellow-700 font-medium">
                            {getTimeDifference(flightStatus.departure?.scheduled, flightStatus.departure?.estimated)}
                          </p>
                        </div>
                      )}
                      
                      {/* Check-in and Gate Info */}
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-gray-500">Check-in</p>
                          <p className="font-bold">{flightStatus.departure?.checkIn || "40-43"}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Gate</p>
                          <p className="font-bold">{flightStatus.departure?.gate || "46N"}</p>
                        </div>
                      </div>
                    </div>

                    {/* Arrival Times */}
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-3xl font-bold">
                            {formatTime(flightStatus.arrival?.scheduled) || "08:50"}
                          </p>
                          <p className="text-gray-500 text-sm">Scheduled arrival</p>
                        </div>
                        <div className="text-right">
                          <p className="text-xl font-bold">
                            {formatTime(flightStatus.arrival?.estimated) || "09:10"}
                          </p>
                          <p className="text-gray-500 text-sm">Estimated</p>
                        </div>
                      </div>
                      
                      {/* Early Arrival Info */}
                      {getTimeDifference(flightStatus.arrival?.scheduled, flightStatus.arrival?.estimated) && (
                        <div className="bg-green-50 p-3 rounded-lg">
                          <p className="text-green-700 font-medium">
                            {getTimeDifference(flightStatus.arrival?.scheduled, flightStatus.arrival?.estimated)}
                          </p>
                        </div>
                      )}
                      
                      {/* Arrival Details */}
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-gray-500">Terminal</p>
                          <p className="font-bold">{flightStatus.arrival?.terminal || "MAIN"}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Baggage Belt</p>
                          <p className="font-bold">{flightStatus.arrival?.baggageBelt || "14"}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Additional Information */}
                  <div className="border-t pt-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="text-center">
                        <p className="text-sm text-gray-500">Status Basis</p>
                        <p className="font-bold">{flightStatus.statusBasis || "INSUFFICIENT_DATA"}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm text-gray-500">Aircraft</p>
                        <p className="font-bold">{flightStatus.equipment || "null"}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm text-gray-500">Live Tracking</p>
                        <p className={`font-bold ${flightStatus.liveStatusAvailable ? 'text-green-600' : 'text-red-600'}`}>
                          {flightStatus.liveStatusAvailable ? "Available" : "Not Available"}
                        </p>
                      </div>
                    </div>
                    
                    {/* Provider Info */}
                    {flightStatus.provider && (
                      <div className="mt-4 text-center">
                        <p className="text-sm text-gray-500">
                          Data provided by: <span className="font-semibold">{flightStatus.provider}</span>
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            )}

            {/* Main Content - KEEP EXACTLY AS BEFORE */}
            <section className="mb-10">
              <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-4">
                Live Flight Tracker & Real-Time Flight Status
              </h2>
 
              <p className="text-gray-700 mb-4 leading-relaxed">
                Get instant, real-time updates on any flight's arrival and
                departure with our live flight tracker. By checking the{" "}
                <strong className="font-bold">flight status</strong>, you can
                track
                <br />
                <strong className="font-bold">delays, cancellations,</strong> or
                <strong className="font-bold">gate changes</strong> before you
                head to the airport.
              </p>
 
              <p className="text-gray-700 mb-6 leading-relaxed">
                Our tracker provides complete details for any flight. Simply
                enter a<strong className="font-bold"> flight number </strong>or{" "}
                <strong className="font-bold">
                  {" "}
                  route (origin and destination){" "}
                </strong>
                to see:
              </p>
 
              <ul className="space-y-3 mb-10 pl-5">
                <li className="text-gray-700">
                  <strong className="font-bold">Current Flight Status:</strong>{" "}
                  (e.g., On-Time, Delayed, Landed, En Route, Diverted)
                </li>
                <li className="text-gray-700">
                  <strong className="font-bold">
                    Departure/Arrival Times:
                  </strong>{" "}
                  (Both Scheduled and Estimated)
                </li>
                <li className="text-gray-700">
                  <strong className="font-bold">Airport & Terminal:</strong>{" "}
                  (Including Departure Gate and Arrival Gate)
                </li>
                <li className="text-gray-700">
                  <strong className="font-bold">Delay Information:</strong> (The
                  total duration of the delay)
                </li>
                <li className="text-gray-700">
                  <strong className="font-bold">Live Map:</strong> (Track the
                  flight's real-time path)
                </li>
              </ul>
            </section>
 
            {/* Advertisement - KEEP EXACTLY AS BEFORE */}
            <div className="bg-blue-50 border-l-4 border-blue-600 p-5 mb-10">
              <p className="text-gray-800 font-medium">
                Check the lowest & cheapest airfares for flight booking across
                India & the world. Book Flights on BOBROS
              </p>
            </div>
          </div>
 
          {/* RIGHT SIDE - DOMESTIC AIRLINES - KEEP EXACTLY AS BEFORE */}
          <div className="w-full lg:w-[30%] pl-6">
            <section className="bg-white border border-gray-200 rounded-3xl p-6 shadow-sm">
              <h2 className="text-xl font-bold text-gray-900 mb-5">
                Domestic Airlines
              </h2>
 
              <div className="space-y-4">
                {domesticAirlines.map((airlineItem) => (
                  <div
                    key={airlineItem.code}
                    onClick={() => setAirline(airlineItem.code)}
                    className="flex items-center gap-3 text-blue-600 font-medium hover:underline cursor-pointer"
                  >
                    <img
                      src={airlineItem.logo}
                      alt={airlineItem.name}
                      className="w-7 h-7 object-contain"
                    />
                    <span>{airlineItem.name}</span>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FlightTracker;