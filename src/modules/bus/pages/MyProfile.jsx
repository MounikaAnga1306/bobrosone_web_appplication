// src/modules/bus/pages/MyProfile.jsx
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { Edit2, Save, Mail, Phone, Gift } from "lucide-react";
import SidebarLayout from "../pages/SidebarLayout";
import CancellationCard from "./CancellationCard";
import PrintTicketModal from "./PrintTicketModal";
import ForgotPassword from "./ForgotPassword";
import ResetPassword from "./ResetPassword";
import SignIn from "./SignIn";
import SignupForm from "./SignUpForm";
import AuthModal from "./AuthModal";

const MyProfile = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [editing, setEditing] = useState(false);
  const [saved, setSaved] = useState(false);
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
    nationality: u.unationality || "",
    maritalStatus: u.umarital || "",
    city: u.ucity || "",
    state: u.ustate || "",
  });

  const [profile, setProfile] = useState(() => buildProfile(getUser()));
  const [original, setOriginal] = useState(() => buildProfile(getUser()));
  const isDirty = JSON.stringify(profile) !== JSON.stringify(original);

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
      const p = buildProfile(u);
      setProfile(p);
      setOriginal(p);
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

  const handleChange = (field, value) => setProfile(p => ({ ...p, [field]: value }));

  const handleSave = () => {
    const currentStored = JSON.parse(localStorage.getItem("user") || "{}");
    const currentBase = currentStored?.user || currentStored || {};
    const updatedBase = {
      ...currentBase,
      uname: `${profile.firstName} ${profile.lastName}`.trim(),
      umail: profile.email, email: profile.email,
      umob: profile.mobile, ugender: profile.gender,
      udob: profile.dob, unationality: profile.nationality,
      umarital: profile.maritalStatus, ucity: profile.city, ustate: profile.state,
    };
    const updated = currentStored?.user ? { ...currentStored, user: updatedBase } : updatedBase;
    localStorage.setItem("user", JSON.stringify(updated));
    setOriginal({ ...profile });
    setEditing(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
    window.dispatchEvent(new Event("storage"));
  };

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

  const inputStyle = (disabled) => ({
    width: "100%",
    padding: "10px 12px",
    border: `1.5px solid ${disabled ? "#e5e7eb" : "#d1d5db"}`,
    borderRadius: "10px",
    fontSize: "14px",
    outline: "none",
    background: disabled ? "#f9f9f9" : "white",
    color: "#1a1a2e",
    transition: "all 0.2s",
    boxSizing: "border-box"
  });

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
            gap: "16px"
          }}>
            <div>
              <h1 style={{ fontSize: isMobile ? "20px" : "26px", fontWeight: "700", color: "white", marginBottom: "6px" }}>
                My Profile
              </h1>
              <p style={{ color: "rgba(255,255,255,0.8)", fontSize: "13px" }}>
                Manage your personal information
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
              textAlign: isMobile ? "left" : "center"
            }}>
              <div style={{ fontSize: "11px", color: "rgba(255,255,255,0.7)", textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: "4px", display: "flex", alignItems: "center", gap: "4px" }}>
                <Gift size={12} /> Reward Points
              </div>
              <div style={{ fontSize: isMobile ? "22px" : "28px", fontWeight: "800", color: "white" }}>
                ₹{rewardBalance}
              </div>
            </div>
          </div>

          {saved && (
            <div style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: "12px", padding: "12px 18px", marginBottom: "16px", color: "#16a34a", fontSize: "14px", display: "flex", alignItems: "center", gap: "8px" }}>
              ✅ Profile saved successfully!
            </div>
          )}

          {/* Profile Card */}
          <div style={{ background: "white", borderRadius: "16px", boxShadow: "0 1px 3px rgba(0,0,0,0.1)", border: "1px solid #f0f0f0", overflow: "hidden" }}>

            {/* Card Header */}
            <div style={{
              padding: isMobile ? "16px" : "24px 28px",
              borderBottom: "1px solid #f0f0f0",
              background: "#fafafa"
            }}>
              {/* Avatar + name row */}
              <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "16px" }}>
                {/* Avatar — fixed size so it never crops or stretches */}
                <div style={{
                  width: "60px",
                  height: "60px",
                  minWidth: "60px",
                  borderRadius: "50%",
                  background: "linear-gradient(135deg, #fd561e, #ff8c42)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "24px",
                  fontWeight: "bold",
                  color: "white",
                  flexShrink: 0
                }}>
                  {profile.firstName?.[0]?.toUpperCase() || "U"}
                </div>

                {/* Name + contact */}
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

              {/* Edit / Save buttons */}
              {!editing ? (
                <button
                  onClick={() => setEditing(true)}
                  style={{
                    display: "flex", alignItems: "center", gap: "8px",
                    padding: "10px 20px", background: "#fd561e", color: "white",
                    border: "none", borderRadius: "10px", fontSize: "13px",
                    fontWeight: "600", cursor: "pointer",
                    width: isMobile ? "100%" : "auto",
                    justifyContent: isMobile ? "center" : "flex-start"
                  }}
                >
                  <Edit2 size={15} /> Edit Profile
                </button>
              ) : (
                <div style={{ display: "flex", gap: "10px", flexDirection: isMobile ? "column" : "row" }}>
                  <button
                    onClick={() => { setProfile({ ...original }); setEditing(false); }}
                    style={{
                      flex: isMobile ? 1 : "none",
                      padding: "10px 20px", border: "1.5px solid #e5e7eb",
                      borderRadius: "10px", background: "white", fontSize: "13px",
                      fontWeight: "600", color: "#666", cursor: "pointer"
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={!isDirty}
                    style={{
                      flex: isMobile ? 1 : "none",
                      padding: "10px 24px", border: "none", borderRadius: "10px",
                      background: isDirty ? "linear-gradient(135deg, #fd561e, #ff8c42)" : "#e5e7eb",
                      fontSize: "13px", fontWeight: "700",
                      color: isDirty ? "white" : "#aaa",
                      cursor: isDirty ? "pointer" : "not-allowed",
                      display: "flex", alignItems: "center", gap: "6px",
                      justifyContent: "center"
                    }}
                  >
                    <Save size={15} /> Save Changes
                  </button>
                </div>
              )}
            </div>

            {/* Profile Fields */}
            <div style={{ padding: isMobile ? "16px" : "28px" }}>
              <h3 style={{ fontSize: "15px", fontWeight: "700", color: "#1a1a2e", marginBottom: "16px", paddingBottom: "10px", borderBottom: "2px solid #f0f0f0" }}>
                General Information
              </h3>

              <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(2, 1fr)", gap: isMobile ? "14px" : "24px", marginBottom: "32px" }}>
                {[
                  { label: "First & Middle Name", field: "firstName", placeholder: "First Name" },
                  { label: "Last Name", field: "lastName", placeholder: "Last Name" },
                ].map(({ label, field, placeholder }) => (
                  <div key={field}>
                    <label style={{ fontSize: "11px", color: "#888", display: "block", marginBottom: "6px", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.5px" }}>{label}</label>
                    <input style={inputStyle(!editing)} value={profile[field]} onChange={e => handleChange(field, e.target.value)} disabled={!editing} placeholder={placeholder} />
                  </div>
                ))}

                <div>
                  <label style={{ fontSize: "11px", color: "#888", display: "block", marginBottom: "6px", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.5px" }}>Gender</label>
                  <select style={inputStyle(!editing)} value={profile.gender} onChange={e => handleChange("gender", e.target.value)} disabled={!editing}>
                    <option value="">Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: "11px", color: "#888", display: "block", marginBottom: "6px", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.5px" }}>Date of Birth</label>
                  <input type={editing ? "date" : "text"} style={inputStyle(!editing)} value={profile.dob} onChange={e => handleChange("dob", e.target.value)} disabled={!editing} placeholder="DD/MM/YYYY" />
                </div>

                <div>
                  <label style={{ fontSize: "11px", color: "#888", display: "block", marginBottom: "6px", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.5px" }}>Nationality</label>
                  <input style={inputStyle(!editing)} value={profile.nationality} onChange={e => handleChange("nationality", e.target.value)} disabled={!editing} placeholder="Indian" />
                </div>

                <div>
                  <label style={{ fontSize: "11px", color: "#888", display: "block", marginBottom: "6px", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.5px" }}>Marital Status</label>
                  <select style={inputStyle(!editing)} value={profile.maritalStatus} onChange={e => handleChange("maritalStatus", e.target.value)} disabled={!editing}>
                    <option value="">Select Status</option>
                    <option value="Single">Single</option>
                    <option value="Married">Married</option>
                    <option value="Divorced">Divorced</option>
                    <option value="Widowed">Widowed</option>
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: "11px", color: "#888", display: "block", marginBottom: "6px", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.5px" }}>City of Residence</label>
                  <input style={inputStyle(!editing)} value={profile.city} onChange={e => handleChange("city", e.target.value)} disabled={!editing} placeholder="City" />
                </div>

                <div>
                  <label style={{ fontSize: "11px", color: "#888", display: "block", marginBottom: "6px", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.5px" }}>State</label>
                  <input style={inputStyle(!editing)} value={profile.state} onChange={e => handleChange("state", e.target.value)} disabled={!editing} placeholder="State" />
                </div>
              </div>

              <h3 style={{ fontSize: "15px", fontWeight: "700", color: "#1a1a2e", marginBottom: "16px", paddingBottom: "10px", borderBottom: "2px solid #f0f0f0" }}>
                Contact Details
              </h3>

              <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(2, 1fr)", gap: isMobile ? "14px" : "24px" }}>
                <div>
                  <label style={{ fontSize: "11px", color: "#888", display: "block", marginBottom: "6px", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.5px" }}>Mobile Number</label>
                  <div style={{ display: "flex", border: "1.5px solid #e5e7eb", borderRadius: "10px", overflow: "hidden", background: "#f9f9f9" }}>
                    <span style={{ padding: "10px 14px", background: "#f0f0f0", fontSize: "14px", color: "#555", borderRight: "1px solid #e5e7eb", fontWeight: "500", flexShrink: 0 }}>+91</span>
                    <input style={{ flex: 1, padding: "10px 14px", fontSize: "14px", outline: "none", border: "none", background: "#f9f9f9", minWidth: 0 }} value={profile.mobile} disabled />
                  </div>
                  <p style={{ fontSize: "10px", color: "#aaa", marginTop: "6px" }}>Mobile number cannot be changed</p>
                </div>
                <div>
                  <label style={{ fontSize: "11px", color: "#888", display: "block", marginBottom: "6px", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.5px" }}>Email Address</label>
                  <input style={inputStyle(!editing)} value={profile.email} onChange={e => handleChange("email", e.target.value)} disabled={!editing} placeholder="Enter email address" />
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