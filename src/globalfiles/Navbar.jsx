import { useState, useEffect, useRef } from "react";
import { Menu, X, Briefcase, MapPin, User, ChevronDown } from "lucide-react";
import { Bus, Plane, Building2, Palmtree, Car } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import AuthModal from "../modules/bus/pages/AuthModal";
import SignIn from "../globalfiles/SignIn";
import SignupForm from "../globalfiles/SignupForm";
import ForgotPassword from "../modules/bus/pages/ForgotPassword";
import VerifyOTP from "../modules/bus/pages/VerifyOTP";
import ResetPassword from "../modules/bus/pages/ResetPassword";
import GuestBookings from "../modules/bus/pages/GuestBookings";
import CancellationCard from "../modules/bus/pages/CancellationCard";
import PrintTicketModal from "../modules/bus/pages/PrintTicketModal";
import PrintFlightTicketModal from "../modules/flights/pages/PrintFlightTicketModal";

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
  const [showFlightPrintTicket, setShowFlightPrintTicket] = useState(false);
  const [mobileDropdownOpen, setMobileDropdownOpen] = useState(false);
  

  const navigate = useNavigate();
  const location = useLocation();
  const dropdownRef = useRef(null);
  const mobileDropdownRef = useRef(null);
  const [user, setUser] = useState(null);
  const [openDropdown, setOpenDropdown] = useState(false);
  const closeTimeout = useRef(null);

  useEffect(() => {
    setOpenDropdown(false);
    setMobileDropdownOpen(false);
    setMobileOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpenDropdown(false);
      }
      if (mobileDropdownRef.current && !mobileDropdownRef.current.contains(event.target)) {
        setMobileDropdownOpen(false);
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
    setMobileDropdownOpen(false);
    setMobileOpen(false);
    window.dispatchEvent(new Event("storage"));
    navigate("/");
  };

  const handleOpenCancel = () => {
    setOpenDropdown(false);
    setMobileDropdownOpen(false);
    clearTimeout(closeTimeout.current);
    setShowCancel(true);
  };

  const dynamicPages = ["/", "/HomePage", "/flights", "/BillHomePage", "/hotels", "/cabs", "/Holiday"];
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
    { id: "bus", label: "Bus", icon: Bus, path: "/HomePage" },
    { id: "billpayment", label: "Bill Payments", icon: Bus, path: "/BillHomePage" },
    { id: "flights", label: "Flights", icon: Plane, path: "/flights" },
    { id: "hotels", label: "Hotels", icon: Building2, path: "/hotels" },
    { id: "holidays", label: "Holidays", icon: Palmtree, path: "/Holiday" },
    { id: "cabs", label: "Cabs", icon: Car, path: "/cabs" },
  ];

  const getActiveTab = () => {
    if (location.pathname === "/" || location.pathname === "/HomePage") return "bus";
     if (location.pathname === "/BillHomePage") return "billpayment";
    if (location.pathname.startsWith("/results")) return "bus";
    if (location.pathname.startsWith("/flights")) return "flights";
    if (location.pathname.startsWith("/hotels")) return "hotels";
    if (location.pathname.startsWith("/Holiday")) return "holidays";
    if (location.pathname.startsWith("/cabs")) return "cabs";
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
        <div className="max-w-8xl mx-auto flex items-center justify-between px-4 sm:px-6 lg:px-8 h-16 sm:h-20">
          {/* LOGO */}
          <div onClick={() => navigate("/")} className="flex items-center cursor-pointer">
            <img
              src="/assets/Bobros_logo.png"
              alt="Bobros Logo"
              className={`h-auto transition-all duration-500 ease-in-out hover:scale-105
                w-[100px] sm:w-[140px] md:w-[180px] lg:w-[220px] xl:w-[250px]
                -ml-2 sm:-ml-1 md:-ml-0
                ${isSolid ? 'filter-none' : 'brightness-0 invert'}`}
            />
          </div>

          {/* CENTER TABS */}
          {(isSolid || !isDynamicPage) && (
            <div className="hidden lg:flex items-center gap-2 xl:gap-3 flex-1 justify-center">
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
                    className={`flex items-center gap-2 px-3 xl:px-4 py-2 rounded-full whitespace-nowrap text-sm font-semibold transition-all duration-300 border cursor-pointer ${
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
          <div className="hidden lg:flex items-center gap-3 xl:gap-4 flex-shrink-0">
            <button className={`flex items-center gap-2 px-3 xl:px-4 py-2 rounded-full border transition-all duration-300 cursor-pointer text-sm ${
              isSolid ? "border-gray-300 text-gray-700 hover:bg-gray-100" : "border-white/40 text-white hover:bg-white/10"
            }`}>
              <Briefcase className="w-4 h-4" />
              Business
            </button>

            <button className={`flex items-center gap-2 px-3 xl:px-4 py-2 whitespace-nowrap rounded-full border transition-all duration-300 cursor-pointer text-sm ${
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
                className={`flex items-center gap-2 px-3 xl:px-4 py-2 rounded-full border transition-all duration-300 cursor-pointer text-sm ${
                  isSolid ? "border-gray-300 text-gray-700 hover:bg-gray-100" : "border-white/40 text-white hover:bg-white/10"
                }`}
              >
                <User className="w-5 h-5" />
                {isLoggedIn ? <>Hi {user?.uname?.split(" ")[0]}</> : "Login/Signup"}
              </button>

              {/* GUEST DROPDOWN */}
              {!isLoggedIn && openDropdown && (
                <div className="absolute right-0 top-12 w-64 bg-white rounded-xl shadow-lg border border-gray-100 text-gray-700 overflow-hidden z-50">
                  <div className="px-4 py-3 bg-gray-50">
                    <p className="font-semibold text-gray-800">Hey Traveller</p>
                    <p className="text-sm text-gray-500">Get exclusive deals & Manage your trips</p>
                  </div>
                  <button onClick={() => { setOpenDropdown(false); setAuthPage("signin"); setOpenAuthModal(true); }} className="mx-4 my-3 w-[calc(100%-32px)] cursor-pointer bg-[#fd561e] text-white font-semibold py-2.5 rounded-lg ">Login / Sign Up</button>
                  <button onClick={() => { setOpenDropdown(false); setShowGuestBookings(true); }} className="w-full text-left px-4 py-3 border-b border-gray-200 hover:bg-gray-50 cursor-pointer hover:text-blue-500">My Bookings</button>
                  <button onClick={() => { setOpenDropdown(false); if (location.pathname.startsWith("/flights")) { setShowFlightPrintTicket(true); } else { setPrintTin(""); setShowPrintTicket(true); } }} className="w-full text-left px-4 py-3 border-b border-gray-200 hover:bg-gray-50 hover:text-blue-500 cursor-pointer">Print Ticket</button>
                  <button onClick={handleOpenCancel} className="w-full text-left px-4 py-3 hover:bg-gray-50 cursor-pointer hover:text-blue-500">Cancellation</button>
                </div>
              )}

              {/* LOGGED IN DROPDOWN */}
              {isLoggedIn && openDropdown && (
                <div className="absolute right-0 mt-3 w-56 bg-white rounded-xl shadow-lg border border-gray-100 text-gray-700 overflow-hidden z-50">
                  <button onClick={() => { setOpenDropdown(false); navigate("/my-bookings"); }} className="w-full text-left px-4 py-3 border-b border-gray-200 hover:bg-gray-50 hover:text-blue-500 cursor-pointer hover:text-blue-500">My Booking</button>
                  <button onClick={() => { setOpenDropdown(false); navigate("/my-account"); }} className="w-full text-left px-4 py-3 border-b border-gray-200 hover:bg-gray-50 cursor-pointer hover:text-blue-500">My Account</button>
                  <button onClick={handleOpenCancel} className="w-full text-left px-4 py-3 border-b border-gray-200 hover:bg-gray-50 cursor-pointer hover:text-blue-500">Cancellation</button>
                  <button onClick={() => { setOpenDropdown(false); if (location.pathname.startsWith("/flights")) { setShowFlightPrintTicket(true); } else { setPrintTin(""); setShowPrintTicket(true); } }} className="w-full text-left px-4 py-3 border-b border-gray-200 hover:bg-gray-50 cursor-pointer hover:text-blue-500">Print Ticket</button>
                  <button onClick={() => { setOpenDropdown(false); navigate("/my-profile"); }} className="w-full text-left px-4 py-3 border-b border-gray-200 hover:bg-gray-50 cursor-pointer hover:text-blue-500">My Profile</button>
                  <button onClick={handleLogout} className="w-full text-left px-4 py-3 hover:bg-gray-50 text-red-500 cursor-pointer ">Logout</button>
                </div>
              )}
            </div>
          </div>

          {/* Hamburger Menu Button */}
          <button 
            className={`lg:hidden p-2 rounded-lg transition-all duration-300 ${
              isSolid 
                ? "text-gray-800 hover:bg-gray-100" 
                : "text-white hover:bg-white/10"
            }`} 
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>

        {/* Mobile Menu - Side Drawer */}
        {mobileOpen && (
          <>
            <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setMobileOpen(false)} />
            <div className="fixed top-0 right-0 h-full w-[280px] sm:w-[320px] bg-white shadow-2xl z-50 lg:hidden overflow-y-auto">
              <div className="pt-16 pb-4">
                <button onClick={() => setMobileOpen(false)} className="absolute top-3 right-3 p-1.5 rounded-lg hover:bg-gray-100"><X size={18} /></button>
                
                {/* Tabs in Mobile */}
                <div className="flex flex-col gap-2 px-4">
                  {tabs.map((tab) => {
                    const Icon = tab.icon;
                    const active = activeTab === tab.id;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => {
                          navigate(tab.path);
                          setMobileOpen(false);
                        }}
                        className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border text-sm font-medium transition-all w-full ${
                          active
                            ? "bg-gradient-to-r from-[#FD561E] to-[#ff7b4a] text-white border-transparent"
                            : "border-gray-200 text-gray-700 hover:border-[#FD561E] hover:text-[#FD561E]"
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        <span>{tab.label}</span>
                      </button>
                    );
                  })}
                </div>
                
                <div className="border-t border-gray-200 my-3 mx-4"></div>
                
                <div className="px-4">
                  <button className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50 text-sm mb-2">
                    <Briefcase className="w-4 h-4" />
                    Business
                  </button>
                  
                  <button className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50 text-sm mb-4">
                    <MapPin className="w-4 h-4" />
                    For Travel Agent
                  </button>
                </div>
                
                <div className="border-t border-gray-200 my-3 mx-4"></div>
                
                {/* Mobile User Section - WITH DROPDOWN FOR BOTH GUEST AND LOGGED IN USERS */}
                <div ref={mobileDropdownRef} className="px-4">
                  <button 
                    onClick={() => setMobileDropdownOpen(!mobileDropdownOpen)} 
                    className="w-full flex items-center justify-between px-4 py-2.5 rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50"
                  >
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4" />
                      <span className="text-sm font-medium">{isLoggedIn ? `Hi ${user?.uname?.split(" ")[0]}` : "Login/Signup"}</span>
                    </div>
                    <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${mobileDropdownOpen ? "rotate-180" : ""}`} />
                  </button>
                  
                  {/* Dropdown for both guest and logged in users */}
                  {mobileDropdownOpen && (
                    <div className="mt-2 bg-white rounded-lg border border-gray-200 overflow-hidden">
                      {!isLoggedIn ? (
                        <>
                          <div className="px-4 py-2.5 bg-gray-50 border-b border-gray-200">
                            <p className="font-medium text-gray-800 text-sm">Hey Traveller</p>
                            <p className="text-xs text-gray-500">Get exclusive deals & Manage your trips</p>
                          </div>
                          <button onClick={() => { setMobileOpen(false); setMobileDropdownOpen(false); setAuthPage("signin"); setOpenAuthModal(true); }} className="w-full text-left px-4 py-2.5 bg-[#fd561e] text-white font-medium text-sm">Login / Sign Up</button>
                          <button onClick={() => { setMobileOpen(false); setMobileDropdownOpen(false); setShowGuestBookings(true); }} className="w-full text-left px-4 py-2.5 border-b border-gray-200 hover:bg-gray-50 text-sm">My Bookings</button>
                          <button onClick={() => { setMobileOpen(false); setMobileDropdownOpen(false); if (location.pathname.startsWith("/flights")) { setShowFlightPrintTicket(true); } else { setPrintTin(""); setShowPrintTicket(true); } }} className="w-full text-left px-4 py-2.5 border-b border-gray-200 hover:bg-gray-50 text-sm">Print Ticket</button>
                          <button onClick={() => { setMobileOpen(false); setMobileDropdownOpen(false); handleOpenCancel(); }} className="w-full text-left px-4 py-2.5 hover:bg-gray-50 text-sm">Cancellation</button>
                        </>
                      ) : (
                        <>
                          <button onClick={() => { setMobileOpen(false); setMobileDropdownOpen(false); navigate("/my-bookings"); }} className="w-full text-left px-4 py-2.5 border-b border-gray-200 hover:bg-gray-50 text-sm">My Booking</button>
                          <button onClick={() => { setMobileOpen(false); setMobileDropdownOpen(false); navigate("/my-account"); }} className="w-full text-left px-4 py-2.5 border-b border-gray-200 hover:bg-gray-50 text-sm">My Account</button>
                          <button onClick={() => { setMobileOpen(false); setMobileDropdownOpen(false); handleOpenCancel(); }} className="w-full text-left px-4 py-2.5 border-b border-gray-200 hover:bg-gray-50 text-sm">Cancellation</button>
                          <button onClick={() => { setMobileOpen(false); setMobileDropdownOpen(false); if (location.pathname.startsWith("/flights")) { setShowFlightPrintTicket(true); } else { setPrintTin(""); setShowPrintTicket(true); } }} className="w-full text-left px-4 py-2.5 border-b border-gray-200 hover:bg-gray-50 text-sm">Print Ticket</button>
                          <button onClick={() => { setMobileOpen(false); setMobileDropdownOpen(false); navigate("/my-profile"); }} className="w-full text-left px-4 py-2.5 border-b border-gray-200 hover:bg-gray-50 text-sm">My Profile</button>
                          <button onClick={handleLogout} className="w-full text-left px-4 py-2.5 hover:bg-gray-50 text-red-500 text-sm">Logout</button>
                        </>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </>
        )}

        {/* Auth Modal */}
        <AuthModal isOpen={openAuthModal} onClose={() => setOpenAuthModal(false)}>
          {authPage === "signin" && <SignIn closeModal={() => setOpenAuthModal(false)} openSignup={() => setAuthPage("signup")} openForgot={() => setAuthPage("forgot")} />}
          {authPage === "signup" && <SignupForm closeModal={() => setOpenAuthModal(false)} openSignin={() => setAuthPage("signin")} openVerifyOtp={(data) => { setSignupData(data); setAuthPage("verifyotp"); }} />}
          {authPage === "verifyotp" && <VerifyOTP signupData={signupData} closeModal={() => setOpenAuthModal(false)} />}
          {authPage === "forgot" && <ForgotPassword closeModal={() => setOpenAuthModal(false)} openSignin={() => setAuthPage("signin")} openResetPassword={(data) => { setResetData(data); setAuthPage("reset"); }} />}
          {authPage === "reset" && <ResetPassword resetData={resetData} closeModal={() => setOpenAuthModal(false)} openSignin={() => setAuthPage("signin")} />}
        </AuthModal>

        {/* Guest Bookings Modal */}
        {showGuestBookings && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl shadow-2xl p-6 sm:p-8 w-[90%] sm:w-[420px] mx-4 relative max-h-[90vh] overflow-y-auto">
              <button onClick={() => setShowGuestBookings(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-700">✕</button>
              <GuestBookings onClose={() => setShowGuestBookings(false)} />
            </div>
          </div>
        )}
      </nav>

       {showCancel && <CancellationCard onClose={() => setShowCancel(false)} />}
      {showPrintTicket && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl p-6 sm:p-8 w-[90%] sm:w-[420px] mx-4 relative">
            <button onClick={() => setShowPrintTicket(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-700">✕</button>
            <PrintTicketModal onClose={() => setShowPrintTicket(false)} prefillTin={printTin} />
          </div>
        </div>
      )}
      {showFlightPrintTicket && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl p-6 sm:p-8 w-[90%] sm:w-[440px] mx-4 relative">
            <button onClick={() => setShowFlightPrintTicket(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-700">✕</button>
            <PrintFlightTicketModal onClose={() => setShowFlightPrintTicket(false)} />
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;