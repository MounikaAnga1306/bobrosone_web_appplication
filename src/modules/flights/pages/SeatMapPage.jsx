// src/modules/flights/pages/SeatMapPage.jsx

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaPlane, FaExclamationTriangle, FaSpinner, FaArrowRight, FaCheckCircle } from 'react-icons/fa';
import { toast } from 'react-toastify';
import seatMapService from '../services/seatMapService';
import pnrCreationService from '../services/pnr_creationService';
import { usePricingBooking } from '../contexts/PricingBookingContext';
import { usePnrResponse } from '../contexts/PnrResponseContext';

// ============================================================
// SEAT MAP PARSER - Handles single and multi-segment responses
// ============================================================

const parseSeatMapResponse = (response, flightSegment) => {
  const data = response.data || response;
  const actualData = data.data || data;
  
  // Check if seat map is available
  if (!actualData.Rows) {
    return { 
      hasSeatMap: false, 
      error: 'Seat map not available',
      flightInfo: flightSegment
    };
  }
  
  // Get flight info
  const flightInfo = flightSegment || {
    carrier: actualData.AirSegment?.$?.Carrier || 'N/A',
    flightNumber: actualData.AirSegment?.$?.FlightNumber || 'N/A',
    origin: actualData.AirSegment?.$?.Origin || 'N/A',
    destination: actualData.AirSegment?.$?.Destination || 'N/A',
    departureTime: actualData.AirSegment?.$?.DepartureTime || '',
    arrivalTime: actualData.AirSegment?.$?.ArrivalTime || ''
  };
  
  // Parse rows and seats
  const rows = [];
  const rowArray = Array.isArray(actualData.Rows.Row) ? actualData.Rows.Row : [actualData.Rows.Row];
  
  rowArray.forEach(row => {
    const rowNumber = row.$?.Number;
    const facilities = [];
    const facilityArray = Array.isArray(row.Facility) ? row.Facility : [row.Facility];
    
    facilityArray.forEach(facility => {
      if (facility.$?.Type === 'Aisle') {
        facilities.push({ type: 'aisle' });
      } else if (facility.$?.Type === 'Seat') {
        const seat = facility.$;
        const characteristics = [];
        const charArray = facility.Characteristic ? 
          (Array.isArray(facility.Characteristic) ? facility.Characteristic : [facility.Characteristic]) : [];
        
        charArray.forEach(char => {
          if (char?.$) {
            characteristics.push({ code: char.$.PADISCode, value: char.$.Value });
          }
        });
        
        let seatType = 'center';
        if (characteristics.some(c => c.code === 'W')) seatType = 'window';
        else if (characteristics.some(c => c.code === 'A')) seatType = 'aisle';
        
        facilities.push({
          type: 'seat',
          seatCode: seat.SeatCode,
          seatType: seatType,
          availability: seat.Availability,
          isAvailable: seat.Availability === 'Available',
          isOccupied: seat.Availability === 'Occupied',
          isBlocked: seat.Availability === 'Blocked',
          isPaid: seat.Paid === 'true',
          isExitRow: characteristics.some(c => c.code === 'E'),
          hasExtraLegroom: characteristics.some(c => c.code === 'L'),
          isHandicapped: characteristics.some(c => c.code === 'H'),
          isPreferential: characteristics.some(c => c.code === 'O'),
          isFrontOfCabin: characteristics.some(c => c.code === 'FC'),
          optionalServiceRef: seat.OptionalServiceRef
        });
      }
    });
    
    if (facilities.length > 0) {
      rows.push({ rowNumber: parseInt(rowNumber), facilities });
    }
  });
  
  return {
    hasSeatMap: true,
    flightInfo,
    rows,
    totalSeats: rows.reduce((count, row) => 
      count + row.facilities.filter(f => f.type === 'seat' && f.isAvailable).length, 0
    )
  };
};

// ============================================================
// SEAT BUTTON COMPONENT
// ============================================================

const SeatButton = ({ seat, isSelected, onSelect }) => {
  const getStyles = () => {
    if (isSelected) return 'bg-[#FD561E] text-white border-[#FD561E] shadow-lg scale-105';
    if (seat.isOccupied) return 'bg-gray-300 text-gray-500 border-gray-400 cursor-not-allowed opacity-60';
    if (seat.isBlocked) return 'bg-red-100 text-red-600 border-red-300 cursor-not-allowed opacity-60';
    if (seat.isAvailable) return 'bg-green-100 text-green-700 border-green-300 cursor-pointer hover:bg-green-200';
    return 'bg-gray-100 text-gray-500 border-gray-300 cursor-not-allowed';
  };
  
  return (
    <button
      onClick={() => seat.isAvailable && onSelect(seat)}
      disabled={!seat.isAvailable}
      className={`w-12 h-12 md:w-14 md:h-14 rounded-lg md:rounded-xl border-2 flex flex-col items-center justify-center transition-all ${getStyles()}`}
      title={`${seat.seatCode} - ${seat.isExitRow ? 'Exit Row' : seat.hasExtraLegroom ? 'Extra Legroom' : 'Standard'}`}
    >
      <span className="text-xs font-mono font-semibold">{seat.seatCode}</span>
    </button>
  );
};

// ============================================================
// FLIGHT CARD COMPONENT
// ============================================================

const FlightCard = ({ flight, seatMap, selectedSeat, onSeatSelect, isActive, onActivate }) => {
  if (!seatMap?.hasSeatMap) {
    return (
      <div 
        className={`bg-white rounded-xl shadow-sm border p-6 cursor-pointer transition-all ${isActive ? 'ring-2 ring-[#FD561E]' : 'hover:shadow-md'}`}
        onClick={onActivate}
      >
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-bold text-gray-800">
              {flight.carrier} {flight.flightNumber}
            </h3>
            <p className="text-sm text-gray-500">
              {flight.origin} → {flight.destination}
            </p>
            <p className="text-xs text-gray-400">
              {new Date(flight.departureTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </p>
          </div>
          <div className="text-center">
            <div className="text-xs text-gray-500">No Seat Map</div>
            <FaExclamationTriangle className="text-yellow-500 mt-1" size={20} />
          </div>
        </div>
        <div className="text-center py-8 text-gray-400">
          <FaPlane className="mx-auto mb-2" size={30} />
          <p className="text-sm">Seat selection not available for this flight</p>
        </div>
      </div>
    );
  }
  
  return (
    <div 
      className={`bg-white rounded-xl shadow-sm border p-6 transition-all ${isActive ? 'ring-2 ring-[#FD561E]' : 'hover:shadow-md'}`}
      onClick={onActivate}
    >
      {/* Flight Header */}
      <div className="flex items-center justify-between mb-4 pb-3 border-b">
        <div>
          <h3 className="font-bold text-gray-800 text-lg">
            {flight.carrier} {flight.flightNumber}
          </h3>
          <p className="text-sm text-gray-500">
            {flight.origin} → {flight.destination}
          </p>
          <p className="text-xs text-gray-400">
            {new Date(flight.departureTime).toLocaleString()}
          </p>
        </div>
        {selectedSeat && (
          <div className="text-right bg-green-50 px-4 py-2 rounded-lg">
            <span className="text-xs text-gray-500">Selected Seat</span>
            <div className="text-xl font-bold text-[#FD561E]">{selectedSeat.seatCode}</div>
            <span className="text-xs text-green-600 flex items-center gap-1">
              <FaCheckCircle size={10} /> Confirmed
            </span>
          </div>
        )}
      </div>
      
      {/* Seat Map */}
      <div className="text-center mb-4">
        <div className="inline-block bg-gray-100 rounded-full px-6 py-1 text-sm">Cockpit</div>
      </div>
      
      <div className="space-y-2 max-h-[50vh] overflow-y-auto">
        {seatMap.rows?.map((row) => (
          <div key={row.rowNumber} className="flex items-center gap-2 md:gap-3">
            <div className="w-10 text-center font-mono text-gray-500 text-sm">{row.rowNumber}</div>
            <div className="flex gap-1 md:gap-2">
              {row.facilities.slice(0, 3).map((facility, idx) => (
                facility.type === 'aisle' 
                  ? <div key={`aisle-${idx}`} className="w-10 text-center text-gray-300">|</div>
                  : <SeatButton 
                      key={facility.seatCode} 
                      seat={facility} 
                      isSelected={selectedSeat?.seatCode === facility.seatCode} 
                      onSelect={onSeatSelect} 
                    />
              ))}
            </div>
            <div className="w-10 text-center text-gray-400 text-xs">AISLE</div>
            <div className="flex gap-1 md:gap-2">
              {row.facilities.slice(3, 6).map((facility, idx) => (
                facility.type === 'aisle'
                  ? <div key={`aisle-${idx}`} className="w-10 text-center text-gray-300">|</div>
                  : <SeatButton 
                      key={facility.seatCode} 
                      seat={facility} 
                      isSelected={selectedSeat?.seatCode === facility.seatCode} 
                      onSelect={onSeatSelect} 
                    />
              ))}
            </div>
          </div>
        ))}
      </div>
      
      <div className="text-center mt-4">
        <div className="inline-block bg-gray-100 rounded-full px-6 py-1 text-sm">Tail</div>
      </div>
      
      {/* Seat Legend */}
      <div className="flex justify-center gap-4 mt-4 pt-3 border-t text-xs">
        <div className="flex items-center gap-1">
          <div className="w-4 h-4 bg-green-100 border border-green-300 rounded"></div>
          <span>Available</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-4 h-4 bg-gray-300 border border-gray-400 rounded"></div>
          <span>Occupied</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-4 h-4 bg-red-100 border border-red-300 rounded"></div>
          <span>Blocked</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-4 h-4 bg-[#FD561E] rounded"></div>
          <span>Selected</span>
        </div>
      </div>
    </div>
  );
};

// ============================================================
// MAIN SEAT MAP PAGE
// ============================================================

const SeatMapPage = () => {
  const navigate = useNavigate();
  
  // Get context
  const pricingContext = usePricingBooking();
  const { storePnrResponse } = usePnrResponse();
  
  // State
  const [flightsData, setFlightsData] = useState([]);
  const [selectedSeats, setSelectedSeats] = useState({});
  const [loading, setLoading] = useState(true);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [activeFlightIndex, setActiveFlightIndex] = useState(0);
  
  // Ref to prevent multiple API calls
  const hasFetchedRef = useRef(false);
  const fetchingRef = useRef(false);
  
  // Get booking data from context
  const bookingData = pricingContext?.getCompleteBookingData();
  const flightSegments = bookingData?.flightSegments || [];
  const passengers = bookingData?.passengers || [];
  const contactInfo = bookingData?.contactInfo;
  
  // Initialize PNR service (only once)
  useEffect(() => {
    if (pricingContext && !pnrCreationService.pricingBookingContext) {
      pnrCreationService.setPricingBookingContext(pricingContext);
      console.log('✅ PNR Service initialized');
    }
  }, [pricingContext]);
  
  // Fetch seat maps - ONLY ONCE
  useEffect(() => {
    // Prevent multiple fetches
    if (hasFetchedRef.current || fetchingRef.current) {
      console.log('⏭️ Skipping fetch - already fetched or in progress');
      return;
    }
    
    const fetchAllSeatMaps = async () => {
      if (!flightSegments.length) {
        setLoading(false);
        return;
      }
      
      fetchingRef.current = true;
      setLoading(true);
      const results = [];
      
      console.log(`\n🚀 Fetching seat maps for ${flightSegments.length} flight(s)...`);
      
      for (let i = 0; i < flightSegments.length; i++) {
        const segment = flightSegments[i];
        console.log(`📌 [${i + 1}/${flightSegments.length}] Fetching for ${segment.carrier} ${segment.flightNumber}...`);
        
        try {
          const segmentBookingData = {
            ...bookingData,
            flightSegments: [segment],
            hostToken: bookingData?.hostToken,
            hostTokenRef: bookingData?.hostTokenRef
          };
          
          const result = await seatMapService.getSeatMap(segmentBookingData);
          
          if (result.success && result.rawResponse) {
            const parsed = parseSeatMapResponse(result.rawResponse, segment);
            results.push({
              flight: segment,
              seatMap: parsed,
              hasSeatMap: parsed.hasSeatMap
            });
            console.log(`   ✅ ${parsed.hasSeatMap ? 'Seat map loaded' : 'No seat map available'}`);
          } else {
            results.push({
              flight: segment,
              seatMap: { hasSeatMap: false, error: result.error },
              hasSeatMap: false
            });
            console.log(`   ❌ Failed: ${result.error}`);
          }
        } catch (error) {
          console.error(`   ❌ Error:`, error);
          results.push({
            flight: segment,
            seatMap: { hasSeatMap: false, error: error.message },
            hasSeatMap: false
          });
        }
      }
      
      setFlightsData(results);
      setLoading(false);
      hasFetchedRef.current = true;
      fetchingRef.current = false;
      console.log(`\n✅ Completed fetching ${results.length} flight(s)\n`);
    };
    
    fetchAllSeatMaps();
    
    // Cleanup function (optional)
    return () => {
      // Reset on unmount if needed
      // hasFetchedRef.current = false; // Uncomment if you want to refetch on remount
    };
  }, [flightSegments.length]); // Only depend on length, not the whole array
  
  // Handle seat selection
  const handleSeatSelect = useCallback((flightIndex, seat) => {
    setSelectedSeats(prev => ({
      ...prev,
      [flightIndex]: seat
    }));
    toast.success(`Seat ${seat.seatCode} selected on ${flightsData[flightIndex]?.flight?.carrier} ${flightsData[flightIndex]?.flight?.flightNumber}`);
  }, [flightsData]);
  
  // ============ SKIP AND BOOK ============
  const handleSkipAndBook = useCallback(async () => {
    setBookingLoading(true);
    
    try {
      console.log('\n📤 Creating PNR without seat selection...');
      const result = await pnrCreationService.createPNR();
      
      if (result.success) {
        storePnrResponse(result.rawResponse);
        toast.success('Booking confirmed successfully!');
        navigate('/flights/passenger-review');
      } else {
        throw new Error(result.error || 'Booking failed');
      }
    } catch (error) {
      console.error('Booking failed:', error);
      toast.error(`Booking failed: ${error.message}`);
    } finally {
      setBookingLoading(false);
    }
  }, [storePnrResponse, navigate]);
  
  // ============ CONFIRM AND BOOK WITH SEATS ============
  const handleConfirmAndBook = useCallback(async () => {
    const hasAnySeatSelected = Object.keys(selectedSeats).length > 0;
    
    if (!hasAnySeatSelected) {
      toast.error('Please select at least one seat or use Skip & Book');
      return;
    }
    
    setBookingLoading(true);
    
    try {
      pricingContext?.updateBookingData({ 
        selectedSeats: selectedSeats,
        selectedSeatsList: Object.entries(selectedSeats).map(([idx, seat]) => ({
          flightIndex: parseInt(idx),
          flightInfo: flightsData[parseInt(idx)]?.flight,
          seat: seat
        }))
      });
      
      console.log('\n📤 Creating PNR with seat selection...');
      const result = await pnrCreationService.createPNR();
      
      if (result.success) {
        storePnrResponse(result.rawResponse);
        toast.success(`Booking confirmed with ${Object.keys(selectedSeats).length} seat(s) selected!`);
        navigate('/flights/passenger-review');
      } else {
        throw new Error(result.error || 'Booking failed');
      }
    } catch (error) {
      console.error('Booking failed:', error);
      toast.error(`Booking failed: ${error.message}`);
    } finally {
      setBookingLoading(false);
    }
  }, [selectedSeats, flightsData, pricingContext, storePnrResponse, navigate]);
  
  const handleBack = useCallback(() => navigate(-1), [navigate]);
  
  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FD561E] mx-auto mb-4"></div>
          <p className="text-gray-600">Loading seat maps for {flightSegments.length} flight(s)...</p>
        </div>
      </div>
    );
  }
  
  // Calculate statistics
  const totalFlights = flightsData.length;
  const flightsWithSeatMap = flightsData.filter(f => f.hasSeatMap).length;
  const totalSelectedSeats = Object.keys(selectedSeats).length;
  
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b sticky top-0 z-20">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center">
              <button onClick={handleBack} className="text-gray-600 hover:text-[#FD561E] mr-4">
                <FaArrowLeft size={20} />
              </button>
              <div>
                <h1 className="text-xl font-bold text-gray-800">Select Your Seats</h1>
                <p className="text-xs text-gray-500">
                  {passengers.length} passenger(s) • {totalFlights} flight(s) • {flightsWithSeatMap} with seat maps
                </p>
              </div>
            </div>
            
            {/* Selection Summary */}
            {totalSelectedSeats > 0 && (
              <div className="bg-green-50 px-4 py-2 rounded-lg">
                <span className="text-sm text-green-700">
                  {totalSelectedSeats} seat(s) selected
                </span>
              </div>
            )}
          </div>
        </div>
        <div className="h-1 bg-gradient-to-r from-[#FD561E] to-[#ff7b4a]"></div>
      </div>
      
      <div className="container mx-auto px-4 py-6">
        {/* Flight Cards Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {flightsData.map((flightData, idx) => (
            <FlightCard
              key={idx}
              flight={flightData.flight}
              seatMap={flightData.seatMap}
              selectedSeat={selectedSeats[idx]}
              onSeatSelect={(seat) => handleSeatSelect(idx, seat)}
              isActive={activeFlightIndex === idx}
              onActivate={() => setActiveFlightIndex(idx)}
            />
          ))}
        </div>
        
        {/* Fixed Bottom Action Bar */}
        <div className="sticky bottom-0 bg-white border-t shadow-lg rounded-t-xl mt-4">
          <div className="container mx-auto px-4 py-4">
            <div className="flex flex-col sm:flex-row gap-3 justify-between items-center">
              <div className="text-sm text-gray-500 order-2 sm:order-1">
                {totalSelectedSeats > 0 ? (
                  <span>✅ You have selected {totalSelectedSeats} seat(s)</span>
                ) : (
                  <span>⚠️ No seats selected. You can skip or select seats above</span>
                )}
              </div>
              <div className="flex gap-3 w-full sm:w-auto order-1 sm:order-2">
                <button 
                  onClick={handleSkipAndBook} 
                  disabled={bookingLoading}
                  className="flex-1 sm:flex-none bg-gray-500 text-white px-8 py-3 rounded-lg hover:bg-gray-600 transition-all disabled:opacity-50"
                >
                  {bookingLoading ? <FaSpinner className="animate-spin mx-auto" /> : 'Skip & Book'}
                </button>
                <button 
                  onClick={handleConfirmAndBook} 
                  disabled={totalSelectedSeats === 0 || bookingLoading}
                  className={`flex-1 sm:flex-none px-8 py-3 rounded-lg flex items-center justify-center gap-2 transition-all ${
                    totalSelectedSeats > 0 && !bookingLoading 
                      ? 'bg-[#FD561E] text-white hover:bg-[#e04e1b]' 
                      : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  {bookingLoading ? (
                    <FaSpinner className="animate-spin" />
                  ) : (
                    <>
                      Confirm & Book ({totalSelectedSeats})
                      <FaArrowRight size={14} />
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SeatMapPage;