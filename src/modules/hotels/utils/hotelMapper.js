// src/modules/hotels/utils/hotelMapper.js

export const mapHotelSearchResponse = (hotelData) => {
  if (!hotelData) return null;

  const vendorLocation = hotelData["common_v54_0:VendorLocation"]?.$ || {};
  const hotelProperty = hotelData["hotel:HotelProperty"]?.$ || {};
  const rateInfo = hotelData["hotel:RateInfo"]?.$ || {};
  const propertyAddress = hotelData["hotel:HotelProperty"]?.["hotel:PropertyAddress"] || {};
  const distance = hotelData["hotel:HotelProperty"]?.["common_v54_0:Distance"]?.$ || {};
  const hotelRating = hotelData["hotel:HotelProperty"]?.["hotel:HotelRating"] || {};

  const parsePrice = (priceString) => {
    if (!priceString) return { value: 0, currency: 'INR' };
    const numericValue = parseFloat(priceString.replace(/[^0-9.]/g, ''));
    const currency = priceString.replace(/[0-9.]/g, '') || 'INR';
    return { value: isNaN(numericValue) ? 0 : numericValue, currency };
  };

  const minPrice = parsePrice(rateInfo.MinimumAmount);

  return {
    id: hotelProperty.HotelCode || vendorLocation.VendorLocationID,
    hotelId: hotelProperty.HotelCode || vendorLocation.VendorLocationID,
    name: hotelProperty.Name,
    chainCode: hotelProperty.HotelChain || vendorLocation.VendorCode,
    availability: hotelProperty.Availability,
    participationLevel: hotelProperty.ParticipationLevel,
    reserveRequirement: hotelProperty.ReserveRequirement,
    location: {
      hotelLocation: hotelProperty.HotelLocation,
      address: propertyAddress["hotel:Address"] || null,
      city: hotelProperty.HotelLocation,
    },
    address: propertyAddress["hotel:Address"] || hotelProperty.HotelLocation || 'Address not available',
    distance: distance.Value ? {
      value: parseFloat(distance.Value),
      unit: distance.Units === 'MI' ? 'miles' : 'km',
      direction: distance.Direction,
      display: `${distance.Value} ${distance.Units} ${distance.Direction || ''}`.trim()
    } : null,
    rating: {
      provider: hotelRating.$?.RatingProvider,
      value: hotelRating["hotel:Rating"],
      stars: hotelRating["hotel:Rating"] ? parseFloat(hotelRating["hotel:Rating"]) : 0,
    },
    price: {
      min: minPrice.value,
      currency: minPrice.currency || 'INR',
      displayMin: rateInfo.MinimumAmount,
    },
    vendor: {
      code: vendorLocation.VendorCode,
      locationId: vendorLocation.VendorLocationID,
      providerCode: vendorLocation.ProviderCode,
      key: vendorLocation.Key,
    },
    hotelProperty: {
      hotelChain: hotelProperty.HotelChain || vendorLocation.VendorCode,
      hotelCode: hotelProperty.HotelCode || vendorLocation.VendorLocationID,
      hotelLocation: hotelProperty.HotelLocation,
      name: hotelProperty.Name,
      vendorLocationKey: hotelProperty.VendorLocationKey || vendorLocation.Key,
      reserveRequirement: hotelProperty.ReserveRequirement,
      participationLevel: hotelProperty.ParticipationLevel,
    },
    rawData: hotelData
  };
};

export const mapHotelSearchResults = (hotelsArray) => {
  if (!Array.isArray(hotelsArray)) return [];
  return hotelsArray
    .map(mapHotelSearchResponse)
    .filter(hotel => hotel !== null);
};