import { useState } from "react";
import { Bus } from "lucide-react";
import { useNavigate } from "react-router-dom";

const API = import.meta.env.VITE_API_BASE_URL;

// ✅ Existing routes same — kindha kotha cities (Indore, Ahmedabad, Goa) add chesa (reference image nundi)
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
  // 🆕 View More click chesthe ivi kanipisthayi (4th row)
  {
    city: "Indore",
    to: ["Mumbai", "Pune", "Ahmedabad", "Nagpur"],
  },
  {
    city: "Ahmedabad",
    to: ["Porbandar", "Jamnagar", "Udaipur", "Rajkot"],
  },
  {
    city: "Goa",
    to: ["Hyderabad", "Bangalore", "Pune", "Mumbai"],
  },
];

// 🖼️ PLACEHOLDER images (picsum) — temporary photos, reference design laga kanipinchadaniki
// Nuvvu generate chesina images ni public/images/cities/ lo pettesi
// paths ni "/images/cities/delhi.jpg" laga replace cheskovachu
const cityImages = {
  Delhi: "https://picsum.photos/seed/delhi-indiagate/200/200",
  Mumbai: "https://picsum.photos/seed/mumbai-gateway/200/200",
  Chennai: "https://picsum.photos/seed/chennai-temple/200/200",
  Bangalore: "https://picsum.photos/seed/bangalore-vidhana/200/200",
  Hyderabad: "https://picsum.photos/seed/hyderabad-charminar/200/200",
  Pune: "https://picsum.photos/seed/pune-shaniwar/200/200",
  Kolkata: "https://picsum.photos/seed/kolkata-victoria/200/200",
  Chandigarh: "https://picsum.photos/seed/chandigarh-rock/200/200",
  Coimbatore: "https://picsum.photos/seed/coimbatore-adiyogi/200/200",
  Indore: "https://picsum.photos/seed/indore-rajwada/200/200",
  Ahmedabad: "https://picsum.photos/seed/ahmedabad-mosque/200/200",
  Goa: "https://picsum.photos/seed/goa-beach/200/200",
};

// First 3 rows (lg lo 3 columns × 3 rows = 9 cities)
const INITIAL_VISIBLE = 9;

export default function PopularBusRoutes() {
  const navigate = useNavigate();

  const [showAll, setShowAll] = useState(false);

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

  // 🔥 Full page refresh navigation
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
      const url = `/results?source=${sourceId}&destination=${destinationId}&doj=${date}&fromName=${encodeURIComponent(
        fromCity
      )}&toName=${encodeURIComponent(toCity)}`;

      // Store names in sessionStorage (window.location.href doesn't support router state)
      sessionStorage.setItem("sourceName", fromCity);
      sessionStorage.setItem("destinationName", toCity);

      // ✅ Perform a full page reload (refresh) to the new URL
      window.location.href = url;
    } catch (err) {
      console.error("Navigation error:", err);
    }
  };

  const visibleRoutes = showAll ? routes : routes.slice(0, INITIAL_VISIBLE);

  return (
    <div className="w-full max-w-[84%] mx-auto -mt-8">
      <div className="bg-white rounded-xl shadow-sm p-5">
        {/* ✅ Heading — left side, card lopala, mundhu lagane */}
        <h2 className="text-2xl font-bold text-gray-900 mb-5">
          Popular Bus Routes
        </h2>

        {/* ✅ Routes grid — compact spacing */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-y-5 gap-x-8">
          {visibleRoutes.map((route, index) => (
            <div key={index} className="flex gap-3 items-start">
              {/* 🖼️ From city famous place image (fallback: bus icon) */}
              <div className="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 bg-gray-100">
                {cityImages[route.city] ? (
                  <img
                    src={cityImages[route.city]}
                    alt={`${route.city} buses`}
                    loading="lazy"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.style.display = "none";
                      e.currentTarget.nextSibling.style.display = "flex";
                    }}
                  />
                ) : null}
                {/* Fallback — image lekapothe / load avvakapothe */}
                <div
                  className="w-full h-full hidden items-center justify-center bg-[#fd561e]/10"
                  style={{ display: cityImages[route.city] ? "none" : "flex" }}
                >
                  <Bus className="w-6 h-6 text-[#fd561e]" />
                </div>
              </div>

              {/* Text */}
              <div>
                <h3 className="font-bold text-lg text-gray-900">
                  {route.city}
                </h3>

                <p className="text-gray-600 text-sm mt-0.5 leading-relaxed">
                  To:{" "}
                  {route.to.map((place, i) => (
                    <span key={i}>
                      <button
                        type="button"
                        onClick={() => handleRouteClick(route.city, place)}
                        className="relative inline-block text-gray-700 cursor-pointer transition-colors duration-200 hover:text-[#fd561e] active:text-[#fd561e] after:content-[''] after:absolute after:-bottom-0.5 after:left-1/2 after:-translate-x-1/2 after:h-[2px] after:w-0 after:rounded-full after:bg-[#fd561e] after:transition-[width] after:duration-300 after:ease-out hover:after:w-[calc(100%+10px)]"
                      >
                        {place}
                      </button>
                      {i !== route.to.length - 1 && <span>,&nbsp;</span>}
                    </span>
                  ))}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* ✅ View More / View Less */}
        {routes.length > INITIAL_VISIBLE && (
          <div className="flex justify-center mt-6">
            <button
              type="button"
              onClick={() => setShowAll((prev) => !prev)}
              className="bg-[#fd561e] hover:bg-[#e64a14] text-white font-semibold text-sm px-7 py-2 rounded-full transition-colors duration-200"
            >
              {showAll ? "View Less" : "View More"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}