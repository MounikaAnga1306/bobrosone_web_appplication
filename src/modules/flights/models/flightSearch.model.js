// src/modules/flights/models/flightSearch.model.js

/**
 * Flight Search Data Models
 * This file documents the shape of data used throughout the flight search feature
 */

/**
 * Passenger Types
 */
export const PassengerType = {
  ADT: 'ADT', // Adult (12+ years)
  CNN: 'CNN', // Child (2-11 years)
  INF: 'INF'  // Infant (0-23 months)
};

/**
 * @typedef {Object} Passenger
 * @property {string} code - Passenger type code (ADT, CNN, INF)
 * @property {number} [age] - Age for children and infants (required for CNN/INF)
 * 
 * @example
 * // Adult passenger
 * { code: 'ADT' }
 * 
 * @example
 * // Child passenger age 8
 * { code: 'CNN', age: 8 }
 * 
 * @example
 * // Infant passenger age 1
 * { code: 'INF', age: 1 }
 */
export const PassengerShape = {
  code: 'ADT',
  age: undefined
};

/**
 * @typedef {Object} FlightLeg
 * @property {string} origin - Origin airport code (e.g., 'DEL')
 * @property {string} destination - Destination airport code (e.g., 'HYD')
 * @property {string} departureDate - Departure date in YYYY-MM-DD format
 * 
 * @example
 * {
 *   origin: 'DEL',
 *   destination: 'HYD',
 *   departureDate: '2026-04-05'
 * }
 */
export const FlightLegShape = {
  origin: '',
  destination: '',
  departureDate: ''
};

/**
 * @typedef {Object} SearchParams
 * @property {FlightLeg[]} legs - Array of flight legs (single for one-way)
 * @property {Passenger[]} passengers - Array of passengers
 * 
 * @example
 * {
 *   legs: [{ origin: 'DEL', destination: 'HYD', departureDate: '2026-04-05' }],
 *   passengers: [{ code: 'ADT' }, { code: 'CNN', age: 8 }]
 * }
 */
export const SearchParamsShape = {
  legs: [FlightLegShape],
  passengers: [PassengerShape]
};

/**
 * @typedef {Object} FareBrand
 * @property {string} id - Brand ID (e.g., '2004496')
 * @property {string} name - Brand name (e.g., 'ECO VALUE', 'SALE FARE')
 * @property {string} [description] - Brand description
 * 
 * @example
 * {
 *   id: '2004496',
 *   name: 'ECO VALUE',
 *   description: 'Economy value fare'
 * }
 */
export const FareBrandShape = {
  id: '',
  name: '',
  description: undefined
};

/**
 * @typedef {Object} BaggageAllowance
 * @property {string} weight - Baggage weight (e.g., '15')
 * @property {string} unit - Unit of measurement (e.g., 'Kilograms')
 * 
 * @example
 * {
 *   weight: '15',
 *   unit: 'Kilograms'
 * }
 */
export const BaggageAllowanceShape = {
  weight: '',
  unit: ''
};

/**
 * @typedef {Object} TaxBreakdown
 * @property {string} category - Tax category (IN, K3, P2, YR)
 * @property {number} amount - Tax amount
 * @property {string} description - Tax description
 * 
 * @example
 * {
 *   category: 'IN',
 *   amount: 152,
 *   description: 'Airport Tax'
 * }
 */
export const TaxBreakdownShape = {
  category: '',
  amount: 0,
  description: ''
};

/**
 * @typedef {Object} FareRules
 * @property {Object} change - Change policy
 * @property {string} change.applies - When penalty applies
 * @property {boolean} change.noShow - No-show penalty applies
 * @property {string} change.penalty - Penalty percentage
 * @property {Object} cancel - Cancellation policy
 * @property {string} cancel.applies - When penalty applies
 * @property {boolean} cancel.noShow - No-show penalty applies
 * @property {string} cancel.penalty - Penalty percentage
 * 
 * @example
 * {
 *   change: {
 *     applies: 'Anytime',
 *     noShow: true,
 *     penalty: '100.00'
 *   },
 *   cancel: {
 *     applies: 'Anytime',
 *     noShow: true,
 *     penalty: '100.00'
 *   }
 * }
 */
export const FareRulesShape = {
  change: {
    applies: '',
    noShow: false,
    penalty: ''
  },
  cancel: {
    applies: '',
    noShow: false,
    penalty: ''
  }
};

/**
 * @typedef {Object} FareAmenities
 * @property {boolean} meals - Meals included
 * @property {boolean} seatSelection - Seat selection included
 * @property {boolean} changes - Free changes allowed
 * @property {boolean} priority - Priority boarding included
 * 
 * @example
 * {
 *   meals: false,
 *   seatSelection: false,
 *   changes: false,
 *   priority: false
 * }
 */
export const FareAmenitiesShape = {
  meals: false,
  seatSelection: false,
  changes: false,
  priority: false
};

/**
 * @typedef {Object} FareOption
 * @property {string} id - Fare ID (price point key from API)
 * @property {number} price - Total price for all passengers
 * @property {string} formattedPrice - Formatted price with currency (e.g., 'INR7285')
 * @property {string} basePrice - Base price (e.g., 'INR6398')
 * @property {TaxBreakdown[]} taxes - Tax breakdown array
 * @property {number} totalTax - Total tax amount
 * @property {FareBrand} brand - Brand information
 * @property {BaggageAllowance} baggage - Baggage allowance
 * @property {FareRules} fareRules - Fare rules
 * @property {FareAmenities} amenities - Amenities included
 * @property {boolean} isLowest - Is this the lowest fare for this flight
 * @property {boolean} refundable - Is the fare refundable
 * 
 * @example
 * {
 *   id: 'jXfufyUqWDKAPKiMLAAAAA==',
 *   price: 7285,
 *   formattedPrice: 'INR7285',
 *   basePrice: 'INR6398',
 *   taxes: [{ category: 'IN', amount: 152, description: 'Airport Tax' }],
 *   totalTax: 887,
 *   brand: { id: '2004496', name: 'ECO VALUE' },
 *   baggage: { weight: '15', unit: 'Kilograms' },
 *   fareRules: { change: {}, cancel: {} },
 *   amenities: { meals: false, seatSelection: false, changes: false, priority: false },
 *   isLowest: true,
 *   refundable: false
 * }
 */
export const FareOptionShape = {
  id: '',
  price: 0,
  formattedPrice: '',
  basePrice: '',
  taxes: [TaxBreakdownShape],
  totalTax: 0,
  brand: FareBrandShape,
  baggage: BaggageAllowanceShape,
  fareRules: FareRulesShape,
  amenities: FareAmenitiesShape,
  isLowest: false,
  refundable: false
};

/**
 * @typedef {Object} FlightSegment
 * @property {string} Carrier - Airline code (e.g., 'AI', '6E')
 * @property {string} FlightNumber - Flight number (e.g., '2577')
 * @property {string} Origin - Origin airport code (e.g., 'DEL')
 * @property {string} Destination - Destination airport code (e.g., 'HYD')
 * @property {string} DepartureTime - ISO departure time
 * @property {string} ArrivalTime - ISO arrival time
 * @property {string} FlightTime - Duration in minutes (e.g., '135')
 * @property {string} [Equipment] - Aircraft type (e.g., '32N')
 * 
 * @example
 * {
 *   Carrier: 'AI',
 *   FlightNumber: '2577',
 *   Origin: 'DEL',
 *   Destination: 'HYD',
 *   DepartureTime: '2026-04-05T02:00:00.000+05:30',
 *   ArrivalTime: '2026-04-05T04:15:00.000+05:30',
 *   FlightTime: '135',
 *   Equipment: '32N'
 * }
 */
export const FlightSegmentShape = {
  Carrier: '',
  FlightNumber: '',
  Origin: '',
  Destination: '',
  DepartureTime: '',
  ArrivalTime: '',
  FlightTime: '',
  Equipment: undefined
};

/**
 * @typedef {Object} FlightDetails
 * @property {string} [OriginTerminal] - Departure terminal
 * @property {string} [Equipment] - Aircraft type
 * 
 * @example
 * {
 *   OriginTerminal: '3',
 *   Equipment: '32N'
 * }
 */
export const FlightDetailsShape = {
  OriginTerminal: undefined,
  Equipment: undefined
};

/**
 * @typedef {Object} Flight
 * @property {string} id - Unique flight identifier
 * @property {FlightSegment} segment - Raw flight segment data from API
 * @property {FlightDetails} [details] - Additional flight details
 * @property {FareOption[]} fares - Available fare options
 * @property {number} lowestPrice - Lowest price among all fares
 * @property {string} airline - Airline name (e.g., 'Air India')
 * @property {string} airlineCode - Airline code (e.g., 'AI')
 * @property {string} flightNumber - Formatted flight number (e.g., 'AI-2577')
 * @property {string} departureTime - Formatted departure time (HH:MM)
 * @property {string} arrivalTime - Formatted arrival time (HH:MM)
 * @property {string} from - Origin airport code
 * @property {string} to - Destination airport code
 * @property {string} duration - Formatted duration (e.g., '2h 15m')
 * @property {number} stops - Number of stops (0 for direct)
 * @property {string[]} features - Flight features array
 * @property {number|null} lockPrice - Price lock amount (if available)
 * @property {string} cabinClass - Cabin class (e.g., 'Economy')
 * @property {number} seatsAvailable - Available seats
 * @property {Object} passengerBreakdown - Passenger counts
 * @property {number} passengerBreakdown.adults - Number of adults
 * @property {number} passengerBreakdown.children - Number of children
 * @property {number} passengerBreakdown.infants - Number of infants
 * @property {Object} [rawData] - Raw API data for reference
 * 
 * @example
 * {
 *   id: 'AI-2577-2026-04-05T02:00:00',
 *   segment: { Carrier: 'AI', FlightNumber: '2577', ... },
 *   fares: [FareOptionShape],
 *   lowestPrice: 4123,
 *   airline: 'Air India',
 *   airlineCode: 'AI',
 *   flightNumber: 'AI-2577',
 *   departureTime: '02:00',
 *   arrivalTime: '04:15',
 *   from: 'DEL',
 *   to: 'HYD',
 *   duration: '2h 15m',
 *   stops: 0,
 *   features: ['Economy', '9 seats left'],
 *   lockPrice: null,
 *   cabinClass: 'Economy',
 *   seatsAvailable: 9,
 *   passengerBreakdown: { adults: 1, children: 0, infants: 0 }
 * }
 */
export const FlightShape = {
  id: '',
  segment: FlightSegmentShape,
  details: undefined,
  fares: [FareOptionShape],
  lowestPrice: 0,
  airline: '',
  airlineCode: '',
  flightNumber: '',
  departureTime: '',
  arrivalTime: '',
  from: '',
  to: '',
  duration: '',
  stops: 0,
  features: [],
  lockPrice: null,
  cabinClass: '',
  seatsAvailable: 0,
  passengerBreakdown: {
    adults: 0,
    children: 0,
    infants: 0
  },
  rawData: undefined
};

/**
 * @typedef {Object} FlightSearchResults
 * @property {boolean} success - Success status
 * @property {Flight[]} flights - Array of flights
 * @property {Object} [rawFlights] - Raw API response
 * @property {number} count - Number of flights found
 * @property {string} [message] - Result message
 * @property {string} [error] - Error message (if any)
 * @property {boolean} loading - Loading state
 * @property {string} [searchId] - Search identifier
 * @property {string} [currency] - Currency code (e.g., 'INR')
 * @property {Object} [passengerBreakdown] - Passenger counts for this search
 * @property {number} passengerBreakdown.adults - Number of adults
 * @property {number} passengerBreakdown.children - Number of children
 * @property {number} passengerBreakdown.infants - Number of infants
 * 
 * @example
 * {
 *   success: true,
 *   flights: [FlightShape],
 *   count: 15,
 *   loading: false,
 *   currency: 'INR',
 *   passengerBreakdown: { adults: 2, children: 1, infants: 0 }
 * }
 */
export const FlightSearchResultsShape = {
  success: false,
  flights: [FlightShape],
  rawFlights: undefined,
  count: 0,
  message: undefined,
  error: undefined,
  loading: false,
  searchId: undefined,
  currency: 'INR',
  passengerBreakdown: {
    adults: 0,
    children: 0,
    infants: 0
  }
};

/**
 * @typedef {Object} Airport
 * @property {string} code - Airport code (e.g., 'DEL')
 * @property {string} name - Airport name (e.g., 'Indira Gandhi International Airport')
 * @property {string} city - City name (e.g., 'Delhi')
 * @property {string} country - Country name (e.g., 'India')
 * 
 * @example
 * {
 *   code: 'DEL',
 *   name: 'Indira Gandhi International Airport',
 *   city: 'Delhi',
 *   country: 'India'
 * }
 */
export const AirportShape = {
  code: '',
  name: '',
  city: '',
  country: ''
};

/**
 * @typedef {Object} SearchSummary
 * @property {string} fromCode - Origin airport code
 * @property {string} toCode - Destination airport code
 * @property {string} fromName - Origin airport name
 * @property {string} toName - Destination airport name
 * @property {string} date - Departure date (YYYY-MM-DD)
 * @property {string} formattedDate - Formatted date for display
 * @property {string} passengerText - Formatted passenger text
 * @property {Object} passengerCounts - Passenger counts
 * @property {number} passengerCounts.adults - Number of adults
 * @property {number} passengerCounts.children - Number of children
 * @property {number} passengerCounts.infants - Number of infants
 * @property {string} route - Formatted route (e.g., 'DEL → HYD')
 * @property {string} routeWithNames - Route with names (e.g., 'Delhi to Hyderabad')
 * @property {string} fullText - Complete search summary
 * 
 * @example
 * {
 *   fromCode: 'DEL',
 *   toCode: 'HYD',
 *   fromName: 'Delhi',
 *   toName: 'Hyderabad',
 *   date: '2026-04-05',
 *   formattedDate: '5 Apr 2026',
 *   passengerText: '2 Adults, 1 Child',
 *   passengerCounts: { adults: 2, children: 1, infants: 0 },
 *   route: 'DEL → HYD',
 *   routeWithNames: 'Delhi to Hyderabad',
 *   fullText: 'DEL to HYD on 5 Apr 2026 for 2 Adults, 1 Child'
 * }
 */
export const SearchSummaryShape = {
  fromCode: '',
  toCode: '',
  fromName: '',
  toName: '',
  date: '',
  formattedDate: '',
  passengerText: '',
  passengerCounts: {
    adults: 0,
    children: 0,
    infants: 0
  },
  route: '',
  routeWithNames: '',
  fullText: ''
};

// Tax description mapping
export const TaxDescriptions = {
  IN: 'Airport Tax',
  K3: 'Fuel Surcharge',
  P2: 'Passenger Service Fee',
  YR: 'Carrier Surcharge'
};

// Airline name mapping
export const AirlineNames = {
  '6E': 'IndiGo',
  'AI': 'Air India',
  'SG': 'SpiceJet',
  'UK': 'Vistara',
  'G8': 'GoAir',
  'I5': 'AirAsia India',
  '9W': 'Jet Airways',
  'S2': 'Air India Express',
  'QP': 'Akasa Air'
};

/**
 * Utility functions for type checking
 */
export const FlightModelUtils = {
  /**
   * Check if a passenger is an adult
   */
  isAdult: (passenger) => passenger?.code === PassengerType.ADT,
  
  /**
   * Check if a passenger is a child
   */
  isChild: (passenger) => passenger?.code === PassengerType.CNN,
  
  /**
   * Check if a passenger is an infant
   */
  isInfant: (passenger) => passenger?.code === PassengerType.INF,
  
  /**
   * Get passenger count breakdown from array
   */
  getPassengerCounts: (passengers) => ({
    adults: passengers?.filter(p => p.code === PassengerType.ADT).length || 0,
    children: passengers?.filter(p => p.code === PassengerType.CNN).length || 0,
    infants: passengers?.filter(p => p.code === PassengerType.INF).length || 0
  }),
  
  /**
   * Format passenger text for display
   */
  formatPassengerText: (counts) => {
    const parts = [];
    if (counts.adults > 0) parts.push(`${counts.adults} Adult${counts.adults > 1 ? 's' : ''}`);
    if (counts.children > 0) parts.push(`${counts.children} Child${counts.children > 1 ? 'ren' : ''}`);
    if (counts.infants > 0) parts.push(`${counts.infants} Infant${counts.infants > 1 ? 's' : ''}`);
    return parts.join(', ');
  },
  
  /**
   * Get airline name from code
   */
  getAirlineName: (code) => AirlineNames[code] || code,
  
  /**
   * Get tax description by category
   */
  getTaxDescription: (category) => TaxDescriptions[category] || `Tax (${category})`,
  
  /**
   * Parse price from string (e.g., 'INR7285' -> 7285)
   */
  parsePrice: (priceString) => {
    if (!priceString) return 0;
    const match = priceString.toString().match(/\d+/);
    return match ? parseInt(match[0]) : 0;
  },
  
  /**
   * Format duration from minutes to "2h 15m"
   */
  formatDuration: (minutes) => {
    if (!minutes) return '0h 0m';
    const mins = parseInt(minutes);
    const hours = Math.floor(mins / 60);
    const remainingMins = mins % 60;
    return `${hours}h ${remainingMins}m`;
  },
  
  /**
   * Format time from ISO to "HH:MM"
   */
  formatTime: (isoString) => {
    if (!isoString) return '--:--';
    try {
      const date = new Date(isoString);
      return date.toLocaleTimeString('en-IN', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      });
    } catch {
      return '--:--';
    }
  },
  
  /**
   * Format date to YYYY-MM-DD
   */
  formatDate: (date) => {
    if (!date) return '';
    const d = date instanceof Date ? date : new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  },
  
  /**
   * Format date for display (e.g., "5 Apr 2026")
   */
  formatDateForDisplay: (date) => {
    if (!date) return '';
    const d = date instanceof Date ? date : new Date(date);
    return d.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  }
};

export default {
  PassengerType,
  PassengerShape,
  FlightLegShape,
  SearchParamsShape,
  FareBrandShape,
  BaggageAllowanceShape,
  TaxBreakdownShape,
  FareRulesShape,
  FareAmenitiesShape,
  FareOptionShape,
  FlightSegmentShape,
  FlightDetailsShape,
  FlightShape,
  FlightSearchResultsShape,
  AirportShape,
  SearchSummaryShape,
  TaxDescriptions,
  AirlineNames,
  Utils: FlightModelUtils
};