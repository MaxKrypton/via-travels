import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  Image,
  ScrollView,
  SafeAreaView,
  Alert,
  ActivityIndicator,
} from "react-native";
import React, { useState, useContext, useEffect } from "react";
import DateTimePicker from "@react-native-community/datetimepicker";
import Toast from "react-native-toast-message";
import axios from "axios";
import * as ImagePicker from 'expo-image-picker';
import AuthContext from "../context/AuthContext";
import { useCurrency } from "../context/CurrencyContext";
import { CurrencySelector } from "./CurrencySelector";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import Ionicons from "@expo/vector-icons/Ionicons";

const PersonalDetails = () => {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [birthDate, setBirthDate] = useState(new Date());
  const [avatar, setAvatar] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showCurrencyPicker, setShowCurrencyPicker] = useState(false);

  const { user, ip, authToken } = useContext(AuthContext);
  const { selectedCurrency, changeCurrency } = useCurrency();

  // Load user data on mount
  useEffect(() => {
    if (user) {
      setFirstName(user.first_name || "");
      setLastName(user.last_name || "");
      setPhoneNumber(user.phone_number || "");
      if (user.date_of_birth) {
        setBirthDate(new Date(user.date_of_birth));
      }
      if (user.avatar_url) {
        setAvatar(user.avatar_url);
      }
      if (user.preferred_currency) {
        changeCurrency(user.preferred_currency);
      }
    }
  }, [user]);

  const onChangeBirthdate = (e, selectedDate) => {
    if (selectedDate) {
      setBirthDate(selectedDate);
    }
  };

  const pickImage = async () => {
    try {
      // Request permissions
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (status !== 'granted') {
        Alert.alert(
          'Permission Required',
          'Please grant camera roll permissions to change your profile picture'
        );
        return;
      }

      // Launch image picker
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets[0]) {
        setAvatar(result.assets[0].uri);
        Toast.show({
          type: "success",
          text1: "Photo Selected",
          text2: "Don't forget to save your changes",
        });
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image. Please try again.');
    }
  };

  const handleSubmit = async () => {
    // Validation
    if (!firstName.trim()) {
      Alert.alert("Error", "Please enter your first name");
      return;
    }

    if (!lastName.trim()) {
      Alert.alert("Error", "Please enter your last name");
      return;
    }

    if (!phoneNumber.trim()) {
      Alert.alert("Error", "Please enter your phone number");
      return;
    }

    setIsLoading(true);

    try {
      const formData = new FormData();

      // Add image if it's a new local file
      if (avatar && avatar.startsWith('file://')) {
        formData.append('profilePicture', {
          uri: avatar,
          type: 'image/jpeg',
          name: 'profile.jpg',
        });
      }

      // Add other fields
      formData.append('first_name', firstName.trim());
      formData.append('last_name', lastName.trim());
      formData.append('phone_number', phoneNumber.trim());
      formData.append('date_of_birth', birthDate.toISOString().split('T')[0]);
      formData.append('preferred_language', 'en');
      formData.append('preferred_currency', selectedCurrency);

      const response = await axios.patch(
        `http://${ip}:8000/api/v1/profile/update/${user.id}`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            'Authorization': `Bearer ${authToken}`
          }
        }
      );

      if (response.data.success || response.status === 200) {
        Toast.show({
          type: "success",
          text1: "Profile Updated",
          text2: "Your changes have been saved successfully",
        });
        console.log('✅ Profile updated successfully');
      }
    } catch (error) {
      console.error('❌ Profile update error:', error);
      Alert.alert(
        "Update Failed",
        error.response?.data?.message || "Failed to update profile. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Toast />
      <SafeAreaView style={styles.safeArea} />
      <ScrollView style={styles.scrollBackground}>
        <View style={styles.container}>
          <Text style={styles.title}>
            Edit Profile
          </Text>

          {/* Profile Picture */}
          <View style={styles.avatarContainer}>
            <View style={styles.avatarWrapper}>
              {avatar ? (
                <Image
                  source={{ uri: avatar }}
                  style={styles.avatar}
                />
              ) : (
                <View style={styles.avatarPlaceholder}>
                  <MaterialIcons name="person" size={60} color="#8E8E93" />
                </View>
              )}
              <TouchableOpacity
                style={styles.cameraButton}
                onPress={pickImage}
              >
                <MaterialIcons name="camera-alt" size={20} color="white" />
              </TouchableOpacity>
            </View>

            <TouchableOpacity onPress={pickImage} style={styles.changePhotoButton}>
              <Text style={styles.changePhotoText}>
                Change Photo
              </Text>
            </TouchableOpacity>
          </View>

          {/* First Name Input */}
          <Text style={styles.label}>First Name</Text>
          <View style={styles.inputContainer}>
            <MaterialIcons name="person-outline" size={20} color="#8E8E93" />
            <TextInput
              placeholder="First Name"
              placeholderTextColor="#8E8E93"
              style={styles.input}
              value={firstName}
              onChangeText={setFirstName}
            />
          </View>

          {/* Last Name Input */}
          <Text style={styles.label}>Last Name</Text>
          <View style={styles.inputContainer}>
            <MaterialIcons name="person-outline" size={20} color="#8E8E93" />
            <TextInput
              placeholder="Last Name"
              placeholderTextColor="#8E8E93"
              style={styles.input}
              value={lastName}
              onChangeText={setLastName}
            />
          </View>

          {/* Phone Input */}
          <Text style={styles.label}>Phone</Text>
          <View style={styles.inputContainer}>
            <MaterialIcons name="phone" size={20} color="#8E8E93" />
            <TextInput
              placeholder="Phone Number (+250...)"
              placeholderTextColor="#8E8E93"
              style={styles.input}
              value={phoneNumber}
              onChangeText={setPhoneNumber}
              keyboardType="phone-pad"
            />
          </View>

          {/* Birthday Input */}
          <Text style={styles.label}>Birthday</Text>
          <View style={styles.inputContainer}>
            <MaterialIcons name="cake" size={20} color="#8E8E93" />
            <Text style={styles.dateText}>
              {birthDate.toLocaleDateString()}
            </Text>
            <DateTimePicker
              value={birthDate}
              mode="date"
              display="default"
              onChange={onChangeBirthdate}
              maximumDate={new Date()}
              style={styles.datePicker}
            />
          </View>

          {/* Currency Selector */}
          <Text style={styles.label}>Preferred Currency</Text>
          <TouchableOpacity
            style={styles.inputContainer}
            onPress={() => setShowCurrencyPicker(true)}
          >
            <MaterialIcons name="attach-money" size={20} color="#8E8E93" />
            <Text style={styles.input}>
              {selectedCurrency}
            </Text>
            <Ionicons name="chevron-forward" size={20} color="#8E8E93" />
          </TouchableOpacity>

          {/* Save Button */}
          <TouchableOpacity
            onPress={handleSubmit}
            disabled={isLoading}
            style={[styles.saveButton, { opacity: isLoading ? 0.7 : 1 }]}
          >
            {isLoading ? (
              <ActivityIndicator color="white" />
            ) : (
              <>
                <MaterialIcons name="save" size={20} color="white" />
                <Text style={styles.saveButtonText}>Save Changes</Text>
              </>
            )}
          </TouchableOpacity>

          <View style={{ height: 40 }} />
        </View>
      </ScrollView>

      <CurrencySelector
        visible={showCurrencyPicker}
        onClose={() => setShowCurrencyPicker(false)}
      />
    </>
  );
};

export default PersonalDetails;

const styles = StyleSheet.create({
  safeArea: {
    paddingTop: 0,
    backgroundColor: "#FFFFFF",
  },
  scrollBackground: {
    backgroundColor: "#FFFFFF",
  },
  container: {
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 30,
    color: "#1995AD",
  },
  avatarContainer: {
    alignItems: "center",
    marginBottom: 30,
  },
  avatarWrapper: {
    position: "relative",
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  avatarPlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
  },
  cameraButton: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: "white",
    backgroundColor: "#1995AD",
  },
  changePhotoButton: {
    marginTop: 12,
    paddingVertical: 8,
  },
  changePhotoText: {
    color: "#1995AD",
    fontWeight: "600",
  },
  label: {
    alignSelf: "flex-start",
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
    marginTop: 16,
    color: "#1C1C1E",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    width: "100%",
    height: 56,
    paddingHorizontal: 16,
    borderRadius: 12,
    gap: 12,
    backgroundColor: "#FFFFFF",
    borderColor: "#E5E5EA",
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: "#1C1C1E",
  },
  dateText: {
    flex: 1,
    fontSize: 16,
    color: "#1C1C1E",
  },
  datePicker: {
    height: 30,
  },
  saveButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 32,
    width: "100%",
    height: 56,
    borderRadius: 12,
    gap: 8,
    backgroundColor: "#1995AD",
  },
  saveButtonText: {
    fontSize: 18,
    color: "white",
    fontWeight: "bold",
  },
});
