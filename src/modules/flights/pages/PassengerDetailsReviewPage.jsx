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
  Divider,
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
  LinearProgress,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Tooltip,
  Fade,
  Zoom
} from '@mui/material';
import {
  CheckCircle,
  Warning,
  FlightTakeoff,
  Person,
  Phone,
  Email,
  ConfirmationNumber,
  AccountBalanceWallet,
  ContentCopy,
  Close,
  Print,
  Download,
  Share,
  ArrowBack,
  Luggage,
  Restaurant,
  Wifi,
  Info,
  EventSeat,
  AccessTime,
  LocationOn,
  AirplaneTicket,
  CurrencyRupee,
  Receipt,
  VerifiedUser,
  Security,
  LocalOffer,
  TrendingUp,
  CalendarToday,
  Schedule
} from '@mui/icons-material';
import { format } from 'date-fns';
import { createBillDeskOrder } from '../services/paymentGatewayservices';
import { usePricingBooking } from '../contexts/PricingBookingContext';
import { usePnrResponse } from '../contexts/PnrResponseContext';

const PassengerDetailsReviewPage = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  // ============ GET DATA FROM PNR RESPONSE CONTEXT ============
  const { 
    pnrData,
    loading: pnrLoading,
    getCompletePnrData,
    getPnrNumber,
    getAirLocatorCode,
    getFlightSegments,
    getPassengers,
    getTotalPrice,
    getWarnings,
    getPenalties,
    isBookingConfirmed,
    hasWarnings
  } = usePnrResponse();
  
  // Get booking data from PricingBookingContext as fallback
  const { getCompleteBookingData } = usePricingBooking();
  const bookingData = getCompleteBookingData();
  
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [openRawDialog, setOpenRawDialog] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeStep, setActiveStep] = useState(2); // For stepper - step 2 = confirmed

  // Use PNR data as primary source
  const displayPnrNumber = getPnrNumber();
  const displayAirLocatorCode = getAirLocatorCode();
  const displayFlightSegments = getFlightSegments();
  const displayPassengers = getPassengers();
  const displayTotalPrice = getTotalPrice();
  const warnings = getWarnings();
  const penalties = getPenalties();
  const isConfirmed = isBookingConfirmed();
  const hasWarningsFlag = hasWarnings();
  
  // Fallback to booking data if PNR data not available
  const contactInfo = bookingData?.contactInfo;
  const selectedSeat = bookingData?.selectedSeat;
  const selectedFare = bookingData?.selectedFare;
  const paymentMethod = bookingData?.paymentMethod || 'Cash';

  // ============================================================
  // LOG DATA ON MOUNT
  // ============================================================
  
  useEffect(() => {
    console.log('\n' + '='.repeat(80));
    console.log('📄 PASSENGER DETAILS REVIEW PAGE - MOUNTED');
    console.log('='.repeat(80));
    console.log('📦 Data from PnrResponseContext:', pnrData);
    console.log('   - PNR Number:', displayPnrNumber);
    console.log('   - Airline Locator:', displayAirLocatorCode);
    console.log('   - Total Price:', displayTotalPrice);
    console.log('   - Booking Status:', pnrData?.bookingStatus);
    console.log('   - Warnings:', warnings);
    console.log('   - Flight Segments:', displayFlightSegments.length);
    console.log('   - Passengers:', displayPassengers.length);
    console.log('   - Penalties:', penalties);
    console.log('   - Ticketing Deadline:', pnrData?.ticketingDeadline);
    console.log('📦 Fallback Data from PricingBookingContext:', bookingData);
    console.log('   - Contact Email:', contactInfo?.email);
    console.log('   - Selected Seat:', selectedSeat?.seatCode || 'None');
    console.log('='.repeat(80) + '\n');
  }, [pnrData, displayPnrNumber, displayAirLocatorCode, displayTotalPrice, displayFlightSegments, displayPassengers, warnings, penalties, bookingData, contactInfo, selectedSeat]);

  // ============================================================
  // LOADING / NO DATA STATE
  // ============================================================
  
  if (pnrLoading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <CircularProgress size={60} />
          <Typography variant="h6" sx={{ mt: 2 }}>Loading booking confirmation...</Typography>
          <Typography color="text.secondary" sx={{ mt: 1 }}>
            Please wait while we retrieve your booking details.
          </Typography>
        </Paper>
      </Container>
    );
  }

  if (!displayPnrNumber && !pnrData?.pnrNumber) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Warning sx={{ fontSize: 60, color: 'warning.main' }} />
          <Typography variant="h6" sx={{ mt: 2 }}>No Booking Found</Typography>
          <Typography color="text.secondary" sx={{ mt: 1 }}>
            Unable to retrieve booking details. Please contact support.
          </Typography>
          <Button variant="contained" onClick={() => navigate('/')} sx={{ mt: 3 }}>
            Return to Home
          </Button>
        </Paper>
      </Container>
    );
  }

  // ============================================================
  // HELPER FUNCTIONS
  // ============================================================
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

  const handlePrint = () => window.print();
  
  const handleDownload = () => {
    const dataToSave = {
      bookingConfirmation: {
        pnrNumber: displayPnrNumber,
        airlineLocator: displayAirLocatorCode,
        bookingStatus: pnrData?.bookingStatus,
        createdAt: pnrData?.createdAt
      },
      flightDetails: displayFlightSegments,
      passengers: displayPassengers,
      fareDetails: {
        totalPrice: displayTotalPrice,
        basePrice: pnrData?.basePrice,
        taxes: pnrData?.taxes,
        taxBreakdown: pnrData?.taxBreakdown,
        baggageAllowance: pnrData?.baggageAllowance,
        ticketingDeadline: pnrData?.ticketingDeadline,
        isRefundable: pnrData?.isRefundable
      },
      contactInfo: contactInfo,
      selectedSeat: selectedSeat
    };
    const data = JSON.stringify(dataToSave, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `booking_${displayPnrNumber}_confirmation.json`;
    a.click();
    URL.revokeObjectURL(url);
    setSnackbarMessage('Booking confirmation downloaded!');
    setSnackbarOpen(true);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: 'Flight Booking Confirmation',
        text: `Booking confirmed! PNR: ${displayPnrNumber}`,
        url: window.location.href
      });
    } else {
      handleCopy(displayPnrNumber, 'PNR Number');
    }
  };

  const handleBack = () => {
    navigate(-1);
  };

  // ============================================================
  // UPDATED: SUBMIT BOOKING - NAVIGATE TO TICKET CONFIRMATION
  // ============================================================
  const handleSubmitBooking = async () => {
    console.log('📤 SUBMIT BUTTON CLICKED - SENDING BOOKING DATA TO PAYMENT SERVICE');
    console.log('📦 Booking Data:', bookingData);
    console.log('📦 PNR Data:', pnrData);
    
    setIsSubmitting(true);

    try {
      const response = await createBillDeskOrder(bookingData, pnrData);
      
      console.log('✅ Payment Service Response:', response);
      
      if (!response || !response.success) {
        throw new Error(response?.message || 'Order creation failed');
      }
      
      const responseData = response.data || {};
      const bdorderid = responseData?.bdorderid;
      const authToken = responseData?.authToken;
      const merchantId = "HYDBOBROS";
      
      console.log('📋 MERCHANT ID:', merchantId);
      console.log('📋 BDORDERID:', bdorderid);
      
      if (!bdorderid) throw new Error('Order ID (bdorderid) missing from response');
      if (!authToken) throw new Error('Auth Token missing from response');
      
      const billdeskUrl = `https://uat.bobros.co.in/billdesk_checkout.php?merchantId=${merchantId}&bdorderid=${bdorderid}&authToken=${encodeURIComponent(authToken)}`;
      
      console.log('🔗 BILLDESK CHECKOUT URL:', billdeskUrl);
      console.log('🔄 REDIRECTING TO PAYMENT GATEWAY...');
      
      // Store a flag in sessionStorage to indicate we're coming from payment
      sessionStorage.setItem('paymentInitiated', 'true');
      sessionStorage.setItem('pnrNumber', displayPnrNumber);
      
      // Redirect to payment gateway
      window.location.href = billdeskUrl;
      
    } catch (error) {
      console.error('❌ PAYMENT INITIATION FAILED:', error);
      setSnackbarMessage(`❌ Payment initiation failed: ${error.message || 'Unknown error'}`);
      setSnackbarOpen(true);
      setIsSubmitting(false);
    }
  };

  // Get passenger type label
  const getPassengerTypeLabel = (code) => {
    switch(code) {
      case 'ADT': return 'Adult';
      case 'CNN': return 'Child';
      case 'INF': return 'Infant';
      default: return code;
    }
  };

  // Get seat type label
  const getSeatTypeLabel = (type) => {
    switch(type) {
      case 'window': return 'Window Seat';
      case 'aisle': return 'Aisle Seat';
      case 'middle': return 'Middle Seat';
      default: return type;
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4, bgcolor: '#f5f7fa', minHeight: '100vh' }}>
      {/* Stepper Progress */}
      <Paper sx={{ p: 3, mb: 3, borderRadius: 3 }}>
        <Stepper activeStep={activeStep} orientation="horizontal">
          <Step>
            <StepLabel>Search Flights</StepLabel>
          </Step>
          <Step>
            <StepLabel>Passenger Details</StepLabel>
          </Step>
          <Step>
            <StepLabel>Payment</StepLabel>
          </Step>
          <Step>
            <StepLabel>Confirmation</StepLabel>
          </Step>
        </Stepper>
      </Paper>

      {/* Warnings Alert */}
      {hasWarningsFlag && warnings.length > 0 && (
        <Fade in timeout={500}>
          <Alert 
            severity="warning" 
            sx={{ mb: 3, borderRadius: 2 }}
            icon={<Warning />}
          >
            <AlertTitle>⚠️ Booking Warnings</AlertTitle>
            {warnings.map((warning, idx) => (
              <Typography key={idx} variant="body2">
                {warning.message}
              </Typography>
            ))}
          </Alert>
        </Fade>
      )}

      {/* Success Header with Animation */}
      <Zoom in timeout={600}>
        <Paper sx={{ 
          p: 4, 
          mb: 3, 
          borderRadius: 3,
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white'
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, flexWrap: 'wrap' }}>
            <CheckCircle sx={{ fontSize: 64 }} />
            <Box flex={1}>
              <Typography variant="h4" fontWeight="bold" gutterBottom>
                Booking Confirmed! 🎉
              </Typography>
              <Typography variant="body1">
                Your flight has been successfully booked. A confirmation email has been sent to your registered email address.
              </Typography>
            </Box>
            <Chip 
              label={isConfirmed ? "CONFIRMED" : "PENDING"} 
              sx={{ 
                bgcolor: isConfirmed ? '#4caf50' : '#ff9800', 
                color: 'white',
                fontWeight: 'bold',
                fontSize: '0.9rem',
                p: 2
              }}
            />
          </Box>
        </Paper>
      </Zoom>

      {/* Booking References - Enhanced */}
      <Paper sx={{ p: 3, mb: 3, borderRadius: 3 }}>
        <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <ConfirmationNumber sx={{ color: '#667eea' }} /> Booking Reference
        </Typography>
        <Divider sx={{ mb: 2 }} />
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 4 }}>
            <Box sx={{ 
              textAlign: 'center', 
              p: 2.5, 
              bgcolor: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)', 
              borderRadius: 2,
              border: '1px solid #e0e0e0'
            }}>
              <Typography variant="caption" color="text.secondary">PNR Number</Typography>
              <Typography variant="h5" fontFamily="monospace" fontWeight="bold" sx={{ mt: 1 }}>
                {displayPnrNumber || 'N/A'}
                {displayPnrNumber && (
                  <Tooltip title="Copy PNR">
                    <IconButton size="small" onClick={() => handleCopy(displayPnrNumber, 'PNR')} sx={{ ml: 1 }}>
                      <ContentCopy fontSize="small" />
                    </IconButton>
                  </Tooltip>
                )}
              </Typography>
            </Box>
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <Box sx={{ textAlign: 'center', p: 2.5, bgcolor: '#f5f7fa', borderRadius: 2, border: '1px solid #e0e0e0' }}>
              <Typography variant="caption" color="text.secondary">Airline Locator</Typography>
              <Typography variant="h6" fontFamily="monospace" sx={{ mt: 1 }}>
                {displayAirLocatorCode || 'N/A'}
              </Typography>
            </Box>
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <Box sx={{ textAlign: 'center', p: 2.5, bgcolor: '#f5f7fa', borderRadius: 2, border: '1px solid #e0e0e0' }}>
              <Typography variant="caption" color="text.secondary">Booking Date</Typography>
              <Typography variant="h6" sx={{ mt: 1 }}>
                {formatDate(pnrData?.createdAt || new Date())}
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* Ticketing Deadline Alert */}
      {pnrData?.ticketingDeadline && (
        <Alert severity="info" sx={{ mb: 3, borderRadius: 2 }}>
          <AlertTitle>⏰ Ticketing Deadline</AlertTitle>
          Please complete your payment by {formatDateTime(pnrData.ticketingDeadline)} to avoid cancellation.
        </Alert>
      )}

      {/* Selected Seat Info - Enhanced */}
      {selectedSeat && (
        <Zoom in timeout={400}>
          <Paper sx={{ p: 3, mb: 3, borderRadius: 3, bgcolor: 'linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%)' }}>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <EventSeat sx={{ color: '#4caf50' }} /> Selected Seat
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <Box sx={{ textAlign: 'center', p: 2 }}>
              <Typography variant="h1" fontWeight="bold" sx={{ color: '#2e7d32', fontSize: { xs: '3rem', md: '4rem' } }}>
                {selectedSeat.seatCode}
              </Typography>
              <Typography variant="body1" sx={{ mt: 1 }}>
                {getSeatTypeLabel(selectedSeat.seatType)}
              </Typography>
              <Chip label="Seat Confirmed" color="success" size="small" sx={{ mt: 1 }} />
            </Box>
          </Paper>
        </Zoom>
      )}

      {/* Flight Itinerary - Enhanced */}
      <Paper sx={{ p: 3, mb: 3, borderRadius: 3 }}>
        <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <FlightTakeoff sx={{ color: '#667eea' }} /> Flight Itinerary
        </Typography>
        <Divider sx={{ mb: 2 }} />
        
        {displayFlightSegments.length > 0 ? (
          displayFlightSegments.map((segment, idx) => (
            <Card key={idx} sx={{ mb: 2, borderRadius: 2, overflow: 'hidden' }}>
              <CardContent sx={{ p: 3 }}>
                <Grid container spacing={3} alignItems="center">
                  <Grid size={{ xs: 12, md: 2 }} sx={{ textAlign: 'center' }}>
                    <Avatar sx={{ bgcolor: '#667eea', width: 56, height: 56, margin: '0 auto' }}>
                      {segment.carrier}
                    </Avatar>
                    <Typography fontWeight="bold" sx={{ mt: 1 }}>
                      {segment.carrier} {segment.flightNumber}
                    </Typography>
                    <Chip 
                      label={segment.cabinClass || segment.classOfService} 
                      size="small" 
                      sx={{ mt: 0.5, bgcolor: '#e3f2fd' }}
                    />
                  </Grid>
                  
                  <Grid size={{ xs: 12, md: 4 }}>
                    <Box sx={{ textAlign: { xs: 'center', md: 'left' } }}>
                      <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <LocationOn fontSize="small" /> Departure
                      </Typography>
                      <Typography variant="h5" fontWeight="bold">{segment.origin}</Typography>
                      <Typography variant="body2">{formatDateTime(segment.departureTime)}</Typography>
                      {segment.originTerminal && (
                        <Chip label={`Terminal ${segment.originTerminal}`} size="small" variant="outlined" sx={{ mt: 0.5 }} />
                      )}
                    </Box>
                  </Grid>
                  
                  <Grid size={{ xs: 12, md: 2 }} sx={{ textAlign: 'center' }}>
                    <FlightTakeoff sx={{ transform: 'rotate(90deg)', color: '#667eea' }} />
                    <Typography variant="body2" sx={{ mt: 1 }}>
                      {getFlightDuration(segment.departureTime, segment.arrivalTime)}
                    </Typography>
                    {segment.stops === 0 && (
                      <Chip label="Direct" size="small" color="success" sx={{ mt: 0.5 }} />
                    )}
                  </Grid>
                  
                  <Grid size={{ xs: 12, md: 4 }}>
                    <Box sx={{ textAlign: { xs: 'center', md: 'right' } }}>
                      <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5, justifyContent: { xs: 'center', md: 'flex-end' } }}>
                        <LocationOn fontSize="small" /> Arrival
                      </Typography>
                      <Typography variant="h5" fontWeight="bold">{segment.destination}</Typography>
                      <Typography variant="body2">{formatDateTime(segment.arrivalTime)}</Typography>
                      {segment.destinationTerminal && (
                        <Chip label={`Terminal ${segment.destinationTerminal}`} size="small" variant="outlined" sx={{ mt: 0.5 }} />
                      )}
                    </Box>
                  </Grid>
                </Grid>
                
                {/* Aircraft Info */}
                {segment.equipment && (
                  <Box sx={{ mt: 2, pt: 2, borderTop: '1px solid #e0e0e0' }}>
                    <Typography variant="caption" color="text.secondary">
                      Aircraft: {segment.equipment} • {segment.isEticketable ? 'E-Ticket Available' : 'Paper Ticket'}
                    </Typography>
                  </Box>
                )}
              </CardContent>
            </Card>
          ))
        ) : (
          <Alert severity="warning">No flight segments found in booking data.</Alert>
        )}
      </Paper>

      {/* Passengers - Enhanced */}
      <Paper sx={{ p: 3, mb: 3, borderRadius: 3 }}>
        <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Person sx={{ color: '#667eea' }} /> Passenger Details
        </Typography>
        <Divider sx={{ mb: 2 }} />
        
        <Grid container spacing={2}>
          {displayPassengers.length > 0 ? (
            displayPassengers.map((passenger, idx) => (
              <Grid size={{ xs: 12, md: 6 }} key={idx}>
                <Card sx={{ borderRadius: 2, height: '100%' }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <Box>
                        <Typography variant="h6">
                          {passenger.prefix && `${passenger.prefix} `}{passenger.firstName} {passenger.lastName}
                        </Typography>
                        <Box sx={{ mt: 1 }}>
                          <Chip 
                            label={getPassengerTypeLabel(passenger.type)} 
                            size="small" 
                            sx={{ mr: 1, mb: 0.5 }}
                          />
                          {passenger.age && (
                            <Chip label={`Age: ${passenger.age}`} size="small" variant="outlined" />
                          )}
                        </Box>
                        {passenger.dob && (
                          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                            DOB: {formatDate(passenger.dob)}
                          </Typography>
                        )}
                        {passenger.gender && (
                          <Typography variant="body2" color="text.secondary">
                            Gender: {passenger.gender}
                          </Typography>
                        )}
                      </Box>
                      <Avatar sx={{ bgcolor: '#667eea' }}>
                        <Person />
                      </Avatar>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))
          ) : (
            <Grid size={{ xs: 12 }}>
              <Alert severity="warning">No passenger data found in booking confirmation.</Alert>
            </Grid>
          )}
        </Grid>
      </Paper>

      {/* Baggage & Amenities */}
      <Paper sx={{ p: 3, mb: 3, borderRadius: 3 }}>
        <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Luggage sx={{ color: '#667eea' }} /> Baggage & Amenities
        </Typography>
        <Divider sx={{ mb: 2 }} />
        
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, md: 4 }}>
            <Box sx={{ textAlign: 'center', p: 2, bgcolor: '#f5f7fa', borderRadius: 2 }}>
              <Luggage sx={{ fontSize: 40, color: '#667eea' }} />
              <Typography variant="h6" fontWeight="bold" sx={{ mt: 1 }}>
                {pnrData?.baggageAllowance?.weight || 15} kg
              </Typography>
              <Typography variant="caption" color="text.secondary">Check-in Baggage</Typography>
            </Box>
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <Box sx={{ textAlign: 'center', p: 2, bgcolor: '#f5f7fa', borderRadius: 2 }}>
              <Restaurant sx={{ fontSize: 40, color: '#667eea' }} />
              <Typography variant="body1" sx={{ mt: 1 }}>
                {selectedFare?.amenities?.meals ? 'Meal Included' : 'Meals Available'}
              </Typography>
              <Typography variant="caption" color="text.secondary">On-board Service</Typography>
            </Box>
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <Box sx={{ textAlign: 'center', p: 2, bgcolor: '#f5f7fa', borderRadius: 2 }}>
              <Wifi sx={{ fontSize: 40, color: '#667eea' }} />
              <Typography variant="body1" sx={{ mt: 1 }}>
                {selectedFare?.amenities?.wifi ? 'Wi-Fi Available' : 'No Wi-Fi'}
              </Typography>
              <Typography variant="caption" color="text.secondary">Connectivity</Typography>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* Contact & Payment - Enhanced */}
      <Paper sx={{ p: 3, mb: 3, borderRadius: 3 }}>
        <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Phone sx={{ color: '#667eea' }} /> Contact & Payment
        </Typography>
        <Divider sx={{ mb: 2 }} />
        
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, md: 6 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 2, bgcolor: '#f5f7fa', borderRadius: 2 }}>
              <Email sx={{ color: '#667eea' }} />
              <Box>
                <Typography variant="caption" color="text.secondary">Email Address</Typography>
                <Typography variant="body1">{contactInfo?.email || 'N/A'}</Typography>
              </Box>
            </Box>
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 2, bgcolor: '#f5f7fa', borderRadius: 2 }}>
              <Phone sx={{ color: '#667eea' }} />
              <Box>
                <Typography variant="caption" color="text.secondary">Phone Number</Typography>
                <Typography variant="body1">
                  {contactInfo?.phone?.number 
                    ? `+${contactInfo.phone.countryCode || '91'} ${contactInfo.phone.number}`
                    : contactInfo?.phone || 'N/A'}
                </Typography>
              </Box>
            </Box>
          </Grid>
          <Grid size={{ xs: 12 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 2, bgcolor: '#f5f7fa', borderRadius: 2 }}>
              <AccountBalanceWallet sx={{ color: '#667eea' }} />
              <Box>
                <Typography variant="caption" color="text.secondary">Payment Method</Typography>
                <Typography variant="body1">{paymentMethod}</Typography>
              </Box>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* Fare Summary - Enhanced */}
      <Paper sx={{ p: 3, mb: 3, borderRadius: 3 }}>
        <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <CurrencyRupee sx={{ color: '#667eea' }} /> Fare Summary
        </Typography>
        <Divider sx={{ mb: 2 }} />
        
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 5 }}>
            <Card sx={{ bgcolor: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', textAlign: 'center', height: '100%' }}>
              <CardContent>
                <Typography variant="h3" fontWeight="bold" sx={{ color: 'white' }}>
                  {formatCurrency(displayTotalPrice)}
                </Typography>
                <Typography sx={{ color: 'rgba(255,255,255,0.9)' }}>Total Amount</Typography>
                {pnrData?.isRefundable && (
                  <Chip label="Refundable" size="small" sx={{ mt: 2, bgcolor: 'rgba(255,255,255,0.2)', color: 'white' }} />
                )}
              </CardContent>
            </Card>
          </Grid>
          <Grid size={{ xs: 12, md: 7 }}>
            <TableContainer component={Paper} variant="outlined">
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ bgcolor: '#f5f7fa' }}>
                    <TableCell>Description</TableCell>
                    <TableCell align="right">Amount</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {pnrData?.basePrice && (
                    <TableRow>
                      <TableCell>Base Fare</TableCell>
                      <TableCell align="right">{formatCurrency(pnrData.basePrice)}</TableCell>
                    </TableRow>
                  )}
                  {pnrData?.taxBreakdown && pnrData.taxBreakdown.length > 0 && (
                    pnrData.taxBreakdown.map((tax, idx) => (
                      <TableRow key={idx}>
                        <TableCell>Tax - {tax.category}</TableCell>
                        <TableCell align="right">{formatCurrency(tax.amount)}</TableCell>
                      </TableRow>
                    ))
                  )}
                  {pnrData?.taxes && !pnrData.taxBreakdown?.length && (
                    <TableRow>
                      <TableCell>Taxes & Fees</TableCell>
                      <TableCell align="right">{formatCurrency(pnrData.taxes)}</TableCell>
                    </TableRow>
                  )}
                  <TableRow sx={{ fontWeight: 'bold', backgroundColor: '#f5f7fa' }}>
                    <TableCell><strong>Total</strong></TableCell>
                    <TableCell align="right"><strong>{formatCurrency(displayTotalPrice)}</strong></TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
          </Grid>
        </Grid>
        
        {/* Cancellation/Change Policy */}
        {(penalties?.change || penalties?.cancel) && (
          <Box sx={{ mt: 2, p: 2, bgcolor: '#fff3e0', borderRadius: 2 }}>
            <Typography variant="subtitle2" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Security fontSize="small" /> Cancellation & Change Policy
            </Typography>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              {penalties.cancel && (
                <Grid size={{ xs: 6 }}>
                  <Typography variant="caption" color="text.secondary">Cancellation Fee</Typography>
                  <Typography variant="body2" fontWeight="bold">
                    {typeof penalties.cancel.amount === 'string' 
                      ? formatCurrency(penalties.cancel.amount)
                      : `INR ${penalties.cancel.amount?.toLocaleString() || 'N/A'}`}
                  </Typography>
                </Grid>
              )}
              {penalties.change && (
                <Grid size={{ xs: 6 }}>
                  <Typography variant="caption" color="text.secondary">Change Fee</Typography>
                  <Typography variant="body2" fontWeight="bold">
                    {typeof penalties.change.amount === 'string'
                      ? formatCurrency(penalties.change.amount)
                      : `INR ${penalties.change.amount?.toLocaleString() || 'N/A'}`}
                  </Typography>
                </Grid>
              )}
            </Grid>
          </Box>
        )}
      </Paper>

      {/* Actions */}
      <Box sx={{ display: 'flex', gap: 2, mt: 3, flexDirection: isMobile ? 'column' : 'row' }}>
        <Button 
          variant="outlined" 
          startIcon={<ArrowBack />} 
          onClick={handleBack} 
          fullWidth={isMobile}
          sx={{ borderRadius: 2 }}
        >
          Back
        </Button>
        <Button 
          variant="outlined" 
          startIcon={<Print />} 
          onClick={handlePrint} 
          fullWidth={isMobile}
          sx={{ borderRadius: 2 }}
        >
          Print
        </Button>
        <Button 
          variant="outlined" 
          startIcon={<Download />} 
          onClick={handleDownload} 
          fullWidth={isMobile}
          sx={{ borderRadius: 2 }}
        >
          Download
        </Button>
        <Button 
          variant="outlined" 
          startIcon={<Share />} 
          onClick={handleShare} 
          fullWidth={isMobile}
          sx={{ borderRadius: 2 }}
        >
          Share
        </Button>
        <Button 
          variant="outlined" 
          startIcon={<Info />} 
          onClick={() => setOpenRawDialog(true)} 
          fullWidth={isMobile}
          sx={{ borderRadius: 2 }}
        >
          Raw Data
        </Button>
        <Button 
          variant="contained" 
          startIcon={<VerifiedUser />} 
          onClick={handleSubmitBooking} 
          disabled={isSubmitting} 
          fullWidth={isMobile} 
          sx={{ 
            bgcolor: '#2e7d32', 
            '&:hover': { bgcolor: '#1b5e20' },
            borderRadius: 2,
            py: 1.5
          }}
        >
          {isSubmitting ? <CircularProgress size={24} color="inherit" /> : 'Proceed to Payment'}
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
            {JSON.stringify({ pnrData, bookingData }, null, 2)}
          </pre>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenRawDialog(false)}>Close</Button>
          <Button 
            startIcon={<ContentCopy />} 
            onClick={() => handleCopy(JSON.stringify({ pnrData, bookingData }, null, 2), 'Raw Data')}
          >
            Copy
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
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