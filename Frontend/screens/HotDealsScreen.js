// Frontend/screens/HotDealsScreen.js
import React, { useState, useEffect, useContext } from 'react';
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  SafeAreaView,
  RefreshControl,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import apiService from '../services/api';
import AuthContext from '../context/AuthContext';

const HotDealsScreen = () => {
  const [deals, setDeals] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const navigation = useNavigation();
  const { setCurrentID, setCurrentRoomId } = useContext(AuthContext);

  useEffect(() => {
    fetchHotDeals();
  }, []);

  const fetchHotDeals = async () => {
    try {
      const response = await apiService.discounts.getHotDeals();
      setDeals(response.data.data || []);
    } catch (error) {
      console.error('Error fetching hot deals:', error);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchHotDeals();
  };

  const calculateDiscountedPrice = (originalPrice, discountPercentage) => {
    return originalPrice - (originalPrice * discountPercentage) / 100;
  };

  const handleDealPress = (deal) => {
    setCurrentID(deal.hotel_id);
    setCurrentRoomId(deal.room_type_id);
    navigation.navigate('HotelProfile');
  };

  const renderDealItem = ({ item }) => {
    const discountedPrice = calculateDiscountedPrice(
      item.original_price || 0,
      item.discount_percentage || 0
    );

    return (
      <TouchableOpacity
        style={styles.dealCard}
        onPress={() => handleDealPress(item)}
      >
        <View style={styles.imageContainer}>
          <Image
            source={{
              uri: item.image_url || 'https://via.placeholder.com/400x200',
            }}
            style={styles.dealImage}
          />
          <View style={styles.discountBadge}>
            <Text style={styles.discountText}>
              {item.discount_percentage}% OFF
            </Text>
          </View>
          {item.is_limited_time && (
            <View style={styles.timeLimitBadge}>
              <MaterialIcons name="access-time" size={14} color="#fff" />
              <Text style={styles.timeLimitText}>Limited Time</Text>
            </View>
          )}
        </View>

        <View style={styles.dealContent}>
          <Text style={styles.hotelName} numberOfLines={1}>
            {item.hotel_name || 'Hotel Name'}
          </Text>
          <Text style={styles.roomType} numberOfLines={1}>
            {item.room_type || 'Room Type'}
          </Text>

          <View style={styles.priceContainer}>
            <View style={styles.priceRow}>
              <Text style={styles.originalPrice}>
                ${parseFloat(item.original_price || 0).toFixed(2)}
              </Text>
              <Text style={styles.discountedPrice}>
                ${discountedPrice.toFixed(2)}
              </Text>
            </View>
            <Text style={styles.perNight}>per night</Text>
          </View>

          {item.valid_until && (
            <View style={styles.validityContainer}>
              <MaterialIcons name="event" size={16} color="#666" />
              <Text style={styles.validityText}>
                Valid until {new Date(item.valid_until).toLocaleDateString()}
              </Text>
            </View>
          )}

          <View style={styles.featuresContainer}>
            {item.features?.map((feature, index) => (
              <View key={index} style={styles.featureItem}>
                <FontAwesome name="check-circle" size={14} color="#34C759" />
                <Text style={styles.featureText}>{feature}</Text>
              </View>
            ))}
          </View>

          <TouchableOpacity
            style={styles.bookButton}
            onPress={() => handleDealPress(item)}
          >
            <Text style={styles.bookButtonText}>View Deal</Text>
            <MaterialIcons name="arrow-forward" size={20} color="#fff" />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  if (isLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <MaterialIcons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Hot Deals 🔥</Text>
        <TouchableOpacity onPress={fetchHotDeals}>
          <MaterialIcons name="refresh" size={24} color="#007AFF" />
        </TouchableOpacity>
      </View>

      {deals.length === 0 ? (
        <View style={styles.emptyContainer}>
          <FontAwesome name="fire" size={80} color="#ccc" />
          <Text style={styles.emptyTitle}>No Hot Deals Available</Text>
          <Text style={styles.emptyText}>
            Check back later for amazing discounts!
          </Text>
        </View>
      ) : (
        <FlatList
          data={deals}
          renderItem={renderDealItem}
          keyExtractor={(item) => item.id || Math.random().toString()}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  list: {
    padding: 16,
  },
  dealCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    overflow: 'hidden',
  },
  imageContainer: {
    position: 'relative',
  },
  dealImage: {
    width: '100%',
    height: 200,
    resizeMode: 'cover',
  },
  discountBadge: {
    position: 'absolute',
    top: 16,
    right: 16,
    backgroundColor: '#FF3B30',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  discountText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  timeLimitBadge: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  timeLimitText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  dealContent: {
    padding: 16,
  },
  hotelName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  roomType: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  priceContainer: {
    marginBottom: 12,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  originalPrice: {
    fontSize: 16,
    color: '#999',
    textDecorationLine: 'line-through',
  },
  discountedPrice: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  perNight: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  validityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
  },
  validityText: {
    fontSize: 12,
    color: '#666',
  },
  featuresContainer: {
    marginBottom: 16,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  featureText: {
    fontSize: 14,
    color: '#333',
  },
  bookButton: {
    backgroundColor: '#007AFF',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
  },
  bookButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
});

export default HotDealsScreen;