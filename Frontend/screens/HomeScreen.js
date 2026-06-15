import {
  Text,
  View,
  SafeAreaView,
  StatusBar,
  TextInput,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import React, {useEffect, useState} from "react";
import { Feather } from "@expo/vector-icons";
import styles from "../GlobalStyling";
import TrendingArea from "../components/BestDeals";
import { LinearGradient } from "expo-linear-gradient";
import LivePlaces from "../components/LivePlaces";
import SponsoredPost from "../components/SponsoredPost";
import { useFonts } from 'expo-font';
import * as SplashScreen from "expo-splash-screen"
import Ionicons from '@expo/vector-icons/Ionicons';
import Octicons from '@expo/vector-icons/Octicons';
import Entypo from '@expo/vector-icons/Entypo';
import { useNavigation } from "@react-navigation/native";
import { useContext } from "react";
import AuthContext from "../context/AuthContext";
import TopHotels from "../components/TopHotels";
import apiService from "../services/api";


SplashScreen.preventAutoHideAsync();

const HomeScreen = () => {
  const navigation = useNavigation()
  const [loaded, error] = useFonts({
    'Poppins': require('../assets/fonts/Poppins-Regular.ttf'),
    'Inter': require('../assets/fonts/Inter-VariableFont_opsz,wght.ttf'),
  });
  const { saveHotelData } = useContext(AuthContext)
  const [posts, setPosts] = useState([])

  useEffect(() => {
    if (loaded || error) {
      SplashScreen.hideAsync();
    }
    
  }, [loaded, error]);

  useEffect(() => {
    const fetchHomeData = async () => {
      const [hotelResult, postResult] = await Promise.allSettled([
        apiService.hotels.getAll(),
        apiService.posts.getAll(),
      ]);

      if (hotelResult.status === 'fulfilled') {
        saveHotelData(hotelResult.value.data?.data || []);
      } else {
        const message = hotelResult.reason?.response?.data?.message || hotelResult.reason?.message || 'Unable to reach the hotels API';
        console.log(`Hotel request failed: ${message}`);
      }

      if (postResult.status === 'fulfilled') {
        setPosts(postResult.value.data?.data || []);
      } else {
        const message = postResult.reason?.response?.data?.message || postResult.reason?.message || 'Unable to reach the posts API';
        console.log(`Posts request failed: ${message}`);
      }
    };

    fetchHomeData();
  }, []);

  if (!loaded && !error) {
    return null;
  }

    // UI Design

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={["rgb(247, 247, 247)", "rgb(247, 247, 247)"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        
      >
        <ScrollView>
          <SafeAreaView>
            <StatusBar />

          {/* Search part */}

            <View style={styles.main}>
              <Text
                style={{
                  color: "black",
                  fontSize: 17,
                  marginTop: 5,
                  marginLeft: 5,
                  fontFamily: "Inter",
                }}
              >
                Location
              </Text>
              <View style={styles.profile}>
              <TouchableOpacity onPress={() =>{navigation.navigate('Notification')}}>
              <Ionicons name="notifications-sharp" size={30} color="black" style={{position:"absolute"}} />
              <Entypo name="dot-single" size={40} color="#1995AD" style={{bottom: 7, left:5}} />
              </TouchableOpacity>
              </View>
              
            </View>
            <Text
                style={{
                  color: "black",
                  fontSize: 20,
                  marginLeft: 5,
                  marginLeft: 15,
                  fontFamily:'Inter',
                  marginTop: -10,
                  fontWeight: 500
                }}
              >
                Rwanda, Kigali
              </Text>
            <View style={styles.search}>
              <Feather
                name="search"
                size={24}
                color="black"
                style={{ marginLeft: 10 }}
              />
              <TextInput
                placeholder="Where do you want go?"
                style={{
                  fontSize: 20,
                  marginLeft: 10,
                  padding: 10,
                  width: "80%",
                }}
                onPressIn={() =>{navigation.navigate("Search")}}
              />
              <Octicons name="sort-desc" size={24} color="black" />
            </View>
            
          </SafeAreaView>


          {/* Top Listed */}

          <Text
            style={{
              color: "black",
              fontSize: 23,
              marginTop: 30,
              marginLeft: 15,
              fontFamily: "Inter",
              fontWeight: "500",
            }}
          >
            Top Hotels
          </Text>
          <TopHotels />

          <LivePlaces />
          <Text
            style={{
              color: "black",
              fontSize: 23,
              marginTop: 30,
              marginLeft: 15,
              fontFamily: "Inter",
              fontWeight: "500",
            }}
          >
            Best Deals
          </Text>
          <TrendingArea />
          <Text
            style={{
              fontSize: 23,
              marginLeft: 10,
              fontWeight: 500,
              marginTop: 30,
              fontFamily:"Inter"
            }}
          >
            For You
          </Text>

          <SponsoredPost posts={posts}/>
          {/* <Recommendations /> */}
        </ScrollView>
      </LinearGradient>
    </View>
  );

 
};

export default HomeScreen;
