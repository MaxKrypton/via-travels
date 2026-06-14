import {
  Text,
  View,
  SafeAreaView,
  StatusBar,
  Image,
  TextInput,
  TouchableOpacity,
  Pressable,
  ScrollView,
  Modal,
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
import WelcomeScreen from "./WelcomeScreen";
import TopHotels from "../components/TopHotels";
import axios from "axios";


SplashScreen.preventAutoHideAsync();

const HomeScreen = () => {
  const navigation = useNavigation()
  const [loaded, error] = useFonts({
    'Poppins': require('../assets/fonts/Poppins-Regular.ttf'),
    'Inter': require('../assets/fonts/Inter-VariableFont_opsz,wght.ttf'),
  });
  const {signedIn, loadAuthStatus, authStatus, setSignedIn, showLogIn, saveHotelData, setHotelData, hotelData, ip} = useContext(AuthContext)
  const [posts, setPosts] = useState()
  const hotelURL = `http://${ip}:8000/api/v1/hotels/all-hotels`
  const postUrl = `http://${ip}:8000/api/v1/hotels/posts/All-hotels`

  useEffect(() => {
    if (loaded || error) {
      SplashScreen.hideAsync();
    }
    
  }, [loaded, error]);

  useEffect(() => {
    const checkAuth = async () => {
      await loadAuthStatus("isLoggedIn");
      
      console.log("The status of authStatus is", signedIn);

      if (authStatus === "loggedIn") {
        setSignedIn(true);
      } else {
        setSignedIn(false);
      }
    };
    
    checkAuth();
    console.log("Current auth status:", authStatus); // Debug log

    // GET the hotel details from the database

    axios.get(hotelURL)
    .then((response) =>{
      const result = response.data
      const hotels = result.data
      saveHotelData(hotels)
    }).catch((error) => {
      console.log(`The Error we are facing is ${error}`);
    })

  }, [authStatus]);

  useEffect(() =>{
    axios.get(postUrl)
    .then((response) =>{
      const result = response.data
      const postData = result.data
      setPosts(postData)
    })
    .catch(error => {
      console.log(`We are facing an error getting the posts, ${error}`)
    })
  }, [])

  if (!loaded && !error) {
    return null;
  }

    // UI Design

  if(!signedIn){
    return <Modal visible={showLogIn} animationType="slide">
      <WelcomeScreen/>
    </Modal>
  } else{ return (
    <View style={styles.container}>
      <LinearGradient
   i     colors={["rgb(247, 247, 247)", "rgb(247, 247, 247)"]}
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
  );}

 
};

export default HomeScreen;
