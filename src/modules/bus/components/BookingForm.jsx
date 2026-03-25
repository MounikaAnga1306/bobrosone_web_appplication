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
} from "lucide-react";

const tabs = [
  { id: "bus", label: "Bus", icon: Bus },
  { id: "billpayments", label: "Bill Payments", icon: Bus },
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

const tabRoutes = {
  bus: "/",
  billpayments: "/BillHomePage",
  flights: "/flights",
  hotels: "/hotels",
  holidays: "/holidays",
  cabs: "/cabs",
};

// 15 travel-related background images
// 15 carefully curated, high-quality travel-related background images
const backgroundImages = [
  // Modern buses & transportation
  "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80", // Modern luxury bus on highway at sunset
  "https://images.unsplash.com/photo-1504215680859-0262fb1e90c3?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80", // Red bus on winding mountain road
  "https://images.unsplash.com/photo-1533105079780-92b9be482077?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80", // Winding mountain road with morning light
  
  // Epic landscapes
  "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80", // Majestic mountain peak with snow
  "https://images.unsplash.com/photo-1469474968028-56623f02e42e?ixlib=rb-4.0.3&auto=format&fit=crop&w=2074&q=80", // Lush green forest with sunlight rays
  "https://images.unsplash.com/photo-1433086966358-54859d0ed716?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80", // Beautiful waterfall in forest
  "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?ixlib=rb-4.0.3&auto=format&fit=crop&w=2073&q=80", // Tropical paradise beach with palm trees
  "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?ixlib=rb-4.0.3&auto=format&fit=crop&w=2074&q=80", // Misty mountain valley at sunrise
  
  // Cityscapes & urban travel
  "https://images.unsplash.com/photo-1444723121867-7a241cacace9?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80", // Modern city skyline at golden hour
  "https://images.unsplash.com/photo-1519501025264-65ba15a82390?ixlib=rb-4.0.3&auto=format&fit=crop&w=2064&q=80", // Vibrant city street with energy
  "https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80", // City skyline with bridge at dusk
  
  // Coastal & water views
  "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?ixlib=rb-4.0.3&auto=format&fit=crop&w=2073&q=80", // Pristine beach with turquoise water
  "https://images.unsplash.com/photo-1483683804023-6ccdb62f86ef?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80", // Coastal cliffs with ocean waves
  "https://images.unsplash.com/photo-1493246507139-91e8fad2088c?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80", // Sunrise over ocean with golden light
  
  // Adventure & road trips
  "https://images.unsplash.com/photo-1551632811-561732d1e306?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80", // Adventure road through desert landscape
  "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80", // Scenic coastal highway
  "https://images.unsplash.com/photo-1501785888041-af3ef285b470?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80", // Morning mist over tranquil lake
];

const BookingForm = () => {
  const [activeTab, setActiveTab] = useState("bus");
  const [activeFare, setActiveFare] = useState("regular");
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

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

  const [fromSelected, setFromSelected] = useState(false);
  const [toSelected, setToSelected] = useState(false);

  const [fromCity, setFromCity] = useState(null);
  const [toCity, setToCity] = useState(null);

  // ✅ 3 separate error states
  const [fromError, setFromError] = useState("");
  const [toError, setToError] = useState("");
  const [sameCityError, setSameCityError] = useState("");

  const fromDebounce = useRef(null);
  const toDebounce = useRef(null);

  const navigate = useNavigate();

  // Carousel navigation handlers
  const goToPreviousImage = () => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setCurrentImageIndex((prevIndex) =>
      prevIndex === 0 ? backgroundImages.length - 1 : prevIndex - 1
    );
    setTimeout(() => setIsTransitioning(false), 500);
  };

  const goToNextImage = () => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setCurrentImageIndex((prevIndex) =>
      prevIndex === backgroundImages.length - 1 ? 0 : prevIndex + 1
    );
    setTimeout(() => setIsTransitioning(false), 500);
  };

  const handleSearch = () => {
    // Reset all errors
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

    // Same city — only check if both are selected
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

  // ===== SWAP =====
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

    // Clear all errors on swap
    setFromError("");
    setToError("");
    setSameCityError("");
  };

  return (
    <section className="relative h-[590px] flex items-center justify-center">
      <img
        src="https://images.unsplash.com/photo-1570125909232-eb263c188f7e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2071&q=80"
        alt="Modern bus fleet on highway"
        className="absolute inset-0 w-full h-[590px] object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-red-600/90 via-red-500/80 to-purple-600/70" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

      <div className="relative z-10 w-full max-w-6xl px-6">
        <div className="text-center mb-10 text-white">
          <h1 className="text-5xl font-bold -mb-15">
            Your Journey, Our Priority
          </h1>
          <p className="text-lg opacity-90 mt-18">
            Book buses, flights, hotels & more at the best prices
          </p>
        </div>

        <div className="relative bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl p-10 border border-white/20">
          {/* TABS */}
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
                  className={`flex items-center gap-2 px-6 py-3 cursor-pointer rounded-full text-sm font-semibold transition-all duration-300 border ${
                    active
                      ? "bg-gradient-to-r from-[#FD561E] to-[#ff7b4a] text-white border-transparent shadow-lg scale-105"
                      : "border-gray-200 text-gray-600 hover:border-[#FD561E] hover:text-[#FD561E] bg-white/80"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* FORM — items-start so columns don't stretch when error appears */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">

            {/* FROM */}
            <div ref={fromRef} className="md:col-span-4 group relative">
              <p className="text-xs text-gray-500 uppercase tracking-wide mb-2 transition-colors duration-300 group-hover:text-[#FD561E]">
                Depart From
              </p>
              <div
                className={`flex items-center gap-3 pb-3 border-b-2 transition-colors duration-300 ${
                  fromError
                    ? "border-red-400"
                    : "border-gray-200 group-hover:border-[#FD561E]"
                }`}
              >
                <MapPin
                  className={`w-5 h-5 transition-colors duration-300 ${
                    fromError
                      ? "text-red-400"
                      : "text-gray-400 group-hover:text-[#FD561E]"
                  }`}
                />
                <input
                  type="text"
                  placeholder="Hyderabad"
                  className="w-full text-3xl font-semibold outline-none bg-transparent"
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

              {/* ✅ Fixed height error slot — layout never shifts */}
              <div className="h-5 mt-1">
                {fromError && (
                  <p className="text-red-500 text-xs flex items-center gap-1">
                    <span>⚠</span> {fromError}
                  </p>
                )}
              </div>

              {showFromResults && fromResults.length > 0 && (
                <div className="absolute left-0 top-full w-full bg-white shadow-lg rounded-xl max-h-60 overflow-y-auto z-50">
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
                      className="px-4 py-2 hover:bg-orange-50 cursor-pointer text-sm"
                    >
                      {city.cityname}, {city.state}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* SWAP */}
            <div className="md:col-span-1 flex justify-center pt-8">
              <button
                className="p-3 rounded-full bg-gray-100 hover:bg-gray-200 transition-all duration-500 hover:rotate-180 cursor-pointer"
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
              <div
                className={`flex items-center gap-3 pb-3 border-b-2 transition-colors duration-300 ${
                  toError || sameCityError
                    ? "border-red-400"
                    : "border-gray-200 group-hover:border-[#FD561E]"
                }`}
              >
                <MapPin
                  className={`w-5 h-5 transition-colors duration-300 ${
                    toError || sameCityError
                      ? "text-red-400"
                      : "text-gray-400 group-hover:text-[#FD561E]"
                  }`}
                />
                <input
                  type="text"
                  placeholder="Mumbai"
                  className="w-full text-3xl font-semibold outline-none bg-transparent"
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

              {/* ✅ Fixed height error slot — sameCityError priority over toError */}
              <div className="h-5 mt-1">
                {(toError || sameCityError) && (
                  <p className="text-red-500 text-xs flex items-center gap-1">
                    <span>⚠</span> {sameCityError || toError}
                  </p>
                )}
              </div>

              {showToResults && toResults.length > 0 && (
                <div className="absolute left-0 top-full w-full bg-white shadow-lg rounded-xl max-h-60 overflow-y-auto z-50">
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
                  className="w-full text-3xl font-semibold outline-none cursor-pointer bg-transparent"
                />
              </div>

              {/* ✅ Same fixed height spacer as from/to — keeps row aligned */}
              <div className="h-5 mt-1" />

              {showCalendar && (
                <div
                  ref={calendarRef}
                  className="absolute top-20 left-0 bg-white rounded-2xl shadow-2xl p-6 w-[350px] z-50"
                >
                  <div className="flex justify-between items-center mb-4">
                    <button
                      onClick={() =>
                        setCurrentDate(new Date(year, currentDate.getMonth() - 1, 1))
                      }
                    >
                      <ChevronLeft />
                    </button>
                    <h2 className="font-semibold text-lg">
                      {monthName} {year}
                    </h2>
                    <button
                      onClick={() =>
                        setCurrentDate(new Date(year, currentDate.getMonth() + 1, 1))
                      }
                    >
                      <ChevronRight />
                    </button>
                  </div>

                  <div className="grid grid-cols-7 text-center text-sm text-gray-500 mb-2">
                    {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                      <div key={day}>{day}</div>
                    ))}
                  </div>

                  <div className="grid grid-cols-7 gap-2 text-center">
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
                          className={`p-2 rounded-lg transition ${
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

          {/* SPECIAL FARES */}
          <div className="mt-6 flex flex-wrap items-center gap-4">
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
                      : "border-gray-200 text-gray-600 hover:border-[#FD561E] bg-white/80"
                  }`}
                >
                  <span className="text-sm font-semibold block">{fare.label}</span>
                  <span className="text-xs text-gray-500">{fare.desc}</span>
                </button>
              );
            })}
          </div>

          {/* SEARCH BUTTON */}
          <div className="absolute left-1/2 -bottom-8 transform -translate-x-1/2">
            <button
              onClick={handleSearch}
              className="bg-gradient-to-r from-[#FD561E] to-[#ff7b4a] text-white cursor-pointer px-16 py-4 rounded-full text-lg font-semibold shadow-xl hover:scale-110 transition-all duration-300"
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