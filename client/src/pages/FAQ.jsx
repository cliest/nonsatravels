import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChevronDown,
  faChevronUp,
  faSearch,
  faQuestionCircle,
} from "@fortawesome/free-solid-svg-icons";
import { useTranslation } from "react-i18next";

const FAQ = () => {
  const { t } = useTranslation();
  const [openIndex, setOpenIndex] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  const faqs = [
    {
      category: "Booking & Reservations",
      questions: [
        {
          question: "How do I make a hotel booking?",
          answer: "To make a booking, browse our hotels, select your preferred accommodation, choose your dates and number of guests, then click 'Book Now'. You'll be guided through a secure checkout process where you can enter your details and payment information.",
        },
        {
          question: "Can I modify or cancel my booking?",
          answer: "Yes, you can modify or cancel your booking through the 'My Bookings' section in your account. Cancellation and modification policies vary by hotel, so please review the specific terms when making your reservation. Some bookings may be non-refundable or have cancellation fees.",
        },
        {
          question: "How do I know my booking is confirmed?",
          answer: "Once your booking is successful, you'll receive a confirmation email with your booking details and a unique booking reference number. You can also view all your bookings in the 'My Bookings' section of your account.",
        },
        {
          question: "Can I book for someone else?",
          answer: "Yes, you can make a booking for another person. During checkout, you can specify the guest's name and contact information. However, the payment will be processed using your account details.",
        },
      ],
    },
    {
      category: "Payment & Pricing",
      questions: [
        {
          question: "What payment methods do you accept?",
          answer: "We accept major credit and debit cards (Visa, Mastercard, American Express), PayPal, and bank transfers. All payments are processed securely through our encrypted payment gateway.",
        },
        {
          question: "Are there any hidden fees?",
          answer: "No, we believe in transparent pricing. The price you see during booking includes all applicable taxes and fees. Any additional charges (like resort fees or tourist taxes) that must be paid directly to the hotel will be clearly indicated before you confirm your booking.",
        },
        {
          question: "Do you offer a price match guarantee?",
          answer: "Yes! If you find a lower price for the same hotel, dates, and room type within 24 hours of booking, we'll match it. Contact our support team with proof of the lower price, and we'll process the adjustment.",
        },
        {
          question: "When will I be charged?",
          answer: "Payment timing depends on the hotel's policy. Some hotels charge immediately upon booking, while others may charge closer to your check-in date. The payment schedule will be clearly displayed during the booking process.",
        },
      ],
    },
    {
      category: "Account & Profile",
      questions: [
        {
          question: "Do I need an account to make a booking?",
          answer: "Yes, you need to create a free account to make bookings. This allows you to manage your reservations, save favorite hotels, track your booking history, and receive personalized recommendations.",
        },
        {
          question: "How do I reset my password?",
          answer: "Click on the 'Login' button and select 'Forgot Password'. Enter your email address, and we'll send you instructions to reset your password. If you don't receive the email, check your spam folder or contact support.",
        },
        {
          question: "Can I delete my account?",
          answer: "Yes, you can delete your account from the Profile Settings. Please note that you should cancel any active bookings before deleting your account. Once deleted, all your data will be permanently removed from our system.",
        },
        {
          question: "How do I update my profile information?",
          answer: "Log into your account and navigate to 'My Profile' or 'Profile Settings'. There you can update your personal information, contact details, and preferences.",
        },
      ],
    },
    {
      category: "Hotels & Accommodations",
      questions: [
        {
          question: "How are hotels rated on your platform?",
          answer: "Hotels are rated based on verified guest reviews. We use a 5-star rating system where guests rate their overall experience. All reviews are from confirmed bookings to ensure authenticity.",
        },
        {
          question: "Can I see photos of the hotel rooms?",
          answer: "Yes, each hotel listing includes multiple photos of the property, rooms, amenities, and surrounding areas. Click on any photo to view it in full size and browse through the complete gallery.",
        },
        {
          question: "What amenities are included?",
          answer: "Each hotel listing clearly displays all available amenities. Common amenities include WiFi, breakfast, parking, pool access, gym, and room service. Specific amenities vary by property and room type.",
        },
        {
          question: "Are the hotels verified?",
          answer: "Yes, all hotels on our platform are verified partners. We conduct quality checks and maintain ongoing relationships with our hotel partners to ensure they meet our standards.",
        },
      ],
    },
    {
      category: "Travel & Check-in",
      questions: [
        {
          question: "What time is check-in and check-out?",
          answer: "Standard check-in time is usually 2:00 PM and check-out is 11:00 AM, but this varies by hotel. Specific times are listed on each hotel's page. You can request early check-in or late check-out directly with the hotel, subject to availability.",
        },
        {
          question: "What do I need to bring for check-in?",
          answer: "You'll need a valid government-issued photo ID (passport, driver's license, or national ID card) and the credit card used for booking. Some hotels may also require a security deposit at check-in.",
        },
        {
          question: "Can I arrive late at night?",
          answer: "Most hotels have 24-hour reception, but it's best to inform the hotel if you'll be arriving late. You can find contact information in your booking confirmation email.",
        },
        {
          question: "What if I need to leave early?",
          answer: "If you need to check out earlier than planned, contact the hotel directly. Early checkout policies vary by property and booking type. Some reservations may be non-refundable for unused nights.",
        },
      ],
    },
    {
      category: "Support & Help",
      questions: [
        {
          question: "How can I contact customer support?",
          answer: "You can reach our support team via email at support@nonsatravels.com, call us at +260 970 462 777, or use the contact form on our Contact page. We're available Monday-Friday 8AM-6PM, and Saturday 9AM-4PM.",
        },
        {
          question: "What if I have an issue during my stay?",
          answer: "For immediate issues during your stay, contact the hotel directly. You can also reach out to our support team, and we'll help mediate any problems with the accommodation.",
        },
        {
          question: "How do I leave a review?",
          answer: "After your stay, you'll receive an email invitation to review your experience. You can also leave a review through the 'My Bookings' section. We encourage honest feedback to help other travelers.",
        },
        {
          question: "Do you offer travel insurance?",
          answer: "Currently, we don't provide travel insurance directly, but we recommend purchasing travel insurance from a third-party provider to protect your trip against unexpected events.",
        },
      ],
    },
  ];

  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  const filteredFAQs = faqs.map((category) => ({
    ...category,
    questions: category.questions.filter(
      (faq) =>
        faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
        faq.answer.toLowerCase().includes(searchTerm.toLowerCase())
    ),
  })).filter((category) => category.questions.length > 0);

  return (
    <div className="min-h-screen pt-20 md:pt-24">
      {/* Hero Section */}
      <div className="bg-primary text-white py-16 md:py-20 px-6 md:px-12 lg:px-20 xl:px-32">
        <div className="max-w-4xl mx-auto text-center">
          <div className="mb-6">
            <FontAwesomeIcon icon={faQuestionCircle} className="text-6xl md:text-7xl opacity-90" />
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold mb-4">
            {t('faq.title')}
          </h1>
          <p className="text-lg md:text-xl text-white/90">
            {t('faq.subtitle')}
          </p>
        </div>
      </div>

      {/* Search Section */}
      <div className="px-6 md:px-12 lg:px-20 xl:px-32 -mt-10 relative z-10">
        <div className="max-w-3xl mx-auto">
          <div className="relative bg-white rounded-xl shadow-xl p-2">
            <FontAwesomeIcon
              icon={faSearch}
              className="absolute left-6 top-1/2 transform -translate-y-1/2 text-gray-400 text-xl"
            />
            <input
              type="text"
              placeholder="Search for answers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-14 pr-6 py-4 rounded-lg border-2 border-transparent focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-base md:text-lg"
            />
          </div>
        </div>
      </div>

      {/* FAQ Content */}
      <div className="px-6 md:px-12 lg:px-20 xl:px-32 py-12 md:py-16">
        <div className="max-w-4xl mx-auto">
          {filteredFAQs.length > 0 ? (
            filteredFAQs.map((category, categoryIndex) => (
              <div key={categoryIndex} className="mb-12">
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                  <span className="w-2 h-8 bg-accent rounded-full"></span>
                  {category.category}
                </h2>
                <div className="space-y-4">
                  {category.questions.map((faq, index) => {
                    const globalIndex = `${categoryIndex}-${index}`;
                    const isOpen = openIndex === globalIndex;

                    return (
                      <div
                        key={index}
                        className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden"
                      >
                        <button
                          onClick={() => toggleFAQ(globalIndex)}
                          className="w-full px-6 py-5 flex items-center justify-between text-left hover:bg-gray-50 transition-colors"
                        >
                          <span className="font-semibold text-gray-900 pr-4">
                            {faq.question}
                          </span>
                          <FontAwesomeIcon
                            icon={isOpen ? faChevronUp : faChevronDown}
                            className={`text-primary text-lg flex-shrink-0 transition-transform ${
                              isOpen ? "transform rotate-180" : ""
                            }`}
                          />
                        </button>
                        <div
                          className={`transition-all duration-300 ease-in-out ${
                            isOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
                          } overflow-hidden`}
                        >
                          <div className="px-6 pb-5 text-gray-600 leading-relaxed">
                            {faq.answer}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">
                No questions found matching "{searchTerm}". Try a different search term.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Contact CTA */}
      <div className="px-6 md:px-12 lg:px-20 xl:px-32 py-12 md:py-16 bg-gray-50">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Still Have Questions?
          </h2>
          <p className="text-gray-600 text-lg mb-8">
            Can't find what you're looking for? Our support team is here to help!
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/contact"
              className="inline-block bg-primary text-white font-bold px-8 py-4 rounded-lg hover:bg-accent transition-all duration-300 hover:scale-105"
            >
              Contact Support
            </a>
            <a
              href="mailto:support@nonsatravels.com"
              className="inline-block bg-white border-2 border-primary text-primary font-bold px-8 py-4 rounded-lg hover:bg-primary hover:text-white transition-all duration-300 hover:scale-105"
            >
              Email Us
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FAQ;
