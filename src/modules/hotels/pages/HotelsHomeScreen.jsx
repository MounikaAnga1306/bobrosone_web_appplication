// src/modules/hotels/pages/HotelsHomeScreen.jsx
import React from "react";
import HotelHeroSection from "../components/HotelHeroSection";
import DoMoreWithBobros from "../../flights/components/DoMoreWithBobros"; // Reuse the same component
// import PopularHotelDestinations from "../components/PopularHotelDestinations"; // Comment this out

import Quick_Links from "../../flights/components/Quick_Links"; // Reuse Quick Links

const HotelsHomeScreen = () => {
  return (
    <div className="w-full bg-gray-50">
      {/* Hero Section with Search Form */}
      <HotelHeroSection />

      {/* Additional Content Section */}
      <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8 mt-8">
        {/* Do More With BOBROS - Reuse from flights */}
        <DoMoreWithBobros />

        {/* Popular Hotel Destinations - Temporarily disabled */}
        {/* <PopularHotelDestinations /> */}

        {/* Quick Links - Reuse from flights */}
        <Quick_Links />

        {/* Hotel FAQ Section */}
        
      </div>
    </div>
  );
};

export default HotelsHomeScreen;