// src/modules/flights/components/sheet/BaseSheet.jsx

import React, { useEffect } from 'react';
import { FaTimes } from 'react-icons/fa';

const BaseSheet = ({ 
  isOpen, 
  onClose, 
  title, 
  children,
  maxWidth = 'max-w-4xl'
}) => {
  
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Black with opacity - NOT complete black */}
      <div 
        className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />
      
      {/* Center Container */}
      <div className="absolute inset-0 flex items-center justify-center p-4">
        {/* Centered Sheet */}
        <div className={`w-full ${maxWidth} bg-white rounded-2xl shadow-2xl max-h-[85vh] overflow-hidden transform transition-all duration-300 ease-out`}>
          
          {/* Header */}
          <div className="flex items-center justify-between px-8 py-5 border-b border-gray-100 bg-white">
            <h2 className="text-2xl font-bold text-gray-800">
              <span className="text-[#FD561E] mr-2">✈️</span>
              {title}
            </h2>
            <button
              onClick={onClose}
              className="p-2.5 hover:bg-[#FD561E] hover:bg-opacity-10 rounded-full transition-colors group"
              aria-label="Close"
            >
              <FaTimes className="w-5 h-5 text-gray-400 group-hover:text-[#FD561E]" />
            </button>
          </div>
          
          {/* Content - Scrollable */}
          <div className="overflow-y-auto p-8" style={{ maxHeight: 'calc(85vh - 80px)' }}>
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BaseSheet;