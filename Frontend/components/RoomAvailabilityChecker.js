// Frontend/components/RoomAvailabilityChecker.js
import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Modal,
  ActivityIndicator,
  Alert,
  Platform,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import apiService from '../services/api';

const RoomAvailabilityChecker = ({ roomTypeId, onAvailabilityChecked }) => {
  const [checkInDate, setCheckInDate] = useState(new Date());
  const [checkOutDate, setCheckOutDate] = useState(
    new Date(Date.now() + 86400000) // Tomorrow
  );
  const [showCheckInPicker, setShowCheckInPicker] = useState(false);
  const [showCheckOutPicker, setShowCheckOutPicker] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const [availabilityResult, setAvailabilityResult] = useState(null);

  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const onCheckInChange = (event, selectedDate) => {
    setShowCheckInPicker(Platform.OS === 'ios');
    if (selectedDate) {
      const newCheckIn = selectedDate;
      setCheckInDate(newCheckIn);
      
      // Ensure check-out is after check-in
      if (newCheckIn >= checkOutDate) {
        setCheckOutDate(new Date(newCheckIn.getTime() + 86400000));
      }
    }
  };

  const onCheckOutChange = (event, selectedDate) => {
    setShowCheckOutPicker(Platform.OS === 'ios');
    if (selectedDate) {
      // Ensure check-out is after check-in
      if (selectedDate > checkInDate) {
        setCheckOutDate(selectedDate);
      } else {
        Alert.alert('Error', 'Check-out date must be after check-in date');
      }
    }
  };

  const calculateNights = () => {
    const diffTime = Math.abs(checkOutDate - checkInDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const checkAvailability = async () => {
    setIsChecking(true);
    setAvailabilityResult(null);

    try {
      const response = await apiService.pricing.checkAvailability(roomTypeId, {
        check_in_date: checkInDate.toISOString(),
        check_out_date: checkOutDate.toISOString(),
      });

      const result = response.data;
      setAvailabilityResult(result);

      if (onAvailabilityChecked) {
        onAvailabilityChecked(result);
      }

      if (result.data?.available) {
        Alert.alert(
          'Available! ✓',
          `${result.data.available_rooms} room(s) available\nTotal: ${result.data.currency} ${result.data.total_price}`,
          [{ text: 'OK' }]
        );
      } else {
        Alert.alert(
          'Not Available',
          result.message || 'No rooms available for the selected dates',
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      console.error('Error checking availability:', error);
      Alert.alert(
        'Error',
        error.response?.data?.message || 'Failed to check availability'
      );
    } finally {
      setIsChecking(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Check Availability</Text>

      <View style={styles.dateContainer}>
        <View style={styles.dateSection}>
          <Text style={styles.label}>Check-in</Text>
          <TouchableOpacity
            style={styles.dateButton}
            onPress={() => setShowCheckInPicker(true)}
          >
            <MaterialIcons name="calendar-today" size={20} color="#007AFF" />
            <Text style={styles.dateText}>{formatDate(checkInDate)}</Text>
          </TouchableOpacity>
        </View>

        <MaterialIcons name="arrow-forward" size={24} color="#999" />

        <View style={styles.dateSection}>
          <Text style={styles.label}>Check-out</Text>
          <TouchableOpacity
            style={styles.dateButton}
            onPress={() => setShowCheckOutPicker(true)}
          >
            <MaterialIcons name="event" size={20} color="#007AFF" />
            <Text style={styles.dateText}>{formatDate(checkOutDate)}</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.summaryContainer}>
        <MaterialIcons name="nights-stay" size={20} color="#666" />
        <Text style={styles.summaryText}>
          {calculateNights()} night{calculateNights() > 1 ? 's' : ''}
        </Text>
      </View>

      <TouchableOpacity
        style={[styles.checkButton, isChecking && styles.checkButtonDisabled]}
        onPress={checkAvailability}
        disabled={isChecking}
      >
        {isChecking ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <>
            <MaterialIcons name="search" size={20} color="#fff" />
            <Text style={styles.checkButtonText}>Check Availability</Text>
          </>
        )}
      </TouchableOpacity>

      {availabilityResult && availabilityResult.data?.available && (
        <View style={styles.resultContainer}>
          <View style={styles.resultHeader}>
            <MaterialIcons name="check-circle" size={24} color="#34C759" />
            <Text style={styles.resultTitle}>Available!</Text>
          </View>
          <View style={styles.resultDetails}>
            <View style={styles.resultRow}>
              <Text style={styles.resultLabel}>Available Rooms:</Text>
              <Text style={styles.resultValue}>
                {availabilityResult.data.available_rooms}
              </Text>
            </View>
            <View style={styles.resultRow}>
              <Text style={styles.resultLabel}>Price per Night:</Text>
              <Text style={styles.resultValue}>
                {availabilityResult.data.currency}{' '}
                {availabilityResult.data.price_per_night}
              </Text>
            </View>
            <View style={[styles.resultRow, styles.totalRow]}>
              <Text style={styles.totalLabel}>Total Price:</Text>
              <Text style={styles.totalValue}>
                {availabilityResult.data.currency}{' '}
                {availabilityResult.data.total_price}
              </Text>
            </View>
          </View>
        </View>
      )}

      {/* Date Pickers */}
      {showCheckInPicker && (
        <Modal
          transparent={true}
          animationType="slide"
          visible={showCheckInPicker}
          onRequestClose={() => setShowCheckInPicker(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Select Check-in Date</Text>
                <TouchableOpacity onPress={() => setShowCheckInPicker(false)}>
                  <MaterialIcons name="close" size={24} color="#333" />
                </TouchableOpacity>
              </View>
              <DateTimePicker
                value={checkInDate}
                mode="date"
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                onChange={onCheckInChange}
                minimumDate={new Date()}
                style={styles.datePicker}
              />
              {Platform.OS === 'ios' && (
                <TouchableOpacity
                  style={styles.doneButton}
                  onPress={() => setShowCheckInPicker(false)}
                >
                  <Text style={styles.doneButtonText}>Done</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </Modal>
      )}

      {showCheckOutPicker && (
        <Modal
          transparent={true}
          animationType="slide"
          visible={showCheckOutPicker}
          onRequestClose={() => setShowCheckOutPicker(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Select Check-out Date</Text>
                <TouchableOpacity onPress={() => setShowCheckOutPicker(false)}>
                  <MaterialIcons name="close" size={24} color="#333" />
                </TouchableOpacity>
              </View>
              <DateTimePicker
                value={checkOutDate}
                mode="date"
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                onChange={onCheckOutChange}
                minimumDate={new Date(checkInDate.getTime() + 86400000)}
                style={styles.datePicker}
              />
              {Platform.OS === 'ios' && (
                <TouchableOpacity
                  style={styles.doneButton}
                  onPress={() => setShowCheckOutPicker(false)}
                >
                  <Text style={styles.doneButtonText}>Done</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginVertical: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  dateContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  dateSection: {
    flex: 1,
  },
  label: {
    fontSize: 12,
    color: '#666',
    marginBottom: 8,
    fontWeight: '500',
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9f9f9',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#eee',
    gap: 8,
  },
  dateText: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  summaryContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9f9f9',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    gap: 8,
  },
  summaryText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  checkButton: {
    backgroundColor: '#007AFF',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 14,
    borderRadius: 8,
    gap: 8,
  },
  checkButtonDisabled: {
    opacity: 0.6,
  },
  checkButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  resultContainer: {
    marginTop: 16,
    backgroundColor: '#F0FDF4',
    borderRadius: 8,
    padding: 16,
    borderWidth: 1,
    borderColor: '#34C759',
  },
  resultHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  resultTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#34C759',
  },
  resultDetails: {
    gap: 8,
  },
  resultRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  resultLabel: {
    fontSize: 14,
    color: '#666',
  },
  resultValue: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  totalRow: {
    marginTop: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#34C759',
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  totalValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#34C759',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  datePicker: {
    width: '100%',
  },
  doneButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
  },
  doneButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default RoomAvailabilityChecker;