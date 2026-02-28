import { useState, useRef, useEffect } from "react";
import { fetchCities } from "../../bus/services/apiService";
import { useNavigate } from "react-router-dom";
//import { searchTrips } from "../../bus/services/BustripService";
import {
  Bus,
  Plane,
  Building2,
  Palmtree,
  Car,
  MapPin,
  Calendar,
  ArrowRightLeft,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

const tabs = [
  { id: "bus", label: "Bus", icon: Bus },
  { id: "flights", label: "Flights", icon: Plane },
  { id: "hotels", label: "Hotels", icon: Building2 },
  { id: "holidays", label: "Holidays", icon: Palmtree },
  { id: "cabs", label: "Cabs", icon: Car },
];
const today = new Date().toISOString().split("T")[0];
const specialFares = [
  { id: "regular", label: "Regular", desc: "Regular fares" },
  { id: "first", label: "First SignUp", desc: "100 reward points" },
  { id: "reward", label: "Ride & Get Rewarded!", desc: "Earn 4% Every Trip" },
  { id: "promo", label: "Apply. Save. Smile!", desc: "Use Promocode upto 10%" },
];

const BookingForm = () => {
  const [activeTab, setActiveTab] = useState("bus");
  const [activeFare, setActiveFare] = useState("regular");

  // ===== CALENDAR STATES =====
  const [showCalendar, setShowCalendar] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [currentDate, setCurrentDate] = useState(new Date());
  const calendarRef = useRef(null);
  const [fromQuery, setFromQuery] = useState("");
  const [fromResults, setFromResults] = useState([]);
  const [showFromResults, setShowFromResults] = useState(false);
  const [toQuery, setToQuery] = useState("");
  const [toResults, setToResults] = useState([]);
  const [showToResults, setShowToResults] = useState(false);
  const fromRef = useRef(null);
  const toRef = useRef(null);
  const [fromSelected, setFromSelected] = useState("");
  const [toSelected, setToSelected] = useState("");

  // ✅ Separate debounce refs
  const fromDebounce = useRef(null);
  const toDebounce = useRef(null);

  const [fromCity, setFromCity] = useState(null);
  const [toCity, setToCity] = useState(null);
  const [cityError, setCityError] = useState("");
  const navigate = useNavigate();

  const handleSearch = () => {
    if (!fromCity || !toCity || !selectedDate) return;

    const formattedDate = selectedDate.toISOString().split("T")[0];

    // Navigate to front-end route, BusResultsPage will call API
    navigate(
      `/results?source=${fromCity.sid}&destination=${toCity.sid}&doj=${formattedDate}`,
    );
  };

  // Close calendar on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (calendarRef.current && !calendarRef.current.contains(event.target)) {
        setShowCalendar(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Close from/to dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (fromRef.current && !fromRef.current.contains(event.target)) {
        setShowFromResults(false);
        if (!fromSelected) setFromQuery("");
      }
      if (toRef.current && !toRef.current.contains(event.target)) {
        setShowToResults(false);
        if (!toSelected) setToQuery("");
      }
    };

    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, [fromSelected, toSelected]);

  const daysInMonth = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth() + 1,
    0,
  ).getDate();

  const firstDay = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth(),
    1,
  ).getDay();

  const monthName = currentDate.toLocaleString("default", {
    month: "long",
  });

  const year = currentDate.getFullYear();

  const handleDateSelect = (day) => {
    const fullDate = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      day,
    );
    setSelectedDate(fullDate);
    setShowCalendar(false);
  };

  const formatDate = (date) => {
    if (!date) return "";
    return date.toLocaleDateString("en-GB");
  };

  // ===== CITY SEARCH =====
  const searchCities = async (value) => {
    if (!value || value.length < 2) {
      setFromResults([]);
      return;
    }
    clearTimeout(fromDebounce.current);
    fromDebounce.current = setTimeout(async () => {
      try {
        const data = await fetchCities(value);
        setFromResults(data || []);
        setShowFromResults(true);
      } catch (err) {
        console.error("From City search failed", err);
      }
    }, 400);
  };

  const searchToCities = async (value) => {
    if (!value || value.length < 2) {
      setToResults([]);
      return;
    }
    clearTimeout(toDebounce.current);
    toDebounce.current = setTimeout(async () => {
      try {
        const res = await fetch(
          `${import.meta.env.VITE_API_BASE_URL}/cities?name=${value}`,
        );
        const data = await res.json();
        setToResults(data || []);
        setShowToResults(true);
      } catch (err) {
        console.error("To City search failed", err);
      }
    }, 400);
  };

  // ===== SWAP BUTTON LOGIC =====
  const handleSwap = () => {
    const newFrom = toCity;
    const newTo = fromCity;

    const newFromQuery = toQuery;
    const newToQuery = fromQuery;

    setFromCity(newFrom);
    setToCity(newTo);
    setFromQuery(newFromQuery);
    setToQuery(newToQuery);

    // swap selection flags too
    setFromSelected(!!newFrom);
    setToSelected(!!newTo);

    // validation on swapped values
    if (newFrom && newTo && newFrom.sid === newTo.sid) {
      setCityError("Departure and Destination cannot be same.Please re-type");
    } else {
      setCityError("");
    }
  };

  return (
    <section className="relative h-[650px] flex items-center justify-center">
      <img
        src="/assets/hero-bg.jpg"
        alt="hero"
        className="absolute inset-0 w-full h-full object-cover"
      />
      <div className="absolute inset-0 bg-black/30" />

      <div className="relative z-10 w-full max-w-6xl px-6">
        <div className="text-center mb-10 text-white">
          <h1 className="text-5xl font-bold mb-3">
            Your Journey, Our Priority
          </h1>
          <p className="text-lg opacity-90">
            Book buses, flights, hotels & more at the best prices
          </p>
        </div>

        <div className="relative bg-white rounded-3xl shadow-2xl p-10">
          {/* TABS */}
          <div className="flex gap-4 mb-10">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const active = activeTab === tab.id;

              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
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

          {/* FORM */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-end">
            {/* FROM */}
            <div ref={fromRef} className="md:col-span-4 group relative">
              <p className="text-xs text-gray-500 uppercase tracking-wide mb-2 transition-colors duration-300 group-hover:text-[#FD561E]">
                Depart From
              </p>
              <div className="flex items-center gap-3 pb-3 border-b-2 border-gray-200 transition-colors duration-300 group-hover:border-[#FD561E]">
                <MapPin className="text-gray-400 w-5 h-5 transition-colors duration-300 group-hover:text-[#FD561E]" />
                <input
                  type="text"
                  placeholder="Hyderabad"
                  className="w-full text-3xl font-semibold outline-none"
                  value={fromQuery}
                  onChange={(e) => {
                    const val = e.target.value;
                    setFromQuery(val);
                    setFromSelected(false);
                    searchCities(val);
                  }}
                />
              </div>

              {showFromResults && fromResults.length > 0 && (
                <div className="absolute left-0 top-full mt-2 w-full bg-white shadow-lg rounded-xl max-h-60 overflow-y-auto z-50">
                  {fromResults.map((city) => (
                    <div
                      key={city.sid}
                      onClick={() => {
                        setFromQuery(city.cityname);
                        setFromCity(city);
                        setFromSelected(true);
                        setShowFromResults(false);

                        if (toCity && toCity.sid === city.sid) {
                          setCityError(
                            "The Departure City and Destination City cannot be same. Please re-type.",
                          );
                        } else {
                          setCityError("");
                        }
                      }}
                      className="px-4 py-2 hover:bg-orange-50 cursor-pointer text-sm"
                    >
                      {city.cityname}, {city.state}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* SWAP */}
            <div className="md:col-span-1 flex justify-center">
              <button
                className="p-3 rounded-full bg-gray-100 hover:bg-gray-200 transition-all duration-500 hover:rotate-180"
                onClick={handleSwap}
              >
                <ArrowRightLeft className="w-5 h-5 text-gray-600" />
              </button>
            </div>

            {/* TO */}
            <div ref={toRef} className="md:col-span-4 group relative">
              <p className="text-xs text-gray-500 uppercase tracking-wide mb-2 transition-colors duration-300 group-hover:text-[#FD561E]">
                Going To
              </p>

              <div className="flex items-center gap-3 pb-3 border-b-2 border-gray-200 transition-colors duration-300 group-hover:border-[#FD561E]">
                <MapPin className="text-gray-400 w-5 h-5 transition-colors duration-300 group-hover:text-[#FD561E]" />
                <input
                  type="text"
                  placeholder="Mumbai"
                  className="w-full text-3xl font-semibold outline-none"
                  value={toQuery}
                  onChange={(e) => {
                    const val = e.target.value;
                    setToQuery(val);
                    setToSelected(false);
                    searchToCities(val);
                  }}
                />
              </div>

              {/* SAME CITY ERROR */}
              {cityError && (
                <div className="absolute left-0 right-0 mt-3 flex justify-center z-50">
                  <div className="relative bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-2 rounded-lg shadow-md flex items-center gap-2">
                    {/* Warning icon */}
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="w-10 h-10 text-red-500"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M12 9v2m0 4h.01M5.07 19h13.86c1.54 0 2.5-1.67 1.73-3L13.73 4a2 2 0 00-3.46 0L3.34 16c-.77 1.33.19 3 1.73 3z"
                      />
                    </svg>

                    <span>{cityError}</span>

                    {/* pointer arrow */}
                    <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-3 h-3 bg-red-50 border-l border-t border-red-200 rotate-45"></div>
                  </div>
                </div>
              )}

              {showToResults && toResults.length > 0 && (
                <div className="absolute left-0 top-full mt-2 w-full bg-white shadow-lg rounded-xl max-h-60 overflow-y-auto z-50">
                  {toResults.map((city) => (
                    <div
                      key={city.sid}
                      onClick={() => {
                        setToQuery(city.cityname);
                        setToCity(city);
                        setToSelected(true);
                        setShowToResults(false);

                        if (fromCity && fromCity.sid === city.sid) {
                          setCityError(
                            "The Departure City and Destination City cannot be same. Please re-type.",
                          );
                        } else {
                          setCityError("");
                        }
                      }}
                      className="px-4 py-2 hover:bg-orange-50 cursor-pointer text-sm"
                    >
                      {city.cityname}, {city.state}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* DATE */}
            <div className="md:col-span-3 relative group">
              <p className="text-xs text-gray-500 uppercase tracking-wide mb-2 transition-colors duration-300 group-hover:text-[#FD561E]">
                Depart Date
              </p>

              <div
                onClick={() => setShowCalendar(!showCalendar)}
                className="flex items-center gap-3 pb-3 border-b-2 border-gray-200 transition-colors duration-300 group-hover:border-[#FD561E] cursor-pointer"
              >
                <Calendar className="text-gray-400 w-5 h-5 transition-colors duration-300 group-hover:text-[#FD561E]" />
                <input
                  type="text"
                  value={formatDate(selectedDate)}
                  placeholder="Select Date"
                  readOnly
                  className="w-full text-3xl font-semibold outline-none cursor-pointer"
                />
              </div>

              {showCalendar && (
                <div
                  ref={calendarRef}
                  className="absolute top-20 left-0 bg-white rounded-2xl shadow-2xl p-6 w-[350px] z-50"
                >
                  <div className="flex justify-between items-center mb-4">
                    <button
                      onClick={() =>
                        setCurrentDate(
                          new Date(year, currentDate.getMonth() - 1, 1),
                        )
                      }
                    >
                      <ChevronLeft />
                    </button>

                    <h2 className="font-semibold text-lg">
                      {monthName} {year}
                    </h2>

                    <button
                      onClick={() =>
                        setCurrentDate(
                          new Date(year, currentDate.getMonth() + 1, 1),
                        )
                      }
                    >
                      <ChevronRight />
                    </button>
                  </div>

                  <div className="grid grid-cols-7 text-center text-sm text-gray-500 mb-2">
                    {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(
                      (day) => (
                        <div key={day}>{day}</div>
                      ),
                    )}
                  </div>

                  <div className="grid grid-cols-7 gap-2 text-center">
                    {[...Array(firstDay)].map((_, i) => (
                      <div key={i}></div>
                    ))}

                    {[...Array(daysInMonth)].map((_, index) => {
                      const day = index + 1;
                      const isSelected =
                        selectedDate &&
                        selectedDate.getDate() === day &&
                        selectedDate.getMonth() === currentDate.getMonth();

                      return (
                        <button
                          key={day}
                          onClick={() => handleDateSelect(day)}
                          className={`p-2 rounded-lg transition ${
                            isSelected
                              ? "bg-[#FD561E] text-white"
                              : "hover:bg-orange-100"
                          }`}
                        >
                          {day}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* SPECIAL FARES */}
          <div className="mt-10 flex flex-wrap items-center gap-4">
            <span className="text-sm font-bold uppercase tracking-wide text-gray-700">
              Special Fares
            </span>
            {specialFares.map((fare) => {
              const active = activeFare === fare.id;
              return (
                <button
                  key={fare.id}
                  onClick={() => setActiveFare(fare.id)}
                  className={`px-4 py-2 rounded-xl border text-left transition-all duration-300 ${
                    active
                      ? "border-[#FD561E] bg-orange-50 shadow-md"
                      : "border-gray-200 text-gray-600 hover:border-[#FD561E]"
                  }`}
                >
                  <span className="text-sm font-semibold block">
                    {fare.label}
                  </span>
                  <span className="text-xs text-gray-500">{fare.desc}</span>
                </button>
              );
            })}
          </div>

          {/* SEARCH BUTTON */}
          <div className="absolute left-1/2 -bottom-8 transform -translate-x-1/2">
            <button
              onClick={handleSearch}
              className="bg-gradient-to-r from-[#FD561E] to-[#ff7b4a] text-white px-16 py-4 rounded-full text-lg font-semibold shadow-xl hover:scale-110 transition-all duration-300"
            >
              Search
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default BookingForm;
