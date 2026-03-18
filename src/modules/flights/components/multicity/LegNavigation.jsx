// src/modules/flights/components/multicity/LegNavigation.jsx

import React, { useState, useEffect } from 'react';

const LegNavigation = ({
  legCount = 0,
  selectedLegs = [],
  onJumpTo,
  position = 'left' // 'left' or 'right'
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [hoveredLeg, setHoveredLeg] = useState(null);

  // Close on escape key
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') setIsOpen(false);
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, []);

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e.target.closest('.leg-navigation')) {
        setIsOpen(false);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const selectedCount = selectedLegs.filter(Boolean).length;

  // Get position styles
  const getPositionStyles = () => {
    switch (position) {
      case 'right':
        return { right: '1rem' };
      case 'left':
      default:
        return { left: '1rem' };
    }
  };

  if (legCount < 4) return null; // Only show for 4+ legs

  return (
    <div className="leg-navigation fixed top-1/2 transform -translate-y-1/2 z-30" style={getPositionStyles()}>
      {/* Main Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`
          w-12 h-12 rounded-full shadow-lg flex items-center justify-center transition-all
          ${isOpen 
            ? 'bg-blue-600 text-white rotate-180' 
            : 'bg-white text-blue-600 hover:shadow-xl hover:scale-110'
          }
        `}
      >
        {isOpen ? (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        )}
      </button>

      {/* Progress Indicator */}
      {!isOpen && (
        <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
          {selectedCount}
        </div>
      )}

      {/* Dropdown Menu */}
      {isOpen && (
        <div
          className={`
            absolute top-0 bg-white rounded-lg shadow-xl py-2 min-w-[200px]
            ${position === 'right' ? 'right-full mr-4' : 'left-full ml-4'}
          `}
        >
          <div className="px-4 py-2 border-b border-gray-100">
            <h4 className="font-semibold text-sm">Quick Jump</h4>
            <p className="text-xs text-gray-500">{selectedCount} of {legCount} selected</p>
          </div>

          <div className="max-h-[300px] overflow-y-auto">
            {Array.from({ length: legCount }).map((_, index) => {
              const isSelected = selectedLegs[index] !== null;
              const legNumber = index + 1;

              return (
                <button
                  key={index}
                  onClick={() => {
                    onJumpTo(index);
                    setIsOpen(false);
                  }}
                  onMouseEnter={() => setHoveredLeg(index)}
                  onMouseLeave={() => setHoveredLeg(null)}
                  className={`
                    w-full px-4 py-2 flex items-center gap-3 hover:bg-gray-50 transition
                    ${isSelected ? 'bg-green-50' : ''}
                    ${hoveredLeg === index ? 'bg-gray-50' : ''}
                  `}
                >
                  {/* Leg Indicator */}
                  <div className={`
                    w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium
                    ${isSelected 
                      ? 'bg-green-100 text-green-700' 
                      : 'bg-gray-100 text-gray-700'
                    }
                  `}>
                    {legNumber}
                  </div>

                  {/* Leg Info */}
                  <div className="flex-1 text-left">
                    <div className="text-sm font-medium">
                      Leg {legNumber}
                    </div>
                    <div className="text-xs text-gray-500">
                      {isSelected ? '✓ Selected' : 'Not selected'}
                    </div>
                  </div>

                  {/* Arrow */}
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              );
            })}
          </div>

          {/* Progress Bar */}
          <div className="px-4 py-2 border-t border-gray-100">
            <div className="w-full bg-gray-200 rounded-full h-1.5">
              <div
                className="bg-blue-600 h-1.5 rounded-full"
                style={{ width: `${(selectedCount / legCount) * 100}%` }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LegNavigation;