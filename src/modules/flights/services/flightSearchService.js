// flightSearchService.js - CLEAN VERSION

const BASE_URL = 'https://api.bobros.org';

export const searchFlights = async (searchData) => {
  try {
    // 1. Prepare request (NO HARDCODING)
    const requestBody = {
      legs: searchData.legs.map(leg => ({
        origin: leg.origin,
        destination: leg.destination,
        departureDate: leg.departureDate
      })),
      passengers: searchData.passengers
    };

    // 2. Make API call
    const response = await fetch(`${BASE_URL}/flights/lowfare`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody)
    });

    const apiResponse = await response.json();

    // 3. Navigate to the actual data
    const flightData = apiResponse.data?.['SOAP:Envelope']?.['SOAP:Body']?.['air:LowFareSearchRsp'];
    
    if (!flightData) {
      return { success: false, flights: [], error: 'No flight data' };
    }

    // 4. Extract all price points (each = 1 flight option)
    const pricePoints = flightData['air:AirPricePointList']?.['air:AirPricePoint'] || [];
    
    // 5. Create lookup maps
    const segments = flightData['air:AirSegmentList']?.['air:AirSegment'] || [];
    const fareInfos = flightData['air:FareInfoList']?.['air:FareInfo'] || [];
    const brands = flightData['air:BrandList']?.['air:Brand'] || [];
    
    const segmentMap = {};
    segments.forEach(s => { if (s.$?.Key) segmentMap[s.$.Key] = s; });
    
    const fareMap = {};
    fareInfos.forEach(f => { if (f.$?.Key) fareMap[f.$.Key] = f; });
    
    const brandMap = {};
    brands.forEach(b => { if (b.$?.Key) brandMap[b.$.Key] = b; });

    // 6. Transform price points to flights (NO HARDCODING)
    const flights = pricePoints.map(pp => {
      const pricingInfo = pp['air:AirPricingInfo'];
      if (!pricingInfo) return null;

      // Get fare info
      const fareRef = pricingInfo['air:FareInfoRef'];
      const fareKey = Array.isArray(fareRef) ? fareRef[0]?.$?.Key : fareRef?.$?.Key;
      const fare = fareMap[fareKey];
      
      // Get brand name (or null)
      let brandName = null;
      if (fare?.['air:Brand']) {
        const brandKey = fare['air:Brand'].$?.Key;
        const brand = brandMap[brandKey];
        if (brand) {
          const titles = brand['air:Title'];
          if (Array.isArray(titles)) {
            const external = titles.find(t => t.$?.Type === 'External');
            brandName = external?._ || brand.$?.Name;
          } else {
            brandName = brand.$?.Name;
          }
        }
      }

      // Get baggage
      let baggage = null;
      if (fare?.['air:BaggageAllowance']?.['air:MaxWeight']?.$) {
        const bw = fare['air:BaggageAllowance']['air:MaxWeight'].$;
        baggage = { weight: bw.Value, unit: bw.Unit };
      }

      // Get flight segment
      const flightOpt = pricingInfo['air:FlightOptionsList']?.['air:FlightOption'];
      const option = flightOpt?.['air:Option'];
      const optArray = Array.isArray(option) ? option : [option];
      const booking = optArray[0]?.['air:BookingInfo'];
      const bookArray = Array.isArray(booking) ? booking : [booking];
      const firstBook = bookArray[0];
      
      const segment = segmentMap[firstBook?.$?.SegmentRef];
      if (!segment) return null;

      // Return flight object
      return {
        id: pp.$?.Key,
        price: parseFloat(pp.$?.TotalPrice?.replace(/[^0-9]/g, '')) || 0,
        airline: segment.$?.Carrier,
        flightNumber: `${segment.$?.Carrier}-${segment.$?.FlightNumber}`,
        departureTime: segment.$?.DepartureTime,
        arrivalTime: segment.$?.ArrivalTime,
        from: segment.$?.Origin,
        to: segment.$?.Destination,
        duration: segment.$?.FlightTime,
        stops: parseInt(segment.$?.NumberOfStops) || 0,
        seatsAvailable: parseInt(firstBook?.$?.BookingCount) || 0,
        cabinClass: firstBook?.$?.CabinClass || 'Economy',
        brand: brandName,
        baggage: baggage,
        raw: pp // Keep raw for details
      };
    }).filter(Boolean);

    return {
      success: true,
      flights,
      count: flights.length
    };

  } catch (error) {
    console.error('Search error:', error);
    return { success: false, flights: [], error: error.message };
  }
};