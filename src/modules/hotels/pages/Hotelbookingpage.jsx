// src/modules/hotels/pages/HotelBookingPage.jsx
import React, { useState, useEffect, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  FaMapMarkerAlt, FaUser, FaCreditCard, FaLock,
  FaExclamationTriangle, FaBed, FaTimesCircle,
  FaShieldAlt, FaBan, FaCheckCircle, FaSpinner,
} from "react-icons/fa";
import { MdFreeBreakfast } from "react-icons/md";
import { Building2, ArrowLeft } from "lucide-react";

/* ─── helpers ────────────────────────────────────────────────────────────── */
const fmt = (n) => {
  const num = Number(n);
  if (!n || isNaN(num)) return "0";
  return new Intl.NumberFormat("en-IN").format(Math.round(num));
};

const fmtDate = (iso) =>
  iso ? new Date(iso).toLocaleDateString("en-IN", {
    weekday: "short", day: "numeric", month: "short", year: "numeric",
  }) : "—";

const nightsCount = (cin, cout) => {
  if (!cin || !cout) return 1;
  const d = (new Date(cout) - new Date(cin)) / 86400000;
  return d > 0 ? d : 1;
};

/* ─── extract price ──────────────────────────────────────────────────────── */
const extractPrice = (rate, rulesData) => {
  if (rulesData) {
    const offer = rulesData?.OfferHospitalityResponse?.Offer || {};
    const price = offer?.Price || {};
    if (price.TotalPrice > 0) {
      return {
        base: Number(price.Base) || 0,
        taxes: Number(price.TotalTaxes) || 0,
        total: Number(price.TotalPrice) || 0,
        perNight: 0,
      };
    }
  }
  if (rate) {
    const a = rate?.price?.totalPrice?.amount;
    const b = rate?.totalPrice?.amount;
    const c = rate?.price?.TotalPrice;
    const d = rate?.TotalPrice;
    const perNight = Number(
      rate?.price?.averageNightlyTotalPrice?.amount
      || rate?.averageNightlyTotalPrice?.amount || 0
    );
    const perNightTax = Number(
      rate?.price?.averageNightlyTaxesPrice?.amount
      || rate?.averageNightlyTaxesPrice?.amount || 0
    );
    const taxTotal = Number(
      rate?.price?.totalTaxes?.amount || rate?.totalTaxes?.amount
      || rate?.price?.TotalTaxes || rate?.TotalTaxes || 0
    );
    const total = Number(a || b || c || d || 0);
    const base = total - taxTotal > 0 ? total - taxTotal : Number(rate?.price?.Base || rate?.Base || 0);
    if (total > 0) return { base, taxes: taxTotal, total, perNight };
    if (perNight > 0) return { base: perNight, taxes: perNightTax, total: perNight + perNightTax, perNight };
  }
  return { base: 0, taxes: 0, total: 0, perNight: 0 };
};

/* ─── parse rules info ───────────────────────────────────────────────────── */
const getRulesInfo = (rulesData) => {
  if (!rulesData) return {};
  const offer = rulesData?.OfferHospitalityResponse?.Offer || {};
  const terms = offer?.TermsAndConditionsFull?.[0] || {};
  const txtBlks = terms?.TextBlock || [];
  const getBlock = (title) =>
    txtBlks.find(b => b.title?.toLowerCase() === title.toLowerCase())
           ?.TextFormatted?.[0]?.value || "";
  const cancelPenalty = terms?.CancelPenalty?.[0] || null;
  return {
    cancelDesc: cancelPenalty?.Description || getBlock("Cancellation") || "",
    refundable: cancelPenalty?.Refundable !== "No",
    checkIn:    terms?.CheckInOutPolicy?.checkInTime  || "",
    checkOut:   terms?.CheckInOutPolicy?.checkOutTime || "",
    breakfast:  terms?.MealsIncluded?.breakfastInd || false,
  };
};

/* ─── card helpers ───────────────────────────────────────────────────────── */
const detectCard = (num) => {
  const n = num.replace(/\s/g, "");
  if (/^4/.test(n))          return { code: "VI", label: "Visa" };
  if (/^5[1-5]/.test(n))     return { code: "MC", label: "Mastercard" };
  if (/^3[47]/.test(n))      return { code: "AX", label: "Amex" };
  if (/^6(?:011|5)/.test(n)) return { code: "DS", label: "Discover" };
  if (/^35/.test(n))         return { code: "JC", label: "JCB" };
  return { code: "VI", label: "Card" };
};
const fmtCardNum = (val) => val.replace(/\D/g, "").slice(0, 16).replace(/(.{4})/g, "$1 ").trim();
const fmtExpiry  = (val) => {
  const d = val.replace(/\D/g, "").slice(0, 4);
  return d.length >= 3 ? `${d.slice(0,2)}/${d.slice(2)}` : d;
};

/* ─── Field ──────────────────────────────────────────────────────────────── */
const Field = React.memo(({ label, error, children }) => (
  <div>
    <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
      {label}
    </label>
    {children}
    {error && (
      <p className="text-[11px] text-red-500 mt-1 flex items-center gap-1">
        <FaExclamationTriangle className="w-2.5 h-2.5 flex-shrink-0" /> {error}
      </p>
    )}
  </div>
));

const inputCls = (err) =>
  `w-full border ${err ? "border-red-400 bg-red-50" : "border-gray-200 bg-white"} rounded-xl px-3.5 py-2.5 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#FD561E]/25 focus:border-[#FD561E] transition-colors placeholder-gray-300`;

/* ─── Gateway Logo ───────────────────────────────────────────────────────── */
const GwLogo = ({ gw }) => {
  // Try logo_url first, fallback to known paths, then text
  const knownLogos = {
    billdesk:  "/assets/billdesk_logo.png",
    razorpay:  "/assets/payments/razorpay.png",
    //payu:      "/assets/payments/payu.png",
    // ccavenue:  "/assets/payments/ccavenue.png",
  };
  const key = gw.gateway_key?.toLowerCase() || "";
  const fallbackSrc = knownLogos[key] || null;

  const [src, setSrc] = useState(gw.logo_url || fallbackSrc);

  return src ? (
    <img
      src={src}
      alt={gw.name}
      className="h-6 object-contain flex-shrink-0"
      onError={() => {
        if (src !== fallbackSrc && fallbackSrc) setSrc(fallbackSrc);
        else setSrc(null);
      }}
    />
  ) : (
    <span className="text-xs font-bold text-gray-600 flex-shrink-0">{gw.name}</span>
  );
};

/* ════════════════════════════════════════════════════════════════════════════
   MAIN PAGE
════════════════════════════════════════════════════════════════════════════ */
const HotelBookingPage = () => {
  const { state }  = useLocation();
  const navigate   = useNavigate();

  const [gateways,   setGateways]   = useState([]);
  const [gwLoading,  setGwLoading]  = useState(true);
  const [selectedGw, setSelectedGw] = useState(null);
  const [loading,    setLoading]    = useState(false);
  const [apiError,   setApiError]   = useState(null);
  const [errors,     setErrors]     = useState({});

  if (!state?.hotel) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-gray-50 px-4">
        <Building2 className="w-12 h-12 text-gray-300" />
        <p className="text-gray-500">No booking data found.</p>
        <button onClick={() => navigate("/hotels")}
          className="px-5 py-2.5 bg-[#FD561E] text-white rounded-xl font-bold text-sm cursor-pointer">
          Back to Search
        </button>
      </div>
    );
  }

  const { hotel, rate, rulesData, checkinDate, checkoutDate, guests, traceId } = state;
  const p = hotel.propertyInfo;
  const n = nightsCount(checkinDate, checkoutDate);

  const priceInfo  = extractPrice(rate, rulesData);
  const totalPrice = priceInfo.total > 0 ? priceInfo.total : (priceInfo.perNight > 0 ? priceInfo.perNight * n : 0);
  const basePrice  = priceInfo.base;
  const taxesPrice = priceInfo.taxes;
  const perNight   = priceInfo.perNight;

  const info        = getRulesInfo(rulesData);

  // bookingCode — rules data lo vachindi prefer cheyyi (most accurate)
  const bookingCode = rulesData?.OfferHospitalityResponse?.Offer?.Product?.[0]?.bookingCode
    || rate?.bookingCode
    || "";

  // chain + propertyCode — rules data nundi teesukuntam
  const rulesProduct = rulesData?.OfferHospitalityResponse?.Offer?.Product?.[0];
  const chain = rulesProduct?.PropertyKey?.chainCode
    || hotel.chainCode || rate?.PropertyKey?.chainCode || p?.chainCode || "";
  const pKey  = rulesProduct?.PropertyKey?.propertyCode
    || hotel.propertyCode || rate?.PropertyKey?.propertyCode || p?.propertyCode || "";

  const image = p?.imageURLs?.[0]?.url;

  /* ── fetch payment gateways ── */
  useEffect(() => {
    setGwLoading(true);
    fetch("https://api.bobros.org/paymentgateway")
      .then(r => r.json())
      .then(data => {
        if (data?.success && data?.data?.length > 0) {
          const active = data.data.filter(g => g.is_enabled && g.live_status?.is_active);
          setGateways(active);
          const def = active.find(g => g.is_default) || active[0];
          if (def) setSelectedGw(def.gateway_key);
        }
      })
      .catch(() => {})
      .finally(() => setGwLoading(false));
  }, []);

  /* ── traveler — auto-fill from localStorage if logged in ── */
  const [traveler, setTraveler] = useState({
    prefix: "Mr", given: "", surname: "", email: "", phone: "",
  });

  useEffect(() => {
    try {
      const u = JSON.parse(localStorage.getItem("user") || "{}");
      if (u && (u.name || u.email || u.firstName)) {
        const parts = (u.name || "").trim().split(" ");
        setTraveler(prev => ({
          ...prev,
          given:   u.firstName || parts[0] || prev.given,
          surname: u.lastName  || parts.slice(1).join(" ") || prev.surname,
          email:   u.email     || prev.email,
          phone:   u.mobile    || u.phone || prev.phone,
        }));
      }
    } catch {}
  }, []);

  /* ── card ── */
  const [card, setCard] = useState({
    number: "", expiry: "", cvv: "", holderName: "",
    billingStreet: "", billingCity: "", billingState: "", billingPincode: "",
  });

  const setT = useCallback((k) => (e) => setTraveler(prev => ({ ...prev, [k]: e.target.value })), []);
  const setC = useCallback((k) => (e) => setCard(prev => ({ ...prev, [k]: e.target.value })), []);
  const { code: cardCode } = detectCard(card.number);

  /* ── validation ── */
  const validate = () => {
    const e = {};
    if (!traveler.given.trim())   e.given   = "First name required";
    if (!traveler.surname.trim()) e.surname = "Last name required";
    if (!traveler.email.trim() || !/\S+@\S+\.\S+/.test(traveler.email)) e.email = "Valid email required";
    if (traveler.phone.replace(/\D/g,"").length < 10) e.phone = "Valid 10-digit phone required";
    if (!selectedGw)                               e.gateway    = "Select a payment method";
    if (card.number.replace(/\s/g,"").length < 15) e.cardNum    = "Valid card number required";
    if (card.expiry.length < 5)                    e.expiry     = "Expiry required (MM/YY)";
    if (card.cvv.length < 3)                       e.cvv        = "CVV required";
    if (!card.holderName.trim())                   e.holderName = "Cardholder name required";
    if (!card.billingCity.trim())                  e.city       = "City required";
    if (!card.billingPincode.trim())               e.pincode    = "Pincode required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  /* ── build payload ── */
  const buildPayload = () => {
    const rawCard  = card.number.replace(/\s/g, "");
    const [mm = "", yy = ""] = card.expiry.split("/");
    const expireDate = mm && yy ? `${mm}${yy}` : "";
    const rawPhone = traveler.phone.replace(/\D/g, "");

    return {
      ReservationDetail: {
        Offer: [{
          "@type": "Offer",
          Identifier: { authority: "TVPT" },
          Product: [{
            "@type":     "ProductHospitality",
            bookingCode,
            Quantity:    guests?.rooms  || 1,
            guests:      guests?.adults || 2,
            PropertyKey: { "@type": "PropertyKey", chainCode: chain, propertyCode: pKey },
            DateRange:   { start: checkinDate, end: checkoutDate },
          }],
          Price: {
            "@type":      "PriceDetail",
            CurrencyCode: { value: "INR" },
            Base:         Number((basePrice  || totalPrice).toFixed(2)),
            TotalTaxes:   Number((taxesPrice || 0).toFixed(2)),
            TotalPrice:   Number(totalPrice.toFixed(2)),
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
          Telephone: [{ "@type": "TelephoneDetail", countryAccessCode: "91", areaCityCode: "98", phoneNumber: rawPhone }],
          Email: [{ value: traveler.email.trim() }],
        }],
        FormOfPayment: [{
          "@type": "FormOfPaymentPaymentCard",
          PaymentCard: {
            "@type":        "PaymentCardDetail",
            CardType:       "Credit",
            CardCode:       cardCode,
            CardHolderName: card.holderName.trim(),
            expireDate,
            CardNumber: { "@type": "CardNumber", PlainText: rawCard },
            SeriesCode: { "@type": "SeriesCode", PlainText: card.cvv },
            Address: {
              "@type":     "AddressDetail",
              AddressLine: [card.billingStreet.trim() || "NA"],
              City:        card.billingCity.trim(),
              StateProv:   { value: (card.billingState.trim() || "NA").toUpperCase() },
              Country:     { value: "IN" },
              PostalCode:  card.billingPincode.trim(),
            },
            Telephone: [{ "@type": "TelephoneDetail", countryAccessCode: "91", areaCityCode: "98", phoneNumber: rawPhone }],
          },
        }],
        Payment: [{
          "@type":      "Payment",
          Amount:       { code: "INR", value: Number(totalPrice.toFixed(2)) },
          depositInd:   false,
          guaranteeInd: true,
        }],
      },
    };
  };

  /* ── submit ── */
  const handleConfirm = async () => {
    if (!validate()) { window.scrollTo({ top: 0, behavior: "smooth" }); return; }
    setLoading(true);
    setApiError(null);
    try {
      const payload = buildPayload();
      const token = localStorage.getItem("token") || localStorage.getItem("authToken") || "";



      const res = await fetch("https://api.bobros.org/hotel/reservations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-trace-id": traceId || "",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(payload),
      });

      const rawText = await res.text();
      let data = null;
      try { data = JSON.parse(rawText); } catch {}

    
      if (data?.ReservationResponse) {
        const receipts = data.ReservationResponse.Reservation?.Receipt || [];
        const supplier = receipts.find(r => r?.Confirmation?.Locator?.sourceContext === "Supplier");
        const pnr      = receipts.find(r => r?.Confirmation?.Locator?.locatorType === "PNR Locator");
        
      }
      if (data?.error) console.error("Error   :", JSON.stringify(data.error, null, 2));
    
      if (!res.ok) {
        const msg = data?.message || data?.error
          || data?.error?.ErrorResponse?.Result?.Error?.[0]?.Message
          || `Reservation failed (${res.status})`;
        throw new Error(msg);
      }

      navigate("/hotels/confirmation", {
        state: {
          reservation: data,
          hotel, rate, checkinDate, checkoutDate, guests,
          traveler: {
            prefix:  traveler.prefix,
            given:   traveler.given,
            surname: traveler.surname,
            email:   traveler.email,
            phone:   traveler.phone,
          },
        },
        replace: true,
      });
    } catch (err) {
      setApiError(err.message || "Reservation failed. Please try again.");
      window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
    } finally {
      setLoading(false);
    }
  };

  /* ────────────────────────────────────────────────────────────────────────
     RENDER
  ──────────────────────────────────────────────────────────────────────── */
  return (
    <div className="min-h-screen bg-gray-50">

      {/* Sticky header */}
      <div className="bg-white border-b border-gray-100 shadow-sm sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-3 sm:px-8 py-3 flex items-center gap-3">
          <button onClick={() => navigate(-1)}
            className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-[#FD561E] transition-colors font-medium cursor-pointer">
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Back</span>
          </button>
          <div className="h-5 w-px bg-gray-200 hidden sm:block" />
          <h1 className="text-sm font-bold text-gray-800 flex-1">Complete Booking</h1>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-3 sm:px-8 py-5 sm:py-7">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 sm:gap-7">

          {/* ════ LEFT ════ */}
          <div className="lg:col-span-2 space-y-5">

            {/* Guest Details */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 sm:p-6">
              <h2 className="font-bold text-gray-900 text-base mb-5 flex items-center gap-2">
                <FaUser className="text-[#FD561E] w-4 h-4" /> Guest Details
              </h2>

              {/* Row 1: Title + First Name + Last Name */}
              <div className="grid grid-cols-12 gap-3 mb-4">
                <div className="col-span-3 sm:col-span-2">
                  <Field label="Title">
                    <select value={traveler.prefix} onChange={setT("prefix")} className={inputCls(false)}>
                      {["Mr","Mrs","Ms","Dr"].map(t => <option key={t}>{t}</option>)}
                    </select>
                  </Field>
                </div>
                <div className="col-span-9 sm:col-span-5">
                  <Field label="First Name *" error={errors.given}>
                    <input value={traveler.given} onChange={setT("given")} placeholder="John" className={inputCls(errors.given)} />
                  </Field>
                </div>
                <div className="col-span-12 sm:col-span-5">
                  <Field label="Last Name *" error={errors.surname}>
                    <input value={traveler.surname} onChange={setT("surname")} placeholder="Smith" className={inputCls(errors.surname)} />
                  </Field>
                </div>
              </div>

              {/* Row 2: Email + Phone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Field label="Email *" error={errors.email}>
                  <input type="email" value={traveler.email} onChange={setT("email")} placeholder="john@example.com" className={inputCls(errors.email)} />
                </Field>
                <Field label="Phone *" error={errors.phone}>
                  <div className="flex gap-2">
                    <span className={`${inputCls(false)} !w-14 flex-shrink-0 flex items-center justify-center text-gray-500 font-medium text-sm`}>
                      +91
                    </span>
                    <input
                      type="tel"
                      value={traveler.phone}
                      onChange={setT("phone")}
                      placeholder="9876543210"
                      maxLength={10}
                      className={`${inputCls(errors.phone)} flex-1 min-w-0`}
                    />
                  </div>
                </Field>
              </div>
            </div>

            {/* Payment Method */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 sm:p-6">
              <h2 className="font-bold text-gray-900 text-base mb-1 flex items-center gap-2">
                <FaCreditCard className="text-[#FD561E] w-4 h-4" /> Payment Method
              </h2>
              <p className="text-xs text-gray-400 mb-4 flex items-center gap-1">
                <FaLock className="w-2.5 h-2.5" /> Secured & encrypted
              </p>

              {gwLoading ? (
                <div className="flex items-center gap-2 text-sm text-gray-400 py-3">
                  <FaSpinner className="w-4 h-4 animate-spin" /> Loading payment options...
                </div>
              ) : gateways.length === 0 ? (
                <p className="text-sm text-red-500">No payment gateways available.</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-1">
                  {gateways.map(gw => (
                    <button key={gw.gateway_key} type="button"
                      onClick={() => setSelectedGw(gw.gateway_key)}
                      className={`flex items-center gap-3 p-3.5 rounded-xl border-2 transition-all cursor-pointer text-left ${
                        selectedGw === gw.gateway_key
                          ? "border-[#FD561E] bg-orange-50/40"
                          : "border-gray-200 hover:border-gray-300 bg-white"
                      }`}>
                      <div className={`w-4 h-4 rounded-full border-2 flex-shrink-0 flex items-center justify-center ${
                        selectedGw === gw.gateway_key ? "border-[#FD561E]" : "border-gray-300"
                      }`}>
                        {selectedGw === gw.gateway_key && <div className="w-2 h-2 rounded-full bg-[#FD561E]" />}
                      </div>
                      <GwLogo gw={gw} />
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-semibold text-gray-800">{gw.name}</div>
                        {gw.is_default && <div className="text-[10px] text-[#FD561E] font-medium">Recommended</div>}
                      </div>
                      {selectedGw === gw.gateway_key && <FaCheckCircle className="text-[#FD561E] w-4 h-4 flex-shrink-0" />}
                    </button>
                  ))}
                </div>
              )}
              {errors.gateway && (
                <p className="text-[11px] text-red-500 mt-1 flex items-center gap-1">
                  <FaExclamationTriangle className="w-2.5 h-2.5" /> {errors.gateway}
                </p>
              )}
            </div>

            {/* Guarantee Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 sm:p-6">
              <h2 className="font-bold text-gray-900 text-base mb-1 flex items-center gap-2">
                <FaShieldAlt className="text-[#FD561E] w-4 h-4" /> Guarantee Card Details
              </h2>
              <p className="text-xs text-gray-400 mb-5 flex items-center gap-1">
                <FaLock className="w-2.5 h-2.5" /> Card used as booking guarantee only
              </p>

              <div className="space-y-4">
                <Field label="Card Number *" error={errors.cardNum}>
                  <div className="relative">
                    <input
                      value={card.number}
                      onChange={e => setCard(prev => ({ ...prev, number: fmtCardNum(e.target.value) }))}
                      placeholder="4111 1111 1111 1111"
                      maxLength={19}
                      className={`${inputCls(errors.cardNum)} pr-16`}
                      autoComplete="cc-number"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-gray-400 uppercase pointer-events-none">
                      {detectCard(card.number).label}
                    </span>
                  </div>
                </Field>

                <div className="grid grid-cols-2 gap-4">
                  <Field label="Expiry (MM/YY) *" error={errors.expiry}>
                    <input
                      value={card.expiry}
                      onChange={e => setCard(prev => ({ ...prev, expiry: fmtExpiry(e.target.value) }))}
                      placeholder="08/28" maxLength={5}
                      className={inputCls(errors.expiry)} autoComplete="cc-exp"
                    />
                  </Field>
                  <Field label="CVV *" error={errors.cvv}>
                    <input type="password" value={card.cvv} onChange={setC("cvv")}
                      placeholder="•••" maxLength={4}
                      className={inputCls(errors.cvv)} autoComplete="cc-csc" />
                  </Field>
                </div>

                <Field label="Cardholder Name *" error={errors.holderName}>
                  <input value={card.holderName} onChange={setC("holderName")}
                    placeholder="JOHN SMITH" className={inputCls(errors.holderName)} autoComplete="cc-name" />
                </Field>
              </div>

              <div className="mt-5 pt-5 border-t border-gray-100">
                <h3 className="text-xs font-bold text-gray-600 uppercase tracking-wide mb-4">Billing Address</h3>
                <div className="space-y-4">
                  <Field label="Street / Address">
                    <input value={card.billingStreet} onChange={setC("billingStreet")}
                      placeholder="123 Billing Street" className={inputCls(false)} autoComplete="street-address" />
                  </Field>
                  <div className="grid grid-cols-2 gap-4">
                    <Field label="City *" error={errors.city}>
                      <input value={card.billingCity} onChange={setC("billingCity")}
                        placeholder="Hyderabad" className={inputCls(errors.city)} autoComplete="address-level2" />
                    </Field>
                    <Field label="State (2-letter)">
                      <input value={card.billingState} onChange={setC("billingState")}
                        placeholder="TS" maxLength={2} className={inputCls(false)} autoComplete="address-level1" />
                    </Field>
                  </div>
                  <Field label="Pincode *" error={errors.pincode}>
                    <input value={card.billingPincode} onChange={setC("billingPincode")}
                      placeholder="500001" maxLength={6} className={inputCls(errors.pincode)} autoComplete="postal-code" />
                  </Field>
                </div>
              </div>
            </div>

            {/* API Error */}
            {apiError && (
              <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-start gap-3">
                <FaExclamationTriangle className="text-red-500 w-4 h-4 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-red-700">Booking Failed</p>
                  <p className="text-xs text-red-600 mt-0.5 leading-relaxed">{apiError}</p>
                </div>
              </div>
            )}

            {/* Mobile confirm button */}
            <div className="lg:hidden">
              <button onClick={handleConfirm} disabled={loading}
                className="w-full bg-gradient-to-r from-[#FD561E] to-[#ff7b4a] text-white py-4 rounded-2xl font-bold text-sm shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer">
                {loading
                  ? <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Booking...</>
                  : <><FaLock className="w-3.5 h-3.5" /> Confirm & Pay ₹{fmt(totalPrice)}</>}
              </button>
            </div>
          </div>

          {/* ════ RIGHT: summary ════ */}
          <div>
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden lg:sticky lg:top-[60px]">
              {image && (
                <div className="h-36 overflow-hidden">
                  <img src={image} alt={hotel.name} className="w-full h-full object-cover"
                    onError={e => { e.target.style.display = "none"; }} />
                </div>
              )}
              <div className="p-4 sm:p-5">
                <h2 className="font-black text-gray-900 text-sm mb-1 leading-snug">{hotel.name}</h2>
                {p?.address && (
                  <div className="flex items-start gap-1 text-xs text-gray-400 mb-4">
                    <FaMapMarkerAlt className="text-[#FD561E] w-2.5 h-2.5 flex-shrink-0 mt-0.5" />
                    <span className="line-clamp-2">{[p.address.street, p.address.city].filter(Boolean).join(", ")}</span>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-2 mb-3">
                  {[
                    { label: "Check-in",  val: checkinDate,  time: info.checkIn  ? `From ${info.checkIn}` : "3:00 PM" },
                    { label: "Check-out", val: checkoutDate, time: info.checkOut ? `By ${info.checkOut}` : "12:00 PM" },
                  ].map(({ label, val, time }) => (
                    <div key={label} className="bg-gray-50 rounded-xl p-2.5">
                      <div className="text-[10px] text-gray-400 font-semibold uppercase mb-0.5">{label}</div>
                      <div className="text-xs font-bold text-gray-800">{fmtDate(val)}</div>
                      <div className="text-[10px] text-gray-400">{time}</div>
                    </div>
                  ))}
                </div>

                <div className="flex items-center gap-3 text-xs text-gray-500 mb-3">
                  <span><FaBed className="inline text-[#FD561E] mr-1" />{guests?.rooms || 1} Room</span>
                  <span><FaUser className="inline text-[#FD561E] mr-1" />{guests?.adults || 1} Adult{guests?.adults > 1 ? "s" : ""}</span>
                  <span className="font-semibold text-gray-700">{n} Night{n > 1 ? "s" : ""}</span>
                </div>

                {(rate?.rateDescription || rate?.bookingCode) && (
                  <div className="bg-orange-50 border border-[#FD561E]/20 rounded-xl px-3 py-2 mb-3 text-xs text-[#FD561E] font-semibold leading-snug">
                    {rate.rateDescription || rate.bookingCode}
                  </div>
                )}

                {(info.breakfast || rate?.breakfastIncluded) && (
                  <div className="flex items-center gap-1.5 text-xs text-green-700 bg-green-50 rounded-xl px-3 py-2 mb-3">
                    <MdFreeBreakfast className="w-3.5 h-3.5" /> Breakfast Included
                  </div>
                )}

                {info.cancelDesc && (
                  <div className="bg-amber-50 border border-amber-100 rounded-xl px-3 py-2.5 mb-3 text-xs text-amber-700">
                    <p className="font-semibold mb-0.5 flex items-center gap-1">
                      <FaTimesCircle className="w-2.5 h-2.5" /> Cancellation
                    </p>
                    <p className="leading-relaxed line-clamp-3">{info.cancelDesc}</p>
                    {!info.refundable && (
                      <span className="mt-1.5 inline-flex items-center gap-1 text-[10px] bg-red-100 text-red-600 px-2 py-0.5 rounded-full font-medium">
                        <FaBan className="w-2 h-2" /> Non-refundable
                      </span>
                    )}
                  </div>
                )}

                <div className="bg-gray-50 rounded-xl p-3.5 mb-4 space-y-2">
                  {perNight > 0 && (
                    <div className="flex justify-between text-xs text-gray-600">
                      <span>₹{fmt(perNight)} × {n} night{n > 1 ? "s" : ""}</span>
                      <span>₹{fmt(perNight * n)}</span>
                    </div>
                  )}
                  {basePrice > 0 && perNight === 0 && (
                    <div className="flex justify-between text-xs text-gray-600">
                      <span>Base Rate</span><span>₹{fmt(basePrice)}</span>
                    </div>
                  )}
                  {taxesPrice > 0 && (
                    <div className="flex justify-between text-xs text-gray-400">
                      <span>Taxes & Fees</span><span>₹{fmt(taxesPrice)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm font-black text-gray-900 border-t border-gray-200 pt-2">
                    <span>Total</span>
                    <span className="text-[#FD561E]">₹{fmt(totalPrice)}</span>
                  </div>
                </div>

                {selectedGw && gateways.length > 0 && (() => {
                  const gw = gateways.find(g => g.gateway_key === selectedGw);
                  return gw ? (
                    <div className="flex items-center gap-2 mb-3 px-1">
                      <span className="text-[10px] text-gray-400">Pay via</span>
                      <GwLogo gw={gw} />
                    </div>
                  ) : null;
                })()}

                <button onClick={handleConfirm} disabled={loading}
                  className="hidden lg:flex w-full bg-gradient-to-r from-[#FD561E] to-[#ff7b4a] text-white py-3.5 rounded-2xl font-bold text-sm shadow-lg hover:shadow-xl transition-all items-center justify-center gap-2 disabled:opacity-60 cursor-pointer active:scale-[0.98]">
                  {loading
                    ? <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Booking...</>
                    : <><FaLock className="w-3.5 h-3.5" /> Confirm & Pay ₹{fmt(totalPrice)}</>}
                </button>

                <p className="text-center text-[10px] text-gray-400 mt-2.5 flex items-center justify-center gap-1">
                  <FaShieldAlt className="w-2.5 h-2.5" /> Secure booking via Travelport
                </p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default HotelBookingPage;