import { StyleSheet, Text, View, Image, FlatList } from "react-native";
import React, { useRef, useEffect, useContext, useState } from "react";
import { LinearGradient } from "expo-linear-gradient";
import { tops } from "../data/topHotel";
import AuthContext from "../context/AuthContext";

const TopHotels = () => {
  const {hotelData} = useContext(AuthContext)
  const [top5, setTop5] = useState()
  const flatListRef = useRef(null);



  useEffect(() => {
    let currentIndex = 0;
    
    const autoScroll = () => {
      if (currentIndex === tops.length - 1) {
        currentIndex = 0;
       
        flatListRef.current?.scrollToOffset({
          offset: 0,
          animated: false
        });
      } else {
        currentIndex += 1;
        flatListRef.current?.scrollToIndex({
          index: currentIndex,
          animated: true
        });
      }
    };

    const intervalId = setInterval(autoScroll, 3000);
    return () => clearInterval(intervalId);
  }, []);

  return (
    <FlatList 
      ref={flatListRef}
      data={tops}
      horizontal={true}
      showsHorizontalScrollIndicator={false}
      pagingEnabled
      style={{width:"100%", height:130, gap: 10}}
      onScrollToIndexFailed={(info) => {
        const wait = new Promise(resolve => setTimeout(resolve, 500));
        wait.then(() => {
          flatListRef.current?.scrollToIndex({ 
            index: info.index, 
            animated: true 
          });
        });
      }}
      renderItem={({item}) => (
        <View
          style={{
            marginLeft: 13,
            marginRight: 10,
            borderRadius: 10,
            marginTop: 20,
            width: 350
          }}
        >
          <LinearGradient
            colors={item.gradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{ height: "100%", borderRadius: 10 }}
          >
            <Text
              style={{
                fontSize: 20,
                color: "white",
                fontWeight: "bold",
                marginLeft: 20,
                marginTop: 5,
              }}
            >
              {item.district}
            </Text>
            <View
              style={{
                flexDirection: "row",
                shadowColor: "#000",
                shadowOffset: { width: 2, height: 3 },
                shadowRadius: 10,
                shadowOpacity: 5,
              }}
            >
              <Text
                style={{
                  fontSize: 25,
                  color: "white",
                  fontWeight: "bold",
                  marginLeft: 20,
                  marginTop: 20,
                }}
              >
                {item.hotel}
              </Text>
            </View>
          </LinearGradient>
          <Image
            source={item.img}
            style={{
              width: 160,
              height: 130,
              marginTop: -30,
              position: "absolute",
              right: -20,
            }}
          />
        </View>
      )}
    />
  );
};

export default TopHotels;

const styles = StyleSheet.create({});