import { Link } from "react-router-dom";

export default function Quick_Links() {
  return (
    <div className="max-w-full bg-white flex items-center justify-center p-2 mt-10">
      <div className="w-full bg-white px-10 py-8 mb-10">

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">

          {/* Column 1: OUR PRODUCTS */}
          <div>
            <h3 className="font-bold text-black mb-4 tracking-wide text-sm">
              OUR PRODUCTS
            </h3>
            <ul className="space-y-2">
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
                  <a href="#" className="text-gray-700 text-sm hover:text-orange-500">
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 2: ABOUT US */}
          <div>
            <h3 className="font-bold text-black mb-4 tracking-wide text-sm">
              ABOUT US
            </h3>
            <ul className="space-y-2">

              <li>
                <Link to="/about" className="text-gray-700 text-sm hover:text-orange-500">
                  About Us
                </Link>
              </li>

              <li>
                <Link to="/contact" className="text-gray-700 text-sm hover:text-orange-500">
                  Contact Us
                </Link>
              </li>

              <li>
                <a href="/terms" className="text-gray-700 text-sm hover:text-orange-500">
                  Terms of service
                </a>
              </li>

              <li>
                <a href="/privacy" className="text-gray-700 text-sm hover:text-orange-500">
                  Privacy Policy
                </a>
              </li>
              <li>
                <Link
                  to="/cancel"  className="text-gray-700 text-sm hover:text-orange-500">
                      Cancellation & Refund Policy
                </Link>
              </li>
              <li>
                <Link
                  to="/disclaimer"  className="text-gray-700 text-sm hover:text-orange-500">
                      Disclaimer Policy
                </Link>
              </li>


              

            </ul>
          </div>

          {/* Column 3: TRAVEL ESSENTIALS */}
          <div>
            <h3 className="font-bold text-black mb-4 tracking-wide text-sm">
              TRAVEL ESSENTIALS
            </h3>
            <ul className="space-y-2">
              {["PNR Status", "Offers", "Airline Routes"].map((item) => (
                <li key={item}>
                  <a href="#" className="text-gray-700 text-sm hover:text-orange-500">
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 4: MORE LINKS */}
          <div>
            <h3 className="font-bold text-black mb-4 tracking-wide text-sm">
              MORE LINKS
            </h3>
            <ul className="space-y-2">
              {[
                "Cheap flights",
                "Hotels near me",
                "My Bookings",
                "Cancellation",
                "My Account",
              ].map((item) => (
                <li key={item}>
                  <a href="#" className="text-gray-700 text-sm hover:text-orange-500">
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