// BillPaymentStatus.jsx
// A4 Invoice-style receipt with correct field mapping from BBPS makepayment response

import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

const BillPaymentStatus = () => {
  const location  = useLocation();
  const navigate  = useNavigate();
  const calledRef = useRef(false);

  const [phase,   setPhase]   = useState("processing");
  const [receipt, setReceipt] = useState(null);
  const [mpError, setMpError] = useState("");

  useEffect(() => {
    if (calledRef.current) return;
    calledRef.current = true;

    const run = async () => {
      const params = new URLSearchParams(location.search);
      const status        = params.get("status")        || "";
      const authStatus    = params.get("auth_status")   || "";
      const orderId       = params.get("orderid")       || params.get("bdorderid") || "";
      const transactionId = params.get("transactionid") || params.get("txn_id")    || "";
      const amount        = params.get("amount")        || "0";

      const ctx = (() => {
        try { return JSON.parse(sessionStorage.getItem("billPaymentCtx") || "null"); }
        catch { return null; }
      })();
      sessionStorage.removeItem("billPaymentCtx");

      const isSuccessStatus = ["success", "paid", "payment_successful", "y", "1", "true", "s"]
        .includes((status || authStatus).toLowerCase());

      if (!isSuccessStatus) {
        setReceipt({ isSuccess: false, orderId, transactionId, amount, mpData: null, ctx });
        setPhase("done");
        return;
      }

      try {
        const grandTotal = ctx?.grandTotal || amount;
        const API_BASE   = import.meta.env.VITE_API_BASE_URL || "";

        const makePaymentBody = {
          billerid:       ctx?.billerid                                     || "",
          customerid:     ctx?.userDetails?.uid || ctx?.userDetails?.mobile || "",
          orderid:        orderId,
          pa_ref_no:      orderId,
          validationid:   ctx?.validationId                                 || "",
          authenticators: ctx?.authenticators                               || [],
          payment_amount: parseFloat(grandTotal).toFixed(2),
          currency:       "INR",
          cou_conv_fee:   "0.00",
          bou_conv_fee:   parseFloat(ctx?.convFeeInfo?.fee || 0).toFixed(2),
          debit_amount:   parseFloat(grandTotal).toFixed(2),
          customer: {
            firstname: ctx?.userDetails?.name   || "Guest",
            lastname:  "NA",
            mobile:    ctx?.userDetails?.mobile || "",
            email:     ctx?.userDetails?.email  || "",
          },
          device: { init_channel: "Internet", ip: "0.0.0.0", mac: "AB:CD:EF:GH" },
          ...(ctx?.upiId && ctx.upiId.trim() ? { vpa: ctx.upiId.trim() } : {}),
        };

        const res  = await fetch(`${API_BASE}bbps/makepayment`, {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify(makePaymentBody),
        });
        const data = await res.json();

        if (data?.success) {
          setReceipt({ isSuccess: true, orderId, transactionId, amount, mpData: data.data, ctx });
        } else {
          setMpError(data?.message || "BBPS confirmation pending.");
          setReceipt({ isSuccess: true, orderId, transactionId, amount, mpData: null, ctx });
        }
      } catch (err) {
        console.error("[MAKE_PAYMENT] Error:", err);
        setMpError("Could not fetch BBPS confirmation details.");
        setReceipt({ isSuccess: true, orderId, transactionId, amount, mpData: null, ctx });
      }
      setPhase("done");
    };

    run();
  }, [location.search]);

  // ── Processing ────────────────────────────────────────────────────────────
  if (phase === "processing") {
    return (
      <div style={{ minHeight:"100vh", background:"#f5f5f5", display:"flex",
        alignItems:"center", justifyContent:"center", fontFamily:"'Segoe UI',Arial,sans-serif" }}>
        <div style={{ textAlign:"center" }}>
          <div style={{ position:"relative", width:60, height:60, margin:"0 auto 20px" }}>
            <div style={{ position:"absolute", inset:0, borderRadius:"50%", border:"4px solid #ffe0d6" }} />
            <div style={{ position:"absolute", inset:0, borderRadius:"50%", border:"4px solid transparent",
              borderTopColor:"#fd561e", animation:"spin 0.8s linear infinite" }} />
          </div>
          <p style={{ fontWeight:700, color:"#222", fontSize:16, marginBottom:6 }}>Confirming your payment...</p>
          <p style={{ color:"#888", fontSize:13 }}>Please wait. Do not close this page.</p>
          <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
        </div>
      </div>
    );
  }

  if (!receipt) return null;

  const { isSuccess, orderId, mpData, ctx } = receipt;

  // ── Field mapping from API response ──────────────────────────────────────
  // Transaction
  const paymentId    = mpData?.paymentid        || "—";          // HGAFP010FC0000704083
  const sourceRefNo  = mpData?.source_ref_no    || orderId || "—"; // 100002122
  const bbpsTxnId    = mpData?.bbps_ref_no      || "—";          // BD016119BAFAAAAACG3S
  const txnDateTime  = mpData?.txn_date_time    || "—";          // 29-04-2026 16:22:58

  // Amounts
  const billAmt      = parseFloat(mpData?.billlist?.[0]?.billamount || mpData?.billlist?.[0]?.net_billamount || mpData?.payment_amount || 0);
  const couConvFee   = parseFloat(mpData?.cou_conv_fee || 0);
  const bouConvFee   = parseFloat(mpData?.bou_conv_fee || 0);
  const totalConvFee = couConvFee + bouConvFee;
  const totalPaid    = parseFloat(mpData?.debit_amount || ctx?.grandTotal || 0);
  const fmt          = (n) => `₹${parseFloat(n || 0).toFixed(2)}`;

  // Payment Info
  const payStatus    = mpData?.payment_status   || (isSuccess ? "PAID" : "FAILED"); // PAID
  const payChannel   = "Internet";                                                   // hardcoded
  const payMethod    = mpData?.payment_account?.payment_method || "—";              // UPI
  const vpa          = mpData?.payment_account?.vpa            || "";               // 8X0X...
  const remitter     = mpData?.payment_account?.remitter_name  || "";               // muniganti sneha
  const approvalCode = mpData?.biller_approval_code            || "";

  // Biller Info
  const billerStatus   = mpData?.biller_status   || "";           // SUCCESS
  const billerName     = mpData?.biller_name     || ctx?.billerName || "—"; // Vi Postpaid
  const billerCategory = mpData?.biller_category || "—";          // Mobile Postpaid
  const billerId       = mpData?.billerid        || "—";          // VODA00000NAT96

  // Bill Details (from billlist[0])
  const bill         = mpData?.billlist?.[0] || {};
  const billStatus   = bill.billstatus  || "";                    // PAID
  const billNumber   = bill.billnumber  || "";                    // 202008729677
  const billDate     = bill.billdate    || "";                    // 03-06-2024
  const billDueDate  = bill.billduedate || "";                    // 28-11-2025
  const billPeriod   = bill.billperiod  || "";                    // Monthly
  const custName     = bill.customer_name || "";                  // Chetan Anchan

  // Authenticators (Mobile Number etc.)
  const authenticators = mpData?.authenticators || ctx?.authenticators || [];

  // Customer
  const remitterName  = mpData?.payment_account?.remitter_name || ctx?.userDetails?.name   || "—";
  const custMobile    = ctx?.userDetails?.mobile || "";
  const custEmail     = ctx?.userDetails?.email  || "";

  // ── Download Invoice (PDF via print) ─────────────────────────────────────
  const handleDownload = () => { window.print(); };

  // ── Download CSV ──────────────────────────────────────────────────────────
  const handleCSV = () => {
    const rows = [
      ["Field", "Value"],
      ["Payment ID",        paymentId],
      ["Transaction Ref No",sourceRefNo],
      ["B-Connect Txn ID",  bbpsTxnId],
      ["Transaction Time",  txnDateTime],
      ["Bill Amount",       fmt(billAmt)],
      ["Convenience Fee",   totalConvFee > 0 ? fmt(totalConvFee) : "FREE"],
      ["Total Paid",        fmt(totalPaid)],
      ["Payment Status",    payStatus],
      ["Payment Channel",   payChannel],
      ["Payment Method",    payMethod],
      ...(vpa              ? [["UPI ID",        vpa]]           : []),
      ...(remitter         ? [["Remitter",      remitter]]      : []),
      ...(approvalCode     ? [["Approval Code", approvalCode]]  : []),
      ["Biller Status",     billerStatus],
      ["Biller Name",       billerName],
      ["Biller Category",   billerCategory],
      ["Biller ID",         billerId],
      ...(billStatus       ? [["Bill Status",   billStatus]]    : []),
      ...(billNumber       ? [["Bill Number",   billNumber]]    : []),
      ...(billDate         ? [["Bill Date",     billDate]]      : []),
      ...(billDueDate      ? [["Bill Due Date", billDueDate]]   : []),
      ...(billPeriod       ? [["Bill Period",   billPeriod]]    : []),
      ...authenticators.map((a) => [a.parameter_name, a.value]),
      ["Customer Name",     remitterName],
      ["Customer Mobile",   custMobile],
      ["Customer Email",    custEmail],
      ["Generated At",      new Date().toLocaleString("en-IN")],
    ];
    const csv  = rows.map((r) => r.map((c) => `"${String(c).replace(/"/g,'""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type:"text/csv" });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href = url; a.download = `Invoice_${paymentId || Date.now()}.csv`; a.click();
    URL.revokeObjectURL(url);
  };

  // ── Small reusable field ──────────────────────────────────────────────────
  const Field = ({ label, value, mono, highlight }) => (
    <div style={{ marginBottom: 14 }}>
      <div style={{ fontSize: 10, fontWeight: 700, color: "#999", textTransform: "uppercase",
        letterSpacing: 0.8, marginBottom: 3 }}>
        {label}
      </div>
      <div style={{
        fontSize: mono ? 12 : 13, fontWeight: 600,
        color: highlight ? "#fd561e" : "#1a1a1a",
        fontFamily: mono ? "monospace" : "inherit",
        wordBreak: "break-all",
      }}>
        {value || "—"}
      </div>
    </div>
  );

  // ── Section title ─────────────────────────────────────────────────────────
  const SectionTitle = ({ title, icon }) => (
    <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:16,
      paddingBottom:8, borderBottom:"2px solid #fd561e" }}>
      <span style={{ fontSize:14 }}>{icon}</span>
      <span style={{ fontSize:12, fontWeight:800, color:"#fd561e",
        textTransform:"uppercase", letterSpacing:1 }}>
        {title}
      </span>
    </div>
  );

  // ── Status badge ──────────────────────────────────────────────────────────
  const StatusBadge = ({ value }) => {
    const ok = ["PAID","SUCCESS","SUCCESSFUL"].includes((value||"").toUpperCase());
    return (
      <span style={{
        display:"inline-block", fontSize:11, fontWeight:700,
        padding:"3px 10px", borderRadius:4,
        background: ok ? "#e6f7ec" : "#fdecea",
        color: ok ? "#1a7a3a" : "#c0392b",
        border:`1px solid ${ok ? "#b2dfcc" : "#f5b7b1"}`,
      }}>{value || "—"}</span>
    );
  };

  return (
    <>
      <style>{`
        @media print {
          .no-print { display: none !important; }
          body { margin: 0; background: white; }
          .invoice-root { box-shadow: none !important; margin: 0 !important;
            max-width: 100% !important; border-radius: 0 !important; }
        }
        @media (max-width: 640px) {
          .inv-grid { grid-template-columns: 1fr !important; }
          .inv-amounts { flex-direction: column !important; gap: 12px !important; }
        }
      `}</style>

      {/* ── Page background ── */}
      <div style={{ minHeight:"100vh", background:"#f0f2f5",
        fontFamily:"'Segoe UI',Arial,sans-serif",
        padding:"32px 16px 60px",
        display:"flex", flexDirection:"column", alignItems:"center" }}>

        {/* ── Invoice card (A4-like) ── */}
        <div className="invoice-root" style={{
          width:"100%", maxWidth:860,
          background:"#fff",
          borderRadius:6,
          boxShadow:"0 2px 24px rgba(0,0,0,0.10)",
          overflow:"hidden",
        }}>

          {/* ══ HEADER ════════════════════════════════════════════════════ */}
          <div style={{
            background:"linear-gradient(135deg,#fd561e 0%,#ff8c5a 100%)",
            padding:"24px 32px",
            display:"flex", alignItems:"center", justifyContent:"space-between",
            flexWrap:"wrap", gap:12,
          }}>
            <div>
              <div style={{ color:"#fff", fontSize:22, fontWeight:900, letterSpacing:1 }}>
                BOBROS
              </div>
              <div style={{ color:"rgba(255,255,255,0.8)", fontSize:11, marginTop:2 }}>
                Bharat BillPay Connect • Payment Invoice
              </div>
            </div>
            <div style={{ textAlign:"right" }}>
              <div style={{
                background:"rgba(255,255,255,0.2)", borderRadius:6,
                padding:"6px 14px", display:"inline-block",
                color:"#fff", fontSize:11, fontWeight:700, letterSpacing:0.5,
              }}>
                {isSuccess ? "✓ PAYMENT SUCCESSFUL" : "✗ PAYMENT FAILED"}
              </div>
              <div style={{ color:"rgba(255,255,255,0.85)", fontSize:11, marginTop:6 }}>
                {new Date().toLocaleString("en-IN", {
                  day:"2-digit", month:"short", year:"numeric",
                  hour:"2-digit", minute:"2-digit",
                })}
              </div>
            </div>
          </div>

          {/* ══ TRANSACTION REF BANNER ═════════════════════════════════════ */}
          <div style={{
            background:"#fafafa", borderBottom:"1px solid #eee",
            padding:"14px 32px",
            display:"flex", alignItems:"center", justifyContent:"space-between",
            flexWrap:"wrap", gap:8,
          }}>
            <div>
              <span style={{ fontSize:11, color:"#999", fontWeight:600 }}>
                Transaction Reference No:&nbsp;
              </span>
              <span style={{ fontSize:13, fontWeight:800, color:"#222", fontFamily:"monospace" }}>
                {paymentId}
              </span>
            </div>
            <div style={{ display:"flex", alignItems:"center", gap:6 }}>
              <svg width="13" height="13" viewBox="0 0 20 20" fill="#1a7a3a">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
              </svg>
              <span style={{ fontSize:11, color:"#1a7a3a", fontWeight:600 }}>
                Verified & Secured by Bharat BillPay
              </span>
            </div>
          </div>

          {/* ══ AMOUNT STRIP ═══════════════════════════════════════════════ */}
          <div className="inv-amounts" style={{
            display:"flex", justifyContent:"space-around",
            padding:"20px 32px", background:"#fff",
            borderBottom:"1px solid #eee",
          }}>
            {[
              { label:"Bill Amount",    value: fmt(billAmt),   big:false },
              { label:"Convenience Fee",value: totalConvFee > 0 ? fmt(totalConvFee) : "FREE", big:false },
              { label:"Total Paid",     value: fmt(totalPaid), big:true  },
            ].map((item, i) => (
              <div key={i} style={{ textAlign:"center", padding:"0 12px" }}>
                <div style={{ fontSize:10, color:"#aaa", textTransform:"uppercase",
                  letterSpacing:0.6, marginBottom:6, fontWeight:600 }}>
                  {item.label}
                </div>
                <div style={{
                  fontSize: item.big ? 26 : 18,
                  fontWeight:800,
                  color: item.big ? "#fd561e" : "#333",
                }}>
                  {item.value}
                </div>
              </div>
            ))}
          </div>

          {/* ══ BODY ═══════════════════════════════════════════════════════ */}
          <div style={{ padding:"28px 32px" }}>

            {/* Row 1: Transaction Info (left) + Payment Info (right) */}
            <div className="inv-grid" style={{
              display:"grid", gridTemplateColumns:"1fr 1fr", gap:32,
              marginBottom:28,
            }}>
              {/* LEFT: Transaction Info */}
              <div style={{ background:"#fafafa", borderRadius:8, padding:20,
                border:"1px solid #f0f0f0" }}>
                <SectionTitle title="Transaction Info" icon="🧾" />
                <Field label="Payment ID"          value={paymentId}    mono />
                <Field label="Source Ref No"        value={sourceRefNo}  mono />
                <Field label="B-Connect Txn ID"     value={bbpsTxnId}    mono />
                <Field label="Transaction Time"     value={txnDateTime} />
              </div>

              {/* RIGHT: Payment Info */}
              <div style={{ background:"#fafafa", borderRadius:8, padding:20,
                border:"1px solid #f0f0f0" }}>
                <SectionTitle title="Payment Info" icon="💳" />
                <div style={{ marginBottom:14 }}>
                  <div style={{ fontSize:10, fontWeight:700, color:"#999",
                    textTransform:"uppercase", letterSpacing:0.8, marginBottom:4 }}>
                    Payment Status
                  </div>
                  <StatusBadge value={payStatus} />
                </div>
                <Field label="Payment Channel" value={payChannel} />
                <Field label="Payment Method"  value={payMethod} />
                {vpa      && <Field label="UPI ID"       value={vpa}      mono />}
                {remitter && <Field label="Remitter"     value={remitter} />}
                {approvalCode && <Field label="Approval Code" value={approvalCode} mono />}
              </div>
            </div>

            {/* Divider */}
            <div style={{ height:1, background:"#eee", marginBottom:28 }} />

            {/* Row 2: Biller Info (left) + Customer Details (right) */}
            <div className="inv-grid" style={{
              display:"grid", gridTemplateColumns:"1fr 1fr", gap:32,
              marginBottom:28,
            }}>
              {/* LEFT: Biller Info */}
              <div style={{ background:"#fafafa", borderRadius:8, padding:20,
                border:"1px solid #f0f0f0" }}>
                <SectionTitle title="Biller Info" icon="🏢" />
                {billerStatus && (
                  <div style={{ marginBottom:14 }}>
                    <div style={{ fontSize:10, fontWeight:700, color:"#999",
                      textTransform:"uppercase", letterSpacing:0.8, marginBottom:4 }}>
                      Biller Status
                    </div>
                    <StatusBadge value={billerStatus} />
                  </div>
                )}
                <Field label="Biller Name"     value={billerName} />
                <Field label="Biller Category" value={billerCategory} />
                <Field label="Biller ID"       value={billerId}   mono />
                {billStatus  && <Field label="Bill Status"  value={billStatus} />}
                {billNumber  && <Field label="Bill Number"  value={billNumber}  mono />}
                {billDate    && <Field label="Bill Date"    value={billDate} />}
                {billDueDate && <Field label="Bill Due Date" value={billDueDate} />}
                {billPeriod  && <Field label="Bill Period"  value={billPeriod} />}
                {custName    && <Field label="Bill Customer" value={custName} />}
                {/* Authenticators (Mobile Number etc.) */}
                {authenticators.map((a, i) => (
                  <Field key={i} label={a.parameter_name} value={a.value} mono />
                ))}
              </div>

              {/* RIGHT: Customer Details */}
              <div style={{ background:"#fafafa", borderRadius:8, padding:20,
                border:"1px solid #f0f0f0" }}>
                <SectionTitle title="Customer Details" icon="👤" />
                <Field label="Name"   value={remitterName} />
                {custMobile && <Field label="Mobile" value={custMobile} mono />}
                {custEmail  && <Field label="Email"  value={custEmail} />}
              </div>
            </div>

            {/* Error warning */}
            {mpError && (
              <div style={{ padding:"12px 16px", background:"#fffbf0",
                border:"1px solid #f5e060", borderRadius:6,
                fontSize:12, color:"#7a6000", marginBottom:20 }}>
                ⚠️ {mpError}
              </div>
            )}

          </div>

          {/* ══ FOOTER BUTTONS ════════════════════════════════════════════ */}
          <div className="no-print" style={{
            borderTop:"1px solid #eee", padding:"20px 32px",
            display:"flex", gap:12, flexWrap:"wrap", justifyContent:"flex-end",
          }}>
            <button
              onClick={() => navigate("/BillHomePage")}
              style={{
                padding:"11px 24px", borderRadius:6,
                border:"1.5px solid #ddd", background:"#fff",
                color:"#555", fontWeight:700, fontSize:13, cursor:"pointer",
              }}
            >
              ← Back to Home
            </button>
            <button
              onClick={handleCSV}
              style={{
                padding:"11px 24px", borderRadius:6,
                border:"1.5px solid #fd561e", background:"#fff",
                color:"#fd561e", fontWeight:700, fontSize:13, cursor:"pointer",
                display:"flex", alignItems:"center", gap:6,
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/>
              </svg>
              Download CSV
            </button>
            <button
              onClick={handleDownload}
              style={{
                padding:"11px 24px", borderRadius:6,
                border:"none", background:"#fd561e",
                color:"#fff", fontWeight:700, fontSize:13, cursor:"pointer",
                display:"flex", alignItems:"center", gap:6,
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M6 2h9l5 5v15a2 2 0 01-2 2H6a2 2 0 01-2-2V4a2 2 0 012-2z"/>
                <path d="M14 2v5h5M8 13h8M8 17h5"/>
              </svg>
              Download Invoice
            </button>
          </div>

          {/* ══ PRINT FOOTER (visible only in print) ══════════════════════ */}
          <div style={{ borderTop:"1px solid #eee", padding:"14px 32px",
            display:"flex", alignItems:"center", justifyContent:"space-between",
            flexWrap:"wrap", gap:8 }}>
            <span style={{ fontSize:10, color:"#bbb", fontFamily:"monospace" }}>
              Generated: {new Date().toLocaleString("en-IN")}
            </span>
            <span style={{ fontSize:10, color:"#bbb" }}>
              Powered by Bharat BillPay Connect • BBPS Certified
            </span>
          </div>

        </div>
      </div>
    </>
  );
};

export default BillPaymentStatus;