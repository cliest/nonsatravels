import React, { useState } from "react";
import { assets } from "../assets/assets";
import { contactAPI } from "../services/api";
import { toast } from "../utils/toast";
import { useTranslation } from "react-i18next";

const Newsletter = () => {
  const { t } = useTranslation();
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email) {
      toast.error("Please enter your email address");
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error("Please enter a valid email address");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await contactAPI.subscribeNewsletter(email);
      
      if (response.data.success) {
        toast.success(response.data.message || "Successfully subscribed to newsletter!");
        setEmail("");
      } else {
        toast.error(response.data.message || "Failed to subscribe. Please try again.");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to subscribe. Please try again later.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col items-center max-w-5xl lg:w-full rounded-2xl px-6 md:px-8 py-12 md:py-16 lg:py-20 mx-4 lg:mx-auto my-16 md:my-20 lg:my-24 bg-white text-primary shadow-2xl">
      <div className="flex flex-col justify-center items-center text-center">
        <h1 className="text-4xl md:text-[40px] lg:text-5xl font-semibold text-primary">
          {t('footer.newsletter')}
        </h1>

        <p className="text-sm md:text-base text-gray-500/90 mt-3 md:mt-4 max-w-xl px-4">
          {t('footer.newsletterText')}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col md:flex-row items-center justify-center gap-4 mt-8 md:mt-10 w-full max-w-2xl px-4">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={isSubmitting}
          className="bg-gray-50 px-4 py-2.5 text-primary rounded outline-none max-w-66 w-full disabled:opacity-50"
          placeholder={t('footer.enterEmail')}
        />

        <button 
          type="submit"
          disabled={isSubmitting}
          className="flex text-white items-center justify-center gap-2 group bg-primary hover:bg-accent px-4 md:px-7 py-2.5 rounded active:scale-95 transition-all duration-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? t('contact.sending') : t('footer.subscribe')}
          <img
            src={assets.arrowIcon}
            alt="arrow"
            className="w-3.5 invert group-hover:translate-x-1 transition-all"
          />
        </button>
      </form>

      <p className="text-gray-500 mt-6 text-xs text-center">
        By subscribing, you agree to our Privacy Policy and consent to receive
        updates.
      </p>
    </div>
  );
};

export default Newsletter;
