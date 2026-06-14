import { StyleSheet, Text, View, FlatList, TouchableOpacity } from "react-native";
import React from "react";
import { categories } from "../data/categoriesData";

const Categories = ({font}) => {
  return (
    <View>
      <FlatList
        horizontal={true}
        showsHorizontalScrollIndicator={false}
        data={categories}
        renderItem={({ item }) => (
            <TouchableOpacity>
          <View
            style={{
              marginLeft: 20,
              marginTop: 20,
              alignItems: "center",
              justifyContent: "space-between",
              borderColor: "rgb(230, 230, 230)",
              borderWidth: 1,
              padding: 10,
              borderRadius: 20,
              flexDirection: "row"
            }}
          >
            {item.icon}
            <Text style={{fontFamily:"Inter", fontSize: 15, fontWeight: 500}}>{item.category}</Text>
          </View>
          </TouchableOpacity>
        )}
      />
    </View>
  );
};

export default Categories;

const styles = StyleSheet.create({});
