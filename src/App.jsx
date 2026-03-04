// App.js
import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { FlightSearchProvider } from "./modules/flights/contexts/FlightSearchContext"; // Added this
import FlightTracker from "./modules/flights/pages/FlightTracker";
import FlightSearchScreen from "./modules/flights/pages/FlightSearchScreen";
import FlightSearchResults from "./modules/flights/pages/FlightSearchResult"; // Added this
import PNRSearch from "./modules/flights/pages/PNRSearch"; // Import PNRSearch component
import { FlightMasterProvider } from "./modules/flights/providers/CarrierCodeProvider";
import Navbar from "./globalfiles/Navbar";
import Home from "./modules/bus/pages/HomePage";
import FooterBottom from "./globalfiles/FooterBottom";
import BusResultsPage from "./modules/bus/pages/BusResultsPage";

// Import Hotel Home Screen
import HotelsHomeScreen from "./modules/hotels/pages/HotelsHomeScreen";

function App() {
  return (
    <FlightMasterProvider>
      {/* Wrap with FlightSearchProvider for flight search functionality */}
      <FlightSearchProvider>
        <Router>
          <div className="min-h-screen bg-gray-100 flex flex-col">
            {/* Navbar at the top */}
            <Navbar />

            {/* Main content area */}
            <div className="flex-1">
              {" "}
              {/* Removed upper padding */}
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/HomePage" element={<Home />} />
                <Route path="/results" element={<BusResultsPage />} />
                <Route path="/flights" element={<FlightSearchScreen />} />
                <Route
                  path="/flights/results"
                  element={<FlightSearchResults />}
                />{" "}
                {/* Added results route */}
                <Route path="/flights/tracker" element={<FlightTracker />} />
                {/* Add PNR Search route */}
                <Route path="/flights/pnr-search" element={<PNRSearch />} />
                {/* Add Hotel route */}
                <Route path="/hotels" element={<HotelsHomeScreen />} />
                {/* Add more routes as needed */}
                <Route path="*" element={<Navigate to="/" />} />
              </Routes>
            </div>
          </div>
          <FooterBottom />
        </Router>
      </FlightSearchProvider>
    </FlightMasterProvider>
  );
}

export default App;