import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";

const GuestBookingsPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showPrint, setShowPrint] = useState(false);


  const mobile = location.state?.mobile || "";

  useEffect(() => {
    if (!mobile) { navigate("/"); return; }
    const data = location.state?.bookings || [];
    setBookings(data);
    setLoading(false);
  }, []);

  const formatDate = (d) => {
    if (!d || d === "—") return "—";
    try {
      const cleaned = d.toString().replace(" ", "T").replace(/\.$/, "");
      const date = new Date(cleaned);
      if (isNaN(date.getTime())) return d;
      return date.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
    } catch { return d; }
  };

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", background: "#f0f2f5", display: "flex", alignItems: "center", justifyContent: "center", paddingTop: "80px" }}>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        <div style={{ textAlign: "center" }}>
          <div style={{ width: "48px", height: "48px", border: "4px solid #fd561e", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 0.8s linear infinite", margin: "0 auto 16px" }}></div>
          <p style={{ color: "#666", fontSize: "15px", fontFamily: "Segoe UI, sans-serif" }}>Loading your trips...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "#f0f2f5", paddingTop: "80px", paddingBottom: "40px", fontFamily: "'Segoe UI', sans-serif" }}>

      {/* HEADER */}
      <div style={{ background: "linear-gradient(135deg, #fd561e 0%, #ff8c42 100%)", padding: "28px 0 52px" }}>
        <div style={{ maxWidth: "860px", margin: "0 auto", padding: "0 20px" }}>
          <h1 style={{ color: "white", fontSize: "26px", fontWeight: "700", margin: 0 }}>My Bookings</h1>
          <p style={{ color: "rgba(255,255,255,0.85)", fontSize: "14px", marginTop: "5px" }}>
            {bookings.length} booking{bookings.length !== 1 ? "s" : ""} found
          </p>
        </div>
      </div>

      <div style={{ maxWidth: "860px", margin: "-30px auto 0", padding: "0 20px" }}>

        {error && (
          <div style={{ background: "#fff1f0", border: "1px solid #ffccc7", borderRadius: "10px", padding: "16px", marginBottom: "16px", color: "#cf1322" }}>
            {error}
          </div>
        )}

        {bookings.length === 0 ? (
          <div style={{ background: "white", borderRadius: "16px", boxShadow: "0 2px 16px rgba(0,0,0,0.08)", padding: "60px 20px", textAlign: "center" }}>
            <div style={{ fontSize: "56px", marginBottom: "12px" }}>🚌</div>
            <h3 style={{ fontSize: "18px", color: "#333", marginBottom: "8px" }}>No trips found!</h3>
            <p style={{ color: "#888", fontSize: "14px", marginBottom: "24px" }}>No bookings found for this account.</p>
            <button
              onClick={() => navigate("/")}
              style={{ background: "#fd561e", color: "white", border: "none", borderRadius: "8px", padding: "12px 28px", fontSize: "15px", fontWeight: "600", cursor: "pointer" }}
            >
              Book a Ticket
            </button>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {bookings.map((booking, index) => (
              <BookingCard key={index} booking={booking} formatDate={formatDate} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const BookingCard = ({ booking, formatDate }) => {
  const [hovered, setHovered] = useState(false);
   const [showPrint, setShowPrint] = useState(false);

  const ptripParts = (booking.ptrip || "").split(",").map(s => s.trim());
  const source      = ptripParts[0] || "—";
  const destination = ptripParts[1] || "—";
  const doj         = booking.pdoj   || "—";
  const ticketId    = booking.tin_ticket || booking.blk_ticket || "—";
  const fare        = booking.fare   || booking.tcost       || "—";
  const pname       = booking.pname  || "Guest";
  const pmobile     = booking.pmobile || "—";

  const rawStatus = booking.status?.trim();
  const status = rawStatus || "Confirmed";
  const statusStyles = {
    Confirmed: { bg: "#f0fdf4", text: "#16a34a", dot: "#22c55e" },
    Cancelled: { bg: "#fff1f0", text: "#dc2626", dot: "#ef4444" },
    Pending:   { bg: "#fffbeb", text: "#d97706", dot: "#f59e0b" },
  };
  const sc = statusStyles[status] || statusStyles["Confirmed"];

  const handlePrint = () => {
    const printContent = `
      <html><head><title>Ticket - ${ticketId}</title>
      <style>
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: 'Segoe UI', sans-serif; background: #f5f5f5; padding: 24px; }
        .ticket { background: white; border-radius: 14px; overflow: hidden; max-width: 580px; margin: 0 auto; box-shadow: 0 4px 24px rgba(0,0,0,0.12); }
        .header { background: linear-gradient(135deg, #fd561e, #ff8c42); color: white; padding: 22px 28px; }
        .header h2 { font-size: 20px; font-weight: 700; margin-bottom: 4px; }
        .header p { font-size: 12px; opacity: 0.85; }
        .body { padding: 24px 28px; }
        .route { display: flex; align-items: center; justify-content: space-between; margin-bottom: 22px; }
        .city { font-size: 26px; font-weight: 800; color: #1a1a2e; }
        .lbl { font-size: 11px; color: #999; margin-top: 3px; }
        .arrow { flex: 1; margin: 0 16px; display: flex; align-items: center; gap: 6px; }
        .line { flex: 1; height: 2px; background: linear-gradient(to right, #fd561e, #ff8c42); }
        .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; background: #f8f9ff; border-radius: 10px; padding: 16px 18px; }
        .info-item label { display: block; font-size: 10px; color: #999; text-transform: uppercase; margin-bottom: 4px; }
        .info-item span { font-size: 14px; font-weight: 700; color: #1a1a2e; }
        .orange { color: #fd561e !important; }
        .footer { text-align: center; font-size: 11px; color: #aaa; padding: 14px; background: #fafafa; }
      </style></head>
      <body>
        <div class="ticket">
          <div class="header">
            <h2>🚌 BOBROS — Bus Ticket</h2>
            <p>Booking Date: ${formatDate(booking.bdat)}</p>
          </div>
          <div class="body">
            <div class="route">
              <div><div class="city">${source}</div><div class="lbl">Origin</div></div>
              <div class="arrow"><div class="line"></div><span style="font-size:18px">🚌</span><div class="line"></div></div>
              <div style="text-align:right"><div class="city">${destination}</div><div class="lbl">Destination</div></div>
            </div>
            <div class="info-grid">
              <div class="info-item"><label>Date of Journey</label><span>${formatDate(doj)}</span></div>
              <div class="info-item"><label>Ticket ID</label><span class="orange">${ticketId}</span></div>
              <div class="info-item"><label>Passenger</label><span>${pname}</span></div>
              <div class="info-item"><label>Mobile</label><span>${pmobile}</span></div>
              <div class="info-item"><label>Fare Paid</label><span>₹${fare}</span></div>
              <div class="info-item"><label>Gender / Age</label><span>${booking.psex || "—"} / ${booking.page || "—"} yrs</span></div>
            </div>
          </div>
          <div class="footer">Thank you for choosing BOBROS • Have a safe journey! 🙏</div>
        </div>
      </body></html>
    `;
    const win = window.open("", "_blank");
    win.document.write(printContent);
    win.document.close();
    win.print();
  };

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: "white", borderRadius: "16px",
        boxShadow: hovered ? "0 8px 32px rgba(0,0,0,0.12)" : "0 2px 12px rgba(0,0,0,0.06)",
        overflow: "hidden", transition: "box-shadow 0.25s ease",
        border: "1px solid #f0f0f0"
      }}
    >
      {/* TOP BAR */}
      <div style={{ background: "#fafafa", borderBottom: "1px solid #f0f0f0", padding: "11px 20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span style={{ fontSize: "16px" }}>🚌</span>
          <span style={{ fontSize: "12px", color: "#888" }}>Booked on {formatDate(booking.bdat)}</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "5px", background: sc.bg, padding: "3px 12px", borderRadius: "20px" }}>
          <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: sc.dot }}></div>
          <span style={{ fontSize: "12px", fontWeight: "600", color: sc.text }}>{status}</span>
        </div>
      </div>

      {/* ROUTE */}
      <div style={{ padding: "20px 24px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px" }}>
          <div>
            <div style={{ fontSize: "10px", color: "#aaa", textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: "4px" }}>From</div>
            <div style={{ fontSize: "22px", fontWeight: "800", color: "#1a1a2e" }}>{source}</div>
          </div>
          <div style={{ flex: 1, margin: "0 16px", display: "flex", alignItems: "center" }}>
            <div style={{ flex: 1, height: "2px", background: "linear-gradient(to right, #fd561e, #ff8c42)" }}></div>
            <span style={{ margin: "0 8px", fontSize: "18px" }}>🚌</span>
            <div style={{ flex: 1, height: "2px", background: "linear-gradient(to right, #ff8c42, #fd561e)" }}></div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: "10px", color: "#aaa", textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: "4px" }}>To</div>
            <div style={{ fontSize: "22px", fontWeight: "800", color: "#1a1a2e" }}>{destination}</div>
          </div>
        </div>

        {/* INFO GRID */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", background: "#f8f9ff", borderRadius: "10px", padding: "14px 16px", gap: "10px" }}>
          <div>
            <div style={{ fontSize: "10px", color: "#999", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "3px" }}>Date of Journey</div>
            <div style={{ fontSize: "14px", fontWeight: "700", color: "#1a1a2e" }}>{formatDate(doj)}</div>
          </div>
          <div>
            <div style={{ fontSize: "10px", color: "#999", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "3px" }}>Ticket ID</div>
            <div style={{ fontSize: "14px", fontWeight: "700", color: "#fd561e" }}>{ticketId}</div>
          </div>
          <div>
            <div style={{ fontSize: "10px", color: "#999", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "3px" }}>Fare Paid</div>
            <div style={{ fontSize: "14px", fontWeight: "700", color: "#1a1a2e" }}>₹{fare}</div>
          </div>
        </div>

        {/* PASSENGER */}
        <div style={{ marginTop: "14px", display: "flex", alignItems: "center", gap: "10px" }}>
          <div style={{ width: "32px", height: "32px", borderRadius: "50%", background: "linear-gradient(135deg, #fd561e, #ff8c42)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "14px", color: "white", fontWeight: "700", flexShrink: 0 }}>
            {pname[0].toUpperCase()}
          </div>
          <div>
            <div style={{ fontSize: "13px", fontWeight: "600", color: "#333" }}>{pname}</div>
            <div style={{ fontSize: "11px", color: "#999" }}>{booking.psex || ""}{booking.page ? ` • ${booking.page} yrs` : ""}</div>
          </div>
        </div>
      </div>

      {/* DASHED DIVIDER */}
      <div style={{ borderTop: "2px dashed #f0f0f0", margin: "0 20px" }}></div>

      {/* PRINT BUTTON */}
     <div style={{ padding: "12px 20px", display: "flex", justifyContent: "flex-end" }}>
  <button
    onClick={() => setShowPrint(true)}
    style={{
      display: "flex", alignItems: "center", gap: "6px",
      background: "white", border: "1.5px solid #fd561e", color: "#fd561e",
      borderRadius: "8px", padding: "8px 20px", fontSize: "13px",
      fontWeight: "600", cursor: "pointer", transition: "all 0.2s"
    }}
    onMouseEnter={e => { e.currentTarget.style.background = "#fd561e"; e.currentTarget.style.color = "white"; }}
    onMouseLeave={e => { e.currentTarget.style.background = "white"; e.currentTarget.style.color = "#fd561e"; }}
  >
    🖨️ Print Ticket
  </button>
</div>
{/* Print Modal */}
{showPrint && (
  <div style={{
    position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)",
    display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9999
  }}>
    <div style={{ background: "white", borderRadius: "16px", padding: "32px", width: "420px", position: "relative" }}>
      <button
        onClick={() => setShowPrint(false)}
        style={{ position: "absolute", top: "16px", right: "16px", background: "none", border: "none", fontSize: "18px", cursor: "pointer", color: "#999" }}
      >✕</button>
      {/* ✅ tin_ticket prefill చేయి — captcha skip చేయి direct print */}
      <PrintTicketModal
        onClose={() => setShowPrint(false)}
        prefillTin={booking.tin_ticket || ""}
      />
    </div>
  </div>
)}
    </div>
  );
};

export default GuestBookingsPage;