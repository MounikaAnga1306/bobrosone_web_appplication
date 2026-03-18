// src/modules/flights/components/sheet/OneWaySheet.jsx
import React from 'react';
import BaseSheet from './BaseSheet';
import BrandBadge from '../shared/BrandBadge';
import { formatTime, formatDate, formatDuration, formatPrice } from '../../utils/formatters';
import { 
  FaPlane, 
  FaClock, 
  FaCalendarAlt, 
  FaSuitcase, 
  FaUserFriends,
  FaTag,
  FaInfoCircle,
  FaShieldAlt,
  FaExchangeAlt
} from 'react-icons/fa';

const OneWaySheet = ({ isOpen, onClose, flight, passengerCounts }) => {
  if (!flight) return null;

  // Debug log to see what brand data we have
  console.log('📄 OneWaySheet received:', {
    id: flight.id,
    brand: flight.brand,
    brandDesc: flight.brand?.description?.substring(0, 100)
  });

  // Extract policies from brand description
  const brandDesc = flight.brand?.description || '';
  const cancellationMatch = brandDesc.match(/[Cc]ancel[^\n]*/g);
  const changeMatch = brandDesc.match(/[Cc]hange|[Rr]eschedule[^\n]*/g);
  
  // Get features from brand (if available as array)
  const features = flight.brand?.features || [];

  return (
    <BaseSheet isOpen={isOpen} onClose={onClose} title="Flight Details">
      <div className="space-y-6">
        {/* Airline & Flight Info */}
        <div className="bg-gradient-to-r from-orange-50 to-amber-50 rounded-xl p-4">
          <div className="flex justify-between items-start">
            <div>
              <div className="text-2xl font-bold">{flight.airline}</div>
              <div className="text-gray-600 mt-1">{flight.flightNumber}</div>
            </div>
            <BrandBadge brand={flight.brand} size="md" />
          </div>
          
          {/* Aircraft & Terminal Info */}
          {(flight.aircraft || flight.terminal) && (
            <div className="flex gap-4 mt-3 text-sm text-gray-600">
              {flight.aircraft && (
                <div className="flex items-center gap-1">
                  <FaPlane className="text-orange-500" size={12} />
                  <span>{flight.aircraft}</span>
                </div>
              )}
              {flight.terminal && (
                <div className="flex items-center gap-1">
                  <span>Terminal {flight.terminal}</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Route Summary */}
        <div className="bg-gray-50 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div className="text-center flex-1">
              <div className="text-3xl font-bold">{formatTime(flight.departureTime)}</div>
              <div className="text-sm text-gray-600 mt-1">{flight.origin}</div>
            </div>

            <div className="flex-2 px-8 text-center">
              <div className="text-sm text-gray-600 mb-2 flex items-center justify-center">
                <FaClock className="mr-1" />
                {formatDuration(flight.duration)}
              </div>
              <div className="relative">
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                  <div className="flex-1 h-0.5 bg-gray-300 mx-2"></div>
                  <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                </div>
              </div>
              <div className="text-xs text-gray-500 mt-2">
                {flight.stops === 0 ? 'Non-stop' : `${flight.stops} stop${flight.stops > 1 ? 's' : ''}`}
              </div>
            </div>

            <div className="text-center flex-1">
              <div className="text-3xl font-bold">{formatTime(flight.arrivalTime)}</div>
              <div className="text-sm text-gray-600 mt-1">{flight.destination}</div>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t flex items-center justify-center gap-2">
            <FaCalendarAlt className="text-orange-500" />
            <span className="text-gray-700 font-medium">{formatDate(flight.departureTime)}</span>
          </div>
        </div>

        {/* Baggage Allowance */}
        <div className="bg-green-50 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <FaSuitcase className="text-green-600" />
            <h3 className="font-semibold">Baggage Allowance</h3>
          </div>
          <p className="text-2xl font-bold">{flight.baggage?.weight}{flight.baggage?.unit}</p>
          <p className="text-xs text-gray-500 mt-1">Check-in baggage</p>
        </div>

        {/* Fare Details - CRITICAL SECTION */}
        {flight.brand?.description && (
          <div className="border rounded-xl p-4">
            <div className="flex items-center gap-2 mb-3">
              <FaTag className="text-orange-500" />
              <h3 className="font-semibold">Fare Details - {flight.brand.name}</h3>
            </div>
            
            {/* Features list if available */}
            {features.length > 0 && (
              <div className="mb-3 space-y-1">
                {features.map((feature, idx) => (
                  <div key={idx} className="flex items-start gap-2 text-sm">
                    <span className="text-green-500 mt-1">✓</span>
                    <span className="text-gray-700">{feature}</span>
                  </div>
                ))}
              </div>
            )}
            
            {/* Full description */}
            <p className="text-sm text-gray-600 whitespace-pre-line leading-relaxed">
              {flight.brand.description}
            </p>
          </div>
        )}

        {/* Fare Rules - Cancellation & Change */}
        {(cancellationMatch?.length > 0 || changeMatch?.length > 0) && (
          <div className="border rounded-xl p-4 bg-gray-50">
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <FaInfoCircle className="text-blue-500" />
              Fare Rules
            </h3>
            {cancellationMatch?.length > 0 && (
              <div className="mb-3 flex items-start gap-2">
                <FaShieldAlt className="text-red-500 mt-1 flex-shrink-0" size={14} />
                <div>
                  <span className="text-xs text-gray-500 block">Cancellation</span>
                  <span className="text-sm text-gray-700">
                    {cancellationMatch[0].replace(/[-•]/g, '').trim()}
                  </span>
                </div>
              </div>
            )}
            {changeMatch?.length > 0 && (
              <div className="flex items-start gap-2">
                <FaExchangeAlt className="text-blue-500 mt-1 flex-shrink-0" size={14} />
                <div>
                  <span className="text-xs text-gray-500 block">Date Change</span>
                  <span className="text-sm text-gray-700">
                    {changeMatch[0].replace(/[-•]/g, '').trim()}
                  </span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Passenger Info */}
        {passengerCounts && (
          <div className="pt-4 border-t">
            <div className="flex items-center gap-2 text-gray-600">
              <FaUserFriends />
              <span>
                {passengerCounts.adults} Adult{passengerCounts.adults > 1 ? 's' : ''}
                {passengerCounts.children > 0 && `, ${passengerCounts.children} Child${passengerCounts.children > 1 ? 'ren' : ''}`}
                {passengerCounts.infants > 0 && `, ${passengerCounts.infants} Infant${passengerCounts.infants > 1 ? 's' : ''}`}
              </span>
            </div>
          </div>
        )}
      </div>
    </BaseSheet>
  );
};

export default OneWaySheet;