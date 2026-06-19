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

const tabRoutes = {
  bus: "/",
  billpayments: "/BillHomePage",
  flights: "/flights",
  hotels: "/hotels",
  holidays: "/Holiday",
  cabs: "/cabs",
};

const backgroundImages = [

  "/assets/closed_bus.png",
 
];

const heroSlides = [
  { title: "Travel Smart, Travel Comfortable", subtitle: "Travel across hundreds of routes at the best prices with BOBROS" },
  { title: "Your Journey, Your Comfort", subtitle: "Spacious seats and smooth rides on every BOBROS trip" },
  { title: "Book in Seconds, Travel for Hours", subtitle: "Fast booking, reliable buses, and unbeatable fares" },
  { title: "Adventure Awaits Around Every Bend", subtitle: "Discover new destinations the comfortable way with BOBROS" },
  { title: "Safe Rides, Happy Journeys", subtitle: "Trusted buses and verified operators on every single trip" },
  { title: "Go Further for Less", subtitle: "Best prices on hundreds of routes, only with BOBROS" },
];

const BookingForm = () => {
  const [activeTab, setActiveTab] = useState("bus");
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
  const [baseIndex, setBaseIndex] = useState(0);
  const [fadingIndex, setFadingIndex] = useState(null);
  const [fadeIn, setFadeIn] = useState(false);
  const currentIndexRef = useRef(0);
  const intervalRef = useRef(null);
  const commitRef = useRef(null);
  const displayIndex = fadingIndex !== null ? fadingIndex : baseIndex;
  const navigate = useNavigate();

  useEffect(() => {
    backgroundImages.forEach((src) => { const img = new Image(); img.src = src; });
  }, []);

  const transitionTo = (newIndex, attempts = 0) => {
    const len = backgroundImages.length;
    if (newIndex === currentIndexRef.current) return;
    if (attempts >= len) return;
    const img = new Image();
    let settled = false;
    const startCrossfade = () => {
      if (settled) return;
      settled = true;
      currentIndexRef.current = newIndex;
      setFadingIndex(newIndex);
      setFadeIn(false);
      requestAnimationFrame(() => { requestAnimationFrame(() => setFadeIn(true)); });
      if (commitRef.current) clearTimeout(commitRef.current);
      commitRef.current = setTimeout(() => { setBaseIndex(newIndex); setFadingIndex(null); setFadeIn(false); }, 1000);
    };
    const skipBroken = () => {
      if (settled) return;
      settled = true;
      currentIndexRef.current = newIndex;
      transitionTo((newIndex + 1) % len, attempts + 1);
    };
    img.onload = startCrossfade;
    img.onerror = skipBroken;
    img.src = backgroundImages[newIndex];
    if (img.complete) { if (img.naturalWidth > 0) startCrossfade(); else skipBroken(); }
  };

  const changeBackground = (direction) => {
    const len = backgroundImages.length;
    const cur = currentIndexRef.current;
    const next = direction === "prev" ? (cur - 1 + len) % len : (cur + 1) % len;
    transitionTo(next);
    startAutoRotation();
  };

  const startAutoRotation = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      transitionTo((currentIndexRef.current + 1) % backgroundImages.length);
    }, 5000);
  };

  useEffect(() => {
    startAutoRotation();
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (commitRef.current) clearTimeout(commitRef.current);
    };
  }, []);

  const handleSearch = () => {
    setFromError(""); setToError(""); setSameCityError("");
    let isValid = true;
    if (!fromCity || !fromCity.sid) { setFromError("Please select departure city"); isValid = false; }
    if (!toCity || !toCity.sid) { setToError("Please select destination city"); isValid = false; }
    if (fromCity?.sid && toCity?.sid && fromCity.sid === toCity.sid) { setSameCityError("Departure and Destination cannot be the same"); isValid = false; }
    if (!isValid) return;
    const formattedDate = selectedDate.getFullYear() + "-" + String(selectedDate.getMonth() + 1).padStart(2, "0") + "-" + String(selectedDate.getDate()).padStart(2, "0");
    navigate(`/results?source=${fromCity.sid}&destination=${toCity.sid}&doj=${formattedDate}`, {
      state: { sourceName: fromCity.cityname, destinationName: toCity.cityname, date: selectedDate },
    });
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (calendarRef.current && !calendarRef.current.contains(event.target)) setShowCalendar(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (fromRef.current && !fromRef.current.contains(event.target)) { setShowFromResults(false); if (!fromSelected) setFromQuery(""); }
      if (toRef.current && !toRef.current.contains(event.target)) { setShowToResults(false); if (!toSelected) setToQuery(""); }
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, [fromSelected, toSelected]);

  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();
  const monthName = currentDate.toLocaleString("default", { month: "long" });
  const year = currentDate.getFullYear();

  const handleDateSelect = (day) => {
    setSelectedDate(new Date(currentDate.getFullYear(), currentDate.getMonth(), day));
    setShowCalendar(false);
  };

  const formatDate = (date) => date ? date.toLocaleDateString("en-GB") : "";

  const searchCities = async (value) => {
    if (!value || value.length < 2) { setFromResults([]); return; }
    clearTimeout(fromDebounce.current);
    fromDebounce.current = setTimeout(async () => {
      try { const data = await fetchCities(value); setFromResults(data || []); setShowFromResults(true); }
      catch (err) { console.error("From City search failed", err); }
    }, 400);
  };

  const searchToCities = async (value) => {
    if (!value || value.length < 2) { setToResults([]); return; }
    clearTimeout(toDebounce.current);
    toDebounce.current = setTimeout(async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/cities?name=${value}`);
        const data = await res.json();
        setToResults(data || []); setShowToResults(true);
      } catch (err) { console.error("To City search failed", err); }
    }, 400);
  };

  const handleSwap = () => {
    const nF = toCity, nT = fromCity, nFQ = toQuery, nTQ = fromQuery;
    setFromCity(nF); setToCity(nT); setFromQuery(nFQ); setToQuery(nTQ);
    setFromSelected(!!nF); setToSelected(!!nT);
    setFromError(""); setToError(""); setSameCityError("");
  };

  const isPastDate = (d) => {
    const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), d);
    const today = new Date(); today.setHours(0, 0, 0, 0);
    return date < today;
  };

  const CityRow = ({ city, onClick, isMobile }) => (
    <div onClick={onClick} className={`bf-animate-item flex items-center gap-3 hover:bg-orange-50 cursor-pointer border-b last:border-0 border-gray-100 transition-all duration-200 group ${isMobile ? "px-3 py-2.5" : "px-4 py-3"}`}>
      <MapPin className={`flex-shrink-0 text-gray-300 group-hover:text-[#FD561E] transition-colors duration-200 ${isMobile ? "w-3.5 h-3.5" : "w-4 h-4"}`} />
      <div className="min-w-0">
        <p className="text-sm font-bold text-gray-800 leading-tight truncate">{city.cityname}</p>
        {(city.state || city.statename || city.stateName) && (
          <p className="text-xs text-gray-400 mt-0.5 truncate">{city.state || city.statename || city.stateName}</p>
        )}
      </div>
    </div>
  );

  // ── GLASS FORM STYLES ──
  // Bright acrylic glass: higher opacity, lower blur, soft white edges
  const glassFormStyle = {
    overflow: 'visible',
    background:
      'radial-gradient(circle at 50% 45%, rgba(255,255,255,0.24) 0%, rgba(255,255,255,0.30) 55%, rgba(255,255,255,0.46) 78%, rgba(255,255,255,0.68) 92%, rgba(255,255,255,0.48) 100%)',
    backdropFilter: 'blur(9px) saturate(1.15)',
    WebkitBackdropFilter: 'blur(9px) saturate(1.15)',
    border: '1px solid rgba(255,255,255,0.78)',
    boxShadow:
      '0 18px 40px -8px rgba(0,0,0,0.25), inset 0 2px 4px rgba(255,255,255,0.65), inset 0 -3px 6px rgba(90,70,60,0.08)',
  };

  return (
    <section className="relative min-h-[550px] md:min-h-[480px] lg:min-h-[590px] flex items-center justify-center py-8 md:py-0">
      <style>{`
        @keyframes bf-fade-up  { from { opacity:0; transform:translateY(18px); } to { opacity:1; transform:translateY(0); } }
        @keyframes bf-fade-in  { from { opacity:0; } to { opacity:1; } }
        @keyframes bf-dropdown { from { opacity:0; transform:translateY(-8px) scale(0.98); } to { opacity:1; transform:translateY(0) scale(1); } }
        @keyframes bf-pop      { 0%{opacity:0;transform:scale(0.92) translateY(-6px);} 60%{transform:scale(1.015) translateY(0);} 100%{opacity:1;transform:scale(1) translateY(0);} }
        @keyframes bf-item     { from { opacity:0; transform:translateX(-6px); } to { opacity:1; transform:translateX(0); } }
        @keyframes bf-shine    { 0%{transform:translateX(-160%) skewX(-20deg);} 100%{transform:translateX(280%) skewX(-20deg);} }
        @keyframes bf-glow     { 0%,100%{box-shadow:0 10px 25px -6px rgba(253,86,30,0.45);} 50%{box-shadow:0 16px 36px -6px rgba(253,86,30,0.7);} }
        .bf-animate-fade-up  { animation: bf-fade-up  0.7s cubic-bezier(0.16,1,0.3,1) both; }
        .bf-animate-fade-in  { animation: bf-fade-in  0.7s ease both; }
        .bf-animate-dropdown { animation: bf-dropdown 0.26s cubic-bezier(0.16,1,0.3,1) both; transform-origin:top center; }
        .bf-animate-pop      { animation: bf-pop      0.32s cubic-bezier(0.34,1.56,0.64,1) both; }
        .bf-animate-item     { animation: bf-item     0.3s ease both; }
        .bf-search { animation: bf-glow 2.8s ease-in-out infinite; }
        .bf-search .bf-shine { position:absolute;top:0;left:0;height:100%;width:55%;background:linear-gradient(120deg,transparent,rgba(255,255,255,0.55),transparent);transform:translateX(-160%) skewX(-20deg);pointer-events:none; }
        .bf-search:hover .bf-shine { animation: bf-shine 0.9s ease; }
        @media (prefers-reduced-motion:reduce) { .bf-animate-fade-up,.bf-animate-fade-in,.bf-animate-dropdown,.bf-animate-pop,.bf-animate-item,.bf-search{animation:none!important;} }
      `}</style>

      {/* ── BACKGROUND CAROUSEL ── */}
      <div className="absolute inset-0 w-full h-full overflow-hidden" style={{ backgroundColor: "#0f172a" }}>
        <div className="absolute inset-0 w-full h-full" style={{ backgroundImage:`url(${backgroundImages[baseIndex]})`, backgroundSize:'cover', backgroundPosition:'center' }} />
        {fadingIndex !== null && (
          <div className="absolute inset-0 w-full h-full transition-opacity duration-1000 ease-in-out"
            style={{ backgroundImage:`url(${backgroundImages[fadingIndex]})`, backgroundSize:'cover', backgroundPosition:'center', opacity: fadeIn ? 1 : 0 }} />
        )}
      </div>
      <div className="absolute inset-0 bg-gradient-to-b from-black/35 via-black/10 to-transparent pointer-events-none" />

      {/* Carousel Arrows */}
      <button onClick={() => changeBackground('prev')} aria-label="Previous image"
        className="absolute left-4 md:left-8 z-20 bg-white/20 hover:bg-white/40 backdrop-blur-sm p-2 rounded-full text-white transition-all duration-300 hover:scale-110 active:scale-95">
        <ChevronLeft size={24} />
      </button>
      <button onClick={() => changeBackground('next')} aria-label="Next image"
        className="absolute right-4 md:right-8 z-20 bg-white/20 hover:bg-white/40 backdrop-blur-sm p-2 rounded-full text-white transition-all duration-300 hover:scale-110 active:scale-95">
        <ChevronRight size={24} />
      </button>

      <div className="relative z-10 w-full max-w-6xl px-4 sm:px-6">
        {/* Hero Text */}
        <div key={displayIndex} className="text-center mb-4 sm:mb-6 md:mb-8 text-white">
          <h1 className="bf-animate-fade-up text-xl sm:text-2xl md:text-4xl lg:text-5xl font-bold mt-6 md:-mt-6 drop-shadow-md">
            {heroSlides[displayIndex].title}
          </h1>
          <p className="bf-animate-fade-up text-xs sm:text-sm md:text-lg opacity-90 mt-1 sm:mt-2 drop-shadow" style={{ animationDelay:'0.12s' }}>
            {heroSlides[displayIndex].subtitle}
          </p>
        </div>

        {/* ══════════════════════════════════════
            FROSTED GLASS FORM (bright acrylic style)
        ══════════════════════════════════════ */}
        <div className="bf-animate-fade-up relative rounded-2xl sm:rounded-3xl p-3 sm:p-4 md:p-6 lg:p-8" style={glassFormStyle}>

          {/* ── GLASS HIGHLIGHT LAYERS (droplet-style) ── */}

          {/* Specular highlight streak — top-left curved shine */}
          <div className="absolute pointer-events-none" style={{
            zIndex:1, width:'46%', height:'14%', top:'5%', left:'10%',
            borderRadius:'999px',
            background:'linear-gradient(to bottom, rgba(255,255,255,0.35), rgba(255,255,255,0))',
            filter:'blur(6px)',
            transform:'rotate(-6deg)',
          }} />

          {/* Top edge bright glow line */}
          <div className="absolute pointer-events-none" style={{
            zIndex:1, top:0, left:'8%', right:'8%', height:'2px',
            background:'linear-gradient(90deg, transparent, rgba(255,255,255,0.55), transparent)',
            filter:'blur(1px)', borderRadius:'999px',
          }} />

          {/* Warm ambient glow — bottom-right, echoes brand color */}
          <div className="absolute inset-0 rounded-2xl sm:rounded-3xl pointer-events-none" style={{
            zIndex:1,
            background:'radial-gradient(ellipse at 80% 85%, rgba(253,86,30,0.08) 0%, rgba(253,86,30,0) 60%)',
            filter:'blur(8px)',
          }} />

          {/* ── ALL FORM CONTENT (zIndex 2+) ── */}

          {/* TABS */}
          <div className="relative flex flex-nowrap md:flex-wrap items-center justify-between md:justify-start gap-1.5 sm:gap-2 md:gap-3 mb-6 md:mb-8" style={{ zIndex:2 }}>
            {tabs.map((tab, i) => {
              const Icon = tab.icon;
              const active = activeTab === tab.id;
              return (
                <button key={tab.id}
                  onClick={() => { setActiveTab(tab.id); navigate(tabRoutes[tab.id]); }}
                  title={tab.label} aria-label={tab.label}
                  style={{ animationDelay:`${i * 55}ms` }}
                  className={`bf-animate-fade-in flex-1 md:flex-none flex items-center justify-center gap-0 md:gap-2 py-2 px-2.5 md:px-3 lg:px-4 xl:px-5 md:py-2 xl:py-2.5 cursor-pointer rounded-xl md:rounded-full text-[11px] md:text-sm font-semibold transition-all duration-300 border hover:-translate-y-0.5 active:scale-95 ${
                    active
                      ? "bg-gradient-to-r from-[#FD561E] to-[#ff7b4a] text-white border-transparent shadow-lg md:scale-105"
                      : "border-gray-300/60 text-gray-700 hover:border-[#FD561E] hover:text-[#FD561E] bg-white/80 backdrop-blur-md"
                  }`}>
                  <Icon className="w-6 h-6 md:w-4 md:h-4 flex-shrink-0" />
                  <span className="hidden md:inline">{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* ── MOBILE FORM ── */}
          <div className="md:hidden space-y-0 relative" style={{ zIndex:2 }}>
            {/* FROM */}
            <div className="relative border border-white/30 rounded-xl bg-white/20" style={{ overflow:'visible' }}>
              <div ref={fromRef} className="relative px-3 pt-3 pb-2 pr-10">
                <p className="text-[10px] text-black font-semibold uppercase tracking-widest mb-1 drop-shadow-sm">Depart From</p>
                <div className={`flex items-center gap-2 pb-1 border-b ${fromError ? "border-red-400" : "border-white/40"}`}>
                  <MapPin className={`w-3.5 h-3.5 flex-shrink-0 ${fromError ? "text-red-400" : "text-black"}`} />
                  <input type="text" placeholder="From"
                    className="w-full text-sm font-bold outline-none bg-transparent py-0.5 text-black placeholder-black drop-shadow-sm"
                    value={fromQuery}
                    onChange={(e) => { const v=e.target.value; setFromQuery(v); setFromSelected(false); setFromCity(null); setFromError(""); setSameCityError(""); searchCities(v); }} />
                </div>
                {fromError && <p className="text-red-500 text-[10px] mt-0.5 flex items-center gap-1"><span>⚠</span>{fromError}</p>}
                {showFromResults && fromResults.length > 0 && (
                  <div className="bf-animate-dropdown absolute left-0 top-full w-full bg-white shadow-xl rounded-xl z-50 mt-1 border border-gray-100" style={{ overflow:"hidden", zIndex:200 }}>
                    {fromResults.map((city) => (
                      <CityRow key={city.sid} city={city} isMobile
                        onClick={() => { setFromQuery(city.cityname); setFromCity(city); setFromSelected(true); setShowFromResults(false); setFromError(""); if (toCity?.sid===city.sid) setSameCityError("Departure and Destination cannot be the same"); else setSameCityError(""); }} />
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* TO */}
            <div className="relative mt-2 border border-white/30 rounded-xl bg-white/20" style={{ overflow:'visible' }}>
              <div className="mx-3 border-t border-dashed border-gray-300/50" />
              <div ref={toRef} className="relative px-3 pt-2 pb-3 pr-10">
                <p className="text-[10px] text-black font-semibold uppercase tracking-widest mb-1 drop-shadow-sm">Going To</p>
                <div className={`flex items-center gap-2 pb-1 border-b ${toError||sameCityError ? "border-red-400" : "border-white/40"}`}>
                  <MapPin className={`w-3.5 h-3.5 flex-shrink-0 ${toError||sameCityError ? "text-red-400" : "text-black"}`} />
                  <input type="text" placeholder="To"
                    className="w-full text-sm font-bold outline-none bg-transparent py-0.5 text-black placeholder-white/70 drop-shadow-sm"
                    value={toQuery}
                    onChange={(e) => { const v=e.target.value; setToQuery(v); setToSelected(false); setToCity(null); setToError(""); setSameCityError(""); searchToCities(v); }} />
                </div>
                {(toError||sameCityError) && <p className="text-red-500 text-[10px] mt-0.5 flex items-center gap-1"><span>⚠</span>{sameCityError||toError}</p>}
                {showToResults && toResults.length > 0 && (
                  <div className="bf-animate-dropdown absolute left-0 top-full w-full bg-white shadow-xl rounded-xl z-50 mt-1 border border-gray-100" style={{ overflow:"hidden", zIndex:200 }}>
                    {toResults.map((city) => (
                      <CityRow key={city.sid} city={city} isMobile
                        onClick={() => { setToQuery(city.cityname); setToCity(city); setToSelected(true); setShowToResults(false); setToError(""); if (fromCity?.sid===city.sid) setSameCityError("Departure and Destination cannot be the same"); else setSameCityError(""); }} />
                    ))}
                  </div>
                )}
              </div>
              <div className="absolute right-8 -top-2 -translate-y-1/2 translate-x-1/2 z-10">
                <button onClick={handleSwap}
                  className="w-8 h-8 rounded-full bg-white border border-gray-300 flex items-center justify-center shadow-sm hover:bg-orange-50 hover:border-[#FD561E] hover:rotate-180 active:scale-90 transition-all duration-300">
                  <ArrowRightLeft className="w-3.5 h-3.5 text-gray-500 rotate-90" />
                </button>
              </div>
            </div>

            {/* DATE mobile */}
            <div className="relative mt-3 border border-white/30 rounded-xl px-3 py-3 bg-white/20" style={{ overflow:'visible' }}>
              <p className="text-[10px] text-black font-semibold uppercase tracking-widest mb-1 drop-shadow-sm">Travel Date</p>
              <div onClick={() => setShowCalendar(!showCalendar)} className="flex items-center gap-2 cursor-pointer">
                <Calendar className="w-3.5 h-3.5 text-black flex-shrink-0" />
                <span className="text-sm font-bold text-white drop-shadow-sm">{formatDate(selectedDate)}</span>
              </div>
              {showCalendar && (
                <div ref={calendarRef} onMouseDown={(e) => e.stopPropagation()}
                  className="bf-animate-pop absolute left-0 right-0 bg-white rounded-2xl shadow-2xl z-50 mt-2 border border-gray-100" style={{ padding:"16px", zIndex:200 }}>
                  <div className="flex justify-between items-center mb-4">
                    {(() => { const today=new Date(); const dis=currentDate.getFullYear()===today.getFullYear()&&currentDate.getMonth()===today.getMonth(); return (
                      <button onClick={() => !dis&&setCurrentDate(new Date(year,currentDate.getMonth()-1,1))} disabled={dis}
                        className={`p-1.5 rounded-lg transition-colors ${dis?"text-gray-200 cursor-not-allowed":"hover:bg-gray-100 text-gray-600"}`}><ChevronLeft size={20}/></button>
                    ); })()}
                    <h2 className="font-bold text-base text-gray-800">{monthName} {year}</h2>
                    <button onClick={() => setCurrentDate(new Date(year,currentDate.getMonth()+1,1))} className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors text-gray-600"><ChevronRight size={20}/></button>
                  </div>
                  <div className="grid grid-cols-7 text-center text-xs font-semibold text-gray-400 mb-2">
                    {["Su","Mo","Tu","We","Th","Fr","Sa"].map((d) => <div key={d} className="py-1">{d}</div>)}
                  </div>
                  <div className="grid grid-cols-7 gap-1 text-center">
                    {[...Array(firstDay)].map((_,i) => <div key={i}/>)}
                    {[...Array(daysInMonth)].map((_,idx) => {
                      const day=idx+1; const past=isPastDate(day);
                      const isSel=selectedDate?.getDate()===day&&selectedDate?.getMonth()===currentDate.getMonth();
                      return (
                        <button key={day} onClick={() => !past&&handleDateSelect(day)} disabled={past}
                          className={`py-2 rounded-lg transition-all duration-200 text-sm font-medium ${isSel?"bg-[#FD561E] text-white shadow-md":""} ${past?"text-gray-300 cursor-not-allowed":"hover:bg-orange-100 hover:scale-110 active:scale-95 text-gray-700"}`}>
                          {day}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* ── DESKTOP FORM ── */}
          <div className="hidden md:block relative" style={{ zIndex:10, overflow:'visible' }}>
            <div className="grid grid-cols-12 gap-2">

              {/* FROM */}
              <div ref={fromRef} className="col-span-4 group relative" style={{ overflow:'visible' }}>
                <p className="text-xs text-black font-semibold uppercase tracking-wide mb-1 transition-colors duration-300 group-hover:text-[#FD561E] drop-shadow-sm">Depart From</p>
                <div className={`flex items-center gap-2 pb-1.5 border-b transition-colors duration-300 ${fromError?"border-red-400":"border-white/40 group-hover:border-[#FD561E] focus-within:border-[#FD561E]"}`}>
                  <MapPin className={`w-4 h-4 transition-colors duration-300 flex-shrink-0 ${fromError?"text-red-400":"text-black group-hover:text-[#FD561E]"}`} />
                  <input type="text" placeholder="From"
                    className="w-full text-xl font-bold outline-none bg-transparent py-1 text-black placeholder-black drop-shadow-sm"
                    value={fromQuery}
                    onChange={(e) => { const v=e.target.value; setFromQuery(v); setFromSelected(false); setFromCity(null); setFromError(""); setSameCityError(""); searchCities(v); }} />
                </div>
                <div className="h-4 mt-0.5">{fromError&&<p className="text-red-500 text-[10px] flex items-center gap-1"><span>⚠</span>{fromError}</p>}</div>
                {showFromResults && fromResults.length > 0 && (
                  <div className="bf-animate-dropdown absolute left-0 top-full w-full bg-white shadow-xl rounded-xl z-50 mt-1 border border-gray-100" style={{ overflow:"hidden", zIndex:200 }}>
                    {fromResults.map((city) => (
                      <CityRow key={city.sid} city={city}
                        onClick={() => { setFromQuery(city.cityname); setFromCity(city); setFromSelected(true); setShowFromResults(false); setFromError(""); if (toCity?.sid===city.sid) setSameCityError("Departure and Destination cannot be the same"); else setSameCityError(""); }} />
                    ))}
                  </div>
                )}
              </div>

              {/* SWAP */}
              <div className="col-span-1 flex justify-center items-center">
                <button onClick={handleSwap}
                  className="p-2 rounded-full bg-white/70 hover:bg-white transition-all duration-500 hover:rotate-180 active:scale-90 cursor-pointer shadow-sm border border-white/50">
                  <ArrowRightLeft className="w-4 h-4 text-gray-600" />
                </button>
              </div>

              {/* TO */}
              <div ref={toRef} className="col-span-4 group relative" style={{ overflow:'visible' }}>
                <p className="text-xs text-black font-semibold uppercase tracking-wide mb-1 transition-colors duration-300 group-hover:text-[#FD561E] drop-shadow-sm">Going To</p>
                <div className={`flex items-center gap-2 pb-1.5 border-b transition-colors duration-300 ${toError||sameCityError?"border-red-400":"border-white/40 group-hover:border-[#FD561E] focus-within:border-[#FD561E]"}`}>
                  <MapPin className={`w-4 h-4 transition-colors duration-300 flex-shrink-0 ${toError||sameCityError?"text-red-400":"text-black group-hover:text-[#FD561E]"}`} />
                  <input type="text" placeholder="To"
                    className="w-full text-xl font-bold outline-none bg-transparent py-1 text-black placeholder-black drop-shadow-sm"
                    value={toQuery}
                    onChange={(e) => { const v=e.target.value; setToQuery(v); setToSelected(false); setToCity(null); setToError(""); setSameCityError(""); searchToCities(v); }} />
                </div>
                <div className="h-4 mt-0.5">{(toError||sameCityError)&&<p className="text-red-500 text-[10px] flex items-center gap-1"><span>⚠</span>{sameCityError||toError}</p>}</div>
                {showToResults && toResults.length > 0 && (
                  <div className="bf-animate-dropdown absolute left-0 top-full w-full bg-white shadow-xl rounded-xl z-50 mt-1 border border-gray-100" style={{ overflow:"hidden", zIndex:200 }}>
                    {toResults.map((city) => (
                      <CityRow key={city.sid} city={city}
                        onClick={() => { setToQuery(city.cityname); setToCity(city); setToSelected(true); setShowToResults(false); setToError(""); if (fromCity?.sid===city.sid) setSameCityError("Departure and Destination cannot be the same"); else setSameCityError(""); }} />
                    ))}
                  </div>
                )}
              </div>

              {/* DATE */}
              <div className="col-span-3 group relative" style={{ overflow:'visible' }}>
                <p className="text-xs text-black font-semibold uppercase tracking-wide mb-1 transition-colors duration-300 group-hover:text-[#FD561E] drop-shadow-sm">Travel Date</p>
                <div onClick={() => setShowCalendar(!showCalendar)}
                  className="flex items-center gap-2 pb-1.5 border-b border-white/40 transition-colors duration-300 group-hover:border-[#FD561E] cursor-pointer">
                  <Calendar className="text-black w-4 h-4 transition-colors duration-300 group-hover:text-[#FD561E] flex-shrink-0" />
                  <input type="text" value={formatDate(selectedDate)} placeholder="Select Date" readOnly
                    className="w-full text-lg font-bold outline-none cursor-pointer bg-transparent py-1 text-black placeholder-white/70 drop-shadow-sm" />
                </div>
                <div className="h-4 mt-0.5" />
                {showCalendar && (
                  <div ref={calendarRef}
                    className="bf-animate-pop absolute top-full right-0 bg-white rounded-2xl shadow-2xl z-50 mt-2 border border-gray-100" 
                    style={{ width:'340px', padding:'20px', transformOrigin:'top right', zIndex:200 }}>
                    <div className="flex justify-between items-center mb-4">
                      {(() => { const today=new Date(); const dis=currentDate.getFullYear()===today.getFullYear()&&currentDate.getMonth()===today.getMonth(); return (
                        <button onClick={(e) => { e.stopPropagation(); if(!dis) setCurrentDate(new Date(year,currentDate.getMonth()-1,1)); }} disabled={dis}
                          className={`p-1.5 rounded-lg transition-colors ${dis?"text-gray-200 cursor-not-allowed":"hover:bg-gray-100 text-gray-600"}`}><ChevronLeft size={20}/></button>
                      ); })()}
                      <h2 className="font-bold text-base text-gray-800">{monthName} {year}</h2>
                      <button onClick={(e) => { e.stopPropagation(); setCurrentDate(new Date(year,currentDate.getMonth()+1,1)); }} className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors text-gray-600"><ChevronRight size={20}/></button>
                    </div>
                    <div className="grid grid-cols-7 text-center text-xs font-semibold text-gray-400 mb-3">
                      {["Su","Mo","Tu","We","Th","Fr","Sa"].map((d) => <div key={d} className="py-1">{d}</div>)}
                    </div>
                    <div className="grid grid-cols-7 gap-1 text-center">
                      {[...Array(firstDay)].map((_,i) => <div key={i}/>)}
                      {[...Array(daysInMonth)].map((_,idx) => {
                        const day=idx+1; const past=isPastDate(day);
                        const isSel=selectedDate?.getDate()===day&&selectedDate?.getMonth()===currentDate.getMonth();
                        return (
                          <button key={day} onClick={(e) => { e.stopPropagation(); !past&&handleDateSelect(day); }} disabled={past}
                            className={`py-2 rounded-lg transition-all duration-200 text-sm font-medium ${isSel?"bg-[#FD561E] text-white shadow-md":""} ${past?"text-gray-300 cursor-not-allowed":"hover:bg-orange-100 hover:scale-110 active:scale-95 text-gray-700"}`}>
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

          {/* SEARCH BUTTON */}
          <div className="absolute left-1/2 -bottom-5 sm:-bottom-6 md:-bottom-7 transform -translate-x-1/2" style={{ zIndex:2 }}>
            <button onClick={handleSearch}
              className="bf-search relative overflow-hidden bg-gradient-to-r from-[#FD561E] to-[#ff7b4a] text-white cursor-pointer px-6 sm:px-8 md:px-14 py-1.5 sm:py-2 md:py-3 rounded-full text-xs sm:text-sm md:text-base font-semibold shadow-xl hover:scale-110 active:scale-100 transition-transform duration-300 whitespace-nowrap">
              <span className="relative z-10">Search</span>
              <span className="bf-shine" aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default BookingForm;