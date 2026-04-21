// src/modules/bus/pages/PrintTicketModal.jsx
import { useState, useEffect, useRef } from "react";
import axios from "axios";

// Your Cloudflare Turnstile Site Key
const TURNSTILE_SITE_KEY = "0x4AAAAAABvRHvXzt4EuTFLs";

const PrintTicketModal = ({ onClose, prefillTin = "" }) => {
  const [tin, setTin] = useState(prefillTin);
  const [turnstileToken, setTurnstileToken] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const turnstileRef = useRef(null);
  const widgetIdRef = useRef(null);
  const scriptLoadedRef = useRef(false);

  // Helper to render the Turnstile widget
  const renderTurnstile = () => {
    if (!turnstileRef.current || !window.turnstile) return;
    // Clean up any existing widget in this container
    if (widgetIdRef.current) {
      try {
        window.turnstile.remove(widgetIdRef.current);
      } catch (e) {}
      widgetIdRef.current = null;
    }
    // Render a fresh widget
    widgetIdRef.current = window.turnstile.render(turnstileRef.current, {
      sitekey: TURNSTILE_SITE_KEY,
      callback: (token) => {
        setTurnstileToken(token);
        setError("");
      },
      "expired-callback": () => {
        setTurnstileToken("");
        setError("CAPTCHA expired. Please verify again.");
      },
      "error-callback": () => {
        setTurnstileToken("");
        setError("CAPTCHA verification failed. Please try again.");
      },
    });
  };

  // Load Turnstile script and render widget when modal mounts
  useEffect(() => {
    const scriptId = "cloudflare-turnstile-script";

    const loadScriptAndRender = () => {
      if (window.turnstile) {
        renderTurnstile();
        return;
      }
      const existingScript = document.getElementById(scriptId);
      if (existingScript) {
        // Script already in DOM but not yet loaded
        existingScript.addEventListener("load", renderTurnstile);
        return;
      }
      const script = document.createElement("script");
      script.id = scriptId;
      script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js";
      script.async = true;
      script.defer = true;
      script.onload = renderTurnstile;
      document.head.appendChild(script);
    };

    loadScriptAndRender();

    // Cleanup on unmount
    return () => {
      if (widgetIdRef.current && window.turnstile) {
        try {
          window.turnstile.remove(widgetIdRef.current);
        } catch (e) {}
        widgetIdRef.current = null;
      }
      // Reset token when modal closes
      setTurnstileToken("");
    };
  }, []); // Empty deps → runs on mount/unmount only

  const handlePrint = async (e) => {
    e.preventDefault();
    setError("");

    if (!tin.trim()) {
      setError("Please enter Ticket ID.");
      return;
    }
    if (!turnstileToken) {
      setError("Please complete the CAPTCHA verification.");
      return;
    }

    try {
      setLoading(true);
      const res = await axios.get(`/printTicket?tin=${tin.trim()}&cf-turnstile-response=${turnstileToken}`);

      if (!res.data?.success) {
        setError("Ticket not found. Please check the Ticket ID.");
        return;
      }

      const d = res.data?.data || res.data;
      openPrintWindow(d);
    } catch (err) {
      setError("Failed to fetch ticket. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const openPrintWindow = (d) => {
    // ── Helper: convert minutes from midnight to HH:MM ──
    const toTime = (mins) => {
      if (!mins) return "—";
      const m = parseInt(mins);
      if (isNaN(m)) return String(mins);
      const h = Math.floor(m / 60);
      const min = m % 60;
      return `${String(h).padStart(2, "0")}:${String(min).padStart(2, "0")}`;
    };

    // ── Helper: format date ──
    const formatDate = (dt) => {
      if (!dt || dt === "—") return "—";
      try {
        const date = new Date(dt.toString().replace(" ", "T").replace(/\.$/, ""));
        if (isNaN(date.getTime())) return dt;
        return date.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
      } catch { return dt; }
    };

    // ── Basic trip fields ──
    const sourceCity      = d.sourceCity        || d.pickupLocation      || d.from        || "—";
    const destCity        = d.destinationCity   || d.dropLocation        || d.to          || "—";
    const pnr             = d.pnr               || d.tin                 || tin;
    const bookingId       = d.tin               || d.pnr                 || tin;
    const doj             = d.doj               || "—";
    const travels         = d.travels           || d.operatorName        || "—";
    const busType         = d.busType           || d.bus_type            || "—";
    const status          = d.status            || "CONFIRMED";
    const operatorContact = d.pickUpContactNo   || d.operatorContact     || "—";

    // ── Passenger parsing — handles BOTH single object AND array ──
    let passengers = [];

    const inv = d.inventoryItems;

    if (Array.isArray(inv)) {
      passengers = inv.map((item) => ({
        name:     item.passenger?.name     || item.name     || item.pname  || "—",
        mobile:   item.passenger?.mobile   || item.mobile   || item.pmob   || "—",
        gender:   item.passenger?.gender   || item.gender   || item.pgender|| "—",
        age:      item.passenger?.age      || item.age      || item.page   || "—",
        seatName: item.seatName            || item.seat     || item.seatno || "—",
        baseFare: item.baseFare            || item.base_fare|| "0",
        serviceTax: item.serviceTax        || item.service_tax || "0",
        totalFare: item.grandTotalFare     || item.totalFare|| item.fare   || "0",
      }));
    } else if (inv && typeof inv === "object") {
      if (Array.isArray(inv.passenger)) {
        passengers = inv.passenger.map((p, i) => ({
          name:     p.name     || p.pname  || "—",
          mobile:   p.mobile   || p.pmob   || "—",
          gender:   p.gender   || p.pgender|| "—",
          age:      p.age      || p.page   || "—",
          seatName: Array.isArray(inv.seatName) ? (inv.seatName[i] || "—") : (inv.seatName || "—"),
          baseFare: inv.baseFare     || inv.base_fare    || "0",
          serviceTax: inv.serviceTax || inv.service_tax  || "0",
          totalFare:  inv.grandTotalFare || inv.totalFare || inv.fare || "0",
        }));
      } else {
        const p = inv.passenger || {};
        passengers = [{
          name:     p.name     || inv.pname  || d.pname  || "—",
          mobile:   p.mobile   || inv.pmob   || d.pmob   || "—",
          gender:   p.gender   || inv.pgender|| d.pgender|| "—",
          age:      p.age      || inv.page   || d.page   || "—",
          seatName: inv.seatName || inv.seat || d.seatName || "—",
          baseFare:   inv.baseFare    || inv.base_fare   || "0",
          serviceTax: inv.serviceTax  || inv.service_tax || "0",
          totalFare:  inv.grandTotalFare || inv.totalFare || inv.fare || "0",
        }];
      }
    } else if (Array.isArray(d.passengers)) {
      passengers = d.passengers.map((p) => ({
        name:     p.name     || p.pname   || "—",
        mobile:   p.mobile   || p.pmob    || "—",
        gender:   p.gender   || p.pgender || "—",
        age:      p.age      || p.page    || "—",
        seatName: p.seatName || p.seat    || p.seatno || "—",
        baseFare:   p.baseFare    || d.baseFare    || "0",
        serviceTax: p.serviceTax  || d.serviceTax  || "0",
        totalFare:  p.grandTotalFare || p.totalFare || p.fare || d.totalFare || "0",
      }));
    } else {
      passengers = [{
        name:     d.pname    || d.passengerName  || "—",
        mobile:   d.pmob     || d.mobile         || "—",
        gender:   d.pgender  || d.gender         || "—",
        age:      d.page     || d.age            || "—",
        seatName: d.seatName || d.seat           || "—",
        baseFare:   d.baseFare    || "0",
        serviceTax: d.serviceTax  || "0",
        totalFare:  d.grandTotalFare || d.totalFare || d.fare || "0",
      }];
    }

    const totalBaseFare   = passengers.reduce((sum, p) => sum + parseFloat(p.baseFare   || 0), 0);
    const totalServiceTax = passengers.reduce((sum, p) => sum + parseFloat(p.serviceTax || 0), 0);
    const totalGrandFare  = passengers.reduce((sum, p) => sum + parseFloat(p.totalFare  || 0), 0);

    const boardingPoint    = d.pickupLocation         || d.boardingPoint    || "—";
    const boardingAddress  = d.pickUpLocationAddress  || d.boardingAddress  || "—";
    const boardingLandmark = d.pickupLocationLandmark || d.boardingLandmark || "—";
    const boardingContact  = d.pickUpContactNo        || d.boardingContact  || "—";

    const dropPoint        = d.dropLocation           || d.dropPoint        || destCity  || "—";
    const dropAddress      = d.dropLocationAddress    || d.dropAddress      || "—";
    const dropLandmark     = d.dropLocationLandmark   || d.dropLandmark     || "—";

    const departureTime  = toTime(d.pickupTime             || d.primeDepartureTime     || d.firstBoardingPointTime);
    const dropTime       = toTime(d.dropTime               || d.arrivalTime);
    const reportingTime  = toTime(d.firstBoardingPointTime || d.reportingTime          || d.pickupTime);

    const dojFormatted   = formatDate(doj);
    const printTimestamp = new Date().toLocaleString("en-IN", {
      day: "2-digit", month: "2-digit", year: "numeric",
      hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false
    }).replace(",", "");

    const statusColor = status === "CANCELLED" ? "#dc2626" : status === "CONFIRMED" || status === "BOOKED" ? "#16a34a" : "#d97706";
    const logoUrl     = `${window.location.origin}/assets/Bobros_logo.png`;

    const passengerRows = passengers.map(p => `
        <tr>
          <td>${p.name}</td>
          <td>${p.gender}</td>
          <td>${p.age}</td>
          <td class="orange">${p.seatName}</td>
          <td>${busType}</td>
          <td class="status">${status}</td>
          <td class="orange">${pnr}</td>
        </tr>
    `).join("");

    const printContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover"/>
  <title>Ticket - ${pnr}</title>
  <style>
    * { 
      box-sizing: border-box; 
      margin: 0; 
      padding: 0; 
    }
    
    body {
      font-family: 'Arial', sans-serif;
      background: #f5f5f5;
      padding: 10px;
      color: #333;
      font-size: 13px;
    }
    
    .page {
      background: white;
      max-width: 780px;
      margin: 0 auto;
      border: 1px solid #ddd;
      width: 100%;
    }

    /* ── HEADER ── */
    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 15px 16px;
      border-bottom: 2px solid #eee;
      flex-wrap: wrap;
      gap: 12px;
    }
    
    .logo-img { 
      height: 32px; 
      width: auto; 
      object-fit: contain; 
    }
    
    .logo-fallback {
      font-size: 24px; 
      font-weight: 900;
      color: #fd561e; 
      letter-spacing: -1px; 
      display: none;
    }
    
    .logo-fallback sup { 
      font-size: 9px; 
      color: #fd561e; 
    }
    
    .company-info {
      text-align: right;
      font-size: 10px;
      color: #555;
      line-height: 1.5;
    }
    
    .company-info strong { 
      color: #333; 
      font-size: 11px; 
    }

    /* ── ROUTE BAR ── */
    .route-bar {
      background: #fafafa;
      border-bottom: 1px solid #eee;
      padding: 12px 16px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 12px;
    }
    
    .route-cities {
      font-size: 16px;
      font-weight: 800;
      color: #1a1a2e;
      display: flex;
      align-items: center;
      gap: 6px;
      flex-wrap: wrap;
    }
    
    .route-arrow { 
      color: #fd561e; 
      font-size: 14px; 
    }
    
    .route-meta { 
      text-align: right; 
      font-size: 11px; 
      color: #555; 
      line-height: 1.6; 
    }
    
    .route-meta strong { 
      color: #1a1a2e; 
    }

    /* ── OPERATOR ── */
    .operator-bar {
      padding: 8px 16px;
      background: #fff8f5;
      border-bottom: 1px solid #ffe4d6;
      font-size: 11px;
      color: #555;
      display: flex;
      justify-content: space-between;
      flex-wrap: wrap;
      gap: 8px;
    }
    
    .operator-bar strong { 
      color: #fd561e; 
    }

    /* ── SECTION ── */
    .section { 
      padding: 12px 16px; 
      border-bottom: 1px solid #eee; 
    }
    
    .section-title {
      font-size: 10px;
      color: #999;
      text-transform: uppercase;
      letter-spacing: 0.8px;
      margin-bottom: 10px;
      padding-bottom: 6px;
      border-bottom: 1px solid #f0f0f0;
    }

    /* ── PASSENGER TABLE - MOBILE RESPONSIVE ── */
    .passenger-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 11px;
      display: block;
      overflow-x: auto;
      -webkit-overflow-scrolling: touch;
    }
    
    .passenger-table th {
      font-size: 9px;
      color: #999;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      font-weight: 600;
      text-align: left;
      padding: 8px 6px;
      background: #f8f9ff;
      border: 1px solid #eee;
      white-space: nowrap;
    }
    
    .passenger-table td {
      font-size: 11px;
      font-weight: 700;
      color: #1a1a2e;
      padding: 8px 6px;
      border: 1px solid #eee;
    }
    
    .passenger-table td.orange { 
      color: #fd561e; 
    }
    
    .passenger-table td.status { 
      color: ${statusColor}; 
      font-weight: 800; 
    }
    
    .passenger-table tbody tr:nth-child(even) td { 
      background: #fafafa; 
    }

    /* ── INFO TABLE - MOBILE RESPONSIVE ── */
    .info-table {
      width: 100%;
      border-collapse: collapse;
      display: block;
      overflow-x: auto;
      -webkit-overflow-scrolling: touch;
    }
    
    .info-table th {
      font-size: 9px;
      color: #999;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      font-weight: 600;
      text-align: left;
      padding: 6px 8px 6px 0;
      white-space: nowrap;
    }
    
    .info-table td {
      font-size: 11px;
      font-weight: 700;
      color: #1a1a2e;
      padding: 6px 8px 6px 0;
    }
    
    .info-table td.orange { 
      color: #fd561e; 
    }
    
    .info-table tr:not(:last-child) td,
    .info-table tr:not(:last-child) th {
      border-bottom: 1px solid #f9f9f9;
    }

    /* ── ADDRESS GRID - MOBILE RESPONSIVE ── */
    .address-grid {
      display: grid;
      grid-template-columns: 1fr;
      gap: 12px;
      margin-top: 4px;
    }
    
    @media (min-width: 640px) {
      .address-grid {
        grid-template-columns: 1fr 1fr;
      }
    }
    
    .address-block {
      background: #f8f9ff;
      border-radius: 6px;
      padding: 10px 12px;
      font-size: 11px;
      line-height: 1.6;
      color: #444;
      word-break: break-word;
    }
    
    .address-block.drop { 
      background: #f0fff4; 
    }
    
    .address-block .label {
      font-size: 9px;
      color: #999;
      text-transform: uppercase;
      letter-spacing: 0.6px;
      font-weight: 700;
      margin-bottom: 4px;
    }
    
    .address-block strong { 
      color: #fd561e; 
      display: block; 
      margin-bottom: 2px; 
      font-size: 12px;
    }
    
    .address-block.drop strong { 
      color: #16a34a; 
    }

    /* ── FARE TABLE - MOBILE RESPONSIVE ── */
    .fare-table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 4px;
      display: block;
      overflow-x: auto;
      -webkit-overflow-scrolling: touch;
    }
    
    .fare-table th {
      background: #f8f9ff;
      font-size: 9px;
      color: #888;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      padding: 8px 10px;
      text-align: left;
      border: 1px solid #eee;
      white-space: nowrap;
    }
    
    .fare-table td {
      padding: 8px 10px;
      font-size: 12px;
      font-weight: 700;
      color: #1a1a2e;
      border: 1px solid #eee;
    }
    
    .fare-table td.total { 
      color: #fd561e; 
      font-size: 13px; 
    }

    /* ── TERMS ── */
    .terms {
      padding: 12px 16px;
      border-top: 2px solid #eee;
      font-size: 10px;
      color: #555;
      line-height: 1.6;
    }
    
    .terms h3 {
      font-size: 11px;
      color: #1a1a2e;
      margin: 8px 0 4px;
    }
    
    .terms ul { 
      padding-left: 18px; 
      margin: 4px 0; 
    }
    
    .terms ul li { 
      margin-bottom: 3px; 
    }
    
    .not-responsible {
      border: 1px solid #eee;
      border-radius: 6px;
      padding: 10px 12px;
      margin-top: 8px;
    }

    /* ── FOOTER ── */
    .footer {
      background: #f9f9f9;
      border-top: 1px solid #eee;
      padding: 8px 16px;
      font-size: 9px;
      color: #aaa;
      text-align: center;
      line-height: 1.4;
    }

    /* ── DOWNLOAD BUTTON ── */
    .download-btn {
      display: block;
      max-width: 780px;
      margin: 16px auto 0;
      background: linear-gradient(135deg, #fd561e, #ff8c42);
      color: white;
      border: none;
      border-radius: 10px;
      padding: 12px 16px;
      font-size: 14px;
      font-weight: 700;
      cursor: pointer;
      text-align: center;
      font-family: 'Arial', sans-serif;
      width: 100%;
    }
    
    .download-btn:hover { 
      opacity: 0.92; 
    }
    
    .download-btn:disabled { 
      opacity: 0.6; 
      cursor: not-allowed; 
    }

    @media print {
      body { 
        background: white; 
        padding: 0; 
        margin: 0;
      }
      .page { 
        border: none; 
        max-width: 100%;
      }
      .download-btn { 
        display: none !important; 
      }
      .passenger-table,
      .info-table,
      .fare-table {
        overflow: visible;
      }
    }

    /* Small mobile adjustments */
    @media (max-width: 480px) {
      body {
        padding: 5px;
      }
      
      .header {
        padding: 12px;
      }
      
      .route-bar {
        padding: 10px 12px;
      }
      
      .route-cities {
        font-size: 14px;
      }
      
      .operator-bar {
        padding: 6px 12px;
        font-size: 10px;
      }
      
      .section {
        padding: 10px 12px;
      }
      
      .passenger-table th,
      .passenger-table td {
        padding: 6px 4px;
        font-size: 10px;
      }
      
      .address-block {
        padding: 8px 10px;
        font-size: 10px;
      }
      
      .terms {
        padding: 10px 12px;
        font-size: 9px;
      }
    }
  </style>
</head>
<body>

<div class="page" id="ticketPage">

  <!-- HEADER -->
  <div class="header">
    <img
      src="${logoUrl}"
      alt="BOBROS"
      class="logo-img"
      onerror="this.style.display='none'; document.querySelector('.logo-fallback').style.display='block';"
    />
    <span class="logo-fallback">BOBROS<sup>®</sup></span>
    <div class="company-info">
      <strong>BOBROS Consultancy Services Pvt. Ltd.</strong><br/>
      Email: customersupport@bobrosone.com
    </div>
  </div>

  <!-- ROUTE BAR -->
  <div class="route-bar">
    <div class="route-cities">
      ${sourceCity} <span class="route-arrow">⇒</span> ${destCity}
      <span style="font-size:10px;color:${statusColor};background:${statusColor}18;padding:2px 8px;border-radius:20px;font-weight:700;">${status}</span>
    </div>
    <div class="route-meta">
      <strong>DOJ: ${dojFormatted}</strong><br/>
      PNR: <strong style="color:#fd561e;">${pnr}</strong>
    </div>
  </div>

  <!-- OPERATOR -->
  <div class="operator-bar">
    <span>Operator: <strong>${travels}</strong></span>
    <span>Bus Type: <strong>${busType}</strong></span>
    <span>Contact: <strong>${operatorContact}</strong></span>
  </div>

  <!-- PASSENGER DETAILS TABLE -->
  <div class="section">
    <div class="section-title">Passenger Details (${passengers.length} Passenger${passengers.length > 1 ? "s" : ""})</div>
    <table class="passenger-table">
      <thead>
        <tr>
          <th>Passenger Name</th>
          <th>Gender</th>
          <th>Age</th>
          <th>Seat No.</th>
          <th>Bus Type</th>
          <th>Status</th>
          <th>PNR</th>
        </tr>
      </thead>
      <tbody>
        ${passengerRows}
      </tbody>
    </table>
  </div>

  <!-- BOOKING INFO TABLE -->
  <div class="section">
    <table class="info-table">
      <thead>
        <tr>
          <th>Booking ID</th>
          <th>Boarding Point</th>
          <th>Pick Up Time</th>
          <th>Reporting Time</th>
          ${dropTime !== "—" ? "<th>Drop Time</th>" : ""}
        </tr>
      </thead>
      <tbody>
        <tr>
          <td class="orange">${bookingId}</td>
          <td>${boardingPoint}</td>
          <td>${departureTime}</td>
          <td>${reportingTime}</td>
          ${dropTime !== "—" ? `<td>${dropTime}</td>` : ""}
        </tr>
      </tbody>
    </table>
  </div>

  <!-- BOARDING + DROP ADDRESS GRID -->
  <div class="section">
    <div class="section-title">Boarding &amp; Drop Point</div>
    <div class="address-grid">

      <div class="address-block">
        <div class="label">🟠 Boarding Point</div>
        <strong>${boardingPoint}</strong>
        ${boardingAddress !== "—" ? `Address: ${boardingAddress}<br/>` : ""}
        ${boardingLandmark !== "—" ? `Landmark: ${boardingLandmark}<br/>` : ""}
        ${boardingContact !== "—" ? `Contact: ${boardingContact}` : ""}
      </div>

      <div class="address-block drop">
        <div class="label">🟢 Drop Point</div>
        <strong style="color:#16a34a;">${dropPoint}</strong>
        ${dropAddress !== "—" ? `Address: ${dropAddress}<br/>` : ""}
        ${dropLandmark !== "—" ? `Landmark: ${dropLandmark}` : ""}
      </div>

    </div>
  </div>

  <!-- FARE BREAKUP -->
  <div class="section">
    <div class="section-title">Fare Breakup</div>
    <table class="fare-table">
      <thead>
        <tr>
          <th>Base Fare</th>
          <th>Service Tax</th>
          <th>Total Fare</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>Rs. ${totalBaseFare > 0 ? totalBaseFare.toFixed(2) : passengers[0]?.baseFare || "0"}</td>
          <td>Rs. ${totalServiceTax > 0 ? totalServiceTax.toFixed(2) : passengers[0]?.serviceTax || "0"}</td>
          <td class="total">Rs. ${totalGrandFare > 0 ? totalGrandFare.toFixed(2) : passengers[0]?.totalFare || "0"}</td>
        </tr>
      </tbody>
    </table>
  </div>

  <!-- TERMS & CONDITIONS -->
  <div class="terms">
    <h3>Terms &amp; Conditions</h3>
    <p>BOBROS is only a bus ticketing agent. It does not operate bus services of its own. In order to provide a comprehensive choice of bus operators, departure times and prices to customers, it has tied up with many Bus Operators and Bus Inventory Sharing companies.</p>
    <p style="margin-top:6px;">BOBROS advice to customers is to choose bus operators they are aware of and whose service they are comfortable with.</p>
    <p style="margin-top:6px;">BOBROS is a registered trademark of BOBROS Consultancy Services Private Limited registered as company in India and having its registered office at 1-232, Mulakaluru, Narasaraopet, Andhra Pradesh - 522 601.</p>
    <p style="margin-top:6px;">For detailed Terms and Conditions and Cancellation Policy please visit https://www.bobrosone.com or contact us on 91-9133 133 456 (9:30AM to 7:00PM Monday to Saturday except the Public Holidays).</p>

    <h3>Cancellation Policy</h3>
    <ul>
      <li>Less than 1 hour before journey: 0%</li>
    </ul>

    <h3>BOBROS is responsible for</h3>
    <ul>
      <li>(1) Issuing a valid ticket (a ticket that will be accepted by the bus operator) for its network of bus operators.</li>
      <li>(2) Providing refund and support in the event of cancellation.</li>
      <li>(3) Providing customer support and information on your bookings, cancellation and refunds.</li>
    </ul>

    <div class="not-responsible">
      <strong style="display:block;margin-bottom:6px;color:#1a1a2e;">BOBROS is not responsible for</strong>
      <ul>
        <li>(1) The bus operator's bus not departing / reaching on time.</li>
        <li>(2) The bus operator's employees being rude.</li>
        <li>(3) The bus operator's bus seats etc. not being up to the customer's expectation.</li>
        <li>(4) The bus operator canceling the trip due to unavoidable reasons.</li>
      </ul>
      <p style="margin-top:8px;">BOBROS will make all possible efforts to take your concerns forward to the responsible service provider.</p>
    </div>
  </div>

  <!-- FOOTER -->
  <div class="footer">
    This ticket is generated electronically at www.bobrosone.com &nbsp;|&nbsp; Ticket Print Time Stamp: ${printTimestamp}
  </div>

</div>

<!-- DOWNLOAD BUTTON -->
<button class="download-btn" id="dlBtn">
  ⬇️ Download Ticket as PDF
</button>

<!-- html2canvas + jsPDF CDN -->
<script src="https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js"></script>
<script>
  document.getElementById('dlBtn').addEventListener('click', async function () {
    const btn = this;
    btn.textContent = 'Downloading...';
    btn.disabled = true;

    try {
      const el = document.getElementById('ticketPage');
      const canvas = await html2canvas(el, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff',
        logging: false
      });

      const imgData = canvas.toDataURL('image/png');
      const { jsPDF } = window.jspdf;

      const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
      const pageW = pdf.internal.pageSize.getWidth();
      const pageH = pdf.internal.pageSize.getHeight();

      const imgW = pageW;
      const imgH = (canvas.height * pageW) / canvas.width;

      let yPos = 0;
      let remaining = imgH;
      let firstPage = true;

      while (remaining > 0) {
        if (!firstPage) pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, -yPos, imgW, imgH);
        yPos += pageH;
        remaining -= pageH;
        firstPage = false;
      }

      const fromSlug = '${sourceCity}'.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
      const toSlug   = '${destCity}'.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
      pdf.save(fromSlug + '-to-' + toSlug + '-ticket_${pnr}.pdf');

    } catch (err) {
      alert('Download failed. Please try again.');
      console.error(err);
    } finally {
      btn.textContent = '⬇️ Download Ticket as PDF';
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

  return (
    <div style={{ 
      fontFamily: "'Segoe UI', sans-serif", 
      minWidth: "auto", 
      width: "100%",
      maxWidth: "100%",
      padding: "0"
    }}>
      {/* HEADER */}
      <div style={{ textAlign: "center", marginBottom: "24px" }}>
        <div style={{ fontSize: "40px", marginBottom: "8px" }}>🎟️</div>
        <h2 style={{ fontSize: "20px", fontWeight: "700", color: "#1a1a2e", margin: "0 0 4px" }}>Print Ticket</h2>
        <p style={{ fontSize: "13px", color: "#888", margin: 0 }}>Enter your Ticket ID to view &amp; download</p>
      </div>

      {error && (
        <div style={{ 
          background: "#fff1f0", 
          border: "1px solid #ffccc7", 
          borderRadius: "8px", 
          padding: "10px 14px", 
          marginBottom: "16px", 
          color: "#cf1322", 
          fontSize: "13px",
          wordBreak: "break-word"
        }}>
          {error}
        </div>
      )}

      <form onSubmit={handlePrint} style={{ width: "100%" }}>
        {/* Ticket ID */}
        <div style={{ marginBottom: "14px" }}>
          <label style={{ display: "block", fontSize: "12px", color: "#555", fontWeight: "600", marginBottom: "6px" }}>
            Ticket ID (TIN / PNR)
          </label>
          <input
            type="text"
            value={tin}
            onChange={(e) => setTin(e.target.value.toUpperCase())}
            placeholder="e.g. 4BZ3XCPH"
            required
            readOnly={!!prefillTin}
            style={{
              width: "100%", 
              border: "1.5px solid #e5e7eb", 
              borderRadius: "8px",
              padding: "12px 14px", 
              fontSize: "14px", 
              outline: "none",
              boxSizing: "border-box", 
              fontWeight: "700", 
              letterSpacing: "1px",
              background: prefillTin ? "#f9f9f9" : "white"
            }}
            onFocus={e => { if (!prefillTin) e.target.style.borderColor = "#fd561e"; }}
            onBlur={e => e.target.style.borderColor = "#e5e7eb"}
          />
        </div>

        {/* Cloudflare Turnstile CAPTCHA */}
        <div style={{ marginBottom: "20px" }}>
          <label style={{ display: "block", fontSize: "12px", color: "#555", fontWeight: "600", marginBottom: "6px" }}>
            Security Verification
          </label>
          <div
            ref={turnstileRef}
            style={{ display: "flex", justifyContent: "center" }}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          style={{
            width: "100%",
            background: loading ? "#ffb89d" : "linear-gradient(135deg, #fd561e, #ff8c42)",
            color: "white", 
            border: "none", 
            borderRadius: "10px",
            padding: "14px", 
            fontSize: "15px", 
            fontWeight: "700",
            cursor: loading ? "not-allowed" : "pointer"
          }}
        >
          {loading ? "Fetching Ticket..." : "🖨️ Print Ticket"}
        </button>
      </form>
    </div>
  );
};

export default PrintTicketModal;