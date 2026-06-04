// App.jsx

import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
  Outlet,
} from "react-router-dom";

// ── Flight providers (search context + master data) ───────────────
import { FlightSearchProvider } from "./modules/flights/contexts/FlightSearchContext";
import { FlightMasterProvider } from "./modules/flights/providers/CarrierCodeProvider";

// ── Flight pages ──────────────────────────────────────────────────
import FlightTracker        from "./modules/flights/pages/FlightTracker";
import SearchPage           from "./modules/flights/pages/FlightSearchScreen";
import OneWayPage           from "./modules/flights/pages/OneWayPage";
import RoundTripPage        from "./modules/flights/pages/RoundTripPage";
import MultiCityPage        from "./modules/flights/pages/MultiCityPage";
import PNRSearch            from "./modules/flights/pages/PNRSearch";
import BookingReviewPage    from "./modules/flights/pages/BookingReviewPage";
import SeatMapPage          from "./modules/flights/pages/SeatMapPage";
import PassengerDetailsReview from "./modules/flights/pages/PassengerDetailsReviewPage";
import TicketConfirmationScreen from "./modules/flights/pages/TicketConfirmationScreen";


import FlightPaymentResult from "./modules/flights/pages/FlightPaymentResult";

// Add this as a standalone route — outside FlightBookingLayout


// ── Hotel ─────────────────────────────────────────────────────────
import HotelsHomeScreen   from "./modules/hotels/pages/HotelsHomeScreen";
import HotelSearchResults from "./modules/hotels/pages/HotelSearchResults";
import { HotelSearchProvider } from "./modules/hotels/context/HotelSearchContext";

// ── Global layout ─────────────────────────────────────────────────
import Navbar       from "./globalfiles/Navbar";
import FooterBottom from "./globalfiles/FooterBottom";

// ── Bus pages ─────────────────────────────────────────────────────
import Home              from "./modules/bus/pages/HomePage";
import BusResultsPage    from "./modules/bus/pages/BusResultsPage";
import BookingSuccess    from "./modules/bus/pages/BookingSuccess";
import PaymentStatus     from "./modules/bus/pages/PaymentStatus";
import SignIn            from "./modules/bus/pages/SignIn";
import SignupForm        from "./modules/bus/pages/SignUpForm";
import VerifyOTP         from "./modules/bus/pages/VerifyOTP";
import ForgotPassword    from "./modules/bus/pages/ForgotPassword";
import ResetPassword     from "./modules/bus/pages/ResetPassword";
import MyBookings        from "./modules/bus/pages/MyBookings";
import GuestBookingsPage from "./modules/bus/pages/GuestBookingPage";
import CancelTicketPage  from "./modules/bus/pages/CancelTicketPage";
import MyAccount         from "./modules/bus/pages/MyAccount";
import MyProfile         from "./modules/bus/pages/MyProfile";
import AboutUs           from "./modules/bus/pages/AboutUs";
import ContactUs         from "./modules/bus/pages/ContactUs";
import PrivacyPolicy     from "./modules/bus/pages/PrivacyPolicy";
import TermsAndConditions from "./modules/bus/pages/TermsAndConditions";
import CancellationPolicy from "./modules/bus/pages/CancellationPolicy";
import DisclaimerPolicy  from "./modules/bus/pages/DisclaimerPolicy";

import { GoogleOAuthProvider } from "@react-oauth/google";

// ─────────────────────────────────────────────────────────────────
// NOTE: PricingBookingContext, PnrResponseContext, pnr_creationService,
// ServiceInitializer, and initializePricingContext have all been removed.
//
// State is now managed by Zustand stores:
//   usePricingStore  → src/modules/flights/store/usePricingStore.js
//   usePnrStore      → src/modules/flights/store/usePnrStore.js
//
// No providers or initializers are needed — stores are available
// globally without wrapping. BookingReviewPage reads/writes these
// stores directly.
// ─────────────────────────────────────────────────────────────────

// ── Padding logic ─────────────────────────────────────────────────
// Flight routes under /flights/* get pt-20 (navbar clearance),
// except for the tracker and pnr-search pages.
const MainContent = ({ children }) => {
  const location = useLocation();
  const pathname = location.pathname;

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

  const isHotelRoute =
    pathname === "/hotels" ||
    pathname.startsWith("/hotels/");

  const isFlightRoute = pathname.startsWith("/flights/");

  const isSpecialNoPaddingFlightRoute =
    pathname === "/flights/tracker" ||
    pathname === "/flights" ||
    pathname === "/flights/pnr-search";

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

// ── Flight booking layout ─────────────────────────────────────────
// Previously wrapped children in PricingBookingProvider +
// PnrResponseProvider + ServiceInitializer.
// Now just an Outlet — Zustand stores need no provider wrapping.
const FlightBookingLayout = () => <Outlet />;

// ── App ───────────────────────────────────────────────────────────
function App() {
  return (
    <GoogleOAuthProvider clientId="429781379228-bigvifjtcvo0toouf2i08fpc3u4k3vnq.apps.googleusercontent.com">
      <FlightMasterProvider>
        <FlightSearchProvider>
          <HotelSearchProvider>
            <Router>
              <div className="min-h-screen bg-gray-100 flex flex-col w-full">
                <Navbar />

                <MainContent>
                  <Routes>

                    {/* ── Bus: Home ─────────────────────────── */}
                    <Route path="/"         element={<Home />} />
                    <Route path="/HomePage" element={<Home />} />

                    {/* ── Bus: Static pages ─────────────────── */}
                    <Route path="/about"      element={<AboutUs />} />
                    <Route path="/contact"    element={<ContactUs />} />
                    <Route path="/privacy"    element={<PrivacyPolicy />} />
                    <Route path="/terms"      element={<TermsAndConditions />} />
                    <Route path="/cancel"     element={<CancellationPolicy />} />
                    <Route path="/disclaimer" element={<DisclaimerPolicy />} />

                    {/* ── Bus: Auth ─────────────────────────── */}
                    <Route path="/signin"           element={<SignIn />} />
                    <Route path="/signup"           element={<SignupForm />} />
                    <Route path="/verify-otp"       element={<VerifyOTP />} />
                    <Route path="/forgot-password"  element={<ForgotPassword />} />
                    <Route path="/reset-password"   element={<ResetPassword />} />

                    {/* ── Bus: Account ──────────────────────── */}
                    <Route path="/my-bookings"    element={<MyBookings />} />
                    <Route path="/guest-bookings" element={<GuestBookingsPage />} />
                    <Route path="/cancel-ticket"  element={<CancelTicketPage />} />
                    <Route path="/my-account"     element={<MyAccount />} />
                    <Route path="/my-profile"     element={<MyProfile />} />

                    {/* ── Bus: Results ──────────────────────── */}
                    <Route path="/results"         element={<BusResultsPage />} />
                    <Route path="/booking-success" element={<BookingSuccess />} />
                    <Route path="/payment-status"  element={<PaymentStatus />} />

                    {/* ── Flights: Search (no padding) ──────── */}
                    <Route path="/flights" element={<SearchPage />} />

                    {/* ── Flights: Booking flow (pt-20 padding applied by MainContent) */}
                    <Route element={<FlightBookingLayout />}>
                      <Route path="/flights/results"              element={<OneWayPage />} />
                      <Route path="/flights/round-trip"           element={<RoundTripPage />} />
                      <Route path="/flights/multi-city"           element={<MultiCityPage />} />
                      <Route path="/flights/booking/review"       element={<BookingReviewPage />} />
                      <Route path="/flights/booking/seat-map"     element={<SeatMapPage />} />
                      <Route path="/flights/passenger-review"     element={<PassengerDetailsReview />} />
                      <Route path="/flights/ticket-confirmation"  element={<TicketConfirmationScreen />} />
                    </Route>

                    {/* ── Flights: Special pages (no padding) ── */}
                    <Route path="/flights/tracker"    element={<FlightTracker />} />
                    <Route path="/flights/pnr-search" element={<PNRSearch />} />

                    {/* ── Hotels ────────────────────────────── */}
                    <Route path="/hotels"         element={<HotelsHomeScreen />} />
                    <Route path="/hotels/results" element={<HotelSearchResults />} />

                    <Route path="/flight-payment-result" element={<FlightPaymentResult />} />

                    {/* ── 404 ───────────────────────────────── */}
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