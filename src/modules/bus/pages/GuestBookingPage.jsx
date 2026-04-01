// src/modules/bus/pages/GuestBookingsPage.jsx
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import GuestSidebarLayout from "./Guestsidebarlayout.jsx";
import CancellationCard from "./CancellationCard";
import PrintTicketModal from "./PrintTicketModal";
import {
  BookingCard,
  FilterTabs,
  EmptyState,
  Spinner,
  PrintModalWrapper,
  getStatus,
} from "../utils/Bookingutils.jsx";

const GuestBookingsPage = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const mobile = location.state?.mobile || "";
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("All");
  const [showCancel, setShowCancel] = useState(false);
  const [showPrint, setShowPrint] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);

  const openAuth = () =>
    window.dispatchEvent(new CustomEvent("openAuthModal", { detail: "signin" }));

  useEffect(() => {
    if (!mobile) {
      navigate("/");
      return;
    }
    setBookings(location.state?.bookings || []);
    setLoading(false);
  }, [mobile, navigate]);

  const filtered = bookings.filter((b) =>
    tab === "All" ? true : getStatus(b) === tab
  );

  if (loading) return <Spinner text="Fetching your trips..." />;

  return (
    <>
      <GuestSidebarLayout
        activePage="bookings"
        onOpenAuthModal={openAuth}
        onOpenCancel={() => setShowCancel(true)}
        onOpenPrintTicket={() => setShowPrint(true)}
      >
        {/* ── page content ── */}
        <div style={{ maxWidth: 900, margin: "0 auto", padding: "32px 20px 48px" }}>

          {/* title */}
          <div style={{ marginBottom: 24 }}>
            <h1 style={{
              fontSize: 24, fontWeight: 700, color: "#1a1a2e",
              margin: 0, fontFamily: "Segoe UI, sans-serif", marginTop: "-24px"
            }}>
              My Bookings
            </h1>
            <p style={{ fontSize: 13, color: "#9ca3af", marginTop: 4, fontFamily: "Segoe UI, sans-serif" }}>
              {bookings.length} booking{bookings.length !== 1 ? "s" : ""} found on
              {mobile ? `  ${mobile}` : ""}
            </p>
          </div>

          {/* filter tabs */}
          {bookings.length > 0 && (
            <FilterTabs bookings={bookings} tab={tab} setTab={setTab} />
          )}

          {/* cards */}
          {bookings.length === 0 ? (
            <EmptyState onBook={() => navigate("/")} />
          ) : filtered.length === 0 ? (
            <div style={{
              background: "#fff", borderRadius: 14, padding: "48px 20px",
              textAlign: "center", border: "1px solid #eef0f3",
            }}>
              <div style={{ fontSize: 40, marginBottom: 10 }}>🔍</div>
              <p style={{ color: "#9ca3af", fontSize: 14, fontFamily: "Segoe UI, sans-serif" }}>
                No {tab.toLowerCase()} bookings found.
              </p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {filtered.map((booking, index) => (
                <BookingCard
                  key={index}
                  booking={booking}
                  onPrint={(b) => {
                    setSelectedBooking(b);
                    setShowPrint(true);
                  }}
                />
              ))}
            </div>
          )}
        </div>
      </GuestSidebarLayout>

      {/* ── cancellation ── */}
      {showCancel && <CancellationCard onClose={() => setShowCancel(false)} />}

      {/* ── print modal ── */}
      {showPrint && (
        <PrintModalWrapper onClose={() => setShowPrint(false)}>
          <PrintTicketModal
            onClose={() => setShowPrint(false)}
            prefillTin={selectedBooking?.tin_ticket || selectedBooking?.tin || ""}
          />
        </PrintModalWrapper>
      )}
    </>
  );
};

export default GuestBookingsPage;