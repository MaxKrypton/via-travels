import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const CurrencyContext = createContext();

export const CURRENCY_INFO = {
  RWF: { name: 'Rwandan Franc', symbol: 'FRW', rateToUsd: 1 / 1470, locale: 'en-RW', decimals: 0 },
  USD: { name: 'US Dollar', symbol: '$', rateToUsd: 1, locale: 'en-US', decimals: 2 },
  EUR: { name: 'Euro', symbol: '€', rateToUsd: 1.09, locale: 'en-US', decimals: 2 },
  GBP: { name: 'British Pound', symbol: '£', rateToUsd: 1.27, locale: 'en-GB', decimals: 2 }
};

const AVAILABLE_CURRENCIES = ['RWF', 'USD'];
const STORAGE_KEY = 'selectedCurrency';

const parseAmount = (amount) => {
  if (typeof amount === 'number') return Number.isFinite(amount) ? amount : 0;
  if (typeof amount === 'string') {
    const parsed = Number(amount.replace(/,/g, '').trim());
    return Number.isFinite(parsed) ? parsed : 0;
  }
  return 0;
};

export const CurrencyProvider = ({ children }) => {
  const [selectedCurrency, setSelectedCurrency] = useState('RWF');

  useEffect(() => {
    loadCurrency();
  }, []);

  const loadCurrency = async () => {
    try {
      const saved = await AsyncStorage.getItem(STORAGE_KEY);
      if (AVAILABLE_CURRENCIES.includes(saved)) {
        setSelectedCurrency(saved);
      }
    } catch (error) {
      console.error('Error loading currency:', error);
    }
  };

  const changeCurrency = async (currency) => {
    if (!AVAILABLE_CURRENCIES.includes(currency)) return;

    try {
      await AsyncStorage.setItem(STORAGE_KEY, currency);
      setSelectedCurrency(currency);
    } catch (error) {
      console.error('Error saving currency:', error);
    }
  };

  const convertPrice = (amount, fromCurrency = 'RWF') => {
    const numericAmount = parseAmount(amount);
    const sourceCurrency = CURRENCY_INFO[fromCurrency] ? fromCurrency : 'RWF';

    if (sourceCurrency === selectedCurrency) return numericAmount;

    const amountInUsd = numericAmount * CURRENCY_INFO[sourceCurrency].rateToUsd;
    const converted = amountInUsd / CURRENCY_INFO[selectedCurrency].rateToUsd;
    return Number(converted.toFixed(CURRENCY_INFO[selectedCurrency].decimals));
  };

  const formatPrice = (amount, fromCurrency = 'RWF', options = {}) => {
    const { showCode = false, approximate = false } = options;
    const converted = convertPrice(amount, fromCurrency);
    const info = CURRENCY_INFO[selectedCurrency];
    const formatted = converted.toLocaleString(info.locale, {
      minimumFractionDigits: info.decimals === 0 ? 0 : 2,
      maximumFractionDigits: info.decimals
    });

    const prefix = approximate ? '~' : '';
    const suffix = showCode ? ` ${selectedCurrency}` : '';
    return `${prefix}${info.symbol} ${formatted}${suffix}`;
  };

  const getCurrencySymbol = (currency = selectedCurrency) => {
    return CURRENCY_INFO[currency]?.symbol || currency;
  };

  return (
    <CurrencyContext.Provider value={{
      selectedCurrency,
      changeCurrency,
      convertPrice,
      formatPrice,
      getCurrencySymbol,
      availableCurrencies: AVAILABLE_CURRENCIES,
      currencyInfo: CURRENCY_INFO
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
