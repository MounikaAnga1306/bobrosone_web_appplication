// src/modules/Bill Payments/pages/Transactions.jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  Phone, Mail, Hash, Lock, ChevronLeft, Loader2,
  AlertTriangle, Receipt, X, Search, RefreshCw, ChevronRight,
} from "lucide-react";

const API_BASE_URL = import.meta.env.DEV ? "" : "https://api.bobros.co.in";
const RESEND_SECONDS = 45;
const PAYMENT_ID_KEYS = ["paymentid"];

/* =====================================================================
   FIELD MAP — display label -> possible API/db column keys.
   upayments column names confirm aithe, ee 2 configs lo maatrame
   correct key add cheste chaalu (UI touch cheyyakkarledu).
   ===================================================================== */

// CARD lo direct ga chupinche fields (Image 1)
const CARD_FIELDS = [
  ["Bill Number",        ["consumer_id"]],
  ["Payment ID",         ["paymentid"]],
  ["Biller Name",        ["billername"]],
  ["Payment Status",     ["status"]],
  ["Register Mobile No", ["tmobile"]],
  ["Customer Contact",   ["consumer_id"]],
  ["B-Connect txn ID",   ["bconnecttxnid"]],
  ["Amount",             ["pamount"]],
  ["Biller ID",          ["billerid"]],
  ["Validation ID",      ["validationid"]],
  ["Customer Name",      ["tname"]],
  ["Transaction date",   ["pdat"]],
];

// "View More Details" popup sections — retrieve-payments response keys
// (top-level data + nested billlist[0])
const DETAIL_SECTIONS = [
  { title: "Payment Details", fields: [
    ["Payment ID",     ["paymentid"]],
    ["Payment Status", ["payment_status", "status"]],
  ]},
  { title: "Transaction Details", fields: [
    ["Biller Name",      ["biller_name"]],
    ["Biller Category",  ["biller_category"]],
    ["Biller ID",        ["billerid"]],
    ["Payment Amount",   ["payment_amount"]],
    ["Debit Amount",     ["debit_amount"]],
    ["Transaction Date", ["txn_date_time"]],
    ["Payment Type",     ["payment_type"]],
    ["Currency",         ["currency"]],
    ["Source Reference", ["source_ref_no"]],
    ["BBPS Reference",   ["bbps_ref_no"]],
    ["PA Reference",     ["pa_ref_no"]],
    ["Validation ID",    ["validationid"]],
  ]},
  { title: "Customer Information", fields: [
    ["Customer ID", ["customerid"]],
  ]},
  { title: "Charges & Fees", fields: [
    ["Commission Conv Fee", ["cou_conv_fee"]],
    ["Biller Conv Fee",     ["bou_conv_fee"]],
  ]},
];

// Bill Details fields come from nested billlist[] (each bill)
const BILL_FIELDS = [
  ["Bill Number",            ["billnumber"]],
  ["Bill Amount",            ["billamount"]],
  ["Bill Date",              ["billdate"]],
  ["Due Date",               ["billduedate"]],
  ["Bill Period",            ["billperiod"]],
  ["Customer Name",          ["customer_name"]],
  ["Early Payment Discount", ["early_billdiscount"]],
  ["Late Payment Charges",   ["late_payment_charges"]],
];

/* ---------------- Validation (Flutter rules) ---------------- */
const validateMobile = (v) => {
  const c = (v || "").replace(/[^0-9]/g, "");
  if (!c) return "Mobile number is required";
  if (c.length !== 10) return "Mobile number must be 10 digits";
  if (!/^[6-9]\d{9}$/.test(c)) return "Enter a valid Indian mobile number";
  return null;
};
const validateEmail = (v) => {
  const t = (v || "").trim();
  if (!t) return "Email is required";
  if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(t)) return "Enter a valid email address";
  return null;
};
const validateTxnId = (v) => {
  const t = (v || "").trim();
  if (!t) return "Transaction ID is required";
  if (t.length < 4) return "Enter valid transaction ID";
  return null;
};

/* ---------------- Helpers ---------------- */
const pick = (row, keys) => {
  if (!row) return null;
  for (const k of keys) {
    if (row[k] !== undefined && row[k] !== null && String(row[k]).trim() !== "") return row[k];
  }
  return null;
};
// Latest transaction top lo — pdat (transaction date) descending sort
const sortByDate = (raw) =>
  [...(raw || [])].sort((a, b) => {
    const da = new Date(String(a?.pdat || "").replace(" ", "T")).getTime() || 0;
    const db = new Date(String(b?.pdat || "").replace(" ", "T")).getTime() || 0;
    return db - da;
  });
const fmtDate = (val) => {
  if (!val) return "—";
  const d = new Date(String(val).replace(" ", "T"));
  if (isNaN(d)) return String(val);
  return d.toLocaleDateString("en-IN", { day: "2-digit", month: "2-digit", year: "numeric" }) +
    " " + d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true });
};
const moneyRe = /(amount|fee|charge|discount|debit)/i;
const renderValue = (label, val) => {
  if (val == null || String(val).trim() === "") return "—";
  if (/date/i.test(label)) return fmtDate(val);
  if (moneyRe.test(label)) return `₹${val}`;
  return String(val);
};
const statusColor = (status) => {
  const s = String(status || "").toLowerCase();
  if (s.includes("success") || s.includes("paid") || s.includes("ok")) return "text-green-600";
  if (s.includes("fail") || s.includes("reject")) return "text-red-600";
  if (s.includes("pend")) return "text-amber-600";
  return "text-gray-700";
};

// Stored user object nunchi field teesukovadaniki (multiple possible keys)
const grab = (obj, keys) => {
  if (!obj) return "";
  for (const k of keys) {
    const v = obj[k];
    if (v !== undefined && v !== null && String(v).trim() !== "") return v;
  }
  return "";
};

/* ---------------- Popup section ---------------- */
const Section = ({ title, fields, row }) => (
  <div className="bg-gray-50 rounded-xl p-4 mb-4">
    <h4 className="text-sm font-bold text-[#fd561e] mb-3">{title}</h4>
    <div className="space-y-2">
      {fields.map(([label, keys]) => {
        const v = pick(row, keys);
        const isStatus = label === "Payment Status";
        return (
          <div key={label} className="flex justify-between gap-3 text-sm">
            <span className="text-gray-700 font-medium">{label}</span>
            <span className={`text-right break-all ${isStatus ? statusColor(v) + " font-semibold" : "text-gray-500"}`}>
              {renderValue(label, v)}
            </span>
          </div>
        );
      })}
    </div>
  </div>
);

/* ---------------- Card (Image 1 fields + View More) ---------------- */
const TransactionCard = ({ row, onMore }) => (
  <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm flex flex-col">
    <div className="space-y-1.5 flex-1">
      {CARD_FIELDS.map(([label, keys]) => {
        const v = pick(row, keys);
        const isStatus = label === "Payment Status";
        return (
          <div key={label} className="flex justify-between gap-3 text-xs">
            <span className="text-gray-700 font-semibold whitespace-nowrap">{label}</span>
            <span className={`text-right break-all ${isStatus ? statusColor(v) + " font-semibold" : "text-gray-600"}`}>
              {renderValue(label, v)}
            </span>
          </div>
        );
      })}
    </div>

    <button
      onClick={() => onMore(row)}
      className="mt-4 w-full inline-flex items-center justify-center gap-1 py-2.5 rounded-xl border border-[#fd561e]/40 text-sm font-semibold text-[#fd561e] hover:bg-[#fff5f0] transition-colors cursor-pointer"
    >
      View More Details <ChevronRight className="w-4 h-4" />
    </button>
  </div>
);

const Transactions = () => {
  const navigate = useNavigate();

  /* =====================================================================
     LOGGED-IN USER CHECK
     - Login unte: direct ga transactions open avvali (search + OTP skip).
       Profile lo unna mobile/email/uid tho auto fetch chestam.
     - Login lekapote (or mobile profile lo lekapote): existing
       "Transaction Verification" (search -> OTP -> details) flow.
     ===================================================================== */
  const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
  const userObj = storedUser?.user || storedUser || {};

  const loggedInUid =
    grab(userObj, ["uid", "id"]) || grab(storedUser, ["uid", "id"]) || "";

  // Profile mobile (country code unte chివరి 10 digits teesukుంటాం)
  const loggedInMobile = String(
    grab(userObj,  ["umobile", "mobile", "phone", "mobileno", "mobile_no", "phno", "contact"]) ||
    grab(storedUser, ["umobile", "mobile", "phone", "mobileno", "mobile_no", "phno", "contact"]) || ""
  ).replace(/[^0-9]/g, "").slice(-10);

  const loggedInEmail =
    grab(userObj,  ["uemail", "email", "mail", "emailid", "email_id"]) ||
    grab(storedUser, ["uemail", "email", "mail", "emailid", "email_id"]) || "";

  const isLoggedIn = !!loggedInUid;
  const canAutoLoad = isLoggedIn && !!loggedInMobile;

  // Login + mobile unte "auto" (silent loading) tho start, lekapote "search"
  const [step, setStep] = useState(canAutoLoad ? "auto" : "search"); // auto | search | otp | details

  const [opt1Mobile, setOpt1Mobile] = useState("");
  const [opt1Email, setOpt1Email] = useState("");
  const [opt2Mobile, setOpt2Mobile] = useState("");
  const [opt2TxnId, setOpt2TxnId] = useState("");
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState("");
  const [autoError, setAutoError] = useState(""); // logged-in auto fetch error

  const [checking, setChecking] = useState(false);
  const [sendingOtp, setSendingOtp] = useState(false);
  const [verifying, setVerifying] = useState(false);

  const [otp, setOtp] = useState("");
  const [otpError, setOtpError] = useState("");
  const [resend, setResend] = useState(RESEND_SECONDS);
  const [canResend, setCanResend] = useState(false);

  const [vMobile, setVMobile] = useState("");
  const [vEmail, setVEmail] = useState("");
  const [vTxnId, setVTxnId] = useState("");
  const [useTxnId, setUseTxnId] = useState(false);

  const [transactions, setTransactions] = useState([]);
  const [dialog, setDialog] = useState(null);   // {title, message}
  const [details, setDetails] = useState(null);  // {loading,row,error,paymentId}

  // ===== Logged-in auto fetch (no OTP) =====
  const autoLoadTransactions = async () => {
    if (!loggedInMobile) { setStep("search"); return; } // mobile lekapote manual verify
    setStep("auto");
    setAutoError(""); setApiError("");
    try {
      // Login identity already authenticated kabatti OTP avasaram ledu.
      // Backend ki uid kuda pamputunnam — supported aithe daani base ga
      // search cheyyochu, lekapothe mobile/email tho serve avtundi.
      const body = {
        mobile: loggedInMobile,
        uid: loggedInUid,
        ...(loggedInEmail ? { email: loggedInEmail } : {}),
      };
      const res = await axios.post(`${API_BASE_URL}/bill/txn-search`, body, {
        headers: { "Content-Type": "application/json" }, timeout: 30000,
      });
      const rows = sortByDate(res.data?.rows || []);
      setVMobile(loggedInMobile); setVEmail(loggedInEmail); setVTxnId(""); setUseTxnId(false);
      setTransactions(rows);
      setStep("details");
    } catch (err) {
      setAutoError(err.response?.data?.message || "Failed to load your transactions. Please try again.");
    }
  };

  useEffect(() => { window.scrollTo({ top: 0, behavior: "smooth" }); }, [step]);

  // Mount lo login unte auto fetch trigger
  useEffect(() => {
    if (canAutoLoad) autoLoadTransactions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (step !== "otp" || canResend) return;
    if (resend <= 0) { setCanResend(true); return; }
    const t = setTimeout(() => setResend((r) => r - 1), 1000);
    return () => clearTimeout(t);
  }, [step, resend, canResend]);

  const determineFlow = () => {
    setApiError("");
    if (opt2TxnId.trim()) checkTransactions("txn");
    else if (opt1Mobile.trim() && opt1Email.trim()) checkTransactions("email");
    else setErrors({ opt1Mobile: "Please fill at least one option", opt2Mobile: "Please fill at least one option" });
  };

  const checkTransactions = async (mode) => {
    const e = {};
    let mobile = "", email = "", txnId = "";
    if (mode === "email") {
      mobile = opt1Mobile.trim().replace(/[^0-9]/g, "");
      email = opt1Email.trim();
      const m = validateMobile(mobile); if (m) e.opt1Mobile = m;
      const em = validateEmail(email); if (em) e.opt1Email = em;
    } else {
      mobile = opt2Mobile.trim().replace(/[^0-9]/g, "");
      txnId = opt2TxnId.trim();
      const m = validateMobile(mobile); if (m) e.opt2Mobile = m;
      const t = validateTxnId(txnId); if (t) e.opt2TxnId = t;
    }
    setErrors(e);
    if (Object.keys(e).length) return;

    setChecking(true); setApiError("");
    try {
      const body = mode === "email" ? { mobile, email } : { mobile, transactionId: txnId };
      const res = await axios.post(`${API_BASE_URL}/bill/txn-search`, body, {
        headers: { "Content-Type": "application/json" }, timeout: 30000,
      });
      const rows = sortByDate(res.data?.rows || []);
      if (rows.length > 0) {
        setTransactions(rows);
        setVMobile(mobile); setVEmail(email); setVTxnId(txnId); setUseTxnId(mode === "txn");
        await sendOtp(mobile);
      } else {
        setChecking(false);
        setDialog(mode === "email"
          ? { title: "No Transactions Found", message: "No transaction history found for the provided details." }
          : { title: "Transaction ID Not Found", message: "No transaction found with the provided mobile and transaction ID." });
      }
    } catch (err) {
      setChecking(false);
      setApiError(err.response?.data?.message || "Failed to check transactions. Please try again.");
    }
  };

  const sendOtp = async (mobile) => {
    setSendingOtp(true); setApiError("");
    try {
      const res = await axios.post(`${API_BASE_URL}/bill/send-otp`, { mobile }, {
        headers: { "Content-Type": "application/json" }, timeout: 30000,
      });
      if (res.data?.success || res.data?.status === "ok") {
        setStep("otp"); setResend(RESEND_SECONDS); setCanResend(false); setOtp(""); setOtpError("");
      } else {
        setApiError(res.data?.message || "Failed to send OTP");
      }
    } catch (err) {
      setApiError(err.response?.data?.message || "Failed to send OTP. Please try again.");
    } finally {
      setChecking(false); setSendingOtp(false);
    }
  };

  const verifyOtp = async () => {
    if (otp.length !== 4) { setOtpError("Please enter 4-digit OTP"); return; }
    setVerifying(true); setOtpError("");
    try {
      const res = await axios.post(`${API_BASE_URL}/bill/verify-otp`, { mobile: vMobile, otp }, {
        headers: { "Content-Type": "application/json" }, timeout: 30000,
      });
      const d = res.data || {};
      const ok = d.success === true || d.status === "ok" || d.status === "success";
      if (ok) setStep("details");
      else setOtpError(d.message || "Invalid OTP");
    } catch (err) {
      setOtpError(err.response?.data?.message || "OTP verification failed");
    } finally {
      setVerifying(false);
    }
  };

  const resendOtp = async () => {
    if (!canResend) return;
    setOtp(""); setResend(RESEND_SECONDS); setCanResend(false);
    await sendOtp(vMobile);
  };

  const backToSearch = () => { setStep("search"); setOtp(""); setOtpError(""); setApiError(""); };

  const resetAll = () => {
    setStep("search");
    setOpt1Mobile(""); setOpt1Email(""); setOpt2Mobile(""); setOpt2TxnId("");
    setErrors({}); setApiError(""); setOtp(""); setOtpError("");
    setTransactions([]); setVMobile(""); setVEmail(""); setVTxnId(""); setUseTxnId(false);
  };

  // Back button: login user ki search/otp ledu kabatti direct BillHomePage ki.
  const handleBack = () => {
    if (step === "otp") { backToSearch(); return; }
    if (step === "details" && !isLoggedIn) { backToSearch(); return; }
    navigate("/BillHomePage");
  };
  const backLabel =
    (step === "otp" || (step === "details" && !isLoggedIn)) ? "Back" : "Back to Bill Payments";

  // View More -> 1 API call (Payment ID lekapote popup error)
  const fetchDetails = async (pid, cust) => {
    setDetails((d) => ({ ...(d || {}), loading: true, error: "", paymentId: pid, customerId: cust ?? d?.customerId }));
    try {
      const customerid = cust ?? details?.customerId ?? vMobile;
      const res = await axios.post(`${API_BASE_URL}/bill/txn-details`, { paymentid: pid, customerid, mobile: vMobile }, {
        headers: { "Content-Type": "application/json" }, timeout: 30000,
      });
      if (res.data?.success && res.data?.data) {
        setDetails({ loading: false, row: res.data.data, error: "", paymentId: pid });
      } else {
        setDetails({ loading: false, row: null, error: res.data?.message || "Transaction details not found", paymentId: pid });
      }
    } catch (err) {
      setDetails({ loading: false, row: null, error: err.response?.data?.message || "Failed to load details", paymentId: pid });
    }
  };

  const openDetails = (row) => {
    const pid = pick(row, PAYMENT_ID_KEYS);
    if (!pid) {
      setDialog({ title: "Payment ID Not Available", message: "Payment ID is not available for this transaction, so detailed information cannot be fetched." });
      return;
    }
    // retrieve-payments customerid = aa transaction row yokka uid (confirmed).
    // (login uid / mobile kaadu — record owner uid kavali)
    const cust = pick(row, ["uid"]) || pick(row, ["consumer_id", "tmobile"]) || vMobile;
    setDetails({ loading: true, row: null, error: "", paymentId: pid, customerId: cust });
    fetchDetails(pid, cust);
  };

  const inputBase =
    "w-full h-12 pl-11 pr-4 rounded-xl border bg-gray-50 text-sm text-gray-800 outline-none transition-all focus:bg-white focus:border-[#fd561e] focus:ring-2 focus:ring-[#fd561e]/20";

  const busy = checking || sendingOtp;

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-12 px-4">
      <div className={step === "details" ? "max-w-6xl mx-auto" : "max-w-2xl mx-auto"}>
        <button
          onClick={handleBack}
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-[#fd561e] mb-4 transition-colors cursor-pointer"
        >
          <ChevronLeft className="w-4 h-4" /> {backLabel}
        </button>

        {/* ===== AUTO (logged-in silent load) ===== */}
        {step === "auto" && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
            {autoError ? (
              <div className="text-center">
                <AlertTriangle className="w-12 h-12 mx-auto text-amber-400 mb-3" />
                <p className="text-sm text-gray-700 mb-5">{autoError}</p>
                <div className="flex items-center justify-center gap-3">
                  <button onClick={autoLoadTransactions}
                    className="px-5 py-2.5 rounded-xl bg-[#fd561e] text-white text-sm font-semibold hover:bg-[#e04d19] transition-colors cursor-pointer">
                    Retry
                  </button>
                  <button onClick={() => { setAutoError(""); setStep("search"); }}
                    className="px-5 py-2.5 rounded-xl border border-gray-200 text-gray-700 text-sm font-semibold hover:bg-gray-50 transition-colors cursor-pointer">
                    Verify manually
                  </button>
                </div>
              </div>
            ) : (
              <div className="py-10 flex flex-col items-center text-gray-500">
                <Loader2 className="w-8 h-8 animate-spin text-[#fd561e] mb-4" />
                <span className="text-sm">Loading your transactions...</span>
              </div>
            )}
          </div>
        )}

        {/* ===== SEARCH ===== */}
        {step === "search" && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8">
            <h1 className="text-xl font-bold text-[#fd561e]">Transaction Verification</h1>
            <p className="text-sm text-gray-500 mt-1">Enter your details to view transaction history</p>

            {apiError && (
              <div className="mt-5 flex items-start gap-2 rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
                <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" /><span>{apiError}</span>
              </div>
            )}

            <div className="mt-6 border border-gray-200 rounded-xl p-4">
              <p className="text-sm font-bold text-gray-800 mb-3">Option 1: Mobile + Email</p>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Mobile Number</label>
              <div className="relative mb-1">
                <Phone className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-[#fd561e]" />
                <input type="tel" value={opt1Mobile} maxLength={10}
                  onChange={(e) => { setOpt1Mobile(e.target.value.replace(/[^0-9]/g, "")); setErrors((p) => ({ ...p, opt1Mobile: "" })); }}
                  placeholder="10-digit mobile" className={`${inputBase} ${errors.opt1Mobile ? "border-red-400" : "border-gray-200"}`} />
              </div>
              {errors.opt1Mobile && <p className="text-xs text-red-600 mb-2">{errors.opt1Mobile}</p>}
              <label className="block text-xs font-semibold text-gray-600 mb-1.5 mt-3">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-[#fd561e]" />
                <input type="email" value={opt1Email}
                  onChange={(e) => { setOpt1Email(e.target.value); setErrors((p) => ({ ...p, opt1Email: "" })); }}
                  placeholder="you@example.com" className={`${inputBase} ${errors.opt1Email ? "border-red-400" : "border-gray-200"}`} />
              </div>
              {errors.opt1Email && <p className="text-xs text-red-600 mt-1">{errors.opt1Email}</p>}
            </div>

            <div className="flex items-center gap-4 my-5">
              <div className="flex-1 h-px bg-gray-200" /><span className="text-xs font-bold text-gray-400">OR</span><div className="flex-1 h-px bg-gray-200" />
            </div>

            <div className="border border-gray-200 rounded-xl p-4">
              <p className="text-sm font-bold text-gray-800 mb-3">Option 2: Mobile + Transaction ID</p>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Mobile Number</label>
              <div className="relative mb-1">
                <Phone className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-[#fd561e]" />
                <input type="tel" value={opt2Mobile} maxLength={10}
                  onChange={(e) => { setOpt2Mobile(e.target.value.replace(/[^0-9]/g, "")); setErrors((p) => ({ ...p, opt2Mobile: "" })); }}
                  placeholder="10-digit mobile" className={`${inputBase} ${errors.opt2Mobile ? "border-red-400" : "border-gray-200"}`} />
              </div>
              {errors.opt2Mobile && <p className="text-xs text-red-600 mb-2">{errors.opt2Mobile}</p>}
              <label className="block text-xs font-semibold text-gray-600 mb-1.5 mt-3">Transaction ID</label>
              <div className="relative">
                <Hash className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-[#fd561e]" />
                <input type="text" value={opt2TxnId}
                  onChange={(e) => { setOpt2TxnId(e.target.value); setErrors((p) => ({ ...p, opt2TxnId: "" })); }}
                  placeholder="Enter your transaction reference number" className={`${inputBase} ${errors.opt2TxnId ? "border-red-400" : "border-gray-200"}`} />
              </div>
              {errors.opt2TxnId && <p className="text-xs text-red-600 mt-1">{errors.opt2TxnId}</p>}
            </div>

            <button onClick={determineFlow} disabled={busy}
              className="mt-7 w-full inline-flex cursor-pointer items-center justify-center gap-2 py-3 rounded-xl bg-[#fd561e] text-white text-sm font-semibold hover:bg-[#e04d19] transition-colors disabled:opacity-60">
              {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
              {busy ? "Processing..." : "Check Transactions"}
            </button>
          </div>
        )}

        {/* ===== OTP ===== */}
        {step === "otp" && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8">
            <h1 className="text-xl font-bold text-[#fd561e]">Enter OTP</h1>
            <p className="text-sm text-gray-500 mt-1">Enter the 4-digit OTP sent to your mobile</p>
            <div className="mt-6 space-y-3">
              <div className="relative">
                <Phone className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-[#fd561e]" />
                <input readOnly value={`+91 ${vMobile}`} className={`${inputBase} border-gray-200 bg-gray-100`} />
              </div>
              {vEmail && (
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-[#fd561e]" />
                  <input readOnly value={vEmail} className={`${inputBase} border-gray-200 bg-gray-100`} />
                </div>
              )}
              {useTxnId && vTxnId && (
                <div className="relative">
                  <Receipt className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-[#fd561e]" />
                  <input readOnly value={vTxnId} className={`${inputBase} border-gray-200 bg-gray-100`} />
                </div>
              )}
            </div>
            <div className="relative mt-5">
              <Lock className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-[#fd561e]" />
              <input type="tel" value={otp} maxLength={4}
                onChange={(e) => { setOtp(e.target.value.replace(/[^0-9]/g, "")); setOtpError(""); }}
                placeholder="• • • •"
                className={`${inputBase} text-center tracking-[0.5em] font-bold text-lg ${otpError ? "border-red-400" : "border-gray-200"}`} />
            </div>
            {otpError && <p className="text-xs text-red-600 mt-2 text-center">{otpError}</p>}
            <div className="flex items-center justify-center gap-1 mt-4 text-sm">
              <span className="text-gray-500">Didn't receive OTP?</span>
              <button onClick={resendOtp} disabled={!canResend}
                className={`font-semibold ${canResend ? "text-[#fd561e] hover:underline cursor-pointer" : "text-gray-400 cursor-default"}`}>
                {canResend ? "Resend OTP" : `Resend in ${resend}s`}
              </button>
            </div>
            <button onClick={verifyOtp} disabled={verifying}
              className="mt-6 w-full cursor-pointer inline-flex items-center justify-center gap-2 py-3 rounded-xl bg-[#fd561e] text-white text-sm font-semibold hover:bg-[#e04d19] transition-colors disabled:opacity-60">
              {verifying && <Loader2 className="w-4 h-4 animate-spin" />}
              {verifying ? "Verifying..." : "Verify OTP"}
            </button>
          </div>
        )}

        {/* ===== DETAILS (3 cards per row) ===== */}
        {step === "details" && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-xl font-bold text-gray-900">Transaction Details</h1>
                <p className="text-sm text-gray-500">{transactions.length} record(s) found</p>
              </div>
              {isLoggedIn ? (
                <button onClick={autoLoadTransactions} className="inline-flex items-center gap-1 text-sm font-semibold text-[#fd561e] hover:underline cursor-pointer">
                  <RefreshCw className="w-4 h-4" /> Refresh
                </button>
              ) : (
                <button onClick={resetAll} className="text-sm font-semibold text-[#fd561e] hover:underline cursor-pointer">Search again</button>
              )}
            </div>
            {transactions.length === 0 ? (
              <div className="bg-white rounded-2xl border border-gray-100 p-10 text-center text-gray-500">No transactions to show.</div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {transactions.map((row, i) => (
                  <TransactionCard key={pick(row, PAYMENT_ID_KEYS) || i} row={row} onMore={openDetails} />
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* ===== Info dialog ===== */}
      {dialog && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 px-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="flex items-center justify-between px-6 pt-5">
              <h3 className="text-lg font-bold text-[#fd561e]">{dialog.title}</h3>
              <button onClick={() => setDialog(null)} className="text-gray-400 hover:text-gray-700 cursor-pointer"><X className="w-5 h-5" /></button>
            </div>
            <div className="px-6 py-5 text-center">
              <Receipt className="w-12 h-12 mx-auto text-amber-400 mb-3" />
              <p className="text-sm text-gray-700">{dialog.message}</p>
            </div>
            <div className="flex justify-end px-6 py-4 border-t border-gray-100">
              <button onClick={() => setDialog(null)} className="px-6 py-2.5 rounded-xl bg-[#fd561e] text-white text-sm font-semibold hover:bg-[#e04d19] transition-colors cursor-pointer">OK</button>
            </div>
          </div>
        </div>
      )}

      {/* ===== View More Details popup ===== */}
      {details && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 px-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-hidden flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h3 className="text-lg font-bold text-gray-900">Transaction Details</h3>
              <button onClick={() => setDetails(null)} className="text-gray-400 hover:text-gray-700 cursor-pointer"><X className="w-5 h-5" /></button>
            </div>
            <div className="px-5 py-5 overflow-y-auto bg-white">
              {details.loading ? (
                <div className="py-12 flex flex-col items-center text-gray-500">
                  <Loader2 className="w-7 h-7 animate-spin text-[#fd561e] mb-3" /><span className="text-sm">Loading details...</span>
                </div>
              ) : details.error ? (
                <div className="py-10 text-center text-red-600 text-sm">{details.error}</div>
              ) : details.row ? (
                <>
                  {DETAIL_SECTIONS.map((s) => {
                    const rendered = <Section key={s.title} title={s.title} fields={s.fields} row={details.row} />;
                    // Customer Information ni custom ga render chestam (customer name,
                    // authenticators, customer id) + tarvatha Bill Details (billlist)
                    if (s.title === "Customer Information") {
                      const d = details.row;
                      const bills = Array.isArray(d.billlist) ? d.billlist : [];
                      const auths = Array.isArray(d.authenticators) ? d.authenticators : [];
                      const custName = bills[0]?.customer_name || pick(d, ["customer_name"]);
                      // Customer ID display: login aithe uid, lekapote search chesina mobile
                      const custIdDisplay = loggedInUid || vMobile || pick(d, ["customerid"]);
                      return (
                        <div key="ci-bills">
                          <div className="bg-gray-50 rounded-xl p-4 mb-4">
                            <h4 className="text-sm font-bold text-[#fd561e] mb-3">Customer Information</h4>
                            <div className="space-y-2">
                              {custName && (
                                <div className="flex justify-between gap-3 text-sm">
                                  <span className="text-gray-700 font-medium">Customer Name</span>
                                  <span className="text-gray-500 text-right break-all">{custName}</span>
                                </div>
                              )}
                              {auths.map((a, ai) => (
                                <div key={ai} className="flex justify-between gap-3 text-sm">
                                  <span className="text-gray-700 font-medium">{a?.parameter_name || "Detail"}</span>
                                  <span className="text-gray-500 text-right break-all">{a?.value ?? "—"}</span>
                                </div>
                              ))}
                              <div className="flex justify-between gap-3 text-sm">
                                <span className="text-gray-700 font-medium">Customer ID</span>
                                <span className="text-gray-500 text-right break-all">{custIdDisplay || "—"}</span>
                              </div>
                            </div>
                          </div>
                          {bills.length > 0 && (
                            <div className="bg-gray-50 rounded-xl p-4 mb-4">
                              <h4 className="text-sm font-bold text-[#fd561e] mb-3">Bill Details</h4>
                              {bills.map((bill, bi) => (
                                <div key={bi} className={bi > 0 ? "mt-4 pt-4 border-t border-gray-200" : ""}>
                                  <div className="space-y-2">
                                    {BILL_FIELDS.map(([label, keys]) => {
                                      const v = pick(bill, keys);
                                      return (
                                        <div key={label} className="flex justify-between gap-3 text-sm">
                                          <span className="text-gray-700 font-medium">{label}</span>
                                          <span className="text-gray-500 text-right break-all">{renderValue(label, v)}</span>
                                        </div>
                                      );
                                    })}
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    }
                    return rendered;
                  })}
                </>
              ) : null}
            </div>
            <div className="px-5 py-4 border-t border-gray-100">
              <button onClick={() => fetchDetails(details.paymentId, details.customerId)} disabled={details.loading}
                className="w-full inline-flex items-center justify-center gap-2 py-3 rounded-xl bg-[#fd561e] text-white text-sm font-semibold hover:bg-[#e04d19] transition-colors disabled:opacity-60 cursor-pointer">
                <RefreshCw className={`w-4 h-4 ${details.loading ? "animate-spin" : ""}`} /> Refresh Details
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Transactions;