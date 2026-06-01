import React, { useState, useEffect } from "react";
import { Phone, MapPin, User, MessageSquare, CheckCircle, Clock } from "lucide-react";

const inputStyle = {
  width: "100%",
  boxSizing: "border-box",
  padding: "12px 14px 12px 40px",
  border: "1.5px solid #e8e8e8",
  borderRadius: 10,
  fontSize: "clamp(13px, 3vw, 14px)",
  outline: "none",
  fontFamily: "inherit",
  color: "#1a1a2e",
  background: "#fafafa",
  transition: "border-color 0.2s, background 0.2s",
};

const errorStyle = {
  color: "#e53e3e",
  fontSize: "clamp(10px, 2.2vw, 11.5px)",
  marginTop: 5,
  display: "flex",
  alignItems: "center",
  gap: 4,
};

const MailIcon = ({ size = 16, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="4" width="20" height="16" rx="2" />
    <polyline points="2,4 12,13 22,4" />
  </svg>
);

const WhatsAppIcon = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
  </svg>
);

const Field = ({ label, icon, children, error }) => (
  <div>
    <label style={{ fontSize: "clamp(11px, 2.5vw, 12.5px)", fontWeight: 600, color: "#444", display: "block", marginBottom: 7 }}>
      {label}
    </label>
    <div style={{ position: "relative" }}>
      <div style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: error ? "#e53e3e" : "#bbb", display: "flex" }}>
        {icon}
      </div>
      {children}
    </div>
    {error && <p style={errorStyle}><span>⚠</span> {error}</p>}
  </div>
);

// ── Separate component for hoverable card ──
const ContactCard = ({ card }) => {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      onClick={() => card.href && window.open(card.href, card.href.startsWith("mailto") ? "_blank" : "_self")}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: "#fff",
        borderRadius: 18,
        padding: "clamp(20px, 4vw, 26px) clamp(18px, 3.5vw, 24px)",
        boxShadow: hovered ? "0 14px 36px rgba(253,86,30,0.13)" : "0 2px 16px rgba(0,0,0,0.06)",
        border: `1px solid ${hovered && card.href ? "rgba(253,86,30,0.22)" : "rgba(0,0,0,0.05)"}`,
        display: "flex",
        alignItems: "flex-start",
        gap: "clamp(12px, 2.5vw, 16px)",
        transition: "transform 0.2s, box-shadow 0.2s, border-color 0.2s",
        cursor: card.href ? "pointer" : "default",
        transform: hovered && card.href ? "translateY(-5px)" : "translateY(0)",
      }}
    >
      <div style={{ width: "clamp(44px, 8vw, 50px)", height: "clamp(44px, 8vw, 50px)", borderRadius: 14, flexShrink: 0, background: "linear-gradient(135deg, #FD561E, #ff7a4d)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", boxShadow: "0 4px 14px rgba(253,86,30,0.3)" }}>{card.icon}</div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontSize: "clamp(9px, 2.2vw, 10.5px)", color: "#bbb", fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.8, margin: "0 0 6px" }}>{card.label}</p>
        <p style={{
          fontSize: "clamp(12px, 3vw, 14.5px)",
          fontWeight: 700,
          // ── hover అయినప్పుడు clickable cards కి #FD561E, లేదంటే original color ──
          color: card.href ? (hovered ? "#FD561E" : "#1a1a2e") : "#1a1a2e",
          margin: "0 0 5px",
          lineHeight: 1.45,
          wordBreak: "break-word",
          transition: "color 0.2s",
        }}>{card.value}</p>
        <p style={{ fontSize: "clamp(10px, 2.5vw, 12px)", color: "#aaa", margin: 0 }}>{card.sub}</p>
      </div>
    </div>
  );
};

// ── Separate component for hoverable left panel item ──
const LeftPanelItem = ({ item }) => {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      onClick={() => item.href && window.open(item.href, item.href.startsWith("mailto") ? "_blank" : "_self")}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: "flex",
        alignItems: "center",
        gap: "clamp(10px, 2.5vw, 14px)",
        marginBottom: "clamp(14px, 3vw, 18px)",
        cursor: item.href ? "pointer" : "default",
      }}
    >
      <div style={{ width: "clamp(32px, 7vw, 36px)", height: "clamp(32px, 7vw, 36px)", borderRadius: 10, flexShrink: 0, background: "rgba(253,86,30,0.18)", border: "1px solid rgba(253,86,30,0.3)", display: "flex", alignItems: "center", justifyContent: "center", color: "#FD561E" }}>{item.icon}</div>
      <span style={{
        fontSize: "clamp(11px, 2.5vw, 13.5px)",
        // ── hover అయినప్పుడు clickable items కి bright orange, లేదంటే soft color ──
        color: item.href ? (hovered ? "#FD561E" : "rgba(255,255,255,0.75)") : "rgba(255,255,255,0.75)",
        wordBreak: "break-word",
        transition: "color 0.2s",
      }}>{item.text}</span>
    </div>
  );
};

const ContactUs = () => {
  useEffect(() => { window.scrollTo(0, 0); }, []);

  const [formData, setFormData] = useState({ name: "", email: "", phone: "", message: "" });
  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState({ type: "", show: false });

  const handleChange = (e) => {
    const { name, value } = e.target;
    let filtered = value;
    if (name === "name") filtered = value.replace(/[^a-zA-Z\u0C00-\u0C7F\u0900-\u097F\s]/g, "");
    else if (name === "email") filtered = value.replace(/[^a-zA-Z0-9@.]/g, "");
    else if (name === "phone") filtered = value.replace(/\D/g, "").slice(0, 10);
    else if (name === "message") filtered = value.replace(/[^a-zA-Z0-9\u0C00-\u0C7F\u0900-\u097F\s.,]/g, "");
    setFormData(prev => ({ ...prev, [name]: filtered }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: "" }));
  };

  const validate = () => {
    const errs = {};
    const nameTrimmed = formData.name.trim();
    if (!nameTrimmed) errs.name = "Full name is required.";
    else if (nameTrimmed.length < 2) errs.name = "Name must be at least 2 characters.";
    else if (!/^[a-zA-Z\u0C00-\u0C7F\u0900-\u097F\s]+$/.test(nameTrimmed)) errs.name = "Name must contain letters only — no numbers or symbols.";

    const emailTrimmed = formData.email.trim();
    if (!emailTrimmed) errs.email = "Email address is required.";
    else if (!/^[a-zA-Z0-9.]+@[a-zA-Z0-9.]+\.[a-zA-Z]{2,}$/.test(emailTrimmed)) errs.email = "Enter a valid email (e.g. name@example.com).";
    else if (emailTrimmed.includes("..")) errs.email = "Email cannot have consecutive dots.";

    const phoneTrimmed = formData.phone.trim();
    if (phoneTrimmed && !/^[6-9]\d{9}$/.test(phoneTrimmed)) errs.phone = "Enter a valid 10-digit number starting with 6–9.";

    const msgTrimmed = formData.message.trim();
    if (msgTrimmed.length > 0 && msgTrimmed.length < 5) errs.message = "Message must be at least 5 characters if provided.";
    else if (msgTrimmed.length > 1000) errs.message = "Message cannot exceed 1000 characters.";

    return errs;
  };

  const buildWhatsAppText = () => encodeURIComponent(
    `Hello BOBROS Team! 👋\n\n` +
    `I would like to connect with you and know more about your services.\n\n` +
    `━━━━━━━━━━━━━━━━━━━━\n` +
    `📋 *My Details*\n` +
    `━━━━━━━━━━━━━━━━━━━━\n` +
    `👤 *Name:* ${formData.name.trim()}\n` +
    `📧 *Email:* ${formData.email.trim()}\n` +
    `📱 *Phone:* ${formData.phone.trim() || "Not provided"}\n\n` +
    `💬 *My Message:*\n${formData.message.trim() || "No message provided."}\n\n` +
    `━━━━━━━━━━━━━━━━━━━━\n` +
    `I want to know more about your services. Please let me know the next steps. Thank you! 🙏`
  );

  const buildEmailBody = () => encodeURIComponent(
    `Hello BOBROS Team,\n\n` +
    `I would like to connect with you and know more about your services.\n\n` +
    `─────────────────────────────\n` +
    `My Details:\n` +
    `─────────────────────────────\n` +
    `Name    : ${formData.name.trim()}\n` +
    `Email   : ${formData.email.trim()}\n` +
    `Phone   : ${formData.phone.trim() || "Not provided"}\n\n` +
    `My Message:\n` +
    `${formData.message.trim() || "No message provided."}\n\n` +
    `─────────────────────────────\n` +
    `I want to know more about your services and would love to explore how we can work together.\n` +
    `Please feel free to reach out to me at your earliest convenience.\n\n` +
    `Thank you,\n` +
    `${formData.name.trim()}`
  );

  const handleWhatsApp = () => {
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    window.open(`https://wa.me/919133133456?text=${buildWhatsAppText()}`, "_blank");
    setSubmitted({ type: "whatsapp", show: true });
    setTimeout(() => setSubmitted({ type: "", show: false }), 4000);
    setFormData({ name: "", email: "", phone: "", message: "" });
    setErrors({});
  };

  const handleEmail = () => {
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    const subject = encodeURIComponent(`Service Enquiry from ${formData.name.trim()} – BOBROS`);
    window.open(`mailto:customersupport@bobrosone.com?subject=${subject}&body=${buildEmailBody()}`, "_blank");
    setSubmitted({ type: "email", show: true });
    setTimeout(() => setSubmitted({ type: "", show: false }), 4000);
    setFormData({ name: "", email: "", phone: "", message: "" });
    setErrors({});
  };

  const cards = [
    { icon: <Phone size={20} />, label: "Customer Support & Offline Booking", value: "+91-9133 133 456", sub: "Mon–Sat, 9:30am – 7:30pm", href: "tel:+919133133456" },
    { icon: <MailIcon size={20} color="#fff" />, label: "Customer Support – Email", value: "customersupport@bobrosone.com", sub: "We reply within 24 hours", href: "mailto:customersupport@bobrosone.com" },
    { icon: <MapPin size={20} />, label: "Registered Office", value: "1-232, Mulakaluru, Narasaraopet – 522601", sub: "Andhra Pradesh, India", href: null },
    { icon: <MapPin size={20} />, label: "Branch Office", value: "202, Block B, Anjanadri Residence, Aurobindo Colony, Miyapur", sub: "Hyderabad – 500049, Telangana, India", href: null },
    { icon: <MailIcon size={20} color="#fff" />, label: "Share Holders & Public Relations", value: "ir@bobroscapital.com", sub: "Investor inquiries welcome", href: "mailto:ir@bobroscapital.com" },
    { icon: <Clock size={20} />, label: "Business Hours", value: "9:30am – 7:30pm", sub: "Monday to Saturday (Except holidays)", href: null },
  ];

 const leftPanelItems = [
  { icon: <Phone size={16} />, text: "+91-9133 133 456", href: "tel:+919133133456" },
  { 
    icon: <MailIcon size={16} color="#FD561E" />, 
    text: "customersupport@bobrosone.com", 
    href: `mailto:customersupport@bobrosone.com?subject=${encodeURIComponent("Enquiry – BOBROS")}&body=${encodeURIComponent("Hello BOBROS Team,\n\nI would like to connect with you and know more about your services.\n\nThank you")}` 
  },
  { icon: <MapPin size={16} />, text: "Miyapur, Hyderabad – 500049", href: null },
  { icon: <Clock size={16} />, text: "Mon–Sat, 9:30am – 7:30pm", href: null },
];

  return (
    <div style={{ fontFamily: "'Segoe UI', 'Poppins', sans-serif", background: "#F0F2F8", minHeight: "100vh", marginTop: "80px", overflowX: "hidden" }}>

      {/* ── HERO ── */}
      <div style={{ position: "relative", width: "100%", height: "clamp(280px, 50vh, 380px)", overflow: "hidden", background: "linear-gradient(135deg, #0f1432 0%, #1a2050 45%, #FD561E 160%)" }}>
        <img src="/images/c2.png" alt="Contact Us" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} onError={e => { e.target.style.display = "none"; }} />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(135deg, rgba(15,20,50,0.88) 0%, rgba(25,30,60,0.72) 55%, rgba(253,86,30,0.42) 120%)" }} />
        <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", padding: "0 20px" }}>
          <div style={{ background: "rgba(253,86,30,0.2)", border: "1px solid rgba(253,86,30,0.5)", color: "#ffaa88", fontSize: "clamp(9px, 2.5vw, 11px)", fontWeight: 700, letterSpacing: 3, padding: "6px 18px", borderRadius: 30, marginBottom: 18 }}>BOBROS</div>
          <h1 style={{ color: "#fff", fontSize: "clamp(32px, 8vw, 52px)", fontWeight: 900, margin: "0 0 14px", lineHeight: 1.1, letterSpacing: -1 }}>
            Contact <span style={{ color: "#FD561E" }}>Us</span>
          </h1>
          <p style={{ color: "rgba(255,255,255,0.7)", fontSize: "clamp(13px, 3.5vw, 16px)", margin: "0 0 24px", maxWidth: "90%", padding: "0 16px" }}>
            We're here to help. Reach out for support, bookings, or any inquiries — we'll get back to you promptly.
          </p>
          <div style={{ display: "flex", gap: 12, alignItems: "center", background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.2)", borderRadius: 30, padding: "8px 18px", flexWrap: "wrap", justifyContent: "center" }}>
            <Clock size={15} color="#FD561E" />
            <span style={{ color: "rgba(255,255,255,0.85)", fontSize: "clamp(11px, 2.8vw, 13px)" }}>Business Hours: 9:30am – 7:30pm &nbsp;|&nbsp; Monday to Saturday</span>
          </div>
        </div>
      </div>

      {/* ── BODY ── */}
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "clamp(40px, 8vw, 60px) clamp(20px, 5vw, 40px) clamp(40px, 8vw, 80px)" }}>

        <div style={{ textAlign: "center", marginBottom: "clamp(32px, 6vw, 44px)" }}>
          <p style={{ fontSize: "clamp(10px, 2.5vw, 12px)", fontWeight: 700, color: "#FD561E", letterSpacing: 2, textTransform: "uppercase", margin: "0 0 8px" }}>GET IN TOUCH</p>
          <h2 style={{ fontSize: "clamp(24px, 6vw, 34px)", fontWeight: 800, color: "#1a1a2e", margin: "0 0 12px", letterSpacing: -0.5 }}>Contact Information</h2>
          <p style={{ fontSize: "clamp(13px, 3vw, 15px)", color: "#888", margin: "0 auto", maxWidth: "90%", padding: "0 16px" }}>Multiple ways to reach us — choose what works best for you.</p>
        </div>

        {/* ── CARDS ── */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 320px), 1fr))", gap: "clamp(16px, 3vw, 22px)", marginBottom: "clamp(40px, 8vw, 68px)" }}>
          {cards.map((card, i) => <ContactCard key={i} card={card} />)}
        </div>

        <div style={{ textAlign: "center", marginBottom: "clamp(28px, 5vw, 36px)" }}>
          <p style={{ fontSize: "clamp(10px, 2.5vw, 12px)", fontWeight: 700, color: "#FD561E", letterSpacing: 2, textTransform: "uppercase", margin: "0 0 8px" }}>REACH OUT</p>
          <h2 style={{ fontSize: "clamp(24px, 6vw, 34px)", fontWeight: 800, color: "#1a1a2e", margin: 0, letterSpacing: -0.5 }}>Send Us a Message</h2>
        </div>

        {/* ── FORM CARD ── */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 0, background: "#fff", borderRadius: 24, overflow: "hidden", boxShadow: "0 8px 48px rgba(0,0,0,0.1)", border: "1px solid rgba(0,0,0,0.06)" }}>

          {/* LEFT dark panel */}
          <div style={{ background: "linear-gradient(160deg, #1a1a2e 0%, #0f3460 65%, #1f1035 100%)", padding: "clamp(32px, 6vw, 48px) clamp(24px, 5vw, 40px)", display: "flex", flexDirection: "column", position: "relative", overflow: "hidden" }}>
            <div>
              <h3 style={{ fontSize: "clamp(20px, 5vw, 26px)", fontWeight: 800, color: "#fff", margin: "0 0 14px", lineHeight: 1.25 }}>We'd Love to<br />Hear From You</h3>
              <p style={{ fontSize: "clamp(12px, 2.8vw, 14px)", color: "rgba(255,255,255,0.55)", margin: "0 0 clamp(24px, 5vw, 40px)", lineHeight: 1.75 }}>Fill in the form and our team will respond within 24 hours.</p>
              {leftPanelItems.map((item, i) => <LeftPanelItem key={i} item={item} />)}
            </div>
            {[{ size: 180, bottom: -60, right: -60 }, { size: 100, bottom: 60, right: 40 }, { size: 50, bottom: 140, right: 140 }].map((c, i) => (
              <div key={i} style={{ position: "absolute", borderRadius: "50%", width: c.size, height: c.size, bottom: c.bottom, right: c.right, border: "1.5px solid rgba(253,86,30,0.18)", background: "rgba(253,86,30,0.05)" }} />
            ))}
            <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 4, background: "linear-gradient(90deg, #FD561E, #ff9c7a)" }} />
          </div>

          {/* RIGHT form */}
          <div style={{ padding: "clamp(32px, 6vw, 48px) clamp(24px, 5vw, 52px)" }}>
            <p style={{ fontSize: "clamp(20px, 2.8vw, 13.5px)", color: "#171616", margin: "0 0 clamp(20px, 4vw, 30px)" }}>Enquiry Form</p>

            {submitted.show && (
              <div style={{ background: submitted.type === "whatsapp" ? "#f0fdf4" : "#eff6ff", border: `1px solid ${submitted.type === "whatsapp" ? "#86efac" : "#93c5fd"}`, borderRadius: 12, padding: "12px 16px", display: "flex", alignItems: "center", gap: 10, marginBottom: 24, flexWrap: "wrap" }}>
                <CheckCircle size={18} color={submitted.type === "whatsapp" ? "#16a34a" : "#2563eb"} />
                <span style={{ fontSize: "clamp(12px, 2.8vw, 13.5px)", color: submitted.type === "whatsapp" ? "#15803d" : "#1d4ed8", fontWeight: 600 }}>
                  {submitted.type === "whatsapp" ? "WhatsApp opened! Continue the conversation there. 💬" : "Email client opened! Your enquiry is ready to send. 📧"}
                </span>
              </div>
            )}

            <div style={{ display: "flex", flexDirection: "column", gap: "clamp(16px, 3vw, 20px)" }}>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "clamp(14px, 3vw, 18px)" }}>
                <Field label="Full Name *" icon={<User size={15} />} error={errors.name}>
                  <input name="name" value={formData.name} onChange={handleChange} placeholder="Enter Your Name"
                    style={{ ...inputStyle, borderColor: errors.name ? "#e53e3e" : "#e8e8e8" }}
                    onFocus={e => { e.target.style.borderColor = errors.name ? "#e53e3e" : "#FD561E"; e.target.style.background = "#fff"; }}
                    onBlur={e => { e.target.style.borderColor = errors.name ? "#e53e3e" : "#e8e8e8"; e.target.style.background = "#fafafa"; }}
                  />
                </Field>
                <Field label="Phone Number *" icon={<Phone size={15} />} error={errors.phone}>
                  <input name="phone" type="tel" value={formData.phone} onChange={handleChange} placeholder="10-digit mobile number" maxLength={10}
                    style={{ ...inputStyle, borderColor: errors.phone ? "#e53e3e" : "#e8e8e8" }}
                    onFocus={e => { e.target.style.borderColor = errors.phone ? "#e53e3e" : "#FD561E"; e.target.style.background = "#fff"; }}
                    onBlur={e => { e.target.style.borderColor = errors.phone ? "#e53e3e" : "#e8e8e8"; e.target.style.background = "#fafafa"; }}
                  />
                </Field>
              </div>

              <Field label="Email Address *" icon={<MailIcon size={15} color={errors.email ? "#e53e3e" : "#bbb"} />} error={errors.email}>
                <input name="email" type="text" value={formData.email} onChange={handleChange} placeholder="name@example.com"
                  style={{ ...inputStyle, borderColor: errors.email ? "#e53e3e" : "#e8e8e8" }}
                  onFocus={e => { e.target.style.borderColor = errors.email ? "#e53e3e" : "#FD561E"; e.target.style.background = "#fff"; }}
                  onBlur={e => { e.target.style.borderColor = errors.email ? "#e53e3e" : "#e8e8e8"; e.target.style.background = "#fafafa"; }}
                />
              </Field>

              <div>
                <label style={{ fontSize: "clamp(11px, 2.5vw, 12.5px)", fontWeight: 600, color: "#444", display: "block", marginBottom: 7 }}>
                  Message <span style={{ fontSize: "clamp(9px, 2vw, 10px)", color: "#aaa", fontWeight: 400, marginLeft: 6 }}>(optional)</span>
                </label>
                <div style={{ position: "relative" }}>
                  <MessageSquare size={15} color={errors.message ? "#e53e3e" : "#bbb"} style={{ position: "absolute", left: 12, top: 14 }} />
                  <textarea name="message" value={formData.message} onChange={handleChange} rows={5}
                    placeholder="Tell us what you'd like to know more about. (optional)"
                    style={{ ...inputStyle, paddingTop: 12, paddingBottom: 12, resize: "vertical", borderColor: errors.message ? "#e53e3e" : "#e8e8e8" }}
                    onFocus={e => { e.target.style.borderColor = errors.message ? "#e53e3e" : "#FD561E"; e.target.style.background = "#fff"; }}
                    onBlur={e => { e.target.style.borderColor = errors.message ? "#e53e3e" : "#e8e8e8"; e.target.style.background = "#fafafa"; }}
                  />
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 4 }}>
                  {errors.message ? <p style={{ ...errorStyle, margin: 0 }}><span>⚠</span> {errors.message}</p> : <span />}
                  {formData.message.length > 0 && (
                    <span style={{ fontSize: "clamp(10px, 2vw, 11px)", color: formData.message.length > 900 ? "#e53e3e" : "#bbb", marginLeft: "auto", flexShrink: 0 }}>
                      {formData.message.length}/1000
                    </span>
                  )}
                </div>
              </div>

              <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                <button onClick={handleWhatsApp}
                  style={{ flex: 1, minWidth: "140px", background: "linear-gradient(135deg, #25D366 0%, #128C7E 100%)", color: "#fff", border: "none", borderRadius: 12, padding: "clamp(12px, 3vw, 14px) clamp(16px, 3vw, 24px)", fontSize: "clamp(12px, 2.8vw, 14px)", fontWeight: 700, cursor: "pointer", display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8, boxShadow: "0 4px 18px rgba(37,211,102,0.35)", fontFamily: "inherit", transition: "transform 0.15s, box-shadow 0.15s" }}
                  onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 8px 24px rgba(37,211,102,0.5)"; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 4px 18px rgba(37,211,102,0.35)"; }}
                >
                  <WhatsAppIcon size={16} /> Send WhatsApp
                </button>
                <button onClick={handleEmail}
                  style={{ flex: 1, minWidth: "140px", background: "linear-gradient(135deg, #FD561E 0%, #ff7a4d 100%)", color: "#fff", border: "none", borderRadius: 12, padding: "clamp(12px, 3vw, 14px) clamp(16px, 3vw, 24px)", fontSize: "clamp(12px, 2.8vw, 14px)", fontWeight: 700, cursor: "pointer", display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8, boxShadow: "0 4px 18px rgba(253,86,30,0.38)", fontFamily: "inherit", transition: "transform 0.15s, box-shadow 0.15s" }}
                  onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 8px 24px rgba(253,86,30,0.5)"; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 4px 18px rgba(253,86,30,0.38)"; }}
                >
                  <MailIcon size={16} color="#fff" /> Send Enquiry
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactUs;