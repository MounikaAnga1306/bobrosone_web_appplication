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
import SignIn from "./SignIn";
import SignupForm from "./SignUpForm";

const MyAccount = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [transactions, setTransactions] = useState([]);
  const [rewardBalance, setRewardBalance] = useState("0.00");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
  const uid = storedUser?.user?.uid || storedUser?.uid || "";
  const uname = storedUser?.user?.uname || storedUser?.uname || "User";
  const umob = storedUser?.user?.umob || "";
  const uemail = storedUser?.user?.uemail || "";

  // Modal States
  const [openAuthModal, setOpenAuthModal] = useState(false);
  const [authPage, setAuthPage] = useState("signin");
  const [signupData, setSignupData] = useState(null);
  const [resetData, setResetData] = useState(null);
  const [showCancel, setShowCancel] = useState(false);
  const [showPrintTicket, setShowPrintTicket] = useState(false);
  const [printTin, setPrintTin] = useState("");
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [showResetPasswordModal, setShowResetPasswordModal] = useState(false);

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

  // Fetch real reward balance from ulogin table
  const fetchRealBalance = async (userId) => {
    if (!userId) return;
    try {
      const res = await axios.post("https://api.bobros.co.in/db/select", {
        table: "ulogin",
        columns: ["ubal"],
        conditions: {
          uid: String(userId)
        }
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
    if (!uid && !isLoggedIn) {
      navigate("/");
      return;
    }

    setLoading(true);
    Promise.all([
      fetchRealBalance(uid),
      fetchTransactions()
    ]).finally(() => setLoading(false));
  }, [location.key, isLoggedIn]);

  const formatDate = (dt) => {
    if (!dt) return "—";
    try {
      const d = new Date(dt);
      if (isNaN(d)) return dt;
      return d.toLocaleDateString("en-IN", { day: "2-digit", month: "2-digit", year: "numeric" });
    } catch { return dt; }
  };

  const formatDateTime = (dt) => {
    if (!dt) return "—";
    try {
      const d = new Date(dt);
      if (isNaN(d)) return dt;
      return d.toLocaleDateString("en-IN", { day: "2-digit", month: "2-digit", year: "numeric" }) +
        "  " +
        d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true });
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

  const getTotalCredits = () => {
    return transactions.reduce((sum, tx) => sum + parseFloat(tx.tamount_cr || 0), 0).toFixed(2);
  };

  const getTotalDebits = () => {
    return transactions.reduce((sum, tx) => sum + parseFloat(tx.tamount_dr || 0), 0).toFixed(2);
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
    setShowPrintTicket(true);
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
          <div style={{ width: "48px", height: "48px", border: "4px solid #fd561e", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 0.8s linear infinite", margin: "0 auto 16px" }} />
          <p style={{ color: "#666", fontSize: "15px" }}>Loading your account...</p>
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
        user={storedUser?.user || storedUser}
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
              Transaction Details
            </h1>
            <p style={{ color: "#666", fontSize: "14px" }}>
              View all your reward point transactions
            </p>
          </div>

          {/* Stats Cards */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "20px", marginBottom: "32px" }}>
            <div style={{
              background: "white",
              borderRadius: "16px",
              padding: "20px",
              boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
              border: "1px solid #f0f0f0"
            }}>
              <div style={{ fontSize: "12px", color: "#888", marginBottom: "8px", display: "flex", alignItems: "center", gap: "6px" }}>
                <span>⬆️</span> Total Credits
              </div>
              <div style={{ fontSize: "28px", fontWeight: "700", color: "#16a34a" }}>+₹{getTotalCredits()}</div>
            </div>
            <div style={{
              background: "white",
              borderRadius: "16px",
              padding: "20px",
              boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
              border: "1px solid #f0f0f0"
            }}>
              <div style={{ fontSize: "12px", color: "#888", marginBottom: "8px", display: "flex", alignItems: "center", gap: "6px" }}>
                <span>⬇️</span> Total Debits
              </div>
              <div style={{ fontSize: "28px", fontWeight: "700", color: "#dc2626" }}>-₹{getTotalDebits()}</div>
            </div>
            <div style={{
              background: "linear-gradient(135deg, #fff5f0 0%, #ffffff 100%)",
              borderRadius: "16px",
              padding: "20px",
              boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
              border: "1px solid #ffe4d6"
            }}>
              <div style={{ fontSize: "12px", color: "#fd561e", marginBottom: "8px", display: "flex", alignItems: "center", gap: "6px" }}>
                <Gift size={14} /> Current Balance
              </div>
              <div style={{ fontSize: "28px", fontWeight: "700", color: "#fd561e" }}>₹{rewardBalance}</div>
            </div>
          </div>

          {/* Transactions List */}
          <div style={{
            background: "white",
            borderRadius: "20px",
            padding: "24px",
            boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
            border: "1px solid #f0f0f0"
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
              <h2 style={{ fontSize: "16px", fontWeight: "700", color: "#1a1a2e", margin: 0 }}>
                Transaction History
              </h2>
              <span style={{ fontSize: "12px", color: "#888", background: "#f5f5f5", padding: "4px 10px", borderRadius: "20px" }}>
                {transactions.length} records
              </span>
            </div>

            {transactions.length === 0 && !error ? (
              <div style={{ textAlign: "center", padding: "60px 20px" }}>
                <div style={{ fontSize: "56px", marginBottom: "16px" }}>💳</div>
                <h3 style={{ fontSize: "18px", color: "#333", marginBottom: "8px" }}>No transactions yet</h3>
                <p style={{ color: "#888", fontSize: "13px" }}>Your reward point transactions will appear here.</p>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                {transactions.map((tx, i) => {
                  const type = getTransactionType(tx);
                  const isCredit = parseFloat(tx.tamount_cr) > 0;
                  const isDebit = parseFloat(tx.tamount_dr) > 0;

                  return (
                    <div key={tx.tid || i} style={{
                      padding: "16px",
                      border: "1px solid #f0f0f0",
                      borderRadius: "12px",
                      transition: "all 0.2s",
                      cursor: "pointer"
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.08)";
                      e.currentTarget.style.borderColor = "#ffe4d6";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.boxShadow = "none";
                      e.currentTarget.style.borderColor = "#f0f0f0";
                    }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "8px" }}>
                        <div>
                          <div style={{ fontSize: "14px", fontWeight: "600", color: "#333", marginBottom: "4px" }}>{type.label}</div>
                          <div style={{ fontSize: "11px", color: "#888", display: "flex", alignItems: "center", gap: "4px" }}>
                            <CalendarIcon size={11} /> {formatDateTime(tx.datetime)}
                          </div>
                        </div>
                        <div>
                          {isCredit && <div style={{ fontSize: "18px", fontWeight: "700", color: "#16a34a" }}>+₹{parseFloat(tx.tamount_cr).toFixed(2)}</div>}
                          {isDebit && <div style={{ fontSize: "18px", fontWeight: "700", color: "#dc2626" }}>-₹{parseFloat(tx.tamount_dr).toFixed(2)}</div>}
                        </div>
                      </div>
                      <div style={{ borderTop: "1px solid #f5f5f5", marginTop: "8px", paddingTop: "8px", display: "flex", justifyContent: "space-between" }}>
                        <span style={{ fontSize: "10px", color: "#aaa" }}>Ref: {tx.treference || "—"}</span>
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

      {/* Cancellation Modal */}
      {showCancel && (
        <CancellationCard onClose={() => setShowCancel(false)} />
      )}

      {/* Print Ticket Modal */}
      {showPrintTicket && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
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
            maxWidth: "90%",
            position: "relative",
            maxHeight: "90vh",
            overflowY: "auto"
          }}>
            <button
              onClick={() => setShowPrintTicket(false)}
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
            >
              ✕
            </button>
            <PrintTicketModal
              onClose={() => setShowPrintTicket(false)}
              prefillTin={printTin}
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

      <style>
        {`
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        `}
      </style>
    </>
  );
};

export default MyAccount;