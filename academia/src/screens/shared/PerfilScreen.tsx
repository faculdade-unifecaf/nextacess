import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { User, LogOut, Shield, Briefcase, UserCheck } from 'lucide-react-native';
import { useAuth } from '../../context/AuthContext';
import { C } from '../../../constants/theme';

const ROLE_LABEL: Record<string, { label: string; color: string; icon: any }> = {
  admin:       { label: 'Administrador', color: C.warning, icon: Shield    },
  funcionario: { label: 'Funcionário',   color: C.blue,    icon: Briefcase },
  visitante:   { label: 'Visitante',     color: C.success, icon: UserCheck },
};

export default function PerfilScreen() {
  const { user, logout } = useAuth();
  if (!user) return null;

  const roleInfo = ROLE_LABEL[user.role] ?? ROLE_LABEL['funcionario'];
  const RoleIcon = roleInfo.icon;
  const initial  = user.nome.charAt(0).toUpperCase();

  const confirmLogout = () =>
    Alert.alert('Sair', 'Deseja sair da conta?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Sair', style: 'destructive', onPress: logout },
    ]);

  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      <View style={s.header}>
        <User color={C.blue} size={20} />
        <Text style={s.title}>Perfil</Text>
      </View>

      <View style={s.content}>
        <View style={s.avatarWrap}>
          <View style={[s.avatar, { backgroundColor: user.avatar_color || C.blue }]}>
            <Text style={s.avatarText}>{initial}</Text>
          </View>
          <Text style={s.name}>{user.nome}</Text>
          <Text style={s.email}>{user.email}</Text>
          <View style={[s.roleBadge, { backgroundColor: roleInfo.color + '18', borderColor: roleInfo.color + '40' }]}>
            <RoleIcon color={roleInfo.color} size={13} />
            <Text style={[s.roleText, { color: roleInfo.color }]}>{roleInfo.label}</Text>
          </View>
        </View>

        <View style={s.infoCard}>
          {user.role === 'visitante' && (
            <Row label="Status" value={user.visitanteStatus ?? '—'} />
          )}
          <Row label="Tipo de acesso" value={roleInfo.label} />
        </View>

        <TouchableOpacity style={s.logoutBtn} onPress={confirmLogout} activeOpacity={0.8}>
          <LogOut color={C.danger} size={18} />
          <Text style={s.logoutText}>Sair da conta</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <View style={s.row}>
      <Text style={s.rowLabel}>{label}</Text>
      <Text style={s.rowValue}>{value}</Text>
    </View>
  );
}

const s = StyleSheet.create({
  safe:       { flex: 1, backgroundColor: C.bg },
  header:     { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 20, paddingBottom: 12 },
  title:      { color: C.text, fontSize: 22, fontWeight: '800' },
  content:    { flex: 1, padding: 20, gap: 16 },
  avatarWrap: { alignItems: 'center', gap: 8, paddingVertical: 12 },
  avatar:     { width: 76, height: 76, borderRadius: 24, alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: '#fff', fontSize: 32, fontWeight: '800' },
  name:       { color: C.text, fontSize: 20, fontWeight: '700' },
  email:      { color: C.muted, fontSize: 14 },
  roleBadge:  { flexDirection: 'row', alignItems: 'center', gap: 6, borderWidth: 1, borderRadius: 20, paddingHorizontal: 12, paddingVertical: 5, marginTop: 4 },
  roleText:   { fontWeight: '700', fontSize: 13 },
  infoCard:   { backgroundColor: C.surface, borderRadius: 14, borderWidth: 1, borderColor: C.border, overflow: 'hidden' },
  row:        { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: C.border },
  rowLabel:   { color: C.muted, fontSize: 14 },
  rowValue:   { color: C.text, fontSize: 14, fontWeight: '600' },
  logoutBtn:  { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, backgroundColor: 'rgba(239,68,68,0.1)', borderRadius: 14, padding: 16, borderWidth: 1, borderColor: 'rgba(239,68,68,0.2)' },
  logoutText: { color: C.danger, fontWeight: '700', fontSize: 15 },
});
