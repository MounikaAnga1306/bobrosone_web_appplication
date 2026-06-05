import { useState } from "react";
import axios from "axios";
import { Turnstile } from "@marsidev/react-turnstile";

const PrintFlightTicketModal = ({ onClose }) => {
  const [pnr, setPnr] = useState("");
  const [lastName, setLastName] = useState("");
  const [captchaInput, setCaptchaInput] = useState("");
  const [captchaValue] = useState(() => {
    const a = Math.floor(Math.random() * 9) + 1;
    const b = Math.floor(Math.random() * 9) + 1;
    return { question: `${a} + ${b}`, answer: String(a + b) };
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [responseData, setResponseData] = useState(null);
  const [showResponseModal, setShowResponseModal] = useState(false);
  const [ticketData, setTicketData] = useState(null);
  const [showTicket, setShowTicket] = useState(false);

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      alert("Response copied to clipboard!");
    } catch (err) {
      console.error("Failed to copy:", err);
      alert("Failed to copy response. Please manually select and copy.");
    }
  };

  const handlePrint = async (e) => {
    e.preventDefault();
    setError("");
    setResponseData(null);
    setTicketData(null);
    setShowTicket(false);

    if (!pnr.trim()) { setError("Please enter Airline PNR."); return; }
    if (!lastName.trim()) { setError("Please enter Last Name."); return; }
    if (captchaInput.trim() !== captchaValue.answer) {
      setError("Incorrect captcha. Please try again.");
      return;
    }

    // Prepare request body
    const requestBody = {
      pnr: pnr.trim().toUpperCase(),
      lastName: lastName.trim().toUpperCase()
    };

    // Log the request being sent
    console.log("=== API REQUEST ===");
    console.log("Endpoint: POST https://api.bobros.org/flights/retrieve-document/print-ticket");
    console.log("Request Body:", JSON.stringify(requestBody, null, 2));
    console.log("===================");

    try {
      setLoading(true);

      const response = await axios.post(
        "https://api.bobros.org/flights/retrieve-document/print-ticket",
        requestBody,
        {
          headers: {
            "Content-Type": "application/json"
          }
        }
      );

      const apiData = response.data;

      // Log the response received
      console.log("=== API RESPONSE ===");
      console.log("Status:", response.status);
      console.log("Response Data:", JSON.stringify(apiData, null, 2));
      console.log("===================");

      setResponseData(apiData);

      if (!apiData || !apiData.success) {
        setError(apiData?.message || "No data returned. Please check your PNR and Last Name.");
        return;
      }

      // Parse and store ticket data from the actual response structure
      const parsedData = parseTicketData(apiData);
      setTicketData(parsedData);
      setShowTicket(true);

    } catch (err) {
      console.error("=== API ERROR ===");
      console.error("Error:", err.response?.data || err.message);
      console.error("=================");
      
      setResponseData({
        error: true,
        status: err.response?.status,
        message: err.response?.data || err.message
      });
      
      if (err.response?.status === 404) {
        setError("Ticket not found. Please check your PNR and Last Name.");
      } else if (err.response?.status === 401 || err.response?.status === 403) {
        setError("Authentication failed. Please contact support.");
      } else if (err.code === "ERR_NETWORK") {
        setError("Network error. Please check your connection and try again.");
      } else {
        const msg = err.response?.data?.message || err.response?.data?.error || err.message;
        setError(`Error: ${msg}`);
      }
    } finally {
      setLoading(false);
    }
  };

  // Function to parse ticket data from the actual API response
  const parseTicketData = (apiData) => {
    const result = apiData?.results?.[0];
    const eTicket = result?.data?.eTickets?.[0];
    const traveler = eTicket?.BookingTraveler || {};
    const travelerName = traveler.BookingTravelerName || {};
    const coupon = eTicket?.Ticket?.Coupon || {};
    const pricingInfo = eTicket?.AirPricingInfo || {};
    const fareInfo = pricingInfo?.FareInfo || {};
    const baggageInfo = eTicket?.BaggageAllowances?.BaggageAllowanceInfo || {};
    const carryOnInfo = eTicket?.BaggageAllowances?.CarryOnAllowanceInfo || {};
    const taxInfoList = pricingInfo?.TaxInfo || [];
    const supplierLocator = eTicket?.SupplierLocator || {};

    const formatAmount = (str) => {
      if (!str) return "—";
      return str.replace("INR", "₹");
    };
    
    const formatDate = (dt) => {
      if (!dt) return "—";
      try {
        return new Date(dt).toLocaleDateString("en-IN", {
          day: "2-digit", month: "short", year: "numeric"
        });
      } catch { return dt; }
    };
    
    const formatTime = (dt) => {
      if (!dt) return "—";
      try {
        return new Date(dt).toLocaleTimeString("en-IN", {
          hour: "2-digit", minute: "2-digit", hour12: false
        });
      } catch { return dt; }
    };

    const passengerName = `${travelerName.Prefix || ""} ${travelerName.First || ""} ${travelerName.Last || ""}`.trim() || result?.name || "—";
    const passengerType = traveler.TravelerType || "ADT";
    const gender = traveler.Gender === "F" ? "Female" : traveler.Gender === "M" ? "Male" : (traveler.Gender || "—");

    const airlinePNR = supplierLocator.SupplierLocatorCode || eTicket?.ProviderLocatorCode || pnr;
    const rPNR = result?.data?.universalRecordLocator || apiData?.pnr || pnr;
    const ticketNum = eTicket?.Ticket?.TicketNumber || result?.ticketNumber || "—";
    const issuedDate = formatDate(eTicket?.IssuedDate);
    const platingCarrier = eTicket?.PlatingCarrier || coupon.MarketingCarrier || "—";
    const status = coupon.Status === "O" ? "CONFIRMED" : (coupon.Status === "A" ? "ACTIVE" : "CONFIRMED");

    const origin = coupon.Origin || fareInfo.Origin || "—";
    const destination = coupon.Destination || fareInfo.Destination || "—";
    const departureTime = formatTime(coupon.DepartureTime);
    const departureDate = formatDate(coupon.DepartureTime);
    const flightNo = coupon.MarketingCarrier && coupon.MarketingFlightNumber
      ? `${coupon.MarketingCarrier} ${coupon.MarketingFlightNumber}` : "—";
    const cabinClass = pricingInfo?.BookingInfo?.CabinClass || "Economy";
    const bookingClass = coupon.BookingClass || pricingInfo?.BookingInfo?.BookingCode || "—";
    const fareBasis = coupon.FareBasis || fareInfo.FareBasis || "—";

    const totalPrice = formatAmount(eTicket?.TotalPrice);
    const basePrice = formatAmount(eTicket?.BasePrice);
    const taxes = formatAmount(eTicket?.Taxes);
    const changePenalty = formatAmount(pricingInfo?.ChangePenalty?.Amount?.toString());
    const cancelPenalty = formatAmount(pricingInfo?.CancelPenalty?.Amount?.toString());
    const refundable = eTicket?.Refundable ? "Yes" : "No";

    const checkedBaggage = baggageInfo?.TextInfo?.Text?.[0] || 
      (fareInfo?.BaggageAllowance?.MaxWeight 
        ? `${fareInfo.BaggageAllowance.MaxWeight.Value} ${fareInfo.BaggageAllowance.MaxWeight.Unit === "Kilograms" ? "KG" : ""}`
        : "15 KG");
    const carryOn = carryOnInfo?.TextInfo?.Text || "7 KG";

    const fareCalc = eTicket?.FareCalc || pricingInfo?.FareCalc || "—";

    return {
      airlinePNR,
      rPNR,
      ticketNum,
      issuedDate,
      platingCarrier,
      status,
      passengerName,
      passengerType,
      gender,
      origin,
      destination,
      departureTime,
      departureDate,
      flightNo,
      cabinClass,
      bookingClass,
      fareBasis,
      totalPrice,
      basePrice,
      taxes,
      changePenalty,
      cancelPenalty,
      refundable,
      checkedBaggage,
      carryOn,
      taxInfoList,
      fareCalc,
      travelerAge: traveler.Age,
      travelerDOB: traveler.DOB,
      statusColor: status === "CANCELLED" ? "#dc2626" : "#16a34a"
    };
  };

  // Function to open full page ticket view
  const openFullPageTicket = () => {
    if (!ticketData) return;
    
    const printContent = generateFullPageTicketHTML(ticketData);
    const win = window.open("", "_blank");
    win.document.write(printContent);
    win.document.close();
  };

  const generateFullPageTicketHTML = (data) => {
    const logoUrl = `${window.location.origin}/assets/Bobros_logo.png`;
    const printTimestamp = new Date().toLocaleString("en-IN", {
      day: "2-digit", month: "2-digit", year: "numeric",
      hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false
    }).replace(",", "");

    const taxRows = Array.isArray(data.taxInfoList) && data.taxInfoList.length > 0 ? 
      data.taxInfoList.map(t => `
        <tr>
          <td style="padding:6px 8px;">${t.Category || "—"}</td>
          <td style="text-align:right;padding:6px 8px;">${t.Amount?.replace("INR", "₹") || "—"}</td>
        </tr>
      `).join("") : 
      '<tr><td colspan="2" style="padding:6px 8px; text-align:center;">No tax details available</td></tr>';

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Flight Ticket - ${data.airlinePNR}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { 
      font-family: 'Segoe UI', Arial, sans-serif; 
      background: #f0f2f5; 
      padding: 20px; 
      color: #1a1a2e; 
      font-size: 13px; 
    }
    .page { 
      background: white; 
      max-width: 800px; 
      margin: 0 auto; 
      border-radius: 16px; 
      box-shadow: 0 10px 40px rgba(0,0,0,0.1); 
      overflow: hidden; 
    }
    .header { 
      background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); 
      padding: 20px 24px; 
      display: flex; 
      justify-content: space-between; 
      align-items: center; 
      flex-wrap: wrap; 
      gap: 16px; 
    }
    .logo-img { 
      height: 40px; 
      width: auto; 
      object-fit: contain; 
      filter: brightness(0) invert(1); 
    }
    .company-info { 
      text-align: right; 
      color: rgba(255,255,255,0.8); 
      font-size: 11px; 
      line-height: 1.5; 
    }
    .company-info strong { 
      color: white; 
      font-size: 12px; 
    }
    .pnr-section { 
      background: #fff8f0; 
      padding: 16px 24px; 
      border-bottom: 1px solid #ffe0b3; 
      display: flex; 
      justify-content: space-between; 
      align-items: center; 
      flex-wrap: wrap; 
      gap: 16px; 
    }
    .pnr-box { 
      display: flex; 
      gap: 32px; 
      flex-wrap: wrap; 
    }
    .pnr-item .label { 
      font-size: 10px; 
      color: #b8860b; 
      text-transform: uppercase; 
      letter-spacing: 0.5px; 
      font-weight: 600; 
    }
    .pnr-item .value { 
      font-size: 18px; 
      font-weight: 800; 
      color: #1a1a2e; 
      margin-top: 4px; 
    }
    .pnr-item .value.orange { 
      color: #fd561e; 
    }
    .ticket-info { 
      text-align: right; 
      font-size: 11px; 
      color: #666; 
    }
    .ticket-info strong { 
      color: #1a1a2e; 
    }
    .status-bar { 
      background: #f8f9fa; 
      padding: 12px 24px; 
      display: flex; 
      justify-content: space-between; 
      align-items: center; 
      flex-wrap: wrap; 
      gap: 12px; 
      border-bottom: 1px solid #e9ecef; 
    }
    .status-badge { 
      display: inline-flex; 
      align-items: center; 
      gap: 6px; 
      padding: 4px 12px; 
      border-radius: 20px; 
      font-weight: 700; 
      font-size: 11px; 
      background: ${data.statusColor}15; 
      color: ${data.statusColor}; 
    }
    .flight-info-tag { 
      font-size: 11px; 
      color: #6c757d; 
    }
    .flight-info-tag strong { 
      color: #1a1a2e; 
    }
    .journey-card { 
      margin: 20px 24px; 
      background: linear-gradient(135deg, #f8f9ff 0%, #f0f2ff 100%); 
      border-radius: 20px; 
      padding: 24px; 
    }
    .flight-header { 
      display: flex; 
      justify-content: space-between; 
      align-items: center; 
      margin-bottom: 24px; 
      padding-bottom: 16px; 
      border-bottom: 2px dashed #cbd5e1; 
    }
    .flight-number { 
      font-size: 14px; 
      font-weight: 700; 
      color: #fd561e; 
      background: white; 
      padding: 6px 14px; 
      border-radius: 20px; 
    }
    .journey-points { 
      display: flex; 
      align-items: center; 
      justify-content: space-between; 
      gap: 20px; 
    }
    .point { 
      flex: 1; 
    }
    .point.right { 
      text-align: right; 
    }
    .time { 
      font-size: 28px; 
      font-weight: 900; 
      color: #1a1a2e; 
      line-height: 1.2; 
    }
    .date { 
      font-size: 12px; 
      color: #64748b; 
      margin-top: 6px; 
    }
    .airport-code { 
      font-size: 14px; 
      font-weight: 700; 
      color: #fd561e; 
      margin-top: 6px; 
    }
    .journey-line { 
      display: flex; 
      flex-direction: column; 
      align-items: center; 
      padding: 0 20px; 
    }
    .flight-icon { 
      font-size: 32px; 
      color: #fd561e; 
    }
    .section { 
      padding: 16px 24px; 
      border-bottom: 1px solid #e9ecef; 
    }
    .section-title { 
      font-size: 12px; 
      font-weight: 800; 
      color: #1a1a2e; 
      text-transform: uppercase; 
      letter-spacing: 1px; 
      margin-bottom: 16px; 
      display: flex; 
      align-items: center; 
      gap: 8px; 
    }
    .section-title::before { 
      content: ""; 
      width: 4px; 
      height: 18px; 
      background: #fd561e; 
      border-radius: 2px; 
    }
    .info-grid { 
      display: grid; 
      grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); 
      gap: 14px; 
    }
    .info-item .label { 
      font-size: 10px; 
      color: #94a3b8; 
      text-transform: uppercase; 
      letter-spacing: 0.5px; 
      font-weight: 600; 
    }
    .info-item .value { 
      font-size: 14px; 
      font-weight: 700; 
      color: #1a1a2e; 
      margin-top: 4px; 
    }
    .info-item .value.orange { 
      color: #fd561e; 
    }
    .passenger-table { 
      width: 100%; 
      border-collapse: collapse; 
    }
    .passenger-table th { 
      text-align: left; 
      padding: 12px 8px; 
      background: #f8f9fa; 
      font-size: 11px; 
      font-weight: 700; 
      color: #64748b; 
      text-transform: uppercase; 
      border-bottom: 2px solid #e9ecef; 
    }
    .passenger-table td { 
      padding: 12px 8px; 
      font-size: 13px; 
      font-weight: 600; 
      color: #1a1a2e; 
      border-bottom: 1px solid #e9ecef; 
    }
    .passenger-table td.orange { 
      color: #fd561e; 
    }
    .baggage-grid { 
      display: grid; 
      grid-template-columns: 1fr 1fr; 
      gap: 16px; 
    }
    .baggage-card { 
      background: #f8f9fa; 
      border-radius: 12px; 
      padding: 14px 16px; 
    }
    .baggage-card .label { 
      font-size: 11px; 
      color: #64748b; 
      margin-bottom: 6px; 
    }
    .baggage-card .value { 
      font-size: 20px; 
      font-weight: 800; 
      color: #1a1a2e; 
    }
    .fare-table { 
      width: 100%; 
      border-collapse: collapse; 
    }
    .fare-table th, .fare-table td { 
      padding: 10px 12px; 
      text-align: left; 
      border-bottom: 1px solid #e9ecef; 
    }
    .fare-table th { 
      background: #f8f9fa; 
      font-size: 11px; 
      font-weight: 700; 
      color: #64748b; 
      text-transform: uppercase; 
    }
    .fare-table td { 
      font-size: 14px; 
      font-weight: 600; 
    }
    .fare-table .total-row td { 
      color: #fd561e; 
      font-size: 16px; 
      font-weight: 800; 
      background: #fff8f0; 
    }
    .tax-table { 
      width: 100%; 
      margin-top: 12px; 
      border-collapse: collapse; 
    }
    .tax-table td { 
      padding: 6px 8px; 
      font-size: 11px; 
      color: #64748b; 
      border-bottom: 1px solid #f0f0f0; 
    }
    .policy-grid { 
      display: grid; 
      grid-template-columns: 1fr 1fr; 
      gap: 16px; 
    }
    .policy-card { 
      background: #f8f9fa; 
      border-radius: 12px; 
      padding: 14px 16px; 
      text-align: center; 
    }
    .policy-card.change { 
      background: #fff8f0; 
    }
    .policy-card.cancel { 
      background: #fff5f5; 
    }
    .policy-card .label { 
      font-size: 11px; 
      color: #64748b; 
      font-weight: 600; 
      margin-bottom: 8px; 
    }
    .policy-card .amount { 
      font-size: 18px; 
      font-weight: 800; 
      color: #fd561e; 
    }
    .policy-card.cancel .amount { 
      color: #dc2626; 
    }
    .fare-calc { 
      background: #f8f9fa; 
      padding: 12px 16px; 
      border-radius: 8px; 
      font-family: monospace; 
      font-size: 11px; 
      word-break: break-all; 
    }
    .terms { 
      background: #f8f9fa; 
      padding: 20px 24px; 
      margin-top: 8px; 
    }
    .terms h3 { 
      font-size: 12px; 
      color: #1a1a2e; 
      margin-bottom: 12px; 
    }
    .terms ul { 
      padding-left: 20px; 
    }
    .terms li { 
      font-size: 11px; 
      color: #64748b; 
      margin-bottom: 6px; 
      line-height: 1.5; 
    }
    .footer { 
      background: #1a1a2e; 
      color: rgba(255,255,255,0.6); 
      padding: 12px 24px; 
      text-align: center; 
      font-size: 10px; 
    }
    .action-buttons { 
      display: flex; 
      gap: 12px; 
      max-width: 800px; 
      margin: 20px auto 0; 
    }
    .print-btn, .close-btn { 
      flex: 1; 
      border: none; 
      border-radius: 12px; 
      padding: 14px 20px; 
      font-size: 14px; 
      font-weight: 700; 
      cursor: pointer; 
      text-align: center; 
      transition: transform 0.2s; 
    }
    .print-btn { 
      background: linear-gradient(135deg, #fd561e, #ff8c42); 
      color: white; 
    }
    .close-btn { 
      background: #6c757d; 
      color: white; 
    }
    .print-btn:hover, .close-btn:hover { 
      transform: translateY(-2px); 
    }
    @media print {
      body { background: white; padding: 0; }
      .page { box-shadow: none; border-radius: 0; }
      .action-buttons { display: none; }
    }
    @media (max-width: 600px) {
      .journey-points { flex-direction: column; text-align: center; }
      .point.right { text-align: center; }
      .baggage-grid, .policy-grid { grid-template-columns: 1fr; }
    }
  </style>
</head>
<body>
<div class="page" id="ticketPage">
  <div class="header">
    <div class="company-info">
      <strong>BOBROS Consultancy Services Pvt. Ltd.</strong><br/>
      ✉ customersupport@bobrosone.com | 📞 91-9133 133 456
    </div>
  </div>
  
  <div class="pnr-section">
    <div class="pnr-box">
      <div class="pnr-item">
        <div class="label">Airline PNR</div>
        <div class="value orange">${data.airlinePNR}</div>
      </div>
      <div class="pnr-item">
        <div class="label">Booking Reference</div>
        <div class="value">${data.rPNR}</div>
      </div>
    </div>
    <div class="ticket-info">
      <strong>Ticket No:</strong> ${data.ticketNum}<br/>
      <strong>Issued:</strong> ${data.issuedDate}
    </div>
  </div>
  
  <div class="status-bar">
    <div class="flight-info-tag">
      ✈ <strong>${data.platingCarrier}</strong> • ${data.cabinClass} • Fare Basis: ${data.fareBasis}
    </div>
    <div>
      <span class="status-badge">✓ ${data.status}</span>
      <span style="margin-left: 12px; font-size: 11px;">🔄 Refundable: ${data.refundable}</span>
    </div>
  </div>
  
  <div class="journey-card">
    <div class="flight-header">
      <span class="flight-number">✈ ${data.flightNo}</span>
    </div>
    <div class="journey-points">
      <div class="point">
        <div class="time">${data.departureTime}</div>
        <div class="date">${data.departureDate}</div>
        <div class="airport-code">${data.origin}</div>
      </div>
      <div class="journey-line">
        <div class="flight-icon">✈</div>
      </div>
      <div class="point right">
        <div class="time">—</div>
        <div class="date">—</div>
        <div class="airport-code">${data.destination}</div>
      </div>
    </div>
  </div>
  
  <div class="section">
    <div class="section-title">Passenger Details</div>
    <table class="passenger-table">
      <thead>
        <tr>
          <th>Passenger Name</th>
          <th>Type</th>
          <th>Gender</th>
          <th>Age</th>
          <th>Ticket Number</th>
          <th>Status</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td style="font-size:14px; font-weight:700;">${data.passengerName}</td>
          <td>${data.passengerType === "ADT" ? "Adult" : data.passengerType}</td>
          <td>${data.gender}</td>
          <td>${data.travelerAge || "—"}</td>
          <td class="orange">${data.ticketNum}</td>
          <td style="color:${data.statusColor}; font-weight:700;">${data.status}</td>
        </tr>
      </tbody>
    </table>
  </div>
  
  <div class="section">
    <div class="section-title">Booking Information</div>
    <div class="info-grid">
      <div class="info-item"><div class="label">Airline PNR</div><div class="value orange">${data.airlinePNR}</div></div>
      <div class="info-item"><div class="label">Booking Ref</div><div class="value">${data.rPNR}</div></div>
      <div class="info-item"><div class="label">Flight Number</div><div class="value">${data.flightNo}</div></div>
      <div class="info-item"><div class="label">Cabin Class</div><div class="value">${data.cabinClass}</div></div>
      <div class="info-item"><div class="label">Booking Class</div><div class="value">${data.bookingClass}</div></div>
      <div class="info-item"><div class="label">Fare Basis</div><div class="value">${data.fareBasis}</div></div>
    </div>
  </div>
  
  <div class="section">
    <div class="section-title">Baggage Allowance</div>
    <div class="baggage-grid">
      <div class="baggage-card"><div class="label">🧳 Check-in Baggage</div><div class="value">${data.checkedBaggage}</div></div>
      <div class="baggage-card"><div class="label">💼 Cabin / Carry-on</div><div class="value">${data.carryOn}</div></div>
    </div>
  </div>
  
  <div class="section">
    <div class="section-title">Fare Breakup</div>
    <table class="fare-table">
      <thead>
        <tr>
          <th>Base Fare</th>
          <th>Taxes &amp; Fees</th>
          <th>Total Fare</th>
        </tr>
      </thead>
      <tbody>
        <tr class="total-row">
          <td>${data.basePrice}</td>
          <td>${data.taxes}</td>
          <td>${data.totalPrice}</td>
        </tr>
      </tbody>
    </table>
    <table class="tax-table">
      <tbody>${taxRows}</tbody>
    </table>
  </div>
  
  <div class="section">
    <div class="section-title">Fare Calculation</div>
    <div class="fare-calc">${data.fareCalc}</div>
  </div>
  
  <div class="section">
    <div class="section-title">Penalty Information</div>
    <div class="policy-grid">
      <div class="policy-card change"><div class="label">✏️ Change Penalty</div><div class="amount">${data.changePenalty}</div></div>
      <div class="policy-card cancel"><div class="label">❌ Cancellation Penalty</div><div class="amount">${data.cancelPenalty}</div></div>
    </div>
  </div>
  
  <div class="terms">
    <h3>📌 Important Information</h3>
    <ul>
      <li>Carry a valid Government-issued Photo ID for check-in.</li>
      <li>Reach the airport at least 2 hours before departure for domestic flights.</li>
      <li>Flight timings are subject to change — please recheck with the airline.</li>
      <li>Baggage allowance may vary by sector — confirm with the airline.</li>
      <li>BOBROS is a ticketing agent and is not responsible for airline operations.</li>
    </ul>
    <p style="margin-top: 12px; font-size: 10px; color: #94a3b8;">For support: customersupport@bobrosone.com | 91-9133 133 456 (9:30AM–7:00PM Mon–Sat)</p>
  </div>
  
  <div class="footer">
    This ticket is generated electronically at www.bobrosone.com | Print Time: ${printTimestamp}
  </div>
</div>
<div class="action-buttons">
  <button class="print-btn" onclick="window.print()">🖨️ Print Ticket</button>
  <button class="close-btn" onclick="window.close()">✕ Close</button>
</div>
</body>
</html>`;
  };

  const inputStyle = {
    width: "100%",
    border: "1.5px solid #e5e7eb",
    borderRadius: "8px",
    padding: "12px 14px",
    fontSize: "14px",
    outline: "none",
    boxSizing: "border-box",
    fontWeight: "700",
    letterSpacing: "1px"
  };

  const modalOverlayStyle = {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1000,
    fontFamily: "'Segoe UI', sans-serif"
  };

  const modalContentStyle = {
    backgroundColor: "white",
    borderRadius: "12px",
    padding: "24px",
    width: "90%",
    maxWidth: "500px",
    maxHeight: "80vh",
    overflow: "auto",
    position: "relative"
  };

  // If ticket is being displayed, show full page ticket
  if (showTicket && ticketData) {
    // This will open a new tab with the full page ticket
    setTimeout(() => {
      openFullPageTicket();
      setShowTicket(false);
      if (onClose) onClose();
    }, 100);
    return null;
  }

  // Main form view
  return (
    <div style={{ fontFamily: "'Segoe UI', sans-serif", width: "100%", padding: "0" }}>
      <div style={{ textAlign: "center", marginBottom: "24px" }}>
        <div style={{ fontSize: "40px", marginBottom: "8px" }}>✈️</div>
        <h2 style={{ fontSize: "20px", fontWeight: "700", color: "#1a1a2e", margin: "0 0 4px" }}>
          Print Flight Ticket
        </h2>
        <p style={{ fontSize: "13px", color: "#888", margin: 0 }}>
          Enter your Airline PNR &amp; Last Name to view &amp; download
        </p>
      </div>

      {error && (
        <div style={{
          background: "#fff1f0", border: "1px solid #ffccc7",
          borderRadius: "8px", padding: "10px 14px",
          marginBottom: "16px", color: "#cf1322", fontSize: "13px"
        }}>
          {error}
        </div>
      )}

      <form onSubmit={handlePrint} style={{ width: "100%" }}>
        <div style={{ marginBottom: "14px" }}>
          <label style={{ display: "block", fontSize: "12px", color: "#555", fontWeight: "600", marginBottom: "6px" }}>
            Airline PNR (e.g. 35539O)
          </label>
          <input
            type="text"
            value={pnr}
            onChange={(e) => setPnr(e.target.value.toUpperCase())}
            placeholder="e.g. 35539O"
            required
            style={inputStyle}
            onFocus={e => e.target.style.borderColor = "#fd561e"}
            onBlur={e => e.target.style.borderColor = "#e5e7eb"}
          />
        </div>

        <div style={{ marginBottom: "14px" }}>
          <label style={{ display: "block", fontSize: "12px", color: "#555", fontWeight: "600", marginBottom: "6px" }}>
            Last Name (e.g. DEO)
          </label>
          <input
            type="text"
            value={lastName}
            onChange={(e) => setLastName(e.target.value.toUpperCase())}
            placeholder="e.g. DEO"
            required
            style={inputStyle}
            onFocus={e => e.target.style.borderColor = "#fd561e"}
            onBlur={e => e.target.style.borderColor = "#e5e7eb"}
          />
        </div>

        {/* Cloudflare Security Verification Heading + Turnstile */}
        <div style={{ marginBottom: "20px" }}>
          <label style={{ display: "block", fontSize: "12px", color: "#555", fontWeight: "600", marginBottom: "6px" }}>
          Security Verification
          </label>
          <div style={{ display: "flex", justifyContent: "center" }}>
            <Turnstile
              siteKey="0x4AAAAAABvRHvXzt4EuTFLs"   // 🔁 Replace with your actual Cloudflare Turnstile site key
              onSuccess={(token) => setTurnstileToken(token)}
              onError={() => setTurnstileToken(null)}
              onExpire={() => setTurnstileToken(null)}
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          style={{
            width: "100%",
            background: loading ? "#ffb89d" : "linear-gradient(135deg, #fd561e, #ff8c42)",
            color: "white", border: "none", borderRadius: "10px",
            padding: "14px", fontSize: "15px", fontWeight: "700",
            cursor: loading ? "not-allowed" : "pointer"
          }}
        >
          {loading ? "Fetching Ticket..." : "✈️ Get Flight Ticket"}
        </button>
      </form>

      {responseData && !showTicket && (
        <div style={{ marginTop: "20px", textAlign: "center" }}>
          <button
            onClick={() => copyToClipboard(JSON.stringify(responseData, null, 2))}
            style={{
              background: "#4CAF50",
              color: "white",
              border: "none",
              borderRadius: "8px",
              padding: "8px 16px",
              fontSize: "12px",
              cursor: "pointer",
              marginRight: "10px"
            }}
          >
            📋 Copy Response to Clipboard
          </button>
          <button
            onClick={() => setShowResponseModal(true)}
            style={{
              background: "#2196F3",
              color: "white",
              border: "none",
              borderRadius: "8px",
              padding: "8px 16px",
              fontSize: "12px",
              cursor: "pointer"
            }}
          >
            👁️ View Response Details
          </button>
        </div>
      )}

      {/* Response Modal */}
      {showResponseModal && responseData && (
        <div style={modalOverlayStyle} onClick={() => setShowResponseModal(false)}>
          <div style={modalContentStyle} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <h3 style={{ margin: 0, color: "#1a1a2e" }}>API Response Details</h3>
              <button
                onClick={() => setShowResponseModal(false)}
                style={{
                  background: "none",
                  border: "none",
                  fontSize: "20px",
                  cursor: "pointer",
                  color: "#666"
                }}
              >
                ✕
              </button>
            </div>
            <div style={{
              backgroundColor: "#f5f5f5",
              padding: "16px",
              borderRadius: "8px",
              overflow: "auto",
              maxHeight: "60vh"
            }}>
              <pre style={{ margin: 0, fontSize: "12px", fontFamily: "monospace" }}>
                {JSON.stringify(responseData, null, 2)}
              </pre>
            </div>
            <div style={{ marginTop: "16px", display: "flex", gap: "10px", justifyContent: "flex-end" }}>
              <button
                onClick={() => copyToClipboard(JSON.stringify(responseData, null, 2))}
                style={{
                  background: "#4CAF50",
                  color: "white",
                  border: "none",
                  borderRadius: "6px",
                  padding: "8px 16px",
                  cursor: "pointer"
                }}
              >
                Copy to Clipboard
              </button>
              <button
                onClick={() => setShowResponseModal(false)}
                style={{
                  background: "#f44336",
                  color: "white",
                  border: "none",
                  borderRadius: "6px",
                  padding: "8px 16px",
                  cursor: "pointer"
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PrintFlightTicketModal;