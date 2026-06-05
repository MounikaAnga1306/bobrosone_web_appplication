// BillersList.jsx
// Route: /billers
// Navigate: navigate("/billers", { state: { category: "Electricity" } })

import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";

const API = "https://api.bobros.co.in/db/select";

const safeParseJson = (raw) => {
  if (!raw || raw === "nan") return null;
  try {
    if (typeof raw === "object") return raw;
    return JSON.parse(raw.replace(/'/g, '"'));
  } catch { return null; }
};

const parseAuthenticatorsSafe = (raw) => {
  if (!raw || raw === "nan") return [];
  if (Array.isArray(raw)) return raw.filter((a) => a?.parameter_name);
  if (typeof raw !== "string") return [];
  try {
    const p = JSON.parse(raw.replace(/'/g, '"'));
    if (Array.isArray(p) && p.every((a) => a?.parameter_name)) return p.filter(Boolean);
  } catch {}
  const results = [];
  let depth = 0, start = -1;
  for (let i = 0; i < raw.length; i++) {
    if (raw[i] === "{") { if (!depth) start = i; depth++; }
    else if (raw[i] === "}") {
      depth--;
      if (!depth && start !== -1) {
        const s = raw.slice(start, i + 1);
        const pn = s.match(/"parameter_name"\s*:\s*"([^"]+)"/);
        if (pn) {
          const g = (re) => { const m = s.match(re); return m ? m[1] : undefined; };
          const obj = { parameter_name: pn[1] };
          const opt = g(/"optional"\s*:\s*"([^"]+)"/);             if (opt) obj.optional = opt;
          const err = g(/"error_message"\s*:\s*"([^"]*)"/);         if (err) obj.error_message = err;
          const dt  = g(/"data_type"\s*:\s*"([^"]+)"/);             if (dt)  obj.data_type = dt;
          const rx  = s.match(/"regex"\s*:\s*"((?:[^"\\]|\\.)*)"/); if (rx)  obj.regex = rx[1];
          const lov = s.match(/"list_of_values"\s*:\s*(\[[^\]]*\])/);
          if (lov) {
            try { obj.list_of_values = JSON.parse(lov[1]); }
            catch { try { obj.list_of_values = JSON.parse(lov[1].replace(/'/g, '"')); } catch {} }
          }
          results.push(obj);
        }
        start = -1;
      }
    }
  }
  return results;
};

const Skeleton = () => (
  <div className="flex items-center gap-4 py-3 border-b border-gray-100"
    style={{ animation: "blpulse 1.4s ease-in-out infinite" }}>
    <div className="w-12 h-12 rounded-lg bg-gray-100 shrink-0" />
    <div className="h-3.5 w-2/5 bg-gray-100 rounded-md" />
  </div>
);

const BillerRow = ({ biller, onSelect, busy }) => {
  const [hov, setHov]       = useState(false);
  const [imgErr, setImgErr] = useState(false);
  const name   = biller.biller_name || "Unknown";
  const logo   = biller.biller_logo || "";
  const isBusy = busy === biller.billerid;

  return (
    <div
      onClick={() => !busy && onSelect(biller)}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      className="flex items-center gap-4 py-3 border-b border-gray-100 cursor-pointer select-none"
      style={{
        borderLeft: hov && !busy ? "3px solid #fd561e" : "3px solid transparent",
        paddingLeft: hov && !busy ? 10 : 0,
        background: hov && !busy ? "#fff8f5" : "transparent",
        opacity: busy && !isBusy ? 0.4 : 1,
        transition: "background 0.15s, border-color 0.15s, padding-left 0.15s, opacity 0.15s",
        cursor: busy ? "not-allowed" : "pointer",
      }}
    >
      <div className="w-12 h-12 shrink-0 flex items-center justify-center overflow-hidden">
        {logo && !imgErr ? (
          <img src={logo} alt={name}
            className="w-12 h-12 object-contain"
            onError={() => setImgErr(true)} />
        ) : (
          <span className="text-xl font-black select-none" style={{ color: "#fd561e" }}>
            {name.charAt(0).toUpperCase()}
          </span>
        )}
      </div>

      <p className="flex-1 text-sm font-semibold truncate m-0"
        style={{ color: hov ? "#fd561e" : "#111", transition: "color 0.15s" }}>
        {name}
      </p>

      {isBusy ? (
        <div className="w-4 h-4 rounded-full shrink-0"
          style={{ border: "2px solid #f0f0f0", borderTopColor: "#fd561e",
            animation: "blspin 0.7s linear infinite" }} />
      ) : (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
          stroke={hov ? "#fd561e" : "#ccc"} strokeWidth="2.5"
          strokeLinecap="round" strokeLinejoin="round"
          className="shrink-0"
          style={{ transition: "stroke 0.15s, transform 0.15s",
            transform: hov ? "translateX(2px)" : "none" }}>
          <path d="M9 18l6-6-6-6" />
        </svg>
      )}
    </div>
  );
};

const BillersList = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const category = location.state?.category || "Mobile Prepaid";

  const [billers, setBillers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState("");
  const [query,   setQuery]   = useState("");
  const [busy,    setBusy]    = useState(null);
  const inputRef = useRef(null);

  useEffect(() => { setTimeout(() => inputRef.current?.focus(), 200); }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true); setError(""); setBillers([]);
      try {
        const res = await axios.post(API, {
          table: "biller_all",
          columns: ["billerid", "biller_name", "biller_logo", "biller_category"],
          conditions: { biller_category: category },
        });
        if (cancelled) return;
        const rows = res.data?.rows || [];
        setBillers(rows);
        if (!rows.length) setError("No billers found for this category.");
      } catch {
        if (!cancelled) setError("Failed to load billers. Please try again.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [category]);

  const filtered = query.trim()
    ? billers.filter((b) => (b.biller_name || "").toLowerCase().includes(query.toLowerCase()))
    : billers;

  const handleSelect = async (billerRow) => {
    setBusy(billerRow.billerid);
    try {
      const res = await axios.post(API, {
        table: "biller_all", columns: ["*"],
        conditions: { billerid: billerRow.billerid },
      });
      const d = res.data?.rows?.[0];
      if (!d) { alert("Biller details not found!"); return; }

      const authenticators        = parseAuthenticatorsSafe(d.authenticators);
      const allowedPaymentMethods = safeParseJson(d.allowed_payment_methods) || [];
      const paymentChannels       = safeParseJson(d.payment_channels)        || [];
      const customerConvFee       = safeParseJson(d.customer_conv_fee);
      const additionalValDetails  = safeParseJson(d.additional_validation_details);
      const additionalPayDetails  = safeParseJson(d.additional_payment_details);
      const authGroup             = safeParseJson(d.biller_authenticator_group);

      let billerConsent = "";
      try {
        const cr = await axios.post(API, {
          table: "biller_consent", columns: ["biller_consent"],
          conditions: { biller_category: d.biller_category },
        });
        billerConsent = cr.data?.rows?.[0]?.biller_consent || "";
      } catch {}

      const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
      let loggedInUser = null;
      if (isLoggedIn) {
        try {
          const u = localStorage.getItem("user");
          if (u) { const p = JSON.parse(u); loggedInUser = p?.data || p; }
        } catch {}
      }

      // ── KEY FIX: pay_multiple_bills included — same as manual search flow ──
      localStorage.setItem("billData", JSON.stringify({
        billerid:                    d.billerid,
        biller:                      d.biller_name,
        category:                    d.biller_category,
        category1:                   d.biller_category,
        biller_logo:                 d.biller_logo,
        online_validation:           d.online_validation,
        bill_presentment:            d.bill_presentment,
        partial_pay:                 d.partial_pay,
        partial_pay_amount:          d.partial_pay_amount,
        pay_after_duedate:           d.pay_after_duedate,
        pay_multiple_bills:          d.pay_multiple_bills,   // ← WAS MISSING
        paymentamount_validation:    d.paymentamount_validation,
        plan_available:              d.plan_available,
        biller_type:                 d.biller_type,
        biller_mode:                 d.biller_mode,
        allowed_payment_methods:     allowedPaymentMethods,
        payment_channels:            paymentChannels,
        customer_conv_fee:           customerConvFee,
        authenticators,
        biller_authenticator_group:  authGroup,
        additional_validation_details: additionalValDetails,
        additional_payment_details:  additionalPayDetails,
        billerConsent,
        biller_remarks: d.biller_remarks && d.biller_remarks !== "nan" ? d.biller_remarks : "",
        bbps_billerid:               d.bbps_billerid,
        isbillerbbps:                d.isbillerbbps,
        isLoggedIn,
        loggedInUser,
      }));

      navigate("/bill-details");
    } catch {
      alert("Error fetching biller details. Please try again.");
    } finally {
      setBusy(null);
    }
  };

  return (
    <>
      <style>{`
        @keyframes blpulse { 0%,100%{opacity:1} 50%{opacity:.4} }
        @keyframes blspin  { to{transform:rotate(360deg)} }
        @keyframes blUp    { from{opacity:0;transform:translateY(6px)} to{opacity:1;transform:translateY(0)} }
        .bl-row { animation: blUp 0.18s ease both; }
        .bl-input:focus {
          border-color: #fd561e !important;
          box-shadow: 0 0 0 3px rgba(253,86,30,0.1) !important;
          background: #fff !important;
          outline: none;
        }
      `}</style>

      <div className="bg-white pt-16 sm:pt-20"
        style={{ fontFamily: "'Segoe UI', Arial, sans-serif" }}>

        <div className="mx-auto w-full max-w-[680px] px-4 sm:px-8 lg:px-12">

          <div className="pt-6 pb-4 sm:pt-8 sm:pb-5">
            <div className="flex items-start gap-3 mb-4">
              <button
                onClick={() => navigate(-1)}
                className="mt-1 p-1 -ml-1 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors shrink-0"
                aria-label="Go back"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" strokeWidth="2.5"
                  strokeLinecap="round" strokeLinejoin="round">
                  <path d="M19 12H5M5 12l7 7M5 12l7-7" />
                </svg>
              </button>

              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 leading-tight">
                  {category} Billers
                </h1>
                {!loading && billers.length > 0 && (
                  <p className="text-sm text-gray-400 mt-1">
                    {billers.length} biller{billers.length !== 1 ? "s" : ""} available
                  </p>
                )}
              </div>
            </div>

            <div className="relative">
              <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
                width="16" height="16" viewBox="0 0 24 24" fill="none"
                stroke="#bbb" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
              </svg>
              <input
                ref={inputRef}
                type="text"
                className="bl-input w-full py-3 pl-10 pr-10 border border-gray-200 rounded-xl text-sm bg-gray-50 text-gray-800 transition-all"
                style={{ fontSize: 14 }}
                placeholder="Search biller name..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
              {query && (
                <button onClick={() => setQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-300 transition-colors"
                  style={{ fontSize: 11 }}>✕</button>
              )}
            </div>
          </div>

          <div className="border-t border-gray-100" />

          <div className="pb-8">
            {loading && [...Array(6)].map((_, i) => <Skeleton key={i} />)}

            {!loading && error && (
              <div className="text-center py-20">
                <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4"
                  style={{ background: "#fff5f0" }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none"
                    stroke="#fd561e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10"/><path d="M12 8v4m0 4h.01"/>
                  </svg>
                </div>
                <p className="font-semibold text-gray-700 mb-1">{error}</p>
                <button onClick={() => window.location.reload()}
                  className="mt-4 px-5 py-2 rounded-full border text-sm font-semibold"
                  style={{ borderColor: "#fd561e", color: "#fd561e" }}>
                  Try Again
                </button>
              </div>
            )}

            {!loading && !error && filtered.length === 0 && query && (
              <div className="text-center py-20 text-gray-400">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none"
                  stroke="#ddd" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
                  className="mx-auto mb-3">
                  <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
                </svg>
                <p className="font-semibold text-gray-500">No results for "{query}"</p>
                <p className="text-sm mt-1">Try a different name</p>
              </div>
            )}

            {!loading && !error && filtered.length > 0 && (
              <>
                {filtered.map((b, i) => (
                  <div key={b.billerid || i} className="bl-row"
                    style={{ animationDelay: `${Math.min(i * 28, 280)}ms` }}>
                    <BillerRow biller={b} onSelect={handleSelect} busy={busy} />
                  </div>
                ))}
                <p className="text-center text-xs text-gray-300 mt-6">
                  {query ? `${filtered.length} of ` : ""}{billers.length} billers
                </p>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default BillersList;