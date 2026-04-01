// src/modules/hotels/pages/HotelsHomeScreen.jsx
import React from "react";
import HotelHeroSection from "../components/HotelHeroSection";
// Import from bus components (these exist)
import Services from "../../bus/components/OurServices";
import WhyBobros from "../../bus/components/WhyBobros";
import AppDownload from "../../bus/components/AppDownload";
import Quick_Links from "../../bus/components/Quick_Links";
import Advertisement from "../../bus/components/Advertisement";

const HotelsHomeScreen = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-grow">
        {/* Hotel Hero Section - FULL WIDTH */}
        <HotelHeroSection />

        {/* Content Sections with consistent spacing */}
        <div className="mt-16 md:mt-20 lg:mt-24">
          {/* Advertisement */}
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <Advertisement />
          </div>

          {/* Services */}
          <Services />

          {/* App Download */}
          <AppDownload />

          {/* Why Bobros */}
          <WhyBobros />

          {/* Quick Links */}
          <Quick_Links />
        </div>
      </main>
    </div>
  );
};

export default HotelsHomeScreen;