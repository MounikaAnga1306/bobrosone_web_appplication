import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, Phone } from "lucide-react";
import logo from "@/assets/logo1.png";

const navLinks = [
  { path: "/", label: "Home" },
  { path: "/about", label: "About Us" },
  { path: "/event", label: "Events" },
  { path: "/notifications", label: "Notifications" },
  { path: "/academics", label: "Academics" },
  { path: "/activities", label: "Activities" },
  { path: "/contact", label: "Contact" },
];

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setIsOpen(false);
  }, [location]);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? "gradient-navy shadow-xl py-2"
            : "bg-primary/95 backdrop-blur-sm py-3"
        }`}
      >
        <div className="container mx-auto flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <img
              src={logo}
              alt="Oak Grove International School"
              className="h-12 sm:h-14 lg:h-16 w-auto p-1 transition-transform duration-300 group-hover:scale-110"
            />
            <div>
              <h1 className="text-primary-foreground font-heading font-bold text-xl sm:text-2xl lg:text-[28px] leading-tight">
                Oak Grove
              </h1>
              <p className="text-secondary text-xs sm:text-sm lg:text-[18px] font-medium tracking-wide">
                International School
              </p>
            </div>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`px-4 py-2 rounded-full text-sm font-semibold transition-all duration-300 ${
                  location.pathname === link.path
                    ? "bg-accent text-accent-foreground"
                    : "text-primary-foreground/80 hover:text-primary-foreground hover:bg-primary-foreground/10"
                }`}
              >
                {link.label}
              </Link>
            ))}
            <a href="tel:9963883881" className="btn-accent ml-4 text-sm py-2">
              <Phone className="w-4 h-4" /> Call Us
            </a>
          </div>

          {/* Mobile Toggle */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="lg:hidden text-primary-foreground p-2 z-50 relative"
            aria-label="Toggle menu"
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </nav>

      {/* Mobile Sidebar Menu */}
      <div
        className={`fixed inset-0 z-40 transition-all duration-300 lg:hidden ${
          isOpen ? "visible opacity-100" : "invisible opacity-0"
        }`}
      >
        {/* Backdrop */}
        <div
          className={`absolute inset-0 bg-black/50 transition-opacity duration-300 ${
            isOpen ? "opacity-100" : "opacity-0"
          }`}
          onClick={() => setIsOpen(false)}
        />

        {/* Sidebar */}
        <div
          className={`absolute top-0 right-0 h-full w-80 max-w-[85vw] bg-white shadow-2xl transition-transform duration-300 ease-out ${
            isOpen ? "translate-x-0" : "translate-x-full"
          }`}
        >
          {/* Sidebar Header */}
          <div className="gradient-navy p-6">
            <div className="flex items-center gap-3">
              <img
                src={logo}
                alt="Oak Grove International School"
                className="h-12 w-auto"
              />
              <div>
                <h2 className="text-white font-heading font-bold text-xl">
                  Oak Grove
                </h2>
                <p className="text-secondary/80 text-sm">
                  International School
                </p>
              </div>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="flex flex-col gap-1 p-4">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`px-4 py-3 rounded-lg text-base font-semibold transition-all duration-200 ${
                  location.pathname === link.path
                    ? "bg-primary/10 text-primary"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
                onClick={() => setIsOpen(false)}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Call Button */}
          <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200">
            <a
              href="tel:9963883881"
              className="btn-accent w-full justify-center text-base py-3"
            >
              <Phone className="w-5 h-5" /> Call Us Now
            </a>
          </div>
        </div>
      </div>
    </>
  );
};

export default Navbar;