import AppNavigation from "./Navigation/AppNavigation"
import React, { useContext, useEffect } from "react";
import UserContexProvider from './context/AuthContextProvider';
import AuthContext from './context/AuthContext';
import { CurrencyProvider } from './context/CurrencyContext';
import { GestureHandlerRootView } from "react-native-gesture-handler"
import * as SplashScreen from "expo-splash-screen";

SplashScreen.preventAutoHideAsync();

const AppContent = () => {
  const { isLoading } = useContext(AuthContext);

  useEffect(() => {
    if (!isLoading) {
      SplashScreen.hideAsync();
    }
  }, [isLoading]);

  return (
    <CurrencyProvider>
      <AppNavigation />
    </CurrencyProvider>
  );
};

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <UserContexProvider>
        <AppContent />
      </UserContexProvider>
    </GestureHandlerRootView>
  );
}
