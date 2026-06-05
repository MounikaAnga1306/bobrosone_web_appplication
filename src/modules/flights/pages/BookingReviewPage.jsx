// src/modules/flights/pages/BookingReviewPage.jsx
import React, { useState, useEffect, useCallback, useMemo } from 'react';

import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  FaArrowLeft, FaPlane, FaSpinner, FaInfoCircle, FaCheckCircle,
  FaChevronDown, FaChevronUp, FaUser, FaEnvelope, FaPhone,
  FaSuitcase, FaChair, FaTimesCircle, FaCalendarCheck,
  FaTag, FaCrown, FaGem, FaStar, FaCheck, FaExclamationCircle,
  FaArrowRight, FaClock, FaTicketAlt, FaBuilding,
  FaPlaneDeparture, FaPlaneArrival, FaBabyCarriage,
  FaReceipt, FaFileInvoice, FaShieldAlt, FaBriefcase, FaExchangeAlt,
} from 'react-icons/fa';
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
  FaMapMarkerAlt,
  FaExclamationTriangle
} from 'react-icons/fa';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { fetchAirlines } from '../services/airlineService';

// ── Stores ──────────────────────────────────────────────────────
import useStore   from '../store/useStore';
import usePnrStore from '../store/usePnrStore';

// ── Services ────────────────────────────────────────────────────
import { executePricing }      from '../services/pricingService';
import { buildPnrRequestBody } from '../services/pnrService';

// ── FORMATTERS ──────────────────────────────────────────────────
const fmt = {
  time: (iso) => {
    if (!iso) return '--:--';
    try { return new Date(iso).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true }); }
    catch { return '--:--'; }
  },
  date: (iso) => {
    if (!iso) return '';
    try { return new Date(iso).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' }); }
    catch { return ''; }
  },
  dateShort: (iso) => {
    if (!iso) return '';
    try { return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }); }
    catch { return ''; }
  },
  dur: (mins) => {
    if (!mins) return '—';
    const h = Math.floor(mins / 60), m = mins % 60;
    return m > 0 ? `${h}h ${m}m` : `${h}h`;
  },
  money: (n) => `₹${(n || 0).toLocaleString('en-IN')}`,
};

const INCLUSION = {
  'Included':    { bg: 'bg-green-50 border-green-200',  text: 'text-green-700',  icon: <FaCheck size={9} className="text-green-600" /> },
  'Chargeable':  { bg: 'bg-orange-50 border-orange-200', text: 'text-orange-700', icon: <FaExclamationCircle size={9} className="text-orange-500" /> },
  'Not Offered': { bg: 'bg-gray-50 border-gray-200',    text: 'text-gray-500',   icon: <FaTimesCircle size={9} className="text-gray-400" /> },
};

const InclusionBadge = ({ label, value }) => {
  const s = INCLUSION[value] || INCLUSION['Not Offered'];
  return (
    <div className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-medium ${s.bg} ${s.text}`}>
      {s.icon} {label}
    </div>
  );
};

const TIER_ICON = (tier) => {
  if (tier >= 6) return <FaGem   className="text-purple-500" size={14} />;
  if (tier >= 5) return <FaCrown className="text-yellow-500" size={14} />;
  if (tier >= 4) return <FaStar  className="text-blue-500"   size={14} />;
  return              <FaTag   className="text-[#FD561E]"  size={14} />;
};

const SCard = ({ children, className = '' }) => (
  <div className={`bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden ${className}`}>{children}</div>
);

const STitle = ({ icon: Icon, iconBg, title, subtitle, sectionKey, expanded, onToggle, badge }) => (
  <button onClick={() => onToggle(sectionKey)}
    className="w-full flex items-center justify-between px-5 py-4 hover:bg-gray-50 transition-colors text-left">
    <div className="flex items-center gap-3">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${iconBg}`}>
        <Icon className="text-[#FD561E]" size={17} />
      </div>
      <div>
        <div className="flex items-center gap-2">
          <span className="font-semibold text-gray-800 text-sm">{title}</span>
          {badge && <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-[#FD561E] text-white">{badge}</span>}
        </div>
        {subtitle && <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>}
      </div>
    </div>
    {expanded ? <FaChevronUp className="text-gray-400 flex-shrink-0" size={13} /> : <FaChevronDown className="text-gray-400 flex-shrink-0" size={13} />}
  </button>
);

const paxLabel = (type) => type === 'ADT' ? 'Adult' : type === 'CNN' ? 'Child' : 'Infant';

const calcAge = (dob) => {
  if (!dob) return 0;
  const today = new Date(), birth = new Date(dob);
  let age = today.getFullYear() - birth.getFullYear();
  if (today.getMonth() - birth.getMonth() < 0 || (today.getMonth() === birth.getMonth() && today.getDate() < birth.getDate())) age--;
  return age;
};

const makePassengerList = (counts) => {
  const list = [];
  for (let i = 0; i < (counts?.ADT || 1); i++)  list.push({ id: `adt-${i}`, type: 'ADT', label: 'Adult',  firstName: '', lastName: '', dob: '', gender: '', nationality: 'IN' });
  for (let i = 0; i < (counts?.CNN || 0); i++)   list.push({ id: `cnn-${i}`, type: 'CNN', label: 'Child',  firstName: '', lastName: '', dob: '', gender: '' });
  for (let i = 0; i < (counts?.INF || 0); i++)   list.push({ id: `inf-${i}`, type: 'INF', label: 'Infant', firstName: '', lastName: '', dob: '', gender: '' });
  return list;
};

// ── FLIGHT LEG ──────────────────────────────────────────────────
const FlightLeg = ({ segments, legLabel, isReturn = false }) => {
  if (!segments?.length) return null;
  const first = segments[0], last = segments[segments.length - 1];
  const totalMins = segments.reduce((s, seg) => s + (seg.flightTime || 0), 0);
  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <div className={`w-7 h-7 rounded-full flex items-center justify-center ${isReturn ? 'bg-green-100' : 'bg-blue-100'}`}>
          {isReturn ? <FaPlaneArrival className="text-green-600" size={12} /> : <FaPlaneDeparture className="text-blue-600" size={12} />}
        </div>
        <span className={`text-xs font-bold uppercase tracking-wide ${isReturn ? 'text-green-700' : 'text-blue-700'}`}>{legLabel}</span>
        {segments.length === 1
          ? <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-medium">Non-stop</span>
          : <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-medium">{segments.length - 1} stop{segments.length > 2 ? 's' : ''}</span>
        }
      </div>
      <div className="flex items-center justify-between mb-5 px-2">
        <div className="text-center flex-1">
          <div className="text-3xl font-black text-gray-900 tracking-tight">{fmt.time(first.departureTime)}</div>
          <div className="text-lg font-bold text-gray-700">{first.origin}</div>
          <div className="text-xs text-gray-400 mt-0.5">{fmt.date(first.departureTime)}</div>
// Passenger type colors
const getPassengerTypeColor = (type) => {
  switch(type) {
    case 'ADT': return 'text-blue-500 bg-blue-50';
    case 'CNN': return 'text-green-500 bg-green-50';
    case 'INF': return 'text-[#FD561E] bg-[#FD561E]/10';
    default: return 'text-gray-500 bg-gray-50';
  }
};

// Tax category mapping
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
  
  // ============ GET CONTEXT ============
  const { 
    bookingData,
    initializeBookingData,
    selectFareWithHostToken,
    updatePassengersList,
    updateContactInformation,
    updatePaymentMethodType,
    setRawPricingResponse
  } = usePricingBooking();
  
  // ============ DATA FROM NAVIGATION STATE ============
  const selectedOutboundFare = state.selectedOutboundFare;
  const selectedReturnFare = state.selectedReturnFare;
  const outboundFlight = state.outboundFlight;
  const returnFlight = state.returnFlight;
  const passengerCounts = state.passengerCounts || { ADT: 1, CNN: 0, INF: 0 };
  const tripType = state.tripType || 'one-way';
  const totalPriceFromState = state.totalPrice || 0;
  
  // ============ STATE ============
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
    contactInfo: true
  });
  // REMOVED: paymentMethod state - now default to 'upi'
  const [passengers, setPassengers] = useState(() => {
    const initialPassengers = [];
    const adultCount = passengerCounts?.ADT || 1;
    const childCount = passengerCounts?.CNN || 0;
    const infantCount = passengerCounts?.INF || 0;
    
    for (let i = 0; i < adultCount; i++) {
      initialPassengers.push({
        id: `adt-${i}`,
        code: 'ADT',
        title: 'Adult',
        firstName: '',
        lastName: '',
        dob: '',
        gender: ''
      });
    }
    for (let i = 0; i < childCount; i++) {
      initialPassengers.push({
        id: `cnn-${i}`,
        code: 'CNN',
        title: 'Child',
        firstName: '',
        lastName: '',
        dob: '',
        gender: ''
      });
    }
    for (let i = 0; i < infantCount; i++) {
      initialPassengers.push({
        id: `inf-${i}`,
        code: 'INF',
        title: 'Infant',
        firstName: '',
        lastName: '',
        dob: '',
        gender: ''
      });
    }
    return initialPassengers;
  });
  
  const [contactInfo, setContactInfo] = useState({
    email: '',
    phone: { countryCode: '91', number: '' }
  });
  
  const [errors, setErrors] = useState({});
  const [ageErrors, setAgeErrors] = useState([]);
  const [airlines, setAirlines] = useState([]);

  // ============ FETCH AIRLINES ============
  useEffect(() => {
    const loadAirlines = async () => {
      try {
        const rows = await fetchAirlines();
        setAirlines(rows);
      } catch (err) {
        console.error('Failed to fetch airlines:', err);
      }
    };
    loadAirlines();
  }, []);
  
  // ============ FETCH PRICING API ============
  useEffect(() => {
    const fetchPricing = async () => {
      if (!selectedOutboundFare) {
        console.log('No selected fares found in navigation state');
        setLoading(false);
        return;
      }
      
      if (bookingData?.rawPricingResponse) {
        console.log('Using existing pricing data from context');
        const allFareOptions = extractAllFareOptions(bookingData.rawPricingResponse);
        const flightSegments = extractFlightSegments(bookingData.rawPricingResponse);
        const optionalServices = extractOptionalServices(bookingData.rawPricingResponse);
        
        setExtractedData({
          rawPricingResponse: bookingData.rawPricingResponse,
          allFareOptions,
          flightSegments,
          optionalServices,
          isRoundTrip: tripType === 'round-trip',
          tripType: tripType
        });
        setLoading(false);
        return;
      }
      
      setLoading(true);
      setPricingError(null);
      
      const loadingToast = toast.loading('Fetching fare details...');
      
      try {
        let pricingRequest;
        
        if (tripType === 'round-trip') {
          pricingRequest = buildRoundTripPricingRequest(
            outboundFlight,
            selectedOutboundFare,
            returnFlight,
            selectedReturnFare,
            passengerCounts
          );
          console.log('Building round-trip pricing request');
        } else {
          pricingRequest = buildOneWayPricingRequest(
            outboundFlight,
            selectedOutboundFare,
            passengerCounts
          );
          console.log('Building one-way pricing request');
        }
        
        const result = await getFlightPricing(pricingRequest);
        
        toast.dismiss(loadingToast);
        
        if (result.success && result.rawResponse) {
          console.log('✅ Pricing API successful');
          
          const allFareOptions = extractAllFareOptions(result.rawResponse);
          const flightSegments = extractFlightSegments(result.rawResponse);
          const optionalServices = extractOptionalServices(result.rawResponse);
          
          setExtractedData({
            rawPricingResponse: result.rawResponse,
            allFareOptions,
            flightSegments,
            optionalServices,
            isRoundTrip: tripType === 'round-trip',
            tripType: tripType
          });
          
          toast.success('Fare options loaded successfully');
        } else {
          throw new Error(result.error || 'Failed to get pricing');
        }
      } catch (error) {
        console.error('Pricing API failed:', error);
        toast.error(error.message || 'Failed to fetch fare details');
        setPricingError(error.message);
      } finally {
        setLoading(false);
      }
    };
    
    fetchPricing();
  }, [selectedOutboundFare, selectedReturnFare, outboundFlight, returnFlight, passengerCounts, tripType, bookingData?.rawPricingResponse]);
  
  // ============ Get selected fare details from extracted data ============
  const selectedFare = extractedData?.allFareOptions?.[selectedFareIndex];
  const rawPricingResponse = extractedData?.rawPricingResponse;
  const flightSegments = extractedData?.flightSegments || [];
  const isConnectingFlight = flightSegments.length > 1;
  
  const outboundSegments = useMemo(() => {
    if (tripType !== 'round-trip') return flightSegments;
    const midPoint = Math.ceil(flightSegments.length / 2);
    return flightSegments.slice(0, midPoint);
  }, [flightSegments, tripType]);
  
  const returnSegments = useMemo(() => {
    if (tripType !== 'round-trip') return [];
    const midPoint = Math.ceil(flightSegments.length / 2);
    return flightSegments.slice(midPoint);
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
    if (field === 'dob') {
      setAgeErrors([]);
    }
  };
  
  const calculateAge = (dob) => {
    if (!dob) return null;
    const today = new Date();
    const birthDate = new Date(dob);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) age--;
    return age;
  };
  
  const validatePassengerAges = useCallback(() => {
    const ageErrorsList = [];
    
    passengers.forEach((passenger, idx) => {
      if (passenger.code === 'CNN' && passenger.dob) {
        const age = calculateAge(passenger.dob);
        if (age !== null && (age < 2 || age > 11)) {
          ageErrorsList.push({
            passengerIndex: idx,
            passengerName: `${passenger.firstName || 'Child'} ${passenger.lastName || ''}`.trim() || `Child ${idx + 1}`,
            message: `Child must be between 2-11 years old. Current age: ${age} years.`
          });
        }
      } else if (passenger.code === 'INF' && passenger.dob) {
        const age = calculateAge(passenger.dob);
        if (age !== null && age >= 2) {
          ageErrorsList.push({
            passengerIndex: idx,
            passengerName: `${passenger.firstName || 'Infant'} ${passenger.lastName || ''}`.trim() || `Infant ${idx + 1}`,
            message: `Infant must be under 2 years old. Current age: ${age} years.`
          });
        }
      }
    });
    
    setAgeErrors(ageErrorsList);
    return ageErrorsList.length === 0;
  }, [passengers]);
  
  const validateForm = useCallback(() => {
    const newErrors = {};
    
    passengers.forEach((passenger, idx) => {
      if (!passenger.firstName.trim()) newErrors[`passenger_${idx}_firstName`] = 'First name required';
      if (!passenger.lastName.trim()) newErrors[`passenger_${idx}_lastName`] = 'Last name required';
      if (!passenger.dob) {
        newErrors[`passenger_${idx}_dob`] = 'Date of birth required';
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
    const allPassengersValid = passengers.every(p => 
      p.firstName.trim() && p.lastName.trim() && p.dob && p.gender
    );
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
        hostToken: hostToken,
        hostTokenRef: selectedFareData?.bookingInfo?.hostTokenRef,
        passengerPricing: selectedFareData?.passengerPricing,
        passengerHostTokens: selectedFareData?.passengerHostTokens,
        passengerTypes: selectedFareData?.passengerTypes
      };
      
      selectFareWithHostToken(selectedFareWithDetails, hostToken);
      
      console.log(`✈️ Fare selected: ${brandName}`);
    }
    
    setSelectedFareIndex(index);
    toast.success(`Selected ${extractedData?.allFareOptions[index]?.brand?.name || 'Fare'} option`);
  };
  
  const handleProceedToBooking = async () => {
    const isAgeValid = validatePassengerAges();
    if (!isAgeValid) {
      toast.error('Please fix age-related issues before proceeding');
      setExpandedSections(prev => ({ ...prev, passengerDetails: true }));
      return;
    }
    
    if (!validateForm()) {
      toast.error('Please fill in all required fields');
      setExpandedSections(prev => ({ ...prev, passengerDetails: true }));
      return;
    }
    
    const enrichedPassengers = enrichPassengersWithAges(passengers);
    const paymentMethod = 'upi';
    
    const completeBookingData = {
      rawPricingResponse: rawPricingResponse,
      hostToken: selectedFareHostToken,
      hostTokenRef: selectedFare?.bookingInfo?.hostTokenRef,
      flightSegments: extractedData?.flightSegments || [],
      outboundSegments: outboundSegments,
      returnSegments: returnSegments,
      selectedFare: {
        ...selectedFare,
        details: selectedFareDetails,
        features: selectedBrandFeatures,
        penalties: selectedPenalties,
        baggage: selectedBaggage,
        taxBreakdown: selectedTaxBreakdown,
        hostToken: selectedFareHostToken,
        hostTokenRef: selectedFare?.bookingInfo?.hostTokenRef,
        passengerPricing: selectedFare?.passengerPricing,
        passengerHostTokens: selectedFare?.passengerHostTokens,
        passengerTypes: selectedFare?.passengerTypes
      },
      allFareOptions: extractedData?.allFareOptions,
      optionalServices: extractedData?.optionalServices,
      passengers: enrichedPassengers,
      passengerCounts: passengerCounts,
      passengerPricing: passengerPricing,
      contactInfo: contactInfo,
      paymentMethod: paymentMethod,
      isRoundTrip: tripType === 'round-trip',
      tripType: tripType,
      currency: 'INR',
      timestamp: new Date().toISOString()
    };
    
    if (initializeBookingData) initializeBookingData(completeBookingData);
    if (updatePassengersList) updatePassengersList(enrichedPassengers);
    if (updateContactInformation) updateContactInformation(contactInfo);
    if (updatePaymentMethodType) updatePaymentMethodType(paymentMethod);
    
    console.log('\n📦 COMPLETE BOOKING DATA STORED IN CONTEXT:');
    console.log('   - Selected Fare:', selectedFare?.brand?.name);
    console.log('   - Passengers:', enrichedPassengers.length);
    console.log('   - Contact:', contactInfo.email);
    console.log('   - Payment Method:', paymentMethod, '(Default UPI)');
    
    setTimeout(() => {
      console.log('🚀 NAVIGATING to seat map page...');
      navigate('/flights/booking/seat-map');
    }, 100);
  };
  
  // ============ AIRLINE HELPER ============
  const getAirline = (code) => airlines.find(a => a.code === code) || null;

  // ============ RENDER FLIGHT SEGMENTS (REMOVED Aircraft/Class/Booking Code/Status) ============
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
            {segment.originTerminal && (
              <div className="text-xs text-gray-400 mt-0.5">Terminal {segment.originTerminal}</div>
            )}
          </div>
          
          <div className="flex-1 px-6">
            <div className="relative">
              <div className="w-full h-px bg-gray-200"></div>
              <FaPlane className="absolute text-[#FD561E] transform -translate-x-1/2 -translate-y-1/2 left-1/2 top-1/2 rotate-90 bg-white px-1" size={12} />
            </div>
            <div className="text-center text-xs text-gray-400 mt-2">
              <FaStopwatch className="inline mr-1" size={10} /> {formatDuration(segment.flightTime)}
            </div>
            {(() => {
              const airline = getAirline(segment.carrier);
              return airline ? (
                <div className="flex items-center justify-center gap-1.5 mt-1.5">
                  <img src={airline.logo_url} alt={airline.name} className="w-5 h-5 object-contain" />
                  <span className="text-xs text-gray-500">{airline.name}</span>
                </div>
              ) : segment.codeshareInfo ? (
                <div className="text-center text-xs text-gray-400 mt-1">
                  Operated by {segment.codeshareInfo.operatingCarrier}
                </div>
              ) : null;
            })()}
          </div>
          
          <div className="text-center flex-1">
            <div className="text-2xl font-bold text-gray-800">{formatTime(segment.arrivalTime)}</div>
            <div className="text-base font-medium text-gray-600 mt-1">{segment.destination}</div>
            <div className="text-xs text-gray-400 mt-0.5">{formatDate(segment.arrivalTime)}</div>
            {segment.destinationTerminal && (
              <div className="text-xs text-gray-400 mt-0.5">Terminal {segment.destinationTerminal}</div>
            )}
          </div>
        </div>
      </div>
    );
  };
  
  // ============ RENDER FLIGHT DETAILS ============
  const renderFlightDetails = () => {
    if (!outboundSegments.length) return null;
    
    return (
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-lg transition-all">
        <button
          onClick={() => toggleSection('flightDetails')}
          className="w-full flex items-center justify-between p-5 hover:bg-[#FD561E]/5 transition-colors"
        >
          <div className="flex items-center gap-3">
            {(() => {
              const airline = getAirline(outboundSegments[0]?.carrier);
              return airline ? (
                <img src={airline.logo_url} alt={airline.name} className="w-10 h-10 object-contain rounded-xl border border-gray-100 p-1 bg-white" />
              ) : (
                <div className="w-10 h-10 bg-[#FD561E]/10 rounded-xl flex items-center justify-center">
                  <FaPlaneDeparture className="text-[#FD561E]" size={18} />
                </div>
              );
            })()}
            <div>
              <h2 className="font-semibold text-gray-800">
                Outbound Flight
                {isConnectingFlight && <span className="ml-2 text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">Connecting Flight</span>}
              </h2>
              <p className="text-xs text-gray-500">
                {getAirline(outboundSegments[0]?.carrier)?.name || outboundSegments[0]?.carrier} · {outboundSegments[0]?.flightNumber}
              </p>
            </div>
          </div>
          {expandedSections.flightDetails ? <FaChevronUp className="text-gray-400" /> : <FaChevronDown className="text-gray-400" />}
        </button>
        
        {expandedSections.flightDetails && (
          <div className="p-5 border-t border-gray-100">
            {outboundSegments.map((segment, segIdx) => renderFlightSegment(segment, segIdx, false))}
          </div>
        )}
      </div>
    );
  };
  
  // ============ RENDER RETURN FLIGHT DETAILS ============
  const renderReturnFlightDetails = () => {
    if (tripType !== 'round-trip' || !returnSegments.length) return null;
    
    const isReturnConnecting = returnSegments.length > 1;
    
    return (
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-lg transition-all">
        <button
          onClick={() => toggleSection('returnFlightDetails')}
          className="w-full flex items-center justify-between p-5 hover:bg-[#FD561E]/5 transition-colors"
        >
          <div className="flex items-center gap-3">
            {(() => {
              const airline = getAirline(returnSegments[0]?.carrier);
              return airline ? (
                <img src={airline.logo_url} alt={airline.name} className="w-10 h-10 object-contain rounded-xl border border-gray-100 p-1 bg-white" />
              ) : (
                <div className="w-10 h-10 bg-[#FD561E]/10 rounded-xl flex items-center justify-center">
                  <FaPlaneArrival className="text-[#FD561E]" size={18} />
                </div>
              );
            })()}
            <div>
              <h2 className="font-semibold text-gray-800">
                Return Flight
                {isReturnConnecting && <span className="ml-2 text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">Connecting Flight</span>}
              </h2>
              <p className="text-xs text-gray-500">
                {getAirline(returnSegments[0]?.carrier)?.name || returnSegments[0]?.carrier} · {returnSegments[0]?.flightNumber}
              </p>
            </div>
          </div>
          {expandedSections.returnFlightDetails ? <FaChevronUp className="text-gray-400" /> : <FaChevronDown className="text-gray-400" />}
        </button>
        
        {expandedSections.returnFlightDetails && (
          <div className="p-5 border-t border-gray-100">
            {returnSegments.map((segment, segIdx) => renderFlightSegment(segment, segIdx, true))}
          </div>
        )}
      </div>
    );
  };
  
  // ============ RENDER PASSENGER PRICE BREAKDOWN ============
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
        <div className="flex-1 px-3 text-center">
          <div className="text-xs text-gray-500 font-semibold mb-2">{fmt.dur(totalMins)}</div>
          <div className="relative flex items-center justify-center">
            <div className="w-full h-px bg-gray-300" />
            <FaPlane className="absolute text-[#FD561E] rotate-90 bg-white px-0.5" size={14} />
          </div>
          {segments.length > 1 && (
            <div className="text-[10px] text-amber-600 font-semibold mt-1.5">via {segments.slice(1).map(s => s.origin).join(', ')}</div>
          )}
        </div>
        <div className="text-center flex-1">
          <div className="text-3xl font-black text-gray-900 tracking-tight">{fmt.time(last.arrivalTime)}</div>
          <div className="text-lg font-bold text-gray-700">{last.destination}</div>
          <div className="text-xs text-gray-400 mt-0.5">{fmt.date(last.arrivalTime)}</div>
        </div>
      </div>
      {segments.map((seg, idx) => (
        <div key={seg.key || idx}>
          {idx > 0 && (
            <div className="flex items-center gap-2 bg-amber-50 border border-amber-100 rounded-xl px-4 py-2.5 mb-3">
              <FaClock className="text-amber-500 flex-shrink-0" size={11} />
              <span className="text-xs text-amber-700 font-medium">Layover at {seg.origin}</span>
            </div>
          )}
          <div className={`rounded-xl border border-gray-100 bg-gray-50 p-4 ${idx < segments.length - 1 ? 'mb-3' : ''}`}>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-white border border-gray-200 flex items-center justify-center">
                  <FaPlane className="text-[#FD561E] rotate-90" size={12} />
                </div>
                <div>
                  <div className="text-sm font-bold text-gray-800">{seg.carrier}{seg.flightNumber}</div>
                  <div className="text-[11px] text-gray-400">{seg.equipment || '—'}</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm font-bold text-gray-700">{fmt.dur(seg.flightTime)}</div>
                <div className="text-[11px] text-gray-400">flight time</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex-1">
                <div className="text-base font-bold text-gray-800">{seg.origin}</div>
                <div className="text-sm font-semibold text-gray-600">{fmt.time(seg.departureTime)}</div>
                <div className="text-[11px] text-gray-400">{fmt.dateShort(seg.departureTime)}</div>
              </div>
              <FaArrowRight className="text-gray-300" size={10} />
              <div className="flex-1 text-right">
                <div className="text-base font-bold text-gray-800">{seg.destination}</div>
                <div className="text-sm font-semibold text-gray-600">{fmt.time(seg.arrivalTime)}</div>
                <div className="text-[11px] text-gray-400">{fmt.dateShort(seg.arrivalTime)}</div>
              </div>
            </div>
            {seg.classOfService && (
              <div className="flex flex-wrap gap-2 mt-3">
                <span className="text-[11px] font-semibold bg-white border border-gray-200 text-gray-600 px-2.5 py-1 rounded-lg">
                  Class {seg.classOfService}
                </span>
                <span className="text-[11px] font-semibold bg-emerald-50 border border-emerald-200 text-emerald-700 px-2.5 py-1 rounded-lg flex items-center gap-1">
                  <FaCheck size={8} /> Confirmed
                </span>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

// ── FARE CARD ────────────────────────────────────────────────────
const FareCard = ({ fare, idx, isSelected, cheapestIdx, onSelect }) => {
  const [baggageOpen, setBaggageOpen] = useState(false);
  const isCheapest = idx === cheapestIdx;
  return (
    <div onClick={() => onSelect(idx)}
      className={`rounded-2xl border-2 cursor-pointer transition-all duration-200 overflow-hidden ${
        isSelected ? 'border-[#FD561E] shadow-xl shadow-orange-100 bg-white' : 'border-gray-200 bg-white hover:border-orange-200 hover:shadow-md'
      }`}
    >
      <div className={`px-5 py-4 ${isSelected ? 'bg-gradient-to-r from-[#FD561E]/8 to-orange-50/50' : ''}`}>
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              {TIER_ICON(fare.brandTier ?? 1)}
              <span className="font-black text-gray-800">{fare.brandName}</span>
              {isCheapest && <span className="text-[9px] font-black bg-emerald-500 text-white px-2 py-0.5 rounded-full">BEST VALUE</span>}
              {isSelected && (
                <span className="text-[9px] font-black bg-[#FD561E] text-white px-2 py-0.5 rounded-full flex items-center gap-1">
                  <FaCheck size={7} /> SELECTED
                </span>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {fare.cabin && <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-lg font-semibold">{fare.cabin}</span>}
              {fare.validatingAirline && <span className="text-xs text-gray-400">Operated by {fare.validatingAirline}</span>}
              {fare.fareBasisCode && <span className="text-[11px] text-gray-400 font-mono">{fare.fareBasisCode}</span>}
            </div>
          </div>
          <div className="text-right flex-shrink-0">
            <div className="text-3xl font-black text-[#FD561E] leading-none">{fmt.money(fare.grandTotal)}</div>
            <div className="text-[11px] text-gray-400 mt-0.5">total · all passengers</div>
          </div>
        </div>
      </div>

      <div className="px-5 pb-4">
        <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Fare Inclusions</div>
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5">
          {[
            { label: 'Seat',    key: 'seatAssignment' },
            { label: 'Bag',     key: 'checkedBag'     },
            { label: 'Meals',   key: 'meals'          },
            { label: 'Rebook',  key: 'rebooking'      },
            { label: 'Refund',  key: 'refund'         },
            { label: 'Upgrade', key: 'upgrade'        },
          ].map(({ label, key }) => <InclusionBadge key={key} label={label} value={fare.brandAttributes?.[key]} />)}
        </div>
      </div>

      <div className="mx-5 mb-4 rounded-xl border border-gray-200 overflow-hidden">
        <div className="grid grid-cols-4 text-[10px] font-black text-gray-400 uppercase tracking-wider bg-gray-50 px-4 py-2.5 border-b border-gray-200">
          <span>Passenger</span>
          <span className="text-right">Base Fare</span>
          <span className="text-right">Taxes</span>
          <span className="text-right">Total</span>
        </div>
        {fare.passengerBreakdown?.map((pb) => (
          <div key={pb.passengerType} className="grid grid-cols-4 px-4 py-2.5 text-xs border-b border-gray-50 last:border-0 hover:bg-gray-50">
            <span className="font-semibold text-gray-700">{paxLabel(pb.passengerType)} ×{pb.quantity}</span>
            <span className="text-right text-gray-600">{fmt.money(pb.baseFare)}</span>
            <span className="text-right text-gray-600">{fmt.money(pb.taxes)}</span>
            <span className="text-right font-bold text-gray-800">{fmt.money(pb.totalFare)}</span>
          </div>
        ))}
        <div className="grid grid-cols-4 px-4 py-3 bg-[#FD561E]/6 border-t border-[#FD561E]/15">
          <span className="col-span-3 font-black text-gray-800 text-sm">Grand Total</span>
          <span className="text-right font-black text-[#FD561E] text-sm">{fmt.money(fare.grandTotal)}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 px-5 pb-4">
        <div className="flex items-start gap-3 bg-red-50 rounded-xl p-3 border border-red-100">
          <FaTimesCircle className="text-red-400 mt-0.5 flex-shrink-0" size={13} />
          <div>
            <div className="text-[10px] font-black text-red-600 uppercase tracking-wide">Cancellation</div>
            <div className="text-xs font-bold text-gray-700 mt-0.5">
              {fare.penalties?.cancel?.amount != null ? `${fmt.money(fare.penalties.cancel.amount)} / ticket` : 'Non-refundable'}
            </div>
          </div>
        </div>
        <div className="flex items-start gap-3 bg-blue-50 rounded-xl p-3 border border-blue-100">
          <FaCalendarCheck className="text-blue-400 mt-0.5 flex-shrink-0" size={13} />
          <div>
            <div className="text-[10px] font-black text-blue-600 uppercase tracking-wide">Date Change</div>
            <div className="text-xs font-bold text-gray-700 mt-0.5">
              {fare.penalties?.change?.amount != null ? `${fmt.money(fare.penalties.change.amount)} + fare diff` : 'Not allowed'}
            </div>
          </div>
        </div>
      </div>

      <div className="px-5 pb-4" onClick={(e) => { e.stopPropagation(); setBaggageOpen(p => !p); }}>
        <button className="flex items-center gap-1.5 text-xs text-[#FD561E] font-bold hover:underline">
          <FaBriefcase size={11} />
          {baggageOpen ? 'Hide' : 'Show'} baggage allowance
          {baggageOpen ? <FaChevronUp size={9} /> : <FaChevronDown size={9} />}
        </button>
        {baggageOpen && (
          <div className="mt-3 rounded-xl border border-gray-200 overflow-hidden">
            <div className="grid grid-cols-3 text-[10px] font-black text-gray-400 uppercase tracking-wider bg-gray-50 px-4 py-2 border-b border-gray-100">
              <span>Passenger</span><span className="text-center">Check-in</span><span className="text-center">Carry-on</span>
        
        {expandedSections.allFares && (
          <div className="p-5 border-t border-gray-100">
            <div className="overflow-x-auto pb-4">
              <div className="flex gap-4 min-w-max">
                {allFares.map((fare, idx) => {
                  const isSelected = selectedFareIndex === idx;
                  const brandName = fare.brand?.name || 'Economy';
                  const isLowest = idx === 0;
                  const cabinClass = fare.bookingInfo?.cabinClass || 'Economy';
                  const isPremium = cabinClass === 'PremiumEconomy' || cabinClass === 'Business';
                  const farePassengerTypes = fare.passengerTypes || ['ADT'];
                  const farePassengerPricing = fare.passengerPricing || {};
                  
                  const primaryPassengerType = farePassengerTypes.includes('ADT') ? 'ADT' : farePassengerTypes[0];
                  const primaryPrice = farePassengerPricing[primaryPassengerType]?.totalPrice || fare.totalPrice;
                  
                  return (
                    <div
                      key={idx}
                      className={`flex-shrink-0 w-[320px] rounded-xl border-2 transition-all cursor-pointer ${
                        isSelected 
                          ? 'border-[#FD561E] bg-[#FD561E]/5 shadow-md' 
                          : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
                      }`}
                      onClick={() => handleSelectFare(idx)}
                    >
                      <div className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <div>
                            <h3 className="font-bold text-gray-800">{brandName}</h3>
                            {isPremium && (
                              <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full mt-1 inline-block">Premium</span>
                            )}
                          </div>
                          {isLowest && (
                            <span className="text-[10px] bg-[#FD561E] text-white px-2 py-0.5 rounded-full">Best Price</span>
                          )}
                        </div>
                        
                        <div className="mt-2">
                          <div className="text-2xl font-bold text-[#FD561E]">{formatPrice(primaryPrice)}</div>
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
                            <span className="text-gray-500 flex items-center gap-1">
                              <FaSuitcase size={11} /> Checked Baggage
                            </span>
                            <span className="text-gray-700 font-medium">
                              {farePassengerPricing[primaryPassengerType]?.baggage?.checked?.weight || fare.baggage?.checked || '15'}kg
                            </span>
                          </div>
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-gray-500 flex items-center gap-1">
                              <FaChair size={11} /> Cabin Class
                            </span>
                            <span className="text-gray-700">{cabinClass}</span>
                          </div>
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-gray-500 flex items-center gap-1">
                              <FaExchangeAlt size={11} /> Change Policy
                            </span>
                            <span className="text-gray-700">
                              {fare.penalties?.change?.amount 
                                ? `₹${fare.penalties.change.amount}`
                                : fare.penalties?.change?.percentage
                                ? `${fare.penalties.change.percentage}%`
                                : 'Changeable'}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="px-4 pb-4">
                        <button
                          onClick={() => handleSelectFare(idx)}
                          className={`w-full py-2 rounded-lg text-sm font-medium transition-colors ${
                            isSelected
                              ? 'bg-[#FD561E] text-white'
                              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                          }`}
                        >
                          {isSelected ? 'Selected' : 'Select Fare'}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            {['ADT', 'CNN', 'INF'].map((code) => {
              const bag = fare.baggage?.[code];
              if (!bag) return null;
              return (
                <div key={code} className="grid grid-cols-3 px-4 py-2.5 text-xs border-b border-gray-50 last:border-0">
                  <span className="font-semibold text-gray-700">{paxLabel(code)}</span>
                  <span className="text-center font-bold text-gray-800">{bag.checked?.weight != null ? `${bag.checked.weight} kg` : '—'}</span>
                  <span className="text-center font-bold text-gray-800">{bag.carryOn?.weight != null ? `${bag.carryOn.weight} kg` : '—'}</span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {fare.paymentTimeLimit && (
        <div className="mx-5 mb-4 flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2">
          <FaClock className="text-amber-500 flex-shrink-0" size={11} />
          <span className="text-[11px] text-amber-700 font-semibold">Book by: {fmt.date(fare.paymentTimeLimit)}</span>
        </div>
      )}
    </div>
  );
};

// ── PRICE SIDEBAR ────────────────────────────────────────────────
const PriceSidebar = ({ selectedFare, isRoundTrip, outbound, inbound, onConfirm, loading, disabled }) => {
  if (!selectedFare) return null;
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="bg-gradient-to-r from-[#FD561E] to-orange-400 px-5 py-4">
        <div className="flex items-center gap-2 mb-1">
          <FaReceipt className="text-white" size={15} />
          <span className="text-white font-black">Price Summary</span>
        </div>
        <div className="text-white/80 text-xs">{selectedFare.brandName} · {selectedFare.cabin}</div>
      </div>
      <div className="p-5 space-y-4">
        <div className="bg-gray-50 rounded-xl p-3 border border-gray-100 text-xs space-y-1">
          <div className="flex items-center justify-between">
            <span className="font-bold text-gray-700">{outbound?.from} → {outbound?.to}</span>
            <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-bold text-[10px]">
              {isRoundTrip ? 'Round Trip' : 'One Way'}
            </span>
          </div>
          {isRoundTrip && inbound && (
            <div className="flex items-center gap-1 text-gray-500">
              <FaExchangeAlt size={9} className="text-green-500" />
              <span>Return: {inbound.from} → {inbound.to}</span>
            </div>
          )}
        </div>
        <div className="space-y-2">
          <div className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Fare Breakdown</div>
          {selectedFare.passengerBreakdown?.map((pb) => (
            <div key={pb.passengerType} className="rounded-xl border border-gray-100 bg-gray-50 p-3">
              <div className="flex justify-between mb-2">
                <span className="text-xs font-bold text-gray-700">{paxLabel(pb.passengerType)} × {pb.quantity}</span>
                <span className="text-sm font-black text-gray-800">{fmt.money(pb.totalFare * pb.quantity)}</span>
              </div>
              <div className="space-y-0.5">
                <div className="flex justify-between text-[11px] text-gray-400">
                  <span>Base fare × {pb.quantity}</span><span>{fmt.money(pb.baseFare * pb.quantity)}</span>
          {expandedSections.taxDetails ? <FaChevronUp className="text-gray-400" /> : <FaChevronDown className="text-gray-400" />}
        </button>
        
        {expandedSections.taxDetails && (
          <div className="p-5 border-t border-gray-100">
            <div className="space-y-3">
              {taxBreakdown.map((tax, idx) => (
                <div key={idx} className="flex justify-between items-center py-3 border-b border-gray-100 last:border-0">
                  <div>
                    <p className="text-sm font-medium text-gray-700">{tax.name || taxCategoryMap[tax.category] || tax.category}</p>
                    <p className="text-xs text-gray-400">{tax.category}</p>
                  </div>
                  <p className="text-sm font-semibold text-gray-800">{formatPrice(tax.amount)}</p>
                </div>
                <div className="flex justify-between text-[11px] text-gray-400">
                  <span>Taxes × {pb.quantity}</span><span>{fmt.money(pb.taxes * pb.quantity)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="space-y-1.5 border-t border-gray-100 pt-3">
          <div className="flex justify-between text-xs text-gray-500">
            <span>Total Base Fare</span><span className="font-semibold">{fmt.money(selectedFare.totalBaseFare)}</span>
          </div>
          <div className="flex justify-between text-xs text-gray-500">
            <span>Taxes &amp; Fees</span><span className="font-semibold">{fmt.money(selectedFare.totalTaxes + (selectedFare.totalFees || 0))}</span>
          </div>
        </div>
        <div className="flex items-center justify-between bg-[#FD561E]/8 rounded-2xl px-4 py-4 border border-[#FD561E]/20">
          <div>
            <div className="text-xs text-gray-500 font-medium">Grand Total</div>
            <div className="text-[10px] text-gray-400">incl. all taxes</div>
          </div>
          <div className="text-3xl font-black text-[#FD561E]">{fmt.money(selectedFare.grandTotal)}</div>
        </div>
        <button onClick={onConfirm} disabled={disabled || loading}
          className="w-full py-4 bg-[#FD561E] hover:bg-[#e04e1b] active:scale-[0.98] text-white font-black text-base rounded-2xl shadow-lg shadow-orange-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all">
          {loading
            ? <><FaSpinner className="animate-spin" size={16} /> Confirming...</>
            : <>Confirm &amp; Proceed {fmt.money(selectedFare.grandTotal)} <FaArrowRight size={14} /></>}
        </button>
        <p className="text-[10px] text-center text-gray-400">By confirming you agree to the fare rules.</p>
      </div>
    </div>
  );
};

// ── LOADING / ERROR ──────────────────────────────────────────────
const LoadingScreen = () => (
  <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
    <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-12 text-center max-w-xs w-full">
      <div className="w-16 h-16 border-4 border-[#FD561E] border-t-transparent rounded-full animate-spin mx-auto mb-5" />
      <h2 className="font-black text-gray-800 text-lg mb-1">Fetching Fare Options</h2>
      <p className="text-sm text-gray-400">Getting the best prices for you...</p>
    </div>
  </div>
);

const ErrorScreen = ({ message, onBack }) => (
  <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
    <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-10 text-center max-w-sm w-full">
      <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-5">
        <FaTimesCircle className="text-red-500" size={28} />
      </div>
      <h2 className="font-black text-gray-800 text-lg mb-2">Unable to Load Fares</h2>
      <p className="text-sm text-gray-500 mb-6">{message}</p>
      <button onClick={onBack} className="w-full bg-[#FD561E] text-white py-3.5 rounded-2xl font-black hover:bg-[#e04e1b] transition-colors">
        ← Go Back
      </button>
    </div>
  </div>
);

// ══════════════════════════════════════════════════════════════════
// MAIN PAGE
// ══════════════════════════════════════════════════════════════════
const BookingReviewPage = () => {
  const navigate = useNavigate();
  const { state } = useLocation();

  // ── Data passed from OneWaySheet / RoundTripSheet via navigate state ──
  const selectedOutbound = state?.selectedOutbound ?? null;
  const selectedInbound  = state?.selectedInbound  ?? null;
  const passengerCounts  = state?.passengerCounts  ?? { ADT: 1, CNN: 0, INF: 0 };
  const tripType         = state?.tripType         ?? 'one-way';
  const isRoundTrip      = tripType === 'round-trip';

  // ── Read from useStore — everything executePricing() saves here ──
  // Each field selected independently to avoid reference-equality re-render loops.
  const pricingResult      = useStore((s) => s.pricingResult);
  const rawPricingResponse = useStore((s) => s.rawPricingResponse);
  const pricingLoading     = useStore((s) => s.pricingLoading);
  const pricingError       = useStore((s) => s.pricingError);
  const storeTraceId       = useStore((s) => s.traceId);

  // PNR loading state from usePnrStore (used while building + navigating)
  const pnrLoading = usePnrStore((s) => s.isLoading);

  // ── Local state ──────────────────────────────────────────────────
  const [selectedFareIndex, setSelectedFareIndex] = useState(0);
  const [passengers,  setPassengers]  = useState(() => makePassengerList(passengerCounts));
  const [contactInfo, setContactInfo] = useState({
    email: '',
    phone: { countryCode: '91', number: '' },
    address: { street: '', city: '', state: '', postalCode: '', countryCode: 'IN' },
  });
  const [gstData,  setGstData]  = useState({ gstn: '', gsta: '', gstp: '', gste: '' });
  const [showGst,  setShowGst]  = useState(false);
  const [errors,   setErrors]   = useState({});
  const [expanded, setExpanded] = useState({ fares: true, outbound: true, inbound: true, passengers: true, contact: true });

  const toggleSection = useCallback((key) => setExpanded((p) => ({ ...p, [key]: !p[key] })), []);

  // ── Call executePricing on mount ─────────────────────────────────
  // executePricing() reads everything from store:
  //   store.traceId        → "BOBROS-xxx"
  //   store.travelerRefs   → { ADT: "base64==" }
  //   store.selectedOutbound / selectedInbound
  //   store.searchParams   → passenger counts
  // Saves result to store.pricingResult and store.rawPricingResponse
  useEffect(() => {
    if (!selectedOutbound) return;

    // If pricing already loaded for this session, don't re-fetch
    if (pricingResult) {
      setSelectedFareIndex(pricingResult.cheapestFareIndex ?? 0);
      return;
    }

    executePricing().then((result) => {
      if (result.success) {
        const cheapest = useStore.getState().pricingResult?.cheapestFareIndex ?? 0;
        setSelectedFareIndex(cheapest);
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Derived data from pricingResult ─────────────────────────────
  const fareOptions  = pricingResult?.fareOptions ?? [];
  const segments     = pricingResult?.segments    ?? [];
  const selectedFare = fareOptions[selectedFareIndex] ?? null;

  const outboundSegs = useMemo(
    () => isRoundTrip ? segments.filter(s => s.group === 0) : segments,
    [segments, isRoundTrip]
  );
  const inboundSegs = useMemo(
    () => isRoundTrip ? segments.filter(s => s.group === 1) : [],
    [segments, isRoundTrip]
  );

  // ── Form helpers ─────────────────────────────────────────────────
  const updateContact = useCallback((path, value) => {
    setContactInfo((prev) => {
      const clone  = { ...prev };
      const parts  = path.split('.');
      if (parts.length === 1) clone[parts[0]] = value;
      else clone[parts[0]] = { ...clone[parts[0]], [parts[1]]: value };
      return clone;
    });
  }, []);

  const updatePassenger = useCallback((idx, field, value) =>
    setPassengers((prev) => prev.map((p, i) => i === idx ? { ...p, [field]: value } : p)), []);

  const validate = useCallback(() => {
    const errs = {};
    passengers.forEach((p, i) => {
      if (!p.firstName.trim()) errs[`p${i}_fn`]     = 'Required';
      if (!p.lastName.trim())  errs[`p${i}_ln`]     = 'Required';
      if (!p.dob)              errs[`p${i}_dob`]    = 'Required';
      else {
        const age = calcAge(p.dob);
        if (p.type === 'ADT' && age < 12)              errs[`p${i}_dob`] = 'Adult must be 12+';
        if (p.type === 'CNN' && (age < 2 || age > 11)) errs[`p${i}_dob`] = 'Child age 2–11';
        if (p.type === 'INF' && age > 2)               errs[`p${i}_dob`] = 'Infant under 2';
      }
      if (!p.gender)           errs[`p${i}_gender`] = 'Required';
    });
    if (!contactInfo.email.trim())                                 errs.email = 'Required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contactInfo.email)) errs.email = 'Invalid email';
    if (!contactInfo.phone.number.trim())                          errs.phone = 'Required';
    else if (!/^\d{10}$/.test(contactInfo.phone.number))           errs.phone = 'Must be 10 digits';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }, [passengers, contactInfo]);

  const isFormValid = useCallback(() => {
    const paxOk = passengers.every(p => p.firstName && p.lastName && p.dob && p.gender);
    const ctOk  = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contactInfo.email) && /^\d{10}$/.test(contactInfo.phone.number);
    return paxOk && ctOk;
  }, [passengers, contactInfo]);

  // ── Confirm handler ───────────────────────────────────────────────
  // Does NOT call PNR API here.
  // Builds PNR request body and navigates to PassengerDetailsReviewPage.
  // PassengerDetailsReviewPage calls PNR API on mount.
  const handleConfirm = async () => {
    if (!validate()) { toast.error('Please fill all required fields'); return; }
    if (!rawPricingResponse?.data) { toast.error('Pricing data missing — go back and retry'); return; }

    const passengerKeys = rawPricingResponse?.passengerKeys ?? [];

    // Build PNR request body using pnrService builder
    const pnrRequestBody = buildPnrRequestBody({
      traceId:          rawPricingResponse.traceId ?? storeTraceId,
      selectedFareIndex,
      passengers,
      passengerKeys,
      rawPricingData:   rawPricingResponse.data,   // full SOAP envelope
      contactInfo,
      gstData:          showGst ? gstData : null,
    });

    console.log('📦 PNR request body built:', JSON.stringify(pnrRequestBody, null, 2));

    // Navigate to PassengerDetailsReviewPage
    // PNR API is called there on mount
    navigate('/flights/passenger-review', {
      state: {
        pnrRequestBody,               // ready to POST
        selectedOutbound,             // for display header
        selectedInbound,
        passengerCounts,
        tripType,
        selectedFare,                 // for fare summary display
      },
    });
  };

  // ── Guards ────────────────────────────────────────────────────────
  if (pricingLoading) return <LoadingScreen />;
  if (pricingError)   return <ErrorScreen message={pricingError} onBack={() => navigate(-1)} />;
  if (!selectedOutbound) return <ErrorScreen message="No booking data found." onBack={() => navigate('/flights')} />;

  const paxSummary = [
    passengerCounts.ADT > 0 && `${passengerCounts.ADT} Adult${passengerCounts.ADT > 1 ? 's' : ''}`,
    passengerCounts.CNN > 0 && `${passengerCounts.CNN} Child${passengerCounts.CNN > 1 ? 'ren' : ''}`,
    passengerCounts.INF > 0 && `${passengerCounts.INF} Infant${passengerCounts.INF > 1 ? 's' : ''}`,
  ].filter(Boolean).join(' · ');

  const PAX_COLORS = {
    ADT: 'bg-blue-50 text-blue-700 border-blue-200',
    CNN: 'bg-green-50 text-green-700 border-green-200',
    INF: 'bg-orange-50 text-orange-700 border-orange-200',
  };

  return (
    <div className="min-h-screen bg-gray-50">

      {/* HEADER */}
      <div className="bg-white border-b border-gray-100 sticky top-0 z-30 shadow-sm">
        <div className="container mx-auto max-w-6xl px-4">
          <div className="flex items-center gap-3 py-3.5">
            <button onClick={() => navigate(-1)} className="w-9 h-9 flex items-center justify-center rounded-xl bg-gray-100 hover:bg-gray-200 transition-colors flex-shrink-0">
              <FaArrowLeft size={14} className="text-gray-600" />
            </button>
            <div className="flex-1 min-w-0">
              <h1 className="font-black text-gray-900 text-base leading-tight">Review &amp; Book</h1>
              <p className="text-xs text-gray-400 truncate">
                {selectedOutbound.from} → {isRoundTrip ? (selectedInbound?.to ?? selectedOutbound.to) : selectedOutbound.to} · {isRoundTrip ? 'Round Trip' : 'One Way'} · {paxSummary}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* CONTENT */}
      <div className="container mx-auto max-w-6xl px-4 py-5">
        <div className="flex flex-col lg:flex-row gap-5">

          {/* LEFT */}
          <div className="flex-1 min-w-0 space-y-4">

            {/* Outbound segments */}
            {outboundSegs.length > 0 && (
              <SCard>
                <STitle icon={FaPlaneDeparture} iconBg="bg-blue-50" title="Outbound Flight"
                  subtitle={`${selectedOutbound.from} → ${selectedOutbound.to}`}
                  sectionKey="outbound" expanded={expanded.outbound} onToggle={toggleSection} />
                {expanded.outbound && (
                  <div className="border-t border-gray-100 p-5">
                    <FlightLeg segments={outboundSegs} legLabel={`${selectedOutbound.from} → ${selectedOutbound.to}`} />
          {expandedSections.optionalServices ? <FaChevronUp className="text-gray-400" /> : <FaChevronDown className="text-gray-400" />}
        </button>
        
        {expandedSections.optionalServices && (
          <div className="p-5 border-t border-gray-100 space-y-6">
            {mealOptions.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                  <FaUtensils className="text-[#FD561E]" size={14} />
                  Meal Options ({mealOptions.length})
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {mealOptions.slice(0, 6).map((meal, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-[#FD561E]/5 transition-colors">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-800">{meal.name}</p>
                        {meal.description && <p className="text-xs text-gray-500 mt-0.5 truncate max-w-[200px]">{meal.description}</p>}
                      </div>
                      <div className="text-right ml-4">
                        <p className="text-sm font-semibold text-[#FD561E]">{formatPrice(meal.price)}</p>
                        <button className="text-xs text-gray-400 hover:text-[#FD561E] mt-1">Add</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {seatOptions.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                  <FaChair className="text-[#FD561E]" size={14} />
                  Seat Options ({seatOptions.length})
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {seatOptions.slice(0, 6).map((seat, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-[#FD561E]/5 transition-colors">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-800">{seat.name}</p>
                        {seat.description && <p className="text-xs text-gray-500 mt-0.5">{seat.description.substring(0, 50)}...</p>}
                      </div>
                      <div className="text-right ml-4">
                        <p className="text-sm font-semibold text-[#FD561E]">{formatPrice(seat.price)}</p>
                        <button className="text-xs text-gray-400 hover:text-[#FD561E] mt-1">Select</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {baggageOptions.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                  <FaSuitcase className="text-[#FD561E]" size={14} />
                  Extra Baggage ({baggageOptions.length})
                </h3>
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
                <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                  <FaBolt className="text-[#FD561E]" size={14} />
                  Other Services
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {otherServices.map((service, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-[#FD561E]/5 transition-colors">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-800">{service.name}</p>
                        {service.description && <p className="text-xs text-gray-500 mt-0.5">{service.description.substring(0, 80)}...</p>}
                      </div>
                      <div className="text-right ml-4">
                        <p className="text-sm font-semibold text-[#FD561E]">{formatPrice(service.price)}</p>
                        <button className="text-xs text-gray-400 hover:text-[#FD561E] mt-1">Add</button>
                      </div>
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
  
  // ============ RENDER FARE RULES ============
  const renderFareRules = () => {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <button
          onClick={() => toggleSection('fareRules')}
          className="w-full flex items-center justify-between p-5 hover:bg-[#FD561E]/5 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-50 rounded-xl flex items-center justify-center">
              <FaShieldAlt className="text-red-500" size={18} />
            </div>
            <div>
              <h2 className="font-semibold text-gray-800">Fare Rules & Policies</h2>
              <p className="text-xs text-gray-500">Cancellation, Changes & Refunds</p>
            </div>
          </div>
          {expandedSections.fareRules ? <FaChevronUp className="text-gray-400" /> : <FaChevronDown className="text-gray-400" />}
        </button>
        
        {expandedSections.fareRules && (
          <div className="p-5 border-t border-gray-100">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gradient-to-r from-blue-50 to-white rounded-xl p-5 border border-blue-100">
                <div className="flex items-center gap-2 mb-3">
                  <FaExchangeAlt className="text-blue-500" size={20} />
                  <h3 className="font-semibold text-gray-800">Date Change Policy</h3>
                </div>
                <p className="text-sm text-gray-600">
                  {penalties?.change?.amount 
                    ? `Change Fee: ${formatPrice(penalties.change.amount)} + fare difference`
                    : penalties?.change?.percentage 
                    ? `Change Fee: ${penalties.change.percentage}% of fare + fare difference`
                    : 'Free changes allowed'}
                </p>
              </div>
              
              <div className="bg-gradient-to-r from-red-50 to-white rounded-xl p-5 border border-red-100">
                <div className="flex items-center gap-2 mb-3">
                  <FaUndo className="text-red-500" size={20} />
                  <h3 className="font-semibold text-gray-800">Cancellation Policy</h3>
                </div>
                <p className="text-sm text-gray-600">
                  {penalties?.cancel?.amount 
                    ? `Cancellation Fee: ${formatPrice(penalties.cancel.amount)}`
                    : penalties?.cancel?.percentage 
                    ? `Cancellation Fee: ${penalties.cancel.percentage}% of fare`
                    : selectedFare?.refundable 
                      ? 'Refundable with applicable fees' 
                      : 'Non-refundable'}
                </p>
              </div>
            </div>
            
            {brandFeatures.length > 0 && (
              <div className="mt-4 bg-gray-50 rounded-xl p-4">
                <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                  <FaGift className="text-[#FD561E]" size={14} />
                  Included Benefits
                </h3>
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
  
  // ============ RENDER PRICE SUMMARY (STICKY) ============
  const renderPriceSummary = () => {
  const formValid = isFormValid();
  const hasAgeErrors = ageErrors.length > 0;
  
  let totalPrice = 0;
  
  if (passengerPricing && Object.keys(passengerPricing).length > 0) {
    passengerTypes.forEach(type => {
      const pricing = passengerPricing[type];
      const count = passengerCounts[type] || 0;
      if (count > 0 && pricing?.totalPrice) {
        totalPrice += pricing.totalPrice * count;
      }
    });
  } else {
    totalPrice = selectedFare?.totalPrice || 0;
  }
  
  // Calculate total with taxes
  const totalWithTaxes = totalPrice;
  
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-100 bg-gray-50/50">
        <h2 className="font-semibold text-gray-800 flex items-center gap-2">
          <FaRupeeSign className="text-[#FD561E]" size={16} />
          Price Summary
        </h2>
      </div>
      
      {/* Content */}
      <div className="p-4 space-y-4">
        {/* Fare Breakdown Section */}
        <div>
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
            Fare Breakdown
          </h3>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Base Fare</span>
              <span className="text-sm font-medium text-gray-800">
                {formatPrice(selectedFare?.basePrice || totalPrice)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Taxes & Fees</span>
              <span className="text-sm font-medium text-gray-800">
                {formatPrice(selectedFare?.taxes || 0)}
              </span>
            </div>
            <div className="pt-2 border-t border-gray-100">
              <div className="flex justify-between items-center">
                <span className="text-base font-bold text-gray-800">Total</span>
                <span className="text-xl font-bold text-[#FD561E]">
                  {formatPrice(totalWithTaxes)}
                </span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Passengers Section */}
        <div className="bg-gray-50 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-2">
            <FaUserFriends className="text-[#FD561E]" size={12} />
            <span className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Passengers</span>
          </div>
          <div className="space-y-1">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Adults (12+ years)</span>
              <span className="font-medium text-gray-800">{passengerCounts?.ADT || 1}</span>
            </div>
            {passengerCounts?.CNN > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Children (2-11 years)</span>
                <span className="font-medium text-gray-800">{passengerCounts.CNN}</span>
              </div>
            )}
            {passengerCounts?.INF > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Infants (0-2 years)</span>
                <span className="font-medium text-gray-800">{passengerCounts.INF}</span>
              </div>
            )}
          </div>
        </div>
        
        {/* Book Button */}
        <button 
          onClick={handleProceedToBooking} 
          disabled={!formValid || loading || hasAgeErrors} 
          className={`w-full py-2.5 rounded-lg font-medium flex items-center justify-center gap-2 transition-all ${
            formValid && !loading && !hasAgeErrors
              ? 'bg-[#FD561E] hover:bg-[#e04e1b] text-white shadow-sm' 
              : 'bg-gray-100 text-gray-400 cursor-not-allowed'
          }`}
        >
          {loading ? (
            <>
              <FaSpinner className="animate-spin" size={14} />
              <span>Loading...</span>
            </>
          ) : (
            <>
              <FaCreditCard size={14} /> 
              <span>{formValid && !hasAgeErrors ? 'Proceed to Book' : hasAgeErrors ? 'Fix Age Issues First' : 'Complete Details'}</span>
              <FaArrowRight size={12} />
            </>
          )}
        </button>
        
        {/* Security Badges */}
        <div className="flex items-center justify-center gap-3 text-xs text-gray-400">
          <FaCheckCircle className="text-emerald-500" size={10} />
          <span>Secure & Encrypted</span>
          <span className="w-px h-2 bg-gray-200"></span>
          <span>Price Guaranteed</span>
        </div>
      </div>
    </div>
  );
};
  
  // ============ RENDER AGE ERROR BOX ============
  const renderAgeErrorBox = () => {
    if (ageErrors.length === 0) return null;
    
    return (
      <div className="bg-red-50 border-l-4 border-red-500 rounded-xl p-4 mb-4">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0">
            <FaExclamationTriangle className="text-red-500 text-lg" />
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-semibold text-red-800 mb-2">Age Validation Errors</h3>
            <ul className="space-y-1">
              {ageErrors.map((error, idx) => (
                <li key={idx} className="text-sm text-red-700">
                  • {error.passengerName}: {error.message}
                </li>
              ))}
            </ul>
            <p className="text-xs text-red-600 mt-2">
              Please update the date of birth for the affected passenger(s) to continue.
            </p>
          </div>
        </div>
      </div>
    );
  };
  
  // ============ RENDER PASSENGER FORM ============
  const renderPassengerForm = () => {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <button
          onClick={() => toggleSection('passengerDetails')}
          className="w-full flex items-center justify-between p-5 hover:bg-[#FD561E]/5 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
              <FaUserFriends className="text-blue-500" size={18} />
            </div>
            <div>
              <h2 className="font-semibold text-gray-800">Passenger Details</h2>
              <p className="text-xs text-gray-500">{passengers.length} passenger(s)</p>
            </div>
          </div>
          {expandedSections.passengerDetails ? <FaChevronUp className="text-gray-400" /> : <FaChevronDown className="text-gray-400" />}
        </button>
        
        {expandedSections.passengerDetails && (
          <div className="p-5 border-t border-gray-100">
            {renderAgeErrorBox()}
            
            <div className="space-y-4">
              {passengers.map((passenger, idx) => (
                <div key={passenger.id} className="border border-gray-100 rounded-xl p-4 hover:shadow-md transition-all">
                  <div className="flex items-center gap-2 mb-4 pb-2 border-b border-gray-50">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      passenger.code === 'ADT' ? 'bg-blue-50' : passenger.code === 'CNN' ? 'bg-green-50' : 'bg-[#FD561E]/10'
                    }`}>
                      <FaUser className={passenger.code === 'ADT' ? 'text-blue-500' : passenger.code === 'CNN' ? 'text-green-500' : 'text-[#FD561E]'} size={12} />
                    </div>
                    <span className="font-medium text-gray-700 text-sm">{passenger.title}</span>
                    <span className="text-xs text-gray-400 ml-auto">Passenger {idx + 1}</span>
                  </div>
                )}
              </SCard>
            )}

            {/* Inbound segments */}
            {isRoundTrip && inboundSegs.length > 0 && (
              <SCard>
                <STitle icon={FaPlaneArrival} iconBg="bg-green-50" title="Return Flight"
                  subtitle={`${selectedInbound?.from ?? ''} → ${selectedInbound?.to ?? ''}`}
                  sectionKey="inbound" expanded={expanded.inbound} onToggle={toggleSection} />
                {expanded.inbound && (
                  <div className="border-t border-gray-100 p-5">
                    <FlightLeg segments={inboundSegs} legLabel={`${selectedInbound?.from ?? ''} → ${selectedInbound?.to ?? ''}`} isReturn />
                  </div>
                )}
              </SCard>
            )}

            {/* Fare options */}
            {fareOptions.length > 0 && (
              <SCard>
                <STitle icon={FaTag} iconBg="bg-purple-50" title="Select Your Fare"
                  subtitle="Tap a fare to select it · All prices include taxes"
                  sectionKey="fares" expanded={expanded.fares} onToggle={toggleSection}
                  badge={`${fareOptions.length} options`} />
                {expanded.fares && (
                  <div className="border-t border-gray-100 p-5 space-y-4">
                    {fareOptions.map((fare, idx) => (
                      <FareCard key={idx} fare={fare} idx={idx}
                        isSelected={idx === selectedFareIndex}
                        cheapestIdx={pricingResult?.cheapestFareIndex ?? 0}
                        onSelect={(i) => { setSelectedFareIndex(i); toast.success(`${fareOptions[i].brandName} selected`); }}
                      />
                    ))}
                  </div>
                )}
              </SCard>
            )}

            {/* Passengers */}
            <SCard>
              <STitle icon={FaUser} iconBg="bg-blue-50" title="Passenger Details"
                subtitle={`${passengers.length} passenger${passengers.length > 1 ? 's' : ''} · Fill as per government ID`}
                sectionKey="passengers" expanded={expanded.passengers} onToggle={toggleSection} />
              {expanded.passengers && (
                <div className="border-t border-gray-100">
                  {passengers.map((pax, idx) => {
                    const clr  = PAX_COLORS[pax.type] || PAX_COLORS.ADT;
                    const done = pax.firstName && pax.lastName && pax.dob && pax.gender;
                    return (
                      <div key={pax.id} className={idx < passengers.length - 1 ? 'border-b border-gray-100' : ''}>
                        <div className="px-5 py-3 flex items-center justify-between border-b border-gray-100 bg-gray-50">
                          <div className="flex items-center gap-2">
                            <span className={`text-xs font-black px-2.5 py-1 rounded-full border ${clr}`}>{pax.label} {idx + 1}</span>
                            {pax.type !== 'ADT' && <span className="text-[11px] text-gray-400">{pax.type === 'CNN' ? '(Age 2–11)' : '(Under 2 yrs)'}</span>}
                          </div>
                          {done ? <FaCheckCircle className="text-green-500" size={15} /> : <span className="text-[10px] text-amber-500 font-semibold">Incomplete</span>}
                        </div>
                        <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {/* First Name */}
                          <div>
                            <label className="block text-xs font-black text-gray-600 mb-1.5 uppercase tracking-wide">First Name *</label>
                            <input type="text" value={pax.firstName}
                              onChange={(e) => updatePassenger(idx, 'firstName', e.target.value.toUpperCase())}
                              placeholder="As on passport / ID"
                              className={`w-full px-4 py-3 text-sm border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FD561E]/25 focus:border-[#FD561E] transition-all font-semibold uppercase ${errors[`p${idx}_fn`] ? 'border-red-400 bg-red-50' : 'border-gray-200 bg-white'}`} />
                            {errors[`p${idx}_fn`] && <p className="text-xs text-red-500 mt-1">{errors[`p${idx}_fn`]}</p>}
                          </div>
                          {/* Last Name */}
                          <div>
                            <label className="block text-xs font-black text-gray-600 mb-1.5 uppercase tracking-wide">Last Name *</label>
                            <input type="text" value={pax.lastName}
                              onChange={(e) => updatePassenger(idx, 'lastName', e.target.value.toUpperCase())}
                              placeholder="As on passport / ID"
                              className={`w-full px-4 py-3 text-sm border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FD561E]/25 focus:border-[#FD561E] transition-all font-semibold uppercase ${errors[`p${idx}_ln`] ? 'border-red-400 bg-red-50' : 'border-gray-200 bg-white'}`} />
                            {errors[`p${idx}_ln`] && <p className="text-xs text-red-500 mt-1">{errors[`p${idx}_ln`]}</p>}
                          </div>
                          {/* DOB */}
                          <div>
                            <label className="block text-xs font-black text-gray-600 mb-1.5 uppercase tracking-wide">Date of Birth *</label>
                            <input type="date" value={pax.dob}
                              onChange={(e) => updatePassenger(idx, 'dob', e.target.value)}
                              max={new Date().toISOString().split('T')[0]}
                              className={`w-full px-4 py-3 text-sm border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FD561E]/25 focus:border-[#FD561E] transition-all ${errors[`p${idx}_dob`] ? 'border-red-400 bg-red-50' : 'border-gray-200 bg-white'}`} />
                            {errors[`p${idx}_dob`] && <p className="text-xs text-red-500 mt-1">{errors[`p${idx}_dob`]}</p>}
                          </div>
                          {/* Gender */}
                          <div>
                            <label className="block text-xs font-black text-gray-600 mb-1.5 uppercase tracking-wide">Gender *</label>
                            <div className="flex gap-2">
                              {[['M','Male'],['F','Female']].map(([val, label]) => (
                                <button key={val} type="button" onClick={() => updatePassenger(idx, 'gender', val)}
                                  className={`flex-1 py-3 text-sm rounded-xl border font-black transition-all ${pax.gender === val ? 'bg-[#FD561E] border-[#FD561E] text-white shadow-md' : 'border-gray-200 text-gray-600 hover:border-orange-300'}`}>
                                  {label}
                                </button>
                              ))}
                            </div>
                            {errors[`p${idx}_gender`] && <p className="text-xs text-red-500 mt-1">{errors[`p${idx}_gender`]}</p>}
                          </div>
                          {/* Nationality (ADT only) */}
                          {pax.type === 'ADT' && (
                            <div className="sm:col-span-2">
                              <label className="block text-xs font-black text-gray-600 mb-1.5 uppercase tracking-wide">Nationality</label>
                              <select value={pax.nationality} onChange={(e) => updatePassenger(idx, 'nationality', e.target.value)}
                                className="w-full px-4 py-3 text-sm border border-gray-200 bg-white rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FD561E]/25 focus:border-[#FD561E]">
                                {[['IN','India (IN)'],['US','United States (US)'],['GB','United Kingdom (GB)'],['AE','UAE (AE)'],['SG','Singapore (SG)'],['CA','Canada (CA)'],['AU','Australia (AU)']].map(([v,l]) => (
                                  <option key={v} value={v}>{l}</option>
                                ))}
                              </select>
                            </div>
                          )}
                        </div>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1">Last Name *</label>
                      <input 
                        type="text" 
                        value={passenger.lastName} 
                        onChange={(e) => updatePassenger(idx, 'lastName', e.target.value)} 
                        className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FD561E]/20 focus:border-[#FD561E] ${
                          errors[`passenger_${idx}_lastName`] ? 'border-red-400' : 'border-gray-200'
                        }`} 
                        placeholder="Last name" 
                      />
                    </div>
                    
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1">
                        Date of Birth * 
                        {passenger.code === 'ADT' && <span className="text-gray-400 ml-1">(Any age)</span>}
                        {passenger.code === 'CNN' && <span className="text-gray-400 ml-1">(2-11 years)</span>}
                        {passenger.code === 'INF' && <span className="text-gray-400 ml-1">(Under 2 years)</span>}
                      </label>
                      <input 
                        type="date" 
                        value={passenger.dob} 
                        onChange={(e) => updatePassenger(idx, 'dob', e.target.value)} 
                        className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FD561E]/20 focus:border-[#FD561E] ${
                          errors[`passenger_${idx}_dob`] ? 'border-red-400' : 'border-gray-200'
                        }`} 
                      />
                    </div>
                    
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1">Gender *</label>
                      <div className="flex gap-4">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input 
                            type="radio" 
                            name={`gender_${idx}`} 
                            value="M" 
                            checked={passenger.gender === 'M'} 
                            onChange={(e) => updatePassenger(idx, 'gender', e.target.value)} 
                            className="w-3.5 h-3.5 text-[#FD561E]" 
                          />
                          <span className="text-sm text-gray-600">Male</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input 
                            type="radio" 
                            name={`gender_${idx}`} 
                            value="F" 
                            checked={passenger.gender === 'F'} 
                            onChange={(e) => updatePassenger(idx, 'gender', e.target.value)} 
                            className="w-3.5 h-3.5 text-[#FD561E]" 
                          />
                          <span className="text-sm text-gray-600">Female</span>
                        </label>
                      </div>
                    );
                  })}
                </div>
              )}
            </SCard>

            {/* Contact */}
            <SCard>
              <STitle icon={FaPhone} iconBg="bg-emerald-50" title="Contact Information"
                subtitle="Booking confirmation sent here"
                sectionKey="contact" expanded={expanded.contact} onToggle={toggleSection} />
              {expanded.contact && (
                <div className="border-t border-gray-100 p-5 space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-black text-gray-600 mb-1.5 uppercase tracking-wide">Email Address *</label>
                      <div className="relative">
                        <FaEnvelope className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={13} />
                        <input type="email" value={contactInfo.email} onChange={(e) => updateContact('email', e.target.value)}
                          placeholder="name@email.com"
                          className={`w-full pl-11 pr-4 py-3 text-sm border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FD561E]/25 focus:border-[#FD561E] transition-all ${errors.email ? 'border-red-400 bg-red-50' : 'border-gray-200 bg-white'}`} />
                      </div>
                      {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
                    </div>
                    <div>
                      <label className="block text-xs font-black text-gray-600 mb-1.5 uppercase tracking-wide">Phone Number *</label>
                      <div className="flex gap-2">
                        <select value={contactInfo.phone.countryCode} onChange={(e) => updateContact('phone.countryCode', e.target.value)}
                          className="w-24 px-2 py-3 text-sm border border-gray-200 bg-white rounded-xl focus:outline-none">
                          {[['+91','91'],['+1','1'],['+44','44'],['+971','971']].map(([l,v]) => <option key={v} value={v}>{l}</option>)}
                        </select>
                        <div className="flex-1 relative">
                          <FaPhone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={12} />
                          <input type="tel" value={contactInfo.phone.number}
                            onChange={(e) => updateContact('phone.number', e.target.value.replace(/\D/g,''))}
                            placeholder="9876543210" maxLength={10}
                            className={`w-full pl-11 pr-4 py-3 text-sm border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FD561E]/25 focus:border-[#FD561E] transition-all ${errors.phone ? 'border-red-400 bg-red-50' : 'border-gray-200 bg-white'}`} />
                        </div>
                      </div>
                      {errors.phone && <p className="text-xs text-red-500 mt-1">{errors.phone}</p>}
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-gray-100">
                    {[{k:'street',l:'Street Address',p:'123 Main Street',c:2},{k:'city',l:'City',p:'Mumbai',c:1},{k:'state',l:'State',p:'Maharashtra',c:1},{k:'postalCode',l:'Postal Code',p:'400001',c:1}].map(({k,l,p,c}) => (
                      <div key={k} className={c===2?'sm:col-span-2':''}>
                        <label className="block text-xs font-black text-gray-600 mb-1.5 uppercase tracking-wide">{l}</label>
                        <input type="text" value={contactInfo.address[k]} onChange={(e) => updateContact(`address.${k}`, e.target.value)}
                          placeholder={p} className="w-full px-4 py-3 text-sm border border-gray-200 bg-white rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FD561E]/25 focus:border-[#FD561E] transition-all" />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </SCard>

            {/* GST */}
            <SCard>
              <div className="flex items-center justify-between px-5 py-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center flex-shrink-0">
                    <FaFileInvoice className="text-indigo-500" size={17} />
                  </div>
                  <div>
                    <div className="font-semibold text-gray-800 text-sm">GST Details</div>
                    <div className="text-xs text-gray-400">Optional · For business travellers</div>
                  </div>
                </div>
                <button onClick={() => setShowGst(p => !p)}
                  className={`text-xs font-bold px-3.5 py-2 rounded-xl border transition-all ${showGst ? 'border-red-200 text-red-600 bg-red-50' : 'border-gray-200 text-gray-600 bg-white hover:border-gray-300'}`}>
                  {showGst ? 'Remove' : '+ Add GST'}
                </button>
              </div>
              {showGst && (
                <div className="border-t border-gray-100 p-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[{k:'gstn',l:'GSTIN *',p:'36AACCH5485M1Z2',c:2},{k:'gsta',l:'Company Name',p:'Acme Pvt Ltd',c:2},{k:'gstp',l:'GST Phone',p:'9999999999',c:1},{k:'gste',l:'GST Email',p:'gst@company.com',c:1}].map(({k,l,p,c}) => (
                    <div key={k} className={c===2?'sm:col-span-2':''}>
                      <label className="block text-xs font-black text-gray-600 mb-1.5 uppercase tracking-wide">{l}</label>
                      <input type="text" value={gstData[k]} onChange={(e) => setGstData(prev => ({...prev, [k]: e.target.value}))}
                        placeholder={p} className="w-full px-4 py-3 text-sm border border-gray-200 bg-white rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FD561E]/25 focus:border-[#FD561E] transition-all" />
                    </div>
                  ))}
                </div>
              )}
            </SCard>

            {/* Mobile CTA */}
            <div className="lg:hidden space-y-3">
              {selectedFare && (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <div className="text-xs text-gray-500">{selectedFare.brandName} · {selectedFare.cabin}</div>
                      <div className="text-[10px] text-gray-400">{paxSummary}</div>
                    </div>
                    <div className="text-3xl font-black text-[#FD561E]">{fmt.money(selectedFare.grandTotal)}</div>
                  </div>
                </div>
              )}
              <button onClick={handleConfirm} disabled={pnrLoading || !selectedFare || !isFormValid()}
                className="w-full py-4 bg-[#FD561E] hover:bg-[#e04e1b] active:scale-[0.98] text-white font-black text-base rounded-2xl shadow-lg shadow-orange-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all">
                {pnrLoading
                  ? <><FaSpinner className="animate-spin" size={16} /> Processing...</>
                  : <>Confirm &amp; Proceed {selectedFare ? fmt.money(selectedFare.grandTotal) : ''} <FaArrowRight size={14} /></>}
              </button>
            </div>

          </div>{/* end left col */}

          {/* RIGHT */}
          <div className="hidden lg:block w-80 flex-shrink-0">
            <div className="sticky top-20 space-y-4">
              <PriceSidebar
                selectedFare={selectedFare} isRoundTrip={isRoundTrip}
                outbound={selectedOutbound} inbound={selectedInbound}
                onConfirm={handleConfirm} loading={pnrLoading}
                disabled={!selectedFare || !isFormValid()}
              />
              <div className="bg-white rounded-2xl border border-gray-100 p-4 space-y-3">
                {[
                  { icon: FaShieldAlt,   text: 'Secure 256-bit SSL encryption',    color: 'text-green-500',  bg: 'bg-green-50'  },
                  { icon: FaCheckCircle, text: 'Instant booking confirmation',      color: 'text-blue-500',   bg: 'bg-blue-50'   },
                  { icon: FaTicketAlt,   text: 'E-ticket sent to your email',       color: 'text-purple-500', bg: 'bg-purple-50' },
                  { icon: FaInfoCircle,  text: 'IATA certified travel platform',    color: 'text-orange-500', bg: 'bg-orange-50' },
                ].map(({ icon: Icon, text, color, bg }) => (
                  <div key={text} className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-xl ${bg} flex items-center justify-center flex-shrink-0`}><Icon className={color} size={13} /></div>
                    <span className="text-xs text-gray-500 font-medium">{text}</span>
                  </div>
                ))}
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
  
  // ============ RENDER CONTACT FORM ============
  const renderContactForm = () => {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <button
          onClick={() => toggleSection('contactInfo')}
          className="w-full flex items-center justify-between p-5 hover:bg-[#FD561E]/5 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center">
              <FaPhone className="text-emerald-500" size={18} />
            </div>
            <div>
              <h2 className="font-semibold text-gray-800">Contact Information</h2>
            </div>
          </div>
          {expandedSections.contactInfo ? <FaChevronUp className="text-gray-400" /> : <FaChevronDown className="text-gray-400" />}
        </button>
        
        {expandedSections.contactInfo && (
          <div className="p-5 border-t border-gray-100">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Email Address *</label>
                <div className="relative">
                  <FaEnvelope className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={14} />
                  <input 
                    type="email" 
                    value={contactInfo.email} 
                    onChange={(e) => setContactInfo({ ...contactInfo, email: e.target.value })} 
                    className={`w-full pl-9 pr-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FD561E]/20 focus:border-[#FD561E] ${
                      errors.email ? 'border-red-400' : 'border-gray-200'
                    }`} 
                    placeholder="Enter email address" 
                  />
                </div>
                {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Phone Number *</label>
                <div className="flex gap-3">
                  <select 
                    value={contactInfo.phone.countryCode} 
                    onChange={(e) => setContactInfo({ ...contactInfo, phone: { ...contactInfo.phone, countryCode: e.target.value } })} 
                    className="w-24 px-2 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FD561E]/20"
                  >
                    <option value="91">+91 (IN)</option>
                    <option value="1">+1 (US)</option>
                    <option value="44">+44 (UK)</option>
                    <option value="971">+971 (AE)</option>
                  </select>
                  <div className="flex-1 relative">
                    <FaPhone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={14} />
                    <input 
                      type="tel" 
                      value={contactInfo.phone.number} 
                      onChange={(e) => setContactInfo({ ...contactInfo, phone: { ...contactInfo.phone, number: e.target.value } })} 
                      className={`w-full pl-9 pr-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FD561E]/20 ${
                        errors.phone ? 'border-red-400' : 'border-gray-200'
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
        )}
      </div>
    );
  };
  
  // ============ MAIN RENDER ============
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
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FaInfoCircle className="text-4xl text-red-500" />
          </div>
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
          <div className="w-20 h-20 bg-[#FD561E]/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <FaInfoCircle className="text-4xl text-[#FD561E]" />
          </div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">No booking data found</h2>
          <p className="text-sm text-gray-500 mb-4">Please search for flights again</p>
          <button onClick={() => navigate('/flights')} className="bg-[#FD561E] text-white px-6 py-3 rounded-lg w-full hover:bg-[#e04e1b] transition-colors">Go to Search</button>
        </div>
      </div>
    );
  }
  
return (
  <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
    <div className="container mx-auto px-4 py-6">
      <div className="flex flex-col lg:flex-row lg:items-start gap-6">
        {/* LEFT COLUMN - scrolls with the page */}
        <div className="lg:w-2/3 space-y-5">
          {renderFlightDetails()}
          {tripType === 'round-trip' && renderReturnFlightDetails()}
          {renderAllFares()}
          {renderTaxDetails()}
          {renderOptionalServices()}
          {renderFareRules()}
          {renderPassengerForm()}
          {renderContactForm()}
        </div>

        {/* RIGHT COLUMN - sticks to viewport while page scrolls */}
        <div className="lg:w-1/3 pt-4" style={{ position: 'sticky', top: '20px', alignSelf: 'flex-start' }}>
          {renderPriceSummary()}
        </div>
      </div>
    </div>
  </div>
);
};

export default BookingReviewPage;