// src/modules/flights/components/sheet/FlightDetailSheet.jsx
import React, { useState } from 'react';
import { 
  FaTimes, 
  FaClock, 
  FaMapMarkerAlt, 
  FaCalendarAlt, 
  FaSuitcase, 
  FaUserFriends,
  FaPlane,
  FaRupeeSign,
  FaShieldAlt,
  FaExchangeAlt,
  FaTag,
  FaChevronDown,
  FaChevronUp,
  FaUtensils,
  FaChair,
  FaCrown,
  FaBolt,
  FaInfoCircle,
  FaPlaneDeparture,
  FaPlaneArrival
} from 'react-icons/fa';

const FlightDetailSheet = ({ flight, fare, onClose, passengerCounts, mode = 'details' }) => {
  const [expandedSections, setExpandedSections] = useState({
    fareDetails: true,
    segments: true,
    policies: true
  });

  if (!flight || !fare) return null;

  // ============ HELPER FUNCTIONS ============

  const formatTime = (isoString) => {
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
  };

  const formatDate = (isoString) => {
    if (!isoString) return 'Unknown date';
    try {
      const date = new Date(isoString);
      return date.toLocaleDateString('en-IN', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      });
    } catch {
      return 'Unknown date';
    }
  };

  const formatDuration = (minutes) => {
    if (!minutes) return 'Unknown';
    const mins = parseInt(minutes);
    const hours = Math.floor(mins / 60);
    const remainingMins = mins % 60;
    return `${hours}h ${remainingMins}m`;
  };

  const formatPrice = (price) => {
    if (price === undefined || price === null) return 'Price unavailable';
    if (typeof price === 'number') return `₹${price.toLocaleString('en-IN')}`;
    if (typeof price === 'string') {
      const numericValue = parseInt(price.toString().replace(/[^0-9]/g, ''));
      if (!isNaN(numericValue)) return `₹${numericValue.toLocaleString('en-IN')}`;
    }
    return 'Price unavailable';
  };

  const getAirlineName = (code) => {
    if (!code) return 'Unknown Airline';
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
    return airlines[code] || code;
  };

  const getBrandBadge = (brandName) => {
    const name = brandName?.toLowerCase() || '';
    if (name.includes('flexi')) return { bg: 'bg-purple-50', text: 'text-purple-700', icon: <FaBolt className="text-purple-500" /> };
    if (name.includes('upfront')) return { bg: 'bg-blue-50', text: 'text-blue-700', icon: <FaCrown className="text-blue-500" /> };
    if (name.includes('stretch')) return { bg: 'bg-amber-50', text: 'text-amber-700', icon: <FaChair className="text-amber-500" /> };
    if (name.includes('sale')) return { bg: 'bg-green-50', text: 'text-green-700', icon: <FaTag className="text-green-500" /> };
    if (name.includes('eco')) return { bg: 'bg-gray-50', text: 'text-gray-700', icon: <FaTag className="text-gray-500" /> };
    return { bg: 'bg-gray-100', text: 'text-gray-600', icon: <FaTag className="text-gray-400" /> };
  };

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  // ============ EXTRACT DATA FROM FLIGHT OBJECT ============
  
  // Basic flight info
  const airlineCode = flight.airlineCode || flight.carrier || 'Unknown';
  const airlineName = getAirlineName(airlineCode);
  const flightNumber = flight.flightNumber || `${airlineCode}-${flight.flightNum || ''}`;
  const origin = flight.origin || flight.from;
  const destination = flight.destination || flight.to;
  
  // Times
  const departureTime = flight.departureTime;
  const arrivalTime = flight.arrivalTime;
  const departureDate = flight.departureTime;
  
  // Duration & stops
  const duration = flight.duration || 0;
  const stops = flight.stops || 0;
  const stopText = stops === 0 ? 'Direct' : `${stops} Stop${stops > 1 ? 's' : ''}`;
  
  // Equipment & terminal
  const aircraft = flight.aircraft || flight.equipment || 'Unknown aircraft';
  const terminal = flight.terminal || flight.originTerminal || 'Unknown';
  
  // Segments (for connecting flights)
  const segments = flight.segments || [];
  const isConnecting = segments.length > 1;

  // ============ EXTRACT DATA FROM FARE OBJECT ============
  
  const brand = fare.brand || { name: 'Economy' };
  const brandBadge = getBrandBadge(brand.name);
  
  // Price breakdown
  const totalPrice = fare.price || flight.price || 0;
  const basePrice = fare.basePrice || 0;
  const taxes = fare.taxes || [];
  const totalTax = taxes.reduce((sum, tax) => sum + (tax.amount || 0), 0) || fare.totalTax || 0;
  
  // Baggage
  const baggage = fare.baggage || flight.baggage || { weight: '15', unit: 'kg' };
  
  // Amenities
  const amenities = fare.amenities || flight.amenities || {
    meals: false,
    seatSelection: false,
    changes: true,
    priority: false
  };

  // Passenger counts
  const adultCount = passengerCounts?.adults || 0;
  const childCount = passengerCounts?.children || 0;
  const infantCount = passengerCounts?.infants || 0;
  const totalPassengers = adultCount + childCount + infantCount;

  // Policies from brand description
  const brandDescription = brand.description || '';
  
  // Parse cancellation policy
  const cancellationPolicy = brandDescription.split('\n').filter(line => 
    line.toLowerCase().includes('cancel') || 
    line.toLowerCase().includes('refund') ||
    line.includes('non-refundable')
  );

  // Parse change policy
  const changePolicy = brandDescription.split('\n').filter(line => 
    line.toLowerCase().includes('change') || 
    line.toLowerCase().includes('reschedule') ||
    line.toLowerCase().includes('date')
  );

  // ============ ROUND TRIP CHECK ============
  const isRoundTrip = flight.isRoundTrip || fare._roundTripData;
  
  if (isRoundTrip) {
    // Handle round trip display (your existing round trip code)
    // ... keep your round trip implementation
    return null; // Replace with your round trip JSX
  }

  // ============ ONE-WAY VIEW ============
  return (
    <>
      {/* Backdrop - CHANGED to 30% opacity as requested */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-30 z-40 transition-opacity"
        onClick={onClose}
      />
      
      {/* Sheet */}
      <div className="fixed inset-y-0 right-0 w-full max-w-2xl bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out overflow-y-auto">
        
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex justify-between items-center z-10">
          <div className="flex items-center">
            <FaPlane className="text-[#FD561E] mr-2" />
            <h2 className="text-xl font-bold text-gray-800">
              Flight Details
            </h2>
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
          
          {/* Airline & Flight Info Card */}
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
              <div className={`px-3 py-1 rounded-full text-sm font-medium ${brandBadge.bg} ${brandBadge.text}`}>
                <span className="flex items-center gap-1">
                  {brandBadge.icon}
                  {brand.name}
                </span>
              </div>
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

          {/* Route Summary Card */}
          <div className="bg-gray-50 rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div className="text-center flex-1">
                <div className="text-3xl font-bold text-gray-900">{formatTime(departureTime)}</div>
                <div className="text-sm text-gray-600 mt-1 font-medium">{origin}</div>
                {terminal && <div className="text-xs text-gray-500">Terminal {terminal}</div>}
              </div>

              <div className="flex-2 px-8 text-center">
                <div className="text-sm text-gray-600 mb-2 flex items-center justify-center">
                  <FaClock className="mr-1 text-gray-400" />
                  {formatDuration(duration)}
                </div>
                <div className="relative">
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-[#FD561E] rounded-full"></div>
                    <div className="flex-1 h-0.5 bg-gray-300 mx-2"></div>
                    <div className="w-2 h-2 bg-[#FD561E] rounded-full"></div>
                  </div>
                </div>
                <div className="text-xs text-gray-500 mt-2">{stopText}</div>
              </div>

              <div className="text-center flex-1">
                <div className="text-3xl font-bold text-gray-900">{formatTime(arrivalTime)}</div>
                <div className="text-sm text-gray-600 mt-1 font-medium">{destination}</div>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-gray-200 flex items-center justify-center gap-2">
              <FaCalendarAlt className="text-[#FD561E]" />
              <span className="text-gray-700 font-medium">{formatDate(departureDate)}</span>
            </div>
          </div>

          {/* Connecting Flights Section */}
          {isConnecting && (
            <div className="border border-gray-200 rounded-xl overflow-hidden">
              <button
                className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 transition-colors"
                onClick={() => toggleSection('segments')}
              >
                <span className="font-semibold text-gray-800 flex items-center">
                  <FaPlane className="mr-2 text-[#FD561E]" />
                  Flight Details ({segments.length} Segments)
                </span>
                {expandedSections.segments ? <FaChevronUp /> : <FaChevronDown />}
              </button>
              
              {expandedSections.segments && (
                <div className="p-4 bg-white space-y-4">
                  {segments.map((segment, index) => {
                    const segAirline = getAirlineName(segment.carrier);
                    
                    return (
                      <div key={index} className="border-l-2 border-[#FD561E] pl-4">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-sm font-medium text-gray-700">Segment {index + 1}</span>
                          <span className="text-xs bg-gray-100 px-2 py-0.5 rounded-full">
                            {segment.carrier}-{segment.flightNumber}
                          </span>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div className="text-center">
                            <div className="text-lg font-bold">{formatTime(segment.departureTime)}</div>
                            <div className="text-xs text-gray-600">{segment.origin}</div>
                            {segment.terminal && <div className="text-xs text-gray-500">T{segment.terminal}</div>}
                          </div>

                          <div className="flex-1 mx-4 text-center">
                            <div className="text-xs text-gray-500">{formatDuration(segment.duration)}</div>
                          </div>

                          <div className="text-center">
                            <div className="text-lg font-bold">{formatTime(segment.arrivalTime)}</div>
                            <div className="text-xs text-gray-600">{segment.destination}</div>
                          </div>
                        </div>

                        {/* Layover Info */}
                        {index < segments.length - 1 && flight.layovers?.[index] && (
                          <div className="mt-2 p-2 bg-blue-50 rounded-lg text-xs text-gray-600">
                            Layover at {flight.layovers[index].airport}: {flight.layovers[index].formattedDuration}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Passenger Info */}
          {totalPassengers > 0 && (
            <div className="bg-blue-50 rounded-xl p-4">
              <h3 className="font-semibold text-gray-800 mb-2 flex items-center">
                <FaUserFriends className="mr-2 text-blue-500" />
                Passenger Details
              </h3>
              <p className="text-gray-700">
                {adultCount > 0 ? `${adultCount} Adult${adultCount > 1 ? 's' : ''}` : ''}
                {childCount > 0 && `, ${childCount} Child${childCount > 1 ? 'ren' : ''}`}
                {infantCount > 0 && `, ${infantCount} Infant${infantCount > 1 ? 's' : ''}`}
              </p>
            </div>
          )}

          {/* Fare Breakdown */}
          <div className="bg-white border border-gray-200 rounded-xl p-4">
            <h3 className="font-semibold text-gray-800 mb-3 flex items-center">
              <FaRupeeSign className="mr-2 text-[#FD561E]" />
              Fare Breakdown
            </h3>
            
            <div className="space-y-2 text-sm">
              {basePrice > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Base Fare</span>
                  <span className="font-medium">{formatPrice(basePrice)}</span>
                </div>
              )}
              
              {taxes.length > 0 ? taxes.map((tax, idx) => (
                <div key={idx} className="flex justify-between">
                  <span className="text-gray-600">{tax.description || `Tax (${tax.category})`}</span>
                  <span className="font-medium">{formatPrice(tax.amount)}</span>
                </div>
              )) : totalTax > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Taxes & Surcharges</span>
                  <span className="font-medium">{formatPrice(totalTax)}</span>
                </div>
              )}
              
              <div className="border-t border-gray-200 my-2 pt-2">
                <div className="flex justify-between font-bold">
                  <span>Total</span>
                  <span className="text-[#FD561E] text-lg">{formatPrice(totalPrice)}</span>
                </div>
                {totalPassengers > 0 && (
                  <div className="text-xs text-gray-500 text-right mt-1">
                    for {totalPassengers} {totalPassengers === 1 ? 'passenger' : 'passengers'}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Baggage Allowance */}
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

          {/* Amenities */}
          <div className="bg-purple-50 rounded-xl p-4">
            <h3 className="font-semibold text-gray-800 mb-3 flex items-center">
              <FaUtensils className="mr-2 text-purple-600" />
              Amenities
            </h3>
            
            <div className="grid grid-cols-2 gap-3">
              <div className="flex items-center gap-2 bg-white p-2 rounded-lg">
                <span className={`text-lg ${amenities.meals ? 'text-green-500' : 'text-gray-300'}`}>
                  {amenities.meals ? '✅' : '❌'}
                </span>
                <span className="text-sm">Meals</span>
              </div>
              <div className="flex items-center gap-2 bg-white p-2 rounded-lg">
                <span className={`text-lg ${amenities.seatSelection ? 'text-green-500' : 'text-gray-300'}`}>
                  {amenities.seatSelection ? '✅' : '❌'}
                </span>
                <span className="text-sm">Seat Selection</span>
              </div>
              <div className="flex items-center gap-2 bg-white p-2 rounded-lg">
                <span className={`text-lg ${amenities.changes ? 'text-green-500' : 'text-gray-300'}`}>
                  {amenities.changes ? '✅' : '❌'}
                </span>
                <span className="text-sm">Free Changes</span>
              </div>
              <div className="flex items-center gap-2 bg-white p-2 rounded-lg">
                <span className={`text-lg ${amenities.priority ? 'text-green-500' : 'text-gray-300'}`}>
                  {amenities.priority ? '✅' : '❌'}
                </span>
                <span className="text-sm">Priority Boarding</span>
              </div>
            </div>
          </div>

          {/* Cancellation Policy */}
          {cancellationPolicy.length > 0 && (
            <div className="border border-red-200 rounded-xl overflow-hidden">
              <div className="p-4 bg-red-50">
                <h3 className="font-semibold text-gray-800 mb-2 flex items-center">
                  <FaShieldAlt className="mr-2 text-red-500" />
                  Cancellation Policy
                </h3>
                <div className="space-y-1 text-sm">
                  {cancellationPolicy.map((line, idx) => (
                    <div key={idx} className="text-gray-700">
                      {line.replace(/[-•]/g, '').trim()}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Date Change Policy */}
          {changePolicy.length > 0 && (
            <div className="border border-blue-200 rounded-xl overflow-hidden">
              <div className="p-4 bg-blue-50">
                <h3 className="font-semibold text-gray-800 mb-2 flex items-center">
                  <FaExchangeAlt className="mr-2 text-blue-500" />
                  Date Change Policy
                </h3>
                <div className="space-y-1 text-sm">
                  {changePolicy.map((line, idx) => (
                    <div key={idx} className="text-gray-700">
                      {line.replace(/[-•]/g, '').trim()}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Full Brand Description */}
          {brandDescription && (
            <div className="border border-gray-200 rounded-xl overflow-hidden">
              <div className="p-4 bg-gray-50">
                <h3 className="font-semibold text-gray-800 mb-2 flex items-center">
                  <FaInfoCircle className="mr-2 text-[#FD561E]" />
                  Complete Fare Details
                </h3>
                <div className="text-sm text-gray-600 whitespace-pre-line max-h-60 overflow-y-auto">
                  {brandDescription}
                </div>
              </div>
            </div>
          )}

          {/* Seat Availability */}
          {flight.seatsAvailable > 0 && (
            <div className="bg-gray-100 rounded-xl p-4 flex items-center justify-between">
              <span className="text-gray-700 flex items-center">
                <FaClock className="mr-2 text-[#FD561E]" />
                Seats Available
              </span>
              <span className="font-bold text-[#FD561E] text-lg">{flight.seatsAvailable} seats</span>
            </div>
          )}

          {/* Action Button */}
          {mode === 'booking' ? (
            <button
              className="w-full bg-[#FD561E] hover:bg-[#e04e1b] text-white font-bold py-4 px-6 rounded-xl transition-colors shadow-md hover:shadow-lg"
              onClick={() => {
                alert('Proceeding to payment...');
                onClose();
              }}
            >
              Proceed to Payment
            </button>
          ) : (
            <button
              className="w-full bg-[#FD561E] hover:bg-[#e04e1b] text-white font-bold py-4 px-6 rounded-xl transition-colors shadow-md hover:shadow-lg"
              onClick={onClose}
            >
              Close
            </button>
          )}

          <p className="text-xs text-gray-500 text-center">
            By continuing, you agree to our Terms of Service
          </p>
        </div>
      </div>
    </>
  );
};

export default FlightDetailSheet;