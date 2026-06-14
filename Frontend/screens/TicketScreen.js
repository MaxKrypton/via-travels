import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  ScrollView,
  useWindowDimensions,
  Button,
} from "react-native";
import React from "react";
import QRCode from "react-native-qrcode-svg";

const TicketScreen = () => {
  const { width } = useWindowDimensions();
  return (
    <SafeAreaView>
        <ScrollView>
      <View>
        <View
          style={{
            width,
            height: 320,
            marginLeft: 10,
            marginRight: 20,
            alignItems: "center",
          }}
        >
          <QRCode size={300} style={styles.qrcode} logo={require("../assets/images/logo.png")} logoSize={100} logoBackgroundColor="#fff" logoMargin={10}/>
        </View>
        <View style={{justifyContent:"space-between", alignItems:"center", flexDirection:"row", marginLeft: 20, marginTop: 10, marginRight: 20}}>
            <Text style={{fontSize: 20, fontWeight: 500}}>Hotel Name</Text>
            <Text style={{fontSize: 20, color: "gray"}}>Grand Palase Hotel</Text>
        </View>
        <View
            style={{
              width: "90%",
              borderColor: "black",
              borderWidth: 0.5,
              marginTop: 10,
              marginLeft: 20,
            }}
          ></View>
           <View style={{justifyContent:"space-between", alignItems:"center", flexDirection:"row", marginLeft: 20, marginTop: 20, marginRight: 20}}>
            <Text style={{fontSize: 18, fontWeight: 500}}>Booking Date</Text>
            <Text style={{fontSize: 18, color: "gray"}}>December 21 2024</Text>
        </View>
           <View style={{justifyContent:"space-between", alignItems:"center", flexDirection:"row", marginLeft: 20, marginTop: 20, marginRight: 20}}>
            <Text style={{fontSize: 18, fontWeight: 500}}>Check In</Text>
            <Text style={{fontSize: 18, color: "gray"}}>October 21 2024</Text>
        </View>
           <View style={{justifyContent:"space-between", alignItems:"center", flexDirection:"row", marginLeft: 20, marginTop: 20, marginRight: 20}}>
            <Text style={{fontSize: 18, fontWeight: 500}}>Check Out</Text>
            <Text style={{fontSize: 18, color: "gray"}}>November 03 2024</Text>
        </View>
           <View style={{justifyContent:"space-between", alignItems:"center", flexDirection:"row", marginLeft: 20, marginTop: 20, marginRight: 20}}>
            <Text style={{fontSize: 18, fontWeight: 500}}>Guests</Text>
            <Text style={{fontSize: 18, color: "gray"}}>5 Person</Text>
        </View>
           <View style={{justifyContent:"space-between", alignItems:"center", flexDirection:"row", marginLeft: 20, marginTop: 20, marginRight: 20}}>
            <Text style={{fontSize: 18, fontWeight: 500}}>Rooms</Text>
            <Text style={{fontSize: 18, color: "gray"}}>5 Singles</Text>
        </View>
        <View
            style={{
              width: "90%",
              borderColor: "black",
              borderWidth: 0.5,
              marginTop: 10,
              marginLeft: 20,
            }}
          ></View>
          <View style={{justifyContent:"space-between", alignItems:"center", flexDirection:"row", marginLeft: 20, marginTop: 20, marginRight: 20}}>
            <Text style={{fontSize: 18, fontWeight: 500}}>Amount</Text>
            <Text style={{fontSize: 18, color: "gray"}}>$4500</Text>
        </View>
          <View style={{justifyContent:"space-between", alignItems:"center", flexDirection:"row", marginLeft: 20, marginTop: 20, marginRight: 20}}>
            <Text style={{fontSize: 18, fontWeight: 500}}>Tax</Text>
            <Text style={{fontSize: 18, color: "gray"}}>$50</Text>
        </View>
          <View style={{justifyContent:"space-between", alignItems:"center", flexDirection:"row", marginLeft: 20, marginTop: 60, marginRight: 20}}>
            <Text style={{fontSize: 18, fontWeight: 500}}>Total</Text>
            <Text style={{fontSize: 18, color: "gray"}}>$4550</Text>
        </View>
        <View
            style={{
              width: "90%",
              borderColor: "black",
              borderWidth: 0.5,
              marginTop: 10,
              marginLeft: 20,
            }}
          ></View>
          <View style={{justifyContent:"space-between", alignItems:"center", flexDirection:"row", marginLeft: 20, marginTop: 30, marginRight: 20}}>
            <Text style={{fontSize: 18, fontWeight: 500}}>Name</Text>
            <Text style={{fontSize: 18, color: "gray"}}>Alain Quentin</Text>
        </View>
          <View style={{justifyContent:"space-between", alignItems:"center", flexDirection:"row", marginLeft: 20, marginTop: 30, marginRight: 20}}>
            <Text style={{fontSize: 18, fontWeight: 500}}>Phone</Text>
            <Text style={{fontSize: 18, color: "gray"}}>+250783520488</Text>
        </View>
          <View style={{justifyContent:"space-between", alignItems:"center", flexDirection:"row", marginLeft: 20, marginTop: 30, marginRight: 20}}>
            <Text style={{fontSize: 18, fontWeight: 500}}>Transcation ID</Text>
            <Text style={{fontSize: 18, color: "gray"}}>KSHF-NS45KSF-345</Text>
        </View>
        <View style={{flexDirection: "row", justifyContent:"space-between", alignItems:"center"}}>
            <View style={{backgroundColor:"#1995AD", marginLeft: 20, marginRight: 20, marginTop: 30, height: 60, padding: 10, borderRadius: 50, marginBottom: 20}}>
                <Button title="Download Ticket" color="white"/>
            </View>
            <View style={{backgroundColor:"red", marginRight: 20, marginTop: 30, height: 60, padding: 10, borderRadius: 50, marginBottom: 20,}}>
                <Button title="Cancel Booking" color="white"/>
            </View>
            </View>
      </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default TicketScreen;

const styles = StyleSheet.create({
  qrcode: {
    width: 300,
  },
});
