import { create } from "zustand";

const useStore = create((set) => ({
  // ─────────────────────────────────────────────
  // SEARCH PARAMS
  // ─────────────────────────────────────────────
  searchParams: {
    tripType: "oneWay",
    flights: [
      { from: "", to: "", departureDate: "" },
    ],
    passengers: [
      { type: "ADT", count: 1, age: 25 },
      { type: "CNN", count: 0, age: 10 },
      { type: "INF", count: 0, age: 1  },
    ],
  },

  setSearchParams: (params) =>
    set((state) => ({
      searchParams: { ...state.searchParams, ...params },
    })),

  updateFlightLeg: (index, field, value) =>
    set((state) => {
      const updatedFlights = [...state.searchParams.flights];
      updatedFlights[index] = { ...updatedFlights[index], [field]: value };
      return { searchParams: { ...state.searchParams, flights: updatedFlights } };
    }),

  addFlightLeg: () =>
    set((state) => ({
      searchParams: {
        ...state.searchParams,
        flights: [
          ...state.searchParams.flights,
          { from: "", to: "", departureDate: "" },
        ],
      },
    })),

  removeFlightLeg: (index) =>
    set((state) => {
      const updatedFlights = state.searchParams.flights.filter(
        (_, i) => i !== index
      );
      return {
        searchParams: { ...state.searchParams, flights: updatedFlights },
      };
    }),

  updatePassengerCount: (type, count) =>
    set((state) => {
      const updatedPassengers = state.searchParams.passengers.map((p) =>
        p.type === type ? { ...p, count } : p
      );
      return {
        searchParams: { ...state.searchParams, passengers: updatedPassengers },
      };
    }),

  setTripType: (tripType) =>
    set((state) => {
      let flights = [];
      if (tripType === "oneWay") {
        flights = [{ from: "", to: "", departureDate: "" }];
      } else if (tripType === "ROUND_TRIP") {
        const outbound = state.searchParams.flights[0];
        flights = [
          { from: outbound.from, to: outbound.to, departureDate: outbound.departureDate },
          { from: outbound.to, to: outbound.from, departureDate: "" },
        ];
      } else if (tripType === "MULTI_CITY") {
        flights = [
          { from: "", to: "", departureDate: "" },
          { from: "", to: "", departureDate: "" },
        ];
      }
      return {
        searchParams: { ...state.searchParams, tripType, flights },
      };
    }),

  // ─────────────────────────────────────────────
  // RAW RESPONSE
  // ─────────────────────────────────────────────
  rawResponse: null,
  setRawResponse: (raw) => set({ rawResponse: raw }),

  // ─────────────────────────────────────────────
  // TRANSACTION META
  //
  // traceId       — from raw response top-level "traceId"
  //                 THIS is what the pricing API wants as its "traceId" field
  //                 (NOT transactionId — that is an internal DB reference only)
  //
  // transactionId — from raw response top-level "transactionId"
  //                 kept for reference / debugging only, NOT sent to pricing
  //
  // travelerRefs  — { ADT: "base64==", CNN: "base64==", INF: "base64==" }
  //                 booking traveler refs needed for pricing passengers array
  // ─────────────────────────────────────────────
  traceId:       null,   // ← NEW — this is what pricing API receives
  transactionId: null,   // kept for reference only
  travelerRefs:  null,

  // lowFareSearchService calls this after transformer returns
  // Pass ALL three so nothing is lost
  setTransactionMeta: ({ traceId, transactionId, travelerRefs }) =>
    set({ traceId, transactionId, travelerRefs }),

  // ─────────────────────────────────────────────
  // UI-READY RESULTS
  // ─────────────────────────────────────────────
  outbound:      [],
  inbound:       [],
  multiCityLegs: [],

  setResults: ({ outbound, inbound, multiCityLegs }) =>
    set({ outbound, inbound, multiCityLegs }),

  // ─────────────────────────────────────────────
  // SELECTED FLIGHTS
  // ─────────────────────────────────────────────
  selectedOutbound:     null,
  selectedInbound:      null,
  selectedMultiCityLegs: [],

  setSelectedOutbound: (flight) => set({ selectedOutbound: flight }),
  setSelectedInbound:  (flight) => set({ selectedInbound: flight }),
  setSelectedMultiCityLeg: (index, flight) =>
    set((state) => {
      const updated = [...state.selectedMultiCityLegs];
      updated[index] = flight;
      return { selectedMultiCityLegs: updated };
    }),

  // ─────────────────────────────────────────────
  // PRICING STATE
  // ─────────────────────────────────────────────
  rawPricingResponse:    null,
  pricingResult:         null,
  selectedSolutionIndex: 0,
  pricingLoading:        false,
  pricingError:          null,

  setRawPricingResponse:    (raw)   => set({ rawPricingResponse: raw }),
  setPricingResult:         (result) => set({ pricingResult: result }),
  setSelectedSolutionIndex: (idx)   => set({ selectedSolutionIndex: idx }),
  setPricingLoading:        (val)   => set({ pricingLoading: val }),
  setPricingError:          (err)   => set({ pricingError: err }),

  // ─────────────────────────────────────────────
  // LOADING & ERROR (search)
  // ─────────────────────────────────────────────
  isLoading: false,
  error:     null,

  setLoading: (isLoading) => set({ isLoading }),
  setError:   (error)     => set({ error, isLoading: false }),

  // ─────────────────────────────────────────────
  // RESET
  // ─────────────────────────────────────────────
  resetSearch: () =>
    set({
      rawResponse:          null,
      outbound:             [],
      inbound:              [],
      multiCityLegs:        [],
      selectedOutbound:     null,
      selectedInbound:      null,
      selectedMultiCityLegs: [],
      traceId:              null,   // ← reset traceId too
      transactionId:        null,
      travelerRefs:         null,
      isLoading:            false,
      error:                null,
      rawPricingResponse:   null,
      pricingResult:        null,
      selectedSolutionIndex: 0,
      pricingLoading:       false,
      pricingError:         null,
    }),
}));

export default useStore;