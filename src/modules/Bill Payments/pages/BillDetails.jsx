import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

// ─────────────────────────────────────────────────────────────
// UTILS
// ─────────────────────────────────────────────────────────────
const safeParseJson = (raw) => {
  if (!raw || raw === "nan") return null;
  try {
    if (typeof raw === "object") return raw;
    return JSON.parse(raw.replace(/'/g, '"'));
  } catch {
    return null;
  }
};

const calcConvFee = (convFeeConfig, paymentMethod, paymentChannel, amount) => {
  if (!convFeeConfig || !Array.isArray(convFeeConfig)) return { fee: 0, gst: 0, total: 0 };
  const amt = parseFloat(amount) || 0;
  const slab =
    convFeeConfig.find((s) => {
      const methodMatch = s.payment_method?.toLowerCase() === paymentMethod?.toLowerCase();
      const channelMatch =
        !s.payment_channel ||
        s.payment_channel?.toLowerCase().includes(paymentChannel?.toLowerCase());
      const slabStart = parseFloat(s.amount_slab_start) || 0;
      const slabEnd = parseFloat(s.amount_slab_end) || Infinity;
      return methodMatch && channelMatch && amt >= slabStart && amt <= slabEnd;
    }) ||
    convFeeConfig.find(
      (s) => s.payment_method?.toLowerCase() === paymentMethod?.toLowerCase()
    );
  if (!slab) return { fee: 0, gst: 0, total: 0 };
  let fee = 0;
  const baseConvFee = parseFloat(slab.bou_conv_fee) || 0;
  if (slab.bou_conv_fee_type === "fixed") fee = baseConvFee;
  else if (slab.bou_conv_fee_type === "percentage") fee = (amt * baseConvFee) / 100;
  fee = Math.min(
    Math.max(fee, parseFloat(slab.min_bou_conv_fee) || 0),
    parseFloat(slab.max_bou_conv_fee) || fee
  );
  let gst = 0;
  const baseGst = parseFloat(slab.bou_conv_fee_gst) || 0;
  if (slab.bou_conv_fee_gst_type === "percentage") gst = (fee * baseGst) / 100;
  else if (slab.bou_conv_fee_gst_type === "fixed") gst = baseGst;
  return {
    fee: parseFloat(fee.toFixed(2)),
    gst: parseFloat(gst.toFixed(2)),
    total: parseFloat((fee + gst).toFixed(2)),
  };
};

const methodToChannel = (method) => {
  if (method === "BankAccount") return "InternetBanking";
  if (method === "UPI") return "MobileBanking";
  return "Internet";
};

const validateAmountForMethod = (allowedMethods, method, amount) => {
  const methodConfig = (allowedMethods || []).find(
    (m) => m.payment_method?.toLowerCase() === method?.toLowerCase()
  );
  if (!methodConfig) return { valid: true };
  const amt = parseFloat(amount) || 0;
  const min = parseFloat(methodConfig.min_limit) || 0;
  const max = parseFloat(methodConfig.max_limit) || Infinity;
  if (amt < min) return { valid: false, msg: `Minimum amount for ${method} is ₹${min}` };
  if (amt > max)
    return {
      valid: false,
      msg: `Maximum amount for ${method} is ₹${max.toLocaleString("en-IN")}`,
    };
  return { valid: true };
};

// ─────────────────────────────────────────────────────────────
// ICONS
// ─────────────────────────────────────────────────────────────
const IconBank = () => (
  <svg className="w-5 h-5 text-[#fd561e]" viewBox="0 0 24 24" fill="currentColor">
    <path d="M3 7l9-4 9 4v2H3V7zm2 3h2v7H5v-7zm4 0h2v7H9v-7zm4 0h2v7h-2v-7zm4 0h2v7h-2v-7zM3 19h18v2H3v-2z" />
  </svg>
);
const IconCard = () => (
  <svg className="w-5 h-5 text-[#fd561e]" viewBox="0 0 24 24" fill="currentColor">
    <path d="M20 4H4a2 2 0 00-2 2v12a2 2 0 002 2h16a2 2 0 002-2V6a2 2 0 00-2-2zm0 4H4V8h16v.01zM4 18v-6h16v6H4z" />
  </svg>
);
const IconUPI = () => (
  <svg className="w-5 h-5 text-[#fd561e]" viewBox="0 0 24 24" fill="currentColor">
    <path d="M4 4h4v4H4zm6 0h4v4h-4zm6 0h4v4h-4zM4 10h4v4H4zm6 0h4v4h-4zm6 0h4v4h-4zM4 16h4v4H4zm6 0h4v4h-4zm6 0h4v4h-4z" />
  </svg>
);

const METHOD_META = {
  BankAccount: { label: "Net Banking", icon: <IconBank /> },
  CreditCard: { label: "Credit Card", icon: <IconCard /> },
  DebitCard: { label: "Debit Card", icon: <IconCard /> },
  UPI: { label: "UPI", icon: <IconUPI /> },
};

// ─────────────────────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────────────────────
const BillDetails = () => {
  const navigate = useNavigate();

  const [billData, setBillData] = useState(null);
  const [authenticators, setAuthenticators] = useState([]);
  const [formData, setFormData] = useState({});
  const [userDetails, setUserDetails] = useState({ name: "", mobile: "", email: "" });
  const [isEditingUser, setIsEditingUser] = useState(false);

  const [step, setStep] = useState(1);
  const [fetchingBill, setFetchingBill] = useState(false);
  const [validationError, setValidationError] = useState(false);
  const [validationMsg, setValidationMsg] = useState("");

  const [billAmount, setBillAmount] = useState("");
  const [totalPayable, setTotalPayable] = useState("");
  const [billSummary, setBillSummary] = useState(null);

  // Plans
  const [plans, setPlans] = useState([]);
  const [plansLoading, setPlansLoading] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);

  // Payment
  const [showPayment, setShowPayment] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState("");
  const [upiId, setUpiId] = useState("");
  const [upiError, setUpiError] = useState("");
  const [convFeeInfo, setConvFeeInfo] = useState({ fee: 0, gst: 0, total: 0 });
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [amountMethodErr, setAmountMethodErr] = useState("");
  const [additionalPayFields, setAdditionalPayFields] = useState({});
  
  // Popup state
  const [showPopup, setShowPopup] = useState(false);
  const [popupMessage, setPopupMessage] = useState("");

  // ── Load billData + user from localStorage ──
  useEffect(() => {
    const raw = localStorage.getItem("billData");
    if (!raw) {
      navigate("/BillHomePage");
      return;
    }
    const data = JSON.parse(raw);
    setBillData(data);

    let auths = data.authenticators || [];
    if (typeof auths === "string") {
      try {
        auths = JSON.parse(auths.replace(/'/g, '"'));
      } catch {
        auths = [];
      }
    }
    auths = auths.filter((a) => a && typeof a === "object" && a.parameter_name);
    setAuthenticators(auths);

    const init = {};
    auths.forEach((f) => {
      init[f.parameter_name] = "";
    });
    setFormData(init);

    // ── Read user from localStorage ──
    const authUser = (() => {
      try {
        const keys = ["user", "authUser", "userInfo"];
        for (const k of keys) {
          const u = localStorage.getItem(k);
          if (u) {
            const parsed = JSON.parse(u);
            return parsed?.data || parsed;
          }
        }
        if (data.loggedInUser) return data.loggedInUser?.data || data.loggedInUser;
      } catch {
        return null;
      }
      return null;
    })();

    const getString = (...candidates) => {
      for (const v of candidates) {
        if (v && typeof v === "string" && v.trim()) return v.trim();
        if (v && typeof v === "number") return String(v);
      }
      return "";
    };

    if (authUser) {
      setUserDetails({
        name: getString(
          authUser.name,
          authUser.uname,
          authUser.full_name,
          typeof authUser.user === "string" ? authUser.user : null,
        ),
        mobile: getString(
          authUser.mobile,
          authUser.umob,
        ),
        email: getString(
          authUser.email,
          authUser.umail,
        ),
      });
    }
  }, [navigate]);

  // ── Load plans if available ──
  useEffect(() => {
    if (billData?.plan_available !== "Y") return;
    (async () => {
      setPlansLoading(true);
      try {
        const res = await axios.post("https://api.bobros.co.in/db/select", {
          table: "biller_plans",
          columns: ["*"],
          conditions: { billerid: billData.billerid },
        });
        setPlans(res.data?.rows || []);
      } catch {
        // silently fail
      } finally {
        setPlansLoading(false);
      }
    })();
  }, [billData]);

  // ── Scroll lock when payment modal is open ──
  useEffect(() => {
    document.body.style.overflow = showPayment ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [showPayment]);

  // ── Recalculate conv fee when method/amount changes ──
  useEffect(() => {
    if (!selectedMethod || !billData) return;
    const channel = methodToChannel(selectedMethod);
    const info = calcConvFee(
      billData.customer_conv_fee,
      selectedMethod,
      channel,
      totalPayable
    );
    setConvFeeInfo(info);
    const v = validateAmountForMethod(
      billData.allowed_payment_methods,
      selectedMethod,
      totalPayable
    );
    setAmountMethodErr(v.valid ? "" : v.msg);
  }, [selectedMethod, totalPayable, billData]);

  const handleInputChange = (paramName, value) => {
    setFormData((prev) => ({ ...prev, [paramName]: value }));
  };

  const getGroupInfo = useCallback(
    (paramName) => {
      const groups = safeParseJson(billData?.biller_authenticator_group);
      if (!groups) return null;
      return groups.find((g) => g.auth_parameters?.includes(paramName)) || null;
    },
    [billData]
  );

  // ─────────────────────────────────────────────────────────────
  // FETCH BILL / VALIDATE
  // ─────────────────────────────────────────────────────────────
  const handleFetchBill = async (e) => {
    e.preventDefault();
    if (!e.target.checkValidity()) {
      e.target.reportValidity();
      return;
    }

    const groups = safeParseJson(billData?.biller_authenticator_group);
    if (groups) {
      for (const grp of groups) {
        const required = parseInt(grp.auth_input) || 1;
        const filled = (grp.auth_parameters || []).filter(
          (p) => formData[p]?.trim()
        ).length;
        if (filled < required) {
          alert(
            `Please fill at least ${required} field(s) from: ${grp.auth_parameters.join(", ")}`
          );
          return;
        }
      }
    } else {
      for (const auth of authenticators) {
        const isOptional = auth.optional === "Y";
        if (!isOptional && !formData[auth.parameter_name]?.trim()) {
          alert(`Please fill ${auth.parameter_name}`);
          return;
        }
      }
    }

    if (billData?.online_validation !== "Y") {
      setBillAmount("");
      setTotalPayable("");
      setBillSummary(null);
      setStep(2);
      return;
    }

    setFetchingBill(true);
    setValidationError(false);
    setValidationMsg("");

    try {
      const authenticatorValues = {};
      for (const auth of authenticators) {
        const val = formData[auth.parameter_name];
        if (val && val.trim()) {
          authenticatorValues[auth.parameter_name] = val.trim();
        }
      }

      const payload = {
        billerid: billData.billerid,
        customerDetails: {
          name: userDetails.name,
          mobile: userDetails.mobile,
          email: userDetails.email,
        },
        authenticatorValues,
      };

      console.log("===== VALIDATION PAYLOAD =====");
      console.log(JSON.stringify(payload, null, 2));

      const res = await axios.post("/bill/validate-payment", payload);

      console.log("===== VALIDATION RESPONSE =====");
      console.log(res.data);

      if (res.data?.success) {
        const raw = res.data.data || res.data;
        const nested = raw.data || raw;
        const bd = nested.billlist?.[0] || nested;

        const amount =
          bd.billamount ||
          bd.net_billamount ||
          bd.bill_amount ||
          bd.amount ||
          bd.totalAmount ||
          bd.dueAmount ||
          "";

        const billNumber = bd.billnumber || bd.bill_number || bd.billNumber || "N/A";
        const dueDate = bd.billduedate || bd.due_date || bd.dueDate || "N/A";
        const billPeriod = bd.billperiod || bd.billPeriod || null;
        const status = bd.billstatus || bd.status || bd.bill_status || "Pending";
        const validationId = nested.validationid || nested.validationId || "";
        const validationDate = nested.validation_date || nested.validationDate || "";
        const customerId = nested.customerid || "";

        if (!amount) {
          setValidationError(true);
          setValidationMsg("Bill amount not found in response. Please try again.");
          return;
        }

        const parsedAmt = parseFloat(amount) || 0;
        setBillAmount(parsedAmt.toFixed(2));
        setTotalPayable(parsedAmt.toFixed(2));

        const editable =
          billData.bill_presentment !== "Y" || billData.partial_pay === "Y";

        setBillSummary({
          billNumber,
          dueDate,
          billPeriod,
          status,
          validationId,
          validationDate,
          customerId,
          editable,
          dueWarning: billData.pay_after_duedate === "N",
        });

        setStep(2);
      } else {
        const errData = res.data?.error || res.data?.data?.error || {};
        const errorMsg =
          (typeof errData === "object" ? errData.message || errData.errorDesc : errData) ||
          res.data?.message ||
          res.data?.errorDesc ||
          res.data?.error ||
          "Unable to validate your bill. Please check your details and try again.";
        setValidationError(true);
        setValidationMsg(typeof errorMsg === "string" ? errorMsg : JSON.stringify(errorMsg));
      }
    } catch (err) {
      console.error("Validation error:", err);
      const errResponse = err.response?.data;
      const errorMsg =
        errResponse?.error?.message ||
        errResponse?.error?.errorDesc ||
        (typeof errResponse?.error === "string" ? errResponse.error : null) ||
        errResponse?.message ||
        errResponse?.errorDesc ||
        "Unable to validate your bill. Please try again later.";
      setValidationError(true);
      setValidationMsg(errorMsg);
    } finally {
      setFetchingBill(false);
    }
  };

  // ─────────────────────────────────────────────────────────────
  // PROCEED TO PAYMENT
  // ─────────────────────────────────────────────────────────────
  const handleProceedToPayment = () => {
    if (!totalPayable || parseFloat(totalPayable) <= 0) {
      setPopupMessage("Please enter a valid amount.");
      setShowPopup(true);
      return;
    }
    setSelectedMethod("");
    setUpiId("");
    setUpiError("");
    setAmountMethodErr("");
    setConvFeeInfo({ fee: 0, gst: 0, total: 0 });
    const apf = {};
    (billData?.additional_payment_details || []).forEach((f) => {
      apf[f.parameter_name] = "";
    });
    setAdditionalPayFields(apf);
    setShowPayment(true);
  };

  // ─────────────────────────────────────────────────────────────
  // PAY
  // ─────────────────────────────────────────────────────────────
  const handlePay = async () => {
    if (!selectedMethod) return;
    
    // Check amount validation and show popup
    if (amountMethodErr) {
      setPopupMessage(amountMethodErr);
      setShowPopup(true);
      return;
    }
    
    if (selectedMethod === "UPI") {
      if (!upiId.trim()) {
        setUpiError("Please enter your UPI ID");
        return;
      }
      if (!/^[a-zA-Z0-9._-]+@[a-zA-Z0-9]+$/.test(upiId.trim())) {
        setUpiError("Please enter a valid UPI ID (eg. name@bank)");
        return;
      }
    }
    for (const f of billData?.additional_payment_details || []) {
      if (f.optional !== "Y" && !additionalPayFields[f.parameter_name]?.trim()) {
        alert(`Please fill: ${f.parameter_name}`);
        return;
      }
    }
    setPaymentLoading(true);
    try {
      const grandTotal = (parseFloat(totalPayable) + convFeeInfo.total).toFixed(2);
      const API_BASE = import.meta.env.VITE_API_BASE_URL || "";
      const payload = {
        fare: grandTotal,
        uid: userDetails.mobile,
        pname: userDetails.name,
        tickid: `${billSummary?.billNumber || "BILL"}_${Date.now()}`,
      };
      const res = await fetch(`${API_BASE}/billdesk/order`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data?.authToken && data?.bdorderid) {
        window.location.href = `https://uat.bobros.co.in/billdesk_checkout.php?merchantId=HYDBOBROS&bdorderid=${data.bdorderid}&authToken=${encodeURIComponent(data.authToken)}`;
      } else {
        alert(
          data?.message || data?.errorDesc || "Payment initiation failed. Please try again."
        );
        setPaymentLoading(false);
      }
    } catch {
      alert("Error processing payment. Please try again.");
      setPaymentLoading(false);
    }
  };

  const getAmountConstraints = () => {
    if (!billData || !billAmount) return {};
    const bill = parseFloat(billAmount);
    if (billData.partial_pay !== "Y")
      return { readOnly: billData.bill_presentment === "Y", value: billAmount };
    if (billData.partial_pay_amount === "exact_up") return { min: bill };
    if (billData.partial_pay_amount === "exact_down") return { min: 1, max: bill };
    return {};
  };

  // ─────────────────────────────────────────────────────────────
  // POPUP COMPONENT
  // ─────────────────────────────────────────────────────────────
  const Popup = () => {
    if (!showPopup) return null;
    
    return (
      <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 px-4">
        <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full animate-in fade-in zoom-in duration-200">
          <div className="p-6 text-center">
            <div className="w-14 h-14 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
              <svg className="w-7 h-7 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-gray-800 mb-2">Amount Limit Exceeded</h3>
            <p className="text-gray-600 text-sm mb-6">{popupMessage}</p>
            <button
              onClick={() => setShowPopup(false)}
              className="w-full bg-[#fd561e] text-white py-3 rounded-xl font-semibold hover:bg-[#e04010] transition-all duration-200"
            >
              OK
            </button>
          </div>
        </div>
      </div>
    );
  };

  // ─────────────────────────────────────────────────────────────
  // LOADING STATE
  // ─────────────────────────────────────────────────────────────
  if (!billData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#fd561e] mx-auto" />
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────
  // VALIDATION ERROR STATE
  // ─────────────────────────────────────────────────────────────
  if (validationError) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-12 text-center max-w-md w-full">
          <div className="flex justify-center mb-5">
            <svg viewBox="0 0 64 64" className="w-16 h-16">
              <polygon
                points="32,4 60,56 4,56"
                fill="#FCD34D"
                stroke="#F59E0B"
                strokeWidth="2"
                strokeLinejoin="round"
              />
              <text
                x="32"
                y="48"
                textAnchor="middle"
                fontSize="30"
                fontWeight="bold"
                fill="#92400E"
              >
                !
              </text>
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-[#fd561e] mb-3">Validation Failed</h2>
          <p className="text-gray-500 text-sm mb-8 leading-relaxed">{validationMsg}</p>
          <button
            onClick={() => {
              setValidationError(false);
              setValidationMsg("");
            }}
            className="bg-[#fd561e] text-white cursor-pointer px-8 py-3 rounded-xl font-semibold hover:bg-[#e04010] transition-all duration-200 inline-flex items-center gap-2"
          >
            <span>←</span> Go Back
          </button>
        </div>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────
  // SUB-COMPONENTS
  // ─────────────────────────────────────────────────────────────
  const BillerInfoCard = () => (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden h-full">
      <div className="p-6 text-center border-b border-gray-100">
        <div className="w-20 h-20 rounded-2xl bg-orange-50 border border-[#fd561e] flex items-center justify-center mx-auto mb-4">
          {billData.biller_logo ? (
            <img
              src={billData.biller_logo}
              alt={billData.biller}
              className="w-14 h-14 object-contain"
              onError={(e) => (e.target.style.display = "none")}
            />
          ) : (
            <i className="fa-solid fa-building text-3xl text-[#fd561e]" />
          )}
        </div>
        <h4 className="font-bold text-lg">{billData.biller}</h4>
        <span className="inline-block text-xs font-semibold text-[#fd561e] border border-[#fd561e] bg-orange-50 px-3 py-1 rounded-full mt-2">
          {billData.category1 || "Utility"}
        </span>
        <p className="text-sm text-gray-500 mt-3">
          {step === 2
            ? "Your bill has been fetched. Review and pay securely."
            : "Enter required details to fetch your bill."}
        </p>
      </div>
      <div className="p-4 space-y-1">
        <div className="flex justify-between text-sm py-2 border-b border-gray-100">
          <span className="text-gray-500">Category</span>
          <span className="font-semibold">{billData.category1}</span>
        </div>
        <div className="flex justify-between text-sm py-2 border-b border-gray-100">
          <span className="text-gray-500">Partial Pay</span>
          <span
            className={`font-semibold ${
              billData.partial_pay === "Y" ? "text-green-600" : "text-gray-700"
            }`}
          >
            {billData.partial_pay === "Y" ? "Allowed" : "Not Allowed"}
          </span>
        </div>
        <div className="flex justify-between text-sm py-2 border-b border-gray-100">
          <span className="text-gray-500">Pay After Due</span>
          <span
            className={`font-semibold ${
              billData.pay_after_duedate === "Y" ? "text-green-600" : "text-red-500"
            }`}
          >
            {billData.pay_after_duedate === "Y" ? "Yes" : "No"}
          </span>
        </div>
        <div className="flex justify-between text-sm py-2">
          <span className="text-gray-500">Network</span>
          <span className="font-semibold">
            {billData.isbillerbbps === "Y" ? "Bharat Connect" : "BBPS"}
          </span>
        </div>
      </div>
      {billData.biller_remarks && (
        <div className="mx-4 mb-4 p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 leading-relaxed">
          <p className="font-bold mb-1 flex items-center gap-1">
            <i className="fa-solid fa-circle-info text-amber-500" /> Important Note
          </p>
          <p>{billData.biller_remarks}</p>
        </div>
      )}
      <div className="bg-green-50 p-4 flex items-center gap-2 text-sm font-semibold text-green-700 border-t border-green-200">
        <i className="fa-solid fa-circle-check text-green-500" /> Verified & secured by Bharat
        BillPay
      </div>
    </div>
  );

  const StepBar = () => (
    <div className="bg-white rounded-2xl border border-gray-200 p-4 sm:p-6 mb-5 shadow-sm">
      <div className="flex items-center justify-between">
        {[
          { num: 1, label: "Account details", sub: "Fill customer info" },
          { num: 2, label: "Bill summary", sub: "Review amount" },
          { num: 3, label: "Review & pay", sub: "Confirm payment" },
          { num: 4, label: "Confirmation", sub: "Receipt" },
        ].map((s, i, arr) => (
          <div key={s.num} className="flex items-center flex-1">
            <div className="flex items-center gap-2 sm:gap-3">
              <div
                className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center font-bold text-sm sm:text-base ${
                  step >= s.num ? "bg-[#fd561e] text-white" : "bg-gray-200 text-gray-500"
                }`}
              >
                {step > s.num ? "✓" : s.num}
              </div>
              <div className="hidden sm:block">
                <div className="font-semibold text-sm">{s.label}</div>
                <div className="text-xs text-gray-500">{s.sub}</div>
              </div>
            </div>
            {i < arr.length - 1 && (
              <div
                className={`flex-1 h-0.5 mx-2 sm:mx-4 ${
                  step > s.num ? "bg-[#fd561e]" : "bg-gray-200"
                }`}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );

  // ── Single Auth Field ──
  const AuthField = ({ auth }) => {
    const { parameter_name, optional, regex, list_of_values, error_message } = auth;
    const isOptional = optional === "Y";
    const groupInfo = getGroupInfo(parameter_name);
    const isGroupField = !!groupInfo;

    return (
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1">
          {parameter_name}{" "}
          {!isOptional && !isGroupField && <span className="text-[#fd561e]">*</span>}
          {isGroupField && (
            <span className="ml-2 text-[10px] font-normal text-blue-500 border border-blue-300 bg-blue-50 px-2 py-0.5 rounded-full">
              Any {groupInfo.auth_input} required
            </span>
          )}
        </label>
        {list_of_values && Array.isArray(list_of_values) && list_of_values.length > 0 ? (
          <select
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#fd561e] focus:border-[#fd561e] outline-none bg-gray-50"
            required={!isOptional && !isGroupField}
            value={formData[parameter_name] || ""}
            onChange={(e) => handleInputChange(parameter_name, e.target.value)}
          >
            <option value="">Select {parameter_name}</option>
            {list_of_values.map((item, i) => (
              <option key={i} value={item.value || item}>
                {item.name || item.value || item}
              </option>
            ))}
          </select>
        ) : (
          <input
            type="text"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#fd561e] focus:border-[#fd561e] outline-none bg-gray-50"
            placeholder={`Enter ${parameter_name.toLowerCase()}`}
            required={!isOptional && !isGroupField}
            pattern={regex || undefined}
            title={error_message || undefined}
            value={formData[parameter_name] || ""}
            onChange={(e) => handleInputChange(parameter_name, e.target.value)}
          />
        )}
        {error_message && (
          <p className="text-[10px] text-gray-400 mt-0.5 flex items-center gap-1">
            <i className="fa-solid fa-circle-info text-[#fd561e]" /> {error_message}
          </p>
        )}
      </div>
    );
  };

  // ── Plan Selector ──
  const PlanSelector = () => (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 mb-4">
      <div className="flex items-center gap-3 mb-4 pb-3 border-b border-gray-100">
        <div className="w-7 h-7 rounded-full bg-[#fd561e] text-white flex items-center justify-center text-xs font-bold">
          P
        </div>
        <span className="text-xs font-bold uppercase text-gray-600">Select Recharge Plan</span>
      </div>
      {plansLoading ? (
        <div className="flex items-center gap-2 text-gray-400 text-sm">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#fd561e]" />
          Loading plans...
        </div>
      ) : plans.length === 0 ? (
        <p className="text-gray-400 text-sm">
          No plans available. You can enter the amount manually.
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-72 overflow-y-auto pr-1">
          {plans.map((plan, i) => (
            <button
              key={i}
              type="button"
              onClick={() => {
                setSelectedPlan(plan);
                const amt = plan.plan_amount || plan.amount || plan.price || "";
                if (amt) {
                  setBillAmount(parseFloat(amt).toFixed(2));
                  setTotalPayable(parseFloat(amt).toFixed(2));
                }
              }}
              className={`text-left p-3 rounded-xl border-2 transition-all duration-200 ${
                selectedPlan === plan
                  ? "border-[#fd561e] bg-orange-50"
                  : "border-gray-200 hover:border-orange-300"
              }`}
            >
              <p className="font-bold text-[#fd561e] text-sm">
                ₹{plan.plan_amount || plan.amount || plan.price}
              </p>
              <p className="text-xs text-gray-700 font-semibold mt-0.5">
                {plan.plan_name || plan.name || "Plan"}
              </p>
              {plan.validity && (
                <p className="text-[11px] text-gray-500 mt-0.5">Validity: {plan.validity}</p>
              )}
              {plan.description && (
                <p className="text-[10px] text-gray-400 mt-0.5">{plan.description}</p>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );

  // ── Payment Modal ──
  const PaymentModal = () => {
    const grandTotal = (parseFloat(totalPayable || 0) + convFeeInfo.total).toFixed(2);
    const availableMethods = (billData.allowed_payment_methods || []).map(
      (m) => m.payment_method
    );
    return (
      <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 px-0 sm:px-4">
        <div className="bg-white w-full sm:max-w-md rounded-t-3xl sm:rounded-2xl shadow-2xl overflow-hidden">
          <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                <i className="fa-solid fa-credit-card text-[#fd561e]" />
              </div>
              <h3 className="text-lg font-bold text-gray-800">Select Payment Method</h3>
            </div>
            <button onClick={() => setShowPayment(false)} className="text-gray-400 hover:text-gray-600">
              ✕
            </button>
          </div>
          <div className="px-6 py-4 space-y-3 max-h-[70vh] overflow-y-auto">
            {/* Removed amountMethodErr display from here - now shows as popup when clicking pay */}
            
            {Object.entries(METHOD_META)
              .filter(([id]) => availableMethods.includes(id))
              .map(([id, meta]) => {
                const methodCfg = (billData.allowed_payment_methods || []).find(
                  (m) => m.payment_method === id
                );
                // Removed min/max display from here
                const previewFee = calcConvFee(
                  billData.customer_conv_fee,
                  id,
                  methodToChannel(id),
                  totalPayable
                );
                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => {
                      setSelectedMethod(id);
                      setUpiId("");
                      setUpiError("");
                    }}
                    className={`w-full flex items-center justify-between px-4 py-4 rounded-xl border-2 transition-all duration-200 ${
                      selectedMethod === id
                        ? "border-[#fd561e] bg-orange-50"
                        : "border-gray-200 bg-white hover:border-orange-200"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-orange-50 flex items-center justify-center">
                        {meta.icon}
                      </div>
                      <div className="text-left">
                        <p className="font-semibold text-gray-800 text-sm">{meta.label}</p>
                        {previewFee.total > 0 && (
                          <p className="text-[10px] text-amber-600">
                            Conv fee: +₹{previewFee.total}
                          </p>
                        )}
                      </div>
                    </div>
                    <div
                      className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                        selectedMethod === id ? "border-[#fd561e]" : "border-gray-300"
                      }`}
                    >
                      {selectedMethod === id && (
                        <div className="w-2.5 h-2.5 rounded-full bg-[#fd561e]" />
                      )}
                    </div>
                  </button>
                );
              })}

            {/* UPI ID input */}
            {selectedMethod === "UPI" && (
              <div>
                <input
                  type="text"
                  className={`w-full px-4 py-3 border-2 rounded-xl outline-none text-sm ${
                    upiError
                      ? "border-red-400 bg-red-50"
                      : "border-orange-300 focus:border-[#fd561e]"
                  }`}
                  placeholder="Enter UPI ID (example@bank)"
                  value={upiId}
                  onChange={(e) => {
                    setUpiId(e.target.value);
                    setUpiError("");
                  }}
                />
                {upiError && <p className="text-red-500 text-xs mt-1">{upiError}</p>}
              </div>
            )}

            {/* Additional payment fields */}
            {(billData.additional_payment_details || []).length > 0 && selectedMethod && (
              <div className="space-y-2 mt-1">
                {billData.additional_payment_details.map((f, i) => (
                  <div key={i}>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">
                      {f.parameter_name}
                      {f.optional !== "Y" && <span className="text-[#fd561e] ml-1">*</span>}
                    </label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#fd561e] outline-none"
                      placeholder={f.error_message || `Enter ${f.parameter_name}`}
                      required={f.optional !== "Y"}
                      pattern={f.regex || undefined}
                      value={additionalPayFields[f.parameter_name] || ""}
                      onChange={(e) =>
                        setAdditionalPayFields((prev) => ({
                          ...prev,
                          [f.parameter_name]: e.target.value,
                        }))
                      }
                    />
                  </div>
                ))}
              </div>
            )}

            {/* Amount breakdown */}
            {selectedMethod && (
              <div className="bg-gray-50 rounded-xl p-4 border border-gray-200 mt-2">
                <div className="flex justify-between text-sm text-gray-600 mb-2">
                  <span>Bill Amount</span>
                  <span>₹{parseFloat(totalPayable || 0).toFixed(2)}</span>
                </div>
                {convFeeInfo.fee > 0 && (
                  <>
                    <div className="flex justify-between text-sm text-gray-600 mb-1">
                      <span>Convenience Fee</span>
                      <span>₹{convFeeInfo.fee.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm text-gray-600 mb-2 pb-2 border-b border-gray-200">
                      <span>GST on Conv Fee</span>
                      <span>₹{convFeeInfo.gst.toFixed(2)}</span>
                    </div>
                  </>
                )}
                {convFeeInfo.fee === 0 && (
                  <div className="flex justify-between text-sm text-gray-500 mb-2 pb-2 border-b border-gray-200">
                    <span>Convenience Fee</span>
                    <span className="text-green-600 font-semibold">FREE</span>
                  </div>
                )}
                <div className="flex justify-between font-bold text-gray-800">
                  <span>Total Payable</span>
                  <span className="text-[#fd561e] text-base">
                    ₹{parseFloat(grandTotal).toFixed(2)}
                  </span>
                </div>
              </div>
            )}
          </div>
          <div className="px-6 pb-6 pt-3 space-y-3">
            {selectedMethod && (
              <button
                onClick={handlePay}
                disabled={paymentLoading}
                className="w-full bg-[#fd561e] text-white py-4 rounded-2xl font-bold text-base shadow-lg hover:bg-[#e04010] active:scale-95 transition-all duration-200 disabled:opacity-60"
              >
                {paymentLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24" fill="none">
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="white"
                        strokeWidth="4"
                      />
                      <path className="opacity-75" fill="white" d="M4 12a8 8 0 018-8v8H4z" />
                    </svg>
                    Processing...
                  </span>
                ) : (
                  `Pay ₹${parseFloat(grandTotal).toFixed(2)}`
                )}
              </button>
            )}
            <button
              onClick={() => setShowPayment(false)}
              className="w-full bg-gray-100 text-gray-600 py-3 rounded-2xl font-semibold hover:bg-gray-200 transition-all duration-200"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    );
  };

  const amountConstraints = getAmountConstraints();

  // ─────────────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────────────
  return (
    <div className="bg-white">
      <Popup />
      {showPayment && <PaymentModal />}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-12">
        {/* Breadcrumb */}
        <div className="text-sm text-gray-500 mb-4 flex items-center gap-2">
          <a href="/BillHomePage" className="hover:text-[#fd561e]">
            Home
          </a>
          <span>›</span>
          <span>{billData.category || "Utility"}</span>
          <span>›</span>
          <span className="text-[#fd561e] font-semibold">{billData.biller}</span>
        </div>

        <StepBar />

        {/* Mobile biller card */}
        <div className="lg:hidden mb-5">
          <BillerInfoCard />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 items-start">
          {/* Desktop biller card */}
          <div className="hidden lg:block lg:col-span-1 sticky top-24 self-start">
            <BillerInfoCard />
          </div>

          <div className="lg:col-span-2">
            {/* ═══════════════════════════════════════════════════════
                STEP 1 — Account + Customer Details
            ═══════════════════════════════════════════════════════ */}
            {step === 1 && (
              <form onSubmit={handleFetchBill}>
                {/* Plan selector */}
                {billData.plan_available === "Y" && <PlanSelector />}

                {/* Account Identifier fields */}
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 mb-4">
                  <div className="flex items-center gap-3 mb-5 pb-3 border-b border-gray-100">
                    <div className="w-7 h-7 rounded-full bg-[#fd561e] text-white flex items-center justify-center text-xs font-bold">
                      1
                    </div>
                    <span className="text-xs font-bold uppercase text-gray-600">
                      Account Identifier
                    </span>
                  </div>

                  {safeParseJson(billData?.biller_authenticator_group) && (
                    <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-700">
                      <i className="fa-solid fa-circle-info mr-1" />
                      Fill at least one identifier from the grouped fields to proceed.
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {authenticators.map((auth, i) => (
                      <AuthField key={i} auth={auth} />
                    ))}
                  </div>
                </div>

                {/* ── Customer Details — Step 1 ── */}
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 mb-4">
                  <div className="flex items-center gap-3 mb-5 pb-3 border-b border-gray-100">
                    <div className="w-7 h-7 rounded-full bg-[#fd561e] text-white flex items-center justify-center text-xs font-bold">
                      2
                    </div>
                    <span className="text-xs font-bold uppercase text-gray-600">
                      Customer Details
                    </span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-semibold text-gray-700 mb-1">
                        Full Name <span className="text-[#fd561e]">*</span>
                      </label>
                      <input
                        type="text"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#fd561e] focus:border-[#fd561e] outline-none bg-gray-50"
                        required
                        pattern="[A-Za-z\s]{3,}"
                        title="Enter valid full name (minimum 3 letters)"
                        value={userDetails.name}
                        onChange={(e) =>
                          setUserDetails((p) => ({ ...p, name: e.target.value }))
                        }
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">
                        Mobile Number <span className="text-[#fd561e]">*</span>
                      </label>
                      <input
                        type="tel"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#fd561e] focus:border-[#fd561e] outline-none bg-gray-50"
                        required
                        maxLength="10"
                        pattern="[6-9]\d{9}"
                        title="10-digit mobile number"
                        value={userDetails.mobile}
                        onChange={(e) =>
                          setUserDetails((p) => ({ ...p, mobile: e.target.value }))
                        }
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">
                        Email Address <span className="text-[#fd561e]">*</span>
                      </label>
                      <input
                        type="email"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#fd561e] focus:border-[#fd561e] outline-none bg-gray-50"
                        required
                        value={userDetails.email}
                        onChange={(e) =>
                          setUserDetails((p) => ({ ...p, email: e.target.value }))
                        }
                      />
                      <p className="text-[10px] text-[#fd561e] mt-0.5 flex items-center gap-1">
                        <i className="fa-solid fa-circle-info" /> Receipt will be sent here
                      </p>
                    </div>
                  </div>
                  {billData.billerConsent && (
                    <div className="mt-4 p-3 bg-orange-50 border-l-4 border-[#fd561e] rounded-lg text-sm text-gray-700">
                      {billData.billerConsent}
                    </div>
                  )}
                  <div className="text-center mt-6">
                    <button
                      type="submit"
                      disabled={fetchingBill}
                      className="bg-[#fd561e] text-white px-8 py-3 rounded-xl font-semibold shadow-lg hover:scale-105 transition-all duration-300 disabled:opacity-50 cursor-pointer"
                    >
                      {fetchingBill
                        ? "Fetching..."
                        : billData.online_validation === "Y"
                        ? "Fetch Bill →"
                        : "Continue →"}
                    </button>
                  </div>
                </div>
              </form>
            )}

            {/* ═══════════════════════════════════════════════════════
                STEP 2 — Bill Summary + Review
            ═══════════════════════════════════════════════════════ */}
            {step === 2 && (
              <>
                {billSummary?.dueWarning && (
                  <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-2xl flex items-start gap-3">
                    <i className="fa-solid fa-triangle-exclamation text-red-500 mt-0.5" />
                    <div>
                      <p className="text-sm font-bold text-red-700">
                        Payment after due date not allowed
                      </p>
                      <p className="text-xs text-red-500 mt-0.5">
                        This biller does not accept payments after the due date. Please check
                        your due date before proceeding.
                      </p>
                    </div>
                  </div>
                )}

                {/* Bill Summary card */}
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 mb-4">
                  <div className="flex items-center gap-3 mb-5">
                    <div className="w-8 h-8 rounded-full bg-[#fd561e] text-white flex items-center justify-center text-sm font-bold">
                      1
                    </div>
                    <span className="text-sm font-bold uppercase text-gray-700 tracking-wide">
                      Bill Summary
                    </span>
                  </div>

                  {/* Entered Authenticator Values */}
                  {authenticators.filter((a) => formData[a.parameter_name]?.trim()).length > 0 && (
                    <div className="border border-gray-200 rounded-xl overflow-hidden mb-4">
                      <div className="bg-gray-50 px-5 py-3 border-b border-gray-200">
                        <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">
                          Account Details
                        </p>
                      </div>
                      {authenticators
                        .filter((a) => formData[a.parameter_name]?.trim())
                        .map((auth, i) => (
                          <div
                            key={i}
                            className="flex justify-between items-center px-5 py-3 border-b border-gray-100 last:border-b-0"
                          >
                            <span className="text-gray-500 text-sm">{auth.parameter_name}</span>
                            <span className="font-semibold text-gray-800 text-sm">
                              {formData[auth.parameter_name]}
                            </span>
                          </div>
                        ))}
                    </div>
                  )}

                  {/* API-returned bill info */}
                  {billSummary && (
                    <div className="border border-gray-200 rounded-xl overflow-hidden mb-4">
                      {billSummary.billNumber && billSummary.billNumber !== "N/A" && (
                        <div className="flex justify-between items-center px-5 py-4 border-b border-gray-100">
                          <span className="text-gray-500 text-sm">Bill Number</span>
                          <span className="font-semibold text-gray-800">
                            {billSummary.billNumber}
                          </span>
                        </div>
                      )}
                      {billAmount && (
                        <div className="flex justify-between items-center px-5 py-4 border-b border-gray-100">
                          <span className="text-gray-500 text-sm">Bill Amount</span>
                          <span className="font-bold text-[#fd561e] text-base">
                            ₹{parseFloat(billAmount).toFixed(2)}
                          </span>
                        </div>
                      )}
                      {billSummary.dueDate && billSummary.dueDate !== "N/A" && (
                        <div className="flex justify-between items-center px-5 py-4 border-b border-gray-100">
                          <span className="text-gray-500 text-sm">Due Date</span>
                          <span className="font-semibold text-gray-800">
                            {billSummary.dueDate}
                          </span>
                        </div>
                      )}
                      {billSummary.billPeriod && (
                        <div className="flex justify-between items-center px-5 py-4 border-b border-gray-100">
                          <span className="text-gray-500 text-sm">Bill Period</span>
                          <span className="font-semibold text-gray-800">
                            {billSummary.billPeriod}
                          </span>
                        </div>
                      )}
                      <div className="flex justify-between items-center px-5 py-4">
                        <span className="text-gray-500 text-sm">Status</span>
                        <span
                          className={`text-xs font-bold px-3 py-1 rounded-full ${
                            (billSummary.status || "").toUpperCase() === "UNPAID"
                              ? "bg-red-100 text-red-600"
                              : "bg-green-100 text-green-600"
                          }`}
                        >
                          {(billSummary.status || "UNPAID").toUpperCase()}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Amount entry / display */}
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center px-4 sm:px-5 py-4 bg-orange-50 rounded-xl border border-orange-100 gap-3">
                    <div>
                      <span className="font-bold text-gray-800 text-base block">
                        Total Amount
                      </span>
                      {billData.partial_pay === "Y" &&
                        billData.partial_pay_amount === "exact_down" &&
                        billAmount && (
                          <span className="text-[11px] text-amber-600">
                            You can pay less than ₹{billAmount}
                          </span>
                        )}
                      {billData.partial_pay === "Y" &&
                        billData.partial_pay_amount === "exact_up" &&
                        billAmount && (
                          <span className="text-[11px] text-amber-600">
                            You can pay ₹{billAmount} or more
                          </span>
                        )}
                      {billData.partial_pay !== "Y" &&
                        billData.bill_presentment === "Y" &&
                        billAmount && (
                          <span className="text-[11px] text-gray-500">Exact amount only</span>
                        )}
                      {billData.online_validation !== "Y" && !billAmount && (
                        <span className="text-[11px] text-amber-600">
                          Please enter the amount to pay
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 w-full sm:w-auto">
                      <span className="text-[#fd561e] font-bold text-lg">₹</span>
                      <input
                        type="number"
                        min={amountConstraints.min || 1}
                        step="0.01"
                        max={amountConstraints.max || undefined}
                        readOnly={amountConstraints.readOnly && billData.partial_pay !== "Y"}
                        className={`border border-orange-300 rounded-lg px-3 py-2 text-base font-bold w-full sm:w-36 focus:ring-2 focus:ring-[#fd561e] outline-none bg-white text-[#fd561e] text-right ${
                          amountConstraints.readOnly && billData.partial_pay !== "Y"
                            ? "cursor-not-allowed bg-gray-50"
                            : ""
                        }`}
                        placeholder="Enter amount"
                        value={totalPayable}
                        onChange={(e) => setTotalPayable(e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                {/* ── Customer Details review card — Step 2 ── */}
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 mb-4">
                  <div className="flex items-center justify-between gap-3 mb-5">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-[#fd561e] text-white flex items-center justify-center text-sm font-bold">
                        2
                      </div>
                      <span className="text-sm font-bold uppercase text-gray-700 tracking-wide">
                        Customer Details
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsEditingUser(!isEditingUser)}
                      className="text-xs text-[#fd561e] font-semibold hover:underline"
                    >
                      {isEditingUser ? "Save" : "Edit"}
                    </button>
                  </div>

                  {isEditingUser ? (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="sm:col-span-3">
                        <label className="block text-xs text-gray-500 uppercase font-semibold mb-1">
                          Full Name
                        </label>
                        <input
                          type="text"
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#fd561e] focus:border-[#fd561e] outline-none bg-gray-50 text-sm"
                          value={userDetails.name}
                          onChange={(e) =>
                            setUserDetails((p) => ({ ...p, name: e.target.value }))
                          }
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500 uppercase font-semibold mb-1">
                          Mobile
                        </label>
                        <input
                          type="tel"
                          maxLength="10"
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#fd561e] focus:border-[#fd561e] outline-none bg-gray-50 text-sm"
                          value={userDetails.mobile}
                          onChange={(e) =>
                            setUserDetails((p) => ({ ...p, mobile: e.target.value }))
                          }
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <label className="block text-xs text-gray-500 uppercase font-semibold mb-1">
                          Email
                        </label>
                        <input
                          type="email"
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#fd561e] focus:border-[#fd561e] outline-none bg-gray-50 text-sm"
                          value={userDetails.email}
                          onChange={(e) =>
                            setUserDetails((p) => ({ ...p, email: e.target.value }))
                          }
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="flex sm:block items-center justify-between border-b sm:border-b-0 border-gray-100 pb-3 sm:pb-0">
                        <p className="text-xs text-gray-500 uppercase font-semibold">Name</p>
                        <p className="font-bold text-gray-800 text-sm sm:text-base mt-0 sm:mt-1">
                          {userDetails.name || "—"}
                        </p>
                      </div>
                      <div className="flex sm:block items-center justify-between border-b sm:border-b-0 border-gray-100 pb-3 sm:pb-0">
                        <p className="text-xs text-gray-500 uppercase font-semibold">Mobile</p>
                        <p className="font-bold text-gray-800 text-sm sm:text-base mt-0 sm:mt-1">
                          {userDetails.mobile || "—"}
                        </p>
                      </div>
                      <div className="flex sm:block items-center justify-between">
                        <p className="text-xs text-gray-500 uppercase font-semibold">Email</p>
                        <p className="font-bold text-gray-800 text-sm break-all mt-0 sm:mt-1">
                          {userDetails.email || "—"}
                        </p>
                      </div>
                    </div>
                  )}

                  <div className="flex justify-between mt-6 gap-3">
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      className="px-5 py-2 cursor-pointer rounded-xl border border-gray-300 text-gray-600 text-sm font-semibold hover:bg-gray-50 transition-all"
                    >
                      ← Edit Details
                    </button>
                    <button
                      type="button"
                      onClick={handleProceedToPayment}
                      className="bg-[#fd561e] text-white px-8 py-3 rounded-xl font-semibold shadow-lg hover:scale-105 transition-all duration-300 cursor-pointer inline-flex items-center gap-2"
                    >
                      Proceed to Payment →
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BillDetails;