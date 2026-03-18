// src/modules/flights/components/multicity/LegsContainer.jsx

import React from 'react';
import LegColumn from './LegColumn';
import MobileLegTabs from './MobileLegTabs';
import LegNavigation from './LegNavigation';
import { getColumnWidth } from '../../utils/multiCityHelpers';

const LegsContainer = ({
  legs = [],
  selectedFlights = [],
  onSelectFlight,
  sortBy = {},
  onSortChange,
  filters = {},
  visibleCounts = {},
  onLoadMore,
  currency = 'INR',
  isLoading = false,
  // Mobile props
  activeMobileLeg = 0,
  onMobileLegChange,
  // Responsive breakpoint
  breakpoint = 'md'
}) => {
  const legCount = legs.length;

  // No legs to display
  if (legCount === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No flights available</p>
      </div>
    );
  }

  // Mobile View (Tabs + Single Column)
  const MobileView = () => (
    <div className={`block ${breakpoint}:hidden`}>
      <MobileLegTabs
        legs={legs}
        selectedFlights={selectedFlights}
        activeLeg={activeMobileLeg}
        onLegChange={onMobileLegChange}
      />
      
      <div className="mt-4">
        <LegColumn
          legIndex={activeMobileLeg}
          legData={legs[activeMobileLeg]}
          flights={legs[activeMobileLeg]?.flights || []}
          selectedFlight={selectedFlights[activeMobileLeg]}
          onSelect={(flight) => onSelectFlight(activeMobileLeg, flight)}
          sortBy={sortBy[activeMobileLeg]}
          onSortChange={(sort) => onSortChange?.(activeMobileLeg, sort)}
          filters={filters.targetLeg === null || filters.targetLeg === activeMobileLeg ? filters : {}}
          visibleCount={visibleCounts[activeMobileLeg] || 20}
          onLoadMore={() => onLoadMore?.(activeMobileLeg)}
          currency={currency}
          isLoading={isLoading}
        />
      </div>
    </div>
  );

  // Desktop View (Multiple Columns)
  const DesktopView = () => {
    // Calculate column widths
    const columnWidth = getColumnWidth(legCount);
    
    // For many legs, enable horizontal scroll
    const isScrollable = legCount > 4;
    
    return (
      <div className={`hidden ${breakpoint}:block`}>
        <div className={`flex ${isScrollable ? 'overflow-x-auto pb-4 space-x-4' : 'gap-4'}`}>
          {legs.map((leg, index) => (
            <div
              key={index}
              className={`
                flex-shrink-0
                ${isScrollable ? 'w-80' : columnWidth}
              `}
            >
              <LegColumn
                legIndex={index}
                legData={leg}
                flights={leg.flights || []}
                selectedFlight={selectedFlights[index]}
                onSelect={(flight) => onSelectFlight(index, flight)}
                sortBy={sortBy[index]}
                onSortChange={(sort) => onSortChange?.(index, sort)}
                filters={filters.targetLeg === null || filters.targetLeg === index ? filters : {}}
                visibleCount={visibleCounts[index] || 20}
                onLoadMore={() => onLoadMore?.(index)}
                currency={currency}
                isLoading={isLoading}
              />
            </div>
          ))}
        </div>

        {/* Quick Navigation for many legs */}
        {isScrollable && (
          <LegNavigation
            legCount={legCount}
            selectedLegs={selectedFlights}
            onJumpTo={(index) => {
              // Scroll to leg
              const element = document.getElementById(`leg-${index}`);
              element?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'start' });
            }}
          />
        )}
      </div>
    );
  };

  return (
    <>
      <MobileView />
      <DesktopView />
      
      {/* Hidden anchors for scrolling */}
      {legs.map((_, index) => (
        <div key={index} id={`leg-${index}`} className="hidden" />
      ))}
    </>
  );
};

export default LegsContainer;