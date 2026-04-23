// src/modules/bus/pages/MyProfile.jsx
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { Mail, Phone, Gift } from "lucide-react";
import SidebarLayout from "../pages/SidebarLayout";
import CancellationCard from "./CancellationCard";
import PrintTicketModal from "./PrintTicketModal";
import ForgotPassword from "./ForgotPassword";
import ResetPassword from "./ResetPassword";
import SignIn from "../../../globalfiles/SignIn";
import SignupForm from "../../../globalfiles/SignupForm";
import AuthModal from "./AuthModal";

const MyProfile = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [rewardBalance, setRewardBalance] = useState("0.00");
  const [isMobile, setIsMobile] = useState(false);

  const [openAuthModal, setOpenAuthModal] = useState(false);
  const [authPage, setAuthPage] = useState("signin");
  const [signupData, setSignupData] = useState(null);
  const [resetData, setResetData] = useState(null);
  const [showCancel, setShowCancel] = useState(false);
  const [showPrintTicket, setShowPrintTicket] = useState(false);
  const [printTin, setPrintTin] = useState("");
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [showResetPasswordModal, setShowResetPasswordModal] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(localStorage.getItem("isLoggedIn") === "true");

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const getUser = () => {
    const stored = JSON.parse(localStorage.getItem("user") || "{}");
    return stored?.user || stored || {};
  };

  const buildProfile = (u) => ({
    firstName: u.uname?.split(" ")[0] || "",
    lastName: u.uname?.split(" ").slice(1).join(" ") || "",
    email: u.umail || u.uemail || u.email || "",
    mobile: u.umob || u.mobile || "",
    gender: u.ugender || "",
    dob: u.udob || "",
  });

  const [profile, setProfile] = useState(() => buildProfile(getUser()));

  useEffect(() => {
    const checkLoginStatus = () => {
      const loggedIn = localStorage.getItem("isLoggedIn") === "true";
      setIsLoggedIn(loggedIn);
      if (!loggedIn) navigate("/");
    };
    checkLoginStatus();
    window.addEventListener("storage", checkLoginStatus);
    return () => window.removeEventListener("storage", checkLoginStatus);
  }, [navigate]);

  useEffect(() => {
    if (isLoggedIn) {
      const u = getUser();
      setProfile(buildProfile(u));
    }
  }, [isLoggedIn, location.key]);

  useEffect(() => {
    const userBase = getUser();
    if (!userBase.uid) return;
    axios.post("https://api.bobros.co.in/db/select", {
      table: "ulogin", columns: ["ubal"], conditions: { uid: String(userBase.uid) }
    }).then(res => {
      if (res.data?.rows?.length > 0) {
        setRewardBalance(parseFloat(res.data.rows[0].ubal || 0).toFixed(2));
      }
    }).catch(() => {});
  }, [location.key]);

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("isLoggedIn");
    setIsLoggedIn(false);
    window.dispatchEvent(new Event("storage"));
    navigate("/");
  };

  const handleOpenCancel = () => setShowCancel(true);
  const handleOpenPrintTicket = () => { setPrintTin(""); setShowPrintTicket(true); };
  const handleOpenAuth = () => { setAuthPage("signin"); setOpenAuthModal(true); };
  const handleCloseAuth = () => { setOpenAuthModal(false); setAuthPage("signin"); };
  const handleOpenForgotPassword = () => { setOpenAuthModal(false); setShowForgotPassword(true); };
  const handleCloseForgotPassword = () => setShowForgotPassword(false);
  const handleOpenResetPassword = (data) => { setResetData(data); setShowForgotPassword(false); setShowResetPasswordModal(true); };
  const handleCloseResetPassword = () => setShowResetPasswordModal(false);

  const fieldStyle = {
    width: "100%",
    padding: "10px 12px",
    border: "1.5px solid #e5e7eb",
    borderRadius: "10px",
    fontSize: "14px",
    outline: "none",
    background: "#f9f9f9",
    color: "#1a1a2e",
    boxSizing: "border-box",
  };

  const labelStyle = {
    fontSize: "11px",
    color: "#888",
    display: "block",
    marginBottom: "6px",
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
  };

  if (!isLoggedIn) return null;

  return (
    <>
      <SidebarLayout
        isLoggedIn={isLoggedIn}
        user={getUser()}
        onLogout={handleLogout}
        onOpenAuthModal={handleOpenAuth}
        onOpenCancel={handleOpenCancel}
        onOpenPrintTicket={handleOpenPrintTicket}
        onOpenForgotPassword={handleOpenForgotPassword}
        modalOpen={showPrintTicket || showCancel || openAuthModal || showForgotPassword || showResetPasswordModal}
      >
        <div style={{ padding: isMobile ? "16px" : "24px 32px" }}>

          {/* Header Banner */}
          <div style={{
            background: "linear-gradient(135deg, #1a3c34 0%, #2d5a45 100%)",
            borderRadius: "16px",
            padding: isMobile ? "16px" : "24px 32px",
            marginBottom: "20px",
            display: "flex",
            flexDirection: isMobile ? "column" : "row",
            justifyContent: "space-between",
            alignItems: isMobile ? "flex-start" : "center",
            gap: "16px",
          }}>
            <div>
              <h1 style={{ fontSize: isMobile ? "20px" : "26px", fontWeight: "700", color: "white", marginBottom: "6px" }}>
                My Profile
              </h1>
              <p style={{ color: "rgba(255,255,255,0.8)", fontSize: "13px" }}>
                Your personal information
              </p>
            </div>

            {/* Reward Points */}
            <div style={{
              background: "rgba(255,255,255,0.15)",
              backdropFilter: "blur(10px)",
              borderRadius: "14px",
              padding: isMobile ? "10px 16px" : "12px 24px",
              border: "1px solid rgba(255,255,255,0.2)",
              alignSelf: isMobile ? "stretch" : "auto",
              textAlign: isMobile ? "left" : "center",
            }}>
              <div style={{ fontSize: "11px", color: "rgba(255,255,255,0.7)", textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: "4px", display: "flex", alignItems: "center", gap: "4px" }}>
                <Gift size={12} /> Reward Points
              </div>
              <div style={{ fontSize: isMobile ? "22px" : "28px", fontWeight: "800", color: "white" }}>
                ₹{rewardBalance}
              </div>
            </div>
          </div>

          {/* Profile Card */}
          <div style={{ background: "white", borderRadius: "16px", boxShadow: "0 1px 3px rgba(0,0,0,0.1)", border: "1px solid #f0f0f0", overflow: "hidden" }}>

            {/* Avatar + name row */}
            <div style={{
              padding: isMobile ? "16px" : "24px 28px",
              borderBottom: "1px solid #f0f0f0",
              background: "#fafafa",
              display: "flex",
              alignItems: "center",
              gap: "16px",
            }}>
              <div style={{
                width: "60px", height: "60px", minWidth: "60px",
                borderRadius: "50%",
                background: "linear-gradient(135deg, #fd561e, #ff8c42)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "24px", fontWeight: "bold", color: "white", flexShrink: 0,
              }}>
                {profile.firstName?.[0]?.toUpperCase() || "U"}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: isMobile ? "17px" : "22px", fontWeight: "700", color: "#1a1a2e", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                  {profile.firstName} {profile.lastName}
                </div>
                <div style={{ display: "flex", flexDirection: isMobile ? "column" : "row", gap: isMobile ? "2px" : "16px", marginTop: "4px" }}>
                  {profile.mobile && (
                    <span style={{ fontSize: "12px", color: "#666", display: "flex", alignItems: "center", gap: "4px" }}>
                      <Phone size={11} /> {profile.mobile}
                    </span>
                  )}
                  {profile.email && (
                    <span style={{ fontSize: "12px", color: "#666", display: "flex", alignItems: "center", gap: "4px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      <Mail size={11} /> {profile.email}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Fields */}
            <div style={{ padding: isMobile ? "16px" : "28px" }}>
              <h3 style={{ fontSize: "15px", fontWeight: "700", color: "#1a1a2e", marginBottom: "16px", paddingBottom: "10px", borderBottom: "2px solid #f0f0f0" }}>
                General Information
              </h3>

              <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(2, 1fr)", gap: isMobile ? "14px" : "24px", marginBottom: "32px" }}>

                <div>
                  <label style={labelStyle}>First Name</label>
                  <input style={fieldStyle} value={profile.firstName} readOnly />
                </div>

                <div>
                  <label style={labelStyle}>Last Name</label>
                  <input style={fieldStyle} value={profile.lastName} readOnly />
                </div>


              </div>

              <h3 style={{ fontSize: "15px", fontWeight: "700", color: "#1a1a2e", marginBottom: "16px", paddingBottom: "10px", borderBottom: "2px solid #f0f0f0" }}>
                Contact Details
              </h3>

              <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(2, 1fr)", gap: isMobile ? "14px" : "24px" }}>

                <div>
                  <label style={labelStyle}>Mobile Number</label>
                  <div style={{ display: "flex", border: "1.5px solid #e5e7eb", borderRadius: "10px", overflow: "hidden", background: "#f9f9f9" }}>
                    <span style={{ padding: "10px 14px", background: "#f0f0f0", fontSize: "14px", color: "#555", borderRight: "1px solid #e5e7eb", fontWeight: "500", flexShrink: 0 }}>+91</span>
                    <input style={{ flex: 1, padding: "10px 14px", fontSize: "14px", outline: "none", border: "none", background: "#f9f9f9", minWidth: 0 }} value={profile.mobile} readOnly />
                  </div>
                </div>

                <div>
                  <label style={labelStyle}>Email Address</label>
                  <input style={fieldStyle} value={profile.email} readOnly />
                </div>

              </div>
            </div>
          </div>
        </div>
      </SidebarLayout>

      {showCancel && <CancellationCard onClose={() => setShowCancel(false)} />}

      {showPrintTicket && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9999, padding: "16px" }}>
          <div style={{ background: "white", borderRadius: "20px", padding: "32px", width: "460px", maxWidth: "100%", position: "relative", maxHeight: "90vh", overflowY: "auto" }}>
            <button onClick={() => setShowPrintTicket(false)} style={{ position: "absolute", top: "16px", right: "16px", background: "none", border: "none", fontSize: "20px", cursor: "pointer", color: "#999" }}>✕</button>
            <PrintTicketModal onClose={() => setShowPrintTicket(false)} prefillTin={printTin} />
          </div>
        </div>
      )}

      <AuthModal isOpen={openAuthModal}>
        {authPage === "signin" ? (
          <SignIn closeModal={handleCloseAuth} openSignup={() => setAuthPage("signup")} openForgot={() => { handleCloseAuth(); handleOpenForgotPassword(); }} />
        ) : (
          <SignupForm closeModal={handleCloseAuth} openSignin={() => setAuthPage("signin")} openVerifyOtp={(data) => { setSignupData(data); handleCloseAuth(); }} />
        )}
      </AuthModal>

      <AuthModal isOpen={showForgotPassword}>
        <ForgotPassword closeModal={handleCloseForgotPassword} openSignin={() => { handleCloseForgotPassword(); handleOpenAuth(); }} openResetPassword={handleOpenResetPassword} />
      </AuthModal>

      <AuthModal isOpen={showResetPasswordModal}>
        <ResetPassword resetData={resetData} closeModal={handleCloseResetPassword} openSignin={() => { handleCloseResetPassword(); handleOpenAuth(); }} />
      </AuthModal>
    </>
  );
};

export default MyProfile;