import React from "react";
import {
  CreditCard,
  FileText,
  ShieldCheck,
  Landmark,
  Receipt,
  Home,
  Users,
  Building2,
  Building,
  HeartHandshake,
  Flame,
  PlusSquare,
  CalendarDays,
  Wallet,
  PlaySquare,
  Gift,
  User
} from "lucide-react";


const BRAND = "#FD561E";
const BRAND_BG = "#fff5f2";

const sections = [
  {
    title: "Finance",
    items: [
      { label: "Credit Card", icon: CreditCard },
      { label: "Loan", icon: FileText },
      { label: "Insurance", icon: ShieldCheck },
      { label: "Tax", icon: Landmark },
    ],
  },
  {
    title: "Housing & Society",
    items: [
      { label: "Municipal Taxes", icon: Landmark },
      { label: "Rental", icon: Home },
      { label: "Clubs & Associations", icon: Users },
      { label: "Apartment", icon: Building2 },
      { label: "Housing Society", icon: Building },
    ],
  },
  {
    title: "Others",
    items: [
      { label: "Donation", icon: HeartHandshake },

      { label: "Hospital", icon: PlusSquare },
      { label: "Recurring Deposit", icon: CalendarDays },
      { label: "National Pension System", icon: Wallet },
      { label: "Subscription", icon: PlaySquare },
    ],
  },
];

function MenuTile({ label, icon: Icon, onClick }) {
  return (
    <button
      onClick={onClick}
      className="flex flex-col items-center w-24 group focus:outline-none"
    >
      <div
        className="w-16 h-16 rounded-xl flex items-center justify-center mb-2 transition-transform group-hover:scale-105"
        style={{ backgroundColor: BRAND_BG }}
      >
        <Icon size={28} color={BRAND} strokeWidth={2} />
      </div>
      <span className="text-xs text-center text-gray-700 leading-tight">
        {label}
      </span>
    </button>
  );
}

export default function BillPaymentMenu({ onSelect }) {
  return (
    <div className="min-h-screen bg-white">
      {/* Top nav */}
     {/* Top nav */}
<div
  className="border-b px-6 py-3 flex items-center justify-between"
  style={{ borderColor: "#fd561e" }}
>
  <img
    src="/assets/Bobros_logo.png"
    alt="BOBROS Logo"
    className="h-8 w-auto object-contain"
  />
<div className="flex items-center gap-5">
  <Gift size={20} color={BRAND} strokeWidth={2} />
  <User size={20} color={BRAND} strokeWidth={2} />
  <img
    src="/assets/Bharat_connect_logo.png"
    alt="Bharat Connect Logo"
    className="h-9 w-auto object-contain"
  />
</div>
</div>

{/* Secondary nav */}
<div
  className="border-b px-6 flex justify-end gap-8 text-sm font-medium text-gray-600"
  style={{ borderColor: "#fd561e" }}
>
  {["Home", "Transactions", "Complaints", "Help", "Menu"].map(
    (label, i) => (
      <span
        key={label}
        className={`py-3 cursor-pointer ${
          i === 0 ? "border-b-2 -mb-px font-semibold" : ""
        }`}
        style={i === 0 ? { color: BRAND, borderColor: BRAND } : {}}
      >
        {label}
      </span>
    )
  )}
</div>

      {/* Secondary nav - right aligned */}
      {/* <div
        className="border-b px-6 flex justify-end gap-8 text-sm font-medium text-gray-600"
      >
        {["Home", "Transactions", "Complaints", "Help", "Menu"].map(
          (label, i) => (
            <span
              key={label}
              className={`py-3 cursor-pointer ${
                i === 0 ? "border-b-2 font-semibold" : ""
              }`}
              style={i === 0 ? { color: BRAND, borderColor: BRAND } : {}}
            >
              {label}
            </span>
          )
        )}
      </div> */}

      {/* Sections */}
      <div className="px-6 py-8 space-y-10">
        {sections.map((section) => (
          <div key={section.title}>
            <h2
              className="text-lg font-semibold mb-4"
              style={{ color: BRAND }}
            >
              {section.title}
            </h2>
            <div className="flex flex-wrap gap-x-8 gap-y-6">
              {section.items.map((item) => (
                <MenuTile
                  key={item.label}
                  label={item.label}
                  icon={item.icon}
                  onClick={() => onSelect && onSelect(item.label)}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}