// src/modules/hotels/components/HotelSortBar.jsx
import React from 'react';
import { FaThLarge, FaList, FaSortAmountDown, FaSortAmountUp } from 'react-icons/fa';

const HotelSortBar = ({ totalHotels, sortBy, onSortChange, viewMode, onViewModeChange }) => {
  const sortOptions = [
    { value: 'recommended', label: 'Recommended' },
    { value: 'price-low', label: 'Price: Low to High', icon: FaSortAmountUp },
    { value: 'price-high', label: 'Price: High to Low', icon: FaSortAmountDown },
    { value: 'rating', label: 'Guest Rating' },
    { value: 'distance', label: 'Distance' },
  ];

  return (
    <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        {/* Results Count (Mobile) */}
        <div className="sm:hidden">
          <p className="text-sm text-gray-600">
            <span className="font-semibold text-[#FD561E]">{totalHotels}</span> properties
          </p>
        </div>

        {/* Sort Dropdown */}
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-500 hidden sm:block">Sort by:</span>
          <select
            value={sortBy}
            onChange={(e) => onSortChange(e.target.value)}
            className="flex-1 sm:flex-none border border-gray-300 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-[#FD561E] focus:border-transparent bg-white"
          >
            {sortOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* Right Section: Results Count + View Toggle */}
        <div className="flex items-center justify-between sm:justify-end gap-4">
          {/* Results Count (Desktop) */}
          <p className="text-sm text-gray-600 hidden sm:block">
            <span className="font-semibold text-[#FD561E]">{totalHotels}</span> properties found
          </p>

          {/* View Mode Toggle */}
          <div className="flex border border-gray-300 rounded-lg overflow-hidden">
            <button
              onClick={() => onViewModeChange('grid')}
              className={`p-2.5 transition-colors ${
                viewMode === 'grid' 
                  ? 'bg-[#FD561E] text-white' 
                  : 'bg-white text-gray-600 hover:bg-gray-50'
              }`}
              title="Grid view"
            >
              <FaThLarge size={16} />
            </button>
            <button
              onClick={() => onViewModeChange('list')}
              className={`p-2.5 transition-colors ${
                viewMode === 'list' 
                  ? 'bg-[#FD561E] text-white' 
                  : 'bg-white text-gray-600 hover:bg-gray-50'
              }`}
              title="List view"
            >
              <FaList size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HotelSortBar;