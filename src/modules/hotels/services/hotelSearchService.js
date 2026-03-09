// src/modules/hotels/services/hotelSearchService.js

/**
 * Search hotels based on location and dates
 * @param {Object} searchParams - { location, checkinDate, checkoutDate, guests }
 * @returns {Promise} - Parsed hotel data
 */
export const searchHotels = async (searchParams) => {
  try {
    console.log("=================================");
    console.log("🔵 HOTEL SEARCH API CALL");
    console.log("📤 REQUEST BODY:");
    console.log("Location:", searchParams.location);
    console.log("Check-in Date:", searchParams.checkinDate);
    console.log("Check-out Date:", searchParams.checkoutDate);
    console.log("Guests:", searchParams.guests);
    console.log("Full Request:", JSON.stringify({
      location: searchParams.location,
      checkinDate: searchParams.checkinDate,
      checkoutDate: searchParams.checkoutDate,
    }, null, 2));
    console.log("=================================");

    const response = await fetch('https://api.bobros.org/api/hotel/search', {
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

    console.log("📥 RESPONSE STATUS:", response.status, response.statusText);
    console.log("Response Headers:", Object.fromEntries([...response.headers]));

    const responseText = await response.text();
    console.log("📄 RAW RESPONSE TEXT (first 500 chars):", responseText.substring(0, 500));
    
    if (!response.ok) {
      console.error("❌ SERVER ERROR RESPONSE:", responseText);
      throw new Error(`Server error: ${response.status}`);
    }

    // Parse JSON response
    let data;
    try {
      data = JSON.parse(responseText);
      console.log("✅ PARSED JSON RESPONSE:");
      console.log("Success:", data.success);
      console.log("Message:", data.message);
      console.log("Has Data:", !!data.data);
    } catch (parseError) {
      console.error('❌ JSON PARSE ERROR:', parseError);
      console.error('Raw response that failed to parse:', responseText);
      throw new Error('Invalid response from server');
    }

    if (!data.success) {
      console.error("❌ API ERROR:", data.message);
      throw new Error(data.message || 'Failed to fetch hotels');
    }

    // Log the structure of data.data
    console.log("📦 DATA.DATA STRUCTURE:");
    if (data.data) {
      console.log("Has SOAP:Envelope:", !!data.data["SOAP:Envelope"]);
      if (data.data["SOAP:Envelope"]) {
        console.log("Has SOAP:Body:", !!data.data["SOAP:Envelope"]["SOAP:Body"]);
      }
    }

    // Parse the SOAP response and extract hotel data
    console.log("🔍 PARSING SOAP RESPONSE...");
    const parsedHotels = parseHotelResponse(data.data);
    
    console.log("✅ FINAL RESULT:");
    console.log("Total hotels parsed:", parsedHotels.length);
    if (parsedHotels.length > 0) {
      console.log("Sample hotel (first):", parsedHotels[0]);
    }
    console.log("=================================");
    
    return {
      success: true,
      hotels: parsedHotels,
      totalCount: parsedHotels.length,
      searchParams: searchParams,
    };

  } catch (error) {
    console.error('❌ HOTEL SEARCH ERROR:', error);
    console.log("=================================");
    return {
      success: false,
      error: getFriendlyErrorMessage(error),
    };
  }
};

/**
 * Parse the SOAP response and extract hotel information
 * @param {Object} soapData - Raw SOAP response data
 * @returns {Array} - Array of parsed hotel objects
 */


/**
 * Parse a single hotel entry from the response
 * @param {Object} hotelData - Raw hotel data
 * @param {number} index - Hotel index
 * @returns {Object|null} - Parsed hotel object or null if unavailable
 */
// src/modules/hotels/services/hotelSearchService.js

// Update the parseSingleHotel function - replace the existing one

/**
 * Parse a single hotel entry from the response
 * @param {Object} hotelData - Raw hotel data
 * @param {number} index - Hotel index
 * @returns {Object|null} - Parsed hotel object or null if unavailable
 */
const parseSingleHotel = (hotelData, index) => {
  try {
    const vendorLocation = hotelData["common_v54_0:VendorLocation"] || {};
    const hotelProperty = hotelData["hotel:HotelProperty"] || {};
    const propertyAddress = hotelProperty["hotel:PropertyAddress"] || {};
    const distance = hotelProperty["common_v54_0:Distance"] || {};
    const hotelRating = hotelProperty["hotel:HotelRating"] || {};
    const rateInfo = hotelData["hotel:RateInfo"] || {};
    const hotelError = hotelData["hotel:HotelSearchError"];

    // Check if hotel is available
    const availability = hotelProperty.$?.Availability || "Unknown";
    
    // Get error details if present
    let errorCode = null;
    let errorMessage = null;
    let errorType = null;
    
    if (hotelError) {
      errorMessage = hotelError._ || hotelError;
      errorCode = hotelError.$?.Code;
      errorType = hotelError.$?.Type;
      
      console.log(`⚠️ Hotel ${index + 1} has error:`, errorMessage, `(Code: ${errorCode})`);
    }

    // Parse price amounts (may be missing for HOC hotels)
    const minAmount = rateInfo.$?.MinimumAmount || "INR0";
    const maxAmount = rateInfo.$?.MaximumAmount || "INR0";
    
    // Extract currency and numeric value
    const { currency, minPrice, maxPrice } = parsePrice(minAmount, maxAmount);

    // Parse distance
    const distanceValue = distance.$?.Value || "0";
    const distanceUnit = distance.$?.Units || "MI";
    const distanceDir = distance.$?.Direction || "";

    // Parse rating
    const rating = hotelRating["hotel:Rating"] || "0";

    // Determine if hotel should be shown
    // Show hotel if:
    // 1. It's available, OR
    // 2. It has error code "0606" (needs HOC for rates), OR
    // 3. It has some basic data (name, etc.)
    const shouldShow = 
      availability === "Available" || 
      errorCode === "0606" || // HOC required - still show the hotel
      (hotelProperty.$?.Name && !errorMessage?.includes("0601")); // Has name and not "not available"

    if (!shouldShow) {
      console.log(`🚫 Hotel ${index + 1} filtered out:`, errorMessage || availability);
      return null;
    }

    const parsedHotel = {
      id: index + 1,
      hotelId: hotelProperty.$?.HotelCode || `hotel-${index}`,
      chainCode: hotelProperty.$?.HotelChain || "",
      name: hotelProperty.$?.Name || "Unknown Hotel",
      address: propertyAddress["hotel:Address"] || "Address not available",
      location: hotelProperty.$?.HotelLocation || "",
      
      // Pricing
      price: {
        currency: currency,
        min: minPrice,
        max: maxPrice,
        displayMin: formatPrice(minAmount),
        displayMax: formatPrice(maxAmount),
      },
      
      // Distance
      distance: {
        value: parseFloat(distanceValue),
        unit: distanceUnit === "MI" ? "miles" : "km",
        direction: distanceDir,
        display: `${distanceValue} ${distanceUnit} ${distanceDir}`.trim(),
      },
      
      // Rating
      rating: {
        value: parseInt(rating) || 0,
        stars: convertToStars(parseInt(rating) || 0),
      },
      
      // Availability
      availability: availability,
      
      // Error info (for debugging or showing messages)
      error: errorMessage ? {
        code: errorCode,
        message: errorMessage,
        type: errorType,
      } : null,
      
      // Flag to indicate if rates need additional request
      needsRateRequest: errorCode === "0606",
      
      // Vendor info
      vendor: {
        code: vendorLocation.$?.VendorCode || "",
        locationId: vendorLocation.$?.VendorLocationID || "",
      },
    };

    // Log successful parse
    if (index < 5) { // Log first 5 hotels for debugging
      console.log(`✅ Hotel ${index + 1} parsed:`, {
        name: parsedHotel.name,
        price: parsedHotel.price.displayMin,
        availability: parsedHotel.availability,
        error: parsedHotel.error?.message
      });
    }

    return parsedHotel;

  } catch (error) {
    console.error(`❌ Error parsing hotel ${index + 1}:`, error);
    return null;
  }
};

// Also update the parseHotelResponse function to show better stats

/**
 * Parse the SOAP response and extract hotel information
 * @param {Object} soapData - Raw SOAP response data
 * @returns {Array} - Array of parsed hotel objects
 */
const parseHotelResponse = (soapData) => {
  try {
    console.log("🔍 Starting to parse SOAP response...");
    
    if (!soapData || !soapData["SOAP:Envelope"]) {
      console.error("❌ Invalid SOAP structure - missing SOAP:Envelope");
      return [];
    }

    const envelope = soapData["SOAP:Envelope"];
    const body = envelope["SOAP:Body"];
    
    if (!body) {
      console.error("❌ Invalid SOAP structure - missing SOAP:Body");
      return [];
    }
    
    const hotelRsp = body["hotel:HotelSearchAvailabilityRsp"];
    
    if (!hotelRsp) {
      console.error("❌ No HotelSearchAvailabilityRsp found");
      return [];
    }

    const hotelResults = hotelRsp["hotel:HotelSearchResult"];
    
    if (!hotelResults) {
      console.error("❌ No hotel:HotelSearchResult found");
      return [];
    }

    const resultsArray = Array.isArray(hotelResults) ? hotelResults : [hotelResults];
    console.log(`📊 Raw hotel results count: ${resultsArray.length}`);

    // Parse each hotel result - DON'T filter out unavailable ones automatically
    const parsedHotels = resultsArray.map((hotel, index) => {
      return parseSingleHotel(hotel, index);
    }).filter(hotel => hotel !== null);

    // Count by category
    const availableHotels = parsedHotels.filter(h => h.availability === "Available" && !h.error);
    const hocHotels = parsedHotels.filter(h => h.error?.code === "0606");
    const otherHotels = parsedHotels.filter(h => h.error && h.error.code !== "0606");

    console.log(`📊 PARSING SUMMARY:`);
    console.log(`   ✅ Fully available: ${availableHotels.length}`);
    console.log(`   🔄 HOC required (show): ${hocHotels.length}`);
    console.log(`   ⚠️ Other (show): ${otherHotels.length}`);
    console.log(`   🚫 Filtered out: ${resultsArray.length - parsedHotels.length}`);
    console.log(`   📋 TOTAL SHOWN: ${parsedHotels.length}`);
    
    return parsedHotels;

  } catch (error) {
    console.error("❌ Error parsing hotel response:", error);
    return [];
  }
};

/**
 * Parse price string to extract currency and numeric value
 */
const parsePrice = (minAmount, maxAmount) => {
  const currencyMatch = minAmount.match(/([A-Z]+)/);
  const currency = currencyMatch ? currencyMatch[1] : "INR";
  
  const minMatch = minAmount.match(/(\d+)/);
  const maxMatch = maxAmount.match(/(\d+)/);
  
  const minPrice = minMatch ? parseInt(minMatch[1]) : 0;
  const maxPrice = maxMatch ? parseInt(maxMatch[1]) : 0;
  
  return { currency, minPrice, maxPrice };
};

/**
 * Format price for display
 */
const formatPrice = (priceString) => {
  const match = priceString.match(/([A-Z]+)(\d+)/);
  if (match) {
    const [_, currency, value] = match;
    const formattedValue = parseInt(value).toLocaleString("en-IN");
    return `${currency} ${formattedValue}`;
  }
  return priceString;
};

/**
 * Convert numeric rating to star rating (0-5)
 */
const convertToStars = (rating) => {
  if (rating <= 5) return rating;
  if (rating <= 10) return Math.round(rating / 2);
  return 0;
};

/**
 * Get user-friendly error message
 */
const getFriendlyErrorMessage = (error) => {
  if (error.message.includes('Failed to fetch')) {
    return 'Unable to connect to server. Please check your internet connection.';
  }
  if (error.message.includes('401')) {
    return 'Authentication failed. Please refresh and try again.';
  }
  if (error.message.includes('500')) {
    return 'Server error. Please try again later.';
  }
  return error.message || 'Something went wrong. Please try again.';
};