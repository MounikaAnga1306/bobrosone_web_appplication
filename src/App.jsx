// App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { FlightSearchProvider } from "./modules/flights/contexts/FlightSearchContext"; // Added this
import FlightTracker from "./modules/flights/pages/FlightTracker";
import FlightSearchScreen from "./modules/flights/pages/FlightSearchScreen";
import FlightSearchResults from "./modules/flights/pages/FlightSearchResult"; // Added this
import { FlightMasterProvider } from "./modules/flights/providers/CarrierCodeProvider";
import Navbar from "./globalfiles/Navbar";
import Home from "./modules/bus/pages/HomePage";

function App() {
  return (
    <FlightMasterProvider>
      {/* Wrap with FlightSearchProvider for flight search functionality */}
      <FlightSearchProvider>
        <Router>
          <div className="min-h-screen flex flex-col">
            {/* Navbar at the top */}
            <Navbar />
            
            {/* Main content area */}
            <div className="flex-1"> {/* Removed upper padding */}
              <Routes>
                <Route path="/" element={<Home />} />
 
                <Route path="/flights/search" element={<FlightSearchScreen />} />
                <Route path="/flights/results" element={<FlightSearchResults />} /> {/* Added results route */}
                <Route path="/flights/tracker" element={<FlightTracker />} />
                {/* Add more routes as needed */}
                <Route path="*" element={<Navigate to="/flights/search" />} />
              </Routes>
            </div>
          </div>
        </Router>
      </FlightSearchProvider>
    </FlightMasterProvider>
  );
}


export default App;