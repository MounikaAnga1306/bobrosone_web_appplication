export default function FooterBottom() {
  return (
    <div className="w-full bg-white px-10 py-6">
      {/* Top Row */}
      <div className="flex items-center gap-6 flex-nowrap overflow-x-auto">
        {/* WE ACCEPT */}
        <div className="flex items-center gap-3">
          <span className="text-xs font-bold text-gray-800 tracking-widest whitespace-nowrap">
            WE ACCEPT
          </span>
          {/* VISA */}
          <div className="w-16 h-8 bg-gray-100 border border-gray-200 rounded flex items-center justify-center">
            <img
              src="YOUR_VISA_IMAGE_URL"
              alt="VISA"
              className="w-full h-full object-contain p-1"
            />
          </div>
          {/* Mastercard */}
          <div className="w-12 h-8 bg-gray-100 border border-gray-200 rounded flex items-center justify-center">
            <img
              src="YOUR_MASTERCARD_IMAGE_URL"
              alt="Mastercard"
              className="w-full h-full object-contain p-1"
            />
          </div>
          {/* UPI */}
          <div className="w-12 h-8 bg-gray-100 border border-gray-200 rounded flex items-center justify-center">
            <img
              src="YOUR_UPI_IMAGE_URL"
              alt="UPI"
              className="w-full h-full object-contain p-1"
            />
          </div>
          {/* RuPay */}
          <div className="w-16 h-8 bg-gray-100 border border-gray-200 rounded flex items-center justify-center">
            <img
              src="YOUR_RUPAY_IMAGE_URL"
              alt="RuPay"
              className="w-full h-full object-contain p-1"
            />
          </div>
        </div>

        {/* MEMBER OF */}
        <div className="flex items-center gap-3">
          <span className="text-xs font-bold text-gray-800 tracking-widest whitespace-nowrap">
            MEMBER OF
          </span>
          {/* IATA */}
          <div className="w-20 h-10 bg-gray-100 border border-gray-200 rounded flex items-center justify-center">
            <img
              src="YOUR_IATA_IMAGE_URL"
              alt="IATA"
              className="w-full h-full object-contain p-1"
            />
          </div>
          {/* Accredited Agent */}
          <div className="w-20 h-10 bg-gray-100 border border-gray-200 rounded flex items-center justify-center">
            <img
              src="YOUR_ACCREDITED_AGENT_IMAGE_URL"
              alt="Accredited Agent"
              className="w-full h-full object-contain p-1"
            />
          </div>
        </div>

        {/* Razorpay */}
        <div className="w-24 h-10 bg-gray-100 border border-gray-200 rounded flex items-center justify-center">
          <img
            src="YOUR_RAZORPAY_IMAGE_URL"
            alt="Razorpay"
            className="w-full h-full object-contain p-1"
          />
        </div>

        {/* Google Partner */}
        <div className="w-24 h-10 bg-gray-100 border border-gray-200 rounded flex items-center justify-center">
          <img
            src="YOUR_GOOGLE_PARTNER_IMAGE_URL"
            alt="Google Partner"
            className="w-full h-full object-contain p-1"
          />
        </div>

        {/* SECTIGO */}
        <div className="w-28 h-10 bg-gray-100 border border-gray-200 rounded flex items-center justify-center">
          <img
            src="YOUR_SECTIGO_IMAGE_URL"
            alt="SECTIGO"
            className="w-full h-full object-contain p-1"
          />
        </div>
      </div>

      {/* Horizontal Line */}
      <hr className="my-5 border-gray-300" />

      {/* Bottom Row - Follow Us */}
      <div className="flex items-center justify-center gap-4">
        <span className="text-xs font-bold text-gray-800 tracking-widest">
          FOLLOW US
        </span>

        {/* Facebook */}
        <a href="#" aria-label="Facebook">
          <svg
            width="32"
            height="32"
            viewBox="0 0 32 32"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <circle cx="16" cy="16" r="16" fill="#1877F2" />
            <path
              d="M21 10h-2.5C17.67 10 17 10.67 17 11.5V13h4l-.5 4H17v9h-4v-9h-3v-4h3v-1.5C13 8.57 14.57 7 16.5 7H21v3z"
              fill="white"
            />
          </svg>
        </a>

        {/* Instagram */}
        <a href="#" aria-label="Instagram">
          <svg
            width="32"
            height="32"
            viewBox="0 0 32 32"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
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
            <rect
              x="9"
              y="9"
              width="14"
              height="14"
              rx="4"
              ry="4"
              stroke="white"
              strokeWidth="1.5"
              fill="none"
            />
            <circle
              cx="16"
              cy="16"
              r="3.5"
              stroke="white"
              strokeWidth="1.5"
              fill="none"
            />
            <circle cx="20.5" cy="11.5" r="1" fill="white" />
          </svg>
        </a>

        {/* LinkedIn */}
        <a href="#" aria-label="LinkedIn">
          <svg
            width="32"
            height="32"
            viewBox="0 0 32 32"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
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
