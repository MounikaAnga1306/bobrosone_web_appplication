import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { 
  CheckCircle, 
  XCircle, 
  Home, 
  Receipt, 
  Download, 
  Printer, 
  Share2,
  AlertCircle,
  RefreshCw,
  Headphones,
  Ticket,
  Plane,
  User,
  Luggage,
  Calendar,
  Clock,
  MapPin,
  CreditCard,
  ChevronRight,
  Users,
  Info,
  Shield,
  ArrowRight,
  Phone,
  Mail,
  QrCode
} from 'lucide-react';
import { completePaymentConfirmation, isPaymentConfirmed, getCachedPaymentResult, resetPaymentConfirmationState } from '../services/paymentConfirmationService';
import { fetchAirlines } from '../services/airlineService';

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
  const [extractionError, setExtractionError] = useState(null);
  const [errorDetails, setErrorDetails] = useState(null);
  const [retryCount, setRetryCount] = useState(0);
  const [verificationStep, setVerificationStep] = useState(0);
  const [openErrorDialog, setOpenErrorDialog] = useState(false);
  const [airlines, setAirlines] = useState([]);
  const [airlinesLoading, setAirlinesLoading] = useState(true);
  const apiCalledRef = useRef(false);
  const printRef = useRef();

  const verificationSteps = [
    { label: 'Checking payment status', icon: '💳' },
    { label: 'Verifying with payment gateway', icon: '🔒' },
    { label: 'Confirming with airline', icon: '✈️' },
    { label: 'Generating e-ticket', icon: '🎫' },
    { label: 'Finalizing booking', icon: '✅' },
  ];

  // Fetch airlines for logos
  useEffect(() => {
    const loadAirlines = async () => {
      try {
        const airlinesData = await fetchAirlines();
        setAirlines(airlinesData);
      } catch (error) {
        console.error('Failed to fetch airlines:', error);
      } finally {
        setAirlinesLoading(false);
      }
    };
    loadAirlines();
  }, []);

  const getAirlineDetails = (code) => {
    const airline = airlines.find(a => a.code === code);
    return airline || { name: code, logo_url: null };
  };

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
    console.log('🎫 TICKET CONFIRMATION SCREEN - READING BILLDESK RESPONSE');
    console.log('='.repeat(80));

    const success = searchParams.get("success") === "true";
    const bdorderid = searchParams.get("bdorderid") || "";
    const transactionid = searchParams.get("transactionid") || "";
    const authStatus = searchParams.get("authStatus") || "";
    const statusMessage = searchParams.get("statusMessage") || "";
    const amount = searchParams.get("amount") || "";

    const data = {
      success,
      bdorderid,
      transactionid,
      authStatus,
      statusMessage,
      amount,
    };

    console.log('📋 BillDesk Payment Response:', data);
    setPaymentData(data);
    setIsSuccess(success);

    if (authStatus === "0300") {
      console.log('✅ Auth Status is 0300 - Will call Payment Confirmation API');
      
      if (isPaymentConfirmed()) {
        console.log('📦 Payment already confirmed, using cached result');
        const cached = getCachedPaymentResult();
        if (cached && cached.success) {
          setApiResponse(cached);
          const ticketData = extractTicketDetails(cached);
          if (ticketData && ticketData.ticketNumber !== 'N/A') {
            setTicketDetails(ticketData);
            setLoading(false);
            setVerifyingPayment(false);
            toast.success(`Ticket ${ticketData.ticketNumber} issued successfully!`);
          } else {
            setLoading(false);
            setVerifyingPayment(false);
          }
        } else {
          callPaymentConfirmationAPI();
        }
      } else if (!apiCalledRef.current) {
        callPaymentConfirmationAPI();
      } else {
        console.log('⏭️ API already called, skipping duplicate call');
        setLoading(false);
        setVerifyingPayment(false);
      }
    } else {
      if (success) {
        toast.success("Payment Successful! But ticket confirmation pending.");
        setLoading(false);
        setVerifyingPayment(false);
      } else {
        toast.error("Payment Failed. Please try again.");
        setLoading(false);
        setVerifyingPayment(false);
      }
    }
  }, [searchParams,navigate]);

  const callPaymentConfirmationAPI = async () => {
    if (apiCalledRef.current) {
      console.log('⏭️ API already called, skipping...');
      return;
    }
    
    apiCalledRef.current = true;
    setLoading(true);
    setVerifyingPayment(true);
    setVerificationStep(1);
    
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
          details: result.error,
          rawResponse: result
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
        toast.success(`Ticket ${ticketData.ticketNumber} issued successfully!`);
      } else if (result.success) {
        toast.success('Ticket issued successfully!');
      } else {
        toast.warning('Ticket issued but unable to extract all details');
      }
      
      setIsSuccess(true);
      
    } catch (error) {
      console.error('❌ Error in payment confirmation:', error);
      
      let errorInfo = {
        message: error.message || 'Failed to confirm payment',
        errorType: 'network_error',
        errorCode: 'NET_001',
        status: 500,
        rawResponse: error.response?.data || error
      };
      
      if (error.response?.data?.error) {
        errorInfo = {
          message: error.response.data.message || 'Payment verification failed',
          errorType: error.response.data.error?.error_type || 'api_error',
          errorCode: error.response.data.error?.error_code || 'API_001',
          status: error.response.status,
          details: error.response.data.error,
          rawResponse: error.response.data
        };
      } else if (error.message?.includes('duplicate')) {
        errorInfo = {
          message: 'Duplicate request detected. Please check your booking status.',
          errorType: 'duplicate_request_error',
          errorCode: 'GNDRE0001',
          status: 409,
          rawResponse: error
        };
      }
      
      setErrorDetails(errorInfo);
      setApiResponse({ error: true, ...errorInfo });
      setOpenErrorDialog(true);
      toast.error(errorInfo.message);
      setIsSuccess(false);
      
    } finally {
      setLoading(false);
      setVerifyingPayment(false);
    }
  };

  const handleRetry = () => {
    resetPaymentConfirmationState();
    apiCalledRef.current = false;
    setErrorDetails(null);
    setOpenErrorDialog(false);
    setRetryCount(prev => prev + 1);
    callPaymentConfirmationAPI();
  };

  const handleCopyErrorDetails = () => {
    const errorText = JSON.stringify(errorDetails, null, 2);
    navigator.clipboard.writeText(errorText);
    toast.success('Error details copied to clipboard');
  };

  const extractTicketDetails = (response) => {
    try {
      console.log('🔍 Starting to extract ticket details from dynamic response');
      
      let soapData = null;
      
      // Handle different response structures dynamically
      if (response?.data?.data && response.data.data['SOAP:Envelope']) {
        soapData = response.data.data;
      } else if (response?.data && response.data['SOAP:Envelope']) {
        soapData = response.data;
      } else if (response && response['SOAP:Envelope']) {
        soapData = response;
      } else if (response?.data && typeof response.data === 'object') {
        const findSoapEnvelope = (obj) => {
          if (!obj) return null;
          if (obj['SOAP:Envelope']) return obj;
          for (let key in obj) {
            if (typeof obj[key] === 'object') {
              const found = findSoapEnvelope(obj[key]);
              if (found) return found;
            }
          }
          return null;
        };
        const found = findSoapEnvelope(response.data);
        if (found) soapData = found;
      }
      
      // Check if we have direct ticket data from response (non-SOAP)
      if (!soapData && response?.ticketDetails) {
        console.log('Found direct ticket details in response');
        return response.ticketDetails;
      }
      
      if (!soapData) {
        console.error('❌ Could not find SOAP:Envelope in response');
        if (response?.data?.data?.airTicketingResponse) {
          return extractFromCustomFormat(response.data.data.airTicketingResponse);
        }
        return null;
      }
      
      const soapEnvelope = soapData['SOAP:Envelope'];
      const soapBody = soapEnvelope['SOAP:Body'];
      const airTicketingRsp = soapBody['air:AirTicketingRsp'];
      
      if (!airTicketingRsp) {
        console.error('❌ Could not find air:AirTicketingRsp');
        return null;
      }
      
      let etr = airTicketingRsp['air:ETR'];
      const etrArray = Array.isArray(etr) ? etr : [etr];
      
      if (!etrArray || etrArray.length === 0) {
        console.error('❌ No ETR found');
        return null;
      }
      
      const primaryEtr = etrArray[0];
      
      const etrAttrs = primaryEtr.$ || {};
      const ticket = primaryEtr['air:Ticket'];
      const ticketAttrs = ticket?.$ || {};
      const coupon = ticket?.['air:Coupon'];
      const couponAttrs = coupon?.$ || {};
      const airPricingInfo = primaryEtr['air:AirPricingInfo'];
      const airPricingAttrs = airPricingInfo?.$ || {};
      
      let totalBasePrice = 0;
      let totalTaxes = 0;
      let totalPrice = 0;
      let allPassengers = [];
      
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
          passengerName = `${itemTravelerName.First || ''} ${itemTravelerName.Last || ''}`.trim();
        } else if (itemTravelerName['_']) {
          passengerName = itemTravelerName['_'];
        } else if (itemTravelerName['#text']) {
          passengerName = itemTravelerName['#text'];
        }
        
        let passengerType = 'Adult';
        if (itemTravelerAttrs.TravelerType === 'ADT') passengerType = 'Adult';
        else if (itemTravelerAttrs.TravelerType === 'INF') passengerType = 'Infant';
        else if (itemTravelerAttrs.TravelerType === 'CNN') passengerType = 'Child';
        else if (itemTravelerAttrs.TravelerType) passengerType = itemTravelerAttrs.TravelerType;
        
        allPassengers.push({
          name: passengerName || 'N/A',
          type: passengerType,
          ticketNumber: itemTicketAttrs.TicketNumber || 'N/A',
          age: itemTravelerAttrs.Age || 'N/A',
          gender: itemTravelerAttrs.Gender === 'F' ? 'Female' : itemTravelerAttrs.Gender === 'M' ? 'Male' : 'N/A',
          dob: itemTravelerAttrs.DOB || 'N/A',
        });
      });
      
      let taxInfo = airPricingInfo?.['air:TaxInfo'] || [];
      if (!Array.isArray(taxInfo)) taxInfo = [taxInfo];
      
      const fareInfo = airPricingInfo?.['air:FareInfo'];
      const maxWeight = fareInfo?.['air:BaggageAllowance']?.['air:MaxWeight']?.$ || {};
      
      const formatAmount = (amount) => {
        if (!amount) return 'N/A';
        const match = amount.toString().match(/([A-Z]+)?([0-9.]+)/);
        if (match) {
          const currency = match[1] || 'INR';
          const value = parseFloat(match[2]);
          return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: currency,
            minimumFractionDigits: 0,
          }).format(value);
        }
        return `₹${amount}`;
      };
      
      const getPenaltyAmount = (penalty) => {
        if (!penalty) return 'N/A';
        if (typeof penalty === 'string') return penalty;
        if (penalty['air:Amount']) {
          const amt = penalty['air:Amount'];
          if (typeof amt === 'string') return amt;
          if (amt?.$?.Value) return amt.$.Value;
          if (amt?.$?.Amount) return amt.$.Amount;
        }
        if (penalty.$?.Value) return penalty.$.Value;
        if (penalty.$?.Amount) return penalty.$.Amount;
        return 'N/A';
      };
      
      let formattedDepartureTime = 'N/A';
      if (couponAttrs.DepartureTime) {
        try {
          formattedDepartureTime = new Date(couponAttrs.DepartureTime).toLocaleString('en-IN', {
            day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
          });
        } catch (e) {
          formattedDepartureTime = couponAttrs.DepartureTime;
        }
      }
      
      const ticketDetailsObj = {
        ticketNumber: ticketAttrs.TicketNumber || allPassengers[0]?.ticketNumber || 'N/A',
        pnr: primaryEtr['air:AirReservationLocatorCode'] || etrAttrs.ProviderLocatorCode || 'N/A',
        airlinePNR: primaryEtr['common_v54_0:SupplierLocator']?.$?.SupplierLocatorCode || '',
        providerLocator: etrAttrs.ProviderLocatorCode || 'N/A',
        ticketStatus: ticketAttrs.TicketStatus === 'N' ? 'Confirmed' : ticketAttrs.TicketStatus || 'Confirmed',
        issuedDate: etrAttrs.IssuedDate ? new Date(etrAttrs.IssuedDate).toLocaleDateString('en-IN', {
          day: 'numeric', month: 'long', year: 'numeric'
        }) : new Date().toLocaleDateString('en-IN'),
        totalPrice: formatAmount(totalPrice),
        basePrice: formatAmount(totalBasePrice),
        taxes: formatAmount(totalTaxes),
        passengerName: allPassengers[0]?.name || 'N/A',
        passengerType: allPassengers[0]?.type || 'N/A',
        passengerGender: allPassengers[0]?.gender || 'N/A',
        passengerAge: allPassengers[0]?.age || 'N/A',
        passengerDOB: allPassengers[0]?.dob || 'N/A',
        carrier: couponAttrs.MarketingCarrier || 'N/A',
        flightNumber: couponAttrs.MarketingFlightNumber || 'N/A',
        origin: couponAttrs.Origin || 'N/A',
        destination: couponAttrs.Destination || 'N/A',
        departureTime: formattedDepartureTime,
        fareBasis: couponAttrs.FareBasis || 'N/A',
        bookingClass: couponAttrs.BookingClass || 'N/A',
        refundable: etrAttrs.Refundable === 'true',
        exchangeable: etrAttrs.Exchangeable === 'true',
        platingCarrier: etrAttrs.PlatingCarrier || 'N/A',
        baggageAllowance: maxWeight.Value ? `${maxWeight.Value} ${maxWeight.Unit || 'kg'}` : '15 kg',
        changePenalty: getPenaltyAmount(airPricingInfo?.['air:ChangePenalty']),
        cancelPenalty: getPenaltyAmount(airPricingInfo?.['air:CancelPenalty']),
        taxBreakdown: taxInfo.map(tax => ({
          category: tax.$?.Category || 'N/A',
          amount: formatAmount(tax.$?.Amount)
        })),
        allPassengers: allPassengers,
        passengerCount: allPassengers.length,
      };
      
      console.log('✅ Successfully extracted ticket details:', ticketDetailsObj);
      return ticketDetailsObj;
      
    } catch (error) {
      console.error('❌ Error extracting ticket details:', error);
      setExtractionError(error.message);
      return null;
    }
  };
  
  const extractFromCustomFormat = (data) => {
    try {
      return {
        ticketNumber: data.ticketNumber || 'N/A',
        pnr: data.pnr || 'N/A',
        airlinePNR: data.airlinePNR || '',
        passengerName: data.passengerName || 'N/A',
        carrier: data.carrier || 'N/A',
        flightNumber: data.flightNumber || 'N/A',
        origin: data.origin || 'N/A',
        destination: data.destination || 'N/A',
        departureTime: data.departureTime || 'N/A',
        totalPrice: data.totalPrice || 'N/A',
        passengerCount: data.passengerCount || 1,
        allPassengers: data.allPassengers || [],
        ticketStatus: 'Confirmed',
        issuedDate: new Date().toLocaleDateString('en-IN'),
        basePrice: data.basePrice || 'N/A',
        taxes: data.taxes || 'N/A',
        passengerType: data.passengerType || 'Adult',
        bookingClass: data.bookingClass || 'N/A',
        fareBasis: data.fareBasis || 'N/A',
        refundable: data.refundable !== false,
        exchangeable: data.exchangeable !== false,
        platingCarrier: data.platingCarrier || 'N/A',
        baggageAllowance: data.baggageAllowance || '15 kg',
        changePenalty: data.changePenalty || 'N/A',
        cancelPenalty: data.cancelPenalty || 'N/A',
        taxBreakdown: data.taxBreakdown || [],
      };
    } catch (e) {
      return null;
    }
  };

  const handleGoHome = () => navigate('/');
  const handleViewBookings = () => navigate('/flights/my-bookings');
  
  const handlePrintTicket = () => {
    const printContent = printRef.current;
    if (!printContent) {
      toast.error('Unable to print ticket');
      return;
    }
    
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      toast.error('Please allow popups to print');
      return;
    }
    
    printWindow.document.write(`
      <html>
        <head>
          <title>Flight Ticket - ${ticketDetails?.ticketNumber || 'Booking'}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 40px; }
            .ticket { max-width: 800px; margin: 0 auto; }
            .header { text-align: center; margin-bottom: 30px; }
            .flight-info { background: #f5f5f5; padding: 20px; border-radius: 8px; margin-bottom: 20px; }
            .passenger-info { border: 1px solid #ddd; padding: 20px; border-radius: 8px; margin-bottom: 20px; }
            table { width: 100%; border-collapse: collapse; }
            td { padding: 8px; }
            .total { font-size: 20px; font-weight: bold; color: #FD561E; }
          </style>
        </head>
        <body>
          <div class="ticket">
            ${printContent.innerHTML}
          </div>
          <script>window.onload = () => { window.print(); window.close(); }<\/script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const handleDownloadTicket = () => {
    const dataStr = JSON.stringify({
      ticketDetails,
      apiResponse,
      paymentData,
      timestamp: new Date().toISOString()
    }, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ticket_${ticketDetails?.ticketNumber || 'confirmation'}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Ticket details downloaded!');
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: 'Flight Ticket Confirmation',
        text: `Flight ticket confirmed! Ticket Number: ${ticketDetails?.ticketNumber}, PNR: ${ticketDetails?.pnr}`,
        url: window.location.href,
      }).catch(() => toast.info('Share cancelled'));
    } else {
      toast.info('Share functionality coming soon!');
    }
  };

  const formatCurrency = (amount) => {
    if (!amount) return '₹0';
    const match = amount.toString().match(/([0-9.]+)/);
    if (match) {
      return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        minimumFractionDigits: 0,
      }).format(parseFloat(match[1]));
    }
    return `₹${amount}`;
  };

  // Loading Screen during initial load
  if (loading && !verifyingPayment) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-orange-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center"
        >
          <motion.div
            animate={{ 
              y: [0, -20, 0],
              rotate: [0, -5, 5, -5, 0]
            }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            className="mb-6"
          >
            <Plane className="w-20 h-20 text-orange-500 mx-auto" />
          </motion.div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Processing Your Booking</h2>
          <p className="text-gray-600 mb-6">Please wait while we confirm your ticket with the airline...</p>
          <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-orange-500 to-orange-600 rounded-full"
              animate={{ width: ["0%", "100%"] }}
              transition={{ duration: 3, repeat: Infinity }}
            />
          </div>
          <p className="text-xs text-gray-500 mt-4">⏱️ This may take a few seconds. Please do not close this window.</p>
        </motion.div>
      </div>
    );
  }

  // Verification Loading Screen
  if (verifyingPayment) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-orange-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full"
        >
          <div className="text-center mb-6">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              className="inline-block"
            >
              <div className="w-16 h-16 border-4 border-orange-200 border-t-orange-500 rounded-full"></div>
            </motion.div>
          </div>

          <h2 className="text-xl font-bold text-gray-800 text-center mb-2">Verifying Your Payment</h2>
          <p className="text-gray-600 text-center text-sm mb-6">Please wait while we confirm your payment and issue your ticket...</p>

          <div className="w-full bg-gray-200 rounded-full h-2 mb-6">
            <div 
              className="h-full bg-gradient-to-r from-orange-500 to-orange-600 rounded-full transition-all duration-300"
              style={{ width: `${(verificationStep / verificationSteps.length) * 100}%` }}
            />
          </div>

          <div className="space-y-3">
            {verificationSteps.map((step, index) => (
              <div 
                key={index} 
                className={`flex items-center gap-3 transition-opacity duration-300 ${
                  index + 1 <= verificationStep ? 'opacity-100' : 'opacity-40'
                }`}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm ${
                  index + 1 < verificationStep ? 'bg-green-500' : 
                  (index + 1 === verificationStep ? 'bg-orange-500' : 'bg-gray-300')
                }`}>
                  {index + 1 < verificationStep ? '✓' : step.icon}
                </div>
                <span className={`text-sm ${index + 1 === verificationStep ? 'font-semibold text-gray-800' : 'text-gray-600'}`}>
                  {step.label}
                </span>
              </div>
            ))}
          </div>

          <p className="text-xs text-gray-500 text-center mt-6">⏱️ This may take up to 30 seconds. Please do not close this window.</p>
        </motion.div>
      </div>
    );
  }

  // Error Dialog Component
  const ErrorDialog = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto"
      >
        <div className="bg-orange-50 p-4 rounded-t-2xl border-b border-orange-100">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-6 h-6 text-red-500" />
            <h3 className="text-lg font-bold text-red-700">Payment Verification Error</h3>
            <button onClick={() => setOpenErrorDialog(false)} className="ml-auto text-gray-500 hover:text-gray-700">
              ✕
            </button>
          </div>
        </div>
        
        <div className="p-6">
          {errorDetails && (
            <>
              <div className={`p-4 rounded-lg mb-4 ${
                errorDetails.errorType === 'duplicate_request_error' ? 'bg-yellow-50 border border-yellow-200' : 'bg-red-50 border border-red-200'
              }`}>
                <p className="font-semibold text-gray-800">{errorDetails.message}</p>
              </div>

              <div className="bg-gray-50 rounded-lg p-4 mb-4">
                <h4 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
                  <Info className="w-4 h-4" /> Error Details
                </h4>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-gray-500">Error Code</p>
                    <p className="font-mono text-red-600">{errorDetails.errorCode}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Error Type</p>
                    <p className="text-gray-800">{errorDetails.errorType}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">HTTP Status</p>
                    <p className="text-gray-800">{errorDetails.status}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Timestamp</p>
                    <p className="text-gray-800 text-xs">{new Date().toLocaleString()}</p>
                  </div>
                </div>
                
                <button
                  onClick={handleCopyErrorDetails}
                  className="mt-3 text-sm text-orange-600 hover:text-orange-700 flex items-center gap-1"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                  </svg>
                  Copy Error Details
                </button>
              </div>

              <div className="bg-blue-50 rounded-lg p-4">
                <h4 className="font-semibold text-gray-700 mb-2 flex items-center gap-2">
                  <svg className="w-4 h-4 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  What you can do:
                </h4>
                <ul className="text-sm text-gray-600 space-y-1 ml-6 list-disc">
                  <li>Try refreshing the page or checking your booking status in "My Bookings"</li>
                  <li>Contact customer support with the error details above</li>
                  <li>If you were charged, the amount will be refunded within 5-7 business days</li>
                  <li>Please save the error details for reference when contacting support</li>
                </ul>
              </div>
            </>
          )}
        </div>
        
        <div className="p-4 border-t border-gray-100 flex gap-3">
          <button
            onClick={handleRetry}
            className="flex-1 bg-orange-500 text-white py-2 rounded-lg font-semibold hover:bg-orange-600 transition flex items-center justify-center gap-2"
          >
            <RefreshCw className="w-4 h-4" /> Retry
          </button>
          <button
            onClick={handleGoHome}
            className="flex-1 border border-gray-300 py-2 rounded-lg font-semibold hover:bg-gray-50 transition"
          >
            Go Home
          </button>
        </div>
      </motion.div>
    </div>
  );

  // Don't show anything until we have ticket details
  if (!ticketDetails || verifyingPayment || loading) {
    return <ErrorDialog />;
  }

  // Main Success View
  return (
    <>
      {openErrorDialog && <ErrorDialog />}
      
      <div className="min-h-screen bg-gray-100 py-8 px-4">
        <div className="max-w-5xl mx-auto">
          {/* Success Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-2xl p-6 mb-6 text-white text-center"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200, damping: 20 }}
              className="inline-block"
            >
              <CheckCircle className="w-16 h-16 mx-auto mb-3" />
            </motion.div>
            <h1 className="text-2xl md:text-3xl font-bold mb-2">Ticket Confirmed! 🎉</h1>
            <p className="text-orange-100">Your journey has been successfully booked</p>
            <div className="inline-flex items-center gap-1 bg-white/20 rounded-full px-3 py-1 mt-3 text-sm">
              <Ticket className="w-4 h-4" /> E-Ticket Issued
            </div>
          </motion.div>

          {/* Main Ticket Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-2xl shadow-lg overflow-hidden"
          >
            <div className="p-6 md:p-8">
              {/* Ticket Number Highlight */}
              {ticketDetails.ticketNumber !== 'N/A' && (
                <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6 text-center relative">
                  <p className="text-xs text-green-600 font-semibold uppercase tracking-wide">Electronic Ticket Number</p>
                  <p className="text-2xl md:text-3xl font-mono font-bold text-green-700 tracking-wider">{ticketDetails.ticketNumber}</p>
                  <p className="text-xs text-gray-500 mt-1">Issued on: {ticketDetails.issuedDate}</p>
                  <div className="absolute top-2 right-2">
                    <span className="bg-green-500 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
                      <CheckCircle className="w-3 h-3" /> Confirmed
                    </span>
                  </div>
                </div>
              )}

              {/* Passenger Count Badge */}
              {ticketDetails.passengerCount > 1 && (
                <div className="flex justify-end mb-4">
                  <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm flex items-center gap-1">
                    <Users className="w-4 h-4" /> {ticketDetails.passengerCount} Passengers
                  </span>
                </div>
              )}

              {/* Flight Boarding Pass Card */}
              <div className="bg-gradient-to-r from-blue-900 to-blue-800 rounded-xl mb-6 overflow-hidden">
                <div className="p-5 text-white">
                  <div className="flex flex-wrap items-center gap-4 mb-4">
                    <div className="bg-white/20 rounded-xl p-3">
                      <Plane className="w-10 h-10" />
                    </div>
                    <div className="flex-1">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div>
                          <p className="text-xs text-blue-200">Flight</p>
                          <p className="text-xl font-bold">{ticketDetails.carrier} {ticketDetails.flightNumber}</p>
                        </div>
                        <div>
                          <p className="text-xs text-blue-200">Class</p>
                          <p className="font-semibold">{ticketDetails.bookingClass} • {ticketDetails.fareBasis}</p>
                        </div>
                        <div>
                          <p className="text-xs text-blue-200">Status</p>
                          <span className="bg-green-500 text-white text-xs px-2 py-1 rounded-full">{ticketDetails.ticketStatus}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="border-t border-white/20 p-5">
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div className="text-center flex-1">
                      <p className="text-3xl md:text-4xl font-bold text-white">{ticketDetails.origin}</p>
                      <p className="text-xs text-blue-200 mt-1">{ticketDetails.departureTime?.split(',')[0]}</p>
                    </div>
                    <div className="text-center flex-1">
                      <div className="flex items-center gap-2 text-blue-200">
                        <div className="h-px flex-1 bg-blue-300"></div>
                        <Plane className="w-5 h-5 transform rotate-90" />
                        <div className="h-px flex-1 bg-blue-300"></div>
                      </div>
                      <p className="text-xs mt-1">Direct Flight</p>
                    </div>
                    <div className="text-center flex-1">
                      <p className="text-3xl md:text-4xl font-bold text-white">{ticketDetails.destination}</p>
                      <p className="text-xs text-blue-200 mt-1">{ticketDetails.departureTime?.split(',')[1]}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Details Grid */}
              <div className="grid md:grid-cols-2 gap-5 mb-6">
                {/* Passenger Information */}
                <div className="border rounded-xl p-4">
                  <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                    <User className="w-5 h-5 text-orange-500" /> Passenger Information
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Name</span>
                      <span className="font-semibold">{ticketDetails.passengerName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Passenger Type</span>
                      <span>{ticketDetails.passengerType}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Gender / Age</span>
                      <span>{ticketDetails.passengerGender} / {ticketDetails.passengerAge} years</span>
                    </div>
                    {ticketDetails.allPassengers?.length > 1 && (
                      <div className="flex justify-between">
                        <span className="text-gray-500">Additional Passengers</span>
                        <div className="flex flex-wrap gap-1 justify-end">
                          {ticketDetails.allPassengers.slice(1).map((p, idx) => (
                            <span key={idx} className="bg-gray-100 text-xs px-2 py-1 rounded">
                              {p.name} ({p.type})
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Booking References */}
                <div className="border rounded-xl p-4">
                  <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                    <Ticket className="w-5 h-5 text-orange-500" /> Booking References
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-500">PNR / Locator</span>
                      <span className="font-mono font-semibold">{ticketDetails.airlinePNR || ticketDetails.pnr}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">GDS Locator</span>
                      <span className="font-mono">{ticketDetails.providerLocator}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Plating Carrier</span>
                      <span>{ticketDetails.platingCarrier}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Ticket Number</span>
                      <span className="font-mono text-sm">{ticketDetails.ticketNumber}</span>
                    </div>
                  </div>
                </div>

                {/* Flight Details */}
                <div className="border rounded-xl p-4">
                  <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                    <Plane className="w-5 h-5 text-orange-500" /> Flight Details
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Route</span>
                      <span className="font-semibold">{ticketDetails.origin} → {ticketDetails.destination}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Departure</span>
                      <span>{ticketDetails.departureTime}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Class / Fare Basis</span>
                      <span>{ticketDetails.bookingClass} / {ticketDetails.fareBasis}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Baggage Allowance</span>
                      <span className="flex items-center gap-1"><Luggage className="w-4 h-4" /> {ticketDetails.baggageAllowance}</span>
                    </div>
                  </div>
                </div>

                {/* Fare Breakdown */}
                <div className="border rounded-xl p-4">
                  <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                    <CreditCard className="w-5 h-5 text-orange-500" /> Fare Breakdown
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Base Fare</span>
                      <span>{ticketDetails.basePrice}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Taxes & Surcharges</span>
                      <span>{ticketDetails.taxes}</span>
                    </div>
                    {ticketDetails.taxBreakdown?.slice(0, 3).map((tax, idx) => (
                      <div key={idx} className="flex justify-between pl-4">
                        <span className="text-gray-400 text-xs">• {tax.category}</span>
                        <span className="text-xs">{tax.amount}</span>
                      </div>
                    ))}
                    <div className="border-t pt-2 mt-2 flex justify-between font-semibold">
                      <span>Total Paid</span>
                      <span className="text-orange-600 text-lg">{ticketDetails.totalPrice}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Policies */}
              <div className="border rounded-xl p-4 mb-6">
                <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                  <Shield className="w-5 h-5 text-orange-500" /> Ticket Policies
                </h3>
                <div className="flex flex-wrap gap-2 mb-3">
                  <span className={`px-3 py-1 rounded-full text-sm flex items-center gap-1 ${
                    ticketDetails.refundable ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                  }`}>
                    {ticketDetails.refundable ? <CheckCircle className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                    {ticketDetails.refundable ? 'Refundable' : 'Non-Refundable'}
                  </span>
                  <span className={`px-3 py-1 rounded-full text-sm flex items-center gap-1 ${
                    ticketDetails.exchangeable ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'
                  }`}>
                    {ticketDetails.exchangeable ? <CheckCircle className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                    {ticketDetails.exchangeable ? 'Exchangeable' : 'Non-Exchangeable'}
                  </span>
                  <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm">
                    Plating Carrier: {ticketDetails.platingCarrier}
                  </span>
                </div>
                
                {(ticketDetails.changePenalty !== 'N/A' || ticketDetails.cancelPenalty !== 'N/A') && (
                  <div className="bg-orange-50 rounded-lg p-3 mt-2">
                    <p className="text-sm font-semibold text-gray-700 mb-1 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" /> Penalty Information:
                    </p>
                    {ticketDetails.changePenalty !== 'N/A' && (
                      <p className="text-xs text-gray-600">• Change Penalty: {ticketDetails.changePenalty}</p>
                    )}
                    {ticketDetails.cancelPenalty !== 'N/A' && (
                      <p className="text-xs text-gray-600">• Cancellation Penalty: {ticketDetails.cancelPenalty}</p>
                    )}
                  </div>
                )}
              </div>

              {/* Payment Details */}
              {paymentData && (
                <div className="border rounded-xl p-4 mb-6">
                  <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                    <CreditCard className="w-5 h-5 text-orange-500" /> Payment Details
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
                    <div>
                      <p className="text-gray-500 text-xs">Transaction ID</p>
                      <p className="font-mono text-xs">{paymentData.transactionid || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-gray-500 text-xs">Order ID</p>
                      <p className="font-mono text-xs">{paymentData.bdorderid || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-gray-500 text-xs">Amount Paid</p>
                      <p className="font-semibold text-orange-600">{formatCurrency(paymentData.amount)}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Terms & Conditions */}
              <div className="bg-gray-50 rounded-xl p-4 mb-6">
                <h4 className="font-semibold text-gray-700 mb-2 text-sm">Important Information</h4>
                <ul className="text-xs text-gray-500 space-y-1 list-disc ml-4">
                  <li>Please report at least 2 hours before departure for domestic flights</li>
                  <li>Carry a valid government-issued photo ID (Aadhar, Passport, Driver's License)</li>
                  <li>Web check-in opens 48 hours before departure</li>
                  <li>This e-ticket is non-transferable</li>
                  <li>For cancellations/modifications, please contact our customer support</li>
                </ul>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-3 justify-center">
                <button
                  onClick={handleGoHome}
                  className="bg-orange-500 text-white px-6 py-2 rounded-lg font-semibold hover:bg-orange-600 transition flex items-center gap-2"
                >
                  <Home className="w-4 h-4" /> Go to Home
                </button>
                <button
                  onClick={handleViewBookings}
                  className="border border-gray-300 px-6 py-2 rounded-lg font-semibold hover:bg-gray-50 transition flex items-center gap-2"
                >
                  <Receipt className="w-4 h-4" /> My Bookings
                </button>
                <button
                  onClick={handlePrintTicket}
                  className="border border-gray-300 px-6 py-2 rounded-lg font-semibold hover:bg-gray-50 transition flex items-center gap-2"
                >
                  <Printer className="w-4 h-4" /> Print Ticket
                </button>
                <button
                  onClick={handleDownloadTicket}
                  className="border border-gray-300 px-6 py-2 rounded-lg font-semibold hover:bg-gray-50 transition flex items-center gap-2"
                >
                  <Download className="w-4 h-4" /> Download
                </button>
                <button
                  onClick={handleShare}
                  className="border border-gray-300 px-6 py-2 rounded-lg font-semibold hover:bg-gray-50 transition flex items-center gap-2"
                >
                  <Share2 className="w-4 h-4" /> Share
                </button>
              </div>
            </div>
          </motion.div>

          {/* Hidden Print Template */}
          <div ref={printRef} className="hidden">
            <div className="max-w-2xl mx-auto p-6">
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-orange-500">E-Ticket / Itinerary Receipt</h2>
                <p className="text-gray-500 text-sm">Issued on: {ticketDetails.issuedDate}</p>
              </div>
              
              <div className="border rounded-lg p-4 mb-4">
                <h3 className="font-bold text-lg mb-3">Booking References</h3>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div><span className="text-gray-500">PNR:</span> {ticketDetails.pnr}</div>
                  <div><span className="text-gray-500">Ticket No:</span> {ticketDetails.ticketNumber}</div>
                  <div><span className="text-gray-500">Airline PNR:</span> {ticketDetails.airlinePNR || ticketDetails.pnr}</div>
                  <div><span className="text-gray-500">Carrier:</span> {ticketDetails.platingCarrier}</div>
                </div>
              </div>
              
              <div className="border rounded-lg p-4 mb-4">
                <h3 className="font-bold text-lg mb-3">Flight Itinerary</h3>
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-2xl font-bold">{ticketDetails.origin}</p>
                    <p className="text-sm text-gray-500">{ticketDetails.departureTime}</p>
                  </div>
                  <div className="text-center">
                    <ArrowRight className="w-8 h-8 text-gray-400" />
                    <p className="text-xs">Direct</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{ticketDetails.destination}</p>
                    <p className="text-sm text-gray-500">{ticketDetails.departureTime}</p>
                  </div>
                </div>
                <div className="mt-3 pt-3 border-t">
                  <p><span className="font-semibold">Flight:</span> {ticketDetails.carrier} {ticketDetails.flightNumber}</p>
                  <p><span className="font-semibold">Class:</span> {ticketDetails.bookingClass} • {ticketDetails.fareBasis}</p>
                </div>
              </div>
              
              <div className="border rounded-lg p-4 mb-4">
                <h3 className="font-bold text-lg mb-3">Passenger Details</h3>
                {ticketDetails.allPassengers?.map((passenger, idx) => (
                  <div key={idx} className="mb-2">
                    <p><span className="font-semibold">Name:</span> {passenger.name}</p>
                    <p><span className="font-semibold">Type:</span> {passenger.type}</p>
                    <p><span className="font-semibold">Ticket:</span> {passenger.ticketNumber}</p>
                  </div>
                ))}
              </div>
              
              <div className="border rounded-lg p-4">
                <h3 className="font-bold text-lg mb-3">Fare Summary</h3>
                <div className="flex justify-between">
                  <span>Base Fare:</span>
                  <span>{ticketDetails.basePrice}</span>
                </div>
                <div className="flex justify-between">
                  <span>Taxes:</span>
                  <span>{ticketDetails.taxes}</span>
                </div>
                <div className="flex justify-between font-bold text-lg mt-2 pt-2 border-t">
                  <span>Total:</span>
                  <span className="text-orange-500">{ticketDetails.totalPrice}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default TicketConfirmationScreen;