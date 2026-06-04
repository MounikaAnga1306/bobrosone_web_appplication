export default function FooterBottom() {
  return (
    <div className="w-full bg-gray-380 px-4 sm:px-6 md:px-8 lg:px-10 py-4 sm:py-5 md:py-6 relative" style={{ zIndex: 10 }}>
      {/* TOP SECTION — 3 sections madhyalo gap penchanు */}
      <div className="flex flex-col md:flex-row justify-center items-center gap-8 md:gap-14 lg:gap-24">

        {/* WE ACCEPT */}
        <div className="flex flex-col items-center">
          <span className="text-xs font-bold text-gray-800 tracking-widest mb-3">
            WE ACCEPT
          </span>

          <div className="flex items-center gap-3 sm:gap-4 justify-center">
            <img src="/assets/visa.png" alt="VISA" className="h-7 sm:h-8 md:h-7 w-auto object-contain" />
            <img src="/assets/master_card.png" alt="Mastercard" className="h-7 sm:h-8 md:h-8 w-auto object-contain" />
            <img src="/assets/upi.png" alt="UPI" className="h-7 sm:h-8 md:h-7 w-auto object-contain" />
            <img src="/assets/Rupay-Logo.avif" alt="RuPay" className="h-8 sm:h-9 md:h-10 w-auto object-contain" />
            <img src="/assets/american-express.svg" alt="American Express" className="h-6 sm:h-7 md:h-8 w-auto object-contain" />
          </div>
        </div>

        {/* MEMBER OF — IATA */}
        <div className="flex flex-col items-center">
          <span className="text-xs font-bold text-gray-800 tracking-widest mb-3">
            MEMBER OF
          </span>

          <div className="w-20 sm:w-24 md:w-26 h-12 sm:h-14 md:h-15 rounded flex items-center justify-center">
            <img
              src="/assets/IATAloogo.jpg"
              alt="IATA"
              className="w-full h-full object-contain p-0.5 sm:p-1"
            />
          </div>
        </div>

        {/* OUR PARTNERS */}
        <div className="flex flex-col items-center">
          <span className="text-xs font-bold text-gray-800 tracking-widest mb-3">
            OUR PARTNERS & CERTIFICATIONS
          </span>

          <div className="flex items-center justify-center gap-1 sm:gap-2">
            <img src="/assets/Irdai_logo.png" alt="IRDAI" className="h-9 sm:h-10 md:h-11 w-auto object-contain" />
            <img src="/assets/razorpay_partner2.png" alt="Razorpay Partner" className="h-9 sm:h-10 md:h-9 -mr-4 w-auto object-contain" />
            <img src="/assets/Google-Partner.png" alt="Google Partner" className="h-12 sm:h-13 md:h-18 w-auto object-contain" />
            <img src="/assets/secure-partner-logo.png" alt="SECTIGO Secure Partner" className="h-9 sm:h-10 md:h-11 w-auto object-contain" />
            <img src="/assets/ISO_logo.png" alt="ISO 27001 Information Security" className="h-9 sm:h-10 md:h-11 w-auto object-contain" />
          </div>
        </div>
      </div>

      {/* Divider */}
      <hr className="my-5 sm:my-6 md:my-6 border-gray-300" />

      {/* FOLLOW US */}
      <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4">
        <span className="text-xs font-bold text-gray-800 tracking-widest">
          FOLLOW US
        </span>

        {/* Facebook */}
        <a
          href="https://www.facebook.com/share/v/18TxLzDzCA/"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Facebook"
          className="hover:opacity-80 transition-opacity"
        >
          <svg className="w-7 sm:w-8 md:w-8 h-7 sm:h-8 md:h-8" viewBox="0 0 32 32" fill="none">
            <circle cx="16" cy="16" r="16" fill="#1877F2" />
            <path
              d="M21 10h-2.5C17.67 10 17 10.67 17 11.5V13h4l-.5 4H17v9h-4v-9h-3v-4h3v-1.5C13 8.57 14.57 7 16.5 7H21v3z"
              fill="white"
            />
          </svg>
        </a>

        {/* Instagram */}
        <a
          href="https://www.instagram.com/reel/DWHbVmcib4M/?igsh=ODdzZjljNzZnejN5"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Instagram"
          className="hover:opacity-80 transition-opacity"
        >
          <svg className="w-7 sm:w-8 md:w-8 h-7 sm:h-8 md:h-8" viewBox="0 0 32 32" fill="none">
            <defs>
              <radialGradient id="ig-grad" cx="30%" cy="107%" r="150%">
                <stop offset="0%" stopColor="#fdf497" />
                <stop offset="5%" stopColor="#fdf497" />
                <stop offset="45%" stopColor="#fd5949" />
                <stop offset="60%" stopColor="#d6249f" />
                <stop offset="90%" stopColor="#285AEB" />
              </radialGradient>
            </defs>
            <circle cx="16" cy="16" r="16" fill="url(#ig-grad)" />
            <rect x="9" y="9" width="14" height="14" rx="4" stroke="white" strokeWidth="1.5" />
            <circle cx="16" cy="16" r="3.5" stroke="white" strokeWidth="1.5" />
            <circle cx="20.5" cy="11.5" r="1" fill="white" />
          </svg>
        </a>

        {/* LinkedIn */}
        <a
          href="https://www.linkedin.com/company/bobros/posts/?feedView=all"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="LinkedIn"
          className="hover:opacity-80 transition-opacity"
        >
          <svg className="w-7 sm:w-8 md:w-8 h-7 sm:h-8 md:h-8" viewBox="0 0 32 32" fill="none">
            <circle cx="16" cy="16" r="16" fill="#0A66C2" />
            <path
              d="M11 13h-2v8h2v-8zm-1-1.5a1.25 1.25 0 110-2.5 1.25 1.25 0 010 2.5zM23 21h-2v-4c0-1-.4-1.5-1.2-1.5-.9 0-1.3.6-1.3 1.5V21h-2v-8h2v1.1c.4-.7 1.1-1.1 2-1.1 1.6 0 2.5 1.1 2.5 3V21z"
              fill="white"
            />
          </svg>
        </a>
      </div>
    </div>
  );
}