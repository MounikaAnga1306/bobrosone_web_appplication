// RechargeAndBillsIcons.jsx
import { useState, useEffect, useLayoutEffect } from "react";
import { useNavigate } from "react-router-dom";

const FontLink = () => (
  <link
    href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200"
    rel="stylesheet"
  />
);

const SECTIONS = [
  {
    title: "Recharge & Bills",
    badge: "7 services",
    items: [
      { category: "Mobile Prepaid",     icon: "phone_android",  label: "Mobile Prepaid" },
      { category: "Mobile Postpaid",    icon: "call",           label: "Mobile Postpaid" },
      { category: "DTH",                icon: "tv",             label: "DTH" },
      { category: "Fastag",             icon: "directions_car", label: "Fastag" },
      { category: "Broadband Postpaid", icon: "router",         label: "Broadband Postpaid" },
      { category: "NCMC Recharge",      icon: "contactless",    label: "NCMC Recharge" },
      { category: "Cable TV",           icon: "live_tv",        label: "Cable TV" },
    ],
  },
  {
    title: "Utilities",
    badge: "7 services",
    items: [
      { category: "Electricity",        icon: "bolt",              label: "Electricity" },
      { category: "Water",              icon: "water_drop",        label: "Water" },
      { category: "Gas",                icon: "local_gas_station", label: "Gas" },
      { category: "Municipal Services", icon: "cleaning_services", label: "Municipal Services" },
      { category: "Education",          icon: "school",            label: "Education" },
      { category: "Credit Card",        icon: "credit_card",       label: "Credit Card Bill" },
      { category: "LPG Cylinder",       icon: "propane_tank",      label: "LPG Cylinder" },
    ],
  },
];

const MORE_SECTIONS = [
  {
    title: "Finance",
    badge: "5 services",
    items: [
      { category: "Credit Card",            icon: "credit_card",            label: "Credit Card" },
      { category: "Loan",                   icon: "receipt_long",           label: "Loan" },
      { category: "Insurance",              icon: "security",               label: "Insurance" },
      { category: "Tax",                    icon: "account_balance",        label: "Tax" },
      { category: "Rent Payment",           icon: "apartment",              label: "Rent Payment" },
    ],
  },
  {
    title: "Housing & Society",
    badge: "5 services",
    items: [
      { category: "Municipal Taxes",        icon: "account_balance",        label: "Municipal Taxes" },
      { category: "Rental",                 icon: "home_work",              label: "Rental" },
      { category: "Clubs and Associations", icon: "groups",                 label: "Clubs & Assoc." },
      { category: "Apartment",              icon: "apartment",              label: "Apartment" },
      { category: "Housing Society",        icon: "groups_2",               label: "Housing Society" },
    ],
  },
  {
    title: "Others",
    badge: "6 services",
    items: [
      { category: "Donation",               icon: "volunteer_activism",     label: "Donation" },
      { category: "Devotion",               icon: "receipt_long",           label: "Devotion" },
      { category: "Hospital",               icon: "local_hospital",         label: "Hospital" },
      { category: "Recurring Deposit",      icon: "calendar_today",         label: "Recurring Deposit" },
      { category: "National Pension System",icon: "account_balance_wallet", label: "National Pension" },
      { category: "Subscription",           icon: "subscriptions",          label: "Subscription" },
    ],
  },
];

// ── Get columns from window.innerWidth synchronously ────────────────────────
// Called immediately — no "default then update" flicker
const getColsFromWidth = (w) => {
  if (w >= 1024) return 7;
  if (w >= 640)  return 4;
  return 3;
};

const getCardFromWidth = (w) => {
  if (w >= 1024) return { card: 95, inner: 48, icon: 28 };
  if (w >= 640)  return { card: 88, inner: 42, icon: 24 };
  return               { card: 66, inner: 36, icon: 20 };
};

// ── useWindowWidth: syncs on mount via useLayoutEffect (runs before paint) ──
const useWindowWidth = () => {
  // Initialise directly from window so first render is correct even after
  // back-navigation (window.innerWidth is already the real value).
  const [width, setWidth] = useState(() =>
    typeof window !== "undefined" ? window.innerWidth : 375
  );

  // useLayoutEffect fires synchronously before the browser paints →
  // corrects the value instantly if it changed since the useState init.
  useLayoutEffect(() => {
    setWidth(window.innerWidth);
    const onResize = () => setWidth(window.innerWidth);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  return width;
};

// ── Section header ────────────────────────────────────────────────────────────
const SectionHeader = ({ title, badge }) => (
  <div style={{ display:"flex", alignItems:"center", gap:"12px", marginBottom:"16px" }}>
    <h2 style={{
      fontSize:"clamp(16px,2vw,20px)", fontWeight:600,
      color:"#111", whiteSpace:"nowrap", margin:0,
    }}>
      {title}
    </h2>
    <div style={{ flex:1, height:"1px", background:"#f0f0f0" }} />
    <span style={{
      fontSize:"11px", fontWeight:600, color:"#fd561e",
      background:"#fff5f2", border:"1px solid #ffd5c8",
      padding:"3px 10px", borderRadius:"20px", whiteSpace:"nowrap",
    }}>
      {badge}
    </span>
  </div>
);

// ── Icon card ────────────────────────────────────────────────────────────────
const IconCard = ({ item, onClick, cardSize }) => {
  const [hovered, setHovered] = useState(false);
  const { card, inner, icon } = cardSize;

  return (
    <div
      style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:"8px", cursor:"pointer" }}
      onClick={() => onClick(item.category)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div style={{
        width:`${card}px`, height:`${card}px`, background:"#fff",
        border:`1.5px solid ${hovered ? "#fd561e" : "#e8e8e8"}`,
        borderRadius:"16px",
        display:"flex", alignItems:"center", justifyContent:"center",
        boxShadow: hovered ? "0 4px 14px rgba(253,86,30,0.12)" : "none",
        transition:"all 0.2s ease",
        transform: hovered ? "translateY(-2px)" : "none",
      }}>
        <div style={{
          width:`${inner}px`, height:`${inner}px`,
          background:"#ffe9df", borderRadius:"12px",
          display:"flex", alignItems:"center", justifyContent:"center",
          transition:"transform 0.2s ease",
          transform: hovered ? "scale(1.12)" : "scale(1)",
        }}>
          <span className="material-symbols-outlined" style={{ fontSize:`${icon}px`, color:"#fd561e" }}>
            {item.icon}
          </span>
        </div>
      </div>
      <span style={{
        fontSize:"clamp(10px,2.5vw,13px)",
        fontWeight:600, color:"#333",
        textAlign:"center", lineHeight:"1.3",
        maxWidth:`${card + 10}px`,
      }}>
        {item.label}
      </span>
    </div>
  );
};

// ── Icon grid ────────────────────────────────────────────────────────────────
const IconGrid = ({ items, onCategorySelect, cols, cardSize }) => (
  <div style={{
    display:"grid",
    gridTemplateColumns:`repeat(${cols}, 1fr)`,
    gap:"16px 12px",
    marginBottom:"24px",
    justifyItems:"center",
  }}>
    {items.map((item, i) => (
      <IconCard key={i} item={item} onClick={onCategorySelect} cardSize={cardSize} />
    ))}
  </div>
);

// ── Main component ────────────────────────────────────────────────────────────
const RechargeAndBillsIcons = () => {
  const navigate   = useNavigate();
  const [showMore, setShowMore] = useState(false);

  // Single source of truth for window width — correct on first render
  const width    = useWindowWidth();
  const cols     = getColsFromWidth(width);
  const cardSize = getCardFromWidth(width);

  const handleCategoryClick = (category) => {
    navigate("/billers", { state: { category } });
  };

  return (
    <div style={{
      width:"100%", background:"#fff",
      padding:"24px clamp(16px,5vw,80px) 0",
      boxSizing:"border-box",
    }}>
      <FontLink />

      {SECTIONS.map((s) => (
        <div key={s.title}>
          <SectionHeader title={s.title} badge={s.badge} />
          <IconGrid
            items={s.items}
            onCategorySelect={handleCategoryClick}
            cols={cols}
            cardSize={cardSize}
          />
        </div>
      ))}

      {showMore && MORE_SECTIONS.map((s) => (
        <div key={s.title}>
          <SectionHeader title={s.title} badge={s.badge} />
          <IconGrid
            items={s.items}
            onCategorySelect={handleCategoryClick}
            cols={cols}
            cardSize={cardSize}
          />
        </div>
      ))}

      <div style={{ display:"flex", justifyContent:"center", margin:"8px 0 32px" }}>
        <button
          onClick={() => setShowMore(!showMore)}
          style={{
            padding:"8px 28px", borderRadius:"24px",
            border:"1px solid #fd561e", background:"transparent",
            color:"#fd561e", fontSize:"13px", fontWeight:600,
            cursor:"pointer", transition:"all 0.2s ease",
          }}
          onMouseEnter={(e) => { e.currentTarget.style.background="#fd561e"; e.currentTarget.style.color="#fff"; }}
          onMouseLeave={(e) => { e.currentTarget.style.background="transparent"; e.currentTarget.style.color="#fd561e"; }}
        >
          {showMore ? "View Less" : "View More"}
        </button>
      </div>
    </div>
  );
};

export default RechargeAndBillsIcons;