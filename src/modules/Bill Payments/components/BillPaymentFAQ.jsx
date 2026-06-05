import { useState } from "react";

const faqData = [
  {
    category: "Bill Payments Complaint Related",
    questions: [
      {
        question: "How You Can Raise a Complaint?",
        answer: "You can raise a Bharat connect-related complaint easily through any of the following ways:\n\n BOBROS Mobile App \n\n BOBROS Web Portal / Internet Application \n\n Any BOBROS Branch or Authorized Outlet. \n\n You can raise a complaint even if the bill payment was made through a different BOBROS outlet or channel.There are no charges for lodging a complaint.",
      },
      {
        question: "How can I track my complaint and do I get any acknowledgement?",
        answer: "Once we receive your complaint, we will acknowledge it within one (1) working day.\n You will receive a unique complaint reference number that allows you to track the status of your complaint through our mobile app, website, or customer service channels.",
      },
      {
        question: "What is the resolution timeline for my complaint?",
        answer: "We will try to resolve your complaint within seven (7) working days, wherever possible.\n If we are unable to provide a resolution within that time, we'll let you know the expected time for resolution.\n All complaints will be resolved within a maximum of thirty (30) days from the date we receive them.\nIf we need more information from you to process your complaint, we'll contact you promptly.",
      },
      {
        question: "How I can receive any updates or communication regarding my complaint?",
        answer: "We'll keep you informed about the progress and final outcome of your complaint via SMS, email, or your registered contact method.\nIf your complaint needs to be escalated, we'll handle it as per the Bharat connect grievance redressal framework and inform you about the escalation.",
      },
      {
        question: "How does BOBROS ensure transparency and customer assistance?",
        answer: "At every BOBROS branch and authorised outlet, you'll find information displayed about:\n How to raise a complaint\n Expected timelines for response and resolution\n Contact details for customer support and escalation\n You can also access this policy anytime on our website or mobile app.",
      },
    ]
  },
];

export default function FAQPage() {
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

  const currentCategory = faqData[0];

  return (
    <div className="bg-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 md:px-8 lg:px-6 py-6 sm:pt-8 md:pt-10 ml-0 md:ml-4 lg:ml-8 xl:ml-16">

        <h1 className="text-xl sm:text-2xl md:text-2xl -ml-4 lg:text-3xl font-bold text-gray-900 mb-4 sm:mb-5 md:mb-6">
          FAQs related to Bill Payments
        </h1>

        {/* FAQ List */}
        <div className="mt-2 sm:mt-4">
          {currentCategory.questions.map((faq, idx) => {
            const isExpanded = expandedQuestions[idx] || false;
            const userFeedback = feedback[idx];

            return (
              <div key={idx} className="border-b border-gray-300">
                <button
                  onClick={() => toggleQuestion(idx)}
                  className="w-full flex justify-between items-center py-3 sm:py-4 text-left gap-3 sm:gap-4"
                >
                  <span className="text-gray-1000 text-xs sm:text-sm md:text-base pr-2 sm:pr-4 leading-relaxed font-semibold">
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