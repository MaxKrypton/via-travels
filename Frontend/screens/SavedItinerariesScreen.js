import React, { useState, useEffect, useCallback, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  SafeAreaView,
  StatusBar,
  RefreshControl,
  Modal,
  ScrollView,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import apiService from '../services/api';
import AuthContext from '../context/AuthContext';

const cleanInlineMarkdown = (value = '') =>
  value
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/__(.*?)__/g, '$1')
    .replace(/`([^`]+)`/g, '$1')
    .trim();

const getItineraryText = (item) => item?.itinerary || item?.rawText || '';

const getPreviewText = (item) =>
  cleanInlineMarkdown(getItineraryText(item))
    .replace(/^#{1,3}\s*/gm, '')
    .replace(/^[-*]\s*/gm, '')
    .replace(/[|>]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

const getItineraryTitle = (item) => {
  const text = getItineraryText(item);
  const heading = text
    .split('\n')
    .map((line) => line.trim())
    .find((line) => line.startsWith('#') || /^day\s+\d+/i.test(cleanInlineMarkdown(line)));

  if (!heading) return 'Rwanda itinerary';
  return cleanInlineMarkdown(heading.replace(/^#{1,3}\s*/, ''));
};

const formatDate = (iso) => {
  if (!iso) return 'Recent';
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return 'Recent';
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

const formatListDate = (iso) => {
  if (!iso) return '';
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
};

const DetailChip = ({ icon, label }) => (
  <View style={styles.detailChip}>
    <Ionicons name={icon} size={14} color="#1995AD" />
    <Text style={styles.detailChipText} numberOfLines={1}>
      {label}
    </Text>
  </View>
);

export default function SavedItinerariesScreen({ navigation }) {
  const { isAuthenticated } = useContext(AuthContext);
  const [itineraries, setItineraries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selected, setSelected] = useState(null);

  const fetchSaved = useCallback(async (showRefresh = false) => {
    if (showRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      const response = await apiService.tourism.getSavedItineraries();
      const saved = response.data?.data || [];
      setItineraries(
        [...saved].sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0))
      );
    } catch (err) {
      console.error('Failed to load saved itineraries:', err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) fetchSaved();
  }, [fetchSaved, isAuthenticated]);

  const renderItem = ({ item, index }) => {
    const preview = getPreviewText(item);
    const interests = Array.isArray(item.interests) ? item.interests : [];

    return (
      <TouchableOpacity style={styles.card} onPress={() => setSelected(item)} activeOpacity={0.88}>
        <View style={styles.cardAccent} />
        <View style={styles.cardTop}>
          <View style={styles.cardIcon}>
            <MaterialCommunityIcons name="map-marker-path" size={22} color="#FFFFFF" />
          </View>
          <View style={styles.cardTitleWrap}>
            <Text style={styles.cardTitle} numberOfLines={2}>
              {getItineraryTitle(item)}
            </Text>
            <Text style={styles.cardDate}>{formatListDate(item.created_at)}</Text>
          </View>
          <View style={styles.cardCountBadge}>
            <Text style={styles.cardCountText}>{String(index + 1).padStart(2, '0')}</Text>
          </View>
        </View>

        <Text style={styles.cardPreview} numberOfLines={3}>
          {preview || 'Open this saved itinerary to view the complete trip plan.'}
        </Text>

        <View style={styles.cardMeta}>
          {!!item.durationDays && (
            <DetailChip
              icon="time-outline"
              label={`${item.durationDays} ${item.durationDays === 1 ? 'day' : 'days'}`}
            />
          )}
          {!!item.groupSize && (
            <DetailChip
              icon="people-outline"
              label={`${item.groupSize} ${item.groupSize === 1 ? 'person' : 'people'}`}
            />
          )}
          {!!item.budget && <DetailChip icon="wallet-outline" label={item.budget} />}
        </View>

        {interests.length > 0 && (
          <View style={styles.cardInterests}>
            {interests.slice(0, 3).map((interest) => (
              <View key={interest} style={styles.interestPill}>
                <Text style={styles.interestPillText}>{interest}</Text>
              </View>
            ))}
            {interests.length > 3 && (
              <View style={styles.interestPill}>
                <Text style={styles.interestPillText}>+{interests.length - 3}</Text>
              </View>
            )}
          </View>
        )}

        <View style={styles.cardFooter}>
          <Text style={styles.cardCta}>View itinerary</Text>
          <Ionicons name="chevron-forward" size={17} color="#1995AD" />
        </View>
      </TouchableOpacity>
    );
  };

  if (!isAuthenticated) {
    return (
      <SafeAreaView style={styles.safe}>
        <StatusBar barStyle="dark-content" backgroundColor="#F6F9FA" />
        <View style={styles.center}>
          <View style={styles.emptyIcon}>
            <MaterialCommunityIcons name="lock-outline" size={34} color="#1995AD" />
          </View>
          <Text style={styles.emptyTitle}>Sign in to see saved itineraries</Text>
          <Text style={styles.emptySub}>Your generated Rwanda trip plans will appear here.</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor="#F6F9FA" />

      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Saved Itineraries</Text>
          <Text style={styles.headerSub}>
            {itineraries.length} {itineraries.length === 1 ? 'trip plan' : 'trip plans'}
          </Text>
        </View>
        <TouchableOpacity onPress={() => navigation.navigate('Plan Main')} style={styles.newBtn}>
          <Ionicons name="add" size={18} color="#FFFFFF" />
          <Text style={styles.newBtnText}>New</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#1995AD" />
          <Text style={styles.loadingText}>Loading saved trips...</Text>
        </View>
      ) : (
        <FlatList
          data={itineraries}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={() => fetchSaved(true)} colors={['#1995AD']} />
          }
          ListEmptyComponent={
            <View style={styles.center}>
              <View style={styles.emptyIcon}>
                <MaterialCommunityIcons name="calendar-blank-outline" size={36} color="#1995AD" />
              </View>
              <Text style={styles.emptyTitle}>No saved itineraries yet</Text>
              <Text style={styles.emptySub}>Generate your first Rwanda itinerary to get started.</Text>
              <TouchableOpacity style={styles.generateBtn} onPress={() => navigation.navigate('Plan Main')}>
                <MaterialCommunityIcons name="magic-staff" size={18} color="#FFFFFF" />
                <Text style={styles.generateBtnText}>Plan a Trip</Text>
              </TouchableOpacity>
            </View>
          }
        />
      )}

      <Modal
        visible={!!selected}
        animationType="slide"
        onRequestClose={() => setSelected(null)}
      >
        <SafeAreaView style={styles.modalSafe}>
          <StatusBar barStyle="dark-content" backgroundColor="#F6F9FA" />
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setSelected(null)} style={styles.modalIconBtn}>
              <Ionicons name="arrow-back" size={22} color="#1995AD" />
            </TouchableOpacity>
            <View style={styles.modalTitleWrap}>
              <Text style={styles.modalTitle}>Saved Itinerary</Text>
              <Text style={styles.modalDate}>{formatDate(selected?.created_at)}</Text>
            </View>
            <TouchableOpacity onPress={() => fetchSaved(true)} style={styles.modalIconBtn}>
              <Ionicons name="refresh" size={20} color="#1995AD" />
            </TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={styles.modalContent} showsVerticalScrollIndicator={false}>
            {selected && (
              <>
                <View style={styles.modalHero}>
                  <View style={styles.modalHeroIcon}>
                    <MaterialCommunityIcons name="map-check-outline" size={28} color="#FFFFFF" />
                  </View>
                  <Text style={styles.modalHeroTitle}>{getItineraryTitle(selected)}</Text>
                  <Text style={styles.modalHeroText}>
                    Saved from your generated Rwanda travel plan.
                  </Text>
                </View>

                <View style={styles.summaryGrid}>
                  {!!selected.travelDates && (
                    <SummaryCard icon="calendar-outline" label="Dates" value={selected.travelDates} />
                  )}
                  {!!selected.durationDays && (
                    <SummaryCard
                      icon="time-outline"
                      label="Duration"
                      value={`${selected.durationDays} ${selected.durationDays === 1 ? 'day' : 'days'}`}
                    />
                  )}
                  {!!selected.groupSize && (
                    <SummaryCard
                      icon="people-outline"
                      label="Group"
                      value={`${selected.groupSize} ${selected.groupSize === 1 ? 'person' : 'people'}`}
                    />
                  )}
                  {!!selected.budget && (
                    <SummaryCard icon="wallet-outline" label="Budget" value={selected.budget} />
                  )}
                </View>

                {Array.isArray(selected.interests) && selected.interests.length > 0 && (
                  <View style={styles.modalInterests}>
                    {selected.interests.map((interest) => (
                      <View key={interest} style={styles.modalInterestChip}>
                        <Text style={styles.modalInterestText}>{interest}</Text>
                      </View>
                    ))}
                  </View>
                )}

                <View style={styles.itineraryCard}>
                  <View style={styles.itineraryCardHeader}>
                    <Text style={styles.itineraryCardTitle}>Detailed Schedule</Text>
                    <View style={styles.savedBadge}>
                      <Ionicons name="bookmark" size={14} color="#1995AD" />
                      <Text style={styles.savedBadgeText}>Saved</Text>
                    </View>
                  </View>
                  <ItineraryTextRenderer text={getItineraryText(selected)} />
                </View>
              </>
            )}
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const SummaryCard = ({ icon, label, value }) => (
  <View style={styles.summaryCard}>
    <Ionicons name={icon} size={18} color="#1995AD" />
    <View style={styles.summaryTextWrap}>
      <Text style={styles.summaryLabel}>{label}</Text>
      <Text style={styles.summaryValue} numberOfLines={2}>
        {value}
      </Text>
    </View>
  </View>
);

const ItineraryTextRenderer = ({ text }) => {
  if (!text) return null;
  const lines = text.split('\n');

  return (
    <View style={styles.itineraryTextWrap}>
      {lines.map((line, i) => {
        const t = line.trim();
        if (!t) return <View key={i} style={styles.itSpacer} />;

        if (t.startsWith('# ')) {
          return (
            <View key={i} style={styles.itTitleBlock}>
              <Text style={styles.itH1}>{cleanInlineMarkdown(t.replace(/^# /, ''))}</Text>
            </View>
          );
        }

        if (t.startsWith('## ')) {
          const title = cleanInlineMarkdown(t.replace(/^## /, ''));
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

        if (t.startsWith('### ')) {
          return (
            <View key={i} style={styles.itSubHeader}>
              <View style={styles.itSubHeaderDot} />
              <Text style={styles.itH3}>{cleanInlineMarkdown(t.replace(/^### /, ''))}</Text>
            </View>
          );
        }

        if (t.startsWith('**') && t.endsWith('**')) {
          return (
            <Text key={i} style={styles.itBold}>
              {cleanInlineMarkdown(t)}
            </Text>
          );
        }

        if (t.startsWith('> ')) {
          return (
            <View key={i} style={styles.itQuote}>
              <Ionicons name="information-circle-outline" size={17} color="#1995AD" />
              <Text style={styles.itQuoteText}>{cleanInlineMarkdown(t.replace(/^> /, ''))}</Text>
            </View>
          );
        }

        if (t.startsWith('- ') || t.startsWith('* ')) {
          return (
            <View key={i} style={styles.itBulletRow}>
              <Text style={styles.itBulletDot}>•</Text>
              <Text style={styles.itBulletText}>{cleanInlineMarkdown(t.replace(/^[-*] /, ''))}</Text>
            </View>
          );
        }

        if (t.startsWith('---')) return <View key={i} style={styles.itDivider} />;

        if (t.startsWith('|')) {
          const cells = t.split('|').filter(Boolean).map((cell) => cleanInlineMarkdown(cell));
          if (cells.every((cell) => cell.match(/^[-:]+$/))) return null;
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
            {cleanInlineMarkdown(t)}
          </Text>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F6F9FA' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 12,
    backgroundColor: '#F6F9FA',
  },
  headerTitle: { fontSize: 24, fontWeight: '900', color: '#182527' },
  headerSub: { color: '#7C8B8F', fontSize: 12, fontWeight: '700', marginTop: 3 },
  newBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#1995AD',
    borderRadius: 18,
    paddingHorizontal: 13,
    paddingVertical: 9,
  },
  newBtnText: { color: '#FFFFFF', fontWeight: '800', fontSize: 13 },
  listContent: { padding: 16, paddingBottom: 30, flexGrow: 1 },

  card: {
    position: 'relative',
    overflow: 'hidden',
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 15,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E8EEF0',
  },
  cardAccent: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 4,
    backgroundColor: '#1995AD',
  },
  cardTop: { flexDirection: 'row', alignItems: 'center', gap: 11, marginBottom: 10 },
  cardIcon: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#1995AD',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardTitleWrap: { flex: 1 },
  cardTitle: { color: '#182527', fontSize: 16, fontWeight: '900', lineHeight: 21 },
  cardDate: { color: '#7C8B8F', fontSize: 12, fontWeight: '700', marginTop: 3 },
  cardCountBadge: {
    minWidth: 34,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#EEF8FA',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  cardCountText: { color: '#1995AD', fontSize: 12, fontWeight: '900' },
  cardPreview: { fontSize: 13, color: '#56676B', lineHeight: 20, marginBottom: 12 },
  cardMeta: { flexDirection: 'row', flexWrap: 'wrap', gap: 7, marginBottom: 10 },
  detailChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#F4FAFB',
    borderRadius: 16,
    paddingHorizontal: 9,
    paddingVertical: 6,
    maxWidth: '100%',
  },
  detailChipText: { color: '#375056', fontSize: 11, fontWeight: '800', maxWidth: 150 },
  cardInterests: { flexDirection: 'row', flexWrap: 'wrap', gap: 7, marginBottom: 12 },
  interestPill: {
    backgroundColor: '#E8F7FA',
    borderRadius: 14,
    paddingHorizontal: 9,
    paddingVertical: 5,
  },
  interestPillText: { color: '#137F91', fontSize: 11, fontWeight: '800', textTransform: 'capitalize' },
  cardFooter: {
    borderTopWidth: 1,
    borderTopColor: '#EEF3F4',
    paddingTop: 11,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardCta: { color: '#1995AD', fontSize: 13, fontWeight: '900' },

  center: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 10, padding: 30 },
  loadingText: { color: '#7C8B8F', fontSize: 13, fontWeight: '700' },
  emptyIcon: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#E8F7FA',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  emptyTitle: { fontSize: 18, fontWeight: '900', color: '#263B40', textAlign: 'center' },
  emptySub: { fontSize: 13, color: '#7C8B8F', textAlign: 'center', marginTop: 2, lineHeight: 19 },
  generateBtn: {
    marginTop: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    backgroundColor: '#1995AD',
    borderRadius: 8,
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  generateBtnText: { color: '#FFFFFF', fontWeight: '900', fontSize: 14 },

  modalSafe: { flex: 1, backgroundColor: '#F6F9FA' },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#F6F9FA',
  },
  modalIconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E8EEF0',
  },
  modalTitleWrap: { alignItems: 'center', flex: 1 },
  modalTitle: { fontSize: 17, fontWeight: '900', color: '#182527' },
  modalDate: { fontSize: 11, color: '#7C8B8F', marginTop: 2, fontWeight: '700' },
  modalContent: { padding: 16, paddingBottom: 40 },
  modalHero: {
    backgroundColor: '#143B43',
    borderRadius: 8,
    padding: 18,
    marginBottom: 12,
  },
  modalHeroIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#1995AD',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14,
  },
  modalHeroTitle: { color: '#FFFFFF', fontSize: 23, fontWeight: '900', lineHeight: 29 },
  modalHeroText: { color: '#DDEFF2', fontSize: 13, lineHeight: 20, marginTop: 6 },
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
  modalInterests: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  modalInterestChip: {
    backgroundColor: '#E8F7FA',
    borderColor: '#B9E3EA',
    borderWidth: 1,
    borderRadius: 18,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  modalInterestText: { color: '#137F91', fontSize: 12, fontWeight: '800', textTransform: 'capitalize' },
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
