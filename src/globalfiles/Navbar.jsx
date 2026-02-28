import { useState, useEffect } from "react";
import { Menu, X, Briefcase, MapPin, User } from "lucide-react";
import { Bus, Plane, Building2, Palmtree, Car } from "lucide-react";

const Navbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeTab, setActiveTab] = useState("bus");
  const tabs = [
    { id: "bus", label: "Bus", icon: Bus },
    { id: "flights", label: "Flights", icon: Plane },
    { id: "hotels", label: "Hotels", icon: Building2 },
    { id: "holidays", label: "Holidays", icon: Palmtree },
    { id: "cabs", label: "Cabs", icon: Car },
  ];
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > window.innerHeight * 0.6);
      // adjust 500 based on hero height
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? "bg-white shadow-md" : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between px-6 h-20">
        {/* Logo Image Placeholder */}
        <a href="/" className="flex items-center">
          <img
            src="/assets/Bobros_whitelogo.png"
            alt="Logo"
            className="h-20 w-auto object-contain"
          />
        </a>
        {/* CENTER: TABS */}
        {scrolled && (
          <div className="hidden md:flex items-center gap-3">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const active = activeTab === tab.id;

              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id);
                    scrollToTop();
                  }}
                  className={`flex items-center gap-2 px-6 py-2.5 rounded-full text-sm font-semibold transition-all duration-300 border ${
                    active
                      ? "bg-gradient-to-r from-[#FD561E] to-[#ff7b4a] text-white border-transparent shadow-lg scale-105"
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
        {/* Desktop Right Section */}
        <div className="hidden md:flex items-center gap-4">
          <button
            className={`flex items-center gap-2 px-6 py-2.5 rounded-full border transition ${
              scrolled
                ? "border-gray-300 text-gray-700 hover:bg-gray-100"
                : "border-white text-white hover:bg-white/10"
            }`}
          >
            <Briefcase className="w-4 h-4" />
            <span className="text-sm font-medium">Business</span>
          </button>

          <button
            className={`flex items-center gap-2 px-6 py-2.5 rounded-full border transition ${
              scrolled
                ? "border-gray-300 text-gray-700 hover:bg-gray-100"
                : "border-white text-white hover:bg-white/10"
            }`}
          >
            <MapPin className="w-4 h-4" />
            <span className="text-sm font-medium">For Travel Agent</span>
          </button>

          <button
            className={`w-10 h-10 flex items-center justify-center rounded-full border transition ${
              scrolled
                ? "border-gray-300 text-gray-700 hover:bg-gray-100"
                : "border-white text-white hover:bg-white/10"
            }`}
          >
            <User className="w-5 h-5" />
          </button>
        </div>

        {/* Mobile Toggle */}
        <button
          className="md:hidden text-white"
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          {mobileOpen ? (
            <X className="w-7 h-7" />
          ) : (
            <Menu className="w-7 h-7" />
          )}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="md:hidden bg-black px-6 pb-6 space-y-4 text-white">
          <button className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-full border border-white">
            <Briefcase className="w-4 h-4" />
            Business
          </button>

          <button className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-full border border-white">
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
