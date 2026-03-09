// src/modules/hotels/components/HotelSearchHeader.jsx
import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { FaMapMarkerAlt, FaCalendarAlt, FaUser, FaSearch, FaChevronDown } from 'react-icons/fa';
import { MdLocationOn } from 'react-icons/md';
import { useHotelSearch } from '../hooks/useHotelSearch';

const HotelSearchHeader = ({ searchParams, totalHotels }) => {
  const navigate = useNavigate();
  const { executeSearch } = useHotelSearch();
  
  // State for search form
  const [location, setLocation] = useState(searchParams?.location || '');
  const [checkinDate, setCheckinDate] = useState(
    searchParams?.checkinDate ? new Date(searchParams.checkinDate) : new Date()
  );
  const [checkoutDate, setCheckoutDate] = useState(
    searchParams?.checkoutDate ? new Date(searchParams.checkoutDate) : new Date(Date.now() + 3 * 24 * 60 * 60 * 1000)
  );
  const [guests, setGuests] = useState(
    searchParams?.guests || { rooms: 1, adults: 2, children: 0 }
  );
  const [showGuestsModal, setShowGuestsModal] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  
  // Refs
  const guestsRef = useRef(null);

  // Max limits
  const maxRooms = 5;
  const maxAdultsPerRoom = 4;
  const maxChildrenPerRoom = 3;

  // Format guests text
  const formatGuestsText = () => {
    return `${guests.adults} Adult${guests.adults > 1 ? 's' : ''} · ${guests.rooms} Room${guests.rooms > 1 ? 's' : ''}`;
  };

  // Handle guests update
  const updateGuests = (type, action) => {
    setGuests(prev => {
      let newValue = prev[type];
      
      if (action === 'increment') {
        if (type === 'rooms' && prev.rooms >= maxRooms) return prev;
        if (type === 'adults' && prev.adults >= maxAdultsPerRoom * prev.rooms) return prev;
        if (type === 'children' && prev.children >= maxChildrenPerRoom * prev.rooms) return prev;
        newValue = prev[type] + 1;
      } else {
        if (type === 'rooms' && prev.rooms <= 1) return prev;
        if (type === 'adults' && prev.adults <= 1) return prev;
        if (type === 'children' && prev.children <= 0) return prev;
        newValue = prev[type] - 1;
      }
      
      return {
        ...prev,
        [type]: newValue,
      };
    });
  };

  // Close guests modal on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (guestsRef.current && !guestsRef.current.contains(event.target)) {
        setShowGuestsModal(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle search update
  const handleUpdateSearch = async () => {
    if (!location.trim()) {
      alert('Please enter a city');
      return;
    }

    if (checkoutDate <= checkinDate) {
      alert('Check-out date must be after check-in date');
      return;
    }

    setIsSearching(true);

    const newSearchParams = {
      location: location.trim(),
      checkinDate: checkinDate.toISOString().split('T')[0],
      checkoutDate: checkoutDate.toISOString().split('T')[0],
      guests: guests,
    };

    await executeSearch(newSearchParams);
    setIsSearching(false);
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  if (!searchParams) return null;

  return (
    <div className="bg-white border-b border-gray-200 sticky top-0 z-40 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          {/* Left Section - Search Form (Always Editable) */}
          <div className="flex-1">
            <div className="flex flex-col lg:flex-row items-start lg:items-center gap-3">
              {/* Location Input */}
              <div className="w-full lg:w-64">
                <label className="block text-xs text-gray-500 mb-1">CITY/PROPERTY NAME</label>
                <div className="relative">
                  <FaMapMarkerAlt className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="Enter city"
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FD561E] focus:border-transparent text-gray-800"
                    disabled={isSearching}
                  />
                </div>
              </div>

              {/* Check-in Date */}
              <div className="w-full lg:w-40">
                <label className="block text-xs text-gray-500 mb-1">CHECK-IN</label>
                <div className="relative">
                  <FaCalendarAlt className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 z-10" />
                  <DatePicker
                    selected={checkinDate}
                    onChange={(date) => setCheckinDate(date)}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FD561E] focus:border-transparent text-gray-800 cursor-pointer"
                    dateFormat="MMM d, yyyy"
                    minDate={new Date()}
                    disabled={isSearching}
                  />
                </div>
              </div>

              {/* Check-out Date */}
              <div className="w-full lg:w-40">
                <label className="block text-xs text-gray-500 mb-1">CHECK-OUT</label>
                <div className="relative">
                  <FaCalendarAlt className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 z-10" />
                  <DatePicker
                    selected={checkoutDate}
                    onChange={(date) => setCheckoutDate(date)}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FD561E] focus:border-transparent text-gray-800 cursor-pointer"
                    dateFormat="MMM d, yyyy"
                    minDate={checkinDate}
                    disabled={isSearching}
                  />
                </div>
              </div>

              {/* Guests & Rooms */}
              <div className="w-full lg:w-56 relative" ref={guestsRef}>
                <label className="block text-xs text-gray-500 mb-1">GUESTS & ROOMS</label>
                <div
                  className={`w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg bg-white cursor-pointer flex items-center text-gray-800 hover:border-[#FD561E] transition-all ${isSearching ? 'opacity-50 cursor-not-allowed' : ''}`}
                  onClick={() => !isSearching && setShowGuestsModal(!showGuestsModal)}
                >
                  <FaUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <span className="truncate text-sm">{formatGuestsText()}</span>
                  <FaChevronDown
                    className={`absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 transition-all duration-200 ${
                      showGuestsModal ? 'rotate-180' : ''
                    }`}
                  />
                </div>

                {/* Guests Modal */}
                {showGuestsModal && (
                  <div className="absolute top-full left-0 mt-2 w-72 bg-white rounded-xl shadow-2xl border border-gray-200 z-50 p-4">
                    <div className="flex justify-between items-center mb-3">
                      <h3 className="font-bold text-gray-800">Select Rooms & Guests</h3>
                      <button
                        onClick={() => setShowGuestsModal(false)}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        ✕
                      </button>
                    </div>

                    {/* Rooms */}
                    <div className="mb-4">
                      <div className="flex justify-between items-center">
                        <div>
                          <div className="font-medium text-gray-800">Rooms</div>
                        </div>
                        <div className="flex items-center space-x-3">
                          <button
                            className={`w-7 h-7 rounded-full border flex items-center justify-center ${
                              guests.rooms <= 1 ? 'border-gray-200 text-gray-300 cursor-not-allowed' : 'border-gray-300 text-gray-600 hover:bg-gray-50'
                            }`}
                            onClick={() => updateGuests('rooms', 'decrement')}
                            disabled={guests.rooms <= 1}
                          >
                            −
                          </button>
                          <span className="font-bold text-gray-800 min-w-[20px] text-center">
                            {guests.rooms}
                          </span>
                          <button
                            className={`w-7 h-7 rounded-full border flex items-center justify-center ${
                              guests.rooms >= maxRooms ? 'border-gray-200 text-gray-300 cursor-not-allowed' : 'border-gray-300 text-gray-600 hover:bg-gray-50'
                            }`}
                            onClick={() => updateGuests('rooms', 'increment')}
                            disabled={guests.rooms >= maxRooms}
                          >
                            +
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Adults */}
                    <div className="mb-4">
                      <div className="flex justify-between items-center">
                        <div>
                          <div className="font-medium text-gray-800">Adults</div>
                        </div>
                        <div className="flex items-center space-x-3">
                          <button
                            className={`w-7 h-7 rounded-full border flex items-center justify-center ${
                              guests.adults <= 1 ? 'border-gray-200 text-gray-300 cursor-not-allowed' : 'border-gray-300 text-gray-600 hover:bg-gray-50'
                            }`}
                            onClick={() => updateGuests('adults', 'decrement')}
                            disabled={guests.adults <= 1}
                          >
                            −
                          </button>
                          <span className="font-bold text-gray-800 min-w-[20px] text-center">
                            {guests.adults}
                          </span>
                          <button
                            className={`w-7 h-7 rounded-full border flex items-center justify-center ${
                              guests.adults >= maxAdultsPerRoom * guests.rooms ? 'border-gray-200 text-gray-300 cursor-not-allowed' : 'border-gray-300 text-gray-600 hover:bg-gray-50'
                            }`}
                            onClick={() => updateGuests('adults', 'increment')}
                            disabled={guests.adults >= maxAdultsPerRoom * guests.rooms}
                          >
                            +
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Children */}
                    <div className="mb-4">
                      <div className="flex justify-between items-center">
                        <div>
                          <div className="font-medium text-gray-800">Children</div>
                        </div>
                        <div className="flex items-center space-x-3">
                          <button
                            className={`w-7 h-7 rounded-full border flex items-center justify-center ${
                              guests.children <= 0 ? 'border-gray-200 text-gray-300 cursor-not-allowed' : 'border-gray-300 text-gray-600 hover:bg-gray-50'
                            }`}
                            onClick={() => updateGuests('children', 'decrement')}
                            disabled={guests.children <= 0}
                          >
                            −
                          </button>
                          <span className="font-bold text-gray-800 min-w-[20px] text-center">
                            {guests.children}
                          </span>
                          <button
                            className={`w-7 h-7 rounded-full border flex items-center justify-center ${
                              guests.children >= maxChildrenPerRoom * guests.rooms ? 'border-gray-200 text-gray-300 cursor-not-allowed' : 'border-gray-300 text-gray-600 hover:bg-gray-50'
                            }`}
                            onClick={() => updateGuests('children', 'increment')}
                            disabled={guests.children >= maxChildrenPerRoom * guests.rooms}
                          >
                            +
                          </button>
                        </div>
                      </div>
                    </div>

                    <button
                      className="w-full bg-[#FD561E] text-white py-2 rounded-lg font-semibold hover:bg-[#e54d1a] transition-colors text-sm"
                      onClick={() => setShowGuestsModal(false)}
                    >
                      Apply
                    </button>
                  </div>
                )}
              </div>

              {/* Update Search Button */}
              <button
                onClick={handleUpdateSearch}
                disabled={isSearching}
                className="mt-6 lg:mt-0 px-6 py-2 bg-[#FD561E] text-white rounded-lg font-semibold hover:bg-[#e54d1a] transition-colors whitespace-nowrap flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSearching ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Searching...</span>
                  </>
                ) : (
                  <>
                    <FaSearch size={14} />
                    <span>Update Search</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Right Section - Results Count */}
          <div className="text-right lg:ml-4">
            <p className="text-sm text-gray-600">
              <span className="font-semibold text-[#FD561E] text-lg">{totalHotels}</span> hotels found
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HotelSearchHeader;