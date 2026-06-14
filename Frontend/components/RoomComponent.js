import { View, Text, TouchableOpacity, Image, FlatList, StyleSheet } from 'react-native'
import React, { useContext, useEffect, useState } from 'react'
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import axios from "axios"
import AuthContext from '../context/AuthContext';

const RoomComponent = ({roomInfo}) => {

  const {currentID, currentRoomId, setCurrentRoomId, ip} = useContext(AuthContext)
  const [room, setRoom] = useState()
  
useEffect(() =>{
  // Getting The Room
  const url = `http://${ip}:8000/api/v1/hotels/rooms/${currentID}`
  axios.get(url)
  .then((response) =>{
    const results = response.data
    const roomDetail = results.data
    setRoom(roomDetail)
  })
  .catch((error) =>{
    console.log("This is the error ",error);
  })
}, [])

  return (
    <FlatList 
      data={roomInfo}
      keyExtractor={(item, index) => item?.id?.toString() || `room-${index}`}
      contentContainerStyle={styles.listContainer}
      renderItem={({item}) =>{
        return (
          <View style={styles.roomCard}>
            {/* Main Card Container */}
            <View style={styles.cardContent}>
              {/* Image */}
              <Image
                source={require("../assets/images/singel.jpeg")}
                style={styles.roomImage}
              />
              
              {/* Details Container */}
              <View style={styles.detailsContainer}>
                {/* Header Row - Room Type and Price */}
                <View style={styles.headerRow}>
                  <Text style={styles.roomType} numberOfLines={1}>
                    {item?.roomType}
                  </Text>
                  <Text style={styles.price}>
                    ${item?.roomFee}
                  </Text>
                </View>
                
                {/* Description */}
                <Text style={styles.description} numberOfLines={2}>
                  {item?.description}
                </Text>
                
                {/* Max Occupancy */}
                <Text style={styles.occupancy}>
                  Max Occupancy: <Text style={styles.occupancyBold}>{item?.maxOccupancy} People</Text>
                </Text>
              </View>
            </View>
            
            {/* Availability Footer */}
            <View style={styles.footer}>
              <View style={styles.availableContainer}>
                <MaterialCommunityIcons name="check-circle" size={20} color="#4cbf04" />
                <Text style={styles.availableText}>Available</Text>
              </View>
              
              <View style={styles.roomsCountContainer}>
                <Text style={styles.roomsCount}>5 Rooms</Text>
                <MaterialCommunityIcons name="sticker-check" size={20} color="#4cbf04" />
              </View>
            </View>
          </View>
        )
      }}
    />
  )
}

export default RoomComponent

const styles = StyleSheet.create({
  listContainer: {
    paddingHorizontal: 5,
    paddingBottom: 16,
  },
  roomCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginTop: 16,
    borderWidth: 1,
    borderColor: '#E9E9E9',
    overflow: 'hidden',
  },
  cardContent: {
    flexDirection: 'row',
    padding: 12,
  },
  roomImage: {
    width: 110,
    height: 110,
    borderRadius: 10,
  },
  detailsContainer: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'space-between',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 6,
  },
  roomType: {
    fontSize: 17,
    fontWeight: '600',
    color: '#1A1A1A',
    flex: 1,
    marginRight: 8,
  },
  price: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1995AD',
  },
  description: {
    fontSize: 13,
    color: '#666',
    lineHeight: 18,
    marginBottom: 6,
  },
  occupancy: {
    fontSize: 14,
    color: '#555',
  },
  occupancyBold: {
    fontWeight: '700',
    color: '#1A1A1A',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#F8FAFB',
    borderTopWidth: 1,
    borderTopColor: '#E9E9E9',
  },
  availableContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  availableText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4cbf04',
  },
  roomsCountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  roomsCount: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
  },
});