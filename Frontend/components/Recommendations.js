import { Text, View, Image, TouchableOpacity, Pressable } from "react-native";
import React, { useState, useContext, useEffect } from "react";
import { rcdata } from "../data/rcdata";
import styles from "../GlobalStyling";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useNavigation } from "@react-navigation/native";
import AuthContext from "../context/AuthContext";

const Recommendations = () => {
  ;
  const navigation = useNavigation();
  const { hotelData } = useContext(AuthContext)
  const [data, setData] = useState(hotelData)

  return (
    <View>
      <Text
            style={{
              marginLeft: 15,
              fontSize: 25,
              fontWeight: 500,
            }}
          >
            Journey Today
          </Text>
      {data && data.map((item) => {
        return (
          <View style={styles.list} key={item.id}>
            <View>
              <Image
                source={{uri: `${item.media[2].url}`}}
                style={{ height: "100%", width: 130, borderRadius: 10 }}
              />
            </View>
            <View>
              <Text
                style={{
                  marginLeft: 15,
                  fontSize: 19,
                  marginTop: 10,
                  fontWeight: 700,
                }}
              >
                {item.name}
              </Text>
              <Text style={{ marginTop: 10, marginLeft: 15, fontSize: 16 }}>
                {item.streetAddress}
              </Text>
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginTop: 10,
                }}
              >
                <View
                  marginLeft={10}
                  marginTop={10}
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <MaterialIcons name="star-rate" size={24} color="#C5630C" />
                  <Text marginTop={5} marginLeft={5}>
                    {item.starRating}-Star Rating
                  </Text>
                </View>
                <Pressable>
                  <TouchableOpacity
                    onPress={() => {
                      navigation.navigate("Hotel Profile");
                    }}
                  >
                    <View
                      style={{
                        backgroundColor: "#1995AD",
                        borderRadius: 10,
                        marginTop: 10,
                        width: 70,
                        justifyContent: "center",
                        alignItems: "center",
                        height: 40,
                        marginLeft: 20
                      }}
                    >
                      <Text
                        style={{
                          color: "white",
                          padding: 10,
                          fontSize: 18,
                          fontWeight: "bold",
                        }}
                      >
                        Book
                      </Text>
                    </View>
                  </TouchableOpacity>
                </Pressable>
              </View>
            </View>
          </View>
        );
      })}
    </View>
  );
};

export default Recommendations;
