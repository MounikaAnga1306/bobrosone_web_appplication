// src/modules/bus/utils/bookingUtils.js

import { useState } from "react";

/* ── date formatter ── */
export const fmt = (d) => {
  if (!d || d === "—") return "—";
  try {
    const date = new Date(d.toString().replace(" ", "T").replace(/\.$/, ""));
    if (isNaN(date)) return d;
    return date.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
  } catch { return d; }
};

/* ── status ── */
export const STATUS_STYLES = {
  Confirmed: { bg: "#eaf3de", color: "#3B6D11", dot: "#52b522" },
  Cancelled: { bg: "#FCEBEB", color: "#A32D2D", dot: "#e55353" },
  Pending:   { bg: "#fef3c7", color: "#92400e", dot: "#f59e0b" },
  Upcoming:  { bg: "#e8f4ff", color: "#1e5fa8", dot: "#3b9eff" },
};

export const getStatus = (booking) => {
  const raw = (booking.status || "").trim();
  if (raw) return raw;
  try {
    const doj = new Date(booking.pdoj?.toString().replace(" ", "T") || "");
    if (!isNaN(doj)) return doj > new Date() ? "Upcoming" : "Confirmed";
  } catch {}
  return "Confirmed";
};

export const TABS = ["All", "Upcoming", "Confirmed", "Cancelled"];

/* ── total fare ── */
const calculateTotalFare = (booking) => {
  if (booking.fare && typeof booking.fare === "string" && booking.fare.includes(",")) {
    const total = booking.fare.split(",").reduce((s, p) => s + (parseFloat(p.trim()) || 0), 0);
    if (total > 0) return total;
  }
  if (booking.fare && booking.fare !== "—") {
    const v = parseFloat(booking.fare);
    if (!isNaN(v) && v > 0) return v;
  }
  for (const f of ["total_amount", "totalfare", "total_fare", "tcost"]) {
    if (booking[f] && booking[f] !== "—") {
      const v = parseFloat(booking[f]);
      if (!isNaN(v) && v > 0) return v;
    }
  }
  if (booking.inventoryItems?.length > 0) {
    let t = 0, has = false;
    booking.inventoryItems.forEach(i => {
      const f = i.totalFare || i.grandTotalFare || i.fare || i.baseFare;
      if (f && f !== "—") { const v = parseFloat(f); if (!isNaN(v)) { t += v; has = true; } }
    });
    if (has && t > 0) return t;
  }
  if (booking.passengers?.length > 0) {
    let t = 0, has = false;
    booking.passengers.forEach(p => {
      const f = p.fare || p.totalFare || p.amount;
      if (f && f !== "—") { const v = parseFloat(f); if (!isNaN(v)) { t += v; has = true; } }
    });
    if (has && t > 0) return t;
  }
  return "—";
};

/* ────────────────────────────────────────────────────────────
   getFirstPassenger
   - passengers[0] / inventoryItems[0] ఉంటే → ఆ object నుండి directly
   - Root flat fields ఉంటే → comma split చేసి [0] తీసుకో
     (API "Ravi, Suresh" గా store చేస్తుంది — split తప్పనిసరి)
──────────────────────────────────────────────────────────── */
const getFirstPassenger = (booking) => {
  // 1. passengers array
  if (Array.isArray(booking.passengers) && booking.passengers.length > 0) {
    const p = booking.passengers[0];
    return {
      name: p.name   || p.pname  || "Guest",
      age:  String(p.age  || p.page  || ""),
      sex:  String(p.gender || p.sex || p.psex || ""),
    };
  }

  // 2. inventoryItems array
  if (Array.isArray(booking.inventoryItems) && booking.inventoryItems.length > 0) {
    const raw = booking.inventoryItems[0];
    const p   = raw.passenger || raw;
    return {
      name: p.name   || p.pname  || "Guest",
      age:  String(p.age  || p.page  || ""),
      sex:  String(p.gender || p.sex || p.psex || ""),
    };
  }

  // 3. Flat root fields — API లో comma-separated గా store అవుతాయి
  //    "Ravi, Suresh" → split → "Ravi" మాత్రమే
  const firstName = booking.pname
    ? booking.pname.toString().split(",")[0].trim()
    : (booking.name ? booking.name.toString().split(",")[0].trim() : "Guest");

  const firstAge = booking.page
    ? booking.page.toString().split(",")[0].trim()
    : "";

  const firstSex = booking.psex
    ? booking.psex.toString().split(",")[0].trim()
    : "";

  return { name: firstName, age: firstAge, sex: firstSex };
};

/* ── BookingCard ── */
export const BookingCard = ({ booking, onPrint }) => {
  const [hov, setHov] = useState(false);

  const parts = (booking.ptrip || "").split(",").map(s => s.trim());
  const src   = parts[0] || "—";
  const dst   = parts[1] || "—";
  const doj   = booking.pdoj || "—";
  const tid   = booking.tin_ticket || booking.blk_ticket || booking.tin || "—";

  const totalFare          = calculateTotalFare(booking);
  const { name, age, sex } = getFirstPassenger(booking);
  const status             = getStatus(booking);
  const ss                 = STATUS_STYLES[status] || STATUS_STYLES.Confirmed;
  const subInfo            = [sex, age ? `${age} yrs` : ""].filter(Boolean).join(" · ");

  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        background: "#fff", borderRadius: "16px",
        border: "1px solid #eef0f3", overflow: "hidden",
        boxShadow: hov ? "0 8px 32px rgba(0,0,0,.10)" : "0 2px 10px rgba(0,0,0,.05)",
        transition: "box-shadow .22s ease", fontFamily: "Segoe UI, sans-serif",
      }}
    >
      <style>{`
        .bc-line { height: 2px; background: #d1d5db; width: 200px; }
        .bc-bus  { font-size: 28px; line-height: 1; margin: 0 6px;
                   filter: drop-shadow(0 2px 4px rgba(0,0,0,0.1)); flex-shrink: 0; }

        @media (max-width: 1024px) { .bc-line { width: 100px; } }
        @media (max-width: 768px)  { 
        .bc-line { width: 60px;  }
        .bc-bus{font-size:24px; margin:0 4px;}
         }

        /* mobile ≤480px: lines తీసేసి bus మాత్రమే center లో */
        @media (max-width: 480px) {
          .bc-line { width:40px;}
          .bc-bus  { font-size: 24px; margin: 0 3px; }
        }
      `}</style>

      {/* top bar */}
      <div style={{
        background: "#fafbfc", borderBottom: "1px solid #eef0f3",
        padding: "11px 22px", display: "flex",
        justifyContent: "space-between", alignItems: "center",
        flexWrap: "wrap", gap: "8px",
      }}>
        <span style={{ fontSize: "12px", color: "#adb5bd" }}>Booked on {fmt(booking.bdat)}</span>
        <span style={{
          display: "flex", alignItems: "center", gap: "5px",
          fontSize: "12px", fontWeight: 600, padding: "4px 12px",
          borderRadius: "20px", background: ss.bg, color: ss.color,
        }}>
          <span style={{ width: "7px", height: "7px", borderRadius: "50%",
            background: ss.dot, display: "inline-block" }} />
          {status}
        </span>
      </div>

      {/* route */}
      <div style={{ padding: "20px 24px 16px", display: "flex", alignItems: "flex-start" }}>

        {/* From */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: "10px", color: "#ced4da", textTransform: "uppercase",
            letterSpacing: ".7px", marginBottom: "5px" }}>From</div>
          <div style={{ 
  fontSize: "clamp(15px, 2vw, 20px)", 
  fontWeight: 800, 
  color: "#1a1a2e", 
  lineHeight: 1,
  wordBreak: "break-word",
  whiteSpace: "normal",
}}>
  {src}
</div>
        </div>
{/* Connector — bus with lines always visible on all devices */}
<div style={{ display: "flex", alignItems: "center",
  flexShrink: 0 , paddingTop: "18px"}}>
  <div className="bc-line" />
  <span className="bc-bus">🚌</span>
  <div className="bc-line" />
</div>

        {/* To */}
        <div style={{ flex: 1, minWidth: 0, textAlign: "right" }}>
          <div style={{ fontSize: "10px", color: "#ced4da", textTransform: "uppercase",
            letterSpacing: ".7px", marginBottom: "5px" }}>To</div>
          <div style={{ 
  fontSize: "clamp(17px, 3vw, 22px)", 
  fontWeight: 800, 
  color: "#1a1a2e", 
  lineHeight: 1,
  wordBreak: "break-word",
  whiteSpace: "normal",
  textAlign: "right",
}}>
  {dst}
</div>
        </div>
      </div>

      {/* info grid */}
      <div style={{
        display: "grid", gridTemplateColumns: "repeat(3, 1fr)",
        margin: "0 24px 16px", borderRadius: "12px",
        overflow: "hidden", border: "1px solid #eef0f3",
        background: "#fff", textAlign: "center",
      }}>
        {[
          { label: "Date of Journey", val: fmt(doj), orange: false },
          { label: "Ticket ID",       val: tid,       orange: true  },
          { label: "Fare Paid",       val: totalFare !== "—" ? `₹${totalFare}` : "—", orange: false },
        ].map(({ label, val, orange }, i) => (
          <div key={label} style={{
            background: i === 1 ? "#fff8f5" : "#f8f9ff", padding: "12px 8px",
            borderRight: i < 2 ? "1px solid #eef0f3" : "none",
          }}>
            <div style={{ fontSize: "10px", color: "#adb5bd", textTransform: "uppercase",
              letterSpacing: ".6px", marginBottom: "5px" }}>{label}</div>
            <div style={{ fontSize: "clamp(11px, 2.8vw, 13px)", fontWeight: 700,
              color: orange ? "#fd561e" : "#1a1a2e",
              wordBreak: "break-word", whiteSpace: "normal", lineHeight: "1.3" }}>
              {val}
            </div>
          </div>
        ))}
      </div>

      {/* dashed divider */}
      <div style={{ borderTop: "2px dashed #eef0f3", margin: "0 24px" }} />

      {/* passenger + print */}
      <div style={{
        padding: "12px 22px 14px", display: "flex",
        alignItems: "center", justifyContent: "space-between",
        flexWrap: "wrap", gap: "10px",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px", minWidth: 0, flex: 1 }}>
          <div style={{
            width: "38px", height: "38px", borderRadius: "50%",
            background: "linear-gradient(135deg,#fd561e,#ff8c42)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: "15px", fontWeight: 700, color: "#fff", flexShrink: 0,
          }}>
            {name[0]?.toUpperCase()}
          </div>
          <div style={{ minWidth: 0, flex: 1 }}>
            <div style={{ fontSize: "clamp(13px, 3.5vw, 14px)", fontWeight: 600,
              color: "#343a40", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              {name}
            </div>
            {subInfo && (
              <div style={{ fontSize: "11px", color: "#adb5bd",
                whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                {subInfo}
              </div>
            )}
          </div>
        </div>
        <PrintBtn onClick={() => onPrint(booking)} />
      </div>
    </div>
  );
};

/* ── PrintBtn ── */
export const PrintBtn = ({ onClick }) => {
  const [hov, setHov] = useState(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        display: "flex", alignItems: "center", gap: "4px",
        padding: "6px 14px", border: "1.5px solid #fd561e", borderRadius: "8px",
        background: hov ? "#fd561e" : "#fff", color: hov ? "#fff" : "#fd561e",
        fontSize: "clamp(11px, 3vw, 12px)", fontWeight: 600, cursor: "pointer",
        transition: "all .18s", fontFamily: "Segoe UI, sans-serif",
        whiteSpace: "nowrap", flexShrink: 0,
      }}
    >
      🖨️ Print Ticket
    </button>
  );
};

/* ── FilterTabs ── */
export const FilterTabs = ({ bookings, tab, setTab }) => (
  <div style={{ display: "flex", gap: "8px", marginBottom: "24px", flexWrap: "wrap" }}>
    {TABS.map((t) => {
      const count  = t === "All" ? bookings.length : bookings.filter(b => getStatus(b) === t).length;
      const active = tab === t;
      return (
        <button key={t} onClick={() => setTab(t)} style={{
          padding: "7px 16px", borderRadius: "24px",
          border: active ? "none" : "1.5px solid #e5e7eb",
          background: active ? "linear-gradient(135deg,#fd561e,#ff8c42)" : "#fff",
          color: active ? "#fff" : "#6b7280",
          fontSize: "13px", fontWeight: active ? 600 : 400,
          cursor: "pointer", transition: "all .18s",
          fontFamily: "Segoe UI, sans-serif",
          display: "flex", alignItems: "center", gap: "6px",
        }}>
          {t}
          {count > 0 && (
            <span style={{
              background: active ? "rgba(255,255,255,0.28)" : "#f3f4f6",
              color: active ? "#fff" : "#6b7280",
              borderRadius: "10px", fontSize: "11px",
              padding: "1px 7px", fontWeight: 600,
            }}>{count}</span>
          )}
        </button>
      );
    })}
  </div>
);

/* ── EmptyState ── */
export const EmptyState = ({ onBook }) => (
  <div style={{
    background: "#fff", borderRadius: "16px", padding: "64px 20px",
    textAlign: "center", border: "1px solid #eef0f3",
    boxShadow: "0 2px 10px rgba(0,0,0,.05)",
  }}>
    <div style={{ fontSize: "56px", marginBottom: "12px" }}>🚌</div>
    <h3 style={{ fontSize: "18px", color: "#333", margin: "0 0 8px", fontFamily: "Segoe UI, sans-serif" }}>
      No trips yet!
    </h3>
    <p style={{ color: "#9ca3af", fontSize: "13px", marginBottom: "24px", fontFamily: "Segoe UI, sans-serif" }}>
      Book your first bus ticket and travel with ease.
    </p>
    <button onClick={onBook} style={{
      background: "linear-gradient(135deg,#fd561e,#ff8c42)", color: "#fff",
      border: "none", borderRadius: "10px", padding: "11px 28px",
      fontSize: "14px", fontWeight: 600, cursor: "pointer", fontFamily: "Segoe UI, sans-serif",
    }}>
      Book a Ticket
    </button>
  </div>
);

/* ── Spinner ── */
export const Spinner = ({ text = "Loading your trips..." }) => (
  <div style={{ minHeight: "100vh", background: "#f5f7fa",
    display: "flex", alignItems: "center", justifyContent: "center" }}>
    <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    <div style={{ textAlign: "center" }}>
      <div style={{
        width: "44px", height: "44px", border: "3px solid #fd561e",
        borderTopColor: "transparent", borderRadius: "50%",
        animation: "spin .8s linear infinite", margin: "0 auto 14px",
      }} />
      <p style={{ color: "#888", fontSize: "14px", fontFamily: "Segoe UI, sans-serif" }}>{text}</p>
    </div>
  </div>
);

/* ── PrintModalWrapper ── */
export const PrintModalWrapper = ({ onClose, children }) => (
  <div style={{
    position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)",
    display: "flex", alignItems: "center", justifyContent: "center",
    zIndex: 9999, padding: "16px",
  }}>
    <div style={{
      background: "#fff", borderRadius: "18px", padding: "24px",
      width: "90%", maxWidth: "440px", position: "relative",
    }}>
      <button onClick={onClose} style={{
        position: "absolute", top: "12px", right: "14px",
        background: "none", border: "none", fontSize: "18px",
        cursor: "pointer", color: "#999",
      }}>✕</button>
      {children}
    </div>
  </div>
);