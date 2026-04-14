// App.jsx - Complete file with proper padding for flight routes only
 
import React, { useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
  Outlet,
} from "react-router-dom";
 
import { FlightSearchProvider } from "./modules/flights/contexts/FlightSearchContext";
import { FlightMasterProvider } from "./modules/flights/providers/CarrierCodeProvider";
 
import FlightTracker from "./modules/flights/pages/FlightTracker";
import SearchPage from "./modules/flights/pages/FlightSearchScreen";
import OneWayPage from "./modules/flights/pages/OneWayPage";
import RoundTripPage from "./modules/flights/pages/RoundTripPage";
import MultiCityPage from "./modules/flights/pages/MultiCityPage";
import PNRSearch from "./modules/flights/pages/PNRSearch";
import BookingReviewPage from "./modules/flights/pages/BookingReviewPage";
import SeatMapPage from "./modules/flights/pages/SeatMapPage";
import PassengerDetailsReview from "./modules/flights/pages/PassengerDetailsReviewPage";
import { PricingBookingProvider, usePricingBooking } from './modules/flights/contexts/PricingBookingContext';
import { PnrResponseProvider } from './modules/flights/contexts/PnrResponseContext';
import TicketConfirmationScreen from './modules/flights/pages/TicketConfirmationScreen';
 
import { initializePricingContext } from './modules/flights/services/pricingService';
import pnrCreationService from './modules/flights/services/pnr_creationService';
 
import HotelsHomeScreen from "./modules/hotels/pages/HotelsHomeScreen";
import HotelSearchResults from "./modules/hotels/pages/HotelSearchResults";
import { HotelSearchProvider } from "./modules/hotels/context/HotelSearchContext";
 
import Navbar from "./globalfiles/Navbar";
import FooterBottom from "./globalfiles/FooterBottom";
 
import Home from "./modules/bus/pages/HomePage";
import BusResultsPage from "./modules/bus/pages/BusResultsPage";
import BookingSuccess from "./modules/bus/pages/BookingSuccess";
import PaymentStatus from "./modules/bus/pages/PaymentStatus";
 
import SignIn from "./modules/bus/pages/SignIn";
import SignupForm from "./modules/bus/pages/SignUpForm";
import VerifyOTP from "./modules/bus/pages/VerifyOTP";
import ForgotPassword from "./modules/bus/pages/ForgotPassword";
import ResetPassword from "./modules/bus/pages/ResetPassword";
 
import MyBookings from "./modules/bus/pages/MyBookings";
import GuestBookingsPage from "./modules/bus/pages/GuestBookingPage";
import CancelTicketPage from "./modules/bus/pages/CancelTicketPage";
import MyAccount from "./modules/bus/pages/MyAccount";
import MyProfile from "./modules/bus/pages/MyProfile";
 
import AboutUs from "./modules/bus/pages/AboutUs";
import ContactUs from "./modules/bus/pages/ContactUs";
import PrivacyPolicy from "./modules/bus/pages/PrivacyPolicy";
import TermsAndConditions from "./modules/bus/pages/TermsAndConditions";
import CancellationPolicy from "./modules/bus/pages/CancellationPolicy";
import DisclaimerPolicy from "./modules/bus/pages/DisclaimerPolicy";

// ✅ ADDED: Bill Payment imports
import BillHomeScreen from "./modules/Bill Payments/pages/BillHomeScreen";
import BillDetails from './modules/Bill Payments/pages/BillDetails';
 
import { GoogleOAuthProvider } from "@react-oauth/google";
 
// ============================================
// MAIN CONTENT COMPONENT WITH PADDING LOGIC
// ============================================
// Padding is applied ONLY to flight routes
// Bus routes, hotel routes, and special flight routes have NO padding
 
const MainContent = ({ children }) => {
  const location = useLocation();
  const pathname = location.pathname;
 
  // ========== BUS ROUTES (NO PADDING) ==========
  const isBusRoute =
    pathname === "/" ||
    pathname === "/HomePage" ||
    pathname === "/results" ||
    pathname === "/booking-success" ||
    pathname === "/payment-status" ||
    pathname.startsWith("/sign") ||
    pathname === "/verify-otp" ||
    pathname === "/forgot-password" ||
    pathname === "/reset-password" ||
    pathname === "/my-bookings" ||
    pathname === "/guest-bookings" ||
    pathname === "/cancel-ticket" ||
    pathname === "/my-account" ||
    pathname === "/my-profile" ||
    pathname === "/about" ||
    pathname === "/contact" ||
    pathname === "/privacy" ||
    pathname === "/terms" ||
    pathname === "/cancel" ||
    pathname === "/disclaimer";
 
  // ========== HOTEL ROUTES (NO PADDING) ==========
  const isHotelRoute =
    pathname === "/hotels" ||
    pathname.startsWith("/hotels/");
 
  // ========== FLIGHT ROUTES (WILL HAVE PADDING) ==========
  const isFlightRoute =
    pathname.startsWith("/flights/");
 
  // ========== SPECIAL FLIGHT ROUTES WITH NO PADDING (EXCEPTIONS) ==========
  const isSpecialNoPaddingFlightRoute =
    pathname === "/flights/tracker" ||
    pathname === "/flights" ||
    pathname === "/flights/pnr-search";
 
  // ========== PADDING DECISION LOGIC ==========
  // Apply padding ONLY for:
  // 1. Flight routes
  // 2. NOT special exception routes
  // 3. NOT bus routes
  // 4. NOT hotel routes
  const shouldHavePadding =
    isFlightRoute &&
    !isSpecialNoPaddingFlightRoute &&
    !isBusRoute &&
    !isHotelRoute;
 
  return (
    <div className={`flex-1 ${shouldHavePadding ? "pt-20" : ""}`}>
      {children}
    </div>
  );
};
 
// ============================================
// SERVICE INITIALIZER COMPONENT
// ============================================
const ServiceInitializer = () => {
  const pricingContext = usePricingBooking();
 
  useEffect(() => {
    console.log('🔧 ServiceInitializer - Initializing services with context...');
    console.log('   - pricingContext exists:', !!pricingContext);
    console.log('   - setRawPricingResponse exists:', !!pricingContext?.setRawPricingResponse);
   
    if (pricingContext) {
      if (pricingContext.setRawPricingResponse) {
        initializePricingContext(pricingContext.setRawPricingResponse);
        console.log('✅ Pricing service initialized');
      }
     
      if (pnrCreationService && pnrCreationService.setPricingBookingContext) {
        pnrCreationService.setPricingBookingContext(pricingContext);
        console.log('✅ PNR service initialized');
      } else {
        console.error('❌ pnrCreationService or setPricingBookingContext method not available');
      }
    } else {
      console.error('❌ pricingContext is undefined in ServiceInitializer');
    }
  }, [pricingContext]);
 
  return null;
};
 
// ============================================
// LAYOUT FOR ROUTES WITH BOTH PROVIDERS
// ============================================
const BothProvidersLayout = () => {
  console.log('🏗️ BothProvidersLayout - Both Providers');
  return (
    <PricingBookingProvider>
      <PnrResponseProvider>
        <ServiceInitializer />
        <Outlet />
      </PnrResponseProvider>
    </PricingBookingProvider>
  );
};
 
// ============================================
// MAIN APP COMPONENT
// ============================================
function App() {
  return (
    <GoogleOAuthProvider clientId="429781379228-bigvifjtcvo0toouf2i08fpc3u4k3vnq.apps.googleusercontent.com">
      <FlightMasterProvider>
        <FlightSearchProvider>
          <HotelSearchProvider>
            <Router>
              <div className="min-h-screen bg-gray-100 flex flex-col w-full overflow-x-hidden">
                <Navbar />
               
                {/* MainContent wraps all routes and applies padding conditionally */}
                <MainContent>
                  <Routes>
                    {/* Bus Routes - Home */}
                    <Route path="/" element={<Home />} />
                    <Route path="/HomePage" element={<Home />} />
 
                    {/* Bus Routes - Static Pages */}
                    <Route path="/about" element={<AboutUs />} />
                    <Route path="/contact" element={<ContactUs />} />
                    <Route path="/privacy" element={<PrivacyPolicy />} />
                    <Route path="/terms" element={<TermsAndConditions />} />
                    <Route path="/cancel" element={<CancellationPolicy />} />
                    <Route path="/disclaimer" element={<DisclaimerPolicy />} />
 
                    {/* Bus Routes - Authentication */}
                    <Route path="/signin" element={<SignIn />} />
                    <Route path="/signup" element={<SignupForm />} />
                    <Route path="/verify-otp" element={<VerifyOTP />} />
                    <Route path="/forgot-password" element={<ForgotPassword />} />
                    <Route path="/reset-password" element={<ResetPassword />} />

                    {/* ✅ ADDED: Bill Payment Routes */}
                    <Route path="/BillHomePage" element={<BillHomeScreen />} />
                    <Route path="/bill-details" element={<BillDetails />} />
 
                    {/* Bus Routes - User Account */}
                    <Route path="/my-bookings" element={<MyBookings />} />
                    <Route path="/guest-bookings" element={<GuestBookingsPage />} />
                    <Route path="/cancel-ticket" element={<CancelTicketPage />} />
                    <Route path="/my-account" element={<MyAccount />} />
                    <Route path="/my-profile" element={<MyProfile />} />
                   
                    {/* Bus Routes - Results */}
                    <Route path="/results" element={<BusResultsPage />} />
                    <Route path="/booking-success" element={<BookingSuccess />} />
                    <Route path="/payment-status" element={<PaymentStatus />} />
 
                    {/* Flight Routes - Search (No padding needed for search page) */}
                    <Route path="/flights" element={<SearchPage />} />
                   
                    {/* Flight Routes - These routes WILL have padding (pt-20) */}
                    <Route element={<BothProvidersLayout />}>
                      <Route path="/flights/results" element={<OneWayPage />} />
                      <Route path="/flights/round-trip" element={<RoundTripPage />} />
                      <Route path="/flights/multi-city" element={<MultiCityPage />} />
                      <Route path="/flights/booking/review" element={<BookingReviewPage />} />
                      <Route path="/flights/booking/seat-map" element={<SeatMapPage />} />
                      <Route path="/flights/passenger-review" element={<PassengerDetailsReview />} />
                      <Route path="/flights/ticket-confirmation" element={<TicketConfirmationScreen />} />
                    </Route>
 
                    {/* Flight Routes - Special routes with NO padding (exceptions) */}
                    <Route path="/flights/tracker" element={<FlightTracker />} />
                    <Route path="/flights/pnr-search" element={<PNRSearch />} />
 
                    {/* Hotel Routes - NO padding */}
                    <Route path="/hotels" element={<HotelsHomeScreen />} />
                    <Route path="/hotels/results" element={<HotelSearchResults />} />
 
                    {/* Catch all - 404 redirect */}
                    <Route path="*" element={<Navigate to="/" />} />
                  </Routes>
                </MainContent>
               
                <FooterBottom />
              </div>
            </Router>
          </HotelSearchProvider>
        </FlightSearchProvider>
      </FlightMasterProvider>
    </GoogleOAuthProvider>
  );
}
 
export default App;