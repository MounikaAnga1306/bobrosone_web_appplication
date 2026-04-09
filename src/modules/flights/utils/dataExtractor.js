// src/modules/flights/utils/dataExtractor.js

/**
 * Data Extractor Utility
 * 
 * This file contains ALL functions to extract data from the raw SOAP pricing response.
 * These functions are called ONLY ONCE in BookingReviewPage to build completeBookingData.
 * All subsequent pages and services should use the pre-extracted data, NOT call these again.
 * 
 * SUPPORTS: Air India (AI) and IndiGo (6E) response structures
 */

// ============================================================
// HELPER FUNCTIONS
// ============================================================

const normalizeToArray = (data) => {
  if (!data) return [];
  return Array.isArray(data) ? data : [data];
};

const getNumericPrice = (priceStr) => {
  if (!priceStr) return 0;
  const match = String(priceStr).match(/INR(\d+(?:\.\d+)?)/);
  return match ? parseFloat(match[1]) : 0;
};

const formatPrice = (price) => {
  if (!price) return 'INR0';
  if (String(price).startsWith('INR')) return String(price);
  return `INR${price}`;
};

// Helper to get AirPricingSolutions (handles both array and single object)
const getAirPricingSolutions = (dataSource) => {
  const solutions = dataSource?.['SOAP:Envelope']?.['SOAP:Body']?.['air:AirPriceRsp']?.['air:AirPriceResult']?.['air:AirPricingSolution'];
  return normalizeToArray(solutions);
};

// Helper to extract HostToken from various locations
const extractHostToken = (obj) => {
  // Check direct HostToken
  if (obj?.['common_v54_0:HostToken']) {
    const token = obj['common_v54_0:HostToken'];
    if (token.$?.Key && token._) {
      return {
        key: token.$.Key,
        value: token._
      };
    }
  }
  
  // Check in AirPricingInfo
  if (obj?.['air:AirPricingInfo']?.['common_v54_0:HostToken']) {
    const token = obj['air:AirPricingInfo']['common_v54_0:HostToken'];
    if (token.$?.Key && token._) {
      return {
        key: token.$.Key,
        value: token._
      };
    }
  }
  
  return null;
};

// Helper to parse ATPCO encoded feature text
const parseATPCOFeatures = (text) => {
  const features = [];
  // Format: //CODE/TYPE/DESCRIPTION//
  const regex = /\/\/([^/]+)\/([^/]+)\/([^/]+)\/\//g;
  let match;
  while ((match = regex.exec(text)) !== null) {
    features.push({
      code: match[1],
      type: match[2] === 'F' ? 'Free' : match[2] === 'C' ? 'Chargeable' : 'Not Offered',
      description: match[3]
    });
  }
  return features;
};

// Helper to extract baggage from BaggageAllowances
const extractBaggageFromAllowances = (baggage) => {
  let checkedBaggage = '15K';
  let cabinBaggage = '7K';
  
  if (baggage) {
    // Checked baggage
    const baggageAllowanceInfo = baggage['air:BaggageAllowanceInfo'];
    if (baggageAllowanceInfo) {
      const textInfo = baggageAllowanceInfo?.$?.TextInfo;
      if (textInfo && textInfo['air:Text']) {
        const baggageText = textInfo['air:Text'];
        checkedBaggage = Array.isArray(baggageText) ? baggageText[0] : baggageText;
      } else if (baggageAllowanceInfo['air:TextInfo']?.['air:Text']) {
        const baggageText = baggageAllowanceInfo['air:TextInfo']['air:Text'];
        checkedBaggage = Array.isArray(baggageText) ? baggageText[0] : baggageText;
      }
    }
    
    // Carry-on baggage
    const carryOnInfo = baggage['air:CarryOnAllowanceInfo'];
    if (carryOnInfo) {
      const textInfo = carryOnInfo?.$?.TextInfo;
      if (textInfo && textInfo['air:Text']) {
        cabinBaggage = textInfo['air:Text'];
      } else if (carryOnInfo['air:TextInfo']?.['air:Text']) {
        cabinBaggage = carryOnInfo['air:TextInfo']['air:Text'];
      }
    }
  }
  
  return { checked: checkedBaggage, cabin: cabinBaggage };
};

// Helper function to extract service description
const getServiceDescription = (service) => {
  const serviceInfo = service?.['common_v54_0:ServiceInfo'];
  if (serviceInfo) {
    const description = serviceInfo['common_v54_0:Description'];
    if (description) {
      if (Array.isArray(description)) {
        return description[0];
      }
      return description;
    }
  }
  
  const textInfo = service?.['air:Text'];
  if (textInfo) {
    if (Array.isArray(textInfo) && textInfo[0]?._) {
      return textInfo[0]._;
    }
    if (textInfo._) {
      return textInfo._;
    }
  }
  
  return null;
};

// Helper function to extract service image URL
const extractServiceImage = (brandingInfo) => {
  if (!brandingInfo) return null;
  
  const imageLocation = brandingInfo['air:ImageLocation'];
  if (imageLocation) {
    const imagesArray = normalizeToArray(imageLocation);
    const consumerImage = imagesArray.find(img => img.$?.Type === 'Consumer');
    if (consumerImage && consumerImage._) {
      return consumerImage._;
    }
    if (imagesArray[0] && imagesArray[0]._) {
      return imagesArray[0]._;
    }
  }
  
  return null;
};

// Helper to categorize optional services
const categorizeService = (service, result) => {
  const type = service.type;
  
  if (type === 'MealOrBeverage') {
    result.meals.push(service);
  } else if (type === 'PreReservedSeatAssignment') {
    result.seats.push(service);
  } else if (type === 'Baggage') {
    result.baggage.push(service);
  } else {
    result.other.push(service);
  }
};

// ============================================================
// 1. EXTRACT ALL FARE OPTIONS (for displaying on review page)
// ============================================================

export const extractAllFareOptions = (rawResponse) => {
  try {
    const dataSource = rawResponse?.data || rawResponse;
    const solutionsArray = getAirPricingSolutions(dataSource);
    
    if (solutionsArray.length === 0) return [];
    
    const fareOptions = [];
    
    for (const solution of solutionsArray) {
      const solutionAttrs = solution.$ || {};
      const airPricingInfo = solution['air:AirPricingInfo'];
      const fareInfo = airPricingInfo?.['air:FareInfo'];
      const brand = fareInfo?.['air:Brand'];
      const bookingInfo = airPricingInfo?.['air:BookingInfo'];
      const taxes = airPricingInfo?.['air:TaxInfo'];
      const baggage = airPricingInfo?.['air:BaggageAllowances'];
      const changePenalty = airPricingInfo?.['air:ChangePenalty'];
      const cancelPenalty = airPricingInfo?.['air:CancelPenalty'];
      
      const baggageInfo = extractBaggageFromAllowances(baggage);
      
      const brandTexts = normalizeToArray(brand?.['air:Text']);
      const brandFeatures = [];
      let brandStrapline = '';
      
      brandTexts.forEach(text => {
        if (text.$?.Type === 'Strapline') {
          brandStrapline = text._ || '';
        }
        if (text.$?.Type === 'ATPCO' && text._) {
          brandFeatures.push(...parseATPCOFeatures(text._));
        }
      });
      
      fareOptions.push({
        key: solutionAttrs.Key,
        totalPrice: getNumericPrice(solutionAttrs.TotalPrice),
        basePrice: getNumericPrice(solutionAttrs.BasePrice),
        taxes: getNumericPrice(solutionAttrs.Taxes),
        formattedPrice: solutionAttrs.TotalPrice,
        
        brand: {
          key: brand?.$?.Key,
          id: brand?.$?.BrandID,
          name: brand?.$?.Name,
          tier: brand?.$?.BrandTier,
          carrier: brand?.$?.Carrier,
          strapline: brandStrapline,
          features: brandFeatures,
          texts: brandTexts.map(t => t._).filter(Boolean)
        },
        
        fareInfo: {
          key: fareInfo?.$?.Key,
          fareBasis: fareInfo?.$?.FareBasis,
          passengerTypeCode: fareInfo?.$?.PassengerTypeCode,
          amount: getNumericPrice(fareInfo?.$?.Amount),
          origin: fareInfo?.$?.Origin,
          destination: fareInfo?.$?.Destination,
          effectiveDate: fareInfo?.$?.EffectiveDate,
          departureDate: fareInfo?.$?.DepartureDate
        },
        
        bookingInfo: {
          bookingCode: bookingInfo?.$?.BookingCode,
          cabinClass: bookingInfo?.$?.CabinClass || 'Economy',
          segmentRef: bookingInfo?.$?.SegmentRef,
          hostTokenRef: bookingInfo?.$?.HostTokenRef
        },
        
        taxBreakdown: taxes ? normalizeToArray(taxes).map(tax => ({
          category: tax.$?.Category,
          amount: getNumericPrice(tax.$?.Amount),
          carrierDefinedCategory: tax.$?.CarrierDefinedCategory
        })) : [],
        
        baggage: baggageInfo,
        
        penalties: {
          change: changePenalty?.$ ? {
            amount: changePenalty.$?.Amount ? getNumericPrice(changePenalty.$?.Amount) : null,
            percentage: changePenalty.$?.Percentage ? parseFloat(changePenalty.$?.Percentage) : null,
            applies: changePenalty.$?.PenaltyApplies
          } : null,
          cancel: cancelPenalty?.$ ? {
            amount: cancelPenalty.$?.Amount ? getNumericPrice(cancelPenalty.$?.Amount) : null,
            percentage: cancelPenalty.$?.Percentage ? parseFloat(cancelPenalty.$?.Percentage) : null,
            applies: cancelPenalty.$?.PenaltyApplies
          } : null
        },
        
        refundable: airPricingInfo?.$?.Refundable === 'true',
        eticketable: airPricingInfo?.$?.ETicketability === 'Yes',
        
        hostToken: extractHostToken(solution)
      });
    }
    
    return fareOptions;
  } catch (error) {
    console.error('Error extracting fare options:', error);
    return [];
  }
};

// ============================================================
// 2. EXTRACT HOST TOKEN FOR SELECTED FARE
// ============================================================

export const extractHostTokenForSelectedFare = (rawResponse, selectedFareBrand) => {
  try {
    const dataSource = rawResponse?.data || rawResponse;
    const solutionsArray = getAirPricingSolutions(dataSource);
    
    for (const solution of solutionsArray) {
      const airPricingInfo = solution['air:AirPricingInfo'];
      const fareInfo = airPricingInfo?.['air:FareInfo'];
      const brand = fareInfo?.['air:Brand'];
      
      if (brand?.$?.Name === selectedFareBrand) {
        const token = extractHostToken(solution);
        if (token) return token;
      }
    }
    
    const itineraryToken = dataSource?.['SOAP:Envelope']?.['SOAP:Body']?.['air:AirPriceRsp']?.['air:AirItinerary']?.['common_v54_0:HostToken'];
    if (itineraryToken && itineraryToken.$?.Key && itineraryToken._) {
      return {
        key: itineraryToken.$.Key,
        value: itineraryToken._
      };
    }
    
    const firstSolution = solutionsArray[0];
    if (firstSolution) {
      return extractHostToken(firstSolution);
    }
    
    return null;
  } catch (error) {
    console.error('Error extracting host token:', error);
    return null;
  }
};

// ============================================================
// 3. EXTRACT FLIGHT SEGMENTS
// ============================================================

export const extractFlightSegments = (rawResponse) => {
  try {
    const dataSource = rawResponse?.data || rawResponse;
    const airSegment = dataSource?.['SOAP:Envelope']?.['SOAP:Body']?.['air:AirPriceRsp']?.['air:AirItinerary']?.['air:AirSegment'];
    
    if (!airSegment) return [];
    
    const segmentsArray = normalizeToArray(airSegment);
    
    return segmentsArray.map(segment => {
      const attrs = segment.$ || {};
      return {
        key: attrs.Key,
        group: attrs.Group || "0",
        carrier: attrs.Carrier,
        flightNumber: attrs.FlightNumber,
        origin: attrs.Origin,
        destination: attrs.Destination,
        departureTime: attrs.DepartureTime,
        arrivalTime: attrs.ArrivalTime,
        classOfService: attrs.ClassOfService,
        flightTime: attrs.FlightTime ? parseInt(attrs.FlightTime) : 0,
        travelTime: attrs.TravelTime ? parseInt(attrs.TravelTime) : 0,
        distance: attrs.Distance ? parseInt(attrs.Distance) : 0,
        equipment: attrs.Equipment,
        providerCode: attrs.ProviderCode,
        status: attrs.Status,
        operatingCarrier: segment?.['air:CodeshareInfo']?.$?.OperatingCarrier || attrs.Carrier
      };
    });
  } catch (error) {
    console.error('Error extracting flight segments:', error);
    return [];
  }
};

// ============================================================
// 4. EXTRACT FARE DETAILS FOR SELECTED FARE
// ============================================================

export const extractFareDetails = (rawResponse, selectedFareBrand) => {
  try {
    const dataSource = rawResponse?.data || rawResponse;
    const solutionsArray = getAirPricingSolutions(dataSource);
    
    for (const solution of solutionsArray) {
      const solutionAttrs = solution.$ || {};
      const airPricingInfo = solution['air:AirPricingInfo'];
      const fareInfo = airPricingInfo?.['air:FareInfo'];
      const brand = fareInfo?.['air:Brand'];
      const bookingInfo = airPricingInfo?.['air:BookingInfo'];
      
      if (brand?.$?.Name === selectedFareBrand) {
        return {
          totalPrice: getNumericPrice(solutionAttrs.TotalPrice),
          basePrice: getNumericPrice(solutionAttrs.BasePrice),
          taxes: getNumericPrice(solutionAttrs.Taxes),
          fareBasis: fareInfo?.$?.FareBasis,
          bookingCode: bookingInfo?.$?.BookingCode,
          cabinClass: bookingInfo?.$?.CabinClass || 'Economy',
          passengerTypeCode: fareInfo?.$?.PassengerTypeCode || 'ADT',
          effectiveDate: fareInfo?.$?.EffectiveDate,
          departureDate: fareInfo?.$?.DepartureDate,
          refundable: airPricingInfo?.$?.Refundable === 'true',
          eticketable: airPricingInfo?.$?.ETicketability === 'Yes',
          pricingMethod: airPricingInfo?.$?.PricingMethod,
          platingCarrier: airPricingInfo?.$?.PlatingCarrier
        };
      }
    }
    
    const firstSolution = solutionsArray[0];
    if (firstSolution) {
      const solutionAttrs = firstSolution.$ || {};
      const airPricingInfo = firstSolution['air:AirPricingInfo'];
      const fareInfo = airPricingInfo?.['air:FareInfo'];
      const bookingInfo = airPricingInfo?.['air:BookingInfo'];
      
      return {
        totalPrice: getNumericPrice(solutionAttrs.TotalPrice),
        basePrice: getNumericPrice(solutionAttrs.BasePrice),
        taxes: getNumericPrice(solutionAttrs.Taxes),
        fareBasis: fareInfo?.$?.FareBasis,
        bookingCode: bookingInfo?.$?.BookingCode,
        cabinClass: bookingInfo?.$?.CabinClass || 'Economy',
        passengerTypeCode: fareInfo?.$?.PassengerTypeCode || 'ADT',
        effectiveDate: fareInfo?.$?.EffectiveDate,
        departureDate: fareInfo?.$?.DepartureDate,
        refundable: airPricingInfo?.$?.Refundable === 'true',
        eticketable: airPricingInfo?.$?.ETicketability === 'Yes'
      };
    }
    
    return null;
  } catch (error) {
    console.error('Error extracting fare details:', error);
    return null;
  }
};

// ============================================================
// 5. EXTRACT BRAND FEATURES
// ============================================================

export const extractBrandFeatures = (rawResponse, selectedFareBrand) => {
  try {
    const dataSource = rawResponse?.data || rawResponse;
    const solutionsArray = getAirPricingSolutions(dataSource);
    
    for (const solution of solutionsArray) {
      const airPricingInfo = solution['air:AirPricingInfo'];
      const fareInfo = airPricingInfo?.['air:FareInfo'];
      const brand = fareInfo?.['air:Brand'];
      
      if (brand?.$?.Name === selectedFareBrand) {
        const features = [];
        
        const texts = normalizeToArray(brand?.['air:Text']);
        texts.forEach(text => {
          if (text.$?.Type === 'ATPCO' && text._) {
            features.push(...parseATPCOFeatures(text._));
          }
        });
        
        const optionalServices = brand?.['air:OptionalServices']?.['air:OptionalService'];
        if (optionalServices) {
          const servicesArray = normalizeToArray(optionalServices);
          servicesArray.forEach(service => {
            if (service.$?.Chargeable === 'Included in the brand') {
              features.push({
                code: service.$?.ServiceSubCode,
                type: 'Free',
                description: service?.['common_v54_0:ServiceInfo']?.['common_v54_0:Description'] || service.$?.Tag
              });
            }
          });
        }
        
        return features;
      }
    }
    
    return [];
  } catch (error) {
    console.error('Error extracting brand features:', error);
    return [];
  }
};

// ============================================================
// 6. EXTRACT PENALTIES
// ============================================================

export const extractPenalties = (rawResponse, selectedFareBrand) => {
  try {
    const dataSource = rawResponse?.data || rawResponse;
    const solutionsArray = getAirPricingSolutions(dataSource);
    
    for (const solution of solutionsArray) {
      const airPricingInfo = solution['air:AirPricingInfo'];
      const fareInfo = airPricingInfo?.['air:FareInfo'];
      const brand = fareInfo?.['air:Brand'];
      
      if (brand?.$?.Name === selectedFareBrand) {
        const changePenalty = airPricingInfo?.['air:ChangePenalty'];
        const cancelPenalty = airPricingInfo?.['air:CancelPenalty'];
        
        return {
          change: changePenalty?.$ ? {
            amount: changePenalty.$?.Amount ? getNumericPrice(changePenalty.$?.Amount) : null,
            percentage: changePenalty.$?.Percentage ? parseFloat(changePenalty.$?.Percentage) : null,
            applies: changePenalty.$?.PenaltyApplies
          } : null,
          cancel: cancelPenalty?.$ ? {
            amount: cancelPenalty.$?.Amount ? getNumericPrice(cancelPenalty.$?.Amount) : null,
            percentage: cancelPenalty.$?.Percentage ? parseFloat(cancelPenalty.$?.Percentage) : null,
            applies: cancelPenalty.$?.PenaltyApplies
          } : null
        };
      }
    }
    
    return null;
  } catch (error) {
    console.error('Error extracting penalties:', error);
    return null;
  }
};

// ============================================================
// 7. EXTRACT BAGGAGE INFO
// ============================================================

export const extractBaggageInfo = (rawResponse, selectedFareBrand) => {
  try {
    const dataSource = rawResponse?.data || rawResponse;
    const solutionsArray = getAirPricingSolutions(dataSource);
    
    for (const solution of solutionsArray) {
      const airPricingInfo = solution['air:AirPricingInfo'];
      const fareInfo = airPricingInfo?.['air:FareInfo'];
      const brand = fareInfo?.['air:Brand'];
      const baggage = airPricingInfo?.['air:BaggageAllowances'];
      
      if (brand?.$?.Name === selectedFareBrand) {
        return extractBaggageFromAllowances(baggage);
      }
    }
    
    const firstSolution = solutionsArray[0];
    if (firstSolution) {
      const baggage = firstSolution['air:AirPricingInfo']?.['air:BaggageAllowances'];
      return extractBaggageFromAllowances(baggage);
    }
    
    return { checked: '15K', cabin: '7K' };
  } catch (error) {
    console.error('Error extracting baggage info:', error);
    return { checked: '15K', cabin: '7K' };
  }
};

// ============================================================
// 8. EXTRACT OPTIONAL SERVICES (BOTH LEVELS - WITH PRICES)
// ============================================================

export const extractOptionalServices = (rawResponse) => {
  try {
    const dataSource = rawResponse?.data || rawResponse;
    const solutionsArray = getAirPricingSolutions(dataSource);
    
    const result = {
      meals: [],
      seats: [],
      baggage: [],
      other: []
    };
    
    if (solutionsArray.length === 0) return result;
    
    const firstSolution = solutionsArray[0];
    const airPricingInfo = firstSolution['air:AirPricingInfo'];
    
    // LEVEL 1: Brand-level optional services (included in fare)
    const brandServices = airPricingInfo?.['air:FareInfo']?.['air:Brand']?.['air:OptionalServices']?.['air:OptionalService'];
    if (brandServices) {
      const servicesArray = normalizeToArray(brandServices);
      servicesArray.forEach(service => {
        const attrs = service.$ || {};
        
        let price = null;
        if (attrs.TotalPrice) {
          price = getNumericPrice(attrs.TotalPrice);
        } else if (attrs.Amount) {
          price = getNumericPrice(attrs.Amount);
        }
        
        const serviceData = {
          key: attrs.Key,
          type: attrs.Type,
          name: attrs.Tag || attrs.Type,
          price: price,
          isIncluded: attrs.Chargeable === 'Included in the brand',
          isChargeable: attrs.Chargeable === 'Available for a charge',
          description: service?.['common_v54_0:ServiceInfo']?.['common_v54_0:Description'],
          serviceSubCode: attrs.ServiceSubCode,
          displayOrder: parseInt(attrs.DisplayOrder) || 0,
          level: 'brand'
        };
        
        categorizeService(serviceData, result);
      });
    }
    
    // LEVEL 2: Solution-level optional services (purchasable ancillaries with prices)
    const solutionServices = firstSolution['air:OptionalServices']?.['air:OptionalService'];
    if (solutionServices) {
      const servicesArray = normalizeToArray(solutionServices);
      servicesArray.forEach(service => {
        const attrs = service.$ || {};
        const brandingInfo = service?.['air:BrandingInfo'];
        
        let serviceName = attrs.DisplayText || attrs.Type;
        if (brandingInfo?.$?.CommercialName) {
          serviceName = brandingInfo.$.CommercialName;
        } else if (brandingInfo?.['air:Title']?._) {
          serviceName = brandingInfo['air:Title']._;
        } else if (attrs.DisplayText) {
          serviceName = attrs.DisplayText;
        }
        
        let price = null;
        if (attrs.TotalPrice) {
          price = getNumericPrice(attrs.TotalPrice);
        } else if (attrs.BasePrice) {
          price = getNumericPrice(attrs.BasePrice);
        } else if (attrs.Amount) {
          price = getNumericPrice(attrs.Amount);
        }
        
        let pricePerItem = null;
        if (price && attrs.Quantity) {
          const quantity = parseInt(attrs.Quantity);
          if (quantity > 1) {
            pricePerItem = price / quantity;
          }
        }
        
        const serviceData = {
          key: attrs.Key,
          type: attrs.Type,
          name: serviceName,
          price: price,
          pricePerItem: pricePerItem,
          basePrice: attrs.BasePrice ? getNumericPrice(attrs.BasePrice) : null,
          isIncluded: false,
          isChargeable: true,
          description: getServiceDescription(service),
          serviceSubCode: attrs.ServiceSubCode,
          providerDefinedType: attrs.ProviderDefinedType,
          displayOrder: parseInt(attrs.DisplayOrder) || 0,
          quantity: attrs.Quantity ? parseInt(attrs.Quantity) : 1,
          level: 'solution',
          imageUrl: extractServiceImage(brandingInfo)
        };
        
        categorizeService(serviceData, result);
      });
    }
    
    // Sort each category by price (lowest first)
    result.meals.sort((a, b) => (a.price || 0) - (b.price || 0));
    result.seats.sort((a, b) => (a.price || 0) - (b.price || 0));
    result.baggage.sort((a, b) => (a.price || 0) - (b.price || 0));
    result.other.sort((a, b) => (a.price || 0) - (b.price || 0));
    
    console.log('📦 Extracted Optional Services with Prices:', {
      meals: result.meals.length,
      seats: result.seats.length,
      baggage: result.baggage.length,
      other: result.other.length
    });
    
    if (result.meals.length > 0) {
      console.log('   Sample meal prices:', result.meals.slice(0, 3).map(m => `${m.name}: ₹${m.price}`));
    }
    if (result.baggage.length > 0) {
      console.log('   Sample baggage prices:', result.baggage.slice(0, 3).map(b => `${b.name}: ₹${b.price}`));
    }
    
    return result;
  } catch (error) {
    console.error('Error extracting optional services:', error);
    return { meals: [], seats: [], baggage: [], other: [] };
  }
};

// ============================================================
// 9. EXTRACT TAX BREAKDOWN
// ============================================================

export const extractTaxBreakdown = (rawResponse, selectedFareBrand) => {
  try {
    const dataSource = rawResponse?.data || rawResponse;
    const solutionsArray = getAirPricingSolutions(dataSource);
    
    for (const solution of solutionsArray) {
      const airPricingInfo = solution['air:AirPricingInfo'];
      const fareInfo = airPricingInfo?.['air:FareInfo'];
      const brand = fareInfo?.['air:Brand'];
      
      if (brand?.$?.Name === selectedFareBrand) {
        const taxes = airPricingInfo?.['air:TaxInfo'];
        if (!taxes) return [];
        
        const taxesArray = normalizeToArray(taxes);
        return taxesArray.map(tax => ({
          category: tax.$?.Category,
          amount: getNumericPrice(tax.$?.Amount),
          carrierDefinedCategory: tax.$?.CarrierDefinedCategory,
          providerCode: tax.$?.ProviderCode,
          supplierCode: tax.$?.SupplierCode
        }));
      }
    }
    
    const firstSolution = solutionsArray[0];
    if (firstSolution) {
      const taxes = firstSolution['air:AirPricingInfo']?.['air:TaxInfo'];
      if (taxes) {
        const taxesArray = normalizeToArray(taxes);
        return taxesArray.map(tax => ({
          category: tax.$?.Category,
          amount: getNumericPrice(tax.$?.Amount),
          carrierDefinedCategory: tax.$?.CarrierDefinedCategory
        }));
      }
    }
    
    return [];
  } catch (error) {
    console.error('Error extracting tax breakdown:', error);
    return [];
  }
};

// ============================================================
// 10. EXTRACT SOLUTION-LEVEL OPTIONAL SERVICES
// ============================================================

export const extractSolutionOptionalServices = (rawResponse) => {
  try {
    const dataSource = rawResponse?.data || rawResponse;
    const solutionsArray = getAirPricingSolutions(dataSource);
    
    if (solutionsArray.length === 0) return [];
    
    const firstSolution = solutionsArray[0];
    const solutionServices = firstSolution['air:OptionalServices']?.['air:OptionalService'];
    
    if (!solutionServices) return [];
    
    const servicesArray = normalizeToArray(solutionServices);
    const result = [];
    
    servicesArray.forEach(service => {
      const attrs = service.$ || {};
      const brandingInfo = service?.['air:BrandingInfo'];
      
      result.push({
        key: attrs.Key,
        type: attrs.Type,
        name: brandingInfo?.$?.CommercialName || attrs.DisplayText || attrs.Type,
        price: getNumericPrice(attrs.TotalPrice),
        basePrice: getNumericPrice(attrs.BasePrice),
        description: service?.['common_v54_0:ServiceInfo']?.['common_v54_0:Description'],
        serviceSubCode: attrs.ServiceSubCode,
        providerDefinedType: attrs.ProviderDefinedType,
        quantity: attrs.Quantity ? parseInt(attrs.Quantity) : 1,
        imageUrl: brandingInfo?.['air:ImageLocation']?.[0]?._ || null
      });
    });
    
    return result;
  } catch (error) {
    console.error('Error extracting solution optional services:', error);
    return [];
  }
};

// ============================================================
// 11. EXTRACT AIRLINE INFO
// ============================================================

export const extractAirlineInfo = (rawResponse) => {
  try {
    const dataSource = rawResponse?.data || rawResponse;
    const airSegment = dataSource?.['SOAP:Envelope']?.['SOAP:Body']?.['air:AirPriceRsp']?.['air:AirItinerary']?.['air:AirSegment'];
    
    if (!airSegment) return { carrier: null, flightNumber: null };
    
    const segment = normalizeToArray(airSegment)[0];
    const attrs = segment.$ || {};
    
    return {
      carrier: attrs.Carrier,
      flightNumber: attrs.FlightNumber,
      operatingCarrier: segment?.['air:CodeshareInfo']?.$?.OperatingCarrier || attrs.Carrier,
      equipment: attrs.Equipment
    };
  } catch (error) {
    console.error('Error extracting airline info:', error);
    return { carrier: null, flightNumber: null };
  }
};

// ============================================================
// 12. CALCULATE PASSENGER AGES
// ============================================================

export const calculateAge = (dob) => {
  if (!dob) return 0;
  const today = new Date();
  const birthDate = new Date(dob);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
};

export const enrichPassengersWithAges = (passengers) => {
  return passengers.map(passenger => ({
    ...passenger,
    age: passenger.age || calculateAge(passenger.dob)
  }));
};

// ============================================================
// 13. VALIDATE IF RESPONSE IS VALID
// ============================================================

export const isValidPricingResponse = (rawResponse) => {
  try {
    const dataSource = rawResponse?.data || rawResponse;
    const solutions = dataSource?.['SOAP:Envelope']?.['SOAP:Body']?.['air:AirPriceRsp']?.['air:AirPriceResult']?.['air:AirPricingSolution'];
    return !!solutions;
  } catch {
    return false;
  }
};

// ============================================================
// 14. GET TOTAL PRICE FOR SELECTED FARE
// ============================================================

export const getSelectedFareTotalPrice = (rawResponse, selectedFareBrand) => {
  try {
    const dataSource = rawResponse?.data || rawResponse;
    const solutionsArray = getAirPricingSolutions(dataSource);
    
    for (const solution of solutionsArray) {
      const airPricingInfo = solution['air:AirPricingInfo'];
      const fareInfo = airPricingInfo?.['air:FareInfo'];
      const brand = fareInfo?.['air:Brand'];
      
      if (brand?.$?.Name === selectedFareBrand) {
        return getNumericPrice(solution.$?.TotalPrice);
      }
    }
    
    return 0;
  } catch (error) {
    console.error('Error getting selected fare price:', error);
    return 0;
  }
};