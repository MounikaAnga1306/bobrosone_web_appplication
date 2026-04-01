// src/components/GuestSidebarLayout.jsx
import React, { useState, useEffect } from "react";
import { Calendar, Printer, XCircle, ChevronRight, X, LogIn, User } from "lucide-react";

const NAV_ITEMS = [
  { key: "bookings", label: "My Bookings",  icon: Calendar },
  { key: "print",    label: "Print Ticket", icon: Printer  },
  { key: "cancel",   label: "Cancellation", icon: XCircle  },
];

const SIDEBAR_W = 260;
const NAVBAR_H  = 80; // match your Navbar height (h-16=64, h-20=80)

const GuestSidebarLayout = ({
  children,
  onOpenAuthModal,
  onOpenCancel,
  onOpenPrintTicket,
  activePage = "bookings",
}) => {
  const [isMobile, setIsMobile] = useState(false);
  const [open, setOpen]         = useState(true);

  useEffect(() => {
    const check = () => {
      const m = window.innerWidth < 768;
      setIsMobile(m);
      setOpen(!m);
    };
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  useEffect(() => {
    if (!isMobile) return;
    const h = (e) => {
      const sb  = document.getElementById("g-sb");
      const tab = document.getElementById("g-tab");
      if (open && sb && !sb.contains(e.target) && (!tab || !tab.contains(e.target)))
        setOpen(false);
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, [isMobile, open]);

  const closeMob = () => { if (isMobile) setOpen(false); };

  const handleNav = (key) => {
    if (key === "cancel") { onOpenCancel?.();      closeMob(); }
    if (key === "print")  { onOpenPrintTicket?.(); closeMob(); }
  };

  return (
    <>
      {/* dark overlay — only on mobile, sits BELOW navbar */}
      {isMobile && open && (
        <div
          onClick={() => setOpen(false)}
          style={{
            position: "fixed", top: NAVBAR_H, left: 0, right: 0, bottom: 0,
            background: "rgba(0,0,0,0.4)",
            zIndex: 40,   // navbar is z-50 in Tailwind → this stays below it
          }}
        />
      )}

      {/* pull-tab (mobile, closed) */}
      {isMobile && !open && (
        <button id="g-tab" onClick={() => setOpen(true)}
          style={{
            position: "fixed", top: "30%", left: 0, zIndex: 41,
            background: "gray", border: "none",
            borderRadius: "0 8px 8px 0",
            width: 16, height: 40,
            marginTop:"-123px",
            display: "flex", alignItems: "center", justifyContent: "center",
            cursor: "pointer", 
          }}
        >
          <ChevronRight size={13} color="#fff" strokeWidth={3} />
        </button>
      )}

      {/* sidebar */}
      <div id="g-sb" style={{
        width: SIDEBAR_W,
        background: "#fff",
        borderRight: "1px solid #f0f0f0",
        position: "fixed",
        top: NAVBAR_H,    // ← starts BELOW navbar, not behind it
        left: 0, bottom: 0,
        zIndex: 41,       // below Tailwind z-50 navbar, above overlay z-40
        display: "flex", flexDirection: "column",
        boxShadow: isMobile ? "4px 0 20px rgba(0,0,0,.10)" : "none",
        transform: (!isMobile || open) ? "translateX(0)" : "translateX(-100%)",
        transition: "transform .3s cubic-bezier(.4,0,.2,1)",
        overflowY: "auto",
      }}>

        {/* mobile close */}
        {isMobile && (
          <button onClick={() => setOpen(false)} style={{
            position: "absolute", top: 10, right: 10,
            width: 28, height: 28, background: "#fff0eb",
            border: "none", borderRadius: "50%",
            display: "flex", alignItems: "center", justifyContent: "center",
            cursor: "pointer", zIndex: 10,
          }}>
            <X size={14} color="#fd561e" />
          </button>
        )}

        {/* guest user block */}
        <div style={{
          padding: "20px 20px 16px",
          paddingRight: isMobile ? 44 : 20,
          borderBottom: "1px solid #f5f5f5",
          background: "linear-gradient(160deg,#fff6f3 0%,#fff 60%)",
        }}>
          <div style={{
            width: 46, height: 46, borderRadius: "50%",
            background: "#f3f4f6", border: "2px dashed #e5e7eb",
            display: "flex", alignItems: "center", justifyContent: "center",
            marginBottom: 10,
          }}>
            <User size={20} color="#9ca3af" />
          </div>
          <div style={{ fontSize: 14, fontWeight: 700, color: "#1a1a2e", marginBottom: 2 }}>
            Hey Traveller!
          </div>
          <div style={{ fontSize: 11, color: "#9ca3af", marginBottom: 14, lineHeight: 1.5 }}>
            Login to unlock deals &amp; manage all your trips
          </div>
          <button
            onClick={() => { onOpenAuthModal?.(); closeMob(); }}
            style={{
              width: "100%", padding: "9px 0",
              background: "linear-gradient(135deg,#fd561e,#ff8c42)",
              color: "#fff", border: "none", borderRadius: 8,
              fontSize: 13, fontWeight: 600, cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
            }}
          >
            <LogIn size={14} /> Login / Sign Up
          </button>
        </div>

        {/* nav */}
        <nav style={{ flex: 1, paddingTop: 8 }}>
          <div style={{
            padding: "10px 20px 5px",
            fontSize: 10, fontWeight: 700,
            color: "#c5c9d4", letterSpacing: "1px", textTransform: "uppercase",
          }}>
            Guest Options
          </div>
          {NAV_ITEMS.map(({ key, label, icon: Icon }) => {
            const active = activePage === key;
            return (
              <button key={key} onClick={() => handleNav(key)} style={{
                width: "100%", display: "flex", alignItems: "center", gap: 12,
                padding: "11px 20px",
                background: active ? "#fff5f0" : "transparent",
                border: "none",
                borderLeft: `3px solid ${active ? "#fd561e" : "transparent"}`,
                cursor: "pointer", transition: "background .15s",
              }}
                onMouseEnter={e => { if (!active) e.currentTarget.style.background = "#fafafa"; }}
                onMouseLeave={e => { if (!active) e.currentTarget.style.background = active ? "#fff5f0" : "transparent"; }}
              >
                <Icon size={16} color={active ? "#fd561e" : "#9ca3af"} strokeWidth={active ? 2.2 : 1.8} />
                <span style={{ fontSize: 13, fontWeight: active ? 600 : 400, color: active ? "#fd561e" : "#555" }}>
                  {label}
                </span>
              </button>
            );
          })}
        </nav>

        <div style={{
          padding: "12px 20px", borderTop: "1px solid #f5f5f5",
          fontSize: 11, color: "gray", lineHeight: 1.5,
        }}>
          Browsing as guest · Login for full access
        </div>
      </div>

      {/* main content */}
      <div style={{
        marginLeft: isMobile ? 0 : SIDEBAR_W,
        minHeight: `calc(100vh - ${NAVBAR_H}px)`,
        paddingTop: NAVBAR_H,
        background: "#f5f7fa",
        transition: "margin-left .3s cubic-bezier(.4,0,.2,1)",
      }}>
        {children}
      </div>
    </>
  );
};

export default GuestSidebarLayout;