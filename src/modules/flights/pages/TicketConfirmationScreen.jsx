import { useEffect, useState } from "react";

export default function TicketConfirmationScreen() {
  const [params, setParams] = useState(null);

  useEffect(() => {
    const sp = new URLSearchParams(window.location.search);
    setParams({
      success:              sp.get("success")                || "",
      bdorderid:            sp.get("bdorderid")              || "",
      transactionid:        sp.get("transactionid")          || "",
      authStatus:           sp.get("authStatus")             || "",
      statusMessage:        sp.get("statusMessage")          || "",
      amount:               sp.get("amount")                 || "",
      userId:               sp.get("user_id")                || "",
      passengerName:        sp.get("passenger_name")         || "",
      universalLocatorCode: sp.get("universal_locator_code") || "",
      airLocatorCode:       sp.get("air_locator_code")       || "",
      providerLocatorCode:  sp.get("provider_locator_code")  || "",
    });
  }, []);

  if (!params) {
    return (
      <div style={{
        minHeight: "100vh", display: "flex",
        alignItems: "center", justifyContent: "center",
        fontFamily: "sans-serif", background: "#f5f5f5",
      }}>
        <p style={{ color: "#666", fontSize: 16 }}>Loading...</p>
      </div>
    );
  }

  const ok = params.authStatus === "0300";

  return (
    <div style={{
      minHeight: "100vh", background: "#f5f5f5",
      fontFamily: "'Segoe UI', sans-serif", padding: "40px 16px",
    }}>
      <div style={{
        maxWidth: 560, margin: "0 auto",
        background: "#fff", borderRadius: 16,
        boxShadow: "0 2px 16px rgba(0,0,0,0.10)", overflow: "hidden",
      }}>

        {/* ── Banner ── */}
        <div style={{
          background: ok ? "#16a34a" : "#dc2626",
          padding: "32px 28px", textAlign: "center", color: "#fff",
        }}>
          <div style={{
            width: 64, height: 64, borderRadius: "50%",
            background: "rgba(255,255,255,0.2)",
            display: "flex", alignItems: "center", justifyContent: "center",
            margin: "0 auto 16px", fontSize: 32,
          }}>
            {ok ? "✓" : "✕"}
          </div>
          <h1 style={{ margin: 0, fontSize: 24, fontWeight: 700 }}>
            {ok ? "Payment Successful" : "Payment Failed"}
          </h1>
          <p style={{ margin: "8px 0 0", opacity: 0.85, fontSize: 14 }}>
            {params.statusMessage || (ok ? "Your booking is confirmed." : "Something went wrong.")}
          </p>
        </div>

        {/* ── Rows ── */}
        <div style={{ padding: "8px 0" }}>
          <Row label="Auth Status"       value={params.authStatus      || "—"} highlight={ok} />
          <Row label="Amount"            value={params.amount ? `₹ ${params.amount}` : "—"} />
          <Row label="Transaction ID"    value={params.transactionid   || "—"} mono />
          <Row label="Order ID"          value={params.bdorderid       || "—"} mono />
          <Row label="Passenger"         value={params.passengerName   || "—"} />
          <Row label="User ID"           value={params.userId          || "—"} mono />
          <Row label="Universal Locator" value={params.universalLocatorCode || "—"} mono />
          <Row label="Air Locator"       value={params.airLocatorCode       || "—"} mono />
          <Row label="Provider Locator"  value={params.providerLocatorCode  || "—"} mono />
        </div>

        {/* ── Raw dump ── */}
        <details style={{ borderTop: "1px solid #f0f0f0", padding: "12px 24px" }}>
          <summary style={{
            cursor: "pointer", fontSize: 12,
            color: "#999", userSelect: "none",
          }}>
            Show raw params
          </summary>
          <pre style={{
            marginTop: 10, fontSize: 11, color: "#555",
            background: "#f9f9f9", borderRadius: 8,
            padding: 12, overflowX: "auto",
            whiteSpace: "pre-wrap", wordBreak: "break-all",
            lineHeight: 1.7,
          }}>
            {JSON.stringify(params, null, 2)}
          </pre>
        </details>

      </div>
    </div>
  );
}

function Row({ label, value, mono, highlight }) {
  return (
    <div style={{
      display: "flex", justifyContent: "space-between",
      alignItems: "center", padding: "13px 24px",
      borderBottom: "1px solid #f5f5f5", gap: 12,
    }}>
      <span style={{ fontSize: 13, color: "#888", flexShrink: 0 }}>
        {label}
      </span>
      <span style={{
        fontSize: 13,
        fontFamily: mono ? "monospace" : "inherit",
        color: highlight ? "#16a34a" : "#111",
        fontWeight: highlight ? 600 : 400,
        textAlign: "right", wordBreak: "break-all",
      }}>
        {value}
      </span>
    </div>
  );
}