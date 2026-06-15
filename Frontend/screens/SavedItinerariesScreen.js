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
      setItineraries(response.data?.data || []);
    } catch (err) {
      console.error('Failed to load saved itineraries:', err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) fetchSaved();
  }, [isAuthenticated]);

  const formatDate = (iso) => {
    if (!iso) return '';
    const d = new Date(iso);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity style={styles.card} onPress={() => setSelected(item)} activeOpacity={0.85}>
      <View style={styles.cardTop}>
        <MaterialCommunityIcons name="map-marker-path" size={20} color="#1995AD" />
        <Text style={styles.cardDate}>{formatDate(item.created_at)}</Text>
      </View>
      <Text style={styles.cardPreview} numberOfLines={3}>
        {(item.itinerary || item.rawText || '').replace(/[#*>]/g, '').replace(/\n+/g, ' ').trim()}
      </Text>
      <View style={styles.cardFooter}>
        <Ionicons name="chevron-forward-outline" size={16} color="#1995AD" />
        <Text style={styles.cardCta}>View itinerary</Text>
      </View>
    </TouchableOpacity>
  );

  if (!isAuthenticated) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.center}>
          <MaterialCommunityIcons name="lock-outline" size={48} color="#ddd" />
          <Text style={styles.emptyTitle}>Sign in to see saved itineraries</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      <View style={styles.header}>
        <Text style={styles.headerTitle}>Saved Itineraries</Text>
        <TouchableOpacity onPress={() => navigation.navigate('Plan Main')} style={styles.newBtn}>
          <Ionicons name="add" size={18} color="#1995AD" />
          <Text style={styles.newBtnText}>New</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#1995AD" />
        </View>
      ) : (
        <FlatList
          data={itineraries}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={{ padding: 16, paddingBottom: 30, flexGrow: 1 }}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={() => fetchSaved(true)} colors={['#1995AD']} />
          }
          ListEmptyComponent={
            <View style={styles.center}>
              <MaterialCommunityIcons name="calendar-blank-outline" size={52} color="#e0e0e0" />
              <Text style={styles.emptyTitle}>No saved itineraries yet</Text>
              <Text style={styles.emptySub}>Generate your first Rwanda itinerary to get started</Text>
              <TouchableOpacity style={styles.generateBtn} onPress={() => navigation.navigate('Plan Main')}>
                <Text style={styles.generateBtnText}>Plan a Trip</Text>
              </TouchableOpacity>
            </View>
          }
        />
      )}

      {/* Full itinerary modal */}
      <Modal
        visible={!!selected}
        animationType="slide"
        onRequestClose={() => setSelected(null)}
      >
        <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setSelected(null)}>
              <Ionicons name="arrow-back" size={22} color="#1995AD" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Saved Itinerary</Text>
            <Text style={styles.modalDate}>{formatDate(selected?.created_at)}</Text>
          </View>
          <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
            {selected && <ItineraryTextRenderer text={selected.itinerary || selected.rawText} />}
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

// Inline text renderer (same logic as ItineraryScreen)
const ItineraryTextRenderer = ({ text }) => {
  if (!text) return null;
  const lines = text.split('\n');
  return (
    <View>
      {lines.map((line, i) => {
        const t = line.trim();
        if (!t) return <View key={i} style={{ height: 6 }} />;
        if (t.startsWith('# ')) return <Text key={i} style={rStyles.h1}>{t.replace(/^# /, '')}</Text>;
        if (t.startsWith('## ')) return <Text key={i} style={rStyles.h2}>{t.replace(/^## /, '')}</Text>;
        if (t.startsWith('### ')) return <Text key={i} style={rStyles.h3}>{t.replace(/^### /, '')}</Text>;
        if (t.startsWith('**') && t.endsWith('**')) return <Text key={i} style={rStyles.bold}>{t.replace(/\*\*/g, '')}</Text>;
        if (t.startsWith('> ')) return <View key={i} style={rStyles.quote}><Text style={rStyles.quoteText}>{t.replace(/^> /, '')}</Text></View>;
        if (t.startsWith('- ') || t.startsWith('* ')) return (
          <View key={i} style={rStyles.bulletRow}>
            <Text style={rStyles.dot}>•</Text>
            <Text style={rStyles.bulletText}>{t.replace(/^[-*] /, '')}</Text>
          </View>
        );
        if (t.startsWith('---')) return <View key={i} style={rStyles.divider} />;
        if (t.startsWith('|')) {
          const cells = t.split('|').filter(Boolean).map((c) => c.trim());
          if (cells.every((c) => c.match(/^[-:]+$/))) return null;
          return (
            <View key={i} style={rStyles.tableRow}>
              {cells.map((cell, j) => <Text key={j} style={rStyles.tableCell}>{cell}</Text>)}
            </View>
          );
        }
        return <Text key={i} style={rStyles.body}>{t}</Text>;
      })}
    </View>
  );
};

const rStyles = StyleSheet.create({
  h1: { fontSize: 20, fontWeight: '800', color: '#1a1a1a', marginTop: 16, marginBottom: 6 },
  h2: { fontSize: 17, fontWeight: '700', color: '#1995AD', marginTop: 18, marginBottom: 4 },
  h3: { fontSize: 15, fontWeight: '700', color: '#333', marginTop: 12, marginBottom: 2 },
  bold: { fontSize: 14, fontWeight: '700', color: '#333', marginVertical: 3 },
  body: { fontSize: 14, color: '#444', lineHeight: 22, marginVertical: 2 },
  quote: { borderLeftWidth: 3, borderLeftColor: '#1995AD', paddingLeft: 12, marginVertical: 6, backgroundColor: '#f0fafc', borderRadius: 4, padding: 10 },
  quoteText: { fontSize: 14, color: '#1995AD', fontStyle: 'italic', lineHeight: 20 },
  bulletRow: { flexDirection: 'row', marginVertical: 2, paddingLeft: 4 },
  dot: { color: '#1995AD', fontSize: 16, marginRight: 8, lineHeight: 22 },
  bulletText: { flex: 1, fontSize: 14, color: '#444', lineHeight: 22 },
  divider: { height: 1, backgroundColor: '#eee', marginVertical: 12 },
  tableRow: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#eee', paddingVertical: 6 },
  tableCell: { flex: 1, fontSize: 12, color: '#444', paddingHorizontal: 4 },
});

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#fff' },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 16, paddingTop: 14, paddingBottom: 10,
    borderBottomWidth: 1, borderBottomColor: '#f0f0f0',
  },
  headerTitle: { fontSize: 22, fontWeight: '800', color: '#1a1a1a' },
  newBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, padding: 6 },
  newBtnText: { color: '#1995AD', fontWeight: '600', fontSize: 14 },

  card: {
    backgroundColor: '#fff', borderRadius: 14, padding: 16, marginBottom: 12,
    borderWidth: 1, borderColor: '#efefef',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05, shadowRadius: 6, elevation: 2,
  },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  cardDate: { fontSize: 12, color: '#aaa' },
  cardPreview: { fontSize: 13, color: '#555', lineHeight: 20, marginBottom: 10 },
  cardFooter: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  cardCta: { color: '#1995AD', fontSize: 13, fontWeight: '600' },

  center: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 10, padding: 30 },
  emptyTitle: { fontSize: 17, fontWeight: '700', color: '#aaa', textAlign: 'center' },
  emptySub: { fontSize: 13, color: '#bbb', textAlign: 'center', marginTop: 4 },
  generateBtn: { marginTop: 16, backgroundColor: '#1995AD', borderRadius: 10, paddingHorizontal: 24, paddingVertical: 12 },
  generateBtnText: { color: '#fff', fontWeight: '700', fontSize: 14 },

  modalHeader: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 12,
    borderBottomWidth: 1, borderBottomColor: '#f0f0f0',
  },
  modalTitle: { fontSize: 17, fontWeight: '700', color: '#1a1a1a' },
  modalDate: { fontSize: 12, color: '#aaa' },
});
