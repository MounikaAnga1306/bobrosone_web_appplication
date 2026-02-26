import { useState } from "react";

const faqs = [
  {
    id: 1,
    question: "What are the advantages of online flight booking?",
    answer:
      "Online flight booking offers convenience, competitive prices, and the ability to compare multiple airlines at once. You can book from the comfort of your home, access exclusive online deals, and receive instant confirmation of your bookings.",
  },
  {
    id: 2,
    question: "When should I book to get best flight ticket prices?",
    answer:
      "For best flight ticket prices and flight ticket offers, it is recommended to book at least 3 to 4 weeks in advance for domestic air tickets. For international flight ticket it is recommended to book at least 7 to 8 weeks in advance, so that you can get the best flight ticket prices.",
  },
  {
    id: 3,
    question: "How can I book flight tickets online?",
    answer: (
      <>
        With the help of BOBROS, you can easily book both domestic flight
        tickets and{" "}
        <a href="#" className="text-blue-500 hover:underline">
          international air tickets
        </a>{" "}
        in simple steps within a few seconds.
      </>
    ),
  },
  {
    id: 4,
    question: "Why should I make a flight booking from Goibibo?",
    answer: (
      <>
        Along with an easy flight booking process,{" "}
        <a href="#" className="text-blue-500 hover:underline">
          BOBROS offers
        </a>{" "}
        various discounts, instant EMI options and credit/ debit card related
        offers on flight booking. By availing such benefits, you can book air
        tickets at reasonable prices.
      </>
    ),
  },
];

export default function BusFAQ() {
  const [openId, setOpenId] = useState(2);

  const toggle = (id) => {
    setOpenId(openId === id ? null : id);
  };

  return (
    <div className="w-full  bg-gray-100 p-8 ">
      <div className="max-w-5xl mx-auto">
        <h2 className="font-bold text-black mb-5 text-xl">
          Flight Booking FAQs
        </h2>

        <div className="flex flex-col gap-3">
          {faqs.map((faq) => {
            const isOpen = openId === faq.id;
            return (
              <div
                key={faq.id}
                className="bg-white border border-gray-200 rounded"
              >
                {/* Question Row */}
                <button
                  onClick={() => toggle(faq.id)}
                  className="w-full flex items-center justify-between px-5 py-4 text-left"
                >
                  <span className="font-semibold text-gray-800 text-sm">
                    {faq.question}
                  </span>
                  {/* Arrow with animation */}
                  <span
                    className="text-gray-600 text-lg ml-4 transition-transform duration-300 ease-in-out"
                    style={{
                      transform: isOpen ? "rotate(90deg)" : "rotate(-90deg)",
                    }}
                  >
                    ›
                  </span>
                </button>

                {/* Answer with slide animation */}
                <div
                  className="overflow-hidden transition-all duration-300 ease-in-out"
                  style={{ maxHeight: isOpen ? "300px" : "0px" }}
                >
                  <p className="px-5 pb-5 text-sm text-gray-600 leading-relaxed border-t border-gray-100 pt-3">
                    {faq.answer}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
