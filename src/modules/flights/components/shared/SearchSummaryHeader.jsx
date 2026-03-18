// src/modules/flights/components/shared/SearchSummaryHeader.jsx

import React from 'react';

const SearchSummaryHeader = ({ summary, onEdit, type = 'one-way' }) => {
  if (!summary) return null;

  const getTypeBadge = () => {
    switch (type) {
      case 'multi-city':
        return (
          <span className="bg-purple-100 text-purple-800 text-xs font-semibold px-2.5 py-0.5 rounded">
            Multi-City
          </span>
        );
      case 'round-trip':
        return (
          <span className="bg-green-100 text-green-800 text-xs font-semibold px-2.5 py-0.5 rounded">
            Round Trip
          </span>
        );
      default:
        return (
          <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-0.5 rounded">
            One Way
          </span>
        );
    }
  };

  return (
    <div className="bg-white border-b sticky top-0 z-20 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex justify-between items-center mb-2">
          <div className="flex items-center space-x-2">
            {getTypeBadge()}
            <span className="text-sm text-gray-500">
              {summary.passengerText}
            </span>
          </div>
          <button
            onClick={onEdit}
            className="text-sm text-blue-600 hover:text-blue-800 font-medium"
          >
            Edit Search
          </button>
        </div>

        <div className="flex items-center space-x-2">
          <span className="font-medium">{summary.fromCode}</span>
          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
          </svg>
          <span className="font-medium">{summary.toCode}</span>
          <span className="text-sm text-gray-500 ml-2">{summary.formattedDate}</span>
        </div>
      </div>
    </div>
  );
};

export default SearchSummaryHeader;