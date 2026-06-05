import { useEffect, useState } from "react";

const TICKET_API_URL = "https://api.bobros.org/flights/verify/";

export default function FlightPaymentResult() {
  const [params, setParams]           = useState(null);
  const [ticketState, setTicketState] = useState("idle");
  const [ticketData, setTicketData]   = useState(null);
  const [ticketError, setTicketError] = useState("");
  const [expanded, setExpanded]       = useState(false);

  useEffect(() => {
    const sp   = new URLSearchParams(window.location.search);
    const data = {
      success:       sp.get("success") === "true",
      authStatus:    sp.get("authStatus")             || "",
      statusMessage: sp.get("statusMessage")          || "",
      amount:        sp.get("amount")                 || "",
      transactionid: sp.get("transactionid")          || "",
      bdorderid:     sp.get("bdorderid")              || "",
      passengerName: sp.get("passenger_name")         || "",
      userId:        sp.get("user_id")                || "",
      universal:     sp.get("universal_locator_code") || "",
      air:           sp.get("air_locator_code")       || "",
      provider:      sp.get("provider_locator_code")  || "",
    };

    setParams(data);

    const traceId           = localStorage.getItem("flight_pnr_traceId");
    const bdOrderIdFromStorage = localStorage.getItem("flight_bd_orderid");
    const orderId = bdOrderIdFromStorage || data.bdorderid || data.transactionid || "";

    if (data.authStatus !== "0300") return;
    if (!orderId) { setTicketError("Order ID missing"); setTicketState("error"); return; }
    if (!traceId) { setTicketError("traceId not found in localStorage"); setTicketState("error"); return; }

    const body = { gateway: "billdesk", source: "web", billdesk_order_id: orderId, traceId };
    callTicketAPI(body);
  }, []);

  // Auto-expand when ticket data arrives
  useEffect(() => {
    if (ticketState === "success" && ticketData) {
      setTimeout(() => setExpanded(true), 400);
    }
  }, [ticketState, ticketData]);
  
  const callTicketAPI = async (body) => {
    setTicketState("loading");
    try {
      console.log("[callTicketAPI] Request body:", JSON.stringify(body, null, 2));

      const res  = await fetch(TICKET_API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const raw  = await res.text();

      console.log(`[callTicketAPI] Response status: ${res.status}`);
      console.log("[callTicketAPI] Response raw:", raw);

      if (!res.ok) throw new Error(`HTTP ${res.status}: ${raw}`);
      const data = JSON.parse(raw);
      setTicketData(data);
      setTicketState("success");
    } catch (err) {
      console.error("[callTicketAPI] Error:", err.message);
      setTicketState("error");
    }
  };
  

  if (!params) return <Loader />;

  const ok      = params.authStatus === "0300";
  const etr     = ticketData?.data?.["SOAP:Envelope"]?.["SOAP:Body"]?.["air:AirTicketingRsp"]?.["air:ETR"];
  const pricing = etr?.["air:AirPricingInfo"];
  const traveler= etr?.["common_v54_0:BookingTraveler"];
  const ticket  = etr?.["air:Ticket"];
  const coupons = ticket?.["air:Coupon"] || [];
  const taxes   = pricing?.["air:TaxInfo"] || [];
  const baggage = etr?.["air:BaggageAllowances"];
  const changePenalty = pricing?.["air:ChangePenalty"];
  const cancelPenalty = pricing?.["air:CancelPenalty"];
  const pnr     = etr?.["air:AirReservationLocatorCode"];
  const supplierLocator = etr?.["common_v54_0:SupplierLocator"]?.["$"]?.SupplierLocatorCode;

  const fmt = (iso) => {
    if (!iso) return "—";
    const d = new Date(iso);
    return d.toLocaleString("en-IN", { day:"2-digit", month:"short", year:"numeric", hour:"2-digit", minute:"2-digit", hour12:true });
  };
  const fmtTime = (iso) => {
    if (!iso) return "—";
    return new Date(iso).toLocaleTimeString("en-IN", { hour:"2-digit", minute:"2-digit", hour12:false });
  };
  const fmtDate = (iso) => {
    if (!iso) return "—";
    return new Date(iso).toLocaleDateString("en-IN", { day:"2-digit", month:"short", year:"numeric" });
  };

  const carryOn = baggage?.["air:CarryOnAllowanceInfo"];
  const carryOnArr = Array.isArray(carryOn) ? carryOn : carryOn ? [carryOn] : [];
  const checkedText = baggage?.["air:BaggageAllowanceInfo"]?.["air:TextInfo"]?.["air:Text"]?.[0] || "15K";

  return (
    <>
      <style>{STYLES}</style>
      <div className="pr-page">

        {/* ── Top strip ── */}
        <div className={`pr-strip ${ok ? "pr-strip--ok" : "pr-strip--fail"}`}>
          <div className={`pr-strip__icon-wrap ${ok ? "ok" : "fail"}`}>
            <span>{ok ? "✓" : "✕"}</span>
          </div>
          <div className="pr-strip__text">
            <p className="pr-strip__title">{ok ? "Payment Successful" : "Payment Failed"}</p>
            <p className="pr-strip__sub">
              {params.statusMessage || (ok ? "Your booking is confirmed." : "Transaction could not be completed.")}
            </p>
          </div>
          {ok && params.amount && (
            <div className="pr-strip__amount">
              <span className="pr-strip__amount-label">Paid</span>
              <span className="pr-strip__amount-value">₹{params.amount}</span>
            </div>
          )}
        </div>

        <div className="pr-body">

          {/* ── Ticket-issue pill ── */}
          {ok && (
            <div className={`pr-pill pr-pill--${ticketState}`}>
              {ticketState === "loading" && <><span className="pr-pill__spin" />Issuing your e-ticket…</>}
              {ticketState === "success" && <><span className="pr-pill__check">✓</span>E-ticket issued successfully</>}
              {ticketState === "error"   && `✕ Ticket failed — ${ticketError}`}
              {ticketState === "idle"    && "Preparing ticket…"}
            </div>
          )}

          {/* ── Summary cards ── */}
          <div className="pr-grid">
            <Card title="Payment" icon="💳">
              <Row label="Status"         value={params.authStatus || "—"} badge ok={ok} />
              <Row label="Transaction ID" value={params.transactionid || "—"} mono />
              <Row label="Order ID"       value={params.bdorderid    || "—"} mono />
            </Card>

            <Card title="Passenger" icon="👤">
              <Row label="Name"    value={params.passengerName || "—"} />
              <Row label="User ID" value={params.userId        || "—"} mono />
            </Card>

            <Card title="Booking References" icon="🔖" full>
              <Row label="Universal Locator" value={params.universal || "—"} mono large />
              <Row label="Air Locator"        value={params.air       || "—"} mono />
              <Row label="Provider Locator"   value={params.provider  || "—"} mono />
            </Card>
          </div>

          {/* ── Ticket section (expands after success) ── */}
          {ok && ticketState === "success" && etr && (
            <div className={`pr-ticket-section ${expanded ? "pr-ticket-section--open" : ""}`}>

              {/* Section header */}
              <div className="pr-ticket-header">
                <div className="pr-ticket-header__left">
                  <span className="pr-ticket-header__icon">🎫</span>
                  <div>
                    <p className="pr-ticket-header__title">E-Ticket Confirmed</p>
                    <p className="pr-ticket-header__sub">Ticket No. {ticket?.["$"]?.TicketNumber || "—"}</p>
                  </div>
                </div>
                <div className="pr-ticket-header__badges">
                  {pricing?.["$"]?.Refundable === "true"   && <span className="pr-tag pr-tag--green">Refundable</span>}
                  {pricing?.["$"]?.Exchangeable === "true" && <span className="pr-tag pr-tag--blue">Exchangeable</span>}
                  <span className="pr-tag pr-tag--gray">{etr?.["$"]?.PlatingCarrier} · ECO VALUE</span>
                </div>
              </div>

              {/* PNR bar */}
              <div className="pr-pnr-bar">
                <div className="pr-pnr-item">
                  <span className="pr-pnr-item__label">PNR</span>
                  <span className="pr-pnr-item__value">{etr?.["$"]?.ProviderLocatorCode || "—"}</span>
                </div>
                <div className="pr-pnr-divider" />
                <div className="pr-pnr-item">
                  <span className="pr-pnr-item__label">Air Reservation</span>
                  <span className="pr-pnr-item__value">{pnr || "—"}</span>
                </div>
                <div className="pr-pnr-divider" />
                <div className="pr-pnr-item">
                  <span className="pr-pnr-item__label">Airline Locator</span>
                  <span className="pr-pnr-item__value">{supplierLocator || "—"}</span>
                </div>
                <div className="pr-pnr-divider" />
                <div className="pr-pnr-item">
                  <span className="pr-pnr-item__label">Issued</span>
                  <span className="pr-pnr-item__value">{fmtDate(etr?.["$"]?.IssuedDate)}</span>
                </div>
              </div>

              <div className="pr-ticket-body">

                {/* ── Flight Itinerary ── */}
                <div className="pr-section">
                  <p className="pr-section__title">✈ Flight Itinerary</p>
                  <div className="pr-flights">
                    {coupons.map((c, i) => {
                      const d = c["$"];
                      return (
                        <div key={i} className="pr-flight">
                          <div className="pr-flight__seg">
                            <span className="pr-flight__num">
                              {d.MarketingCarrier} {d.MarketingFlightNumber}
                            </span>
                            <span className="pr-flight__class">{d.CabinClass || "Economy"} · {d.BookingClass} · {d.FareBasis}</span>
                          </div>

                          <div className="pr-flight__route">
                            <div className="pr-flight__point">
                              <span className="pr-flight__iata">{d.Origin}</span>
                              <span className="pr-flight__time">{fmtTime(d.DepartureTime)}</span>
                              <span className="pr-flight__date">{fmtDate(d.DepartureTime)}</span>
                            </div>
                            <div className="pr-flight__line">
                              <span className="pr-flight__dot" />
                              <span className="pr-flight__track" />
                              <span className="pr-flight__plane">✈</span>
                              <span className="pr-flight__track" />
                              <span className="pr-flight__dot" />
                            </div>
                            <div className="pr-flight__point pr-flight__point--right">
                              <span className="pr-flight__iata">{d.Destination}</span>
                              <span className="pr-flight__time">—</span>
                              <span className="pr-flight__date">{fmtDate(d.NotValidAfter)}</span>
                            </div>
                          </div>

                          <div className="pr-flight__meta">
                            <span>Coupon {d.CouponNumber}</span>
                            <span className="pr-flight__status-dot" />
                            <span>Status: <b>{d.Status === "O" ? "Open" : d.Status}</b></span>
                            <span className="pr-flight__status-dot" />
                            <span>Valid: {fmtDate(d.NotValidBefore)}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* ── Passenger ── */}
                {traveler && (
                  <div className="pr-section">
                    <p className="pr-section__title">👤 Passenger Details</p>
                    <div className="pr-info-grid">
                      <InfoCell label="Full Name"  value={`${traveler["common_v54_0:BookingTravelerName"]?.["$"]?.Prefix} ${traveler["common_v54_0:BookingTravelerName"]?.["$"]?.First} ${traveler["common_v54_0:BookingTravelerName"]?.["$"]?.Last}`} />
                      <InfoCell label="Type"       value={`${traveler?.["$"]?.TravelerType} · Age ${traveler?.["$"]?.Age}`} />
                      <InfoCell label="Gender"     value={traveler?.["$"]?.Gender === "F" ? "Female" : "Male"} />
                      <InfoCell label="DOB"        value={fmtDate(traveler?.["$"]?.DOB)} />
                      <InfoCell label="Phone"      value={traveler?.["common_v54_0:PhoneNumber"]?.["$"]?.Number} />
                      <InfoCell label="Email"      value={traveler?.["common_v54_0:Email"]?.["$"]?.EmailID} />
                    </div>
                  </div>
                )}

                {/* ── Fare Breakdown ── */}
                <div className="pr-section">
                  <p className="pr-section__title">💰 Fare Breakdown</p>
                  <div className="pr-fare">
                    <div className="pr-fare__row">
                      <span>Base Fare</span>
                      <span>{etr?.["$"]?.BasePrice?.replace("INR","₹") || "—"}</span>
                    </div>
                    {taxes.map((t, i) => {
                      const td = t["$"];
                      return (
                        <div key={i} className="pr-fare__row pr-fare__row--tax">
                          <span>{TAX_LABELS[td.Category] || td.Category}</span>
                          <span>{td.Amount?.replace("INR","₹")}</span>
                        </div>
                      );
                    })}
                    <div className="pr-fare__divider" />
                    <div className="pr-fare__row pr-fare__row--total">
                      <span>Total</span>
                      <span>{etr?.["$"]?.TotalPrice?.replace("INR","₹") || "—"}</span>
                    </div>
                  </div>
                </div>

                {/* ── Baggage ── */}
                <div className="pr-section">
                  <p className="pr-section__title">🧳 Baggage Allowance</p>
                  <div className="pr-baggage">
                    <div className="pr-baggage__item">
                      <span className="pr-baggage__icon">🏷️</span>
                      <div>
                        <p className="pr-baggage__name">Checked Baggage</p>
                        <p className="pr-baggage__val">{checkedText}</p>
                      </div>
                    </div>
                    {carryOnArr.map((c, i) => (
                      <div key={i} className="pr-baggage__item">
                        <span className="pr-baggage__icon">🎒</span>
                        <div>
                          <p className="pr-baggage__name">Carry-on · {c["$"]?.Origin}→{c["$"]?.Destination}</p>
                          <p className="pr-baggage__val">{c?.["air:TextInfo"]?.["air:Text"] || "7K"}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* ── Penalties ── */}
                {(changePenalty || cancelPenalty) && (
                  <div className="pr-section">
                    <p className="pr-section__title">⚠ Change & Cancellation</p>
                    <div className="pr-penalties">
                      {changePenalty && (
                        <div className="pr-penalty">
                          <div className="pr-penalty__icon pr-penalty__icon--amber">✏</div>
                          <div>
                            <p className="pr-penalty__label">Change Fee</p>
                            <p className="pr-penalty__val">{changePenalty?.["air:Amount"]?.replace("INR","₹ ") || "—"}</p>
                            <p className="pr-penalty__note">Applies {changePenalty?.["$"]?.PenaltyApplies?.toLowerCase()}</p>
                          </div>
                        </div>
                      )}
                      {cancelPenalty && (
                        <div className="pr-penalty">
                          <div className="pr-penalty__icon pr-penalty__icon--red">✕</div>
                          <div>
                            <p className="pr-penalty__label">Cancellation Fee</p>
                            <p className="pr-penalty__val">{cancelPenalty?.["air:Amount"]?.replace("INR","₹ ") || "—"}</p>
                            <p className="pr-penalty__note">Applies {cancelPenalty?.["$"]?.PenaltyApplies?.toLowerCase()}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

              </div>
            </div>
          )}

          {/* ── Actions ── */}
          <div className="pr-actions">
            <a href="/" className="pr-btn pr-btn--ghost">← Home</a>
            {ok && <a href="/flights/my-bookings" className="pr-btn pr-btn--primary">My Bookings</a>}
          </div>

          {/* ── Debug ── */}
          <details className="pr-debug">
            <summary>Raw URL params</summary>
            <pre className="pr-pre">{JSON.stringify(params, null, 2)}</pre>
          </details>
          {ticketData && (
            <details className="pr-debug">
              <summary>Raw ticket API response</summary>
              <pre className="pr-pre">{JSON.stringify(ticketData, null, 2)}</pre>
            </details>
          )}

        </div>
      </div>
    </>
  );
}

/* ── Helpers ── */
const TAX_LABELS = {
  IN: "Airport Tax (IN)",
  K3: "GST (K3)",
  P2: "Passenger Service Fee (P2)",
  YQ: "Carrier Surcharge (YQ)",
  YR: "Insurance/Misc (YR)",
};

function Card({ title, icon, children, full }) {
  return (
    <div className={`pr-card${full ? " pr-card--full" : ""}`}>
      <p className="pr-card__head"><span>{icon}</span>{title}</p>
      {children}
    </div>
  );
}
function Row({ label, value, mono, large, badge, ok }) {
  return (
    <div className="pr-row">
      <span className="pr-row__label">{label}</span>
      {badge ? (
        <span className={`pr-badge ${ok ? "pr-badge--ok" : "pr-badge--fail"}`}>{value}</span>
      ) : (
        <span className={`pr-row__value${mono ? " pr-row__value--mono" : ""}${large ? " pr-row__value--large" : ""}`}>{value}</span>
      )}
    </div>
  );
}
function InfoCell({ label, value }) {
  return (
    <div className="pr-info-cell">
      <span className="pr-info-cell__label">{label}</span>
      <span className="pr-info-cell__value">{value || "—"}</span>
    </div>
  );
}
function Loader() {
  return (
    <>
      <style>{STYLES}</style>
      <div className="pr-loader">
        <div className="pr-loader__ring" />
        <p className="pr-loader__text">Reading payment response…</p>
      </div>
    </>
  );
}

/* ── Styles ── */
const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600&family=DM+Serif+Display&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  @keyframes spin    { to { transform: rotate(360deg); } }
  @keyframes fadeUp  { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:translateY(0); } }
  @keyframes slideDown {
    from { opacity:0; transform:translateY(-12px); max-height:0; }
    to   { opacity:1; transform:translateY(0);      max-height:2000px; }
  }

  .pr-page {
    min-height: 100vh;
    background: #f4f5f7;
    font-family: 'DM Sans', sans-serif;
    color: #111827;
  }

  /* ── Strip ── */
  .pr-strip {
    display: flex;
    align-items: center;
    gap: 20px;
    padding: 28px 36px;
    color: #fff;
    position: relative;
  }
  .pr-strip--ok   { background: linear-gradient(135deg, #0f172a 0%, #1e3a5f 100%); }
  .pr-strip--fail { background: linear-gradient(135deg, #7f1d1d 0%, #991b1b 100%); }

  .pr-strip__icon-wrap {
    width: 52px; height: 52px; border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    font-size: 22px; font-weight: 700; flex-shrink: 0;
  }
  .pr-strip__icon-wrap.ok   { background: rgba(34,197,94,.18); border: 1.5px solid rgba(34,197,94,.35); }
  .pr-strip__icon-wrap.fail { background: rgba(239,68,68,.18);  border: 1.5px solid rgba(239,68,68,.35); }

  .pr-strip__text { flex: 1; }
  .pr-strip__title {
    font-family: 'DM Serif Display', serif;
    font-size: 24px; font-weight: 400; letter-spacing: -.01em;
  }
  .pr-strip__sub { font-size: 13px; opacity: .65; margin-top: 3px; }

  .pr-strip__amount {
    display: flex; flex-direction: column; align-items: flex-end;
    background: rgba(255,255,255,.08);
    border: 1px solid rgba(255,255,255,.15);
    border-radius: 12px; padding: 10px 18px;
  }
  .pr-strip__amount-label { font-size: 10px; font-weight: 600; letter-spacing: .08em; text-transform: uppercase; opacity: .6; }
  .pr-strip__amount-value {
    font-family: 'DM Serif Display', serif;
    font-size: 28px; letter-spacing: -.02em; line-height: 1.1;
  }

  /* ── Body ── */
  .pr-body {
    max-width: 780px; margin: 0 auto;
    padding: 32px 20px 72px;
    animation: fadeUp .4s ease both;
  }

  /* ── Pill ── */
  .pr-pill {
    display: inline-flex; align-items: center; gap: 8px;
    padding: 9px 18px; border-radius: 100px;
    font-size: 13px; font-weight: 500;
    margin-bottom: 24px; border: 1.5px solid transparent;
  }
  .pr-pill--loading { background:#fffbeb; color:#92400e; border-color:#fde68a; }
  .pr-pill--success { background:#f0fdf4; color:#15803d; border-color:#bbf7d0; }
  .pr-pill--error   { background:#fef2f2; color:#b91c1c; border-color:#fecaca; }
  .pr-pill--idle    { background:#f1f5f9; color:#64748b; border-color:#e2e8f0; }
  .pr-pill__spin {
    width:13px; height:13px; border-radius:50%;
    border:2px solid #fde68a; border-top-color:#d97706;
    display:inline-block; animation:spin .7s linear infinite;
  }
  .pr-pill__check { font-size:14px; }

  /* ── Grid ── */
  .pr-grid {
    display: grid; grid-template-columns: 1fr 1fr;
    gap: 14px; margin-bottom: 20px;
  }
  @media (max-width: 560px) { .pr-grid { grid-template-columns: 1fr; } }

  /* ── Card ── */
  .pr-card {
    background: #fff; border: 1.5px solid #e5e7eb;
    border-radius: 14px; overflow: hidden;
    box-shadow: 0 1px 4px rgba(0,0,0,.04);
  }
  .pr-card--full { grid-column: 1 / -1; }
  .pr-card__head {
    display: flex; align-items: center; gap: 8px;
    padding: 13px 18px 10px;
    font-size: 11px; font-weight: 600; letter-spacing: .07em; text-transform: uppercase;
    color: #6b7280; border-bottom: 1px solid #f3f4f6;
  }
  .pr-row {
    display: flex; justify-content: space-between; align-items: center;
    padding: 11px 18px; border-bottom: 1px solid #f9fafb; gap: 12px;
  }
  .pr-row:last-child { border-bottom: none; }
  .pr-row__label { font-size: 12px; color: #9ca3af; flex-shrink: 0; }
  .pr-row__value { font-size: 13px; color: #111827; text-align: right; word-break: break-all; }
  .pr-row__value--mono  { font-family: 'Courier New', monospace; font-size: 12px; }
  .pr-row__value--large { font-family: 'DM Serif Display', serif; font-size: 20px; color: #111827; letter-spacing: -.01em; }

  .pr-badge { padding: 3px 10px; border-radius: 100px; font-size: 11px; font-weight: 600; }
  .pr-badge--ok   { background: #dcfce7; color: #15803d; }
  .pr-badge--fail { background: #fee2e2; color: #b91c1c; }

  /* ═══════════════════════════════════════════
     ── TICKET SECTION ──
  ═══════════════════════════════════════════ */
  .pr-ticket-section {
    background: #fff;
    border: 1.5px solid #d1fae5;
    border-radius: 18px;
    overflow: hidden;
    margin-bottom: 24px;
    box-shadow: 0 2px 16px rgba(16,185,129,.08);
    opacity: 0; transform: translateY(16px);
    transition: opacity .5s ease, transform .5s ease;
  }
  .pr-ticket-section--open {
    opacity: 1; transform: translateY(0);
  }

  /* Header */
  .pr-ticket-header {
    display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap;
    gap: 14px;
    padding: 20px 24px 18px;
    background: linear-gradient(135deg, #0f172a 0%, #1e3a5f 100%);
  }
  .pr-ticket-header__left { display: flex; align-items: center; gap: 14px; }
  .pr-ticket-header__icon {
    width: 44px; height: 44px; border-radius: 12px;
    background: rgba(255,255,255,.1); border: 1px solid rgba(255,255,255,.15);
    display: flex; align-items: center; justify-content: center; font-size: 20px;
  }
  .pr-ticket-header__title {
    font-family: 'DM Serif Display', serif;
    font-size: 18px; color: #fff; letter-spacing: -.01em;
  }
  .pr-ticket-header__sub { font-size: 12px; color: rgba(255,255,255,.55); margin-top: 2px; font-family: 'Courier New', monospace; }
  .pr-ticket-header__badges { display: flex; flex-wrap: wrap; gap: 6px; }

  .pr-tag {
    padding: 4px 10px; border-radius: 100px;
    font-size: 10px; font-weight: 600; letter-spacing: .05em; text-transform: uppercase;
  }
  .pr-tag--green { background: rgba(34,197,94,.15); color: #4ade80; border: 1px solid rgba(34,197,94,.25); }
  .pr-tag--blue  { background: rgba(59,130,246,.15); color: #93c5fd; border: 1px solid rgba(59,130,246,.25); }
  .pr-tag--gray  { background: rgba(255,255,255,.1); color: rgba(255,255,255,.65); border: 1px solid rgba(255,255,255,.15); }

  /* PNR bar */
  .pr-pnr-bar {
    display: flex; align-items: center; flex-wrap: wrap;
    padding: 14px 24px; gap: 0;
    background: #f8fffe; border-bottom: 1.5px solid #d1fae5;
  }
  .pr-pnr-item { display: flex; flex-direction: column; padding: 4px 20px 4px 0; }
  .pr-pnr-item:first-child { padding-left: 0; }
  .pr-pnr-item__label { font-size: 10px; font-weight: 600; letter-spacing: .07em; text-transform: uppercase; color: #9ca3af; margin-bottom: 2px; }
  .pr-pnr-item__value { font-family: 'Courier New', monospace; font-size: 14px; font-weight: 700; color: #0f172a; letter-spacing: .05em; }
  .pr-pnr-divider { width: 1px; height: 32px; background: #d1fae5; margin: 0 20px 0 0; align-self: center; }

  /* Body sections */
  .pr-ticket-body { padding: 8px 0 4px; }

  .pr-section { padding: 20px 24px; border-bottom: 1px solid #f3f4f6; }
  .pr-section:last-child { border-bottom: none; }
  .pr-section__title {
    font-size: 11px; font-weight: 700; letter-spacing: .08em; text-transform: uppercase;
    color: #6b7280; margin-bottom: 16px;
  }

  /* Flights */
  .pr-flights { display: flex; flex-direction: column; gap: 14px; }
  .pr-flight {
    background: #f9fafb; border: 1.5px solid #e5e7eb;
    border-radius: 14px; padding: 16px 20px; overflow: hidden;
  }
  .pr-flight__seg {
    display: flex; align-items: center; gap: 10px;
    margin-bottom: 16px;
  }
  .pr-flight__num {
    font-family: 'DM Serif Display', serif; font-size: 17px; color: #0f172a;
  }
  .pr-flight__class {
    font-size: 11px; color: #6b7280;
    background: #e5e7eb; padding: 3px 9px; border-radius: 6px;
  }

  .pr-flight__route {
    display: flex; align-items: center; gap: 0; margin-bottom: 12px;
  }
  .pr-flight__point { display: flex; flex-direction: column; align-items: flex-start; min-width: 72px; }
  .pr-flight__point--right { align-items: flex-end; }
  .pr-flight__iata { font-size: 26px; font-family: 'DM Serif Display', serif; font-weight: 400; color: #0f172a; line-height: 1; }
  .pr-flight__time { font-size: 14px; font-weight: 600; color: #374151; margin-top: 2px; }
  .pr-flight__date { font-size: 11px; color: #9ca3af; margin-top: 1px; }

  .pr-flight__line {
    flex: 1; display: flex; align-items: center;
    padding: 0 10px; position: relative; top: -6px;
  }
  .pr-flight__dot {
    width: 7px; height: 7px; border-radius: 50%;
    background: #d1d5db; flex-shrink: 0;
  }
  .pr-flight__track {
    flex: 1; height: 1.5px; background: #d1d5db;
  }
  .pr-flight__plane { font-size: 16px; color: #1e3a5f; margin: 0 2px; }

  .pr-flight__meta {
    display: flex; align-items: center; gap: 8px;
    font-size: 11px; color: #9ca3af;
  }
  .pr-flight__status-dot { width: 3px; height: 3px; border-radius: 50%; background: #d1d5db; }

  /* Info grid */
  .pr-info-grid {
    display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px;
  }
  @media (max-width: 560px) { .pr-info-grid { grid-template-columns: 1fr 1fr; } }
  .pr-info-cell {
    background: #f9fafb; border: 1px solid #e5e7eb;
    border-radius: 10px; padding: 12px 14px;
  }
  .pr-info-cell__label { display: block; font-size: 10px; font-weight: 600; letter-spacing: .06em; text-transform: uppercase; color: #9ca3af; margin-bottom: 4px; }
  .pr-info-cell__value { font-size: 13px; color: #111827; font-weight: 500; word-break: break-all; }

  /* Fare */
  .pr-fare {
    background: #f9fafb; border: 1.5px solid #e5e7eb;
    border-radius: 12px; overflow: hidden;
  }
  .pr-fare__row {
    display: flex; justify-content: space-between; align-items: center;
    padding: 11px 16px; font-size: 13px; color: #374151;
    border-bottom: 1px solid #f3f4f6;
  }
  .pr-fare__row:last-child { border-bottom: none; }
  .pr-fare__row--tax { color: #6b7280; font-size: 12px; padding-left: 24px; }
  .pr-fare__row--total {
    font-weight: 700; font-size: 15px; color: #0f172a;
    background: #fff; border-top: 1.5px solid #e5e7eb !important;
  }
  .pr-fare__divider { height: 0; }

  /* Baggage */
  .pr-baggage {
    display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 10px;
  }
  .pr-baggage__item {
    display: flex; align-items: flex-start; gap: 12px;
    background: #f9fafb; border: 1.5px solid #e5e7eb;
    border-radius: 12px; padding: 14px;
  }
  .pr-baggage__icon { font-size: 20px; flex-shrink: 0; }
  .pr-baggage__name { font-size: 12px; color: #6b7280; margin-bottom: 3px; }
  .pr-baggage__val  { font-size: 18px; font-family: 'DM Serif Display', serif; color: #0f172a; }

  /* Penalties */
  .pr-penalties { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
  @media (max-width: 460px) { .pr-penalties { grid-template-columns: 1fr; } }
  .pr-penalty {
    display: flex; align-items: flex-start; gap: 14px;
    background: #fafafa; border: 1.5px solid #e5e7eb;
    border-radius: 12px; padding: 16px;
  }
  .pr-penalty__icon {
    width: 36px; height: 36px; border-radius: 10px;
    display: flex; align-items: center; justify-content: center;
    font-size: 15px; font-weight: 700; flex-shrink: 0;
  }
  .pr-penalty__icon--amber { background: #fffbeb; color: #d97706; border: 1px solid #fde68a; }
  .pr-penalty__icon--red   { background: #fef2f2; color: #dc2626; border: 1px solid #fecaca; }
  .pr-penalty__label { font-size: 11px; color: #9ca3af; text-transform: uppercase; letter-spacing: .06em; font-weight: 600; }
  .pr-penalty__val   { font-size: 20px; font-family: 'DM Serif Display', serif; color: #0f172a; margin-top: 2px; }
  .pr-penalty__note  { font-size: 11px; color: #9ca3af; margin-top: 3px; text-transform: capitalize; }

  /* ── Actions ── */
  .pr-actions { display: flex; gap: 10px; flex-wrap: wrap; margin-bottom: 28px; }
  .pr-btn {
    padding: 11px 24px; border-radius: 10px;
    font-size: 13px; font-weight: 500; text-decoration: none;
    display: inline-block; font-family: 'DM Sans', sans-serif;
    transition: opacity .15s;
  }
  .pr-btn:hover { opacity: .82; }
  .pr-btn--primary { background: #0f172a; color: #fff; box-shadow: 0 1px 4px rgba(0,0,0,.18); }
  .pr-btn--ghost   { background: #fff; color: #374151; border: 1.5px solid #d1d5db; }

  /* ── Debug ── */
  .pr-debug {
    background: #fff; border: 1.5px solid #e5e7eb;
    border-radius: 12px; margin-bottom: 10px; overflow: hidden;
  }
  .pr-debug summary {
    padding: 12px 18px; font-size: 12px; color: #9ca3af;
    cursor: pointer; user-select: none; list-style: none;
  }
  .pr-debug summary::-webkit-details-marker { display: none; }
  .pr-debug[open] summary { border-bottom: 1px solid #f3f4f6; }

  .pr-pre {
    padding: 14px 18px; font-size: 11px; color: #475569;
    font-family: 'Courier New', monospace;
    white-space: pre-wrap; word-break: break-all; line-height: 1.7;
  }

  /* ── Loader ── */
  .pr-loader {
    min-height: 100vh; display: flex; flex-direction: column;
    align-items: center; justify-content: center;
    gap: 16px; background: #f4f5f7; font-family: 'DM Sans', sans-serif;
  }
  .pr-loader__ring {
    width: 36px; height: 36px; border-radius: 50%;
    border: 3px solid #e5e7eb; border-top-color: #0f172a;
    animation: spin .75s linear infinite;
  }
  .pr-loader__text { font-size: 13px; color: #9ca3af; }
`;