// src/modules/flights/components/multicity/LegColumn.jsx

import React, { useState, useMemo } from 'react';
import FlightCard from './FlightCard';
import { FixedSizeList } from 'react-window';
import {
  sortFlights,
  filterFlights,
  groupFlightsByTimeOfDay,
  getTimeBandLabel,
  formatDate
} from '../../utils/multiCityHelpers';

const LegColumn = ({
  legIndex,
  legData,
  flights = [],
  selectedFlight,
  onSelect,
  sortBy = 'price',
  onSortChange,
  visibleCount = 20,
  onLoadMore,
  filters = {},
  currency = 'INR',
  isLoading = false
}) => {
  const [showTimeGroups, setShowTimeGroups] = useState(true);

  // Sort options
  const sortOptions = [
    { value: 'price', label: 'Price' },
    { value: 'departure', label: 'Departure' },
    { value: 'arrival', label: 'Arrival' },
    { value: 'duration', label: 'Duration' },
    { value: 'airline', label: 'Airline' }
  ];

  // Apply filters and sorting
  const processedFlights = useMemo(() => {
    // First apply filters
    const filtered = filterFlights(flights, filters);
    // Then sort
    return sortFlights(filtered, sortBy);
  }, [flights, filters, sortBy]);

  // Group by time of day
  const groupedFlights = useMemo(() => {
    if (!showTimeGroups) return null;
    return groupFlightsByTimeOfDay(processedFlights);
  }, [processedFlights, showTimeGroups]);

  // Get visible flights
  const visibleFlights = useMemo(() => {
    return processedFlights.slice(0, visibleCount);
  }, [processedFlights, visibleCount]);

  // Check if there are more flights to load
  const hasMore = visibleCount < processedFlights.length;

  // Render flight card for virtualized list
  const FlightRow = ({ index, style }) => {
    const flight = visibleFlights[index];
    return (
      <div style={style} className="pr-2">
        <FlightCard
          flight={flight}
          isSelected={selectedFlight?.id === flight.id}
          onSelect={() => onSelect(flight)}
          legIndex={legIndex}
          currency={currency}
        />
      </div>
    );
  };

  // Loading skeleton
  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 h-full">
        <div className="p-4 border-b">
          <div className="h-6 bg-gray-200 rounded w-32 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-24"></div>
        </div>
        <div className="p-4 space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="border rounded-lg p-4">
              <div className="h-5 bg-gray-200 rounded w-40 mb-3"></div>
              <div className="flex justify-between mb-3">
                <div className="h-8 bg-gray-200 rounded w-16"></div>
                <div className="h-8 bg-gray-200 rounded w-24"></div>
                <div className="h-8 bg-gray-200 rounded w-16"></div>
              </div>
              <div className="h-6 bg-gray-200 rounded w-32 ml-auto"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 flex flex-col h-full">
      {/* Column Header */}
      <div className="sticky top-0 bg-white p-4 border-b rounded-t-lg z-10">
        <div className="flex justify-between items-start mb-2">
          <div>
            <h3 className="font-semibold text-lg text-gray-900">
              {legData?.origin || 'Origin'} → {legData?.destination || 'Destination'}
            </h3>
            <p className="text-sm text-gray-500">
              {legData?.date ? formatDate(legData.date) : 'Select date'}
            </p>
          </div>
          <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded">
            {processedFlights.length} flights
          </span>
        </div>

        {/* Sort Bar */}
        <div className="flex items-center justify-between mt-3">
          <span className="text-xs text-gray-500">Sort by:</span>
          <div className="flex flex-wrap gap-1">
            {sortOptions.map(option => (
              <button
                key={option.value}
                onClick={() => onSortChange?.(option.value)}
                className={`
                  text-xs px-2 py-1 rounded transition
                  ${sortBy === option.value
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }
                `}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {/* View Toggle */}
        <div className="flex items-center justify-end mt-2">
          <button
            onClick={() => setShowTimeGroups(!showTimeGroups)}
            className="text-xs text-blue-600 hover:text-blue-800"
          >
            {showTimeGroups ? 'Show all flights' : 'Group by time'}
          </button>
        </div>
      </div>

      {/* Flight List */}
      <div className="flex-1 overflow-y-auto" style={{ height: '600px' }}>
        {showTimeGroups && groupedFlights ? (
          // Time Group View
          <div className="p-4 space-y-6">
            {Object.entries(groupedFlights).map(([band, bandFlights]) => (
              <div key={band}>
                <div className="sticky top-0 bg-white py-2 border-b border-gray-200 mb-3">
                  <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    {getTimeBandLabel(band)}
                  </h4>
                </div>
                <div className="space-y-3">
                  {bandFlights.map(flight => (
                    <FlightCard
                      key={flight.id}
                      flight={flight}
                      isSelected={selectedFlight?.id === flight.id}
                      onSelect={() => onSelect(flight)}
                      legIndex={legIndex}
                      currency={currency}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          // Simple List View (with virtualization)
          <div className="p-4">
            {visibleFlights.length > 0 ? (
              <>
                <FixedSizeList
                  height={550}
                  itemCount={visibleFlights.length}
                  itemSize={220}
                  width="100%"
                >
                  {FlightRow}
                </FixedSizeList>
                
                {/* Load More Button */}
                {hasMore && (
                  <button
                    onClick={onLoadMore}
                    className="w-full mt-4 py-2 text-blue-600 border border-blue-300 rounded-lg hover:bg-blue-50 transition"
                  >
                    Show 20 more flights
                  </button>
                )}
              </>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-500">No flights match your filters</p>
                <button
                  onClick={() => onSortChange?.('price')}
                  className="mt-2 text-blue-600 text-sm hover:text-blue-800"
                >
                  Clear filters
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Leg Indicator */}
      <div className="border-t p-2 text-xs text-gray-400 text-center">
        Leg {legIndex + 1}
      </div>
    </div>
  );
};

export default LegColumn;