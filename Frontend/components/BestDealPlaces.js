import { StyleSheet, Text, View, Image, TouchableOpacity } from "react-native";
import React from "react";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { LinearGradient } from "expo-linear-gradient";

const TrendingPlaces = ({ item, onPress }) => {
  // Calculate discount percentage if we have both prices
  const originalPrice = item.originalPrice || 389;
  const currentPrice = item.price || 150;
  const discountPercentage = Math.round(((originalPrice - currentPrice) / originalPrice) * 100);
  
  return (
    <TouchableOpacity style={styles.container} onPress={onPress} activeOpacity={0.9}>
      <View style={styles.imageContainer}>
        <Image source={item.img} style={styles.img} />
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.7)']}
          style={styles.imageDarkOverlay}
        />
        <View style={styles.ratingContainer}>
          <MaterialIcons name="star" size={16} color="#FFD700" />
          <Text style={styles.ratingText}>{item.rating || '4.6'}</Text>
        </View>
        
        {discountPercentage > 0 && (
          <View style={styles.discountBadge}>
            <Text style={styles.discountText}>-{discountPercentage}%</Text>
          </View>
        )}
      </View>

      <View style={styles.contentContainer}>
        <Text style={styles.nameText} numberOfLines={1}>
          {item.name}
        </Text>
        
        <View style={styles.locationContainer}>
          <MaterialIcons name="location-on" size={14} color="#666" />
          <Text style={styles.locationText} numberOfLines={1}>
            {item.location || "Volcano In East"}
          </Text>
        </View>

        {/* Prominent discount display */}
        <View style={styles.priceComparison}>
          <Text style={styles.originalPrice}>${originalPrice}</Text>
          <View style={styles.savingsPill}>
            <Text style={styles.savingsText}>Save ${originalPrice - currentPrice}</Text>
          </View>
        </View>

        <View style={styles.priceSection}>
          <View>
            <Text style={styles.startFromText}>Start From</Text>
            <Text style={styles.priceText}>
              ${currentPrice}<Text style={styles.perNightText}>/Night</Text>
            </Text>
          </View>
          
          <TouchableOpacity style={styles.visitButton}>
            <Text style={styles.visitButtonText}>VISIT</Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default TrendingPlaces;

const styles = StyleSheet.create({
  container: {
    width: 250,
    borderRadius: 12,
    backgroundColor: "#fff",
    marginTop: 20,
    marginRight: 16,
    overflow: "hidden",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  imageContainer: {
    position: "relative",
    height: 180,
  },
  img: {
    width: "100%",
    height: "100%",
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  imageDarkOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 50,
  },
  ratingContainer: {
    position: "absolute",
    top: 10,
    right: 10,
    backgroundColor: "rgba(255,255,255,0.85)",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 16,
  },
  ratingText: {
    fontWeight: "600",
    fontSize: 12,
    marginLeft: 4,
    color: "#333",
  },
  discountBadge: {
    position: "absolute",
    top: 10,
    left: 10,
    backgroundColor: "#FF3B30",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 5,
  },
  discountText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "bold",
  },
  contentContainer: {
    padding: 12,
  },
  nameText: {
    fontSize: 18,
    fontWeight: "700",
    color: "#222",
  },
  locationContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 6,
  },
  locationText: {
    fontSize: 12,
    color: "#666",
    marginLeft: 4,
  },
  priceComparison: {
    marginTop: 8,
    flexDirection: "row",
    alignItems: "center",
  },
  originalPrice: {
    fontSize: 20,
    color: "#FF3B30",
    fontWeight: "600",
    textDecorationLine: "line-through",
  },
  savingsPill: {
    backgroundColor: "#FFE8E8",
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginLeft: 10,
  },
  savingsText: {
    color: "#FF3B30",
    fontSize: 10,
    fontWeight: "600",
  },
  priceSection: {
    marginTop: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  startFromText: {
    fontSize: 12,
    color: "#888",
  },
  priceText: {
    fontSize: 16,
    color: "#03045E",
    fontWeight: "700",
  },
  perNightText: {
    fontSize: 12,
    fontWeight: "400",
    color: "#666",
  },
  visitButton: {
    backgroundColor: "#1995AD",
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
    elevation: 1,
  },
  visitButtonText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
});