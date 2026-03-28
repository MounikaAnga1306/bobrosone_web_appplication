// src/components/SidebarLayout.jsx
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { 
  User, Calendar, Receipt, LogOut, XCircle, Printer, 
  Home, Lock, UserCircle, Gift, ChevronRight, ChevronDown,
  Bus, Plane, Building2, Palmtree, Car
} from "lucide-react";

const SidebarLayout = ({ children, isLoggedIn, user, onLogout, onOpenAuthModal, onOpenCancel, onOpenPrintTicket, onOpenForgotPassword }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [expandedSections, setExpandedSections] = useState({
    "MAIN MENU": true,
    "MY ACCOUNT": true,
    "MY BOOKINGS": false,
    "SERVICES": false
  });

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const handleNavigation = (path) => {
    navigate(path);
  };

  const handleLogout = () => {
    onLogout();
    navigate("/");
  };

  // Services handlers
  const handleCancel = () => {
    if (onOpenCancel) {
      onOpenCancel();
    }
  };

  const handlePrintTicket = () => {
    if (onOpenPrintTicket) {
      onOpenPrintTicket();
    }
  };

  const handleAuth = () => {
    if (onOpenAuthModal) {
      onOpenAuthModal();
    }
  };

  const handleForgotPassword = () => {
    if (onOpenForgotPassword) {
      onOpenForgotPassword();
    }
  };

  const isActive = (path) => {
    if (!path) return false;
    if (path === "/my-account" && location.pathname === "/my-account") return true;
    if (path === "/my-profile" && location.pathname === "/my-profile") return true;
    if (path === "/my-bookings" && location.pathname === "/my-bookings") return true;
    if (path === "/reset-password" && location.pathname === "/reset-password") return true;
    if (path === "/" && location.pathname === "/") return true;
    if (path.includes("?") && location.pathname === "/my-bookings") return true;
    return location.pathname === path;
  };

  // Menu sections
  const menuSections = [
    {
      title: "MAIN MENU",
      icon: Home,
      items: [
        { label: "Home", icon: Home, path: "/", showAlways: true }
      ]
    },
    {
      title: "MY ACCOUNT",
      icon: User,
      items: [
        { label: "My Profile", icon: UserCircle, path: "/my-profile", requiresAuth: true },
        { label: "My Account", icon: Receipt, path: "/my-account", requiresAuth: true },
        { label: "Reset Password", icon: Lock, action: handleForgotPassword, requiresAuth: true }
      ]
    },
    {
      title: "MY BOOKINGS",
      icon: Calendar,
      items: [
        { label: "Bus Bookings", icon: Bus, path: "/my-bookings?type=bus", requiresAuth: true },
        { label: "Flight Bookings", icon: Plane, path: "/my-bookings?type=flight", requiresAuth: true },
        { label: "Hotel Bookings", icon: Building2, path: "/my-bookings?type=hotel", requiresAuth: true },
        { label: "Holiday Bookings", icon: Palmtree, path: "/my-bookings?type=holiday", requiresAuth: true },
        { label: "Cab Bookings", icon: Car, path: "/my-bookings?type=cab", requiresAuth: true }
      ]
    },
    {
      title: "SERVICES",
      icon: Gift,
      items: [
        { label: "Cancellation", icon: XCircle, action: handleCancel, showAlways: true },
        { label: "Print Ticket", icon: Printer, action: handlePrintTicket, showAlways: true },
        { label: "Rewards & Offers", icon: Gift, path: "/rewards", requiresAuth: true }
      ]
    }
  ];

  // Filter items based on login status
  const getFilteredSections = () => {
    return menuSections.map(section => ({
      ...section,
      items: section.items.filter(item => {
        if (item.showAlways) return true;
        if (item.requiresAuth && !isLoggedIn) return false;
        return true;
      })
    })).filter(section => section.items.length > 0);
  };

  const filteredSections = getFilteredSections();

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#f5f7fa", paddingTop: "80px" }}>
      {/* Sidebar - Fixed on left */}
      <div style={{
        width: "280px",
        background: "white",
        borderRight: "1px solid #e5e7eb",
        position: "fixed",
        top: "80px",
        left: 0,
        bottom: 0,
        display: "flex",
        flexDirection: "column",
        zIndex: 40,
        boxShadow: "0 4px 12px rgba(0,0,0,0.05)"
      }}>
        {/* User Info Section */}
        <div style={{ flexShrink: 0 }}>
          {isLoggedIn && user ? (
            <div style={{
              padding: "20px",
              borderBottom: "1px solid #f0f0f0",
              background: "linear-gradient(135deg, #fff5f0 0%, #ffffff 100%)"
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <div style={{
                  width: "48px",
                  height: "48px",
                  borderRadius: "50%",
                  background: "linear-gradient(135deg, #fd561e, #ff8c42)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "20px",
                  fontWeight: "bold",
                  color: "white"
                }}>
                  {user?.uname?.[0]?.toUpperCase() || "U"}
                </div>
                <div>
                  <div style={{ fontSize: "14px", fontWeight: "600", color: "#1a1a2e" }}>
                    {user?.uname || "User"}
                  </div>
                  <div style={{ fontSize: "11px", color: "#888" }}>
                    {user?.uemail || user?.umob || ""}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div style={{
              padding: "20px",
              borderBottom: "1px solid #f0f0f0",
              textAlign: "center",
              background: "linear-gradient(135deg, #fff5f0 0%, #ffffff 100%)"
            }}>
              <div style={{
                width: "48px",
                height: "48px",
                borderRadius: "50%",
                background: "#f0f0f0",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "20px",
                margin: "0 auto 12px"
              }}>
                👤
              </div>
              <div style={{ fontSize: "13px", color: "#666", marginBottom: "12px" }}>
                Login to manage your bookings
              </div>
              <button
                onClick={handleAuth}
                style={{
                  width: "100%",
                  padding: "10px",
                  background: "linear-gradient(135deg, #fd561e, #ff8c42)",
                  color: "white",
                  border: "none",
                  borderRadius: "8px",
                  fontSize: "13px",
                  fontWeight: "600",
                  cursor: "pointer"
                }}
              >
                Login / Sign Up
              </button>
            </div>
          )}
        </div>

        {/* Menu Items - Scrollable */}
        <div style={{
          flex: 1,
          overflowY: "auto",
          padding: "8px 0"
        }}>
          {filteredSections.map((section, idx) => (
            <div key={idx}>
              <button
                onClick={() => toggleSection(section.title)}
                style={{
                  width: "100%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "12px 20px",
                  background: "transparent",
                  border: "none",
                  cursor: "pointer",
                  transition: "all 0.2s"
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = "#f9f9f9"}
                onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <section.icon size={18} color="#888" />
                  <span style={{
                    fontSize: "11px",
                    fontWeight: "600",
                    color: "#888",
                    textTransform: "uppercase",
                    letterSpacing: "0.8px"
                  }}>
                    {section.title}
                  </span>
                </div>
                {expandedSections[section.title] ? (
                  <ChevronDown size={14} color="#aaa" />
                ) : (
                  <ChevronRight size={14} color="#aaa" />
                )}
              </button>

              {expandedSections[section.title] && (
                <div style={{ paddingLeft: "32px", paddingBottom: "8px" }}>
                  {section.items.map((item, itemIdx) => (
                    <button
                      key={itemIdx}
                      onClick={() => {
                        if (item.path) {
                          handleNavigation(item.path);
                        } else if (item.action) {
                          item.action();
                        }
                      }}
                      style={{
                        width: "100%",
                        display: "flex",
                        alignItems: "center",
                        gap: "12px",
                        padding: "8px 16px",
                        //background: isActive(item.path) ? "#fff5f0" : "transparent",
                        border: "none",
                        borderRadius: "6px",
                        marginBottom: "2px",
                        cursor: "pointer",
                        transition: "all 0.2s"
                      }}
                      onMouseEnter={(e) => {
                        if (!isActive(item.path)) {
                          e.currentTarget.style.background = "#f9f9f9";
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!isActive(item.path)) {
                          e.currentTarget.style.background = "transparent";
                        }
                      }}
                    >
                      <item.icon size={14} color={isActive(item.path) ? "#928f8e" : "#888"} />
                      <span style={{
                        fontSize: "13px",
                        fontWeight: isActive(item.path) ? "400" : "400",
                        color: isActive(item.path) ? "#555" : "#555"
                      }}>
                        {item.label}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Logout Button - Only at bottom */}
        {isLoggedIn && (
          <div style={{ flexShrink: 0 }}>
            <button
              onClick={handleLogout}
              style={{
                width: "100%",
                display: "flex",
                alignItems: "center",
                gap: "12px",
                padding: "14px 20px",
                background: "transparent",
                border: "none",
                borderTop: "1px solid #f0f0f0",
                cursor: "pointer",
                transition: "all 0.2s",
                color: "#fd561e"
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = "#fef2f2"}
              onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
            >
              <LogOut size={18} />
              <span style={{ fontSize: "14px", fontWeight: "500" }}>Logout</span>
            </button>
          </div>
        )}
      </div>

      {/* Main Content */}
      <div style={{
        marginLeft: "280px",
        flex: 1,
        minHeight: "calc(100vh - 80px)"
      }}>
        {children}
      </div>
    </div>
  );
};

export default SidebarLayout;