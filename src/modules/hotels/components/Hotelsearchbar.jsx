// src/modules/hotels/components/HotelSearchBar.jsx
import { useState, useEffect, useRef, useCallback } from "react";
import {
  FaMapMarkerAlt, FaCalendarAlt, FaUser,
  FaChevronDown, FaTimes,
} from "react-icons/fa";
import { ArrowLeft, Plus, Minus } from "lucide-react";
import ReactDOM from "react-dom";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

/* ─── Photon autocomplete ─────────────────────────────────────────────── */
const fetchPhoton = async (query, signal) => {
  try {
    const res = await fetch(
      `https://photon.komoot.io/api/?q=${encodeURIComponent(query)}&limit=6&lang=en`,
      { signal }
    );
    if (!res.ok) return [];
    const data = await res.json();
    return (data.features || []).map((f) => {
      const p   = f.properties;
      const name = p.name || "";
      const sub  = [p.city || p.county, p.state, p.country].filter(Boolean).join(", ");
      return {
        label: sub ? `${name}, ${sub}` : name,
        lat:   f.geometry.coordinates[1],
        lng:   f.geometry.coordinates[0],
      };
    });
  } catch { return []; }
};

/* ─── helpers ─────────────────────────────────────────────────────────── */
const toISO = (d) =>
  d.getFullYear() + "-" +
  String(d.getMonth() + 1).padStart(2, "0") + "-" +
  String(d.getDate()).padStart(2, "0");

const nightCount = (cin, cout) =>
  Math.max(1, Math.round((cout - cin) / 86400000));

/* ─── DatePicker portal CSS ───────────────────────────────────────────── */
const DP_CSS = `
  .h-dp .react-datepicker { font-family:inherit!important; border:none!important; border-radius:16px!important; box-shadow:0 20px 60px -10px rgba(0,0,0,.18)!important; overflow:hidden!important; }
  .h-dp .react-datepicker__header { background:#fff!important; border-bottom:1px solid #f3f4f6!important; border-radius:16px 16px 0 0!important; padding-top:12px!important; }
  .h-dp .react-datepicker__current-month { font-size:14px!important; font-weight:700!important; color:#111827!important; margin-bottom:6px!important; }
  .h-dp .react-datepicker__navigation { top:12px!important; }
  .h-dp .react-datepicker__day-name { color:#9ca3af!important; font-size:10px!important; font-weight:600!important; text-transform:uppercase!important; width:32px!important; line-height:24px!important; }
  .h-dp .react-datepicker__month { margin:4px 6px 8px!important; }
  .h-dp .react-datepicker__day { width:32px!important; line-height:32px!important; border-radius:50%!important; font-size:12px!important; font-weight:500!important; color:#374151!important; margin:1px!important; }
  .h-dp .react-datepicker__day:hover { background:#fff3ef!important; color:#FD561E!important; }
  .h-dp .react-datepicker__day--selected,.h-dp .react-datepicker__day--keyboard-selected { background:#FD561E!important; color:#fff!important; font-weight:700!important; }
  .h-dp .react-datepicker__day--today { font-weight:700!important; color:#FD561E!important; }
  .h-dp .react-datepicker__day--today.h-dp .react-datepicker__day--selected { color:#fff!important; }
  .h-dp .react-datepicker__day--disabled { color:#d1d5db!important; pointer-events:none!important; }
  .h-dp .react-datepicker__triangle { display:none!important; }
`;

/* ════════════════════════════════════════════════════════════════════════
   SHARED STATE HOOK
════════════════════════════════════════════════════════════════════════ */
const useHotelSearchState = (defaultValues) => {
  const today = new Date(); today.setHours(0,0,0,0);

  const [loc,      setLoc]      = useState(defaultValues?.location    || "");
  const [lat,      setLat]      = useState(defaultValues?.lat         || null);
  const [lng,      setLng]      = useState(defaultValues?.lng         || null);
  const [checkin,  setCheckin]  = useState(
    defaultValues?.checkinDate  ? new Date(defaultValues.checkinDate)  : new Date(Date.now() + 86400000)
  );
  const [checkout, setCheckout] = useState(
    defaultValues?.checkoutDate ? new Date(defaultValues.checkoutDate) : new Date(Date.now() + 4 * 86400000)
  );
  const [guests, setGuests] = useState(
    defaultValues?.guests || { rooms: 1, adults: 2, children: 0 }
  );

  useEffect(() => {
    if (defaultValues?.location)    setLoc(defaultValues.location);
    if (defaultValues?.lat)         setLat(defaultValues.lat);
    if (defaultValues?.lng)         setLng(defaultValues.lng);
    if (defaultValues?.checkinDate) setCheckin(new Date(defaultValues.checkinDate));
    if (defaultValues?.checkoutDate)setCheckout(new Date(defaultValues.checkoutDate));
    if (defaultValues?.guests)      setGuests(defaultValues.guests);
    // eslint-disable-next-line
  }, [
    defaultValues?.location, defaultValues?.lat, defaultValues?.lng,
    defaultValues?.checkinDate, defaultValues?.checkoutDate,
  ]);

  const handleCheckinChange = (d) => {
    setCheckin(d);
    if (checkout <= d) setCheckout(new Date(d.getTime() + 86400000));
  };

  return {
    today,
    loc, setLoc, lat, setLat, lng, setLng,
    checkin, setCheckin: handleCheckinChange,
    checkout, setCheckout,
    guests, setGuests,
  };
};

/* ════════════════════════════════════════════════════════════════════════
   DESKTOP HOTEL SEARCH BAR
════════════════════════════════════════════════════════════════════════ */
const DesktopHotelSearchBar = ({ state, onSearch, isSticky }) => {
  const { today, loc, setLoc, lat, setLat, lng, setLng,
          checkin, setCheckin, checkout, setCheckout, guests, setGuests } = state;

  const [suggestions, setSuggestions] = useState([]);
  const [showSugg,    setShowSugg]    = useState(false);
  const [suggLoading, setSuggLoading] = useState(false);
  const [focused,     setFocused]     = useState(false);

  const [showGuests, setShowGuests] = useState(false);
  const [error,      setError]      = useState("");

  const abortRef    = useRef(null);
  const locBoxRef   = useRef(null);
  const guestBtnRef = useRef(null);
  const guestPanRef = useRef(null);
  const checkinRef  = useRef(null);
  const checkoutRef = useRef(null);

  // 🟢 NEW: same fix as Hero — skip exactly one autocomplete fetch right after a select
  const skipNextFetchRef = useRef(false);

  const [calPos,  setCalPos]  = useState({ top: 0, left: 0 });
  const [openCal, setOpenCal] = useState(null);

  const updateCalPos = useCallback(() => {
    const ref = openCal === "checkin" ? checkinRef : checkoutRef;
    if (!ref.current) return;
    const r = ref.current.getBoundingClientRect();
    setCalPos({ top: r.bottom + 4, left: r.left });
  }, [openCal]);

  useEffect(() => {
    if (!openCal) return;
    updateCalPos();
    const h = () => updateCalPos();
    window.addEventListener("scroll", h, true);
    window.addEventListener("resize", h);
    return () => { window.removeEventListener("scroll", h, true); window.removeEventListener("resize", h); };
  }, [openCal, updateCalPos]);

  const CalPortal = useCallback(({ children }) =>
    ReactDOM.createPortal(
      <div style={{ position:"fixed", top:calPos.top, left:calPos.left, zIndex:99999 }} className="h-dp">
        {children}
      </div>, document.body
    ), [calPos]);

  useEffect(() => {
    if (!document.getElementById("h-dp-css")) {
      const s = document.createElement("style"); s.id = "h-dp-css"; s.textContent = DP_CSS;
      document.head.appendChild(s);
    }
  }, []);

  // autocomplete — only when focused, skips the refetch right after a selection
  useEffect(() => {
    if (skipNextFetchRef.current) {
      skipNextFetchRef.current = false;
      return;
    }
    if (!focused) return;
    const q = loc.trim();
    if (q.length < 2) { setSuggestions([]); setShowSugg(false); return; }
    if (abortRef.current) abortRef.current.abort();
    const ctrl = new AbortController(); abortRef.current = ctrl;
    const timer = setTimeout(async () => {
      setSuggLoading(true);
      const r = await fetchPhoton(q, ctrl.signal);
      if (!ctrl.signal.aborted) { setSuggestions(r); setShowSugg(r.length > 0); }
      setSuggLoading(false);
    }, 300);
    return () => { clearTimeout(timer); ctrl.abort(); };
  }, [loc, focused]);

  useEffect(() => {
    const h = (e) => {
      if (!locBoxRef.current?.contains(e.target))   { setShowSugg(false); setFocused(false); }
      if (!guestBtnRef.current?.contains(e.target) && !guestPanRef.current?.contains(e.target))
        setShowGuests(false);
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  const handleSelectSuggestion = (s) => {
    skipNextFetchRef.current = true; // 🟢 prevents reopening
    setLoc(s.label); setLat(s.lat); setLng(s.lng);
    setShowSugg(false); setFocused(false); setSuggestions([]);
  };

  const handleSearch = async () => {
    setError("");
    if (!loc.trim()) { setError("Please enter a location"); return; }
    let sLat = lat, sLng = lng;
    if (!sLat || !sLng) {
      const r = await fetchPhoton(loc.trim());
      if (!r.length) { setError(`"${loc}" not found. Select from suggestions.`); return; }
      sLat = r[0].lat; sLng = r[0].lng;
    }
    onSearch?.({ location: loc.trim(), lat: sLat, lng: sLng,
      checkinDate: toISO(checkin), checkoutDate: toISO(checkout), guests });
  };

  const nights    = nightCount(checkin, checkout);
  const guestLbl  = `${guests.rooms} Room${guests.rooms>1?"s":""}, ${guests.adults} Adult${guests.adults>1?"s":""}${guests.children?`, ${guests.children} Child`:""}`;
  const dpProps   = {
    popperPlacement:"bottom-start", popperContainer:CalPortal,
    popperModifiers:[
      {name:"offset",options:{offset:[0,0]}},
      {name:"preventOverflow",options:{enabled:false}},
      {name:"flip",options:{enabled:false}},
    ],
  };

  return (
    <div
      className={`hidden md:block w-full bg-[#FD561E] shadow-sm ${error ? "pt-3 pb-7" : "py-3"}`}
      style={isSticky
        ? { position:"fixed", top:0, left:0, right:0, zIndex:40 }
        : { position:"relative" }}
    >
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-[2fr_1fr_1fr_1.4fr_auto] gap-3 items-end">

          {/* LOCATION */}
          <div className="relative" ref={locBoxRef}>
            <p className="text-white text-xs font-semibold mb-1 uppercase tracking-wide">Location / City / Hotel</p>
            <div className="flex items-center gap-2 h-12 px-3 rounded-md bg-white shadow-sm">
              {suggLoading
                ? <div className="animate-spin rounded-full h-3.5 w-3.5 border-b-2 border-[#FD561E] flex-shrink-0"/>
                : <FaMapMarkerAlt className="text-gray-400 w-3.5 h-3.5 flex-shrink-0"/>
              }
              <input
                value={loc}
                onChange={e => { setLoc(e.target.value); setLat(null); setLng(null); setError(""); }}
                onFocus={() => { setFocused(true); if (suggestions.length) setShowSugg(true); }}
                onBlur={() => setTimeout(() => { setFocused(false); setShowSugg(false); }, 150)}
                placeholder="Search city, hotel, area..."
                className="flex-1 text-sm font-semibold text-gray-800 outline-none bg-transparent placeholder:text-gray-400 placeholder:font-normal min-w-0"
                autoComplete="off"
              />
              {loc && <button onMouseDown={e=>{e.preventDefault();setLoc("");setLat(null);setLng(null);setSuggestions([]);setShowSugg(false);}}>
                <FaTimes className="w-3 h-3 text-gray-300 hover:text-gray-500"/>
              </button>}
            </div>
            {error && <p className="absolute text-white text-xs mt-0.5">{error}</p>}
            {showSugg && suggestions.length > 0 && focused && (
              <div className="absolute top-full mt-1 left-0 w-full bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden z-[99999]">
                {suggestions.map((s,i) => (
                  <div key={i}
                    onMouseDown={e=>{e.preventDefault();handleSelectSuggestion(s);}}
                    className="flex items-center gap-2 px-4 py-2.5 hover:bg-orange-50 cursor-pointer border-b last:border-0 border-gray-50 text-sm text-gray-700 font-medium">
                    <FaMapMarkerAlt className="text-[#FD561E] w-3 h-3 flex-shrink-0"/>{s.label}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* CHECK-IN */}
          <div ref={checkinRef}>
            <p className="text-white text-xs font-semibold mb-1 uppercase tracking-wide">Check-in</p>
            <div className="flex items-center gap-2 h-12 px-3 rounded-md bg-white shadow-sm">
              <FaCalendarAlt className="text-gray-400 w-3.5 h-3.5 flex-shrink-0"/>
              <DatePicker {...dpProps} selected={checkin} onChange={setCheckin}
                className="text-sm font-semibold outline-none bg-transparent cursor-pointer w-full"
                dateFormat="EEE, dd MMM" minDate={today}
                onCalendarOpen={()=>setOpenCal("checkin")} onCalendarClose={()=>setOpenCal(null)}/>
            </div>
          </div>

          {/* CHECK-OUT */}
          <div ref={checkoutRef}>
            <p className="text-white text-xs font-semibold mb-1 uppercase tracking-wide">
              Check-out <span className="bg-white/20 text-white text-[10px] px-1.5 py-0.5 rounded-full font-normal">{nights}N</span>
            </p>
            <div className="flex items-center gap-2 h-12 px-3 rounded-md bg-white shadow-sm">
              <FaCalendarAlt className="text-gray-400 w-3.5 h-3.5 flex-shrink-0"/>
              <DatePicker {...dpProps} selected={checkout} onChange={setCheckout}
                className="text-sm font-semibold outline-none bg-transparent cursor-pointer w-full"
                dateFormat="EEE, dd MMM" minDate={new Date(checkin.getTime()+86400000)}
                onCalendarOpen={()=>setOpenCal("checkout")} onCalendarClose={()=>setOpenCal(null)}/>
            </div>
          </div>

          {/* GUESTS */}
          <div className="relative">
            <p className="text-white text-xs font-semibold mb-1 uppercase tracking-wide">Rooms & Guests</p>
            <div ref={guestBtnRef} onClick={()=>setShowGuests(g=>!g)}
              className="flex items-center gap-2 h-12 px-3 rounded-md bg-white shadow-sm cursor-pointer">
              <FaUser className="text-gray-400 w-3.5 h-3.5 flex-shrink-0"/>
              <span className="text-sm font-semibold text-gray-800 truncate flex-1">{guestLbl}</span>
              <FaChevronDown className={`text-gray-400 w-3 h-3 flex-shrink-0 transition-transform ${showGuests?"rotate-180":""}`}/>
            </div>
            {showGuests && (
              <div ref={guestPanRef} className="absolute top-full mt-1 right-0 bg-white rounded-2xl shadow-2xl border border-gray-100 p-4 z-[99999] w-64">
                {[
                  {key:"rooms",   label:"Rooms",    sub:"",         min:1,max:5},
                  {key:"adults",  label:"Adults",   sub:"Age 13+",  min:1,max:8},
                  {key:"children",label:"Children", sub:"Age 0–12", min:0,max:4},
                ].map(({key,label,sub,min,max})=>(
                  <div key={key} className="flex items-center justify-between py-2.5 border-b last:border-0 border-gray-50">
                    <div>
                      <p className="text-sm font-semibold text-gray-800">{label}</p>
                      {sub && <p className="text-xs text-gray-400">{sub}</p>}
                    </div>
                    <div className="flex items-center gap-3">
                      <button onClick={()=>setGuests(g=>({...g,[key]:Math.max(min,g[key]-1)}))} disabled={guests[key]<=min}
                        className="w-8 h-8 rounded-full border-2 border-gray-200 flex items-center justify-center disabled:opacity-30 hover:border-[#FD561E] transition-colors">
                        <Minus className="w-3.5 h-3.5"/>
                      </button>
                      <span className="w-5 text-center font-bold text-sm">{guests[key]}</span>
                      <button onClick={()=>setGuests(g=>({...g,[key]:Math.min(max,g[key]+1)}))} disabled={guests[key]>=max}
                        className="w-8 h-8 rounded-full border-2 border-gray-200 flex items-center justify-center disabled:opacity-30 hover:border-[#FD561E] transition-colors">
                        <Plus className="w-3.5 h-3.5"/>
                      </button>
                    </div>
                  </div>
                ))}
                <button onClick={()=>setShowGuests(false)}
                  className="mt-3 w-full bg-[#FD561E] text-white py-2.5 rounded-xl font-bold text-sm hover:bg-[#e54d1a] transition-colors">
                  Done
                </button>
              </div>
            )}
          </div>

          {/* BUTTON */}
          <div>
            <button onClick={handleSearch}
              className="w-[150px] h-12 bg-white text-gray-800 font-bold rounded-md shadow cursor-pointer transition-all duration-300 hover:text-[#FD561E]">
              Modify Search
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ════════════════════════════════════════════════════════════════════════
   MOBILE HOTEL SEARCH BAR  (🟢 FIXED: white bg, black text — no orange)
════════════════════════════════════════════════════════════════════════ */
const MobileHotelSearchBar = ({ state, onSearch, isSticky }) => {
  const { today, loc, setLoc, lat, setLat, lng, setLng,
          checkin, setCheckin, checkout, setCheckout, guests, setGuests } = state;
  const [isOpen, setIsOpen] = useState(false);

  const nights   = nightCount(checkin, checkout);
  const guestLbl = `${guests.rooms}R · ${guests.adults}A${guests.children ? ` · ${guests.children}C` : ""}`;
  const collapsedSub = `${checkin.toLocaleDateString("en-IN",{day:"numeric",month:"short"})} → ${checkout.toLocaleDateString("en-IN",{day:"numeric",month:"short"})} · ${guestLbl}`;

  const handleSearch = async (overrideLoc, overrideLat, overrideLng) => {
    const l = overrideLoc ?? loc;
    let sLat = overrideLat ?? lat;
    let sLng = overrideLng ?? lng;
    if (!l.trim()) return;
    if (!sLat || !sLng) {
      const r = await fetchPhoton(l.trim());
      if (!r.length) return;
      sLat = r[0].lat; sLng = r[0].lng;
    }
    onSearch?.({ location: l.trim(), lat: sLat, lng: sLng,
      checkinDate: toISO(checkin), checkoutDate: toISO(checkout), guests });
    setIsOpen(false);
  };

  return (
    <>
      {/* ── Collapsed pill — white bg + black text (matches Bus flow) ── */}
      <div
        className="md:hidden w-full bg-white border-b border-gray-200 shadow-sm"
        style={isSticky
          ? { position:"fixed", top:0, left:0, right:0, zIndex:40 }
          : { position:"relative" }}
      >
        <div className="flex items-center justify-between px-4 py-3 cursor-pointer" onClick={()=>setIsOpen(true)}>
          <div className="flex items-center gap-2 min-w-0">
            <FaMapMarkerAlt className="text-[#FD561E] w-4 h-4 flex-shrink-0"/>
            <div className="min-w-0">
              <p className="font-bold text-gray-900 text-sm truncate">{loc || "Where to stay?"}</p>
              <p className="text-gray-500 text-xs truncate">{collapsedSub}</p>
            </div>
          </div>
          <button className="text-gray-500 flex-shrink-0 ml-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"/>
            </svg>
          </button>
        </div>
      </div>

      {/* ── Full-screen modal ── */}
      {isOpen && (
        <MobileHotelModal
          loc={loc} setLoc={setLoc} lat={lat} setLat={setLat} lng={lng} setLng={setLng}
          checkin={checkin} setCheckin={setCheckin}
          checkout={checkout} setCheckout={setCheckout}
          guests={guests} setGuests={setGuests}
          today={today} nights={nights}
          onClose={()=>setIsOpen(false)}
          onSearch={handleSearch}
        />
      )}
    </>
  );
};

/* ─── Mobile Modal ────────────────────────────────────────────────────── */
const MobileHotelModal = ({
  loc, setLoc, lat, setLat, lng, setLng,
  checkin, setCheckin, checkout, setCheckout,
  guests, setGuests, today, nights, onClose, onSearch,
}) => {
  const [suggestions, setSuggestions] = useState([]);
  const [showSugg,    setShowSugg]    = useState(false);
  const [suggLoading, setSuggLoading] = useState(false);
  const [focused,     setFocused]     = useState(false);
  const [showCal,     setShowCal]     = useState(null);
  const abortRef = useRef(null);

  // 🟢 NEW: skip-flag, same fix
  const skipNextFetchRef = useRef(false);

  useEffect(() => {
    if (skipNextFetchRef.current) {
      skipNextFetchRef.current = false;
      return;
    }
    if (!focused) return;
    const q = loc.trim();
    if (q.length < 2) { setSuggestions([]); setShowSugg(false); return; }
    if (abortRef.current) abortRef.current.abort();
    const ctrl = new AbortController(); abortRef.current = ctrl;
    const timer = setTimeout(async () => {
      setSuggLoading(true);
      const r = await fetchPhoton(q, ctrl.signal);
      if (!ctrl.signal.aborted) { setSuggestions(r); setShowSugg(r.length > 0); }
      setSuggLoading(false);
    }, 300);
    return () => { clearTimeout(timer); ctrl.abort(); };
  }, [loc, focused]);

  const guestLbl = `${guests.rooms} Room${guests.rooms>1?"s":""}, ${guests.adults} Adult${guests.adults>1?"s":""}${guests.children?`, ${guests.children} Child`:""}`;

  const handleSelectSuggestion = (s) => {
    skipNextFetchRef.current = true; // 🟢 prevents reopening
    setLoc(s.label); setLat(s.lat); setLng(s.lng);
    setShowSugg(false); setFocused(false); setSuggestions([]);
  };

  const handleSubmit = async () => {
    let sLat = lat, sLng = lng;
    if (!loc.trim()) return;
    if (!sLat || !sLng) {
      const r = await fetchPhoton(loc.trim());
      if (!r.length) return;
      sLat = r[0].lat; sLng = r[0].lng;
    }
    onSearch(loc, sLat, sLng);
  };

  return (
    <div className="md:hidden fixed inset-0 z-50 flex flex-col bg-white">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-4 border-b border-gray-100 bg-white">
        <button onClick={onClose} className="text-gray-600"><ArrowLeft size={20}/></button>
        <span className="font-semibold text-gray-800">Modify Search</span>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">

        {/* Location */}
        <div className="relative">
          <p className="text-[10px] font-semibold text-gray-400 mb-1 tracking-widest">LOCATION / CITY / HOTEL</p>
          <div className="border border-gray-200 rounded-xl bg-white shadow-sm px-3 py-2.5 flex items-center gap-2">
            {suggLoading
              ? <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#FD561E]"/>
              : <FaMapMarkerAlt className="text-gray-400 w-4 h-4 flex-shrink-0"/>
            }
            <input
              value={loc}
              onChange={e=>{setLoc(e.target.value);setLat(null);setLng(null); setError("");}}
              onFocus={()=>{setFocused(true);if(suggestions.length)setShowSugg(true);}}
              onBlur={()=>setTimeout(()=>{setFocused(false);setShowSugg(false);},150)}
              placeholder="Enter city or hotel name"
              className="flex-1 font-bold text-sm text-gray-900 outline-none bg-transparent placeholder:font-normal placeholder:text-gray-400"
              autoFocus
            />
            {loc && <button onMouseDown={e=>{e.preventDefault();setLoc("");setLat(null);setLng(null);setShowSugg(false);}}>
              <FaTimes className="w-3 h-3 text-gray-300"/>
            </button>}
          </div>
          {showSugg && suggestions.length > 0 && (
            <div className="absolute top-full mt-1 left-0 w-full bg-white shadow-xl rounded-xl z-50 max-h-48 overflow-y-auto border border-gray-100">
              {suggestions.map((s,i)=>(
                <div key={i}
                  onMouseDown={e=>{e.preventDefault();handleSelectSuggestion(s);}}
                  className="flex items-center gap-2 px-4 py-3 hover:bg-orange-50 cursor-pointer border-b last:border-0 border-gray-50 text-sm text-gray-700 font-medium">
                  <FaMapMarkerAlt className="text-[#FD561E] w-3 h-3 flex-shrink-0"/>{s.label}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Dates */}
        {[
          { label:"CHECK-IN DATE", val:checkin, minDate:today, key:"checkin",
            onChange:(d)=>{setCheckin(d);if(checkout<=d)setCheckout(new Date(d.getTime()+86400000));setShowCal(null);}},
          { label:`CHECK-OUT DATE (${nights}N)`, val:checkout, minDate:new Date(checkin.getTime()+86400000), key:"checkout",
            onChange:(d)=>{setCheckout(d);setShowCal(null);}},
        ].map(({label,val,minDate,key,onChange})=>(
          <div key={key}>
            <p className="text-[10px] font-semibold text-gray-400 mb-1 tracking-widest">{label}</p>
            <div className="border border-gray-200 rounded-xl bg-white shadow-sm px-3 py-2.5"
              onClick={()=>setShowCal(showCal===key?null:key)}>
              <div className="flex items-center gap-2">
                <FaCalendarAlt className="text-gray-400 w-4 h-4 flex-shrink-0"/>
                <span className="font-bold text-sm text-gray-900">
                  {val.toLocaleDateString("en-GB",{day:"2-digit",month:"short",year:"numeric",weekday:"short"}).toUpperCase()}
                </span>
              </div>
            </div>
            {showCal===key && (
              <div className="mt-1 bg-white rounded-xl border border-gray-200 p-3 shadow-sm h-dp">
                <DatePicker selected={val} onChange={onChange} inline minDate={minDate}/>
              </div>
            )}
          </div>
        ))}

        {/* Guests */}
        <div>
          <p className="text-[10px] font-semibold text-gray-400 mb-1 tracking-widest">ROOMS & GUESTS</p>
          <div className="border border-gray-200 rounded-xl bg-white shadow-sm px-3 py-2.5">
            <div className="flex items-center gap-2 mb-3">
              <FaUser className="text-gray-400 w-4 h-4 flex-shrink-0"/>
              <span className="font-bold text-sm text-gray-900">{guestLbl}</span>
            </div>
            {[
              {key:"rooms",   label:"Rooms",    sub:"",         min:1,max:5},
              {key:"adults",  label:"Adults",   sub:"Age 13+",  min:1,max:8},
              {key:"children",label:"Children", sub:"Age 0–12", min:0,max:4},
            ].map(({key,label,sub,min,max})=>(
              <div key={key} className="flex items-center justify-between py-2 border-t border-gray-50">
                <div>
                  <p className="text-sm font-semibold text-gray-800">{label}</p>
                  {sub && <p className="text-xs text-gray-400">{sub}</p>}
                </div>
                <div className="flex items-center gap-3">
                  <button onClick={()=>setGuests(g=>({...g,[key]:Math.max(min,g[key]-1)}))} disabled={guests[key]<=min}
                    className="w-8 h-8 rounded-full border-2 border-gray-200 flex items-center justify-center disabled:opacity-30 hover:border-[#FD561E]">
                    <Minus className="w-3.5 h-3.5"/>
                  </button>
                  <span className="w-5 text-center font-bold text-sm">{guests[key]}</span>
                  <button onClick={()=>setGuests(g=>({...g,[key]:Math.min(max,g[key]+1)}))} disabled={guests[key]>=max}
                    className="w-8 h-8 rounded-full border-2 border-gray-200 flex items-center justify-center disabled:opacity-30 hover:border-[#FD561E]">
                    <Plus className="w-3.5 h-3.5"/>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="px-4 pt-2 pb-4 border-t border-gray-100 bg-white">
        <button onClick={handleSubmit}
          className="w-full h-14 bg-[#FD561E] hover:bg-[#f36b32] active:scale-[0.98] text-white font-bold text-base rounded-xl shadow transition-all duration-200 tracking-wide">
          Modify Search
        </button>
      </div>
    </div>
  );
};

/* ════════════════════════════════════════════════════════════════════════
   MAIN EXPORT
════════════════════════════════════════════════════════════════════════ */
const HotelSearchBar = ({ defaultValues = {}, onSearch }) => {
  const state = useHotelSearchState(defaultValues);

  const wrapperRef = useRef(null);
  const [isSticky,         setIsSticky]         = useState(false);
  const [searchBarHeight,  setSearchBarHeight]   = useState(0);

  useEffect(() => {
    if (wrapperRef.current) setSearchBarHeight(wrapperRef.current.offsetHeight);

    const handleScroll = () => {
      if (!wrapperRef.current) return;
      const rect = wrapperRef.current.getBoundingClientRect();
      setIsSticky(rect.top < 0);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      <div
        ref={wrapperRef}
        style={{ height: isSticky ? searchBarHeight : "auto" }}
      >
        {!isSticky && (
          <>
            <DesktopHotelSearchBar state={state} onSearch={onSearch} isSticky={false} />
            <MobileHotelSearchBar  state={state} onSearch={onSearch} isSticky={false} />
          </>
        )}
      </div>

      {isSticky && (
        <>
          <DesktopHotelSearchBar state={state} onSearch={onSearch} isSticky={true} />
          <MobileHotelSearchBar  state={state} onSearch={onSearch} isSticky={true} />
        </>
      )}
    </>
  );
};

export default HotelSearchBar;