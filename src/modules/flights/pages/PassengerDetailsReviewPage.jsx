// src/modules/flights/pages/PassengerDetailsReviewPage.jsx

import React, { useState, useEffect } from 'react';
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

const PassengerDetailsReviewPage = () => {
  const navigate = useNavigate();
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
      const soapFault = body?.['SOAP:Fault'];
      if (soapFault) {
        const errorInfo = soapFault?.detail?.['air:AvailabilityErrorInfo'];
        const airSegmentError = errorInfo?.['air:AirSegmentError'];
        const airSegment = airSegmentError?.['air:AirSegment']?.$ || {};
        const errorMessage = airSegmentError?.['air:ErrorMessage'];
        
        const error = {
          type: 'SOAP_FAULT',
          faultCode: soapFault.faultcode,
          faultString: soapFault.faultstring,
          errorCode: errorInfo?.['common_v54_0:Code'],
          errorService: errorInfo?.['common_v54_0:Service'],
          errorType: errorInfo?.['common_v54_0:Type'],
          errorDescription: errorInfo?.['common_v54_0:Description'],
          transactionId: errorInfo?.['common_v54_0:TransactionId'],
          traceId: errorInfo?.['common_v54_0:TraceId'],
          airSegment: {
            carrier: airSegment.Carrier,
            flightNumber: airSegment.FlightNumber,
            origin: airSegment.Origin,
            destination: airSegment.Destination,
            departureTime: airSegment.DepartureTime,
            arrivalTime: airSegment.ArrivalTime,
            classOfService: airSegment.ClassOfService
          },
          errorMessage: errorMessage
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
    setSnackbarMessage(`${field} copied!`);
    setSnackbarOpen(true);
  };

  const formatDateTime = (date) => {
    if (!date) return 'N/A';
    try {
      return format(new Date(date), 'dd MMM yyyy, hh:mm a');
    } catch {
      return date;
    }
  };

  const formatDate = (date) => {
    if (!date) return 'N/A';
    try {
      return format(new Date(date), 'dd MMM yyyy');
    } catch {
      return date;
    }
  };

  const formatCurrency = (amount) => {
    if (!amount) return 'INR 0';
    const amountStr = amount.toString();
    const numericAmount = amountStr.replace(/[^0-9]/g, '');
    return `INR ${parseInt(numericAmount).toLocaleString('en-IN')}`;
  };

  const getFlightDuration = (dep, arr) => {
    if (!dep || !arr) return 'N/A';
    try {
      const minutes = Math.round((new Date(arr) - new Date(dep)) / 60000);
      const hours = Math.floor(minutes / 60);
      const mins = minutes % 60;
      return `${hours}h ${mins}m`;
    } catch {
      return 'N/A';
    }
  };

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
      
    } catch (error) {
      console.error('❌ PAYMENT INITIATION FAILED:', error);
      setSnackbarMessage(`❌ Payment initiation failed: ${error.message || 'Unknown error'}`);
      setSnackbarOpen(true);
      setIsSubmitting(false);
    }
  };

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