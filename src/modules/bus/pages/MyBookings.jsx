// src/modules/bus/pages/MyBookings.jsx
import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import PrintTicketModal from "./PrintTicketModal";
import CancellationCard from "./CancellationCard";
import ForgotPassword from "./ForgotPassword";
import ResetPassword from "./ResetPassword";
import SignIn from "./SignIn";
import SignupForm from "./SignUpForm";
import SidebarLayout from "../pages/SidebarLayout";
import AuthModal from "./AuthModal";
import { Calendar, Bus, Ticket } from "lucide-react";

const MyBookings = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showPrint, setShowPrint] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  
  // Modal States
  const [openAuthModal, setOpenAuthModal] = useState(false);
  const [authPage, setAuthPage] = useState("signin");
  const [signupData, setSignupData] = useState(null);
  const [resetData, setResetData] = useState(null);
  const [showCancel, setShowCancel] = useState(false);
  const [printTin, setPrintTin] = useState("");
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [showResetPasswordModal, setShowResetPasswordModal] = useState(false);

  const storedUser = JSON.parse(localStorage.getItem("user"));
  const uid = storedUser?.user?.uid || "";
  const mobile = storedUser?.user?.umob || "";
  const user = storedUser?.user || storedUser || {};

  // Login State
  const [isLoggedIn, setIsLoggedIn] = useState(localStorage.getItem("isLoggedIn") === "true");

  // Check login status on mount and when storage changes
  useEffect(() => {
    const checkLoginStatus = () => {
      const loggedIn = localStorage.getItem("isLoggedIn") === "true";
      setIsLoggedIn(loggedIn);
      if (!loggedIn) {
        navigate("/");
      }
    };
    
    checkLoginStatus();
    window.addEventListener("storage", checkLoginStatus);
    
    return () => {
      window.removeEventListener("storage", checkLoginStatus);
    };
  }, [navigate]);

  useEffect(() => {
    if (!uid && !mobile && !isLoggedIn) {
      navigate("/");
      return;
    }
    if (isLoggedIn) {
      fetchBookings();
    }
  }, [isLoggedIn]);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const res = await axios.post("/myBookings", {
        uid: String(uid),
        mobile: String(mobile)
      });
      if (res.data?.success) {
        setBookings(res.data.bookings || []);
      } else {
        setError("Failed to load bookings.");
      }
    } catch (err) {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("isLoggedIn");
    setIsLoggedIn(false);
    // Force storage event to update other components
    window.dispatchEvent(new Event("storage"));
    // Navigate to home
    navigate("/");
  };

  const handleOpenCancel = () => {
    setShowCancel(true);
  };

  const handleOpenPrintTicket = () => {
    setPrintTin("");
    setShowPrint(true);
  };

  const handleOpenAuth = () => {
    setAuthPage("signin");
    setOpenAuthModal(true);
  };

  const handleCloseAuth = () => {
    setOpenAuthModal(false);
    setAuthPage("signin");
  };

  const handleOpenForgotPassword = () => {
    setOpenAuthModal(false);
    setShowForgotPassword(true);
  };

  const handleCloseForgotPassword = () => {
    setShowForgotPassword(false);
  };

  const handleOpenResetPassword = (data) => {
    setResetData(data);
    setShowForgotPassword(false);
    setShowResetPasswordModal(true);
  };

  const handleCloseResetPassword = () => {
    setShowResetPasswordModal(false);
  };

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", background: "#f5f7fa", display: "flex", alignItems: "center", justifyContent: "center", paddingTop: "80px" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ width: "48px", height: "48px", border: "4px solid #fd561e", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 0.8s linear infinite", margin: "0 auto 16px" }}></div>
          <p style={{ color: "#666", fontSize: "15px" }}>Fetching your trips...</p>
        </div>
      </div>
    );
  }

  if (!isLoggedIn) {
    return null;
  }

  return (
    <>
      <SidebarLayout
        isLoggedIn={isLoggedIn}
        user={user}
        onLogout={handleLogout}
        onOpenAuthModal={handleOpenAuth}
        onOpenCancel={handleOpenCancel}
        onOpenPrintTicket={handleOpenPrintTicket}
        onOpenForgotPassword={handleOpenForgotPassword}
      >
        <div style={{ padding: "24px 32px" }}>
          {/* Page Header */}
          <div style={{ marginBottom: "28px" }}>
            <h1 style={{ fontSize: "26px", fontWeight: "700", color: "#1a1a2e", marginBottom: "6px" }}>
              My Bookings
            </h1>
            <p style={{ color: "#666", fontSize: "14px" }}>
              {bookings.length} booking{bookings.length !== 1 ? "s" : ""} found
            </p>
          </div>

          {error && (
            <div style={{
              background: "#fff1f0",
              border: "1px solid #ffccc7",
              borderRadius: "12px",
              padding: "14px 18px",
              marginBottom: "20px",
              color: "#cf1322",
              fontSize: "14px"
            }}>
              {error}
            </div>
          )}

          {bookings.length === 0 && !error ? (
            <div style={{
              background: "white",
              borderRadius: "20px",
              boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
              padding: "80px 20px",
              textAlign: "center",
              border: "1px solid #f0f0f0"
            }}>
              <div style={{ fontSize: "64px", marginBottom: "16px" }}>🚌</div>
              <h3 style={{ fontSize: "20px", color: "#333", marginBottom: "8px" }}>No trips yet!</h3>
              <p style={{ color: "#888", fontSize: "14px", marginBottom: "24px" }}>Book your first bus ticket and travel with ease.</p>
              <button
                onClick={() => navigate("/")}
                style={{
                  background: "linear-gradient(135deg, #fd561e, #ff8c42)",
                  color: "white",
                  border: "none",
                  borderRadius: "12px",
                  padding: "12px 32px",
                  fontSize: "14px",
                  fontWeight: "600",
                  cursor: "pointer"
                }}
              >
                Book a Ticket
              </button>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
              {bookings.map((booking, index) => (
                <BookingCard 
                  key={index} 
                  booking={booking} 
                  onPrint={(booking) => {
                    setSelectedBooking(booking);
                    setShowPrint(true);
                  }}
                />
              ))}
            </div>
          )}
        </div>
      </SidebarLayout>

      {/* Cancellation Modal */}
      {showCancel && (
        <CancellationCard onClose={() => setShowCancel(false)} />
      )}

      {/* Print Modal */}
      {showPrint && (
        <div style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0,0,0,0.5)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 9999
        }}>
          <div style={{
            background: "white",
            borderRadius: "20px",
            padding: "32px",
            width: "460px",
            position: "relative",
            maxWidth: "90%"
          }}>
            <button
              onClick={() => setShowPrint(false)}
              style={{
                position: "absolute",
                top: "16px",
                right: "16px",
                background: "none",
                border: "none",
                fontSize: "20px",
                cursor: "pointer",
                color: "#999"
              }}
            >✕</button>
            <PrintTicketModal
              onClose={() => setShowPrint(false)}
              prefillTin={selectedBooking?.tin_ticket || selectedBooking?.tin || ""}
            />
          </div>
        </div>
      )}

      {/* Sign In / Sign Up Modal */}
      <AuthModal isOpen={openAuthModal}>
        {authPage === "signin" ? (
          <SignIn
            closeModal={handleCloseAuth}
            openSignup={() => setAuthPage("signup")}
            openForgot={() => {
              handleCloseAuth();
              handleOpenForgotPassword();
            }}
          />
        ) : (
          <SignupForm
            closeModal={handleCloseAuth}
            openSignin={() => setAuthPage("signin")}
            openVerifyOtp={(data) => {
              setSignupData(data);
              handleCloseAuth();
            }}
          />
        )}
      </AuthModal>

      {/* Forgot Password Modal */}
      <AuthModal isOpen={showForgotPassword}>
        <ForgotPassword
          closeModal={handleCloseForgotPassword}
          openSignin={() => {
            handleCloseForgotPassword();
            handleOpenAuth();
          }}
          openResetPassword={handleOpenResetPassword}
        />
      </AuthModal>

      {/* Reset Password Modal */}
      <AuthModal isOpen={showResetPasswordModal}>
        <ResetPassword
          resetData={resetData}
          closeModal={handleCloseResetPassword}
          openSignin={() => {
            handleCloseResetPassword();
            handleOpenAuth();
          }}
        />
      </AuthModal>
    </>
  );
};

// Booking Card Component
const BookingCard = ({ booking, onPrint }) => {
  const [hovered, setHovered] = useState(false);

  const ptripParts = (booking.ptrip || "").split(",").map(s => s.trim());
  const source = ptripParts[0] || "—";
  const destination = ptripParts[1] || "—";
  const doj = booking.pdoj || "—";
  const ticketId = booking.tin_ticket || booking.tin || "—";
  const pname = booking.pname || "Guest";

  const getTotalFare = () => {
    if (booking.totalfare) return booking.totalfare;
    if (booking.tcost) return booking.tcost;
    if (booking.total_amount) return booking.total_amount;
    if (booking.fare) return booking.fare;
    return "—";
  };

  const totalFare = getTotalFare();

  const formatDate = (d) => {
    if (!d || d === "—") return "—";
    try {
      const cleaned = d.toString().replace(" ", "T");
      const date = new Date(cleaned);
      if (isNaN(date.getTime())) return d;
      return date.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
    } catch { return d; }
  };

  const rawStatus = booking.status?.trim();
  const status = rawStatus || "Confirmed";

  const statusStyles = {
    Confirmed: { bg: "#f0fdf4", text: "#16a34a", dot: "#22c55e" },
    Cancelled: { bg: "#fff1f0", text: "#dc2626", dot: "#ef4444" },
    Pending: { bg: "#fffbeb", text: "#d97706", dot: "#f59e0b" },
  };
  const sc = statusStyles[status] || statusStyles["Confirmed"];

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: "white",
        borderRadius: "20px",
        boxShadow: hovered ? "0 8px 32px rgba(0,0,0,0.12)" : "0 1px 3px rgba(0,0,0,0.1)",
        overflow: "hidden",
        transition: "all 0.3s ease",
        border: "1px solid #f0f0f0"
      }}
    >
      {/* Status Bar */}
      <div style={{
        background: sc.bg,
        padding: "10px 20px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        borderBottom: "1px solid #f0f0f0"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <Bus size={16} color={sc.text} />
          <span style={{ fontSize: "12px", color: "#666" }}>
            Booked on {formatDate(booking.bdat)}
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: sc.dot }}></div>
          <span style={{ fontSize: "12px", fontWeight: "600", color: sc.text }}>{status}</span>
        </div>
      </div>

      {/* Route */}
      <div style={{ padding: "20px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px" }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: "11px", color: "#888", marginBottom: "4px" }}>FROM</div>
            <div style={{ fontSize: "18px", fontWeight: "700", color: "#1a1a2e" }}>{source}</div>
          </div>
          <div style={{ flex: 1, textAlign: "center" }}>
            <div style={{ fontSize: "20px", color: "#fd561e" }}>→</div>
          </div>
          <div style={{ flex: 1, textAlign: "right" }}>
            <div style={{ fontSize: "11px", color: "#888", marginBottom: "4px" }}>TO</div>
            <div style={{ fontSize: "18px", fontWeight: "700", color: "#1a1a2e" }}>{destination}</div>
          </div>
        </div>

        {/* Info Grid */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: "12px",
          background: "#fafafa",
          borderRadius: "12px",
          padding: "12px 16px",
          marginBottom: "16px"
        }}>
          <div>
            <div style={{ fontSize: "10px", color: "#888", marginBottom: "4px" }}>
              <Calendar size={10} style={{ display: "inline", marginRight: "4px" }} />
              Journey Date
            </div>
            <div style={{ fontSize: "13px", fontWeight: "600", color: "#1a1a2e" }}>{formatDate(doj)}</div>
          </div>
          <div>
            <div style={{ fontSize: "10px", color: "#888", marginBottom: "4px" }}>
              <Ticket size={10} style={{ display: "inline", marginRight: "4px" }} />
              Ticket ID
            </div>
            <div style={{ fontSize: "13px", fontWeight: "600", color: "#fd561e" }}>{ticketId}</div>
          </div>
          <div>
            <div style={{ fontSize: "10px", color: "#888", marginBottom: "4px" }}>Fare Paid</div>
            <div style={{ fontSize: "13px", fontWeight: "600", color: "#1a1a2e" }}>₹{totalFare}</div>
          </div>
        </div>

        {/* Passenger */}
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div style={{
            width: "40px",
            height: "40px",
            borderRadius: "50%",
            background: "linear-gradient(135deg, #fd561e, #ff8c42)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "white",
            fontWeight: "bold",
            fontSize: "16px"
          }}>
            {pname[0]?.toUpperCase() || "G"}
          </div>
          <div>
            <div style={{ fontSize: "14px", fontWeight: "600", color: "#333" }}>{pname}</div>
            <div style={{ fontSize: "11px", color: "#888" }}>
              {booking.psex || ""} {booking.page ? `• ${booking.page} yrs` : ""}
            </div>
          </div>
        </div>
      </div>

      {/* Divider */}
      <div style={{ borderTop: "2px dashed #f0f0f0", margin: "0 20px" }}></div>

      {/* Print Button */}
      <div style={{ padding: "12px 20px", display: "flex", justifyContent: "flex-end" }}>
        <button
          onClick={() => onPrint(booking)}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            background: "white",
            border: "1.5px solid #fd561e",
            color: "#fd561e",
            borderRadius: "10px",
            padding: "8px 24px",
            fontSize: "13px",
            fontWeight: "600",
            cursor: "pointer",
            transition: "all 0.2s"
          }}
          onMouseEnter={e => {
            e.currentTarget.style.background = "#fd561e";
            e.currentTarget.style.color = "white";
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = "white";
            e.currentTarget.style.color = "#fd561e";
          }}
        >
          🖨️ Print Ticket
        </button>
      </div>
    </div>
  );
};

export default MyBookings;