import { View, Text } from 'react-native'
import React from 'react'
import { Video, ResizeMode } from "expo-av";

const Loading = () => {
  return (
    <View style={{flex: 1,
        justifyContent: 'center',
        alignItems: 'center',}}>
      <Video 
      source={require("../assets/videos/Fload.mp4")}
      isLooping={true}
      style={{
        width: 100, 
        height: 100,
    
    }}
      shouldPlay={true}
      />
    </View>
  )
}

export default Loading