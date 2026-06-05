// src/lib/sessionGuard.js
//
// BOBROS session behavior (auth localStorage lo ney untంది — existing code marచakkarledు):
//   1. Same browser lo kొత్త tab → already logged in (localStorage shared)
//   2. Veru browser → login (localStorage empty)
//   3. Login ayina daanిని close chesి open → fresh login
//   4. Browser MOTHAM close chesthే → next open lo auto logout
//
// Ela pని chestుంది:
//   - sessionStorage lo "alive marker" — browser close ki poతుంది (same-tab reload ki untంది).
//   - Fresh tab open ayyనప్పుడు marker leకపోతే, migata open tabs ni localStorage "ping"
//     dwారా adugుతుంది. Edaina tab respond chesthే → same browser session → auth unchు.
//   - Evvaru respond cheయkపోతే (timeout) → browser fresh open → AUTH_KEYS clear → logout.

const ALIVE_KEY = "bobros_session_alive";        // sessionStorage marker
const PING_KEY  = "bobros_session_ping";         // localStorage ping (kొత్త tab adugుతుంది)
const SHARE_KEY = "bobros_session_alive_share";  // localStorage response (alive tab istుంది)

// BOBROS login ee 2 keys ney set chestుంది (SignIn.jsx). Token ledు.
const DEFAULT_AUTH_KEYS = ["user", "isLoggedIn"];

export function initSessionGuard({ authKeys = DEFAULT_AUTH_KEYS, onFreshBrowser } = {}) {
  // Responder: ఇంకొక tab ping chesthే — manaకి alive marker unte — respond chey
  window.addEventListener("storage", (e) => {
    if (e.key === PING_KEY && e.newValue !== null && sessionStorage.getItem(ALIVE_KEY)) {
      localStorage.setItem(SHARE_KEY, String(Date.now()));
      localStorage.removeItem(SHARE_KEY);
    }
  });

  // Same-tab reload → marker already untంది → ఏమీ cheయakkarledు (logged in ga untంది)
  if (sessionStorage.getItem(ALIVE_KEY)) return;

  // Fresh tab: migata tabs alive unnాయా అని adugు
  let answered = false;
  const onShare = (e) => {
    if (e.key === SHARE_KEY && e.newValue) {
      answered = true;
      sessionStorage.setItem(ALIVE_KEY, "1"); // same browser → marker set, auth unchు
      window.removeEventListener("storage", onShare);
    }
  };
  window.addEventListener("storage", onShare);

  localStorage.setItem(PING_KEY, String(Date.now()));
  localStorage.removeItem(PING_KEY);

  // Konchం sepu wait — ee lopu evvaru respond cheయkపోతే = fresh browser
  setTimeout(() => {
    window.removeEventListener("storage", onShare);
    if (answered) return;

    // Fresh browser → marker set chey
    sessionStorage.setItem(ALIVE_KEY, "1");

    // Auth actually unte ney clear + notify (logged-out visit lo unnecessary refresh వద్దు)
    const hadAuth = authKeys.some((k) => localStorage.getItem(k) != null);
    if (!hadAuth) return;

    authKeys.forEach((k) => localStorage.removeItem(k));

    if (typeof onFreshBrowser === "function") {
      onFreshBrowser();
    } else {
      // BOBROS app already 'storage' event ki listen chesి auth UI (Navbar) update chestుంది.
      // So reload అవసరం ledు — ee event dispatch chesthే logged-out state kనిపిస్తుంది.
      window.dispatchEvent(new Event("storage"));
    }
  }, 300);
}