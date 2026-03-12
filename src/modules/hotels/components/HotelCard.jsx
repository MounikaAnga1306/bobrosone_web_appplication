// src/modules/hotels/components/HotelCard.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useHotelSearch } from '../context/HotelSearchContext';
import { FaStar, FaMapMarkerAlt, FaRupeeSign, FaWifi, FaParking, FaSwimmer, FaUtensils } from 'react-icons/fa';
import { MdLocationOn } from 'react-icons/md';

// Temporary placeholder image from Unsplash
const PLACEHOLDER_IMAGE = "https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80";

const HotelCard = ({ hotel, viewMode = 'grid' }) => {
  const navigate = useNavigate();
  const { searchParams } = useHotelSearch();

  const handleViewDetails = () => {
    // Get dates from searchParams - check all possible formats
    const checkin = searchParams?.checkinDate || searchParams?.checkIn || searchParams?.checkin;
    const checkout = searchParams?.checkoutDate || searchParams?.checkOut || searchParams?.checkout;
    
    console.log("📅 Dates from searchParams:", { 
      searchParams,
      checkin, 
      checkout 
    });
    
    console.log("🏨 Hotel Property:", hotel.hotelProperty);

    // Create the exact request body structure needed for details API
    const detailsRequestBody = {
      hotelProperty: {
        hotelChain: hotel.hotelProperty?.hotelChain,
        hotelCode: hotel.hotelProperty?.hotelCode,
        hotelLocation: hotel.hotelProperty?.hotelLocation,
        name: hotel.hotelProperty?.name,
        vendorLocationKey: hotel.hotelProperty?.vendorLocationKey
      },
      detailsModifiers: {
        checkin: checkin,
        checkout: checkout
      }
    };

    console.log("📤 Sending details request:", detailsRequestBody);

    // Navigate to details page with hotel data and request body
    navigate(`/hotels/${hotel.id}`, {
      state: { 
        hotelData: hotel,
        detailsRequestBody
      }
    });
  };

  // Generate star rating display
  const renderStars = () => {
    const stars = [];
    const rating = Math.floor(hotel.rating?.stars || 0);
    
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <FaStar
          key={i}
          className={`${i <= rating ? 'text-yellow-400' : 'text-gray-300'}`}
          size={viewMode === 'grid' ? 16 : 14}
        />
      );
    }
    return stars;
  };

  // Get amenities from hotel data or use defaults
  const getAmenities = () => {
    if (hotel.amenities && hotel.amenities.length > 0) {
      return hotel.amenities.slice(0, 3).map(amenity => {
        const iconMap = {
          'wifi': FaWifi,
          'parking': FaParking,
          'pool': FaSwimmer,
          'restaurant': FaUtensils
        };
        return {
          icon: iconMap[amenity.toLowerCase()] || FaWifi,
          label: amenity
        };
      });
    }
    
    return [
      { icon: FaWifi, label: 'WiFi' },
      { icon: FaParking, label: 'Parking' },
      { icon: FaSwimmer, label: 'Pool' },
    ];
  };

  const amenities = getAmenities();

  // Get display address
  const getDisplayAddress = () => {
    if (hotel.location?.address) {
      return hotel.location.address;
    }
    if (hotel.location?.city) {
      return hotel.location.city;
    }
    return hotel.hotelProperty?.hotelLocation || 'Location not specified';
  };

  // Get distance display
  const getDistanceDisplay = () => {
    if (hotel.distance) {
      const { value, unit, direction } = hotel.distance;
      const unitText = unit === 'MI' ? 'miles' : 'km';
      return direction ? `${value} ${unitText} ${direction}` : `${value} ${unitText}`;
    }
    return null;
  };

  if (viewMode === 'list') {
    return (
      <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100 hover:shadow-xl transition-all duration-300 group">
        <div className="flex flex-col md:flex-row">
          {/* Image Section */}
          <div className="md:w-64 h-48 md:h-auto relative overflow-hidden bg-gray-200">
            <img 
              src={hotel.images?.[0] || PLACEHOLDER_IMAGE}
              alt={hotel.name}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent"></div>
            
            {/* Price Tag for List View */}
            {hotel.price?.min > 0 && (
              <div className="absolute bottom-3 left-3 bg-white/95 backdrop-blur-sm px-3 py-2 rounded-lg shadow-md">
                <div className="flex items-center">
                  <FaRupeeSign className="text-[#FD561E] text-sm" />
                  <span className="font-bold text-gray-800">{hotel.price.min.toLocaleString('en-IN')}</span>
                </div>
                <div className="text-xs text-gray-500">per night</div>
              </div>
            )}
          </div>

          {/* Content Section */}
          <div className="flex-1 p-4">
            <div className="flex justify-between items-start mb-2">
              <div>
                <h3 className="font-bold text-gray-800 text-lg mb-1">{hotel.name}</h3>
                <div className="flex items-center text-gray-500 text-sm">
                  <MdLocationOn className="text-[#FD561E] mr-1" size={14} />
                  <span className="truncate">{getDisplayAddress()}</span>
                </div>
              </div>
              <div className="flex items-center bg-[#FD561E] text-white px-2 py-1 rounded-md">
                <span className="font-bold text-sm">{hotel.rating?.stars?.toFixed(1) || 'N/A'}</span>
                <FaStar className="ml-1 text-white" size={12} />
              </div>
            </div>

            {/* Amenities */}
            <div className="flex flex-wrap gap-2 mb-3">
              {amenities.map((amenity, index) => {
                const Icon = amenity.icon;
                return (
                  <div key={index} className="flex items-center bg-gray-100 px-2 py-1 rounded-md text-xs text-gray-600">
                    <Icon className="mr-1" size={12} />
                    <span>{amenity.label}</span>
                  </div>
                );
              })}
            </div>

            {/* Distance */}
            {getDistanceDisplay() && (
              <p className="text-sm text-gray-500 mb-3">
                <FaMapMarkerAlt className="inline mr-1 text-gray-400" size={12} />
                {getDistanceDisplay()}
              </p>
            )}

            {/* Availability Status */}
            {hotel.availability && (
              <p className={`text-xs mb-2 ${hotel.availability === 'Available' ? 'text-green-600' : 'text-orange-600'}`}>
                {hotel.availability}
              </p>
            )}

            {/* Action Button */}
            <button
              onClick={handleViewDetails}
              className="mt-2 px-4 py-2 bg-gradient-to-r from-[#FD561E] to-[#ff7b4a] text-white rounded-lg text-sm font-semibold hover:from-[#e54d1a] hover:to-[#ff6a3c] transition-all duration-300"
            >
              View Details
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Grid View (Default)
  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100 hover:shadow-xl transition-all duration-300 group">
      {/* Image Section */}
      <div className="relative h-48 overflow-hidden bg-gray-200">
        <img 
          src={hotel.images?.[0] || PLACEHOLDER_IMAGE}
          alt={hotel.name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
        />
        
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent"></div>
        
        {/* Rating Badge */}
        {hotel.rating?.stars > 0 && (
          <div className="absolute top-3 left-3 flex items-center bg-white/95 backdrop-blur-sm px-2 py-1 rounded-full shadow-md">
            <FaStar className="text-yellow-400 mr-1" size={12} />
            <span className="font-bold text-xs">{hotel.rating?.stars?.toFixed(1)}</span>
          </div>
        )}

        {/* Price Tag */}
        {hotel.price?.min > 0 && (
          <div className="absolute bottom-3 left-3 bg-white/95 backdrop-blur-sm px-3 py-2 rounded-lg shadow-md">
            <div className="flex items-center">
              <FaRupeeSign className="text-[#FD561E] text-sm" />
              <span className="font-bold text-gray-800">{hotel.price.min.toLocaleString('en-IN')}</span>
            </div>
            <div className="text-xs text-gray-500">per night</div>
          </div>
        )}

        {/* Availability Badge */}
        {hotel.availability && hotel.availability !== 'Available' && (
          <div className="absolute top-3 right-3 bg-orange-500 text-white px-2 py-1 rounded text-xs font-semibold">
            {hotel.availability}
          </div>
        )}
      </div>

      <div className="p-3">
        {/* Hotel Name */}
        <h3 className="font-bold text-gray-800 text-base mb-1 line-clamp-1">{hotel.name}</h3>
        
        {/* Location */}
        <div className="flex items-center text-gray-500 text-xs mb-2">
          <MdLocationOn className="text-[#FD561E] mr-1 flex-shrink-0" size={12} />
          <span className="truncate">{getDisplayAddress()}</span>
        </div>

        {/* Rating Row */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center">
            {renderStars()}
          </div>
          {getDistanceDisplay() && (
            <span className="text-xs text-gray-400">{getDistanceDisplay()}</span>
          )}
        </div>

        {/* View Details Button */}
        <button
          onClick={handleViewDetails}
          className="w-full mt-2 py-2 bg-gradient-to-r from-[#FD561E] to-[#ff7b4a] text-white rounded-lg text-sm font-semibold hover:from-[#e54d1a] hover:to-[#ff6a3c] transition-all duration-300"
        >
          View Details
        </button>
      </div>
    </div>
  );
};

export default HotelCard;