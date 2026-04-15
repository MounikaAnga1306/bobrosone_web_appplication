import { useState } from "react";
import axios from "axios";

const PrintFlightTicketModal = ({ onClose }) => {
  const [pnr, setPnr] = useState("");
  const [ticketNumber, setTicketNumber] = useState("");
  const [captchaInput, setCaptchaInput] = useState("");
  const [captchaValue] = useState(() => {
    const a = Math.floor(Math.random() * 9) + 1;
    const b = Math.floor(Math.random() * 9) + 1;
    return { question: `${a} + ${b}`, answer: String(a + b) };
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handlePrint = async (e) => {
    e.preventDefault();
    setError("");

    if (!pnr.trim()) { setError("Please enter Airline PNR."); return; }
    if (!ticketNumber.trim()) { setError("Please enter Ticket Number."); return; }
    if (captchaInput.trim() !== captchaValue.answer) {
      setError("Incorrect captcha. Please try again.");
      return;
    }

    try {
      setLoading(true);

      const response = await axios.post(
        "https://api.bobros.org/flights/retrieve-document/print-ticket",
        {
          providerLocatorCode: pnr.trim().toUpperCase(),
          ticketNumber: ticketNumber.trim()
        },
        {
          headers: {
            "Content-Type": "application/json"
          }
        }
      );

      const apiData = response.data;

      if (!apiData) {
        setError("No data returned. Please check your PNR and Ticket Number.");
        return;
      }

      openFlightPrintWindow(apiData);

    } catch (err) {
      console.error("[PrintFlightTicket] Error:", err.response?.data || err.message);
      
      if (err.response?.status === 404) {
        setError("Ticket not found. Please check your PNR and Ticket Number.");
      } else if (err.response?.status === 401 || err.response?.status === 403) {
        setError("Authentication failed. Please contact support.");
      } else if (err.code === "ERR_NETWORK" || err.message?.includes("Network Error")) {
        setError("Network error. Please check your connection and try again.");
      } else {
        const msg = err.response?.data?.message || err.response?.data?.error || err.message || "Failed to fetch ticket.";
        setError(`Error: ${msg}`);
      }
    } finally {
      setLoading(false);
    }
  };

  // Function to calculate flight duration between cities (in minutes)
  const getFlightDurationMinutes = (origin, destination) => {
    const routes = {
      // Domestic routes
      "HYD-BOM": 90, // Hyderabad to Mumbai - 1.5 hours
      "BOM-HYD": 90,
      "HYD-DEL": 120, // Hyderabad to Delhi - 2 hours
      "DEL-HYD": 120,
      "HYD-BLR": 60, // Hyderabad to Bangalore - 1 hour
      "BLR-HYD": 60,
      "HYD-MAA": 75, // Hyderabad to Chennai - 1.25 hours
      "MAA-HYD": 75,
      "HYD-CCU": 105, // Hyderabad to Kolkata - 1.75 hours
      "CCU-HYD": 105,
      "BOM-DEL": 120, // Mumbai to Delhi - 2 hours
      "DEL-BOM": 120,
      "BOM-BLR": 90, // Mumbai to Bangalore - 1.5 hours
      "BLR-BOM": 90,
      "DEL-BLR": 150, // Delhi to Bangalore - 2.5 hours
      "BLR-DEL": 150,
      // Add more routes as needed
    };
    
    const routeKey = `${origin}-${destination}`;
    return routes[routeKey] || 90; // Default 90 minutes if route not found
  };

  // Calculate arrival time from departure time + duration
  const calculateArrivalTime = (departureDateTimeStr, origin, destination) => {
    if (!departureDateTimeStr) return null;
    
    try {
      const departureDate = new Date(departureDateTimeStr);
      const durationMinutes = getFlightDurationMinutes(origin, destination);
      const arrivalDate = new Date(departureDate.getTime() + durationMinutes * 60000);
      return arrivalDate;
    } catch (error) {
      console.error("Error calculating arrival time:", error);
      return null;
    }
  };

  const openFlightPrintWindow = (apiData) => {
    const eTickets = apiData?.data?.eTickets || apiData?.eTickets || [];
    const firstTicket = eTickets[0] || {};
    const traveler = firstTicket.BookingTraveler || {};
    const travelerName = traveler.BookingTravelerName || {};
    const coupon = firstTicket.Ticket?.Coupon || {};
    const pricingInfo = firstTicket.AirPricingInfo || {};
    const fareInfo = pricingInfo.FareInfo || {};
    const baggageInfo = firstTicket.BaggageAllowances?.BaggageAllowanceInfo || {};
    const carryOnInfo = firstTicket.BaggageAllowances?.CarryOnAllowanceInfo || {};
    const taxInfoList = pricingInfo.TaxInfo || [];
    const supplierLocator = firstTicket.SupplierLocator || {};

    const formatAmount = (str) => str ? str.replace("INR", "₹") : "—";
    const formatDate = (dt) => {
      if (!dt) return "—";
      try {
        if (typeof dt === 'object' && dt instanceof Date) {
          return dt.toLocaleDateString("en-IN", {
            day: "2-digit", month: "short", year: "numeric"
          });
        }
        return new Date(dt).toLocaleDateString("en-IN", {
          day: "2-digit", month: "short", year: "numeric"
        });
      } catch { return dt; }
    };
    const formatTime = (dt) => {
      if (!dt) return "—";
      try {
        if (typeof dt === 'object' && dt instanceof Date) {
          return dt.toLocaleTimeString("en-IN", {
            hour: "2-digit", minute: "2-digit", hour12: false
          });
        }
        return new Date(dt).toLocaleTimeString("en-IN", {
          hour: "2-digit", minute: "2-digit", hour12: false
        });
      } catch { return dt; }
    };

    const passengerName = `${travelerName.Prefix || ""} ${travelerName.First || ""} ${travelerName.Last || ""}`.trim() || "—";
    const passengerType = traveler.TravelerType || "ADT";
    const gender = traveler.Gender === "F" ? "Female" : traveler.Gender === "M" ? "Male" : (traveler.Gender || "—");

    const airlinePNR = supplierLocator.SupplierLocatorCode || firstTicket.SupplierLocator?.SupplierLocatorCode || pnr;
    const rPNR = apiData?.data?.universalRecordLocator || apiData?.universalRecordLocator || pnr;
    const ticketNum = firstTicket.Ticket?.TicketNumber || ticketNumber;
    const issuedDate = formatDate(firstTicket.IssuedDate);
    const platingCarrier = firstTicket.PlatingCarrier || coupon.MarketingCarrier || "—";
    const status = coupon.Status === "A" ? "CONFIRMED" : (coupon.Status || "CONFIRMED");

    const origin = coupon.Origin || fareInfo.Origin || "—";
    const destination = coupon.Destination || fareInfo.Destination || "—";
    const departureTime = formatTime(coupon.DepartureTime);
    const departureDate = formatDate(coupon.DepartureTime);
    const flightNo = coupon.MarketingCarrier && coupon.MarketingFlightNumber
      ? `${coupon.MarketingCarrier} ${coupon.MarketingFlightNumber}` : "—";
    const cabinClass = pricingInfo.BookingInfo?.CabinClass || "Economy";
    const bookingClass = coupon.BookingClass || pricingInfo.BookingInfo?.BookingCode || "—";
    const fareBasis = coupon.FareBasis || fareInfo.FareBasis || "—";

    // Calculate arrival time from departure time + flight duration
    const arrivalDateTime = calculateArrivalTime(coupon.DepartureTime, origin, destination);
    const arrivalTime = arrivalDateTime ? formatTime(arrivalDateTime) : "—";
    const arrivalDate = arrivalDateTime ? formatDate(arrivalDateTime) : "—";
    
    // Calculate flight duration string
    const durationMinutes = getFlightDurationMinutes(origin, destination);
    const durationHours = Math.floor(durationMinutes / 60);
    const durationMins = durationMinutes % 60;
    const flightDuration = durationHours > 0 ? `${durationHours}h ${durationMins}m` : `${durationMins}m`;

    const totalPrice = formatAmount(firstTicket.TotalPrice);
    const basePrice = formatAmount(firstTicket.BasePrice);
    const taxes = formatAmount(firstTicket.Taxes);
    const changePenalty = formatAmount(pricingInfo.ChangePenalty?.Amount?.toString());
    const cancelPenalty = formatAmount(pricingInfo.CancelPenalty?.Amount?.toString());
    const refundable = firstTicket.Refundable ? "Yes" : "No";

    const checkedBaggage = baggageInfo.TextInfo?.Text?.[0] || (fareInfo.BaggageAllowance?.MaxWeight
      ? `${fareInfo.BaggageAllowance.MaxWeight.Value || ""} ${fareInfo.BaggageAllowance.MaxWeight.Unit === "Kilograms" ? "KG" : ""}`
      : "15 KG"); // Default 15KG as per your response
    const carryOn = carryOnInfo.TextInfo?.Text || "7 KG";

    const taxRows = Array.isArray(taxInfoList) ? taxInfoList.map(t =>
      `<tr><td style="padding:6px 8px;">${t.Category || "—"}</td><td style="text-align:right;padding:6px 8px;">${formatAmount(t.Amount)}</td></tr>`
    ).join("") : "";

    const statusColor = status === "CANCELLED" ? "#dc2626" : "#16a34a";
    const logoUrl = `${window.location.origin}/assets/Bobros_logo.png`;
    const printTimestamp = new Date().toLocaleString("en-IN", {
      day: "2-digit", month: "2-digit", year: "numeric",
      hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false
    }).replace(",", "");

    const printContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Flight Ticket - ${airlinePNR}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'Segoe UI', Arial, sans-serif; background: #f0f2f5; padding: 20px; color: #1a1a2e; font-size: 13px; }
    .page { background: white; max-width: 800px; margin: 0 auto; border-radius: 16px; box-shadow: 0 10px 40px rgba(0,0,0,0.1); overflow: hidden; }
    .header { background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); padding: 20px 24px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 16px; }
    .logo-img { height: 40px; width: auto; object-fit: contain; filter: brightness(0) invert(1); }
    .logo-fallback { font-size: 24px; font-weight: 900; color: white; display: none; }
    .company-info { text-align: right; color: rgba(255,255,255,0.8); font-size: 11px; line-height: 1.5; }
    .company-info strong { color: white; font-size: 12px; }
    .pnr-section { background: #fff8f0; padding: 16px 24px; border-bottom: 1px solid #ffe0b3; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 16px; }
    .pnr-box { display: flex; gap: 32px; flex-wrap: wrap; }
    .pnr-item .label { font-size: 10px; color: #b8860b; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 600; }
    .pnr-item .value { font-size: 18px; font-weight: 800; color: #1a1a2e; margin-top: 4px; }
    .pnr-item .value.orange { color: #fd561e; }
    .ticket-info { text-align: right; font-size: 11px; color: #666; }
    .ticket-info strong { color: #1a1a2e; }
    .status-bar { background: #f8f9fa; padding: 12px 24px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px; border-bottom: 1px solid #e9ecef; }
    .status-badge { display: inline-flex; align-items: center; gap: 6px; padding: 4px 12px; border-radius: 20px; font-weight: 700; font-size: 11px; background: ${statusColor}15; color: ${statusColor}; }
    .flight-info-tag { font-size: 11px; color: #6c757d; }
    .flight-info-tag strong { color: #1a1a2e; }
    .journey-card { margin: 20px 24px; background: linear-gradient(135deg, #f8f9ff 0%, #f0f2ff 100%); border-radius: 20px; padding: 24px; }
    .flight-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; padding-bottom: 16px; border-bottom: 2px dashed #cbd5e1; }
    .flight-number { font-size: 14px; font-weight: 700; color: #fd561e; background: white; padding: 6px 14px; border-radius: 20px; }
    .duration-badge { font-size: 11px; color: #64748b; background: white; padding: 6px 14px; border-radius: 20px; }
    .journey-points { display: flex; align-items: center; justify-content: space-between; gap: 20px; }
    .point { flex: 1; }
    .point.right { text-align: right; }
    .time { font-size: 28px; font-weight: 900; color: #1a1a2e; line-height: 1.2; }
    .date { font-size: 12px; color: #64748b; margin-top: 6px; }
    .airport-code { font-size: 14px; font-weight: 700; color: #fd561e; margin-top: 6px; }
    .journey-line { display: flex; flex-direction: column; align-items: center; padding: 0 20px; }
    .flight-icon { font-size: 32px; color: #fd561e; }
    .duration { font-size: 11px; color: #94a3b8; margin-top: 6px; font-weight: 600; }
    .section { padding: 16px 24px; border-bottom: 1px solid #e9ecef; }
    .section-title { font-size: 12px; font-weight: 800; color: #1a1a2e; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 16px; display: flex; align-items: center; gap: 8px; }
    .section-title::before { content: ""; width: 4px; height: 18px; background: #fd561e; border-radius: 2px; }
    .info-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); gap: 14px; }
    .info-item .label { font-size: 10px; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 600; }
    .info-item .value { font-size: 14px; font-weight: 700; color: #1a1a2e; margin-top: 4px; }
    .info-item .value.orange { color: #fd561e; }
    .passenger-table { width: 100%; border-collapse: collapse; }
    .passenger-table th { text-align: left; padding: 12px 8px; background: #f8f9fa; font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase; border-bottom: 2px solid #e9ecef; }
    .passenger-table td { padding: 12px 8px; font-size: 13px; font-weight: 600; color: #1a1a2e; border-bottom: 1px solid #e9ecef; }
    .passenger-table td.orange { color: #fd561e; }
    .baggage-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
    .baggage-card { background: #f8f9fa; border-radius: 12px; padding: 14px 16px; }
    .baggage-card .label { font-size: 11px; color: #64748b; margin-bottom: 6px; display: flex; align-items: center; gap: 6px; }
    .baggage-card .value { font-size: 20px; font-weight: 800; color: #1a1a2e; }
    .fare-table { width: 100%; border-collapse: collapse; }
    .fare-table th, .fare-table td { padding: 10px 12px; text-align: left; border-bottom: 1px solid #e9ecef; }
    .fare-table th { background: #f8f9fa; font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase; }
    .fare-table td { font-size: 14px; font-weight: 600; }
    .fare-table .total-row td { color: #fd561e; font-size: 16px; font-weight: 800; background: #fff8f0; }
    .tax-table { width: 100%; margin-top: 12px; border-collapse: collapse; }
    .tax-table td { padding: 6px 8px; font-size: 11px; color: #64748b; border-bottom: 1px solid #f0f0f0; }
    .policy-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
    .policy-card { background: #f8f9fa; border-radius: 12px; padding: 14px 16px; text-align: center; }
    .policy-card.change { background: #fff8f0; }
    .policy-card.cancel { background: #fff5f5; }
    .policy-card .label { font-size: 11px; color: #64748b; font-weight: 600; margin-bottom: 8px; }
    .policy-card .amount { font-size: 18px; font-weight: 800; color: #fd561e; }
    .policy-card.cancel .amount { color: #dc2626; }
    .terms { background: #f8f9fa; padding: 20px 24px; margin-top: 8px; }
    .terms h3 { font-size: 12px; color: #1a1a2e; margin-bottom: 12px; }
    .terms ul { padding-left: 20px; }
    .terms li { font-size: 11px; color: #64748b; margin-bottom: 6px; line-height: 1.5; }
    .footer { background: #1a1a2e; color: rgba(255,255,255,0.6); padding: 12px 24px; text-align: center; font-size: 10px; }
    .download-btn { display: block; max-width: 800px; margin: 20px auto 0; background: linear-gradient(135deg, #fd561e, #ff8c42); color: white; border: none; border-radius: 12px; padding: 14px 20px; font-size: 14px; font-weight: 700; cursor: pointer; text-align: center; width: 100%; transition: transform 0.2s; }
    .download-btn:hover { transform: translateY(-2px); }
    @media print {
      body { background: white; padding: 0; }
      .page { box-shadow: none; border-radius: 0; }
      .download-btn { display: none !important; }
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
    <img src="${logoUrl}" alt="BOBROS" class="logo-img" onerror="this.style.display='none';document.querySelector('.logo-fallback').style.display='block';"/>
    <span class="logo-fallback">BOBROS</span>
    <div class="company-info">
      <strong>BOBROS Consultancy Services Pvt. Ltd.</strong><br/>
      ✉ customersupport@bobrosone.com | 📞 91-9133 133 456
    </div>
  </div>
  
  <div class="pnr-section">
    <div class="pnr-box">
      <div class="pnr-item">
        <div class="label">Airline PNR</div>
        <div class="value orange">${airlinePNR}</div>
      </div>
      <div class="pnr-item">
        <div class="label">Booking Reference</div>
        <div class="value">${rPNR}</div>
      </div>
    </div>
    <div class="ticket-info">
      <strong>Ticket No:</strong> ${ticketNum}<br/>
      <strong>Issued:</strong> ${issuedDate}
    </div>
  </div>
  
  <div class="status-bar">
    <div class="flight-info-tag">
      ✈ <strong>${platingCarrier}</strong> • ${cabinClass} • Fare Basis: ${fareBasis}
    </div>
    <div>
      <span class="status-badge">✓ ${status}</span>
      <span style="margin-left: 12px; font-size: 11px;">🔄 Refundable: ${refundable}</span>
    </div>
  </div>
  
  <div class="journey-card">
    <div class="flight-header">
      <span class="flight-number">✈ ${flightNo}</span>
      <span class="duration-badge">⏱️ ${flightDuration}</span>
    </div>
    <div class="journey-points">
      <div class="point">
        <div class="time">${departureTime}</div>
        <div class="date">${departureDate}</div>
        <div class="airport-code">${origin}</div>
      </div>
      <div class="journey-line">
        <div class="flight-icon">✈</div>
        <div class="duration">${flightDuration}</div>
      </div>
      <div class="point right">
        <div class="time">${arrivalTime}</div>
        <div class="date">${arrivalDate}</div>
        <div class="airport-code">${destination}</div>
      </div>
    </div>
  </div>
  
  <div class="section">
    <div class="section-title">Passenger Details</div>
    <table class="passenger-table">
      <thead><tr><th>Passenger Name</th><th>Type</th><th>Gender</th><th>Ticket Number</th><th>Status</th></tr></thead>
      <tbody>
        <tr>
          <td style="font-size:14px; font-weight:700;">${passengerName}</td>
          <td>${passengerType === "ADT" ? "Adult" : passengerType}</td>
          <td>${gender}</td>
          <td class="orange">${ticketNum}</td>
          <td style="color:${statusColor}; font-weight:700;">${status}</td>
        </tr>
      </tbody>
    </table>
  </div>
  
  <div class="section">
    <div class="section-title">Booking Information</div>
    <div class="info-grid">
      <div class="info-item"><div class="label">Airline PNR</div><div class="value orange">${airlinePNR}</div></div>
      <div class="info-item"><div class="label">Booking Ref</div><div class="value">${rPNR}</div></div>
      <div class="info-item"><div class="label">Flight Number</div><div class="value">${flightNo}</div></div>
      <div class="info-item"><div class="label">Cabin Class</div><div class="value">${cabinClass}</div></div>
      <div class="info-item"><div class="label">Booking Class</div><div class="value">${bookingClass}</div></div>
      <div class="info-item"><div class="label">Fare Basis</div><div class="value">${fareBasis}</div></div>
    </div>
  </div>
  
  <div class="section">
    <div class="section-title">Baggage Allowance</div>
    <div class="baggage-grid">
      <div class="baggage-card"><div class="label">🧳 Check-in Baggage</div><div class="value">${checkedBaggage}</div></div>
      <div class="baggage-card"><div class="label">💼 Cabin / Carry-on</div><div class="value">${carryOn}</div></div>
    </div>
  </div>
  
  <div class="section">
    <div class="section-title">Fare Breakup</div>
    <table class="fare-table">
      <thead><tr><th>Base Fare</th><th>Taxes &amp; Fees</th><th>Total Fare</th></tr></thead>
      <tbody><tr class="total-row"><td>${basePrice}</td><td>${taxes}</td><td>${totalPrice}</td></tr></tbody>
    </table>
    ${taxRows ? `<table class="tax-table"><tbody>${taxRows}</tbody></table>` : ""}
  </div>
  
  <div class="section">
    <div class="section-title">Penalty Information</div>
    <div class="policy-grid">
      <div class="policy-card change"><div class="label">✏️ Change Penalty</div><div class="amount">${changePenalty}</div></div>
      <div class="policy-card cancel"><div class="label">❌ Cancellation Penalty</div><div class="amount">${cancelPenalty}</div></div>
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
<button class="download-btn" id="dlBtn">⬇️ Download Flight Ticket</button>
<script src="https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js"></script>
<script>
  document.getElementById('dlBtn').addEventListener('click', async function() {
    const btn = this;
    btn.textContent = '⏳ Downloading...';
    btn.disabled = true;
    try {
      const canvas = await html2canvas(document.getElementById('ticketPage'), {
        scale: 2, useCORS: true, backgroundColor: '#ffffff', logging: false
      });
      const imgData = canvas.toDataURL('image/png');
      const { jsPDF } = window.jspdf;
      const pdf = new jsPDF({ orientation:'portrait', unit:'mm', format:'a4' });
      const pageW = pdf.internal.pageSize.getWidth();
      const pageH = pdf.internal.pageSize.getHeight();
      const imgW = pageW;
      const imgH = (canvas.height * pageW) / canvas.width;
      let yPos = 0, remaining = imgH, first = true;
      while (remaining > 0) {
        if (!first) pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, -yPos, imgW, imgH);
        yPos += pageH; remaining -= pageH; first = false;
      }
      pdf.save('flight-ticket-${airlinePNR}.pdf');
    } catch(err) {
      alert('Download failed. Please try again.');
    } finally {
      btn.textContent = '⬇️ Download Flight Ticket as PDF';
      btn.disabled = false;
    }
  });
</script>
</body>
</html>`;

    const win = window.open("", "_blank");
    win.document.write(printContent);
    win.document.close();
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

  return (
    <div style={{ fontFamily: "'Segoe UI', sans-serif", width: "100%", padding: "0" }}>
      <div style={{ textAlign: "center", marginBottom: "24px" }}>
        <div style={{ fontSize: "40px", marginBottom: "8px" }}>✈️</div>
        <h2 style={{ fontSize: "20px", fontWeight: "700", color: "#1a1a2e", margin: "0 0 4px" }}>
          Print Flight Ticket
        </h2>
        <p style={{ fontSize: "13px", color: "#888", margin: 0 }}>
          Enter your Airline PNR &amp; Ticket Number to view &amp; download
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
            Airline PNR (e.g. GBL0DW)
          </label>
          <input
            type="text"
            value={pnr}
            onChange={(e) => setPnr(e.target.value.toUpperCase())}
            placeholder="e.g. GBL0DW"
            required
            style={inputStyle}
            onFocus={e => e.target.style.borderColor = "#fd561e"}
            onBlur={e => e.target.style.borderColor = "#e5e7eb"}
          />
        </div>

        <div style={{ marginBottom: "14px" }}>
          <label style={{ display: "block", fontSize: "12px", color: "#555", fontWeight: "600", marginBottom: "6px" }}>
            Ticket Number (e.g. 0985804166542)
          </label>
          <input
            type="text"
            value={ticketNumber}
            onChange={(e) => setTicketNumber(e.target.value)}
            placeholder="e.g. 0985804166542"
            required
            style={inputStyle}
            onFocus={e => e.target.style.borderColor = "#fd561e"}
            onBlur={e => e.target.style.borderColor = "#e5e7eb"}
          />
        </div>

        <div style={{ marginBottom: "20px" }}>
          <label style={{ display: "block", fontSize: "12px", color: "#555", fontWeight: "600", marginBottom: "6px" }}>
            Captcha: What is {captchaValue.question}?
          </label>
          <input
            type="text"
            value={captchaInput}
            onChange={(e) => setCaptchaInput(e.target.value)}
            placeholder="Enter answer"
            required
            style={{ ...inputStyle, fontWeight: "400", letterSpacing: "0" }}
            onFocus={e => e.target.style.borderColor = "#fd561e"}
            onBlur={e => e.target.style.borderColor = "#e5e7eb"}
          />
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
          {loading ? "Fetching Ticket..." : "✈️ Print Flight Ticket"}
        </button>
      </form>
    </div>
  );
};

export default PrintFlightTicketModal;