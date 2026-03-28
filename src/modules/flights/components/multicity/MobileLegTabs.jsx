// src/modules/flights/components/multicity/MobileLegTabs.jsx

import React, { useState, useRef, useEffect } from 'react';
import { formatDate } from '../../utils/multiCityHelpers';

const MobileLegTabs = ({
  legs = [],
  selectedFlights = [],
  activeLeg = 0,
  onLegChange,
  swipeEnabled = true
}) => {
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);
  const tabBarRef = useRef(null);

  // Minimum swipe distance
  const minSwipeDistance = 50;

  // Handle touch start
  const onTouchStart = (e) => {
    if (!swipeEnabled) return;
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  // Handle touch move
  const onTouchMove = (e) => {
    if (!swipeEnabled) return;
    setTouchEnd(e.targetTouches[0].clientX);
  };

  // Handle touch end
  const onTouchEnd = () => {
    if (!touchStart || !touchEnd || !swipeEnabled) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe && activeLeg < legs.length - 1) {
      onLegChange(activeLeg + 1);
    }
    if (isRightSwipe && activeLeg > 0) {
      onLegChange(activeLeg - 1);
    }
  };

  // Scroll active tab into view
  useEffect(() => {
    if (tabBarRef.current) {
      const activeTab = tabBarRef.current.children[activeLeg];
      if (activeTab) {
        activeTab.scrollIntoView({
          behavior: 'smooth',
          block: 'nearest',
          inline: 'center'
        });
      }
    }
  }, [activeLeg]);

  return (
    <div className="bg-white border-b sticky top-0 z-20">
      {/* Tab Bar - Horizontal Scroll */}
      <div
        ref={tabBarRef}
        className="flex overflow-x-auto scrollbar-hide"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {legs.map((leg, index) => {
          const isSelected = selectedFlights[index] !== null;
          const isActive = activeLeg === index;

          return (
            <button
              key={index}
              onClick={() => onLegChange(index)}
              className={`
                flex-shrink-0 px-6 py-3 text-sm font-medium transition
                ${isActive
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
                }
                ${isSelected ? 'bg-green-50' : ''}
              `}
            >
              <div className="flex items-center gap-2">
                <span>Leg {index + 1}</span>
                {isSelected && (
                  <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </div>
              <div className="text-xs text-gray-500">
                {leg.origin} → {leg.destination}
              </div>
              <div className="text-xs text-gray-400">
                {leg.date ? formatDate(leg.date) : 'Select date'}
              </div>
            </button>
          );
        })}
      </div>

      {/* Swipeable Area Indicator */}
      {swipeEnabled && legs.length > 1 && (
        <div className="flex justify-center items-center gap-1 py-2 bg-gray-50">
          <div className="text-xs text-gray-400">← Swipe to change leg →</div>
        </div>
      )}

      {/* Touch Area for Swipe (overlay) */}
      <div
        className="absolute inset-0 z-10"
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        style={{ pointerEvents: swipeEnabled ? 'auto' : 'none' }}
      />
    </div>
  );
};

export default MobileLegTabs;