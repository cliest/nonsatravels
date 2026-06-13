import React, { createContext, useContext, useState, useEffect } from 'react';

const CurrencyContext = createContext();

// Supported currencies with their symbols and names
export const CURRENCIES = {
  USD: { symbol: '$', name: 'US Dollar', code: 'USD' },
  EUR: { symbol: '€', name: 'Euro', code: 'EUR' },
  GBP: { symbol: '£', name: 'British Pound', code: 'GBP' },
  ZMW: { symbol: 'ZK', name: 'Zambian Kwacha', code: 'ZMW' },
};

export const CurrencyProvider = ({ children }) => {
  const [currency, setCurrency] = useState(() => {
    // Load from localStorage or default to USD
    return localStorage.getItem('currency') || 'USD';
  });
  
  const [exchangeRates, setExchangeRates] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch exchange rates on mount
  useEffect(() => {
    fetchExchangeRates();
    // Refresh rates every hour
    const interval = setInterval(fetchExchangeRates, 3600000);
    return () => clearInterval(interval);
  }, []);

  // Save currency preference to localStorage
  useEffect(() => {
    localStorage.setItem('currency', currency);
  }, [currency]);

  const fetchExchangeRates = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Using exchangerate-api.io free tier (base: USD)
      const response = await fetch('https://api.exchangerate-api.com/v4/latest/USD');
      
      if (!response.ok) {
        throw new Error('Failed to fetch exchange rates');
      }
      
      const data = await response.json();
      setExchangeRates(data.rates);
    } catch (err) {
      setError(err.message);
      // Set fallback rates if API fails
      setExchangeRates({
        USD: 1,
        EUR: 0.92,
        GBP: 0.79,
        ZMW: 27.5,
      });
    } finally {
      setLoading(false);
    }
  };

  // Convert price from USD to selected currency
  const convertPrice = (priceInUSD) => {
    if (!priceInUSD || isNaN(priceInUSD)) return 0;
    
    const rate = exchangeRates[currency] || 1;
    return (priceInUSD * rate).toFixed(2);
  };

  // Format price with currency symbol
  const formatPrice = (priceInUSD) => {
    const convertedPrice = convertPrice(priceInUSD);
    const currencyInfo = CURRENCIES[currency];
    
    // Format based on currency
    if (currency === 'EUR') {
      return `${convertedPrice}${currencyInfo.symbol}`;
    }
    return `${currencyInfo.symbol}${convertedPrice}`;
  };

  const value = {
    currency,
    setCurrency,
    exchangeRates,
    loading,
    error,
    convertPrice,
    formatPrice,
    currencies: CURRENCIES,
  };

  return (
    <CurrencyContext.Provider value={value}>
      {children}
    </CurrencyContext.Provider>
  );
};

export const useCurrency = () => {
  const context = useContext(CurrencyContext);
  if (!context) {
    throw new Error('useCurrency must be used within a CurrencyProvider');
  }
  return context;
};

export default CurrencyContext;
