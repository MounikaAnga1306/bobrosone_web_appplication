// src/modules/hotels/services/hotelDetailsService.js

const HOTEL_DETAILS_API_URL = 'https://api.bobros.org/api/hotel/new/details';

export const getHotelDetails = async (requestBody) => {
  try {
    console.log("=================================");
    console.log("🔵 HOTEL DETAILS API CALL");
    console.log("📤 REQUEST BODY:", JSON.stringify(requestBody, null, 2));
    console.log("=================================");

    // Validate request body before sending
    if (!requestBody?.hotelProperty) {
      throw new Error('hotelProperty is required');
    }
    if (!requestBody?.detailsModifiers?.checkin || !requestBody?.detailsModifiers?.checkout) {
      throw new Error('Check-in and check-out dates are required');
    }

    const response = await fetch(HOTEL_DETAILS_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    const data = await response.json();
    console.log("📥 RESPONSE STATUS:", response.status);
    console.log("📥 RESPONSE DATA:", data);

    if (!response.ok) {
      throw new Error(data.message || `Server error: ${response.status}`);
    }

    if (data.success) {
      return {
        success: true,
        data: data.data
      };
    } else {
      throw new Error(data.message || 'Failed to fetch hotel details');
    }
  } catch (error) {
    console.error('❌ Hotel Details Error:', error);
    return {
      success: false,
      error: error.message,
    };
  }
};