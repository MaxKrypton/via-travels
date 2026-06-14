import {
  View,
  Modal
} from "react-native";
import VideoScroll from "../components/VideoScroll";
import WelcomeScreen from "./WelcomeScreen";
import { useContext} from "react";
import AuthContext from "../context/AuthContext";

const Explore = () => {

  const {signedIn} = useContext(AuthContext)

  if(!signedIn){
    return (
      <Modal visible={true} animationType="slide">
        <WelcomeScreen />
      </Modal>)
  } else{
    return (
      <View style={{flex:1, backgroundColor:"#000"}}>
       <VideoScroll/>
      </View>
    );
  }

  
};

export default Explore;
