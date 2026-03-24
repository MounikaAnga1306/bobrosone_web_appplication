import { useState, useEffect, useRef } from "react";
import { Menu, X, Briefcase, MapPin, User } from "lucide-react";
import { Bus, Plane, Building2, Palmtree, Car } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import AuthModal from "../modules/bus/pages/AuthModal";
import SignIn from "../modules/bus/pages/SignIn";
import SignupForm from "../modules/bus/pages/SignUpForm";
import ForgotPassword from "../modules/bus/pages/ForgotPassword";
import VerifyOTP from "../modules/bus/pages/VerifyOTP";
import ResetPassword from "../modules/bus/pages/ResetPassword";
import GuestBookings from "../modules/bus/pages/GuestBookings";
import CancellationCard from "../modules/bus/pages/CancellationCard";
import PrintTicketModal from "../modules/bus/pages/PrintTicketModal";


const Navbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [openAuthModal, setOpenAuthModal] = useState(false);
  const [authPage, setAuthPage] = useState("signin");
  const [signupData, setSignupData] = useState(null);
  const [resetData, setResetData] = useState(null);
  const [showGuestBookings, setShowGuestBookings] = useState(false);
  const [showCancel, setShowCancel] = useState(false);
  const [showPrintTicket, setShowPrintTicket] = useState(false);
  const [printTin, setPrintTin] = useState("");

  const navigate = useNavigate();
  const location = useLocation();
  const dropdownRef = useRef(null);
  const [user, setUser] = useState(null);
  const [openDropdown, setOpenDropdown] = useState(false);
  const closeTimeout = useRef(null);

  useEffect(() => {
    setOpenDropdown(false);
  }, [location.pathname]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpenDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const firstVisit = sessionStorage.getItem("firstVisitDone");
    if (!firstVisit) {
      setTimeout(() => {
        setAuthPage("signin");
        setOpenAuthModal(true);
      }, 1200);
      sessionStorage.setItem("firstVisitDone", "true");
    }
  }, []);

  useEffect(() => {
    const checkLogin = () => {
      const loggedIn = localStorage.getItem("isLoggedIn") === "true";
      const userData = JSON.parse(localStorage.getItem("user"));
      setIsLoggedIn(loggedIn);
      setUser(userData?.user || userData || null);
    };
    checkLogin();
    window.addEventListener("storage", checkLogin);
    return () => window.removeEventListener("storage", checkLogin);
  }, []);

  // ── Listen for openAuthModal events (from BookingSuccess Sign Up / Sign In buttons) ──
  useEffect(() => {
    const handler = (e) => {
      setAuthPage(e.detail === "signup" ? "signup" : "signin");
      setOpenAuthModal(true);
    };
    window.addEventListener("openAuthModal", handler);
    return () => window.removeEventListener("openAuthModal", handler);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("isLoggedIn");
    setIsLoggedIn(false);
    setUser(null);
    setOpenDropdown(false);
  };

  // ✅ Used by BOTH guest and logged-in dropdowns
  const handleOpenCancel = () => {
    setOpenDropdown(false);
    clearTimeout(closeTimeout.current);
    setShowCancel(true);
  };

  const dynamicPages = ["/", "/HomePage", "/flights", "/BillHomePage", "/hotels", "/cabs", "/holidays"];
  const isDynamicPage = dynamicPages.includes(location.pathname);
  const isSolid = !isDynamicPage || scrolled;
  const noFixedNavbarPages = ["/results"];
  const isNoFixedPage = noFixedNavbarPages.includes(location.pathname);

  useEffect(() => {
    if (!isDynamicPage) return;
    const handleScroll = () => setScrolled(window.scrollY > window.innerHeight * 0.5);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [isDynamicPage]);

  const tabs = [
    { id: "bus",         label: "Bus",           icon: Bus,       path: "/HomePage"    },
    { id: "billpayment", label: "Bill Payments",  icon: Bus,       path: "/BillHomePage"},
    { id: "flights",     label: "Flights",        icon: Plane,     path: "/flights"     },
    { id: "hotels",      label: "Hotels",         icon: Building2, path: "/hotels"      },
    { id: "holidays",    label: "Holidays",       icon: Palmtree,  path: "/holidays"    },
    { id: "cabs",        label: "Cabs",           icon: Car,       path: "/cabs"        },
  ];

  const getActiveTab = () => {
    if (location.pathname === "/" || location.pathname === "/HomePage") return "bus";
    if (location.pathname.startsWith("/results"))  return "bus";
    if (location.pathname.startsWith("/flights"))  return "flights";
    if (location.pathname.startsWith("/hotels"))   return "hotels";
    if (location.pathname.startsWith("/holidays")) return "holidays";
    if (location.pathname.startsWith("/cabs"))     return "cabs";
    return "";
  };

  const activeTab = getActiveTab();

  return (
    <>
      <nav
        className={`${isNoFixedPage ? "relative" : "fixed top-0 left-0 right-0"} z-50 transition-all duration-300 ${
          isSolid ? "bg-white shadow-md" : "bg-transparent"
        }`}
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between px-4 h-20">

          {/* LOGO */}
          <div onClick={() => navigate("/")} className="flex items-center cursor-pointer">
            <img
              src={isSolid ? "/assets/Bobros_logo.png" : "/assets/Bobros_whitelogo.png"}
              alt="Bobros Logo"
              className={`${isSolid ? "h-auto w-[300px] -ml-10" : "h-auto w-[300px] -ml-15"}`}
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
                    className={`flex items-center gap-2 px-4 py-2 rounded-full whitespace-nowrap text-sm font-semibold transition-all duration-300 border cursor-pointer ${
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

            <button className={`flex items-center gap-2 -mr-3 ml-2 px-4 py-2 rounded-full border transition-all duration-300 cursor-pointer ${
              isSolid ? "border-gray-300 text-gray-700 hover:bg-gray-100" : "border-white/40 text-white hover:bg-white/10"
            }`}>
              <Briefcase className="w-4 h-4" />
              Business
            </button>

            <button className={`flex items-center -mr-2 gap-2 px-4 py-2 whitespace-nowrap rounded-full border transition-all duration-300 cursor-pointer ${
              isSolid ? "border-gray-300 text-gray-700 hover:bg-gray-100" : "border-white/40 text-white hover:bg-white/10"
            }`}>
              <MapPin className="w-4 h-4" />
              For Travel Agent
            </button>

            {/* LOGIN AREA */}
            <div
              className="relative"
              ref={dropdownRef}
              onMouseEnter={() => {
                if (!isLoggedIn) {
                  clearTimeout(closeTimeout.current);
                  setOpenDropdown(true);
                }
              }}
              onMouseLeave={() => {
                if (!isLoggedIn) {
                  closeTimeout.current = setTimeout(() => setOpenDropdown(false), 300);
                }
              }}
            >
              <button
                onClick={() => {
                  if (!isLoggedIn) {
                    setAuthPage("signin");
                    setOpenAuthModal(true);
                  } else {
                    setOpenDropdown(!openDropdown);
                  }
                }}
                className={`flex items-center gap-2 -mr-6 px-4 py-2 rounded-full border transition-all duration-300 cursor-pointer ${
                  isSolid ? "border-gray-300 text-gray-700 hover:bg-gray-100" : "border-white/40 text-white hover:bg-white/10"
                }`}
              >
                <User className="w-5 h-5" />
                {isLoggedIn ? <>Hi {user?.uname?.split(" ")[0]}</> : "Login/Signup"}
              </button>

              {/* ── GUEST DROPDOWN ── */}
              {!isLoggedIn && openDropdown && (
                <div className="absolute right-2 top-18 w-64 bg-white rounded-xl shadow-lg border border-gray-100 text-gray-700 overflow-hidden z-50">
                  <div className="px-4 py-3 bg-gray-50">
                    <p className="font-semibold text-gray-800">Hey Traveller</p>
                    <p className="text-sm text-gray-500">Get exclusive deals & Manage your trips</p>
                  </div>

                  <button
                    onClick={() => {
                      setOpenDropdown(false);
                      setAuthPage("signin");
                      setOpenAuthModal(true);
                    }}
                    className="mx-4 my-3 mt-2 w-[calc(100%-32px)] cursor-pointer bg-blue-600 text-white font-semibold py-2.5 rounded-lg hover:bg-blue-700 transition-all duration-300"
                  >
                    Login / Sign Up
                  </button>

                  <button
                    onClick={() => { setOpenDropdown(false); setShowGuestBookings(true); }}
                    className="group w-full text-left px-4 py-3 cursor-pointer border-b border-gray-200 hover:bg-gray-50"
                  >
                    <span className="inline-block transition-all duration-200 group-hover:translate-x-2 group-hover:text-blue-600">
                      My Bookings
                    </span>
                  </button>

                  <button
                    onClick={() => { setOpenDropdown(false); setPrintTin(""); setShowPrintTicket(true); }}
                    className="group w-full text-left px-4 py-3 cursor-pointer border-b border-gray-200 hover:bg-gray-50"
                  >
                    <span className="inline-block transition-all duration-200 group-hover:translate-x-2 group-hover:text-blue-600">
                      Print Ticket
                    </span>
                  </button>

                  <button
                    onClick={handleOpenCancel}
                    className="group w-full text-left px-4 py-3 cursor-pointer hover:bg-gray-50"
                  >
                    <span className="inline-block transition-all duration-200 group-hover:translate-x-2 group-hover:text-blue-600">
                      Cancellation
                    </span>
                  </button>
                </div>
              )}

              {/* ── LOGGED IN DROPDOWN ── */}
              {isLoggedIn && openDropdown && (
                <div className="absolute right-0 mt-3 w-56 bg-white rounded-xl shadow-lg border border-gray-100 text-gray-700 overflow-hidden z-50">
                  <button
                    onClick={() => { setOpenDropdown(false); navigate("/my-bookings"); }}
                    className="group w-full text-left px-4 py-3 border-b border-gray-200 hover:bg-gray-50"
                  >
                    <span className="inline-block transition-all duration-200 group-hover:translate-x-2 group-hover:text-blue-600">
                      My Booking
                    </span>
                  </button>

                  <button
                    onClick={() => { setOpenDropdown(false); navigate("/my-account"); }}
                    className="group w-full text-left px-4 py-3 border-b border-gray-200 hover:bg-gray-50"
                  >
                    <span className="inline-block transition-all duration-200 group-hover:translate-x-2 group-hover:text-blue-600">
                      My Account
                    </span>
                  </button>

                  <button
                    onClick={handleOpenCancel}
                    className="group w-full text-left px-4 py-3 border-b border-gray-200 hover:bg-gray-50"
                  >
                    <span className="inline-block transition-all duration-200 group-hover:translate-x-2 group-hover:text-blue-600">
                      Cancellation
                    </span>
                  </button>

                  <button
                    onClick={() => { setOpenDropdown(false); setPrintTin(""); setShowPrintTicket(true); }}
                    className="group w-full text-left px-4 py-3 border-b border-gray-200 hover:bg-gray-50"
                  >
                    <span className="inline-block transition-all duration-200 group-hover:translate-x-2 group-hover:text-blue-600">
                      Print Ticket
                    </span>
                  </button>

                  <button
                    onClick={() => { setOpenDropdown(false); navigate("/my-profile"); }}
                    className="group w-full text-left px-4 py-3 border-b border-gray-200 hover:bg-gray-50"
                  >
                    <span className="inline-block transition-all duration-200 group-hover:translate-x-2 group-hover:text-blue-600">
                      My Profile
                    </span>
                  </button>

                  <button
                    onClick={handleLogout}
                    className="group w-full text-left px-4 py-3 hover:bg-gray-50 text-red-500"
                  >
                    <span className="inline-block transition-all duration-200 group-hover:translate-x-2">
                      Logout
                    </span>
                  </button>
                </div>
              )}
            </div>
          </div>

          <button className="md:hidden text-black" onClick={() => setMobileOpen(!mobileOpen)}>
            {mobileOpen ? <X /> : <Menu />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileOpen && (
          <div className="md:hidden bg-black px-6 pb-6 space-y-4 text-white">
            <button className={`flex items-center gap-2 px-6 py-2.5 rounded-full border transition-all duration-300 ${
              isSolid ? "border-gray-300 text-gray-700 hover:bg-gray-100" : "border-white/40 text-white hover:bg-white/10"
            }`}>
              <Briefcase className="w-4 h-4" />
              Business
            </button>
            <button className={`flex items-center gap-2 px-6 py-2.5 rounded-full border transition-all duration-300 ${
              isSolid ? "border-gray-300 text-gray-700 hover:bg-gray-100" : "border-white/40 text-white hover:bg-white/10"
            }`}>
              <MapPin className="w-4 h-4" />
              For Travel Agent
            </button>
            <button className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-full border border-white">
              <User className="w-4 h-4" />
              Login / Sign Up
            </button>
          </div>
        )}

        {/* Auth Modal */}
        <AuthModal isOpen={openAuthModal} onClose={() => setOpenAuthModal(false)}>
          {authPage === "signin" && (
            <SignIn
              closeModal={() => setOpenAuthModal(false)}
              openSignup={() => setAuthPage("signup")}
              openForgot={() => setAuthPage("forgot")}
            />
          )}
          {authPage === "signup" && (
            <SignupForm
              closeModal={() => setOpenAuthModal(false)}
              openSignin={() => setAuthPage("signin")}
              openVerifyOtp={(data) => { setSignupData(data); setAuthPage("verifyotp"); }}
            />
          )}
          {authPage === "verifyotp" && (
            <VerifyOTP signupData={signupData} closeModal={() => setOpenAuthModal(false)} />
          )}
          {authPage === "forgot" && (
            <ForgotPassword
              closeModal={() => setOpenAuthModal(false)}
              openSignin={() => setAuthPage("signin")}
              openResetPassword={(data) => { setResetData(data); setAuthPage("reset"); }}
            />
          )}
          {authPage === "reset" && (
            <ResetPassword
              resetData={resetData}
              closeModal={() => setOpenAuthModal(false)}
              openSignin={() => setAuthPage("signin")}
            />
          )}
        </AuthModal>

        {/* Guest Bookings Modal */}
        {showGuestBookings && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl shadow-2xl p-8 w-[420px] mx-4 relative max-h-[90vh] overflow-y-auto">
              <button
                onClick={() => setShowGuestBookings(false)}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 cursor-pointer"
              >
                ✕
              </button>
              <GuestBookings onClose={() => setShowGuestBookings(false)} />
            </div>
          </div>
        )}
      </nav>

      {/* CancellationCard — outside nav */}
      {showCancel && (
        <CancellationCard onClose={() => setShowCancel(false)} />
      )}

      {/* Print Ticket Modal */}
      {showPrintTicket && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl p-8 w-[420px] mx-4 relative">
            <button
              onClick={() => setShowPrintTicket(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 cursor-pointer"
            >✕</button>
            <PrintTicketModal onClose={() => setShowPrintTicket(false)} prefillTin={printTin} />
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;