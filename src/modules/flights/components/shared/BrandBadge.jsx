// src/modules/flights/components/shared/BrandBadge.jsx
import React from 'react';

const BRAND_COLORS = {
  'Flexi Fare': 'bg-purple-100 text-purple-800 border-purple-200',
  'Flexible Fare': 'bg-purple-100 text-purple-800 border-purple-200',
  'Regular Fare': 'bg-blue-100 text-blue-800 border-blue-200',
  'Regular': 'bg-blue-100 text-blue-800 border-blue-200',
  'Return Fare': 'bg-indigo-100 text-indigo-800 border-indigo-200',
  'Super 6E': 'bg-yellow-100 text-yellow-800 border-yellow-200',
  'Sale Fare': 'bg-green-100 text-green-800 border-green-200',
  'Sale': 'bg-green-100 text-green-800 border-green-200',
  'Stretch Fare': 'bg-orange-100 text-orange-800 border-orange-200',
  'Stretch': 'bg-orange-100 text-orange-800 border-orange-200',
  'Stretch Plus Fare': 'bg-red-100 text-red-800 border-red-200',
  'Stretch Plus': 'bg-red-100 text-red-800 border-red-200',
  'ECO VALUE': 'bg-gray-100 text-gray-800 border-gray-200',
  'Air India Fare': 'bg-indigo-100 text-indigo-800 border-indigo-200',
  'default': 'bg-gray-100 text-gray-800 border-gray-200'
};

const BRAND_LABELS = {
  'Flexi Fare': 'FLEXI',
  'Flexible Fare': 'FLEXI',
  'Regular Fare': 'REG',
  'Regular': 'REG',
  'Return Fare': 'RTN',
  'Super 6E': 'SUPER',
  'Sale Fare': 'SALE',
  'Sale': 'SALE',
  'Stretch Fare': 'STRETCH',
  'Stretch': 'STRETCH',
  'Stretch Plus Fare': 'STRETCH+',
  'Stretch Plus': 'STRETCH+',
  'ECO VALUE': 'ECO',
  'Air India Fare': 'AI',
};

const BrandBadge = ({ brand, size = 'sm', showTooltip = true }) => {
  // Handle different brand formats
  const brandName = typeof brand === 'string' ? brand : brand?.name || 'Economy';
  const brandDesc = typeof brand === 'object' ? brand?.description : null;
  
  const colorClass = BRAND_COLORS[brandName] || BRAND_COLORS.default;
  const displayLabel = BRAND_LABELS[brandName] || brandName.substring(0, 5).toUpperCase();

  const sizes = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-3 py-1 text-sm',
    lg: 'px-4 py-2 text-base'
  };

  return (
    <div className="relative inline-block group">
      <span className={`${colorClass} ${sizes[size]} rounded-full font-medium inline-block border whitespace-nowrap`}>
        {displayLabel}
      </span>
      
      {showTooltip && brandDesc && (
        <div className="absolute z-50 hidden group-hover:block bottom-full mb-2 left-1/2 transform -translate-x-1/2 min-w-[200px]">
          <div className="bg-gray-900 text-white text-xs rounded-lg py-2 px-3 whitespace-normal">
            <p className="font-semibold mb-1">{brandName}</p>
            <p className="text-gray-300 text-[10px] leading-relaxed">
              {brandDesc.substring(0, 150)}
              {brandDesc.length > 150 ? '...' : ''}
            </p>
          </div>
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1 w-2 h-2 bg-gray-900 rotate-45"></div>
        </div>
      )}
    </div>
  );
};

export default BrandBadge;