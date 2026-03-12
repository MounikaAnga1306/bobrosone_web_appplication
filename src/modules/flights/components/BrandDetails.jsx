// src/components/flights/BrandDetails.jsx

import React, { useState } from 'react';
import { 
  FaChevronDown, 
  FaChevronUp, 
  FaSuitcase, 
  FaUtensils, 
  FaChair, 
  FaExchangeAlt, 
  FaTimesCircle,
  FaCheckCircle,
  FaInfoCircle,
  FaCrown,
  FaClock,
  FaShieldAlt
} from 'react-icons/fa';

const BrandDetails = ({ brand, fare, passengerCounts }) => {
  const [expanded, setExpanded] = useState(false);

  if (!brand || brand.name === 'Economy' || brand.name === 'ECO VALUE') {
    // Simple display for basic economy
    return (
      <div className="border border-gray-200 rounded-xl overflow-hidden">
        <div className="bg-gray-50 p-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="font-bold text-lg text-gray-800">{brand?.name || 'Economy'}</h3>
              <p className="text-sm text-gray-500 mt-1">Standard fare with basic amenities</p>
            </div>
            {fare && (
              <div className="text-right">
                <div className="text-xl font-bold text-[#FD561E]">₹{fare.price.toLocaleString()}</div>
                <div className="text-xs text-gray-500">Total for {passengerCounts?.adults || 1} Adult</div>
              </div>
            )}
          </div>
        </div>
        
        <div className="p-4 bg-white">
          <div className="grid grid-cols-2 gap-3">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <FaSuitcase className="text-[#FD561E]" />
              <span>{fare?.baggage?.weight || '15'}kg Check-in</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <FaSuitcase className="text-[#FD561E]" />
              <span>7kg Cabin</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <FaTimesCircle className="text-gray-400" />
              <span>No meals</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <FaTimesCircle className="text-gray-400" />
              <span>No seat selection</span>
            </div>
          </div>
          
          <div className="mt-3 text-xs text-gray-400 flex items-center">
            <FaInfoCircle className="mr-1" />
            <span>Non-refundable • Changes not permitted</span>
          </div>
        </div>
      </div>
    );
  }

  // Parse features from brand text
  const parseFeatures = () => {
    const features = [];
    
    // Add baggage from fare data
    if (fare?.baggage) {
      features.push({
        icon: <FaSuitcase className="text-[#FD561E]" />,
        text: `${fare.baggage.weight}kg Check-in baggage`
      });
    }
    
    // Always add cabin baggage
    features.push({
      icon: <FaSuitcase className="text-[#FD561E]" />,
      text: '7kg Cabin baggage'
    });
    
    // Check for premium features in brand name
    if (brand.name.toLowerCase().includes('flexi') || brand.name.toLowerCase().includes('plus')) {
      features.push({
        icon: <FaUtensils className="text-[#FD561E]" />,
        text: 'Complimentary meals'
      });
      features.push({
        icon: <FaChair className="text-[#FD561E]" />,
        text: 'Free seat selection'
      });
      features.push({
        icon: <FaExchangeAlt className="text-[#FD561E]" />,
        text: 'Free date changes'
      });
      features.push({
        icon: <FaShieldAlt className="text-[#FD561E]" />,
        text: 'Lower cancellation fee'
      });
    }
    
    if (brand.name.toLowerCase().includes('stretch')) {
      features.push({
        icon: <FaCrown className="text-[#FD561E]" />,
        text: 'Extra legroom seats'
      });
      features.push({
        icon: <FaUtensils className="text-[#FD561E]" />,
        text: 'Premium meals included'
      });
    }
    
    if (brand.name.toLowerCase().includes('upfront')) {
      features.push({
        icon: <FaChair className="text-[#FD561E]" />,
        text: 'Front row seats'
      });
      features.push({
        icon: <FaCrown className="text-[#FD561E]" />,
        text: 'Extra legroom'
      });
    }
    
    return features;
  };

  // Parse cancellation policy from brand description
  const getCancellationPolicy = () => {
    if (brand.name.toLowerCase().includes('flexi')) {
      return {
        before: 'Before 4 days: No fee',
        within: '0-3 days: Up to ₹3,000',
        noShow: 'No-show: 100% charge'
      };
    }
    if (brand.name.toLowerCase().includes('upfront')) {
      return {
        before: 'Before 72 hours: No fee',
        within: 'Within 72 hours: ₹299',
        noShow: 'No-show: Full fare'
      };
    }
    return {
      before: 'Before 24 hours: ₹2,500',
      within: 'Within 24 hours: Non-refundable',
      noShow: 'No-show: 100% charge'
    };
  };

  // Parse change policy from brand description
  const getChangePolicy = () => {
    if (brand.name.toLowerCase().includes('flexi')) {
      return {
        before: 'Before 4 days: No fee',
        within: '0-3 days: Up to ₹3,000',
        sameDay: 'Same day: Not permitted'
      };
    }
    if (brand.name.toLowerCase().includes('upfront')) {
      return {
        before: 'Before 72 hours: No fee',
        within: 'Within 72 hours: ₹299',
        sameDay: 'Same day: ₹999'
      };
    }
    return {
      before: 'Before 24 hours: ₹1,500',
      within: 'Within 24 hours: Not permitted',
      sameDay: 'Same day: Not permitted'
    };
  };

  const features = parseFeatures();
  const cancellationPolicy = getCancellationPolicy();
  const changePolicy = getChangePolicy();

  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden">
      {/* Header - Always visible */}
      <div 
        className={`p-4 cursor-pointer transition-colors ${
          expanded ? 'bg-gradient-to-r from-[#FD561E]/10 to-[#ff7b4a]/10' : 'bg-gray-50'
        }`}
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex justify-between items-center">
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-lg text-gray-800">{brand.name}</h3>
              {brand.name.toLowerCase().includes('flexi') && (
                <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full">
                  Best Value
                </span>
              )}
              {brand.name.toLowerCase().includes('upfront') && (
                <span className="bg-purple-100 text-purple-700 text-xs px-2 py-1 rounded-full">
                  Extra Legroom
                </span>
              )}
            </div>
            {brand.upsell && (
              <p className="text-sm text-[#FD561E] mt-1">{brand.upsell}</p>
            )}
            {!brand.upsell && brand.description && (
              <p className="text-sm text-gray-600 mt-1 line-clamp-1">{brand.description.substring(0, 60)}...</p>
            )}
          </div>
          
          <div className="flex items-center gap-4">
            {fare && (
              <div className="text-right">
                <div className="text-xl font-bold text-[#FD561E]">₹{fare.price.toLocaleString()}</div>
                <div className="text-xs text-gray-500">total</div>
              </div>
            )}
            <button className="p-2 hover:bg-white rounded-full transition-colors">
              {expanded ? <FaChevronUp className="text-[#FD561E]" /> : <FaChevronDown className="text-[#FD561E]" />}
            </button>
          </div>
        </div>
      </div>

      {/* Expanded Content */}
      {expanded && (
        <div className="p-4 bg-white">
          {/* Features Grid */}
          {features.length > 0 && (
            <div className="grid grid-cols-2 gap-3 mb-4">
              {features.map((feature, idx) => (
                <div key={idx} className="flex items-center gap-2 text-sm text-gray-700">
                  {feature.icon}
                  <span>{feature.text}</span>
                </div>
              ))}
            </div>
          )}

          {/* Policy Sections */}
          <div className="space-y-3 mt-4 pt-4 border-t border-gray-100">
            {/* Cancellation Policy */}
            <div className="bg-red-50 p-3 rounded-lg">
              <h4 className="font-semibold text-gray-800 mb-2 flex items-center">
                <FaTimesCircle className="text-red-500 mr-2" />
                Cancellation Policy
              </h4>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">{cancellationPolicy.before.split(':')[0]}:</span>
                  <span className="font-medium text-gray-800">{cancellationPolicy.before.split(':')[1]}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">{cancellationPolicy.within.split(':')[0]}:</span>
                  <span className="font-medium text-gray-800">{cancellationPolicy.within.split(':')[1]}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">No-show:</span>
                  <span className="font-medium text-gray-800">{cancellationPolicy.noShow}</span>
                </div>
              </div>
            </div>

            {/* Date Change Policy */}
            <div className="bg-blue-50 p-3 rounded-lg">
              <h4 className="font-semibold text-gray-800 mb-2 flex items-center">
                <FaExchangeAlt className="text-blue-500 mr-2" />
                Date Change Policy
              </h4>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">{changePolicy.before.split(':')[0]}:</span>
                  <span className="font-medium text-gray-800">{changePolicy.before.split(':')[1]}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">{changePolicy.within.split(':')[0]}:</span>
                  <span className="font-medium text-gray-800">{changePolicy.within.split(':')[1]}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Same day:</span>
                  <span className="font-medium text-gray-800">{changePolicy.sameDay}</span>
                </div>
              </div>
            </div>

            {/* Baggage Details */}
            <div className="bg-green-50 p-3 rounded-lg">
              <h4 className="font-semibold text-gray-800 mb-2 flex items-center">
                <FaSuitcase className="text-green-500 mr-2" />
                Baggage Allowance
              </h4>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <div className="text-xs text-gray-500">Check-in</div>
                  <div className="font-medium text-gray-800">{fare?.baggage?.weight || '15'}kg</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500">Cabin</div>
                  <div className="font-medium text-gray-800">7kg</div>
                </div>
              </div>
            </div>
          </div>

          {/* Full Description (if available) */}
          {brand.description && brand.description.length > 100 && (
            <div className="mt-4 pt-4 border-t border-gray-100">
              <details className="text-sm">
                <summary className="text-[#FD561E] font-medium cursor-pointer hover:text-[#e04e1b]">
                  Read full fare details
                </summary>
                <div className="mt-3 p-3 bg-gray-50 rounded-lg text-gray-600 whitespace-pre-line">
                  {brand.description}
                </div>
              </details>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default BrandDetails;