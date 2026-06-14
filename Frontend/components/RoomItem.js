import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Image,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

const RoomItem = ({ item, updateRoomPrice }) => {
  const [roomCount, setRoomCount] = useState(0);

  const handleIncrement = () => {
    const newCount = roomCount + 1;
    setRoomCount(newCount);
    // FIXED: Use item.id instead of item.type to prevent overwriting
    updateRoomPrice(item.id, newCount, parseFloat(item.roomFee));
  };

  const handleDecrement = () => {
    if (roomCount > 0) {
      const newCount = roomCount - 1;
      setRoomCount(newCount);
      // FIXED: Use item.id instead of item.type to prevent overwriting
      updateRoomPrice(item.id, newCount, parseFloat(item.roomFee));
    }
  };

  return (
    <View style={styles.container}>
      {/* Room Image */}
      {item.image && (
        <Image
          source={{ uri: item.image }}
          style={styles.roomImage}
          resizeMode="cover"
        />
      )}

      {/* Room Info */}
      <View style={styles.infoContainer}>
        <View style={styles.headerRow}>
          <Text style={styles.roomType}>{item.type}</Text>
          {item.available_inventory < 5 && item.available_inventory > 0 && (
            <View style={styles.limitedBadge}>
              <Text style={styles.limitedText}>
                Only {item.available_inventory} left
              </Text>
            </View>
          )}
        </View>

        {/* Room Features */}
        <View style={styles.featuresContainer}>
          <View style={styles.feature}>
            <MaterialCommunityIcons name="account-group" size={16} color="#666" />
            <Text style={styles.featureText}>
              Max {item.max_occupancy} guests
            </Text>
          </View>

          <View style={styles.feature}>
            <Ionicons name="bed" size={16} color="#666" />
            <Text style={styles.featureText}>
              {item.num_beds} {item.num_beds === 1 ? 'bed' : 'beds'}
            </Text>
          </View>

          {item.room_size && (
            <View style={styles.feature}>
              <MaterialCommunityIcons name="floor-plan" size={16} color="#666" />
              <Text style={styles.featureText}>{item.room_size} m²</Text>
            </View>
          )}
        </View>

        {/* Description */}
        {item.description && (
          <Text style={styles.description} numberOfLines={2}>
            {item.description}
          </Text>
        )}

        {/* Price and Counter */}
        <View style={styles.bottomRow}>
          <View style={styles.priceContainer}>
            <Text style={styles.priceLabel}>Price per night</Text>
            <Text style={styles.price}>{item.currency || 'RWF'} {parseFloat(item.roomFee).toLocaleString()}</Text>
          </View>

          {item.available_inventory > 0 ? (
            <View style={styles.counterContainer}>
              <TouchableOpacity
                style={[styles.counterButton, roomCount === 0 && styles.counterButtonDisabled]}
                onPress={handleDecrement}
                disabled={roomCount === 0}
              >
                <Ionicons name="remove" size={20} color={roomCount === 0 ? "#CCC" : "#fff"} />
              </TouchableOpacity>

              <Text style={styles.counterText}>{roomCount}</Text>

              <TouchableOpacity
                style={[
                  styles.counterButton,
                  roomCount >= item.available_inventory && styles.counterButtonDisabled
                ]}
                onPress={handleIncrement}
                disabled={roomCount >= item.available_inventory}
              >
                <Ionicons
                  name="add"
                  size={20}
                  color={roomCount >= item.available_inventory ? "#CCC" : "#fff"}
                />
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.unavailableContainer}>
              <Text style={styles.unavailableText}>Not Available</Text>
            </View>
          )}
        </View>

        {/* Selected Info */}
        {roomCount > 0 && (
          <View style={styles.selectedInfo}>
            <Ionicons name="checkmark-circle" size={16} color="#4CAF50" />
            <Text style={styles.selectedText}>
              {roomCount} {roomCount === 1 ? 'room' : 'rooms'} selected - Total: {item.currency || 'RWF'}{' '}
              {(roomCount * parseFloat(item.roomFee)).toLocaleString()}
            </Text>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 15,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  roomImage: {
    width: '100%',
    height: 180,
    backgroundColor: '#F0F0F0',
  },
  infoContainer: {
    padding: 15,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  roomType: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
    flex: 1,
  },
  limitedBadge: {
    backgroundColor: '#FFF3E0',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  limitedText: {
    fontSize: 11,
    color: '#F57C00',
    fontWeight: '600',
  },
  featuresContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 10,
  },
  feature: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 15,
    marginBottom: 5,
  },
  featureText: {
    fontSize: 13,
    color: '#666',
    marginLeft: 5,
  },
  description: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 12,
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 5,
  },
  priceContainer: {
    flex: 1,
  },
  priceLabel: {
    fontSize: 12,
    color: '#999',
    marginBottom: 2,
  },
  price: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1995AD',
  },
  counterContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    padding: 4,
  },
  counterButton: {
    backgroundColor: '#1995AD',
    width: 32,
    height: 32,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  counterButtonDisabled: {
    backgroundColor: '#E0E0E0',
  },
  counterText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginHorizontal: 15,
    minWidth: 25,
    textAlign: 'center',
  },
  unavailableContainer: {
    backgroundColor: '#FFEBEE',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
  },
  unavailableText: {
    fontSize: 13,
    color: '#D32F2F',
    fontWeight: '600',
  },
  selectedInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E9',
    padding: 10,
    borderRadius: 8,
    marginTop: 12,
  },
  selectedText: {
    fontSize: 13,
    color: '#2E7D32',
    fontWeight: '500',
    marginLeft: 6,
  },
});

export default RoomItem;