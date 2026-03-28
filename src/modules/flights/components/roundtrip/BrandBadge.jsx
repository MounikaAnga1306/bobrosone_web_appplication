// src/modules/flights/components/roundtrip/BrandBadge.jsx

import React from 'react';
import { FaBolt, FaCrown, FaChair, FaTag } from 'react-icons/fa';

const BrandBadge = ({ brand }) => {
  // Get brand name or default to 'Economy'
  const brandName = brand?.name || 'Economy';
  const brandLower = brandName.toLowerCase();

  // Determine style based on brand name
  const getBrandStyle = () => {
    if (brandLower.includes('flexi')) {
      return {
        bg: 'bg-purple-100',
        text: 'text-purple-700',
        icon: <FaBolt className="text-purple-500" size={12} />
      };
    }
    if (brandLower.includes('upfront')) {
      return {
        bg: 'bg-blue-100',
        text: 'text-blue-700',
        icon: <FaCrown className="text-blue-500" size={12} />
      };
    }
    if (brandLower.includes('stretch')) {
      return {
        bg: 'bg-amber-100',
        text: 'text-amber-700',
        icon: <FaChair className="text-amber-500" size={12} />
      };
    }
    if (brandLower.includes('sale')) {
      return {
        bg: 'bg-green-100',
        text: 'text-green-700',
        icon: <FaTag className="text-green-500" size={12} />
      };
    }
    if (brandLower.includes('eco')) {
      return {
        bg: 'bg-gray-100',
        text: 'text-gray-700',
        icon: <FaTag className="text-gray-500" size={12} />
      };
    }
    // Default
    return {
      bg: 'bg-gray-100',
      text: 'text-gray-600',
      icon: <FaTag className="text-gray-400" size={12} />
    };
  };

  const style = getBrandStyle();

  return (
    <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full ${style.bg} ${style.text} text-xs font-medium`}>
      {style.icon}
      <span>{brandName}</span>
    </div>
  );
};

export default BrandBadge;