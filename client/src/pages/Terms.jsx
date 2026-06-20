import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFileContract } from "@fortawesome/free-solid-svg-icons";

const Terms = () => {
  return (
    <div className="min-h-screen pt-20 md:pt-24">
      {/* Hero Section */}
      <div className="bg-primary text-white py-16 md:py-20 px-6 md:px-12 lg:px-20 xl:px-32">
        <div className="max-w-4xl mx-auto text-center">
          <div className="mb-6">
            <FontAwesomeIcon icon={faFileContract} className="text-6xl md:text-7xl opacity-90" />
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold mb-4">
            Terms of Service
          </h1>
          <p className="text-lg md:text-xl text-white/90">
            Last updated: December 17, 2025
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="px-6 md:px-12 lg:px-20 xl:px-32 py-12 md:py-16">
        <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-lg p-8 md:p-12">
          <div className="prose prose-lg max-w-none">
            <section className="mb-8">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
                1. Acceptance of Terms
              </h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                By accessing and using the Nonsa Travels platform ("Service"), you accept and agree to be bound by the terms and provisions of this agreement. If you do not agree to these Terms of Service, please do not use our Service.
              </p>
              <p className="text-gray-700 leading-relaxed">
                We reserve the right to modify these terms at any time. Your continued use of the Service following any changes indicates your acceptance of the new terms.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
                2. Use of Service
              </h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                Nonsa Travels provides an online platform for booking hotel accommodations. You agree to use the Service only for lawful purposes and in accordance with these Terms.
              </p>
              <p className="text-gray-700 leading-relaxed mb-3">
                You agree NOT to:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4 mb-4">
                <li>Use the Service for any illegal or unauthorized purpose</li>
                <li>Violate any laws in your jurisdiction</li>
                <li>Infringe upon or violate our intellectual property rights</li>
                <li>Submit false or misleading information</li>
                <li>Upload viruses or malicious code</li>
                <li>Spam, phish, or otherwise harm other users</li>
                <li>Use automated systems to access the Service without permission</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
                3. Account Registration
              </h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                To make bookings, you must create an account. You are responsible for:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4 mb-4">
                <li>Maintaining the confidentiality of your account credentials</li>
                <li>All activities that occur under your account</li>
                <li>Providing accurate and complete information</li>
                <li>Updating your information to keep it current</li>
              </ul>
              <p className="text-gray-700 leading-relaxed">
                You must notify us immediately of any unauthorized use of your account. We are not liable for any loss or damage arising from your failure to protect your account information.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
                4. Bookings and Reservations
              </h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                When you make a booking through our platform:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4 mb-4">
                <li>You enter into a direct contract with the hotel or accommodation provider</li>
                <li>Nonsa Travels acts as an intermediary to facilitate the booking</li>
                <li>All bookings are subject to availability and confirmation</li>
                <li>Prices are subject to change until payment is confirmed</li>
                <li>You must be 18 years or older to make a booking</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
                5. Payment Terms
              </h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                Payment for bookings must be made through our secure payment system. By providing payment information, you represent that:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4 mb-4">
                <li>You are authorized to use the payment method provided</li>
                <li>All payment information is accurate and current</li>
                <li>You will pay all charges incurred</li>
              </ul>
              <p className="text-gray-700 leading-relaxed">
                We accept credit cards, debit cards, and mobile money (MTN, Airtel Money, Zamtel Kwacha). Cash payments are also accepted directly at the hotel. All prices are displayed in the local currency unless otherwise specified. Additional taxes or fees may apply depending on the destination.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
                6. Cancellations and Refunds
              </h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                Cancellation and refund policies vary by hotel and booking type. These policies are clearly displayed during the booking process. Please review them carefully before confirming your reservation.
              </p>
              <p className="text-gray-700 leading-relaxed mb-4">
                Some bookings may be non-refundable. Cancellation fees may apply based on the hotel's policy and timing of cancellation. Refunds, when applicable, will be processed to the original payment method within 7-14 business days.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
                7. User Content and Reviews
              </h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                You may post reviews and ratings of accommodations. By submitting content, you grant us a non-exclusive, worldwide, royalty-free license to use, reproduce, and display your content.
              </p>
              <p className="text-gray-700 leading-relaxed mb-4">
                You agree that your reviews will be honest, accurate, and based on your actual experience. We reserve the right to remove content that:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                <li>Contains offensive, defamatory, or inappropriate language</li>
                <li>Violates intellectual property rights</li>
                <li>Is fraudulent or misleading</li>
                <li>Contains personal information about others</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
                8. Intellectual Property
              </h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                All content on the Nonsa Travels platform, including text, graphics, logos, images, and software, is the property of Nonsa Travels or its content suppliers and is protected by copyright, trademark, and other intellectual property laws.
              </p>
              <p className="text-gray-700 leading-relaxed">
                You may not reproduce, distribute, modify, or create derivative works from our content without express written permission.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
                9. Limitation of Liability
              </h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                Nonsa Travels acts as an intermediary between you and accommodation providers. We are not responsible for:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4 mb-4">
                <li>The quality, safety, or legality of accommodations listed</li>
                <li>The accuracy of hotel descriptions or amenities</li>
                <li>Actions or omissions of accommodation providers</li>
                <li>Personal injury, property damage, or other losses during your stay</li>
              </ul>
              <p className="text-gray-700 leading-relaxed">
                To the maximum extent permitted by law, Nonsa Travels shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising from your use of the Service.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
                10. Indemnification
              </h2>
              <p className="text-gray-700 leading-relaxed">
                You agree to indemnify and hold harmless Nonsa Travels, its officers, directors, employees, and agents from any claims, damages, losses, liabilities, and expenses arising from your use of the Service, your violation of these Terms, or your violation of any rights of another party.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
                11. Dispute Resolution
              </h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                Any disputes arising from these Terms or your use of the Service will be governed by the laws of Zambia. You agree to submit to the exclusive jurisdiction of the courts located in Lusaka, Zambia.
              </p>
              <p className="text-gray-700 leading-relaxed">
                We encourage you to contact us first to resolve any disputes informally before pursuing formal legal action.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
                12. Termination
              </h2>
              <p className="text-gray-700 leading-relaxed">
                We reserve the right to suspend or terminate your account and access to the Service at our sole discretion, without notice, for conduct that we believe violates these Terms or is harmful to other users, us, or third parties, or for any other reason.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
                13. Contact Information
              </h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                If you have any questions about these Terms of Service, please contact us:
              </p>
              <div className="bg-gray-50 p-6 rounded-lg">
                <p className="text-gray-700 mb-2">
                  <strong>Email:</strong> legal@nonsatravels.com
                </p>
                <p className="text-gray-700 mb-2">
                  <strong>Phone:</strong> +260 211 234 567
                </p>
                <p className="text-gray-700">
                  <strong>Address:</strong> Kwacha Street, Chingola, Zambia
                </p>
              </div>
            </section>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="px-6 md:px-12 lg:px-20 xl:px-32 pb-12 md:pb-16">
        <div className="max-w-4xl mx-auto text-center bg-primary text-white p-8 md:p-12 rounded-2xl">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">
            Ready to Start Booking?
          </h2>
          <p className="text-lg text-white/90 mb-6">
            Explore our amazing hotel deals and start planning your next adventure!
          </p>
          <a
            href="/hotels"
            className="inline-block bg-white text-primary font-bold px-8 py-4 rounded-lg hover:bg-accent hover:text-white transition-all duration-300 hover:scale-105"
          >
            Browse Hotels
          </a>
        </div>
      </div>
    </div>
  );
};

export default Terms;
