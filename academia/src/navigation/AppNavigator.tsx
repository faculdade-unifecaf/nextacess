import React, { useContext } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Home, Dumbbell, Bot, User, Shield, Utensils } from 'lucide-react-native';

import LoginScreen from '../screens/LoginScreen';
import HomeScreen from '../screens/HomeScreen';
import WorkoutsScreen from '../screens/WorkoutsScreen';
import AICoachScreen from '../screens/AICoachScreen';
import NutritionScreen from '../screens/NutritionScreen';
import ProfileScreen from '../screens/ProfileScreen';
import AdminScreen from '../screens/AdminScreen';
import { GlobalContext } from '../context/GlobalContext';

export type RootStackParamList = {
    Login: undefined;
    MainTabs: undefined;
    AdminPanel: undefined;
};

export type MainTabParamList = {
    Home: undefined;
    Workouts: undefined;
    AICoach: undefined;
    Nutrition: undefined;
    Profile: undefined;
};

const Tab = createBottomTabNavigator<MainTabParamList>();
const Stack = createNativeStackNavigator<RootStackParamList>();

const MainTabs = () => (
    <Tab.Navigator
        screenOptions={{
            headerShown: false,
            tabBarStyle: {
                backgroundColor: '#000000',
                borderTopColor: '#1a1a1a',
                borderTopWidth: 1,
                height: 62,
                paddingBottom: 8,
                paddingTop: 4,
            },
            tabBarActiveTintColor: '#ef4444',
            tabBarInactiveTintColor: '#52525b',
            tabBarLabelStyle: { fontSize: 9, fontWeight: '600' },
        }}
    >
        <Tab.Screen name="Home" component={HomeScreen} options={{
            tabBarLabel: 'Início', tabBarIcon: ({ color }) => <Home color={color} size={20} />,
        }} />
        <Tab.Screen name="Workouts" component={WorkoutsScreen} options={{
            tabBarLabel: 'Treinos', tabBarIcon: ({ color }) => <Dumbbell color={color} size={20} />,
        }} />
        <Tab.Screen name="AICoach" component={AICoachScreen} options={{
            tabBarLabel: 'Coach IA', tabBarIcon: ({ color }) => <Bot color={color} size={20} />,
        }} />
        <Tab.Screen name="Nutrition" component={NutritionScreen} options={{
            tabBarLabel: 'Nutrição', tabBarIcon: ({ color }) => <Utensils color={color} size={20} />,
        }} />
        <Tab.Screen name="Profile" component={ProfileScreen} options={{
            tabBarLabel: 'Perfil', tabBarIcon: ({ color }) => <User color={color} size={20} />,
        }} />
    </Tab.Navigator>
);

export default function AppNavigator() {
    const { isAuthenticated, user } = useContext(GlobalContext);

    return (
        <NavigationContainer>
            <Stack.Navigator screenOptions={{ headerShown: false }}>
                {!isAuthenticated ? (
                    <Stack.Screen name="Login" component={LoginScreen} />
                ) : user?.role === 'admin' ? (
                    <Stack.Screen name="AdminPanel" component={AdminScreen} />
                ) : (
                    <Stack.Screen name="MainTabs" component={MainTabs} />
                )}
            </Stack.Navigator>
        </NavigationContainer>
    );
}
