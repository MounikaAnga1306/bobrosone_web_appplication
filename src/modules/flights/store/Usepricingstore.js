// src/modules/flights/store/usePricingStore.js
//
// Zustand store for Pricing API
//
// Holds:
//   rawPricingResponse  — exact API response ({ success, traceId, passengerKeys, data })
//   transformedPricing  — clean UI-friendly shape (fareOptions[], segments[], totals, etc.)
//   passengerKeys       — extracted passengerKeys array (reused in PNR request)
//   traceId             — traceId string
//   isLoading / error   — async state
//
// Actions:
//   setPricingResponse(raw)  — stores raw + runs transformer
//   clearPricing()           — resets everything

import { create } from 'zustand';
import { transformPricingResponse } from '../services/pricingService';

const usePricingStore = create((set) => ({
  // ── Raw response ─────────────────────────────────────────────────
  rawPricingResponse: null,

  // ── Transformed / UI-friendly ────────────────────────────────────
  transformedPricing: null,

  // ── Derived helpers (pulled out for convenience) ─────────────────
  passengerKeys: [],   // [{ code, mappedCode, key, age? }]
  traceId: null,

  // ── Async state ──────────────────────────────────────────────────
  isLoading: false,
  error: null,

  // ── Actions ──────────────────────────────────────────────────────

  setLoading: (val) => set({ isLoading: val, error: null }),

  setError: (msg) => set({ error: msg, isLoading: false }),

  /**
   * Call this after a successful pricing API response.
   * raw = the full API response object:
   * { success, traceId, passengerKeys, data: { SOAP:Envelope: ... } }
   */
  setPricingResponse: (raw) => {
    const transformed = transformPricingResponse(raw);
    set({
      rawPricingResponse:  raw,
      transformedPricing:  transformed,
      passengerKeys:       raw?.passengerKeys ?? [],
      traceId:             raw?.traceId ?? null,
      isLoading:           false,
      error:               null,
    });
  },

  clearPricing: () =>
    set({
      rawPricingResponse: null,
      transformedPricing: null,
      passengerKeys:      [],
      traceId:            null,
      isLoading:          false,
      error:              null,
    }),
}));

export default usePricingStore;