// src/modules/hotels/pages/HotelBookingPage.jsx
import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  FaMapMarkerAlt, FaStar, FaStarHalfAlt, FaRegStar,
  FaUser, FaCreditCard, FaLock, FaChevronLeft,
  FaCheck, FaExclamationTriangle, FaBed, FaWifi,
} from "react-icons/fa";
import { MdFreeBreakfast } from "react-icons/md";
import { Building2, ArrowLeft } from "lucide-react";

/* ─── helpers ────────────────────────────────────────────────────────────── */
const fmt = (n) => new Intl.NumberFormat("en-IN").format(Math.round(n ?? 0));

const fmtDate = (iso) =>
  new Date(iso).toLocaleDateString("en-IN", {
    weekday: "short", day: "numeric", month: "short", year: "numeric",
  });

const nights = (cin, cout) => {
  const d = (new Date(cout) - new Date(cin)) / 86400000;
  return d > 0 ? d : 1;
};

const getStars = (ratings = []) => {
  const ntm  = ratings.find(r => r.provider === "NTM");
  const giata = ratings.find(r => r.provider === "GIATA");
  return ntm?.value || giata?.value || 0;
};

/* ─── card helpers ───────────────────────────────────────────────────────── */
const detectCard = (num) => {
  const n = num.replace(/\s/g, "");
  if (/^4/.test(n))          return { code: "VI", label: "Visa" };
  if (/^5[1-5]/.test(n))     return { code: "CA", label: "Mastercard" };
  if (/^3[47]/.test(n))      return { code: "AX", label: "Amex" };
  if (/^6(?:011|5)/.test(n)) return { code: "DS", label: "Discover" };
  return { code: "VI", label: "Card" };
};

const fmtCardNum = (v) =>
  v.replace(/\D/g, "").slice(0, 16).replace(/(.{4})/g, "$1 ").trim();

const fmtExpiry = (v) => {
  const d = v.replace(/\D/g, "").slice(0, 4);
  return d.length >= 3 ? d.slice(0, 2) + "/" + d.slice(2) : d;
};

/* ─── micro components ───────────────────────────────────────────────────── */
const Stars = ({ value }) => {
  if (!value) return null;
  return (
    <span className="flex items-center gap-0.5">
      {Array.from({ length: 5 }, (_, i) => {
        if (i < Math.floor(value))
          return <FaStar key={i} className="text-amber-400 w-3 h-3" />;
        if (i === Math.floor(value) && value % 1 >= 0.5)
          return <FaStarHalfAlt key={i} className="text-amber-400 w-3 h-3" />;
        return <FaRegStar key={i} className="text-amber-200 w-3 h-3" />;
      })}
    </span>
  );
};

const Field = ({ label, error, required, children }) => (
  <div>
    <label className="block text-xs font-semibold text-gray-600 mb-1">
      {label}
      {required && <span className="text-red-500 ml-0.5">*</span>}
    </label>
    {children}
    {error && (
      <p className="text-[11px] text-red-500 mt-0.5 flex items-center gap-1">
        <FaExclamationTriangle className="w-2.5 h-2.5 flex-shrink-0" />
        {error}
      </p>
    )}
  </div>
);

const Inp = ({ error, className = "", ...props }) => (
  <input
    {...props}
    className={`w-full border rounded-xl px-3 py-2.5 text-sm outline-none transition-colors
      ${error
        ? "border-red-300 bg-red-50 focus:border-red-400"
        : "border-gray-200 bg-white focus:border-[#FD561E]"}
      ${className}`}
  />
);

/* ─── Hotel summary (right panel / mobile bottom) ────────────────────────── */
const HotelSummary = ({ hotel, rate, checkinDate, checkoutDate, guests }) => {
  const p       = hotel?.propertyInfo;
  const stars   = getStars(p?.ratings || []);
  const image   = p?.imageURLs?.[0]?.url;
  const n       = nights(checkinDate, checkoutDate);
  const perNight = rate?.averageNightlyTotalPrice?.amount;
  const taxes   = rate?.totalTaxes?.amount ?? 0;
  const total   = rate?.totalPrice?.amount ?? 0;
  const nightly = rate?.price?.nightlyRatesBreakdown || [];

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      {image && (
        <div className="h-36 sm:h-40 overflow-hidden">
          <img src={image} alt={hotel.name}
            className="w-full h-full object-cover"
            onError={e => { e.target.style.display = "none"; }} />
        </div>
      )}
      <div className="p-4">
        <div className="flex items-start justify-between gap-2 mb-1">
          <h2 className="font-bold text-gray-900 text-sm leading-tight">{hotel.name}</h2>
          <Stars value={stars} />
        </div>
        {p?.address && (
          <div className="flex items-start gap-1 text-xs text-gray-500 mb-3">
            <FaMapMarkerAlt className="w-2.5 h-2.5 text-[#FD561E] flex-shrink-0 mt-0.5" />
            <span className="line-clamp-1">
              {[p.address.street, p.address.city].filter(Boolean).join(", ")}
            </span>
          </div>
        )}

        {/* dates */}
        <div className="grid grid-cols-2 gap-2 mb-3">
          {[
            { label: "Check-in",  val: checkinDate,  sub: "From 3:00 PM" },
            { label: "Check-out", val: checkoutDate, sub: "By 12:00 PM" },
          ].map(({ label, val, sub }) => (
            <div key={label} className="bg-gray-50 rounded-xl p-2">
              <div className="text-[10px] text-gray-400 font-semibold uppercase tracking-wide mb-0.5">{label}</div>
              <div className="text-xs font-bold text-gray-800">{fmtDate(val)}</div>
              <div className="text-[10px] text-gray-400">{sub}</div>
            </div>
          ))}
        </div>

        {/* guests */}
        <div className="flex items-center gap-3 text-xs text-gray-500 mb-3 pb-3 border-b border-gray-50">
          <span><FaBed className="inline text-[#FD561E] mr-1" />{guests.rooms} Room{guests.rooms > 1 ? "s" : ""}</span>
          <span><FaUser className="inline text-[#FD561E] mr-1" />{guests.adults} Adult{guests.adults > 1 ? "s" : ""}</span>
          <span>{n} Night{n > 1 ? "s" : ""}</span>
        </div>

        {/* badges */}
        <div className="flex flex-wrap gap-1.5 mb-3">
          {rate?.wifiIncluded && (
            <span className="text-[10px] bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded font-medium flex items-center gap-0.5">
              <FaWifi className="w-2.5 h-2.5" /> WiFi
            </span>
          )}
          {rate?.breakfastIncluded && (
            <span className="text-[10px] bg-green-50 text-green-600 px-1.5 py-0.5 rounded font-medium flex items-center gap-0.5">
              <MdFreeBreakfast className="w-2.5 h-2.5" /> Breakfast
            </span>
          )}
          {rate?.terms?.refundable && (
            <span className="text-[10px] bg-emerald-50 text-emerald-600 px-1.5 py-0.5 rounded font-medium">
              ✓ Free cancellation
            </span>
          )}
        </div>

        {/* price breakdown */}
        <div className="bg-gray-50 rounded-xl p-3 space-y-1.5">
          <div className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Price Breakdown</div>
          {nightly.length > 0 ? (
            nightly.map((nr, i) => (
              <div key={i} className="flex justify-between text-xs text-gray-600">
                <span>{fmtDate(nr.localDate || nr.startDate)}</span>
                <span>₹{fmt(nr.totalPrice?.amount ?? nr.Amount?.Total ?? 0)}</span>
              </div>
            ))
          ) : perNight ? (
            <div className="flex justify-between text-xs text-gray-600">
              <span>₹{fmt(perNight)} × {n} night{n > 1 ? "s" : ""}</span>
              <span>₹{fmt(perNight * n)}</span>
            </div>
          ) : null}
          {taxes > 0 && (
            <div className="flex justify-between text-xs text-gray-400 border-t border-gray-100 pt-1.5">
              <span>Taxes & Fees</span>
              <span>₹{fmt(taxes)}</span>
            </div>
          )}
          <div className="flex justify-between text-sm font-black text-gray-900 border-t border-gray-200 pt-2">
            <span>Total</span>
            <span className="text-[#FD561E]">₹{fmt(total)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ════════════════════════════════════════════════════════════════════════════
   MAIN PAGE
════════════════════════════════════════════════════════════════════════════ */
const HotelBookingPage = () => {
  const { state } = useLocation();
  const navigate  = useNavigate();

  const [loading,  setLoading]  = useState(false);
  const [apiError, setApiError] = useState(null);
  const [errors,   setErrors]   = useState({});

  /* ── read logged-in user ── */
  const loggedUser = (() => {
    try { return JSON.parse(localStorage.getItem("user") || "null"); }
    catch { return null; }
  })();
  const isLoggedIn = !!loggedUser;

  /* ── form state ── */
  const [traveler, setTraveler] = useState({
    prefix:  loggedUser?.prefix || "Mr",
    given:   loggedUser?.firstName || loggedUser?.name?.split(" ")[0] || "",
    surname: loggedUser?.lastName  || loggedUser?.name?.split(" ")[1] || "",
    email:   loggedUser?.email  || "",
    phone:   loggedUser?.mobile || loggedUser?.phone || "",
  });

  const [card, setCard] = useState({
    number:     "",
    expiry:     "",
    cvv:        "",
    holderName: loggedUser?.name || "",
    street:     "",
    city:       "",
    state:      "",
    pincode:    "",
  });

  /* ── guard ── */
  if (!state?.hotel || !state?.rate) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-gray-50 px-4">
        <Building2 className="w-12 h-12 text-gray-300" />
        <p className="text-gray-500 font-medium text-center">No booking details found.</p>
        <button onClick={() => navigate("/hotels")}
          className="px-5 py-2.5 bg-[#FD561E] text-white rounded-xl font-bold text-sm hover:bg-[#e54d1a] transition-colors">
          Back to Search
        </button>
      </div>
    );
  }

  const { hotel, rate, checkinDate, checkoutDate, guests, location: searchLocation, lat, lng } = state;

  /* ── validation ── */
  const validate = () => {
    const e = {};
    if (!traveler.given.trim())   e.given   = "First name required";
    if (!traveler.surname.trim()) e.surname = "Last name required";
    if (!traveler.email.trim() || !/\S+@\S+\.\S+/.test(traveler.email)) e.email = "Valid email required";
    if (traveler.phone.replace(/\D/g, "").length < 10) e.phone = "Valid 10-digit phone required";
    if (card.number.replace(/\s/g, "").length < 15)    e.cardNumber  = "Valid card number required";
    if (card.expiry.length < 5)                         e.expiry      = "Valid expiry (MM/YY) required";
    if (card.cvv.length < 3)                            e.cvv         = "Valid CVV required";
    if (!card.holderName.trim())                        e.holderName  = "Card holder name required";
    if (!card.city.trim())                              e.city        = "City required";
    if (!card.pincode.trim())                           e.pincode     = "Pincode required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  /* ── build payload (matches Document 6 format) ── */
  const buildPayload = () => {
    const rawCard = card.number.replace(/\s/g, "");
    const { code: cardCode } = detectCard(rawCard);
    const [expMM = "", expYY = ""] = card.expiry.split("/");
    return {
      ReservationDetail: {
        Offer: [{
          "@type": "Offer",
          Identifier: { authority: "TVPT" },
          Product: [{
            "@type":       "ProductHospitality",
            bookingCode:   rate.bookingCode,
            Quantity:      guests.rooms,
            guests:        guests.adults,
            PropertyKey: {
              "@type":      "PropertyKey",
              chainCode:    hotel.chainCode,
              propertyCode: hotel.propertyCode,
            },
            DateRange: { start: checkinDate, end: checkoutDate },
          }],
          Price: {
            "@type":     "PriceDetail",
            CurrencyCode: { value: "INR" },
            Base:         rate.price?.base       ?? 0,
            TotalTaxes:   rate.price?.totalTaxes ?? 0,
            TotalPrice:   rate.totalPrice?.amount ?? 0,
          },
        }],
        Traveler: [{
          "@type": "Traveler",
          PersonName: {
            "@type":  "PersonName",
            Prefix:   traveler.prefix,
            Given:    traveler.given.trim(),
            Surname:  traveler.surname.trim(),
          },
          Telephone: [{
            "@type":           "TelephoneDetail",
            countryAccessCode: "91",
            areaCityCode:      traveler.phone.replace(/\D/g, "").slice(0, 2),
            phoneNumber:       traveler.phone.replace(/\D/g, ""),
          }],
          Email: [{ value: traveler.email.trim() }],
        }],
        FormOfPayment: [{
          "@type": "FormOfPaymentPaymentCard",
          PaymentCard: {
            "@type":        "PaymentCardDetail",
            CardType:       "Credit",
            CardCode:       cardCode,
            CardHolderName: card.holderName.trim(),
            expireDate:     `${expMM}${expYY}`,
            CardNumber:  { "@type": "CardNumber",  PlainText: rawCard },
            SeriesCode:  { "@type": "SeriesCode",  PlainText: card.cvv },
            Address: {
              "@type":     "AddressDetail",
              AddressLine: [card.street.trim() || "NA"],
              City:        card.city.trim(),
              StateProv:   { value: card.state.trim() || "NA" },
              Country:     { value: "IN" },
              PostalCode:  card.pincode.trim(),
            },
            Telephone: [{
              "@type":           "TelephoneDetail",
              countryAccessCode: "91",
              areaCityCode:      "98",
              phoneNumber:       traveler.phone.replace(/\D/g, ""),
            }],
          },
        }],
        Payment: [{
          "@type":       "Payment",
          Amount: { code: "INR", value: rate.totalPrice?.amount ?? 0 },
          depositInd:   false,
          guaranteeInd: true,
        }],
      },
    };
  };

  /* ── submit ── */
  const handleConfirm = async () => {
    if (!validate()) {
      // scroll to first error on mobile
      document.querySelector(".text-red-500")?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }
    setLoading(true);
    setApiError(null);
    try {
      const payload = buildPayload();
      console.log("🔵 Hotel Reserve Payload:", JSON.stringify(payload, null, 2));

      const token = localStorage.getItem("token") || localStorage.getItem("authToken") || "";
      const res = await fetch("https://api.bobros.org/hotel/reserve", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const t = await res.text().catch(() => "");
        let msg = `Reservation failed (${res.status})`;
        try { const b = JSON.parse(t); msg = b?.message || b?.error || msg; } catch {}
        throw new Error(msg);
      }

      const data = await res.json();
      console.log("✅ Hotel Reserve Response:", data);

      navigate("/hotels/confirmation", {
        state: { reservation: data, hotel, rate, checkinDate, checkoutDate, guests, traveler, searchLocation },
        replace: true,
      });
    } catch (err) {
      console.error("❌ Hotel reserve error:", err);
      setApiError(err.message || "Reservation failed. Please try again.");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } finally {
      setLoading(false);
    }
  };

  const setT = (k, v) => { setTraveler(p => ({ ...p, [k]: v })); setErrors(p => ({ ...p, [k]: "" })); };
  const setC = (k, v) => { setCard(p => ({ ...p, [k]: v }));     setErrors(p => ({ ...p, [k]: "" })); };

  /* ── confirm button (reused in two places) ── */
  const ConfirmBtn = () => (
    <button onClick={handleConfirm} disabled={loading}
      className="w-full bg-gradient-to-r from-[#FD561E] to-[#ff7b4a] text-white py-3.5 rounded-2xl font-bold text-sm shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
      {loading
        ? <><div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" /> Confirming Reservation…</>
        : <><FaLock className="w-3.5 h-3.5" /> Confirm & Pay ₹{fmt(rate?.totalPrice?.amount)}</>
      }
    </button>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ── Sticky top bar ── */}
      <div className="bg-white border-b border-gray-100 shadow-sm sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-3 flex items-center gap-3">
          <button onClick={() => navigate(-1)}
            className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-[#FD561E] transition-colors font-medium">
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Back to Results</span>
          </button>
          <div className="h-5 w-px bg-gray-200 hidden sm:block" />
          <h1 className="text-sm font-bold text-gray-800">Complete Your Booking</h1>
          <div className="ml-auto flex items-center gap-1.5 text-xs text-green-600 font-medium">
            <FaLock className="w-3 h-3" />
            <span className="hidden sm:inline">Secure</span>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-5">

        {/* API Error banner */}
        {apiError && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-3.5 flex items-start gap-3 mb-5">
            <FaExclamationTriangle className="text-red-500 w-4 h-4 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-red-700">Reservation Failed</p>
              <p className="text-xs text-red-600 mt-0.5">{apiError}</p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

          {/* ════ LEFT: forms ════ */}
          <div className="lg:col-span-2 space-y-4">

            {/* logged-in banner */}
            {isLoggedIn && (
              <div className="bg-green-50 border border-green-200 rounded-xl px-4 py-2.5 flex items-center gap-2 text-sm text-green-700 flex-wrap">
                <FaCheck className="w-3.5 h-3.5 flex-shrink-0" />
                Booking as <strong className="ml-1">{traveler.given} {traveler.surname}</strong>
                <span className="text-green-500">({traveler.email})</span>
              </div>
            )}

            {/* ── Guest Details ── */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-5">
              <h2 className="font-bold text-gray-800 text-sm mb-4 flex items-center gap-2">
                <FaUser className="text-[#FD561E]" /> Guest Details
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-3">
                <Field label="Title" required>
                  <select value={traveler.prefix} onChange={e => setT("prefix", e.target.value)}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-[#FD561E] bg-white">
                    {["Mr","Mrs","Ms","Dr","Prof"].map(p => <option key={p}>{p}</option>)}
                  </select>
                </Field>
                <Field label="First Name" error={errors.given} required>
                  <Inp value={traveler.given} onChange={e => setT("given", e.target.value)}
                    placeholder="John" error={errors.given} readOnly={isLoggedIn} />
                </Field>
                <Field label="Last Name" error={errors.surname} required className="col-span-2 sm:col-span-1">
                  <Inp value={traveler.surname} onChange={e => setT("surname", e.target.value)}
                    placeholder="Smith" error={errors.surname} readOnly={isLoggedIn} />
                </Field>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Field label="Email" error={errors.email} required>
                  <Inp type="email" value={traveler.email} onChange={e => setT("email", e.target.value)}
                    placeholder="john@example.com" error={errors.email} readOnly={isLoggedIn} />
                </Field>
                <Field label="Phone" error={errors.phone} required>
                  <Inp type="tel" value={traveler.phone}
                    onChange={e => setT("phone", e.target.value.replace(/\D/g, "").slice(0, 10))}
                    placeholder="9876543210" error={errors.phone} />
                </Field>
              </div>
              {isLoggedIn && (
                <p className="text-[11px] text-gray-400 mt-2.5">
                  * Details pre-filled from your account. Only phone is editable.
                </p>
              )}
            </div>

            {/* ── Payment ── */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-5">
              <h2 className="font-bold text-gray-800 text-sm mb-1 flex items-center gap-2">
                <FaCreditCard className="text-[#FD561E]" /> Payment Details
              </h2>
              <p className="text-[11px] text-gray-400 mb-4 flex items-center gap-1">
                <FaLock className="w-2.5 h-2.5 text-green-500" /> Your card details are encrypted and secure
              </p>

              {/* card number */}
              <div className="mb-3">
                <Field label="Card Number" error={errors.cardNumber} required>
                  <div className="relative">
                    <Inp value={card.number}
                      onChange={e => setC("number", fmtCardNum(e.target.value))}
                      placeholder="1234 5678 9012 3456" maxLength={19} error={errors.cardNumber} />
                    {card.number.length >= 4 && (
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] font-bold text-gray-400">
                        {detectCard(card.number).label}
                      </span>
                    )}
                  </div>
                </Field>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-3">
                <Field label="Expiry (MM/YY)" error={errors.expiry} required>
                  <Inp value={card.expiry}
                    onChange={e => setC("expiry", fmtExpiry(e.target.value))}
                    placeholder="08/28" maxLength={5} error={errors.expiry} />
                </Field>
                <Field label="CVV" error={errors.cvv} required>
                  <div className="relative">
                    <Inp type="password" value={card.cvv}
                      onChange={e => setC("cvv", e.target.value.replace(/\D/g, "").slice(0, 4))}
                      placeholder="•••" maxLength={4} error={errors.cvv} />
                    <FaLock className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-300 w-3 h-3" />
                  </div>
                </Field>
              </div>

              <div className="mb-4">
                <Field label="Card Holder Name" error={errors.holderName} required>
                  <Inp value={card.holderName}
                    onChange={e => setC("holderName", e.target.value)}
                    placeholder="John Smith" error={errors.holderName} />
                </Field>
              </div>

              {/* billing address */}
              <div className="pt-4 border-t border-gray-50">
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
                  Billing Address
                </h3>
                <div className="space-y-3">
                  <Field label="Street">
                    <Inp value={card.street} onChange={e => setC("street", e.target.value)}
                      placeholder="123, MG Road" />
                  </Field>
                  <div className="grid grid-cols-2 gap-3">
                    <Field label="City" error={errors.city} required>
                      <Inp value={card.city} onChange={e => setC("city", e.target.value)}
                        placeholder="Hyderabad" error={errors.city} />
                    </Field>
                    <Field label="State">
                      <Inp value={card.state} onChange={e => setC("state", e.target.value)}
                        placeholder="Telangana" />
                    </Field>
                  </div>
                  <Field label="Pincode" error={errors.pincode} required>
                    <Inp value={card.pincode}
                      onChange={e => setC("pincode", e.target.value.replace(/\D/g, "").slice(0, 6))}
                      placeholder="500001" maxLength={6} error={errors.pincode} />
                  </Field>
                </div>
              </div>
            </div>

            {/* mobile confirm */}
            <div className="lg:hidden">
              <ConfirmBtn />
              <p className="text-center text-[10px] text-gray-400 mt-2">
                By confirming, you agree to the terms and cancellation policy.
              </p>
            </div>
          </div>

          {/* ════ RIGHT: summary ════ */}
          <div className="space-y-4">
            <HotelSummary
              hotel={hotel} rate={rate}
              checkinDate={checkinDate} checkoutDate={checkoutDate} guests={guests}
            />

            {/* cancellation notice */}
            {rate?.terms?.cancelPenalties?.[0]?.cancelShortDescription && (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-700">
                <p className="font-semibold mb-0.5">⚠ Cancellation Policy</p>
                <p className="leading-relaxed">{rate.terms.cancelPenalties[0].cancelShortDescription}</p>
              </div>
            )}

            {/* desktop confirm */}
            <div className="hidden lg:block">
              <ConfirmBtn />
              <p className="text-center text-[10px] text-gray-400 mt-2">
                By confirming, you agree to the terms and cancellation policy.
              </p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default HotelBookingPage;