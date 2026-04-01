// src/modules/flights/pages/SeatMapPage.jsx

import React, { useState, useEffect, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  FaArrowLeft,
  FaPlane,
  FaCalendarAlt,
  FaUser,
  FaInfoCircle,
  FaCheckCircle,
  FaRupeeSign,
  FaWallet,
  FaWindowMaximize,
  FaWheelchair,
  FaChair,
  FaExclamationTriangle,
  FaStar,
  FaLock,
  FaUnlockAlt,
  FaArrowRight,
  FaDoorOpen,
  FaSpinner,
  FaCouch,
  FaCreditCard
} from 'react-icons/fa';
import { MdAirlineSeatReclineNormal, MdExitToApp, MdAccessible } from 'react-icons/md';
import { GiExtraTime, GiMoneyStack } from 'react-icons/gi';
import { toast } from 'react-toastify';
import seatMapService from '../services/seatMapService';
import pnrCreationService from '../services/pnr_creationService';

// ============================================================
// HELPER FUNCTIONS
// ============================================================

const formatTime = (isoString) => {
  if (!isoString) return '--:--';
  try {
    const date = new Date(isoString);
    return date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
  } catch {
    return '--:--';
  }
};

const formatDate = (isoString) => {
  if (!isoString) return '';
  try {
    const date = new Date(isoString);
    return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  } catch {
    return '';
  }
};

const formatPrice = (price) => {
  if (!price) return '₹0';
  return `₹${price.toLocaleString('en-IN')}`;
};

// ============================================================
// SEAT MAP PARSER - HANDLES ANY RESPONSE STRUCTURE
// ============================================================

const parseSeatMapResponse = (response) => {
  console.log('\n🔍 PARSING SEAT MAP RESPONSE');
  
  if (!response || !response.success) {
    console.error('❌ Invalid seat map response');
    return null;
  }

  const data = response.data || {};
  
  // Extract flight information
  let flightInfo = null;
  let travelerInfo = null;
  let rowsData = [];
  let warnings = [];

  // Parse AirSegment
  const airSegment = data.AirSegment;
  if (airSegment) {
    const seg = airSegment.$ || airSegment;
    flightInfo = {
      key: seg.Key,
      carrier: seg.Carrier,
      flightNumber: seg.FlightNumber,
      origin: seg.Origin,
      destination: seg.Destination,
      departureTime: seg.DepartureTime,
      arrivalTime: seg.ArrivalTime,
      classOfService: seg.ClassOfService,
      equipment: seg.Equipment,
      status: seg.Status,
      group: seg.Group,
      providerCode: seg.ProviderCode
    };
  }

  // Parse SearchTraveler
  const searchTraveler = data.SearchTraveler;
  if (searchTraveler) {
    const traveler = searchTraveler.$ || searchTraveler;
    const name = searchTraveler.Name?.$ || {};
    travelerInfo = {
      key: traveler.Key,
      code: traveler.Code,
      firstName: name.First,
      lastName: name.Last,
      type: traveler.Code === 'ADT' ? 'Adult' : traveler.Code === 'CNN' ? 'Child' : 'Infant'
    };
  }

  // Parse ResponseMessage for warnings
  const responseMsg = data.ResponseMessage;
  if (responseMsg) {
    warnings.push({
      message: responseMsg._,
      code: responseMsg.$?.Code,
      type: responseMsg.$?.Type
    });
  }

  // Parse Rows
  const rows = data.Rows;
  if (rows) {
    const rowArray = Array.isArray(rows.Row) ? rows.Row : [rows.Row];
    
    rowsData = rowArray.map(row => {
      const rowNumber = row.$?.Number;
      const rowChar = row.Characteristic;
      const rowCharacteristics = [];
      
      if (rowChar) {
        const charArray = Array.isArray(rowChar) ? rowChar : [rowChar];
        charArray.forEach(char => {
          if (char.$) {
            rowCharacteristics.push({
              value: char.$.Value,
              code: char.$.PADISCode
            });
          }
        });
      }
      
      const facilities = [];
      const facilityArray = Array.isArray(row.Facility) ? row.Facility : [row.Facility];
      
      facilityArray.forEach(facility => {
        const facilityType = facility.$?.Type;
        
        if (facilityType === 'Aisle') {
          facilities.push({
            type: 'aisle',
            isAisle: true
          });
        } else if (facilityType === 'Seat') {
          const seat = facility.$;
          const characteristics = [];
          
          const charArray = Array.isArray(facility.Characteristic) ? facility.Characteristic : [facility.Characteristic];
          charArray.forEach(char => {
            if (char?.$) {
              characteristics.push({
                value: char.$.Value,
                code: char.$.PADISCode
              });
            }
          });
          
          let seatType = 'center';
          const hasWindow = characteristics.some(c => c.code === 'W');
          const hasAisle = characteristics.some(c => c.code === 'A');
          
          if (hasWindow) seatType = 'window';
          else if (hasAisle) seatType = 'aisle';
          else seatType = 'center';
          
          const availability = seat.Availability || 'Unknown';
          const isPaid = seat.Paid === 'true';
          const isBlocked = availability === 'Blocked';
          const isOccupied = availability === 'Occupied';
          const isAvailable = availability === 'Available';
          
          facilities.push({
            type: 'seat',
            seatCode: seat.SeatCode,
            seatType: seatType,
            availability: availability,
            isAvailable: isAvailable,
            isOccupied: isOccupied,
            isBlocked: isBlocked,
            isPaid: isPaid,
            price: seat.Price ? parseFloat(seat.Price) : null,
            characteristics: characteristics,
            hasExtraLegroom: characteristics.some(c => c.code === 'L'),
            isExitRow: characteristics.some(c => c.code === 'E'),
            hasRestrictedRecline: characteristics.some(c => c.code === '1D'),
            isHandicapped: characteristics.some(c => c.code === 'H'),
            isPreferential: characteristics.some(c => c.code === 'O'),
            isFrontOfCabin: characteristics.some(c => c.code === 'FC')
          });
        }
      });
      
      return {
        rowNumber: parseInt(rowNumber),
        characteristics: rowCharacteristics,
        isExitRow: rowCharacteristics.some(c => c.code === 'E'),
        facilities: facilities
      };
    });
  }

  const result = {
    flightInfo,
    travelerInfo,
    rows: rowsData,
    warnings,
    hasWarnings: warnings.length > 0
  };
  
  console.log('✅ Seat map parsed successfully!');
  return result;
};

// ============================================================
// SEAT ICON COMPONENT
// ============================================================

const SeatIcon = ({ seatType, hasExtraLegroom, isExitRow, hasRestrictedRecline, isHandicapped }) => {
  if (isHandicapped) return <MdAccessible size={18} className="text-blue-500" />;
  if (isExitRow) return <MdExitToApp size={18} className="text-amber-500" />;
  if (hasExtraLegroom) return <GiExtraTime size={18} className="text-purple-500" />;
  if (hasRestrictedRecline) return <FaExclamationTriangle size={14} className="text-orange-500" />;
  
  switch (seatType) {
    case 'window':
      return <FaWindowMaximize size={16} className="text-blue-400" />;
    case 'aisle':
      return <FaDoorOpen size={16} className="text-green-500" />;
    default:
      return <FaChair size={14} className="text-gray-400" />;
  }
};

// ============================================================
// SEAT BUTTON COMPONENT
// ============================================================

const SeatButton = ({ seat, isSelected, onSelect }) => {
  const getStatusStyles = () => {
    if (isSelected) {
      return 'bg-orange-500 text-white border-orange-600 shadow-lg transform scale-105';
    }
    if (seat.isOccupied) {
      return 'bg-gray-300 text-gray-500 border-gray-400 cursor-not-allowed opacity-60';
    }
    if (seat.isBlocked) {
      if (seat.isPaid) {
        return 'bg-amber-100 text-amber-700 border-amber-300 cursor-pointer hover:bg-amber-200';
      }
      return 'bg-red-100 text-red-600 border-red-300 cursor-not-allowed opacity-60';
    }
    if (seat.isAvailable) {
      return 'bg-green-100 text-green-700 border-green-300 cursor-pointer hover:bg-green-200 hover:shadow-md';
    }
    return 'bg-gray-100 text-gray-500 border-gray-300 cursor-not-allowed';
  };
  
  const isSelectable = seat.isAvailable || (seat.isBlocked && seat.isPaid);
  
  return (
    <button
      onClick={() => isSelectable && onSelect(seat)}
      disabled={!isSelectable}
      className={`w-14 h-14 rounded-xl border-2 flex flex-col items-center justify-center transition-all ${getStatusStyles()}`}
    >
      <SeatIcon 
        seatType={seat.seatType}
        hasExtraLegroom={seat.hasExtraLegroom}
        isExitRow={seat.isExitRow}
        hasRestrictedRecline={seat.hasRestrictedRecline}
        isHandicapped={seat.isHandicapped}
      />
      <span className="text-xs font-mono mt-1 font-semibold">{seat.seatCode}</span>
      {seat.isPaid && seat.isBlocked && (
        <GiMoneyStack size={10} className="text-amber-600 mt-0.5" />
      )}
    </button>
  );
};

// ============================================================
// SEAT DETAILS PANEL
// ============================================================

const SeatDetailsPanel = ({ selectedSeat, onSelect, onCancel }) => {
  if (!selectedSeat) return null;
  
  const getSeatTypeName = () => {
    if (selectedSeat.seatType === 'window') return 'Window Seat';
    if (selectedSeat.seatType === 'aisle') return 'Aisle Seat';
    return 'Center Seat';
  };
  
  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
      <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-4 text-white">
        <h3 className="font-semibold text-lg flex items-center gap-2">
          <FaChair /> Selected Seat
        </h3>
      </div>
      <div className="p-5 space-y-4">
        <div className="text-center">
          <div className="text-4xl font-bold text-blue-600">{selectedSeat.seatCode}</div>
          <div className="text-sm text-gray-500 mt-1">{getSeatTypeName()}</div>
        </div>
        
        <div className="space-y-2 text-sm">
          {selectedSeat.hasExtraLegroom && (
            <div className="flex items-center gap-2 text-purple-600">
              <GiExtraTime size={16} /> Extra Legroom
            </div>
          )}
          {selectedSeat.isExitRow && (
            <div className="flex items-center gap-2 text-amber-600">
              <MdExitToApp size={16} /> Exit Row
            </div>
          )}
          {selectedSeat.isHandicapped && (
            <div className="flex items-center gap-2 text-blue-600">
              <MdAccessible size={16} /> Handicap Accessible
            </div>
          )}
          {selectedSeat.isPreferential && (
            <div className="flex items-center gap-2 text-purple-600">
              <FaStar size={14} /> Preferred Seat
            </div>
          )}
          {selectedSeat.isFrontOfCabin && (
            <div className="flex items-center gap-2 text-blue-600">
              <FaPlane size={14} /> Front of Cabin
            </div>
          )}
          {selectedSeat.hasRestrictedRecline && (
            <div className="flex items-center gap-2 text-orange-600">
              <FaExclamationTriangle size={14} /> Limited Recline
            </div>
          )}
        </div>
        
        {selectedSeat.isPaid && selectedSeat.price && (
          <div className="bg-amber-50 rounded-lg p-3 border border-amber-200">
            <div className="flex items-center gap-2 text-amber-700">
              <FaRupeeSign size={14} />
              <span className="font-semibold">Price: {formatPrice(selectedSeat.price)}</span>
            </div>
          </div>
        )}
        
        <div className="flex gap-3 pt-3">
          <button
            onClick={() => onSelect(selectedSeat)}
            className="flex-1 bg-gradient-to-r from-green-500 to-green-600 text-white py-3 rounded-lg font-semibold hover:shadow-lg transition-all flex items-center justify-center gap-2"
          >
            <FaCheckCircle size={16} /> Select This Seat
          </button>
          <button
            onClick={onCancel}
            className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-200 transition-all"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

// ============================================================
// LEGEND COMPONENT
// ============================================================

const SeatLegend = () => {
  const legendItems = [
    { color: 'bg-green-100 border-green-300', text: 'Available', icon: <FaUnlockAlt size={12} /> },
    { color: 'bg-amber-100 border-amber-300', text: 'Paid Seat', icon: <GiMoneyStack size={12} /> },
    { color: 'bg-gray-300 border-gray-400', text: 'Occupied', icon: <FaLock size={12} /> },
    { color: 'bg-red-100 border-red-300', text: 'Blocked', icon: <FaLock size={12} /> },
    { color: 'bg-orange-500 border-orange-600', text: 'Selected', icon: <FaCheckCircle size={12} /> }
  ];
  
  const featureItems = [
    { icon: <FaWindowMaximize size={14} />, text: 'Window' },
    { icon: <FaDoorOpen size={14} />, text: 'Aisle' },
    { icon: <FaChair size={14} />, text: 'Center' },
    { icon: <GiExtraTime size={14} />, text: 'Extra Legroom' },
    { icon: <MdExitToApp size={14} />, text: 'Exit Row' },
    { icon: <MdAccessible size={14} />, text: 'Handicap' }
  ];
  
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
      <h4 className="font-semibold text-gray-700 mb-3 text-sm">Seat Legend</h4>
      <div className="grid grid-cols-3 gap-3 mb-4">
        {legendItems.map((item, idx) => (
          <div key={idx} className="flex items-center gap-2 text-xs">
            <div className={`w-8 h-8 rounded-lg border ${item.color} flex items-center justify-center`}>
              {item.icon}
            </div>
            <span className="text-gray-600">{item.text}</span>
          </div>
        ))}
      </div>
      <div className="border-t pt-3">
        <div className="flex flex-wrap gap-3">
          {featureItems.map((item, idx) => (
            <div key={idx} className="flex items-center gap-1 text-xs text-gray-500">
              {item.icon}
              <span>{item.text}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// ============================================================
// TRANSFORM API RESPONSE TO REVIEW PAGE FORMAT
// ============================================================

const transformToReviewPageFormat = (apiResult) => {
  console.log('\n🔄 Transforming API response to review page format...');
  console.log('📦 Raw apiResult:', apiResult);
  
  // The apiResult structure from pnrCreationService.createPNR() returns:
  // {
  //   success: true,
  //   bookingConfirmation: {...},
  //   bookingRequest: {...},
  //   rawResponse: {...}
  // }
  
  const { bookingConfirmation, bookingRequest, rawResponse } = apiResult;
  
  console.log('📦 bookingConfirmation from API:', bookingConfirmation);
  
  // ============================================================
  // EXTRACT FLIGHT SEGMENTS
  // ============================================================
  const flightSegments = [];
  
  // Priority 1: Get from bookingConfirmation.flightSegments (already parsed)
  if (bookingConfirmation?.flightSegments && bookingConfirmation.flightSegments.length > 0) {
    console.log('✅ Using flightSegments from bookingConfirmation');
    flightSegments.push(...bookingConfirmation.flightSegments);
  } 
  // Priority 2: Parse from rawResponse if needed
  else if (rawResponse?.data?.['SOAP:Envelope']?.['SOAP:Body']?.['universal:AirCreateReservationRsp']?.['universal:UniversalRecord']?.['air:AirReservation']?.['air:AirSegment']) {
    console.log('🔄 Parsing flight segments from rawResponse');
    const airSegment = rawResponse.data['SOAP:Envelope']['SOAP:Body']['universal:AirCreateReservationRsp']['universal:UniversalRecord']['air:AirReservation']['air:AirSegment'];
    const segments = Array.isArray(airSegment) ? airSegment : [airSegment];
    
    segments.forEach(segment => {
      flightSegments.push({
        key: segment.$?.Key,
        carrier: segment.$?.Carrier,
        flightNumber: segment.$?.FlightNumber,
        origin: segment.$?.Origin,
        destination: segment.$?.Destination,
        departureTime: segment.$?.DepartureTime,
        arrivalTime: segment.$?.ArrivalTime,
        classOfService: segment.$?.ClassOfService,
        status: segment.$?.Status,
        equipment: segment.$?.Equipment,
        providerCode: segment.$?.ProviderCode,
        travelTime: segment.$?.TravelTime,
        distance: segment.$?.Distance,
        baggageAllowance: "15kg" // From the response, baggage is 15kg
      });
    });
  }
  
  // ============================================================
  // EXTRACT PASSENGERS
  // ============================================================
  const passengersBooked = [];
  
  // Priority 1: Get from bookingConfirmation.passengersBooked
  if (bookingConfirmation?.passengersBooked && bookingConfirmation.passengersBooked.length > 0) {
    console.log('✅ Using passengersBooked from bookingConfirmation');
    passengersBooked.push(...bookingConfirmation.passengersBooked);
  }
  // Priority 2: Parse from rawResponse
  else if (rawResponse?.data?.['SOAP:Envelope']?.['SOAP:Body']?.['universal:AirCreateReservationRsp']?.['universal:UniversalRecord']?.['common_v54_0:BookingTraveler']) {
    console.log('🔄 Parsing passengers from rawResponse');
    const bookingTraveler = rawResponse.data['SOAP:Envelope']['SOAP:Body']['universal:AirCreateReservationRsp']['universal:UniversalRecord']['common_v54_0:BookingTraveler'];
    const travelers = Array.isArray(bookingTraveler) ? bookingTraveler : [bookingTraveler];
    
    travelers.forEach(traveler => {
      const travelerName = traveler['common_v54_0:BookingTravelerName'];
      passengersBooked.push({
        key: traveler.$?.Key,
        type: traveler.$?.TravelerType,
        age: traveler.$?.Age,
        dob: traveler.$?.DOB,
        gender: traveler.$?.Gender,
        name: {
          prefix: travelerName?.$?.Prefix,
          first: travelerName?.$?.First,
          last: travelerName?.$?.Last
        }
      });
    });
  }
  
  // ============================================================
  // EXTRACT PRICING INFO
  // ============================================================
  const pricingInfo = [];
  
  // Priority 1: Get from bookingConfirmation.pricingInfo
  if (bookingConfirmation?.pricingInfo && bookingConfirmation.pricingInfo.length > 0) {
    console.log('✅ Using pricingInfo from bookingConfirmation');
    pricingInfo.push(...bookingConfirmation.pricingInfo);
  }
  // Priority 2: Parse from rawResponse
  else if (rawResponse?.data?.['SOAP:Envelope']?.['SOAP:Body']?.['universal:AirCreateReservationRsp']?.['universal:UniversalRecord']?.['air:AirReservation']?.['air:AirPricingInfo']) {
    console.log('🔄 Parsing pricing info from rawResponse');
    const airPricingInfo = rawResponse.data['SOAP:Envelope']['SOAP:Body']['universal:AirCreateReservationRsp']['universal:UniversalRecord']['air:AirReservation']['air:AirPricingInfo'];
    const pricingInfos = Array.isArray(airPricingInfo) ? airPricingInfo : [airPricingInfo];
    
    pricingInfos.forEach(pricing => {
      const fareInfo = pricing['air:FareInfo'];
      const bookingInfo = pricing['air:BookingInfo'];
      
      pricingInfo.push({
        key: pricing.$?.Key,
        totalPrice: pricing.$?.TotalPrice,
        basePrice: pricing.$?.BasePrice,
        taxes: pricing.$?.Taxes,
        platingCarrier: pricing.$?.PlatingCarrier,
        providerCode: pricing.$?.ProviderCode,
        latestTicketingTime: pricing.$?.LatestTicketingTime,
        refundable: pricing.$?.Refundable === 'true',
        eticketability: pricing.$?.ETicketability,
        fareInfo: fareInfo ? {
          fareBasis: fareInfo.$?.FareBasis,
          amount: fareInfo.$?.Amount,
          origin: fareInfo.$?.Origin,
          destination: fareInfo.$?.Destination,
          effectiveDate: fareInfo.$?.EffectiveDate,
          passengerTypeCode: fareInfo.$?.PassengerTypeCode
        } : null,
        bookingInfo: bookingInfo ? {
          bookingCode: bookingInfo.$?.BookingCode,
          cabinClass: bookingInfo.$?.CabinClass,
          segmentRef: bookingInfo.$?.SegmentRef,
          fareInfoRef: bookingInfo.$?.FareInfoRef
        } : null
      });
    });
  }
  
  // ============================================================
  // EXTRACT CONTACT INFO FROM SSR
  // ============================================================
  let contactPhone = null;
  let contactEmail = null;
  
  if (bookingConfirmation?.contactInfo) {
    contactPhone = bookingConfirmation.contactInfo.phone;
    contactEmail = bookingConfirmation.contactInfo.email;
  } 
  else if (rawResponse?.data?.['SOAP:Envelope']?.['SOAP:Body']?.['universal:AirCreateReservationRsp']?.['universal:UniversalRecord']?.['common_v54_0:SSR']) {
    console.log('🔄 Parsing contact info from SSR in rawResponse');
    const ssrList = rawResponse.data['SOAP:Envelope']['SOAP:Body']['universal:AirCreateReservationRsp']['universal:UniversalRecord']['common_v54_0:SSR'];
    const ssrArray = Array.isArray(ssrList) ? ssrList : [ssrList];
    
    ssrArray.forEach(ssr => {
      if (ssr.$?.Type === 'CTCM') {
        contactPhone = ssr.$?.FreeText;
      } else if (ssr.$?.Type === 'CTCE') {
        contactEmail = ssr.$?.FreeText;
      }
    });
  }
  
  // ============================================================
  // EXTRACT LOCATOR CODES
  // ============================================================
  let universalLocator = null;
  let airLocatorCode = null;
  let providerLocatorCode = null;
  let providerCode = null;
  let owningPCC = null;
  let universalStatus = null;
  let warnings = [];
  
  // From bookingConfirmation
  if (bookingConfirmation) {
    universalLocator = bookingConfirmation.universalLocator;
    airLocatorCode = bookingConfirmation.airLocatorCode;
    providerLocatorCode = bookingConfirmation.providerLocatorCode;
    providerCode = bookingConfirmation.providerCode;
    owningPCC = bookingConfirmation.owningPCC;
    universalStatus = bookingConfirmation.universalStatus;
    warnings = bookingConfirmation.warnings || [];
  }
  // Parse from rawResponse
  else if (rawResponse?.data?.['SOAP:Envelope']?.['SOAP:Body']?.['universal:AirCreateReservationRsp']?.['universal:UniversalRecord']) {
    console.log('🔄 Parsing locator codes from rawResponse');
    const universalRecord = rawResponse.data['SOAP:Envelope']['SOAP:Body']['universal:AirCreateReservationRsp']['universal:UniversalRecord'];
    const airReservation = universalRecord['air:AirReservation'];
    const providerReservationInfo = universalRecord['universal:ProviderReservationInfo'];
    
    universalLocator = universalRecord.$?.LocatorCode;
    universalStatus = universalRecord.$?.Status;
    airLocatorCode = airReservation?.$?.LocatorCode;
    providerLocatorCode = providerReservationInfo?.$?.LocatorCode;
    providerCode = providerReservationInfo?.$?.ProviderCode;
    owningPCC = providerReservationInfo?.$?.OwningPCC;
    
    // Extract warnings from ResponseMessage
    const responseMsg = rawResponse.data['SOAP:Envelope']['SOAP:Body']['universal:AirCreateReservationRsp']['common_v54_0:ResponseMessage'];
    if (responseMsg && responseMsg.$?.Type === 'Warning') {
      warnings = [{ message: responseMsg._ || responseMsg, code: responseMsg.$?.Code }];
    }
  }
  
  // ============================================================
  // EXTRACT PAYMENT TYPE
  // ============================================================
  let paymentType = 'Cash';
  if (bookingConfirmation?.paymentType) {
    paymentType = bookingConfirmation.paymentType;
  } 
  else if (rawResponse?.data?.['SOAP:Envelope']?.['SOAP:Body']?.['universal:AirCreateReservationRsp']?.['universal:UniversalRecord']?.['common_v54_0:FormOfPayment']) {
    const formOfPayment = rawResponse.data['SOAP:Envelope']['SOAP:Body']['universal:AirCreateReservationRsp']['universal:UniversalRecord']['common_v54_0:FormOfPayment'];
    paymentType = formOfPayment.$?.Type || 'Cash';
  }
  
  // ============================================================
  // EXTRACT TOTAL PRICE
  // ============================================================
  let totalPrice = 'INR0';
  if (bookingConfirmation?.totalPrice) {
    totalPrice = bookingConfirmation.totalPrice;
  } 
  else if (pricingInfo.length > 0 && pricingInfo[0].totalPrice) {
    totalPrice = pricingInfo[0].totalPrice;
  }
  else if (rawResponse?.data?.['SOAP:Envelope']?.['SOAP:Body']?.['universal:AirCreateReservationRsp']?.['universal:UniversalRecord']?.['air:AirReservation']?.['air:AirPricingInfo']?.$?.TotalPrice) {
    totalPrice = rawResponse.data['SOAP:Envelope']['SOAP:Body']['universal:AirCreateReservationRsp']['universal:UniversalRecord']['air:AirReservation']['air:AirPricingInfo'].$.TotalPrice;
  }
  
  // ============================================================
  // EXTRACT TRANSACTION DETAILS
  // ============================================================
  let traceId = null;
  let transactionId = null;
  let responseTime = null;
  
  if (bookingConfirmation?.traceId) {
    traceId = bookingConfirmation.traceId;
    transactionId = bookingConfirmation.transactionId;
    responseTime = bookingConfirmation.responseTime;
  }
  else if (rawResponse?.data?.['SOAP:Envelope']?.['SOAP:Body']?.['universal:AirCreateReservationRsp']?.$) {
    const rsp = rawResponse.data['SOAP:Envelope']['SOAP:Body']['universal:AirCreateReservationRsp'].$;
    traceId = rsp.TraceId;
    transactionId = rsp.TransactionId;
    responseTime = rsp.ResponseTime;
  }
  
  // ============================================================
  // BUILD FINAL REVIEW DATA
  // ============================================================
  const reviewData = {
    success: true,
    hasWarnings: warnings.length > 0,
    warnings: warnings.map(w => w.message || w),
    universalLocator: universalLocator,
    universalVersion: bookingConfirmation?.universalVersion || '0',
    universalStatus: universalStatus || 'Active',
    airLocatorCode: airLocatorCode,
    providerLocatorCode: providerLocatorCode,
    providerCode: providerCode,
    owningPCC: owningPCC,
    totalPrice: totalPrice,
    passengersBooked: passengersBooked,
    flightSegments: flightSegments,
    pricingInfo: pricingInfo,
    contactInfo: {
      phone: contactPhone,
      email: contactEmail
    },
    paymentType: paymentType,
    agencyInfo: bookingConfirmation?.agencyInfo || null,
    traceId: traceId,
    transactionId: transactionId,
    responseTime: responseTime
  };
  
  console.log('\n✅ TRANSFORMED DATA SUMMARY:');
  console.log('   - universalLocator:', reviewData.universalLocator);
  console.log('   - airLocatorCode:', reviewData.airLocatorCode);
  console.log('   - providerLocatorCode:', reviewData.providerLocatorCode);
  console.log('   - totalPrice:', reviewData.totalPrice);
  console.log('   - passengers:', reviewData.passengersBooked.length);
  console.log('   - flightSegments:', reviewData.flightSegments.length);
  console.log('   - pricingInfo:', reviewData.pricingInfo.length);
  console.log('   - contactPhone:', reviewData.contactInfo.phone);
  console.log('   - contactEmail:', reviewData.contactInfo.email);
  console.log('   - warnings:', reviewData.warnings.length);
  
  return reviewData;
};

// ============================================================
// MAIN SEAT MAP PAGE COMPONENT
// ============================================================

const SeatMapPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state || {};
  
  // Get all booking data from navigation state
  const bookingData = state.bookingData;
  
  const [parsedData, setParsedData] = useState(null);
  const [selectedSeat, setSelectedSeat] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [seatMapResponse, setSeatMapResponse] = useState(null);
  
  // Log received booking data for debugging
  console.log('\n📦 SEAT MAP PAGE - RECEIVED BOOKING DATA:');
  console.log('   - isRoundTrip:', bookingData?.isRoundTrip);
  console.log('   - passengers:', bookingData?.passengers?.length);
  console.log('   - selectedPricingOption exists:', !!bookingData?.selectedPricingOption);
  console.log('   - rawPricingResponse exists:', !!bookingData?.rawPricingResponse);
  console.log('   - flight exists:', !!bookingData?.flight);
  console.log('   - outboundFlight exists:', !!bookingData?.outboundFlight);
  console.log('   - returnFlight exists:', !!bookingData?.returnFlight);
  
  // Fetch seat map on mount
  useEffect(() => {
    const fetchSeatMap = async () => {
      if (!bookingData) {
        setError('No booking data found');
        setLoading(false);
        return;
      }
      
      setLoading(true);
      
      try {
        // Build seat map request from booking data
        const seatMapRequest = seatMapService.buildSeatMapRequest(bookingData);
        
        if (!seatMapRequest) {
          throw new Error('Failed to build seat map request');
        }
        
        console.log('\n📦 SEAT MAP REQUEST:');
        console.log(JSON.stringify(seatMapRequest, null, 2));
        
        // Call seat map API
        const result = await seatMapService.getSeatMap(seatMapRequest);
        
        if (result.success) {
          setSeatMapResponse(result.rawResponse);
          const parsed = parseSeatMapResponse(result.rawResponse);
          if (parsed) {
            setParsedData(parsed);
          } else {
            throw new Error('Failed to parse seat map data');
          }
        } else {
          throw new Error(result.error || 'Failed to fetch seat map');
        }
      } catch (err) {
        console.error('Error fetching seat map:', err);
        setError(err.message || 'Unable to load seat map');
      } finally {
        setLoading(false);
      }
    };
    
    fetchSeatMap();
  }, [bookingData]);
  
  // Handle seat selection
  const handleSeatSelect = useCallback((seat) => {
    setSelectedSeat(seat);
    console.log('✅ Seat selected:', seat);
  }, []);
  
  // Handle cancel selection
  const handleCancelSelection = useCallback(() => {
    setSelectedSeat(null);
  }, []);
  
  // Handle proceed with selected seat
  const handleConfirmAndBook = useCallback(async () => {
    if (!selectedSeat) {
      toast.error('Please select a seat first');
      return;
    }
    
    setBookingLoading(true);
    
    try {
      // Prepare booking data with selected seat
      const bookingDataWithSeat = {
        ...bookingData,
        selectedSeat: {
          seatCode: selectedSeat.seatCode,
          seatKey: selectedSeat.key,
          seatType: selectedSeat.seatType,
          price: selectedSeat.price,
          segmentRef: selectedSeat.segmentRef,
          isPaid: selectedSeat.isPaid,
          hasExtraLegroom: selectedSeat.hasExtraLegroom,
          isExitRow: selectedSeat.isExitRow,
          isHandicapped: selectedSeat.isHandicapped,
          isPreferential: selectedSeat.isPreferential,
          isFrontOfCabin: selectedSeat.isFrontOfCabin,
          hasRestrictedRecline: selectedSeat.hasRestrictedRecline,
          characteristics: selectedSeat.characteristics
        }
      };
      
      console.log('\n📦 CALLING PNR CREATION WITH SELECTED SEAT:');
      console.log('   - Selected Seat:', selectedSeat.seatCode);
      
      // Call PNR creation API
      const result = await pnrCreationService.createPNR(bookingDataWithSeat);
      
      if (result.success) {
        toast.success(`Booking confirmed!`);
        
        // Transform the API response for the review page
        const reviewData = transformToReviewPageFormat(result);
        
        // Navigate to Passenger Details Review Page
        navigate('/flights/passenger-review', {
          state: {
            bookingConfirmation: reviewData,
            bookingRequest: result.bookingRequest,
            bookingResponse: result.rawResponse,
            selectedSeat: selectedSeat
          }
        });
      } else {
        throw new Error(result.error || 'Booking failed');
      }
    } catch (error) {
      console.error('Booking failed:', error);
      toast.error(`Booking failed: ${error.message}`);
    } finally {
      setBookingLoading(false);
    }
  }, [bookingData, selectedSeat, navigate]);
  
  // Handle skip seat and proceed to booking
  const handleSkipAndBook = useCallback(async () => {
    setBookingLoading(true);
    
    try {
      // Send original booking data WITHOUT any seat selection
      const bookingDataWithoutSeat = {
        ...bookingData,
        selectedSeat: null
      };
      
      console.log('\n📦 CALLING PNR CREATION WITHOUT SEAT SELECTION (SKIP):');
      console.log('   - No seat selected, proceeding with original booking');
      
      // Call PNR creation API
      const result = await pnrCreationService.createPNR(bookingDataWithoutSeat);
      
      if (result.success) {
        toast.success(`Booking confirmed!`);
        
        // Transform the API response for the review page
        const reviewData = transformToReviewPageFormat(result);
        
        // Navigate to Passenger Details Review Page
        navigate('/flights/passenger-review', {
          state: {
            bookingConfirmation: reviewData,
            bookingRequest: result.bookingRequest,
            bookingResponse: result.rawResponse,
            selectedSeat: null
          }
        });
      } else {
        throw new Error(result.error || 'Booking failed');
      }
    } catch (error) {
      console.error('Booking failed:', error);
      toast.error(`Booking failed: ${error.message}`);
    } finally {
      setBookingLoading(false);
    }
  }, [bookingData, navigate]);
  
  // Handle back navigation
  const handleBack = useCallback(() => {
    navigate(-1);
  }, [navigate]);
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FD561E] mx-auto mb-4"></div>
          <p className="text-gray-600">Loading seat map...</p>
        </div>
      </div>
    );
  }
  
  if (error || !parsedData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center bg-white p-8 rounded-2xl shadow-lg max-w-md">
          <FaExclamationTriangle className="text-4xl text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Unable to load seat map</h2>
          <p className="text-gray-600 mb-6">{error || 'No seat map data available'}</p>
          <div className="flex gap-3">
            <button onClick={handleBack} className="flex-1 bg-gray-100 text-gray-700 px-6 py-3 rounded-lg">
              Go Back
            </button>
            <button onClick={handleSkipAndBook} className="flex-1 bg-[#FD561E] text-white px-6 py-3 rounded-lg">
              Continue Without Seat
            </button>
          </div>
        </div>
      </div>
    );
  }
  
  const { flightInfo, travelerInfo, rows, warnings, hasWarnings } = parsedData;
  
  // Debug: Log rows data to see what's being rendered
  console.log('📊 Rows data for rendering:', rows);
  console.log('📊 Number of rows:', rows?.length);
  
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b sticky top-0 z-20">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <button onClick={handleBack} className="flex items-center text-gray-600 hover:text-[#FD561E] transition-colors mr-4">
                <FaArrowLeft className="mr-2" />
                <span className="hidden sm:inline">Back</span>
              </button>
              <div>
                <h1 className="text-xl font-bold text-gray-800">Select Your Seat</h1>
                <p className="text-xs text-gray-500 mt-0.5">
                  {flightInfo?.carrier} {flightInfo?.flightNumber} • {flightInfo?.origin} → {flightInfo?.destination}
                </p>
              </div>
            </div>
          </div>
        </div>
        <div className="h-1 bg-gradient-to-r from-[#FD561E] to-[#ff7b4a]"></div>
      </div>
      
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Left Column - Seat Map */}
          <div className="lg:w-2/3 space-y-6">
            {/* Flight Summary */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="bg-gradient-to-r from-[#FD561E] to-[#ff7b4a] p-4 text-white">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <FaPlane className="rotate-45" size={20} />
                    <div>
                      <div className="font-semibold">{flightInfo?.carrier} {flightInfo?.flightNumber}</div>
                      <div className="text-xs opacity-90">Aircraft: {flightInfo?.equipment || 'Airbus A320'}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm">{formatDate(flightInfo?.departureTime)}</div>
                    <div className="text-xs opacity-90">{flightInfo?.origin} → {flightInfo?.destination}</div>
                  </div>
                </div>
              </div>
              <div className="p-4 flex justify-between items-center text-sm">
                <div className="flex items-center gap-2 text-gray-600">
                  <FaUser size={14} />
                  <span>{travelerInfo?.firstName} {travelerInfo?.lastName} ({travelerInfo?.type})</span>
                </div>
                <div className="flex items-center gap-2 text-gray-500">
                  <FaCalendarAlt size={14} />
                  <span>{formatTime(flightInfo?.departureTime)} - {formatTime(flightInfo?.arrivalTime)}</span>
                </div>
              </div>
            </div>
            
            {/* Warnings */}
            {hasWarnings && (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                <div className="flex items-start gap-2">
                  <FaExclamationTriangle className="text-amber-600 mt-0.5" size={14} />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-amber-800 mb-1">Important Information</p>
                    {warnings.map((warning, idx) => (
                      <p key={idx} className="text-xs text-amber-700">{warning.message}</p>
                    ))}
                  </div>
                </div>
              </div>
            )}
            
            {/* Legend */}
            <SeatLegend />
            
            {/* Aircraft Seat Map */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="bg-gray-50 p-4 border-b">
                <h3 className="font-semibold text-gray-700 flex items-center gap-2">
                  <FaPlane className="text-[#FD561E]" size={16} />
                  Aircraft Seat Map
                </h3>
                <p className="text-xs text-gray-500 mt-1">Click on available seats to select</p>
              </div>
              
              <div className="p-6 overflow-x-auto">
                {rows && rows.length > 0 ? (
                  <div className="min-w-[800px]">
                    {/* Aircraft Header */}
                    <div className="text-center mb-6">
                      <div className="inline-block bg-gray-100 rounded-full px-6 py-2 text-sm text-gray-600">
                        <FaPlane className="inline mr-2" /> Cockpit
                      </div>
                    </div>
                    
                    {/* Seat Rows */}
                    <div className="space-y-2">
                      {rows.map((row) => (
                        <div key={row.rowNumber} className="flex items-center gap-3">
                          {/* Row Number */}
                          <div className="w-12 text-center font-mono font-semibold text-gray-500 text-sm">
                            {row.rowNumber}
                          </div>
                          
                          {/* Left Side Seats (A, B, C) */}
                          <div className="flex gap-2">
                            {row.facilities && row.facilities.slice(0, 3).map((facility, idx) => {
                              if (facility.type === 'aisle') {
                                return <div key={`aisle-left-${idx}`} className="w-14 flex items-center justify-center text-gray-300">|</div>;
                              }
                              return (
                                <SeatButton
                                  key={facility.seatCode}
                                  seat={facility}
                                  isSelected={selectedSeat?.seatCode === facility.seatCode}
                                  onSelect={handleSeatSelect}
                                />
                              );
                            })}
                          </div>
                          
                          {/* Center Aisle */}
                          <div className="w-12 flex justify-center">
                            <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-gray-400 text-xs">
                              AISLE
                            </div>
                          </div>
                          
                          {/* Right Side Seats (D, E, F) */}
                          <div className="flex gap-2">
                            {row.facilities && row.facilities.slice(3, 6).map((facility, idx) => {
                              if (facility.type === 'aisle') {
                                return <div key={`aisle-right-${idx}`} className="w-14 flex items-center justify-center text-gray-300">|</div>;
                              }
                              return (
                                <SeatButton
                                  key={facility.seatCode}
                                  seat={facility}
                                  isSelected={selectedSeat?.seatCode === facility.seatCode}
                                  onSelect={handleSeatSelect}
                                />
                              );
                            })}
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    {/* Aircraft Footer */}
                    <div className="text-center mt-6">
                      <div className="inline-block bg-gray-100 rounded-full px-6 py-2 text-sm text-gray-600">
                        Tail
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <p>No seat map data available</p>
                    <button 
                      onClick={handleSkipAndBook}
                      className="mt-4 bg-[#FD561E] text-white px-6 py-2 rounded-lg"
                    >
                      Continue Without Seat Selection
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Right Column - Seat Details */}
          <div className="lg:w-1/3">
            <div className="sticky top-24 space-y-6">
              <SeatDetailsPanel
                selectedSeat={selectedSeat}
                onSelect={handleSeatSelect}
                onCancel={handleCancelSelection}
              />
              
              {/* Price Summary */}
              {selectedSeat && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
                  <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <FaWallet className="text-[#FD561E]" size={18} />
                    Price Summary
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center pb-2 border-b border-gray-100">
                      <span className="text-gray-600">Seat {selectedSeat.seatCode}</span>
                      <span className="font-semibold text-gray-800">
                        {selectedSeat.isPaid && selectedSeat.price ? formatPrice(selectedSeat.price) : 'Included'}
                      </span>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Action Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={handleBack}
                  className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-xl font-semibold hover:bg-gray-200 transition-all"
                >
                  Back
                </button>
                <button
                  onClick={handleSkipAndBook}
                  disabled={bookingLoading}
                  className={`flex-1 py-3 rounded-xl font-semibold transition-all ${
                    bookingLoading
                      ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                      : 'bg-[#FD561E] text-white hover:bg-[#e04e1b]'
                  }`}
                >
                  {bookingLoading ? (
                    <FaSpinner className="animate-spin mx-auto" />
                  ) : (
                    'Skip & Book'
                  )}
                </button>
                <button
                  onClick={handleConfirmAndBook}
                  disabled={!selectedSeat || bookingLoading}
                  className={`flex-1 py-3 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all ${
                    selectedSeat && !bookingLoading
                      ? 'bg-gradient-to-r from-green-500 to-green-600 text-white shadow-md hover:shadow-lg'
                      : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  {bookingLoading ? (
                    <FaSpinner className="animate-spin" />
                  ) : (
                    <>
                      Select & Book <FaArrowRight size={14} />
                    </>
                  )}
                </button>
              </div>
              
              <p className="text-xs text-gray-500 text-center">
                You can select a seat now or click "Skip & Book" to proceed without seat selection
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SeatMapPage;