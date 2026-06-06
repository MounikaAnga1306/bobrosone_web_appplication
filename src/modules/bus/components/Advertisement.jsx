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
          0%   { transform: translateX(-680px); }
          100% { transform: translateX(760px); }
        }
        .ad-shine-sweep {
          position: absolute; top: 0; left: 0; height: 100%; width: 45%;
          background: linear-gradient(120deg, transparent, rgba(255,255,255,0.6), transparent);
          transform: translateX(-160%) skewX(-18deg);
          pointer-events: none;
        }
        .ad-btn:hover .ad-shine-sweep { animation: ad-shine 0.9s ease; }
        .ad-bus { animation: ad-bus-drive 14s linear infinite; transform-box: fill-box; }
        @media (prefers-reduced-motion: reduce) {
          .ad-btn:hover .ad-shine-sweep { animation: none !important; }
          .ad-bus { animation: none !important; }
        }
      `}</style>

      <div className="relative w-full max-w-6xl min-h-[150px] rounded-xl sm:rounded-2xl overflow-hidden shadow-md ring-1 ring-black/10">
        {/* ── Sunrise-over-hills travel scene (balanced, not too pale) ── */}
        <svg
          className="absolute inset-0 w-full h-full"
          viewBox="0 0 1200 220"
          preserveAspectRatio="xMidYMid slice"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <defs>
            <linearGradient id="adSky" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#a9d8f5" />
              <stop offset="45%" stopColor="#dcebf0" />
              <stop offset="78%" stopColor="#ffe6bf" />
              <stop offset="100%" stopColor="#ffd29a" />
            </linearGradient>
            <radialGradient id="adSun" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#fff3cf" />
              <stop offset="45%" stopColor="#ffdd9a" stopOpacity="0.85" />
              <stop offset="100%" stopColor="#ffdd9a" stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* Sky */}
          <rect x="0" y="0" width="1200" height="220" fill="url(#adSky)" />

          {/* Soft clouds */}
          <ellipse cx="230" cy="48" rx="70" ry="14" fill="#ffffff" opacity="0.55" />
          <ellipse cx="960" cy="40" rx="85" ry="15" fill="#ffffff" opacity="0.5" />

          {/* Sun glow + sun */}
          <circle cx="600" cy="118" r="150" fill="url(#adSun)" />
          <circle cx="600" cy="120" r="34" fill="#ffd97a" />

          {/* Back hills */}
          <path d="M0,150 Q260,108 540,134 T1200,128 L1200,220 L0,220 Z" fill="#bfe0c4" />
          {/* Mid hills */}
          <path d="M0,170 Q340,140 720,168 T1200,160 L1200,220 L0,220 Z" fill="#8fcaa1" />

          {/* Road band */}
          <rect x="0" y="182" width="1200" height="26" fill="#cdc6bd" />
          <rect x="0" y="182" width="1200" height="2" fill="#bcb4a9" />
          {/* Road dashes */}
          <g fill="#f3b566">
            {Array.from({ length: 24 }).map((_, i) => (
              <rect key={i} x={20 + i * 50} y="194" width="22" height="3" rx="1.5" />
            ))}
          </g>

          {/* Foreground grass */}
          <path d="M0,206 Q300,196 620,206 T1200,204 L1200,220 L0,220 Z" fill="#76b98c" />

          {/* Simple bus on the road */}
          <g className="ad-bus">
            <rect x="468" y="158" width="176" height="34" rx="7" fill="#2f6fb0" />
            <rect x="468" y="176" width="176" height="8" rx="2" fill="#FD561E" />
            <rect x="478" y="163" width="120" height="11" rx="2.5" fill="#d6ecff" />
            <rect x="606" y="163" width="30" height="11" rx="2.5" fill="#bfe1ff" />
            <rect x="636" y="166" width="6" height="7" rx="1.5" fill="#ffd86b" />
            <circle cx="500" cy="194" r="8" fill="#2b2b2b" />
            <circle cx="500" cy="194" r="3.4" fill="#9aa0a6" />
            <circle cx="612" cy="194" r="8" fill="#2b2b2b" />
            <circle cx="612" cy="194" r="3.4" fill="#9aa0a6" />
          </g>
        </svg>

        {/* Gentle white wash on the left for text clarity */}
        <div className="absolute inset-0 bg-gradient-to-r from-white/85 via-white/35 to-transparent" />

        {/* Ticket perforation notches (blend with page bg) */}
        <div className="absolute -left-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-gray-100" />
        <div className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-gray-100" />

        {/* Content */}
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-3 sm:gap-4 md:gap-6 px-5 sm:px-7 md:px-9 py-4 sm:py-5 md:py-6">
          <div className="text-center md:text-left flex-1">
            <p className="inline-flex items-center gap-1.5 text-[10px] sm:text-xs font-bold uppercase tracking-wider text-white bg-[#FD561E] px-2.5 py-1 rounded-full mt-1 shadow-sm">
              <Ticket className="w-3 h-3" />
              New User Offer
            </p>

            <h3 className="text-sm sm:text-base md:text-lg lg:text-xl font-extrabold leading-tight mt-2 text-slate-900">
              Get <span className="text-[#FD561E]">10% OFF</span> on your first bus booking!
            </h3>

            <p className="text-[11px] sm:text-xs md:text-sm mt-1.5 text-slate-700 flex flex-wrap items-center justify-center md:justify-start gap-1.5">
              Use promocode
              <span className="font-bold text-[#FD561E] bg-white border border-dashed border-[#FD561E] px-2 py-0.5 rounded-md inline-block text-[10px] sm:text-xs tracking-wider shadow-sm">
                JOINBOBROS
              </span>
              at checkout
            </p>
          </div>

          <button
            onClick={handleBookNow}
            className="ad-btn relative overflow-hidden mt-1 md:mt-0 bg-[#FD561E] cursor-pointer text-white font-bold px-5 sm:px-6 md:px-7 py-2 md:py-2.5 rounded-lg text-[11px] sm:text-xs md:text-sm shadow-lg shadow-[#FD561E]/30 hover:scale-105 transition-all duration-300 whitespace-nowrap flex-shrink-0 flex items-center gap-1.5"
          >
            <span className="relative z-10 flex items-center gap-1.5">
              Book Now
              <ArrowRight className="w-3.5 h-3.5" />
            </span>
            <span className="ad-shine-sweep" aria-hidden="true" />
          </button>
        </div>
      </div>
    </div>
  );
}