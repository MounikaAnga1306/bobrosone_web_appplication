// src/modules/hotels/pages/HotelDetails.jsx
import React, { useEffect, useState } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { useHotelDetails } from '../hooks/useHotelDetails';
import { useHotelSearch } from '../context/HotelSearchContext';
import { 
  FaStar, 
  FaMapMarkerAlt, 
  FaWifi, 
  FaParking, 
  FaSwimmer, 
  FaUtensils,
  FaArrowLeft,
  FaBed,
  FaUsers,
  FaBath,
  FaCoffee,
  FaTv,
  FaSnowflake,
  FaConciergeBell,
  FaSpa,
  FaDumbbell,
  FaBusinessTime,
  FaChild,
  FaPaw,
  FaSmoking,
  FaClock,
  FaCreditCard,
  FaCheckCircle,
  FaTimesCircle,
  FaImage
} from 'react-icons/fa';
import { MdLocationOn, MdLocalHotel, MdMeetingRoom } from 'react-icons/md';

// Placeholder image
const PLACEHOLDER_IMAGE = "https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80";

const HotelDetails = () => {
  const { hotelId } = useParams(); // hotel code like "E5699"
  const location = useLocation();
  const navigate = useNavigate();
  
  const { loading, error, hotelDetails, fetchHotelDetails, clearDetails } = useHotelDetails();
  const { getCheckInDate, getCheckOutDate, searchParams } = useHotelSearch();
  
  // Local state
  const [selectedImage, setSelectedImage] = useState(0);
  const [showAllImages, setShowAllImages] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [showRoomDetails, setShowRoomDetails] = useState(false);

  // Get data passed from HotelCard (if any)
  const { hotelData, detailsRequestBody } = location.state || {};

  useEffect(() => {
    const loadHotelDetails = async () => {
      // If we have detailsRequestBody from navigation state, use it
      if (detailsRequestBody) {
        await fetchHotelDetails(detailsRequestBody);
      } 
      // Otherwise, construct from URL params and context
      else if (hotelId && getCheckInDate() && getCheckOutDate()) {
        // Try to find hotel in context or use basic data
        const requestBody = {
          hotelProperty: {
            hotelChain: hotelData?.hotelProperty?.hotelChain || "",
            hotelCode: hotelId,
            hotelLocation: hotelData?.hotelProperty?.hotelLocation || "",
            name: hotelData?.name || "",
            vendorLocationKey: hotelData?.hotelProperty?.vendorLocationKey || ""
          },
          detailsModifiers: {
            checkin: getCheckInDate(),
            checkout: getCheckOutDate()
          }
        };
        await fetchHotelDetails(requestBody);
      }
    };

    loadHotelDetails();

    // Cleanup on unmount
    return () => {
      clearDetails();
    };
  }, [hotelId, detailsRequestBody, fetchHotelDetails, getCheckInDate, getCheckOutDate, hotelData, clearDetails]);

  // If no dates are available, redirect back
  useEffect(() => {
    if (!getCheckInDate() || !getCheckOutDate()) {
      navigate('/hotels');
    }
  }, [getCheckInDate, getCheckOutDate, navigate]);

  const handleBack = () => {
    navigate(-1);
  };

  const handleBookNow = (room) => {
    // Navigate to booking page with room details
    console.log('Booking room:', room);
    // navigate('/hotels/booking', { state: { hotel: hotelDetails, room } });
  };

  const handleSelectRoom = (room) => {
    setSelectedRoom(room);
    setShowRoomDetails(true);
  };

  // Get all images (from hotel data or placeholder)
  const getImages = () => {
    if (hotelDetails?.images && hotelDetails.images.length > 0) {
      return hotelDetails.images;
    }
    // Generate multiple placeholders for demo
    return [PLACEHOLDER_IMAGE, PLACEHOLDER_IMAGE, PLACEHOLDER_IMAGE, PLACEHOLDER_IMAGE];
  };

  const images = getImages();

  // Get amenities with icons
  const getAmenitiesWithIcons = () => {
    const amenityIconMap = {
      'wifi': { icon: FaWifi, label: 'Free WiFi' },
      'parking': { icon: FaParking, label: 'Free Parking' },
      'pool': { icon: FaSwimmer, label: 'Swimming Pool' },
      'restaurant': { icon: FaUtensils, label: 'Restaurant' },
      'spa': { icon: FaSpa, label: 'Spa' },
      'gym': { icon: FaDumbbell, label: 'Fitness Center' },
      'business': { icon: FaBusinessTime, label: 'Business Center' },
      'conference': { icon: FaConciergeBell, label: 'Conference Room' },
      'ac': { icon: FaSnowflake, label: 'Air Conditioning' },
      'tv': { icon: FaTv, label: 'TV' },
      'coffee': { icon: FaCoffee, label: 'Coffee Maker' },
      'bath': { icon: FaBath, label: 'Private Bath' },
      'child': { icon: FaChild, label: 'Child Friendly' },
      'pet': { icon: FaPaw, label: 'Pets Allowed' },
      'smoking': { icon: FaSmoking, label: 'Smoking Allowed' }
    };

    // If hotel has amenities from API, map them
    if (hotelDetails?.amenities && hotelDetails.amenities.length > 0) {
      return hotelDetails.amenities.map(amenity => {
        const key = amenity.toLowerCase();
        return amenityIconMap[key] || { icon: FaCheckCircle, label: amenity };
      });
    }

    // Default amenities for demo
    return [
      { icon: FaWifi, label: 'Free WiFi' },
      { icon: FaParking, label: 'Free Parking' },
      { icon: FaSwimmer, label: 'Swimming Pool' },
      { icon: FaUtensils, label: 'Restaurant' },
      { icon: FaDumbbell, label: 'Fitness Center' },
      { icon: FaSnowflake, label: 'Air Conditioning' }
    ];
  };

  const amenities = getAmenitiesWithIcons();

  // Get rooms (from hotel data or generate demo)
  const getRooms = () => {
    if (hotelDetails?.rooms && hotelDetails.rooms.length > 0) {
      return hotelDetails.rooms;
    }

    // Generate demo rooms
    return [
      {
        id: 1,
        type: 'Deluxe Room',
        description: 'Spacious room with city view',
        maxOccupancy: 2,
        bedType: 'King',
        size: '32 sqm',
        amenities: ['WiFi', 'AC', 'TV', 'Mini Bar'],
        price: hotelDetails?.price?.min || 5000,
        currency: hotelDetails?.price?.currency || 'INR',
        available: true
      },
      {
        id: 2,
        type: 'Executive Suite',
        description: 'Luxury suite with separate living area',
        maxOccupancy: 3,
        bedType: 'King',
        size: '48 sqm',
        amenities: ['WiFi', 'AC', 'TV', 'Mini Bar', 'Lounge Access'],
        price: hotelDetails?.price?.max || 8000,
        currency: hotelDetails?.price?.currency || 'INR',
        available: true
      }
    ];
  };

  const rooms = getRooms();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="pt-24 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            {/* Loading Skeleton */}
            <div className="animate-pulse">
              {/* Back button skeleton */}
              <div className="h-8 w-24 bg-gray-200 rounded mb-6"></div>
              
              {/* Header skeleton */}
              <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
                <div className="h-8 bg-gray-200 rounded w-1/3 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/4"></div>
              </div>

              {/* Image gallery skeleton */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="md:col-span-2 md:row-span-2 h-96 bg-gray-200 rounded-xl"></div>
                <div className="hidden md:block h-48 bg-gray-200 rounded-xl"></div>
                <div className="hidden md:block h-48 bg-gray-200 rounded-xl"></div>
              </div>

              {/* Content skeleton */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                  <div className="bg-white rounded-xl shadow-sm p-6">
                    <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
                    <div className="space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-full"></div>
                      <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                      <div className="h-4 bg-gray-200 rounded w-4/6"></div>
                    </div>
                  </div>
                </div>
                <div className="lg:col-span-1">
                  <div className="bg-white rounded-xl shadow-sm p-6 sticky top-24">
                    <div className="h-6 bg-gray-200 rounded w-1/2 mb-4"></div>
                    <div className="space-y-3">
                      <div className="h-4 bg-gray-200 rounded w-full"></div>
                      <div className="h-4 bg-gray-200 rounded w-full"></div>
                      <div className="h-10 bg-gray-200 rounded w-full mt-4"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !hotelDetails) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="pt-24 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <button
              onClick={handleBack}
              className="flex items-center gap-2 text-gray-600 hover:text-[#FD561E] transition-colors mb-6"
            >
              <FaArrowLeft />
              Back to Search Results
            </button>

            <div className="bg-white rounded-xl shadow-sm p-12 text-center">
              <div className="text-6xl mb-4">😕</div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">Hotel Details Not Found</h3>
              <p className="text-gray-600 mb-6">{error || 'Unable to load hotel details'}</p>
              <button 
                onClick={handleBack}
                className="px-6 py-2 bg-[#FD561E] text-white rounded-lg hover:bg-[#e54d1a] transition-colors"
              >
                Go Back
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <div className="pt-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <button
            onClick={handleBack}
            className="flex items-center gap-2 text-gray-600 hover:text-[#FD561E] transition-colors mb-6"
          >
            <FaArrowLeft />
            Back to Search Results
          </button>

          {/* Hotel Header */}
          <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">{hotelDetails.name}</h1>
                <div className="flex items-center gap-2 text-gray-600">
                  <MdLocationOn className="text-[#FD561E]" size={20} />
                  <p>{hotelDetails.address || hotelDetails.location?.address || 'Location not specified'}</p>
                </div>
              </div>
              <div className="mt-4 md:mt-0 flex items-center gap-2">
                <div className="flex items-center gap-1 bg-green-600 text-white px-3 py-2 rounded-lg">
                  <FaStar className="text-yellow-300" />
                  <span className="font-bold">{hotelDetails.rating?.stars?.toFixed(1) || '4.0'}</span>
                </div>
                {hotelDetails.rating?.provider && (
                  <span className="text-gray-500 text-sm">({hotelDetails.rating.provider})</span>
                )}
              </div>
            </div>
          </div>

          {/* Image Gallery */}
          <div className="mb-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Main large image */}
              <div className="md:col-span-2 md:row-span-2 relative h-64 md:h-96 rounded-xl overflow-hidden shadow-sm">
                <img 
                  src={images[selectedImage] || PLACEHOLDER_IMAGE}
                  alt={hotelDetails.name}
                  className="w-full h-full object-cover"
                />
                {images.length > 1 && (
                  <button
                    onClick={() => setShowAllImages(true)}
                    className="absolute bottom-4 right-4 bg-black/70 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-black/90 transition-colors"
                  >
                    <FaImage />
                    View All Photos ({images.length})
                  </button>
                )}
              </div>
              
              {/* Thumbnails */}
              {images.slice(1, 3).map((image, index) => (
                <div 
                  key={index}
                  className="hidden md:block h-48 rounded-xl overflow-hidden shadow-sm cursor-pointer hover:opacity-90 transition-opacity"
                  onClick={() => setSelectedImage(index + 1)}
                >
                  <img src={image} alt={`${hotelDetails.name} ${index + 2}`} className="w-full h-full object-cover" />
                </div>
              ))}
            </div>

            {/* Thumbnail strip for mobile */}
            <div className="flex gap-2 mt-4 overflow-x-auto pb-2 md:hidden">
              {images.map((image, index) => (
                <div 
                  key={index}
                  className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden cursor-pointer border-2 transition-all ${
                    selectedImage === index ? 'border-[#FD561E] scale-105' : 'border-transparent'
                  }`}
                  onClick={() => setSelectedImage(index)}
                >
                  <img src={image} alt={`Thumbnail ${index + 1}`} className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
          </div>

          {/* Hotel Details Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pb-12">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Description */}
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-xl font-bold text-gray-800 mb-4">About this hotel</h2>
                <p className="text-gray-600 leading-relaxed">
                  {hotelDetails.description || 
                   `Experience luxury and comfort at ${hotelDetails.name}. Located in the heart of the city, 
                    this hotel offers world-class amenities and exceptional service for both business and leisure travelers.`}
                </p>
              </div>

              {/* Amenities */}
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-xl font-bold text-gray-800 mb-4">Hotel Amenities</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {amenities.map((amenity, index) => {
                    const Icon = amenity.icon;
                    return (
                      <div key={index} className="flex items-center gap-3 text-gray-600">
                        <Icon className="text-[#FD561E] text-xl" />
                        <span>{amenity.label}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Rooms */}
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-xl font-bold text-gray-800 mb-4">Available Rooms</h2>
                <div className="space-y-4">
                  {rooms.map((room) => (
                    <div 
                      key={room.id} 
                      className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                      onClick={() => handleSelectRoom(room)}
                    >
                      <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <MdLocalHotel className="text-[#FD561E]" />
                            <h3 className="font-semibold text-gray-800">{room.type}</h3>
                          </div>
                          
                          <p className="text-sm text-gray-600 mb-2">{room.description}</p>
                          
                          <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                            <span className="flex items-center gap-1">
                              <FaUsers /> Max {room.maxOccupancy} guests
                            </span>
                            <span className="flex items-center gap-1">
                              <FaBed /> {room.bedType}
                            </span>
                            {room.size && (
                              <span className="flex items-center gap-1">
                                <MdMeetingRoom /> {room.size}
                              </span>
                            )}
                          </div>

                          {/* Room amenities */}
                          {room.amenities && room.amenities.length > 0 && (
                            <div className="flex flex-wrap gap-2 mt-3">
                              {room.amenities.slice(0, 4).map((amenity, idx) => (
                                <span key={idx} className="text-xs bg-gray-100 px-2 py-1 rounded">
                                  {amenity}
                                </span>
                              ))}
                              {room.amenities.length > 4 && (
                                <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                                  +{room.amenities.length - 4} more
                                </span>
                              )}
                            </div>
                          )}
                        </div>

                        <div className="mt-4 md:mt-0 md:ml-4 text-right">
                          <p className="text-2xl font-bold text-[#FD561E]">
                            ₹{room.price?.toLocaleString?.() || room.price}
                          </p>
                          <p className="text-sm text-gray-500 mb-2">per night</p>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleBookNow(room);
                            }}
                            className="px-4 py-2 bg-[#FD561E] text-white rounded-lg hover:bg-[#e54d1a] transition-colors"
                          >
                            Book Now
                          </button>
                        </div>
                      </div>

                      {/* Availability indicator */}
                      {room.available !== undefined && (
                        <div className="mt-2 flex items-center gap-1">
                          {room.available ? (
                            <>
                              <FaCheckCircle className="text-green-500 text-sm" />
                              <span className="text-xs text-green-600">Available</span>
                            </>
                          ) : (
                            <>
                              <FaTimesCircle className="text-red-500 text-sm" />
                              <span className="text-xs text-red-600">Not Available</span>
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Policies */}
              {hotelDetails.policies && (
                <div className="bg-white rounded-xl shadow-sm p-6">
                  <h2 className="text-xl font-bold text-gray-800 mb-4">Hotel Policies</h2>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <FaClock className="text-[#FD561E] mt-1" />
                      <div>
                        <p className="font-medium">Check-in / Check-out</p>
                        <p className="text-sm text-gray-600">
                          Check-in: {hotelDetails.checkInTime || '14:00'} | 
                          Check-out: {hotelDetails.checkOutTime || '12:00'}
                        </p>
                      </div>
                    </div>
                    
                    {hotelDetails.policies.cancellation && (
                      <div className="flex items-start gap-3">
                        <FaCreditCard className="text-[#FD561E] mt-1" />
                        <div>
                          <p className="font-medium">Cancellation Policy</p>
                          <p className="text-sm text-gray-600">{hotelDetails.policies.cancellation.policy}</p>
                        </div>
                      </div>
                    )}

                    {hotelDetails.policies.petPolicy && (
                      <div className="flex items-start gap-3">
                        <FaPaw className="text-[#FD561E] mt-1" />
                        <div>
                          <p className="font-medium">Pet Policy</p>
                          <p className="text-sm text-gray-600">{hotelDetails.policies.petPolicy}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar - Booking Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl shadow-sm p-6 sticky top-24">
                <h2 className="text-xl font-bold text-gray-800 mb-4">Your Stay</h2>
                
                <div className="space-y-4">
                  {/* Dates */}
                  <div className="border-b pb-4">
                    <p className="text-sm text-gray-500 mb-1">Check-in</p>
                    <p className="font-semibold">{new Date(getCheckInDate()).toLocaleDateString('en-IN', { 
                      weekday: 'short', 
                      year: 'numeric', 
                      month: 'short', 
                      day: 'numeric' 
                    })}</p>
                    
                    <p className="text-sm text-gray-500 mt-2 mb-1">Check-out</p>
                    <p className="font-semibold">{new Date(getCheckOutDate()).toLocaleDateString('en-IN', { 
                      weekday: 'short', 
                      year: 'numeric', 
                      month: 'short', 
                      day: 'numeric' 
                    })}</p>
                    
                    {/* Calculate number of nights */}
                    <p className="text-sm text-gray-600 mt-2">
                      {Math.ceil((new Date(getCheckOutDate()) - new Date(getCheckInDate())) / (1000 * 60 * 60 * 24))} nights
                    </p>
                  </div>

                  {/* Price Summary */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-gray-600">
                      <span>Price per night</span>
                      <span className="font-semibold">
                        {hotelDetails.price?.currency || 'INR'} {hotelDetails.price?.min?.toLocaleString?.() || hotelDetails.price?.min}
                      </span>
                    </div>
                    
                    <div className="flex justify-between text-gray-600">
                      <span>Taxes & fees</span>
                      <span className="font-semibold">
                        {hotelDetails.price?.currency || 'INR'} {Math.round((hotelDetails.price?.min || 0) * 0.12).toLocaleString()}
                      </span>
                    </div>
                    
                    <div className="border-t pt-4 mt-4">
                      <div className="flex justify-between font-bold text-gray-800">
                        <span>Total</span>
                        <span className="text-xl text-[#FD561E]">
                          {hotelDetails.price?.currency || 'INR'} {((hotelDetails.price?.min || 0) + Math.round((hotelDetails.price?.min || 0) * 0.12)).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">for 1 night, includes taxes & fees</p>
                    </div>
                  </div>

                  {/* Book Now Button */}
                  <button 
                    onClick={() => handleBookNow(rooms[0])}
                    className="w-full py-3 bg-[#FD561E] text-white rounded-lg hover:bg-[#e54d1a] transition-colors font-semibold mt-4"
                  >
                    Proceed to Book
                  </button>
                  
                  <p className="text-xs text-gray-500 text-center">
                    <FaCheckCircle className="inline text-green-500 mr-1" />
                    Free cancellation available
                  </p>
                </div>

                {/* Hotel Property Info (for debugging) */}
                {process.env.NODE_ENV === 'development' && (
                  <div className="mt-6 pt-4 border-t border-gray-200">
                    <p className="text-xs text-gray-400 mb-1">Hotel Code: {hotelDetails.hotelProperty?.hotelCode}</p>
                    <p className="text-xs text-gray-400 mb-1">Chain: {hotelDetails.hotelProperty?.hotelChain}</p>
                    <p className="text-xs text-gray-400">Vendor Key: {hotelDetails.hotelProperty?.vendorLocationKey}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Image Gallery Modal */}
      {showAllImages && (
        <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4">
          <button
            onClick={() => setShowAllImages(false)}
            className="absolute top-4 right-4 text-white text-2xl hover:text-gray-300"
          >
            ✕
          </button>
          
          <div className="max-w-5xl w-full">
            <div className="relative h-[70vh] mb-4">
              <img 
                src={images[selectedImage]} 
                alt={`Gallery ${selectedImage + 1}`}
                className="w-full h-full object-contain"
              />
            </div>
            
            <div className="flex gap-2 overflow-x-auto pb-2 justify-center">
              {images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                    selectedImage === index ? 'border-[#FD561E] scale-105' : 'border-transparent'
                  }`}
                >
                  <img src={image} alt={`Thumbnail ${index + 1}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Room Details Modal */}
      {showRoomDetails && selectedRoom && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-2xl font-bold text-gray-800">{selectedRoom.type}</h3>
                <button
                  onClick={() => setShowRoomDetails(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>

              {/* Room Image Placeholder */}
              <div className="h-48 bg-gray-200 rounded-lg mb-4 flex items-center justify-center">
                <FaImage className="text-gray-400 text-4xl" />
              </div>

              <p className="text-gray-600 mb-4">{selectedRoom.description}</p>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="bg-gray-50 p-3 rounded-lg">
                  <FaUsers className="text-[#FD561E] mb-1" />
                  <p className="text-sm text-gray-500">Max Occupancy</p>
                  <p className="font-semibold">{selectedRoom.maxOccupancy} guests</p>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <FaBed className="text-[#FD561E] mb-1" />
                  <p className="text-sm text-gray-500">Bed Type</p>
                  <p className="font-semibold">{selectedRoom.bedType}</p>
                </div>
                {selectedRoom.size && (
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <MdMeetingRoom className="text-[#FD561E] mb-1" />
                    <p className="text-sm text-gray-500">Room Size</p>
                    <p className="font-semibold">{selectedRoom.size}</p>
                  </div>
                )}
              </div>

              {selectedRoom.amenities && selectedRoom.amenities.length > 0 && (
                <div className="mb-4">
                  <h4 className="font-semibold mb-2">Room Amenities</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedRoom.amenities.map((amenity, idx) => (
                      <span key={idx} className="bg-gray-100 px-3 py-1 rounded-full text-sm">
                        {amenity}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="border-t pt-4 mt-4">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm text-gray-500">Price per night</p>
                    <p className="text-3xl font-bold text-[#FD561E]">
                      ₹{selectedRoom.price?.toLocaleString?.() || selectedRoom.price}
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      handleBookNow(selectedRoom);
                      setShowRoomDetails(false);
                    }}
                    className="px-6 py-3 bg-[#FD561E] text-white rounded-lg hover:bg-[#e54d1a] transition-colors font-semibold"
                  >
                    Book Now
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HotelDetails;