import { useState } from "react";

const faqData = [
  {
    category: "Online Booking Related",
    questions: [
      {
        question: "How can I use BOBROS for booking a bus ticket?",
        answer: "Start by selecting your departure location, destination, and travel date. Pick the bus that best suits your needs, fill in the passenger information, and proceed with the payment. Once the booking is successful, your ticket details will be sent to you via SMS and email."
      },
      {
        question: "What happens if my schedule/service is cancelled?",
        answer: "In case of a cancellation, you will receive a direct update from our team or the travel operator via SMS or email. A full refund will be initiated automatically to you as BOBROS reward points. Your BOBROS Reward points can be used for your next Booking or alternatively you may contact us for a refund to your payment account/card. We strive to keep you informed at every step and appreciate your understanding."
      },
      {
        question: "Will I be charged more than the offline ticket price?",
        answer: "Not at all. BOBROS ensures that you pay the exact same fare as set by the bus operator. There are no additional charges—our prices match those of traditional offline bookings."
      },
      {
        question: "Do I need to create an account to use BOBROS?",
        answer: "No, creating an account is not required. BOBROS allows you to book tickets as a guest, making the process quick and hassle-free."
      },
      {
        question: "Why do seat prices vary within the same bus?",
        answer: "Seat prices can differ for several reasons:\n\n1. Some buses offer both AC and Non-AC options in a single vehicle.\n2. Certain buses have a mix of seater and sleeper seats, each with different comfort levels.\n3. Some operators choose to price front-row seats slightly higher than those at the back for better comfort or convenience."
      },
      {
        question: "Why do I need to provide my mobile number while booking tickets?",
        answer: "Entering your mobile number is essential as it helps us send you important updates like your booking confirmation."
      },
      {
        question: "What if the email and mobile number in my registered account are different from those provided in the passenger details?",
        answer: "For your convenience and accuracy, all ticket-related communication — including confirmations and travel updates — is sent to the email address and mobile number entered in the passenger details during the booking process, not the ones linked to your registered account. Please ensure the correct contact details are provided at the time of booking to avoid missing important updates."
      },
      {
        question: "I haven't received my ticket in my email. What should I do?",
        answer: "1. If you haven't received your ticket after booking, it could be due to one of the following reasons:\n\n2. The ticket email may have landed in your spam or junk folder—please check there.\nWe recommend first checking your bank statement to confirm if the amount was deducted.\n• If the payment was successful but you haven't received the ticket, please reach out to our customer support for immediate assistance.\n• If there was no deduction, feel free to retry the booking process. For any help, our 24/7 support team is just a call away."
      },
      {
        question: "I entered the wrong mobile number while booking. Can I receive my ticket on a different number?",
        answer: "Unfortunately, we're unable to resend tickets to a different mobile number once the booking is completed. We recommend double-checking all details before confirming your booking to avoid such issues."
      }
    ]
  },
  {
    category: "Cancellation Related",
    questions: [
      {
        question: "Can I cancel my bus ticket?",
        answer: "Yes, tickets booked through BOBROS can be cancelled before the scheduled departure time from the bus first boarding point. Please note that cancellation policies may vary depending on the bus operator."
      },
      {
        question: "How do I cancel my ticket if needed?",
        answer: "To cancel your ticket, simply visit our Cancellation page and enter your Booking ID, passenger mobile number, and passenger email address (provided at the time of booking) to proceed. Before confirming the cancellation, we recommend reviewing the applicable cancellation terms and conditions."
      },
      {
        question: "Can I partially cancel my ticket?",
        answer: "Partial cancellation is supported by selected bus operators. We recommend reviewing the cancellation policy of the specific bus partner during the booking process. If eligible, you can cancel part of your ticket directly through our portal by visiting our Cancellation page."
      }
    ]
  },
  {
    category: "Refund Related",
    questions: [
      {
        question: "I missed the bus. Can I get a refund?",
        answer: "If the bus is missed due to reasons not attributable to BOBROS (e.g., arriving late at the pickup point or waiting at the wrong location), no refund will be issued. However, if you miss your bus due to the bus operator—such as a scheduling error or bus cancellation—you are eligible for a full refund."
      },
      {
        question: "I've cancelled my booking—when will I receive my refund?",
        answer: "If you are a registered user, your refunds are processed instantly to your BOBROS account. These reward points can be used for your next booking or alternatively you may contact us for a refund to your payment account/card. If you are not processed and credited to your payment account/card within a maximum of 15 days from the date of cancellation."
      }
    ]
  },
  {
    category: "Payment Related",
    questions: [
      {
        question: "What payment methods are accepted?",
        answer: "We accept payments through internet banking, credit, debit cards (Visa, MasterCard, American Express, and Maestro) and UPI pay. Please note that only cards issued within India are supported. Additionally, you can also book tickets offline by visiting our office and making the payment directly."
      },
      {
        question: "I don't have a credit card—can I still book tickets on BOBROS?",
        answer: "Yes, a credit card isn't mandatory to book your tickets. You can use any internet-enabled bank account, UPI, or popular digital wallet options to complete your payment securely on BOBROS app and website."
      },
      {
        question: "How secure are online transactions on BOBROS?",
        answer: "Your transactions on BOBROS are highly secure. We use industry-leading Secure Socket Layer (SSL) encryption to protect your data during transmission, ensuring that no sensitive information is exposed or accessible to unauthorized parties. Additionally, all credit card transactions are processed through certified secure gateways approved by Visa and MasterCard."
      },
      {
        question: "Can I book and pay for someone else's ticket?",
        answer: "Yes, absolutely! You can book tickets on behalf of someone else—it's not necessary for the person making the payment to be the traveller. Just ensure that you provide accurate passenger details during booking, and remind the traveller to carry a valid government-issued ID at the time of boarding to avoid any issues."
      }
    ]
  },
  {
    category: "Bus Partner Related",
    questions: [
      {
        question: "Do Bus Partners have specific rules I should be aware of?",
        answer: "Yes, each Bus Partner may have their own set of rules — including luggage limits, and possible additional charges for carrying boxes or oversized items. Travel and cancellation policies can also vary from one operator to another. For any specific queries or clarifications, we kindly request you to contact the respective Bus Operator directly, as our platform does not currently provide support for operator-specific policies."
      }
    ]
  }
];

export default function FAQPage() {
  const [activeTab, setActiveTab] = useState(0);
  const [expandedQuestions, setExpandedQuestions] = useState({});
  const [feedback, setFeedback] = useState({});

  const toggleQuestion = (questionIndex) => {
    setExpandedQuestions(prev => ({
      ...prev,
      [questionIndex]: !prev[questionIndex]
    }));
  };

  const handleFeedback = (idx, type) => {
    setFeedback(prev => ({
      ...prev,
      [idx]: type
    }));
  };

  const currentCategory = faqData[activeTab];

  return (
    <div className="bg-white ">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 md:px-8 lg:px-6 py-6 sm:pt-8 md:pt-10 ml-0 md:ml-4 lg:ml-8 xl:ml-16">
        
        <h1 className="text-xl sm:text-2xl md:text-2xl lg:text-3xl font-bold text-gray-900 mb-4 sm:mb-5 md:mb-6">
          FAQs related to Bus Tickets Booking
        </h1>

        {/* Tabs - Horizontal scroll on mobile */}
        <div className="overflow-x-auto -mx-4 sm:mx-0 px-4 sm:px-0">
          <div className="flex border-b border-gray-200 mb-0 min-w-max sm:min-w-0">
            {faqData.map((cat, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setActiveTab(idx);
                  setExpandedQuestions({});
                  setFeedback({});
                }}
                className={`
                  px-3 sm:px-4 py-2.5 sm:py-3 text-xs sm:text-sm font-medium whitespace-nowrap relative transition-all
                  ${activeTab === idx
                    ? 'text-[#FD561E]'
                    : 'text-gray-600 hover:text-[#FD561E]'
                  }
                `}
              >
                {cat.category}

                {activeTab === idx && (
                  <span
                    className="absolute bottom-0 h-0.5 sm:h-1 bg-[#FD561E]"
                    style={{ width: "60%", left: "20%" }}
                  />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* FAQ List */}
        <div className="mt-2 sm:mt-4">
          {currentCategory.questions.map((faq, idx) => {
            const isExpanded = expandedQuestions[idx] || false;
            const userFeedback = feedback[idx];

            return (
              <div key={idx} className="border-b border-gray-200">
                <button
                  onClick={() => toggleQuestion(idx)}
                  className="w-full flex justify-between items-center py-3 sm:py-4 text-left gap-3 sm:gap-4"
                >
                  <span className="text-gray-800 text-xs sm:text-sm md:text-base pr-2 sm:pr-4 leading-relaxed">
                    {faq.question}
                  </span>
                  <svg
                    className={`w-4 h-4 sm:w-5 sm:h-5 text-gray-500 flex-shrink-0 transition-transform ${
                      isExpanded ? "rotate-180" : ""
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {isExpanded && (
                  <div className="pb-4 sm:pb-5 md:pb-6">
                    <p className="text-gray-700 text-xs sm:text-sm md:text-base leading-relaxed">
                      {faq.answer}
                    </p>

                    {/* Feedback Buttons */}
                    <div className="flex flex-wrap gap-3 sm:gap-4 md:gap-6 mt-3 sm:mt-4">
                      <button
                        className="flex items-center gap-1.5 sm:gap-2 text-green-600 hover:text-green-700 text-xs sm:text-sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleFeedback(idx, "helpful");
                        }}
                      >
                        <span className="text-sm sm:text-base">👍</span>
                        <span>Helpful</span>
                      </button>

                      <button
                        className="flex items-center gap-1.5 sm:gap-2 text-red-600 hover:text-red-700 text-xs sm:text-sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleFeedback(idx, "notHelpful");
                        }}
                      >
                        <span className="text-sm sm:text-base">👎</span>
                        <span>Not Helpful</span>
                      </button>
                    </div>

                    {/* Feedback Message */}
                    {userFeedback === "helpful" && (
                      <div className="mt-3 sm:mt-4 bg-green-100 text-green-700 px-3 sm:px-4 py-2 rounded-md text-xs sm:text-sm">
                        Thanks for your feedback!
                      </div>
                    )}

                    {userFeedback === "notHelpful" && (
                      <div className="mt-3 sm:mt-4 bg-red-100 text-red-700 px-3 sm:px-4 py-2 rounded-md text-xs sm:text-sm">
                        Sorry to hear that. We'll work on it.
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}