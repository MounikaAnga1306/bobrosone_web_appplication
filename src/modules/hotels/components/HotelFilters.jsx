// src/modules/hotels/components/HotelFilters.jsx
import React, { useState } from 'react';
import { FaStar, FaRupeeSign, FaWifi, FaParking, FaSwimmer, FaUtensils, FaDumbbell, FaSnowflake, FaTimes } from 'react-icons/fa';
import { MdLocalHotel } from 'react-icons/md';

const HotelFilters = ({ onClose, isMobile }) => {
  const [priceRange, setPriceRange] = useState({ min: 0, max: 50000 });
  const [selectedStars, setSelectedStars] = useState([]);
  const [selectedAmenities, setSelectedAmenities] = useState([]);
  const [selectedPropertyTypes, setSelectedPropertyTypes] = useState([]);
  const [guestRating, setGuestRating] = useState('');
  const [freeCancellation, setFreeCancellation] = useState(false);

  // Price Range
  const handlePriceChange = (type, value) => {
    setPriceRange(prev => ({ ...prev, [type]: parseInt(value) }));
  };

  // Star Rating
  const toggleStar = (star) => {
    setSelectedStars(prev =>
      prev.includes(star) ? prev.filter(s => s !== star) : [...prev, star]
    );
  };

  // Amenities
  const amenities = [
    { id: 'wifi', label: 'Free WiFi', icon: FaWifi },
    { id: 'parking', label: 'Free Parking', icon: FaParking },
    { id: 'pool', label: 'Swimming Pool', icon: FaSwimmer },
    { id: 'restaurant', label: 'Restaurant', icon: FaUtensils },
    { id: 'gym', label: 'Gym', icon: FaDumbbell },
    { id: 'ac', label: 'Air Conditioning', icon: FaSnowflake },
  ];

  const toggleAmenity = (amenityId) => {
    setSelectedAmenities(prev =>
      prev.includes(amenityId) ? prev.filter(a => a !== amenityId) : [...prev, amenityId]
    );
  };

  // Property Types
  const propertyTypes = [
    { id: 'hotel', label: 'Hotel' },
    { id: 'resort', label: 'Resort' },
    { id: 'apartment', label: 'Apartment' },
    { id: 'villa', label: 'Villa' },
    { id: 'homestay', label: 'Homestay' },
  ];

  const togglePropertyType = (typeId) => {
    setSelectedPropertyTypes(prev =>
      prev.includes(typeId) ? prev.filter(t => t !== typeId) : [...prev, typeId]
    );
  };

  // Guest Rating
  const ratingOptions = [
    { value: '4.5', label: '4.5+ (Excellent)' },
    { value: '4.0', label: '4.0+ (Very Good)' },
    { value: '3.5', label: '3.5+ (Good)' },
    { value: '3.0', label: '3.0+ (Average)' },
  ];

  // Clear all filters
  const clearAllFilters = () => {
    setPriceRange({ min: 0, max: 50000 });
    setSelectedStars([]);
    setSelectedAmenities([]);
    setSelectedPropertyTypes([]);
    setGuestRating('');
    setFreeCancellation(false);
  };

  // Check if any filter is active
  const hasActiveFilters = () => {
    return (
      selectedStars.length > 0 ||
      selectedAmenities.length > 0 ||
      selectedPropertyTypes.length > 0 ||
      guestRating !== '' ||
      freeCancellation ||
      priceRange.min > 0 ||
      priceRange.max < 50000
    );
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-5">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-lg font-bold text-gray-800">Filters</h2>
        <div className="flex items-center gap-2">
          {hasActiveFilters() && (
            <button
              onClick={clearAllFilters}
              className="text-sm text-[#FD561E] font-semibold hover:text-[#e54d1a]"
            >
              Clear all
            </button>
          )}
          {isMobile && (
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
              <FaTimes size={20} />
            </button>
          )}
        </div>
      </div>

      {/* Price Range */}
      <div className="mb-6">
        <h3 className="font-semibold text-gray-700 mb-3 flex items-center">
          <FaRupeeSign className="text-[#FD561E] mr-2" />
          Price Range
        </h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span>₹{priceRange.min.toLocaleString('en-IN')}</span>
            <span>₹{priceRange.max.toLocaleString('en-IN')}+</span>
          </div>
          <input
            type="range"
            min="0"
            max="50000"
            step="1000"
            value={priceRange.min}
            onChange={(e) => handlePriceChange('min', e.target.value)}
            className="w-full accent-[#FD561E]"
          />
          <input
            type="range"
            min="0"
            max="50000"
            step="1000"
            value={priceRange.max}
            onChange={(e) => handlePriceChange('max', e.target.value)}
            className="w-full accent-[#FD561E]"
          />
        </div>
      </div>

      {/* Star Rating */}
      <div className="mb-6">
        <h3 className="font-semibold text-gray-700 mb-3 flex items-center">
          <FaStar className="text-yellow-400 mr-2" />
          Star Rating
        </h3>
        <div className="space-y-2">
          {[5, 4, 3, 2, 1].map((star) => (
            <label key={star} className="flex items-center cursor-pointer group">
              <input
                type="checkbox"
                checked={selectedStars.includes(star)}
                onChange={() => toggleStar(star)}
                className="w-4 h-4 text-[#FD561E] border-gray-300 rounded focus:ring-[#FD561E]"
              />
              <span className="ml-3 flex items-center text-gray-700 group-hover:text-[#FD561E]">
                {[...Array(5)].map((_, i) => (
                  <FaStar
                    key={i}
                    className={i < star ? 'text-yellow-400' : 'text-gray-300'}
                    size={14}
                  />
                ))}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Property Type */}
      <div className="mb-6">
        <h3 className="font-semibold text-gray-700 mb-3 flex items-center">
          <MdLocalHotel className="text-[#FD561E] mr-2" />
          Property Type
        </h3>
        <div className="space-y-2">
          {propertyTypes.map((type) => (
            <label key={type.id} className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={selectedPropertyTypes.includes(type.id)}
                onChange={() => togglePropertyType(type.id)}
                className="w-4 h-4 text-[#FD561E] border-gray-300 rounded focus:ring-[#FD561E]"
              />
              <span className="ml-3 text-sm text-gray-700">{type.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Amenities */}
      <div className="mb-6">
        <h3 className="font-semibold text-gray-700 mb-3">Amenities</h3>
        <div className="space-y-2">
          {amenities.map((amenity) => {
            const Icon = amenity.icon;
            return (
              <label key={amenity.id} className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedAmenities.includes(amenity.id)}
                  onChange={() => toggleAmenity(amenity.id)}
                  className="w-4 h-4 text-[#FD561E] border-gray-300 rounded focus:ring-[#FD561E]"
                />
                <span className="ml-3 flex items-center text-sm text-gray-700">
                  <Icon className="mr-2 text-gray-500" size={14} />
                  {amenity.label}
                </span>
              </label>
            );
          })}
        </div>
      </div>

      {/* Guest Rating */}
      <div className="mb-6">
        <h3 className="font-semibold text-gray-700 mb-3">Guest Rating</h3>
        <select
          value={guestRating}
          onChange={(e) => setGuestRating(e.target.value)}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#FD561E] focus:border-transparent"
        >
          <option value="">Any rating</option>
          {ratingOptions.map(option => (
            <option key={option.value} value={option.value}>{option.label}</option>
          ))}
        </select>
      </div>

      {/* Free Cancellation */}
      <div className="mb-4">
        <label className="flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={freeCancellation}
            onChange={(e) => setFreeCancellation(e.target.checked)}
            className="w-4 h-4 text-[#FD561E] border-gray-300 rounded focus:ring-[#FD561E]"
          />
          <span className="ml-3 text-sm font-medium text-gray-700">Free Cancellation</span>
        </label>
      </div>

      {/* Apply Filters Button (Mobile) */}
      {isMobile && (
        <button
          onClick={onClose}
          className="w-full mt-4 py-3 bg-[#FD561E] text-white rounded-lg font-semibold hover:bg-[#e54d1a] transition-colors"
        >
          Apply Filters
        </button>
      )}
    </div>
  );
};

export default HotelFilters;