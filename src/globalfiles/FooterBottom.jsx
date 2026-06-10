export default function FooterBottom() {
  return (
    <div className="w-full bg-gray-380 px-4 sm:px-6 md:px-8 lg:px-10 py-4 sm:py-5 md:py-6 relative" style={{ zIndex: 10 }}>
      {/* TOP SECTION — headings top-align (equal), uniform logo heights */}
      <div className="flex flex-col md:flex-row justify-center items-center md:items-start gap-8 md:gap-12 lg:gap-20">

        {/* AUTHORIZED BY — IRDAI (first) */}
        <div className="flex flex-col items-center">
          <span className="text-xs font-bold text-gray-800 tracking-widest mb-3 -mr-6">
            AUTHORIZED BY
          </span>

          <div className="flex items-center justify-center h-12 ml-6 sm:h-14">
            <img src="/assets/Irdai_logo.png" alt="IRDAI" className="h-9 sm:h-10 md:h-12 w-auto object-contain" />
          </div>
        </div>

        {/* MEMBER OF — IATA */}
        <div className="flex flex-col items-center">
          <span className="text-xs font-bold text-gray-800 tracking-widest mb-1 ml-10">
            MEMBER OF
          </span>

          <div className="flex items-center justify-center h-12 ml-10 sm:h-14">
            <img
              src="/assets/IATAloogo.png"
              alt="IATA"
              className="w-20 sm:w-28 h-full object-contain p-0.5 sm:p-1"
            />
          </div>
        </div>

        {/* OUR PARTNERS & CERTIFICATIONS */}
        <div className="flex flex-col items-center">
          <span className="text-xs font-bold text-gray-800 tracking-widest mb-3 ml-22">
            OUR PARTNERS & CERTIFICATIONS
          </span>

          <div className="flex items-center justify-center gap-2 ml-18 sm:gap-3 h-12 sm:h-14">
            <img src="/assets/razorpay_partner2.png" alt="Razorpay Partner" className="h-9 sm:h-10 md:h-11 w-auto object-contain" />
            <img src="/assets/Google-Partner.png" alt="Google Partner" className="h-10 sm:h-11 md:h-26 w-auto object-contain" />
            <img src="/assets/secure-partner-logo.png" alt="SECTIGO Secure Partner" className="h-9 sm:h-10 md:h-11 w-auto object-contain" />
            <img src="/assets/isologo.png" alt="ISO 27001 Information Security" className="h-9 sm:h-10 md:h-13 w-auto object-contain" />
          </div>
        </div>

        {/* WE ACCEPT (last) — uniform logo size */}
        <div className="flex flex-col items-center">
          <span className="text-xs font-bold text-gray-800 tracking-widest mb-3 ml-16">
            WE ACCEPT
          </span>

          <div className="flex items-center justify-center gap-3 ml-12 sm:gap-4 h-12 sm:h-14">
            <img src="/assets/visa.png" alt="VISA" className="h-6 sm:h-7 md:h-7 w-auto object-contain" />
            <img src="/assets/master_card.png" alt="Mastercard" className="h-6 sm:h-7 md:h-7 w-auto object-contain" />
            <img src="/assets/upi.png" alt="UPI" className="h-6 sm:h-7 md:h-7 w-auto object-contain" />
            <img src="/assets/Rupay-Logo.avif" alt="RuPay" className="h-6 sm:h-7 md:h-14 w-auto object-contain" />
            <img src="/assets/american-express.svg" alt="American Express" className="h-6 sm:h-7 md:h-8 w-auto object-contain" />
          </div>
        </div>
      </div>

      {/* Divider */}
      <hr className="my-5 sm:my-6 md:my-6 border-gray-300" />

      {/* OUR SOCIAL MEDIA HANDLES — logos only (URL text removed) */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-center gap-5 lg:gap-12">
      <span className="text-sm sm:text-base font-bold text-gray-900 whitespace-nowrap text-center lg:text-left">
  Our Social Media Handles :
</span>

        <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-6 sm:gap-x-14">

          {/* Facebook */}
          <a
            href="https://www.facebook.com/share/v/18TxLzDzCA/"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Facebook"
            className="flex flex-col items-center gap-1.5 hover:opacity-80 transition-opacity"
          >
            <img
              src="/assets/facebook.webp"
              alt="Facebook"
              className="h-6 sm:h-7 w-auto object-contain"
            />
          </a>

          {/* LinkedIn */}
          <a
            href="https://www.linkedin.com/company/bobros/posts/?feedView=all"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="LinkedIn"
            className="flex flex-col items-center gap-1.5 hover:opacity-80 transition-opacity"
          >
            <img
              src="/assets/linked.svg"
              alt="LinkedIn"
              className="h-6 sm:h-7 w-auto object-contain"
            />
          </a>

          {/* YouTube */}
          <a
            href="https://www.youtube.com/@BOBROSWORLD"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="YouTube"
            className="flex flex-col items-center gap-1.5 hover:opacity-80 transition-opacity"
          >
            <img
              src="/assets/youtube.svg"
              alt="YouTube"
              className="h-6 sm:h-7 w-auto object-contain"
            />
          </a>

          {/* Instagram */}
          <a
            href="https://www.instagram.com/reel/DWHbVmcib4M/?igsh=ODdzZjljNzZnejN5"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Instagram"
            className="flex flex-col items-center gap-1.5 hover:opacity-80 transition-opacity"
          >
            <img
              src="/assets/Instagram.png"
              alt="Instagram"
              className="h-6 sm:h-8 w-auto object-contain"
            />
          </a>

        </div>
      </div>
    </div>
  );
}