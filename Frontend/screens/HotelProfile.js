import {
  StyleSheet,
  Text,
  View,
  Image,
  Dimensions,
  FlatList,
  Button,
  Pressable,
  TouchableOpacity,
  Modal,
  StatusBar,
} from "react-native";
import React, { useState, useContext, useEffect } from "react";
import { LinearGradient } from "expo-linear-gradient";
import Animated, {
  interpolate,
  useAnimatedRef,
  useAnimatedStyle,
  useScrollViewOffset,
} from "react-native-reanimated";
import { rsdata } from "../data/reservationsData";
import Entypo from "@expo/vector-icons/Entypo";
import * as Progress from "react-native-progress";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import Reviews from "../components/Reviews";
import { useNavigation } from "@react-navigation/native";
import axios from "axios";
import AuthContext from "../context/AuthContext";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import RoomComponent from "../components/RoomComponent";
import MapLocation from "../components/MapLocation";
import Loading from "./LoadingScreen";
import { WebView } from "react-native-webview";

const { width } = Dimensions.get("window");
const IMG_HEIGHT = 350;

const HotelProfile = () => {
  const [isloading, setIsLoading] = useState(true);
  const { currentID, currentRoomId, ip } = useContext(AuthContext);
  const [hotelName, setHotelName] = useState();
  const [adresse, setAdresse] = useState();
  const [summary, setSummary] = useState("");
  const [rate, setRate] = useState(0);
  const [room, setRoom] = useState();
  const [latitude, setLatitude] = useState(0);
  const [longitude, setLongitude] = useState(0);
  const [location, setLocation] = useState({
    latitude: 0,
    longitude: 0,
    latitudeDelta: 0.02,
    longitudeDelta: 0.02,
  });
  const [bg, setBg] = useState();
  const [media, setMedia] = useState();
  const [roomInfo, setRoomInfo] = useState();
  const [basePrice, setBaseprice] = useState();
  const [menu, setMenu] = useState();
  const [email, setEmail] = useState()
  const [phone, setPhone] = useState()

  //API Calls
  useEffect(() => {
    const url = `http://${ip}:8000/api/v1/hotels/profile/${currentID}`;

    axios
      .get(url)
      .then((response) => {
        const result = response.data;
        const hotelDetails = result.data;
        setHotelName(hotelDetails.name);
        setAdresse(hotelDetails.street_address);
        setSummary(hotelDetails.long_description);
        setRate(hotelDetails.star_rating);
        setRoom(hotelDetails.total_rooms);
        setMedia(hotelDetails.media);
        setRoomInfo(hotelDetails.rooms);
        setEmail(hotelDetails.business_email)
        setPhone(hotelDetails.business_mobile)

        const lat = Number(hotelDetails.latitude);
        const lng = Number(hotelDetails.longitude);

        setLatitude(lat);
        setLongitude(lng);

        setLocation({
          latitude: lat,
          longitude: lng,
          longitudeDelta: 0.02,
          latitudeDelta: 0.02,
        });

        setBg(hotelDetails.media[0].url);
        setBaseprice(hotelDetails.rooms[0].roomFee);
        setMenu(hotelDetails.menu_download_url);
        setIsLoading(false);
      })
      .catch((error) => {
        console.log("We are facing an error", error);
      });
  }, []);

  const navigation = useNavigation();

  // Scroll Animation
  const scrollRef = useAnimatedRef();
  const scrollOffset = useScrollViewOffset(scrollRef);
  const ImageAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {
          translateY: interpolate(
            scrollOffset.value,
            [-IMG_HEIGHT, 0, IMG_HEIGHT],
            [-IMG_HEIGHT / 2, 0, IMG_HEIGHT * 0.4]
          ),
        },
        {
          scale: interpolate(
            scrollOffset.value,
            [-IMG_HEIGHT, 0, IMG_HEIGHT],
            [2, 1, 1]
          ),
        },
      ],
    };
  });

  const [star, setStar] = useState([1, 2, 3, 4]);

  const SectionDivider = () => <View style={styles.divider} />;

  const InfoCard = ({ children, style }) => (
    <View style={[styles.card, style]}>{children}</View>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <Modal visible={isloading} animationType="fade">
        <Loading />
      </Modal>
      <Animated.ScrollView ref={scrollRef} scrollEventThrottle={16}>
        <View style={styles.imageContainer}>
          <Animated.Image
            source={{ uri: `${bg}` }}
            style={[styles.image, ImageAnimatedStyle]}
          />
          <LinearGradient
            style={styles.imageGradient}
            colors={["transparent", "rgba(0,0,0,0.7)"]}
          />
        </View>

        <View style={styles.content}>
          {/* Header Section */}
          <InfoCard style={styles.headerCard}>
            <View style={styles.headerRow}>
              <View style={styles.headerLeft}>
                <Text style={styles.hotelName}>{hotelName}</Text>
                <View style={styles.locationRow}>
                  <Entypo name="location" size={20} color="#1995AD" />
                  <Text style={styles.address}>{adresse}</Text>
                </View>
              </View>
              <View style={styles.priceContainer}>
                <Text style={styles.price}>${basePrice}</Text>
                <Text style={styles.priceLabel}>per night</Text>
              </View>
            </View>
          </InfoCard>

          {/* Summary Section */}
          <InfoCard>
            <Text style={styles.sectionTitle}>About</Text>
            <Text style={styles.summaryText}>{summary}</Text>
            
            <View style={styles.contactInfo}>
              <View style={styles.contactRow}>
                <Entypo name="mail" size={18} color="#1995AD" />
                <Text style={styles.contactLabel}>Email:</Text>
                <Text style={styles.contactValue}>{email}</Text>
              </View>
              <View style={styles.contactRow}>
                <Entypo name="phone" size={18} color="#1995AD" />
                <Text style={styles.contactLabel}>Phone:</Text>
                <Text style={styles.contactValue}>{phone}</Text>
              </View>
            </View>
          </InfoCard>

          {/* Rating Section */}
          <InfoCard>
            <Text style={styles.sectionTitle}>Ratings & Reviews</Text>
            <View style={styles.ratingContainer}>
              <View style={styles.ratingScore}>
                <Text style={styles.ratingNumber}>{rate}</Text>
                <View style={styles.starsContainer}>
                  {star.map((item, index) => (
                    <FontAwesome
                      key={index}
                      name="star"
                      size={20}
                      color="#FFB800"
                      style={styles.starIcon}
                    />
                  ))}
                </View>
                <Text style={styles.ratingLabel}>Overall Rating</Text>
              </View>

              <View style={styles.ratingBars}>
                <View style={styles.ratingBarRow}>
                  <Text style={styles.ratingBarLabel}>Room</Text>
                  <Progress.Bar
                    progress={0.85}
                    width={180}
                    height={8}
                    color="#1995AD"
                    unfilledColor="#E8F4F6"
                    borderWidth={0}
                    borderRadius={4}
                  />
                  <Text style={styles.ratingBarValue}>8.5</Text>
                </View>
                <View style={styles.ratingBarRow}>
                  <Text style={styles.ratingBarLabel}>Service</Text>
                  <Progress.Bar
                    progress={0.92}
                    width={180}
                    height={8}
                    color="#1995AD"
                    unfilledColor="#E8F4F6"
                    borderWidth={0}
                    borderRadius={4}
                  />
                  <Text style={styles.ratingBarValue}>9.2</Text>
                </View>
                <View style={styles.ratingBarRow}>
                  <Text style={styles.ratingBarLabel}>Price</Text>
                  <Progress.Bar
                    progress={0.78}
                    width={180}
                    height={8}
                    color="#1995AD"
                    unfilledColor="#E8F4F6"
                    borderWidth={0}
                    borderRadius={4}
                  />
                  <Text style={styles.ratingBarValue}>7.8</Text>
                </View>
              </View>
            </View>
          </InfoCard>

          {/* Photos Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Photos</Text>
              <TouchableOpacity onPress={() => navigation.navigate("Gallery")}>
                <Text style={styles.seeAllButton}>See all</Text>
              </TouchableOpacity>
            </View>
            <FlatList
              data={media}
              horizontal={true}
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.photoList}
              renderItem={({ item }) => (
                <View style={styles.photoContainer}>
                  <Image source={{ uri: `${item.url}` }} style={styles.photo} />
                </View>
              )}
            />
          </View>

          {/* Available Rooms */}
          <View style={styles.section}>
            <View style={styles.roomHeader}>
              <Text style={styles.sectionTitle}>Available Rooms</Text>
              <View style={styles.roomBadge}>
                <MaterialCommunityIcons
                  name="check-circle"
                  size={20}
                  color="#4cbf04"
                />
                <Text style={styles.roomCount}>{room} rooms</Text>
              </View>
            </View>
            <RoomComponent roomInfo={roomInfo} />
          </View>

          {/* Map Location */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Location</Text>
            <View style={styles.mapContainer}>
              <MapLocation location={location} name={hotelName} />
            </View>
          </View>

          {/* Reviews Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Guest Reviews</Text>
              <TouchableOpacity onPress={() => navigation.navigate("Reviews")}>
                <Text style={styles.seeAllButton}>See all</Text>
              </TouchableOpacity>
            </View>
            <Reviews />
          </View>

          {/* Hotel Menu */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Hotel Menu</Text>
            <View style={styles.menuContainer}>
              <WebView source={{ uri: `${menu}` }} style={styles.webview} />
            </View>
          </View>

          {/* Booking Button */}
          <TouchableOpacity
            style={styles.bookButton}
            onPress={() => navigation.navigate("Booking")}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={["#1995AD", "#148899"]}
              style={styles.bookGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Text style={styles.bookButtonText}>Book Now</Text>
              <MaterialCommunityIcons
                name="arrow-right"
                size={24}
                color="white"
              />
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </Animated.ScrollView>
    </View>
  );
};

export default HotelProfile;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFB",
  },
  imageContainer: {
    position: "relative",
  },
  image: {
    width,
    height: IMG_HEIGHT,
  },
  imageGradient: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: IMG_HEIGHT / 2,
  },
  content: {
    flex: 1,
    backgroundColor: "#F8FAFB",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    marginTop: -24,
    paddingTop: 8,
  },
  card: {
    backgroundColor: "#FFFFFF",
    marginHorizontal: 16,
    marginVertical: 8,
    padding: 20,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  headerCard: {
    marginTop: 16,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  headerLeft: {
    flex: 1,
    marginRight: 16,
  },
  hotelName: {
    fontSize: 26,
    fontWeight: "700",
    color: "#1A1A1A",
    marginBottom: 8,
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },
  address: {
    fontSize: 15,
    color: "#666",
    marginLeft: 6,
    flex: 1,
  },
  priceContainer: {
    alignItems: "flex-end",
  },
  price: {
    fontSize: 32,
    fontWeight: "700",
    color: "#1995AD",
  },
  priceLabel: {
    fontSize: 14,
    color: "#999",
    marginTop: 4,
  },
  divider: {
    height: 1,
    backgroundColor: "#E8E8E8",
    marginVertical: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#1A1A1A",
    marginBottom: 16,
  },
  summaryText: {
    fontSize: 15,
    lineHeight: 24,
    color: "#555",
    marginBottom: 20,
  },
  contactInfo: {
    backgroundColor: "#F8FAFB",
    padding: 16,
    borderRadius: 12,
    gap: 12,
  },
  contactRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  contactLabel: {
    fontSize: 15,
    fontWeight: "600",
    color: "#1995AD",
    marginLeft: 8,
    marginRight: 8,
  },
  contactValue: {
    fontSize: 15,
    color: "#333",
    flex: 1,
  },
  ratingContainer: {
    flexDirection: "row",
    gap: 24,
  },
  ratingScore: {
    alignItems: "center",
    justifyContent: "center",
    paddingRight: 24,
    borderRightWidth: 1,
    borderRightColor: "#E8E8E8",
  },
  ratingNumber: {
    fontSize: 48,
    fontWeight: "700",
    color: "#1995AD",
  },
  starsContainer: {
    flexDirection: "row",
    marginTop: 8,
    marginBottom: 8,
  },
  starIcon: {
    marginHorizontal: 2,
  },
  ratingLabel: {
    fontSize: 13,
    color: "#666",
    textAlign: "center",
  },
  ratingBars: {
    flex: 1,
    justifyContent: "center",
    gap: 16,
  },
  ratingBarRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  ratingBarLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: "#555",
    width: 60,
  },
  ratingBarValue: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1995AD",
    width: 32,
    textAlign: "right",
  },
  section: {
    marginHorizontal: 16,
    marginVertical: 12,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  seeAllButton: {
    fontSize: 15,
    color: "#1995AD",
    fontWeight: "600",
  },
  photoList: {
    paddingRight: 16,
  },
  photoContainer: {
    marginRight: 12,
    borderRadius: 12,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  photo: {
    width: 240,
    height: 180,
    borderRadius: 12,
  },
  roomHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  roomBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#E8F8E9",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
  },
  roomCount: {
    fontSize: 14,
    fontWeight: "600",
    color: "#4cbf04",
  },
  mapContainer: {
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  menuContainer: {
    height: 500,
    borderRadius: 16,
    overflow: "hidden",
    backgroundColor: "#FFFFFF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  webview: {
    flex: 1,
  },
  bookButton: {
    marginHorizontal: 16,
    marginVertical: 24,
    marginBottom: 40,
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: "#1995AD",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  bookGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 18,
    gap: 8,
  },
  bookButtonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
});