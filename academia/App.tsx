import React, { useState, useCallback } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import * as ExpoSplashScreen from 'expo-splash-screen';
import { AuthProvider } from './src/context/AuthContext';
import AppNavigator from './src/navigation/AppNavigator';
import SplashScreen from './src/screens/SplashScreen';

// Mantém o splash nativo visível até o JS estar pronto
ExpoSplashScreen.preventAutoHideAsync();

export default function App() {
  const [showSplash, setShowSplash] = useState(true);

  // Esconde o splash nativo assim que o componente monta (JS carregado)
  const onLayoutRoot = useCallback(async () => {
    await ExpoSplashScreen.hideAsync();
  }, []);

  return (
    <SafeAreaProvider onLayout={onLayoutRoot}>
      <AuthProvider>
        <AppNavigator />
        {showSplash && <SplashScreen onDone={() => setShowSplash(false)} />}
      </AuthProvider>
    </SafeAreaProvider>
  );
}
