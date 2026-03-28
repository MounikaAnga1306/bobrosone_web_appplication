// App.js
import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { FlightSearchProvider } from "./modules/flights/contexts/FlightSearchContext";
import FlightTracker from "./modules/flights/pages/FlightTracker";
import SearchPage from "./modules/flights/pages/FlightSearchScreen"; // renamed from FlightSearchScreen
import OneWayPage from "./modules/flights/pages/OneWayPage"; // renamed from FlightSearchResult
import RoundTripPage from "./modules/flights/pages/RoundTripPage"; // renamed from RoundTripSelection
import MultiCityPage from "./modules/flights/pages/MultiCityPage"; // renamed from MultiCitySelection
import PNRSearch from "./modules/flights/pages/PNRSearch";
import { FlightMasterProvider } from "./modules/flights/providers/CarrierCodeProvider";


// Add this import with your other flight imports
import BookingReviewPage from "./modules/flights/pages/BookingReviewPage";

// Import Hotel components
import HotelsHomeScreen from "./modules/hotels/pages/HotelsHomeScreen";
import HotelSearchResults from "./modules/hotels/pages/HotelSearchResults";
import { HotelSearchProvider } from "./modules/hotels/context/HotelSearchContext";
import HotelDetails from './modules/hotels/pages/HotelDetails';

import Navbar from "./globalfiles/Navbar";
import Home from "./modules/bus/pages/HomePage";
import FooterBottom from "./globalfiles/FooterBottom";
import BusResultsPage from "./modules/bus/pages/BusResultsPage";
import BillHome from "./modules/Bill Payments/pages/BillHomeScreen";
import BookingSuccess from "./modules/bus/pages/BookingSuccess";
import PaymentStatus from "./modules/bus/pages/PaymentStatus";
import SignIn from "./modules/bus/pages/SignIn";
import SignupForm from "./modules/bus/pages/SignUpForm";
import VerifyOTP from "./modules/bus/pages/VerifyOTP";
import ForgotPassword from "./modules/bus/pages/ForgotPassword";
import ResetPassword from "./modules/bus/pages/ResetPassword";
import { GoogleOAuthProvider } from "@react-oauth/google";
//import ReviewBooking from "./modules/bus/pages/ReviewBooking";
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

function App() {
  return (
     <GoogleOAuthProvider clientId="429781379228-bigvifjtcvo0toouf2i08fpc3u4k3vnq.apps.googleusercontent.com">
    <FlightMasterProvider>
      <FlightSearchProvider>
        <HotelSearchProvider> {/* ADD THIS WRAPPER */}
          <Router>
            <div className="min-h-screen bg-gray-100 flex flex-col">
              <Navbar />
              <div className="flex-1">
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/HomePage" element={<Home />} />
                  <Route path="/about" element={<AboutUs />} />
                  <Route path="/contact" element={<ContactUs />} />
                  <Route path="/privacy" element={<PrivacyPolicy />} />
                  <Route path="/terms" element={<TermsAndConditions />} />
                  <Route path="/cancel" element={<CancellationPolicy />} />
                  <Route path="/disclaimer" element={<DisclaimerPolicy />} />
                  <Route path="/signin" element={<SignIn />} />
                  <Route path="/signup" element={<SignupForm />} />
                  <Route path="/verify-otp" element={<VerifyOTP />} />
                  <Route path="/forgot-password" element={<ForgotPassword />} />
                  <Route path="/reset-password" element={<ResetPassword />} />
                  {/* <Route path="/review-booking" element={<ReviewBooking />} /> */}
                  <Route path="/my-bookings" element={<MyBookings />} />
                  <Route path="/guest-bookings" element={<GuestBookingsPage />} />
                  <Route path="/cancel-ticket" element={<CancelTicketPage />} />
                  <Route path="/my-account" element={<MyAccount />} />
                  <Route path="/my-profile" element={<MyProfile />} />
                  <Route path="/results" element={<BusResultsPage />} />
                  
                  {/* Flight Routes - UPDATED with new names */}
                  <Route path="/flights" element={<SearchPage />} />
                  <Route path="/flights/results" element={<OneWayPage />} />
                  <Route path="/flights/round-trip" element={<RoundTripPage />} />
                  <Route path="/flights/multi-city" element={<MultiCityPage />} />
                  <Route path="/flights/tracker" element={<FlightTracker />} />
                  <Route path="/flights/pnr-search" element={<PNRSearch />} />

                  <Route path="/flights/booking/review" element={<BookingReviewPage />} />
                  
                  {/* Hotel Routes */}
                  <Route path="/hotels" element={<HotelsHomeScreen />} />
                  <Route path="/hotels/results" element={<HotelSearchResults />} />
                   <Route path="/booking-success" element={<BookingSuccess />} />
                   <Route path="/payment-status" element={<PaymentStatus />} />
                  <Route path="*" element={<Navigate to="/" />} />
                </Routes>
              </div>
            </div>
            <FooterBottom />
          </Router>
        </HotelSearchProvider> {/* ADD THIS CLOSING TAG */}
      </FlightSearchProvider>
    </FlightMasterProvider>
    </GoogleOAuthProvider>
  );
}

export default App;