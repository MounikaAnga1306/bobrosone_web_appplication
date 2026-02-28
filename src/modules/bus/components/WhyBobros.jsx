import { CheckCircle } from "lucide-react";

const features = [
  "Trusted Travel and IT Services Brand in India",
  "Pay only what you see - No extra charges",
  "500+ bus operators on 10,000+ routes",
  "Highly Secured User Journey",
  "Earn Reward Points on every journey",
  "Affordable, fast, and easy Web Designing and Hosting for your digital journey",
];

export default function WhyBobros() {
  return (
    <section className="w-full bg-white pt-0 pb-12 mt-10 ">
      <div className="max-w-6xl mx-auto px-6">
        {/* Heading */}
        <h2 className="text-3xl md:text-4xl font-semibold mb-10 flex items-center gap-2">
          <span className="text-[#fd561e]">Why</span>
          <span className="text-[#fd561e]">Choose</span>
          <span className="text-[#fd561e]">BOBROS</span>
        </h2>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {features.map((item, index) => (
            <div
              key={index}
              className="group flex items-start gap-4 p-5 rounded-xl border border-gray-200 shadow-sm 
              hover:shadow-lg transition-all duration-300 bg-white hover:bg-orange-50"
            >
              {/* Icon */}
              <div
                className="flex-shrink-0 w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center 
              group-hover:bg-orange-500 transition"
              >
                <CheckCircle
                  className="text-orange-500 group-hover:text-white"
                  size={22}
                />
              </div>

              {/* Text */}
              <p className="text-gray-700 text-base leading-relaxed group-hover:text-gray-900">
                {item}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
