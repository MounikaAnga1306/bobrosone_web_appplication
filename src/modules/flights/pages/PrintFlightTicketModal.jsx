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

      console.log("[PrintFlightTicket] Calling upstream directly:", { providerLocatorCode: pnr.trim().toUpperCase(), ticketNumber: ticketNumber.trim() });

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

      console.log("[PrintFlightTicket] Response status:", response.status);
      console.log("[PrintFlightTicket] Response data:", JSON.stringify(response.data, null, 2));

      const apiData = response.data;

      if (!apiData) {
        setError("No data returned. Please check your PNR and Ticket Number.");
        return;
      }

      openFlightPrintWindow(apiData);

    } catch (err) {
      console.error("[PrintFlightTicket] Error status:", err.response?.status);
      console.error("[PrintFlightTicket] Error data:", JSON.stringify(err.response?.data, null, 2));
      console.error("[PrintFlightTicket] Error message:", err.message);

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

    const passengerName = `${travelerName.Prefix || ""} ${travelerName.First || ""} ${travelerName.Last || ""}`.trim() || "—";
    const passengerType = traveler.TravelerType || "ADT";
    const gender = traveler.Gender === "F" ? "Female" : traveler.Gender === "M" ? "Male" : (traveler.Gender || "—");
    const dob = traveler.DOB || "—";

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

    const totalPrice = formatAmount(firstTicket.TotalPrice);
    const basePrice = formatAmount(firstTicket.BasePrice);
    const taxes = formatAmount(firstTicket.Taxes);
    const changePenalty = formatAmount(pricingInfo.ChangePenalty?.Amount?.toString());
    const cancelPenalty = formatAmount(pricingInfo.CancelPenalty?.Amount?.toString());
    const refundable = firstTicket.Refundable ? "Yes" : "No";

    const checkedBaggage = baggageInfo.TextInfo?.Text?.[0] || (fareInfo.BaggageAllowance?.MaxWeight
      ? `${fareInfo.BaggageAllowance.MaxWeight.Value || ""}${fareInfo.BaggageAllowance.MaxWeight.Unit === "Kilograms" ? "KG" : ""}`
      : "—");
    const carryOn = carryOnInfo.TextInfo?.Text || "—";

    const taxRows = Array.isArray(taxInfoList) ? taxInfoList.map(t =>
      `<tr><td>${t.Category || "—"}</td><td style="text-align:right">${formatAmount(t.Amount)}</td></tr>`
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
    body { font-family: Arial, sans-serif; background: #f5f5f5; padding: 10px; color: #333; font-size: 13px; }
    .page { background: white; max-width: 780px; margin: 0 auto; border: 1px solid #ddd; }
    .header { display:flex; justify-content:space-between; align-items:center; padding:15px 16px; border-bottom:2px solid #eee; flex-wrap:wrap; gap:12px; }
    .logo-img { height:32px; width:auto; object-fit:contain; }
    .logo-fallback { font-size:24px; font-weight:900; color:#fd561e; display:none; }
    .company-info { text-align:right; font-size:10px; color:#555; line-height:1.5; }
    .company-info strong { color:#333; font-size:11px; }
    .pnr-bar { background:#1a1a2e; color:white; padding:10px 16px; display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:10px; }
    .pnr-left { font-size:13px; }
    .pnr-left .label { font-size:9px; color:#aaa; text-transform:uppercase; letter-spacing:0.6px; }
    .pnr-left .value { font-size:16px; font-weight:800; color:#fd561e; letter-spacing:1px; }
    .pnr-right { text-align:right; font-size:11px; color:#ccc; line-height:1.6; }
    .pnr-right strong { color:white; }
    .status-bar { background:#fff8f5; border-bottom:1px solid #ffe4d6; padding:8px 16px; display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:8px; font-size:11px; }
    .status-badge { padding:3px 12px; border-radius:20px; font-weight:800; font-size:11px; color:${statusColor}; background:${statusColor}18; }
    .flight-card { margin:12px 16px; border:1px solid #eee; border-radius:10px; overflow:hidden; }
    .flight-card-header { background:#f8f9ff; padding:8px 14px; font-size:10px; font-weight:700; color:#1a1a2e; text-transform:uppercase; letter-spacing:0.6px; border-bottom:1px solid #eee; display:flex; justify-content:space-between; align-items:center; }
    .flight-card-body { padding:14px; display:grid; grid-template-columns:1fr auto 1fr; gap:10px; align-items:center; }
    .flight-point .time { font-size:22px; font-weight:900; color:#1a1a2e; }
    .flight-point .city { font-size:13px; font-weight:700; color:#fd561e; }
    .flight-point .date { font-size:10px; color:#888; margin-top:2px; }
    .flight-middle { text-align:center; }
    .flight-arrow { color:#fd561e; font-size:20px; }
    .flight-info { font-size:10px; color:#666; line-height:1.6; text-align:center; }
    .flight-info strong { color:#1a1a2e; display:block; }
    .section { padding:12px 16px; border-bottom:1px solid #eee; }
    .section-title { font-size:10px; color:#999; text-transform:uppercase; letter-spacing:0.8px; margin-bottom:10px; padding-bottom:6px; border-bottom:1px solid #f0f0f0; }
    .info-grid { display:grid; grid-template-columns:repeat(auto-fill, minmax(160px, 1fr)); gap:10px; }
    .info-item .label { font-size:9px; color:#aaa; text-transform:uppercase; letter-spacing:0.5px; font-weight:600; }
    .info-item .value { font-size:12px; font-weight:700; color:#1a1a2e; margin-top:2px; }
    .info-item .value.orange { color:#fd561e; }
    .passenger-table { width:100%; border-collapse:collapse; font-size:11px; }
    .passenger-table th { font-size:9px; color:#999; text-transform:uppercase; letter-spacing:0.5px; font-weight:600; text-align:left; padding:8px 6px; background:#f8f9ff; border:1px solid #eee; }
    .passenger-table td { font-size:12px; font-weight:700; color:#1a1a2e; padding:8px 6px; border:1px solid #eee; }
    .passenger-table td.orange { color:#fd561e; }
    .baggage-grid { display:grid; grid-template-columns:1fr 1fr; gap:12px; }
    .baggage-block { background:#f8f9ff; border-radius:8px; padding:10px 12px; font-size:11px; }
    .baggage-block.carry { background:#f0fff4; }
    .baggage-block .label { font-size:9px; color:#999; text-transform:uppercase; letter-spacing:0.5px; font-weight:700; margin-bottom:4px; }
    .baggage-block .value { font-size:16px; font-weight:900; color:#1a1a2e; }
    .fare-table { width:100%; border-collapse:collapse; font-size:11px; }
    .fare-table th { background:#f8f9ff; font-size:9px; color:#888; text-transform:uppercase; letter-spacing:0.5px; padding:8px 10px; text-align:left; border:1px solid #eee; }
    .fare-table td { padding:8px 10px; font-size:12px; font-weight:700; color:#1a1a2e; border:1px solid #eee; }
    .fare-table .total-row td { color:#fd561e; font-size:13px; background:#fff8f5; }
    .tax-table { width:100%; border-collapse:collapse; font-size:10px; margin-top:8px; }
    .tax-table td { padding:4px 8px; border-bottom:1px solid #f5f5f5; color:#666; }
    .policy-grid { display:grid; grid-template-columns:1fr 1fr; gap:10px; }
    .policy-block { border-radius:8px; padding:10px 12px; font-size:11px; text-align:center; }
    .policy-block.change { background:#fff8f5; }
    .policy-block.cancel { background:#fff1f0; }
    .policy-block .label { font-size:9px; color:#aaa; text-transform:uppercase; letter-spacing:0.5px; font-weight:700; }
    .policy-block .amount { font-size:15px; font-weight:900; color:#fd561e; margin-top:4px; }
    .policy-block.cancel .amount { color:#dc2626; }
    .terms { padding:12px 16px; border-top:2px solid #eee; font-size:10px; color:#555; line-height:1.6; }
    .terms h3 { font-size:11px; color:#1a1a2e; margin:8px 0 4px; }
    .terms ul { padding-left:18px; margin:4px 0; }
    .terms ul li { margin-bottom:3px; }
    .footer { background:#f9f9f9; border-top:1px solid #eee; padding:8px 16px; font-size:9px; color:#aaa; text-align:center; }
    .download-btn { display:block; max-width:780px; margin:16px auto 0; background:linear-gradient(135deg,#fd561e,#ff8c42); color:white; border:none; border-radius:10px; padding:12px 16px; font-size:14px; font-weight:700; cursor:pointer; text-align:center; font-family:Arial,sans-serif; width:100%; }
    @media print {
      body { background:white; padding:0; }
      .page { border:none; }
      .download-btn { display:none !important; }
    }
    @media (max-width: 480px) {
      .flight-card-body { grid-template-columns:1fr; text-align:center; }
      .baggage-grid, .policy-grid { grid-template-columns:1fr; }
      .info-grid { grid-template-columns:1fr 1fr; }
    }
  </style>
</head>
<body>
<div class="page" id="ticketPage">
  <div class="header">
    <img src="${logoUrl}" alt="BOBROS" class="logo-img"
      onerror="this.style.display='none';document.querySelector('.logo-fallback').style.display='block';"/>
    <span class="logo-fallback">BOBROS</span>
    <div class="company-info">
      <strong>BOBROS Consultancy Services Pvt. Ltd.</strong><br/>
      Email: customersupport@bobrosone.com
    </div>
  </div>
  <div class="pnr-bar">
    <div style="display:flex;gap:24px;flex-wrap:wrap;">
      <div class="pnr-left">
        <div class="label">Airline PNR</div>
        <div class="value">${airlinePNR}</div>
      </div>
      <div class="pnr-left">
        <div class="label">Booking Reference</div>
        <div class="value" style="color:#60a5fa;">${rPNR}</div>
      </div>
    </div>
    <div class="pnr-right">
      <strong>Issued: ${issuedDate}</strong><br/>
      Ticket No: ${ticketNum}
    </div>
  </div>
  <div class="status-bar">
    <div style="font-size:11px;color:#555;">
      <strong style="color:#1a1a2e;">${platingCarrier}</strong> · ${cabinClass} · Fare Basis: ${fareBasis}
    </div>
    <div>
      <span class="status-badge">${status}</span>
      <span style="font-size:10px;color:#888;margin-left:8px;">Refundable: ${refundable}</span>
    </div>
  </div>
  <div class="flight-card">
    <div class="flight-card-header">
      <span>✈ ${origin} → ${destination}</span>
      <span style="color:#fd561e;">${flightNo}</span>
    </div>
    <div class="flight-card-body">
      <div class="flight-point">
        <div class="time">${departureTime}</div>
        <div class="city">${origin}</div>
        <div class="date">${departureDate}</div>
      </div>
      <div class="flight-middle">
        <div class="flight-arrow">✈</div>
        <div class="flight-info">
          <strong>${flightNo}</strong>
          ${cabinClass}<br/>Class: ${bookingClass}
        </div>
      </div>
      <div class="flight-point" style="text-align:right;">
        <div class="time">—</div>
        <div class="city">${destination}</div>
        <div class="date">${departureDate}</div>
      </div>
    </div>
  </div>
  <div class="section">
    <div class="section-title">Passenger Details</div>
    <table class="passenger-table">
      <thead>
        <tr>
          <th>Passenger Name</th><th>Type</th><th>Gender</th>
          <th>DOB</th><th>Ticket Number</th><th>Status</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td style="font-size:13px;">${passengerName}</td>
          <td>${passengerType === "ADT" ? "Adult" : passengerType}</td>
          <td>${gender}</td>
          <td>${dob !== "—" ? formatDate(dob) : "—"}</td>
          <td class="orange">${ticketNum}</td>
          <td style="color:${statusColor};font-weight:800;">${status}</td>
        </tr>
      </tbody>
    </table>
  </div>
  <div class="section">
    <div class="section-title">Booking Information</div>
    <div class="info-grid">
      <div class="info-item"><div class="label">Airline PNR</div><div class="value orange">${airlinePNR}</div></div>
      <div class="info-item"><div class="label">Booking Ref (R PNR)</div><div class="value">${rPNR}</div></div>
      <div class="info-item"><div class="label">Flight Number</div><div class="value">${flightNo}</div></div>
      <div class="info-item"><div class="label">Cabin Class</div><div class="value">${cabinClass}</div></div>
      <div class="info-item"><div class="label">Booking Class</div><div class="value">${bookingClass}</div></div>
      <div class="info-item"><div class="label">Fare Basis</div><div class="value">${fareBasis}</div></div>
    </div>
  </div>
  <div class="section">
    <div class="section-title">Baggage Allowance</div>
    <div class="baggage-grid">
      <div class="baggage-block"><div class="label">🧳 Check-in Baggage</div><div class="value">${checkedBaggage}</div></div>
      <div class="baggage-block carry"><div class="label">💼 Cabin / Carry-on</div><div class="value">${carryOn}</div></div>
    </div>
  </div>
  <div class="section">
    <div class="section-title">Fare Breakup</div>
    <table class="fare-table">
      <thead><tr><th>Base Fare</th><th>Taxes &amp; Fees</th><th>Total Fare</th></tr></thead>
      <tbody><tr class="total-row"><td>${basePrice}</td><td>${taxes}</td><td>${totalPrice}</td></tr></tbody>
    </table>
    ${taxRows ? `<table class="tax-table" style="margin-top:8px;">
      <thead><tr><td style="font-size:9px;color:#aaa;font-weight:700;text-transform:uppercase;padding:4px 8px;border-bottom:1px solid #eee;" colspan="2">Tax Breakdown</td></tr></thead>
      <tbody>${taxRows}</tbody>
    </table>` : ""}
  </div>
  <div class="section">
    <div class="section-title">Penalty Information</div>
    <div class="policy-grid">
      <div class="policy-block change"><div class="label">✏️ Change Penalty</div><div class="amount">${changePenalty}</div></div>
      <div class="policy-block cancel"><div class="label">❌ Cancellation Penalty</div><div class="amount">${cancelPenalty}</div></div>
    </div>
  </div>
  <div class="terms">
    <h3>Important Information</h3>
    <ul>
      <li>Carry a valid Government-issued Photo ID for check-in.</li>
      <li>Reach the airport at least 2 hours before departure for domestic flights.</li>
      <li>Flight timings are subject to change — please recheck with the airline.</li>
      <li>Baggage allowance may vary by sector — confirm with the airline.</li>
      <li>BOBROS is a ticketing agent and is not responsible for airline operations.</li>
    </ul>
    <p style="margin-top:8px;">For support: 91-9133 133 456 (9:30AM–7:00PM Mon–Sat) | customersupport@bobrosone.com</p>
  </div>
  <div class="footer">
    This ticket is generated electronically at www.bobrosone.com &nbsp;|&nbsp; Print Time: ${printTimestamp}
  </div>
</div>
<button class="download-btn" id="dlBtn">⬇️ Download Flight Ticket as PDF</button>
<script src="https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js"></script>
<script>
  document.getElementById('dlBtn').addEventListener('click', async function() {
    const btn = this;
    btn.textContent = 'Downloading...';
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