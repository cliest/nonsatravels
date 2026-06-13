import React from "react";
import { Link } from "react-router-dom";
import { assets } from "../assets/assets";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faFacebook,
  faInstagram,
  faLinkedin,
  faTwitter,
  faWhatsapp,
} from "@fortawesome/free-brands-svg-icons";
import {
  faEnvelope,
  faPhone,
  faLocationDot,
} from "@fortawesome/free-solid-svg-icons";
import { useTranslation } from "react-i18next";

const Footer = () => {
  const { t } = useTranslation();

  return (
    <footer className="px-4 sm:px-6 md:px-12 lg:px-20 xl:px-32 w-full bg-gray-50">
      <div className="flex flex-col lg:flex-row items-start justify-between gap-8 md:gap-12 py-12 md:py-16 border-t-2 border-gray-200">
        {/* Company Info */}
        <div className="w-full lg:max-w-md">
          <Link to="/">
            <img src={assets.logo} alt="Nonsa Travels Logo" className="h-12 md:h-14 mb-6 hover:opacity-80 transition-opacity" />
          </Link>

          <p className="text-sm md:text-base text-gray-600 leading-relaxed">
            {t('footer.description')}
          </p>

          <div className="flex items-center gap-3 mt-6">
            <a href="https://www.facebook.com/nonsatravels" target="_blank" rel="noopener noreferrer"
              className="w-10 h-10 flex items-center justify-center bg-primary/10 rounded-full text-primary hover:bg-accent hover:text-white transition-all duration-300 hover:scale-110"
              aria-label="Visit our Facebook page">
              <FontAwesomeIcon icon={faFacebook} size="lg" />
            </a>
            <a href="https://www.instagram.com/nonsatravels" target="_blank" rel="noopener noreferrer"
              className="w-10 h-10 flex items-center justify-center bg-primary/10 rounded-full text-primary hover:bg-accent hover:text-white transition-all duration-300 hover:scale-110"
              aria-label="Visit our Instagram page">
              <FontAwesomeIcon icon={faInstagram} size="lg" />
            </a>
            <a href="https://twitter.com/nonsatravels" target="_blank" rel="noopener noreferrer"
              className="w-10 h-10 flex items-center justify-center bg-primary/10 rounded-full text-primary hover:bg-accent hover:text-white transition-all duration-300 hover:scale-110"
              aria-label="Visit our Twitter page">
              <FontAwesomeIcon icon={faTwitter} size="lg" />
            </a>
            <a href="https://www.linkedin.com/company/nonsatravels" target="_blank" rel="noopener noreferrer"
              className="w-10 h-10 flex items-center justify-center bg-primary/10 rounded-full text-primary hover:bg-accent hover:text-white transition-all duration-300 hover:scale-110"
              aria-label="Visit our LinkedIn page">
              <FontAwesomeIcon icon={faLinkedin} size="lg" />
            </a>
          </div>
        </div>

        {/* Footer Links */}
        <div className="w-full grid grid-cols-2 md:grid-cols-3 gap-8 md:gap-12">
          <div>
            <h2 className="font-bold text-base md:text-lg text-primary mb-4 md:mb-6">{t('footer.quickLinks')}</h2>
            <ul className="text-sm md:text-base text-gray-600 space-y-3 list-none">
              <li><Link to="/" className="hover:text-accent transition-colors duration-300 hover:translate-x-1 inline-block">{t('nav.home')}</Link></li>
              <li><Link to="/hotels" className="hover:text-accent transition-colors duration-300 hover:translate-x-1 inline-block">{t('nav.hotels')}</Link></li>
              <li><Link to="/about" className="hover:text-accent transition-colors duration-300 hover:translate-x-1 inline-block">{t('nav.about')}</Link></li>
              <li><Link to="/favorites" className="hover:text-accent transition-colors duration-300 hover:translate-x-1 inline-block">{t('nav.favorites')}</Link></li>
              <li><Link to="/my-bookings" className="hover:text-accent transition-colors duration-300 hover:translate-x-1 inline-block">{t('nav.myBookings')}</Link></li>
              <li><Link to="/blog" className="hover:text-accent transition-colors duration-300 hover:translate-x-1 inline-block">Blog</Link></li>
            </ul>
          </div>

          <div>
            <h2 className="font-bold text-base md:text-lg text-primary mb-4 md:mb-6">{t('footer.support')}</h2>
            <ul className="text-sm md:text-base text-gray-600 space-y-3 list-none">
              <li><Link to="/contact" className="hover:text-accent transition-colors duration-300 hover:translate-x-1 inline-block">{t('nav.contact')}</Link></li>
              <li><Link to="/faq" className="hover:text-accent transition-colors duration-300 hover:translate-x-1 inline-block">{t('footer.faq')}</Link></li>
              <li><a href="mailto:support@nonsatravels.com" className="hover:text-accent transition-colors duration-300 hover:translate-x-1 inline-block">{t('footer.emailSupport')}</a></li>
              <li><Link to="/terms" className="hover:text-accent transition-colors duration-300 hover:translate-x-1 inline-block">{t('footer.terms')}</Link></li>
              <li><Link to="/privacy" className="hover:text-accent transition-colors duration-300 hover:translate-x-1 inline-block">{t('footer.privacy')}</Link></li>
            </ul>
          </div>

          <div className="col-span-2 md:col-span-1">
            <h2 className="font-bold text-base md:text-lg text-primary mb-4 md:mb-6">{t('footer.contact')}</h2>
            <ul className="text-sm md:text-base text-gray-600 space-y-4 list-none">
              <li className="flex items-start gap-3">
                <FontAwesomeIcon icon={faEnvelope} className="text-accent mt-1 w-4 shrink-0" />
                <a href="mailto:info@nonsatravels.com" className="hover:text-accent transition-colors">info@nonsatravels.com</a>
              </li>
              <li className="flex items-start gap-3">
                <FontAwesomeIcon icon={faPhone} className="text-accent mt-1 w-4 shrink-0" />
                <a href="tel:+260970462777" className="hover:text-accent transition-colors">+260 970 462 777</a>
              </li>
              <li className="flex items-start gap-3">
                <FontAwesomeIcon icon={faWhatsapp} className="text-accent mt-1 w-4 shrink-0" />
                <a href="https://wa.me/260970462777" target="_blank" rel="noopener noreferrer" className="hover:text-accent transition-colors">WhatsApp</a>
              </li>
              <li className="flex items-start gap-3">
                <FontAwesomeIcon icon={faLocationDot} className="text-accent mt-1 w-4 shrink-0" />
                <span>{t('footer.location')}</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Copyright */}
      <div className="py-6 border-t border-gray-200">
        <p className="text-center text-xs md:text-sm text-gray-500">
          {t('footer.copyright', { year: new Date().getFullYear() })}
        </p>
      </div>
    </footer>
  );
};

export default Footer;
