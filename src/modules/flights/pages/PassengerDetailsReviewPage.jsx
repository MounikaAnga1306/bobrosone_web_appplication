// src/modules/flights/pages/PassengerDetailsReviewPage.jsx

import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
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
  useTheme
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
  Info
} from '@mui/icons-material';
import { format } from 'date-fns';
import { createBillDeskOrder } from '../services/paymentGatewayservices';

const PassengerDetailsReviewPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  const [bookingConfirmation, setBookingConfirmation] = useState(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [openRawDialog, setOpenRawDialog] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ============================================================
  // GET DATA FROM NAVIGATION STATE
  // ============================================================
  
  useEffect(() => {
    console.log('\n' + '='.repeat(80));
    console.log('📄 PASSENGER DETAILS REVIEW PAGE - MOUNTED');
    console.log('='.repeat(80));
    
    const state = location.state || {};
    console.log('📍 Full location.state:', state);
    console.log('📍 location.state keys:', Object.keys(state));
    
    const confirmationData = state.bookingConfirmation;
    console.log('📦 bookingConfirmation from state:', confirmationData);
    
    if (confirmationData) {
      console.log('✅ Booking confirmation data found!');
      console.log('   - universalLocator:', confirmationData.universalLocator);
      console.log('   - totalPrice:', confirmationData.totalPrice);
      console.log('   - passengers:', confirmationData.passengersBooked?.length);
      console.log('   - flightSegments:', confirmationData.flightSegments?.length);
      setBookingConfirmation(confirmationData);
    } else {
      console.error('❌ No bookingConfirmation found in location.state!');
    }
    
    console.log('='.repeat(80) + '\n');
  }, [location.state]);

  if (!bookingConfirmation) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h6">Loading booking confirmation...</Typography>
          <Typography color="text.secondary" sx={{ mt: 1 }}>
            Please wait while we retrieve your booking details.
          </Typography>
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
    const data = JSON.stringify(bookingConfirmation, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `booking_${bookingConfirmation.universalLocator || 'confirmation'}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setSnackbarMessage('Receipt downloaded!');
    setSnackbarOpen(true);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: 'Flight Booking',
        text: `Booking: ${bookingConfirmation.universalLocator}`,
      });
    } else {
      handleCopy(bookingConfirmation.universalLocator, 'Booking Reference');
    }
  };

  const handleBack = () => {
    navigate(-1);
  };

  const calculateTotalAmount = () => {
    if (bookingConfirmation.pricingInfo && bookingConfirmation.pricingInfo.length > 0) {
      const total = bookingConfirmation.pricingInfo.reduce((sum, p) => {
        const amount = p.basePrice || p.totalPrice || '0';
        const numericAmount = parseFloat(amount.toString().replace(/[^0-9.-]/g, ''));
        return sum + (isNaN(numericAmount) ? 0 : numericAmount);
      }, 0);
      return `INR${total}`;
    }
    return bookingConfirmation.totalPrice || 'INR0';
  };

  const handleSubmitBooking = async () => {
  // Validation checks
  if (!bookingConfirmation.contactInfo?.phone) {
    setSnackbarMessage('❌ Phone number is missing. Please go back and add contact info.');
    setSnackbarOpen(true);
    return;
  }

  if (!bookingConfirmation.passengersBooked?.[0]?.name?.first) {
    setSnackbarMessage('❌ Passenger name is missing. Please go back and add passenger details.');
    setSnackbarOpen(true);
    return;
  }

  console.log('📤 SUBMIT BUTTON CLICKED - SENDING BOOKING DATA TO SERVICE');
  console.log('📦 Booking Data:', {
    bookingConfirmation,
    contactInfo: bookingConfirmation.contactInfo,
    passengersBooked: bookingConfirmation.passengersBooked,
    pricingInfo: bookingConfirmation.pricingInfo,
    universalLocator: bookingConfirmation.universalLocator,
    airLocatorCode: bookingConfirmation.airLocatorCode,
    providerLocatorCode: bookingConfirmation.providerLocatorCode,
    totalPrice: bookingConfirmation.totalPrice
  });

  setIsSubmitting(true);

  try {
    // Send the entire booking confirmation data to the service
    const response = await createBillDeskOrder(bookingConfirmation);
    
    console.log('✅ ORDER CREATED SUCCESSFULLY:', response);
    
    // Check if response is valid
    if (!response || !response.success) {
      throw new Error(response?.message || 'Order creation failed');
    }
    
    // Extract data from response.data
    const responseData = response.data;
    
    // Extract bdorderid and authToken directly from responseData
    const bdorderid = responseData?.bdorderid;
    const authToken = responseData?.authToken;
    
    // Merchant ID (hardcoded or can come from config)
    const merchantId = "HYDBOBROS";
    
    console.log('📋 MERCHANT ID:', merchantId);
    console.log('📋 BDORDERID:', bdorderid);
    console.log('📋 AUTH TOKEN (first 50 chars):', authToken ? authToken.substring(0, 50) + '...' : 'NOT FOUND');
    
    // Validate required fields
    if (!bdorderid) {
      throw new Error('Order ID (bdorderid) missing from response');
    }
    
    if (!authToken) {
      throw new Error('Auth Token missing from response');
    }
    
    // Construct BillDesk checkout URL
    const billdeskUrl = `https://uat.bobros.co.in/billdesk_checkout.php?merchantId=${merchantId}&bdorderid=${bdorderid}&authToken=${encodeURIComponent(authToken)}`;
    
    console.log('🔗 BILLDESK CHECKOUT URL:', billdeskUrl);
    console.log('🔄 REDIRECTING TO PAYMENT GATEWAY...');
    
    // Redirect to BillDesk payment gateway
    window.location.href = billdeskUrl;
    
  } catch (error) {
    console.error('❌ BILLDESK ORDER CREATION FAILED:', error);
    setSnackbarMessage(`❌ Payment initiation failed: ${error.message || 'Unknown error'}`);
    setSnackbarOpen(true);
    setIsSubmitting(false);
  }
};

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Debug Info */}
      <Paper sx={{ p: 2, mb: 3, bgcolor: '#e3f2fd' }}>
        <Typography variant="caption" component="div" fontFamily="monospace">
          <strong>🔍 Debug Info:</strong><br />
          Universal Locator: {bookingConfirmation.universalLocator || 'N/A'}<br />
          Air Locator: {bookingConfirmation.airLocatorCode || 'N/A'}<br />
          Provider Locator: {bookingConfirmation.providerLocatorCode || 'N/A'}<br />
          Total Price: {bookingConfirmation.totalPrice || 'N/A'}<br />
          Passengers: {bookingConfirmation.passengersBooked?.length || 0}<br />
          Flight Segments: {bookingConfirmation.flightSegments?.length || 0}<br />
          Pricing Info: {bookingConfirmation.pricingInfo?.length || 0}
        </Typography>
      </Paper>

      {/* Header */}
      <Paper sx={{ p: 3, mb: 3, borderRadius: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
          <CheckCircle sx={{ fontSize: 48, color: 'success.main' }} />
          <Box>
            <Typography variant="h4" fontWeight="bold">
              Booking Confirmed!
            </Typography>
            <Typography color="text.secondary">
              Your flight has been successfully booked
            </Typography>
          </Box>
        </Box>
        {bookingConfirmation.hasWarnings && bookingConfirmation.warnings?.length > 0 && (
          <Alert severity="warning" icon={<Warning />}>
            <AlertTitle>Important Notices</AlertTitle>
            {bookingConfirmation.warnings.map((w, i) => <div key={i}>• {w}</div>)}
          </Alert>
        )}
      </Paper>

      {/* Booking References */}
      <Paper sx={{ p: 3, mb: 3, borderRadius: 2 }}>
        <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <ConfirmationNumber /> Booking Reference
        </Typography>
        <Divider sx={{ mb: 2 }} />
        <Grid container spacing={2}>
          <Grid item xs={12} md={4}>
            <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'action.hover', borderRadius: 2 }}>
              <Typography variant="caption">Universal Locator</Typography>
              <Typography variant="h6" fontFamily="monospace">
                {bookingConfirmation.universalLocator || 'N/A'}
                {bookingConfirmation.universalLocator && (
                  <IconButton size="small" onClick={() => handleCopy(bookingConfirmation.universalLocator, 'Locator')}>
                    <ContentCopy fontSize="small" />
                  </IconButton>
                )}
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} md={4}>
            <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'action.hover', borderRadius: 2 }}>
              <Typography variant="caption">Air Locator</Typography>
              <Typography variant="h6" fontFamily="monospace">
                {bookingConfirmation.airLocatorCode || 'N/A'}
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} md={4}>
            <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'action.hover', borderRadius: 2 }}>
              <Typography variant="caption">Provider</Typography>
              <Typography variant="h6">
                {bookingConfirmation.providerCode || 'N/A'}
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* Flight Itinerary */}
      <Paper sx={{ p: 3, mb: 3, borderRadius: 2 }}>
        <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <FlightTakeoff /> Flight Itinerary
        </Typography>
        <Divider sx={{ mb: 2 }} />
        
        {bookingConfirmation.flightSegments && bookingConfirmation.flightSegments.length > 0 ? (
          bookingConfirmation.flightSegments.map((segment, idx) => (
            <Card key={idx} sx={{ mb: 2 }}>
              <CardContent>
                <Grid container spacing={2} alignItems="center">
                  <Grid item xs={12} sm={2} sx={{ textAlign: 'center' }}>
                    <Avatar sx={{ bgcolor: 'primary.main', margin: '0 auto' }}>
                      {segment.carrier}
                    </Avatar>
                    <Typography fontWeight="bold">{segment.carrier} {segment.flightNumber}</Typography>
                    <Chip label={segment.classOfService} size="small" />
                  </Grid>
                  
                  <Grid item xs={12} sm={4}>
                    <Typography variant="body2" color="text.secondary">Departure</Typography>
                    <Typography variant="h6">{segment.origin}</Typography>
                    <Typography variant="body2">{formatDateTime(segment.departureTime)}</Typography>
                  </Grid>
                  
                  <Grid item xs={12} sm={2} sx={{ textAlign: 'center' }}>
                    <FlightTakeoff sx={{ transform: 'rotate(90deg)', color: 'primary.main' }} />
                    <Typography variant="body2">{getFlightDuration(segment.departureTime, segment.arrivalTime)}</Typography>
                  </Grid>
                  
                  <Grid item xs={12} sm={4}>
                    <Typography variant="body2" color="text.secondary">Arrival</Typography>
                    <Typography variant="h6">{segment.destination}</Typography>
                    <Typography variant="body2">{formatDateTime(segment.arrivalTime)}</Typography>
                  </Grid>
                </Grid>
                
                <Box sx={{ mt: 2, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  <Chip icon={<Luggage />} label={segment.baggageAllowance || "15kg"} size="small" />
                  <Chip icon={<Restaurant />} label="Meal" size="small" />
                  <Chip icon={<Wifi />} label="WiFi" size="small" />
                  <Chip label={`Status: ${segment.status || 'Confirmed'}`} size="small" color="success" />
                </Box>
              </CardContent>
            </Card>
          ))
        ) : (
          <Alert severity="warning">No flight segments found in booking data.</Alert>
        )}
      </Paper>

      {/* Passengers */}
      <Paper sx={{ p: 3, mb: 3, borderRadius: 2 }}>
        <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Person /> Passengers
        </Typography>
        <Divider sx={{ mb: 2 }} />
        
        <Grid container spacing={2}>
          {bookingConfirmation.passengersBooked && bookingConfirmation.passengersBooked.length > 0 ? (
            bookingConfirmation.passengersBooked.map((passenger, idx) => (
              <Grid item xs={12} md={6} key={idx}>
                <Card>
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Box>
                        <Typography variant="h6">
                          {passenger.name?.prefix} {passenger.name?.first} {passenger.name?.last}
                        </Typography>
                        <Typography variant="body2">Type: {passenger.type}</Typography>
                        <Typography variant="body2">Age: {passenger.age}</Typography>
                        <Typography variant="body2">DOB: {formatDate(passenger.dob)}</Typography>
                        <Typography variant="body2">Gender: {passenger.gender}</Typography>
                      </Box>
                      <Chip label={`Pax ${idx + 1}`} />
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))
          ) : (
            <Grid item xs={12}>
              <Alert severity="warning">No passenger data found in booking confirmation.</Alert>
            </Grid>
          )}
        </Grid>
      </Paper>

      {/* Contact & Payment */}
      <Paper sx={{ p: 3, mb: 3, borderRadius: 2 }}>
        <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Phone /> Contact & Payment
        </Typography>
        <Divider sx={{ mb: 2 }} />
        
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 2, bgcolor: 'action.hover', borderRadius: 2 }}>
              <Email />
              <Box>
                <Typography variant="caption">Email</Typography>
                <Typography>{bookingConfirmation.contactInfo?.email || 'N/A'}</Typography>
              </Box>
            </Box>
          </Grid>
          <Grid item xs={12} md={6}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 2, bgcolor: 'action.hover', borderRadius: 2 }}>
              <Phone />
              <Box>
                <Typography variant="caption">Phone</Typography>
                <Typography>{bookingConfirmation.contactInfo?.phone || 'N/A'}</Typography>
              </Box>
            </Box>
          </Grid>
          <Grid item xs={12}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 2, bgcolor: 'action.hover', borderRadius: 2 }}>
              <AccountBalanceWallet />
              <Box>
                <Typography variant="caption">Payment Method</Typography>
                <Typography>{bookingConfirmation.paymentType || 'Cash'}</Typography>
              </Box>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* Fare Summary */}
      <Paper sx={{ p: 3, mb: 3, borderRadius: 2 }}>
        <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <AccountBalanceWallet /> Fare Summary
        </Typography>
        <Divider sx={{ mb: 2 }} />
        
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <Card sx={{ bgcolor: 'success.light', textAlign: 'center' }}>
              <CardContent>
                <Typography variant="h4" fontWeight="bold">
                  {calculateTotalAmount()}
                </Typography>
                <Typography>Total Amount</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={8}>
            <TableContainer component={Paper} variant="outlined">
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ bgcolor: 'action.hover' }}>
                    <TableCell>Description</TableCell>
                    <TableCell align="right">Amount</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {bookingConfirmation.pricingInfo && bookingConfirmation.pricingInfo.length > 0 ? (
                    bookingConfirmation.pricingInfo.map((p, idx) => (
                      <TableRow key={idx}>
                        <TableCell>Passenger {idx + 1}</TableCell>
                        <TableCell align="right">{p.basePrice || p.totalPrice}</TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={2} align="center">No pricing information available</TableCell>
                    </TableRow>
                  )}
                  <TableRow sx={{ fontWeight: 'bold', backgroundColor: '#f5f5f5' }}>
                    <TableCell><strong>Total</strong></TableCell>
                    <TableCell align="right"><strong>{calculateTotalAmount()}</strong></TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
          </Grid>
        </Grid>
      </Paper>

      {/* Actions */}
      <Box sx={{ display: 'flex', gap: 2, mt: 3, flexDirection: isMobile ? 'column' : 'row' }}>
        <Button
          variant="outlined"
          startIcon={<ArrowBack />}
          onClick={handleBack}
          fullWidth={isMobile}
        >
          Back
        </Button>
        <Button
          variant="outlined"
          startIcon={<Print />}
          onClick={handlePrint}
          fullWidth={isMobile}
        >
          Print
        </Button>
        <Button
          variant="outlined"
          startIcon={<Download />}
          onClick={handleDownload}
          fullWidth={isMobile}
        >
          Download
        </Button>
        <Button
          variant="outlined"
          startIcon={<Share />}
          onClick={handleShare}
          fullWidth={isMobile}
        >
          Share
        </Button>
        <Button
          variant="outlined"
          startIcon={<Info />}
          onClick={() => setOpenRawDialog(true)}
          fullWidth={isMobile}
        >
          Raw Data
        </Button>
        <Button
          variant="contained"
          color="primary"
          startIcon={<CheckCircle />}
          onClick={handleSubmitBooking}
          disabled={isSubmitting}
          fullWidth={isMobile}
          sx={{ bgcolor: '#2e7d32', '&:hover': { bgcolor: '#1b5e20' } }}
        >
          {isSubmitting ? 'Submitting...' : 'Submit Booking'}
        </Button>
      </Box>

      {/* Raw Data Dialog */}
      <Dialog open={openRawDialog} onClose={() => setOpenRawDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          Raw Booking Data
          <IconButton sx={{ position: 'absolute', right: 8, top: 8 }} onClick={() => setOpenRawDialog(false)}>
            <Close />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <pre style={{ overflow: 'auto', fontSize: 12 }}>
            {JSON.stringify(bookingConfirmation, null, 2)}
          </pre>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenRawDialog(false)}>Close</Button>
          <Button startIcon={<ContentCopy />} onClick={() => handleCopy(JSON.stringify(bookingConfirmation, null, 2), 'Data')}>
            Copy
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={2000}
        onClose={() => setSnackbarOpen(false)}
        message={snackbarMessage}
      />
    </Container>
  );
};

export default PassengerDetailsReviewPage;