// src/modules/flights/contexts/BookingContext.jsx

import React, { createContext, useState, useContext } from 'react';

const BookingContext = createContext();

export const useBookingContext = () => {
  const context = useContext(BookingContext);
  if (!context) {
    throw new Error('useBookingContext must be used within BookingProvider');
  }
  return context;
};

export const BookingProvider = ({ children }) => {
  const [bookingData, setBookingData] = useState({
    pricingResult: null,
    selectedFares: null,
    flights: null,
    passengerDetails: [],
    contactDetails: null,
    tripType: null
  });

  const [currentStep, setCurrentStep] = useState('search'); // search, review, payment, confirmation

  const updateBookingData = (data) => {
    setBookingData(prev => ({ ...prev, ...data }));
  };

  const clearBookingData = () => {
    setBookingData({
      pricingResult: null,
      selectedFares: null,
      flights: null,
      passengerDetails: [],
      contactDetails: null,
      tripType: null
    });
    setCurrentStep('search');
  };

  return (
    <BookingContext.Provider value={{
      bookingData,
      currentStep,
      setCurrentStep,
      updateBookingData,
      clearBookingData
    }}>
      {children}
    </BookingContext.Provider>
  );
};