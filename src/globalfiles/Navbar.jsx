import { useState, useEffect } from "react";
import { Menu, X, Briefcase, MapPin, User } from "lucide-react";
import { Bus, Plane, Building2, Palmtree, Car } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";

const Navbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  /* ---------------- ROUTE RULES ---------------- */

  // pages that should have transparent → solid scroll navbar
  const dynamicPages = ["/", "/HomePage", "/flights","/BillHomePage","/hotels","/cabs","/holidays"];

  const isDynamicPage = dynamicPages.includes(location.pathname);

  // solid if not dynamic OR user scrolled
  const isSolid = !isDynamicPage || scrolled;

  const noFixedNavbarPages = ["/results"];

  const isNoFixedPage = noFixedNavbarPages.includes(location.pathname);

  /* ---------------- SCROLL EFFECT ---------------- */

  useEffect(() => {
    if (!isDynamicPage) return;

    const handleScroll = () => {
      setScrolled(window.scrollY > window.innerHeight * 0.5);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [isDynamicPage]);

  /* ---------------- NAV TABS ---------------- */

  const tabs = [
    { id: "bus", label: "Bus", icon: Bus, path: "/HomePage" },
    { id: "billpayment", label: "Bill Payments", icon: Bus, path: "/BillHomePage" },
    { id: "flights", label: "Flights", icon: Plane, path: "/flights" },
    { id: "hotels", label: "Hotels", icon: Building2, path: "/hotels" },
    { id: "holidays", label: "Holidays", icon: Palmtree, path: "/holidays" },
    { id: "cabs", label: "Cabs", icon: Car, path: "/cabs" },
  ];

  // auto active tab detection from URL
  const getActiveTab = () => {
    if (location.pathname === "/" || location.pathname === "/HomePage")
      return "bus";

    if (location.pathname.startsWith("/results")) return "bus";

    if (location.pathname.startsWith("/flights")) return "flights";

    if (location.pathname.startsWith("/hotels")) return "hotels";

    if (location.pathname.startsWith("/holidays")) return "holidays";

    if (location.pathname.startsWith("/cabs")) return "cabs";

    return "";
  };

  const activeTab = getActiveTab();

  /* ---------------- JSX ---------------- */

  return (
    <nav
      className={`${isNoFixedPage ? "relative" : "fixed top-0 left-0 right-0"} z-50 transition-all duration-300 cursor-pointer ${
        isSolid ? "bg-white shadow-md" : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between px-4 h-20">
        {/* LOGO */}
        <div
          onClick={() => navigate("/")}
          className="flex items-center cursor-pointer"
        >
          <img
            src={
              isSolid
                ? "/assets/Bobros_logo.png"
                : "/assets/Bobros_whitelogo.png"
            }
            alt="Bobros Logo"
            className={`
    ${isSolid ? "h-10 w-[140px] -ml-10" : "h-20 w-auto -ml-15"}
  `}
          />
        </div>

        {/* CENTER TABS */}
        {(isSolid || !isDynamicPage) && (
          <div className="hidden md:flex items-center gap-3 flex-1 justify-center">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const active = activeTab === tab.id;

              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    navigate(tab.path);
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                  className={`flex items-center gap-2 px-6 py-2.5 rounded-full  whitespace-nowrap text-sm font-semibold transition-all duration-300 border cursor-pointer ${
                    active
                      ? "bg-gradient-to-r from-[#FD561E] to-[#ff7b4a] text-white border-transparent shadow-lg"
                      : "border-gray-200 text-gray-600 hover:border-[#FD561E] hover:text-[#FD561E]"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        )}

        {/* RIGHT SIDE */}
        <div className="hidden md:flex items-center -mr-25 gap-4 flex-shrink-0">
          <button
            className={`flex items-center gap-2 px-6 py-2.5 rounded-full border transition-all duration-300 cursor-pointer ${
              isSolid
                ? "border-gray-300 text-gray-700 hover:bg-gray-100"
                : "border-white/40 text-white hover:bg-white/10"
            }`}
          >
            <Briefcase className="w-4 h-4" />
            Business
          </button>

          <button
            className={`flex items-center gap-2 px-6 py-2.5   whitespace-nowrap rounded-full border transition-all duration-300 cursor-pointer ${
              isSolid
                ? "border-gray-300 text-gray-700 hover:bg-gray-100"
                : "border-white/40 text-white hover:bg-white/10"
            }`}
          >
            <MapPin className="w-4 h-4" />
            For Travel Agent
          </button>

          <button
            className={`w-10 h-10 flex items-center justify-center rounded-full border transition-all duration-300 cursor-pointer ${
              isSolid
                ? "border-gray-300 text-gray-700 hover:bg-gray-100"
                : "border-white/40 text-white hover:bg-white/10"
            }`}
          >
            <User className="w-5 h-5" />
          </button>
        </div>

        {/* MOBILE MENU BUTTON */}
        <button
          className="md:hidden text-black"
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          {mobileOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="md:hidden bg-black px-6 pb-6 space-y-4 text-white">
          <button
            className={`flex items-center gap-2 px-6 py-2.5 rounded-full border transition-all duration-300 ${
              isSolid
                ? "border-gray-300 text-gray-700 hover:bg-gray-100"
                : "border-white/40 text-white hover:bg-white/10"
            }`}
          >
            <Briefcase className="w-4 h-4" />
            Business
          </button>

          <button
            className={`flex items-center gap-2 px-6 py-2.5 rounded-full border transition-all duration-300 ${
              isSolid
                ? "border-gray-300 text-gray-700 hover:bg-gray-100"
                : "border-white/40 text-white hover:bg-white/10"
            }`}
          >
            <MapPin className="w-4 h-4" />
            For Travel Agent
          </button>

          <button className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-full border border-white">
            <User className="w-4 h-4" />
            Login / Sign Up
          </button>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
