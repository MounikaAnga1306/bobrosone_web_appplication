import { useState, useEffect, useRef } from "react";
import {
  ArrowLeftRight,
  Calendar,
  ChevronLeft,
  ChevronRight,
  ArrowLeft,
  Pencil,
  ArrowUpDown,
} from "lucide-react";
import { useLocation, useSearchParams, useNavigate } from "react-router-dom";
import { fetchCities } from "../services/apiService";

/* ─────────────────────────────────────────────
   Shared hook – all state lives here once
───────────────────────────────────────────── */
const useSearchState = (location, params) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [fromCity, setFromCity] = useState(null);
  const [toCity, setToCity] = useState(null);
  const [selectedDate, setSelectedDate] = useState(today);
  const [currentDate, setCurrentDate] = useState(today);

  useEffect(() => {
    const state = location.state || {};
    const sourceId = params.get("source");
    const destinationId = params.get("destination");

    if (state.sourceName) {
      setFrom(state.sourceName);
      setFromCity({ sid: sourceId, cityname: state.sourceName });
    } else if (sourceId) {
      setFromCity({ sid: sourceId });
    }

    if (state.destinationName) {
      setTo(state.destinationName);
      setToCity({ sid: destinationId, cityname: state.destinationName });
    } else if (destinationId) {
      setToCity({ sid: destinationId });
    }

    let date = null;
    if (state.date) date = new Date(state.date);
    else {
      const dojParam = params.get("doj");
      if (dojParam) date = new Date(dojParam);
    }
    if (date && !isNaN(date.getTime())) {
      setSelectedDate(date);
      setCurrentDate(date);
    }
  }, [location.state, params]);

  useEffect(() => {
  if (!from && !to) {
    const urlFrom = params.get("fromName");
    const urlTo = params.get("toName");
    if (urlFrom) setFrom(decodeURIComponent(urlFrom));
    if (urlTo) setTo(decodeURIComponent(urlTo));
    else {
      const storedFrom = sessionStorage.getItem("sourceName");
      const storedTo = sessionStorage.getItem("destinationName");
      if (storedFrom) setFrom(storedFrom);
      if (storedTo) setTo(storedTo);
    }
  }
}, [from, to, params]);

  const handleSwap = () => {
    setFrom(to);
    setTo(from);
    setFromCity(toCity);
    setToCity(fromCity);
  };

  return {
    from, setFrom,
    to, setTo,
    fromCity, setFromCity,
    toCity, setToCity,
    selectedDate, setSelectedDate,
    currentDate, setCurrentDate,
    today,
    handleSwap,
  };
};

/* ─────────────────────────────────────────────
   DESKTOP / TABLET  SearchBar  (unchanged logic)
───────────────────────────────────────────── */
const DesktopSearchBar = ({ state, navigate }) => {
  const {
    from, setFrom, to, setTo,
    fromCity, setFromCity,
    toCity, setToCity,
    selectedDate, setSelectedDate,
    currentDate, setCurrentDate,
    today, handleSwap,
  } = state;

  const [fromResults, setFromResults] = useState([]);
  const [toResults, setToResults] = useState([]);
  const [showFromResults, setShowFromResults] = useState(false);
  const [showToResults, setShowToResults] = useState(false);
  const [fromError, setFromError] = useState("");
  const [toError, setToError] = useState("");
  const [showCalendar, setShowCalendar] = useState(false);

  const calendarRef = useRef(null);
  const fromRef = useRef(null);
  const toRef = useRef(null);

  const handleCitySearch = async (value, type) => {
    if (value.length < 2) return;
    try {
      const data = await fetchCities(value);
      if (type === "from") { setFromResults(data || []); setShowFromResults(true); }
      else { setToResults(data || []); setShowToResults(true); }
    } catch (err) { console.error("City search error", err); }
  };

  const handleSearch = () => {
    setFromError(""); setToError("");
    if (!fromCity?.sid) { setFromError("Please select the departure city"); return; }
    if (!toCity?.sid) { setToError("Please select the destination city"); return; }
    if (fromCity.sid === toCity.sid) {
      const msg = "Departure and Destination cannot be the same";
      setFromError(msg); setToError(msg); return;
    }
    const formattedDate =
      selectedDate.getFullYear() + "-" +
      String(selectedDate.getMonth() + 1).padStart(2, "0") + "-" +
      String(selectedDate.getDate()).padStart(2, "0");

    navigate(`/results?source=${fromCity.sid}&destination=${toCity.sid}&doj=${formattedDate}`, {
      replace: true,
      state: { sourceName: from || "", destinationName: to || "", date: formattedDate },
    });
  };

  const handleDateSelect = (day) => {
    const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    if (date >= today) { setSelectedDate(date); setShowCalendar(false); }
  };

  const formatDate = (date) => date.toLocaleDateString("en-GB");

  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();
  const monthName = currentDate.toLocaleString("default", { month: "long" });
  const year = currentDate.getFullYear();
  const isPastDate = (day) => new Date(currentDate.getFullYear(), currentDate.getMonth(), day) < today;

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (calendarRef.current && !calendarRef.current.contains(e.target)) setShowCalendar(false);
      if (fromRef.current && !fromRef.current.contains(e.target)) setShowFromResults(false);
      if (toRef.current && !toRef.current.contains(e.target)) setShowToResults(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="hidden md:block w-full bg-[#f36b32] py-6 sticky top-0 z-40 shadow-sm">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr_1fr_auto] gap-3 items-end">

          {/* FROM */}
          <div className="relative" ref={fromRef}>
            <p className="text-white text-xs font-semibold mb-1">FROM</p>
            <input
              value={from}
              onChange={(e) => { setFrom(e.target.value); setFromCity(null); handleCitySearch(e.target.value, "from"); }}
              className="w-full h-12 px-4 rounded-md bg-white font-semibold text-gray-800 outline-none shadow-sm"
            />
            {fromError && <p className="absolute text-white text-xs top-[70px]">{fromError}</p>}
            {showFromResults && fromResults.length > 0 && (
              <div className="absolute top-14 left-0 w-full bg-white shadow-lg rounded-md z-50 max-h-60 overflow-y-auto">
                {fromResults.map((city) => (
                  <div key={city.sid} onClick={() => { setFrom(city.cityname); setFromCity(city); setShowFromResults(false); }}
                    className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-sm">{city.cityname}</div>
                ))}
              </div>
            )}
          </div>

          {/* SWAP */}
          <div className="flex justify-center mb-1">
            <button onClick={handleSwap} disabled={!fromCity || !toCity}
              className="bg-white w-10 h-10 rounded-full flex items-center justify-center shadow hover:scale-110 transition disabled:opacity-40">
              <ArrowLeftRight className="w-4 h-4 text-[#f36b32]" />
            </button>
          </div>

          {/* TO */}
          <div className="relative" ref={toRef}>
            <p className="text-white text-xs font-semibold mb-1">TO</p>
            <input
              value={to}
              onChange={(e) => { setTo(e.target.value); setToCity(null); handleCitySearch(e.target.value, "to"); }}
              className="w-full h-12 px-4 rounded-md bg-white font-semibold text-gray-800 outline-none shadow-sm"
            />
            {toError && <p className="absolute text-white text-xs top-[70px]">{toError}</p>}
            {showToResults && toResults.length > 0 && (
              <div className="absolute top-14 left-0 w-full bg-white shadow-lg rounded-md z-50 max-h-60 overflow-y-auto">
                {toResults.map((city) => (
                  <div key={city.sid} onClick={() => { setTo(city.cityname); setToCity(city); setShowToResults(false); }}
                    className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-sm">{city.cityname}</div>
                ))}
              </div>
            )}
          </div>

          {/* DATE */}
          <div className="relative" ref={calendarRef}>
            <p className="text-white text-xs font-semibold mb-1">DEPARTURE DATE</p>
            <div onClick={() => setShowCalendar(!showCalendar)}
              className="flex items-center gap-3 px-4 h-12 rounded-md bg-white cursor-pointer shadow-sm">
              <Calendar className="w-5 h-5 text-gray-400" />
              <span className="font-semibold text-gray-800">{formatDate(selectedDate)}</span>
            </div>
            {showCalendar && (
              <div className="absolute top-16 left-0 bg-white rounded-md shadow-xl p-4 z-50 w-72">
                <div className="flex justify-between items-center mb-3">
                  <button onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1))}><ChevronLeft size={18} /></button>
                  <span className="font-semibold">{monthName} {year}</span>
                  <button onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1))}><ChevronRight size={18} /></button>
                </div>
                <div className="grid grid-cols-7 gap-1 text-center text-sm">
                  {["Sun","Mon","Tue","Wed","Thu","Fri","Sat"].map((day) => (
                    <div key={day} className="font-semibold text-gray-500">{day}</div>
                  ))}
                  {Array.from({ length: firstDay }).map((_, i) => <div key={"empty" + i}></div>)}
                  {Array.from({ length: daysInMonth }).map((_, index) => {
                    const day = index + 1;
                    const isPast = isPastDate(day);
                    const isSelected = selectedDate.getDate() === day &&
                      selectedDate.getMonth() === currentDate.getMonth() &&
                      selectedDate.getFullYear() === currentDate.getFullYear();
                    return (
                      <div key={day} onClick={() => !isPast && handleDateSelect(day)}
                        className={`p-2 rounded cursor-pointer ${isPast ? "text-gray-300 cursor-not-allowed" : ""} ${isSelected ? "bg-[#f36b32] text-white" : "hover:bg-gray-100"}`}>
                        {day}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* SEARCH */}
          <div>
            <button onClick={handleSearch}
              className="w-[150px] h-12 bg-white text-black font-bold rounded-md shadow cursor-pointer transition-all duration-300 hover:text-[#fd561e]">
              MODIFY SEARCH
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ─────────────────────────────────────────────
   MOBILE  SearchBar  (image-2 style)
───────────────────────────────────────────── */
const MobileSearchBar = ({ state, navigate }) => {
  const {
    from, setFrom, to, setTo,
    fromCity, setFromCity,
    toCity, setToCity,
    selectedDate, setSelectedDate,
    currentDate, setCurrentDate,
    today, handleSwap,
  } = state;

  const [isOpen, setIsOpen] = useState(false);

  // which field is being edited: "from" | "to" | "date" | null
  const [activeField, setActiveField] = useState(null);

  const [fromResults, setFromResults] = useState([]);
  const [toResults, setToResults] = useState([]);
  const [showCalendar, setShowCalendar] = useState(false);
  const [fromError, setFromError] = useState("");
  const [toError, setToError] = useState("");

  const handleCitySearch = async (value, type) => {
    if (value.length < 2) return;
    try {
      const data = await fetchCities(value);
      if (type === "from") setFromResults(data || []);
      else setToResults(data || []);
    } catch (err) { console.error("City search error", err); }
  };

  const handleSearch = () => {
    setFromError(""); setToError("");
    if (!fromCity?.sid) { setFromError("Please select the departure city"); return; }
    if (!toCity?.sid) { setToError("Please select the destination city"); return; }
    if (fromCity.sid === toCity.sid) {
      const msg = "Departure and Destination cannot be the same";
      setFromError(msg); setToError(msg); return;
    }
    const formattedDate =
      selectedDate.getFullYear() + "-" +
      String(selectedDate.getMonth() + 1).padStart(2, "0") + "-" +
      String(selectedDate.getDate()).padStart(2, "0");

    navigate(`/results?source=${fromCity.sid}&destination=${toCity.sid}&doj=${formattedDate}`, {
      replace: true,
      state: { sourceName: from || "", destinationName: to || "", date: formattedDate },
    });
    setIsOpen(false);
  };

  const handleDateSelect = (day) => {
    const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    if (date >= today) { setSelectedDate(date); setShowCalendar(false); setActiveField(null); }
  };

  const isPastDate = (day) =>
    new Date(currentDate.getFullYear(), currentDate.getMonth(), day) < today;

  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();
  const monthName = currentDate.toLocaleString("default", { month: "long" });
  const year = currentDate.getFullYear();

  const formattedDateDisplay = selectedDate.toLocaleDateString("en-GB", {
    day: "2-digit", month: "short", year: "numeric",
    weekday: "short",
  }).replace(",", "").toUpperCase();

  const todayLabel = (() => {
    const t = new Date(); t.setHours(0,0,0,0);
    const tom = new Date(t); tom.setDate(t.getDate()+1);
    const sel = new Date(selectedDate); sel.setHours(0,0,0,0);
    if (sel.getTime() === t.getTime()) return "today";
    if (sel.getTime() === tom.getTime()) return "tomorrow";
    return null;
  })();

  // Collapsed pill shown in results page header (image 1 style)
  const collapsedLabel = from && to
    ? `${from} to ${to}`
    : "Select route";
  const collapsedDate = selectedDate.toLocaleDateString("en-GB", {
    day: "2-digit", month: "short", year: undefined, weekday: "short"
  });

  return (
    <>
      {/* ── Collapsed bar (always visible on mobile) ── */}
      <div className="md:hidden w-full bg-white border-b border-gray-200 sticky top-0 z-40 shadow-sm">
        <div
          className="flex items-center justify-between px-4 py-3 cursor-pointer"
          onClick={() => setIsOpen(true)}
        >
          <div className="flex items-center gap-2">
            <button className="text-gray-500 mr-1"><ArrowLeft size={18} /></button>
            <div>
              <p className="font-semibold text-sm text-gray-800">{collapsedLabel}</p>
              <p className="text-xs text-gray-500">{collapsedDate}</p>
            </div>
          </div>
          <button className="text-[#f36b32]"><Pencil size={16} /></button>
        </div>
      </div>

      {/* ── Full-screen modal / bottom sheet ── */}
      {isOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex flex-col bg-white">

          {/* Header */}
          <div className="flex items-center gap-3 px-4 py-4 border-b border-gray-100">
            <button onClick={() => setIsOpen(false)} className="text-gray-600">
              <ArrowLeft size={20} />
            </button>
            <span className="font-semibold text-gray-800">Modify Search</span>
          </div>

          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">

            {/* FROM card */}
            <div className="relative border border-gray-200 rounded-xl bg-white shadow-sm overflow-visible"
              onClick={() => { setActiveField("from"); setShowCalendar(false); }}>
              <div className="px-4 py-3">
                <p className="text-[10px] font-semibold text-gray-400 mb-1 tracking-widest">FROM</p>
                {activeField === "from" ? (
                  <input autoFocus value={from}
                    onChange={(e) => { setFrom(e.target.value); setFromCity(null); handleCitySearch(e.target.value, "from"); }}
                    className="w-full font-bold text-base text-gray-900 outline-none"
                    placeholder="Enter city" />
                ) : (
                  <p className="font-bold text-base text-gray-900">{from || <span className="text-gray-400 font-normal">Select city</span>}</p>
                )}
                {fromError && <p className="text-red-500 text-xs mt-1">{fromError}</p>}
              </div>
              {activeField === "from" && fromResults.length > 0 && (
                <div className="absolute left-0 top-full mt-1 w-full bg-white shadow-lg rounded-xl z-50 max-h-52 overflow-y-auto border border-gray-100">
                  {fromResults.map((city) => (
                    <div key={city.sid}
                      onMouseDown={(e) => { e.preventDefault(); setFrom(city.cityname); setFromCity(city); setFromResults([]); setActiveField(null); }}
                      className="px-4 py-3 hover:bg-gray-50 cursor-pointer text-sm font-medium text-gray-700 border-b last:border-0">
                      {city.cityname}
                    </div>
                  ))}
                </div>
              )}
              {/* SWAP — on right border of FROM card */}
              <div className="absolute right-10 top-18 -translate-y-1/2 translate-x-1/2 z-10">
                <button
                  onClick={(e) => { e.stopPropagation(); handleSwap(); }}
                  className="w-9 h-9 rounded-full bg-white border border-gray-300 flex items-center justify-center shadow-sm hover:bg-orange-50 hover:border-[#fd561e] transition-all duration-200">
                  <ArrowUpDown className="w-4 h-4 text-[#fd561e]" />
                </button>
              </div>
            </div>

            {/* TO card */}
            <div className="relative border border-gray-200 rounded-xl bg-white shadow-sm"
              onClick={() => { setActiveField("to"); setShowCalendar(false); }}>
              <div className="px-4 py-3">
                <p className="text-[10px] font-semibold text-gray-400 mb-1 tracking-widest">TO</p>
                {activeField === "to" ? (
                  <input autoFocus value={to}
                    onChange={(e) => { setTo(e.target.value); setToCity(null); handleCitySearch(e.target.value, "to"); }}
                    className="w-full font-bold text-base text-gray-900 outline-none"
                    placeholder="Enter city" />
                ) : (
                  <p className="font-bold text-base text-gray-900">{to || <span className="text-gray-400 font-normal">Select city</span>}</p>
                )}
                {toError && <p className="text-red-500 text-xs mt-1">{toError}</p>}
              </div>
              {activeField === "to" && toResults.length > 0 && (
                <div className="absolute left-0 top-full mt-1 w-full bg-white shadow-lg rounded-xl z-50 max-h-52 overflow-y-auto border border-gray-100">
                  {toResults.map((city) => (
                    <div key={city.sid}
                      onMouseDown={(e) => { e.preventDefault(); setTo(city.cityname); setToCity(city); setToResults([]); setActiveField(null); }}
                      className="px-4 py-3 hover:bg-gray-50 cursor-pointer text-sm font-medium text-gray-700 border-b last:border-0">
                      {city.cityname}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* DATE field */}
            <div
              className="border border-gray-200 rounded-xl px-4 py-3 bg-white shadow-sm"
              onClick={() => { setShowCalendar(!showCalendar); setActiveField(null); }}
            >
              <p className="text-[10px] font-semibold text-gray-400 mb-1 tracking-widest">DATE</p>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-gray-400" />
                  <span className="font-bold text-base text-gray-900">{formattedDateDisplay}</span>
                </div>
                <div className="flex gap-2">
                  {/* Today / Tomorrow quick select */}
                  {(() => {
                    const t = new Date(); t.setHours(0,0,0,0);
                    const tom = new Date(t); tom.setDate(t.getDate()+1);
                    return (
                      <>
                        <button
                          onMouseDown={(e) => { e.stopPropagation(); setSelectedDate(new Date(t)); setCurrentDate(new Date(t)); setShowCalendar(false); }}
                          className={`text-xs px-3 py-1 rounded-full border font-medium transition ${todayLabel === "today" ? "bg-[#fd561e] text-white border-[#fd561e]" : "border-gray-300 text-gray-600 hover:border-[#fd561e]"}`}
                        >Today</button>
                        <button
                          onMouseDown={(e) => { e.stopPropagation(); setSelectedDate(new Date(tom)); setCurrentDate(new Date(tom)); setShowCalendar(false); }}
                          className={`text-xs px-3 py-1 rounded-full border font-medium transition ${todayLabel === "tomorrow" ? "bg-[#fd561e] text-white border-[#fd561e]" : "border-gray-300 text-gray-600 hover:border-[#fd561e]"}`}
                        >Tomorrow</button>
                      </>
                    );
                  })()}
                </div>
              </div>
            </div>

            {/* Inline calendar */}
            {showCalendar && (
              <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
                <div className="flex justify-between items-center mb-3">
                  <button onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1))}>
                    <ChevronLeft size={18} />
                  </button>
                  <span className="font-semibold">{monthName} {year}</span>
                  <button onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1))}>
                    <ChevronRight size={18} />
                  </button>
                </div>
                <div className="grid grid-cols-7 gap-1 text-center text-sm">
                  {["Su","Mo","Tu","We","Th","Fr","Sa"].map((d) => (
                    <div key={d} className="font-semibold text-gray-400 text-xs pb-1">{d}</div>
                  ))}
                  {Array.from({ length: firstDay }).map((_, i) => <div key={"e"+i} />)}
                  {Array.from({ length: daysInMonth }).map((_, idx) => {
                    const day = idx + 1;
                    const isPast = isPastDate(day);
                    const isSelected =
                      selectedDate.getDate() === day &&
                      selectedDate.getMonth() === currentDate.getMonth() &&
                      selectedDate.getFullYear() === currentDate.getFullYear();
                    return (
                      <div key={day} onClick={() => !isPast && handleDateSelect(day)}
                        className={`py-2 rounded-lg text-sm cursor-pointer
                          ${isPast ? "text-gray-300 cursor-not-allowed" : ""}
                          ${isSelected ? "bg-[#f36b32] text-white font-bold" : !isPast ? "hover:bg-orange-50" : ""}`}>
                        {day}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* MODIFY SEARCH button — sticky bottom */}
          <div className="px-4 pt-2 pb-4 border-t border-gray-100 bg-white">
            <button
              onClick={handleSearch}
              className="w-full h-14 bg-[#fd561e] hover:bg-[#f36b32] active:scale-[0.98] text-white font-bold text-base rounded-xl shadow transition-all duration-200 tracking-wide"
            >
              MODIFY SEARCH
            </button>
          </div>
        </div>
      )}
    </>
  );
};

/* ─────────────────────────────────────────────
   MAIN export  –  renders both, CSS handles which shows
───────────────────────────────────────────── */
const SearchBar = () => {
  const location = useLocation();
  const [params] = useSearchParams();
  const navigate = useNavigate();

  const state = useSearchState(location, params);

  return (
    <>
      <DesktopSearchBar state={state} navigate={navigate} />
      <MobileSearchBar state={state} navigate={navigate} />
    </>
  );
};

export default SearchBar;