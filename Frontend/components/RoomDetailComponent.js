import { View, Text, FlatList, TouchableOpacity, Image } from 'react-native'
import React, { useState, useCallback } from 'react'
import RoomItem from './RoomItem';

const RoomDetailComponent = ({ roomInfo }) => {
  const [roomPrices, setRoomPrices] = useState({});

  const updateRoomPrice = useCallback((roomType, price) => {
    setRoomPrices(prev => ({
      ...prev,
      [roomType]: price
    }));
  }, []);

  return (
    <FlatList 
      data={roomInfo}
      renderItem={({ item }) => (
        <RoomItem 
          item={item} 
          updateRoomPrice={updateRoomPrice}
        />
      )}
      keyExtractor={(item, index) => item.roomType || index.toString()}
    />
  )
}

export default RoomDetailComponent