export const filterBuses = (buses, filters) => {
  return buses.filter((bus) => {
     const isAC = bus.AC === true || bus.AC === "true";
    const isNonAC = bus.nonAC === true || bus.nonAC === "true";
    const isSeater = bus.seater === true || bus.seater === "true";
    const isSleeper = bus.sleeper === true || bus.sleeper === "true";
    const isPrimo = bus.primo === true || bus.primo === "true";
    // AC filter
    if (filters.ac && !isAC) return false;

    // Non AC filter
    if (filters.nonAc && !isNonAC) return false;

    // Seater filter
    if (filters.seater && !isSeater) return false;

    // Sleeper filter
    if (filters.sleeper && !isSleeper) return false;

    // Primo
    if (filters.primo && !isPrimo) return false;
   // 6PM - 12AM popular filter
if (filters.evening) {
  const dep = Number(bus.departureTime);
  const arr = Number(bus.arrivalTime);

  if (!(dep >= 1080 && arr < 1440)) {
    return false;
  }
}
    // Departure Time
    if (filters.depTime?.size) {
      const dep = Number(bus.departureTime);

      const match = [...filters.depTime].some((slot) => {
        if (slot === "12 midnight - 6 AM") return dep >= 0 && dep < 360;
        if (slot === "6 AM - 12 noon") return dep >= 360 && dep < 720;
        if (slot === "12 noon - 6 PM") return dep >= 720 && dep < 1080;
        if (slot === "6 PM - 12 midnight") return dep >= 1080 && dep < 1440;
      });

      if (!match) return false;
    }

    // Arrival Time
    if (filters.arrTime?.size) {
      const arr = Number(bus.arrivalTime);

      const match = [...filters.arrTime].some((slot) => {
        if (slot === "12 midnight - 6 AM") return arr >= 0 && arr < 360;
        if (slot === "6 AM - 12 noon") return arr >= 360 && arr < 720;
        if (slot === "12 noon - 6 PM") return arr >= 720 && arr < 1080;
        if (slot === "6 PM - 12 midnight") return arr >= 1080 && arr < 1440;
      });

      if (!match) return false;
    }

    // Boarding Point
    if (filters.boarding?.size && bus.boardingTimes) {
  const boardingPoints = bus.boardingTimes.map((bp) => bp.bpName);

  const match = boardingPoints.some((bp) =>
    filters.boarding.has(bp)
  );

  if (!match) return false;
}

    // Dropping Point
   if (filters.dropping?.size && bus.droppingTimes?.length) {
  const dropPoints = bus.droppingTimes.map((dp) => dp.bpName);

  const match = dropPoints.some((dp) =>
    filters.dropping.has(dp)
  );

  if (!match) return false;
}

    // Operator
    if (filters.ops?.size) {
      if (!filters.ops.has(bus.travels)) return false;
    }

    return true;
  });
};