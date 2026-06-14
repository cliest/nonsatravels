import React, { useState, useEffect } from "react";
import { assets } from "../assets/assets";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faAward,
  faGlobe,
  faHeart,
  faUsers,
  faShieldAlt,
  faHeadset,
  faMapMarkedAlt,
  faStar,
} from "@fortawesome/free-solid-svg-icons";
import { statsAPI } from "../services/api";
import { SkeletonDetailPage } from "../components/Skeleton";
import { useTranslation } from "react-i18next";

const About = () => {
  const { t } = useTranslation();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const response = await statsAPI.getStats();
      if (response.data.success) {
        setStats(response.data.data);
      }
    } catch (error) {
      // Set default values if API fails
      setStats({
        totalHotels: 500,
        totalBookings: 10000,
        totalDestinations: 50,
        yearsOfExperience: 15,
      });
    } finally {
      setLoading(false);
    }
  };

  const statsData = stats ? [
    { 
      icon: faUsers, 
      value: `${(stats.totalBookings / 1000).toFixed(1)}K+`, 
      label: "Happy Travelers" 
    },
    { 
      icon: faGlobe, 
      value: `${stats.totalDestinations}+`, 
      label: "Destinations" 
    },
    { 
      icon: faHeart, 
      value: `${stats.totalHotels}+`, 
      label: "Partner Hotels" 
    },
    { 
      icon: faAward, 
      value: `${stats.yearsOfExperience}+`, 
      label: "Years Experience" 
    },
  ] : [];

  const values = [
    {
      icon: faHeart,
      title: "Customer First",
      description:
        "Your satisfaction is our priority. We go above and beyond to ensure every journey exceeds expectations.",
      color: "text-red-500",
      bgColor: "bg-red-50",
    },
    {
      icon: faStar,
      title: "Authenticity",
      description:
        "We believe in genuine experiences. Every recommendation comes from real insights and honest reviews.",
      color: "text-yellow-500",
      bgColor: "bg-yellow-50",
    },
    {
      icon: faMapMarkedAlt,
      title: "Innovation",
      description:
        "We embrace technology to make travel planning seamless, efficient, and enjoyable for everyone.",
      color: "text-blue-500",
      bgColor: "bg-blue-50",
    },
    {
      icon: faGlobe,
      title: "Sustainability",
      description:
        "We're committed to responsible travel that respects local communities and preserves destinations.",
      color: "text-green-500",
      bgColor: "bg-green-50",
    },
  ];

  const features = [
    {
      icon: faShieldAlt,
      title: "Secure Booking",
      description: "Your data and payments are protected with industry-leading security.",
    },
    {
      icon: faHeadset,
      title: "24/7 Support",
      description: "Our dedicated team is always available to assist you.",
    },
    {
      icon: faAward,
      title: "Best Price Guarantee",
      description: "Find the best deals with our price match guarantee.",
    },
  ];

  if (loading) {
    return <SkeletonDetailPage />;
  }

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="relative bg-primary text-white py-24 md:py-32 px-6 md:px-12 lg:px-20 xl:px-32 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-72 h-72 bg-white rounded-full blur-3xl"></div>
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-accent rounded-full blur-3xl"></div>
        </div>
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold mb-6 leading-tight">
            About <span className="text-accent">Nonsa Travels</span>
          </h1>
          <p className="text-xl md:text-2xl text-white/95 leading-relaxed max-w-3xl mx-auto">
            We're more than a booking platform — we're your travel companion,
            dedicated to turning every trip into an unforgettable adventure.
          </p>
        </div>
      </div>

      {/* Mission Section */}
      <div className="py-20 md:py-24 px-6 md:px-12 lg:px-20 xl:px-32 bg-white">
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-12 lg:gap-16 items-center">
          <div className="order-2 md:order-1">
            <span className="inline-block px-4 py-2 bg-accent/10 text-accent font-semibold rounded-full text-sm mb-4">
              {t('about.mission')}
            </span>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 leading-tight">
              Making Travel Accessible & Memorable
            </h2>
            <p className="text-gray-600 text-lg leading-relaxed mb-6">
              At Nonsa Travels, we believe that travel should be accessible,
              enjoyable, and transformative. Our mission is to connect travelers
              with exceptional accommodations and experiences that create
              lasting memories.
            </p>
            <p className="text-gray-600 text-lg leading-relaxed mb-8">
              Whether you're planning a weekend getaway, a business trip, or the
              adventure of a lifetime, we provide the tools, insights, and
              support to make it happen seamlessly.
            </p>
            
            {/* Feature Pills */}
            <div className="grid sm:grid-cols-3 gap-4">
              {features.map((feature, index) => (
                <div key={index} className="flex flex-col items-center text-center p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors">
                  <FontAwesomeIcon
                    icon={feature.icon}
                    className="text-primary text-2xl mb-3"
                  />
                  <h4 className="font-bold text-gray-900 text-sm mb-1">
                    {feature.title}
                  </h4>
                  <p className="text-gray-600 text-xs leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
          <div className="order-1 md:order-2 relative">
            <div className="absolute -top-6 -left-6 w-full h-full bg-accent/10 rounded-2xl -z-10"></div>
            <img
              src="https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800&q=75"
              alt="Travel Experience"
              className="rounded-2xl shadow-2xl w-full h-[400px] md:h-[500px] object-cover transform hover:scale-[1.02] transition-transform duration-300"
            />
            <div className="absolute -bottom-6 -right-6 bg-white p-6 rounded-xl shadow-xl">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-accent rounded-full flex items-center justify-center">
                  <FontAwesomeIcon icon={faAward} className="text-white text-xl" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-primary">{stats?.yearsOfExperience || 15}+</p>
                  <p className="text-gray-600 text-sm">Years of Excellence</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="py-20 md:py-24 px-6 md:px-12 lg:px-20 xl:px-32 bg-slate-900">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <span className="inline-block px-4 py-2 bg-primary/10 text-primary font-semibold rounded-full text-sm mb-4">
              Our Impact
            </span>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Trusted by Thousands
            </h2>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              Our numbers speak for themselves. Join the community of satisfied travelers.
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
            {statsData.map((stat, index) => (
              <div
                key={index}
                className="group text-center p-8 bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2"
              >
                <div className="w-16 h-16 mx-auto mb-6 bg-primary rounded-2xl flex items-center justify-center transform group-hover:scale-110 transition-transform">
                  <FontAwesomeIcon
                    icon={stat.icon}
                    className="text-white text-2xl"
                  />
                </div>
                <p className="text-4xl md:text-5xl font-extrabold text-primary mb-3 bg-primary bg-clip-text text-transparent">
                  {stat.value}
                </p>
                <p className="text-gray-600 font-semibold text-sm md:text-base">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Values Section */}
      <div className="py-20 md:py-24 px-6 md:px-12 lg:px-20 xl:px-32 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <span className="inline-block px-4 py-2 bg-accent/10 text-accent font-semibold rounded-full text-sm mb-4">
              Our Values
            </span>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              What Drives Us Forward
            </h2>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              Our core values guide everything we do, ensuring exceptional service for every traveler.
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-8">
            {values.map((value, index) => (
              <div
                key={index}
                className="group p-8 border-2 border-gray-100 rounded-2xl hover:border-transparent hover:shadow-2xl transition-all duration-300 bg-white hover:bg-gray-50"
              >
                <div className={`w-14 h-14 ${value.bgColor} rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                  <FontAwesomeIcon
                    icon={value.icon}
                    className={`${value.color} text-2xl`}
                  />
                </div>
                <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
                  {value.title}
                </h3>
                <p className="text-gray-600 text-lg leading-relaxed">
                  {value.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Story Section */}
      <div className="py-20 md:py-24 px-6 md:px-12 lg:px-20 xl:px-32 bg-slate-900">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <span className="inline-block px-4 py-2 bg-primary/10 text-primary font-semibold rounded-full text-sm mb-4">
              Our Journey
            </span>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              The Nonsa Travels Story
            </h2>
          </div>
          <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-12 space-y-8">
            <div className="space-y-6 text-gray-600 text-lg leading-relaxed">
              <p className="text-xl md:text-2xl font-semibold text-gray-900 leading-relaxed">
                Founded in 2010, Nonsa Travels began with a simple vision: to make
                quality travel experiences accessible to everyone.
              </p>
              <p>
                What started as a small team of passionate travelers has grown into a trusted
                platform serving thousands of customers worldwide. Our founders, avid travelers
                themselves, understood the frustrations of finding reliable accommodations and
                authentic local experiences.
              </p>
              <p>
                Over the years, we've built strong partnerships with hotels,
                resorts, and local businesses across the globe. These
                relationships allow us to offer exclusive deals, insider
                knowledge, and personalized recommendations you won't find
                anywhere else.
              </p>
              <p>
                Today, we continue to innovate and improve, always putting our
                travelers first. From our easy-to-use booking platform to our
                24/7 customer support, every aspect of Nonsa Travels is designed
                with your journey in mind.
              </p>
            </div>
            
            {/* Timeline Highlights */}
            <div className="grid md:grid-cols-3 gap-6 pt-8 border-t border-gray-200">
              <div className="text-center">
                <p className="text-3xl font-bold text-accent mb-2">2010</p>
                <p className="text-gray-600 font-medium">Company Founded</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-accent mb-2">2015</p>
                <p className="text-gray-600 font-medium">Reached 1000+ Hotels</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-accent mb-2">{new Date().getFullYear()}</p>
                <p className="text-gray-600 font-medium">{stats?.totalBookings ? `${(stats.totalBookings / 1000).toFixed(0)}K+ Happy Travelers` : '10K+ Happy Travelers'}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-20 md:py-24 px-6 md:px-12 lg:px-20 xl:px-32 bg-primary text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-accent rounded-full blur-3xl"></div>
        </div>
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <h2 className="text-4xl md:text-5xl font-extrabold mb-6 leading-tight">
            Ready to Start Your Journey?
          </h2>
          <p className="text-xl md:text-2xl text-white/95 mb-10 leading-relaxed">
            Join thousands of happy travelers who trust Nonsa Travels for their
            accommodations and adventures.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <button
              onClick={() => (window.location.href = "/hotels")}
              className="group px-8 py-4 bg-accent text-gray-900 font-bold rounded-xl hover:bg-accent/90 transition-all duration-300 text-lg shadow-2xl hover:shadow-accent/50 hover:scale-105 flex items-center gap-3"
            >
              Explore Hotels
              <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </button>
            <button
              onClick={() => (window.location.href = "/contact")}
              className="px-8 py-4 bg-white/10 backdrop-blur-sm border-2 border-white text-white font-bold rounded-xl hover:bg-white/20 transition-all duration-300 text-lg hover:scale-105"
            >
              Contact Us
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;
