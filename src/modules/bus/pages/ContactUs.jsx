import React, { useState,useEffect } from "react";
import { Phone, Mail, MapPin, Send, User, MessageSquare, CheckCircle, Clock } from "lucide-react";

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

const Field = ({ label, icon, children }) => (
  <div>
    <label style={{ 
      fontSize: "clamp(11px, 2.5vw, 12.5px)", 
      fontWeight: 600, 
      color: "#444", 
      display: "block", 
      marginBottom: 7 
    }}>
      {label}
    </label>
    <div style={{ position: "relative" }}>
      <div style={{ 
        position: "absolute", 
        left: 12, 
        top: "50%", 
        transform: "translateY(-50%)", 
        color: "#bbb", 
        display: "flex" 
      }}>
        {icon}
      </div>
      {children}
    </div>
  </div>
);

const ContactUs = () => {

   useEffect(() => {
      window.scrollTo(0, 0);
    }, []);
    
  const [formData, setFormData] = useState({ name: "", email: "", phone: "", message: "" });
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = () => {
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 4000);
    setFormData({ name: "", email: "", phone: "", message: "" });
  };

  const cards = [
    {
      icon: <Phone size={20} />,
      label: "Customer Support & Offline Booking",
      value: "+91-9133 133 456",
      sub: "Mon–Sat, 9:30am – 7:00pm",
    },
    {
      icon: <Mail size={20} />,
      label: "Customer Support – Email",
      value: "customersupport@bobrosone.com",
      sub: "We reply within 24 hours",
    },
    {
      icon: <MapPin size={20} />,
      label: "Registered Office",
      value: "1-232, Mulakaluru, Narasaraopet – 522601",
      sub: "Andhra Pradesh, India",
    },
    {
      icon: <MapPin size={20} />,
      label: "Branch Office",
      value: "202, Block B, Anjanadri Residence, Aurobindo Colony, Miyapur",
      sub: "Hyderabad – 500049, Telangana, India",
    },
    {
      icon: <Mail size={20} />,
      label: "Share Holders & Public Relations",
      value: "ir@bobroscapital.com",
      sub: "Investor inquiries welcome",
    },
    {
      icon: <Clock size={20} />,
      label: "Business Hours",
      value: "9:30am – 7:00pm",
      sub: "Monday to Saturday (Except holidays)",
    },
  ];

  return (
    <div style={{ 
      fontFamily: "'Segoe UI', 'Poppins', sans-serif", 
      background: "#F0F2F8", 
      minHeight: "100vh",
      marginTop: "80px",
      overflowX: "hidden",
    }}>

      {/* ── HERO SECTION - Responsive ── */}
      <div style={{ 
        position: "relative", 
        width: "100%", 
        height: "clamp(280px, 50vh, 380px)", 
        overflow: "hidden", 
        background: "linear-gradient(135deg, #0f1432 0%, #1a2050 45%, #FD561E 160%)" 
      }}>
        <img
          src="/images/c2.png"
          alt="Contact Us"
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}
          onError={e => { e.target.style.display = "none"; }}
        />
        <div style={{
          position: "absolute", 
          inset: 0,
          background: "linear-gradient(135deg, rgba(15,20,50,0.88) 0%, rgba(25,30,60,0.72) 55%, rgba(253,86,30,0.42) 120%)",
        }} />
        <div style={{
          position: "absolute", 
          inset: 0,
          display: "flex", 
          flexDirection: "column",
          alignItems: "center", 
          justifyContent: "center", 
          textAlign: "center",
          padding: "0 20px",
        }}>
          <div style={{
            background: "rgba(253,86,30,0.2)",
            border: "1px solid rgba(253,86,30,0.5)",
            color: "#ffaa88",
            fontSize: "clamp(9px, 2.5vw, 11px)", 
            fontWeight: 700, 
            letterSpacing: 3,
            padding: "6px 18px", 
            borderRadius: 30, 
            marginBottom: 18,
          }}>
            BOBROS ONE
          </div>
          <h1 style={{
            color: "#fff", 
            fontSize: "clamp(32px, 8vw, 52px)", 
            fontWeight: 900,
            margin: "0 0 14px", 
            lineHeight: 1.1, 
            letterSpacing: -1,
          }}>
            Contact <span style={{ color: "#FD561E" }}>Us</span>
          </h1>
          <p style={{ 
            color: "rgba(255,255,255,0.7)", 
            fontSize: "clamp(13px, 3.5vw, 16px)", 
            margin: "0 0 24px", 
            maxWidth: "90%",
            padding: "0 16px",
          }}>
            We're here to help. Reach out for support, bookings, or any inquiries — we'll get back to you promptly.
          </p>
          <div style={{
            display: "flex", 
            gap: 12, 
            alignItems: "center",
            background: "rgba(255,255,255,0.1)",
            border: "1px solid rgba(255,255,255,0.2)",
            borderRadius: 30, 
            padding: "8px 18px",
            flexWrap: "wrap",
            justifyContent: "center",
          }}>
            <Clock size={15} color="#FD561E" />
            <span style={{ color: "rgba(255,255,255,0.85)", fontSize: "clamp(11px, 2.8vw, 13px)" }}>
              Business Hours: 9:30am – 7:00pm &nbsp;|&nbsp; Monday to Saturday
            </span>
          </div>
        </div>
      </div>

      {/* ── BODY - Responsive Padding ── */}
      <div style={{ 
        maxWidth: 1200, 
        margin: "0 auto", 
        padding: "clamp(40px, 8vw, 60px) clamp(20px, 5vw, 40px) clamp(40px, 8vw, 80px)" 
      }}>

        {/* ── SECTION TITLE ── */}
        <div style={{ textAlign: "center", marginBottom: "clamp(32px, 6vw, 44px)" }}>
          <p style={{ 
            fontSize: "clamp(10px, 2.5vw, 12px)", 
            fontWeight: 700, 
            color: "#FD561E", 
            letterSpacing: 2, 
            textTransform: "uppercase", 
            margin: "0 0 8px" 
          }}>
            GET IN TOUCH
          </p>
          <h2 style={{ 
            fontSize: "clamp(24px, 6vw, 34px)", 
            fontWeight: 800, 
            color: "#1a1a2e", 
            margin: "0 0 12px", 
            letterSpacing: -0.5 
          }}>
            Contact Information
          </h2>
          <p style={{ 
            fontSize: "clamp(13px, 3vw, 15px)", 
            color: "#888", 
            margin: "0 auto", 
            maxWidth: "90%",
            padding: "0 16px",
          }}>
            Multiple ways to reach us — choose what works best for you.
          </p>
        </div>

        {/* ── CONTACT CARDS - Responsive Grid ── */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 320px), 1fr))",
          gap: "clamp(16px, 3vw, 22px)",
          marginBottom: "clamp(40px, 8vw, 68px)",
        }}>
          {cards.map((card, i) => (
            <div key={i} style={{
              background: "#fff",
              borderRadius: 18,
              padding: "clamp(20px, 4vw, 26px) clamp(18px, 3.5vw, 24px)",
              boxShadow: "0 2px 16px rgba(0,0,0,0.06)",
              border: "1px solid rgba(0,0,0,0.05)",
              display: "flex", 
              alignItems: "flex-start", 
              gap: "clamp(12px, 2.5vw, 16px)",
              transition: "transform 0.2s, box-shadow 0.2s, border-color 0.2s",
              cursor: "default",
            }}
              onMouseEnter={e => {
                e.currentTarget.style.transform = "translateY(-5px)";
                e.currentTarget.style.boxShadow = "0 14px 36px rgba(253,86,30,0.13)";
                e.currentTarget.style.borderColor = "rgba(253,86,30,0.22)";
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "0 2px 16px rgba(0,0,0,0.06)";
                e.currentTarget.style.borderColor = "rgba(0,0,0,0.05)";
              }}
            >
              <div style={{
                width: "clamp(44px, 8vw, 50px)", 
                height: "clamp(44px, 8vw, 50px)", 
                borderRadius: 14, 
                flexShrink: 0,
                background: "linear-gradient(135deg, #FD561E, #ff7a4d)",
                display: "flex", 
                alignItems: "center", 
                justifyContent: "center",
                color: "#fff",
                boxShadow: "0 4px 14px rgba(253,86,30,0.3)",
              }}>
                {card.icon}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ 
                  fontSize: "clamp(9px, 2.2vw, 10.5px)", 
                  color: "#bbb", 
                  fontWeight: 700, 
                  textTransform: "uppercase", 
                  letterSpacing: 0.8, 
                  margin: "0 0 6px" 
                }}>
                  {card.label}
                </p>
                <p style={{ 
                  fontSize: "clamp(12px, 3vw, 14.5px)", 
                  fontWeight: 700, 
                  color: "#1a1a2e", 
                  margin: "0 0 5px", 
                  lineHeight: 1.45, 
                  wordBreak: "break-word" 
                }}>
                  {card.value}
                </p>
                <p style={{ fontSize: "clamp(10px, 2.5vw, 12px)", color: "#aaa", margin: 0 }}>{card.sub}</p>
              </div>
            </div>
          ))}
        </div>

        {/* ── SEND MESSAGE SECTION ── */}
        <div style={{ textAlign: "center", marginBottom: "clamp(28px, 5vw, 36px)" }}>
          <p style={{ 
            fontSize: "clamp(10px, 2.5vw, 12px)", 
            fontWeight: 700, 
            color: "#FD561E", 
            letterSpacing: 2, 
            textTransform: "uppercase", 
            margin: "0 0 8px" 
          }}>
            REACH OUT
          </p>
          <h2 style={{ 
            fontSize: "clamp(24px, 6vw, 34px)", 
            fontWeight: 800, 
            color: "#1a1a2e", 
            margin: 0, 
            letterSpacing: -0.5 
          }}>
            Send Us a Message
          </h2>
        </div>

        {/* ── FORM SECTION - Responsive Layout ── */}
        <div style={{
          display: "grid", 
          gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", 
          gap: 0,
          background: "#fff",
          borderRadius: 24,
          overflow: "hidden",
          boxShadow: "0 8px 48px rgba(0,0,0,0.1)",
          border: "1px solid rgba(0,0,0,0.06)",
        }}>

          {/* LEFT — dark info panel - Responsive */}
          <div style={{
            background: "linear-gradient(160deg, #1a1a2e 0%, #0f3460 65%, #1f1035 100%)",
            padding: "clamp(32px, 6vw, 48px) clamp(24px, 5vw, 40px)",
            display: "flex", 
            flexDirection: "column", 
            position: "relative", 
            overflow: "hidden",
          }}>
            <div>
              <h3 style={{ 
                fontSize: "clamp(20px, 5vw, 26px)", 
                fontWeight: 800, 
                color: "#fff", 
                margin: "0 0 14px", 
                lineHeight: 1.25 
              }}>
                We'd Love to<br />Hear From You
              </h3>
              <p style={{ 
                fontSize: "clamp(12px, 2.8vw, 14px)", 
                color: "rgba(255,255,255,0.55)", 
                margin: "0 0 clamp(24px, 5vw, 40px)", 
                lineHeight: 1.75 
              }}>
                Fill in the form and our team will respond within 24 hours.
              </p>

              {[
                { icon: <Phone size={16} />, text: "+91-9133 133 456" },
                { icon: <Mail size={16} />, text: "customersupport@bobrosone.com" },
                { icon: <MapPin size={16} />, text: "Miyapur, Hyderabad – 500049" },
                { icon: <Clock size={16} />, text: "Mon–Sat, 9:30am – 7:00pm" },
              ].map((item, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: "clamp(10px, 2.5vw, 14px)", marginBottom: "clamp(14px, 3vw, 18px)" }}>
                  <div style={{
                    width: "clamp(32px, 7vw, 36px)", 
                    height: "clamp(32px, 7vw, 36px)", 
                    borderRadius: 10, 
                    flexShrink: 0,
                    background: "rgba(253,86,30,0.18)",
                    border: "1px solid rgba(253,86,30,0.3)",
                    display: "flex", 
                    alignItems: "center", 
                    justifyContent: "center",
                    color: "#FD561E",
                  }}>
                    {item.icon}
                  </div>
                  <span style={{ 
                    fontSize: "clamp(11px, 2.5vw, 13.5px)", 
                    color: "rgba(255,255,255,0.75)",
                    wordBreak: "break-word",
                  }}>
                    {item.text}
                  </span>
                </div>
              ))}
            </div>

            {/* Decorative circles - Responsive */}
            {[
              { size: 180, bottom: -60, right: -60 },
              { size: 100, bottom: 60, right: 40 },
              { size: 50, bottom: 140, right: 140 },
            ].map((c, i) => (
              <div key={i} style={{
                position: "absolute", 
                borderRadius: "50%",
                width: c.size, 
                height: c.size,
                bottom: c.bottom, 
                right: c.right,
                border: "1.5px solid rgba(253,86,30,0.18)",
                background: "rgba(253,86,30,0.05)",
              }} />
            ))}

            <div style={{
              position: "absolute", 
              bottom: 0, 
              left: 0, 
              right: 0, 
              height: 4,
              background: "linear-gradient(90deg, #FD561E, #ff9c7a)",
            }} />
          </div>

          {/* RIGHT — form - Responsive */}
          <div style={{ 
            padding: "clamp(32px, 6vw, 48px) clamp(24px, 5vw, 52px)" 
          }}>
            <p style={{ 
              fontSize: "clamp(12px, 2.8vw, 13.5px)", 
              color: "#aaa", 
              margin: "0 0 clamp(20px, 4vw, 30px)" 
            }}>
              All fields marked * are required.
            </p>

            {submitted && (
              <div style={{
                background: "#edfaf3", 
                border: "1px solid #6ddea0",
                borderRadius: 12, 
                padding: "12px 16px",
                display: "flex", 
                alignItems: "center", 
                gap: 10, 
                marginBottom: 24,
                flexWrap: "wrap",
              }}>
                <CheckCircle size={18} color="#27ae60" />
                <span style={{ 
                  fontSize: "clamp(12px, 2.8vw, 13.5px)", 
                  color: "#1a7a40", 
                  fontWeight: 600 
                }}>
                  Message sent! We'll respond within 24 hours.
                </span>
              </div>
            )}

            <div style={{ display: "flex", flexDirection: "column", gap: "clamp(16px, 3vw, 20px)" }}>

              {/* Name + Phone row - Responsive */}
              <div style={{ 
                display: "grid", 
                gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", 
                gap: "clamp(14px, 3vw, 18px)" 
              }}>
                <Field label="Full Name *" icon={<User size={15} />}>
                  <input 
                    name="name" 
                    value={formData.name} 
                    onChange={handleChange}
                    placeholder="Your full name" 
                    style={inputStyle}
                    onFocus={e => { e.target.style.borderColor = "#FD561E"; e.target.style.background = "#fff"; }}
                    onBlur={e => { e.target.style.borderColor = "#e8e8e8"; e.target.style.background = "#fafafa"; }}
                  />
                </Field>
                <Field label="Phone Number" icon={<Phone size={15} />}>
                  <input 
                    name="phone" 
                    type="tel" 
                    value={formData.phone} 
                    onChange={handleChange}
                    placeholder="+91 XXXXX XXXXX" 
                    style={inputStyle}
                    onFocus={e => { e.target.style.borderColor = "#FD561E"; e.target.style.background = "#fff"; }}
                    onBlur={e => { e.target.style.borderColor = "#e8e8e8"; e.target.style.background = "#fafafa"; }}
                  />
                </Field>
              </div>

              {/* Email */}
              <Field label="Email Address *" icon={<Mail size={15} />}>
                <input 
                  name="email" 
                  type="email" 
                  value={formData.email} 
                  onChange={handleChange}
                  placeholder="your@email.com" 
                  style={inputStyle}
                  onFocus={e => { e.target.style.borderColor = "#FD561E"; e.target.style.background = "#fff"; }}
                  onBlur={e => { e.target.style.borderColor = "#e8e8e8"; e.target.style.background = "#fafafa"; }}
                />
              </Field>

              {/* Message */}
              <div>
                <label style={{ 
                  fontSize: "clamp(11px, 2.5vw, 12.5px)", 
                  fontWeight: 600, 
                  color: "#444", 
                  display: "block", 
                  marginBottom: 7 
                }}>
                  Message *
                </label>
                <div style={{ position: "relative" }}>
                  <MessageSquare size={15} color="#bbb" style={{ position: "absolute", left: 12, top: 14 }} />
                  <textarea 
                    name="message" 
                    value={formData.message} 
                    onChange={handleChange}
                    rows={5} 
                    placeholder="Write your message here..."
                    style={{ ...inputStyle, paddingTop: 12, paddingBottom: 12, resize: "vertical" }}
                    onFocus={e => { e.target.style.borderColor = "#FD561E"; e.target.style.background = "#fff"; }}
                    onBlur={e => { e.target.style.borderColor = "#e8e8e8"; e.target.style.background = "#fafafa"; }}
                  />
                </div>
              </div>

              {/* Submit - Responsive Button */}
              <div>
                <button 
                  onClick={handleSubmit} 
                  style={{
                    background: "linear-gradient(135deg, #FD561E 0%, #ff7a4d 100%)",
                    color: "#fff", 
                    border: "none", 
                    borderRadius: 12,
                    padding: "clamp(12px, 3vw, 14px) clamp(28px, 6vw, 36px)", 
                    fontSize: "clamp(13px, 3vw, 15px)", 
                    fontWeight: 700,
                    cursor: "pointer", 
                    display: "inline-flex", 
                    alignItems: "center",
                    gap: 10,
                    boxShadow: "0 4px 18px rgba(253,86,30,0.38)",
                    fontFamily: "inherit",
                    transition: "transform 0.15s, box-shadow 0.15s",
                    width: "auto",
                  }}
                  onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 8px 24px rgba(253,86,30,0.5)"; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 4px 18px rgba(253,86,30,0.38)"; }}
                >
                  <Send size={16} />
                  Send Message
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