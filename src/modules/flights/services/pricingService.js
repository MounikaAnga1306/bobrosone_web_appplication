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
  console.log('🔑 executePricing — selectedOutbound source:', selectedOutbound?.source);
  console.log('🔑 executePricing — selectedOutbound offeringId:', selectedOutbound?.offeringId);
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

    // ── Route to correct request builder based on source ──────────
    //
    // NDC_ACH (IndiGo 6E) needs a completely different request shape:
    //   - currencyCode at top level
    //   - segments with status, supplierCode, APISRequirementsRef
    //   - bookingRequirements[] array with hostToken per segment
    //   - passengers with count + age always present
    //
    // GDS (AI — GDS_CPO, GDS_LFS) uses the existing shape:
    //   - segments with classOfService, eTicketability, etc.
    //   - no bookingRequirements
    //
    // ── NDC detection — multi-signal for robustness ─────────────
    // source field is primary; fall back to carrier code and ndc leg marker
    // in case source gets dropped somewhere in the store round-trip.
    const _isNdcFlight = (f) => {
      if (!f) return false;
      if (f.source === 'NDC_ACH') return true;
      if (f.carrier === '6E')     return true;
      if (f.segments?.[0]?.ndc != null) return true;
      return false;
    };

    const isNdc       = _isNdcFlight(selectedOutbound) || _isNdcFlight(selectedInbound);
    const isRoundTrip = !!selectedInbound;

    console.log('🔍 Source detection:', {
      outboundSource:  selectedOutbound?.source,
      outboundCarrier: selectedOutbound?.carrier,
      hasNdcLeg:       selectedOutbound?.segments?.[0]?.ndc != null,
      isNdc,
      isRoundTrip,
    });

    let requestBody;
    if (isNdc) {
      requestBody = isRoundTrip
        ? _buildNdcRoundTripRequest(selectedOutbound, selectedInbound, passengerCounts, traceId, travelerRefs)
        : _buildNdcOneWayRequest(selectedOutbound, passengerCounts, traceId, travelerRefs);
    } else {
      requestBody = isRoundTrip
        ? _buildRoundTripRequest(selectedOutbound, selectedInbound, passengerCounts, traceId, travelerRefs)
        : _buildOneWayRequest(selectedOutbound, passengerCounts, traceId, travelerRefs);
    }

    console.log('📤 PRICING REQUEST BODY:');
    console.log(JSON.stringify(requestBody, null, 2));

    // ── Validate segments before sending ─────────────────────────
    const missingRef = requestBody.segments.find(s => !s.segmentKey || s.segmentKey.startsWith('MISSING'));
    if (missingRef) {
      throw new Error(`Segment missing segmentKey: ${JSON.stringify(missingRef)}`);
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
// 2.  GDS REQUEST BUILDERS  (AI — GDS_CPO / GDS_LFS)
//     Unchanged from previous version.
// ═══════════════════════════════════════════════════════════════════

const _buildOneWayRequest = (flight, passengerCounts, traceId, travelerRefs) => ({
  traceId,
  segments:   _buildGdsSegments(flight, 0),
  passengers: _buildPassengers(passengerCounts, travelerRefs),
});

const _buildRoundTripRequest = (outbound, inbound, passengerCounts, traceId, travelerRefs) => ({
  traceId,
  segments: [
    ..._buildGdsSegments(outbound, 0),
    ..._buildGdsSegments(inbound,  1),
  ],
  passengers: _buildPassengers(passengerCounts, travelerRefs),
});

// ─────────────────────────────────────────────────────────────────
// _buildGdsSegments
//
// segmentKey = seg.flightRef  (original GDS ref e.g. "s3")
// classOfService from selected brand's ADT fareInfo
// ─────────────────────────────────────────────────────────────────
const _buildGdsSegments = (flight, group) => {
  if (!flight?.segments?.length) return [];

  const brand = flight.selectedBrand;

  const adtFareInfo = (brand?.passengerFareInfo ?? []).find(p => p.passengerType === 'ADT')
    ?? (brand?.passengerFareInfo ?? [])[0]
    ?? null;

  const brandLevelCoS = adtFareInfo?.classOfService
    ?? brand?.classOfService
    ?? 'Y';

  console.log(`🔧 _buildGdsSegments group=${group}: brand=${brand?.brandName}, CoS=${brandLevelCoS}`);

  return flight.segments.map((seg, idx) => {
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
      flightNumber:  seg.number       ?? '',
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

// ═══════════════════════════════════════════════════════════════════
// 3.  NDC REQUEST BUILDERS  (IndiGo 6E — NDC_ACH)
// ═══════════════════════════════════════════════════════════════════

/**
 * NDC one-way pricing request.
 * Shape required by ACH/NDC pricing endpoint.
 */
const _buildNdcOneWayRequest = (flight, passengerCounts, traceId, travelerRefs) => {
  const { segments, bookingRequirements } = _buildNdcSegmentsAndRequirements(flight, 0);

  return {
    currencyCode: 'INR',
    traceId,
    segments,
    passengers:          _buildNdcPassengers(passengerCounts, travelerRefs),
    bookingRequirements,
  };
};

/**
 * NDC round-trip pricing request.
 * Both outbound + inbound must be NDC_ACH (6E) for this path to be used.
 */
const _buildNdcRoundTripRequest = (outbound, inbound, passengerCounts, traceId, travelerRefs) => {
  const out = _buildNdcSegmentsAndRequirements(outbound, 0);
  const ret = _buildNdcSegmentsAndRequirements(inbound,  1);

  return {
    currencyCode: 'INR',
    traceId,
    segments:            [...out.segments,            ...ret.segments],
    passengers:          _buildNdcPassengers(passengerCounts, travelerRefs),
    bookingRequirements: [...out.bookingRequirements, ...ret.bookingRequirements],
  };
};

// ─────────────────────────────────────────────────────────────────
// _buildNdcSegmentsAndRequirements
//
// Returns both arrays together since they share the same segmentKey.
//
// segments[i].segmentKey  = brand.ndcBookingRequirements[i].segmentRef
//   → the base64 ACH key (e.g. "J6XaM5VqWDKAlI+uSAAAAA==")
//   → NOT seg.flightRef (which is a GDS-style ref, not valid for NDC)
//
// bookingRequirements[i].segmentKey = same base64 key
// bookingRequirements[i].hostToken  = the full NDC host token string
// bookingRequirements[i].hostTokenRef = the base64 hostTokenRef key
//
// seg.ndc holds the raw NDC leg fields preserved by the transformer:
//   status, supplierCode, apisRequirementsRef, departureTimeRaw, arrivalTimeRaw
//
// Selected brand's ndcBookingRequirements[] is in the same leg order
// as flight.segments[] — index alignment is guaranteed by the transformer.
// ─────────────────────────────────────────────────────────────────
const _buildNdcSegmentsAndRequirements = (flight, group) => {
  if (!flight?.segments?.length) return { segments: [], bookingRequirements: [] };

  const brand   = flight.selectedBrand;
  const ndcReqs = brand?.ndcBookingRequirements ?? [];

  console.log(`🔧 _buildNdcSegmentsAndRequirements group=${group}`);
  console.log(`   brand name:`, brand?.brandName);
  console.log(`   brand keys:`, brand ? Object.keys(brand) : 'NO BRAND');
  console.log(`   ndcBookingRequirements (${ndcReqs.length}):`, JSON.stringify(ndcReqs, null, 2));
  console.log(`   bookingInfos:`, JSON.stringify(brand?.bookingInfos ?? [], null, 2));

  // Guard: if ndcBookingRequirements is empty but bookingInfos exists,
  // the transformer didn't populate it — fall back to bookingInfos directly
  const effectiveNdcReqs = ndcReqs.length > 0
    ? ndcReqs
    : (brand?.bookingInfos ?? []).map((bi) => ({
        segmentRef:   bi.segmentRef   || null,
        fareBasis:    bi.fareBasis    || bi.fareFamily || '',
        bookingCode:  bi.bookingCode  || '',
        hostToken:    bi.hostToken    || null,
        hostTokenRef: bi.hostTokenRef || null,
      }));

  console.log(`   effectiveNdcReqs (${effectiveNdcReqs.length}):`, JSON.stringify(effectiveNdcReqs, null, 2));

  const segments            = [];
  const bookingRequirements = [];

  flight.segments.forEach((seg, idx) => {
    // The base64 NDC segment key — comes from bookingInfo.segmentRef
    const ndcReq     = effectiveNdcReqs[idx] ?? {};
    const segmentKey = ndcReq.segmentRef;

    if (!segmentKey) {
      console.error(`❌ NDC segmentRef missing for segment index ${idx}. ndcReq:`, ndcReq);
    }

    // Use raw ISO times from seg.ndc (preserved by transformer)
    // If ndc is null (shouldn't happen for NDC_ACH), fall back to reconstructed ISO
    const departureTime = seg.ndc?.departureTimeRaw
      ?? `${seg.from.date}T${seg.from.time}:00.000+05:30`;
    const arrivalTime   = seg.ndc?.arrivalTimeRaw
      ?? `${seg.to.date}T${seg.to.time}:00.000+05:30`;

    // flightTime: use raw integer from leg (seg.flightTime preserved by transformer)
    const flightTime = seg.flightTime ?? _parseDurationToMinutes(seg.durationRaw ?? 0);

    console.log(`   seg[${idx}]: key=${segmentKey} ${seg.carrier}${seg.number} ${seg.from.airport}→${seg.to.airport}`);

    segments.push({
      segmentKey:            segmentKey ?? `MISSING_NDC_${group}_${idx}`,
      group,
      carrier:               seg.carrier      ?? '',
      flightNumber:          seg.number       ?? '',
      origin:                seg.from.airport ?? '',
      destination:           seg.to.airport   ?? '',
      departureTime,
      arrivalTime,
      flightTime:            String(flightTime),  // NDC pricing expects string
      equipment:             seg.equipment        ?? '',
      changeOfPlane:         'false',
      optionalServicesIndicator: 'false',

      // NDC-specific fields from raw leg data
      status:                seg.ndc?.status            ?? 'KK',
      supplierCode:          seg.ndc?.supplierCode       ?? seg.carrier ?? '',
      APISRequirementsRef:   seg.ndc?.apisRequirementsRef ?? null,
    });

    bookingRequirements.push({
      segmentKey:   segmentKey ?? `MISSING_NDC_${group}_${idx}`,
      fareBasis:    ndcReq.fareBasis    ?? '',
      bookingCode:  ndcReq.bookingCode  ?? '',
      hostToken:    ndcReq.hostToken    ?? null,
      hostTokenRef: ndcReq.hostTokenRef ?? null,
    });
  });

  return { segments, bookingRequirements };
};

// ─────────────────────────────────────────────────────────────────
// _buildNdcPassengers
//
// NDC pricing passenger shape differs from GDS:
//   { code, count, age, bookingTravelerRef }
// count and age are always required for NDC.
// ─────────────────────────────────────────────────────────────────
const _buildNdcPassengers = (passengerCounts, travelerRefs) => {
  const paxList = [];
  const typeIndexMap = {};

  const buildEntries = (code, count, age) => {
    for (let i = 0; i < count; i++) {
      if (typeIndexMap[code] === undefined) typeIndexMap[code] = 0;
      const currentIndex = typeIndexMap[code]++;

      const childCodes  = ['CHD', 'CNN'];
      const lookupCodes = code === 'CHD' ? childCodes : [code];
      const refEntry    = Array.isArray(travelerRefs)
        ? travelerRefs.find(
            (r) => (lookupCodes.includes(r.mappedCode) || lookupCodes.includes(r.code))
                && r.passengerIndex === currentIndex
          )
        : null;

      if (!refEntry) {
        console.warn(`⚠️ No travelerRef found for NDC code=${code} index=${currentIndex}`);
      }

      paxList.push({
        code,
        count: 1,     // NDC sends one entry per individual passenger, count=1 each
        age,
        ...(refEntry ? { bookingTravelerRef: refEntry.key } : {}),
      });
    }
  };

  if ((passengerCounts.ADT ?? 0) > 0) buildEntries('ADT', passengerCounts.ADT, 30);
  if ((passengerCounts.CNN ?? 0) > 0) buildEntries('CHD', passengerCounts.CNN, passengerCounts.CNNAge ?? 10);
  if ((passengerCounts.INF ?? 0) > 0) buildEntries('INF', passengerCounts.INF, passengerCounts.INFAge ?? 1);

  console.log('👥 Built NDC passengers:', JSON.stringify(paxList, null, 2));
  return paxList;
};

// ═══════════════════════════════════════════════════════════════════
// 4.  GDS PASSENGER BUILDER  (unchanged)
// ═══════════════════════════════════════════════════════════════════

// ─────────────────────────────────────────────────────────────────
// _buildPassengers  (GDS only)
//
// travelerRefs is an array of individual entries:
// [{ code, mappedCode, passengerIndex, key }]
// CNN passengers are sent as 'CHD' to the GDS pricing API.
// ─────────────────────────────────────────────────────────────────
const _buildPassengers = (passengerCounts, travelerRefs) => {
  const paxList = [];
  const typeIndexMap = {};

  const buildEntries = (code, count, extraProps = {}) => {
    for (let i = 0; i < count; i++) {
      if (typeIndexMap[code] === undefined) typeIndexMap[code] = 0;
      const currentIndex = typeIndexMap[code]++;

      const childCodes  = ['CHD', 'CNN'];
      const lookupCodes = code === 'CHD' ? childCodes : [code];
      const refEntry    = Array.isArray(travelerRefs)
        ? travelerRefs.find(
            (r) => (lookupCodes.includes(r.mappedCode) || lookupCodes.includes(r.code))
                && r.passengerIndex === currentIndex
          )
        : null;

      if (!refEntry) {
        console.warn(`⚠️ No travelerRef found for code=${code} index=${currentIndex}. Available refs:`, travelerRefs);
      }

      paxList.push({
        code,
        ...extraProps,
        ...(refEntry ? { bookingTravelerRef: refEntry.key } : {}),
      });
    }
  };

  if ((passengerCounts.ADT ?? 0) > 0) buildEntries('ADT', passengerCounts.ADT);
  if ((passengerCounts.CNN ?? 0) > 0) buildEntries('CHD', passengerCounts.CNN, { age: passengerCounts.CNNAge ?? 10 });
  if ((passengerCounts.INF ?? 0) > 0) buildEntries('INF', passengerCounts.INF, { age: passengerCounts.INFAge ?? 1 });

  console.log('👥 Built GDS passengers:', JSON.stringify(paxList, null, 2));
  return paxList;
};

// ═══════════════════════════════════════════════════════════════════
// 5.  API CALL WRAPPERS  (unchanged)
// ═══════════════════════════════════════════════════════════════════

export const callPricingAPI = async (requestBody) => {
  try {
    console.log(`📥 PRICING API request`);
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
// 6.  PUBLIC REQUEST BUILDERS  (for cards that call pricing directly)
// ═══════════════════════════════════════════════════════════════════

/**
 * Used by OneWayFlightCard / cards that build requests themselves.
 * Auto-detects NDC vs GDS from flight.source.
 *
 * Signature A: (flight, counts, traceId, travelerRefs)         — flight has selectedBrand
 * Signature B: (flight, brand, counts, traceId, travelerRefs)  — brand passed separately
 */
export const buildOneWayPricingRequest = (flight, brandOrCounts, countsOrTraceId, maybeTraceIdOrRefs, maybeRefs) => {
  const looksLikeBrand = brandOrCounts && (
    'classOfService' in brandOrCounts ||
    'brandName'      in brandOrCounts ||
    'brandRef'       in brandOrCounts
  );

  let flightWithBrand, passengerCounts, traceId, travelerRefs;

  if (looksLikeBrand) {
    flightWithBrand = { ...flight, selectedBrand: brandOrCounts };
    passengerCounts = countsOrTraceId;
    traceId         = typeof maybeTraceIdOrRefs === 'string' ? maybeTraceIdOrRefs : `BOBROS-${Date.now()}`;
    travelerRefs    = (typeof maybeTraceIdOrRefs === 'object' ? maybeTraceIdOrRefs : maybeRefs) ?? {};
  } else {
    flightWithBrand = flight;
    passengerCounts = brandOrCounts;
    traceId         = countsOrTraceId ?? `BOBROS-${Date.now()}`;
    travelerRefs    = maybeTraceIdOrRefs ?? {};
  }

  // Route to correct builder based on source
  if (flightWithBrand.source === 'NDC_ACH') {
    const { segments, bookingRequirements } = _buildNdcSegmentsAndRequirements(flightWithBrand, 0);
    return {
      currencyCode: 'INR',
      traceId,
      segments,
      passengers:          _buildNdcPassengers(passengerCounts, travelerRefs),
      bookingRequirements,
    };
  }

  return {
    traceId,
    segments:   _buildGdsSegments(flightWithBrand, 0),
    passengers: _buildPassengers(passengerCounts, travelerRefs),
  };
};

export const buildRoundTripPricingRequest = (outbound, inbound, passengerCounts, traceId, travelerRefs = {}) => {
  const isNdc = outbound.source === 'NDC_ACH' || inbound?.source === 'NDC_ACH';

  if (isNdc) {
    const out = _buildNdcSegmentsAndRequirements(outbound, 0);
    const ret = _buildNdcSegmentsAndRequirements(inbound,  1);
    return {
      currencyCode: 'INR',
      traceId,
      segments:            [...out.segments,            ...ret.segments],
      passengers:          _buildNdcPassengers(passengerCounts, travelerRefs),
      bookingRequirements: [...out.bookingRequirements, ...ret.bookingRequirements],
    };
  }

  return {
    traceId,
    segments: [..._buildGdsSegments(outbound, 0), ..._buildGdsSegments(inbound, 1)],
    passengers: _buildPassengers(passengerCounts, travelerRefs),
  };
};

// ═══════════════════════════════════════════════════════════════════
// 7.  DURATION PARSER  (unchanged)
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
// 8.  RESPONSE TRANSFORMER  (unchanged)
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
    currencyCode: "INR",
    traceId: flight.traceId || `BOBROS-${Date.now()}`,
    segments: normalizedSegments.map((seg) => ({
      segmentKey: seg.segmentKey,
      carrier: seg.carrier,
      flightNumber: seg.flightNumber,
      origin: seg.origin,
      destination: seg.destination,
      departureTime: seg.departureTime,
      arrivalTime: seg.arrivalTime,
      flightTime: seg.duration?.toString() || seg.flightTime,
      distance: seg.distance, // ✅ ADD THIS LINE - Include distance
      equipment: seg.equipment,
      changeOfPlane: "false",
      optionalServicesIndicator: "false",
      ...(is6E ? { status: seg.status || "KK", supplierCode: seg.supplierCode || "6E" } : {
        ETicketability: "Yes", LinkAvailability: "true", PolledAvailabilityOption: "Polled avail used",
        AvailabilitySource: "S", ParticipantLevel: "Secure Sell", AvailabilityDisplayType: "Fare Shop/Optimal Shop"
      }),
      group: 0
    })),
    passengers: [
      { code: 'ADT', count: passengerCounts.ADT || 1 },
      ...(passengerCounts.CNN ? [{ code: 'CNN', count: passengerCounts.CNN }] : []),
      ...(passengerCounts.INF ? [{ code: 'INF', count: passengerCounts.INF }] : [])
    ],
    bookingRequirements: normalizedSegments.map((seg) => {
      const bookingReq = { segmentKey: seg.segmentKey, bookingCode: selectedFare.bookingCode, fareBasis: selectedFare.fareBasis };
      if (is6E && hostTokenString) {
        bookingReq.hostToken = hostTokenString;
        if (hostTokenRefString) bookingReq.hostTokenRef = hostTokenRefString;
      }
      return bookingReq;
    })
  };
};

export const buildRoundTripPricingRequest = (outboundFlight, outboundFare, returnFlight, returnFare, passengerCounts, traceId = null) => {
  let outboundSegments = outboundFlight?.segments || [outboundFlight];
  outboundSegments = outboundSegments.map((seg) => ({
    ...seg, 
    segmentKey: seg.segmentKey || seg.key, 
    flightTime: seg.duration?.toString() || seg.flightTime,
    distance: seg.distance, // ✅ ADD DISTANCE HERE
    status: seg.status || "KK", 
    supplierCode: seg.supplierCode || "6E"
  }));
  
  let returnSegments = returnFlight?.segments || [returnFlight];
  returnSegments = returnSegments.map(seg => ({
    ...seg, 
    segmentKey: seg.segmentKey || seg.key, 
    flightTime: seg.duration?.toString() || seg.flightTime,
    distance: seg.distance, // ✅ ADD DISTANCE HERE
    status: seg.status || "KK", 
    supplierCode: seg.supplierCode || "6E"
  }));
  
  const outboundIs6E = outboundSegments[0]?.carrier === '6E';
  const returnIs6E = returnSegments[0]?.carrier === '6E';
  const bookingRequirements = [];
  
  outboundSegments.forEach((seg) => {
    const segmentKey = seg.segmentKey;
    let hostTokenString = null, hostTokenRefString = null;
    if (outboundFare.segments && outboundFare.segments.length > 0) {
      const segmentData = outboundFare.segments.find(s => s.segmentKey === segmentKey);
      if (segmentData) { hostTokenString = segmentData.hostToken; hostTokenRefString = segmentData.hostTokenRef; }
    }
    if (!hostTokenString && outboundFare.hostTokenMap) {
      hostTokenString = outboundFare.hostTokenMap[segmentKey];
      hostTokenRefString = outboundFare.hostTokenRefMap?.[segmentKey];
    }
    const bookingReq = { 
      segmentKey: segmentKey, 
      bookingCode: outboundFare.bookingCode || seg.bookingCode, 
      fareBasis: outboundFare.fareBasis 
    };
    if (outboundIs6E && hostTokenString) {
      bookingReq.hostToken = hostTokenString;
      if (hostTokenRefString) bookingReq.hostTokenRef = hostTokenRefString;
    }
    bookingRequirements.push(bookingReq);
  });
  
  returnSegments.forEach((seg) => {
    const segmentKey = seg.segmentKey;
    let hostTokenString = null, hostTokenRefString = null;
    if (returnFare.segments && returnFare.segments.length > 0) {
      const segmentData = returnFare.segments.find(s => s.segmentKey === segmentKey);
      if (segmentData) { hostTokenString = segmentData.hostToken; hostTokenRefString = segmentData.hostTokenRef; }
    }
    if (!hostTokenString && returnFare.hostTokenMap) {
      hostTokenString = returnFare.hostTokenMap[segmentKey];
      hostTokenRefString = returnFare.hostTokenRefMap?.[segmentKey];
    }
    const bookingReq = { 
      segmentKey: segmentKey, 
      bookingCode: returnFare.bookingCode || seg.bookingCode, 
      fareBasis: returnFare.fareBasis 
    };
    if (returnIs6E && hostTokenString) {
      bookingReq.hostToken = hostTokenString;
      if (hostTokenRefString) bookingReq.hostTokenRef = hostTokenRefString;
    }
    bookingRequirements.push(bookingReq);
  });
  
  return {
    currencyCode: "INR",
    traceId: traceId || `PRC-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`, // ✅ USE PROVIDED TRACE ID
    segments: [
      ...outboundSegments.map(seg => ({
        segmentKey: seg.segmentKey, 
        carrier: seg.carrier, 
        flightNumber: seg.flightNumber, 
        origin: seg.origin,
        destination: seg.destination, 
        departureTime: seg.departureTime, 
        arrivalTime: seg.arrivalTime,
        flightTime: seg.flightTime, 
        distance: seg.distance, // ✅ ADD DISTANCE HERE
        equipment: seg.equipment, 
        changeOfPlane: "false", 
        optionalServicesIndicator: "false",
        ...(outboundIs6E ? { status: seg.status || "KK", supplierCode: seg.supplierCode || "6E" } : {
          ETicketability: "Yes", 
          LinkAvailability: "true", 
          PolledAvailabilityOption: "Polled avail used",
          AvailabilitySource: "S", 
          ParticipantLevel: "Secure Sell", 
          AvailabilityDisplayType: "Fare Shop/Optimal Shop"
        }),
        group: 0
      })),
      ...returnSegments.map(seg => ({
        segmentKey: seg.segmentKey, 
        carrier: seg.carrier, 
        flightNumber: seg.flightNumber, 
        origin: seg.origin,
        destination: seg.destination, 
        departureTime: seg.departureTime, 
        arrivalTime: seg.arrivalTime,
        flightTime: seg.flightTime, 
        distance: seg.distance, // ✅ ADD DISTANCE HERE
        equipment: seg.equipment, 
        changeOfPlane: "false", 
        optionalServicesIndicator: "false",
        ...(returnIs6E ? { status: seg.status || "KK", supplierCode: seg.supplierCode || "6E" } : {
          ETicketability: "Yes", 
          LinkAvailability: "true", 
          PolledAvailabilityOption: "Polled avail used",
          AvailabilitySource: "S", 
          ParticipantLevel: "Secure Sell", 
          AvailabilityDisplayType: "Fare Shop/Optimal Shop"
        }),
        group: 1
      }))
    ],
    passengers: [
      { code: 'ADT', count: passengerCounts.ADT || 1 },
      ...(passengerCounts.CNN ? [{ code: 'CNN', count: passengerCounts.CNN }] : []),
      ...(passengerCounts.INF ? [{ code: 'INF', count: passengerCounts.INF }] : [])
    ],
    bookingRequirements
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
// 9.  UTILITIES  (unchanged)
// ═══════════════════════════════════════════════════════════════════

const _dig = (obj, keys) => keys.reduce((o, k) => o?.[k], obj);
const _arr = (val) => !val ? [] : Array.isArray(val) ? val : [val];
const _parseMoney = (val) => {
  if (val == null) return 0;
  if (typeof val === 'number') return val;
  const n = parseFloat(String(val).replace(/[A-Z]{3}/i, '').trim());
  return isNaN(n) ? 0 : n;
};