// ─────────────────────────────────────────────────────────────────
// lowFareTransformer.js  (unified API version)
//
// Input:  rawResponse from POST /unified-search/search
//         └── gdsFlights.flights[]  (source: GDS_CPO | GDS_LFS | CPO_ONLY)
//         └── ndcFlights.flights[]  (source: NDC_ACH)
//
// Output: { outbound[], inbound[], multiCityLegs[], travelerRefs }
//
// Each flight in outbound/inbound matches the RoundTripFlightCard
// data contract exactly — no raw fields ever reach the UI.
// ─────────────────────────────────────────────────────────────────


// ═══════════════════════════════════════════════════════════════
// SECTION 1 — PURE HELPERS
// ═══════════════════════════════════════════════════════════════

/**
 * "PT6H"  → 360   |   "PT1H50M" → 110   |   "PT55M" → 55
 */
const parseDurationToMinutes = (isoDuration) => {
  if (!isoDuration) return 0;
  const h = parseInt(isoDuration.match(/(\d+)H/)?.[1] ?? 0);
  const m = parseInt(isoDuration.match(/(\d+)M/)?.[1] ?? 0);
  return h * 60 + m;
};

/**
 * "PT1H50M" → "1h 50m"   |   "PT55M" → "0h 55m"
 */
const formatDuration = (isoDuration) => {
  if (!isoDuration) return '';
  const total = parseDurationToMinutes(isoDuration);
  return `${Math.floor(total / 60)}h ${total % 60}m`;
};

/**
 * Integer minutes → "1h 25m"  (NDC leg.flightTime)
 */
const formatMinutes = (mins) => {
  if (mins == null) return '';
  return `${Math.floor(mins / 60)}h ${mins % 60}m`;
};

/**
 * "2026-10-15" → "15 Oct 2026"
 */
const formatDate = (dateStr) => {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
  });
};

/**
 * Handles two time formats:
 *   GDS:  "07:25:00"                        → "07:25"
 *   NDC:  "2026-10-15T05:00:00.000+05:30"  → "05:00"
 */
const parseTime = (timeStr) => {
  if (!timeStr) return '';
  if (timeStr.includes('T')) return timeStr.slice(11, 16);
  return timeStr.slice(0, 5);
};

/**
 * Normalises price to a plain number.
 *   number   → as-is
 *   "INR23472"   → 23472
 *   "INR7949.00" → 7949
 */
const parsePrice = (val) => {
  if (typeof val === 'number') return val;
  if (typeof val === 'string') return parseFloat(val.replace(/[^0-9.]/g, '')) || 0;
  return 0;
};


// ═══════════════════════════════════════════════════════════════
// SECTION 2 — SHARED SEGMENT BUILDER
// ═══════════════════════════════════════════════════════════════

/**
 * Maps flight.legs[] → segments[] shape expected by RoundTripFlightCard.
 * Works for both GDS and NDC legs (field names differ slightly).
 */
const buildSegments = (legs = []) => {
  return legs.map((leg) => {
    // GDS leg duration is a PT string; NDC uses flightTime (minutes)
    const duration = leg.duration
      ? formatDuration(leg.duration)
      : formatMinutes(leg.flightTime);

    return {
      flightRef:  leg.flightRef || null,
      carrier:    leg.carrier,
      number:     leg.flightNumber,
      flightCode: `${leg.carrier}${leg.flightNumber}`,
      equipment:  leg.equipment || null,
      duration,
      durationRaw:  leg.duration   || null,
      flightTime:   leg.flightTime || null,   // NDC: integer minutes — needed for pricing body
      group:        leg.group      ?? null,   // 0 = outbound, 1 = inbound

      // NDC-specific raw fields preserved for pricing request builder
      // These are NOT displayed in UI — only used in pricingService
      ndc: leg.providerCode === 'ACH' ? {
        status:            leg.status            || null,  // "KK"
        supplierCode:      leg.supplierCode      || null,  // "6E"
        apisRequirementsRef: leg.apisRequirementsRef || null,
        // Raw ISO departure/arrival times — NDC pricing needs the full ISO string
        departureTimeRaw:  leg.departure.time,   // "2026-10-15T05:00:00.000+05:30"
        arrivalTimeRaw:    leg.arrival.time,     // "2026-10-15T06:25:00.000+05:30"
      } : null,

      from: {
        airport:       leg.departure.location,
        date:          leg.departure.date,
        dateFormatted: formatDate(leg.departure.date),
        time:          parseTime(leg.departure.time),
        terminal:      leg.departure.terminal || null,
      },
      to: {
        airport:       leg.arrival.location,
        date:          leg.arrival.date,
        dateFormatted: formatDate(leg.arrival.date),
        time:          parseTime(leg.arrival.time),
        terminal:      leg.arrival.terminal || null,
      },
    };
  });
};

/**
 * Builds connectingAirports[] and connections[] from legs.
 * Uses connectingInfo.layovers[] when present (GDS connecting flights),
 * otherwise falls back to inter-leg derivation.
 */
const buildConnectionInfo = (flight) => {
  const legs = flight.legs || [];
  const stops = legs.length - 1;

  if (stops === 0) {
    return { stops: 0, connectingAirports: [], connections: [] };
  }

  // Prefer the pre-built connectingInfo from the API
  if (flight.connectingInfo?.layovers?.length) {
    const connectingAirports = flight.connectingInfo.layovers.map((l) => l.airport);
    const connections = flight.connectingInfo.layovers.map((l) => ({
      airport:            l.airport,
      connectionDuration: formatDuration(l.layoverDuration),
      connectionDurationRaw: l.layoverDuration,
    }));
    return { stops, connectingAirports, connections };
  }

  // Fallback: derive from leg boundaries (no layover duration available)
  const connectingAirports = legs.slice(0, -1).map((l) => l.arrival.location);
  const connections = connectingAirports.map((airport) => ({
    airport,
    connectionDuration: null,
    connectionDurationRaw: null,
  }));
  return { stops, connectingAirports, connections };
};


// ═══════════════════════════════════════════════════════════════
// SECTION 3 — BRAND OPTION BUILDERS (one per source type)
// ═══════════════════════════════════════════════════════════════

// ── 3a: GDS_CPO ─────────────────────────────────────────────────
//
// brandFareOption structure (already documented in project summary):
//   brand{}  passengerFlights[]  priceOptions[]  terms{}  seatsAvailable
//
const extractBaggageFromTerms = (terms = {}) => {
  const baggage = {};
  (terms.baggage || []).forEach((bag) => {
    const paxTypes = bag.passengerTypeCodes || ['ADT'];
    const item     = (bag.items || [])[0];
    if (!item) return;

    const measurement = (item.measurements || [])[0];
    const details = measurement
      ? { weight: measurement.value, unit: measurement.unit,
          includedInPrice: item.includedInOfferPrice === 'Yes' }
      : { includedInPrice: item.includedInOfferPrice === 'Yes' };

    paxTypes.forEach((paxType) => {
      if (!baggage[paxType]) baggage[paxType] = { checked: null, carryOn: null };
      if (bag.baggageType === 'FirstCheckedBag' && !baggage[paxType].checked) {
        baggage[paxType].checked = details;
      } else if (bag.baggageType === 'CarryOn' && !baggage[paxType].carryOn) {
        baggage[paxType].carryOn = details;
      }
    });
  });
  return baggage;
};

const extractPenaltiesFromTerms = (terms = {}) => {
  const p = (terms.penalties || [])[0];
  if (!p) return { change: null, cancel: null };

  const extractSide = (entries) => {
    const entry = (entries || [])[0];
    if (!entry) return null;
    const amt = (entry.amounts || [])[0];
    return {
      amount:    amt?.value ?? null,
      currency:  amt?.currency ?? 'INR',
      appliesTo: entry.penaltyAppliesTo || 'PerTicket',
      types:     entry.penaltyTypes || [],
    };
  };

  return {
    change: extractSide(p.change),
    cancel: extractSide(p.cancel),
  };
};

const extractBrandAttributes = (brand = {}) => {
  const attrs = {};

  // attributes[] — primary brand features
  (brand.attributes || []).forEach((attr) => {
    // "SeatAssignment" → "seatAssignment"
    const key = attr.classification.charAt(0).toLowerCase() + attr.classification.slice(1);
    attrs[key] = attr.inclusion;
  });

  // additionalAttributes[] — upgrade etc.
  (brand.additionalAttributes || []).forEach((attr) => {
    const key = attr.classification.charAt(0).toLowerCase() + attr.classification.slice(1);
    attrs[key] = attr.inclusion;
  });

  return attrs;
};

/**
 * Transforms one GDS_CPO brandFareOption into the UI brandOption shape.
 */
const transformGdsCpoBrand = (bfo) => {
  const { brand = {}, passengerFlights = [], priceOptions = [],
          terms = {}, seatsAvailable, brandRef } = bfo;

  // Cabin / fare info — from first ADT passengerFlight's first flightProduct
  const adtPf  = passengerFlights.find((pf) => pf.passengerTypeCode === 'ADT') || passengerFlights[0] || {};
  const adtFp  = (adtPf.flightProducts || [])[0] || {};

  // Price — from first priceOption
  const po     = priceOptions[0] || {};
  const price  = po.price || {};
  const breakdown = (price.priceBreakdown || []).map((b) => ({
    passengerType: b.passengerType,
    quantity:      b.quantity,
    base:          b.base,
    taxes:         b.totalTaxes,
    total:         b.total,
  }));

  return {
    brandRef:           brandRef,
    brandName:          brand.name   || '',
    brandCode:          brand.code   || '',
    tier:               brand.tier   || 0,
    cabin:              adtFp.cabin  || '',
    classOfService:     adtFp.classOfService || '',
    fareBasisCode:      adtFp.fareBasisCode  || '',
    fareType:           adtFp.fareType       || '',
    seatsLeft:          seatsAvailable ?? null,
    combinabilityCodes: po.combinabilityCodes || [],

    price: {
      currency:   price.currency   || 'INR',
      base:       price.base       || 0,
      totalTaxes: price.totalTaxes || 0,
      totalPrice: price.totalPrice || 0,
      breakdown,
    },

    brandAttributes: extractBrandAttributes(brand),
    baggage:         extractBaggageFromTerms(terms),
    penalties:       extractPenaltiesFromTerms(terms),

    paymentTimeLimit:  terms.paymentTimeLimit  || null,
    validatingAirline: (terms.validatingAirlines || [])[0] || null,

    // Booking keys — only present on cheapest brand (b0); null on others
    lfsBookingKeys: bfo.lfsBookingKeys || null,
  };
};

// ── 3b: GDS_LFS ─────────────────────────────────────────────────
//
// No CPO brand data. Has lfsFareOptions[]:
//   totalPrice "INR23472"  basePrice  taxes  bookingInfos[]  changePenalty  cancelPenalty
//
const transformGdsLfsBrand = (lfo) => {
  const totalPrice = parsePrice(lfo.totalPrice);
  const base       = parsePrice(lfo.basePrice);
  const taxes      = parsePrice(lfo.taxes);

  // Build a minimal tax breakdown from taxBreakdown array if present
  const breakdown = [{
    passengerType: 'ADT',
    quantity:      1,
    base,
    taxes,
    total:         totalPrice,
  }];

  // Baggage from first bookingInfo's baggageAllowance
  const bi  = (lfo.bookingInfos || [])[0] || {};
  const bag = bi.baggageAllowance?.maxWeight;
  const baggage = bag
    ? { ADT: { checked: { weight: bag.value, unit: bag.unit, includedInPrice: true }, carryOn: null } }
    : {};

  // Penalties
  const changePenaltyAmt = lfo.changePenalty?.amount
    ? parsePrice(lfo.changePenalty.amount)
    : null;
  const cancelPenaltyAmt = lfo.cancelPenalty?.amount
    ? parsePrice(lfo.cancelPenalty.amount)
    : null;

  return {
    brandRef:           `lfs-${lfo.platingCarrier}-${lfo.bookingInfos?.[0]?.bookingCode || ''}`,
    brandName:          lfo.fareFamily || 'Standard',
    brandCode:          '',
    tier:               2,
    cabin:              bi.cabinClass || 'Economy',
    classOfService:     bi.bookingCode || '',
    fareBasisCode:      bi.fareBasis  || '',
    fareType:           lfo.refundable ? 'RefundableFare' : 'NonRefundableFare',
    seatsLeft:          bi.bookingCount ?? null,
    combinabilityCodes: [],

    price: {
      currency:   'INR',
      base,
      totalTaxes: taxes,
      totalPrice,
      breakdown,
    },

    brandAttributes: {},  // LFS-only flights have no CPO brand attributes
    baggage,
    penalties: {
      change: changePenaltyAmt != null
        ? { amount: changePenaltyAmt, currency: 'INR', types: [lfo.changePenalty?.penaltyApplies || 'Anytime'] }
        : null,
      cancel: cancelPenaltyAmt != null
        ? { amount: cancelPenaltyAmt, currency: 'INR', types: [lfo.cancelPenalty?.penaltyApplies || 'Anytime'] }
        : null,
    },

    paymentTimeLimit:  lfo.latestTicketingTime || null,
    validatingAirline: lfo.platingCarrier || null,
    lfsBookingKeys:    null, // GDS_LFS doesn't carry booking keys in the same way
    bookingInfos:      lfo.bookingInfos || [],
  };
};

// ── 3c: NDC_ACH ─────────────────────────────────────────────────
//
// Has fareOptions[] — each fareOption is one brand/fare family:
//   fareFamily  totalPrice "INR7949.00"  basePrice  taxes  bookingInfos[]  fareRuleKeys[]
//
const transformNdcBrand = (fareOption) => {
  const totalPrice = parsePrice(fareOption.totalPrice);
  const base       = parsePrice(fareOption.basePrice);
  const taxes      = parsePrice(fareOption.taxes);

  const bi = (fareOption.bookingInfos || [])[0] || {};

  const breakdown = [{
    passengerType: fareOption.passengerType || 'ADT',
    quantity:      1,
    base,
    taxes,
    total: totalPrice,
  }];

  // Build per-segment booking requirements — one entry per bookingInfo
  // segmentRef is the base64 key the NDC pricing API needs as segmentKey
  // Each bookingInfo entry covers one segment of the flight
  const ndcBookingRequirements = (fareOption.bookingInfos || []).map((b) => ({
    segmentRef:   b.segmentRef   || null,  // base64 key → segments[].segmentKey in pricing
    fareBasis:    b.fareBasis    || fareOption.fareInfo?.fareBasis || '',
    bookingCode:  b.bookingCode  || '',
    hostToken:    b.hostToken    || null,
    hostTokenRef: b.hostTokenRef || null,
  }));

  return {
    brandRef:           fareOption.fareFamily || 'standard',
    brandName:          fareOption.fareFamily || 'Standard',
    brandCode:          '',
    tier:               2,
    cabin:              bi.cabinClass || 'Economy',
    classOfService:     bi.bookingCode || '',
    fareBasisCode:      fareOption.fareInfo?.fareBasis || bi.fareBasis || '',
    fareType:           '',   // ACH doesn't supply fareType
    seatsLeft:          bi.bookingCount ?? null,
    combinabilityCodes: [],

    price: {
      currency:   'INR',
      base,
      totalTaxes: taxes,
      totalPrice,
      breakdown,
    },

    brandAttributes: {},  // NDC search doesn't provide brand attributes
    baggage:         {},  // NDC search doesn't provide baggage in search phase
    penalties:       null,

    paymentTimeLimit:  null,
    validatingAirline: fareOption.supplierCode || null,

    // NDC booking identifiers — needed at pricing + booking step
    lfsBookingKeys:          null,
    bookingInfos:            fareOption.bookingInfos      || [],
    fareRuleKeys:            fareOption.fareRuleKeys      || [],
    hostToken:               bi.hostToken                 || null,
    // ndcBookingRequirements: one entry per segment, in leg order
    // pricingService reads this to build bookingRequirements[] in the NDC request
    ndcBookingRequirements,
  };
};


// ═══════════════════════════════════════════════════════════════
// SECTION 4 — PER-SOURCE FLIGHT TRANSFORMERS
// ═══════════════════════════════════════════════════════════════

/**
 * Shared base fields common to all 3 source types.
 */
const buildFlightBase = (flight) => {
  const segments   = buildSegments(flight.legs || []);
  const firstSeg   = segments[0] || {};
  const lastSeg    = segments[segments.length - 1] || {};
  const { stops, connectingAirports, connections } = buildConnectionInfo(flight);

  const totalDurationMinutes = parseDurationToMinutes(flight.totalDuration);

  return {
    // Identity
    offeringId:  flight.flightId,
    optionIndex: 0,           // unified API gives one option per flightId
    source:      flight.source,
    carrier:     flight.carrier,

    // Route
    from:        flight.origin,
    to:          flight.destination,

    // Times — GDS: "HH:MM:SS", NDC: ISO string → both normalised to "HH:MM"
    departureTime:          parseTime(flight.departureTime),
    arrivalTime:            parseTime(flight.arrivalTime),
    departureDate:          flight.departureDate,
    arrivalDate:            flight.arrivalDate,
    departureDateFormatted: formatDate(flight.departureDate),
    arrivalDateFormatted:   formatDate(flight.arrivalDate),

    // Duration
    totalDuration:        formatDuration(flight.totalDuration),
    totalDurationRaw:     flight.totalDuration,
    totalDurationMinutes, // for correct numeric sort in RoundTripPage

    // Stops
    stops,
    connectingAirports,
    connections,

    // All segments (for detail view in card/sheet)
    segments,

    // Price availability flag (CPO_ONLY flights have no price)
    priceAvailable: flight.source !== 'CPO_ONLY',
  };
};

/**
 * GDS_CPO — Air India with full brand + price + baggage + penalties
 */
const transformGdsCpoFlight = (flight) => {
  const base        = buildFlightBase(flight);
  const brandOptions = (flight.brandFareOptions || []).map(transformGdsCpoBrand);

  // Cheapest = lowest totalPrice across all brand options
  const cheapest = brandOptions.reduce(
    (min, b) => b.price.totalPrice < min.price.totalPrice ? b : min,
    brandOptions[0] || { price: { totalPrice: 0, currency: 'INR' } }
  );

  return {
    ...base,
    brandOptions,
    lfsFareOptions: null,
    cheapestPrice:  cheapest.price.totalPrice,
    cheapestBrand:  cheapest.brandName,
    currency:       cheapest.price.currency,
  };
};

/**
 * CPO_ONLY — Air India in CPO only; no price available yet.
 * Shown in list but marked priceAvailable: false so page can handle it.
 */
const transformCpoOnlyFlight = (flight) => {
  const base        = buildFlightBase(flight); // priceAvailable: false already set
  const brandOptions = (flight.brandFareOptions || []).map(transformGdsCpoBrand);

  return {
    ...base,
    brandOptions,
    lfsFareOptions: null,
    cheapestPrice:  0,
    cheapestBrand:  brandOptions[0]?.brandName || '',
    currency:       'INR',
  };
};

/**
 * GDS_LFS — Air India in LFS only; no CPO brand data.
 * brandOptions built from lfsFareOptions[].
 */
const transformGdsLfsFlight = (flight) => {
  const base        = buildFlightBase(flight);
  const brandOptions = (flight.lfsFareOptions || []).map(transformGdsLfsBrand);

  const cheapest = brandOptions[0] || { price: { totalPrice: 0, currency: 'INR' }, brandName: '' };

  return {
    ...base,
    brandOptions,
    lfsFareOptions: flight.lfsFareOptions || null, // keep raw for booking step
    cheapestPrice:  cheapest.price.totalPrice,
    cheapestBrand:  cheapest.brandName,
    currency:       'INR',
  };
};

/**
 * NDC_ACH — IndiGo flights.
 * brandOptions built from fareOptions[].
 */
const transformNdcFlight = (flight) => {
  const base        = buildFlightBase(flight);
  const brandOptions = (flight.fareOptions || []).map(transformNdcBrand);

  // Sort cheapest first
  brandOptions.sort((a, b) => a.price.totalPrice - b.price.totalPrice);

  const cheapest = brandOptions[0] || { price: { totalPrice: 0, currency: 'INR' }, brandName: '' };

  return {
    ...base,
    brandOptions,
    lfsFareOptions: null,
    cheapestPrice:  cheapest.price.totalPrice,
    cheapestBrand:  cheapest.brandName,
    currency:       'INR',
  };
};


// ═══════════════════════════════════════════════════════════════
// SECTION 5 — SOURCE ROUTER + OUTBOUND/INBOUND SPLITTER
// ═══════════════════════════════════════════════════════════════

/**
 * Routes one raw flight to the correct transformer based on source.
 */
const transformFlight = (flight) => {
  switch (flight.source) {
    case 'GDS_CPO':  return transformGdsCpoFlight(flight);
    case 'CPO_ONLY': return transformCpoOnlyFlight(flight);
    case 'GDS_LFS':  return transformGdsLfsFlight(flight);
    case 'NDC_ACH':  return transformNdcFlight(flight);
    default:
      console.warn(`[transformer] Unknown source: ${flight.source}`, flight.flightId);
      return null;
  }
};

/**
 * Determines outbound vs inbound using legs[0].group.
 *   group "0" / 0 → outbound
 *   group "1" / 1 → inbound
 * Fallback: compare departureDate to searchParams.legs[0].departureDate
 */
const getFlightGroup = (flight, outboundDate) => {
  const group = flight.legs?.[0]?.group;

  if (group === 0 || group === '0') return 'outbound';
  if (group === 1 || group === '1') return 'inbound';

  // Fallback — compare date
  if (outboundDate && flight.departureDate === outboundDate) return 'outbound';
  return 'inbound';
};


// ═══════════════════════════════════════════════════════════════
// SECTION 6 — MAIN ENTRY POINT
// ═══════════════════════════════════════════════════════════════

/**
 * transformLowFareResponse
 *
 * @param {Object} rawResponse  — from POST /unified-search/search
 * @returns {Object} {
 *   outbound[],       UI-ready outbound flights
 *   inbound[],        UI-ready inbound/return flights
 *   multiCityLegs[], always [] for round-trip (reserved for future)
 *   travelerRefs,     passed through from API top level
 * }
 */
export const transformLowFareResponse = (rawResponse) => {
  const {
    gdsFlights,
    ndcFlights,
    travelerRefs  = [],
    searchParams  = {},
  } = rawResponse;

  // Outbound departure date for group fallback logic
  const outboundDate = searchParams?.legs?.[0]?.departureDate ?? null;

  // Collect all raw flights from both sources
  const allRawFlights = [
    ...(gdsFlights?.flights || []),
    ...(ndcFlights?.flights || []),
  ];

  const outbound = [];
  const inbound  = [];

  allRawFlights.forEach((rawFlight) => {
    const transformed = transformFlight(rawFlight);
    if (!transformed) return; // skip unknown sources

    const group = getFlightGroup(rawFlight, outboundDate);

    if (group === 'outbound') outbound.push(transformed);
    else                      inbound.push(transformed);
  });

  // Sort both lists cheapest-first as default (page can re-sort)
  outbound.sort((a, b) => a.cheapestPrice - b.cheapestPrice);
  inbound.sort( (a, b) => a.cheapestPrice - b.cheapestPrice);

  console.log(`[transformer] outbound: ${outbound.length} | inbound: ${inbound.length}`);
  console.log(`[transformer] sources:`, {
    GDS_CPO:  allRawFlights.filter(f => f.source === 'GDS_CPO').length,
    CPO_ONLY: allRawFlights.filter(f => f.source === 'CPO_ONLY').length,
    GDS_LFS:  allRawFlights.filter(f => f.source === 'GDS_LFS').length,
    NDC_ACH:  allRawFlights.filter(f => f.source === 'NDC_ACH').length,
  });

  return {
    outbound,
    inbound,
    multiCityLegs: [], // round-trip only for now
    travelerRefs,
  };
};