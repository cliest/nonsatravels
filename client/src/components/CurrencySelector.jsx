import React, { useState, useRef, useEffect } from 'react';
import { useCurrency } from '../context/CurrencyContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faDollarSign, faChevronDown } from '@fortawesome/free-solid-svg-icons';

const CurrencySelector = () => {
  const { currency, setCurrency, currencies, loading } = useCurrency();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleCurrencyChange = (newCurrency) => {
    setCurrency(newCurrency);
    setIsOpen(false);
  };

  const currentCurrency = currencies[currency];

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={loading}
        className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        aria-label="Select currency"
      >
        <span className="font-bold text-sm text-primary">{currentCurrency?.symbol}</span>
        <span className="font-medium text-sm text-gray-700">{currency}</span>
        <FontAwesomeIcon
          icon={faChevronDown}
          className={`text-xs text-gray-500 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-50 animate-fade-in">
          {Object.entries(currencies).map(([code, info]) => (
            <button
              key={code}
              onClick={() => handleCurrencyChange(code)}
              className={`w-full flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 transition-colors ${
                currency === code ? 'bg-primary/5 text-primary font-medium' : 'text-gray-700'
              }`}
            >
              <span className="text-sm font-bold text-gray-500 w-6 text-center">{info.symbol}</span>
              <div className="flex-1 text-left">
                <div className="text-sm font-medium">{code}</div>
                <div className="text-xs text-gray-500">{info.name}</div>
              </div>
              {currency === code && (
                <div className="w-2 h-2 bg-primary rounded-full"></div>
              )}
            </button>
          ))}
        </div>
      )}

      {loading && (
        <div className="absolute right-0 top-full mt-1 text-xs text-gray-500">
          Updating rates...
        </div>
      )}
    </div>
  );
};

export default CurrencySelector;
