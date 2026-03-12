// src/modules/hotels/hooks/useHotelDetails.js
import { useState, useCallback } from 'react';
import { getHotelDetails } from '../services/hotelDetailsService';

export const useHotelDetails = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [hotelDetails, setHotelDetails] = useState(null);
  const [rawData, setRawData] = useState(null);

  /**
   * Parse the SOAP/XML hotel details response
   */
  const parseHotelDetails = (soapData) => {
    try {
      if (!soapData) {
        console.error("No soapData provided");
        return null;
      }

      console.log("🔍 Parsing hotel details from:", soapData);

      const envelope = soapData?.["SOAP:Envelope"];
      if (!envelope) {
        console.error("No SOAP:Envelope found");
        return null;
      }

      const body = envelope?.["SOAP:Body"];
      if (!body) {
        console.error("No SOAP:Body found");
        return null;
      }

      const detailsRsp = body?.["hotel:HotelDetailsRsp"];
      if (!detailsRsp) {
        console.error("No hotel:HotelDetailsRsp found");
        return null;
      }

      const requestedDetails = detailsRsp?.["hotel:RequestedHotelDetails"];
      if (!requestedDetails) {
        console.error("No hotel:RequestedHotelDetails found");
        return null;
      }

      console.log("✅ RequestedDetails found:", requestedDetails);

      // Extract hotel property
      const hotelProperty = requestedDetails["hotel:HotelProperty"]?.$ || {};
      const propertyAddress = requestedDetails["hotel:HotelProperty"]?.["hotel:PropertyAddress"];
      const phoneNumbers = requestedDetails["hotel:HotelProperty"]?.["common_v54_0:PhoneNumber"] || [];
      const distance = requestedDetails["hotel:HotelProperty"]?.["common_v54_0:Distance"]?.$ || {};
      const marketingMessage = requestedDetails["hotel:HotelProperty"]?.["hotel:MarketingMessage"]?.["hotel:Text"];

      // Extract check-in/out times
      const detailItems = requestedDetails["hotel:HotelDetailItem"] || [];
      let checkInTime = "14:00";
      let checkOutTime = "12:00";
      
      if (Array.isArray(detailItems)) {
        detailItems.forEach(item => {
          const name = item.$?.Name;
          if (name === "CheckInTime") {
            checkInTime = item["hotel:Text"]?.trim() || "14:00";
          }
          if (name === "CheckOutTime") {
            checkOutTime = item["hotel:Text"]?.trim() || "12:00";
          }
        });
      } else if (detailItems) {
        // Handle single object
        const name = detailItems.$?.Name;
        if (name === "CheckInTime") {
          checkInTime = detailItems["hotel:Text"]?.trim() || "14:00";
        }
        if (name === "CheckOutTime") {
          checkOutTime = detailItems["hotel:Text"]?.trim() || "12:00";
        }
      }

      // Extract room rates - THIS WAS THE ISSUE
      let rateDetails = requestedDetails["hotel:HotelRateDetail"];
      let rooms = [];
      
      console.log("📊 Rate details type:", typeof rateDetails);
      console.log("📊 Rate details:", rateDetails);
      
      if (Array.isArray(rateDetails)) {
        // If it's an array, map over it
        rooms = rateDetails.map((rate, index) => parseRoom(rate, index));
      } else if (rateDetails) {
        // If it's a single object, wrap in array
        rooms = [parseRoom(rateDetails, 0)];
      } else {
        console.warn("No hotel:HotelRateDetail found");
        rooms = [];
      }

      // Filter out any null rooms
      rooms = rooms.filter(room => room !== null);

      // Format address
      let address = 'Address not available';
      if (propertyAddress) {
        const addressLines = propertyAddress["hotel:Address"];
        if (Array.isArray(addressLines)) {
          address = addressLines.filter(Boolean).join(', ');
        } else if (addressLines) {
          address = addressLines;
        }
      }

      // Format phone numbers
      let phones = [];
      if (Array.isArray(phoneNumbers)) {
        phones = phoneNumbers.map(p => ({
          type: p.$?.Type || 'Unknown',
          number: p.$?.Number || ''
        })).filter(p => p.number);
      } else if (phoneNumbers) {
        phones = [{
          type: phoneNumbers.$?.Type || 'Unknown',
          number: phoneNumbers.$?.Number || ''
        }].filter(p => p.number);
      }

      // Calculate price range from rooms
      const prices = rooms.map(r => r.price).filter(p => p > 0);
      const minPrice = prices.length > 0 ? Math.min(...prices) : 0;
      const maxPrice = prices.length > 0 ? Math.max(...prices) : 0;

      const result = {
        // Basic info
        name: hotelProperty.Name || '',
        hotelCode: hotelProperty.HotelCode || '',
        hotelChain: hotelProperty.HotelChain || '',
        hotelLocation: hotelProperty.HotelLocation || '',
        participationLevel: hotelProperty.ParticipationLevel || '',
        
        // Location
        address: address,
        phoneNumbers: phones,
        
        // Distance
        distance: distance.Value ? {
          value: parseFloat(distance.Value),
          unit: distance.Units === 'MI' ? 'miles' : distance.Units,
          direction: distance.Direction || '',
          display: `${distance.Value} ${distance.Units} ${distance.Direction || ''}`.trim()
        } : null,
        
        // Times
        checkInTime,
        checkOutTime,
        
        // Marketing
        marketingMessage: marketingMessage || '',
        
        // Rooms
        rooms: rooms,
        roomCount: rooms.length,
        
        // Price range
        price: {
          min: minPrice,
          max: maxPrice,
          currency: rooms[0]?.currency || 'INR'
        },
        
        // Raw hotel property for API calls
        hotelProperty: {
          hotelChain: hotelProperty.HotelChain || '',
          hotelCode: hotelProperty.HotelCode || '',
          hotelLocation: hotelProperty.HotelLocation || '',
          name: hotelProperty.Name || '',
          vendorLocationKey: hotelProperty.VendorLocationKey || '',
        }
      };

      console.log("✅ Parsed hotel details result:", result);
      return result;

    } catch (error) {
      console.error('Error parsing hotel details:', error);
      return null;
    }
  };

  /**
   * Parse a single room rate
   */
  const parseRoom = (rate, index) => {
    try {
      if (!rate) return null;

      const roomDesc = rate["hotel:RoomRateDescription"] || [];
      const rateByDate = rate["hotel:HotelRateByDate"]?.$ || {};
      
      // Find room description
      let roomText = '';
      let rateText = '';
      
      if (Array.isArray(roomDesc)) {
        const roomDescItem = roomDesc.find(d => d.$?.Name === "Room");
        roomText = roomDescItem?.["hotel:Text"];
        
        const rateDescItem = roomDesc.find(d => d.$?.Name === "Rate");
        rateText = rateDescItem?.["hotel:Text"];
      } else if (roomDesc) {
        if (roomDesc.$?.Name === "Room") {
          roomText = roomDesc["hotel:Text"];
        }
        if (roomDesc.$?.Name === "Rate") {
          rateText = roomDesc["hotel:Text"];
        }
      }
      
      // Parse price from Base or Total
      const priceString = rateByDate.Base || rate.$?.Total || "INR0";
      const priceValue = parseFloat(priceString.replace(/[^0-9.]/g, '')) || 0;
      const currency = priceString.replace(/[0-9.]/g, '') || 'INR';

      // Format room type text
      let roomType = 'Standard Room';
      if (roomText) {
        if (Array.isArray(roomText)) {
          roomType = roomText.join(' ').trim();
        } else {
          roomType = roomText.trim();
        }
      }

      return {
        id: index + 1,
        ratePlanType: rate.$?.RatePlanType || '',
        type: roomType,
        description: rateText || '',
        price: priceValue,
        currency: currency,
        total: rate.$?.Total || '',
        totalAmount: parseFloat(rate.$?.Total?.replace(/[^0-9.]/g, '') || 0),
        effectiveDate: rateByDate.EffectiveDate || '',
        expireDate: rateByDate.ExpireDate || '',
        commission: rate["hotel:Commission"]?.$?.Indicator === "true",
        cancelInfo: rate["hotel:CancelInfo"]?.$ || null,
        guaranteeInfo: rate["hotel:GuaranteeInfo"]?.$ || null,
      };
    } catch (error) {
      console.error(`Error parsing room ${index}:`, error);
      return null;
    }
  };

  /**
   * Fetch hotel details using the request body
   */
  const fetchHotelDetails = useCallback(async (requestBody) => {
    setLoading(true);
    setError(null);

    try {
      console.log("🔍 Fetching hotel details with:", requestBody);
      
      const result = await getHotelDetails(requestBody);

      if (result.success) {
        console.log("📥 Raw API response data:", result.data);
        
        const parsedDetails = parseHotelDetails(result.data);
        
        if (parsedDetails) {
          // Add the dates to the parsed details
          parsedDetails.checkinDate = requestBody.detailsModifiers?.checkin;
          parsedDetails.checkoutDate = requestBody.detailsModifiers?.checkout;
          
          setHotelDetails(parsedDetails);
          setRawData(result.data);
          
          console.log("✅ Hotel details parsed successfully:", parsedDetails);
          
          return {
            success: true,
            hotel: parsedDetails
          };
        } else {
          throw new Error('Failed to parse hotel details');
        }
      } else {
        throw new Error(result.error || 'Failed to fetch hotel details');
      }
    } catch (err) {
      const errorMessage = err.message || 'An error occurred';
      setError(errorMessage);
      console.error("❌ Error in fetchHotelDetails:", err);
      
      return {
        success: false,
        error: errorMessage
      };
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Clear hotel details
   */
  const clearDetails = useCallback(() => {
    setHotelDetails(null);
    setRawData(null);
    setError(null);
  }, []);

  /**
   * Get a specific room by ID
   */
  const getRoomById = useCallback((roomId) => {
    if (!hotelDetails?.rooms) return null;
    return hotelDetails.rooms.find(room => room.id === roomId) || null;
  }, [hotelDetails]);

  /**
   * Get the best available room (cheapest)
   */
  const getBestRoom = useCallback(() => {
    if (!hotelDetails?.rooms || hotelDetails.rooms.length === 0) return null;
    return hotelDetails.rooms.reduce((best, room) => 
      room.price < best.price ? room : best
    );
  }, [hotelDetails]);

  return {
    // State
    loading,
    error,
    hotelDetails,
    rawData,
    
    // Methods
    fetchHotelDetails,
    clearDetails,
    getRoomById,
    getBestRoom,
    
    // Convenience getters
    hotelName: hotelDetails?.name,
    hotelAddress: hotelDetails?.address,
    checkInTime: hotelDetails?.checkInTime,
    checkOutTime: hotelDetails?.checkOutTime,
    minPrice: hotelDetails?.price?.min,
    maxPrice: hotelDetails?.price?.max,
    currency: hotelDetails?.price?.currency,
    rooms: hotelDetails?.rooms,
    roomCount: hotelDetails?.roomCount,
    phoneNumbers: hotelDetails?.phoneNumbers,
    distance: hotelDetails?.distance,
    marketingMessage: hotelDetails?.marketingMessage,
    
    // Check if hotel has any rooms
    hasRooms: hotelDetails?.rooms && hotelDetails.rooms.length > 0,
    
    // Check-in/out dates from request
    checkinDate: hotelDetails?.checkinDate,
    checkoutDate: hotelDetails?.checkoutDate,
  };
};