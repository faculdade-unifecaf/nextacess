import React, { useState, useCallback } from 'react';
import { StyleSheet } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ExpoSplashScreen from 'expo-splash-screen';
import { AuthProvider } from './src/context/AuthContext';
import { NotificationsProvider } from './src/context/NotificationsContext';
import AppNavigator from './src/navigation/AppNavigator';
import SplashScreen from './src/screens/SplashScreen';
import OnboardingScreen from './src/screens/OnboardingScreen';

ExpoSplashScreen.preventAutoHideAsync();

const ONBOARDING_KEY = '@nextaccess:onboarding_done';

export default function App() {
  const [showSplash, setShowSplash]         = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(false);

  const onLayoutRoot = useCallback(async () => {
    await ExpoSplashScreen.hideAsync();
  }, []);

  const onSplashDone = useCallback(async () => {
    const done = await AsyncStorage.getItem(ONBOARDING_KEY);
    setShowOnboarding(done === null);
    setShowSplash(false);
  }, []);

  const onOnboardingDone = useCallback(async () => {
    await AsyncStorage.setItem(ONBOARDING_KEY, 'true');
    setShowOnboarding(false);
  }, []);

  return (
    <GestureHandlerRootView style={styles.root} onLayout={onLayoutRoot}>
      <SafeAreaProvider>
        <AuthProvider>
          <NotificationsProvider>
            <AppNavigator />
          </NotificationsProvider>
          {showOnboarding && <OnboardingScreen onDone={onOnboardingDone} />}
          {showSplash && <SplashScreen onDone={onSplashDone} />}
        </AuthProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({ root: { flex: 1 } });
