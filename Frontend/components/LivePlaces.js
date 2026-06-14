import {
  StyleSheet,
  Text,
  View,
  FlatList,
  TouchableOpacity,
  Image,
  ActivityIndicator
} from "react-native";
import React, { useState, useEffect, useContext } from "react";
import { useNavigation } from "@react-navigation/native";
import AuthContext from "../context/AuthContext";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";

const LivePlaces = () => {
  const navigation = useNavigation();
  const { hotelData } = useContext(AuthContext);
  const [provinceData, setProvinceData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProvince, setSelectedProvince] = useState("All");

  // Process hotel data to group by province
  useEffect(() => {
    if (hotelData && hotelData.length > 0) {
      // Extract unique provinces
      const provinces = [...new Set(hotelData.map(hotel => hotel.province))];
      
      // Create data structure for provinces with their hotels
      const provincesWithHotels = provinces.map(province => {
        const hotelsInProvince = hotelData.filter(hotel => hotel.province === province);
        // Use the first hotel's image as the province thumbnail
        const thumbnailImage = hotelsInProvince[0]?.media?.[0]?.url || 
                              "https://via.placeholder.com/300x200?text=No+Image";
        return {
          province,
          thumbnail: thumbnailImage,
          hotelCount: hotelsInProvince.length,
          countryName: hotelsInProvince[0]?.country || "Unknown"
        };
      });
      
      // Sort provinces by hotel count (most hotels first)
      provincesWithHotels.sort((a, b) => b.hotelCount - a.hotelCount);
      
      setProvinceData(provincesWithHotels);
      setLoading(false);
    }
  }, [hotelData]);

  // Filter tabs for provinces
  const renderProvinceFilter = () => {
    // Add "All" option to the provinces
    const allProvinces = ["All", ...provinceData.map(item => item.province)];
    
    return (
      <FlatList
        horizontal
        showsHorizontalScrollIndicator={false}
        data={allProvinces}
        keyExtractor={(item) => item}
        contentContainerStyle={styles.filterContainer}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[
              styles.filterButton,
              selectedProvince === item && styles.filterButtonActive
            ]}
            onPress={() => setSelectedProvince(item)}
          >
            <Text 
              style={[
                styles.filterText,
                selectedProvince === item && styles.filterTextActive
              ]}
            >
              {item}
            </Text>
          </TouchableOpacity>
        )}
      />
    );
  };

  const navigateToHotelsInProvince = (province) => {
    // Navigate to a screen that shows hotels in this province
    navigation.navigate('Top Places Gallery', { 
      province: province,
      hotels: hotelData.filter(hotel => province === "All" || hotel.province === province)
    });
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1995AD" />
        <Text style={styles.loadingText}>Loading destinations...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.sectionTitle}>Top Destinations</Text>
      </View>

      {/* Province filter tabs */}
      {renderProvinceFilter()}

      <FlatList
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.destinationsList}
        data={selectedProvince === "All" 
          ? provinceData 
          : provinceData.filter(item => item.province === selectedProvince)}
        keyExtractor={(item) => item.province}
        renderItem={({ item }) => (
          <TouchableOpacity 
            style={styles.destinationCard}
            onPress={() => navigateToHotelsInProvince(item.province)}
          >
            <Image
              source={{ uri: item.thumbnail }}
              style={styles.destinationImage}
            />
            <LinearGradient
              colors={['transparent', 'rgba(0,0,0,0.8)']}
              style={styles.gradient}
            />
            <View style={styles.cardContent}>
              <Text style={styles.provinceName}>{item.province}</Text>
              <View style={styles.destinationInfo}>
                <Text style={styles.countryName}>{item.countryName}</Text>
                <View style={styles.hotelCountContainer}>
                  <Ionicons name="bed-outline" size={14} color="white" />
                  <Text style={styles.hotelCount}>{item.hotelCount} Hotels</Text>
                </View>
              </View>
            </View>
          </TouchableOpacity>
        )}
      />
    </View>
  );
};

export default LivePlaces;

const styles = StyleSheet.create({
  container: {
    marginTop: 25,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 15,
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 25,
    fontFamily: 'Poppins-Medium',
    color: '#000',
    fontWeight: "400"
  },
  viewAllText: {
    color: '#1995AD',
    fontFamily: 'Poppins',
    fontSize: 14,
  },
  loadingContainer: {
    height: 350,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontFamily: 'Poppins',
    color: '#666',
  },
  filterContainer: {
    paddingHorizontal: 15,
    paddingBottom: 15,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    backgroundColor: '#f0f0f0',
  },
  filterButtonActive: {
    backgroundColor: '#1995AD',
  },
  filterText: {
    fontSize: 14,
    fontFamily: 'Poppins',
    color: '#666',
  },
  filterTextActive: {
    color: 'white',
    fontWeight: '500',
  },
  destinationsList: {
    paddingHorizontal: 15,
    gap: 15,
  },
  destinationCard: {
    width: 220,
    height: 280,
    borderRadius: 16,
    overflow: 'hidden',
    marginRight: 15,
    backgroundColor: '#f0f0f0',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  destinationImage: {
    width: '100%',
    height: '100%',
    borderRadius: 16,
  },
  gradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: '50%',
    borderRadius: 16,
  },
  cardContent: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 15,
  },
  provinceName: {
    color: 'white',
    fontSize: 20,
    fontFamily: 'Poppins-SemiBold',
    marginBottom: 5,
  },
  destinationInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  countryName: {
    color: 'white',
    fontSize: 14,
    fontFamily: 'Poppins',
    opacity: 0.9,
  },
  hotelCountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  hotelCount: {
    color: 'white',
    fontSize: 12,
    fontFamily: 'Poppins',
    marginLeft: 4,
    opacity: 0.9,
  },
});