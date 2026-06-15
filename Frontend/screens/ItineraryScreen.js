import React, { useContext, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
  SafeAreaView,
  StatusBar,
  Platform,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import AuthContext from '../context/AuthContext';
import apiService from '../services/api';

const INTERESTS = ['Wildlife', 'Culture', 'Nature', 'Adventure', 'History', 'Food', 'Relaxation'];
const DAY_IN_MS = 24 * 60 * 60 * 1000;

export default function ItineraryScreen({ navigation }) {
  const { authToken, isAuthenticated, logout } = useContext(AuthContext);

  // Form state
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [activeDatePicker, setActiveDatePicker] = useState(null);
  const [budget, setBudget] = useState('');
  const [groupSize, setGroupSize] = useState('2');
  const [selectedInterests, setSelectedInterests] = useState(['Wildlife', 'Culture']);

  // Result state
  const [itinerary, setItinerary] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showResult, setShowResult] = useState(false);

  const scrollRef = useRef(null);

  const normalizeDate = (date) =>
    new Date(date.getFullYear(), date.getMonth(), date.getDate());

  const formatDate = (date) =>
    date
      ? date.toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        })
      : '';

  const getDurationDays = () => {
    if (!startDate || !endDate) return 0;
    const start = normalizeDate(startDate);
    const end = normalizeDate(endDate);
    return Math.max(1, Math.round((end - start) / DAY_IN_MS) + 1);
  };

  const getTravelDateLabel = () => {
    if (!startDate || !endDate) return '';
    return `${formatDate(startDate)} - ${formatDate(endDate)}`;
  };

  const handleDateChange = (event, selectedDate) => {
    if (event.type === 'dismissed') {
      setActiveDatePicker(null);
      return;
    }

    if (!selectedDate || !activeDatePicker) return;

    if (activeDatePicker === 'start') {
      setStartDate(selectedDate);
      if (!endDate || normalizeDate(selectedDate) > normalizeDate(endDate)) {
        setEndDate(selectedDate);
      }
    } else {
      setEndDate(selectedDate);
    }

    if (Platform.OS !== 'ios') {
      setActiveDatePicker(null);
    }
  };

  const toggleInterest = (interest) => {
    setSelectedInterests((prev) =>
      prev.includes(interest)
        ? prev.filter((i) => i !== interest)
        : [...prev, interest]
    );
  };

  const handleGenerate = async () => {
    if (!isAuthenticated || !authToken) {
      Alert.alert('Sign in required', 'Please sign in again before generating an itinerary.');
      await logout();
      return;
    }
    if (!startDate || !endDate) {
      Alert.alert('Missing info', 'Please select your travel start and end dates.');
      return;
    }
    if (normalizeDate(endDate) < normalizeDate(startDate)) {
      Alert.alert('Invalid dates', 'Your end date must be the same as or after your start date.');
      return;
    }
    if (!budget.trim()) {
      Alert.alert('Missing info', 'Please enter your budget.');
      return;
    }
    if (selectedInterests.length === 0) {
      Alert.alert('Missing info', 'Please select at least one interest.');
      return;
    }

    setLoading(true);
    setShowResult(false);
    setItinerary(null);

    try {
      apiService.setAuthToken(authToken);
      const durationDays = getDurationDays();
      const response = await apiService.tourism.generateItinerary({
        travelDates: getTravelDateLabel(),
        budget: budget.trim(),
        groupSize: parseInt(groupSize) || 2,
        durationDays,
        interests: selectedInterests.map((i) => i.toLowerCase()),
      });

      const result = response.data?.data;
      if (result) {
        setItinerary(result.itinerary);
        setShowResult(true);
        setTimeout(() => scrollRef.current?.scrollTo({ y: 0, animated: true }), 100);
      }
    } catch (err) {
      const msg = err.code === 'ECONNABORTED'
        ? 'Itinerary generation is taking longer than expected. Please try again in a moment.'
        : err.response?.data?.message || 'Failed to generate itinerary. Please try again.';
      Alert.alert('Error', msg);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setShowResult(false);
    setItinerary(null);
  };

  // ── Render itinerary result ──────────────────────────────────────────────
  if (showResult && itinerary) {
    return (
      <SafeAreaView style={styles.safe}>
        <StatusBar barStyle="dark-content" backgroundColor="#fff" />
        <View style={styles.resultHeader}>
          <TouchableOpacity onPress={handleReset} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={22} color="#1995AD" />
          </TouchableOpacity>
          <Text style={styles.resultHeaderTitle}>Your Itinerary</Text>
          <TouchableOpacity
            onPress={() => navigation.navigate('Saved Itineraries')}
            style={styles.savedBtn}
          >
            <Ionicons name="bookmarks-outline" size={20} color="#1995AD" />
          </TouchableOpacity>
        </View>

        <ScrollView ref={scrollRef} style={styles.resultScroll} contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
          <ItineraryText text={itinerary} />
        </ScrollView>
      </SafeAreaView>
    );
  }

  // ── Render form ──────────────────────────────────────────────────────────
  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <ScrollView contentContainerStyle={styles.formContainer}>
        {/* Header */}
        <View style={styles.headerRow}>
          <MaterialCommunityIcons name="map-marker-path" size={28} color="#1995AD" />
          <View style={{ marginLeft: 10 }}>
            <Text style={styles.headerTitle}>Plan My Rwanda Trip</Text>
            <Text style={styles.headerSub}>AI-powered, curated just for you</Text>
          </View>
        </View>

        {/* Travel Dates */}
        <Label text="Travel Dates" />
        <View style={styles.dateRow}>
          <DateField
            label="Start"
            value={formatDate(startDate)}
            placeholder="Select date"
            onPress={() => setActiveDatePicker('start')}
          />
          <DateField
            label="End"
            value={formatDate(endDate)}
            placeholder="Select date"
            onPress={() => setActiveDatePicker('end')}
          />
        </View>
        {activeDatePicker && (
          <View style={styles.pickerPanel}>
            <DateTimePicker
              value={(activeDatePicker === 'start' ? startDate : endDate) || new Date()}
              mode="date"
              display={Platform.OS === 'ios' ? 'inline' : 'default'}
              minimumDate={activeDatePicker === 'end' && startDate ? startDate : new Date()}
              onChange={handleDateChange}
            />
            {Platform.OS === 'ios' && (
              <TouchableOpacity style={styles.pickerDone} onPress={() => setActiveDatePicker(null)}>
                <Text style={styles.pickerDoneText}>Done</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
        {startDate && endDate && (
          <View style={styles.durationBadge}>
            <Ionicons name="calendar-outline" size={15} color="#1995AD" />
            <Text style={styles.durationText}>
              {getDurationDays()} {getDurationDays() === 1 ? 'day' : 'days'} selected
            </Text>
          </View>
        )}

        {/* Group Size */}
        <Label text="Group Size" />
        <View style={styles.counterRow}>
          <TouchableOpacity
            style={styles.counterBtn}
            onPress={() => setGroupSize((v) => String(Math.max(1, parseInt(v) - 1)))}
          >
            <Ionicons name="remove" size={20} color="#1995AD" />
          </TouchableOpacity>
          <Text style={styles.counterValue}>{groupSize} {parseInt(groupSize) === 1 ? 'person' : 'people'}</Text>
          <TouchableOpacity
            style={styles.counterBtn}
            onPress={() => setGroupSize((v) => String(parseInt(v) + 1))}
          >
            <Ionicons name="add" size={20} color="#1995AD" />
          </TouchableOpacity>
        </View>

        {/* Budget */}
        <Label text="Budget" />
        <TextInput
          style={styles.input}
          placeholder="e.g. 500 USD or 750,000 RWF"
          value={budget}
          onChangeText={setBudget}
          placeholderTextColor="#aaa"
        />
        <Text style={styles.budgetHint}>Type the total budget you want the itinerary to respect.</Text>

        {/* Interests */}
        <Label text="Interests" />
        <View style={styles.interestsGrid}>
          {INTERESTS.map((interest) => {
            const active = selectedInterests.includes(interest);
            return (
              <TouchableOpacity
                key={interest}
                style={[styles.interestChip, active && styles.interestChipActive]}
                onPress={() => toggleInterest(interest)}
              >
                <Text style={[styles.interestText, active && styles.interestTextActive]}>
                  {interest}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Generate Button */}
        <TouchableOpacity
          style={[styles.generateBtn, loading && { opacity: 0.7 }]}
          onPress={handleGenerate}
          disabled={loading}
        >
          {loading ? (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
              <ActivityIndicator color="#fff" size="small" />
              <Text style={styles.generateBtnText}>Generating your itinerary...</Text>
            </View>
          ) : (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <MaterialCommunityIcons name="magic-staff" size={20} color="#fff" />
              <Text style={styles.generateBtnText}>Generate Itinerary</Text>
            </View>
          )}
        </TouchableOpacity>

        <Text style={styles.hint}>
          Your itinerary will be saved automatically so you can access it later.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

// ── Small helper components ──────────────────────────────────────────────────

const Label = ({ text }) => <Text style={styles.label}>{text}</Text>;

const DateField = ({ label, value, placeholder, onPress }) => (
  <TouchableOpacity style={styles.dateField} onPress={onPress} activeOpacity={0.85}>
    <Text style={styles.dateFieldLabel}>{label}</Text>
    <View style={styles.dateFieldValueRow}>
      <Ionicons name="calendar-outline" size={17} color="#1995AD" />
      <Text style={[styles.dateFieldValue, !value && styles.dateFieldPlaceholder]}>
        {value || placeholder}
      </Text>
    </View>
  </TouchableOpacity>
);

const ItineraryText = ({ text }) => {
  // Render markdown-ish text in a readable way
  const lines = text.split('\n');
  return (
    <View>
      {lines.map((line, i) => {
        const trimmed = line.trim();
        if (!trimmed) return <View key={i} style={{ height: 6 }} />;

        if (trimmed.startsWith('# ')) {
          return (
            <Text key={i} style={styles.itH1}>
              {trimmed.replace(/^# /, '')}
            </Text>
          );
        }
        if (trimmed.startsWith('## ')) {
          return (
            <Text key={i} style={styles.itH2}>
              {trimmed.replace(/^## /, '')}
            </Text>
          );
        }
        if (trimmed.startsWith('### ')) {
          return (
            <Text key={i} style={styles.itH3}>
              {trimmed.replace(/^### /, '')}
            </Text>
          );
        }
        if (trimmed.startsWith('**') && trimmed.endsWith('**')) {
          return (
            <Text key={i} style={styles.itBold}>
              {trimmed.replace(/\*\*/g, '')}
            </Text>
          );
        }
        if (trimmed.startsWith('> ')) {
          return (
            <View key={i} style={styles.itQuote}>
              <Text style={styles.itQuoteText}>{trimmed.replace(/^> /, '')}</Text>
            </View>
          );
        }
        if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
          return (
            <View key={i} style={styles.itBulletRow}>
              <Text style={styles.itBulletDot}>•</Text>
              <Text style={styles.itBulletText}>{trimmed.replace(/^[-*] /, '')}</Text>
            </View>
          );
        }
        if (trimmed.startsWith('---')) {
          return <View key={i} style={styles.itDivider} />;
        }
        if (trimmed.startsWith('|')) {
          // Table row — render as a simple text row
          const cells = trimmed.split('|').filter(Boolean).map((c) => c.trim());
          if (cells.every((c) => c.match(/^[-:]+$/))) return null; // skip separator row
          return (
            <View key={i} style={styles.itTableRow}>
              {cells.map((cell, j) => (
                <Text key={j} style={styles.itTableCell}>{cell}</Text>
              ))}
            </View>
          );
        }
        return (
          <Text key={i} style={styles.itBody}>
            {trimmed}
          </Text>
        );
      })}
    </View>
  );
};

// ── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#fff' },

  // Form
  formContainer: { padding: 20, paddingBottom: 40 },
  headerRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 24 },
  headerTitle: { fontSize: 20, fontWeight: '700', color: '#1a1a1a' },
  headerSub: { fontSize: 13, color: '#888', marginTop: 2 },
  label: { fontSize: 14, fontWeight: '600', color: '#333', marginTop: 18, marginBottom: 8 },
  input: {
    borderWidth: 1, borderColor: '#e0e0e0', borderRadius: 10,
    paddingHorizontal: 14, paddingVertical: 12, fontSize: 14, color: '#333',
    backgroundColor: '#fafafa',
  },
  dateRow: { flexDirection: 'row', gap: 10 },
  dateField: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 11,
    backgroundColor: '#fafafa',
  },
  dateFieldLabel: { fontSize: 11, color: '#888', marginBottom: 6, fontWeight: '600' },
  dateFieldValueRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  dateFieldValue: { flex: 1, fontSize: 13, color: '#333', fontWeight: '600' },
  dateFieldPlaceholder: { color: '#aaa', fontWeight: '400' },
  pickerPanel: {
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#e8e8e8',
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#fff',
  },
  pickerDone: {
    alignItems: 'center',
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  pickerDoneText: { color: '#1995AD', fontSize: 15, fontWeight: '700' },
  durationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 6,
    marginTop: 10,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 18,
    backgroundColor: '#E8F7FA',
  },
  durationText: { color: '#1995AD', fontSize: 13, fontWeight: '600' },
  budgetHint: { color: '#999', fontSize: 12, marginTop: 6, lineHeight: 17 },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    paddingHorizontal: 16, paddingVertical: 9,
    borderRadius: 20, borderWidth: 1, borderColor: '#ddd', backgroundColor: '#fafafa',
  },
  chipActive: { backgroundColor: '#1995AD', borderColor: '#1995AD' },
  chipText: { fontSize: 13, color: '#555' },
  chipTextActive: { color: '#fff', fontWeight: '600' },
  counterRow: { flexDirection: 'row', alignItems: 'center', gap: 20 },
  counterBtn: {
    width: 38, height: 38, borderRadius: 19,
    borderWidth: 1.5, borderColor: '#1995AD',
    justifyContent: 'center', alignItems: 'center',
  },
  counterValue: { fontSize: 16, fontWeight: '600', color: '#333', minWidth: 90, textAlign: 'center' },
  interestsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  interestChip: {
    paddingHorizontal: 14, paddingVertical: 8,
    borderRadius: 20, borderWidth: 1, borderColor: '#ddd', backgroundColor: '#fafafa',
  },
  interestChipActive: { backgroundColor: '#E8F7FA', borderColor: '#1995AD' },
  interestText: { fontSize: 13, color: '#555' },
  interestTextActive: { color: '#1995AD', fontWeight: '600' },
  generateBtn: {
    marginTop: 28, backgroundColor: '#1995AD', borderRadius: 12,
    paddingVertical: 16, alignItems: 'center',
    shadowColor: '#1995AD', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8,
    elevation: 5,
  },
  generateBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  hint: { textAlign: 'center', color: '#aaa', fontSize: 12, marginTop: 14 },

  // Result view
  resultHeader: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 12,
    borderBottomWidth: 1, borderBottomColor: '#f0f0f0',
  },
  backBtn: { padding: 4 },
  savedBtn: { padding: 4 },
  resultHeaderTitle: { fontSize: 17, fontWeight: '700', color: '#1a1a1a' },
  resultScroll: { flex: 1 },

  // Itinerary text styles
  itH1: { fontSize: 20, fontWeight: '800', color: '#1a1a1a', marginTop: 16, marginBottom: 6 },
  itH2: { fontSize: 17, fontWeight: '700', color: '#1995AD', marginTop: 18, marginBottom: 4 },
  itH3: { fontSize: 15, fontWeight: '700', color: '#333', marginTop: 12, marginBottom: 2 },
  itBold: { fontSize: 14, fontWeight: '700', color: '#333', marginVertical: 3 },
  itBody: { fontSize: 14, color: '#444', lineHeight: 22, marginVertical: 2 },
  itQuote: {
    borderLeftWidth: 3, borderLeftColor: '#1995AD',
    paddingLeft: 12, marginVertical: 6, backgroundColor: '#f0fafc', borderRadius: 4, padding: 10,
  },
  itQuoteText: { fontSize: 14, color: '#1995AD', fontStyle: 'italic', lineHeight: 20 },
  itBulletRow: { flexDirection: 'row', marginVertical: 2, paddingLeft: 4 },
  itBulletDot: { color: '#1995AD', fontSize: 16, marginRight: 8, lineHeight: 22 },
  itBulletText: { flex: 1, fontSize: 14, color: '#444', lineHeight: 22 },
  itDivider: { height: 1, backgroundColor: '#eee', marginVertical: 12 },
  itTableRow: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#eee', paddingVertical: 6 },
  itTableCell: { flex: 1, fontSize: 12, color: '#444', paddingHorizontal: 4 },
});
