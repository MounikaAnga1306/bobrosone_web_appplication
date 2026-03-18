import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const GuestBookings = ({ onClose }) => {
    const navigate = useNavigate();
  const [step, setStep] = useState("form");
  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("");
  const [otp, setOtp] = useState("");
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setError("");
    if (!email.trim() || !mobile.trim()) { setError("Please enter both email and mobile."); return; }
    if (mobile.length !== 10) { setError("Please enter a valid 10-digit mobile number."); return; }
    try {
      setLoading(true);
      const res = await axios.post("/guestBookings/verify", { email, mobile });
      console.log("Verify Response:", res.data);
      if (res.data?.success) {
        setStep("otp");
      } else {
        setError(res.data?.message || "Failed to send OTP. Please try again.");
      }
    } catch (err) {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
  e.preventDefault();
  setError("");
  if (!otp.trim() || otp.length < 4) { setError("Please enter a valid OTP."); return; }
  try {
    setLoading(true);
    const res = await axios.post("/guestBookings/data", { email, mobile, otp });
    console.log("Bookings Response:", res.data);
    if (res.data?.success) {
      setShowSuccess(true);
      setTimeout(() => {
        onClose();
        navigate("/guest-bookings", {
          state: {
            bookings: res.data.bookings || [],
            mobile: mobile
          }
        });
      }, 1800);
    } else {
      setError(res.data?.message || "Invalid OTP. Please try again.");
    }
  } catch (err) {
    setError(err.response?.data?.message || "Invalid OTP. Please try again.");
  } finally {
    setLoading(false);
  }
};

  // ── OTP SUCCESS POPUP ──
  if (showSuccess) {
    return (
      <div style={{ textAlign: "center", padding: "40px 20px", fontFamily: "'Segoe UI', sans-serif" }}>
        <div style={{
          width: "72px", height: "72px", borderRadius: "50%",
          background: "linear-gradient(135deg, #22c55e, #16a34a)",
          display: "flex", alignItems: "center", justifyContent: "center",
          margin: "0 auto 16px", fontSize: "32px"
        }}>✓</div>
        <h2 style={{ fontSize: "20px", fontWeight: "700", color: "#1a1a2e", marginBottom: "8px" }}>
          OTP Verified Successfully!
        </h2>
        <p style={{ color: "#888", fontSize: "14px" }}>Loading your bookings...</p>
        <div style={{
          width: "40px", height: "4px", background: "#fd561e",
          borderRadius: "2px", margin: "16px auto 0",
          animation: "grow 1.8s ease forwards"
        }}></div>
        <style>{`@keyframes grow { from { width: 0px; } to { width: 200px; } }`}</style>
      </div>
    );
  }

  // ── BOOKINGS VIEW ──
  if (step === "bookings") {
    return (
      <div style={{ fontFamily: "'Segoe UI', sans-serif" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "20px" }}>
          <button
            onClick={() => { setStep("form"); setOtp(""); setBookings([]); }}
            style={{ background: "none", border: "1.5px solid #ddd", borderRadius: "8px", padding: "6px 14px", cursor: "pointer", fontSize: "13px", color: "#555" }}
          >
            ← Back
          </button>
          <h2 style={{ fontSize: "18px", fontWeight: "700", color: "#1a1a2e", margin: 0 }}>Your Trips</h2>
          <span style={{ fontSize: "13px", color: "#888" }}>({bookings.length} found)</span>
        </div>

        {bookings.length === 0 ? (
          <div style={{ textAlign: "center", padding: "40px 20px" }}>
            <div style={{ fontSize: "48px", marginBottom: "12px" }}>🚌</div>
            <p style={{ color: "#888", fontSize: "15px" }}>No bookings found for this account.</p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "16px", maxHeight: "65vh", overflowY: "auto", paddingRight: "4px" }}>
            {bookings.map((booking, index) => (
              <GuestBookingCard key={index} booking={booking} />
            ))}
          </div>
        )}
      </div>
    );
  }

  // ── FORM / OTP ──
  return (
    <div style={{ fontFamily: "'Segoe UI', sans-serif", minWidth: "340px" }}>
      <div style={{ textAlign: "center", marginBottom: "24px" }}>
        <div style={{ fontSize: "40px", marginBottom: "8px" }}>🎟️</div>
        <h2 style={{ fontSize: "20px", fontWeight: "700", color: "#1a1a2e", margin: "0 0 4px" }}>
          {step === "form" ? "Find Your Bookings" : "Enter OTP"}
        </h2>
        <p style={{ fontSize: "13px", color: "#888", margin: 0 }}>
          {step === "form" ? "Enter your details to retrieve your trip history" : `OTP sent to +91 ${mobile}. Please check your phone.`}
        </p>
      </div>

      {/* STEP INDICATOR */}
      <div style={{ display: "flex", alignItems: "center", marginBottom: "24px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <div style={{ width: "24px", height: "24px", borderRadius: "50%", background: "#fd561e", color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "12px", fontWeight: "700" }}>
            {step === "otp" ? "✓" : "1"}
          </div>
          <span style={{ fontSize: "12px", color: step === "form" ? "#fd561e" : "#22c55e", fontWeight: "600" }}>Details</span>
        </div>
        <div style={{ flex: 1, height: "2px", background: step === "otp" ? "#fd561e" : "#e5e7eb", margin: "0 8px" }}></div>
        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <div style={{ width: "24px", height: "24px", borderRadius: "50%", background: step === "otp" ? "#fd561e" : "#e5e7eb", color: step === "otp" ? "white" : "#aaa", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "12px", fontWeight: "700" }}>2</div>
          <span style={{ fontSize: "12px", color: step === "otp" ? "#fd561e" : "#aaa", fontWeight: step === "otp" ? "600" : "400" }}>Verify OTP</span>
        </div>
      </div>

      {error && (
        <div style={{ background: "#fff1f0", border: "1px solid #ffccc7", borderRadius: "8px", padding: "10px 14px", marginBottom: "16px", color: "#cf1322", fontSize: "13px" }}>
          {error}
        </div>
      )}

      {/* STEP 1 */}
      {step === "form" && (
        <form onSubmit={handleSendOtp}>
          <div style={{ marginBottom: "14px" }}>
            <label style={{ display: "block", fontSize: "12px", color: "#555", fontWeight: "600", marginBottom: "6px" }}>Email Address</label>
            <input
              type="email" value={email} onChange={(e) => setEmail(e.target.value)}
              placeholder="abc@gmail.com" required
              style={{ width: "100%", border: "1.5px solid #e5e7eb", borderRadius: "8px", padding: "10px 14px", fontSize: "14px", outline: "none", boxSizing: "border-box" }}
              onFocus={e => e.target.style.borderColor = "#fd561e"}
              onBlur={e => e.target.style.borderColor = "#e5e7eb"}
            />
          </div>
          <div style={{ marginBottom: "20px" }}>
            <label style={{ display: "block", fontSize: "12px", color: "#555", fontWeight: "600", marginBottom: "6px" }}>Mobile Number</label>
            <div style={{ display: "flex", border: "1.5px solid #e5e7eb", borderRadius: "8px", overflow: "hidden" }}>
              <span style={{ padding: "10px 12px", background: "#f9f9f9", fontSize: "14px", color: "#555", borderRight: "1px solid #e5e7eb" }}>+91</span>
              <input
                type="tel" value={mobile} onChange={(e) => setMobile(e.target.value)}
                placeholder="Enter 10-digit mobile" maxLength="10" required
                style={{ flex: 1, border: "none", padding: "10px 14px", fontSize: "14px", outline: "none" }}
              />
            </div>
          </div>
          <button type="submit" disabled={loading}
            style={{ width: "100%", background: loading ? "#ffb89d" : "linear-gradient(135deg, #fd561e, #ff8c42)", color: "white", border: "none", borderRadius: "10px", padding: "13px", fontSize: "15px", fontWeight: "700", cursor: loading ? "not-allowed" : "pointer" }}
          >
            {loading ? "Sending OTP..." : "Send OTP →"}
          </button>
        </form>
      )}

      {/* STEP 2 */}
      {step === "otp" && (
        <form onSubmit={handleVerifyOtp}>
          <div style={{ marginBottom: "8px" }}>
            <label style={{ display: "block", fontSize: "12px", color: "#555", fontWeight: "600", marginBottom: "6px" }}>Enter OTP</label>
            <input
              type="text" value={otp} onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
              placeholder="● ● ● ● ● ●" maxLength="6" required autoFocus
              style={{ width: "100%", border: "1.5px solid #e5e7eb", borderRadius: "8px", padding: "12px 14px", fontSize: "24px", fontWeight: "700", letterSpacing: "10px", textAlign: "center", outline: "none", boxSizing: "border-box" }}
              onFocus={e => e.target.style.borderColor = "#fd561e"}
              onBlur={e => e.target.style.borderColor = "#e5e7eb"}
            />
          </div>
          <p style={{ fontSize: "12px", color: "#aaa", marginBottom: "20px", textAlign: "center" }}>
            Didn't receive?{" "}
            <span onClick={() => { setStep("form"); setError(""); setOtp(""); }} style={{ color: "#fd561e", cursor: "pointer", fontWeight: "600" }}>
              Resend OTP
            </span>
          </p>
          <button type="submit" disabled={loading}
            style={{ width: "100%", background: loading ? "#ffb89d" : "linear-gradient(135deg, #fd561e, #ff8c42)", color: "white", border: "none", borderRadius: "10px", padding: "13px", fontSize: "15px", fontWeight: "700", cursor: loading ? "not-allowed" : "pointer" }}
          >
            {loading ? "Verifying..." : "View My Bookings →"}
          </button>
          <button type="button" onClick={() => { setStep("form"); setError(""); setOtp(""); }}
            style={{ width: "100%", background: "none", border: "none", color: "#888", fontSize: "13px", marginTop: "10px", cursor: "pointer", padding: "6px" }}
          >
            ← Change Details
          </button>
        </form>
      )}
    </div>
  );
};

// ── BOOKING CARD ──
const GuestBookingCard = ({ booking }) => {
  const [hovered, setHovered] = useState(false);

  const ptripParts = (booking.ptrip || "").split(",").map(s => s.trim());
  const source      = ptripParts[0] || "—";
  const destination = ptripParts[1] || "—";
  const doj         = booking.pdoj   || "—";
  const ticketId    = booking.tic_id || booking.blk_ticket || "—";
  const fare        = booking.fare   || booking.tcost       || "—";
  const pname       = booking.pname  || "Guest";
  const pmobile     = booking.pmobile || "—";

  const formatDate = (d) => {
    if (!d || d === "—") return "—";
    try {
      const cleaned = d.toString().replace(" ", "T");
      const date = new Date(cleaned);
      if (isNaN(date.getTime())) return d;
      return date.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
    } catch { return d; }
  };

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
        .label { font-size: 11px; color: #999; margin-top: 3px; }
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
          <div class="header"><h2>🚌 BOBROS — Bus Ticket</h2><p>Booking Date: ${formatDate(booking.bdat)}</p></div>
          <div class="body">
            <div class="route">
              <div><div class="city">${source}</div><div class="label">Origin</div></div>
              <div class="arrow"><div class="line"></div><span style="font-size:18px">🚌</span><div class="line"></div></div>
              <div style="text-align:right"><div class="city">${destination}</div><div class="label">Destination</div></div>
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
          onClick={handlePrint}
          style={{ display: "flex", alignItems: "center", gap: "6px", background: "white", border: "1.5px solid #fd561e", color: "#fd561e", borderRadius: "8px", padding: "8px 20px", fontSize: "13px", fontWeight: "600", cursor: "pointer", transition: "all 0.2s" }}
          onMouseEnter={e => { e.currentTarget.style.background = "#fd561e"; e.currentTarget.style.color = "white"; }}
          onMouseLeave={e => { e.currentTarget.style.background = "white"; e.currentTarget.style.color = "#fd561e"; }}
        >
          🖨️ Print Ticket
        </button>
      </div>
    </div>
  );
};

export default GuestBookings;