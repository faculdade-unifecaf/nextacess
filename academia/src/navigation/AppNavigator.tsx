import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { QrCode, UserPlus, Bell, MessageSquare, User, LogOut, Lock, ParkingCircle } from 'lucide-react-native';
import type { DrawerContentComponentProps } from '@react-navigation/drawer';

import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationsContext';
import { C } from '../../constants/theme';

import LoginScreen           from '../screens/LoginScreen';
import AdminHomeScreen       from '../screens/admin/HomeScreen';
import AdminVisitantesScreen from '../screens/admin/VisitantesScreen';
import AdminChatScreen       from '../screens/admin/ChatScreen';
import FuncHomeScreen        from '../screens/funcionario/HomeScreen';
import VisitanteHomeScreen   from '../screens/visitante/HomeScreen';
import AvisosScreen          from '../screens/shared/AvisosScreen';
import PerfilScreen          from '../screens/shared/PerfilScreen';
import EstacionamentoScreen  from '../screens/shared/EstacionamentoScreen';

const Stack   = createNativeStackNavigator();
const Tab     = createBottomTabNavigator();
const Drawer  = createDrawerNavigator();

/* ─── Drawer: conteúdo customizado ─── */

const DRAWER_ITEMS = [
  { name: 'Acesso',          label: 'Acesso',          Icon: QrCode          },
  { name: 'Visitantes',      label: 'Visitantes',      Icon: UserPlus        },
  { name: 'Avisos',          label: 'Avisos',          Icon: Bell            },
  { name: 'Chat',            label: 'Chat',            Icon: MessageSquare   },
  { name: 'Estacionamento',  label: 'Estacionamento',  Icon: ParkingCircle   },
  { name: 'Perfil',          label: 'Perfil',          Icon: User            },
];

function AdminDrawerContent({ navigation, state }: DrawerContentComponentProps) {
  const { user, logout } = useAuth();
  const { visitantesAguardando, chatNaoLido, avisosNaoLido } = useNotifications();
  const activeRoute = state.routes[state.index]?.name;

  const confirmLogout = () => {
    navigation.closeDrawer();
    Alert.alert('Sair', 'Deseja sair da conta?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Sair',     style: 'destructive', onPress: logout },
    ]);
  };

  const initial = user?.nome?.charAt(0).toUpperCase() ?? '?';

  const getBadge = (name: string): number | boolean | null => {
    if (name === 'Visitantes' && visitantesAguardando > 0) return visitantesAguardando;
    if (name === 'Chat'       && chatNaoLido)               return true;
    if (name === 'Avisos'     && avisosNaoLido)             return true;
    return null;
  };

  return (
    <SafeAreaView style={d.root} edges={['top', 'bottom']}>
      {/* Usuário */}
      <View style={d.userHeader}>
        <View style={[d.avatar, { backgroundColor: user?.avatar_color || C.blue }]}>
          <Text style={d.avatarText}>{initial}</Text>
        </View>
        <View style={d.userInfo}>
          <Text style={d.userName} numberOfLines={1}>{user?.nome ?? ''}</Text>
          <Text style={d.userEmail} numberOfLines={1}>{user?.email ?? ''}</Text>
          <View style={d.brandTag}>
            <Lock size={10} color={C.muted} strokeWidth={2} />
            <Text style={d.brandTagText}>NEXTACCESS · Admin</Text>
          </View>
        </View>
      </View>

      <View style={d.separator} />

      {/* Itens de navegação */}
      <View style={d.nav}>
        {DRAWER_ITEMS.map(({ name, label, Icon }) => {
          const active = activeRoute === name;
          const badge  = getBadge(name);
          return (
            <TouchableOpacity
              key={name}
              style={[d.item, active && d.itemActive]}
              onPress={() => navigation.navigate(name)}
              activeOpacity={0.75}
            >
              <Icon size={20} color={active ? C.blue : C.muted} strokeWidth={active ? 2.5 : 1.8} />
              <Text style={[d.itemLabel, active && d.itemLabelActive]}>{label}</Text>
              {badge !== null && (
                <View style={[d.badge, typeof badge === 'number' && d.badgeCount]}>
                  {typeof badge === 'number'
                    ? <Text style={d.badgeText}>{badge}</Text>
                    : null}
                </View>
              )}
              {active && <View style={d.activeBar} />}
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Sair da conta */}
      <View style={{ flex: 1 }} />
      <View style={d.separator} />
      <TouchableOpacity style={d.logoutBtn} onPress={confirmLogout} activeOpacity={0.8}>
        <LogOut size={18} color={C.danger} />
        <Text style={d.logoutText}>Sair da conta</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

/* ─── Admin Drawer Navigator ─── */

function AdminDrawer() {
  return (
    <Drawer.Navigator
      drawerPosition="right"
      screenOptions={{
        headerShown: false,
        drawerType: 'front',
        drawerStyle: { backgroundColor: C.surface, width: 280 },
        overlayColor: 'rgba(0,0,0,0.6)',
        swipeEdgeWidth: 60,
        swipeEnabled: true,
      }}
      drawerContent={(props) => <AdminDrawerContent {...props} />}
    >
      <Drawer.Screen name="Acesso"         component={AdminHomeScreen}       />
      <Drawer.Screen name="Visitantes"   component={AdminVisitantesScreen} />
      <Drawer.Screen name="Avisos"       component={AvisosScreen}          />
      <Drawer.Screen name="Chat"         component={AdminChatScreen}       />
      <Drawer.Screen name="Estacionamento" component={EstacionamentoScreen} />
      <Drawer.Screen name="Perfil"       component={PerfilScreen}          />
    </Drawer.Navigator>
  );
}

/* ─── Funcionário: tab bar ─── */

const TAB_OPTS = {
  headerShown: false,
  tabBarStyle: { backgroundColor: C.surface, borderTopColor: C.border, borderTopWidth: 1, height: 64, paddingBottom: 10, paddingTop: 6 },
  tabBarActiveTintColor:   C.blue,
  tabBarInactiveTintColor: C.muted,
  tabBarLabelStyle: { fontSize: 10, fontWeight: '600' as const },
};

function FuncTabs() {
  return (
    <Tab.Navigator screenOptions={TAB_OPTS}>
      <Tab.Screen name="Acesso"         component={FuncHomeScreen}       options={{ tabBarIcon: ({ color }) => <QrCode         color={color} size={22} /> }} />
      <Tab.Screen name="Avisos"         component={AvisosScreen}         options={{ tabBarIcon: ({ color }) => <Bell           color={color} size={22} /> }} />
      <Tab.Screen name="Estacionamento" component={EstacionamentoScreen} options={{ tabBarIcon: ({ color }) => <ParkingCircle  color={color} size={22} />, tabBarLabel: 'Parking' }} />
      <Tab.Screen name="Perfil"         component={PerfilScreen}         options={{ tabBarIcon: ({ color }) => <User           color={color} size={22} /> }} />
    </Tab.Navigator>
  );
}

function VisitanteTabs() {
  return (
    <Tab.Navigator screenOptions={TAB_OPTS}>
      <Tab.Screen name="Acesso"         component={VisitanteHomeScreen}  options={{ tabBarIcon: ({ color }) => <QrCode        color={color} size={22} /> }} />
      <Tab.Screen name="Estacionamento" component={EstacionamentoScreen} options={{ tabBarIcon: ({ color }) => <ParkingCircle color={color} size={22} />, tabBarLabel: 'Parking' }} />
      <Tab.Screen name="Perfil"         component={PerfilScreen}         options={{ tabBarIcon: ({ color }) => <User          color={color} size={22} /> }} />
    </Tab.Navigator>
  );
}

/* ─── Root ─── */

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
          <Stack.Screen name="Login"         component={LoginScreen}    />
        ) : user.role === 'admin' ? (
          <Stack.Screen name="AdminDrawer"   component={AdminDrawer}    />
        ) : user.role === 'funcionario' ? (
          <Stack.Screen name="FuncTabs"      component={FuncTabs}       />
        ) : (
          <Stack.Screen name="VisitanteTabs" component={VisitanteTabs}  />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

/* ─── Styles do drawer ─── */

const d = StyleSheet.create({
  root:           { flex: 1, backgroundColor: C.surface },
  userHeader:     { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 18, paddingTop: 18, paddingBottom: 14 },
  avatar:         { width: 46, height: 46, borderRadius: 14, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  avatarText:     { color: '#fff', fontSize: 20, fontWeight: '800' },
  userInfo:       { flex: 1 },
  userName:       { color: C.text, fontSize: 14, fontWeight: '700' },
  userEmail:      { color: C.muted, fontSize: 11, marginTop: 1 },
  brandTag:       { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 },
  brandTagText:   { color: C.muted, fontSize: 9, fontWeight: '600', letterSpacing: 1 },
  separator:      { height: 1, backgroundColor: C.border, marginHorizontal: 16, marginVertical: 6 },
  nav:            { paddingTop: 8, paddingHorizontal: 10 },
  item:           { flexDirection: 'row', alignItems: 'center', gap: 14, paddingVertical: 13, paddingHorizontal: 14, borderRadius: 12, marginBottom: 2, position: 'relative', overflow: 'hidden' },
  itemActive:     { backgroundColor: 'rgba(76,158,255,0.1)' },
  itemLabel:      { color: C.muted, fontSize: 15, fontWeight: '600', flex: 1 },
  itemLabelActive:{ color: C.text },
  activeBar:      { position: 'absolute', right: 0, top: '20%', bottom: '20%', width: 3, backgroundColor: C.blue, borderRadius: 2 },
  badge:          { width: 8, height: 8, borderRadius: 4, backgroundColor: C.danger, marginRight: 4 },
  badgeCount:     { width: 'auto', height: 18, borderRadius: 9, paddingHorizontal: 5, alignItems: 'center', justifyContent: 'center' },
  badgeText:      { color: '#fff', fontSize: 10, fontWeight: '800' },
  logoutBtn:      { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 24, paddingVertical: 18 },
  logoutText:     { color: C.danger, fontSize: 14, fontWeight: '700' },
});
