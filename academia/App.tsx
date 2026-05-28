import React, { useState, useCallback, useEffect } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ExpoSplashScreen from 'expo-splash-screen';
import { AuthProvider } from './src/context/AuthContext';
import AppNavigator from './src/navigation/AppNavigator';
import SplashScreen from './src/screens/SplashScreen';
import OnboardingScreen from './src/screens/OnboardingScreen';

// Mantém o splash nativo visível até o JS estar pronto
ExpoSplashScreen.preventAutoHideAsync();

const ONBOARDING_KEY = '@nextaccess:onboarding_done';

export default function App() {
  const [showSplash, setShowSplash]         = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(false);

  // Esconde o splash nativo assim que o componente monta (JS carregado)
  const onLayoutRoot = useCallback(async () => {
    await ExpoSplashScreen.hideAsync();
  }, []);

  // Após a splash, verifica se é a primeira abertura
  const onSplashDone = useCallback(async () => {
    const done = await AsyncStorage.getItem(ONBOARDING_KEY);
    setShowOnboarding(done === null); // null = nunca viu o onboarding
    setShowSplash(false);
  }, []);

  // Marca onboarding como visto e libera o app
  const onOnboardingDone = useCallback(async () => {
    await AsyncStorage.setItem(ONBOARDING_KEY, 'true');
    setShowOnboarding(false);
  }, []);

  return (
    <SafeAreaProvider onLayout={onLayoutRoot}>
      <AuthProvider>
        <AppNavigator />
        {showOnboarding && <OnboardingScreen onDone={onOnboardingDone} />}
        {showSplash && <SplashScreen onDone={onSplashDone} />}
      </AuthProvider>
    </SafeAreaProvider>
  );
}
