// src/modules/flights/components/sheet/FareSheet.jsx
import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import FareCard from './BaseFlightCard';
import { X } from 'lucide-react';

const FareSheet = ({
  isOpen,
  onClose,
  flights = [], // Array of flights (one for each leg)
  selectedFares = [], // Currently selected fares per leg
  onFareSelect,
  type = 'one-way', // 'one-way', 'round-trip', 'multi-city'
  currency = 'INR'
}) => {
  const [activeTab, setActiveTab] = useState(0);
  const [localSelected, setLocalSelected] = useState(selectedFares);

  // Update local state when props change
  useEffect(() => {
    setLocalSelected(selectedFares);
  }, [selectedFares]);

  // Handle fare selection
  const handleFareSelect = (legIndex, fare) => {
    const newSelected = [...localSelected];
    newSelected[legIndex] = { ...flights[legIndex], ...fare };
    setLocalSelected(newSelected);
    
    // Auto-advance to next tab if not last
    if (legIndex < flights.length - 1) {
      setActiveTab(legIndex + 1);
    }
    
    // Notify parent
    onFareSelect?.(legIndex, fare);
  };

  // Handle apply and close
  const handleApply = () => {
    onClose();
  };

  if (!isOpen) return null;

  // Generate tab labels based on type
  const getTabLabel = (index) => {
    if (type === 'round-trip') {
      return index === 0 ? 'Outbound' : 'Return';
    }
    if (type === 'multi-city') {
      return `Leg ${index + 1}`;
    }
    return 'Fare Details';
  };

  return createPortal(
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
      />

      {/* Sheet */}
      <div className={`
        absolute bottom-0 left-0 right-0 
        bg-white rounded-t-2xl shadow-xl 
        transform transition-transform duration-300 ease-out
        max-h-[90vh] overflow-hidden
        ${isOpen ? 'translate-y-0' : 'translate-y-full'}
      `}>
        {/* Header */}
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
          <h2 className="text-lg font-semibold">
            {type === 'one-way' && 'Select Fare'}
            {type === 'round-trip' && 'Select Fares'}
            {type === 'multi-city' && 'Select Fares for All Legs'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs - Only show for multiple legs */}
        {flights.length > 1 && (
          <div className="sticky top-16 bg-white border-b px-6">
            <div className="flex gap-4 overflow-x-auto scrollbar-hide">
              {flights.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setActiveTab(index)}
                  className={`
                    py-3 px-2 text-sm font-medium border-b-2 transition
                    ${activeTab === index
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                    }
                  `}
                >
                  {getTabLabel(index)}
                  {localSelected[index] && (
                    <span className="ml-2 text-green-600">✓</span>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Content - Scrollable */}
        <div className="overflow-y-auto p-6" style={{ maxHeight: 'calc(90vh - 180px)' }}>
          {flights.length > 0 && (
            <div>
              {/* Flight Summary for current leg */}
              <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                <div className="text-sm text-gray-600">
                  {flights[activeTab]?.airline} · {flights[activeTab]?.flightNumber}
                </div>
                <div className="font-medium mt-1">
                  {flights[activeTab]?.origin} → {flights[activeTab]?.destination}
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  {new Date(flights[activeTab]?.departureTime).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric'
                  })}
                </div>
              </div>

              {/* Fare Cards for current leg */}
              {flights[activeTab]?.fares?.map((fare, idx) => (
                <FareCard
                  key={idx}
                  fare={fare}
                  flight={flights[activeTab]}
                  isSelected={localSelected[activeTab]?.id === fare.id}
                  onSelect={(fare) => handleFareSelect(activeTab, fare)}
                />
              ))}

              {/* No fares available */}
              {(!flights[activeTab]?.fares || flights[activeTab].fares.length === 0) && (
                <div className="text-center py-8 text-gray-500">
                  No fare options available
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer - Apply button */}
        <div className="sticky bottom-0 bg-white border-t p-4">
          <div className="flex justify-between items-center mb-3">
            <span className="text-sm text-gray-600">
              {localSelected.filter(Boolean).length} of {flights.length} selected
            </span>
            <span className="text-lg font-bold text-blue-600">
              ₹{localSelected.reduce((sum, f) => sum + (f?.price || 0), 0).toLocaleString()}
            </span>
          </div>
          <button
            onClick={handleApply}
            disabled={localSelected.filter(Boolean).length !== flights.length}
            className={`
              w-full py-3 rounded-lg font-semibold transition
              ${localSelected.filter(Boolean).length === flights.length
                ? 'bg-blue-600 text-white hover:bg-blue-700'
                : 'bg-gray-200 text-gray-500 cursor-not-allowed'
              }
            `}
          >
            {localSelected.filter(Boolean).length === flights.length
              ? 'Apply Selection'
              : `Select all ${flights.length} fares`
            }
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default FareSheet;