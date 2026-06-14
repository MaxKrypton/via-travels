import { StyleSheet, Text, View, FlatList, Dimensions, Image, useWindowDimensions, TouchableOpacity } from 'react-native'
import React, { useContext, useEffect, useRef, useState } from 'react'
import AuthContext from '../context/AuthContext'
import axios from 'axios'


const Gallery = () => {
    const [media, setMedia] = useState()
    const {currentID, ip} = useContext(AuthContext)
    const {width, height} = useWindowDimensions();
    const IMG_SIZE = 150;
    const SPACING = 10;
    const topRef = useRef()
    const bottomRef = useRef()
    const [activeIndex, setActiveIndex] = useState()
    const scrollToActiveIndex =(index) =>{
        setActiveIndex(index)
        topRef?.current?.scrollToOffset({
            offset: index * width,
            animated: true
        })
        if(index * (IMG_SIZE + SPACING) - IMG_SIZE / 2 > width /2){
            bottomRef?.current?.scrollToOffset({
                offset: index * (IMG_SIZE + SPACING) - width / 2 + IMG_SIZE /2,
                animated: true
            })
        }
    }

  useEffect(() =>{
    const url = `http://${ip}:8000/api/v1/hotels/profile/${currentID}`
    axios.get(url)
    .then((response) => {
      const result = response.data
      const photos = result.data.media
      setMedia(photos)
    })
  }, [])

  return (
    <View style={{width, height}}>
      <FlatList 
      data={media}
      ref={topRef}
      onMomentumScrollEnd={e =>{
        scrollToActiveIndex(Math.floor(e.nativeEvent.contentOffset.x / width))
      }}
      pagingEnabled
      horizontal={true}
      renderItem={({item}) =>(
        <View>
            <Image source={{uri: `${item.url}`}}
            style={{width, height: "100%"}}
            />
        </View>
      )}
      />
      <FlatList 
      ref={bottomRef}
      data={media}
      pagingEnabled
      horizontal={true}
      contentContainerStyle={{paddingHorizontal: 20}}
      style={{position: "absolute", bottom: 100}}
      renderItem={({item, index}) =>(
        <TouchableOpacity onPress={() =>{scrollToActiveIndex(index)}}>
            <Image source={{uri: `${item.url}`}}
            style={{width: IMG_SIZE, 
                height: 200, 
                borderRadius: 10, 
                marginRight: SPACING,
                borderWidth: 4,
                borderColor: activeIndex === index ? "#fff" : "transparent"
            }}
            />
        </TouchableOpacity>
      )}
      />
    </View>
  )
}

export default Gallery