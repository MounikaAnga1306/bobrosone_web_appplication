// src/modules/bus/pages/MyBookings.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import PrintTicketModal from "./PrintTicketModal";
import CancellationCard from "./CancellationCard";
import ForgotPassword from "./ForgotPassword";
import ResetPassword from "./ResetPassword";
import SignIn from "./SignIn";
import SignupForm from "./SignUpForm";
import SidebarLayout from "../pages/SidebarLayout";
import AuthModal from "./AuthModal";
import {
  BookingCard,
  FilterTabs,
  EmptyState,
  Spinner,
  PrintModalWrapper,
  getStatus,
  TABS,
} from "../utils/bookingUtils";

const MyBookings = () => {
  const navigate = useNavigate();

  const [bookings,      setBookings]      = useState([]);
  const [loading,       setLoading]       = useState(true);
  const [error,         setError]         = useState("");
  const [tab,           setTab]           = useState("All");
  const [showPrint,     setShowPrint]     = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);

  const [openAuthModal,        setOpenAuthModal]        = useState(false);
  const [authPage,             setAuthPage]             = useState("signin");
  const [signupData,           setSignupData]           = useState(null);
  const [resetData,            setResetData]            = useState(null);
  const [showCancel,           setShowCancel]           = useState(false);
  const [showForgotPassword,   setShowForgotPassword]   = useState(false);
  const [showResetPasswordModal, setShowResetPasswordModal] = useState(false);

  const storedUser = JSON.parse(localStorage.getItem("user"));
  const uid    = storedUser?.user?.uid  || "";
  const mobile = storedUser?.user?.umob || "";
  const user   = storedUser?.user || storedUser || {};
  const [isLoggedIn, setIsLoggedIn] = useState(
    localStorage.getItem("isLoggedIn") === "true"
  );

  /* ── auth guard ── */
  useEffect(() => {
    const check = () => {
      const loggedIn = localStorage.getItem("isLoggedIn") === "true";
      setIsLoggedIn(loggedIn);
      if (!loggedIn) navigate("/");
    };
    check();
    window.addEventListener("storage", check);
    return () => window.removeEventListener("storage", check);
  }, [navigate]);

  /* ── fetch bookings ── */
  useEffect(() => {
    if (!uid && !mobile && !isLoggedIn) { navigate("/"); return; }
    if (isLoggedIn) fetchBookings();
  }, [isLoggedIn]);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const res = await axios.post("/myBookings", {
        uid: String(uid), mobile: String(mobile),
      });
      if (res.data?.success) setBookings((res.data.bookings || []).reverse());
      else setError("Failed to load bookings.");
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  /* ── handlers ── */
  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("isLoggedIn");
    setIsLoggedIn(false);
    window.dispatchEvent(new Event("storage"));
    navigate("/");
  };

  const handleOpenAuth = () => { setAuthPage("signin"); setOpenAuthModal(true); };
  const handleCloseAuth = () => { setOpenAuthModal(false); setAuthPage("signin"); };
  const handleOpenForgotPassword = () => { setOpenAuthModal(false); setShowForgotPassword(true); };
  const handleCloseForgotPassword = () => setShowForgotPassword(false);
  const handleOpenResetPassword = (data) => {
    setResetData(data);
    setShowForgotPassword(false);
    setShowResetPasswordModal(true);
  };

  /* ── filter ── */
  const filtered = bookings.filter((b) =>
    tab === "All" ? true : getStatus(b) === tab
  );

  if (loading) return <Spinner text="Fetching your trips..." />;
  if (!isLoggedIn) return null;

  return (
    <>
      <SidebarLayout
        isLoggedIn={isLoggedIn}
        user={user}
        onLogout={handleLogout}
        onOpenAuthModal={handleOpenAuth}
        onOpenCancel={() => setShowCancel(true)}
        onOpenPrintTicket={() => setShowPrint(true)}
        onOpenForgotPassword={handleOpenForgotPassword}
        modalOpen={showPrint || showCancel || openAuthModal || showForgotPassword || showResetPasswordModal}
      >
        {/* ── page content ── */}
        <div style={{ maxWidth: 900, margin: "0 auto", padding: "32px 20px 48px" }}>

          {/* title */}
          <div style={{ marginBottom: 24 }}>
            <h1 style={{
              fontSize: 24, fontWeight: 700, color: "#1a1a2e",
              margin: 0, fontFamily: "Segoe UI, sans-serif", marginTop:"-24px"
            }}>
              My Bookings
            </h1>
            <p style={{ fontSize: 13, color: "#9ca3af", marginTop: 4, fontFamily: "Segoe UI, sans-serif" }}>
              {bookings.length} booking{bookings.length !== 1 ? "s" : ""} found
            </p>
          </div>

          {/* filter tabs */}
          {bookings.length > 0 && (
            <FilterTabs bookings={bookings} tab={tab} setTab={setTab} />
          )}

          {/* error */}
          {error && (
            <div style={{
              background: "#fff1f0", border: "1px solid #ffccc7",
              borderRadius: 10, padding: "14px 18px",
              marginBottom: 16, color: "#cf1322",
              fontSize: 13, fontFamily: "Segoe UI, sans-serif",
            }}>
              {error}
            </div>
          )}

          {/* cards */}
          {bookings.length === 0 && !error ? (
            <EmptyState onBook={() => navigate("/")} />
          ) : filtered.length === 0 ? (
            <div style={{
              background: "#fff", borderRadius: 14, padding: "48px 20px",
              textAlign: "center", border: "1px solid #eef0f3",
            }}>
              <div style={{ fontSize: 40, marginBottom: 10 }}>🔍</div>
              <p style={{ color: "#9ca3af", fontSize: 14, fontFamily: "Segoe UI, sans-serif" }}>
                No {tab.toLowerCase()} bookings found.
              </p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {filtered.map((booking, index) => (
                <BookingCard
                  key={index}
                  booking={booking}
                  onPrint={(b) => {
                    setSelectedBooking(b);
                    setShowPrint(true);
                  }}
                />
              ))}
            </div>
          )}
        </div>
      </SidebarLayout>

      {/* ── print modal with user name ── */}
      {showPrint && (
        <PrintModalWrapper onClose={() => setShowPrint(false)}>
          <PrintTicketModal
            onClose={() => setShowPrint(false)}
            prefillTin={selectedBooking?.tin_ticket || selectedBooking?.tin || ""}
            userName={user?.name || user?.uname || "Guest"}
          />
        </PrintModalWrapper>
      )}

      {/* ── cancellation ── */}
      {showCancel && <CancellationCard onClose={() => setShowCancel(false)} />}

      {/* ── auth modals ── */}
      <AuthModal isOpen={openAuthModal}>
        {authPage === "signin" ? (
          <SignIn
            closeModal={handleCloseAuth}
            openSignup={() => setAuthPage("signup")}
            openForgot={() => { handleCloseAuth(); handleOpenForgotPassword(); }}
          />
        ) : (
          <SignupForm
            closeModal={handleCloseAuth}
            openSignin={() => setAuthPage("signin")}
            openVerifyOtp={(data) => { setSignupData(data); handleCloseAuth(); }}
          />
        )}
      </AuthModal>

      <AuthModal isOpen={showForgotPassword}>
        <ForgotPassword
          closeModal={handleCloseForgotPassword}
          openSignin={() => { handleCloseForgotPassword(); handleOpenAuth(); }}
          openResetPassword={handleOpenResetPassword}
        />
      </AuthModal>

      <AuthModal isOpen={showResetPasswordModal}>
        <ResetPassword
          resetData={resetData}
          closeModal={() => setShowResetPasswordModal(false)}
          openSignin={() => { setShowResetPasswordModal(false); handleOpenAuth(); }}
        />
      </AuthModal>
    </>
  );
};

export default MyBookings;