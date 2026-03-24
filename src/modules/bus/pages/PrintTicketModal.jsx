// src/modules/bus/pages/PrintTicketModal.jsx
import { useState } from "react";
import axios from "axios";

const PrintTicketModal = ({ onClose, prefillTin = "" }) => {
  const [tin, setTin] = useState(prefillTin);
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

    if (!tin.trim()) { setError("Please enter Ticket ID."); return; }
    if (captchaInput.trim() !== captchaValue.answer) { setError("Incorrect captcha. Please try again."); return; }

    try {
      setLoading(true);
      const res = await axios.get(`/printTicket?tin=${tin.trim()}`);
      console.log("Print Ticket Data:", res.data);

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
    // ── Parse all fields from API response ──
    const sourceCity       = d.sourceCity        || d.pickupLocation   || "—";
    const destCity         = d.destinationCity   || d.dropLocation     || "—";
    const pnr              = d.pnr               || d.tin              || tin;
    const bookingId        = d.tin               || d.pnr              || tin;
    const doj              = d.doj               || "—";
    const travels          = d.travels           || "—";
    const busType          = d.busType           || "—";
    const status           = d.status            || "CONFIRMED";
    const operatorContact  = d.pickUpContactNo   || "—";

    // Passenger
    const passenger        = d.inventoryItems?.passenger || {};
    const pname            = passenger.name       || "—";
    const pmobile          = passenger.mobile     || "—";
    const pgender          = passenger.gender     || "—";
    const page             = passenger.age        || "—";
    const seatName         = d.inventoryItems?.seatName || "—";

    // Fare
    const baseFare         = d.inventoryItems?.baseFare         || "0";
    const serviceTax       = d.inventoryItems?.serviceTax       || "0";
    const totalFare        = d.inventoryItems?.grandTotalFare   || d.inventoryItems?.fare || "0";

    // Boarding
    const boardingPoint    = d.pickupLocation    || "—";
    const boardingAddress  = d.pickUpLocationAddress || "—";
    const boardingLandmark = d.pickupLocationLandmark || "—";
    const boardingContact  = d.pickUpContactNo   || "—";

    // Drop
    const dropPoint        = d.dropLocation      || "—";
    const dropAddress      = d.dropLocationAddress || "—";

    // Times — stored as minutes from midnight (e.g. 1125 = 18:45)
    const toTime = (mins) => {
      if (!mins) return "—";
      const m = parseInt(mins);
      if (isNaN(m)) return mins;
      const h = Math.floor(m / 60);
      const min = m % 60;
      return `${String(h).padStart(2, "0")}:${String(min).padStart(2, "0")}`;
    };

    const departureTime    = toTime(d.pickupTime || d.primeDepartureTime || d.firstBoardingPointTime);
    const dropTime         = toTime(d.dropTime);
    const reportingTime    = toTime(d.firstBoardingPointTime);
    const serviceStartTime = d.serviceStartTime || "—";

    // Dates
    const formatDate = (dt) => {
      if (!dt || dt === "—") return "—";
      try {
        const date = new Date(dt.toString().replace(" ", "T").replace(/\.$/, ""));
        if (isNaN(date.getTime())) return dt;
        return date.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
      } catch { return dt; }
    };

    const dojFormatted     = formatDate(doj);
    const dateOfIssue      = formatDate(d.dateOfIssue);
    const printTimestamp   = new Date().toLocaleString("en-IN", {
      day: "2-digit", month: "2-digit", year: "numeric",
      hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false
    }).replace(",", "");

    // Status color
    const statusColor = status === "CANCELLED" ? "#dc2626" : status === "CONFIRMED" ? "#16a34a" : "#d97706";

    // Logo absolute URL
    const logoUrl = `${window.location.origin}/assets/Bobros_logo.png`;

    const printContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Ticket - ${pnr}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: 'Arial', sans-serif;
      background: #f5f5f5;
      padding: 20px;
      color: #333;
      font-size: 13px;
    }
    .page {
      background: white;
      max-width: 720px;
      margin: 0 auto;
      border: 1px solid #ddd;
    }

    /* ── HEADER ── */
    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 18px 24px;
      border-bottom: 2px solid #eee;
    }
    .logo-img { height: 36px; width: auto; object-fit: contain; }
    .logo-fallback {
      font-size: 28px; font-weight: 900;
      color: #fd561e; letter-spacing: -1px; display: none;
    }
    .logo-fallback sup { font-size: 10px; color: #fd561e; }
    .company-info {
      text-align: right;
      font-size: 11px;
      color: #555;
      line-height: 1.6;
    }
    .company-info strong { color: #333; font-size: 12px; }

    /* ── ROUTE BAR ── */
    .route-bar {
      background: #fafafa;
      border-bottom: 1px solid #eee;
      padding: 14px 24px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .route-cities {
      font-size: 20px;
      font-weight: 800;
      color: #1a1a2e;
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .route-arrow { color: #fd561e; font-size: 18px; }
    .route-meta { text-align: right; font-size: 12px; color: #555; line-height: 1.8; }
    .route-meta strong { color: #1a1a2e; }

    /* ── OPERATOR ── */
    .operator-bar {
      padding: 8px 24px;
      background: #fff8f5;
      border-bottom: 1px solid #ffe4d6;
      font-size: 12px;
      color: #555;
      display: flex;
      justify-content: space-between;
    }
    .operator-bar strong { color: #fd561e; }

    /* ── TABLE SECTION ── */
    .section { padding: 14px 24px; border-bottom: 1px solid #eee; }
    .section-title {
      font-size: 11px;
      color: #999;
      text-transform: uppercase;
      letter-spacing: 0.8px;
      margin-bottom: 10px;
      padding-bottom: 6px;
      border-bottom: 1px solid #f0f0f0;
    }
    table { width: 100%; border-collapse: collapse; }
    table th {
      font-size: 10px;
      color: #999;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      font-weight: 600;
      text-align: left;
      padding: 4px 8px 4px 0;
      white-space: nowrap;
    }
    table td {
      font-size: 12px;
      font-weight: 700;
      color: #1a1a2e;
      padding: 4px 8px 4px 0;
    }
    table td.orange { color: #fd561e; }
    table td.status {
      color: ${statusColor};
      font-weight: 800;
    }
    table tr:not(:last-child) td,
    table tr:not(:last-child) th {
      border-bottom: 1px solid #f9f9f9;
    }

    /* ── FARE TABLE ── */
    .fare-table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 4px;
    }
    .fare-table th {
      background: #f8f9ff;
      font-size: 10px;
      color: #888;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      padding: 8px 12px;
      text-align: left;
      border: 1px solid #eee;
    }
    .fare-table td {
      padding: 8px 12px;
      font-size: 13px;
      font-weight: 700;
      color: #1a1a2e;
      border: 1px solid #eee;
    }
    .fare-table td:last-child { color: #fd561e; }

    /* ── ADDRESS BLOCK ── */
    .address-block {
      background: #f8f9ff;
      border-radius: 6px;
      padding: 10px 14px;
      margin-top: 6px;
      font-size: 12px;
      line-height: 1.7;
      color: #444;
    }
    .address-block strong { color: #fd561e; display: block; margin-bottom: 2px; }

    /* ── TERMS ── */
    .terms {
      padding: 14px 24px;
      border-top: 2px solid #eee;
      font-size: 11px;
      color: #555;
      line-height: 1.7;
    }
    .terms h3 {
      font-size: 12px;
      color: #1a1a2e;
      margin: 10px 0 4px;
    }
    .terms ul {
      padding-left: 18px;
      margin: 4px 0;
    }
    .terms ul li { margin-bottom: 3px; }
    .not-responsible {
      border: 1px solid #eee;
      border-radius: 6px;
      padding: 10px 14px;
      margin-top: 8px;
    }

    /* ── FOOTER ── */
    .footer {
      background: #f9f9f9;
      border-top: 1px solid #eee;
      padding: 10px 24px;
      font-size: 10px;
      color: #aaa;
      text-align: center;
    }

    /* ── DOWNLOAD BUTTON (screen only) ── */
    .download-btn {
      display: block;
      max-width: 720px;
      margin: 16px auto 0;
      background: linear-gradient(135deg, #fd561e, #ff8c42);
      color: white;
      border: none;
      border-radius: 10px;
      padding: 14px;
      font-size: 15px;
      font-weight: 700;
      cursor: pointer;
      text-align: center;
      font-family: 'Arial', sans-serif;
    }
    .download-btn:hover { opacity: 0.92; }
    .download-btn:disabled { opacity: 0.6; cursor: not-allowed; }

    @media print {
      body { background: white; padding: 0; }
      .page { border: none; }
      .download-btn { display: none !important; }
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
      <span style="font-size:11px;color:${statusColor};background:${statusColor}18;padding:2px 10px;border-radius:20px;font-weight:700;margin-left:6px;">${status}</span>
    </div>
    <div class="route-meta">
      <strong>DOJ: ${dojFormatted}</strong><br/>
    </div>
  </div>

  <!-- OPERATOR -->
  <div class="operator-bar">
    <span>Operator: <strong>${travels}</strong></span>
    <span>Operator Contact: <strong>${operatorContact}</strong></span>
  </div>

  <!-- PASSENGER DETAILS TABLE -->
  <div class="section">
    <table>
      <thead>
        <tr>
          <th>Passenger Name(s)</th>
          <th>Seat Number(s)</th>
          <th>Bus Type</th>
          <th>Booking Status</th>
          <th>PNR</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>${pname}</td>
          <td>${seatName}</td>
          <td>${busType}</td>
          <td class="status">${status}</td>
          <td class="orange">${pnr}</td>
        </tr>
      </tbody>
    </table>
  </div>

  <!-- BOOKING INFO TABLE -->
  <div class="section">
    <table>
      <thead>
        <tr>
          <th>Booking ID</th>
          <th>Boarding Point</th>
          <th>Pick Up Time</th>
          <th>Reporting Time</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td class="orange">${bookingId}</td>
          <td>${boardingPoint}</td>
          <td>${departureTime}</td>
          <td>${reportingTime}</td>
        </tr>
      </tbody>
    </table>
  </div>

  <!-- BOARDING POINT ADDRESS -->
  <div class="section">
    <div class="section-title">Boarding Point Address</div>
    <div class="address-block">
      <strong>Location: ${boardingPoint}</strong>
      Address: ${boardingAddress}<br/>
      Landmark: ${boardingLandmark}<br/>
      ${boardingContact !== "—" ? `Contact: ${boardingContact}` : ""}
    </div>
  </div>

  <!-- FARE BREAKUP -->
  <div class="section">
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
          <td>Rs. ${baseFare}</td>
          <td>Rs. ${serviceTax}</td>
          <td>Rs. ${totalFare}</td>
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
    This ticket is generated electronically at www.bobrosone.com, Ticket Print Time Stamp: ${printTimestamp}
  </div>

</div>

<!-- DOWNLOAD BUTTON -->
<button class="download-btn" id="dlBtn">
  ⬇️ Download Ticket
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

      // A4 page size
      const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
      const pageW = pdf.internal.pageSize.getWidth();
      const pageH = pdf.internal.pageSize.getHeight();

      // Scale image to fit A4 width
      const imgW = pageW;
      const imgH = (canvas.height * pageW) / canvas.width;

      // If content taller than A4, add extra pages
      let yPos = 0;
      let remaining = imgH;
      let firstPage = true;

      while (remaining > 0) {
        if (!firstPage) pdf.addPage();
        const sliceH = Math.min(remaining, pageH);
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
      btn.textContent = '⬇️ Download Ticket';
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
    <div style={{ fontFamily: "'Segoe UI', sans-serif", minWidth: "340px" }}>
      {/* HEADER */}
      <div style={{ textAlign: "center", marginBottom: "24px" }}>
        <div style={{ fontSize: "40px", marginBottom: "8px" }}>🎟️</div>
        <h2 style={{ fontSize: "20px", fontWeight: "700", color: "#1a1a2e", margin: "0 0 4px" }}>Print Ticket</h2>
        <p style={{ fontSize: "13px", color: "#888", margin: 0 }}>Enter your Ticket ID to view &amp; download</p>
      </div>

      {error && (
        <div style={{ background: "#fff1f0", border: "1px solid #ffccc7", borderRadius: "8px", padding: "10px 14px", marginBottom: "16px", color: "#cf1322", fontSize: "13px" }}>
          {error}
        </div>
      )}

      <form onSubmit={handlePrint}>
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
              width: "100%", border: "1.5px solid #e5e7eb", borderRadius: "8px",
              padding: "10px 14px", fontSize: "14px", outline: "none",
              boxSizing: "border-box", fontWeight: "700", letterSpacing: "2px",
              background: prefillTin ? "#f9f9f9" : "white"
            }}
            onFocus={e => { if (!prefillTin) e.target.style.borderColor = "#fd561e"; }}
            onBlur={e => e.target.style.borderColor = "#e5e7eb"}
          />
        </div>

        {/* CAPTCHA */}
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
            style={{
              width: "100%", border: "1.5px solid #e5e7eb", borderRadius: "8px",
              padding: "10px 14px", fontSize: "14px", outline: "none", boxSizing: "border-box"
            }}
            onFocus={e => e.target.style.borderColor = "#fd561e"}
            onBlur={e => e.target.style.borderColor = "#e5e7eb"}
          />
        </div>

        {/* ✅ CHANGED: "🖨️ Print Ticket" */}
        <button
          type="submit"
          disabled={loading}
          style={{
            width: "100%",
            background: loading ? "#ffb89d" : "linear-gradient(135deg, #fd561e, #ff8c42)",
            color: "white", border: "none", borderRadius: "10px",
            padding: "13px", fontSize: "15px", fontWeight: "700",
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