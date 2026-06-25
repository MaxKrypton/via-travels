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
    const tripSummary = [
      {
        icon: 'calendar-outline',
        label: 'Dates',
        value: getTravelDateLabel(),
      },
      {
        icon: 'time-outline',
        label: 'Duration',
        value: `${getDurationDays()} ${getDurationDays() === 1 ? 'day' : 'days'}`,
      },
      {
        icon: 'people-outline',
        label: 'Group',
        value: `${parseInt(groupSize) || 1} ${parseInt(groupSize) === 1 ? 'person' : 'people'}`,
      },
      {
        icon: 'wallet-outline',
        label: 'Budget',
        value: budget.trim(),
      },
    ];

    return (
      <SafeAreaView style={styles.safe}>
        <StatusBar barStyle="dark-content" backgroundColor="#F6F9FA" />
        <View style={styles.resultHeader}>
          <TouchableOpacity onPress={handleReset} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={22} color="#1995AD" />
          </TouchableOpacity>
          <View style={styles.resultHeaderTitleWrap}>
            <Text style={styles.resultHeaderTitle}>Your Itinerary</Text>
            <Text style={styles.resultHeaderSub}>Rwanda trip plan</Text>
          </View>
          <TouchableOpacity
            onPress={() => navigation.navigate('Saved Itineraries')}
            style={styles.savedBtn}
          >
            <Ionicons name="bookmarks-outline" size={20} color="#1995AD" />
          </TouchableOpacity>
        </View>

        <ScrollView
          ref={scrollRef}
          style={styles.resultScroll}
          contentContainerStyle={styles.resultContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.resultHero}>
            <View style={styles.resultHeroIcon}>
              <MaterialCommunityIcons name="map-marker-path" size={28} color="#FFFFFF" />
            </View>
            <Text style={styles.resultHeroTitle}>Trip plan ready</Text>
            <Text style={styles.resultHeroText}>
              Built from your dates, budget, group size, and selected interests.
            </Text>
          </View>

          <View style={styles.summaryGrid}>
            {tripSummary.map((item) => (
              <View key={item.label} style={styles.summaryCard}>
                <Ionicons name={item.icon} size={18} color="#1995AD" />
                <View style={styles.summaryTextWrap}>
                  <Text style={styles.summaryLabel}>{item.label}</Text>
                  <Text style={styles.summaryValue} numberOfLines={2}>
                    {item.value}
                  </Text>
                </View>
              </View>
            ))}
          </View>

          <View style={styles.interestStrip}>
            {selectedInterests.map((interest) => (
              <View key={interest} style={styles.resultInterestChip}>
                <Text style={styles.resultInterestText}>{interest}</Text>
              </View>
            ))}
          </View>

          <View style={styles.itineraryCard}>
            <View style={styles.itineraryCardHeader}>
              <Text style={styles.itineraryCardTitle}>Detailed Schedule</Text>
              <View style={styles.savedBadge}>
                <Ionicons name="checkmark-circle" size={15} color="#1995AD" />
                <Text style={styles.savedBadgeText}>Saved</Text>
              </View>
            </View>
            <ItineraryText text={itinerary} />
          </View>
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

const cleanInlineMarkdown = (value) =>
  value
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/__(.*?)__/g, '$1')
    .replace(/`([^`]+)`/g, '$1')
    .trim();

const ItineraryText = ({ text }) => {
  // Render markdown-ish text in a readable way
  const lines = text.split('\n');
  return (
    <View style={styles.itineraryTextWrap}>
      {lines.map((line, i) => {
        const trimmed = line.trim();
        if (!trimmed) return <View key={i} style={styles.itSpacer} />;

        if (trimmed.startsWith('# ')) {
          return (
            <View key={i} style={styles.itTitleBlock}>
              <Text style={styles.itH1}>{cleanInlineMarkdown(trimmed.replace(/^# /, ''))}</Text>
            </View>
          );
        }
        if (trimmed.startsWith('## ')) {
          const title = cleanInlineMarkdown(trimmed.replace(/^## /, ''));
          const isDayHeading = /^day\s+\d+/i.test(title);
          return (
            <View key={i} style={[styles.itSectionHeader, isDayHeading && styles.itDayHeader]}>
              <View style={[styles.itSectionIcon, isDayHeading && styles.itDayIcon]}>
                <Ionicons
                  name={isDayHeading ? 'sunny-outline' : 'navigate-outline'}
                  size={16}
                  color={isDayHeading ? '#FFFFFF' : '#1995AD'}
                />
              </View>
              <Text style={[styles.itH2, isDayHeading && styles.itDayText]}>{title}</Text>
            </View>
          );
        }
        if (trimmed.startsWith('### ')) {
          return (
            <View key={i} style={styles.itSubHeader}>
              <View style={styles.itSubHeaderDot} />
              <Text style={styles.itH3}>{cleanInlineMarkdown(trimmed.replace(/^### /, ''))}</Text>
            </View>
          );
        }
        if (trimmed.startsWith('**') && trimmed.endsWith('**')) {
          return (
            <Text key={i} style={styles.itBold}>
              {cleanInlineMarkdown(trimmed)}
            </Text>
          );
        }
        if (trimmed.startsWith('> ')) {
          return (
            <View key={i} style={styles.itQuote}>
              <Ionicons name="information-circle-outline" size={17} color="#1995AD" />
              <Text style={styles.itQuoteText}>{cleanInlineMarkdown(trimmed.replace(/^> /, ''))}</Text>
            </View>
          );
        }
        if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
          return (
            <View key={i} style={styles.itBulletRow}>
              <Text style={styles.itBulletDot}>•</Text>
              <Text style={styles.itBulletText}>{cleanInlineMarkdown(trimmed.replace(/^[-*] /, ''))}</Text>
            </View>
          );
        }
        if (trimmed.startsWith('---')) {
          return <View key={i} style={styles.itDivider} />;
        }
          if (trimmed.startsWith('|')) {
            // Table row — render as a simple text row
          const cells = trimmed.split('|').filter(Boolean).map((c) => cleanInlineMarkdown(c));
          if (cells.every((c) => c.match(/^[-:]+$/))) return null; // skip separator row
          const isHeader = i === 0 || lines[i - 1]?.trim().startsWith('|') === false;
          return (
            <View key={i} style={[styles.itTableRow, isHeader && styles.itTableHeaderRow]}>
              {cells.map((cell, j) => (
                <Text key={j} style={[styles.itTableCell, isHeader && styles.itTableHeaderCell]}>
                  {cell}
                </Text>
              ))}
            </View>
          );
        }
        return (
          <Text key={i} style={styles.itBody}>
            {cleanInlineMarkdown(trimmed)}
          </Text>
        );
      })}
    </View>
  );
};

// ── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F6F9FA' },

  // Form
  formContainer: { padding: 20, paddingBottom: 40, backgroundColor: '#FFFFFF' },
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#F6F9FA',
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E8EEF0',
  },
  savedBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E8EEF0',
  },
  resultHeaderTitleWrap: { alignItems: 'center' },
  resultHeaderTitle: { fontSize: 17, fontWeight: '800', color: '#182527' },
  resultHeaderSub: { fontSize: 11, color: '#7C8B8F', marginTop: 2, fontWeight: '600' },
  resultScroll: { flex: 1, backgroundColor: '#F6F9FA' },
  resultContent: { padding: 16, paddingBottom: 40 },
  resultHero: {
    backgroundColor: '#143B43',
    borderRadius: 8,
    padding: 18,
    marginBottom: 12,
  },
  resultHeroIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#1995AD',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14,
  },
  resultHeroTitle: { color: '#FFFFFF', fontSize: 24, fontWeight: '900' },
  resultHeroText: { color: '#DDEFF2', fontSize: 13, lineHeight: 20, marginTop: 6 },
  summaryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 10,
  },
  summaryCard: {
    width: '48.5%',
    minHeight: 72,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E8EEF0',
  },
  summaryTextWrap: { flex: 1 },
  summaryLabel: {
    color: '#7C8B8F',
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  summaryValue: { color: '#1B2B2F', fontSize: 13, fontWeight: '800', marginTop: 4, lineHeight: 18 },
  interestStrip: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  resultInterestChip: {
    backgroundColor: '#E8F7FA',
    borderColor: '#B9E3EA',
    borderWidth: 1,
    borderRadius: 18,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  resultInterestText: { color: '#137F91', fontSize: 12, fontWeight: '800' },
  itineraryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E8EEF0',
  },
  itineraryCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 12,
    marginBottom: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#EEF3F4',
  },
  itineraryCardTitle: { color: '#182527', fontSize: 16, fontWeight: '900' },
  savedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#E8F7FA',
    borderRadius: 14,
    paddingHorizontal: 9,
    paddingVertical: 5,
  },
  savedBadgeText: { color: '#137F91', fontSize: 11, fontWeight: '800' },

  // Itinerary text styles
  itineraryTextWrap: { paddingTop: 4 },
  itSpacer: { height: 8 },
  itTitleBlock: {
    backgroundColor: '#F4FAFB',
    borderRadius: 8,
    padding: 12,
    marginTop: 10,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#D9EEF2',
  },
  itH1: { fontSize: 20, fontWeight: '900', color: '#102A30', lineHeight: 26 },
  itSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
    marginTop: 18,
    marginBottom: 8,
  },
  itDayHeader: {
    backgroundColor: '#1995AD',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  itSectionIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#E8F7FA',
    alignItems: 'center',
    justifyContent: 'center',
  },
  itDayIcon: { backgroundColor: 'rgba(255,255,255,0.22)' },
  itH2: { flex: 1, fontSize: 17, fontWeight: '900', color: '#137F91', lineHeight: 22 },
  itDayText: { color: '#FFFFFF' },
  itSubHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 12,
    marginBottom: 4,
  },
  itSubHeaderDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#1995AD',
  },
  itH3: { flex: 1, fontSize: 15, fontWeight: '800', color: '#22383D', lineHeight: 20 },
  itBold: { fontSize: 14, fontWeight: '800', color: '#22383D', marginVertical: 5, lineHeight: 20 },
  itBody: { fontSize: 14, color: '#415256', lineHeight: 22, marginVertical: 3 },
  itQuote: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'flex-start',
    borderLeftWidth: 3,
    borderLeftColor: '#1995AD',
    paddingLeft: 12,
    marginVertical: 8,
    backgroundColor: '#F0FAFC',
    borderRadius: 8,
    padding: 10,
  },
  itQuoteText: { flex: 1, fontSize: 14, color: '#137F91', lineHeight: 20, fontWeight: '600' },
  itBulletRow: {
    flexDirection: 'row',
    marginVertical: 3,
    paddingLeft: 2,
    paddingRight: 4,
  },
  itBulletDot: { color: '#1995AD', fontSize: 16, marginRight: 9, lineHeight: 22 },
  itBulletText: { flex: 1, fontSize: 14, color: '#415256', lineHeight: 22 },
  itDivider: { height: 1, backgroundColor: '#E4ECEE', marginVertical: 14 },
  itTableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#E8EEF0',
    backgroundColor: '#FFFFFF',
  },
  itTableHeaderRow: {
    backgroundColor: '#F4FAFB',
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    borderTopWidth: 1,
    borderTopColor: '#E8EEF0',
  },
  itTableCell: {
    flex: 1,
    fontSize: 12,
    color: '#415256',
    paddingHorizontal: 7,
    paddingVertical: 9,
    lineHeight: 16,
  },
  itTableHeaderCell: { color: '#102A30', fontWeight: '900' },
});
