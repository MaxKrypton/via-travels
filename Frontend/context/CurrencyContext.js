// Frontend/context/CurrencyContext.js
import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const CurrencyContext = createContext();

// Exchange rates (can be updated from API in production)
const EXCHANGE_RATES = {
  RWF: { USD: 0.00078, EUR: 0.00072, GBP: 0.00062, RWF: 1 },
  USD: { RWF: 1280, EUR: 0.92, GBP: 0.79, USD: 1 },
  EUR: { RWF: 1391, USD: 1.09, GBP: 0.86, EUR: 1 },
  GBP: { RWF: 1618, USD: 1.27, EUR: 1.16, GBP: 1 }
};

export const CurrencyProvider = ({ children }) => {
  const [selectedCurrency, setSelectedCurrency] = useState('RWF');
  const [exchangeRates] = useState(EXCHANGE_RATES);

  useEffect(() => {
    loadCurrency();
  }, []);

  const loadCurrency = async () => {
    try {
      const saved = await AsyncStorage.getItem('selectedCurrency');
      if (saved) {
        setSelectedCurrency(saved);
        console.log('✅ Currency loaded:', saved);
      }
    } catch (error) {
      console.error('❌ Error loading currency:', error);
    }
  };

  const changeCurrency = async (currency) => {
    try {
      await AsyncStorage.setItem('selectedCurrency', currency);
      setSelectedCurrency(currency);
      console.log('✅ Currency changed to:', currency);
    } catch (error) {
      console.error('❌ Error saving currency:', error);
    }
  };

  const convertPrice = (amount, fromCurrency = 'RWF') => {
    if (!amount || isNaN(amount)) return 0;
    if (fromCurrency === selectedCurrency) return parseFloat(amount);

    const rate = exchangeRates[fromCurrency]?.[selectedCurrency];
    if (!rate) return parseFloat(amount);

    return parseFloat((amount * rate).toFixed(2));
  };

  const formatPrice = (amount, fromCurrency = 'RWF', showSymbol = true) => {
    const converted = convertPrice(amount, fromCurrency);
    const formatted = converted.toLocaleString('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    });

    return showSymbol ? `${selectedCurrency} ${formatted}` : formatted;
  };

  const getCurrencySymbol = (currency = selectedCurrency) => {
    const symbols = {
      RWF: 'FRw',
      USD: '$',
      EUR: '€',
      GBP: '£'
    };
    return symbols[currency] || currency;
  };

  return (
    <CurrencyContext.Provider value={{
      selectedCurrency,
      changeCurrency,
      convertPrice,
      formatPrice,
      getCurrencySymbol,
      availableCurrencies: Object.keys(EXCHANGE_RATES),
      exchangeRates
    }}>
      {children}
    </CurrencyContext.Provider>
  );
};

export const useCurrency = () => {
  const context = useContext(CurrencyContext);
  if (!context) {
    throw new Error('useCurrency must be used within CurrencyProvider');
  }
  return context;
};

export default CurrencyContext;
