export default function Quick_Links() {
  return (
    <div className=" max-w-full  bg-white flex items-center justify-center p-4">
      <div className="w-full  border bg-[#fe561e] border-gray-200 bg-white px-10 py-8 ">
        <div className="grid grid-cols-4 gap-8">
          {/* Column 1: OUR PRODUCTS */}
          <div>
            <h3 className="font-bold ml-52 text-black mb-4 tracking-wide text-sm">
              OUR PRODUCTS
            </h3>
            <ul className="space-y-2 ml-52">
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
                  <a href="#" className="text-gray-700 text-sm hover:underline">
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 2: ABOUT US */}
          <div>
            <h3 className="font-bold ml-30 text-black mb-4 tracking-wide text-sm">
              ABOUT US
            </h3>
            <ul className="space-y-2 ml-30">
              {[
                "About Us",
                "Contact Us",
                "Terms of service",
                "Privacy",
                "Careers",
              ].map((item) => (
                <li key={item}>
                  <a href="#" className="text-gray-700 text-sm hover:underline">
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: TRAVEL ESSENTIALS */}
          <div>
            <h3 className="font-bold  ml-10 text-black mb-4 tracking-wide text-sm">
              TRAVEL ESSENTIALS
            </h3>
            <ul className="space-y-2 ml-10 ">
              {["PNR Status", "Offers", "Airline Routes"].map((item) => (
                <li key={item}>
                  <a href="#" className="text-gray-700 text-sm hover:underline">
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
                  <a href="#" className="text-gray-700 text-sm hover:underline">
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
