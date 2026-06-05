// src/modules/flights/store/usePnrStore.js
//
// Zustand store for PNR (Create Reservation) API
//
// Holds:
//   rawPnrResponse      — exact API response
//   transformedPnr      — clean shape (locatorCode, bookingId, travelers, segments)
//   pnrRequestBody      — what was sent (useful for retries / debugging)
//   isLoading / error   — async state
//
// Actions:
//   setPnrResponse(raw, requestBody)
//   clearPnr()

import { create } from 'zustand';
import { transformPnrResponse } from '../services/pnrService';

const usePnrStore = create((set) => ({
  // ── Raw response ─────────────────────────────────────────────────
  rawPnrResponse: null,

  // ── Transformed / UI-friendly ────────────────────────────────────
  transformedPnr: null,

  // ── What we sent (kept for debug / retry) ────────────────────────
  pnrRequestBody: null,

  // ── Async state ──────────────────────────────────────────────────
  isLoading: false,
  error: null,

  // ── Actions ──────────────────────────────────────────────────────

  setLoading: (val) => set({ isLoading: val, error: null }),

  setError: (msg) => set({ error: msg, isLoading: false }),

  /**
   * Call this after a successful PNR API response.
   * @param {object} raw           — full API response
   * @param {object} requestBody   — what was sent to the API
   */
  setPnrResponse: (raw, requestBody) => {
    const transformed = transformPnrResponse(raw);
    set({
      rawPnrResponse:  raw,
      transformedPnr:  transformed,
      pnrRequestBody:  requestBody ?? null,
      isLoading:       false,
      error:           null,
    });
  },

  clearPnr: () =>
    set({
      rawPnrResponse:  null,
      transformedPnr:  null,
      pnrRequestBody:  null,
      isLoading:       false,
      error:           null,
    }),
}));

export default usePnrStore;