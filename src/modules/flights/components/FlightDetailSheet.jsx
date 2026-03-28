// src/modules/flights/components/FlightDetailSheet.jsx

import React, { useState } from 'react';
import { 
  FaTimes, 
  FaClock, 
  FaMapMarkerAlt, 
  FaCalendarAlt, 
  FaSuitcase, 
  FaUserFriends,
  FaPlane,
  FaInfoCircle,
  FaChevronDown,
  FaChevronUp,
  FaUtensils,
  FaChair,
  FaExchangeAlt,
  FaShieldAlt,
  FaCrown,
  FaTag,
  FaRupeeSign,
  FaPercent
} from 'react-icons/fa';

const FlightDetailSheet = ({ flight, fare, onClose, passengerCounts }) => {
  const [expandedSections, setExpandedSections] = useState({
    cancellation: false,
    change: false,
    fareDetails: true
  });

  if (!flight) return null;

  // Toggle section expansion
  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  // ============ DATA PARSING ============

  // Basic flight info
  const airlineCode = flight.airlineCode || flight.airline;
  const airlineName = getAirlineName(airlineCode);
  const flightNumber = flight.flightNumber || `${airlineCode}-${flight.flightNum}`;
  
  // Times
  const departureTime = formatTime(flight.departureTime);
  const arrivalTime = formatTime(flight.arrivalTime);
  const departureDate = formatDate(flight.departureTime);
  const duration = formatDuration(flight.duration);
  
  // Route
  const origin = flight.from || flight.origin;
  const destination = flight.to || flight.destination;
  
  // Aircraft & Terminal
  const aircraft = flight.aircraft || flight.equipment || 'Airbus A320';
  const terminal = flight.terminal || flight.originTerminal || '—';
  
  // Pricing
  const totalPrice = flight.price || 0;
  const basePrice = flight.basePrice ? parsePrice(flight.basePrice) : Math.round(totalPrice * 0.85);
  const taxes = flight.taxes || [];
  const totalTax = taxes.reduce((sum, tax) => sum + (tax.amount || 0), 0) || (totalPrice - basePrice);
  
  // Baggage
  const baggage = flight.baggage || { weight: '15', unit: 'kg' };
  
  // Brand/Fare Family
  const brand = flight.brand || { name: 'Economy' };
  const brandName = brand.name || 'Economy';
  const isPremium = brandName.toLowerCase().includes('flexi') || 
                    brandName.toLowerCase().includes('plus') || 
                    brandName.toLowerCase().includes('upfront') ||
                    brandName.toLowerCase().includes('stretch');
  
  // Seats
  const seatsAvailable = flight.seatsAvailable || 9;
  
  // Passenger counts
  const adults = passengerCounts?.adults || 1;
  const children = passengerCounts?.children || 0;
  const infants = passengerCounts?.infants || 0;
  
  // Policies
  const cancellationPolicy = getCancellationPolicy(brandName);
  const changePolicy = getChangePolicy(brandName);
  
  // Fare features
  const features = getFareFeatures(brandName, baggage);

  // ============ HELPER FUNCTIONS ============

  function formatTime(isoString) {
    if (!isoString) return '--:--';
    try {
      const date = new Date(isoString);
      return date.toLocaleTimeString('en-IN', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      });
    } catch {
      return '--:--';
    }
  }

  function formatDate(isoString) {
    if (!isoString) return '';
    try {
      const date = new Date(isoString);
      return date.toLocaleDateString('en-IN', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      });
    } catch {
      return '';
    }
  }

  function formatDuration(minutes) {
    if (!minutes) return '0h 0m';
    const mins = parseInt(minutes);
    const hours = Math.floor(mins / 60);
    const remainingMins = mins % 60;
    return `${hours}h ${remainingMins}m`;
  }

  function getAirlineName(code) {
    const airlines = {
      'AI': 'Air India',
      '6E': 'IndiGo',
      'SG': 'SpiceJet',
      'UK': 'Vistara',
      'G8': 'GoAir',
      'I5': 'AirAsia India',
      '9W': 'Jet Airways',
      'S2': 'Air India Express',
      'QP': 'Akasa Air'
    };
    return airlines[code] || code || 'Unknown';
  }

  function parsePrice(priceString) {
    if (!priceString) return 0;
    const match = priceString.toString().match(/\d+/);
    return match ? parseInt(match[0]) : 0;
  }

  function getCancellationPolicy(brandName) {
    const name = brandName.toLowerCase();
    
    if (name.includes('flexi')) {
      return [
        { period: 'Before 4 days', fee: 'No fee', note: 'Full refund' },
        { period: '0-3 days', fee: 'Up to ₹3,000', note: 'Per passenger' },
        { period: 'No-show', fee: '100% charge', note: 'No refund' }
      ];
    }
    if (name.includes('upfront')) {
      return [
        { period: 'Before 72 hours', fee: 'No fee', note: 'Full refund' },
        { period: 'Within 72 hours', fee: '₹299', note: 'Per passenger' },
        { period: 'No-show', fee: 'Full fare', note: 'No refund' }
      ];
    }
    // Default economy
    return [
      { period: 'Before 24 hours', fee: '₹2,500 + fare diff', note: 'Per passenger' },
      { period: 'Within 24 hours', fee: 'Non-refundable', note: 'No refund' },
      { period: 'No-show', fee: '100% charge', note: 'No refund' }
    ];
  }

  function getChangePolicy(brandName) {
    const name = brandName.toLowerCase();
    
    if (name.includes('flexi')) {
      return [
        { period: 'Before 4 days', fee: 'No fee', note: 'Free change' },
        { period: '0-3 days', fee: 'Up to ₹3,000', note: '+ fare diff' },
        { period: 'Same day', fee: 'Not permitted', note: 'No changes' }
      ];
    }
    if (name.includes('upfront')) {
      return [
        { period: 'Before 72 hours', fee: 'No fee', note: 'Free change' },
        { period: 'Within 72 hours', fee: '₹299', note: '+ fare diff' },
        { period: 'Same day', fee: '₹999', note: '+ fare diff' }
      ];
    }
    // Default economy
    return [
      { period: 'Before 24 hours', fee: '₹1,500 + fare diff', note: 'Change fee applies' },
      { period: 'Within 24 hours', fee: 'Not permitted', note: 'No changes' },
      { period: 'Same day', fee: 'Not permitted', note: 'No changes' }
    ];
  }

  function getFareFeatures(brandName, baggage) {
    const name = brandName.toLowerCase();
    const features = [];

    // Baggage (always present)
    features.push({
      icon: <FaSuitcase className="text-[#FD561E]" />,
      title: 'Check-in Baggage',
      value: `${baggage?.weight || '15'}${baggage?.unit || 'kg'}`,
      included: true
    });
    
    features.push({
      icon: <FaSuitcase className="text-[#FD561E]" />,
      title: 'Cabin Baggage',
      value: '7kg',
      included: true
    });

    // Premium features
    if (name.includes('flexi')) {
      features.push({
        icon: <FaUtensils className="text-[#FD561E]" />,
        title: 'Meals',
        value: 'Complimentary',
        included: true
      });
      features.push({
        icon: <FaChair className="text-[#FD561E]" />,
        title: 'Seat Selection',
        value: 'Free',
        included: true
      });
      features.push({
        icon: <FaExchangeAlt className="text-[#FD561E]" />,
        title: 'Date Changes',
        value: 'Free',
        included: true
      });
    } else if (name.includes('upfront')) {
      features.push({
        icon: <FaCrown className="text-[#FD561E]" />,
        title: 'Extra Legroom',
        value: 'Front Row',
        included: true
      });
      features.push({
        icon: <FaUtensils className="text-[#FD561E]" />,
        title: 'Snack Combo',
        value: 'Free',
        included: true
      });
    } else if (name.includes('stretch')) {
      features.push({
        icon: <FaCrown className="text-[#FD561E]" />,
        title: 'Extra Legroom',
        value: 'Premium',
        included: true
      });
      features.push({
        icon: <FaUtensils className="text-[#FD561E]" />,
        title: 'Premium Meals',
        value: 'Complimentary',
        included: true
      });
    } else {
      // Economy - show what's NOT included
      features.push({
        icon: <FaUtensils className="text-gray-400" />,
        title: 'Meals',
        value: 'Chargeable',
        included: false
      });
      features.push({
        icon: <FaChair className="text-gray-400" />,
        title: 'Seat Selection',
        value: 'Chargeable',
        included: false
      });
    }

    return features;
  }

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity"
        onClick={onClose}
      />
      
      {/* Sheet */}
      <div className="fixed inset-y-0 right-0 w-full max-w-2xl bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out overflow-y-auto">
        
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex justify-between items-center z-10">
          <div className="flex items-center">
            <FaPlane className="text-[#FD561E] mr-2" />
            <h2 className="text-xl font-bold text-gray-800">Flight Details</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <FaTimes className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          
          {/* ===== AIRLINE & FLIGHT INFO ===== */}
          <div className="bg-gradient-to-r from-orange-50 to-amber-50 rounded-xl p-4">
            <div className="flex justify-between items-start">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-bold text-gray-900">{airlineName}</span>
                  <span className="text-sm px-2 py-1 bg-white rounded-full text-[#FD561E] font-medium">
                    {airlineCode}
                  </span>
                </div>
                <p className="text-gray-600 mt-1">{flightNumber}</p>
              </div>
              {isPremium && (
                <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-medium">
                  ⭐ Premium Fare
                </span>
              )}
            </div>
            
            <div className="grid grid-cols-2 gap-4 mt-3 text-sm">
              <div className="flex items-center text-gray-600">
                <FaPlane className="mr-2 text-[#FD561E] text-xs" />
                <span>Aircraft: {aircraft}</span>
              </div>
              <div className="flex items-center text-gray-600">
                <FaMapMarkerAlt className="mr-2 text-[#FD561E] text-xs" />
                <span>Terminal: {terminal}</span>
              </div>
            </div>
          </div>

          {/* ===== ROUTE VISUALIZATION ===== */}
          <div className="bg-gray-50 rounded-xl p-6">
            <div className="flex items-center justify-between">
              {/* Departure */}
              <div className="text-center flex-1">
                <div className="text-3xl font-bold text-gray-900">{departureTime}</div>
                <div className="text-sm text-gray-600 mt-1">
                  <span className="font-medium">{origin}</span>
                </div>
              </div>

              {/* Duration Line */}
              <div className="flex-2 px-8 text-center">
                <div className="text-sm text-gray-600 mb-2 flex items-center justify-center">
                  <FaClock className="mr-1 text-gray-400" />
                  {duration}
                </div>
                <div className="relative">
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-[#FD561E] rounded-full"></div>
                    <div className="flex-1 h-0.5 bg-gray-300 mx-2"></div>
                    <div className="w-2 h-2 bg-[#FD561E] rounded-full"></div>
                  </div>
                </div>
                <div className="text-xs text-gray-500 mt-2">
                  {flight.stops === 0 ? 'Direct' : `${flight.stops} stop${flight.stops > 1 ? 's' : ''}`}
                </div>
              </div>

              {/* Arrival */}
              <div className="text-center flex-1">
                <div className="text-3xl font-bold text-gray-900">{arrivalTime}</div>
                <div className="text-sm text-gray-600 mt-1">
                  <span className="font-medium">{destination}</span>
                </div>
              </div>
            </div>

            {/* Date */}
            <div className="mt-4 pt-4 border-t border-gray-200 flex items-center justify-center gap-2">
              <FaCalendarAlt className="text-[#FD561E]" />
              <span className="text-gray-700 font-medium">{departureDate}</span>
            </div>
          </div>

          {/* ===== PASSENGER INFO ===== */}
          <div className="bg-blue-50 rounded-xl p-4">
            <h3 className="font-semibold text-gray-800 mb-2 flex items-center">
              <FaUserFriends className="mr-2 text-blue-500" />
              Passenger Details
            </h3>
            <p className="text-gray-700">
              {adults} Adult{adults > 1 ? 's' : ''}
              {children > 0 && `, ${children} Child${children > 1 ? 'ren' : ''}`}
              {infants > 0 && `, ${infants} Infant${infants > 1 ? 's' : ''}`}
            </p>
            <p className="text-sm text-gray-500 mt-1">
              Total price includes all passengers
            </p>
          </div>

          {/* ===== FARE BREAKDOWN ===== */}
          <div className="bg-white border border-gray-200 rounded-xl p-4">
            <h3 className="font-semibold text-gray-800 mb-3 flex items-center">
              <FaRupeeSign className="mr-2 text-[#FD561E]" />
              Fare Breakdown
            </h3>
            
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Base Fare</span>
                <span className="font-medium text-gray-800">₹{basePrice.toLocaleString()}</span>
              </div>
              
              {taxes.length > 0 ? taxes.map((tax, idx) => (
                <div key={idx} className="flex justify-between">
                  <span className="text-gray-600">{getTaxDescription(tax.category)}</span>
                  <span className="font-medium text-gray-800">₹{tax.amount.toLocaleString()}</span>
                </div>
              )) : (
                <div className="flex justify-between">
                  <span className="text-gray-600">Taxes & Surcharges</span>
                  <span className="font-medium text-gray-800">₹{totalTax.toLocaleString()}</span>
                </div>
              )}
              
              <div className="border-t border-gray-200 my-2 pt-2">
                <div className="flex justify-between font-bold">
                  <span className="text-gray-800">Total</span>
                  <span className="text-[#FD561E] text-lg">₹{totalPrice.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>

          {/* ===== BAGGAGE ALLOWANCE ===== */}
          <div className="bg-green-50 rounded-xl p-4">
            <h3 className="font-semibold text-gray-800 mb-3 flex items-center">
              <FaSuitcase className="mr-2 text-green-600" />
              Baggage Allowance
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white rounded-lg p-3 text-center">
                <div className="text-sm text-gray-500">Check-in</div>
                <div className="text-xl font-bold text-gray-800">{baggage.weight}{baggage.unit}</div>
              </div>
              <div className="bg-white rounded-lg p-3 text-center">
                <div className="text-sm text-gray-500">Cabin</div>
                <div className="text-xl font-bold text-gray-800">7kg</div>
              </div>
            </div>
          </div>

          {/* ===== FARE FAMILY & FEATURES ===== */}
          <div className="bg-purple-50 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold text-gray-800 flex items-center">
                <FaTag className="mr-2 text-purple-600" />
                Fare Family: {brandName}
              </h3>
              {isPremium && (
                <span className="bg-purple-200 text-purple-700 text-xs px-2 py-1 rounded-full">
                  Premium
                </span>
              )}
            </div>
            
            {brand.description && (
              <p className="text-sm text-gray-600 mb-3">{brand.description}</p>
            )}
            
            <div className="grid grid-cols-2 gap-3 mt-3">
              {features.map((feature, idx) => (
                <div key={idx} className="flex items-center gap-2 text-sm">
                  {feature.icon}
                  <div>
                    <div className="text-gray-600">{feature.title}</div>
                    <div className={`font-medium ${feature.included ? 'text-green-600' : 'text-gray-400'}`}>
                      {feature.value}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ===== CANCELLATION POLICY ===== */}
          <div className="border border-gray-200 rounded-xl overflow-hidden">
            <button
              className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 transition-colors"
              onClick={() => toggleSection('cancellation')}
            >
              <span className="font-semibold text-gray-800 flex items-center">
                <FaShieldAlt className="mr-2 text-red-500" />
                Cancellation Policy
              </span>
              {expandedSections.cancellation ? <FaChevronUp /> : <FaChevronDown />}
            </button>
            
            {expandedSections.cancellation && (
              <div className="p-4 bg-white">
                <div className="space-y-2">
                  {cancellationPolicy.map((item, idx) => (
                    <div key={idx} className="flex justify-between text-sm">
                      <span className="text-gray-600">{item.period}:</span>
                      <div className="text-right">
                        <span className="font-medium text-gray-800">{item.fee}</span>
                        {item.note && <span className="text-xs text-gray-500 block">{item.note}</span>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* ===== DATE CHANGE POLICY ===== */}
          <div className="border border-gray-200 rounded-xl overflow-hidden">
            <button
              className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 transition-colors"
              onClick={() => toggleSection('change')}
            >
              <span className="font-semibold text-gray-800 flex items-center">
                <FaExchangeAlt className="mr-2 text-blue-500" />
                Date Change Policy
              </span>
              {expandedSections.change ? <FaChevronUp /> : <FaChevronDown />}
            </button>
            
            {expandedSections.change && (
              <div className="p-4 bg-white">
                <div className="space-y-2">
                  {changePolicy.map((item, idx) => (
                    <div key={idx} className="flex justify-between text-sm">
                      <span className="text-gray-600">{item.period}:</span>
                      <div className="text-right">
                        <span className="font-medium text-gray-800">{item.fee}</span>
                        {item.note && <span className="text-xs text-gray-500 block">{item.note}</span>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* ===== SEATS AVAILABLE ===== */}
          <div className="bg-gray-100 rounded-xl p-4 flex items-center justify-between">
            <span className="text-gray-700 flex items-center">
              <FaInfoCircle className="mr-2 text-[#FD561E]" />
              Seats Available
            </span>
            <span className="font-bold text-[#FD561E] text-lg">{seatsAvailable} seats</span>
          </div>

          {/* ===== BOOK BUTTON ===== */}
          <button
            className="w-full bg-[#FD561E] hover:bg-[#e04e1b] text-white font-bold py-4 px-6 rounded-xl transition-colors shadow-md hover:shadow-lg"
            onClick={() => {
              alert('Booking flow to be implemented');
              onClose();
            }}
          >
            Continue to Book
          </button>

          <p className="text-xs text-gray-500 text-center">
            By continuing, you agree to our Terms of Service
          </p>
        </div>
      </div>
    </>
  );
};

export default FlightDetailSheet;