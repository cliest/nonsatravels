import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faShieldAlt } from "@fortawesome/free-solid-svg-icons";

const Privacy = () => {
  return (
    <div className="min-h-screen pt-20 md:pt-24">
      {/* Hero Section */}
      <div className="bg-primary text-white py-16 md:py-20 px-6 md:px-12 lg:px-20 xl:px-32">
        <div className="max-w-4xl mx-auto text-center">
          <div className="mb-6">
            <FontAwesomeIcon icon={faShieldAlt} className="text-6xl md:text-7xl opacity-90" />
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold mb-4">
            Privacy Policy
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
                Introduction
              </h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                At Nonsa Travels, we are committed to protecting your privacy and ensuring the security of your personal information. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our platform.
              </p>
              <p className="text-gray-700 leading-relaxed">
                By using our Service, you consent to the data practices described in this policy. If you do not agree with this policy, please do not use our Service.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
                1. Information We Collect
              </h2>
              
              <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-6">
                Personal Information
              </h3>
              <p className="text-gray-700 leading-relaxed mb-4">
                We collect information that you provide directly to us, including:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4 mb-4">
                <li>Name, email address, and phone number</li>
                <li>Account credentials (username and password)</li>
                <li>Payment information (credit card details, billing address)</li>
                <li>Booking details and travel preferences</li>
                <li>Profile information and preferences</li>
                <li>Communications with our customer support</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-6">
                Automatically Collected Information
              </h3>
              <p className="text-gray-700 leading-relaxed mb-4">
                When you use our Service, we automatically collect certain information, including:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4 mb-4">
                <li>IP address and device information</li>
                <li>Browser type and version</li>
                <li>Pages visited and time spent on pages</li>
                <li>Referring website addresses</li>
                <li>Cookies and similar tracking technologies</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
                2. How We Use Your Information
              </h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                We use the information we collect for various purposes, including:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4 mb-4">
                <li>Processing and managing your bookings</li>
                <li>Providing customer service and support</li>
                <li>Sending booking confirmations and updates</li>
                <li>Processing payments and preventing fraud</li>
                <li>Personalizing your experience and recommendations</li>
                <li>Sending marketing communications (with your consent)</li>
                <li>Analyzing usage patterns to improve our Service</li>
                <li>Complying with legal obligations</li>
                <li>Protecting against security threats and abuse</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
                3. How We Share Your Information
              </h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                We may share your information in the following circumstances:
              </p>
              
              <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-6">
                With Accommodation Providers
              </h3>
              <p className="text-gray-700 leading-relaxed mb-4">
                When you make a booking, we share necessary information with the hotel or accommodation provider to facilitate your reservation.
              </p>

              <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-6">
                With Service Providers
              </h3>
              <p className="text-gray-700 leading-relaxed mb-4">
                We work with third-party service providers who assist us with payment processing, email delivery, customer support, analytics, and other business operations. These providers are contractually obligated to protect your information.
              </p>

              <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-6">
                For Legal Reasons
              </h3>
              <p className="text-gray-700 leading-relaxed mb-4">
                We may disclose your information if required by law or in response to valid requests by public authorities, such as court orders or government investigations.
              </p>

              <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-6">
                Business Transfers
              </h3>
              <p className="text-gray-700 leading-relaxed mb-4">
                In the event of a merger, acquisition, or sale of assets, your information may be transferred to the acquiring entity.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
                4. Cookies and Tracking Technologies
              </h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                We use cookies and similar tracking technologies to enhance your experience. Cookies are small data files stored on your device that help us:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4 mb-4">
                <li>Remember your preferences and settings</li>
                <li>Understand how you use our Service</li>
                <li>Improve website performance and functionality</li>
                <li>Deliver personalized content and advertisements</li>
              </ul>
              <p className="text-gray-700 leading-relaxed">
                You can control cookie settings through your browser preferences. Note that disabling cookies may affect the functionality of our Service.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
                5. Data Security
              </h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                We implement appropriate technical and organizational security measures to protect your personal information, including:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4 mb-4">
                <li>Encryption of sensitive data in transit and at rest</li>
                <li>Secure servers and data centers</li>
                <li>Regular security audits and assessments</li>
                <li>Access controls and authentication mechanisms</li>
                <li>Employee training on data protection</li>
              </ul>
              <p className="text-gray-700 leading-relaxed">
                However, no method of transmission over the Internet is 100% secure. While we strive to protect your information, we cannot guarantee absolute security.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
                6. Your Privacy Rights
              </h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                Depending on your location, you may have the following rights regarding your personal information:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4 mb-4">
                <li><strong>Access:</strong> Request a copy of your personal data</li>
                <li><strong>Correction:</strong> Update or correct inaccurate information</li>
                <li><strong>Deletion:</strong> Request deletion of your personal data</li>
                <li><strong>Portability:</strong> Receive your data in a portable format</li>
                <li><strong>Objection:</strong> Object to certain processing of your data</li>
                <li><strong>Withdrawal of Consent:</strong> Withdraw consent for data processing</li>
              </ul>
              <p className="text-gray-700 leading-relaxed">
                To exercise these rights, please contact us at privacy@nonsatravels.com.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
                7. Data Retention
              </h2>
              <p className="text-gray-700 leading-relaxed">
                We retain your personal information for as long as necessary to fulfill the purposes outlined in this Privacy Policy, unless a longer retention period is required by law. When we no longer need your information, we will securely delete or anonymize it.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
                8. Children's Privacy
              </h2>
              <p className="text-gray-700 leading-relaxed">
                Our Service is not intended for individuals under the age of 18. We do not knowingly collect personal information from children. If you believe we have collected information from a child, please contact us immediately so we can delete it.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
                9. International Data Transfers
              </h2>
              <p className="text-gray-700 leading-relaxed">
                Your information may be transferred to and processed in countries other than your country of residence. We ensure that appropriate safeguards are in place to protect your information in accordance with this Privacy Policy.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
                10. Third-Party Links
              </h2>
              <p className="text-gray-700 leading-relaxed">
                Our Service may contain links to third-party websites. We are not responsible for the privacy practices of these external sites. We encourage you to review the privacy policies of any third-party sites you visit.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
                11. Marketing Communications
              </h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                With your consent, we may send you promotional emails about special offers, new features, and other updates. You can opt out of marketing communications at any time by:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4 mb-4">
                <li>Clicking the "unsubscribe" link in our emails</li>
                <li>Updating your preferences in your account settings</li>
                <li>Contacting us at marketing@nonsatravels.com</li>
              </ul>
              <p className="text-gray-700 leading-relaxed">
                Note that you will still receive transactional emails related to your bookings.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
                12. Changes to This Privacy Policy
              </h2>
              <p className="text-gray-700 leading-relaxed">
                We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new policy on this page and updating the "Last Updated" date. We encourage you to review this policy periodically for any changes.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
                13. Contact Us
              </h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                If you have any questions or concerns about this Privacy Policy or our data practices, please contact us:
              </p>
              <div className="bg-gray-50 p-6 rounded-lg">
                <p className="text-gray-700 mb-2">
                  <strong>Email:</strong> privacy@nonsatravels.com
                </p>
                <p className="text-gray-700 mb-2">
                  <strong>Phone:</strong> +260 211 234 567
                </p>
                <p className="text-gray-700">
                  <strong>Address:</strong> Cairo Road, City Centre, Lusaka, Zambia
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
            Your Privacy Matters
          </h2>
          <p className="text-lg text-white/90 mb-6">
            Have questions about how we protect your data? Contact our privacy team anytime.
          </p>
          <a
            href="/contact"
            className="inline-block bg-white text-primary font-bold px-8 py-4 rounded-lg hover:bg-accent hover:text-white transition-all duration-300 hover:scale-105"
          >
            Contact Us
          </a>
        </div>
      </div>
    </div>
  );
};

export default Privacy;
