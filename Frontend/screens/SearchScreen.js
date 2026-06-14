import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  ScrollView,
  Image,
  TextInput,
  Modal,
  TouchableOpacity
} from "react-native";
import React, { useState, useContext, useEffect } from "react";
import Octicons from '@expo/vector-icons/Octicons';
import { Feather } from "@expo/vector-icons";
import AuthContext from "../context/AuthContext";
import WelcomeScreen from "./WelcomeScreen";
import { useNavigation } from "@react-navigation/native";

const SearchScreen = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredHotels, setFilteredHotels] = useState([]);
  const { signedIn, hotelData, setCurrentID } = useContext(AuthContext);
  const navigation = useNavigation();
  const [searchMode, setSearchMode] = useState("all"); // "all", "name", or "region"

  useEffect(() => {
    // Initialize filtered hotels with all hotels
    if (hotelData && Array.isArray(hotelData)) {
      setFilteredHotels(hotelData);
    }
  }, [hotelData]);

  // Function to handle search
  const handleSearch = (text) => {
    setSearchQuery(text);

    if (!hotelData || !Array.isArray(hotelData)) {
      return;
    }

    if (text.trim() === "") {
      setFilteredHotels(hotelData);
      return;
    }

    const query = text.toLowerCase();
    const filtered = hotelData.filter((hotel) => {
      const nameMatch = hotel.name.toLowerCase().includes(query);
      const addressMatch = 
        (hotel.streetAddress && hotel.streetAddress.toLowerCase().includes(query)) ||
        (hotel.city && hotel.city.toLowerCase().includes(query)) ||
        (hotel.region && hotel.region.toLowerCase().includes(query));
      
      switch (searchMode) {
        case "name":
          return nameMatch;
        case "region":
          return addressMatch;
        case "all":
        default:
          return nameMatch || addressMatch;
      }
    });
    
    setFilteredHotels(filtered);
  };

  // Toggle search mode
  const toggleSearchMode = () => {
    const modes = ["all", "name", "region"];
    const currentIndex = modes.indexOf(searchMode);
    const nextIndex = (currentIndex + 1) % modes.length;
    setSearchMode(modes[nextIndex]);
    
    // Re-apply search with new mode
    handleSearch(searchQuery);
  };

  // Get search mode display text
  const getSearchModeText = () => {
    switch (searchMode) {
      case "name": return "Search by name";
      case "region": return "Search by region";
      default: return "Search all";
    }
  };

  if (!signedIn) {
    return (
      <Modal visible={true} animationType="slide">
        <WelcomeScreen />
      </Modal>
    );
  } else {
    return (
      <View style={{ backgroundColor: "rgb(247, 247, 247)", flex: 1 }}>
        <ScrollView>
          <View style={{
            width: "100%",
            borderRadius: 10,
            marginBottom: 25,
            height: 240,
          }}>
            <View style={{ width: "100%", height: "100%", position: "absolute" }}>
              <Image
                source={require("../assets/images/banner.webp")}
                style={{ width: "100%", height: 250 }}
              />
            </View>
            <View style={styles.search}>
              <Feather
                name="search"
                size={24}
                color="black"
                style={{ marginLeft: 10 }}
              />
              <TextInput
                placeholder={`Where do you want to go? (${getSearchModeText()})`}
                value={searchQuery}
                onChangeText={handleSearch}
                style={{
                  fontSize: 18,
                  marginLeft: 10,
                  padding: 10,
                  width: "70%",
                }}
              />
              <TouchableOpacity onPress={toggleSearchMode}>
                <Octicons name="sort-desc" size={24} color="black" />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.resultHeader}>
            <Text style={styles.sectionTitle}>
              {searchQuery.trim() === "" 
                ? "Suggested Places" 
                : `Search Results (${filteredHotels.length})`}
            </Text>
            {searchQuery.trim() !== "" && (
              <Text style={styles.searchMode}>{getSearchModeText()}</Text>
            )}
          </View>

          {/* No results message */}
          {searchQuery.trim() !== "" && filteredHotels.length === 0 && (
            <View style={styles.noResults}>
              <Text style={styles.noResultsText}>No hotels found matching "{searchQuery}"</Text>
            </View>
          )}

          {/* Places */}
          <View style={{ width: "100%" }}>
            {filteredHotels.map((item) => {
              return (
                <TouchableOpacity
                  key={item.id || item.hotel_id}
                  onPress={() => {
                    navigation.navigate("Hotel Profile");
                    setCurrentID(item.id);
                  }}
                >
                  <View style={styles.hotelItem}>
                    <Image 
                      source={{ uri: item.media && item.media[0] ? item.media[0].url : "https://via.placeholder.com/120x100" }} 
                      style={styles.hotelImage}
                    />
                    <View style={styles.hotelInfo}>
                      <Text style={styles.hotelName}>{item.name}</Text>
                      <Text style={styles.hotelAddress}>{item.streetAddress}</Text>
                      {item.city && <Text style={styles.hotelRegion}>{item.city}, {item.region}</Text>}
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        </ScrollView>
      </View>
    );
  }
};

export default SearchScreen;

const styles = StyleSheet.create({
  search: {
    marginTop: 20,
    marginLeft: 15,
    marginRight: 10,
    height: 50,
    borderWidth: 1,
    backgroundColor: "rgb(255, 255, 255)",
    borderRadius: 10,
    alignItems: "center",
    flexDirection: "row",
    borderColor: "rgb(233, 233, 233)",
    top: 200
  },
  resultHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingRight: 15,
    marginTop: 30,
  },
  sectionTitle: {
    color: "black",
    fontSize: 22,
    marginLeft: 15,
    fontFamily: "Inter",
    fontWeight: "500",
  },
  searchMode: {
    color: "rgb(100, 100, 100)",
    fontSize: 14,
    fontStyle: "italic",
  },
  hotelItem: {
    marginLeft: 15,
    marginRight: 15,
    marginTop: 15,
    flexDirection: "row",
    backgroundColor: "white",
    borderRadius: 12,
    padding: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  hotelImage: {
    width: 120,
    height: 100,
    borderRadius: 8,
  },
  hotelInfo: {
    justifyContent: "center",
    marginLeft: 15,
    flex: 1,
  },
  hotelName: {
    fontSize: 18,
    fontWeight: "500",
  },
  hotelAddress: {
    fontSize: 14,
    marginTop: 5,
    color: "rgb(80, 80, 80)",
  },
  hotelRegion: {
    fontSize: 14,
    marginTop: 3,
    color: "rgb(100, 100, 100)",
  },
  noResults: {
    padding: 30,
    alignItems: "center",
  },
  noResultsText: {
    fontSize: 16,
    color: "rgb(120, 120, 120)",
    textAlign: "center",
  }
});