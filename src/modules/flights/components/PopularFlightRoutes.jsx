export default function PopularFlightRoutes() {
  const routes = [
    "Delhi Flights",
    "Goa Flights",
    "Pune Flights",
    "Ahmedabad Flights",
    "Mumbai Flights",
    "Jaipur Flights",
    "Hyderabad Flights",
    "Patna Flights",
    "Bangalore Flights",
    "Kolkata Flights",
    "Chennai Flights",
    "Lucknow Flights",
  ];

  return (
    <div className="w-full bg-gray-100 py-10 px-6 md:px-12 rounded-2xl">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-2xl font-semibold mb-8">Popular Flight Routes</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-y-6 gap-x-12">
          {routes.map((route, index) => (
            <div key={index} className="flex items-start gap-3">
              {/* Font Awesome icon */}
              <div className="flex flex-col items-center mt-2">
                <i className="fa-solid fa-plane-departure text-black text-lg"></i>
              </div>

              {/* text */}
              <div className="leading-tight">
                <p className="font-semibold text-gray-800">{route}</p>
                <p className="text-gray-600">
                  From:
                  <span className="text-orange-500 font-medium">
                    Mumbai, Pune
                  </span>
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
