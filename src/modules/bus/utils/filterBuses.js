// utils/filterBuses.js

// ── Time slot ranges (minutes from midnight) ───────────────────────────────
// "12 AM - 6 AM"  →   0 to 359
// "6 AM - 12 PM"  → 360 to 719
// "12 PM - 6 PM"  → 720 to 1079
// "6 PM - 12 AM"  → 1080 to 1439  (and wraps: 0 to 359 next day for arrivals)
//
// API stores times as total minutes from midnight.
// Arrival can exceed 1440 (next day) — so we mod 1440 for arrival checks.

const DEP_SLOTS = {
  "12 AM - 6 AM": (m) => m >= 0    && m < 360,
  "6 AM - 12 PM": (m) => m >= 360  && m < 720,
  "12 PM - 6 PM": (m) => m >= 720  && m < 1080,
  "6 PM - 12 AM": (m) => m >= 1080 && m < 1440,
};

const ARR_SLOTS = {
  "12 AM - 6 AM": (m) => (m % 1440) >= 0    && (m % 1440) < 360,
  "6 AM - 12 PM": (m) => (m % 1440) >= 360  && (m % 1440) < 720,
  "12 PM - 6 PM": (m) => (m % 1440) >= 720  && (m % 1440) < 1080,
  "6 PM - 12 AM": (m) => (m % 1440) >= 1080 && (m % 1440) < 1440,
};

export const filterBuses = (buses, filters) => {
  return buses.filter((bus) => {

    // ── Bus Type (OR within group) ─────────────────────────────────────────
    const isAC           = bus.AC           === true || bus.AC           === "true";
    const isNonAC        = bus.nonAC        === true || bus.nonAC        === "true";
    const isSeater       = bus.seater       === true || bus.seater       === "true";
    const isSleeper      = bus.sleeper      === true || bus.sleeper      === "true";
    const isPrimo        = bus.primo        === true || bus.primo        === "true";
    const isSingleSeater = bus.singleSeat   === true || bus.singleSeat   === "true"
                        || bus.singleSeater === true || bus.singleSeater === "true";
    const isSingleSleeper= bus.singleSleeper=== true || bus.singleSleeper=== "true";

    const anyBusTypeSelected =
      filters.ac || filters.nonAc || filters.seater || filters.sleeper ||
      filters.primo || filters.singleSeater || filters.singleSleeper;

    if (anyBusTypeSelected) {
      const match =
        (filters.ac            && isAC)           ||
        (filters.nonAc         && isNonAC)        ||
        (filters.seater        && isSeater)       ||
        (filters.sleeper       && isSleeper)      ||
        (filters.primo         && isPrimo)        ||
        (filters.singleSeater  && isSingleSeater) ||
        (filters.singleSleeper && isSingleSleeper);
      if (!match) return false;
    }

    // ── Popular "6PM-12AM" evening departure ──────────────────────────────
    // This is handled via depTime slot sync — no separate check needed
    // (Popular__6PM-12AM adds "6 PM - 12 AM" to depTime automatically)

    // ── Departure Time (OR across selected slots) ──────────────────────────
    if (filters.depTime?.size) {
      const dep = Number(bus.departureTime);
      const match = [...filters.depTime].some((slot) => DEP_SLOTS[slot]?.(dep));
      if (!match) return false;
    }

    // ── Arrival Time (OR across selected slots) ────────────────────────────
    if (filters.arrTime?.size) {
      const arr = Number(bus.arrivalTime);
      const match = [...filters.arrTime].some((slot) => ARR_SLOTS[slot]?.(arr));
      if (!match) return false;
    }

    // ── Boarding Points (OR) ───────────────────────────────────────────────
    if (filters.boarding?.size && bus.boardingTimes) {
      const arr = Array.isArray(bus.boardingTimes) ? bus.boardingTimes : [bus.boardingTimes];
      const names = arr.map((bp) => bp?.bpName || bp?.name || bp?.pointName || "");
      if (!names.some((n) => filters.boarding.has(n))) return false;
    }

    // ── Dropping Points (OR) ──────────────────────────────────────────────
    if (filters.dropping?.size && bus.droppingTimes) {
      const arr = Array.isArray(bus.droppingTimes) ? bus.droppingTimes : [bus.droppingTimes];
      const names = arr.map((dp) => dp?.bpName || dp?.name || dp?.pointName || "");
      if (!names.some((n) => filters.dropping.has(n))) return false;
    }

    // ── Operator (OR) ─────────────────────────────────────────────────────
    if (filters.ops?.size) {
      if (!filters.ops.has(bus.travels)) return false;
    }

    return true;
  });
};