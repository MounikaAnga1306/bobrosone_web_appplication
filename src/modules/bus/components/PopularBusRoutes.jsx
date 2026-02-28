import { Bus } from "lucide-react";

const routes = [
  {
    city: "Delhi",
    to: ["Manali", "Chandigarh", "Jaipur", "Dehradun"],
  },
  {
    city: "Mumbai",
    to: ["Goa", "Pune", "Bangalore", "Shirdi"],
  },
  {
    city: "Chennai",
    to: ["Coimbatore", "Pondicherry", "Bangalore", "Hyderabad"],
  },
  {
    city: "Bangalore",
    to: ["Mumbai", "Hyderabad", "Chennai", "Goa"],
  },
  {
    city: "Hyderabad",
    to: ["Mumbai", "Chennai", "Bangalore", "Goa"],
  },
  {
    city: "Pune",
    to: ["Mumbai", "Shirdi", "Bangalore", "Goa"],
  },
  {
    city: "Kolkata",
    to: ["Digha", "Siliguri", "Durgapur", "Asansol"],
  },
  {
    city: "Chandigarh",
    to: ["Manali", "Delhi", "Shimla", "Dehradun"],
  },
  {
    city: "Coimbatore",
    to: ["Chennai", "Ooty", "Bangalore", "Mysore"],
  },
];

export default function PopularBusRoutes() {
  return (
    <div className="w-full max-w-[82%] mx-auto -mt-8">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">
        Popular Bus Routes
      </h2>

      <div className="bg-white rounded-xl shadow-sm  p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-y-6 gap-x-8">
          {routes.map((route, index) => (
            <div key={index} className="flex gap-3">
              {/* Icon */}
              <Bus className="w-5 h-5 mt-1 text-gray-500" />

              {/* Text */}
              <div>
                <h3 className="font-bold text-lg text-gray-900">
                  {route.city} Buses
                </h3>

                <p className="text-gray-600 text-sm mt-1">
                  To:{" "}
                  {route.to.map((place, i) => (
                    <span
                      key={i}
                      className="text-blue-600 hover:underline cursor-pointer"
                    >
                      {place}
                      {i !== route.to.length - 1 && ", "}
                    </span>
                  ))}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
