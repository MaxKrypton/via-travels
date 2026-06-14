import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
    container: {
      backgroundColor: "#007A8C",
      flex: 1,
    },
    main: {
      marginLeft: "10",
      marginRight: 10,
      display: "flex",
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    profile: {
      marginTop: 10,
      width: 50,
      height: 50,
      justifyContent:"center",
      alignItems:"center"
    },
    search: {
      marginTop: 20,
      marginLeft: 15,
      marginRight: 10,
      height: 50,
      borderWidth: 1,
      backgroundColor: "rgb(255, 255, 255)",
      borderRadius: 10,
      alignItems: "center",
      flexDirection: "row",
      borderColor:"rgb(233, 233, 233)"
    },
    ticket: {
      width: 416 / 1.18,
      height: 234 / 1.18,
      marginLeft: 10,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.5,
      shadowRadius: 5,
      marginTop:10
    },
    arrival:{
        justifyContent: "space-between",
        alignItems:"center",
        position: "absolute",
        flexDirection:"row",
        top: 90,
        left: 40,
        gap: 40
    },
    booking:{
        position: "absolute",
        top: 160,
        left: 30,
        justifyContent: "space-between",
        alignItems:"center",
        flexDirection: "row",
        gap: 150

    },
    list:{
      borderWidth: 1,
      marginRight: 10,
      marginLeft: 15,
      height: 150,
      marginTop: 20,
      borderRadius: 10,
      backgroundColor: "white",
      shadowColor:"#000",
      shadowOffset:{width: 0, height: 5},
      shadowOpacity: 0.4,
      flexDirection:"row",
      marginBottom: 10,
      borderColor:"rgb(234, 234, 234)"
    },
    video:{
      flex:1,
    },
    content:{
      flex:1,
    },
    overlay:{
      flex:1,
      backgroundColor:"black",

    }
  });


  export default styles