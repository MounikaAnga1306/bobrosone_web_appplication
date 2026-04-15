// src/modules/flights/pages/BookingReviewPage.jsx

import React, { useState, useMemo, useCallback, useEffect } from 'react';
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
  FaRoute,
  FaStopwatch,
  FaLuggageCart,
  FaSpinner,
  FaCheck,
  FaChevronDown,
  FaChevronUp,
  FaGift,
  FaBuilding,
  FaPlaneDeparture,
  FaPlaneArrival,
  FaHourglassHalf,
  FaCoffee,
  FaBabyCarriage,
  FaWheelchair,
  FaBolt,
  FaUtensilSpoon,
  FaGlassCheers,
  FaTachometerAlt,
  FaCalendarWeek,
  FaMapMarkerAlt
} from 'react-icons/fa';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Import data extractor utilities
import {
  extractAllFareOptions,
  extractHostTokenForSelectedFare,
  extractFlightSegments,
  extractFareDetails,
  extractBrandFeatures,
  extractPenalties,
  extractBaggageInfo,
  extractOptionalServices,
  extractTaxBreakdown,
  enrichPassengersWithAges
} from '../utils/dataExtractor';

// Import pricing service
import { getFlightPricing, buildOneWayPricingRequest, buildRoundTripPricingRequest } from '../services/pricingService';

// ============ IMPORT CONTEXT ============
import { usePricingBooking } from '../contexts/PricingBookingContext';

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

const getPassengerTypeName = (type) => {
  switch(type) {
    case 'ADT': return 'Adult';
    case 'CNN': return 'Child';
    case 'INF': return 'Infant';
    default: return type;
  }
};

const getPassengerTypeIcon = (type) => {
  switch(type) {
    case 'ADT': return FaUser;
    case 'CNN': return FaBabyCarriage;
    case 'INF': return FaBabyCarriage;
    default: return FaUser;
  }
};

const getPassengerTypeColor = (type) => {
  switch(type) {
    case 'ADT': return 'text-blue-500 bg-blue-50';
    case 'CNN': return 'text-green-500 bg-green-50';
    case 'INF': return 'text-[#FD561E] bg-[#FD561E]/10';
    default: return 'text-gray-500 bg-gray-50';
  }
};

const taxCategoryMap = {
  'IN': 'Tax',
  'K3': 'Airport Tax',
  'P2': 'Passenger Service Fee',
  'YQ': 'Fuel Surcharge',
  'YR': 'Insurance Surcharge',
  'RCF': 'Reservation & Cancellation Fee',
  'ASF': 'Airport Security Fee',
  'UDF': 'User Development Fee',
  'TTF': 'Transport Tax Fee',
  'UDFA': 'User Development Fee (Additional)',
  '36GST': 'GST',
  'PHF': 'Passenger Handling Fee',
  'DU': 'Domestic Tax'
};

const BookingReviewPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state || {};
  
  const { 
    bookingData,
    initializeBookingData,
    selectFareWithHostToken,
    updatePassengersList,
    updateContactInformation,
    updatePaymentMethodType,
    setRawPricingResponse
  } = usePricingBooking();
  
  // ─────────────────────────────────────────────────────────────────────────
  //  NEW: Prevent browser back button from leaving this page
  // ─────────────────────────────────────────────────────────────────────────
  useEffect(() => {
    // Push a dummy state so that the back button has somewhere to go
    // but we will immediately push it again to stay on the same page.
    window.history.pushState(null, '', window.location.href);
    
    const handlePopState = (event) => {
      // When back is clicked, push another dummy state → stay on same page
      window.history.pushState(null, '', window.location.href);
      // Optional: show a small toast or notification
      toast.info('You are on the booking review page. Please complete your booking.', {
        icon: 'ℹ️',
        duration: 2000
      });
    };
    
    window.addEventListener('popstate', handlePopState);
    
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);
  
  // Optional: detect if opened in a new tab (via window.open)
  const isNewTab = !!window.opener;
  
 // ─────────────────────────────────────────────────────────────────────────
// FALLBACK: read from localStorage if state is empty (when opened in new tab)
// ─────────────────────────────────────────────────────────────────────────
const [localState, setLocalState] = useState(null);

useEffect(() => {
  if (Object.keys(state).length === 0) {
    const stored = localStorage.getItem('bookingReviewState');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setLocalState(parsed);
        // Clear after reading to avoid stale data
        localStorage.removeItem('bookingReviewState');
      } catch (e) {
        console.error('Failed to parse localStorage data', e);
      }
    }
  }
}, []);

// Use either React Router state or localStorage fallback
const finalState = Object.keys(state).length > 0 ? state : (localState || {});

const selectedOutboundFare = finalState.selectedOutboundFare;
const selectedReturnFare = finalState.selectedReturnFare;
const outboundFlight = finalState.outboundFlight;
const returnFlight = finalState.returnFlight;
const passengerCounts = finalState.passengerCounts || { ADT: 1, CNN: 0, INF: 0 };
const tripType = finalState.tripType || 'one-way';
const totalPriceFromState = finalState.totalPrice || 0;
  
  const [extractedData, setExtractedData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [pricingError, setPricingError] = useState(null);
  const [selectedFareIndex, setSelectedFareIndex] = useState(0);
  const [expandedSections, setExpandedSections] = useState({
    flightDetails: true,
    returnFlightDetails: tripType === 'round-trip',
    allFares: true,
    taxDetails: false,
    optionalServices: false,
    fareRules: true,
    passengerDetails: true,
    contactInfo: true,
    paymentMethod: true
  });
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [passengers, setPassengers] = useState(() => {
    const initialPassengers = [];
    const adultCount = passengerCounts?.ADT || 1;
    const childCount = passengerCounts?.CNN || 0;
    const infantCount = passengerCounts?.INF || 0;
    
    for (let i = 0; i < adultCount; i++) {
      initialPassengers.push({ id: `adt-${i}`, code: 'ADT', title: 'Adult', firstName: '', lastName: '', dob: '', gender: '' });
    }
    for (let i = 0; i < childCount; i++) {
      initialPassengers.push({ id: `cnn-${i}`, code: 'CNN', title: 'Child', firstName: '', lastName: '', dob: '', gender: '' });
    }
    for (let i = 0; i < infantCount; i++) {
      initialPassengers.push({ id: `inf-${i}`, code: 'INF', title: 'Infant', firstName: '', lastName: '', dob: '', gender: '' });
    }
    return initialPassengers;
  });
  
  const [contactInfo, setContactInfo] = useState({
    email: '',
    phone: { countryCode: '91', number: '' }
  });
  
  const [errors, setErrors] = useState({});
  
  useEffect(() => {
    const fetchPricing = async () => {
      if (!selectedOutboundFare) {
        setLoading(false);
        return;
      }
      
      if (bookingData?.rawPricingResponse) {
        const allFareOptions = extractAllFareOptions(bookingData.rawPricingResponse);
        const flightSegments = extractFlightSegments(bookingData.rawPricingResponse);
        const optionalServices = extractOptionalServices(bookingData.rawPricingResponse);
        setExtractedData({ rawPricingResponse: bookingData.rawPricingResponse, allFareOptions, flightSegments, optionalServices, isRoundTrip: tripType === 'round-trip', tripType });
        setLoading(false);
        return;
      }
      
      setLoading(true);
      setPricingError(null);
      const loadingToast = toast.loading('Fetching fare details...');
      
      try {
        let pricingRequest;
        if (tripType === 'round-trip') {
          pricingRequest = buildRoundTripPricingRequest(outboundFlight, selectedOutboundFare, returnFlight, selectedReturnFare, passengerCounts);
        } else {
          pricingRequest = buildOneWayPricingRequest(outboundFlight, selectedOutboundFare, passengerCounts);
        }
        
        const result = await getFlightPricing(pricingRequest);
        toast.dismiss(loadingToast);
        
        if (result.success && result.rawResponse) {
          const allFareOptions = extractAllFareOptions(result.rawResponse);
          const flightSegments = extractFlightSegments(result.rawResponse);
          const optionalServices = extractOptionalServices(result.rawResponse);
          setExtractedData({ rawPricingResponse: result.rawResponse, allFareOptions, flightSegments, optionalServices, isRoundTrip: tripType === 'round-trip', tripType });
          toast.success('Fare options loaded successfully');
        } else {
          throw new Error(result.error || 'Failed to get pricing');
        }
      } catch (error) {
        toast.error(error.message || 'Failed to fetch fare details');
        setPricingError(error.message);
      } finally {
        setLoading(false);
      }
    };
    
    fetchPricing();
  }, [selectedOutboundFare, selectedReturnFare, outboundFlight, returnFlight, passengerCounts, tripType, bookingData?.rawPricingResponse]);
  
  const selectedFare = extractedData?.allFareOptions?.[selectedFareIndex];
  const rawPricingResponse = extractedData?.rawPricingResponse;
  const flightSegments = extractedData?.flightSegments || [];
  const isConnectingFlight = flightSegments.length > 1;
  
  const outboundSegments = useMemo(() => {
    if (tripType !== 'round-trip') return flightSegments;
    return flightSegments.slice(0, Math.ceil(flightSegments.length / 2));
  }, [flightSegments, tripType]);
  
  const returnSegments = useMemo(() => {
    if (tripType !== 'round-trip') return [];
    return flightSegments.slice(Math.ceil(flightSegments.length / 2));
  }, [flightSegments, tripType]);
  
  const selectedFareBrand = selectedFare?.brand?.name;
  
  const selectedFareHostToken = useMemo(() => {
    if (!rawPricingResponse || !selectedFareBrand) return null;
    return extractHostTokenForSelectedFare(rawPricingResponse, selectedFareBrand);
  }, [rawPricingResponse, selectedFareBrand]);
  
  const selectedFareDetails = useMemo(() => {
    if (!rawPricingResponse || !selectedFareBrand) return null;
    return extractFareDetails(rawPricingResponse, selectedFareBrand);
  }, [rawPricingResponse, selectedFareBrand]);
  
  const selectedBrandFeatures = useMemo(() => {
    if (!rawPricingResponse || !selectedFareBrand) return [];
    return extractBrandFeatures(rawPricingResponse, selectedFareBrand);
  }, [rawPricingResponse, selectedFareBrand]);
  
  const selectedPenalties = useMemo(() => {
    if (!rawPricingResponse || !selectedFareBrand) return null;
    return extractPenalties(rawPricingResponse, selectedFareBrand);
  }, [rawPricingResponse, selectedFareBrand]);
  
  const selectedBaggage = useMemo(() => {
    if (!rawPricingResponse || !selectedFareBrand) return null;
    return extractBaggageInfo(rawPricingResponse, selectedFareBrand);
  }, [rawPricingResponse, selectedFareBrand]);
  
  const selectedTaxBreakdown = useMemo(() => {
    if (!rawPricingResponse || !selectedFareBrand) return [];
    return extractTaxBreakdown(rawPricingResponse, selectedFareBrand);
  }, [rawPricingResponse, selectedFareBrand]);
  
  const passengerPricing = selectedFare?.passengerPricing || {};
  const passengerTypes = selectedFare?.passengerTypes || (Object.keys(passengerPricing).length > 0 ? Object.keys(passengerPricing) : ['ADT']);
  
  const fareDetails = selectedFare;
  const taxBreakdown = selectedTaxBreakdown;
  const optionalServices = extractedData?.optionalServices || { meals: [], seats: [], baggage: [], other: [] };
  const mealOptions = optionalServices.meals || [];
  const seatOptions = optionalServices.seats || [];
  const baggageOptions = optionalServices.baggage || [];
  const otherServices = optionalServices.other || [];
  const brandFeatures = selectedBrandFeatures;
  const penalties = selectedPenalties;
  
  const updatePassenger = (index, field, value) => {
    const updated = [...passengers];
    updated[index][field] = value;
    setPassengers(updated);
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
  
  const validateForm = useCallback(() => {
    const newErrors = {};
    passengers.forEach((passenger, idx) => {
      if (!passenger.firstName.trim()) newErrors[`passenger_${idx}_firstName`] = 'First name required';
      if (!passenger.lastName.trim()) newErrors[`passenger_${idx}_lastName`] = 'Last name required';
      if (!passenger.dob) newErrors[`passenger_${idx}_dob`] = 'Date of birth required';
      else {
        const age = calculateAge(passenger.dob);
        if (passenger.code === 'ADT' && age < 12) newErrors[`passenger_${idx}_dob`] = 'Adult must be 12+ years';
        if (passenger.code === 'CNN' && (age < 2 || age > 11)) newErrors[`passenger_${idx}_dob`] = 'Child must be 2-11 years';
        if (passenger.code === 'INF' && age > 2) newErrors[`passenger_${idx}_dob`] = 'Infant must be under 2 years';
      }
      if (!passenger.gender) newErrors[`passenger_${idx}_gender`] = 'Gender required';
    });
    if (!contactInfo.email.trim()) newErrors.email = 'Email required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contactInfo.email)) newErrors.email = 'Invalid email';
    if (!contactInfo.phone.number.trim()) newErrors.phone = 'Phone number required';
    else if (!/^\d{10}$/.test(contactInfo.phone.number)) newErrors.phone = '10 digits required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [passengers, contactInfo]);
  
  const isFormValid = useCallback(() => {
    const allPassengersValid = passengers.every(p => p.firstName.trim() && p.lastName.trim() && p.dob && p.gender);
    const contactValid = contactInfo.email.trim() && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contactInfo.email) && 
                         contactInfo.phone.number.trim() && /^\d{10}$/.test(contactInfo.phone.number);
    return allPassengersValid && contactValid;
  }, [passengers, contactInfo]);
  
  const toggleSection = (section) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };
  
  const handleSelectFare = (index) => {
    const selectedFareData = extractedData?.allFareOptions[index];
    const brandName = selectedFareData?.brand?.name;
    
    if (rawPricingResponse && brandName && selectFareWithHostToken) {
      const hostToken = extractHostTokenForSelectedFare(rawPricingResponse, brandName);
      const selectedFareWithDetails = {
        ...selectedFareData,
        details: extractFareDetails(rawPricingResponse, brandName),
        features: extractBrandFeatures(rawPricingResponse, brandName),
        penalties: extractPenalties(rawPricingResponse, brandName),
        baggage: extractBaggageInfo(rawPricingResponse, brandName),
        taxBreakdown: extractTaxBreakdown(rawPricingResponse, brandName),
        hostToken,
        hostTokenRef: selectedFareData?.bookingInfo?.hostTokenRef,
        passengerPricing: selectedFareData?.passengerPricing,
        passengerHostTokens: selectedFareData?.passengerHostTokens,
        passengerTypes: selectedFareData?.passengerTypes
      };
      selectFareWithHostToken(selectedFareWithDetails, hostToken);
    }
    
    setSelectedFareIndex(index);
    toast.success(`Selected ${extractedData?.allFareOptions[index]?.brand?.name || 'Fare'} option`);
  };
  
  const handleProceedToBooking = async () => {
    if (!validateForm()) { toast.error('Please fill in all required fields'); return; }
    
    const enrichedPassengers = enrichPassengersWithAges(passengers);
    const completeBookingData = {
      rawPricingResponse,
      hostToken: selectedFareHostToken,
      hostTokenRef: selectedFare?.bookingInfo?.hostTokenRef,
      flightSegments: extractedData?.flightSegments || [],
      outboundSegments,
      returnSegments,
      selectedFare: { ...selectedFare, details: selectedFareDetails, features: selectedBrandFeatures, penalties: selectedPenalties, baggage: selectedBaggage, taxBreakdown: selectedTaxBreakdown, hostToken: selectedFareHostToken, hostTokenRef: selectedFare?.bookingInfo?.hostTokenRef, passengerPricing: selectedFare?.passengerPricing, passengerHostTokens: selectedFare?.passengerHostTokens, passengerTypes: selectedFare?.passengerTypes },
      allFareOptions: extractedData?.allFareOptions,
      optionalServices: extractedData?.optionalServices,
      passengers: enrichedPassengers,
      passengerCounts,
      passengerPricing,
      contactInfo,
      paymentMethod,
      isRoundTrip: tripType === 'round-trip',
      tripType,
      currency: 'INR',
      timestamp: new Date().toISOString()
    };
    
    if (initializeBookingData) initializeBookingData(completeBookingData);
    if (updatePassengersList) updatePassengersList(enrichedPassengers);
    if (updateContactInformation) updateContactInformation(contactInfo);
    if (updatePaymentMethodType) updatePaymentMethodType(paymentMethod);
    
    // Navigate to seat map (works in same tab or new tab)
    navigate('/flights/booking/seat-map');
  };
  
  const renderFlightSegment = (segment, segIdx, isReturn = false) => {
    return (
      <div key={segIdx} className={segIdx > 0 ? 'mt-6 pt-4 border-t border-dashed border-gray-200' : ''}>
        {segIdx > 0 && (
          <div className="mb-4 text-center">
            <div className="inline-block bg-amber-100 text-amber-700 text-xs px-3 py-1 rounded-full">
              <FaHourglassHalf className="inline mr-1" size={10} />
              Layover at {segment.origin || 'Unknown'} - {formatDuration(segment.duration || segment.flightTime)}
            </div>
          </div>
        )}
        <div className="flex items-center justify-between py-4">
          <div className="text-center flex-1">
            <div className="text-2xl font-bold text-gray-800">{formatTime(segment.departureTime)}</div>
            <div className="text-base font-medium text-gray-600 mt-1">{segment.origin}</div>
            <div className="text-xs text-gray-400 mt-0.5">{formatDate(segment.departureTime)}</div>
            {segment.originTerminal && <div className="text-xs text-gray-400 mt-0.5">Terminal {segment.originTerminal}</div>}
          </div>
          <div className="flex-1 px-6">
            <div className="relative">
              <div className="w-full h-px bg-gray-200"></div>
              <FaPlane className="absolute text-[#FD561E] transform -translate-x-1/2 -translate-y-1/2 left-1/2 top-1/2 rotate-90 bg-white px-1" size={12} />
            </div>
            <div className="text-center text-xs text-gray-400 mt-2">
              <FaStopwatch className="inline mr-1" size={10} /> {formatDuration(segment.flightTime)}
            </div>
            {segment.codeshareInfo && <div className="text-center text-xs text-gray-400 mt-1">Operated by {segment.codeshareInfo.operatingCarrier}</div>}
          </div>
          <div className="text-center flex-1">
            <div className="text-2xl font-bold text-gray-800">{formatTime(segment.arrivalTime)}</div>
            <div className="text-base font-medium text-gray-600 mt-1">{segment.destination}</div>
            <div className="text-xs text-gray-400 mt-0.5">{formatDate(segment.arrivalTime)}</div>
            {segment.destinationTerminal && <div className="text-xs text-gray-400 mt-0.5">Terminal {segment.destinationTerminal}</div>}
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4 pt-4 border-t border-gray-100">
          <div className="bg-gray-50 rounded-xl p-3 text-center">
            <FaBuilding className="text-[#FD561E] mx-auto mb-1" size={14} />
            <p className="text-xs text-gray-500">Aircraft</p>
            <p className="text-sm font-semibold text-gray-700">{segment.equipment || 'Not specified'}</p>
          </div>
          <div className="bg-gray-50 rounded-xl p-3 text-center">
            <FaChair className="text-[#FD561E] mx-auto mb-1" size={14} />
            <p className="text-xs text-gray-500">Class</p>
            <p className="text-sm font-semibold text-gray-700">{selectedFare?.bookingInfo?.cabinClass || 'Economy'}</p>
          </div>
          <div className="bg-gray-50 rounded-xl p-3 text-center">
            <FaTicketAlt className="text-[#FD561E] mx-auto mb-1" size={14} />
            <p className="text-xs text-gray-500">Booking Code</p>
            <p className="text-sm font-semibold text-gray-700 font-mono">{selectedFare?.bookingInfo?.bookingCode || 'N/A'}</p>
          </div>
          <div className="bg-gray-50 rounded-xl p-3 text-center">
            <FaCheckCircle className="text-emerald-500 mx-auto mb-1" size={14} />
            <p className="text-xs text-gray-500">Status</p>
            <p className="text-sm font-semibold text-emerald-600">Confirmed</p>
          </div>
        </div>
      </div>
    );
  };
  
  const renderFlightDetails = () => {
    if (!outboundSegments.length) return null;
    return (
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-lg transition-all">
        <button onClick={() => toggleSection('flightDetails')} className="w-full flex items-center justify-between p-5 hover:bg-[#FD561E]/5 transition-colors">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#FD561E]/10 rounded-xl flex items-center justify-center">
              <FaPlaneDeparture className="text-[#FD561E]" size={18} />
            </div>
            <div>
              <h2 className="font-semibold text-gray-800">
                Outbound Flight
                {isConnectingFlight && <span className="ml-2 text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">Connecting Flight</span>}
              </h2>
              <p className="text-xs text-gray-500">{outboundSegments[0]?.carrier} {outboundSegments[0]?.flightNumber}</p>
            </div>
          </div>
          {expandedSections.flightDetails ? <FaChevronUp className="text-gray-400" /> : <FaChevronDown className="text-gray-400" />}
        </button>
        {expandedSections.flightDetails && (
          <div className="p-5 pt-0 border-t border-gray-100">
            {outboundSegments.map((segment, segIdx) => renderFlightSegment(segment, segIdx, false))}
          </div>
        )}
      </div>
    );
  };
  
  const renderReturnFlightDetails = () => {
    if (tripType !== 'round-trip' || !returnSegments.length) return null;
    const isReturnConnecting = returnSegments.length > 1;
    return (
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-lg transition-all">
        <button onClick={() => toggleSection('returnFlightDetails')} className="w-full flex items-center justify-between p-5 hover:bg-[#FD561E]/5 transition-colors">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#FD561E]/10 rounded-xl flex items-center justify-center">
              <FaPlaneArrival className="text-[#FD561E]" size={18} />
            </div>
            <div>
              <h2 className="font-semibold text-gray-800">
                Return Flight
                {isReturnConnecting && <span className="ml-2 text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">Connecting Flight</span>}
              </h2>
              <p className="text-xs text-gray-500">{returnSegments[0]?.carrier} {returnSegments[0]?.flightNumber}</p>
            </div>
          </div>
          {expandedSections.returnFlightDetails ? <FaChevronUp className="text-gray-400" /> : <FaChevronDown className="text-gray-400" />}
        </button>
        {expandedSections.returnFlightDetails && (
          <div className="p-5 pt-0 border-t border-gray-100">
            {returnSegments.map((segment, segIdx) => renderFlightSegment(segment, segIdx, true))}
          </div>
        )}
      </div>
    );
  };
  
  const renderPassengerPriceBreakdown = () => {
    const hasPassengerPricing = passengerPricing && Object.keys(passengerPricing).length > 0;
    if (!hasPassengerPricing) {
      return (
        <>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Base Fare</span>
            <span className="font-medium text-gray-700">{formatPrice(selectedFare?.basePrice)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Taxes & Fees</span>
            <span className="font-medium text-gray-700">{formatPrice(selectedFare?.taxes)}</span>
          </div>
        </>
      );
    }
    
    let totalBasePrice = 0;
    let totalTaxes = 0;
    let totalFare = 0;
    const validPassengerTypes = passengerTypes.filter(type => passengerCounts[type] > 0);
    
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-3 gap-2 text-xs font-medium text-gray-500 pb-2 border-b border-gray-100">
          <div>Passenger Type</div>
          <div className="text-right">Base Fare</div>
          <div className="text-right">Total (incl. taxes)</div>
        </div>
        {validPassengerTypes.map(type => {
          const pricing = passengerPricing[type];
          const count = passengerCounts[type] || 0;
          if (count === 0 || !pricing) return null;
          const passengerTotal = (pricing.totalPrice || 0) * count;
          totalBasePrice += (pricing.basePrice || 0) * count;
          totalTaxes += (pricing.taxes || 0) * count;
          totalFare += passengerTotal;
          const PassengerIcon = getPassengerTypeIcon(type);
          const colorClass = getPassengerTypeColor(type);
          return (
            <div key={type} className="group">
              <div className="grid grid-cols-3 gap-2 items-center py-2 hover:bg-gray-50 rounded-lg transition-colors">
                <div>
                  <div className="flex items-center gap-2">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center ${colorClass}`}>
                      <PassengerIcon size={12} className={colorClass.split(' ')[0]} />
                    </div>
                    <span className="text-sm font-semibold text-gray-800">{getPassengerTypeName(type)}</span>
                    <span className="text-xs bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded-full">×{count}</span>
                  </div>
                  {pricing.fareInfo?.cabinClass && <div className="text-xs text-gray-400 mt-0.5 ml-8">{pricing.fareInfo.cabinClass}</div>}
                </div>
                <div className="text-right">
                  <div className="text-sm text-gray-600">{formatPrice(pricing.basePrice)}</div>
                  <div className="text-xs text-gray-400">+{formatPrice(pricing.taxes)} taxes</div>
                </div>
                <div className="text-right">
                  <div className="text-base font-bold text-gray-800">{formatPrice(pricing.totalPrice)}</div>
                  {count > 1 && <div className="text-xs text-gray-400">Total: {formatPrice(passengerTotal)}</div>}
                </div>
              </div>
              {pricing.baggage && (
                <div className="flex items-center gap-4 mt-1 mb-2 ml-8 text-xs text-gray-400 border-l-2 border-gray-100 pl-3">
                  <div className="flex items-center gap-1"><FaSuitcase size={10} /><span>Checked: {pricing.baggage.checked?.weight || '15'}kg</span></div>
                  <div className="flex items-center gap-1"><FaBriefcase size={10} /><span>Cabin: {pricing.baggage.cabin?.weight || '7'}kg</span></div>
                </div>
              )}
            </div>
          );
        })}
        <div className="pt-3 mt-2 border-t border-gray-200">
          <div className="flex justify-between text-sm py-1"><span className="text-gray-600">Subtotal (Base Fare)</span><span className="font-semibold text-gray-800">{formatPrice(totalBasePrice)}</span></div>
          <div className="flex justify-between text-sm py-1"><span className="text-gray-600">Taxes & Fees</span><span className="font-semibold text-gray-800">{formatPrice(totalTaxes)}</span></div>
          {selectedTaxBreakdown && selectedTaxBreakdown.length > 0 && (
            <details className="mt-2 text-xs">
              <summary className="text-gray-400 cursor-pointer hover:text-gray-500">View tax details ({selectedTaxBreakdown.length} items)</summary>
              <div className="mt-2 space-y-1 pl-2">
                {selectedTaxBreakdown.map((tax, idx) => (
                  <div key={idx} className="flex justify-between text-gray-500">
                    <span>{taxCategoryMap[tax.category] || tax.category}</span>
                    <span>{formatPrice(tax.amount)}</span>
                  </div>
                ))}
              </div>
            </details>
          )}
        </div>
        <div className="pt-2 border-t-2 border-gray-200">
          <div className="flex justify-between items-center">
            <span className="text-base font-bold text-gray-800">Total for {passengers.length} passenger(s)</span>
            <div className="text-right">
              <span className="text-2xl font-bold text-[#FD561E]">{formatPrice(totalFare)}</span>
              <div className="text-xs text-gray-400">including all taxes</div>
            </div>
          </div>
        </div>
      </div>
    );
  };
  
  // ============ RENDER ALL BRAND FARES — MOBILE FIX ============
  const renderAllFares = () => {
    if (!extractedData?.allFareOptions?.length) return null;
    const allFares = extractedData.allFareOptions;

    return (
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <button
          onClick={() => toggleSection('allFares')}
          className="w-full flex items-center justify-between p-5 hover:bg-[#FD561E]/5 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
              <FaTag className="text-blue-500" size={18} />
            </div>
            <div>
              <h2 className="font-semibold text-gray-800">Available Fare Options</h2>
              <p className="text-xs text-gray-500">{allFares.length} fare types available</p>
            </div>
          </div>
          {expandedSections.allFares ? <FaChevronUp className="text-gray-400" /> : <FaChevronDown className="text-gray-400" />}
        </button>

        {expandedSections.allFares && (
          <div className="p-5 pt-0 border-t border-gray-100">
            {allFares.length >= 4 ? (
              <div>
                <div
                  className="flex gap-3 overflow-x-auto pb-3"
                  style={{ scrollbarWidth: 'none', msOverflowStyle: 'none', WebkitOverflowScrolling: 'touch' }}
                >
                  {allFares.map((fare, idx) => {
                    const isSelected = selectedFareIndex === idx;
                    const brandName = fare.brand?.name || 'Economy';
                    const isLowest = idx === 0;
                    const cabinClass = fare.bookingInfo?.cabinClass || 'Economy';
                    const farePassengerTypes = fare.passengerTypes || ['ADT'];
                    const farePassengerPricing = fare.passengerPricing || {};
                    const primaryPassengerType = farePassengerTypes.includes('ADT') ? 'ADT' : farePassengerTypes[0];
                    const primaryPrice = farePassengerPricing[primaryPassengerType]?.totalPrice || fare.totalPrice;

                    return (
                      <div
                        key={idx}
                        onClick={() => handleSelectFare(idx)}
                        className={`flex-shrink-0 rounded-xl border-2 transition-all cursor-pointer
                          ${isSelected ? 'border-[#FD561E] bg-[#FD561E]/5 shadow-md' : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'}`}
                        style={{ width: 'calc(85vw - 40px)', maxWidth: '280px', minWidth: '220px' }}
                      >
                        {renderFareCardContent(fare, idx, isSelected, isLowest, primaryPrice, primaryPassengerType, farePassengerTypes, farePassengerPricing, cabinClass)}
                      </div>
                    );
                  })}
                </div>
                {allFares.length > 2 && (
                  <div className="flex justify-center items-center gap-2 mt-3">
                    <div className="flex gap-1">
                      {allFares.map((_, i) => (
                        <div key={i} className={`rounded-full transition-all ${i === selectedFareIndex ? 'w-4 h-1.5 bg-[#FD561E]' : 'w-1.5 h-1.5 bg-gray-300'}`} />
                      ))}
                    </div>
                    <span className="text-[10px] text-gray-400">Swipe → to see all {allFares.length} fares</span>
                  </div>
                )}
              </div>
            ) : allFares.length === 1 ? (
              <div className="flex justify-center">
                <div className="w-full max-w-sm">
                  {renderFareCardWrapper(allFares[0], 0)}
                </div>
              </div>
            ) : allFares.length === 2 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {allFares.map((fare, idx) => renderFareCardWrapper(fare, idx))}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {allFares.map((fare, idx) => renderFareCardWrapper(fare, idx))}
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  const renderFareCardContent = (fare, idx, isSelected, isLowest, primaryPrice, primaryPassengerType, farePassengerTypes, farePassengerPricing, cabinClass) => (
    <>
      <div className="p-4">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h3 className="font-bold text-gray-800 text-sm">{fare.brand?.name || 'Economy'}</h3>
            {(cabinClass === 'PremiumEconomy' || cabinClass === 'Business') && (
              <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full mt-1 inline-block">Premium</span>
            )}
          </div>
          {isLowest && (
            <span className="text-[10px] bg-[#FD561E] text-white px-2 py-0.5 rounded-full whitespace-nowrap">Best Price</span>
          )}
        </div>

        <div className="mt-2">
          <div className="text-xl font-bold text-[#FD561E]">{formatPrice(primaryPrice)}</div>
          <div className="text-xs text-gray-400">per {getPassengerTypeName(primaryPassengerType)}</div>
        </div>

        {farePassengerTypes.length > 1 && (
          <div className="mt-2 text-xs text-gray-500 space-y-1">
            {farePassengerTypes.filter(t => t !== primaryPassengerType).map(type => {
              const typePrice = farePassengerPricing[type]?.totalPrice;
              if (!typePrice) return null;
              return (
                <div key={type} className="flex justify-between">
                  <span>{getPassengerTypeName(type)}:</span>
                  <span className="font-medium">{formatPrice(typePrice)}</span>
                </div>
              );
            })}
          </div>
        )}

        <div className="mt-3 pt-3 border-t border-gray-100 space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-500 flex items-center gap-1"><FaSuitcase size={11} /> Checked</span>
            <span className="text-gray-700 font-medium">
              {farePassengerPricing[primaryPassengerType]?.baggage?.checked?.weight || fare.baggage?.checked || '15'}kg
            </span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-500 flex items-center gap-1"><FaChair size={11} /> Class</span>
            <span className="text-gray-700 truncate max-w-[80px]">{cabinClass}</span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-500 flex items-center gap-1"><FaExchangeAlt size={11} /> Change</span>
            <span className="text-gray-700">
              {fare.penalties?.change?.amount ? `₹${fare.penalties.change.amount}` : fare.penalties?.change?.percentage ? `${fare.penalties.change.percentage}%` : 'Allowed'}
            </span>
          </div>
        </div>
      </div>
      <div className="px-4 pb-4">
        <button
          onClick={(e) => { e.stopPropagation(); handleSelectFare(idx); }}
          className={`w-full py-2 rounded-lg text-sm font-medium transition-colors ${
            isSelected ? 'bg-[#FD561E] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          {isSelected ? 'Selected ✓' : 'Select Fare'}
        </button>
      </div>
    </>
  );

  const renderFareCardWrapper = (fare, idx) => {
    const isSelected = selectedFareIndex === idx;
    const isLowest = idx === 0;
    const cabinClass = fare.bookingInfo?.cabinClass || 'Economy';
    const farePassengerTypes = fare.passengerTypes || ['ADT'];
    const farePassengerPricing = fare.passengerPricing || {};
    const primaryPassengerType = farePassengerTypes.includes('ADT') ? 'ADT' : farePassengerTypes[0];
    const primaryPrice = farePassengerPricing[primaryPassengerType]?.totalPrice || fare.totalPrice;

    return (
      <div
        key={idx}
        onClick={() => handleSelectFare(idx)}
        className={`rounded-xl border-2 transition-all cursor-pointer
          ${isSelected ? 'border-[#FD561E] bg-[#FD561E]/5 shadow-md' : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'}`}
      >
        {renderFareCardContent(fare, idx, isSelected, isLowest, primaryPrice, primaryPassengerType, farePassengerTypes, farePassengerPricing, cabinClass)}
      </div>
    );
  };
  
  const renderTaxDetails = () => {
    if (!taxBreakdown.length) return null;
    return (
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <button onClick={() => toggleSection('taxDetails')} className="w-full flex items-center justify-between p-5 hover:bg-[#FD561E]/5 transition-colors">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center"><FaPercent className="text-amber-500" size={18} /></div>
            <div>
              <h2 className="font-semibold text-gray-800">Tax Breakdown</h2>
              <p className="text-xs text-gray-500">{taxBreakdown.length} taxes applied</p>
            </div>
          </div>
          {expandedSections.taxDetails ? <FaChevronUp className="text-gray-400" /> : <FaChevronDown className="text-gray-400" />}
        </button>
        {expandedSections.taxDetails && (
          <div className="p-5 pt-0 border-t border-gray-100">
            <div className="space-y-3">
              {taxBreakdown.map((tax, idx) => (
                <div key={idx} className="flex justify-between items-center py-3 border-b border-gray-100 last:border-0">
                  <div>
                    <p className="text-sm font-medium text-gray-700">{tax.name || taxCategoryMap[tax.category] || tax.category}</p>
                    <p className="text-xs text-gray-400">{tax.category}</p>
                  </div>
                  <p className="text-sm font-semibold text-gray-800">{formatPrice(tax.amount)}</p>
                </div>
              ))}
              <div className="mt-3 pt-3 border-t-2 border-gray-200">
                <div className="flex justify-between items-center">
                  <p className="text-base font-semibold text-gray-800">Total Taxes</p>
                  <p className="text-lg font-bold text-[#FD561E]">{formatPrice(selectedFare?.taxes)}</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };
  
  const renderOptionalServices = () => {
    if (!mealOptions.length && !seatOptions.length && !baggageOptions.length && !otherServices.length) return null;
    return (
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <button onClick={() => toggleSection('optionalServices')} className="w-full flex items-center justify-between p-5 hover:bg-[#FD561E]/5 transition-colors">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center"><FaGift className="text-green-500" size={18} /></div>
            <div>
              <h2 className="font-semibold text-gray-800">Add-ons & Services</h2>
              <p className="text-xs text-gray-500">{mealOptions.length + seatOptions.length + baggageOptions.length + otherServices.length} options available</p>
            </div>
          </div>
          {expandedSections.optionalServices ? <FaChevronUp className="text-gray-400" /> : <FaChevronDown className="text-gray-400" />}
        </button>
        {expandedSections.optionalServices && (
          <div className="p-5 pt-0 border-t border-gray-100 space-y-6">
            {mealOptions.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2"><FaUtensils className="text-[#FD561E]" size={14} />Meal Options ({mealOptions.length})</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {mealOptions.slice(0, 6).map((meal, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-[#FD561E]/5 transition-colors">
                      <div className="flex-1"><p className="text-sm font-medium text-gray-800">{meal.name}</p>{meal.description && <p className="text-xs text-gray-500 mt-0.5 truncate max-w-[200px]">{meal.description}</p>}</div>
                      <div className="text-right ml-4"><p className="text-sm font-semibold text-[#FD561E]">{formatPrice(meal.price)}</p><button className="text-xs text-gray-400 hover:text-[#FD561E] mt-1">Add</button></div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {seatOptions.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2"><FaChair className="text-[#FD561E]" size={14} />Seat Options ({seatOptions.length})</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {seatOptions.slice(0, 6).map((seat, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-[#FD561E]/5 transition-colors">
                      <div className="flex-1"><p className="text-sm font-medium text-gray-800">{seat.name}</p>{seat.description && <p className="text-xs text-gray-500 mt-0.5">{seat.description.substring(0, 50)}...</p>}</div>
                      <div className="text-right ml-4"><p className="text-sm font-semibold text-[#FD561E]">{formatPrice(seat.price)}</p><button className="text-xs text-gray-400 hover:text-[#FD561E] mt-1">Select</button></div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {baggageOptions.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2"><FaSuitcase className="text-[#FD561E]" size={14} />Extra Baggage ({baggageOptions.length})</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {baggageOptions.slice(0, 8).map((bag, idx) => (
                    <div key={idx} className="text-center p-3 bg-gray-50 rounded-lg hover:bg-[#FD561E]/5 transition-colors">
                      <p className="text-sm font-semibold text-gray-800">{bag.name}</p>
                      <p className="text-xs text-gray-500 mt-1">{bag.description?.substring(0, 30)}</p>
                      <p className="text-sm font-bold text-[#FD561E] mt-2">{formatPrice(bag.price)}</p>
                      <button className="text-xs text-gray-400 hover:text-[#FD561E] mt-1">Add</button>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {otherServices.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2"><FaBolt className="text-[#FD561E]" size={14} />Other Services</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {otherServices.map((service, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-[#FD561E]/5 transition-colors">
                      <div className="flex-1"><p className="text-sm font-medium text-gray-800">{service.name}</p>{service.description && <p className="text-xs text-gray-500 mt-0.5">{service.description.substring(0, 80)}...</p>}</div>
                      <div className="text-right ml-4"><p className="text-sm font-semibold text-[#FD561E]">{formatPrice(service.price)}</p><button className="text-xs text-gray-400 hover:text-[#FD561E] mt-1">Add</button></div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };
  
  const renderFareRules = () => {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <button onClick={() => toggleSection('fareRules')} className="w-full flex items-center justify-between p-5 hover:bg-[#FD561E]/5 transition-colors">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-50 rounded-xl flex items-center justify-center"><FaShieldAlt className="text-red-500" size={18} /></div>
            <div>
              <h2 className="font-semibold text-gray-800">Fare Rules & Policies</h2>
              <p className="text-xs text-gray-500">Cancellation, Changes & Refunds</p>
            </div>
          </div>
          {expandedSections.fareRules ? <FaChevronUp className="text-gray-400" /> : <FaChevronDown className="text-gray-400" />}
        </button>
        {expandedSections.fareRules && (
          <div className="p-5 pt-0 border-t border-gray-100">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gradient-to-r from-blue-50 to-white rounded-xl p-5 border border-blue-100">
                <div className="flex items-center gap-2 mb-3"><FaExchangeAlt className="text-blue-500" size={20} /><h3 className="font-semibold text-gray-800">Date Change Policy</h3></div>
                <p className="text-sm text-gray-600">{penalties?.change?.amount ? `Change Fee: ${formatPrice(penalties.change.amount)} + fare difference` : penalties?.change?.percentage ? `Change Fee: ${penalties.change.percentage}% of fare + fare difference` : 'Free changes allowed'}</p>
              </div>
              <div className="bg-gradient-to-r from-red-50 to-white rounded-xl p-5 border border-red-100">
                <div className="flex items-center gap-2 mb-3"><FaUndo className="text-red-500" size={20} /><h3 className="font-semibold text-gray-800">Cancellation Policy</h3></div>
                <p className="text-sm text-gray-600">{penalties?.cancel?.amount ? `Cancellation Fee: ${formatPrice(penalties.cancel.amount)}` : penalties?.cancel?.percentage ? `Cancellation Fee: ${penalties.cancel.percentage}% of fare` : selectedFare?.refundable ? 'Refundable with applicable fees' : 'Non-refundable'}</p>
              </div>
            </div>
            {brandFeatures.length > 0 && (
              <div className="mt-4 bg-gray-50 rounded-xl p-4">
                <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2"><FaGift className="text-[#FD561E]" size={14} />Included Benefits</h3>
                <div className="flex flex-wrap gap-2">
                  {brandFeatures.slice(0, 6).map((feature, idx) => (
                    <span key={idx} className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs">
                      <FaCheck size={10} /> {typeof feature === 'string' ? (feature.length > 40 ? feature.substring(0, 40) + '...' : feature) : feature.description || feature.code}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };
  
  // ============ STICKY PRICE SUMMARY FIX ============
  const renderPriceSummary = () => {
  const formValid = isFormValid();
  let totalPrice = 0;
  if (passengerPricing && Object.keys(passengerPricing).length > 0) {
    passengerTypes.forEach(type => {
      const pricing = passengerPricing[type];
      const count = passengerCounts[type] || 0;
      if (count > 0 && pricing?.totalPrice) totalPrice += pricing.totalPrice * count;
    });
  } else {
    totalPrice = selectedFare?.totalPrice || 0;
  }
  
  return (
    <div className="block lg:fixed lg:top-24 lg:right-4 xl:right-40 lg:w-80 xl:w-96 lg:z-40 bg-white rounded-2xl border border-gray-100 shadow-lg mb-6 lg:mb-0">
      <div className="p-5 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white rounded-t-2xl">
        <h2 className="font-semibold text-gray-800 flex items-center gap-2">
          <FaRupeeSign className="text-[#FD561E]" size={18} />Price Summary
        </h2>
      </div>
      <div className="p-5 space-y-4">
        {/* Fare Breakdown */}
        <div>
          <h3 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
            <FaUserFriends className="text-[#FD561E]" size={14} />Fare Breakdown
          </h3>
          {renderPassengerPriceBreakdown()}
        </div>
        
        {/* Passenger Info */}
        <div className="bg-gray-50 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <FaUserFriends className="text-[#FD561E]" size={14} />
            <span className="text-sm font-medium text-gray-700">Passengers</span>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">Adults (12+ years)</span>
              <span className="font-medium text-gray-700">{passengerCounts?.ADT || 1}</span>
            </div>
            {passengerCounts?.CNN > 0 && (
              <div className="flex justify-between">
                <span className="text-gray-500">Children (2-11 years)</span>
                <span className="font-medium text-gray-700">{passengerCounts.CNN}</span>
              </div>
            )}
            {passengerCounts?.INF > 0 && (
              <div className="flex justify-between">
                <span className="text-gray-500">Infants (0-2 years)</span>
                <span className="font-medium text-gray-700">{passengerCounts.INF}</span>
              </div>
            )}
          </div>
        </div>
        
        {/* Proceed Button */}
        <button
          onClick={handleProceedToBooking}
          disabled={!formValid || loading}
          className={`w-full py-3 rounded-xl font-medium flex items-center justify-center gap-2 transition-all ${
            formValid && !loading
              ? 'bg-[#FD561E] hover:bg-[#e04e1b] text-white shadow-md hover:shadow-lg'
              : 'bg-gray-100 text-gray-400 cursor-not-allowed'
          }`}
        >
          {loading ? (
            <><FaSpinner className="animate-spin" />Loading...</>
          ) : (
            <><FaCreditCard />{formValid ? 'Proceed to Book' : 'Complete All Details'}<FaArrowRight size={14} /></>
          )}
        </button>
        
        <div className="flex items-center justify-center gap-3 text-xs text-gray-400 pt-2">
          <FaCheckCircle className="text-emerald-500" size={12} /><span>Secure & Encrypted</span>
          <span className="w-px h-3 bg-gray-200"></span><span>Price Guaranteed</span>
        </div>
      </div>
    </div>
  );
};
  
  const renderPassengerForm = () => {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <button onClick={() => toggleSection('passengerDetails')} className="w-full flex items-center justify-between p-5 hover:bg-[#FD561E]/5 transition-colors">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center"><FaUserFriends className="text-blue-500" size={18} /></div>
            <div>
              <h2 className="font-semibold text-gray-800">Passenger Details</h2>
              <p className="text-xs text-gray-500">{passengers.length} passenger(s)</p>
            </div>
          </div>
          {expandedSections.passengerDetails ? <FaChevronUp className="text-gray-400" /> : <FaChevronDown className="text-gray-400" />}
        </button>
        {expandedSections.passengerDetails && (
          <div className="p-5 pt-0 border-t border-gray-100">
            <div className="space-y-4">
              {passengers.map((passenger, idx) => (
                <div key={passenger.id} className="border border-gray-100 rounded-xl p-4 hover:shadow-md transition-all">
                  <div className="flex items-center gap-2 mb-4 pb-2 border-b border-gray-50">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${passenger.code === 'ADT' ? 'bg-blue-50' : passenger.code === 'CNN' ? 'bg-green-50' : 'bg-[#FD561E]/10'}`}>
                      <FaUser className={passenger.code === 'ADT' ? 'text-blue-500' : passenger.code === 'CNN' ? 'text-green-500' : 'text-[#FD561E]'} size={12} />
                    </div>
                    <span className="font-medium text-gray-700 text-sm">{passenger.title}</span>
                    <span className="text-xs text-gray-400 ml-auto">Passenger {idx + 1}</span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1">First Name *</label>
                      <input type="text" value={passenger.firstName} onChange={(e) => updatePassenger(idx, 'firstName', e.target.value)} className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FD561E]/20 focus:border-[#FD561E] ${errors[`passenger_${idx}_firstName`] ? 'border-red-400' : 'border-gray-200'}`} placeholder="First name" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1">Last Name *</label>
                      <input type="text" value={passenger.lastName} onChange={(e) => updatePassenger(idx, 'lastName', e.target.value)} className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FD561E]/20 focus:border-[#FD561E] ${errors[`passenger_${idx}_lastName`] ? 'border-red-400' : 'border-gray-200'}`} placeholder="Last name" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1">Date of Birth *</label>
                      <input type="date" value={passenger.dob} onChange={(e) => updatePassenger(idx, 'dob', e.target.value)} className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FD561E]/20 focus:border-[#FD561E] ${errors[`passenger_${idx}_dob`] ? 'border-red-400' : 'border-gray-200'}`} />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1">Gender *</label>
                      <div className="flex gap-4">
                        <label className="flex items-center gap-2 cursor-pointer"><input type="radio" name={`gender_${idx}`} value="M" checked={passenger.gender === 'M'} onChange={(e) => updatePassenger(idx, 'gender', e.target.value)} className="w-3.5 h-3.5 text-[#FD561E]" /><span className="text-sm text-gray-600">Male</span></label>
                        <label className="flex items-center gap-2 cursor-pointer"><input type="radio" name={`gender_${idx}`} value="F" checked={passenger.gender === 'F'} onChange={(e) => updatePassenger(idx, 'gender', e.target.value)} className="w-3.5 h-3.5 text-[#FD561E]" /><span className="text-sm text-gray-600">Female</span></label>
                      </div>
                    </div>
                  </div>
                  {errors[`passenger_${idx}_firstName`] && <p className="text-xs text-red-500 mt-2">{errors[`passenger_${idx}_firstName`]}</p>}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };
  
  const renderContactForm = () => {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <button onClick={() => toggleSection('contactInfo')} className="w-full flex items-center justify-between p-5 hover:bg-[#FD561E]/5 transition-colors">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center"><FaPhone className="text-emerald-500" size={18} /></div>
            <div><h2 className="font-semibold text-gray-800">Contact Information</h2></div>
          </div>
          {expandedSections.contactInfo ? <FaChevronUp className="text-gray-400" /> : <FaChevronDown className="text-gray-400" />}
        </button>
        {expandedSections.contactInfo && (
          <div className="p-5 pt-0 border-t border-gray-100">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Email Address *</label>
                <div className="relative">
                  <FaEnvelope className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={14} />
                  <input type="email" value={contactInfo.email} onChange={(e) => setContactInfo({ ...contactInfo, email: e.target.value })} className={`w-full pl-9 pr-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FD561E]/20 focus:border-[#FD561E] ${errors.email ? 'border-red-400' : 'border-gray-200'}`} placeholder="Enter email address" />
                </div>
                {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Phone Number *</label>
                <div className="flex gap-3">
                  <select value={contactInfo.phone.countryCode} onChange={(e) => setContactInfo({ ...contactInfo, phone: { ...contactInfo.phone, countryCode: e.target.value } })} className="w-24 px-2 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FD561E]/20">
                    <option value="91">+91 (IN)</option><option value="1">+1 (US)</option><option value="44">+44 (UK)</option><option value="971">+971 (AE)</option>
                  </select>
                  <div className="flex-1 relative">
                    <FaPhone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={14} />
                    <input type="tel" value={contactInfo.phone.number} onChange={(e) => setContactInfo({ ...contactInfo, phone: { ...contactInfo.phone, number: e.target.value } })} className={`w-full pl-9 pr-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FD561E]/20 ${errors.phone ? 'border-red-400' : 'border-gray-200'}`} placeholder="9876543210" maxLength="10" />
                  </div>
                </div>
                {errors.phone && <p className="text-xs text-red-500 mt-1">{errors.phone}</p>}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };
  
  const renderPaymentMethods = () => {
    const methods = [
      { id: 'card', icon: FaCreditCard, name: 'Card', subIcons: [FaCcVisa, FaCcMastercard] },
      { id: 'upi', icon: FaMobileAlt, name: 'UPI' },
      { id: 'netbanking', icon: FaWallet, name: 'Net Banking' }
    ];
    return (
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <button onClick={() => toggleSection('paymentMethod')} className="w-full flex items-center justify-between p-5 hover:bg-[#FD561E]/5 transition-colors">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-50 rounded-xl flex items-center justify-center"><FaWallet className="text-purple-500" size={18} /></div>
            <div><h2 className="font-semibold text-gray-800">Payment Method</h2></div>
          </div>
          {expandedSections.paymentMethod ? <FaChevronUp className="text-gray-400" /> : <FaChevronDown className="text-gray-400" />}
        </button>
        {expandedSections.paymentMethod && (
          <div className="p-5 pt-0 border-t border-gray-100">
            <div className="grid grid-cols-3 gap-4">
              {methods.map((method) => (
                <button key={method.id} onClick={() => setPaymentMethod(method.id)} className={`p-4 rounded-xl border-2 transition-all text-center ${paymentMethod === method.id ? 'border-[#FD561E] bg-[#FD561E]/5' : 'border-gray-200 hover:border-gray-300'}`}>
                  <method.icon className={`text-2xl mx-auto mb-2 ${paymentMethod === method.id ? 'text-[#FD561E]' : 'text-gray-400'}`} />
                  {method.subIcons && (
                    <div className="flex justify-center gap-2 mb-2">
                      {method.subIcons.map((Icon, i) => <Icon key={i} className={`text-lg ${paymentMethod === method.id ? 'text-[#FD561E]' : 'text-gray-400'}`} />)}
                    </div>
                  )}
                  <p className={`text-sm font-medium text-center ${paymentMethod === method.id ? 'text-[#FD561E]' : 'text-gray-600'}`}>{method.name}</p>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };
  
  if (loading && !extractedData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center bg-white p-8 rounded-2xl shadow-sm max-w-md border border-gray-100">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FD561E] mx-auto mb-4"></div>
          <p className="text-gray-600">Loading fare options...</p>
        </div>
      </div>
    );
  }
  
  if (pricingError && !extractedData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center bg-white p-8 rounded-2xl shadow-sm max-w-md border border-gray-100">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4"><FaInfoCircle className="text-4xl text-red-500" /></div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Unable to load fares</h2>
          <p className="text-sm text-gray-500 mb-4">{pricingError}</p>
          <button onClick={() => navigate(-1)} className="bg-[#FD561E] text-white px-6 py-3 rounded-lg w-full hover:bg-[#e04e1b] transition-colors">Go Back</button>
        </div>
      </div>
    );
  }
  
  if (!extractedData || !selectedFare) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center bg-white p-8 rounded-2xl shadow-sm max-w-md border border-gray-100">
          <div className="w-20 h-20 bg-[#FD561E]/10 rounded-full flex items-center justify-center mx-auto mb-4"><FaInfoCircle className="text-4xl text-[#FD561E]" /></div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">No booking data found</h2>
          <p className="text-sm text-gray-500 mb-4">Please search for flights again</p>
          <button onClick={() => navigate('/flights')} className="bg-[#FD561E] text-white px-6 py-3 rounded-lg w-full hover:bg-[#e04e1b] transition-colors">Go to Search</button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Optional indicator when opened in a new tab */}
      {/* {isNewTab && (
        <div className="bg-blue-50 border-b border-blue-100 text-center py-2 text-xs text-blue-600">
         // ℹ️ This page opened in a new tab. Use the browser's back button to return to the previous tab.
        </div>
      )} */}
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col lg:flex-row gap-6">
          <div className="lg:w-2/3 space-y-5">
            {renderFlightDetails()}
            {tripType === 'round-trip' && renderReturnFlightDetails()}
            {renderAllFares()}
            {renderTaxDetails()}
            {renderOptionalServices()}
            {renderFareRules()}
            {renderPassengerForm()}
            {renderContactForm()}
            {renderPaymentMethods()}
          </div>
          <div className="lg:w-1/3 mb-8">
            {renderPriceSummary()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingReviewPage;