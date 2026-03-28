// src/modules/flights/pages/BookingReviewPage.jsx

import React, { useState } from 'react';
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
  FaMapMarkerAlt,
  FaCreditCard,
  FaCheckCircle,
  FaInfoCircle,
  FaRupeeSign,
  FaEnvelope,
  FaPhone,
  FaVenusMars,
  FaPassport,
  FaGlobe,
  FaTag,
  FaUtensils,
  FaChair,
  FaWifi,
  FaTv,
  FaStar,
  FaCrown,
  FaGem
} from 'react-icons/fa';

const BookingReviewPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { pricingResult, selectedFare, flight, passengerCounts, tripType } = location.state || {};

  const [activeTab, setActiveTab] = useState('fare-details');
  const [selectedPricingOption, setSelectedPricingOption] = useState(
    pricingResult?.selectedOption || pricingResult?.pricingOptions?.[0]
  );

  if (!pricingResult || !selectedFare || !flight) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center bg-white p-8 rounded-2xl shadow-lg max-w-md">
          <FaInfoCircle className="text-4xl text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-800 mb-2">No booking data found</h2>
          <p className="text-gray-600 mb-6">Please start your search again</p>
          <button
            onClick={() => navigate('/flights')}
            className="bg-[#FD561E] text-white px-6 py-3 rounded-lg hover:bg-[#e04e1b] transition-colors w-full"
          >
            Go to Search
          </button>
        </div>
      </div>
    );
  }

  // Helper functions
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

  // Get brand icon based on name
  const getBrandIcon = (brandName) => {
    const name = brandName?.toLowerCase() || '';
    if (name.includes('business')) return <FaCrown className="text-amber-500" size={20} />;
    if (name.includes('first')) return <FaGem className="text-amber-500" size={20} />;
    if (name.includes('premium')) return <FaStar className="text-purple-500" size={20} />;
    return <FaTag className="text-[#FD561E]" size={20} />;
  };

  // Get baggage display
  const getBaggageDisplay = (baggage) => {
    if (typeof baggage === 'string') return baggage;
    if (baggage?.checked) return baggage.checked;
    return '15kg';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b sticky top-0 z-20">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center text-gray-600 hover:text-[#FD561E] transition-colors mr-4"
            >
              <FaArrowLeft className="mr-2" />
              <span className="hidden sm:inline">Back</span>
            </button>
            <h1 className="text-xl font-bold text-gray-800">Review Your Booking</h1>
          </div>
        </div>
        <div className="h-1 bg-gradient-to-r from-[#FD561E] to-[#ff7b4a]"></div>
      </div>

      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Left Column - Main Content */}
          <div className="lg:w-2/3 space-y-6">
            {/* Trace ID Info */}
            <div className="bg-blue-50 rounded-lg p-3 text-xs text-blue-700 flex items-center gap-2">
              <FaInfoCircle />
              <span>Trace ID: {pricingResult.traceId || 'N/A'}</span>
            </div>

            {/* Flight Summary Card */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="bg-gradient-to-r from-[#FD561E] to-[#ff7b4a] p-4 text-white">
                <div className="flex items-center gap-2">
                  <FaPlane className="rotate-45" />
                  <h2 className="font-semibold">Flight Summary</h2>
                </div>
              </div>
              <div className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                      <span className="font-bold text-gray-700 text-lg">{flight.airlineCode}</span>
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900">{flight.airline}</div>
                      <div className="text-sm text-gray-500">{flight.flightNumber}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-gray-500">Selected Fare</div>
                    <div className="font-semibold text-[#FD561E] flex items-center gap-1">
                      {getBrandIcon(selectedPricingOption?.brand?.name)}
                      <span>{selectedPricingOption?.brand?.name || selectedFare?.brand?.name || 'Economy'}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="text-center flex-1">
                    <div className="text-2xl font-bold">{formatTime(flight.departureTime)}</div>
                    <div className="text-sm font-medium text-gray-700">{flight.origin}</div>
                    <div className="text-xs text-gray-400">{formatDate(flight.departureTime)}</div>
                    {flight.originTerminal && (
                      <div className="text-xs font-medium text-[#FD561E] mt-1">Terminal {flight.originTerminal}</div>
                    )}
                  </div>

                  <div className="flex-1 px-4">
                    <div className="text-xs text-gray-500 text-center mb-1 flex items-center justify-center">
                      <FaClock className="mr-1" size={10} />
                      {formatDuration(flight.duration)}
                    </div>
                    <div className="relative flex items-center justify-center">
                      <div className="w-full h-0.5 bg-gray-300"></div>
                      <FaPlane className="absolute text-[#FD561E] transform rotate-90" size={12} />
                    </div>
                    <div className="text-xs text-gray-500 text-center mt-1">
                      {flight.stops === 0 ? 'Direct' : `${flight.stops} stop${flight.stops > 1 ? 's' : ''}`}
                    </div>
                  </div>

                  <div className="text-center flex-1">
                    <div className="text-2xl font-bold">{formatTime(flight.arrivalTime)}</div>
                    <div className="text-sm font-medium text-gray-700">{flight.destination}</div>
                    <div className="text-xs text-gray-400">{formatDate(flight.arrivalTime)}</div>
                    {flight.destinationTerminal && (
                      <div className="text-xs font-medium text-[#FD561E] mt-1">Terminal {flight.destinationTerminal}</div>
                    )}
                  </div>
                </div>

                {/* Connecting flight details if any */}
                {flight.segments?.length > 1 && (
                  <div className="mt-4 pt-4 border-t">
                    <div className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                      <FaInfoCircle className="text-[#FD561E]" size={14} />
                      Connecting Flight Details
                    </div>
                    {flight.segments.map((segment, idx) => (
                      <div key={idx} className="text-sm text-gray-600 mb-2 flex flex-wrap items-center gap-2">
                        <span className="font-medium">{segment.origin}</span>
                        <FaArrowRight className="text-xs text-[#FD561E]" />
                        <span className="font-medium">{segment.destination}</span>
                        <span className="text-xs text-gray-400 ml-2">
                          {formatTime(segment.departureTime)} - {formatTime(segment.arrivalTime)}
                        </span>
                        {segment.originTerminal && (
                          <span className="text-xs bg-gray-100 px-2 py-0.5 rounded">T{segment.originTerminal}</span>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Multiple Pricing Options */}
            {pricingResult.pricingOptions?.length > 1 && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="bg-gray-50 p-4 border-b">
                  <h2 className="font-semibold text-gray-800 flex items-center gap-2">
                    <FaTag className="text-[#FD561E]" />
                    Available Fare Options ({pricingResult.pricingOptions.length})
                  </h2>
                </div>
                <div className="p-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {pricingResult.pricingOptions.map((option, idx) => (
                      <div
                        key={option.key || idx}
                        onClick={() => setSelectedPricingOption(option)}
                        className={`border rounded-xl p-4 cursor-pointer transition-all ${
                          selectedPricingOption?.key === option.key
                            ? 'border-[#FD561E] ring-2 ring-[#FD561E] ring-opacity-20 bg-orange-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            {getBrandIcon(option.brand?.name)}
                            <span className="font-semibold">{option.brand?.name || 'Economy'}</span>
                          </div>
                          {idx === 0 && (
                            <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                              Best Price
                            </span>
                          )}
                        </div>
                        <div className="flex justify-between items-center">
                          <div>
                            <div className="text-sm text-gray-600">Fare Basis</div>
                            <div className="font-mono text-xs">{option.fareInfo?.fareBasis}</div>
                          </div>
                          <div className="text-right">
                            <div className="text-sm text-gray-600">Total</div>
                            <div className="text-xl font-bold text-[#FD561E]">
                              ₹{option.totalPrice.toLocaleString()}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Fare Details Tabs */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="border-b">
                <div className="flex">
                  <button
                    onClick={() => setActiveTab('fare-details')}
                    className={`flex-1 py-3 text-center font-medium transition-colors ${
                      activeTab === 'fare-details'
                        ? 'text-[#FD561E] border-b-2 border-[#FD561E]'
                        : 'text-gray-600 hover:text-gray-800'
                    }`}
                  >
                    Fare Details
                  </button>
                  <button
                    onClick={() => setActiveTab('fare-rules')}
                    className={`flex-1 py-3 text-center font-medium transition-colors ${
                      activeTab === 'fare-rules'
                        ? 'text-[#FD561E] border-b-2 border-[#FD561E]'
                        : 'text-gray-600 hover:text-gray-800'
                    }`}
                  >
                    Fare Rules
                  </button>
                  <button
                    onClick={() => setActiveTab('baggage')}
                    className={`flex-1 py-3 text-center font-medium transition-colors ${
                      activeTab === 'baggage'
                        ? 'text-[#FD561E] border-b-2 border-[#FD561E]'
                        : 'text-gray-600 hover:text-gray-800'
                    }`}
                  >
                    Baggage & Amenities
                  </button>
                </div>
              </div>

              <div className="p-4">
                {activeTab === 'fare-details' && (
                  <div className="space-y-4">
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h3 className="font-medium text-gray-700 mb-3">Price Breakdown</h3>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Base Fare</span>
                          <span className="font-medium">₹{selectedPricingOption.basePrice.toLocaleString()}</span>
                        </div>
                        {selectedPricingOption.taxBreakdown?.map((tax, idx) => (
                          <div key={idx} className="flex justify-between text-sm">
                            <span className="text-gray-600">{tax.category} Tax</span>
                            <span className="font-medium">₹{tax.amount.toLocaleString()}</span>
                          </div>
                        ))}
                        {selectedPricingOption.feeInfo && (
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">{selectedPricingOption.feeInfo.description}</span>
                            <span className="font-medium">₹{selectedPricingOption.feeInfo.amount.toLocaleString()}</span>
                          </div>
                        )}
                        <div className="flex justify-between font-bold pt-2 border-t border-gray-200 mt-2">
                          <span>Total</span>
                          <span className="text-[#FD561E] text-lg">₹{selectedPricingOption.totalPrice.toLocaleString()}</span>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-gray-50 rounded-lg p-3">
                        <div className="text-xs text-gray-500 mb-1">Fare Basis</div>
                        <div className="font-mono text-sm font-medium">{selectedPricingOption.fareInfo?.fareBasis}</div>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-3">
                        <div className="text-xs text-gray-500 mb-1">Booking Class</div>
                        <div className="font-mono text-sm font-medium">{selectedPricingOption.bookingInfo?.bookingCode}</div>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-3">
                        <div className="text-xs text-gray-500 mb-1">Cabin Class</div>
                        <div className="text-sm font-medium">{selectedPricingOption.bookingInfo?.cabinClass || 'Economy'}</div>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-3">
                        <div className="text-xs text-gray-500 mb-1">Refundable</div>
                        <div className={`text-sm font-medium ${selectedPricingOption.refundable ? 'text-green-600' : 'text-red-600'}`}>
                          {selectedPricingOption.refundable ? 'Yes' : 'No'}
                        </div>
                      </div>
                    </div>

                    {selectedPricingOption.fareNotes?.length > 0 && (
                      <div className="bg-yellow-50 rounded-lg p-3">
                        <div className="text-xs font-medium text-yellow-700 mb-1">Fare Notes</div>
                        {selectedPricingOption.fareNotes.map((note, idx) => (
                          <p key={idx} className="text-xs text-yellow-600 mb-1">• {note}</p>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'fare-rules' && (
                  <div className="space-y-4">
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h3 className="font-medium text-gray-700 mb-3 flex items-center gap-2">
                        <FaExchangeAlt className="text-[#FD561E]" size={16} />
                        Change Policy
                      </h3>
                      {selectedPricingOption.penalties?.change ? (
                        <div className="space-y-2">
                          <p className="text-sm text-gray-600">
                            {selectedPricingOption.penalties.change.amount 
                              ? `Change Fee: ₹${selectedPricingOption.penalties.change.amount.toLocaleString()}`
                              : selectedPricingOption.penalties.change.percentage
                              ? `Change Fee: ${selectedPricingOption.penalties.change.percentage}`
                              : 'Changes not permitted'}
                          </p>
                          {selectedPricingOption.penalties.change.noShow && (
                            <p className="text-xs text-red-500">No-show charges apply</p>
                          )}
                          {selectedPricingOption.penalties.change.applies && (
                            <p className="text-xs text-gray-500">Applies: {selectedPricingOption.penalties.change.applies}</p>
                          )}
                        </div>
                      ) : (
                        <p className="text-sm text-gray-600">No change penalty information available</p>
                      )}
                    </div>

                    <div className="bg-gray-50 rounded-lg p-4">
                      <h3 className="font-medium text-gray-700 mb-3 flex items-center gap-2">
                        <FaShieldAlt className="text-[#FD561E]" size={16} />
                        Cancellation Policy
                      </h3>
                      {selectedPricingOption.penalties?.cancel ? (
                        <div className="space-y-2">
                          <p className="text-sm text-gray-600">
                            {selectedPricingOption.penalties.cancel.amount 
                              ? `Cancellation Fee: ₹${selectedPricingOption.penalties.cancel.amount.toLocaleString()}`
                              : selectedPricingOption.penalties.cancel.percentage
                              ? `Cancellation Fee: ${selectedPricingOption.penalties.cancel.percentage}`
                              : selectedPricingOption.refundable 
                                ? 'Refundable with applicable fees'
                                : 'Non-refundable'}
                          </p>
                          {selectedPricingOption.penalties.cancel.noShow && (
                            <p className="text-xs text-red-500">No-show charges apply</p>
                          )}
                          {selectedPricingOption.penalties.cancel.applies && (
                            <p className="text-xs text-gray-500">Applies: {selectedPricingOption.penalties.cancel.applies}</p>
                          )}
                        </div>
                      ) : (
                        <p className="text-sm text-gray-600">No cancellation penalty information available</p>
                      )}
                    </div>

                    {selectedPricingOption.fareCalc && (
                      <div className="bg-gray-50 rounded-lg p-3">
                        <div className="text-xs text-gray-500 mb-1">Fare Calculation</div>
                        <p className="text-xs font-mono">{selectedPricingOption.fareCalc}</p>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'baggage' && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-green-50 rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <FaSuitcase className="text-green-600" size={20} />
                          <h3 className="font-medium text-gray-700">Check-in Baggage</h3>
                        </div>
                        <p className="text-2xl font-bold text-gray-800">{getBaggageDisplay(selectedPricingOption.baggage)}</p>
                      </div>

                      <div className="bg-blue-50 rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <FaSuitcase className="text-blue-600" size={20} />
                          <h3 className="font-medium text-gray-700">Cabin Baggage</h3>
                        </div>
                        <p className="text-2xl font-bold text-gray-800">
                          {selectedPricingOption.baggage?.cabin || '7kg'}
                        </p>
                      </div>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-4">
                      <h3 className="font-medium text-gray-700 mb-3">Amenities</h3>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        <div className="flex items-center gap-2">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                            selectedPricingOption.brand?.name?.toLowerCase().includes('flex') ? 'bg-green-100' : 'bg-gray-200'
                          }`}>
                            <FaUtensils className={selectedPricingOption.brand?.name?.toLowerCase().includes('flex') ? 'text-green-600' : 'text-gray-500'} size={16} />
                          </div>
                          <span className="text-sm text-gray-600">Meals</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                            selectedPricingOption.brand?.name?.toLowerCase().includes('flex') ? 'bg-green-100' : 'bg-gray-200'
                          }`}>
                            <FaChair className={selectedPricingOption.brand?.name?.toLowerCase().includes('flex') ? 'text-green-600' : 'text-gray-500'} size={16} />
                          </div>
                          <span className="text-sm text-gray-600">Seat Selection</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-lg bg-gray-200 flex items-center justify-center">
                            <FaWifi className="text-gray-500" size={16} />
                          </div>
                          <span className="text-sm text-gray-600">Wi-Fi</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center">
                            <FaTv className="text-green-600" size={16} />
                          </div>
                          <span className="text-sm text-gray-600">Entertainment</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column - Price Summary */}
          <div className="lg:w-1/3">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 sticky top-24">
              <div className="bg-gradient-to-r from-[#FD561E] to-[#ff7b4a] p-4 text-white rounded-t-xl">
                <h2 className="font-semibold flex items-center gap-2">
                  <FaRupeeSign />
                  Price Summary
                </h2>
              </div>
              
              <div className="p-4 space-y-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Base Fare</span>
                  <span className="font-medium">₹{selectedPricingOption.basePrice.toLocaleString()}</span>
                </div>
                
                {selectedPricingOption.taxBreakdown?.map((tax, idx) => (
                  <div key={idx} className="flex justify-between text-sm">
                    <span className="text-gray-600">{tax.category} Tax</span>
                    <span className="font-medium">₹{tax.amount.toLocaleString()}</span>
                  </div>
                ))}
                
                {selectedPricingOption.feeInfo && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">{selectedPricingOption.feeInfo.description}</span>
                    <span className="font-medium">₹{selectedPricingOption.feeInfo.amount.toLocaleString()}</span>
                  </div>
                )}
                
                <div className="border-t pt-3">
                  <div className="flex justify-between font-bold text-lg">
                    <span>Total</span>
                    <span className="text-[#FD561E]">₹{selectedPricingOption.totalPrice.toLocaleString()}</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Inclusive of all taxes</p>
                </div>

                <div className="bg-blue-50 rounded-lg p-3 text-sm">
                  <div className="flex items-start gap-2">
                    <FaInfoCircle className="text-blue-500 mt-0.5 flex-shrink-0" />
                    <p className="text-gray-600">
                      By proceeding, you agree to our <span className="text-[#FD561E] cursor-pointer hover:underline">terms and conditions</span> and <span className="text-[#FD561E] cursor-pointer hover:underline">privacy policy</span>.
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => navigate('/flights/booking/payment', { 
                    state: { 
                      pricingResult,
                      selectedPricingOption,
                      flight,
                      passengerCounts
                    } 
                  })}
                  className="w-full bg-[#FD561E] hover:bg-[#e04e1b] text-white font-semibold py-4 px-4 rounded-xl transition-colors flex items-center justify-center gap-2"
                >
                  <FaCreditCard />
                  Proceed to Payment
                </button>

                <div className="flex items-center justify-center gap-2 text-xs text-gray-500">
                  <FaCheckCircle className="text-green-500" />
                  <span>Secure & Encrypted</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingReviewPage;