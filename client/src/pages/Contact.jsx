import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEnvelope,
  faPhone,
  faMapMarkerAlt,
  faClock,
  faPaperPlane,
} from "@fortawesome/free-solid-svg-icons";
import {
  faFacebook,
  faInstagram,
  faTwitter,
  faLinkedin,
} from "@fortawesome/free-brands-svg-icons";
import { toast } from "../utils/toast";
import { contactAPI } from "../services/api";
import { useTranslation } from "react-i18next";

const Contact = () => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await contactAPI.sendMessage(formData);
      
      if (response.data.success) {
        toast.success(response.data.message || "Message sent successfully! We'll get back to you soon.");
        setFormData({ name: "", email: "", subject: "", message: "" });
      } else {
        toast.error(response.data.message || "Failed to send message. Please try again.");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to send message. Please try again later.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const contactInfo = [
    {
      icon: faEnvelope,
      title: "Email Us",
      details: ["info@nonsatravels.com", "support@nonsatravels.com"],
      color: "text-blue-500",
      bgColor: "bg-blue-50",
    },
    {
      icon: faPhone,
      title: "Call Us",
      details: ["+260 970 462 777"],
      color: "text-green-500",
      bgColor: "bg-green-50",
    },
    {
      icon: faMapMarkerAlt,
      title: "Visit Us",
      details: ["Kwacha Street", "Chingola, Zambia"],
      color: "text-red-500",
      bgColor: "bg-red-50",
    },
    {
      icon: faClock,
      title: "Working Hours",
      details: ["Monday - Friday: 8:00 AM - 6:00 PM", "Saturday: 9:00 AM - 4:00 PM"],
      color: "text-purple-500",
      bgColor: "bg-purple-50",
    },
  ];

  return (
    <div className="min-h-screen pt-20 md:pt-24">
      {/* Hero Section */}
      <div className="bg-primary text-white py-16 md:py-20 px-6 md:px-12 lg:px-20 xl:px-32">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold mb-4">
            {t('contact.title')}
          </h1>
          <p className="text-lg md:text-xl text-white/90">
            {t('contact.subtitle')}
          </p>
        </div>
      </div>

      {/* Contact Info Cards */}
      <div className="px-6 md:px-12 lg:px-20 xl:px-32 py-12 md:py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {contactInfo.map((info, index) => (
            <div
              key={index}
              className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
            >
              <div className={`w-14 h-14 ${info.bgColor} rounded-xl flex items-center justify-center mb-4`}>
                <FontAwesomeIcon icon={info.icon} className={`${info.color} text-2xl`} />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-3">{info.title}</h3>
              {info.details.map((detail, idx) => (
                <p key={idx} className="text-gray-600 text-sm mb-1">
                  {detail}
                </p>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Contact Form & Map Section */}
      <div className="px-6 md:px-12 lg:px-20 xl:px-32 py-12 md:py-16">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12">
          {/* Contact Form */}
          <div>
            <div className="mb-8">
              <span className="inline-block px-4 py-2 bg-accent/10 text-accent font-semibold rounded-full text-sm mb-4">
                Contact Form
              </span>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Send Us a Message
              </h2>
              <p className="text-gray-600 text-lg">
                Fill out the form below and our team will get back to you within 24 hours.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-2">
                  {t('contact.name')} *
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                  placeholder="John Doe"
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                  {t('contact.email')} *
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                  placeholder="john@example.com"
                />
              </div>

              <div>
                <label htmlFor="subject" className="block text-sm font-semibold text-gray-700 mb-2">
                  {t('contact.subject')} *
                </label>
                <input
                  type="text"
                  id="subject"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                  placeholder="How can we help you?"
                />
              </div>

              <div>
                <label htmlFor="message" className="block text-sm font-semibold text-gray-700 mb-2">
                  {t('contact.message')} *
                </label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  rows="5"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all resize-none"
                  placeholder="Tell us more about your inquiry..."
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-primary text-white font-bold py-4 px-6 rounded-lg hover:bg-accent transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  "Sending..."
                ) : (
                  <>
                    <FontAwesomeIcon icon={faPaperPlane} />
                    Send Message
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Map & Social */}
          <div className="space-y-8">
            <div>
              <div className="mb-6">
                <span className="inline-block px-4 py-2 bg-primary/10 text-primary font-semibold rounded-full text-sm mb-4">
                  Find Us
                </span>
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                  Our Location
                </h2>
              </div>
              
              <div className="bg-gray-200 rounded-xl overflow-hidden h-64 md:h-80">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d246484.60396429405!2d28.107826549999996!3d-15.3875259!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x1940f4a7a178e705%3A0x20d105bc83a4b8c7!2sLusaka%2C%20Zambia!5e0!3m2!1sen!2s!4v1234567890123!5m2!1sen!2s"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen=""
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Nonsa Travels Location"
                />
              </div>
            </div>

            <div className="bg-primary text-white p-8 rounded-xl">
              <h3 className="text-2xl font-bold mb-4">Connect With Us</h3>
              <p className="text-white/90 mb-6">
                Follow us on social media for the latest updates, travel tips, and exclusive offers!
              </p>
              <div className="flex gap-3">
                <a
                  href="https://www.facebook.com/nonsatravels"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/30 transition-all hover:scale-110"
                  aria-label="Facebook"
                >
                  <FontAwesomeIcon icon={faFacebook} className="text-xl" />
                </a>
                <a
                  href="https://www.instagram.com/nonsatravels"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/30 transition-all hover:scale-110"
                  aria-label="Instagram"
                >
                  <FontAwesomeIcon icon={faInstagram} className="text-xl" />
                </a>
                <a
                  href="https://twitter.com/nonsatravels"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/30 transition-all hover:scale-110"
                  aria-label="Twitter"
                >
                  <FontAwesomeIcon icon={faTwitter} className="text-xl" />
                </a>
                <a
                  href="https://www.linkedin.com/company/nonsatravels"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/30 transition-all hover:scale-110"
                  aria-label="LinkedIn"
                >
                  <FontAwesomeIcon icon={faLinkedin} className="text-xl" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* FAQ Quick Links */}
      <div className="px-6 md:px-12 lg:px-20 xl:px-32 py-12 md:py-16 bg-gray-50">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Looking for Quick Answers?
          </h2>
          <p className="text-gray-600 text-lg mb-8">
            Check out our FAQ page for answers to common questions.
          </p>
          <a
            href="/faq"
            className="inline-block bg-primary text-white font-bold px-8 py-4 rounded-lg hover:bg-accent transition-all duration-300 hover:scale-105"
          >
            Visit FAQ Page
          </a>
        </div>
      </div>
    </div>
  );
};

export default Contact;
