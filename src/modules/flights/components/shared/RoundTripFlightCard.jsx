// src/modules/flights/components/flight/RoundTripFlightCard.jsx

import React, { useState, useMemo } from 'react';
import { 
  FaPlane,
  FaCheckCircle,
  FaClock,
  FaCalendarAlt,
  FaMapMarkerAlt,
  FaRegClock
} from 'react-icons/fa';

// ============================================================================
// AIRLINE MAPPING
// ============================================================================
const AIRLINE_MAPPING = {
  '6E': { name: 'IndiGo', code: '6E', color: '#0D47A1', logo: '/airlines/6e.png' },
  'AI': { name: 'Air India', code: 'AI', color: '#B71C1C', logo: '/airlines/ai.png' },
  'SG': { name: 'SpiceJet', code: 'SG', color: '#D32F2F', logo: '/airlines/sg.png' },
  'UK': { name: 'Vistara', code: 'UK', color: '#5D4037', logo: '/airlines/uk.png' },
  'I5': { name: 'AirAsia India', code: 'I5', color: '#E53935', logo: '/airlines/i5.png' },
  'G8': { name: 'Go First', code: 'G8', color: '#1976D2', logo: '/airlines/g8.png' },
  'IX': { name: 'Air India Express', code: 'IX', color: '#B71C1C', logo: '/airlines/ix.png' },
  'S2': { name: 'JetLite', code: 'S2', color: '#FF9800', logo: '/airlines/s2.png' },
  'EK': { name: 'Emirates', code: 'EK', color: '#D4AF37', logo: '/airlines/ek.png' },
  'QR': { name: 'Qatar Airways', code: 'QR', color: '#5D4037', logo: '/airlines/qr.png' },
  'SQ': { name: 'Singapore Airlines', code: 'SQ', color: '#0D47A1', logo: '/airlines/sq.png' },
  'BA': { name: 'British Airways', code: 'BA', color: '#0D47A1', logo: '/airlines/ba.png' },
  'LH': { name: 'Lufthansa', code: 'LH', color: '#0D47A1', logo: '/airlines/lh.png' },
  'AA': { name: 'American Airlines', code: 'AA', color: '#B71C1C', logo: '/airlines/aa.png' },
};

const getAirlineInfo = (code) => {
  if (!code) return { name: 'Unknown', code: '', color: '#757575', logo: null };
  if (AIRLINE_MAPPING[code]) return AIRLINE_MAPPING[code];
  const upperCode = code.toUpperCase();
  if (AIRLINE_MAPPING[upperCode]) return AIRLINE_MAPPING[upperCode];
  return { name: code, code: code, color: '#6B7280', logo: null };
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

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

const formatDuration = (minutes) => {
  if (!minutes) return '0h 0m';
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours}h ${mins}m`;
};

const formatDate = (isoString) => {
  if (!isoString) return '';
  try {
    const date = new Date(isoString);
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short'
    });
  } catch {
    return '';
  }
};

const parsePrice = (price) => {
  if (typeof price === 'number') return price;
  if (!price) return 0;
  const match = price.toString().match(/(\d+\.?\d*)/);
  return match ? parseFloat(match[1]) : 0;
};

// ============================================================================
// AIRLINE LOGO COMPONENT
// ============================================================================
const AirlineLogo = ({ code, name }) => {
  const info = getAirlineInfo(code);
  const [imageError, setImageError] = useState(false);
  
  return (
    <div className="relative">
      {!imageError && info.logo ? (
        <img 
          src={info.logo} 
          alt={name}
          className="w-12 h-12 object-contain rounded-xl border border-gray-100 bg-white shadow-sm"
          onError={() => setImageError(true)}
        />
      ) : (
        <div 
          className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-semibold text-base shadow-sm"
          style={{ backgroundColor: info.color }}
        >
          {info.code || code?.substring(0, 2) || name?.substring(0, 2)}
        </div>
      )}
    </div>
  );
};

// ============================================================================
// STOP BADGE COMPONENT
// ============================================================================
const StopBadge = ({ stops }) => {
  if (stops === 0) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-xs font-medium">
        <FaPlane size={10} className="rotate-45" />
        Direct
      </span>
    );
  }
  if (stops === 1) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 text-xs font-medium">
        <FaMapMarkerAlt size={10} />
        1 Stop
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 text-xs font-medium">
      <FaMapMarkerAlt size={10} />
      {stops} Stops
    </span>
  );
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

const RoundTripFlightCard = ({ 
  flight, 
  isSelected, 
  onSelect,
  legIndex 
}) => {
  const flightWithValidData = useMemo(() => {
    if (!flight) return null;
    
    let airlineCode = null;
    let airlineName = null;
    
    if (flight.airlineCode) {
      airlineCode = flight.airlineCode;
      airlineName = flight.airline;
    } else if (flight.airline) {
      if (AIRLINE_MAPPING[flight.airline]) {
        airlineCode = flight.airline;
        airlineName = AIRLINE_MAPPING[flight.airline].name;
      } else {
        airlineName = flight.airline;
      }
    } else if (flight.flightNumber) {
      const match = flight.flightNumber.match(/^([A-Z0-9]{2})-?(\d+)/);
      if (match) airlineCode = match[1];
    }
    
    const airlineInfo = getAirlineInfo(airlineCode);
    const finalAirlineName = airlineName || airlineInfo.name;
    
    return {
      ...flight,
      airline: finalAirlineName,
      airlineCode: airlineInfo.code,
      departureTime: flight.departureTime || flight.departureISO,
      arrivalTime: flight.arrivalTime || flight.arrivalISO,
    };
  }, [flight]);

  if (!flightWithValidData) return null;

  const handleSelect = () => onSelect?.(flightWithValidData);

  const lowestPrice = flightWithValidData.lowestPrice || flightWithValidData.price || 0;
  const stops = flightWithValidData.stops || 0;
  const duration = flightWithValidData.duration || 0;
  
  const legColor = legIndex === 0 ? 'blue' : 'emerald';
  const selectedStyles = isSelected 
    ? `border-${legColor}-500 ring-2 ring-${legColor}-200 ring-offset-2`
    : 'border-gray-200 hover:border-gray-300 hover:shadow-lg';

  return (
    <div className="relative">
      {/* Card */}
      <div 
        onClick={handleSelect}
        className={`
          bg-white rounded-2xl border-2 transition-all duration-300 cursor-pointer
          shadow-sm hover:shadow-xl ${selectedStyles}
        `}
      >
        {/* Main Content */}
        <div className="p-5">
          {/* Header Section */}
          <div className="flex items-start justify-between mb-5">
            <div className="flex items-center gap-4">
              {/* Radio Button */}
              <div className={`
                w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all
                ${isSelected 
                  ? 'border-[#FD561E] bg-[#FD561E] shadow-sm' 
                  : 'border-gray-300 bg-white group-hover:border-[#FD561E]'
                }
              `}>
                {isSelected && <FaCheckCircle className="text-white" size={12} />}
              </div>
              
              {/* Airline Logo & Info */}
              <AirlineLogo code={flightWithValidData.airlineCode} name={flightWithValidData.airline} />
              <div>
                <h3 className="font-semibold text-gray-900 text-base">{flightWithValidData.airline}</h3>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-sm font-mono text-gray-600">{flightWithValidData.flightNumber}</span>
                  <StopBadge stops={stops} />
                </div>
              </div>
            </div>
            
            {/* Price */}
            <div className="text-right">
              <div className="text-xs text-gray-400 uppercase tracking-wide">From</div>
              <div className="text-2xl font-bold text-[#FD561E]">
                ₹{parsePrice(lowestPrice).toLocaleString('en-IN')}
              </div>
            </div>
          </div>

          {/* Flight Route Section */}
          <div className="relative py-4">
            <div className="flex items-center justify-between">
              {/* Departure */}
              <div className="text-center min-w-[100px]">
                <div className="text-2xl font-semibold text-gray-900">{formatTime(flightWithValidData.departureTime)}</div>
                <div className="text-sm font-medium text-gray-700 mt-1">{flightWithValidData.origin}</div>
                <div className="text-xs text-gray-400 mt-0.5 flex items-center justify-center gap-1">
                  <FaCalendarAlt size={10} />
                  {formatDate(flightWithValidData.departureTime)}
                </div>
              </div>
              
              {/* Journey Visual */}
              <div className="flex-1 mx-8">
                <div className="relative">
                  {/* Track Line */}
                  <div className="absolute top-1/2 left-0 right-0 h-px bg-gray-200 -translate-y-1/2"></div>
                  
                  {/* Animated Track (when selected) */}
                  {isSelected && (
                    <div className="absolute top-1/2 left-0 h-px bg-gradient-to-r from-[#FD561E] to-[#FD561E]/30 -translate-y-1/2 animate-pulse" style={{ width: '50%' }}></div>
                  )}
                  
                  {/* Duration Badge */}
                  <div className="relative flex justify-center">
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-gray-50 rounded-full border border-gray-200 shadow-sm">
                      <FaRegClock size={12} className="text-gray-400" />
                      <span className="text-sm font-medium text-gray-700">{formatDuration(duration)}</span>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Arrival */}
              <div className="text-center min-w-[100px]">
                <div className="text-2xl font-semibold text-gray-900">{formatTime(flightWithValidData.arrivalTime)}</div>
                <div className="text-sm font-medium text-gray-700 mt-1">{flightWithValidData.destination}</div>
                <div className="text-xs text-gray-400 mt-0.5 flex items-center justify-center gap-1">
                  <FaCalendarAlt size={10} />
                  {formatDate(flightWithValidData.arrivalTime)}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Subtle Divider with Airline Brand Color */}
        <div className={`h-0.5 bg-gradient-to-r from-${legColor}-50 via-${legColor}-200 to-${legColor}-50 opacity-50`}></div>
        
        {/* Footer Hint */}
        <div className="px-5 py-3 bg-gray-50/30">
          <p className="text-xs text-gray-400 text-center">
            {isSelected ? '✓ Selected' : 'Click to select this flight'}
          </p>
        </div>
      </div>
    </div>
  );
};

export default RoundTripFlightCard;