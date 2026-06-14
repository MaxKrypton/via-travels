import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  FlatList,
  Image,
  TouchableOpacity,
  TextInput,
  ScrollView
} from "react-native";
import React, { useContext } from "react";
import { paymentMethods } from "../data/paymentMethod";
import AuthContext from "../context/AuthContext";

const Payment = ({grandTotal}) => {
  const { setShowConfirmation } = useContext(AuthContext);
  return (
    <SafeAreaView
      style={{ backgroundColor: "rgb(235, 238, 242)", height: "100%" }}
    >
      <ScrollView>
      <View style={{ alignItems: "center", justifyContent: "center" }}>
        <Text style={{ fontSize: 25, fontWeight: "500" }}>Payment</Text>
      </View>
      <View style={{ marginLeft: 20, marginTop: 40 }}>
        <Text style={{ fontSize: 16, fontWeight: "400" }}>Total Price</Text>
        <Text
          style={{
            fontSize: 44,
            fontWeight: 400,
            marginTop: 10,
            fontWeight: "bold",
            color: "#1995AD",
          }}
        >
          ${grandTotal}
        </Text>
        <Text style={{ fontSize: 16, fontWeight: 400, marginTop: 40 }}>
          Payment Method
        </Text>
        <FlatList
          data={paymentMethods}
          horizontal={true}
          showsHorizontalScrollIndicator={false}
          renderItem={({ item }) => (
            <TouchableOpacity>
              <View
                style={{
                  borderColor: "rgb(230, 230, 230)",
                  borderWidth: 1,
                  width: 100,
                  height: 50,
                  marginTop: 20,
                  padding: 10,
                  marginRight: 20,
                  borderRadius: 10,
                  flexDirection: "row",
                  backgroundColor: "rgb(255, 255, 255)",
                }}
              >
                <Image
                  source={item.logo}
                  style={{ width: "100%", height: "100%" }}
                />
              </View>
            </TouchableOpacity>
          )}
        />

        {/* Card Number */}

        <Text style={{ fontSize: 16, fontWeight: 400, marginTop: 30 }}>
          Card Number
        </Text>
        <View
          style={{
            width: "95%",
            height: 60,
            backgroundColor: "rgb(250,250,250)",
            padding: 20,
            borderRadius: 10,
            marginTop: 20,
            borderColor: "rgb(230, 230, 230)",
            borderWidth: 1,
          }}
        >
          <TextInput placeholder="Card Number" fontSize={18} />
        </View>

        <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
          {/* Valid Number */}

          <View style={{ width: "50%" }}>
            <Text style={{ fontSize: 16, fontWeight: 400, marginTop: 30 }}>
              Valid until
            </Text>
            <View
              style={{
                height: 60,
                backgroundColor: "rgb(250,250,250)",
                padding: 20,
                borderRadius: 10,
                marginTop: 10,
                borderColor: "rgb(230, 230, 230)",
                borderWidth: 1,
              }}
            >
              <TextInput placeholder="Month/Year" fontSize={18} />
            </View>
          </View>

          {/* CVV */}

          <View style={{ marginRight: 20, width: "40%", marginLeft: 20 }}>
            <Text style={{ fontSize: 16, fontWeight: 400, marginTop: 30 }}>
              CVV
            </Text>
            <View
              style={{
                width: "100%",
                height: 60,
                backgroundColor: "rgb(250,250,250)",
                padding: 20,
                borderRadius: 10,
                marginTop: 10,
                borderColor: "rgb(230, 230, 230)",
                borderWidth: 1,
              }}
            >
              <TextInput placeholder="CVV" fontSize={18} />
            </View>
          </View>
        </View>

        {/* Card Name */}

        <Text style={{ fontSize: 16, fontWeight: 400, marginTop: 20 }}>
          Card Holder
        </Text>
        <View
          style={{
            width: "95%",
            height: 60,
            backgroundColor: "rgb(250,250,250)",
            padding: 20,
            borderRadius: 10,
            marginTop: 20,
            borderColor: "rgb(230, 230, 230)",
            borderWidth: 1,
          }}
        >
          <TextInput placeholder="Your name and surname" fontSize={18} />
        </View>

        {/* Button */}

        <View
          style={{
            width: "95%",
            height: 70,
            backgroundColor: "#1995AD",
            marginTop: 30,
            borderRadius: 10,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Text style={{ fontSize: 25, fontWeight: "bold", color: "white" }}>
            Pay Now
          </Text>
        </View>

        {/* back button */}

        <TouchableOpacity
          onPress={() => {
            setShowConfirmation(false);
          }}
        >
          <View
            style={{
              width: "95%",
              height: 50,
              marginTop: 10,
              borderRadius: 10,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Text style={{ fontSize: 20, fontWeight: 600, color: "black" }}>
              Back
            </Text>
          </View>
        </TouchableOpacity>
      </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Payment;

const styles = StyleSheet.create({});
