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
  const [customerDetails, setCustomerDetails] = useState(null);
  const [step, setStep] = useState(1);
  const [validationError, setValidationError] = useState(false);
  const [validationErrorMsg, setValidationErrorMsg] = useState('');

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
    if (!e.target.checkValidity()) {
      e.target.reportValidity();
      return;
    }
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
      console.log("Validate Payload:", payload);
      const response = await axios.post('/bill/validate-payment', payload);
      console.log("Validate Response:", response.data);

      if (response.data?.success) {
        const data = response.data.data;
        setBillAmount(
          data?.amount || data?.billAmount || data?.dueAmount ||
          data?.Bill_Amount || data?.totalAmount || ''
        );
        setCustomerDetails(prev => ({
          ...prev,
          name: data?.customerName || data?.customer_name || prev?.name || '',
          mobile: data?.mobile || data?.mobileNumber || prev?.mobile || '',
          email: data?.email || prev?.email || '',
          dueDate: data?.dueDate || data?.due_date || data?.DueDate || '',
          billNumber: data?.billNumber || data?.bill_number || data?.referenceId || data?.BillNumber || '',
        }));
        setValidationError(false);
        setStep(2);
      } else {
        setValidationError(true);
        setValidationErrorMsg(
          response.data?.error?.message ||
          response.data?.message ||
          "Unable to validate your bill at the moment. Please try again later."
        );
      }
    } catch (error) {
      console.error("Error:", error);
      setValidationError(true);
      setValidationErrorMsg(
        error.response?.data?.error?.message ||
        error.response?.data?.message ||
        error.response?.data?.detail?.message ||
        "Unable to validate your bill at the moment. Please try again later."
      );
    } finally {
      setFetchingBill(false);
    }
  };

  const handlePayment = async () => {
    setLoading(true);
    try {
      console.log("Proceeding to payment with:", {
        billerid: billData?.billerid,
        amount: billAmount,
        customerDetails,
      });
      setStep(3);
    } catch (error) {
      console.error("Payment error:", error);
      alert("Error processing payment. Please try again.");
    } finally {
      setLoading(false);
    }
  };

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
          <p className="text-gray-500 text-sm mb-8 max-w-sm mx-auto leading-relaxed">
            {validationErrorMsg}
          </p>
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

  // ✅ Reusable biller info card content
  const BillerInfoCard = () => (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="p-6 text-center border-b border-gray-100">
        <div className="w-20 h-20 rounded-2xl bg-orange-50 border border-[#fd561e] flex items-center justify-center mx-auto mb-4">
          {billData.biller_logo ? (
            <img
              src={billData.biller_logo}
              alt={billData.biller}
              className="w-14 h-14 object-contain"
              onError={(e) => e.target.style.display = 'none'}
            />
          ) : (
            <i className="fa-solid fa-building text-3xl text-[#fd561e]"></i>
          )}
        </div>
        <h4 className="font-bold text-lg">{billData.biller}</h4>
        <span className="inline-block text-xs font-semibold text-[#fd561e] border border-[#fd561e] bg-orange-50 px-3 py-1 rounded-full mt-2">
          {billData.category1 || 'Utility'}
        </span>
        <p className="text-sm text-gray-500 mt-3">
          Enter the required details to fetch your bill and proceed with a secure payment.
        </p>
      </div>
      <div className="p-4 space-y-3">
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
      </div>
      <div className="bg-green-50 p-4 flex items-center gap-2 text-sm font-semibold text-green-700 border-t border-green-200">
        <i className="fa-solid fa-circle-check text-green-500"></i>
        Verified & secured by Bharat BillPay
      </div>
    </div>
  );

  return (
    <div className="bg-white">
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
            <div className="flex items-center gap-2 sm:gap-3">
              <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center font-bold text-sm sm:text-base ${step >= 1 ? 'bg-[#fd561e] text-white' : 'bg-gray-200 text-gray-500'}`}>
                {step > 1 ? '✓' : '1'}
              </div>
              <div className="hidden sm:block">
                <div className="font-semibold text-sm">Account details</div>
                <div className="text-xs text-gray-500">Fill customer info</div>
              </div>
            </div>
            <div className={`flex-1 h-0.5 mx-2 sm:mx-4 ${step >= 2 ? 'bg-[#fd561e]' : 'bg-gray-200'}`}></div>

            <div className="flex items-center gap-2 sm:gap-3">
              <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center font-bold text-sm sm:text-base ${step >= 2 ? 'bg-[#fd561e] text-white' : 'bg-gray-200 text-gray-500'}`}>
                {step > 2 ? '✓' : '2'}
              </div>
              <div className="hidden sm:block">
                <div className="font-semibold text-sm">Fetch bill</div>
                <div className="text-xs text-gray-500">Retrieve amount</div>
              </div>
            </div>
            <div className={`flex-1 h-0.5 mx-2 sm:mx-4 ${step >= 3 ? 'bg-[#fd561e]' : 'bg-gray-200'}`}></div>

            <div className="flex items-center gap-2 sm:gap-3">
              <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center font-bold text-sm sm:text-base ${step >= 3 ? 'bg-[#fd561e] text-white' : 'bg-gray-200 text-gray-500'}`}>
                {step > 3 ? '✓' : '3'}
              </div>
              <div className="hidden sm:block">
                <div className="font-semibold text-sm">Review & pay</div>
                <div className="text-xs text-gray-500">Confirm payment</div>
              </div>
            </div>
            <div className={`flex-1 h-0.5 mx-2 sm:mx-4 ${step >= 4 ? 'bg-[#fd561e]' : 'bg-gray-200'}`}></div>

            <div className="flex items-center gap-2 sm:gap-3">
              <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center font-bold text-sm sm:text-base ${step >= 4 ? 'bg-[#fd561e] text-white' : 'bg-gray-200 text-gray-500'}`}>
                4
              </div>
              <div className="hidden sm:block">
                <div className="font-semibold text-sm">Confirmation</div>
                <div className="text-xs text-gray-500">Receipt & points</div>
              </div>
            </div>
          </div>
        </div>

        {/* ✅ Mobile/iPad: Biller card — stepper కింద, grid పైన */}
        <div className="lg:hidden mb-5">
          <BillerInfoCard />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 items-start relative">

          {/* ✅ Desktop only sidebar */}
          <div className="hidden lg:block lg:col-span-1 sticky top-24 self-start">
            <BillerInfoCard />
          </div>

          {/* Right Panel */}
          <div className="lg:col-span-2">
            <form onSubmit={handleFetchBill}>

              {/* Card 1: Account Identifier */}
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
                            name={safeFieldName}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#fd561e] focus:border-[#fd561e] outline-none transition bg-gray-50"
                            required={!optional}
                            value={formData[safeFieldName] || ''}
                            onChange={(e) => handleInputChange(safeFieldName, e.target.value)}
                          >
                            <option value="">Select {label}</option>
                            {listOfValues.map((item, idx) => (
                              <option key={idx} value={item.value || item}>
                                {item.name || item.value || item}
                              </option>
                            ))}
                          </select>
                        ) : (
                          <input
                            type="text"
                            name={safeFieldName}
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

              {/* Card 2: Customer Details */}
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 mb-4">
                <div className="flex items-center gap-3 mb-5 pb-3 border-b border-gray-100">
                  <div className="w-7 h-7 rounded-full bg-[#fd561e] text-white flex items-center justify-center text-xs font-bold">2</div>
                  <span className="text-xs font-bold uppercase text-gray-600">Customer Details</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-1">
                      Full Name <span className="text-[#fd561e]">*</span>
                    </label>
                    <input
                      type="text"
                      name="customer_name"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#fd561e] focus:border-[#fd561e] outline-none transition bg-gray-50"
                      required
                      pattern="[A-Za-z\s]{3,}"
                      title="Enter valid full name (minimum 3 letters, only alphabets)"
                      value={customerDetails?.name || ''}
                      onChange={(e) => setCustomerDetails(prev => ({ ...prev, name: e.target.value }))}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">
                      Mobile Number <span className="text-[#fd561e]">*</span>
                    </label>
                    <input
                      type="tel"
                      name="customer_mobile"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#fd561e] focus:border-[#fd561e] outline-none transition bg-gray-50"
                      required
                      maxLength="10"
                      pattern="[6-9]\d{9}"
                      title="Enter valid 10-digit mobile number starting with 6-9"
                      value={customerDetails?.mobile || ''}
                      onChange={(e) => setCustomerDetails(prev => ({ ...prev, mobile: e.target.value }))}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">
                      Email Address <span className="text-[#fd561e]">*</span>
                    </label>
                    <input
                      type="email"
                      name="customer_email"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#fd561e] focus:border-[#fd561e] outline-none transition bg-gray-50"
                      required
                      pattern="^[^\s@]+@[^\s@]+\.[^\s@]+$"
                      title="Enter valid email address (example@domain.com)"
                      value={customerDetails?.email || ''}
                      onChange={(e) => setCustomerDetails(prev => ({ ...prev, email: e.target.value }))}
                    />
                    <span className="text-xs text-[#fd561e] mt-1 flex items-center gap-1">
                      <i className="fa-solid fa-circle-info"></i> Payment receipt will be sent here
                    </span>
                  </div>
                </div>

                {billData.billerConsent && (
                  <div className="mt-4 p-3 bg-orange-50 border-l-4 border-[#fd561e] rounded-lg text-sm text-gray-700">
                    {billData.billerConsent}
                  </div>
                )}

                {billAmount && customerDetails && (
                  <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                    <h3 className="font-semibold text-green-800 mb-3">Bill Details</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Bill Number:</span>
                        <span className="font-medium">{customerDetails.billNumber}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Due Date:</span>
                        <span className="font-medium text-red-600">{customerDetails.dueDate}</span>
                      </div>
                      <div className="flex justify-between border-t pt-2 mt-2">
                        <span className="text-gray-800 font-semibold">Bill Amount:</span>
                        <span className="text-xl font-bold text-green-600">₹{billAmount}</span>
                      </div>
                      {billData.customer_conv_fee && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Convenience Fee:</span>
                          <span className="font-medium">₹{billData.customer_conv_fee}</span>
                        </div>
                      )}
                      <div className="flex justify-between border-t pt-2 mt-2">
                        <span className="text-gray-800 font-bold">Total Payable:</span>
                        <span className="text-xl font-bold text-[#fd561e]">
                          ₹{parseFloat(billAmount) + parseFloat(billData.customer_conv_fee || 0)}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                <div className="text-center mt-6">
                  {!billAmount ? (
                    <button
                      type="submit"
                      disabled={fetchingBill}
                      className="bg-[#fd561e] cursor-pointer text-white px-8 py-3 rounded-xl font-semibold shadow-lg hover:scale-105 transition-all duration-300 disabled:opacity-50"
                    >
                      {fetchingBill ? "Fetching..." : "Continue →"}
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={handlePayment}
                      disabled={loading}
                      className="bg-gradient-to-r from-green-500 to-green-600 text-white px-8 py-3 rounded-xl font-semibold shadow-lg hover:scale-105 transition-all duration-300 disabled:opacity-50"
                    >
                      {loading ? "Processing..." : "Proceed to Pay →"}
                    </button>
                  )}
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BillDetails;