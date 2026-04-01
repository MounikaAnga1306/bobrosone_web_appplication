// src/components/SidebarLayout.jsx
import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  User, Calendar, Receipt, LogOut, XCircle, Printer,
  Home, Lock, UserCircle, Gift, ChevronRight, ChevronDown,
  Bus, Plane, Building2, Palmtree, Car, X
} from "lucide-react";

const SidebarLayout = ({ children, isLoggedIn, user, onLogout, onOpenAuthModal, onOpenCancel, onOpenPrintTicket, onOpenForgotPassword }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobile, setIsMobile] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [expandedSections, setExpandedSections] = useState({
    "MAIN MENU": true,
    "MY ACCOUNT": true,
    "MY BOOKINGS": false,
    "SERVICES": false
  });

  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (mobile) {
        setIsSidebarOpen(false);
      } else {
        setIsSidebarOpen(true);
      }
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);

    return () => {
      window.removeEventListener("resize", checkMobile);
    };
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (isMobile && isSidebarOpen) {
        const sidebar = document.querySelector('.sidebar-container');
        const openBtn = document.querySelector('.sidebar-open-btn');
        if (
          sidebar && !sidebar.contains(e.target) &&
          (!openBtn || !openBtn.contains(e.target))
        ) {
          setIsSidebarOpen(false);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMobile, isSidebarOpen]);

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const handleNavigation = (path) => {
    navigate(path);
    if (isMobile) {
      setIsSidebarOpen(false);
    }
  };

  const handleLogout = () => {
    onLogout();
    navigate("/");
    if (isMobile) {
      setIsSidebarOpen(false);
    }
  };

  const handleCancel = () => {
    if (onOpenCancel) {
      onOpenCancel();
      if (isMobile) setIsSidebarOpen(false);
    }
  };

  const handlePrintTicket = () => {
    if (onOpenPrintTicket) {
      onOpenPrintTicket();
      if (isMobile) setIsSidebarOpen(false);
    }
  };

  const handleAuth = () => {
    if (onOpenAuthModal) {
      onOpenAuthModal();
      if (isMobile) setIsSidebarOpen(false);
    }
  };

  const handleForgotPassword = () => {
    if (onOpenForgotPassword) {
      onOpenForgotPassword();
      if (isMobile) setIsSidebarOpen(false);
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

  const responsiveStyles = `
    @keyframes spin {
      to { transform: rotate(360deg); }
    }
    @media (min-width: 768px) {
      .main-content {
        margin-left: 280px;
      }
    }
    @media (max-width: 767px) {
      .sidebar-container {
        transform: translateX(-100%);
      }
      .sidebar-container.open {
        transform: translateX(0);
      }
      .main-content {
        margin-left: 0 !important;
      }
    }
  `;

  return (
    <>
      <style>{responsiveStyles}</style>

      {/* Overlay */}
      {isMobile && isSidebarOpen && (
        <div
          onClick={() => setIsSidebarOpen(false)}
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0,0,0,0.5)",
            zIndex: 998,
            transition: "all 0.3s ease"
          }}
        />
      )}

      {isMobile && !isSidebarOpen && (
        <button
          className="sidebar-open-btn"
          onClick={() => setIsSidebarOpen(true)}
          style={{
            position: "fixed",
            top: "17%",
            left: 0,
            transform: "translateY(-50%)",
            zIndex: 997,
            background:"gray",
            border: "none",
            borderRadius: "0 8px 8px 0",
            width: "15px",
            height: "38px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            
          }}
        >
          <ChevronRight size={80} strokeWidth={3.5} color="Black" />
        </button>
      )}

      <div style={{ display: "flex", minHeight: "100vh", background: "#f5f7fa", paddingTop: "80px" }}>

        {/* Sidebar */}
        <div
          className={`sidebar-container ${isSidebarOpen ? 'open' : ''}`}
          style={{
            width: "280px",
            background: "white",
            borderRight: "1px solid #e5e7eb",
            position: "fixed",
            top: "80px",
            left: 0,
            bottom: 0,
            display: "flex",
            flexDirection: "column",
            zIndex: 999,
            boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
            transition: "transform 0.3s ease-in-out",
            overflowY: "auto"
          }}
        >
          {isMobile && (
            <button
              onClick={() => setIsSidebarOpen(false)}
              style={{
                position: "absolute",
                top: "10px",
                right: "10px",
                width: "30px",
                height: "30px",
                background: "#fff0eb",
                border: "none",
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                zIndex: 1000
              }}
            >
              <X size={16} color="#fd561e" />
            </button>
          )}

          {/* User Info Section */}
          <div style={{ flexShrink: 0 }}>
            {isLoggedIn && user ? (
              <div style={{
                padding: "20px",
                paddingRight: isMobile ? "48px" : "20px",
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
                    color: "white",
                    flexShrink: 0
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
                paddingRight: isMobile ? "48px" : "20px",
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

          {/* Menu Items */}
          <div style={{ flex: 1, overflowY: "auto", padding: "8px 0" }}>
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
                          border: "none",
                          borderRadius: "6px",
                          marginBottom: "2px",
                          cursor: "pointer",
                          transition: "all 0.2s",
                          background: isActive(item.path) ? "#fff5f0" : "transparent"
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
                        <item.icon size={14} color={isActive(item.path) ? "#fd561e" : "#888"} />
                        <span style={{
                          fontSize: "13px",
                          fontWeight: isActive(item.path) ? "500" : "400",
                          color: isActive(item.path) ? "#fd561e" : "#555"
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
        <div
          className="main-content"
          style={{
            flex: 1,
            minHeight: "calc(100vh - 80px)",
            width: "100%",
            transition: "margin-left 0.3s ease-in-out"
          }}
        >
          {children}
        </div>
      </div>
    </>
  );
};

export default SidebarLayout;