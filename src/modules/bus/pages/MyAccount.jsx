// src/modules/bus/pages/MyAccount.jsx
import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { Calendar as CalendarIcon, Gift } from "lucide-react";
import SidebarLayout from "../pages/SidebarLayout";
import CancellationCard from "./CancellationCard";
import PrintTicketModal from "./PrintTicketModal";
import ForgotPassword from "./ForgotPassword";
import ResetPassword from "./ResetPassword";
import AuthModal from "./AuthModal";
import SignIn from "../../../globalfiles/SignIn";
import SignupForm from "../../../globalfiles/SignupForm";

const MyAccount = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [transactions, setTransactions] = useState([]);
  const [rewardBalance, setRewardBalance] = useState("0.00");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);

  const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
  const uid = storedUser?.user?.uid || storedUser?.uid || "";
  const uname = storedUser?.user?.uname || storedUser?.uname || "User";
  const umob = storedUser?.user?.umob || "";
  const uemail = storedUser?.user?.uemail || "";

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
    const checkScreenSize = () => {
      const width = window.innerWidth;
      setIsMobile(width < 768);
      setIsTablet(width >= 768 && width < 1024);
    };
    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);
    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

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

  const fetchRealBalance = async (userId) => {
    if (!userId) return;
    try {
      const res = await axios.post("https://api.bobros.co.in/db/select", {
        table: "ulogin",
        columns: ["ubal"],
        conditions: { uid: String(userId) }
      });
      if (res.data?.rows?.length > 0) {
        const bal = parseFloat(res.data.rows[0].ubal || 0).toFixed(2);
        setRewardBalance(bal);
      }
    } catch (err) {
      console.error("Failed to fetch ubal from ulogin:", err);
    }
  };

  const fetchTransactions = async () => {
    try {
      const res = await axios.post("/myAccount", { uid: String(uid) });
      if (res.data?.success) {
        const sorted = [...(res.data.transactions || [])].sort((a, b) => b.tid - a.tid);
        setTransactions(sorted);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (!uid && !isLoggedIn) { navigate("/"); return; }
    setLoading(true);
    Promise.all([fetchRealBalance(uid), fetchTransactions()]).finally(() => setLoading(false));
  }, [location.key, isLoggedIn]);

  const formatDateTime = (dt) => {
    if (!dt) return "—";
    try {
      const d = new Date(dt);
      if (isNaN(d)) return dt;
      return d.toLocaleDateString("en-IN", { day: "2-digit", month: "2-digit", year: "numeric" }) +
        "  " + d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true });
    } catch { return dt; }
  };

  const getTransactionType = (tx) => {
    const ref = (tx.treference || "").toLowerCase();
    if (ref.includes("cancellation")) return { label: "Cancellation Refund", color: "#16a34a", icon: "↩️" };
    if (ref.includes("reversal")) return { label: "Reward Reversal", color: "#dc2626", icon: "🔄" };
    if (ref.includes("signup") || ref.includes("sign_up") || ref.includes("bonus"))
      return { label: "Sign Up Bonus", color: "#16a34a", icon: "🎁" };
    if (parseFloat(tx.tamount_cr) > 0) return { label: "Credit", color: "#16a34a", icon: "⬆️" };
    if (parseFloat(tx.tamount_dr) > 0) return { label: "Debit", color: "#dc2626", icon: "⬇️" };
    return { label: "Transaction", color: "#888", icon: "💳" };
  };

  const getTotalCredits = () => transactions.reduce((sum, tx) => sum + parseFloat(tx.tamount_cr || 0), 0).toFixed(2);
  const getTotalDebits = () => transactions.reduce((sum, tx) => sum + parseFloat(tx.tamount_dr || 0), 0).toFixed(2);

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

  // Get responsive padding values
  const getContainerPadding = () => {
    if (isMobile) return "16px";
    if (isTablet) return "24px";
    return "32px";
  };

  const getStatsGap = () => {
    if (isMobile) return "10px";
    return "20px";
  };

  const getStatsCardPadding = () => {
    if (isMobile) return "14px";
    return "20px";
  };

  const getStatsFontSize = () => {
    if (isMobile) return "20px";
    if (isTablet) return "24px";
    return "28px";
  };

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", background: "#f5f7fa", display: "flex", alignItems: "center", justifyContent: "center", paddingTop: "80px" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ width: "48px", height: "48px", border: "4px solid #fd561e", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 0.8s linear infinite", margin: "0 auto 16px" }} />
          <p style={{ color: "#666", fontSize: "15px" }}>Loading your account...</p>
        </div>
      </div>
    );
  }

  if (!isLoggedIn) return null;

  return (
    <>
      <SidebarLayout
        isLoggedIn={isLoggedIn}
        user={storedUser?.user || storedUser}
        onLogout={handleLogout}
        onOpenAuthModal={handleOpenAuth}
        onOpenCancel={handleOpenCancel}
        onOpenPrintTicket={handleOpenPrintTicket}
        onOpenForgotPassword={handleOpenForgotPassword}
        modalOpen={showPrintTicket || showCancel || openAuthModal || showForgotPassword || showResetPasswordModal}
      >
        <div style={{ 
          padding: getContainerPadding(),
          width: "100%",
          maxWidth: "100%",
          overflowX: "hidden",
          boxSizing: "border-box"
        }}>
          {/* Page Header */}
          <div style={{ marginBottom: "24px" }}>
            <h1 style={{ 
              fontSize: isMobile ? "20px" : isTablet ? "22px" : "26px", 
              fontWeight: "700", 
              color: "#1a1a2e", 
              marginBottom: "8px"
            }}>
              Transaction Details
            </h1>
            <p style={{ color: "#666", fontSize: isMobile ? "12px" : "13px", margin: 0 }}>
              View all your reward point transactions
            </p>
          </div>

          {/* Stats Cards — responsive grid */}
          <div style={{
            display: "grid",
            gridTemplateColumns: isMobile ? "1fr 1fr" : "repeat(3, 1fr)",
            gap: getStatsGap(),
            marginBottom: "24px",
            width: "100%"
          }}>
            <div style={{
              background: "white",
              borderRadius: "14px",
              padding: getStatsCardPadding(),
              boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
              border: "1px solid #f0f0f0",
              minWidth: 0
            }}>
              <div style={{ fontSize: "11px", color: "#888", marginBottom: "6px" }}>⬆️ Total Credits</div>
              <div style={{ fontSize: getStatsFontSize(), fontWeight: "700", color: "#16a34a", wordBreak: "break-word" }}>+₹{getTotalCredits()}</div>
            </div>

            <div style={{
              background: "white",
              borderRadius: "14px",
              padding: getStatsCardPadding(),
              boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
              border: "1px solid #f0f0f0",
              minWidth: 0
            }}>
              <div style={{ fontSize: "11px", color: "#888", marginBottom: "6px" }}>⬇️ Total Debits</div>
              <div style={{ fontSize: getStatsFontSize(), fontWeight: "700", color: "#dc2626", wordBreak: "break-word" }}>-₹{getTotalDebits()}</div>
            </div>

            {/* Balance — full width on mobile */}
            <div style={{
              background: "linear-gradient(135deg, #fff5f0 0%, #ffffff 100%)",
              borderRadius: "14px",
              padding: getStatsCardPadding(),
              boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
              border: "1px solid #ffe4d6",
              gridColumn: isMobile ? "1 / -1" : "auto",
              minWidth: 0
            }}>
              <div style={{ fontSize: "11px", color: "#fd561e", marginBottom: "6px", display: "flex", alignItems: "center", gap: "4px" }}>
                <Gift size={12} /> Current Balance
              </div>
              <div style={{ fontSize: getStatsFontSize(), fontWeight: "700", color: "#fd561e", wordBreak: "break-word" }}>₹{rewardBalance}</div>
            </div>
          </div>

          {/* Transactions List */}
          <div style={{
            background: "white",
            borderRadius: "16px",
            padding: isMobile ? "16px" : isTablet ? "20px" : "24px",
            boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
            border: "1px solid #f0f0f0",
            width: "100%",
            overflowX: "auto"
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px", flexWrap: "wrap", gap: "8px" }}>
              <h2 style={{ fontSize: isMobile ? "14px" : isTablet ? "15px" : "16px", fontWeight: "700", color: "#1a1a2e", margin: 0 }}>
                Transaction History
              </h2>
              <span style={{ fontSize: "11px", color: "#888", background: "#f5f5f5", padding: "4px 10px", borderRadius: "20px" }}>
                {transactions.length} records
              </span>
            </div>

            {transactions.length === 0 && !error ? (
              <div style={{ textAlign: "center", padding: "40px 20px" }}>
                <div style={{ fontSize: "48px", marginBottom: "12px" }}>💳</div>
                <h3 style={{ fontSize: "16px", color: "#333", marginBottom: "6px" }}>No transactions yet</h3>
                <p style={{ color: "#888", fontSize: "13px" }}>Your reward point transactions will appear here.</p>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "10px", width: "100%" }}>
                {transactions.map((tx, i) => {
                  const type = getTransactionType(tx);
                  const isCredit = parseFloat(tx.tamount_cr) > 0;
                  const isDebit = parseFloat(tx.tamount_dr) > 0;

                  return (
                    <div key={tx.tid || i} style={{
                      padding: isMobile ? "12px" : "16px",
                      border: "1px solid #f0f0f0",
                      borderRadius: "12px",
                      transition: "all 0.2s",
                      width: "100%",
                      boxSizing: "border-box"
                    }}
                      onMouseEnter={(e) => { e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.08)"; e.currentTarget.style.borderColor = "#ffe4d6"; }}
                      onMouseLeave={(e) => { e.currentTarget.style.boxShadow = "none"; e.currentTarget.style.borderColor = "#f0f0f0"; }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "8px", flexWrap: "wrap", gap: "8px" }}>
                        <div style={{ flex: 1, minWidth: "120px" }}>
                          <div style={{ fontSize: isMobile ? "13px" : "14px", fontWeight: "600", color: "#333", marginBottom: "4px" }}>{type.label}</div>
                          <div style={{ fontSize: "11px", color: "#888", display: "flex", alignItems: "center", gap: "4px", flexWrap: "wrap" }}>
                            <CalendarIcon size={11} /> {formatDateTime(tx.datetime)}
                          </div>
                        </div>
                        <div style={{ flexShrink: 0 }}>
                          {isCredit && <div style={{ fontSize: isMobile ? "15px" : "18px", fontWeight: "700", color: "#16a34a" }}>+₹{parseFloat(tx.tamount_cr).toFixed(2)}</div>}
                          {isDebit && <div style={{ fontSize: isMobile ? "15px" : "18px", fontWeight: "700", color: "#dc2626" }}>-₹{parseFloat(tx.tamount_dr).toFixed(2)}</div>}
                        </div>
                      </div>
                      <div style={{ borderTop: "1px solid #f5f5f5", marginTop: "8px", paddingTop: "8px", display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: "8px" }}>
                        <span style={{ fontSize: "10px", color: "#aaa", wordBreak: "break-word" }}>Ref: {tx.treference || "—"}</span>
                        <span style={{ fontSize: "10px", fontWeight: "500", color: "#fd561e" }}>Balance: ₹{parseFloat(tx.newbal || 0).toFixed(2)}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
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

      <style>{`
        @keyframes spin { 
          to { transform: rotate(360deg); } 
        }
        /* iPad and tablet specific fixes */
        @media (min-width: 768px) and (max-width: 1024px) {
          .main-content {
            overflow-x: hidden !important;
          }
        }
        /* Ensure proper box sizing */
        * {
          box-sizing: border-box;
        }
      `}</style>
    </>
  );
};

export default MyAccount;