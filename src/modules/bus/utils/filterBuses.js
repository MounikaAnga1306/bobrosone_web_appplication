// utils/filterBuses.js
export const filterBuses = (buses, filters) => {
  return buses.filter((bus) => {

    // ── Bus Type (AC / Non-AC / Seater / Sleeper / Primo) ──────────────────
    // OR logic inside the group — at least one selected type must match.
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
      let busTypeMatch = false;
      if (filters.ac            && isAC)           busTypeMatch = true;
      if (filters.nonAc         && isNonAC)        busTypeMatch = true;
      if (filters.seater        && isSeater)       busTypeMatch = true;
      if (filters.sleeper       && isSleeper)      busTypeMatch = true;
      if (filters.primo         && isPrimo)        busTypeMatch = true;
      if (filters.singleSeater  && isSingleSeater) busTypeMatch = true;
      if (filters.singleSleeper && isSingleSleeper)busTypeMatch = true;
      if (!busTypeMatch) return false;
    }

    // ── Popular "6PM-12AM" evening departure ───────────────────────────────
    if (filters.evening) {
      const dep = Number(bus.departureTime);
      if (!(dep >= 1080 && dep < 1440)) return false;
    }

    // ── Departure Time Slots ───────────────────────────────────────────────
    // Labels MUST match exactly what FiltersSidebar timeSlots uses:
    // "12 AM - 6 AM" | "6 AM - 12 PM" | "12 PM - 6 PM" | "6 PM - 12 AM"
    if (filters.depTime?.size) {
      const dep = Number(bus.departureTime);
      const depMatch = [...filters.depTime].some((slot) => {
        if (slot === "12 AM - 6 AM")  return dep >= 0    && dep < 360;
        if (slot === "6 AM - 12 PM")  return dep >= 360  && dep < 720;
        if (slot === "12 PM - 6 PM")  return dep >= 720  && dep < 1080;
        if (slot === "6 PM - 12 AM")  return dep >= 1080 && dep < 1440;
        return false;
      });
      if (!depMatch) return false;
    }

    // ── Arrival Time Slots ─────────────────────────────────────────────────
    if (filters.arrTime?.size) {
      const arr = Number(bus.arrivalTime);
      const arrMatch = [...filters.arrTime].some((slot) => {
        if (slot === "12 AM - 6 AM")  return arr >= 0    && arr < 360;
        if (slot === "6 AM - 12 PM")  return arr >= 360  && arr < 720;
        if (slot === "12 PM - 6 PM")  return arr >= 720  && arr < 1080;
        if (slot === "6 PM - 12 AM")  return arr >= 1080 && arr < 1440;
        return false;
      });
      if (!arrMatch) return false;
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

    // ── Operator ───────────────────────────────────────────────────────────
    if (filters.ops?.size) {
      if (!filters.ops.has(bus.travels)) return false;
    }

    return true;
  });
};