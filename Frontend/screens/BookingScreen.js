// Frontend/screens/BookingScreen.js
import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  FlatList,
  Alert,
  ActivityIndicator,
} from "react-native";
import React, { useContext, useEffect, useState } from "react";
import Entypo from "@expo/vector-icons/Entypo";
import DateTimePicker from "@react-native-community/datetimepicker";
import AuthContext from "../context/AuthContext";
import axios from "axios";
import RoomItem from "../components/RoomItem";

const BookingScreen = ({ navigation, route }) => {
  const { currentID, user, ip, authToken, isAuthenticated } = useContext(AuthContext);
  const hotelId = currentID;
  
  const [adults, setAdults] = useState(1);
  const [children, setChildren] = useState(0);
  const [checkInDate, setCheckInDate] = useState(new Date());
  const [checkOutDate, setCheckOutDate] = useState(
    new Date(Date.now() + 86400000)
  );
  const [roomInfo, setRoomInfo] = useState([]);
  const [roomPrices, setRoomPrices] = useState({});
  const [totalPrice, setTotalPrice] = useState(0);
  const [serviceFee] = useState(10);
  const [hotelName, setHotelName] = useState("");
  const [loading, setLoading] = useState(false);
  const [isLoadingRooms, setIsLoadingRooms] = useState(true);

  useEffect(() => {
    fetchHotelAndRoomInfo();

    // Restore booking state if returning from login
    if (route.params?.bookingData) {
      const { adults: savedAdults, children: savedChildren, checkInDate: savedCheckIn, checkOutDate: savedCheckOut, roomPrices: savedRoomPrices } = route.params.bookingData;

      if (savedAdults) setAdults(savedAdults);
      if (savedChildren) setChildren(savedChildren);
      if (savedCheckIn) setCheckInDate(new Date(savedCheckIn));
      if (savedCheckOut) setCheckOutDate(new Date(savedCheckOut));
      if (savedRoomPrices) setRoomPrices(savedRoomPrices);
    }
  }, []);

  const fetchHotelAndRoomInfo = async () => {
    if (!hotelId) {
      Alert.alert("Error", "Hotel information is missing. Please select a hotel first.");
      navigation.goBack();
      return;
    }

    setIsLoadingRooms(true);
    try {
      const hotelResponse = await axios.get(`http://${ip}:8000/api/v1/hotels/profile/${hotelId}`);
      if (hotelResponse.data && hotelResponse.data.data) {
        setHotelName(hotelResponse.data.data.name);
      }

      const roomsResponse = await axios.get(`http://${ip}:8000/api/v1/hotels/rooms/${hotelId}`);
      
      if (roomsResponse.data && roomsResponse.data.data) {
        const roomsData = roomsResponse.data.data;
        
        const formattedRooms = roomsData.map((room) => ({
          id: room.id,
          type: room.type,
          description: room.description || "Comfortable room",
          max_occupancy: room.max_occupancy,
          num_beds: room.num_beds,
          room_size: room.room_size,
          total_inventory: room.total_inventory,
          available_inventory: room.available_inventory || room.total_inventory,
          roomFee: room.roomFee || "50000",
          serviceFee: room.serviceFee || "5000",
          currency: room.currency || "RWF"
        }));
        
        setRoomInfo(formattedRooms);
      }
    } catch (error) {
      console.error("Error fetching hotel/room info:", error);
      Alert.alert("Error", "Failed to load room information. Please try again.");
    } finally {
      setIsLoadingRooms(false);
    }
  };

  const onChangeCheckIn = (e, selectedDate) => {
    if (selectedDate) {
      setCheckInDate(selectedDate);
      if (selectedDate >= checkOutDate) {
        setCheckOutDate(new Date(selectedDate.getTime() + 86400000));
      }
    }
  };

  const onChangeCheckOut = (e, selectedDate) => {
    if (selectedDate && selectedDate > checkInDate) {
      setCheckOutDate(selectedDate);
    } else {
      Alert.alert("Invalid Date", "Check-out must be after check-in date");
    }
  };

  const updateRoomPrice = (roomId, count, pricePerRoom) => {
    setRoomPrices((prev) => {
      const updatedPrices = {
        ...prev,
        [roomId]: {
          count: count,
          pricePerRoom: pricePerRoom,
          totalPrice: pricePerRoom * count,
          roomType: roomInfo.find(r => r.id === roomId)?.type || 'Unknown',
        },
      };
      return updatedPrices;
    });
  };

  useEffect(() => {
    const total = Object.values(roomPrices).reduce(
      (sum, room) => sum + (room.totalPrice || 0),
      0
    );
    setTotalPrice(total);
  }, [roomPrices]);

  const grandTotal = totalPrice + serviceFee;
  const numberOfNights = Math.ceil(
    (checkOutDate - checkInDate) / (1000 * 60 * 60 * 24)
  );

  const validateBooking = () => {
    if (totalPrice === 0) {
      Alert.alert("No Rooms Selected", "Please select at least one room");
      return false;
    }
    if (adults === 0) {
      Alert.alert("No Guests", "Please add at least one adult guest");
      return false;
    }
    if (checkInDate >= checkOutDate) {
      Alert.alert("Invalid Dates", "Check-out must be after check-in date");
      return false;
    }

    // Check if user is authenticated
    if (!isAuthenticated || !authToken) {
      Alert.alert(
        "Login Required",
        "Please login to proceed with your booking",
        [
          {
            text: "Cancel",
            style: "cancel"
          },
          {
            text: "Login",
            onPress: () => {
              // Save booking state to return here after login
              navigation.navigate('SignIn', {
                returnTo: 'Booking',
                returnParams: {
                  hotelId: hotelId,
                  bookingData: {
                    adults,
                    children,
                    checkInDate: checkInDate.toISOString(),
                    checkOutDate: checkOutDate.toISOString(),
                    roomPrices
                  }
                }
              });
            }
          }
        ]
      );
      return false;
    }

    return true;
  };

  const createBooking = async () => {
    if (!validateBooking()) return;

    setLoading(true);

    try {
      // Prepare room types data for backend
      const roomTypes = Object.entries(roomPrices)
        .filter(([_, data]) => data.count > 0)
        .map(([roomId, data]) => ({
          roomtypeId: roomId,
          num_rooms: data.count,
          num_guests: Math.ceil(adults / data.count), // Distribute guests across rooms
        }));

      const bookingPayload = {
        check_in_date: checkInDate.toISOString().split('T')[0],
        check_out_date: checkOutDate.toISOString().split('T')[0],
        roomTypes: roomTypes,
        total_price: grandTotal,
      };

      console.log('Creating booking with payload:', JSON.stringify(bookingPayload, null, 2));

      const response = await axios.post(
        `http://${ip}:8000/api/v1/hotels/booking/create/${hotelId}`,
        bookingPayload,
        {
          headers: {
            'Authorization': `Bearer ${authToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      console.log('Booking response:', response.data);

      if (response.data.status === 201 && response.data.data) {
        const { booking, checkout_url } = response.data.data;
        
        // Prepare booking data for payment screen
        const selectedRooms = Object.entries(roomPrices)
          .filter(([_, data]) => data.count > 0)
          .map(([roomId, data]) => ({
            roomId: roomId,
            roomType: data.roomType,
            count: data.count,
            pricePerRoom: data.pricePerRoom,
            totalPrice: data.totalPrice,
          }));

        const bookingData = {
          booking_id: booking.id,
          hotel_id: hotelId,
          hotel_name: hotelName,
          check_in: checkInDate.toLocaleDateString(),
          check_out: checkOutDate.toLocaleDateString(),
          adults: adults,
          children: children,
          rooms: selectedRooms,
          nights: numberOfNights,
          checkout_url: checkout_url,
          tx_ref: booking.tx_ref,
        };

        // Navigate to payment screen
        navigation.navigate("Payment", {
          bookingId: booking.id,
          grandTotal: grandTotal,
          bookingData: bookingData,
        });
      } else {
        Alert.alert('Booking Failed', response.data.message || 'Failed to create booking');
      }
    } catch (error) {
      console.error('Booking creation error:', error);
      Alert.alert(
        'Booking Failed',
        error.response?.data?.message || 'An error occurred while creating your booking. Please try again.'
      );
    } finally {
      setLoading(false);
      console.log('User object:', user);
console.log('User token:', user?.token);
console.log('User ID:', userId);
    }
  };

  if (isLoadingRooms) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#1995AD" />
          <Text style={styles.loadingText}>Loading rooms...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        {/* Hotel Name */}
        <View style={styles.section}>
          <Text style={styles.hotelName}>{hotelName}</Text>
        </View>

        {/* Date Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Select Dates</Text>
          
          <View style={styles.dateContainer}>
            <View style={styles.dateBox}>
              <Text style={styles.dateLabel}>Check-in</Text>
              <DateTimePicker
                value={checkInDate}
                mode="date"
                display="default"
                onChange={onChangeCheckIn}
                minimumDate={new Date()}
                style={styles.datePicker}
              />
            </View>

            <View style={styles.dateBox}>
              <Text style={styles.dateLabel}>Check-out</Text>
              <DateTimePicker
                value={checkOutDate}
                mode="date"
                display="default"
                onChange={onChangeCheckOut}
                minimumDate={new Date(checkInDate.getTime() + 86400000)}
                style={styles.datePicker}
              />
            </View>
          </View>

          <Text style={styles.nightsText}>
            {numberOfNights} {numberOfNights === 1 ? "night" : "nights"}
          </Text>
        </View>

        {/* Room Details */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Select Rooms</Text>
          {roomInfo && roomInfo.length > 0 ? (
            <FlatList
              data={roomInfo}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <RoomItem item={item} updateRoomPrice={updateRoomPrice} />
              )}
              scrollEnabled={false}
            />
          ) : (
            <Text style={styles.noRoomsText}>No rooms available</Text>
          )}
        </View>

        {/* Guest Details */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Guests</Text>
          
          <View style={styles.guestRow}>
            <Text style={styles.guestLabel}>Adults</Text>
            <View style={styles.counterContainer}>
              <TouchableOpacity
                style={styles.counterButton}
                onPress={() => adults > 1 && setAdults(adults - 1)}
              >
                <Entypo name="minus" size={20} color="white" />
              </TouchableOpacity>
              <Text style={styles.counterText}>{adults}</Text>
              <TouchableOpacity
                style={styles.counterButton}
                onPress={() => setAdults(adults + 1)}
              >
                <Entypo name="plus" size={20} color="white" />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.guestRow}>
            <Text style={styles.guestLabel}>Children</Text>
            <View style={styles.counterContainer}>
              <TouchableOpacity
                style={styles.counterButton}
                onPress={() => children > 0 && setChildren(children - 1)}
              >
                <Entypo name="minus" size={20} color="white" />
              </TouchableOpacity>
              <Text style={styles.counterText}>{children}</Text>
              <TouchableOpacity
                style={styles.counterButton}
                onPress={() => setChildren(children + 1)}
              >
                <Entypo name="plus" size={20} color="white" />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Price Details */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Price Details</Text>
          
          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>Room Fee</Text>
            <Text style={styles.priceValue}>
              {user?.preferred_currency || "RWF"} {totalPrice.toLocaleString()}
            </Text>
          </View>

          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>Service Fee</Text>
            <Text style={styles.priceValue}>
              {user?.preferred_currency || "RWF"} {serviceFee.toLocaleString()}
            </Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.priceRow}>
            <Text style={styles.totalLabel}>Total Price</Text>
            <Text style={styles.totalValue}>
              {user?.preferred_currency || "RWF"} {grandTotal.toLocaleString()}
            </Text>
          </View>
        </View>

        {/* Confirm Button */}
        <TouchableOpacity 
          style={[styles.confirmButton, loading && styles.confirmButtonDisabled]} 
          onPress={createBooking}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <Text style={styles.confirmButtonText}>Proceed to Payment</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

export default BookingScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F7FA",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F5F7FA",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#666",
    fontWeight: "500",
  },
  section: {
    backgroundColor: "#fff",
    marginHorizontal: 15,
    marginTop: 15,
    padding: 20,
    borderRadius: 12,
  },
  hotelName: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#000",
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#000",
    marginBottom: 15,
  },
  dateContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  dateBox: {
    flex: 1,
    marginHorizontal: 5,
  },
  dateLabel: {
    fontSize: 14,
    color: "#666",
    marginBottom: 8,
  },
  datePicker: {
    width: "100%",
  },
  nightsText: {
    fontSize: 16,
    color: "#1995AD",
    marginTop: 10,
    fontWeight: "500",
  },
  noRoomsText: {
    fontSize: 16,
    color: "#999",
    textAlign: "center",
    padding: 20,
  },
  guestRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  guestLabel: {
    fontSize: 18,
    fontWeight: "500",
    color: "#000",
  },
  counterContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  counterButton: {
    backgroundColor: "#1995AD",
    borderRadius: 8,
    padding: 8,
  },
  counterText: {
    fontSize: 18,
    color: "#000",
    marginHorizontal: 20,
    minWidth: 30,
    textAlign: "center",
  },
  priceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  priceLabel: {
    fontSize: 16,
    color: "#666",
  },
  priceValue: {
    fontSize: 16,
    color: "#000",
    fontWeight: "500",
  },
  divider: {
    height: 1,
    backgroundColor: "#E0E0E0",
    marginVertical: 15,
  },
  totalLabel: {
    fontSize: 20,
    fontWeight: "600",
    color: "#000",
  },
  totalValue: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1995AD",
  },
  confirmButton: {
    backgroundColor: "#1995AD",
    marginHorizontal: 15,
    marginTop: 20,
    marginBottom: 30,
    padding: 18,
    borderRadius: 12,
    alignItems: "center",
  },
  confirmButtonDisabled: {
    backgroundColor: "#A0A0A0",
  },
  confirmButtonText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#fff",
  },
});