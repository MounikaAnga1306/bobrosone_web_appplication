// src/modules/bus/pages/MyAccount.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const MyAccount = () => {
  const navigate = useNavigate();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const storedUser = JSON.parse(localStorage.getItem("user"));
  const uid = storedUser?.user?.uid || "";
  const uname = storedUser?.user?.uname || "User";
  const umob = storedUser?.user?.umob || "";
  const uemail = storedUser?.user?.uemail || "";

  useEffect(() => {
    if (!uid) { navigate("/"); return; }
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const res = await axios.post("/myAccount", { uid: String(uid) });
      if (res.data?.success) {
        // Sort by tid descending (latest first)
        const sorted = [...(res.data.transactions || [])].sort((a, b) => b.tid - a.tid);
        setTransactions(sorted);
      } else {
        setError("Failed to load transactions.");
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dt) => {
    if (!dt) return "—";
    try {
      const d = new Date(dt);
      if (isNaN(d)) return dt;
      return d.toLocaleDateString("en-IN", { day: "2-digit", month: "2-digit", year: "numeric" })
        + "  " +
        d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true });
    } catch { return dt; }
  };

  const getTransactionType = (tx) => {
    const ref = (tx.treference || "").toLowerCase();
    if (ref.includes("cancellation")) return { label: "Cancellation Refund", color: "#16a34a", icon: "↩️" };
    if (ref.includes("reversal"))     return { label: "Reward Reversal",     color: "#dc2626", icon: "🔄" };
    if (ref.includes("signup") || ref.includes("sign_up") || ref.includes("bonus"))
                                       return { label: "Sign Up Bonus",       color: "#16a34a", icon: "🎁" };
    if (parseFloat(tx.tamount_cr) > 0) return { label: "Credit",             color: "#16a34a", icon: "⬆️" };
    if (parseFloat(tx.tamount_dr) > 0) return { label: "Debit",              color: "#dc2626", icon: "⬇️" };
    return { label: "Transaction", color: "#888", icon: "💳" };
  };

  // Current balance = newbal of latest transaction (smallest tid after sort = last in original)
  const currentBalance = transactions.length > 0 ? parseFloat(transactions[0]?.newbal || 0).toFixed(2) : "0.00";

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", background: "#f0f2f5", display: "flex", alignItems: "center", justifyContent: "center", paddingTop: "80px" }}>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        <div style={{ textAlign: "center" }}>
          <div style={{ width: "48px", height: "48px", border: "4px solid #fd561e", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 0.8s linear infinite", margin: "0 auto 16px" }} />
          <p style={{ color: "#666", fontSize: "15px", fontFamily: "Segoe UI, sans-serif" }}>Loading your account...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "#f0f2f5", paddingTop: "80px", paddingBottom: "40px", fontFamily: "'Segoe UI', sans-serif" }}>

      {/* ── HEADER ── */}
      <div style={{ background: "linear-gradient(135deg, #fd561e 0%, #ff8c42 100%)", padding: "28px 0 64px" }}>
        <div style={{ maxWidth: "860px", margin: "0 auto", padding: "0 20px" }}>
          <h1 style={{ color: "white", fontSize: "24px", fontWeight: "700", margin: "0 0 20px" }}>My Account</h1>

          {/* Profile + Balance card */}
          <div style={{ background: "rgba(255,255,255,0.15)", borderRadius: "16px", padding: "20px 24px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
              <div style={{ width: "52px", height: "52px", borderRadius: "50%", background: "rgba(255,255,255,0.3)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "22px", fontWeight: "800", color: "white" }}>
                {uname[0]?.toUpperCase()}
              </div>
              <div>
                <div style={{ fontSize: "18px", fontWeight: "700", color: "white" }}>{uname}</div>
                <div style={{ fontSize: "12px", color: "rgba(255,255,255,0.8)", marginTop: "2px" }}>{uemail || umob}</div>
              </div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: "11px", color: "rgba(255,255,255,0.7)", textTransform: "uppercase", letterSpacing: "0.8px" }}>Reward Balance</div>
              <div style={{ fontSize: "28px", fontWeight: "800", color: "white" }}>₹{currentBalance}</div>
            </div>
          </div>
        </div>
      </div>

      {/* ── CONTENT ── */}
      <div style={{ maxWidth: "860px", margin: "-36px auto 0", padding: "0 20px" }}>

        {error && (
          <div style={{ background: "#fff1f0", border: "1px solid #ffccc7", borderRadius: "10px", padding: "14px 18px", marginBottom: "16px", color: "#cf1322", fontSize: "14px" }}>
            {error}
          </div>
        )}

        {/* Section header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
          <h2 style={{ fontSize: "16px", fontWeight: "700", color: "#1a1a2e", margin: 0 }}>
            Transaction History
          </h2>
          <span style={{ fontSize: "13px", color: "#888" }}>{transactions.length} records</span>
        </div>

        {transactions.length === 0 && !error ? (
          <div style={{ background: "white", borderRadius: "16px", boxShadow: "0 2px 16px rgba(0,0,0,0.08)", padding: "60px 20px", textAlign: "center" }}>
            <div style={{ fontSize: "48px", marginBottom: "12px" }}>💳</div>
            <h3 style={{ fontSize: "16px", color: "#333", marginBottom: "6px" }}>No transactions yet</h3>
            <p style={{ color: "#888", fontSize: "13px" }}>Your reward point transactions will appear here.</p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {transactions.map((tx, i) => {
              const type = getTransactionType(tx);
              const isCredit = parseFloat(tx.tamount_cr) > 0;
              const isDebit  = parseFloat(tx.tamount_dr) > 0;

              return (
                <div key={tx.tid || i} style={{
                  background: "white", borderRadius: "14px",
                  boxShadow: "0 2px 10px rgba(0,0,0,0.06)",
                  border: "1px solid #f0f0f0",
                  overflow: "hidden"
                }}>
                  {/* TOP ROW */}
                  <div style={{ padding: "14px 18px 10px", display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <div style={{ width: "36px", height: "36px", borderRadius: "50%", background: type.color + "18", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "16px", flexShrink: 0 }}>
                        {type.icon}
                      </div>
                      <div>
                        <div style={{ fontSize: "13px", fontWeight: "700", color: "#1a1a2e" }}>{type.label}</div>
                        <div style={{ fontSize: "11px", color: "#aaa", marginTop: "2px", display: "flex", alignItems: "center", gap: "4px" }}>
                          <span>📅</span> {formatDate(tx.datetime)}
                        </div>
                      </div>
                    </div>
                    {/* Net change */}
                    <div style={{ textAlign: "right" }}>
                      {isCredit && (
                        <div style={{ fontSize: "15px", fontWeight: "800", color: "#16a34a" }}>
                          +₹{parseFloat(tx.tamount_cr).toFixed(2)}
                        </div>
                      )}
                      {isDebit && (
                        <div style={{ fontSize: "15px", fontWeight: "800", color: "#dc2626" }}>
                          -₹{parseFloat(tx.tamount_dr).toFixed(2)}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* DIVIDER */}
                  <div style={{ borderTop: "1px solid #f5f5f5", margin: "0 18px" }} />

                  {/* BOTTOM ROW */}
                  <div style={{ padding: "10px 18px 14px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "8px" }}>
                    <div>
                      <div style={{ fontSize: "10px", color: "#bbb", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "2px" }}>Reference</div>
                      <div style={{ fontSize: "12px", fontWeight: "600", color: "#555", fontFamily: "monospace" }}>{tx.treference || "—"}</div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontSize: "10px", color: "#bbb", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "2px" }}>Balance After</div>
                      <div style={{ fontSize: "13px", fontWeight: "700", color: "#fd561e" }}>₹{parseFloat(tx.newbal || 0).toFixed(2)}</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyAccount;