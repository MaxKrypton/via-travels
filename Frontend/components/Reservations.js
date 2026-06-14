import {
  StyleSheet,
  Text,
  View,
  Image,
  Pressable,
  TouchableOpacity,
  FlatList,
} from "react-native";
import React, { useState } from "react";
import { rsdata } from "../data/reservationsData";
import Entypo from "@expo/vector-icons/Entypo";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { useNavigation } from "@react-navigation/native";

const Reservations = ({font}) => {
  const [data, setData] = useState(rsdata);
  const navigation = useNavigation();
  return (
    <View key={5757}>
      <FlatList
        data={rsdata}
        renderItem={({ item }) => (
          <Pressable>
            <TouchableOpacity onPress={ () =>
               navigation.navigate("Tickets Screen")}>
              <View
                key={item.id}
                style={{
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Text style={{ fontSize: 17, marginTop: 15, fontWeight: 500, fontFamily:"Inter" }}>
                  12 Dec - 12 Jan, 1 room - 2 Adults
                </Text>
              </View>
              <View style={styles.box}>
                <Image
                  source={item.img}
                  style={{ width: "100%", height: 200, borderRadius: 10 }}
                />
                <View
                  style={{
                    justifyContent: "space-between",
                    alignItems: "center",
                    flexDirection: "row",
                    marginTop: 10,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 25,
                      marginLeft: 20,
                      fontWeight: "bold",
                      marginRight: 10,
                      fontFamily: "Inter"
                    }}
                  >
                    {item.name}
                  </Text>
                  <Text
                    style={{
                      fontSize: 25,
                      marginLeft: 20,
                      fontWeight: "bold",
                      marginRight: 20,
                      fontFamily: "Inter"
                    }}
                  >
                    {item.price}
                  </Text>
                </View>
                <View
                  style={{
                    justifyContent: "space-between",
                    alignItems: "center",
                    flexDirection: "row",
                    marginTop: 5,
                    marginBottom: 10,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 15,
                      marginLeft: 15,
                      marginRight: 10,
                      marginBottom: 5,
                      fontFamily: "Inter"
                    }}
                  >
                    <Entypo name="location-pin" size={24} color="#007A8C" />{" "}
                    {item.adresse}
                  </Text>
                  <Text
                    style={{
                      fontSize: 15,
                      marginLeft: 20,
                      marginRight: 20,
                      fontFamily: "Inter"
                    }}
                  >
                    per night
                  </Text>
                </View>
                <View
                  style={{
                    justifyContent: "space-between",
                    alignItems: "center",
                    flexDirection: "row",
                    marginTop: 5,
                    marginBottom: 10,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 15,
                      marginLeft: 20,
                      marginRight: 10,
                      marginBottom: 5,
                      fontFamily: "Inter"
                    }}
                  >
                    <FontAwesome name="star" size={24} color="#007A8C" />
                    <FontAwesome name="star" size={24} color="#007A8C" />
                    <FontAwesome name="star" size={24} color="#007A8C" />
                    <FontAwesome name="star" size={24} color="#007A8C" />
                    <FontAwesome name="star" size={24} color="#007A8C" />
                  </Text>
                  <Text
                    style={{
                      fontSize: 15,
                      marginLeft: 20,
                      marginRight: 20,
                      fontFamily: "Inter"
                    }}
                  >
                    4-stars
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          </Pressable>
        )}
      />
    </View>
  );
};

export default Reservations;

const styles = StyleSheet.create({
  box: {
    margin: 15,
    borderRadius: 10,
    backgroundColor: "rgb(265, 265, 265)",
    borderColor:"rgb(220, 220, 220)"
  },
});
