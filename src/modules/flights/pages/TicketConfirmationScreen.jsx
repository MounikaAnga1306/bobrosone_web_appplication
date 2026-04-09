import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  Box,
  Button,
  CircularProgress,
  Alert,
  AlertTitle,
  Fade,
  Zoom,
  Card,
  CardContent,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Divider,
  Chip,
} from '@mui/material';
import {
  CheckCircle,
  Cancel,
  Home,
  Receipt,
  Download,
  Print,
  Share,
  ArrowBack,
  ExpandMore,
  BugReport,
  Flight,
  ConfirmationNumber,
  LocalOffer,
  Person,
  ReceiptLong,
} from '@mui/icons-material';
import toast from 'react-hot-toast';
import { completePaymentConfirmation } from '../services/paymentConfirmationService';

const TicketConfirmationScreen = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [paymentData, setPaymentData] = useState(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [apiResponse, setApiResponse] = useState(null);
  const [ticketDetails, setTicketDetails] = useState(null);

  useEffect(() => {
    console.log('='.repeat(80));
    console.log('🎫 TICKET CONFIRMATION SCREEN - READING BILLDESK RESPONSE');
    console.log('='.repeat(80));

    /* =====================================================
       READ QUERY PARAMS FROM BILLDESK REDIRECT
       ===================================================== */
    const success = searchParams.get("success") === "true";
    const bdorderid = searchParams.get("bdorderid") || "";
    const transactionid = searchParams.get("transactionid") || "";
    const authStatus = searchParams.get("authStatus") || "";
    const statusMessage = searchParams.get("statusMessage") || "";
    const amount = searchParams.get("amount") || "";
    const userId = searchParams.get("user_id") || "";
    const passengerName = searchParams.get("passenger_name") || "";
    const universalLocatorCode = searchParams.get("universal_locator_code") || "";
    const airLocatorCode = searchParams.get("air_locator_code") || "";
    const providerLocatorCode = searchParams.get("provider_locator_code") || "";

    const data = {
      success,
      bdorderid,
      transactionid,
      authStatus,
      statusMessage,
      amount,
      userId,
      passengerName,
      universalLocatorCode,
      airLocatorCode,
      providerLocatorCode,
    };

    console.log('📋 BillDesk Payment Response:', data);
    setPaymentData(data);
    setIsSuccess(success);

    /* =====================================================
       CHECK IF AUTH STATUS IS 0300 AND CALL API
       ===================================================== */
    if (authStatus === "0300") {
      console.log('✅ Auth Status is 0300 - Calling Payment Confirmation API');
      callPaymentConfirmationAPI();
    } else {
      if (success) {
        toast.success("Payment Successful! Ticket Confirmed.");
      } else {
        toast.error("Payment Failed. Please try again.");
      }
      setLoading(false);
    }
  }, [searchParams]);

  /* =====================================================
     CALL PAYMENT CONFIRMATION API - SERVICE HANDLES EVERYTHING
     ===================================================== */
  const callPaymentConfirmationAPI = async () => {
  setLoading(true);
  
  try {
    const result = await completePaymentConfirmation();
    console.log('✅ Payment Confirmation Result:', result);
    
    // The result should already have the structure: { success: true, data: {...}, ... }
    setApiResponse(result);
    
    // Extract ticket details from the result
    const ticketData = extractTicketDetails(result);
    console.log('📋 Extracted Ticket Data:', ticketData);
    
    if (ticketData) {
      setTicketDetails(ticketData);
      toast.success(`Ticket ${ticketData.ticketNumber} issued successfully!`);
    } else {
      toast.warning('Ticket issued but unable to extract all details');
    }
    
    setIsSuccess(true);
    
  } catch (error) {
    console.error('❌ Error in payment confirmation:', error);
    setApiResponse({ error: true, message: error.message });
    toast.error(error.message || 'Failed to confirm payment');
    setIsSuccess(false);
    
  } finally {
    setLoading(false);
  }
};

 

const extractTicketDetails = (response) => {
  try {
    console.log('🔍 Starting to extract ticket details from response');
    
    // The response structure is: { success: true, traceId: "...", data: { SOAP:Envelope: {...} } }
    // So we need to access response.data
    const soapData = response?.data;
    
    if (!soapData) {
      console.error('No data found in response');
      return null;
    }
    
    console.log('SOAP Data type:', typeof soapData);
    console.log('SOAP Data has SOAP:Envelope?', !!soapData['SOAP:Envelope']);
    
    // Get the SOAP envelope directly from soapData
    const soapEnvelope = soapData['SOAP:Envelope'];
    
    if (!soapEnvelope) {
      console.error('No SOAP:Envelope found in response.data');
      console.log('Available keys in soapData:', Object.keys(soapData));
      return null;
    }
    
    const soapBody = soapEnvelope['SOAP:Body'];
    if (!soapBody) {
      console.error('No SOAP:Body found');
      return null;
    }
    
    const airTicketingRsp = soapBody['air:AirTicketingRsp'];
    if (!airTicketingRsp) {
      console.error('No air:AirTicketingRsp found');
      console.log('Available keys in soapBody:', Object.keys(soapBody));
      return null;
    }
    
    const etr = airTicketingRsp['air:ETR'];
    if (!etr) {
      console.error('No air:ETR found');
      console.log('Available keys in airTicketingRsp:', Object.keys(airTicketingRsp));
      return null;
    }

    console.log('✅ Found ETR, extracting details...');

    // Get ETR attributes
    const etrAttrs = etr.$ || {};
    
    // Get Ticket information
    const ticket = etr['air:Ticket'];
    const ticketAttrs = ticket?.$ || {};
    const coupon = ticket?.['air:Coupon'];
    const couponAttrs = coupon?.$ || {};
    
    // Get AirPricingInfo
    const airPricingInfo = etr['air:AirPricingInfo'];
    const airPricingAttrs = airPricingInfo?.$ || {};
    
    // Get Booking Traveler
    const bookingTraveler = etr['common_v54_0:BookingTraveler'];
    const travelerAttrs = bookingTraveler?.$ || {};
    const travelerName = bookingTraveler?.['common_v54_0:BookingTravelerName']?.$ || {};
    
    // Get Tax Info
    const taxInfo = airPricingInfo?.['air:TaxInfo'] || [];
    const taxes = Array.isArray(taxInfo) ? taxInfo : [taxInfo];
    
    // Get Penalties
    const changePenalty = airPricingInfo?.['air:ChangePenalty'];
    const cancelPenalty = airPricingInfo?.['air:CancelPenalty'];
    
    // Get Baggage Info
    const fareInfo = airPricingInfo?.['air:FareInfo'];
    const baggageAllowance = fareInfo?.['air:BaggageAllowance'];
    const maxWeight = baggageAllowance?.['air:MaxWeight']?.$ || {};
    
    // Extract PNR from AirReservationLocatorCode
    const pnr = etr['air:AirReservationLocatorCode'] || etrAttrs.ProviderLocatorCode || 'N/A';
    
    // Format amount (remove currency code)
    const formatAmount = (amount) => {
      if (!amount) return 'N/A';
      const numericAmount = amount.replace(/[^0-9.-]/g, '');
      return `₹${parseFloat(numericAmount).toLocaleString('en-IN')}`;
    };
    
    const ticketDetails = {
      // Ticket Information
      ticketNumber: ticketAttrs.TicketNumber || 'N/A',
      pnr: pnr,
      providerLocator: etrAttrs.ProviderLocatorCode || 'N/A',
      ticketStatus: ticketAttrs.TicketStatus === 'N' ? 'Confirmed' : ticketAttrs.TicketStatus || 'N/A',
      issuedDate: etrAttrs.IssuedDate ? new Date(etrAttrs.IssuedDate).toLocaleDateString() : 'N/A',
      
      // Pricing Information
      totalPrice: formatAmount(etrAttrs.TotalPrice || airPricingAttrs.TotalPrice),
      basePrice: formatAmount(etrAttrs.BasePrice || airPricingAttrs.BasePrice),
      taxes: formatAmount(etrAttrs.Taxes || airPricingAttrs.Taxes),
      
      // Passenger Information
      passengerName: `${travelerName.First || ''} ${travelerName.Last || ''}`.trim() || 'N/A',
      passengerType: travelerAttrs.TravelerType === 'ADT' ? 'Adult' : travelerAttrs.TravelerType || 'N/A',
      passengerGender: travelerAttrs.Gender === 'F' ? 'Female' : travelerAttrs.Gender === 'M' ? 'Male' : 'N/A',
      passengerDOB: travelerAttrs.DOB || 'N/A',
      passengerAge: travelerAttrs.Age || 'N/A',
      
      // Flight Information
      carrier: couponAttrs.MarketingCarrier || 'N/A',
      flightNumber: couponAttrs.MarketingFlightNumber || 'N/A',
      origin: couponAttrs.Origin || 'N/A',
      destination: couponAttrs.Destination || 'N/A',
      departureTime: couponAttrs.DepartureTime ? new Date(couponAttrs.DepartureTime).toLocaleString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      }) : 'N/A',
      fareBasis: couponAttrs.FareBasis || 'N/A',
      bookingClass: couponAttrs.BookingClass || 'N/A',
      
      // Additional Information
      refundable: etrAttrs.Refundable === 'true',
      exchangeable: etrAttrs.Exchangeable === 'true',
      platingCarrier: etrAttrs.PlatingCarrier || 'N/A',
      
      // Baggage Information
      baggageAllowance: maxWeight.Value ? `${maxWeight.Value} kg` : '15 kg',
      
      // Penalties
      changePenalty: changePenalty?.['air:Amount']?.$?.Value || changePenalty?.['air:Amount'] || 'N/A',
      cancelPenalty: cancelPenalty?.['air:Amount']?.$?.Value || cancelPenalty?.['air:Amount'] || 'N/A',
      
      // Response Messages
      responseMessages: airTicketingRsp['common_v54_0:ResponseMessage'] || [],
      
      // Tax Breakdown
      taxBreakdown: taxes.map(tax => ({
        category: tax.$?.Category || 'N/A',
        amount: formatAmount(tax.$?.Amount)
      }))
    };
    
    console.log('✅ Successfully extracted ticket details:', ticketDetails);
    return ticketDetails;
    
  } catch (error) {
    console.error('Error extracting ticket details:', error);
    return null;
  }
};

  const handleGoHome = () => navigate('/');
  const handleViewBookings = () => navigate('/flights/my-bookings');
  const handlePrintTicket = () => window.print();

  const handleDownloadTicket = () => {
    const dataStr = JSON.stringify({
      paymentData,
      ticketDetails,
      apiResponse,
      timestamp: new Date().toISOString()
    }, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ticket_${ticketDetails?.ticketNumber || paymentData?.transactionid || 'confirmation'}.json`;
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
      });
    } else {
      toast.info('Share functionality coming soon!');
    }
  };

  /* =====================================================
     LOADING STATE
     ===================================================== */
  if (loading) {
    return (
      <Container maxWidth="md" sx={{ py: 8 }}>
        <Paper sx={{ p: 6, textAlign: 'center', borderRadius: 3 }}>
          <CircularProgress size={60} sx={{ mb: 3 }} />
          <Typography variant="h5" gutterBottom>
            Processing Payment Response...
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Confirming payment with airline system...
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ mt: 2, display: 'block' }}>
            Please do not close this window.
          </Typography>
        </Paper>
      </Container>
    );
  }

  /* =====================================================
     FAILURE STATE
     ===================================================== */
  if (!isSuccess) {
    return (
      <Container maxWidth="md" sx={{ py: 8 }}>
        <Fade in timeout={500}>
          <Paper sx={{ p: 6, textAlign: 'center', borderRadius: 3 }}>
            <Cancel sx={{ fontSize: 80, color: 'error.main', mb: 2 }} />
            <Typography variant="h4" fontWeight="bold" color="error" gutterBottom>
              Payment Failed
            </Typography>
            <Alert severity="error" sx={{ mb: 3, borderRadius: 2, textAlign: 'left' }}>
              <AlertTitle>Transaction Unsuccessful</AlertTitle>
              {paymentData?.statusMessage || "Your payment could not be processed. Please try again."}
            </Alert>
            
            <Box sx={{ mb: 3, textAlign: 'left', bgcolor: '#fff3e0', p: 3, borderRadius: 2 }}>
              <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                Transaction Details
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" color="text.secondary">Transaction ID</Typography>
                  <Typography variant="body2" fontFamily="monospace" fontWeight="bold">
                    {paymentData?.transactionid || "N/A"}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" color="text.secondary">Auth Status</Typography>
                  <Chip label={paymentData?.authStatus || "N/A"} color="error" size="small" />
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" color="text.secondary">Amount</Typography>
                  <Typography variant="body2" fontWeight="bold">₹{paymentData?.amount || "N/A"}</Typography>
                </Box>
              </Box>
            </Box>

            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              Please contact our support team for assistance.
            </Typography>

            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
              <Button variant="contained" startIcon={<ArrowBack />} onClick={() => navigate(-1)}>
                Go Back
              </Button>
              <Button variant="outlined" startIcon={<Home />} onClick={handleGoHome}>
                Home
              </Button>
            </Box>
          </Paper>
        </Fade>
      </Container>
    );
  }

  /* =====================================================
     SUCCESS STATE
     ===================================================== */
  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Zoom in timeout={600}>
        <Paper sx={{
          borderRadius: 4,
          overflow: 'hidden',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          mb: 3,
        }}>
          <Box sx={{ p: 4, textAlign: 'center', color: 'white' }}>
            <CheckCircle sx={{ fontSize: 80, mb: 2 }} />
            <Typography variant="h3" fontWeight="bold" gutterBottom>
              Thank You! 🎉
            </Typography>
            <Typography variant="h6" sx={{ opacity: 0.9 }}>
              Your ticket has been confirmed successfully
            </Typography>
          </Box>
        </Paper>
      </Zoom>

      <Fade in timeout={800}>
        <Card sx={{ borderRadius: 3, boxShadow: 3 }}>
          <CardContent sx={{ p: 4 }}>
            <Alert severity="success" sx={{ mb: 3, borderRadius: 2 }}>
              <AlertTitle>Payment Successful!</AlertTitle>
              Your ticket has been issued successfully.
              {paymentData?.authStatus === "0300" && (
                <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                  ✓ Payment confirmed with authorization code: 0300
                </Typography>
              )}
            </Alert>

            {/* Ticket Number - Highlighted */}
            {ticketDetails?.ticketNumber && ticketDetails.ticketNumber !== 'N/A' && (
              <Box sx={{
                p: 3,
                bgcolor: '#e8f5e9',
                borderRadius: 2,
                mb: 3,
                textAlign: 'center',
                border: '2px solid #4caf50'
              }}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  🎫 E-Ticket Number
                </Typography>
                <Typography variant="h4" fontFamily="monospace" fontWeight="bold" color="success.main">
                  {ticketDetails.ticketNumber}
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                  Issued on: {ticketDetails.issuedDate}
                </Typography>
              </Box>
            )}

            {/* Flight Information Card */}
            {ticketDetails && (
              <>
                <Box sx={{ mb: 3 }}>
                  <Typography variant="subtitle1" fontWeight="bold" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Flight color="primary" /> Flight Information
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1 }}>
                      <Typography variant="body2" color="text.secondary">Flight</Typography>
                      <Typography variant="body2" fontWeight="bold">
                        {ticketDetails.carrier} {ticketDetails.flightNumber}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1 }}>
                      <Typography variant="body2" color="text.secondary">Route</Typography>
                      <Typography variant="body2" fontWeight="bold">
                        {ticketDetails.origin} → {ticketDetails.destination}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1 }}>
                      <Typography variant="body2" color="text.secondary">Departure</Typography>
                      <Typography variant="body2">
                        {ticketDetails.departureTime}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1 }}>
                      <Typography variant="body2" color="text.secondary">Class / Fare Basis</Typography>
                      <Typography variant="body2">
                        {ticketDetails.bookingClass} / {ticketDetails.fareBasis}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1 }}>
                      <Typography variant="body2" color="text.secondary">Baggage Allowance</Typography>
                      <Typography variant="body2" fontWeight="bold" color="success.main">
                        {ticketDetails.baggageAllowance}
                      </Typography>
                    </Box>
                  </Box>
                </Box>

                <Divider sx={{ mb: 3 }} />

                {/* Booking Reference */}
                <Box sx={{ mb: 3 }}>
                  <Typography variant="subtitle1" fontWeight="bold" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <ConfirmationNumber color="primary" /> Booking Reference
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1 }}>
                      <Typography variant="body2" color="text.secondary">PNR (Airline)</Typography>
                      <Typography variant="body2" fontFamily="monospace" fontWeight="bold" sx={{ bgcolor: '#f5f5f5', px: 1, py: 0.5, borderRadius: 1 }}>
                        {ticketDetails.pnr}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1 }}>
                      <Typography variant="body2" color="text.secondary">GDS Locator</Typography>
                      <Typography variant="body2" fontFamily="monospace">
                        {ticketDetails.providerLocator}
                      </Typography>
                    </Box>
                  </Box>
                </Box>

                <Divider sx={{ mb: 3 }} />

                {/* Passenger Details */}
                <Box sx={{ mb: 3 }}>
                  <Typography variant="subtitle1" fontWeight="bold" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Person color="primary" /> Passenger Details
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1 }}>
                      <Typography variant="body2" color="text.secondary">Name</Typography>
                      <Typography variant="body2" fontWeight="bold">
                        {ticketDetails.passengerName}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1 }}>
                      <Typography variant="body2" color="text.secondary">Passenger Type</Typography>
                      <Typography variant="body2">{ticketDetails.passengerType}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1 }}>
                      <Typography variant="body2" color="text.secondary">Gender</Typography>
                      <Typography variant="body2">{ticketDetails.passengerGender}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1 }}>
                      <Typography variant="body2" color="text.secondary">Date of Birth</Typography>
                      <Typography variant="body2">{ticketDetails.passengerDOB}</Typography>
                    </Box>
                  </Box>
                </Box>

                <Divider sx={{ mb: 3 }} />

                {/* Payment & Fare Details */}
                <Box sx={{ mb: 3 }}>
                  <Typography variant="subtitle1" fontWeight="bold" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <ReceiptLong color="primary" /> Fare Breakdown
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1 }}>
                      <Typography variant="body2" color="text.secondary">Base Fare</Typography>
                      <Typography variant="body2">{ticketDetails.basePrice}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1 }}>
                      <Typography variant="body2" color="text.secondary">Taxes & Surcharges</Typography>
                      <Typography variant="body2">{ticketDetails.taxes}</Typography>
                    </Box>
                    
                    {/* Tax Breakdown */}
                    {ticketDetails.taxBreakdown && ticketDetails.taxBreakdown.length > 0 && (
                      <Box sx={{ ml: 2, pl: 2, borderLeft: '2px solid #e0e0e0' }}>
                        <Typography variant="caption" color="text.secondary" gutterBottom display="block">
                          Tax Details:
                        </Typography>
                        {ticketDetails.taxBreakdown.map((tax, idx) => (
                          <Box key={idx} sx={{ display: 'flex', justifyContent: 'space-between', gap: 1, mt: 0.5 }}>
                            <Typography variant="caption" color="text.secondary">{tax.category}</Typography>
                            <Typography variant="caption">{tax.amount}</Typography>
                          </Box>
                        ))}
                      </Box>
                    )}
                    
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1, mt: 1, pt: 1, borderTop: '1px dashed #e0e0e0' }}>
                      <Typography variant="body2" color="text.secondary" fontWeight="bold">Total Paid</Typography>
                      <Typography variant="body2" fontWeight="bold" color="success.main" fontSize="1.1rem">
                        {ticketDetails.totalPrice}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1 }}>
                      <Typography variant="body2" color="text.secondary">Payment Method</Typography>
                      <Typography variant="body2">Cash</Typography>
                    </Box>
                  </Box>
                </Box>

                <Divider sx={{ mb: 3 }} />

                {/* Ticket Policies */}
                <Box sx={{ mb: 3 }}>
                  <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                    📋 Ticket Policies
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                  <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mb: 2 }}>
                    <Chip 
                      icon={ticketDetails.refundable ? <CheckCircle /> : <Cancel />}
                      label={ticketDetails.refundable ? "Refundable" : "Non-Refundable"}
                      color={ticketDetails.refundable ? "success" : "default"}
                      variant="outlined"
                    />
                    <Chip 
                      icon={ticketDetails.exchangeable ? <CheckCircle /> : <Cancel />}
                      label={ticketDetails.exchangeable ? "Exchangeable" : "Non-Exchangeable"}
                      color={ticketDetails.exchangeable ? "success" : "default"}
                      variant="outlined"
                    />
                    <Chip label={`Plating Carrier: ${ticketDetails.platingCarrier}`} variant="outlined" />
                  </Box>
                  
                  {/* Penalty Information */}
                  {(ticketDetails.changePenalty !== 'N/A' || ticketDetails.cancelPenalty !== 'N/A') && (
                    <Box sx={{ bgcolor: '#fff3e0', p: 2, borderRadius: 2, mt: 2 }}>
                      <Typography variant="body2" fontWeight="bold" gutterBottom>Penalty Information:</Typography>
                      {ticketDetails.changePenalty !== 'N/A' && (
                        <Typography variant="caption" display="block">• Change Penalty: {ticketDetails.changePenalty}</Typography>
                      )}
                      {ticketDetails.cancelPenalty !== 'N/A' && (
                        <Typography variant="caption" display="block">• Cancellation Penalty: {ticketDetails.cancelPenalty}</Typography>
                      )}
                    </Box>
                  )}
                </Box>
              </>
            )}

            {/* Action Buttons */}
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap', mt: 4 }}>
              <Button variant="contained" startIcon={<Home />} onClick={handleGoHome} sx={{ borderRadius: 2 }}>
                Go to Home
              </Button>
              <Button variant="outlined" startIcon={<Receipt />} onClick={handleViewBookings} sx={{ borderRadius: 2 }}>
                My Bookings
              </Button>
              <Button variant="outlined" startIcon={<Download />} onClick={handleDownloadTicket} sx={{ borderRadius: 2 }}>
                Download
              </Button>
              <Button variant="outlined" startIcon={<Print />} onClick={handlePrintTicket} sx={{ borderRadius: 2 }}>
                Print
              </Button>
              <Button variant="outlined" startIcon={<Share />} onClick={handleShare} sx={{ borderRadius: 2 }}>
                Share
              </Button>
            </Box>

            {/* Debug Accordion */}
            <Accordion sx={{ mt: 3 }}>
              <AccordionSummary expandIcon={<ExpandMore />}>
                <BugReport fontSize="small" sx={{ mr: 1 }} />
                <Typography variant="body2">Debug: View Raw Response Data</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography variant="subtitle2" fontWeight="bold">Payment Data:</Typography>
                <pre style={{ overflow: 'auto', fontSize: 11, maxHeight: 200 }}>
                  {JSON.stringify(paymentData, null, 2)}
                </pre>
                {ticketDetails && (
                  <>
                    <Divider sx={{ my: 2 }} />
                    <Typography variant="subtitle2" fontWeight="bold">Ticket Details:</Typography>
                    <pre style={{ overflow: 'auto', fontSize: 11, maxHeight: 200 }}>
                      {JSON.stringify(ticketDetails, null, 2)}
                    </pre>
                  </>
                )}
                {apiResponse && (
                  <>
                    <Divider sx={{ my: 2 }} />
                    <Typography variant="subtitle2" fontWeight="bold">API Response:</Typography>
                    <pre style={{ overflow: 'auto', fontSize: 11, maxHeight: 200 }}>
                      {JSON.stringify(apiResponse, null, 2)}
                    </pre>
                  </>
                )}
              </AccordionDetails>
            </Accordion>
          </CardContent>
        </Card>
      </Fade>
    </Container>
  );
};

export default TicketConfirmationScreen;