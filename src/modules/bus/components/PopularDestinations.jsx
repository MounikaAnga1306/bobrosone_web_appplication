import { useRef, useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, ChevronDown } from "lucide-react";

const API = import.meta.env.VITE_API_BASE_URL;

// ─────────────────────────────────────────────────────────────────────────────
// CITY_INFO — prati city ki landmark image + gradient fallback.
// City eppudu destination ga vachina ide image vstundi.
//  • Hyderabad → Charminar (/assets/charminar.jpg ni assets lo pettandi)
//  • image leka pothe / fail aithe → gradient fallback card baaga ne untundi.
// ─────────────────────────────────────────────────────────────────────────────
const CITY_INFO = {
  Hyderabad:     { image: "/assets/charminar.jpg", gradient: "linear-gradient(155deg,#6d28d9 0%,#1e1b4b 100%)" },
  Mysore:     { image: "https://th.bing.com/th/id/OIP.U47ZeSrL84aQfWxZrIBkfQHaE8?w=296&h=198&c=7&r=0&o=7&dpr=1.3&pid=1.7&rm=3", gradient: "linear-gradient(155deg,#6d28d9 0%,#1e1b4b 100%)" },
  Coimbatore:     { image: "https://th.bing.com/th/id/OIP.qR8niSXz-OBy8NySpU-21gHaEK?w=394&h=187&c=7&r=0&o=7&dpr=1.3&pid=1.7&rm=3", gradient: "linear-gradient(155deg,#6d28d9 0%,#1e1b4b 100%)" },
  Surat:     { image: "https://mysimplesojourn.com/wp-content/uploads/2018/08/Vijay-Vilas-Palace_2-1024x686.jpg", gradient: "linear-gradient(155deg,#6d28d9 0%,#1e1b4b 100%)" },
  Nashik:     { image: "https://chaloghumane.com/wp-content/uploads/2021/09/nashik-tourist-places.jpg", gradient: "linear-gradient(155deg,#6d28d9 0%,#1e1b4b 100%)" },
  Shirdi:     { image: "https://www.trawell.in/admin/images/upload/000682325Shirdi_Sai_Temple_Main.jpg", gradient: "linear-gradient(155deg,#6d28d9 0%,#1e1b4b 100%)" },
  Pondicherry:     { image: "https://www.indiatravel.app/wp-content/uploads/2024/02/places-to-visit-in-pondicherry.jpg", gradient: "linear-gradient(155deg,#6d28d9 0%,#1e1b4b 100%)" },
  Madurai:     { image: "https://dynamic-media-cdn.tripadvisor.com/media/photo-o/11/71/bf/0e/madurai-meenakshi-temple.jpg?w=800&h=500&s=1", gradient: "linear-gradient(155deg,#6d28d9 0%,#1e1b4b 100%)" },
  Agra:     { image: "https://tse1.explicit.bing.net/th/id/OIP.e5trrmC71esXNUPXMgahEAHaEo?rs=1&pid=ImgDetMain&o=7&rm=3", gradient: "linear-gradient(155deg,#6d28d9 0%,#1e1b4b 100%)" },
  Jaipur:     { image: "https://th.bing.com/th/id/OIP.MTx0Vof02gHcJL8visxoKAAAAA?w=289&h=180&c=7&r=0&o=7&dpr=1.3&pid=1.7&rm=3", gradient: "linear-gradient(155deg,#6d28d9 0%,#1e1b4b 100%)" },
  Manali:     { image: "https://www.nativeplanet.com/photos/929x523x90/2017/10/_15070966880.jpg", gradient: "linear-gradient(155deg,#6d28d9 0%,#1e1b4b 100%)" },
  Shimla:     { image: "https://residencestyles.com/wp-content/uploads/2023/12/The-Ridge.jpg", gradient: "linear-gradient(155deg,#6d28d9 0%,#1e1b4b 100%)" },
  Chandigarh:     { image: "https://i0.wp.com/www.tusktravel.com/blog/wp-content/uploads/2019/09/Rock-Garden-chandigarh.jpg?resize=768%2C576&ssl=1", gradient: "linear-gradient(155deg,#6d28d9 0%,#1e1b4b 100%)" },
  Amritsar:     { image: "https://wallpapercave.com/wp/wp3188693.jpg", gradient: "linear-gradient(155deg,#6d28d9 0%,#1e1b4b 100%)" },
  Lucknow:     { image: "https://www.postoast.com/wp-content/uploads/2018/02/Chota-Imambara-Must-visit-Places-in-Lucknow.jpg", gradient: "linear-gradient(155deg,#6d28d9 0%,#1e1b4b 100%)" },
  Digha:     { image: "https://hblimg.mmtcdn.com/content/hubble/img/desttvimg/mmt/destination/m_Digha_tv_destination_img_4_l_703_1167.jpg", gradient: "linear-gradient(155deg,#6d28d9 0%,#1e1b4b 100%)" },
  Siliguri:     { image: "https://i.pinimg.com/474x/58/fe/a4/58fea4aa3caeaaabb27cf60d969c04e2--west-bengal-temples.jpg", gradient: "linear-gradient(155deg,#6d28d9 0%,#1e1b4b 100%)" },
  Bhubaneswar:     { image: "https://tse3.mm.bing.net/th/id/OIP.wK6dti_YoZXGG-KjqiqlkgHaFL?rs=1&pid=ImgDetMain&o=7&rm=3", gradient: "linear-gradient(155deg,#6d28d9 0%,#1e1b4b 100%)" },
  Ranchi:     { image: "https://blogs.revv.co.in/blogs/wp-content/uploads/2021/11/Tagore-Hill-Ranchi.jpg", gradient: "linear-gradient(155deg,#6d28d9 0%,#1e1b4b 100%)" },
  Patna:     { image: "https://tse4.mm.bing.net/th/id/OIP.JcYt8772Fbrghxex0i3c8QHaEK?rs=1&pid=ImgDetMain&o=7&rm=3", gradient: "linear-gradient(155deg,#6d28d9 0%,#1e1b4b 100%)" },
  Durgapur:     { image: "https://cdn1.tripoto.com/media/filter/tst/img/2024753/SpotDocument/1611994821_1611994817293.jpg", gradient: "linear-gradient(155deg,#6d28d9 0%,#1e1b4b 100%)" },
  Mangalore:     { image: "https://i.pinimg.com/originals/40/0f/ff/400fff1dd8c7c78b8eac59cd59e268d5.jpg", gradient: "linear-gradient(155deg,#6d28d9 0%,#1e1b4b 100%)" },

  Bangalore:     { image: "https://www.shutterstock.com/image-photo/bangalore-india-december-12-2024-600nw-2450402849.jpg", gradient: "linear-gradient(155deg,#1e3a5f 0%,#0f172a 100%)" },
  Chennai:       { image: "https://iantiark.sirv.com/ER/bg/Chennai-bg.jpg?q=75&progressive=true", gradient: "linear-gradient(155deg,#7c2d12 0%,#1c1917 100%)" },
  Vijayawada:    { image: "https://media-cdn.tripadvisor.com/media/photo-c/1280x250/0f/b5/db/4f/prakasam-barrage.jpg", gradient: "linear-gradient(155deg,#155e75 0%,#0c1320 100%)" },
  Tirupati:      { image: "https://www.fabhotels.com/blog/wp-content/uploads/2019/03/Sri-Venkateswara-Swamy-Temple-Tirumala.jpg", gradient: "linear-gradient(155deg,#b45309 0%,#1c1207 100%)" },
  Visakhapatnam: { image: "https://www.fabhotels.com/blog/wp-content/uploads/2018/07/600x400-35.jpg", gradient: "linear-gradient(155deg,#0e7490 0%,#082032 100%)" },
  Goa:           { image: "https://images.travelandleisureasia.com/wp-content/uploads/sites/2/2024/04/05162843/Palm-beach-1-1600x900.jpg", gradient: "linear-gradient(155deg,#0369a1 0%,#0a1f2e 100%)" },
  Mumbai:        { image: "https://tse4.mm.bing.net/th/id/OIP.x4lxxytBtBXGTTZJDYlOQgHaEK?rs=1&pid=ImgDetMain&o=7&rm=3", gradient: "linear-gradient(155deg,#475569 0%,#0f172a 100%)" },
  Pune:          { image: "https://i.pinimg.com/originals/0f/67/eb/0f67eb672b9e06d118b11017e535fe71.jpg", gradient: "linear-gradient(155deg,#3f3f46 0%,#18181b 100%)" },
  Warangal:      { image: "https://tse3.mm.bing.net/th/id/OIP.pZafyi8dEFzPGuK-rizaiQHaE8?w=1024&h=683&rs=1&pid=ImgDetMain&o=7&rm=3", gradient: "linear-gradient(155deg,#92400e 0%,#1c1207 100%)" },
  Nagpur:        { image: "https://im.whatshot.in/img/2020/Aug/istock-1139387103-cropped-1597665160.jpg", gradient: "linear-gradient(155deg,#334155 0%,#0f172a 100%)" },
  Srisailam:     { image: "https://tse2.mm.bing.net/th/id/OIP.C2FYP-9uAmrl38FgFfHArwHaE8?w=900&h=600&rs=1&pid=ImgDetMain&o=7&rm=3", gradient: "linear-gradient(155deg,#166534 0%,#06210f 100%)" },
};

// ─────────────────────────────────────────────────────────────────────────────
// ROUTES_FROM — source city → popular destination cities.
// Dropdown lo ee keys (supported sources) chupistam.
// City ki route ledu ante DEFAULT (Hyderabad) list fallback.
// ─────────────────────────────────────────────────────────────────────────────
const ROUTES_FROM = {
  Hyderabad:  ["Bangalore", "Chennai", "Vijayawada", "Tirupati", "Visakhapatnam", "Goa", "Mumbai", "Pune", "Warangal", "Nagpur", "Srisailam"],
  Mumbai:     ["Pune", "Goa", "Hyderabad", "Bangalore", "Nagpur", "Surat", "Nashik", "Shirdi"],
  Bangalore:  ["Chennai", "Hyderabad", "Goa", "Mysore", "Tirupati", "Pune", "Mumbai", "Coimbatore"],
  Chennai:    ["Bangalore", "Hyderabad", "Tirupati", "Pondicherry", "Madurai", "Coimbatore", "Vijayawada"],
  Pune:       ["Mumbai", "Goa", "Hyderabad", "Bangalore", "Shirdi", "Nashik"],
  Delhi:      ["Agra", "Jaipur", "Manali", "Shimla", "Chandigarh", "Amritsar", "Lucknow"],
  Kolkata:    ["Digha", "Siliguri", "Bhubaneswar", "Ranchi", "Patna", "Durgapur"],
  Goa:        ["Mumbai", "Pune", "Bangalore", "Hyderabad", "Mangalore"],
  Vijayawada: ["Hyderabad", "Visakhapatnam", "Chennai", "Bangalore", "Tirupati"],
};

// Dropdown lo chupinche source cities (routes unnavi)
const SOURCE_CITIES = Object.keys(ROUTES_FROM);

const DEFAULT_GRADIENT = "linear-gradient(155deg,#334155 0%,#0f172a 100%)";
const norm = (s) => (s || "").trim().toLowerCase();

// source batti destinations list build cheyyadam
const buildDestinations = (fromCity) => {
  const sourceKey =
    Object.keys(ROUTES_FROM).find((k) => norm(k) === norm(fromCity)) || "Hyderabad";

  return (ROUTES_FROM[sourceKey] || [])
    .filter((city) => norm(city) !== norm(fromCity))
    .map((city) => {
      const info = CITY_INFO[city] || {};
      return { city, image: info.image || "", gradient: info.gradient || DEFAULT_GRADIENT };
    });
};

export default function PopularDestinations({ fromCity = "Hyderabad" }) {
  const scrollerRef = useRef(null);
  const cityCache = useRef({});
  const dropRef = useRef(null);

  const [from, setFrom] = useState(fromCity);   // ← selected source (component lone manage)
  const [dropOpen, setDropOpen] = useState(false);
  const [loadingCity, setLoadingCity] = useState(null);

  // dropdown bayata click aithe close
  useEffect(() => {
    const handler = (e) => {
      if (dropRef.current && !dropRef.current.contains(e.target)) setDropOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const list = buildDestinations(from);

  // ── Resolve city id from API (cached) ──────────────────────────────────────
  const getCityId = async (cityName) => {
    try {
      if (cityCache.current[cityName]) return cityCache.current[cityName];
      const res = await fetch(`${API}/cities?name=${encodeURIComponent(cityName)}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      if (!Array.isArray(data) || data.length === 0) return null;
      const match = data.find(
        (c) => c.cityname.toLowerCase() === cityName.toLowerCase()
      );
      const id = match?.sid || data[0]?.sid;
      cityCache.current[cityName] = id;
      return id;
    } catch (err) {
      console.error("City fetch error:", err);
      return null;
    }
  };

  const getTomorrowDate = () => {
    const today = new Date();
    today.setDate(today.getDate() + 1);
    return today.toISOString().split("T")[0];
  };

  // ── Click a destination → full page load to results page (real API search)
  const handleRouteClick = async (toCity) => {
    if (loadingCity) return;
    setLoadingCity(toCity);
    try {
      const [sourceId, destinationId] = await Promise.all([
        getCityId(from),
        getCityId(toCity),
      ]);

      if (!sourceId || !destinationId) {
        console.error("City ID not found", from, toCity);
        setLoadingCity(null);
        return;
      }

      const date = getTomorrowDate();

      sessionStorage.setItem("sourceName", from);
      sessionStorage.setItem("destinationName", toCity);

      const url = `/results?source=${sourceId}&destination=${destinationId}&doj=${date}&fromName=${encodeURIComponent(
        from
      )}&toName=${encodeURIComponent(toCity)}`;

      window.location.href = url; // full refresh navigation
    } catch (err) {
      console.error("Navigation error:", err);
      setLoadingCity(null);
    }
  };

  const handleSelectSource = (city) => {
    setFrom(city);
    setDropOpen(false);
    if (scrollerRef.current) scrollerRef.current.scrollTo({ left: 0, behavior: "smooth" });
  };

  const scrollByDir = (dir) => {
    const el = scrollerRef.current;
    if (!el) return;
    el.scrollBy({ left: dir * el.clientWidth * 0.8, behavior: "smooth" });
  };

  return (
    <section className="w-full max-w-[90%] lg:max-w-[82%] mx-auto">
      <style>{`
        @keyframes pdFadeUp {
          from { opacity: 0; transform: translateY(22px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes pdDrop {
          from { opacity: 0; transform: translateY(-6px) scale(0.98); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        .pd-card { animation: pdFadeUp 0.6s cubic-bezier(0.16,1,0.3,1) both; }
        .pd-drop { animation: pdDrop 0.18s ease both; transform-origin: top left; }
        .pd-scroller::-webkit-scrollbar { display: none; }
        .pd-scroller { -ms-overflow-style: none; scrollbar-width: none; }
        @media (prefers-reduced-motion: reduce) {
          .pd-card, .pd-drop { animation: none !important; }
        }
      `}</style>

      {/* ── Header ── */}
      <div className="flex items-center justify-between gap-4 mb-5">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 flex flex-wrap items-center gap-x-2">
          <span>Bus Tickets to Popular Destinations from</span>

          {/* ── FROM CITY DROPDOWN (arrow tho) ── */}
          <span className="relative inline-block" ref={dropRef}>
            <button
              type="button"
              onClick={() => setDropOpen((o) => !o)}
              className="inline-flex items-center gap-1 text-[#FD561E] hover:opacity-80 transition-opacity cursor-pointer"
            >
              {from}
              <ChevronDown
                className={`w-5 h-5 transition-transform duration-200 ${dropOpen ? "rotate-180" : ""}`}
              />
            </button>

            {dropOpen && (
              <div className="pd-drop absolute left-0 top-full mt-2 w-56 bg-white border border-gray-200 rounded-xl shadow-xl z-50 overflow-hidden">
                <ul className="max-h-72 overflow-y-auto py-1">
                  {SOURCE_CITIES.map((city) => {
                    const active = norm(city) === norm(from);
                    return (
                      <li key={city}>
                        <button
                          type="button"
                          onClick={() => handleSelectSource(city)}
                          className={`w-full text-left px-4 py-2.5 text-sm font-medium cursor-pointer transition-colors ${
                            active
                              ? "bg-orange-50 text-[#FD561E]"
                              : "text-gray-700 hover:bg-orange-50 hover:text-[#FD561E]"
                          }`}
                        >
                          {city}
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}
          </span>
        </h2>

        <div className="hidden sm:flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => scrollByDir(-1)}
            aria-label="Scroll left"
            className="w-9 h-9 rounded-full border border-gray-300 text-gray-600 flex items-center justify-center hover:border-[#FD561E] hover:text-[#FD561E] hover:bg-orange-50 transition-all duration-200 active:scale-95"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            type="button"
            onClick={() => scrollByDir(1)}
            aria-label="Scroll right"
            className="w-9 h-9 rounded-full border border-gray-300 text-gray-600 flex items-center justify-center hover:border-[#FD561E] hover:text-[#FD561E] hover:bg-orange-50 transition-all duration-200 active:scale-95"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* ── Carousel ── */}
      <div
        ref={scrollerRef}
        className="pd-scroller flex gap-3 sm:gap-4 overflow-x-auto pb-2 snap-x snap-mandatory scroll-smooth"
      >
        {list.map((d, i) => {
          const isLoading = loadingCity === d.city;
          return (
            <button
              key={`${from}-${d.city}`}
              type="button"
              onClick={() => handleRouteClick(d.city)}
              style={{ animationDelay: `${i * 70}ms` }}
              className="pd-card group relative shrink-0 snap-start w-[150px] sm:w-[180px] h-[200px] sm:h-[230px] rounded-2xl overflow-hidden text-left shadow-sm hover:shadow-2xl transition-all duration-300 ease-out hover:-translate-y-1.5 active:scale-[0.98] cursor-pointer"
            >
              {/* gradient fallback (always present) */}
              <div className="absolute inset-0" style={{ background: d.gradient }} />

              {/* famous-place image (image unte matrame render) */}
              {d.image && (
                <img
                  src={d.image}
                  alt={d.city}
                  loading="lazy"
                  onError={(e) => { e.currentTarget.style.display = "none"; }}
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-[800ms] ease-out group-hover:scale-110"
                />
              )}

              {/* dark overlay for text readability */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/15 to-black/25 transition-opacity duration-300 group-hover:from-black/90" />

              {/* place name only */}
              <h3 className="absolute bottom-4 left-4 right-4 text-white text-lg sm:text-xl font-extrabold leading-tight drop-shadow-md transition-transform duration-300 group-hover:-translate-y-0.5">
                {d.city}
              </h3>

              {/* loading overlay while resolving city ids */}
              {isLoading && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                  <div className="w-7 h-7 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                </div>
              )}
            </button>
          );
        })}
      </div>
    </section>
  );
}