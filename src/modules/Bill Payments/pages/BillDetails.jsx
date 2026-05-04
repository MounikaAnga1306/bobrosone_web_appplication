import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const safeParseJson = (raw) => {
  if (!raw || raw === "nan") return null;
  try {
    if (typeof raw === "object") return raw;
    return JSON.parse(raw.replace(/'/g, '"'));
  } catch { return null; }
};

const calcConvFee = (convFeeConfig, paymentMethod, paymentChannel, amount) => {
  if (!convFeeConfig || !Array.isArray(convFeeConfig)) return { fee: 0, gst: 0, total: 0 };
  const amt = parseFloat(amount) || 0;
  const slab =
    convFeeConfig.find((s) => {
      const methodMatch  = s.payment_method?.toLowerCase() === paymentMethod?.toLowerCase();
      const channelMatch = !s.payment_channel || s.payment_channel?.toLowerCase().includes(paymentChannel?.toLowerCase());
      const slabStart    = parseFloat(s.amount_slab_start) || 0;
      const slabEnd      = parseFloat(s.amount_slab_end)   || Infinity;
      return methodMatch && channelMatch && amt >= slabStart && amt <= slabEnd;
    }) ||
    convFeeConfig.find((s) => s.payment_method?.toLowerCase() === paymentMethod?.toLowerCase());
  if (!slab) return { fee: 0, gst: 0, total: 0 };
  let fee = 0;
  const baseConvFee = parseFloat(slab.bou_conv_fee) || 0;
  if (slab.bou_conv_fee_type === "fixed")           fee = baseConvFee;
  else if (slab.bou_conv_fee_type === "percentage") fee = (amt * baseConvFee) / 100;
  fee = Math.min(Math.max(fee, parseFloat(slab.min_bou_conv_fee) || 0), parseFloat(slab.max_bou_conv_fee) || fee);
  let gst = 0;
  const baseGst = parseFloat(slab.bou_conv_fee_gst) || 0;
  if (slab.bou_conv_fee_gst_type === "percentage") gst = (fee * baseGst) / 100;
  else if (slab.bou_conv_fee_gst_type === "fixed")  gst = baseGst;
  return {
    fee:   parseFloat(fee.toFixed(2)),
    gst:   parseFloat(gst.toFixed(2)),
    total: parseFloat((fee + gst).toFixed(2)),
  };
};

const methodToChannel = (method) => {
  if (method === "BankAccount") return "InternetBanking";
  if (method === "UPI")         return "MobileBanking";
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
  if (amt > max) return { valid: false, msg: `Maximum amount for ${method} is ₹${max.toLocaleString("en-IN")}` };
  return { valid: true };
};

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
  BankAccount: { label: "Net Banking",  icon: <IconBank /> },
  CreditCard:  { label: "Credit Card",  icon: <IconCard /> },
  DebitCard:   { label: "Debit Card",   icon: <IconCard /> },
  UPI:         { label: "UPI",          icon: <IconUPI /> },
};

const RECHARGE_PLAN_API = "/bill/retrieve-recharge-plan";

const isMobilePrepaid = (bd) =>
  bd?.plan_available === "Y" ||
  bd?.category1?.toLowerCase().includes("mobile prepaid") ||
  bd?.category?.toLowerCase().includes("mobile prepaid");

const shouldSkipValidation = (bd) => isMobilePrepaid(bd);

const parseRechargePlanResponse = (data) => {
  try {
    if (Array.isArray(data))        return data;
    if (Array.isArray(data?.data))  return data.data;
    if (Array.isArray(data?.plans)) return data.plans;
    if (Array.isArray(data?.rows))  return data.rows;
    if (typeof data?.response === "string") {
      try {
        const inner = JSON.parse(data.response);
        if (Array.isArray(inner))        return inner;
        if (Array.isArray(inner?.data))  return inner.data;
        if (Array.isArray(inner?.plans)) return inner.plans;
      } catch { /* skip */ }
    }
    if (Array.isArray(data?.response)) return data.response;
    if (data && typeof data === "object") {
      for (const key of Object.keys(data)) {
        if (Array.isArray(data[key]) && data[key].length > 0) return data[key];
      }
    }
    return [];
  } catch { return []; }
};

const extractDataFromDesc = (description = "") => {
  if (!description) return "";
  const gbDay = description.match(/(\d+(?:\.\d+)?)\s*gb\s*\/\s*day/i);
  if (gbDay) return `${gbDay[1]} GB/day`;
  const gb = description.match(/(\d+(?:\.\d+)?)\s*gb/i);
  if (gb) return `${gb[1]} GB`;
  if (/unlimited\s+.*data/i.test(description)) return "Unlimited";
  const mb = description.match(/(\d+)\s*mb/i);
  if (mb) return `${mb[1]} MB`;
  return "";
};

// ─────────────────────────────────────────────────────────────
// AuthField — component బయట define చేయడం వల్ల parent re-render
// అయినా ఇది re-create అవ్వదు → input focus పోదు
// ─────────────────────────────────────────────────────────────
const AuthField = ({ auth, formData, onInputChange, getGroupInfo }) => {
  const { parameter_name, optional, regex, list_of_values, error_message } = auth;
  const isOptional   = optional === "Y";
  const groupInfo    = getGroupInfo(parameter_name);
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
          onChange={(e) => onInputChange(parameter_name, e.target.value)}>
          <option value="">Select {parameter_name}</option>
          {list_of_values.map((item, i) => (
            <option key={i} value={item.value || item}>{item.name || item.value || item}</option>
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
          onChange={(e) => onInputChange(parameter_name, e.target.value)}
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

// ─────────────────────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────────────────────
const BillDetails = () => {
  const navigate = useNavigate();

  const [billData,        setBillData]        = useState(null);
  const billDataRef                           = useRef(null);
  const [authenticators,  setAuthenticators]  = useState([]);
  const [formData,        setFormData]        = useState({});
  const [userDetails,     setUserDetails]     = useState({ name: "", mobile: "", email: "", uid: "" });
  const [isEditingUser,   setIsEditingUser]   = useState(false);

  const [step,            setStep]            = useState(1);
  const [fetchingBill,    setFetchingBill]    = useState(false);
  const [validationError, setValidationError] = useState(false);
  const [validationMsg,   setValidationMsg]   = useState("");

  const [billAmount,    setBillAmount]    = useState("");
  const [totalPayable,  setTotalPayable]  = useState("");
  const [billSummary,   setBillSummary]   = useState(null);
  const [additionalInfo, setAdditionalInfo] = useState([]);  // validation additional_info

  const [billList,     setBillList]     = useState([]);
  const [selectedBill, setSelectedBill] = useState(null);

  const [payMultipleBills,  setPayMultipleBills]  = useState("N");
  const [selectedBillIds,   setSelectedBillIds]   = useState([]);
  const [billPayAmounts,    setBillPayAmounts]     = useState({});
  const [expandedBillId,    setExpandedBillId]     = useState(null);

  const [plans,              setPlans]              = useState([]);
  const [plansLoading,       setPlansLoading]       = useState(false);
  const [plansError,         setPlansError]         = useState("");
  const [selectedPlan,       setSelectedPlan]       = useState(null);
  const [activePlanCategory, setActivePlanCategory] = useState("All");
  const [planSearchQuery,    setPlanSearchQuery]    = useState("");
  const [planRequiredError,  setPlanRequiredError]  = useState(false);

  const [showPayment,        setShowPayment]        = useState(false);
  const [selectedMethod,     setSelectedMethod]     = useState("");
  const [upiId,              setUpiId]              = useState("");
  const [upiError,           setUpiError]           = useState("");
  const upiRef                                      = useRef(null);
  const [convFeeInfo,        setConvFeeInfo]        = useState({ fee: 0, gst: 0, total: 0 });
  const [paymentLoading,     setPaymentLoading]     = useState(false);
  const [amountMethodErr,    setAmountMethodErr]    = useState("");
  const [additionalPayFields,setAdditionalPayFields]= useState({});

  const [showPopup,    setShowPopup]    = useState(false);
  const [popupMessage, setPopupMessage] = useState("");

  // ── Load billData ──
  useEffect(() => {
    const raw = localStorage.getItem("billData");
    if (!raw) { navigate("/BillHomePage"); return; }
    const data = JSON.parse(raw);
    setBillData(data);
    billDataRef.current = data;
    const pmb = (data.pay_multiple_bills || "N").toUpperCase();
    setPayMultipleBills(pmb);

    let auths = data.authenticators || [];
    if (typeof auths === "string") {
      try { auths = JSON.parse(auths.replace(/'/g, '"')); } catch { auths = []; }
    }
    auths = auths.filter((a) => a && typeof a === "object" && a.parameter_name);
    setAuthenticators(auths);
    const init = {};
    auths.forEach((f) => { init[f.parameter_name] = ""; });
    setFormData(init);

    const authUser = (() => {
      try {
        for (const k of ["user", "authUser", "userInfo"]) {
          const u = localStorage.getItem(k);
          if (u) { const p = JSON.parse(u); return p?.data || p; }
        }
        if (data.loggedInUser) return data.loggedInUser?.data || data.loggedInUser;
      } catch { return null; }
      return null;
    })();

    const getString = (...c) => {
      for (const v of c) {
        if (v && typeof v === "string" && v.trim()) return v.trim();
        if (v && typeof v === "number") return String(v);
      }
      return "";
    };

    if (authUser) {
      setUserDetails({
        name:   getString(authUser.name, authUser.uname, authUser.full_name,
                  typeof authUser.user === "string" ? authUser.user : null),
        mobile: getString(authUser.mobile, authUser.umob),
        email:  getString(authUser.email,  authUser.umail),
        uid:    getString(authUser.uid, authUser.id, authUser.user_id, authUser.userId),
      });
    }
  }, [navigate]);

  useEffect(() => {
    document.body.style.overflow = showPayment ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [showPayment]);

  useEffect(() => {
    if (!selectedMethod || !billData) return;
    const channel = methodToChannel(selectedMethod);
    const info = calcConvFee(billData.customer_conv_fee, selectedMethod, channel, totalPayable);
    setConvFeeInfo(info);
    const v = validateAmountForMethod(billData.allowed_payment_methods, selectedMethod, totalPayable);
    setAmountMethodErr(v.valid ? "" : v.msg);
  }, [selectedMethod, totalPayable, billData]);

  const handleInputChange = (paramName, value) =>
    setFormData((prev) => ({ ...prev, [paramName]: value }));

  const getGroupInfo = useCallback((paramName) => {
    const groups = safeParseJson(billData?.biller_authenticator_group);
    if (!groups) return null;
    return groups.find((g) => g.auth_parameters?.includes(paramName)) || null;
  }, [billData]);

  const fetchRechargePlans = async (subscriberId, bd) => {
    if (!isMobilePrepaid(bd)) return;
    if (!subscriberId?.trim()) { setPlansError("Subscriber ID is missing."); return; }
    setPlansLoading(true); setPlansError(""); setPlans([]); setSelectedPlan(null);
    setActivePlanCategory("All"); setPlanSearchQuery(""); setPlanRequiredError(false);
    try {
      const res = await axios.post(RECHARGE_PLAN_API,
        { billerid: bd.billerid, subscriber_id: subscriberId.trim() },
        { headers: { "Content-Type": "application/json" }, timeout: 30000 }
      );
      let rows = parseRechargePlanResponse(res.data);
      rows = rows.filter((r) => r && r.planStatus !== "ERROR" && r.planStatus !== "EXCEPTION" && r.plan_status !== "ERROR");
      setPlans(rows);
      if (rows.length === 0) setPlansError("No plans found. You can enter the amount manually.");
    } catch { setPlansError("Could not load plans. You can enter the amount manually."); }
    finally { setPlansLoading(false); }
  };

  const computeMultiTotal = (ids, amounts) => {
    let sum = 0;
    ids.forEach((id) => { sum += parseFloat(amounts[id] || 0); });
    return sum.toFixed(2);
  };

  const applyBillData = (bdResp, validationId, bd) => {
    const amount = bdResp.billamount || bdResp.net_billamount || bdResp.bill_amount ||
                   bdResp.amount || bdResp.totalAmount || bdResp.dueAmount || "";
    const parsedAmt = parseFloat(amount) || 0;
    setBillAmount(parsedAmt.toFixed(2));
    setTotalPayable(parsedAmt.toFixed(2));
    setBillSummary({
      billNumber:   bdResp.billnumber || bdResp.bill_number || bdResp.billNumber || "N/A",
      billId:       bdResp.billid || "",
      dueDate:      bdResp.billduedate || bdResp.due_date || bdResp.dueDate || "N/A",
      billPeriod:   bdResp.billperiod || bdResp.billPeriod || null,
      status:       bdResp.billstatus || bdResp.status || bdResp.bill_status || "Pending",
      customerName: bdResp.customer_name || "",
      minPay:       bdResp.min_pay_amount || "",
      maxPay:       bdResp.max_pay_amount || "",
      validationId,
      editable:     bd.bill_presentment !== "Y" || bd.partial_pay === "Y",
      dueWarning:   bd.pay_after_duedate === "N",
    });
    setSelectedBill(bdResp);
  };

  const handleFetchBill = async (e) => {
    e.preventDefault();
    if (!e.target.checkValidity()) { e.target.reportValidity(); return; }
    const bd           = billDataRef.current;
    const subscriberId = formData[authenticators[0]?.parameter_name]?.trim() || "";
    const groups       = safeParseJson(bd?.biller_authenticator_group);
    if (groups) {
      for (const grp of groups) {
        const required = parseInt(grp.auth_input) || 1;
        const filled   = (grp.auth_parameters || []).filter((p) => formData[p]?.trim()).length;
        if (filled < required) { alert(`Please fill at least ${required} field(s) from: ${grp.auth_parameters.join(", ")}`); return; }
      }
    } else {
      for (const auth of authenticators) {
        if (auth.optional !== "Y" && !formData[auth.parameter_name]?.trim()) { alert(`Please fill ${auth.parameter_name}`); return; }
      }
    }
    if (shouldSkipValidation(bd)) {
      setBillAmount(""); setTotalPayable(""); setBillSummary(null);
      setBillList([]); setSelectedBill(null);
      setSelectedBillIds([]); setBillPayAmounts({});
      setStep(2); await fetchRechargePlans(subscriberId, bd); return;
    }
    if (bd?.online_validation !== "Y") {
      setBillAmount(""); setTotalPayable(""); setBillSummary(null);
      setBillList([]); setSelectedBill(null);
      setSelectedBillIds([]); setBillPayAmounts({});
      setStep(2); return;
    }
    setFetchingBill(true); setValidationError(false); setValidationMsg(""); setAdditionalInfo([]);
    try {
      const authenticatorValues = {};
      for (const auth of authenticators) {
        const val = formData[auth.parameter_name];
        if (val?.trim()) authenticatorValues[auth.parameter_name] = val.trim();
      }
      const res = await axios.post("/bill/validate-payment", {
        billerid: bd.billerid,
        customerDetails: { name: userDetails.name, mobile: userDetails.mobile, email: userDetails.email },
        authenticatorValues,
      });
      if (res.data?.success) {
        const raw          = res.data.data || res.data;
        const nested       = raw.data || raw;
        const validationId = nested.validationid || nested.validationId || "";
        const bills        = nested.billlist || [];
        const pmb          = (bd.pay_multiple_bills || "N").toUpperCase();

        // additional_info check — NCMC/PAYEE type billers billlist ఇవ్వరు, additional_info ఇస్తారు
        const additionalInfoArr = nested.additional_info || [];
        setAdditionalInfo(additionalInfoArr);

        if (bills.length === 0) {
          if (additionalInfoArr.length > 0) {
            // additional_info ఉంది — billlist లేకపోయినా ok, step 2 కి వెళ్ళు
            setBillSummary({ validationId });
            setBillList([]);
            setSelectedBillIds([]);

            // Min/Max amounts additional_info నుండి తీసుకో
            const getInfo = (name) =>
              additionalInfoArr.find((x) => x.parameter_name === name)?.value || "";
            const minAmt = parseFloat(getInfo("Minimum Permissible Recharge Amount")) || 0;
            const maxAmt = parseFloat(getInfo("Maximum Permissible Recharge Amount")) || 0;
            if (minAmt > 0) setTotalPayable(minAmt.toFixed(2));
            else setTotalPayable("");
            setBillAmount("");
            setPayMultipleBills(pmb);
            setStep(2);
            return;
          }
          setValidationError(true);
          setValidationMsg("Bill amount not found. Please try again.");
          return;
        }

        const taggedBills = bills.map((b, i) => ({
          ...b,
          _stableId: b.billid || b.billnumber || `bill_${i}`,
        }));

        setBillList(taggedBills);

        const amounts = {};
        taggedBills.forEach((b) => {
          const amt = parseFloat(b.billamount || b.net_billamount || b.bill_amount || b.amount || 0);
          amounts[b._stableId] = isNaN(amt) ? "0.00" : amt.toFixed(2);
        });
        setBillPayAmounts(amounts);
        setBillSummary({ validationId });
        setBillAmount("");

        if (pmb === "M") {
          const allIds = taggedBills.map((b) => b._stableId);
          setSelectedBillIds(allIds);
          const total = taggedBills.reduce((sum, b) => sum + parseFloat(amounts[b._stableId] || 0), 0);
          setTotalPayable(total.toFixed(2));
        } else {
          setSelectedBillIds([]);
          setTotalPayable("0.00");
        }
        setPayMultipleBills(pmb);

        if (bills.length === 1 && pmb === "N") {
          applyBillData(taggedBills[0], validationId, bd);
        }

        setStep(2);
      } else {
        const errData  = res.data?.error || res.data?.data?.error || {};
        const errorMsg = (typeof errData === "object" ? errData.message || errData.errorDesc : errData) ||
                         res.data?.message || "Unable to validate. Please check your details.";
        setValidationError(true);
        setValidationMsg(typeof errorMsg === "string" ? errorMsg : JSON.stringify(errorMsg));
      }
    } catch (err) {
      const errResponse = err.response?.data;
      const upstreamErr = errResponse?.upstreamError;
      const upstreamMsg = upstreamErr?.message || upstreamErr?.errorDesc || upstreamErr?.error ||
                          (typeof upstreamErr === "string" ? upstreamErr : null);
      const errorMsg = upstreamMsg || errResponse?.error?.message || errResponse?.error?.errorDesc ||
                       (typeof errResponse?.error === "string" ? errResponse.error : null) ||
                       errResponse?.message || "Unable to validate your bill. Please try again later.";
      setValidationError(true);
      setValidationMsg(typeof errorMsg === "string" ? errorMsg : JSON.stringify(errorMsg));
    } finally { setFetchingBill(false); }
  };

  // ══════════════════════════════════════════════════
  // NEW HELPER: Expanded bill ki min amount validate cheyyadam
  // ══════════════════════════════════════════════════
  const validateExpandedBillAmount = (currentAmounts, currentExpandedId, allBills) => {
    if (!currentExpandedId) return true; // expand అవ్వలేదు — ok
    const bill = allBills.find((b) => b._stableId === currentExpandedId);
    if (!bill) return true;
    const minPay = parseFloat(bill.min_pay_amount || 0);
    if (minPay <= 0) return true; // min లేదు — ok
    const enteredAmt = parseFloat(currentAmounts[currentExpandedId] || 0);
    if (enteredAmt < minPay) {
      setPopupMessage(
        `Minimum payment amount for bill "${bill.billnumber || currentExpandedId}" is ₹${minPay.toFixed(2)}. Please enter a valid amount.`
      );
      setShowPopup(true);
      return false;
    }
    return true;
  };

  // ── MODIFIED: toggleBillSelection — switch చేసే ముందు validate ──
  const toggleBillSelection = (stableId, currentAmounts, currentExpandedId, allBills) => {
    // expand అయిన bill validate చేయి (తాను కాని వేరే bill click చేసినప్పుడు)
    if (currentExpandedId && currentExpandedId !== stableId) {
      if (!validateExpandedBillAmount(currentAmounts, currentExpandedId, allBills)) return;
    }
    setSelectedBillIds((prev) => {
      const next = prev.includes(stableId)
        ? prev.filter((id) => id !== stableId)
        : [...prev, stableId];
      setTotalPayable(computeMultiTotal(next, currentAmounts));
      return next;
    });
  };

  const updateBillPayAmount = (stableId, value) => {
    setBillPayAmounts((prev) => {
      const next = { ...prev, [stableId]: value };
      setTotalPayable(computeMultiTotal(selectedBillIds, next));
      return next;
    });
  };

  // ── isMultiMode: always read from ref, never stale state ──
  const isMultiMode = (billDataRef.current?.pay_multiple_bills || "N").toUpperCase() === "Y"
                   || (billDataRef.current?.pay_multiple_bills || "N").toUpperCase() === "M";

  const handleProceedToPayment = () => {
    const bd          = billDataRef.current;
    const prepaid     = isMobilePrepaid(bd);
    const plansLoaded = plans.length > 0 && !plansError;

    if (isMultiMode) {
      if (selectedBillIds.length === 0) {
        setPopupMessage("Please select at least one bill to proceed.");
        setShowPopup(true); return;
      }
    } else {
      if (billList.length > 1 && !selectedBill) {
        setPopupMessage("Please select a bill to proceed."); setShowPopup(true); return;
      }
    }

    if (prepaid && plansLoaded && !selectedPlan) {
      setPlanRequiredError(true);
      document.getElementById("plan-selector-section")?.scrollIntoView({ behavior: "smooth", block: "start" });
      return;
    }
    if (!totalPayable || parseFloat(totalPayable) <= 0) {
      setPopupMessage("Please enter a valid amount."); setShowPopup(true); return;
    }

    // additional_info mode (NCMC/PAYEE) — min/max validate చేయి
    if (additionalInfo.length > 0 && billList.length === 0) {
      const getInfo = (name) => additionalInfo.find((x) => x.parameter_name === name)?.value || "";
      const minAmt = parseFloat(getInfo("Minimum Permissible Recharge Amount")) || 0;
      const maxAmt = parseFloat(getInfo("Maximum Permissible Recharge Amount")) || 0;
      const entered = parseFloat(totalPayable) || 0;
      if (minAmt > 0 && entered < minAmt) {
        setPopupMessage(`Minimum recharge amount is ₹${minAmt}. Please enter a valid amount.`);
        setShowPopup(true); return;
      }
      if (maxAmt > 0 && entered > maxAmt) {
        setPopupMessage(`Maximum recharge amount is ₹${maxAmt}. Please enter a valid amount.`);
        setShowPopup(true); return;
      }
    }

    // ── Proceed చేసే ముందు కూడా అన్ని selected bills validate చేయి ──
    for (const sid of selectedBillIds) {
      const bill = billList.find((b) => b._stableId === sid);
      if (!bill) continue;
      const minPay = parseFloat(bill.min_pay_amount || 0);
      if (minPay > 0) {
        const enteredAmt = parseFloat(billPayAmounts[sid] || 0);
        if (enteredAmt < minPay) {
          setPopupMessage(
            `Minimum payment amount for bill "${bill.billnumber || sid}" is ₹${minPay.toFixed(2)}. Please enter a valid amount before proceeding.`
          );
          setShowPopup(true);
          return;
        }
      }
    }

    setPlanRequiredError(false);
    setSelectedMethod(""); setUpiId(""); setUpiError(""); setAmountMethodErr("");
    setConvFeeInfo({ fee: 0, gst: 0, total: 0 });
    const apf = {};
    (bd?.additional_payment_details || []).forEach((f) => { apf[f.parameter_name] = ""; });
    setAdditionalPayFields(apf);
    setShowPayment(true);
  };

  const buildBilllistPayload = () => {
    if (isMultiMode && billList.length > 0) {
      return billList
        .filter((b) => selectedBillIds.includes(b._stableId))
        .map((b) => ({
          billid:         b.billid || b._stableId,
          billnumber:     b.billnumber || "",
          billamount:     parseFloat(billPayAmounts[b._stableId] || 0).toFixed(2),
          billduedate:    b.billduedate || "",
          billperiod:     b.billperiod || "",
          billstatus:     b.billstatus || "",
          customer_name:  b.customer_name || "",
          min_pay_amount: b.min_pay_amount || "",
          max_pay_amount: b.max_pay_amount || "",
        }));
    }
    if (selectedBill || (billList.length === 1)) {
      const b = selectedBill || billList[0];
      return [{
        billid:         b?.billid || "",
        billnumber:     b?.billnumber || billSummary?.billNumber || "",
        billamount:     parseFloat(totalPayable || 0).toFixed(2),
        billduedate:    b?.billduedate || billSummary?.dueDate || "",
        billperiod:     b?.billperiod || billSummary?.billPeriod || "",
        billstatus:     b?.billstatus || billSummary?.status || "",
        customer_name:  b?.customer_name || billSummary?.customerName || "",
        min_pay_amount: b?.min_pay_amount || billSummary?.minPay || "",
        max_pay_amount: b?.max_pay_amount || billSummary?.maxPay || "",
      }];
    }
    return [];
  };

  const handlePay = async () => {
    if (!selectedMethod) return;
    if (amountMethodErr) { setPopupMessage(amountMethodErr); setShowPopup(true); return; }
    if (selectedMethod === "UPI") {
      const upiValue = upiRef.current?.value?.trim() || "";
      if (!upiValue) { setUpiError("Please enter your UPI ID"); return; }
      if (!/^[a-zA-Z0-9._-]+@[a-zA-Z0-9]+$/.test(upiValue)) {
        setUpiError("Please enter a valid UPI ID (eg. name@bank)"); return;
      }
      setUpiId(upiValue);
    }
    const bd = billDataRef.current;
    for (const f of bd?.additional_payment_details || []) {
      if (f.optional !== "Y" && !additionalPayFields[f.parameter_name]?.trim()) {
        alert(`Please fill: ${f.parameter_name}`); return;
      }
    }
    setPaymentLoading(true);
    try {
      const grandTotal          = (parseFloat(totalPayable) + convFeeInfo.total).toFixed(2);
      const API_BASE            = import.meta.env.VITE_API_BASE_URL || "";
      const billNum             = billSummary?.billNumber && billSummary.billNumber !== "N/A" ? billSummary.billNumber : bd.billerid;
      const tickid              = `BILL_${billNum}_${Date.now()}`;
      const validationId        = billSummary?.validationId || "";
      const subscriberParamName = authenticators[0]?.parameter_name || "";
      const billlistPayload     = buildBilllistPayload();

      sessionStorage.setItem("billPaymentCtx", JSON.stringify({
        formData, userDetails, totalPayable, convFeeInfo, selectedPlan,
        billerid: bd.billerid, billerName: bd.biller, billSummary, grandTotal,
        method: selectedMethod, validationId, subscriberParamName,
        upiId: selectedMethod === "UPI" ? (upiRef.current?.value?.trim() || "") : "",
        authenticators: [{ parameter_name: subscriberParamName || "Mobile Number", value: formData[subscriberParamName] || "" }],
        billlist: billlistPayload,
        isMultiBill: isMultiMode && selectedBillIds.length > 1,
      }));

      const payload = {
        fare: Number(grandTotal), uid: userDetails.mobile, pname: userDetails.name,
        email: userDetails.email, tickid, billerid: bd.billerid, validationId,
        paymentMethod: selectedMethod,
        upiId: selectedMethod === "UPI" ? (upiRef.current?.value?.trim() || upiId) : "",
        authenticators: [{ parameter_name: subscriberParamName || "Mobile Number", value: formData[subscriberParamName] || "" }],
        billerName: bd.biller, isBbps: true,
        billlist: billlistPayload,
      };

      const res = await fetch(`${API_BASE}bbps/billdesk/order`, {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const errText = await res.text();
        console.error("BillDesk order failed:", res.status, errText);
        alert(`Payment initiation failed (${res.status}). Please try again.`);
        setPaymentLoading(false); return;
      }
      const data = await res.json();
      if (data.success && data.checkoutUrl) { window.location.href = data.checkoutUrl; }
      else { alert(data?.message || "Payment initiation failed. Please try again."); setPaymentLoading(false); }
    } catch (err) {
      console.error("Payment error:", err);
      alert("Error processing payment. Please try again.");
      setPaymentLoading(false);
    }
  };

  const getAmountConstraints = () => {
    const bd = billDataRef.current;
    if (!bd || !billAmount) return {};
    const bill = parseFloat(billAmount);
    if (bd.partial_pay !== "Y") return { readOnly: bd.bill_presentment === "Y", value: billAmount };
    if (bd.partial_pay_amount === "exact_up")   return { min: bill };
    if (bd.partial_pay_amount === "exact_down") return { min: 1, max: bill };
    return {};
  };

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

  if (validationError) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-12 text-center max-w-md w-full">
          <div className="flex justify-center mb-5">
            <svg viewBox="0 0 64 64" className="w-16 h-16">
              <polygon points="32,4 60,56 4,56" fill="#FCD34D" stroke="#F59E0B" strokeWidth="2" strokeLinejoin="round" />
              <text x="32" y="48" textAnchor="middle" fontSize="30" fontWeight="bold" fill="#92400E">!</text>
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-[#fd561e] mb-3">Validation Failed</h2>
          <p className="text-gray-500 text-sm mb-8 leading-relaxed">{validationMsg}</p>
          <button onClick={() => { setValidationError(false); setValidationMsg(""); }}
            className="bg-[#fd561e] text-white cursor-pointer px-8 py-3 rounded-xl font-semibold hover:bg-[#e04010] transition-all duration-200 inline-flex items-center gap-2">
            <span>←</span> Go Back
          </button>
        </div>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────
  // SUB-COMPONENTS
  // ─────────────────────────────────────────────────────────────
  const Popup = () => {
    if (!showPopup) return null;
    return (
      <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 px-4">
        <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full">
          <div className="p-6 text-center">
            <div className="w-14 h-14 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
              <svg className="w-7 h-7 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-gray-800 mb-2">Notice</h3>
            <p className="text-gray-600 text-sm mb-6">{popupMessage}</p>
            <button onClick={() => setShowPopup(false)}
              className="w-full bg-[#fd561e] text-white py-3 rounded-xl cursor-pointer font-semibold hover:bg-[#e04010] transition-all">OK</button>
          </div>
        </div>
      </div>
    );
  };

  const BillerInfoCard = () => {
    const paymentModes = (billData?.allowed_payment_methods || [])
      .map((m) => {
        if (m.payment_method === "UPI")         return "UPI";
        if (m.payment_method === "CreditCard")  return "Card";
        if (m.payment_method === "DebitCard")   return "Card";
        if (m.payment_method === "BankAccount") return "Net Banking";
        return m.payment_method;
      })
      .filter((v, i, a) => a.indexOf(v) === i);

    const now = new Date().toLocaleString("en-IN", {
      day: "2-digit", month: "2-digit", year: "numeric",
      hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false,
    }).replace(",", "");

    if (step === 1) {
      return (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden h-full">
          <div className="p-5 text-center border-b border-gray-100">
            <div className="w-16 h-16 rounded-2xl bg-orange-50 border border-orange-200 flex items-center justify-center mx-auto mb-3">
              {billData.biller_logo ? (
                <img src={billData.biller_logo} alt={billData.biller}
                  className="w-12 h-12 object-contain"
                  onError={(e) => (e.target.style.display = "none")} />
              ) : (
                <i className="fa-solid fa-building text-2xl text-[#fd561e]" />
              )}
            </div>
            <h4 className="font-bold text-base text-gray-900">{billData.biller}</h4>
            <span className="inline-block text-xs font-semibold text-[#fd561e] border border-[#fd561e] bg-orange-50 px-3 py-0.5 rounded-full mt-1.5">
              {billData.category1 || "Utility"}
            </span>
            <p className="text-xs text-gray-500 mt-2 leading-snug">
              Enter the required details to fetch your bill and proceed with a secure payment.
            </p>
          </div>
          <div className="px-4 py-2 divide-y divide-gray-100">
            <div className="flex justify-between items-center py-2.5">
              <span className="text-xs text-gray-500">Category</span>
              <span className="text-xs font-semibold text-gray-800">{billData.category1 || "Utility"}</span>
            </div>
            <div className="flex justify-between items-center py-2.5">
              <span className="text-xs text-gray-500">Network</span>
              <span className="text-xs font-semibold text-gray-800">
                {billData.isbillerbbps === "Y" ? "Bharat Connect" : "BBPS"}
              </span>
            </div>
            {paymentModes.length > 0 && (
              <div className="flex justify-between items-center py-2.5">
                <span className="text-xs text-gray-500 shrink-0 mr-2">Payment modes</span>
                <span className="text-xs font-semibold text-gray-800 text-right">
                  {paymentModes.join(" · ")}
                </span>
              </div>
            )}
          </div>
          {billData.biller_remarks && (
            <div className="mx-4 mb-3 p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 leading-relaxed">
              <p className="font-bold mb-1 flex items-center gap-1">
                <i className="fa-solid fa-circle-info text-amber-500" /> Important Note
              </p>
              <p>{billData.biller_remarks}</p>
            </div>
          )}
          <div className="bg-green-50 px-4 py-3 flex items-center gap-2 text-xs font-semibold text-green-700 border-t border-green-200">
            <i className="fa-solid fa-circle-check text-green-500" /> Verified & secured by Bharat BillPay
          </div>
        </div>
      );
    }

    return (
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden h-full">
        <div className="p-5 text-center border-b border-gray-100">
          <div className="w-16 h-16 rounded-2xl bg-orange-50 border border-orange-200 flex items-center justify-center mx-auto mb-3">
            {billData.biller_logo ? (
              <img src={billData.biller_logo} alt={billData.biller}
                className="w-12 h-12 object-contain"
                onError={(e) => (e.target.style.display = "none")} />
            ) : (
              <i className="fa-solid fa-building text-2xl text-[#fd561e]" />
            )}
          </div>
          <h4 className="font-bold text-base text-gray-900">{billData.biller}</h4>
          <span className="inline-block text-xs font-semibold text-[#fd561e] border border-[#fd561e] bg-orange-50 px-3 py-0.5 rounded-full mt-1.5">
            {billData.category1 || "Utility"}
          </span>
          <p className="text-xs text-gray-500 mt-2 leading-snug">
            Your bill details have been fetched. Review and proceed with secure payment.
          </p>
        </div>
        <div className="px-4 py-2 divide-y divide-gray-100">
          {billSummary?.validationId && (
            <div className="flex justify-between items-start py-2.5 gap-2">
              <span className="text-xs text-gray-500 shrink-0">Validation ID</span>
              <span className="text-xs font-semibold text-gray-800 text-right break-all">
                {billSummary.validationId}
              </span>
            </div>
          )}
          {(userDetails.uid || userDetails.mobile) && (
            <div className="flex justify-between items-center py-2.5">
              <span className="text-xs text-gray-500">Customer ID</span>
              <span className="text-xs font-semibold text-gray-800">
                {userDetails.uid || userDetails.mobile}
              </span>
            </div>
          )}
          <div className="flex justify-between items-center py-2.5">
            <span className="text-xs text-gray-500">Date</span>
            <span className="text-xs font-semibold text-gray-800">{now}</span>
          </div>
          <div className="flex justify-between items-center py-2.5">
            <span className="text-xs text-gray-500">Network</span>
            <span className="text-xs font-semibold text-gray-800">
              {billData.isbillerbbps === "Y" ? "Bharat Connect" : "BBPS"}
            </span>
          </div>
          <div className="flex justify-between items-center py-2.5">
            <span className="text-xs text-gray-500">Multi-bill</span>
            <span className={`text-xs font-semibold ${
              payMultipleBills === "M" ? "text-blue-600" :
              payMultipleBills === "Y" ? "text-green-600" : "text-gray-500"
            }`}>
              {payMultipleBills === "M" ? "All Pre-selected" :
               payMultipleBills === "Y" ? "Multi-select" : "Single"}
            </span>
          </div>
          <div className="flex justify-between items-center py-2.5">
            <span className="text-xs text-gray-500">Partial Pay</span>
            <span className={`text-xs font-semibold ${billData.partial_pay === "Y" ? "text-green-600" : "text-gray-500"}`}>
              {billData.partial_pay === "Y" ? "Allowed" : "Not Allowed"}
            </span>
          </div>
          <div className="flex justify-between items-center py-2.5">
            <span className="text-xs text-gray-500">Pay After Due</span>
            <span className={`text-xs font-semibold ${billData.pay_after_duedate === "Y" ? "text-green-600" : "text-red-500"}`}>
              {billData.pay_after_duedate === "Y" ? "Yes" : "No"}
            </span>
          </div>
          {paymentModes.length > 0 && (
            <div className="flex justify-between items-center py-2.5">
              <span className="text-xs text-gray-500 shrink-0 mr-2">Payment modes</span>
              <span className="text-xs font-semibold text-gray-800 text-right">
                {paymentModes.join(" · ")}
              </span>
            </div>
          )}
        </div>
        {billData.biller_remarks && (
          <div className="mx-4 mb-3 p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 leading-relaxed">
            <p className="font-bold mb-1 flex items-center gap-1">
              <i className="fa-solid fa-circle-info text-amber-500" /> Important Note
            </p>
            <p>{billData.biller_remarks}</p>
          </div>
        )}
        <div className="bg-green-50 px-4 py-3 flex items-center gap-2 text-xs font-semibold text-green-700 border-t border-green-200">
          <i className="fa-solid fa-circle-check text-green-500" /> Verified & secured by Bharat BillPay
        </div>
      </div>
    );
  };

  const StepBar = () => (
    <div className="bg-white rounded-2xl border border-gray-200 p-4 sm:p-6 mb-5 shadow-sm">
      <div className="flex items-center justify-between">
        {[
          { num: 1, label: "Account details", sub: "Fill customer info" },
          { num: 2, label: "Select plan",     sub: "Choose recharge" },
          { num: 3, label: "Review & pay",    sub: "Confirm payment" },
          { num: 4, label: "Confirmation",    sub: "Receipt" },
        ].map((s, i, arr) => (
          <div key={s.num} className="flex items-center flex-1">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center font-bold text-sm sm:text-base ${step >= s.num ? "bg-[#fd561e] text-white" : "bg-gray-200 text-gray-500"}`}>
                {step > s.num ? "✓" : s.num}
              </div>
              <div className="hidden sm:block">
                <div className="font-semibold text-sm">{s.label}</div>
                <div className="text-xs text-gray-500">{s.sub}</div>
              </div>
            </div>
            {i < arr.length - 1 && (
              <div className={`flex-1 h-0.5 mx-2 sm:mx-4 ${step > s.num ? "bg-[#fd561e]" : "bg-gray-200"}`} />
            )}
          </div>
        ))}
      </div>
    </div>
  );

  const PlanSelector = () => {
    const getCat      = (p) => p.plan_category_name || p.planCategoryName || p.plan_category || p.category || "Others";
    const getAmount   = (p) => p.amount || p.plan_amount || p.price || p.planAmount || "0";
    const getValidity = (p) => p.plan_validity || p.planValidity || p.validity || "";
    const getCircle   = (p) => p.circle_name || p.circleName || p.circle || "";
    const getDesc     = (p) => p.plan_description || p.planDescription || p.description || "";
    const getData     = (p) => {
      if (p.data)          return p.data;
      if (p.internet_data) return p.internet_data;
      if (p.dataVolume)    return p.dataVolume;
      return extractDataFromDesc(getDesc(p));
    };
    const getTalktime = (p) => p.talktime || p.talk_time || "";
    const isTop       = (p) => p.topPlan === "Y" || p.top_plan === "Y";

    const categories       = ["All", ...Array.from(new Set(plans.map(getCat).filter(Boolean)))];
    const categoryFiltered = activePlanCategory === "All" ? plans : plans.filter((p) => getCat(p) === activePlanCategory);
    const finalFiltered    = planSearchQuery.trim()
      ? categoryFiltered.filter((p) => {
          const q = planSearchQuery.toLowerCase();
          return getDesc(p).toLowerCase().includes(q) || getCat(p).toLowerCase().includes(q) ||
                 getAmount(p).toString().includes(q)  || getValidity(p).toLowerCase().includes(q) ||
                 getData(p).toLowerCase().includes(q) || getCircle(p).toLowerCase().includes(q);
        })
      : categoryFiltered;

    return (
      <div id="plan-selector-section"
        className={`bg-white rounded-2xl border-2 shadow-sm p-6 mb-4 transition-all duration-300 ${planRequiredError ? "border-red-400" : "border-gray-200"}`}>
        <div className="flex items-center gap-3 mb-4 pb-3 border-b border-gray-100">
          <div className="w-7 h-7 rounded-full bg-[#fd561e] text-white flex items-center justify-center text-xs font-bold">P</div>
          <span className="text-xs font-bold uppercase text-gray-600 tracking-wide">Select Recharge Plan</span>
          {plans.length > 0 && (
            <span className="ml-auto text-[10px] font-semibold bg-orange-100 text-[#fd561e] px-2 py-0.5 rounded-full">
              {plans.length} plans
            </span>
          )}
        </div>
        {planRequiredError && (
          <div className="flex items-center gap-2 mb-4 p-3 bg-red-50 border border-red-300 rounded-xl text-sm text-red-700">
            <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <span>Please select a recharge plan to continue.</span>
          </div>
        )}
        {plansLoading && (
          <div className="flex flex-col items-center justify-center py-12 gap-3">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#fd561e]" />
            <p className="text-gray-500 text-sm font-medium">Fetching available plans...</p>
          </div>
        )}
        {!plansLoading && plansError && (
          <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-xl text-sm text-amber-800">
            <i className="fa-solid fa-circle-info text-amber-500 mt-0.5 shrink-0" />
            <p>{plansError}</p>
          </div>
        )}
        {!plansLoading && !plansError && plans.length > 0 && (
          <>
            <div className="mb-4 relative">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input type="text" placeholder="Search plans…" value={planSearchQuery}
                onChange={(e) => { setPlanSearchQuery(e.target.value); setPlanRequiredError(false); }}
                className="w-full pl-9 pr-4 py-2.5 border-2 border-gray-200 rounded-xl text-sm outline-none focus:border-[#fd561e] transition-colors" />
            </div>
            <div className="flex gap-2 overflow-x-auto pb-2 mb-4" style={{ scrollbarWidth: "none" }}>
              {categories.map((cat) => (
                <button key={cat} type="button"
                  onClick={() => { setActivePlanCategory(cat); setPlanRequiredError(false); }}
                  className={`shrink-0 text-xs font-semibold px-3 py-1.5 rounded-full border transition-all duration-200 ${activePlanCategory === cat ? "bg-[#fd561e] text-white border-[#fd561e]" : "bg-white text-gray-600 border-gray-300 hover:border-orange-300"}`}>
                  {cat}
                </button>
              ))}
            </div>
            <div className="space-y-3 max-h-[480px] overflow-y-auto pr-1">
              {finalFiltered.map((plan, i) => {
                const amount   = getAmount(plan);
                const validity = getValidity(plan);
                const circle   = getCircle(plan);
                const desc     = getDesc(plan);
                const dataVal  = getData(plan);
                const talktime = getTalktime(plan);
                const category = getCat(plan);
                const isSelected = selectedPlan === plan;
                const topPlan    = isTop(plan);
                return (
                  <button key={i} type="button"
                    onClick={() => { setSelectedPlan(plan); setPlanRequiredError(false); if (amount) { setBillAmount(parseFloat(amount).toFixed(2)); setTotalPayable(parseFloat(amount).toFixed(2)); } }}
                    className={`relative w-full text-left rounded-xl border-2 transition-all duration-200 overflow-hidden ${isSelected ? "border-[#fd561e] bg-orange-50 shadow-md" : "border-gray-100 bg-white hover:border-orange-300 hover:shadow-sm"}`}>
                    {isSelected && (
                      <span className="absolute top-3 right-3 w-5 h-5 bg-[#fd561e] rounded-full flex items-center justify-center z-10">
                        <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      </span>
                    )}
                    {topPlan && !isSelected && (
                      <span className="absolute top-3 right-3 text-[9px] font-bold bg-[#fd561e] text-white px-1.5 py-0.5 rounded-full">TOP</span>
                    )}
                    <div className="flex">
                      <div className="min-w-[90px] border-r border-gray-100 p-4 text-center flex flex-col items-center justify-center bg-orange-50/50">
                        <p className="font-bold text-[#fd561e] text-xl leading-none">₹{parseFloat(amount || 0).toFixed(0)}</p>
                        <span className="text-[10px] text-[#fd561e] font-semibold mt-1">{category}</span>
                      </div>
                      <div className="flex-1 p-4 min-w-0">
                        <div className="flex flex-wrap gap-x-4 gap-y-0.5 text-xs text-gray-600 mb-1.5">
                          {validity && <span><strong>Validity:</strong> {validity}</span>}
                          {circle   && <span><strong>Circle:</strong> {circle}</span>}
                          {dataVal  && <span><strong>Data:</strong> {dataVal}</span>}
                        </div>
                        {(dataVal || talktime) && (
                          <div className="flex gap-2 mb-1.5">
                            {dataVal  && <span className="text-[10px] text-blue-600 font-semibold bg-blue-50 px-1.5 py-0.5 rounded">📶 {dataVal}</span>}
                            {talktime && <span className="text-[10px] text-green-600 font-semibold bg-green-50 px-1.5 py-0.5 rounded">📞 {talktime}</span>}
                          </div>
                        )}
                        {desc && desc !== "Failed" && (
                          <p className="text-xs text-gray-500 leading-snug line-clamp-2">{desc}</p>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
            {finalFiltered.length === 0 && (
              <p className="text-gray-400 text-sm text-center py-6">
                {planSearchQuery ? "No plans match your search." : "No plans in this category."}
              </p>
            )}
          </>
        )}
      </div>
    );
  };

  const PaymentModal = () => {
    const bd         = billDataRef.current;
    const grandTotal = (parseFloat(totalPayable || 0) + convFeeInfo.total).toFixed(2);
    const availableMethods = (bd?.allowed_payment_methods || []).map((m) => m.payment_method);
    const selectedBillsArr = isMultiMode
      ? billList.filter((b) => selectedBillIds.includes(b._stableId))
      : selectedBill ? [selectedBill] : billList.slice(0, 1);

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
            <button onClick={() => setShowPayment(false)} className="text-gray-400  cursor-pointer hover:text-gray-600">✕</button>
          </div>

          <div className="px-6 py-4 space-y-3 max-h-[70vh] overflow-y-auto">
            {/* {isMultiMode && selectedBillsArr.length > 1 && (
              <div className="bg-orange-50 border border-orange-100 rounded-xl p-3 mb-1">
                <p className="text-xs font-bold text-gray-600 uppercase tracking-wide mb-2">
                  {selectedBillsArr.length} Bills Selected
                </p>
                {selectedBillsArr.map((b) => (
                  <div key={b._stableId} className="flex justify-between text-xs text-gray-600 py-0.5">
                    <span className="truncate mr-2">{b.billnumber || b._stableId}</span>
                    <span className="font-semibold shrink-0">₹{parseFloat(billPayAmounts[b._stableId] || 0).toFixed(2)}</span>
                  </div>
                ))}
              </div>
            )} */}

            {Object.entries(METHOD_META)
              .filter(([id]) => availableMethods.includes(id))
              .map(([id, meta]) => {
                const previewFee = calcConvFee(bd?.customer_conv_fee, id, methodToChannel(id), totalPayable);
                return (
                  <button key={id} type="button"
                    onClick={() => { setSelectedMethod(id); setUpiError(""); }}
                    className={`w-full flex items-center justify-between px-4 py-4 rounded-xl border-2 transition-all duration-200 ${selectedMethod === id ? "border-[#fd561e] bg-orange-50" : "border-gray-200 bg-white hover:border-orange-200"}`}>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-orange-50 flex items-center justify-center">{meta.icon}</div>
                      <div className="text-left">
                        <p className="font-semibold text-gray-800 text-sm">{meta.label}</p>
                        {previewFee.total > 0 && <p className="text-[10px] text-amber-600">Conv fee: +₹{previewFee.total}</p>}
                      </div>
                    </div>
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${selectedMethod === id ? "border-[#fd561e]" : "border-gray-300"}`}>
                      {selectedMethod === id && <div className="w-2.5 h-2.5 rounded-full bg-[#fd561e]" />}
                    </div>
                  </button>
                );
              })}

            {selectedMethod === "UPI" && (
              <div>
                <input ref={upiRef} type="text"
                  className={`w-full px-4 py-3 border-2 rounded-xl outline-none text-sm ${upiError ? "border-red-400 bg-red-50" : "border-orange-300 focus:border-[#fd561e]"}`}
                  placeholder="Enter UPI ID (example@bank)" defaultValue=""
                  onChange={() => { if (upiError) setUpiError(""); }} />
                {upiError && <p className="text-red-500 text-xs mt-1">{upiError}</p>}
              </div>
            )}

            {(bd?.additional_payment_details || []).length > 0 && selectedMethod && (
              <div className="space-y-2 mt-1">
                {(bd?.additional_payment_details || []).map((f, i) => (
                  <div key={i}>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">
                      {f.parameter_name}{f.optional !== "Y" && <span className="text-[#fd561e] ml-1">*</span>}
                    </label>
                    <input type="text"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#fd561e] outline-none"
                      placeholder={f.error_message || `Enter ${f.parameter_name}`}
                      required={f.optional !== "Y"}
                      value={additionalPayFields[f.parameter_name] || ""}
                      onChange={(e) => setAdditionalPayFields((prev) => ({ ...prev, [f.parameter_name]: e.target.value }))} />
                  </div>
                ))}
              </div>
            )}

            {selectedMethod && (
              <div className="bg-gray-50 rounded-xl p-4 border border-gray-200 mt-2">
                <div className="flex justify-between text-sm text-gray-600 mb-2">
                  <span>
                    {isMultiMode && selectedBillIds.length > 1
                      ? `Total (${selectedBillIds.length} bills)`
                      : "Bill Amount"}
                  </span>
                  <span>₹{parseFloat(totalPayable || 0).toFixed(2)}</span>
                </div>
                {convFeeInfo.fee > 0 ? (
                  <>
                    <div className="flex justify-between text-sm text-gray-600 mb-1">
                      <span>Convenience Fee</span><span>₹{convFeeInfo.fee.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm text-gray-600 mb-2 pb-2 border-b border-gray-200">
                      <span>GST on Conv Fee</span><span>₹{convFeeInfo.gst.toFixed(2)}</span>
                    </div>
                  </>
                ) : (
                  <div className="flex justify-between text-sm text-gray-500 mb-2 pb-2 border-b border-gray-200">
                    <span>Convenience Fee</span>
                    <span className="text-green-600 font-semibold">FREE</span>
                  </div>
                )}
                <div className="flex justify-between font-bold text-gray-800">
                  <span>Total Payable</span>
                  <span className="text-[#fd561e] text-base">₹{parseFloat(grandTotal).toFixed(2)}</span>
                </div>
              </div>
            )}
          </div>

          <div className="px-6 pb-6 pt-3 space-y-3">
            {selectedMethod && (
              <button onClick={handlePay} disabled={paymentLoading}
                className="w-full bg-[#fd561e] cursor-pointer text-white py-4 rounded-2xl font-bold text-base shadow-lg hover:bg-[#e04010] active:scale-95 transition-all duration-200 disabled:opacity-60">
                {paymentLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="white" strokeWidth="4" />
                      <path className="opacity-75" fill="white" d="M4 12a8 8 0 018-8v8H4z" />
                    </svg>
                    Processing...
                  </span>
                ) : `Pay ₹${parseFloat(grandTotal).toFixed(2)}`}
              </button>
            )}
            <button onClick={() => setShowPayment(false)}
              className="w-full bg-gray-100 text-gray-600 cursor-pointer py-3 rounded-2xl font-semibold hover:bg-gray-200 transition-all">
              Cancel
            </button>
          </div>
        </div>
      </div>
    );
  };

  const amountConstraints = getAmountConstraints();
  const billSummaryStepNum = (isMultiMode && billList.length > 0) || billList.length > 1 ? 2 : 1;

  // ── Derive pmb from ref for render-time decisions ──
  const pmbNow = (billDataRef.current?.pay_multiple_bills || "N").toUpperCase();

  return (
    <div className="bg-white">
      <Popup />
      {showPayment && <PaymentModal />}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-12">
        <div className="text-sm text-gray-500 mb-4 flex items-center gap-2">
          <a href="/BillHomePage" className="hover:text-[#fd561e]">Home</a>
          <span>›</span>
          <span>{billData.category || "Utility"}</span>
          <span>›</span>
          <span className="text-[#fd561e] font-semibold">{billData.biller}</span>
        </div>

        <StepBar />
        <div className="lg:hidden mb-5"><BillerInfoCard /></div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 items-start">
          <div className="hidden lg:block lg:col-span-1 sticky top-24 self-start">
            <BillerInfoCard />
          </div>

          {/* STEP 1 */}
          {step === 1 && (
            <div className="lg:col-span-2">
              <form onSubmit={handleFetchBill}>
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 mb-4">
                  <div className="flex items-center gap-3 mb-5 pb-3 border-b border-gray-100">
                    <div className="w-7 h-7 rounded-full bg-[#fd561e] text-white flex items-center justify-center text-xs font-bold">1</div>
                    <span className="text-xs font-bold uppercase text-gray-600">Account Identifier</span>
                  </div>
                  {safeParseJson(billData?.biller_authenticator_group) && (
                    <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-700">
                      <i className="fa-solid fa-circle-info mr-1" />
                      Fill at least one identifier from the grouped fields to proceed.
                    </div>
                  )}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {authenticators.map((auth, i) => (
                      <AuthField
                        key={auth.parameter_name}
                        auth={auth}
                        formData={formData}
                        onInputChange={handleInputChange}
                        getGroupInfo={getGroupInfo}
                      />
                    ))}
                  </div>
                </div>

                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 mb-4">
                  <div className="flex items-center gap-3 mb-5 pb-3 border-b border-gray-100">
                    <div className="w-7 h-7 rounded-full bg-[#fd561e] text-white flex items-center justify-center text-xs font-bold">2</div>
                    <span className="text-xs font-bold uppercase text-gray-600">Customer Details</span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-semibold text-gray-700 mb-1">Full Name <span className="text-[#fd561e]">*</span></label>
                      <input type="text"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#fd561e] focus:border-[#fd561e] outline-none bg-gray-50"
                        required pattern="[A-Za-z\s]{3,}" title="Enter valid full name (minimum 3 letters)"
                        value={userDetails.name} onChange={(e) => setUserDetails((p) => ({ ...p, name: e.target.value }))} />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">Mobile Number <span className="text-[#fd561e]">*</span></label>
                      <input type="tel"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#fd561e] focus:border-[#fd561e] outline-none bg-gray-50"
                        required maxLength="10" pattern="[6-9]\d{9}" title="10-digit mobile number"
                        value={userDetails.mobile} onChange={(e) => setUserDetails((p) => ({ ...p, mobile: e.target.value }))} />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">Email Address <span className="text-[#fd561e]">*</span></label>
                      <input type="email"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#fd561e] focus:border-[#fd561e] outline-none bg-gray-50"
                        required value={userDetails.email} onChange={(e) => setUserDetails((p) => ({ ...p, email: e.target.value }))} />
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
                    <button type="submit" disabled={fetchingBill}
                      className="bg-[#fd561e] text-white px-8 py-3 rounded-xl font-semibold shadow-lg hover:scale-105 transition-all duration-300 disabled:opacity-50 cursor-pointer">
                      {fetchingBill ? "Fetching..." : "Continue →"}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          )}

          {/* STEP 2 */}
          {step === 2 && (
            <div className="lg:col-span-2">
              {isMobilePrepaid(billData) && <PlanSelector />}

              {!isMobilePrepaid(billData) && (
                <>
                  {/* ── Multi-bill selector (N/Y/M) ── */}
                  {billList.length > 0 && (() => {
                    const bd  = billDataRef.current;
                    const pmb = (billDataRef.current?.pay_multiple_bills || "N").toUpperCase();

                    if (pmb === "N" && billList.length === 1) return null;

                    return (
                      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 mb-4">
                        {/* Header */}
                        <div className="flex items-center gap-3 mb-2 pb-3 border-b border-gray-100">
                          <div className="w-8 h-8 rounded-full bg-[#fd561e] text-white flex items-center justify-center text-sm font-bold">1</div>
                          <span className="text-sm font-bold uppercase text-gray-700 tracking-wide">
                            {pmb === "N" ? "Select Bill" : "Your Bills"}
                          </span>
                          <span className="ml-auto text-[10px] font-semibold bg-orange-100 text-[#fd561e] px-2 py-0.5 rounded-full">
                            {billList.length} bill{billList.length > 1 ? "s" : ""} found
                          </span>
                        </div>

                        {/* Info badge */}
                        <div className={`flex items-center gap-2 mb-4 px-3 py-2 rounded-xl text-xs font-semibold border ${
                          pmb === "M" ? "bg-blue-50 border-blue-200 text-blue-700"
                          : pmb === "Y" ? "bg-green-50 border-green-200 text-green-700"
                          : "bg-orange-50 border-orange-200 text-orange-700"
                        }`}>
                          <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                          </svg>
                          {pmb === "M"
                            ? bd?.partial_pay === "Y"
                              ? "All bills pre-selected • click any bill to edit its amount"
                              : "All bills pre-selected • selection cannot be changed"
                            : pmb === "Y"
                            ? "Select the bills you want to pay"
                            : "Select one bill to proceed"}
                        </div>

                        {/* Bill list */}
                        <div className="space-y-3">
                          {billList.map((bill) => {
                            const sid         = bill._stableId;
                            const isChecked   = pmb === "N"
                              ? (selectedBill?._stableId === sid)
                              : selectedBillIds.includes(sid);
                            const faceBillAmt = parseFloat(bill.billamount || bill.net_billamount || 0);
                            const minPay      = parseFloat(bill.min_pay_amount || 0);
                            const maxPay      = parseFloat(bill.max_pay_amount || 0);
                            const isExpanded  = expandedBillId === sid;
                            const canPartial  = bd?.partial_pay === "Y";
                            const payAmt      = billPayAmounts[sid] ?? faceBillAmt.toFixed(2);
                            const isEdited    = Math.abs(parseFloat(payAmt) - faceBillAmt) > 0.001;

                            // ══════════════════════════════════════════════════
                            // MODIFIED handleRowClick — validate before switching
                            // ══════════════════════════════════════════════════
                            const handleRowClick = () => {
                              if (pmb === "M") {
                                // M mode: వేరే bill click చేసే ముందు current expanded bill validate
                                if (expandedBillId && expandedBillId !== sid) {
                                  if (!validateExpandedBillAmount(billPayAmounts, expandedBillId, billList)) return;
                                }
                                setExpandedBillId(isExpanded ? null : sid);
                              } else if (pmb === "N") {
                                applyBillData(bill, billSummary?.validationId || "", bd);
                              } else {
                                // Y mode: వేరే bill click చేసే ముందు current expanded bill validate
                                toggleBillSelection(sid, billPayAmounts, expandedBillId, billList);
                                setExpandedBillId(!isChecked ? sid : null);
                              }
                            };

                            return (
                              <div key={sid}
                                className={`rounded-xl border-2 overflow-hidden transition-all duration-200 ${
                                  isChecked ? "border-[#fd561e] shadow-sm" : "border-gray-200 hover:border-orange-300"
                                }`}>
                                {/* Bill row */}
                                <button type="button" onClick={handleRowClick}
                                  className={`relative w-full text-left ${isChecked ? "bg-orange-50" : "bg-white"} cursor-pointer`}>
                                  {/* Top-right indicators */}
                                  <div className="absolute top-3 right-3 z-10 flex items-center gap-1.5">
                                    {((pmb === "M" && canPartial) || (pmb === "Y" && isChecked)) && (
                                      <svg className={`w-4 h-4 text-[#fd561e] transition-transform duration-200 ${isExpanded ? "rotate-180" : ""}`}
                                        fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                      </svg>
                                    )}
                                    {pmb === "N" && (
                                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${isChecked ? "border-[#fd561e]" : "border-gray-300"}`}>
                                        {isChecked && <div className="w-2.5 h-2.5 rounded-full bg-[#fd561e]" />}
                                      </div>
                                    )}
                                    {pmb === "M" && (
                                      <div className="w-5 h-5 rounded border-2 border-[#fd561e] bg-[#fd561e] flex items-center justify-center shrink-0">
                                        <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                        </svg>
                                      </div>
                                    )}
                                    {pmb === "Y" && (
                                      <div className={`w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 ${
                                        isChecked ? "border-[#fd561e] bg-[#fd561e]" : "border-gray-300 bg-white"
                                      }`}>
                                        {isChecked && (
                                          <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                          </svg>
                                        )}
                                      </div>
                                    )}
                                  </div>

                                  <div className="flex">
                                    {/* Left: amount + status */}
                                    <div className="min-w-[110px] border-r border-gray-100 p-4 flex flex-col items-center justify-center bg-orange-50/50 shrink-0">
                                      <p className="font-bold text-[#fd561e] text-xl leading-none">
                                        ₹{faceBillAmt.toFixed(0)}
                                      </p>
                                      <span className={`text-[10px] font-bold mt-1.5 px-2 py-0.5 rounded-full ${
                                        (bill.billstatus || "").toUpperCase() === "UNPAID"
                                          ? "bg-red-100 text-red-600"
                                          : "bg-green-100 text-green-600"
                                      }`}>
                                        {(bill.billstatus || "UNPAID").toUpperCase()}
                                      </span>
                                    </div>

                                    {/* Right: details */}
                                    <div className="flex-1 p-4 min-w-0 pr-16">
                                      <div className="flex flex-wrap gap-x-4 gap-y-0.5 text-xs text-gray-700 mb-1">
                                        {bill.billnumber && <span><strong>Bill No:</strong> {bill.billnumber}</span>}
                                        {bill.billperiod && <span><strong>Period:</strong> {bill.billperiod}</span>}
                                      </div>
                                      <div className="flex flex-wrap gap-x-4 gap-y-0.5 text-xs text-gray-500 mb-2">
                                        {bill.billduedate   && <span><strong>Due:</strong> {bill.billduedate}</span>}
                                        {bill.customer_name && <span><strong>Name:</strong> {bill.customer_name}</span>}
                                      </div>
                                      {(minPay > 0 || maxPay > 0) && (
                                        <p className="text-[10px] text-gray-400 mb-1.5">
                                          Pay range: ₹{minPay.toFixed(0)} – ₹{maxPay.toFixed(0)}
                                        </p>
                                      )}
                                      {/* Always-visible paying amount */}
                                      {(pmb === "M" || (pmb === "Y" && isChecked)) && (
                                        <div className="flex items-center gap-2 mt-1">
                                          <span className="text-[11px] text-gray-500">Paying:</span>
                                          <span className="text-xs font-bold text-[#fd561e]">
                                            ₹{parseFloat(payAmt).toFixed(2)}
                                          </span>
                                          {isEdited && (
                                            <span className="text-[10px] text-gray-400 line-through">
                                              ₹{faceBillAmt.toFixed(2)}
                                            </span>
                                          )}
                                          {canPartial && (
                                            <span className="text-[10px] text-blue-500">
                                              {isExpanded ? "▲" : "▼ edit"}
                                            </span>
                                          )}
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </button>

                                {/* Amount editor accordion */}
                                {isExpanded && (pmb === "M" || pmb === "Y") && (
                                  <div className="border-t border-orange-200 bg-white px-5 py-4">
                                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">
                                      Payment Amount
                                      {!canPartial && (
                                        <span className="ml-2 font-normal text-gray-400 normal-case">
                                          (partial pay not allowed)
                                        </span>
                                      )}
                                    </p>
                                    <div className="flex items-center gap-3">
                                      <div className={`flex-1 flex items-center gap-2 border-2 rounded-xl px-4 py-3 ${
                                        canPartial
                                          ? "border-orange-300 bg-white focus-within:border-[#fd561e]"
                                          : "border-gray-200 bg-gray-50"
                                      }`}>
                                        <span className="text-[#fd561e] font-bold text-lg shrink-0">₹</span>
                                        <input
                                          type="number"
                                          min={minPay > 0 ? minPay : 1}
                                          max={maxPay > 0 ? maxPay : faceBillAmt}
                                          step="0.01"
                                          readOnly={!canPartial}
                                          value={payAmt}
                                          onChange={(e) => {
                                            if (!canPartial) return;
                                            updateBillPayAmount(sid, e.target.value);
                                          }}
                                          onClick={(e) => e.stopPropagation()}
                                          className={`flex-1 bg-transparent text-base font-bold text-[#fd561e] text-right outline-none ${
                                            canPartial ? "cursor-text" : "cursor-not-allowed"
                                          }`}
                                        />
                                      </div>
                                      {canPartial && isEdited && (
                                        <button type="button"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            updateBillPayAmount(sid, faceBillAmt.toFixed(2));
                                          }}
                                          className="shrink-0 text-xs text-gray-500 border border-gray-200 rounded-xl px-3 py-2 hover:border-[#fd561e] hover:text-[#fd561e] transition-colors whitespace-nowrap">
                                          Reset ₹{faceBillAmt.toFixed(0)}
                                        </button>
                                      )}
                                    </div>
                                    {canPartial && (minPay > 0 || maxPay > 0) && (
                                      <p className="text-[11px] text-gray-400 mt-2">
                                        Min: ₹{minPay.toFixed(2)} &nbsp;•&nbsp; Max: ₹{(maxPay || faceBillAmt).toFixed(2)}
                                      </p>
                                    )}
                                  </div>
                                )}

                                {/* N mode pay strip */}
                                {isChecked && pmb === "N" && (
                                  <div className="border-t border-orange-100 px-4 py-3 bg-orange-50/40 flex items-center gap-3">
                                    <span className="text-xs text-gray-500 font-semibold shrink-0">Pay Amount:</span>
                                    <span className="text-[#fd561e] font-bold">₹</span>
                                    <input
                                      type="number"
                                      step="0.01"
                                      min={minPay > 0 ? minPay : 1}
                                      max={maxPay > 0 ? maxPay : faceBillAmt}
                                      readOnly={!canPartial}
                                      value={totalPayable}
                                      onChange={(e) => setTotalPayable(e.target.value)}
                                      className={`flex-1 border rounded-lg px-3 py-1.5 text-sm font-bold text-[#fd561e] text-right outline-none focus:ring-2 focus:ring-[#fd561e] ${
                                        canPartial
                                          ? "border-orange-300 bg-white"
                                          : "border-gray-200 bg-gray-50 cursor-not-allowed"
                                      }`}
                                    />
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>

                        {/* Grand total strip — M and Y modes */}
                        {isMultiMode && selectedBillIds.length > 0 && (
                          <div className="mt-4 rounded-xl border border-orange-200 bg-orange-50 overflow-hidden">
                            <div className="divide-y divide-orange-100">
                              {billList
                                .filter((b) => selectedBillIds.includes(b._stableId))
                                .map((b) => {
                                  const amt     = parseFloat(billPayAmounts[b._stableId] || 0);
                                  const faceAmt = parseFloat(b.billamount || b.net_billamount || 0);
                                  const edited  = Math.abs(amt - faceAmt) > 0.001;
                                  return (
                                    <div key={b._stableId} className="flex items-center justify-between px-4 py-2.5">
                                      <span className="text-xs text-gray-600 font-medium">
                                        {b.billnumber || b._stableId}
                                      </span>
                                      <div className="flex items-center gap-2">
                                        {edited && (
                                          <span className="text-[10px] text-gray-400 line-through">₹{faceAmt.toFixed(2)}</span>
                                        )}
                                        <span className="text-xs font-bold text-[#fd561e]">₹{amt.toFixed(2)}</span>
                                      </div>
                                    </div>
                                  );
                                })}
                            </div>
                            <div className="flex items-center justify-between px-4 py-3 bg-orange-100/70 border-t border-orange-200">
                              <div>
                                <p className="text-xs font-bold text-gray-700 uppercase tracking-wide">Total Payable</p>
                                <p className="text-[10px] text-gray-500 mt-0.5">
                                  {selectedBillIds.length} bill{selectedBillIds.length > 1 ? "s" : ""}
                                </p>
                              </div>
                              <p className="text-2xl font-bold text-[#fd561e]">
                                ₹{parseFloat(totalPayable || 0).toFixed(2)}
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })()}

                  {/* ── NCMC / PAYEE type: additional_info బిల్లర్లు — billlist ఇవ్వరు ── */}
                  {!isMultiMode && billList.length === 0 && additionalInfo.length > 0 && (() => {
                    const getInfo = (name) =>
                      additionalInfo.find((x) => x.parameter_name === name)?.value || "";
                    const metro       = getInfo("Metro Name");
                    const balance     = getInfo("Current Card Balance");
                    const minRecharge = getInfo("Minimum Permissible Recharge Amount");
                    const maxRecharge = getInfo("Maximum Permissible Recharge Amount");
                    const platFeeStr  = getInfo("Biller Platform Fee (Rs.) + GST");
                    const note        = getInfo("Consumer Note");
                    const platFeeAmt  = parseFloat(platFeeStr) || 0;
                    const enteredAmt  = parseFloat(totalPayable) || 0;
                    const grandTotal  = (enteredAmt + platFeeAmt).toFixed(2);

                    const knownKeys   = ["Metro Name","Current Card Balance","Minimum Permissible Recharge Amount","Maximum Permissible Recharge Amount","Biller Platform Fee (Rs.) + GST","Consumer Note"];
                    const extraInfos  = additionalInfo.filter((x) => !knownKeys.includes(x.parameter_name));

                    return (
                      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 mb-4">
                        {/* Header */}
                        <div className="flex items-center gap-3 mb-5 pb-3 border-b border-gray-100">
                          <div className="w-8 h-8 rounded-full bg-[#fd561e] text-white flex items-center justify-center text-sm font-bold">1</div>
                          <span className="text-sm font-bold uppercase text-gray-700 tracking-wide">Recharge Summary</span>
                        </div>

                        {/* Info grid — Metro, Balance, Min, Max, PlatformFee */}
                        <div className="grid grid-cols-2 gap-3 mb-5">
                          {metro && (
                            <div className="col-span-2 sm:col-span-1 bg-gray-50 rounded-xl border border-gray-200 px-4 py-3">
                              <p className="text-[10px] font-bold uppercase text-gray-400 tracking-wide mb-1">Metro</p>
                              <p className="text-sm font-bold text-gray-800">{metro}</p>
                            </div>
                          )}
                          {balance && (
                            <div className="bg-gray-50 rounded-xl border border-gray-200 px-4 py-3">
                              <p className="text-[10px] font-bold uppercase text-gray-400 tracking-wide mb-1">Current Balance</p>
                              <p className="text-sm font-bold text-gray-800">₹{balance}</p>
                            </div>
                          )}
                          {minRecharge && (
                            <div className="bg-gray-50 rounded-xl border border-gray-200 px-4 py-3">
                              <p className="text-[10px] font-bold uppercase text-gray-400 tracking-wide mb-1">Min Recharge</p>
                              <p className="text-sm font-bold text-gray-800">₹{minRecharge}</p>
                            </div>
                          )}
                          {maxRecharge && (
                            <div className="bg-gray-50 rounded-xl border border-gray-200 px-4 py-3">
                              <p className="text-[10px] font-bold uppercase text-gray-400 tracking-wide mb-1">Max Recharge</p>
                              <p className="text-sm font-bold text-gray-800">₹{maxRecharge}</p>
                            </div>
                          )}
                          {platFeeStr && (
                            <div className="col-span-2 sm:col-span-1 bg-gray-50 rounded-xl border border-gray-200 px-4 py-3">
                              <p className="text-[10px] font-bold uppercase text-gray-400 tracking-wide mb-1">Platform Fee</p>
                              <p className="text-sm font-bold text-gray-800">₹{platFeeStr}</p>
                            </div>
                          )}
                          {extraInfos.map((inf) => (
                            <div key={inf.parameter_name} className="bg-gray-50 rounded-xl border border-gray-200 px-4 py-3">
                              <p className="text-[10px] font-bold uppercase text-gray-400 tracking-wide mb-1">{inf.parameter_name}</p>
                              <p className="text-sm font-bold text-gray-800">{inf.value}</p>
                            </div>
                          ))}
                        </div>

                        {/* Amount input */}
                        <div className="mb-3">
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Recharge Amount (₹) <span className="text-[#fd561e]">*</span>
                          </label>
                          <input
                            type="number"
                            step={minRecharge ? parseFloat(minRecharge) : 1}
                            min={minRecharge ? parseFloat(minRecharge) : 1}
                            max={maxRecharge ? parseFloat(maxRecharge) : undefined}
                            placeholder={
                              minRecharge && maxRecharge
                                ? `Enter amount between ₹${minRecharge} – ₹${maxRecharge}`
                                : "Enter recharge amount"
                            }
                            value={totalPayable}
                            onChange={(e) => setTotalPayable(e.target.value)}
                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-sm font-semibold focus:border-[#fd561e] outline-none transition-colors"
                          />
                        </div>

                        {/* Total Payable breakdown strip */}
                        <div className="rounded-xl border border-orange-200 bg-orange-50 overflow-hidden mb-4">
                          {enteredAmt > 0 && platFeeAmt > 0 && (
                            <div className="divide-y divide-orange-100">
                              <div className="flex justify-between text-xs text-gray-600 px-5 py-2.5">
                                <span>Recharge Amount</span>
                                <span className="font-semibold">₹{enteredAmt.toFixed(2)}</span>
                              </div>
                              <div className="flex justify-between text-xs text-gray-600 px-5 py-2.5">
                                <span>Platform Fee</span>
                                <span className="font-semibold">₹{platFeeAmt.toFixed(2)}</span>
                              </div>
                            </div>
                          )}
                          <div className="flex items-center justify-between px-5 py-3 bg-orange-100/60 border-t border-orange-200">
                            <span className="font-bold text-gray-800 text-sm">Total Payable</span>
                            <span className="text-xl font-bold text-[#fd561e]">
                              ₹{enteredAmt > 0 ? grandTotal : "0.00"}
                            </span>
                          </div>
                        </div>

                        {/* Consumer Note */}
                        {note && (
                          <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 leading-relaxed mb-5">
                            <i className="fa-solid fa-circle-info text-amber-500 mt-0.5 shrink-0" />
                            <p>{note}</p>
                          </div>
                        )}

                        {/* ── Customer Details merged here — no separate card ── */}
                        <div className="border-t border-gray-100 pt-5 mt-2">
                          <div className="flex items-center justify-between gap-3 mb-4">
                            <div className="flex items-center gap-2">
                              <div className="w-7 h-7 rounded-full bg-[#fd561e] text-white flex items-center justify-center text-xs font-bold">2</div>
                              <span className="text-sm font-bold uppercase text-gray-700 tracking-wide">Customer Details</span>
                            </div>
                            <button type="button" onClick={() => setIsEditingUser(!isEditingUser)}
                              className="text-xs text-[#fd561e] cursor-pointer font-semibold hover:underline">
                              {isEditingUser ? "Save" : "Edit"}
                            </button>
                          </div>
                          {isEditingUser ? (
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-5">
                              <div className="sm:col-span-3">
                                <label className="block text-xs text-gray-500 uppercase font-semibold mb-1">Full Name</label>
                                <input type="text" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#fd561e] focus:border-[#fd561e] outline-none bg-gray-50 text-sm"
                                  value={userDetails.name} onChange={(e) => setUserDetails((p) => ({ ...p, name: e.target.value }))} />
                              </div>
                              <div>
                                <label className="block text-xs text-gray-500 uppercase font-semibold mb-1">Mobile</label>
                                <input type="tel" maxLength="10" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#fd561e] focus:border-[#fd561e] outline-none bg-gray-50 text-sm"
                                  value={userDetails.mobile} onChange={(e) => setUserDetails((p) => ({ ...p, mobile: e.target.value }))} />
                              </div>
                              <div className="sm:col-span-2">
                                <label className="block text-xs text-gray-500 uppercase font-semibold mb-1">Email</label>
                                <input type="email" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#fd561e] focus:border-[#fd561e] outline-none bg-gray-50 text-sm"
                                  value={userDetails.email} onChange={(e) => setUserDetails((p) => ({ ...p, email: e.target.value }))} />
                              </div>
                            </div>
                          ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-5">
                              {[
                                { label: "Name",   value: userDetails.name },
                                { label: "Mobile", value: userDetails.mobile },
                                { label: "Email",  value: userDetails.email },
                              ].map(({ label, value }) => (
                                <div key={label} className="flex sm:block items-center justify-between border-b sm:border-b-0 border-gray-100 pb-3 sm:pb-0">
                                  <p className="text-xs text-gray-500 uppercase font-semibold">{label}</p>
                                  <p className="font-bold text-gray-800 text-sm break-all mt-0 sm:mt-1">{value || "—"}</p>
                                </div>
                              ))}
                            </div>
                          )}
                          <div className="flex justify-between gap-3">
                            <button type="button" onClick={() => setStep(1)}
                              className="px-5 py-2 cursor-pointer rounded-xl border border-gray-300 text-gray-600 text-sm font-semibold hover:bg-gray-50 transition-all">
                              ← Edit Details
                            </button>
                            <button type="button"
                              onClick={() => {
                                // platform fee totalPayable లో add చేసి payment open చేయి
                                const entered = parseFloat(totalPayable) || 0;
                                if (entered <= 0) { setPopupMessage("Please enter a valid recharge amount."); setShowPopup(true); return; }
                                const minA = parseFloat(minRecharge) || 0;
                                const maxA = parseFloat(maxRecharge) || 0;
                                if (minA > 0 && entered < minA) { setPopupMessage(`Minimum recharge amount is ₹${minA}.`); setShowPopup(true); return; }
                                if (maxA > 0 && entered > maxA) { setPopupMessage(`Maximum recharge amount is ₹${maxA}.`); setShowPopup(true); return; }
                                // grandTotal (recharge + platformFee) ని totalPayable లో set చేసి modal open
                                const gt = (entered + platFeeAmt).toFixed(2);
                                setTotalPayable(gt);
                                setSelectedMethod(""); setUpiId(""); setUpiError(""); setAmountMethodErr("");
                                setConvFeeInfo({ fee: 0, gst: 0, total: 0 });
                                const apf = {};
                                (billDataRef.current?.additional_payment_details || []).forEach((f) => { apf[f.parameter_name] = ""; });
                                setAdditionalPayFields(apf);
                                setShowPayment(true);
                              }}
                              className="bg-[#fd561e] text-white px-8 py-3 rounded-xl font-semibold shadow-lg hover:scale-105 transition-all duration-300 cursor-pointer inline-flex items-center gap-2">
                              Proceed to Payment →
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })()}

                  {/* ── Single-bill summary: N mode only — additionalInfo mode లో skip ── */}
                  {!isMultiMode && additionalInfo.length === 0 && (
                    (pmbNow === "N" && (selectedBill || billList.length === 0)) ||
                    billList.length === 0
                  ) && (
                    <>
                      {billSummary?.dueWarning && (
                        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-2xl flex items-start gap-3">
                          <i className="fa-solid fa-triangle-exclamation text-red-500 mt-0.5" />
                          <div>
                            <p className="text-sm font-bold text-red-700">Payment after due date not allowed</p>
                            <p className="text-xs text-red-500 mt-0.5">Please check your due date before proceeding.</p>
                          </div>
                        </div>
                      )}
                      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 mb-4">
                        <div className="flex items-center gap-3 mb-5">
                          <div className="w-8 h-8 rounded-full bg-[#fd561e] text-white flex items-center justify-center text-sm font-bold">
                            {billSummaryStepNum}
                          </div>
                          <span className="text-sm font-bold uppercase text-gray-700 tracking-wide">Bill Summary</span>
                        </div>
                        {authenticators.filter((a) => formData[a.parameter_name]?.trim()).length > 0 && (
                          <div className="border border-gray-200 rounded-xl overflow-hidden mb-4">
                            <div className="bg-gray-50 px-5 py-3 border-b border-gray-200">
                              <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">Account Details</p>
                            </div>
                            {authenticators.filter((a) => formData[a.parameter_name]?.trim()).map((auth, i) => (
                              <div key={i} className="flex justify-between items-center px-5 py-3 border-b border-gray-100 last:border-b-0">
                                <span className="text-gray-500 text-sm">{auth.parameter_name}</span>
                                <span className="font-semibold text-gray-800 text-sm">{formData[auth.parameter_name]}</span>
                              </div>
                            ))}
                          </div>
                        )}
                        {billSummary && billSummary.billNumber && (
                          <div className="border border-gray-200 rounded-xl overflow-hidden mb-4">
                            {billSummary.billNumber && billSummary.billNumber !== "N/A" && (
                              <div className="flex justify-between items-center px-5 py-4 border-b border-gray-100">
                                <span className="text-gray-500 text-sm">Bill Number</span>
                                <span className="font-semibold text-gray-800">{billSummary.billNumber}</span>
                              </div>
                            )}
                            {billAmount && (
                              <div className="flex justify-between items-center px-5 py-4 border-b border-gray-100">
                                <span className="text-gray-500 text-sm">Bill Amount</span>
                                <span className="font-bold text-[#fd561e] text-base">₹{parseFloat(billAmount).toFixed(2)}</span>
                              </div>
                            )}
                            {billSummary.dueDate && billSummary.dueDate !== "N/A" && (
                              <div className="flex justify-between items-center px-5 py-4 border-b border-gray-100">
                                <span className="text-gray-500 text-sm">Due Date</span>
                                <span className="font-semibold text-gray-800">{billSummary.dueDate}</span>
                              </div>
                            )}
                            {billSummary.billPeriod && (
                              <div className="flex justify-between items-center px-5 py-4 border-b border-gray-100">
                                <span className="text-gray-500 text-sm">Bill Period</span>
                                <span className="font-semibold text-gray-800">{billSummary.billPeriod}</span>
                              </div>
                            )}
                            {(billSummary.minPay || billSummary.maxPay) && (
                              <div className="flex justify-between items-center px-5 py-4 border-b border-gray-100">
                                <span className="text-gray-500 text-sm">Pay Range</span>
                                <span className="font-semibold text-gray-800">
                                  ₹{parseFloat(billSummary.minPay || 0).toFixed(0)} – ₹{parseFloat(billSummary.maxPay || 0).toFixed(0)}
                                </span>
                              </div>
                            )}
                            <div className="flex justify-between items-center px-5 py-4 border-b border-gray-100">
                              <span className="text-gray-500 text-sm">Status</span>
                              <span className={`text-xs font-bold px-3 py-1 rounded-full ${(billSummary.status || "").toUpperCase() === "UNPAID" ? "bg-red-100 text-red-600" : "bg-green-100 text-green-600"}`}>
                                {(billSummary.status || "UNPAID").toUpperCase()}
                              </span>
                            </div>
                            {/* ── Pay Amount row — inside bill summary card ── */}
                            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center px-5 py-4 gap-3">
                              <div>
                                <span className="text-gray-500 text-sm block">Pay Amount</span>
                                {billData.partial_pay !== "Y" && billData.bill_presentment === "Y" && billAmount && (
                                  <span className="text-[11px] text-gray-400 block">Exact amount only</span>
                                )}
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="text-[#fd561e] font-bold text-lg">₹</span>
                                <input type="number"
                                  min={amountConstraints.min || parseFloat(billSummary?.minPay || 1)}
                                  step="0.01"
                                  max={amountConstraints.max || parseFloat(billSummary?.maxPay || undefined) || undefined}
                                  readOnly={amountConstraints.readOnly && billData.partial_pay !== "Y"}
                                  className={`border border-orange-300 rounded-lg px-3 py-2 text-base font-bold w-36 focus:ring-2 focus:ring-[#fd561e] outline-none bg-white text-[#fd561e] text-right ${amountConstraints.readOnly && billData.partial_pay !== "Y" ? "cursor-not-allowed bg-gray-50" : ""}`}
                                  placeholder="Enter amount"
                                  value={totalPayable}
                                  onChange={(e) => setTotalPayable(e.target.value)} />
                              </div>
                            </div>
                          </div>
                        )}

                        {/* No bill returned (online_validation=N) — just amount input */}
                        {(!billSummary || !billSummary.billNumber) && (
                          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center px-4 sm:px-5 py-4 bg-orange-50 rounded-xl border border-orange-100 gap-3">
                            <div>
                              <span className="font-bold text-gray-800 text-base block">Total Amount</span>
                            </div>
                            <div className="flex items-center gap-2 w-full sm:w-auto">
                              <span className="text-[#fd561e] font-bold text-lg">₹</span>
                              <input type="number"
                                min={amountConstraints.min || 1}
                                step="0.01"
                                max={amountConstraints.max || undefined}
                                readOnly={amountConstraints.readOnly && billData.partial_pay !== "Y"}
                                className={`border border-orange-300 rounded-lg px-3 py-2 text-base font-bold w-full sm:w-36 focus:ring-2 focus:ring-[#fd561e] outline-none bg-white text-[#fd561e] text-right`}
                                placeholder="Enter amount" value={totalPayable}
                                onChange={(e) => setTotalPayable(e.target.value)} />
                            </div>
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </>
              )}

              {isMobilePrepaid(billData) && selectedPlan && (
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 mb-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-bold text-gray-700">Selected Plan Amount</p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {selectedPlan.plan_category_name || selectedPlan.planCategoryName || ""} •{" "}
                        {selectedPlan.plan_validity || selectedPlan.planValidity || ""}
                      </p>
                    </div>
                    <p className="text-2xl font-bold text-[#fd561e]">₹{parseFloat(totalPayable || 0).toFixed(0)}</p>
                  </div>
                </div>
              )}

              {/* Customer details — additionalInfo mode లో ఈ card వద్దు (above లో merged) */}
              {additionalInfo.length === 0 && (
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 mb-4">
                <div className="flex items-center justify-between gap-3 mb-5">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-[#fd561e] text-white flex items-center justify-center text-sm font-bold">
                      {isMultiMode && billList.length > 0 ? 3 : billList.length > 1 ? 3 : 2}
                    </div>
                    <span className="text-sm font-bold uppercase text-gray-700 tracking-wide">Customer Details</span>
                  </div>
                  <button type="button" onClick={() => setIsEditingUser(!isEditingUser)}
                    className="text-xs text-[#fd561e] cursor-pointer font-semibold hover:underline">
                    {isEditingUser ? "Save" : "Edit"}
                  </button>
                </div>
                {isEditingUser ? (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="sm:col-span-3">
                      <label className="block text-xs text-gray-500 uppercase font-semibold mb-1">Full Name</label>
                      <input type="text" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#fd561e] focus:border-[#fd561e] outline-none bg-gray-50 text-sm"
                        value={userDetails.name} onChange={(e) => setUserDetails((p) => ({ ...p, name: e.target.value }))} />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 uppercase font-semibold mb-1">Mobile</label>
                      <input type="tel" maxLength="10" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#fd561e] focus:border-[#fd561e] outline-none bg-gray-50 text-sm"
                        value={userDetails.mobile} onChange={(e) => setUserDetails((p) => ({ ...p, mobile: e.target.value }))} />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-xs text-gray-500 uppercase font-semibold mb-1">Email</label>
                      <input type="email" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#fd561e] focus:border-[#fd561e] outline-none bg-gray-50 text-sm"
                        value={userDetails.email} onChange={(e) => setUserDetails((p) => ({ ...p, email: e.target.value }))} />
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {[
                      { label: "Name",   value: userDetails.name },
                      { label: "Mobile", value: userDetails.mobile },
                      { label: "Email",  value: userDetails.email },
                    ].map(({ label, value }) => (
                      <div key={label} className="flex sm:block items-center justify-between border-b sm:border-b-0 border-gray-100 pb-3 sm:pb-0">
                        <p className="text-xs text-gray-500 uppercase font-semibold">{label}</p>
                        <p className="font-bold text-gray-800 text-sm break-all mt-0 sm:mt-1">{value || "—"}</p>
                      </div>
                    ))}
                  </div>
                )}
                <div className="flex justify-between mt-6 gap-3">
                  <button type="button" onClick={() => setStep(1)}
                    className="px-5 py-2 cursor-pointer rounded-xl border border-gray-300 text-gray-600 text-sm font-semibold hover:bg-gray-50 transition-all">
                    ← Edit Details
                  </button>
                  <button type="button" onClick={handleProceedToPayment}
                    className="bg-[#fd561e] text-white px-8 py-3 rounded-xl font-semibold shadow-lg hover:scale-105 transition-all duration-300 cursor-pointer inline-flex items-center gap-2">
                    Proceed to Payment →
                  </button>
                </div>
              </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BillDetails;