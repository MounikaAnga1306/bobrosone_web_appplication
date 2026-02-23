export const mapFlightStatusResponse = (response) => {
  const data = response?.data;

  return {
    success: response?.success ?? false,

    provider: data?.provider ?? "",
    carrier: data?.carrier ?? "",
    flightNumber: data?.flightNumber ?? "",

    origin: data?.origin ?? "",
    destination: data?.destination ?? "",

    departureDate: data?.departureDate ?? "",

    status: data?.status ?? "",
    delayMinutes: data?.delayMinutes ?? 0,
    statusBasis: data?.statusBasis ?? "",

    departure: {
      scheduled: data?.departure?.scheduled ?? null,
      estimated: data?.departure?.estimated ?? null,
      actual: data?.departure?.actual ?? null,
      gate: data?.departure?.gate ?? null,
    },

    arrival: {
      scheduled: data?.arrival?.scheduled ?? null,
      estimated: data?.arrival?.estimated ?? null,
      actual: data?.arrival?.actual ?? null,
      gate: data?.arrival?.gate ?? null,
    },

    equipment: data?.equipment ?? "",
    liveStatusAvailable: data?.liveStatusAvailable ?? false,
  };
};
