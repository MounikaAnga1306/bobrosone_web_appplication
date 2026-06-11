import { Ticket, ArrowRight } from "lucide-react";

export default function Advertisement() {
  // Book Now -> ade page top ki smooth scroll
  const handleBookNow = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="w-full flex justify-center -mt-6 sm:mt-8 md:-mt-18 px-3 sm:px-4 relative z-0">
      {/* component-scoped animations */}
      <style>{`
        @keyframes ad-shine {
          0%   { transform: translateX(-160%) skewX(-18deg); }
          100% { transform: translateX(320%) skewX(-18deg); }
        }
        @keyframes ad-bus-drive {
          0%   { transform: translateX(-740px); }
          100% { transform: translateX(730px); }
        }
        .ad-shine-sweep {
          position: absolute; top: 0; left: 0; height: 100%; width: 45%;
          background: linear-gradient(120deg, transparent, rgba(255,255,255,0.6), transparent);
          transform: translateX(-160%) skewX(-18deg);
          pointer-events: none;
        }
        .ad-btn:hover .ad-shine-sweep { animation: ad-shine 0.9s ease; }
        .ad-bus { animation: ad-bus-drive 13s linear infinite; transform-box: fill-box; }
        @media (prefers-reduced-motion: reduce) {
          .ad-btn:hover .ad-shine-sweep { animation: none !important; }
          .ad-bus { animation: none !important; }
        }
      `}</style>

      <div className="relative w-full max-w-6xl min-h-[150px] md:min-h-[180px] rounded-2xl sm:rounded-3xl overflow-hidden shadow-md ring-1 ring-black/5">
        {/* ── Scene: soft sky, sun, skyline, green hills, road, bushes (banner image laga) ── */}
        <svg
          className="absolute inset-0 w-full h-full"
          viewBox="0 0 1200 260"
          preserveAspectRatio="xMidYMid slice"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <defs>
            <linearGradient id="adSky" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#d9edfb" />
              <stop offset="55%" stopColor="#f2f8fc" />
              <stop offset="100%" stopColor="#fdf9ef" />
            </linearGradient>
            <radialGradient id="adSunGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#fdedb4" stopOpacity="0.95" />
              <stop offset="55%" stopColor="#fdf2c8" stopOpacity="0.55" />
              <stop offset="100%" stopColor="#fdf2c8" stopOpacity="0" />
            </radialGradient>
            <linearGradient id="adRoad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#55585e" />
              <stop offset="100%" stopColor="#3e4147" />
            </linearGradient>
          </defs>

          {/* Sky */}
          <rect x="0" y="0" width="1200" height="260" fill="url(#adSky)" />

          {/* Sun glow + soft sun */}
          <circle cx="600" cy="140" r="170" fill="url(#adSunGlow)" />
          <circle cx="600" cy="142" r="52" fill="#fbe49a" opacity="0.9" />
          <circle cx="600" cy="142" r="40" fill="#fceeb6" />

          {/* Clouds */}
          <g fill="#ffffff">
            <ellipse cx="300" cy="58" rx="46" ry="13" opacity="0.95" />
            <ellipse cx="270" cy="50" rx="26" ry="10" opacity="0.95" />
            <ellipse cx="330" cy="50" rx="22" ry="9" opacity="0.95" />
            <ellipse cx="940" cy="50" rx="50" ry="13" opacity="0.95" />
            <ellipse cx="912" cy="42" rx="26" ry="10" opacity="0.95" />
            <ellipse cx="968" cy="43" rx="22" ry="9" opacity="0.95" />
          </g>

          {/* Birds */}
          <g stroke="#9aa6b0" strokeWidth="1.6" fill="none" strokeLinecap="round">
            <path d="M770,88 q5,-5 10,0 q5,-5 10,0" />
            <path d="M796,78 q4,-4 8,0 q4,-4 8,0" />
          </g>

          {/* City skyline silhouettes (faint) */}
          <g fill="#8b97a3" opacity="0.18">
            <path d="M350,178 h10 v-26 h8 v26 h8 v-16 h10 v16 h8 v-32 h8 v32 h10 v-20 h8 v20 z" />
            <path d="M790,176 h10 v-30 h8 v30 h8 v-44 h8 v44 h10 v-24 h8 v24 h8 v-36 h10 v36 h8 v-18 h8 v18 z" />
            <path d="M880,176 h8 v-22 h8 v22 h10 v-34 h8 v34 z" />
          </g>

          {/* Back hills (light green) */}
          <path d="M0,190 Q200,150 430,178 T860,172 Q1040,158 1200,180 L1200,260 L0,260 Z" fill="#cfe8bd" />
          {/* Mid hills (brighter green) */}
          <path d="M0,205 Q260,170 560,198 T1200,196 L1200,260 L0,260 Z" fill="#a3d488" />

          {/* Small trees on hills */}
          <g>
            <path d="M868,182 q6,-22 12,0 z" fill="#5ea96b" />
            <rect x="872.5" y="182" width="3" height="7" fill="#7c5a3a" />
            <path d="M905,188 q5,-18 10,0 z" fill="#6cb377" />
            <rect x="909" y="188" width="2.6" height="6" fill="#7c5a3a" />
            <path d="M1118,186 q6,-20 12,0 z" fill="#5ea96b" />
            <rect x="1122.5" y="186" width="3" height="7" fill="#7c5a3a" />
          </g>

          {/* Road */}
          <rect x="0" y="208" width="1200" height="52" fill="url(#adRoad)" />
          {/* Top edge line (muted yellow, image laga) */}
          <rect x="0" y="210" width="1200" height="2.5" fill="#d8b25e" opacity="0.6" />
          {/* Dashed white line — road madhyalo (real road marking laga), soft white */}
          <g fill="#e6e4dc" opacity="0.8">
            {Array.from({ length: 18 }).map((_, i) => (
              <rect key={i} x={10 + i * 68} y="230" width="36" height="4" rx="2" />
            ))}
          </g>

          {/* ── Bus (white coach + orange swoosh) — moves across the road ── */}
          <g className="ad-bus">
            <g transform="translate(505,154)">
              {/* shadow */}
              <ellipse cx="98" cy="64" rx="100" ry="7" fill="#000000" opacity="0.18" />
              {/* body */}
              <rect x="0" y="0" width="196" height="56" rx="11" fill="#fbfbfb" />
              <rect x="0" y="0" width="196" height="56" rx="11" fill="none" stroke="#d8d8d8" strokeWidth="1" />
              {/* roof line */}
              <rect x="10" y="-3" width="150" height="5" rx="2.5" fill="#e8e8e8" />
              {/* window band (tinted) */}
              <rect x="10" y="7" width="146" height="19" rx="5" fill="#2e4040" />
              {/* window dividers */}
              <g fill="#fbfbfb" opacity="0.85">
                {Array.from({ length: 5 }).map((_, i) => (
                  <rect key={i} x={36 + i * 25} y="7" width="2.4" height="19" />
                ))}
              </g>
              {/* windshield */}
              <path d="M164,7 h16 q9,0 11,10 v22 q0,5 -5,5 h-22 z" fill="#34514f" />
              <path d="M166,9 h13 q7,0 9,8 l1,8 h-23 z" fill="#5c7f7c" opacity="0.6" />
              {/* mirror */}
              <rect x="189" y="10" width="3" height="9" rx="1.5" fill="#2e4040" />
              {/* orange swoosh */}
              <path d="M0,40 q60,-16 120,-4 q44,9 76,2 v12 q0,6 -6,6 h-184 q-6,0 -6,-6 z" fill="#FD561E" />
              <path d="M0,44 q70,-12 196,-2 v8 q0,6 -6,6 h-184 q-6,0 -6,-6 z" fill="#ff7a45" opacity="0.7" />
              {/* skirt */}
              <rect x="0" y="52" width="196" height="4" rx="2" fill="#c9c9c9" />
              {/* door */}
              <rect x="146" y="30" width="14" height="24" rx="2" fill="#3a4a4a" opacity="0.55" />
              {/* headlight + taillight */}
              <rect x="191" y="38" width="5" height="8" rx="2" fill="#ffd86b" />
              <rect x="0" y="38" width="4" height="8" rx="2" fill="#e0452a" />
              {/* wheels — rear double + front */}
              <g>
                <circle cx="42" cy="58" r="11" fill="#23262b" />
                <circle cx="42" cy="58" r="4.5" fill="#9aa0a6" />
                <circle cx="70" cy="58" r="11" fill="#23262b" />
                <circle cx="70" cy="58" r="4.5" fill="#9aa0a6" />
                <circle cx="158" cy="58" r="11" fill="#23262b" />
                <circle cx="158" cy="58" r="4.5" fill="#9aa0a6" />
              </g>
            </g>
          </g>

          {/* Foreground grass strip in front of road edge */}
          <path d="M0,208 Q300,202 620,208 T1200,206 L1200,212 L0,212 Z" fill="#8cc977" opacity="0.0" />

          {/* ── Bottom-corner bushes with flowers (foreground) ── */}
          <g>
            {/* Left bush cluster */}
            <ellipse cx="28" cy="252" rx="64" ry="34" fill="#2f6e44" />
            <ellipse cx="86" cy="258" rx="52" ry="26" fill="#3f8a55" />
            <ellipse cx="-6" cy="246" rx="44" ry="30" fill="#27603b" />
            <g fill="#ffffff">
              <circle cx="52" cy="238" r="3" />
              <circle cx="84" cy="248" r="2.6" />
              <circle cx="24" cy="246" r="2.6" />
            </g>
            <g fill="#ffd86b">
              <circle cx="52" cy="238" r="1.2" />
              <circle cx="84" cy="248" r="1" />
              <circle cx="24" cy="246" r="1" />
              <circle cx="68" cy="234" r="2" />
            </g>

            {/* Right bush cluster */}
            <ellipse cx="1172" cy="250" rx="66" ry="36" fill="#2f6e44" />
            <ellipse cx="1116" cy="258" rx="52" ry="26" fill="#3f8a55" />
            <ellipse cx="1206" cy="244" rx="44" ry="30" fill="#27603b" />
            <g fill="#ffffff">
              <circle cx="1148" cy="240" r="3" />
              <circle cx="1118" cy="250" r="2.6" />
              <circle cx="1184" cy="244" r="2.6" />
            </g>
            <g fill="#ffd86b">
              <circle cx="1148" cy="240" r="1.2" />
              <circle cx="1118" cy="250" r="1" />
              <circle cx="1184" cy="244" r="1" />
              <circle cx="1132" cy="236" r="2" />
            </g>
          </g>
        </svg>

        {/* Content */}
        <div className="relative z-10 flex flex-col md:flex-row items-center md:items-start justify-between gap-3 sm:gap-4 md:gap-6 px-5 sm:px-8 md:px-12 pt-2 sm:pt-3 md:pt-3 pb-4 sm:pb-5 md:pb-6">
          <div className="text-center md:text-left flex-1">
            <p className="inline-flex items-center gap-1.5 text-[10px] sm:text-xs font-bold uppercase tracking-wider text-white bg-[#FD561E] px-3 py-1.5 rounded-full mt-0 shadow-sm">
              <Ticket className="w-3.5 h-3.5" />
              New User Offer
            </p>

            <h3 className="text-base sm:text-lg md:text-xl lg:text-2xl font-extrabold leading-tight mt-2 text-slate-900">
              Get <span className="text-[#FD561E]">10% OFF</span> on your first bus booking!
            </h3>

            <p className="text-[11px] sm:text-xs md:text-sm mt-1.5 text-slate-700 flex flex-wrap items-center justify-center md:justify-start gap-1.5">
              Use promocode
              <span className="font-bold text-[#FD561E] bg-white border border-dashed border-[#FD561E] px-2.5 py-0.5 rounded-md inline-block text-[10px] sm:text-xs tracking-wider shadow-sm">
                JOINBOBROS
              </span>
              at checkout
            </p>
          </div>

          <button
            onClick={handleBookNow}
            className="ad-btn relative overflow-hidden mt-1 md:mt-6 bg-[#FD561E] cursor-pointer text-white font-bold px-6 sm:px-7 md:px-8 py-2.5 md:py-3 rounded-xl text-xs sm:text-sm md:text-base shadow-lg shadow-[#FD561E]/30 hover:scale-105 transition-all duration-300 whitespace-nowrap flex-shrink-0 flex items-center gap-1.5"
          >
            <span className="relative z-10 flex items-center gap-1.5">
              Book Now
              <ArrowRight className="w-4 h-4" />
            </span>
            <span className="ad-shine-sweep" aria-hidden="true" />
          </button>
        </div>
      </div>
    </div>
  );
}