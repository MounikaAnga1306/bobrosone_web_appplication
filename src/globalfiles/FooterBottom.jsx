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
            <img src="/assets/isologo.png" alt="ISO 27001 Information Security" className="h-9 sm:h-10 md:h-11 w-auto object-contain" />
          </div>
        </div>
      </div>

      {/* Divider */}
      <hr className="my-5 sm:my-6 md:my-6 border-gray-300" />

      {/* OUR SOCIAL MEDIA HANDLES — wordmark logos + URL text below */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-center gap-5 lg:gap-12">
        <span className="text-sm sm:text-base font-bold text-gray-900 whitespace-nowrap text-center lg:text-left">
          Our Social Media Handles :
        </span>

        <div className="flex flex-wrap items-start justify-center gap-x-10 gap-y-6 sm:gap-x-14">

          {/* Facebook — ni original link */}
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
            <span className="text-xs sm:text-sm text-gray-700">
              www.facebook.com/Bobros   {/* display text — kావాలంటే marchuko */}
            </span>
          </a>

          {/* LinkedIn — ni original link */}
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
            <span className="text-xs sm:text-sm text-gray-700">
              www.linkedin.com/company/bobros   {/* display text — kావాలంటే marchuko */}
            </span>
          </a>

          {/* YouTube — nuvve add cheskో (href + display text marchu) */}
          <a
            href="https://www.youtube.com/@bobros"
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
            <span className="text-xs sm:text-sm text-gray-700">
              www.youtube.com/@bobros   {/* TODO: ni youtube channel */}
            </span>
          </a>

          {/* Instagram — ni original link */}
          <a
            href="https://www.instagram.com/reel/DWHbVmcib4M/?igsh=ODdzZjljNzZnejN5"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Instagram"
            className="flex flex-col items-center gap-1.5 hover:opacity-80 transition-opacity"
          >
            <img
              src="/assets/Instagram.svg"
              alt="Instagram"
              className="h-6 sm:h-7 w-auto object-contain"
            />
            <span className="text-xs sm:text-sm text-gray-700">
              www.instagram.com/bobros   {/* display text — kావాలంటే marchuko */}
            </span>
          </a>

        </div>
      </div>
    </div>
  );
}