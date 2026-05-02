// src/modules/hotels/components/HotelSearchHeader.jsx
import React, { useState, useRef, useEffect } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { FaMapMarkerAlt, FaCalendarAlt, FaUser, FaChevronDown } from 'react-icons/fa';
import { Pencil, X, ArrowLeft } from 'lucide-react';
import { useHotelSearch } from '../hooks/useHotelSearch';

const HotelSearchHeader = ({ searchParams, totalHotels }) => {
  const { executeSearch } = useHotelSearch();

  const [location,     setLocation]     = useState(searchParams?.location || '');
  const [checkinDate,  setCheckinDate]  = useState(
    searchParams?.checkinDate ? new Date(searchParams.checkinDate) : new Date()
  );
  const [checkoutDate, setCheckoutDate] = useState(
    searchParams?.checkoutDate
      ? new Date(searchParams.checkoutDate)
      : new Date(Date.now() + 3 * 24 * 60 * 60 * 1000)
  );
  const [guests,       setGuests]       = useState(
    searchParams?.guests || { rooms: 1, adults: 2, children: 0 }
  );
  const [isSearching,  setIsSearching]  = useState(false);
  const [mobileOpen,   setMobileOpen]   = useState(false);
  const [showGuests,   setShowGuests]   = useState(false);

  const guestsDivRef = useRef(null);
  const locRef       = useRef(location);
  const inRef        = useRef(checkinDate);
  const outRef       = useRef(checkoutDate);
  const guestsRef    = useRef(guests);

  useEffect(() => { locRef.current    = location;     }, [location]);
  useEffect(() => { inRef.current     = checkinDate;  }, [checkinDate]);
  useEffect(() => { outRef.current    = checkoutDate; }, [checkoutDate]);
  useEffect(() => { guestsRef.current = guests;       }, [guests]);

  useEffect(() => {
    const h = (e) => {
      if (guestsDivRef.current && !guestsDivRef.current.contains(e.target))
        setShowGuests(false);
    };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  const maxRooms = 5, maxAdults = 4, maxChildren = 3;

  const updateGuests = (type, action) => {
    setGuests(prev => {
      const limits = {
        rooms:    { min: 1, max: maxRooms },
        adults:   { min: 1, max: maxAdults   * prev.rooms },
        children: { min: 0, max: maxChildren * prev.rooms },
      };
      const next = prev[type] + (action === 'inc' ? 1 : -1);
      if (next < limits[type].min || next > limits[type].max) return prev;
      return { ...prev, [type]: next };
    });
  };

  const fmtGuests = (g) =>
    `${g.adults} Adult${g.adults > 1 ? 's' : ''} · ${g.rooms} Room${g.rooms > 1 ? 's' : ''}`;

  const fmtDateShort = (d) =>
    d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

  const runSearch = async () => {
    const loc  = locRef.current;
    const cin  = inRef.current;
    const cout = outRef.current;
    const g    = guestsRef.current;

    if (!loc.trim()) { alert('Please enter a city'); return false; }
    if (cout <= cin)  { alert('Check-out must be after check-in'); return false; }

    setIsSearching(true);
    try {
      await executeSearch({
        location:     loc.trim(),
        checkinDate:  cin.toISOString().split('T')[0],
        checkoutDate: cout.toISOString().split('T')[0],
        guests:       g,
      });
      return true;
    } catch (e) {
      console.error(e);
      return false;
    } finally {
      setIsSearching(false);
    }
  };

  const GuestsPanel = () => (
    <div className="absolute top-full left-0 mt-1 w-64 bg-white rounded-xl shadow-2xl border border-gray-100 z-50 p-4">
      <div className="flex justify-between items-center mb-3">
        <span className="font-bold text-gray-800 text-sm">Select Rooms & Guests</span>
        <button onClick={() => setShowGuests(false)}>
          <X size={14} className="text-gray-400 cursor-pointer" />
        </button>
      </div>
      {[
        { key: 'rooms',    label: 'Rooms',    min: 1, max: maxRooms },
        { key: 'adults',   label: 'Adults',   min: 1, max: maxAdults   * guests.rooms },
        { key: 'children', label: 'Children', min: 0, max: maxChildren * guests.rooms },
      ].map(({ key, label, min, max }) => (
        <div key={key} className="flex justify-between items-center py-2 border-b border-gray-50 last:border-0">
          <span className="text-sm text-gray-700">{label}</span>
          <div className="flex items-center gap-3">
            <button onClick={() => updateGuests(key, 'dec')} disabled={guests[key] <= min}
              className={`w-7 h-7 rounded-full border flex items-center justify-center text-sm font-bold
                ${guests[key] <= min ? 'border-gray-200 text-gray-300' : 'border-gray-300 text-gray-600 hover:bg-gray-50'}`}>
              −
            </button>
            <span className="w-4 text-center font-bold text-sm text-gray-800">{guests[key]}</span>
            <button onClick={() => updateGuests(key, 'inc')} disabled={guests[key] >= max}
              className={`w-7 h-7 rounded-full border flex items-center justify-center text-sm font-bold
                ${guests[key] >= max ? 'border-gray-200 text-gray-300' : 'border-gray-300 text-gray-600 hover:bg-gray-50'}`}>
              +
            </button>
          </div>
        </div>
      ))}
      <button onClick={() => setShowGuests(false)}
        className="mt-3 w-full h-9 bg-[#FD561E] text-white rounded-lg text-sm font-semibold hover:bg-[#e54d1a] transition">
        Apply
      </button>
    </div>
  );

  if (!searchParams) return null;

  // ── KEY: position sticky, top = navbar height ──
  // Navbar is fixed h-16 (64px) mobile, h-20 (80px) md+
  // CSS sticky works perfectly — no JS needed, no flicker, no crop
  const desktopStickyStyle = {
    position: 'sticky',
    top: 0,       // md+ navbar is NOT fixed on hotels/results (isNoFixedPage), so top:0 is correct
    zIndex: 40,
  };

  // For mobile: navbar IS fixed (64px tall), so sticky top must clear it
  const mobileStickyStyle = {
    position: 'sticky',
    top: 0,
    zIndex: 40,
  };

  return (
    <>
      {/* ── DESKTOP (md+): sticky bar ── */}
      <div
        className="hidden md:block w-full bg-[#FD561E] py-4 -mt-24 shadow-sm"
        style={desktopStickyStyle}
      >
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-[1fr_1fr_1fr_1fr_auto_auto] gap-3 items-end">

            <div>
              <p className="text-white text-xs font-semibold mb-1 uppercase">City / Property</p>
              <input
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Enter city"
                disabled={isSearching}
                className="w-full h-12 px-4 rounded-md bg-white font-semibold text-gray-800 outline-none shadow-sm text-sm disabled:opacity-70"
              />
            </div>

            <div className="relative">
              <p className="text-white text-xs font-semibold mb-1 uppercase">Check-in</p>
              <div
                onClick={() => !isSearching && document.getElementById('hsh-cin')?.focus()}
                className="w-full h-12 px-4 rounded-md bg-white shadow-sm flex items-center gap-2 cursor-pointer"
              >
                <FaCalendarAlt className="text-gray-400 text-xs flex-shrink-0" />
                <DatePicker
                  id="hsh-cin"
                  selected={checkinDate}
                  onChange={(d) => setCheckinDate(d)}
                  dateFormat="dd MMM yyyy"
                  minDate={new Date()}
                  disabled={isSearching}
                  popperClassName="z-50"
                  className="w-full font-semibold text-gray-800 outline-none cursor-pointer bg-transparent text-sm"
                />
              </div>
            </div>

            <div className="relative">
              <p className="text-white text-xs font-semibold mb-1 uppercase">Check-out</p>
              <div className="w-full h-12 px-4 rounded-md bg-white shadow-sm flex items-center gap-2 cursor-pointer">
                <FaCalendarAlt className="text-gray-400 text-xs flex-shrink-0" />
                <DatePicker
                  selected={checkoutDate}
                  onChange={(d) => setCheckoutDate(d)}
                  dateFormat="dd MMM yyyy"
                  minDate={checkinDate}
                  disabled={isSearching}
                  popperClassName="z-50"
                  className="w-full font-semibold text-gray-800 outline-none cursor-pointer bg-transparent text-sm"
                />
              </div>
            </div>

            <div className="relative" ref={guestsDivRef}>
              <p className="text-white text-xs font-semibold mb-1 uppercase">Guests & Rooms</p>
              <div
                onClick={() => !isSearching && setShowGuests(s => !s)}
                className="w-full h-12 px-4 rounded-md bg-white shadow-sm flex items-center gap-2 cursor-pointer select-none"
              >
                <FaUser className="text-gray-400 text-xs flex-shrink-0" />
                <span className="flex-1 font-semibold text-gray-800 text-sm truncate">{fmtGuests(guests)}</span>
                <FaChevronDown className={`text-gray-400 text-xs transition-transform ${showGuests ? 'rotate-180' : ''}`} />
              </div>
              {showGuests && <GuestsPanel />}
            </div>

            <div>
              <p className="text-white text-xs font-semibold mb-1 uppercase opacity-0 select-none">.</p>
              <button
                onClick={runSearch}
                disabled={isSearching}
                className="h-12 px-6 bg-white text-gray-900 font-bold text-sm rounded-md shadow
                           hover:text-[#FD561E] transition-all duration-200 whitespace-nowrap
                           disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
              >
                {isSearching
                  ? <span className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-[#FD561E] border-t-transparent rounded-full animate-spin" />
                      Searching...
                    </span>
                  : 'UPDATE SEARCH'
                }
              </button>
            </div>

            <div>
              <p className="text-white text-xs font-semibold mb-1 uppercase opacity-0 select-none">.</p>
              <div className="h-12 flex items-center" />
            </div>
          </div>
        </div>
      </div>

      {/* ── MOBILE collapsed bar: sticky below fixed navbar ── */}
      {/* Navbar on mobile is fixed h-16=64px, so top-16 clears it */}
      <div
        className="md:hidden w-full bg-white shadow-sm sticky top-0 -mt-24 z-40"
      >
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-black text-sm truncate">
              {location || 'City'}
            </p>
            <p className="text-black text-xs">
              {fmtDateShort(checkinDate)} – {fmtDateShort(checkoutDate)} · {guests.adults}ad {guests.rooms}rm
            </p>
          </div>
          <button
            onClick={() => setMobileOpen(true)}
            className="ml-3 flex-shrink-0 text-[#fd561e] hover:bg-white/20 p-1.5 rounded-full transition"
          >
            <Pencil size={16} />
          </button>
        </div>
      </div>

      {/* ── MOBILE full-screen modal ── */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex flex-col bg-white">
          <div className="flex items-center gap-3 px-4 py-4">
            <button onClick={() => setMobileOpen(false)} className="text-black cursor-pointer">
              <ArrowLeft size={20} />
            </button>
            <span className="font-bold text-black/70 text-base">Modify Search</span>
          </div>

          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
            <div className="border border-gray-200 rounded-xl bg-white shadow-sm">
              <div className="px-4 py-3">
                <p className="text-[10px] font-semibold text-gray-400 mb-1 tracking-widest uppercase">City / Property</p>
                <div className="flex items-center gap-2">
                  <FaMapMarkerAlt className="text-gray-400 text-xs flex-shrink-0" />
                  <input
                    type="text" value={location} onChange={(e) => setLocation(e.target.value)}
                    placeholder="Enter city"
                    className="w-full font-bold text-base text-gray-900 outline-none bg-transparent"
                  />
                </div>
              </div>
            </div>

            <div className="border border-gray-200 rounded-xl bg-white shadow-sm px-4 py-3">
              <p className="text-[10px] font-semibold text-gray-400 mb-1 tracking-widest uppercase">Check-in Date</p>
              <div className="flex items-center gap-2">
                <FaCalendarAlt className="text-gray-400 text-xs flex-shrink-0" />
                <DatePicker
                  selected={checkinDate}
                  onChange={(d) => setCheckinDate(d)}
                  dateFormat="EEE, dd MMM yyyy"
                  minDate={new Date()}
                  popperClassName="z-50"
                  className="w-full font-bold text-base text-gray-900 outline-none cursor-pointer bg-transparent"
                />
              </div>
            </div>

            <div className="border border-gray-200 rounded-xl bg-white shadow-sm px-4 py-3">
              <p className="text-[10px] font-semibold text-gray-400 mb-1 tracking-widest uppercase">Check-out Date</p>
              <div className="flex items-center gap-2">
                <FaCalendarAlt className="text-gray-400 text-xs flex-shrink-0" />
                <DatePicker
                  selected={checkoutDate}
                  onChange={(d) => setCheckoutDate(d)}
                  dateFormat="EEE, dd MMM yyyy"
                  minDate={checkinDate}
                  popperClassName="z-50"
                  className="w-full font-bold text-base text-gray-900 outline-none cursor-pointer bg-transparent"
                />
              </div>
            </div>

            <div className="relative" ref={guestsDivRef}>
              <div
                onClick={() => setShowGuests(s => !s)}
                className="border border-gray-200 rounded-xl bg-white shadow-sm px-4 py-3 cursor-pointer select-none"
              >
                <p className="text-[10px] font-semibold text-gray-400 mb-1 tracking-widest uppercase">Guests & Rooms</p>
                <div className="flex items-center gap-2">
                  <FaUser className="text-gray-400 text-xs flex-shrink-0" />
                  <span className="flex-1 font-bold text-base text-gray-900">{fmtGuests(guests)}</span>
                  <FaChevronDown className={`text-gray-400 text-xs transition-transform ${showGuests ? 'rotate-180' : ''}`} />
                </div>
              </div>
              {showGuests && <GuestsPanel />}
            </div>
          </div>

          <div className="px-4 pt-2 pb-6 border-t border-gray-100 bg-white">
            <button
              onClick={async () => {
                const ok = await runSearch();
                if (ok) setMobileOpen(false);
              }}
              disabled={isSearching}
              className="w-full h-14 bg-[#FD561E] hover:bg-[#e54d1a] active:scale-[0.98]
                         text-white font-bold text-base rounded-xl shadow
                         transition-all duration-200 tracking-wide disabled:opacity-60"
            >
              {isSearching ? 'Searching...' : 'UPDATE SEARCH'}
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default HotelSearchHeader;