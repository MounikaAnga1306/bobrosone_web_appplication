// src/modules/flights/pages/BookingReviewPage.jsx

import React, { useState, useMemo, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  FaArrowLeft,
  FaPlane,
  FaCalendarAlt,
  FaUserFriends,
  FaSuitcase,
  FaShieldAlt,
  FaExchangeAlt,
  FaClock,
  FaCreditCard,
  FaCheckCircle,
  FaInfoCircle,
  FaRupeeSign,
  FaTag,
  FaUtensils,
  FaChair,
  FaWifi,
  FaTv,
  FaStar,
  FaCrown,
  FaGem,
  FaArrowRight,
  FaFileInvoice,
  FaReceipt,
  FaPercent,
  FaUndo,
  FaWallet,
  FaList,
  FaUser,
  FaEnvelope,
  FaPhone,
  FaVenusMars,
  FaCcVisa,
  FaCcMastercard,
  FaMobileAlt,
  FaMoneyBillWave,
  FaTicketAlt,
  FaBriefcase,
  FaExclamationTriangle,
  FaRoute,
  FaStopwatch,
  FaLuggageCart,
  FaSpinner,
  FaCheck
} from 'react-icons/fa';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import pnrCreationService from '../services/pnr_creationService';

// ============ HELPER FUNCTIONS ============
const formatTime = (isoString) => {
  if (!isoString) return '--:--';
  try {
    const date = new Date(isoString);
    return date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
  } catch {
    return '--:--';
  }
};

const formatDate = (isoString) => {
  if (!isoString) return '';
  try {
    const date = new Date(isoString);
    return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  } catch {
    return '';
  }
};

const formatDateTime = (isoString) => {
  if (!isoString) return '';
  return `${formatDate(isoString)}, ${formatTime(isoString)}`;
};

const formatDuration = (minutes) => {
  if (!minutes) return '0h 0m';
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours}h ${mins}m`;
};

const formatPrice = (price) => {
  if (!price) return '₹0';
  return `₹${price.toLocaleString('en-IN')}`;
};

const getBrandIcon = (brandName) => {
  const name = brandName?.toLowerCase() || '';
  if (name.includes('business') || name.includes('first')) return <FaCrown className="text-amber-500" size={20} />;
  if (name.includes('premium')) return <FaStar className="text-purple-500" size={20} />;
  if (name.includes('flex') || name.includes('flexi')) return <FaGem className="text-blue-500" size={20} />;
  if (name.includes('sale')) return <FaTag className="text-green-500" size={20} />;
  return <FaTag className="text-[#FD561E]" size={20} />;
};

const getBrandColor = (brandName) => {
  const name = brandName?.toLowerCase() || '';
  if (name.includes('business')) return 'from-amber-500 to-amber-600';
  if (name.includes('premium')) return 'from-purple-500 to-purple-600';
  if (name.includes('flex')) return 'from-blue-500 to-blue-600';
  if (name.includes('sale')) return 'from-green-500 to-green-600';
  return 'from-[#FD561E] to-[#ff7b4a]';
};

const calculateAge = (dob) => {
  if (!dob) return 0;
  const today = new Date();
  const birthDate = new Date(dob);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) age--;
  return age;
};

const BookingReviewPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state || {};
  
  // ============ DATA EXTRACTION ============
  const isRoundTrip = state.tripType === 'round-trip';
  const rawPricingResponse = state.rawPricingResponse;
  const pricingResult = state.pricingResult;
  
  // Flight data
  const flightData = pricingResult?.flight;
  const allPricingOptions = pricingResult?.pricingOptions || [];
  
  // Determine flights based on trip type
  const outboundFlight = isRoundTrip ? (flightData?.[0] || state.outboundFlight) : null;
  const returnFlight = isRoundTrip ? (flightData?.[1] || state.returnFlight) : null;
  const oneWayFlight = !isRoundTrip ? (state.flight || flightData) : null;
  
  // Fares
  const outboundFare = state.selectedOutboundFare;
  const returnFare = state.selectedReturnFare;
  const selectedFare = state.selectedFare;
  
  // Passenger counts and total
  const passengerCounts = state.passengerCounts || { ADT: 1, CNN: 0, INF: 0 };
  const totalPrice = state.totalPrice || pricingResult?.pricingOptions?.[0]?.totalPrice;
  
  // ============ UI STATES ============
  const [activeLeg, setActiveLeg] = useState('outbound');
  const [selectedPricingOption, setSelectedPricingOption] = useState(allPricingOptions[0] || null);
  const [activeTab, setActiveTab] = useState('fare-details');
  const [loading, setLoading] = useState(false);
  const [expandedFareCard, setExpandedFareCard] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('Cash');
  
  // ============ PASSENGER DETAILS ============
  const [passengers, setPassengers] = useState(() => {
    const initialPassengers = [];
    const adultCount = passengerCounts?.ADT || 1;
    const childCount = passengerCounts?.CNN || 0;
    const infantCount = passengerCounts?.INF || 0;
    
    for (let i = 0; i < adultCount; i++) {
      initialPassengers.push({
        id: `adt-${i}`,
        code: 'ADT',
        type: 'Adult',
        title: 'Adult',
        firstName: '',
        lastName: '',
        dob: '',
        gender: '',
        nationality: 'IN'
      });
    }
    for (let i = 0; i < childCount; i++) {
      initialPassengers.push({
        id: `cnn-${i}`,
        code: 'CNN',
        type: 'Child',
        title: 'Child',
        firstName: '',
        lastName: '',
        dob: '',
        gender: '',
        nationality: 'IN'
      });
    }
    for (let i = 0; i < infantCount; i++) {
      initialPassengers.push({
        id: `inf-${i}`,
        code: 'INF',
        type: 'Infant',
        title: 'Infant',
        firstName: '',
        lastName: '',
        dob: '',
        gender: '',
        nationality: 'IN'
      });
    }
    return initialPassengers;
  });
  
  const [contactInfo, setContactInfo] = useState({
    email: '',
    phone: { countryCode: '91', number: '' }
  });
  
  const [errors, setErrors] = useState({});
  
  // Current flight based on active leg
  const currentFlight = isRoundTrip
    ? (activeLeg === 'outbound' ? outboundFlight : returnFlight)
    : oneWayFlight;
  
  const currentFare = isRoundTrip 
    ? (activeLeg === 'outbound' ? outboundFare : returnFare)
    : selectedFare;
  
  const selectedFareDetails = selectedPricingOption || currentFare;
  
  // ============ UPDATE PASSENGER ============
  const updatePassenger = (index, field, value) => {
    const updated = [...passengers];
    updated[index][field] = value;
    setPassengers(updated);
    if (errors[`passenger_${index}_${field}`]) {
      const newErrors = { ...errors };
      delete newErrors[`passenger_${index}_${field}`];
      setErrors(newErrors);
    }
  };
  
  // ============ VALIDATION FUNCTIONS ============
  const validateForm = useCallback(() => {
    const newErrors = {};
    
    passengers.forEach((passenger, idx) => {
      if (!passenger.firstName.trim()) newErrors[`passenger_${idx}_firstName`] = 'First name is required';
      if (!passenger.lastName.trim()) newErrors[`passenger_${idx}_lastName`] = 'Last name is required';
      if (!passenger.dob) newErrors[`passenger_${idx}_dob`] = 'Date of birth is required';
      else {
        const age = calculateAge(passenger.dob);
        if (passenger.code === 'ADT' && age < 12) newErrors[`passenger_${idx}_dob`] = 'Adult must be 12 years or older';
        if (passenger.code === 'CNN' && (age < 2 || age > 11)) newErrors[`passenger_${idx}_dob`] = 'Child must be between 2-11 years';
        if (passenger.code === 'INF' && age > 2) newErrors[`passenger_${idx}_dob`] = 'Infant must be under 2 years';
      }
      if (!passenger.gender) newErrors[`passenger_${idx}_gender`] = 'Gender is required';
    });
    
    if (!contactInfo.email.trim()) newErrors.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contactInfo.email)) newErrors.email = 'Invalid email format';
    
    if (!contactInfo.phone.number.trim()) newErrors.phone = 'Phone number is required';
    else if (!/^\d{10}$/.test(contactInfo.phone.number)) newErrors.phone = 'Invalid phone number (10 digits required)';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [passengers, contactInfo]);
  
  // Fix: Make isFormValid a function that checks validity
  const isFormValid = useCallback(() => {
    const allPassengersValid = passengers.every(p => p.firstName.trim() && p.lastName.trim() && p.dob && p.gender);
    const contactValid = contactInfo.email.trim() && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contactInfo.email) && 
                         contactInfo.phone.number.trim() && /^\d{10}$/.test(contactInfo.phone.number);
    return allPassengersValid && contactValid;
  }, [passengers, contactInfo]);
  
  // ============ BOOKING HANDLER ============

const handleProceedToBooking = async () => {
  if (!validateForm()) {
    toast.error('Please fill in all required fields');
    return;
  }
  
  setLoading(true);
  
  // Prepare all booking data to pass to seat map page
  const bookingDataForSeatMap = {
    // Raw pricing response (complete SOAP response)
    rawPricingResponse: rawPricingResponse,
    
    // Transformed pricing result
    pricingResult: pricingResult,
    
    // Selected fare option
    selectedPricingOption: selectedPricingOption,
    
    // Flight data
    flight: oneWayFlight,
    outboundFlight: outboundFlight,
    returnFlight: returnFlight,
    isRoundTrip: isRoundTrip,
    
    // Passenger data
    passengers: passengers,
    passengerCounts: passengerCounts,
    
    // Contact information
    contactInfo: contactInfo,
    
    // Payment method
    paymentMethod: paymentMethod,
    
    // Trace ID
    traceId: pricingResult?.traceId || `BOOK-${Date.now()}`,
    
    // Total price
    totalPrice: totalPrice,
    
    // Trip type
    tripType: isRoundTrip ? 'round-trip' : 'one-way',
    
    // Fare details
    selectedFare: selectedFare,
    outboundFare: outboundFare,
    returnFare: returnFare,
    
    // Timestamp
    timestamp: new Date().toISOString()
  };
  
  try {
    // Navigate to seat map page with all booking data
    navigate('/flights/booking/seat-map', {
      state: {
        bookingData: bookingDataForSeatMap
      }
    });
  } catch (error) {
    console.error('Navigation to seat map failed:', error);
    toast.error('Unable to proceed to seat selection');
  } finally {
    setLoading(false);
  }
};
  
  // ============ RENDER FLIGHT CARD ============
  const renderFlightCard = (flight, legType) => {
    if (!flight) return null;
    
    const isReturn = legType === 'return';
    const bgGradient = isReturn ? 'from-emerald-500 to-emerald-600' : 'from-[#FD561E] to-[#ff7b4a]';
    const segments = flight.segments || [];
    const totalDuration = flight.duration || flight.flightTime || segments.reduce((sum, seg) => sum + (seg.flightTime || 0), 0);
    const stops = segments.length - 1;
    
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-6">
        <div className={`p-4 text-white bg-gradient-to-r ${bgGradient}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <FaPlane className={isReturn ? '-rotate-45' : 'rotate-45'} size={20} />
              <h3 className="font-semibold text-lg">
                {legType === 'outbound' ? 'Outbound Flight' : 'Return Flight'}
              </h3>
              <span className="text-xs bg-white/20 px-2 py-1 rounded-full">
                {segments[0]?.carrier} {segments[0]?.flightNumber}
              </span>
            </div>
            <div className="text-right text-sm">
              <div className="flex items-center gap-2">
                <FaCalendarAlt size={12} />
                <span>{formatDate(segments[0]?.departureTime)}</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="p-5">
          {/* Flight Segments */}
          <div className="space-y-6">
            {segments.map((segment, idx) => (
              <div key={idx} className="relative">
                {idx > 0 && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-amber-100 px-3 py-1 rounded-full text-xs text-amber-700 z-10 shadow-sm">
                    <FaRoute className="inline mr-1" size={10} /> {formatDuration(segment.duration || segment.flightTime)}
                  </div>
                )}
                <div className={`p-4 rounded-xl ${idx > 0 ? 'bg-gray-50 border-l-4 border-amber-400' : 'bg-white border border-gray-100'}`}>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center">
                        <span className="font-bold text-gray-700">{segment.carrier}</span>
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900">{segment.flightNumber}</div>
                        <div className="text-xs text-gray-500">
                          {segment.operatingCarrier && segment.operatingCarrier !== segment.carrier && `Operated by ${segment.operatingCarrier}`}
                        </div>
                      </div>
                    </div>
                    <div className="text-xs text-gray-500">
                      Class: {segment.bookingCode || segment.classOfService}
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="text-center flex-1">
                      <div className="text-2xl font-bold text-gray-900">{formatTime(segment.departureTime)}</div>
                      <div className="text-sm font-medium text-gray-700 mt-1">{segment.origin}</div>
                      <div className="text-xs text-gray-400">{formatDate(segment.departureTime)}</div>
                    </div>
                    <div className="flex-1 px-4">
                      <div className="relative">
                        <div className="w-full h-0.5 bg-gray-300"></div>
                        <FaPlane className="absolute text-[#FD561E] transform -translate-x-1/2 -translate-y-1/2 left-1/2 top-1/2 rotate-90 bg-white px-1" size={14} />
                      </div>
                      <div className="text-center text-xs text-gray-500 mt-2">
                        <FaStopwatch className="inline mr-1" size={10} /> {formatDuration(segment.flightTime)}
                      </div>
                    </div>
                    <div className="text-center flex-1">
                      <div className="text-2xl font-bold text-gray-900">{formatTime(segment.arrivalTime)}</div>
                      <div className="text-sm font-medium text-gray-700 mt-1">{segment.destination}</div>
                      <div className="text-xs text-gray-400">{formatDate(segment.arrivalTime)}</div>
                    </div>
                  </div>
                  
                  {segment.equipment && (
                    <div className="mt-3 text-xs text-gray-400 text-center">
                      Aircraft: {segment.equipment}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
          
          {/* Flight Stats */}
          <div className="mt-5 pt-4 border-t flex justify-between text-sm text-gray-500">
            <span className="flex items-center gap-1">
              <FaClock size={12} /> Total: {formatDuration(totalDuration)}
            </span>
            <span className="flex items-center gap-1">
              <FaRoute size={12} /> {stops === 0 ? 'Direct' : `${stops} Stop${stops > 1 ? 's' : ''}`}
            </span>
            <span className="flex items-center gap-1">
              <FaLuggageCart size={12} /> {flight.distance || '788'} km
            </span>
          </div>
        </div>
      </div>
    );
  };
  
  // ============ RENDER FARE OPTION CARD ============
  const renderFareOptionCard = (option, index) => {
    const isSelected = selectedPricingOption?.key === option.key;
    const isExpanded = expandedFareCard === option.key;
    
    // Get brand name
    let brandName = 'Economy';
    if (option.brand) {
      if (Array.isArray(option.brand)) {
        brandName = option.brand.map(b => b?.name).filter(Boolean).join(' / ') || 'Economy';
      } else {
        brandName = option.brand.name || 'Economy';
      }
    }
    
    const firstBookingInfo = Array.isArray(option.bookingInfo) ? option.bookingInfo[0] : option.bookingInfo;
    const cabinClass = firstBookingInfo?.cabinClass || 'Economy';
    const hasMultipleSegments = (Array.isArray(option.bookingInfo) && option.bookingInfo.length > 1) ||
                                (Array.isArray(option.fareInfo) && option.fareInfo.length > 1);
    
    const brandColor = getBrandColor(brandName);
    
    return (
      <div
        className={`border-2 rounded-xl transition-all cursor-pointer ${
          isSelected 
            ? 'border-[#FD561E] bg-orange-50 shadow-md' 
            : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
        }`}
      >
        <div 
          className="p-4"
          onClick={() => {
            setSelectedPricingOption(option);
            setExpandedFareCard(isExpanded ? null : option.key);
          }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-12 h-12 rounded-full bg-gradient-to-r ${brandColor} flex items-center justify-center text-white shadow-sm`}>
                {getBrandIcon(brandName)}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="font-bold text-gray-800 text-lg">{brandName}</h4>
                  {index === 0 && (
                    <span className="text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full">Best Price</span>
                  )}
                  {hasMultipleSegments && (
                    <span className="text-[10px] bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full">
                      {Array.isArray(option.bookingInfo) ? option.bookingInfo.length : 1} Segments
                    </span>
                  )}
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  {cabinClass} • {Array.isArray(option.fareInfo) ? option.fareInfo[0]?.fareBasis : option.fareInfo?.fareBasis || 'N/A'}
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-[#FD561E]">{formatPrice(option.totalPrice)}</div>
              <div className="text-xs text-gray-500">Total for {passengerCounts?.ADT || 1} Adult(s)</div>
            </div>
          </div>
          
          {isExpanded && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="text-gray-500 mb-1">Base Price</div>
                  <div className="font-semibold">{formatPrice(option.basePrice)}</div>
                </div>
                <div>
                  <div className="text-gray-500 mb-1">Taxes & Fees</div>
                  <div className="font-semibold">{formatPrice(option.taxes)}</div>
                </div>
                <div>
                  <div className="text-gray-500 mb-1">Booking Code</div>
                  <div className="font-mono text-sm">{firstBookingInfo?.bookingCode || 'N/A'}</div>
                </div>
                <div>
                  <div className="text-gray-500 mb-1">Fare Basis</div>
                  <div className="font-mono text-sm">
                    {Array.isArray(option.fareInfo) ? option.fareInfo.map(f => f.fareBasis).join(', ') : option.fareInfo?.fareBasis || 'N/A'}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
        
        {isSelected && !isExpanded && (
          <div className="px-4 pb-4">
            <div className="flex items-center gap-2 text-xs text-green-600 bg-green-50 p-2 rounded-lg">
              <FaCheckCircle size={12} />
              <span>Selected fare option</span>
            </div>
          </div>
        )}
      </div>
    );
  };
  
  // ============ RENDER FARE DETAILS TAB ============
  const renderFareDetailsTab = () => {
    const firstFareInfo = Array.isArray(selectedFareDetails?.fareInfo) 
      ? selectedFareDetails.fareInfo[0] 
      : selectedFareDetails?.fareInfo;
    const firstBookingInfo = Array.isArray(selectedFareDetails?.bookingInfo) 
      ? selectedFareDetails.bookingInfo[0] 
      : selectedFareDetails?.bookingInfo;
    
    return (
      <div className="space-y-5">
        {/* Price Summary */}
        <div className="bg-gradient-to-r from-gray-50 to-white rounded-xl p-5 border border-gray-200">
          <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <FaRupeeSign className="text-[#FD561E]" size={18} />
            Price Breakdown
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center pb-2 border-b border-gray-100">
              <span className="text-gray-600">Base Fare</span>
              <span className="font-semibold text-gray-800">{formatPrice(selectedFareDetails?.basePrice)}</span>
            </div>
            <div className="flex justify-between items-center pb-2 border-b border-gray-100">
              <span className="text-gray-600">Taxes & Surcharges</span>
              <span className="font-semibold text-gray-800">{formatPrice(selectedFareDetails?.taxes)}</span>
            </div>
            <div className="flex justify-between items-center pt-3">
              <span className="text-lg font-bold text-gray-900">Total</span>
              <span className="text-2xl font-bold text-[#FD561E]">{formatPrice(selectedFareDetails?.totalPrice)}</span>
            </div>
          </div>
        </div>
        
        {/* Fare Information */}
        <div className="bg-gray-50 rounded-xl p-5">
          <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <FaTicketAlt className="text-[#FD561E]" size={16} />
            Fare Information
          </h3>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <div className="text-xs text-gray-500 mb-1">Fare Basis</div>
              <div className="font-mono text-sm font-semibold text-gray-800">{firstFareInfo?.fareBasis || 'N/A'}</div>
            </div>
            <div>
              <div className="text-xs text-gray-500 mb-1">Booking Code</div>
              <div className="font-mono text-sm font-semibold text-gray-800">{firstBookingInfo?.bookingCode || 'N/A'}</div>
            </div>
            <div>
              <div className="text-xs text-gray-500 mb-1">Cabin Class</div>
              <div className="text-sm font-semibold text-gray-800">{firstBookingInfo?.cabinClass || 'Economy'}</div>
            </div>
            <div>
              <div className="text-xs text-gray-500 mb-1">Refundable</div>
              <div className={`text-sm font-semibold ${selectedFareDetails?.refundable ? 'text-green-600' : 'text-red-600'}`}>
                {selectedFareDetails?.refundable ? 'Yes' : 'No'}
              </div>
            </div>
          </div>
        </div>
        
        {/* Segment-wise Fare Details for Round Trip */}
        {Array.isArray(selectedFareDetails?.fareInfo) && selectedFareDetails.fareInfo.length > 1 && (
          <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
            <h4 className="text-sm font-semibold text-blue-800 mb-3 flex items-center gap-2">
              <FaPlane size={14} /> Segment-wise Fare Details
            </h4>
            <div className="space-y-3">
              {selectedFareDetails.fareInfo.map((info, idx) => {
                const segment = flightData?.[idx];
                return (
                  <div key={idx} className="border-b border-blue-200 last:border-0 pb-2 last:pb-0">
                    <div className="flex justify-between items-center text-sm">
                      <span className="font-medium text-blue-700">
                        {info.origin || segment?.origin || 'Unknown'} → {info.destination || segment?.destination || 'Unknown'}
                      </span>
                      <span className="font-mono text-xs">{info.fareBasis}</span>
                    </div>
                    <div className="flex justify-between text-xs text-gray-600 mt-1">
                      <span>Effective: {formatDate(info.effectiveDate)}</span>
                      <span>Amount: {formatPrice(info.amount)}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
        
        {/* Brand Features */}
        {selectedFareDetails?.brand && (
          <div className="bg-purple-50 rounded-xl p-4 border border-purple-200">
            <h4 className="text-sm font-semibold text-purple-800 mb-2 flex items-center gap-2">
              {getBrandIcon(Array.isArray(selectedFareDetails.brand) ? selectedFareDetails.brand[0]?.name : selectedFareDetails.brand.name)} Brand Features
            </h4>
            {Array.isArray(selectedFareDetails.brand) ? (
              selectedFareDetails.brand.map((brand, idx) => (
                <div key={idx} className="mt-2">
                  <p className="text-sm font-medium text-purple-700">{brand.name}</p>
                  <p className="text-xs text-purple-600 mt-1">{brand.description}</p>
                  {idx < selectedFareDetails.brand.length - 1 && <div className="border-t border-purple-200 my-2"></div>}
                </div>
              ))
            ) : (
              <>
                <p className="text-sm font-medium text-purple-700">{selectedFareDetails.brand.name}</p>
                <p className="text-xs text-purple-600 mt-1">{selectedFareDetails.brand.description}</p>
              </>
            )}
          </div>
        )}
      </div>
    );
  };
  
  // ============ RENDER FARE RULES TAB ============
  const renderFareRulesTab = () => {
    const penalties = selectedFareDetails?.penalties;
    
    return (
      <div className="space-y-5">
        <div className="bg-blue-50 rounded-xl p-5 border border-blue-200">
          <h3 className="font-semibold text-blue-800 mb-3 flex items-center gap-2">
            <FaExchangeAlt className="text-blue-600" size={18} />
            Change Policy
          </h3>
          {penalties?.change ? (
            <div>
              <p className="text-sm text-gray-700">
                {penalties.change.amount 
                  ? `Change Fee: ${formatPrice(penalties.change.amount)}`
                  : penalties.change.percentage 
                    ? `Change Fee: ${penalties.change.percentage}% of fare`
                    : 'Changes not permitted'}
              </p>
              {penalties.change.applies && (
                <p className="text-xs text-gray-500 mt-1">Applies: {penalties.change.applies}</p>
              )}
            </div>
          ) : (
            <p className="text-sm text-gray-600">Changeable with applicable charges</p>
          )}
        </div>
        
        <div className="bg-red-50 rounded-xl p-5 border border-red-200">
          <h3 className="font-semibold text-red-800 mb-3 flex items-center gap-2">
            <FaUndo className="text-red-600" size={18} />
            Cancellation Policy
          </h3>
          {penalties?.cancel ? (
            <div>
              <p className="text-sm text-gray-700">
                {penalties.cancel.amount 
                  ? `Cancellation Fee: ${formatPrice(penalties.cancel.amount)}`
                  : penalties.cancel.percentage 
                    ? `Cancellation Fee: ${penalties.cancel.percentage}% of fare`
                    : selectedFareDetails?.refundable 
                      ? 'Refundable with applicable fees' 
                      : 'Non-refundable'}
              </p>
              {penalties.cancel.applies && (
                <p className="text-xs text-gray-500 mt-1">Applies: {penalties.cancel.applies}</p>
              )}
            </div>
          ) : (
            <p className="text-sm text-gray-600">
              {selectedFareDetails?.refundable ? 'Refundable with applicable cancellation fees' : 'Non-refundable'}
            </p>
          )}
        </div>
      </div>
    );
  };
  
  // ============ RENDER BAGGAGE TAB ============
  const renderBaggageTab = () => {
    const baggage = selectedFareDetails?.baggage;
    const checkedBaggage = baggage?.checked?.weight_kg || baggage?.checked?.pieces || '15';
    const cabinBaggage = baggage?.cabin || '7';
    
    return (
      <div className="space-y-5">
        <div className="grid grid-cols-2 gap-5">
          <div className="bg-green-50 rounded-xl p-6 text-center border border-green-200">
            <FaSuitcase className="text-green-600 mx-auto mb-3" size={40} />
            <h3 className="font-medium text-gray-800 mb-2">Check-in Baggage</h3>
            <p className="text-3xl font-bold text-green-700">{checkedBaggage}kg</p>
            <p className="text-xs text-gray-500 mt-2">per passenger</p>
          </div>
          <div className="bg-blue-50 rounded-xl p-6 text-center border border-blue-200">
            <FaBriefcase className="text-blue-600 mx-auto mb-3" size={40} />
            <h3 className="font-medium text-gray-800 mb-2">Cabin Baggage</h3>
            <p className="text-3xl font-bold text-blue-700">{cabinBaggage}kg</p>
            <p className="text-xs text-gray-500 mt-2">per passenger</p>
          </div>
        </div>
        <div className="bg-gray-50 rounded-xl p-4 text-center text-xs text-gray-500">
          <FaInfoCircle className="inline mr-1" size={12} />
          Baggage allowances are included in the fare
        </div>
      </div>
    );
  };
  
  // ============ RENDER TAXES TAB ============
  const renderTaxesTab = () => {
    const taxBreakdown = selectedFareDetails?.taxBreakdown || [];
    
    return (
      <div className="bg-gray-50 rounded-xl p-5">
        <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <FaWallet className="text-[#FD561E]" size={18} />
          Tax Breakdown
        </h3>
        <div className="space-y-2">
          {taxBreakdown.length > 0 ? (
            taxBreakdown.map((tax, idx) => (
              <div key={idx} className="flex justify-between items-center py-2 border-b border-gray-200 last:border-0">
                <span className="text-gray-600">
                  {tax.carrierDefinedCategory || tax.category} Tax
                </span>
                <span className="font-medium text-gray-800">{formatPrice(tax.amount)}</span>
              </div>
            ))
          ) : (
            <div className="flex justify-between items-center py-2">
              <span className="text-gray-600">Total Taxes</span>
              <span className="font-medium text-gray-800">{formatPrice(selectedFareDetails?.taxes)}</span>
            </div>
          )}
          <div className="flex justify-between items-center pt-3 mt-2 border-t-2 border-gray-300">
            <span className="font-semibold text-gray-800">Total Taxes & Fees</span>
            <span className="font-bold text-[#FD561E] text-lg">{formatPrice(selectedFareDetails?.taxes)}</span>
          </div>
        </div>
      </div>
    );
  };
  
  // ============ RENDER AMENITIES TAB ============
  const renderAmenitiesTab = () => {
    const amenities = [
      { icon: FaUtensils, name: 'Meals', color: 'green', available: true, description: 'Available for purchase' },
      { icon: FaChair, name: 'Seat Selection', color: 'blue', available: true, description: 'Available for purchase' },
      { icon: FaWifi, name: 'Wi-Fi', color: 'purple', available: true, description: 'Available on select aircraft' },
      { icon: FaTv, name: 'Entertainment', color: 'amber', available: true, description: 'In-flight entertainment' },
    ];
    
    return (
      <div className="space-y-5">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {amenities.map((amenity, idx) => (
            <div key={idx} className={`bg-${amenity.color}-50 rounded-xl p-4 text-center border border-${amenity.color}-200`}>
              <amenity.icon className={`text-${amenity.color}-600 mx-auto mb-2`} size={28} />
              <p className="text-sm font-medium text-gray-800">{amenity.name}</p>
              <p className="text-xs text-gray-500 mt-1">{amenity.description}</p>
            </div>
          ))}
        </div>
        
        {selectedFareDetails?.brand && (
          <div className="bg-gray-50 rounded-xl p-4">
            <h4 className="text-sm font-semibold text-gray-700 mb-2">Included in this fare</h4>
            <div className="flex flex-wrap gap-2">
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm">
                <FaCheck size={12} /> {selectedFareDetails.baggage?.checked?.weight_kg || 15}kg Check-in
              </span>
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm">
                <FaCheck size={12} /> {selectedFareDetails.baggage?.cabin || 7}kg Cabin
              </span>
            </div>
          </div>
        )}
      </div>
    );
  };
  
  // ============ RENDER PASSENGER FORM ============
  const renderPassengerForm = () => {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="bg-gray-50 p-4 border-b">
          <div className="flex items-center gap-2">
            <FaUser className="text-[#FD561E]" size={18} />
            <h2 className="font-semibold text-gray-800">Passenger Details</h2>
            <span className="text-xs text-gray-500 ml-auto">{passengers.length} passenger(s)</span>
          </div>
        </div>
        <div className="p-5 space-y-5">
          {passengers.map((passenger, idx) => (
            <div key={passenger.id} className="border rounded-xl p-5 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-4 pb-3 border-b">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    passenger.code === 'ADT' ? 'bg-blue-100' : passenger.code === 'CNN' ? 'bg-green-100' : 'bg-yellow-100'
                  }`}>
                    <FaUser className={
                      passenger.code === 'ADT' ? 'text-blue-600' : passenger.code === 'CNN' ? 'text-green-600' : 'text-yellow-600'
                    } size={16} />
                  </div>
                  <div>
                    <span className="font-semibold text-gray-800">{passenger.title}</span>
                    <p className="text-xs text-gray-500">{passenger.code}</p>
                  </div>
                </div>
                <span className="text-xs bg-gray-100 px-3 py-1 rounded-full text-gray-600">Passenger {idx + 1}</span>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">First Name *</label>
                  <input 
                    type="text" 
                    value={passenger.firstName} 
                    onChange={(e) => updatePassenger(idx, 'firstName', e.target.value)} 
                    className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-[#FD561E] focus:border-transparent ${
                      errors[`passenger_${idx}_firstName`] ? 'border-red-500' : 'border-gray-300'
                    }`} 
                    placeholder="Enter first name" 
                  />
                  {errors[`passenger_${idx}_firstName`] && <p className="text-xs text-red-500 mt-1">{errors[`passenger_${idx}_firstName`]}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Last Name *</label>
                  <input 
                    type="text" 
                    value={passenger.lastName} 
                    onChange={(e) => updatePassenger(idx, 'lastName', e.target.value)} 
                    className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-[#FD561E] focus:border-transparent ${
                      errors[`passenger_${idx}_lastName`] ? 'border-red-500' : 'border-gray-300'
                    }`} 
                    placeholder="Enter last name" 
                  />
                  {errors[`passenger_${idx}_lastName`] && <p className="text-xs text-red-500 mt-1">{errors[`passenger_${idx}_lastName`]}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Date of Birth *</label>
                  <input 
                    type="date" 
                    value={passenger.dob} 
                    onChange={(e) => updatePassenger(idx, 'dob', e.target.value)} 
                    className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-[#FD561E] ${
                      errors[`passenger_${idx}_dob`] ? 'border-red-500' : 'border-gray-300'
                    }`} 
                  />
                  {errors[`passenger_${idx}_dob`] && <p className="text-xs text-red-500 mt-1">{errors[`passenger_${idx}_dob`]}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Gender *</label>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input 
                        type="radio" 
                        name={`gender_${idx}`} 
                        value="M" 
                        checked={passenger.gender === 'M'} 
                        onChange={(e) => updatePassenger(idx, 'gender', e.target.value)} 
                        className="w-4 h-4 text-[#FD561E]" 
                      />
                      <FaVenusMars className="text-blue-500" size={14} />
                      <span className="text-sm">Male</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input 
                        type="radio" 
                        name={`gender_${idx}`} 
                        value="F" 
                        checked={passenger.gender === 'F'} 
                        onChange={(e) => updatePassenger(idx, 'gender', e.target.value)} 
                        className="w-4 h-4 text-[#FD561E]" 
                      />
                      <FaVenusMars className="text-pink-500" size={14} />
                      <span className="text-sm">Female</span>
                    </label>
                  </div>
                  {errors[`passenger_${idx}_gender`] && <p className="text-xs text-red-500 mt-1">{errors[`passenger_${idx}_gender`]}</p>}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };
  
  // ============ RENDER CONTACT FORM ============
  const renderContactForm = () => {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="bg-gray-50 p-4 border-b">
          <div className="flex items-center gap-2">
            <FaPhone className="text-[#FD561E]" size={18} />
            <h2 className="font-semibold text-gray-800">Contact Information</h2>
          </div>
        </div>
        <div className="p-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email Address *</label>
              <div className="relative">
                <FaEnvelope className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                <input 
                  type="email" 
                  value={contactInfo.email} 
                  onChange={(e) => setContactInfo({ ...contactInfo, email: e.target.value })} 
                  className={`w-full pl-10 pr-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-[#FD561E] ${
                    errors.email ? 'border-red-500' : 'border-gray-300'
                  }`} 
                  placeholder="Enter email address" 
                />
              </div>
              {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number *</label>
              <div className="flex gap-3">
                <select 
                  value={contactInfo.phone.countryCode} 
                  onChange={(e) => setContactInfo({ ...contactInfo, phone: { ...contactInfo.phone, countryCode: e.target.value } })} 
                  className="w-28 px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FD561E]"
                >
                  <option value="91">+91 (IN)</option>
                  <option value="1">+1 (US)</option>
                  <option value="44">+44 (UK)</option>
                  <option value="971">+971 (AE)</option>
                </select>
                <div className="flex-1 relative">
                  <FaPhone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                  <input 
                    type="tel" 
                    value={contactInfo.phone.number} 
                    onChange={(e) => setContactInfo({ ...contactInfo, phone: { ...contactInfo.phone, number: e.target.value } })} 
                    className={`w-full pl-10 pr-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-[#FD561E] ${
                      errors.phone ? 'border-red-500' : 'border-gray-300'
                    }`} 
                    placeholder="9876543210" 
                    maxLength="10" 
                  />
                </div>
              </div>
              {errors.phone && <p className="text-xs text-red-500 mt-1">{errors.phone}</p>}
            </div>
          </div>
        </div>
      </div>
    );
  };
  
  // ============ RENDER PAYMENT METHODS ============
  const renderPaymentMethods = () => {
    const methods = [
      { id: 'Cash', icon: FaMoneyBillWave, name: 'Cash', color: 'green' },
      { id: 'Card', icon: FaCreditCard, name: 'Card', color: 'blue', subIcons: [FaCcVisa, FaCcMastercard] },
      { id: 'UPI', icon: FaMobileAlt, name: 'UPI', color: 'purple' },
    ];
    
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="bg-gray-50 p-4 border-b">
          <div className="flex items-center gap-2">
            <FaWallet className="text-[#FD561E]" size={18} />
            <h2 className="font-semibold text-gray-800">Payment Method</h2>
          </div>
        </div>
        <div className="p-5">
          <div className="grid grid-cols-3 gap-4">
            {methods.map((method) => (
              <button 
                key={method.id}
                onClick={() => setPaymentMethod(method.id)} 
                className={`p-5 rounded-xl border-2 transition-all text-center ${
                  paymentMethod === method.id 
                    ? `border-[#FD561E] bg-orange-50` 
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }`}
              >
                <method.icon className={`text-3xl mx-auto mb-2 ${paymentMethod === method.id ? 'text-[#FD561E]' : 'text-gray-400'}`} />
                {method.subIcons && (
                  <div className="flex justify-center gap-2 mb-2">
                    {method.subIcons.map((Icon, i) => (
                      <Icon key={i} className={`text-xl ${paymentMethod === method.id ? 'text-[#FD561E]' : 'text-gray-400'}`} />
                    ))}
                  </div>
                )}
                <p className="text-sm font-medium text-center">{method.name}</p>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  };
  
  // ============ RENDER PRICE SUMMARY ============
  const renderPriceSummary = () => {
    // Use isFormValid as a function call
    const formValid = isFormValid();
    
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 sticky top-24">
        <div className="bg-gradient-to-r from-[#FD561E] to-[#ff7b4a] p-5 text-white rounded-t-xl">
          <h2 className="font-semibold flex items-center gap-2 text-lg">
            <FaRupeeSign /> Price Summary
          </h2>
        </div>
        <div className="p-5 space-y-5">
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Base Fare</span>
            <span className="font-semibold text-gray-800">{formatPrice(selectedFareDetails?.basePrice)}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Taxes & Fees</span>
            <span className="font-semibold text-gray-800">{formatPrice(selectedFareDetails?.taxes)}</span>
          </div>
          <div className="border-t pt-4">
            <div className="flex justify-between items-center">
              <span className="text-lg font-bold text-gray-900">Total</span>
              <span className="text-2xl font-bold text-[#FD561E]">{formatPrice(selectedFareDetails?.totalPrice)}</span>
            </div>
          </div>
          
          <p className="text-xs text-gray-500">Inclusive of all taxes and surcharges</p>
          
          <div className="bg-gray-50 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-3">
              <FaUserFriends className="text-[#FD561E]" size={14} />
              <span className="text-sm font-medium text-gray-700">Passengers</span>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Adults (12+ years)</span>
                <span className="font-medium">{passengerCounts?.ADT || 1}</span>
              </div>
              {passengerCounts?.CNN > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Children (2-11 years)</span>
                  <span className="font-medium">{passengerCounts.CNN}</span>
                </div>
              )}
              {passengerCounts?.INF > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Infants (0-2 years)</span>
                  <span className="font-medium">{passengerCounts.INF}</span>
                </div>
              )}
            </div>
          </div>
          
          <button 
            onClick={handleProceedToBooking} 
            disabled={!formValid || loading} 
            className={`w-full py-4 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all ${
              formValid && !loading 
                ? 'bg-gradient-to-r from-[#FD561E] to-[#e04e1b] text-white shadow-md hover:shadow-lg transform hover:scale-[1.02]' 
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}
          >
            {loading ? (
              <>
                <FaSpinner className="animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <FaCreditCard /> 
                {formValid ? 'Proceed to Book' : 'Complete All Details'} 
                <FaArrowRight size={14} />
              </>
            )}
          </button>
          
          {!formValid && !loading && (
            <p className="text-xs text-amber-600 text-center">
              Please fill in all required passenger details and contact information
            </p>
          )}
          
          <div className="flex items-center justify-center gap-3 text-xs text-gray-500 pt-2">
            <FaCheckCircle className="text-green-500" />
            <span>Secure & Encrypted</span>
            <span className="w-px h-3 bg-gray-300"></span>
            <span>Price Guaranteed</span>
          </div>
        </div>
      </div>
    );
  };
  
  // ============ MAIN RENDER ============
  if (!pricingResult || !selectedFareDetails) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center bg-white p-8 rounded-2xl shadow-lg max-w-md">
          <FaInfoCircle className="text-4xl text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-800 mb-2">No booking data found</h2>
          <button onClick={() => navigate('/flights')} className="bg-[#FD561E] text-white px-6 py-3 rounded-lg w-full">Go to Search</button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b sticky top-0 z-20">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <button onClick={() => navigate(-1)} className="flex items-center text-gray-600 hover:text-[#FD561E] transition-colors mr-4">
                <FaArrowLeft className="mr-2" />
                <span className="hidden sm:inline">Back</span>
              </button>
              <div>
                <h1 className="text-xl font-bold text-gray-800">Review & Book</h1>
                <p className="text-xs text-gray-500 mt-0.5">
                  {isRoundTrip ? 'Round Trip' : 'One Way'} • {allPricingOptions.length} Fare Option{allPricingOptions.length !== 1 ? 's' : ''} Available
                </p>
              </div>
            </div>
          </div>
        </div>
        <div className="h-1 bg-gradient-to-r from-[#FD561E] to-[#ff7b4a]"></div>
      </div>
      
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Left Column */}
          <div className="lg:w-2/3 space-y-6">
            {/* Trace ID */}
            <div className="bg-blue-50 rounded-xl p-4 text-sm text-blue-700 flex items-center">
              <FaInfoCircle className="mr-2" />
              <span className="font-mono text-xs">Trace ID: {pricingResult.traceId || 'N/A'}</span>
            </div>
            
            {/* Fare Options Selector */}
            {allPricingOptions.length > 1 && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="bg-gray-50 p-4 border-b">
                  <h3 className="font-semibold text-gray-700 flex items-center gap-2">
                    <FaList className="text-[#FD561E]" size={16} />
                    Available Fare Options ({allPricingOptions.length})
                  </h3>
                  <p className="text-xs text-gray-500 mt-1">Select a fare to view details and proceed with booking</p>
                </div>
                <div className="p-4 space-y-3">
                  {allPricingOptions.map((option, idx) => renderFareOptionCard(option, idx))}
                </div>
              </div>
            )}
            
            {/* Leg Selector for Round Trip */}
            {isRoundTrip && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="flex">
                  <button 
                    onClick={() => setActiveLeg('outbound')} 
                    className={`flex-1 py-3 text-center font-semibold transition-all ${
                      activeLeg === 'outbound' 
                        ? 'bg-blue-50 text-blue-700 border-b-2 border-blue-500' 
                        : 'bg-white text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <FaPlane className="inline mr-2 rotate-45" size={14} /> Outbound Flight
                  </button>
                  <button 
                    onClick={() => setActiveLeg('return')} 
                    className={`flex-1 py-3 text-center font-semibold transition-all ${
                      activeLeg === 'return' 
                        ? 'bg-emerald-50 text-emerald-700 border-b-2 border-emerald-500' 
                        : 'bg-white text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <FaPlane className="inline mr-2 -rotate-45" size={14} /> Return Flight
                  </button>
                </div>
              </div>
            )}
            
            {/* Flight Cards */}
            {isRoundTrip ? (
              <>
                {activeLeg === 'outbound' && renderFlightCard(outboundFlight, 'outbound')}
                {activeLeg === 'return' && renderFlightCard(returnFlight, 'return')}
              </>
            ) : (
              renderFlightCard(oneWayFlight, 'outbound')
            )}
            
            {/* Fare Details Tabs */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="border-b">
                <div className="flex overflow-x-auto">
                  {[
                    { id: 'fare-details', icon: FaReceipt, label: 'Fare Details' },
                    { id: 'fare-rules', icon: FaFileInvoice, label: 'Fare Rules' },
                    { id: 'baggage', icon: FaSuitcase, label: 'Baggage' },
                    { id: 'taxes', icon: FaPercent, label: 'Taxes & Fees' },
                    { id: 'amenities', icon: FaStar, label: 'Amenities' }
                  ].map(tab => (
                    <button 
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)} 
                      className={`px-5 py-3 text-center font-medium transition-colors whitespace-nowrap ${
                        activeTab === tab.id 
                          ? 'text-[#FD561E] border-b-2 border-[#FD561E]' 
                          : 'text-gray-600 hover:text-gray-800'
                      }`}
                    >
                      <tab.icon className="inline mr-2" size={14} /> {tab.label}
                    </button>
                  ))}
                </div>
              </div>
              
              <div className="p-5">
                {activeTab === 'fare-details' && renderFareDetailsTab()}
                {activeTab === 'fare-rules' && renderFareRulesTab()}
                {activeTab === 'baggage' && renderBaggageTab()}
                {activeTab === 'taxes' && renderTaxesTab()}
                {activeTab === 'amenities' && renderAmenitiesTab()}
              </div>
            </div>
            
            {/* Passenger Details */}
            {renderPassengerForm()}
            
            {/* Contact Information */}
            {renderContactForm()}
            
            {/* Payment Method */}
            {renderPaymentMethods()}
          </div>
          
          {/* Right Column - Price Summary */}
          <div className="lg:w-1/3">
            {renderPriceSummary()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingReviewPage;