import React from 'react';
import MapView, {Marker} from 'react-native-maps';
import { StyleSheet, View } from 'react-native';

export default function App({location, name}) {
  return (
    <View style={styles.container}>
      <MapView style={styles.map}
      region={location}
      > 
      <Marker 
      coordinate={location}
      title={name}
      />
      
      </MapView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    width: '100%',
    height: 300,
  },
});
