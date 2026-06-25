import React, { useEffect, useState, useRef } from "react";
import { assets } from "../assets/assets";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useFavorites } from "../hooks/useFavorites";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
  faHeart, 
  faUser, 
  faCog, 
  faStar, 
  faGift,
  faChevronDown,
  faGlobe,
  faBars,
  faTimes,
  faCalendarCheck,
  faMap,
  faRoute,
  faHome,
  faHotel,
  faInfoCircle,
  faSignOutAlt,
  faBlog,
} from "@fortawesome/free-solid-svg-icons";
import { useTranslation } from "react-i18next";
import LanguageSwitcher from "./LanguageSwitcher";
import CurrencySelector from "./CurrencySelector";
import { useWeather } from "../context/WeatherContext";

// Main navigation links
const MAIN_NAV = [
  { name: "Home", path: "/", icon: faHome },
  { name: "Hotels", path: "/hotels", icon: faHotel },
  { name: "Destinations", path: "/destinations", icon: faMap },
  { name: "Blog", path: "/blog", icon: faBlog },
];

// Secondary links for "More" dropdown
const MORE_NAV = [
  { name: "My Trips", path: "/my-trips", icon: faRoute },
  { name: "Offers", path: "/offers", icon: faGift },
  { name: "About", path: "/about", icon: faInfoCircle },
];

const Navbar = () => {
  const { t } = useTranslation();
  const { user, isSignedIn, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { favoritesCount } = useFavorites();
  
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [showPreferences, setShowPreferences] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  
  const moreMenuRef = useRef(null);
  const preferencesRef = useRef(null);
  const userMenuRef = useRef(null);

  const isAdmin = user?.role === "admin";

  // Handle scroll effect
  useEffect(() => {
    const isNotHome = location.pathname !== "/";
    setIsScrolled(isNotHome);

    if (!isNotHome) {
      const handleScroll = () => setIsScrolled(window.scrollY > 10);
      window.addEventListener("scroll", handleScroll);
      return () => window.removeEventListener("scroll", handleScroll);
    }
  }, [location.pathname]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (moreMenuRef.current && !moreMenuRef.current.contains(e.target)) {
        setShowMoreMenu(false);
      }
      if (preferencesRef.current && !preferencesRef.current.contains(e.target)) {
        setShowPreferences(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMenuOpen(false);
  }, [location.pathname]);

  const navTextClass = isScrolled ? "text-gray-700" : "text-white";
  const navHoverClass = isScrolled ? "hover:bg-gray-100" : "hover:bg-white/10";

  return (
    <nav
      className={`fixed top-0 left-0 w-full flex items-center justify-between px-4 md:px-8 lg:px-16 xl:px-24 transition-all duration-300 z-50 ${
        isScrolled
          ? "bg-white/95 shadow-md backdrop-blur-lg py-3"
          : "bg-black/30 py-4"
      }`}
      role="navigation"
      aria-label="Main navigation"
    >
      {/* Logo */}
      <Link 
        to="/" 
        className="flex-shrink-0 transition-transform hover:scale-105"
        aria-label="Nonsa Travels Home"
      >
        <img 
          src={assets.logo} 
          alt="Nonsa Travels" 
          className={`h-10 md:h-12 ${!isScrolled && "brightness-110"}`}
        />
      </Link>

      {/* Desktop Navigation */}
      <div className="hidden lg:flex items-center gap-1">
        {/* Main Links */}
        {MAIN_NAV.map((link) => (
          <Link
            key={link.path}
            to={link.path}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${navTextClass} ${navHoverClass} ${
              location.pathname === link.path ? "bg-primary/10 text-primary" : ""
            }`}
          >
            {link.name}
          </Link>
        ))}

        {/* More Dropdown */}
        <div className="relative" ref={moreMenuRef}>
          <button
            onClick={() => setShowMoreMenu(!showMoreMenu)}
            className={`flex items-center gap-1 px-4 py-2 rounded-lg font-medium transition-all ${navTextClass} ${navHoverClass}`}
            aria-expanded={showMoreMenu}
            aria-haspopup="true"
          >
            More
            <FontAwesomeIcon 
              icon={faChevronDown} 
              className={`text-xs transition-transform ${showMoreMenu ? "rotate-180" : ""}`}
            />
          </button>
          
          {showMoreMenu && (
            <div className="absolute top-full left-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-gray-100 py-2 animate-fadeIn">
              {MORE_NAV.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setShowMoreMenu(false)}
                  className="flex items-center gap-3 px-4 py-2.5 text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  <FontAwesomeIcon icon={link.icon} className="text-gray-400 w-4" />
                  {link.name}
                </Link>
              ))}
              {isAdmin && (
                <>
                  <div className="border-t border-gray-100 my-2" />
                  <Link
                    to="/admin"
                    onClick={() => setShowMoreMenu(false)}
                    className="flex items-center gap-3 px-4 py-2.5 text-primary hover:bg-primary/5 transition-colors font-medium"
                  >
                    <FontAwesomeIcon icon={faCog} className="w-4" />
                    Admin Dashboard
                  </Link>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Desktop Right Actions */}
      <div className="hidden lg:flex items-center gap-2">
        {/* Preferences Dropdown */}
        <div className="relative" ref={preferencesRef}>
          <button
            onClick={() => setShowPreferences(!showPreferences)}
            className={`p-2.5 rounded-lg transition-all ${navTextClass} ${navHoverClass}`}
            aria-label="Preferences"
            aria-expanded={showPreferences}
          >
            <FontAwesomeIcon icon={faGlobe} className="text-lg" />
          </button>
          
          {showPreferences && (
            <div className="absolute top-full right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-gray-100 p-4 animate-fadeIn">
              <h3 className="text-sm font-semibold text-gray-500 mb-3">Preferences</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Language</label>
                  <LanguageSwitcher />
                </div>
                
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Currency</label>
                  <CurrencySelector />
                </div>
                
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Temperature</label>
                  <TemperatureToggle />
                </div>
              </div>
            </div>
          )}
        </div>

        {isSignedIn ? (
          <div className="flex items-center gap-2">
            {/* Favorites */}
            <button
              onClick={() => navigate("/favorites")}
              className={`relative p-2.5 rounded-lg transition-all ${navTextClass} ${navHoverClass}`}
              aria-label={`Favorites ${favoritesCount > 0 ? `(${favoritesCount})` : ""}`}
            >
              <FontAwesomeIcon icon={faHeart} className="text-lg" />
              {favoritesCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                  {favoritesCount}
                </span>
              )}
            </button>

            {/* User Menu */}
            <div className="relative" ref={userMenuRef}>
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className={`flex items-center gap-2 p-2 rounded-lg transition-all ${navTextClass} ${navHoverClass}`}
                aria-expanded={showUserMenu}
                aria-haspopup="true"
              >
                <div className="w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center font-semibold overflow-hidden">
                  {user?.avatar ? (
                    <img 
                      src={user.avatar} 
                      alt={user.fullName || user.firstName} 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    user?.firstName?.charAt(0) || 'U'
                  )}
                </div>
                <FontAwesomeIcon 
                  icon={faChevronDown} 
                  className={`text-xs transition-transform ${showUserMenu ? "rotate-180" : ""}`}
                />
              </button>
              
              {showUserMenu && (
                <div className="absolute top-full right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-gray-100 py-2 animate-fadeIn">
                  <div className="px-4 py-3 border-b border-gray-100 flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary text-white rounded-full flex items-center justify-center font-semibold overflow-hidden flex-shrink-0">
                      {user?.avatar ? (
                        <img 
                          src={user.avatar} 
                          alt={user.fullName || user.firstName} 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        user?.firstName?.charAt(0) || 'U'
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-gray-900 truncate">{user?.fullName || user?.firstName}</p>
                      <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                      {user?.loyaltyTier && user.loyaltyTier !== 'bronze' && (
                        <span className={`inline-block mt-0.5 text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                          user.loyaltyTier === 'platinum' ? 'bg-purple-100 text-purple-700' :
                          user.loyaltyTier === 'gold' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-gray-100 text-gray-600'
                        }`}>{user.loyaltyTier.charAt(0).toUpperCase() + user.loyaltyTier.slice(1)} Member</span>
                      )}
                    </div>
                  </div>
                  
                  <Link
                    to="/profile"
                    onClick={() => setShowUserMenu(false)}
                    className="flex items-center gap-3 px-4 py-2.5 text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    <FontAwesomeIcon icon={faUser} className="text-gray-400 w-4" />
                    My Profile
                  </Link>
                  <Link
                    to="/my-bookings"
                    onClick={() => setShowUserMenu(false)}
                    className="flex items-center gap-3 px-4 py-2.5 text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    <FontAwesomeIcon icon={faCalendarCheck} className="text-gray-400 w-4" />
                    My Bookings
                  </Link>
                  <Link
                    to="/loyalty"
                    onClick={() => setShowUserMenu(false)}
                    className="flex items-center gap-3 px-4 py-2.5 text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    <FontAwesomeIcon icon={faStar} className="text-gray-400 w-4" />
                    Loyalty Rewards
                  </Link>
                  <Link
                    to="/referrals"
                    onClick={() => setShowUserMenu(false)}
                    className="flex items-center gap-3 px-4 py-2.5 text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    <FontAwesomeIcon icon={faGift} className="text-gray-400 w-4" />
                    Referrals
                  </Link>
                  
                  <div className="border-t border-gray-100 my-2" />
                  
                  <button
                    onClick={() => {
                      logout();
                      setShowUserMenu(false);
                      navigate('/');
                    }}
                    className="flex items-center gap-3 px-4 py-2.5 text-red-600 hover:bg-red-50 transition-colors w-full"
                  >
                    <FontAwesomeIcon icon={faSignOutAlt} className="w-4" />
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <Link
              to="/login"
              className={`font-medium text-sm px-4 py-2 rounded-lg transition-all ${navTextClass} ${navHoverClass}`}
            >
              Sign In
            </Link>
            <Link
              to="/register"
              className="font-semibold text-sm px-5 py-2.5 rounded-lg bg-primary text-white hover:bg-primary/90 transition-all"
            >
              Sign Up
            </Link>
          </div>
        )}
      </div>

      {/* Mobile Menu Button */}
      <div className="flex items-center gap-2 lg:hidden">
        {isSignedIn && (
          <button
            onClick={() => navigate("/favorites")}
            className={`relative p-2 rounded-lg ${navHoverClass}`}
            aria-label="Favorites"
          >
            <FontAwesomeIcon icon={faHeart} className={`text-lg ${navTextClass}`} />
            {favoritesCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                {favoritesCount}
              </span>
            )}
          </button>
        )}
        
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className={`p-2 rounded-lg ${navHoverClass}`}
          aria-label={isMenuOpen ? "Close menu" : "Open menu"}
          aria-expanded={isMenuOpen}
        >
          <FontAwesomeIcon 
            icon={isMenuOpen ? faTimes : faBars} 
            className={`text-xl ${navTextClass}`}
          />
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      <div
        className={`fixed inset-0 bg-black/50 lg:hidden transition-opacity duration-300 z-40 ${
          isMenuOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setIsMenuOpen(false)}
      />

      {/* Mobile Menu Slide Panel */}
      <div
        className={`fixed top-0 right-0 h-full w-[85%] max-w-sm bg-white lg:hidden transition-transform duration-300 ease-out z-50 shadow-2xl ${
          isMenuOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Mobile Header */}
          <div className="flex items-center justify-between p-4 bg-primary">
            {isSignedIn ? (
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-white/20 backdrop-blur text-white rounded-full flex items-center justify-center font-bold text-lg border-2 border-white/30 overflow-hidden">
                  {user?.avatar ? (
                    <img 
                      src={user.avatar} 
                      alt={user.fullName || user.firstName} 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    user?.firstName?.charAt(0) || 'U'
                  )}
                </div>
                <div>
                  <p className="text-white font-semibold">{user?.firstName || 'User'}</p>
                  <p className="text-white/70 text-sm truncate max-w-[150px]">{user?.email}</p>
                </div>
              </div>
            ) : (
              <img src={assets.logo} alt="Nonsa Travels" className="h-8 brightness-0 invert" />
            )}
            <button
              onClick={() => setIsMenuOpen(false)}
              className="w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
              aria-label="Close menu"
            >
              <FontAwesomeIcon icon={faTimes} className="text-white text-lg" />
            </button>
          </div>

          {/* Mobile Nav Content */}
          <div className="flex-1 overflow-y-auto">
            {/* Quick Actions for signed in users */}
            {isSignedIn && (
              <div className="grid grid-cols-3 gap-2 p-4 bg-gray-50 border-b">
                <Link
                  to="/my-bookings"
                  onClick={() => setIsMenuOpen(false)}
                  className="flex flex-col items-center gap-1.5 p-3 rounded-xl bg-white shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center">
                    <FontAwesomeIcon icon={faCalendarCheck} />
                  </div>
                  <span className="text-xs font-medium text-gray-700">Bookings</span>
                </Link>
                <Link
                  to="/favorites"
                  onClick={() => setIsMenuOpen(false)}
                  className="flex flex-col items-center gap-1.5 p-3 rounded-xl bg-white shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="w-10 h-10 rounded-full bg-red-100 text-red-500 flex items-center justify-center relative">
                    <FontAwesomeIcon icon={faHeart} />
                    {favoritesCount > 0 && (
                      <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                        {favoritesCount}
                      </span>
                    )}
                  </div>
                  <span className="text-xs font-medium text-gray-700">Favorites</span>
                </Link>
                <Link
                  to="/loyalty"
                  onClick={() => setIsMenuOpen(false)}
                  className="flex flex-col items-center gap-1.5 p-3 rounded-xl bg-white shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="w-10 h-10 rounded-full bg-yellow-100 text-yellow-600 flex items-center justify-center">
                    <FontAwesomeIcon icon={faStar} />
                  </div>
                  <span className="text-xs font-medium text-gray-700">Rewards</span>
                </Link>
              </div>
            )}

            {/* Main Navigation */}
            <div className="p-4">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 px-2">Menu</p>
              <div className="space-y-1">
                {[...MAIN_NAV, ...MORE_NAV].map((link) => (
                  <Link
                    key={link.path}
                    to={link.path}
                    onClick={() => setIsMenuOpen(false)}
                    className={`flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all ${
                      location.pathname === link.path
                        ? "bg-primary text-white shadow-lg shadow-primary/30"
                        : "text-gray-700 hover:bg-gray-100 active:bg-gray-200"
                    }`}
                  >
                    <FontAwesomeIcon 
                      icon={link.icon} 
                      className={`w-5 ${location.pathname === link.path ? "text-white" : "text-gray-400"}`} 
                    />
                    <span className="font-medium">{link.name}</span>
                    {location.pathname === link.path && (
                      <div className="ml-auto w-2 h-2 rounded-full bg-white" />
                    )}
                  </Link>
                ))}
              </div>
              
              {isAdmin && (
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <Link
                    to="/admin"
                    onClick={() => setIsMenuOpen(false)}
                    className="flex items-center gap-4 px-4 py-3.5 rounded-xl bg-primary/10 text-primary-200 transition-all"
                  >
                    <FontAwesomeIcon icon={faCog} className="w-5" />
                    <span className="font-semibold">Admin Dashboard</span>
                  </Link>
                </div>
              )}
            </div>

            {/* Account Section for signed in users */}
            {isSignedIn && (
              <div className="p-4 pt-0">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 px-2">Account</p>
                <div className="space-y-1">
                  {[
                    { name: "My Profile", path: "/profile", icon: faUser },
                    { name: "Referrals", path: "/referrals", icon: faGift },
                  ].map((link) => (
                    <Link
                      key={link.path}
                      to={link.path}
                      onClick={() => setIsMenuOpen(false)}
                      className="flex items-center gap-4 px-4 py-3.5 rounded-xl text-gray-700 hover:bg-gray-100 active:bg-gray-200 transition-all"
                    >
                      <FontAwesomeIcon icon={link.icon} className="w-5 text-gray-400" />
                      <span className="font-medium">{link.name}</span>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Preferences */}
            <div className="p-4 pt-0">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 px-2">Preferences</p>
              <div className="bg-gray-50 rounded-xl p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center">
                      <FontAwesomeIcon icon={faGlobe} className="text-sm" />
                    </div>
                    <span className="text-gray-700 font-medium">Language</span>
                  </div>
                  <LanguageSwitcher />
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-green-100 text-green-600 flex items-center justify-center">
                      <span className="text-sm font-bold">$</span>
                    </div>
                    <span className="text-gray-700 font-medium">Currency</span>
                  </div>
                  <CurrencySelector />
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-orange-100 text-orange-600 flex items-center justify-center">
                      <span className="text-sm font-bold">°</span>
                    </div>
                    <span className="text-gray-700 font-medium">Temperature</span>
                  </div>
                  <TemperatureToggle />
                </div>
              </div>
            </div>
          </div>

          {/* Mobile Footer */}
          <div className="p-4 border-t bg-gray-50">
            {isSignedIn ? (
              <button
                onClick={() => {
                  logout();
                  setIsMenuOpen(false);
                  navigate('/');
                }}
                className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-red-50 text-red-600 font-semibold hover:bg-red-100 active:bg-red-200 transition-colors"
              >
                <FontAwesomeIcon icon={faSignOutAlt} />
                Sign Out
              </button>
            ) : (
              <div className="space-y-3">
                <Link
                  to="/register"
                  onClick={() => setIsMenuOpen(false)}
                  className="block w-full py-3.5 text-center bg-primary text-white font-semibold rounded-xl hover:bg-primary/90 active:bg-primary/80 transition-colors shadow-lg shadow-primary/30"
                >
                  Create Account
                </Link>
                <Link
                  to="/login"
                  onClick={() => setIsMenuOpen(false)}
                  className="block w-full py-3.5 text-center text-primary font-semibold rounded-xl border-2 border-primary hover:bg-primary/5 active:bg-primary/10 transition-colors"
                >
                  Sign In
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

// Temperature Toggle Component
const TemperatureToggle = () => {
  const { tempUnit, toggleTempUnit } = useWeather();

  return (
    <button
      onClick={toggleTempUnit}
      className="px-3 py-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors text-gray-700 font-medium text-sm"
      aria-label={`Switch to ${tempUnit === "C" ? "Fahrenheit" : "Celsius"}`}
    >
      {tempUnit === "C" ? "°C" : "°F"}
    </button>
  );
};

export default Navbar;
