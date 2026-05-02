// PopularBillers.jsx
// Biller click → DB fetch → localStorage → /bill-details (same flow as BillBookingForm)

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const API = "https://api.bobros.co.in/db/select";

// ── Same robust parsers from BillBookingForm ──
const safeParseJson = (raw) => {
  if (!raw || raw === "nan") return null;
  try {
    if (typeof raw === "object") return raw;
    return JSON.parse(raw.replace(/'/g, '"'));
  } catch { return null; }
};

const parseAuthenticatorsSafe = (raw) => {
  if (!raw || raw === "nan") return [];
  if (Array.isArray(raw)) return raw.filter((a) => a && typeof a === "object" && a.parameter_name);
  if (typeof raw !== "string") return [];
  try {
    const parsed = JSON.parse(raw.replace(/'/g, '"'));
    if (Array.isArray(parsed) && parsed.every((a) => a?.parameter_name)) return parsed.filter((a) => a && a.parameter_name);
  } catch {}
  // brace-count fallback
  const results = [];
  let depth = 0, start = -1;
  for (let i = 0; i < raw.length; i++) {
    if (raw[i] === "{") { if (depth === 0) start = i; depth++; }
    else if (raw[i] === "}") {
      depth--;
      if (depth === 0 && start !== -1) {
        const objStr = raw.slice(start, i + 1);
        const pnMatch = objStr.match(/"parameter_name"\s*:\s*"([^"]+)"/);
        if (!pnMatch) { start = -1; continue; }
        const obj = { parameter_name: pnMatch[1] };
        const optMatch = objStr.match(/"optional"\s*:\s*"([^"]+)"/);   if (optMatch) obj.optional = optMatch[1];
        const errMatch = objStr.match(/"error_message"\s*:\s*"([^"]*)"/); if (errMatch) obj.error_message = errMatch[1];
        const seqMatch = objStr.match(/"seq"\s*:\s*"([^"]+)"/);         if (seqMatch) obj.seq = seqMatch[1];
        const dtMatch  = objStr.match(/"data_type"\s*:\s*"([^"]+)"/);   if (dtMatch)  obj.data_type = dtMatch[1];
        const rxMatch  = objStr.match(/"regex"\s*:\s*"((?:[^"\\]|\\.)*)"/); if (rxMatch) obj.regex = rxMatch[1];
        const lovMatch = objStr.match(/"list_of_values"\s*:\s*(\[[^\]]*\])/);
        if (lovMatch) { try { obj.list_of_values = JSON.parse(lovMatch[1]); } catch { try { obj.list_of_values = JSON.parse(lovMatch[1].replace(/'/g, '"')); } catch {} } }
        results.push(obj);
        start = -1;
      }
    }
  }
  return results;
};

const BILLERS = [
  {
    category: "Electricity Bill Payment",
    items: [
      { label: "APDCL",             category: "Electricity", biller: "Southern Power Distribution (APSPDCL)" },
      { label: "BEST Mumbai",       category: "Electricity", biller: "BEST Mumbai" },
      { label: "MSEDCL",            category: "Electricity", biller: "Maharashtra State Electricity Distbn Co Ltd." },
      { label: "CESU",              category: "Electricity", biller: "CESU, Odisha" },
      { label: "WBE",               category: "Electricity", biller: "West Bengal Electricity" },
      { label: "UHBVN",             category: "Electricity", biller: "UHBVN" },
      { label: "APEPDCL",           category: "Electricity", biller: "APEPDCL" },
      { label: "KESCO",             category: "Electricity", biller: "KESCO" },
      { label: "BESCOM",            category: "Electricity", biller: "BESCOM" },
      { label: "UGVCL",             category: "Electricity", biller: "UGVCL" },
      { label: "ADANI ELECTRICITY", category: "Electricity", biller: "Adani Electricity Mumbai Limited" },
      { label: "MGVCL",             category: "Electricity", biller: "MGVCL" },
    ],
  },
  {
    category: "DTH Recharge",
    items: [
      { label: "TATAPLAY",   category: "DTH", biller: "TATAPLAY (FORMERLY KNOWN AS TATASKY)" },
      { label: "SUN DIRECT", category: "DTH", biller: "SUN DIRECT" },
      { label: "AIRTEL DTH", category: "DTH", biller: "AIRTEL DTH" },
      { label: "DISH TV",    category: "DTH", biller: "DISH TV" },
      { label: "D2H DTH",    category: "DTH", biller: "D2H DTH" },
    ],
  },
  {
    category: "Piped Gas",
    items: [
      { label: "MAHANAGAR GAS", category: "Gas", biller: "Mahanagar Gas" },
      { label: "IGL",           category: "Gas", biller: "IGL" },
      { label: "ADANI GAS",     category: "Gas", biller: "ADANI GAS" },
      { label: "TORRENT GAS",   category: "Gas", biller: "TORRENT GAS" },
      { label: "AVANTIKA GAS",  category: "Gas", biller: "AVANTIKA GAS" },
      { label: "GUJARAT GAS",   category: "Gas", biller: "GUJARAT GAS" },
    ],
  },
  {
    category: "Landline",
    items: [
      { label: "AIRTEL",         category: "Landline", biller: "AIRTEL" },
      { label: "BSNL CORPORATE", category: "Landline", biller: "BSNL CORPORATE" },
      { label: "BSNL CONSUMER",  category: "Landline", biller: "BSNL CONSUMER" },
      { label: "MTNL DELHI",     category: "Landline", biller: "MTNL DELHI" },
      { label: "MTNL MUMBAI",    category: "Landline", biller: "MTNL MUMBAI" },
    ],
  },
  {
    category: "Mobile Recharge",
    items: [
      { label: "AIRTEL", category: "Mobile Prepaid", biller: "AIRTEL RECHARGE" },
      { label: "BSNL",   category: "Mobile Prepaid", biller: "BSNL RECHARGE" },
      { label: "JIO",    category: "Mobile Prepaid", biller: "JIO RECHARGE" },
      { label: "VI",     category: "Mobile Prepaid", biller: "VI RECHARGE" },
    ],
  },
  {
    category: "Mobile Postpaid",
    items: [
      { label: "BSNL",   category: "Mobile Postpaid", biller: "BSNL POSTPAID" },
      { label: "JIO",    category: "Mobile Postpaid", biller: "JIO POSTPAID" },
      { label: "AIRTEL", category: "Mobile Postpaid", biller: "AIRTEL POSTPAID" },
      { label: "VI",     category: "Mobile Postpaid", biller: "VI POSTPAID" },
    ],
  },
  {
    category: "Cylinder Booking",
    items: [
      { label: "BHARAT GAS", category: "LPG Cylinder", biller: "BHARAT GAS" },
      { label: "HP GAS",     category: "LPG Cylinder", biller: "HP GAS" },
      { label: "INDANE GAS", category: "LPG Cylinder", biller: "INDANE GAS" },
    ],
  },
  {
    category: "FASTag",
    items: [
      { label: "SBI",     category: "Fastag", biller: "SBI FASTAG" },
      { label: "ICICI",   category: "Fastag", biller: "ICICI FASTAG" },
      { label: "IHMCL",   category: "Fastag", biller: "IHMCL FASTAG" },
      { label: "PAYTM",   category: "Fastag", biller: "PAYTM FASTAG" },
      { label: "EQUITAS", category: "Fastag", biller: "EQUITAS FASTAG" },
      { label: "FEDERAL", category: "Fastag", biller: "FEDERAL FASTAG" },
      { label: "HDFC",    category: "Fastag", biller: "HDFC FASTAG" },
      { label: "AXIS",    category: "Fastag", biller: "AXIS FASTAG" },
    ],
  },
  {
    category: "Water",
    items: [
      { label: "BWSSB",  category: "Water", biller: "BWSSB" },
      { label: "DJB",    category: "Water", biller: "DJB" },
      { label: "HMWSSB", category: "Water", biller: "HMWSSB" },
    ],
  },
  {
    category: "Broadband",
    items: [
      { label: "AIRTEL",        category: "Broadband Postpaid", biller: "AIRTEL BROADBAND" },
      { label: "KERALA VISION", category: "Broadband Postpaid", biller: "KERALA VISION BROADBAND" },
      { label: "ACT",           category: "Broadband Postpaid", biller: "ACT FIBERNET" },
    ],
  },
];

// ── Loading overlay ──
const LoadingOverlay = ({ billerName }) => (
  <div style={{
    position: "fixed", inset: 0, zIndex: 9999,
    background: "rgba(0,0,0,0.45)",
    display: "flex", alignItems: "center", justifyContent: "center",
  }}>
    <div style={{
      background: "#fff", borderRadius: 16, padding: "32px 40px",
      textAlign: "center", boxShadow: "0 8px 32px rgba(0,0,0,0.18)",
      minWidth: 240,
    }}>
      <div style={{
        width: 44, height: 44, margin: "0 auto 16px",
        border: "4px solid #ffe0d6",
        borderTop: "4px solid #fd561e",
        borderRadius: "50%",
        animation: "pb-spin 0.8s linear infinite",
      }} />
      <p style={{ fontWeight: 700, color: "#222", fontSize: 15, marginBottom: 4 }}>
        Loading {billerName}...
      </p>
      <p style={{ color: "#888", fontSize: 12 }}>Fetching biller details</p>
      <style>{`@keyframes pb-spin { to { transform: rotate(360deg) } }`}</style>
    </div>
  </div>
);

// ── Error popup modal ──
const ErrorPopup = ({ message, onClose }) => (
  <div style={{
    position: "fixed", inset: 0, zIndex: 10000,
    background: "rgba(0,0,0,0.45)",
    display: "flex", alignItems: "center", justifyContent: "center",
    padding: "16px",
  }}>
    <div style={{
      background: "#fff", borderRadius: 16, padding: "32px 28px",
      textAlign: "center", boxShadow: "0 8px 40px rgba(0,0,0,0.2)",
      maxWidth: 360, width: "100%",
    }}>
      <div style={{
        width: 56, height: 56, borderRadius: "50%",
        background: "#fff5f2", border: "2px solid #ffd5c8",
        display: "flex", alignItems: "center", justifyContent: "center",
        margin: "0 auto 16px",
      }}>
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#fd561e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
          <line x1="12" y1="9" x2="12" y2="13"/>
          <line x1="12" y1="17" x2="12.01" y2="17"/>
        </svg>
      </div>
      <h3 style={{ fontSize: 17, fontWeight: 700, color: "#1a1a1a", marginBottom: 8 }}>
        Biller Not Found
      </h3>
      <p style={{ fontSize: 13, color: "#666", lineHeight: 1.6, marginBottom: 24 }}>
        {message}
      </p>
      <button
        onClick={onClose}
        style={{
          background: "#fd561e", color: "#fff",
          border: "none", borderRadius: 10,
          padding: "11px 32px", fontSize: 14, fontWeight: 700,
          cursor: "pointer", width: "100%",
        }}
        onMouseEnter={(e) => e.target.style.background = "#e04010"}
        onMouseLeave={(e) => e.target.style.background = "#fd561e"}
      >
        OK
      </button>
    </div>
  </div>
);

const PopularBillers = () => {
  const navigate = useNavigate();
  const [loading,      setLoading]      = useState(false);
  const [loadingLabel, setLoadingLabel] = useState("");
  const [error, setError] = useState("");

  // ── Main handler: same logic as BillBookingForm.handleSearch ──
  const handleBillerClick = async (categoryName, billerName) => {
    setLoading(true);
    setLoadingLabel(billerName);
    setError("");

    try {
      // 1. Search by biller_name (partial/exact match)
      const res = await axios.post(API, {
        table: "biller_all",
        columns: ["*"],
        conditions: { biller_name: billerName },
      });

      const row = res.data?.rows?.[0];

      if (!row) {
        setLoading(false);
        setError(`"${billerName}" not found in this category. Please search manually.`);
        return;
      }

      // 2. Parse all fields — same as BillBookingForm
      const authenticators        = parseAuthenticatorsSafe(row.authenticators);
      const allowedPaymentMethods = safeParseJson(row.allowed_payment_methods) || [];
      const paymentChannels       = safeParseJson(row.payment_channels)        || [];
      const customerConvFee       = safeParseJson(row.customer_conv_fee);
      const additionalValDetails  = safeParseJson(row.additional_validation_details);
      const additionalPayDetails  = safeParseJson(row.additional_payment_details);
      const authGroup             = safeParseJson(row.biller_authenticator_group);

      // 3. Fetch consent
      let billerConsent = "";
      try {
        const cr = await axios.post(API, {
          table: "biller_consent",
          columns: ["biller_consent"],
          conditions: { biller_category: row.biller_category },
        });
        billerConsent = cr.data?.rows?.[0]?.biller_consent || "";
      } catch {}

      // 4. Read logged-in user
      const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
      let loggedInUser = null;
      if (isLoggedIn) {
        try {
          const userStr = localStorage.getItem("user");
          if (userStr) { const p = JSON.parse(userStr); loggedInUser = p?.data || p; }
        } catch {}
      }

      // 5. Build billData — identical shape to BillBookingForm
      const billData = {
        billerid:                    row.billerid,
        biller:                      row.biller_name,
        category:                    row.biller_category,
        category1:                   row.biller_category,
        biller_logo:                 row.biller_logo,
        online_validation:           row.online_validation,
        bill_presentment:            row.bill_presentment,
        partial_pay:                 row.partial_pay,
        partial_pay_amount:          row.partial_pay_amount,
        pay_after_duedate:           row.pay_after_duedate,
        paymentamount_validation:    row.paymentamount_validation,
        plan_available:              row.plan_available,
        biller_type:                 row.biller_type,
        biller_mode:                 row.biller_mode,
        allowed_payment_methods:     allowedPaymentMethods,
        payment_channels:            paymentChannels,
        customer_conv_fee:           customerConvFee,
        authenticators:              authenticators,
        biller_authenticator_group:  authGroup,
        additional_validation_details: additionalValDetails,
        additional_payment_details:  additionalPayDetails,
        billerConsent:               billerConsent,
        biller_remarks:              row.biller_remarks && row.biller_remarks !== "nan" ? row.biller_remarks : "",
        bbps_billerid:               row.bbps_billerid,
        isbillerbbps:                row.isbillerbbps,
        isLoggedIn,
        loggedInUser,
      };

      console.log("[PopularBillers] billData:", {
        biller: billData.biller,
        authenticatorCount: billData.authenticators.length,
        authenticatorNames: billData.authenticators.map((a) => a.parameter_name),
      });

      // 6. Save and navigate — same as BillBookingForm
      localStorage.setItem("billData", JSON.stringify(billData));
      navigate("/bill-details");

    } catch (err) {
      console.error("[PopularBillers] Error:", err);
      setLoading(false);
      setError("Error fetching biller details. Please try again.");
    }
  };

  return (
    <>
      {loading && <LoadingOverlay billerName={loadingLabel} />}
      {error   && <ErrorPopup message={error} onClose={() => setError("")} />}

      <div className="popular-billers-root w-full pt-8 bg-white" style={{ borderTop: "1px solid #f0f0f0" }}>
        <h3 className="pb-heading text-[22px] font-semibold text-gray-900 mb-5">
          Popular Billers
        </h3>

        <div className="flex flex-col">
          {BILLERS.map((row, rowIdx) => (
            <div
              key={row.category}
              className="pb-row py-2"
              style={{
                borderBottom: rowIdx < BILLERS.length - 1 ? "1px solid #f5f5f5" : "none",
                fontSize: "13px",
                lineHeight: "1.8",
              }}
            >
              {/* Category label */}
              <span className="pb-cat font-bold text-gray-900" style={{ marginRight: "8px", fontSize: "13px" }}>
                {row.category}:
              </span>

              {/* Pipe-separated biller buttons */}
              <span className="pb-items">
                {row.items.map((item, i) => (
                  <span key={item.biller} style={{ display: "inline-flex", alignItems: "center" }}>
                    <button
                      onClick={() => handleBillerClick(item.category, item.biller)}
                      disabled={loading}
                      style={{
                        color: "#3b3a3a",
                        fontSize: "13px",
                        padding: "0 6px",
                        fontFamily: "inherit",
                        background: "none",
                        border: "none",
                        cursor: loading ? "wait" : "pointer",
                        transition: "color 0.15s",
                      }}
                      onMouseEnter={(e) => { if (!loading) e.target.style.color = "#fd561e"; }}
                      onMouseLeave={(e) => { e.target.style.color = "#3b3a3a"; }}
                    >
                      {item.label}
                    </button>
                    {i < row.items.length - 1 && (
                      <span style={{ color: "#ccc", fontSize: "12px", userSelect: "none" }}>|</span>
                    )}
                  </span>
                ))}
              </span>
            </div>
          ))}
        </div>

        <style>{`
          /* ── Desktop ── */
          .popular-billers-root {
            padding-left: clamp(16px, 5vw, 80px);
            padding-right: clamp(16px, 5vw, 80px);
          }
          .pb-heading { margin-left: 0; }
          .pb-row {
            display: flex;
            flex-wrap: wrap;
            align-items: baseline;
            margin-left: 0;
          }
          .pb-cat  { display: inline; white-space: nowrap; }
          .pb-items { display: inline; }

          /* ── Mobile (≤ 640px) ── */
          @media (max-width: 640px) {
            .pb-heading { font-size: 17px !important; margin-bottom: 10px !important; }
            .pb-row { display: block !important; padding: 6px 0 !important; }
            .pb-cat {
              display: block !important;
              font-size: 11px !important;
              margin-right: 0 !important;
              margin-bottom: 2px !important;
              white-space: normal !important;
            }
            .pb-items {
              display: flex !important;
              flex-wrap: wrap !important;
              align-items: center !important;
            }
            .popular-billers-root button { font-size: 11px !important; padding: 0 3px !important; }
          }

          /* ── iPad (641px – 1024px) ── */
          @media (min-width: 641px) and (max-width: 1024px) {
            .pb-heading { font-size: 20px !important; }
            .pb-row { font-size: 13px !important; }
            .popular-billers-root button { font-size: 13px !important; }
          }

          .popular-billers-root button:hover { text-decoration: underline; }
        `}</style>
      </div>
    </>
  );
};

export default PopularBillers;