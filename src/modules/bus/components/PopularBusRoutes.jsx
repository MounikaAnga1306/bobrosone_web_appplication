import { Bus } from "lucide-react";
import { useNavigate } from "react-router-dom";

const API = import.meta.env.VITE_API_BASE_URL;

// ✅ Routes data same
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
  const navigate = useNavigate();

  // 🔥 Cache (avoid multiple API calls)
  const cityCache = {};

  // ✅ Get city ID from API
  const getCityId = async (cityName) => {
    try {
      // 🔁 check cache first
      if (cityCache[cityName]) {
        return cityCache[cityName];
      }

      const res = await fetch(
        `${API}/cities?name=${encodeURIComponent(cityName)}`
      );

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }

      const data = await res.json();

      // API response: [{ sid, cityname, state }]
      if (!Array.isArray(data) || data.length === 0) {
        return null;
      }

      // ✅ exact match
      const match = data.find(
        (c) => c.cityname.toLowerCase() === cityName.toLowerCase()
      );

      const id = match?.sid || data[0]?.sid;

      // 🔥 store in cache
      cityCache[cityName] = id;

      return id;
    } catch (err) {
      console.error("City fetch error:", err);
      return null;
    }
  };

  // ✅ Tomorrow date
  const getTomorrowDate = () => {
    const today = new Date();
    today.setDate(today.getDate() + 1);
    return today.toISOString().split("T")[0];
  };

  // 🔥 MODIFIED: Full page refresh navigation
  const handleRouteClick = async (fromCity, toCity) => {
    try {
      // ✅ Fetch both IDs
      const [sourceId, destinationId] = await Promise.all([
        getCityId(fromCity),
        getCityId(toCity),
      ]);

      if (!sourceId || !destinationId) {
        console.error("City ID not found", fromCity, toCity);
        return;
      }

      const date = getTomorrowDate();
      
      // Build the full URL with parameters
      const url = `/results?source=${sourceId}&destination=${destinationId}&doj=${date}&fromName=${encodeURIComponent(fromCity)}&toName=${encodeURIComponent(toCity)}`;
      
      // ✅ Perform a full page reload (refresh) to the new URL
      window.location.href = url;
      
      // Note: The state (sourceName, destinationName) can be passed via URL params or sessionStorage if needed.
      // Since window.location.href doesn't support React Router state, you can optionally store names in sessionStorage:
      sessionStorage.setItem("sourceName", fromCity);
      sessionStorage.setItem("destinationName", toCity);
      
      // Scroll to top is automatic on page reload.
    } catch (err) {
      console.error("Navigation error:", err);
    }
  };

  return (
    <div className="w-full max-w-[82%] mx-auto -mt-8">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">
        Popular Bus Routes
      </h2>

      <div className="bg-white rounded-xl shadow-sm p-4">
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
                    <button
                      key={i}
                      type="button"
                      onClick={() => handleRouteClick(route.city, place)}
                      className="text-[#fd561e] hover:underline cursor-pointer"
                    >
                      {place}
                      {i !== route.to.length - 1 && ", "}
                    </button>
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