import { StyleSheet, Text, View, Image, TouchableOpacity, FlatList, Dimensions, Modal, Pressable, ScrollView, Animated } from "react-native";
import React, { useContext, useState, useRef } from "react";
import { Feather, AntDesign, FontAwesome } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import AuthContext from "../context/AuthContext";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";

const { width } = Dimensions.get("window");

const SponsoredPost = ({ posts }) => {
  const navigation = useNavigation();
  const { setCurrentID } = useContext(AuthContext);
  const [expandedPost, setExpandedPost] = useState(null);
  const scaleAnim = useRef(new Animated.Value(1)).current;
  

  if (!posts || posts.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No sponsored posts available</Text>
      </View>
    );
  }

  const toggleExpand = (item) => {
    if (expandedPost && expandedPost.id === item.id) {
      // Animate closing
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }).start(() => {
        setExpandedPost(null);
      });
    } else {
      // Animate opening
      setExpandedPost(item);
      Animated.timing(scaleAnim, {
        toValue: 1.02,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
  };

  const renderExpandedPost = () => {
    if (!expandedPost) return null;

    return (
      <Modal
        visible={!!expandedPost}
        transparent={true}
        animationType="fade"
        onRequestClose={() => toggleExpand(expandedPost)}
      >
        <Pressable 
          style={styles.modalOverlay} 
          onPress={() => toggleExpand(expandedPost)}
        >
          <BlurView intensity={90} style={StyleSheet.absoluteFill} />
          
          <TouchableOpacity activeOpacity={1} style={styles.expandedPostContainer}>
            <ScrollView showsVerticalScrollIndicator={false}>
              {/* Image */}
              <View style={styles.expandedImageContainer}>
                <Image
                  source={{ uri: expandedPost.url }}
                  style={styles.expandedImage}
                  resizeMode="cover"
                />
                <LinearGradient
                  colors={['rgba(0,0,0,0.6)', 'transparent']}
                  style={styles.expandedImageGradient}
                />
              </View>

              {/* Hotel Badge */}
              <View style={styles.expandedHotelBadge}>
                <Image
                  source={{uri: `${expandedPost.url}`}}
                  style={styles.expandedHotelAvatar}
                />
                <Text style={styles.expandedHotelName}>{expandedPost.hotel_name}</Text>
              </View>

              {/* Close Button */}
              <TouchableOpacity 
                style={styles.closeButton}
                onPress={() => toggleExpand(expandedPost)}
              >
                <AntDesign name="close" size={20} color="#fff" />
              </TouchableOpacity>

              {/* Favorite Button */}
              <TouchableOpacity style={styles.expandedFavoriteButton}>
                <AntDesign name="hearto" size={24} color="white" />
              </TouchableOpacity>

              {/* Content */}
              <View style={styles.expandedContentContainer}>
                {/* Full Description */}
                <Text style={styles.expandedDescription}>
                  {expandedPost.postDescription}
                </Text>

                {/* Amenities if available */}
                {expandedPost.amenities && (
                  <View style={styles.amenitiesContainer}>
                    <Text style={styles.sectionTitle}>Amenities</Text>
                    <View style={styles.amenitiesGrid}>
                      {expandedPost.amenities.map((amenity, index) => (
                        <View key={index} style={styles.amenityItem}>
                          <FontAwesome name="check-circle" size={16} color="#1995AD" />
                          <Text style={styles.amenityText}>{amenity}</Text>
                        </View>
                      ))}
                    </View>
                  </View>
                )}

                {/* Rating */}
                <View style={styles.expandedRatingContainer}>
                  <Text style={styles.sectionTitle}>Rating & Reviews</Text>
                  <View style={styles.ratingRow}>
                    <FontAwesome name="star" size={24} color="#F9A825" />
                    <Text style={styles.expandedRatingText}>{expandedPost.avg_rating} Rating</Text>
                    <Text style={styles.reviewCount}>(234 reviews)</Text>
                  </View>
                </View>

                {/* Price and Action */}
                <View style={styles.expandedPriceActionContainer}>
                  <View style={styles.expandedPriceContainer}>
                    <Text style={styles.expandedPriceLabel}>Start from</Text>
                    <Text style={styles.expandedPriceValue}>{expandedPost.currency} {expandedPost.base_price}/per night</Text>
                  </View>
                  
                  <TouchableOpacity 
                    style={styles.expandedDetailsButton}
                    onPress={() => {
                      toggleExpand(expandedPost);
                      navigation.navigate("Hotel Profile");
                      setCurrentID(expandedPost.hotel_id);
                    }}
                  >
                    <Text style={styles.expandedDetailsButtonText}>See Details</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </ScrollView>
          </TouchableOpacity>
        </Pressable>
      </Modal>
    );
  };

  const renderItem = ({ item }) => (
    <Animated.View
      style={[
        styles.postCard,
        expandedPost && expandedPost.id === item.id && {
          transform: [{ scale: scaleAnim }],
          zIndex: 10,
        },
      ]}
    >
      <TouchableOpacity
        activeOpacity={0.95}
        onPress={() => toggleExpand(item)}
      >
        {/* Image and Overlay */}
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: `${item.url}` }}
            style={styles.postImage}
            resizeMode="cover"
          />
          <LinearGradient
            colors={['rgba(0,0,0,0.5)', 'transparent']}
            style={styles.imageGradient}
          />
        </View>

        {/* Hotel Profile Badge */}
        <View style={styles.hotelBadge}>
          <Image
            source={require("../assets/images/logo.png")}
            style={styles.hotelAvatar}
          />
          <Text style={styles.hotelName}>{item.hotel_name}</Text>
        </View>

        {/* Favorite Button */}
        <TouchableOpacity 
          style={styles.favoriteButton}
          onPress={(e) => {
            e.stopPropagation();
            // Add favorite functionality here
          }}
        >
          <AntDesign name="hearto" size={24} color="white" />
        </TouchableOpacity>

        {/* Content Area */}
        <View style={styles.contentContainer}>
          {/* Description */}
          <Text
            numberOfLines={3}
            style={styles.description}
          >
            {item.postDescription}
          </Text>

          {/* Rating */}
          <View style={styles.ratingContainer}>
            <FontAwesome name="star" size={20} color="#F9A825" />
            <Text style={styles.ratingText}>{item.avg_rating} Rating</Text>
          </View>

          {/* Price and Action */}
          <View style={styles.priceActionContainer}>
            <View style={styles.priceContainer}>
              <Text style={styles.priceLabel}>Start from</Text>
              <Text style={styles.priceValue}>{item.currency} {item.base_price}/per night</Text>
            </View>
            
            <TouchableOpacity 
              style={styles.detailsButton}
              onPress={(e) => {
                e.stopPropagation();
                navigation.navigate("Hotel Profile");
                setCurrentID(item.hotel_id);
              }}
            >
              <Text style={styles.detailsButtonText}>See Details</Text>
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );

  return (
    <>
      <FlatList
        data={posts}
        renderItem={renderItem}
        keyExtractor={(item) => item.id.toString()}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContainer}
      />
      {renderExpandedPost()}
    </>
  );
};

export default SponsoredPost;

const styles = StyleSheet.create({
  listContainer: {
    padding: 12,
  },
  emptyContainer: {
    padding: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyText: {
    fontSize: 16,
    color: "#757575",
  },
  postCard: {
    borderRadius: 16,
    backgroundColor: "#fff",
    marginBottom: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
    overflow: "hidden",
  },
  imageContainer: {
    position: "relative",
    height: 280,
  },
  postImage: {
    width: "100%",
    height: "100%",
  },
  imageGradient: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    height: 100,
  },
  hotelBadge: {
    position: "absolute",
    top: 16,
    left: 16,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    borderRadius: 24,
    paddingRight: 16,
    paddingVertical: 4,
  },
  hotelAvatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    borderWidth: 2,
    borderColor: "#fff",
  },
  hotelName: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
  favoriteButton: {
    position: "absolute",
    top: 16,
    right: 16,
    width: 42,
    height: 42,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    borderRadius: 21,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 10,
  },
  contentContainer: {
    padding: 16,
  },
  description: {
    fontSize: 15,
    lineHeight: 22,
    color: "#333",
    marginBottom: 16,
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  ratingText: {
    marginLeft: 8,
    fontSize: 16,
    color: "#555",
  },
  priceActionContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 8,
  },
  priceContainer: {
    flex: 1,
  },
  priceLabel: {
    fontSize: 14,
    color: "#757575",
  },
  priceValue: {
    fontSize: 18,
    fontWeight: "600",
    color: "#03045E",
    marginTop: 4,
  },
  detailsButton: {
    backgroundColor: "#1995AD",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  detailsButtonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 15,
  },
  
  // Modal & Expanded View Styles
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.2)",
  },
  expandedPostContainer: {
    width: "90%",
    maxHeight: "90%",
    backgroundColor: "white",
    borderRadius: 20,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 10,
  },
  expandedImageContainer: {
    height: 300,
  },
  expandedImage: {
    width: "100%",
    height: "100%",
  },
  expandedImageGradient: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    height: 120,
  },
  expandedHotelBadge: {
    position: "absolute",
    top: 24,
    left: 24,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    borderRadius: 24,
    paddingRight: 20,
    paddingVertical: 6,
  },
  expandedHotelAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: "#fff",
  },
  expandedHotelName: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
    marginLeft: 12,
  },
  closeButton: {
    position: "absolute",
    top: 16,
    right: 16,
    width: 36,
    height: 36,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 10,
  },
  expandedFavoriteButton: {
    position: "absolute",
    top: 16,
    right: 64,
    width: 42,
    height: 42,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    borderRadius: 21,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 10,
  },
  expandedContentContainer: {
    padding: 24,
  },
  expandedDescription: {
    fontSize: 16,
    lineHeight: 24,
    color: "#333",
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginBottom: 12,
  },
  amenitiesContainer: {
    marginBottom: 24,
  },
  amenitiesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  amenityItem: {
    flexDirection: "row",
    alignItems: "center",
    width: "50%",
    marginBottom: 8,
  },
  amenityText: {
    marginLeft: 8,
    fontSize: 14,
    color: "#555",
  },
  expandedRatingContainer: {
    marginBottom: 24,
  },
  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  expandedRatingText: {
    fontSize: 18,
    fontWeight: "500",
    color: "#333",
    marginLeft: 10,
  },
  reviewCount: {
    fontSize: 14,
    color: "#757575",
    marginLeft: 8,
  },
  expandedPriceActionContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 20,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: "#eee",
  },
  expandedPriceContainer: {
    flex: 1,
  },
  expandedPriceLabel: {
    fontSize: 16,
    color: "#757575",
  },
  expandedPriceValue: {
    fontSize: 20,
    fontWeight: "600",
    color: "#03045E",
    marginTop: 4,
  },
  expandedDetailsButton: {
    backgroundColor: "#1995AD",
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  expandedDetailsButtonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  }
});