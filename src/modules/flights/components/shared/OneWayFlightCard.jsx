// src/modules/flights/components/flight/OneWayFlightCard.jsx

import React, { useState } from 'react';
import BaseFlightCard from './BaseFlightCard';

// Helper functions (you might want to move these to a utils file)
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
      month: 'short',
      year: 'numeric'
    });
  } catch {
    return '';
  }
};

const OneWayFlightCard = ({ 
  flight, 
  isSelected, 
  onSelect, 
  onViewDetails 
}) => {
  const [selectedFareIndex, setSelectedFareIndex] = useState(0);
  const [showFareComparison, setShowFareComparison] = useState(false);
  
  const selectedFare = flight.fares?.[selectedFareIndex];
  const hasMultipleFares = flight.fares?.length > 1;
  
  // Get airline logo URL (you can replace with your CDN)
  const airlineLogo = `https://logo.clearbit.com/${flight.airlineCode?.toLowerCase()}.com` 
    || `/airlines/${flight.airlineCode}.png`;
  
  const handleCardClick = (e) => {
    // Prevent card selection when clicking on interactive elements
    if (e.target.closest('button') || e.target.closest('.fare-option')) {
      return;
    }
    onSelect?.(flight);
  };

  const handleFareSelect = (index, e) => {
    e.stopPropagation();
    setSelectedFareIndex(index);
  };

  const handleBookNow = (fare, e) => {
    e.stopPropagation();
    // Navigate to booking page with selected flight and fare
    console.log('Booking:', { flight, fare });
    // router.push(`/booking?flightId=${flight.id}&fareId=${fare.id}`);
  };

  return (
    <div 
      onClick={handleCardClick}
      className={`
        relative bg-white rounded-xl shadow-md hover:shadow-lg 
        transition-all duration-200 border-2 cursor-pointer
        ${isSelected 
          ? 'border-blue-500 ring-2 ring-blue-200' 
          : 'border-transparent hover:border-gray-200'
        }
      `}
    >
      {/* Best Price Badge */}
      {flight.lowestPrice && (
        <div className="absolute -top-2 -right-2 bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-md z-10">
          Best Price ₹{flight.lowestPrice.toLocaleString()}
        </div>
      )}

      {/* Main Flight Info */}
      <div className="p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          
          {/* Airline & Flight Info */}
          <div className="flex items-center space-x-4 min-w-[200px]">
            <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center overflow-hidden">
              <img 
                src={airlineLogo}
                alt={flight.airline}
                className="w-8 h-8 object-contain"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = `https://ui-avatars.com/api/?name=${flight.airlineCode}&background=random`;
                }}
              />
            </div>
            <div>
              <div className="font-semibold text-gray-900">{flight.airline}</div>
              <div className="text-sm text-gray-500 flex items-center space-x-2">
                <span>{flight.flightNumber}</span>
                {flight.aircraft && (
                  <>
                    <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                    <span>{flight.aircraft}</span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Flight Timeline */}
          <div className="flex-1 flex items-center justify-between max-w-2xl">
            {/* Departure */}
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">
                {formatTime(flight.departureTime)}
              </div>
              <div className="text-sm text-gray-600">{flight.origin}</div>
              <div className="text-xs text-gray-400">
                {formatDate(flight.departureTime)}
              </div>
              {flight.originTerminal && (
                <div className="text-xs font-medium text-blue-600 mt-1">
                  Terminal {flight.originTerminal}
                </div>
              )}
            </div>

            {/* Duration & Stops */}
            <div className="flex-1 mx-4">
              <div className="relative flex items-center justify-center">
                <div className="absolute inset-0 flex items-center" aria-hidden="true">
                  <div className="w-full border-t border-gray-300"></div>
                </div>
                <div className="relative bg-white px-2">
                  <div className="text-xs text-gray-500 font-medium">
                    {formatDuration(flight.duration)}
                  </div>
                </div>
              </div>
              <div className="text-center text-sm text-gray-600 mt-1">
                {flight.stops === 0 ? (
                  <span className="text-green-600">Nonstop</span>
                ) : (
                  <span>{flight.stops} stop{flight.stops > 1 ? 's' : ''}</span>
                )}
              </div>
            </div>

            {/* Arrival */}
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">
                {formatTime(flight.arrivalTime)}
              </div>
              <div className="text-sm text-gray-600">{flight.destination}</div>
              <div className="text-xs text-gray-400">
                {formatDate(flight.arrivalTime)}
              </div>
              {flight.destinationTerminal && (
                <div className="text-xs font-medium text-blue-600 mt-1">
                  Terminal {flight.destinationTerminal}
                </div>
              )}
            </div>
          </div>

          {/* Price Summary - Shown on mobile/tablet */}
          <div className="lg:hidden flex justify-between items-center pt-4 border-t">
            <div>
              <div className="text-sm text-gray-500">Starting from</div>
              <div className="text-2xl font-bold text-blue-600">
                ₹{flight.lowestPrice?.toLocaleString()}
              </div>
            </div>
            <button
              onClick={(e) => handleBookNow(selectedFare, e)}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
            >
              Book
            </button>
          </div>
        </div>

        {/* Fare Options Section */}
        {hasMultipleFares && (
          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-gray-700">
                Select Fare Type ({flight.fares.length} options)
              </h3>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowFareComparison(true);
                }}
                className="text-sm text-blue-600 hover:text-blue-800 font-medium"
              >
                Compare Fares →
              </button>
            </div>

            {/* Fare Options Tabs */}
            <div className="flex flex-wrap gap-2">
              {flight.fares.map((fare, index) => (
                <button
                  key={fare.id}
                  onClick={(e) => handleFareSelect(index, e)}
                  className={`
                    fare-option px-4 py-2 rounded-lg text-sm font-medium
                    transition-all duration-200 relative overflow-hidden
                    ${selectedFareIndex === index
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }
                    ${fare.isLowest ? 'ring-2 ring-green-400' : ''}
                  `}
                >
                  <span>{fare.brand.name}</span>
                  <span className="ml-2 font-bold">
                    ₹{fare.totalPrice?.toLocaleString()}
                  </span>
                  {fare.isLowest && (
                    <span className="absolute -top-1 -right-1">
                      <span className="relative flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                      </span>
                    </span>
                  )}
                </button>
              ))}
            </div>

            {/* Selected Fare Details */}
            {selectedFare && (
              <div className="mt-4 bg-gray-50 rounded-lg p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  
                  {/* Price Breakdown */}
                  <div>
                    <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                      Price Breakdown
                    </h4>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Base Fare:</span>
                        <span className="font-medium">₹{selectedFare.basePrice?.toLocaleString() || 0}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Taxes:</span>
                        <span className="font-medium">
                          ₹{selectedFare.taxes?.reduce((sum, t) => sum + (t.amount || 0), 0).toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between font-bold text-blue-600 pt-1 border-t">
                        <span>Total:</span>
                        <span>₹{selectedFare.totalPrice?.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>

                  {/* Baggage & Cabin */}
                  <div>
                    <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                      Inclusions
                    </h4>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-center">
                        <svg className="w-4 h-4 text-gray-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                        </svg>
                        <span className="text-gray-600">Baggage:</span>
                        <span className="ml-2 font-medium">
                          {selectedFare.baggage?.pieces 
                            ? `${selectedFare.baggage.pieces} piece(s)` 
                            : `${selectedFare.baggage?.weight || 15}${selectedFare.baggage?.unit || 'kg'}`}
                        </span>
                      </li>
                      <li className="flex items-center">
                        <svg className="w-4 h-4 text-gray-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        <span className="text-gray-600">Cabin:</span>
                        <span className="ml-2 font-medium">{selectedFare.cabinClass || 'Economy'}</span>
                      </li>
                      <li className="flex items-center">
                        <svg className="w-4 h-4 text-gray-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span className="text-gray-600">Refundable:</span>
                        <span className={`ml-2 font-medium ${selectedFare.refundable ? 'text-green-600' : 'text-red-600'}`}>
                          {selectedFare.refundable ? 'Yes' : 'No'}
                        </span>
                      </li>
                    </ul>
                  </div>

                  {/* Amenities */}
                  <div>
                    <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                      Amenities
                    </h4>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-center">
                        {selectedFare.amenities?.meals ? (
                          <svg className="w-4 h-4 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                          </svg>
                        ) : (
                          <svg className="w-4 h-4 text-red-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        )}
                        <span className="text-gray-600">Meals</span>
                      </li>
                      <li className="flex items-center">
                        {selectedFare.amenities?.seatSelection ? (
                          <svg className="w-4 h-4 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                          </svg>
                        ) : (
                          <svg className="w-4 h-4 text-red-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        )}
                        <span className="text-gray-600">Seat Selection</span>
                      </li>
                      <li className="flex items-center">
                        {selectedFare.amenities?.changes ? (
                          <svg className="w-4 h-4 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                          </svg>
                        ) : (
                          <svg className="w-4 h-4 text-red-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        )}
                        <span className="text-gray-600">Free Changes</span>
                      </li>
                    </ul>
                  </div>

                  {/* Fare Features */}
                  <div>
                    <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                      Fare Highlights
                    </h4>
                    <ul className="space-y-1 text-xs">
                      {selectedFare.brand?.features?.slice(0, 3).map((feature, idx) => (
                        <li key={idx} className="flex items-start">
                          <span className="text-blue-500 mr-1">•</span>
                          <span className="text-gray-600 line-clamp-1">{feature}</span>
                        </li>
                      ))}
                      {(selectedFare.brand?.features?.length || 0) > 3 && (
                        <li className="text-blue-600 text-xs mt-1">
                          +{selectedFare.brand.features.length - 3} more
                        </li>
                      )}
                    </ul>
                  </div>
                </div>

                {/* Layover Information (if any) */}
                {flight.layovers?.length > 0 && (
                  <div className="mt-4 pt-3 border-t border-gray-200">
                    <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                      Layover Information
                    </h4>
                    <div className="flex flex-wrap gap-3">
                      {flight.layovers.map((layover, idx) => (
                        <div key={idx} className="text-sm bg-yellow-50 px-3 py-1 rounded-full">
                          <span className="text-yellow-700">
                            {layover.airport}: {layover.formattedDuration}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Book Button for Desktop */}
                <div className="mt-4 flex justify-end items-center space-x-3">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onViewDetails?.(flight);
                    }}
                    className="text-sm text-gray-600 hover:text-gray-800"
                  >
                    View Details
                  </button>
                  <button
                    onClick={(e) => handleBookNow(selectedFare, e)}
                    className="bg-blue-600 text-white px-8 py-2.5 rounded-lg hover:bg-blue-700 
                             transition font-medium shadow-md hover:shadow-lg"
                  >
                    Book Now · ₹{selectedFare.totalPrice?.toLocaleString()}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Single Fare Option (no multiple fares) */}
        {!hasMultipleFares && selectedFare && (
          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-4">
                <div className="text-3xl font-bold text-blue-600">
                  ₹{selectedFare.totalPrice?.toLocaleString()}
                </div>
                <div className="text-sm text-gray-500">
                  {selectedFare.baggage?.pieces 
                    ? `${selectedFare.baggage.pieces} piece(s)` 
                    : `${selectedFare.baggage?.weight || 15}${selectedFare.baggage?.unit || 'kg'}`}
                </div>
                <div className={`text-sm px-2 py-1 rounded-full ${selectedFare.refundable ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                  {selectedFare.refundable ? 'Refundable' : 'Non-refundable'}
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onViewDetails?.(flight);
                  }}
                  className="text-sm text-gray-600 hover:text-gray-800"
                >
                  View Details
                </button>
                <button
                  onClick={(e) => handleBookNow(selectedFare, e)}
                  className="bg-blue-600 text-white px-8 py-2.5 rounded-lg hover:bg-blue-700 transition"
                >
                  Book Now
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Fare Comparison Modal */}
      {showFareComparison && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={(e) => {
            e.stopPropagation();
            setShowFareComparison(false);
          }}
        >
          <div 
            className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-white border-b p-4 flex justify-between items-center">
              <h2 className="text-xl font-bold">Compare Fare Options</h2>
              <button
                onClick={() => setShowFareComparison(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="p-6">
              <div className="mb-4">
                <div className="font-semibold">{flight.airline} {flight.flightNumber}</div>
                <div className="text-sm text-gray-600">
                  {formatTime(flight.departureTime)} {flight.origin} → {formatTime(flight.arrivalTime)} {flight.destination}
                </div>
              </div>
              
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="p-3 text-left text-sm font-semibold text-gray-600">Features</th>
                    {flight.fares.map(fare => (
                      <th key={fare.id} className="p-3 text-center border-l">
                        <div className="font-bold text-gray-900">{fare.brand.name}</div>
                        <div className="text-lg font-bold text-blue-600">₹{fare.totalPrice?.toLocaleString()}</div>
                        {fare.isLowest && (
                          <span className="inline-block mt-1 text-xs bg-green-500 text-white px-2 py-0.5 rounded-full">
                            Best Price
                          </span>
                        )}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b">
                    <td className="p-3 font-medium text-gray-700">Baggage</td>
                    {flight.fares.map(fare => (
                      <td key={fare.id} className="p-3 text-center border-l">
                        {fare.baggage?.pieces 
                          ? `${fare.baggage.pieces} piece(s)` 
                          : `${fare.baggage?.weight || 15}${fare.baggage?.unit || 'kg'}`}
                      </td>
                    ))}
                  </tr>
                  <tr className="border-b">
                    <td className="p-3 font-medium text-gray-700">Cabin</td>
                    {flight.fares.map(fare => (
                      <td key={fare.id} className="p-3 text-center border-l">{fare.cabinClass || 'Economy'}</td>
                    ))}
                  </tr>
                  <tr className="border-b">
                    <td className="p-3 font-medium text-gray-700">Refundable</td>
                    {flight.fares.map(fare => (
                      <td key={fare.id} className="p-3 text-center border-l">
                        {fare.refundable ? '✓ Yes' : '✗ No'}
                      </td>
                    ))}
                  </tr>
                  <tr className="border-b">
                    <td className="p-3 font-medium text-gray-700">Meals</td>
                    {flight.fares.map(fare => (
                      <td key={fare.id} className="p-3 text-center border-l">
                        {fare.amenities?.meals ? '✓ Included' : '✗ Not included'}
                      </td>
                    ))}
                  </tr>
                  <tr className="border-b">
                    <td className="p-3 font-medium text-gray-700">Seat Selection</td>
                    {flight.fares.map(fare => (
                      <td key={fare.id} className="p-3 text-center border-l">
                        {fare.amenities?.seatSelection ? '✓ Free' : '✗ Paid'}
                      </td>
                    ))}
                  </tr>
                  <tr className="border-b">
                    <td className="p-3 font-medium text-gray-700">Change Fee</td>
                    {flight.fares.map(fare => (
                      <td key={fare.id} className="p-3 text-center border-l">
                        {fare.penalties?.change?.amount 
                          ? `₹${fare.penalties.change.amount}`
                          : fare.penalties?.change?.percentage
                          ? `${fare.penalties.change.percentage}%`
                          : 'Not allowed'}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="p-3 font-medium text-gray-700">Cancellation Fee</td>
                    {flight.fares.map(fare => (
                      <td key={fare.id} className="p-3 text-center border-l">
                        {fare.penalties?.cancel?.amount 
                          ? `₹${fare.penalties.cancel.amount}`
                          : fare.penalties?.cancel?.percentage
                          ? `${fare.penalties.cancel.percentage}%`
                          : 'Not allowed'}
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
              
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  onClick={() => setShowFareComparison(false)}
                  className="px-4 py-2 border rounded-lg hover:bg-gray-50"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    setShowFareComparison(false);
                    handleBookNow(flight.fares[selectedFareIndex], new Event('click'));
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Continue with {flight.fares[selectedFareIndex]?.brand.name}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OneWayFlightCard;