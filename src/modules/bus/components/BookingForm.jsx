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
  IndianRupee,
} from "lucide-react";

const tabs = [
  { id: "bus", label: "Bus", icon: Bus },
  { id: "billpayments", label: "Bill Payments", icon: IndianRupee },
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
  holidays: "/Holiday",
  cabs: "/cabs",
};

// Modern bus/transport background images
const backgroundImages = [
  "https://www.touristsecrets.com/wp-content/uploads/2023/10/washington-d-c-road-trippin-with-greyhound-1697125082.jpg",
  "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80",
  "https://img.freepik.com/premium-photo/bus-driving-road_81048-20397.jpg",
  "https://png.pngtree.com/thumb_back/fh260/background/20241219/pngtree-travel-bus-on-a-beautiful-highway-image_16826753.jpg",
  "https://tse1.mm.bing.net/th/id/OIP.Nl1KxOe3O_kc9ML0AYtnZAHaEJ?w=996&h=558&rs=1&pid=ImgDetMain&o=7&rm=3",
];

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

  // Background carousel state
  const [currentBgIndex, setCurrentBgIndex] = useState(0);
  const [nextBgIndex, setNextBgIndex] = useState(1);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const intervalRef = useRef(null);

  const navigate = useNavigate();

  // Function to change background (manual or auto)
  const changeBackground = (direction) => {
    // Clear existing interval
    if (intervalRef.current) clearInterval(intervalRef.current);
    
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentBgIndex((prev) => {
        let newIndex;
        if (direction === 'next') newIndex = (prev + 1) % backgroundImages.length;
        else if (direction === 'prev') newIndex = (prev - 1 + backgroundImages.length) % backgroundImages.length;
        else newIndex = (prev + 1) % backgroundImages.length; // auto
        setNextBgIndex((newIndex + 1) % backgroundImages.length);
        return newIndex;
      });
      setIsTransitioning(false);
    }, 1000);
    
    // Restart auto-rotation
    startAutoRotation();
  };

  const startAutoRotation = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      setIsTransitioning(true);
      setTimeout(() => {
        setCurrentBgIndex((prev) => {
          const newIndex = (prev + 1) % backgroundImages.length;
          setNextBgIndex((newIndex + 1) % backgroundImages.length);
          return newIndex;
        });
        setIsTransitioning(false);
      }, 1000);
    }, 5000);
  };

  useEffect(() => {
    startAutoRotation();
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const handleSearch = () => {
    setFromError("");
    setToError("");
    setSameCityError("");


  // ✅ LOG #1 — enti select chesav ani chuddam
  console.log("=== SEARCH CLICKED ===");
  console.log("fromCity:", fromCity);
  console.log("toCity:", toCity);
  console.log("selectedDate:", selectedDate);


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

    if (!isValid){
       console.log("❌ Validation failed — not navigating");
       return;
    } 

   const formattedDate = 
  selectedDate.getFullYear() + "-" +
  String(selectedDate.getMonth() + 1).padStart(2, "0") + "-" +
  String(selectedDate.getDate()).padStart(2, "0");
    
    console.log("✅ Navigating with:", {
    source: fromCity.sid,
    destination: toCity.sid,
    doj: formattedDate,
    sourceName: fromCity.cityname,
    destinationName: toCity.cityname,
  });


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
    const fullDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    setSelectedDate(fullDate);
    setShowCalendar(false);
  };

  const formatDate = (date) => {
    if (!date) return "";
    return date.toLocaleDateString("en-GB");
  };

  const searchCities = async (value) => {
    if (!value || value.length < 2) { setFromResults([]); return; }
    clearTimeout(fromDebounce.current);
    fromDebounce.current = setTimeout(async () => {
      try {
        const data = await fetchCities(value);
        setFromResults(data || []);
        setShowFromResults(true);
      } catch (err) { console.error("From City search failed", err); }
    }, 400);
  };

  const searchToCities = async (value) => {
    if (!value || value.length < 2) { setToResults([]); return; }
    clearTimeout(toDebounce.current);
    toDebounce.current = setTimeout(async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/cities?name=${value}`);
        const data = await res.json();
        setToResults(data || []);
        setShowToResults(true);
      } catch (err) { console.error("To City search failed", err); }
    }, 400);
  };

  const handleSwap = () => {
    const newFrom = toCity, newTo = fromCity;
    const newFromQuery = toQuery, newToQuery = fromQuery;
    setFromCity(newFrom); setToCity(newTo);
    setFromQuery(newFromQuery); setToQuery(newToQuery);
    setFromSelected(!!newFrom); setToSelected(!!newTo);
    setFromError(""); setToError(""); setSameCityError("");
  };

  const isPastDate = (d) => {
    const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), d);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today;
  };

  return (
    <section className="relative min-h-[550px] md:min-h-[590px] flex items-center justify-center py-8 md:py-0 overflow-hidden">
      {/* Background Carousel with Zoom Effect */}
      <div className="absolute inset-0 w-full h-full">
        {/* Current Image */}
        <div
          className="absolute inset-0 w-full h-full transition-all duration-1000 ease-in-out"
          style={{
            backgroundImage: `url(${backgroundImages[currentBgIndex]})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            transform: isTransitioning ? 'scale(1.05)' : 'scale(1)',
            transition: 'transform 8s ease-in-out',
          }}
        />
        {/* Next Image (for smooth crossfade) */}
        <div
          className="absolute inset-0 w-full h-full transition-opacity duration-1000 ease-in-out"
          style={{
            backgroundImage: `url(${backgroundImages[nextBgIndex]})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            opacity: isTransitioning ? 1 : 0,
            transform: 'scale(1.05)',
          }}
        />
      </div>

      {/* Very subtle dark overlay for text readability (removed heavy gradients) */}
      <div className="absolute inset-0 bg-black/30" />

      {/* Carousel Navigation Arrows */}
      <button
        onClick={() => changeBackground('prev')}
        className="absolute left-4 md:left-8 z-20 bg-white/20 hover:bg-white/40 backdrop-blur-sm p-2 rounded-full text-white transition-all duration-300"
        aria-label="Previous image"
      >
        <ChevronLeft size={24} />
      </button>
      <button
        onClick={() => changeBackground('next')}
        className="absolute right-4 md:right-8 z-20 bg-white/20 hover:bg-white/40 backdrop-blur-sm p-2 rounded-full text-white transition-all duration-300"
        aria-label="Next image"
      >
        <ChevronRight size={24} />
      </button>

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
          {/* TABS - desktop only */}
          <div className="hidden lg:flex gap-3 mb-6 md:mb-8">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const active = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => { setActiveTab(tab.id); navigate(tabRoutes[tab.id]); }}
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

          {/* ── MOBILE FORM ── (unchanged) */}
          <div className="md:hidden space-y-0">
            <div className="relative border border-gray-200 rounded-xl overflow-visible">
              <div ref={fromRef} className="relative px-3 pt-3 pb-2 pr-10">
                <p className="text-[10px] text-gray-400 uppercase tracking-widest mb-1">Depart From</p>
                <div className={`flex items-center gap-2 pb-1 ${fromError ? "border-red-400" : "border-gray-200"}`}>
                  <MapPin className={`w-3.5 h-3.5 flex-shrink-0 ${fromError ? "text-red-400" : "text-gray-400"}`} />
                  <input
                    type="text"
                    placeholder="From"
                    className="w-full text-sm font-semibold outline-none bg-transparent py-0.5"
                    value={fromQuery}
                    onChange={(e) => {
                      const val = e.target.value;
                      setFromQuery(val); setFromSelected(false); setFromCity(null);
                      setFromError(""); setSameCityError("");
                      searchCities(val);
                    }}
                  />
                </div>
                {fromError && <p className="text-red-500 text-[10px] mt-0.5 flex items-center gap-1"><span>⚠</span>{fromError}</p>}
                {showFromResults && fromResults.length > 0 && (
                  <div className="absolute left-0 top-full w-full bg-white shadow-lg rounded-xl max-h-48 overflow-y-auto z-50 mt-1">
                    {fromResults.map((city) => (
                      <div key={city.sid}
                        onClick={() => { setFromQuery(city.cityname); setFromCity(city); setFromSelected(true); setShowFromResults(false); setFromError(""); if (toCity?.sid === city.sid) setSameCityError("Departure and Destination cannot be the same"); else setSameCityError(""); }}
                        className="px-3 py-2 hover:bg-orange-50 cursor-pointer text-xs border-b last:border-0">
                        {city.cityname}, {city.state}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <div className="relative mt-2 border border-gray-200 rounded-xl overflow-visible">
              <div className="mx-3 border-t border-dashed border-gray-200" />
              <div ref={toRef} className="relative px-3 pt-2 pb-3 pr-10">
                <p className="text-[10px] text-gray-400 uppercase tracking-widest mb-1">Going To</p>
                <div className={`flex items-center gap-2 pb-1 ${toError || sameCityError ? "border-red-400" : "border-gray-200"}`}>
                  <MapPin className={`w-3.5 h-3.5 flex-shrink-0 ${toError || sameCityError ? "text-red-400" : "text-gray-400"}`} />
                  <input
                    type="text"
                    placeholder="To"
                    className="w-full text-sm font-semibold outline-none bg-transparent py-0.5"
                    value={toQuery}
                    onChange={(e) => {
                      const val = e.target.value;
                      setToQuery(val); setToSelected(false); setToCity(null);
                      setToError(""); setSameCityError("");
                      searchToCities(val);
                    }}
                  />
                </div>
                {(toError || sameCityError) && <p className="text-red-500 text-[10px] mt-0.5 flex items-center gap-1"><span>⚠</span>{sameCityError || toError}</p>}
                {showToResults && toResults.length > 0 && (
                  <div className="absolute left-0 top-full w-full bg-white shadow-lg rounded-xl max-h-48 overflow-y-auto z-50 mt-1">
                    {toResults.map((city) => (
                      <div key={city.sid}
                        onClick={() => { setToQuery(city.cityname); setToCity(city); setToSelected(true); setShowToResults(false); setToError(""); if (fromCity?.sid === city.sid) setSameCityError("Departure and Destination cannot be the same"); else setSameCityError(""); }}
                        className="px-3 py-2 hover:bg-orange-50 cursor-pointer text-xs border-b last:border-0">
                        {city.cityname}, {city.state}
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className="absolute right-8 -top-2 -translate-y-1/2 translate-x-1/2 z-10">
                <button
                  onClick={handleSwap}
                  className="w-8 h-8 rounded-full bg-white border border-gray-300 flex items-center justify-center shadow-sm hover:bg-orange-50 hover:border-[#FD561E] transition-all duration-200"
                >
                  <ArrowRightLeft className="w-3.5 h-3.5 text-gray-500 rotate-90" />
                </button>
              </div>
            </div>
            <div className="relative mt-3 border border-gray-200 rounded-xl px-3 py-3">
              <p className="text-[10px] text-gray-400 uppercase tracking-widest mb-1">Depart Date</p>
              <div onClick={() => setShowCalendar(!showCalendar)} className="flex items-center gap-2 cursor-pointer">
                <Calendar className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                <span className="text-sm font-semibold text-gray-800">{formatDate(selectedDate)}</span>
              </div>
              {showCalendar && (
                <div ref={calendarRef} onMouseDown={(e) => e.stopPropagation()} className="relative left-0 right-0 bg-white rounded-2xl shadow-2xl p-2 z-50 mt-1">
                  <div className="flex justify-between items-center mb-3">
                    <button onClick={() => setCurrentDate(new Date(year, currentDate.getMonth() - 1, 1))} className="p-1 hover:bg-gray-100 rounded"><ChevronLeft size={18} /></button>
                    <h2 className="font-semibold text-sm">{monthName} {year}</h2>
                    <button onClick={() => setCurrentDate(new Date(year, currentDate.getMonth() + 1, 1))} className="p-1 hover:bg-gray-100 rounded"><ChevronRight size={18} /></button>
                  </div>
                  <div className="grid grid-cols-7 text-center text-xs text-gray-500 mb-2">
                    {["Sun","Mon","Tue","Wed","Thu","Fri","Sat"].map((d) => <div key={d}>{d}</div>)}
                  </div>
                  <div className="grid grid-cols-7 gap-0.5 text-center">
                    {[...Array(firstDay)].map((_, i) => <div key={i} />)}
                    {[...Array(daysInMonth)].map((_, idx) => {
                      const day = idx + 1;
                      const past = isPastDate(day);
                      const isSelected = selectedDate?.getDate() === day && selectedDate?.getMonth() === currentDate.getMonth();
                      return (
                        <button key={day} onClick={() => !past && handleDateSelect(day)} disabled={past}
                          className={`p-1 rounded-lg transition text-xs ${isSelected ? "bg-[#FD561E] text-white" : ""} ${past ? "text-gray-300 cursor-not-allowed" : "hover:bg-orange-100"}`}>
                          {day}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wide text-gray-700">Special Fares</span>
              <div className="flex flex-wrap gap-1.5">
                {specialFares.map((fare) => {
                  const active = activeFare === fare.id;
                  return (
                    <button key={fare.id} onClick={() => setActiveFare(fare.id)}
                      className={`px-2 py-1 rounded-lg border text-left transition-all duration-300 ${active ? "border-[#FD561E] bg-orange-50 shadow-sm" : "border-gray-200 text-gray-600 hover:border-[#FD561E] bg-white/80"}`}>
                      <span className="text-[10px] font-semibold block">{fare.label}</span>
                      <span className="text-[8px] text-gray-500">{fare.desc}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* ── DESKTOP / TABLET FORM (unchanged) ── */}
          <div className="hidden md:block relative">
            <div className="grid grid-cols-12 md:grid-cols-12 lg:grid-cols-12 gap-2 md:gap-2">
              {/* FROM */}
              <div ref={fromRef} className="col-span-5 md:col-span-4 lg:col-span-4 group relative">
                <p className="text-[11px] sm:text-xs text-gray-500 uppercase tracking-wide mb-1 transition-colors duration-300 group-hover:text-[#FD561E]">Depart From</p>
                <div className={`flex items-center gap-2 pb-1.5 border-b transition-colors duration-300 ${fromError ? "border-red-400" : "border-gray-200 group-hover:border-[#FD561E]"}`}>
                  <MapPin className={`w-3.5 h-3.5 sm:w-4 sm:h-4 transition-colors duration-300 flex-shrink-0 ${fromError ? "text-red-400" : "text-gray-400 group-hover:text-[#FD561E]"}`} />
                  <input type="text" placeholder="From"
                    className="w-full text-sm sm:text-base md:text-lg font-semibold outline-none bg-transparent py-1"
                    value={fromQuery}
                    onChange={(e) => { const val = e.target.value; setFromQuery(val); setFromSelected(false); setFromCity(null); setFromError(""); setSameCityError(""); searchCities(val); }} />
                </div>
                <div className="h-4 mt-0.5">{fromError && <p className="text-red-500 text-[10px] flex items-center gap-1"><span>⚠</span>{fromError}</p>}</div>
                {showFromResults && fromResults.length > 0 && (
                  <div className="absolute left-0 top-full w-full bg-white shadow-lg rounded-xl max-h-48 overflow-y-auto z-50 mt-1">
                    {fromResults.map((city) => (
                      <div key={city.sid} onClick={() => { setFromQuery(city.cityname); setFromCity(city); setFromSelected(true); setShowFromResults(false); setFromError(""); if (toCity?.sid === city.sid) setSameCityError("Departure and Destination cannot be the same"); else setSameCityError(""); }}
                        className="px-3 py-1.5 hover:bg-orange-50 cursor-pointer text-xs">{city.cityname}, {city.state}</div>
                    ))}
                  </div>
                )}
              </div>

              {/* SWAP */}
              <div className="flex justify-center items-center md:col-span-[auto] lg:col-span-1 w-auto px-0">
                <button className="p-1.5 sm:p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-all duration-500 hover:rotate-180 cursor-pointer" onClick={handleSwap}>
                  <ArrowRightLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-600" />
                </button>
              </div>

              {/* TO */}
              <div ref={toRef} className="col-span-5 md:col-span-4 lg:col-span-4 group relative">
                <p className="text-[11px] sm:text-xs text-gray-500 uppercase tracking-wide mb-1 transition-colors duration-300 group-hover:text-[#FD561E]">Going To</p>
                <div className={`flex items-center gap-2 pb-1.5 border-b transition-colors duration-300 ${toError || sameCityError ? "border-red-400" : "border-gray-200 group-hover:border-[#FD561E]"}`}>
                  <MapPin className={`w-3.5 h-3.5 sm:w-4 sm:h-4 transition-colors duration-300 flex-shrink-0 ${toError || sameCityError ? "text-red-400" : "text-gray-400 group-hover:text-[#FD561E]"}`} />
                  <input type="text" placeholder="To"
                    className="w-full text-sm sm:text-base md:text-lg font-semibold outline-none bg-transparent py-1"
                    value={toQuery}
                    onChange={(e) => { const val = e.target.value; setToQuery(val); setToSelected(false); setToCity(null); setToError(""); setSameCityError(""); searchToCities(val); }} />
                </div>
                <div className="h-4 mt-0.5">{(toError || sameCityError) && <p className="text-red-500 text-[10px] flex items-center gap-1"><span>⚠</span>{sameCityError || toError}</p>}</div>
                {showToResults && toResults.length > 0 && (
                  <div className="absolute left-0 top-full w-full bg-white shadow-lg rounded-xl max-h-48 overflow-y-auto z-50 mt-1">
                    {toResults.map((city) => (
                      <div key={city.sid} onClick={() => { setToQuery(city.cityname); setToCity(city); setToSelected(true); setShowToResults(false); setToError(""); if (fromCity?.sid === city.sid) setSameCityError("Departure and Destination cannot be the same"); else setSameCityError(""); }}
                        className="px-3 py-1.5 hover:bg-orange-50 cursor-pointer text-xs">{city.cityname}, {city.state}</div>
                    ))}
                  </div>
                )}
              </div>

              {/* DATE */}
              <div className="col-span-12 md:col-span-3 lg:col-span-3 relative group">
                <p className="text-[11px] sm:text-xs text-gray-500 uppercase tracking-wide mb-1 transition-colors duration-300 group-hover:text-[#FD561E]">Depart Date</p>
                <div onClick={() => setShowCalendar(!showCalendar)}
                  className="flex items-center gap-2 pb-1.5 border-b border-gray-200 transition-colors duration-300 group-hover:border-[#FD561E] cursor-pointer">
                  <Calendar className="text-gray-400 w-3.5 h-3.5 sm:w-4 sm:h-4 transition-colors duration-300 group-hover:text-[#FD561E] flex-shrink-0" />
                  <input type="text" value={formatDate(selectedDate)} placeholder="Select Date" readOnly
                    className="w-full text-sm sm:text-base md:text-lg font-semibold outline-none cursor-pointer bg-transparent py-1" />
                </div>
                <div className="h-4 mt-0.5" />
                {showCalendar && (
                  <div ref={calendarRef} className="absolute top-12.5 right-0 bg-white rounded-2xl shadow-2xl p-3 sm:p-4 w-[280px] sm:w-[320px] z-50">
                    <div className="flex justify-between items-center mb-3">
                      <button onClick={(e) => { e.stopPropagation(); setCurrentDate(new Date(year, currentDate.getMonth() - 1, 1)); }} className="p-1 hover:bg-gray-100 rounded"><ChevronLeft size={18} /></button>
                      <h2 className="font-semibold text-sm">{monthName} {year}</h2>
                      <button onClick={(e) => { e.stopPropagation(); setCurrentDate(new Date(year, currentDate.getMonth() + 1, 1)); }} className="p-1 hover:bg-gray-100 rounded"><ChevronRight size={18} /></button>
                    </div>
                    <div className="grid grid-cols-7 text-center text-xs text-gray-500 mb-2">
                      {["Sun","Mon","Tue","Wed","Thu","Fri","Sat"].map((d) => <div key={d}>{d}</div>)}
                    </div>
                    <div className="grid grid-cols-7 gap-0.5 text-center">
                      {[...Array(firstDay)].map((_, i) => <div key={i} />)}
                      {[...Array(daysInMonth)].map((_, idx) => {
                        const day = idx + 1;
                        const past = isPastDate(day);
                        const isSelected = selectedDate?.getDate() === day && selectedDate?.getMonth() === currentDate.getMonth();
                        return (
                          <button key={day} onClick={(e) => { e.stopPropagation(); !past && handleDateSelect(day); }} disabled={past}
                            className={`p-1 rounded-lg transition text-xs ${isSelected ? "bg-[#FD561E] text-white" : ""} ${past ? "text-gray-300 cursor-not-allowed" : "hover:bg-orange-100"}`}>
                            {day}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Special Fares - desktop */}
            <div className="mt-5 sm:mt-6 flex flex-wrap items-center gap-1.5 sm:gap-2 md:gap-3">
              <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wide text-gray-700">Special Fares</span>
              <div className="flex flex-wrap gap-1.5 sm:gap-2">
                {specialFares.map((fare) => {
                  const active = activeFare === fare.id;
                  return (
                    <button key={fare.id} onClick={() => setActiveFare(fare.id)}
                      className={`px-2 sm:px-3 py-1 rounded-lg border text-left transition-all duration-300 ${active ? "border-[#FD561E] bg-orange-50 shadow-sm" : "border-gray-200 text-gray-600 hover:border-[#FD561E] bg-white/80"}`}>
                      <span className="text-[10px] sm:text-xs font-semibold block">{fare.label}</span>
                      <span className="text-[8px] sm:text-[10px] text-gray-500">{fare.desc}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* SEARCH BUTTON */}
          <div className="absolute left-1/2 -bottom-5 sm:-bottom-6 md:-bottom-7 transform -translate-x-1/2">
            <button onClick={handleSearch}
              className="bg-gradient-to-r from-[#FD561E] to-[#ff7b4a] text-white cursor-pointer px-6 sm:px-8 md:px-14 py-1.5 sm:py-2 md:py-3 rounded-full text-xs sm:text-sm md:text-base font-semibold shadow-xl hover:scale-110 transition-all duration-300 whitespace-nowrap">
              Search
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default BookingForm;