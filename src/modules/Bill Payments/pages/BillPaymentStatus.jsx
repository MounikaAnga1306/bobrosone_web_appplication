import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

const BillPaymentStatus = () => {
  const location  = useLocation();
  const navigate  = useNavigate();
  const calledRef = useRef(false);

  const [phase,       setPhase]       = useState("processing");
  const [receipt,     setReceipt]     = useState(null);
  const [mpError,     setMpError]     = useState("");
  const [retrying,    setRetrying]    = useState(false);   // 👈 Try Again loading

  const ctxRef = useRef((() => {
    try {
      const raw = sessionStorage.getItem("billPaymentCtx");
      if (raw) sessionStorage.removeItem("billPaymentCtx");
      return raw ? JSON.parse(raw) : null;
    } catch { return null; }
  })());

  useEffect(() => {
    if (calledRef.current) return;
    calledRef.current = true;
    const run = async () => {
      const params     = new URLSearchParams(location.search);
      const status     = params.get("status")      || "";
      const authStatus = params.get("auth_status") || "";
      const orderId    = params.get("orderid")     || params.get("bdorderid") || "";
      const amount     = params.get("amount")      || "0";
      const ctx        = ctxRef.current;

      const ok = ["success","paid","payment_successful","y","1","true","s"]
        .includes((status || authStatus).toLowerCase());

      if (!ok) { setReceipt({ isSuccess:false, orderId, amount, mpData:null, ctx }); setPhase("done"); return; }

      try {
        const grandTotal = ctx?.grandTotal || amount;
        const isGuest    = !ctx?.userDetails?.uid || ctx?.userDetails?.uid.trim() === "";
        const customerId = isGuest ? (ctx?.userDetails?.mobile||"") : (ctx?.userDetails?.uid||"");

        const body = {
          billerid: ctx?.billerid||"", customerid: customerId,
          orderid: orderId, pa_ref_no: orderId,
          validationid: ctx?.validationId||"",
          authenticators: ctx?.authenticators||[],
          payment_amount: parseFloat(grandTotal).toFixed(2),
          currency:"INR", cou_conv_fee:"0.00",
          bou_conv_fee: parseFloat(ctx?.convFeeInfo?.fee||0).toFixed(2),
          debit_amount: parseFloat(grandTotal).toFixed(2),
          customer:{ firstname:ctx?.userDetails?.name||"Guest", lastname:"NA", mobile:ctx?.userDetails?.mobile||"", email:ctx?.userDetails?.email||"" },
          device:{ init_channel:"Internet", ip:"0.0.0.0", mac:"AB:CD:EF:GH" },
          ...(ctx?.upiId&&ctx.upiId.trim() ? {vpa:ctx.upiId.trim()} : {}),
        };

        const res  = await fetch("/bbps/makepayment",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(body)});
        const data = await res.json();
        if (data?.success) {
          const mpData = data.data?.data || data.data;
          setReceipt({isSuccess:true,orderId,amount,mpData,ctx});
        } else {
          setMpError(data?.message||"BBPS confirmation pending.");
          setReceipt({isSuccess:true,orderId,amount,mpData:null,ctx});
        }
      } catch(err) {
        console.error(err);
        setMpError("Could not fetch BBPS confirmation details.");
        setReceipt({isSuccess:true,orderId,amount,mpData:null,ctx});
      }
      setPhase("done");
    };
    run();
  }, [location.search]);

  // ── Try Again — BillDesk ni malli launch chestundi (fail ainappudu) ──────
  const handleTryAgain = async () => {
    const c = ctxRef.current;
    // ctx lekapote (refresh/expire) malli mode select cheyyalsi vastundi
    if (!c) {
      setMpError("Payment session expired. Please start the bill payment again.");
      navigate("/BillHomePage");
      return;
    }
    setRetrying(true);
    setMpError("");
    try {
      // BillDesk nundi return ayyaka makepayment ki ctx malli kavali — re-store
      sessionStorage.setItem("billPaymentCtx", JSON.stringify(c));

      // /bbps/billdesk/order ki original order laage payload (server signature prakaram)
      const orderBody = {
        fare:          parseFloat(c?.grandTotal || receipt?.amount || 0).toFixed(2),
        uid:           c?.userDetails?.uid   || "",
        pname:         c?.userDetails?.name  || "Guest",
        email:         c?.userDetails?.email || "",
        tickid:        c?.validationId || "",
        billerid:      c?.billerid || "",
        validationId:  c?.validationId || "",
        paymentMethod: c?.paymentMethod || "UPI",
        upiId:         c?.upiId || "",
        authenticators:c?.authenticators || [],
        billerName:    c?.billerName || "",
        isBbps:        c?.isBbps !== undefined ? c.isBbps : true,
        return_url:    `${window.location.origin}/bill-payment-status`,
      };

      const res  = await fetch("/bbps/billdesk/order", {
        method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify(orderBody),
      });
      const data = await res.json();

      if (data?.success && data?.checkoutUrl) {
        window.location.href = data.checkoutUrl;   // BillDesk relaunch
      } else {
        sessionStorage.removeItem("billPaymentCtx");
        setMpError(data?.message || "Could not restart payment. Please try from the beginning.");
        setRetrying(false);
      }
    } catch (e) {
      console.error("Try Again error:", e);
      sessionStorage.removeItem("billPaymentCtx");
      setMpError("Could not restart payment. Please try again later.");
      setRetrying(false);
    }
  };

  if (phase === "processing") return (
    <div style={{minHeight:"100vh",background:"#fff",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"'Segoe UI',sans-serif"}}>
      <div style={{textAlign:"center"}}>
        <div style={{position:"relative",width:48,height:48,margin:"0 auto 16px"}}>
          <div style={{position:"absolute",inset:0,borderRadius:"50%",border:"3px solid #f0f0f0"}}/>
          <div style={{position:"absolute",inset:0,borderRadius:"50%",border:"3px solid transparent",borderTopColor:"#fd561e",animation:"spin 0.8s linear infinite"}}/>
        </div>
        <p style={{fontWeight:700,color:"#222",fontSize:14,marginBottom:4}}>Confirming your payment...</p>
        <p style={{color:"#aaa",fontSize:12}}>Please wait. Do not close this page.</p>
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    </div>
  );

  if (!receipt) return null;
  const { isSuccess, orderId, mpData, ctx } = receipt;

  const paymentId   = mpData?.paymentid     || "";
  const sourceRefNo = mpData?.source_ref_no || orderId || "";
  const bbpsTxnId   = mpData?.bbps_ref_no   || "";
  const txnDateTime = mpData?.txn_date_time || "";
  const bill        = mpData?.billlist?.[0] || {};
  const billAmt     = parseFloat(bill.billamount||bill.net_billamount||0);
  // conv fee: success aithe response nundi, fail aithe ctx nundi (fallback)
  const totalConvFee= mpData
    ? parseFloat(mpData?.cou_conv_fee||0)+parseFloat(mpData?.bou_conv_fee||0)
    : parseFloat(ctx?.convFeeInfo?.fee||0);
  const totalPaid   = parseFloat(mpData?.debit_amount||ctx?.grandTotal||receipt?.amount||0);
  const fmt         = n => `₹${parseFloat(n||0).toFixed(2)}`;
  const payStatus   = mpData?.payment_status||(isSuccess?"PAID":"FAILED");
  const payMethod   = mpData?.payment_account?.payment_method||"";
  const billerStatus= mpData?.biller_status||"";
  const billerId    = mpData?.billerid||ctx?.billerid||"";
  const billStatus  = bill.billstatus||"";
  const billNumber  = bill.billnumber||"";
  const billDate    = bill.billdate||"";
  const billDueDate = bill.billduedate||"";
  const billPeriod  = bill.billperiod||"";
  const auths       = mpData?.authenticators||ctx?.authenticators||[];
  const mobileAuth  = auths.find(a=>a.parameter_name?.toLowerCase().includes("mobile"))?.value||ctx?.userDetails?.mobile||"";
  const isOk        = v=>["PAID","SUCCESS","SUCCESSFUL"].includes((v||"").toUpperCase());

  // ── Download — direct PDF using jsPDF ───────────────────────────────────
  const handleDownload = async () => {
    const filename = `Bill_Payment_Invoice_${paymentId||Date.now()}`;

    // Dynamically load jsPDF + autotable from CDN
    const loadScript = (src) => new Promise((res, rej) => {
      if (document.querySelector(`script[src="${src}"]`)) { res(); return; }
      const s = document.createElement("script");
      s.src = src; s.onload = res; s.onerror = rej;
      document.head.appendChild(s);
    });

    try {
      await loadScript("https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js");
      await loadScript("https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.8.2/jspdf.plugin.autotable.min.js");

      const { jsPDF } = window.jspdf;
      const doc = new jsPDF({ unit:"mm", format:"a4", orientation:"portrait" });

      const origin = window.location.origin;
      const pageW  = doc.internal.pageSize.getWidth();

      // ── Load logos as base64 ──
      const toBase64 = (url) => new Promise((res) => {
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.onload = () => {
          const c = document.createElement("canvas");
          c.width = img.width; c.height = img.height;
          c.getContext("2d").drawImage(img, 0, 0);
          res(c.toDataURL("image/png"));
        };
        img.onerror = () => res(null);
        img.src = url;
      });

      const [logoB, assuredB] = await Promise.all([
        toBase64(`${origin}/assets/Bobros_logo.png`),
        toBase64(`${origin}/assets/b_assured_logo2.png`),
      ]);

      // ── Header logos — proper spacing, no shrink ──
      let y = 10;
      if (logoB)    doc.addImage(logoB,    "PNG", 10,        y,    45, 14);
      if (assuredB) doc.addImage(assuredB, "PNG", pageW-28,  y-2,  20, 18);

      // ── Divider ──
      y = 28;
      doc.setDrawColor(220,220,220);
      doc.setLineWidth(0.5);
      doc.line(10, y, pageW-10, y);

      // ── Title ──
      y = 38;
      doc.setFont("helvetica","bold");
      doc.setFontSize(16);
      doc.setTextColor(30,30,30);
      doc.text("Bill Payment Invoice", pageW/2, y, {align:"center"});

      // ── Date below title ──
      y = 44;
      doc.setFont("helvetica","normal");
      doc.setFontSize(10);
      doc.setTextColor(130,130,130);
      const dtStr = new Date().toLocaleString("en-IN",{day:"2-digit",month:"short",year:"numeric",hour:"2-digit",minute:"2-digit"});
      doc.text("Date: " + dtStr, pageW/2, y, {align:"center"});

      // ── Table rows — use Rs. instead of ₹ (jsPDF font limitation) ──
      const pFmt = n => "Rs." + parseFloat(n||0).toFixed(2);
      const tableRows = [
        ["Transaction Ref No",  paymentId||sourceRefNo, false],
        ["B-Connect txn ID",    bbpsTxnId,              false],
        ["Bill Amount",         billAmt>0?pFmt(billAmt):"—", false],
        ["Convenience Fee",     pFmt(totalConvFee),       false],
        ["Total Amount Paid",   pFmt(totalPaid),          false],
        ["Source Ref No",       sourceRefNo,             false],
        ["Payment Status",      payStatus,               true],
        ["Payment Channel",     "Internet",              false],
        ["Payment Method",      payMethod,               false],
        ["Biller Status",       billerStatus||billStatus, true],
        ["Biller ID",           billerId,                false],
        ...(billDate    ? [["Bill Date",           billDate,    false]] : []),
        ...(billDueDate ? [["Bill Due Date",       billDueDate, false]] : []),
        ...(billPeriod  ? [["Bill Period",         billPeriod,  false]] : []),
        ...(billNumber  ? [["Bill Number(s)",      billNumber,  false]] : []),
        ...(mobileAuth  ? [["Payee Mobile Number", mobileAuth,  false]] : []),
        ...(txnDateTime ? [["Transaction Time",    txnDateTime, false]] : []),
      ].filter(r => r[1]);

      doc.autoTable({
        startY: y + 8,
        margin: { left:10, right:10 },
        head: [],
        body: tableRows.map(([label, value]) => [label, value]),
        columnStyles: {
          0: { fillColor:[245,245,245], fontStyle:"bold", textColor:[50,50,50], cellWidth:85 },
          1: { textColor:[30,30,30], halign:"right" },
        },
        didParseCell: (data) => {
          // Color Payment Status / Biller Status values
          const rowIdx = data.row.index;
          if (data.column.index === 1 && tableRows[rowIdx]?.[2]) {
            const val = tableRows[rowIdx][1];
            if (isOk(val)) data.cell.styles.textColor = [26,122,58];
            else           data.cell.styles.textColor = [192,57,43];
          }
        },
        styles: {
          fontSize: 11,
          cellPadding: { top:4, bottom:4, left:5, right:5 },
          lineColor: [220,220,220],
          lineWidth: 0.3,
        },
        theme: "grid",
      });

      doc.save(filename + ".pdf");
    } catch(err) {
      console.error("PDF error:", err);
      alert("PDF generation failed. Please try again.");
    }
  };

  // ── UI ────────────────────────────────────────────────────────────────────
  const F = ({label, value, color}) => !value ? null : (
    <div>
      <div style={{fontSize:15,color:"#4e4a4a",marginBottom:3}}>{label}</div>
      <div style={{fontSize:15,fontWeight:600,color:color||"#1a1a1a"}}>{value}</div>
    </div>
  );

  const G2 = ({children}) => (
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"16px 24px",padding:"14px 0",borderBottom:"1px solid #eee"}}>
      {children}
    </div>
  );
  const G3 = ({children}) => (
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:"16px 24px",padding:"14px 0",borderBottom:"1px solid #eee"}}>
      {children}
    </div>
  );

  return (
    <>
      <style>{`
        @keyframes spin{to{transform:rotate(360deg)}}
        @media(max-width:600px){
          .amt-grid{grid-template-columns:1fr!important}
          .g2{grid-template-columns:1fr!important}
          .g3{grid-template-columns:1fr 1fr!important}
          .page-wrap{padding:0 16px!important}
          .btn-row{flex-direction:column!important;align-items:stretch!important}
          .btn-row button{text-align:center!important;justify-content:center!important}
        }
      `}</style>

      <div style={{minHeight:"100vh",background:"#fff",fontFamily:"'Segoe UI',Arial,sans-serif",paddingTop:130,paddingBottom:60}}>
        <div className="page-wrap" style={{maxWidth:860,margin:"0 auto",padding:"0 40px"}}>

          {/* STATUS ROW */}
          <div style={{display:"flex",justifyContent:"center",alignItems:"center",position:"relative",marginBottom:28,minHeight:72}}>
            <div style={{textAlign:"center"}}>
              <div style={{fontSize:28,fontWeight:800,color:isSuccess?"#1a7a3a":"#c0392b",marginBottom:6}}>
                {isSuccess?"SUCCESS":"FAILED"}
              </div>
              {isSuccess && paymentId && (
                <p style={{fontSize:15,color:"#555"}}>
                  Transaction Reference No:&nbsp;
                  <strong style={{fontFamily:"monospace",color:"#1a1a1a"}}>{paymentId}</strong>
                </p>
              )}
              {!isSuccess && (
                <p style={{fontSize:15,color:"#555"}}>
                  Your payment could not be completed. You can try again.
                </p>
              )}
            </div>
            <img
              src="/assets/b_assured_logo2.png"
              alt=""
              style={{height:90,objectFit:"contain",position:"absolute",right:0,top:"50%",transform:"translateY(-50%)"}}
              onError={e=>e.target.style.display="none"}
            />
          </div>

          {/* AMOUNTS */}
          <div className="amt-grid" style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:"12px 0",borderTop:"1px solid #eee",borderBottom:"2px solid #eee",padding:"16px 0",marginBottom:4}}>
            <F label="Bill Amount"     value={billAmt>0?fmt(billAmt):"—"} />
            <F label="Convenience Fee" value={fmt(totalConvFee)} />
            <F label="Total Paid"      value={fmt(totalPaid)} />
          </div>

          <G2 className="g2">
            <F label="Source Ref No"    value={sourceRefNo} />
            <F label="B-Connect txn id" value={bbpsTxnId} />
          </G2>

          <G3 className="g3">
            <F label="Payment Status"  value={payStatus}  color={isOk(payStatus)?"#1a7a3a":"#c0392b"} />
            <F label="Payment Channel" value="Internet" />
            <F label="Payment Method"  value={payMethod} />
          </G3>

          <div style={{height:1,background:"#eee",margin:"4px 0"}}/>

          <G2 className="g2">
            <F label="Bill Status" value={billerStatus||billStatus} color={isOk(billerStatus||billStatus)?"#1a7a3a":"#c0392b"} />
            <F label="Biller ID"   value={billerId} />
          </G2>

          {(billDate||billDueDate||billPeriod) && (
            <G3 className="g3">
              <F label="Bill Date"     value={billDate} />
              <F label="Bill Due Date" value={billDueDate} />
              <F label="Bill Period"   value={billPeriod} />
            </G3>
          )}

          {billNumber && (
            <div style={{padding:"14px 0",borderBottom:"1px solid #eee"}}>
              <F label="Bill Number(s)" value={billNumber} />
            </div>
          )}

          <G2 className="g2">
            <F label="Mobile Number"    value={mobileAuth} />
            <F label="Transaction Time" value={txnDateTime} />
          </G2>

          {mpError && (
            <div style={{padding:"10px 14px",background:"#fffbf0",border:"1px solid #f5e060",borderRadius:5,fontSize:12,color:"#7a6000",marginTop:12}}>
              ⚠️ {mpError}
            </div>
          )}

          <div style={{borderTop:"1px solid #eee",paddingTop:10,marginTop:16,textAlign:"center"}}>
            <p style={{fontSize:10,color:"#ccc"}}>Powered by Bharat BillPay Connect • BBPS Certified</p>
          </div>

          {/* BUTTONS */}
          <div className="btn-row" style={{display:"flex",justifyContent:"center",gap:14,marginTop:24,flexWrap:"wrap"}}>
            <button onClick={()=>navigate("/BillHomePage")} style={{padding:"11px 30px",borderRadius:6,border:"1.5px solid #fd561e",background:"#fff",color:"#fd561e",fontWeight:700,fontSize:14,cursor:"pointer"}}>
              ← Back to Home
            </button>

            {isSuccess && (
              <button onClick={handleDownload} style={{padding:"11px 30px",borderRadius:6,border:"none",background:"#fd561e",color:"#fff",fontWeight:700,fontSize:14,cursor:"pointer",display:"flex",alignItems:"center",gap:7}}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/>
                </svg>
                Download Receipt
              </button>
            )}

            {/* FAIL aithe Try Again — BillDesk relaunch */}
            {!isSuccess && (
              <button onClick={handleTryAgain} disabled={retrying} style={{padding:"11px 30px",borderRadius:6,border:"none",background:retrying?"#f6a98c":"#fd561e",color:"#fff",fontWeight:700,fontSize:14,cursor:retrying?"default":"pointer",display:"flex",alignItems:"center",gap:8}}>
                {retrying && (
                  <span style={{width:14,height:14,borderRadius:"50%",border:"2px solid #fff",borderTopColor:"transparent",display:"inline-block",animation:"spin 0.7s linear infinite"}}/>
                )}
                {retrying ? "Starting..." : "Try Again"}
              </button>
            )}
          </div>

        </div>
      </div>
    </>
  );
};

export default BillPaymentStatus;