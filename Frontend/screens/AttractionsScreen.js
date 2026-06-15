import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  SafeAreaView,
  StatusBar,
  RefreshControl,
  Modal,
  ScrollView,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import apiService from '../services/api';

const CATEGORIES = [
  { key: '', label: 'All', icon: 'globe-outline' },
  { key: 'attraction', label: 'Attractions', icon: 'binoculars' },
  { key: 'accommodation', label: 'Stay', icon: 'bed-outline' },
  { key: 'activity', label: 'Activities', icon: 'walk' },
  { key: 'transport', label: 'Transport', icon: 'car-outline' },
  { key: 'permit', label: 'Permits', icon: 'document-text-outline' },
];

const CATEGORY_COLORS = {
  attraction: '#E8F5E9',
  accommodation: '#E3F2FD',
  activity: '#FFF3E0',
  transport: '#F3E5F5',
  permit: '#FCE4EC',
  '': '#F5F5F5',
};

const CATEGORY_TEXT_COLORS = {
  attraction: '#2E7D32',
  accommodation: '#1565C0',
  activity: '#E65100',
  transport: '#6A1B9A',
  permit: '#880E4F',
  '': '#666',
};

export default function AttractionsScreen() {
  const [entries, setEntries] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [activeCategory, setActiveCategory] = useState('');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState(null);

  const fetchEntries = useCallback(async (showRefresh = false) => {
    if (showRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      const response = await apiService.tourism.getEntries();
      const data = response.data?.data || [];
      setEntries(data);
      applyFilters(data, activeCategory, search);
    } catch (err) {
      console.error('Failed to fetch entries:', err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [activeCategory, search]);

  useEffect(() => {
    fetchEntries();
  }, []);

  const applyFilters = (data, category, query) => {
    let result = data;
    if (category) result = result.filter((e) => e.category === category);
    if (query.trim()) {
      const q = query.toLowerCase();
      result = result.filter(
        (e) =>
          e.name?.toLowerCase().includes(q) ||
          e.description?.toLowerCase().includes(q) ||
          e.location?.toLowerCase().includes(q)
      );
    }
    setFiltered(result);
  };

  const handleCategoryChange = (cat) => {
    setActiveCategory(cat);
    applyFilters(entries, cat, search);
  };

  const handleSearch = (text) => {
    setSearch(text);
    applyFilters(entries, activeCategory, text);
  };

  const renderEntry = ({ item }) => (
    <TouchableOpacity style={styles.card} onPress={() => setSelectedEntry(item)} activeOpacity={0.85}>
      <View style={styles.cardHeader}>
        <View style={[styles.categoryBadge, { backgroundColor: CATEGORY_COLORS[item.category] || CATEGORY_COLORS[''] }]}>
          <Text style={[styles.categoryBadgeText, { color: CATEGORY_TEXT_COLORS[item.category] || '#666' }]}>
            {item.category}
          </Text>
        </View>
        {item.price_usd > 0 && (
          <Text style={styles.price}>${item.price_usd}</Text>
        )}
        {item.price_usd === 0 && (
          <Text style={[styles.price, { color: '#2E7D32' }]}>Free</Text>
        )}
      </View>
      <Text style={styles.cardTitle}>{item.name}</Text>
      <View style={styles.locationRow}>
        <Ionicons name="location-outline" size={13} color="#888" />
        <Text style={styles.locationText}>{item.location}</Text>
      </View>
      <Text style={styles.cardDesc} numberOfLines={2}>{item.description}</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Explore Rwanda</Text>
        <Text style={styles.headerSub}>{filtered.length} places to discover</Text>
      </View>

      {/* Search */}
      <View style={styles.searchBox}>
        <Ionicons name="search-outline" size={18} color="#aaa" />
        <TextInput
          style={styles.searchInput}
          placeholder="Search attractions, places..."
          value={search}
          onChangeText={handleSearch}
          placeholderTextColor="#bbb"
        />
        {search.length > 0 && (
          <TouchableOpacity onPress={() => handleSearch('')}>
            <Ionicons name="close-circle" size={18} color="#ccc" />
          </TouchableOpacity>
        )}
      </View>

      {/* Category filter */}
      <FlatList
        horizontal
        showsHorizontalScrollIndicator={false}
        data={CATEGORIES}
        keyExtractor={(c) => c.key}
        contentContainerStyle={styles.catList}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.catChip, activeCategory === item.key && styles.catChipActive]}
            onPress={() => handleCategoryChange(item.key)}
          >
            <Ionicons
              name={item.icon}
              size={14}
              color={activeCategory === item.key ? '#fff' : '#666'}
              style={{ marginRight: 4 }}
            />
            <Text style={[styles.catChipText, activeCategory === item.key && styles.catChipTextActive]}>
              {item.label}
            </Text>
          </TouchableOpacity>
        )}
      />

      {/* List */}
      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#1995AD" />
          <Text style={styles.loadingText}>Loading Rwanda's best places...</Text>
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id}
          renderItem={renderEntry}
          contentContainerStyle={{ padding: 16, paddingBottom: 30 }}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={() => fetchEntries(true)} colors={['#1995AD']} />
          }
          ListEmptyComponent={
            <View style={styles.center}>
              <MaterialCommunityIcons name="map-marker-off-outline" size={48} color="#ddd" />
              <Text style={styles.emptyText}>No results found</Text>
            </View>
          }
        />
      )}

      {/* Detail Modal */}
      <Modal
        visible={!!selectedEntry}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setSelectedEntry(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <TouchableOpacity style={styles.modalClose} onPress={() => setSelectedEntry(null)}>
              <Ionicons name="close" size={22} color="#555" />
            </TouchableOpacity>
            {selectedEntry && (
              <ScrollView showsVerticalScrollIndicator={false}>
                <View style={[styles.categoryBadge, { backgroundColor: CATEGORY_COLORS[selectedEntry.category], alignSelf: 'flex-start', marginBottom: 10 }]}>
                  <Text style={[styles.categoryBadgeText, { color: CATEGORY_TEXT_COLORS[selectedEntry.category] }]}>
                    {selectedEntry.category}
                  </Text>
                </View>
                <Text style={styles.modalTitle}>{selectedEntry.name}</Text>
                <View style={styles.locationRow}>
                  <Ionicons name="location-outline" size={14} color="#888" />
                  <Text style={styles.locationText}>{selectedEntry.location}</Text>
                </View>
                <Text style={styles.modalDesc}>{selectedEntry.description}</Text>

                <View style={styles.modalInfoRow}>
                  <InfoItem icon="cash-outline" label="Price (USD)" value={selectedEntry.price_usd > 0 ? `$${selectedEntry.price_usd}` : 'Free'} />
                  <InfoItem icon="cellular-outline" label="Price (RWF)" value={selectedEntry.price_rwf > 0 ? `${selectedEntry.price_rwf.toLocaleString()} RWF` : 'Free'} />
                </View>
                {selectedEntry.contact && (
                  <View style={styles.contactRow}>
                    <Ionicons name="call-outline" size={15} color="#1995AD" />
                    <Text style={styles.contactText}>{selectedEntry.contact}</Text>
                  </View>
                )}
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const InfoItem = ({ icon, label, value }) => (
  <View style={styles.infoItem}>
    <Ionicons name={icon} size={16} color="#1995AD" />
    <Text style={styles.infoLabel}>{label}</Text>
    <Text style={styles.infoValue}>{value}</Text>
  </View>
);

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#fff' },
  header: { paddingHorizontal: 16, paddingTop: 14, paddingBottom: 6 },
  headerTitle: { fontSize: 22, fontWeight: '800', color: '#1a1a1a' },
  headerSub: { fontSize: 13, color: '#888', marginTop: 2 },
  searchBox: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    marginHorizontal: 16, marginVertical: 10,
    backgroundColor: '#f5f5f5', borderRadius: 12,
    paddingHorizontal: 12, paddingVertical: 10,
    borderWidth: 1, borderColor: '#ebebeb',
  },
  searchInput: { flex: 1, fontSize: 14, color: '#333' },
  catList: { paddingHorizontal: 12, paddingBottom: 6, gap: 8 },
  catChip: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 12, paddingVertical: 7,
    borderRadius: 20, borderWidth: 1, borderColor: '#ddd', backgroundColor: '#fafafa',
  },
  catChipActive: { backgroundColor: '#1995AD', borderColor: '#1995AD' },
  catChipText: { fontSize: 13, color: '#666' },
  catChipTextActive: { color: '#fff', fontWeight: '600' },

  // Cards
  card: {
    backgroundColor: '#fff', borderRadius: 14, padding: 14,
    marginBottom: 12, borderWidth: 1, borderColor: '#efefef',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 6, elevation: 2,
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  categoryBadge: { paddingHorizontal: 10, paddingVertical: 3, borderRadius: 20 },
  categoryBadgeText: { fontSize: 11, fontWeight: '600', textTransform: 'capitalize' },
  price: { fontSize: 14, fontWeight: '700', color: '#1995AD' },
  cardTitle: { fontSize: 16, fontWeight: '700', color: '#1a1a1a', marginBottom: 4 },
  locationRow: { flexDirection: 'row', alignItems: 'center', gap: 3, marginBottom: 6 },
  locationText: { fontSize: 12, color: '#888' },
  cardDesc: { fontSize: 13, color: '#666', lineHeight: 18 },

  // Loading / Empty
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingTop: 60, gap: 10 },
  loadingText: { color: '#aaa', fontSize: 13, marginTop: 8 },
  emptyText: { color: '#bbb', fontSize: 15, marginTop: 8 },

  // Modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  modalCard: {
    backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24,
    padding: 24, maxHeight: '80%',
  },
  modalClose: { alignSelf: 'flex-end', padding: 4, marginBottom: 8 },
  modalTitle: { fontSize: 20, fontWeight: '800', color: '#1a1a1a', marginBottom: 6 },
  modalDesc: { fontSize: 14, color: '#555', lineHeight: 22, marginTop: 12, marginBottom: 16 },
  modalInfoRow: { flexDirection: 'row', gap: 12, marginBottom: 12 },
  infoItem: { flex: 1, alignItems: 'center', backgroundColor: '#f5fbfc', borderRadius: 10, padding: 12, gap: 4 },
  infoLabel: { fontSize: 11, color: '#888' },
  infoValue: { fontSize: 14, fontWeight: '700', color: '#1995AD' },
  contactRow: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingTop: 4 },
  contactText: { fontSize: 13, color: '#1995AD' },
});