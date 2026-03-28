// src/modules/flights/components/flight/MultiCityFlightCard.jsx
import React from 'react';
import BaseFlightCard from './BaseFlightCard';

const MultiCityFlightCard = ({ 
  flight, 
  isSelected, 
  onSelect, 
  onViewDetails,
  legIndex 
}) => {
  return (
    <div className="relative pl-8">
      {/* Radio Button */}
      <div className="absolute left-0 top-1/2 -translate-y-1/2">
        <div 
          className={`w-5 h-5 rounded-full border-2 flex items-center justify-center cursor-pointer transition-all ${
            isSelected 
              ? 'border-purple-600' 
              : 'border-gray-300 hover:border-purple-600'
          }`}
          onClick={(e) => {
            e.stopPropagation();
            onSelect?.(flight);
          }}
        >
          {isSelected && (
            <div className="w-3 h-3 rounded-full bg-purple-600"></div>
          )}
        </div>
      </div>
      
      <BaseFlightCard
        flight={flight}
        isSelected={isSelected}
        onViewDetails={onViewDetails}
        type="multi-city"
        legIndex={legIndex}
      />
    </div>
  );
};

export default MultiCityFlightCard;