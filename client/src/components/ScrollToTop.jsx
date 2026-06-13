import { useEffect } from "react";
import { useLocation } from "react-router-dom";

/**
 * ScrollToTop - Automatically scrolls to top on route change
 * Place this component inside your Router but outside of Routes
 */
const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    // Scroll to top when the route changes
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "instant" // Use "smooth" for animated scroll
    });
  }, [pathname]);

  return null;
};

export default ScrollToTop;
