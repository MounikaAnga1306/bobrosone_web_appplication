// src/components/Filters.jsx
import React from 'react';

const Filters = () => {
  const airlines = [
    { id: 1, name: 'Air India', price: '₹6500' },
    { id: 2, name: 'IndiGo', price: '₹65393' }
  ];

  const sortOptions = [
    { id: 1, label: 'Earliest' },
    { id: 2, label: 'Price Low to High' },
    { id: 3, label: 'Cheapest' }
  ];

  const recommendedFilters = [
    { id: 1, label: 'All' },
    { id: 2, label: 'Non-Stop' },
    { id: 3, label: 'Free meal available' },
    { id: 4, label: 'Lock Price @₹229' }
  ];

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 min-w-[280px] h-fit">
      <h3 className="text-xl font-semibold text-gray-900 mb-6">Filters</h3>
      
      {/* Smart Filters */}
      <div className="mb-8">
        <h4 className="text-sm font-semibold text-gray-700 mb-3">Smart Filters</h4>
        <input
          type="text"
          placeholder="Ask something like: I want to see flights with no stops under ₹25000"
          className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm text-gray-500 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {/* Filter Flights Section */}
      <div className="space-y-8">
        {/* Airlines */}
        <div>
          <h4 className="text-sm font-semibold text-gray-700 mb-3">Filter Flights</h4>
          <div className="space-y-3">
            {airlines.map((airline) => (
              <label key={airline.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0 cursor-pointer">
                <div className="flex items-center">
                  <input type="checkbox" className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2" />
                  <span className="ml-3 text-sm text-gray-700">{airline.name}</span>
                </div>
                <span className="text-blue-600 font-semibold text-sm">{airline.price}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Sort By */}
        <div>
          <h4 className="text-sm font-semibold text-gray-700 mb-3">Sort by</h4>
          <div className="space-y-3">
            {sortOptions.map((option) => (
              <label key={option.id} className="flex items-center py-2 border-b border-gray-100 last:border-b-0 cursor-pointer">
                <input type="radio" name="sort" className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 focus:ring-2" />
                <span className="ml-3 text-sm text-gray-700">{option.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Recommended Filters */}
        <div>
          <h4 className="text-sm font-semibold text-gray-700 mb-3">Recommended Filters</h4>
          <div className="space-y-3">
            {recommendedFilters.map((filter) => (
              <label key={filter.id} className="flex items-center py-2 border-b border-gray-100 last:border-b-0 cursor-pointer">
                <input 
                  type="checkbox" 
                  defaultChecked={filter.id === 1}
                  className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2" 
                />
                <span className="ml-3 text-sm text-gray-700">{filter.label}</span>
              </label>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Filters;