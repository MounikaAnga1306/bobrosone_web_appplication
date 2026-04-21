import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { 
  CheckCircle, 
  XCircle, 
  Home, 
  Download, 
  Printer,
  AlertCircle,
  RefreshCw,
  Ticket,
  Plane,
  User,
  Luggage,
  CreditCard,
  Users,
  Shield,
  Briefcase,
} from 'lucide-react';
import { completePaymentConfirmation, isPaymentConfirmed, getCachedPaymentResult, resetPaymentConfirmationState } from '../services/paymentConfirmationService';
import { fetchAirlines } from '../services/airlineService';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

const ACCENT_COLOR = '#FD561E';

const TicketConfirmationScreen = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [verifyingPayment, setVerifyingPayment] = useState(false);
  const [paymentData, setPaymentData] = useState(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [apiResponse, setApiResponse] = useState(null);
  const [ticketDetails, setTicketDetails] = useState(null);
  const [errorDetails, setErrorDetails] = useState(null);
  const [verificationStep, setVerificationStep] = useState(0);
  const [openErrorDialog, setOpenErrorDialog] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [airlines, setAirlines] = useState([]);
  const apiCalledRef = useRef(false);
  const ticketRef = useRef();

  const verificationSteps = [
    { label: 'Checking payment status', icon: '💳' },
    { label: 'Verifying with payment gateway', icon: '🔒' },
    { label: 'Confirming with airline', icon: '✈️' },
    { label: 'Generating e-ticket', icon: '🎫' },
    { label: 'Finalizing booking', icon: '✅' },
  ];

  // Fetch airlines
  useEffect(() => {
    const loadAirlines = async () => {
      try {
        const airlinesData = await fetchAirlines();
        setAirlines(airlinesData);
      } catch (error) {
        console.error('Failed to fetch airlines:', error);
      }
    };
    loadAirlines();
  }, []);

  useEffect(() => {
    const isBusBooking = 
    localStorage.getItem("lastBookingPassengers") !== null ||   // bus flow నుండి set చేస్తారు
    (searchParams.get("bdorderid") === "" && !searchParams.get("pnr")); // fallback

  if (isBusBooking && window.location.pathname === "/flights/ticket-confirmation") {
    console.log("🚌 Bus booking detected. Redirecting to /payment-status");
    const queryString = window.location.search; // success, bdorderid, transactionid, amount...
    navigate(`/payment-status${queryString}`, { replace: true });
    return; // ✅ ఇక్కడే ఆపేయాలి – flight API call కాకుండా
  }
    console.log('='.repeat(80));
    console.log('🎫 TICKET CONFIRMATION SCREEN');
    console.log('='.repeat(80));

    const success = searchParams.get("success") === "true";
    const bdorderid = searchParams.get("bdorderid") || "";
    const transactionid = searchParams.get("transactionid") || "";
    const authStatus = searchParams.get("authStatus") || "";
    const amount = searchParams.get("amount") || "";

    const data = { success, bdorderid, transactionid, authStatus, amount };
    console.log('📋 Payment Response:', data);
    setPaymentData(data);
    setIsSuccess(success);

    if (authStatus === "0300") {
      if (isPaymentConfirmed()) {
        const cached = getCachedPaymentResult();
        if (cached && cached.success) {
          setApiResponse(cached);
          const ticketData = extractTicketDetails(cached);
          if (ticketData && ticketData.ticketNumber !== 'N/A') {
            setTicketDetails(ticketData);
            setLoading(false);
            setVerifyingPayment(false);
            toast.success(`Ticket issued successfully!`);
          }
        } else {
          callPaymentConfirmationAPI();
        }
      } else if (!apiCalledRef.current) {
        callPaymentConfirmationAPI();
      } else {
        setLoading(false);
        setVerifyingPayment(false);
      }
    } else {
      setLoading(false);
      setVerifyingPayment(false);
      if (!success) toast.error("Payment Failed. Please try again.");
    }
  }, [searchParams,navigate]);

  const callPaymentConfirmationAPI = async () => {
    if (apiCalledRef.current) return;
    apiCalledRef.current = true;
    setLoading(true);
    setVerifyingPayment(true);
    
    try {
      setVerificationStep(1);
      await new Promise(resolve => setTimeout(resolve, 300));
      
      console.log('📞 Calling completePaymentConfirmation API...');
      setVerificationStep(2);
      
      const result = await completePaymentConfirmation();
      console.log('✅ Payment Confirmation Result:', result);
      
      setVerificationStep(3);
      setApiResponse(result);
      
      if (result && !result.success && result.error) {
        setErrorDetails({
          message: result.message || 'Payment verification failed',
          errorType: result.error?.error_type || 'unknown_error',
          errorCode: result.error?.error_code || 'N/A',
          status: result.error?.status || 500,
        });
        setIsSuccess(false);
        setOpenErrorDialog(true);
        setLoading(false);
        setVerifyingPayment(false);
        return;
      }
      
      setVerificationStep(4);
      const ticketData = extractTicketDetails(result);
      console.log('📋 Extracted Ticket Data:', ticketData);
      setVerificationStep(5);
      
      if (ticketData && ticketData.ticketNumber !== 'N/A') {
        setTicketDetails(ticketData);
        toast.success('Ticket issued successfully!');
      } else if (result.success) {
        toast.success('Ticket issued successfully!');
      }
      
      setIsSuccess(true);
    } catch (error) {
      console.error('❌ Error:', error);
      setErrorDetails({
        message: error.message || 'Failed to confirm payment',
        errorType: 'network_error',
        errorCode: 'NET_001',
        status: 500,
      });
      setOpenErrorDialog(true);
      toast.error(error.message || 'Failed to confirm payment');
      setIsSuccess(false);
    } finally {
      setLoading(false);
      setVerifyingPayment(false);
    }
  };

  const extractTicketDetails = (response) => {
  try {
    console.log('🔍 Extracting ticket details');
    
    // Define formatAmount FIRST before using it
    const formatAmount = (amount) => {
      if (!amount) return 'N/A';
      const match = amount.toString().match(/([A-Z]+)?([0-9.]+)/);
      if (match) {
        const value = parseFloat(match[2]);
        return new Intl.NumberFormat('en-IN', { 
          style: 'currency', 
          currency: 'INR', 
          minimumFractionDigits: 0 
        }).format(value);
      }
      return `₹${amount}`;
    };
    
    let soapData = null;
    
    // Find SOAP envelope in response
    if (response?.data?.data && response.data.data['SOAP:Envelope']) {
      soapData = response.data.data;
    } else if (response?.data && response.data['SOAP:Envelope']) {
      soapData = response.data;
    } else if (response && response['SOAP:Envelope']) {
      soapData = response;
    }
    
    if (!soapData) {
      console.error('❌ Could not find SOAP envelope');
      return null;
    }
    
    const soapEnvelope = soapData['SOAP:Envelope'];
    const soapBody = soapEnvelope['SOAP:Body'];
    const airTicketingRsp = soapBody['air:AirTicketingRsp'];
    
    if (!airTicketingRsp) return null;
    
    let etr = airTicketingRsp['air:ETR'];
    const etrArray = Array.isArray(etr) ? etr : [etr];
    if (!etrArray.length) return null;
    
    const primaryEtr = etrArray[0];
    const etrAttrs = primaryEtr.$ || {};
    const ticket = primaryEtr['air:Ticket'];
    const ticketAttrs = ticket?.$ || {};
    const coupon = ticket?.['air:Coupon'];
    const couponAttrs = coupon?.$ || {};
    const airPricingInfo = primaryEtr['air:AirPricingInfo'];
    
    let totalBasePrice = 0, totalTaxes = 0, totalPrice = 0;
    let allPassengers = [];
    
    // Now use formatAmount inside forEach (it's already defined)
    etrArray.forEach((etrItem) => {
      const itemAttrs = etrItem.$ || {};
      const itemTicket = etrItem['air:Ticket'];
      const itemTicketAttrs = itemTicket?.$ || {};
      const itemPricingInfo = etrItem['air:AirPricingInfo'];
      const itemPricingAttrs = itemPricingInfo?.$ || {};
      const itemTraveler = etrItem['common_v54_0:BookingTraveler'];
      const itemTravelerName = itemTraveler?.['common_v54_0:BookingTravelerName']?.$ || {};
      const itemTravelerAttrs = itemTraveler?.$ || {};
      
      const basePriceMatch = (itemAttrs.BasePrice || itemPricingAttrs.BasePrice || 'INR0').match(/([0-9.]+)/);
      const taxesMatch = (itemAttrs.Taxes || itemPricingAttrs.Taxes || 'INR0').match(/([0-9.]+)/);
      const totalMatch = (itemAttrs.TotalPrice || itemPricingAttrs.TotalPrice || 'INR0').match(/([0-9.]+)/);
      
      totalBasePrice += basePriceMatch ? parseFloat(basePriceMatch[1]) : 0;
      totalTaxes += taxesMatch ? parseFloat(taxesMatch[1]) : 0;
      totalPrice += totalMatch ? parseFloat(totalMatch[1]) : 0;
      
      let passengerName = '';
      if (itemTravelerName.First || itemTravelerName.Last) {
        passengerName = `${itemTravelerName.Prefix || ''} ${itemTravelerName.First || ''} ${itemTravelerName.Last || ''}`.trim();
      } else if (itemTravelerName['_']) {
        passengerName = itemTravelerName['_'];
      }
      
      let passengerType = 'Adult';
      if (itemTravelerAttrs.TravelerType === 'ADT') passengerType = 'Adult';
      else if (itemTravelerAttrs.TravelerType === 'INF') passengerType = 'Infant';
      else if (itemTravelerAttrs.TravelerType === 'CNN') passengerType = 'Child';
      
      allPassengers.push({
        name: passengerName || 'N/A',
        type: passengerType,
        typeCode: itemTravelerAttrs.TravelerType || 'ADT',
        ticketNumber: itemTicketAttrs.TicketNumber || 'N/A',
        age: itemTravelerAttrs.Age || 'N/A',
        gender: itemTravelerAttrs.Gender === 'F' ? 'Female' : itemTravelerAttrs.Gender === 'M' ? 'Male' : 'N/A',
        dob: itemTravelerAttrs.DOB || 'N/A',
        baseFare: formatAmount(itemAttrs.BasePrice),
        taxes: formatAmount(itemAttrs.Taxes),
        totalFare: formatAmount(itemAttrs.TotalPrice),
      });
    });
    
    let taxInfo = airPricingInfo?.['air:TaxInfo'] || [];
    if (!Array.isArray(taxInfo)) taxInfo = [taxInfo];
    
    const fareInfo = airPricingInfo?.['air:FareInfo'];
    const maxWeight = fareInfo?.['air:BaggageAllowance']?.['air:MaxWeight']?.$ || {};
    
    const getPenaltyAmount = (penalty) => {
      if (!penalty) return 'N/A';
      if (typeof penalty === 'string') return penalty;
      if (penalty['air:Amount']) {
        const amt = penalty['air:Amount'];
        if (typeof amt === 'string') return amt;
        if (amt?.$?.Value) return amt.$.Value;
      }
      return 'N/A';
    };
    
    let formattedDepartureTime = 'N/A';
    let departureDate = 'N/A';
    let departureTimeOnly = 'N/A';
    if (couponAttrs.DepartureTime) {
      try {
        const date = new Date(couponAttrs.DepartureTime);
        formattedDepartureTime = date.toLocaleString('en-IN', {
          day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
        });
        departureDate = date.toLocaleDateString('en-IN', {
          day: 'numeric', month: 'long', year: 'numeric'
        });
        departureTimeOnly = date.toLocaleTimeString('en-IN', {
          hour: '2-digit', minute: '2-digit'
        });
      } catch (e) {
        formattedDepartureTime = couponAttrs.DepartureTime;
      }
    }
    
    const calculateDuration = (origin, destination) => {
      const routes = {
        'HYD-DEL': '2hrs 15min',
        'DEL-HYD': '2hrs 15min',
        'HYD-BOM': '1hrs 30min',
        'BOM-HYD': '1hrs 30min',
        'HYD-BLR': '1hrs',
        'BLR-HYD': '1hrs',
        'BOM-DEL': '2hrs',
        'DEL-BOM': '2hrs',
      };
      return routes[`${origin}-${destination}`] || '2hrs';
    };
    
    return {
      ticketNumber: ticketAttrs.TicketNumber || allPassengers[0]?.ticketNumber || 'N/A',
      pnr: primaryEtr['air:AirReservationLocatorCode'] || etrAttrs.ProviderLocatorCode || 'N/A',
      airlinePNR: primaryEtr['common_v54_0:SupplierLocator']?.$?.SupplierLocatorCode || '',
      providerLocator: etrAttrs.ProviderLocatorCode || 'N/A',
      ticketStatus: 'CONFIRMED',
      issuedDate: etrAttrs.IssuedDate ? new Date(etrAttrs.IssuedDate).toLocaleDateString('en-IN', {
        day: 'numeric', month: 'long', year: 'numeric'
      }) : new Date().toLocaleDateString('en-IN'),
      totalPrice: formatAmount(totalPrice),
      basePrice: formatAmount(totalBasePrice),
      taxes: formatAmount(totalTaxes),
      carrier: couponAttrs.MarketingCarrier || 'AI',
      flightNumber: couponAttrs.MarketingFlightNumber || 'N/A',
      origin: couponAttrs.Origin || 'N/A',
      destination: couponAttrs.Destination || 'N/A',
      departureDate: departureDate,
      departureTime: departureTimeOnly,
      fullDepartureDateTime: formattedDepartureTime,
      fareBasis: couponAttrs.FareBasis || 'N/A',
      bookingClass: couponAttrs.BookingClass || 'Economy',
      refundable: etrAttrs.Refundable === 'true',
      exchangeable: etrAttrs.Exchangeable === 'true',
      platingCarrier: etrAttrs.PlatingCarrier || 'AI',
      baggageAllowance: maxWeight.Value ? `${maxWeight.Value} ${maxWeight.Unit || 'kg'}` : '15 kg',
      changePenalty: getPenaltyAmount(airPricingInfo?.['air:ChangePenalty']),
      cancelPenalty: getPenaltyAmount(airPricingInfo?.['air:CancelPenalty']),
      flightDuration: calculateDuration(couponAttrs.Origin, couponAttrs.Destination),
      taxBreakdown: taxInfo.map(tax => ({
        category: tax.$?.Category || 'N/A',
        amount: formatAmount(tax.$?.Amount)
      })),
      allPassengers: allPassengers,
      passengerCount: allPassengers.length,
    };
  } catch (error) {
    console.error('❌ Error extracting ticket details:', error);
    return null;
  }
};

  const handleRetry = () => {
    resetPaymentConfirmationState();
    apiCalledRef.current = false;
    setErrorDetails(null);
    setOpenErrorDialog(false);
    callPaymentConfirmationAPI();
  };

  const handleGoHome = () => navigate('/');
  
  const handleDownloadPDF = () => {
  const printContent = ticketRef.current;
  
  if (!printContent) {
    toast.error('Unable to generate PDF');
    return;
  }
  
  // Create a new window for printing
  const printWindow = window.open('', '_blank');
  
  if (!printWindow) {
    toast.error('Please allow popups to download PDF');
    return;
  }
  
  // Get the HTML content and convert Tailwind classes to inline styles for better compatibility
  const getStyles = () => {
    return `
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
          font-family: 'Segoe UI', Arial, sans-serif; 
          padding: 40px 20px; 
          background: white;
        }
        .ticket-container {
          max-width: 800px;
          margin: 0 auto;
          background: white;
        }
        /* Convert Tailwind classes to custom CSS */
        .border-b { border-bottom: 1px solid #e5e7eb; }
        .pb-4 { padding-bottom: 16px; }
        .mb-4 { margin-bottom: 16px; }
        .mb-6 { margin-bottom: 24px; }
        .mt-1 { margin-top: 4px; }
        .text-2xl { font-size: 24px; }
        .font-bold { font-weight: bold; }
        .text-orange-500 { color: #f97316; }
        .text-orange-600 { color: #ea580c; }
        .text-gray-500 { color: #6b7280; }
        .text-gray-700 { color: #374151; }
        .text-right { text-align: right; }
        .text-sm { font-size: 14px; }
        .text-xs { font-size: 12px; }
        .font-semibold { font-weight: 600; }
        .font-mono { font-family: monospace; }
        .bg-gray-50 { background-color: #f9fafb; }
        .bg-blue-50 { background-color: #eff6ff; }
        .bg-green-100 { background-color: #dcfce7; }
        .bg-yellow-100 { background-color: #fef9c3; }
        .bg-blue-100 { background-color: #dbeafe; }
        .text-blue-700 { color: #1d4ed8; }
        .text-green-700 { color: #15803d; }
        .text-yellow-700 { color: #a16207; }
        .rounded-xl { border-radius: 12px; }
        .rounded-lg { border-radius: 8px; }
        .p-6 { padding: 24px; }
        .p-5 { padding: 20px; }
        .p-4 { padding: 16px; }
        .p-3 { padding: 12px; }
        .p-2 { padding: 8px; }
        .px-2 { padding-left: 8px; padding-right: 8px; }
        .py-1 { padding-top: 4px; padding-bottom: 4px; }
        .flex { display: flex; }
        .flex-wrap { flex-wrap: wrap; }
        .justify-between { justify-content: space-between; }
        .items-center { align-items: center; }
        .items-start { align-items: flex-start; }
        .gap-2 { gap: 8px; }
        .gap-4 { gap: 16px; }
        .gap-8 { gap: 32px; }
        .w-full { width: 100%; }
        .w-8 { width: 32px; }
        .h-8 { height: 32px; }
        .overflow-x-auto { overflow-x: auto; }
        table { width: 100%; border-collapse: collapse; }
        th, td { border: 1px solid #e5e7eb; padding: 8px; text-align: left; }
        th { background-color: #f9fafb; font-weight: 600; }
        .text-right { text-align: right; }
        .bg-gray-100 { background-color: #f3f4f6; }
        .border { border: 1px solid #e5e7eb; }
        .border-l { border-left: 1px solid #e5e7eb; }
        .border-t { border-top: 1px solid #e5e7eb; }
        .pl-4 { padding-left: 16px; }
        .pt-4 { padding-top: 16px; }
        .mt-2 { margin-top: 8px; }
        .inline-block { display: inline-block; }
        .text-center { text-align: center; }
        .grid { display: grid; }
        .grid-cols-2 { grid-template-columns: repeat(2, 1fr); }
        .list-disc { list-style-type: disc; }
        .pl-4 { padding-left: 16px; }
        .space-y-1 > * + * { margin-top: 4px; }
      </style>
    `;
  };
  
  // Get the inner HTML and clean it up
  const getCleanHTML = () => {
    // Clone the element to avoid modifying the original
    const clone = printContent.cloneNode(true);
    
    // Remove any buttons or interactive elements
    const buttons = clone.querySelectorAll('button');
    buttons.forEach(btn => btn.remove());
    
    // Remove any no-print elements
    const noPrint = clone.querySelectorAll('.no-print');
    noPrint.forEach(el => el.remove());
    
    return clone.innerHTML;
  };
  
  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>Flight Ticket - ${ticketDetails?.airlinePNR || ticketDetails?.pnr || 'Booking'}</title>
        <meta charset="UTF-8">
        ${getStyles()}
      </head>
      <body>
        <div class="ticket-container">
          ${getCleanHTML()}
          <div style="text-align: center; margin-top: 40px; font-size: 12px; color: #9ca3af;">
            Generated by BOBROS Consultancy | ${new Date().toLocaleString()}
          </div>
        </div>
        <script>
          window.onload = () => {
            setTimeout(() => {
              window.print();
              setTimeout(() => window.close(), 1000);
            }, 500);
          };
        <\/script>
      </body>
    </html>
  `);
  
  printWindow.document.close();
};
  const formatCurrency = (amount) => {
    if (!amount) return '₹0';
    const match = amount.toString().match(/([0-9.]+)/);
    if (match) {
      return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 0 }).format(parseFloat(match[1]));
    }
    return `₹${amount}`;
  };

  // Loading Screen
  if (loading && !verifyingPayment) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-orange-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <div className="mb-6 animate-bounce">
            <Plane className="w-20 h-20 text-orange-500 mx-auto" />
          </div>
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Processing Your Booking</h2>
          <p className="text-gray-600 mb-4">Please wait while we confirm your ticket with the airline...</p>
          <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
            <div className="h-full bg-gradient-to-r from-orange-500 to-orange-600 rounded-full animate-pulse" style={{ width: '100%' }}></div>
          </div>
          <p className="text-xs text-gray-500 mt-4">⏱️ This may take a few seconds. Please do not close this window.</p>
        </div>
      </div>
    );
  }

  // Verification Loading Screen
  if (verifyingPayment) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-orange-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full">
          <div className="text-center mb-6">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-orange-500 mx-auto"></div>
          </div>
          <h2 className="text-xl font-bold text-gray-800 text-center mb-2">Verifying Your Payment</h2>
          <p className="text-gray-600 text-center text-sm mb-6">Please wait while we confirm your payment and issue your ticket...</p>
          <div className="w-full bg-gray-200 rounded-full h-2 mb-6">
            <div className="h-full bg-gradient-to-r from-orange-500 to-orange-600 rounded-full transition-all duration-300" style={{ width: `${(verificationStep / verificationSteps.length) * 100}%` }} />
          </div>
          <div className="space-y-3">
            {verificationSteps.map((step, index) => (
              <div key={index} className={`flex items-center gap-3 transition-opacity duration-300 ${index + 1 <= verificationStep ? 'opacity-100' : 'opacity-40'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm ${index + 1 < verificationStep ? 'bg-green-500' : (index + 1 === verificationStep ? 'bg-orange-500' : 'bg-gray-300')}`}>
                  {index + 1 < verificationStep ? '✓' : step.icon}
                </div>
                <span className={`text-sm ${index + 1 === verificationStep ? 'font-semibold text-gray-800' : 'text-gray-600'}`}>{step.label}</span>
              </div>
            ))}
          </div>
          <p className="text-xs text-gray-500 text-center mt-6">⏱️ This may take up to 30 seconds. Please do not close this window.</p>
        </div>
      </div>
    );
  }

  // Error Dialog
  if (openErrorDialog) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl max-w-md w-full shadow-xl">
          <div className="bg-red-50 p-4 rounded-t-2xl border-b border-red-100">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-6 h-6 text-red-500" />
              <h3 className="text-lg font-bold text-red-700">Verification Error</h3>
            </div>
          </div>
          <div className="p-6">
            <div className="bg-red-50 rounded-lg p-4 mb-4">
              <p className="text-gray-800">{errorDetails?.message || 'Failed to verify payment'}</p>
            </div>
            <div className="bg-blue-50 rounded-lg p-4 mb-4">
              <h4 className="font-semibold text-gray-700 mb-2">What you can do:</h4>
              <ul className="text-sm text-gray-600 space-y-1 ml-4 list-disc">
                <li>Check your booking status in "My Bookings"</li>
                <li>Contact customer support with the error details</li>
                <li>If charged, amount will be refunded within 5-7 days</li>
              </ul>
            </div>
            <div className="flex gap-3">
              <button onClick={handleRetry} className="flex-1 bg-orange-500 text-white py-2 rounded-lg font-semibold hover:bg-orange-600 transition flex items-center justify-center gap-2">
                <RefreshCw className="w-4 h-4" /> Retry
              </button>
              <button onClick={handleGoHome} className="flex-1 border border-gray-300 py-2 rounded-lg font-semibold hover:bg-gray-50 transition">Go Home</button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Don't show anything until we have ticket details
  if (!ticketDetails) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading ticket details...</p>
        </div>
      </div>
    );
  }

  // Main Success View - PDF Style Ticket
  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Success Header */}
        

        {/* PDF Style Ticket */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-white rounded-2xl shadow-xl overflow-hidden">
          
          {/* Ticket Content for PDF Download */}
          <div ref={ticketRef} className="p-6">
            {/* Header with Logo and Booking Info */}
            <div className="border-b border-gray-200 pb-4 mb-4">
              <div className="flex justify-between items-start flex-wrap gap-4">
                <div>
                  <h1 className="text-2xl font-bold text-orange-500">BOBROS CONSULTANCY</h1>
                  <p className="text-xs text-gray-500 mt-1">FLAT NO.202,BLOCK B,ANJANADRI RESIDENCE,AUROBINDO COLONY,MIYAPUR</p>
                  <p className="text-xs text-gray-500">📞 8096503272 | ✉ admin@bobrosconsultancy.com</p>
                </div>
                <div className="text-right">
                  <p className="text-sm"><span className="font-semibold">Airline PNR:</span> <span className="text-orange-600 font-bold">{ticketDetails.airlinePNR || ticketDetails.pnr}</span></p>
                  <p className="text-sm"><span className="font-semibold">R PNR:</span> {ticketDetails.providerLocator}</p>
                  <p className="text-sm"><span className="font-semibold">Issued Date:</span> {ticketDetails.issuedDate}</p>
                </div>
              </div>
            </div>

            {/* Passenger Details Table */}
            <div className="mb-6">
              <h3 className="font-semibold text-gray-700 mb-2">Passengers</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="border border-gray-200 p-2 text-left">Passenger Name</th>
                      <th className="border border-gray-200 p-2 text-left">Type</th>
                      <th className="border border-gray-200 p-2 text-left">Ticket Number</th>
                      <th className="border border-gray-200 p-2 text-right">Base Fare</th>
                      <th className="border border-gray-200 p-2 text-right">Taxes</th>
                      <th className="border border-gray-200 p-2 text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ticketDetails.allPassengers?.map((passenger, idx) => (
                      <tr key={idx} className="hover:bg-gray-50">
                        <td className="border border-gray-200 p-2 font-medium">{passenger.name}</td>
                        <td className="border border-gray-200 p-2">
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            passenger.typeCode === 'ADT' ? 'bg-blue-100 text-blue-700' :
                            passenger.typeCode === 'INF' ? 'bg-yellow-100 text-yellow-700' :
                            'bg-green-100 text-green-700'
                          }`}>
                            {passenger.type}
                          </span>
                        </td>
                        <td className="border border-gray-200 p-2 font-mono text-xs">{passenger.ticketNumber}</td>
                        <td className="border border-gray-200 p-2 text-right">{passenger.baseFare}</td>
                        <td className="border border-gray-200 p-2 text-right">{passenger.taxes}</td>
                        <td className="border border-gray-200 p-2 text-right font-semibold">{passenger.totalFare}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="bg-gray-100 font-bold">
                      <td colSpan="3" className="border border-gray-200 p-2 text-right">TOTAL</td>
                      <td className="border border-gray-200 p-2 text-right">{ticketDetails.basePrice}</td>
                      <td className="border border-gray-200 p-2 text-right">{ticketDetails.taxes}</td>
                      <td className="border border-gray-200 p-2 text-right text-orange-600">{ticketDetails.totalPrice}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>

            {/* Flight Information */}
            <div className="bg-blue-50 rounded-xl p-5 mb-6">
              <h3 className="font-bold text-lg mb-3 flex items-center gap-2">
                <Plane className="w-5 h-5 text-blue-600" /> Your Flight
              </h3>
              
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-4 flex-wrap">
                    <div>
                      <p className="text-xs text-gray-500">From</p>
                      <p className="text-2xl font-bold">{ticketDetails.origin}</p>
                      <p className="text-sm">{ticketDetails.departureDate}</p>
                      <p className="text-lg font-semibold text-blue-600">{ticketDetails.departureTime}</p>
                    </div>
                    
                    <div className="text-center">
                      <Plane className="w-8 h-8 text-gray-400" />
                      <p className="text-xs text-gray-500">{ticketDetails.flightDuration}</p>
                    </div>
                    
                    <div>
                      <p className="text-xs text-gray-500">To</p>
                      <p className="text-2xl font-bold">{ticketDetails.destination}</p>
                      <p className="text-sm">{ticketDetails.departureDate}</p>
                      <p className="text-lg font-semibold text-blue-600">{ticketDetails.departureTime}</p>
                    </div>
                  </div>
                </div>
                
                <div className="text-right border-l border-gray-300 pl-4">
                  <p className="text-sm font-semibold">{ticketDetails.carrier} {ticketDetails.flightNumber}</p>
                  <p className="text-xs text-gray-500">Fare Basis: {ticketDetails.fareBasis}</p>
                  <p className="text-xs text-gray-500">Class: {ticketDetails.bookingClass}</p>
                  <span className="inline-block bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full mt-1">{ticketDetails.ticketStatus}</span>
                </div>
              </div>
            </div>

            {/* Baggage Information */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="border rounded-lg p-3">
                <p className="text-xs text-gray-500 flex items-center gap-1"><Luggage className="w-3 h-3" /> Check-in Baggage</p>
                <p className="text-lg font-bold">{ticketDetails.baggageAllowance}</p>
                <p className="text-xs text-gray-400">per passenger</p>
              </div>
              <div className="border rounded-lg p-3">
                <p className="text-xs text-gray-500 flex items-center gap-1"><Briefcase className="w-3 h-3" /> Cabin Baggage</p>
                <p className="text-lg font-bold">7 KG</p>
                <p className="text-xs text-gray-400">per passenger</p>
              </div>
            </div>

            {/* Fare Breakdown */}
            <div className="border-t border-gray-200 pt-4 mb-6">
              <h3 className="font-semibold text-gray-700 mb-2">Taxes & Other Charges</h3>
              <div className="flex flex-wrap gap-2 text-sm">
                {ticketDetails.taxBreakdown?.map((tax, idx) => (
                  <span key={idx} className="bg-gray-100 px-2 py-1 rounded">
                    {tax.category}: {tax.amount}
                  </span>
                ))}
              </div>
            </div>

            {/* Rules and Regulations */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-semibold text-gray-700 mb-2 flex items-center gap-2">
                <Shield className="w-4 h-4" /> RULES AND REGULATIONS
              </h3>
              <ul className="text-xs text-gray-600 space-y-1 list-disc pl-4">
                <li>All Passengers must carry their Photo Identification while Check In.</li>
                <li>Flight timings are subject to change without prior notice. Please recheck with carrier prior to departure.</li>
                <li>For Infant passenger Hand baggage of 7KG is allowed, please note Infant bag allowance can be used only for Infant meal/bag and it can't be clubbed with Adult passenger bag.</li>
                <li>Cancellation/Change penalties apply as per airline policy.</li>
              </ul>
            </div>
          </div>

          {/* Action Buttons - Only Home and Download PDF */}
          <div className="border-t border-gray-200 p-4 flex flex-wrap gap-3 justify-center bg-gray-50">
            <button 
              onClick={handleGoHome} 
              className="bg-orange-500 text-white px-6 py-2 rounded-lg font-semibold hover:bg-orange-600 transition flex items-center gap-2"
            >
              <Home className="w-4 h-4" /> Go to Home
            </button>
            <button 
              onClick={handleDownloadPDF} 
              disabled={downloading}
              className="border border-orange-500 text-orange-600 px-6 py-2 rounded-lg font-semibold hover:bg-orange-50 transition flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {downloading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-orange-600"></div>
                  Generating PDF...
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" /> Download PDF
                </>
              )}
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default TicketConfirmationScreen;