// src/modules/flights/pages/PassengerDetailsReviewPage.jsx
//
// Flow:
//   1. Receives pnrRequestBody from BookingReviewPage via navigate state
//   2. On mount → calls callPnrAPI(pnrRequestBody)
//   3. Saves response to usePnrStore via setPnrResponse()
//   4. Reads usePnrStore.transformedPnr for display
//   5. "Proceed to Payment" → BillDesk (existing logic untouched)

import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import usePnrStore from '../store/usePnrStore';
import { callPnrAPI } from '../services/pnrService';
import { savePnrToStorage } from '../services/paymentConfirmationService';
import { createBillDeskOrder } from '../services/paymentGatewayservices';
import {
  FaArrowLeft, FaPlane, FaSpinner, FaCheckCircle, FaTimesCircle,
  FaExclamationTriangle, FaCopy, FaPrint, FaDownload, FaShare,
  FaUser, FaEnvelope, FaPhone, FaMapMarkerAlt, FaClock,
  FaArrowRight, FaShieldAlt, FaTag, FaReceipt, FaInfoCircle,
  FaPlaneDeparture, FaPlaneArrival, FaSuitcase, FaCheck,
} from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  Grid,
  Box,
  Chip,
  Card,
  CardContent,
  Button,
  IconButton,
  Avatar,
  Alert,
  AlertTitle,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
  useMediaQuery,
  useTheme,
  CircularProgress,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Collapse
} from '@mui/material';
import {
  FlightTakeoff,
  Person,
  ContentCopy,
  Close,
  Luggage,
  Restaurant,
  Wifi,
  CurrencyRupee,
  VerifiedUser,
  Security,
  EventSeat,
  ArrowForward,
  ErrorOutline,
  WarningAmber,
  Cancel,
  InfoOutlined,
  FlightLand,
  ExpandMore,
  ExpandLess
} from '@mui/icons-material';
import { format } from 'date-fns';
import { createBillDeskOrder } from '../services/paymentGatewayservices';
import { usePricingBooking } from '../contexts/PricingBookingContext';
import { usePnrResponse } from '../contexts/PnrResponseContext';
import { fetchAirlines } from '../services/airlineService';

// Brand color - used sparingly as an accent
const ACCENT_COLOR = '#FD561E';

// ── Formatters ───────────────────────────────────────────────────
const fmt = {
  money: (str) => {
    if (!str) return '₹0';
    const num = parseFloat(String(str).replace(/[^0-9.]/g, ''));
    return isNaN(num) ? str : `₹${Math.round(num).toLocaleString('en-IN')}`;
  },
  dateTime: (iso) => {
    if (!iso) return 'N/A';
    try { return new Date(iso).toLocaleString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true }); }
    catch { return iso; }
  },
  date: (iso) => {
    if (!iso) return 'N/A';
    try { return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }); }
    catch { return iso; }
  },
  time: (iso) => {
    if (!iso) return '--:--';
    try { return new Date(iso).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true }); }
    catch { return '--:--'; }
  },
  dur: (mins) => {
    if (!mins) return '—';
    const h = Math.floor(mins / 60), m = mins % 60;
    return m > 0 ? `${h}h ${m}m` : `${h}h`;
  },
};

const paxLabel = (type) => type === 'ADT' ? 'Adult' : type === 'CNN' ? 'Child' : 'Infant';

// ── Loading screen ───────────────────────────────────────────────
const LoadingScreen = () => (
  <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
    <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-12 text-center max-w-xs w-full">
      <div className="w-16 h-16 border-4 border-[#FD561E] border-t-transparent rounded-full animate-spin mx-auto mb-5" />
      <h2 className="font-black text-gray-800 text-lg mb-1">Creating Your Booking</h2>
      <p className="text-sm text-gray-400">Connecting to airline system...</p>
      <div className="mt-4 space-y-1.5">
        {['Reserving seats...', 'Confirming fare...', 'Generating PNR...'].map(t => (
          <div key={t} className="flex items-center gap-2 text-xs text-gray-400 justify-center">
            <div className="w-1.5 h-1.5 rounded-full bg-[#FD561E] animate-pulse" />{t}
          </div>
        ))}
      </div>
    </div>
  </div>
);

// ── Error screen ─────────────────────────────────────────────────
const ErrorScreen = ({ message, onBack }) => (
  <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
    <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-10 text-center max-w-sm w-full">
      <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-5">
        <FaTimesCircle className="text-red-500" size={28} />
      </div>
      <h2 className="font-black text-gray-800 text-lg mb-2">Booking Failed</h2>
      <p className="text-sm text-gray-500 mb-6">{message}</p>
      <button onClick={onBack} className="w-full bg-[#FD561E] text-white py-3.5 rounded-2xl font-black hover:bg-[#e04e1b] transition-colors">
        ← Go Back
      </button>
    </div>
  </div>
);

// ── Main Page ────────────────────────────────────────────────────
const PassengerDetailsReviewPage = () => {
  const navigate = useNavigate();
  const { state } = useLocation();

  // Data from BookingReviewPage
  const pnrRequestBody  = state?.pnrRequestBody  ?? null;
  const selectedOutbound = state?.selectedOutbound ?? null;
  const selectedInbound  = state?.selectedInbound  ?? null;
  const passengerCounts  = state?.passengerCounts  ?? { ADT: 1, CNN: 0, INF: 0 };
  const tripType         = state?.tripType         ?? 'one-way';
  const selectedFare     = state?.selectedFare     ?? null;

  // PNR store
  const transformedPnr = usePnrStore((s) => s.transformedPnr);
  const rawPnrResponse = usePnrStore((s) => s.rawPnrResponse);
  const isLoading      = usePnrStore((s) => s.isLoading);
  const error          = usePnrStore((s) => s.error);
  const setPnrResponse = usePnrStore((s) => s.setPnrResponse);
  const setLoading     = usePnrStore((s) => s.setLoading);
  const setError       = usePnrStore((s) => s.setError);

  const [snackbar,     setSnackbar]     = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ── Call PNR API on mount ────────────────────────────────────────
  useEffect(() => {
    // If PNR already loaded (e.g. navigating back), don't re-call
    if (transformedPnr) return;

    if (!pnrRequestBody) {
      setError('No booking data found. Please go back and try again.');
      return;
    }

    const callPnr = async () => {
      setLoading(true);
      const raw = await callPnrAPI(pnrRequestBody);
      if (raw?.success) {
        setPnrResponse(raw, pnrRequestBody);  // transforms + saves to store
        // Save raw PNR response to localStorage BEFORE BillDesk redirect.
        // After BillDesk redirects back, Zustand store is wiped (page reload).
        // paymentConfirmationService reads from localStorage to issue the ticket.
        savePnrToStorage(raw);
      } else {
        setError(raw?.error ?? 'Booking failed. Please try again.');
      }
    };

    callPnr();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Handlers ─────────────────────────────────────────────────────
  const handleCopy = (text, label) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isSmall = useMediaQuery(theme.breakpoints.down('sm'));
  
  // ============ GET DATA FROM CONTEXTS ============
  const { 
    pnrData: contextPnrData,
    loading: pnrLoading,
    getPnrNumber,
    getAirLocatorCode,
    getFlightSegments,
    getPassengers,
    getTotalPrice,
    getWarnings,
    getPenalties,
    isBookingConfirmed
  } = usePnrResponse();
  
  const { getCompleteBookingData } = usePricingBooking();
  const bookingData = getCompleteBookingData();
  
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [openRawDialog, setOpenRawDialog] = useState(false);
  const [openErrorDialog, setOpenErrorDialog] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [airlines, setAirlines] = useState([]);
  const [airlinesLoading, setAirlinesLoading] = useState(true);
  const [apiError, setApiError] = useState(null);
  const [fareDetailsOpen, setFareDetailsOpen] = useState(false); // State for fare dropdown
  
  // ============ FETCH AIRLINES DATA ============
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
  
  // Helper function to get airline details by code
  const getAirlineDetails = (code) => {
    const airline = airlines.find(a => a.code === code);
    return airline || { name: code, logo_url: null };
  };
  
  // ============ PARSE RAW RESPONSE DATA ============
  const parseRawResponse = () => {
    if (!contextPnrData?.rawResponse) return null;
    
    try {
      const rawResponse = contextPnrData.rawResponse;
      
      // Check if there's an error in the response
      const envelope = rawResponse?.data?.['SOAP:Envelope'] || rawResponse?.['SOAP:Envelope'];
      const body = envelope?.['SOAP:Body'];
      
      // Check for SOAP Fault (Error response)
      // Check for SOAP Fault (Error response)
const soapFault = body?.['SOAP:Fault'];
if (soapFault) {
  // Get the ErrorInfo from the correct path
  const errorInfo = soapFault?.detail?.['common_v54_0:ErrorInfo'];
  
  const error = {
    type: 'SOAP_FAULT',
    faultCode: soapFault.faultcode,
    faultString: soapFault.faultstring,  // ← This is the main error message you want
    errorCode: errorInfo?.['common_v54_0:Code'],
    errorService: errorInfo?.['common_v54_0:Service'],
    errorType: errorInfo?.['common_v54_0:Type'],
    errorDescription: errorInfo?.['common_v54_0:Description'],
    transactionId: errorInfo?.['common_v54_0:TransactionId'],
    traceId: errorInfo?.['common_v54_0:TraceId']
  };
  
  setApiError(error);
  setOpenErrorDialog(true);
  return null;
}
      
      // Continue with normal parsing if no error
      const airCreateReservationRsp = body?.['universal:AirCreateReservationRsp'];
      const universalRecord = airCreateReservationRsp?.['universal:UniversalRecord'];
      const airReservation = universalRecord?.['air:AirReservation'];
      const airPricingInfoList = airReservation?.['air:AirPricingInfo'] || [];
      const bookingTravelers = universalRecord?.['common_v54_0:BookingTraveler'] || [];
      
      let totalPrice = 0;
      let basePrice = 0;
      let taxes = 0;
      let taxBreakdown = [];
      let baggageAllowance = null;
      let isRefundable = false;
      let ticketingDeadline = null;
      let changePenalty = null;
      let cancelPenalty = null;
      
      if (Array.isArray(airPricingInfoList) && airPricingInfoList.length > 0) {
        airPricingInfoList.forEach(api => {
          const apiAttrs = api.$ || {};
          const price = parseInt(String(apiAttrs.TotalPrice || '0').replace('INR', '')) || 0;
          const base = parseInt(String(apiAttrs.BasePrice || '0').replace('INR', '')) || 0;
          const tax = parseInt(String(apiAttrs.Taxes || '0').replace('INR', '')) || 0;
          
          totalPrice += price;
          basePrice += base;
          taxes += tax;
          
          if (apiAttrs.Refundable === 'true') isRefundable = true;
          if (apiAttrs.LatestTicketingTime) ticketingDeadline = apiAttrs.LatestTicketingTime;
          
          const taxInfoList = api['air:TaxInfo'] || [];
          if (Array.isArray(taxInfoList)) {
            taxInfoList.forEach(taxInfo => {
              const taxAttrs = taxInfo.$ || {};
              taxBreakdown.push({
                category: taxAttrs.Category,
                amount: taxAttrs.Amount,
                key: taxAttrs.Key
              });
            });
          }
          
          const fareInfo = api['air:FareInfo'];
          const baggageAllowanceObj = fareInfo?.['air:BaggageAllowance'];
          if (baggageAllowanceObj) {
            const maxWeight = baggageAllowanceObj['air:MaxWeight']?.$;
            if (maxWeight) {
              baggageAllowance = {
                weight: maxWeight.Value,
                unit: maxWeight.Unit
              };
            }
          }
          
          const changePenaltyObj = api['air:ChangePenalty'];
          const cancelPenaltyObj = api['air:CancelPenalty'];
          
          if (changePenaltyObj) {
            changePenalty = {
              applies: changePenaltyObj.$?.PenaltyApplies,
              amount: changePenaltyObj['air:Amount']?.$?.Amount
            };
          }
          
          if (cancelPenaltyObj) {
            cancelPenalty = {
              applies: cancelPenaltyObj.$?.PenaltyApplies,
              amount: cancelPenaltyObj['air:Amount']?.$?.Amount
            };
          }
        });
      }
      
      const airSegments = airReservation?.['air:AirSegment'] || [];
      const flightSegments = [];
      
      const airSegmentsArray = Array.isArray(airSegments) ? airSegments : [airSegments];
      airSegmentsArray.forEach(seg => {
        const segAttrs = seg.$ || {};
        flightSegments.push({
          key: segAttrs.Key,
          carrier: segAttrs.Carrier,
          flightNumber: segAttrs.FlightNumber,
          origin: segAttrs.Origin,
          destination: segAttrs.Destination,
          departureTime: segAttrs.DepartureTime,
          arrivalTime: segAttrs.ArrivalTime,
          classOfService: segAttrs.ClassOfService,
          cabinClass: segAttrs.CabinClass,
          equipment: segAttrs.Equipment,
          status: segAttrs.Status,
          isEticketable: segAttrs.ETicketability === 'Yes'
        });
      });
      
      const passengers = [];
      const bookingTravelersArray = Array.isArray(bookingTravelers) ? bookingTravelers : [bookingTravelers];
      
      bookingTravelersArray.forEach(traveler => {
        const travelerAttrs = traveler.$ || {};
        const nameObj = traveler['common_v54_0:BookingTravelerName']?.$ || {};
        
        passengers.push({
          type: travelerAttrs.TravelerType,
          firstName: nameObj.First || '',
          lastName: nameObj.Last || '',
          prefix: nameObj.Prefix || '',
          age: travelerAttrs.Age,
          dob: travelerAttrs.DOB,
          gender: travelerAttrs.Gender,
          key: travelerAttrs.Key
        });
      });
      
      const responseMessages = airCreateReservationRsp?.['common_v54_0:ResponseMessage'] || [];
      const warnings = [];
      const responseMessagesArray = Array.isArray(responseMessages) ? responseMessages : [responseMessages];
      
      responseMessagesArray.forEach(msg => {
        if (msg.$?.Type === 'Warning') {
          warnings.push({
            code: msg.$.Code,
            message: msg._ || msg,
            type: msg.$.Type
          });
        }
      });
      
      const ssrList = universalRecord?.['common_v54_0:SSR'] || [];
      let email = '';
      let phone = '';
      
      const ssrArray = Array.isArray(ssrList) ? ssrList : [ssrList];
      ssrArray.forEach(ssr => {
        const ssrAttrs = ssr.$ || {};
        if (ssrAttrs.Type === 'CTCE') {
          email = ssrAttrs.FreeText || '';
        }
        if (ssrAttrs.Type === 'CTCM') {
          phone = ssrAttrs.FreeText || '';
        }
      });
      
      const formOfPayment = universalRecord?.['common_v54_0:FormOfPayment']?.$?.Type || 'Cash';
      
      return {
        pnrNumber: universalRecord?.$?.LocatorCode,
        providerLocator: universalRecord?.['universal:ProviderReservationInfo']?.$?.LocatorCode,
        totalPrice: `INR ${totalPrice.toLocaleString()}`,
        basePrice: `INR ${basePrice.toLocaleString()}`,
        taxes: `INR ${taxes.toLocaleString()}`,
        taxBreakdown,
        baggageAllowance,
        isRefundable,
        ticketingDeadline,
        changePenalty,
        cancelPenalty,
        flightSegments,
        passengers,
        warnings,
        contactInfo: { email, phone: { number: phone, countryCode: '91' } },
        formOfPayment,
        bookingStatus: universalRecord?.$?.Status || 'Active',
        createdAt: airReservation?.$?.CreateDate
      };
    } catch (error) {
      console.error('Error parsing response:', error);
      return null;
    }
  };
  
  const parsedData = parseRawResponse();
  
  const displayPnrNumber = parsedData?.pnrNumber || getPnrNumber();
  const displayAirLocatorCode = parsedData?.providerLocator || getAirLocatorCode();
  const displayFlightSegments = parsedData?.flightSegments?.length > 0 ? parsedData.flightSegments : getFlightSegments();
  const displayPassengers = parsedData?.passengers?.length > 0 ? parsedData.passengers : getPassengers();
  const displayTotalPrice = parsedData?.totalPrice || getTotalPrice();
  const warnings = parsedData?.warnings || getWarnings();
  const penalties = {
    change: parsedData?.changePenalty,
    cancel: parsedData?.cancelPenalty
  };
  
  const contactInfo = parsedData?.contactInfo || bookingData?.contactInfo;
  const selectedSeat = bookingData?.selectedSeat;
  
  useEffect(() => {
    console.log('\n' + '='.repeat(80));
    console.log('📄 PASSENGER DETAILS REVIEW PAGE - MOUNTED');
    console.log('='.repeat(80));
    console.log('📦 Parsed Data:', parsedData);
    console.log('   - PNR Number:', displayPnrNumber);
    console.log('   - Total Price:', displayTotalPrice);
    console.log('   - Flight Segments:', displayFlightSegments.length);
    console.log('   - Passengers:', displayPassengers.length);
    console.log('='.repeat(80) + '\n');
  }, [parsedData, displayPnrNumber, displayTotalPrice, displayFlightSegments, displayPassengers]);

  if (pnrLoading || airlinesLoading) {
    return (
      <Container maxWidth="lg" sx={{ py: 3 }}>
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <CircularProgress size={50} />
          <Typography variant="h6" sx={{ mt: 2 }}>Loading booking details...</Typography>
        </Paper>
      </Container>
    );
  }

  // Don't show the main content if there's an error (error dialog will handle it)
  if (apiError) {
    return (
      <Container maxWidth="lg" sx={{ py: 3 }}>
        {/* Error Dialog will be shown automatically */}
      </Container>
    );
  }

  if (!displayPnrNumber && !parsedData) {
    return (
      <Container maxWidth="lg" sx={{ py: 3 }}>
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Alert severity="warning">No Booking Found. Please contact support.</Alert>
          <Button variant="contained" onClick={() => navigate('/')} sx={{ mt: 2 }}>
            Return to Home
          </Button>
        </Paper>
      </Container>
    );
  }

  const handleCopy = (text, field) => {
    navigator.clipboard.writeText(text);
    setSnackbar(`${label} copied!`);
    setTimeout(() => setSnackbar(''), 2500);
  };

  const handlePrint = () => window.print();

  const handleDownload = () => {
    const data = JSON.stringify({ transformedPnr, rawPnrResponse }, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href = url;
    a.download = `booking_${transformedPnr?.universalLocatorCode ?? 'confirmation'}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setSnackbar('Downloaded!');
    setTimeout(() => setSnackbar(''), 2500);
  };

  const handleShare = () => {
    const pnr = transformedPnr?.universalLocatorCode;
    if (navigator.share && pnr) {
      navigator.share({ title: 'Flight Booking', text: `PNR: ${pnr}`, url: window.location.href });
    } else if (pnr) {
      handleCopy(pnr, 'PNR');
    }
  };

  // ── Proceed to Payment (BillDesk) ────────────────────────────────
  const handleProceedToPayment = async () => {
  const storeTransactionData = (responseData) => {
    try {
      const transactionData = {
        transaction_id: responseData?.transaction_id || null,
        bdorderid: responseData?.bdorderid || null,
        utranid: responseData?.utranid || null,
        status: responseData?.status || null,
        amount: responseData?.amount || displayTotalPrice,
        pnr_number: displayPnrNumber,
        air_locator_code: displayAirLocatorCode,
        traceid: responseData?.traceid || null,
        timestamp: responseData?.timestamp || new Date().toISOString(),
        initiated_at: new Date().toISOString(),
        payment_status: 'initiated',
        merchant_id: 'HYDBOBROS'
      };
      
      localStorage.setItem('currentTransaction', JSON.stringify(transactionData));
      sessionStorage.setItem('currentTransaction', JSON.stringify(transactionData));
      sessionStorage.setItem('paymentInitiated', 'true');
      sessionStorage.setItem('pnrNumber', displayPnrNumber);
      
      console.log('💾 TRANSACTION DATA STORED:', transactionData);
      return transactionData;
    } catch (error) {
      console.error('❌ Failed to store transaction data:', error);
      return null;
    }
  };

  const handleSubmitBooking = async () => {
    console.log('📤 SUBMIT BUTTON CLICKED - SENDING BOOKING DATA TO PAYMENT SERVICE');
    
    setIsSubmitting(true);
    try {
      // bookingData shape expected by createBillDeskOrder
      const bookingData = {
        contactInfo:   pnrRequestBody?.contactInfo,
        selectedFare,
        paymentMethod: 'Cash',
      };

      const response = await createBillDeskOrder(bookingData, {
        pnrNumber:       transformedPnr?.universalLocatorCode,
        totalPrice:      selectedFare?.grandTotal,
        bookingId:       rawPnrResponse?.bookingId,
        bookingStatus:   transformedPnr?.status,
      });

      if (!response?.success) throw new Error(response?.message ?? 'Order creation failed');

      const bdorderid  = response.data?.bdorderid;
      const authToken  = response.data?.authToken;
      const transaction_ID  = response.data?.transaction_id;
      const merchantId = 'HYDBOBROS';

      if (!bdorderid)  throw new Error('Order ID missing from response');
      if (!authToken)  throw new Error('Auth Token missing from response');


      localStorage.setItem('flight_bd_orderid',transaction_ID );
console.log('💾 bdorderid saved to localStorage:',transaction_ID );

      const billdeskUrl = `https://uat.bobros.co.in/billdesk_flight_checkout.php?merchantId=${merchantId}&bdorderid=${bdorderid}&authToken=${encodeURIComponent(authToken)}`;

      console.log('🔗 Redirecting to BillDesk:', billdeskUrl);

      sessionStorage.setItem('paymentInitiated', 'true');
      sessionStorage.setItem('pnrNumber', transformedPnr?.universalLocatorCode ?? '');

      const response = await createBillDeskOrder(bookingData, contextPnrData);
      
      console.log('✅ Payment Service Response:', response);
      
      if (!response || !response.success) {
        throw new Error(response?.message || 'Order creation failed');
      }
      
      const responseData = response.data || {};
      storeTransactionData(responseData);
      
      const bdorderid = responseData?.bdorderid;
      const authToken = responseData?.authToken;
      const transactionId = responseData?.transaction_id;
      const merchantId = "HYDBOBROS";
      
      if (!bdorderid) throw new Error('Order ID (bdorderid) missing from response');
      if (!authToken) throw new Error('Auth Token missing from response');
      
      const billdeskUrl = `https://uat.bobros.co.in/billdesk_checkout.php?merchantId=${merchantId}&bdorderid=${bdorderid}&authToken=${encodeURIComponent(authToken)}`;
      
      console.log('🔗 BILLDESK CHECKOUT URL:', billdeskUrl);
      
      sessionStorage.setItem('paymentInitiated', 'true');
      sessionStorage.setItem('pnrNumber', displayPnrNumber);
      sessionStorage.setItem('bdorderid', bdorderid);
      sessionStorage.setItem('transactionId', transactionId);
      
      window.location.href = billdeskUrl;

    } catch (err) {
      console.error('Payment initiation failed:', err);
      setSnackbar(`❌ Payment failed: ${err.message}`);
      setTimeout(() => setSnackbar(''), 4000);
      setIsSubmitting(false);
    }
  };

  // ── Guards ────────────────────────────────────────────────────────
  if (isLoading) return <LoadingScreen />;
  if (error)     return <ErrorScreen message={error} onBack={() => navigate(-1)} />;
  if (!transformedPnr) return <ErrorScreen message="No booking data found." onBack={() => navigate('/flights')} />;

  const pnr             = transformedPnr.universalLocatorCode;
  const airlineLocator  = transformedPnr.providerLocatorCode;
  const { travelers, segments, warnings, status, bookingId } = transformedPnr;
  const isConfirmed     = status === 'Active';

  const paxSummary = [
    passengerCounts.ADT > 0 && `${passengerCounts.ADT} Adult${passengerCounts.ADT > 1 ? 's' : ''}`,
    passengerCounts.CNN > 0 && `${passengerCounts.CNN} Child${passengerCounts.CNN > 1 ? 'ren' : ''}`,
    passengerCounts.INF > 0 && `${passengerCounts.INF} Infant${passengerCounts.INF > 1 ? 's' : ''}`,
  ].filter(Boolean).join(' · ');
  const getPassengerTypeLabel = (code) => {
    switch(code) {
      case 'ADT': return 'Adult';
      case 'CNN': return 'Child';
      case 'INF': return 'Infant';
      default: return code;
    }
  };

  const getSeatTypeLabel = (type) => {
    switch(type) {
      case 'window': return 'Window Seat';
      case 'aisle': return 'Aisle Seat';
      case 'middle': return 'Middle Seat';
      default: return type;
    }
  };

  // Format date for error display
  const formatErrorDateTime = (date) => {
    if (!date) return 'N/A';
    try {
      return format(new Date(date), 'dd MMM yyyy, hh:mm a');
    } catch {
      return date;
    }
  };

  // Calculate total tax amount for summary display
  const getTotalTaxAmount = () => {
    if (parsedData?.taxBreakdown && parsedData.taxBreakdown.length > 0) {
      let total = 0;
      parsedData.taxBreakdown.forEach(tax => {
        const amount = parseFloat(String(tax.amount).replace(/[^0-9]/g, ''));
        if (!isNaN(amount)) total += amount;
      });
      return `INR ${total.toLocaleString('en-IN')}`;
    }
    return parsedData?.taxes || 'INR 0';
  };

  return (
    <div className="min-h-screen bg-gray-50">

      {/* HEADER */}
      <div className="bg-white border-b border-gray-100 sticky top-0 z-30 shadow-sm">
        <div className="container mx-auto max-w-4xl px-4">
          <div className="flex items-center gap-3 py-3.5">
            <button onClick={() => navigate(-1)} className="w-9 h-9 flex items-center justify-center rounded-xl bg-gray-100 hover:bg-gray-200 transition-colors">
              <FaArrowLeft size={14} className="text-gray-600" />
            </button>
            <div className="flex-1 min-w-0">
              <h1 className="font-black text-gray-900 text-base">Booking Confirmation</h1>
              <p className="text-xs text-gray-400 truncate">
                {selectedOutbound?.from} → {selectedOutbound?.to} · {paxSummary}
              </p>
            </div>
            <div className="flex gap-2">
              <button onClick={handlePrint} className="w-9 h-9 flex items-center justify-center rounded-xl bg-gray-100 hover:bg-gray-200 transition-colors">
                <FaPrint size={13} className="text-gray-600" />
              </button>
              <button onClick={handleDownload} className="w-9 h-9 flex items-center justify-center rounded-xl bg-gray-100 hover:bg-gray-200 transition-colors">
                <FaDownload size={13} className="text-gray-600" />
              </button>
              <button onClick={handleShare} className="w-9 h-9 flex items-center justify-center rounded-xl bg-gray-100 hover:bg-gray-200 transition-colors">
                <FaShare size={13} className="text-gray-600" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto max-w-4xl px-4 py-5 space-y-4">

        {/* SUCCESS BANNER */}
        <div className="bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl p-6 text-white">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center flex-shrink-0">
              <FaCheckCircle size={28} className="text-white" />
            </div>
            <div className="flex-1">
              <h2 className="font-black text-xl mb-0.5">Booking Confirmed! 🎉</h2>
              <p className="text-green-100 text-sm">
                Your flight has been successfully booked. A confirmation email has been sent.
              </p>
            </div>
            <div className={`px-3 py-1.5 rounded-full text-xs font-black ${isConfirmed ? 'bg-white/20 text-white' : 'bg-amber-400/20 text-amber-100'}`}>
              {isConfirmed ? 'CONFIRMED' : 'PENDING'}
            </div>
          </div>
        </div>

        {/* WARNINGS */}
        {warnings?.length > 0 && (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <FaExclamationTriangle className="text-amber-500" size={14} />
              <span className="font-bold text-amber-700 text-sm">Booking Warnings</span>
            </div>
            <div className="space-y-1">
              {warnings.map((w, i) => (
                <p key={i} className="text-xs text-amber-700">{w.message}</p>
              ))}
            </div>
          </div>
        )}

        {/* BOOKING REFERENCE */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <div className="flex items-center gap-2 mb-4">
            <FaTag className="text-[#FD561E]" size={14} />
            <span className="font-black text-gray-800">Booking Reference</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* PNR */}
            <div className="bg-gradient-to-br from-[#FD561E]/5 to-orange-50 rounded-xl p-4 border border-[#FD561E]/15">
              <div className="text-xs text-gray-400 font-semibold mb-1">PNR / Booking Ref</div>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-black text-gray-900 tracking-widest font-mono">{pnr ?? 'N/A'}</span>
                {pnr && (
                  <button onClick={() => handleCopy(pnr, 'PNR')} className="w-7 h-7 flex items-center justify-center rounded-lg bg-white border border-gray-200 hover:bg-gray-50 transition-colors">
                    <FaCopy size={11} className="text-gray-500" />
                  </button>
                )}
              </div>
            </div>
            {/* Airline Locator */}
            <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
              <div className="text-xs text-gray-400 font-semibold mb-1">Airline Locator (GDS)</div>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-black text-gray-700 tracking-widest font-mono">{airlineLocator ?? 'N/A'}</span>
                {airlineLocator && (
                  <button onClick={() => handleCopy(airlineLocator, 'Locator')} className="w-7 h-7 flex items-center justify-center rounded-lg bg-white border border-gray-200 hover:bg-gray-50 transition-colors">
                    <FaCopy size={11} className="text-gray-500" />
                  </button>
                )}
              </div>
            </div>
            {/* Booking ID */}
            <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
              <div className="text-xs text-gray-400 font-semibold mb-1">Internal Booking ID</div>
              <span className="text-2xl font-black text-gray-700 font-mono">{bookingId ?? 'N/A'}</span>
            </div>
          </div>
        </div>

        {/* FLIGHT SEGMENTS */}
        {segments?.length > 0 && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <div className="flex items-center gap-2 mb-4">
              <FaPlaneDeparture className="text-[#FD561E]" size={14} />
              <span className="font-black text-gray-800">Flight Itinerary</span>
            </div>
            <div className="space-y-3">
              {segments.map((seg, idx) => (
                <div key={seg.key || idx} className="rounded-xl border border-gray-100 bg-gray-50 p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-9 h-9 bg-white rounded-xl border border-gray-200 flex items-center justify-center">
                        <FaPlane className="text-[#FD561E] rotate-90" size={12} />
                      </div>
                      <div>
                        <div className="font-bold text-gray-800 text-sm">{seg.carrier}{seg.flightNumber}</div>
                        <div className="text-[11px] text-gray-400">{seg.equipment || '—'}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {seg.status && (
                        <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                          seg.status === 'HK' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                        }`}>
                          {seg.status === 'HK' ? '✓ Confirmed' : seg.status}
                        </span>
                      )}
                      {seg.classOfService && (
                        <span className="text-[10px] font-black bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full">
                          Class {seg.classOfService}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex-1">
                      <div className="text-xl font-black text-gray-900">{seg.origin}</div>
                      <div className="text-sm font-bold text-gray-600">{fmt.time(seg.departureTime)}</div>
                      <div className="text-[11px] text-gray-400">{fmt.date(seg.departureTime)}</div>
                    </div>
                    <div className="flex flex-col items-center px-2">
                      <div className="text-[10px] text-gray-400 font-semibold mb-1">{fmt.dur(seg.flightTime)}</div>
                      <div className="flex items-center gap-1">
                        <div className="w-8 h-px bg-gray-300" />
                        <FaArrowRight className="text-[#FD561E]" size={10} />
                      </div>
                      <div className="text-[10px] text-emerald-600 font-semibold mt-1">Non-stop</div>
                    </div>
                    <div className="flex-1 text-right">
                      <div className="text-xl font-black text-gray-900">{seg.destination}</div>
                      <div className="text-sm font-bold text-gray-600">{fmt.time(seg.arrivalTime)}</div>
                      <div className="text-[11px] text-gray-400">{fmt.date(seg.arrivalTime)}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* PASSENGERS */}
        {travelers?.length > 0 && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <div className="flex items-center gap-2 mb-4">
              <FaUser className="text-[#FD561E]" size={14} />
              <span className="font-black text-gray-800">Passengers</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {travelers.map((t, idx) => (
                <div key={t.key || idx} className="rounded-xl border border-gray-100 bg-gray-50 p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <div className="font-bold text-gray-800">{t.firstName} {t.lastName}</div>
                      <div className="text-xs text-gray-400 mt-0.5">{paxLabel(t.type)}</div>
                    </div>
                    <div className="w-10 h-10 bg-[#FD561E]/10 rounded-xl flex items-center justify-center">
                      <FaUser className="text-[#FD561E]" size={14} />
                    </div>
                  </div>
                  {t.dob && (
                    <div className="text-[11px] text-gray-400">DOB: {fmt.date(t.dob)}</div>
                  )}
                  {t.gender && (
                    <div className="text-[11px] text-gray-400">Gender: {t.gender === 'M' ? 'Male' : 'Female'}</div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* FARE SUMMARY */}
        {selectedFare && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <div className="flex items-center gap-2 mb-4">
              <FaReceipt className="text-[#FD561E]" size={14} />
              <span className="font-black text-gray-800">Fare Summary</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              <div>
                <div className="text-xs text-gray-400 font-semibold mb-1">Fare</div>
                <div className="font-bold text-gray-800">{selectedFare.brandName}</div>
                <div className="text-xs text-gray-500">{selectedFare.cabin}</div>
              </div>
              <div>
                <div className="text-xs text-gray-400 font-semibold mb-1">Validating Airline</div>
                <div className="font-bold text-gray-800">{selectedFare.validatingAirline || 'AI'}</div>
              </div>
            </div>

            <div className="rounded-xl border border-gray-200 overflow-hidden">
              <div className="grid grid-cols-4 text-[10px] font-black text-gray-400 uppercase tracking-wider bg-gray-50 px-4 py-2.5 border-b border-gray-200">
                <span>Passenger</span>
                <span className="text-right">Base Fare</span>
                <span className="text-right">Taxes</span>
                <span className="text-right">Total</span>
              </div>
              {selectedFare.passengerBreakdown?.map((pb) => (
                <div key={pb.passengerType} className="grid grid-cols-4 px-4 py-2.5 text-xs border-b border-gray-50 last:border-0">
                  <span className="font-semibold text-gray-700">{paxLabel(pb.passengerType)} ×{pb.quantity}</span>
                  <span className="text-right text-gray-600">₹{(pb.baseFare || 0).toLocaleString('en-IN')}</span>
                  <span className="text-right text-gray-600">₹{(pb.taxes || 0).toLocaleString('en-IN')}</span>
                  <span className="text-right font-bold text-gray-800">₹{(pb.totalFare || 0).toLocaleString('en-IN')}</span>
                </div>
              ))}
              <div className="grid grid-cols-4 px-4 py-3 bg-[#FD561E]/6 border-t border-[#FD561E]/15">
                <span className="col-span-3 font-black text-gray-800">Grand Total</span>
                <span className="text-right font-black text-[#FD561E]">₹{(selectedFare.grandTotal || 0).toLocaleString('en-IN')}</span>
              </div>
            </div>

            {/* Penalties */}
            {(selectedFare.penalties?.cancel || selectedFare.penalties?.change) && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
                {selectedFare.penalties?.cancel && (
                  <div className="bg-red-50 border border-red-100 rounded-xl p-3">
                    <div className="text-[10px] font-black text-red-600 uppercase tracking-wide mb-1">Cancellation Fee</div>
                    <div className="text-sm font-bold text-gray-800">
                      {selectedFare.penalties.cancel.amount != null ? `₹${selectedFare.penalties.cancel.amount.toLocaleString('en-IN')} / ticket` : 'Non-refundable'}
                    </div>
                  </div>
                )}
                {selectedFare.penalties?.change && (
                  <div className="bg-blue-50 border border-blue-100 rounded-xl p-3">
                    <div className="text-[10px] font-black text-blue-600 uppercase tracking-wide mb-1">Change Fee</div>
                    <div className="text-sm font-bold text-gray-800">
                      {selectedFare.penalties.change.amount != null ? `₹${selectedFare.penalties.change.amount.toLocaleString('en-IN')} + fare diff` : 'Not allowed'}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Baggage */}
            <div className="mt-4 bg-gray-50 rounded-xl p-4 border border-gray-100">
              <div className="flex items-center gap-2 mb-2">
                <FaSuitcase className="text-gray-400" size={12} />
                <span className="text-xs font-bold text-gray-600">Baggage Allowance (Adult)</span>
              </div>
              <div className="flex gap-6 text-sm">
                <div>
                  <div className="text-[10px] text-gray-400">Check-in</div>
                  <div className="font-bold text-gray-800">
                    {selectedFare.baggage?.ADT?.checked?.weight != null
                      ? `${selectedFare.baggage.ADT.checked.weight} kg`
                      : '—'}
                  </div>
                </div>
                <div>
                  <div className="text-[10px] text-gray-400">Carry-on</div>
                  <div className="font-bold text-gray-800">
                    {selectedFare.baggage?.ADT?.carryOn?.weight != null
                      ? `${selectedFare.baggage.ADT.carryOn.weight} kg`
                      : '—'}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* CONTACT INFO */}
        {pnrRequestBody?.contactInfo && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <div className="flex items-center gap-2 mb-4">
              <FaPhone className="text-[#FD561E]" size={14} />
              <span className="font-black text-gray-800">Contact Information</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="flex items-center gap-3 bg-gray-50 rounded-xl p-3">
                <FaEnvelope className="text-gray-400 flex-shrink-0" size={13} />
                <div>
                  <div className="text-[10px] text-gray-400">Email</div>
                  <div className="text-sm font-semibold text-gray-800">{pnrRequestBody.contactInfo.email}</div>
                </div>
              </div>
              <div className="flex items-center gap-3 bg-gray-50 rounded-xl p-3">
                <FaPhone className="text-gray-400 flex-shrink-0" size={13} />
                <div>
                  <div className="text-[10px] text-gray-400">Phone</div>
                  <div className="text-sm font-semibold text-gray-800">
                    +{pnrRequestBody.contactInfo.phone?.countryCode} {pnrRequestBody.contactInfo.phone?.number}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TRUST BADGES */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { icon: FaShieldAlt,   text: 'Secure Booking',           color: 'text-green-500',  bg: 'bg-green-50'  },
              { icon: FaCheckCircle, text: 'Instant Confirmation',      color: 'text-blue-500',   bg: 'bg-blue-50'   },
              { icon: FaTag,         text: 'Best Fare Guaranteed',      color: 'text-purple-500', bg: 'bg-purple-50' },
              { icon: FaInfoCircle,  text: 'IATA Certified',            color: 'text-orange-500', bg: 'bg-orange-50' },
            ].map(({ icon: Icon, text, color, bg }) => (
              <div key={text} className="flex items-center gap-2">
                <div className={`w-8 h-8 rounded-xl ${bg} flex items-center justify-center flex-shrink-0`}>
                  <Icon className={color} size={13} />
                </div>
                <span className="text-xs text-gray-500 font-medium">{text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ACTION BUTTONS */}
        <div className="flex flex-col sm:flex-row gap-3 pb-6">
          <button onClick={() => navigate(-1)}
            className="flex-1 py-3.5 border-2 border-gray-200 text-gray-700 font-black rounded-2xl hover:bg-gray-50 transition-colors flex items-center justify-center gap-2">
            <FaArrowLeft size={13} /> Back
          </button>
          <button onClick={handlePrint}
            className="flex-1 py-3.5 border-2 border-gray-200 text-gray-700 font-black rounded-2xl hover:bg-gray-50 transition-colors flex items-center justify-center gap-2">
            <FaPrint size={13} /> Print
          </button>
          <button onClick={handleProceedToPayment} disabled={isSubmitting}
            className="flex-[2] py-3.5 bg-[#FD561E] hover:bg-[#e04e1b] text-white font-black rounded-2xl shadow-lg shadow-orange-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all">
            {isSubmitting
              ? <><FaSpinner className="animate-spin" size={16} /> Redirecting to Payment...</>
              : <>Proceed to Payment · ₹{(selectedFare?.grandTotal || 0).toLocaleString('en-IN')} <FaArrowRight size={14} /></>}
          </button>
        </div>

      </div>

      {/* SNACKBAR */}
      {snackbar && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-sm font-semibold px-5 py-3 rounded-2xl shadow-xl z-50 flex items-center gap-2">
          <FaCheck size={12} className="text-green-400" />
          {snackbar}
        </div>
      )}
    </div>
    <Container maxWidth="lg" sx={{ py: 3, bgcolor: '#f5f7fa', minHeight: '100vh' }}>
      
      {/* Ticketing Deadline Alert - Only if exists */}
      {parsedData?.ticketingDeadline && (
        <Alert severity="info" sx={{ mb: 3, borderRadius: 2 }}>
          <AlertTitle>⏰ Ticketing Deadline</AlertTitle>
          Please complete your payment by {formatDateTime(parsedData.ticketingDeadline)}
        </Alert>
      )}

      {/* Error Dialog - Detailed error popup */}
      <Dialog 
        open={openErrorDialog} 
        onClose={() => {
          setOpenErrorDialog(false);
          navigate('/');
        }}
        maxWidth="sm" 
        fullWidth
      >
        <DialogTitle sx={{ bgcolor: '#fff3e0', display: 'flex', alignItems: 'center', gap: 1 }}>
          <ErrorOutline sx={{ color: '#f44336', fontSize: 28 }} />
          <Typography variant="h6" fontWeight="bold" sx={{ color: '#c62828' }}>
            Booking Error
          </Typography>
          <IconButton 
            onClick={() => {
              setOpenErrorDialog(false);
              navigate('/');
            }}
            sx={{ ml: 'auto' }}
          >
            <Close />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          {apiError && (
            <Box>
              {/* Main Error Message */}
              <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
                <AlertTitle>Error: {apiError.faultString}</AlertTitle>
                {apiError.errorMessage && (
                  <Typography variant="body2" fontWeight="bold">
                    {apiError.errorMessage}
                  </Typography>
                )}
              </Alert>

              {/* Flight Details Card */}
              {apiError.airSegment && (
                <Paper sx={{ p: 2, mb: 3, borderRadius: 2, border: '1px solid #ffcdd2', bgcolor: '#fff5f5' }}>
                  <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 1.5, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <FlightTakeoff sx={{ color: ACCENT_COLOR, fontSize: 20 }} />
                    Affected Flight Details
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid size={{ xs: 6 }}>
                      <Typography variant="caption" color="text.secondary">Airline & Flight</Typography>
                      <Typography variant="body1" fontWeight="bold">
                        {apiError.airSegment.carrier} {apiError.airSegment.flightNumber}
                      </Typography>
                    </Grid>
                    <Grid size={{ xs: 6 }}>
                      <Typography variant="caption" color="text.secondary">Class</Typography>
                      <Typography variant="body1">{apiError.airSegment.classOfService}</Typography>
                    </Grid>
                    <Grid size={{ xs: 6 }}>
                      <Typography variant="caption" color="text.secondary">Route</Typography>
                      <Typography variant="body1">
                        {apiError.airSegment.origin} → {apiError.airSegment.destination}
                      </Typography>
                    </Grid>
                    <Grid size={{ xs: 6 }}>
                      <Typography variant="caption" color="text.secondary">Departure</Typography>
                      <Typography variant="body1">{formatErrorDateTime(apiError.airSegment.departureTime)}</Typography>
                    </Grid>
                  </Grid>
                </Paper>
              )}

              {/* Error Details Card */}
              <Paper sx={{ p: 2, borderRadius: 2, bgcolor: '#fafafa' }}>
                <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 1.5, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <InfoOutlined sx={{ color: '#666', fontSize: 20 }} />
                  Error Details
                </Typography>
                <List dense disablePadding>
                  <ListItem sx={{ px: 0, py: 0.5 }}>
                    <ListItemIcon sx={{ minWidth: 100 }}>
                      <Typography variant="caption" color="text.secondary">Error Code:</Typography>
                    </ListItemIcon>
                    <ListItemText primary={apiError.errorCode || 'N/A'} />
                  </ListItem>
                  <ListItem sx={{ px: 0, py: 0.5 }}>
                    <ListItemIcon sx={{ minWidth: 100 }}>
                      <Typography variant="caption" color="text.secondary">Service:</Typography>
                    </ListItemIcon>
                    <ListItemText primary={apiError.errorService || 'N/A'} />
                  </ListItem>
                  <ListItem sx={{ px: 0, py: 0.5 }}>
                    <ListItemIcon sx={{ minWidth: 100 }}>
                      <Typography variant="caption" color="text.secondary">Error Type:</Typography>
                    </ListItemIcon>
                    <ListItemText primary={apiError.errorType || 'N/A'} />
                  </ListItem>
                  <ListItem sx={{ px: 0, py: 0.5 }}>
                    <ListItemIcon sx={{ minWidth: 100 }}>
                      <Typography variant="caption" color="text.secondary">Description:</Typography>
                    </ListItemIcon>
                    <ListItemText primary={apiError.errorDescription || 'N/A'} />
                  </ListItem>
                  <Divider sx={{ my: 1 }} />
                  <ListItem sx={{ px: 0, py: 0.5 }}>
                    <ListItemIcon sx={{ minWidth: 100 }}>
                      <Typography variant="caption" color="text.secondary">Trace ID:</Typography>
                    </ListItemIcon>
                    <ListItemText 
                      primary={apiError.traceId || 'N/A'} 
                      secondary={
                        <Button 
                          size="small" 
                          startIcon={<ContentCopy fontSize="small" />}
                          onClick={() => handleCopy(apiError.traceId, 'Trace ID')}
                          sx={{ p: 0, mt: 0.5, textTransform: 'none' }}
                        >
                          Copy Trace ID
                        </Button>
                      }
                    />
                  </ListItem>
                  <ListItem sx={{ px: 0, py: 0.5 }}>
                    <ListItemIcon sx={{ minWidth: 100 }}>
                      <Typography variant="caption" color="text.secondary">Transaction ID:</Typography>
                    </ListItemIcon>
                    <ListItemText primary={apiError.transactionId || 'N/A'} />
                  </ListItem>
                </List>
              </Paper>

              {/* Suggestion Box */}
              <Box sx={{ mt: 3, p: 2, bgcolor: '#e3f2fd', borderRadius: 2 }}>
                <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <WarningAmber sx={{ color: '#ff9800', fontSize: 20 }} />
                  <strong>What you can do:</strong>
                </Typography>
                <Typography variant="body2" sx={{ mt: 1, pl: 4 }}>
                  • The flight you selected may no longer have available seats.<br />
                  • Please try searching for alternative flights or dates.<br />
                  • Contact customer support if the issue persists.
                </Typography>
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2, pt: 0 }}>
          <Button 
            variant="contained" 
            onClick={() => {
              setOpenErrorDialog(false);
              navigate('/');
            }}
            sx={{ bgcolor: ACCENT_COLOR, '&:hover': { bgcolor: '#e04e1a' } }}
          >
            Return to Search
          </Button>
          <Button 
            variant="outlined" 
            onClick={() => {
              setOpenErrorDialog(false);
              setOpenRawDialog(true);
            }}
          >
            View Raw Response
          </Button>
        </DialogActions>
      </Dialog>

      {/* Two Column Layout for main content */}
      <Grid container spacing={3}>
        
        {/* LEFT COLUMN - Flight Info & Passengers */}
        <Grid size={{ xs: 12, md: 7 }}>
          
          {/* Flight Itinerary Card */}
          <Paper sx={{ p: 2.5, mb: 3, borderRadius: 2 }}>
            <Typography variant="h6" fontWeight="bold" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
              <FlightTakeoff sx={{ color: ACCENT_COLOR }} /> Flight Itinerary
            </Typography>
            
            {displayFlightSegments.length > 0 ? (
              displayFlightSegments.map((segment, idx) => {
                const airline = getAirlineDetails(segment.carrier);
                return (
                  <Card key={idx} sx={{ mb: idx < displayFlightSegments.length - 1 ? 2 : 0, borderRadius: 2, boxShadow: 'none', border: '1px solid #e0e0e0' }}>
                    <CardContent sx={{ p: 2.5 }}>
                      {/* Airline Row */}
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2, pb: 1.5, borderBottom: '1px solid #e0e0e0', flexWrap: 'wrap' }}>
                        {airline.logo_url ? (
                          <img 
                            src={airline.logo_url} 
                            alt={airline.name} 
                            style={{ width: 45, height: 45, objectFit: 'contain' }}
                            onError={(e) => { e.target.style.display = 'none'; }}
                          />
                        ) : (
                          <Avatar sx={{ bgcolor: '#e0e0e0', width: 45, height: 45 }}>
                            <Typography variant="body1" fontWeight="bold">{segment.carrier}</Typography>
                          </Avatar>
                        )}
                        <Box>
                          <Typography variant="h6" fontWeight="bold">{airline.name}</Typography>
                          <Typography variant="body2" color="text.secondary">Flight {segment.carrier} {segment.flightNumber}</Typography>
                        </Box>
                        <Chip 
                          label={segment.cabinClass || segment.classOfService || 'Economy'} 
                          size="small" 
                          sx={{ bgcolor: '#f0f0f0', fontWeight: 500 }}
                        />
                      </Box>
                      
                      {/* Flight Route - STRAIGHT HORIZONTAL LAYOUT */}
                      <Box 
                        sx={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          justifyContent: 'space-between',
                          flexWrap: 'nowrap',
                          gap: 1,
                          width: '100%'
                        }}
                      >
                        {/* Departure */}
                        <Box sx={{ flex: 2, minWidth: 0 }}>
                          <Typography variant="caption" color="text.secondary">Departure</Typography>
                          <Typography variant="h6" fontWeight="bold" sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }}>
                            {segment.origin}
                          </Typography>
                          <Typography variant="body2" sx={{ fontSize: { xs: '0.7rem', sm: '0.875rem' } }}>
                            {formatDateTime(segment.departureTime)}
                          </Typography>
                        </Box>
                        
                        {/* Flight Path Icon - Straight horizontal arrow */}
                        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minWidth: 60 }}>
                          <ArrowForward sx={{ fontSize: { xs: 20, sm: 28 }, color: '#9e9e9e' }} />
                          <Typography variant="caption" color="text.secondary" sx={{ fontSize: { xs: '0.65rem', sm: '0.75rem' }, mt: 0.5, whiteSpace: 'nowrap' }}>
                            {getFlightDuration(segment.departureTime, segment.arrivalTime)}
                          </Typography>
                          <Typography variant="caption" color="text.secondary" sx={{ fontSize: { xs: '0.6rem', sm: '0.7rem' }, whiteSpace: 'nowrap' }}>
                            Direct
                          </Typography>
                        </Box>
                        
                        {/* Arrival */}
                        <Box sx={{ flex: 2, textAlign: 'right', minWidth: 0 }}>
                          <Typography variant="caption" color="text.secondary">Arrival</Typography>
                          <Typography variant="h6" fontWeight="bold" sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }}>
                            {segment.destination}
                          </Typography>
                          <Typography variant="body2" sx={{ fontSize: { xs: '0.7rem', sm: '0.875rem' } }}>
                            {formatDateTime(segment.arrivalTime)}
                          </Typography>
                        </Box>
                      </Box>
                      
                      {segment.equipment && (
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 2, pt: 1.5, borderTop: '1px solid #e0e0e0' }}>
                          ✈️ Aircraft: {segment.equipment} • {segment.isEticketable ? 'E-Ticket Available' : 'Paper Ticket'}
                        </Typography>
                      )}
                    </CardContent>
                  </Card>
                );
              })
            ) : (
              <Alert severity="warning">No flight segments found</Alert>
            )}
          </Paper>

          {/* Passengers Card */}
          <Paper sx={{ p: 2.5, mb: 3, borderRadius: 2 }}>
            <Typography variant="h6" fontWeight="bold" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
              <Person sx={{ color: ACCENT_COLOR }} /> Passenger Details
            </Typography>
            
            <Grid container spacing={2}>
              {displayPassengers.length > 0 ? (
                displayPassengers.map((passenger, idx) => (
                  <Grid size={{ xs: 12, sm: 6 }} key={idx}>
                    <Box sx={{ p: 2, bgcolor: '#fafafa', borderRadius: 2, border: '1px solid #e0e0e0' }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <Box>
                          <Typography variant="subtitle1" fontWeight="bold">
                            {passenger.prefix && `${passenger.prefix} `}{passenger.firstName} {passenger.lastName}
                          </Typography>
                          <Box sx={{ mt: 1 }}>
                            <Chip label={getPassengerTypeLabel(passenger.type)} size="small" sx={{ bgcolor: '#e0e0e0', fontWeight: 500 }} />
                            {passenger.age && <Chip label={`Age: ${passenger.age}`} size="small" variant="outlined" sx={{ ml: 1 }} />}
                          </Box>
                          {passenger.dob && (
                            <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 1 }}>
                              DOB: {formatDate(passenger.dob)}
                            </Typography>
                          )}
                        </Box>
                        <Avatar sx={{ bgcolor: '#e0e0e0', width: 40, height: 40 }}>
                          <Person sx={{ color: '#666' }} />
                        </Avatar>
                      </Box>
                    </Box>
                  </Grid>
                ))
              ) : (
                <Grid size={{ xs: 12 }}>
                  <Alert severity="warning">No passenger data found</Alert>
                </Grid>
              )}
            </Grid>
          </Paper>
        </Grid>

        {/* RIGHT COLUMN - Seat, Baggage, Fare */}
        <Grid size={{ xs: 12, md: 5 }}>
          
          {/* Selected Seat Card */}
          {selectedSeat && (
            <Paper sx={{ p: 2.5, mb: 3, borderRadius: 2, borderLeft: `4px solid ${ACCENT_COLOR}` }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <EventSeat sx={{ fontSize: 40, color: '#666' }} />
                <Box>
                  <Typography variant="caption" color="text.secondary">Selected Seat</Typography>
                  <Typography variant="h3" fontWeight="bold" sx={{ lineHeight: 1 }}>
                    {selectedSeat.seatCode}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">{getSeatTypeLabel(selectedSeat.seatType)}</Typography>
                </Box>
                <Chip label="Confirmed" size="small" sx={{ ml: 'auto', bgcolor: '#e8f5e9', color: '#2e7d32' }} />
              </Box>
            </Paper>
          )}

          {/* Fare Summary Card with Dropdown */}
          <Paper sx={{ p: 2.5, mb: 3, borderRadius: 2 }}>
            {/* Clickable Header with Dropdown Icon */}
            <Box 
              sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'space-between',
                cursor: 'pointer',
                mb: 2
              }}
              onClick={() => setFareDetailsOpen(!fareDetailsOpen)}
            >
              <Typography variant="h6" fontWeight="bold" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <CurrencyRupee sx={{ color: ACCENT_COLOR }} /> Fare Summary
              </Typography>
              <IconButton size="small">
                {fareDetailsOpen ? <ExpandLess /> : <ExpandMore />}
              </IconButton>
            </Box>
            
            {/* Summary View - Always Visible */}
            <Box sx={{ mb: 2, p: 2, bgcolor: '#fafafa', borderRadius: 2 }}>
              <Grid container spacing={2}>
                <Grid size={{ xs: 6 }}>
                  <Typography variant="caption" color="text.secondary">Base Fare</Typography>
                  <Typography variant="h6" fontWeight="bold">
                    {parsedData?.basePrice || formatCurrency(parsedData?.totalPrice?.replace(/[^0-9]/g, '') * 0.7 || 0)}
                  </Typography>
                </Grid>
                <Grid size={{ xs: 6 }}>
                  <Typography variant="caption" color="text.secondary">Taxes & Fees</Typography>
                  <Typography variant="h6" fontWeight="bold">
                    {getTotalTaxAmount()}
                  </Typography>
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <Divider sx={{ my: 1 }} />
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1 }}>
                    <Typography variant="subtitle1" fontWeight="bold">Total Amount</Typography>
                    <Typography variant="h5" fontWeight="bold" sx={{ color: ACCENT_COLOR }}>
                      {formatCurrency(displayTotalPrice)}
                    </Typography>
                  </Box>
                  {parsedData?.isRefundable && (
                    <Chip label="Refundable" size="small" sx={{ mt: 1, bgcolor: '#e8f5e9', color: '#2e7d32' }} />
                  )}
                </Grid>
              </Grid>
            </Box>
            
            {/* Detailed View - Collapsible */}
            <Collapse in={fareDetailsOpen} timeout="auto" unmountOnExit>
              <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 1, mt: 2 }}>
                <Table size="small">
                  <TableHead>
                    <TableRow sx={{ bgcolor: '#f8f9fa' }}>
                      <TableCell><strong>Description</strong></TableCell>
                      <TableCell align="right"><strong>Amount</strong></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {parsedData?.basePrice && (
                      <TableRow>
                        <TableCell>Base Fare</TableCell>
                        <TableCell align="right">{formatCurrency(parsedData.basePrice)}</TableCell>
                      </TableRow>
                    )}
                    {parsedData?.taxBreakdown && parsedData.taxBreakdown.length > 0 ? (
                      parsedData.taxBreakdown.map((tax, idx) => (
                        <TableRow key={idx}>
                          <TableCell>Tax - {tax.category}</TableCell>
                          <TableCell align="right">{formatCurrency(tax.amount)}</TableCell>
                        </TableRow>
                      ))
                    ) : parsedData?.taxes ? (
                      <TableRow>
                        <TableCell>Taxes & Fees</TableCell>
                        <TableCell align="right">{formatCurrency(parsedData.taxes)}</TableCell>
                      </TableRow>
                    ) : null}
                    {parsedData?.taxBreakdown && parsedData.taxBreakdown.length > 0 && (
                      <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                        <TableCell><strong>Subtotal (Tax)</strong></TableCell>
                        <TableCell align="right"><strong>{getTotalTaxAmount()}</strong></TableCell>
                      </TableRow>
                    )}
                    <TableRow sx={{ fontWeight: 'bold', backgroundColor: '#fafafa' }}>
                      <TableCell><strong>Total</strong></TableCell>
                      <TableCell align="right"><strong>{formatCurrency(displayTotalPrice)}</strong></TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
            </Collapse>
            
            {/* Cancellation/Change Policy */}
            {(penalties?.change || penalties?.cancel) && (
              <Box sx={{ mt: 2, p: 2, bgcolor: '#fff8e1', borderRadius: 1 }}>
                <Typography variant="subtitle2" fontWeight="bold" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <Security fontSize="small" /> Cancellation & Change Policy
                </Typography>
                <Grid container spacing={2} sx={{ mt: 0.5 }}>
                  {penalties.cancel && (
                    <Grid size={{ xs: 6 }}>
                      <Typography variant="caption" color="text.secondary">Cancellation Fee</Typography>
                      <Typography variant="body2" fontWeight="bold">{formatCurrency(penalties.cancel.amount)}</Typography>
                    </Grid>
                  )}
                  {penalties.change && (
                    <Grid size={{ xs: 6 }}>
                      <Typography variant="caption" color="text.secondary">Change Fee</Typography>
                      <Typography variant="body2" fontWeight="bold">{formatCurrency(penalties.change.amount)}</Typography>
                    </Grid>
                  )}
                </Grid>
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>

      {/* Proceed to Payment Button - Full width at bottom */}
      <Box sx={{ mt: 2, mb: 2 }}>
        <Button 
          variant="contained" 
          startIcon={<VerifiedUser />} 
          onClick={handleSubmitBooking} 
          disabled={isSubmitting} 
          fullWidth
          sx={{ 
            bgcolor: ACCENT_COLOR, 
            '&:hover': { bgcolor: '#e04e1a' },
            borderRadius: 2,
            py: 1.5,
            fontSize: '1rem',
            fontWeight: 'bold'
          }}
        >
          {isSubmitting ? <CircularProgress size={24} sx={{ color: 'white' }} /> : 'Proceed to Payment'}
        </Button>
      </Box>

      {/* Raw Data Dialog */}
      <Dialog open={openRawDialog} onClose={() => setOpenRawDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          Raw Booking Data
          <IconButton onClick={() => setOpenRawDialog(false)}>
            <Close />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <pre style={{ overflow: 'auto', fontSize: 12, maxHeight: '60vh' }}>
            {JSON.stringify({ 
              error: apiError,
              parsedData, 
              rawResponse: contextPnrData?.rawResponse, 
              bookingData 
            }, null, 2)}
          </pre>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenRawDialog(false)}>Close</Button>
          <Button startIcon={<ContentCopy />} onClick={() => handleCopy(JSON.stringify({ apiError, parsedData, bookingData }, null, 2), 'Raw Data')}>Copy</Button>
        </DialogActions>
      </Dialog>

      <Snackbar 
        open={snackbarOpen} 
        autoHideDuration={3000} 
        onClose={() => setSnackbarOpen(false)} 
        message={snackbarMessage}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      />
    </Container>
  );
};

export default PassengerDetailsReviewPage;