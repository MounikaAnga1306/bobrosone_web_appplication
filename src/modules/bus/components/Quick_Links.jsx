import { Link } from "react-router-dom";

export default function Quick_Links() {
  return (
    <div className="max-w-full bg-white flex items-center justify-center p-2  mt-10">
      <div className="w-full bg-white px-4 sm:px-6 md:px-8  lg:px-10 py-6 sm:py-8 mb-6 sm:mb-8 lg:mb-10">
        
        {/* Grid: Mobile 2 columns, Tablet 2 columns, Desktop 4 columns */}
        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8  md:gap-6   lg:gap-8 ml-10 sm:ml-12 md:ml-28 lg:ml-20">
          
          {/* Column 1: OUR PRODUCTS */}
          <div>
            <h3 className="font-bold text-black mb-3 sm:mb-4 tracking-wide text-xs sm:text-sm">
              OUR PRODUCTS
            </h3>
            <ul className="space-y-1.5 sm:space-y-2">
              {[
                "Domestic Hotels",
                "International Hotels",
                "Domestic Flights",
                "International Flights",
                "Multi-city Flights",
                "Couple friendly Hotels",
                "Bus Booking",
                "Cab Booking",
              ].map((item) => (
                <li key={item}>
                  <a href="#" className="text-gray-700 text-xs sm:text-sm hover:text-orange-500 hover:underline transition-colors duration-200">
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 2: ABOUT US */}
          <div>
            <h3 className="font-bold text-black mb-3 sm:mb-4 tracking-wide text-xs sm:text-sm">
              ABOUT US
            </h3>
            <ul className="space-y-1.5 sm:space-y-2">
              <li>
                <Link to="/about" className="text-gray-700 text-xs sm:text-sm hover:text-orange-500  hover:underline transition-colors duration-200">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-gray-700 text-xs sm:text-sm hover:text-orange-500 hover:underline transition-colors duration-200">
                  Contact Us
                </Link>
              </li>
              <li>
                <a href="/terms" className="text-gray-700 text-xs sm:text-sm hover:text-orange-500 hover:underline transition-colors duration-200">
                  Terms of service
                </a>
              </li>
              <li>
                <a href="/privacy" className="text-gray-700 text-xs sm:text-sm hover:text-orange-500  hover:underline transition-colors duration-200">
                  Privacy Policy
                </a>
              </li>
              <li>
                <Link to="/cancel" className="text-gray-700 text-xs sm:text-sm hover:text-orange-500 hover:underline transition-colors duration-200">
                  Cancellation & Refund Policy
                </Link>
              </li>
              <li>
                <Link to="/disclaimer" className="text-gray-700 text-xs sm:text-sm hover:text-orange-500 hover:underline transition-colors duration-200">
                  Disclaimer Policy
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: TRAVEL ESSENTIALS */}
          <div>
            <h3 className="font-bold text-black mb-3 sm:mb-4 tracking-wide text-xs sm:text-sm">
              TRAVEL ESSENTIALS
            </h3>
            <ul className="space-y-1.5 sm:space-y-2">
              {["PNR Status", "Offers", "Airline Routes"].map((item) => (
                <li key={item}>
                  <a href="#" className="text-gray-700 text-xs sm:text-sm hover:text-orange-500 hover:underline transition-colors duration-200">
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 4: MORE LINKS */}
          <div>
            <h3 className="font-bold text-black mb-3  sm:mb-4 tracking-wide text-xs sm:text-sm">
              MORE LINKS
            </h3>
            <ul className="space-y-1.5 sm:space-y-2">
              {[
                "Cheap flights",
                "Hotels near me",
                "My Bookings",
                "Cancellation",
                "My Account",
              ].map((item) => (
                <li key={item}>
                  <a href="#" className="text-gray-700 text-xs sm:text-sm hover:text-orange-500 hover:underline transition-colors duration-200">
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

        </div>
        
       
        
      </div>
    </div>
  );
}