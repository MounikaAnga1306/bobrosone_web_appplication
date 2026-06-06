// ─────────────────────────────────────────────────────────────────
// pricingService.js
//
// The ONLY file responsible for building + firing the pricing request.
//
// Flow:
//   executePricing()
//     → reads store: traceId, travelerRefs, selectedOutbound/Inbound, searchParams
//     → builds segments from selectedFlight.segments (original flightRefs preserved)
//     → builds classOfService per segment from selectedBrand.passengerFareInfo
//     → builds passengers from store.travelerRefs
//     → POSTs to pricing API
//     → transforms response
//     → saves to store
//
// KEY RULES:
//   1. traceId   = store.traceId (from CatalogProductOfferingsResponse.traceId)
//   2. segmentKey = seg.flightRef (original ID from low-fare, e.g. "s3", "s4")
//   3. classOfService = per-segment from passengerFareInfo, NOT brand-level
//   4. travelerRefs = store.travelerRefs (set by lowFareSearchService)
// ─────────────────────────────────────────────────────────────────

import useStore from '../store/useStore';

const PRICING_API_URL = 'https://api.bobros.org/flights/airpricing-updated'; // ← paste your endpoint

// ═══════════════════════════════════════════════════════════════════
// 1.  STORE-AWARE ENTRY POINT — BookingReviewPage calls this only
// ═══════════════════════════════════════════════════════════════════

/**
 * Single entry point for pricing. Reads everything from store.
 * BookingReviewPage calls: await executePricing();
 *
 * @returns {{ success: boolean, error?: string }}
 */
export const executePricing = async () => {
  const store = useStore.getState();

  const {
    selectedOutbound,
    selectedInbound,
    searchParams,
    travelerRefs,
    traceId,
    setPricingLoading,
    setPricingError,
    setRawPricingResponse,
    setPricingResult,
  } = store;

  console.log('🔑 executePricing — traceId:', traceId);
  console.log('🔑 executePricing — travelerRefs:', travelerRefs);
  console.log('🔑 executePricing — selectedOutbound:', selectedOutbound?.offeringId);
  console.log('🔑 executePricing — selectedBrand:', selectedOutbound?.selectedBrand?.brandName);

  // ── Guards ───────────────────────────────────────────────────────
  if (!selectedOutbound) {
    const msg = 'No outbound flight selected.';
    setPricingError(msg);
    return { success: false, error: msg };
  }
  if (!selectedOutbound.selectedBrand) {
    const msg = 'No fare brand selected.';
    setPricingError(msg);
    return { success: false, error: msg };
  }
  if (!traceId) {
    const msg = 'Session expired. Please search again.';
    setPricingError(msg);
    return { success: false, error: msg };
  }
  if (!travelerRefs || !Array.isArray(travelerRefs) || travelerRefs.length === 0) {
    const msg = 'Traveler references missing. Please search again.';
    setPricingError(msg);
    return { success: false, error: msg };
  }

  setPricingLoading(true);
  setPricingError(null);

  try {
    // ── Build passengerCounts from store.searchParams ─────────────
    const passengerCounts = { ADT: 0, CNN: 0, INF: 0 };
    (searchParams.passengers || []).forEach((p) => {
      if (p.count > 0) {
        passengerCounts[p.type] = p.count;
        if (p.type === 'CNN') passengerCounts.CNNAge = p.age ?? 10;
        if (p.type === 'INF') passengerCounts.INFAge = p.age ?? 1;
      }
    });

    // ── Build request ─────────────────────────────────────────────
    const isRoundTrip = !!selectedInbound;

    const requestBody = isRoundTrip
      ? _buildRoundTripRequest(selectedOutbound, selectedInbound, passengerCounts, traceId, travelerRefs)
      : _buildOneWayRequest(selectedOutbound, passengerCounts, traceId, travelerRefs);

    console.log('📤 PRICING REQUEST BODY:');
    console.log(JSON.stringify(requestBody, null, 2));

    // ── Validate segments before sending ─────────────────────────
    const missingRef = requestBody.segments.find(s => !s.segmentKey || s.segmentKey.startsWith('MISSING'));
    if (missingRef) {
      throw new Error(`Segment missing flightRef: ${JSON.stringify(missingRef)}`);
    }

    // ── Call API ─────────────────────────────────────────────────
    const raw = await callPricingAPI(requestBody);
    if (!raw?.success) throw new Error(raw?.error ?? 'Pricing API returned failure.');

    setRawPricingResponse(raw);

    const transformed = transformPricingResponse(raw);
    if (!transformed) throw new Error('Failed to parse pricing response.');

    setPricingResult(transformed);
    setPricingLoading(false);
    return { success: true };

  } catch (err) {
    console.error('[pricingService] executePricing failed:', err);
    const msg = err.message || 'Pricing failed. Please try again.';
    setPricingError(msg);
    setPricingLoading(false);
    return { success: false, error: msg };
  }
};

// ═══════════════════════════════════════════════════════════════════
// 2.  INTERNAL REQUEST BUILDERS
// ═══════════════════════════════════════════════════════════════════

const _buildOneWayRequest = (flight, passengerCounts, traceId, travelerRefs) => ({
  traceId,
  segments:   _buildSegments(flight, 0),
  passengers: _buildPassengers(passengerCounts, travelerRefs),
});

const _buildRoundTripRequest = (outbound, inbound, passengerCounts, traceId, travelerRefs) => ({
  traceId,
  segments: [
    ..._buildSegments(outbound, 0),
    ..._buildSegments(inbound,  1),
  ],
  passengers: _buildPassengers(passengerCounts, travelerRefs),
});

// ─────────────────────────────────────────────────────────────────
// _buildSegments
//
// Builds the segments[] array for the pricing request from a
// selected flight object (which has selectedBrand attached).
//
// KEY RULES:
//   segmentKey   = seg.flightRef  (original ID from low-fare, e.g. "s3")
//                  This must match exactly what the GDS returned.
//
//   classOfService = resolved per segment from selectedBrand.passengerFareInfo
//                    Each passengerFareInfo entry covers a set of segment indices.
//                    We map: segmentIndex (0-based) → classOfService
//                    Fallback: selectedBrand.classOfService → 'Y'
//
// selectedBrand.passengerFareInfo shape (from lowFareTransformer):
//   [{ passengerType, cabin, classOfService, fareBasisCode, fareType }]
//   Note: This is simplified — one entry per pax type, same class for all segments.
//   If you have per-segment class data, it would be in product.FlightSegment.
//   We use ADT's classOfService as the booking class for all segments.
// ─────────────────────────────────────────────────────────────────
const _buildSegments = (flight, group) => {
  if (!flight?.segments?.length) return [];

  const brand = flight.selectedBrand;

  // Get classOfService for ADT — this is what the GDS wants for booking
  // passengerFareInfo is per pax type; ADT's CoS is used for all segments
  const adtFareInfo = (brand?.passengerFareInfo ?? []).find(p => p.passengerType === 'ADT')
    ?? (brand?.passengerFareInfo ?? [])[0]
    ?? null;

  const brandLevelCoS = adtFareInfo?.classOfService
    ?? brand?.classOfService
    ?? 'Y';

  console.log(`🔧 _buildSegments group=${group}:`);
  console.log(`   brand: ${brand?.brandName}, CoS from ADT fareInfo: ${brandLevelCoS}`);

  return flight.segments.map((seg, idx) => {
    // segmentKey MUST be the original flightRef from low-fare response
    // e.g. "s3", "s4" — NOT a generated key
    const segmentKey = seg.flightRef;
    if (!segmentKey) {
      console.error(`❌ seg.flightRef missing for segment index ${idx}:`, seg);
    }

    const depISO = `${seg.from.date}T${seg.from.time}:00.000+05:30`;
    const arrISO = `${seg.to.date}T${seg.to.time}:00.000+05:30`;
    const flightTime = _parseDurationToMinutes(seg.durationRaw ?? seg.duration ?? 0);

    console.log(`   seg[${idx}]: key=${segmentKey} ${seg.carrier}${seg.number} ${seg.from.airport}→${seg.to.airport} CoS=${brandLevelCoS}`);

    return {
      segmentKey:    segmentKey ?? `MISSING_${group}_${idx}`,
      group,
      carrier:       seg.carrier      ?? '',
      flightNumber:  seg.number       ?? seg.flightNumber ?? '',
      origin:        seg.from.airport ?? '',
      destination:   seg.to.airport   ?? '',
      departureTime: depISO,
      arrivalTime:   arrISO,
      flightTime,
      distance:      seg.distance  ?? 0,
      equipment:     seg.equipment ?? '',
      classOfService: brandLevelCoS,
      eTicketability:            'Yes',
      changeOfPlane:             'false',
      participantLevel:          'Secure Sell',
      linkAvailability:          'true',
      polledAvailabilityOption:  'Polled avail used',
      optionalServicesIndicator: 'false',
      availabilitySource:        seg.availabilitySource ?? 'S',
      availabilityDisplayType:   'Fare Shop/Optimal Shop',
    };
  });
};

// ─────────────────────────────────────────────────────────────────
// _buildPassengers
//
// UPDATED: travelerRefs is now an array of individual entries:
// [
//   { code: 'ADT', mappedCode: 'ADT', passengerIndex: 0, key: 'key1==' },
//   { code: 'ADT', mappedCode: 'ADT', passengerIndex: 1, key: 'key2==' },
// ]
// Each passenger gets their own unique key by type + index.
//
// NOTE: CNN passengers are sent to the pricing API as 'CHD'.
//       However, travelerRefs are still looked up using 'CNN' since
//       that is how the low-fare response stored them (mappedCode: 'CNN').
// ─────────────────────────────────────────────────────────────────
const _buildPassengers = (passengerCounts, travelerRefs) => {
  const paxList = [];

  // Track how many of each type we've assigned so far
  const typeIndexMap = {};

  const buildEntries = (code, count, extraProps = {}) => {
    for (let i = 0; i < count; i++) {
      // Initialize counter for this type
      if (typeIndexMap[code] === undefined) typeIndexMap[code] = 0;
      const currentIndex = typeIndexMap[code]++;

      // ✅ Find the matching travelerRef by mappedCode + passengerIndex.
      // For CHD (child), the low-fare response may have stored refs under
      // mappedCode 'CNN' or 'CHD' depending on the GDS response — check both.
      // Also fall back to matching on the `code` field directly.
      const childCodes = ['CHD', 'CNN'];
      const lookupCodes = code === 'CHD' ? childCodes : [code];
      const refEntry = Array.isArray(travelerRefs)
        ? travelerRefs.find(
            (r) =>
              (lookupCodes.includes(r.mappedCode) || lookupCodes.includes(r.code)) &&
              r.passengerIndex === currentIndex
          )
        : null;

      if (!refEntry) {
        console.warn(`⚠️ No travelerRef found for code=${code} index=${currentIndex}. Available refs:`, travelerRefs);
      }

      const entry = {
        code,
        ...extraProps,
        ...(refEntry ? { bookingTravelerRef: refEntry.key } : {}),
      };

      paxList.push(entry);
    }
  };

  if ((passengerCounts.ADT ?? 0) > 0) {
    buildEntries('ADT', passengerCounts.ADT);
  }

  // CNN passengers are sent as 'CHD' to the pricing API
  if ((passengerCounts.CNN ?? 0) > 0) {
    buildEntries('CHD', passengerCounts.CNN, {
      age: passengerCounts.CNNAge ?? 10,
    });
  }

  if ((passengerCounts.INF ?? 0) > 0) {
    buildEntries('INF', passengerCounts.INF, {
      age: passengerCounts.INFAge ?? 1,
    });
  }

  console.log('👥 Built passengers:', JSON.stringify(paxList, null, 2));
  return paxList;
};

// ═══════════════════════════════════════════════════════════════════
// 3.  API CALL WRAPPERS
// ═══════════════════════════════════════════════════════════════════

export const callPricingAPI = async (requestBody) => {
  try {
    console.log(`📥 PRICING API request `);
    console.log(JSON.stringify(requestBody, null, 2));

    const response = await fetch(PRICING_API_URL, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify(requestBody),
    });

    const rawText = await response.text();
    console.log(`📥 PRICING API RESPONSE (HTTP ${response.status}):`);
    console.log(JSON.stringify(rawText, null, 2));

    if (!response.ok) throw new Error(`Pricing API ${response.status}: ${rawText}`);
    return JSON.parse(rawText);

  } catch (err) {
    console.error('[pricingService] callPricingAPI failed:', err);
    return { success: false, error: err.message };
  }
};

// Used by flight cards (they pass a pre-built request)
export const getFlightPricing = async (requestBody) => {
  const raw = await callPricingAPI(requestBody);
  if (!raw?.success) {
    return {
      success:     false,
      error:       raw?.error ?? 'Pricing request failed',
      userMessage: 'Unable to fetch fare details. Please try again.',
    };
  }
  return {
    success:       true,
    data:          raw.data,
    rawResponse:   raw,
    traceId:       raw.traceId,
    passengerKeys: raw.passengerKeys ?? [],
  };
};

// ═══════════════════════════════════════════════════════════════════
// 4.  PUBLIC REQUEST BUILDERS (for cards that call pricing directly)
// ═══════════════════════════════════════════════════════════════════

/**
 * Used by OneWayFlightCard / cards that build requests themselves.
 * Signature A (from executePricing): (flight, counts, traceId, travelerRefs)
 * Signature B (from cards):          (flight, brand, counts, traceId, travelerRefs)
 */
export const buildOneWayPricingRequest = (flight, brandOrCounts, countsOrTraceId, maybeTraceIdOrRefs, maybeRefs) => {
  const looksLikeBrand = brandOrCounts && (
    'classOfService' in brandOrCounts ||
    'brandName'      in brandOrCounts ||
    'brandRef'       in brandOrCounts
  );

  let flightWithBrand, passengerCounts, traceId, travelerRefs;

  if (looksLikeBrand) {
    // Signature B: card passes brand separately
    flightWithBrand = { ...flight, selectedBrand: brandOrCounts };
    passengerCounts = countsOrTraceId;
    traceId         = typeof maybeTraceIdOrRefs === 'string' ? maybeTraceIdOrRefs : `BOBROS-${Date.now()}`;
    travelerRefs    = (typeof maybeTraceIdOrRefs === 'object' ? maybeTraceIdOrRefs : maybeRefs) ?? {};
  } else {
    // Signature A: flight already has selectedBrand
    flightWithBrand = flight;
    passengerCounts = brandOrCounts;
    traceId         = countsOrTraceId ?? `BOBROS-${Date.now()}`;
    travelerRefs    = maybeTraceIdOrRefs ?? {};
  }

  return {
    traceId,
    segments:   _buildSegments(flightWithBrand, 0),
    passengers: _buildPassengers(passengerCounts, travelerRefs),
  };
};

export const buildRoundTripPricingRequest = (outbound, inbound, passengerCounts, traceId, travelerRefs = {}) => ({
  traceId,
  segments: [..._buildSegments(outbound, 0), ..._buildSegments(inbound, 1)],
  passengers: _buildPassengers(passengerCounts, travelerRefs),
});

// ═══════════════════════════════════════════════════════════════════
// 5.  DURATION PARSER
// ═══════════════════════════════════════════════════════════════════

const _parseDurationToMinutes = (val) => {
  if (val == null) return 0;
  if (typeof val === 'number') return Math.round(val);
  const s = String(val).trim();
  if (/^\d+(\.\d+)?$/.test(s)) return Math.round(parseFloat(s));
  if (/^P/i.test(s)) {
    let total = 0;
    const d = s.match(/(\d+(?:\.\d+)?)D/i);
    const h = s.match(/(\d+(?:\.\d+)?)H/i);
    const m = s.match(/(\d+(?:\.\d+)?)M/i);
    if (d) total += parseFloat(d[1]) * 1440;
    if (h) total += parseFloat(h[1]) * 60;
    if (m) total += parseFloat(m[1]);
    return Math.round(total);
  }
  const hm = s.match(/(\d+)\s*h\s*(\d+)?\s*m?/i);
  if (hm) return parseInt(hm[1], 10) * 60 + parseInt(hm[2] ?? '0', 10);
  return 0;
};

// ═══════════════════════════════════════════════════════════════════
// 6.  RESPONSE TRANSFORMER
// ═══════════════════════════════════════════════════════════════════

export const transformPricingResponse = (raw) => {
  if (!raw?.success || !raw?.data) return null;
  try {
    const priceRsp = _dig(raw.data, ['SOAP:Envelope', 'SOAP:Body', 'air:AirPriceRsp']);
    if (!priceRsp) return null;

    const rawSegments = _arr(priceRsp?.['air:AirItinerary']?.['air:AirSegment']);
    const segments = rawSegments.map((seg) => {
      const a = seg?.['$'] ?? {};
      return {
        key:            a.Key            ?? '',
        group:          Number(a.Group   ?? 0),
        carrier:        a.Carrier        ?? '',
        flightNumber:   a.FlightNumber   ?? '',
        origin:         a.Origin         ?? '',
        destination:    a.Destination    ?? '',
        departureTime:  a.DepartureTime  ?? '',
        arrivalTime:    a.ArrivalTime    ?? '',
        flightTime:     Number(a.FlightTime ?? 0),
        distance:       Number(a.Distance   ?? 0),
        equipment:      a.Equipment      ?? '',
        classOfService: a.ClassOfService ?? '',
      };
    });

    const rawSolutions = _arr(priceRsp?.['air:AirPriceResult']?.['air:AirPricingSolution']);
    const fareOptions  = rawSolutions.map((s, i) => _parseSolution(s, i));

    let cheapestFareIndex = 0;
    fareOptions.forEach((fo, i) => {
      if (fo.grandTotal < fareOptions[cheapestFareIndex].grandTotal) cheapestFareIndex = i;
    });

    return {
      traceId:          raw.traceId,
      currency:         'INR',
      fareOptions,
      segments,
      cheapestFareIndex,
      passengerKeys:    raw.passengerKeys ?? [],
      rawEnvelope:      raw.data,
    };
  } catch (err) {
    console.error('[pricingService] transformPricingResponse error:', err);
    return null;
  }
};

const _parseSolution = (solution, index) => {
  const solAttrs    = solution?.['$'] ?? {};
  const grandTotal  = _parseMoney(solAttrs.TotalPrice    ?? solAttrs.ApproximateTotalPrice);
  const totalBase   = _parseMoney(solAttrs.BasePrice     ?? solAttrs.ApproximateBasePrice);
  const totalTaxes  = _parseMoney(solAttrs.Taxes         ?? solAttrs.ApproximateTaxes);
  const totalFees   = _parseMoney(solAttrs.Fees          ?? 0);

  const pricingInfo  = solution?.['air:AirPricingInfo'] ?? {};
  const infoAttrs    = pricingInfo?.['$'] ?? {};
  const paxTypeObj   = pricingInfo?.['air:PassengerType'] ?? {};
  const paxType      = paxTypeObj?.['$']?.Code ?? paxTypeObj?.Code ?? 'ADT';

  const baseFare  = _parseMoney(infoAttrs.BasePrice  ?? infoAttrs.ApproximateBasePrice);
  const taxes     = _parseMoney(infoAttrs.Taxes      ?? infoAttrs.ApproximateTaxes);
  const fees      = _parseMoney(infoAttrs.Fees       ?? 0);
  const totalFare = _parseMoney(infoAttrs.TotalPrice ?? infoAttrs.ApproximateTotalPrice) || (baseFare + taxes + fees);

  const fareInfoArr    = _arr(pricingInfo?.['air:FareInfo']);
  const firstFareInfo  = fareInfoArr[0] ?? {};
  const firstFareAttrs = firstFareInfo?.['$'] ?? {};
  const brandInfo      = firstFareInfo?.['air:Brand'] ?? {};
  const brandAttrs     = brandInfo?.['$'] ?? {};
  const bookingInfoArr = _arr(pricingInfo?.['air:BookingInfo']);
  const firstBooking   = bookingInfoArr[0]?.['$'] ?? {};

  const allOptionalServices = fareInfoArr.flatMap(fi =>
    _arr(fi?.['air:Brand']?.['air:OptionalServices']?.['air:OptionalService'])
  );

  const hostTokenArr = _arr(pricingInfo?.['common_v54_0:HostToken']);

  return {
    index,
    fareIndex:          index,
    brandName:          brandAttrs.Name     ?? `Fare ${index + 1}`,
    brandCode:          brandAttrs.BrandID  ?? brandAttrs.BrandCode ?? '',
    brandTier:          Number(brandAttrs.BrandTier ?? 1),
    cabin:              firstBooking.CabinClass ?? 'Economy',
    classOfService:     firstBooking.BookingCode ?? firstFareAttrs.BookingCode ?? '',
    fareBasisCode:      firstFareAttrs.FareBasis ?? firstFareAttrs.FareBasisCode ?? '',
    validatingAirline:  infoAttrs.PlatingCarrier ?? infoAttrs.ValidatingCarrier ?? '',
    paymentTimeLimit:   infoAttrs.LatestTicketingTime ?? infoAttrs.PaymentTimeLimit ?? null,
    passengerBreakdown: [{ passengerType: paxType, quantity: 1, baseFare, taxes, fees, totalFare }],
    totalBaseFare:      totalBase,
    totalTaxes,
    totalFees,
    grandTotal,
    baggage:            _parseBaggage(pricingInfo, paxType),
    penalties:          _parsePenalties(pricingInfo),
    brandAttributes:    _parseBrandAttributes(allOptionalServices),
    hostToken:          hostTokenArr[0]?.['_']      ?? null,
    hostTokenRef:       hostTokenArr[0]?.['$']?.Key ?? null,
    _raw:               solution,
  };
};

const _parsePenalties = (pricingInfo) => {
  const parse = (penObj) => {
    if (!penObj) return { allowed: false, amount: null, currency: 'INR', note: '' };
    const rawAmt = penObj?.['air:Amount'] ?? penObj?.['$']?.Amount ?? null;
    const amount = rawAmt != null ? _parseMoney(rawAmt) : null;
    const applies = penObj?.['$']?.PenaltyApplies ?? '';
    return { allowed: amount === 0, amount, currency: 'INR', note: applies ? `Applies: ${applies}` : '' };
  };
  return {
    change: parse(pricingInfo?.['air:ChangePenalty']),
    cancel: parse(pricingInfo?.['air:CancelPenalty']),
  };
};

const _parseBaggage = (pricingInfo, paxType) => {
  const section = pricingInfo?.['air:BaggageAllowances'];
  if (!section) return { [paxType]: { checked: null, carryOn: null } };
  const parseWeight = (textVal) => {
    if (!textVal) return null;
    for (const t of _arr(textVal)) {
      const m = String(t).match(/^(\d+)K/i);
      if (m) return { weight: Number(m[1]), unit: 'kg' };
    }
    return null;
  };
  const checkedArr = _arr(section?.['air:BaggageAllowanceInfo']);
  const carryOnArr = _arr(section?.['air:CarryOnAllowanceInfo']);
  return {
    [paxType]: {
      checked: checkedArr.length ? parseWeight(checkedArr[0]?.['air:TextInfo']?.['air:Text']) : null,
      carryOn: carryOnArr.length ? parseWeight(carryOnArr[0]?.['air:TextInfo']?.['air:Text']) : null,
    },
  };
};

const _parseBrandAttributes = (services) => {
  const map = { seatAssignment: 'Not Offered', checkedBag: 'Not Offered', meals: 'Not Offered', rebooking: 'Not Offered', refund: 'Not Offered', upgrade: 'Not Offered' };
  const tagToKey = { 'seat assignment': 'seatAssignment', 'pre reserved seat': 'seatAssignment', 'checked baggage': 'checkedBag', 'free checked baggage': 'checkedBag', 'meal': 'meals', 'meals and beverages': 'meals', 'meal services': 'meals', 'changeable': 'rebooking', 'rebooking': 'rebooking', 'refund': 'refund', 'refundable': 'refund', 'upgrade': 'upgrade' };
  const toValue = (c) => { if (!c) return 'Not Offered'; const l = c.toLowerCase(); if (l.includes('included') || l.includes('free')) return 'Included'; if (l.includes('charge') || l.includes('available')) return 'Chargeable'; return 'Not Offered'; };
  const priority = { 'Included': 2, 'Chargeable': 1, 'Not Offered': 0 };
  services.forEach((svc) => {
    const attrs = svc?.['$'] ?? {};
    const tag   = (attrs.Tag ?? attrs.Type ?? '').toLowerCase();
    const val   = toValue(attrs.Chargeable ?? '');
    for (const [k, attrKey] of Object.entries(tagToKey)) {
      if (tag.includes(k) && (priority[val] ?? 0) > (priority[map[attrKey]] ?? 0)) { map[attrKey] = val; break; }
    }
  });
  return map;
};

// ═══════════════════════════════════════════════════════════════════
// 7.  UTILITIES
// ═══════════════════════════════════════════════════════════════════

const _dig = (obj, keys) => keys.reduce((o, k) => o?.[k], obj);
const _arr = (val) => !val ? [] : Array.isArray(val) ? val : [val];
const _parseMoney = (val) => {
  if (val == null) return 0;
  if (typeof val === 'number') return val;
  const n = parseFloat(String(val).replace(/[A-Z]{3}/i, '').trim());
  return isNaN(n) ? 0 : n;
};