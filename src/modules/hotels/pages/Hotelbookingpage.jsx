// src/modules/hotels/pages/HotelBookingPage.jsx
import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  FaMapMarkerAlt, FaCalendarAlt, FaUser, FaCreditCard, FaLock,
  FaCheck, FaExclamationTriangle, FaBed, FaWifi, FaTimesCircle,
  FaChevronDown, FaShieldAlt, FaBan,
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

/* ─── card type detection ────────────────────────────────────────────────── */
const detectCard = (num) => {
  const n = num.replace(/\s/g, "");
  if (/^4/.test(n))          return { code: "VI", label: "Visa" };
  if (/^5[1-5]/.test(n))     return { code: "MC", label: "Mastercard" };
  if (/^3[47]/.test(n))      return { code: "AX", label: "Amex" };
  if (/^6(?:011|5)/.test(n)) return { code: "DS", label: "Discover" };
  if (/^35/.test(n))         return { code: "JC", label: "JCB" };
  return { code: "VI", label: "Card" };
};

/* ─── card number formatter ──────────────────────────────────────────────── */
const fmtCardNum = (val) => {
  const digits = val.replace(/\D/g, "").slice(0, 16);
  return digits.replace(/(.{4})/g, "$1 ").trim();
};

/* ─── expiry formatter ───────────────────────────────────────────────────── */
const fmtExpiry = (val) => {
  const digits = val.replace(/\D/g, "").slice(0, 4);
  return digits.length >= 3 ? `${digits.slice(0, 2)}/${digits.slice(2)}` : digits;
};

/* ─── parse rules for display ────────────────────────────────────────────── */
const getRulesInfo = (rulesData) => {
  if (!rulesData) return {};
  const offer   = rulesData?.OfferHospitalityResponse?.Offer || {};
  const price   = offer?.Price || {};
  const terms   = offer?.TermsAndConditionsFull?.[0] || {};
  const txtBlks = terms?.TextBlock || [];
  const getBlock = (title) =>
    txtBlks.find(b => b.title?.toLowerCase() === title.toLowerCase())
           ?.TextFormatted?.[0]?.value || "";
  const cancelPenalty = terms?.CancelPenalty?.[0] || null;
  return {
    base:        price.Base || 0,
    taxes:       price.TotalTaxes || 0,
    total:       price.TotalPrice || 0,
    cancelDesc:  cancelPenalty?.Description || getBlock("Cancellation") || "",
    refundable:  cancelPenalty?.Refundable !== "No",
    checkIn:     terms?.CheckInOutPolicy?.checkInTime  || "",
    checkOut:    terms?.CheckInOutPolicy?.checkOutTime || "",
    breakfast:   terms?.MealsIncluded?.breakfastInd || false,
  };
};

/* ════════════════════════════════════════════════════════════════════════════
   MAIN PAGE
════════════════════════════════════════════════════════════════════════════ */
const HotelBookingPage = () => {
  const { state }  = useLocation();
  const navigate   = useNavigate();

  const [loading,  setLoading]  = useState(false);
  const [apiError, setApiError] = useState(null);
  const [errors,   setErrors]   = useState({});

  /* ── guard ── */
  if (!state?.hotel) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-gray-50 px-4">
        <Building2 className="w-12 h-12 text-gray-300" />
        <p className="text-gray-500">No booking data found.</p>
        <button onClick={() => navigate("/hotels")}
          className="px-5 py-2.5 bg-[#FD561E] text-white rounded-xl font-bold text-sm">
          Back to Search
        </button>
      </div>
    );
  }

  const { hotel, rate, rulesData, checkinDate, checkoutDate, guests } = state;
  const p    = hotel.propertyInfo;
  const n    = nights(checkinDate, checkoutDate);
  const info = getRulesInfo(rulesData);

  /* ── price precedence: rules > rate ── */
  const totalPrice = info.total
    || rate?.price?.totalPrice
    || rate?.totalPrice?.amount
    || rate?.price?.TotalPrice
    || 0;
  const basePrice  = info.base  || rate?.price?.base  || 0;
  const taxesPrice = info.taxes || rate?.price?.taxes || 0;

  /* ── chain/property code ── */
  const chain = hotel.chainCode
    || rate?.PropertyKey?.chainCode
    || p?.chainCode
    || "";
  const pKey  = hotel.propertyCode
    || rate?.PropertyKey?.propertyCode
    || p?.propertyCode
    || "";

  /* ── booking code ── */
  const bookingCode = rate?.bookingCode
    || rate?.rateKey?.value
    || "";

  /* ── traveler: auto-fill from localStorage ── */
  const [traveler, setTraveler] = useState({
    prefix:  "Mr",
    given:   "",
    surname: "",
    email:   "",
    phone:   "",
  });

  useEffect(() => {
    try {
      const u = JSON.parse(localStorage.getItem("user") || "{}");
      if (u && (u.name || u.email)) {
        const parts   = (u.name || "").trim().split(" ");
        const given   = parts[0] || "";
        const surname = parts.slice(1).join(" ") || "";
        setTraveler(prev => ({
          ...prev,
          given:   u.firstName || given   || prev.given,
          surname: u.lastName  || surname || prev.surname,
          email:   u.email  || prev.email,
          phone:   u.mobile || u.phone || prev.phone,
        }));
      }
    } catch {}
  }, []);

  /* ── card ── */
  const [card, setCard] = useState({
    number:        "",
    expiry:        "",
    cvv:           "",
    holderName:    "",
    billingStreet: "",
    billingCity:   "",
    billingState:  "",
    billingPincode:"",
  });

  const setT  = (k) => (e) => setTraveler(prev => ({ ...prev, [k]: e.target.value }));
  const setC  = (k) => (e) => setCard(prev => ({ ...prev, [k]: e.target.value }));

  const { code: cardCode } = detectCard(card.number);

  /* ── validation ── */
  const validate = () => {
    const e = {};
    if (!traveler.given.trim())   e.given   = "First name required";
    if (!traveler.surname.trim()) e.surname = "Last name required";
    if (!traveler.email.trim() || !/\S+@\S+\.\S+/.test(traveler.email))
      e.email = "Valid email required";
    if (!traveler.phone.trim() || traveler.phone.replace(/\D/g,"").length < 10)
      e.phone = "Valid 10-digit phone required";
    if (card.number.replace(/\s/g,"").length < 15) e.cardNum   = "Valid card number required";
    if (card.expiry.length < 5)                    e.expiry    = "Expiry required (MM/YY)";
    if (card.cvv.length < 3)                       e.cvv       = "CVV required";
    if (!card.holderName.trim())                   e.holderName= "Cardholder name required";
    if (!card.billingCity.trim())                  e.city      = "City required";
    if (!card.billingPincode.trim())               e.pincode   = "Pincode required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  /* ── build payload ── */
  const buildPayload = () => {
    const rawCard = card.number.replace(/\s/g, "");
    const [expMM = "", expYY = ""] = card.expiry.split("/");
    const expireDate = expMM && expYY ? `${expMM}${expYY}` : "";

    return {
      ReservationDetail: {
        Offer: [
          {
            "@type": "Offer",
            Identifier: { authority: "TVPT" },
            Product: [
              {
                "@type":       "ProductHospitality",
                bookingCode:   bookingCode,
                Quantity:      guests?.rooms  || 1,
                guests:        guests?.adults || 1,
                PropertyKey: {
                  "@type":       "PropertyKey",
                  chainCode:     chain,
                  propertyCode:  pKey,
                },
                DateRange: {
                  start: checkinDate,
                  end:   checkoutDate,
                },
              },
            ],
            Price: {
              "@type":      "PriceDetail",
              CurrencyCode: { value: "INR" },
              Base:         basePrice,
              TotalTaxes:   taxesPrice,
              TotalPrice:   totalPrice,
            },
          },
        ],
        Traveler: [
          {
            "@type": "Traveler",
            PersonName: {
              "@type":  "PersonName",
              Prefix:   traveler.prefix,
              Given:    traveler.given.trim(),
              Surname:  traveler.surname.trim(),
            },
            Telephone: [
              {
                "@type":            "TelephoneDetail",
                countryAccessCode:  "91",
                areaCityCode:       "98",
                phoneNumber:        traveler.phone.replace(/\D/g, ""),
              },
            ],
            Email: [{ value: traveler.email.trim() }],
          },
        ],
        FormOfPayment: [
          {
            "@type": "FormOfPaymentPaymentCard",
            PaymentCard: {
              "@type":        "PaymentCardDetail",
              CardType:       "Credit",
              CardCode:       cardCode,
              CardHolderName: card.holderName.trim(),
              expireDate:     expireDate,
              CardNumber: {
                "@type":   "CardNumber",
                PlainText: rawCard,
              },
              SeriesCode: {
                "@type":   "SeriesCode",
                PlainText: card.cvv,
              },
              Address: {
                "@type":     "AddressDetail",
                AddressLine: [card.billingStreet.trim() || "NA"],
                City:        card.billingCity.trim(),
                StateProv:   { value: card.billingState.trim() || "NA" },
                Country:     { value: "IN" },
                PostalCode:  card.billingPincode.trim(),
              },
              Telephone: [
                {
                  "@type":            "TelephoneDetail",
                  countryAccessCode:  "91",
                  areaCityCode:       "98",
                  phoneNumber:        traveler.phone.replace(/\D/g, ""),
                },
              ],
            },
          },
        ],
        Payment: [
          {
            "@type": "Payment",
            Amount: {
              code:  "INR",
              value: totalPrice,
            },
            depositInd:   false,
            guaranteeInd: true,
          },
        ],
      },
    };
  };

  /* ── submit ── */
  const handleConfirm = async () => {
    if (!validate()) return;
    setLoading(true);
    setApiError(null);

    try {
      const payload = buildPayload();
      console.log("🔵 Hotel Reserve Payload:", JSON.stringify(payload, null, 2));

      const token = localStorage.getItem("token") || localStorage.getItem("authToken") || "";

      const res = await fetch("https://api.bobros.org/hotel/reservations", {
        method:  "POST",
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
        state: {
          reservation: data,
          hotel,
          rate,
          checkinDate,
          checkoutDate,
          guests,
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
      console.error("❌ Hotel reserve error:", err);
      setApiError(err.message || "Reservation failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  /* ── field component ── */
  const Field = ({ label, error, children }) => (
    <div>
      <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
        {label}
      </label>
      {children}
      {error && (
        <p className="text-[10px] text-red-500 mt-1 flex items-center gap-1">
          <FaExclamationTriangle className="w-2.5 h-2.5" /> {error}
        </p>
      )}
    </div>
  );

  const inputCls = (err) =>
    `w-full border ${err ? "border-red-400 bg-red-50" : "border-gray-200 bg-white"} 
     rounded-xl px-3 py-2.5 text-sm text-gray-800 focus:outline-none focus:ring-2 
     focus:ring-[#FD561E]/30 focus:border-[#FD561E] transition-colors placeholder-gray-300`;

  const image = p?.imageURLs?.[0]?.url;

  return (
    <div className="min-h-screen bg-gray-50">

      {/* ── Sticky header ── */}
      <div className="bg-white border-b border-gray-100 shadow-sm sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-3 sm:px-6 py-3 flex items-center gap-3">
          <button onClick={() => navigate(-1)}
            className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-[#FD561E] transition-colors font-medium">
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Back</span>
          </button>
          <div className="h-5 w-px bg-gray-200 hidden sm:block" />
          <h1 className="text-sm font-bold text-gray-800 line-clamp-1 flex-1">Complete Booking</h1>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-3 sm:px-6 py-4 sm:py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">

          {/* ════ LEFT: forms ════ */}
          <div className="lg:col-span-2 space-y-4">

            {/* ── Traveler Info ── */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-5">
              <h2 className="font-bold text-gray-800 text-sm mb-4 flex items-center gap-2">
                <FaUser className="text-[#FD561E] w-3.5 h-3.5" /> Guest Details
              </h2>
              <div className="space-y-3">
                {/* Prefix + First */}
                <div className="grid grid-cols-3 gap-3">
                  <Field label="Title">
                    <select
                      value={traveler.prefix}
                      onChange={setT("prefix")}
                      className={inputCls(false)}>
                      {["Mr", "Mrs", "Ms", "Dr"].map(t => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                  </Field>
                  <div className="col-span-2">
                    <Field label="First Name *" error={errors.given}>
                      <input
                        value={traveler.given}
                        onChange={setT("given")}
                        placeholder="John"
                        className={inputCls(errors.given)} />
                    </Field>
                  </div>
                </div>
                {/* Last Name */}
                <Field label="Last Name *" error={errors.surname}>
                  <input
                    value={traveler.surname}
                    onChange={setT("surname")}
                    placeholder="Smith"
                    className={inputCls(errors.surname)} />
                </Field>
                {/* Email */}
                <Field label="Email *" error={errors.email}>
                  <input
                    type="email"
                    value={traveler.email}
                    onChange={setT("email")}
                    placeholder="john@example.com"
                    className={inputCls(errors.email)} />
                </Field>
                {/* Phone */}
                <Field label="Phone *" error={errors.phone}>
                  <div className="flex gap-2">
                    <span className={`${inputCls(false)} w-16 flex-shrink-0 text-center`}>+91</span>
                    <input
                      type="tel"
                      value={traveler.phone}
                      onChange={setT("phone")}
                      placeholder="9876543210"
                      maxLength={10}
                      className={`${inputCls(errors.phone)} flex-1`} />
                  </div>
                </Field>
              </div>
            </div>

            {/* ── Card Details ── */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-5">
              <h2 className="font-bold text-gray-800 text-sm mb-1 flex items-center gap-2">
                <FaCreditCard className="text-[#FD561E] w-3.5 h-3.5" /> Payment Details
              </h2>
              <p className="text-xs text-gray-400 mb-4 flex items-center gap-1">
                <FaLock className="w-2.5 h-2.5" /> Secured with 256-bit encryption
              </p>
              <div className="space-y-3">
                {/* Card number */}
                <Field label="Card Number *" error={errors.cardNum}>
                  <div className="relative">
                    <input
                      value={card.number}
                      onChange={e => setCard(p => ({ ...p, number: fmtCardNum(e.target.value) }))}
                      placeholder="4111 1111 1111 1111"
                      maxLength={19}
                      className={`${inputCls(errors.cardNum)} pr-16`} />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-gray-400 uppercase">
                      {detectCard(card.number).label}
                    </span>
                  </div>
                </Field>
                {/* Expiry + CVV */}
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Expiry (MM/YY) *" error={errors.expiry}>
                    <input
                      value={card.expiry}
                      onChange={e => setCard(p => ({ ...p, expiry: fmtExpiry(e.target.value) }))}
                      placeholder="08/28"
                      maxLength={5}
                      className={inputCls(errors.expiry)} />
                  </Field>
                  <Field label="CVV *" error={errors.cvv}>
                    <input
                      type="password"
                      value={card.cvv}
                      onChange={setC("cvv")}
                      placeholder="•••"
                      maxLength={4}
                      className={inputCls(errors.cvv)} />
                  </Field>
                </div>
                {/* Cardholder */}
                <Field label="Cardholder Name *" error={errors.holderName}>
                  <input
                    value={card.holderName}
                    onChange={setC("holderName")}
                    placeholder="JOHN SMITH"
                    className={inputCls(errors.holderName)} />
                </Field>
              </div>

              {/* Billing address */}
              <div className="mt-4 pt-4 border-t border-gray-100">
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
                  Billing Address
                </h3>
                <div className="space-y-3">
                  <Field label="Street / Address Line">
                    <input
                      value={card.billingStreet}
                      onChange={setC("billingStreet")}
                      placeholder="123 Billing Street"
                      className={inputCls(false)} />
                  </Field>
                  <div className="grid grid-cols-2 gap-3">
                    <Field label="City *" error={errors.city}>
                      <input
                        value={card.billingCity}
                        onChange={setC("billingCity")}
                        placeholder="Hyderabad"
                        className={inputCls(errors.city)} />
                    </Field>
                    <Field label="State">
                      <input
                        value={card.billingState}
                        onChange={setC("billingState")}
                        placeholder="TS"
                        maxLength={2}
                        className={inputCls(false)} />
                    </Field>
                  </div>
                  <Field label="Pincode *" error={errors.pincode}>
                    <input
                      value={card.billingPincode}
                      onChange={setC("billingPincode")}
                      placeholder="500001"
                      maxLength={6}
                      className={inputCls(errors.pincode)} />
                  </Field>
                </div>
              </div>
            </div>

            {/* ── API Error ── */}
            {apiError && (
              <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-start gap-3">
                <FaExclamationTriangle className="text-red-500 w-4 h-4 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-red-700">Booking Failed</p>
                  <p className="text-xs text-red-600 mt-0.5">{apiError}</p>
                </div>
              </div>
            )}

            {/* ── Confirm button (mobile) ── */}
            <div className="lg:hidden">
              <button
                onClick={handleConfirm}
                disabled={loading}
                className="w-full bg-gradient-to-r from-[#FD561E] to-[#ff7b4a] text-white py-4 rounded-2xl font-bold text-sm shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 disabled:opacity-60">
                {loading ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Booking...
                  </>
                ) : (
                  <><FaLock className="w-3.5 h-3.5" /> Confirm & Pay ₹{fmt(totalPrice)}</>
                )}
              </button>
            </div>
          </div>

          {/* ════ RIGHT: summary ════ */}
          <div className="space-y-4">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden lg:sticky lg:top-[60px]">
              {/* Hotel image */}
              {image && (
                <div className="h-28 sm:h-32 overflow-hidden">
                  <img src={image} alt={hotel.name}
                    className="w-full h-full object-cover"
                    onError={e => { e.target.style.display = "none"; }} />
                </div>
              )}

              <div className="p-4">
                <h2 className="font-black text-gray-900 text-sm mb-1 line-clamp-2">{hotel.name}</h2>
                {p?.address && (
                  <div className="flex items-start gap-1 text-xs text-gray-400 mb-3">
                    <FaMapMarkerAlt className="text-[#FD561E] w-2.5 h-2.5 flex-shrink-0 mt-0.5" />
                    <span className="line-clamp-1">
                      {[p.address.street, p.address.city].filter(Boolean).join(", ")}
                    </span>
                  </div>
                )}

                {/* Stay */}
                <div className="grid grid-cols-2 gap-2 mb-3">
                  <div className="bg-gray-50 rounded-xl p-2.5">
                    <div className="text-[10px] text-gray-400 font-semibold uppercase mb-0.5">Check-in</div>
                    <div className="text-xs font-bold text-gray-800">{fmtDate(checkinDate)}</div>
                    <div className="text-[10px] text-gray-400">
                      {info.checkIn ? `From ${info.checkIn}` : "3:00 PM"}
                    </div>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-2.5">
                    <div className="text-[10px] text-gray-400 font-semibold uppercase mb-0.5">Check-out</div>
                    <div className="text-xs font-bold text-gray-800">{fmtDate(checkoutDate)}</div>
                    <div className="text-[10px] text-gray-400">
                      {info.checkOut ? `By ${info.checkOut}` : "12:00 PM"}
                    </div>
                  </div>
                </div>

                {/* Room */}
                <div className="flex items-center gap-3 text-xs text-gray-500 mb-3">
                  <span><FaBed className="inline text-[#FD561E] mr-1" />{guests?.rooms || 1} Room</span>
                  <span><FaUser className="inline text-[#FD561E] mr-1" />{guests?.adults || 1} Adult{guests?.adults > 1 ? "s" : ""}</span>
                  <span>{n} Night{n > 1 ? "s" : ""}</span>
                </div>

                {/* Rate description */}
                {(rate?.rateDescription || rate?.bookingCode) && (
                  <div className="bg-orange-50 border border-[#FD561E]/20 rounded-xl px-3 py-2 mb-3 text-xs text-[#FD561E] font-semibold">
                    {rate.rateDescription || rate.bookingCode}
                  </div>
                )}

                {/* Meals */}
                {info.breakfast && (
                  <div className="flex items-center gap-1.5 text-xs text-green-700 bg-green-50 rounded-xl px-3 py-2 mb-3">
                    <MdFreeBreakfast className="w-3.5 h-3.5" /> Breakfast Included
                  </div>
                )}

                {/* Cancellation */}
                {info.cancelDesc && (
                  <div className="bg-amber-50 border border-amber-100 rounded-xl px-3 py-2 mb-3 text-xs text-amber-700">
                    <p className="font-semibold mb-0.5 flex items-center gap-1">
                      <FaTimesCircle className="w-2.5 h-2.5" /> Cancellation
                    </p>
                    <p className="leading-relaxed line-clamp-2">{info.cancelDesc}</p>
                    {!info.refundable && (
                      <span className="mt-1 inline-flex items-center gap-1 text-[10px] bg-red-100 text-red-600 px-2 py-0.5 rounded-full font-medium">
                        <FaBan className="w-2 h-2" /> Non-refundable
                      </span>
                    )}
                  </div>
                )}

                {/* Price */}
                <div className="bg-gray-50 rounded-xl p-3 mb-4 space-y-1.5">
                  {basePrice > 0 && (
                    <div className="flex justify-between text-xs text-gray-600">
                      <span>Base Rate</span><span>₹{fmt(basePrice)}</span>
                    </div>
                  )}
                  {taxesPrice > 0 && (
                    <div className="flex justify-between text-xs text-gray-400">
                      <span>Taxes & Fees</span><span>₹{fmt(taxesPrice)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm font-black text-gray-900 border-t border-gray-200 pt-1.5">
                    <span>Total</span>
                    <span className="text-[#FD561E]">₹{fmt(totalPrice)}</span>
                  </div>
                </div>

                {/* Confirm button (desktop) */}
                <button
                  onClick={handleConfirm}
                  disabled={loading}
                  className="hidden lg:flex w-full bg-gradient-to-r from-[#FD561E] to-[#ff7b4a] text-white py-3.5 rounded-2xl font-bold text-sm shadow-lg hover:shadow-xl transition-all items-center justify-center gap-2 disabled:opacity-60">
                  {loading ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Booking...
                    </>
                  ) : (
                    <><FaLock className="w-3.5 h-3.5" /> Confirm & Pay ₹{fmt(totalPrice)}</>
                  )}
                </button>

                <p className="text-center text-[10px] text-gray-400 mt-2 flex items-center justify-center gap-1">
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