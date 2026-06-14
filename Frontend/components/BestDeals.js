import {
  StyleSheet,
  Text,
  View,
  FlatList,
  TouchableOpacity,
} from "react-native";
import React from "react";
import { data } from "../data/data";
import TrendingPlaces from "./BestDealPlaces";
import { useNavigation } from "@react-navigation/native";

const Trending = () => {
const navigation = useNavigation()

  return (
    <View>
      <FlatList
        horizontal={true}
        style={{ paddingVertical: 5 }}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ gap: 20, paddingHorizontal: 12 }}
        data={data}
        keyExtractor={(item, idx) => item + idx}
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => navigation.navigate('Hotel Profile')}>
            <TrendingPlaces item={item}/>
          </TouchableOpacity>
        )}
      />
    </View>
  );
};

export default Trending;
