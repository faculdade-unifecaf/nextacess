import React from 'react';
import { View, ActivityIndicator } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { QrCode, UserPlus, Bell, MessageSquare, User } from 'lucide-react-native';

import { useAuth } from '../context/AuthContext';
import { C } from '../../constants/theme';

import LoginScreen           from '../screens/LoginScreen';
import AdminHomeScreen       from '../screens/admin/HomeScreen';
import AdminVisitantesScreen from '../screens/admin/VisitantesScreen';
import AdminChatScreen       from '../screens/admin/ChatScreen';
import FuncHomeScreen        from '../screens/funcionario/HomeScreen';
import VisitanteHomeScreen   from '../screens/visitante/HomeScreen';
import AvisosScreen          from '../screens/shared/AvisosScreen';
import PerfilScreen          from '../screens/shared/PerfilScreen';

const Stack = createNativeStackNavigator();
const Tab   = createBottomTabNavigator();

const TAB_OPTS = {
  headerShown: false,
  tabBarStyle: { backgroundColor: C.surface, borderTopColor: C.border, borderTopWidth: 1, height: 64, paddingBottom: 10, paddingTop: 6 },
  tabBarActiveTintColor:   C.blue,
  tabBarInactiveTintColor: C.muted,
  tabBarLabelStyle: { fontSize: 10, fontWeight: '600' as const },
};

function AdminTabs() {
  return (
    <Tab.Navigator screenOptions={TAB_OPTS}>
      <Tab.Screen name="Acesso"     component={AdminHomeScreen}       options={{ tabBarLabel: 'Acesso',     tabBarIcon: ({ color }) => <QrCode      color={color} size={22} /> }} />
      <Tab.Screen name="Visitantes" component={AdminVisitantesScreen} options={{ tabBarLabel: 'Visitantes', tabBarIcon: ({ color }) => <UserPlus    color={color} size={22} /> }} />
      <Tab.Screen name="Avisos"     component={AvisosScreen}          options={{ tabBarLabel: 'Avisos',     tabBarIcon: ({ color }) => <Bell        color={color} size={22} /> }} />
      <Tab.Screen name="Chat"       component={AdminChatScreen}       options={{ tabBarLabel: 'Chat',       tabBarIcon: ({ color }) => <MessageSquare color={color} size={22} /> }} />
      <Tab.Screen name="Perfil"     component={PerfilScreen}          options={{ tabBarLabel: 'Perfil',     tabBarIcon: ({ color }) => <User        color={color} size={22} /> }} />
    </Tab.Navigator>
  );
}

function FuncTabs() {
  return (
    <Tab.Navigator screenOptions={TAB_OPTS}>
      <Tab.Screen name="Acesso" component={FuncHomeScreen} options={{ tabBarLabel: 'Acesso', tabBarIcon: ({ color }) => <QrCode color={color} size={22} /> }} />
      <Tab.Screen name="Avisos" component={AvisosScreen}   options={{ tabBarLabel: 'Avisos', tabBarIcon: ({ color }) => <Bell   color={color} size={22} /> }} />
      <Tab.Screen name="Perfil" component={PerfilScreen}   options={{ tabBarLabel: 'Perfil', tabBarIcon: ({ color }) => <User   color={color} size={22} /> }} />
    </Tab.Navigator>
  );
}

function VisitanteTabs() {
  return (
    <Tab.Navigator screenOptions={TAB_OPTS}>
      <Tab.Screen name="Acesso" component={VisitanteHomeScreen} options={{ tabBarLabel: 'Acesso', tabBarIcon: ({ color }) => <QrCode color={color} size={22} /> }} />
      <Tab.Screen name="Perfil" component={PerfilScreen}        options={{ tabBarLabel: 'Perfil', tabBarIcon: ({ color }) => <User   color={color} size={22} /> }} />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  const { user, isLoading } = useAuth();

  if (isLoading) return (
    <View style={{ flex: 1, backgroundColor: C.bg, alignItems: 'center', justifyContent: 'center' }}>
      <ActivityIndicator color={C.blue} size="large" />
    </View>
  );

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!user ? (
          <Stack.Screen name="Login" component={LoginScreen} />
        ) : user.role === 'admin' ? (
          <Stack.Screen name="AdminTabs" component={AdminTabs} />
        ) : user.role === 'funcionario' ? (
          <Stack.Screen name="FuncTabs" component={FuncTabs} />
        ) : (
          <Stack.Screen name="VisitanteTabs" component={VisitanteTabs} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
