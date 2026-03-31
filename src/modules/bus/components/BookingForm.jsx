import { useState, useRef, useEffect } from "react";
import { fetchCities } from "../../bus/services/apiService";
import { useNavigate } from "react-router-dom";
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
  ArrowUp,
  ArrowDown,
} from "lucide-react";

const tabs = [
  { id: "bus", label: "Bus", icon: Bus },
  { id: "billpayments", label: "Bill Payments", icon: Bus },
  { id: "flights", label: "Flights", icon: Plane },
  { id: "hotels", label: "Hotels", icon: Building2 },
  { id: "holidays", label: "Holidays", icon: Palmtree },
  { id: "cabs", label: "Cabs", icon: Car },
];

const specialFares = [
  { id: "regular", label: "Regular", desc: "Regular fares" },
  { id: "first", label: "First SignUp", desc: "100 reward points" },
  { id: "reward", label: "Ride & Get Rewarded!", desc: "Earn 4% Every Trip" },
  { id: "promo", label: "Apply. Save. Smile!", desc: "Use Promocode upto 10%" },
];

const tabRoutes = {
  bus: "/",
  billpayments: "/BillHomePage",
  flights: "/flights",
  hotels: "/hotels",
  holidays: "/holidays",
  cabs: "/cabs",
};

const BookingForm = () => {
  const [activeTab, setActiveTab] = useState("bus");
  const [activeFare, setActiveFare] = useState("regular");

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

  const [fromSelected, setFromSelected] = useState(false);
  const [toSelected, setToSelected] = useState(false);

  const [fromCity, setFromCity] = useState(null);
  const [toCity, setToCity] = useState(null);

  const [fromError, setFromError] = useState("");
  const [toError, setToError] = useState("");
  const [sameCityError, setSameCityError] = useState("");

  const fromDebounce = useRef(null);
  const toDebounce = useRef(null);

  const navigate = useNavigate();

  const handleSearch = () => {
    setFromError("");
    setToError("");
    setSameCityError("");

    let isValid = true;

    if (!fromCity || !fromCity.sid) {
      setFromError("Please select departure city");
      isValid = false;
    }

    if (!toCity || !toCity.sid) {
      setToError("Please select destination city");
      isValid = false;
    }

    if (fromCity && fromCity.sid && toCity && toCity.sid && fromCity.sid === toCity.sid) {
      setSameCityError("Departure and Destination cannot be the same");
      isValid = false;
    }

    if (!isValid) return;

    const formattedDate = selectedDate.toISOString().split("T")[0];

    navigate(
      `/results?source=${fromCity.sid}&destination=${toCity.sid}&doj=${formattedDate}`,
      {
        state: {
          sourceName: fromCity.cityname,
          destinationName: toCity.cityname,
          date: selectedDate,
        },
      }
    );
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (calendarRef.current && !calendarRef.current.contains(event.target)) {
        setShowCalendar(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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
    0
  ).getDate();

  const firstDay = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth(),
    1
  ).getDay();

  const monthName = currentDate.toLocaleString("default", { month: "long" });
  const year = currentDate.getFullYear();

  const handleDateSelect = (day) => {
    const fullDate = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      day
    );
    setSelectedDate(fullDate);
    setShowCalendar(false);
  };

  const formatDate = (date) => {
    if (!date) return "";
    return date.toLocaleDateString("en-GB");
  };

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
          `${import.meta.env.VITE_API_BASE_URL}/cities?name=${value}`
        );
        const data = await res.json();
        setToResults(data || []);
        setShowToResults(true);
      } catch (err) {
        console.error("To City search failed", err);
      }
    }, 400);
  };

  const handleSwap = () => {
    const newFrom = toCity;
    const newTo = fromCity;
    const newFromQuery = toQuery;
    const newToQuery = fromQuery;

    setFromCity(newFrom);
    setToCity(newTo);
    setFromQuery(newFromQuery);
    setToQuery(newToQuery);
    setFromSelected(!!newFrom);
    setToSelected(!!newTo);

    setFromError("");
    setToError("");
    setSameCityError("");
  };

  return (
    <section className="relative min-h-[550px] md:min-h-[590px] flex items-center justify-center py-8 md:py-0">
      {/* Background Image */}
      <img
        src="https://images.unsplash.com/photo-1570125909232-eb263c188f7e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2071&q=80"
        alt="Modern bus fleet on highway"
        className="absolute inset-0 w-full h-full object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-red-600/90 via-red-500/80 to-purple-600/70" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

      <div className="relative z-10 w-full max-w-6xl px-4 sm:px-6">
        {/* Hero Text */}
        <div className="text-center mb-4 sm:mb-6 md:mb-8 text-white">
          <h1 className="text-xl sm:text-2xl md:text-4xl lg:text-5xl font-bold mt-6 md:-mt-6">
            Your Journey, Our Priority
          </h1>
          <p className="text-xs sm:text-sm md:text-lg opacity-90 mt-1 sm:mt-2">
            Book buses, flights, hotels & more at the best prices
          </p>
        </div>

        <div className="relative bg-white/95 backdrop-blur-sm rounded-2xl sm:rounded-3xl shadow-2xl p-3 sm:p-4 md:p-6 lg:p-8 border border-white/20">
          {/* TABS - Only visible on desktop (lg and above) */}
          <div className="hidden lg:flex gap-3 mb-6 md:mb-8">
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
                  className={`flex items-center gap-2 px-3 lg:px-4 xl:px-5 py-1.5 lg:py-2 xl:py-2.5 cursor-pointer rounded-full text-xs sm:text-sm font-semibold transition-all duration-300 border ${
                    active
                      ? "bg-gradient-to-r from-[#FD561E] to-[#ff7b4a] text-white border-transparent shadow-lg scale-105"
                      : "border-gray-200 text-gray-600 hover:border-[#FD561E] hover:text-[#FD561E] bg-white/80"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* FORM */}
          <div className="relative ">
           {/* MOBILE + TABLET (ROTATED) */}
<div className="absolute right-0 top-1/3   mr-4 -mt-6 transform -translate-y-1/2 z-20 md:hidden">
  <button
    className="rounded-full bg-gray-200 border border-gray-200  p-2 
               hover:bg-gray-50 transition-all duration-300 shadow-sm"
    onClick={handleSwap}
    title="Swap locations"
  >
    <ArrowRightLeft className="w-4 h-4  text-gray-400 rotate-90" />
  </button>
</div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-3 md:gap-4">
              {/* FROM */}
              <div ref={fromRef} className="md:col-span-5 lg:col-span-4 group relative">
                <p className="text-[11px] sm:text-xs text-gray-500 uppercase tracking-wide mb-1 transition-colors duration-300 group-hover:text-[#FD561E]">
                  Depart From
                </p>
                <div
                  className={`flex items-center gap-2  pb-1.5 border-b transition-colors duration-300 ${
                    fromError
                      ? "border-red-400"
                      : "border-gray-200 group-hover:border-[#FD561E]"
                  }`}
                >
                  <MapPin
                    className={`w-3.5 h-3.5 sm:w-4 sm:h-4 transition-colors duration-300 flex-shrink-0 ${
                      fromError
                        ? "text-red-400"
                        : "text-gray-400 group-hover:text-[#FD561E]"
                    }`}
                  />
                  <input
                    type="text"
                    placeholder="Hyderabad"
                    className="w-full text-sm sm:text-base md:text-lg font-semibold outline-none bg-transparent py-1"
                    value={fromQuery}
                    onChange={(e) => {
                      const val = e.target.value;
                      setFromQuery(val);
                      setFromSelected(false);
                      setFromCity(null);
                      setFromError("");
                      setSameCityError("");
                      searchCities(val);
                    }}
                  />
                </div>

                <div className="h-4 mt-0.5">
                  {fromError && (
                    <p className="text-red-500 text-[10px] flex items-center gap-1">
                      <span>⚠</span> {fromError}
                    </p>
                  )}
                </div>

                {showFromResults && fromResults.length > 0 && (
                  <div className="absolute left-0 top-full w-full bg-white shadow-lg rounded-xl max-h-48 overflow-y-auto z-50 mt-1">
                    {fromResults.map((city) => (
                      <div
                        key={city.sid}
                        onClick={() => {
                          setFromQuery(city.cityname);
                          setFromCity(city);
                          setFromSelected(true);
                          setShowFromResults(false);
                          setFromError("");
                          if (toCity && toCity.sid === city.sid) {
                            setSameCityError("Departure and Destination cannot be the same");
                          } else {
                            setSameCityError("");
                          }
                        }}
                        className="px-3 py-1.5 hover:bg-orange-50 cursor-pointer text-xs"
                      >
                        {city.cityname}, {city.state}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* SWAP - Desktop */}
              <div className="hidden md:flex md:col-span-1 justify-center items-center">
                <button
                  className="p-1.5 sm:p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-all duration-500 hover:rotate-180 cursor-pointer"
                  onClick={handleSwap}
                >
                  <ArrowRightLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-600" />
                </button>
              </div>

              {/* TO */}
              <div ref={toRef} className="md:col-span-5 lg:col-span-4 group relative">
                <p className="text-[11px] sm:text-xs text-gray-500 uppercase tracking-wide mb-1 transition-colors duration-300 group-hover:text-[#FD561E]">
                  Going To
                </p>
                <div
                  className={`flex items-center gap-2 pb-1.5 border-b transition-colors duration-300 ${
                    toError || sameCityError
                      ? "border-red-400"
                      : "border-gray-200 group-hover:border-[#FD561E]"
                  }`}
                >
                  <MapPin
                    className={`w-3.5 h-3.5 sm:w-4 sm:h-4 transition-colors duration-300 flex-shrink-0 ${
                      toError || sameCityError
                        ? "text-red-400"
                        : "text-gray-400 group-hover:text-[#FD561E]"
                    }`}
                  />
                  <input
                    type="text"
                    placeholder="Mumbai"
                    className="w-full text-sm sm:text-base md:text-lg font-semibold outline-none bg-transparent py-1"
                    value={toQuery}
                    onChange={(e) => {
                      const val = e.target.value;
                      setToQuery(val);
                      setToSelected(false);
                      setToCity(null);
                      setToError("");
                      setSameCityError("");
                      searchToCities(val);
                    }}
                  />
                </div>

                <div className="h-4 mt-0.5">
                  {(toError || sameCityError) && (
                    <p className="text-red-500 text-[10px] flex items-center gap-1">
                      <span>⚠</span> {sameCityError || toError}
                    </p>
                  )}
                </div>

                {showToResults && toResults.length > 0 && (
                  <div className="absolute left-0 top-full w-full bg-white shadow-lg rounded-xl max-h-48 overflow-y-auto z-50 mt-1">
                    {toResults.map((city) => (
                      <div
                        key={city.sid}
                        onClick={() => {
                          setToQuery(city.cityname);
                          setToCity(city);
                          setToSelected(true);
                          setShowToResults(false);
                          setToError("");
                          if (fromCity && fromCity.sid === city.sid) {
                            setSameCityError("Departure and Destination cannot be the same");
                          } else {
                            setSameCityError("");
                          }
                        }}
                        className="px-3 py-1.5 hover:bg-orange-50 cursor-pointer text-xs"
                      >
                        {city.cityname}, {city.state}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* DATE */}
              <div className="md:col-span-3 lg:col-span-3 relative group">
                <p className="text-[11px] sm:text-xs text-gray-500 uppercase tracking-wide mb-1 transition-colors duration-300 group-hover:text-[#FD561E]">
                  Depart Date
                </p>
                <div
                  onClick={() => setShowCalendar(!showCalendar)}
                  className="flex items-center gap-2 pb-1.5 border-b border-gray-200 transition-colors duration-300 group-hover:border-[#FD561E] cursor-pointer"
                >
                  <Calendar className="text-gray-400 w-3.5 h-3.5 sm:w-4 sm:h-4 transition-colors duration-300 group-hover:text-[#FD561E] flex-shrink-0" />
                  <input
                    type="text"
                    value={formatDate(selectedDate)}
                    placeholder="Select Date"
                    readOnly
                    className="w-full text-sm sm:text-base md:text-lg font-semibold outline-none cursor-pointer bg-transparent py-1"
                  />
                </div>
                <div className="h-4 mt-0.5" />

                {showCalendar && (
                  <div
                    ref={calendarRef}
                    className="absolute top-12 left-0 right-0 sm:right-auto bg-white rounded-2xl shadow-2xl p-3 sm:p-4 w-full sm:w-[320px] z-50"
                  >
                    <div className="flex justify-between items-center mb-3">
                      <button
                        onClick={() =>
                          setCurrentDate(new Date(year, currentDate.getMonth() - 1, 1))
                        }
                        className="p-1 hover:bg-gray-100 rounded"
                      >
                        <ChevronLeft size={18} />
                      </button>
                      <h2 className="font-semibold text-sm">
                        {monthName} {year}
                      </h2>
                      <button
                        onClick={() =>
                          setCurrentDate(new Date(year, currentDate.getMonth() + 1, 1))
                        }
                        className="p-1 hover:bg-gray-100 rounded"
                      >
                        <ChevronRight size={18} />
                      </button>
                    </div>

                    <div className="grid grid-cols-7 text-center text-xs text-gray-500 mb-2">
                      {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                        <div key={day}>{day}</div>
                      ))}
                    </div>

                    <div className="grid grid-cols-7 gap-0.5 text-center">
                      {[...Array(firstDay)].map((_, i) => (
                        <div key={i}></div>
                      ))}
                      {[...Array(daysInMonth)].map((_, index) => {
                        const day = index + 1;
                        const isPastDate = (d) => {
                          const date = new Date(
                            currentDate.getFullYear(),
                            currentDate.getMonth(),
                            d
                          );
                          return date < new Date();
                        };
                        const isSelected =
                          selectedDate &&
                          selectedDate.getDate() === day &&
                          selectedDate.getMonth() === currentDate.getMonth();

                        return (
                          <button
                            key={day}
                            onClick={() => !isPastDate(day) && handleDateSelect(day)}
                            disabled={isPastDate(day)}
                            className={`p-1 rounded-lg transition text-xs ${
                              isSelected ? "bg-[#FD561E] text-white" : ""
                            } ${
                              isPastDate(day)
                                ? "text-gray-300 cursor-not-allowed"
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
          </div>

          {/* SPECIAL FARES */}
          <div className="mt-5 sm:mt-6 flex flex-wrap items-center gap-1.5 sm:gap-2 md:gap-3">
            <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wide text-gray-700">
              Special Fares
            </span>
            <div className="flex flex-wrap gap-1.5 sm:gap-2">
              {specialFares.map((fare) => {
                const active = activeFare === fare.id;
                return (
                  <button
                    key={fare.id}
                    onClick={() => setActiveFare(fare.id)}
                    className={`px-2 sm:px-3 py-1 rounded-lg border text-left transition-all duration-300 ${
                      active
                        ? "border-[#FD561E] bg-orange-50 shadow-sm"
                        : "border-gray-200 text-gray-600 hover:border-[#FD561E] bg-white/80"
                    }`}
                  >
                    <span className="text-[10px] sm:text-xs font-semibold block">{fare.label}</span>
                    <span className="text-[8px] sm:text-[10px] text-gray-500">{fare.desc}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* SEARCH BUTTON */}
          <div className="absolute left-1/2 -bottom-5 sm:-bottom-6 md:-bottom-7 transform -translate-x-1/2">
            <button
              onClick={handleSearch}
              className="bg-gradient-to-r from-[#FD561E] to-[#ff7b4a] text-white cursor-pointer px-6 sm:px-8 md:px-14 py-1.5 sm:py-2 md:py-3 rounded-full text-xs sm:text-sm md:text-base font-semibold shadow-xl hover:scale-110 transition-all duration-300 whitespace-nowrap"
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