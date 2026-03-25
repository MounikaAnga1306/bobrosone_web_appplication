// src/modules/bus/pages/MyProfile.jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  User, Phone, Mail, Lock, ChevronRight,
  Edit2, Save, Users, Monitor
} from "lucide-react";

const MyProfile = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("profile");
  const [editing, setEditing] = useState(false);
  const [saved, setSaved] = useState(false);
  const [rewardBalance, setRewardBalance] = useState("0.00");

  // ── Load user from localStorage ──
  const getUser = () => {
    const stored = JSON.parse(localStorage.getItem("user") || "{}");
    return stored?.user || stored || {};
  };

  const buildProfile = (u) => ({
    firstName:     u.uname?.split(" ")[0] || "",
    lastName:      u.uname?.split(" ").slice(1).join(" ") || "",
    email:         u.uemail || u.email || u.uEmail || u.pemail || "",
    mobile:        u.umob || u.mobile || "",
    gender:        u.ugender || "",
    dob:           u.udob || "",
    nationality:   u.unationality || "",
    maritalStatus: u.umarital || "",
    anniversary:   u.uanniversary || "",
    city:          u.ucity || "",
    state:         u.ustate || "",
  });

  const [profile, setProfile] = useState(() => buildProfile(getUser()));
  const [original, setOriginal] = useState(() => buildProfile(getUser()));
  const isDirty = JSON.stringify(profile) !== JSON.stringify(original);

  // Re-load from localStorage on mount (ensures fresh data)
  useEffect(() => {
    const u = getUser();
    const p = buildProfile(u);
    setProfile(p);
    setOriginal(p);
  }, []);

  // ── Fetch reward balance ──
  useEffect(() => {
    const userBase = getUser(); if (!userBase.uid) return;
    axios.post("/myAccount", { uid: String(userBase.uid) })
      .then(res => {
        if (res.data?.success) {
          const rows = res.data.transactions || [];
          if (rows.length > 0) {
            const sorted = [...rows].sort((a, b) => b.tid - a.tid);
            setRewardBalance(parseFloat(sorted[0]?.newbal || 0).toFixed(2));
          }
        }
      })
      .catch(() => {});
  }, []);

  const handleChange = (field, value) => {
    setProfile(p => ({ ...p, [field]: value }));
  };

  const handleSave = () => {
    // Save extended profile back to localStorage
    const currentStored = JSON.parse(localStorage.getItem("user") || "{}");
    const currentBase   = currentStored?.user || currentStored || {};
    const updatedBase   = {
      ...currentBase,
      uname:        `${profile.firstName} ${profile.lastName}`.trim(),
      uemail:       profile.email,
      email:        profile.email,
      umob:         profile.mobile,
      ugender:      profile.gender,
      udob:         profile.dob,
      unationality: profile.nationality,
      umarital:     profile.maritalStatus,
      uanniversary: profile.anniversary,
      ucity:        profile.city,
      ustate:       profile.state,
    };
    // Preserve original structure (flat or nested)
    const updated = currentStored?.user
      ? { ...currentStored, user: updatedBase }
      : updatedBase;
    localStorage.setItem("user", JSON.stringify(updated));
    setOriginal({ ...profile });
    setEditing(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const inputCls = (disabled) =>
    `w-full border rounded-lg px-3 py-2.5 text-sm outline-none transition-all ${
      disabled
        ? "bg-gray-50 border-gray-200 text-gray-700 cursor-default"
        : "bg-white border-gray-300 focus:border-[#fd561e] focus:shadow-[0_0_0_3px_rgba(253,86,30,0.12)] text-gray-800"
    }`;

  const labelCls = "block text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1";

  // ── SIDEBAR ──
  const sideItems = [
    { id: "profile",      icon: User,    label: "My Profile"          },
    { id: "transactions", icon: null,    label: "Transaction Details"  },
    { id: "devices",      icon: Monitor, label: "Logged In Devices"    },
    { id: "reset",        icon: Lock,    label: "Reset Password"       },
  ];

  if (!getUser().uid) {
    navigate("/");
    return null;
  }

  return (
    <div style={{ minHeight: "100vh", background: "#f0f2f5", paddingTop: "80px", fontFamily: "'Segoe UI', sans-serif" }}>

      {/* ── HERO HEADER ── */}
      <div style={{
        background: "linear-gradient(135deg, #1a3c34 0%, #2d5a45 60%, #1a3c34 100%)",
        backgroundImage: "url('/assets/profile-bg.jpg'), linear-gradient(135deg, #1a3c34, #2d5a45)",
        backgroundSize: "cover", backgroundPosition: "center",
        padding: "32px 0 28px", position: "relative"
      }}>
        <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "0 24px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px" }}>

          {/* Left — avatar + name */}
          <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
            <div style={{
              width: "80px", height: "80px", borderRadius: "50%",
              background: "linear-gradient(135deg, #00c6a7, #009688)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: "28px", fontWeight: "800", color: "white",
              border: "3px solid rgba(255,255,255,0.3)", flexShrink: 0
            }}>
              {profile.firstName?.[0]?.toUpperCase() || "U"}
            </div>
            <div>
              <div style={{ fontSize: "22px", fontWeight: "700", color: "white" }}>
                {profile.firstName} {profile.lastName}
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "16px", marginTop: "6px", flexWrap: "wrap" }}>
                {profile.mobile && (
                  <span style={{ fontSize: "13px", color: "rgba(255,255,255,0.8)", display: "flex", alignItems: "center", gap: "5px" }}>
                    📞 {profile.mobile}
                  </span>
                )}
                {profile.email ? (
                  <span style={{ fontSize: "13px", color: "rgba(255,255,255,0.8)", display: "flex", alignItems: "center", gap: "5px" }}>
                    ✉️ {profile.email}
                  </span>
                ) : (
                  <span style={{ fontSize: "13px", color: "#fbbf24", cursor: "pointer" }}>✉️ Add Email Address</span>
                )}
              </div>
            </div>
          </div>

          {/* Right — reward balance */}
          <div style={{ display: "flex", gap: "12px" }}>
            <div
              onClick={() => setActiveTab("transactions")}
              style={{
                background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.25)",
                borderRadius: "10px", padding: "10px 18px", cursor: "pointer",
                display: "flex", alignItems: "center", gap: "8px",
                backdropFilter: "blur(6px)"
              }}
            >
              <span style={{ fontSize: "20px" }}>🪙</span>
              <div>
                <div style={{ fontSize: "10px", color: "rgba(255,255,255,0.7)", textTransform: "uppercase", letterSpacing: "0.5px" }}>Reward Points</div>
                <div style={{ fontSize: "16px", fontWeight: "800", color: "white" }}>₹{rewardBalance}</div>
              </div>
              <ChevronRight size={16} color="rgba(255,255,255,0.6)" />
            </div>
          </div>
        </div>
      </div>

      {/* ── MAIN CONTENT ── */}
      <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "24px", display: "flex", gap: "24px", alignItems: "flex-start" }}>

        {/* ── SIDEBAR ── */}
        <div style={{ width: "260px", flexShrink: 0 }}>
          <div style={{ background: "white", borderRadius: "14px", boxShadow: "0 2px 10px rgba(0,0,0,0.06)", overflow: "hidden" }}>
            <div style={{ padding: "12px 16px", borderBottom: "1px solid #f0f0f0" }}>
              <p style={{ fontSize: "10px", fontWeight: "700", color: "#aaa", textTransform: "uppercase", letterSpacing: "1px", margin: 0 }}>MY ACCOUNT</p>
            </div>
            {sideItems.map(item => (
              <button
                key={item.id}
                onClick={() => {
                  if (item.id === "transactions") { navigate("/my-account"); return; }
                  if (item.id === "reset") { navigate("/forgot-password"); return; }
                  setActiveTab(item.id);
                }}
                style={{
                  width: "100%", textAlign: "left", padding: "14px 18px",
                  borderBottom: "1px solid #f5f5f5", background: activeTab === item.id ? "#fff5f2" : "white",
                  borderLeft: activeTab === item.id ? "3px solid #fd561e" : "3px solid transparent",
                  cursor: "pointer", display: "flex", alignItems: "center", gap: "10px",
                  transition: "all 0.15s"
                }}
              >
                <span style={{ fontSize: "14px", color: activeTab === item.id ? "#fd561e" : "#888" }}>
                  {item.id === "profile"      ? "👤" :
                   item.id === "transactions" ? "💳" :
                   item.id === "devices"      ? "🖥️" : "🔑"}
                </span>
                <span style={{ fontSize: "13px", fontWeight: activeTab === item.id ? "700" : "500", color: activeTab === item.id ? "#fd561e" : "#555" }}>
                  {item.label}
                </span>
                {item.id === "profile" && (
                  <span style={{ marginLeft: "auto", width: "8px", height: "8px", borderRadius: "50%", background: isDirty ? "#fd561e" : "#22c55e" }} />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* ── PROFILE CONTENT ── */}
        <div style={{ flex: 1 }}>

          {/* Success toast */}
          {saved && (
            <div style={{
              background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: "10px",
              padding: "12px 18px", marginBottom: "16px", color: "#16a34a",
              fontSize: "14px", fontWeight: "600", display: "flex", alignItems: "center", gap: "8px"
            }}>
              ✅ Profile saved successfully!
            </div>
          )}

          <div style={{ background: "white", borderRadius: "14px", boxShadow: "0 2px 10px rgba(0,0,0,0.06)" }}>

            {/* Section header */}
            <div style={{ padding: "20px 24px", borderBottom: "1px solid #f0f0f0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h2 style={{ fontSize: "18px", fontWeight: "700", color: "#1a1a2e", margin: 0 }}>My Profile</h2>
              {!editing ? (
                <button
                  onClick={() => setEditing(true)}
                  style={{ display: "flex", alignItems: "center", gap: "6px", background: "none", border: "none", color: "#2563eb", fontSize: "14px", fontWeight: "600", cursor: "pointer" }}
                >
                  <Edit2 size={14} /> Edit
                </button>
              ) : (
                <div style={{ display: "flex", gap: "10px" }}>
                  <button
                    onClick={() => { setProfile({ ...original }); setEditing(false); }}
                    style={{ padding: "7px 18px", border: "1.5px solid #e5e7eb", borderRadius: "8px", background: "white", fontSize: "13px", fontWeight: "600", color: "#666", cursor: "pointer" }}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={!isDirty}
                    style={{
                      padding: "7px 20px", border: "none", borderRadius: "8px",
                      background: isDirty ? "linear-gradient(135deg, #fd561e, #ff8c42)" : "#e5e7eb",
                      fontSize: "13px", fontWeight: "700", color: isDirty ? "white" : "#aaa",
                      cursor: isDirty ? "pointer" : "not-allowed",
                      display: "flex", alignItems: "center", gap: "6px"
                    }}
                  >
                    <Save size={13} /> Save
                  </button>
                </div>
              )}
            </div>

            <div style={{ padding: "24px" }}>

              {/* General Information */}
              <div style={{ marginBottom: "28px" }}>
                <h3 style={{ fontSize: "15px", fontWeight: "700", color: "#1a1a2e", marginBottom: "16px", paddingBottom: "8px", borderBottom: "1px solid #f0f0f0" }}>
                  General Information
                </h3>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>

                  <div>
                    <label className={labelCls} style={{ display: "block", fontSize: "10px", fontWeight: "600", color: "#aaa", textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: "5px" }}>
                      First & Middle Name
                    </label>
                    <input
                      className={inputCls(!editing)}
                      style={{ width: "100%", border: `1.5px solid ${editing ? "#d1d5db" : "#e5e7eb"}`, borderRadius: "8px", padding: "10px 12px", fontSize: "14px", outline: "none", background: editing ? "white" : "#f9f9f9", color: "#1a1a2e", transition: "all 0.2s", boxSizing: "border-box" }}
                      value={profile.firstName}
                      onChange={e => handleChange("firstName", e.target.value)}
                      disabled={!editing}
                      placeholder="First name"
                    />
                  </div>

                  <div>
                    <label style={{ display: "block", fontSize: "10px", fontWeight: "600", color: "#aaa", textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: "5px" }}>Last Name</label>
                    <input
                      style={{ width: "100%", border: `1.5px solid ${editing ? "#d1d5db" : "#e5e7eb"}`, borderRadius: "8px", padding: "10px 12px", fontSize: "14px", outline: "none", background: editing ? "white" : "#f9f9f9", color: "#1a1a2e", transition: "all 0.2s", boxSizing: "border-box" }}
                      value={profile.lastName}
                      onChange={e => handleChange("lastName", e.target.value)}
                      disabled={!editing}
                      placeholder="Last name"
                    />
                  </div>

                  <div>
                    <label style={{ display: "block", fontSize: "10px", fontWeight: "600", color: "#aaa", textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: "5px" }}>Gender</label>
                    <select
                      style={{ width: "100%", border: `1.5px solid ${editing ? "#d1d5db" : "#e5e7eb"}`, borderRadius: "8px", padding: "10px 12px", fontSize: "14px", outline: "none", background: editing ? "white" : "#f9f9f9", color: profile.gender ? "#1a1a2e" : "#aaa", transition: "all 0.2s", boxSizing: "border-box" }}
                      value={profile.gender}
                      onChange={e => handleChange("gender", e.target.value)}
                      disabled={!editing}
                    >
                      <option value="">GENDER</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ display: "block", fontSize: "10px", fontWeight: "600", color: "#aaa", textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: "5px" }}>Date of Birth</label>
                    <input
                      type={editing ? "date" : "text"}
                      style={{ width: "100%", border: `1.5px solid ${editing ? "#d1d5db" : "#e5e7eb"}`, borderRadius: "8px", padding: "10px 12px", fontSize: "14px", outline: "none", background: editing ? "white" : "#f9f9f9", color: profile.dob ? "#1a1a2e" : "#aaa", transition: "all 0.2s", boxSizing: "border-box" }}
                      value={profile.dob}
                      onChange={e => handleChange("dob", e.target.value)}
                      disabled={!editing}
                      placeholder="DATE OF BIRTH"
                    />
                  </div>

                  <div>
                    <label style={{ display: "block", fontSize: "10px", fontWeight: "600", color: "#aaa", textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: "5px" }}>Nationality</label>
                    <input
                      style={{ width: "100%", border: `1.5px solid ${editing ? "#d1d5db" : "#e5e7eb"}`, borderRadius: "8px", padding: "10px 12px", fontSize: "14px", outline: "none", background: editing ? "white" : "#f9f9f9", color: profile.nationality ? "#1a1a2e" : "#aaa", transition: "all 0.2s", boxSizing: "border-box" }}
                      value={profile.nationality}
                      onChange={e => handleChange("nationality", e.target.value)}
                      disabled={!editing}
                      placeholder="NATIONALITY"
                    />
                  </div>

                  <div>
                    <label style={{ display: "block", fontSize: "10px", fontWeight: "600", color: "#aaa", textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: "5px" }}>Marital Status</label>
                    <select
                      style={{ width: "100%", border: `1.5px solid ${editing ? "#d1d5db" : "#e5e7eb"}`, borderRadius: "8px", padding: "10px 12px", fontSize: "14px", outline: "none", background: editing ? "white" : "#f9f9f9", color: profile.maritalStatus ? "#1a1a2e" : "#aaa", transition: "all 0.2s", boxSizing: "border-box" }}
                      value={profile.maritalStatus}
                      onChange={e => handleChange("maritalStatus", e.target.value)}
                      disabled={!editing}
                    >
                      <option value="">MARITAL STATUS</option>
                      <option value="Single">Single</option>
                      <option value="Married">Married</option>
                      <option value="Divorced">Divorced</option>
                      <option value="Widowed">Widowed</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ display: "block", fontSize: "10px", fontWeight: "600", color: "#aaa", textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: "5px" }}>City of Residence</label>
                    <input
                      style={{ width: "100%", border: `1.5px solid ${editing ? "#d1d5db" : "#e5e7eb"}`, borderRadius: "8px", padding: "10px 12px", fontSize: "14px", outline: "none", background: editing ? "white" : "#f9f9f9", color: profile.city ? "#1a1a2e" : "#aaa", transition: "all 0.2s", boxSizing: "border-box" }}
                      value={profile.city}
                      onChange={e => handleChange("city", e.target.value)}
                      disabled={!editing}
                      placeholder="CITY OF RESIDENCE"
                    />
                  </div>

                  <div>
                    <label style={{ display: "block", fontSize: "10px", fontWeight: "600", color: "#aaa", textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: "5px" }}>State</label>
                    <input
                      style={{ width: "100%", border: `1.5px solid ${editing ? "#d1d5db" : "#e5e7eb"}`, borderRadius: "8px", padding: "10px 12px", fontSize: "14px", outline: "none", background: editing ? "white" : "#f9f9f9", color: profile.state ? "#1a1a2e" : "#aaa", transition: "all 0.2s", boxSizing: "border-box" }}
                      value={profile.state}
                      onChange={e => handleChange("state", e.target.value)}
                      disabled={!editing}
                      placeholder="STATE"
                    />
                  </div>
                </div>
              </div>

              {/* Contact Details */}
              <div>
                <h3 style={{ fontSize: "15px", fontWeight: "700", color: "#1a1a2e", marginBottom: "16px", paddingBottom: "8px", borderBottom: "1px solid #f0f0f0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  Contact Details
                </h3>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>

                  <div>
                    <label style={{ display: "block", fontSize: "10px", fontWeight: "600", color: "#aaa", textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: "5px" }}>Mobile Number</label>
                    <div style={{ display: "flex", border: `1.5px solid #e5e7eb`, borderRadius: "8px", overflow: "hidden", background: "#f9f9f9" }}>
                      <span style={{ padding: "10px 12px", background: "#f0f0f0", fontSize: "13px", color: "#555", borderRight: "1px solid #e5e7eb", fontWeight: "600" }}>+91</span>
                      <input
                        style={{ flex: 1, padding: "10px 12px", fontSize: "14px", outline: "none", background: "#f9f9f9", color: "#1a1a2e", border: "none" }}
                        value={profile.mobile}
                        disabled
                        placeholder="Mobile number"
                      />
                    </div>
                    <p style={{ fontSize: "11px", color: "#aaa", marginTop: "4px" }}>Mobile number cannot be changed</p>
                  </div>

                  <div>
                    <label style={{ display: "block", fontSize: "10px", fontWeight: "600", color: "#aaa", textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: "5px" }}>Email Address</label>
                    <input
                      style={{ width: "100%", border: `1.5px solid ${editing ? "#d1d5db" : "#e5e7eb"}`, borderRadius: "8px", padding: "10px 12px", fontSize: "14px", outline: "none", background: editing ? "white" : "#f9f9f9", color: profile.email ? "#1a1a2e" : "#aaa", transition: "all 0.2s", boxSizing: "border-box" }}
                      value={profile.email}
                      onChange={e => handleChange("email", e.target.value)}
                      disabled={!editing}
                      placeholder="Add email address"
                    />
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyProfile;