import { StyleSheet, Text, View, ScrollView, SafeAreaView, FlatList, Image, TouchableOpacity } from 'react-native'
import React from 'react'
import {data} from "../data/reviewdata"
const NotificationScreen = () => {
  return (
    <SafeAreaView>
        <ScrollView>
          {
            data.map( (item) =>{
                return(
                    <>
                    <TouchableOpacity>
                    <View
                style={{
                  marginLeft: 20,
                  marginTop: 20,
                  flexDirection: "row",
                  borderColor: "rgb(233, 233, 233)",
                  borderWidth: 2,
                  marginRight: 10,
                }}
                key={637}
              >
                <Image
                  source={require("../assets/images/singel.jpeg")}
                  style={{ width: 120, height: 100, borderRadius: 10 }}
                />
                <View style={{ justifyContent: "center" }}>
                  <Text
                    style={{ fontSize: 18, fontWeight: 500, marginLeft: 20 }}
                  >
                    {item.name}
                  </Text>
                  <Text
                    style={{
                      fontSize: 15,
                      fontWeight: 500,
                      marginLeft: 20,
                      marginTop: 10,
                      width: "40%"
                    }}
                    numberOfLines={2}
                  >
                    {item.review}
                  </Text>
                </View>
              </View>
              </TouchableOpacity>
                    </>
                )
            })
          }
        </ScrollView>
    </SafeAreaView>
  )
}

export default NotificationScreen

const styles = StyleSheet.create({})