import React, { useContext } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { ActivityIndicator, View } from "react-native";

// Existing screens
import HomeScreen from "../screens/HomeScreen";
import ExploreScreen from "../screens/ExploreScreen";
import HotelProfile from "../screens/HotelProfile";
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
import PrivacyScreen from "../screens/PrivacyScreen";
import HelpSupportScreen from "../screens/HelpSupportScreen";
import TermsConditionsScreen from "../screens/TermsConditionsScreen";
import ReportProblemScreen from "../screens/ReportProblem";
import SecurityScreen from "../screens/SecurityScreen";
import PaymentScreen from "../screens/PaymentScreen";
import BookingConfirmationScreen from "../selection/BookingConfirmationScreen";
import WelcomeScreen from "../screens/WelcomeScreen";
import AuthContext from "../context/AuthContext";

// ── New Via Travels screens ──────────────────────────────────────────────────
import ItineraryScreen from "../screens/ItineraryScreen";
import AttractionsScreen from "../screens/AttractionsScreen";
import SavedItinerariesScreen from "../screens/SavedItinerariesScreen";

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

// ── Tab names ────────────────────────────────────────────────────────────────
const HOME = "Home";
const SEARCH = "Search";
const PLAN = "Plan";
const EXPLORE = "Explore";
const PROFILE = "Profile";

const HOME_MAIN = "Home Main";
const SEARCH_MAIN = "Search Main";
const PLAN_MAIN = "Plan Main";

// ── Tab Navigator ────────────────────────────────────────────────────────────
const TabNavigator = () => (
  <Tab.Navigator
    initialRouteName={HOME}
    screenOptions={({ route }) => ({
      headerShown: false,
      tabBarActiveTintColor: "#1995AD",
      tabBarInactiveTintColor: "black",
      tabBarStyle: { backgroundColor: "#fff", height: 70 },
      tabBarIcon: ({ focused, color, size }) => {
        const icons = {
          [HOME]: focused ? "home" : "home-outline",
          [SEARCH]: focused ? "search" : "search-outline",
          [PLAN]: focused ? "map" : "map-outline",
          [EXPLORE]: focused ? "compass" : "compass-outline",
          [PROFILE]: focused ? "person" : "person-outline",
        };
        return <Ionicons name={icons[route.name]} size={size} color={color} />;
      },
    })}
  >
    <Tab.Screen name={HOME} component={HomeStackNavigator} />
    <Tab.Screen name={SEARCH} component={SearchNavigator} />
    <Tab.Screen name={PLAN} component={PlanStackNavigator} />
    <Tab.Screen name={EXPLORE} component={ExploreScreen} />
    <Tab.Screen name={PROFILE} component={ProfileNavigator} />
  </Tab.Navigator>
);

// ── Home stack ───────────────────────────────────────────────────────────────
const HomeStackNavigator = () => (
  <Stack.Navigator initialRouteName={HOME_MAIN}>
    <Stack.Screen name={HOME_MAIN} component={HomeScreen} options={{ headerShown: false }} />
    <Stack.Screen name="Hotel Profile" component={HotelProfile} options={{ headerTransparent: true, headerShown: true, title: "" }} />
    <Stack.Screen name="Gallery" component={Gallery} options={{ headerTransparent: true, headerShown: true, title: "" }} />
    <Stack.Screen name="Reviews" component={ReviewsScreen} options={{ headerTransparent: true, headerShown: true, title: "" }} />
    <Stack.Screen name="Top Places Gallery" component={TopPlacesGallery} options={{ headerTransparent: true, headerShown: true, title: "Top" }} />
    <Stack.Screen name="Booking" component={BookingScreen} options={{ headerTransparent: true, headerShown: true, title: "Booking Details" }} />
    <Stack.Screen name="Notification" component={NotificationScreen} options={{ headerTransparent: true, headerShown: true, title: "Notification" }} />
  </Stack.Navigator>
);

// ── Search stack ─────────────────────────────────────────────────────────────
const SearchNavigator = () => (
  <Stack.Navigator initialRouteName={SEARCH_MAIN}>
    <Stack.Screen name={SEARCH_MAIN} component={SearchScreen} options={{ headerTransparent: true, headerShown: true, title: "" }} />
    <Stack.Screen name="Hotel Profile" component={HotelProfile} options={{ headerTransparent: true, headerShown: true, title: "" }} />
    <Stack.Screen name="Booking" component={BookingScreen} options={{ headerTransparent: true, headerShown: true, title: "Booking Details" }} />
    <Stack.Screen name="Reviews" component={ReviewsScreen} options={{ headerTransparent: true, headerShown: true, title: "" }} />
    <Stack.Screen name="Gallery" component={Gallery} options={{ headerTransparent: true, headerShown: true, title: "" }} />
    <Stack.Screen name="Payment" component={PaymentScreen} options={{ headerTransparent: true, headerShown: true, title: "Payment" }} />
    <Stack.Screen name="BookingConfirmation" component={BookingConfirmationScreen} options={{ headerShown: false }} />
  </Stack.Navigator>
);

// ── Plan stack (new Via Travels feature) ────────────────────────────────────
const PlanStackNavigator = () => (
  <Stack.Navigator initialRouteName={PLAN_MAIN}>
    <Stack.Screen name={PLAN_MAIN} component={ItineraryScreen} options={{ headerShown: false }} />
    <Stack.Screen name="Attractions" component={AttractionsScreen} options={{ headerShown: false }} />
    <Stack.Screen name="Saved Itineraries" component={SavedItinerariesScreen} options={{ headerShown: false }} />
  </Stack.Navigator>
);

// ── Profile stack ────────────────────────────────────────────────────────────
const ProfileNavigator = () => (
  <Stack.Navigator>
    <Stack.Screen name={PROFILE} component={ProfileScreen} options={{ headerTransparent: true, headerShown: true, title: "" }} />
    <Stack.Screen name="Personal Info" component={PersonalDetails} options={{ headerTransparent: true, headerShown: true, title: "" }} />
    <Stack.Screen name="HelpSupport" component={HelpSupportScreen} options={{ headerTransparent: true, headerShown: true, title: "" }} />
    <Stack.Screen name="Privacy" component={PrivacyScreen} options={{ headerTransparent: true, headerShown: true, title: "" }} />
    <Stack.Screen name="ReportProblem" component={ReportProblemScreen} options={{ headerTransparent: true, headerShown: true, title: "" }} />
    <Stack.Screen name="Security" component={SecurityScreen} options={{ headerTransparent: true, headerShown: true, title: "" }} />
    <Stack.Screen name="TermsCondition" component={TermsConditionsScreen} options={{ headerTransparent: true, headerShown: true, title: "" }} />
  </Stack.Navigator>
);

// ── Root ─────────────────────────────────────────────────────────────────────
export default function AppNavigation() {
  const { isAuthenticated, isLoading } = useContext(AuthContext);

  return (
    <NavigationContainer>
      {isLoading ? (
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#fff" }}>
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
