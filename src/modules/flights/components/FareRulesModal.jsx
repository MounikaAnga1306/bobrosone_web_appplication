// src/components/flights/FareRulesModal.jsx

import React from 'react';
import {
  FaTimes,
  FaSuitcase,
  FaUtensils,
  FaChair,
  FaExchangeAlt,
  FaShieldAlt,
  FaClock,
  FaPlane,
  FaCalendarAlt,
  FaInfoCircle,
  FaCheckCircle,
  FaTimesCircle
} from 'react-icons/fa';

const FareRulesModal = ({ fare, flight, onClose }) => {
  
  if (!fare || !flight) return null;

  // Format price
  const formatPrice = (price) => {
    if (typeof price === 'number') return `₹${price.toLocaleString('en-IN')}`;
    return price;
  };

  // Get refund status text
  const getRefundStatus = () => {
    if (fare.refundable) {
      return {
        text: 'Refundable',
        icon: <FaCheckCircle className="text-green-500" />,
        description: 'Full refund available as per cancellation policy'
      };
    } else {
      return {
        text: 'Non-refundable',
        icon: <FaTimesCircle className="text-red-500" />,
        description: 'No refund applicable on cancellation'
      };
    }
  };

  // Get change status text
  const getChangeStatus = () => {
    if (fare.amenities?.changes) {
      return {
        text: 'Free Changes',
        icon: <FaCheckCircle className="text-green-500" />,
        description: 'Free date changes available'
      };
    } else {
      return {
        text: 'Changes Not Allowed',
        icon: <FaTimesCircle className="text-red-500" />,
        description: 'No changes permitted to this booking'
      };
    }
  };

  const refundStatus = getRefundStatus();
  const changeStatus = getChangeStatus();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-[#FD561E]/5 to-[#ff7b4a]/5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-800">Fare Rules</h2>
              <p className="text-sm text-gray-500 mt-1">
                {flight.airline} • {flight.flightNumber} • {fare.brand?.name || 'Economy'}
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors p-2 hover:bg-gray-100 rounded-full"
            >
              <FaTimes className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Body - Scrollable */}
        <div className="p-6 overflow-y-auto" style={{ maxHeight: 'calc(90vh - 140px)' }}>
          {/* Fare Summary */}
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-xs text-gray-500 mb-1">Total Price</div>
                <div className="text-xl font-bold text-[#FD561E]">
                  {formatPrice(fare.price)}
                </div>
                <div className="text-xs text-gray-500 mt-1">For all passengers</div>
              </div>
              <div>
                <div className="text-xs text-gray-500 mb-1">Fare Type</div>
                <div className="font-medium text-gray-800">{fare.brand?.name || 'Economy'}</div>
                {fare.fareBasis && (
                  <div className="text-xs text-gray-500 mt-1">Code: {fare.fareBasis}</div>
                )}
              </div>
            </div>
          </div>

          {/* Amenities Overview */}
          <div className="mb-6">
            <h3 className="font-bold text-gray-800 mb-3 flex items-center">
              <span className="w-1 h-5 bg-[#FD561E] rounded-full mr-2"></span>
              What's Included
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {/* Baggage */}
              <div className="p-3 bg-gray-50 rounded-lg">
                <FaSuitcase className="text-[#FD561E] mb-2" />
                <div className="font-medium text-gray-800">Baggage</div>
                <div className="text-xs text-gray-600">
                  Check-in: {fare.baggage?.weight || '15'}kg
                </div>
                <div className="text-xs text-gray-600">Cabin: 7kg</div>
              </div>

              {/* Meals */}
              <div className="p-3 bg-gray-50 rounded-lg">
                <FaUtensils className={`mb-2 ${fare.amenities?.meals ? 'text-[#FD561E]' : 'text-gray-400'}`} />
                <div className="font-medium text-gray-800">Meals</div>
                <div className="text-xs text-gray-600">
                  {fare.amenities?.meals ? 'Complimentary meals' : 'Not included'}
                </div>
              </div>

              {/* Seat Selection */}
              <div className="p-3 bg-gray-50 rounded-lg">
                <FaChair className={`mb-2 ${fare.amenities?.seatSelection ? 'text-[#FD561E]' : 'text-gray-400'}`} />
                <div className="font-medium text-gray-800">Seat Selection</div>
                <div className="text-xs text-gray-600">
                  {fare.amenities?.seatSelection ? 'Free seat selection' : 'Not available'}
                </div>
              </div>
            </div>
          </div>

          {/* Cancellation Policy */}
          <div className="mb-6">
            <h3 className="font-bold text-gray-800 mb-3 flex items-center">
              <span className="w-1 h-5 bg-red-500 rounded-full mr-2"></span>
              Cancellation Policy
            </h3>
            <div className="bg-red-50 border border-red-100 rounded-lg p-4">
              <div className="flex items-center mb-3">
                {refundStatus.icon}
                <span className="font-medium text-gray-800 ml-2">{refundStatus.text}</span>
              </div>
              <p className="text-sm text-gray-600 mb-3">{refundStatus.description}</p>
              
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Before 24 hours:</span>
                  <span className="font-medium text-gray-800">
                    {fare.refundable ? '₹2,500 + fare diff' : 'Non-refundable'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Within 24 hours:</span>
                  <span className="font-medium text-gray-800">
                    {fare.refundable ? '₹3,500 + fare diff' : 'Non-refundable'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">No-show:</span>
                  <span className="font-medium text-gray-800">100% charge</span>
                </div>
              </div>
            </div>
          </div>

          {/* Date Change Policy */}
          <div className="mb-6">
            <h3 className="font-bold text-gray-800 mb-3 flex items-center">
              <span className="w-1 h-5 bg-blue-500 rounded-full mr-2"></span>
              Date Change Policy
            </h3>
            <div className="bg-blue-50 border border-blue-100 rounded-lg p-4">
              <div className="flex items-center mb-3">
                {changeStatus.icon}
                <span className="font-medium text-gray-800 ml-2">{changeStatus.text}</span>
              </div>
              <p className="text-sm text-gray-600 mb-3">{changeStatus.description}</p>
              
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Change fee:</span>
                  <span className="font-medium text-gray-800">
                    {fare.amenities?.changes ? 'Free' : '₹1,500 + fare diff'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Must be done:</span>
                  <span className="font-medium text-gray-800">Before departure</span>
                </div>
              </div>
            </div>
          </div>

          {/* Important Notes */}
          <div className="mb-6">
            <h3 className="font-bold text-gray-800 mb-3 flex items-center">
              <span className="w-1 h-5 bg-yellow-500 rounded-full mr-2"></span>
              Important Notes
            </h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-start">
                <FaInfoCircle className="text-yellow-500 mt-0.5 mr-2 flex-shrink-0" />
                <span>Fare rules apply to all passengers in the booking</span>
              </li>
              <li className="flex items-start">
                <FaInfoCircle className="text-yellow-500 mt-0.5 mr-2 flex-shrink-0" />
                <span>Name changes are not permitted on any fare type</span>
              </li>
              <li className="flex items-start">
                <FaInfoCircle className="text-yellow-500 mt-0.5 mr-2 flex-shrink-0" />
                <span>E-ticket required for all passengers</span>
              </li>
              <li className="flex items-start">
                <FaInfoCircle className="text-yellow-500 mt-0.5 mr-2 flex-shrink-0" />
                <span>Check-in opens 48 hours before departure</span>
              </li>
            </ul>
          </div>

          {/* Flight Details */}
          <div className="mb-6">
            <h3 className="font-bold text-gray-800 mb-3 flex items-center">
              <span className="w-1 h-5 bg-purple-500 rounded-full mr-2"></span>
              Flight Details
            </h3>
            <div className="bg-purple-50 border border-purple-100 rounded-lg p-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-xs text-gray-500 mb-1">From</div>
                  <div className="font-medium text-gray-800 flex items-center">
                    <FaPlane className="mr-1 text-purple-500 text-xs" />
                    {flight.from} ({flight.airportCode})
                  </div>
                  <div className="text-sm text-gray-600 mt-1">{flight.departureTime}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500 mb-1">To</div>
                  <div className="font-medium text-gray-800 flex items-center">
                    <FaPlane className="mr-1 text-purple-500 text-xs transform rotate-90" />
                    {flight.to} ({flight.destinationCode})
                  </div>
                  <div className="text-sm text-gray-600 mt-1">{flight.arrivalTime}</div>
                </div>
              </div>
              <div className="flex items-center justify-between mt-3 pt-3 border-t border-purple-100">
                <div className="flex items-center text-sm text-gray-600">
                  <FaClock className="mr-1 text-purple-500" />
                  Duration: {flight.duration}
                </div>
                <div className="text-sm text-gray-600">
                  {flight.stops === 0 ? 'Non-stop' : `${flight.stops} stop(s)`}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between">
            <p className="text-xs text-gray-500">
              *Fare rules are subject to change. Please read carefully before booking.
            </p>
            <button
              onClick={onClose}
              className="bg-[#FD561E] hover:bg-[#e04e1b] text-white font-semibold py-2 px-6 rounded-lg transition-colors"
            >
              Got it
            </button>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }
      `}</style>
    </div>
  );
};

export default FareRulesModal;