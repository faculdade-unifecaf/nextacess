import React from 'react';
import { GlobalProvider } from './src/context/GlobalContext';
import AppNavigator from './src/navigation/AppNavigator';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ModalProvider } from './src/components/CustomModal';

export default function App() {
    return (
        <SafeAreaProvider>
            <GlobalProvider>
                <ModalProvider>
                    <AppNavigator />
                </ModalProvider>
            </GlobalProvider>
        </SafeAreaProvider>
    );
}
