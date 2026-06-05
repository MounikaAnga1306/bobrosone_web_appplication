import { Link, useNavigate, useLocation } from "react-router-dom";

export default function Quick_Links() {
  const navigate = useNavigate();
  const location = useLocation();

  const isLoggedIn = () => localStorage.getItem("isLoggedIn") === "true";

  const scrollTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

  // ── My Bookings ───────────────────────────────────────────────────────────
  const handleMyBookings = (e) => {
    e.preventDefault();
    if (isLoggedIn()) {
      scrollTop();
      navigate("/my-bookings");
    } else {
      // Navbar లో Guest Bookings popup open చేస్తుంది
      window.dispatchEvent(new CustomEvent("openGuestBookings"));
    }
  };

  // ── Cancellation ──────────────────────────────────────────────────────────
  const handleCancellation = (e) => {
    e.preventDefault();
    // Login అయినా కాకపోయినా — Cancellation popup same గా వస్తుంది
    window.dispatchEvent(new CustomEvent("openCancellation"));
  };

  // ── Print Ticket ──────────────────────────────────────────────────────────
  const handlePrintTicket = (e) => {
    e.preventDefault();
    // Flight page లో ఉంటే flight print, లేకపోతే bus print
    if (location.pathname.startsWith("/flights")) {
      window.dispatchEvent(new CustomEvent("openFlightPrintTicket"));
    } else {
      window.dispatchEvent(new CustomEvent("openPrintTicket"));
    }
  };

  return (
    <div className="max-w-full bg-white flex items-center justify-center p-2 mt-10">
      <div className="w-full bg-white px-4 sm:px-6 md:px-8 lg:px-10 py-6 sm:py-8 mb-6 sm:mb-8 lg:mb-10">
        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 md:gap-6 lg:gap-8 ml-10 sm:ml-12 md:ml-28 lg:ml-20">

          {/* Column 1: OUR PRODUCTS */}
          <div>
            <h3 className="font-bold text-black mb-3 sm:mb-4 tracking-wide text-xs sm:text-sm">OUR PRODUCTS</h3>
            <ul className="space-y-1.5 sm:space-y-2">
              <li><Link to="/HomePage" onClick={scrollTop} className="text-gray-700 text-xs sm:text-sm hover:text-orange-500 hover:underline transition-colors duration-200">Bus Booking</Link></li>
              <li><Link to="/hotels" onClick={scrollTop} className="text-gray-700 text-xs sm:text-sm hover:text-orange-500 hover:underline transition-colors duration-200">Domestic Hotels</Link></li>
              <li><Link to="/hotels" onClick={scrollTop} className="text-gray-700 text-xs sm:text-sm hover:text-orange-500 hover:underline transition-colors duration-200">International Hotels</Link></li>
              <li><Link to="/flights" onClick={scrollTop} className="text-gray-700 text-xs sm:text-sm hover:text-orange-500 hover:underline transition-colors duration-200">Domestic Flights</Link></li>
              <li><Link to="/flights" onClick={scrollTop} className="text-gray-700 text-xs sm:text-sm hover:text-orange-500 hover:underline transition-colors duration-200">International Flights</Link></li>
              <li><Link to="/flights" onClick={scrollTop} className="text-gray-700 text-xs sm:text-sm hover:text-orange-500 hover:underline transition-colors duration-200">Multi-city Flights</Link></li>
              <li><Link to="/Holiday" onClick={scrollTop} className="text-gray-700 text-xs sm:text-sm hover:text-orange-500 hover:underline transition-colors duration-200">Travel Packages</Link></li>
              <li><Link to="/HomePage" onClick={scrollTop} className="text-gray-700 text-xs sm:text-sm hover:text-orange-500 hover:underline transition-colors duration-200">Cab Booking</Link></li>
            </ul>
          </div>

          {/* Column 2: ABOUT US */}
          <div>
            <h3 className="font-bold text-black mb-3 sm:mb-4 tracking-wide text-xs sm:text-sm">ABOUT US</h3>
            <ul className="space-y-1.5 sm:space-y-2">
              <li><Link to="/about" onClick={scrollTop} className="text-gray-700 text-xs sm:text-sm hover:text-orange-500 hover:underline transition-colors duration-200">About Us</Link></li>
              <li><Link to="/contact" onClick={scrollTop} className="text-gray-700 text-xs sm:text-sm hover:text-orange-500 hover:underline transition-colors duration-200">Contact Us</Link></li>
              <li><Link to="/terms" onClick={scrollTop} className="text-gray-700 text-xs sm:text-sm hover:text-orange-500 hover:underline transition-colors duration-200">Terms of service</Link></li>
              <li><Link to="/privacy" onClick={scrollTop} className="text-gray-700 text-xs sm:text-sm hover:text-orange-500 hover:underline transition-colors duration-200">Privacy Policy</Link></li>
              <li><Link to="/cancel" onClick={scrollTop} className="text-gray-700 text-xs sm:text-sm hover:text-orange-500 hover:underline transition-colors duration-200">Cancellation &amp; Refund Policy</Link></li>
              <li><Link to="/disclaimer" onClick={scrollTop} className="text-gray-700 text-xs sm:text-sm hover:text-orange-500 hover:underline transition-colors duration-200">Disclaimer Policy</Link></li>
            </ul>
          </div>

          {/* Column 3: TRAVEL ESSENTIALS */}
          <div>
            <h3 className="font-bold text-black mb-3 sm:mb-4 tracking-wide text-xs sm:text-sm">TRAVEL ESSENTIALS</h3>
            <ul className="space-y-1.5 sm:space-y-2">
              <li><Link to="/flights/pnr-search" onClick={scrollTop} className="text-gray-700 text-xs sm:text-sm hover:text-orange-500 hover:underline transition-colors duration-200">PNR Status</Link></li>
              <li><Link to="#" className="text-gray-700 text-xs sm:text-sm hover:text-orange-500 hover:underline transition-colors duration-200">Offers</Link></li>
              <li><Link to="/flights" onClick={scrollTop} className="text-gray-700 text-xs sm:text-sm hover:text-orange-500 hover:underline transition-colors duration-200">Airline Routes</Link></li>
            </ul>
          </div>

          {/* Column 4: MORE LINKS */}
          <div>
            <h3 className="font-bold text-black mb-3 sm:mb-4 tracking-wide text-xs sm:text-sm">MORE LINKS</h3>
            <ul className="space-y-1.5 sm:space-y-2">
              <li><Link to="/flights" onClick={scrollTop} className="text-gray-700 text-xs sm:text-sm hover:text-orange-500 hover:underline transition-colors duration-200">Cheap flights</Link></li>
              <li><Link to="/hotels" onClick={scrollTop} className="text-gray-700 text-xs sm:text-sm hover:text-orange-500 hover:underline transition-colors duration-200">Hotels near me</Link></li>
              <li><a href="#" onClick={handleMyBookings} className="text-gray-700 text-xs sm:text-sm hover:text-orange-500 hover:underline transition-colors duration-200">My Bookings</a></li>
              <li><a href="#" onClick={handleCancellation} className="text-gray-700 text-xs sm:text-sm hover:text-orange-500 hover:underline transition-colors duration-200">Cancellation</a></li>
              <li><a href="#" onClick={handlePrintTicket} className="text-gray-700 text-xs sm:text-sm hover:text-orange-500 hover:underline transition-colors duration-200">Print Ticket</a></li>
            </ul>
          </div>

        </div>
      </div>
    </div>
  );
}