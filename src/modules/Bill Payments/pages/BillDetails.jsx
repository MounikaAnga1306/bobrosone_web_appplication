import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const BillDetails = () => {
  const navigate = useNavigate();
  const [billData, setBillData] = useState(null);
  const [authenticators, setAuthenticators] = useState([]);
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(false);
  const [fetchingBill, setFetchingBill] = useState(false);
  const [billAmount, setBillAmount] = useState(null);
  const [totalPayable, setTotalPayable] = useState('');
  const [customerDetails, setCustomerDetails] = useState(null);
  const [step, setStep] = useState(1);
  const [validationError, setValidationError] = useState(false);
  const [validationErrorMsg, setValidationErrorMsg] = useState('');
  const [billSummary, setBillSummary] = useState(null);
  const [amountError, setAmountError] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState('');
  const [upiId, setUpiId] = useState('');
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [upiError, setUpiError] = useState('');

  useEffect(() => {
    const storedData = localStorage.getItem('billData');
    if (storedData) {
      const data = JSON.parse(storedData);
      setBillData(data);
      if (data.authenticators && Array.isArray(data.authenticators)) {
        setAuthenticators(data.authenticators);
        const initialFormData = {};
        data.authenticators.forEach((field) => {
          const paramName = field.parameter_name || '';
          const safeFieldName = paramName.replace(/\s+/g, '_');
          initialFormData[safeFieldName] = '';
          initialFormData[`original_param_name_${safeFieldName}`] = paramName;
        });
        setFormData(initialFormData);
      }
    } else {
      navigate('/BillHomePage');
    }
  }, [navigate]);

  const handleInputChange = (fieldName, value) => {
    setFormData(prev => ({ ...prev, [fieldName]: value }));
  };

  const handleFetchBill = async (e) => {
    e.preventDefault();
    if (!e.target.checkValidity()) { e.target.reportValidity(); return; }
    setFetchingBill(true);
    setValidationError(false);
    setValidationErrorMsg('');
    try {
      const payload = {
        billerid: billData?.billerid,
        customerDetails: {
          name: customerDetails?.name || '',
          mobile: customerDetails?.mobile || '',
          email: customerDetails?.email || '',
        },
        authenticatorValues: formData,
      };
      const response = await axios.post('/bill/validate-payment', payload);

      if (response.data?.success) {
        const rawData = response.data.data || response.data;
        const nestedData = rawData.data || rawData;

        let billDetails = null;
        if (nestedData.billlist && Array.isArray(nestedData.billlist) && nestedData.billlist.length > 0) {
          billDetails = nestedData.billlist[0];
        }
        if (!billDetails) throw new Error("No bill details found in response");

        // ✅ Correct API field names
        const amount =
          billDetails?.billamount ||
          billDetails?.net_billamount ||
          billDetails?.bill_amount ||
          billDetails?.amount ||
          billDetails?.totalAmount ||
          billDetails?.dueAmount ||
          null;

        const billNumber =
          billDetails?.billnumber ||
          billDetails?.bill_number ||
          billDetails?.billNumber ||
          billDetails?.referenceId ||
          'N/A';

        const dueDate =
          billDetails?.billduedate ||
          billDetails?.due_date ||
          billDetails?.dueDate ||
          'N/A';

        const billPeriod =
          billDetails?.billperiod ||
          billDetails?.billPeriod ||
          null;

        const status =
          billDetails?.billstatus ||
          billDetails?.status ||
          billDetails?.bill_status ||
          'Pending';

        const validationId = nestedData?.validationid || nestedData?.validationId || '';
        const validationDate = nestedData?.validation_date || nestedData?.validationDate || '';
        const customerId = nestedData?.customerid || '';

        if (!amount) {
          setValidationError(true);
          setValidationErrorMsg("Bill amount not found. Please try again.");
          setFetchingBill(false);
          return;
        }

        // Safe parseFloat - fix NaN
        const convFee = parseFloat(billData?.customer_conv_fee) || 0;
        const parsedAmt = parseFloat(amount) || 0;
        const total = parsedAmt > 0 ? (parsedAmt + convFee).toFixed(2) : '';

        // Always use user-entered name, not biller's customer_name
        const customerMobile =
          billDetails?.mobile ||
          billDetails?.customer_mobile ||
          nestedData?.customerid ||
          customerDetails?.mobile || '';

        const customerEmail = billDetails?.email || customerDetails?.email || '';

        setBillAmount(amount);
        setTotalPayable(total);
        setBillSummary({
          billNumber, dueDate, billPeriod, status,
          mobile: customerMobile, email: customerEmail,
          validationId, validationDate, customerId,
        });
        // Keep user's entered details intact
        setCustomerDetails(prev => ({
          ...prev,
          name: prev?.name || '',
          mobile: prev?.mobile || customerMobile,
          email: prev?.email || customerEmail,
          dueDate, billNumber,
        }));
        setStep(2);
      } else {
        setValidationError(true);
        setValidationErrorMsg(
          response.data?.error?.message ||
          response.data?.message ||
          "Unable to validate your bill. Please try again later."
        );
      }
    } catch (error) {
      setValidationError(true);
      setValidationErrorMsg(
        error.response?.data?.error?.message ||
        error.response?.data?.message ||
        error.response?.data?.detail?.message ||
        "Unable to validate your bill. Please try again later."
      );
    } finally {
      setFetchingBill(false);
    }
  };

  // Lock body scroll when any modal is open
  useEffect(() => {
    if (amountError || showPaymentModal) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [amountError, showPaymentModal]);

  const handlePayment = () => {
    if (!totalPayable || parseFloat(totalPayable) <= 0) {
      setAmountError(true);
      return;
    }
    // Open payment method modal
    setSelectedMethod('');
    setUpiId('');
    setUpiError('');
    setShowPaymentModal(true);
  };

  const handlePay = async () => {
    if (!selectedMethod) return;
    if (selectedMethod === 'UPI') {
      if (!upiId.trim()) {
        setUpiError('Please enter your UPI ID');
        return;
      }
      if (!/^[a-zA-Z0-9._-]+@[a-zA-Z0-9]+$/.test(upiId.trim())) {
        setUpiError('Please enter a valid UPI ID (e.g. name@bank)');
        return;
      }
    }
    setPaymentLoading(true);
    try {
      // ✅ Bus booking లో exact same pattern use చేస్తున్నాం
      const API_BASE = import.meta.env.VITE_API_BASE_URL || "";
      const payload = {
        fare: totalPayable,
        uid: customerDetails?.mobile || '',
        pname: customerDetails?.name || '',
        tickid: `${billSummary?.billNumber || 'BILL'}_${Date.now()}`,
      };

      const response = await fetch(`${API_BASE}/billdesk/order`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      console.log("BillDesk order response:", data);

      if (data && data.success !== false && data.authToken && data.bdorderid) {
        // ✅ Bus booking లో exact same redirect — window.location.href
        window.location.href = `https://uat.bobros.co.in/billdesk_checkout.php?merchantId=HYDBOBROS&bdorderid=${data.bdorderid}&authToken=${encodeURIComponent(data.authToken)}`;
      } else {
        alert(data?.message || data?.errorDesc || 'Payment initiation failed. Please try again.');
        setPaymentLoading(false);
      }

    } catch (error) {
      console.error('Payment error:', error);
      alert('Error processing payment. Please try again.');
      setPaymentLoading(false);
    }
  }


  if (!billData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#fd561e] mx-auto"></div>
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
              <polygon points="32,4 60,56 4,56" fill="#FCD34D" stroke="#F59E0B" strokeWidth="2" strokeLinejoin="round"/>
              <text x="32" y="48" textAnchor="middle" fontSize="30" fontWeight="bold" fill="#92400E">!</text>
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-[#fd561e] mb-3">Validation Failed</h2>
          <p className="text-gray-500 text-sm mb-8 max-w-sm mx-auto leading-relaxed">{validationErrorMsg}</p>
          <button
            onClick={() => { setValidationError(false); setValidationErrorMsg(''); }}
            className="bg-[#fd561e] text-white cursor-pointer px-8 py-3 rounded-xl font-semibold hover:bg-[#e04010] transition-all duration-200 inline-flex items-center gap-2"
          >
            <span>←</span> Go Back
          </button>
        </div>
      </div>
    );
  }

  const BillerInfoCard = () => (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden h-full">
      <div className="p-6 text-center border-b border-gray-100">
        <div className="w-20 h-20 rounded-2xl bg-orange-50 border border-[#fd561e] flex items-center justify-center mx-auto mb-4">
          {billData.biller_logo ? (
            <img src={billData.biller_logo} alt={billData.biller} className="w-14 h-14 object-contain" onError={(e) => e.target.style.display = 'none'} />
          ) : (
            <i className="fa-solid fa-building text-3xl text-[#fd561e]"></i>
          )}
        </div>
        <h4 className="font-bold text-lg">{billData.biller}</h4>
        <span className="inline-block text-xs font-semibold text-[#fd561e] border border-[#fd561e] bg-orange-50 px-3 py-1 rounded-full mt-2">
          {billData.category1 || 'Utility'}
        </span>
        <p className="text-sm text-gray-500 mt-3">
          {billSummary
            ? "Your bill details have been fetched. Review and proceed with secure payment."
            : "Enter the required details to fetch your bill and proceed with a secure payment."}
        </p>
      </div>
      <div className="p-4 space-y-1">
        {billSummary ? (
          <>
            {billSummary.validationId && (
              <div className="flex justify-between text-sm py-2 border-b border-gray-100">
                <span className="text-gray-500">Validation ID</span>
                <span className="font-semibold text-xs text-right max-w-[150px] break-all">{billSummary.validationId}</span>
              </div>
            )}
            {billSummary.customerId && (
              <div className="flex justify-between text-sm py-2 border-b border-gray-100">
                <span className="text-gray-500">Customer ID</span>
                <span className="font-semibold">{billSummary.customerId}</span>
              </div>
            )}
            {billSummary.validationDate && (
              <div className="flex justify-between text-sm py-2 border-b border-gray-100">
                <span className="text-gray-500">Date</span>
                <span className="font-semibold">{billSummary.validationDate}</span>
              </div>
            )}
            <div className="flex justify-between text-sm py-2 border-b border-gray-100">
              <span className="text-gray-500">Network</span>
              <span className="font-semibold">Bharat Connect</span>
            </div>
            <div className="flex justify-between text-sm py-2">
              <span className="text-gray-500">Payment modes</span>
              <span className="font-semibold">UPI · Card · Net banking</span>
            </div>
          </>
        ) : (
          <>
            <div className="flex justify-between text-sm py-2 border-b border-gray-100">
              <span className="text-gray-500">Category</span>
              <span className="font-semibold">{billData.category1 || '—'}</span>
            </div>
            <div className="flex justify-between text-sm py-2 border-b border-gray-100">
              <span className="text-gray-500">Network</span>
              <span className="font-semibold">Bharat Connect</span>
            </div>
            <div className="flex justify-between text-sm py-2">
              <span className="text-gray-500">Payment modes</span>
              <span className="font-semibold">UPI · Card · Net banking</span>
            </div>
          </>
        )}
      </div>
      <div className="bg-green-50 p-4 flex items-center gap-2 text-sm font-semibold text-green-700 border-t border-green-200">
        <i className="fa-solid fa-circle-check text-green-500"></i>
        Verified & secured by Bharat BillPay
      </div>
    </div>
  );

  return (
    <div className="bg-white">

      {/* ✅ Amount Error Popup */}
      {amountError && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4" onClick={(e) => e.stopPropagation()}>
          <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-sm w-full text-center animate-fade-in">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center">
                <svg className="w-9 h-9 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                </svg>
              </div>
            </div>
            <h3 className="text-lg font-bold text-gray-800 mb-2">Payment Amount Required</h3>
            <p className="text-gray-500 text-sm mb-6 leading-relaxed">
              Unable to determine the payment amount. Please enter the total payable amount to continue.
            </p>
            <button
              onClick={() => setAmountError(false)}
              className="w-full bg-[#fd561e] text-white py-3 rounded-xl font-semibold hover:bg-[#e04010] transition-all duration-200"
            >
              OK, Got it
            </button>
          </div>
        </div>
      )}

      {/* ✅ Payment Method Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 px-0 sm:px-4">
          <div className="bg-white w-full sm:max-w-md rounded-t-3xl sm:rounded-2xl shadow-2xl overflow-hidden">
            {/* Header */}
            <div className="flex items-center gap-3 px-6 pt-6 pb-4 border-b border-gray-100">
              <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4 text-[#fd561e]" viewBox="0 0 24 24" fill="currentColor">
                  <rect x="2" y="5" width="20" height="14" rx="2" fill="currentColor" opacity="0.2"/>
                  <path d="M22 9H2V7a2 2 0 012-2h16a2 2 0 012 2v2zm0 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2v-8h20z"/>
                </svg>
              </div>
              <h3 className="text-lg font-bold text-gray-800">Select Payment Method</h3>
            </div>

            {/* Payment Methods */}
            <div className="px-6 py-4 space-y-3 max-h-[60vh] overflow-y-auto">
              {[
                { id: 'BankAccount', label: 'BankAccount', icon: (
                  <svg className="w-5 h-5 text-[#fd561e]" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M3 7l9-4 9 4v2H3V7zm2 3h2v7H5v-7zm4 0h2v7H9v-7zm4 0h2v7h-2v-7zm4 0h2v7h-2v-7zM3 19h18v2H3v-2z"/>
                  </svg>
                )},
                { id: 'CreditCard', label: 'CreditCard', icon: (
                  <svg className="w-5 h-5 text-[#fd561e]" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M20 4H4a2 2 0 00-2 2v12a2 2 0 002 2h16a2 2 0 002-2V6a2 2 0 00-2-2zm0 4H4V8h16v.01zM4 18v-6h16v6H4z"/>
                  </svg>
                )},
                { id: 'DebitCard', label: 'DebitCard', icon: (
                  <svg className="w-5 h-5 text-[#fd561e]" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M20 4H4a2 2 0 00-2 2v12a2 2 0 002 2h16a2 2 0 002-2V6a2 2 0 00-2-2zm0 4H4V8h16v.01zM4 18v-6h16v6H4z"/>
                  </svg>
                )},
                { id: 'UPI', label: 'UPI', icon: (
                  <svg className="w-5 h-5 text-[#fd561e]" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M4 4h4v4H4zm6 0h4v4h-4zm6 0h4v4h-4zM4 10h4v4H4zm6 0h4v4h-4zm6 0h4v4h-4zM4 16h4v4H4zm6 0h4v4h-4zm6 0h4v4h-4z"/>
                  </svg>
                )},
              ].map((method) => (
                <button
                  key={method.id}
                  onClick={() => { setSelectedMethod(method.id); setUpiId(''); setUpiError(''); }}
                  className={`w-full flex items-center justify-between px-4 py-4 rounded-xl border-2 transition-all duration-200 ${
                    selectedMethod === method.id
                      ? 'border-[#fd561e] bg-orange-50'
                      : 'border-gray-200 bg-white hover:border-orange-200'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-orange-50 flex items-center justify-center">
                      {method.icon}
                    </div>
                    <span className="font-semibold text-gray-800">{method.label}</span>
                  </div>
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                    selectedMethod === method.id ? 'border-[#fd561e]' : 'border-gray-300'
                  }`}>
                    {selectedMethod === method.id && (
                      <div className="w-2.5 h-2.5 rounded-full bg-[#fd561e]"></div>
                    )}
                  </div>
                </button>
              ))}

              {/* UPI ID Input — only when UPI selected */}
              {selectedMethod === 'UPI' && (
                <div className="mt-1">
                  <input
                    type="text"
                    className={`w-full px-4 py-3 border-2 rounded-xl outline-none text-sm transition-all ${
                      upiError ? 'border-red-400 bg-red-50' : 'border-orange-300 focus:border-[#fd561e] bg-white'
                    }`}
                    placeholder="Enter UPI ID (example@bank)"
                    value={upiId}
                    onChange={(e) => { setUpiId(e.target.value); setUpiError(''); }}
                  />
                  {upiError && <p className="text-red-500 text-xs mt-1 ml-1">{upiError}</p>}
                </div>
              )}

              {/* Amount Summary — shows after method selected */}
              {selectedMethod && (
                <div className="bg-gray-50 rounded-xl p-4 mt-2 border border-gray-200">
                  <div className="flex justify-between text-sm text-gray-600 mb-2">
                    <span>Amount</span>
                    <span>₹{parseFloat(billAmount || 0).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm text-gray-600 mb-3 pb-3 border-b border-gray-200">
                    <span>Convenience Fee</span>
                    <span>₹{(parseFloat(billData?.customer_conv_fee) || 0).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between font-bold text-gray-800">
                    <span>Total Payable</span>
                    <span>₹{parseFloat(totalPayable || 0).toFixed(2)}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Action Buttons */}
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
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="white" strokeWidth="4"/>
                        <path className="opacity-75" fill="white" d="M4 12a8 8 0 018-8v8H4z"/>
                      </svg>
                      Processing...
                    </span>
                  ) : (
                    `Pay ₹${parseFloat(totalPayable || 0).toFixed(2)}`
                  )}
                </button>
              )}
              <button
                onClick={() => setShowPaymentModal(false)}
                className="w-full bg-gray-100 text-gray-600 py-3 rounded-2xl font-semibold hover:bg-gray-200 transition-all duration-200"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-12">

        {/* Breadcrumb */}
        <div className="text-sm text-gray-500 mb-4 flex items-center gap-2">
          <a href="/BillHomePage" className="hover:text-[#fd561e]">Home</a>
          <span>›</span>
          <span>{billData.category || 'Utility'}</span>
          <span>›</span>
          <span className="text-[#fd561e] font-semibold">{billData.biller}</span>
        </div>

        {/* Step Bar */}
        <div className="bg-white rounded-2xl border border-gray-200 p-4 sm:p-6 mb-5 shadow-sm">
          <div className="flex items-center justify-between">
            {[
              { num: 1, label: 'Account details', sub: 'Fill customer info' },
              { num: 2, label: 'Fetch bill', sub: 'Retrieve amount' },
              { num: 3, label: 'Review & pay', sub: 'Confirm payment' },
              { num: 4, label: 'Confirmation', sub: 'Receipt & points' },
            ].map((s, i, arr) => (
              <div key={s.num} className="flex items-center flex-1">
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center font-bold text-sm sm:text-base ${step > s.num ? 'bg-[#fd561e] text-white' : step === s.num ? 'bg-[#fd561e] text-white' : 'bg-gray-200 text-gray-500'}`}>
                    {step > s.num ? '✓' : s.num}
                  </div>
                  <div className="hidden sm:block">
                    <div className="font-semibold text-sm">{s.label}</div>
                    <div className="text-xs text-gray-500">{s.sub}</div>
                  </div>
                </div>
                {i < arr.length - 1 && (
                  <div className={`flex-1 h-0.5 mx-2 sm:mx-4 ${step > s.num ? 'bg-[#fd561e]' : 'bg-gray-200'}`}></div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Mobile: Biller card */}
        <div className="lg:hidden mb-5">
          <BillerInfoCard />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 items-start">
          {/* Desktop Sidebar */}
          <div className="hidden lg:block lg:col-span-1 sticky top-24 self-start">
            <BillerInfoCard />
          </div>

          {/* Main Panel */}
          <div className="lg:col-span-2">
            {!billAmount ? (
              // ── STEP 1: Enter Details Form ──
              <form onSubmit={handleFetchBill}>
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 mb-4">
                  <div className="flex items-center gap-3 mb-5 pb-3 border-b border-gray-100">
                    <div className="w-7 h-7 rounded-full bg-[#fd561e] text-white flex items-center justify-center text-xs font-bold">1</div>
                    <span className="text-xs font-bold uppercase text-gray-600">Account Identifier</span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {authenticators.map((auth, index) => {
                      const paramName = auth.parameter_name || '';
                      const safeFieldName = paramName.replace(/\s+/g, '_');
                      const label = paramName || safeFieldName;
                      const optional = auth.optional === 'Y';
                      const regex = auth.regex || '';
                      const listOfValues = auth.list_of_values;
                      return (
                        <div key={index}>
                          <label className="block text-sm font-semibold text-gray-700 mb-1">
                            {label} {!optional && <span className="text-[#fd561e]">*</span>}
                          </label>
                          {listOfValues && Array.isArray(listOfValues) && listOfValues.length > 0 ? (
                            <select
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#fd561e] focus:border-[#fd561e] outline-none transition bg-gray-50"
                              required={!optional}
                              value={formData[safeFieldName] || ''}
                              onChange={(e) => handleInputChange(safeFieldName, e.target.value)}
                            >
                              <option value="">Select {label}</option>
                              {listOfValues.map((item, idx) => (
                                <option key={idx} value={item.value || item}>{item.name || item.value || item}</option>
                              ))}
                            </select>
                          ) : (
                            <input
                              type="text"
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#fd561e] focus:border-[#fd561e] outline-none transition bg-gray-50"
                              placeholder={`Enter your ${label.toLowerCase()}`}
                              required={!optional}
                              pattern={regex || undefined}
                              value={formData[safeFieldName] || ''}
                              onChange={(e) => handleInputChange(safeFieldName, e.target.value)}
                            />
                          )}
                          <span className="text-xs text-[#fd561e] mt-1 flex items-center gap-1">
                            <i className="fa-solid fa-circle-info"></i> Find this on your previous bill
                          </span>
                        </div>
                      );
                    })}
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
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#fd561e] focus:border-[#fd561e] outline-none transition bg-gray-50"
                        required pattern="[A-Za-z\s]{3,}" title="Enter valid full name (minimum 3 letters, only alphabets)"
                        value={customerDetails?.name || ''} onChange={(e) => setCustomerDetails(prev => ({ ...prev, name: e.target.value }))} />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">Mobile Number <span className="text-[#fd561e]">*</span></label>
                      <input type="tel"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#fd561e] focus:border-[#fd561e] outline-none transition bg-gray-50"
                        required maxLength="10" pattern="[6-9]\d{9}" title="Enter valid 10-digit mobile number starting with 6-9"
                        value={customerDetails?.mobile || ''} onChange={(e) => setCustomerDetails(prev => ({ ...prev, mobile: e.target.value }))} />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">Email Address <span className="text-[#fd561e]">*</span></label>
                      <input type="email"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#fd561e] focus:border-[#fd561e] outline-none transition bg-gray-50"
                        required pattern="^[^\s@]+@[^\s@]+\.[^\s@]+$" title="Enter valid email address"
                        value={customerDetails?.email || ''} onChange={(e) => setCustomerDetails(prev => ({ ...prev, email: e.target.value }))} />
                      <span className="text-xs text-[#fd561e] mt-1 flex items-center gap-1">
                        <i className="fa-solid fa-circle-info"></i> Payment receipt will be sent here
                      </span>
                    </div>
                  </div>
                  {billData.billerConsent && (
                    <div className="mt-4 p-3 bg-orange-50 border-l-4 border-[#fd561e] rounded-lg text-sm text-gray-700">{billData.billerConsent}</div>
                  )}
                  <div className="text-center mt-6">
                    <button type="submit" disabled={fetchingBill}
                      className="bg-[#fd561e] cursor-pointer text-white px-8 py-3 rounded-xl font-semibold shadow-lg hover:scale-105 transition-all duration-300 disabled:opacity-50">
                      {fetchingBill ? "Fetching..." : "Continue →"}
                    </button>
                  </div>
                </div>
              </form>
            ) : (
              // ── STEP 2: Bill Summary (matches screenshot) ──
              <>
                {/* Bill Summary Card */}
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 mb-4">
                  <div className="flex items-center gap-3 mb-5">
                    <div className="w-8 h-8 rounded-full bg-[#fd561e] text-white flex items-center justify-center text-sm font-bold">1</div>
                    <span className="text-sm font-bold uppercase text-gray-700 tracking-wide">Bill Summary</span>
                  </div>

                  <div className="border border-gray-200 rounded-xl overflow-hidden mb-4">
                    <div className="flex justify-between items-center px-5 py-4 border-b border-gray-100">
                      <span className="text-gray-500 text-sm">Bill Number</span>
                      <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full border-2 border-[#fd561e] bg-white inline-block"></span>
                        <span className="font-semibold text-gray-800">{billSummary?.billNumber || 'N/A'}</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center px-5 py-4 border-b border-gray-100">
                      <span className="text-gray-500 text-sm">Bill Amount</span>
                      <span className="font-bold text-[#fd561e] text-base">₹{parseFloat(billAmount).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center px-5 py-4 border-b border-gray-100">
                      <span className="text-gray-500 text-sm">Due Date</span>
                      <span className="font-semibold text-gray-800">{billSummary?.dueDate || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between items-center px-5 py-4">
                      <span className="text-gray-500 text-sm">Status</span>
                      <span className={`text-xs font-bold px-3 py-1 rounded-full ${
                        (billSummary?.status || '').toUpperCase() === 'UNPAID'
                          ? 'bg-red-100 text-red-600'
                          : 'bg-green-100 text-green-600'
                      }`}>
                        {(billSummary?.status || 'UNPAID').toUpperCase()}
                      </span>
                    </div>
                  </div>

                  {/* Total Amount — mobile responsive */}
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center px-4 sm:px-5 py-4 bg-orange-50 rounded-xl border border-orange-100 mt-1 gap-3">
                    <span className="font-bold text-gray-800 text-base">Total Amount</span>
                    <div className="flex items-center gap-2 w-full sm:w-auto">
                      <span className="text-[#fd561e] font-bold text-lg">₹</span>
                      <input
                        type="number" min="1" step="0.01"
                        className="border border-orange-300 rounded-lg px-3 py-2 text-base font-bold w-full sm:w-36 focus:ring-2 focus:ring-[#fd561e] outline-none bg-white text-[#fd561e] text-right"
                        placeholder="Enter amount"
                        value={totalPayable}
                        onChange={(e) => setTotalPayable(e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                {/* Customer Details Card */}
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 mb-4">
                  <div className="flex items-center gap-3 mb-5">
                    <div className="w-8 h-8 rounded-full bg-[#fd561e] text-white flex items-center justify-center text-sm font-bold">2</div>
                    <span className="text-sm font-bold uppercase text-gray-700 tracking-wide">Customer Details</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="flex sm:block items-center justify-between border-b sm:border-b-0 border-gray-100 pb-3 sm:pb-0">
                      <p className="text-xs text-gray-500 uppercase font-semibold">Name</p>
                      <p className="font-bold text-gray-800 text-sm sm:text-base mt-0 sm:mt-1">{customerDetails?.name || 'N/A'}</p>
                    </div>
                    <div className="flex sm:block items-center justify-between border-b sm:border-b-0 border-gray-100 pb-3 sm:pb-0">
                      <p className="text-xs text-gray-500 uppercase font-semibold">Mobile</p>
                      <p className="font-bold text-gray-800 text-sm sm:text-base mt-0 sm:mt-1">{customerDetails?.mobile || billSummary?.mobile || 'N/A'}</p>
                    </div>
                    <div className="flex sm:block items-center justify-between">
                      <p className="text-xs text-gray-500 uppercase font-semibold">Email</p>
                      <p className="font-bold text-gray-800 text-sm break-all mt-0 sm:mt-1">{customerDetails?.email || billSummary?.email || 'N/A'}</p>
                    </div>
                  </div>

                  <div className="text-right mt-6">
                    <button
                      onClick={handlePayment}
                      disabled={loading}
                      className="bg-[#fd561e] text-white px-8 py-3 rounded-xl font-semibold shadow-lg hover:scale-105 transition-all duration-300 disabled:opacity-50 inline-flex items-center gap-2 cursor-pointer"
                    >
                      {loading ? "Processing..." : <>Proceed to Payment <span>→</span></>}
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