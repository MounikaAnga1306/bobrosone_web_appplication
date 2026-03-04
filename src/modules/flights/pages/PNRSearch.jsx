// src/modules/flights/components/PNRSearch.jsx
import React, { useState } from "react";
import { FaSearch, FaPlane, FaUser, FaEnvelope, FaPhone, FaMapMarkerAlt, FaTag, FaRupeeSign, FaSuitcase, FaUtensils, FaChair } from "react-icons/fa";
import { MdFlightTakeoff, MdFlightLand } from "react-icons/md";

const PNRSearch = () => {
  const [pnrCode, setPnrCode] = useState("");
  const [bookingData, setBookingData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Function to parse SOAP response and extract booking data
  const parseSOAPResponse = (soapData) => {
    try {
      console.log("🔍 Parsing SOAP Response:", soapData);
      
      // Check if we have the expected structure
      if (!soapData || !soapData["SOAP:Envelope"]) {
        console.error("Invalid SOAP structure:", soapData);
        return null;
      }

      const envelope = soapData["SOAP:Envelope"];
      const body = envelope["SOAP:Body"];
      const universalRsp = body["universal:UniversalRecordRetrieveRsp"];
      
      if (!universalRsp) {
        console.error("No UniversalRecordRetrieveRsp found");
        return null;
      }

      const universalRecord = universalRsp["universal:UniversalRecord"];
      
      if (!universalRecord) {
        console.error("No UniversalRecord found");
        return null;
      }

      console.log("✅ Universal Record found:", universalRecord);

      // Extract Universal Record info
      const universalRecordInfo = {
        locatorCode: universalRecord.$?.LocatorCode,
        status: universalRecord.$?.Status,
        version: universalRecord.$?.Version
      };

      // Extract Provider Reservation Info
      const providerReservation = universalRecord["universal:ProviderReservationInfo"];
      
      // Extract Booking Traveler (Passenger)
      const bookingTraveler = universalRecord["common_v52_0:BookingTraveler"];
      
      // Extract Air Reservation (Flight)
      const airReservation = universalRecord["air:AirReservation"];
      
      // Extract General Remarks
      const generalRemarks = universalRecord["common_v52_0:GeneralRemark"];
      
      // Extract Form of Payment
      const formOfPayment = universalRecord["common_v52_0:FormOfPayment"];

      // Parse passenger info
      const passenger = parsePassengerInfo(bookingTraveler);
      
      // Parse flight info
      const flight = parseFlightInfo(airReservation);
      
      // Parse remarks
      const remarks = parseGeneralRemarks(generalRemarks);

      const parsedData = {
        locatorCode: universalRecordInfo.locatorCode,
        universalRecord: {
          status: universalRecordInfo.status,
          version: universalRecordInfo.version,
          createDate: providerReservation?.$?.CreateDate
        },
        passenger,
        flight,
        remarks,
        payment: formOfPayment ? {
          type: formOfPayment.$?.Type,
          key: formOfPayment.$?.Key
        } : null
      };

      console.log("✅ Parsed Booking Data:", parsedData);
      return parsedData;

    } catch (err) {
      console.error("❌ Error parsing SOAP response:", err);
      return null;
    }
  };

  // Parse passenger information
  const parsePassengerInfo = (bookingTraveler) => {
    if (!bookingTraveler) return null;

    try {
      const name = bookingTraveler["common_v52_0:BookingTravelerName"] || {};
      const email = bookingTraveler["common_v52_0:Email"] || {};
      const phone = bookingTraveler["common_v52_0:PhoneNumber"] || {};
      const address = bookingTraveler["common_v52_0:Address"] || {};
      const ssr = bookingTraveler["common_v52_0:SSR"] || {};

      // Parse SSR document info if available
      let documentInfo = null;
      if (ssr.$?.FreeText) {
        const docParts = ssr.$?.FreeText.split('/');
        if (docParts.length >= 5) {
          documentInfo = {
            type: docParts[0]?.substring(2), // Remove "P/" prefix
            country: docParts[1],
            number: docParts[2],
            issueCountry: docParts[3],
            gender: docParts[4]?.substring(0, 1),
            dob: docParts[4]?.substring(1),
            name: docParts[5]
          };
        }
      }

      return {
        key: bookingTraveler.$?.Key,
        type: bookingTraveler.$?.TravelerType,
        age: bookingTraveler.$?.Age,
        dob: bookingTraveler.$?.DOB,
        gender: bookingTraveler.$?.Gender,
        name: {
          prefix: name.$?.Prefix || "",
          first: name.$?.First || "",
          last: name.$?.Last || "",
        },
        email: email.$?.EmailID,
        phone: phone.$?.Number ? {
          countryCode: phone.$?.CountryCode,
          areaCode: phone.$?.AreaCode,
          number: phone.$?.Number,
        } : null,
        address: address["common_v52_0:Street"] ? {
          street: address["common_v52_0:Street"],
          city: address["common_v52_0:City"],
          state: address["common_v52_0:State"],
          postalCode: address["common_v52_0:PostalCode"],
          country: address["common_v52_0:Country"],
        } : null,
        document: documentInfo
      };
    } catch (err) {
      console.error("Error parsing passenger info:", err);
      return null;
    }
  };

  // Parse flight information
  const parseFlightInfo = (airReservation) => {
    if (!airReservation) return null;

    try {
      const airSegment = airReservation["air:AirSegment"] || {};
      const flightDetails = airSegment["air:FlightDetails"] || {};
      const supplierLocator = airReservation["common_v52_0:SupplierLocator"] || {};
      const airPricingInfo = airReservation["air:AirPricingInfo"] || {};
      const taxInfos = airReservation["air:TaxInfo"] || [];
      
      // Parse fare info
      const fareInfo = airPricingInfo["air:FareInfo"] || {};
      const brand = fareInfo["air:Brand"] || {};
      const brandTexts = brand["air:Text"] || [];
      
      // Parse baggage and meal info from optional services
      const optionalServices = brand["air:OptionalServices"] || {};
      const services = optionalServices["air:OptionalService"] || [];
      
      let baggage = "Not specified";
      let meal = "Not specified";
      let seatAssignment = "Not specified";
      
      services.forEach(service => {
        const serviceInfo = service["common_v52_0:ServiceInfo"] || {};
        const description = serviceInfo["common_v52_0:Description"];
        
        if (service.$?.ServiceSubCode === "P01") {
          baggage = description || "Free Checked Baggage";
        } else if (service.$?.ServiceSubCode === "0B3") {
          meal = description || "Meal included";
        } else if (service.$?.ServiceSubCode === "0B5") {
          seatAssignment = description || "Pre-reserved seat";
        }
      });

      // Parse penalties
      const changePenalty = airPricingInfo["air:ChangePenalty"];
      const cancelPenalty = airPricingInfo["air:CancelPenalty"];

      return {
        locatorCode: airReservation.$?.LocatorCode,
        createDate: airReservation.$?.CreateDate,
        modifiedDate: airReservation.$?.ModifiedDate,
        supplier: supplierLocator.$ ? {
          code: supplierLocator.$?.SupplierCode,
          locatorCode: supplierLocator.$?.SupplierLocatorCode,
        } : null,
        segment: {
          carrier: airSegment.$?.Carrier,
          flightNumber: airSegment.$?.FlightNumber,
          cabinClass: airSegment.$?.CabinClass,
          classOfService: airSegment.$?.ClassOfService,
          origin: airSegment.$?.Origin,
          destination: airSegment.$?.Destination,
          departureTime: airSegment.$?.DepartureTime,
          arrivalTime: airSegment.$?.ArrivalTime,
          travelTime: airSegment.$?.TravelTime,
          status: airSegment.$?.Status,
          equipment: airSegment.$?.Equipment,
          terminal: flightDetails.$?.OriginTerminal,
          sellMessage: airSegment["common_v52_0:SellMessage"],
        },
        pricing: airPricingInfo.$ ? {
          totalPrice: airPricingInfo.$?.TotalPrice,
          basePrice: airPricingInfo.$?.BasePrice,
          taxes: airPricingInfo.$?.Taxes,
          refundable: airPricingInfo.$?.Refundable === "true",
          exchangeable: airPricingInfo.$?.Exchangeable === "true",
          eticketability: airPricingInfo.$?.ETicketability,
        } : null,
        taxes: Array.isArray(taxInfos) ? taxInfos.map(tax => ({
          category: tax.$?.Category,
          amount: tax.$?.Amount,
        })) : [],
        fareBasis: fareInfo.$?.FareBasis,
        fareCalc: airReservation["air:FareCalc"],
        brand: brand.$ ? {
          id: brand.$?.BrandID,
          name: brand.$?.Name,
          description: brandTexts.find(t => t.$?.Type === "ATPCO")?._,
        } : null,
        baggage,
        meal,
        seatAssignment,
        penalties: {
          change: changePenalty?.["air:Amount"],
          cancel: cancelPenalty?.["air:Amount"],
        },
      };
    } catch (err) {
      console.error("Error parsing flight info:", err);
      return null;
    }
  };

  // Parse general remarks
  const parseGeneralRemarks = (remarks) => {
    if (!remarks) return [];
    
    try {
      // Handle both single remark and array of remarks
      const remarksArray = Array.isArray(remarks) ? remarks : [remarks];
      
      return remarksArray.map(remark => ({
        category: remark.$?.Category,
        supplierCode: remark.$?.SupplierCode,
        data: remark["common_v52_0:RemarkData"],
      })).filter(r => r.data); // Filter out empty remarks
    } catch (err) {
      console.error("Error parsing remarks:", err);
      return [];
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!pnrCode.trim()) {
      setError("Please enter a PNR/Locator code");
      return;
    }

    setLoading(true);
    setError(null);
    setBookingData(null);

    // Log what we're sending
    console.log("=================================");
    console.log("🔵 SENDING REQUEST:");
    console.log("PNR Code:", pnrCode.trim());
    console.log("Request Body:", JSON.stringify({ locatorCode: pnrCode.trim() }, null, 2));
    console.log("=================================");

    try {
      // API call to retrieve booking
      const response = await fetch(`https://api.bobros.org/flights/universal-record/retrieve`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ locatorCode: pnrCode.trim() }),
      });

      // Log response status and headers
      console.log("🟡 RESPONSE RECEIVED:");
      console.log("Status:", response.status, response.statusText);

      // Get the raw response text
      const responseText = await response.text();
      
      // Log raw response
      console.log("Raw Response Text (first 500 chars):", responseText.substring(0, 500));
      
      if (!responseText) {
        throw new Error("Empty response from server");
      }

      // Try to parse as JSON (assuming the API returns JSON wrapper with SOAP inside)
      let data;
      try {
        data = JSON.parse(responseText);
        console.log("✅ PARSED JSON WRAPPER:", data);
      } catch (parseError) {
        console.error("❌ JSON PARSE ERROR:", parseError);
        console.log("First 200 chars of response:", responseText.substring(0, 200));
        throw new Error("Server returned invalid JSON. Check console for details.");
      }

      if (!response.ok) {
        console.error("❌ SERVER ERROR RESPONSE:", {
          status: response.status,
          statusText: response.statusText,
          data: data
        });
        throw new Error(data.message || `Server error: ${response.status}`);
      }

      // Check if we have the SOAP response in the data
      if (data.success && data.data) {
        console.log("✅ SOAP DATA RECEIVED:", data.data);
        
        // Parse the SOAP response
        const parsedBookingData = parseSOAPResponse(data.data);
        
        if (parsedBookingData) {
          console.log("✅ PARSED BOOKING DATA:", parsedBookingData);
          setBookingData(parsedBookingData);
        } else {
          setError("Failed to parse booking data from response");
        }
      } else {
        console.warn("⚠️ NO BOOKING FOUND:", data.message || "No data in response");
        setError(data.message || "No booking found with this PNR code");
      }
    } catch (err) {
      console.error("❌ FETCH ERROR:", err);
      setError(err.message || "An error occurred while retrieving booking");
    } finally {
      setLoading(false);
      console.log("=================================");
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      const date = new Date(dateString);
      return date.toLocaleString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch (err) {
      console.warn("Date formatting error:", err);
      return dateString;
    }
  };

  const formatCurrency = (amount) => {
    if (!amount) return "N/A";
    // Extract numeric value and currency
    const match = amount.match(/([A-Z]+)(\d+)/);
    if (match) {
      const [_, currency, value] = match;
      return `${currency} ${parseInt(value).toLocaleString("en-IN")}`;
    }
    return amount;
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 pt-24 md:pt-28">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            PNR Status Enquiry
          </h1>
          <p className="text-lg text-gray-600">
            Enter your 6-character PNR/Locator code to view your booking details
          </p>
        </div>

        {/* Search Form */}
        <div className="max-w-2xl mx-auto mb-12">
          <form onSubmit={handleSubmit} className="flex gap-3">
            <div className="flex-1">
              <input
                type="text"
                value={pnrCode}
                onChange={(e) => {
                  const value = e.target.value.toUpperCase();
                  setPnrCode(value);
                }}
                placeholder="Enter PNR Code (e.g., 345O0Z)"
                className="w-full px-5 py-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FD561E] focus:border-transparent text-gray-800 text-lg uppercase"
                disabled={loading}
                maxLength={6}
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="px-8 py-4 bg-gradient-to-r from-[#FD561E] to-[#ff7b4a] text-white rounded-lg font-semibold hover:from-[#e54d1a] hover:to-[#ff6a3c] transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>Searching...</span>
                </>
              ) : (
                <>
                  <FaSearch />
                  <span>Search PNR</span>
                </>
              )}
            </button>
          </form>
          {error && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600 font-medium">Error: {error}</p>
              <p className="text-xs text-gray-500 mt-2">Check browser console for details (F12)</p>
            </div>
          )}
        </div>

        {/* Booking Details - Only show if we have data */}
        {bookingData && (
          <div className="space-y-6 animate-fadeIn">
            {/* PNR/Universal Record Info */}
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-gray-800">
                  PNR Details
                </h2>
                <div className="bg-[#FD561E] text-white px-4 py-2 rounded-lg">
                  <span className="font-mono font-bold">{bookingData.locatorCode || pnrCode}</span>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-500">PNR Status</p>
                  <p className="font-semibold text-gray-800">{bookingData.universalRecord?.status || "Confirmed"}</p>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-500">Version</p>
                  <p className="font-semibold text-gray-800">{bookingData.universalRecord?.version || "1"}</p>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-500">Booked On</p>
                  <p className="font-semibold text-gray-800">
                    {bookingData.universalRecord?.createDate ? formatDate(bookingData.universalRecord.createDate) : "N/A"}
                  </p>
                </div>
              </div>
            </div>

            {/* Passenger Information */}
            {bookingData.passenger && (
              <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
                <div className="flex items-center gap-2 mb-6">
                  <FaUser className="text-[#FD561E] text-xl" />
                  <h2 className="text-xl font-bold text-gray-800">Passenger Information</h2>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Personal Details */}
                  <div className="space-y-4">
                    <div className="border-b border-gray-200 pb-2">
                      <h3 className="font-semibold text-gray-700 mb-3">Personal Details</h3>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <p className="text-xs text-gray-500">Name</p>
                          <p className="font-medium">
                            {bookingData.passenger.name?.prefix} {bookingData.passenger.name?.first} {bookingData.passenger.name?.last}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Traveler Type</p>
                          <p className="font-medium">{bookingData.passenger.type || "ADT"}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Date of Birth</p>
                          <p className="font-medium">{bookingData.passenger.dob || "N/A"}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Gender</p>
                          <p className="font-medium">{bookingData.passenger.gender || "N/A"}</p>
                        </div>
                      </div>
                    </div>

                    {/* Contact Information */}
                    {(bookingData.passenger.email || bookingData.passenger.phone) && (
                      <div className="border-b border-gray-200 pb-2">
                        <h3 className="font-semibold text-gray-700 mb-3">Contact Information</h3>
                        {bookingData.passenger.email && (
                          <div className="flex items-center gap-2 mb-2">
                            <FaEnvelope className="text-gray-400 text-sm" />
                            <p className="text-sm">{bookingData.passenger.email}</p>
                          </div>
                        )}
                        {bookingData.passenger.phone?.number && (
                          <div className="flex items-center gap-2 mb-2">
                            <FaPhone className="text-gray-400 text-sm" />
                            <p className="text-sm">
                              +{bookingData.passenger.phone?.countryCode || ""} {bookingData.passenger.phone?.areaCode || ""} {bookingData.passenger.phone?.number}
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Address & Document */}
                  {(bookingData.passenger.address || bookingData.passenger.document) && (
                    <div className="space-y-4">
                      {bookingData.passenger.address && (
                        <div className="border-b border-gray-200 pb-2">
                          <h3 className="font-semibold text-gray-700 mb-3">Address</h3>
                          <div className="flex items-start gap-2">
                            <FaMapMarkerAlt className="text-gray-400 mt-1" />
                            <div>
                              <p className="text-sm">{bookingData.passenger.address.street}</p>
                              <p className="text-sm">
                                {bookingData.passenger.address.city}, {bookingData.passenger.address.state} {bookingData.passenger.address.postalCode}
                              </p>
                              <p className="text-sm">{bookingData.passenger.address.country}</p>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Document Info */}
                      {bookingData.passenger.document && (
                        <div>
                          <h3 className="font-semibold text-gray-700 mb-2">Document Information</h3>
                          <p className="text-sm text-gray-600">
                            {bookingData.passenger.document.type}: {bookingData.passenger.document.number} ({bookingData.passenger.document.country})
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Flight Information */}
            {bookingData.flight && (
              <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
                <div className="flex items-center gap-2 mb-6">
                  <FaPlane className="text-[#FD561E] text-xl" />
                  <h2 className="text-xl font-bold text-gray-800">Flight Information</h2>
                </div>

                {/* Flight Route */}
                <div className="bg-gradient-to-r from-orange-50 to-yellow-50 rounded-xl p-6 mb-6">
                  <div className="flex flex-col md:flex-row items-center justify-between">
                    <div className="text-center md:text-left mb-4 md:mb-0">
                      <p className="text-sm text-gray-500">From</p>
                      <div className="flex items-center gap-2">
                        <MdFlightTakeoff className="text-[#FD561E] text-2xl" />
                        <div>
                          <p className="text-3xl font-bold text-gray-800">{bookingData.flight.segment?.origin || "N/A"}</p>
                          <p className="text-sm text-gray-600">Departure</p>
                          <p className="text-xs text-gray-500">{formatDate(bookingData.flight.segment?.departureTime)}</p>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col items-center px-4">
                      <div className="w-32 h-0.5 bg-gray-300 relative">
                        <div className="absolute -top-1.5 -right-1.5 w-3 h-3 bg-[#FD561E] rounded-full"></div>
                        <div className="absolute -top-1.5 -left-1.5 w-3 h-3 bg-[#FD561E] rounded-full"></div>
                      </div>
                      <p className="text-xs text-gray-500 mt-2">
                        {bookingData.flight.segment?.travelTime || "N/A"} mins
                      </p>
                    </div>

                    <div className="text-center md:text-right">
                      <p className="text-sm text-gray-500">To</p>
                      <div className="flex items-center gap-2">
                        <div>
                          <p className="text-3xl font-bold text-gray-800">{bookingData.flight.segment?.destination || "N/A"}</p>
                          <p className="text-sm text-gray-600">Arrival</p>
                          <p className="text-xs text-gray-500">{formatDate(bookingData.flight.segment?.arrivalTime)}</p>
                        </div>
                        <MdFlightLand className="text-[#FD561E] text-2xl" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Flight Details Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-xs text-gray-500">Airline</p>
                    <p className="font-semibold">{bookingData.flight.segment?.carrier || "N/A"} {bookingData.flight.segment?.flightNumber ? `- ${bookingData.flight.segment.flightNumber}` : ""}</p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-xs text-gray-500">Cabin Class</p>
                    <p className="font-semibold">{bookingData.flight.segment?.cabinClass || "Economy"}</p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-xs text-gray-500">Class of Service</p>
                    <p className="font-semibold">{bookingData.flight.segment?.classOfService || "N/A"}</p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-xs text-gray-500">Status</p>
                    <p className={`font-semibold ${bookingData.flight.segment?.status === 'HK' ? 'text-green-600' : 'text-orange-600'}`}>
                      {bookingData.flight.segment?.status || "Confirmed"}
                    </p>
                  </div>
                </div>

                {/* Additional Flight Info */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  {bookingData.flight.segment?.terminal && (
                    <div className="flex items-center gap-2">
                      <FaTag className="text-gray-400" />
                      <div>
                        <p className="text-xs text-gray-500">Terminal</p>
                        <p className="font-medium">{bookingData.flight.segment.terminal}</p>
                      </div>
                    </div>
                  )}
                  {bookingData.flight.segment?.equipment && (
                    <div className="flex items-center gap-2">
                      <FaPlane className="text-gray-400" />
                      <div>
                        <p className="text-xs text-gray-500">Aircraft</p>
                        <p className="font-medium">{bookingData.flight.segment.equipment}</p>
                      </div>
                    </div>
                  )}
                  {bookingData.flight.segment?.sellMessage && (
                    <div className="flex items-center gap-2">
                      <FaMapMarkerAlt className="text-gray-400" />
                      <div>
                        <p className="text-xs text-gray-500">Info</p>
                        <p className="font-medium">{bookingData.flight.segment.sellMessage}</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Brand & Services */}
                {bookingData.flight.brand && (
                  <div className="border-t border-gray-200 pt-6">
                    <h3 className="font-semibold text-gray-700 mb-4">Brand & Services</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      <div className="p-3 bg-orange-50 rounded-lg">
                        <p className="text-xs text-gray-500">Brand</p>
                        <p className="font-semibold text-[#FD561E]">{bookingData.flight.brand.name || "Economy"}</p>
                        <p className="text-xs text-gray-600 mt-1">{bookingData.flight.brand.description}</p>
                      </div>
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-2">
                          <FaSuitcase className="text-gray-500" />
                          <div>
                            <p className="text-xs text-gray-500">Baggage</p>
                            <p className="font-semibold">{bookingData.flight.baggage}</p>
                          </div>
                        </div>
                      </div>
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-2">
                          <FaUtensils className="text-gray-500" />
                          <div>
                            <p className="text-xs text-gray-500">Meal</p>
                            <p className="font-semibold">{bookingData.flight.meal}</p>
                          </div>
                        </div>
                      </div>
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-2">
                          <FaChair className="text-gray-500" />
                          <div>
                            <p className="text-xs text-gray-500">Seat</p>
                            <p className="font-semibold">{bookingData.flight.seatAssignment}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Pricing Information */}
            {bookingData.flight?.pricing && (
              <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
                <div className="flex items-center gap-2 mb-6">
                  <FaRupeeSign className="text-[#FD561E] text-xl" />
                  <h2 className="text-xl font-bold text-gray-800">Fare Information</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-xs text-gray-500">Base Fare</p>
                    <p className="text-xl font-bold text-gray-800">
                      {formatCurrency(bookingData.flight.pricing.basePrice)}
                    </p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-xs text-gray-500">Taxes & Fees</p>
                    <p className="text-xl font-bold text-gray-800">
                      {formatCurrency(bookingData.flight.pricing.taxes)}
                    </p>
                  </div>
                  <div className="p-4 bg-[#FD561E] bg-opacity-10 rounded-lg">
                    <p className="text-xs text-gray-500">Total Fare</p>
                    <p className="text-2xl font-bold text-[#FD561E]">
                      {formatCurrency(bookingData.flight.pricing.totalPrice)}
                    </p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-xs text-gray-500">Fare Basis</p>
                    <p className="font-mono text-sm">{bookingData.flight.fareBasis || "N/A"}</p>
                  </div>
                </div>

                {/* Tax Breakdown */}
                {bookingData.flight.taxes && bookingData.flight.taxes.length > 0 && (
                  <div className="border-t border-gray-200 pt-4">
                    <h3 className="font-semibold text-gray-700 mb-3">Tax Breakdown</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {bookingData.flight.taxes.map((tax, index) => (
                        <div key={index} className="p-2 bg-gray-50 rounded">
                          <p className="text-xs text-gray-500">{tax.category}</p>
                          <p className="font-semibold">{formatCurrency(tax.amount)}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Fare Rules */}
                <div className="border-t border-gray-200 pt-4 mt-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <p className="text-xs text-gray-500">Refundable</p>
                      <p className={`font-semibold ${bookingData.flight.pricing.refundable ? 'text-green-600' : 'text-red-600'}`}>
                        {bookingData.flight.pricing.refundable ? 'Yes' : 'No'}
                      </p>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <p className="text-xs text-gray-500">Exchangeable</p>
                      <p className={`font-semibold ${bookingData.flight.pricing.exchangeable ? 'text-green-600' : 'text-red-600'}`}>
                        {bookingData.flight.pricing.exchangeable ? 'Yes' : 'No'}
                      </p>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <p className="text-xs text-gray-500">E-Ticket</p>
                      <p className="font-semibold">{bookingData.flight.pricing.eticketability || "Yes"}</p>
                    </div>
                  </div>

                  {/* Penalties */}
                  {(bookingData.flight.penalties?.change || bookingData.flight.penalties?.cancel) && (
                    <div className="mt-4 p-4 bg-yellow-50 rounded-lg">
                      <p className="text-sm font-semibold text-gray-700 mb-2">Penalty Charges</p>
                      <div className="grid grid-cols-2 gap-4">
                        {bookingData.flight.penalties.change && (
                          <div>
                            <p className="text-xs text-gray-500">Change Penalty</p>
                            <p className="font-semibold text-orange-600">{bookingData.flight.penalties.change}</p>
                          </div>
                        )}
                        {bookingData.flight.penalties.cancel && (
                          <div>
                            <p className="text-xs text-gray-500">Cancellation Penalty</p>
                            <p className="font-semibold text-red-600">{bookingData.flight.penalties.cancel}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* General Remarks */}
            {bookingData.remarks && bookingData.remarks.length > 0 && (
              <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
                <h2 className="text-xl font-bold text-gray-800 mb-4">Additional Information</h2>
                <div className="space-y-3">
                  {bookingData.remarks.map((remark, index) => (
                    <div key={index} className="p-3 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-700">{remark.data}</p>
                      <p className="text-xs text-gray-500 mt-1">Supplier: {remark.supplierCode}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Add animation styles */}
      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.5s ease-out;
        }
      `}</style>
    </div>
  );
};

export default PNRSearch;