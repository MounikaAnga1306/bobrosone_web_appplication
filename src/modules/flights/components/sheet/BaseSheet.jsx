// src/modules/flights/components/sheet/BaseSheet.jsx
import React from 'react';
import { FaTimes } from 'react-icons/fa';

const BaseSheet = ({ 
  isOpen, 
  onClose, 
  title, 
  children,
  maxWidth = 'max-w-2xl'
}) => {
  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-30 z-40 transition-opacity"
        onClick={onClose}
      />
      
      {/* Sheet */}
      <div className={`fixed inset-y-0 right-0 w-full ${maxWidth} bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out overflow-y-auto`}>
        
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex justify-between items-center z-10">
          <h2 className="text-xl font-bold text-gray-800">{title}</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <FaTimes className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {children}
        </div>
      </div>
    </>
  );
};

export default BaseSheet;