// ─────────────────────────────────────────────────────────────────
// lowFareSearchService.js
// ─────────────────────────────────────────────────────────────────

import axios from "axios";
import { transformLowFareResponse } from "../utils/lowFareTransformer";
import useStore from "../store/useStore";

// ── UPDATED: now points to the unified search endpoint ────────────
const API_BASE_URL = "https://api.bobros.org/flights/unified-search/search";

// ─── REQUEST BODY BUILDER ────────────────────────────────────────

// UPDATED: unified API expects `legs[]` with origin/destination
// (old API expected `flights[]` with from/to)
const buildLegsPayload = (flights) => {
  return flights
    .filter((f) => f.from && f.to && f.departureDate)
    .map((f) => ({
      origin:        f.from.toUpperCase(),
      destination:   f.to.toUpperCase(),
      departureDate: f.departureDate,
    }));
};

const buildPassengersPayload = (passengers) => {
  return passengers
    .filter((p) => p.count > 0)
    .map((p) => ({
      type:  p.type,
      count: p.count,
      age:   p.age,
    }));
};

const buildRequestBody = (searchParams) => {
  const { flights, passengers, tripType } = searchParams;

  // UPDATED: field renamed from flightsPayload → legsPayload,
  // and key in body changed from `flights` → `legs`
  const legsPayload       = buildLegsPayload(flights);
  const passengersPayload = buildPassengersPayload(passengers);

  if (legsPayload.length === 0) {
    throw new Error("At least one complete flight leg is required.");
  }

  const adtPassenger = passengersPayload.find((p) => p.type === "ADT");
  if (!adtPassenger || adtPassenger.count < 1) {
    throw new Error("At least 1 adult (ADT) passenger is required.");
  }

  const infPassenger = passengersPayload.find((p) => p.type === "INF");
  if (infPassenger && infPassenger.count > adtPassenger.count) {
    throw new Error("Infant count cannot exceed adult count.");
  }

  // UPDATED: body shape matches unified API contract
  // - `legs` instead of `flights`
  // - `tripType` included (unified API uses it for round-trip logic)
  // - `rawResponse: true` removed (not used by unified API)
  return {
    tripType:   tripType ?? "roundTrip",
    legs:       legsPayload,
    passengers: passengersPayload,
  };
};

// ─── MAIN SERVICE FUNCTION ───────────────────────────────────────

export const searchLowFare = async () => {
  const store = useStore.getState();

  store.setLoading(true);
  store.setError(null);
  store.resetSearch();
  store.setLoading(true); // resetSearch clears loading, set again

  try {
    const requestBody = buildRequestBody(store.searchParams);

    console.log("🚀 Unified Search Request Body:");
    console.log(JSON.stringify(requestBody, null, 2));

    const response = await axios.post(API_BASE_URL, requestBody, {
      headers: { "Content-Type": "application/json" },
    });

    const rawResponse = response.data;

    console.log("✅ Unified Search Raw Response:");
    console.log(JSON.stringify(rawResponse, null, 2));

    if (!rawResponse.success) {
      throw new Error(rawResponse.message || "Unified flight search failed.");
    }

    // ── UPDATED: traceId + travelerRefs now live at the top level ──
    //
    // Old API:
    //   traceId       → rawResponse.rawTravelportResponse.CatalogProductOfferingsResponse.traceId
    //   travelerRefs  → came from transformer
    //
    // New unified API:
    //   traceId       → rawResponse.traceId        e.g. "BOBROS-1779275582754"
    //   travelerRefs  → rawResponse.travelerRefs   array from CPO, passed through as-is
    //
    // transactionId is gone — unified API does not expose it.
    // ──────────────────────────────────────────────────────────────
    const traceId      = rawResponse.traceId      ?? null;
    const travelerRefs = rawResponse.travelerRefs  ?? [];

    console.log("✅ Extracted from unified response:");
    console.log("  traceId     :", traceId);       // "BOBROS-xxxx" — sent to pricing API
    console.log("  travelerRefs:", travelerRefs);  // passed to booking/pricing

    if (!traceId) {
      console.error("❌ traceId missing — check unified API response top level");
    }

    // Save full raw response (kept for debugging / raw response viewer)
    store.setRawResponse(rawResponse);

    // Transform → UI-ready data
    // NOTE: lowFareTransformer will need to be updated next to handle
    // the unified response shape (gdsFlights, ndcFlights, etc.)
    const transformed = transformLowFareResponse(rawResponse);

    console.log("🔑 travelerRefs going to store:", travelerRefs);

    // UPDATED: travelerRefs now sourced directly from rawResponse,
    // not from the transformer. transactionId removed (not in unified API).
    store.setTransactionMeta({
      traceId,
      travelerRefs,
    });

    store.setResults({
      outbound:      transformed.outbound,
      inbound:       transformed.inbound,
      multiCityLegs: transformed.multiCityLegs,
    });

    store.setLoading(false);

    return {
      success:  true,
      tripType: store.searchParams.tripType,
    };

  } catch (error) {
    let errorMessage = "Something went wrong. Please try again.";

    if (error.response) {
      errorMessage =
        error.response.data?.message ||
        `Server error: ${error.response.status}`;
    } else if (error.request) {
      errorMessage = "No response from server. Check your connection.";
    } else {
      errorMessage = error.message;
    }

    store.setError(errorMessage);

    return {
      success: false,
      error:   errorMessage,
    };
  }
};