// src/components/flights/FlightDetailView.jsx

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFlightSearchContext } from '../../modules/flights/contexts/FlightSearchContext';
import FareOption from './FareOption';
import FareRulesModal from './FareRulesModal';
import {
  FaArrowLeft,
  FaClock,
  FaCalendarAlt,
  FaMapMarkerAlt,
  FaPlane,
  FaSuitcase,
  FaUtensils,
  FaChair,
  FaExchangeAlt,
  FaShieldAlt,
  FaInfoCircle,
  FaChevronDown,
  FaChevronUp
} from 'react-icons/fa';

const FlightDetailView = () => {
  const navigate = useNavigate();
  const { 
    selectedFlight, 
    selectedFare, 
    backToList,
    getSearchSummary 
  } = useFlightSearchContext();

  const [expandedSection, setExpandedSection] = useState('fare-selection');
  const [showFareRules, setShowFareRules] = useState(false);
  const [selectedFareForRules, setSelectedFareForRules] = useState(null);

  // If no flight selected, go back
  if (!selectedFlight || !selectedFlight.flight) {
    navigate('/flights/results');
    return null;
  }

  const flight = selectedFlight.flight;
  const currentFare = selectedFare || flight.fares?.[0];
  const searchSummary = getSearchSummary();

  // Format date for display
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  // Toggle section expansion
  const toggleSection = (section) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  // Handle view fare rules
  const handleViewFareRules = (fare) => {
    setSelectedFareForRules(fare);
    setShowFareRules(true);
  };

  // Handle continue to booking
  const handleContinue = () => {
    console.log('Continue with fare:', currentFare);
    // Navigate to passenger details / checkout
    // navigate('/flights/checkout');
    alert('Proceed to booking flow - to be implemented');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b sticky top-0 z-20">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <button
              onClick={backToList}
              className="flex items-center text-gray-600 hover:text-[#FD561E] transition-colors font-medium group"
            >
              <FaArrowLeft className="mr-2 group-hover:text-[#FD561E] transition-colors" />
              Back to Results
            </button>

            <div className="text-center">
              <h1 className="text-xl font-bold text-gray-800">Select Your Fare</h1>
              <p className="text-sm text-gray-500 mt-1">
                {searchSummary?.route} • {searchSummary?.formattedDate}
              </p>
            </div>

            <div className="w-24">
              {/* Empty div for spacing */}
            </div>
          </div>
        </div>
        <div className="h-1 bg-gradient-to-r from-[#FD561E] to-[#ff7b4a] w-full"></div>
      </div>

      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Left Column - Flight Details */}
          <div className="lg:w-2/3">
            {/* Flight Summary Card */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-gray-800 flex items-center">
                  <FaPlane className="mr-2 text-[#FD561E]" />
                  Flight Details
                </h2>
                <span className="text-sm bg-gray-100 text-gray-600 px-3 py-1 rounded-full">
                  {flight.airline} • {flight.flightNumber}
                </span>
              </div>

              {/* Route Visualization */}
              <div className="flex items-center justify-between mb-8 px-4">
                <div className="text-center flex-1">
                  <div className="text-3xl font-bold text-gray-900">{flight.departureTime}</div>
                  <div className="text-sm text-gray-600 mt-1 flex items-center justify-center">
                    <FaMapMarkerAlt className="mr-1 text-[#FD561E]" />
                    {flight.from}
                  </div>
                </div>

                <div className="flex-2 px-8 text-center">
                  <div className="text-sm text-gray-600 mb-2 flex items-center justify-center">
                    <FaClock className="mr-1 text-gray-400" />
                    {flight.duration}
                  </div>
                  <div className="relative">
                    <div className="flex items-center">
                      <div className="w-2 h-2 bg-[#FD561E] rounded-full"></div>
                      <div className="flex-1 h-0.5 bg-gray-300 mx-2"></div>
                      <div className="w-2 h-2 bg-[#FD561E] rounded-full"></div>
                    </div>
                  </div>
                  <div className="text-xs text-gray-500 mt-2">
                    {flight.stops === 0 ? 'Non-stop' : `${flight.stops} stop${flight.stops > 1 ? 's' : ''}`}
                  </div>
                </div>

                <div className="text-center flex-1">
                  <div className="text-3xl font-bold text-gray-900">{flight.arrivalTime}</div>
                  <div className="text-sm text-gray-600 mt-1 flex items-center justify-center">
                    <FaMapMarkerAlt className="mr-1 text-[#FD561E]" />
                    {flight.to}
                  </div>
                </div>
              </div>

              {/* Date and Aircraft Info */}
              <div className="grid grid-cols-2 gap-4 mb-4 p-4 bg-gray-50 rounded-lg">
                <div>
                  <div className="text-xs text-gray-500 mb-1">Departure Date</div>
                  <div className="font-medium text-gray-800 flex items-center">
                    <FaCalendarAlt className="mr-2 text-[#FD561E]" />
                    {formatDate(flight.departureTime)}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-gray-500 mb-1">Aircraft</div>
                  <div className="font-medium text-gray-800">
                    {flight.aircraft || 'Airbus A320'}
                  </div>
                </div>
              </div>

              {/* Expandable Sections */}
              <div className="space-y-3">
                {/* Baggage Info */}
                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  <button
                    onClick={() => toggleSection('baggage')}
                    className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center">
                      <FaSuitcase className="text-[#FD561E] mr-2" />
                      <span className="font-medium text-gray-800">Baggage Information</span>
                    </div>
                    {expandedSection === 'baggage' ? <FaChevronUp /> : <FaChevronDown />}
                  </button>
                  {expandedSection === 'baggage' && (
                    <div className="p-4 bg-white">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="text-center p-3 bg-gray-50 rounded-lg">
                          <div className="text-sm text-gray-500 mb-1">Cabin</div>
                          <div className="font-bold text-gray-800">{currentFare?.baggage?.cabin || '7 kg'}</div>
                        </div>
                        <div className="text-center p-3 bg-gray-50 rounded-lg">
                          <div className="text-sm text-gray-500 mb-1">Check-in</div>
                          <div className="font-bold text-gray-800">{currentFare?.baggage?.checkIn || '15 kg'}</div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Fare Rules Summary */}
                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  <button
                    onClick={() => toggleSection('rules')}
                    className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center">
                      <FaShieldAlt className="text-[#FD561E] mr-2" />
                      <span className="font-medium text-gray-800">Fare Rules</span>
                    </div>
                    {expandedSection === 'rules' ? <FaChevronUp /> : <FaChevronDown />}
                  </button>
                  {expandedSection === 'rules' && (
                    <div className="p-4 bg-white">
                      <div className="space-y-3">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Cancellation:</span>
                          <span className="font-medium text-gray-800">
                            {currentFare?.refundable ? 'Refundable' : 'Non-refundable'}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Date Change:</span>
                          <span className="font-medium text-gray-800">
                            {currentFare?.amenities?.changes ? 'Free changes' : 'Changes not allowed'}
                          </span>
                        </div>
                        <button
                          onClick={() => handleViewFareRules(currentFare)}
                          className="w-full mt-2 text-sm text-[#FD561E] hover:text-[#e04e1b] font-medium flex items-center justify-center"
                        >
                          <FaInfoCircle className="mr-1" />
                          View detailed fare rules
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Fare Selection Section */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                <span className="w-1 h-6 bg-[#FD561E] rounded-full mr-2"></span>
                Select Your Fare
              </h2>
              <p className="text-sm text-gray-600 mb-6">
                Choose the fare that best suits your needs. All prices shown are total for {searchSummary?.passengerText}.
              </p>

              <div className="space-y-4">
                {flight.fares?.map((fare, index) => (
                  <FareOption
                    key={fare.id}
                    fare={fare}
                    isLowest={fare.isLowest}
                    isSelected={currentFare?.id === fare.id}
                    passengerCounts={searchSummary?.passengerCounts}
                    onSelect={() => {
                      // Update selected fare in context
                      // This would need to be added to context
                      console.log('Selected fare:', fare);
                    }}
                    onViewRules={() => handleViewFareRules(fare)}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Right Column - Price Summary & Checkout */}
          <div className="lg:w-1/3">
            <div className="sticky top-24 space-y-6">
              {/* Price Summary Card */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="font-bold text-gray-800 mb-4">Price Summary</h3>
                
                <div className="space-y-3 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Base Fare</span>
                    <span className="font-medium text-gray-800">
                      ₹{(currentFare?.basePrice ? parseInt(currentFare.basePrice.replace(/[^0-9]/g, '')) : flight.price).toLocaleString()}
                    </span>
                  </div>
                  
                  {currentFare?.taxes?.map((tax, index) => (
                    <div key={index} className="flex justify-between text-sm">
                      <span className="text-gray-600">{tax.description || `Tax (${tax.category})`}</span>
                      <span className="font-medium text-gray-800">₹{tax.amount.toLocaleString()}</span>
                    </div>
                  ))}
                  
                  <div className="border-t border-gray-200 my-3 pt-3">
                    <div className="flex justify-between">
                      <span className="font-bold text-gray-800">Total</span>
                      <span className="font-bold text-[#FD561E] text-xl">
                        ₹{flight.price.toLocaleString()}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1 text-right">
                      For {searchSummary?.passengerText}
                    </p>
                  </div>
                </div>

                {/* Selected Fare Badge */}
                {currentFare?.brand?.name && currentFare.brand.name !== 'Economy' && (
                  <div className="mb-4 p-3 bg-gradient-to-r from-[#FD561E]/10 to-[#ff7b4a]/10 rounded-lg">
                    <div className="text-xs text-gray-600 mb-1">Selected Fare</div>
                    <div className="font-bold text-[#FD561E]">{currentFare.brand.name}</div>
                    {currentFare.brand.description && (
                      <p className="text-xs text-gray-500 mt-1">{currentFare.brand.description}</p>
                    )}
                  </div>
                )}

                {/* Amenities Summary */}
                <div className="mb-6">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Included in this fare:</h4>
                  <div className="grid grid-cols-2 gap-2">
                    {currentFare?.baggage && (
                      <div className="flex items-center text-xs text-gray-600">
                        <FaSuitcase className="mr-1 text-green-500" />
                        {currentFare.baggage.weight}kg baggage
                      </div>
                    )}
                    {currentFare?.amenities?.meals && (
                      <div className="flex items-center text-xs text-gray-600">
                        <FaUtensils className="mr-1 text-green-500" />
                        Meals
                      </div>
                    )}
                    {currentFare?.amenities?.seatSelection && (
                      <div className="flex items-center text-xs text-gray-600">
                        <FaChair className="mr-1 text-green-500" />
                        Seat selection
                      </div>
                    )}
                    {currentFare?.amenities?.changes && (
                      <div className="flex items-center text-xs text-gray-600">
                        <FaExchangeAlt className="mr-1 text-green-500" />
                        Free changes
                      </div>
                    )}
                  </div>
                </div>

                {/* Continue Button */}
                <button
                  onClick={handleContinue}
                  className="w-full bg-[#FD561E] hover:bg-[#e04e1b] text-white font-bold py-4 px-6 rounded-lg transition-colors duration-200 shadow-md hover:shadow-lg mb-3"
                >
                  Continue
                </button>

                <p className="text-xs text-gray-500 text-center">
                  By continuing, you agree to our Terms of Service
                </p>
              </div>

              {/* Need Help Card */}
              <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl border border-blue-100 p-5">
                <h4 className="font-bold text-gray-800 mb-2 flex items-center">
                  <FaInfoCircle className="mr-2 text-blue-500" />
                  Need Help?
                </h4>
                <p className="text-sm text-gray-600 mb-3">
                  Have questions about fares or baggage? Our support team is here 24/7.
                </p>
                <button className="text-sm font-medium text-[#FD561E] hover:text-[#e04e1b] transition-colors">
                  Contact Support →
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Fare Rules Modal */}
      {showFareRules && selectedFareForRules && (
        <FareRulesModal
          fare={selectedFareForRules}
          flight={flight}
          onClose={() => {
            setShowFareRules(false);
            setSelectedFareForRules(null);
          }}
        />
      )}
    </div>
  );
};

export default FlightDetailView;