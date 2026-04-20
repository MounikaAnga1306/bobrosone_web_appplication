// src/modules/flights/services/pnr_creationService.js

import axios from 'axios';

const BASE_URL = 'https://api.bobros.org';

class PNRCreationService {
  
  navigateFunction = null;
  contextStoreFunction = null;
  pricingBookingContext = null;

  setNavigateAndContext(navigate, storePnrResponse) {
    this.navigateFunction = navigate;
    this.contextStoreFunction = storePnrResponse;
  }

  setPricingBookingContext(context) {
    this.pricingBookingContext = context;
    console.log('✅ PNR Service: PricingBookingContext reference set');
  }

  ensureArray(value) {
    if (!value) return [];
    return Array.isArray(value) ? value : [value];
  }

  logCopyableJSON(label, data) {
    const jsonString = JSON.stringify(data, null, 2);
    console.log(`\n${'='.repeat(80)}`);
    console.log(`📋 ${label}`);
    console.log(`${'='.repeat(80)}`);
    console.log(jsonString);
    console.log(`${'='.repeat(80)}\n`);
    
    if (typeof window !== 'undefined') {
      window[`__last_${label.replace(/ /g, '_')}`] = data;
      console.log(`💡 Tip: Access via window.__last_${label.replace(/ /g, '_')}`);
    }
    
    return jsonString;
  }

  getValue(obj, propName) {
    if (!obj) return null;
    if (obj.$ && obj.$[propName] !== undefined) return obj.$[propName];
    if (obj[propName] !== undefined) return obj[propName];
    return null;
  }

  // ============================================================
  // CALCULATE AGE FROM DOB
  // ============================================================
  calculateAgeFromDOB(dobString, travelDateString) {
    if (!dobString) return null;
    
    const dob = new Date(dobString);
    const travelDate = travelDateString ? new Date(travelDateString) : new Date();
    
    let age = travelDate.getFullYear() - dob.getFullYear();
    const monthDiff = travelDate.getMonth() - dob.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && travelDate.getDate() < dob.getDate())) {
      age--;
    }
    
    // INF: If age is 0, return 1 (as per requirement)
    if (age === 0) {
      return 1;
    }
    
    return age;
  }

  // ============================================================
  // GROUP PASSENGERS BY TYPE AND REORDER (INF MUST BE SECOND IN EACH GROUP)
  // ============================================================
  groupAndReorderPassengers(passengers) {
    // Group passengers by type
    const grouped = {};
    for (const passenger of passengers) {
      const type = passenger.code;
      if (!grouped[type]) {
        grouped[type] = [];
      }
      grouped[type].push(passenger);
    }
    
    console.log('\n📊 Grouping passengers by type:');
    for (const [type, passengersList] of Object.entries(grouped)) {
      console.log(`   ${type}: ${passengersList.length} passenger(s)`);
      passengersList.forEach((p, i) => {
        console.log(`      ${i + 1}. ${p.firstName} ${p.lastName} (${p.age || '?'} yrs)`);
      });
    }
    
    // Reorder: ADT group first, then INF group (INF must be second passenger overall)
    const orderedGroups = [];
    if (grouped['ADT']) orderedGroups.push(...grouped['ADT']);
    if (grouped['INF']) orderedGroups.push(...grouped['INF']);
    if (grouped['CNN']) orderedGroups.push(...grouped['CNN']);
    
    console.log(`\n🔄 Reordered sequence: ${orderedGroups.map(p => p.code).join(' → ')}`);
    console.log(`   (INF must be second passenger overall with bookingTravelerRef = 2 if present)`);
    
    return {
      grouped,
      orderedPassengers: orderedGroups
    };
  }

  // ============================================================
  // CONSOLIDATE AIR PRICING INFO BY TYPE (Single per passenger type)
  // UPDATED: Supports multiple fareInfos and bookingInfos for round trips
  // ============================================================
  consolidatePricingInfoByType(pricingInfoByType, groupedPassengers) {
    const consolidated = {};
    
    for (const [type, passengers] of Object.entries(groupedPassengers)) {
      const pricingInfo = pricingInfoByType[type];
      
      if (!pricingInfo) {
        console.error(`❌ No pricing info found for passenger type: ${type}`);
        console.error(`   Available types: ${Object.keys(pricingInfoByType).join(', ')}`);
        throw new Error(`Cannot find pricing for passenger type: ${type}`);
      }
      
      const passengerCount = passengers.length;
      
      // Calculate totals: multiply per-passenger amounts by count
      const totalPriceNum = parseInt(String(pricingInfo.totalPrice).replace('INR', '')) * passengerCount;
      const totalBasePriceNum = parseInt(String(pricingInfo.basePrice).replace('INR', '')) * passengerCount;
      const totalTaxesNum = parseInt(String(pricingInfo.taxes).replace('INR', '')) * passengerCount;
      
      consolidated[type] = {
        ...pricingInfo,
        passengerCount: passengerCount,
        passengers: passengers,
        totalPrice: `INR${totalPriceNum}`,
        basePrice: `INR${totalBasePriceNum}`,
        taxes: `INR${totalTaxesNum}`,
        // Keep all fareInfos (array - supports multiple segments)
        fareInfos: pricingInfo.fareInfos,
        // Keep all bookingInfos (array - supports multiple segments)
        bookingInfos: pricingInfo.bookingInfos
      };
      
      console.log(`\n💰 Consolidated ${type} (${passengerCount} passenger(s)):`);
      console.log(`   - Per passenger total: ${pricingInfo.totalPrice}`);
      console.log(`   - Group total: ${consolidated[type].totalPrice}`);
      console.log(`   - FareInfos count: ${pricingInfo.fareInfos?.length || 1}`);
      console.log(`   - BookingInfos count: ${pricingInfo.bookingInfos?.length || 1}`);
    }
    
    return consolidated;
  }

  // ============================================================
  // BUILD AIR PRICING INFO LIST (One per passenger type, not per passenger)
  // UPDATED: Supports multiple fareInfos and bookingInfos for round trips
  // ============================================================
  buildAirPricingInfoList(consolidatedPricing, orderedPassengers, travelDate) {
    const airPricingInfoList = [];
    const processedTypes = new Set();
    
    // NO MAPPING NEEDED - use codes as-is
    // const reverseTypeMapping = { ... };  // REMOVE THIS
    
    for (const passenger of orderedPassengers) {
      const passengerType = passenger.code;
      
      if (processedTypes.has(passengerType)) continue;
      processedTypes.add(passengerType);
      
      const pricingInfo = consolidatedPricing[passengerType];
      
      if (!pricingInfo) {
        console.error(`❌ No consolidated pricing for type: ${passengerType}`);
        throw new Error(`Cannot build AirPricingInfo for type: ${passengerType}`);
      }
      
      // ✅ Use the SAME code for fareInfos (no mapping)
      const gdsPassengerType = passengerType;  // Direct use
      
      // Build passengerTypes array for all passengers of this type
      const passengerTypesList = pricingInfo.passengers.map((p, idx) => {
        let ageValue = p.age;
        
        // If age is not provided or is 0 for INF, calculate from DOB
        if (!ageValue || (passengerType === 'INF' && ageValue === 0)) {
          if (p.dob) {
            const calculatedAge = this.calculateAgeFromDOB(p.dob, travelDate);
            if (calculatedAge !== null) {
              ageValue = calculatedAge;
              console.log(`   📊 ${passengerType} ${p.firstName} ${p.lastName}: Calculated age ${ageValue} from DOB ${p.dob}`);
            }
          }
        }
        
        // Final fallback defaults
        if (!ageValue) {
          if (passengerType === 'ADT') ageValue = 30;
          else if (passengerType === 'INF') ageValue = 1;  // Changed from 0 to 1
          else if (passengerType === 'CNN') ageValue = 8;
        }
        
        return {
          code: p.code,
          bookingTravelerRef: this.getBookingTravelerRef(p, orderedPassengers),
          age: ageValue.toString()
        };
      });
      
      // Update fareInfos with passenger type (NO MAPPING)
      const updatedFareInfos = pricingInfo.fareInfos.map(fi => ({
        ...fi,
        passengerTypeCode: gdsPassengerType  // Use same code
      }));
      
      // Build AirPricingInfo
      const airPricingInfo = {
        key: pricingInfo.apiKey,
        totalPrice: pricingInfo.totalPrice,
        basePrice: pricingInfo.basePrice,
        taxes: pricingInfo.taxes,
        pricingMethod: pricingInfo.pricingMethod,
        refundable: pricingInfo.refundable ? "true" : "false",
        eticketability: pricingInfo.eticketability,
        platingCarrier: pricingInfo.platingCarrier,
        fareInfos: updatedFareInfos,
        bookingInfos: pricingInfo.bookingInfos,
        passengerTypes: passengerTypesList
      };
      
      airPricingInfoList.push(airPricingInfo);
      
      console.log(`\n✅ Built AirPricingInfo for ${passengerType}:`);
      console.log(`   - GDS Passenger Code: ${gdsPassengerType} (unchanged)`);
      console.log(`   - Passenger ages: ${passengerTypesList.map(pt => `${pt.code}:${pt.age}`).join(', ')}`);
    }
    
    return airPricingInfoList;
  }

  // ============================================================
  // BUILD HOST TOKENS LIST (One per hostTokenRef, supports multiple per type)
  // UPDATED: Collects all unique host tokens from all bookingInfos
  // ============================================================
  buildHostTokensList(consolidatedPricing, allHostTokens) {
    const hostTokensList = [];
    const usedTokenKeys = new Set();
    
    console.log('\n🔍 Building host tokens list:');
    
    for (const [type, pricingInfo] of Object.entries(consolidatedPricing)) {
      // Collect all unique hostTokenRefs from all bookingInfos
      const uniqueHostTokenRefs = new Set();
      
      if (pricingInfo.bookingInfos && Array.isArray(pricingInfo.bookingInfos)) {
        for (const bookingInfo of pricingInfo.bookingInfos) {
          if (bookingInfo.hostTokenRef) {
            uniqueHostTokenRefs.add(bookingInfo.hostTokenRef);
          }
        }
      } else if (pricingInfo.bookingInfo && pricingInfo.bookingInfo.hostTokenRef) {
        // Fallback for single bookingInfo (backward compatibility)
        uniqueHostTokenRefs.add(pricingInfo.bookingInfo.hostTokenRef);
      }
      
      console.log(`   ${type}: looking for ${uniqueHostTokenRefs.size} host token(s)`);
      
      // Find matching host tokens for each reference
      for (const tokenRef of uniqueHostTokenRefs) {
        if (usedTokenKeys.has(tokenRef)) continue;
        
        const matchingToken = allHostTokens.find(token => token.key === tokenRef);
        
        if (matchingToken) {
          hostTokensList.push(matchingToken);
          usedTokenKeys.add(tokenRef);
          console.log(`   ✅ ${type} host token: ${matchingToken.key?.substring(0, 30)}...`);
        } else {
          console.error(`❌ No host token found for type: ${type}`);
          console.error(`   Looking for key: ${tokenRef}`);
          console.error(`   Available tokens: ${allHostTokens.map(t => t.key).join(', ')}`);
          throw new Error(`Cannot find host token for reference: ${tokenRef}`);
        }
      }
    }
    
    console.log(`\n📦 Built ${hostTokensList.length} host token(s)`);
    return hostTokensList;
  }

  // ============================================================
  // GET BOOKING TRAVELER REF (Maintain correct order: 1,2,3...)
  // ============================================================
  getBookingTravelerRef(passenger, orderedPassengers) {
    const index = orderedPassengers.findIndex(p => 
      p.firstName === passenger.firstName && 
      p.lastName === passenger.lastName
    );
    return (index + 1).toString();
  }

  // ============================================================
  // MAIN: Create PNR - WITH CONSOLIDATION FOR SAME PASSENGER TYPES
  // ============================================================
  async createPNR() {
    console.log('\n' + '🎫'.repeat(40));
    console.log('PNR CREATION SERVICE - CREATE PNR');
    console.log('🎫'.repeat(40) + '\n');
    
    try {
      // ============================================================
      // STEP 0: GET DATA FROM CONTEXT
      // ============================================================
      
      if (!this.pricingBookingContext) {
        throw new Error('PricingBookingContext not set. Call setPricingBookingContext() first.');
      }
      
      const { bookingData } = this.pricingBookingContext;
      const pricingResponse = bookingData.rawPricingResponse;
      const originalPassengers = bookingData.passengers;
      const contactInfo = bookingData.contactInfo;
      const paymentMethod = bookingData.paymentMethod;
      const selectedFareKey = bookingData.selectedFare?.key || null;
      
      console.log('✅ Context Data Retrieved:');
      console.log(`   - Original Passengers: ${originalPassengers?.length || 0}`);
      originalPassengers.forEach((p, i) => {
        console.log(`      ${i + 1}. ${p.code} - ${p.firstName} ${p.lastName} (${p.age || '?'} yrs)`);
      });
      
      if (!pricingResponse) {
        throw new Error('No pricing response found in context.');
      }
      
      // ============================================================
      // STEP 1: GROUP AND REORDER PASSENGERS
      // ============================================================
      
      const { grouped, orderedPassengers } = this.groupAndReorderPassengers(originalPassengers);
      
      // ============================================================
      // STEP 2: EXTRACT RAW PRICING DATA
      // ============================================================
      
      let envelope, body, airPriceRsp, airPriceResult, pricingSolutions;
      
      if (pricingResponse.data?.data?.['SOAP:Envelope']) {
        envelope = pricingResponse.data.data['SOAP:Envelope'];
      } else if (pricingResponse.data?.['SOAP:Envelope']) {
        envelope = pricingResponse.data['SOAP:Envelope'];
      } else if (pricingResponse['SOAP:Envelope']) {
        envelope = pricingResponse['SOAP:Envelope'];
      } else if (pricingResponse.data?.SOAP_Envelope) {
        envelope = pricingResponse.data.SOAP_Envelope;
      } else {
        throw new Error('Cannot find SOAP:Envelope in pricing response');
      }
      
      body = envelope['SOAP:Body'];
      airPriceRsp = body['air:AirPriceRsp'];
      airPriceResult = airPriceRsp['air:AirPriceResult'];
      pricingSolutions = airPriceResult['air:AirPricingSolution'];
      
      const pricingSolutionsArray = this.ensureArray(pricingSolutions);
      console.log(`\n📦 Found ${pricingSolutionsArray.length} pricing solution(s)`);
      
      // ============================================================
      // STEP 3: SELECT THE CORRECT SOLUTION
      // ============================================================
      
      let selectedSolution = null;
      let solutionIndex = 0;
      
      if (selectedFareKey) {
        selectedSolution = pricingSolutionsArray.find((sol, idx) => {
          const match = this.getValue(sol, 'Key') === selectedFareKey;
          if (match) solutionIndex = idx;
          return match;
        });
        if (!selectedSolution) {
          console.warn(`   ⚠️ Selected fare not found, using first solution`);
          selectedSolution = pricingSolutionsArray[0];
        }
      } else {
        selectedSolution = pricingSolutionsArray[0];
      }
      
      console.log(`   ✅ Using solution ${solutionIndex}: Key=${this.getValue(selectedSolution, 'Key')}`);
      
      // ============================================================
      // STEP 4: EXTRACT SEGMENTS
      // ============================================================
      
      const airItinerary = airPriceRsp['air:AirItinerary'];
      const airSegmentsRaw = airItinerary['air:AirSegment'];
      const airSegmentsArray = this.ensureArray(airSegmentsRaw);
      
      console.log(`\n📦 Extracting ${airSegmentsArray.length} segment(s):`);
      
      // Get travel date for age calculation (from first segment)
      let travelDate = null;
      const segmentsForRequest = [];
      for (const seg of airSegmentsArray) {
        const segAttrs = seg.$ || seg;
        
        // Capture travel date from first segment
        if (!travelDate && segAttrs.DepartureTime) {
          travelDate = segAttrs.DepartureTime;
        }
        
        const segment = {
          key: segAttrs.Key,
          group: segAttrs.Group,
          carrier: segAttrs.Carrier,
          flightNumber: segAttrs.FlightNumber,
          origin: segAttrs.Origin,
          destination: segAttrs.Destination,
          departureTime: segAttrs.DepartureTime,
          arrivalTime: segAttrs.ArrivalTime,
          classOfService: segAttrs.ClassOfService,
          flightTime: segAttrs.FlightTime,
          travelTime: segAttrs.TravelTime,
          distance: segAttrs.Distance,
          equipment: segAttrs.Equipment,
          changeOfPlane: segAttrs.ChangeOfPlane,
          optionalServicesIndicator: segAttrs.OptionalServicesIndicator,
          availabilitySource: segAttrs.AvailabilitySource,
          participantLevel: segAttrs.ParticipantLevel,
          linkAvailability: segAttrs.LinkAvailability,
          availabilityDisplayType: segAttrs.AvailabilityDisplayType,
          providerCode: segAttrs.ProviderCode,
          operatingCarrier: seg['air:CodeshareInfo']?.$?.OperatingCarrier || segAttrs.OperatingCarrier
        };
        
        segmentsForRequest.push(segment);
        console.log(`   ✅ Segment: ${segment.carrier} ${segment.flightNumber} | Key: ${segment.key.substring(0, 30)}...`);
      }
      
      // ============================================================
      // STEP 5: EXTRACT AIR PRICING INFO BY TYPE (UPDATED FOR MULTIPLE FAREINFOS & BOOKINGINFOS)
      // ============================================================
      
      const airPricingInfoRaw = selectedSolution['air:AirPricingInfo'];
      const airPricingInfoArray = this.ensureArray(airPricingInfoRaw);
      
      console.log(`\n📦 Found ${airPricingInfoArray.length} AirPricingInfo(s) in solution:`);
      
      const pricingInfoByType = {};
      
      for (const api of airPricingInfoArray) {
        const apiAttrs = api.$ || api;
        const passengerType = this.extractPassengerTypeFromPricingInfo(api);
        
        // Extract ALL FareInfos (supports multiple segments)
        const fareInfosRaw = this.ensureArray(api['air:FareInfo']);
        const fareInfos = [];
        
        for (const fi of fareInfosRaw) {
          const fiAttrs = fi.$ || fi;
          const fareRuleKeyObj = fi['air:FareRuleKey'];
          
          fareInfos.push({
            key: fiAttrs.Key,
            fareBasis: fiAttrs.FareBasis,
            passengerTypeCode: fiAttrs.PassengerTypeCode,
            origin: fiAttrs.Origin,
            destination: fiAttrs.Destination,
            effectiveDate: fiAttrs.EffectiveDate,
            departureDate: fiAttrs.DepartureDate,
            amount: fiAttrs.Amount,
            fareRuleKey: fareRuleKeyObj?._ || fareRuleKeyObj
          });
        }
        
        // Extract ALL BookingInfos (supports multiple segments)
        const bookingInfosRaw = this.ensureArray(api['air:BookingInfo']);
        const bookingInfos = [];
        
        for (const bi of bookingInfosRaw) {
          const biAttrs = bi.$ || bi;
          bookingInfos.push({
            bookingCode: biAttrs.BookingCode,
            cabinClass: biAttrs.CabinClass,
            fareInfoRef: biAttrs.FareInfoRef,
            segmentRef: biAttrs.SegmentRef,
            hostTokenRef: biAttrs.HostTokenRef
          });
        }
        
        pricingInfoByType[passengerType] = {
          apiKey: apiAttrs.Key,
          totalPrice: apiAttrs.TotalPrice,
          basePrice: apiAttrs.BasePrice,
          taxes: apiAttrs.Taxes,
          pricingMethod: apiAttrs.PricingMethod,
          refundable: apiAttrs.Refundable === 'true',
          eticketability: apiAttrs.ETicketability,
          platingCarrier: apiAttrs.PlatingCarrier,
          fareInfos: fareInfos,           // Array of fareInfos (1 for one-way, 2 for round trip)
          bookingInfos: bookingInfos,     // Array of bookingInfos (1 for one-way, 2 for round trip)
          passengerCount: this.getPassengerCountFromPricingInfo(api),
          // Keep single references for backward compatibility (one-way)
          fareInfo: fareInfos[0],
          bookingInfo: bookingInfos[0]
        };
        
        console.log(`   ✅ ${passengerType}: Key=${pricingInfoByType[passengerType].apiKey.substring(0, 30)}...`);
        console.log(`      Total Price: ${apiAttrs.TotalPrice}`);
        console.log(`      FareInfos: ${fareInfos.length} | BookingInfos: ${bookingInfos.length}`);
        bookingInfos.forEach((bi, idx) => {
          console.log(`      BookingInfo ${idx + 1}: SegRef=${bi.segmentRef?.substring(0, 20)}... | TokenRef=${bi.hostTokenRef?.substring(0, 20)}...`);
        });
      }
      
      // ============================================================
      // STEP 6: EXTRACT HOST TOKENS
      // ============================================================
      
      const hostTokensRaw = selectedSolution['common_v54_0:HostToken'];
      const hostTokensArray = this.ensureArray(hostTokensRaw);
      
      const allHostTokens = [];
      for (const token of hostTokensArray) {
        const tokenKey = this.getValue(token, 'Key');
        const tokenValue = token['_'] || token.value;
        
        allHostTokens.push({
          key: tokenKey,
          value: tokenValue
        });
      }
      
      console.log(`\n📦 Extracted ${allHostTokens.length} host token(s)`);
      allHostTokens.forEach(token => {
        console.log(`   - Token Key: ${token.key?.substring(0, 30)}...`);
      });
      
      // ============================================================
      // STEP 7: CONSOLIDATE PRICING INFO BY TYPE (One per passenger type)
      // ============================================================
      
      const consolidatedPricing = this.consolidatePricingInfoByType(pricingInfoByType, grouped);
      
      // ============================================================
      // STEP 8: BUILD AIR PRICING INFO LIST (One per passenger type)
      // ============================================================
      
      const airPricingInfoList = this.buildAirPricingInfoList(consolidatedPricing, orderedPassengers, travelDate);
      
      // ============================================================
      // STEP 9: BUILD HOST TOKENS LIST (Collects all unique host tokens)
      // ============================================================
      
      const hostTokensList = this.buildHostTokensList(consolidatedPricing, allHostTokens);
      
      // ============================================================
      // STEP 10: BUILD AIR PRICING SOLUTION
      // ============================================================
      
      const solutionKey = this.getValue(selectedSolution, 'Key');
      
      // Calculate totals
      let totalPrice = 0, totalBasePrice = 0, totalTaxes = 0;
      airPricingInfoList.forEach(info => {
        const priceNum = parseInt(String(info.totalPrice).replace('INR', '')) || 0;
        const baseNum = parseInt(String(info.basePrice).replace('INR', '')) || 0;
        const taxNum = parseInt(String(info.taxes).replace('INR', '')) || 0;
        totalPrice += priceNum;
        totalBasePrice += baseNum;
        totalTaxes += taxNum;
      });
      
      const airPricingSolution = {
        key: solutionKey,
        totalPrice: `INR${totalPrice}`,
        basePrice: `INR${totalBasePrice}`,
        fees: "INR0",
        taxes: `INR${totalTaxes}`,
        airPricingInfo: airPricingInfoList,
        hostTokens: hostTokensList
      };
      
      console.log(`\n💰 Final Totals:`);
      console.log(`   - Total Price: ${airPricingSolution.totalPrice}`);
      console.log(`   - Solution Key: ${solutionKey}`);
      console.log(`   - AirPricingInfo Count: ${airPricingInfoList.length} (one per passenger type)`);
      console.log(`   - Host Tokens Count: ${hostTokensList.length}`);
      
      // ============================================================
      // STEP 11: BUILD PASSENGERS LIST (IN ORDERED ORDER)
      // ============================================================
      
      // const passengersList = orderedPassengers.map((p, idx) => ({
      //   code: p.code,
      //   firstName: (p.firstName || "").toUpperCase().trim(),
      //   lastName: (p.lastName || "").toUpperCase().trim(),
      //   dob: p.dob,
      //   gender: p.gender || "F",
      //   nationality: p.nationality || "IN",
      //   age: p.age
      // }));

      // ============================================================
// STEP 11: BUILD PASSENGERS LIST (IN ORDERED ORDER) WITH CORRECTED AGES
// ============================================================
      
const passengersList = orderedPassengers.map((p, idx) => {
  let correctedAge = p.age;
  
  // Fix INF age from 0 to 1
  if (p.code === 'INF' && (!correctedAge || correctedAge === 0)) {
    if (p.dob && travelDate) {
      const calculatedAge = this.calculateAgeFromDOB(p.dob, travelDate);
      if (calculatedAge !== null && calculatedAge > 0) {
        correctedAge = calculatedAge;
        console.log(`   🔄 INF ${p.firstName} ${p.lastName}: Age corrected from ${p.age} to ${correctedAge} in passengersList`);
      } else {
        correctedAge = 1;
        console.log(`   🔄 INF ${p.firstName} ${p.lastName}: Age corrected from ${p.age} to 1 (default) in passengersList`);
      }
    } else {
      correctedAge = 1;
      console.log(`   🔄 INF ${p.firstName} ${p.lastName}: Age corrected from ${p.age} to 1 (default, no DOB) in passengersList`);
    }
  }
  
  return {
    code: p.code,
    firstName: (p.firstName || "").toUpperCase().trim(),
    lastName: (p.lastName || "").toUpperCase().trim(),
    dob: p.dob,
    gender: p.gender || "F",
    nationality: p.nationality || "IN",
    age: correctedAge  // Use corrected age
  };
});
      
      // ============================================================
      // STEP 12: BUILD FINAL REQUEST
      // ============================================================
      
      let paymentType = 'Cash';
      if (paymentMethod === 'card') paymentType = 'CreditCard';
      else if (paymentMethod === 'upi') paymentType = 'UPI';
      else if (paymentMethod === 'netbanking') paymentType = 'NetBanking';
      else if (paymentMethod === 'cash') paymentType = 'Cash';
      
      const bookingRequest = {
        traceId: `BOBROS-${Date.now()}`,
        passengers: passengersList,
        segments: segmentsForRequest,
        airPricingSolution: airPricingSolution,
        contactInfo: {
          email: contactInfo.email,
          phone: {
            countryCode: contactInfo.phone?.countryCode || "91",
            number: contactInfo.phone?.number || "9999999999"
          }
        },
        formOfPayment: {
          type: paymentType
        },
        autoTicket: false
      };
      
      // Log the final request
      this.logCopyableJSON('PNR CREATION REQUEST (CONSOLIDATED BY TYPE)', bookingRequest);
      
      // ============================================================
      // STEP 13: SEND REQUEST
      // ============================================================
      
      console.log('\n📤 Sending PNR Creation Request...');
      
      const startTime = Date.now();
      
      const response = await axios.post(`${BASE_URL}/flights/air-create/air-booking`, bookingRequest, {
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        timeout: 60000
      });
      
      const endTime = Date.now();
      console.log(`\n📥 Response received in ${endTime - startTime}ms`);
      console.log(`   - Status: ${response.status} ${response.statusText}`);
      
      this.logCopyableJSON('PNR CREATION RESPONSE', response.data);
      
      // ============================================================
      // STEP 14: EXTRACT PNR NUMBER
      // ============================================================
      
      let pnrNumber = null;
      
      const possiblePaths = [
        () => response.data?.data?.['SOAP:Envelope']?.['SOAP:Body']?.['universal:AirCreateReservationRsp']?.['universal:UniversalRecord']?.$?.LocatorCode,
        () => response.data?.['SOAP:Envelope']?.['SOAP:Body']?.['universal:AirCreateReservationRsp']?.['universal:UniversalRecord']?.$?.LocatorCode,
        () => {
          const str = JSON.stringify(response.data);
          const match = str.match(/LocatorCode["']?\s*:\s*["']([A-Z0-9]+)["']/);
          return match ? match[1] : null;
        }
      ];
      
      for (const path of possiblePaths) {
        try {
          const value = path();
          if (value && typeof value === 'string' && value.length >= 5) {
            pnrNumber = value;
            console.log(`\n✅ PNR NUMBER EXTRACTED: ${pnrNumber}`);
            break;
          }
        } catch (e) {}
      }
      
      if (!pnrNumber) {
        console.warn('⚠️ Could not extract PNR number from response');
      }
      
      // ============================================================
      // STEP 15: STORE AND NAVIGATE
      // ============================================================
      
      if (this.contextStoreFunction && response.data) {
        this.contextStoreFunction(response.data);
        console.log('   ✅ Response stored in context');
      }
      
      if (this.pricingBookingContext && pnrNumber) {
        this.pricingBookingContext.updateBookingStatus('confirmed', pnrNumber, pnrNumber);
        console.log('   ✅ Booking status updated');
      }
      
      if (this.navigateFunction) {
        console.log('\n🚀 Navigating to passenger review page...');
        this.navigateFunction('/flights/passenger-review');
      }
      
      console.log('\n' + '✅'.repeat(40));
      console.log('PNR CREATION COMPLETED SUCCESSFULLY');
      console.log('✅'.repeat(40) + '\n');
      
      return { 
        success: true, 
        pnrNumber, 
        bookingRequest, 
        rawResponse: response.data 
      };
      
    } catch (error) {
      console.error('\n' + '❌'.repeat(40));
      console.error('PNR CREATION FAILED');
      console.error('❌'.repeat(40));
      console.error(`Error: ${error.message}`);
      if (error.response) {
        console.error(`Status: ${error.response.status}`);
        console.error(`Data:`, error.response.data);
      }
      console.error('❌'.repeat(40) + '\n');
      
      if (this.pricingBookingContext) {
        this.pricingBookingContext.updateBookingStatus('failed');
        if (this.pricingBookingContext.setBookingError) {
          this.pricingBookingContext.setBookingError(error.message);
        }
      }
      
      return { success: false, error: error.message };
    }
  }

  // Helper methods
  extractPassengerTypeFromPricingInfo(pricingInfo) {
    const passengerTypeRaw = pricingInfo['air:PassengerType'];
    
    if (Array.isArray(passengerTypeRaw) && passengerTypeRaw.length > 0) {
      let passengerType = this.getValue(passengerTypeRaw[0], 'Code');
      // Map CHD to CNN
      if (passengerType === 'CHD') {
        console.log(`   🔄 Mapped passenger type: ${passengerType} → CNN`);
        return 'CNN';
      }
      return passengerType;
    }
    
    if (passengerTypeRaw && typeof passengerTypeRaw === 'object') {
      let passengerType = this.getValue(passengerTypeRaw, 'Code');
      // Map CHD to CNN
      if (passengerType === 'CHD') {
        console.log(`   🔄 Mapped passenger type: ${passengerType} → CNN`);
        return 'CNN';
      }
      return passengerType;
    }
    
    const fareInfos = this.ensureArray(pricingInfo['air:FareInfo']);
    if (fareInfos.length > 0) {
      let passengerType = this.getValue(fareInfos[0], 'PassengerTypeCode');
      // Map CHD to CNN
      if (passengerType === 'CHD') {
        console.log(`   🔄 Mapped passenger type: ${passengerType} → CNN`);
        return 'CNN';
      }
      return passengerType;
    }
    
    return null;
  }

  getPassengerCountFromPricingInfo(pricingInfo) {
    const passengerTypeRaw = pricingInfo['air:PassengerType'];
    
    if (Array.isArray(passengerTypeRaw)) {
      return passengerTypeRaw.length;
    }
    
    if (passengerTypeRaw && typeof passengerTypeRaw === 'object') {
      return 1;
    }
    
    return 1;
  }
}

export default new PNRCreationService();