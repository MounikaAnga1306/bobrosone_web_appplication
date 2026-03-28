// src/modules/hotels/services/hotelSearchService.js

export const searchHotels = async (searchParams) => {
  try {
    console.log("=================================");
    console.log("🔵 HOTEL SEARCH API CALL");
    console.log("📤 REQUEST BODY:", searchParams);
    console.log("=================================");

    const response = await fetch('https://api.bobros.org/api/hotel/new/search', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        location: searchParams.location,
        checkinDate: searchParams.checkinDate,
        checkoutDate: searchParams.checkoutDate,
      }),
    });

    const data = await response.json();
    
    if (data.status === 'success') {
      return {
        success: true,
        hotels: data.hotelSearchResults,
        totalCount: data.totalResults
      };
    } else {
      return {
        success: false,
        error: 'Failed to fetch hotels'
      };
    }
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
};