import React, { useContext } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import HomeScreen from "../screens/HomeScreen";
import ExploreScreen from "../screens/ExploreScreen";
import ReservationScreen from "../screens/MyTrips";
import HotelProfile from "../screens/HotelProfile";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import Gallery from "../screens/Gallery";
import ReviewsScreen from "../screens/ReviewsScreen";
import TicketScreen from "../screens/TicketScreen";
import TopPlacesGallery from "../screens/TopPlacesGallery";
import SearchScreen from "../screens/SearchScreen";
import BookingScreen from "../screens/BookingScreen";
import NotificationScreen from "../screens/NotificationScreen";
import ProfileScreen from "../screens/ProfileScreen";
import SignInScreen from "../screens/SigninScreen";
import SignUpScreen from "../screens/SignUpScreen";
import PersonalDetails from "../components/PersonalDetails";
import loading from "../screens/LoadingScreen";
import PrivacyScreen from "../screens/PrivacyScreen";
import HelpSupportScreen from "../screens/HelpSupportScreen";
import TermsConditionsScreen from "../screens/TermsConditionsScreen";
import ReportProblemScreen from "../screens/ReportProblem";
import SecurityScreen from "../screens/SecurityScreen";
import PaymentScreen from "../screens/PaymentScreen";
import BookingConfirmationScreen from "../selection/BookingConfirmationScreen";
import WelcomeScreen from "../screens/WelcomeScreen";
import AuthContext from "../context/AuthContext";
import { ActivityIndicator, View } from "react-native";

// Screen names
const HomeScreenName = "Home";
const ExploreScreenName = "Explore";
const ReservationScreenName = "My Trips";
const SearchScreenName = "Search";
const ProfileScreenName = "Profile";

// Static Navigation

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

const TabNavigator = () => {
  return (
    <Tab.Navigator
      initialRouteName={HomeScreenName}
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          if (route.name === HomeScreenName) {
            iconName = focused ? "home" : "home-outline";
          } else if (route.name === ExploreScreenName) {
            iconName = focused ? "compass" : "compass-outline";
          } else if (route.name === ReservationScreenName) {
            iconName = focused ? "bookmarks" : "bookmarks-outline";
          } else if (route.name === SearchScreenName) {
            iconName = focused ? "search" : "search-outline";
          } else if (route.name === ProfileScreenName) {
            iconName = focused ? "person" : "person-outline";
          }
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: "#1995AD",
        tabBarInactiveTintColor: "black",
        tabBarStyle: {
          backgroundColor: "#fff",
          height: 70,
        },
        headerShown: false,
      })}
    >
      <Tab.Screen name={HomeScreenName} component={HomeStackNavigator} />
      <Tab.Screen name={SearchScreenName} component={SearchNavigator} />
      <Tab.Screen name={ExploreScreenName} component={ExploreScreen} />
      <Tab.Screen
        name={ReservationScreenName}
        component={MyTripsStackNavigator2}
      />
      <Tab.Screen name={ProfileScreenName} component={ProfileNavigator} />
    </Tab.Navigator>
  );
};

const HomeStackNavigator = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="Home"
        component={HomeScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Hotel Profile"
        component={HotelProfile}
        options={{ headerTransparent: true, headerShown: true, title: "" }}
      />
      <Stack.Screen
        name="Gallery"
        component={Gallery}
        options={{ headerTransparent: true, headerShown: true, title: "" }}
      />
      <Stack.Screen
        name="Reviews"
        component={ReviewsScreen}
        options={{ headerTransparent: true, headerShown: true, title: "" }}
      />
      <Stack.Screen
        name="Top Places Gallery"
        component={TopPlacesGallery}
        options={{ headerTransparent: true, headerShown: true, title: "Top" }}
      />
      <Stack.Screen
        name="Booking"
        component={BookingScreen}
        options={{
          headerTransparent: true,
          headerShown: true,
          title: "Booking Details",
        }}
      />
      <Stack.Screen
        name="Notification"
        component={NotificationScreen}
        options={{
          headerTransparent: true,
          headerShown: true,
          title: "Notification",
        }}
      />
    </Stack.Navigator>
  );
};

const SearchNavigator = () => {
  return (
    <Stack.Navigator initialRouteName={SearchScreenName}>
      <Stack.Screen
        name={SearchScreenName}
        component={SearchScreen}
        options={{ headerTransparent: true, headerShown: true, title: "" }}
      />
      <Stack.Screen
        name="Hotel Profile"
        component={HotelProfile}
        options={{ headerTransparent: true, headerShown: true, title: "" }}
      />
      <Stack.Screen
        name="Booking"
        component={BookingScreen}
        options={{
          headerTransparent: true,
          headerShown: true,
          title: "Booking Details",
        }}
      />
      <Stack.Screen
        name="Reviews"
        component={ReviewsScreen}
        options={{ headerTransparent: true, headerShown: true, title: "" }}
      />
      <Stack.Screen
        name="Gallery"
        component={Gallery}
        options={{ headerTransparent: true, headerShown: true, title: "" }}
      />
      <Stack.Screen
        name="Payment"
        component={PaymentScreen}
        options={{
          headerTransparent: true,
          headerShown: true,
          title: "Payment",
        }}
      />

      <Stack.Screen
        name="BookingConfirmation"
        component={BookingConfirmationScreen}
        options={{
          headerShown: false,
        }}
      />
    </Stack.Navigator>
  );
};

const MyTripsStackNavigator2 = () => {
  return (
    <Stack.Navigator initialRouteName={ReservationScreenName}>
      <Stack.Screen
        name={ReservationScreenName}
        component={ReservationScreen}
        options={{ headerTransparent: true, headerShown: true, title: "" }}
      />
      <Stack.Screen
        name="Tickets Screen"
        component={TicketScreen}
        options={{
          headerTransparent: true,
          headerShown: true,
          title: "Booking Ticket",
        }}
      />
    </Stack.Navigator>
  );
};

const ProfileNavigator = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name={ProfileScreenName}
        component={ProfileScreen}
        options={{ headerTransparent: true, headerShown: true, title: "" }}
      />
      <Stack.Screen
        name="Personal Info"
        component={PersonalDetails}
        options={{ headerTransparent: true, headerShown: true, title: "" }}
      />
      <Stack.Screen
        name="HelpSupport"
        component={HelpSupportScreen}
        options={{ headerTransparent: true, headerShown: true, title: "" }}
      />
      <Stack.Screen
        name="Privacy"
        component={PrivacyScreen}
        options={{ headerTransparent: true, headerShown: true, title: "" }}
      />
      <Stack.Screen
        name="ReportProblem"
        component={ReportProblemScreen}
        options={{ headerTransparent: true, headerShown: true, title: "" }}
      />
      <Stack.Screen
        name="Security"
        component={SecurityScreen}
        options={{ headerTransparent: true, headerShown: true, title: "" }}
      />
      <Stack.Screen
        name="TermsCondition"
        component={TermsConditionsScreen}
        options={{ headerTransparent: true, headerShown: true, title: "" }}
      />
    </Stack.Navigator>
  );
};

export default function AppNavigation() {
  const { isAuthenticated, isLoading } = useContext(AuthContext);

  return (
    <NavigationContainer>
      {isLoading ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' }}>
          <ActivityIndicator size="large" color="#1995AD" />
        </View>
      ) : isAuthenticated ? (
        <TabNavigator />
      ) : (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Welcome" component={WelcomeScreen} />
          <Stack.Screen name="SignIn" component={SignInScreen} />
          <Stack.Screen name="SignUp" component={SignUpScreen} />
        </Stack.Navigator>
      )}
    </NavigationContainer>
  );
}
