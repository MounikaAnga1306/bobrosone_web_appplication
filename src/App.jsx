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
import FlightSearchScreen from "./modules/flights/pages/FlightSearchScreen";
import FlightSearchResults from "./modules/flights/pages/FlightSearchResult";
import PNRSearch from "./modules/flights/pages/PNRSearch";
import { FlightMasterProvider } from "./modules/flights/providers/CarrierCodeProvider";

// Import Hotel components
import HotelsHomeScreen from "./modules/hotels/pages/HotelsHomeScreen";
import HotelSearchResults from "./modules/hotels/pages/HotelSearchResults";
import { HotelSearchProvider } from "./modules/hotels/context/HotelSearchContext"; // ADD THIS

import Navbar from "./globalfiles/Navbar";
import Home from "./modules/bus/pages/HomePage";
import FooterBottom from "./globalfiles/FooterBottom";
import BusResultsPage from "./modules/bus/pages/BusResultsPage";

function App() {
  return (
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
                  <Route path="/results" element={<BusResultsPage />} />
                  <Route path="/flights" element={<FlightSearchScreen />} />
                  <Route path="/flights/results" element={<FlightSearchResults />} />
                  <Route path="/flights/tracker" element={<FlightTracker />} />
                  <Route path="/flights/pnr-search" element={<PNRSearch />} />
                  <Route path="/hotels" element={<HotelsHomeScreen />} />
                  <Route path="/hotels/results" element={<HotelSearchResults />} />
                  <Route path="*" element={<Navigate to="/" />} />
                </Routes>
              </div>
            </div>
            <FooterBottom />
          </Router>
        </HotelSearchProvider> {/* ADD THIS CLOSING TAG */}
      </FlightSearchProvider>
    </FlightMasterProvider>
  );
}

export default App;