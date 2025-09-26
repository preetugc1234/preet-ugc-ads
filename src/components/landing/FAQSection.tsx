import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

const faqs = [
  {
    question: "What is MakeUGC and how does it work?",
    answer: "MakeUGC is an AI-powered platform that creates authentic user-generated content videos without needing real creators. Simply describe your product, and our AI generates realistic talking product-in-hand videos with natural speech, hooks, and full scripts."
  },
  {
    question: "How realistic are the AI-generated videos?",
    answer: "Our AI avatars are incredibly realistic and indistinguishable from real creators. We use advanced speech-to-speech technology and 300+ diverse avatars to create authentic-looking UGC content that performs as well as traditional creator content."
  },
  {
    question: "Can I customize the videos for my brand?",
    answer: "Absolutely! You can customize everything - choose from 300+ AI creators, write custom scripts or let our AI write them, select different languages (35+ supported), and create multiple variations for A/B testing. The content matches your brand voice perfectly."
  },
  {
    question: "How much does it cost compared to traditional UGC?",
    answer: "MakeUGC costs under $6 per video, while traditional UGC creators typically charge $300+ per video. You save 95%+ on content creation costs while getting faster turnaround and consistent quality."
  },
  {
    question: "How fast can I get my videos?",
    answer: "Videos are processed in under 2 minutes! No more waiting weeks for creators to shoot, edit, and deliver content. You can create hundreds of video variations instantly and start testing immediately."
  },
  {
    question: "Do the videos actually convert well?",
    answer: "Yes! Our AI-generated UGC videos perform just as well as traditional creator content, often better. Many clients see improved conversion rates because they can test more variations and find winning combinations faster."
  }
];

export default function FAQSection() {
  const [openItems, setOpenItems] = useState<number[]>([]);

  const toggleItem = (index: number) => {
    setOpenItems(prev =>
      prev.includes(index)
        ? prev.filter(item => item !== index)
        : [...prev, index]
    );
  };

  return (
    <section className="py-24 bg-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
            Frequently Asked <span className="text-blue-500">Questions</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Everything you need to know about MakeUGC and how it revolutionizes content creation.
          </p>
        </div>

        {/* FAQ Items */}
        <div className="space-y-4">
          {faqs.map((faq, index) => {
            const isOpen = openItems.includes(index);

            return (
              <div
                key={index}
                className="bg-gray-50 rounded-2xl border border-gray-200 overflow-hidden transition-all duration-300 hover:shadow-md"
              >
                <button
                  onClick={() => toggleItem(index)}
                  className="w-full px-6 py-5 text-left flex items-center justify-between hover:bg-gray-100 transition-colors duration-200"
                >
                  <span className="text-lg font-semibold text-gray-900 pr-4">
                    {faq.question}
                  </span>
                  <div className="flex-shrink-0">
                    {isOpen ? (
                      <ChevronUp className="w-5 h-5 text-blue-500" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-gray-400" />
                    )}
                  </div>
                </button>

                {isOpen && (
                  <div className="px-6 pb-5">
                    <div className="pt-2 border-t border-gray-200">
                      <p className="text-gray-700 leading-relaxed">
                        {faq.answer}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-12">
          <p className="text-gray-600 mb-4">
            Still have questions? We're here to help.
          </p>
          <button className="bg-blue-500 hover:bg-blue-600 text-white px-8 py-3 rounded-xl font-medium transition-colors duration-200">
            Contact Support
          </button>
        </div>
      </div>
    </section>
  );
}