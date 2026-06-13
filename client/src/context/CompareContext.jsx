import { createContext, useContext, useState, useEffect } from "react";
import PropTypes from "prop-types";
import { toast } from "../utils/toast";

const CompareContext = createContext();

export const useCompare = () => {
  const context = useContext(CompareContext);
  if (!context) {
    throw new Error("useCompare must be used within CompareProvider");
  }
  return context;
};

export const CompareProvider = ({ children }) => {
  const [compareHotels, setCompareHotels] = useState(() => {
    // Load from localStorage on init
    const saved = localStorage.getItem("compareHotels");
    return saved ? JSON.parse(saved) : [];
  });

  // Save to localStorage whenever compareHotels changes
  useEffect(() => {
    localStorage.setItem("compareHotels", JSON.stringify(compareHotels));
  }, [compareHotels]);

  const addToCompare = (hotel) => {
    if (compareHotels.length >= 3) {
      toast.error("You can compare up to 3 hotels only");
      return false;
    }

    if (compareHotels.find((h) => h.id === hotel.id)) {
      toast.info("Hotel already in comparison");
      return false;
    }

    setCompareHotels((prev) => [...prev, hotel]);
    toast.success(`${hotel.name} added to comparison`);
    return true;
  };

  const removeFromCompare = (hotelId) => {
    setCompareHotels((prev) => prev.filter((h) => h.id !== hotelId));
    toast.info("Hotel removed from comparison");
  };

  const clearCompare = () => {
    setCompareHotels([]);
    toast.info("Comparison cleared");
  };

  const isInCompare = (hotelId) => {
    return compareHotels.some((h) => h.id === hotelId);
  };

  const value = {
    compareHotels,
    addToCompare,
    removeFromCompare,
    clearCompare,
    isInCompare,
    compareCount: compareHotels.length,
    canAddMore: compareHotels.length < 3,
  };

  return (
    <CompareContext.Provider value={value}>{children}</CompareContext.Provider>
  );
};

CompareProvider.propTypes = {
  children: PropTypes.node.isRequired,
};
