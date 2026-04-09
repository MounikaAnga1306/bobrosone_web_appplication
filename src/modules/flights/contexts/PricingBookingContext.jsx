// src/modules/flights/context/PricingBookingContext.jsx

import React, { createContext, useContext, useState, useCallback } from 'react';

// Create Context
const PricingBookingContext = createContext(null);

// Hook to use pricing booking context
export const usePricingBooking = () => {
  const context = useContext(PricingBookingContext);
  if (!context) {
    throw new Error('usePricingBooking must be used within PricingBookingProvider');
  }
  return context;
};

// Provider Component
export const PricingBookingProvider = ({ children }) => {
  // ============ COMPLETE BOOKING DATA STATE ============
  const [bookingData, setBookingData] = useState({
    // ============ RAW API DATA ============
    rawPricingResponse: null,
    
    // ============ HOST TOKEN (CRITICAL FOR SEAT MAP & PNR) ============
    hostToken: null,           // { key: "...", value: "..." }
    hostTokenRef: null,        // Reference key linking fare to token
    
    // ============ FLIGHT DATA ============
    flightSegments: [],        // Array of flight segment objects
    
    // ============ FARE DATA ============
    selectedFare: null,        // Complete selected fare object with all details
    allFareOptions: [],        // All available fare options for comparison
    
    // ============ OPTIONAL SERVICES ============
    optionalServices: { meals: [], seats: [], baggage: [], other: [] },
    
    // ============ USER PROVIDED DATA (FROM BOOKING REVIEW PAGE) ============
    passengers: [],            // Array of passenger objects with names, DOB, gender, age
    passengerCounts: { ADT: 1, CNN: 0, INF: 0 },
    contactInfo: null,         // { email: "", phone: { countryCode, number } }
    paymentMethod: 'Cash',     // 'card', 'upi', 'netbanking', 'Cash'
    
    // ============ SEAT SELECTION (FROM SEAT MAP PAGE) ============
    selectedSeat: null,        // { seatCode, price, type, ... }
    
    // ============ TRIP METADATA ============
    isRoundTrip: false,
    tripType: 'one-way',       // 'one-way', 'round-trip', 'multi-city'
    currency: 'INR',
    timestamp: null,
    
    // ============ BOOKING STATUS ============
    bookingStatus: 'draft',    // 'draft', 'confirmed', 'failed', 'cancelled'
    pnrNumber: null,           // After successful booking
    bookingReference: null
  });

  // ============ LOADING & ERROR STATES ============
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // ============ CORE ACTIONS ============

  /**
   * Store raw pricing response from API (called by pricingService)
   * This is the entry point for raw API response
   */
  const setRawPricingResponse = useCallback((response) => {
    console.log('\n📦 Setting raw pricing response in context from pricingService');
    console.log('   - Response has data:', !!response?.data);
    console.log('   - Response has SOAP:Envelope:', !!response?.['SOAP:Envelope'] || !!response?.data?.['SOAP:Envelope']);
    
    setBookingData(prev => ({
      ...prev,
      rawPricingResponse: response
    }));
  }, []);

  /**
   * Initialize complete booking data (called ONCE from BookingReviewPage)
   * This is the main entry point that sets all booking data at once
   */
  const initializeBookingData = useCallback((data) => {
    console.log('\n📦 INITIALIZING BOOKING DATA IN CONTEXT:');
    console.log('   - Host Token exists:', !!data.hostToken);
    console.log('   - Host Token Key:', data.hostToken?.key);
    console.log('   - Host Token Ref:', data.hostTokenRef);
    console.log('   - Flight Segments:', data.flightSegments?.length);
    console.log('   - Selected Fare:', data.selectedFare?.brand?.name);
    console.log('   - Passengers:', data.passengers?.length);
    console.log('   - Payment Method:', data.paymentMethod);
    
    setBookingData(prev => ({
      ...prev,
      ...data,
      timestamp: new Date().toISOString(),
      bookingStatus: 'draft'
    }));
  }, []);

  /**
   * Update specific fields in booking data
   * Useful for partial updates from different pages
   */
  const updateBookingData = useCallback((updates) => {
    console.log('📝 Updating booking data:', Object.keys(updates));
    setBookingData(prev => ({
      ...prev,
      ...updates
    }));
  }, []);

  /**
   * Select fare and store its host token
   * Called when user clicks on a fare option in BookingReviewPage
   */
  const selectFareWithHostToken = useCallback((fare, hostToken) => {
    console.log(`✈️ Fare selected: ${fare?.brand?.name}`);
    console.log(`🔑 Host token stored:`, hostToken);
    console.log(`🔗 Host token ref: ${fare?.hostTokenRef || fare?.bookingInfo?.hostTokenRef}`);
    
    setBookingData(prev => ({
      ...prev,
      selectedFare: {
        ...fare,
        hostToken: hostToken,
        hostTokenRef: fare?.hostTokenRef || fare?.bookingInfo?.hostTokenRef
      },
      hostToken: hostToken,
      hostTokenRef: fare?.hostTokenRef || fare?.bookingInfo?.hostTokenRef
    }));
  }, []);

  /**
   * Update passengers list
   * Called when user fills passenger details in BookingReviewPage
   */
  const updatePassengersList = useCallback((passengers) => {
    console.log(`👥 Passengers updated: ${passengers.length} passenger(s)`);
    passengers.forEach((p, i) => {
      console.log(`   - ${p.title}: ${p.firstName} ${p.lastName} (Age: ${p.age})`);
    });
    
    setBookingData(prev => ({
      ...prev,
      passengers
    }));
  }, []);

  /**
   * Update passenger counts
   */
  const updatePassengerCounts = useCallback((passengerCounts) => {
    console.log(`👥 Passenger counts updated:`, passengerCounts);
    setBookingData(prev => ({
      ...prev,
      passengerCounts
    }));
  }, []);

  /**
   * Update contact information
   * Called when user fills contact info in BookingReviewPage
   */
  const updateContactInformation = useCallback((contactInfo) => {
    console.log(`📧 Contact info updated: ${contactInfo?.email}`);
    setBookingData(prev => ({
      ...prev,
      contactInfo
    }));
  }, []);

  /**
   * Update payment method
   * Called when user selects payment method in BookingReviewPage
   */
  const updatePaymentMethodType = useCallback((paymentMethod) => {
    console.log(`💳 Payment method updated: ${paymentMethod}`);
    setBookingData(prev => ({
      ...prev,
      paymentMethod
    }));
  }, []);

  /**
   * Select seat for booking
   * Called from SeatMapPage when user selects a seat
   */
  const selectSeatForBooking = useCallback((seat) => {
    console.log(`💺 Seat selected: ${seat?.seatCode || 'None'}`);
    setBookingData(prev => ({
      ...prev,
      selectedSeat: seat
    }));
  }, []);

  /**
   * Update booking status after PNR creation
   */
  const updateBookingStatus = useCallback((status, pnrNumber = null, bookingReference = null) => {
    console.log(`📋 Booking status updated: ${status}`);
    setBookingData(prev => ({
      ...prev,
      bookingStatus: status,
      pnrNumber: pnrNumber || prev.pnrNumber,
      bookingReference: bookingReference || prev.bookingReference
    }));
  }, []);

  /**
   * Clear all booking data (when starting new search or after successful booking)
   */
  const clearBookingData = useCallback(() => {
    console.log('🗑️ Clearing all booking data from context');
    setBookingData({
      rawPricingResponse: null,
      hostToken: null,
      hostTokenRef: null,
      flightSegments: [],
      selectedFare: null,
      allFareOptions: [],
      optionalServices: { meals: [], seats: [], baggage: [], other: [] },
      passengers: [],
      passengerCounts: { ADT: 1, CNN: 0, INF: 0 },
      contactInfo: null,
      paymentMethod: 'Cash',
      selectedSeat: null,
      isRoundTrip: false,
      tripType: 'one-way',
      currency: 'INR',
      timestamp: null,
      bookingStatus: 'draft',
      pnrNumber: null,
      bookingReference: null
    });
    setError(null);
  }, []);

  /**
   * Set loading state
   */
  const setBookingLoading = useCallback((isLoading) => {
    setLoading(isLoading);
  }, []);

  /**
   * Set error state
   */
  const setBookingError = useCallback((errorMessage) => {
    setError(errorMessage);
  }, []);

  // ============ CONVENIENCE GETTERS ============

  /**
   * Get host token (checks both root and selectedFare)
   */
  const getHostToken = useCallback(() => {
    return bookingData.hostToken || bookingData.selectedFare?.hostToken;
  }, [bookingData]);

  /**
   * Get host token reference
   */
  const getHostTokenRef = useCallback(() => {
    return bookingData.hostTokenRef || bookingData.selectedFare?.hostTokenRef;
  }, [bookingData]);

  /**
   * Get flight segments
   */
  const getFlightSegments = useCallback(() => {
    return bookingData.flightSegments;
  }, [bookingData]);

  /**
   * Get selected fare
   */
  const getSelectedFare = useCallback(() => {
    return bookingData.selectedFare;
  }, [bookingData]);

  /**
   * Get all fare options
   */
  const getAllFareOptions = useCallback(() => {
    return bookingData.allFareOptions;
  }, [bookingData]);

  /**
   * Get passengers
   */
  const getPassengers = useCallback(() => {
    return bookingData.passengers;
  }, [bookingData]);

  /**
   * Get passenger counts
   */
  const getPassengerCounts = useCallback(() => {
    return bookingData.passengerCounts;
  }, [bookingData]);

  /**
   * Get contact info
   */
  const getContactInfo = useCallback(() => {
    return bookingData.contactInfo;
  }, [bookingData]);

  /**
   * Get payment method
   */
  const getPaymentMethod = useCallback(() => {
    return bookingData.paymentMethod;
  }, [bookingData]);

  /**
   * Get selected seat
   */
  const getSelectedSeat = useCallback(() => {
    return bookingData.selectedSeat;
  }, [bookingData]);

  /**
   * Get optional services
   */
  const getOptionalServices = useCallback(() => {
    return bookingData.optionalServices;
  }, [bookingData]);

  /**
   * Get booking status
   */
  const getBookingStatus = useCallback(() => {
    return bookingData.bookingStatus;
  }, [bookingData]);

  /**
   * Get PNR number if booking confirmed
   */
  const getPnrNumber = useCallback(() => {
    return bookingData.pnrNumber;
  }, [bookingData]);

  /**
   * Check if booking is complete (has minimum required data)
   */
  const isBookingComplete = useCallback(() => {
    return !!(bookingData.hostToken && 
              bookingData.flightSegments?.length > 0 && 
              bookingData.selectedFare && 
              bookingData.passengers?.length > 0);
  }, [bookingData]);

  /**
   * Check if booking is ready for PNR creation
   */
  const isReadyForBooking = useCallback(() => {
    return !!(bookingData.hostToken &&
              bookingData.selectedFare &&
              bookingData.passengers?.length > 0 &&
              bookingData.contactInfo?.email &&
              bookingData.contactInfo?.phone?.number);
  }, [bookingData]);

  /**
   * Get complete booking data for API calls (PNR creation, seat map, etc.)
   */
  const getCompleteBookingData = useCallback(() => {
    return bookingData;
  }, [bookingData]);

  /**
   * Get data formatted for PNR creation API
   */
  const getDataForPNR = useCallback(() => {
    return {
      hostToken: bookingData.hostToken,
      hostTokenRef: bookingData.hostTokenRef,
      selectedFare: bookingData.selectedFare,
      passengers: bookingData.passengers,
      contactInfo: bookingData.contactInfo,
      paymentMethod: bookingData.paymentMethod,
      selectedSeat: bookingData.selectedSeat,
      flightSegments: bookingData.flightSegments,
      isRoundTrip: bookingData.isRoundTrip,
      tripType: bookingData.tripType,
      currency: bookingData.currency
    };
  }, [bookingData]);

  // ============ CONTEXT VALUE ============
  const value = {
    // State
    bookingData,
    loading,
    error,
    
    // Raw Response Setter (NEW - CRITICAL FOR pricingService)
    setRawPricingResponse,  // ← ADD THIS LINE
    
    // Initialization & Management
    initializeBookingData,
    updateBookingData,
    clearBookingData,
    
    // Fare Selection
    selectFareWithHostToken,
    
    // Passenger Management
    updatePassengersList,
    updatePassengerCounts,
    
    // Contact & Payment
    updateContactInformation,
    updatePaymentMethodType,
    
    // Seat Selection
    selectSeatForBooking,
    
    // Booking Status
    updateBookingStatus,
    
    // Loading & Error
    setBookingLoading,
    setBookingError,
    
    // Getters
    getHostToken,
    getHostTokenRef,
    getFlightSegments,
    getSelectedFare,
    getAllFareOptions,
    getPassengers,
    getPassengerCounts,
    getContactInfo,
    getPaymentMethod,
    getSelectedSeat,
    getOptionalServices,
    getBookingStatus,
    getPnrNumber,
    getCompleteBookingData,
    getDataForPNR,
    
    // Validation
    isBookingComplete,
    isReadyForBooking
  };

  return (
    <PricingBookingContext.Provider value={value}>
      {children}
    </PricingBookingContext.Provider>
  );
};

export default PricingBookingContext;