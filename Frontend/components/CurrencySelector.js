// Frontend/components/CurrencySelector.js
import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  StyleSheet,
  ScrollView,
  SafeAreaView
} from 'react-native';
import { useCurrency } from '../context/CurrencyContext';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

const CURRENCY_INFO = {
  RWF: { name: 'Rwandan Franc', symbol: 'FRw', flag: '🇷🇼' },
  USD: { name: 'US Dollar', symbol: '$', flag: '🇺🇸' },
  EUR: { name: 'Euro', symbol: '€', flag: '🇪🇺' },
  GBP: { name: 'British Pound', symbol: '£', flag: '🇬🇧' }
};

export const CurrencySelector = ({ visible, onClose }) => {
  const { selectedCurrency, changeCurrency, availableCurrencies } = useCurrency();

  const handleSelect = (currency) => {
    changeCurrency(currency);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalContent}>
            {/* Header */}
            <View style={styles.header}>
              <Text style={styles.title}>
                Select Currency
              </Text>
              <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                <MaterialIcons name="close" size={24} color="#1C1C1E" />
              </TouchableOpacity>
            </View>

            {/* Currency List */}
            <ScrollView style={styles.listContainer}>
              {availableCurrencies.map((currency) => {
                const info = CURRENCY_INFO[currency];
                const isSelected = selectedCurrency === currency;

                return (
                  <TouchableOpacity
                    key={currency}
                    style={[
                      styles.currencyItem,
                      isSelected && styles.currencyItemSelected
                    ]}
                    onPress={() => handleSelect(currency)}
                    activeOpacity={0.7}
                  >
                    <View style={styles.currencyLeft}>
                      <Text style={styles.flag}>{info.flag}</Text>
                      <View style={styles.currencyInfo}>
                        <Text style={styles.currencyCode}>
                          {currency}
                        </Text>
                        <Text style={styles.currencyName}>
                          {info.name}
                        </Text>
                      </View>
                    </View>

                    <View style={styles.currencyRight}>
                      <Text style={styles.currencySymbol}>
                        {info.symbol}
                      </Text>
                      {isSelected && (
                        <MaterialIcons
                          name="check-circle"
                          size={24}
                          color="#1995AD"
                          style={styles.checkIcon}
                        />
                      )}
                    </View>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            {/* Info Text */}
            <View style={styles.footer}>
              <MaterialIcons name="info-outline" size={16} color="#8E8E93" />
              <Text style={styles.footerText}>
                Prices will be converted automatically using current exchange rates
              </Text>
            </View>
          </View>
        </SafeAreaView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1C1C1E',
  },
  closeButton: {
    padding: 4,
  },
  listContainer: {
    flex: 1,
  },
  currencyItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 0.5,
    borderBottomColor: '#E5E5EA',
  },
  currencyItemSelected: {
    backgroundColor: 'rgba(171, 227, 237, 0.2)',
  },
  currencyLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  flag: {
    fontSize: 32,
    marginRight: 12,
  },
  currencyInfo: {
    flex: 1,
  },
  currencyCode: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 2,
    color: '#1C1C1E',
  },
  currencyName: {
    fontSize: 14,
    color: '#8E8E93',
  },
  currencyRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  currencySymbol: {
    fontSize: 18,
    fontWeight: '500',
    marginRight: 8,
    color: '#8E8E93',
  },
  checkIcon: {
    marginLeft: 4,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    gap: 8,
    backgroundColor: '#F8F9FA',
  },
  footerText: {
    fontSize: 12,
    flex: 1,
    lineHeight: 16,
    color: '#8E8E93',
  },
});

export default CurrencySelector;
