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
import RazorpayDetails from "./modules/bus/pages/RazorpayDetails";
import BillDeskDetails from "./modules/bus/pages/BillDeskDetails";
import PaymentStatus from "./modules/bus/pages/PaymentStatus";

function App() {
  return (
    <Router>
      <FlightMasterProvider>
        <FlightSearchProvider>
          <HotelSearchProvider>
            <div className="min-h-screen bg-gray-100 flex flex-col">
              <Navbar />
              <div className="flex-1">
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/HomePage" element={<Home />} />
                  <Route path="/results" element={<BusResultsPage />} />
                  
                  {/* Flight Routes - UPDATED with new names */}
                  <Route path="/flights" element={<SearchPage />} />
                  <Route path="/flights/results" element={<OneWayPage />} />
                  <Route path="/flights/round-trip" element={<RoundTripPage />} />
                  <Route path="/flights/multi-city" element={<MultiCityPage />} />
                  <Route path="/flights/tracker" element={<FlightTracker />} />
                  <Route path="/flights/pnr-search" element={<PNRSearch />} />
                  
                  {/* Hotel Routes */}
                  <Route path="/hotels" element={<HotelsHomeScreen />} />
                  <Route path="/hotels/results" element={<HotelSearchResults />} />
                  <Route path="/hotels/details/:hotelId" element={<HotelDetails />} />
                  
                  {/* Bus Routes */}
                  <Route path="/booking-success" element={<BookingSuccess />} />
                  <Route path="/razorpay-details" element={<RazorpayDetails />} />
                  <Route path="/billdesk-details" element={<BillDeskDetails />} />
                  <Route path="/payment-status" element={<PaymentStatus />} />
                  
                  {/* Fallback Route */}
                  <Route path="*" element={<Navigate to="/" />} />
                </Routes>
              </div>
            </div>
            <FooterBottom />
          </HotelSearchProvider>
        </FlightSearchProvider>
      </FlightMasterProvider>
    </Router>
  );
}

export default App;